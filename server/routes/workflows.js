/**
 * ROTAS DE WORKFLOWS E AUTOMAÇÃO
 * Sistema completo de workflow builder com drag-drop visual
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require( 'express' );
const { db } = require( '../database-config' );
const { requireAuth, requirePermission } = require( '../middleware/auth' );

const router = express.Router();

/**
 * GET /api/workflows
 * Listar workflows do usuário
 */
router.get( '/', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { page = 1, limit = 20, status, search, category } = req.query;
    const offset = ( page - 1 ) * limit;

    let whereClause = 'WHERE user_id = ?';
    let params = [ req.user.id ];

    if ( status )
    {
      whereClause += ' AND status = ?';
      params.push( status );
    }

    if ( search )
    {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push( `%${ search }%`, `%${ search }%` );
    }

    if ( category )
    {
      whereClause += ' AND category = ?';
      params.push( category );
    }

    const workflows = await db.query( `
      SELECT 
        w.*,
        COUNT(we.id) as execution_count,
        MAX(we.created_at) as last_executed,
        AVG(we.execution_time) as avg_execution_time
      FROM workflows w
      LEFT JOIN workflow_executions we ON w.id = we.workflow_id
      ${ whereClause }
      GROUP BY w.id
      ORDER BY w.updated_at DESC
      LIMIT ? OFFSET ?
    `, [ ...params, parseInt( limit ), offset ] );

    // Contar total
    const totalResult = await db.query( `
      SELECT COUNT(*) as total FROM workflows ${ whereClause }
    `, params );

    const total = totalResult[ 0 ].total;

    res.json( {
      success: true,
      data: {
        workflows: workflows.map( workflow => ( {
          ...workflow,
          nodes: workflow.nodes ? JSON.parse( workflow.nodes ) : [],
          edges: workflow.edges ? JSON.parse( workflow.edges ) : [],
          config: workflow.config ? JSON.parse( workflow.config ) : {},
          quantumData: workflow.quantum_data ? JSON.parse( workflow.quantum_data ) : null
        } ) ),
        pagination: {
          page: parseInt( page ),
          limit: parseInt( limit ),
          total,
          totalPages: Math.ceil( total / limit )
        }
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao listar workflows:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter workflows'
    } );
  }
} );

/**
 * GET /api/workflows/:id
 * Obter workflow específico
 */
router.get( '/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    const workflows = await db.query( `
      SELECT * FROM workflows 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    if ( workflows.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Workflow não encontrado'
      } );
    }

    const workflow = workflows[ 0 ];

    // Buscar execuções recentes
    const executions = await db.query( `
      SELECT * FROM workflow_executions 
      WHERE workflow_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [ id ] );

    res.json( {
      success: true,
      data: {
        workflow: {
          ...workflow,
          nodes: workflow.nodes ? JSON.parse( workflow.nodes ) : [],
          edges: workflow.edges ? JSON.parse( workflow.edges ) : [],
          config: workflow.config ? JSON.parse( workflow.config ) : {},
          quantumData: workflow.quantum_data ? JSON.parse( workflow.quantum_data ) : null
        },
        executions
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter workflow:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter workflow'
    } );
  }
} );

/**
 * POST /api/workflows
 * Criar novo workflow
 */
router.post( '/', authenticateToken, async ( req, res ) =>
{
  try
  {
    const {
      name,
      description = '',
      category = 'general',
      nodes = [],
      edges = [],
      config = {},
      isActive = false,
      quantumEnhanced = true,
      milaAssisted = true
    } = req.body;

    if ( !name )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Nome do workflow é obrigatório'
      } );
    }

    console.log( `🔄 Criando workflow: ${ name } para usuário ${ req.user.id }` );

    // Validar estrutura do workflow
    const validationResult = await workflowService.validateWorkflow( {
      nodes,
      edges,
      config
    } );

    if ( !validationResult.valid )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Estrutura do workflow inválida',
        details: validationResult.errors
      } );
    }

    // Processar com algoritmos quânticos se habilitado
    let quantumOptimizations = {};
    if ( quantumEnhanced )
    {
      quantumOptimizations = await quantumProcessor.processOperation( {
        type: 'workflow_optimization',
        data: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          complexity: calculateWorkflowComplexity( nodes, edges )
        },
        complexity: 3,
        userId: req.user.id
      } );
    }

    // Gerar insights MILA
    let milaInsights = {};
    if ( milaAssisted )
    {
      milaInsights = await milaService.generateWorkflowInsights( {
        name,
        nodes,
        edges,
        userId: req.user.id
      } );
    }

    // Criar workflow
    const workflowResult = await db.query( `
      INSERT INTO workflows (
        user_id, name, description, category, nodes, edges, config,
        is_active, quantum_enhanced, mila_assisted, quantum_data,
        mila_data, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      req.user.id,
      name,
      description,
      category,
      JSON.stringify( nodes ),
      JSON.stringify( edges ),
      JSON.stringify( config ),
      isActive,
      quantumEnhanced,
      milaAssisted,
      JSON.stringify( quantumOptimizations ),
      JSON.stringify( milaInsights )
    ] );

    const workflowId = workflowResult.insertId;

    // Agendar workflow se ativo e tiver trigger de agendamento
    if ( isActive )
    {
      await workflowService.scheduleWorkflow( workflowId, nodes, edges );
    }

    res.status( 201 ).json( {
      success: true,
      data: {
        workflowId,
        quantumOptimizations,
        milaInsights,
        message: 'Workflow criado com sucesso'
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao criar workflow:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao criar workflow',
      details: error.message
    } );
  }
} );

