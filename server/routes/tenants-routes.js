/**
 * ROTAS DE TENANTS COMPLETAS
 * CRUD completo para gestão de organizações/empresas
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authSystem, requireAuth, requireRole } = require('../auth-system');
const { db } = require('../database-config');

const router = express.Router();

/**
 * GET /api/tenants
 * Listar tenants (apenas super_admin)
 */
router.get('/', requireAuth(authSystem), requireRole(['super_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, subscription_plan } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE deleted_at IS NULL';
    let params = [];
    let paramIndex = 1;

    // Filtro de busca
    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR slug ILIKE $${paramIndex} OR domain ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro por status
    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Filtro por plano
    if (subscription_plan) {
      whereClause += ` AND subscription_plan = $${paramIndex}`;
      params.push(subscription_plan);
      paramIndex++;
    }

    // Query principal
    const query = `
      SELECT 
        id, uuid, name, slug, domain, email, phone, website,
        max_users, max_workspaces, max_storage_gb,
        subscription_plan, status, is_verified,
        trial_ends_at, subscription_expires,
        created_at, updated_at,
        (SELECT COUNT(*) FROM users WHERE tenant_id = tenants.id AND is_active = true) as active_users
      FROM tenants
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    // Query de contagem
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tenants
      ${whereClause}
    `;

    const [tenantsResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        tenants: tenantsResult.rows,
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
    console.error('❌ Erro ao listar tenants:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/tenants/:id
 * Obter tenant específico
 */
router.get('/:id', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissões
    const canView = req.user.role === 'super_admin' || 
                   req.user.tenant_id === parseInt(id);
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const query = `
      SELECT 
        t.*,
        (SELECT COUNT(*) FROM users WHERE tenant_id = t.id AND is_active = true) as active_users,
        (SELECT COUNT(*) FROM workspaces WHERE tenant_id = t.id AND is_active = true) as active_workspaces
      FROM tenants t
      WHERE t.id = $1 AND t.deleted_at IS NULL
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant não encontrado'
      });
    }

    res.json({
      success: true,
      data: { tenant: result.rows[0] }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar tenant:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/tenants
 * Criar novo tenant
 */
router.post('/', requireAuth(authSystem), requireRole(['super_admin']), [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('slug').trim().matches(/^[a-z0-9-]+$/).withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('subscription_plan').optional().isIn(['free', 'standard', 'pro', 'enterprise']).withMessage('Plano inválido')
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
      name, slug, domain, email, phone, website, address,
      max_users = 10, max_workspaces = 5, max_storage_gb = 1,
      subscription_plan = 'free', settings = {}, features = {}, branding = {}
    } = req.body;

    // Verificar se slug já existe
    const existingSlug = await db.query('SELECT id FROM tenants WHERE slug = $1', [slug]);
    if (existingSlug.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Slug já está em uso'
      });
    }

    // Verificar se domain já existe (se fornecido)
    if (domain) {
      const existingDomain = await db.query('SELECT id FROM tenants WHERE domain = $1', [domain]);
      if (existingDomain.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Domínio já está em uso'
        });
      }
    }

    // Criar tenant
    const query = `
      INSERT INTO tenants (
        name, slug, domain, email, phone, website, address,
        max_users, max_workspaces, max_storage_gb,
        subscription_plan, settings, features, branding,
        status, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, uuid, name, slug, email, subscription_plan, created_at
    `;

    const values = [
      name, slug, domain, email, phone, website, address,
      max_users, max_workspaces, max_storage_gb,
      subscription_plan, JSON.stringify(settings), JSON.stringify(features), JSON.stringify(branding),
      'active', false
    ];

    const result = await db.query(query, values);
    const newTenant = result.rows[0];

    console.log(`✅ Tenant criado: ${name} (${slug})`);

    res.status(201).json({
      success: true,
      message: 'Tenant criado com sucesso',
      data: { tenant: newTenant }
    });

  } catch (error) {
    console.error('❌ Erro ao criar tenant:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/tenants/:id
 * Atualizar tenant
 */
router.put('/:id', requireAuth(authSystem), [
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('subscription_plan').optional().isIn(['free', 'standard', 'pro', 'enterprise']).withMessage('Plano inválido'),
  body('status').optional().isIn(['active', 'inactive', 'suspended', 'trial']).withMessage('Status inválido')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissões
    const canEdit = req.user.role === 'super_admin' || 
                   (req.user.role === 'tenant_admin' && req.user.tenant_id === parseInt(id));
    
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

    // Buscar tenant atual
    const currentTenant = await db.query('SELECT * FROM tenants WHERE id = $1', [id]);
    if (currentTenant.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant não encontrado'
      });
    }

    const {
      name, domain, email, phone, website, address,
      max_users, max_workspaces, max_storage_gb,
      subscription_plan, status, settings, features, branding
    } = req.body;

    // Construir query de atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (domain !== undefined) {
      // Verificar se domain já existe
      if (domain) {
        const existingDomain = await db.query('SELECT id FROM tenants WHERE domain = $1 AND id != $2', [domain, id]);
        if (existingDomain.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Domínio já está em uso'
          });
        }
      }
      
      updates.push(`domain = $${paramIndex}`);
      values.push(domain);
      paramIndex++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(phone);
      paramIndex++;
    }

    if (website !== undefined) {
      updates.push(`website = $${paramIndex}`);
      values.push(website);
      paramIndex++;
    }

    if (address !== undefined) {
      updates.push(`address = $${paramIndex}`);
      values.push(address);
      paramIndex++;
    }

    // Apenas super_admin pode alterar limites e planos
    if (req.user.role === 'super_admin') {
      if (max_users !== undefined) {
        updates.push(`max_users = $${paramIndex}`);
        values.push(max_users);
        paramIndex++;
      }

      if (max_workspaces !== undefined) {
        updates.push(`max_workspaces = $${paramIndex}`);
        values.push(max_workspaces);
        paramIndex++;
      }

      if (max_storage_gb !== undefined) {
        updates.push(`max_storage_gb = $${paramIndex}`);
        values.push(max_storage_gb);
        paramIndex++;
      }

      if (subscription_plan !== undefined) {
        updates.push(`subscription_plan = $${paramIndex}`);
        values.push(subscription_plan);
        paramIndex++;
      }

      if (status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }
    }

    if (settings !== undefined) {
      updates.push(`settings = $${paramIndex}`);
      values.push(JSON.stringify(settings));
      paramIndex++;
    }

    if (features !== undefined) {
      updates.push(`features = $${paramIndex}`);
      values.push(JSON.stringify(features));
      paramIndex++;
    }

    if (branding !== undefined) {
      updates.push(`branding = $${paramIndex}`);
      values.push(JSON.stringify(branding));
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
      UPDATE tenants 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, uuid, name, slug, email, subscription_plan, updated_at
    `;

    const result = await db.query(query, values);
    const updatedTenant = result.rows[0];

    console.log(`✅ Tenant atualizado: ${updatedTenant.name}`);

    res.json({
      success: true,
      message: 'Tenant atualizado com sucesso',
      data: { tenant: updatedTenant }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar tenant:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/tenants/:id
 * Deletar tenant (soft delete)
 */
router.delete('/:id', requireAuth(authSystem), requireRole(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se tenant existe
    const tenant = await db.query('SELECT id, name, slug FROM tenants WHERE id = $1', [id]);
    if (tenant.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant não encontrado'
      });
    }

    // Não permitir deletar tenant TOIT
    if (tenant.rows[0].slug === 'toit') {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar o tenant TOIT'
      });
    }

    // Soft delete do tenant
    await db.query(`
      UPDATE tenants 
      SET deleted_at = CURRENT_TIMESTAMP, status = 'inactive'
      WHERE id = $1
    `, [id]);

    // Desativar todos os usuários do tenant
    await db.query(`
      UPDATE users 
      SET is_active = false, deleted_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $1
    `, [id]);

    // Invalidar todas as sessões dos usuários do tenant
    await db.query(`
      DELETE FROM sessions 
      WHERE user_id IN (SELECT id FROM users WHERE tenant_id = $1)
    `, [id]);

    console.log(`🗑️ Tenant deletado: ${tenant.rows[0].name}`);

    res.json({
      success: true,
      message: 'Tenant deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar tenant:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/tenants/:id/stats
 * Estatísticas do tenant
 */
router.get('/:id/stats', requireAuth(authSystem), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissões
    const canView = req.user.role === 'super_admin' || 
                   req.user.tenant_id === parseInt(id);
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND is_active = true) as active_users,
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as total_users,
        (SELECT COUNT(*) FROM workspaces WHERE tenant_id = $1 AND is_active = true) as active_workspaces,
        (SELECT COUNT(*) FROM teams WHERE tenant_id = $1 AND is_active = true) as active_teams,
        (SELECT COUNT(*) FROM departments WHERE tenant_id = $1 AND is_active = true) as active_departments
    `;

    const result = await db.query(statsQuery, [id]);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
