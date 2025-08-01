import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/queryClient';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionText: string;
  actionUrl: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  targetAudience: string;
  triggerCondition: string;
  backgroundColor: string;
  iconColor: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  userContext?: {
    daysInTrial: number;
    daysLeft: number;
    trialPlan: string;
    isTrialActive: boolean;
  };
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  count: number;
  userInfo: {
    daysInTrial: number;
    daysLeft: number;
    isTrialActive: boolean;
    trialPlan: string;
  };
}

export function useNotifications() {
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  // Buscar notificações do servidor
  const { data, isLoading, error, refetch } = useQuery<NotificationsResponse>({
    queryKey: ['api', 'notifications'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
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
  const markAsRead = async (notificationId: string) => {
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
    notifications: data?.notifications || [],
    unreadNotifications,
    unreadCount,
    hasUrgent,
    topNotification,
    userInfo: data?.userInfo,
    isLoading,
    error,
    markAsRead,
    refetch,
  };
}