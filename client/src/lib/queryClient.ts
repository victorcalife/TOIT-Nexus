import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Base URL para API - Railway ou local
const getApiBaseUrl = () => {
  // Se VITE_API_URL estiver definida (Railway), usar ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, ''); // Remove trailing slash
  }
  
  // Local development
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  
  // Production fallback (mesmo domínio)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper para construir URL completa
const buildFullUrl = (url: string): string => {
  if (url.startsWith('http')) return url; // URL absoluta
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`; // Path relativo
  return `${API_BASE_URL}/${url}`; // Path sem barra
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = buildFullUrl(url);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = buildFullUrl(queryKey.join("/") as string);
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
