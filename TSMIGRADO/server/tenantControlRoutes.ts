/**
 * TENANT CONTROL ROUTES - APIs para dashboard de controle de tenants pela equipe TOIT
 * Controle completo de funcionalidades, billing e logs de uso por empresa
 */

import express from 'express';
import { eq, desc, and, or, ilike, count, sum, avg, gte, lte } from 'drizzle-orm';
import { db } from './db';
import { 
  tenants, 
  users, 
  tenantModules, 
  moduleDefinitions, 
  accessProfiles,
  userDepartments,
  departments 
} from '../shared/schema';
import { requireRole } from './authMiddleware';

const router = express.Router();

// Middleware para verificar se é equipe TOIT
router.use(requireRole(['super_admin', 'toit_admin']));

// GET /api/admin/tenant-control - Lista todos os tenants com dados de controle
router.get('/', async (req, res) => {
  try {
    const { search, status, plan } = req.query;
    
    // Query base para buscar tenants com dados agregados
    let query = db
      .select({
        tenant: tenants,
        accessProfile: accessProfiles,
        totalUsers: count(users.id),
        activeUsers: sum(
          // Simular usuários ativos (logados nos últimos 30 dias)
          // Em produção, usar tabela de sessões ou last_login
          1 
        ).as('active_users'),
        activeModules: count(tenantModules.id),
      })
      .from(tenants)
      .leftJoin(accessProfiles, eq(tenants.accessProfileId, accessProfiles.id))
      .leftJoin(users, and(
        eq(users.tenantId, tenants.id),
        eq(users.isActive, true)
      ))
      .leftJoin(tenantModules, and(
        eq(tenantModules.tenantId, tenants.id),
        eq(tenantModules.isEnabled, true)
      ))
      .groupBy(tenants.id, accessProfiles.id);

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
      if (status === 'active') {
        query = query.where(eq(tenants.status, 'active'));
      } else if (status === 'inactive') {
        query = query.where(eq(tenants.status, 'inactive'));
      }
    }

    if (plan && plan !== 'all') {
      query = query.where(eq(tenants.subscriptionPlan, plan));
    }

    const tenantsWithData = await query.orderBy(desc(tenants.createdAt));

    // Enriquecer dados com informações adicionais
    const enrichedTenants = await Promise.all(
      tenantsWithData.map(async (item) => {
        // Buscar contagem total de módulos disponíveis
        const totalModules = await db
          .select({ count: count() })
          .from(moduleDefinitions)
          .where(eq(moduleDefinitions.isActive, true));

        // Simular dados de uso e billing (em produção, vir de sistema real)
        const mockUsage = {
          storage: Math.floor(Math.random() * 10) + 1, // 1-10 GB
          apiCalls: Math.floor(Math.random() * 10000) + 1000, // 1000-11000
          workflows: Math.floor(Math.random() * 50) + 10, // 10-60
          reports: Math.floor(Math.random() * 100) + 20 // 20-120
        };

        const mockLimits = {
          users: item.accessProfile?.max_users || 5,
          storage: item.accessProfile?.max_storage_gb || 10,
          apiCalls: 50000 // Mock limit
        };

        const mockBilling = {
          lastPayment: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          paymentStatus: Math.random() > 0.8 ? 'overdue' : Math.random() > 0.9 ? 'suspended' : 'active',
          totalSpent: Math.floor(Math.random() * 5000) + 500
        };

        const mockActivity = [
          {
            type: 'login',
            description: 'Usuário fez login no sistema',
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Admin'
          },
          {
            type: 'module_usage',
            description: 'Módulo de relatórios utilizado',
            timestamp: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
            user: 'Usuário'
          }
        ];

        return {
          ...item.tenant,
          accessProfileName: item.accessProfile?.name || item.tenant.subscriptionPlan?.toUpperCase(),
          totalUsers: Number(item.totalUsers) || 0,
          activeUsers: Math.floor(Number(item.totalUsers) * 0.7) || 1, // 70% dos usuários ativos
          activeModules: Number(item.activeModules) || 0,
          totalModules: totalModules[0]?.count || 15,
          monthlyRevenue: parseFloat(item.accessProfile?.price_monthly || '0') || 0,
          currentUsage: mockUsage,
          limits: mockLimits,
          billingInfo: mockBilling,
          recentActivity: mockActivity,
          lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      })
    );

    res.json({
      success: true,
      data: enrichedTenants,
      total: enrichedTenants.length
    });

  } catch (error) {
    console.error('Error fetching tenant control data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar dados de controle de tenants' 
    });
  }
});

