<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/components/notification/NotificationList.vue
  @desc Notification list with date grouping, filters, and infinite scroll
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div :class="['notification-list', {'notification-list-compact': compact}]">
    <!-- Header -->
    <div v-if="showHeader" class="notification-list-header">
      <div class="notification-list-header-title">
        <h3 class="notification-list-title">Notifications</h3>
        <span v-if="unreadCount > 0" class="notification-list-badge">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </div>

      <div class="notification-list-header-actions">
        <!-- Filter dropdown -->
        <div v-if="!compact" class="notification-list-filter">
          <select
            v-model="activeFilter"
            class="notification-list-filter-select"
            aria-label="Filter notifications"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="task">Tasks</option>
            <option value="message">Messages</option>
            <option value="project">Projects</option>
          </select>
        </div>

        <!-- Mark all read -->
        <button
          v-if="unreadCount > 0"
          type="button"
          class="notification-list-mark-all"
          title="Mark all as read"
          @click="$emit('mark-all-read')"
        >
          <span>✓✓</span>
          <span v-if="!compact">Mark all read</span>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="notification-list-loading">
      <div v-for="n in 5" :key="n" class="notification-item-skeleton">
        <div class="skeleton-icon" />
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-line-short" />
          <div class="skeleton-line skeleton-line-long" />
          <div class="skeleton-line skeleton-line-xs" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredNotifications.length === 0" class="notification-list-empty">
      <span class="notification-list-empty-icon">🔕</span>
      <h4 class="notification-list-empty-title">
        {{ activeFilter !== 'all' ? 'No matching notifications' : emptyMessage }}
      </h4>
      <p v-if="activeFilter !== 'all'" class="notification-list-empty-description">
        Try changing your filter settings.
      </p>
      <button
        v-if="activeFilter !== 'all'"
        type="button"
        class="notification-list-empty-action"
        @click="activeFilter = 'all'"
      >
        Show all notifications
      </button>
    </div>

    <!-- Notifications -->
    <div v-else ref="listRef" class="notification-list-content" @scroll="handleScroll">
      <!-- Grouped by date -->
      <template v-for="group in groupedNotifications" :key="group.label">
        <div class="notification-list-group">
          <div class="notification-list-group-header">
            <span class="notification-list-group-label">{{ group.label }}</span>
          </div>

          <NotificationItem
            v-for="notification in group.notifications"
            :key="notification.id"
            :notification="notification"
            :compact="compact"
            :show-actions="!compact"
            @click="handleNotificationClick"
            @mark-read="(id) => $emit('mark-read', id)"
            @delete="(id) => $emit('delete', id)"
          />
        </div>
      </template>

      <!-- Load more indicator -->
      <div v-if="loadingMore" class="notification-list-load-more">
        <span class="notification-list-load-spinner">⏳</span>
        <span>Loading more...</span>
      </div>

      <!-- Load more trigger -->
      <div
        v-if="hasMore && !loadingMore"
        ref="loadMoreTriggerRef"
        class="notification-list-load-trigger"
      />
    </div>

    <!-- Footer (for compact/dropdown mode) -->
    <div v-if="compact && notifications.length > 0" class="notification-list-footer">
      <button type="button" class="notification-list-view-all" @click="$emit('view-all')">
        View all notifications
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onUnmounted} from 'vue';
import type {NotificationDto} from '@/application/dto';
import {NotificationType} from '@/domain/enumerations';
import NotificationItem from './NotificationItem.vue';

/**
 * Notification group interface
 */
interface NotificationGroup {
  label: string;
  date: string;
  notifications: NotificationDto[];
}

/**
 * Notification filter interface
 */
export interface NotificationFilter {
  type?: NotificationType;
  isRead?: boolean;
}

/**
 * NotificationList component props
 */
