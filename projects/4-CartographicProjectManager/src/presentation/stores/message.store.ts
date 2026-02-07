/**
 * @module presentation/stores/message-store
 * @description Pinia store for message state management.
 * Manages project-scoped messages and real-time updates.
 * @category Presentation
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {MessageData} from '../../application/dto/message-data.dto';

/**
 * Message store.
 * Manages messaging state with real-time WebSocket updates.
 */
export const useMessageStore = defineStore('message', () => {
  // State
  const messagesByProject = ref<Record<string, MessageData[]>>({});
  const currentProjectId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const currentMessages = computed(() => {
    if (!currentProjectId.value) return [];
    return messagesByProject.value[currentProjectId.value] || [];
  });

  const unreadCount = computed(() => {
    if (!currentProjectId.value) return 0;
    const messages = messagesByProject.value[currentProjectId.value] || [];
    return messages.filter(m => !m.isRead).length;
  });

  const hasUnread = computed(() => unreadCount.value > 0);

  const totalUnreadCount = computed(() => {
    return Object.values(messagesByProject.value)
      .flat()
      .filter(m => !m.isRead).length;
  });

  // Actions

  /**
   * Fetches messages for a specific project.
   * @param projectId - The project's unique ID.
   */
  async function fetchMessages(projectId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    currentProjectId.value = projectId;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock data
      messagesByProject.value[projectId] = [
        {
          id: '1',
          projectId,
          senderId: 'client1',
          senderName: 'John Pérez',
          content: 'When can we schedule the site meeting?',
          timestamp: new Date('2025-02-05T10:30:00'),
          isRead: true,
          attachments: [],
        } as any,
        {
          id: '2',
          projectId,
          senderId: 'admin1',
          senderName: 'Administrator',
          content: 'How about next Monday at 10 AM?',
          timestamp: new Date('2025-02-05T11:15:00'),
          isRead: false,
          attachments: [],
        } as any,
      ];
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch messages';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Sends a new message.
   * @param messageData - Data for the new message.
   */
  async function sendMessage(messageData: Partial<MessageData>): Promise<string> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const projectId = messageData.projectId || currentProjectId.value;
      if (!projectId) throw new Error('No project ID provided');

      const newMessage: MessageData = {
        id: `msg_${Date.now()}`,
        projectId,
        senderId: messageData.senderId || '',
        senderName: messageData.senderName || '',
        content: messageData.content || '',
        timestamp: new Date(),
        isRead: false,
        attachments: messageData.attachments || [],
      } as any;

      if (!messagesByProject.value[projectId]) {
        messagesByProject.value[projectId] = [];
      }
      messagesByProject.value[projectId].push(newMessage);

      return newMessage.id;
    } catch (err: any) {
      error.value = err.message || 'Failed to send message';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Marks a message as read.
   * @param messageId - The message's unique ID.
   */
  async function markAsRead(messageId: string, projectId?: string): Promise<void> {
    const pid = projectId || currentProjectId.value;
    if (!pid) return;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const messages = messagesByProject.value[pid];
      if (messages) {
        const msg = messages.find(m => m.id === messageId);
        if (msg) {
          msg.isRead = true;
        }
      }
    } catch (err: any) {
      console.error('Failed to mark message as read:', err);
    }
  }

  /**
   * Marks all messages in a project as read.
   */
  async function markAllAsRead(projectId?: string): Promise<void> {
    const pid = projectId || currentProjectId.value;
    if (!pid) return;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const messages = messagesByProject.value[pid];
      if (messages) {
        messages.forEach(m => m.isRead = true);
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all messages as read';
    }
  }

  /**
   * Adds a message received via WebSocket to the local state.
   * @param message - The received message.
   */
  function addRealTimeMessage(message: MessageData): void {
    const projectId = message.projectId;
    if (!messagesByProject.value[projectId]) {
      messagesByProject.value[projectId] = [];
    }
    messagesByProject.value[projectId].push(message);
  }

  /**
   * Clear messages when leaving project.
   */
  function clearCurrentMessages(): void {
    currentProjectId.value = null;
  }

  return {
    // State
    messagesByProject,
    currentProjectId,
    isLoading,
    error,
    // Getters
    currentMessages,
    unreadCount,
    hasUnread,
    totalUnreadCount,
    // Actions
    fetchMessages,
    sendMessage,
    markAsRead,
    markAllAsRead,
    addRealTimeMessage,
    clearCurrentMessages,
  };
});
