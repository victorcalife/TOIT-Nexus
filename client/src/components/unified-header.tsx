import { Button } from '@/components/ui/button';
import { LogOut, LogIn, User, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import toitNexusLogo from '@/assets/toit-nexus-logo.svg';

interface UnifiedHeaderProps {
  title: string;
  subtitle?: string;
  showUserActions?: boolean;
  user?: any;
  onLogout?: () => void;
}

export function UnifiedHeader({ 
  title, 
  subtitle, 
  showUserActions = false, 
  user: propUser, 
  onLogout 
}: UnifiedHeaderProps) {
  const { isAuthenticated, user: authUser, isLoading } = useAuth();
  
  // Try demo auth if regular auth fails
  let demoAuth;
  try {
    demoAuth = useDemoAuth();
  } catch {
    demoAuth = null;
  }
  
  const finalAuth = demoAuth || { isAuthenticated, isLoading, user: authUser };
  
  // Use prop user if provided, otherwise use auth user
  const displayUser = propUser || finalAuth.user;
  
  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/api/logout';
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <header 
      className="text-white shadow-lg"
      style={{
        background: 'linear-gradient(90deg, #1e3a8a 0%, #581c87 50%, #06b6d4 100%)',
        backgroundSize: '100% 100%'
      }}
    >
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={goHome}>
            <img 
              src={toitNexusLogo} 
              alt="TOIT-Nexus" 
              className="h-12 w-12"
              style={{ transform: 'scale(1.15)' }}
            />
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-blue-100 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            {(finalAuth.isAuthenticated || showUserActions) && <NotificationBell />}
            
            {/* Always show home button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20"
              onClick={goHome}
            >
              <Home className="h-4 w-4 mr-2" />
              Início
            </Button>

            {!finalAuth.isLoading && (
              <>
                {finalAuth.isAuthenticated || showUserActions ? (
                  <>
                    {/* Show user info if available */}
                    {displayUser && (
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4" />
                        <span>
                          {displayUser.firstName} {displayUser.lastName}
                        </span>
                      </div>
                    )}
                    
                    {/* Logout button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:bg-white/20"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  /* Login button when not authenticated */
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20"
                    onClick={handleLogin}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}