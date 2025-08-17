/**
 * TENANT USER SERVICE - Sistema Real de Usuários por Tenant
 * 
 * Gerencia usuários dentro do mesmo tenant, status, permissões e interações
 */

const { nanoid } = require('nanoid');

class TenantUserService {
  constructor() {
    // Em produção, isso seria um banco de dados
    this.tenantUsers = new Map(); // tenantId -> Set of users
    this.userStatus = new Map(); // userId -> status info
    this.userSessions = new Map(); // userId -> session info
    this.userPermissions = new Map(); // userId -> permissions
  }

  /**
   * ADICIONAR USUÁRIO AO TENANT
   */
  async addUserToTenant(tenantId, userData) {
    try {
      if (!this.tenantUsers.has(tenantId)) {
        this.tenantUsers.set(tenantId, new Map());
      }

      const user = {
        id: userData.id || nanoid(),
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        role: userData.role || 'user',
        department: userData.department,
        phone: userData.phone,
        permissions: userData.permissions || ['read'],
        createdAt: new Date(),
        lastLogin: null,
        isActive: true
      };

      this.tenantUsers.get(tenantId).set(user.id, user);

      // Inicializar status
      this.userStatus.set(user.id, {
        status: 'offline',
        lastSeen: new Date(),
        customMessage: '',
        autoAway: true
      });

      console.log(`👤 Usuário ${user.name} adicionado ao tenant ${tenantId}`);
      return user;
    } catch (error) {
      throw new Error(`Erro ao adicionar usuário: ${error.message}`);
    }
  }

  /**
   * OBTER USUÁRIOS DO TENANT
   */
  async getTenantUsers(tenantId, includeOffline = true) {
    try {
      const tenantUserMap = this.tenantUsers.get(tenantId);
      if (!tenantUserMap) {
        return [];
      }

      const users = Array.from(tenantUserMap.values()).map(user => {
        const status = this.userStatus.get(user.id) || { status: 'offline' };
        const session = this.userSessions.get(user.id);

        return {
          ...user,
          status: status.status,
          lastSeen: status.lastSeen,
          customMessage: status.customMessage,
          isOnline: session && session.isActive,
          lastActivity: session?.lastActivity
        };
      });

      // Filtrar offline se necessário
      if (!includeOffline) {
        return users.filter(user => user.isOnline);
      }

      // Ordenar: online primeiro, depois por nome
      return users.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }
  }

  /**
   * ATUALIZAR STATUS DO USUÁRIO
   */
  async updateUserStatus(userId, status, customMessage = '') {
    try {
      const validStatuses = ['online', 'away', 'busy', 'offline'];
      if (!validStatuses.includes(status)) {
        throw new Error('Status inválido');
      }

      const currentStatus = this.userStatus.get(userId) || {};
      
      this.userStatus.set(userId, {
        ...currentStatus,
        status,
        customMessage,
        lastSeen: new Date(),
        lastStatusChange: new Date()
      });

      console.log(`📊 Status do usuário ${userId} atualizado para ${status}`);
      return true;
    } catch (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }
  }

  /**
   * REGISTRAR SESSÃO DO USUÁRIO
   */
  async registerUserSession(userId, sessionData) {
    try {
      this.userSessions.set(userId, {
        sessionId: sessionData.sessionId || nanoid(),
        socketId: sessionData.socketId,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        loginTime: new Date(),
        lastActivity: new Date(),
        isActive: true
      });

      // Atualizar status para online automaticamente
      await this.updateUserStatus(userId, 'online');

      console.log(`🔐 Sessão registrada para usuário ${userId}`);
      return true;
    } catch (error) {
      throw new Error(`Erro ao registrar sessão: ${error.message}`);
    }
  }

  /**
   * ENCERRAR SESSÃO DO USUÁRIO
   */
  async endUserSession(userId) {
    try {
      const session = this.userSessions.get(userId);
      if (session) {
        session.isActive = false;
        session.logoutTime = new Date();
      }

      // Atualizar status para offline
      await this.updateUserStatus(userId, 'offline');

      console.log(`🔓 Sessão encerrada para usuário ${userId}`);
      return true;
    } catch (error) {
      throw new Error(`Erro ao encerrar sessão: ${error.message}`);
    }
  }

