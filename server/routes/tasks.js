/**
 * SISTEMA DE TASK MANAGEMENT COMPLETO
 * Backend para gestão avançada de tarefas e projetos
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const { db } = require('../database-config');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

/**
 * LISTAR TAREFAS
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { 
      project_id, 
      status, 
      priority, 
      assignee_id,
      page = 1, 
      limit = 50,
      search 
    } = req.query;

    let query = `
      SELECT 
        t.*,
        p.name as project_name,
        p.color as project_color,
        assignee.name as assignee_name,
        assignee.email as assignee_email,
        reporter.name as reporter_name,
        COUNT(c.id) as comments_count,
        COUNT(a.id) as attachments_count,
        COUNT(st.id) as subtasks_count,
        COUNT(CASE WHEN st.completed = true THEN 1 END) as completed_subtasks
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users assignee ON t.assignee_id = assignee.id
      LEFT JOIN users reporter ON t.reporter_id = reporter.id
      LEFT JOIN task_comments c ON t.id = c.task_id
      LEFT JOIN task_attachments a ON t.id = a.task_id
      LEFT JOIN task_subtasks st ON t.id = st.task_id
      WHERE t.tenant_id = $1
    `;
    
    const params = [req.user.tenant_id];
    let paramIndex = 2;

    if (project_id) {
      query += ` AND t.project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (assignee_id) {
      query += ` AND t.assignee_id = $${paramIndex}`;
      params.push(assignee_id);
      paramIndex++;
    }

    if (search) {
      query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += `
      GROUP BY t.id, p.name, p.color, assignee.name, assignee.email, reporter.name
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * OBTER TAREFA POR ID
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar tarefa principal
    const taskResult = await db.query(`
      SELECT 
        t.*,
        p.name as project_name,
        p.color as project_color,
        assignee.name as assignee_name,
        assignee.email as assignee_email,
        assignee.avatar_url as assignee_avatar,
        reporter.name as reporter_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users assignee ON t.assignee_id = assignee.id
      LEFT JOIN users reporter ON t.reporter_id = reporter.id
      WHERE t.id = $1 AND t.tenant_id = $2
    `, [id, req.user.tenant_id]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }

    const task = taskResult.rows[0];

    // Buscar subtarefas
    const subtasksResult = await db.query(`
      SELECT * FROM task_subtasks 
      WHERE task_id = $1 
      ORDER BY created_at ASC
    `, [id]);

    // Buscar comentários
    const commentsResult = await db.query(`
      SELECT 
        c.*,
        u.name as author_name,
        u.avatar_url as author_avatar
      FROM task_comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.task_id = $1
      ORDER BY c.created_at DESC
    `, [id]);

    // Buscar anexos
    const attachmentsResult = await db.query(`
      SELECT * FROM task_attachments 
      WHERE task_id = $1 
      ORDER BY created_at DESC
    `, [id]);

    // Buscar histórico de tempo
    const timeLogsResult = await db.query(`
      SELECT 
        tl.*,
        u.name as user_name
      FROM task_time_logs tl
      LEFT JOIN users u ON tl.user_id = u.id
      WHERE tl.task_id = $1
      ORDER BY tl.created_at DESC
    `, [id]);

    task.subtasks = subtasksResult.rows;
    task.comments = commentsResult.rows;
    task.attachments = attachmentsResult.rows;
    task.timeLogs = timeLogsResult.rows;

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Erro ao obter tarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * CRIAR TAREFA
 */
