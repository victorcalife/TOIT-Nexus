import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Bibliotecas principais React
          'react-vendor': ['react', 'react-dom'],
          // Radix UI componentes
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-scroll-area'
          ],
          // Utilitários de charts e gráficos
          'charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          // React Query e estado
          'state-management': ['@tanstack/react-query'],
          // Ícones Lucide
          'icons': ['lucide-react'],
          // Utilitários CSS e styling
          'styling': ['tailwind-merge', 'class-variance-authority', 'clsx'],
          // Framer Motion para animações
          'animations': ['framer-motion'],
          // Bibliotecas de formulários
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Aumentar limite para 1MB
  },
  define: {
    // Expor variáveis de ambiente para o frontend
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});