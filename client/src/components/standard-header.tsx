import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import toitNexusLogoSvg from '@/assets/toit-nexus-logo.svg';

interface StandardHeaderProps {
  showLoginButton?: boolean;
  showUserActions?: boolean;
  showNavigation?: boolean;
  onContactClick?: () => void;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
  };
  onLogout?: () => void;
}

export function StandardHeader({ 
  showLoginButton = false,
  showUserActions = false, 
  showNavigation = false,
  onContactClick,
  user,
  onLogout
}: StandardHeaderProps) {
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
        background: '#f8fafc',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%2306b6d4' opacity='0.3'/%3E%3Cline x1='10' y1='0' x2='10' y2='20' stroke='%2306b6d4' stroke-width='0.5' opacity='0.2'/%3E%3Cline x1='0' y1='10' x2='20' y2='10' stroke='%2306b6d4' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/">
              <img 
                src={toitNexusLogoSvg} 
                alt="TOIT Nexus - Workflow Automation Platform" 
                className="h-16 w-auto cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
            <Badge className="ml-3 bg-blue-100 text-blue-800 text-xs">
              Enterprise
            </Badge>
          </div>

          {/* Navigation Menu */}
          {showNavigation && (
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Recursos
              </a>
              <a href="#solucoes" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Soluções
              </a>
              <a href="#precos" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Preços
              </a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Contato
              </a>
            </nav>
          )}

          {/* Actions Section */}
          <div className="flex items-center space-x-4">
            
            {/* Login Button for Landing Page */}
            {showLoginButton && !isAuthenticated && (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/login">
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      Fazer Login
                    </Button>
                  </Link>
                  {onContactClick && (
                    <Button 
                      onClick={onContactClick}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                      Teste Grátis
                    </Button>
                  )}
                </div>
                
                {/* Mobile Login */}
                <div className="md:hidden flex items-center space-x-2">
                  <Link href="/simple-login">
                    <Button variant="outline" size="sm" className="border-blue-600 text-blue-600">
                      Login
                    </Button>
                  </Link>
                  {onContactClick && (
                    <Button 
                      onClick={onContactClick}
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Teste
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* User Actions for Authenticated Users */}
            {showUserActions && isAuthenticated && currentUser && (
              <div className="flex items-center space-x-4">
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
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Sair
                </Button>
              </div>
            )}

            {/* Simple Back to Home for System Pages */}
            {!showLoginButton && !showUserActions && (
              <Link href="/">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Início
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showNavigation && (
        <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="px-4 py-2 space-y-1">
            <a href="#recursos" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              Recursos
            </a>
            <a href="#solucoes" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              Soluções
            </a>
            <a href="#precos" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              Preços
            </a>
            <a href="#contato" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              Contato
            </a>
          </div>
        </div>
      )}
    </header>
  );
}