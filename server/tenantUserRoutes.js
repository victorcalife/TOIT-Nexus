/**
 * ROTAS DE USUÁRIOS DO TENANT
 * 
 * APIs para gerenciar usuários dentro do mesmo tenant
 */

const express = require( 'express' );
const router = express.Router();
const tenantUserService = require( './tenantUserService' );
const { authenticateToken } = require( './middleware/auth' );

/**
 * GET /api/users/tenant
 * Obter todos os usuários do tenant
 */
router.get( '/tenant', authenticateToken, async ( req, res ) =>
{
  try
  {
    const tenantId = req.user.tenantId;
    const includeOffline = req.query.includeOffline !== 'false';

    const users = await tenantUserService.getTenantUsers( tenantId, includeOffline );

    res.json( {
      success: true,
      data: {
        users,
        total: users.length,
        online: users.filter( u => u.isOnline ).length
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao buscar usuários do tenant:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao buscar usuários'
    } );
  }
} );

/**
 * GET /api/users/online
 * Obter usuários online do tenant
 */
router.get( '/online', authenticateToken, async ( req, res ) =>
{
  try
  {
    const tenantId = req.user.tenantId;
    const onlineUsers = tenantUserService.getOnlineUsers( tenantId );

    res.json( {
      success: true,
      data: {
        onlineUsers,
        count: onlineUsers.length
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao buscar usuários online:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao buscar usuários online'
    } );
  }
} );

/**
 * POST /api/users/status
 * Atualizar status do usuário
 */
router.post( '/status', authenticateToken, async ( req, res ) =>
{
  try
  {
    const userId = req.user.id;
    const { status, customMessage = '' } = req.body;

    if ( !status )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Status é obrigatório'
      } );
    }

    await tenantUserService.updateUserStatus( userId, status, customMessage );

    // Notificar outros usuários via WebSocket
    const wsService = req.app.get( 'wsService' );
    if ( wsService )
    {
      wsService.broadcast( 'user_status_change', {
        userId,
        status,
        customMessage,
        timestamp: new Date()
      } );
    }

    res.json( {
      success: true,
      data: {
        userId,
        status,
        customMessage,
        updatedAt: new Date()
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao atualizar status:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao atualizar status'
    } );
  }
} );

/**
 * POST /api/users/activity
 * Registrar atividade do usuário
 */
router.post( '/activity', authenticateToken, async ( req, res ) =>
{
  try
  {
    const userId = req.user.id;

    await tenantUserService.updateUserActivity( userId );

    res.json( {
      success: true,
      data: {
        userId,
        lastActivity: new Date()
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao registrar atividade:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao registrar atividade'
    } );
  }
} );

/**
 * POST /api/users/invite
 * Convidar usuário para o tenant
 */
router.post( '/invite', authenticateToken, async ( req, res ) =>
{
  try
  {
    const tenantId = req.user.tenantId;
    const inviterUserId = req.user.id;
    const { email, role, permissions, message } = req.body;

    if ( !email )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Email é obrigatório'
      } );
    }

    // Verificar se usuário já existe no tenant
    const existingUser = await tenantUserService.findUserByEmail( tenantId, email );
    if ( existingUser )
    {
      return res.status( 409 ).json( {
        success: false,
        error: 'Usuário já faz parte deste tenant'
      } );
    }

    const invite = await tenantUserService.inviteUserToTenant( tenantId, inviterUserId, {
      email,
      role: role || 'user',
      permissions: permissions || [ 'read' ],
      message
    } );

    res.json( {
      success: true,
      data: {
        invite,
        message: 'Convite enviado com sucesso'
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao enviar convite:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao enviar convite'
    } );
  }
} );

/**
 * GET /api/users/search
 * Buscar usuários do tenant
 */
