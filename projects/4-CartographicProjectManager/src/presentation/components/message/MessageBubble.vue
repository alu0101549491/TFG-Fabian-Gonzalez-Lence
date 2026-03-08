<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/message/MessageBubble.vue
  @desc Individual message bubble displaying sender, content, files, and read status
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div
    :class="[
      'message-bubble',
      {
        'message-bubble-own': isOwnMessage,
        'message-bubble-other': !isOwnMessage,
        'message-bubble-compact': compact,
      },
    ]"
  >
    <!-- Avatar (for other users' messages) -->
    <div v-if="showAvatar && !isOwnMessage" class="message-avatar">
      <span class="message-avatar-initials">{{ senderInitials }}</span>
    </div>

    <!-- Spacer for alignment when avatar is hidden -->
    <div v-else-if="!isOwnMessage" class="message-avatar-spacer" />

    <!-- Bubble content -->
    <div class="message-content-wrapper">
      <!-- Sender info -->
      <div v-if="showSender && !isOwnMessage" class="message-sender">
        <span class="message-sender-name">{{ message.senderName }}</span>
        <span v-if="message.senderRole" :class="['message-sender-role', `message-sender-role-${message.senderRole.toLowerCase()}`]">
          {{ roleLabel }}
        </span>
      </div>

      <!-- Message bubble -->
      <div class="message-bubble-content">
        <!-- Text content -->
        <p class="message-text">{{ message.content }}</p>

        <!-- File attachments -->
        <div v-if="message.files && message.files.length > 0" class="message-files">
          <button
            v-for="file in message.files"
            :key="file.id"
            type="button"
            class="message-file"
            @click="emit('file-click', file)"
          >
            <span class="message-file-icon">{{ getFileIconEmoji(file.type) }}</span>
            <div class="message-file-info">
              <span class="message-file-name">{{ file.name }}</span>
              <span class="message-file-size">{{ file.humanReadableSize }}</span>
            </div>
            <span class="message-file-download">⬇️</span>
          </button>
        </div>

        <!-- Footer: Time + Read status -->
        <div class="message-footer">
          <span class="message-time">{{ formattedTime }}</span>

          <!-- Read status (for own messages) -->
          <span v-if="isOwnMessage" class="message-status">
            <span v-if="isReadByOthers" class="message-status-icon message-status-read">✓✓</span>
            <span v-else class="message-status-icon">✓</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Avatar spacer for own messages (maintains alignment) -->
    <div v-if="isOwnMessage && showAvatar" class="message-avatar-spacer" />
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import type {MessageDto, FileSummaryDto} from '@/application/dto';
import {UserRole, FileType} from '@/domain/enumerations';

/**
 * MessageBubble component props
 */
export interface MessageBubbleProps {
  /** Message data */
  message: MessageDto;
  /** Current user ID to determine bubble position */
  currentUserId: string;
  /** Show sender info (can hide for consecutive messages from same sender) */
  showSender?: boolean;
  /** Show avatar */
  showAvatar?: boolean;
  /** Compact mode for smaller bubbles */
  compact?: boolean;
}

/**
 * MessageBubble component emits
 */
export interface MessageBubbleEmits {
  (e: 'file-click', file: FileSummaryDto): void;
}

const props = withDefaults(defineProps<MessageBubbleProps>(), {
  showSender: true,
  showAvatar: true,
  compact: false,
});

const emit = defineEmits<MessageBubbleEmits>();

// Computed
const isOwnMessage = computed(() => props.message.senderId === props.currentUserId);

const senderInitials = computed(() => {
  const name = (props.message.senderName ?? '').trim();
  if (!name) {
    return '?';
  }

  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    const firstInitial = parts[0]?.[0] ?? '';
    const secondInitial = parts[1]?.[0] ?? '';
    return (firstInitial + secondInitial).toUpperCase();
  }

  return parts[0].slice(0, 2).toUpperCase();
});

const roleLabel = computed(() => {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMINISTRATOR]: 'Admin',
    [UserRole.CLIENT]: 'Client',
    [UserRole.SPECIAL_USER]: 'Special',
  };
  return labels[props.message.senderRole] || props.message.senderRole;
});

const formattedTime = computed(() => {
  const date = new Date(props.message.sentAt);
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
});

const isReadByOthers = computed(() => {
  // Message is read if anyone besides the sender has read it
  return props.message.readByUserIds.some((id: string) => id !== props.message.senderId);
});

/**
 * Get file icon emoji based on file type
 */
function getFileIconEmoji(fileType: FileType): string {
  const icons: Record<FileType, string> = {
    [FileType.PDF]: '📄',
    [FileType.KML]: '🗺️',
    [FileType.SHP]: '🗺️',
    [FileType.DOCUMENT]: '📄',
    [FileType.IMAGE]: '🖼️',
    [FileType.SPREADSHEET]: '📊',
    [FileType.CAD]: '📐',
    [FileType.COMPRESSED]: '📦',
  };
  return icons[fileType] || '📎';
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-2);
  max-width: 85%;
  margin-bottom: var(--spacing-1);
}

.message-bubble-own {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-bubble-other {
  margin-right: auto;
}

/* Avatar */
.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar-initials {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-700);
}

.message-avatar-spacer {
  width: 32px;
  flex-shrink: 0;
}

/* Content wrapper */
.message-content-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Sender info */
.message-sender {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
  padding-left: var(--spacing-2);
}

.message-sender-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.message-sender-role {
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.message-sender-role-administrator {
  color: var(--color-primary-700);
  background-color: var(--color-primary-100);
}

.message-sender-role-client {
  color: var(--color-success-700);
  background-color: var(--color-success-100);
}

.message-sender-role-special_user {
  color: var(--color-warning-700);
  background-color: var(--color-warning-100);
}

/* Bubble content */
.message-bubble-content {
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  word-break: break-word;
}

.message-bubble-own .message-bubble-content {
  background-color: var(--color-primary-600);
  color: white;
  border-bottom-right-radius: var(--radius-sm);
}

.message-bubble-other .message-bubble-content {
  background-color: var(--color-gray-100);
  color: var(--color-text-primary);
  border-bottom-left-radius: var(--radius-sm);
}

/* Text */
.message-text {
  font-size: var(--font-size-sm);
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}

/* Files */
.message-files {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.message-file {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-fast);
}

.message-bubble-own .message-file {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.message-bubble-own .message-file:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.message-bubble-other .message-file {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.message-bubble-other .message-file:hover {
  background-color: var(--color-gray-50);
}

.message-file-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.message-file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.message-file-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-file-size {
  font-size: 10px;
  opacity: 0.8;
}

.message-file-download {
  font-size: 16px;
  opacity: 0.7;
  flex-shrink: 0;
}

/* Footer */
.message-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
}

.message-status {
  display: flex;
  align-items: center;
}

.message-status-icon {
  font-size: 12px;
  opacity: 0.7;
}

.message-status-read {
  opacity: 1;
}

.message-bubble-own .message-status-read {
  color: var(--color-success-200);
}

/* Compact mode */
.message-bubble-compact .message-bubble-content {
  padding: var(--spacing-2);
}

.message-bubble-compact .message-text {
  font-size: var(--font-size-xs);
}

.message-bubble-compact .message-avatar {
  width: 24px;
  height: 24px;
}

.message-bubble-compact .message-avatar-spacer {
  width: 24px;
}
</style>
