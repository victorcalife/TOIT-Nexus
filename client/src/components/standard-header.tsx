import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StandardHeaderProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
  };
  onLogout: () => void;
}

export function StandardHeader({ user, onLogout }: StandardHeaderProps) {
  return (
    <div className="bg-white shadow border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TOIT NEXUS</h1>
            <p className="text-sm text-gray-500">Sistema de Automação de Workflows</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant={user.role === 'super_admin' ? 'destructive' : 'default'}>
                  {user.role === 'super_admin' ? 'Super Admin' : 
                   user.role === 'tenant_admin' ? 'Admin Tenant' : 
                   user.role === 'manager' ? 'Gerente' : 'Funcionário'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}