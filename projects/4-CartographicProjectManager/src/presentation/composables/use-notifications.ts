/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/composables/use-notifications.ts
 * @desc Composable for notification management with navigation support
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://vuejs.org/guide/reusability/composables.html}
 */

import {computed, type ComputedRef} from 'vue';
import {useRouter} from 'vue-router';
import {useNotificationStore} from '../stores/notification.store';
import type {NotificationDto} from '../../application/dto';
import {NotificationType} from '../../domain/enumerations/notification-type';
import {ROUTES} from '../../shared/constants';
import {formatRelativeTime} from '../../shared/utils';

/**
 * Return interface for useNotifications composable
 */
export interface UseNotificationsReturn {
  // Notifications
  notifications: ComputedRef<NotificationDto[]>;
  recentNotifications: ComputedRef<NotificationDto[]>;
  unreadNotifications: ComputedRef<NotificationDto[]>;

  // Unread Count
  unreadCount: ComputedRef<number>;
  hasUnread: ComputedRef<boolean>;

  // Grouped
  notificationsByDate: ComputedRef<Map<string, NotificationDto[]>>;

  // Pagination
  hasMore: ComputedRef<boolean>;

  // Status
  isLoading: ComputedRef<boolean>;
  error: ComputedRef<string | null>;

  // Fetch Actions
  fetchNotifications: () => Promise<void>;
  loadMore: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;

  // Read Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  // Delete Actions
  deleteNotification: (notificationId: string) => Promise<void>;

  // Navigation
  navigateToRelatedEntity: (notification: NotificationDto) => void;

  // Utilities
  getNotificationIcon: (type: NotificationType) => string;
  getNotificationColor: (type: NotificationType) => string;
  formatNotificationTime: (date: Date | string) => string;
  clearError: () => void;
}

/**
 * Composable for notification management
 *
 * Provides reactive notification data, mark as read operations,
 * navigation to related entities, and UI utilities.
 *
 * @returns Notification state and methods
 *
 * @example
 * ```vue
 * <script setup>
 * import { useNotifications } from '@/presentation/composables';
 *
 * const {
 *   notifications,
 *   unreadCount,
 *   markAsRead,
 *   navigateToRelatedEntity
 * } = useNotifications();
 * </script>
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const store = useNotificationStore();
  const router = useRouter();

  // Computed from store
  const notifications = computed(() => store.notifications);
  const recentNotifications = computed(() => store.recentNotifications);
  const unreadNotifications = computed(() => store.unreadNotifications);
  const unreadCount = computed(() => store.unreadCount);
  const hasUnread = computed(() => store.hasUnread);
  const notificationsByDate = computed(() => store.notificationsByDate);

  const hasMore = computed(() => store.pagination.hasMore);
  const isLoading = computed(() => store.isLoading);
  const error = computed(() => store.error);

  /**
   * Fetches notifications
   */
  async function fetchNotifications(): Promise<void> {
    await store.fetchNotifications();
  }

  /**
   * Loads more notifications (pagination)
   */
  async function loadMore(): Promise<void> {
    if (hasMore.value && !isLoading.value) {
      await store.fetchNotifications(true);
    }
  }

  /**
   * Refreshes notifications
   */
  async function refreshNotifications(): Promise<void> {
    await store.fetchNotifications();
  }

  /**
   * Fetches unread notification count
   */
  async function fetchUnreadCount(): Promise<void> {
    await store.fetchUnreadCount();
  }

  /**
   * Marks a notification as read
   *
   * @param notificationId - Notification unique identifier
   */
  async function markAsRead(notificationId: string): Promise<void> {
    await store.markAsRead(notificationId);
  }

  /**
   * Marks all notifications as read
   */
  async function markAllAsRead(): Promise<void> {
    await store.markAllAsRead();
  }

  /**
   * Deletes a notification
   *
   * @param notificationId - Notification unique identifier
   */
  async function deleteNotification(notificationId: string): Promise<void> {
    await store.deleteNotification(notificationId);
  }

  /**
   * Navigates to the entity related to a notification
   *
   * Automatically marks notification as read and routes to
   * the appropriate page based on notification type.
   *
   * @param notification - Notification to navigate from
   */
  function navigateToRelatedEntity(notification: NotificationDto): void {
    // Mark as read first
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (!notification.relatedEntityId) {
      return;
    }

    switch (notification.type) {
      case NotificationType.NEW_MESSAGE:
      case NotificationType.PROJECT_ASSIGNED:
      case NotificationType.PROJECT_FINALIZED:
        router.push({
          name: 'project-details',
          params: {id: notification.relatedEntityId},
        });
        break;

      case NotificationType.NEW_TASK:
      case NotificationType.TASK_STATUS_CHANGE:
        router.push({
          name: 'project-details',
          params: {id: notification.relatedEntityId},
          query: {tab: 'tasks'},
        });
        break;

      case NotificationType.FILE_RECEIVED:
        router.push({
          name: 'project-details',
          params: {id: notification.relatedEntityId},
          query: {tab: 'files'},
        });
        break;

      default:
        router.push(ROUTES.NOTIFICATIONS);
    }
  }

  /**
   * Gets icon name for notification type
   *
   * @param type - Notification type
   * @returns Icon name (Lucide icon name)
   */
  function getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      [NotificationType.NEW_MESSAGE]: 'message-circle',
      [NotificationType.NEW_TASK]: 'check-square',
      [NotificationType.TASK_STATUS_CHANGE]: 'refresh-cw',
      [NotificationType.FILE_RECEIVED]: 'file',
      [NotificationType.PROJECT_ASSIGNED]: 'folder-plus',
      [NotificationType.PROJECT_FINALIZED]: 'folder-check',
    };
    return icons[type] ?? 'bell';
  }

  /**
   * Gets color for notification type
   *
   * @param type - Notification type
   * @returns Color name for styling
   */
  function getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      [NotificationType.NEW_MESSAGE]: 'blue',
      [NotificationType.NEW_TASK]: 'green',
      [NotificationType.TASK_STATUS_CHANGE]: 'yellow',
      [NotificationType.FILE_RECEIVED]: 'purple',
      [NotificationType.PROJECT_ASSIGNED]: 'blue',
      [NotificationType.PROJECT_FINALIZED]: 'gray',
    };
    return colors[type] ?? 'gray';
  }

  /**
   * Formats notification timestamp
   *
   * @param date - Notification timestamp
   * @returns Formatted relative time string
   */
  function formatNotificationTime(date: Date | string): string {
    return formatRelativeTime(date);
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    store.clearError();
  }

  return {
    // Notifications
    notifications,
    recentNotifications,
    unreadNotifications,

    // Unread Count
    unreadCount,
    hasUnread,

    // Grouped
    notificationsByDate,

    // Pagination
    hasMore,

    // Status
    isLoading,
    error,

    // Fetch Actions
    fetchNotifications,
    loadMore,
    refreshNotifications,
    fetchUnreadCount,

    // Read Actions
    markAsRead,
    markAllAsRead,

    // Delete Actions
    deleteNotification,

    // Navigation
    navigateToRelatedEntity,

    // Utilities
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime,
    clearError,
  };
}
