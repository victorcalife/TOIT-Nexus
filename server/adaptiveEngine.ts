import { storage } from "./storage";
import { eq, sql, desc } from "drizzle-orm";
import { db } from "./db";
import { clients, kpiDefinitions, workflowRules, reports } from "@shared/schema";

export class AdaptiveEngine {
  
  // Analyze tenant data patterns and suggest KPIs
  async analyzeAndSuggestKPIs(tenantId: string) {
    try {
      // Analyze client data distribution
      const clientAnalysis = await db
        .select({
          riskProfile: clients.riskProfile,
          count: sql<number>`count(*)`,
          avgInvestment: sql<number>`avg(current_investment)`,
          totalInvestment: sql<number>`sum(current_investment)`
        })
        .from(clients)
        .where(eq(clients.tenantId, tenantId))
        .groupBy(clients.riskProfile);

      const suggestions = [];

      // Suggest KPIs based on data patterns
      for (const analysis of clientAnalysis) {
        // Portfolio distribution KPI
        suggestions.push({
          name: `Clientes ${analysis.riskProfile} (%)`,
          category: 'portfolio',
          calculationType: 'percentage',
          dataSource: {
            table: 'clients',
            field: 'risk_profile',
            filter: { risk_profile: analysis.riskProfile }
          },
          adaptationRules: {
            autoThreshold: true,
            alertIfBelow: analysis.count / clientAnalysis.length * 0.8 // Alert if drops below 80% of current
          }
        });

        // Investment concentration KPI
        suggestions.push({
          name: `Investimento Médio ${analysis.riskProfile}`,
          category: 'financial',
          calculationType: 'average',
          dataSource: {
            table: 'clients',
            field: 'current_investment',
            filter: { risk_profile: analysis.riskProfile }
          },
          targetValue: analysis.avgInvestment * 1.1, // Target 10% growth
          adaptationRules: {
            adjustTargetMonthly: true,
            baselineRecalculation: 'quarterly'
          }
        });
      }

      return suggestions;
    } catch (error) {
      console.error("Error analyzing KPIs:", error);
      return [];
    }
  }

  // Auto-generate workflow rules based on client behavior patterns
  async generateAdaptiveWorkflowRules(tenantId: string) {
    try {
      // Analyze client investment patterns
      const investmentRanges = await db
        .select({
          minInvestment: sql<number>`min(current_investment)`,
          maxInvestment: sql<number>`max(current_investment)`,
          avgInvestment: sql<number>`avg(current_investment)`,
          stdDev: sql<number>`stddev(current_investment)`
        })
        .from(clients)
        .where(eq(clients.tenantId, tenantId));

      const range = investmentRanges[0];
      if (!range) return [];

      const rules = [];

      // High-value client identification rule
      const highValueThreshold = range.avgInvestment + range.stdDev;
      rules.push({
        name: 'Identificação Cliente Alto Valor',
        description: 'Automaticamente identifica e categoriza clientes de alto valor',
        triggerConditions: {
          field: 'current_investment',
          operator: 'greater_than',
          value: highValueThreshold,
          adaptiveThreshold: true
        },
        actions: [
          {
            type: 'categorize',
            category: 'high_value',
            priority: 'high'
          },
          {
            type: 'notify',
            template: 'high_value_client_alert'
          }
        ],
        dataThresholds: {
          recalculateThreshold: 'monthly',
          baseValue: highValueThreshold
        },
        learningRules: {
          adjustBasedOnOutliers: true,
          considerSeasonality: true
        }
      });

      // Risk profile mismatch detection
      rules.push({
        name: 'Detecção Incompatibilidade Perfil de Risco',
        description: 'Detecta clientes com investimentos incompatíveis com perfil de risco',
        triggerConditions: {
          type: 'complex',
          conditions: [
            {
              field: 'risk_profile',
              operator: 'equals',
              value: 'conservative'
            },
            {
              field: 'current_investment',
              operator: 'greater_than',
              value: range.avgInvestment * 1.5 // Conservative but high investment
            }
          ]
        },
        actions: [
          {
            type: 'review_request',
            assignTo: 'risk_manager'
          },
          {
            type: 'flag',
            reason: 'risk_profile_mismatch'
          }
        ],
        dataThresholds: {
          adaptiveMultiplier: 1.5,
          recalculateFrequency: 'weekly'
        }
      });

      return rules;
    } catch (error) {
      console.error("Error generating workflow rules:", error);
      return [];
    }
  }

