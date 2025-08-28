/**
 * NAVEGAÇÃO PADRÃO - TOIT NEXUS
 * Componente de navegação consistente para todas as páginas
 * Versão: 1.0.0
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Home,
  Workflow,
  BarChart3,
  Database,
  Brain,
  Mail,
  MessageSquare,
  Calendar,
  Settings,
  Building,
  Users,
  Zap,
  Shield,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Configuração de navegação por tipo de usuário
 */
const navigationConfig = {
  client: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      description: 'Visão geral do sistema'
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: Workflow,
      href: '/workflows',
      description: 'Automação de processos',
      badge: 'Novo',
      children: [
        { label: 'Criar Workflow', href: '/workflows/create' },
        { label: 'Meus Workflows', href: '/workflows/mine' },
        { label: 'Templates', href: '/workflows/templates' }
      ]
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      href: '/reports',
      description: 'Análises e métricas',
      children: [
        { label: 'Dashboard de Vendas', href: '/reports/sales' },
        { label: 'Relatórios Customizados', href: '/reports/custom' },
        { label: 'Exportar Dados', href: '/reports/export' }
      ]
    },
    {
      id: 'database',
      label: 'Banco de Dados',
      icon: Database,
      href: '/database',
      description: 'Conexões e queries',
      children: [
        { label: 'Conexões', href: '/database/connections' },
        { label: 'Query Builder', href: '/database/query-builder' },
        { label: 'Histórico', href: '/database/history' }
      ]
    },
    {
      id: 'ml',
      label: 'Machine Learning',
      icon: Brain,
      href: '/ml',
      description: 'Modelos e predições',
      badge: 'Beta',
      children: [
        { label: 'Modelos', href: '/ml/models' },
        { label: 'Treinamento', href: '/ml/training' },
        { label: 'Predições', href: '/ml/predictions' }
      ]
    },
    {
      id: 'email',
      label: 'Sistema de E-mail',
      icon: Mail,
      href: '/email',
      description: 'Campanhas e automação',
      children: [
        { label: 'Campanhas', href: '/email/campaigns' },
        { label: 'Templates', href: '/email/templates' },
        { label: 'Listas', href: '/email/lists' }
      ]
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      href: '/chat',
      description: 'Comunicação em tempo real'
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: Calendar,
      href: '/calendar',
      description: 'Agendamentos e eventos'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      href: '/settings',
      description: 'Preferências do sistema'
    }
  ],
  admin: [
    {
      id: 'admin-dashboard',
      label: 'Dashboard Admin',
      icon: Home,
      href: '/admin/dashboard',
      description: 'Visão geral administrativa'
    },
    {
      id: 'tenants',
      label: 'Tenants',
      icon: Building,
      href: '/admin/tenants',
      description: 'Gerenciar organizações',
      children: [
        { label: 'Todos os Tenants', href: '/admin/tenants' },
        { label: 'Criar Tenant', href: '/admin/tenants/create' },
        { label: 'Configurações', href: '/admin/tenants/settings' }
      ]
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      href: '/admin/users',
      description: 'Gerenciar usuários',
      children: [
        { label: 'Todos os Usuários', href: '/admin/users' },
        { label: 'Permissões', href: '/admin/users/permissions' },
        { label: 'Grupos', href: '/admin/users/groups' }
      ]
    },
    {
      id: 'modules',
      label: 'Módulos',
      icon: Zap,
      href: '/admin/modules',
      description: 'Gerenciar módulos do sistema'
    },
    {
      id: 'security',
      label: 'Segurança',
      icon: Shield,
      href: '/admin/security',
      description: 'Centro de segurança',
      children: [
        { label: 'Logs de Auditoria', href: '/admin/security/audit' },
        { label: 'Políticas', href: '/admin/security/policies' },
        { label: 'Monitoramento', href: '/admin/security/monitoring' }
      ]
    },
    {
      id: 'billing',
      label: 'Faturamento',
      icon: CreditCard,
      href: '/admin/billing',
      description: 'Assinaturas e pagamentos'
    },
    {
      id: 'reports-admin',
      label: 'Relatórios',
      icon: BarChart3,
      href: '/admin/reports',
      description: 'Relatórios administrativos'
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: Settings,
      href: '/admin/system',
      description: 'Configurações do sistema'
    }
  ],
  support: [
    {
      id: 'support-dashboard',
      label: 'Dashboard Suporte',
      icon: Home,
      href: '/support/dashboard',
      description: 'Visão geral do suporte'
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: HelpCircle,
      href: '/support/tickets',
      description: 'Gerenciar tickets de suporte',
      children: [
        { label: 'Meus Tickets', href: '/support/tickets/mine' },
        { label: 'Todos os Tickets', href: '/support/tickets/all' },
        { label: 'Relatórios', href: '/support/tickets/reports' }
      ]
    },
    {
      id: 'knowledge',
      label: 'Base de Conhecimento',
      icon: FileText,
      href: '/support/knowledge',
      description: 'Artigos e documentação'
    },
    {
      id: 'monitoring',
      label: 'Monitoramento',
      icon: BarChart3,
      href: '/support/monitoring',
      description: 'Status do sistema'
    }
  ]
};

