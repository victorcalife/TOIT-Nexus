import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChartLine, 
  LayoutDashboard, 
  Users, 
  Workflow, 
  BarChart3, 
  Database, 
  UserCheck, 
  Settings, 
  LogOut 
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Integrações', href: '/integrations', icon: Database },
  { name: 'Usuários', href: '/users', icon: UserCheck },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return 'Usuário';
  };

  const getUserRole = (user: any) => {
    const roleMap = {
      admin: 'Administrador',
      manager: 'Gerente',
      employee: 'Funcionário'
    };
    return roleMap[user?.role as keyof typeof roleMap] || 'Usuário';
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <ChartLine className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">InvestFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href || 
            (item.href !== '/' && location.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}>
                <item.icon className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                )} />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 pb-4 border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImageUrl} alt="User avatar" />
            <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getUserName(user)}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {getUserRole(user)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/api/logout'}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
