/**
 * SISTEMA DE RELATÓRIOS AVANÇADOS
 * Geração automática de relatórios com templates e exportação
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require( 'express' );
const { db } = require( '../database-config' );
const { requireAuth, requirePermission } = require( '../middleware/auth' );

const router = express.Router();

/**
 * GET /api/reports
 * Listar relatórios do usuário
 */
router.get( '/', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { page = 1, limit = 20, search, type, category, status } = req.query;
    const offset = ( page - 1 ) * limit;

    let whereClause = 'WHERE (user_id = ? OR is_public = 1)';
    let params = [ req.user.id ];

    // Filtro de tenant para isolamento
    if ( req.user.role !== 'super_admin' && req.user.tenantId )
    {
      whereClause += ' AND (tenant_id = ? OR tenant_id IS NULL)';
      params.push( req.user.tenantId );
    }

    if ( search )
    {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push( `%${ search }%`, `%${ search }%` );
    }

    if ( type )
    {
      whereClause += ' AND type = ?';
      params.push( type );
    }

    if ( category )
    {
      whereClause += ' AND category = ?';
      params.push( category );
    }

    if ( status )
    {
      whereClause += ' AND status = ?';
      params.push( status );
    }

    const reports = await db.query( `
      SELECT
        r.*,
        u.name as created_by_name,
        COUNT(re.id) as execution_count,
        MAX(re.created_at) as last_executed
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN report_executions re ON r.id = re.report_id
      ${ whereClause }
      GROUP BY r.id
      ORDER BY r.updated_at DESC
      LIMIT ? OFFSET ?
    `, [ ...params, parseInt( limit ), offset ] );

    // Contar total
    const totalResult = await db.query( `
      SELECT COUNT(*) as total FROM reports ${ whereClause }
    `, params );

    const total = totalResult[ 0 ].total;

    res.json( {
      success: true,
      data: {
        reports: reports.map( report => ( {
          ...report,
          config: report.config ? JSON.parse( report.config ) : {},
          filters: report.filters ? JSON.parse( report.filters ) : {},
          schedule: report.schedule ? JSON.parse( report.schedule ) : null
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
    console.error( '❌ Erro ao listar relatórios:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter relatórios'
    } );
  }
} );

/**
 * GET /api/reports/:id
 * Obter relatório específico
 */
router.get( '/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    const reports = await db.query( `
      SELECT * FROM reports 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    if ( reports.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Relatório não encontrado'
      } );
    }

    const report = reports[ 0 ];

    // Buscar gerações recentes
    const generations = await db.query( `
      SELECT * FROM report_generations 
      WHERE report_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [ id ] );

    res.json( {
      success: true,
      data: {
        report: {
          ...report,
          parameters: report.parameters ? JSON.parse( report.parameters ) : {},
          scheduleConfig: report.schedule_config ? JSON.parse( report.schedule_config ) : null
        },
        generations
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter relatório:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter relatório'
    } );
  }
} );

/**
 * POST /api/reports
 * Criar novo relatório
 */
router.post( '/', authenticateToken, async ( req, res ) =>
{
  try
  {
    const {
      name,
      description,
      type,
      dataSource,
      queryText,
      parameters = {},
      scheduleConfig = null,
      outputFormat = 'pdf',
      quantumEnhanced = true,
      isScheduled = false
    } = req.body;

    if ( !name || !type || !dataSource )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Nome, tipo e fonte de dados são obrigatórios'
      } );
    }

    console.log( `📊 Criando relatório: ${ name } para usuário ${ req.user.id }` );

    // Validar query se fornecida
    if ( queryText )
    {
      const validationResult = await reportService.validateQuery( queryText, dataSource );
      if ( !validationResult.valid )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'Query inválida',
          details: validationResult.errors
        } );
      }
    }

    // Processar com algoritmos quânticos se habilitado
    let quantumOptimizations = {};
    if ( quantumEnhanced )
    {
      quantumOptimizations = await quantumProcessor.processOperation( {
        type: 'report_optimization',
        data: {
          reportType: type,
          dataSource,
          queryComplexity: queryText ? queryText.length : 0,
          parameters
        },
        complexity: 3,
        userId: req.user.id
      } );
    }

    // Gerar insights MILA
    const milaInsights = await milaService.generateReportInsights( {
      name,
      type,
      dataSource,
      userId: req.user.id
    } );

    // Criar relatório
    const reportResult = await db.query( `
      INSERT INTO reports (
        user_id, name, description, type, data_source, query_text,
        parameters, schedule_config, output_format, quantum_enhanced,
        is_scheduled, quantum_data, mila_data, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      req.user.id,
      name,
      description,
      type,
      dataSource,
      queryText,
      JSON.stringify( parameters ),
      scheduleConfig ? JSON.stringify( scheduleConfig ) : null,
      outputFormat,
      quantumEnhanced,
      isScheduled,
      JSON.stringify( quantumOptimizations ),
      JSON.stringify( milaInsights )
    ] );

    const reportId = reportResult.insertId;

    // Configurar agendamento se necessário
    if ( isScheduled && scheduleConfig )
    {
      await reportService.scheduleReport( {
        reportId,
        scheduleConfig,
        userId: req.user.id
      } );
    }

    res.status( 201 ).json( {
      success: true,
      data: {
        reportId,
        quantumOptimizations,
        milaInsights,
        message: 'Relatório criado com sucesso'
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao criar relatório:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao criar relatório',
      details: error.message
    } );
  }
} );

