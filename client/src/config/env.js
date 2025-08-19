/**
 * CONFIGURAÇÃO DE AMBIENTE - FRONTEND
 * Centraliza todas as variáveis de ambiente do frontend
 */

// Detectar ambiente
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// URLs base
const API_BASE_URL = isDevelopment
  ? 'http://localhost:8080'
  : 'https://api.toit.com.br';

const FRONTEND_URL = isDevelopment
  ? 'http://localhost:5173'
  : 'https://nexus.toit.com.br';

const SUPPORT_URL = isDevelopment
  ? 'http://localhost:5173'
  : 'https://supnexus.toit.com.br';

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

// Log da configuração (apenas em desenvolvimento)
if ( isDevelopment )
{
  console.log( '🔧 [ENV-CONFIG] Configuração carregada:', {
    API_BASE_URL,
    FRONTEND_URL,
    SUPPORT_URL,
    NODE_ENV: import.meta.env.MODE
  } );
}

export default {
  API_CONFIG,
  DOMAIN_CONFIG,
  ENV_CONFIG
};
