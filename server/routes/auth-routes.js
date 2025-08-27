/**
 * ROTAS DE AUTENTICAÇÃO ROBUSTAS
 * Login, Logout, Refresh, Registro, Recuperação de Senha
 * 100% JavaScript - SEM TYPESCRIPT
 */

const express = require( 'express' );
const rateLimit = require( 'express-rate-limit' );
const { body, validationResult } = require( 'express-validator' );
const { authSystem, requireAuth } = require( '../auth-system' );

const router = express.Router();

// Rate limiting para login
const loginLimiter = rateLimit( {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
} );

// Rate limiting para registro
const registerLimiter = rateLimit( {
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP
  message: {
    success: false,
    error: 'Muitas tentativas de registro. Tente novamente em 1 hora.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
} );

/**
 * POST /api/auth/login
 * Login do usuário (email ou CPF)
 */
router.post( '/login', loginLimiter, [
  body( 'identifier' ).notEmpty().withMessage( 'Email ou CPF é obrigatório' ),
  body( 'password' ).isLength( { min: 6 } ).withMessage( 'Senha deve ter pelo menos 6 caracteres' )
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

    const { identifier, password, rememberMe = false } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get( 'User-Agent' ) || 'Unknown';

    console.log( `🔐 Tentativa de login: ${ identifier } (IP: ${ ipAddress })` );

    // Determinar se é email ou CPF
    const isEmail = identifier.includes( '@' );
    const email = isEmail ? identifier : null;
    const cpf = !isEmail ? identifier.replace( /\D/g, '' ) : null;

    // Autenticar usuário
    const user = await authSystem.authenticateUser( email, password, cpf );

    if ( !user )
    {
      return res.status( 401 ).json( {
        success: false,
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      } );
    }

    // Gerar tokens
    const { accessToken, refreshToken } = authSystem.generateTokens( user );

    // Criar sessão no banco
    await authSystem.createSession( user.id, accessToken, refreshToken, ipAddress, userAgent );

    // Configurar cookies seguros
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 dias ou 1 dia
    };

    res.cookie( 'accessToken', accessToken, cookieOptions );
    res.cookie( 'refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 } );

    console.log( `✅ Login bem-sucedido: ${ user.email } (${ user.role })` );

    res.json( {
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user,
        accessToken,
        refreshToken,
        expiresIn: rememberMe ? '7d' : '1d'
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no login:', error.message );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    } );
  }
} );

/**
 * POST /api/auth/logout
 * Logout do usuário
 */
router.post( '/logout', requireAuth( authSystem ), async ( req, res ) =>
{
  try
  {
    const token = req.token;

    // Invalidar sessão no banco
    await authSystem.invalidateSession( token );

    // Limpar cookies
    res.clearCookie( 'accessToken' );
    res.clearCookie( 'refreshToken' );

    console.log( `🔒 Logout: ${ req.user.email } (ID: ${ req.user.id })` );

    res.json( {
      success: true,
      message: 'Logout realizado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no logout:', error.message );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/auth/refresh
 * Renovar tokens JWT
 */
router.post( '/refresh', async ( req, res ) =>
{
  try
  {
    const { refreshToken } = req.body;
    const cookieRefreshToken = req.cookies?.refreshToken;

    const token = refreshToken || cookieRefreshToken;

    if ( !token )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Refresh token é obrigatório',
        code: 'REFRESH_TOKEN_REQUIRED'
      } );
    }

    // Renovar tokens
    const { accessToken, refreshToken: newRefreshToken } = await authSystem.refreshTokens( token );

    // Atualizar cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    };

    res.cookie( 'accessToken', accessToken, cookieOptions );
    res.cookie( 'refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 } );

    res.json( {
      success: true,
      message: 'Tokens renovados com sucesso',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao renovar tokens:', error.message );
    res.status( 401 ).json( {
      success: false,
      error: error.message,
      code: 'REFRESH_FAILED'
    } );
  }
} );

/**
 * GET /api/auth/me
 * Obter dados do usuário autenticado
 */
router.get( '/me', requireAuth( authSystem ), async ( req, res ) =>
{
  try
  {
    // Buscar dados atualizados do usuário
    const user = await authSystem.getUserById( req.user.id );

    if ( !user )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      } );
    }

    res.json( {
      success: true,
      data: { user }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao buscar usuário:', error.message );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/auth/verify-token
 * Verificar se token é válido
 */
router.post( '/verify-token', async ( req, res ) =>
{
  try
  {
    const { token } = req.body;
    const cookieToken = req.cookies?.accessToken;

    const tokenToVerify = token || cookieToken;

    if ( !tokenToVerify )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Token é obrigatório',
        code: 'TOKEN_REQUIRED'
      } );
    }

    // Verificar token
    const decoded = authSystem.verifyToken( tokenToVerify );

    // Buscar usuário
    const user = await authSystem.getUserById( decoded.userId );

    if ( !user )
    {
      return res.status( 401 ).json( {
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      } );
    }

    res.json( {
      success: true,
      message: 'Token válido',
      data: {
        valid: true,
        user,
        decoded
      }
    } );

  } catch ( error )
  {
    res.status( 401 ).json( {
      success: false,
      error: error.message,
      code: 'TOKEN_INVALID',
      data: { valid: false }
    } );
  }
} );

/**
 * GET /api/auth/sessions
 * Listar sessões ativas do usuário
 */
router.get( '/sessions', requireAuth( authSystem ), async ( req, res ) =>
{
  try
  {
    const query = `
      SELECT 
        id, ip_address, user_agent, created_at, last_used, expires_at
      FROM sessions 
      WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
      ORDER BY last_used DESC
    `;

    const result = await authSystem.db.query( query, [ req.user.id ] );

    res.json( {
      success: true,
      data: {
        sessions: result.rows,
        total: result.rows.length
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao listar sessões:', error.message );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * DELETE /api/auth/sessions/:sessionId
 * Invalidar sessão específica
 */
router.delete( '/sessions/:sessionId', requireAuth( authSystem ), async ( req, res ) =>
{
  try
  {
    const { sessionId } = req.params;

    const query = `
      DELETE FROM sessions 
      WHERE id = $1 AND user_id = $2
    `;

    await authSystem.db.query( query, [ sessionId, req.user.id ] );

    res.json( {
      success: true,
      message: 'Sessão invalidada com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao invalidar sessão:', error.message );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/simple-login
 * Login simplificado para suporte
 */
router.post( '/simple-login', loginLimiter, [
  body( 'cpf' ).notEmpty().withMessage( 'CPF é obrigatório' ),
  body( 'password' ).notEmpty().withMessage( 'Senha é obrigatória' ),
  body( 'loginType' ).optional().isIn( [ 'support', 'admin' ] ).withMessage( 'Tipo de login inválido' )
], async ( req, res ) =>
{
  try
  {
    // Debug completo do body da requisição
    console.log( '🔐 [SIMPLE-LOGIN] Body completo recebido:', JSON.stringify( req.body, null, 2 ) );
    console.log( '🔐 [SIMPLE-LOGIN] Headers da requisição:', JSON.stringify( req.headers, null, 2 ) );
    console.log( '🔐 [SIMPLE-LOGIN] Content-Type:', req.get( 'Content-Type' ) );
    
    console.log( '🔐 [SIMPLE-LOGIN] Tentativa de login de suporte:', {
      cpf: req.body.cpf,
      password: req.body.password ? '***PRESENTE***' : '***AUSENTE***',
      loginType: req.body.loginType,
      bodyKeys: Object.keys( req.body || {} )
    } );

    // Verificar erros de validação
    const errors = validationResult( req );
    if ( !errors.isEmpty() )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
        code: 'VALIDATION_ERROR'
      } );
    }

    const { cpf, email, password, loginType = 'support' } = req.body;

    console.log( '🛡️ [SIMPLE-LOGIN] Dados recebidos:', {
      cpf: cpf?.length || 'undefined',
      email: email?.length || 'undefined',
      password: password?.length || 'undefined',
      loginType
    } );

    // Para login de suporte, usar CPF diretamente (não transformar em email)
    let user;
    if ( email ) {
      console.log( '🛡️ [SIMPLE-LOGIN] Chamando authenticateUser com EMAIL:', email );
      user = await authSystem.authenticateUser( email, password );
    } else if ( cpf ) {
      console.log( '🛡️ [SIMPLE-LOGIN] Chamando authenticateUser com CPF:', cpf );
      user = await authSystem.authenticateUser( null, password, cpf );
    } else {
      return res.status( 400 ).json( {
        success: false,
        error: 'CPF ou email é obrigatório',
        code: 'MISSING_CREDENTIALS'
      } );
    }
    
    console.log( '🛡️ [SIMPLE-LOGIN] Resultado authenticateUser:', user ? 'USER_FOUND' : 'USER_NOT_FOUND' );

    if ( !user )
    {
      console.log( '❌ [SIMPLE-LOGIN] Login falhou: Credenciais inválidas' );
      return res.status( 401 ).json( {
        success: false,
        error: 'Credenciais inválidas',
        message: 'CPF ou senha incorretos',
        code: 'INVALID_CREDENTIALS'
      } );
    }

    // Verificar se o usuário tem permissão para login de suporte
    if ( loginType === 'support' && ![ 'admin', 'super_admin', 'support' ].includes( user.role ) )
    {
      console.log( '❌ [SIMPLE-LOGIN] Usuário sem permissão de suporte:', user.role );
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado',
        message: 'Usuário não tem permissão para login de suporte',
        code: 'INSUFFICIENT_PERMISSIONS'
      } );
    }

    console.log( '✅ [SIMPLE-LOGIN] Login de suporte realizado com sucesso:', {
      userId: user.id,
      role: user.role,
      loginType
    } );

    // Gerar tokens JWT
    const { accessToken, refreshToken } = authSystem.generateTokens( user );

    // Configurar cookies seguros
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    };

    res.cookie( 'accessToken', accessToken, cookieOptions );
    res.cookie( 'refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 } );

    // Atualizar último login (sem criar sessão por enquanto)
    try
    {
      await authSystem.updateLastLogin( user.id );
    } catch ( error )
    {
      console.warn( '⚠️ Erro ao atualizar último login:', error.message );
    }

    res.json( {
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          firstName: user.name?.split( ' ' )[ 0 ] || 'Usuário',
          lastName: user.name?.split( ' ' ).slice( 1 ).join( ' ' ) || '',
          email: user.email,
          role: user.role,
          tenant: user.tenant_name
        },
        tokens: {
          accessToken,
          refreshToken
        }
      },
      loginType
    } );

  } catch ( error )
  {
    console.error( '❌ [SIMPLE-LOGIN] Erro interno:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor',
      message: 'Tente novamente em alguns instantes',
      code: 'INTERNAL_ERROR'
    } );
  }
} );

module.exports = router;
