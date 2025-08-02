/**
 * DASHBOARD BUILDER SERVICE - Sistema completo de dashboard builder
 * Funcionalidades: KPIs, gráficos, widgets, templates, drag-and-drop
 * Suporta: Dashboards personalizáveis, métricas em tempo real, automação
 */

import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from './db';
import { 
  customDashboards,
  dashboardWidgets,
  externalDatabaseConnections,
  fileUploads,
  insertCustomDashboardSchema,
  insertDashboardWidgetSchema
} from '../shared/schema';
import { eq, desc, and, or, ilike, gte, lte, sql, inArray } from 'drizzle-orm';
import { universalDatabaseConnector } from './universalDatabaseConnector';

// Validation Schemas
export const DashboardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  layout: z.object({
    columns: z.number().min(1).max(12).default(3),
    gap: z.number().min(0).max(50).default(16),
    padding: z.number().min(0).max(50).default(16),
  }).default({
    columns: 3,
    gap: 16,
    padding: 16
  }),
  theme: z.object({
    primaryColor: z.string().default('#3b82f6'),
    secondaryColor: z.string().default('#8b5cf6'),
    backgroundColor: z.string().default('#ffffff'),
    textColor: z.string().default('#1f2937'),
    cardBackground: z.string().default('#f9fafb'),
    borderColor: z.string().default('#e5e7eb'),
  }).default({
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    cardBackground: '#f9fafb',
    borderColor: '#e5e7eb'
  }),
  isPublic: z.boolean().default(false),
  autoRefresh: z.number().min(0).max(300).default(0), // segundos, 0 = sem refresh
  tags: z.array(z.string()).default([]),
});

export const WidgetSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  type: z.enum([
    'kpi', 'chart_line', 'chart_bar', 'chart_pie', 'chart_doughnut', 
    'chart_area', 'chart_scatter', 'table', 'metric', 'gauge', 
    'progress', 'list', 'text', 'iframe', 'calendar'
  ]),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1).max(12),
    height: z.number().min(1).max(10),
  }),
  dataSource: z.object({
    type: z.enum(['database', 'file', 'api', 'static']),
    connectionId: z.string().optional(),
    fileId: z.string().optional(),
    query: z.string().optional(),
    staticData: z.any().optional(),
    refreshInterval: z.number().min(0).max(3600).default(300), // segundos
  }),
  config: z.object({
    showTitle: z.boolean().default(true),
    showBorder: z.boolean().default(true),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    chartOptions: z.any().optional(),
    formatters: z.record(z.string()).optional(),
    filters: z.array(z.any()).optional(),
    aggregations: z.array(z.any()).optional(),
  }).default({}),
  styling: z.object({
    padding: z.number().min(0).max(50).default(16),
    borderRadius: z.number().min(0).max(50).default(8),
    shadowLevel: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('sm'),
    fontSize: z.enum(['xs', 'sm', 'base', 'lg', 'xl']).default('base'),
  }).default({}),
});

export const DashboardTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['business', 'financial', 'technical', 'marketing', 'hr', 'custom']),
  widgets: z.array(WidgetSchema),
  layout: DashboardSchema.shape.layout,
  theme: DashboardSchema.shape.theme,
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

// Interface para dados processados
interface ProcessedWidgetData {
  success: boolean;
  data: any[];
  metadata: {
    totalRows: number;
    columns: string[];
    dataTypes: Record<string, string>;
    executionTime: number;
    lastUpdated: Date;
  };
  error?: string;
}

export class DashboardBuilderService {

  /**
   * CRIAR DASHBOARD PERSONALIZADO
   */
  async createDashboard(
    tenantId: string, 
    userId: string, 
    dashboardData: z.infer<typeof DashboardSchema>
  ) {
    try {
      const validatedData = DashboardSchema.parse(dashboardData);

      const dashboard = await db
        .insert(customDashboards)
        .values({
          tenantId,
          name: validatedData.name,
          description: validatedData.description || null,
          layout: validatedData.layout as any,
          theme: validatedData.theme as any,
          isPublic: validatedData.isPublic,
          autoRefresh: validatedData.autoRefresh,
          tags: validatedData.tags,
          createdBy: userId,
          createdAt: new Date(),
        })
        .returning();

      return {
        success: true,
        data: dashboard[0],
        message: 'Dashboard criado com sucesso'
      };

    } catch (error) {
      console.error('Error creating dashboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar dashboard'
      };
    }
  }

