// Exporta todos os tipos e constantes de rotas
export * from './publicRoutes';
export * from './adminRoutes';
export * from './clientRoutes';

// Tipos exportados
export type { RouteConfig } from './clientRoutes';

export const ROUTES = {
  // Rotas públicas
  LOGIN: '/login',
  SUPPORT_LOGIN: '/support-login',
  VERIFY_ACCOUNT: '/verify-account',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_PHONE: '/verify-phone',
  SETUP: '/setup',

  // Rotas administrativas
  ADMIN_DASHBOARD: '/admin/dashboard',
  PROFILE_BUILDER: '/admin/profile-builder',
  SUPPORT_DASHBOARD: '/support/dashboard',
  TOIT_ADMIN: '/toit-admin',

  // Rotas do cliente
  SELECT_TENANT: '/select-tenant',
  TENANT_SELECTION: '/tenant-selection',
  CLIENT_DASHBOARD: '/client-dashboard',
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
  CATEGORIES: '/categories',
  WORKFLOWS: '/workflows',
  INTEGRATIONS: '/integrations',
  REPORTS: '/reports',
  USERS: '/users',
  CONNECTIVITY: '/connectivity',
  SETTINGS: '/settings',
  ACCESS_CONTROL: '/access-control',
  QUERY_BUILDER: '/query-builder',
  DATA_CONNECTIONS: '/data-connections',
  TASK_MANAGEMENT: '/task-management',
  ADVANCED_TASK_MANAGEMENT: '/advanced-task-management',
  MY_TASKS: '/my-tasks',
  MODULE_MANAGEMENT: '/module-management',
  CALENDAR_INTEGRATIONS: '/calendar-integrations',
  CALENDAR_CALLBACK: '/calendar-callback',
  QUANTUM_ML_COMMERCIAL: '/quantum-ml-commercial',
  FILE_UPLOAD: '/file-upload',
  DEPARTMENT_MANAGEMENT: '/department-management',
  USER_DATA_PERMISSIONS: '/user-data-permissions',
};

// Função auxiliar para verificar se um usuário tem permissão para acessar uma rota
export const hasPermission = ( userRole: string | undefined, requiredRoles?: string[] ): boolean =>
{
  // Se não há roles requeridas, qualquer usuário autenticado pode acessar
  if ( !requiredRoles || requiredRoles.length === 0 ) return true;

  // Se o usuário não tem role, não tem permissão
  if ( !userRole ) return false;

  // Verifica se a role do usuário está na lista de roles permitidas
  return requiredRoles.includes( userRole );
};
