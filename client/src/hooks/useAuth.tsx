import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isAuthenticated = !!user && !error;
  const isSuperAdmin = user?.role === 'super_admin';

  return {
    user,
    isAuthenticated,
    isLoading,
    isSuperAdmin,
    error
  };
}