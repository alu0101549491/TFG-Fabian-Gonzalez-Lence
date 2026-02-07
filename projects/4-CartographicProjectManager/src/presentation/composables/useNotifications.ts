import {useNotificationStore} from '../stores/notificationStore';

/**
 * Notifications composable
 * Provides notification utilities for components
 */
export function useNotifications() {
  const notificationStore = useNotificationStore();

  const loadNotifications = async (): Promise<void> => {
    await notificationStore.fetchNotifications();
  };

  const markAsRead = async (
      notificationId: string,
  ): Promise<void> => {
    await notificationStore.markAsRead(notificationId);
  };

  return {
    notifications: notificationStore.notifications,
    unreadCount: notificationStore.unreadCount,
    loadNotifications,
    markAsRead,
  };
}
