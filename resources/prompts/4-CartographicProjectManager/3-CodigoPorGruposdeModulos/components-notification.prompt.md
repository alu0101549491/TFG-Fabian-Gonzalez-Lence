# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → Infrastructure Layer → **Presentation Layer** (current)

**Current module:** Presentation Layer - Notification Components

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/                        # ✅ Already implemented
│   ├── domain/                             # ✅ Already implemented
│   ├── infrastructure/                     # ✅ Already implemented
│   ├── shared/                             # ✅ Already implemented
│   └── presentation/
│       ├── components/
│       │   ├── common/                     # ✅ Already implemented
│       │   ├── project/                    # ✅ Already implemented
│       │   ├── task/                       # ✅ Already implemented
│       │   ├── message/                    # ✅ Already implemented
│       │   ├── file/                       # ✅ Already implemented
│       │   ├── notification/
│       │   │   ├── NotificationItem.vue    # 🎯 TO IMPLEMENT
│       │   │   └── NotificationList.vue    # 🎯 TO IMPLEMENT
│       │   └── calendar/
│       │       └── ...
│       ├── composables/                    # ✅ Already implemented
│       ├── router/                         # ✅ Already implemented
│       ├── stores/                         # ✅ Already implemented
│       ├── styles/                         # ✅ Already implemented
│       ├── views/
│       │   └── ...
│       ├── App.vue
│       └── main.ts
```

---

# INPUT ARTIFACTS

## 1. Notification DTOs (Already Implemented)

```typescript
interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId: string | null;
  relatedEntityType: 'project' | 'task' | 'message' | 'file' | null;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
}
```

## 2. Enumerations (Already Implemented)

```typescript
enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_CONFIRMED = 'TASK_CONFIRMED',
  TASK_REJECTED = 'TASK_REJECTED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_FINALIZED = 'PROJECT_FINALIZED',
  FILE_UPLOADED = 'FILE_UPLOADED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  DEADLINE_OVERDUE = 'DEADLINE_OVERDUE',
}
```

## 3. Composables (Already Implemented)

```typescript
// useNotifications
const {
  notifications,
  recentNotifications,
  unreadNotifications,
  unreadCount,
  hasUnread,
  notificationsByDate,
  hasMore,
  isLoading,
  error,
  fetchNotifications,
  loadMore,
  markAsRead,
  markAllAsRead,
  navigateToRelatedEntity,
  getNotificationIcon,
  getNotificationColor,
  formatNotificationTime,
} = useNotifications();
```

## 4. Design Specifications

### NotificationItem
- Compact card with icon, title, message preview, timestamp
- Unread indicator (dot or background highlight)
- Notification type icon with color
- Click to navigate to related entity
- Mark as read on click or explicit action
- Swipe to dismiss (mobile)
- Hover actions (mark read, delete)

### NotificationList
- Grouped by date (Today, Yesterday, This Week, Older)
- Infinite scroll for more notifications
- Mark all as read action
- Filter by type or read status
- Loading and empty states
- Real-time updates integration
- Badge count in header

---

# SPECIFIC TASK

Implement all Notification Components for the Presentation Layer. These components handle displaying and managing user notifications.

## Files to implement:

### 1. **NotificationItem.vue**

**Responsibilities:**
- Display individual notification with appropriate styling
- Show type-specific icon with color
- Display unread indicator
- Format relative timestamp
- Handle click to navigate to related entity
- Support mark as read action
- Compact and expanded display modes

**Props:**

```typescript
interface NotificationItemProps {
  /** Notification data */
  notification: NotificationDto;
  /** Compact display mode */
  compact?: boolean;
  /** Show actions on hover */
  showActions?: boolean;
}
```

**Emits:**

```typescript
interface NotificationItemEmits {
  (e: 'click', notification: NotificationDto): void;
  (e: 'mark-read', notificationId: string): void;
  (e: 'delete', notificationId: string): void;
}
```

**Template Structure:**

```vue
<template>
  <article
    :class="[
      'notification-item',
      {
        'notification-item-unread': !notification.isRead,
        'notification-item-compact': compact,
      }
    ]"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <!-- Unread indicator -->
    <div v-if="!notification.isRead" class="notification-item-unread-dot" />
    
    <!-- Icon -->
    <div
      :class="['notification-item-icon', `notification-item-icon-${iconColor}`]"
    >
      <component :is="iconComponent" />
    </div>
    
    <!-- Content -->
    <div class="notification-item-content">
      <!-- Title -->
      <h4 class="notification-item-title">{{ notification.title }}</h4>
      
      <!-- Message -->
      <p class="notification-item-message">{{ truncatedMessage }}</p>
      
      <!-- Meta: Time + Related entity -->
      <div class="notification-item-meta">
        <span class="notification-item-time">{{ formattedTime }}</span>
        <span v-if="relatedEntityLabel" class="notification-item-entity">
          • {{ relatedEntityLabel }}
        </span>
      </div>
    </div>
    
    <!-- Actions -->
    <div v-if="showActions" class="notification-item-actions" @click.stop>
      <button
        v-if="!notification.isRead"
        type="button"
        class="notification-item-action"
        title="Mark as read"
        @click="handleMarkRead"
      >
        <CheckIcon />
      </button>
      <button
        type="button"
        class="notification-item-action notification-item-action-danger"
        title="Delete notification"
        @click="handleDelete"
      >
        <TrashIcon />
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NotificationDto } from '@/application/dto';
import { NotificationType } from '@/domain/enumerations';
import { formatRelativeTime, truncate } from '@/shared/utils';
import {
  Check as CheckIcon,
  Trash as TrashIcon,
  CheckSquare as CheckSquareIcon,
  RefreshCw as RefreshCwIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  MessageCircle as MessageCircleIcon,
  FolderEdit as FolderEditIcon,
  FolderCheck as FolderCheckIcon,
  FileUp as FileUpIcon,
  Clock as ClockIcon,
  AlertTriangle as AlertTriangleIcon,
  Bell as BellIcon,
} from 'lucide-vue-next';

