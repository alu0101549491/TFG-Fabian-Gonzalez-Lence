import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {Message} from '@domain/entities/Message';

/**
 * Message store
 * Manages message state
 */
export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>([]);
  const loading = ref(false);

  const fetchMessagesByProject = async (
      projectId: string,
  ): Promise<void> => {
    // TODO: Implement fetch messages logic
    throw new Error('Method not implemented.');
  };

  const sendMessage = async (
      messageData: unknown,
  ): Promise<void> => {
    // TODO: Implement send message logic
    throw new Error('Method not implemented.');
  };

  return {
    messages,
    loading,
    fetchMessagesByProject,
    sendMessage,
  };
});
