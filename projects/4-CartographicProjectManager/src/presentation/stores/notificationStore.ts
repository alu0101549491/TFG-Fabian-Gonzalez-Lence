import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {Notification} from '@domain/entities/Notification';

/**
 * Notification store
 * Manages notification state
 */
export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);

  const fetchNotifications = async (): Promise<void> => {
    // TODO: Implement fetch notifications logic
    throw new Error('Method not implemented.');
  };

  const markAsRead = async (
      notificationId: string,
  ): Promise<void> => {
    // TODO: Implement mark as read logic
    throw new Error('Method not implemented.');
  };

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
  };
});
