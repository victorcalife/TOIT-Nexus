/**
 * ADMIN MODULE ROUTES - Gestão avançada de módulos pela equipe TOIT
 * Interface para configurar, ativar/desativar módulos para tenants específicos
 */

import express from 'express';
import { eq, desc, and, or, ilike } from 'drizzle-orm';
import { db } from './db';
import { tenants, tenantModules, moduleDefinitions, users } from '../shared/schema';
import { requireRole } from './authMiddleware';
import { ModuleService } from './moduleService';
import { storage } from './storage';

const router = express.Router();

// Middleware para verificar se é equipe TOIT
router.use(requireRole(['super_admin', 'toit_admin']));

// GET /api/admin/tenants-modules - Lista todos os tenants com seus módulos
router.get('/tenants-modules', async (req, res) => {
  try {
    const { search, status, plan } = req.query;
    
    // Query base para buscar tenants com seus módulos
    let query = db
      .select({
        tenant: tenants,
        activeModules: db.$count(tenantModules, and(
          eq(tenantModules.tenantId, tenants.id),
          eq(tenantModules.isEnabled, true)
        )),
        totalUsers: db.$count(users, eq(users.tenantId, tenants.id))
      })
      .from(tenants);

    // Aplicar filtros
    if (search) {
      query = query.where(
        or(
          ilike(tenants.name, `%${search}%`),
          ilike(tenants.domain, `%${search}%`)
        )
      );
    }

    if (status) {
      query = query.where(eq(tenants.isActive, status === 'active'));
    }

    if (plan) {
      query = query.where(eq(tenants.plan, plan));
    }

    const tenantsWithModules = await query.orderBy(desc(tenants.createdAt));

    // Buscar módulos detalhados para cada tenant
    const enrichedTenants = await Promise.all(
      tenantsWithModules.map(async (item) => {
        const modules = await db
          .select({
            module: moduleDefinitions,
            tenantModule: tenantModules
          })
          .from(tenantModules)
          .innerJoin(moduleDefinitions, eq(tenantModules.moduleId, moduleDefinitions.id))
          .where(eq(tenantModules.tenantId, item.tenant.id));

        return {
          ...item.tenant,
          activeModules: item.activeModules,
          totalUsers: item.totalUsers,
          modules: modules.map(m => ({
            ...m.module,
            config: m.tenantModule
          }))
        };
      })
    );

    res.json({
      success: true,
      data: enrichedTenants,
      total: enrichedTenants.length
    });

  } catch (error) {
    console.error('Error fetching tenants modules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar módulos dos tenants' 
    });
  }
});

// GET /api/admin/tenant/:tenantId/modules - Módulos específicos de um tenant
router.get('/tenant/:tenantId/modules', async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Buscar tenant
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (tenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant não encontrado'
      });
    }

    // Buscar todos os módulos disponíveis
    const allModules = await db.select().from(moduleDefinitions);

    // Buscar módulos ativos do tenant
    const tenantActiveModules = await db
      .select()
      .from(tenantModules)
      .where(eq(tenantModules.tenantId, tenantId));

    // Combinar informações
    const modulesWithStatus = allModules.map(module => {
      const tenantModule = tenantActiveModules.find(tm => tm.moduleId === module.id);
      return {
        ...module,
        isActive: !!tenantModule,
        config: tenantModule || null,
        usageStats: tenantModule ? {
          currentUsers: tenantModule.currentUsers || 0,
          maxUsers: tenantModule.maxUsers || 0,
          totalUsage: tenantModule.totalUsage || 0
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        tenant: tenant[0],
        modules: modulesWithStatus
      }
    });

  } catch (error) {
    console.error('Error fetching tenant modules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar módulos do tenant' 
    });
  }
});

// POST /api/admin/tenant/:tenantId/modules/:moduleId/activate - Ativar módulo
router.post('/tenant/:tenantId/modules/:moduleId/activate', async (req, res) => {
  try {
    const { tenantId, moduleId } = req.params;
    const { plan = 'trial', maxUsers, usageLimits, trialDays = 7 } = req.body;

    // Verificar se tenant e módulo existem
    const [tenant, module] = await Promise.all([
      db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1),
      db.select().from(moduleDefinitions).where(eq(moduleDefinitions.id, moduleId)).limit(1)
    ]);

    if (tenant.length === 0) {
      return res.status(404).json({ success: false, error: 'Tenant não encontrado' });
    }

    if (module.length === 0) {
      return res.status(404).json({ success: false, error: 'Módulo não encontrado' });
    }

    // Verificar se já está ativo
    const existingModule = await db
      .select()
      .from(tenantModules)
      .where(and(
        eq(tenantModules.tenantId, tenantId),
        eq(tenantModules.moduleId, moduleId)
      ))
      .limit(1);

    if (existingModule.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Módulo já está ativo para este tenant'
      });
    }

    // Obter configuração padrão
    const defaultConfig = {
      maxUsers: maxUsers || (plan === 'enterprise' ? -1 : plan === 'premium' ? 50 : 10),
      usageLimits: usageLimits || {},
      trialEndsAt: plan === 'trial' ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : null
    };

    // Criar módulo do tenant
    const tenantModule = await db
      .insert(tenantModules)
      .values({
        tenantId,
        moduleId,
        isEnabled: true,
        plan,
        maxUsers: defaultConfig.maxUsers,
        usageLimits: defaultConfig.usageLimits,
        trialEndsAt: defaultConfig.trialEndsAt,
        currentUsers: 0,
        totalUsage: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.json({
      success: true,
      data: tenantModule[0],
      message: `Módulo ${module[0].name} ativado com sucesso para ${tenant[0].name}`
    });

  } catch (error) {
    console.error('Error activating module:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao ativar módulo' 
    });
  }
});

