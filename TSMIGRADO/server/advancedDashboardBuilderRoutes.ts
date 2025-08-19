/**
 * ADVANCED DASHBOARD BUILDER ROUTES - Sistema completo de criação de dashboards
 * 12+ tipos de visualizações + elementos de texto personalizáveis
 * Editor visual com drag-and-drop, cores, tamanhos e posicionamento
 */

import express from 'express';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  dashboards,
  dashboardWidgets,
  savedQueries,
  dashboardTemplates,
  dashboardStyles,
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
// DASHBOARD BUILDER - TIPOS DE VISUALIZAÇÃO
// ==========================================

// GET /api/advanced-dashboard/widget-types - Tipos de widgets disponíveis
router.get('/widget-types', async (req: any, res) => {
  try {
    const widgetTypes = {
      // GRÁFICOS DE DADOS
      charts: [
        {
          id: 'line_chart',
          name: 'Gráfico de Linha',
          icon: '📈',
          description: 'Ideal para mostrar tendências ao longo do tempo',
          category: 'chart',
          dataRequirements: { x: 'required', y: 'required', series: 'optional' },
          customizations: ['colors', 'gridlines', 'labels', 'legend', 'tooltips'],
          previewImage: '/widgets/previews/line_chart.png'
        },
        {
          id: 'bar_chart',
          name: 'Gráfico de Barras',
          icon: '📊',
          description: 'Comparação entre categorias diferentes',
          category: 'chart',
          dataRequirements: { categories: 'required', values: 'required' },
          customizations: ['colors', 'orientation', 'spacing', 'labels'],
          previewImage: '/widgets/previews/bar_chart.png'
        },
        {
          id: 'pie_chart',
          name: 'Gráfico de Pizza',
          icon: '🍰',
          description: 'Proporções de um todo',
          category: 'chart',
          dataRequirements: { labels: 'required', values: 'required' },
          customizations: ['colors', 'labels', 'donut_mode', 'explosion'],
          previewImage: '/widgets/previews/pie_chart.png'
        },
        {
          id: 'doughnut_chart',
          name: 'Gráfico Rosquinha',
          icon: '🍩',
          description: 'Pizza com centro vazio para KPI central',
          category: 'chart',
          dataRequirements: { labels: 'required', values: 'required' },
          customizations: ['colors', 'center_text', 'thickness', 'labels'],
          previewImage: '/widgets/previews/doughnut_chart.png'
        },
        {
          id: 'area_chart',
          name: 'Gráfico de Área',
          icon: '🏔️',
          description: 'Linha preenchida para volume de dados',
          category: 'chart',
          dataRequirements: { x: 'required', y: 'required', series: 'optional' },
          customizations: ['colors', 'opacity', 'stacked', 'curved'],
          previewImage: '/widgets/previews/area_chart.png'
        },
        {
          id: 'radar_chart',
          name: 'Gráfico Radar',
          icon: '🎯',
          description: 'Comparação multidimensional',
          category: 'chart',
          dataRequirements: { dimensions: 'required', values: 'required' },
          customizations: ['colors', 'scale', 'gridlines', 'labels'],
          previewImage: '/widgets/previews/radar_chart.png'
        },
        {
          id: 'scatter_chart',
          name: 'Gráfico de Dispersão',
          icon: '⚪',
          description: 'Correlação entre duas variáveis',
          category: 'chart',
          dataRequirements: { x: 'required', y: 'required', size: 'optional' },
          customizations: ['colors', 'bubble_size', 'regression_line'],
          previewImage: '/widgets/previews/scatter_chart.png'
        },
        {
          id: 'heatmap_chart',
          name: 'Mapa de Calor',
          icon: '🔥',
          description: 'Densidade de dados em matriz',
          category: 'chart',
          dataRequirements: { x_axis: 'required', y_axis: 'required', intensity: 'required' },
          customizations: ['color_scheme', 'scale', 'labels', 'grid'],
          previewImage: '/widgets/previews/heatmap_chart.png'
        }
      ],
      
      // INDICADORES E KPIS
      kpis: [
        {
          id: 'number_kpi',
          name: 'KPI Numérico',
          icon: '🔢',
          description: 'Número grande com comparação',
          category: 'kpi',
          dataRequirements: { value: 'required', comparison: 'optional', target: 'optional' },
          customizations: ['font_size', 'colors', 'prefix', 'suffix', 'decimals'],
          previewImage: '/widgets/previews/number_kpi.png'
        },
        {
          id: 'gauge_kpi',
          name: 'Medidor Circular',
          icon: '⏲️',
          description: 'Velocímetro com faixas coloridas',
          category: 'kpi',
          dataRequirements: { value: 'required', min: 'required', max: 'required' },
          customizations: ['colors', 'ranges', 'needle_style', 'labels'],
          previewImage: '/widgets/previews/gauge_kpi.png'
        },
        {
          id: 'progress_bar',
          name: 'Barra de Progresso',
          icon: '▶️',
          description: 'Progresso horizontal ou vertical',
          category: 'kpi',
          dataRequirements: { current: 'required', target: 'required' },
          customizations: ['orientation', 'colors', 'thickness', 'animation'],
          previewImage: '/widgets/previews/progress_bar.png'
        },
        {
          id: 'speedometer',
          name: 'Velocímetro',
          icon: '🏎️',
          description: 'Medidor semi-circular premium',
          category: 'kpi',
          dataRequirements: { value: 'required', scale: 'required' },
          customizations: ['color_zones', 'scale_type', 'needle_color'],
          previewImage: '/widgets/previews/speedometer.png'
        }
      ],
      
      // TABELAS E LISTAS
      tables: [
        {
          id: 'data_table',
          name: 'Tabela de Dados',
          icon: '📋',
          description: 'Tabela completa com paginação e filtros',
          category: 'table',
          dataRequirements: { columns: 'required', rows: 'required' },
          customizations: ['pagination', 'sorting', 'filtering', 'striped_rows'],
          previewImage: '/widgets/previews/data_table.png'
        },
        {
          id: 'summary_table',
          name: 'Tabela Resumo',
          icon: '📊',
          description: 'Tabela compacta para KPIs',
          category: 'table',
          dataRequirements: { metrics: 'required', values: 'required' },
          customizations: ['highlight_rows', 'colors', 'borders', 'compact_mode'],
          previewImage: '/widgets/previews/summary_table.png'
        }
      ],
      
      // ELEMENTOS DE TEXTO E DESIGN
      text_elements: [
        {
          id: 'title_text',
          name: 'Título',
          icon: '📝',
          description: 'Texto de título personalizável',
          category: 'text',
          dataRequirements: { text: 'required' },
          customizations: ['font_family', 'font_size', 'color', 'alignment', 'weight'],
          previewImage: '/widgets/previews/title_text.png'
        },
        {
          id: 'paragraph_text',
          name: 'Parágrafo',
          icon: '📄',
          description: 'Bloco de texto com formatação',
          category: 'text',
          dataRequirements: { content: 'required' },
          customizations: ['font_family', 'font_size', 'color', 'alignment', 'line_height'],
          previewImage: '/widgets/previews/paragraph_text.png'
        },
        {
          id: 'divider',
          name: 'Divisor',
          icon: '➖',
          description: 'Linha separadora decorativa',
          category: 'design',
          dataRequirements: {},
          customizations: ['style', 'color', 'thickness', 'margin'],
          previewImage: '/widgets/previews/divider.png'
        },
        {
          id: 'spacer',
          name: 'Espaçador',
          icon: '⬜',
          description: 'Espaço em branco ajustável',
          category: 'design',
          dataRequirements: {},
          customizations: ['height', 'width', 'background_color'],
          previewImage: '/widgets/previews/spacer.png'
        }
      ]
    };
    
    // Calcular total de tipos
    const totalTypes = Object.values(widgetTypes).reduce((sum, category: any) => {
      return sum + category.length;
    }, 0);
    
    res.json({
      success: true,
      data: widgetTypes,
      metadata: {
        totalTypes,
        categories: Object.keys(widgetTypes),
        version: 'v1.0'
      },
      message: `${totalTypes} tipos de widgets disponíveis`
    });
    
  } catch (error: any) {
    console.error('Error fetching widget types:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'widget_types_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao buscar tipos de widgets',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// DASHBOARD BUILDER - EDITOR VISUAL
// ==========================================

const DashboardCreationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  layout: z.object({
    type: z.enum(['grid', 'freeform', 'template']).default('grid'),
    columns: z.number().min(1).max(24).default(12),
    rowHeight: z.number().min(20).max(200).default(60),
    margin: z.object({
      x: z.number().default(10),
      y: z.number().default(10)
    }).optional(),
    padding: z.object({
      top: z.number().default(20),
      bottom: z.number().default(20),
      left: z.number().default(20),
      right: z.number().default(20)
    }).optional()
  }),
  styling: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('light'),
    backgroundColor: z.string().default('#ffffff'),
    textColor: z.string().default('#333333'),
    accentColor: z.string().default('#3b82f6'),
    fontFamily: z.enum(['Inter', 'Roboto', 'Arial', 'Helvetica', 'Georgia']).default('Inter'),
    borderRadius: z.number().min(0).max(20).default(8),
    shadowIntensity: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('sm')
  }).optional(),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number()
    }),
    dataConfig: z.object({
      source: z.enum(['query', 'api', 'webhook', 'static']),
      sourceId: z.string().optional(),
      query: z.any().optional(),
      refreshInterval: z.number().min(30).max(86400).default(300)
    }),
    styling: z.object({
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      textColor: z.string().optional(),
      borderWidth: z.number().min(0).max(5).default(1),
      borderRadius: z.number().min(0).max(20).default(8),
      padding: z.number().min(0).max(30).default(16),
      shadow: z.boolean().default(true)
    }).optional(),
    customizations: z.record(z.any()).optional()
  })).default([])
});

