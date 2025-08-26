/**
 * CONFIGURAÇÃO DE AMBIENTE - FRONTEND
 * Centraliza todas as variáveis de ambiente do frontend
 */

// Detectar ambiente
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// URLs base - Detectar domínio atual para usar a API correta
const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return 'localhost';
};

const currentDomain = getCurrentDomain();

const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://localhost:3000';

const FRONTEND_URL = isDevelopment    
  ? 'http://localhost:3000'
  : currentDomain === 'nexus.toit.com.br' 
    ? 'https://nexus.toit.com.br'
    : currentDomain === 'supnexus.toit.com.br'
    ? 'https://supnexus.toit.com.br'
    : 'https://toit-nexus-frontend-production.up.railway.app';

const SUPPORT_URL = isDevelopment
  ? 'http://localhost:5173'
  : 'https://toit-nexus-frontend-production.up.railway.app';

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
