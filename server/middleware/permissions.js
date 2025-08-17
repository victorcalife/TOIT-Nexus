const DatabaseService = require('../services/DatabaseService');

const db = new DatabaseService();

// Definição de permissões do sistema
const PERMISSIONS = {
  // Usuários
  'users.view': 'Visualizar usuários',
  'users.create': 'Criar usuários',
  'users.edit': 'Editar usuários',
  'users.delete': 'Deletar usuários',
  'users.manage_roles': 'Gerenciar roles de usuários',
  'users.manage_permissions': 'Gerenciar permissões',
  
  // Tenants
  'tenants.view': 'Visualizar tenants',
  'tenants.create': 'Criar tenants',
  'tenants.edit': 'Editar tenants',
  'tenants.delete': 'Deletar tenants',
  'tenants.manage': 'Gerenciar configurações de tenant',
  
  // Sistema
  'system.admin': 'Administração do sistema',
  'system.logs': 'Visualizar logs do sistema',
  'system.settings': 'Configurações do sistema',
  'system.backup': 'Backup e restore',
  
  // Chat
  'chat.view': 'Visualizar chat',
  'chat.send': 'Enviar mensagens',
  'chat.moderate': 'Moderar chat',
  'chat.admin': 'Administrar chat',
  
  // Email
  'email.view': 'Visualizar emails',
  'email.send': 'Enviar emails',
  'email.manage': 'Gerenciar emails',
  'email.admin': 'Administrar sistema de email',
  
  // Calendário
  'calendar.view': 'Visualizar calendário',
  'calendar.create': 'Criar eventos',
  'calendar.edit': 'Editar eventos',
  'calendar.delete': 'Deletar eventos',
  'calendar.manage': 'Gerenciar calendários',
  
  // Relatórios
  'reports.view': 'Visualizar relatórios',
  'reports.create': 'Criar relatórios',
  'reports.edit': 'Editar relatórios',
  'reports.delete': 'Deletar relatórios',
  'reports.export': 'Exportar relatórios',
  
  // Workflows
  'workflows.view': 'Visualizar workflows',
  'workflows.create': 'Criar workflows',
  'workflows.edit': 'Editar workflows',
  'workflows.delete': 'Deletar workflows',
  'workflows.execute': 'Executar workflows',
  
  // Quantum
  'quantum.access': 'Acessar funcionalidades quânticas',
  'quantum.admin': 'Administrar sistema quântico',
  
  // MILA
  'mila.access': 'Acessar MILA',
  'mila.admin': 'Administrar MILA'
};

// Roles padrão do sistema
const DEFAULT_ROLES = {
  'super_admin': {
    name: 'Super Administrador',
    description: 'Acesso total ao sistema',
    permissions: Object.keys(PERMISSIONS)
  },
  'admin': {
    name: 'Administrador',
    description: 'Administrador de tenant',
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.manage_roles',
      'chat.view', 'chat.send', 'chat.moderate',
      'email.view', 'email.send', 'email.manage',
      'calendar.view', 'calendar.create', 'calendar.edit', 'calendar.delete',
      'reports.view', 'reports.create', 'reports.edit', 'reports.export',
      'workflows.view', 'workflows.create', 'workflows.edit', 'workflows.execute',
      'quantum.access', 'mila.access'
    ]
  },
  'manager': {
    name: 'Gerente',
    description: 'Gerente de equipe',
    permissions: [
      'users.view',
      'chat.view', 'chat.send', 'chat.moderate',
      'email.view', 'email.send',
      'calendar.view', 'calendar.create', 'calendar.edit',
      'reports.view', 'reports.create', 'reports.export',
      'workflows.view', 'workflows.create', 'workflows.execute',
      'quantum.access', 'mila.access'
    ]
  },
  'user': {
    name: 'Usuário',
    description: 'Usuário padrão',
    permissions: [
      'chat.view', 'chat.send',
      'email.view', 'email.send',
      'calendar.view', 'calendar.create', 'calendar.edit',
      'reports.view',
      'workflows.view', 'workflows.execute',
      'quantum.access', 'mila.access'
    ]
  },
  'viewer': {
    name: 'Visualizador',
    description: 'Apenas visualização',
    permissions: [
      'chat.view',
      'email.view',
      'calendar.view',
      'reports.view',
      'workflows.view'
    ]
  }
};

/**
 * Middleware para verificar permissões
 */
