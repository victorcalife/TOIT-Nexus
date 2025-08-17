const express = require( 'express' );
const bcrypt = require( 'bcryptjs' );
const { body, validationResult } = require( 'express-validator' );
const router = express.Router();
const DatabaseService = require( '../services/DatabaseService' );
const { authenticateToken, requireRole } = require( '../middleware/auth' );

const db = new DatabaseService();

/**
 * GET /api/users
 * Listar usuários (apenas admins)
 */
router.get( '/', authenticateToken, requireRole( [ 'admin', 'super_admin' ] ), async ( req, res ) =>
{
  try
  {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const offset = ( page - 1 ) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

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
    console.error( '❌ Erro ao listar usuários:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter usuários'
    } );
  }
} );

/**
 * GET /api/users/:id
 * Obter usuário específico
 */
router.get( '/:id', authenticateToken, async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar se usuário pode acessar este perfil
    if ( req.user.id !== parseInt( id ) && ![ 'admin', 'super_admin' ].includes( req.user.role ) )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado'
      } );
    }

    const users = await db.query( `
      SELECT 
        u.id, u.name, u.email, u.role, u.is_active, u.avatar,
        u.created_at, u.updated_at, u.last_login,
        up.preferences
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = ?
    `, [ id ] );

    if ( users.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado'
      } );
    }

    const user = users[ 0 ];

    // Buscar estatísticas do usuário
    const stats = await db.query( `
      SELECT 
        COUNT(CASE WHEN action = 'login_success' THEN 1 END) as total_logins,
        MAX(CASE WHEN action = 'login_success' THEN created_at END) as last_login_log
      FROM system_logs 
      WHERE user_id = ?
    `, [ id ] );

    res.json( {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.is_active,
          avatar: user.avatar,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLogin: user.last_login,
          preferences: user.preferences ? JSON.parse( user.preferences ) : {},
          stats: stats[ 0 ]
        }
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter usuário:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao obter usuário'
    } );
  }
} );

/**
 * POST /api/users
 * Criar novo usuário (apenas admins)
 */
router.post( '/', authenticateToken, requireRole( [ 'admin', 'super_admin' ] ), [
  body( 'name' ).trim().isLength( { min: 2, max: 100 } ).withMessage( 'Nome deve ter entre 2 e 100 caracteres' ),
  body( 'email' ).isEmail().normalizeEmail().withMessage( 'Email inválido' ),
  body( 'password' ).isLength( { min: 6 } ).withMessage( 'Senha deve ter pelo menos 6 caracteres' ),
  body( 'role' ).isIn( [ 'user', 'admin', 'super_admin' ] ).withMessage( 'Role inválido' )
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

    const { name, email, password, role = 'user', isActive = true } = req.body;

    console.log( `👤 Admin ${ req.user.email } criando usuário: ${ email }` );

    // Verificar se usuário já existe
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [ email ]
    );

    if ( existingUsers.length > 0 )
    {
      return res.status( 409 ).json( {
        success: false,
        error: 'Email já está em uso'
      } );
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash( password, saltRounds );

    // Criar usuário
    const result = await db.query( `
      INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, [ name, email, hashedPassword, role, isActive ] );

    const userId = result.insertId;

    // Criar preferências padrão
    await db.query( `
      INSERT INTO user_preferences (user_id, preferences, created_at, updated_at)
      VALUES (?, '{}', NOW(), NOW())
    `, [ userId ] );

    // Log de auditoria
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'user_created_by_admin', ?, ?, NOW())
    `, [ req.user.id, JSON.stringify( {
      createdUserId: userId,
      createdUserEmail: email,
      createdUserName: name,
      createdUserRole: role
    } ), req.ip ] );

    console.log( `✅ Usuário criado por admin: ${ email } (ID: ${ userId })` );

    res.status( 201 ).json( {
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        userId,
        name,
        email,
        role,
        isActive
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao criar usuário:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao criar usuário'
    } );
  }
} );

/**
 * PUT /api/users/:id
 * Atualizar usuário
 */
