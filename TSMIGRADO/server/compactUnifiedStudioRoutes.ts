/**
 * COMPACT UNIFIED DATA STUDIO - Painel NO-CODE Compacto e Visual
 * Interface otimizada com carrossel, listas suspensas e popups
 * Mantém todos os objetos visíveis sem poluir a tela
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
  visualWorkflows
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
// COMPACT WORKSPACE - INTERFACE OTIMIZADA
// ==========================================

// GET /api/compact-studio/workspace - Workspace compacto com carrossel e cards
router.get('/workspace', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🎯 Carregando workspace compacto - User: ${userId}, Tenant: ${tenantId}`);
    
    // Buscar dados essenciais de forma otimizada (máximo 8 items por categoria)
    const [
      recentQueries,
      activeConnections,
      favoriteDashboards,
      activeReports,
      activeWorkflows
    ] = await Promise.all([
      // QUERIES TQL RECENTES (máximo 8)
      db.select({
        id: savedQueries.id,
        name: savedQueries.name,
        category: savedQueries.category,
        lastExecuted: savedQueries.lastExecuted,
        executionCount: savedQueries.executionCount
      })
      .from(savedQueries)
      .where(eq(savedQueries.tenantId, tenantId))
      .orderBy(desc(savedQueries.lastExecuted))
      .limit(8),
      
      // CONEXÕES ATIVAS (máximo 6)
      db.select({
        id: externalDatabaseConnections.id,
        name: externalDatabaseConnections.name,
        type: externalDatabaseConnections.type,
        isActive: externalDatabaseConnections.isActive,
        lastUsed: externalDatabaseConnections.lastUsed
      })
      .from(externalDatabaseConnections)
      .where(and(
        eq(externalDatabaseConnections.tenantId, tenantId),
        eq(externalDatabaseConnections.isActive, true)
      ))
      .orderBy(desc(externalDatabaseConnections.lastUsed))
      .limit(6),
      
      // DASHBOARDS FAVORITOS (máximo 6)
      db.select({
        id: dashboards.id,
        name: dashboards.name,
        category: dashboards.category,
        viewCount: dashboards.viewCount,
        lastViewed: dashboards.lastViewed
      })
      .from(dashboards)
      .where(eq(dashboards.tenantId, tenantId))
      .orderBy(desc(dashboards.lastViewed))
      .limit(6),
      
      // RELATÓRIOS ATIVOS (máximo 6)
      db.select({
        id: reportTemplates.id,
        name: reportTemplates.name,
        category: reportTemplates.category,
        templateType: reportTemplates.templateType,
        lastUsed: reportTemplates.lastUsed
      })
      .from(reportTemplates)
      .where(and(
        eq(reportTemplates.tenantId, tenantId),
        eq(reportTemplates.isActive, true)
      ))
      .orderBy(desc(reportTemplates.lastUsed))
      .limit(6),
      
      // WORKFLOWS ATIVOS (máximo 6)
      db.select({
        id: visualWorkflows.id,
        name: visualWorkflows.name,
        category: visualWorkflows.category,
        isActive: visualWorkflows.isActive,
        lastExecuted: visualWorkflows.lastExecuted
      })
      .from(visualWorkflows)
      .where(and(
        eq(visualWorkflows.tenantId, tenantId),
        eq(visualWorkflows.isActive, true)
      ))
      .orderBy(desc(visualWorkflows.lastExecuted))
      .limit(6)
    ]);
    
    // ESTRUTURA COMPACTA OTIMIZADA
    const compactWorkspace = {
      // SEÇÃO 1: CARROSSEL DE AÇÕES RÁPIDAS
      quickActions: {
        primary: [
          { id: 'new_query', label: 'Nova Query TQL', icon: '🔍', color: 'blue', shortcut: 'Ctrl+Q' },
          { id: 'new_dashboard', label: 'Novo Dashboard', icon: '📊', color: 'green', shortcut: 'Ctrl+D' },
          { id: 'new_report', label: 'Novo Relatório', icon: '📋', color: 'purple', shortcut: 'Ctrl+R' },
          { id: 'new_workflow', label: 'Novo Workflow', icon: '🔄', color: 'orange', shortcut: 'Ctrl+W' }
        ],
        secondary: [
          { id: 'connect_database', label: 'Conectar BD', icon: '🗄️', color: 'teal' },
          { id: 'connect_api', label: 'Conectar API', icon: '🌐', color: 'indigo' },
          { id: 'upload_file', label: 'Upload CSV/Excel', icon: '📁', color: 'gray' },
          { id: 'import_data', label: 'Importar Dados', icon: '📥', color: 'cyan' }
        ]
      },
      
      // SEÇÃO 2: CARROSSEL DE QUERIES TQL
      queryCarousel: {
        title: 'Queries TQL Recentes',
        icon: '🔍',
        viewAllAction: 'view_all_queries',
        items: recentQueries.map(q => ({
          id: q.id,
          title: q.name,
          subtitle: q.category || 'Query',
          badge: q.executionCount ? `${q.executionCount}x` : 'Nova',
          lastUsed: q.lastExecuted,
          actions: [
            { id: 'execute', label: 'Executar', icon: '▶️', primary: true },
            { id: 'edit', label: 'Editar', icon: '✏️' },
            { id: 'clone', label: 'Duplicar', icon: '📋' },
            { id: 'export', label: 'Exportar', icon: '💾' }
          ]
        }))
      },
      
      // SEÇÃO 3: CARROSSEL DE CONEXÕES
      connectionsCarousel: {
        title: 'Conexões de Dados',
        icon: '🔌',
        viewAllAction: 'view_all_connections',
        items: activeConnections.map(c => ({
          id: c.id,
          title: c.name,
          subtitle: c.type.toUpperCase(),
          badge: c.isActive ? 'Ativo' : 'Inativo',
          status: c.isActive ? 'success' : 'warning',
          lastUsed: c.lastUsed,
          actions: [
            { id: 'test', label: 'Testar', icon: '🔧', primary: true },
            { id: 'browse', label: 'Explorar', icon: '🔍' },
            { id: 'query', label: 'Nova Query', icon: '➕' },
            { id: 'sync', label: 'Sincronizar', icon: '🔄' }
          ]
        }))
      },
      
      // SEÇÃO 4: CARROSSEL DE DASHBOARDS
      dashboardCarousel: {
        title: 'Dashboards Favoritos',
        icon: '📊',
        viewAllAction: 'view_all_dashboards',
        items: favoriteDashboards.map(d => ({
          id: d.id,
          title: d.name,
          subtitle: d.category || 'Dashboard',
          badge: d.viewCount ? `${d.viewCount} views` : 'Novo',
          lastUsed: d.lastViewed,
          actions: [
            { id: 'open', label: 'Abrir', icon: '📊', primary: true },
            { id: 'edit', label: 'Editar', icon: '✏️' },
            { id: 'share', label: 'Compartilhar', icon: '🔗' },
            { id: 'export', label: 'Exportar PDF', icon: '📄' }
          ]
        }))
      },
      
      // SEÇÃO 5: CARROSSEL DE RELATÓRIOS
      reportsCarousel: {
        title: 'Relatórios Ativos',
        icon: '📋',
        viewAllAction: 'view_all_reports',
        items: activeReports.map(r => ({
          id: r.id,
          title: r.name,
          subtitle: r.templateType,
          badge: r.category,
          lastUsed: r.lastUsed,
          actions: [
            { id: 'generate', label: 'Gerar', icon: '▶️', primary: true },
            { id: 'schedule', label: 'Agendar', icon: '⏰' },
            { id: 'edit', label: 'Editar', icon: '✏️' },
            { id: 'history', label: 'Histórico', icon: '📊' }
          ]
        }))
      },
      
      // SEÇÃO 6: CARROSSEL DE WORKFLOWS
      workflowCarousel: {
        title: 'Workflows Automáticos',
        icon: '🔄',
        viewAllAction: 'view_all_workflows',
        items: activeWorkflows.map(w => ({
          id: w.id,
          title: w.name,
          subtitle: w.category || 'Workflow',
          badge: w.isActive ? 'Ativo' : 'Pausado',
          status: w.isActive ? 'success' : 'warning',
          lastUsed: w.lastExecuted,
          actions: [
            { id: 'execute', label: 'Executar', icon: '▶️', primary: true },
            { id: 'edit', label: 'Editar', icon: '✏️' },
            { id: 'pause', label: 'Pausar', icon: '⏸️' },
            { id: 'history', label: 'Histórico', icon: '📊' }
          ]
        }))
      },
      
      // SEÇÃO 7: PAINEL DE CONTROLE LATERAL
      sidePanel: {
        notifications: {
          count: 3,
          items: [
            { type: 'info', message: 'Query executada com sucesso', time: '2 min' },
            { type: 'success', message: 'Relatório gerado', time: '5 min' },
            { type: 'warning', message: 'Conexão API instável', time: '10 min' }
          ]
        },
        quickStats: {
          totalQueries: recentQueries.length,
          activeConnections: activeConnections.length,
          activeDashboards: favoriteDashboards.length,
          activeReports: activeReports.length,
          activeWorkflows: activeWorkflows.length
        },
        recentActivity: [
          { action: 'Query executada', item: 'Vendas mensais', time: '3 min' },
          { action: 'Dashboard visualizado', item: 'KPIs Executivos', time: '8 min' },
          { action: 'Relatório gerado', item: 'Relatório Financeiro', time: '15 min' }
        ]
      }
    };
    
    res.json({
      success: true,
      data: compactWorkspace,
      metadata: {
        tenantId,
        userId,
        generatedAt: new Date(),
        layoutVersion: 'compact_v1',
        totalItems: {
          queries: recentQueries.length,
          connections: activeConnections.length,
          dashboards: favoriteDashboards.length,
          reports: activeReports.length,
          workflows: activeWorkflows.length
        }
      },
      message: 'Workspace compacto carregado com sucesso'
    });
    
  } catch (error: any) {
    console.error('Error loading compact workspace:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'workspace_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar workspace compacto',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// MODAL CONTENT PROVIDERS - DADOS PARA POPUPS
// ==========================================

// GET /api/compact-studio/modal/:type/:id - Dados para modais específicos
router.get('/modal/:type/:id?', async (req: any, res) => {
  try {
    const { type, id } = req.params;
    const tenantId = req.tenant.id;
    
    let modalData;
    
    switch (type) {
      case 'query_builder':
        modalData = await getQueryBuilderModalData(id, tenantId);
        break;
        
      case 'connection_browser':
        modalData = await getConnectionBrowserModalData(id, tenantId);
        break;
        
      case 'dashboard_editor':
        modalData = await getDashboardEditorModalData(id, tenantId);
        break;
        
      case 'report_generator':
        modalData = await getReportGeneratorModalData(id, tenantId);
        break;
        
      case 'workflow_builder':
        modalData = await getWorkflowBuilderModalData(id, tenantId);
        break;
        
      case 'data_preview':
        modalData = await getDataPreviewModalData(id, type, tenantId);
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: `Tipo de modal não suportado: ${type}`,
          type: 'invalid_modal_type'
        });
    }
    
    res.json({
      success: true,
      data: modalData,
      metadata: {
        modalType: type,
        itemId: id,
        tenantId,
        loadedAt: new Date()
      }
    });
    
  } catch (error: any) {
    console.error('Error loading modal data:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'modal_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar dados do modal',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// DROPDOWN CONTENT PROVIDERS - LISTAS SUSPENSAS
// ==========================================

// GET /api/compact-studio/dropdown/:type - Dados para listas suspensas
router.get('/dropdown/:type', async (req: any, res) => {
  try {
    const { type } = req.params;
    const { search, category, limit = 20 } = req.query;
    const tenantId = req.tenant.id;
    
    let dropdownData;
    
    switch (type) {
      case 'queries':
        dropdownData = await getQueriesDropdownData(tenantId, { search, category, limit });
        break;
        
      case 'connections':
        dropdownData = await getConnectionsDropdownData(tenantId, { search, category, limit });
        break;
        
      case 'dashboards':
        dropdownData = await getDashboardsDropdownData(tenantId, { search, category, limit });
        break;
        
      case 'reports':
        dropdownData = await getReportsDropdownData(tenantId, { search, category, limit });
        break;
        
      case 'workflows':
        dropdownData = await getWorkflowsDropdownData(tenantId, { search, category, limit });
        break;
        
      case 'templates':
        dropdownData = await getTemplatesDropdownData(tenantId, { search, category, limit });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: `Tipo de dropdown não suportado: ${type}`,
          type: 'invalid_dropdown_type'
        });
    }
    
    res.json({
      success: true,
      data: dropdownData,
      metadata: {
        dropdownType: type,
        filters: { search, category, limit },
        tenantId,
        loadedAt: new Date()
      }
    });
    
  } catch (error: any) {
    console.error('Error loading dropdown data:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'dropdown_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar dados do dropdown',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// UTILITY FUNCTIONS - MODAL PROVIDERS
// ==========================================

async function getQueryBuilderModalData(queryId: string | undefined, tenantId: string): Promise<any> {
  if (queryId) {
    // Carregar query existente
    const query = await db
      .select()
      .from(savedQueries)
      .where(and(
        eq(savedQueries.id, queryId),
        eq(savedQueries.tenantId, tenantId)
      ))
      .limit(1);
    
    return {
      mode: 'edit',
      query: query[0] || null,
      templates: [], // TQL templates
      recentQueries: [] // Últimas 5 queries
    };
  } else {
    // Novo query builder
    return {
      mode: 'create',
      templates: [], // TQL templates
      recentQueries: [], // Últimas 5 queries
      sampleData: [] // Dados de exemplo
    };
  }
}

async function getConnectionBrowserModalData(connectionId: string | undefined, tenantId: string): Promise<any> {
  if (connectionId) {
    const connection = await db
      .select()
      .from(externalDatabaseConnections)
      .where(and(
        eq(externalDatabaseConnections.id, connectionId),
        eq(externalDatabaseConnections.tenantId, tenantId)
      ))
      .limit(1);
    
    return {
      connection: connection[0] || null,
      schema: {
        tables: [], // Tabelas disponíveis
        views: [], // Views disponíveis
        procedures: [] // Procedures disponíveis
      },
      sampleData: {} // Dados de exemplo das tabelas
    };
  } else {
    return {
      connectionTypes: [
        { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
        { id: 'mysql', name: 'MySQL', icon: '🐬' },
        { id: 'sqlserver', name: 'SQL Server', icon: '🔷' },
        { id: 'oracle', name: 'Oracle', icon: '🔺' }
      ]
    };
  }
}

async function getDashboardEditorModalData(dashboardId: string | undefined, tenantId: string): Promise<any> {
  return {
    mode: dashboardId ? 'edit' : 'create',
    dashboard: dashboardId ? {} : null,
    availableWidgets: [
      { type: 'chart', name: 'Gráfico', icon: '📊' },
      { type: 'kpi', name: 'KPI', icon: '🎯' },
      { type: 'table', name: 'Tabela', icon: '📋' },
      { type: 'gauge', name: 'Medidor', icon: '⏲️' }
    ],
    dataSources: [] // Queries e conexões disponíveis
  };
}

async function getReportGeneratorModalData(reportId: string | undefined, tenantId: string): Promise<any> {
  return {
    mode: reportId ? 'edit' : 'create',
    report: reportId ? {} : null,
    templates: [
      { id: 'financial', name: 'Relatório Financeiro', icon: '💰' },
      { id: 'operational', name: 'Relatório Operacional', icon: '⚙️' },
      { id: 'performance', name: 'Relatório de Performance', icon: '📈' }
    ],
    dataSources: [] // Queries e dashboards disponíveis
  };
}

async function getWorkflowBuilderModalData(workflowId: string | undefined, tenantId: string): Promise<any> {
  return {
    mode: workflowId ? 'edit' : 'create',
    workflow: workflowId ? {} : null,
    availableNodes: [
      { type: 'trigger', name: 'Trigger', icon: '⚡' },
      { type: 'action', name: 'Ação', icon: '🎯' },
      { type: 'condition', name: 'Condição', icon: '🔀' },
      { type: 'delay', name: 'Aguardar', icon: '⏳' }
    ],
    availableObjects: [] // Todos os objetos do sistema
  };
}

async function getDataPreviewModalData(itemId: string, itemType: string, tenantId: string): Promise<any> {
  return {
    itemId,
    itemType,
    preview: {
      columns: [],
      rows: [],
      totalRows: 0
    },
    actions: [
      { id: 'export_csv', name: 'Exportar CSV', icon: '📄' },
      { id: 'export_excel', name: 'Exportar Excel', icon: '📊' },
      { id: 'create_query', name: 'Criar Query', icon: '🔍' }
    ]
  };
}

// ==========================================
// UTILITY FUNCTIONS - DROPDOWN PROVIDERS
// ==========================================

async function getQueriesDropdownData(tenantId: string, filters: any): Promise<any> {
  let query = db
    .select({
      id: savedQueries.id,
      name: savedQueries.name,
      category: savedQueries.category,
      lastExecuted: savedQueries.lastExecuted
    })
    .from(savedQueries)
    .where(eq(savedQueries.tenantId, tenantId));
  
  if (filters.search) {
    query = query.where(ilike(savedQueries.name, `%${filters.search}%`));
  }
  
  if (filters.category) {
    query = query.where(eq(savedQueries.category, filters.category));
  }
  
  const results = await query
    .orderBy(desc(savedQueries.lastExecuted))
    .limit(parseInt(filters.limit));
  
  return {
    items: results.map(item => ({
      id: item.id,
      label: item.name,
      description: item.category,
      icon: '🔍',
      lastUsed: item.lastExecuted
    })),
    total: results.length
  };
}

async function getConnectionsDropdownData(tenantId: string, filters: any): Promise<any> {
  const results = await db
    .select({
      id: externalDatabaseConnections.id,
      name: externalDatabaseConnections.name,
      type: externalDatabaseConnections.type,
      isActive: externalDatabaseConnections.isActive
    })
    .from(externalDatabaseConnections)
    .where(eq(externalDatabaseConnections.tenantId, tenantId))
    .limit(parseInt(filters.limit));
  
  return {
    items: results.map(item => ({
      id: item.id,
      label: item.name,
      description: item.type.toUpperCase(),
      icon: '🗄️',
      status: item.isActive ? 'active' : 'inactive'
    })),
    total: results.length
  };
}

async function getDashboardsDropdownData(tenantId: string, filters: any): Promise<any> {
  const results = await db
    .select({
      id: dashboards.id,
      name: dashboards.name,
      category: dashboards.category,
      isPublic: dashboards.isPublic
    })
    .from(dashboards)
    .where(eq(dashboards.tenantId, tenantId))
    .limit(parseInt(filters.limit));
  
  return {
    items: results.map(item => ({
      id: item.id,
      label: item.name,
      description: item.category,
      icon: '📊',
      status: item.isPublic ? 'public' : 'private'
    })),
    total: results.length
  };
}

async function getReportsDropdownData(tenantId: string, filters: any): Promise<any> {
  const results = await db
    .select({
      id: reportTemplates.id,
      name: reportTemplates.name,
      category: reportTemplates.category,
      templateType: reportTemplates.templateType
    })
    .from(reportTemplates)
    .where(eq(reportTemplates.tenantId, tenantId))
    .limit(parseInt(filters.limit));
  
  return {
    items: results.map(item => ({
      id: item.id,
      label: item.name,
      description: item.templateType,
      icon: '📋',
      category: item.category
    })),
    total: results.length
  };
}

async function getWorkflowsDropdownData(tenantId: string, filters: any): Promise<any> {
  const results = await db
    .select({
      id: visualWorkflows.id,
      name: visualWorkflows.name,
      category: visualWorkflows.category,
      isActive: visualWorkflows.isActive
    })
    .from(visualWorkflows)
    .where(eq(visualWorkflows.tenantId, tenantId))
    .limit(parseInt(filters.limit));
  
  return {
    items: results.map(item => ({
      id: item.id,
      label: item.name,
      description: item.category,
      icon: '🔄',
      status: item.isActive ? 'active' : 'inactive'
    })),
    total: results.length
  };
}

async function getTemplatesDropdownData(tenantId: string, filters: any): Promise<any> {
  return {
    items: [
      { id: 'query_basic', label: 'Query Básica', description: 'Template de query simples', icon: '🔍' },
      { id: 'dashboard_kpi', label: 'Dashboard KPI', description: 'Dashboard de indicadores', icon: '📊' },
      { id: 'report_financial', label: 'Relatório Financeiro', description: 'Template financeiro', icon: '💰' },
      { id: 'workflow_notification', label: 'Workflow Notificação', description: 'Workflow de notificações', icon: '🔔' }
    ],
    total: 4
  };
}

export { router as compactUnifiedStudioRoutes };