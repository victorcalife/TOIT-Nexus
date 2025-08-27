import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from './lib/queryClient';
import { AppRouter } from '@/components/routing/AppRouter';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from '@/hooks/useAuth';

const API_BASE_URL = 'https://api.toit.com.br';

function App()
{
  return (
    <QueryClientProvider client={ queryClient }>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="toit-nexus-theme">
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
