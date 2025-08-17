const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const DatabaseService = require('../services/DatabaseService');
const { authenticateToken } = require('../middleware/auth');
const { 
  requirePermission, 
  PERMISSIONS, 
  DEFAULT_ROLES,
  getUserPermissions,
  checkUserPermission
} = require('../middleware/permissions');

const db = new DatabaseService();

/**
 * GET /api/permissions
 * Listar todas as permissões disponíveis
 */
router.get('/', authenticateToken, requirePermission('users.manage_permissions'), async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        permissions: PERMISSIONS,
        roles: DEFAULT_ROLES
      }
    });
  } catch (error) {
    console.error('❌ Erro ao listar permissões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter permissões'
    });
  }
});

/**
 * GET /api/permissions/user/:userId
 * Obter permissões de um usuário específico
 */
router.get('/user/:userId', authenticateToken, requirePermission('users.view'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se pode acessar este usuário
    if (req.user.id !== parseInt(userId) && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    // Buscar usuário
    const users = await db.query(`
      SELECT id, name, email, role, tenant_id FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Obter permissões do usuário
    const permissions = await getUserPermissions(userId, user.tenant_id);

    // Buscar permissões customizadas
    const customPermissions = await db.query(`
      SELECT permission, granted_by, created_at 
      FROM user_permissions 
      WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)
    `, [userId, user.tenant_id]);

    // Permissões do role
    const rolePermissions = DEFAULT_ROLES[user.role]?.permissions || [];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        permissions: {
          all: permissions,
          fromRole: rolePermissions,
          custom: customPermissions
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter permissões do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter permissões do usuário'
    });
  }
});

/**
 * POST /api/permissions/user/:userId
 * Adicionar permissão customizada a um usuário
 */
router.post('/user/:userId', authenticateToken, requirePermission('users.manage_permissions'), [
  body('permission').notEmpty().withMessage('Permissão é obrigatória'),
  body('permission').isIn(Object.keys(PERMISSIONS)).withMessage('Permissão inválida')
], async (req, res) => {
  try {
    const { userId } = req.params;
    const { permission } = req.body;

    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    // Buscar usuário
    const users = await db.query(`
      SELECT id, name, email, role, tenant_id FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Verificar se usuário já tem a permissão
    const hasPermission = await checkUserPermission(userId, permission, user.tenant_id);
    if (hasPermission) {
      return res.status(409).json({
        success: false,
        error: 'Usuário já possui esta permissão'
      });
    }

    // Verificar se permissão customizada já existe
    const existingPermissions = await db.query(`
      SELECT id FROM user_permissions 
      WHERE user_id = ? AND permission = ? AND (tenant_id = ? OR tenant_id IS NULL)
    `, [userId, permission, user.tenant_id]);

    if (existingPermissions.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Permissão customizada já existe'
      });
    }

    // Adicionar permissão
    await db.query(`
      INSERT INTO user_permissions (user_id, permission, tenant_id, granted_by, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [userId, permission, user.tenant_id, req.user.id]);

    // Log de auditoria
    await db.query(`
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'permission_granted', ?, ?, NOW())
    `, [req.user.id, JSON.stringify({
      targetUserId: parseInt(userId),
      targetUserEmail: user.email,
      permission,
      grantedBy: req.user.email
    }), req.ip]);

    console.log(`✅ Permissão ${permission} concedida ao usuário ${user.email} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Permissão concedida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao conceder permissão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao conceder permissão'
    });
  }
});

/**
 * DELETE /api/permissions/user/:userId/:permission
 * Remover permissão customizada de um usuário
 */
