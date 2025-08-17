/**
 * ROTAS DE WORKSPACES COMPLETAS
 * CRUD completo para gestão de espaços de trabalho
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authSystem, requireAuth, requireRole } = require('../auth-system');
const { db } = require('../database-config');

const router = express.Router();

/**
 * GET /api/workspaces
 * Listar workspaces do tenant
 */
router.get('/', requireAuth(authSystem), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, is_public } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE w.tenant_id = $1 AND w.deleted_at IS NULL';
    let params = [req.user.tenant_id];
    let paramIndex = 2;

    // Filtro de busca
    if (search) {
      whereClause += ` AND (w.name ILIKE $${paramIndex} OR w.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro por visibilidade
    if (is_public !== undefined) {
      whereClause += ` AND w.is_public = $${paramIndex}`;
      params.push(is_public === 'true');
      paramIndex++;
    }

    // Se não for admin, mostrar apenas workspaces públicos ou onde é membro
    if (!['super_admin', 'tenant_admin'].includes(req.user.role)) {
      whereClause += ` AND (w.is_public = true OR w.owner_id = $${paramIndex} OR EXISTS (
        SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = w.id AND wm.user_id = $${paramIndex}
      ))`;
      params.push(req.user.id);
      paramIndex++;
    }

    const query = `
      SELECT 
        w.id, w.uuid, w.name, w.slug, w.description, w.color, w.icon,
        w.is_default, w.is_public, w.is_active, w.created_at, w.updated_at,
        u.first_name || ' ' || u.last_name as owner_name,
        (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) as member_count,
        (SELECT COUNT(*) FROM teams WHERE workspace_id = w.id AND is_active = true) as team_count
      FROM workspaces w
      LEFT JOIN users u ON w.owner_id = u.id
      ${whereClause}
      ORDER BY w.is_default DESC, w.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        workspaces: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.rows.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar workspaces:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/workspaces/:id
 * Obter workspace específico
 */
router.get('/:id', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        w.*,
        u.first_name || ' ' || u.last_name as owner_name,
        u.email as owner_email,
        (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) as member_count,
        (SELECT COUNT(*) FROM teams WHERE workspace_id = w.id AND is_active = true) as team_count
      FROM workspaces w
      LEFT JOIN users u ON w.owner_id = u.id
      WHERE w.id = $1 AND w.tenant_id = $2 AND w.deleted_at IS NULL
    `;

    const result = await db.query(query, [id, req.user.tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workspace não encontrado'
      });
    }

    const workspace = result.rows[0];

    // Verificar permissões
    const canView = workspace.is_public || 
                   workspace.owner_id === req.user.id ||
                   ['super_admin', 'tenant_admin'].includes(req.user.role);

    if (!canView) {
      // Verificar se é membro
      const memberCheck = await db.query(
        'SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
      }
    }

    res.json({
      success: true,
      data: { workspace }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar workspace:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/workspaces
 * Criar novo workspace
 */
router.post('/', requireAuth(authSystem), [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('slug').trim().matches(/^[a-z0-9-]+$/).withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Descrição muito longa'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Cor deve estar no formato hexadecimal')
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
      name, slug, description, color = '#3B82F6', icon = 'folder',
      settings = {}, is_public = false
    } = req.body;

    // Verificar se slug já existe no tenant
    const existingSlug = await db.query(
      'SELECT id FROM workspaces WHERE slug = $1 AND tenant_id = $2',
      [slug, req.user.tenant_id]
    );
    
    if (existingSlug.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Slug já está em uso neste tenant'
      });
    }

    // Verificar limite de workspaces
    const tenantQuery = await db.query('SELECT max_workspaces FROM tenants WHERE id = $1', [req.user.tenant_id]);
    const maxWorkspaces = tenantQuery.rows[0]?.max_workspaces || 5;

    const currentCount = await db.query(
      'SELECT COUNT(*) as count FROM workspaces WHERE tenant_id = $1 AND is_active = true',
      [req.user.tenant_id]
    );

    if (parseInt(currentCount.rows[0].count) >= maxWorkspaces) {
      return res.status(400).json({
        success: false,
        error: `Limite de ${maxWorkspaces} workspaces atingido`
      });
    }

    // Criar workspace
    const query = `
      INSERT INTO workspaces (
        tenant_id, owner_id, name, slug, description, color, icon,
        settings, is_public, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, uuid, name, slug, created_at
    `;

    const values = [
      req.user.tenant_id, req.user.id, name, slug, description, color, icon,
      JSON.stringify(settings), is_public, true
    ];

    const result = await db.query(query, values);
    const newWorkspace = result.rows[0];

    // Adicionar owner como membro
    await db.query(`
      INSERT INTO workspace_members (workspace_id, user_id, role, permissions)
      VALUES ($1, $2, $3, $4)
    `, [
      newWorkspace.id, 
      req.user.id, 
      'owner',
      JSON.stringify(['workspaces.read', 'workspaces.update', 'workspaces.delete', 'teams.create', 'teams.read', 'teams.update', 'teams.delete'])
    ]);

    console.log(`✅ Workspace criado: ${name} (${slug})`);

    res.status(201).json({
      success: true,
      message: 'Workspace criado com sucesso',
      data: { workspace: newWorkspace }
    });

  } catch (error) {
    console.error('❌ Erro ao criar workspace:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/workspaces/:id
 * Atualizar workspace
 */
router.put('/:id', requireAuth(authSystem), [
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Descrição muito longa'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Cor deve estar no formato hexadecimal')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se workspace existe e pertence ao tenant
    const workspace = await db.query(
      'SELECT * FROM workspaces WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (workspace.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workspace não encontrado'
      });
    }

    // Verificar permissões
    const canEdit = workspace.rows[0].owner_id === req.user.id ||
                   ['super_admin', 'tenant_admin'].includes(req.user.role);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const { name, description, color, icon, settings, is_public } = req.body;

    // Construir query de atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (color !== undefined) {
      updates.push(`color = $${paramIndex}`);
      values.push(color);
      paramIndex++;
    }

    if (icon !== undefined) {
      updates.push(`icon = $${paramIndex}`);
      values.push(icon);
      paramIndex++;
    }

    if (settings !== undefined) {
      updates.push(`settings = $${paramIndex}`);
      values.push(JSON.stringify(settings));
      paramIndex++;
    }

    if (is_public !== undefined) {
      updates.push(`is_public = $${paramIndex}`);
      values.push(is_public);
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
      UPDATE workspaces 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, uuid, name, slug, updated_at
    `;

    const result = await db.query(query, values);

    res.json({
      success: true,
      message: 'Workspace atualizado com sucesso',
      data: { workspace: result.rows[0] }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar workspace:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/workspaces/:id
 * Deletar workspace
 */
router.delete('/:id', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se workspace existe
    const workspace = await db.query(
      'SELECT * FROM workspaces WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (workspace.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workspace não encontrado'
      });
    }

    // Não permitir deletar workspace padrão
    if (workspace.rows[0].is_default) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar o workspace padrão'
      });
    }

    // Verificar permissões
    const canDelete = workspace.rows[0].owner_id === req.user.id ||
                     ['super_admin', 'tenant_admin'].includes(req.user.role);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    // Soft delete
    await db.query(`
      UPDATE workspaces 
      SET deleted_at = CURRENT_TIMESTAMP, is_active = false
      WHERE id = $1
    `, [id]);

    // Desativar teams relacionadas
    await db.query(`
      UPDATE teams 
      SET deleted_at = CURRENT_TIMESTAMP, is_active = false
      WHERE workspace_id = $1
    `, [id]);

    console.log(`🗑️ Workspace deletado: ${workspace.rows[0].name}`);

    res.json({
      success: true,
      message: 'Workspace deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar workspace:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/workspaces/:id/members
 * Listar membros do workspace
 */
router.get('/:id/members', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar acesso ao workspace
    const workspace = await db.query(
      'SELECT * FROM workspaces WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (workspace.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workspace não encontrado'
      });
    }

    const query = `
      SELECT 
        wm.id, wm.role, wm.permissions, wm.joined_at,
        u.id as user_id, u.uuid as user_uuid,
        u.first_name, u.last_name, u.email, u.avatar_url,
        u.first_name || ' ' || u.last_name as full_name
      FROM workspace_members wm
      JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = $1 AND u.is_active = true
      ORDER BY wm.joined_at ASC
    `;

    const result = await db.query(query, [id]);

    res.json({
      success: true,
      data: { members: result.rows }
    });

  } catch (error) {
    console.error('❌ Erro ao listar membros:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/workspaces/:id/members
 * Adicionar membro ao workspace
 */
router.post('/:id/members', requireAuth(authSystem), [
  body('user_id').isInt().withMessage('ID do usuário é obrigatório'),
  body('role').optional().isIn(['owner', 'admin', 'member']).withMessage('Role inválido')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role = 'member', permissions = [] } = req.body;

    // Verificar se workspace existe e se tem permissão
    const workspace = await db.query(
      'SELECT * FROM workspaces WHERE id = $1 AND tenant_id = $2',
      [id, req.user.tenant_id]
    );

    if (workspace.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workspace não encontrado'
      });
    }

    // Verificar permissões
    const canAddMembers = workspace.rows[0].owner_id === req.user.id ||
                         ['super_admin', 'tenant_admin'].includes(req.user.role);

    if (!canAddMembers) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    // Verificar se usuário existe no mesmo tenant
    const user = await db.query(
      'SELECT id FROM users WHERE id = $1 AND tenant_id = $2 AND is_active = true',
      [user_id, req.user.tenant_id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se já é membro
    const existingMember = await db.query(
      'SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Usuário já é membro deste workspace'
      });
    }

    // Adicionar membro
    await db.query(`
      INSERT INTO workspace_members (workspace_id, user_id, role, permissions)
      VALUES ($1, $2, $3, $4)
    `, [id, user_id, role, JSON.stringify(permissions)]);

    res.status(201).json({
      success: true,
      message: 'Membro adicionado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar membro:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
