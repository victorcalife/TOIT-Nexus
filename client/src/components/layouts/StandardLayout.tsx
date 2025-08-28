/**
 * LAYOUT PADRÃO - TOIT NEXUS
 * Componente de layout consistente para todas as páginas do sistema
 * Versão: 1.0.0
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  Bell, 
  User,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

/**
 * Props do StandardLayout
 */
interface StandardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  loading?: boolean;
  error?: string;
  showNotifications?: boolean;
  notificationCount?: number;
}

/**
 * Componente de Header Padrão
 */
const StandardHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs, 
  actions, 
  headerActions,
  showBackButton,
  onBackClick,
  showNotifications = true,
  notificationCount = 0
}) => {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado Esquerdo */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <div className="flex flex-col">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex space-x-1 text-sm text-gray-500 mb-1">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {crumb.href ? (
                        <a href={crumb.href} className="hover:text-gray-700">
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-gray-900">{crumb.label}</span>
                      )}
                      {index < breadcrumbs.length - 1 && (
                        <span className="text-gray-300">/</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
              
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Lado Direito */}
          <div className="flex items-center space-x-4">
            {actions}
            
            {/* Notificações */}
            {showNotifications && (
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      variant="destructive"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </div>
            )}

            {/* Menu do Usuário */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="h-4 w-4 inline mr-2" />
                      Perfil
                    </a>
                    <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="h-4 w-4 inline mr-2" />
                      Configurações
                    </a>
                    <a href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <HelpCircle className="h-4 w-4 inline mr-2" />
                      Ajuda
                    </a>
                    <Separator className="my-1" />
                    <button 
                      onClick={() => window.location.href = '/api/logout'}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>

            {headerActions}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de Loading Padrão
 */
const StandardLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);

/**
 * Componente de Error Padrão
 */
const StandardError = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Card className="p-6 max-w-md w-full text-center">
      <div className="text-red-500 mb-4">
        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Tentar novamente
        </Button>
      )}
    </Card>
  </div>
);

/**
 * Componente de Sidebar Padrão
 */
const StandardSidebar = ({ children, className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className={cn("px-4 pb-4", isCollapsed && "px-2")}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
};

/**
 * Componente Principal StandardLayout
 */
export const StandardLayout = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  sidebar,
  headerActions,
  className,
  containerClassName,
  showBackButton = false,
  onBackClick,
  loading = false,
  error,
  showNotifications = true,
  notificationCount = 0
}: StandardLayoutProps) => {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Header */}
      <StandardHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={actions}
        headerActions={headerActions}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
        showNotifications={showNotifications}
        notificationCount={notificationCount}
      />

      {/* Layout Principal */}
      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <StandardSidebar>
            {sidebar}
          </StandardSidebar>
        )}

        {/* Conteúdo Principal */}
        <main className="flex-1">
          <div className={cn(
            "container mx-auto px-4 sm:px-6 lg:px-8 py-6",
            containerClassName
          )}>
            {loading ? (
              <StandardLoading />
            ) : error ? (
              <StandardError error={error} />
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Componente de Grid Responsivo Padrão
 */
export const StandardGrid = ({ children, cols = 3, gap = 6, className }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClass = `gap-${gap}`;

  return (
    <div className={cn(
      'grid',
      gridCols[cols] || gridCols[3],
      gapClass,
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Componente de Card Padrão com Métricas
 */
export const StandardMetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  color = 'blue',
  onClick,
  className 
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card 
      className={cn(
        "p-6 hover:shadow-md transition-shadow cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={cn(
              "flex items-center text-xs mt-2",
              trendColors[trend]
            )}>
              <span>{trendValue}</span>
              <span className="ml-1">
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("h-8 w-8", colorClasses[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Componente de Tabela Responsiva Padrão
 */
export const StandardTable = ({ 
  headers, 
  data, 
  actions, 
  loading = false,
  emptyMessage = "Nenhum dado encontrado",
  className 
}) => {
  if (loading) {
    return (
      <Card className="p-6">
        <StandardLoading />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {Object.values(row).map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cell}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {actions(row, rowIndex)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StandardLayout;

// Exportar componentes individuais
export {
  StandardHeader,
  StandardLoading,
  StandardError,
  StandardSidebar
};