// GET /api/admin/tenant-control/analytics - Analytics de uso
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Buscar dados básicos dos tenants
    const tenantsData = await db
      .select({
        tenant: tenants,
        totalUsers: count(users.id),
        activeModules: count(tenantModules.id)
      })
      .from(tenants)
      .leftJoin(users, eq(users.tenantId, tenants.id))
      .leftJoin(tenantModules, and(
        eq(tenantModules.tenantId, tenants.id),
        eq(tenantModules.isEnabled, true)
      ))
      .groupBy(tenants.id);

    // Buscar módulos mais utilizados
    const topModules = await db
      .select({
        module: moduleDefinitions,
        tenantCount: count(tenantModules.tenantId),
        totalUsage: sum(tenantModules.currentUsage)
      })
      .from(moduleDefinitions)
      .leftJoin(tenantModules, and(
        eq(tenantModules.moduleId, moduleDefinitions.id),
        eq(tenantModules.isEnabled, true)
      ))
      .groupBy(moduleDefinitions.id)
      .orderBy(desc(count(tenantModules.tenantId)))
      .limit(10);

    // Simular dados de analytics (em produção, calcular dados reais)
    const tenantUsage = tenantsData.map(item => ({
      tenantId: item.tenant.id,
      tenantName: item.tenant.name,
      totalUsers: Number(item.totalUsers) || 0,
      activeUsers: Math.floor(Number(item.totalUsers) * 0.7) || 1,
      modulesUsed: Number(item.activeModules) || 0,
      apiCalls: Math.floor(Math.random() * 50000) + 10000,
      storageUsed: Math.floor(Math.random() * 20) + 1,
      revenue: Math.floor(Math.random() * 500) + 100,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));

    const summary = {
      totalTenants: tenantsData.length,
      activeTenants: tenantsData.filter(t => t.tenant.status === 'active').length,
      totalRevenue: tenantUsage.reduce((sum, t) => sum + t.revenue, 0),
      avgUsagePerTenant: tenantUsage.length > 0 
        ? tenantUsage.reduce((sum, t) => sum + t.modulesUsed, 0) / tenantUsage.length 
        : 0,
      topModules: topModules.map(tm => ({
        moduleId: tm.module.id,
        moduleName: tm.module.displayName || tm.module.name,
        tenantCount: Number(tm.tenantCount) || 0,
        usage: Number(tm.totalUsage) || 0
      }))
    };

    res.json({
      success: true,
      data: {
        period,
        tenantUsage,
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching tenant analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar analytics de tenants' 
    });
  }
});

// GET /api/admin/tenant-control/billing - Dados consolidados de billing
router.get('/billing', async (req, res) => {
  try {
    // Buscar dados de billing (mock para demonstração)
    const billingData = {
      totalRevenue: 50000,
      monthlyGrowth: 12.5,
      overdueTenants: 3,
      suspendedTenants: 1,
      averageRevenuePerTenant: 250,
      paymentMethods: {
        creditCard: 85,
        bankSlip: 12,
        pix: 3
      },
      revenueByPlan: {
        basico: 15000,
        standard: 20000,
        premium: 12000,
        enterprise: 3000
      }
    };

    res.json({
      success: true,
      data: billingData
    });

  } catch (error) {
    console.error('Error fetching billing data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar dados de billing' 
    });
  }
});

