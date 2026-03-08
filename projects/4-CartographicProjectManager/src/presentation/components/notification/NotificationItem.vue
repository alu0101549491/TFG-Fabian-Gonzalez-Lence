<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/components/notification/NotificationItem.vue
  @desc Individual notification with type-specific icon, unread indicator, and actions
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <article
    :class="[
      'notification-item',
      {
        'notification-item-unread': !notification.isRead,
        'notification-item-compact': compact,
      },
    ]"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Unread indicator -->
    <div v-if="!notification.isRead" class="notification-item-unread-dot" />

    <!-- Icon -->
    <div :class="['notification-item-icon', `notification-item-icon-${iconColor}`]">
      <span class="notification-item-icon-emoji">{{ iconEmoji }}</span>
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
        aria-label="Mark as read"
        @click="handleMarkRead"
      >
        ✓
      </button>
      <button
        type="button"
        class="notification-item-action notification-item-action-danger"
        title="Delete notification"
        aria-label="Delete notification"
        @click="handleDelete"
      >
        🗑️
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import type {NotificationDto} from '@/application/dto';
import {NotificationType} from '@/domain/enumerations';

/**
 * Icon configuration for notification types
 */
interface IconConfig {
  emoji: string;
  color: string;
}

/**
 * NotificationItem component props
 */
export interface NotificationItemProps {
  /** Notification data */
  notification: NotificationDto;
  /** Compact display mode */
  compact?: boolean;
  /** Show actions on hover */
  showActions?: boolean;
}

/**
 * NotificationItem component emits
 */
export interface NotificationItemEmits {
  (e: 'click', notification: NotificationDto): void;
  (e: 'mark-read', notificationId: string): void;
  (e: 'delete', notificationId: string): void;
}

const props = withDefaults(defineProps<NotificationItemProps>(), {
  compact: false,
  showActions: true,
});

const emit = defineEmits<NotificationItemEmits>();

// Icon mapping based on notification type
const iconMap: Record<NotificationType, IconConfig> = {
  [NotificationType.NEW_MESSAGE]: {emoji: '💬', color: 'primary'},
  [NotificationType.NEW_TASK]: {emoji: '✅', color: 'primary'},
  [NotificationType.TASK_STATUS_CHANGE]: {emoji: '🔄', color: 'info'},
  [NotificationType.FILE_RECEIVED]: {emoji: '📎', color: 'info'},
  [NotificationType.PROJECT_ASSIGNED]: {emoji: '📝', color: 'info'},
  [NotificationType.PROJECT_FINALIZED]: {emoji: '🎉', color: 'success'},
  [NotificationType.BACKUP_COMPLETED]: {emoji: '💾', color: 'success'},
  [NotificationType.BACKUP_RESTORED]: {emoji: '🛠️', color: 'info'},
};

/**
 * Get icon emoji for notification type
 */
const iconEmoji = computed<string>(() => {
  return iconMap[props.notification.type]?.emoji || '🔔';
});

/**
 * Get icon color for notification type
 */
const iconColor = computed<string>(() => {
  return iconMap[props.notification.type]?.color || 'gray';
});

/**
 * Truncate message text
 */
const truncatedMessage = computed<string>(() => {
  const maxLength = props.compact ? 60 : 120;
  const message = props.notification.message;
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + '...';
});

/**
 * Format relative time
 */
const formattedTime = computed<string>(() => {
  const date = new Date(props.notification.createdAt);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
});

/**
 * Get related entity label based on notification type.
 */
const relatedEntityLabel = computed<string | null>(() => {
  if (!props.notification.relatedEntityId) return null;

  // Infer entity type from notification type
  const typeToLabel: Record<NotificationType, string> = {
    [NotificationType.NEW_MESSAGE]: 'Message',
    [NotificationType.NEW_TASK]: 'Task',
    [NotificationType.TASK_STATUS_CHANGE]: 'Task',
    [NotificationType.FILE_RECEIVED]: 'File',
    [NotificationType.PROJECT_ASSIGNED]: 'Project',
    [NotificationType.PROJECT_FINALIZED]: 'Project',
    [NotificationType.BACKUP_COMPLETED]: 'Backup',
    [NotificationType.BACKUP_RESTORED]: 'Backup',
  };

  return typeToLabel[props.notification.type];
});

/**
 * Handle notification click
 */
function handleClick(): void {
  emit('click', props.notification);

  // Mark as read when clicked
  if (!props.notification.isRead) {
    emit('mark-read', props.notification.id);
  }
}

/**
 * Handle mark as read
 */
function handleMarkRead(): void {
  emit('mark-read', props.notification.id);
}

/**
 * Handle delete
 */
function handleDelete(): void {
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
  transition: background-color var(--transition-fast);
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

.notification-item-icon-emoji {
  font-size: 20px;
}

.notification-item-icon-primary {
  background-color: var(--color-primary-100);
}

.notification-item-icon-success {
  background-color: var(--color-success-100);
}

.notification-item-icon-warning {
  background-color: var(--color-warning-100);
}

.notification-item-icon-error {
  background-color: var(--color-error-100);
}

.notification-item-icon-info {
  background-color: var(--color-info-100);
}

.notification-item-icon-gray {
  background-color: var(--color-gray-100);
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

/* Actions */
.notification-item-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  opacity: 0;
  transition: opacity var(--transition-fast);
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
  font-size: 14px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.notification-item-action:hover {
  background-color: var(--color-primary-100);
}

.notification-item-action-danger:hover {
  background-color: var(--color-error-100);
}

/* Compact mode */
.notification-item-compact {
  padding: var(--spacing-2) var(--spacing-3);
}

.notification-item-compact .notification-item-icon {
  width: 32px;
  height: 32px;
}

.notification-item-compact .notification-item-icon-emoji {
  font-size: 16px;
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
