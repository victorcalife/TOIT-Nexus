import { lazy } from 'react';

// Lazy loading das páginas administrativas
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard'));
const ProfileBuilder = lazy(() => import('@/pages/admin/profile-builder'));
const SupportDashboard = lazy(() => import('@/pages/support-dashboard'));
const ToitAdmin = lazy(() => import('@/pages/toit-admin'));

// Rotas administrativas acessíveis apenas por super administradores
export const adminRoutes = [
  {
    path,
    component,
    exact,
    roles,
    layout,
  },
  {
    path,
    component,
    exact,
    roles,
    layout,
  },
  {
    path,
    component,
    exact,
    roles, 'toit_admin'],
    layout,
  },
  {
    path,
    component,
    exact, // Permite subrotas
    roles,
    layout,
  },
  {
    path,
    component,
    exact,
    roles, 'toit_admin'],
    layout,
  },
];
