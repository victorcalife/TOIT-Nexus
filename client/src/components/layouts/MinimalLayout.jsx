import React from 'react';

/**
 * Layout mínimo para páginas públicas
 * Renderiza apenas o conteúdo sem estruturas complexas
 */
export default function MinimalLayout({ children }) {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
}