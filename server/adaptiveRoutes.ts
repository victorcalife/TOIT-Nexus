import { Router } from 'express';
import { adaptiveEngine } from './adaptiveEngine';
import { authMiddleware } from './authMiddleware';
import { db } from './db';
import { tenants, kpiDashboards, completeWorkflows } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = Router();

/**
 * 🧠 ROTAS DO SISTEMA ADAPTATIVO TOIT NEXUS
 * Expõe funcionalidades de Machine Learning e adaptação automática
 */

/**
 * GET /api/adaptive/analyze/:tenantId
 * Executa análise completa de padrões para um tenant
 */
router.get('/analyze/:tenantId', authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verificar se usuário tem acesso ao tenant
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para este tenant'
      });
    }

    console.log(`🧠 Iniciando análise adaptativa para tenant: ${tenantId}`);

    // Executar análise completa
    const patterns = await adaptiveEngine.analyzeDataPatterns(tenantId);
    
    // Gerar KPIs adaptativos
    const adaptiveKPIs = await adaptiveEngine.generateAdaptiveKPIs(tenantId);
    
    // Executar adaptações automáticas
    const adaptations = await adaptiveEngine.executeAdaptations(tenantId);

    res.json({
      success: true,
      data: {
        tenantId,
        patterns,
        adaptiveKPIs,
        adaptations,
        analysisTimestamp: new Date().toISOString(),
        summary: {
          totalClients: patterns.clientPatterns?.totalClients || 0,
          avgInvestment: patterns.clientPatterns?.avgInvestment || 0,
          riskDistribution: patterns.clientPatterns?.riskDistribution || {},
          suggestedKPIs: adaptiveKPIs.length,
          adaptationsExecuted: adaptations.adaptationsCount
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Erro na análise adaptativa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao executar análise adaptativa',
      error: error.message
    });
  }
});

/**
 * POST /api/adaptive/realtime-analysis
 * Análise em tempo real quando dados mudam
 */
router.post('/realtime-analysis', authMiddleware, async (req, res) => {
  try {
    const { tenantId, dataType, data } = req.body;
    
    // Verificar se usuário tem acesso ao tenant
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para este tenant'
      });
    }

    if (!tenantId || !dataType || !data) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: tenantId, dataType, data'
      });
    }

    console.log(`⚡ Análise em tempo real: ${dataType} para tenant ${tenantId}`);

    // Executar análise em tempo real
    const analysis = await adaptiveEngine.performRealtimeAnalysis(tenantId, dataType, data);

    res.json({
      success: true,
      data: {
        tenantId,
        dataType,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Erro na análise em tempo real:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao executar análise em tempo real',
      error: error.message
    });
  }
});

/**
 * GET /api/adaptive/kpis/suggestions/:tenantId
 * Obter sugestões de KPIs adaptativos
 */
router.get('/kpis/suggestions/:tenantId', authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verificar acesso
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para este tenant'
      });
    }

    console.log(`📊 Gerando sugestões de KPIs para tenant: ${tenantId}`);

    // Gerar KPIs adaptativos
    const kpiSuggestions = await adaptiveEngine.generateAdaptiveKPIs(tenantId);

    res.json({
      success: true,
      data: {
        tenantId,
        suggestions: kpiSuggestions,
        count: kpiSuggestions.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar sugestões de KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar sugestões de KPIs',
      error: error.message
    });
  }
});

/**
 * POST /api/adaptive/kpis/apply
 * Aplicar um KPI sugerido automaticamente
 */
router.post('/kpis/apply', authMiddleware, async (req, res) => {
  try {
    const { tenantId, kpiData } = req.body;
    
    // Verificar acesso
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para este tenant'
      });
    }

    if (!kpiData || !kpiData.name || !kpiData.type) {
      return res.status(400).json({
        success: false,
        message: 'Dados do KPI inválidos'
      });
    }

    console.log(`✅ Aplicando KPI adaptativo: ${kpiData.name} para tenant ${tenantId}`);

    // Criar KPI no banco
    const kpiId = nanoid();
    const newKPI = await db.insert(kpiDashboards).values({
      id: kpiId,
      tenantId: tenantId,
      title: kpiData.name,
      description: `KPI adaptativo gerado automaticamente baseado nos padrões de dados`,
      visualizationType: kpiData.chartType || 'number',
      configuration: JSON.stringify({
        adaptiveKPI: true,
        originalSuggestion: kpiData,
        adaptiveRules: kpiData.adaptiveRules || {},
        query: kpiData.query || '',
        threshold: kpiData.threshold || 0,
        createdByEngine: true
      }),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    res.status(201).json({
      success: true,
      message: 'KPI adaptativo criado com sucesso',
      data: {
        kpiId: kpiId,
        tenantId: tenantId,
        kpiName: kpiData.name,
        applied: true,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao aplicar KPI adaptativo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aplicar KPI adaptativo',
      error: error.message
    });
  }
});

/**
 * GET /api/adaptive/patterns/:tenantId
 * Obter padrões de dados analisados para um tenant
 */
router.get('/patterns/:tenantId', authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verificar acesso
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para este tenant'
      });
    }

    console.log(`📈 Obtendo padrões de dados para tenant: ${tenantId}`);

    // Analisar padrões atuais
    const patterns = await adaptiveEngine.analyzeDataPatterns(tenantId);

    res.json({
      success: true,
      data: {
        tenantId,
        patterns,
        analyzedAt: new Date().toISOString(),
        insights: {
          clientGrowthTrend: patterns.clientPatterns?.totalClients > 10 ? 'growing' : 'starting',
          investmentProfile: patterns.clientPatterns?.avgInvestment > 100000 ? 'high_value' : 'standard',
          riskBalance: this.analyzeRiskBalance(patterns.clientPatterns?.riskDistribution),
          automationLevel: patterns.workflowPatterns?.totalWorkflows > 5 ? 'advanced' : 'basic'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao obter padrões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter padrões de dados',
      error: error.message
    });
  }
});

