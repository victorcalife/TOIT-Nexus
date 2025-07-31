import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/sidebar";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import SimpleLogin from "@/pages/simple-login";
import Dashboard from "@/pages/dashboard";
import Home from "@/pages/home";
import WorkingApp from "@/pages/working-app";
import CompleteToitSystem from "@/pages/complete-toit-system";
import ToitNexusComplete from '@/components/toit-nexus-complete';
import Clients from "@/pages/clients";
import Categories from "@/pages/categories";
import Workflows from "@/pages/workflows";
import Integrations from "@/pages/integrations";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import Connectivity from "@/pages/connectivity";
import Settings from "@/pages/settings";
import AccessControl from "@/pages/access-control";
import TenantSelection from "@/pages/tenant-selection";
import AdminDashboard from "@/pages/admin/dashboard";
import ToitAdmin from "@/pages/toit-admin";
import SystemSetup from "@/pages/system-setup";
import SelectTenant from "@/pages/select-tenant";
import QueryBuilderPage from "@/pages/query-builder";
import DataConnectionsPage from "@/pages/data-connections";
import TaskManagement from "@/pages/task-management";
import MyTasks from "@/pages/my-tasks";
import ModuleManagement from "@/pages/module-management";
import TestEverything from "@/pages/test-everything";
import { useQuery } from "@tanstack/react-query";

function Router() {
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

  // Not authenticated - show simple login
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/landing" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/" component={SimpleLogin} />
        <Route component={SimpleLogin} />
      </Switch>
    );
  }

  // Authenticated user routing
  return (
    <Switch>
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
        // Super admin vai para painel administrativo completo
        if (isSuperAdmin) {
          return <ToitAdmin />;
        }
        // Outros usuários vão para working app
        return <WorkingApp />;
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
