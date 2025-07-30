import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  // For demo purposes, return a mock authenticated state
  const mockUser = {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@toitnexus.com',
    role: 'super_admin',
    tenantId: 'demo-tenant'
  };

  // Still attempt to fetch real user data, but don't rely on it
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    enabled: false, // Disable automatic queries for demo
  });

  // Use real user data if available, otherwise use demo user
  const effectiveUser = user || mockUser;
  const isAuthenticated = true; // Always authenticated for demo
  const isSuperAdmin = effectiveUser && typeof effectiveUser === 'object' && 'role' in effectiveUser && effectiveUser.role === 'super_admin';

  return {
    user: effectiveUser,
    isAuthenticated,
    isLoading: false, // Never loading for demo
    isSuperAdmin,
    error: null
  };
}