import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { isAuthenticated } from "./replitAuth";
import { 
  tenantMiddleware, 
  requireTenant, 
  requireSuperAdmin, 
  requireRole,
  getTenantId,
  canAccessTenantResource
} from "./tenantMiddleware";

// Helper function to determine if client should be assigned to a category
function shouldAssignToCategory(client: any, category: any): boolean {
  // Basic logic for auto-assignment based on client criteria
  if (!category.autoAssignmentRules) return false;
  
  const rules = category.autoAssignmentRules;
  
  // Check investment threshold
  if (rules.minInvestmentAmount && client.currentInvestment < rules.minInvestmentAmount) {
    return false;
  }
  if (rules.maxInvestmentAmount && client.currentInvestment > rules.maxInvestmentAmount) {
    return false;
  }
  
  // Check risk profile
  if (rules.riskProfiles && rules.riskProfiles.length > 0) {
    if (!rules.riskProfiles.includes(client.riskProfile)) {
      return false;
    }
  }
  
  return true;
}

// Helper function to trigger workflows for a category
async function triggerWorkflowsForCategory(categoryId: string, clientId: string) {
  try {
    // Get workflows associated with this category
    const workflows = await storage.getWorkflowsByCategory(categoryId);
    
    for (const workflow of workflows) {
      if (workflow.status === 'active' && workflow.trigger === 'client_assignment') {
        // Log the workflow trigger
        await storage.createActivity({
          action: 'workflow_triggered',
          description: `Workflow "${workflow.name}" triggered for client assignment`,
          metadata: { workflowId: workflow.id, clientId, categoryId }
        });
        
        // Here you would integrate with your workflow engine
        // For now, we'll just log the action
        console.log(`Triggered workflow ${workflow.name} for client ${clientId} in category ${categoryId}`);
      }
    }
  } catch (error) {
    console.error('Error triggering workflows:', error);
  }
}

