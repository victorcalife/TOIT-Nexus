/**
 * EXECUTIVE REPORTS SERVICE - Sistema completo de relatórios executivos
 * Funcionalidades: Templates empresariais, PDF/Excel export, scheduling, distribuição
 * Suportes: Relatórios dinâmicos, KPIs executivos, análise temporal, automação
 */

import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from './db';
import { 
  reports,
  reportTemplates,
  reportSchedules,
  reportExecutions,
  customDashboards,
  dashboardWidgets,
  externalDatabaseConnections,
  fileUploads,
  users,
  tenants
} from '../shared/schema';
import { eq, desc, and, or, ilike, gte, lte, sql, inArray } from 'drizzle-orm';
import { universalDatabaseConnector } from './universalDatabaseConnector';
import { dashboardBuilderService } from './dashboardBuilderService';

// Validation Schemas
export const ReportTemplateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category: z.enum(['financial', 'operational', 'sales', 'marketing', 'hr', 'technical', 'executive', 'custom']),
  template: z.object({
    sections: z.array(z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['kpi', 'chart', 'table', 'text', 'summary', 'comparison', 'trend']),
      position: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }),
      config: z.object({
        dataSource: z.object({
          type: z.enum(['database', 'file', 'dashboard', 'calculated']),
          connectionId: z.string().optional(),
          fileId: z.string().optional(),
          dashboardId: z.string().optional(),
          query: z.string().optional(),
          calculation: z.string().optional(),
        }),
        visualization: z.object({
          chartType: z.enum(['line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'gauge']).optional(),
          colors: z.array(z.string()).optional(),
          showLabels: z.boolean().default(true),
          showLegend: z.boolean().default(true),
          aggregation: z.enum(['sum', 'avg', 'count', 'min', 'max']).optional(),
        }).optional(),
        formatting: z.object({
          numberFormat: z.enum(['number', 'currency', 'percentage']).optional(),
          dateFormat: z.string().optional(),
          precision: z.number().optional(),
        }).optional(),
      }),
    })),
    layout: z.object({
      pageSize: z.enum(['A4', 'A3', 'Letter', 'Legal']).default('A4'),
      orientation: z.enum(['portrait', 'landscape']).default('portrait'),
      margins: z.object({
        top: z.number().default(20),
        right: z.number().default(20),
        bottom: z.number().default(20),
        left: z.number().default(20),
      }).default({}),
    }).default({}),
    branding: z.object({
      logo: z.string().optional(),
      companyName: z.string().optional(),
      colors: z.object({
        primary: z.string().default('#3b82f6'),
        secondary: z.string().default('#6b7280'),
        accent: z.string().default('#10b981'),
      }).default({}),
    }).default({}),
  }),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.enum(['date', 'dateRange', 'select', 'multiSelect', 'number', 'text']),
    label: z.string(),
    required: z.boolean().default(false),
    defaultValue: z.any().optional(),
    options: z.array(z.object({
      value: z.any(),
      label: z.string(),
    })).optional(),
  })).default([]),
  isPublic: z.boolean().default(false),
});

export const ReportGenerationSchema = z.object({
  templateId: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  parameters: z.record(z.any()).default({}),
  format: z.enum(['pdf', 'excel', 'html', 'json']).default('pdf'),
  options: z.object({
    includeCharts: z.boolean().default(true),
    includeRawData: z.boolean().default(false),
    watermark: z.string().optional(),
    password: z.string().optional(),
  }).default({}),
});

export const ReportScheduleSchema = z.object({
  templateId: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  schedule: z.object({
    time: z.string(), // HH:MM format
    dayOfWeek: z.number().min(0).max(6).optional(), // 0 = Sunday
    dayOfMonth: z.number().min(1).max(31).optional(),
    timezone: z.string().default('America/Sao_Paulo'),
  }),
  parameters: z.record(z.any()).default({}),
  format: z.enum(['pdf', 'excel', 'html']).default('pdf'),
  recipients: z.array(z.object({
    type: z.enum(['email', 'webhook', 'storage']),
    destination: z.string(),
    options: z.record(z.any()).optional(),
  })),
  isActive: z.boolean().default(true),
});

