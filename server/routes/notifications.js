const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const DatabaseService = require('../services/DatabaseService');

const db = new DatabaseService();

/**
 * GET /api/notifications
 * Listar notificações do usuário
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread = false, type } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = ?';
    let params = [req.user.id];

    if (unread === 'true') {
      whereClause += ' AND is_read = 0';
    }

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    // Buscar notificações
    const notifications = await db.query(`
      SELECT 
        id, title, message, type, data, is_read, 
        created_at, read_at
      FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Contar total
    const totalResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM notifications 
      ${whereClause}
    `, params);

    const total = totalResult[0].total;

    // Contar não lidas
    const unreadResult = await db.query(`
      SELECT COUNT(*) as unread 
      FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `, [req.user.id]);

    const unreadCount = unreadResult[0].unread;

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('❌ Erro ao listar notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar notificações'
    });
  }
});

/**
 * POST /api/notifications
 * Criar nova notificação (apenas admins)
 */
router.post('/', authenticateToken, requirePermission('notifications.create'), [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Mensagem deve ter entre 1 e 1000 caracteres'),
  body('type').isIn(['info', 'warning', 'error', 'success']).withMessage('Tipo inválido'),
  body('userIds').optional().isArray().withMessage('IDs de usuários devem ser um array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { title, message, type, data, userIds } = req.body;

    // Se userIds não especificado, enviar para todos os usuários
    let targetUsers = userIds;
    if (!targetUsers) {
      const users = await db.query('SELECT id FROM users WHERE is_active = 1');
      targetUsers = users.map(u => u.id);
    }

    // Criar notificações para cada usuário
    const notifications = [];
    for (const userId of targetUsers) {
      const result = await db.query(`
        INSERT INTO notifications (
          user_id, title, message, type, data, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        userId,
        title,
        message,
        type,
        JSON.stringify(data || {}),
        req.user.id
      ]);

      notifications.push({
        id: result.insertId,
        userId,
        title,
        message,
        type
      });
    }

    res.json({
      success: true,
      data: {
        created: notifications.length,
        notifications
      },
      message: `${notifications.length} notificações criadas`
    });

  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar notificação'
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Marcar notificação como lida
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se notificação existe e pertence ao usuário
    const notifications = await db.query(`
      SELECT id FROM notifications 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    // Marcar como lida
    await db.query(`
      UPDATE notifications 
      SET is_read = 1, read_at = NOW() 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    res.json({
      success: true,
      message: 'Notificação marcada como lida'
    });

  } catch (error) {
    console.error('❌ Erro ao marcar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao marcar notificação como lida'
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Marcar todas as notificações como lidas
 */
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE notifications 
      SET is_read = 1, read_at = NOW() 
      WHERE user_id = ? AND is_read = 0
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        markedAsRead: result.affectedRows || result.changes || 0
      },
      message: 'Todas as notificações foram marcadas como lidas'
    });

  } catch (error) {
    console.error('❌ Erro ao marcar todas notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao marcar todas as notificações como lidas'
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Deletar notificação
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se notificação existe e pertence ao usuário
    const notifications = await db.query(`
      SELECT id FROM notifications 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    // Deletar notificação
    await db.query(`
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    res.json({
      success: true,
      message: 'Notificação deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar notificação'
    });
  }
});

/**
 * GET /api/notifications/stats
 * Estatísticas de notificações
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Estatísticas do usuário
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = 0 THEN 1 END) as unread,
        COUNT(CASE WHEN is_read = 1 THEN 1 END) as read,
        COUNT(CASE WHEN type = 'info' THEN 1 END) as info,
        COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning,
        COUNT(CASE WHEN type = 'error' THEN 1 END) as error,
        COUNT(CASE WHEN type = 'success' THEN 1 END) as success
      FROM notifications 
      WHERE user_id = ?
    `, [req.user.id]);

    // Notificações recentes (últimas 24h)
    const recentStats = await db.query(`
      SELECT COUNT(*) as recent
      FROM notifications 
      WHERE user_id = ? AND created_at >= datetime('now', '-1 day')
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        ...stats[0],
        recent: recentStats[0].recent
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas de notificações'
    });
  }
});

module.exports = router;
