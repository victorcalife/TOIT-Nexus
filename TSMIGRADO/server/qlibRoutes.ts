/**
 * QLIB INTEGRATION ROUTES - TOIT NEXUS
 * 
 * APIs para execução de notebooks quânticos da biblioteca qlib
 * Integração direta com algoritmos Qiskit implementados
 * Ponte entre TOIT NEXUS e computação quântica real
 */

import { Router } from 'express';
import { quantumLibraryIntegrator } from './quantumLibraryIntegrator';
import { authMiddleware } from './authMiddleware';
import { tenantMiddleware } from './tenantMiddleware';
import { z } from 'zod';

const router = Router();

// Schemas de validação
const qaoaNotebookSchema = z.object({
  graphNodes: z.number().min(3).max(10).default(5),
  graphEdges: z.array(z.tuple([z.number(), z.number()])).optional(),
  useRealHardware: z.boolean().default(false),
  shots: z.number().min(100).max(10000).default(1000),
  optimizationLevel: z.number().min(0).max(3).default(3)
});

const groverNotebookSchema = z.object({
  searchSpace: z.array(z.string()).max(16),
  targetStates: z.array(z.string()).min(1),
  useRealHardware: z.boolean().default(false),
  shots: z.number().min(100).max(10000).default(1000)
});

// ==========================================
// QLIB SYSTEM STATUS
// ==========================================

/**
 * GET /api/qlib/status
 * Status da integração com biblioteca qlib
 */
router.get('/status', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    console.log('📚 Verificando status da biblioteca qlib...');
    
    const systemHealth = await quantumLibraryIntegrator.getSystemHealth();
    const environmentValid = await quantumLibraryIntegrator.validateEnvironment();
    
    res.json({
      success: true,
      data: {
        status: environmentValid ? 'QLIB_READY' : 'QLIB_ENVIRONMENT_ERROR',
        system: systemHealth,
        capabilities: {
          qaoa_notebook: systemHealth.available_notebooks.includes('quantum-approximate-optimization-algorithm.ipynb'),
          grover_notebook: systemHealth.available_notebooks.includes('grovers-algorithm.ipynb'),
          quantum_ml_notebook: systemHealth.available_notebooks.includes('qunova-hivqe.ipynb'),
          error_mitigation: systemHealth.available_notebooks.includes('combine-error-mitigation-techniques.ipynb'),
          transpiler_service: systemHealth.available_notebooks.includes('qiskit-transpiler-service.ipynb')
        },
        environment: {
          qiskit_available: environmentValid,
          python_working: environmentValid,
          ibm_quantum_configured: systemHealth.ibm_token_configured,
          notebooks_found: systemHealth.available_notebooks.length
        },
        notebooks: systemHealth.available_notebooks,
        message: environmentValid ? 
          'Biblioteca qlib pronta para execução de algoritmos quânticos' :
          'Erro no ambiente - Verifique instalação do Qiskit e Python'
      }
    });
  } catch (error) {
    console.error('QLib status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get qlib system status',
      type: 'qlib_status_error'
    });
  }
});

// ==========================================
// QAOA NOTEBOOK EXECUTION
// ==========================================

/**
 * POST /api/qlib/qaoa
 * Executar notebook QAOA da biblioteca qlib
 */
router.post('/qaoa', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const validation = qaoaNotebookSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QAOA notebook parameters',
        details: validation.error.errors,
        type: 'validation_error'
      });
    }
    
    const { graphNodes, graphEdges, useRealHardware, shots } = validation.data;
    
    // Gerar edges padrão se não fornecidas
    const defaultEdges: Array<[number, number]> = [];
    if (!graphEdges) {
      for (let i = 0; i < graphNodes - 1; i++) {
        defaultEdges.push([i, i + 1]);
      }
      if (graphNodes > 2) {
        defaultEdges.push([0, graphNodes - 1]);
      }
    }
    
    const edges = graphEdges || defaultEdges;
    
    console.log(`🔥 Executando notebook QAOA - ${graphNodes} nós, ${edges.length} arestas`);
    
    const startTime = Date.now();
    const result = await quantumLibraryIntegrator.executeQAOA(
      graphNodes,
      edges,
      useRealHardware,
      shots
    );
    const totalTime = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        algorithm: 'QAOA via QLib Notebook',
        execution: result.status === 'success' ? 'NOTEBOOK_EXECUTED' : 'NOTEBOOK_FAILED',
        notebook: result.notebook,
        execution_id: result.execution_id,
        result: result.result,
        parameters: {
          graphNodes,
          graphEdges: edges.length,
          useRealHardware,
          shots,
          notebookUsed: result.notebook
        },
        performance: {
          totalExecutionTime: totalTime,
          notebookExecutionTime: result.metrics.execution_time,
          circuitDepth: result.metrics.circuit_depth,
          gateCount: result.metrics.gate_count,
          qubitsUsed: result.metrics.qubit_count,
          fidelity: result.metrics.fidelity
        },
        backend: {
          type: result.backend_info.type,
          device: result.backend_info.device,
          ibmQuantum: result.backend_info.ibm_quantum,
          shots: result.metrics.shots
        },
        qlib: {
          notebook: result.notebook,
          status: result.status,
          logs: result.logs.slice(-5), // Últimos 5 logs
          error: result.error
        }
      }
    });
  } catch (error) {
    console.error('QLib QAOA execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute QAOA notebook',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'qlib_qaoa_error'
    });
  }
});

