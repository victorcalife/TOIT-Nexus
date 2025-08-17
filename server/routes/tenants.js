const express = require( 'express' );
const { body, validationResult } = require( 'express-validator' );
const router = express.Router();
const DatabaseService = require( '../services/DatabaseService' );
const { authenticateToken } = require( '../middleware/auth' );
const { requirePermission, requireAnyPermission } = require( '../middleware/permissions' );

const db = new DatabaseService();

/**
 * GET /api/tenants
 * Listar tenants (apenas super_admin)
 */
router.get( '/', authenticateToken, requirePermission( 'tenants.view' ), async ( req, res ) =>
{
  try
  {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = ( page - 1 ) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if ( search )
    {
      whereClause += ' AND (name LIKE ? OR domain LIKE ?)';
      params.push( `%${ search }%`, `%${ search }%` );
    }

    if ( status )
    {
      whereClause += ' AND is_active = ?';
      params.push( status === 'active' ? 1 : 0 );
    }

    const tenants = await db.query( `
      SELECT 
        t.*,
        COUNT(u.id) as user_count,
        MAX(u.last_login) as last_user_activity
      FROM tenants t
      LEFT JOIN users u ON t.id = u.tenant_id
      ${ whereClause }
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, [ ...params, parseInt( limit ), offset ] );

    // Contar total
    const totalResult = await db.query( `
      SELECT COUNT(*) as total FROM tenants ${ whereClause }
    `, params );

    const total = totalResult[ 0 ].total;

    res.json( {
      success: true,
      data: {
        tenants: tenants.map( tenant => ( {
          ...tenant,
          settings: tenant.settings ? JSON.parse( tenant.settings ) : {},
          features: tenant.features ? JSON.parse( tenant.features ) : {}
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
    console.error( '❌ Erro ao listar tenants:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter tenants'
    } );
  }
} );

/**
 * GET /api/tenants/:id
 * Obter tenant específico
 */
router.get( '/:id', authenticateToken, requireAnyPermission( [ 'tenants.view', 'tenants.manage' ] ), async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar se pode acessar este tenant
    if ( req.user.role !== 'super_admin' && req.user.tenantId !== parseInt( id ) )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado ao tenant'
      } );
    }

    const tenants = await db.query( `
      SELECT * FROM tenants WHERE id = ?
    `, [ id ] );

    if ( tenants.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Tenant não encontrado'
      } );
    }

    const tenant = tenants[ 0 ];

    // Buscar estatísticas do tenant
    const stats = await db.query( `
      SELECT 
        COUNT(u.id) as total_users,
        COUNT(CASE WHEN u.is_active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_users_30d,
        MAX(u.last_login) as last_activity
      FROM users u
      WHERE u.tenant_id = ?
    `, [ id ] );

    // Buscar uso de recursos
    const usage = await db.query( `
      SELECT 
        COUNT(CASE WHEN action = 'login_success' THEN 1 END) as total_logins,
        COUNT(CASE WHEN action = 'login_success' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as logins_30d
      FROM system_logs sl
      JOIN users u ON sl.user_id = u.id
      WHERE u.tenant_id = ?
    `, [ id ] );

    res.json( {
      success: true,
      data: {
        tenant: {
          ...tenant,
          settings: tenant.settings ? JSON.parse( tenant.settings ) : {},
          features: tenant.features ? JSON.parse( tenant.features ) : {}
        },
        stats: stats[ 0 ],
        usage: usage[ 0 ]
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter tenant:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter tenant'
    } );
  }
} );

/**
 * POST /api/tenants
 * Criar novo tenant (apenas super_admin)
 */
router.post( '/', authenticateToken, requirePermission( 'tenants.create' ), [
  body( 'name' ).trim().isLength( { min: 2, max: 100 } ).withMessage( 'Nome deve ter entre 2 e 100 caracteres' ),
  body( 'domain' ).trim().isLength( { min: 3, max: 100 } ).withMessage( 'Domínio deve ter entre 3 e 100 caracteres' ),
  body( 'email' ).isEmail().normalizeEmail().withMessage( 'Email inválido' )
], async ( req, res ) =>
{
  try
  {
    // Verificar erros de validação
    const errors = validationResult( req );
    if ( !errors.isEmpty() )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      } );
    }

    const {
      name,
      domain,
      email,
      phone,
      address,
      settings = {},
      features = {},
      maxUsers = 100,
      isActive = true
    } = req.body;

    console.log( `🏢 Criando tenant: ${ name } (${ domain })` );

    // Verificar se domínio já existe
    const existingTenants = await db.query(
      'SELECT id FROM tenants WHERE domain = ?',
      [ domain ]
    );

    if ( existingTenants.length > 0 )
    {
      return res.status( 409 ).json( {
        success: false,
        error: 'Domínio já está em uso'
      } );
    }

    // Criar tenant
    const result = await db.query( `
      INSERT INTO tenants (
        name, domain, email, phone, address, settings, features,
        max_users, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      name, domain, email, phone, address,
      JSON.stringify( settings ),
      JSON.stringify( features ),
      maxUsers, isActive
    ] );

    const tenantId = result.insertId;

    // Log de auditoria
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'tenant_created', ?, ?, NOW())
    `, [ req.user.id, JSON.stringify( {
      tenantId,
      tenantName: name,
      tenantDomain: domain,
      createdBy: req.user.email
    } ), req.ip ] );

    console.log( `✅ Tenant criado: ${ name } (ID: ${ tenantId })` );

    res.status( 201 ).json( {
      success: true,
      message: 'Tenant criado com sucesso',
      data: {
        tenantId,
        name,
        domain,
        email
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao criar tenant:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao criar tenant'
    } );
  }
} );

/**
 * PUT /api/tenants/:id
 * Atualizar tenant
 */
router.put( '/:id', authenticateToken, requireAnyPermission( [ 'tenants.edit', 'tenants.manage' ] ), [
  body( 'name' ).optional().trim().isLength( { min: 2, max: 100 } ).withMessage( 'Nome deve ter entre 2 e 100 caracteres' ),
  body( 'domain' ).optional().trim().isLength( { min: 3, max: 100 } ).withMessage( 'Domínio deve ter entre 3 e 100 caracteres' ),
  body( 'email' ).optional().isEmail().normalizeEmail().withMessage( 'Email inválido' )
], async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar se pode editar este tenant
    if ( req.user.role !== 'super_admin' && req.user.tenantId !== parseInt( id ) )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado ao tenant'
      } );
    }

    // Verificar erros de validação
    const errors = validationResult( req );
    if ( !errors.isEmpty() )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      } );
    }

    const {
      name, domain, email, phone, address,
      settings, features, maxUsers, isActive
    } = req.body;

    // Verificar se tenant existe
    const tenants = await db.query( 'SELECT id, name, domain FROM tenants WHERE id = ?', [ id ] );
    if ( tenants.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Tenant não encontrado'
      } );
    }

    const currentTenant = tenants[ 0 ];

    // Verificar se domínio já está em uso (se foi alterado)
    if ( domain && domain !== currentTenant.domain )
    {
      const existingTenants = await db.query(
        'SELECT id FROM tenants WHERE domain = ? AND id != ?',
        [ domain, id ]
      );

      if ( existingTenants.length > 0 )
      {
        return res.status( 409 ).json( {
          success: false,
          error: 'Domínio já está em uso'
        } );
      }
    }

    const updateFields = [];
    const updateValues = [];

    if ( name )
    {
      updateFields.push( 'name = ?' );
      updateValues.push( name );
    }

    if ( domain )
    {
      updateFields.push( 'domain = ?' );
      updateValues.push( domain );
    }

    if ( email )
    {
      updateFields.push( 'email = ?' );
      updateValues.push( email );
    }

    if ( phone )
    {
      updateFields.push( 'phone = ?' );
      updateValues.push( phone );
    }

    if ( address )
    {
      updateFields.push( 'address = ?' );
      updateValues.push( address );
    }

    if ( settings )
    {
      updateFields.push( 'settings = ?' );
      updateValues.push( JSON.stringify( settings ) );
    }

    if ( features )
    {
      updateFields.push( 'features = ?' );
      updateValues.push( JSON.stringify( features ) );
    }

    if ( maxUsers !== undefined )
    {
      updateFields.push( 'max_users = ?' );
      updateValues.push( maxUsers );
    }

    if ( isActive !== undefined && req.user.role === 'super_admin' )
    {
      updateFields.push( 'is_active = ?' );
      updateValues.push( isActive );
    }

    if ( updateFields.length === 0 )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Nenhum campo para atualizar'
      } );
    }

    updateFields.push( 'updated_at = NOW()' );
    updateValues.push( id );

    // Atualizar tenant
    await db.query( `
      UPDATE tenants 
      SET ${ updateFields.join( ', ' ) }
      WHERE id = ?
    `, updateValues );

    // Log de auditoria
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'tenant_updated', ?, ?, NOW())
    `, [ req.user.id, JSON.stringify( {
      tenantId: parseInt( id ),
      changes: { name, domain, email, phone, address, settings, features, maxUsers, isActive },
      updatedBy: req.user.email
    } ), req.ip ] );

    console.log( `✅ Tenant atualizado: ID ${ id } por ${ req.user.email }` );

    res.json( {
      success: true,
      message: 'Tenant atualizado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao atualizar tenant:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao atualizar tenant'
    } );
  }
} );

