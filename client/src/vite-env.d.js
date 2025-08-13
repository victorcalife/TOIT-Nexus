/// <reference types="vite/client" />

// Permite a importação de arquivos SVG como componentes React
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent