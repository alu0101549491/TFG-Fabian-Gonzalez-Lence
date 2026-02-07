import {useMessageStore} from '../stores/messageStore';

/**
 * Messages composable
 * Provides messaging utilities for components
 */
export function useMessages() {
  const messageStore = useMessageStore();

  const loadMessages = async (
      projectId: string,
  ): Promise<void> => {
    await messageStore.fetchMessagesByProject(projectId);
  };

  return {
    messages: messageStore.messages,
    loading: messageStore.loading,
    loadMessages,
  };
}
