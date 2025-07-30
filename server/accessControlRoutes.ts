import { Router } from 'express';
import { storage } from './storage';
import { requirePermission, requireRole, requireTenant } from './authMiddleware';
import { isAuthenticated } from './replitAuth';

const router = Router();

// All routes require authentication
router.use(isAuthenticated);

// Department Management Routes
router.get('/departments', requireTenant, async (req, res) => {
  try {
    const departments = await storage.getDepartments(req.user!.tenantId!);
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
});

router.post('/departments', requireRole(['tenant_admin']), async (req, res) => {
  try {
    const departmentData = {
      ...req.body,
      tenantId: req.user!.tenantId!
    };
    const department = await storage.createDepartment(departmentData);
    res.status(201).json(department);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Failed to create department' });
  }
});

router.put('/departments/:id', requireRole(['tenant_admin']), async (req, res) => {
  try {
    const department = await storage.updateDepartment(req.params.id, req.body);
    res.json(department);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Failed to update department' });
  }
});

router.delete('/departments/:id', requireRole(['tenant_admin']), async (req, res) => {
  try {
    await storage.deleteDepartment(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Failed to delete department' });
  }
});

// User-Department Assignment Routes
router.get('/users/:userId/departments', requireRole(['tenant_admin', 'manager']), async (req, res) => {
  try {
    const userDepartments = await storage.getUserDepartments(req.params.userId);
    res.json(userDepartments);
  } catch (error) {
    console.error('Get user departments error:', error);
    res.status(500).json({ message: 'Failed to fetch user departments' });
  }
});

router.post('/users/:userId/departments', requireRole(['tenant_admin', 'manager']), async (req, res) => {
  try {
    const assignment = {
      userId: req.params.userId,
      departmentId: req.body.departmentId,
      isPrimary: req.body.isPrimary || false
    };
    const userDepartment = await storage.assignUserToDepartment(assignment);
    res.status(201).json(userDepartment);
  } catch (error) {
    console.error('Assign user to department error:', error);
    res.status(500).json({ message: 'Failed to assign user to department' });
  }
});

router.delete('/users/:userId/departments/:departmentId', requireRole(['tenant_admin', 'manager']), async (req, res) => {
  try {
    await storage.removeUserFromDepartment(req.params.userId, req.params.departmentId);
    res.status(204).send();
  } catch (error) {
    console.error('Remove user from department error:', error);
    res.status(500).json({ message: 'Failed to remove user from department' });
  }
});

// Permission Management Routes
router.get('/permissions', requireRole(['tenant_admin']), async (req, res) => {
  try {
    const permissions = await storage.getPermissions(req.user!.tenantId!);
    res.json(permissions);
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
});

router.post('/permissions', requireRole(['tenant_admin']), async (req, res) => {
  try {
    const permissionData = {
      ...req.body,
      tenantId: req.user!.tenantId!
    };
    const permission = await storage.createPermission(permissionData);
    res.status(201).json(permission);
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({ message: 'Failed to create permission' });
  }
});

router.put('/permissions/:id', requireRole(['tenant_admin']), async (req, res) => {
  try {
    const permission = await storage.updatePermission(req.params.id, req.body);
    res.json(permission);
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({ message: 'Failed to update permission' });
  }
});

router.delete('/permissions/:id', requireRole(['tenant_admin']), async (req, res) => {
  try {
    await storage.deletePermission(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({ message: 'Failed to delete permission' });
  }
});

// Role-Permission Assignment Routes
router.get('/roles/:role/permissions', requireRole(['tenant_admin']), async (req, res) => {
  try {
    const rolePermissions = await storage.getRolePermissions(req.user!.tenantId!, req.params.role);
    res.json(rolePermissions);
  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json({ message: 'Failed to fetch role permissions' });
  }
});

router.post('/roles/:role/permissions', requireRole(['tenant_admin']), async (req, res) => {
  try {
    const assignment = {
      tenantId: req.user!.tenantId!,
      role: req.params.role as any,
      permissionId: req.body.permissionId,
      departmentId: req.body.departmentId
    };
    const rolePermission = await storage.assignPermissionToRole(assignment);
    res.status(201).json(rolePermission);
  } catch (error) {
    console.error('Assign permission to role error:', error);
    res.status(500).json({ message: 'Failed to assign permission to role' });
  }
});

router.delete('/roles/:role/permissions/:permissionId', requireRole(['tenant_admin']), async (req, res) => {
  try {
    await storage.removePermissionFromRole(
      req.user!.tenantId!,
      req.params.role,
      req.params.permissionId
    );
    res.status(204).send();
  } catch (error) {
    console.error('Remove permission from role error:', error);
    res.status(500).json({ message: 'Failed to remove permission from role' });
  }
});

// User-Specific Permission Routes
router.get('/users/:userId/permissions', requireRole(['tenant_admin', 'manager']), async (req, res) => {
  try {
    const userPermissions = await storage.getUserPermissions(req.params.userId);
    res.json(userPermissions);
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ message: 'Failed to fetch user permissions' });
  }
});

router.post('/users/:userId/permissions', requireRole(['tenant_admin', 'manager']), async (req, res) => {
  try {
    const permission = {
      userId: req.params.userId,
      permissionId: req.body.permissionId,
      departmentId: req.body.departmentId,
      granted: req.body.granted !== false
    };
    const userPermission = await storage.grantUserPermission(permission);
    res.status(201).json(userPermission);
  } catch (error) {
    console.error('Grant user permission error:', error);
    res.status(500).json({ message: 'Failed to grant user permission' });
  }
});

router.delete('/users/:userId/permissions/:permissionId', requireRole(['tenant_admin', 'manager']), async (req, res) => {
  try {
    await storage.revokeUserPermission(req.params.userId, req.params.permissionId);
    res.status(204).send();
  } catch (error) {
    console.error('Revoke user permission error:', error);
    res.status(500).json({ message: 'Failed to revoke user permission' });
  }
});

// Utility Routes
router.get('/users/:userId/accessible-departments', requireRole(['tenant_admin', 'manager']), async (req, res) => {
  try {
    const departments = await storage.getUserAccessibleDepartments(req.params.userId);
    res.json(departments);
  } catch (error) {
    console.error('Get accessible departments error:', error);
    res.status(500).json({ message: 'Failed to fetch accessible departments' });
  }
});

router.post('/users/:userId/check-permission', requireRole(['tenant_admin', 'manager']), async (req, res) => {
  try {
    const { resource, action, departmentId } = req.body;
    const hasPermission = await storage.checkUserPermission(
      req.params.userId,
      resource,
      action,
      departmentId
    );
    res.json({ hasPermission });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({ message: 'Failed to check permission' });
  }
});

// Setup default permissions for new tenants
router.post('/setup-default-permissions', requireRole(['tenant_admin']), async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    
    // Create default departments
    const departments = [
      { tenantId, name: 'Vendas', type: 'sales', description: 'Departamento de vendas' },
      { tenantId, name: 'Compras', type: 'purchases', description: 'Departamento de compras' },
      { tenantId, name: 'Financeiro', type: 'finance', description: 'Departamento financeiro' },
      { tenantId, name: 'Operações', type: 'operations', description: 'Departamento de operações' }
    ];
    
    const createdDepts = await Promise.all(
      departments.map(dept => storage.createDepartment(dept as any))
    );
    
    // Create default permissions
    const permissions = [
      { tenantId, name: 'Ver Clientes', resource: 'clients', action: 'read', description: 'Visualizar dados de clientes' },
      { tenantId, name: 'Editar Clientes', resource: 'clients', action: 'write', description: 'Editar dados de clientes' },
      { tenantId, name: 'Ver Relatórios', resource: 'reports', action: 'read', description: 'Visualizar relatórios' },
      { tenantId, name: 'Criar Relatórios', resource: 'reports', action: 'write', description: 'Criar relatórios' },
      { tenantId, name: 'Ver Workflows', resource: 'workflows', action: 'read', description: 'Visualizar workflows' },
      { tenantId, name: 'Editar Workflows', resource: 'workflows', action: 'write', description: 'Editar workflows' }
    ];
    
    const createdPerms = await Promise.all(
      permissions.map(perm => storage.createPermission(perm as any))
    );
    
    res.json({
      message: 'Default permissions and departments created successfully',
      departments: createdDepts,
      permissions: createdPerms
    });
  } catch (error) {
    console.error('Setup default permissions error:', error);
    res.status(500).json({ message: 'Failed to setup default permissions' });
  }
});

export { router as accessControlRoutes };