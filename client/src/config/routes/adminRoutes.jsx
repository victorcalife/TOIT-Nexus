import { lazy } from 'react';

// Lazy loading das páginas administrativas
const AdminDashboard = lazy( () => import( '@/pages/admin/dashboard' ) );
const ProfileBuilder = lazy( () => import( '@/pages/admin/profile-builder' ) );
const SupportDashboard = lazy( () => import( '@/pages/support-dashboard' ) );
const ToitAdmin = lazy( () => import( '@/pages/toit-admin' ) );

// Rotas administrativas acessíveis apenas por super administradores
export const adminRoutes = [
  {
    path: '/admin/dashboard',
    component: AdminDashboard,
    exact: true,
    roles: [ 'super_admin' ],
    layout: 'admin',
  },
  {
    path: '/admin/profile-builder',
    component: ProfileBuilder,
    exact: true,
    roles: [ 'super_admin' ],
    layout: 'admin',
  },
  {
    path: '/support/dashboard',
    component: SupportDashboard,
    exact: true,
    roles: [ 'super_admin', 'toit_admin' ],
    layout: 'admin',
  },
  {
    path: '/admin',
    component: AdminDashboard,
    exact: false, // Permite subrotas
    roles: [ 'super_admin' ],
    layout: 'admin',
  },
  {
    path: '/toit-admin',
    component: ToitAdmin,
    exact: true,
    roles: [ 'super_admin', 'toit_admin' ],
    layout: 'admin',
  },
];