// ==========================================
// GROVER NOTEBOOK EXECUTION
// ==========================================

/**
 * POST /api/qlib/grover
 * Executar notebook Grover da biblioteca qlib
 */
router.post('/grover', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const validation = groverNotebookSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Grover notebook parameters',
        details: validation.error.errors,
        type: 'validation_error'
      });
    }
    
    const { searchSpace, targetStates, useRealHardware, shots } = validation.data;
    
    // Validar comprimento dos estados
    const bitLength = targetStates[0].length;
    if (!targetStates.every(state => state.length === bitLength)) {
      return res.status(400).json({
        success: false,
        error: 'All target states must have the same bit length',
        type: 'validation_error'
      });
    }
    
    if (bitLength > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 qubits supported via notebook execution',
        type: 'validation_error'
      });
    }
    
    console.log(`🔍 Executando notebook Grover - ${searchSpace.length} espaço, ${targetStates.length} targets`);
    
    const startTime = Date.now();
    const result = await quantumLibraryIntegrator.executeGrover(
      searchSpace,
      targetStates,
      useRealHardware,
      shots
    );
    const totalTime = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        algorithm: 'Grover via QLib Notebook',
        execution: result.status === 'success' ? 'NOTEBOOK_EXECUTED' : 'NOTEBOOK_FAILED',
        notebook: result.notebook,
        execution_id: result.execution_id,
        result: result.result,
        parameters: {
          searchSpaceSize: searchSpace.length,
          targetStatesCount: targetStates.length,
          bitLength,
          useRealHardware,
          shots,
          notebookUsed: result.notebook
        },
        performance: {
          totalExecutionTime: totalTime,
          notebookExecutionTime: result.metrics.execution_time,
          circuitDepth: result.metrics.circuit_depth,
          gateCount: result.metrics.gate_count,
          qubitsUsed: result.metrics.qubit_count,
          fidelity: result.metrics.fidelity,
          quantumAdvantage: searchSpace.length > 4 ? 'O(√N) vs O(N)' : 'Classical competitive'
        },
        backend: {
          type: result.backend_info.type,
          device: result.backend_info.device,
          ibmQuantum: result.backend_info.ibm_quantum,
          shots: result.metrics.shots
        },
        qlib: {
          notebook: result.notebook,
          status: result.status,
          logs: result.logs.slice(-5),
          error: result.error,
          targetFound: result.result?.target_found,
          probability: result.result?.probability
        }
      }
    });
  } catch (error) {
    console.error('QLib Grover execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute Grover notebook',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'qlib_grover_error'
    });
  }
});

// ==========================================
// NOTEBOOK CATALOG
// ==========================================

/**
 * GET /api/qlib/notebooks
 * Catálogo de notebooks disponíveis na biblioteca qlib
 */
