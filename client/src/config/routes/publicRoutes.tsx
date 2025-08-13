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
    path: '/setup',
    component: SystemSetup,
    exact: true,
  },
  {
    path: '*',
    component: NotFound, // Rota 404
  },
];
