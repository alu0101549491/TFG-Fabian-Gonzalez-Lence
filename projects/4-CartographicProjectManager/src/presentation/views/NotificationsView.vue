<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since 2025-01-08
  @file src/presentation/views/NotificationsView.vue
  @desc Full notifications list view with filtering, marking as read,
        and infinite scroll support.
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://vuejs.org/guide/components/registration.html}
-->

<template>
  <div class="notifications-view">
    <LoadingSpinner v-if="isLoading && notifications.length === 0" />

    <template v-else>
      <!-- Notifications Header -->
      <header class="notifications-header">
        <div class="header-content">
          <h1>Notifications</h1>
          <p class="notifications-subtitle">
            {{ unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!' }}
          </p>
        </div>
        <div class="header-actions">
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            class="button-ghost button-sm"
            aria-label="Mark all as read"
          >
            Mark All as Read
          </button>
        </div>
      </header>

      <!-- Notification List -->
      <div class="notifications-container">
        <NotificationList
          :notifications="notifications"
          :unread-count="unreadCount"
          :loading="isLoading"
          :has-more="hasMore"
          :show-filters="true"
          :show-load-more="true"
          @notification-click="handleNotificationClick"
          @mark-read="handleMarkAsRead"
          @mark-all-read="handleMarkAllAsRead"
          @delete="handleDelete"
          @load-more="handleLoadMore"
        />
      </div>

      <!-- Empty State -->
      <div v-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon">🔔</div>
        <h2>No Notifications</h2>
        <p>You're all caught up! New notifications will appear here.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue';
import {useNotifications} from '../composables/use-notifications';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import NotificationList from '../components/notification/NotificationList.vue';
import type {NotificationDto} from '@/application/dto';

// Composables
const {
  notifications,
  unreadCount,
  isLoading,
  hasMore,
  fetchNotifications,
  loadMore,
  markAsRead,
  markAllAsRead,
  navigateToRelatedEntity,
} = useNotifications();

// Computed Properties (none needed - all from composable)

// Methods
/**
 * Handle notification click - navigate to related content
 *
 * @param {NotificationDto} notification - Clicked notification
 */
function handleNotificationClick(notification: NotificationDto): void {
  // Mark as read when clicked
  if (!notification.isRead) {
    handleMarkAsRead(notification.id);
  }

  // Navigate to related entity
  navigateToRelatedEntity(notification);
}

/**
 * Mark single notification as read
 *
 * @param {string} notificationId - Notification identifier
 */
async function handleMarkAsRead(notificationId: string): Promise<void> {
  try {
    await markAsRead(notificationId);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

/**
 * Mark all notifications as read
 */
async function handleMarkAllAsRead(): Promise<void> {
  try {
    await markAllAsRead();
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
}

/**
 * Delete notification (placeholder - not in composable)
 *
 * @param {string} notificationId - Notification identifier
 */
async function handleDelete(notificationId: string): Promise<void> {
  try {
    console.log('Delete notification:', notificationId);
    // TODO: Implement when delete functionality is added to composable
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
}

/**
 * Load more notifications (infinite scroll)
 */
async function handleLoadMore(): Promise<void> {
  try {
    await loadMore();
  } catch (error) {
    console.error('Failed to load more notifications:', error);
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await fetchNotifications();
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
});
</script>

<style scoped>
.notifications-view {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-6);
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
  gap: var(--spacing-4);
}

.header-content h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}

.notifications-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

.notifications-container {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-16) var(--spacing-6);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
}

.empty-state h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-3);
  color: var(--color-text-primary);
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .notifications-view {
    padding: var(--spacing-4);
  }

  .notifications-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-content h1 {
    font-size: var(--font-size-2xl);
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: var(--font-size-xl);
  }

  .empty-icon {
    font-size: 3rem;
  }
}
</style>
