import { Button } from '@/components/ui/button';
import { LogOut, Settings, User } from 'lucide-react';
import toitNexusLogo from '@/assets/toit-nexus-logo.svg';

interface UnifiedHeaderProps {
  title: string;
  subtitle?: string;
  showUserActions?: boolean;
  user?: any;
  onLogout?: () => void;
}

export function UnifiedHeader({ title, subtitle, showUserActions = false, user, onLogout }: UnifiedHeaderProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/api/logout';
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-lg">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={toitNexusLogo} 
              alt="TOIT Nexus" 
              className="h-12 w-12"
              style={{ transform: 'scale(1.15)' }}
            />
            <div>
              <h1 className="text-2xl font-bold">
                {title}
              </h1>
              {subtitle && (
                <p className="text-blue-100 text-sm mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {showUserActions && (
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}