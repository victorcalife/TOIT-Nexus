import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { publicRoutes, adminRoutes, clientRoutes, hasPermission } from '@/config/routes';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Layouts
import DefaultLayout from '@/components/layouts/DefaultLayout';
import ClientLayout from '@/components/layouts/ClientLayout';
import AdminLayout from '@/components/layouts/AdminLayout';
import MinimalLayout from '@/components/layouts/MinimalLayout';

// Componente para rotas protegidas
function ProtectedRoute({ children, requiredRoles = [], requireTenantSelection = false }) {
  const { isAuthenticated, isLoading, user, tenant } = useAuth();
  const location = useLocation();

  // Aguardar carregamento da autenticação
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Verificar autenticação
  if (!isAuthenticated) {
    // Determinar página de login baseada no domínio
    const hostname = window.location.hostname;
    const loginPath = hostname === 'supnexus.toit.com.br' ? '/support-login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Verificar permissões de role
  if (requiredRoles.length > 0 && !hasPermission(user?.role, requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar seleção de tenant (se necessário)
  if (requireTenantSelection && !tenant) {
    return <Navigate to="/select-tenant" replace />;
  }

  return children;
}

// Componente para rotas públicas
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Aguardar carregamento da autenticação
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Se já autenticado e não estiver na rota raiz, redirecionar para dashboard apropriado
  if (isAuthenticated && user && location.pathname !== '/') {
    const dashboardPath = user.role === 'super_admin' || user.role === 'tenant_admin'
      ? '/admin/dashboard'
      : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}

// Componente de redirecionamento da rota raiz
function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Aguardar carregamento da autenticação
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Se autenticado, redirecionar para dashboard apropriado
  if (isAuthenticated && user) {
    const dashboardPath = user.role === 'super_admin' || user.role === 'tenant_admin'
      ? '/admin/dashboard'
      : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Se não autenticado, redirecionar para login baseado no domínio
  const hostname = window.location.hostname;
  const loginPath = hostname === 'supnexus.toit.com.br' ? '/support-login' : '/login';
  return <Navigate to={loginPath} replace />;
}

// Componente de roteamento interno (dentro do Router)
function AppRoutes() {
  // Rota de fallback para páginas não encontradas
  const NotFound = React.lazy(() => import('@/pages/not-found'));

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Rota raiz com redirecionamento inteligente */}
          <Route path="/" element={<RootRedirect />} />

          {/* Rotas públicas */}
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PublicRoute>
                  <MinimalLayout>
                    <route.component />
                  </MinimalLayout>
                </PublicRoute>
              }
            />
          ))}

          {/* Rotas de cliente */}
          {clientRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute
                  requiredRoles={route.roles}
                  requireTenantSelection={route.requireTenantSelection}
                >
                  <ClientLayout>
                    <route.component />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
          ))}

          {/* Rotas de admin */}
          {adminRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute
                  requiredRoles={route.roles}
                  requireTenantSelection={route.requireTenantSelection}
                >
                  <AdminLayout>
                    <route.component />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          ))}

          {/* Rota 404 */}
          <Route
            path="*"
            element={
              <MinimalLayout>
                <NotFound />
              </MinimalLayout>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

// Componente principal de roteamento
export const AppRouter = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default AppRouter;
