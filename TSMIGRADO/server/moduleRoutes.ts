import { Router } from 'express';
import { storage } from './storage';
import { requireModuleAccess, trackModuleUsage, ModuleService } from './moduleService';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';

const router = Router();

// Get available modules for tenant type
router.get('/available', requireAuth, async (req: any, res) => {
  try {
    const userType = req.query.userType || 'pequena_empresa';
    const modules = await storage.getAvailableModules(userType);
    res.json(modules);
  } catch (error) {
    console.error('Error fetching available modules:', error);
    res.status(500).json({ message: 'Failed to fetch available modules' });
  }
});

// Get tenant's active modules
router.get('/tenant', tenantMiddleware, requireAuth, async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const modules = await storage.getTenantModules(tenantId);
    res.json(modules);
  } catch (error) {
    console.error('Error fetching tenant modules:', error);
    res.status(500).json({ message: 'Failed to fetch tenant modules' });
  }
});

// Get usage statistics
router.get('/usage-stats', tenantMiddleware, requireAuth, async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const stats = await storage.getModuleUsageStats(tenantId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ message: 'Failed to fetch usage stats' });
  }
});

// Activate a module for tenant
router.post('/:moduleId/activate', tenantMiddleware, requireAuth, async (req: any, res) => {
  try {
    const { moduleId } = req.params;
    const { plan = 'trial', maxUsers, customConfig } = req.body;
    const tenantId = req.tenant.id;
    const userId = req.user.id || req.user.claims.sub;

    // Check if module exists
    const module = await storage.getModuleDefinition(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Check if already activated
    const existingModule = await storage.getTenantModule(tenantId, moduleId);
    if (existingModule) {
      return res.status(400).json({ message: 'Module already activated' });
    }

    // Get default configuration for plan
    const defaultConfig = await ModuleService.getDefaultModuleConfig(module.name, plan);

    // Create tenant module
    const tenantModule = await storage.createTenantModule({
      tenantId,
      moduleId,
      isEnabled: true,
      plan,
      maxUsers: maxUsers || defaultConfig.maxUsers,
      usageLimits: defaultConfig.usageLimits,
      customConfig: customConfig || {},
      trialEndsAt: plan === 'trial' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
      activatedBy: userId
    });

    // Track activation
    await ModuleService.trackModuleUsage(userId, tenantId, module.name, 'activate_module');

    res.status(201).json(tenantModule);
  } catch (error) {
    console.error('Error activating module:', error);
    res.status(500).json({ message: 'Failed to activate module' });
  }
});

// Toggle module enable/disable
router.put('/:moduleId/toggle', tenantMiddleware, requireAuth, async (req: any, res) => {
  try {
    const { moduleId } = req.params;
    const { enabled } = req.body;
    const tenantId = req.tenant.id;

    const tenantModule = await storage.updateTenantModule(tenantId, moduleId, {
      isEnabled: enabled,
      updatedAt: new Date()
    });

    if (!tenantModule) {
      return res.status(404).json({ message: 'Module not found for this tenant' });
    }

    res.json(tenantModule);
  } catch (error) {
    console.error('Error toggling module:', error);
    res.status(500).json({ message: 'Failed to toggle module' });
  }
});

// Update module configuration
router.put('/:moduleId/config', tenantMiddleware, requireAuth, async (req: any, res) => {
  try {
    const { moduleId } = req.params;
    const { plan, maxUsers, usageLimits, customConfig } = req.body;
    const tenantId = req.tenant.id;

    const updateData: any = { updatedAt: new Date() };
    if (plan) updateData.plan = plan;
    if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
    if (usageLimits) updateData.usageLimits = usageLimits;
    if (customConfig) updateData.customConfig = customConfig;

    const tenantModule = await storage.updateTenantModule(tenantId, moduleId, updateData);

    if (!tenantModule) {
      return res.status(404).json({ message: 'Module not found for this tenant' });
    }

    res.json(tenantModule);
  } catch (error) {
    console.error('Error updating module config:', error);
    res.status(500).json({ message: 'Failed to update module configuration' });
  }
});

// Check module access for current user
router.get('/:moduleName/access', tenantMiddleware, requireAuth, async (req: any, res) => {
  try {
    const { moduleName } = req.params;
    const userId = req.user.id || req.user.claims.sub;
    const tenantId = req.tenant.id;

    const access = await ModuleService.checkModuleAccess(userId, tenantId, moduleName);
    res.json(access);
  } catch (error) {
    console.error('Error checking module access:', error);
    res.status(500).json({ message: 'Failed to check module access' });
  }
});

// Get module pricing and plans
router.get('/:moduleId/pricing', requireAuth, async (req: any, res) => {
  try {
    const { moduleId } = req.params;
    const userType = req.query.userType || 'pequena_empresa';
    
    const pricing = await storage.getModulePricing(moduleId, userType);
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching module pricing:', error);
    res.status(500).json({ message: 'Failed to fetch module pricing' });
  }
});

// Admin: Create or update module definition
router.post('/definitions', requireAuth, async (req: any, res) => {
  try {
    // Only super admin can create module definitions
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const moduleData = req.body;
    const module = await storage.createModuleDefinition(moduleData);
    res.status(201).json(module);
  } catch (error) {
    console.error('Error creating module definition:', error);
    res.status(500).json({ message: 'Failed to create module definition' });
  }
});

// Admin: Get all module definitions
router.get('/definitions', requireAuth, async (req: any, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const modules = await storage.getAllModuleDefinitions();
    res.json(modules);
  } catch (error) {
    console.error('Error fetching module definitions:', error);
    res.status(500).json({ message: 'Failed to fetch module definitions' });
  }
});

export { router as moduleRoutes };