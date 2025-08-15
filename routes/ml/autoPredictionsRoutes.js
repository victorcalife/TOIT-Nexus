/**
 * ROTAS API PARA PREDIÇÕES AUTOMÁTICAS
 * Gerenciamento de predições automáticas agendadas
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Importar middlewares
const { checkForViewOnly, checkPlanLimits } = require('../../middleware/ml/checkMLCredits');

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ====================================================================
// ROTAS DE PREDIÇÕES AUTOMÁTICAS
// ====================================================================

/**
 * GET /api/auto-predictions
 * Listar predições automáticas do tenant
 */
router.get('/auto-predictions', checkForViewOnly, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    const { active, predictionType } = req.query;

    let query = `
      SELECT 
        id,
        prediction_type,
        prediction_name,
        description,
        schedule_frequency,
        schedule_time,
        last_run_at,
        next_run_at,
        run_count,
        success_count,
        is_active,
        created_at,
        updated_at
      FROM auto_predictions
      WHERE tenant_id = $1
    `;

    const params = [tenantId];
    let paramIndex = 2;

    if (active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(active === 'true');
      paramIndex++;
    }

    if (predictionType) {
      query += ` AND prediction_type = $${paramIndex}`;
      params.push(predictionType);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    console.log(`📋 [API-AUTO-PREDICTIONS] Listando predições - Tenant: ${tenantId}`);

    const result = await pool.query(query, params);

    // Calcular estatísticas
    const predictions = result.rows;
    const stats = {
      total: predictions.length,
      active: predictions.filter(p => p.is_active).length,
      inactive: predictions.filter(p => !p.is_active).length,
      totalRuns: predictions.reduce((sum, p) => sum + p.run_count, 0),
      successRate: predictions.length > 0 ? 
        Math.round((predictions.reduce((sum, p) => sum + p.success_count, 0) / 
        Math.max(1, predictions.reduce((sum, p) => sum + p.run_count, 0))) * 100) : 0
    };

    res.json({
      success: true,
      data: {
        predictions,
        stats
      }
    });

  } catch (error) {
    console.error('❌ [API-AUTO-PREDICTIONS] Erro ao listar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar predições automáticas'
    });
  }
});

/**
 * POST /api/auto-predictions
 * Criar nova predição automática
 */
