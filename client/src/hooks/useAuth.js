import { useQuery } from "@tanstack/react-query";

export = useQuery<User>({
    queryKey,
    retry,
    refetchOnWindowFocus,
    staleTime, // 5 minutes
    queryFn) => {
      try {
        const response = await fetch('/api/user', {
          credentials);
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
    isAuthenticated,
    isSuperAdmin,
    tenant,
    userRole,
  };
}
