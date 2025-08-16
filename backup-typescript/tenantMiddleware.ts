import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Extend Request type to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        name: string;
        slug: string;
        status: string;
      };
      userRole?: string;
      isSuperAdmin?: boolean;
    }
  }
}

// Middleware to extract and validate tenant information
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    
    if (!user || !user.claims) {
      return next();
    }

    // Get user from database to check tenant association
    const dbUser = await storage.getUser(user.claims.sub);
    
    if (!dbUser) {
      return next();
    }

    // Check if user is super admin (no tenant association)
    if (dbUser.role === 'super_admin' && !dbUser.tenantId) {
      req.isSuperAdmin = true;
      req.userRole = 'super_admin';
      return next();
    }

    // Regular tenant user
    if (dbUser.tenantId) {
      const tenant = await storage.getTenant(dbUser.tenantId);
      
      if (!tenant) {
        return res.status(403).json({ message: "Tenant not found" });
      }

      if (tenant.status !== 'active') {
        return res.status(403).json({ message: "Tenant is not active" });
      }

      req.tenant = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status
      };
      req.userRole = dbUser.role;
    }

    next();
  } catch (error) {
    console.error("Tenant middleware error:", error);
    next();
  }
};

// Middleware to require tenant access (blocks super admin from tenant routes)
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return res.status(403).json({ 
      message: "Tenant access required. Please select a tenant to continue." 
    });
  }
  next();
};

// Middleware to require super admin access
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // For local auth, user object is the DB user directly
    if (user.role === 'super_admin') {
      req.isSuperAdmin = true;
      return next();
    }

    // Handle OAuth format if needed
    const userId = user.claims?.sub;
    if (userId) {
      const dbUser = await storage.getUser(userId);
      if (dbUser && dbUser.role === 'super_admin') {
        req.isSuperAdmin = true;
        return next();
      }
    }
    
    return res.status(403).json({ message: "Super admin access required" });
  } catch (error) {
    console.error("Super admin middleware error:", error);
    res.status(500).json({ message: "Authorization check failed" });
  }
};

// Middleware to require specific role within tenant
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ 
        message: "Insufficient permissions" 
      });
    }
    next();
  };
};

// Helper function to get tenant ID from request
export const getTenantId = (req: Request): string | undefined => {
  return req.tenant?.id;
};

// Helper function to check if user can access resource
export const canAccessTenantResource = (req: Request, resourceTenantId?: string): boolean => {
  // Super admin can access everything
  if (req.isSuperAdmin) {
    return true;
  }

  // Regular user can only access their tenant's resources
  if (!req.tenant || !resourceTenantId) {
    return false;
  }

  return req.tenant.id === resourceTenantId;
};