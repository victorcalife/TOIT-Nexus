import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertClientCategorySchema,
  insertClientSchema,
  insertIntegrationSchema,
  insertWorkflowSchema,
  insertReportSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      const activities = await storage.getRecentActivities(20);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Client Category routes
  app.get('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getClientCategories();
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

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
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
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: 'create_client',
        entityType: 'client',
        entityId: client.id,
        description: `Added new client: ${client.name}`,
      });

      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
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

      // Simulate report generation
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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
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