export interface NotificationListProps {
  /** Notifications grouped by date */
  notifications: NotificationDto[];
  /** Unread count */
  unreadCount?: number;
  /** Loading state */
  loading?: boolean;
  /** Loading more state */
  loadingMore?: boolean;
  /** Has more notifications to load */
  hasMore?: boolean;
  /** Show header */
  showHeader?: boolean;
  /** Compact mode for dropdown */
  compact?: boolean;
  /** Maximum items to show (for dropdown preview) */
  maxItems?: number;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * NotificationList component emits
 */
export interface NotificationListEmits {
  (e: 'notification-click', notification: NotificationDto): void;
  (e: 'mark-read', notificationId: string): void;
  (e: 'mark-all-read'): void;
  (e: 'delete', notificationId: string): void;
  (e: 'load-more'): void;
  (e: 'filter-change', filter: NotificationFilter): void;
  (e: 'view-all'): void;
}

const props = withDefaults(defineProps<NotificationListProps>(), {
  unreadCount: 0,
  loading: false,
  loadingMore: false,
  hasMore: false,
  showHeader: true,
  compact: false,
  emptyMessage: 'No notifications yet',
});

const emit = defineEmits<NotificationListEmits>();

// Refs
const listRef = ref<HTMLElement | null>(null);
const loadMoreTriggerRef = ref<HTMLElement | null>(null);

// State
const activeFilter = ref<string>('all');

// Intersection observer for infinite scroll
let loadMoreObserver: IntersectionObserver | null = null;

onMounted(() => {
  setupIntersectionObserver();
});

onUnmounted(() => {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect();
  }
});

watch(loadMoreTriggerRef, (newRef) => {
  if (loadMoreObserver && newRef) {
    loadMoreObserver.observe(newRef);
  }
});

/**
 * Setup intersection observer for infinite scroll
 */
function setupIntersectionObserver(): void {
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && props.hasMore && !props.loadingMore) {
        emit('load-more');
      }
    },
    {
      root: listRef.value,
      threshold: 0.1,
    },
  );

  if (loadMoreTriggerRef.value) {
    loadMoreObserver.observe(loadMoreTriggerRef.value);
  }
}

/**
 * Filtered notifications
 */
const filteredNotifications = computed<NotificationDto[]>(() => {
  let result = [...props.notifications];

  // Apply max items limit for compact mode
  if (props.compact && props.maxItems) {
    result = result.slice(0, props.maxItems);
  }

  // Apply filter
  switch (activeFilter.value) {
    case 'unread':
      result = result.filter((n) => !n.isRead);
      break;
    case 'task':
      result = result.filter(
        (n) =>
          n.type === NotificationType.NEW_TASK ||
          n.type === NotificationType.TASK_STATUS_CHANGE,
      );
      break;
    case 'message':
      result = result.filter((n) => n.type === NotificationType.NEW_MESSAGE);
      break;
    case 'project':
      result = result.filter(
        (n) =>
          n.type === NotificationType.PROJECT_ASSIGNED ||
          n.type === NotificationType.PROJECT_FINALIZED,
      );
      break;
  }

  return result;
});

/**
 * Group notifications by date
 */
const groupedNotifications = computed<NotificationGroup[]>(() => {
  const groups: NotificationGroup[] = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Group map
  const groupMap: Record<string, NotificationDto[]> = {};

  for (const notification of filteredNotifications.value) {
    const dateStr = new Date(notification.createdAt).toISOString().split('T')[0];
    const notificationDate = new Date(notification.createdAt);

    let groupKey: string;

    if (dateStr === todayStr) {
      groupKey = 'Today';
    } else if (dateStr === yesterdayStr) {
      groupKey = 'Yesterday';
    } else if (notificationDate >= weekAgo) {
      groupKey = 'This Week';
    } else {
      // Group by month
      groupKey = notificationDate.toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
    }

    if (!groupMap[groupKey]) {
      groupMap[groupKey] = [];
    }
    groupMap[groupKey].push(notification);
  }

  // Convert to array maintaining order
  const orderedKeys = ['Today', 'Yesterday', 'This Week'];
  const otherKeys = Object.keys(groupMap)
    .filter((k) => !orderedKeys.includes(k))
    .sort((a, b) => {
      // Sort other keys by date (newest first)
      const dateA = new Date(groupMap[a][0].createdAt);
      const dateB = new Date(groupMap[b][0].createdAt);
      return dateB.getTime() - dateA.getTime();
    });

  const allKeys = [...orderedKeys.filter((k) => groupMap[k]), ...otherKeys];

  for (const key of allKeys) {
    if (groupMap[key]) {
      groups.push({
        label: key,
        date: key,
        notifications: groupMap[key],
      });
    }
  }

  return groups;
});

