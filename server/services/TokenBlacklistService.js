/**
 * SERVIÇO DE BLACKLIST DE TOKENS
 * Gerencia tokens revogados e sessões ativas
 * 100% JavaScript - SEM TYPESCRIPT
 */

const { db } = require('../database-config');
const jwt = require('jsonwebtoken');

class TokenBlacklistService {
  constructor() {
    this.blacklistedTokens = new Set(); // Cache em memória
    this.activeSessions = new Map(); // userId -> Set of tokens
    this.cleanupInterval = null;
    
    // Iniciar limpeza automática
    this.startCleanupSchedule();
  }

  /**
   * ADICIONAR TOKEN À BLACKLIST
   */
  async blacklistToken(token, reason = 'logout') {
    try {
      // Decodificar token para obter informações
      const decoded = jwt.decode(token);
      if (!decoded) {
        throw new Error('Token inválido');
      }

      const expiresAt = new Date(decoded.exp * 1000);
      const userId = decoded.userId;

      // Adicionar ao banco de dados
      await db.query(`
        INSERT INTO token_blacklist (token_hash, user_id, expires_at, reason, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (token_hash) DO NOTHING
      `, [
        this.hashToken(token),
        userId,
        expiresAt,
        reason
      ]);

      // Adicionar ao cache
      this.blacklistedTokens.add(token);

      // Remover das sessões ativas
      if (this.activeSessions.has(userId)) {
        this.activeSessions.get(userId).delete(token);
      }

      console.log(`🚫 Token adicionado à blacklist: ${reason}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao adicionar token à blacklist:', error);
      throw error;
    }
  }

  /**
   * VERIFICAR SE TOKEN ESTÁ NA BLACKLIST
   */
  async isTokenBlacklisted(token) {
    try {
      // Verificar cache primeiro
      if (this.blacklistedTokens.has(token)) {
        return true;
      }

      // Verificar no banco de dados
      const result = await db.query(`
        SELECT 1 FROM token_blacklist 
        WHERE token_hash = $1 AND expires_at > NOW()
      `, [this.hashToken(token)]);

      const isBlacklisted = result.rows.length > 0;

      // Adicionar ao cache se encontrado
      if (isBlacklisted) {
        this.blacklistedTokens.add(token);
      }

      return isBlacklisted;

    } catch (error) {
      console.error('❌ Erro ao verificar blacklist:', error);
      return false; // Em caso de erro, permitir acesso
    }
  }

  /**
   * REGISTRAR SESSÃO ATIVA
   */
  registerActiveSession(userId, token) {
    if (!this.activeSessions.has(userId)) {
      this.activeSessions.set(userId, new Set());
    }
    this.activeSessions.get(userId).add(token);
  }

  /**
   * OBTER SESSÕES ATIVAS DO USUÁRIO
   */
  getActiveSessions(userId) {
    return this.activeSessions.get(userId) || new Set();
  }

  /**
   * REVOGAR TODAS AS SESSÕES DO USUÁRIO
   */
  async revokeAllUserSessions(userId, reason = 'security_logout') {
    try {
      const userSessions = this.getActiveSessions(userId);
      
      for (const token of userSessions) {
        await this.blacklistToken(token, reason);
      }

      // Limpar sessões ativas
      this.activeSessions.delete(userId);

      console.log(`🚫 Todas as sessões do usuário ${userId} foram revogadas`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao revogar sessões:', error);
      throw error;
    }
  }

  /**
   * HASH DO TOKEN PARA ARMAZENAMENTO SEGURO
   */
  hashToken(token) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * LIMPEZA AUTOMÁTICA DE TOKENS EXPIRADOS
   */
  async cleanupExpiredTokens() {
    try {
      // Limpar do banco de dados
      const result = await db.query(`
        DELETE FROM token_blacklist 
        WHERE expires_at <= NOW()
      `);

      // Limpar cache (verificar expiração)
      const now = Date.now() / 1000;
      for (const token of this.blacklistedTokens) {
        try {
          const decoded = jwt.decode(token);
          if (decoded && decoded.exp < now) {
            this.blacklistedTokens.delete(token);
          }
        } catch (error) {
          // Token inválido, remover do cache
          this.blacklistedTokens.delete(token);
        }
      }

      if (result.rowCount > 0) {
        console.log(`🧹 Limpeza: ${result.rowCount} tokens expirados removidos`);
      }

    } catch (error) {
      console.error('❌ Erro na limpeza de tokens:', error);
    }
  }

  /**
   * INICIAR AGENDAMENTO DE LIMPEZA
   */
  startCleanupSchedule() {
    // Limpeza a cada 1 hora
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);

    console.log('🕐 Agendamento de limpeza de tokens iniciado');
  }

  /**
   * PARAR AGENDAMENTO DE LIMPEZA
   */
  stopCleanupSchedule() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('⏹️ Agendamento de limpeza de tokens parado');
    }
  }

  /**
   * ESTATÍSTICAS DO SERVIÇO
   */
  async getStats() {
    try {
      const dbStats = await db.query(`
        SELECT 
          COUNT(*) as total_blacklisted,
          COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_blacklisted,
          COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_blacklisted
        FROM token_blacklist
      `);

      return {
        database: dbStats.rows[0],
        cache: {
          blacklisted_tokens: this.blacklistedTokens.size,
          active_sessions: this.activeSessions.size,
          total_user_sessions: Array.from(this.activeSessions.values())
            .reduce((total, sessions) => total + sessions.size, 0)
        }
      };

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return null;
    }
  }

  /**
   * MIDDLEWARE PARA VERIFICAR BLACKLIST
   */
  checkBlacklistMiddleware() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
          const isBlacklisted = await this.isTokenBlacklisted(token);
          if (isBlacklisted) {
            return res.status(401).json({
              success: false,
              error: 'Token revogado',
              code: 'TOKEN_REVOKED'
            });
          }
        }

        next();

      } catch (error) {
        console.error('❌ Erro no middleware de blacklist:', error);
        next(); // Continuar em caso de erro
      }
    };
  }
}

// Instância singleton
const tokenBlacklistService = new TokenBlacklistService();

module.exports = { TokenBlacklistService, tokenBlacklistService };
