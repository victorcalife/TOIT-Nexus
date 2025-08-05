/// <reference types="vite/client" />

// Permite a importação de arquivos SVG como componentes React
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

// Permite a importação de arquivos SVG como URLs
declare module '*.svg?url' {
  const content: string;
  export default content;
}

// Variáveis de ambiente do Vite
declare interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Adicione outras variáveis de ambiente aqui
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
