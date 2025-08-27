/**
 * CONFIGURAÇÃO DE AMBIENTE - FRONTEND
 * Centraliza todas as variáveis de ambiente do frontend
 */

// Configuração de ambiente - RAILWAY PRODUCTION
const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return 'nexus.toit.com.br';
};

const currentDomain = getCurrentDomain();

// URLs do Railway - usar variáveis de ambiente corretas
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                   import.meta.env.VITE_BACKEND_URL || 
                   'https://toit-nexus-backend-production.up.railway.app';

const FRONTEND_URL = currentDomain === 'nexus.toit.com.br' 
  ? 'https://nexus.toit.com.br'
  : 'https://supnexus.toit.com.br';

const SUPPORT_URL = 'https://supnexus.toit.com.br';

// Variáveis de ambiente
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Configuração da API
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      SIMPLE_LOGIN: '/api/simple-login',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
      REFRESH: '/api/auth/refresh'
    },
    USERS: '/api/users',
    TENANTS: '/api/tenants',
    HEALTH: '/api/health'
  }
};

// URLs dos domínios
export const DOMAIN_CONFIG = {
  FRONTEND: FRONTEND_URL,
  SUPPORT: SUPPORT_URL,
  API: API_BASE_URL
};

// Configuração do ambiente
export const ENV_CONFIG = {
  NODE_ENV: import.meta.env.MODE,
  IS_DEV: isDevelopment,
  IS_PROD: isProduction,
  API_URL: import.meta.env.VITE_API_URL || API_BASE_URL
};

// Log da configuração (sempre em produção para debug)
console.log( '🔧 [ENV-CONFIG] Configuração carregada:', {
  API_BASE_URL,
  FRONTEND_URL,
  SUPPORT_URL,
  NODE_ENV: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL
} );

export default {
  API_CONFIG,
  DOMAIN_CONFIG,
  ENV_CONFIG
};