router.post('/auto-predictions', 
  checkPlanLimits('auto_predictions'),
  async (req, res) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      const {
        predictionType,
        predictionName,
        description,
        scheduleFrequency = 'daily',
        scheduleTime = '09:00:00',
        dataSourceConfig = {},
        outputConfig = {},
        isActive = false
      } = req.body;

      if (!predictionType || !predictionName) {
        return res.status(400).json({
          success: false,
          error: 'Tipo e nome da predição são obrigatórios'
        });
      }

      console.log(`➕ [API-AUTO-PREDICTIONS] Criando predição - Tenant: ${tenantId}, Nome: ${predictionName}`);

      // Calcular próxima execução
      const nextRunResult = await pool.query(`
        SELECT calculate_next_run($1, $2) as next_run
      `, [scheduleFrequency, scheduleTime]);

      const nextRun = nextRunResult.rows[0].next_run;

      // Inserir predição
      const result = await pool.query(`
        INSERT INTO auto_predictions (
          tenant_id,
          prediction_type,
          prediction_name,
          description,
          schedule_frequency,
          schedule_time,
          data_source_config,
          output_config,
          next_run_at,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        tenantId,
        predictionType,
        predictionName,
        description,
        scheduleFrequency,
        scheduleTime,
        JSON.stringify(dataSourceConfig),
        JSON.stringify(outputConfig),
        nextRun,
        isActive
      ]);

      const prediction = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Predição automática criada com sucesso',
        data: {
          prediction: {
            id: prediction.id,
            predictionType: prediction.prediction_type,
            predictionName: prediction.prediction_name,
            description: prediction.description,
            scheduleFrequency: prediction.schedule_frequency,
            scheduleTime: prediction.schedule_time,
            nextRunAt: prediction.next_run_at,
            isActive: prediction.is_active,
            createdAt: prediction.created_at
          }
        }
      });

    } catch (error) {
      console.error('❌ [API-AUTO-PREDICTIONS] Erro ao criar:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'Já existe uma predição com este nome'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro ao criar predição automática'
      });
    }
  }
);

/**
 * GET /api/auto-predictions/:id
 * Obter detalhes de uma predição específica
 */
router.get('/auto-predictions/:id', checkForViewOnly, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    const { id } = req.params;

    console.log(`🔍 [API-AUTO-PREDICTIONS] Buscando predição - ID: ${id}`);

    const result = await pool.query(`
      SELECT 
        *,
        CASE 
          WHEN last_run_at IS NOT NULL AND run_count > 0 
          THEN ROUND((success_count::DECIMAL / run_count) * 100, 2)
          ELSE 0 
        END as success_rate
      FROM auto_predictions
      WHERE id = $1 AND tenant_id = $2
    `, [id, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Predição não encontrada'
      });
    }

    const prediction = result.rows[0];

    res.json({
      success: true,
      data: {
        prediction: {
          id: prediction.id,
          predictionType: prediction.prediction_type,
          predictionName: prediction.prediction_name,
          description: prediction.description,
          scheduleFrequency: prediction.schedule_frequency,
          scheduleTime: prediction.schedule_time,
          dataSourceConfig: prediction.data_source_config,
          outputConfig: prediction.output_config,
          lastRunAt: prediction.last_run_at,
          nextRunAt: prediction.next_run_at,
          lastResult: prediction.last_result,
          lastError: prediction.last_error,
          runCount: prediction.run_count,
          successCount: prediction.success_count,
          successRate: prediction.success_rate,
          isActive: prediction.is_active,
          createdAt: prediction.created_at,
          updatedAt: prediction.updated_at
        }
      }
    });

  } catch (error) {
    console.error('❌ [API-AUTO-PREDICTIONS] Erro ao buscar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar predição'
    });
  }
});

/**
 * PUT /api/auto-predictions/:id
 * Atualizar predição automática
 */
router.put('/auto-predictions/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    const { id } = req.params;
    const {
      predictionName,
      description,
      scheduleFrequency,
      scheduleTime,
      dataSourceConfig,
      outputConfig,
      isActive
    } = req.body;

    console.log(`✏️ [API-AUTO-PREDICTIONS] Atualizando predição - ID: ${id}`);

    // Verificar se a predição existe e pertence ao tenant
    const existsResult = await pool.query(`
      SELECT id FROM auto_predictions 
      WHERE id = $1 AND tenant_id = $2
    `, [id, tenantId]);

    if (existsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Predição não encontrada'
      });
    }

    // Construir query de update dinamicamente
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (predictionName !== undefined) {
      updates.push(`prediction_name = $${paramIndex}`);
      params.push(predictionName);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }

    if (scheduleFrequency !== undefined) {
      updates.push(`schedule_frequency = $${paramIndex}`);
      params.push(scheduleFrequency);
      paramIndex++;
    }

    if (scheduleTime !== undefined) {
      updates.push(`schedule_time = $${paramIndex}`);
      params.push(scheduleTime);
      paramIndex++;
    }

    if (dataSourceConfig !== undefined) {
      updates.push(`data_source_config = $${paramIndex}`);
      params.push(JSON.stringify(dataSourceConfig));
      paramIndex++;
    }

    if (outputConfig !== undefined) {
      updates.push(`output_config = $${paramIndex}`);
      params.push(JSON.stringify(outputConfig));
      paramIndex++;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo para atualizar fornecido'
      });
    }

    // Recalcular próxima execução se horário mudou
    if (scheduleFrequency !== undefined || scheduleTime !== undefined) {
      const nextRunResult = await pool.query(`
        SELECT calculate_next_run(
          COALESCE($1, schedule_frequency), 
          COALESCE($2, schedule_time)
        ) as next_run
        FROM auto_predictions 
        WHERE id = $3
      `, [scheduleFrequency, scheduleTime, id]);

      const nextRun = nextRunResult.rows[0].next_run;
      updates.push(`next_run_at = $${paramIndex}`);
      params.push(nextRun);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);
    params.push(id, tenantId);

    const query = `
      UPDATE auto_predictions 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex - 1} AND tenant_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    const prediction = result.rows[0];

    res.json({
      success: true,
      message: 'Predição atualizada com sucesso',
      data: {
        prediction: {
          id: prediction.id,
          predictionName: prediction.prediction_name,
          description: prediction.description,
          scheduleFrequency: prediction.schedule_frequency,
          scheduleTime: prediction.schedule_time,
          nextRunAt: prediction.next_run_at,
          isActive: prediction.is_active,
          updatedAt: prediction.updated_at
        }
      }
    });

  } catch (error) {
    console.error('❌ [API-AUTO-PREDICTIONS] Erro ao atualizar:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Já existe uma predição com este nome'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar predição'
    });
  }
});

/**
 * DELETE /api/auto-predictions/:id
 * Remover predição automática
 */
router.delete('/auto-predictions/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    const { id } = req.params;

    console.log(`🗑️ [API-AUTO-PREDICTIONS] Removendo predição - ID: ${id}`);

    const result = await pool.query(`
      DELETE FROM auto_predictions 
      WHERE id = $1 AND tenant_id = $2
      RETURNING prediction_name
    `, [id, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Predição não encontrada'
      });
    }

    const predictionName = result.rows[0].prediction_name;

    res.json({
      success: true,
      message: `Predição '${predictionName}' removida com sucesso`
    });

  } catch (error) {
    console.error('❌ [API-AUTO-PREDICTIONS] Erro ao remover:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover predição'
    });
  }
});

/**
 * POST /api/auto-predictions/:id/toggle
 * Ativar/desativar predição automática
 */
router.post('/auto-predictions/:id/toggle', async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    const { id } = req.params;

    console.log(`🔄 [API-AUTO-PREDICTIONS] Alternando status - ID: ${id}`);

    const result = await pool.query(`
      UPDATE auto_predictions 
      SET 
        is_active = NOT is_active,
        updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING prediction_name, is_active
    `, [id, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Predição não encontrada'
      });
    }

    const { prediction_name, is_active } = result.rows[0];

    res.json({
      success: true,
      message: `Predição '${prediction_name}' ${is_active ? 'ativada' : 'desativada'} com sucesso`,
      data: {
        predictionName: prediction_name,
        isActive: is_active
      }
    });

  } catch (error) {
    console.error('❌ [API-AUTO-PREDICTIONS] Erro ao alternar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao alternar status da predição'
    });
  }
});

module.exports = router;
