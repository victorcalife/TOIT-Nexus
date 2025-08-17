import { db } from './db';
import { eq, sql, and, gte, lte, desc } from 'drizzle-orm';
import { 
  clients, queryBuilders, kpiDashboards, completeWorkflows, 
  completeWorkflowExecutions, uploadedFiles, databaseConnections
} from '@shared/schema';

// MOTOR DE ADAPTAÇÃO INTELIGENTE TOIT NEXUS
export class AdaptiveEngine {
  private tenantPatterns: Map<string, any> = new Map();

  // ANÁLISE AUTOMÁTICA DOS DADOS POR TENANT
  async analyzeDataPatterns(tenantId: string): Promise<any> {
    console.log(`🧠 Analisando padrões de dados para tenant ${tenantId}...`);

    // Buscar todos os dados do tenant
    const [clientsData, queriesData, workflowsData, filesData] = await Promise.all([
      db.select().from(clients).where(eq(clients.tenantId, tenantId)),
      db.select().from(queryBuilders).where(eq(queryBuilders.tenantId, tenantId)),
      db.select().from(completeWorkflows).where(eq(completeWorkflows.tenantId, tenantId)),
      db.select().from(uploadedFiles).where(eq(uploadedFiles.tenantId, tenantId))
    ]);

    // Análise inteligente dos padrões
    const patterns = {
      // PADRÕES DE CLIENTES
      clientPatterns: this.analyzeClientPatterns(clientsData),
      
      // PADRÕES DE INVESTIMENTO
      investmentPatterns: this.analyzeInvestmentPatterns(clientsData),
      
      // PADRÕES DE RISCO
      riskPatterns: this.analyzeRiskPatterns(clientsData),
      
      // PADRÕES DE WORKFLOW
      workflowPatterns: this.analyzeWorkflowPatterns(workflowsData),
      
      // PADRÕES DE DADOS
      dataPatterns: this.analyzeDataPatterns(queriesData, filesData),
    };

    // Salvar padrões na memória
    this.tenantPatterns.set(tenantId, patterns);

    console.log(`✅ Padrões analisados para ${tenantId}:`, patterns);
    return patterns;
  }

  // ANÁLISE DE PADRÕES DE CLIENTES
  private analyzeClientPatterns(clients: any[]): any {
    if (clients.length === 0) return { empty: true };

    // Distribuição por perfil de risco
    const riskDistribution = clients.reduce((acc, client) => {
      const risk = client.riskProfile || 'moderate';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});

    // Valor médio de investimento
    const investments = clients
      .map(c => c.investmentAmount || 0)
      .filter(amount => amount > 0);
    
    const avgInvestment = investments.length > 0 
      ? investments.reduce((a, b) => a + b, 0) / investments.length 
      : 0;

    // Detecção de outliers
    const sortedInvestments = investments.sort((a, b) => a - b);
    const q1 = sortedInvestments[Math.floor(sortedInvestments.length * 0.25)] || 0;
    const q3 = sortedInvestments[Math.floor(sortedInvestments.length * 0.75)] || 0;
    const iqr = q3 - q1;

    return {
      totalClients: clients.length,
      riskDistribution,
      avgInvestment,
      medianInvestment: sortedInvestments[Math.floor(sortedInvestments.length / 2)] || 0,
      q1Investment: q1,
      q3Investment: q3,
      outlierThreshold: q3 + (1.5 * iqr),
      suggestedKPIs: this.suggestClientKPIs(clients.length, riskDistribution, avgInvestment)
    };
  }

  // ANÁLISE DE PADRÕES DE INVESTIMENTO
  private analyzeInvestmentPatterns(clients: any[]): any {
    const investments = clients
      .map(c => ({ amount: c.investmentAmount || 0, risk: c.riskProfile || 'moderate' }))
      .filter(inv => inv.amount > 0);

    if (investments.length === 0) return { empty: true };

    // Análise por perfil de risco
    const riskAnalysis = investments.reduce((acc, inv) => {
      if (!acc[inv.risk]) {
        acc[inv.risk] = { amounts: [], count: 0 };
      }
      acc[inv.risk].amounts.push(inv.amount);
      acc[inv.risk].count++;
      return acc;
    }, {} as any);

    // Calcular médias por risco
    Object.keys(riskAnalysis).forEach(risk => {
      const amounts = riskAnalysis[risk].amounts;
      riskAnalysis[risk].avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      riskAnalysis[risk].min = Math.min(...amounts);
      riskAnalysis[risk].max = Math.max(...amounts);
    });

    return {
      totalInvestments: investments.length,
      riskAnalysis,
      suggestedThresholds: this.suggestInvestmentThresholds(riskAnalysis),
      adaptiveRules: this.generateAdaptiveRules(riskAnalysis)
    };
  }

