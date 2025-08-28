import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useAppNavigation } from '../../routes/AppRoutes';

// Mapeamento de rotas para títulos em português
const ROUTE_TITLES = {
  '/': 'Início',
  '/dashboard': 'Dashboard',
  '/admin': 'Administração',
  '/admin/tenants': 'Gerenciar Tenants',
  '/admin/users': 'Gerenciar Usuários',
  '/admin/modules': 'Gerenciar Módulos',
  '/support': 'Suporte',
  '/workflows': 'Workflows',
  '/workflows/builder': 'Construtor de Workflow',
  '/reports': 'Relatórios',
  '/query-builder': 'Construtor de Consultas',
  '/email': 'Sistema de E-mail',
  '/chat': 'Chat',
  '/profile': 'Perfil',
  '/settings': 'Configurações'
};

// Mapeamento de ícones por rota
const ROUTE_ICONS = {
  '/': Home,
  '/dashboard': 'LayoutDashboard',
  '/admin': 'Shield',
  '/admin/tenants': 'Building',
  '/admin/users': 'Users',
  '/admin/modules': 'Package',
  '/support': 'HeadphonesIcon',
  '/workflows': 'GitBranch',
  '/workflows/builder': 'Wrench',
  '/reports': 'BarChart3',
  '/query-builder': 'Search',
  '/email': 'Mail',
  '/chat': 'MessageCircle',
  '/profile': 'User',
  '/settings': 'Settings'
};

// Componente de item do breadcrumb
const BreadcrumbItem = ({ 
  href, 
  children, 
  isLast = false, 
  icon = null,
  className = '' 
}) => {
  const { canNavigateTo } = useAppNavigation();
  const canAccess = href ? canNavigateTo(href) : true;
  const Icon = icon;
  
  if (isLast || !href || !canAccess) {
    return (
      <span className={cn(
        'flex items-center gap-1.5 text-sm font-medium',
        isLast ? 'text-foreground' : 'text-muted-foreground',
        className
      )}>
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </span>
    );
  }
  
  return (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-1.5 text-sm font-medium text-muted-foreground',
        'hover:text-foreground transition-colors',
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
};

// Componente separador
const BreadcrumbSeparator = ({ className = '' }) => (
  <ChevronRight className={cn('h-4 w-4 text-muted-foreground', className)} />
);

// Componente principal de breadcrumbs
export const StandardBreadcrumbs = ({ 
  items = null, 
  showHome = true,
  maxItems = 5,
  className = '',
  separator = null
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { canNavigateTo } = useAppNavigation();
  
  // Gerar breadcrumbs automaticamente se não fornecidos
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Adicionar home se solicitado
    if (showHome) {
      const homeRoute = user?.profile === 'admin' ? '/admin' : 
                      user?.profile === 'support' ? '/support' : '/dashboard';
      
      breadcrumbs.push({
        href: homeRoute,
        label: ROUTE_TITLES[homeRoute] || 'Dashboard',
        icon: ROUTE_ICONS[homeRoute]
      });
    }
    
    // Construir breadcrumbs baseado no caminho
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Pular se for a mesma rota do home
      if (showHome && breadcrumbs[0]?.href === currentPath) {
        return;
      }
      
      const title = ROUTE_TITLES[currentPath] || 
                   segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      breadcrumbs.push({
        href: index === pathSegments.length - 1 ? null : currentPath, // Último item sem link
        label: title,
        icon: ROUTE_ICONS[currentPath]
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = items || generateBreadcrumbs();
  
  // Limitar número de itens se necessário
  const displayItems = breadcrumbItems.length > maxItems 
    ? [
        ...breadcrumbItems.slice(0, 1), // Primeiro item
        { label: '...', href: null, isEllipsis: true },
        ...breadcrumbItems.slice(-maxItems + 2) // Últimos itens
      ]
    : breadcrumbItems;
  
  if (displayItems.length <= 1) {
    return null; // Não mostrar breadcrumb se houver apenas um item
  }
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center space-x-2', className)}
    >
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const Icon = typeof item.icon === 'string' ? null : item.icon;
          
          return (
            <li key={index} className="flex items-center space-x-2">
              {item.isEllipsis ? (
                <span className="text-muted-foreground text-sm">...</span>
              ) : (
                <BreadcrumbItem
                  href={item.href}
                  isLast={isLast}
                  icon={Icon}
                >
                  {item.label}
                </BreadcrumbItem>
              )}
              
              {!isLast && (
                separator || <BreadcrumbSeparator />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Hook para gerenciar breadcrumbs personalizados
export const useBreadcrumbs = () => {
  const [customBreadcrumbs, setCustomBreadcrumbs] = React.useState(null);
  
  const setBreadcrumbs = React.useCallback((items) => {
    setCustomBreadcrumbs(items);
  }, []);
  
  const clearBreadcrumbs = React.useCallback(() => {
    setCustomBreadcrumbs(null);
  }, []);
  
  const addBreadcrumb = React.useCallback((item) => {
    setCustomBreadcrumbs(prev => {
      if (!prev) return [item];
      return [...prev, item];
    });
  }, []);
  
  return {
    breadcrumbs: customBreadcrumbs,
    setBreadcrumbs,
    clearBreadcrumbs,
    addBreadcrumb
  };
};

// Context para breadcrumbs
const BreadcrumbContext = React.createContext(null);

// Componente de breadcrumb com contexto
export const BreadcrumbProvider = ({ children }) => {
  const breadcrumbContext = useBreadcrumbs();
  
  return (
    <BreadcrumbContext.Provider value={breadcrumbContext}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbContext = () => {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbContext deve ser usado dentro de BreadcrumbProvider');
  }
  return context;
};

// Componente de breadcrumb responsivo
export const ResponsiveBreadcrumbs = ({ className = '', ...props }) => {
  return (
    <div className={cn('hidden sm:block', className)}>
      <StandardBreadcrumbs {...props} />
    </div>
  );
};

// Componente de breadcrumb compacto para mobile
export const CompactBreadcrumbs = ({ className = '', ...props }) => {
  const location = useLocation();
  const currentTitle = ROUTE_TITLES[location.pathname] || 'Página';
  
  return (
    <div className={cn('sm:hidden', className)}>
      <span className="text-sm font-medium text-foreground">
        {currentTitle}
      </span>
    </div>
  );
};

export default StandardBreadcrumbs;