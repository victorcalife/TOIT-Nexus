/**
 * SERVIÇO DE GERENCIAMENTO DE TOKENS JWT
 * Renovação automática, interceptors e gerenciamento de sessão
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { queryClient } from '../lib/queryClient';

class TokenService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.refreshPromise = null;
    this.refreshTimer = null;
    this.isRefreshing = false;
    
    // Carregar tokens do localStorage
    this.loadTokensFromStorage();
    
    // Configurar interceptors
    this.setupInterceptors();
    
    // Iniciar renovação automática
    this.startAutoRefresh();
  }

  /**
   * CARREGAR TOKENS DO STORAGE
   */
  loadTokensFromStorage() {
    try {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      
      // Verificar se tokens são válidos
      if (this.accessToken && this.isTokenExpired(this.accessToken)) {
        this.clearTokens();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar tokens:', error);
      this.clearTokens();
    }
  }

  /**
   * SALVAR TOKENS NO STORAGE
   */
  saveTokensToStorage(accessToken, refreshToken) {
    try {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Reiniciar timer de renovação
      this.startAutoRefresh();
      
    } catch (error) {
      console.error('❌ Erro ao salvar tokens:', error);
    }
  }

  /**
   * LIMPAR TOKENS
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    this.stopAutoRefresh();
  }

  /**
   * VERIFICAR SE TOKEN ESTÁ EXPIRADO
   */
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      // Considerar expirado se restam menos de 5 minutos
      return payload.exp < (now + 300);
    } catch (error) {
      return true; // Se não conseguir decodificar, considerar expirado
    }
  }

  /**
   * OBTER TOKEN DE ACESSO VÁLIDO
   */
  async getValidAccessToken() {
    if (!this.accessToken) {
      return null;
    }

    // Se token não está expirado, retornar
    if (!this.isTokenExpired(this.accessToken)) {
      return this.accessToken;
    }

    // Se já está renovando, aguardar
    if (this.isRefreshing && this.refreshPromise) {
      try {
        await this.refreshPromise;
        return this.accessToken;
      } catch (error) {
        return null;
      }
    }

    // Renovar token
    return await this.refreshAccessToken();
  }

  /**
   * RENOVAR TOKEN DE ACESSO
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      this.clearTokens();
      return null;
    }

    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * EXECUTAR RENOVAÇÃO DO TOKEN
   */
  async performTokenRefresh() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Falha na renovação do token');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        this.saveTokensToStorage(data.data.accessToken, data.data.refreshToken);
        
        console.log('🔄 Token renovado com sucesso');
        return this.accessToken;
      } else {
        throw new Error(data.error || 'Resposta inválida');
      }

    } catch (error) {
      console.error('❌ Erro na renovação do token:', error);
      
      // Se falhou, limpar tokens e redirecionar para login
      this.clearTokens();
      this.handleAuthFailure();
      
      return null;
    }
  }

  /**
   * CONFIGURAR INTERCEPTORS PARA REQUISIÇÕES
   */
  setupInterceptors() {
    // Interceptor para adicionar token automaticamente
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      // Pular interceptor para rotas de auth
      if (url.includes('/api/auth/')) {
        return originalFetch(url, options);
      }

      const token = await this.getValidAccessToken();
      
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
      }

      const response = await originalFetch(url, options);

      // Verificar se recebeu novos tokens no header
      const newAccessToken = response.headers.get('X-New-Access-Token');
      const newRefreshToken = response.headers.get('X-New-Refresh-Token');

      if (newAccessToken && newRefreshToken) {
        this.saveTokensToStorage(newAccessToken, newRefreshToken);
        console.log('🔄 Tokens atualizados via header');
      }

      // Se recebeu 401, tentar renovar uma vez
      if (response.status === 401 && !options._retry) {
        const refreshedToken = await this.refreshAccessToken();
        
        if (refreshedToken) {
          options._retry = true;
          options.headers['Authorization'] = `Bearer ${refreshedToken}`;
          return originalFetch(url, options);
        }
      }

      return response;
    };
  }

  /**
   * INICIAR RENOVAÇÃO AUTOMÁTICA
   */
  startAutoRefresh() {
    this.stopAutoRefresh();

    if (!this.accessToken) {
      return;
    }

    try {
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      
      // Renovar 5 minutos antes da expiração
      const refreshAt = expiresAt - (5 * 60 * 1000);
      const delay = refreshAt - now;

      if (delay > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshAccessToken();
        }, delay);

        console.log(`⏰ Renovação automática agendada em ${Math.round(delay / 1000)}s`);
      } else {
        // Token já está próximo da expiração, renovar imediatamente
        this.refreshAccessToken();
      }

    } catch (error) {
      console.error('❌ Erro ao agendar renovação:', error);
    }
  }

  /**
   * PARAR RENOVAÇÃO AUTOMÁTICA
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * LIDAR COM FALHA DE AUTENTICAÇÃO
   */
  handleAuthFailure() {
    // Limpar cache do React Query
    queryClient.clear();
    
    // Emitir evento personalizado
    window.dispatchEvent(new CustomEvent('auth:logout', {
      detail: { reason: 'token_refresh_failed' }
    }));

    // Redirecionar para login após um delay
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=session_expired';
      }
    }, 1000);
  }

  /**
   * FAZER LOGOUT SEGURO
   */
  async logout() {
    try {
      // Chamar endpoint de logout se tiver token
      if (this.accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    } finally {
      this.clearTokens();
      this.handleAuthFailure();
    }
  }

  /**
   * VERIFICAR SE USUÁRIO ESTÁ AUTENTICADO
   */
  isAuthenticated() {
    return !!this.accessToken && !this.isTokenExpired(this.accessToken);
  }

  /**
   * OBTER DADOS DO USUÁRIO DO TOKEN
   */
  getUserFromToken() {
    if (!this.accessToken) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        permissions: payload.permissions || []
      };
    } catch (error) {
      console.error('❌ Erro ao decodificar token:', error);
      return null;
    }
  }

  /**
   * VERIFICAR PERMISSÃO
   */
  hasPermission(permission) {
    const user = this.getUserFromToken();
    if (!user) return false;
    
    // Super admin tem todas as permissões
    if (user.role === 'super_admin') return true;
    
    return user.permissions.includes(permission) || user.permissions.includes('*');
  }

  /**
   * VERIFICAR ROLE
   */
  hasRole(role) {
    const user = this.getUserFromToken();
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }
}

// Instância singleton
export const tokenService = new TokenService();

// Hook para usar o serviço de tokens
export const useTokenService = () => {
  return tokenService;
};
