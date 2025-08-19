/**
 * WORKFLOW ↔ DASHBOARD INTEGRATION ROUTES - Sistema completo de integração
 * Dashboards criados e atualizados automaticamente por workflows
 * Sistema core para análise dinâmica de dados empresariais
 */

import express from 'express';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  visualWorkflows,
  workflowNodes,
  visualWorkflowExecutions,
  nodeExecutions,
  dashboards,
  dashboardWidgets,
  savedQueries,
  kpiDashboards,
  users,
  notifications
} from '../shared/schema';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// WORKFLOW → DASHBOARD CREATION & UPDATE
// ==========================================

const WorkflowDashboardCreationSchema = z.object({
  workflowId: z.string(),
  nodeId: z.string(),
  dashboardConfig: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    layout: z.enum(['grid', 'masonry', 'flex']).default('grid'),
    isPublic: z.boolean().default(false),
    refreshInterval: z.number().min(30).max(86400).default(300), // 5 min a 24h
    widgets: z.array(z.object({
      id: z.string(),
      type: z.enum(['chart', 'kpi', 'table', 'gauge', 'progress', 'counter', 'text', 'image']),
      title: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        w: z.number(),
        h: z.number()
      }),
      dataSource: z.object({
        type: z.enum(['query', 'api', 'webhook', 'static']),
        source: z.string(),
        params: z.record(z.any()).optional()
      }),
      visualization: z.object({
        chartType: z.enum(['line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'radar']).optional(),
        color: z.string().optional(),
        theme: z.string().optional(),
        showLegend: z.boolean().default(true),
        showTooltip: z.boolean().default(true)
      }).optional(),
      formatting: z.object({
        numberFormat: z.string().optional(),
        dateFormat: z.string().optional(),
        decimals: z.number().optional(),
        prefix: z.string().optional(),
        suffix: z.string().optional()
      }).optional()
    }))
  })
});

