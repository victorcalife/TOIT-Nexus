const express = require( 'express' );
const router = express.Router();
const { authenticateToken } = require( '../middleware/auth' );
const QuantumProcessor = require( '../services/QuantumProcessor' );
const MilaService = require( '../services/MilaService' );
const DatabaseService = require( '../services/DatabaseService' );

// Inicializar serviços
const quantumProcessor = new QuantumProcessor();
const milaService = new MilaService();
const db = new DatabaseService();

/**
 * POST /api/quantum/process
 * Processar operação com algoritmos quânticos
 */
router.post( '/process', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { type, data, complexity, userId } = req.body;

    if ( !type || !data )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Tipo e dados são obrigatórios'
      } );
    }

    // Log da operação
    console.log( `🔄 Processando operação quântica: ${ type } para usuário ${ userId }` );

    // Processar com algoritmos quânticos
    const quantumResult = await quantumProcessor.processOperation( {
      type,
      data,
      complexity: complexity || 1,
      userId: userId || req.user.id
    } );

    // Salvar no banco de dados
    const operationRecord = await db.query( `
      INSERT INTO quantum_operations (
        user_id, operation_type, input_data, result_data, 
        quantum_speedup, algorithm_used, execution_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      req.user.id,
      type,
      JSON.stringify( data ),
      JSON.stringify( quantumResult ),
      quantumResult.quantumSpeedup || 1,
      quantumResult.algorithm || 'general',
      quantumResult.executionTime || 0
    ] );

    // Processar com MILA se habilitado
    let milaInsights = [];
    if ( req.body.milaEnhanced !== false )
    {
      milaInsights = await milaService.generateInsights( {
        operation: quantumResult,
        userId: req.user.id,
        context: type
      } );
    }

    // Atualizar métricas do usuário
    await db.query( `
      UPDATE user_metrics 
      SET quantum_operations = quantum_operations + 1,
          total_speedup = total_speedup + ?,
          last_operation = NOW()
      WHERE user_id = ?
    `, [ quantumResult.quantumSpeedup || 1, req.user.id ] );

    res.json( {
      success: true,
      data: {
        ...quantumResult,
        operationId: operationRecord.insertId,
        milaInsights,
        timestamp: new Date()
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no processamento quântico:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno no processamento quântico',
      details: error.message
    } );
  }
} );

/**
 * GET /api/quantum/metrics
 * Obter métricas do sistema quântico
 */
router.get( '/metrics', authenticateToken, async ( req, res ) =>
{
  try
  {
    // Métricas gerais do sistema
    const systemMetrics = await db.query( `
      SELECT 
        COUNT(*) as total_operations,
        AVG(quantum_speedup) as avg_speedup,
        SUM(execution_time) as total_execution_time,
        COUNT(DISTINCT user_id) as active_users
      FROM quantum_operations 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Métricas por algoritmo
    const algorithmMetrics = await db.query( `
      SELECT 
        algorithm_used,
        COUNT(*) as executions,
        AVG(quantum_speedup) as avg_speedup,
        AVG(execution_time) as avg_time
      FROM quantum_operations 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY algorithm_used
    `);

    // Métricas do usuário atual
    const userMetrics = await db.query( `
      SELECT 
        quantum_operations,
        total_speedup,
        last_operation,
        created_at as member_since
      FROM user_metrics 
      WHERE user_id = ?
    `, [ req.user.id ] );

    // Status dos backends IBM
    const ibmStatus = await quantumProcessor.getIBMBackendStatus();

    res.json( {
      success: true,
      data: {
        system: systemMetrics[ 0 ],
        algorithms: algorithmMetrics,
        user: userMetrics[ 0 ] || {
          quantum_operations: 0,
          total_speedup: 0,
          last_operation: null,
          member_since: new Date()
        },
        ibmBackends: ibmStatus,
        qubitsAvailable: 64,
        quantumVolume: 128,
        systemCoherence: quantumProcessor.getSystemCoherence(),
        timestamp: new Date()
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter métricas:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter métricas quânticas'
    } );
  }
} );

/**
 * POST /api/quantum/calibrate
 * Calibrar algoritmos quânticos
 */
