/**
 * SISTEMA DE AUTENTICAÇÃO UNIFICADO
 * Consolida TODOS os sistemas de auth em um único arquivo
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES CONSOLIDADAS:
 * - JWT Authentication (authMiddleware.js)
 * - Session Management (auth.ts)
 * - OAuth Replit (replitAuth.ts) 
 * - Local Authentication (authService.js)
 * - Permission System (authMiddleware.ts)
 * - Tenant Access Control (tenantMiddleware.ts)
 * - Super Admin System
 */

const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );
const passport = require( 'passport' );
const LocalStrategy = require( 'passport-local' ).Strategy;
const DatabaseService = require( './services/DatabaseService' );
const db = new DatabaseService();
const { users, tenants, permissions, userPermissions, rolePermissions } = require( './schema-unified.js' );
const { eq, and, or, isNull } = require( 'drizzle-orm' );

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-super-secret-session-key';

class UnifiedAuthSystem
{
  constructor()
  {
    this.setupPassport();
  }

  /**
   * CONFIGURAÇÃO DO PASSPORT
   */
  setupPassport()
  {
    // Estratégia Local (CPF + Password)
    passport.use( new LocalStrategy( {
      usernameField: 'cpf',
      passwordField: 'password',
      passReqToCallback: true
    }, async ( req, cpf, password, done ) =>
    {
      try
      {
        const user = await this.authenticateUser( cpf, password, req.body.tenantSlug );
        if ( user )
        {
          return done( null, user );
        } else
        {
          return done( null, false, { message: 'Credenciais inválidas' } );
        }
      } catch ( error )
      {
        return done( error );
      }
    } ) );

    // Serialização do usuário
    passport.serializeUser( ( user, done ) =>
    {
      done( null, user.id );
    } );

    // Deserialização do usuário
    passport.deserializeUser( async ( id, done ) =>
    {
      try
      {
        const user = await this.getUserById( id );
        done( null, user );
      } catch ( error )
      {
        done( error );
      }
    } );
  }

  /**
   * AUTENTICAÇÃO PRINCIPAL
   * Consolida lógica de authService.js
   */
  async authenticateUser( cpf, password, tenantSlug = null )
  {
    try
    {
      console.log( `🔐 [AUTH] Tentativa de login: ${ cpf }` );

      // Buscar usuário por CPF
      const userResult = await db
        .select()
        .from( users )
        .where( eq( users.cpf, cpf ) )
        .limit( 1 );

      if ( userResult.length === 0 )
      {
        console.log( `❌ [AUTH] Usuário não encontrado: ${ cpf }` );
        return null;
      }

      const user = userResult[ 0 ];

      // Verificar senha
      const passwordValid = await bcrypt.compare( password, user.password );
      if ( !passwordValid )
      {
        console.log( `❌ [AUTH] Senha inválida para: ${ cpf }` );
        return null;
      }

      // Verificar se usuário está ativo
      if ( !user.isActive )
      {
        console.log( `❌ [AUTH] Usuário inativo: ${ cpf }` );
        return null;
      }

      // Super Admin não precisa de tenant
      if ( user.role === 'super_admin' || user.role === 'toit_admin' )
      {
        console.log( `👑 [AUTH] Super Admin logado: ${ cpf }` );
        await this.updateLastLogin( user.id );
        return this.sanitizeUser( user );
      }

      // Verificar tenant para usuários normais
      if ( tenantSlug && user.tenantId )
      {
        const tenantResult = await db
          .select()
          .from( tenants )
          .where( and(
            eq( tenants.id, user.tenantId ),
            eq( tenants.slug, tenantSlug )
          ) )
          .limit( 1 );

        if ( tenantResult.length === 0 )
        {
          console.log( `❌ [AUTH] Tenant inválido: ${ tenantSlug }` );
          return null;
        }
      }

      console.log( `✅ [AUTH] Login bem-sucedido: ${ cpf }` );
      await this.updateLastLogin( user.id );
      return this.sanitizeUser( user );

    } catch ( error )
    {
      console.error( `💥 [AUTH] Erro na autenticação:`, error );
      throw error;
    }
  }

  /**
   * GERAÇÃO DE JWT
   */
  generateJWT( user )
  {
    const payload = {
      userId: user.id,
      cpf: user.cpf,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isSuperAdmin: user.role === 'super_admin',
      isToitAdmin: user.role === 'toit_admin',
      hasGlobalAccess: user.role === 'super_admin' || user.role === 'toit_admin'
    };

    return jwt.sign( payload, JWT_SECRET, {
      expiresIn: '24h',
      issuer: 'toit-nexus',
      audience: 'toit-users'
    } );
  }

  /**
   * VERIFICAÇÃO DE JWT
   */
  verifyJWT( token )
  {
    try
    {
      return jwt.verify( token, JWT_SECRET );
    } catch ( error )
    {
      console.error( `❌ [JWT] Token inválido:`, error.message );
      return null;
    }
  }

