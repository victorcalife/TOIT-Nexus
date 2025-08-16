import { authService } from './authService.js';

/**
 * Middleware de autenticação
 * Verifica se usuário está logado e tem acesso
 */
export const requireAuth = (req, res, next) => {
  try {
    // Verificar se existe sessão
    if (!req.session || !req.session.user) {
      return res.status(401).json({ 
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Adicionar usuário ao request
    req.user = req.session.user;
    next();

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware para verificar role específica
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      // Converter para array se for string
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Acesso negado',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: roles,
          current: req.user.role
        });
      }

      next();

    } catch (error) {
      console.error('Erro no middleware de role:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware para super admin apenas
 */
export const requireSuperAdmin = requireRole('super_admin');

/**
 * Middleware para admins (super_admin ou tenant_admin)
 */
export const requireAdmin = requireRole(['super_admin', 'tenant_admin']);

/**
 * Middleware para verificar acesso ao tenant
 * Usuários só podem acessar dados do próprio tenant
 */
export const requireTenantAccess = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Super admin pode acessar qualquer tenant
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Verificar se usuário tem tenant
    if (!req.user.tenantId) {
      return res.status(403).json({ 
        error: 'Usuário não possui empresa associada',
        code: 'NO_TENANT'
      });
    }

    // Adicionar filtro de tenant ao request
    req.tenantId = req.user.tenantId;
    next();

  } catch (error) {
    console.error('Erro no middleware de tenant:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Não bloqueia se não estiver autenticado, mas adiciona user se estiver
 */
export const optionalAuth = (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      req.user = req.session.user;
    }
    next();
  } catch (error) {
    console.error('Erro no middleware opcional de auth:', error);
    next(); // Continua mesmo com erro
  }
};

/**
 * Middleware para limpar sessão expirada
 */
export const cleanExpiredSession = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      // Verificar se usuário ainda tem acesso
      const hasAccess = await authService.hasSystemAccess(req.session.user.id);
      
      if (!hasAccess) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Erro ao destruir sessão:', err);
          }
        });
        req.user = null;
      }
    }
    next();
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
    next(); // Continua mesmo com erro
  }
};