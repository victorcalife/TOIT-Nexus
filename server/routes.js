import { createServer } from "http";
import { storage } from "./storage.js";

// Simple authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.user || (req.session && req.session.user)) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app) {
  // Simple login endpoint for testing
  app.post('/api/simple-login', async (req, res) => {
    try {
      const { cpf, password } = req.body;
      
      if (!cpf || !password) {
        return res.status(400).json({ message: 'CPF and password are required' });
      }

      const users = await storage.getAllUsers();
      const user = users.find(u => u.cpf === cpf);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Simple password check (in production, use proper hashing)
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.user = {
        id: user.id,
        cpf: user.cpf,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      };

      res.json({
        success: true,
        user: {
          id: user.id,
          cpf: user.cpf,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current user
  app.get('/api/user', isAuthenticated, (req, res) => {
    res.json({ user: req.session.user });
  });

  // Logout
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ success: true });
    });
  });

  // Get all users (admin only)
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      if (req.session.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Get all tenants (admin only)
  app.get('/api/tenants', isAuthenticated, async (req, res) => {
    try {
      if (req.session.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ message: 'Failed to fetch tenants' });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const tenants = await storage.getAllTenants();
      
      const stats = {
        totalUsers: users.length,
        totalTenants: tenants.length,
        activeTenants: tenants.filter(t => t.isActive).length,
        recentUsers: users.filter(u => {
          const createdAt = new Date(u.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdAt > thirtyDaysAgo;
        }).length
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}