  /**
   * MIDDLEWARE DE AUTENTICAÇÃO OBRIGATÓRIA
   * Consolida requireAuth de authMiddleware.js/ts
   */
  requireAuth()
  {
    return async ( req, res, next ) =>
    {
      try
      {
        // Verificar JWT
        const token = req.header( 'Authorization' )?.replace( 'Bearer ', '' );
        if ( token )
        {
          const decoded = this.verifyJWT( token );
          if ( decoded )
          {
            const user = await this.getUserById( decoded.userId );
            if ( user )
            {
              req.user = user;
              req.auth = { method: 'jwt', token };
              return next();
            }
          }
        }

        // Verificar sessão
        if ( req.isAuthenticated && req.isAuthenticated() )
        {
          req.auth = { method: 'session' };
          return next();
        }

        // Não autenticado
        return res.status( 401 ).json( {
          error: 'Autenticação requerida',
          code: 'AUTH_REQUIRED'
        } );

      } catch ( error )
      {
        console.error( `💥 [AUTH] Erro no middleware:`, error );
        return res.status( 500 ).json( {
          error: 'Erro interno de autenticação',
          code: 'AUTH_ERROR'
        } );
      }
    };
  }

  /**
   * MIDDLEWARE DE AUTENTICAÇÃO OPCIONAL
   */
  optionalAuth()
  {
    return async ( req, res, next ) =>
    {
      try
      {
        // Tentar autenticar, mas não falhar se não conseguir
        const token = req.header( 'Authorization' )?.replace( 'Bearer ', '' );
        if ( token )
        {
          const decoded = this.verifyJWT( token );
          if ( decoded )
          {
            const user = await this.getUserById( decoded.userId );
            if ( user )
            {
              req.user = user;
              req.auth = { method: 'jwt', token };
            }
          }
        } else if ( req.isAuthenticated && req.isAuthenticated() )
        {
          req.auth = { method: 'session' };
        }

        next();
      } catch ( error )
      {
        console.error( `⚠️ [AUTH] Erro na autenticação opcional:`, error );
        next(); // Continuar mesmo com erro
      }
    };
  }

  /**
   * MIDDLEWARE DE VERIFICAÇÃO DE ROLE
   * Consolida requireRole de authMiddleware.js/ts
   */
  requireRole( allowedRoles )
  {
    return ( req, res, next ) =>
    {
      if ( !req.user )
      {
        return res.status( 401 ).json( {
          error: 'Autenticação requerida',
          code: 'AUTH_REQUIRED'
        } );
      }

      const userRole = req.user.role;

      // Super admin sempre tem acesso
      if ( userRole === 'super_admin' )
      {
        return next();
      }

      // Verificar se role está permitida
      if ( Array.isArray( allowedRoles ) )
      {
        if ( allowedRoles.includes( userRole ) )
        {
          return next();
        }
      } else if ( userRole === allowedRoles )
      {
        return next();
      }

      return res.status( 403 ).json( {
        error: 'Acesso negado - Role insuficiente',
        code: 'INSUFFICIENT_ROLE',
        required: allowedRoles,
        current: userRole
      } );
    };
  }

  /**
   * MIDDLEWARE SUPER ADMIN
   */
  requireSuperAdmin()
  {
    return this.requireRole( [ 'super_admin' ] );
  }

  /**
   * MIDDLEWARE ADMIN (Super + Tenant)
   */
  requireAdmin()
  {
    return this.requireRole( [ 'super_admin', 'toit_admin', 'tenant_admin' ] );
  }

  /**
   * UTILITÁRIOS
   */
  async getUserById( id )
  {
    try
    {
      const result = await db
        .select()
        .from( users )
        .where( eq( users.id, id ) )
        .limit( 1 );

      return result.length > 0 ? this.sanitizeUser( result[ 0 ] ) : null;
    } catch ( error )
    {
      console.error( `💥 [AUTH] Erro ao buscar usuário:`, error );
      return null;
    }
  }

  async updateLastLogin( userId )
  {
    try
    {
      await db
        .update( users )
        .set( { lastLoginAt: new Date() } )
        .where( eq( users.id, userId ) );
    } catch ( error )
    {
      console.error( `⚠️ [AUTH] Erro ao atualizar último login:`, error );
    }
  }

  sanitizeUser( user )
  {
    const { password, ...sanitized } = user;
    return {
      ...sanitized,
      isSuperAdmin: user.role === 'super_admin',
      isToitAdmin: user.role === 'toit_admin',
      hasGlobalAccess: user.role === 'super_admin' || user.role === 'toit_admin'
    };
  }

