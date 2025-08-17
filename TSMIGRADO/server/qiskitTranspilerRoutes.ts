/**
 * QISKIT TRANSPILER SERVICE API ROUTES
 * 
 * APIs dedicadas para o Qiskit Transpiler Service AI Integration
 * Configurado via variável IBM_SECRET (API KEY)
 */

import { Router } from 'express';
import { qiskitTranspiler } from './qiskitTranspilerIntegration';
import { authMiddleware } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { z } from 'zod';

const router = Router();

// Schema para validação Qiskit
const qiskitTranspileSchema = z.object({
  circuit: z.string().min(1, 'Circuit QASM is required'),
  optimization_level: z.number().min(1).max(3).default(3),
  ai: z.enum(['true', 'false', 'auto']).default('auto'),
  backend_name: z.string().default('ibm_torino')
});

// ==========================================
// QISKIT SERVICE STATUS
// ==========================================

/**
 * GET /api/qiskit-transpiler/status
 * Status completo do serviço Qiskit Transpiler
 */
router.get('/status', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    console.log('🤖 Verificando status completo do Qiskit Transpiler Service...');
    
    const serviceStatus = await qiskitTranspiler.getServiceStatus();
    const healthCheck = await qiskitTranspiler.checkServiceHealth();
    
    res.json({
      success: true,
      data: {
        service: 'Qiskit Transpiler Service',
        version: 'AI-Enhanced v2.0',
        serviceStatus,
        healthCheck,
        configuration: {
          ibmSecretConfigured: serviceStatus.configured,
          baseUrl: 'https://cloud-transpiler.quantum-computing.ibm.com',
          features: [
            'AI-powered circuit optimization',
            'Multiple backend targets',
            'Advanced routing algorithms',
            'Synthesis methods'
          ]
        },
        integration: {
          enhancesNativeQuantum: true,
          compatibleWithNativeEngine: true,
          providesOptimization: true,
          supportsMultipleAlgorithms: true
        }
      }
    });
  } catch (error) {
    console.error('Qiskit service status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Qiskit Transpiler Service status',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'qiskit_service_error'
    });
  }
});

// ==========================================
// CIRCUIT TRANSPILATION
// ==========================================

/**
 * POST /api/qiskit-transpiler/transpile
 * Transpilação de circuito com Qiskit AI
 */
router.post('/transpile', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const validation = qiskitTranspileSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transpilation parameters',
        details: validation.error.errors,
        type: 'validation_error'
      });
    }
    
    const { circuit, optimization_level, ai, backend_name } = validation.data;
    
    console.log(`🤖 Transpilando circuito com Qiskit AI (level ${optimization_level}, AI: ${ai})...`);
    
    const startTime = Date.now();
    
    const result = await qiskitTranspiler.transpileCircuitWithAI(circuit, {
      optimization_level,
      ai,
      backend_name
    });
    
    const executionTime = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        service: 'Qiskit Transpiler AI',
        transpilation: result,
        parameters: {
          optimization_level,
          ai_requested: ai,
          backend_target: backend_name,
          circuit_size: circuit.length
        },
        performance: {
          executionTime,
          optimizationAchieved: result.optimization_achieved,
          aiUsed: result.ai_used,
          transpilationTime: result.transpilation_time
        },
        improvement: {
          gateReduction: result.gates < 100 ? `Optimized gate count: ${result.gates}` : 'Large circuit processed',
          depthReduction: `Circuit depth: ${result.depth}`,
          twoQubitGateOptimization: `Two-qubit gates: ${result.two_qubit_gates}`
        }
      }
    });
  } catch (error) {
    console.error('Qiskit transpilation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to transpile circuit with Qiskit AI',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'qiskit_transpilation_error'
    });
  }
});

// ==========================================
// ENHANCED QUANTUM ALGORITHMS
// ==========================================

/**
 * POST /api/qiskit-transpiler/enhanced-search
 * Busca quântica aprimorada com Qiskit AI
 */
