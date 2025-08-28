import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Minus,
  MoreVertical,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente de métrica simples
export const MetricCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  trendLabel,
  variant = 'default',
  className = '',
  actions,
  loading = false
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return '';
    }
  };
  
  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn(getVariantStyles(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {actions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <DropdownMenuItem key={index} onClick={action.onClick}>
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {trend && (
              <div className={cn('flex items-center gap-1', getTrendColor())}>
                {getTrendIcon()}
                {trendValue && <span>{trendValue}</span>}
              </div>
            )}
            {description && <span>{description}</span>}
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente de progresso com meta
export const ProgressCard = ({
  title,
  current,
  target,
  description,
  icon: Icon,
  variant = 'default',
  showPercentage = true,
  className = ''
}) => {
  const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
  
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{current}</span>
            <span className="text-sm text-muted-foreground">de {target}</span>
          </div>
          
          <Progress value={percentage} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {showPercentage && <span>{percentage}% concluído</span>}
            {description && <span>{description}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de lista de atividades recentes
export const ActivityCard = ({
  title = 'Atividades Recentes',
  activities = [],
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  className = ''
}) => {
  const displayActivities = activities.slice(0, maxItems);
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {showViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            <Eye className="h-4 w-4 mr-1" />
            Ver todas
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
                {activity.badge && (
                  <Badge variant={activity.badge.variant || 'secondary'} className="text-xs">
                    {activity.badge.text}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente de estatísticas rápidas
export const QuickStatsCard = ({
  title = 'Estatísticas Rápidas',
  stats = [],
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de gráfico simples (placeholder para integração com bibliotecas de gráficos)
export const ChartCard = ({
  title,
  description,
  children,
  actions,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          {description && <div className="h-3 bg-gray-200 rounded w-48 animate-pulse mt-2"></div>}
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

// Layout de dashboard responsivo
export const DashboardGrid = ({
  children,
  columns = 'auto',
  gap = 6,
  className = ''
}) => {
  const getGridCols = () => {
    if (typeof columns === 'number') {
      return `grid-cols-${columns}`;
    }
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };
  
  return (
    <div className={cn(
      'grid gap-6',
      getGridCols(),
      `gap-${gap}`,
      className
    )}>
      {children}
    </div>
  );
};

// Componente principal do dashboard
export const StandardDashboard = ({
  title,
  description,
  actions,
  children,
  loading = false,
  refreshing = false,
  onRefresh,
  lastUpdated,
  className = ''
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho do dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Última atualização: {format(new Date(lastUpdated), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn('h-4 w-4 mr-1', refreshing && 'animate-spin')} />
            Atualizar
            </Button>
          )}
          
          {actions?.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="h-4 w-4 mr-1" />}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Conteúdo do dashboard */}
      {loading ? (
        <DashboardGrid>
          {Array.from({ length: 8 }).map((_, index) => (
            <MetricCard key={index} loading />
          ))}
        </DashboardGrid>
      ) : (
        children
      )}
    </div>
  );
};

// Hook para gerenciar estado do dashboard
export const useDashboard = ({
  refreshInterval = 0,
  onRefresh
} = {}) => {
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [error, setError] = React.useState(null);
  
  const refresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      if (onRefresh) {
        await onRefresh();
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Erro ao atualizar dashboard');
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);
  
  // Auto refresh
  React.useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);
  
  return {
    loading,
    refreshing,
    lastUpdated,
    error,
    setLoading,
    refresh
  };
};

export default StandardDashboard;
