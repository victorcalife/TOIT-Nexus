/**
 * DASHBOARD BUILDER ROUTES - API completa para dashboard builder
 * Endpoints: CRUD dashboards, widgets, templates, processamento de dados
 * Funcionalidades: KPIs, gráficos, automação, templates empresariais
 */

import express from 'express';
import { eq, desc, and, or, ilike } from 'drizzle-orm';
import { db } from './db';
import { 
  customDashboards,
  dashboardWidgets,
  users
} from '../shared/schema';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { 
  dashboardBuilderService, 
  DashboardSchema,
  WidgetSchema,
  DashboardTemplateSchema 
} from './dashboardBuilderService';
import { z } from 'zod';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// DASHBOARD MANAGEMENT - GESTÃO DE DASHBOARDS
// ==========================================

// GET /api/dashboards - Listar dashboards do tenant
router.get('/', async (req: any, res) => {
  try {
    const { 
      search, 
      tags, 
      isPublic, 
      createdBy, 
      limit = 20, 
      offset = 0 
    } = req.query;
    const tenantId = req.tenant.id;

    const filters = {
      search,
      tags: tags ? tags.split(',') : undefined,
      isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
      createdBy,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const result = await dashboardBuilderService.getDashboards(tenantId, filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar dashboards'
    });
  }
});

// POST /api/dashboards - Criar novo dashboard
router.post('/', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    console.log(`📊 Criando dashboard - User: ${userId}, Tenant: ${tenantId}`);

    // Validar dados de entrada
    const validatedData = DashboardSchema.parse(req.body);

    const result = await dashboardBuilderService.createDashboard(
      tenantId,
      userId,
      validatedData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Dashboard criado: ${result.data.id}`);
    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error creating dashboard:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao criar dashboard'
      });
    }
  }
});

// GET /api/dashboards/:id - Obter dashboard completo
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    const result = await dashboardBuilderService.getDashboard(tenantId, id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar dashboard'
    });
  }
});

// PUT /api/dashboards/:id - Atualizar dashboard
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se dashboard existe
    const existing = await db
      .select()
      .from(customDashboards)
      .where(and(
        eq(customDashboards.id, id),
        eq(customDashboards.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard não encontrado'
      });
    }

    // Validar dados
    const validatedData = DashboardSchema.partial().parse(req.body);

    // Atualizar dashboard
    const updated = await db
      .update(customDashboards)
      .set({
        ...validatedData,
        layout: validatedData.layout as any,
        theme: validatedData.theme as any,
        updatedAt: new Date(),
      })
      .where(eq(customDashboards.id, id))
      .returning();

    console.log(`📊 Dashboard atualizado: ${id}`);
    res.json({
      success: true,
      data: updated[0],
      message: 'Dashboard atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating dashboard:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao atualizar dashboard'
      });
    }
  }
});

// DELETE /api/dashboards/:id - Deletar dashboard
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant.id;

    console.log(`🗑️ Deletando dashboard: ${id} - Tenant: ${tenantId}`);

    const result = await dashboardBuilderService.deleteDashboard(tenantId, id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Dashboard deletado: ${id}`);
    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error deleting dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao deletar dashboard'
    });
  }
});

// ==========================================
// WIDGET MANAGEMENT - GESTÃO DE WIDGETS
// ==========================================