// POST /api/workflow-dashboard-integration/create-dashboard - Criar dashboard via workflow
router.post('/create-dashboard', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📊 Criando dashboard em workflow - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = WorkflowDashboardCreationSchema.parse(req.body);
    
    // Criar dashboard
    const dashboardId = nanoid();
    
    const dashboard = await db.insert(dashboards).values({
      id: dashboardId,
      tenantId,
      userId,
      name: validatedData.dashboardConfig.name,
      description: validatedData.dashboardConfig.description || '',
      category: validatedData.dashboardConfig.category || 'workflow_generated',
      layout: validatedData.dashboardConfig.layout,
      isPublic: validatedData.dashboardConfig.isPublic,
      refreshInterval: validatedData.dashboardConfig.refreshInterval,
      settings: {
        createdByWorkflow: true,
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        autoRefresh: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Criar widgets do dashboard
    const widgetPromises = validatedData.dashboardConfig.widgets.map(async (widget) => {
      return db.insert(dashboardWidgets).values({
        id: widget.id,
        dashboardId,
        tenantId,
        type: widget.type,
        title: widget.title,
        position: widget.position,
        dataSource: widget.dataSource,
        visualization: widget.visualization || {},
        formatting: widget.formatting || {},
        config: {
          createdByWorkflow: true,
          workflowId: validatedData.workflowId
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    await Promise.all(widgetPromises);
    
    // Registrar execução do node
    const nodeExecutionId = nanoid();
    await db.insert(nodeExecutions).values({
      id: nodeExecutionId,
      workflowExecutionId: validatedData.workflowId,
      nodeId: validatedData.nodeId,
      nodeType: 'dashboard_creation',
      status: 'completed',
      input: validatedData.dashboardConfig,
      output: { 
        dashboardId,
        widgetsCreated: validatedData.dashboardConfig.widgets.length
      },
      executedAt: new Date(),
      completedAt: new Date(),
      tenantId
    });
    
    res.status(201).json({
      success: true,
      data: {
        dashboard: dashboard[0],
        nodeExecutionId,
        widgetsCreated: validatedData.dashboardConfig.widgets.length
      },
      metadata: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        tenantId,
        createdBy: userId
      },
      message: 'Dashboard criado com sucesso no workflow'
    });
    
  } catch (error: any) {
    console.error('Error creating workflow dashboard:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Configuração de dashboard inválida',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'creation_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno na criação do dashboard',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// WORKFLOW → DASHBOARD UPDATE & REFRESH
// ==========================================

const WorkflowDashboardUpdateSchema = z.object({
  workflowId: z.string(),
  nodeId: z.string(),
  dashboardId: z.string(),
  updateConfig: z.object({
    updateType: z.enum(['refresh_data', 'add_widget', 'update_widget', 'remove_widget', 'update_layout']),
    widgetUpdates: z.array(z.object({
      widgetId: z.string(),
      newData: z.any().optional(),
      newConfig: z.any().optional(),
      action: z.enum(['update', 'replace', 'delete']).optional()
    })).optional(),
    newWidgets: z.array(z.any()).optional(),
    layoutChanges: z.any().optional()
  })
});

// POST /api/workflow-dashboard-integration/update-dashboard - Atualizar dashboard via workflow
router.post('/update-dashboard', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🔄 Atualizando dashboard em workflow - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = WorkflowDashboardUpdateSchema.parse(req.body);
    
    // Verificar se dashboard existe
    const dashboard = await db
      .select()
      .from(dashboards)
      .where(and(
        eq(dashboards.id, validatedData.dashboardId),
        eq(dashboards.tenantId, tenantId)
      ))
      .limit(1);
    
    if (dashboard.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard não encontrado',
        type: 'dashboard_not_found'
      });
    }
    
    let updatedWidgets = 0;
    let addedWidgets = 0;
    let removedWidgets = 0;
    
    // Processar atualizações de widgets existentes
    if (validatedData.updateConfig.widgetUpdates) {
      for (const widgetUpdate of validatedData.updateConfig.widgetUpdates) {
        if (widgetUpdate.action === 'delete') {
          await db
            .delete(dashboardWidgets)
            .where(and(
              eq(dashboardWidgets.id, widgetUpdate.widgetId),
              eq(dashboardWidgets.dashboardId, validatedData.dashboardId)
            ));
          removedWidgets++;
        } else {
          const updateData: any = {
            updatedAt: new Date()
          };
          
          if (widgetUpdate.newData) {
            updateData.data = widgetUpdate.newData;
          }
          
          if (widgetUpdate.newConfig) {
            updateData.config = widgetUpdate.newConfig;
          }
          
          await db
            .update(dashboardWidgets)
            .set(updateData)
            .where(and(
              eq(dashboardWidgets.id, widgetUpdate.widgetId),
              eq(dashboardWidgets.dashboardId, validatedData.dashboardId)
            ));
          updatedWidgets++;
        }
      }
    }
    
    // Adicionar novos widgets
    if (validatedData.updateConfig.newWidgets) {
      const newWidgetPromises = validatedData.updateConfig.newWidgets.map(async (widget: any) => {
        return db.insert(dashboardWidgets).values({
          id: widget.id || nanoid(),
          dashboardId: validatedData.dashboardId,
          tenantId,
          type: widget.type,
          title: widget.title,
          position: widget.position,
          dataSource: widget.dataSource,
          visualization: widget.visualization || {},
          formatting: widget.formatting || {},
          config: {
            createdByWorkflow: true,
            workflowId: validatedData.workflowId,
            addedByUpdate: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
      
      await Promise.all(newWidgetPromises);
      addedWidgets = validatedData.updateConfig.newWidgets.length;
    }
    
    // Atualizar dashboard
    await db
      .update(dashboards)
      .set({
        updatedAt: new Date(),
        settings: {
          ...dashboard[0].settings as any,
          lastWorkflowUpdate: new Date(),
          lastUpdateType: validatedData.updateConfig.updateType
        }
      })
      .where(eq(dashboards.id, validatedData.dashboardId));
    
    // Registrar execução do node
    const nodeExecutionId = nanoid();
    await db.insert(nodeExecutions).values({
      id: nodeExecutionId,
      workflowExecutionId: validatedData.workflowId,
      nodeId: validatedData.nodeId,
      nodeType: 'dashboard_update',
      status: 'completed',
      input: validatedData.updateConfig,
      output: { 
        dashboardId: validatedData.dashboardId,
        updatedWidgets,
        addedWidgets,
        removedWidgets,
        updateType: validatedData.updateConfig.updateType
      },
      executedAt: new Date(),
      completedAt: new Date(),
      tenantId
    });
    
    res.json({
      success: true,
      data: {
        dashboardId: validatedData.dashboardId,
        nodeExecutionId,
        updatedWidgets,
        addedWidgets,
        removedWidgets,
        updateType: validatedData.updateConfig.updateType
      },
      metadata: {
        workflowId: validatedData.workflowId,
        nodeId: validatedData.nodeId,
        tenantId,
        updatedBy: userId
      },
      message: `Dashboard atualizado: ${updatedWidgets} widgets atualizados, ${addedWidgets} adicionados, ${removedWidgets} removidos`
    });
    
  } catch (error: any) {
    console.error('Error updating workflow dashboard:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Configuração de atualização inválida',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'update_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno na atualização do dashboard',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// DASHBOARD DATA AUTO-REFRESH FROM WORKFLOWS
// ==========================================

// POST /api/workflow-dashboard-integration/refresh-dashboard-data - Atualizar dados do dashboard
router.post('/refresh-dashboard-data', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    const { dashboardId, workflowId, nodeId, refreshMode = 'all' } = req.body;
    
    console.log(`🔄 Atualizando dados do dashboard - Dashboard: ${dashboardId}, User: ${userId}`);
    
    // Buscar dashboard e widgets
    const dashboard = await db
      .select()
      .from(dashboards)
      .where(and(
        eq(dashboards.id, dashboardId),
        eq(dashboards.tenantId, tenantId)
      ))
      .limit(1);
    
    if (dashboard.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard não encontrado'
      });
    }
    
    // Buscar widgets do dashboard
    const widgets = await db
      .select()
      .from(dashboardWidgets)
      .where(eq(dashboardWidgets.dashboardId, dashboardId));
    
    const refreshResults = [];
    
    // Atualizar dados de cada widget
    for (const widget of widgets) {
      try {
        const dataSource = widget.dataSource as any;
        let newData = null;
        
        // Buscar dados baseado no tipo de fonte
        switch (dataSource.type) {
          case 'query':
            // Executar query TQL
            const queryResult = await executeQueryForWidget(dataSource.source, tenantId);
            newData = queryResult;
            break;
            
          case 'api':
            // Fazer chamada para API
            const apiResult = await fetchAPIDataForWidget(dataSource.source, dataSource.params);
            newData = apiResult;
            break;
            
          case 'webhook':
            // Buscar dados mais recentes do webhook
            const webhookResult = await getLatestWebhookData(dataSource.source, tenantId);
            newData = webhookResult;
            break;
            
          case 'static':
            // Dados estáticos - não precisam atualização
            newData = dataSource.data || null;
            break;
            
          default:
            console.warn(`Tipo de data source não suportado: ${dataSource.type}`);
            continue;
        }
        
        // Atualizar widget com novos dados
        await db
          .update(dashboardWidgets)
          .set({
            data: newData,
            updatedAt: new Date(),
            config: {
              ...(widget.config as any || {}),
              lastRefresh: new Date(),
              refreshedByWorkflow: workflowId
            }
          })
          .where(eq(dashboardWidgets.id, widget.id));
        
        refreshResults.push({
          widgetId: widget.id,
          widgetTitle: widget.title,
          success: true,
          dataPoints: Array.isArray(newData) ? newData.length : 1
        });
        
      } catch (widgetError: any) {
        console.error(`Error refreshing widget ${widget.id}:`, widgetError);
        
        refreshResults.push({
          widgetId: widget.id,
          widgetTitle: widget.title,
          success: false,
          error: widgetError.message
        });
      }
    }
    
    // Atualizar timestamp do dashboard
    await db
      .update(dashboards)
      .set({
        updatedAt: new Date(),
        settings: {
          ...dashboard[0].settings as any,
          lastDataRefresh: new Date(),
          refreshedByWorkflow: workflowId
        }
      })
      .where(eq(dashboards.id, dashboardId));
    
    // Registrar execução se workflow fornecido
    if (workflowId && nodeId) {
      const nodeExecutionId = nanoid();
      await db.insert(nodeExecutions).values({
        id: nodeExecutionId,
        workflowExecutionId: workflowId,
        nodeId,
        nodeType: 'dashboard_refresh',
        status: 'completed',
        input: { dashboardId, refreshMode },
        output: { 
          refreshResults,
          successfulRefreshes: refreshResults.filter(r => r.success).length,
          failedRefreshes: refreshResults.filter(r => !r.success).length
        },
        executedAt: new Date(),
        completedAt: new Date(),
        tenantId
      });
    }
    
    const successCount = refreshResults.filter(r => r.success).length;
    const failureCount = refreshResults.filter(r => !r.success).length;
    
    res.json({
      success: true,
      data: {
        dashboardId,
        refreshResults,
        summary: {
          totalWidgets: widgets.length,
          successfulRefreshes: successCount,
          failedRefreshes: failureCount
        }
      },
      message: `Dashboard atualizado: ${successCount} widgets atualizados com sucesso, ${failureCount} falharam`
    });
    
  } catch (error: any) {
    console.error('Error refreshing dashboard data:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'refresh_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno na atualização dos dados',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// DASHBOARD MANAGEMENT FOR WORKFLOWS
// ==========================================

// GET /api/workflow-dashboard-integration/workflow-dashboards/:workflowId - Listar dashboards de um workflow
router.get('/workflow-dashboards/:workflowId', async (req: any, res) => {
  try {
    const { workflowId } = req.params;
    const tenantId = req.tenant.id;
    
    const workflowDashboards = await db
      .select({
        dashboard: {
          id: dashboards.id,
          name: dashboards.name,
          description: dashboards.description,
          category: dashboards.category,
          isPublic: dashboards.isPublic,
          createdAt: dashboards.createdAt,
          updatedAt: dashboards.updatedAt
        },
        widgetCount: sql<number>`COUNT(${dashboardWidgets.id})`.as('widget_count')
      })
      .from(dashboards)
      .leftJoin(dashboardWidgets, eq(dashboardWidgets.dashboardId, dashboards.id))
      .where(and(
        eq(dashboards.tenantId, tenantId),
        sql`${dashboards.settings}->>'workflowId' = ${workflowId}`
      ))
      .groupBy(dashboards.id)
      .orderBy(desc(dashboards.updatedAt));
    
    res.json({
      success: true,
      data: workflowDashboards,
      total: workflowDashboards.length,
      metadata: {
        workflowId,
        tenantId
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching workflow dashboards:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'database_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Falha ao buscar dashboards do workflow',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Executar query TQL para widget
async function executeQueryForWidget(queryId: string, tenantId: string): Promise<any> {
  try {
    // Buscar query salva
    const savedQuery = await db
      .select()
      .from(savedQueries)
      .where(and(
        eq(savedQueries.id, queryId),
        eq(savedQueries.tenantId, tenantId)
      ))
      .limit(1);
    
    if (savedQuery.length === 0) {
      throw new Error('Query não encontrada');
    }
    
    // Importar generateSQL e executar
    const { generateSQL } = require('./queryBuilderRoutes');
    const { storage } = require('./storage');
    
    const sql = generateSQL(savedQuery[0].queryConfig, tenantId);
    const results = await storage.executeRawQuery(sql, tenantId);
    
    return results;
    
  } catch (error: any) {
    console.error('Error executing query for widget:', error);
    throw error;
  }
}

// Buscar dados de API para widget
async function fetchAPIDataForWidget(apiConnectionId: string, params: any = {}): Promise<any> {
  try {
    // Aqui você integraria com o sistema de API connections
    // Por enquanto, retornar dados mock
    return {
      status: 'success',
      data: [],
      timestamp: new Date(),
      source: 'api_connection',
      connectionId: apiConnectionId
    };
    
  } catch (error: any) {
    console.error('Error fetching API data for widget:', error);
    throw error;
  }
}

// Buscar dados mais recentes de webhook
async function getLatestWebhookData(webhookId: string, tenantId: string): Promise<any> {
  try {
    // Aqui você integraria com o sistema de webhook connections
    // Por enquanto, retornar dados mock
    return {
      status: 'success',
      data: [],
      timestamp: new Date(),
      source: 'webhook',
      webhookId
    };
    
  } catch (error: any) {
    console.error('Error getting webhook data for widget:', error);
    throw error;
  }
}

export { router as workflowDashboardIntegrationRoutes };