import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig( {
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve( __dirname, "./src" ),
    },
    extensions: [ '.ts', '.tsx', '.js', '.jsx', '.json' ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [ 'react', 'react-dom' ],
          ui: [ '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast' ],
          charts: [ 'chart.js', 'react-chartjs-2', 'recharts' ],
          query: [ '@tanstack/react-query' ]
        }
      }
    }
  },
  // Configuração do servidor para desenvolvimento
  server: {
    // Prioriza a porta do Railway, depois PORT e usa 5173 como fallback
    port: process.env.RAILWAY_TCP_APPLICATION_PORT || process.env.PORT
      ? parseInt( process.env.RAILWAY_TCP_APPLICATION_PORT || process.env.PORT || '5173' )
      : 5173,
    // Habilita o acesso de qualquer endereço IP
    host: '0.0.0.0',
    // Habilita CORS para desenvolvimento
    cors: true,
    // Configura o proxy para a API
    proxy: process.env.NODE_ENV === 'development' ? {
      // No desenvolvimento, redireciona as requisições para a API
      '/api': {
        target: process.env.VITE_API_URL || 'https://api.toit.com.br',
        changeOrigin: true,
        secure: true,
      },
    } : undefined,
  },
  // Configuração do preview server para produção
  preview: {
    port: process.env.RAILWAY_TCP_APPLICATION_PORT || process.env.PORT
      ? parseInt( process.env.RAILWAY_TCP_APPLICATION_PORT || process.env.PORT || '4173' )
      : 4173,
    host: '0.0.0.0',
    cors: true,
    allowedHosts: ['admin.toit.com.br', 'toit.com.br'],
  }
} )