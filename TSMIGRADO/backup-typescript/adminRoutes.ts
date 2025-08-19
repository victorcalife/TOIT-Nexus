import { Router } from 'express';
import { storage } from './storage';
import { requireRole, requirePermission } from './authMiddleware';
import { isAuthenticated } from './replitAuth';

const router = Router();

// All admin routes require super admin authentication
router.use(isAuthenticated);
router.use(requireRole(['super_admin']));

// System Stats and Overview
router.get('/stats', async (req, res) => {
  try {
    const stats = await storage.getSystemStats();
    res.json(stats);
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Failed to fetch system stats' });
  }
});

router.get('/health', async (req, res) => {
  try {
    const health = await storage.getSystemHealth();
    res.json(health);
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({ message: 'Failed to fetch system health' });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const logs = await storage.getSystemLogs();
    res.json(logs);
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ message: 'Failed to fetch system logs' });
  }
});

// Tenant Management (TOIT Admin)
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await storage.getAllTenants();
    res.json(tenants);
  } catch (error) {
    console.error('Get all tenants error:', error);
    res.status(500).json({ message: 'Failed to fetch tenants' });
  }
});

router.post('/tenants', async (req, res) => {
  try {
    const tenantData = req.body;
    const tenant = await storage.createTenant(tenantData);
    
    // Create default admin user for the tenant
    if (tenantData.adminEmail && tenantData.adminName) {
      const adminUser = {
        email: tenantData.adminEmail,
        firstName: tenantData.adminName.split(' ')[0] || tenantData.adminName,
        lastName: tenantData.adminName.split(' ').slice(1).join(' ') || '',
        role: 'tenant_admin',
        tenantId: tenant.id,
        isActive: true,
        cpf: 'auto-generated', // Will be updated on first login
      };
      await storage.createUser(adminUser);
    }
    
    res.status(201).json(tenant);
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ message: 'Failed to create tenant' });
  }
});

router.put('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantData = req.body;
    const tenant = await storage.updateTenant(id, tenantData);
    res.json(tenant);
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({ message: 'Failed to update tenant' });
  }
});

router.delete('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteTenant(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({ message: 'Failed to delete tenant' });
  }
});

router.post('/tenants/:id/setup-defaults', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Create default departments
    const departments = [
      { tenantId: id, name: 'Vendas', type: 'sales', description: 'Departamento de vendas e prospecção' },
      { tenantId: id, name: 'Compras', type: 'purchases', description: 'Departamento de compras e aquisições' },
      { tenantId: id, name: 'Financeiro', type: 'finance', description: 'Departamento financeiro e contábil' },
      { tenantId: id, name: 'Operações', type: 'operations', description: 'Departamento de operações e logística' },
      { tenantId: id, name: 'Recursos Humanos', type: 'hr', description: 'Departamento de recursos humanos' },
      { tenantId: id, name: 'TI', type: 'it', description: 'Departamento de tecnologia da informação' }
    ];
    
    const createdDepts = await Promise.all(
      departments.map(dept => storage.createDepartment(dept as any))
    );
    
    // Create default permissions
    const permissions = [
      { tenantId: id, name: 'Ver Clientes', resource: 'clients', action: 'read', description: 'Visualizar dados de clientes' },
      { tenantId: id, name: 'Editar Clientes', resource: 'clients', action: 'write', description: 'Editar dados de clientes' },
      { tenantId: id, name: 'Excluir Clientes', resource: 'clients', action: 'delete', description: 'Excluir clientes' },
      { tenantId: id, name: 'Ver Relatórios', resource: 'reports', action: 'read', description: 'Visualizar relatórios' },
      { tenantId: id, name: 'Criar Relatórios', resource: 'reports', action: 'write', description: 'Criar e editar relatórios' },
      { tenantId: id, name: 'Ver Workflows', resource: 'workflows', action: 'read', description: 'Visualizar workflows' },
      { tenantId: id, name: 'Gerenciar Workflows', resource: 'workflows', action: 'write', description: 'Criar e editar workflows' },
      { tenantId: id, name: 'Administrar Workflows', resource: 'workflows', action: 'admin', description: 'Administração completa de workflows' },
      { tenantId: id, name: 'Ver Integrações', resource: 'integrations', action: 'read', description: 'Visualizar integrações' },
      { tenantId: id, name: 'Configurar Integrações', resource: 'integrations', action: 'write', description: 'Configurar integrações' },
      { tenantId: id, name: 'Ver Usuários', resource: 'users', action: 'read', description: 'Visualizar usuários' },
      { tenantId: id, name: 'Gerenciar Usuários', resource: 'users', action: 'write', description: 'Gerenciar usuários e permissões' }
    ];
    
    const createdPerms = await Promise.all(
      permissions.map(perm => storage.createPermission(perm as any))
    );
    
    // Set up default role permissions
    const rolePermissions = [
      // Employee permissions (basic access)
      { tenantId: id, role: 'employee', permissionId: createdPerms.find(p => p.name === 'Ver Clientes')?.id },
      { tenantId: id, role: 'employee', permissionId: createdPerms.find(p => p.name === 'Ver Relatórios')?.id },
      { tenantId: id, role: 'employee', permissionId: createdPerms.find(p => p.name === 'Ver Workflows')?.id },
      
      // Manager permissions (department management)
      { tenantId: id, role: 'manager', permissionId: createdPerms.find(p => p.name === 'Ver Clientes')?.id },
      { tenantId: id, role: 'manager', permissionId: createdPerms.find(p => p.name === 'Editar Clientes')?.id },
      { tenantId: id, role: 'manager', permissionId: createdPerms.find(p => p.name === 'Ver Relatórios')?.id },
      { tenantId: id, role: 'manager', permissionId: createdPerms.find(p => p.name === 'Criar Relatórios')?.id },
      { tenantId: id, role: 'manager', permissionId: createdPerms.find(p => p.name === 'Ver Workflows')?.id },
      { tenantId: id, role: 'manager', permissionId: createdPerms.find(p => p.name === 'Gerenciar Workflows')?.id },
      { tenantId: id, role: 'manager', permissionId: createdPerms.find(p => p.name === 'Ver Usuários')?.id },
      
      // Tenant Admin permissions (full access within tenant)
      ...createdPerms.map(perm => ({ tenantId: id, role: 'tenant_admin', permissionId: perm.id }))
    ];
    
    await Promise.all(
      rolePermissions
        .filter(rp => rp.permissionId)
        .map(rp => storage.assignPermissionToRole(rp as any))
    );
    
    res.json({
      message: 'Default structure created successfully',
      departments: createdDepts,
      permissions: createdPerms,
      rolePermissions: rolePermissions.length
    });
  } catch (error) {
    console.error('Setup tenant defaults error:', error);
    res.status(500).json({ message: 'Failed to setup tenant defaults' });
  }
});

// Global User Management
router.get('/users', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.post('/users/:userId/assign-tenant', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tenantId, role } = req.body;
    
    const updatedUser = await storage.updateUser(userId, { tenantId, role });
    res.json(updatedUser);
  } catch (error) {
    console.error('Assign user to tenant error:', error);
    res.status(500).json({ message: 'Failed to assign user to tenant' });
  }
});