/**
 * PUT /api/reports/:id
 * Atualizar relatório
 */
router.put( '/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se o relatório pertence ao usuário
    const reports = await db.query( `
      SELECT id FROM reports 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    if ( reports.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Relatório não encontrado'
      } );
    }

    // Validar query se foi alterada
    if ( updateData.queryText )
    {
      const validationResult = await reportService.validateQuery(
        updateData.queryText,
        updateData.dataSource
      );
      if ( !validationResult.valid )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'Query inválida',
          details: validationResult.errors
        } );
      }
    }

    // Preparar campos para atualização
    const allowedFields = [
      'name', 'description', 'type', 'data_source', 'query_text',
      'parameters', 'schedule_config', 'output_format', 'quantum_enhanced', 'is_scheduled'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys( updateData ).forEach( key =>
    {
      if ( allowedFields.includes( key ) )
      {
        updateFields.push( `${ key } = ?` );

        if ( key === 'parameters' || key === 'schedule_config' )
        {
          updateValues.push( updateData[ key ] ? JSON.stringify( updateData[ key ] ) : null );
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

    // Atualizar relatório
    await db.query( `
      UPDATE reports 
      SET ${ updateFields.join( ', ' ) }
      WHERE id = ?
    `, updateValues );

    // Reconfigurar agendamento se necessário
    if ( updateData.isScheduled !== undefined || updateData.scheduleConfig )
    {
      if ( updateData.isScheduled && updateData.scheduleConfig )
      {
        await reportService.scheduleReport( {
          reportId: id,
          scheduleConfig: updateData.scheduleConfig,
          userId: req.user.id
        } );
      } else if ( updateData.isScheduled === false )
      {
        await reportService.unscheduleReport( id );
      }
    }

    res.json( {
      success: true,
      message: 'Relatório atualizado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao atualizar relatório:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao atualizar relatório'
    } );
  }
} );

/**
 * DELETE /api/reports/:id
 * Deletar relatório
 */
router.delete( '/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar se o relatório pertence ao usuário
    const reports = await db.query( `
      SELECT id FROM reports 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    if ( reports.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Relatório não encontrado'
      } );
    }

    // Deletar gerações relacionadas
    await db.query( `DELETE FROM report_generations WHERE report_id = ?`, [ id ] );

    // Deletar relatório
    await db.query( `DELETE FROM reports WHERE id = ?`, [ id ] );

    // Cancelar agendamento se existir
    await reportService.unscheduleReport( id );

    res.json( {
      success: true,
      message: 'Relatório deletado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao deletar relatório:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao deletar relatório'
    } );
  }
} );

/**
 * POST /api/reports/:id/generate
 * Gerar relatório
 */