  // Create adaptive report configurations
  async createAdaptiveReports(tenantId: string) {
    try {
      const clientStats = await db
        .select({
          totalClients: sql<number>`count(*)`,
          totalInvestment: sql<number>`sum(current_investment)`,
          riskDistribution: sql<any>`json_agg(risk_profile)`
        })
        .from(clients)
        .where(eq(clients.tenantId, tenantId));

      const stats = clientStats[0];
      if (!stats) return [];

      const reportConfigs = [];

      // Portfolio overview report with adaptive visualizations
      reportConfigs.push({
        name: 'Visão Geral do Portfólio',
        template: {
          type: 'dashboard',
          sections: [
            {
              title: 'Distribuição por Perfil de Risco',
              type: 'pie_chart',
              dataSource: 'clients.risk_profile'
            },
            {
              title: 'Evolução de Investimentos',
              type: 'line_chart',
              dataSource: 'clients.current_investment',
              timeField: 'updated_at'
            }
          ]
        },
        dataFilters: {
          defaultDateRange: '30d',
          adaptiveFilters: [
            {
              field: 'risk_profile',
              autoGenerate: true
            },
            {
              field: 'current_investment',
              type: 'range',
              autoAdjust: true
            }
          ]
        },
        kpiConfiguration: {
          primaryKPIs: [
            'total_clients',
            'total_investment',
            'avg_investment_per_client'
          ],
          adaptiveKPIs: true, // Automatically add relevant KPIs based on data patterns
          alertThresholds: {
            autoCalculate: true,
            basedOnHistoricalData: true
          }
        },
        visualizationSettings: {
          adaptiveChartTypes: true, // Choose best chart type based on data
          colorScheme: 'tenant_branded',
          responsiveLayouts: true
        },
        autoAdaptRules: {
          updateFrequency: 'daily',
          adaptBasedOnDataVolume: true,
          seasonalAdjustments: true
        }
      });

      // Risk analysis report
      reportConfigs.push({
        name: 'Análise de Risco Dinâmica',
        template: {
          type: 'analytical',
          sections: [
            {
              title: 'Matriz de Risco vs Investimento',
              type: 'scatter_plot',
              xAxis: 'current_investment',
              yAxis: 'risk_score'
            },
            {
              title: 'Alertas de Risco',
              type: 'alert_table',
              dataSource: 'risk_alerts'
            }
          ]
        },
        dataFilters: {
          riskThresholds: {
            autoCalculate: true,
            adaptivePercentiles: [10, 25, 75, 90]
          }
        },
        autoAdaptRules: {
          adjustThresholds: 'weekly',
          considerMarketConditions: true,
          learningFromAlerts: true
        }
      });

      return reportConfigs;
    } catch (error) {
      console.error("Error creating adaptive reports:", error);
      return [];
    }
  }

  // Execute adaptation cycle for a tenant
  async executeAdaptationCycle(tenantId: string) {
    try {
      console.log(`Starting adaptation cycle for tenant: ${tenantId}`);

      // 1. Analyze and suggest KPIs
      const kpiSuggestions = await this.analyzeAndSuggestKPIs(tenantId);
      
      // 2. Generate adaptive workflow rules
      const workflowRuleSuggestions = await this.generateAdaptiveWorkflowRules(tenantId);
      
      // 3. Create adaptive reports
      const reportSuggestions = await this.createAdaptiveReports(tenantId);

      // 4. Apply suggestions (could be automatic or require approval)
      const results = {
        kpisCreated: 0,
        rulesCreated: 0,
        reportsUpdated: 0,
        suggestions: {
          kpis: kpiSuggestions,
          workflowRules: workflowRuleSuggestions,
          reports: reportSuggestions
        }
      };

      // Auto-apply non-destructive changes
      for (const kpi of kpiSuggestions.slice(0, 3)) { // Apply first 3 KPIs
        try {
          await storage.createKPI({
            tenantId,
            ...kpi,
            isActive: true
          });
          results.kpisCreated++;
        } catch (error) {
          console.error("Error creating KPI:", error);
        }
      }

      console.log(`Adaptation cycle completed for tenant: ${tenantId}`, results);
      return results;
    } catch (error) {
      console.error("Error in adaptation cycle:", error);
      throw error;
    }
  }

  // Real-time adaptation based on data changes
  async onDataChange(tenantId: string, changeType: string, entityType: string, entityData: any) {
    try {
      // React to specific data changes
      switch (changeType) {
        case 'client_added':
          await this.adaptToNewClient(tenantId, entityData);
          break;
        case 'investment_updated':
          await this.adaptToInvestmentChange(tenantId, entityData);
          break;
        case 'workflow_executed':
          await this.adaptToWorkflowExecution(tenantId, entityData);
          break;
      }
    } catch (error) {
      console.error("Error in real-time adaptation:", error);
    }
  }

  private async adaptToNewClient(tenantId: string, clientData: any) {
    // Check if new client changes KPI thresholds
    // Update workflow rules if needed
    // Adjust report filters
  }

  private async adaptToInvestmentChange(tenantId: string, investmentData: any) {
    // Recalculate investment-based KPIs
    // Check if workflow triggers need adjustment
  }

  private async adaptToWorkflowExecution(tenantId: string, executionData: any) {
    // Learn from workflow execution patterns
    // Adjust trigger conditions based on success/failure rates
  }
}

export const adaptiveEngine = new AdaptiveEngine();