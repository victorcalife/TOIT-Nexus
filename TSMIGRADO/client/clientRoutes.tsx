import { lazy } from 'react';

// Lazy loading das páginas do cliente
const ClientDashboard = lazy( () => import( '@/pages/client-dashboard' ) );
const Dashboard = lazy( () => import( '@/pages/dashboard' ) );
const Clients = lazy( () => import( '@/pages/clients' ) );
const Categories = lazy( () => import( '@/pages/categories' ) );
const Workflows = lazy( () => import( '@/pages/workflows' ) );
const Integrations = lazy( () => import( '@/pages/integrations' ) );
const Reports = lazy( () => import( '@/pages/reports' ) );
const Users = lazy( () => import( '@/pages/users' ) );
const Connectivity = lazy( () => import( '@/pages/connectivity' ) );
const Settings = lazy( () => import( '@/pages/settings' ) );
const AccessControl = lazy( () => import( '@/pages/access-control' ) );
const QueryBuilderPage = lazy( () => import( '@/pages/query-builder' ) );
const DataConnectionsPage = lazy( () => import( '@/pages/data-connections' ) );
const TaskManagement = lazy( () => import( '@/pages/task-management' ) );
const MyTasks = lazy( () => import( '@/pages/my-tasks' ) );
const ModuleManagement = lazy( () => import( '@/pages/module-management' ) );
const CalendarIntegrations = lazy( () => import( '@/pages/calendar-integrations' ) );
const CalendarCallback = lazy( () => import( '@/pages/calendar-callback' ) );
const QuantumMLCommercial = lazy( () => import( '@/pages/quantum-ml-commercial' ) );
const MLConfiguration = lazy( () => import( '@/pages/ml-configuration' ) );
const EmailTriggers = lazy( () => import( '@/pages/email-triggers' ) );
const FileUpload = lazy( () => import( '@/pages/file-upload' ) );
const AdvancedTaskManagement = lazy( () => import( '@/pages/advanced-task-management' ) );
const DepartmentManagement = lazy( () => import( '@/pages/department-management' ) );
const UserDataPermissions = lazy( () => import( '@/pages/user-data-permissions' ) );
const SelectTenant = lazy( () => import( '@/pages/select-tenant' ) );
const TenantSelection = lazy( () => import( '@/pages/tenant-selection' ) );
const Landing = lazy( () => import( '@/pages/landing' ) );

// Tipos de layout disponíveis
export type LayoutType = 'default' | 'client' | 'admin' | 'minimal';

// Interface para as rotas
export interface RouteConfig
{
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  roles?: string[]; // Funções que têm permissão para acessar a rota
  layout?: LayoutType; // Layout a ser usado
  requiresTenant?: boolean; // Se a rota requer um tenant selecionado
}

// Rotas do cliente - acessíveis por usuários autenticados
export const clientRoutes: RouteConfig[] = [
  // Landing page route for main domain
  {
    path: '/',
    component: Landing,
    exact: true,
    layout: 'default',
    requiresTenant: false,
  },

  // Rotas de seleção de tenant
  {
    path: '/select-tenant',
    component: SelectTenant,
    exact: true,
    layout: 'minimal',
    requiresTenant: false,
  },
  {
    path: '/tenant-selection',
    component: TenantSelection,
    exact: true,
    layout: 'minimal',
    requiresTenant: false,
  },

  // Rotas principais do cliente
  {
    path: '/dashboard',
    component: Dashboard,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/clients',
    component: Clients,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/categories',
    component: Categories,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/workflows',
    component: Workflows,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/integrations',
    component: Integrations,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/reports',
    component: Reports,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/users',
    component: Users,
    exact: true,
    layout: 'client',
    requiresTenant: true,
    roles: [ 'admin', 'super_admin' ],
  },
  {
    path: '/connectivity',
    component: Connectivity,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/settings',
    component: Settings,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/access-control',
    component: AccessControl,
    exact: true,
    layout: 'client',
    requiresTenant: true,
    roles: [ 'admin', 'super_admin' ],
  },
  {
    path: '/query-builder',
    component: QueryBuilderPage,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/data-connections',
    component: DataConnectionsPage,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/task-management',
    component: TaskManagement,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/my-tasks',
    component: MyTasks,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/module-management',
    component: ModuleManagement,
    exact: true,
    layout: 'client',
    requiresTenant: true,
    roles: [ 'admin', 'super_admin' ],
  },
  {
    path: '/calendar-integrations',
    component: CalendarIntegrations,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/calendar-callback',
    component: CalendarCallback,
    exact: true,
    layout: 'minimal', // Layout mínimo para callbacks
    requiresTenant: false,
  },
  {
    path: '/quantum-ml-commercial',
    component: QuantumMLCommercial,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/ml-configuration',
    component: MLConfiguration,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/email-triggers',
    component: EmailTriggers,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/file-upload',
    component: FileUpload,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/advanced-task-management',
    component: AdvancedTaskManagement,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/department-management',
    component: DepartmentManagement,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/user-data-permissions',
    component: UserDataPermissions,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
  {
    path: '/client-dashboard',
    component: ClientDashboard,
    exact: true,
    layout: 'client',
    requiresTenant: true,
  },
];