  // ANÁLISE DE PADRÕES DE RISCO
  private analyzeRiskPatterns(clients: any[]): any {
    const riskData = clients.map(c => ({
      risk: c.riskProfile || 'moderate',
      investment: c.investmentAmount || 0,
      age: this.calculateAge(c.birthDate),
      category: c.categoryId
    }));

    // Detecção de incompatibilidades
    const incompatibilities = riskData.filter(client => {
      // Regras adaptativas baseadas em padrões
      if (client.risk === 'conservative' && client.investment > 500000) return true;
      if (client.risk === 'aggressive' && client.investment < 50000) return true;
      if (client.age > 65 && client.risk === 'aggressive') return true;
      return false;
    });

    return {
      totalRiskProfiles: riskData.length,
      incompatibilities: incompatibilities.length,
      riskAlerts: this.generateRiskAlerts(riskData),
      adaptiveThresholds: this.calculateAdaptiveThresholds(riskData)
    };
  }

  // ANÁLISE DE PADRÕES DE WORKFLOW
  private analyzeWorkflowPatterns(workflows: any[]): any {
    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'active').length,
      avgExecutions: workflows.reduce((acc, w) => acc + (w.executionCount || 0), 0) / workflows.length || 0,
      suggestedOptimizations: this.suggestWorkflowOptimizations(workflows)
    };
  }

  // ANÁLISE DE PADRÕES DE DADOS
  private analyzeDataPatterns(queries: any[], files: any[]): any {
    return {
      totalQueries: queries.length,
      totalFiles: files.length,
      queryTypes: this.analyzeQueryTypes(queries),
      fileTypes: this.analyzeFileTypes(files),
      suggestedConnections: this.suggestDataConnections(queries, files)
    };
  }

  // SUGESTÕES INTELIGENTES DE KPIs
  private suggestClientKPIs(clientCount: number, riskDistribution: any, avgInvestment: number): string[] {
    const suggestions = ['total_clients'];

    if (clientCount > 100) {
      suggestions.push('client_growth_rate', 'client_retention_rate');
    }

    if (avgInvestment > 100000) {
      suggestions.push('avg_ticket', 'high_value_clients');
    }

    if (riskDistribution.aggressive > (clientCount * 0.3)) {
      suggestions.push('risk_concentration', 'aggressive_portfolio_size');
    }

    return suggestions;
  }

  // GERAÇÃO DE LIMITES ADAPTATIVOS
  private suggestInvestmentThresholds(riskAnalysis: any): any {
    const thresholds: any = {};

    Object.keys(riskAnalysis).forEach(risk => {
      const analysis = riskAnalysis[risk];
      thresholds[risk] = {
        minRecommended: Math.floor(analysis.avg * 0.5),
        maxRecommended: Math.floor(analysis.avg * 2),
        alertThreshold: Math.floor(analysis.max * 0.9),
        reviewThreshold: Math.floor(analysis.avg * 1.5)
      };
    });

    return thresholds;
  }

  // GERAÇÃO DE REGRAS ADAPTATIVAS
  private generateAdaptiveRules(riskAnalysis: any): any[] {
    const rules = [];

    Object.keys(riskAnalysis).forEach(risk => {
      const analysis = riskAnalysis[risk];
      
      rules.push({
        condition: `riskProfile === '${risk}' && investmentAmount > ${analysis.max}`,
        action: 'require_manager_approval',
        reason: `Investimento acima do padrão para perfil ${risk}`,
        adaptive: true
      });

      rules.push({
        condition: `riskProfile === '${risk}' && investmentAmount < ${Math.floor(analysis.avg * 0.1)}`,
        action: 'suggest_risk_review',
        reason: `Investimento muito baixo para perfil ${risk}`,
        adaptive: true
      });
    });

    return rules;
  }

  // ALERTAS DE RISCO ADAPTATIVOS
  private generateRiskAlerts(riskData: any[]): any[] {
    const alerts = [];

    // Alertas baseados em padrões detectados
    const conservativeHighInvestors = riskData.filter(
      c => c.risk === 'conservative' && c.investment > 300000
    );

    if (conservativeHighInvestors.length > 0) {
      alerts.push({
        type: 'risk_mismatch',
        severity: 'medium',
        count: conservativeHighInvestors.length,
        message: `${conservativeHighInvestors.length} clientes conservadores com altos investimentos`,
        adaptive: true
      });
    }

    return alerts;
  }

  // CÁLCULO DE LIMITES ADAPTATIVOS
  private calculateAdaptiveThresholds(riskData: any[]): any {
    const thresholds: any = {};

    ['conservative', 'moderate', 'aggressive'].forEach(risk => {
      const riskClients = riskData.filter(c => c.risk === risk);
      if (riskClients.length > 0) {
        const investments = riskClients.map(c => c.investment).filter(i => i > 0);
        if (investments.length > 0) {
          const avg = investments.reduce((a, b) => a + b, 0) / investments.length;
          const max = Math.max(...investments);
          
          thresholds[risk] = {
            warningThreshold: Math.floor(avg * 1.5),
            alertThreshold: Math.floor(avg * 2),
            maxObserved: max,
            adaptedAt: new Date().toISOString()
          };
        }
      }
    });

    return thresholds;
  }

  // SUGESTÕES DE OTIMIZAÇÃO DE WORKFLOWS
  private suggestWorkflowOptimizations(workflows: any[]): string[] {
    const suggestions = [];

    const lowExecutionWorkflows = workflows.filter(w => (w.executionCount || 0) < 5);
    if (lowExecutionWorkflows.length > 0) {
      suggestions.push(`${lowExecutionWorkflows.length} workflows com baixa execução - considere revisar`);
    }

    const inactiveWorkflows = workflows.filter(w => w.status !== 'active');
    if (inactiveWorkflows.length > 0) {
      suggestions.push(`${inactiveWorkflows.length} workflows inativos - considere ativar ou remover`);
    }

    return suggestions;
  }

  // ANÁLISE DE TIPOS DE QUERY
  private analyzeQueryTypes(queries: any[]): any {
    const types = queries.reduce((acc, q) => {
      const type = q.connectionType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return types;
  }

  // ANÁLISE DE TIPOS DE ARQUIVO
  private analyzeFileTypes(files: any[]): any {
    const types = files.reduce((acc, f) => {
      const ext = f.originalName?.split('.').pop()?.toLowerCase() || 'unknown';
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {});

    return types;
  }

  // SUGESTÕES DE CONEXÕES DE DADOS
  private suggestDataConnections(queries: any[], files: any[]): string[] {
    const suggestions = [];

    if (files.some(f => f.originalName?.includes('.csv'))) {
      suggestions.push('Considere configurar importação automática de CSVs');
    }

    if (queries.filter(q => q.connectionType === 'database').length > 3) {
      suggestions.push('Múltiplas queries de banco - considere otimizar com views');
    }

    return suggestions;
  }

  // GERAÇÃO AUTOMÁTICA DE KPIs ADAPTATIVOS
  async generateAdaptiveKPIs(tenantId: string): Promise<any[]> {
    const patterns = await this.analyzeDataPatterns(tenantId);
    const kpis = [];

    // KPI de Ticket Médio Adaptativo
    if (patterns.clientPatterns?.avgInvestment > 0) {
      kpis.push({
        name: 'Ticket Médio Adaptativo',
        type: 'metric',
        query: 'SELECT AVG(investment_amount) as avg_ticket FROM clients WHERE tenant_id = ?',
        threshold: patterns.clientPatterns.avgInvestment,
        adaptiveRules: {
          autoAdjust: true,
          recalculateFrequency: 'weekly',
          alertIfDeviationOver: 20
        }
      });
    }

    // KPI de Distribuição de Risco Adaptativa
    if (patterns.riskPatterns?.totalRiskProfiles > 0) {
      kpis.push({
        name: 'Distribuição de Risco',
        type: 'chart',
        chartType: 'pie',
        query: 'SELECT risk_profile, COUNT(*) as count FROM clients WHERE tenant_id = ? GROUP BY risk_profile',
        adaptiveRules: {
          alertIfImbalanced: true,
          suggestRebalancing: true,
          monitorIncompatibilities: true
        }
      });
    }

    // KPI de Performance de Workflows
    if (patterns.workflowPatterns?.totalWorkflows > 0) {
      kpis.push({
        name: 'Performance de Workflows',
        type: 'chart',
        chartType: 'bar',
        query: 'SELECT name, execution_count FROM complete_workflows WHERE tenant_id = ?',
        adaptiveRules: {
          identifyUnderperformers: true,
          suggestOptimizations: true,
          autoDisableUnused: false
        }
      });
    }

    return kpis;
  }

  // EXECUÇÃO DE ADAPTAÇÕES AUTOMÁTICAS
  async executeAdaptations(tenantId: string): Promise<any> {
    console.log(`🔄 Executando adaptações automáticas para tenant ${tenantId}...`);

    const patterns = await this.analyzeDataPatterns(tenantId);
    const adaptations = [];

    // Ajustar limites de investimento
    if (patterns.investmentPatterns?.suggestedThresholds) {
      adaptations.push({
        type: 'threshold_adjustment',
        data: patterns.investmentPatterns.suggestedThresholds,
        applied: true
      });
    }

    // Gerar novos KPIs adaptativos
    const newKPIs = await this.generateAdaptiveKPIs(tenantId);
    if (newKPIs.length > 0) {
      adaptations.push({
        type: 'kpi_generation',
        count: newKPIs.length,
        kpis: newKPIs
      });
    }

    // Ajustar regras de workflow
    if (patterns.investmentPatterns?.adaptiveRules) {
      adaptations.push({
        type: 'workflow_rules',
        rules: patterns.investmentPatterns.adaptiveRules
      });
    }

    console.log(`✅ ${adaptations.length} adaptações executadas para ${tenantId}`);
    return {
      tenantId,
      adaptationsCount: adaptations.length,
      adaptations,
      timestamp: new Date().toISOString()
    };
  }

  // UTILITÁRIOS
  private calculateAge(birthDate: string | null): number {
    if (!birthDate) return 0;
    return new Date().getFullYear() - new Date(birthDate).getFullYear();
  }

  // ANÁLISE EM TEMPO REAL
  async performRealtimeAnalysis(tenantId: string, dataType: string, data: any): Promise<any> {
    console.log(`⚡ Análise em tempo real: ${dataType} para tenant ${tenantId}`);

    switch (dataType) {
      case 'new_client':
        return this.analyzeNewClientImpact(tenantId, data);
      case 'investment_change':
        return this.analyzeInvestmentChange(tenantId, data);
      case 'workflow_execution':
        return this.analyzeWorkflowExecution(tenantId, data);
      default:
        return { message: 'Tipo de análise não suportado' };
    }
  }

  private async analyzeNewClientImpact(tenantId: string, clientData: any): Promise<any> {
    const patterns = this.tenantPatterns.get(tenantId);
    if (!patterns) return { message: 'Padrões não encontrados' };

    const impact = {
      riskImpact: this.calculateRiskImpact(patterns, clientData),
      investmentImpact: this.calculateInvestmentImpact(patterns, clientData),
      suggestedActions: []
    };

    // Sugerir ações baseadas no impacto
    if (impact.riskImpact.deviation > 15) {
      impact.suggestedActions.push('Considere rebalancear portfolio');
    }

    if (impact.investmentImpact.isOutlier) {
      impact.suggestedActions.push('Revisar perfil de investimento');
    }

    return impact;
  }

  private calculateRiskImpact(patterns: any, clientData: any): any {
    const currentDistribution = patterns.clientPatterns?.riskDistribution || {};
    const newRisk = clientData.riskProfile;
    
    return {
      riskProfile: newRisk,
      currentPercentage: (currentDistribution[newRisk] || 0) / patterns.clientPatterns?.totalClients * 100,
      deviation: Math.abs(33.33 - ((currentDistribution[newRisk] || 0) / patterns.clientPatterns?.totalClients * 100))
    };
  }

  private calculateInvestmentImpact(patterns: any, clientData: any): any {
    const avgInvestment = patterns.clientPatterns?.avgInvestment || 0;
    const investment = clientData.investmentAmount || 0;
    
    return {
      investment,
      avgInvestment,
      deviation: Math.abs(investment - avgInvestment),
      isOutlier: investment > patterns.clientPatterns?.outlierThreshold
    };
  }

  private async analyzeInvestmentChange(tenantId: string, changeData: any): Promise<any> {
    return {
      oldValue: changeData.oldValue,
      newValue: changeData.newValue,
      percentageChange: ((changeData.newValue - changeData.oldValue) / changeData.oldValue) * 100,
      requiresReview: Math.abs(changeData.newValue - changeData.oldValue) > 100000
    };
  }

  private async analyzeWorkflowExecution(tenantId: string, executionData: any): Promise<any> {
    return {
      workflowId: executionData.workflowId,
      executionTime: executionData.executionTime,
      success: executionData.status === 'completed',
      suggestedOptimizations: executionData.executionTime > 30000 ? ['Considere otimizar steps'] : []
    };
  }
}

export const adaptiveEngine = new AdaptiveEngine();