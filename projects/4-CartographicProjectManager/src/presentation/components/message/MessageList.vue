<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/message/MessageList.vue
  @desc Scrollable message list with date separators, infinite scroll, and auto-scroll
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div class="message-list" ref="containerRef">
    <!-- Loading initial state -->
    <div v-if="loading" class="message-list-loading">
      <span class="message-list-loading-spinner">⏳</span>
      <span>Loading messages...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="messages.length === 0" class="message-list-empty">
      <span class="message-list-empty-icon">💬</span>
      <h3 class="message-list-empty-title">{{ emptyMessage }}</h3>
      <p class="message-list-empty-description">Start the conversation by sending a message.</p>
    </div>

    <!-- Messages container -->
    <div v-else ref="messagesRef" class="message-list-messages" @scroll="handleScroll">
      <!-- Load more indicator -->
      <div v-if="loadingMore" class="message-list-load-more">
        <span class="message-list-load-spinner">⏳</span>
        <span>Loading older messages...</span>
      </div>

      <!-- Load more trigger (intersection observer) -->
      <div v-if="hasMore && !loadingMore" ref="loadMoreTriggerRef" class="message-list-load-trigger" />

      <!-- Messages grouped by date -->
      <template v-for="(group, groupIndex) in groupedMessages" :key="group.date">
        <!-- Date separator -->
        <div class="message-list-date-separator">
          <span class="message-list-date">{{ formatDateSeparator(group.date) }}</span>
        </div>

        <!-- Messages in group -->
        <MessageBubble
          v-for="(message, messageIndex) in group.messages"
          :key="message.id"
          :message="message"
          :current-user-id="currentUserId"
          :show-sender="shouldShowSender(group.messages, messageIndex)"
          :show-avatar="shouldShowAvatar(group.messages, messageIndex)"
          @file-click="(file) => $emit('file-click', file)"
        />
      </template>

      <!-- Scroll anchor -->
      <div ref="scrollAnchorRef" class="message-list-anchor" />
    </div>

    <!-- New messages indicator -->
    <Transition name="slide-up">
      <button
        v-if="showNewMessagesIndicator"
        type="button"
        class="message-list-new-indicator"
        @click="scrollToBottom"
      >
        <span>⬇️</span>
        <span>New messages</span>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, nextTick, onMounted, onUnmounted} from 'vue';
import type {MessageDto, FileSummaryDto} from '@/application/dto';
import MessageBubble from './MessageBubble.vue';

/**
 * Date group interface
 */
interface DateGroup {
  date: string;
  messages: MessageDto[];
}

/**
 * MessageList component props
 */
export interface MessageListProps {
  /** Messages to display */
  messages: MessageDto[];
  /** Current user ID */
  currentUserId: string;
  /** Loading initial messages */
  loading?: boolean;
  /** Loading more messages */
  loadingMore?: boolean;
  /** Has more messages to load */
  hasMore?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Project ID for context */
  projectId?: string;
}

/**
 * MessageList component emits
 */
export interface MessageListEmits {
  (e: 'load-more'): void;
  (e: 'message-read', messageId: string): void;
  (e: 'file-click', file: FileSummaryDto): void;
  (e: 'scroll-to-bottom'): void;
}

const props = withDefaults(defineProps<MessageListProps>(), {
  loading: false,
  loadingMore: false,
  hasMore: false,
  emptyMessage: 'No messages yet',
});

const emit = defineEmits<MessageListEmits>();

// Refs
const containerRef = ref<HTMLElement | null>(null);
const messagesRef = ref<HTMLElement | null>(null);
const scrollAnchorRef = ref<HTMLElement | null>(null);
const loadMoreTriggerRef = ref<HTMLElement | null>(null);

// State
const isAtBottom = ref(true);
const showNewMessagesIndicator = ref(false);
const lastMessageCount = ref(0);

// Intersection observer for load more
let loadMoreObserver: IntersectionObserver | null = null;

onMounted(() => {
  // Setup intersection observer for infinite scroll
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && props.hasMore && !props.loadingMore) {
        emit('load-more');
      }
    },
    {
      root: messagesRef.value,
      threshold: 0.1,
    },
  );

  if (loadMoreTriggerRef.value) {
    loadMoreObserver.observe(loadMoreTriggerRef.value);
  }

  // Scroll to bottom on mount
  nextTick(() => scrollToBottom(false));
});

onUnmounted(() => {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect();
  }
});