function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Super admin tem todas as permissões
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Verificar se usuário tem a permissão
      const hasPermission = await checkUserPermission(req.user.id, permission, req.user.tenantId);
      
      if (!hasPermission) {
        console.log(`❌ Permissão negada: ${req.user.email} tentou acessar ${permission}`);
        
        // Log de auditoria
        await db.query(`
          INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
          VALUES (?, 'permission_denied', ?, ?, NOW())
        `, [req.user.id, JSON.stringify({ 
          permission, 
          endpoint: req.originalUrl,
          method: req.method 
        }), req.ip]);

        return res.status(403).json({
          success: false,
          error: 'Permissão insuficiente',
          required: permission
        });
      }

      next();
    } catch (error) {
      console.error('❌ Erro na verificação de permissão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
}

/**
 * Middleware para verificar múltiplas permissões (OR)
 */
function requireAnyPermission(permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Super admin tem todas as permissões
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Verificar se usuário tem pelo menos uma das permissões
      for (const permission of permissions) {
        const hasPermission = await checkUserPermission(req.user.id, permission, req.user.tenantId);
        if (hasPermission) {
          return next();
        }
      }

      console.log(`❌ Permissões negadas: ${req.user.email} tentou acessar ${permissions.join(' ou ')}`);
      
      // Log de auditoria
      await db.query(`
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, 'permissions_denied', ?, ?, NOW())
      `, [req.user.id, JSON.stringify({ 
        permissions, 
        endpoint: req.originalUrl,
        method: req.method 
      }), req.ip]);

      return res.status(403).json({
        success: false,
        error: 'Permissão insuficiente',
        required: permissions
      });
    } catch (error) {
      console.error('❌ Erro na verificação de permissões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
}

/**
 * Middleware para verificar múltiplas permissões (AND)
 */
function requireAllPermissions(permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      // Super admin tem todas as permissões
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Verificar se usuário tem todas as permissões
      for (const permission of permissions) {
        const hasPermission = await checkUserPermission(req.user.id, permission, req.user.tenantId);
        if (!hasPermission) {
          console.log(`❌ Permissão negada: ${req.user.email} não tem ${permission}`);
          
          // Log de auditoria
          await db.query(`
            INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
            VALUES (?, 'permission_denied', ?, ?, NOW())
          `, [req.user.id, JSON.stringify({ 
            permission, 
            endpoint: req.originalUrl,
            method: req.method 
          }), req.ip]);

          return res.status(403).json({
            success: false,
            error: 'Permissão insuficiente',
            required: permission
          });
        }
      }

      next();
    } catch (error) {
      console.error('❌ Erro na verificação de permissões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
}

/**
 * Verificar se usuário tem uma permissão específica
 */
async function checkUserPermission(userId, permission, tenantId = null) {
  try {
    // Buscar role do usuário
    const users = await db.query(`
      SELECT role FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return false;
    }

    const userRole = users[0].role;

    // Super admin tem todas as permissões
    if (userRole === 'super_admin') {
      return true;
    }

    // Verificar permissões customizadas do usuário
    const customPermissions = await db.query(`
      SELECT permission FROM user_permissions 
      WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)
    `, [userId, tenantId]);

    const userPermissions = customPermissions.map(p => p.permission);

    // Verificar se tem permissão customizada
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Verificar permissões do role padrão
    const rolePermissions = DEFAULT_ROLES[userRole]?.permissions || [];
    return rolePermissions.includes(permission);

  } catch (error) {
    console.error('❌ Erro ao verificar permissão:', error);
    return false;
  }
}

/**
 * Obter todas as permissões de um usuário
 */
async function getUserPermissions(userId, tenantId = null) {
  try {
    // Buscar role do usuário
    const users = await db.query(`
      SELECT role FROM users WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return [];
    }

    const userRole = users[0].role;

    // Super admin tem todas as permissões
    if (userRole === 'super_admin') {
      return Object.keys(PERMISSIONS);
    }

    // Permissões do role
    const rolePermissions = DEFAULT_ROLES[userRole]?.permissions || [];

    // Permissões customizadas
    const customPermissions = await db.query(`
      SELECT permission FROM user_permissions 
      WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)
    `, [userId, tenantId]);

    const userCustomPermissions = customPermissions.map(p => p.permission);

    // Combinar e remover duplicatas
    const allPermissions = [...new Set([...rolePermissions, ...userCustomPermissions])];

    return allPermissions;

  } catch (error) {
    console.error('❌ Erro ao obter permissões:', error);
    return [];
  }
}

/**
 * Middleware para isolamento de tenant
 */
function requireTenant(req, res, next) {
  try {
    // Super admin pode acessar qualquer tenant
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Verificar se usuário pertence ao tenant
    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        error: 'Usuário não pertence a nenhum tenant'
      });
    }

    // Adicionar filtro de tenant nas queries
    req.tenantFilter = `AND tenant_id = ${req.user.tenantId}`;
    req.tenantId = req.user.tenantId;

    next();
  } catch (error) {
    console.error('❌ Erro no middleware de tenant:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

/**
 * Verificar se usuário pode acessar recurso de outro usuário
 */
function canAccessUserResource(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.userId || req.params.id);
    const currentUserId = req.user.id;

    // Usuário pode acessar seus próprios recursos
    if (targetUserId === currentUserId) {
      return next();
    }

    // Verificar se tem permissão administrativa
    if (['super_admin', 'admin', 'manager'].includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Acesso negado ao recurso'
    });

  } catch (error) {
    console.error('❌ Erro na verificação de acesso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

module.exports = {
  PERMISSIONS,
  DEFAULT_ROLES,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  checkUserPermission,
  getUserPermissions,
  requireTenant,
  canAccessUserResource
};
