/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/stores/index.ts
 * @desc Barrel export for all Pinia stores with initialization utilities
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://pinia.vuejs.org}
 */

// Import all stores for use in this file
import {useAuthStore} from './auth.store';
import {useProjectStore} from './project.store';
import {useTaskStore} from './task.store';
import {useMessageStore} from './message.store';
import {useNotificationStore} from './notification.store';

// Export all stores
export {useAuthStore} from './auth.store';
export {useProjectStore} from './project.store';
export {useTaskStore} from './task.store';
export {useMessageStore} from './message.store';
export {useNotificationStore} from './notification.store';

/**
 * Initializes all stores and returns them
 *
 * @returns Object containing all store instances
 *
 * @example
 * ```typescript
 * import { initializeStores } from '@/presentation/stores';
 * 
 * const stores = initializeStores();
 * await stores.authStore.initialize();
 * ```
 */
export function initializeStores() {
  const authStore = useAuthStore();
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();
  const messageStore = useMessageStore();
  const notificationStore = useNotificationStore();
  
  return {
    authStore,
    projectStore,
    taskStore,
    messageStore,
    notificationStore,
  };
}

/**
 * Sets up WebSocket event listeners for all stores
 *
 * NOTE: This requires a WebSocket connection manager to be implemented.
 * The connection manager should expose event handlers that can be used here.
 *
 * @example
 * ```typescript
 * import { setupStoreWebSocketListeners } from '@/presentation/stores';
 * import { wsConnectionManager } from '@/infrastructure/websocket';
 * 
 * // After WebSocket connection established
 * setupStoreWebSocketListeners(wsConnectionManager);
 * ```
 */
export function setupStoreWebSocketListeners(socketHandler?: any) {
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();
  const messageStore = useMessageStore();
  const notificationStore = useNotificationStore();
  
  // TODO: Replace with actual WebSocket connection manager when implemented
  if (!socketHandler) {
    console.warn('WebSocket handler not provided. Real-time updates disabled.');
    return;
  }
  
  // Project events
  socketHandler.on?.('project:updated', (payload: any) => {
    projectStore.handleProjectUpdated(payload);
  });
  
  socketHandler.on?.('project:finalized', (payload: any) => {
    projectStore.handleProjectFinalized(payload);
  });
  
  // Task events
  socketHandler.on?.('task:created', (payload: any) => {
    taskStore.handleTaskCreated(payload);
  });
  
  socketHandler.on?.('task:updated', (payload: any) => {
    taskStore.handleTaskUpdated(payload);
  });
  
  socketHandler.on?.('task:deleted', (payload: any) => {
    taskStore.handleTaskDeleted(payload);
  });
  
  socketHandler.on?.('task:status-changed', (payload: any) => {
    taskStore.handleTaskStatusChanged(payload);
  });
  
  // Message events
  socketHandler.on?.('message:new', (payload: any) => {
    messageStore.handleNewMessage(payload);
  });
  
  socketHandler.on?.('messages:unread-count', (payload: any) => {
    messageStore.handleUnreadCountUpdate(payload);
  });
  
  // Notification events
  socketHandler.on?.('notification:new', (payload: any) => {
    notificationStore.handleNewNotification(payload);
  });
  
  socketHandler.on?.('notification:count', (payload: any) => {
    notificationStore.handleUnreadCountUpdate(payload);
  });
}

/**
 * Resets all stores to initial state (e.g., on logout)
 *
 * This clears all cached data and resets pagination, filters, etc.
 *
 * @example
 * ```typescript
 * import { resetAllStores } from '@/presentation/stores';
 * 
 * // On logout
 * await authStore.logout();
 * resetAllStores();
 * ```
 */
export function resetAllStores(): void {
  const authStore = useAuthStore();
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();
  const messageStore = useMessageStore();
  const notificationStore = useNotificationStore();
  
  // Clear auth last as other stores may need user info
  projectStore.clearCurrentProject();
  projectStore.projects = [];
  projectStore.calendarProjects = [];
  projectStore.resetFilters();
  
  taskStore.clearTasks();
  taskStore.resetFilters();
  
  messageStore.clearCurrentMessages();
  messageStore.messagesByProject.clear();
  messageStore.unreadCounts.clear();
  
  notificationStore.reset();
  
  // Clear auth state and storage
  authStore.clearAuth();
}

/**
 * Initializes app-level stores on application start
 *
 * This should be called in main.ts after creating the Pinia instance.
 *
 * @returns Promise that resolves when initialization is complete
 *
 * @example
 * ```typescript
 * import { initializeAppStores } from '@/presentation/stores';
 * 
 * // In main.ts
 * const app = createApp(App);
 * app.use(pinia);
 * 
 * await initializeAppStores();
 * app.mount('#app');
 * ```
 */
export async function initializeAppStores(): Promise<void> {
  const authStore = useAuthStore();
  
  try {
    // Initialize auth store (loads from storage, validates session)
    await authStore.initialize();
    
    // If authenticated, fetch initial data
    if (authStore.isAuthenticated) {
      const notificationStore = useNotificationStore();
      const messageStore = useMessageStore();
      
      // Fetch unread counts in background
      Promise.all([
        notificationStore.fetchUnreadCount(),
        messageStore.fetchUnreadCounts(),
      ]).catch(err => {
        console.warn('Failed to fetch unread counts:', err);
      });
      
      // Request notification permission if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        notificationStore.requestNotificationPermission().catch(() => {
          // User denied permission - silent fail
        });
      }
    }
  } catch (err) {
    console.error('Failed to initialize app stores:', err);
  }
}
