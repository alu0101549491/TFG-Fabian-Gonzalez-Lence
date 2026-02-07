/**
 * @module presentation/composables/use-notifications
 * @description Composable for notification logic.
 * Provides reactive notification state and methods to Vue components.
 * @category Presentation
 */

import {computed} from 'vue';
import {useNotificationStore} from '../stores/notification.store';

/**
 * Composable that wraps the notification store and provides
 * notification utilities to components.
 */
export function useNotifications() {
  const notificationStore = useNotificationStore();

  const notifications = computed(() => notificationStore.notifications);
  const unreadCount = computed(() => notificationStore.unreadCount);
  const hasUnread = computed(() => notificationStore.hasUnread);
  const isLoading = computed(() => notificationStore.isLoading);

  /**
   * Loads notifications for the current user.
   */
  async function loadNotifications(): Promise<void> {
    await notificationStore.fetchNotifications();
  }

  /**
   * Marks a notification as read.
   * @param notificationId - The notification's unique ID.
   */
  async function markAsRead(notificationId: string): Promise<void> {
    await notificationStore.markAsRead(notificationId);
  }

  /**
   * Marks all notifications as read.
   */
  async function markAllAsRead(): Promise<void> {
    await notificationStore.markAllAsRead();
  }

  return {
    notifications,
    unreadCount,
    hasUnread,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
}
