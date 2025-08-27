/**
 * CONFIGURAÇÃO DE AMBIENTE - FRONTEND
 * Centraliza todas as variáveis de ambiente do frontend
 */

// Configuração de ambiente - RAILWAY PRODUCTION
const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return 'toit.com.br';
};

const currentDomain = getCurrentDomain();

// URLs do Railway - usar variáveis de ambiente corretas
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                   import.meta.env.VITE_BACKEND_URL || 
                   'https://api.toit.com.br';

const FRONTEND_URL = currentDomain === 'toit.com.br'
  ? 'https://toit.com.br'
  : 'https://admin.toit.com.br';

const SUPPORT_URL = 'https://admin.toit.com.br';

// Configuração para produção Railway apenas
const isProduction = true;

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

// Configuração do ambiente - Railway Production
export const ENV_CONFIG = {
  NODE_ENV: 'production',
  IS_PROD: isProduction,
  API_URL: import.meta.env.VITE_API_URL || API_BASE_URL
};

// Log da configuração Railway
console.log( '🔧 [RAILWAY-CONFIG] Configuração de produção carregada:', {
  API_BASE_URL,
  FRONTEND_URL,
  SUPPORT_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL
} );

export default {
  API_CONFIG,
  DOMAIN_CONFIG,
  ENV_CONFIG
};
