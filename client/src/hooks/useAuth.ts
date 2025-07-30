import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.isSuperAdmin || false,
    tenant: user?.tenant,
    userRole: user?.role,
  };
}