/**
 * Componente de Item de Navegação
 */
const NavigationItem = ({ item, isActive, isExpanded, onToggle, level = 0 }) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="mb-1">
      {/* Item Principal */}
      <div className="group">
        {hasChildren ? (
          <button
            onClick={onToggle}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              "hover:bg-gray-100 hover:text-gray-900",
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-700",
              level > 0 && "ml-4"
            )}
            )}
          >
            <div className="flex items-center">
              {Icon && <Icon className="h-4 w-4 mr-3" />}
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {hasChildren && (
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-90"
              )}
              )} />
            )}
          </button>
        ) : (
          <Link
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              "hover:bg-gray-100 hover:text-gray-900",
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-700",
              level > 0 && "ml-4"
            )}
            )}
          >
            {Icon && <Icon className="h-4 w-4 mr-3" />}
            <span>{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        )}
      </div>

      {/* Subitens */}
      {hasChildren && isExpanded && (
        <div className="mt-1 ml-6">
          {item.children.map((child, index) => (
            <Link
              key={index}
              to={child.href}
              className={cn(
                "block px-3 py-2 text-sm text-gray-600 rounded-lg transition-colors",
                "hover:bg-gray-100 hover:text-gray-900",
                location.pathname === child.href && "bg-blue-50 text-blue-700"
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Componente Principal de Navegação
 */
export const StandardNavigation = ({ className, collapsed = false, onToggleCollapse }) => {
  const { user, isAdmin, isSupport } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Determinar configuração de navegação baseada no tipo de usuário
  const getNavigationItems = () => {
    if (isAdmin()) return navigationConfig.admin;
    if (isSupport()) return navigationConfig.support;
    return navigationConfig.client;
  };

  const navigationItems = getNavigationItems();

  // Filtrar itens baseado na busca
  const filteredItems = navigationItems.filter(item => {
    if (!searchQuery) return true;
    return item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Verificar se item está ativo
  const isItemActive = (item) => {
    if (location.pathname === item.href) return true;
    if (item.children) {
      return item.children.some(child => location.pathname === child.href);
    }
    return false;
  };

  // Toggle expansão de item
  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}
    )}>
      {/* Header da Navegação */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TN</span>
              </div>
              <div className="ml-3">
                <h2 className="text-sm font-semibold text-gray-900">TOIT Nexus</h2>
                <p className="text-xs text-gray-500">
                  {isAdmin() ? 'Admin' : isSupport() ? 'Suporte' : user?.tenant?.name || 'Cliente'}
                </p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Busca */}
        {!collapsed && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Lista de Navegação */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {collapsed ? (
            // Navegação Colapsada
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-lg transition-colors",
                      "hover:bg-gray-100",
                      isActive ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    )}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          ) : (
            // Navegação Expandida
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  isActive={isItemActive(item)}
                  isExpanded={expandedItems.has(item.id)}
                  onToggle={() => toggleExpanded(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer da Navegação */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>TOIT Nexus v1.0.0</p>
            <p className="mt-1">© 2024 TOIT</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente de Breadcrumbs
 */
export const StandardBreadcrumbs = ({ items, className }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-gray-500", className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 text-gray-300" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/**
 * Componente de Menu de Contexto
 */
export const StandardContextMenu = ({ items, trigger, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  {item.separator ? (
                    <Separator className="my-1" />
                  ) : (
                    <button
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      className={cn(
                        "block w-full text-left px-4 py-2 text-sm transition-colors",
                        item.danger 
                          ? "text-red-600 hover:bg-red-50" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      disabled={item.disabled}
                    >
                      <div className="flex items-center">
                        {item.icon && (
                          <item.icon className="h-4 w-4 mr-2" />
                        )}
                        {item.label}
                      </div>
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StandardNavigation;