  /**
   * ADICIONAR WIDGET AO DASHBOARD
   */
  async addWidget(
    tenantId: string, 
    dashboardId: string, 
    widgetData: z.infer<typeof WidgetSchema>
  ) {
    try {
      // Verificar se dashboard existe e pertence ao tenant
      const dashboard = await db
        .select()
        .from(customDashboards)
        .where(and(
          eq(customDashboards.id, dashboardId),
          eq(customDashboards.tenantId, tenantId)
        ))
        .limit(1);

      if (dashboard.length === 0) {
        throw new Error('Dashboard não encontrado');
      }

      const validatedData = WidgetSchema.parse(widgetData);

      // Verificar fonte de dados se necessário
      if (validatedData.dataSource.type === 'database' && validatedData.dataSource.connectionId) {
        const connection = await db
          .select()
          .from(externalDatabaseConnections)
          .where(and(
            eq(externalDatabaseConnections.id, validatedData.dataSource.connectionId),
            eq(externalDatabaseConnections.tenantId, tenantId),
            eq(externalDatabaseConnections.isActive, true)
          ))
          .limit(1);

        if (connection.length === 0) {
          throw new Error('Conexão de banco de dados não encontrada ou inativa');
        }
      }

      // Verificar arquivo se necessário
      if (validatedData.dataSource.type === 'file' && validatedData.dataSource.fileId) {
        const file = await db
          .select()
          .from(fileUploads)
          .where(and(
            eq(fileUploads.id, validatedData.dataSource.fileId),
            eq(fileUploads.tenantId, tenantId),
            eq(fileUploads.isActive, true),
            eq(fileUploads.status, 'processed')
          ))
          .limit(1);

        if (file.length === 0) {
          throw new Error('Arquivo não encontrado ou não processado');
        }
      }

      const widget = await db
        .insert(dashboardWidgets)
        .values({
          dashboardId,
          title: validatedData.title,
          type: validatedData.type,
          position: validatedData.position as any,
          dataSource: validatedData.dataSource as any,
          config: validatedData.config as any,
          styling: validatedData.styling as any,
          createdAt: new Date(),
        })
        .returning();

      return {
        success: true,
        data: widget[0],
        message: 'Widget adicionado com sucesso'
      };

    } catch (error) {
      console.error('Error adding widget:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao adicionar widget'
      };
    }
  }