/**
 * DELETE /api/tenants/:id
 * Deletar tenant (apenas super_admin)
 */
router.delete( '/:id', authenticateToken, requirePermission( 'tenants.delete' ), async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar se tenant existe
    const tenants = await db.query( 'SELECT id, name, domain FROM tenants WHERE id = ?', [ id ] );
    if ( tenants.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Tenant não encontrado'
      } );
    }

    const tenant = tenants[ 0 ];

    // Verificar se há usuários no tenant
    const users = await db.query( 'SELECT COUNT(*) as count FROM users WHERE tenant_id = ?', [ id ] );
    if ( users[ 0 ].count > 0 )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Não é possível deletar tenant com usuários. Remova todos os usuários primeiro.'
      } );
    }

    // Deletar tenant
    await db.query( 'DELETE FROM tenants WHERE id = ?', [ id ] );

    // Log de auditoria
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'tenant_deleted', ?, ?, NOW())
    `, [ req.user.id, JSON.stringify( {
      tenantId: parseInt( id ),
      tenantName: tenant.name,
      tenantDomain: tenant.domain,
      deletedBy: req.user.email
    } ), req.ip ] );

    console.log( `✅ Tenant deletado: ${ tenant.name } (ID: ${ id }) por ${ req.user.email }` );

    res.json( {
      success: true,
      message: 'Tenant deletado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao deletar tenant:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao deletar tenant'
    } );
  }
} );

/**
 * GET /api/tenants/:id/users
 * Listar usuários do tenant
 */
router.get( '/:id/users', authenticateToken, requireAnyPermission( [ 'tenants.view', 'users.view' ] ), async ( req, res ) =>
{
  try
  {
    const { id } = req.params;
    const { page = 1, limit = 20, search, role, status } = req.query;
    const offset = ( page - 1 ) * limit;

    // Verificar se pode acessar este tenant
    if ( req.user.role !== 'super_admin' && req.user.tenantId !== parseInt( id ) )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado ao tenant'
      } );
    }

    let whereClause = 'WHERE tenant_id = ?';
    let params = [ id ];

    if ( search )
    {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push( `%${ search }%`, `%${ search }%` );
    }

    if ( role )
    {
      whereClause += ' AND role = ?';
      params.push( role );
    }

    if ( status )
    {
      whereClause += ' AND is_active = ?';
      params.push( status === 'active' ? 1 : 0 );
    }

    const users = await db.query( `
      SELECT 
        id, name, email, role, is_active, avatar,
        created_at, updated_at, last_login
      FROM users 
      ${ whereClause }
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [ ...params, parseInt( limit ), offset ] );

    // Contar total
    const totalResult = await db.query( `
      SELECT COUNT(*) as total FROM users ${ whereClause }
    `, params );

    const total = totalResult[ 0 ].total;

    res.json( {
      success: true,
      data: {
        users,
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
    console.error( '❌ Erro ao listar usuários do tenant:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter usuários do tenant'
    } );
  }
} );

