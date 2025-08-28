import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {  





 }
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { 





  BarChart3,

























 }
} from 'lucide-react';

// Configuração de navegação
const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    badge: null,
    quantum: false
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageSquare,
    href: '/chat',
    badge: '3',
    quantum: true
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    href: '/email',
    badge: '12',
    quantum: true
  },
  {
    id: 'calendar',
    label: 'Calendário',
    icon: Calendar,
    href: '/calendar',
    badge: null,
    quantum: true
  },
  {
    id: 'video-calls',
    label: 'Vídeo Chamadas',
    icon: Video,
    href: '/video-calls',
    badge: null,
    quantum: true
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: Workflow,
    href: '/workflows',
    badge: 'NEW',
    quantum: true
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: FileText,
    href: '/reports',
    badge: null,
    quantum: true
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    badge: null,
    quantum: true
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: Users,
    href: '/users',
    badge: null,
    quantum: false
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    href: '/settings',
    badge: null,
    quantum: false
  }
];

const QUANTUM_MODULES = [
  {
    id: 'quantum-core',
    label: 'Núcleo Quântico',
    icon: Atom,
    status: 'active',
    performance: '99.8%'
  },
  {
    id: 'mila-ai',
    label: 'MILA AI',
    icon: Brain,
    status: 'active',
    performance: '97.2%'
  },
  {
    id: 'quantum-optimizer',
    label: 'Otimizador',
    icon: Zap,
    status: 'active',
    performance: '95.6%'
  }
];

export default function DashboardLayout(({ children, 
  currentUser = null,
  currentPath = '/dashboard',
  onNavigate = ( }) => {},
  className = ''
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Processamento Quântico Concluído',
      message: 'Relatório de vendas processado com speedup de 3.2x',
      time: '2 min atrás',
      type: 'quantum',
      read: false
    },
    {
      id: 2,
      title: 'Nova Mensagem MILA',
      message: 'Detectei padrões interessantes nos dados de hoje',
      time: '5 min atrás',
      type: 'mila',
      read: false
    },
    {
      id: 3,
      title: 'Reunião em 15 minutos',
      message: 'Planejamento estratégico Q1 2025',
      time: '10 min atrás',
      type: 'calendar',
      read: true
    }
  ]);

  useEffect(() => {
    // Aplicar tema
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const themes = ['light', 'dark'];
      const currentIndex = themes.indexOf(prev);
      return themes[(currentIndex + 1) % themes.length];
    });
  };

  const isActiveRoute = (href) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-6 border-b border-border",
        sidebarCollapsed && "justify-center p-4"}
      )}>
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-quantum-500 rounded-lg flex items-center justify-center">
          <Atom className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-quantum-600 bg-clip-text text-transparent">
              TOIT NEXUS
            </h1>
            <p className="text-xs text-muted-foreground">Sistema Quântico</p>
          </div>
        )}
      </div>

      {/* Módulos Quânticos */}
      ({ !sidebarCollapsed && (
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Status Quântico
          </h3>
          <div className="space-y-2">
            {QUANTUM_MODULES.map((module }) => {
              const IconComponent = module.icon;
              return (
                <div key={module.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-quantum-600" />
                    <span className="text-xs font-medium">{module.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                    <span className="text-xs text-muted-foreground">{module.performance}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navegação */}
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-1">
          ({ NAVIGATION_ITEMS.map((item }) => {
            const IconComponent = item.icon;
            const isActive = isActiveRoute(item.href);
            
            return (
              <TooltipProvider key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-10",
                        sidebarCollapsed && "justify-center px-2",
                        isActive && "bg-primary-50 text-primary-700 border-primary-200",
                        item.quantum && "relative"}
                      )}
                      onClick=({ ( }) => onNavigate(item.href)}
                    >
                      <IconComponent className={cn(
                        "w-5 h-5",
                        isActive && "text-primary-600"}
                      )} />
                      
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          
                          {item.badge && (
                            <Badge 
                              variant={item.badge === 'NEW' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          
                          {item.quantum && (
                            <div className="w-2 h-2 bg-quantum-500 rounded-full animate-pulse" />
                          )}
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-border">
        ({ !sidebarCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-quantum-50 to-mila-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-quantum-500 to-mila-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sistema Quântico</p>
                <p className="text-xs text-muted-foreground">Performance: 98.7%</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={( }) => setSidebarCollapsed(true)}
            >
              <ChevronRight className="w-4 h-4" />
              Recolher Menu
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick=({ ( }) => setSidebarCollapsed(false)}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 hidden lg:block",
        sidebarCollapsed ? "w-16" : "w-64"}
      )}>
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 lg:hidden">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Conteúdo Principal */}
      <div className={cn(
        "transition-all duration-300 lg:ml-64",
        sidebarCollapsed && "lg:ml-16"}
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 lg:px-6">
          {/* Menu Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick=({ ( }) => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
          </Sheet>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-foreground">
              {NAVIGATION_ITEMS.find(item => isActiveRoute(item.href))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex-1" />

          {/* Busca */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange=({ (e }) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-2">
            {/* Tema */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <span className="sr-only">Alternar tema</span>
            </Button>

            {/* Notificações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative w-9 h-9">
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                  <span className="sr-only">Notificações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notificações
                  <Badge variant="secondary">{unreadNotifications} novas</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="max-h-80">
                  ({ notifications.map((notification }) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                      <div className="flex items-start gap-3 w-full">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2",
                          notification.type === 'quantum' && "bg-quantum-500",
                          notification.type === 'mila' && "bg-mila-500",
                          notification.type === 'calendar' && "bg-primary-500",
                          notification.read && "opacity-50"}
                        )} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Perfil do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback>
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser?.name || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email || 'usuario@exemplo.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick=({ ( }) => onNavigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick=({ ( }) => onNavigate('/billing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Cobrança</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick=({ ( }) => onNavigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className={cn("flex-1 p-4 lg:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