const props = withDefaults(defineProps<NotificationItemProps>(), {
  compact: false,
  showActions: true,
});

const emit = defineEmits<NotificationItemEmits>();

// Icon mapping based on notification type
const iconMap: Record<NotificationType, { icon: typeof BellIcon; color: string }> = {
  [NotificationType.TASK_ASSIGNED]: { icon: CheckSquareIcon, color: 'primary' },
  [NotificationType.TASK_STATUS_CHANGED]: { icon: RefreshCwIcon, color: 'info' },
  [NotificationType.TASK_CONFIRMED]: { icon: CheckCircleIcon, color: 'success' },
  [NotificationType.TASK_REJECTED]: { icon: XCircleIcon, color: 'error' },
  [NotificationType.MESSAGE_RECEIVED]: { icon: MessageCircleIcon, color: 'primary' },
  [NotificationType.PROJECT_UPDATED]: { icon: FolderEditIcon, color: 'info' },
  [NotificationType.PROJECT_FINALIZED]: { icon: FolderCheckIcon, color: 'success' },
  [NotificationType.FILE_UPLOADED]: { icon: FileUpIcon, color: 'info' },
  [NotificationType.DEADLINE_APPROACHING]: { icon: ClockIcon, color: 'warning' },
  [NotificationType.DEADLINE_OVERDUE]: { icon: AlertTriangleIcon, color: 'error' },
};

// Computed
const iconComponent = computed(() => {
  return iconMap[props.notification.type]?.icon || BellIcon;
});

const iconColor = computed(() => {
  return iconMap[props.notification.type]?.color || 'gray';
});

const truncatedMessage = computed(() => {
  const maxLength = props.compact ? 60 : 120;
  return truncate(props.notification.message, maxLength);
});

const formattedTime = computed(() => {
  return formatRelativeTime(props.notification.createdAt);
});

const relatedEntityLabel = computed(() => {
  if (!props.notification.relatedEntityType) return null;
  
  const labels: Record<string, string> = {
    project: 'Project',
    task: 'Task',
    message: 'Message',
    file: 'File',
  };
  
  return labels[props.notification.relatedEntityType] || null;
});

// Handlers
function handleClick() {
  emit('click', props.notification);
  
  // Mark as read when clicked
  if (!props.notification.isRead) {
    emit('mark-read', props.notification.id);
  }
}

function handleMarkRead() {
  emit('mark-read', props.notification.id);
}

function handleDelete() {
  emit('delete', props.notification.id);
}
</script>

<style scoped>
.notification-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-primary);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.notification-item:hover {
  background-color: var(--color-gray-50);
}

.notification-item:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: -2px;
}

.notification-item:last-child {
  border-bottom: none;
}

/* Unread state */
.notification-item-unread {
  background-color: var(--color-primary-50);
}

.notification-item-unread:hover {
  background-color: var(--color-primary-100);
}

.notification-item-unread-dot {
  position: absolute;
  top: var(--spacing-4);
  left: var(--spacing-2);
  width: 8px;
  height: 8px;
  background-color: var(--color-primary-500);
  border-radius: var(--radius-full);
}

/* Icon */
.notification-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.notification-item-icon svg {
  width: 20px;
  height: 20px;
}

