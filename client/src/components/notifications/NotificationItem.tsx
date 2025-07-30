import { useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification } from '@/contexts/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
  index: number;
}

export function NotificationItem({ notification, index }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { markAsRead, removeNotification } = useNotifications();

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  const getBackgroundColor = () => {
    if (!notification.read) {
      switch (notification.type) {
        case 'success':
          return 'bg-green-50 hover:bg-green-100';
        case 'error':
          return 'bg-red-50 hover:bg-red-100';
        case 'warning':
          return 'bg-yellow-50 hover:bg-yellow-100';
        case 'info':
        default:
          return 'bg-blue-50 hover:bg-blue-100';
      }
    }
    return 'bg-gray-50 hover:bg-gray-100';
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.action?.onClick) {
      notification.action.onClick();
      markAsRead(notification.id);
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div
      className={`relative p-4 border-l-4 transition-all duration-200 cursor-pointer animate-in slide-in-from-right-full duration-300 ${getBorderColor()} ${getBackgroundColor()}`}
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !notification.read && markAsRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                notification.read ? 'text-gray-600' : 'text-gray-900'
              }`}>
                {notification.title}
                {!notification.read && (
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2 animate-pulse"></span>
                )}
              </h4>
              <p className={`text-sm mt-1 ${
                notification.read ? 'text-gray-500' : 'text-gray-700'
              }`}>
                {notification.message}
              </p>
              
              {/* Action Button */}
              {notification.action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={handleAction}
                >
                  {notification.action.label}
                </Button>
              )}
            </div>

            {/* Time and Actions */}
            <div className="flex items-center space-x-1 ml-2">
              <span className="text-xs text-gray-400">
                {formatTime(notification.timestamp)}
              </span>
              
              {/* Action Buttons (visible on hover or for unread) */}
              {(isHovered || !notification.read) && (
                <div className="flex space-x-1">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                      onClick={handleMarkRead}
                      title="Marcar como lida"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                    onClick={handleRemove}
                    title="Remover notificação"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}