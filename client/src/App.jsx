import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from './lib/queryClient';
import { AppRouter } from '@/components/routing/AppRouter';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';

function App()
{
  return (
    <QueryClientProvider client={ queryClient }>
      <ThemeProvider defaultTheme="system" storageKey="toit-nexus-theme">
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