// Watch for load more trigger
watch(loadMoreTriggerRef, (newRef) => {
  if (loadMoreObserver && newRef) {
    loadMoreObserver.observe(newRef);
  }
});

// Group messages by date
const groupedMessages = computed<DateGroup[]>(() => {
  const groups: DateGroup[] = [];
  let currentDate = '';

  for (const message of props.messages) {
    const messageDate = new Date(message.sentAt).toISOString().split('T')[0];

    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groups.push({
        date: messageDate,
        messages: [message],
      });
    } else {
      groups[groups.length - 1].messages.push(message);
    }
  }

  return groups;
});

// Watch for new messages
watch(
  () => props.messages.length,
  (newCount, oldCount) => {
    if (newCount > oldCount) {
      // New message added
      if (isAtBottom.value) {
        // Auto-scroll to bottom
        nextTick(() => scrollToBottom());
      } else {
        // Show new messages indicator
        showNewMessagesIndicator.value = true;
      }
    }
    lastMessageCount.value = newCount;
  },
);

/**
 * Format date for separator
 */
function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Simple date formatting
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) {
    return 'Today';
  }
  if (dateStr === yesterdayStr) {
    return 'Yesterday';
  }

  // Check if same year
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'});
  }

  return date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
}

/**
 * Determine if sender info should be shown
 */
function shouldShowSender(messages: MessageDto[], index: number): boolean {
  if (index === 0) return true;

  const currentMessage = messages[index];
  const previousMessage = messages[index - 1];

  // Show sender if different from previous
  if (currentMessage.senderId !== previousMessage.senderId) return true;

  // Show sender if more than 5 minutes apart
  const timeDiff = new Date(currentMessage.sentAt).getTime() - new Date(previousMessage.sentAt).getTime();
  return timeDiff > 5 * 60 * 1000;
}

/**
 * Determine if avatar should be shown
 */
function shouldShowAvatar(messages: MessageDto[], index: number): boolean {
  // Show avatar for last message from this sender in a consecutive group
  if (index === messages.length - 1) return true;

  const currentMessage = messages[index];
  const nextMessage = messages[index + 1];

  return currentMessage.senderId !== nextMessage.senderId;
}

/**
 * Handle scroll
 */
function handleScroll(event: Event): void {
  const target = event.target as HTMLElement;
  const {scrollTop, scrollHeight, clientHeight} = target;

  // Check if at bottom (with 50px threshold)
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 50;

  if (isAtBottom.value) {
    showNewMessagesIndicator.value = false;
  }
}

/**
 * Scroll to bottom
 */
function scrollToBottom(smooth = true): void {
  if (!scrollAnchorRef.value) return;

  scrollAnchorRef.value.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'end',
  });

  isAtBottom.value = true;
  showNewMessagesIndicator.value = false;
  emit('scroll-to-bottom');
}

// Expose methods
defineExpose({
  scrollToBottom,
});
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: var(--color-bg-secondary);
}

/* Loading state */
.message-list-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  height: 100%;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.message-list-loading-spinner {
  font-size: 32px;
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

/* Empty state */
.message-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-8);
  text-align: center;
}

.message-list-empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-4);
}

.message-list-empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
}

.message-list-empty-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Messages container */
.message-list-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
}

/* Load more */
.message-list-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.message-list-load-spinner {
  font-size: 16px;
  animation: spin 1s linear infinite;
}

.message-list-load-trigger {
  height: 1px;
  margin-bottom: var(--spacing-4);
}

/* Date separator */
.message-list-date-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacing-4) 0;
}

.message-list-date {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  padding: var(--spacing-1) var(--spacing-3);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

/* Scroll anchor */
.message-list-anchor {
  height: 0;
  flex-shrink: 0;
}

/* New messages indicator */
.message-list-new-indicator {
  position: absolute;
  bottom: var(--spacing-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: white;
  background-color: var(--color-primary-600);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
  z-index: 10;
}

.message-list-new-indicator:hover {
  background-color: var(--color-primary-700);
}

.message-list-new-indicator:active {
  transform: translateX(-50%) scale(0.95);
}

/* Slide up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Scrollbar styling */
.message-list-messages::-webkit-scrollbar {
  width: 6px;
}

.message-list-messages::-webkit-scrollbar-track {
  background: transparent;
}

.message-list-messages::-webkit-scrollbar-thumb {
  background-color: var(--color-gray-300);
  border-radius: var(--radius-full);
}

.message-list-messages::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-gray-400);
}
</style>
