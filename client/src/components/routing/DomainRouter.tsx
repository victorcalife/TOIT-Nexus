import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

// Domínios configurados para o roteamento
const DOMAINS = {
  /** Domínio principal da aplicação */
  NEXUS: 'nexus.toit.com.br',
  /** Domínio para a área administrativa */
  SUPPORT: 'supnexus.toit.com.br',
} as const;

interface DomainRouterProps
{
  children: React.ReactNode;
}

/**
 * Componente para gerenciar o roteamento baseado em domínio
 * 
 * - Redireciona automaticamente para /support-login ao acessar o domínio de suporte na raiz
 * - Permite o acesso normal ao domínio principal (nexus.toit.com.br)
 * - Funciona corretamente em ambiente de desenvolvimento (localhost/127.0.0.1)
 */
export const DomainRouter: React.FC<DomainRouterProps> = ( { children } ) =>
{
  const location = useLocation();

  // Verifica se está rodando no navegador
  const isBrowser = typeof window !== 'undefined';

  // Em SSR ou durante a renderização no servidor, apenas renderiza os filhos
  if ( !isBrowser )
  {
    return <>{children}</>;
  }

  const currentDomain = window.location.hostname;
  // Verifica se o domínio atual é o de suporte
  const isSupportDomain = currentDomain === DOMAINS.SUPPORT;
  // Verifica se o domínio atual é o principal
  const isMainDomain = currentDomain === DOMAINS.NEXUS || 
    (process.env['NODE_ENV'] === 'development' && 
     (currentDomain === 'localhost' || currentDomain === '127.0.0.1'));

  // Se for o domínio de suporte e estiver na raiz, redireciona para o login de suporte
  if ( isSupportDomain && location.pathname === '/' )
  {
    return <Navigate to="/support-login" replace />;
  }

  // Se for o domínio principal e estiver na raiz, permite a renderização normal (a landing page será servida pelo backend)
  if ( isMainDomain && location.pathname === '/' )
  {
    return <>{children}</>;
  }

  // Para todas as outras situações, renderiza os filhos normalmente
  return <>{children}</>;
};

export default DomainRouter;
