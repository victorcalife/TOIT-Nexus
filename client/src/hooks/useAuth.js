import { useQuery } from "@tanstack/react-query";

export function useAuth()
{
  const { data: user, isLoading } = useQuery( {
    queryKey: [ 'user' ],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () =>
    {
      try
      {
        const response = await fetch( '/api/user', {
          credentials: 'include'
        } );
        if ( response.status === 401 )
        {
          return null; // Não autenticado
        }
        if ( !response.ok )
        {
          throw new Error( `HTTP ${ response.status }` );
        }
        return await response.json();
      } catch ( error )
      {
        return null; // Em caso de erro, considerar não autenticado
      }
    }
  } );

  const isAuthenticated = !!user;
  const tenant = user?.tenant;
  const userRole = user?.role;
  const isSuperAdmin = user?.role === 'super_admin' || user?.isSuperAdmin || false;

  return {
    user,
    isLoading,
    isAuthenticated,
    isSuperAdmin,
    tenant,
    userRole,
  };
}