// PUT /api/admin/tenant/:tenantId/modules/:moduleId/toggle - Ativar/Desativar
router.put('/tenant/:tenantId/modules/:moduleId/toggle', async (req, res) => {
  try {
    const { tenantId, moduleId } = req.params;
    const { enabled } = req.body;

    const result = await db
      .update(tenantModules)
      .set({
        isEnabled: enabled,
        updatedAt: new Date()
      })
      .where(and(
        eq(tenantModules.tenantId, tenantId),
        eq(tenantModules.moduleId, moduleId)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Módulo não encontrado para este tenant'
      });
    }

    res.json({
      success: true,
      data: result[0],
      message: `Módulo ${enabled ? 'ativado' : 'desativado'} com sucesso`
    });

  } catch (error) {
    console.error('Error toggling module:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao alterar status do módulo' 
    });
  }
});

// PUT /api/admin/tenant/:tenantId/modules/:moduleId/config - Atualizar configuração
router.put('/tenant/:tenantId/modules/:moduleId/config', async (req, res) => {
  try {
    const { tenantId, moduleId } = req.params;
    const { plan, maxUsers, usageLimits, trialDays } = req.body;

    const updateData: any = { updatedAt: new Date() };
    
    if (plan) updateData.plan = plan;
    if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
    if (usageLimits) updateData.usageLimits = usageLimits;
    if (trialDays && plan === 'trial') {
      updateData.trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    }

    const result = await db
      .update(tenantModules)
      .set(updateData)
      .where(and(
        eq(tenantModules.tenantId, tenantId),
        eq(tenantModules.moduleId, moduleId)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Módulo não encontrado para este tenant'
      });
    }

    res.json({
      success: true,
      data: result[0],
      message: 'Configuração atualizada com sucesso'
    });

  } catch (error) {
    console.error('Error updating module config:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao atualizar configuração do módulo' 
    });
  }
});

// DELETE /api/admin/tenant/:tenantId/modules/:moduleId - Remover módulo
router.delete('/tenant/:tenantId/modules/:moduleId', async (req, res) => {
  try {
    const { tenantId, moduleId } = req.params;

    const result = await db
      .delete(tenantModules)
      .where(and(
        eq(tenantModules.tenantId, tenantId),
        eq(tenantModules.moduleId, moduleId)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Módulo não encontrado para este tenant'
      });
    }

    res.json({
      success: true,
      message: 'Módulo removido com sucesso'
    });

  } catch (error) {
    console.error('Error removing module:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao remover módulo' 
    });
  }
});

// GET /api/admin/modules/usage-analytics - Analytics de uso dos módulos
router.get('/modules/usage-analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calcular data de início baseada no período
    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Buscar estatísticas de uso
    const moduleStats = await db
      .select({
        module: moduleDefinitions,
        totalTenants: db.$count(tenantModules, and(
          eq(tenantModules.moduleId, moduleDefinitions.id),
          eq(tenantModules.isEnabled, true)
        )),
        totalUsers: db.$sum(tenantModules.currentUsers),
        avgUsage: db.$avg(tenantModules.totalUsage)
      })
      .from(moduleDefinitions)
      .leftJoin(tenantModules, eq(tenantModules.moduleId, moduleDefinitions.id));

    res.json({
      success: true,
      data: {
        period,
        modules: moduleStats,
        summary: {
          totalModules: moduleStats.length,
          activeModules: moduleStats.filter(m => m.totalTenants > 0).length,
          totalActiveTenants: moduleStats.reduce((sum, m) => sum + (m.totalTenants || 0), 0)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar analytics de uso' 
    });
  }
});

// POST /api/admin/modules/bulk-activate - Ativação em lote
router.post('/modules/bulk-activate', async (req, res) => {
  try {
    const { tenantIds, moduleIds, config } = req.body;

    if (!tenantIds?.length || !moduleIds?.length) {
      return res.status(400).json({
        success: false,
        error: 'Lista de tenants e módulos são obrigatórias'
      });
    }

    const results = [];
    const errors = [];

    // Processar cada combinação tenant-module
    for (const tenantId of tenantIds) {
      for (const moduleId of moduleIds) {
        try {
          // Verificar se já existe
          const existing = await db
            .select()
            .from(tenantModules)
            .where(and(
              eq(tenantModules.tenantId, tenantId),
              eq(tenantModules.moduleId, moduleId)
            ))
            .limit(1);

          if (existing.length === 0) {
            // Criar novo
            const tenantModule = await db
              .insert(tenantModules)
              .values({
                tenantId,
                moduleId,
                isEnabled: true,
                plan: config?.plan || 'trial',
                maxUsers: config?.maxUsers || 10,
                usageLimits: config?.usageLimits || {},
                trialEndsAt: config?.plan === 'trial' 
                  ? new Date(Date.now() + (config?.trialDays || 7) * 24 * 60 * 60 * 1000)
                  : null,
                createdAt: new Date(),
                updatedAt: new Date()
              })
              .returning();

            results.push({ tenantId, moduleId, status: 'created', data: tenantModule[0] });
          } else {
            results.push({ tenantId, moduleId, status: 'exists' });
          }
        } catch (error) {
          errors.push({ 
            tenantId, 
            moduleId, 
            error: error instanceof Error ? error.message : 'Erro desconhecido' 
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        processed: results.length + errors.length,
        successful: results.length,
        errors: errors.length,
        results,
        errors
      }
    });

  } catch (error) {
    console.error('Error bulk activating modules:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha na ativação em lote' 
    });
  }
});

export { router as adminModuleRoutes };