router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    const updatedUser = await storage.updateUser(userId, { role });
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await storage.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Global Department Management
router.get('/departments', async (req, res) => {
  try {
    const departments = await storage.getAllDepartments();
    res.json(departments);
  } catch (error) {
    console.error('Get all departments error:', error);
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
});

// Global Permission Management
router.get('/permissions', async (req, res) => {
  try {
    const permissions = await storage.getAllPermissions();
    res.json(permissions);
  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
});

router.post('/permissions', async (req, res) => {
  try {
    const permissionData = req.body;
    const permission = await storage.createGlobalPermission(permissionData);
    res.status(201).json(permission);
  } catch (error) {
    console.error('Create global permission error:', error);
    res.status(500).json({ message: 'Failed to create global permission' });
  }
});

// Global Workflow Management
router.get('/workflows', async (req, res) => {
  try {
    const workflows = await storage.getAllWorkflows();
    res.json(workflows);
  } catch (error) {
    console.error('Get all workflows error:', error);
    res.status(500).json({ message: 'Failed to fetch workflows' });
  }
});

router.post('/workflows/template', async (req, res) => {
  try {
    const templateData = req.body;
    const template = await storage.createWorkflowTemplate(templateData);
    res.status(201).json(template);
  } catch (error) {
    console.error('Create workflow template error:', error);
    res.status(500).json({ message: 'Failed to create workflow template' });
  }
});

// Global Integration Management
router.get('/integrations', async (req, res) => {
  try {
    const integrations = await storage.getAllIntegrations();
    res.json(integrations);
  } catch (error) {
    console.error('Get all integrations error:', error);
    res.status(500).json({ message: 'Failed to fetch integrations' });
  }
});

router.post('/integrations/global', async (req, res) => {
  try {
    const integrationData = req.body;
    const integration = await storage.createGlobalIntegration(integrationData);
    res.status(201).json(integration);
  } catch (error) {
    console.error('Create global integration error:', error);
    res.status(500).json({ message: 'Failed to create global integration' });
  }
});

// System Configuration
router.get('/config', async (req, res) => {
  try {
    const config = await storage.getSystemConfig();
    res.json(config);
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({ message: 'Failed to fetch system configuration' });
  }
});

router.put('/config', async (req, res) => {
  try {
    const configData = req.body;
    const config = await storage.updateSystemConfig(configData);
    res.json(config);
  } catch (error) {
    console.error('Update system config error:', error);
    res.status(500).json({ message: 'Failed to update system configuration' });
  }
});

// Analytics and Reporting
router.get('/analytics/tenants', async (req, res) => {
  try {
    const analytics = await storage.getTenantAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Get tenant analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch tenant analytics' });
  }
});

router.get('/analytics/usage', async (req, res) => {
  try {
    const { period = '30d', tenantId } = req.query;
    const usage = await storage.getUsageAnalytics(period as string, tenantId as string);
    res.json(usage);
  } catch (error) {
    console.error('Get usage analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch usage analytics' });
  }
});

// Billing and Subscription Management
router.get('/billing/overview', async (req, res) => {
  try {
    const billing = await storage.getBillingOverview();
    res.json(billing);
  } catch (error) {
    console.error('Get billing overview error:', error);
    res.status(500).json({ message: 'Failed to fetch billing overview' });
  }
});

router.put('/tenants/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, status } = req.body;
    
    const updatedTenant = await storage.updateTenantSubscription(id, { plan, status });
    res.json(updatedTenant);
  } catch (error) {
    console.error('Update tenant subscription error:', error);
    res.status(500).json({ message: 'Failed to update tenant subscription' });
  }
});

// Data Export and Import
router.get('/export/tenants', async (req, res) => {
  try {
    const data = await storage.exportTenantData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=tenants-export.json');
    res.json(data);
  } catch (error) {
    console.error('Export tenant data error:', error);
    res.status(500).json({ message: 'Failed to export tenant data' });
  }
});

router.post('/import/tenants', async (req, res) => {
  try {
    const importData = req.body;
    const result = await storage.importTenantData(importData);
    res.json(result);
  } catch (error) {
    console.error('Import tenant data error:', error);
    res.status(500).json({ message: 'Failed to import tenant data' });
  }
});

// Support and Maintenance
router.get('/support/tickets', async (req, res) => {
  try {
    const tickets = await storage.getSupportTickets();
    res.json(tickets);
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ message: 'Failed to fetch support tickets' });
  }
});

router.post('/maintenance/mode', async (req, res) => {
  try {
    const { enabled, message } = req.body;
    await storage.setMaintenanceMode(enabled, message);
    res.json({ success: true, enabled, message });
  } catch (error) {
    console.error('Set maintenance mode error:', error);
    res.status(500).json({ message: 'Failed to set maintenance mode' });
  }
});

export { router as adminRoutes };