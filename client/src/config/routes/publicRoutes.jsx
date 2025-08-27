import { lazy } from 'react';

// Lazy loading das páginas públicas
const HomePage = lazy( () => import( '@/pages/home' ) );
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
    path: '/',
    component: HomePage,
    exact: true,
  },
  {
    path: '/login',
    component: Login,
    exact: true,
  },
  {
    path: '/support-login',
    component: SupportLogin,
    exact: true,
  },
  {
    path: '/verify-account',
    component: VerifyAccount,
    exact: true,
  },
  {
    path: '/verify-email',
    component: VerifyEmail,
    exact: true,
  },
  {
    path: '/verify-phone',
    component: VerifyPhone,
    exact: true,
  },
  {
    path: '/verify-card',
    component: VerifyCard,
    exact: true,
  },
  {
    path: '/trial-signup',
    component: TrialSignup,
    exact: true,
  },
  {
    path: '/system-setup',
    component: SystemSetup,
    exact: true,
  },
  {
    path: '/404',
    component: NotFound, // Rota 404
  },
];

// Constantes de rotas para facilitar o uso
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SUPPORT_LOGIN: '/support-login',
  VERIFY_ACCOUNT: '/verify-account',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_PHONE: '/verify-phone',
  VERIFY_CARD: '/verify-card',
  TRIAL_SIGNUP: '/trial-signup',
  SYSTEM_SETUP: '/system-setup',
  NOT_FOUND: '/404',
  CLIENT_DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  SELECT_TENANT: '/select-tenant',
};
