import React from 'react';

// Páginas públicas
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const SupportLoginPage = React.lazy(() => import('@/pages/auth/SupportLoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'));
const UnauthorizedPage = React.lazy(() => import('@/pages/UnauthorizedPage'));
const SelectTenantPage = React.lazy(() => import('@/pages/auth/SelectTenantPage'));

// Páginas de cliente
const ClientDashboard = React.lazy(() => import('@/pages/client/Dashboard'));
const WorkflowsPage = React.lazy(() => import('@/pages/client/WorkflowsPage'));
const ReportsPage = React.lazy(() => import('@/pages/client/ReportsPage'));
const TasksPage = React.lazy(() => import('@/pages/client/TasksPage'));
const QueryBuilderPage = React.lazy(() => import('@/pages/client/QueryBuilderPage'));
const ConnectionsPage = React.lazy(() => import('@/pages/client/ConnectionsPage'));
const MLPage = React.lazy(() => import('@/pages/client/MLPage'));
const EmailPage = React.lazy(() => import('@/pages/client/EmailPage'));
const ChatPage = React.lazy(() => import('@/pages/client/ChatPage'));
const ProfilePage = React.lazy(() => import('@/pages/client/ProfilePage'));
const SettingsPage = React.lazy(() => import('@/pages/client/SettingsPage'));

// Páginas de admin
const AdminDashboard = React.lazy(() => import('@/pages/admin/dashboard'));
const UsersManagement = React.lazy(() => import('@/pages/admin/UsersManagement'));
const TenantsManagement = React.lazy(() => import('@/pages/admin/TenantsManagement'));
const SystemSettings = React.lazy(() => import('@/pages/admin/SystemSettings'));
const SystemLogs = React.lazy(() => import('@/pages/admin/SystemLogs'));
const SystemHealth = React.lazy(() => import('@/pages/admin/SystemHealth'));

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