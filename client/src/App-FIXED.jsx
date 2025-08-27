import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './hooks/useAuth';

// Lazy load das páginas
const Login = React.lazy( () => import( './pages/login' ) );
const SupportLogin = React.lazy( () => import( './pages/support-login' ) );
const Dashboard = React.lazy( () => import( './pages/dashboard' ) );
const NotFound = React.lazy( () => import( './pages/not-found' ) );

// Loading spinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Componente de rota baseada em domínio
function DomainBasedRoute()
{
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname;

  console.log( `🌐 [DOMAIN-ROUTE] Hostname: ${ hostname } | Path: ${ pathname }` );

  // Se é admin.toit.com.br, sempre mostrar support-login
  if ( hostname === 'admin.toit.com.br' )
  {
    console.log( `🛡️ [SUPNEXUS] Carregando support-login` );
    return <SupportLogin />;
  }

  // Se é toit.com.br
  if ( hostname === 'toit.com.br' )
  {
    // Se está na rota raiz (/), redirecionar para login
    if ( pathname === '/' )
    {
      console.log( `🔐 [NEXUS-ROOT] Redirecionando para login` );
      return <Navigate to="/login" replace />;
    }

    // Se está na rota /login, mostrar login de cliente
    if ( pathname === '/login' )
    {
      console.log( `🔐 [NEXUS-LOGIN] Carregando login de cliente` );
      return <Login />;
    }

    // Se está na rota /dashboard, mostrar dashboard
    if ( pathname === '/dashboard' )
    {
      console.log( `📊 [NEXUS-DASHBOARD] Carregando dashboard` );
      return <Dashboard />;
    }

    // Se está na rota /support-login, mostrar support-login
    if ( pathname === '/support-login' )
    {
      console.log( `🛡️ [NEXUS-SUPPORT] Carregando support-login` );
      return <SupportLogin />;
    }
  }

  // Para outros domínios, redirecionar para login também
  console.log( `🔄 [FALLBACK] Redirecionando para login` );
  return <Navigate to="/login" replace />;
}

function App()
{
  return (
    <QueryClientProvider client={ queryClient }>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="toit-nexus-theme">
          <TooltipProvider>
            <Router>
              <Toaster />
              <Suspense fallback={ <LoadingSpinner /> }>
                <Routes>
                  {/* Rota específica para login */ }
                  <Route path="/login" element={ <Login /> } />

                  {/* Rota específica para support-login */ }
                  <Route path="/support-login" element={ <SupportLogin /> } />

                  {/* Rota específica para dashboard */ }
                  <Route path="/dashboard" element={ <Dashboard /> } />

                  {/* Rota raiz baseada em domínio */ }
                  <Route path="/" element={ <DomainBasedRoute /> } />

                  {/* Fallback para 404 */ }
                  <Route path="*" element={ <NotFound /> } />
                </Routes>
              </Suspense>
            </Router>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