  /**
   * PROCESSAR DADOS DO WIDGET
   */
  async processWidgetData(
    tenantId: string, 
    widgetId: string, 
    forceRefresh: boolean = false
  ): Promise<ProcessedWidgetData> {
    try {
      // Buscar widget
      const widget = await db
        .select({
          widget: dashboardWidgets,
          dashboard: customDashboards
        })
        .from(dashboardWidgets)
        .leftJoin(customDashboards, eq(customDashboards.id, dashboardWidgets.dashboardId))
        .where(and(
          eq(dashboardWidgets.id, widgetId),
          eq(customDashboards.tenantId, tenantId)
        ))
        .limit(1);

      if (widget.length === 0) {
        throw new Error('Widget não encontrado');
      }

      const widgetData = widget[0].widget;
      const dataSource = widgetData.dataSource as any;

      let processedData: any[] = [];
      let metadata: any = {
        totalRows: 0,
        columns: [],
        dataTypes: {},
        executionTime: 0,
        lastUpdated: new Date()
      };

      const startTime = Date.now();

      // Processar baseado no tipo de fonte
      switch (dataSource.type) {
        case 'database':
          if (dataSource.connectionId && dataSource.query) {
            const result = await universalDatabaseConnector.executeQuery(tenantId, {
              connectionId: dataSource.connectionId,
              query: dataSource.query,
              cacheKey: forceRefresh ? undefined : `widget_${widgetId}`,
              cacheTTL: dataSource.refreshInterval || 300
            });

            if (result.success) {
              processedData = result.data || [];
              metadata.totalRows = processedData.length;
              metadata.columns = processedData.length > 0 ? Object.keys(processedData[0]) : [];
              metadata.cached = result.cached;
              metadata.cachedAt = result.cachedAt;
            } else {
              throw new Error(result.error || 'Erro na execução da query');
            }
          }
          break;

        case 'file':
          if (dataSource.fileId) {
            const file = await db
              .select()
              .from(fileUploads) 
              .where(and(
                eq(fileUploads.id, dataSource.fileId),
                eq(fileUploads.tenantId, tenantId)
              ))
              .limit(1);

            if (file.length > 0) {
              processedData = file[0].previewData || [];
              metadata.totalRows = file[0].totalRows || 0;
              metadata.columns = processedData.length > 0 ? Object.keys(processedData[0]) : [];
            }
          }
          break;

        case 'static':
          processedData = dataSource.staticData || [];
          metadata.totalRows = processedData.length;
          metadata.columns = processedData.length > 0 ? Object.keys(processedData[0]) : [];
          break;

        case 'api':
          // Implementação futura para APIs REST
          throw new Error('Fonte de dados API ainda não implementada');

        default:
          throw new Error(`Tipo de fonte de dados não suportado: ${dataSource.type}`);
      }

      metadata.executionTime = Date.now() - startTime;

      // Aplicar filtros se configurados
      if (widgetData.config && (widgetData.config as any).filters) {
        processedData = this.applyFilters(processedData, (widgetData.config as any).filters);
      }

      // Aplicar agregações se configuradas
      if (widgetData.config && (widgetData.config as any).aggregations) {
        processedData = this.applyAggregations(processedData, (widgetData.config as any).aggregations);
      }

      // Inferir tipos de dados
      if (processedData.length > 0) {
        metadata.dataTypes = this.inferDataTypes(processedData[0]);
      }

      return {
        success: true,
        data: processedData,
        metadata
      };

    } catch (error) {
      console.error('Error processing widget data:', error);
      return {
        success: false,
        data: [],
        metadata: {
          totalRows: 0,
          columns: [],
          dataTypes: {},
          executionTime: 0,
          lastUpdated: new Date()
        },
        error: error instanceof Error ? error.message : 'Erro ao processar dados do widget'
      };
    }
  }

  /**
   * APLICAR FILTROS AOS DADOS
   */
  private applyFilters(data: any[], filters: any[]): any[] {
    let filteredData = [...data];

    filters.forEach(filter => {
      switch (filter.type) {
        case 'equals':
          filteredData = filteredData.filter(row => row[filter.column] === filter.value);
          break;
        case 'contains':
          filteredData = filteredData.filter(row => 
            String(row[filter.column]).toLowerCase().includes(String(filter.value).toLowerCase())
          );
          break;
        case 'greater_than':
          filteredData = filteredData.filter(row => Number(row[filter.column]) > Number(filter.value));
          break;
        case 'less_than':
          filteredData = filteredData.filter(row => Number(row[filter.column]) < Number(filter.value));
          break;
        case 'date_range':
          const startDate = new Date(filter.startDate);
          const endDate = new Date(filter.endDate);
          filteredData = filteredData.filter(row => {
            const rowDate = new Date(row[filter.column]);
            return rowDate >= startDate && rowDate <= endDate;
          });
          break;
      }
    });

    return filteredData;
  }

