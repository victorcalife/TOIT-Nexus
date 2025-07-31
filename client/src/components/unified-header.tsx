import toitNexusLogoSvg from '@/assets/toit-nexus-logo.svg';

interface UnifiedHeaderProps {
  title?: string;
  subtitle?: string;
  showUserActions?: boolean;
  user?: { firstName: string; lastName: string };
  onLogout?: () => void;
}

export function UnifiedHeader({ 
  showUserActions = false,
  user,
  onLogout 
}: UnifiedHeaderProps) {
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
        background: '#f8fafc',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%2306b6d4' opacity='0.3'/%3E%3Cline x1='10' y1='0' x2='10' y2='20' stroke='%2306b6d4' stroke-width='0.5' opacity='0.2'/%3E%3Cline x1='0' y1='10' x2='20' y2='10' stroke='%2306b6d4' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="w-full px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={toitNexusLogoSvg} 
              alt="TOIT Nexus - Workflow Automation Platform" 
              className="w-auto"
              style={{ 
                height: '55px',
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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