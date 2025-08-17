import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Download,
  Share,
  Filter,
  Calendar,
  Clock,
  Atom,
  Brain,
  Zap,
  Sparkles
} from 'lucide-react';

// Hook para detectar tamanho da tela
export function useResponsive() {
  const [screenSize, setScreenSize] = useState('lg');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else if (width < 1280) setScreenSize('xl');
      else setScreenSize('2xl');
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    screenSize,
    isMobile: screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(screenSize),
    isLarge: ['xl', '2xl'].includes(screenSize)
  };
}

// Componente de Grid Responsivo
export function ResponsiveGrid({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = ''
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <div className={cn(
      'grid gap-4',
      `sm:${gridCols[cols.sm]}`,
      `md:${gridCols[cols.md]}`,
      `lg:${gridCols[cols.lg]}`,
      `xl:${gridCols[cols.xl]}`,
      `gap-${gap}`,
      className
    )}>
      {children}
    </div>
  );
}

// Card de Métrica Responsivo
export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon,
  description,
  quantum = false,
  className = ''
}) {
  const { isMobile } = useResponsive();

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200 hover:shadow-md',
      quantum && 'border-quantum-200 bg-gradient-to-br from-quantum-50/50 to-transparent',
      className
    )}>
      <CardHeader className={cn(
        'flex flex-row items-center justify-between space-y-0',
        isMobile ? 'pb-2' : 'pb-2'
      )}>
        <CardTitle className={cn(
          'font-medium text-muted-foreground',
          isMobile ? 'text-sm' : 'text-sm'
        )}>
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn(
            isMobile ? 'h-4 w-4' : 'h-4 w-4',
            quantum ? 'text-quantum-600' : 'text-muted-foreground'
          )} />
        )}
      </CardHeader>
      <CardContent>
        <div className={cn(
          'text-2xl font-bold',
          isMobile && 'text-xl'
        )}>
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            {changeType === 'positive' ? (
              <ArrowUpRight className="h-3 w-3 text-success-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-error-600" />
            )}
            <span className={cn(
              'text-xs font-medium',
              changeType === 'positive' ? 'text-success-600' : 'text-error-600'
            )}>
              {change}
            </span>
          </div>
        )}
        {description && (
          <p className={cn(
            'text-muted-foreground mt-1',
            isMobile ? 'text-xs' : 'text-xs'
          )}>
            {description}
          </p>
        )}
        {quantum && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs bg-quantum-100 text-quantum-800">
              <Atom className="w-3 h-3 mr-1" />
              Quantum
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Tabela Responsiva
export function ResponsiveTable({ 
  data = [], 
  columns = [], 
  actions = [],
  className = ''
}) {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    // Layout de cards para mobile
    return (
      <div className={cn('space-y-4', className)}>
        {data.map((row, index) => (
          <Card key={index} className="p-4">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {column.label}
                </span>
                <span className="text-sm">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
            {actions.length > 0 && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                {actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant="outline"
                    size="sm"
                    onClick={() => action.onClick(row)}
                  >
                    {action.icon && <action.icon className="w-4 h-4 mr-1" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  }

  // Layout de tabela para tablet/desktop
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th key={column.key} className="text-left p-4 font-medium text-muted-foreground">
                {column.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="text-right p-4 font-medium text-muted-foreground">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b hover:bg-muted/50">
              {columns.map((column) => (
                <td key={column.key} className="p-4">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    {actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant="ghost"
                        size="sm"
                        onClick={() => action.onClick(row)}
                      >
                        {action.icon && <action.icon className="w-4 h-4" />}
                        {!isTablet && action.label}
                      </Button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente de Estatísticas Responsivo
export function StatsOverview({ 
  stats = [],
  quantum = false,
  className = ''
}) {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveGrid 
      cols={{ sm: 1, md: 2, lg: 4, xl: 4 }}
      className={className}
    >
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          description={stat.description}
          quantum={quantum}
        />
      ))}
    </ResponsiveGrid>
  );
}

// Componente de Progresso com Informações
export function ProgressCard({ 
  title, 
  progress, 
  description, 
  quantum = false,
  className = ''
}) {
  return (
    <Card className={cn(
      'relative',
      quantum && 'border-quantum-200 bg-gradient-to-br from-quantum-50/30 to-transparent',
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {quantum && (
            <Badge variant="secondary" className="text-xs bg-quantum-100 text-quantum-800">
              <Atom className="w-3 h-3 mr-1" />
              Quantum
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className={cn(
              'h-2',
              quantum && '[&>div]:bg-gradient-to-r [&>div]:from-quantum-500 [&>div]:to-quantum-600'
            )}
          />
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Lista Responsiva
export function ResponsiveList({ 
  items = [], 
  renderItem,
  emptyMessage = 'Nenhum item encontrado',
  className = ''
}) {
  const { isMobile } = useResponsive();

  if (items.length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className={cn(
      'space-y-2',
      isMobile && 'space-y-3',
      className
    )}>
      {items.map((item, index) => (
        <Card key={index} className={cn(
          'p-4 hover:shadow-sm transition-shadow',
          isMobile && 'p-3'
        )}>
          {renderItem(item, index)}
        </Card>
      ))}
    </div>
  );
}

// Componente de Ações Responsivas
export function ResponsiveActions({ 
  actions = [],
  variant = 'default',
  className = ''
}) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || variant}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="w-full justify-start"
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2 flex-wrap', className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || variant}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

// Componente de Dashboard Responsivo
export function ResponsiveDashboard({ 
  title,
  subtitle,
  actions = [],
  children,
  quantum = false,
  className = ''
}) {
  const { isMobile } = useResponsive();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className={cn(
        'flex justify-between items-start gap-4',
        isMobile && 'flex-col items-stretch'
      )}>
        <div className="space-y-1">
          <h1 className={cn(
            'font-bold tracking-tight',
            isMobile ? 'text-2xl' : 'text-3xl',
            quantum && 'bg-gradient-to-r from-quantum-600 to-mila-600 bg-clip-text text-transparent'
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {actions.length > 0 && (
          <ResponsiveActions actions={actions} />
        )}
      </div>

      {/* Conteúdo */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

// Componente de Filtros Responsivos
export function ResponsiveFilters({ 
  filters = [],
  onFilterChange = () => {},
  className = ''
}) {
  const { isMobile } = useResponsive();

  return (
    <Card className={cn('p-4', className)}>
      <div className={cn(
        'flex gap-4',
        isMobile && 'flex-col'
      )}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <div className={cn(
          'flex gap-2 flex-wrap',
          isMobile && 'flex-col'
        )}>
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center gap-2">
              {filter.component}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Componente de Status Quântico
export function QuantumStatus({ 
  modules = [],
  className = ''
}) {
  const { isMobile } = useResponsive();

  return (
    <Card className={cn(
      'border-quantum-200 bg-gradient-to-br from-quantum-50/30 to-mila-50/30',
      className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom className="w-5 h-5 text-quantum-600" />
          Status do Sistema Quântico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          'grid gap-4',
          isMobile ? 'grid-cols-1' : 'grid-cols-3'
        )}>
          {modules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  module.status === 'active' ? 'bg-success-100' : 'bg-error-100'
                )}>
                  <IconComponent className={cn(
                    'w-5 h-5',
                    module.status === 'active' ? 'text-success-600' : 'text-error-600'
                  )} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{module.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      module.status === 'active' ? 'bg-success-500 animate-pulse' : 'bg-error-500'
                    )} />
                    <span className="text-xs text-muted-foreground">
                      {module.performance}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Exportar todos os componentes
export {
  MetricCard,
  ResponsiveTable,
  StatsOverview,
  ProgressCard,
  ResponsiveList,
  ResponsiveActions,
  ResponsiveDashboard,
  ResponsiveFilters,
  QuantumStatus
};