/**
 * PUT /api/workflows/:id
 * Atualizar workflow
 */
router.put( '/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se o workflow pertence ao usuário
    const workflows = await db.query( `
      SELECT id FROM workflows 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    if ( workflows.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Workflow não encontrado'
      } );
    }

    // Validar estrutura se foi alterada
    if ( updateData.nodes || updateData.edges )
    {
      const validationResult = await workflowService.validateWorkflow( {
        nodes: updateData.nodes,
        edges: updateData.edges,
        config: updateData.config
      } );

      if ( !validationResult.valid )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'Estrutura do workflow inválida',
          details: validationResult.errors
        } );
      }
    }

    // Preparar campos para atualização
    const allowedFields = [
      'name', 'description', 'category', 'nodes', 'edges', 'config',
      'is_active', 'quantum_enhanced', 'mila_assisted'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys( updateData ).forEach( key =>
    {
      if ( allowedFields.includes( key ) )
      {
        updateFields.push( `${ key } = ?` );

        if ( [ 'nodes', 'edges', 'config' ].includes( key ) )
        {
          updateValues.push( JSON.stringify( updateData[ key ] ) );
        } else
        {
          updateValues.push( updateData[ key ] );
        }
      }
    } );

    if ( updateFields.length === 0 )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Nenhum campo válido para atualização'
      } );
    }

    updateFields.push( 'updated_at = NOW()' );
    updateValues.push( id );

    // Atualizar workflow
    await db.query( `
      UPDATE workflows 
      SET ${ updateFields.join( ', ' ) }
      WHERE id = ?
    `, updateValues );

    // Reagendar se necessário
    if ( updateData.isActive !== undefined || updateData.nodes || updateData.edges )
    {
      await workflowService.rescheduleWorkflow( id );
    }

    res.json( {
      success: true,
      message: 'Workflow atualizado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao atualizar workflow:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao atualizar workflow'
    } );
  }
} );

/**
 * DELETE /api/workflows/:id
 * Deletar workflow
 */
router.delete( '/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar se o workflow pertence ao usuário
    const workflows = await db.query( `
      SELECT id FROM workflows 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    if ( workflows.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Workflow não encontrado'
      } );
    }

    // Cancelar agendamentos
    await workflowService.unscheduleWorkflow( id );

    // Deletar execuções relacionadas
    await db.query( `DELETE FROM workflow_executions WHERE workflow_id = ?`, [ id ] );

    // Deletar workflow
    await db.query( `DELETE FROM workflows WHERE id = ?`, [ id ] );

    res.json( {
      success: true,
      message: 'Workflow deletado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao deletar workflow:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao deletar workflow'
    } );
  }
} );

/**
 * POST /api/workflows/:id/execute
 * Executar workflow
 */
