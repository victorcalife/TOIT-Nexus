/**
 * CONFIGURAÇÃO DO REACT QUERY
 * Cliente HTTP unificado para comunicação com APIs
 * 100% JavaScript - SEM TYPESCRIPT
 */

const getApiBaseUrl = () =>
{
  // Configuração Railway - usar variável de ambiente ou fallback
  if ( import.meta.env.VITE_API_URL )
  {
    return import.meta.env.VITE_API_URL.replace( /\/$/, '' ); // Remove trailing slash
  }

  // URL padrão do Railway para produção
  return 'https://api.toit.com.br';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Construir URL completa para requisições
 */
const buildFullUrl = ( url ) =>
{
  if ( url.startsWith( 'http' ) )
  {
    return url;
  }

  const baseUrl = API_BASE_URL;
  const cleanUrl = url.startsWith( '/' ) ? url : `/${ url }`;
  return `${ baseUrl }${ cleanUrl }`;
};

/**
 * Cliente HTTP personalizado
 */
export const httpClient = async ( url, method = 'GET', data = null, headers = {} ) =>
{
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  const fullUrl = buildFullUrl( url );

  const res = await fetch( fullUrl, {
    method,
    headers: defaultHeaders,
    body: data ? JSON.stringify( data ) : null
  } );

  if ( !res.ok )
  {
    throw new Error( `HTTP error! status: ${ res.status }` );
  }

  return res.json();
};

/**
 * Query function padrão para React Query
 */
const defaultQueryFn = async ( { queryKey } ) =>
{
  const url = buildFullUrl( queryKey.join( '/' ) );

  const res = await fetch( url, {
    headers: {
      'Content-Type': 'application/json'
    }
  } );

  if ( !res.ok )
  {
    throw new Error( `HTTP error! status: ${ res.status }` );
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

/**
 * Instância do QueryClient
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient( queryClientConfig );

/**
 * Função para fazer requisições HTTP
 */
export const apiRequest = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  // Adicionar token de autenticação se disponível
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    ...defaultOptions,
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Função helper para queries
 */
export const getQueryFn = (url) => () => apiRequest(url);