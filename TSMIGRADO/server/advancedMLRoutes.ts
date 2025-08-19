/**
 * ADVANCED ML ROUTES - APIs para sistema TensorFlow.js avançado
 * Endpoints para todos os modelos ML implementados com TensorFlow.js
 * Integração completa com advancedMLEngine e mlModelsService
 */

import express from 'express';
import { z } from 'zod';
import { requireAuth } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { advancedMLEngine } from './advancedMLEngine';
import { mlModelsService } from './mlModelsService';

const router = express.Router();

// Middleware para autenticação e tenant
router.use(requireAuth);
router.use(tenantMiddleware);

// ==========================================
// SCHEMAS DE VALIDAÇÃO ZOD
// ==========================================

const BehaviorAnalysisSchema = z.object({
  userId: z.string(),
  behaviorData: z.object({
    timeSpent: z.array(z.number()),
    clickPattern: z.array(z.number()),
    featureUsage: z.array(z.number()),
    sessionDuration: z.number(),
    taskCompletionRate: z.number()
  })
});

const ClusteringRequestSchema = z.object({
  algorithm: z.enum(['kmeans', 'dbscan']),
  k: z.number().optional(), // Para K-means
  epsilon: z.number().optional(), // Para DBSCAN
  minPoints: z.number().optional(), // Para DBSCAN
  features: z.array(z.string())
});

const ChurnPredictionSchema = z.object({
  userId: z.string(),
  features: z.object({
    lastLoginDays: z.number(),
    featureUsageCount: z.number(),
    sessionDuration: z.number(),
    taskCompletionRate: z.number(),
    supportTickets: z.number()
  })
});

const RecommendationRequestSchema = z.object({
  userId: z.string(),
  currentContext: z.object({
    currentFeature: z.string(),
    timeOfDay: z.number(),
    dayOfWeek: z.number(), 
    userRole: z.string()
  })
});

// ==========================================
// BEHAVIORAL ANALYSIS NEURAL NETWORK
// ==========================================

/**
 * POST /api/advanced-ml/analyze-behavior - Analisar comportamento com rede neural
 */
router.post('/analyze-behavior', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const validatedData = BehaviorAnalysisSchema.parse(req.body);
    
    console.log(`🧠 ML API: Analisando comportamento - User: ${validatedData.userId}, Tenant: ${tenantId}`);
    
    const analysis = await advancedMLEngine.analyzeBehaviorPatterns(
      validatedData.userId,
      validatedData.behaviorData,
      tenantId
    );
    
    res.json({
      success: true,
      data: analysis,
      metadata: {
        modelType: 'neural_network',
        modelVersion: '1.0.0',
        processedAt: new Date(),
        tenantId,
        confidence: analysis.confidence
      },
      message: 'Análise comportamental concluída com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na análise comportamental:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados de comportamento inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'behavior_analysis_error'
    });
  }
});

/**
 * GET /api/advanced-ml/behavior-insights/:userId - Obter insights comportamentais
 */
router.get('/behavior-insights/:userId', async (req: any, res) => {
  try {
    const { userId } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`📊 ML API: Buscando insights comportamentais - User: ${userId}`);
    
    const insights = await advancedMLEngine.getBehaviorInsights(userId, tenantId);
    
    res.json({
      success: true,
      data: insights,
      metadata: {
        userId,
        tenantId,
        generatedAt: new Date(),
        insightCount: insights.length
      },
      message: 'Insights comportamentais obtidos com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao buscar insights comportamentais:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'behavior_insights_error'
    });
  }
});

// ==========================================
// USER CLUSTERING ALGORITHMS
// ==========================================

/**
 * POST /api/advanced-ml/cluster-users - Segmentar usuários com clustering
 */
