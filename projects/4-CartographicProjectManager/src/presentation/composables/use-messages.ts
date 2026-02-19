/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/composables/use-messages.ts
 * @desc Composable for messaging with real-time updates and unread tracking
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://vuejs.org/guide/reusability/composables.html}
 */

import {computed, type ComputedRef} from 'vue';
import {useMessageStore, useProjectStore} from '../stores';
import type {MessageDto} from '../../application/dto';
import {formatRelativeTime, formatTime} from '../../shared/utils';

/**
 * Result of send message operation
 */
export interface SendMessageResult {
  /** Whether operation was successful */
  success: boolean;
  /** Sent message if successful */
  message?: MessageDto;
  /** Error message if failed */
  error?: string;
}

/**
 * Return interface for useMessages composable
 */
export interface UseMessagesReturn {
  // Messages
  messages: ComputedRef<MessageDto[]>;

  // Unread
  unreadCount: ComputedRef<number>;
  totalUnreadCount: ComputedRef<number>;
  hasUnread: ComputedRef<boolean>;

  // Pagination
  hasMore: ComputedRef<boolean>;

  // Status
  isLoading: ComputedRef<boolean>;
  isSending: ComputedRef<boolean>;
  error: ComputedRef<string | null>;

  // Fetch Actions
  fetchMessages: (projectId: string) => Promise<void>;
  loadMessagesByProject: (projectId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  fetchUnreadCounts: () => Promise<void>;

  // Send Actions
  sendMessage: (content: string, fileIds?: string[]) => Promise<SendMessageResult>;

  // Read Actions
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  // Utilities
  getUnreadCountForProject: (projectId: string) => number;
  formatMessageTime: (date: Date | string) => string;
  clearError: () => void;
}

/**
 * Composable for message management
 *
 * Provides reactive message data for the current project,
 * send operations, unread tracking, and infinite scroll support.
 *
 * @returns Message state and methods
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMessages } from '@/presentation/composables';
 *
 * const {
 *   messages,
 *   unreadCount,
 *   sendMessage,
 *   markAsRead
 * } = useMessages();
 * </script>
 * ```
 */
export function useMessages(): UseMessagesReturn {
  const store = useMessageStore();
  const projectStore = useProjectStore();

  // Current project ID
  const currentProjectId = computed(() => projectStore.currentProjectId);

  // Computed from store
  const messages = computed(() => {
    if (!currentProjectId.value) return [];
    return store.getMessagesForProject(currentProjectId.value);
  });

  const unreadCount = computed(() => {
    if (!currentProjectId.value) return 0;
    return store.getUnreadCount(currentProjectId.value);
  });

  const totalUnreadCount = computed(() => store.totalUnreadCount);
  const hasUnread = computed(() => unreadCount.value > 0);

  const hasMore = computed(() => {
    if (!currentProjectId.value) return false;
    return store.hasMoreMessages(currentProjectId.value);
  });

  const isLoading = computed(() => store.isLoading);
  const isSending = computed(() => store.isSending);
  const error = computed(() => store.error);

  /**
   * Fetches messages for a project
   *
   * @param projectId - Project unique identifier
   */
  async function fetchMessages(projectId: string): Promise<void> {
    await store.fetchMessagesByProject(projectId);
  }

  /**
   * Loads more messages (pagination)
   */
  async function loadMore(): Promise<void> {
    if (currentProjectId.value && hasMore.value && !isLoading.value) {
      await store.fetchMessagesByProject(currentProjectId.value, true);
    }
  }

  /**
   * Refreshes messages for current project
   */
  async function refreshMessages(): Promise<void> {
    if (currentProjectId.value) {
      await store.fetchMessagesByProject(currentProjectId.value);
    }
  }

  /**
   * Fetches unread counts for all projects
   */
  async function fetchUnreadCounts(): Promise<void> {
    await store.fetchUnreadCounts();
  }

  /**
   * Sends a new message in current project
   *
   * @param content - Message text content
   * @param fileIds - Optional file attachment IDs
   * @returns Result with sent message or error
   */
  async function sendMessage(
    content: string,
    fileIds?: string[]
  ): Promise<SendMessageResult> {
    if (!currentProjectId.value) {
      return {success: false, error: 'No project selected'};
    }

    const message = await store.sendMessage(currentProjectId.value, content, fileIds);

    if (message) {
      return {success: true, message};
    }

    return {success: false, error: store.error ?? 'Failed to send message'};
  }

  /**
   * Marks a single message as read
   *
   * @param messageId - Message unique identifier
   */
  async function markAsRead(messageId: string): Promise<void> {
    if (currentProjectId.value) {
      await store.markAsRead(messageId, currentProjectId.value);
    }
  }

  /**
   * Marks all messages in current project as read
   */
  async function markAllAsRead(): Promise<void> {
    if (currentProjectId.value) {
      await store.markAllAsRead(currentProjectId.value);
    }
  }

  /**
   * Gets unread count for a specific project
   *
   * @param projectId - Project unique identifier
   * @returns Unread message count
   */
  function getUnreadCountForProject(projectId: string): number {
    return store.getUnreadCount(projectId);
  }

  /**
   * Formats message timestamp for display
   *
   * Shows time if today, otherwise relative date
   *
   * @param date - Message timestamp
   * @returns Formatted time string
   */
  function formatMessageTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return formatTime(d);
    }

    return formatRelativeTime(d);
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    store.clearError();
  }

  return {
    // Messages
    messages,

    // Unread
    unreadCount,
    totalUnreadCount,
    hasUnread,

    // Pagination
    hasMore,

    // Status
    isLoading,
    isSending,
    error,

    // Fetch Actions
    fetchMessages,
    loadMessagesByProject: fetchMessages,
    loadMore,
    refreshMessages,
    fetchUnreadCounts,

    // Send Actions
    sendMessage,

    // Read Actions
    markAsRead,
    markAllAsRead,

    // Utilities
    getUnreadCountForProject,
    formatMessageTime,
    clearError,
  };
}
