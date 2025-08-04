import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { detectLoginType, redirectToCorrectLogin } from "@/lib/domainUtils";
import { Suspense, lazy } from "react";

// Componente de loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Lazy loading das páginas principais
const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/landing"));
const Login = lazy(() => import("@/pages/login"));
const SupportLogin = lazy(() => import("@/pages/support-login"));
const VerifyAccount = lazy(() => import("@/pages/verify-account"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const VerifyPhone = lazy(() => import("@/pages/verify-phone"));
const SupportDashboard = lazy(() => import("@/pages/support-dashboard"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Home = lazy(() => import("@/pages/home"));
const WorkingApp = lazy(() => import("@/pages/working-app"));
const CompleteToitSystem = lazy(() => import("@/pages/complete-toit-system"));
const ToitNexusComplete = lazy(() => import("@/components/toit-nexus-complete"));
const Clients = lazy(() => import("@/pages/clients"));
const Categories = lazy(() => import("@/pages/categories"));
const Workflows = lazy(() => import("@/pages/workflows"));
const Integrations = lazy(() => import("@/pages/integrations"));
const Reports = lazy(() => import("@/pages/reports"));
const Users = lazy(() => import("@/pages/users"));
const Connectivity = lazy(() => import("@/pages/connectivity"));
const Settings = lazy(() => import("@/pages/settings"));
const AccessControl = lazy(() => import("@/pages/access-control"));
const TenantSelection = lazy(() => import("@/pages/tenant-selection"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const ProfileBuilder = lazy(() => import("@/pages/admin/profile-builder"));
const ToitAdmin = lazy(() => import("@/pages/toit-admin"));
const SystemSetup = lazy(() => import("@/pages/system-setup"));
const SelectTenant = lazy(() => import("@/pages/select-tenant"));
const QueryBuilderPage = lazy(() => import("@/pages/query-builder"));
const DataConnectionsPage = lazy(() => import("@/pages/data-connections"));
const TaskManagement = lazy(() => import("@/pages/task-management"));
const MyTasks = lazy(() => import("@/pages/my-tasks"));
const ModuleManagement = lazy(() => import("@/pages/module-management"));
const TestEverything = lazy(() => import("@/pages/test-everything"));
const ClientDashboard = lazy(() => import("@/pages/client-dashboard"));
const CalendarIntegrations = lazy(() => import("@/pages/calendar-integrations"));
const CalendarCallback = lazy(() => import("@/pages/calendar-callback"));
const QuantumMLCommercial = lazy(() => import("@/pages/quantum-ml-commercial"));

function Router() {
  // SOLUÇÃO SIMPLES: Se for nexus domain, NÃO renderizar React App
  const hostname = window.location.hostname.toLowerCase();
  const isNexusDomain = hostname.includes('nexus.toit.com.br') || hostname.startsWith('nexus.');
  
  if (isNexusDomain) {
    // Recarregar página para forçar backend servir HTML estático
    window.location.reload();
    return null;
  }

  const { isAuthenticated, isLoading, user, isSuperAdmin } = useAuth();
  
  // Check if system needs setup
  const { data: setupStatus, isLoading: setupLoading } = useQuery({
    queryKey: ['/api/setup-status'],
    enabled: !isLoading // Only check after auth loading completes
  });

  if (isLoading || setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // If system needs setup, show setup page
  if (setupStatus && (setupStatus as any).needsSetup) {
    return <SystemSetup />;
  }

  // Not authenticated - show appropriate login or landing page
  if (!isAuthenticated) {
    // Detectar se é subdomínio de suporte para mostrar página de login específica
    const isSupportDomain = hostname.includes('supnexus.toit.com.br') || hostname.startsWith('supnexus.') || hostname === 'supnexus';
    
    // Debug log para verificar detecção
    console.log(`🌐 Frontend - Hostname: ${hostname} | isSupportDomain: ${isSupportDomain}`);
    
    // Se for domínio de suporte, mostrar APENAS página de suporte (não roteamento completo)
    if (isSupportDomain) {
      console.log('🚀 Frontend - Mostrando SupportLogin para supnexus');
      return <SupportLogin />;
    }
    
    // Para outros domínios (localhost, etc) - mostrar login
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/verify-account" component={VerifyAccount} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/verify-phone" component={VerifyPhone} />
        <Route path="/support-login" component={SupportLogin} />
        <Route path="/" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  // Authenticated user routing
  return (
    <Switch>
      {/* Support Dashboard route */}
      <Route path="/support/dashboard" component={() => {
        if (!user || (user.role !== 'super_admin' && user.role !== 'toit_admin')) {
          return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="mb-4">Apenas membros da equipe TOIT podem acessar esta área.</p>
              <a href="/" className="text-blue-600 hover:underline">Voltar ao início</a>
            </div>
          </div>;
        }
        return <SupportDashboard />;
      }} />

      {/* TOIT Admin routes (super admin only) */}
      <Route path="/admin" component={() => {
        if (!isSuperAdmin) {
          return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="mb-4">Apenas super administradores podem acessar esta área.</p>
              <a href="/" className="text-blue-600 hover:underline">Voltar ao início</a>
            </div>
          </div>;
        }
        return <AdminDashboard />;
      }} />
      
      <Route path="/admin/profile-builder" component={() => {
        if (!isAuthenticated) {
          return <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Verificando autenticação...</p>
            </div>
          </div>;
        }
        
        if (!isSuperAdmin) {
          return <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
            <p className="text-sm text-gray-500">Apenas super administradores podem configurar perfis de acesso.</p>
          </div>;
        }
        return <ProfileBuilder />;
      }} />
      
      <Route path="/admin/:rest*" component={() => {
        if (!isSuperAdmin) {
          return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="mb-4">Apenas super administradores podem acessar esta área.</p>
              <a href="/" className="text-blue-600 hover:underline">Voltar ao início</a>
            </div>
          </div>;
        }
        return <AdminDashboard />;
      }} />

      {/* Tenant selection */}
      <Route path="/select-tenant" component={SelectTenant} />
      <Route path="/tenant-selection" component={TenantSelection} />

      {/* Main application routes */}
      <Route path="/" component={() => {
        // Detectar tipo de domínio para definir comportamento
        const hostname = window.location.hostname;
        const isSupportDomain = hostname.startsWith('supnexus.');
        
        if (isSupportDomain) {
          // Portal TOIT (supnexus) - FERRAMENTA COMPLETA
          if (user?.role === 'super_admin') {
            return <AdminDashboard />; // Dashboard administrativo completo
          } else if (user?.role === 'toit_admin') {
            return <ToitAdmin />; // Painel TOIT administrativo
          } else {
            // Usuários que não são da equipe TOIT não podem acessar
            return (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
                  <p className="mb-4">Apenas membros da equipe TOIT podem acessar esta área.</p>
                  <a href="/login" className="text-blue-600 hover:underline">Fazer login como cliente</a>
                </div>
              </div>
            );
          }
        } else {
          // Portal Cliente (nexus) - FERRAMENTA LIMITADA POR MÓDULOS/PERFIL
          // Todos os usuários (incluindo super_admin) usam interface limitada no portal cliente
          return <ClientDashboard />;
        }
      }} />
      <Route path="/test-everything" component={TestEverything} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={() => {
        // If user has no tenant, redirect to tenant selection
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Dashboard />
            </main>
          </div>
        );
      }} />

      <Route path="/clients" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Clients />
            </main>
          </div>
        );
      }} />

      <Route path="/categories" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Categories />
            </main>
          </div>
        );
      }} />

      <Route path="/workflows" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Workflows />
            </main>
          </div>
        );
      }} />

      <Route path="/integrations" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Integrations />
            </main>
          </div>
        );
      }} />

      <Route path="/reports" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Reports />
            </main>
          </div>
        );
      }} />

      <Route path="/users" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Users />
            </main>
          </div>
        );
      }} />

      <Route path="/access-control" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <AccessControl />
            </main>
          </div>
        );
      }} />

      <Route path="/connectivity" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Connectivity />
            </main>
          </div>
        );
      }} />

      <Route path="/query-builder" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <QueryBuilderPage />
            </main>
          </div>
        );
      }} />

      <Route path="/data-connections" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <DataConnectionsPage />
            </main>
          </div>
        );
      }} />

      <Route path="/settings" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Settings />
            </main>
          </div>
        );
      }} />

      <Route path="/task-management" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <TaskManagement />
            </main>
          </div>
        );
      }} />

      <Route path="/my-tasks" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <MyTasks />
            </main>
          </div>
        );
      }} />

      <Route path="/module-management" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <ModuleManagement />
            </main>
          </div>
        );
      }} />
      
      <Route path="/calendar-integrations" component={() => {
        if (!user?.tenant) {
          window.location.href = '/select-tenant';
          return null;
        }
        return (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <CalendarIntegrations />
            </main>
          </div>
        );
      }} />
      
      <Route path="/calendar-callback" component={CalendarCallback} />

      <Route component={NotFound} />

      {/* Catch-all 404 route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Suspense fallback={<LoadingSpinner />}>
          <Router />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
