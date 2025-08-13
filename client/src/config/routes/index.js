// Exporta todos os tipos e constantes de rotas
export * from './publicRoutes';
export * from './adminRoutes';
export * from './clientRoutes';

// Tipos exportados
export // Função auxiliar para verificar se um usuário tem permissão para acessar uma rota
export const hasPermission = ( userRole, requiredRoles?)=>
{
  // Se não há roles requeridas, qualquer usuário autenticado pode acessar
  if ( !requiredRoles || requiredRoles.length === 0 ) return true;

  // Se o usuário não tem role, não tem permissão
  if ( !userRole ) return false;

  // Verifica se a role do usuário está na lista de roles permitidas
  return requiredRoles.includes( userRole );
};