// PUT /api/admin/tenant-control/:tenantId/status - Alterar status do tenant
router.put('/:tenantId/status', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { isActive, reason } = req.body;

    // Verificar se tenant existe
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

    // Atualizar status
    const updatedTenant = await db
      .update(tenants)
      .set({
        status: isActive ? 'active' : 'suspended',
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    // Log da ação (em produção, salvar em tabela de auditoria)
    console.log(`Tenant ${tenant[0].name} ${isActive ? 'ativado' : 'suspenso'} - Motivo: ${reason}`);

    res.json({
      success: true,
      data: updatedTenant[0],
      message: `Tenant ${isActive ? 'ativado' : 'suspenso'} com sucesso`
    });

  } catch (error) {
    console.error('Error updating tenant status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao alterar status do tenant' 
    });
  }
});

// PUT /api/admin/tenant-control/:tenantId/plan - Alterar plano do tenant
router.put('/:tenantId/plan', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { accessProfileId } = req.body;

    // Verificar se tenant e perfil existem
    const [tenant, profile] = await Promise.all([
      db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1),
      db.select().from(accessProfiles).where(eq(accessProfiles.id, accessProfileId)).limit(1)
    ]);

    if (tenant.length === 0) {
      return res.status(404).json({ success: false, error: 'Tenant não encontrado' });
    }

    if (profile.length === 0) {
      return res.status(404).json({ success: false, error: 'Perfil de acesso não encontrado' });
    }

    // Atualizar plano do tenant
    const updatedTenant = await db
      .update(tenants)
      .set({
        accessProfileId,
        subscriptionPlan: profile[0].slug,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    res.json({
      success: true,
      data: updatedTenant[0],
      message: `Plano alterado para ${profile[0].name} com sucesso`
    });

  } catch (error) {
    console.error('Error updating tenant plan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao alterar plano do tenant' 
    });
  }
});

// GET /api/admin/tenant-control/:tenantId/usage - Dados detalhados de uso do tenant
router.get('/:tenantId/usage', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { period = '30d' } = req.query;

    // Verificar se tenant existe
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

    // Buscar dados de uso detalhados
    const moduleUsage = await db
      .select({
        module: moduleDefinitions,
        tenantModule: tenantModules
      })
      .from(tenantModules)
      .innerJoin(moduleDefinitions, eq(tenantModules.moduleId, moduleDefinitions.id))
      .where(eq(tenantModules.tenantId, tenantId));

    const userActivity = await db
      .select({
        user: users,
        department: departments
      })
      .from(users)
      .leftJoin(userDepartments, eq(userDepartments.userId, users.id))
      .leftJoin(departments, eq(userDepartments.departmentId, departments.id))
      .where(eq(users.tenantId, tenantId));

    // Simular dados de timeline de uso
    const usageTimeline = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      apiCalls: Math.floor(Math.random() * 1000) + 100,
      activeUsers: Math.floor(Math.random() * 10) + 2,
      storageUsed: Math.floor(Math.random() * 1000) + 500
    })).reverse();

    res.json({
      success: true,
      data: {
        tenant: tenant[0],
        moduleUsage: moduleUsage.map(mu => ({
          ...mu.module,
          usage: mu.tenantModule,
          utilizationRate: Math.floor(Math.random() * 100) + 1
        })),
        userActivity: userActivity.map(ua => ({
          ...ua.user,
          department: ua.department?.name || 'Sem departamento',
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })),
        timeline: usageTimeline,
        period
      }
    });

  } catch (error) {
    console.error('Error fetching tenant usage:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar dados de uso do tenant' 
    });
  }
});

// POST /api/admin/tenant-control/:tenantId/notify - Enviar notificação para tenant
router.post('/:tenantId/notify', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { type, title, message, urgent = false } = req.body;

    // Verificar se tenant existe
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

    // Em produção, implementar sistema de notificações
    // Por ora, apenas log
    console.log(`Notificação para ${tenant[0].name}:`, {
      type,
      title,
      message,
      urgent,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Notificação enviada com sucesso'
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao enviar notificação' 
    });
  }
});

export { router as tenantControlRoutes };