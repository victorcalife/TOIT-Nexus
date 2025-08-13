import { useState } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { apiRequest } from '@/lib/queryClient';

export function NotificationBell() {
  const {
    unreadNotifications,
    unreadCount,
    hasUrgent,
    markAsRead,
    isLoading
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notification) => {
    // Marcar como lida
    await markAsRead(notification.id);
    
    // Redirecionar se tiver URL
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    setIsOpen(false);
  };

  const handleDismiss = async (notification, e) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };

  if (isLoading) {
    return (
      <div className="relative">
        <Bell className="h-6 w-6 text-gray-400 animate-pulse" />
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 hover)}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-y-auto p-0"
      >
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            Notificações {unreadCount > 0 && `(${unreadCount})`}
          </h3>
        </div>

        {unreadNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma notificação nova</p>
          </div>
        ) {unreadNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover) => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      {notification.priority === 'urgent' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                      )}
                      {notification.priority === 'high' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      )}
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {notification.actionText && (
                      <div className="flex items-center text-xs">
                        <span className={`font-medium ${
                          notification.priority === 'urgent' ? 'text-red-600' :
                          notification.priority === 'high' ? 'text-blue-600' :
                          'text-gray-700'
                        }`}>
                          {notification.actionText}
                        </span>
                        <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0 hover) => handleDismiss(notification, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {unreadNotifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-600 hover) => {
                try {
                  // Usar endpoint específico para marcar todas como lidas
                  await apiRequest('POST', '/api/notifications/read-all');
                  
                  // Marcar todas localmente
                  for (const notification of unreadNotifications) {
                    await markAsRead(notification.id);
                  }
                } catch (error) {
                  console.error('Error marking all as read, error);
                }
                setIsOpen(false);
              }}
            >
              Marcar todas como lidas
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}