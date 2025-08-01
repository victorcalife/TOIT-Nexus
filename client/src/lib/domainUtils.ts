/**
 * Utilitários para detecção de domínio e subdomínio
 */

export type LoginType = 'client' | 'support';

/**
 * Detecta o tipo de login baseado no domínio atual
 */
export function detectLoginType(): LoginType {
  if (typeof window === 'undefined') {
    return 'client'; // Default para SSR
  }
  
  const hostname = window.location.hostname.toLowerCase();
  
  // Detectar subdomínio de suporte
  if (
    hostname.startsWith('supnexus.') || 
    hostname.startsWith('support.') ||
    hostname.startsWith('suporte.') ||
    hostname === 'localhost:5173' // Para desenvolvimento
  ) {
    return 'support';
  }
  
  // Default para cliente
  return 'client';
}

/**
 * Redireciona para o login correto baseado no domínio
 */
export function redirectToCorrectLogin(): void {
  const loginType = detectLoginType();
  const currentPath = window.location.pathname;
  
  if (loginType === 'support' && currentPath === '/login') {
    // Se está no subdomínio de suporte mas na rota de cliente, redirecionar
    window.location.href = '/support-login';
  } else if (loginType === 'client' && currentPath === '/support-login') {
    // Se está no domínio de cliente mas na rota de suporte, redirecionar
    window.location.href = '/login';
  }
}

/**
 * Obter URL de login correto baseado no tipo
 */
export function getLoginUrl(type: LoginType): string {
  if (type === 'support') {
    return '/support-login';
  }
  return '/login';
}

/**
 * Obter URL de dashboard correto baseado no role do usuário
 */
export function getDashboardUrl(role: string): string {
  switch (role) {
    case 'super_admin':
      return '/admin/dashboard';
    case 'toit_admin':
      return '/support/dashboard';
    case 'tenant_admin':
    case 'manager':
    case 'employee':
    default:
      return '/dashboard';
  }
}

/**
 * Verificar se o usuário tem acesso de suporte
 */
export function hasSupportAccess(role: string): boolean {
  return role === 'super_admin' || role === 'toit_admin';
}

/**
 * Verificar se o usuário tem acesso financeiro (apenas super_admin)
 */
export function hasFinancialAccess(role: string): boolean {
  return role === 'super_admin';
}