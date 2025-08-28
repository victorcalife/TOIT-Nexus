import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notification-bell";
import toitNexusLogoSvg from '@/assets/toit-nexus-logo.svg';

export function StandardHeader({ 
  showLoginButton = false,
  showUserActions = false, 
  showNavigation = false,
  onContactClick,
  user,
  onLogout
}) {
  const auth = useAuth();
  const currentUser = user || auth.user;
  const isAuthenticated = auth.isAuthenticated;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else if (auth.logout) {
      auth.logout();
      window.location.href = '/';
    }
  };

  return (
    <header 
      className="shadow-lg relative border-b border-gray-200"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <img 
                src={toitNexusLogoSvg} 
                alt="TOIT Nexus" 
                className="h-8 w-auto cursor-pointer filter brightness-0 invert"
              />
            </Link>
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-4">
            
            {/* Login Button for Landing Page */}
            {showLoginButton && !isAuthenticated && (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <Button 
                    onClick={onContactClick}
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-gray-900"
                  >
                    Contato
                  </Button>
                  <Link href="/login">
                    <Button className="bg-white text-gray-900 hover:bg-gray-100">
                      Entrar
                    </Button>
                  </Link>
                </div>
                
                {/* Mobile Login */}
                <div className="md:hidden">
                  <Link href="/login">
                    <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                      Entrar
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* User Actions for Authenticated Users */}
            {showUserActions && isAuthenticated && currentUser && (
              <div className="flex items-center space-x-4">
                {/* Notification Bell - sininho com campanhas promocionais */}
                <NotificationBell />
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <div className="flex items-center justify-end space-x-2">
                    <Badge variant={currentUser.role === 'super_admin' ? 'destructive' : 'default'} className="text-xs">
                      {currentUser.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Usuário'}
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  Sair
                </Button>
              </div>
            )}

            {/* Simple Back to Home for System Pages */}
            {!showLoginButton && !showUserActions && (
              <Link href="/">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Voltar ao Início
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showNavigation && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Navigation items for mobile */}
          </div>
        </div>
      )}
    </header>
  );
}
