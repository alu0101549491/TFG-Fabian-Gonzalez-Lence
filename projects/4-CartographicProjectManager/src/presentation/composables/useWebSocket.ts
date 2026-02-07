import {ref, onMounted, onUnmounted} from 'vue';
import {
  SocketManager,
} from '@infrastructure/websocket/SocketManager';

/**
 * WebSocket composable
 * Provides WebSocket utilities for components
 */
export function useWebSocket() {
  const socketManager = new SocketManager();
  const isConnected = ref(false);

  const connect = (url: string, token: string): void => {
    socketManager.connect(url, token);
    isConnected.value = true;
  };

  const disconnect = (): void => {
    socketManager.disconnect();
    isConnected.value = false;
  };

  const on = (
      event: string,
      callback: (...args: unknown[]) => void,
  ): void => {
    socketManager.on(event, callback);
  };

  const emit = (event: string, data: unknown): void => {
    socketManager.emit(event, data);
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    connect,
    disconnect,
    on,
    emit,
  };
}
