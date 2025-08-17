import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

// Context de autenticação
const AuthContext = createContext( null );

/**
 * Provider de autenticação
 */
export function AuthProvider( { children } )
{
  const [ authState, setAuthState ] = useState( {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  } );

  const queryClient = useQueryClient();

  // Query para verificar usuário atual
  const { data: user, isLoading, error, refetch } = useQuery( {
    queryKey: [ 'auth', 'me' ],
    queryFn: async () =>
    {
      try
      {
        const response = await fetch( '/api/auth/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        } );

        if ( response.status === 401 )
        {
          return null; // Não autenticado
        }

        if ( !response.ok )
        {
          throw new Error( `HTTP ${ response.status }` );
        }

        const data = await response.json();
        return data.success ? data.data.user : null;
      } catch ( error )
      {
        console.error( 'Erro ao verificar autenticação:', error );
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  } );

  // Mutation para login
  const loginMutation = useMutation( {
    mutationFn: async ( { identifier, password, rememberMe = false } ) =>
    {
      const response = await fetch( '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify( { identifier, password, rememberMe } )
      } );

      const data = await response.json();

      if ( !response.ok )
      {
        throw new Error( data.error || 'Erro no login' );
      }

      return data;
    },
    onSuccess: ( data ) =>
    {
      // Atualizar cache do usuário
      queryClient.setQueryData( [ 'auth', 'me' ], data.data.user );

      // Salvar no localStorage se "lembrar de mim"
      if ( data.data.user )
      {
        localStorage.setItem( 'user', JSON.stringify( data.data.user ) );
      }

      console.log( '✅ Login realizado com sucesso' );
    },
    onError: ( error ) =>
    {
      console.error( '❌ Erro no login:', error.message );
    }
  } );

  // Mutation para logout
  const logoutMutation = useMutation( {
    mutationFn: async () =>
    {
      const response = await fetch( '/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro no logout' );
      }

      return response.json();
    },
    onSuccess: () =>
    {
      // Limpar cache
      queryClient.setQueryData( [ 'auth', 'me' ], null );
      queryClient.removeQueries( { queryKey: [ 'auth' ] } );

      // Limpar localStorage
      localStorage.removeItem( 'user' );

      console.log( '✅ Logout realizado com sucesso' );
    },
    onError: ( error ) =>
    {
      console.error( '❌ Erro no logout:', error.message );

      // Mesmo com erro, limpar estado local
      queryClient.setQueryData( [ 'auth', 'me' ], null );
      localStorage.removeItem( 'user' );
    }
  } );

  // Atualizar estado quando dados mudarem
  useEffect( () =>
  {
    setAuthState( {
      user,
      isAuthenticated: !!user,
      isLoading,
      error
    } );
  }, [ user, isLoading, error ] );

  // Funções de conveniência
  const login = useCallback( async ( credentials ) =>
  {
    return loginMutation.mutateAsync( credentials );
  }, [ loginMutation ] );

  const logout = useCallback( async () =>
  {
    return logoutMutation.mutateAsync();
  }, [ logoutMutation ] );

  const hasRole = useCallback( ( roles ) =>
  {
    if ( !user ) return false;

    const allowedRoles = Array.isArray( roles ) ? roles : [ roles ];
    return allowedRoles.includes( user.role );
  }, [ user ] );

  const hasPermission = useCallback( ( permission ) =>
  {
    if ( !user ) return false;

    // Super admin tem todas as permissões
    if ( user.role === 'super_admin' ) return true;

    // Verificar permissão específica
    const permissions = user.permissions || [];
    return permissions.includes( permission ) || permissions.includes( 'admin.full_access' );
  }, [ user ] );

  const isSuperAdmin = user?.role === 'super_admin';
  const isTenantAdmin = user?.role === 'tenant_admin' || isSuperAdmin;
  const isManager = user?.role === 'manager' || isTenantAdmin;

  const value = {
    // Estado
    ...authState,

    // Flags de conveniência
    isSuperAdmin,
    isTenantAdmin,
    isManager,
    tenant: user?.tenant_name,
    userRole: user?.role,

    // Funções
    login,
    logout,
    hasRole,
    hasPermission,
    refetch,

    // Estados de loading
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Erros
    loginError: loginMutation.error,
    logoutError: logoutMutation.error
  };

  return (
    <AuthContext.Provider value={ value }>
      { children }
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar autenticação
 */
export function useAuth()
{
  const context = useContext( AuthContext );

  if ( !context )
  {
    throw new Error( 'useAuth deve ser usado dentro de AuthProvider' );
  }

  return context;
}