// POST /api/advanced-dashboard/create - Criar dashboard com editor visual
router.post('/create', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🎨 Criando dashboard avançado - User: ${userId}, Tenant: ${tenantId}`);
    
    const validatedData = DashboardCreationSchema.parse(req.body);
    
    // Criar dashboard
    const dashboardId = nanoid();
    
    const dashboard = await db.insert(dashboards).values({
      id: dashboardId,
      tenantId,
      userId,
      name: validatedData.name,
      description: validatedData.description || '',
      category: validatedData.category || 'custom',
      layout: validatedData.layout,
      isPublic: false,
      refreshInterval: 300,
      settings: {
        styling: validatedData.styling,
        advancedBuilder: true,
        version: 'v2.0'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Criar widgets do dashboard
    const widgetPromises = validatedData.widgets.map(async (widget) => {
      return db.insert(dashboardWidgets).values({
        id: widget.id,
        dashboardId,
        tenantId,
        type: widget.type,
        title: widget.title,
        position: widget.position,
        dataSource: widget.dataConfig,
        visualization: widget.customizations || {},
        formatting: {},
        config: {
          styling: widget.styling,
          advancedWidget: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    await Promise.all(widgetPromises);
    
    res.status(201).json({
      success: true,
      data: {
        dashboard: dashboard[0],
        widgetsCreated: validatedData.widgets.length
      },
      metadata: {
        dashboardId,
        tenantId,
        createdBy: userId,
        builderVersion: 'advanced_v2.0'
      },
      message: 'Dashboard avançado criado com sucesso'
    });
    
  } catch (error: any) {
    console.error('Error creating advanced dashboard:', error);
    
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
// WIDGET CUSTOMIZATION - PERSONALIZAÇÃO VISUAL
// ==========================================

const WidgetCustomizationSchema = z.object({
  dashboardId: z.string(),
  widgetId: z.string(),
  customizations: z.object({
    // POSICIONAMENTO E TAMANHO
    position: z.object({
      x: z.number(),
      y: z.number(),
      w: z.number().min(1).max(24),
      h: z.number().min(1).max(20)
    }).optional(),
    
    // CORES E ESTILO
    styling: z.object({
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      textColor: z.string().optional(),
      accentColor: z.string().optional(),
      borderWidth: z.number().min(0).max(10).optional(),
      borderStyle: z.enum(['solid', 'dashed', 'dotted']).optional(),
      borderRadius: z.number().min(0).max(50).optional(),
      padding: z.number().min(0).max(50).optional(),
      margin: z.number().min(0).max(30).optional(),
      shadow: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional()
    }).optional(),
    
    // TIPOGRAFIA (para elementos de texto)
    typography: z.object({
      fontFamily: z.enum(['Inter', 'Roboto', 'Arial', 'Helvetica', 'Georgia', 'Times']).optional(),
      fontSize: z.number().min(8).max(72).optional(),
      fontWeight: z.enum(['300', '400', '500', '600', '700', '800']).optional(),
      lineHeight: z.number().min(1).max(3).optional(),
      textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
      textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional()
    }).optional(),
    
    // PERSONALIZAÇÃO ESPECÍFICA POR TIPO DE WIDGET
    chartOptions: z.object({
      colors: z.array(z.string()).optional(),
      showLegend: z.boolean().optional(),
      showTooltips: z.boolean().optional(),
      showGridlines: z.boolean().optional(),
      showLabels: z.boolean().optional(),
      animation: z.boolean().optional(),
      responsive: z.boolean().default(true)
    }).optional(),
    
    kpiOptions: z.object({
      prefix: z.string().optional(),
      suffix: z.string().optional(),
      decimals: z.number().min(0).max(6).optional(),
      showComparison: z.boolean().optional(),
      comparisonColor: z.string().optional(),
      animateValue: z.boolean().default(true)
    }).optional(),
    
    tableOptions: z.object({
      striped: z.boolean().optional(),
      bordered: z.boolean().optional(),
      hover: z.boolean().optional(),
      compact: z.boolean().optional(),
      sortable: z.boolean().optional(),
      filterable: z.boolean().optional(),
      paginated: z.boolean().optional(),
      pageSize: z.number().min(5).max(100).optional()
    }).optional()
  })
});

// PUT /api/advanced-dashboard/widget/:widgetId/customize - Personalizar widget
router.put('/widget/:widgetId/customize', async (req: any, res) => {
  try {
    const { widgetId } = req.params;
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`🎨 Personalizando widget - Widget: ${widgetId}, User: ${userId}`);
    
    const validatedData = WidgetCustomizationSchema.parse(req.body);
    
    // Verificar se widget existe e pertence ao tenant
    const existingWidget = await db
      .select()
      .from(dashboardWidgets)
      .where(and(
        eq(dashboardWidgets.id, widgetId),
        eq(dashboardWidgets.tenantId, tenantId),
        eq(dashboardWidgets.dashboardId, validatedData.dashboardId)
      ))
      .limit(1);
    
    if (existingWidget.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Widget não encontrado',
        type: 'widget_not_found'
      });
    }
    
    // Preparar dados de atualização
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Atualizar posição se fornecida
    if (validatedData.customizations.position) {
      updateData.position = validatedData.customizations.position;
    }
    
    // Atualizar configurações de visualização
    const currentVisualization = existingWidget[0].visualization as any || {};
    updateData.visualization = {
      ...currentVisualization,
      ...validatedData.customizations.chartOptions,
      ...validatedData.customizations.kpiOptions,
      ...validatedData.customizations.tableOptions
    };
    
    // Atualizar configurações gerais
    const currentConfig = existingWidget[0].config as any || {};
    updateData.config = {
      ...currentConfig,
      styling: {
        ...currentConfig.styling,
        ...validatedData.customizations.styling
      },
      typography: {
        ...currentConfig.typography,
        ...validatedData.customizations.typography
      },
      lastCustomized: new Date(),
      customizedBy: userId
    };
    
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
        customizations: validatedData.customizations
      },
      metadata: {
        widgetId,
        dashboardId: validatedData.dashboardId,
        tenantId,
        customizedBy: userId,
        customizedAt: new Date()
      },
      message: 'Widget personalizado com sucesso'
    });
    
  } catch (error: any) {
    console.error('Error customizing widget:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros de personalização inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'customization_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno na personalização do widget',
        type: 'internal_error'
      });
    }
  }
});

// ==========================================
// DASHBOARD TEMPLATES - TEMPLATES PRONTOS
// ==========================================

// GET /api/advanced-dashboard/templates - Templates de dashboards prontos
router.get('/templates', async (req: any, res) => {
  try {
    const { category, difficulty } = req.query;
    
    // Templates predefinidos com widgets configurados
    const dashboardTemplates = [
      {
        id: 'executive_kpi',
        name: 'Dashboard Executivo KPIs',
        description: 'KPIs principais para executivos',
        category: 'executive',
        difficulty: 'beginner',
        previewImage: '/templates/executive_kpi.png',
        widgets: [
          {
            type: 'title_text',
            title: 'Dashboard Executivo',
            position: { x: 0, y: 0, w: 12, h: 1 },
            styling: { fontSize: 32, fontWeight: '700', textAlign: 'center' }
          },
          {
            type: 'number_kpi',
            title: 'Receita Mensal',
            position: { x: 0, y: 1, w: 3, h: 3 },
            customizations: { prefix: 'R$', colors: ['#10b981'] }
          },
          {
            type: 'gauge_kpi',
            title: 'Meta Mensal',
            position: { x: 3, y: 1, w: 3, h: 3 },
            customizations: { colors: ['#ef4444', '#f59e0b', '#10b981'] }
          },
          {
            type: 'line_chart',
            title: 'Vendas por Mês',
            position: { x: 6, y: 1, w: 6, h: 4 },
            customizations: { colors: ['#3b82f6', '#10b981'] }
          }
        ]
      },
      {
        id: 'sales_performance',
        name: 'Performance de Vendas',
        description: 'Análise completa de vendas',
        category: 'sales',
        difficulty: 'intermediate',
        previewImage: '/templates/sales_performance.png',
        widgets: [
          {
            type: 'title_text',
            title: 'Performance de Vendas',
            position: { x: 0, y: 0, w: 12, h: 1 },
            styling: { fontSize: 28, fontWeight: '600', textAlign: 'center' }
          },
          {
            type: 'bar_chart',
            title: 'Vendas por Produto',
            position: { x: 0, y: 1, w: 6, h: 4 },
            customizations: { colors: ['#3b82f6'] }
          },
          {
            type: 'pie_chart',
            title: 'Vendas por Região',
            position: { x: 6, y: 1, w: 6, h: 4 },
            customizations: { colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] }
          },
          {
            type: 'data_table',
            title: 'Top Vendedores',
            position: { x: 0, y: 5, w: 12, h: 4 },
            customizations: { striped: true, sortable: true }
          }
        ]
      },
      {
        id: 'financial_overview',
        name: 'Visão Financeira',
        description: 'Dashboard financeiro completo',
        category: 'financial',
        difficulty: 'advanced',
        previewImage: '/templates/financial_overview.png',
        widgets: [
          {
            type: 'title_text',
            title: 'Visão Financeira',
            position: { x: 0, y: 0, w: 8, h: 1 },
            styling: { fontSize: 30, fontWeight: '700' }
          },
          {
            type: 'paragraph_text',
            title: 'Período de Análise',
            position: { x: 8, y: 0, w: 4, h: 1 },
            customizations: { content: 'Janeiro - Dezembro 2025', textAlign: 'right' }
          },
          {
            type: 'number_kpi',
            title: 'Receita Total',
            position: { x: 0, y: 1, w: 2, h: 2 },
            customizations: { prefix: 'R$', colors: ['#10b981'] }
          },
          {
            type: 'number_kpi',
            title: 'Lucro Líquido',
            position: { x: 2, y: 1, w: 2, h: 2 },
            customizations: { prefix: 'R$', colors: ['#3b82f6'] }
          },
          {
            type: 'area_chart',
            title: 'Fluxo de Caixa',
            position: { x: 4, y: 1, w: 8, h: 4 },
            customizations: { colors: ['#10b981', '#ef4444'], stacked: true }
          },
          {
            type: 'heatmap_chart',
            title: 'Vendas por Mês/Produto',
            position: { x: 0, y: 5, w: 12, h: 4 },
            customizations: { color_scheme: 'viridis' }
          }
        ]
      },
      {
        id: 'operational_metrics',
        name: 'Métricas Operacionais',
        description: 'KPIs operacionais e produtividade',
        category: 'operations',
        difficulty: 'intermediate',
        previewImage: '/templates/operational_metrics.png',
        widgets: [
          {
            type: 'title_text',
            title: 'Métricas Operacionais',
            position: { x: 0, y: 0, w: 12, h: 1 },
            styling: { fontSize: 28, textAlign: 'center', color: '#1f2937' }
          },
          {
            type: 'speedometer',
            title: 'Eficiência',
            position: { x: 0, y: 1, w: 4, h: 3 },
            customizations: { color_zones: [{ min: 0, max: 60, color: '#ef4444' }, { min: 60, max: 85, color: '#f59e0b' }, { min: 85, max: 100, color: '#10b981' }] }
          },
          {
            type: 'progress_bar',
            title: 'Meta de Produção',
            position: { x: 4, y: 1, w: 4, h: 3 },
            customizations: { orientation: 'horizontal', colors: ['#3b82f6'] }
          },
          {
            type: 'radar_chart',
            title: 'Performance Setores',
            position: { x: 8, y: 1, w: 4, h: 3 },
            customizations: { colors: ['#3b82f6', '#10b981'] }
          }
        ]
      }
    ];
    
    // Filtrar templates se parâmetros fornecidos
    let filteredTemplates = dashboardTemplates;
    
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    
    if (difficulty) {
      filteredTemplates = filteredTemplates.filter(t => t.difficulty === difficulty);
    }
    
    res.json({
      success: true,
      data: {
        templates: filteredTemplates,
        categories: ['executive', 'sales', 'financial', 'operations', 'marketing', 'hr'],
        difficulties: ['beginner', 'intermediate', 'advanced']
      },
      metadata: {
        totalTemplates: filteredTemplates.length,
        filters: { category, difficulty }
      },
      message: `${filteredTemplates.length} templates encontrados`
    });
    
  } catch (error: any) {
    console.error('Error fetching dashboard templates:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'templates_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao buscar templates',
        type: 'internal_error'
      });
    }
  }
});

// POST /api/advanced-dashboard/templates/:templateId/apply - Aplicar template
router.post('/templates/:templateId/apply', async (req: any, res) => {
  try {
    const { templateId } = req.params;
    const { name, description, customizations = {} } = req.body;
    const tenantId = req.tenant.id;
    const userId = req.user.id;
    
    console.log(`📋 Aplicando template - Template: ${templateId}, User: ${userId}`);
    
    // Buscar template (aqui você buscaria do banco ou usar os predefinidos)
    const templates = []; // Usar os templates do endpoint anterior
    
    // Por enquanto, criar dashboard baseado no template selecionado
    const dashboardId = nanoid();
    
    const dashboard = await db.insert(dashboards).values({
      id: dashboardId,
      tenantId,
      userId,
      name: name || `Dashboard - ${templateId}`,
      description: description || `Dashboard criado a partir do template ${templateId}`,
      category: 'template',
      layout: {
        type: 'grid',
        columns: 12,
        rowHeight: 60
      },
      isPublic: false,
      refreshInterval: 300,
      settings: {
        templateId,
        customizations,
        createdFromTemplate: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    res.status(201).json({
      success: true,
      data: {
        dashboard: dashboard[0],
        templateApplied: templateId
      },
      metadata: {
        dashboardId,
        templateId,
        tenantId,
        createdBy: userId
      },
      message: 'Template aplicado com sucesso'
    });
    
  } catch (error: any) {
    console.error('Error applying template:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        type: 'template_application_error'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao aplicar template',
        type: 'internal_error'
      });
    }
  }
});

export { router as advancedDashboardBuilderRoutes };