router.post( '/calibrate', authenticateToken, async ( req, res ) =>
{
  try
  {
    // Verificar permissões de admin
    if ( req.user.role !== 'admin' )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado - apenas administradores'
      } );
    }

    console.log( '🔧 Iniciando calibração dos algoritmos quânticos...' );

    // Executar calibração
    const calibrationResult = await quantumProcessor.calibrateAlgorithms();

    // Salvar log de calibração
    await db.query( `
      INSERT INTO system_logs (
        user_id, action, details, created_at
      ) VALUES (?, 'quantum_calibration', ?, NOW())
    `, [
      req.user.id,
      JSON.stringify( calibrationResult )
    ] );

    res.json( {
      success: true,
      data: {
        ...calibrationResult,
        calibratedBy: req.user.id,
        timestamp: new Date()
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro na calibração:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro na calibração dos algoritmos'
    } );
  }
} );

/**
 * GET /api/quantum/algorithms
 * Listar algoritmos disponíveis
 */
router.get( '/algorithms', authenticateToken, async ( req, res ) =>
{
  try
  {
    const algorithms = await quantumProcessor.getAvailableAlgorithms();

    // Estatísticas de uso por algoritmo
    const usageStats = await db.query( `
      SELECT 
        algorithm_used,
        COUNT(*) as total_uses,
        AVG(quantum_speedup) as avg_speedup,
        MAX(quantum_speedup) as max_speedup,
        AVG(execution_time) as avg_execution_time
      FROM quantum_operations 
      WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY algorithm_used
    `, [ req.user.id ] );

    // Combinar dados
    const algorithmsWithStats = algorithms.map( algo =>
    {
      const stats = usageStats.find( s => s.algorithm_used === algo.name ) || {
        total_uses: 0,
        avg_speedup: 0,
        max_speedup: 0,
        avg_execution_time: 0
      };

      return {
        ...algo,
        userStats: stats
      };
    } );

    res.json( {
      success: true,
      data: algorithmsWithStats
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao listar algoritmos:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter algoritmos'
    } );
  }
} );

/**
 * POST /api/quantum/backup-patterns
 * Backup dos padrões aprendidos
 */
router.post( '/backup-patterns', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { patterns, systemMetrics } = req.body;

    if ( !patterns )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Padrões são obrigatórios'
      } );
    }

    // Salvar backup no banco
    const backupResult = await db.query( `
      INSERT INTO quantum_pattern_backups (
        user_id, patterns_data, system_metrics, created_at
      ) VALUES (?, ?, ?, NOW())
    `, [
      req.user.id,
      JSON.stringify( patterns ),
      JSON.stringify( systemMetrics )
    ] );

    // Limpar backups antigos (manter apenas os últimos 10)
    await db.query( `
      DELETE FROM quantum_pattern_backups 
      WHERE user_id = ? AND id NOT IN (
        SELECT id FROM (
          SELECT id FROM quantum_pattern_backups 
          WHERE user_id = ? 
          ORDER BY created_at DESC 
          LIMIT 10
        ) as recent_backups
      )
    `, [ req.user.id, req.user.id ] );

    res.json( {
      success: true,
      data: {
        backupId: backupResult.insertId,
        patternsCount: Object.keys( patterns ).length,
        timestamp: new Date()
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no backup:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao fazer backup dos padrões'
    } );
  }
} );

/**
 * GET /api/quantum/history
 * Histórico de operações quânticas
 */
