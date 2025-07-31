import { useEffect, useState } from 'react';
import { useAuthState } from '@/hooks/useAuthState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requireAuth?: boolean;
  fallbackUrl?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requireAuth = true,
  fallbackUrl = '/login' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading, hasRole } = useAuthState();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Aguardar carregamento
    if (isLoading) {
      return;
    }

    // Se require auth e não está autenticado
    if (requireAuth && !isAuthenticated) {
      window.location.href = fallbackUrl;
      return;
    }

    // Se não require auth, sempre renderizar
    if (!requireAuth) {
      setShouldRender(true);
      return;
    }

    // Se autenticado mas sem role requerida
    if (requiredRole && !hasRole(requiredRole)) {
      // Redirecionar baseado no role atual
      const currentRole = user?.role;
      if (currentRole === 'super_admin' || currentRole === 'tenant_admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
      return;
    }

    // Todas as validações passaram
    setShouldRender(true);

  }, [isAuthenticated, user, isLoading, requiredRole, hasRole, requireAuth, fallbackUrl]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Não renderizar se não passou nas validações
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
};

// Componentes específicos para roles
export const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredRole={['super_admin', 'tenant_admin']}>
    {children}
  </ProtectedRoute>
);

export const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredRole="super_admin">
    {children}
  </ProtectedRoute>
);

export const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
);