/**
 * Emit filter change
 */
watch(activeFilter, (newFilter) => {
  const filter: NotificationFilter = {};

  if (newFilter === 'unread') {
    filter.isRead = false;
  }

  emit('filter-change', filter);
});

/**
 * Scroll handler for infinite scroll (fallback)
 */
function handleScroll(event: Event): void {
  if (props.loadingMore || !props.hasMore) return;

  const target = event.target as HTMLElement;
  const {scrollTop, scrollHeight, clientHeight} = target;

  // Load more when near bottom
  if (scrollHeight - scrollTop - clientHeight < 100) {
    emit('load-more');
  }
}

/**
 * Handle notification click
 */
function handleNotificationClick(notification: NotificationDto): void {
  emit('notification-click', notification);
}
</script>

<style scoped>
.notification-list {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.notification-list-compact {
  max-height: 400px;
  width: 360px;
}

/* Header */
.notification-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-gray-50);
}

.notification-list-header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.notification-list-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.notification-list-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: white;
  background-color: var(--color-error-500);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-list-header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.notification-list-filter-select {
  height: 32px;
  padding: 0 var(--spacing-6) 0 var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  cursor: pointer;
}

.notification-list-mark-all {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.notification-list-mark-all:hover {
  background-color: var(--color-primary-50);
}

/* Loading state */
.notification-list-loading {
  padding: var(--spacing-2);
}

.notification-item-skeleton {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
}

.skeleton-icon {
  width: 40px;
  height: 40px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.skeleton-line {
  height: 12px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line-xs {
  width: 60px;
}
.skeleton-line-short {
  width: 120px;
}
.skeleton-line-long {
  width: 90%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Empty state */
.notification-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  text-align: center;
}

.notification-list-empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-4);
}

.notification-list-empty-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1);
}

.notification-list-empty-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-3);
}

.notification-list-empty-action {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

/* Content */
.notification-list-content {
  flex: 1;
  overflow-y: auto;
}

.notification-list-compact .notification-list-content {
  max-height: 320px;
}

/* Groups */
.notification-list-group {
  /* Container for group */
}

.notification-list-group-header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-gray-50);
  border-bottom: 1px solid var(--color-border-primary);
}

.notification-list-group-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Load more */
.notification-list-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.notification-list-load-spinner {
  font-size: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.notification-list-load-trigger {
  height: 1px;
}

/* Footer */
.notification-list-footer {
  padding: var(--spacing-3);
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-gray-50);
}

.notification-list-view-all {
  display: block;
  width: 100%;
  padding: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: center;
  transition: background-color var(--transition-fast);
}

.notification-list-view-all:hover {
  background-color: var(--color-primary-50);
}

/* Scrollbar */
.notification-list-content::-webkit-scrollbar {
  width: 6px;
}

.notification-list-content::-webkit-scrollbar-track {
  background: transparent;
}

.notification-list-content::-webkit-scrollbar-thumb {
  background-color: var(--color-gray-300);
  border-radius: var(--radius-full);
}

.notification-list-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-gray-400);
}

/* Responsive */
@media (max-width: 640px) {
  .notification-list-compact {
    width: 100%;
    max-width: none;
  }

  .notification-list-header {
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }

  .notification-list-header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
