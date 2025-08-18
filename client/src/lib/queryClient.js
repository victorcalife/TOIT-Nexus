/**
 * CONFIGURAÇÃO DO REACT QUERY
 * Cliente HTTP unificado para comunicação com APIs
 * 100% JavaScript - SEM TYPESCRIPT
 */

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, ''); // Remove trailing slash
  }

  // Local development
  if (import.meta.env.DEV) {
    return 'http://localhost:8080';
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Construir URL completa para requisições
 */
const buildFullUrl = (url) => {
  if (url.startsWith('http')) {
    return url;
  }

  const baseUrl = API_BASE_URL;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  return `${baseUrl}${cleanUrl}`;
};

/**
 * Cliente HTTP personalizado
 */
export const httpClient = async (url, method = 'GET', data = null, headers = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  const fullUrl = buildFullUrl(url);

  const res = await fetch(fullUrl, {
    method,
    headers: defaultHeaders,
    body: data ? JSON.stringify(data) : null
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

/**
 * Query function padrão para React Query
 */
const defaultQueryFn = async ({ queryKey }) => {
  const url = buildFullUrl(queryKey.join('/'));

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

/**
 * Configuração padrão do React Query
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
};