router.post( '/:id/execute', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;
    const { parameters = {}, dryRun = false } = req.body;

    // Verificar se o workflow pertence ao usuário
    const workflows = await db.query( `
      SELECT * FROM workflows 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    if ( workflows.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Workflow não encontrado'
      } );
    }

    const workflow = workflows[ 0 ];

    console.log( `🔄 Executando workflow ${ workflow.name } para usuário ${ req.user.id }` );

    // Criar registro de execução
    const executionResult = await db.query( `
      INSERT INTO workflow_executions (
        workflow_id, user_id, status, parameters, dry_run, created_at
      ) VALUES (?, ?, 'running', ?, ?, NOW())
    `, [ id, req.user.id, JSON.stringify( parameters ), dryRun ] );

    const executionId = executionResult.insertId;

    // Executar workflow em background
    setImmediate( async () =>
    {
      try
      {
        const startTime = Date.now();

        const executionResult = await workflowService.executeWorkflow( {
          workflow: {
            ...workflow,
            nodes: JSON.parse( workflow.nodes ),
            edges: JSON.parse( workflow.edges ),
            config: JSON.parse( workflow.config || '{}' )
          },
          parameters,
          dryRun,
          executionId
        } );

        const endTime = Date.now();
        const executionTime = ( endTime - startTime ) / 1000; // segundos

        // Atualizar registro de execução
        await db.query( `
          UPDATE workflow_executions 
          SET status = ?, result = ?, execution_time = ?, completed_at = NOW()
          WHERE id = ?
        `, [
          executionResult.success ? 'completed' : 'failed',
          JSON.stringify( executionResult ),
          executionTime,
          executionId
        ] );

        // Atualizar contador do workflow
        await db.query( `
          UPDATE workflows 
          SET execution_count = execution_count + 1, last_executed = NOW()
          WHERE id = ?
        `, [ id ] );

      } catch ( error )
      {
        console.error( '❌ Erro na execução do workflow:', error );

        // Atualizar com erro
        await db.query( `
          UPDATE workflow_executions 
          SET status = 'failed', error_message = ?, completed_at = NOW()
          WHERE id = ?
        `, [ error.message, executionId ] );
      }
    } );

    res.json( {
      success: true,
      data: {
        executionId,
        status: 'running',
        message: dryRun ? 'Simulação de workflow iniciada' : 'Execução de workflow iniciada'
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao executar workflow:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao executar workflow'
    } );
  }
} );

/**
 * GET /api/workflows/:id/executions/:executionId/status
 * Verificar status da execução
 */
router.get( '/:id/executions/:executionId/status', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id, executionId } = req.params;

    const executions = await db.query( `
      SELECT we.*, w.name as workflow_name
      FROM workflow_executions we
      JOIN workflows w ON we.workflow_id = w.id
      WHERE we.id = ? AND we.workflow_id = ? AND w.user_id = ?
    `, [ executionId, id, req.user.id ] );

    if ( executions.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Execução não encontrada'
      } );
    }

    const execution = executions[ 0 ];

    res.json( {
      success: true,
      data: {
        executionId: execution.id,
        status: execution.status,
        progress: execution.status === 'running' ? 50 : 100, // Simular progresso
        result: execution.result ? JSON.parse( execution.result ) : null,
        executionTime: execution.execution_time,
        errorMessage: execution.error_message,
        createdAt: execution.created_at,
        completedAt: execution.completed_at,
        dryRun: execution.dry_run
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao verificar status:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao verificar status da execução'
    } );
  }
} );

/**
 * GET /api/workflows/templates
 * Listar templates de workflow
 */
router.get( '/templates', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { category, search } = req.query;

    let whereClause = 'WHERE is_template = 1 AND (user_id = ? OR is_public = 1)';
    let params = [ req.user.id ];

    if ( category )
    {
      whereClause += ' AND category = ?';
      params.push( category );
    }

    if ( search )
    {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push( `%${ search }%`, `%${ search }%` );
    }

    const templates = await db.query( `
      SELECT 
        id, name, description, category, nodes, edges, config,
        quantum_enhanced, mila_assisted, usage_count, created_at
      FROM workflows 
      ${ whereClause }
      ORDER BY usage_count DESC, name ASC
    `, params );

    res.json( {
      success: true,
      data: {
        templates: templates.map( template => ( {
          ...template,
          nodes: template.nodes ? JSON.parse( template.nodes ) : [],
          edges: template.edges ? JSON.parse( template.edges ) : [],
          config: template.config ? JSON.parse( template.config ) : {}
        } ) )
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao listar templates:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter templates'
    } );
  }
} );

/**
 * POST /api/workflows/templates/:templateId/use
 * Usar template para criar workflow
 */
router.post( '/templates/:templateId/use', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { templateId } = req.params;
    const { name, parameters = {} } = req.body;

    if ( !name )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Nome do workflow é obrigatório'
      } );
    }

    // Buscar template
    const templates = await db.query( `
      SELECT * FROM workflows 
      WHERE id = ? AND is_template = 1 AND (user_id = ? OR is_public = 1)
    `, [ templateId, req.user.id ] );

    if ( templates.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Template não encontrado'
      } );
    }

    const template = templates[ 0 ];

    // Criar workflow baseado no template
    const workflowResult = await db.query( `
      INSERT INTO workflows (
        user_id, name, description, category, nodes, edges, config,
        quantum_enhanced, mila_assisted, template_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      req.user.id,
      name,
      `Baseado no template: ${ template.name }`,
      template.category,
      template.nodes,
      template.edges,
      template.config,
      template.quantum_enhanced,
      template.mila_assisted,
      templateId
    ] );

    // Incrementar contador de uso do template
    await db.query( `
      UPDATE workflows 
      SET usage_count = usage_count + 1
      WHERE id = ?
    `, [ templateId ] );

    res.status( 201 ).json( {
      success: true,
      data: {
        workflowId: workflowResult.insertId,
        message: 'Workflow criado a partir do template'
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao usar template:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao criar workflow a partir do template'
    } );
  }
} );

// Função auxiliar para calcular complexidade do workflow
function calculateWorkflowComplexity( nodes, edges )
{
  const nodeComplexity = nodes.length * 0.5;
  const edgeComplexity = edges.length * 0.3;
  const logicNodes = nodes.filter( n =>
    [ 'condition', 'filter', 'loop' ].includes( n.data?.type )
  ).length * 1.5;

  return Math.min( nodeComplexity + edgeComplexity + logicNodes, 5 );
}

module.exports = router;