  /**
   * APLICAR AGREGAÇÕES AOS DADOS
   */
  private applyAggregations(data: any[], aggregations: any[]): any[] {
    if (aggregations.length === 0) return data;

    const groupedData: Record<string, any[]> = {};
    
    // Agrupar por campos especificados
    const groupByFields = aggregations.filter(agg => agg.type === 'group_by').map(agg => agg.column);
    
    if (groupByFields.length > 0) {
      data.forEach(row => {
        const groupKey = groupByFields.map(field => row[field]).join('|');
        if (!groupedData[groupKey]) {
          groupedData[groupKey] = [];
        }
        groupedData[groupKey].push(row);
      });

      // Aplicar funções de agregação
      const result: any[] = [];
      Object.entries(groupedData).forEach(([groupKey, rows]) => {
        const aggregatedRow: any = {};
        
        // Manter campos de agrupamento
        groupByFields.forEach((field, index) => {
          aggregatedRow[field] = groupKey.split('|')[index];
        });

        // Aplicar agregações
        aggregations.filter(agg => agg.type !== 'group_by').forEach(agg => {
          switch (agg.type) {
            case 'sum':
              aggregatedRow[agg.outputColumn || `${agg.column}_sum`] = 
                rows.reduce((sum, row) => sum + (Number(row[agg.column]) || 0), 0);
              break;
            case 'avg':
              const values = rows.map(row => Number(row[agg.column]) || 0);
              aggregatedRow[agg.outputColumn || `${agg.column}_avg`] = 
                values.reduce((sum, val) => sum + val, 0) / values.length;
              break;
            case 'count':
              aggregatedRow[agg.outputColumn || `${agg.column}_count`] = rows.length;
              break;
            case 'min':
              aggregatedRow[agg.outputColumn || `${agg.column}_min`] = 
                Math.min(...rows.map(row => Number(row[agg.column]) || 0));
              break;
            case 'max':
              aggregatedRow[agg.outputColumn || `${agg.column}_max`] = 
                Math.max(...rows.map(row => Number(row[agg.column]) || 0));
              break;
          }
        });

        result.push(aggregatedRow);
      });

      return result;
    }

    return data;
  }

