/**
 * INLINE DASHBOARD EDITOR ROUTES - Editor visual intuitivo
 * Single-click: Selecionar para mover/redimensionar
 * Double-click: Abrir popup de personalização
 * Sistema drag-and-drop com controles visuais diretos
 */

import express from 'express';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  dashboards,
  dashboardWidgets,
  savedQueries,
  users
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
// INLINE DASHBOARD EDITOR - ESTADO E CONTROLES
// ==========================================

// GET /api/inline-dashboard/:dashboardId/editor - Carregar editor inline
router.get('/:dashboardId/editor', async (req: any, res) => {
  try {
    const { dashboardId } = req.params;
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🎨 Carregando editor inline - Dashboard: ${dashboardId}, User: ${userId}`);
    
    // Buscar dashboard e widgets
    const [dashboard, widgets] = await Promise.all([
      db.select()
        .from(dashboards)
        .where(and(
          eq(dashboards.id, dashboardId),
          eq(dashboards.tenantId, tenantId)
        ))
        .limit(1),
      
      db.select()
        .from(dashboardWidgets)
        .where(eq(dashboardWidgets.dashboardId, dashboardId))
        .orderBy(dashboardWidgets.createdAt)
    ]);
    
    if (dashboard.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard não encontrado',
        type: 'dashboard_not_found'
      });
    }
    
    // Estruturar dados para editor inline
    const editorData = {
      dashboard: dashboard[0],
      widgets: widgets.map(widget => ({
        ...widget,
        // Estado do editor
        editorState: {
          isSelected: false,
          isEditing: false,
          isDragging: false,
          isResizing: false,
          selectionHandles: {
            topLeft: { x: widget.position.x, y: widget.position.y },
            topRight: { x: widget.position.x + widget.position.w, y: widget.position.y },
            bottomLeft: { x: widget.position.x, y: widget.position.y + widget.position.h },
            bottomRight: { x: widget.position.x + widget.position.w, y: widget.position.y + widget.position.h }
          }
        },
        // Opções de personalização baseadas no tipo
        customizationOptions: getCustomizationOptionsForWidget(widget.type),
        // Ações disponíveis
        actions: [
          { id: 'move', label: 'Mover', shortcut: 'Drag', icon: '🔄' },
          { id: 'resize', label: 'Redimensionar', shortcut: 'Drag corners', icon: '↔️' },
          { id: 'customize', label: 'Personalizar', shortcut: 'Double-click', icon: '🎨' },
          { id: 'duplicate', label: 'Duplicar', shortcut: 'Ctrl+D', icon: '📋' },
          { id: 'delete', label: 'Excluir', shortcut: 'Delete', icon: '🗑️' }
        ]
      })),
      // Configurações do editor
      editorSettings: {
        gridSize: 20,
        snapToGrid: true,
        showGrid: false,
        showRulers: false,
        autoSave: true,
        autoSaveInterval: 30000, // 30 segundos
        undoRedoLimit: 50
      },
      // Toolbar de widgets disponíveis
      widgetPalette: [
        {
          category: 'Gráficos',
          icon: '📊',
          widgets: [
            { type: 'line_chart', name: 'Linha', icon: '📈', defaultSize: { w: 6, h: 4 } },
            { type: 'bar_chart', name: 'Barras', icon: '📊', defaultSize: { w: 6, h: 4 } },
            { type: 'pie_chart', name: 'Pizza', icon: '🍰', defaultSize: { w: 4, h: 4 } },
            { type: 'area_chart', name: 'Área', icon: '🏔️', defaultSize: { w: 6, h: 4 } },
            { type: 'radar_chart', name: 'Radar', icon: '🎯', defaultSize: { w: 4, h: 4 } }
          ]
        },
        {
          category: 'KPIs',
          icon: '🎯',
          widgets: [
            { type: 'number_kpi', name: 'Número', icon: '🔢', defaultSize: { w: 3, h: 2 } },
            { type: 'gauge_kpi', name: 'Medidor', icon: '⏲️', defaultSize: { w: 3, h: 3 } },
            { type: 'progress_bar', name: 'Progresso', icon: '▶️', defaultSize: { w: 4, h: 2 } },
            { type: 'speedometer', name: 'Velocímetro', icon: '🏎️', defaultSize: { w: 4, h: 3 } }
          ]
        },
        {
          category: 'Texto',
          icon: '📝',
          widgets: [
            { type: 'title_text', name: 'Título', icon: '📝', defaultSize: { w: 6, h: 1 } },
            { type: 'paragraph_text', name: 'Parágrafo', icon: '📄', defaultSize: { w: 6, h: 2 } },
            { type: 'divider', name: 'Divisor', icon: '➖', defaultSize: { w: 12, h: 1 } }
          ]
        },
        {
          category: 'Tabelas',
          icon: '📋',
          widgets: [
            { type: 'data_table', name: 'Tabela', icon: '📋', defaultSize: { w: 8, h: 4 } },
            { type: 'summary_table', name: 'Resumo', icon: '📊', defaultSize: { w: 6, h: 3 } }
          ]
        }
      ]
    };
    
    res.json({
      success: true,
      data: editorData,
      metadata: {
        dashboardId,
        tenantId,
        userId,
        editorVersion: 'inline_v1.0',
        totalWidgets: widgets.length
      },
      message: 'Editor inline carregado com sucesso'
    });
    
  } catch (error: any) {
    console.error('Error loading inline editor:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'editor_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar editor',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// WIDGET ACTIONS - AÇÕES DIRETAS NO WIDGET
// ==========================================

const WidgetActionSchema = z.object({
  action: z.enum(['select', 'move', 'resize', 'customize', 'duplicate', 'delete']),
  widgetId: z.string(),
  actionData: z.any().optional()
});

// POST /api/inline-dashboard/:dashboardId/widget-action - Ações diretas no widget
router.post('/:dashboardId/widget-action', async (req: any, res) => {
  try {
    const { dashboardId } = req.params;
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🎯 Ação no widget - Dashboard: ${dashboardId}, User: ${userId}`);
    
    const validatedData = WidgetActionSchema.parse(req.body);
    
    let actionResult;
    
    switch (validatedData.action) {
      case 'select':
        actionResult = await handleWidgetSelect(validatedData.widgetId, dashboardId, tenantId);
        break;
        
      case 'move':
        actionResult = await handleWidgetMove(validatedData.widgetId, validatedData.actionData, tenantId);
        break;
        
      case 'resize':
        actionResult = await handleWidgetResize(validatedData.widgetId, validatedData.actionData, tenantId);
        break;
        
      case 'customize':
        actionResult = await handleWidgetCustomize(validatedData.widgetId, validatedData.actionData, tenantId);
        break;
        
      case 'duplicate':
        actionResult = await handleWidgetDuplicate(validatedData.widgetId, dashboardId, tenantId, userId);
        break;
        
      case 'delete':
        actionResult = await handleWidgetDelete(validatedData.widgetId, tenantId);
        break;
        
      default:
        throw new Error(`Ação não suportada: ${validatedData.action}`);
    }
    
    res.json({
      success: true,
      data: actionResult,
      metadata: {
        action: validatedData.action,
        widgetId: validatedData.widgetId,
        dashboardId,
        tenantId,
        executedBy: userId,
        executedAt: new Date()
      }
    });
    
  } catch (error: any) {
    console.error('Error executing widget action:', error);
    
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
// CUSTOMIZATION POPUP - POPUP DE PERSONALIZAÇÃO
// ==========================================

// GET /api/inline-dashboard/widget/:widgetId/customization-popup - Dados para popup de personalização
router.get('/widget/:widgetId/customization-popup', async (req: any, res) => {
  try {
    const { widgetId } = req.params;
    const tenantId = req.tenant.id;
    
    // Buscar widget
    const widget = await db
      .select()
      .from(dashboardWidgets)
      .where(and(
        eq(dashboardWidgets.id, widgetId),
        eq(dashboardWidgets.tenantId, tenantId)
      ))
      .limit(1);
    
    if (widget.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Widget não encontrado',
        type: 'widget_not_found'
      });
    }
    
    const widgetData = widget[0];
    
    // Gerar popup de personalização baseado no tipo de widget
    const customizationPopup = {
      widget: widgetData,
      popupConfig: {
        title: `Personalizar ${widgetData.title}`,
        size: 'large', // small, medium, large, fullscreen
        tabs: getCustomizationTabsForWidget(widgetData.type),
        currentValues: {
          ...(widgetData.config as any || {}),
          ...(widgetData.visualization as any || {}),
          position: widgetData.position,
          dataSource: widgetData.dataSource
        }
      }
    };
    
    res.json({
      success: true,
      data: customizationPopup,
      metadata: {
        widgetId,
        widgetType: widgetData.type,
        tenantId,
        popupVersion: 'v1.0'
      }
    });
    
  } catch (error: any) {
    console.error('Error loading customization popup:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'popup_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao carregar popup de personalização',
        type: 'internal_error'
      });
    }
  }
});

