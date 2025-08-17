/**
 * ROTAS DE USUÁRIOS COMPLETAS
 * CRUD completo para gestão de usuários
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authSystem, requireAuth, requireRole, requirePermission } = require('../auth-system');
const { db } = require('../database-config');

const router = express.Router();

/**
 * GET /api/users
 * Listar usuários com filtros e paginação
 */
router.get('/', requireAuth(authSystem), requireRole(['super_admin', 'tenant_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status, tenant_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE u.deleted_at IS NULL';
    let params = [];
    let paramIndex = 1;

    // Filtro por tenant (se não for super_admin)
    if (req.user.role !== 'super_admin') {
      whereClause += ` AND u.tenant_id = $${paramIndex}`;
      params.push(req.user.tenant_id);
      paramIndex++;
    } else if (tenant_id) {
      whereClause += ` AND u.tenant_id = $${paramIndex}`;
      params.push(tenant_id);
      paramIndex++;
    }

    // Filtro de busca
    if (search) {
      whereClause += ` AND (u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.cpf ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro por role
    if (role) {
      whereClause += ` AND u.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    // Filtro por status
    if (status) {
      whereClause += ` AND u.is_active = $${paramIndex}`;
      params.push(status === 'active');
      paramIndex++;
    }

    // Query principal
    const query = `
      SELECT 
        u.id, u.uuid, u.first_name, u.last_name, u.email, u.cpf,
        u.role, u.is_active, u.last_login, u.login_count,
        u.created_at, u.updated_at,
        t.name as tenant_name, t.slug as tenant_slug
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    // Query de contagem
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      ${whereClause}
    `;

    const [usersResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2)) // Remove limit e offset
    ]);

    const users = usersResult.rows.map(user => ({
      ...user,
      fullName: `${user.first_name} ${user.last_name}`.trim()
    }));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/users/:id
 * Obter usuário específico
 */
router.get('/:id', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissões
    const canView = req.user.id === parseInt(id) || 
                   ['super_admin', 'tenant_admin'].includes(req.user.role);
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const query = `
      SELECT 
        u.id, u.uuid, u.first_name, u.last_name, u.email, u.cpf,
        u.phone, u.avatar_url, u.role, u.permissions, u.preferences,
        u.is_active, u.last_login, u.login_count, u.email_verified,
        u.created_at, u.updated_at,
        t.name as tenant_name, t.slug as tenant_slug
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];
    
    // Remover dados sensíveis se não for o próprio usuário ou admin
    if (req.user.id !== parseInt(id) && !['super_admin', 'tenant_admin'].includes(req.user.role)) {
      delete user.cpf;
      delete user.phone;
      delete user.permissions;
      delete user.preferences;
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          fullName: `${user.first_name} ${user.last_name}`.trim()
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/users
 * Criar novo usuário
 */
router.post('/', requireAuth(authSystem), requireRole(['super_admin', 'tenant_admin']), [
  body('first_name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('last_name').trim().isLength({ min: 2, max: 100 }).withMessage('Sobrenome deve ter entre 2 e 100 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('cpf').matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('CPF inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role').isIn(['super_admin', 'tenant_admin', 'manager', 'user']).withMessage('Role inválido')
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
      first_name, last_name, email, cpf, phone, password, 
      role, tenant_id, permissions = [], preferences = {} 
    } = req.body;

    // Limpar CPF
    const cleanCPF = cpf.replace(/\D/g, '');

    // Verificar se email já existe
    const existingEmail = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email já está em uso'
      });
    }

    // Verificar se CPF já existe
    const existingCPF = await db.query('SELECT id FROM users WHERE cpf = $1', [cleanCPF]);
    if (existingCPF.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'CPF já está em uso'
      });
    }

    // Determinar tenant_id
    let finalTenantId = tenant_id;
    if (req.user.role !== 'super_admin') {
      finalTenantId = req.user.tenant_id; // Forçar tenant do usuário atual
    }

    // Hash da senha
    const password_hash = await authSystem.hashPassword(password);

    // Criar usuário
    const query = `
      INSERT INTO users (
        tenant_id, first_name, last_name, email, cpf, phone,
        password_hash, role, permissions, preferences, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, uuid, first_name, last_name, email, role, created_at
    `;

    const values = [
      finalTenantId, first_name, last_name, email, cleanCPF, phone,
      password_hash, role, JSON.stringify(permissions), JSON.stringify(preferences), true
    ];

    const result = await db.query(query, values);
    const newUser = result.rows[0];

    console.log(`✅ Usuário criado: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          ...newUser,
          fullName: `${newUser.first_name} ${newUser.last_name}`.trim()
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/users/:id
 * Atualizar usuário
 */
router.put('/:id', requireAuth(authSystem), [
  body('first_name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('last_name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Sobrenome deve ter entre 2 e 100 caracteres'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('phone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  body('role').optional().isIn(['super_admin', 'tenant_admin', 'manager', 'user']).withMessage('Role inválido')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissões
    const canEdit = req.user.id === parseInt(id) || 
                   ['super_admin', 'tenant_admin'].includes(req.user.role);
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    // Buscar usuário atual
    const currentUser = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (currentUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const { 
      first_name, last_name, email, phone, role, 
      permissions, preferences, is_active 
    } = req.body;

    // Construir query de atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      values.push(first_name);
      paramIndex++;
    }

    if (last_name !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      values.push(last_name);
      paramIndex++;
    }

    if (email !== undefined) {
      // Verificar se email já existe
      const existingEmail = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email já está em uso'
        });
      }
      
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(phone);
      paramIndex++;
    }

    // Apenas admins podem alterar role e status
    if (['super_admin', 'tenant_admin'].includes(req.user.role)) {
      if (role !== undefined) {
        updates.push(`role = $${paramIndex}`);
        values.push(role);
        paramIndex++;
      }

      if (is_active !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        values.push(is_active);
        paramIndex++;
      }

      if (permissions !== undefined) {
        updates.push(`permissions = $${paramIndex}`);
        values.push(JSON.stringify(permissions));
        paramIndex++;
      }
    }

    if (preferences !== undefined) {
      updates.push(`preferences = $${paramIndex}`);
      values.push(JSON.stringify(preferences));
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo para atualizar'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, uuid, first_name, last_name, email, role, updated_at
    `;

    const result = await db.query(query, values);
    const updatedUser = result.rows[0];

    console.log(`✅ Usuário atualizado: ${updatedUser.email}`);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: {
        user: {
          ...updatedUser,
          fullName: `${updatedUser.first_name} ${updatedUser.last_name}`.trim()
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/users/:id
 * Deletar usuário (soft delete)
 */
router.delete('/:id', requireAuth(authSystem), requireRole(['super_admin', 'tenant_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir deletar a si mesmo
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar sua própria conta'
      });
    }

    // Verificar se usuário existe
    const user = await db.query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Soft delete
    await db.query(`
      UPDATE users 
      SET deleted_at = CURRENT_TIMESTAMP, is_active = false
      WHERE id = $1
    `, [id]);

    // Invalidar todas as sessões do usuário
    await db.query('DELETE FROM sessions WHERE user_id = $1', [id]);

    console.log(`🗑️ Usuário deletado: ${user.rows[0].email}`);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
