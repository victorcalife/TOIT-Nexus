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
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Categories from "@/pages/categories";
import Workflows from "@/pages/workflows";
import Integrations from "@/pages/integrations";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import Connectivity from "@/pages/connectivity";
import Settings from "@/pages/settings";
import TenantSelection from "@/pages/tenant-selection";
import AdminDashboard from "@/pages/admin/dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Not authenticated - show landing page or login
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Authenticated user routing based on role and tenant access
  return (
    <Switch>
      {/* Admin routes for super admin */}
      {user?.isSuperAdmin && (
        <Route path="/admin/:rest*">
          {(params) => (
            <div className="min-h-screen bg-gray-50">
              <Switch>
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/dashboard" component={AdminDashboard} />
                <Route component={NotFound} />
              </Switch>
            </div>
          )}
        </Route>
      )}

      {/* Tenant selection for users without active tenant or super admin wanting to access client area */}
      {(!user?.tenant || window.location.pathname === '/select-tenant') && (
        <Route path="/select-tenant" component={TenantSelection} />
      )}

      {/* Main tenant-based application */}
      {user?.tenant ? (
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/clients" component={Clients} />
            <Route path="/categories" component={Categories} />
            <Route path="/workflows" component={Workflows} />
            <Route path="/integrations" component={Integrations} />
            <Route path="/reports" component={Reports} />
            <Route path="/users" component={Users} />
            <Route path="/connectivity" component={Connectivity} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
      ) : (
        // Redirect to tenant selection if no tenant is selected
        <Route path="/:rest*">
          {() => {
            window.location.href = '/select-tenant';
            return null;
          }}
        </Route>
      )}

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