.notification-item-icon-primary {
  background-color: var(--color-primary-100);
  color: var(--color-primary-600);
}

.notification-item-icon-success {
  background-color: var(--color-success-100);
  color: var(--color-success-600);
}

.notification-item-icon-warning {
  background-color: var(--color-warning-100);
  color: var(--color-warning-600);
}

.notification-item-icon-error {
  background-color: var(--color-error-100);
  color: var(--color-error-600);
}

.notification-item-icon-info {
  background-color: var(--color-info-100);
  color: var(--color-info-600);
}

.notification-item-icon-gray {
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
}

/* Content */
.notification-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.notification-item-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
}

.notification-item-unread .notification-item-title {
  font-weight: var(--font-weight-bold);
}

.notification-item-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.notification-item-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.notification-item-time {
  /* Inherits styles */
}

.notification-item-entity {
  /* Inherits styles */
}

/* Actions */
.notification-item-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  opacity: 0;
  transition: opacity var(--duration-fast) ease;
}

.notification-item:hover .notification-item-actions {
  opacity: 1;
}

.notification-item-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.notification-item-action:hover {
  color: var(--color-primary-600);
  background-color: var(--color-primary-100);
}

.notification-item-action-danger:hover {
  color: var(--color-error-600);
  background-color: var(--color-error-100);
}

.notification-item-action svg {
  width: 16px;
  height: 16px;
}

/* Compact mode */
.notification-item-compact {
  padding: var(--spacing-2) var(--spacing-3);
}

.notification-item-compact .notification-item-icon {
  width: 32px;
  height: 32px;
}

.notification-item-compact .notification-item-icon svg {
  width: 16px;
  height: 16px;
}

.notification-item-compact .notification-item-title {
  font-size: var(--font-size-xs);
}

.notification-item-compact .notification-item-message {
  font-size: var(--font-size-xs);
}

.notification-item-compact .notification-item-unread-dot {
  width: 6px;
  height: 6px;
  top: var(--spacing-3);
}

/* Mobile: always show actions */
@media (max-width: 640px) {
  .notification-item-actions {
    opacity: 1;
  }
}
</style>
```

---

### 2. **NotificationList.vue**

**Responsibilities:**
- Display notifications grouped by date
- Infinite scroll for loading more
- Filter by type or read status
- Mark all as read action
- Loading and empty states
- Header with unread count
- Real-time notification support

**Props:**

```typescript
interface NotificationListProps {
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
```

**Emits:**

```typescript
interface NotificationListEmits {
  (e: 'notification-click', notification: NotificationDto): void;
  (e: 'mark-read', notificationId: string): void;
  (e: 'mark-all-read'): void;
  (e: 'delete', notificationId: string): void;
  (e: 'load-more'): void;
  (e: 'filter-change', filter: NotificationFilter): void;
  (e: 'view-all'): void;
}

interface NotificationFilter {
  type?: NotificationType;
  isRead?: boolean;
}
```

**Template Structure:**

```vue
<template>
  <div :class="['notification-list', { 'notification-list-compact': compact }]">
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
          <select v-model="activeFilter" class="notification-list-filter-select">
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
          <CheckCheckIcon />
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
      <BellOffIcon class="notification-list-empty-icon" />
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
        <LoadingSpinner size="sm" />
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
      <button
        type="button"
        class="notification-list-view-all"
        @click="$emit('view-all')"
      >
        View all notifications
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { NotificationDto } from '@/application/dto';
import { NotificationType } from '@/domain/enumerations';
import { formatDate } from '@/shared/utils';
import NotificationItem from './NotificationItem.vue';
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue';
import {
  CheckCheck as CheckCheckIcon,
  BellOff as BellOffIcon,
} from 'lucide-vue-next';

interface NotificationGroup {
  label: string;
  date: string;
  notifications: NotificationDto[];
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

function setupIntersectionObserver() {
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && props.hasMore && !props.loadingMore) {
        emit('load-more');
      }
    },
    {
      root: listRef.value,
      threshold: 0.1,
    }
  );
  
  if (loadMoreTriggerRef.value) {
    loadMoreObserver.observe(loadMoreTriggerRef.value);
  }
}

// Filtered notifications
const filteredNotifications = computed(() => {
  let result = [...props.notifications];
  
  // Apply max items limit for compact mode
  if (props.compact && props.maxItems) {
    result = result.slice(0, props.maxItems);
  }
  
  // Apply filter
  switch (activeFilter.value) {
    case 'unread':
      result = result.filter(n => !n.isRead);
      break;
    case 'task':
      result = result.filter(n =>
        n.type.startsWith('TASK_') || n.relatedEntityType === 'task'
      );
      break;
    case 'message':
      result = result.filter(n =>
        n.type === NotificationType.MESSAGE_RECEIVED || n.relatedEntityType === 'message'
      );
      break;
    case 'project':
      result = result.filter(n =>
        n.type.startsWith('PROJECT_') || n.relatedEntityType === 'project'
      );
      break;
  }
  
  return result;
});

