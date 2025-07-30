import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Extend Request interface to include user and permissions
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId?: string;
        role: string;
        departments?: string[];
      };
      userPermissions?: {
        resource: string;
        action: string;
        departmentId?: string;
      }[];
    }
  }
}

// Middleware to check user permissions for specific resources
export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const hasPermission = await storage.checkUserPermission(
        req.user.id,
        resource,
        action,
        req.body.departmentId || req.query.departmentId as string
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: { resource, action }
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
}

// Middleware to ensure user belongs to specific tenant
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.tenantId) {
    return res.status(403).json({ message: 'Tenant access required' });
  }
  next();
}

// Middleware to check role-based access
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient role permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
}

// Middleware to filter data based on user's department access
export async function applyDepartmentFilters(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next();
    }

    // Get user's accessible departments
    const accessibleDepts = await storage.getUserAccessibleDepartments(req.user.id);
    req.user.departments = accessibleDepts.map(dept => dept.id);

    // Get department-specific data filters
    const filters = await storage.getDepartmentFilters(req.user.id);
    req.query.departmentFilters = JSON.stringify(filters);

    next();
  } catch (error) {
    console.error('Department filter error:', error);
    next(); // Continue without filters on error
  }
}

// Utility function to check if user can access specific tenant data
export async function canAccessTenant(userId: string, tenantId: string): Promise<boolean> {
  const user = await storage.getUser(userId);
  if (!user) return false;
  
  // Super admin can access any tenant
  if (user.role === 'super_admin') return true;
  
  // Users can only access their own tenant
  return user.tenantId === tenantId;
}

// Utility function to get user's data scope based on department access
export async function getUserDataScope(userId: string) {
  const user = await storage.getUser(userId);
  if (!user) return null;

  // Super admin sees everything
  if (user.role === 'super_admin') {
    return { scope: 'global', tenantId: null, departments: [] };
  }

  // Tenant admin sees all data within their tenant
  if (user.role === 'tenant_admin') {
    return { scope: 'tenant', tenantId: user.tenantId, departments: [] };
  }

  // Regular users see only their department data
  const departments = await storage.getUserAccessibleDepartments(userId);
  return { 
    scope: 'department', 
    tenantId: user.tenantId, 
    departments: departments.map(d => d.id) 
  };
}