/**
 * POST /api/adaptive/trigger/data-change
 * Endpoint para disparar análise quando dados mudam
 */
router.post('/trigger/data-change', authMiddleware, async (req, res) => {
  try {
    const { tenantId, changeType, entity, oldData, newData } = req.body;
    
    if (!tenantId || !changeType || !entity) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: tenantId, changeType, entity'
      });
    }

    console.log(`🔔 Trigger de mudança de dados: ${changeType} em ${entity} para tenant ${tenantId}`);

    // Preparar dados para análise
    const analysisData = {
      entity,
      changeType,
      oldData: oldData || {},
      newData: newData || {},
      timestamp: new Date().toISOString()
    };

    // Executar análise em tempo real
    const realtimeAnalysis = await adaptiveEngine.performRealtimeAnalysis(
      tenantId, 
      changeType, 
      analysisData
    );

    // Se mudança for significativa, re-analisar padrões
    let updatedPatterns = null;
    if (changeType === 'new_client' || changeType === 'investment_change') {
      console.log('📊 Mudança significativa detectada, re-analisando padrões...');
      updatedPatterns = await adaptiveEngine.analyzeDataPatterns(tenantId);
    }

    res.json({
      success: true,
      data: {
        tenantId,
        trigger: {
          changeType,
          entity,
          processedAt: new Date().toISOString()
        },
        realtimeAnalysis,
        updatedPatterns,
        recommendations: this.generateRecommendationsFromAnalysis(realtimeAnalysis)
      }
    });

  } catch (error: any) {
    console.error('❌ Erro no trigger de mudança:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar mudança de dados',
      error: error.message
    });
  }
});

/**
 * GET /api/adaptive/health/:tenantId
 * Verificar saúde do sistema adaptativo para um tenant
 */
router.get('/health/:tenantId', authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verificar acesso
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para este tenant'
      });
    }

    // Verificar dados do tenant
    const tenantInfo = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (tenantInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant não encontrado'
      });
    }

    // Verificar KPIs adaptativos existentes
    const adaptiveKPIs = await db
      .select()
      .from(kpiDashboards)
      .where(eq(kpiDashboards.tenantId, tenantId));

    const adaptiveKPICount = adaptiveKPIs.filter(kpi => {
      try {
        const config = JSON.parse(kpi.configuration || '{}');
        return config.adaptiveKPI === true || config.createdByEngine === true;
      } catch {
        return false;
      }
    }).length;

    // Verificar workflows
    const workflows = await db
      .select()
      .from(completeWorkflows)
      .where(eq(completeWorkflows.tenantId, tenantId));

    const health = {
      tenantId,
      tenantName: tenantInfo[0].name,
      status: 'healthy',
      adaptiveFeatures: {
        adaptiveKPIs: {
          count: adaptiveKPICount,
          status: adaptiveKPICount > 0 ? 'active' : 'inactive'
        },
        workflows: {
          count: workflows.length,
          activeCount: workflows.filter(w => w.status === 'active').length,
          status: workflows.length > 0 ? 'active' : 'inactive'
        },
        lastAnalysis: null, // Could be stored in database
        adaptationLevel: this.calculateAdaptationLevel(adaptiveKPICount, workflows.length)
      },
      recommendations: []
    };

    // Gerar recomendações
    if (adaptiveKPICount === 0) {
      health.recommendations.push('Execute análise adaptativa para gerar KPIs inteligentes');
    }

    if (workflows.length === 0) {
      health.recommendations.push('Configure workflows para automação inteligente');
    }

    res.json({
      success: true,
      data: health
    });

  } catch (error: any) {
    console.error('❌ Erro no health check adaptativo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar saúde do sistema adaptativo',
      error: error.message
    });
  }
});

// FUNÇÕES UTILITÁRIAS PRIVADAS
function analyzeRiskBalance(riskDistribution: any): string {
  if (!riskDistribution) return 'unknown';
  
  const total = Object.values(riskDistribution).reduce((a: any, b: any) => a + b, 0);
  if (total === 0) return 'no_data';
  
  const conservative = (riskDistribution.conservative || 0) / total;
  const moderate = (riskDistribution.moderate || 0) / total;
  const aggressive = (riskDistribution.aggressive || 0) / total;
  
  if (conservative > 0.6) return 'conservative_heavy';
  if (aggressive > 0.5) return 'aggressive_heavy';
  if (moderate > 0.4) return 'balanced';
  
  return 'mixed';
}

function generateRecommendationsFromAnalysis(analysis: any): string[] {
  const recommendations = [];
  
  if (analysis.suggestedActions && analysis.suggestedActions.length > 0) {
    recommendations.push(...analysis.suggestedActions);
  }
  
  if (analysis.requiresReview) {
    recommendations.push('Revisar mudança significativa detectada');
  }
  
  if (analysis.suggestedOptimizations && analysis.suggestedOptimizations.length > 0) {
    recommendations.push(...analysis.suggestedOptimizations);
  }
  
  return recommendations;
}

function calculateAdaptationLevel(kpiCount: number, workflowCount: number): string {
  const score = kpiCount + (workflowCount * 0.5);
  
  if (score === 0) return 'none';
  if (score < 3) return 'basic';
  if (score < 8) return 'intermediate';
  return 'advanced';
}

export default router;