/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/stores/notification.store.ts
 * @desc Pinia store for user notification state management with real-time delivery
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://pinia.vuejs.org}
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {
  NotificationDto,
  NotificationFilterDto,
  NotificationListResponseDto,
} from '../../application/dto';
import {NotificationType} from '../../domain/enumerations/notification-type';
import {useAuthStore} from './auth.store';
import {NotificationRepository} from '../../infrastructure/repositories/notification.repository';
import type {Notification} from '../../domain/entities/notification';
import {isSameDay, isThisWeek, formatDate} from '../../shared/utils';

const STORAGE_KEY = 'cpm_notifications';

/**
 * Notification store using Composition API.
 * Manages user notifications with pagination and type filtering.
 */
export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore();
  const notificationRepository = new NotificationRepository();
  
  /**
   * Helper function to map Notification entity to NotificationDto
   */
  function mapEntityToDto(notification: Notification): NotificationDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedEntityId: notification.relatedEntityId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    };
  }
  
  // State
  const notifications = ref<NotificationDto[]>([]);
  const unreadCount = ref(0);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 20,
    hasMore: false,
  });
  const typeFilter = ref<NotificationType | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.isRead)
  );
  
  const readNotifications = computed(() =>
    notifications.value.filter(n => n.isRead)
  );

  const hasUnread = computed(() => unreadCount.value > 0);

  const recentNotifications = computed(() =>
    notifications.value.slice(0, 5)
  );

  const filteredNotifications = computed(() => {
    if (!typeFilter.value) return notifications.value;
    return notifications.value.filter(n => n.type === typeFilter.value);
  });

  const notificationsByDate = computed(() => {
    const grouped = new Map<string, NotificationDto[]>();
    
    notifications.value.forEach(notification => {
      const dateKey = getDateKey(notification.createdAt);
      const existing = grouped.get(dateKey) ?? [];
      grouped.set(dateKey, [...existing, notification]);
    });
    
    return grouped;
  });

  // Helper functions
  
  /**
   * Load notifications from localStorage
   */
  function loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.notifications) {
          // Convert date strings back to Date objects
          notifications.value = data.notifications.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }));
          unreadCount.value = notifications.value.filter(n => !n.isRead).length;
        }
      }
    } catch (err) {
      console.error('Failed to load notifications from storage:', err);
    }
  }

  /**
   * Save notifications to localStorage
   */
  function saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        notifications: notifications.value,
      }));
    } catch (err) {
      console.error('Failed to save notifications to storage:', err);
    }
  }

  // Actions

  /**
   * Fetches notifications for current user
   *
   * @param loadMore - If true, loads next page; if false, refreshes from page 1
   *
   * @example
   * ```typescript
   * // Initial load
   * await notificationStore.fetchNotifications(false);
   * 
   * // Load more (pagination)
   * await notificationStore.fetchNotifications(true);
   * ```
   */
  async function fetchNotifications(loadMore = false): Promise<void> {
    if (!authStore.userId) return;

    isLoading.value = true;
    error.value = null;

    try {
      const page = loadMore ? pagination.value.page + 1 : 1;

      // Fetch notifications from backend
      const notificationEntities = await notificationRepository.findByUserId(authStore.userId);
     const fetchedNotifications = notificationEntities.map(mapEntityToDto);

      if (loadMore) {
        notifications.value = [...notifications.value, ...fetchedNotifications];
      } else {
        notifications.value = fetchedNotifications;
      }
      
      pagination.value = {
        total: fetchedNotifications.length,
        page: page,
        limit: 20,
        hasMore: false,
      };
      
      // Update unread count
      unreadCount.value = notifications.value.filter(n => !n.isRead).length;
      
      // Save to storage
      saveToStorage();
      
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notifications';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches unread count only
   */
  async function fetchUnreadCount(): Promise<void> {
    if (!authStore.userId) return;

    try {
      unreadCount.value = await notificationRepository.countUnreadByUserId(authStore.userId);
    } catch (err: any) {
      // Silent fail for count fetch
      console.error('Failed to fetch unread count:', err);
    }
  }

  /**
   * Marks a notification as read
   */
  async function markAsRead(notificationId: string): Promise<void> {
    if (!authStore.userId) return;

    try {
      await notificationRepository.markAsRead(notificationId);
      
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        // Update notifications reactively
        notifications.value = notifications.value.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        unreadCount.value = Math.max(0, unreadCount.value - 1);
        
        // Save to storage
        saveToStorage();
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark notification as read';
    }
  }

  /**
   * Marks all notifications as read
   */
  async function markAllAsRead(): Promise<void> {
    if (!authStore.userId) return;

    isLoading.value = true;
    error.value = null;

    try {
      // Mark all as read in backend
      const notificationEntities = await notificationRepository.findUnreadByUserId(authStore.userId);
      for (const entity of notificationEntities) {
        await notificationRepository.markAsRead(entity.id);
      }
      
      // Update notifications reactively
      notifications.value = notifications.value.map(n => ({
        ...n,
        isRead: true
      }));
      unreadCount.value = 0;
      
      // Save to storage
      saveToStorage();
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all as read';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Deletes a notification
   */
  async function deleteNotification(notificationId: string): Promise<void> {
    try {
      await notificationRepository.delete(notificationId);
      
      const index = notifications.value.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        const wasUnread = !notifications.value[index].isRead;
        notifications.value.splice(index, 1);
        pagination.value.total--;
        
        if (wasUnread) {
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete notification';
    }
  }

  /**
   * Handles real-time new notification event
   */
  function handleNewNotification(payload: any): void {
    // Add to beginning (newest first)
    notifications.value.unshift(payload as NotificationDto);
    pagination.value.total++;
    unreadCount.value++;
    
    // Show browser notification if supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.message,
        icon: '/logo.png',
        tag: payload.id,
      });
    }
  }

  /**
   * Handles real-time unread count update event
   */
  function handleUnreadCountUpdate(payload: {unreadCount: number}): void {
    unreadCount.value = payload.unreadCount;
  }

  /**
   * Requests browser notification permission
   */
  async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
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
   * Sets type filter
   */
  function setTypeFilter(type: NotificationType | null): void {
    typeFilter.value = type;
  }

  /**
   * Clears all notifications
   */
  function clearAll(): void {
    notifications.value = [];
    unreadCount.value = 0;
    pagination.value = {
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    };
  }

  /**
   * Resets store to initial state
   */
  function reset(): void {
    clearAll();
    typeFilter.value = null;
    error.value = null;
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    error.value = null;
  }

  /**
   * Helper: Gets date grouping key for notification
   */
  function getDateKey(date: Date | string): string {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, yesterday)) return 'Yesterday';
    if (isThisWeek(d)) return 'This Week';
    return formatDate(d, 'MMMM d, yyyy');
  }

  return {
    // State
    notifications,
    unreadCount,
    pagination,
    typeFilter,
    isLoading,
    error,
    
    // Getters
    unreadNotifications,
    readNotifications,
    hasUnread,
    recentNotifications,
    filteredNotifications,
    notificationsByDate,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNewNotification,
    handleUnreadCountUpdate,
    requestNotificationPermission,
    setTypeFilter,
    clearAll,
    reset,
    clearError,
  };
});