router.post('/enhanced-search', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { searchSpace, targetValue, useAI = true } = req.body;
    
    if (!searchSpace || !Array.isArray(searchSpace)) {
      return res.status(400).json({
        success: false,
        error: 'Search space array is required',
        type: 'validation_error'
      });
    }
    
    console.log(`🔍 Executando busca quântica aprimorada com Qiskit AI - ${searchSpace.length} items`);
    
    const result = await qiskitTranspiler.enhancedQuantumSearch(searchSpace, targetValue, useAI);
    
    res.json({
      success: true,
      data: {
        algorithm: 'Enhanced Quantum Search with Qiskit AI',
        result,
        enhancement: result.qiskitOptimized ? {
          circuitOptimized: true,
          optimizationLevel: result.qiskitOptimized.optimization_achieved,
          aiUsed: result.qiskitOptimized.ai_used,
          performanceComparison: result.performanceComparison
        } : {
          circuitOptimized: false,
          reason: 'IBM_SECRET not configured or service unavailable'
        }
      }
    });
  } catch (error) {
    console.error('Enhanced quantum search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute enhanced quantum search',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'enhanced_search_error'
    });
  }
});

/**
 * POST /api/qiskit-transpiler/enhanced-ml
 * Machine Learning quântico aprimorado com Qiskit AI
 */
router.post('/enhanced-ml', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { trainingData, useAI = true } = req.body;
    
    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({
        success: false,
        error: 'Training data array is required',
        type: 'validation_error'
      });
    }
    
    console.log(`🧠 Executando ML quântico aprimorado com Qiskit AI - ${trainingData.length} amostras`);
    
    const result = await qiskitTranspiler.enhancedQuantumML(trainingData, useAI);
    
    res.json({
      success: true,
      data: {
        algorithm: 'Enhanced Quantum ML with Qiskit AI',
        result,
        enhancement: result.qiskitOptimized ? {
          circuitOptimized: true,
          optimizationLevel: result.qiskitOptimized.optimization_achieved,
          aiUsed: result.qiskitOptimized.ai_used,
          performanceComparison: result.performanceComparison
        } : {
          circuitOptimized: false,
          reason: 'IBM_SECRET not configured or service unavailable'
        }
      }
    });
  } catch (error) {
    console.error('Enhanced quantum ML error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute enhanced quantum ML',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'enhanced_ml_error'
    });
  }
});

/**
 * POST /api/qiskit-transpiler/enhanced-optimization
 * Otimização quântica aprimorada com Qiskit AI
 */
router.post('/enhanced-optimization', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { problem, useAI = true } = req.body;
    
    if (!problem || !Array.isArray(problem)) {
      return res.status(400).json({
        success: false,
        error: 'Problem array is required',
        type: 'validation_error'
      });
    }
    
    console.log(`⚡ Executando otimização quântica aprimorada com Qiskit AI - ${problem.length} elementos`);
    
    const defaultCostFunction = (solution: any[]) => 
      solution.reduce((sum, item) => sum + (item?.value || 1), 0);
    
    const result = await qiskitTranspiler.enhancedQuantumOptimization(problem, defaultCostFunction, useAI);
    
    res.json({
      success: true,
      data: {
        algorithm: 'Enhanced Quantum Optimization with Qiskit AI',
        result,
        enhancement: result.qiskitOptimized ? {
          circuitOptimized: true,
          optimizationLevel: result.qiskitOptimized.optimization_achieved,
          aiUsed: result.qiskitOptimized.ai_used,
          performanceComparison: result.performanceComparison
        } : {
          circuitOptimized: false,
          reason: 'IBM_SECRET not configured or service unavailable'
        }
      }
    });
  } catch (error) {
    console.error('Enhanced quantum optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute enhanced quantum optimization',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'enhanced_optimization_error'
    });
  }
});

// ==========================================
// AI TRANSPILER PASSES ADVANCED
// ==========================================

/**
 * POST /api/qiskit-transpiler/generate-ai-pass-manager
 * Gera PassManager híbrido com AI-powered passes
 */