router.post( '/:id/generate', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;
    const { parameters = {}, format } = req.body;

    // Verificar se o relatório pertence ao usuário
    const reports = await db.query( `
      SELECT * FROM reports 
      WHERE id = ? AND user_id = ?
    `, [ id, req.user.id ] );

    if ( reports.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Relatório não encontrado'
      } );
    }

    const report = reports[ 0 ];

    console.log( `📊 Gerando relatório ${ report.name } para usuário ${ req.user.id }` );

    // Criar registro de geração
    const generationResult = await db.query( `
      INSERT INTO report_generations (
        report_id, user_id, status, created_at
      ) VALUES (?, ?, 'generating', NOW())
    `, [ id, req.user.id ] );

    const generationId = generationResult.insertId;

    // Processar geração em background
    setImmediate( async () =>
    {
      try
      {
        const startTime = Date.now();

        // Processar com algoritmos quânticos se habilitado
        let quantumSpeedup = 1;
        if ( report.quantum_enhanced )
        {
          const quantumResult = await quantumProcessor.processOperation( {
            type: 'report_generation_optimization',
            data: {
              reportType: report.type,
              dataSize: 'medium', // Simular tamanho dos dados
              complexity: 3
            },
            complexity: 3,
            userId: req.user.id
          } );

          quantumSpeedup = quantumResult.speedup || 1;
        }

        // Gerar relatório
        const generationResult = await reportService.generateReport( {
          report: {
            ...report,
            parameters: report.parameters ? JSON.parse( report.parameters ) : {}
          },
          runtimeParameters: parameters,
          outputFormat: format || report.output_format,
          quantumSpeedup
        } );

        const endTime = Date.now();
        const executionTime = ( endTime - startTime ) / 1000; // segundos

        // Atualizar registro de geração
        await db.query( `
          UPDATE report_generations 
          SET status = ?, file_path = ?, file_size = ?, 
              generation_time = ?, quantum_speedup = ?, completed_at = NOW()
          WHERE id = ?
        `, [
          generationResult.success ? 'completed' : 'failed',
          generationResult.filePath,
          generationResult.fileSize,
          executionTime,
          quantumSpeedup,
          generationId
        ] );

        // Atualizar contador do relatório
        await db.query( `
          UPDATE reports 
          SET generation_count = generation_count + 1, last_generated = NOW()
          WHERE id = ?
        `, [ id ] );

      } catch ( error )
      {
        console.error( '❌ Erro na geração do relatório:', error );

        // Atualizar com erro
        await db.query( `
          UPDATE report_generations 
          SET status = 'failed', error_message = ?, completed_at = NOW()
          WHERE id = ?
        `, [ error.message, generationId ] );
      }
    } );

    res.json( {
      success: true,
      data: {
        generationId,
        status: 'generating',
        message: 'Geração de relatório iniciada'
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao iniciar geração:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao gerar relatório'
    } );
  }
} );

/**
 * GET /api/reports/:id/generations/:generationId/status
 * Verificar status da geração
 */
router.get( '/:id/generations/:generationId/status', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id, generationId } = req.params;

    const generations = await db.query( `
      SELECT rg.*, r.name as report_name
      FROM report_generations rg
      JOIN reports r ON rg.report_id = r.id
      WHERE rg.id = ? AND rg.report_id = ? AND r.user_id = ?
    `, [ generationId, id, req.user.id ] );

    if ( generations.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Geração não encontrada'
      } );
    }

    const generation = generations[ 0 ];

    res.json( {
      success: true,
      data: {
        generationId: generation.id,
        status: generation.status,
        progress: generation.status === 'generating' ? 50 : 100, // Simular progresso
        filePath: generation.file_path,
        fileSize: generation.file_size,
        generationTime: generation.generation_time,
        quantumSpeedup: generation.quantum_speedup,
        errorMessage: generation.error_message,
        createdAt: generation.created_at,
        completedAt: generation.completed_at
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao verificar status:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao verificar status da geração'
    } );
  }
} );

/**
 * GET /api/reports/:id/generations/:generationId/download
 * Download do relatório gerado
 */
router.get( '/:id/generations/:generationId/download', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id, generationId } = req.params;

    const generations = await db.query( `
      SELECT rg.*, r.name as report_name
      FROM report_generations rg
      JOIN reports r ON rg.report_id = r.id
      WHERE rg.id = ? AND rg.report_id = ? AND r.user_id = ? AND rg.status = 'completed'
    `, [ generationId, id, req.user.id ] );

    if ( generations.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Relatório não encontrado ou não está pronto'
      } );
    }

    const generation = generations[ 0 ];

    if ( !generation.file_path )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Arquivo do relatório não encontrado'
      } );
    }

    // Simular download (em produção, seria res.download(generation.file_path))
    res.json( {
      success: true,
      data: {
        downloadUrl: `/downloads/reports/${ generation.file_path }`,
        filename: `${ generation.report_name }_${ generationId }.pdf`,
        fileSize: generation.file_size,
        contentType: 'application/pdf'
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no download:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro no download do relatório'
    } );
  }
} );