// Group notifications by date
const groupedNotifications = computed<NotificationGroup[]>(() => {
  const groups: NotificationGroup[] = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const todayStr = formatDate(today, 'yyyy-MM-dd');
  const yesterdayStr = formatDate(yesterday, 'yyyy-MM-dd');
  
  // Group map
  const groupMap: Record<string, NotificationDto[]> = {};
  
  for (const notification of filteredNotifications.value) {
    const dateStr = formatDate(notification.createdAt, 'yyyy-MM-dd');
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
      groupKey = formatDate(notificationDate, 'MMMM yyyy');
    }
    
    if (!groupMap[groupKey]) {
      groupMap[groupKey] = [];
    }
    groupMap[groupKey].push(notification);
  }
  
  // Convert to array maintaining order
  const orderedKeys = ['Today', 'Yesterday', 'This Week'];
  const otherKeys = Object.keys(groupMap)
    .filter(k => !orderedKeys.includes(k))
    .sort((a, b) => {
      // Sort other keys by date (newest first)
      const dateA = new Date(groupMap[a][0].createdAt);
      const dateB = new Date(groupMap[b][0].createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  
  const allKeys = [...orderedKeys.filter(k => groupMap[k]), ...otherKeys];
  
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

// Emit filter change
watch(activeFilter, (newFilter) => {
  const filter: { type?: NotificationType; isRead?: boolean } = {};
  
  if (newFilter === 'unread') {
    filter.isRead = false;
  } else if (newFilter === 'task') {
    // Could add type filter if needed
  }
  
  emit('filter-change', filter);
});

// Scroll handler for infinite scroll (fallback)
function handleScroll(event: Event) {
  if (props.loadingMore || !props.hasMore) return;
  
  const target = event.target as HTMLElement;
  const { scrollTop, scrollHeight, clientHeight } = target;
  
  // Load more when near bottom
  if (scrollHeight - scrollTop - clientHeight < 100) {
    emit('load-more');
  }
}

// Handle notification click
function handleNotificationClick(notification: NotificationDto) {
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
  transition: background-color var(--duration-fast) ease;
}

.notification-list-mark-all:hover {
  background-color: var(--color-primary-50);
}

.notification-list-mark-all svg {
  width: 16px;
  height: 16px;
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

.skeleton-line-xs { width: 60px; }
.skeleton-line-short { width: 120px; }
.skeleton-line-long { width: 90%; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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
  width: 48px;
  height: 48px;
  color: var(--color-gray-300);
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
  transition: background-color var(--duration-fast) ease;
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
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x with Vue 3
- **Code style:** Google TypeScript Style Guide
- **Framework:** Vue 3 Composition API with `<script setup>`
- **Styling:** Scoped CSS using CSS variables from `variables.css`

## Mandatory best practices:
- **Accessibility:** ARIA attributes, keyboard navigation, focus management
- **Type Safety:** Full props/emits interfaces
- **Responsiveness:** Mobile-first design
- **Performance:** Infinite scroll, efficient rendering
- **Real-time:** Support for live notification updates
- **UX:** Clear visual hierarchy, unread indicators

## Component Design Principles:
- Type-specific icons with color coding
- Clear unread/read visual states
- Date grouping for organization
- Compact mode for dropdown usage
- Filter and search capabilities
- Smooth transitions and feedback

## Notification UX Patterns:
- Click to navigate and mark read
- Batch mark all as read
- Filter by type and status
- Relative timestamps
- Visual badge for unread count

---

# DELIVERABLES

1. **Complete source code** for all 2 files:
   - `NotificationItem.vue`
   - `NotificationList.vue`

2. **For each component:**
   - Full `<script setup>` with TypeScript
   - Props/Emits interfaces
   - Scoped CSS with CSS variables
   - Responsive design
   - Accessibility attributes

3. **Features per component:**
   - **NotificationItem:** Type icons, unread indicator, actions, compact mode
   - **NotificationList:** Date groups, filters, mark all read, infinite scroll, dropdown mode

---

# OUTPUT FORMAT

```vue
<!-- src/presentation/components/notification/NotificationItem.vue -->
[Complete code]
```

```vue
<!-- src/presentation/components/notification/NotificationList.vue -->
[Complete code]
```

**Design decisions made:**
- [Decision 1]
- [Decision 2]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
