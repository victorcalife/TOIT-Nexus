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
export // ,

  // Rotas de seleção de tenant
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },

  // Rotas principais do cliente
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
    roles, 'super_admin' ],
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
    roles, 'super_admin' ],
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
    roles, 'super_admin' ],
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout, // Layout mínimo para callbacks
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
  {
    path,
    component,
    exact,
    layout,
    requiresTenant,
  },
];