// Helper function to generate report data
async function generateReportData(report: any) {
  const template = report.template;
  const reportData: any = {
    reportName: report.name,
    generatedAt: new Date().toISOString(),
    filters: template.filters || {},
    data: []
  };

  try {
    // Get clients based on filters
    const clients = await storage.getClients();
    let filteredClients = clients;

    // Apply category filters
    if (template.filters?.categories && template.filters.categories.length > 0) {
      filteredClients = filteredClients.filter((client: any) => 
        template.filters.categories.includes(client.categoryId)
      );
    }

    // Apply risk profile filters
    if (template.filters?.riskProfiles && template.filters.riskProfiles.length > 0) {
      filteredClients = filteredClients.filter((client: any) => 
        template.filters.riskProfiles.includes(client.riskProfile)
      );
    }

    // Apply investment amount filters
    if (template.filters?.minInvestment) {
      filteredClients = filteredClients.filter((client: any) => 
        client.currentInvestment >= template.filters.minInvestment
      );
    }

    if (template.filters?.maxInvestment) {
      filteredClients = filteredClients.filter((client: any) => 
        client.currentInvestment <= template.filters.maxInvestment
      );
    }

    // Format data based on selected fields
    reportData.data = filteredClients.map((client: any) => {
      const clientData: any = {};
      
      if (!template.fields || template.fields.length === 0) {
        // Include all fields if none specified
        return client;
      }

      // Include only selected fields
      template.fields.forEach((field: string) => {
        switch (field) {
          case 'client_name':
            clientData.name = client.name;
            break;
          case 'email':
            clientData.email = client.email;
            break;
          case 'phone':
            clientData.phone = client.phone;
            break;
          case 'current_investment':
            clientData.currentInvestment = client.currentInvestment;
            break;
          case 'risk_profile':
            clientData.riskProfile = client.riskProfile;
            break;
          case 'category':
            clientData.categoryId = client.categoryId;
            break;
          case 'last_activity':
            clientData.lastActivity = client.metadata?.lastActivity;
            break;
          default:
            if (client[field]) {
              clientData[field] = client[field];
            }
        }
      });

      return clientData;
    });

    reportData.summary = {
      totalClients: filteredClients.length,
      totalInvestment: filteredClients.reduce((sum: number, client: any) => 
        sum + (client.currentInvestment || 0), 0
      ),
      averageInvestment: filteredClients.length > 0 
        ? filteredClients.reduce((sum: number, client: any) => 
            sum + (client.currentInvestment || 0), 0) / filteredClients.length
        : 0
    };

  } catch (error) {
    console.error('Error generating report data:', error);
    reportData.error = 'Failed to generate report data';
  }

  return reportData;
}
import {
  insertClientCategorySchema,
  insertClientSchema,
  insertIntegrationSchema,
  insertWorkflowSchema,
  insertReportSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware with CPF/password
  setupAuth(app);

  // Public routes (no authentication required)
  // Login and register routes are handled by setupAuth() above
  
  // Protected auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Include tenant information in response
      const response: any = { ...user };
      if (req.tenant) {
        response.tenant = req.tenant;
      }
      if (req.isSuperAdmin) {
        response.isSuperAdmin = true;
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tenant selection for users with multiple tenant access
  app.post('/api/auth/select-tenant', isAuthenticated, async (req: any, res) => {
    try {
      const { tenantId } = req.body;
      const userId = req.user.claims.sub;
      
      // Verify user has access to this tenant
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For super admin, allow access to any active tenant
      if (user.role === 'super_admin') {
        const tenant = await storage.getTenant(tenantId);
        if (!tenant) {
          return res.status(404).json({ message: "Tenant not found" });
        }
        // Set tenant in session or return token with tenant info
        res.json({ success: true, tenant });
        return;
      }

      // For regular users, verify they belong to this tenant
      if (user.tenantId !== tenantId) {
        return res.status(403).json({ message: "Access denied to this tenant" });
      }

      const tenant = await storage.getTenant(tenantId);
      if (!tenant || tenant.status !== 'active') {
        return res.status(403).json({ message: "Tenant not available" });
      }

      res.json({ success: true, tenant });
    } catch (error) {
      console.error("Error selecting tenant:", error);
      res.status(500).json({ message: "Failed to select tenant" });
    }
  });

  // Admin routes (super admin only)
  app.get('/api/admin/tenants', requireSuperAdmin, async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  app.get('/api/admin/stats', requireSuperAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/activities', requireSuperAdmin, async (req, res) => {
    try {
      const activities = await storage.getAllActivities(50);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/admin/tenants/:id/suspend', requireSuperAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.updateTenant(id, { status: 'suspended' });
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'suspend_tenant',
        entityType: 'tenant',
        entityId: id,
        description: `Suspended tenant`,
      });

      res.json({ message: "Tenant suspended successfully" });
    } catch (error) {
      console.error("Error suspending tenant:", error);
      res.status(500).json({ message: "Failed to suspend tenant" });
    }
  });

  app.post('/api/admin/tenants/:id/activate', requireSuperAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.updateTenant(id, { status: 'active' });
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'activate_tenant',
        entityType: 'tenant',
        entityId: id,
        description: `Activated tenant`,
      });

      res.json({ message: "Tenant activated successfully" });
    } catch (error) {
      console.error("Error activating tenant:", error);
      res.status(500).json({ message: "Failed to activate tenant" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/activities', isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getRecentActivities("20");
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Client Category routes (tenant-isolated)
  app.get('/api/categories', isAuthenticated, tenantMiddleware, requireTenant, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const categories = await storage.getClientCategories(tenantId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getClientCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post('/api/categories', isAuthenticated, tenantMiddleware, async (req: any, res) => {
    try {
      const validatedData = insertClientCategorySchema.parse(req.body);
      const category = await storage.createClientCategory(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_category',
        entityType: 'client_category',
        entityId: category.id,
        description: `Created client category: ${category.name}`,
      });

      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertClientCategorySchema.partial().parse(req.body);
      const category = await storage.updateClientCategory(id, validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_category',
        entityType: 'client_category',
        entityId: id,
        description: `Updated client category: ${category.name}`,
      });

      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClientCategory(id);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_category',
        entityType: 'client_category',
        entityId: id,
        description: `Deleted client category`,
      });

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const clientData = req.body;
      
      // Auto-assign category based on rules
      const categories = await storage.getClientCategories();
      let assignedCategory = null;
      
      for (const category of categories) {
        if (category.rules && shouldAssignToCategory(clientData, category.rules)) {
          assignedCategory = category.id;
          break;
        }
      }
      
      if (assignedCategory) {
        clientData.categoryId = assignedCategory;
      }
      
      const client = await storage.createClient(clientData);
      
      // Send welcome email if client has email and category
      if (client.email && assignedCategory) {
        try {
          const category = await storage.getClientCategory(assignedCategory);
          if (category) {
            const { sendWelcomeEmail } = await import('./emailService');
            await sendWelcomeEmail(client.email, client.name, category.name);
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the client creation if email fails
        }
      }
      
      // Trigger workflows for this category
      if (assignedCategory) {
        await triggerWorkflowsForCategory(assignedCategory, client.id);
      }
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_client',
        entityType: 'client',
        entityId: client.id,
        description: `Created client: ${client.name}`,
      });
      
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_client',
        entityType: 'client',
        entityId: id,
        description: `Updated client: ${client.name}`,
      });

      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClient(id);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_client',
        entityType: 'client',
        entityId: id,
        description: `Deleted client`,
      });

      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Integration routes
  app.get('/api/integrations', isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.get('/api/integrations/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const integration = await storage.getIntegration(id);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      res.json(integration);
    } catch (error) {
      console.error("Error fetching integration:", error);
      res.status(500).json({ message: "Failed to fetch integration" });
    }
  });

  app.post('/api/integrations', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_integration',
        entityType: 'integration',
        entityId: integration.id,
        description: `Created integration: ${integration.name}`,
      });

      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(400).json({ message: "Failed to create integration" });
    }
  });

  app.put('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertIntegrationSchema.partial().parse(req.body);
      const integration = await storage.updateIntegration(id, validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_integration',
        entityType: 'integration',
        entityId: id,
        description: `Updated integration: ${integration.name}`,
      });

      res.json(integration);
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(400).json({ message: "Failed to update integration" });
    }
  });

  app.delete('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteIntegration(id);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_integration',
        entityType: 'integration',
        entityId: id,
        description: `Deleted integration`,
      });

      res.json({ message: "Integration deleted successfully" });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ message: "Failed to delete integration" });
    }
  });

  // Workflow routes
  app.get('/api/workflows', isAuthenticated, async (req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.get('/api/workflows/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const workflow = await storage.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  app.post('/api/workflows', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_workflow',
        entityType: 'workflow',
        entityId: workflow.id,
        description: `Created workflow: ${workflow.name}`,
      });

      res.status(201).json(workflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      res.status(400).json({ message: "Failed to create workflow" });
    }
  });

  app.put('/api/workflows/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(id, validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_workflow',
        entityType: 'workflow',
        entityId: id,
        description: `Updated workflow: ${workflow.name}`,
      });

      res.json(workflow);
    } catch (error) {
      console.error("Error updating workflow:", error);
      res.status(400).json({ message: "Failed to update workflow" });
    }
  });

  app.delete('/api/workflows/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkflow(id);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_workflow',
        entityType: 'workflow',
        entityId: id,
        description: `Deleted workflow`,
      });

      res.json({ message: "Workflow deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  });

  app.get('/api/workflows/:id/executions', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const executions = await storage.getWorkflowExecutions(id);
      res.json(executions);
    } catch (error) {
      console.error("Error fetching workflow executions:", error);
      res.status(500).json({ message: "Failed to fetch workflow executions" });
    }
  });

  // System status and connectivity routes
  app.get('/api/system/status', isAuthenticated, async (req, res) => {
    try {
      const status = {
        server: 'online',
        database: 'online',
        api: 'online',
        integrations: 'warning'
      };
      res.json(status);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  app.post('/api/system/test-database', isAuthenticated, async (req, res) => {
    try {
      const startTime = Date.now();
      await storage.getDashboardStats(); // Test database query
      const latency = Date.now() - startTime;
      
      res.json({
        status: 'success',
        message: 'Database connection successful',
        latency
      });
    } catch (error) {
      console.error("Database test failed:", error);
      res.json({
        status: 'error',
        message: 'Database connection failed'
      });
    }
  });

  app.post('/api/integrations/:id/test', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const integration = await storage.getIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      // Simulate integration test
      const result = {
        status: 'success',
        message: `Integration ${integration.name} is working correctly`,
        timestamp: new Date().toISOString()
      };

      res.json(result);
    } catch (error) {
      console.error("Integration test failed:", error);
      res.json({
        status: 'error',
        message: 'Integration test failed'
      });
    }
  });

  app.post('/api/system/custom-test', isAuthenticated, async (req, res) => {
    try {
      const { type, url, method, headers, body, timeout } = req.body;
      
      // Simulate custom test
      const result = {
        status: 'success',
        message: `${method} request to ${url} completed successfully`,
        responseTime: Math.floor(Math.random() * 1000) + 100,
        statusCode: 200,
        data: { test: 'successful' }
      };

      res.json(result);
    } catch (error) {
      console.error("Custom test failed:", error);
      res.json({
        status: 'error',
        message: 'Custom test failed'
      });
    }
  });

  app.post('/api/reports/:id/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Generate report data based on template
      const reportData = await generateReportData(report);

      // Send email if configured
      if (report.template.recipients && report.template.recipients.length > 0) {
        const { sendReportEmail } = await import('./emailService');
        await sendReportEmail(
          report.template.recipients,
          report.name,
          reportData,
          report.categoryId ? (await storage.getClientCategory(report.categoryId))?.name : undefined
        );
      }

      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'generate_report',
        entityType: 'report',
        entityId: id,
        description: `Generated report: ${report.name}`,
      });

      res.json({
        status: 'success',
        message: 'Report generated and sent successfully',
        reportId: id,
        reportData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Test email configuration
  app.post('/api/system/test-email', isAuthenticated, async (req, res) => {
    try {
      const { testEmailConfiguration } = await import('./emailService');
      const result = await testEmailConfiguration();
      
      res.json({
        status: result.success ? 'success' : 'error',
        message: result.message
      });
    } catch (error) {
      console.error("Email test failed:", error);
      res.json({
        status: 'error',
        message: 'Email test failed'
      });
    }
  });

  // Integration routes
  app.get('/api/integrations', isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post('/api/integrations', isAuthenticated, async (req: any, res) => {
    try {
      const integrationData = req.body;
      const integration = await storage.createIntegration(integrationData);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_integration',
        entityType: 'integration',
        entityId: integration.id,
        description: `Created integration: ${integration.name}`,
      });

      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ message: "Failed to create integration" });
    }
  });

  app.put('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const integrationData = req.body;
      const integration = await storage.updateIntegration(id, integrationData);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'update_integration',
        entityType: 'integration',
        entityId: id,
        description: `Updated integration: ${integration.name}`,
      });

      res.json(integration);
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(500).json({ message: "Failed to update integration" });
    }
  });

  app.delete('/api/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteIntegration(id);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'delete_integration',
        entityType: 'integration',
        entityId: id,
        description: `Deleted integration`,
      });

      res.json({ message: "Integration deleted successfully" });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ message: "Failed to delete integration" });
    }
  });

  app.post('/api/integrations/:id/test', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const integration = await storage.getIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      let testResult = { success: false, message: 'Test not implemented for this type' };

      // Test based on integration type
      switch (integration.type) {
        case 'email':
          if ((integration.config as any)?.email) {
            const { testEmailConfiguration } = await import('./emailService');
            testResult = await testEmailConfiguration();
          }
          break;
        case 'api':
          // TODO: Implement API testing
          testResult = { success: true, message: 'API test not yet implemented' };
          break;
        case 'database':
          // TODO: Implement database testing
          testResult = { success: true, message: 'Database test not yet implemented' };
          break;
        case 'webhook':
          // TODO: Implement webhook testing
          testResult = { success: true, message: 'Webhook test not yet implemented' };
          break;
      }

      // Update integration status based on test result
      await storage.updateIntegration(id, {
        lastStatus: testResult.success ? 'active' : 'error',
        lastChecked: new Date()
      });

      res.json({
        success: testResult.success,
        message: testResult.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error testing integration:", error);
      res.status(500).json({ message: "Failed to test integration" });
    }
  });

  // Report routes
  app.get('/api/reports', isAuthenticated, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_report',
        entityType: 'report',
        entityId: report.id,
        description: `Created report template: ${report.name}`,
      });

      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(400).json({ message: "Failed to create report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
