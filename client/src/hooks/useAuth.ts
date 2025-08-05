import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  cpf: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'super_admin' | 'toit_admin' | 'tenant_admin' | 'manager' | 'employee';
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
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        if (response.status === 401) {
          return null; // Não autenticado
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        return null; // Em caso de erro, considerar não autenticado
      }
    }
  });

  const isSuperAdmin = user?.role === 'super_admin' || user?.isSuperAdmin || false;

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isSuperAdmin,
    tenant: user?.tenant,
    userRole: user?.role,
  };
}