/**
 * GET /api/tenants/stats
 * Estatísticas de tenants (apenas super_admin)
 */
router.get( '/stats', authenticateToken, requirePermission( 'tenants.view' ), async ( req, res ) =>
{
  try
  {
    // Estatísticas gerais
    const stats = await db.query( `
      SELECT 
        COUNT(*) as total_tenants,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_tenants,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_tenants,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_tenants_30d
      FROM tenants
    `);

    // Tenants por mês (últimos 12 meses)
    const monthlyStats = await db.query( `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM tenants 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    // Top tenants por usuários
    const topTenants = await db.query( `
      SELECT 
        t.name,
        t.domain,
        COUNT(u.id) as user_count,
        MAX(u.last_login) as last_activity
      FROM tenants t
      LEFT JOIN users u ON t.id = u.tenant_id
      WHERE t.is_active = 1
      GROUP BY t.id
      ORDER BY user_count DESC
      LIMIT 10
    `);

    res.json( {
      success: true,
      data: {
        general: stats[ 0 ],
        monthly: monthlyStats,
        topTenants
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter estatísticas:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter estatísticas'
    } );
  }
} );

/**
 * GET /api/tenants/:id/stats
 * Estatísticas específicas de um tenant
 */
router.get( '/:id/stats', authenticateToken, requirePermission( 'tenants.view' ), async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar se tenant existe
    const tenants = await db.query( `
      SELECT id, name, domain, is_active, created_at
      FROM tenants
      WHERE id = ?
    `, [ id ] );

    if ( tenants.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Tenant não encontrado'
      } );
    }

    const tenant = tenants[ 0 ];

    // Estatísticas de usuários
    const userStats = await db.query( `
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users_7d,
        MAX(last_login) as last_user_activity
      FROM users
      WHERE tenant_id = ?
    `, [ id ] );

    // Estatísticas de operações quânticas
    const quantumStats = await db.query( `
      SELECT
        COUNT(*) as total_operations,
        COUNT(DISTINCT u.id) as users_with_operations,
        AVG(qo.quantum_speedup) as avg_speedup,
        SUM(qo.execution_time) as total_execution_time
      FROM quantum_operations qo
      JOIN users u ON qo.user_id = u.id
      WHERE u.tenant_id = ?
    `, [ id ] );

    // Estatísticas de conversas MILA
    const milaStats = await db.query( `
      SELECT
        COUNT(*) as total_conversations,
        COUNT(DISTINCT u.id) as users_with_conversations,
        AVG(mc.processing_time) as avg_processing_time
      FROM mila_conversations mc
      JOIN users u ON mc.user_id = u.id
      WHERE u.tenant_id = ?
    `, [ id ] );

    // Estatísticas de relatórios
    const reportStats = await db.query( `
      SELECT
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reports,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as reports_30d
      FROM reports r
      JOIN users u ON r.created_by = u.id
      WHERE u.tenant_id = ?
    `, [ id ] );

    // Uso de storage
    const storageStats = await db.query( `
      SELECT
        COUNT(*) as total_files,
        SUM(file_size) as total_size_bytes,
        AVG(file_size) as avg_file_size
      FROM file_uploads fu
      JOIN users u ON fu.uploaded_by = u.id
      WHERE u.tenant_id = ?
    `, [ id ] );

    // Atividade por mês (últimos 6 meses)
    const monthlyActivity = await db.query( `
      SELECT
        DATE_FORMAT(u.created_at, '%Y-%m') as month,
        COUNT(*) as new_users
      FROM users u
      WHERE u.tenant_id = ?
        AND u.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')
      ORDER BY month DESC
    `, [ id ] );

    res.json( {
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          isActive: tenant.is_active,
          createdAt: tenant.created_at
        },
        users: userStats[ 0 ] || {
          total_users: 0,
          active_users: 0,
          inactive_users: 0,
          new_users_30d: 0,
          active_users_7d: 0,
          last_user_activity: null
        },
        quantum: quantumStats[ 0 ] || {
          total_operations: 0,
          users_with_operations: 0,
          avg_speedup: 0,
          total_execution_time: 0
        },
        mila: milaStats[ 0 ] || {
          total_conversations: 0,
          users_with_conversations: 0,
          avg_processing_time: 0
        },
        reports: reportStats[ 0 ] || {
          total_reports: 0,
          completed_reports: 0,
          reports_30d: 0
        },
        storage: storageStats[ 0 ] || {
          total_files: 0,
          total_size_bytes: 0,
          avg_file_size: 0
        },
        monthlyActivity,
        timestamp: new Date().toISOString()
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter estatísticas do tenant:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter estatísticas do tenant'
    } );
  }
} );

module.exports = router;