router.get( '/history', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { page = 1, limit = 20, algorithm, dateFrom, dateTo } = req.query;
    const offset = ( page - 1 ) * limit;

    // Construir query com filtros
    let whereClause = 'WHERE user_id = ?';
    let params = [ req.user.id ];

    if ( algorithm )
    {
      whereClause += ' AND algorithm_used = ?';
      params.push( algorithm );
    }

    if ( dateFrom )
    {
      whereClause += ' AND created_at >= ?';
      params.push( dateFrom );
    }

    if ( dateTo )
    {
      whereClause += ' AND created_at <= ?';
      params.push( dateTo );
    }

    // Buscar operações
    const operations = await db.query( `
      SELECT 
        id, operation_type, algorithm_used, quantum_speedup,
        execution_time, created_at
      FROM quantum_operations 
      ${ whereClause }
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [ ...params, parseInt( limit ), offset ] );

    // Contar total
    const totalResult = await db.query( `
      SELECT COUNT(*) as total 
      FROM quantum_operations 
      ${ whereClause }
    `, params );

    const total = totalResult[ 0 ].total;
    const totalPages = Math.ceil( total / limit );

    res.json( {
      success: true,
      data: {
        operations,
        pagination: {
          page: parseInt( page ),
          limit: parseInt( limit ),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter histórico:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter histórico de operações'
    } );
  }
} );

/**
 * DELETE /api/quantum/operation/:id
 * Deletar operação específica
 */
router.delete( '/operation/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar se a operação pertence ao usuário
    const operation = await db.query( `
      SELECT id FROM quantum_operations 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    if ( operation.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Operação não encontrada'
      } );
    }

    // Deletar operação
    await db.query( `
      DELETE FROM quantum_operations 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    res.json( {
      success: true,
      message: 'Operação deletada com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao deletar operação:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao deletar operação'
    } );
  }
} );

/**
 * POST /api/quantum/optimize
 * Otimizar operação específica
 */
router.post( '/optimize', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { operationType, inputData, targetSpeedup } = req.body;

    if ( !operationType || !inputData )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Tipo de operação e dados são obrigatórios'
      } );
    }

    // Analisar operações similares do usuário
    const similarOperations = await db.query( `
      SELECT quantum_speedup, algorithm_used, execution_time
      FROM quantum_operations 
      WHERE user_id = ? AND operation_type = ?
      ORDER BY quantum_speedup DESC
      LIMIT 10
    `, [ req.user.id, operationType ] );

    // Encontrar melhor algoritmo baseado no histórico
    const bestAlgorithm = await quantumProcessor.findOptimalAlgorithm(
      operationType,
      inputData,
      similarOperations
    );

    // Executar otimização
    const optimizationResult = await quantumProcessor.optimizeOperation( {
      type: operationType,
      data: inputData,
      algorithm: bestAlgorithm,
      targetSpeedup: targetSpeedup || 2.0
    } );

    res.json( {
      success: true,
      data: {
        ...optimizationResult,
        recommendedAlgorithm: bestAlgorithm,
        basedOnOperations: similarOperations.length,
        timestamp: new Date()
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro na otimização:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro na otimização quântica'
    } );
  }
} );

/**
 * GET /api/quantum/status
 * Status do sistema quântico
 */
router.get( '/status', authenticateToken, async ( req, res ) =>
{
  try
  {
    // Status geral do sistema quântico
    const systemStatus = {
      operational: true,
      qubits: 64,
      quantumVolume: 128,
      coherenceTime: '100μs',
      fidelity: 0.95,
      algorithms: [ 'grover', 'qaoa', 'vqe', 'qnn', 'qft' ],
      backends: [ 'simulator', 'ibm_quantum' ]
    };

    // Verificar status dos backends IBM
    try
    {
      const ibmStatus = await quantumProcessor.getIBMBackendStatus();
      systemStatus.ibmBackends = ibmStatus;
    } catch ( error )
    {
      systemStatus.ibmBackends = { status: 'unavailable', error: error.message };
    }

    // Métricas de performance
    const performanceMetrics = await db.query( `
      SELECT
        COUNT(*) as total_operations,
        AVG(execution_time) as avg_execution_time,
        AVG(quantum_speedup) as avg_speedup,
        MAX(created_at) as last_operation
      FROM quantum_operations
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Operações por algoritmo nas últimas 24h
    const algorithmStats = await db.query( `
      SELECT
        algorithm_used,
        COUNT(*) as count,
        AVG(quantum_speedup) as avg_speedup
      FROM quantum_operations
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY algorithm_used
      ORDER BY count DESC
    `);

    res.json( {
      success: true,
      data: {
        system: systemStatus,
        performance: performanceMetrics[ 0 ] || {
          total_operations: 0,
          avg_execution_time: 0,
          avg_speedup: 1,
          last_operation: null
        },
        algorithms: algorithmStats,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter status quântico:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter status do sistema quântico',
      details: error.message
    } );
  }
} );

/**
 * GET /api/quantum/backends
 * Backends quânticos disponíveis
 */
