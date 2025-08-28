import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { StandardLoading } from '../components/loading/StandardLoading';
import { StandardLayout } from '../components/layouts/StandardLayout';

// Lazy loading dos componentes
const HomePage = React.lazy(() => import('../pages/HomePage'));
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const SupportDashboard = React.lazy(() => import('../pages/support/SupportDashboard'));
const WorkflowsPage = React.lazy(() => import('../pages/workflows/WorkflowsPage'));
const WorkflowBuilderPage = React.lazy(() => import('../pages/workflows/WorkflowBuilderPage'));
const ReportsPage = React.lazy(() => import('../pages/reports/ReportsPage'));
const QueryBuilderPage = React.lazy(() => import('../pages/query-builder/QueryBuilderPage'));
const EmailSystemPage = React.lazy(() => import('../pages/email/EmailSystemPage'));
const ChatPage = React.lazy(() => import('../pages/chat/ChatPage'));
const TenantsPage = React.lazy(() => import('../pages/admin/TenantsPage'));
const UsersPage = React.lazy(() => import('../pages/admin/UsersPage'));
const ModulesPage = React.lazy(() => import('../pages/admin/ModulesPage'));
const SettingsPage = React.lazy(() => import('../pages/settings/SettingsPage'));
const ProfilePage = React.lazy(() => import('../pages/profile/ProfilePage'));
const NotFoundPage = React.lazy(() => import('../pages/errors/NotFoundPage'));
const UnauthorizedPage = React.lazy(() => import('../pages/errors/UnauthorizedPage'));

// Configuração de rotas por perfil e módulo
const ROUTE_CONFIG = {
  // Rotas públicas (sem autenticação)
  public: [
    { path: '/', component: HomePage, exact: true },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/unauthorized', component: UnauthorizedPage },
    { path: '/404', component: NotFoundPage }
  ],
  
  // Rotas protegidas por autenticação
  protected: {
    // Rotas comuns a todos os usuários autenticados
    common: [
      { path: '/dashboard', component: DashboardPage },
      { path: '/profile', component: ProfilePage },
      { path: '/settings', component: SettingsPage }
    ],
    
    // Rotas específicas por perfil
    profiles: {
      admin: [
        { path: '/admin', component: AdminDashboard },
        { path: '/admin/tenants', component: TenantsPage },
        { path: '/admin/users', component: UsersPage },
        { path: '/admin/modules', component: ModulesPage }
      ],
      support: [
        { path: '/support', component: SupportDashboard }
      ]
    },
    
    // Rotas específicas por módulo
    modules: {
      workflows: [
        { path: '/workflows', component: WorkflowsPage },
        { path: '/workflows/builder', component: WorkflowBuilderPage },
        { path: '/workflows/builder/:id', component: WorkflowBuilderPage }
      ],
      reports: [
        { path: '/reports', component: ReportsPage }
      ],
      queryBuilder: [
        { path: '/query-builder', component: QueryBuilderPage }
      ],
      email: [
        { path: '/email', component: EmailSystemPage }
      ],
      chat: [
        { path: '/chat', component: ChatPage }
      ]
    }
  }
};

// Componente de rota protegida
const ProtectedRoute = ({ children, requiredRole = null, requiredModule = null }) => {
  const { isAuthenticated, user, hasPermission, hasModuleAccess } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar permissão de perfil
  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Verificar acesso ao módulo
  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Componente de rota pública (redireciona se já autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    // Redirecionar para dashboard apropriado baseado no perfil
    if (user?.profile === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.profile === 'support') {
      return <Navigate to="/support" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

// Componente principal de rotas
export const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Suspense fallback={<StandardLoading type="page" />}>
      <Routes>
        {/* Rotas públicas */}
        {ROUTE_CONFIG.public.map((route) => {
          const Component = route.component;
          
          if (route.path === '/' || route.path === '/login' || route.path === '/register') {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <PublicRoute>
                    <Component />
                  </PublicRoute>
                }
              />
            );
          }
          
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<Component />}
            />
          );
        })}
        
        {/* Rotas protegidas comuns */}
        {ROUTE_CONFIG.protected.common.map((route) => {
          const Component = route.component;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <Component />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
          );
        })}
        
        {/* Rotas específicas por perfil */}
        {Object.entries(ROUTE_CONFIG.protected.profiles).map(([profile, routes]) =>
          routes.map((route) => {
            const Component = route.component;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute requiredRole={profile}>
                    <StandardLayout>
                      <Component />
                    </StandardLayout>
                  </ProtectedRoute>
                }
              />
            );
          })
        )}
        
        {/* Rotas específicas por módulo */}
        {Object.entries(ROUTE_CONFIG.protected.modules).map(([module, routes]) =>
          routes.map((route) => {
            const Component = route.component;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute requiredModule={module}>
                    <StandardLayout>
                      <Component />
                    </StandardLayout>
                  </ProtectedRoute>
                }
              />
            );
          })
        )}
        
        {/* Redirecionamento padrão para usuários autenticados */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate
                to={
                  user?.profile === 'admin'
                    ? '/admin'
                    : user?.profile === 'support'
                    ? '/support'
                    : '/dashboard'
                }
                replace
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        
        {/* Rota 404 - deve ser a última */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

// Hook para navegação programática com verificação de permissões
export const useAppNavigation = () => {
  const { hasPermission, hasModuleAccess } = useAuth();
  
  const canNavigateTo = (path) => {
    // Verificar se o usuário pode navegar para uma rota específica
    const allRoutes = [
      ...ROUTE_CONFIG.protected.common,
      ...Object.values(ROUTE_CONFIG.protected.profiles).flat(),
      ...Object.values(ROUTE_CONFIG.protected.modules).flat()
    ];
    
    const route = allRoutes.find(r => r.path === path || path.startsWith(r.path));
    
    if (!route) return false;
    
    // Verificar permissões de perfil
    const profileRoutes = Object.entries(ROUTE_CONFIG.protected.profiles);
    for (const [profile, routes] of profileRoutes) {
      if (routes.some(r => r.path === route.path)) {
        return hasPermission(profile);
      }
    }
    
    // Verificar permissões de módulo
    const moduleRoutes = Object.entries(ROUTE_CONFIG.protected.modules);
    for (const [module, routes] of moduleRoutes) {
      if (routes.some(r => r.path === route.path)) {
        return hasModuleAccess(module);
      }
    }
    
    // Rotas comuns são sempre acessíveis para usuários autenticados
    return true;
  };
  
  const getAvailableRoutes = () => {
    // Retornar todas as rotas disponíveis para o usuário atual
    const availableRoutes = [];
    
    // Rotas comuns
    availableRoutes.push(...ROUTE_CONFIG.protected.common);
    
    // Rotas por perfil
    Object.entries(ROUTE_CONFIG.protected.profiles).forEach(([profile, routes]) => {
      if (hasPermission(profile)) {
        availableRoutes.push(...routes);
      }
    });
    
    // Rotas por módulo
    Object.entries(ROUTE_CONFIG.protected.modules).forEach(([module, routes]) => {
      if (hasModuleAccess(module)) {
        availableRoutes.push(...routes);
      }
    });
    
    return availableRoutes;
  };
  
  return {
    canNavigateTo,
    getAvailableRoutes,
    ROUTE_CONFIG
  };
};

export default AppRoutes;