router.post('/generate-ai-pass-manager', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const {
      ai_optimization_level = 3,
      optimization_level = 3,
      ai_layout_mode = 'optimize',
      backend_name = 'ibm_torino',
      enable_ai_routing = true,
      enable_ai_synthesis = true,
      enable_dynamic_decoupling = true
    } = req.body;

    console.log('🤖 Gerando AI PassManager híbrido avançado...');

    const result = await qiskitTranspiler.generateAIPassManager({
      ai_optimization_level,
      optimization_level,
      ai_layout_mode,
      backend_name,
      enable_ai_routing,
      enable_ai_synthesis,
      enable_dynamic_decoupling
    });

    res.json({
      success: true,
      data: {
        service: 'AI PassManager Generator',
        configuration: result,
        features: {
          aiRouting: enable_ai_routing,
          aiSynthesis: enable_ai_synthesis,
          dynamicDecoupling: enable_dynamic_decoupling,
          hybridOptimization: true
        },
        estimatedPerformance: {
          improvement: `${((result.estimatedImprovement - 1) * 100).toFixed(1)}%`,
          optimizationLevel: ai_optimization_level,
          aiCapabilities: result.aiCapabilities.length
        },
        passTypes: [
          'AIRouting - Layout selection and circuit routing',
          'AICliffordSynthesis - Clifford circuit synthesis',
          'AILinearFunctionSynthesis - Linear function circuit synthesis', 
          'AIPermutationSynthesis - Permutation circuit synthesis',
          'AIPauliNetworkSynthesis - Pauli Network circuit synthesis',
          'Dynamic Decoupling - Error mitigation'
        ]
      }
    });
  } catch (error) {
    console.error('AI PassManager generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI PassManager',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'ai_passmanager_error'
    });
  }
});

/**
 * POST /api/qiskit-transpiler/compare-settings
 * Compara diferentes configurações de transpilação
 */
router.post('/compare-settings', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { circuit, settings = [] } = req.body;

    if (!circuit || typeof circuit !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Circuit QASM string is required',
        type: 'validation_error'
      });
    }

    // Configurações padrão se não fornecidas
    const defaultSettings = [
      {
        name: 'Minimal Optimization',
        optimization_level: 1,
        ai_optimization_level: 1,
        enable_ai: false,
        enable_dd: false
      },
      {
        name: 'Standard AI',
        optimization_level: 2,
        ai_optimization_level: 2,
        enable_ai: true,
        enable_dd: false
      },
      {
        name: 'Maximum AI + DD',
        optimization_level: 3,
        ai_optimization_level: 3,
        enable_ai: true,
        enable_dd: true
      }
    ];

    const testSettings = settings.length > 0 ? settings : defaultSettings;

    console.log(`📊 Comparando ${testSettings.length} configurações de transpilação...`);

    const result = await qiskitTranspiler.compareTranspilerSettings(circuit, testSettings);

    res.json({
      success: true,
      data: {
        service: 'Transpiler Settings Comparison',
        analysis: result,
        summary: {
          settingsTested: testSettings.length,
          bestConfiguration: result.bestSetting,
          recommendation: result.recommendation,
          improvementRange: {
            min: Math.min(...result.comparisons.map(c => c.performance.optimizationAchieved)),
            max: Math.max(...result.comparisons.map(c => c.performance.optimizationAchieved)),
            avg: result.comparisons.reduce((sum, c) => sum + c.performance.optimizationAchieved, 0) / result.comparisons.length
          }
        },
        metrics: {
          fidelityComparison: result.comparisons.map(c => ({
            setting: c.settingName,
            estimatedFidelity: c.estimatedFidelity,
            depth: c.circuitDepth,
            twoQubitGates: c.twoQubitGates
          })),
          performanceComparison: result.comparisons.map(c => ({
            setting: c.settingName,
            transpilationTime: c.performance.transpilationTime,
            optimizationAchieved: c.performance.optimizationAchieved
          }))
        }
      }
    });
  } catch (error) {
    console.error('Transpiler settings comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare transpiler settings',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'settings_comparison_error'
    });
  }
});

/**
 * POST /api/qiskit-transpiler/optimize-circuit
 * Otimização completa de circuito com análise de fidelidade
 */
