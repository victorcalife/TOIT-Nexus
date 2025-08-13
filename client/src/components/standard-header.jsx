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
        background,
        backgroundImage,%3Csvg viewBox='0 0 20 20' xmlns='http)`,
        backgroundRepeat,
        backgroundSize)}

          {/* Actions Section */}
          <div className="flex items-center space-x-4">
            
            {/* Login Button for Landing Page */}
            {showLoginButton && !isAuthenticated && (
              <>
                <div className="hidden md)}
                </div>
                
                {/* Mobile Login */}
                <div className="md)}
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
                  className="border-red-300 text-red-600 hover)}

            {/* Simple Back to Home for System Pages */}
            {!showLoginButton && !showUserActions && (
              <Link href="/">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover)}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showNavigation && (
        <div className="md)}
    </header>
  );
}