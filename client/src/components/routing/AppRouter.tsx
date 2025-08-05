import React, { Suspense, useEffect } from 'react';
import { Switch, Route, useLocation, Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { publicRoutes, adminRoutes, clientRoutes, ROUTES, hasPermission } from '@/config/routes';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Sidebar } from '@/components/sidebar';
import { Toaster } from '@/components/ui/toaster';

// Layouts
const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Toaster />
    {children}
  </div>
);

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 overflow-hidden">
      <Toaster />
      {children}
    </main>
  </div>
);

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex h-screen bg-gray-100">
    <Sidebar isAdmin />
    <main className="flex-1 overflow-auto p-6">
      <Toaster />
      {children}
    </main>
  </div>
);

const MinimalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Toaster />
    <div className="container mx-auto p-4">
      {children}
    </div>
  </div>
);

// Componente de rota protegida
const ProtectedRoute: React.FC<{
  component: React.ComponentType<any>;
  roles?: string[];
  requiresTenant?: boolean;
  layout?: 'default' | 'client' | 'admin' | 'minimal';
  [key: string]: any;
}> = ({ component: Component, roles = [], requiresTenant = false, layout = 'default', ...rest }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [location] = useLocation();

  // Se ainda está carregando, mostra um spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Se não está autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  // Verifica se o usuário tem permissão para acessar a rota
  if (!hasPermission(user?.role, roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="mb-4">Você não tem permissão para acessar esta página.</p>
          <a href="/" className="text-blue-600 hover:underline">Voltar ao início</a>
        </div>
      </div>
    );
  }

  // Verifica se a rota requer um tenant selecionado
  if (requiresTenant && !user?.tenant) {
    return <Redirect to={ROUTES.SELECT_TENANT} />;
  }

  // Renderiza o componente com o layout apropriado
  const renderWithLayout = (children: React.ReactNode) => {
    switch (layout) {
      case 'client':
        return <ClientLayout>{children}</ClientLayout>;
      case 'admin':
        return <AdminLayout>{children}</AdminLayout>;
      case 'minimal':
        return <MinimalLayout>{children}</MinimalLayout>;
      default:
        return <DefaultLayout>{children}</DefaultLayout>;
    }
  };

  return renderWithLayout(<Component {...rest} />);
};

// Componente de rota pública
const PublicRoute: React.FC<{ component: React.ComponentType<any> }> = ({ component: Component }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get('redirect') || '/';

  // Se ainda está carregando, mostra um spinner
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Se está autenticado, redireciona para a página inicial ou para a URL de redirecionamento
  if (isAuthenticated && location === '/login') {
    return <Redirect to={redirectTo} />;
  }

  return <Component />;
};

// Componente principal de roteamento
export const AppRouter: React.FC = () => {
  const location = useLocation();
  const { checkAuth } = useAuth();

  // Verifica a autenticação ao carregar o componente
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Rota de fallback para páginas não encontradas
  const NotFound = React.lazy(() => import('@/pages/not-found'));

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        {/* Rotas Públicas */}
        {publicRoutes.map((route, index) => (
          <Route key={`public-${index}`} path={route.path}>
            <PublicRoute component={route.component} />
          </Route>
        ))}

        {/* Rotas Administrativas */}
        {adminRoutes.map((route, index) => (
          <Route key={`admin-${index}`} path={route.path}>
            <ProtectedRoute
              component={route.component}
              roles={route.roles}
              requiresTenant={route.requiresTenant}
              layout={route.layout}
            />
          </Route>
        ))}

        {/* Rotas do Cliente */}
        {clientRoutes.map((route, index) => (
          <Route key={`client-${index}`} path={route.path}>
            <ProtectedRoute
              component={route.component}
              roles={route.roles}
              requiresTenant={route.requiresTenant}
              layout={route.layout}
            />
          </Route>
        ))}

        {/* Rota 404 */}
        <Route path="*">
          <DefaultLayout>
            <NotFound />
          </DefaultLayout>
        </Route>
      </Switch>
    </Suspense>
  );
};

export default AppRouter;
