import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";

export const AuthHeader = () => {
  const { user, logout, getFullName, getInitials, isAdmin, isSuperAdmin } = useAuthState();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  const handleProfile = () => {
    // Navegar para perfil (implementar depois)
    console.log('Ir para perfil');
  };

  const handleSettings = () => {
    // Navegar para configurações (implementar depois)
    console.log('Ir para configurações');
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Informações do usuário */}
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium text-gray-900">
          {getFullName()}
        </p>
        <p className="text-xs text-gray-500">
          {user.role === 'super_admin' && 'Super Administrador'}
          {user.role === 'tenant_admin' && 'Administrador'}
          {user.role === 'manager' && 'Gerente'}
          {user.role === 'employee' && 'Funcionário'}
          {user.tenantName && ` • ${user.tenantName}`}
        </p>
      </div>

      {/* Menu do usuário */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end" forceMount>
          {/* Informações do usuário no mobile */}
          <div className="flex flex-col space-y-1 p-2 md:hidden">
            <p className="text-sm font-medium leading-none">
              {getFullName()}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.tenantName && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.tenantName}
              </p>
            )}
          </div>
          
          <DropdownMenuSeparator className="md:hidden" />
          
          <DropdownMenuItem onClick={handleProfile}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          
          {(isAdmin() || isSuperAdmin()) && (
            <DropdownMenuItem onClick={handleSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