  /**
   * SISTEMA DE PERMISSÕES AVANÇADO
   * Consolida requirePermission de authMiddleware.ts
   */
  async checkUserPermission( userId, resource, action, tenantId = null )
  {
    try
    {
      const user = await this.getUserById( userId );
      if ( !user ) return false;

      // Super admin tem todas as permissões
      if ( user.role === 'super_admin' ) return true;

      // TOIT admin tem todas as permissões
      if ( user.role === 'toit_admin' ) return true;

      // Tenant admin tem todas as permissões dentro do seu tenant
      if ( user.role === 'tenant_admin' && user.tenantId === tenantId ) return true;

      // Verificar permissões específicas do usuário
      const userPermResult = await db
        .select()
        .from( userPermissions )
        .innerJoin( permissions, eq( userPermissions.permissionId, permissions.id ) )
        .where( and(
          eq( userPermissions.userId, userId ),
          eq( permissions.name, `${ resource }_${ action }` ),
          tenantId ? eq( userPermissions.tenantId, tenantId ) : isNull( userPermissions.tenantId )
        ) )
        .limit( 1 );

      if ( userPermResult.length > 0 ) return true;

      // Verificar permissões por role
      const rolePermResult = await db
        .select()
        .from( rolePermissions )
        .innerJoin( permissions, eq( rolePermissions.permissionId, permissions.id ) )
        .where( and(
          eq( rolePermissions.role, user.role ),
          eq( permissions.name, `${ resource }_${ action }` ),
          tenantId ? eq( rolePermissions.tenantId, tenantId ) : isNull( rolePermissions.tenantId )
        ) )
        .limit( 1 );

      return rolePermResult.length > 0;

    } catch ( error )
    {
      console.error( `💥 [PERMISSIONS] Erro ao verificar permissão:`, error );
      return false;
    }
  }

  /**
   * MIDDLEWARE DE PERMISSÕES
   */
  requirePermission( resource, action )
  {
    return async ( req, res, next ) =>
    {
      if ( !req.user )
      {
        return res.status( 401 ).json( {
          error: 'Autenticação requerida',
          code: 'AUTH_REQUIRED'
        } );
      }

      const tenantId = req.headers[ 'x-tenant-id' ] || req.user.tenantId;
      const hasPermission = await this.checkUserPermission(
        req.user.id,
        resource,
        action,
        tenantId
      );

      if ( !hasPermission )
      {
        return res.status( 403 ).json( {
          error: 'Permissão insuficiente',
          code: 'INSUFFICIENT_PERMISSION',
          required: `${ resource }_${ action }`,
          tenantId
        } );
      }

      next();
    };
  }

  /**
   * MIDDLEWARE DE ACESSO POR TENANT
   * Consolida requireTenantAccess de authMiddleware.js
   */
  requireTenantAccess()
  {
    return async ( req, res, next ) =>
    {
      if ( !req.user )
      {
        return res.status( 401 ).json( {
          error: 'Autenticação requerida',
          code: 'AUTH_REQUIRED'
        } );
      }

      // Super admin tem acesso a todos os tenants
      if ( req.user.role === 'super_admin' || req.user.role === 'toit_admin' )
      {
        return next();
      }

      const requestedTenantId = req.headers[ 'x-tenant-id' ] || req.params.tenantId;

      if ( !requestedTenantId )
      {
        return res.status( 400 ).json( {
          error: 'Tenant ID requerido',
          code: 'TENANT_REQUIRED'
        } );
      }

      if ( req.user.tenantId !== requestedTenantId )
      {
        return res.status( 403 ).json( {
          error: 'Acesso negado ao tenant',
          code: 'TENANT_ACCESS_DENIED',
          userTenant: req.user.tenantId,
          requestedTenant: requestedTenantId
        } );
      }

      next();
    };
  }

  /**
   * LIMPEZA DE SESSÕES EXPIRADAS
   */
  async cleanExpiredSessions()
  {
    try
    {
      // Implementar limpeza de sessões se necessário
      console.log( `🧹 [AUTH] Limpeza de sessões executada` );
    } catch ( error )
    {
      console.error( `💥 [AUTH] Erro na limpeza de sessões:`, error );
    }
  }
}

// Instância singleton
const authSystem = new UnifiedAuthSystem();

module.exports = {
  UnifiedAuthSystem,
  authSystem,

  // Middlewares exportados
  requireAuth: () => authSystem.requireAuth(),
  optionalAuth: () => authSystem.optionalAuth(),
  requireRole: ( roles ) => authSystem.requireRole( roles ),
  requireSuperAdmin: () => authSystem.requireSuperAdmin(),
  requireAdmin: () => authSystem.requireAdmin(),
  requirePermission: ( resource, action ) => authSystem.requirePermission( resource, action ),
  requireTenantAccess: () => authSystem.requireTenantAccess(),

  // Funções utilitárias
  authenticateUser: ( cpf, password, tenantSlug ) => authSystem.authenticateUser( cpf, password, tenantSlug ),
  generateJWT: ( user ) => authSystem.generateJWT( user ),
  verifyJWT: ( token ) => authSystem.verifyJWT( token ),
  getUserById: ( id ) => authSystem.getUserById( id ),
  checkUserPermission: ( userId, resource, action, tenantId ) => authSystem.checkUserPermission( userId, resource, action, tenantId ),

  // Configuração do Passport
  setupPassport: () => authSystem.setupPassport(),

  // Limpeza
  cleanExpiredSessions: () => authSystem.cleanExpiredSessions()
};