router.get( '/search', authenticateToken, async ( req, res ) =>
{
  try
  {
    const tenantId = req.user.tenantId;
    const { q, role, status } = req.query;

    let users = await tenantUserService.getTenantUsers( tenantId, true );

    // Filtrar por busca
    if ( q )
    {
      const searchTerm = q.toLowerCase();
      users = users.filter( user =>
        user.name.toLowerCase().includes( searchTerm ) ||
        user.email.toLowerCase().includes( searchTerm ) ||
        ( user.department && user.department.toLowerCase().includes( searchTerm ) )
      );
    }

    // Filtrar por role
    if ( role )
    {
      users = users.filter( user => user.role === role );
    }

    // Filtrar por status
    if ( status )
    {
      users = users.filter( user => user.status === status );
    }

    res.json( {
      success: true,
      data: {
        users,
        total: users.length,
        filters: { q, role, status }
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao buscar usuários:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao buscar usuários'
    } );
  }
} );

/**
 * GET /api/users/stats
 * Obter estatísticas dos usuários do tenant
 */
router.get( '/stats', authenticateToken, async ( req, res ) =>
{
  try
  {
    const tenantId = req.user.tenantId;
    const stats = tenantUserService.getTenantStats( tenantId );

    res.json( {
      success: true,
      data: stats
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
 * PUT /api/users/:userId/permissions
 * Atualizar permissões de um usuário
 */
router.put( '/:userId/permissions', authenticateToken, async ( req, res ) =>
{
  try
  {
    const tenantId = req.user.tenantId;
    const { userId } = req.params;
    const { permissions } = req.body;

    if ( !permissions || !Array.isArray( permissions ) )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Permissões devem ser um array'
      } );
    }

    const updatedUser = await tenantUserService.updateUserPermissions( tenantId, userId, permissions );

    res.json( {
      success: true,
      data: {
        user: updatedUser,
        message: 'Permissões atualizadas com sucesso'
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao atualizar permissões:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao atualizar permissões'
    } );
  }
} );

/**
 * DELETE /api/users/:userId
 * Remover usuário do tenant
 */
router.delete( '/:userId', authenticateToken, async ( req, res ) =>
{
  try
  {
    const tenantId = req.user.tenantId;
    const { userId } = req.params;

    // Não permitir remover a si mesmo
    if ( userId === req.user.id )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Não é possível remover a si mesmo'
      } );
    }

    const removed = await tenantUserService.removeUserFromTenant( tenantId, userId );

    if ( !removed )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado'
      } );
    }

    // Notificar outros usuários
    const wsService = req.app.get( 'wsService' );
    if ( wsService )
    {
      wsService.broadcast( 'user_removed', {
        userId,
        tenantId,
        timestamp: new Date()
      } );
    }

    res.json( {
      success: true,
      data: {
        message: 'Usuário removido com sucesso'
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao remover usuário:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao remover usuário'
    } );
  }
} );

/**
 * POST /api/users/session/start
 * Registrar início de sessão
 */
router.post( '/session/start', authenticateToken, async ( req, res ) =>
{
  try
  {
    const userId = req.user.id;
    const { socketId } = req.body;

    await tenantUserService.registerUserSession( userId, {
      socketId,
      ipAddress: req.ip,
      userAgent: req.get( 'User-Agent' )
    } );

    res.json( {
      success: true,
      data: {
        message: 'Sessão iniciada com sucesso'
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao iniciar sessão:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao iniciar sessão'
    } );
  }
} );

/**
 * POST /api/users/session/end
 * Encerrar sessão
 */
router.post( '/session/end', authenticateToken, async ( req, res ) =>
{
  try
  {
    const userId = req.user.id;

    await tenantUserService.endUserSession( userId );

    res.json( {
      success: true,
      data: {
        message: 'Sessão encerrada com sucesso'
      }
    } );
  } catch ( error )
  {
    console.error( '❌ Erro ao encerrar sessão:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro ao encerrar sessão'
    } );
  }
} );

module.exports = router;