  /**
   * INFERIR TIPOS DE DADOS
   */
  private inferDataTypes(sampleRow: any): Record<string, string> {
    const types: Record<string, string> = {};

    Object.entries(sampleRow).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        types[key] = 'unknown';
      } else if (typeof value === 'number') {
        types[key] = Number.isInteger(value) ? 'integer' : 'float';
      } else if (typeof value === 'boolean') {
        types[key] = 'boolean';
      } else if (typeof value === 'string') {
        // Tentar detectar datas
        if (this.isValidDate(value)) {
          types[key] = 'date';
        } else if (this.isValidEmail(value)) {
          types[key] = 'email';
        } else if (this.isValidUrl(value)) {
          types[key] = 'url';
        } else {
          types[key] = 'string';
        }
      } else {
        types[key] = 'object';
      }
    });

    return types;
  }

  /**
   * CRIAR DASHBOARD A PARTIR DE TEMPLATE
   */
  async createFromTemplate(
    tenantId: string, 
    userId: string, 
    templateData: z.infer<typeof DashboardTemplateSchema>
  ) {
    try {
      const validatedTemplate = DashboardTemplateSchema.parse(templateData);

      // Criar dashboard
      const dashboard = await this.createDashboard(tenantId, userId, {
        name: validatedTemplate.name,
        description: validatedTemplate.description,
        layout: validatedTemplate.layout,
        theme: validatedTemplate.theme,
        isPublic: validatedTemplate.isPublic,
        autoRefresh: 0,
        tags: validatedTemplate.tags
      });

      if (!dashboard.success) {
        return dashboard;
      }

      const dashboardId = dashboard.data.id;
      const widgets: any[] = [];

      // Adicionar widgets do template
      for (const widgetTemplate of validatedTemplate.widgets) {
        const widgetResult = await this.addWidget(tenantId, dashboardId, widgetTemplate);
        if (widgetResult.success) {
          widgets.push(widgetResult.data);
        }
      }

      return {
        success: true,
        data: {
          dashboard: dashboard.data,
          widgets: widgets
        },
        message: `Dashboard criado a partir do template "${validatedTemplate.name}" com ${widgets.length} widgets`
      };

    } catch (error) {
      console.error('Error creating dashboard from template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar dashboard a partir do template'
      };
    }
  }

  /**
   * OBTER DASHBOARD COMPLETO COM WIDGETS
   */
  async getDashboard(tenantId: string, dashboardId: string) {
    try {
      // Buscar dashboard
      const dashboard = await db
        .select()
        .from(customDashboards)
        .where(and(
          eq(customDashboards.id, dashboardId),
          eq(customDashboards.tenantId, tenantId),
          eq(customDashboards.isActive, true)
        ))
        .limit(1);

      if (dashboard.length === 0) {
        throw new Error('Dashboard não encontrado');
      }

      // Buscar widgets
      const widgets = await db
        .select()
        .from(dashboardWidgets)
        .where(and(
          eq(dashboardWidgets.dashboardId, dashboardId),
          eq(dashboardWidgets.isActive, true)
        ))
        .orderBy(dashboardWidgets.createdAt);

      return {
        success: true,
        data: {
          dashboard: dashboard[0],
          widgets: widgets
        }
      };

    } catch (error) {
      console.error('Error getting dashboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar dashboard'
      };
    }
  }

  /**
   * LISTAR DASHBOARDS DO TENANT
   */
  async getDashboards(
    tenantId: string,
    filters: {
      search?: string;
      tags?: string[];
      isPublic?: boolean;
      createdBy?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      const { 
        search, 
        tags, 
        isPublic, 
        createdBy, 
        limit = 20, 
        offset = 0 
      } = filters;

      let query = db
        .select({
          dashboard: customDashboards,
          widgetCount: sql<number>`
            (SELECT COUNT(*) FROM ${dashboardWidgets} 
             WHERE ${dashboardWidgets.dashboardId} = ${customDashboards.id} 
             AND ${dashboardWidgets.isActive} = true)
          `
        })
        .from(customDashboards)
        .where(and(
          eq(customDashboards.tenantId, tenantId),
          eq(customDashboards.isActive, true)
        ));

      // Aplicar filtros
      if (search) {
        query = query.where(
          or(
            ilike(customDashboards.name, `%${search}%`),
            ilike(customDashboards.description, `%${search}%`)
          )
        );
      }

      if (isPublic !== undefined) {
        query = query.where(eq(customDashboards.isPublic, isPublic));
      }

      if (createdBy) {
        query = query.where(eq(customDashboards.createdBy, createdBy));
      }

      const dashboards = await query
        .orderBy(desc(customDashboards.updatedAt))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data: dashboards.map(item => ({
          ...item.dashboard,
          widgetCount: item.widgetCount
        })),
        total: dashboards.length
      };

    } catch (error) {
      console.error('Error getting dashboards:', error);
      return {
        success: false,
        error: 'Erro ao buscar dashboards'
      };
    }
  }

  // Utility functions
  private isValidDate(value: string): boolean {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  private isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * DELETAR DASHBOARD
   */
  async deleteDashboard(tenantId: string, dashboardId: string) {
    try {
      // Verificar se dashboard existe
      const dashboard = await db
        .select()
        .from(customDashboards)
        .where(and(
          eq(customDashboards.id, dashboardId),
          eq(customDashboards.tenantId, tenantId)
        ))
        .limit(1);

      if (dashboard.length === 0) {
        throw new Error('Dashboard não encontrado');
      }

      // Marcar widgets como inativos
      await db
        .update(dashboardWidgets)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(dashboardWidgets.dashboardId, dashboardId));

      // Marcar dashboard como inativo
      await db
        .update(customDashboards)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(customDashboards.id, dashboardId));

      return {
        success: true,
        message: 'Dashboard removido com sucesso'
      };

    } catch (error) {
      console.error('Error deleting dashboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao remover dashboard'
      };
    }
  }
}

// Instância singleton
export const dashboardBuilderService = new DashboardBuilderService();