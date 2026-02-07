/**
 * @module presentation/stores/notification-store
 * @description Pinia store for notification state management.
 * Manages in-app notifications with real-time delivery.
 * @category Presentation
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import {NotificationType} from '../../domain/enumerations/notification-type';

interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Notification store.
 * Manages notification state with real-time WebSocket updates.
 */
export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<NotificationData[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const typeFilter = ref<NotificationType | null>(null);

  // Getters
  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
  );
  
  const hasUnread = computed(() => unreadCount.value > 0);

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.isRead)
  );

  const filteredNotifications = computed(() => {
    if (!typeFilter.value) return notifications.value;
    return notifications.value.filter(n => n.type === typeFilter.value);
  });

  const recentNotifications = computed(() =>
    notifications.value.slice(0, 10)
  );

  // Actions

  /**
   * Fetches all notifications for the current user.
   */
  async function fetchNotifications(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock data
      notifications.value = [
        {
          id: '1',
          userId: 'user1',
          type: NotificationType.NEW_MESSAGE,
          title: 'New Message',
          message: 'You have a new message in Project CART-2025-001',
          relatedEntityId: '1',
          relatedEntityType: 'project',
          isRead: false,
          createdAt: new Date('2025-02-07T10:00:00'),
        },
        {
          id: '2',
          userId: 'user1',
          type: NotificationType.NEW_TASK,
          title: 'Task Assigned',
          message: 'A new task has been assigned to you',
          relatedEntityId: '1',
          relatedEntityType: 'task',
          isRead: false,
          createdAt: new Date('2025-02-06T15:30:00'),
        },
        {
          id: '3',
          userId: 'user1',
          type: NotificationType.TASK_STATUS_CHANGE,
          title: 'Task Completed',
          message: 'Task "Complete survey" has been marked as completed',
          relatedEntityId: '2',
          relatedEntityType: 'task',
          isRead: true,
          createdAt: new Date('2025-02-05T09:15:00'),
        },
      ];
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notifications';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Marks a notification as read.
   * @param notificationId - The notification's unique ID.
   */
  async function markAsRead(notificationId: string): Promise<void> {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  /**
   * Marks all notifications as read.
   */
  async function markAllAsRead(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      notifications.value.forEach(n => n.isRead = true);
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all notifications as read';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Deletes a notification.
   * @param notificationId - The notification's unique ID.
   */
  async function deleteNotification(notificationId: string): Promise<void> {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const index = notifications.value.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications.value.splice(index, 1);
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete notification';
      throw err;
    }
  }

  /**
   * Adds a notification received via WebSocket.
   * @param notification - The received notification.
   */
  function addRealTimeNotification(notification: NotificationData): void {
    // Add to beginning of array (most recent first)
    notifications.value.unshift(notification);
    
    // Show browser notification if supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
      });
    }
  }

  /**
   * Request browser notification permission.
   */
  async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Set type filter.
   */
  function setTypeFilter(type: NotificationType | null): void {
    typeFilter.value = type;
  }

  /**
   * Clear all notifications.
   */
  function clearAll(): void {
    notifications.value = [];
  }

  return {
    // State
    notifications,
    isLoading,
    error,
    typeFilter,
    // Getters
    unreadCount,
    hasUnread,
    unreadNotifications,
    filteredNotifications,
    recentNotifications,
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addRealTimeNotification,
    requestNotificationPermission,
    setTypeFilter,
    clearAll,
  };
});