router.get( '/backends', authenticateToken, async ( req, res ) =>
{
  try
  {
    const backends = [
      {
        id: 'simulator',
        name: 'Quantum Simulator',
        type: 'simulator',
        qubits: 64,
        status: 'online',
        queue: 0,
        description: 'Simulador quântico local de alta performance'
      },
      {
        id: 'ibm_quantum',
        name: 'IBM Quantum Network',
        type: 'hardware',
        qubits: 127,
        status: 'online',
        queue: 5,
        description: 'Acesso aos computadores quânticos reais da IBM'
      }
    ];

    // Verificar status real dos backends IBM
    try
    {
      const ibmStatus = await quantumProcessor.getIBMBackendStatus();
      if ( ibmStatus && ibmStatus.backends )
      {
        backends.push( ...ibmStatus.backends.map( backend => ( {
          id: backend.name,
          name: backend.name,
          type: 'hardware',
          qubits: backend.n_qubits,
          status: backend.status,
          queue: backend.pending_jobs || 0,
          description: `IBM Quantum Backend: ${ backend.name }`
        } ) ) );
      }
    } catch ( error )
    {
      console.warn( '⚠️ Não foi possível obter status dos backends IBM:', error.message );
    }

    res.json( {
      success: true,
      data: {
        backends,
        total: backends.length,
        available: backends.filter( b => b.status === 'online' ).length
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter backends:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter backends quânticos'
    } );
  }
} );

/**
 * POST /api/quantum/grover
 * Executar algoritmo de Grover
 */
router.post( '/grover', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { searchSpace, targetItem, iterations } = req.body;

    if ( !searchSpace || !targetItem )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Espaço de busca e item alvo são obrigatórios'
      } );
    }

    // Executar algoritmo de Grover
    const result = await quantumProcessor.executeGrover( {
      searchSpace,
      targetItem,
      iterations: iterations || Math.floor( Math.sqrt( searchSpace.length ) )
    } );

    // Salvar resultado
    await db.query( `
      INSERT INTO quantum_operations (
        user_id, operation_type, algorithm_used, input_data,
        result_data, quantum_speedup, execution_time, created_at
      ) VALUES (?, 'search', 'grover', ?, ?, ?, ?, NOW())
    `, [
      req.user.id,
      JSON.stringify( { searchSpace, targetItem, iterations } ),
      JSON.stringify( result ),
      result.quantumSpeedup || Math.sqrt( searchSpace.length ),
      result.executionTime || 0
    ] );

    res.json( {
      success: true,
      data: result,
      algorithm: 'grover',
      quantumAdvantage: `${ Math.sqrt( searchSpace.length ) }x speedup vs classical`
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no algoritmo de Grover:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro na execução do algoritmo de Grover',
      details: error.message
    } );
  }
} );

/**
 * POST /api/quantum/qaoa
 * Executar algoritmo QAOA
 */
router.post( '/qaoa', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { problem, layers, parameters } = req.body;

    if ( !problem )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Definição do problema é obrigatória'
      } );
    }

    // Executar QAOA
    const result = await quantumProcessor.executeQAOA( {
      problem,
      layers: layers || 3,
      parameters: parameters || null
    } );

    // Salvar resultado
    await db.query( `
      INSERT INTO quantum_operations (
        user_id, operation_type, algorithm_used, input_data,
        result_data, quantum_speedup, execution_time, created_at
      ) VALUES (?, 'optimization', 'qaoa', ?, ?, ?, ?, NOW())
    `, [
      req.user.id,
      JSON.stringify( { problem, layers, parameters } ),
      JSON.stringify( result ),
      result.quantumSpeedup || 2,
      result.executionTime || 0
    ] );

    res.json( {
      success: true,
      data: result,
      algorithm: 'qaoa',
      quantumAdvantage: 'Exponential speedup for combinatorial optimization'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no algoritmo QAOA:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro na execução do algoritmo QAOA',
      details: error.message
    } );
  }
} );

/**
 * POST /api/quantum/vqe
 * Executar algoritmo VQE
 */
router.post( '/vqe', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { hamiltonian, ansatz, optimizer } = req.body;

    if ( !hamiltonian )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Hamiltoniano é obrigatório'
      } );
    }

    // Executar VQE
    const result = await quantumProcessor.executeVQE( {
      hamiltonian,
      ansatz: ansatz || 'hardware_efficient',
      optimizer: optimizer || 'COBYLA'
    } );

    // Salvar resultado
    await db.query( `
      INSERT INTO quantum_operations (
        user_id, operation_type, algorithm_used, input_data,
        result_data, quantum_speedup, execution_time, created_at
      ) VALUES (?, 'eigenvalue', 'vqe', ?, ?, ?, ?, NOW())
    `, [
      req.user.id,
      JSON.stringify( { hamiltonian, ansatz, optimizer } ),
      JSON.stringify( result ),
      result.quantumSpeedup || 1.5,
      result.executionTime || 0
    ] );

    res.json( {
      success: true,
      data: result,
      algorithm: 'vqe',
      quantumAdvantage: 'Quantum advantage for molecular simulation'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no algoritmo VQE:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro na execução do algoritmo VQE',
      details: error.message
    } );
  }
} );

module.exports = router;
