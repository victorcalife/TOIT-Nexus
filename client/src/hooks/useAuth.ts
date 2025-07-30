import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  cpf: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'super_admin' | 'tenant_admin' | 'manager' | 'employee';
  tenantId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties from auth response
  isSuperAdmin?: boolean;
  tenant?: any;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isSuperAdmin = user?.role === 'super_admin' || user?.isSuperAdmin || false;

  // Debug logging - remove after testing
  console.log('useAuth:', { user, isLoading, error, isSuperAdmin });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isSuperAdmin,
    tenant: user?.tenant,
    userRole: user?.role,
  };
}
