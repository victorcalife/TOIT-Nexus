/**
 * ROTAS DE NOTIFICAÇÕES COMPLETAS
 * Sistema de notificações em tempo real
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authSystem, requireAuth, requireRole } = require('../auth-system');
const { db } = require('../database-config');

const router = express.Router();

/**
 * GET /api/notifications
 * Listar notificações do usuário
 */
router.get('/', requireAuth(authSystem), async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only = false, type } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = $1';
    let params = [req.user.id];
    let paramIndex = 2;

    // Filtro apenas não lidas
    if (unread_only === 'true') {
      whereClause += ` AND read_at IS NULL`;
    }

    // Filtro por tipo
    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    const query = `
      SELECT 
        id, uuid, type, title, message, data, priority,
        read_at, created_at, expires_at,
        CASE WHEN read_at IS NULL THEN true ELSE false END as is_unread,
        CASE WHEN expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP THEN true ELSE false END as is_expired
      FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);

    // Contar não lidas
    const unreadQuery = `
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND read_at IS NULL
    `;

    const unreadResult = await db.query(unreadQuery, [req.user.id]);
    const unreadCount = parseInt(unreadResult.rows[0].unread_count);

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        unread_count: unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.rows.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar notificações:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Contar notificações não lidas
 */
router.get('/unread-count', requireAuth(authSystem), async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND read_at IS NULL
    `;

    const result = await db.query(query, [req.user.id]);
    const count = parseInt(result.rows[0].count);

    res.json({
      success: true,
      data: { unread_count: count }
    });

  } catch (error) {
    console.error('❌ Erro ao contar notificações:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/notifications
 * Criar nova notificação (apenas admins)
 */
router.post('/', requireAuth(authSystem), requireRole(['super_admin', 'tenant_admin']), [
  body('user_id').optional().isInt().withMessage('ID do usuário deve ser um número'),
  body('type').isIn(['info', 'success', 'warning', 'error', 'system']).withMessage('Tipo inválido'),
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Título é obrigatório'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Mensagem é obrigatória'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Prioridade inválida')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const {
      user_id, type, title, message, data = {},
      priority = 'normal', expires_at
    } = req.body;

    // Se user_id não fornecido, usar o usuário atual
    const targetUserId = user_id || req.user.id;

    // Verificar se usuário existe no mesmo tenant
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1 AND tenant_id = $2 AND is_active = true',
      [targetUserId, req.user.tenant_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Criar notificação
    const query = `
      INSERT INTO notifications (
        user_id, type, title, message, data, priority, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, uuid, type, title, created_at
    `;

    const values = [
      targetUserId, type, title, message,
      JSON.stringify(data), priority, expires_at
    ];

    const result = await db.query(query, values);
    const notification = result.rows[0];

    console.log(`🔔 Notificação criada: ${title} para usuário ${targetUserId}`);

    res.status(201).json({
      success: true,
      message: 'Notificação criada com sucesso',
      data: { notification }
    });

  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Marcar notificação como lida
 */
router.put('/:id/read', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se notificação pertence ao usuário
    const notification = await db.query(
      'SELECT id, read_at FROM notifications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (notification.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    // Se já foi lida, não fazer nada
    if (notification.rows[0].read_at) {
      return res.json({
        success: true,
        message: 'Notificação já estava marcada como lida'
      });
    }

    // Marcar como lida
    await db.query(
      'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Notificação marcada como lida'
    });

  } catch (error) {
    console.error('❌ Erro ao marcar notificação:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Marcar todas as notificações como lidas
 */
router.put('/read-all', requireAuth(authSystem), async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE notifications 
      SET read_at = CURRENT_TIMESTAMP 
      WHERE user_id = $1 AND read_at IS NULL
    `, [req.user.id]);

    const updatedCount = result.rowCount;

    res.json({
      success: true,
      message: `${updatedCount} notificação(ões) marcada(s) como lida(s)`,
      data: { updated_count: updatedCount }
    });

  } catch (error) {
    console.error('❌ Erro ao marcar todas as notificações:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Deletar notificação
 */
router.delete('/:id', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se notificação pertence ao usuário
    const notification = await db.query(
      'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (notification.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    // Deletar notificação
    await db.query('DELETE FROM notifications WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Notificação deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar notificação:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/notifications/clear-read
 * Limpar notificações lidas
 */
router.delete('/clear-read', requireAuth(authSystem), async (req, res) => {
  try {
    const result = await db.query(`
      DELETE FROM notifications 
      WHERE user_id = $1 AND read_at IS NOT NULL
    `, [req.user.id]);

    const deletedCount = result.rowCount;

    res.json({
      success: true,
      message: `${deletedCount} notificação(ões) lida(s) removida(s)`,
      data: { deleted_count: deletedCount }
    });

  } catch (error) {
    console.error('❌ Erro ao limpar notificações:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/notifications/broadcast
 * Enviar notificação para todos os usuários do tenant (apenas admins)
 */
router.post('/broadcast', requireAuth(authSystem), requireRole(['super_admin', 'tenant_admin']), [
  body('type').isIn(['info', 'success', 'warning', 'error', 'system']).withMessage('Tipo inválido'),
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Título é obrigatório'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Mensagem é obrigatória'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Prioridade inválida')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const {
      type, title, message, data = {},
      priority = 'normal', expires_at
    } = req.body;

    // Buscar todos os usuários ativos do tenant
    const usersQuery = `
      SELECT id FROM users 
      WHERE tenant_id = $1 AND is_active = true
    `;

    const usersResult = await db.query(usersQuery, [req.user.tenant_id]);
    const userIds = usersResult.rows.map(row => row.id);

    if (userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum usuário ativo encontrado no tenant'
      });
    }

    // Criar notificações para todos os usuários
    const notifications = [];
    for (const userId of userIds) {
      const query = `
        INSERT INTO notifications (
          user_id, type, title, message, data, priority, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, uuid
      `;

      const values = [
        userId, type, title, message,
        JSON.stringify(data), priority, expires_at
      ];

      const result = await db.query(query, values);
      notifications.push(result.rows[0]);
    }

    console.log(`📢 Broadcast: ${title} para ${notifications.length} usuários`);

    res.status(201).json({
      success: true,
      message: `Notificação enviada para ${notifications.length} usuário(s)`,
      data: {
        sent_count: notifications.length,
        notifications: notifications.slice(0, 5) // Mostrar apenas os primeiros 5
      }
    });

  } catch (error) {
    console.error('❌ Erro no broadcast:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/notifications/types
 * Listar tipos de notificação disponíveis
 */
router.get('/types', requireAuth(authSystem), async (req, res) => {
  try {
    const types = [
      { value: 'info', label: 'Informação', icon: 'info-circle', color: '#3B82F6' },
      { value: 'success', label: 'Sucesso', icon: 'check-circle', color: '#10B981' },
      { value: 'warning', label: 'Aviso', icon: 'exclamation-triangle', color: '#F59E0B' },
      { value: 'error', label: 'Erro', icon: 'x-circle', color: '#EF4444' },
      { value: 'system', label: 'Sistema', icon: 'cog', color: '#6B7280' }
    ];

    const priorities = [
      { value: 'low', label: 'Baixa', color: '#6B7280' },
      { value: 'normal', label: 'Normal', color: '#3B82F6' },
      { value: 'high', label: 'Alta', color: '#F59E0B' },
      { value: 'urgent', label: 'Urgente', color: '#EF4444' }
    ];

    res.json({
      success: true,
      data: { types, priorities }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar tipos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
