const express = require( 'express' );
const bcrypt = require( 'bcryptjs' );
const jwt = require( 'jsonwebtoken' );
const rateLimit = require( 'express-rate-limit' );
const { body, validationResult } = require( 'express-validator' );
const router = express.Router();
const DatabaseService = require( '../services/DatabaseService' );
const { authenticateToken } = require( '../middleware/auth' );

const db = new DatabaseService();

// Rate limiting para login
const loginLimiter = rateLimit( {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
} );

/**
 * POST /api/auth/register
 * Registrar novo usuário
 */
router.post( '/register', [
  body( 'name' ).trim().isLength( { min: 2, max: 100 } ).withMessage( 'Nome deve ter entre 2 e 100 caracteres' ),
  body( 'email' ).isEmail().normalizeEmail().withMessage( 'Email inválido' ),
  body( 'password' ).isLength( { min: 6 } ).withMessage( 'Senha deve ter pelo menos 6 caracteres' ),
  body( 'confirmPassword' ).custom( ( value, { req } ) =>
  {
    if ( value !== req.body.password )
    {
      throw new Error( 'Confirmação de senha não confere' );
    }
    return true;
  } )
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

    const { name, email, password, role = 'user' } = req.body;

    console.log( `🔐 Tentativa de registro: ${ email }` );

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
      INSERT INTO users (name, email, password, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [ name, email, hashedPassword, role ] );

    const userId = result.insertId;

    // Criar preferências padrão
    await db.query( `
      INSERT INTO user_preferences (user_id, preferences, created_at, updated_at)
      VALUES (?, '{}', NOW(), NOW())
    `, [ userId ] );

    // Log de auditoria
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'user_register', ?, ?, NOW())
    `, [ userId, JSON.stringify( { email, name } ), req.ip ] );

    console.log( `✅ Usuário registrado: ${ email } (ID: ${ userId })` );

    res.status( 201 ).json( {
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        userId,
        name,
        email,
        role
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no registro:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/auth/login
 * Login do usuário
 */
router.post( '/login', loginLimiter, [
  body( 'email' ).isEmail().normalizeEmail().withMessage( 'Email inválido' ),
  body( 'password' ).notEmpty().withMessage( 'Senha é obrigatória' )
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

    const { email, password, rememberMe = false } = req.body;

    console.log( `🔐 Tentativa de login: ${ email }` );

    // Buscar usuário
    const users = await db.query( `
      SELECT id, name, email, password, role, is_active, last_login
      FROM users 
      WHERE email = ?
    `, [ email ] );

    if ( users.length === 0 )
    {
      // Log de tentativa inválida
      await db.query( `
        INSERT INTO system_logs (action, details, ip_address, created_at)
        VALUES ('login_failed', ?, ?, NOW())
      `, [ JSON.stringify( { email, reason: 'user_not_found' } ), req.ip ] );

      return res.status( 401 ).json( {
        success: false,
        error: 'Credenciais inválidas'
      } );
    }

    const user = users[ 0 ];

    // Verificar se usuário está ativo
    if ( !user.is_active )
    {
      return res.status( 401 ).json( {
        success: false,
        error: 'Conta desativada. Entre em contato com o suporte.'
      } );
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare( password, user.password );
    if ( !isValidPassword )
    {
      // Log de tentativa inválida
      await db.query( `
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, 'login_failed', ?, ?, NOW())
      `, [ user.id, JSON.stringify( { email, reason: 'invalid_password' } ), req.ip ] );

      return res.status( 401 ).json( {
        success: false,
        error: 'Credenciais inválidas'
      } );
    }

    // Gerar JWT
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
      { expiresIn: tokenExpiry }
    );

    // Atualizar último login
    await db.query( `
      UPDATE users 
      SET last_login = NOW(), updated_at = NOW()
      WHERE id = ?
    `, [ user.id ] );

    // Log de login bem-sucedido
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'login_success', ?, ?, NOW())
    `, [ user.id, JSON.stringify( { email, rememberMe } ), req.ip ] );

    console.log( `✅ Login bem-sucedido: ${ email } (ID: ${ user.id })` );

    res.json( {
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.last_login
        }
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no login:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * GET /api/auth/me
 * Obter dados do usuário atual
 */
router.get( '/me', authenticateToken, async ( req, res ) =>
{
  try
  {
    const users = await db.query( `
      SELECT 
        u.id, u.name, u.email, u.role, u.avatar, u.is_active,
        u.created_at, u.updated_at, u.last_login,
        up.preferences
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = ?
    `, [ req.user.id ] );

    if ( users.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado'
      } );
    }

    const user = users[ 0 ];

    res.json( {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLogin: user.last_login,
          preferences: user.preferences ? JSON.parse( user.preferences ) : {}
        }
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao obter dados do usuário:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/auth/logout
 * Logout do usuário
 */
router.post( '/logout', authenticateToken, async ( req, res ) =>
{
  try
  {
    // Log de logout
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'logout', ?, ?, NOW())
    `, [ req.user.id, JSON.stringify( { email: req.user.email } ), req.ip ] );

    console.log( `🔐 Logout: ${ req.user.email } (ID: ${ req.user.id })` );

    res.json( {
      success: true,
      message: 'Logout realizado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro no logout:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/auth/refresh
 * Renovar token JWT
 */
router.post( '/refresh', async ( req, res ) =>
{
  try
  {
    const { refreshToken } = req.body;

    if ( !refreshToken )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Refresh token é obrigatório'
      } );
    }

    // Verificar refresh token
    const decoded = jwt.verify( refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key' );

    // Buscar usuário
    const users = await db.query( `
      SELECT id, name, email, role, tenant_id, is_active
      FROM users
      WHERE id = ? AND is_active = 1
    `, [ decoded.userId ] );

    if ( users.length === 0 )
    {
      return res.status( 401 ).json( {
        success: false,
        error: 'Usuário não encontrado ou inativo'
      } );
    }

    const user = users[ 0 ];

    // Gerar novos tokens
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
      { expiresIn: '7d' }
    );

    res.json( {
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenant_id
        }
      }
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao renovar token:', error );

    if ( error.name === 'JsonWebTokenError' )
    {
      return res.status( 401 ).json( {
        success: false,
        error: 'Refresh token inválido'
      } );
    }

    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/auth/forgot-password
 * Esqueci minha senha
 */
router.post( '/forgot-password', [
  body( 'email' ).isEmail().normalizeEmail().withMessage( 'Email inválido' )
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

    const { email } = req.body;

    // Buscar usuário
    const users = await db.query( `
      SELECT id, name, email
      FROM users
      WHERE email = ? AND is_active = 1
    `, [ email ] );

    // Sempre retornar sucesso por segurança (não revelar se email existe)
    if ( users.length === 0 )
    {
      return res.json( {
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha'
      } );
    }

    const user = users[ 0 ];

    // Gerar token de reset
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    // Salvar token no banco
    await db.query( `
      INSERT INTO password_resets (user_id, token, expires_at, created_at)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())
      ON DUPLICATE KEY UPDATE
        token = VALUES(token),
        expires_at = VALUES(expires_at),
        created_at = VALUES(created_at)
    `, [ user.id, resetToken ] );

    // TODO: Enviar email com link de reset
    // const emailService = require('../services/EmailService');
    // await emailService.sendPasswordReset(user.email, resetToken);

    res.json( {
      success: true,
      message: 'Se o email existir, você receberá instruções para redefinir sua senha',
      // Para desenvolvimento, incluir o token
      ...( process.env.NODE_ENV === 'development' && { resetToken } )
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao processar esqueci senha:', error );
    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * POST /api/auth/reset-password
 * Resetar senha
 */
router.post( '/reset-password', [
  body( 'token' ).notEmpty().withMessage( 'Token é obrigatório' ),
  body( 'password' ).isLength( { min: 6 } ).withMessage( 'Senha deve ter pelo menos 6 caracteres' ),
  body( 'confirmPassword' ).custom( ( value, { req } ) =>
  {
    if ( value !== req.body.password )
    {
      throw new Error( 'Confirmação de senha não confere' );
    }
    return true;
  } )
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

    const { token, password } = req.body;

    // Verificar token
    const decoded = jwt.verify( token, process.env.JWT_SECRET || 'secret_key' );

    if ( decoded.type !== 'password_reset' )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Token inválido'
      } );
    }

    // Verificar se token existe no banco e não expirou
    const resets = await db.query( `
      SELECT user_id
      FROM password_resets
      WHERE user_id = ? AND token = ? AND expires_at > NOW()
    `, [ decoded.userId, token ] );

    if ( resets.length === 0 )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Token inválido ou expirado'
      } );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash( password, 12 );

    // Atualizar senha
    await db.query( `
      UPDATE users
      SET password = ?, updated_at = NOW()
      WHERE id = ?
    `, [ hashedPassword, decoded.userId ] );

    // Remover token usado
    await db.query( `
      DELETE FROM password_resets
      WHERE user_id = ?
    `, [ decoded.userId ] );

    // Log da ação
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'password_reset', 'Senha redefinida com sucesso', ?, NOW())
    `, [ decoded.userId, req.ip ] );

    res.json( {
      success: true,
      message: 'Senha redefinida com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao resetar senha:', error );

    if ( error.name === 'JsonWebTokenError' )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Token inválido'
      } );
    }

    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

/**
 * GET /api/auth/verify/:token
 * Verificar email
 */
router.get( '/verify/:token', async ( req, res ) =>
{
  try
  {
    const { token } = req.params;

    // Verificar token
    const decoded = jwt.verify( token, process.env.JWT_SECRET || 'secret_key' );

    if ( decoded.type !== 'email_verification' )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Token inválido'
      } );
    }

    // Verificar se usuário existe
    const users = await db.query( `
      SELECT id, email, email_verified_at
      FROM users
      WHERE id = ?
    `, [ decoded.userId ] );

    if ( users.length === 0 )
    {
      return res.status( 404 ).json( {
        success: false,
        error: 'Usuário não encontrado'
      } );
    }

    const user = users[ 0 ];

    // Se já verificado
    if ( user.email_verified_at )
    {
      return res.json( {
        success: true,
        message: 'Email já verificado anteriormente'
      } );
    }

    // Marcar email como verificado
    await db.query( `
      UPDATE users
      SET email_verified_at = NOW(), updated_at = NOW()
      WHERE id = ?
    `, [ user.id ] );

    // Log da ação
    await db.query( `
      INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'email_verified', 'Email verificado com sucesso', ?, NOW())
    `, [ user.id, req.ip ] );

    res.json( {
      success: true,
      message: 'Email verificado com sucesso'
    } );

  } catch ( error )
  {
    console.error( '❌ Erro ao verificar email:', error );

    if ( error.name === 'JsonWebTokenError' )
    {
      return res.status( 400 ).json( {
        success: false,
        error: 'Token inválido'
      } );
    }

    res.status( 500 ).json( {
      success: false,
      error: 'Erro interno do servidor'
    } );
  }
} );

module.exports = router;
