/**
 * NOTIFICAÇÕES PADRÃO - TOIT NEXUS
 * Sistema de notificações consistente para todo o sistema
 * Versão: 1.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { 
  Bell,
  BellRing,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Mail,
  MessageSquare,
  Calendar,
  User,
  Settings,
  Trash2,
  MoreHorizontal,
  Filter,
  Search,
  FileText,
  Database,
  Shield,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';

/**
 * Contexto de Notificações
 */
const NotificationContext = createContext();

/**
 * Provider de Notificações
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { toast } = useToast();

  // Adicionar notificação
  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Mostrar toast se especificado
    if (notification.showToast !== false) {
      showToast(notification);
    }
    
    return id;
  };

  // Marcar como lida
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Remover notificação
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Limpar todas
  const clearAll = () => {
    setNotifications([]);
  };

  // Mostrar toast
  const showToast = (notification) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'default',
      info: 'default'
    };

    toast({
      title: notification.title,
      description: notification.message,
      variant: variants[notification.type] || 'default',
      duration: notification.duration || 5000
    });
  };

  // Métodos de conveniência
  const success = (title, message, options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  };

  const error = (title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      ...options
    });
  };

  const warning = (title, message, options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  };

  const info = (title, message, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    showToast,
    success,
    error,
    warning,
    info,
    unreadCount: notifications.filter(n => !n.read).length
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook para usar notificações
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
  }
  return context;
};

/**
 * Componente de Alert Padrão
 */
export const StandardAlert = ({
  type = 'info',
  title,
  message,
  children,
  dismissible = false,
  onDismiss,
  className,
  icon: CustomIcon,
  actions = [],
  ...props
}) => {
  const [visible, setVisible] = useState(true);

  const variants = {
    success: {
      icon: CheckCircle,
      className: 'border-green-200 bg-green-50 text-green-800',
      iconColor: 'text-green-600'
    },
    error: {
      icon: AlertCircle,
      className: 'border-red-200 bg-red-50 text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertTriangle,
      className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: Info,
      className: 'border-blue-200 bg-blue-50 text-blue-800',
      iconColor: 'text-blue-600'
    }
  };

  const config = variants[type];
  const IconComponent = CustomIcon || config.icon;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <Alert
      className={cn(
        config.className,
        "relative",
        className
      )}
      {...props}
    >
      <div className="flex items-start">
        <IconComponent className={cn("h-5 w-5 mt-0.5 mr-3 flex-shrink-0", config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <AlertTitle className="mb-1 font-medium">
              {title}
            </AlertTitle>
          )}
          
          {message && (
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>
          )}
          
          {children}
          
          {/* Ações */}
          {actions.length > 0 && (
            <div className="flex items-center space-x-2 mt-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {/* Botão de fechar */}
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 ml-2 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

/**
 * Componente de Notificação Individual
 */
export const NotificationItem = ({
  notification,
  onRead,
  onRemove,
  onClick,
  className,
  ...props
}) => {
  const typeIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    system: Settings,
    user: User,
    email: Mail,
    message: MessageSquare,
    calendar: Calendar,
    document: FileText,
    database: Database,
    security: Shield,
    performance: Zap,
    analytics: TrendingUp,
    activity: Activity
  };

  const typeColors = {
    success: 'text-green-600 bg-green-100',
    error: 'text-red-600 bg-red-100',
    warning: 'text-yellow-600 bg-yellow-100',
    info: 'text-blue-600 bg-blue-100',
    system: 'text-gray-600 bg-gray-100',
    user: 'text-purple-600 bg-purple-100',
    email: 'text-indigo-600 bg-indigo-100',
    message: 'text-green-600 bg-green-100',
    calendar: 'text-orange-600 bg-orange-100',
    document: 'text-blue-600 bg-blue-100',
    database: 'text-gray-600 bg-gray-100',
    security: 'text-red-600 bg-red-100',
    performance: 'text-yellow-600 bg-yellow-100',
    analytics: 'text-purple-600 bg-purple-100',
    activity: 'text-green-600 bg-green-100'
  };

  const IconComponent = typeIcons[notification.type] || Info;
  const iconColor = typeColors[notification.type] || 'text-blue-600 bg-blue-100';

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleClick = () => {
    if (!notification.read) {
      onRead?.(notification.id);
    }
    onClick?.(notification);
  };

  return (
    <div
      className={cn(
        "flex items-start p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0",
        !notification.read && "bg-blue-50/50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {/* Ícone */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3",
        iconColor
      )}>
        <IconComponent className="h-4 w-4" />
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium text-gray-900",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </p>
            
            {notification.message && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
            )}
            
            {/* Metadados */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-gray-500">
                {formatTime(notification.timestamp)}
              </span>
              
              {notification.category && (
                <Badge variant="outline" className="text-xs">
                  {notification.category}
                </Badge>
              )}
              
              {notification.priority && notification.priority !== 'normal' && (
                <Badge 
                  variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {notification.priority === 'high' ? 'Alta' : 'Baixa'}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Indicador não lida */}
          {!notification.read && (
            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" />
          )}
        </div>
      </div>
      
      {/* Ações */}
      <div className="flex items-center space-x-1 ml-2">
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Lista de Notificações
 */
export const NotificationList = ({
  notifications = [],
  onRead,
  onRemove,
  onClick,
  emptyMessage = "Nenhuma notificação",
  className,
  maxHeight = "400px",
  ...props
}) => {
  if (notifications.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}>
        <Bell className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-y-auto",
        className
      )}
      style={{ maxHeight }}
      {...props}
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
          onRemove={onRemove}
          onClick={onClick}
        />
      ))}
    </div>
  );
};

/**
 * Dropdown de Notificações
 */
export const NotificationDropdown = ({
  trigger,
  notifications = [],
  onRead,
  onRemove,
  onMarkAllRead,
  onClearAll,
  onClick,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" {...props}>
      {/* Trigger */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {trigger || (
          <>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </>
        )}
      </Button>
      
      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Conteúdo */}
          <div className={cn(
            "absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50",
            className
          )}>
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </h3>
              
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && onMarkAllRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllRead}
                    className="text-xs"
                  >
                    Marcar todas
                  </Button>
                )}
                
                {notifications.length > 0 && onClearAll && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Lista */}
            <NotificationList
              notifications={notifications}
              onRead={onRead}
              onRemove={onRemove}
              onClick={(notification) => {
                onClick?.(notification);
                setIsOpen(false);
              }}
              maxHeight="300px"
            />
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Hook para notificações em tempo real
 */
export const useRealtimeNotifications = (userId) => {
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    if (!userId) return;
    
    // Aqui você conectaria com WebSocket ou Server-Sent Events
    // Exemplo com WebSocket:
    /*
    const ws = new WebSocket(`ws://localhost:3001/notifications/${userId}`);
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      addNotification(notification);
    };
    
    return () => {
      ws.close();
    };
    */
    
    // Por enquanto, simulamos com polling
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/notifications/unread?userId=${userId}`);
        const notifications = await response.json();
        
        notifications.forEach(notification => {
          addNotification({
            ...notification,
            showToast: false // Evita spam de toasts
          });
        });
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      }
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, [userId, addNotification]);
};

export default {
  NotificationProvider,
  useNotifications,
  StandardAlert,
  NotificationItem,
  NotificationList,
  NotificationDropdown,
  useRealtimeNotifications
};