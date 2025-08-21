/**
 * SISTEMA DE AUTENTICAÇÃO ROBUSTO E UNIFICADO
 * JWT + Sessions + Refresh Tokens + Roles + Permissões
 * 100% JavaScript - SEM TYPESCRIPT
 */

const jwt = require( 'jsonwebtoken' );
const bcrypt = require( 'bcryptjs' );
const crypto = require( 'crypto' );
const { db } = require( './database-config' );

// Configurações JWT
const JWT_SECRET = process.env.JWT_SECRET || 'toit_nexus_super_secret_key_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'toit_nexus_refresh_secret_2024';
const JWT_EXPIRES_IN = '1h';
const REFRESH_EXPIRES_IN = '7d';

/**
 * CLASSE PRINCIPAL DE AUTENTICAÇÃO
 */
class AuthSystem
{
  constructor()
  {
    this.db = db;
  }

  /**
   * AUTENTICAR USUÁRIO (LOGIN)
   */
  async authenticateUser( email, password, cpf = null )
  {
    try
    {
      console.log( `🔐 Tentativa de login: ${ email || cpf }` );
      console.log( `🔐 [AUTH-SYSTEM] Parâmetros: email=${ email }, cpf=${ cpf }, password_length=${ password?.length }` );

      // Buscar usuário por email ou CPF
      let query, params;
      if ( email )
      {
        query = `
          SELECT
            u.id, u.name, u.email, u.cpf,
            u.password_hash, u.role, u.permissions, u.is_active,
            u.tenant_id, u.last_login, u.login_count,
            t.name as tenant_name, t.slug as tenant_slug, t.status as tenant_status
          FROM users u
          LEFT JOIN tenants t ON u.tenant_id = t.id
          WHERE u.email = $1 AND u.is_active = true
        `;
        params = [ email ];
      } else if ( cpf )
      {
        query = `
          SELECT
            u.id, u.name, u.email, u.cpf,
            u.password_hash, u.role, u.permissions, u.is_active,
            u.tenant_id, u.last_login, u.login_count,
            t.name as tenant_name, t.slug as tenant_slug, t.status as tenant_status
          FROM users u
          LEFT JOIN tenants t ON u.tenant_id = t.id
          WHERE u.cpf = $1 AND u.is_active = true
        `;
        params = [ cpf ];
      } else
      {
        throw new Error( 'Email ou CPF é obrigatório' );
      }

      const result = await this.db.query( query, params );

      if ( result.rows.length === 0 )
      {
        console.log( `❌ Usuário não encontrado: ${ email || cpf }` );
        return null;
      }

      const user = result.rows[ 0 ];

      // Verificar se tenant está ativo
      if ( user.tenant_status !== 'active' )
      {
        console.log( `❌ Tenant inativo: ${ user.tenant_slug }` );
        throw new Error( 'Organização inativa ou suspensa' );
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare( password, user.password_hash );
      if ( !isValidPassword )
      {
        console.log( `❌ Senha inválida para: ${ email || cpf }` );
        return null;
      }

      // Atualizar último login
      await this.updateLastLogin( user.id );

      console.log( `✅ Login bem-sucedido: ${ email || cpf } (${ user.role })` );
      return this.sanitizeUser( user );

    } catch ( error )
    {
      console.error( '❌ Erro na autenticação:', error.message );
      throw error;
    }
  }

  /**
   * GERAR TOKENS JWT
   */
  generateTokens( user )
  {
    const payload = {
      userId: user.id,
      email: user.email,
      cpf: user.cpf,
      role: user.role,
      tenantId: user.tenant_id,
      tenantSlug: user.tenant_slug,
      permissions: user.permissions || [],
      isSuperAdmin: user.role === 'super_admin',
      isTenantAdmin: user.role === 'tenant_admin'
    };

    const accessToken = jwt.sign( payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'toit-nexus',
      audience: 'toit-users'
    } );

    const refreshToken = jwt.sign(
      { userId: user.id, uuid: user.uuid },
      JWT_REFRESH_SECRET,
      {
        expiresIn: REFRESH_EXPIRES_IN,
        issuer: 'toit-nexus'
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * VERIFICAR TOKEN JWT
   */
  verifyToken( token )
  {
    try
    {
      return jwt.verify( token, JWT_SECRET );
    } catch ( error )
    {
      if ( error.name === 'TokenExpiredError' )
      {
        throw new Error( 'Token expirado' );
      } else if ( error.name === 'JsonWebTokenError' )
      {
        throw new Error( 'Token inválido' );
      }
      throw error;
    }
  }

  /**
   * VERIFICAR REFRESH TOKEN
   */
  verifyRefreshToken( token )
  {
    try
    {
      return jwt.verify( token, JWT_REFRESH_SECRET );
    } catch ( error )
    {
      throw new Error( 'Refresh token inválido ou expirado' );
    }
  }

  /**
   * RENOVAR TOKENS
   */
  async refreshTokens( refreshToken )
  {
    try
    {
      const decoded = this.verifyRefreshToken( refreshToken );

      // Buscar usuário atualizado
      const user = await this.getUserById( decoded.userId );
      if ( !user )
      {
        throw new Error( 'Usuário não encontrado' );
      }

      // Gerar novos tokens
      return this.generateTokens( user );

    } catch ( error )
    {
      console.error( '❌ Erro ao renovar tokens:', error.message );
      throw error;
    }
  }

  /**
   * CRIAR SESSÃO NO BANCO
   */
  async createSession( userId, accessToken, refreshToken, ipAddress, userAgent )
  {
    try
    {
      const expiresAt = new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ); // 7 dias

      const query = `
        INSERT INTO sessions (
          user_id, token, refresh_token, ip_address, user_agent, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
      `;

      const result = await this.db.query( query, [
        userId, accessToken, refreshToken, ipAddress, userAgent, expiresAt
      ] );

      return result.rows[ 0 ];
    } catch ( error )
    {
      console.error( '❌ Erro ao criar sessão:', error.message );
      throw error;
    }
  }

  /**
   * INVALIDAR SESSÃO (LOGOUT)
   */
  async invalidateSession( token )
  {
    try
    {
      const query = `
        DELETE FROM sessions 
        WHERE token = $1 OR refresh_token = $1
      `;

      await this.db.query( query, [ token ] );
      console.log( '🔒 Sessão invalidada com sucesso' );
    } catch ( error )
    {
      console.error( '❌ Erro ao invalidar sessão:', error.message );
    }
  }

  /**
   * BUSCAR USUÁRIO POR ID
   */
  async getUserById( userId )
  {
    try
    {
      const query = `
        SELECT
          u.id, u.name, u.email, u.cpf,
          u.role, u.permissions, u.is_active, u.tenant_id,
          t.name as tenant_name, t.slug as tenant_slug, t.status as tenant_status
        FROM users u
        LEFT JOIN tenants t ON u.tenant_id = t.id
        WHERE u.id = $1 AND u.is_active = true
      `;

      const result = await this.db.query( query, [ userId ] );

      if ( result.rows.length === 0 )
      {
        return null;
      }

      return this.sanitizeUser( result.rows[ 0 ] );
    } catch ( error )
    {
      console.error( '❌ Erro ao buscar usuário:', error.message );
      throw error;
    }
  }

  /**
   * VERIFICAR PERMISSÕES
   */
  hasPermission( user, permission )
  {
    if ( !user || !user.permissions ) return false;

    // Super admin tem todas as permissões
    if ( user.role === 'super_admin' ) return true;

    // Verificar permissão específica
    const permissions = Array.isArray( user.permissions ) ? user.permissions : [];
    return permissions.includes( permission ) || permissions.includes( 'admin.full_access' );
  }

  /**
   * VERIFICAR ROLE
   */
  hasRole( user, roles )
  {
    if ( !user ) return false;

    const allowedRoles = Array.isArray( roles ) ? roles : [ roles ];
    return allowedRoles.includes( user.role );
  }

  /**
   * ATUALIZAR ÚLTIMO LOGIN
   */
  async updateLastLogin( userId )
  {
    try
    {
      const query = `
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1
        WHERE id = $1
      `;

      await this.db.query( query, [ userId ] );
    } catch ( error )
    {
      console.error( '❌ Erro ao atualizar último login:', error.message );
    }
  }

  /**
   * SANITIZAR DADOS DO USUÁRIO
   */
  sanitizeUser( user )
  {
    const { password_hash, ...sanitized } = user;
    return {
      ...sanitized,
      fullName: `${ user.first_name } ${ user.last_name }`.trim(),
      isSuperAdmin: user.role === 'super_admin',
      isTenantAdmin: user.role === 'tenant_admin',
      isManager: user.role === 'manager',
      isUser: user.role === 'user'
    };
  }

  /**
   * HASH DE SENHA
   */
  async hashPassword( password )
  {
    return await bcrypt.hash( password, 12 );
  }

  /**
   * VERIFICAR SENHA
   */
  async verifyPassword( password, hash )
  {
    return await bcrypt.compare( password, hash );
  }

  /**
   * GERAR TOKEN ALEATÓRIO
   */
  generateRandomToken()
  {
    return crypto.randomBytes( 32 ).toString( 'hex' );
  }
}

/**
 * MIDDLEWARES DE AUTENTICAÇÃO
 */

// Middleware obrigatório
const requireAuth = ( authSystem ) =>
{
  return async ( req, res, next ) =>
  {
    try
    {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split( ' ' )[ 1 ]; // Bearer TOKEN

      if ( !token )
      {
        return res.status( 401 ).json( {
          success: false,
          error: 'Token de acesso requerido',
          code: 'AUTH_REQUIRED'
        } );
      }

      // Verificar token
      const decoded = authSystem.verifyToken( token );

      // Buscar usuário atualizado
      const user = await authSystem.getUserById( decoded.userId );
      if ( !user )
      {
        return res.status( 401 ).json( {
          success: false,
          error: 'Usuário não encontrado ou inativo',
          code: 'USER_NOT_FOUND'
        } );
      }

      // Adicionar ao request
      req.user = user;
      req.token = token;
      req.auth = { method: 'jwt', decoded };

      next();

    } catch ( error )
    {
      console.error( '❌ Erro na autenticação:', error.message );

      return res.status( 401 ).json( {
        success: false,
        error: error.message,
        code: error.message.includes( 'expirado' ) ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
      } );
    }
  };
};

// Middleware opcional
const optionalAuth = ( authSystem ) =>
{
  return async ( req, res, next ) =>
  {
    try
    {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split( ' ' )[ 1 ];

      if ( token )
      {
        const decoded = authSystem.verifyToken( token );
        const user = await authSystem.getUserById( decoded.userId );

        if ( user )
        {
          req.user = user;
          req.token = token;
          req.auth = { method: 'jwt', decoded };
        }
      }

      next();
    } catch ( error )
    {
      // Em caso de erro, continua sem autenticação
      next();
    }
  };
};

// Middleware de role
const requireRole = ( roles ) =>
{
  return ( req, res, next ) =>
  {
    if ( !req.user )
    {
      return res.status( 401 ).json( {
        success: false,
        error: 'Usuário não autenticado',
        code: 'AUTH_REQUIRED'
      } );
    }

    const allowedRoles = Array.isArray( roles ) ? roles : [ roles ];

    if ( !allowedRoles.includes( req.user.role ) )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado - permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      } );
    }

    next();
  };
};

// Middleware de permissão
const requirePermission = ( permission ) =>
{
  return ( req, res, next ) =>
  {
    if ( !req.user )
    {
      return res.status( 401 ).json( {
        success: false,
        error: 'Usuário não autenticado',
        code: 'AUTH_REQUIRED'
      } );
    }

    const authSystem = new AuthSystem();

    if ( !authSystem.hasPermission( req.user, permission ) )
    {
      return res.status( 403 ).json( {
        success: false,
        error: 'Acesso negado - permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permission,
        userPermissions: req.user.permissions
      } );
    }

    next();
  };
};

// Instância global
const authSystem = new AuthSystem();

module.exports = {
  AuthSystem,
  authSystem,
  requireAuth,
  optionalAuth,
  requireRole,
  requirePermission,

  // Middlewares prontos para uso
  requireSuperAdmin: requireRole( [ 'super_admin' ] ),
  requireTenantAdmin: requireRole( [ 'super_admin', 'tenant_admin' ] ),
  requireManager: requireRole( [ 'super_admin', 'tenant_admin', 'manager' ] ),
  requireAnyUser: requireRole( [ 'super_admin', 'tenant_admin', 'manager', 'user' ] )
};