// POST /api/dashboards/:id/widgets - Adicionar widget ao dashboard
router.post('/:id/widgets', async (req: any, res) => {
  try {
    const { id: dashboardId } = req.params;
    const tenantId = req.tenant.id;

    console.log(`🧩 Adicionando widget ao dashboard: ${dashboardId}`);

    // Validar dados do widget
    const validatedData = WidgetSchema.parse(req.body);

    const result = await dashboardBuilderService.addWidget(
      tenantId,
      dashboardId,
      validatedData
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Widget adicionado: ${result.data.id}`);
    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error adding widget:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados do widget inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao adicionar widget'
      });
    }
  }
});

// PUT /api/dashboards/:dashboardId/widgets/:widgetId - Atualizar widget
router.put('/:dashboardId/widgets/:widgetId', async (req: any, res) => {
  try {
    const { dashboardId, widgetId } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se widget existe
    const existing = await db
      .select()
      .from(dashboardWidgets)
      .leftJoin(customDashboards, eq(customDashboards.id, dashboardWidgets.dashboardId))
      .where(and(
        eq(dashboardWidgets.id, widgetId),
        eq(dashboardWidgets.dashboardId, dashboardId),
        eq(customDashboards.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Widget não encontrado'
      });
    }

    // Validar dados
    const validatedData = WidgetSchema.partial().parse(req.body);

    // Atualizar widget
    const updated = await db
      .update(dashboardWidgets)
      .set({
        ...validatedData,
        position: validatedData.position as any,
        dataSource: validatedData.dataSource as any,
        config: validatedData.config as any,
        styling: validatedData.styling as any,
        updatedAt: new Date(),
      })
      .where(eq(dashboardWidgets.id, widgetId))
      .returning();

    console.log(`🧩 Widget atualizado: ${widgetId}`);
    res.json({
      success: true,
      data: updated[0],
      message: 'Widget atualizado com sucesso'
    });

  } catch (error) {
    console.error('Error updating widget:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao atualizar widget'
      });
    }
  }
});

// DELETE /api/dashboards/:dashboardId/widgets/:widgetId - Deletar widget
router.delete('/:dashboardId/widgets/:widgetId', async (req: any, res) => {
  try {
    const { dashboardId, widgetId } = req.params;
    const tenantId = req.tenant.id;

    // Verificar se widget existe
    const existing = await db
      .select()
      .from(dashboardWidgets)
      .leftJoin(customDashboards, eq(customDashboards.id, dashboardWidgets.dashboardId))
      .where(and(
        eq(dashboardWidgets.id, widgetId),
        eq(dashboardWidgets.dashboardId, dashboardId),
        eq(customDashboards.tenantId, tenantId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Widget não encontrado'
      });
    }

    // Marcar como inativo
    await db
      .update(dashboardWidgets)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(dashboardWidgets.id, widgetId));

    console.log(`🗑️ Widget deletado: ${widgetId}`);
    res.json({
      success: true,
      message: 'Widget removido com sucesso'
    });

  } catch (error) {
    console.error('Error deleting widget:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao deletar widget'
    });
  }
});

// ==========================================
// DATA PROCESSING - PROCESSAMENTO DE DADOS
// ==========================================

// GET /api/dashboards/widgets/:widgetId/data - Obter dados do widget
router.get('/widgets/:widgetId/data', async (req: any, res) => {
  try {
    const { widgetId } = req.params;
    const { refresh = 'false' } = req.query;
    const tenantId = req.tenant.id;
    const forceRefresh = refresh === 'true';

    console.log(`📊 Processando dados do widget: ${widgetId} (refresh: ${forceRefresh})`);

    const result = await dashboardBuilderService.processWidgetData(
      tenantId,
      widgetId,
      forceRefresh
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error processing widget data:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao processar dados do widget'
    });
  }
});

// POST /api/dashboards/widgets/:widgetId/refresh - Forçar refresh dos dados
router.post('/widgets/:widgetId/refresh', async (req: any, res) => {
  try {
    const { widgetId } = req.params;
    const tenantId = req.tenant.id;

    console.log(`🔄 Refresh forçado do widget: ${widgetId}`);

    const result = await dashboardBuilderService.processWidgetData(
      tenantId,
      widgetId,
      true // Force refresh
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      metadata: result.metadata,
      message: 'Dados do widget atualizados com sucesso'
    });

  } catch (error) {
    console.error('Error refreshing widget data:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao atualizar dados do widget'
    });
  }
});

// ==========================================
// TEMPLATES - GESTÃO DE TEMPLATES
// ==========================================

// POST /api/dashboards/templates - Criar dashboard a partir de template
router.post('/templates', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;

    console.log(`📋 Criando dashboard a partir de template - User: ${userId}`);

    // Validar template
    const validatedTemplate = DashboardTemplateSchema.parse(req.body);

    const result = await dashboardBuilderService.createFromTemplate(
      tenantId,
      userId,
      validatedTemplate
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Dashboard criado a partir de template: ${result.data.dashboard.id}`);
    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });

  } catch (error) {
    console.error('Error creating dashboard from template:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Template inválido',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao criar dashboard a partir do template'
      });
    }
  }
});

