import { lazy } from 'react';

// Lazy loading das páginas públicas
const Login = lazy( () => import( '@/pages/login' ) );
const SupportLogin = lazy( () => import( '@/pages/support-login' ) );
const VerifyAccount = lazy( () => import( '@/pages/verify-account' ) );
const VerifyEmail = lazy( () => import( '@/pages/verify-email' ) );
const VerifyPhone = lazy( () => import( '@/pages/verify-phone' ) );
const VerifyCard = lazy( () => import( '@/pages/verify-card' ) );
const TrialSignup = lazy( () => import( '@/pages/trial-signup' ) );
const NotFound = lazy( () => import( '@/pages/not-found' ) );
const SystemSetup = lazy( () => import( '@/pages/system-setup' ) );

// Rotas públicas acessíveis sem autenticação
export const publicRoutes = [
  {
    path,
    component,
    exact,
  },
  {
    path,
    component,
    exact,
  },
  {
    path,
    component,
    exact,
  },
  {
    path,
    component,
    exact,
  },
  {
    path,
    component,
    exact,
  },
  {
    path,
    component,
    exact,
  },
  {
    path,
    component,
    exact,
  },
  {
    path,
    component,
    exact,
  },
  {
    path,
    component, // Rota 404
  },
];