router.post('/optimize-circuit', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { 
      circuit, 
      target_backend = 'ibm_torino',
      optimization_goal = 'fidelity',
      enable_all_passes = true 
    } = req.body;

    if (!circuit) {
      return res.status(400).json({
        success: false,
        error: 'Circuit QASM is required',
        type: 'validation_error'
      });
    }

    console.log(`⚡ Otimizando circuito para ${target_backend} (objetivo: ${optimization_goal})...`);

    // Configurações otimizadas baseadas no objetivo
    const optimizationConfigs = {
      fidelity: {
        ai_optimization_level: 3,
        optimization_level: 3,
        ai_layout_mode: 'optimize',
        enable_ai_routing: true,
        enable_ai_synthesis: true,
        enable_dynamic_decoupling: true
      },
      speed: {
        ai_optimization_level: 2,
        optimization_level: 2,
        ai_layout_mode: 'improve',
        enable_ai_routing: true,
        enable_ai_synthesis: false,
        enable_dynamic_decoupling: false
      },
      depth: {
        ai_optimization_level: 3,
        optimization_level: 1,
        ai_layout_mode: 'optimize',
        enable_ai_routing: true,
        enable_ai_synthesis: true,
        enable_dynamic_decoupling: false
      }
    };

    const config = optimizationConfigs[optimization_goal] || optimizationConfigs.fidelity;

    // Gerar PassManager otimizado
    const passManager = await qiskitTranspiler.generateAIPassManager({
      ...config,
      backend_name: target_backend
    });

    // Transpile circuit
    const transpiled = await qiskitTranspiler.transpileCircuitWithAI(circuit, {
      optimization_level: config.ai_optimization_level,
      ai: 'true',
      backend_name: target_backend
    });

    res.json({
      success: true,
      data: {
        service: 'Complete Circuit Optimization',
        optimization: {
          goal: optimization_goal,
          targetBackend: target_backend,
          passManagerConfig: passManager.passManagerConfig,
          transpiled
        },
        performance: {
          originalVsOptimized: {
            optimizationAchieved: transpiled.optimization_achieved,
            gateCountReduction: `${transpiled.gates} gates`,
            depthReduction: `${transpiled.depth} depth`,
            twoQubitGateOptimization: `${transpiled.two_qubit_gates} two-qubit gates`
          },
          aiEnhancement: {
            aiUsed: transpiled.ai_used,
            transpilationTime: transpiled.transpilation_time,
            estimatedImprovement: passManager.estimatedImprovement
          }
        },
        recommendations: [
          transpiled.ai_used ? '✅ AI optimization successfully applied' : '⚠️ AI optimization not available',
          `🎯 Circuit optimized for ${optimization_goal}`,
          `📊 ${transpiled.optimization_achieved.toFixed(1)}% improvement achieved`,
          `⚡ Ready for execution on ${target_backend}`,
          passManager.estimatedImprovement > 1.3 ? '🚀 Excellent optimization result' : '📈 Good optimization result'
        ]
      }
    });
  } catch (error) {
    console.error('Circuit optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize circuit',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'circuit_optimization_error'
    });
  }
});

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================

/**
 * GET /api/qiskit-transpiler/health
 * Health check do serviço Qiskit
 */
router.get('/health', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    console.log('🔍 Verificando saúde do Qiskit Transpiler Service...');
    
    const healthCheck = await qiskitTranspiler.checkServiceHealth();
    
    res.json({
      success: true,
      data: {
        service: 'Qiskit Transpiler Service',
        timestamp: new Date().toISOString(),
        health: healthCheck,
        recommendations: [
          healthCheck.status === 'HEALTHY' ? 
            '✅ Qiskit Transpiler Service operacional' :
            '⚠️ Verificar configuração IBM_SECRET ou conectividade',
          healthCheck.responseTime ? 
            `⚡ Tempo de resposta: ${healthCheck.responseTime}ms` :
            '📡 Tempo de resposta indisponível',
          '🤖 AI-powered circuit optimization disponível',
          '🔧 Integração com Native Quantum Engine ativa'
        ]
      }
    });
  } catch (error) {
    console.error('Qiskit health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check Qiskit service health',
      type: 'health_check_error'
    });
  }
});

export default router;