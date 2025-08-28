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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <img 
              src={toitNexusLogoSvg} 
              alt="TOIT Nexus" 
              className="h-8 w-auto filter brightness-0 invert"
              style={{
                transform: 'scale(1.1)'
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