router.post('/', requireAuth, requirePermission('tasks.create'), async (req, res) => {
  try {
    const {
      title,
      description,
      project_id,
      assignee_id,
      priority = 'medium',
      status = 'todo',
      due_date,
      estimated_hours,
      tags = [],
      subtasks = []
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Título é obrigatório'
      });
    }

    // Criar tarefa principal
    const taskResult = await db.query(`
      INSERT INTO tasks (
        tenant_id,
        title,
        description,
        project_id,
        assignee_id,
        reporter_id,
        priority,
        status,
        due_date,
        estimated_hours,
        tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      req.user.tenant_id,
      title,
      description,
      project_id,
      assignee_id,
      req.user.id,
      priority,
      status,
      due_date,
      estimated_hours,
      JSON.stringify(tags)
    ]);

    const task = taskResult.rows[0];

    // Criar subtarefas se fornecidas
    if (subtasks.length > 0) {
      for (const subtask of subtasks) {
        await db.query(`
          INSERT INTO task_subtasks (
            task_id,
            title,
            completed
          ) VALUES ($1, $2, $3)
        `, [task.id, subtask.title, subtask.completed || false]);
      }
    }

    res.status(201).json({
      success: true,
      data: task,
      message: 'Tarefa criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * ATUALIZAR TAREFA
 */
router.put('/:id', requireAuth, requirePermission('tasks.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assignee_id,
      priority,
      status,
      due_date,
      estimated_hours,
      tags
    } = req.body;

    // Verificar se tarefa existe
    const existing = await db.query(
      'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }

    const result = await db.query(`
      UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        assignee_id = COALESCE($3, assignee_id),
        priority = COALESCE($4, priority),
        status = COALESCE($5, status),
        due_date = COALESCE($6, due_date),
        estimated_hours = COALESCE($7, estimated_hours),
        tags = COALESCE($8, tags),
        updated_at = NOW()
      WHERE id = $9 AND tenant_id = $10
      RETURNING *
    `, [
      title,
      description,
      assignee_id,
      priority,
      status,
      due_date,
      estimated_hours,
      tags ? JSON.stringify(tags) : null,
      id,
      req.user.tenant_id
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Tarefa atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETAR TAREFA
 */
router.delete('/:id', requireAuth, requirePermission('tasks.delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Tarefa deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * ADICIONAR COMENTÁRIO
 */
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Conteúdo do comentário é obrigatório'
      });
    }

    // Verificar se tarefa existe
    const task = await db.query(
      'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }

    const result = await db.query(`
      INSERT INTO task_comments (
        task_id,
        author_id,
        content
      ) VALUES ($1, $2, $3)
      RETURNING *
    `, [id, req.user.id, content]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Comentário adicionado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * REGISTRAR TEMPO TRABALHADO
 */
router.post('/:id/time', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { hours, description, date = new Date() } = req.body;

    if (!hours || hours <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Horas trabalhadas devem ser maior que zero'
      });
    }

    // Verificar se tarefa existe
    const task = await db.query(
      'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }

    const result = await db.query(`
      INSERT INTO task_time_logs (
        task_id,
        user_id,
        hours,
        description,
        date
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, req.user.id, hours, description, date]);

    // Atualizar total de horas trabalhadas na tarefa
    await db.query(`
      UPDATE tasks SET
        actual_hours = (
          SELECT COALESCE(SUM(hours), 0) 
          FROM task_time_logs 
          WHERE task_id = $1
        ),
        updated_at = NOW()
      WHERE id = $1
    `, [id]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Tempo registrado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao registrar tempo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GERENCIAR SUBTAREFAS
 */
router.post('/:id/subtasks', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed = false } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Título da subtarefa é obrigatório'
      });
    }

    const result = await db.query(`
      INSERT INTO task_subtasks (
        task_id,
        title,
        completed
      ) VALUES ($1, $2, $3)
      RETURNING *
    `, [id, title, completed]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Subtarefa criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar subtarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * ATUALIZAR SUBTAREFA
 */
router.put('/:id/subtasks/:subtaskId', requireAuth, async (req, res) => {
  try {
    const { id, subtaskId } = req.params;
    const { title, completed } = req.body;

    const result = await db.query(`
      UPDATE task_subtasks SET
        title = COALESCE($1, title),
        completed = COALESCE($2, completed),
        updated_at = NOW()
      WHERE id = $3 AND task_id = $4
      RETURNING *
    `, [title, completed, subtaskId, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subtarefa não encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Subtarefa atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar subtarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * ESTATÍSTICAS DE TAREFAS
 */
router.get('/stats/overview', requireAuth, async (req, res) => {
  try {
    const { project_id, period = '30d' } = req.query;

    let dateFilter = '';
    if (period === '7d') {
      dateFilter = "AND t.created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === '30d') {
      dateFilter = "AND t.created_at >= NOW() - INTERVAL '30 days'";
    } else if (period === '90d') {
      dateFilter = "AND t.created_at >= NOW() - INTERVAL '90 days'";
    }

    let projectFilter = '';
    const params = [req.user.tenant_id];
    if (project_id) {
      projectFilter = 'AND t.project_id = $2';
      params.push(project_id);
    }

    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN t.status = 'todo' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN t.status = 'in_review' THEN 1 END) as in_review_tasks,
        COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.priority = 'high' THEN 1 END) as high_priority_tasks,
        COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'done' THEN 1 END) as overdue_tasks,
        AVG(CASE WHEN t.status = 'done' AND t.estimated_hours > 0 THEN t.actual_hours / t.estimated_hours END) as avg_completion_ratio
      FROM tasks t
      WHERE t.tenant_id = $1 ${projectFilter} ${dateFilter}
    `, params);

    const stats = statsResult.rows[0];

    // Calcular produtividade
    const productivity = stats.total_tasks > 0 
      ? Math.round((parseInt(stats.completed_tasks) / parseInt(stats.total_tasks)) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        ...stats,
        productivity,
        period
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
