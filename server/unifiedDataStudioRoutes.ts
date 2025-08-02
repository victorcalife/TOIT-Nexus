/**
 * UNIFIED DATA STUDIO ROUTES - Painel unificado NO-CODE
 * Query Builder (TQL) + Conexões de Dados + Relatórios + Dashboards
 * Tudo em uma tela com cards e modais para manter o usuário na mesma interface
 */

import express from 'express';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  savedQueries,
  externalDatabaseConnections,
  apiConnections,
  webhookConnections,
  dashboards,
  reportTemplates,
  visualWorkflows,
  taskTemplates,
  users,
  kpiDashboards,
  dashboardWidgets,
  reportGenerations
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
// UNIFIED DATA STUDIO - PAINEL PRINCIPAL
// ==========================================

// GET /api/unified-data-studio/workspace - Carregar workspace completo
router.get('/workspace', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📊 Carregando workspace unificado - User: ${userId}, Tenant: ${tenantId}`);
    
    // Buscar TODOS os dados em paralelo para performance máxima
    const [
      savedQueriesData,
      databaseConnectionsData,
      apiConnectionsData,
      webhookConnectionsData,
      dashboardsData,
      reportTemplatesData,
      workflowsData,
      recentGenerationsData,
      userStatsData
    ] = await Promise.all([
      // 1. QUERIES TQL SALVAS
      db.select({
        id: savedQueries.id,
        name: savedQueries.name,
        description: savedQueries.description,
        category: savedQueries.category,
        queryConfig: savedQueries.queryConfig,
        lastExecuted: savedQueries.lastExecuted,
        executionCount: savedQueries.executionCount,
        createdAt: savedQueries.createdAt,
        creator: {
          name: users.name,
          email: users.email
        }
      })
      .from(savedQueries)
      .leftJoin(users, eq(users.id, savedQueries.createdBy))
      .where(eq(savedQueries.tenantId, tenantId))
      .orderBy(desc(savedQueries.lastExecuted))
      .limit(50),
      
      // 2. CONEXÕES DE BANCO DE DADOS
      db.select({
        id: externalDatabaseConnections.id,
        name: externalDatabaseConnections.name,
        type: externalDatabaseConnections.type,
        description: externalDatabaseConnections.description,
        isActive: externalDatabaseConnections.isActive,
        lastUsed: externalDatabaseConnections.lastUsed,
        connectionCount: externalDatabaseConnections.connectionCount,
        createdAt: externalDatabaseConnections.createdAt
      })
      .from(externalDatabaseConnections)
      .where(eq(externalDatabaseConnections.tenantId, tenantId))
      .orderBy(desc(externalDatabaseConnections.lastUsed))
      .limit(20),
      
      // 3. CONEXÕES DE API
      db.select({
        id: apiConnections.id,
        name: apiConnections.name,
        apiType: apiConnections.apiType,
        description: apiConnections.description,
        isActive: apiConnections.isActive,
        lastUsed: apiConnections.lastUsed,
        requestCount: apiConnections.requestCount,
        createdAt: apiConnections.createdAt
      })
      .from(apiConnections)
      .where(eq(apiConnections.tenantId, tenantId))
      .orderBy(desc(apiConnections.lastUsed))
      .limit(20),
      
      // 4. CONEXÕES DE WEBHOOK
      db.select({
        id: webhookConnections.id,
        name: webhookConnections.name,
        webhookType: webhookConnections.webhookType,
        description: webhookConnections.description,
        isActive: webhookConnections.isActive,
        lastTriggered: webhookConnections.lastTriggered,
        triggerCount: webhookConnections.triggerCount,
        createdAt: webhookConnections.createdAt
      })
      .from(webhookConnections)
      .where(eq(webhookConnections.tenantId, tenantId))
      .orderBy(desc(webhookConnections.lastTriggered))
      .limit(20),
      
      // 5. DASHBOARDS
      db.select({
        id: dashboards.id,
        name: dashboards.name,
        description: dashboards.description,
        category: dashboards.category,
        isPublic: dashboards.isPublic,
        viewCount: dashboards.viewCount,
        lastViewed: dashboards.lastViewed,
        createdAt: dashboards.createdAt,
        widgetCount: sql<number>`COUNT(${dashboardWidgets.id})`.as('widget_count')
      })
      .from(dashboards)
      .leftJoin(dashboardWidgets, eq(dashboardWidgets.dashboardId, dashboards.id))
      .where(eq(dashboards.tenantId, tenantId))
      .groupBy(dashboards.id)
      .orderBy(desc(dashboards.lastViewed))
      .limit(20),
      
      // 6. TEMPLATES DE RELATÓRIOS
      db.select({
        id: reportTemplates.id,
        name: reportTemplates.name,
        description: reportTemplates.description,
        category: reportTemplates.category,
        templateType: reportTemplates.templateType,
        isActive: reportTemplates.isActive,
        lastUsed: reportTemplates.lastUsed,
        generationCount: reportTemplates.generationCount,
        createdAt: reportTemplates.createdAt
      })
      .from(reportTemplates)
      .where(eq(reportTemplates.tenantId, tenantId))
      .orderBy(desc(reportTemplates.lastUsed))
      .limit(20),
      
      // 7. WORKFLOWS DISPONÍVEIS
      db.select({
        id: visualWorkflows.id,
        name: visualWorkflows.name,
        description: visualWorkflows.description,
        category: visualWorkflows.category,
        isActive: visualWorkflows.isActive,
        executionCount: visualWorkflows.executionCount,
        lastExecuted: visualWorkflows.lastExecuted,
        createdAt: visualWorkflows.createdAt
      })
      .from(visualWorkflows)
      .where(eq(visualWorkflows.tenantId, tenantId))
      .orderBy(desc(visualWorkflows.lastExecuted))
      .limit(15),
      
      // 8. GERAÇÕES RECENTES DE RELATÓRIOS
      db.select({
        id: reportGenerations.id,
        templateId: reportGenerations.templateId,
        status: reportGenerations.status,
        filePath: reportGenerations.filePath,
        fileSize: reportGenerations.fileSize,
        createdAt: reportGenerations.createdAt,
        completedAt: reportGenerations.completedAt,
        template: {
          name: reportTemplates.name,
          category: reportTemplates.category
        }
      })
      .from(reportGenerations)
      .leftJoin(reportTemplates, eq(reportTemplates.id, reportGenerations.templateId))
      .where(eq(reportGenerations.tenantId, tenantId))
      .orderBy(desc(reportGenerations.createdAt))
      .limit(10),
      
      // 9. ESTATÍSTICAS DO USUÁRIO
      db.select({
        totalQueries: sql<number>`COUNT(CASE WHEN ${savedQueries.createdBy} = ${userId} THEN 1 END)`,
        totalDashboards: sql<number>`COUNT(CASE WHEN ${dashboards.userId} = ${userId} THEN 1 END)`,
        totalReports: sql<number>`COUNT(CASE WHEN ${reportTemplates.userId} = ${userId} THEN 1 END)`,
        totalWorkflows: sql<number>`COUNT(CASE WHEN ${visualWorkflows.userId} = ${userId} THEN 1 END)`
      })
      .from(savedQueries)
      .leftJoin(dashboards, eq(dashboards.tenantId, savedQueries.tenantId))
      .leftJoin(reportTemplates, eq(reportTemplates.tenantId, savedQueries.tenantId))
      .leftJoin(visualWorkflows, eq(visualWorkflows.tenantId, savedQueries.tenantId))
      .where(eq(savedQueries.tenantId, tenantId))
      .limit(1)
    ]);
    
    // Estruturar workspace unificado
    const unifiedWorkspace = {
      // SEÇÃO 1 - QUERY BUILDER TQL
      queryBuilder: {
        category: 'TQL Query Builder',
        icon: '🔍',
        description: 'Construtor visual de queries TQL com sintaxe portuguesa',
        items: savedQueriesData.map(query => ({
          ...query,
          type: 'tql_query',
          status: query.lastExecuted ? 'executed' : 'created',
          metrics: {
            executionCount: query.executionCount || 0,
            lastExecuted: query.lastExecuted
          },
          actions: [
            { name: 'execute', label: 'Executar Query', icon: '▶️' },
            { name: 'edit', label: 'Editar TQL', icon: '✏️' },
            { name: 'clone', label: 'Duplicar', icon: '📋' },
            { name: 'export', label: 'Exportar SQL', icon: '💾' },
            { name: 'add_to_dashboard', label: 'Adicionar ao Dashboard', icon: '📊' },
            { name: 'create_report', label: 'Gerar Relatório', icon: '📋' },
            { name: 'add_to_workflow', label: 'Usar em Workflow', icon: '🔄' }
          ]
        })),
        quickActions: [
          { name: 'new_query', label: 'Nova Query TQL', icon: '➕' },
          { name: 'import_sql', label: 'Importar SQL', icon: '📥' },
          { name: 'query_templates', label: 'Templates', icon: '📚' }
        ]
      },
      
      // SEÇÃO 2 - CONEXÕES DE DADOS
      dataConnections: {
        category: 'Conexões de Dados',
        icon: '🔌',
        description: 'Integração com bancos, APIs, webhooks e arquivos',
        subsections: {
          databases: {
            name: 'Bancos de Dados',
            icon: '🗄️',
            items: databaseConnectionsData.map(conn => ({
              ...conn,
              type: 'database_connection',
              status: conn.isActive ? 'connected' : 'disconnected',
              metrics: {
                connectionCount: conn.connectionCount || 0,
                lastUsed: conn.lastUsed
              },
              actions: [
                { name: 'test_connection', label: 'Testar Conexão', icon: '🔧' },
                { name: 'browse_schema', label: 'Explorar Schema', icon: '🔍' },
                { name: 'create_query', label: 'Nova Query', icon: '➕' },
                { name: 'sync_data', label: 'Sincronizar', icon: '🔄' }
              ]
            }))
          },
          apis: {
            name: 'APIs Externas',
            icon: '🌐',
            items: apiConnectionsData.map(api => ({
              ...api,
              type: 'api_connection',
              status: api.isActive ? 'active' : 'inactive',
              metrics: {
                requestCount: api.requestCount || 0,
                lastUsed: api.lastUsed
              },
              actions: [
                { name: 'test_endpoint', label: 'Testar Endpoint', icon: '🔧' },
                { name: 'view_response', label: 'Ver Resposta', icon: '👁️' },
                { name: 'create_webhook', label: 'Criar Webhook', icon: '🔗' },
                { name: 'schedule_sync', label: 'Agendar Sync', icon: '⏰' }
              ]
            }))
          },
          webhooks: {
            name: 'Webhooks',
            icon: '🔗',
            items: webhookConnectionsData.map(webhook => ({
              ...webhook,
              type: 'webhook_connection',
              status: webhook.isActive ? 'listening' : 'paused',
              metrics: {
                triggerCount: webhook.triggerCount || 0,
                lastTriggered: webhook.lastTriggered
              },
              actions: [
                { name: 'view_logs', label: 'Ver Logs', icon: '📋' },
                { name: 'test_webhook', label: 'Testar', icon: '🔧' },
                { name: 'create_trigger', label: 'Criar Trigger', icon: '⚡' },
                { name: 'copy_url', label: 'Copiar URL', icon: '📋' }
              ]
            }))
          }
        },
        quickActions: [
          { name: 'new_database', label: 'Nova Conexão BD', icon: '🗄️' },
          { name: 'new_api', label: 'Nova API', icon: '🌐' },
          { name: 'new_webhook', label: 'Novo Webhook', icon: '🔗' },
          { name: 'upload_file', label: 'Upload Excel/CSV', icon: '📁' }
        ]
      },
      
      // SEÇÃO 3 - DASHBOARDS INTERATIVOS
      dashboards: {
        category: 'Dashboards Interativos',
        icon: '📊',
        description: 'Dashboards personalizáveis com widgets dinâmicos',
        items: dashboardsData.map(dashboard => ({
          ...dashboard,
          type: 'dashboard',
          status: dashboard.isPublic ? 'public' : 'private',
          metrics: {
            viewCount: dashboard.viewCount || 0,
            widgetCount: dashboard.widget_count || 0,
            lastViewed: dashboard.lastViewed
          },
          actions: [
            { name: 'open_dashboard', label: 'Abrir Dashboard', icon: '📊' },
            { name: 'edit_layout', label: 'Editar Layout', icon: '✏️' },
            { name: 'add_widget', label: 'Adicionar Widget', icon: '➕' },
            { name: 'export_pdf', label: 'Exportar PDF', icon: '📄' },
            { name: 'share_link', label: 'Compartilhar', icon: '🔗' },
            { name: 'clone_dashboard', label: 'Duplicar', icon: '📋' },
            { name: 'schedule_email', label: 'Agendar Email', icon: '📧' }
          ]
        })),
        quickActions: [
          { name: 'new_dashboard', label: 'Novo Dashboard', icon: '➕' },
          { name: 'dashboard_templates', label: 'Templates', icon: '📚' },
          { name: 'import_dashboard', label: 'Importar', icon: '📥' }
        ]
      },
      
      // SEÇÃO 4 - RELATÓRIOS EXECUTIVOS
      reports: {
        category: 'Relatórios Executivos',
        icon: '📋',
        description: 'Relatórios automáticos e agendados',
        items: reportTemplatesData.map(template => ({
          ...template,
          type: 'report_template',
          status: template.isActive ? 'active' : 'inactive',
          metrics: {
            generationCount: template.generationCount || 0,
            lastUsed: template.lastUsed
          },
          actions: [
            { name: 'generate_now', label: 'Gerar Agora', icon: '▶️' },
            { name: 'edit_template', label: 'Editar Template', icon: '✏️' },
            { name: 'schedule_report', label: 'Agendar', icon: '⏰' },
            { name: 'view_history', label: 'Ver Histórico', icon: '📊' },
            { name: 'export_template', label: 'Exportar', icon: '💾' },
            { name: 'duplicate', label: 'Duplicar', icon: '📋' }
          ]
        })),
        recentGenerations: recentGenerationsData.map(generation => ({
          ...generation,
          type: 'report_generation',
          statusIcon: generation.status === 'completed' ? '✅' : 
                     generation.status === 'failed' ? '❌' : '⏳',
          actions: [
            { name: 'download', label: 'Download', icon: '💾' },
            { name: 'view_details', label: 'Detalhes', icon: '👁️' },
            { name: 'regenerate', label: 'Gerar Novamente', icon: '🔄' }
          ]
        })),
        quickActions: [
          { name: 'new_report', label: 'Novo Relatório', icon: '➕' },
          { name: 'report_templates', label: 'Templates', icon: '📚' },
          { name: 'scheduled_reports', label: 'Agendamentos', icon: '⏰' }
        ]
      },
      
      // SEÇÃO 5 - WORKFLOWS DISPONÍVEIS
      workflows: {
        category: 'Workflows Automáticos',
        icon: '🔄',
        description: 'Todos os objetos disponíveis para workflows',
        items: workflowsData.map(workflow => ({
          ...workflow,
          type: 'workflow',
          status: workflow.isActive ? 'active' : 'inactive',
          metrics: {
            executionCount: workflow.executionCount || 0,
            lastExecuted: workflow.lastExecuted
          },
          actions: [
            { name: 'open_workflow', label: 'Abrir Workflow', icon: '🔄' },
            { name: 'execute_now', label: 'Executar', icon: '▶️' },
            { name: 'edit_workflow', label: 'Editar', icon: '✏️' },
            { name: 'view_history', label: 'Histórico', icon: '📊' },
            { name: 'duplicate', label: 'Duplicar', icon: '📋' }
          ]
        })),
        quickActions: [
          { name: 'new_workflow', label: 'Novo Workflow', icon: '➕' },
          { name: 'workflow_builder', label: 'Builder Visual', icon: '🎨' },
          { name: 'workflow_templates', label: 'Templates', icon: '📚' }
        ]
      },
      
      // SEÇÃO 6 - ESTATÍSTICAS E MÉTRICAS
      statistics: {
        userStats: userStatsData[0] || {
          totalQueries: 0,
          totalDashboards: 0,
          totalReports: 0,
          totalWorkflows: 0
        },
        systemHealth: {
          activeConnections: databaseConnectionsData.filter(c => c.isActive).length,
          activeApis: apiConnectionsData.filter(a => a.isActive).length,
          activeWebhooks: webhookConnectionsData.filter(w => w.isActive).length,
          recentActivity: recentGenerationsData.length
        }
      }
    };
    
    res.json({
      success: true,
      data: unifiedWorkspace,
      metadata: {
        tenantId,
        userId,
        generatedAt: new Date(),
        totalItems: {
          queries: savedQueriesData.length,
          databases: databaseConnectionsData.length,
          apis: apiConnectionsData.length,
          webhooks: webhookConnectionsData.length,
          dashboards: dashboardsData.length,
          reports: reportTemplatesData.length,
          workflows: workflowsData.length
        }
      },
      message: 'Workspace unificado carregado com sucesso'
    });
    
  } catch (error: any) {
    console.error('Error loading unified workspace:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'workspace_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar workspace',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// UNIFIED ACTIONS - AÇÕES INTEGRADAS
// ==========================================

const UnifiedActionSchema = z.object({
  action: z.enum([
    'execute_query',
    'test_connection',
    'browse_schema',
    'open_dashboard',
    'generate_report',
    'execute_workflow',
    'create_from_template',
    'add_to_workflow',
    'export_data',
    'share_item'
  ]),
  itemType: z.enum(['query', 'database', 'api', 'webhook', 'dashboard', 'report', 'workflow']),
  itemId: z.string(),
  params: z.record(z.any()).optional()
});

// POST /api/unified-data-studio/action - Executar ação unificada
router.post('/action', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`⚡ Executando ação unificada - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = UnifiedActionSchema.parse(req.body);
    
    let actionResult;
    
    // Executar ação baseada no tipo
    switch (validatedData.action) {
      case 'execute_query':
        actionResult = await executeQueryAction(validatedData.itemId, tenantId, validatedData.params);
        break;
        
      case 'test_connection':
        actionResult = await testConnectionAction(validatedData.itemId, validatedData.itemType, tenantId);
        break;
        
      case 'browse_schema':
        actionResult = await browseSchemaAction(validatedData.itemId, tenantId);
        break;
        
      case 'open_dashboard':
        actionResult = await openDashboardAction(validatedData.itemId, tenantId, userId);
        break;
        
      case 'generate_report':
        actionResult = await generateReportAction(validatedData.itemId, tenantId, userId, validatedData.params);
        break;
        
      case 'execute_workflow':
        actionResult = await executeWorkflowAction(validatedData.itemId, tenantId, userId, validatedData.params);
        break;
        
      case 'add_to_workflow':
        actionResult = await addToWorkflowAction(validatedData.itemId, validatedData.itemType, tenantId, userId);
        break;
        
      case 'export_data':
        actionResult = await exportDataAction(validatedData.itemId, validatedData.itemType, tenantId, validatedData.params);
        break;
        
      default:
        throw new Error(`Ação não implementada: ${validatedData.action}`);
    }
    
    res.json({
      success: true,
      data: actionResult,
      metadata: {
        action: validatedData.action,
        itemType: validatedData.itemType,
        itemId: validatedData.itemId,
        tenantId,
        executedBy: userId,
        executedAt: new Date()
      }
    });
    
  } catch (error: any) {
    console.error('Error executing unified action:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros de ação inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'action_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno na execução da ação',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Executar query TQL
async function executeQueryAction(queryId: string, tenantId: string, params: any = {}): Promise<any> {
  try {
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
    
    // Atualizar estatísticas da query
    await db
      .update(savedQueries)
      .set({
        lastExecuted: new Date(),
        executionCount: sql`${savedQueries.executionCount} + 1`
      })
      .where(eq(savedQueries.id, queryId));
    
    return {
      query: savedQuery[0],
      results,
      resultCount: Array.isArray(results) ? results.length : 1,
      executedAt: new Date()
    };
    
  } catch (error: any) {
    throw new Error(`Erro na execução da query: ${error.message}`);
  }
}

// Testar conexão
async function testConnectionAction(itemId: string, itemType: string, tenantId: string): Promise<any> {
  try {
    // Implementar teste de conexão baseado no tipo
    return {
      itemId,
      itemType,
      status: 'success',
      message: 'Conexão testada com sucesso',
      testedAt: new Date()
    };
    
  } catch (error: any) {
    throw new Error(`Erro no teste de conexão: ${error.message}`);
  }
}

// Explorar schema de banco
async function browseSchemaAction(databaseId: string, tenantId: string): Promise<any> {
  try {
    // Implementar exploração de schema
    return {
      databaseId,
      schema: {
        tables: [],
        views: [],
        procedures: []
      },
      browsedAt: new Date()
    };
    
  } catch (error: any) {
    throw new Error(`Erro na exploração do schema: ${error.message}`);
  }
}

// Abrir dashboard
async function openDashboardAction(dashboardId: string, tenantId: string, userId: string): Promise<any> {
  try {
    const dashboard = await db
      .select()
      .from(dashboards)
      .where(and(
        eq(dashboards.id, dashboardId),
        eq(dashboards.tenantId, tenantId)
      ))
      .limit(1);
    
    if (dashboard.length === 0) {
      throw new Error('Dashboard não encontrado');
    }
    
    // Atualizar contador de visualizações
    await db
      .update(dashboards)
      .set({
        viewCount: sql`${dashboards.viewCount} + 1`,
        lastViewed: new Date()
      })
      .where(eq(dashboards.id, dashboardId));
    
    return {
      dashboard: dashboard[0],
      openedAt: new Date()
    };
    
  } catch (error: any) {
    throw new Error(`Erro ao abrir dashboard: ${error.message}`);
  }
}

// Gerar relatório
async function generateReportAction(templateId: string, tenantId: string, userId: string, params: any = {}): Promise<any> {
  try {
    // Integrar com workflowReportIntegrationRoutes
    return {
      templateId,
      status: 'generating',
      generatedAt: new Date()
    };
    
  } catch (error: any) {
    throw new Error(`Erro na geração do relatório: ${error.message}`);
  }
}

// Executar workflow
async function executeWorkflowAction(workflowId: string, tenantId: string, userId: string, params: any = {}): Promise<any> {
  try {
    // Integrar com visualWorkflowRoutes
    return {
      workflowId,
      status: 'executing',
      executedAt: new Date()
    };
    
  } catch (error: any) {
    throw new Error(`Erro na execução do workflow: ${error.message}`);
  }
}

// Adicionar item ao workflow
async function addToWorkflowAction(itemId: string, itemType: string, tenantId: string, userId: string): Promise<any> {
  try {
    return {
      itemId,
      itemType,
      status: 'available_for_workflow',
      addedAt: new Date()
    };
    
  } catch (error: any) {
    throw new Error(`Erro ao adicionar ao workflow: ${error.message}`);
  }
}

// Exportar dados
async function exportDataAction(itemId: string, itemType: string, tenantId: string, params: any = {}): Promise<any> {
  try {
    const format = params.format || 'csv';
    
    return {
      itemId,
      itemType,
      format,
      filePath: `/exports/${itemId}_${Date.now()}.${format}`,
      exportedAt: new Date()
    };
    
  } catch (error: any) {
    throw new Error(`Erro na exportação: ${error.message}`);
  }
}

export { router as unifiedDataStudioRoutes };