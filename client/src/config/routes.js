import React from 'react';

// Páginas públicas
const HomePage = React.lazy(() => import('@/pages/HomePage.jsx'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage.jsx'));
const SupportLoginPage = React.lazy(() => import('@/pages/auth/SupportLoginPage.jsx'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage.jsx'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage.jsx'));
const UnauthorizedPage = React.lazy(() => import('@/pages/UnauthorizedPage.jsx'));
const SelectTenantPage = React.lazy(() => import('@/pages/auth/SelectTenantPage.jsx'));

// Páginas de cliente
const ClientDashboard = React.lazy(() => import('@/pages/client/Dashboard.jsx'));
const WorkflowsPage = React.lazy(() => import('@/pages/client/WorkflowsPage.jsx'));
const ReportsPage = React.lazy(() => import('@/pages/client/ReportsPage.jsx'));
const TasksPage = React.lazy(() => import('@/pages/client/TasksPage.jsx'));
const QueryBuilderPage = React.lazy(() => import('@/pages/client/QueryBuilderPage.jsx'));
const ConnectionsPage = React.lazy(() => import('@/pages/client/ConnectionsPage.jsx'));
const MLPage = React.lazy(() => import('@/pages/client/MLPage.jsx'));
const EmailPage = React.lazy(() => import('@/pages/client/EmailPage.jsx'));
const ChatPage = React.lazy(() => import('@/pages/client/ChatPage.jsx'));
const ProfilePage = React.lazy(() => import('@/pages/client/ProfilePage.jsx'));
const SettingsPage = React.lazy(() => import('@/pages/client/SettingsPage.jsx'));

// Páginas de admin
const AdminDashboard = React.lazy(() => import('@/pages/admin/dashboard.jsx'));
const UsersManagement = React.lazy(() => import('@/pages/admin/UsersManagement.jsx'));
const TenantsManagement = React.lazy(() => import('@/pages/admin/TenantsManagement.jsx'));
const SystemSettings = React.lazy(() => import('@/pages/admin/SystemSettings.jsx'));
const SystemLogs = React.lazy(() => import('@/pages/admin/SystemLogs.jsx'));
const SystemHealth = React.lazy(() => import('@/pages/admin/SystemHealth.jsx'));

/**
 * Rotas públicas - acessíveis sem autenticação
 */
export const publicRoutes = [
  {
    path: '/',
    component: HomePage,
    exact: true
  },
  {
    path: '/login',
    component: LoginPage
  },
  {
    path: '/support-login',
    component: SupportLoginPage
  },
  {
    path: '/register',
    component: RegisterPage
  },
  {
    path: '/forgot-password',
    component: ForgotPasswordPage
  },
  {
    path: '/reset-password',
    component: ResetPasswordPage
  },
  {
    path: '/unauthorized',
    component: UnauthorizedPage
  },
  {
    path: '/select-tenant',
    component: SelectTenantPage
  }
];

/**
 * Rotas de cliente - requerem autenticação
 */
export const clientRoutes = [
  {
    path: '/dashboard',
    component: ClientDashboard,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/workflows',
    component: WorkflowsPage,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/reports',
    component: ReportsPage,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/tasks',
    component: TasksPage,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/query-builder',
    component: QueryBuilderPage,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/connections',
    component: ConnectionsPage,
    roles: ['manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/ml',
    component: MLPage,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/email',
    component: EmailPage,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/chat',
    component: ChatPage,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/profile',
    component: ProfilePage,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  },
  {
    path: '/settings',
    component: SettingsPage,
    roles: ['client', 'manager', 'tenant_admin', 'super_admin'],
    requireTenantSelection: true
  }
];

/**
 * Rotas de admin - requerem permissões administrativas
 */
export const adminRoutes = [
  {
    path: '/admin/dashboard',
    component: AdminDashboard,
    roles: ['tenant_admin', 'super_admin']
  },
  {
    path: '/admin/users',
    component: UsersManagement,
    roles: ['tenant_admin', 'super_admin']
  },
  {
    path: '/admin/tenants',
    component: TenantsManagement,
    roles: ['super_admin']
  },
  {
    path: '/admin/settings',
    component: SystemSettings,
    roles: ['tenant_admin', 'super_admin']
  },
  {
    path: '/admin/logs',
    component: SystemLogs,
    roles: ['super_admin']
  },
  {
    path: '/admin/health',
    component: SystemHealth,
    roles: ['super_admin']
  }
];

/**
 * Função para verificar se o usuário tem permissão para uma rota
 */
export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles) return false;
  
  // Super admin tem acesso a tudo
  if (userRole === 'super_admin') return true;
  
  // Verificar se o role do usuário está na lista de roles permitidos
  return requiredRoles.includes(userRole);
};

/**
 * Função para obter a rota de dashboard baseada no role do usuário
 */
export const getDashboardRoute = (userRole) => {
  switch (userRole) {
    case 'super_admin':
    case 'tenant_admin':
      return '/admin/dashboard';
    case 'manager':
    case 'client':
    default:
      return '/dashboard';
  }
};

/**
 * Função para obter a rota de login baseada no domínio
 */
export const getLoginRoute = () => {
  const hostname = window.location.hostname;
  return hostname === 'supnexus.toit.com.br' ? '/support-login' : '/login';
};

export default {
  publicRoutes,
  clientRoutes,
  adminRoutes,
  hasPermission,
  getDashboardRoute,
  getLoginRoute
};