router.delete('/user/:userId/:permission', authenticateToken, requirePermission('users.manage_permissions'), async (req, res) => {
  try {
    const { userId, permission } = req.params;

    // Verificar se permissão é válida
    if (!PERMISSIONS[permission]) {
      return res.status(400).json({
        success: false,
        error: 'Permissão inválida'
      });
    }

    // Buscar usuário
    const users = await db.query(`
      SELECT id, name, email, role, tenant_id FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Verificar se permissão customizada existe
    const existingPermissions = await db.query(`
      SELECT id FROM user_permissions 
      WHERE user_id = ? AND permission = ? AND (tenant_id = ? OR tenant_id IS NULL)
    `, [userId, permission, user.tenant_id]);

    if (existingPermissions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Permissão customizada não encontrada'
      });
    }

    // Remover permissão
    await db.query(`
      DELETE FROM user_permissions 
      WHERE user_id = ? AND permission = ? AND (tenant_id = ? OR tenant_id IS NULL)
    `, [userId, permission, user.tenant_id]);

    // Log de auditoria
    await db.query(`
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'permission_revoked', ?, ?, NOW())
    `, [req.user.id, JSON.stringify({
      targetUserId: parseInt(userId),
      targetUserEmail: user.email,
      permission,
      revokedBy: req.user.email
    }), req.ip]);

    console.log(`✅ Permissão ${permission} removida do usuário ${user.email} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Permissão removida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover permissão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover permissão'
    });
  }
});

/**
 * PUT /api/permissions/user/:userId/role
 * Alterar role de um usuário
 */
router.put('/user/:userId/role', authenticateToken, requirePermission('users.manage_roles'), [
  body('role').isIn(Object.keys(DEFAULT_ROLES)).withMessage('Role inválido')
], async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    // Não permitir alterar próprio role
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível alterar seu próprio role'
      });
    }

    // Buscar usuário
    const users = await db.query(`
      SELECT id, name, email, role, tenant_id FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Verificar se pode alterar para este role
    if (role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Apenas super_admin pode conceder role super_admin'
      });
    }

    // Atualizar role
    await db.query(`
      UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?
    `, [role, userId]);

    // Log de auditoria
    await db.query(`
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'role_changed', ?, ?, NOW())
    `, [req.user.id, JSON.stringify({
      targetUserId: parseInt(userId),
      targetUserEmail: user.email,
      oldRole: user.role,
      newRole: role,
      changedBy: req.user.email
    }), req.ip]);

    console.log(`✅ Role do usuário ${user.email} alterado de ${user.role} para ${role} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Role alterado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao alterar role:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao alterar role'
    });
  }
});

/**
 * POST /api/permissions/check
 * Verificar se usuário tem uma permissão específica
 */
router.post('/check', authenticateToken, [
  body('permission').notEmpty().withMessage('Permissão é obrigatória'),
  body('userId').optional().isInt().withMessage('ID do usuário deve ser um número')
], async (req, res) => {
  try {
    const { permission, userId } = req.body;

    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const targetUserId = userId || req.user.id;
    const targetTenantId = userId ? null : req.user.tenantId; // Se não especificou userId, usar tenant do usuário atual

    // Se está verificando outro usuário, precisa de permissão
    if (userId && userId !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    // Verificar permissão
    const hasPermission = await checkUserPermission(targetUserId, permission, targetTenantId);

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        permission,
        hasPermission
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar permissão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar permissão'
    });
  }
});

/**
 * GET /api/permissions/audit
 * Auditoria de permissões (apenas super_admin)
 */
router.get('/audit', authenticateToken, requirePermission('system.admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE action IN ('permission_granted', 'permission_revoked', 'role_changed')";
    let params = [];

    if (userId) {
      whereClause += ' AND (user_id = ? OR JSON_EXTRACT(details, "$.targetUserId") = ?)';
      params.push(userId, userId);
    }

    if (action) {
      whereClause += ' AND action = ?';
      params.push(action);
    }

    const auditLogs = await db.query(`
      SELECT 
        sl.*,
        u.name as user_name,
        u.email as user_email
      FROM system_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      ${whereClause}
      ORDER BY sl.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Contar total
    const totalResult = await db.query(`
      SELECT COUNT(*) as total FROM system_logs ${whereClause}
    `, params);

    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        auditLogs: auditLogs.map(log => ({
          ...log,
          details: log.details ? JSON.parse(log.details) : {}
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter auditoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter auditoria'
    });
  }
});

module.exports = router;
