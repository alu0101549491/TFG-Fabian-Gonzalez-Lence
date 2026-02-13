/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/stores/message.store.ts
 * @desc Pinia store for project message state management with real-time updates
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://pinia.vuejs.org}
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {
  MessageDto,
  MessageFilterDto,
  MessageListResponseDto,
  CreateMessageDto,
} from '../../application/dto';
import {useAuthStore} from './auth.store';
import {useProjectStore} from './project.store';

/**
 * Pagination information for message lists
 */
interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Message store using Composition API.
 * Manages messages per project with pagination and real-time updates.
 */
export const useMessageStore = defineStore('message', () => {
  const authStore = useAuthStore();
  const projectStore = useProjectStore();
  
  // State
  const messagesByProject = ref<Map<string, MessageDto[]>>(new Map());
  const unreadCounts = ref<Map<string, number>>(new Map());
  const paginationByProject = ref<Map<string, PaginationInfo>>(new Map());
  const currentProjectId = ref<string | null>(null);
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getMessagesForProject = computed(() => (projectId: string) => {
    return messagesByProject.value.get(projectId) ?? [];
  });

  const currentMessages = computed(() => {
    const projectId = projectStore.currentProjectId ?? currentProjectId.value;
    if (!projectId) return [];
    return messagesByProject.value.get(projectId) ?? [];
  });

  const getUnreadCount = computed(() => (projectId: string) => {
    return unreadCounts.value.get(projectId) ?? 0;
  });

  const unreadCount = computed(() => {
    const projectId = projectStore.currentProjectId ?? currentProjectId.value;
    if (!projectId) return 0;
    return unreadCounts.value.get(projectId) ?? 0;
  });

  const hasUnread = computed(() => unreadCount.value > 0);

  const totalUnreadCount = computed(() => {
    let total = 0;
    unreadCounts.value.forEach(count => total += count);
    return total;
  });

  const hasMoreMessages = computed(() => (projectId: string) => {
    const pagination = paginationByProject.value.get(projectId);
    return pagination?.hasMore ?? false;
  });

  const currentProjectHasMore = computed(() => {
    const projectId = projectStore.currentProjectId ?? currentProjectId.value;
    if (!projectId) return false;
    const pagination = paginationByProject.value.get(projectId);
    return pagination?.hasMore ?? false;
  });

  // Actions

  /**
   * Fetches messages for a specific project
   *
   * @param projectId - The project's unique ID
   * @param loadMore - If true, loads next page; if false, refreshes from page 1
   *
   * @example
   * ```typescript
   * // Initial load
   * await messageStore.fetchMessagesByProject('project1', false);
   * 
   * // Load more (pagination)
   * await messageStore.fetchMessagesByProject('project1', true);
   * ```
   */
  async function fetchMessagesByProject(projectId: string, loadMore = false): Promise<void> {
    if (!authStore.userId) return;

    isLoading.value = true;
    error.value = null;
    currentProjectId.value = projectId;

    try {
      const pagination = paginationByProject.value.get(projectId);
      const page = loadMore ? (pagination?.page ?? 0) + 1 : 1;

      // TODO: Replace with actual service call
      // const response = await messageService.getMessagesByProject(
      //   projectId,
      //   authStore.userId,
      //   { page, limit: 20 }
      // );
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock data
      const mockMessages: MessageDto[] = [
        {
          id: '1',
          projectId,
          senderId: 'client1',
          senderName: 'John Pérez',
          content: 'When can we schedule the site meeting?',
          sentAt: new Date('2025-02-05T10:30:00'),
          files: [],
          isRead: true,
          isSystemMessage: false,
        },
        {
          id: '2',
          projectId,
          senderId: 'admin1',
          senderName: 'Administrator',
          content: 'How about next Monday at 10 AM?',
          sentAt: new Date('2025-02-05T11:15:00'),
          files: [],
          isRead: false,
          isSystemMessage: false,
        },
      ];

      const existingMessages = loadMore 
        ? (messagesByProject.value.get(projectId) ?? [])
        : [];
      
      messagesByProject.value.set(projectId, [
        ...existingMessages,
        ...mockMessages,
      ]);
      
      paginationByProject.value.set(projectId, {
        total: mockMessages.length,
        page: page,
        limit: 20,
        hasMore: false,
      });
      
      // Update unread count
      const unread = mockMessages.filter(m => !m.isRead).length;
      unreadCounts.value.set(projectId, unread);
      
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch messages';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches unread counts for all projects
   */
  async function fetchUnreadCounts(): Promise<void> {
    if (!authStore.userId) return;

    try {
      // TODO: Replace with actual service call
      // const counts = await messageService.getUnreadCountsByUser(authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mock: Set unread counts
      // counts.forEach(item => {
      //   unreadCounts.value.set(item.projectId, item.unreadCount);
      // });
    } catch (err: any) {
      console.error('Failed to fetch unread counts:', err);
    }
  }

  /**
   * Sends a new message to a project
   *
   * @param projectId - The project's unique ID
   * @param content - Message content
   * @param fileIds - Optional array of file IDs to attach
   */
  async function sendMessage(
    projectId: string,
    content: string,
    fileIds?: string[]
  ): Promise<MessageDto | null> {
    if (!authStore.userId) return null;

    isSending.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual service call
      // const message = await messageService.sendMessage(
      //   { projectId, content, fileIds },
      //   authStore.userId
      // );
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newMessage: MessageDto = {
        id: `msg_${Date.now()}`,
        projectId,
        senderId: authStore.userId,
        senderName: authStore.username,
        content,
        sentAt: new Date(),
        files: [],
        isRead: true,
        isSystemMessage: false,
      };

      // Add to local state (newest first)
      const messages = messagesByProject.value.get(projectId) ?? [];
      messagesByProject.value.set(projectId, [newMessage, ...messages]);

      return newMessage;
    } catch (err: any) {
      error.value = err.message || 'Failed to send message';
      return null;
    } finally {
      isSending.value = false;
    }
  }

  /**
   * Marks a message as read
   */
  async function markAsRead(messageId: string, projectId?: string): Promise<void> {
    if (!authStore.userId) return;

    const pid = projectId || projectStore.currentProjectId || currentProjectId.value;
    if (!pid) return;

    try {
      // TODO: Replace with actual service call
      // await messageService.markMessageAsRead(messageId, authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const messages = messagesByProject.value.get(pid);
      if (messages) {
        const msg = messages.find(m => m.id === messageId);
        if (msg && !msg.isRead) {
          msg.isRead = true;
          
          // Decrement unread count
          const currentCount = unreadCounts.value.get(pid) ?? 0;
          unreadCounts.value.set(pid, Math.max(0, currentCount - 1));
        }
      }
    } catch (err: any) {
      console.error('Failed to mark message as read:', err);
    }
  }

  /**
   * Marks all messages in a project as read
   */
  async function markAllAsRead(projectId?: string): Promise<void> {
    if (!authStore.userId) return;

    const pid = projectId || projectStore.currentProjectId || currentProjectId.value;
    if (!pid) return;

    try {
      // TODO: Replace with actual service call
      // await messageService.markAllMessagesAsRead(pid, authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const messages = messagesByProject.value.get(pid);
      if (messages) {
        messages.forEach(m => m.isRead = true);
        unreadCounts.value.set(pid, 0);
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all messages as read';
    }
  }

  /**
   * Handles real-time new message event
   */
  function handleNewMessage(payload: any): void {
    const projectId = payload.projectId;
    const messages = messagesByProject.value.get(projectId) ?? [];
    
    // Add to beginning (newest first)
    messagesByProject.value.set(projectId, [
      payload as MessageDto,
      ...messages,
    ]);
    
    // Increment unread count if not from current user
    if (payload.senderId !== authStore.userId) {
      const currentCount = unreadCounts.value.get(projectId) ?? 0;
      unreadCounts.value.set(projectId, currentCount + 1);
    }
  }

  /**
   * Handles real-time unread count update event
   */
  function handleUnreadCountUpdate(payload: {projectId: string; count: number}): void {
    unreadCounts.value.set(payload.projectId, payload.count);
  }

  /**
   * Clears messages for a project
   */
  function clearMessagesForProject(projectId: string): void {
    messagesByProject.value.delete(projectId);
    paginationByProject.value.delete(projectId);
  }

  /**
   * Clears current project messages
   */
  function clearCurrentMessages(): void {
    currentProjectId.value = null;
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    // State
    messagesByProject,
    unreadCounts,
    paginationByProject,
    currentProjectId,
    isLoading,
    isSending,
    error,
    
    // Getters
    getMessagesForProject,
    currentMessages,
    getUnreadCount,
    unreadCount,
    hasUnread,
    totalUnreadCount,
    hasMoreMessages,
    currentProjectHasMore,
    
    // Actions
    fetchMessagesByProject,
    fetchUnreadCounts,
    sendMessage,
    markAsRead,
    markAllAsRead,
    handleNewMessage,
    handleUnreadCountUpdate,
    clearMessagesForProject,
    clearCurrentMessages,
    clearError,
  };
});