// Interface para dados do relatório processado
interface ProcessedReportData {
  success: boolean;
  sections: Array<{
    id: string;
    title: string;
    type: string;
    data: any;
    visualization?: any;
    error?: string;
  }>;
  metadata: {
    generatedAt: Date;
    parameters: Record<string, any>;
    executionTime: number;
    dataPoints: number;
  };
  error?: string;
}

export class ExecutiveReportsService {

  /**
   * CRIAR TEMPLATE DE RELATÓRIO
   */
  async createReportTemplate(
    tenantId: string, 
    userId: string, 
    templateData: z.infer<typeof ReportTemplateSchema>
  ) {
    try {
      const validatedData = ReportTemplateSchema.parse(templateData);

      const template = await db
        .insert(reportTemplates)
        .values({
          tenantId,
          name: validatedData.name,
          description: validatedData.description || null,
          category: validatedData.category,
          template: validatedData.template as any,
          parameters: validatedData.parameters as any,
          isPublic: validatedData.isPublic,
          createdBy: userId,
          createdAt: new Date(),
        })
        .returning();

      return {
        success: true,
        data: template[0],
        message: 'Template de relatório criado com sucesso'
      };

    } catch (error) {
      console.error('Error creating report template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar template de relatório'
      };
    }
  }

  /**
   * GERAR RELATÓRIO A PARTIR DE TEMPLATE
   */
  async generateReport(
    tenantId: string, 
    userId: string, 
    reportData: z.infer<typeof ReportGenerationSchema>
  ) {
    const startTime = Date.now();
    
    try {
      const validatedData = ReportGenerationSchema.parse(reportData);

      // Buscar template
      const template = await db
        .select()
        .from(reportTemplates)
        .where(and(
          eq(reportTemplates.id, validatedData.templateId),
          eq(reportTemplates.tenantId, tenantId),
          eq(reportTemplates.isActive, true)
        ))
        .limit(1);

      if (template.length === 0) {
        throw new Error('Template de relatório não encontrado');
      }

      const templateData = template[0];

      // Processar dados do relatório
      const processedData = await this.processReportData(
        tenantId,
        templateData,
        validatedData.parameters
      );

      if (!processedData.success) {
        return {
          success: false,
          error: processedData.error
        };
      }

      // Criar registro do relatório
      const report = await db
        .insert(reports)
        .values({
          tenantId,
          templateId: validatedData.templateId,
          name: validatedData.name,
          description: validatedData.description || null,
          parameters: validatedData.parameters as any,
          format: validatedData.format,
          status: 'completed',
          filePath: null, // Será atualizado após geração do arquivo
          fileSize: null,
          executionTime: Date.now() - startTime,
          generatedBy: userId,
          createdAt: new Date(),
        })
        .returning();

      // Gerar arquivo baseado no formato
      let filePath: string | null = null;
      let fileSize: number | null = null;

      if (validatedData.format !== 'json') {
        const fileResult = await this.generateReportFile(
          report[0].id,
          templateData,
          processedData,
          validatedData.format,
          validatedData.options
        );

        if (fileResult.success) {
          filePath = fileResult.filePath;
          fileSize = fileResult.fileSize;

          // Atualizar registro com informações do arquivo
          await db
            .update(reports)
            .set({
              filePath,
              fileSize,
              updatedAt: new Date(),
            })
            .where(eq(reports.id, report[0].id));
        }
      }

      return {
        success: true,
        data: {
          report: {
            ...report[0],
            filePath,
            fileSize
          },
          data: validatedData.format === 'json' ? processedData : undefined
        },
        message: 'Relatório gerado com sucesso'
      };

    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar relatório'
      };
    }
  }

  /**
   * PROCESSAR DADOS DO RELATÓRIO
   */
  private async processReportData(
    tenantId: string,
    template: any,
    parameters: Record<string, any>
  ): Promise<ProcessedReportData> {
    const startTime = Date.now();
    
    try {
      const sections = template.template.sections;
      const processedSections: any[] = [];
      let totalDataPoints = 0;

      for (const section of sections) {
        try {
          const sectionData = await this.processSectionData(
            tenantId,
            section,
            parameters
          );

          if (sectionData.success) {
            processedSections.push({
              id: section.id,
              title: section.title,
              type: section.type,
              data: sectionData.data,
              visualization: sectionData.visualization,
            });

            totalDataPoints += sectionData.dataPoints || 0;
          } else {
            processedSections.push({
              id: section.id,
              title: section.title,
              type: section.type,
              data: null,
              error: sectionData.error
            });
          }
        } catch (error) {
          processedSections.push({
            id: section.id,
            title: section.title,
            type: section.type,
            data: null,
            error: error instanceof Error ? error.message : 'Erro ao processar seção'
          });
        }
      }

      return {
        success: true,
        sections: processedSections,
        metadata: {
          generatedAt: new Date(),
          parameters,
          executionTime: Date.now() - startTime,
          dataPoints: totalDataPoints
        }
      };

    } catch (error) {
      return {
        success: false,
        sections: [],
        metadata: {
          generatedAt: new Date(),
          parameters,
          executionTime: Date.now() - startTime,
          dataPoints: 0
        },
        error: error instanceof Error ? error.message : 'Erro ao processar dados do relatório'
      };
    }
  }

  /**
   * PROCESSAR DADOS DE UMA SEÇÃO
   */
  private async processSectionData(
    tenantId: string,
    section: any,
    parameters: Record<string, any>
  ) {
    try {
      const { dataSource } = section.config;
      let rawData: any[] = [];
      let dataPoints = 0;

      switch (dataSource.type) {
        case 'database':
          if (dataSource.connectionId && dataSource.query) {
            // Substituir parâmetros na query
            let processedQuery = this.replaceQueryParameters(dataSource.query, parameters);
            
            const result = await universalDatabaseConnector.executeQuery(tenantId, {
              connectionId: dataSource.connectionId,
              query: processedQuery,
              cacheKey: `report_${section.id}_${Date.now()}`,
              cacheTTL: 300
            });

            if (result.success) {
              rawData = result.data || [];
              dataPoints = rawData.length;
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
                eq(fileUploads.tenantId, tenantId),
                eq(fileUploads.status, 'processed')
              ))
              .limit(1);

            if (file.length > 0) {
              rawData = file[0].previewData || [];
              dataPoints = file[0].totalRows || 0;
            }
          }
          break;

        case 'dashboard':
          if (dataSource.dashboardId) {
            const dashboard = await dashboardBuilderService.getDashboard(tenantId, dataSource.dashboardId);
            if (dashboard.success) {
              // Processar widgets do dashboard
              rawData = await this.processDashboardData(tenantId, dashboard.data);
              dataPoints = rawData.length;
            }
          }
          break;

        case 'calculated':
          if (dataSource.calculation) {
            rawData = await this.executeCalculation(dataSource.calculation, parameters);
            dataPoints = rawData.length;
          }
          break;
      }

      // Aplicar transformações baseadas no tipo de seção
      const processedData = this.transformSectionData(rawData, section);

      return {
        success: true,
        data: processedData,
        dataPoints,
        visualization: this.generateVisualizationConfig(section, processedData)
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar dados da seção'
      };
    }
  }

  /**
   * SUBSTITUIR PARÂMETROS NA QUERY
   */
  private replaceQueryParameters(query: string, parameters: Record<string, any>): string {
    let processedQuery = query;

    Object.entries(parameters).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      let replacementValue: string;

      if (typeof value === 'string') {
        replacementValue = `'${value.replace(/'/g, "''")}'`; // Escape single quotes
      } else if (value instanceof Date) {
        replacementValue = `'${value.toISOString()}'`;
      } else if (Array.isArray(value)) {
        replacementValue = `(${value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ')})`;
      } else {
        replacementValue = String(value);
      }

      processedQuery = processedQuery.replace(new RegExp(placeholder, 'g'), replacementValue);
    });

    return processedQuery;
  }

  /**
   * TRANSFORMAR DADOS DA SEÇÃO
   */
  private transformSectionData(rawData: any[], section: any) {
    const { type, config } = section;

    switch (type) {
      case 'kpi':
        return this.calculateKPI(rawData, config);
      
      case 'chart':
        return this.prepareChartData(rawData, config);
      
      case 'table':
        return this.formatTableData(rawData, config);
      
      case 'summary':
        return this.generateSummary(rawData, config);
      
      case 'comparison':
        return this.generateComparison(rawData, config);
      
      case 'trend':
        return this.analyzeTrend(rawData, config);
      
      default:
        return rawData;
    }
  }

  /**
   * CALCULAR KPI
   */
  private calculateKPI(data: any[], config: any) {
    if (data.length === 0) return { value: 0, trend: 0, formatted: '0' };

    const { aggregation = 'sum' } = config.visualization || {};
    let value = 0;

    // Assumindo que o primeiro campo numérico é o valor do KPI
    const numericFields = Object.keys(data[0] || {}).filter(key => 
      typeof data[0][key] === 'number'
    );

    if (numericFields.length === 0) {
      return { value: data.length, formatted: data.length.toString() };
    }

    const field = numericFields[0];
    const values = data.map(row => Number(row[field]) || 0);

    switch (aggregation) {
      case 'sum':
        value = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'avg':
        value = values.reduce((sum, val) => sum + val, 0) / values.length;
        break;
      case 'count':
        value = values.length;
        break;
      case 'min':
        value = Math.min(...values);
        break;
      case 'max':
        value = Math.max(...values);
        break;
    }

    return {
      value,
      formatted: this.formatNumber(value, config.formatting),
      trend: this.calculateTrend(values)
    };
  }

  /**
   * PREPARAR DADOS DO GRÁFICO
   */
  private prepareChartData(data: any[], config: any) {
    if (data.length === 0) return { labels: [], datasets: [] };

    const keys = Object.keys(data[0] || {});
    const labelField = keys[0];
    const valueFields = keys.slice(1).filter(key => 
      typeof data[0][key] === 'number'
    );

    const labels = data.map(row => row[labelField]);
    const datasets = valueFields.map((field, index) => ({
      label: field,
      data: data.map(row => Number(row[field]) || 0),
      backgroundColor: config.visualization?.colors?.[index] || `hsl(${index * 60}, 70%, 50%)`,
    }));

    return { labels, datasets };
  }

  /**
   * FORMATAR DADOS DA TABELA
   */
  private formatTableData(data: any[], config: any) {
    if (data.length === 0) return { headers: [], rows: [] };

    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => this.formatCellValue(row[header], config.formatting))
    );

    return { headers, rows };
  }

  /**
   * GERAR RESUMO
   */
  private generateSummary(data: any[], config: any) {
    const numericFields = Object.keys(data[0] || {}).filter(key => 
      typeof data[0][key] === 'number'
    );

    const summary: any = {
      totalRecords: data.length,
    };

    numericFields.forEach(field => {
      const values = data.map(row => Number(row[field]) || 0);
      summary[field] = {
        sum: values.reduce((sum, val) => sum + val, 0),
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    return summary;
  }

  /**
   * GERAR COMPARAÇÃO
   */
  private generateComparison(data: any[], config: any) {
    // Implementação simplificada - comparar primeiro vs último período
    if (data.length < 2) return { comparison: 'Dados insuficientes para comparação' };

    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);

    const numericFields = Object.keys(data[0] || {}).filter(key => 
      typeof data[0][key] === 'number'
    );

    const comparisons: any = {};

    numericFields.forEach(field => {
      const firstSum = firstHalf.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
      const secondSum = secondHalf.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
      const change = ((secondSum - firstSum) / firstSum) * 100;

      comparisons[field] = {
        previous: firstSum,
        current: secondSum,
        change: change,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    });

    return comparisons;
  }

  /**
   * ANALISAR TENDÊNCIA
   */
  private analyzeTrend(data: any[], config: any) {
    if (data.length < 3) return { trend: 'insufficient_data' };

    const numericFields = Object.keys(data[0] || {}).filter(key => 
      typeof data[0][key] === 'number'
    );

    const trends: any = {};

    numericFields.forEach(field => {
      const values = data.map(row => Number(row[field]) || 0);
      const trend = this.calculateTrendDirection(values);
      
      trends[field] = {
        direction: trend.direction,
        strength: trend.strength,
        values: values
      };
    });

    return trends;
  }

  /**
   * CALCULAR DIREÇÃO DA TENDÊNCIA
   */
  private calculateTrendDirection(values: number[]) {
    if (values.length < 2) return { direction: 'stable', strength: 0 };

    let increases = 0;
    let decreases = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) increases++;
      else if (values[i] < values[i - 1]) decreases++;
    }

    const totalChanges = increases + decreases;
    if (totalChanges === 0) return { direction: 'stable', strength: 0 };

    const strength = Math.abs(increases - decreases) / totalChanges;

    if (increases > decreases) {
      return { direction: 'up', strength };
    } else if (decreases > increases) {
      return { direction: 'down', strength };
    } else {
      return { direction: 'stable', strength: 0 };
    }
  }

  /**
   * GERAR CONFIGURAÇÃO DE VISUALIZAÇÃO
   */
  private generateVisualizationConfig(section: any, data: any) {
    const { type, config } = section;
    const { visualization } = config;

    if (!visualization) return null;

    return {
      type: visualization.chartType || 'bar',
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: visualization.showLegend !== false
          },
          title: {
            display: true,
            text: section.title
          }
        },
        scales: type === 'chart' ? {
          y: {
            beginAtZero: true
          }
        } : undefined
      },
      colors: visualization.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    };
  }

  // Utility functions
  private formatNumber(value: number, formatting?: any): string {
    const { numberFormat = 'number', precision = 2 } = formatting || {};

    switch (numberFormat) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }).format(value);
      
      case 'percentage':
        return new Intl.NumberFormat('pt-BR', {
          style: 'percent',
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }).format(value / 100);
      
      default:
        return new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }).format(value);
    }
  }

  private formatCellValue(value: any, formatting?: any): string {
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'number') {
      return this.formatNumber(value, formatting);
    }
    
    if (value instanceof Date) {
      const { dateFormat = 'dd/MM/yyyy' } = formatting || {};
      return new Intl.DateTimeFormat('pt-BR').format(value);
    }
    
    return String(value);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    return firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;
  }

  /**
   * GERAR ARQUIVO DE RELATÓRIO
   */
  private async generateReportFile(
    reportId: string,
    template: any,
    data: ProcessedReportData,
    format: string,
    options: any
  ) {
    try {
      // Implementação simplificada - na realidade usaria bibliotecas como puppeteer para PDF
      const fileName = `report_${reportId}_${Date.now()}.${format}`;
      const filePath = `uploads/reports/${fileName}`;

      // Simular geração do arquivo
      const fileContent = JSON.stringify({
        template: template.name,
        generatedAt: data.metadata.generatedAt,
        sections: data.sections,
        format,
        options
      }, null, 2);

      // Em produção, aqui seria feita a geração real do PDF/Excel
      const fileSize = Buffer.byteLength(fileContent, 'utf8');

      return {
        success: true,
        filePath,
        fileSize,
        fileName
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar arquivo do relatório'
      };
    }
  }

  /**
   * EXECUTAR CÁLCULO PERSONALIZADO
   */
  private async executeCalculation(calculation: string, parameters: Record<string, any>) {
    // Implementação simplificada de cálculos personalizados
    // Em produção, usaria um parser/avaliador seguro de expressões
    
    try {
      // Exemplo básico: suportar operações matemáticas simples
      let expression = calculation;
      
      // Substituir parâmetros
      Object.entries(parameters).forEach(([key, value]) => {
        expression = expression.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      });

      // Avaliar expressão (CUIDADO: em produção usar um parser seguro)
      const result = eval(expression); // ⚠️ Perigoso - usar apenas em desenvolvimento
      
      return [{ calculation: expression, result }];
    } catch (error) {
      return [{ calculation, error: 'Erro na avaliação da expressão' }];
    }
  }

  /**
   * PROCESSAR DADOS DO DASHBOARD
   */
  private async processDashboardData(tenantId: string, dashboardData: any) {
    const processedData: any[] = [];

    if (dashboardData.widgets) {
      for (const widget of dashboardData.widgets) {
        try {
          const widgetData = await dashboardBuilderService.processWidgetData(
            tenantId,
            widget.id,
            false
          );

          if (widgetData.success) {
            processedData.push({
              widgetId: widget.id,
              title: widget.title,
              type: widget.type,
              data: widgetData.data,
              metadata: widgetData.metadata
            });
          }
        } catch (error) {
          console.error(`Error processing widget ${widget.id}:`, error);
        }
      }
    }

    return processedData;
  }

  /**
   * LISTAR TEMPLATES DE RELATÓRIO
   */
  async getReportTemplates(
    tenantId: string,
    filters: {
      search?: string;
      category?: string;
      isPublic?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      const { 
        search, 
        category, 
        isPublic, 
        limit = 20, 
        offset = 0 
      } = filters;

      let query = db
        .select({
          template: reportTemplates,
          createdByUser: {
            name: users.name,
            email: users.email
          }
        })
        .from(reportTemplates)
        .leftJoin(users, eq(users.id, reportTemplates.createdBy))
        .where(and(
          eq(reportTemplates.tenantId, tenantId),
          eq(reportTemplates.isActive, true)
        ));

      // Aplicar filtros
      if (search) {
        query = query.where(
          or(
            ilike(reportTemplates.name, `%${search}%`),
            ilike(reportTemplates.description, `%${search}%`)
          )
        );
      }

      if (category) {
        query = query.where(eq(reportTemplates.category, category));
      }

      if (isPublic !== undefined) {
        query = query.where(eq(reportTemplates.isPublic, isPublic));
      }

      const templates = await query
        .orderBy(desc(reportTemplates.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data: templates.map(item => ({
          ...item.template,
          createdByUser: item.createdByUser
        })),
        total: templates.length
      };

    } catch (error) {
      console.error('Error getting report templates:', error);
      return {
        success: false,
        error: 'Erro ao buscar templates de relatório'
      };
    }
  }

  /**
   * LISTAR RELATÓRIOS GERADOS
   */
  async getReports(
    tenantId: string,
    filters: {
      search?: string;
      templateId?: string;
      status?: string;
      generatedBy?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      const { 
        search, 
        templateId, 
        status, 
        generatedBy,
        startDate,
        endDate,
        limit = 20, 
        offset = 0 
      } = filters;

      let query = db
        .select({
          report: reports,
          template: {
            name: reportTemplates.name,
            category: reportTemplates.category
          },
          generatedByUser: {
            name: users.name,
            email: users.email
          }
        })
        .from(reports)
        .leftJoin(reportTemplates, eq(reportTemplates.id, reports.templateId))
        .leftJoin(users, eq(users.id, reports.generatedBy))
        .where(eq(reports.tenantId, tenantId));

      // Aplicar filtros
      if (search) {
        query = query.where(
          or(
            ilike(reports.name, `%${search}%`),
            ilike(reports.description, `%${search}%`)
          )
        );
      }

      if (templateId) {
        query = query.where(eq(reports.templateId, templateId));
      }

      if (status) {
        query = query.where(eq(reports.status, status));
      }

      if (generatedBy) {
        query = query.where(eq(reports.generatedBy, generatedBy));
      }

      if (startDate) {
        query = query.where(gte(reports.createdAt, startDate));
      }

      if (endDate) {
        query = query.where(lte(reports.createdAt, endDate));
      }

      const reportsList = await query
        .orderBy(desc(reports.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data: reportsList.map(item => ({
          ...item.report,
          template: item.template,
          generatedByUser: item.generatedByUser
        })),
        total: reportsList.length
      };

    } catch (error) {
      console.error('Error getting reports:', error);
      return {
        success: false,
        error: 'Erro ao buscar relatórios'
      };
    }
  }
}

// Instância singleton
export const executiveReportsService = new ExecutiveReportsService();