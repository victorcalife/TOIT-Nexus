import { useEffect, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { ToastNotification } from './ToastNotification';
import type { Notification } from '@/contexts/NotificationContext';

export function ToastContainer() {
  const { notifications, removeNotification } = useNotifications();
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Show only the most recent notifications as toasts (max 3)
    const recentNotifications = notifications
      .filter(n => n.duration && n.duration > 0) // Only show notifications with duration (auto-dismiss)
      .slice(0, 3);
    
    setToastNotifications(recentNotifications);
  }, [notifications]);

  return (
    <>
      {toastNotifications.map((notification, index) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
          position={index}
        />
      ))}
    </>
  );
}