  /**
   * ATUALIZAR ATIVIDADE DO USUÁRIO
   */
  async updateUserActivity(userId) {
    try {
      const session = this.userSessions.get(userId);
      if (session && session.isActive) {
        session.lastActivity = new Date();
        
        // Se estava away, voltar para online
        const status = this.userStatus.get(userId);
        if (status && status.status === 'away' && status.autoAway) {
          await this.updateUserStatus(userId, 'online');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
    }
  }

  /**
   * VERIFICAR USUÁRIOS INATIVOS (AUTO-AWAY)
   */
  async checkInactiveUsers() {
    try {
      const now = new Date();
      const awayThreshold = 5 * 60 * 1000; // 5 minutos
      const offlineThreshold = 30 * 60 * 1000; // 30 minutos

      for (const [userId, session] of this.userSessions.entries()) {
        if (!session.isActive) continue;

        const inactiveTime = now - session.lastActivity;
        const status = this.userStatus.get(userId);

        if (inactiveTime > offlineThreshold) {
          // Marcar como offline após 30 minutos
          await this.endUserSession(userId);
        } else if (inactiveTime > awayThreshold && status?.status === 'online') {
          // Marcar como away após 5 minutos
          await this.updateUserStatus(userId, 'away');
          this.userStatus.get(userId).autoAway = true;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar usuários inativos:', error);
    }
  }

  /**
   * BUSCAR USUÁRIO POR EMAIL
   */
  async findUserByEmail(tenantId, email) {
    try {
      const tenantUserMap = this.tenantUsers.get(tenantId);
      if (!tenantUserMap) return null;

      for (const user of tenantUserMap.values()) {
        if (user.email.toLowerCase() === email.toLowerCase()) {
          const status = this.userStatus.get(user.id) || { status: 'offline' };
          return {
            ...user,
            status: status.status,
            lastSeen: status.lastSeen
          };
        }
      }

      return null;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  /**
   * CONVIDAR USUÁRIO PARA TENANT
   */
  async inviteUserToTenant(tenantId, inviterUserId, inviteData) {
    try {
      const inviteId = nanoid();
      
      // Em produção, enviaria email de convite
      const invite = {
        id: inviteId,
        tenantId,
        inviterUserId,
        email: inviteData.email,
        role: inviteData.role || 'user',
        permissions: inviteData.permissions || ['read'],
        message: inviteData.message,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        status: 'pending'
      };

      console.log(`📧 Convite enviado para ${inviteData.email} no tenant ${tenantId}`);
      return invite;
    } catch (error) {
      throw new Error(`Erro ao enviar convite: ${error.message}`);
    }
  }

  /**
   * OBTER USUÁRIOS ONLINE
   */
  getOnlineUsers(tenantId) {
    try {
      const tenantUserMap = this.tenantUsers.get(tenantId);
      if (!tenantUserMap) return [];

      const onlineUsers = [];
      
      for (const user of tenantUserMap.values()) {
        const session = this.userSessions.get(user.id);
        const status = this.userStatus.get(user.id);
        
        if (session && session.isActive && status && status.status !== 'offline') {
          onlineUsers.push({
            userId: user.id,
            name: user.name,
            avatar: user.avatar,
            status: status.status,
            customMessage: status.customMessage
          });
        }
      }

      return onlineUsers;
    } catch (error) {
      console.error('Erro ao obter usuários online:', error);
      return [];
    }
  }

  /**
   * ATUALIZAR PERMISSÕES DO USUÁRIO
   */
  async updateUserPermissions(tenantId, userId, permissions) {
    try {
      const tenantUserMap = this.tenantUsers.get(tenantId);
      if (!tenantUserMap || !tenantUserMap.has(userId)) {
        throw new Error('Usuário não encontrado');
      }

      const user = tenantUserMap.get(userId);
      user.permissions = permissions;
      user.updatedAt = new Date();

      console.log(`🔐 Permissões atualizadas para usuário ${userId}`);
      return user;
    } catch (error) {
      throw new Error(`Erro ao atualizar permissões: ${error.message}`);
    }
  }

  /**
   * REMOVER USUÁRIO DO TENANT
   */
  async removeUserFromTenant(tenantId, userId) {
    try {
      const tenantUserMap = this.tenantUsers.get(tenantId);
      if (!tenantUserMap) return false;

      // Encerrar sessão se ativa
      await this.endUserSession(userId);

      // Remover usuário
      const removed = tenantUserMap.delete(userId);
      this.userStatus.delete(userId);
      this.userSessions.delete(userId);

      if (removed) {
        console.log(`🗑️ Usuário ${userId} removido do tenant ${tenantId}`);
      }

      return removed;
    } catch (error) {
      throw new Error(`Erro ao remover usuário: ${error.message}`);
    }
  }

  /**
   * OBTER ESTATÍSTICAS DO TENANT
   */
  getTenantStats(tenantId) {
    try {
      const tenantUserMap = this.tenantUsers.get(tenantId);
      if (!tenantUserMap) {
        return {
          totalUsers: 0,
          onlineUsers: 0,
          awayUsers: 0,
          busyUsers: 0,
          offlineUsers: 0
        };
      }

      const stats = {
        totalUsers: tenantUserMap.size,
        onlineUsers: 0,
        awayUsers: 0,
        busyUsers: 0,
        offlineUsers: 0
      };

      for (const user of tenantUserMap.values()) {
        const status = this.userStatus.get(user.id);
        const session = this.userSessions.get(user.id);
        
        if (session && session.isActive && status) {
          switch (status.status) {
            case 'online':
              stats.onlineUsers++;
              break;
            case 'away':
              stats.awayUsers++;
              break;
            case 'busy':
              stats.busyUsers++;
              break;
            default:
              stats.offlineUsers++;
          }
        } else {
          stats.offlineUsers++;
        }
      }

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }
}

// Instância singleton
const tenantUserService = new TenantUserService();

// Verificar usuários inativos a cada minuto
setInterval(() => {
  tenantUserService.checkInactiveUsers();
}, 60000);

module.exports = tenantUserService;
