import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from './lib/queryClient';
import { AppRouter } from '@/components/routing/AppRouter';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';
import { BrowserRouter } from 'react-router-dom';
import { DomainRouter } from './components/routing/DomainRouter';

/**
 * Componente raiz da aplicação
 * 
 * Este componente configura os provedores globais e o roteamento da aplicação.
 * A estrutura de roteamento foi organizada em arquivos separados para melhor manutenção:
 * - /src/config/routes/: Contém as definições de rotas organizadas por contexto
 * - /src/components/routing/: Contém os componentes de roteamento
 * 
 * Documentação detalhada: /docs/ROUTING.md
 */

function AppContent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="toit-nexus-theme">
      <TooltipProvider>
        <Toaster />
        <DomainRouter>
          <AppRouter />
        </DomainRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
