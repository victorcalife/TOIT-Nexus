import toitNexusLogoSvg from '@/assets/toit-nexus-logo.svg';

export function UnifiedHeader({ 
  showUserActions = false,
  user,
  onLogout 
}) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/api/logout';
    }
  };

  return (
    <header 
      className="shadow-lg relative"
      style={{
        background,
        backgroundImage,%3Csvg viewBox='0 0 20 20' xmlns='http)`,
        backgroundRepeat,
        backgroundSize,
                transform)'
              }}
            />
          </div>
          
          {showUserActions && user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover)}
        </div>
      </div>
    </header>
  );
}