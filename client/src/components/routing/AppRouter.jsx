import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import { publicRoutes, adminRoutes, clientRoutes, ROUTES, hasPermission } from '@/config/routes';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SidebarWrapper } from './SidebarWrapper';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layout/MainLayout';

// Layouts
const DefaultLayout) => (
  <div className="min-h-screen bg-gray-50">
    <Toaster />
    { children }
  </div>
);

const ClientLayout = ( { children } ) => (
  <MainLayout>
    { children }
  </MainLayout>
);

const AdminLayout) => (
  <div className="flex h-screen bg-gray-100">
    <SidebarWrapper isAdmin={ true } />
    <main className="flex-1 overflow-auto p-6">
      <Toaster />
      { children }
    </main>
  </div>
);

const MinimalLayout) => (
  <div className="min-h-screen bg-gray-50">
    <Toaster />
    <div className="container mx-auto p-4">
      { children }
    </div>
  </div>
);

// Componente de rota protegida
const ProtectedRoute, roles = [], requiresTenant = false, layout = 'default', ...rest }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Se ainda está carregando, mostra um spinner
  if ( isLoading )
  {
    return <LoadingSpinner />;
  }

  // Se a rota for a raiz e o usuário estiver autenticado, redireciona para o dashboard apropriado
  // Mas apenas se estiver no domínio correto (não no domínio de suporte)
  if ( location.pathname === '/' && isAuthenticated && window.location.hostname !== 'supnexus.toit.com.br' )
  {
    // Se for super_admin ou toit_admin, redireciona para o dashboard de admin
    if ( user?.role === 'super_admin' || user?.role === 'toit_admin' )
    {
      return <Navigate to={ ROUTES.ADMIN_DASHBOARD } replace />;
    }
    // Se for cliente, redireciona para o dashboard do cliente
    return <Navigate to={ ROUTES.CLIENT_DASHBOARD } replace />;
  }

  // Se não está autenticado e a rota não é pública, redireciona para o login
  if ( !isAuthenticated && !publicRoutes.some( route => route.path === location.pathname ) )
  {
    // Se estiver no domínio de suporte, redireciona para o login de suporte
    const hostname = window.location.hostname.toLowerCase();
    if ( hostname === 'supnexus.toit.com.br' )
    {
      return <Navigate to={ `/support-login?redirect=${ encodeURIComponent( location.pathname + location.search ) }` } replace />;
    }
    // Para todos os outros domínios (nexus.toit.com.br, localhost, etc), redireciona para o login de cliente
    return <Navigate to={ `/login?redirect=${ encodeURIComponent( location.pathname + location.search ) }` } replace />;
  }

  // Verifica se o usuário tem permissão para acessar a rota
  if ( !hasPermission( user?.role, roles ) )
  {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="mb-4">Você não tem permissão para acessar esta página.</p>
          <a href="/" className="text-blue-600 hover);
  }

  // Verifica se a rota requer um tenant selecionado
  if (requiresTenant && !user?.tenant) {
    return <Navigate to={ROUTES.SELECT_TENANT} replace />;
  }

  // Renderiza o componente com o layout apropriado
  const renderWithLayout = (children) => {
    switch (layout) {
      case 'client':
        return <ClientLayout>{children}</ClientLayout>;
      case 'admin':
        return <AdminLayout>{children}</AdminLayout>;
      case 'minimal':
        return <MinimalLayout>{children}</MinimalLayout>;
      default);
};

// Componente de rota pública
const PublicRoute) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/';

  // Se ainda está carregando, mostra um spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Se está autenticado, redireciona para a página inicial ou para a URL de redirecionamento
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to={redirectTo} replace />;
  }

  return <Component />;
};

// Componente principal de roteamento
export const AppRouter) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Efeito para lidar com autenticação e redirecionamentos
  useEffect(() => {
    // Se não estiver carregando e não estiver autenticado, redireciona para login
    // Mas apenas se não estiver no domínio principal (nexus.toit.com.br)
    const currentDomain = window.location.hostname;
    const isMainDomain = currentDomain === 'nexus.toit.com.br' || currentDomain === 'localhost' || currentDomain === '127.0.0.1';
    
    // Só redireciona se não estiver autenticado e não estiver já na página de login correta
    if (!isLoading && !isAuthenticated) {
      // Se estiver no domínio de suporte e não estiver no support-login
      if (currentDomain === 'supnexus.toit.com.br' && location.pathname !== '/support-login') {
        navigate(`/support-login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      }
      // Se estiver no domínio principal e não estiver no login de cliente
      else if (isMainDomain && location.pathname !== '/login' && location.pathname !== '/') {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      }
    }
  }, [isLoading, isAuthenticated, location, navigate]);

  // Rota de fallback para páginas não encontradas
  const NotFound = React.lazy(() => import('@/pages/not-found'));

  // Função auxiliar para criar rotas protegidas
  const createProtectedRoute = (route, index) => (
    <Route
      key={`protected-${index}`}
      path={route.path}
      element={
        <ProtectedRoute
          component={route.component}
          roles={route.roles}
          requiresTenant={route.requiresTenant}
          layout={route.layout}
        />
      }
    />
  );

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Rotas Públicas */}
        {publicRoutes.map((route, index) => (
          <Route
            key={`public-${index}`}
            path={route.path}
            element={<PublicRoute component={route.component} />}
          />
        ))}

        {/* Rotas Administrativas */}
        {adminRoutes.map((route, index) => createProtectedRoute(route, index))}

        {/* Rotas do Cliente */}
        {clientRoutes.map((route, index) => createProtectedRoute(route, index))}

        {/* Rota 404 */}
        <Route
          path="*"
          element={
            <DefaultLayout>
              <NotFound />
            </DefaultLayout>
          }
        />
        </Routes>
      </Suspense>
    );
  };

  export default AppRouter;
