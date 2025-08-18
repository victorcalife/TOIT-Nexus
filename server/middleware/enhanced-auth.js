/**
 * MIDDLEWARE DE AUTENTICAÇÃO APRIMORADO
 * Integra JWT, blacklist, sessões ativas e renovação automática
 * 100% JavaScript - SEM TYPESCRIPT
 */

const jwt = require('jsonwebtoken');
const { db } = require('../database-config');
const { tokenBlacklistService } = require('../services/TokenBlacklistService');
const { authSystem } = require('../auth-system');

/**
 * MIDDLEWARE DE AUTENTICAÇÃO PRINCIPAL
 */
const enhancedAuth = (options = {}) => {
  const {
    required = true,
    autoRefresh = true,
    trackSession = true,
    checkBlacklist = true
  } = options;

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      // Se token não fornecido
      if (!token) {
        if (required) {
          return res.status(401).json({
            success: false,
            error: 'Token de acesso requerido',
            code: 'AUTH_REQUIRED'
          });
        }
        return next(); // Opcional, continuar sem auth
      }

      // Verificar blacklist
      if (checkBlacklist) {
        const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
        if (isBlacklisted) {
          return res.status(401).json({
            success: false,
            error: 'Token revogado',
            code: 'TOKEN_REVOKED'
          });
        }
      }

      // Verificar e decodificar token
      let decoded;
      try {
        decoded = authSystem.verifyToken(token);
      } catch (error) {
        if (error.message === 'Token expirado' && autoRefresh) {
          // Tentar renovação automática
          return await handleTokenRefresh(req, res, next, token);
        }

        return res.status(401).json({
          success: false,
          error: error.message,
          code: error.message === 'Token expirado' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
        });
      }

      // Buscar usuário atualizado
      const user = await authSystem.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não encontrado ou inativo',
          code: 'USER_NOT_FOUND'
        });
      }

      // Registrar sessão ativa
      if (trackSession) {
        tokenBlacklistService.registerActiveSession(user.id, token);
        await updateSessionActivity(user.id, token, req);
      }

      // Adicionar informações ao request
      req.user = user;
      req.token = token;
      req.auth = {
        method: 'jwt',
        decoded,
        isRefreshed: false
      };

      next();

    } catch (error) {
      console.error('❌ Erro no middleware de autenticação:', error);
      
      if (required) {
        return res.status(500).json({
          success: false,
          error: 'Erro interno de autenticação',
          code: 'AUTH_ERROR'
        });
      }
      
      next(); // Continuar se opcional
    }
  };
};

/**
 * LIDAR COM RENOVAÇÃO AUTOMÁTICA DE TOKEN
 */
async function handleTokenRefresh(req, res, next, expiredToken) {
  try {
    // Buscar refresh token nos cookies ou header
    const refreshToken = req.cookies?.refreshToken || 
                        req.headers['x-refresh-token'];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Token expirado e refresh token não fornecido',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // Renovar tokens
    const { accessToken, refreshToken: newRefreshToken } = 
      await authSystem.refreshTokens(refreshToken);

    // Blacklist do token expirado
    await tokenBlacklistService.blacklistToken(expiredToken, 'auto_refresh');

    // Buscar usuário para o request
    const decoded = authSystem.verifyToken(accessToken);
    const user = await authSystem.getUserById(decoded.userId);

    // Configurar response headers com novos tokens
    res.setHeader('X-New-Access-Token', accessToken);
    res.setHeader('X-New-Refresh-Token', newRefreshToken);

    // Atualizar cookies se estavam sendo usados
    if (req.cookies?.refreshToken) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      };

      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000 // 1 hora
      });

      res.cookie('refreshToken', newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
      });
    }

    // Adicionar ao request
    req.user = user;
    req.token = accessToken;
    req.auth = {
      method: 'jwt',
      decoded,
      isRefreshed: true,
      newTokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    };

    console.log(`🔄 Token renovado automaticamente para usuário: ${user.email}`);
    next();

  } catch (error) {
    console.error('❌ Erro na renovação automática:', error);
    return res.status(401).json({
      success: false,
      error: 'Falha na renovação do token',
      code: 'REFRESH_FAILED'
    });
  }
}

/**
 * ATUALIZAR ATIVIDADE DA SESSÃO
 */
async function updateSessionActivity(userId, token, req) {
  try {
    const tokenHash = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');

    await db.query(`
      UPDATE active_sessions 
      SET 
        last_activity = NOW(),
        ip_address = $1,
        user_agent = $2
      WHERE user_id = $3 AND token_hash = $4
    `, [
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent') || 'Unknown',
      userId,
      tokenHash
    ]);

  } catch (error) {
    console.error('❌ Erro ao atualizar atividade da sessão:', error);
    // Não falhar a requisição por isso
  }
}

/**
 * MIDDLEWARE PARA VERIFICAR ROLES
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Super admin sempre tem acesso
    if (userRole === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado - permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

/**
 * MIDDLEWARE PARA VERIFICAR PERMISSÕES ESPECÍFICAS
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        code: 'AUTH_REQUIRED'
      });
    }

    // Super admin sempre tem todas as permissões
    if (req.user.role === 'super_admin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission) && !userPermissions.includes('*')) {
      return res.status(403).json({
        success: false,
        error: `Permissão '${permission}' requerida`,
        code: 'PERMISSION_DENIED',
        required: permission,
        available: userPermissions
      });
    }

    next();
  };
};

/**
 * MIDDLEWARE PARA VERIFICAR TENANT
 */
const requireTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Usuário não autenticado',
      code: 'AUTH_REQUIRED'
    });
  }

  // Super admin pode acessar qualquer tenant
  if (req.user.role === 'super_admin') {
    return next();
  }

  if (!req.user.tenant_id) {
    return res.status(403).json({
      success: false,
      error: 'Usuário não pertence a nenhum tenant',
      code: 'NO_TENANT'
    });
  }

  // Adicionar filtro de tenant
  req.tenantId = req.user.tenant_id;
  req.tenantFilter = `tenant_id = '${req.user.tenant_id}'`;

  next();
};

/**
 * MIDDLEWARE DE LOGOUT SEGURO
 */
const secureLogout = async (req, res, next) => {
  try {
    const token = req.token;
    const user = req.user;

    if (token && user) {
      // Adicionar token à blacklist
      await tokenBlacklistService.blacklistToken(token, 'logout');

      // Registrar logout
      await db.query(`
        INSERT INTO login_attempts (identifier, ip_address, user_agent, success, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [
        user.email || user.cpf,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent') || 'Unknown',
        true
      ]);

      console.log(`👋 Logout seguro realizado: ${user.email}`);
    }

    next();

  } catch (error) {
    console.error('❌ Erro no logout seguro:', error);
    next(); // Continuar mesmo com erro
  }
};

module.exports = {
  enhancedAuth,
  requireRole,
  requirePermission,
  requireTenant,
  secureLogout,
  
  // Aliases para compatibilidade
  requireAuth: (options = {}) => enhancedAuth({ ...options, required: true }),
  optionalAuth: (options = {}) => enhancedAuth({ ...options, required: false })
};
