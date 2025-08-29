import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/queryClient';

export const useNotifications = () => {
  const [readNotifications, setReadNotifications] = useState(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiRequest('/api/notifications'),
    refetchInterval: 60000, // Refetch a cada 1 minuto
    staleTime: 30000, // Considera fresh por 30 segundos
  });

  // Recuperar notificações lidas do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('toit_read_notifications');
    if (stored) {
      try {
        const readIds = JSON.parse(stored);
        setReadNotifications(new Set(readIds));
      } catch (error) {
        console.error('Error parsing read notifications:', error);
      }
    }
  }, []);

  // Marcar notificação como lida
  const markAsRead = async (notificationId) => {
    try {
      // Fazer call para API usando o sistema configurado
      await apiRequest('POST', `/api/notifications/${notificationId}/read`);

      // Atualizar estado local
      const newReadNotifications = new Set(readNotifications);
      newReadNotifications.add(notificationId);
      setReadNotifications(newReadNotifications);

      // Salvar no localStorage
      localStorage.setItem(
        'toit_read_notifications', 
        JSON.stringify([...newReadNotifications])
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Filtrar notificações não lidas
  const unreadNotifications = data?.notifications?.filter(
    (notification) => !readNotifications.has(notification.id)
  ) || [];

  // Contar notificações não lidas
  const unreadCount = unreadNotifications.length;

  // Verificar se há notificações urgentes
  const hasUrgent = unreadNotifications.some(
    (notification) => notification.priority === 'urgent'
  );

  // Obter notificação mais prioritária
  const topNotification = unreadNotifications.length > 0 ? unreadNotifications[0] : null;

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    hasUrgent,
    topNotification,
    userInfo,
    isLoading,
    error,
    markAsRead,
    refetch,
  };
}