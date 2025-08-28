/**
 * LOADING PADRÃO - TOIT NEXUS
 * Componentes de loading consistentes para todo o sistema
 * Versão: 1.0.0
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Loader2,
  RefreshCw,
  Download,
  Upload,
  Search,
  Database,
  Zap,
  BarChart3,
  FileText,
  Users,
  Settings,
  Shield,
  Mail,
  MessageSquare
} from 'lucide-react';

/**
 * Spinner Base
 */
export const Spinner = ({
  size = 'default',
  className,
  ...props
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
    '2xl': 'h-12 w-12'
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-blue-600',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

/**
 * Loading com Texto
 */
export const LoadingWithText = ({
  text = 'Carregando...',
  size = 'default',
  className,
  textClassName,
  vertical = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center',
        vertical ? 'flex-col space-y-2' : 'space-x-2',
        className
      )}
      {...props}
    >
      <Spinner size={size} />
      <span className={cn(
        'text-sm text-gray-600',
        textClassName
      )}>
        {text}
      </span>
    </div>
  );
};

/**
 * Loading Contextual
 */
export const ContextualLoading = ({
  type = 'default',
  text,
  size = 'default',
  className,
  ...props
}) => {
  const contexts = {
    default: {
      icon: Loader2,
      text: 'Carregando...',
      color: 'text-blue-600'
    },
    refresh: {
      icon: RefreshCw,
      text: 'Atualizando...',
      color: 'text-green-600'
    },
    download: {
      icon: Download,
      text: 'Baixando...',
      color: 'text-purple-600'
    },
    upload: {
      icon: Upload,
      text: 'Enviando...',
      color: 'text-orange-600'
    },
    search: {
      icon: Search,
      text: 'Pesquisando...',
      color: 'text-indigo-600'
    },
    database: {
      icon: Database,
      text: 'Processando dados...',
      color: 'text-gray-600'
    },
    processing: {
      icon: Zap,
      text: 'Processando...',
      color: 'text-yellow-600'
    },
    analytics: {
      icon: BarChart3,
      text: 'Gerando relatório...',
      color: 'text-pink-600'
    },
    document: {
      icon: FileText,
      text: 'Gerando documento...',
      color: 'text-blue-600'
    },
    users: {
      icon: Users,
      text: 'Carregando usuários...',
      color: 'text-green-600'
    },
    settings: {
      icon: Settings,
      text: 'Aplicando configurações...',
      color: 'text-gray-600'
    },
    security: {
      icon: Shield,
      text: 'Verificando segurança...',
      color: 'text-red-600'
    },
    email: {
      icon: Mail,
      text: 'Enviando e-mail...',
      color: 'text-blue-600'
    },
    message: {
      icon: MessageSquare,
      text: 'Enviando mensagem...',
      color: 'text-green-600'
    }
  };

  const config = contexts[type] || contexts.default;
  const IconComponent = config.icon;
  const displayText = text || config.text;

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  return (
    <div
      className={cn(
        'flex items-center space-x-2',
        className
      )}
      {...props}
    >
      <IconComponent
        className={cn(
          'animate-spin',
          sizeClasses[size],
          config.color
        )}
      />
      <span className="text-sm text-gray-600">
        {displayText}
      </span>
    </div>
  );
};

/**
 * Loading de Página Completa
 */