// GET /api/dashboards/templates/presets - Obter templates pré-definidos
router.get('/templates/presets', async (req: any, res) => {
  try {
    // Templates empresariais pré-definidos
    const presetTemplates = [
      {
        id: 'business_overview',
        name: 'Visão Geral de Negócios',
        description: 'Dashboard executivo com métricas principais de vendas, clientes e performance',
        category: 'business',
        preview: '/assets/templates/business_overview.png',
        widgets: [
          {
            title: 'Receita Total',
            type: 'kpi',
            position: { x: 0, y: 0, width: 3, height: 2 },
            dataSource: { type: 'static', staticData: [{ value: 125000, change: 15.2 }] },
            config: { format: 'currency', showTrend: true }
          },
          {
            title: 'Novos Clientes',
            type: 'kpi',
            position: { x: 3, y: 0, width: 3, height: 2 },
            dataSource: { type: 'static', staticData: [{ value: 45, change: 8.5 }] },
            config: { format: 'number', showTrend: true }
          },
          {
            title: 'Vendas por Mês',
            type: 'chart_line',
            position: { x: 0, y: 2, width: 6, height: 4 },
            dataSource: { type: 'static', staticData: [] },
            config: { xAxis: 'month', yAxis: 'sales' }
          }
        ]
      },
      {
        id: 'financial_dashboard',
        name: 'Dashboard Financeiro',
        description: 'Análise financeira completa com fluxo de caixa e projeções',
        category: 'financial',
        preview: '/assets/templates/financial_dashboard.png',
        widgets: [
          {
            title: 'Fluxo de Caixa',
            type: 'chart_area',
            position: { x: 0, y: 0, width: 8, height: 4 },
            dataSource: { type: 'static', staticData: [] },
            config: { showArea: true, colors: ['#10b981', '#ef4444'] }
          },
          {
            title: 'Margem de Lucro',
            type: 'gauge',
            position: { x: 8, y: 0, width: 4, height: 4 },
            dataSource: { type: 'static', staticData: [{ value: 23.5, target: 25 }] },
            config: { min: 0, max: 50, unit: '%' }
          }
        ]
      },
      {
        id: 'technical_metrics',
        name: 'Métricas Técnicas',
        description: 'Dashboard para acompanhamento de sistemas e performance técnica',
        category: 'technical',
        preview: '/assets/templates/technical_metrics.png',
        widgets: [
          {
            title: 'Uptime do Sistema',
            type: 'progress',
            position: { x: 0, y: 0, width: 6, height: 2 },
            dataSource: { type: 'static', staticData: [{ value: 99.9, target: 99.5 }] },
            config: { unit: '%', color: '#10b981' }
          },
          {
            title: 'Response Time',
            type: 'chart_line',
            position: { x: 0, y: 2, width: 12, height: 4 },
            dataSource: { type: 'static', staticData: [] },
            config: { yAxis: 'response_time', unit: 'ms' }
          }
        ]
      },
      {
        id: 'marketing_analytics',
        name: 'Analytics de Marketing',
        description: 'Métricas de campanhas, conversões e ROI de marketing',
        category: 'marketing',
        preview: '/assets/templates/marketing_analytics.png',
        widgets: [
          {
            title: 'ROI das Campanhas',
            type: 'chart_bar',
            position: { x: 0, y: 0, width: 8, height: 4 },
            dataSource: { type: 'static', staticData: [] },
            config: { xAxis: 'campaign', yAxis: 'roi' }
          },
          {
            title: 'Taxa de Conversão',
            type: 'kpi',
            position: { x: 8, y: 0, width: 4, height: 2 },
            dataSource: { type: 'static', staticData: [{ value: 3.2, change: 0.5 }] },
            config: { format: 'percentage', showTrend: true }
          }
        ]
      },
      {
        id: 'hr_dashboard',
        name: 'Dashboard de RH',
        description: 'Métricas de recursos humanos, satisfação e performance da equipe',
        category: 'hr',
        preview: '/assets/templates/hr_dashboard.png',
        widgets: [
          {
            title: 'Satisfação da Equipe',
            type: 'gauge',
            position: { x: 0, y: 0, width: 4, height: 3 },
            dataSource: { type: 'static', staticData: [{ value: 8.5, target: 9.0 }] },
            config: { min: 0, max: 10, unit: '/10' }
          },
          {
            title: 'Turnover Rate',
            type: 'kpi',
            position: { x: 4, y: 0, width: 4, height: 2 },
            dataSource: { type: 'static', staticData: [{ value: 12.5, change: -2.1 }] },
            config: { format: 'percentage', showTrend: true }
          }
        ]
      }
    ];

    res.json({
      success: true,
      data: presetTemplates,
      total: presetTemplates.length
    });

  } catch (error) {
    console.error('Error fetching preset templates:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar templates pré-definidos'
    });
  }
});

export { router as dashboardBuilderRoutes };