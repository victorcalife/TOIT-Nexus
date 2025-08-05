import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";

// Loading spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// APENAS páginas essenciais que sabemos que existem
const Login = lazy(() => import("@/pages/login"));
const SupportLogin = lazy(() => import("@/pages/support-login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/support-login" component={SupportLogin} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/" component={() => {
        const hostname = window.location.hostname.toLowerCase();
        const isSupportDomain = hostname.includes('supnexus.toit.com.br');
        
        console.log(`🌐 Hostname: ${hostname} | isSupportDomain: ${isSupportDomain}`);
        
        if (isSupportDomain) {
          return <SupportLogin />;
        }
        
        return <Login />;
      }} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Router />
    </Suspense>
  );
}

export default App;