/**
 * GET /api/reports/templates
 * Listar templates de relatório
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
      whereClause += ' AND type = ?';
      params.push( category );
    }

    if ( search )
    {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push( `%${ search }%`, `%${ search }%` );
    }

    const templates = await db.query( `
      SELECT 
        id, name, description, type, data_source, query_text,
        parameters, output_format, quantum_enhanced, usage_count,
        created_at, updated_at
      FROM reports 
      ${ whereClause }
      ORDER BY usage_count DESC, name ASC
    `, params );

    res.json( {
      success: true,
      data: {
        templates: templates.map( template => ( {
          ...template,
          parameters: template.parameters ? JSON.parse( template.parameters ) : {}
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
 * POST /api/reports/templates/:templateId/use
 * Usar template para criar relatório
 */
router.post( '/templates/:templateId/use', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { templateId } = req.params;
    const { name, parameters = {}, scheduleConfig = null } = req.body;

    if ( !name )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Nome do relatório é obrigatório'
      } );
    }

    // Buscar template
    const templates = await db.query( `
      SELECT * FROM reports 
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

    // Criar relatório baseado no template
    const reportResult = await db.query( `
      INSERT INTO reports (
        user_id, name, description, type, data_source, query_text,
        parameters, schedule_config, output_format, quantum_enhanced,
        is_scheduled, template_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      req.user.id,
      name,
      `Baseado no template: ${ template.name }`,
      template.type,
      template.data_source,
      template.query_text,
      JSON.stringify( { ...JSON.parse( template.parameters || '{}' ), ...parameters } ),
      scheduleConfig ? JSON.stringify( scheduleConfig ) : null,
      template.output_format,
      template.quantum_enhanced,
      scheduleConfig !== null,
      templateId
    ] );

    // Incrementar contador de uso do template
    await db.query( `
      UPDATE reports 
      SET usage_count = usage_count + 1
      WHERE id = ?
    `, [ templateId ] );

    res.status( 201 ).json( {
      success: true,
      data: {
        reportId: reportResult.insertId,
        message: 'Relatório criado a partir do template'
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao usar template:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao criar relatório a partir do template'
    } );
  }
} );

/**
 * GET /api/reports/analytics
 * Analytics de relatórios
 */
router.get( '/analytics', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { period = '30d' } = req.query;

    let dateFilter = '';
    switch ( period )
    {
      case '7d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case '90d':
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 90 DAY)';
        break;
      default:
        dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    // Estatísticas gerais
    const stats = await db.query( `
      SELECT 
        COUNT(DISTINCT r.id) as total_reports,
        COUNT(rg.id) as total_generations,
        COUNT(CASE WHEN r.quantum_enhanced = 1 THEN 1 END) as quantum_enhanced,
        AVG(rg.generation_time) as avg_generation_time,
        AVG(rg.quantum_speedup) as avg_quantum_speedup
      FROM reports r
      LEFT JOIN report_generations rg ON r.id = rg.report_id
      WHERE r.user_id = ? AND r.created_at >= ${ dateFilter }
    `, [ req.user.id ] );

    // Distribuição por tipo
    const typeDistribution = await db.query( `
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN quantum_enhanced = 1 THEN 1 END) as quantum_count
      FROM reports 
      WHERE user_id = ? AND created_at >= ${ dateFilter }
      GROUP BY type
    `, [ req.user.id ] );

    // Relatórios mais gerados
    const topReports = await db.query( `
      SELECT 
        r.name,
        r.type,
        COUNT(rg.id) as generation_count,
        AVG(rg.generation_time) as avg_time
      FROM reports r
      LEFT JOIN report_generations rg ON r.id = rg.report_id
      WHERE r.user_id = ? AND r.created_at >= ${ dateFilter }
      GROUP BY r.id
      ORDER BY generation_count DESC
      LIMIT 10
    `, [ req.user.id ] );

    res.json( {
      success: true,
      data: {
        period,
        stats: stats[ 0 ],
        typeDistribution,
        topReports,
        generatedAt: new Date()
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter analytics:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter analytics de relatórios'
    } );
  }
} );

module.exports = router;
