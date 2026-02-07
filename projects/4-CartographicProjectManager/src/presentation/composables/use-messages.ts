/**
 * @module presentation/composables/use-messages
 * @description Composable for messaging logic.
 * Provides reactive message state and methods to Vue components.
 * @category Presentation
 */

import {computed} from 'vue';
import {useMessageStore} from '../stores/message.store';

/**
 * Composable that wraps the message store and provides
 * messaging utilities to components.
 */
export function useMessages() {
  const messageStore = useMessageStore();

  const messages = computed(() => messageStore.messages);
  const unreadCount = computed(() => messageStore.unreadCount);
  const hasUnread = computed(() => messageStore.hasUnread);
  const isLoading = computed(() => messageStore.isLoading);

  /**
   * Loads messages for a specific project.
   * @param projectId - The project's unique ID.
   */
  async function loadMessages(projectId: string): Promise<void> {
    await messageStore.fetchMessages(projectId);
  }

  /**
   * Sends a new message.
   * @param messageData - The message data.
   */
  async function send(messageData: unknown): Promise<void> {
    await messageStore.sendMessage(messageData);
  }

  return {
    messages,
    unreadCount,
    hasUnread,
    isLoading,
    loadMessages,
    send,
  };
}
