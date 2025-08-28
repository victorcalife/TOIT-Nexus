import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { StandardNavigation } from '../navigation/StandardNavigation';
import { StandardBreadcrumbs } from '../navigation/StandardBreadcrumbs';
import { NotificationDropdown } from '../notifications/StandardNotifications';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { 
  Menu,
  Search,
  Sun,
  Moon,
  Monitor,
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

// Componente de cabeçalho
const Header = ({ 
  onMenuToggle, 
  showMobileMenu = true,
  className = '' 
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, getThemeInfo, mounted } = useTheme();
  const [searchOpen, setSearchOpen] = React.useState(false);
  
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };
  
  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-4 w-4" />;
    
    const themeInfo = getThemeInfo();
    switch (themeInfo.icon) {
      case 'Sun':
        return <Sun className="h-4 w-4" />;
      case 'Moon':
        return <Moon className="h-4 w-4" />;
      case 'Monitor':
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };
  
  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="container flex h-14 items-center">
        {/* Menu mobile */}
        {showMobileMenu && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Alternar menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <StandardNavigation className="w-full" />
            </SheetContent>
          </Sheet>
        )}
        
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <div className="h-6 w-6 bg-primary rounded" />
            <span className="hidden font-bold sm:inline-block">
              TOIT NEXUS
            </span>
          </a>
        </div>
        
        {/* Breadcrumbs */}
        <div className="flex-1 hidden md:block">
          <StandardBreadcrumbs />
        </div>
        
        {/* Ações do cabeçalho */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Busca */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="outline"
              className="relative h-8 w-full justify-start rounded-[0.5rem] text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar...
              <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
          
          {/* Notificações */}
          <NotificationDropdown />
          
          {/* Tema */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                title={mounted ? `Tema atual: ${getThemeInfo().label}` : 'Alternar tema'}
              >
                {getThemeIcon()}
                <span className="sr-only">Alternar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleTheme}>
                {getThemeIcon()}
                <span className="ml-2">Alternar tema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {user?.profile}
                    </Badge>
                    {user?.tenant && (
                      <Badge variant="outline" className="text-xs">
                        {user.tenant}
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

// Componente de sidebar
const Sidebar = ({ className = '' }) => {
  return (
    <div className={cn(
      'pb-12 w-64 border-r bg-background',
      className
    )}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <StandardNavigation />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de rodapé
const Footer = ({ className = '' }) => {
  return (
    <footer className={cn(
      'border-t bg-background',
      className
    )}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <div className="h-6 w-6 bg-primary rounded" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 TOIT NEXUS. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <a href="/termos" className="hover:text-foreground transition-colors">
            Termos
          </a>
          <a href="/privacidade" className="hover:text-foreground transition-colors">
            Privacidade
          </a>
          <a href="/suporte" className="hover:text-foreground transition-colors">
            Suporte
          </a>
        </div>
      </div>
    </footer>
  );
};

// Layout principal
export const StandardLayout = ({
  children,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  showBreadcrumbs = true,
  sidebarCollapsed = false,
  className = ''
}) => {
  const [collapsed, setCollapsed] = React.useState(sidebarCollapsed);
  const location = useLocation();
  
  // Rotas que não devem mostrar sidebar
  const noSidebarRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const shouldShowSidebar = showSidebar && !noSidebarRoutes.includes(location.pathname);
  
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {showHeader && (
        <Header 
          onMenuToggle={() => setCollapsed(!collapsed)}
          showMobileMenu={shouldShowSidebar}
        />
      )}
      
      <div className="flex">
        {shouldShowSidebar && (
          <aside className="hidden md:block">
            <Sidebar className={cn(
              'transition-all duration-300',
              collapsed ? 'w-16' : 'w-64'
            )} />
          </aside>
        )}
        
        <main className="flex-1">
          <div className="container py-6">
            {showBreadcrumbs && shouldShowSidebar && (
              <div className="mb-6 md:hidden">
                <StandardBreadcrumbs />
              </div>
            )}
            
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
};

// Layout para páginas de autenticação
export const AuthLayout = ({ children, className = '' }) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted',
      className
    )}>
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-12 w-12 bg-primary rounded-lg" />
          <h1 className="text-2xl font-bold">TOIT NEXUS</h1>
        </div>
        {children}
      </div>
    </div>
  );
};

// Layout para páginas de erro
export const ErrorLayout = ({ 
  children, 
  showHeader = false, 
  showFooter = false,
  className = '' 
}) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {showHeader && <Header showMobileMenu={false} />}
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container max-w-md text-center space-y-6">
          {children}
        </div>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

// Layout para dashboard
export const DashboardLayout = ({ children, className = '' }) => {
  return (
    <StandardLayout className={className}>
      <div className="space-y-6">
        {children}
      </div>
    </StandardLayout>
  );
};

// Layout para formulários
export const FormLayout = ({ 
  title,
  description,
  children,
  actions,
  className = '' 
}) => {
  return (
    <StandardLayout>
      <div className={cn('max-w-2xl mx-auto space-y-6', className)}>
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        
        {children}
        
        {actions && (
          <div className="flex items-center justify-end space-x-2">
            {actions}
          </div>
        )}
      </div>
    </StandardLayout>
  );
};

// Hook para controlar o layout
export const useLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);
  
  const toggleMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);
  
  const closeMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(false);
  }, []);
  
  return {
    sidebarCollapsed,
    mobileMenuOpen,
    toggleSidebar,
    toggleMobileMenu,
    closeMobileMenu,
    setSidebarCollapsed,
    setMobileMenuOpen
  };
};

export default StandardLayout;