router.post('/cluster-users', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const validatedData = ClusteringRequestSchema.parse(req.body);
    
    console.log(`🎯 ML API: Executando clustering - Algorithm: ${validatedData.algorithm}, Tenant: ${tenantId}`);
    
    let clusters;
    if (validatedData.algorithm === 'kmeans') {
      clusters = await advancedMLEngine.performKMeansClustering(
        tenantId,
        validatedData.k || 3,
        validatedData.features
      );
    } else {
      clusters = await advancedMLEngine.performDBSCANClustering(
        tenantId,
        validatedData.epsilon || 0.5,
        validatedData.minPoints || 5,
        validatedData.features
      );
    }
    
    res.json({
      success: true,
      data: clusters,
      metadata: {
        algorithm: validatedData.algorithm,
        tenantId,
        clustersFound: clusters.clusterCount,
        processedUsers: clusters.userCount,
        features: validatedData.features,
        generatedAt: new Date()
      },
      message: `Clustering ${validatedData.algorithm.toUpperCase()} executado com sucesso`
    });
    
  } catch (error: any) {
    console.error('❌ Erro no clustering de usuários:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros de clustering inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'clustering_error'
    });
  }
});

/**
 * GET /api/advanced-ml/cluster-analysis/:tenantId - Obter análise de clusters
 */
router.get('/cluster-analysis', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    
    console.log(`📈 ML API: Analisando clusters - Tenant: ${tenantId}`);
    
    const analysis = await advancedMLEngine.getClusterAnalysis(tenantId);
    
    res.json({
      success: true,
      data: analysis,
      metadata: {
        tenantId,
        analysisDate: new Date(),
        clustersAnalyzed: analysis.clusters.length
      },
      message: 'Análise de clusters obtida com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na análise de clusters:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'cluster_analysis_error'
    });
  }
});

// ==========================================
// CHURN PREDICTION LOGISTIC REGRESSION
// ==========================================

/**
 * POST /api/advanced-ml/predict-churn - Prever churn com regressão logística
 */
router.post('/predict-churn', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const validatedData = ChurnPredictionSchema.parse(req.body);
    
    console.log(`⚠️ ML API: Predizendo churn - User: ${validatedData.userId}, Tenant: ${tenantId}`);
    
    const prediction = await advancedMLEngine.predictChurnRisk(
      validatedData.userId,
      validatedData.features,
      tenantId
    );
    
    res.json({
      success: true,
      data: prediction,
      metadata: {
        userId: validatedData.userId,
        tenantId,
        modelType: 'logistic_regression',
        predictedAt: new Date(),
        riskLevel: prediction.riskLevel,
        confidence: prediction.confidence
      },
      message: 'Predição de churn concluída com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na predição de churn:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados para predição de churn inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'churn_prediction_error'
    });
  }
});

/**
 * GET /api/advanced-ml/churn-trends - Obter tendências de churn
 */
router.get('/churn-trends', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const { period = '30d' } = req.query;
    
    console.log(`📉 ML API: Analisando tendências de churn - Tenant: ${tenantId}, Period: ${period}`);
    
    const trends = await advancedMLEngine.getChurnTrends(tenantId, period as string);
    
    res.json({
      success: true,
      data: trends,
      metadata: {
        tenantId,
        period,
        analysisDate: new Date(),
        trendsCount: trends.trends.length
      },
      message: 'Tendências de churn obtidas com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao analisar tendências de churn:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'churn_trends_error'
    });
  }
});

// ==========================================
// RECOMMENDATION DECISION TREES
// ==========================================

/**
 * POST /api/advanced-ml/get-recommendations - Obter recomendações com árvores de decisão
 */
router.post('/get-recommendations', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const validatedData = RecommendationRequestSchema.parse(req.body);
    
    console.log(`💡 ML API: Gerando recomendações - User: ${validatedData.userId}, Tenant: ${tenantId}`);
    
    const recommendations = await advancedMLEngine.generateRecommendations(
      validatedData.userId,
      validatedData.currentContext,
      tenantId
    );
    
    res.json({
      success: true,
      data: recommendations,
      metadata: {
        userId: validatedData.userId,
        tenantId,
        modelType: 'decision_tree',
        generatedAt: new Date(),
        recommendationCount: recommendations.length,
        context: validatedData.currentContext
      },
      message: 'Recomendações geradas com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na geração de recomendações:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados de contexto para recomendações inválidos',
        details: error.errors,
        type: 'validation_error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'recommendations_error'
    });
  }
});

/**
 * GET /api/advanced-ml/recommendation-performance - Performance do sistema de recomendações
 */
