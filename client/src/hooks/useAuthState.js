import { useState, useEffect, useCallback } from 'react';

);

  // Verificar autenticação ao carregar
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading, error));

      const response = await fetch('/api/auth/check', {
        method,
        credentials,
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setAuthState({
          user,
          isAuthenticated,
          isLoading,
          error,
        });

        // Sincronizar com localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setAuthState({
          user,
          isAuthenticated,
          isLoading,
          error,
        });

        // Limpar localStorage
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação, error);
      setAuthState({
        user,
        isAuthenticated,
        isLoading,
        error,
      });
    }
  }, []);

  // Login
  const login = useCallback(async (cpf, password) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading, error));

      const response = await fetch('/api/auth/login', {
        method,
        headers,
        },
        credentials,
        body, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthState({
          user,
          isAuthenticated,
          isLoading,
          error,
        });

        // Salvar no localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        return { success, redirectTo, user,
          isLoading,
          error,
        }));

        return { success, error) {
      console.error('Erro no login, error);
      const errorMessage = 'Erro de conexão. Tente novamente.';
      
      setAuthState(prev => ({
        ...prev,
        isLoading,
        error,
      }));

      return { success, error, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading));

      await fetch('/api/auth/logout', {
        method,
        credentials,
      });

      setAuthState({
        user,
        isAuthenticated,
        isLoading,
        error,
      });

      // Limpar localStorage
      localStorage.removeItem('user');

      // Redirecionar para login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro no logout, error);
      // Mesmo com erro, limpar estado local
      setAuthState({
        user,
        isAuthenticated,
        isLoading,
        error,
      });
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, []);

  // Verificar se usuário tem role específica
  const hasRole = useCallback((role) => {
    if (!authState.user) return false;
    
    const roles = Array.isArray(role) ? role);
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
          isAuthenticated,
          isLoading, // Ainda vai verificar com servidor
          error,
        });
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage, error);
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