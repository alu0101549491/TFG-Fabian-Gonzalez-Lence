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
} from '../../application/dto';
import {useAuthStore} from './auth.store';
import {useProjectStore} from './project.store';
import {MessageRepository} from '../../infrastructure/repositories/message.repository';
import type {Message} from '../../domain/entities/message';
import {isValidUserRole, UserRole} from '../../domain/enumerations/user-role';
import {socketHandler} from '../../infrastructure/websocket';

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
  const messageRepository = new MessageRepository();
  
  // State
  const messagesByProject = ref<Map<string, MessageDto[]>>(new Map());
  const unreadCounts = ref<Map<string, number>>(new Map());
  const paginationByProject = ref<Map<string, PaginationInfo>>(new Map());
  const currentProjectId = ref<string | null>(null);
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);

  /**
   * Helper function to map Message entity to MessageDto
   */
  function mapEntityToDto(message: Message): MessageDto {
    return {
      id: message.id,
      projectId: message.projectId,
      senderId: message.senderId,
      senderName: message.senderName,
      senderRole: message.senderRole,
      content: message.content,
      sentAt: message.sentAt,
      fileIds: message.fileIds,
      files: [],
      readByUserIds: message.readByUserIds,
      isRead: authStore.userId ? message.readByUserIds.includes(authStore.userId) : false,
      isSystemMessage: message.type === 'SYSTEM',
      type: message.type as any,
    };
  }

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
      // Fetch messages from backend
      const messageEntities = await messageRepository.findByProjectId(projectId);
      const messages = messageEntities.map(mapEntityToDto);

      const existingMessages = loadMore 
        ? (messagesByProject.value.get(projectId) ?? [])
        : [];
      
      messagesByProject.value.set(projectId, [
        ...existingMessages,
        ...messages,
      ]);
      
      paginationByProject.value.set(projectId, {
        total: messages.length,
        page: 1,
        limit: 20,
        hasMore: false,
      });
      
      // Update unread count
      const unread = messages.filter(m => !m.isRead).length;
      unreadCounts.value.set(projectId, unread);
      
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch messages';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches unread counts for all projects the user has access to.
   * 
   * @example
   * ```typescript
   * // Called by dashboard to populate message notification badges
   * await messageStore.fetchUnreadCounts();
   * ```
   */
  async function fetchUnreadCounts(): Promise<void> {
    if (!authStore.userId) return;

    try {
      // Get all projects user has access to
      const allProjects = projectStore.projects;
      
      if (allProjects.length === 0) {
        console.warn('[MessageStore] ⚠️ No projects found, cannot fetch unread counts');
        return;
      }
      
      // Fetch unread count for each project
      const countPromises = allProjects.map(async (project) => {
        try {
          const count = await messageRepository.countUnreadByProjectAndUser(
            project.id,
            authStore.userId!
          );
          return {projectId: project.id, count};
        } catch (err) {
          console.warn(`Failed to fetch unread count for project ${project.id}:`, err);
          return {projectId: project.id, count: 0};
        }
      });
      
      const results = await Promise.all(countPromises);
      
      // Update unreadCounts map
      results.forEach(({projectId, count}) => {
        unreadCounts.value.set(projectId, count);
      });
      
      const totalUnread = results.reduce((sum, {count}) => sum + count, 0);
      if (totalUnread > 0) {
        console.log('[MessageStore] 📨 Fetched unread counts:', totalUnread, 'total unread messages across', results.length, 'projects');
      }
    } catch (err: any) {
      console.error('[MessageStore] Failed to fetch unread counts:', err);
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
      // Create message via repository using plain data
      const savedMessage = await messageRepository.create({
        projectId,
        senderId: authStore.userId,
        content,
        fileIds: fileIds || [],
      });
      
      const newMessage = mapEntityToDto(savedMessage);

      // Don't add to local state - let WebSocket event handle it to avoid duplicates
      // The message will be added when the 'message:new' event is received
      // This ensures both sender and receiver see messages the same way
      
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
      // Note: This marks individual message - backend endpoint may need adjustment
      // For now, mark all messages in project as read
      await messageRepository.markAsReadByProjectAndUser(pid, authStore.userId);
      
      // Update local state
      const messages = messagesByProject.value.get(pid);
      if (messages) {
        const index = messages.findIndex(m => m.id === messageId);
        if (index !== -1 && !messages[index].isRead) {
          const updated = messages.map((m, i) => (i === index ? {...m, isRead: true} : m));
          messagesByProject.value.set(pid, updated);

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
      await messageRepository.markAsReadByProjectAndUser(pid, authStore.userId);
      
      // Update local state
      const messages = messagesByProject.value.get(pid);
      if (messages) {
        messagesByProject.value.set(pid, messages.map(m => ({...m, isRead: true})));
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
    
    // Check if message already exists (prevent duplicates from HTTP response + WebSocket event)
    const messageExists = messages.some(m => m.id === payload.id);
    if (messageExists) {
      return;
    }
    
    // Add to end (append newest message) to match the order from backend
    const updatedMessages = [...messages, payload as MessageDto];
    messagesByProject.value.set(projectId, updatedMessages);
    
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
   * Initialize WebSocket listeners for real-time message updates
   */
  function initializeWebSocket(): void {
    // Subscribe to new message events
    socketHandler.onMessage((payload: any) => {
      const senderRoleRaw = payload.sender?.role;
      const senderRole = isValidUserRole(senderRoleRaw) ? senderRoleRaw : UserRole.CLIENT;

      // Map the backend message (Prisma Message with sender relation) to MessageDto format
      const messageDto: MessageDto = {
        id: payload.id,
        projectId: payload.projectId,
        senderId: payload.senderId,
        senderName: payload.sender?.username || 'Unknown User',
        senderRole,
        content: payload.content,
        sentAt: new Date(payload.sentAt),
        fileIds: payload.fileIds || [],
        files: [],
        readByUserIds: payload.readByUserIds || [],
        isRead: authStore.userId ? (payload.readByUserIds || []).includes(authStore.userId) : false,
        isSystemMessage: false,
        type: 'NORMAL',
      };
      handleNewMessage(messageDto);
    });

    // Subscribe to unread count updates
    socketHandler.onUnreadCount((payload: any) => {
      handleUnreadCountUpdate(payload);
    });
  }

  // Initialize WebSocket listeners when store is created
  initializeWebSocket();

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
