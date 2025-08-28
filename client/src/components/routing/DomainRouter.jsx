import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

// Domínios configurados para o roteamento
const DOMAINS = {
  /** Domínio principal da aplicação */

  /** Domínio para a área administrativa */

};

// Componente de roteamento baseado no domínio
const DomainRouter = ( { children } ) => {
  const location = useLocation();

  // Se não for um caminho de API, ignora o restante do roteamento
  if ( location.pathname.startsWith( '/api' ) )
  {
    return <>
      {children}
    </>;
  }

  const currentDomain = window.location.hostname;
  // Verifica se o domínio atual é o de suporte
  const isSupportDomain = currentDomain === DOMAINS.SUPPORT;
  // Verifica se o domínio atual é o principal
  const isMainDomain = currentDomain === DOMAINS.NEXUS;

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