export const PageLoading = ({
  title = 'Carregando página...',
  subtitle,
  logo,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-gray-50',
        className
      )}
      {...props}
    >
      <div className="text-center">
        {/* Logo */}
        {logo && (
          <div className="mb-8">
            {logo}
          </div>
        )}
        
        {/* Spinner */}
        <div className="mb-6">
          <Spinner size="2xl" />
        </div>
        
        {/* Texto */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        
        {subtitle && (
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Loading de Seção
 */
export const SectionLoading = ({
  title,
  subtitle,
  height = 'auto',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center p-8 bg-white rounded-lg border border-gray-200',
        height === 'full' && 'min-h-[400px]',
        height === 'medium' && 'min-h-[200px]',
        height === 'small' && 'min-h-[100px]',
        className
      )}
      {...props}
    >
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        
        {title && (
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title}
          </h3>
        )}
        
        {subtitle && (
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Loading Inline
 */
export const InlineLoading = ({
  text = 'Carregando...',
  size = 'sm',
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center space-x-1 text-sm text-gray-600',
        className
      )}
      {...props}
    >
      <Spinner size={size} />
      <span>{text}</span>
    </span>
  );
};

/**
 * Loading de Botão
 */
export const ButtonLoading = ({
  size = 'sm',
  className,
  ...props
}) => {
  return (
    <Spinner
      size={size}
      className={cn('text-current', className)}
      {...props}
    />
  );
};

/**
 * Loading com Progresso
 */
export const ProgressLoading = ({
  progress = 0,
  text = 'Carregando...',
  showPercentage = true,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('space-y-3', className)}
      {...props}
    >
      {/* Texto e porcentagem */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{text}</span>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-900">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      
      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Skeleton de Card
 */
export const CardSkeleton = ({
  showHeader = true,
  showFooter = false,
  lines = 3,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'p-6 bg-white rounded-lg border border-gray-200 space-y-4',
        className
      )}
      {...props}
    >
      {/* Header */}
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      
      {/* Conteúdo */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn(
              'h-4',
              index === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>
      
      {/* Footer */}
      {showFooter && (
        <div className="flex items-center space-x-2 pt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton de Tabela
 */
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 overflow-hidden',
        className}
      )}
      {...props}
    >
      {/* Header */}
      {showHeader && (
        <div className="border-b border-gray-200 p-4">`
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
      )}
      
      {/* Linhas */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">`
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={cn(
                    'h-4',
                    colIndex === 0 ? 'w-3/4' : 'w-full'}
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton de Lista
 */
export const ListSkeleton = ({
  items = 5,
  showAvatar = false,
  showActions = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 divide-y divide-gray-200',
        className}
      )}
      {...props}
    >
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="p-4 flex items-center space-x-4">
          {/* Avatar */}
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          )}
          
          {/* Conteúdo */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          
          {/* Ações */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton de Dashboard
 */
export const DashboardSkeleton = ({
  showMetrics = true,
  showCharts = true,
  showTable = true,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('space-y-6', className)}
      {...props}
    >
      {/* Métricas */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      )}
      
      {/* Gráficos */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}
      
      {/* Tabela */}
      {showTable && (
        <TableSkeleton rows={8} columns={5} />
      )}
    </div>
  );
};

/**
 * Loading Overlay
 */
export const LoadingOverlay = ({
  visible = false,
  text = 'Carregando...',
  backdrop = true,
  className,
  children,
  ...props
}) => {
  if (!visible) return children;

  return (
    <div className="relative">
      {children}
      
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center z-50',
          backdrop && 'bg-white/80 backdrop-blur-sm',
          className}
        )}
        {...props}
      >
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-sm text-gray-600">{text}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para gerenciar estados de loading
 */
export const useLoading = (initialState = false) => ({ const [isLoading, setIsLoading] = React.useState(initialState);
  
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const toggleLoading = ( }) => setIsLoading(!isLoading);
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  };
};

/**
 * Hook para loading com timeout
 */
export const useLoadingWithTimeout = (timeout = 30000) => ({ const [isLoading, setIsLoading] = React.useState(false);
  const [isTimeout, setIsTimeout] = React.useState(false);
  const timeoutRef = React.useRef(null);
  
  const startLoading = () => {
    setIsLoading(true);
    setIsTimeout(false);
    
    timeoutRef.current = setTimeout(( }) => {
      setIsTimeout(true);
    }, timeout);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
    setIsTimeout(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  
  React.useEffect(() => ({ return ( }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    isLoading,
    isTimeout,
    startLoading,
    stopLoading
  };
};

export default {













  useLoading,
  useLoadingWithTimeout
};`