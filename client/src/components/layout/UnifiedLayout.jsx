/**
 * UNIFIED LAYOUT - Layout unificado para integração de todos os componentes
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/toaster';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { UserProfile } from '@/components/profile/UserProfile';
import { 
  Home, 
  Users, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  MessageCircle,
  Calendar,
  FileText,
  BarChart3,
  Database,
  Workflow,
  Zap,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navigationItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    badge: null
  },
  {
    title: 'Usuários',
    icon: Users,
    href: '/users',
    badge: null
  },
  {
    title: 'Tarefas',
    icon: FileText,
    href: '/tasks',
    badge: '12'
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    href: '/reports',
    badge: null
  },
  {
    title: 'Workflows',
    icon: Workflow,
    href: '/workflows',
    badge: 'NEW'
  },
  {
    title: 'Banco de Dados',
    icon: Database,
    href: '/database',
    badge: null
  },
  {
    title: 'Calendário',
    icon: Calendar,
    href: '/calendar',
    badge: '3'
  },
  {
    title: 'Automações',
    icon: Zap,
    href: '/automations',
    badge: null
  }
];

const bottomNavigationItems = [
  {
    title: 'Configurações',
    icon: Settings,
    href: '/settings'
  },
  {
    title: 'Segurança',
    icon: Shield,
    href: '/security'
  },
  {
    title: 'Planos',
    icon: CreditCard,
    href: '/plans'
  },
  {
    title: 'Ajuda',
    icon: HelpCircle,
    href: '/help'
  }
];

export function UnifiedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Carregar notificações
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.data?.filter(n => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Verificar se a rota está ativa
  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Obter iniciais do usuário
  const getUserInitials = () => {
    const name = user?.name || 'Usuario';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Renderizar item de navegação
  const renderNavItem = (item, isBottom = false) => (
    <Button
      key={item.href}
      variant={isActiveRoute(item.href) ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start h-10',
        isActiveRoute(item.href) && 'bg-primary-50 text-primary-700 border-primary-200'
      )}
      onClick={() => navigate(item.href)}
    >
      <item.icon className="w-4 h-4 mr-3" />
      {sidebarOpen && (
        <>
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <Badge 
              variant={item.badge === 'NEW' ? 'default' : 'secondary'} 
              className="text-xs"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Button>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TN</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">TOIT Nexus</h1>
                  <p className="text-xs text-gray-500">v3.0 Quantum</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 p-0"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navegação Principal */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigationItems.map(item => renderNavItem(item))}
          </div>
        </ScrollArea>

        {/* Navegação Inferior */}
        <div className="p-3 border-t border-gray-200">
          <div className="space-y-1 mb-3">
            {bottomNavigationItems.map(item => renderNavItem(item, true))}
          </div>
          
          {/* Perfil do Usuário */}
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
               onClick={() => setProfileOpen(true)}>
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || 'Membro'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {navigationItems.find(item => isActiveRoute(item.href))?.title || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Busca */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notificações */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Chat */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setChatOpen(!chatOpen)}
              >
                <MessageCircle className="w-5 h-5" />
              </Button>

              {/* Logout */}
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Área de Conteúdo */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        currentUserId={user?.id}
      />

      {/* Modal de Perfil */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <UserProfile
              user={user}
              onSave={(data) => {
                console.log('Perfil salvo:', data);
                setProfileOpen(false);
              }}
              onCancel={() => setProfileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Toaster para notificações */}
      <Toaster />
    </div>
  );
}