// POST /api/inline-dashboard/widget/:widgetId/apply-customization - Aplicar personalização
router.post('/widget/:widgetId/apply-customization', async (req: any, res) => {
  try {
    const { widgetId } = req.params;
    const { customizations } = req.body;
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🎨 Aplicando personalização - Widget: ${widgetId}, User: ${userId}`);
    
    // Preparar dados de atualização
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Separar dados por categoria
    if (customizations.position) {
      updateData.position = customizations.position;
    }
    
    if (customizations.dataSource) {
      updateData.dataSource = customizations.dataSource;
    }
    
    if (customizations.styling || customizations.colors || customizations.typography) {
      const currentConfig = await db
        .select({ config: dashboardWidgets.config })
        .from(dashboardWidgets)
        .where(eq(dashboardWidgets.id, widgetId))
        .limit(1);
      
      updateData.config = {
        ...(currentConfig[0]?.config as any || {}),
        styling: customizations.styling,
        colors: customizations.colors,
        typography: customizations.typography,
        lastCustomized: new Date(),
        customizedBy: userId
      };
    }
    
    if (customizations.chartOptions || customizations.kpiOptions || customizations.tableOptions) {
      const currentVisualization = await db
        .select({ visualization: dashboardWidgets.visualization })
        .from(dashboardWidgets)
        .where(eq(dashboardWidgets.id, widgetId))
        .limit(1);
      
      updateData.visualization = {
        ...(currentVisualization[0]?.visualization as any || {}),
        ...customizations.chartOptions,
        ...customizations.kpiOptions,
        ...customizations.tableOptions
      };
    }
    
    // Atualizar widget
    const updatedWidget = await db
      .update(dashboardWidgets)
      .set(updateData)
      .where(eq(dashboardWidgets.id, widgetId))
      .returning();
    
    res.json({
      success: true,
      data: {
        widget: updatedWidget[0],
        appliedCustomizations: customizations
      },
      metadata: {
        widgetId,
        tenantId,
        customizedBy: userId,
        customizedAt: new Date()
      },
      message: 'Personalização aplicada com sucesso'
    });
    
  } catch (error: any) {
    console.error('Error applying customization:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'customization_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao aplicar personalização',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// UTILITY FUNCTIONS - HANDLERS DE AÇÕES
// ==========================================

// Selecionar widget (single-click)
async function handleWidgetSelect(widgetId: string, dashboardId: string, tenantId: string): Promise<any> {
  return {
    action: 'select',
    widgetId,
    state: {
      isSelected: true,
      showHandles: true,
      showToolbar: true
    },
    handles: [
      { position: 'top-left', cursor: 'nw-resize' },
      { position: 'top-right', cursor: 'ne-resize' },
      { position: 'bottom-left', cursor: 'sw-resize' },
      { position: 'bottom-right', cursor: 'se-resize' },
      { position: 'top', cursor: 'n-resize' },
      { position: 'bottom', cursor: 's-resize' },
      { position: 'left', cursor: 'w-resize' },
      { position: 'right', cursor: 'e-resize' }
    ],
    toolbar: [
      { action: 'customize', label: 'Personalizar', icon: '🎨' },
      { action: 'duplicate', label: 'Duplicar', icon: '📋' },
      { action: 'delete', label: 'Excluir', icon: '🗑️' }
    ]
  };
}

// Mover widget (drag)
async function handleWidgetMove(widgetId: string, moveData: any, tenantId: string): Promise<any> {
  const { newPosition } = moveData;
  
  await db
    .update(dashboardWidgets)
    .set({
      position: newPosition,
      updatedAt: new Date()
    })
    .where(eq(dashboardWidgets.id, widgetId));
  
  return {
    action: 'move',
    widgetId,
    newPosition,
    success: true
  };
}

// Redimensionar widget (drag handles)
async function handleWidgetResize(widgetId: string, resizeData: any, tenantId: string): Promise<any> {
  const { newSize, newPosition } = resizeData;
  
  await db
    .update(dashboardWidgets)
    .set({
      position: { ...newPosition, ...newSize },
      updatedAt: new Date()
    })
    .where(eq(dashboardWidgets.id, widgetId));
  
  return {
    action: 'resize',
    widgetId,
    newSize,
    newPosition,
    success: true
  };
}

// Personalizar widget (double-click - abre popup)
async function handleWidgetCustomize(widgetId: string, customizeData: any, tenantId: string): Promise<any> {
  return {
    action: 'customize',
    widgetId,
    openPopup: true,
    popupConfig: {
      type: 'customization',
      size: 'large',
      title: 'Personalizar Widget'
    }
  };
}

// Duplicar widget
async function handleWidgetDuplicate(widgetId: string, dashboardId: string, tenantId: string, userId: string): Promise<any> {
  // Buscar widget original
  const originalWidget = await db
    .select()
    .from(dashboardWidgets)
    .where(eq(dashboardWidgets.id, widgetId))
    .limit(1);
  
  if (originalWidget.length === 0) {
    throw new Error('Widget não encontrado para duplicação');
  }
  
  const original = originalWidget[0];
  const newWidgetId = nanoid();
  
  // Criar widget duplicado com posição ligeiramente deslocada
  const duplicatedWidget = await db.insert(dashboardWidgets).values({
    id: newWidgetId,
    dashboardId,
    tenantId,
    type: original.type,
    title: `${original.title} (Cópia)`,
    position: {
      x: original.position.x + 1,
      y: original.position.y + 1,
      w: original.position.w,
      h: original.position.h
    },
    dataSource: original.dataSource,
    visualization: original.visualization,
    formatting: original.formatting,
    config: {
      ...(original.config as any || {}),
      duplicatedFrom: widgetId,
      duplicatedAt: new Date(),
      duplicatedBy: userId
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  return {
    action: 'duplicate',
    originalWidgetId: widgetId,
    newWidget: duplicatedWidget[0],
    success: true
  };
}

// Excluir widget
async function handleWidgetDelete(widgetId: string, tenantId: string): Promise<any> {
  await db
    .delete(dashboardWidgets)
    .where(and(
      eq(dashboardWidgets.id, widgetId),
      eq(dashboardWidgets.tenantId, tenantId)
    ));
  
  return {
    action: 'delete',
    widgetId,
    success: true
  };
}

// ==========================================
// UTILITY FUNCTIONS - CONFIGURAÇÃO DE WIDGETS
// ==========================================

function getCustomizationOptionsForWidget(widgetType: string): any {
  const baseOptions = {
    position: { enabled: true, label: 'Posição e Tamanho' },
    styling: { enabled: true, label: 'Cores e Estilo' }
  };
  
  switch (widgetType) {
    case 'line_chart':
    case 'bar_chart':
    case 'area_chart':
      return {
        ...baseOptions,
        chartOptions: {
          enabled: true,
          label: 'Configurações do Gráfico',
          options: ['colors', 'legend', 'tooltips', 'gridlines', 'animation']
        }
      };
      
    case 'pie_chart':
    case 'doughnut_chart':
      return {
        ...baseOptions,
        chartOptions: {
          enabled: true,
          label: 'Configurações do Gráfico',
          options: ['colors', 'labels', 'donut_mode', 'explosion']
        }
      };
      
    case 'number_kpi':
    case 'gauge_kpi':
      return {
        ...baseOptions,
        kpiOptions: {
          enabled: true,
          label: 'Configurações do KPI',
          options: ['prefix', 'suffix', 'decimals', 'comparison', 'animation']
        }
      };
      
    case 'title_text':
    case 'paragraph_text':
      return {
        ...baseOptions,
        typography: {
          enabled: true,
          label: 'Tipografia',
          options: ['font_family', 'font_size', 'font_weight', 'alignment', 'color']
        }
      };
      
    case 'data_table':
      return {
        ...baseOptions,
        tableOptions: {
          enabled: true,
          label: 'Configurações da Tabela',
          options: ['pagination', 'sorting', 'filtering', 'striped', 'borders']
        }
      };
      
    default:
      return baseOptions;
  }
}

function getCustomizationTabsForWidget(widgetType: string): any[] {
  const baseTabs = [
    {
      id: 'data',
      label: 'Dados',
      icon: '📊',
      fields: [
        { type: 'select', name: 'dataSource', label: 'Fonte de Dados', options: [] },
        { type: 'select', name: 'query', label: 'Query', options: [] }
      ]
    },
    {
      id: 'style',
      label: 'Estilo',
      icon: '🎨',
      fields: [
        { type: 'color', name: 'backgroundColor', label: 'Cor de Fundo' },
        { type: 'color', name: 'borderColor', label: 'Cor da Borda' },
        { type: 'slider', name: 'borderRadius', label: 'Bordas Arredondadas', min: 0, max: 20 },
        { type: 'slider', name: 'padding', label: 'Espaçamento Interno', min: 0, max: 30 }
      ]
    }
  ];
  
  // Adicionar tabs específicas por tipo
  if (['line_chart', 'bar_chart', 'pie_chart'].includes(widgetType)) {
    baseTabs.push({
      id: 'chart',
      label: 'Gráfico',
      icon: '📈',
      fields: [
        { type: 'color_palette', name: 'colors', label: 'Paleta de Cores' },
        { type: 'toggle', name: 'showLegend', label: 'Mostrar Legenda' },
        { type: 'toggle', name: 'showTooltips', label: 'Mostrar Tooltips' },
        { type: 'toggle', name: 'animation', label: 'Animação' }
      ]
    });
  }
  
  if (['title_text', 'paragraph_text'].includes(widgetType)) {
    baseTabs.push({
      id: 'typography',
      label: 'Tipografia',
      icon: '📝',
      fields: [
        { type: 'select', name: 'fontFamily', label: 'Fonte', options: ['Inter', 'Roboto', 'Arial'] },
        { type: 'slider', name: 'fontSize', label: 'Tamanho', min: 8, max: 72 },
        { type: 'select', name: 'fontWeight', label: 'Peso', options: ['300', '400', '500', '600', '700'] },
        { type: 'select', name: 'textAlign', label: 'Alinhamento', options: ['left', 'center', 'right'] }
      ]
    });
  }
  
  return baseTabs;
}

export { router as inlineDashboardEditorRoutes };