router.put( '/:id', authenticateToken, [
  body( 'name' ).optional().trim().isLength( { min: 2, max: 100 } ).withMessage( 'Nome deve ter entre 2 e 100 caracteres' ),
  body( 'email' ).optional().isEmail().normalizeEmail().withMessage( 'Email inválido' ),
  body( 'role' ).optional().isIn( [ 'user', 'admin', 'super_admin' ] ).withMessage( 'Role inválido' )
], async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar permissões
    const canEdit = req.user.id === parseInt( id ) || [ 'admin', 'super_admin' ].includes( req.user.role );
    if ( !canEdit )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado'
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

    const { name, email, role, isActive, avatar } = req.body;

    // Verificar se usuário existe
    const users = await db.query( 'SELECT id, email, role FROM users WHERE id = ?', [ id ] );
    if ( users.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado'
      } );
    }

    const currentUser = users[ 0 ];

    // Verificar se pode alterar role
    if ( role && role !== currentUser.role )
    {
      if ( ![ 'admin', 'super_admin' ].includes( req.user.role ) )
      {
        return res.status( 403 ).json( {
          success: false,
          error: 'Apenas admins podem alterar roles'
        } );
      }
    }

    // Verificar se pode alterar status
    if ( isActive !== undefined && isActive !== currentUser.is_active )
    {
      if ( ![ 'admin', 'super_admin' ].includes( req.user.role ) )
      {
        return res.status( 403 ).json( {
          success: false,
          error: 'Apenas admins podem alterar status'
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

    if ( email && email !== currentUser.email )
    {
      // Verificar se email já está em uso
      const existingUsers = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [ email, id ]
      );

      if ( existingUsers.length > 0 )
      {
        return res.status( 409 ).json( {
          success: false,
          error: 'Email já está em uso'
        } );
      }

      updateFields.push( 'email = ?' );
      updateValues.push( email );
    }

    if ( role )
    {
      updateFields.push( 'role = ?' );
      updateValues.push( role );
    }

    if ( isActive !== undefined )
    {
      updateFields.push( 'is_active = ?' );
      updateValues.push( isActive );
    }

    if ( avatar )
    {
      updateFields.push( 'avatar = ?' );
      updateValues.push( avatar );
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

    // Atualizar usuário
    await db.query( `
      UPDATE users 
      SET ${ updateFields.join( ', ' ) }
      WHERE id = ?
    `, updateValues );

    // Log de auditoria
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'user_updated', ?, ?, NOW())
    `, [ req.user.id, JSON.stringify( {
      updatedUserId: parseInt( id ),
      changes: { name, email, role, isActive, avatar },
      updatedBy: req.user.email
    } ), req.ip ] );

    console.log( `✅ Usuário atualizado: ID ${ id } por ${ req.user.email }` );

    res.json( {
      success: true,
      message: 'Usuário atualizado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao atualizar usuário:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao atualizar usuário'
    } );
  }
} );

/**
 * DELETE /api/users/:id
 * Deletar usuário (apenas admins)
 */
router.delete( '/:id', authenticateToken, requireRole( [ 'admin', 'super_admin' ] ), async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Não permitir deletar a si mesmo
    if ( req.user.id === parseInt( id ) )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Não é possível deletar sua própria conta'
      } );
    }

    // Verificar se usuário existe
    const users = await db.query( 'SELECT id, email, name FROM users WHERE id = ?', [ id ] );
    if ( users.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado'
      } );
    }

    const userToDelete = users[ 0 ];

    // Deletar preferências
    await db.query( 'DELETE FROM user_preferences WHERE user_id = ?', [ id ] );

    // Deletar logs (opcional - pode querer manter para auditoria)
    // await db.query('DELETE FROM system_logs WHERE user_id = ?', [id]);

    // Deletar usuário
    await db.query( 'DELETE FROM users WHERE id = ?', [ id ] );

    // Log de auditoria
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'user_deleted', ?, ?, NOW())
    `, [ req.user.id, JSON.stringify( {
      deletedUserId: parseInt( id ),
      deletedUserEmail: userToDelete.email,
      deletedUserName: userToDelete.name,
      deletedBy: req.user.email
    } ), req.ip ] );

    console.log( `✅ Usuário deletado: ${ userToDelete.email } (ID: ${ id }) por ${ req.user.email }` );

    res.json( {
      success: true,
      message: 'Usuário deletado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao deletar usuário:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao deletar usuário'
    } );
  }
} );

