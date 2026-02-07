<!--
  @module presentation/views/NotificationsView
  @description Notifications list page showing all user notifications
  with read/unread status and filtering.
  @category Presentation
-->
<template>
  <div class="notifications-view">
    <div class="container">
      <div class="notifications-header">
        <h1>Notifications</h1>
        <div class="header-actions">
          <button 
            v-if="hasUnread" 
            @click="handleMarkAllAsRead" 
            class="btn btn-ghost"
          >
            Mark all as read
          </button>
          <button 
            @click="handleClearAll" 
            class="btn btn-ghost"
          >
            Clear all
          </button>
        </div>
      </div>

      <div class="notifications-filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          class="filter-btn"
          :class="{active: currentFilter === filter.value}"
        >
          {{ filter.label }}
          <span v-if="filter.count" class="count-badge">{{ filter.count }}</span>
        </button>
      </div>

      <LoadingSpinner v-if="isLoading" />

      <div v-else-if="displayedNotifications.length > 0" class="notifications-list">
        <div
          v-for="notification in displayedNotifications"
          :key="notification.id"
          class="notification-item"
          :class="{
            'unread': !notification.isRead,
            ['type-' + notification.type.toLowerCase()]: true,
          }"
        >
          <div class="notification-icon">{{ getNotificationIcon(notification.type) }}</div>
          
          <div class="notification-content">
            <h3 class="notification-title">{{ notification.title }}</h3>
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
          </div>

          <div class="notification-actions">
            <button 
              v-if="!notification.isRead"
              @click="handleMarkAsRead(notification.id)" 
              class="action-btn"
              title="Mark as read"
            >
              ✓
            </button>
            <button 
              @click="handleDelete(notification.id)" 
              class="action-btn delete-btn"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>{{ currentFilter ? 'No notifications of this type.' : 'No notifications yet.' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotifications } from '../composables/use-notifications';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';

const {
  notifications,
  unreadCount,
  hasUnread,
  isLoading,
  loadNotifications,
  markAsRead,
  markAllAsRead,
} = useNotifications();

const currentFilter = ref<string>('');

const filters = computed(() => [
  { label: 'All', value: '', count: null },
  { label: 'Unread', value: 'unread', count: unreadCount.value },
  { label: 'Projects', value: 'project', count: null },
  { label: 'Tasks', value: 'task', count: null },
  { label: 'Messages', value: 'message', count: null },
]);

const displayedNotifications = computed(() => {
  let filtered = notifications.value;
  
  if (currentFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.isRead);
  } else if (currentFilter.value) {
    filtered = filtered.filter(n => 
      n.type.toLowerCase().includes(currentFilter.value)
    );
  }
  
  return filtered.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
});

function getNotificationIcon(type: string): string {
  const iconMap: Record<string, string> = {
    PROJECT_CREATED: '📁',
    PROJECT_UPDATED: '✏️',
    PROJECT_FINALIZED: '✅',
    TASK_ASSIGNED: '📋',
    TASK_COMPLETED: '✔️',
    MESSAGE_RECEIVED: '💬',
    DEADLINE_APPROACHING: '⏰',
    BACKUP_COMPLETED: '💾',
    SYSTEM: '⚙️',
  };
  return iconMap[type] || '🔔';
}

function formatTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

async function handleMarkAsRead(id: string) {
  await markAsRead(id);
}

async function handleMarkAllAsRead() {
  await markAllAsRead();
}

async function handleDelete(id: string) {
  // await deleteNotification(id);
}

async function handleClearAll() {
  if (confirm('Are you sure you want to clear all notifications?')) {
    // await clearAll();
  }
}

onMounted(async () => {
  await loadNotifications();
});
</script>

<style scoped>
.notifications-view {
  min-height: 100vh;
  background: var(--color-bg-secondary);
  padding: var(--spacing-8) 0;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.notifications-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

.notifications-filters {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  flex-wrap: wrap;
}

.filter-btn {
  padding: var(--spacing-2) var(--spacing-4);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.filter-btn:hover {
  border-color: var(--color-primary);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.count-badge {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.filter-btn.active .count-badge {
  background: white;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.notification-item {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--color-border);
  transition: var(--transition-fast);
}

.notification-item.unread {
  border-left-color: var(--color-primary);
  background: var(--color-accent);
}

.notification-item:hover {
  box-shadow: var(--shadow-md);
}

.notification-icon {
  font-size: var(--font-size-2xl);
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-1);
  color: var(--color-text-primary);
}

.notification-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2);
  line-height: 1.5;
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.notification-actions {
  display: flex;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--font-size-base);
}

.action-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.action-btn.delete-btn:hover {
  background: #ffebee;
  color: var(--color-error);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12) var(--spacing-4);
  background: white;
  border-radius: var(--radius-md);
}

.empty-state p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

@media (max-width: 767px) {
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }
  
  .notification-item {
    flex-direction: column;
  }
  
  .notification-actions {
    flex-direction: row;
    align-self: flex-end;
  }
}
</style>
