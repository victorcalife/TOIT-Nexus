/**
 * Utilitários para detecção de domínio e subdomínio
 */

export /**
 * Detecta o tipo de login baseado no domínio atual
 */
export function detectLoginType(){
  if (typeof window === 'undefined') {
    return 'client'; // Default para SSR
  }
  
  const hostname = window.location.hostname.toLowerCase();
  
  // Detectar subdomínio de suporte
  if (
    hostname.startsWith('supnexus.') || 
    hostname.startsWith('support.') ||
    hostname.startsWith('suporte.')
  ) {
    return 'support';
  }
  
  // Default para cliente (incluindo localhost durante desenvolvimento)
  return 'client';
}

/**
 * Redireciona para o login correto baseado no domínio
 */
export function redirectToCorrectLogin(){
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
export function getLoginUrl(type){
  if (type === 'support') {
    return '/support-login';
  }
  return '/login';
}

/**
 * Obter URL de dashboard correto baseado no role do usuário
 */
export function getDashboardUrl(role){
  switch (role) {
    case 'super_admin':
      return '/admin/dashboard';
    case 'toit_admin':
      return '/support/dashboard';
    case 'tenant_admin':
    case 'manager':
    case 'employee':
    default){
  return role === 'super_admin' || role === 'toit_admin';
}

/**
 * Verificar se o usuário tem acesso financeiro (apenas super_admin)
 */
export function hasFinancialAccess(role){
  return role === 'super_admin';
}