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

export function NotificationBell() {
  const {
    unreadNotifications,
    unreadCount,
    hasUrgent,
    markAsRead,
    isLoading
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida
    await markAsRead(notification.id);
    
    // Redirecionar se tiver URL
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    setIsOpen(false);
  };

  const handleDismiss = async (notification: any, e: React.MouseEvent) => {
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
          className={`relative p-2 hover:bg-gray-100 ${hasUrgent ? 'animate-pulse' : ''}`}
        >
          <Bell 
            className={`h-6 w-6 ${
              hasUrgent ? 'text-red-500' : 
              unreadCount > 0 ? 'text-blue-500' : 'text-gray-400'
            }`} 
          />
          {unreadCount > 0 && (
            <Badge 
              className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${
                hasUrgent ? 'bg-red-500 text-white animate-bounce' : 'bg-blue-500 text-white'
              }`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
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
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {unreadNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                  notification.priority === 'urgent' ? 'bg-red-50 border-red-100' :
                  notification.priority === 'high' ? 'bg-blue-50 border-blue-100' :
                  'border-gray-100'
                }`}
                onClick={() => handleNotificationClick(notification)}
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
                    className="ml-2 h-6 w-6 p-0 hover:bg-gray-200"
                    onClick={(e) => handleDismiss(notification, e)}
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
              className="w-full text-xs text-gray-600 hover:text-gray-900"
              onClick={async () => {
                try {
                  // Usar endpoint específico para marcar todas como lidas
                  const response = await fetch('/api/notifications/read-all', {
                    method: 'POST',
                    credentials: 'include',
                  });
                  
                  if (response.ok) {
                    // Marcar todas localmente
                    for (const notification of unreadNotifications) {
                      await markAsRead(notification.id);
                    }
                  }
                } catch (error) {
                  console.error('Error marking all as read:', error);
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