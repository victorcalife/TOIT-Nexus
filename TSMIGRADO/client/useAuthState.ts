import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  cpf: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'tenant_admin' | 'manager' | 'employee';
  tenantId?: string;
  tenantName?: string;
  tenantSlug?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Verificar autenticação ao carregar
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Sincronizar com localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Limpar localStorage
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro de conexão',
      });
    }
  }, []);

  // Login
  const login = useCallback(async (cpf: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ cpf, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Salvar no localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        return { success: true, redirectTo: data.redirectTo, user: data.user };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Erro de autenticação',
        }));

        return { success: false, error: data.error || 'Erro de autenticação' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = 'Erro de conexão. Tente novamente.';
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Limpar localStorage
      localStorage.removeItem('user');

      // Redirecionar para login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar estado local
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, []);

  // Verificar se usuário tem role específica
  const hasRole = useCallback((role: string | string[]) => {
    if (!authState.user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(authState.user.role);
  }, [authState.user]);

  // Verificar se é admin (super_admin ou tenant_admin)
  const isAdmin = useCallback(() => {
    return hasRole(['super_admin', 'tenant_admin']);
  }, [hasRole]);

  // Verificar se é super admin
  const isSuperAdmin = useCallback(() => {
    return hasRole('super_admin');
  }, [hasRole]);

  // Obter nome completo do usuário
  const getFullName = useCallback(() => {
    if (!authState.user) return '';
    return `${authState.user.firstName || ''} ${authState.user.lastName || ''}`.trim();
  }, [authState.user]);

  // Obter initials do usuário
  const getInitials = useCallback(() => {
    if (!authState.user) return '';
    const firstName = authState.user.firstName || '';
    const lastName = authState.user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, [authState.user]);

  // Carregar estado inicial
  useEffect(() => {
    // Tentar carregar do localStorage primeiro (mais rápido)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: true, // Ainda vai verificar com servidor
          error: null,
        });
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
      }
    }

    // Verificar com servidor
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    hasRole,
    isAdmin,
    isSuperAdmin,
    getFullName,
    getInitials,
  };
};