router.get('/recommendation-performance', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    
    console.log(`📊 ML API: Analisando performance de recomendações - Tenant: ${tenantId}`);
    
    const performance = await advancedMLEngine.getRecommendationPerformance(tenantId);
    
    res.json({
      success: true,
      data: performance,
      metadata: {
        tenantId,
        analysisDate: new Date(),
        metricsCount: Object.keys(performance).length
      },
      message: 'Performance de recomendações obtida com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao analisar performance de recomendações:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'recommendation_performance_error'
    });
  }
});

// ==========================================
// ML MODELS SERVICE MANAGEMENT
// ==========================================

/**
 * GET /api/advanced-ml/models/status - Status de todos os modelos ML
 */
router.get('/models/status', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    
    console.log(`🔍 ML API: Verificando status dos modelos - Tenant: ${tenantId}`);
    
    const status = await mlModelsService.getModelsStatus();
    
    res.json({
      success: true,
      data: status,
      metadata: {
        tenantId,
        checkedAt: new Date(),
        totalModels: status.models.length
      },
      message: 'Status dos modelos ML obtido com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao verificar status dos modelos:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'models_status_error'
    });
  }
});

/**
 * POST /api/advanced-ml/models/train/:modelId - Treinar modelo específico
 */
router.post('/models/train/:modelId', async (req: any, res) => {
  try {
    const { modelId } = req.params;
    const tenantId = req.tenant.id;
    
    console.log(`🏋️ ML API: Treinando modelo - Model: ${modelId}, Tenant: ${tenantId}`);
    
    const trainingResult = await mlModelsService.trainModel(modelId);
    
    res.json({
      success: true,
      data: trainingResult,
      metadata: {
        modelId,
        tenantId,
        trainedAt: new Date(),
        trainingDuration: trainingResult.duration
      },
      message: `Modelo ${modelId} treinado com sucesso`
    });
    
  } catch (error: any) {
    console.error('❌ Erro no treinamento do modelo:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'model_training_error'
    });
  }
});

/**
 * GET /api/advanced-ml/models/performance - Performance de todos os modelos
 */
router.get('/models/performance', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    
    console.log(`📈 ML API: Analisando performance dos modelos - Tenant: ${tenantId}`);
    
    const performance = await mlModelsService.getModelPerformance();
    
    res.json({
      success: true,
      data: performance,
      metadata: {
        tenantId,
        analysisDate: new Date(),
        modelsAnalyzed: performance.models.length
      },
      message: 'Performance dos modelos obtida com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao analisar performance dos modelos:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'models_performance_error'
    });
  }
});

/**
 * POST /api/advanced-ml/models/auto-optimize - Auto-otimização de hiperparâmetros
 */
router.post('/models/auto-optimize', async (req: any, res) => {
  try {
    const tenantId = req.tenant.id;
    const { modelTypes } = req.body;
    
    console.log(`⚡ ML API: Auto-otimizando modelos - Types: ${modelTypes}, Tenant: ${tenantId}`);
    
    const optimizationResult = await mlModelsService.runAutoOptimization(modelTypes);
    
    res.json({
      success: true,
      data: optimizationResult,
      metadata: {
        tenantId,
        optimizedAt: new Date(),
        modelsOptimized: optimizationResult.optimizedModels.length
      },
      message: 'Auto-otimização executada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na auto-otimização:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'auto_optimization_error'
    });
  }
});

/**
 * GET /api/advanced-ml/health - Health check completo do sistema ML
 */
router.get('/health', async (req: any, res) => {
  try {
    console.log('🏥 ML API: Health check completo do sistema ML');
    
    const systemHealth = {
      tensorflow: await advancedMLEngine.checkTensorFlowHealth(),
      models: await mlModelsService.getModelsStatus(),
      performance: {
        systemUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      modelMetrics: await mlModelsService.getModelPerformance(),
      lastModelTraining: await mlModelsService.getLastTrainingInfo()
    };
    
    res.json({
      success: true,
      data: systemHealth,
      metadata: {
        checkedAt: new Date(),
        systemVersion: 'Advanced ML Engine v1.0.0',
        tensorflowVersion: '4.15.0'
      },
      message: 'Sistema ML avançado operando com excelência'
    });
    
  } catch (error: any) {
    console.error('❌ Erro no health check do sistema ML:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      type: 'ml_system_health_error'
    });
  }
});

export { router as advancedMLRoutes };