/**
 * PUT /api/users/:id/password
 * Alterar senha de usuário (admins ou próprio usuário)
 */
router.put( '/:id/password', authenticateToken, [
  body( 'newPassword' ).isLength( { min: 6 } ).withMessage( 'Nova senha deve ter pelo menos 6 caracteres' ),
  body( 'confirmPassword' ).custom( ( value, { req } ) =>
  {
    if ( value !== req.body.newPassword )
    {
      throw new Error( 'Confirmação de senha não confere' );
    }
    return true;
  } )
], async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar permissões
    const canChangePassword = req.user.id === parseInt( id ) || [ 'admin', 'super_admin' ].includes( req.user.role );
    if ( !canChangePassword )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado'
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

    const { currentPassword, newPassword } = req.body;

    // Se não é admin, verificar senha atual
    if ( req.user.id === parseInt( id ) && !currentPassword )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Senha atual é obrigatória'
      } );
    }

    // Buscar usuário
    const users = await db.query( 'SELECT id, email, password FROM users WHERE id = ?', [ id ] );
    if ( users.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado'
      } );
    }

    const user = users[ 0 ];

    // Verificar senha atual se necessário
    if ( req.user.id === parseInt( id ) )
    {
      const isValidPassword = await bcrypt.compare( currentPassword, user.password );
      if ( !isValidPassword )
      {
        return res.status( 401 ).json( {
          success: false,
          error: 'Senha atual incorreta'
        } );
      }
    }

    // Hash da nova senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash( newPassword, saltRounds );

    // Atualizar senha
    await db.query( `
      UPDATE users 
      SET password = ?, updated_at = NOW()
      WHERE id = ?
    `, [ hashedPassword, id ] );

    // Log de auditoria
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'password_changed', ?, ?, NOW())
    `, [ req.user.id, JSON.stringify( {
      targetUserId: parseInt( id ),
      targetUserEmail: user.email,
      changedBy: req.user.email,
      isOwnPassword: req.user.id === parseInt( id )
    } ), req.ip ] );

    console.log( `✅ Senha alterada para usuário ID: ${ id } por ${ req.user.email }` );

    res.json( {
      success: true,
      message: 'Senha alterada com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao alterar senha:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao alterar senha'
    } );
  }
} );

/**
 * GET /api/users/stats
 * Estatísticas de usuários (apenas admins)
 */
router.get( '/stats', authenticateToken, requireRole( [ 'admin', 'super_admin' ] ), async ( req, res ) =>
{
  try
  {
    // Estatísticas gerais
    const stats = await db.query( `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admin_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d
      FROM users
    `);

    // Usuários por mês (últimos 12 meses)
    const monthlyStats = await db.query( `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    // Últimos logins
    const recentLogins = await db.query( `
      SELECT 
        COUNT(*) as total_logins,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as logins_24h,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as logins_7d
      FROM system_logs 
      WHERE action = 'login_success'
    `);

    res.json( {
      success: true,
      data: {
        general: stats[ 0 ],
        monthly: monthlyStats,
        logins: recentLogins[ 0 ]
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
 * GET /api/users/:id/permissions
 * Obter permissões do usuário
 */
router.get( '/:id/permissions', authenticateToken, requireRole( [ 'admin', 'super_admin' ] ), async ( req, res ) =>
{
  try
  {
    const { id } = req.params;

    // Verificar se usuário existe
    const users = await db.query( `
      SELECT id, name, email, role
      FROM users
      WHERE id = ?
    `, [ id ] );

    if ( users.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado'
      } );
    }

    const user = users[ 0 ];

    // Buscar permissões do usuário
    const permissions = await db.query( `
      SELECT
        p.id,
        p.name,
        p.description,
        p.resource,
        p.action,
        up.granted_at,
        up.granted_by
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ?
      ORDER BY p.resource, p.action
    `, [ id ] );

    // Buscar permissões por role
    const rolePermissions = await db.query( `
      SELECT
        p.id,
        p.name,
        p.description,
        p.resource,
        p.action,
        'role' as source
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role = ?
      ORDER BY p.resource, p.action
    `, [ user.role ] );

    res.json( {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        directPermissions: permissions,
        rolePermissions: rolePermissions,
        allPermissions: [ ...permissions, ...rolePermissions ]
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter permissões:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/users/:id/permissions
 * Definir permissões do usuário
 */
router.post( '/:id/permissions', authenticateToken, requireRole( [ 'admin', 'super_admin' ] ), [
  body( 'permissions' ).isArray().withMessage( 'Permissões devem ser um array' ),
  body( 'permissions.*' ).isInt().withMessage( 'IDs de permissão devem ser números' )
], async ( req, res ) =>
{
  try
  {
    const errors = validationResult( req );
    if ( !errors.isEmpty() )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      } );
    }

    const { id } = req.params;
    const { permissions } = req.body;

    // Verificar se usuário existe
    const users = await db.query( `
      SELECT id, name, email
      FROM users
      WHERE id = ?
    `, [ id ] );

    if ( users.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado'
      } );
    }

    // Verificar se todas as permissões existem
    if ( permissions.length > 0 )
    {
      const validPermissions = await db.query( `
        SELECT id
        FROM permissions
        WHERE id IN (${ permissions.map( () => '?' ).join( ',' ) })
      `, permissions );

      if ( validPermissions.length !== permissions.length )
      {
        return res.status( 400 ).json( {
          success: false,
          error: 'Uma ou mais permissões são inválidas'
        } );
      }
    }

    // Remover permissões existentes
    await db.query( `
      DELETE FROM user_permissions
      WHERE user_id = ?
    `, [ id ] );

    // Adicionar novas permissões
    if ( permissions.length > 0 )
    {
      const values = permissions.map( permissionId => [ id, permissionId, req.user.userId ] );

      await db.query( `
        INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at)
        VALUES ${ values.map( () => '(?, ?, ?, NOW())' ).join( ', ' ) }
      `, values.flat() );
    }

    // Log da ação
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'permissions_updated', ?, ?, NOW())
    `, [
      req.user.userId,
      `Permissões atualizadas para usuário ${ id }: ${ permissions.join( ', ' ) }`,
      req.ip
    ] );

    res.json( {
      success: true,
      message: 'Permissões atualizadas com sucesso',
      data: {
        userId: id,
        permissions: permissions
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao definir permissões:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * GET /api/users/stats
 * Estatísticas de usuários
 */
router.get( '/stats', authenticateToken, requireRole( [ 'admin', 'super_admin' ] ), async ( req, res ) =>
{
  try
  {
    // Total de usuários
    const totalUsers = await db.query( `
      SELECT COUNT(*) as total FROM users
    `);

    // Usuários ativos
    const activeUsers = await db.query( `
      SELECT COUNT(*) as total FROM users WHERE is_active = 1
    `);

    // Usuários por role
    const usersByRole = await db.query( `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    // Usuários criados nos últimos 30 dias
    const recentUsers = await db.query( `
      SELECT COUNT(*) as total
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Usuários que fizeram login nos últimos 7 dias
    const activeLastWeek = await db.query( `
      SELECT COUNT(*) as total
      FROM users
      WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Usuários por tenant (se aplicável)
    const usersByTenant = await db.query( `
      SELECT
        t.name as tenant_name,
        COUNT(u.id) as user_count
      FROM tenants t
      LEFT JOIN users u ON t.id = u.tenant_id
      GROUP BY t.id, t.name
      ORDER BY user_count DESC
    `);

    res.json( {
      success: true,
      data: {
        total: totalUsers[ 0 ].total,
        active: activeUsers[ 0 ].total,
        inactive: totalUsers[ 0 ].total - activeUsers[ 0 ].total,
        recentSignups: recentUsers[ 0 ].total,
        activeLastWeek: activeLastWeek[ 0 ].total,
        byRole: usersByRole,
        byTenant: usersByTenant,
        timestamp: new Date().toISOString()
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter estatísticas:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

module.exports = router;