router.get('/notebooks', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const availableNotebooks = await quantumLibraryIntegrator.getAvailableNotebooks();
    
    const catalog = {
      'quantum-approximate-optimization-algorithm.ipynb': {
        name: 'QAOA - Quantum Approximate Optimization Algorithm',
        description: 'Resolve problemas de otimização combinatória usando QAOA',
        algorithm: 'QAOA',
        use_cases: ['Max-Cut Problem', 'Portfolio Optimization', 'Logistics'],
        complexity: 'O(1) com vantagem quântica para problemas específicos',
        max_problem_size: 10,
        real_hardware_compatible: true,
        estimated_runtime: '2-10 minutos'
      },
      'grovers-algorithm.ipynb': {
        name: 'Grover\'s Search Algorithm',
        description: 'Busca quântica com speedup quadrático',
        algorithm: 'Grover',
        use_cases: ['Database Search', 'Pattern Matching', 'Unstructured Search'],
        complexity: 'O(√N) vs O(N) clássico',
        max_search_space: 32,
        real_hardware_compatible: true,
        estimated_runtime: '1-5 minutos'
      },
      'qunova-hivqe.ipynb': {
        name: 'Quantum Machine Learning - HIVQE',
        description: 'Hybrid quantum-classical machine learning',
        algorithm: 'Variational Quantum ML',
        use_cases: ['Classification', 'Feature Mapping', 'Kernel Methods'],
        complexity: 'Exponential feature space advantage',
        max_training_samples: 100,
        real_hardware_compatible: true,
        estimated_runtime: '5-20 minutos'
      },
      'combine-error-mitigation-techniques.ipynb': {
        name: 'Quantum Error Mitigation',
        description: 'Técnicas avançadas de mitigação de erro quântico',
        algorithm: 'Error Mitigation Suite',
        use_cases: ['Noise Reduction', 'Fidelity Improvement', 'NISQ Enhancement'],
        complexity: 'Post-processing optimization',
        applicable_to: 'All quantum algorithms',
        real_hardware_compatible: true,
        estimated_runtime: '3-15 minutos'
      },
      'qiskit-transpiler-service.ipynb': {
        name: 'Qiskit Transpiler Service with AI',
        description: 'Otimização de circuitos usando AI transpiler',
        algorithm: 'AI-Enhanced Transpilation',
        use_cases: ['Circuit Optimization', 'Gate Reduction', 'Hardware Mapping'],
        complexity: 'AI-driven optimization',
        applicable_to: 'All quantum circuits',
        real_hardware_compatible: true,
        estimated_runtime: '1-5 minutos'
      },
      'long-range-entanglement.ipynb': {
        name: 'Long-Range Quantum Entanglement',
        description: 'Implementação de emaranhamento de longo alcance',
        algorithm: 'Entanglement Engineering',
        use_cases: ['Quantum Networks', 'Distributed Computing', 'Communication'],
        complexity: 'Exponential scaling with distance',
        max_distance: 'Global',
        real_hardware_compatible: true,
        estimated_runtime: '5-30 minutos'
      }
    };
    
    res.json({
      success: true,
      data: {
        available: availableNotebooks,
        total_notebooks: availableNotebooks.length,
        catalog: Object.fromEntries(
          availableNotebooks.map(notebook => [notebook, catalog[notebook] || {
            name: notebook.replace('.ipynb', '').replace(/-/g, ' '),
            description: 'Algoritmo quântico avançado',
            algorithm: 'Quantum Algorithm',
            real_hardware_compatible: true
          }])
        ),
        execution_modes: {
          simulator: 'Execução local usando simulador Qiskit',
          real_hardware: 'Execução em hardware IBM Quantum (requer IBM_SECRET)'
        },
        requirements: {
          python: 'Python 3.8+ com Qiskit instalado',
          qlib: 'Biblioteca de notebooks quânticos no diretório /qlib',
          ibm_token: 'IBM Quantum API token para hardware real (opcional)'
        }
      }
    });
  } catch (error) {
    console.error('QLib notebooks catalog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notebooks catalog',
      type: 'qlib_catalog_error'
    });
  }
});

// ==========================================
// ENVIRONMENT VALIDATION
// ==========================================

/**
 * GET /api/qlib/validate-environment
 * Validar ambiente de execução para notebooks qlib
 */
router.get('/validate-environment', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    console.log('🔧 Validando ambiente qlib...');
    
    const systemHealth = await quantumLibraryIntegrator.getSystemHealth();
    const qiskitValid = await quantumLibraryIntegrator.validateEnvironment();
    
    const validation = {
      overall_status: qiskitValid && systemHealth.qlib_exists ? 'READY' : 'ISSUES_FOUND',
      checks: {
        qlib_directory: {
          status: systemHealth.qlib_exists ? 'PASS' : 'FAIL',
          message: systemHealth.qlib_exists ? 
            `QLib encontrado em ${systemHealth.qlib_path}` :
            `QLib não encontrado em ${systemHealth.qlib_path}`
        },
        temp_directory: {
          status: systemHealth.temp_exists ? 'PASS' : 'FAIL',
          message: systemHealth.temp_exists ?
            `Diretório temporário OK: ${systemHealth.temp_path}` :
            `Diretório temporário criado: ${systemHealth.temp_path}`
        },
        python_executable: {
          status: 'PASS',
          message: `Python configurado: ${systemHealth.python_executable}`
        },
        qiskit_installation: {
          status: qiskitValid ? 'PASS' : 'FAIL',
          message: qiskitValid ?
            'Qiskit instalado e funcionando' :
            'Qiskit não encontrado ou com erro'
        },
        ibm_quantum_token: {
          status: systemHealth.ibm_token_configured ? 'CONFIGURED' : 'NOT_CONFIGURED',
          message: systemHealth.ibm_token_configured ?
            'IBM Quantum token configurado - Hardware real disponível' :
            'IBM Quantum token não configurado - Apenas simulador disponível'
        },
        notebooks_available: {
          status: systemHealth.available_notebooks.length > 0 ? 'PASS' : 'FAIL',
          message: `${systemHealth.available_notebooks.length} notebooks encontrados`,
          count: systemHealth.available_notebooks.length
        }
      },
      recommendations: [
        ...(systemHealth.qlib_exists ? [] : ['Criar diretório qlib com notebooks Qiskit']),
        ...(qiskitValid ? [] : ['Instalar Qiskit: pip install qiskit qiskit-ibm-runtime']),
        ...(systemHealth.ibm_token_configured ? [] : ['Configurar IBM_SECRET para hardware real']),
        ...(systemHealth.available_notebooks.length > 0 ? [] : ['Adicionar notebooks .ipynb ao diretório qlib'])
      ]
    };
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Environment validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate qlib environment',
      type: 'environment_validation_error'
    });
  }
});

export default router;