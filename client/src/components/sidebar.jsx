import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  Search, 
  Link as LinkIcon, 
  CheckSquare, 
  ClipboardList,
  Tag,
  Workflow,
  Shield,
  TestTube,
  Package,
  Database
} from 'lucide-react';

import toitNexusLogo from '@/assets/toit-nexus-logo.svg?url';

const navigation = [
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
  { name, href, icon,
];

) {
  const { user } = useAuth();

  // Filtra a navegação com base no tipo de usuário
  const filteredNavigation = isAdmin 
    ? navigation, '/access-control', '/module-management'].includes(item.href));

  const getUserInitials = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return 'Usuário';
  };

  const getUserRole = (user) => {
    const roleMap = {
      admin,
      manager,
      employee) => onNavigate('/')}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = currentPath === item.href || 
            (item.href !== '/' && currentPath.startsWith(item.href));
          
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.href)}
              className={cn(
                'w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover)}
            >
              <item.icon className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-primary-500' : 'text-gray-400 group-hover)} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 pb-4 border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImageUrl || undefined} alt="User avatar" />
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
            onClick={onLogout}
            className="text-gray-400 hover);
}
