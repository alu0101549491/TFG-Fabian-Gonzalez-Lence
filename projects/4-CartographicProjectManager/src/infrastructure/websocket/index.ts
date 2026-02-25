/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/websocket/index.ts
 * @desc Barrel export for WebSocket module with convenience methods
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

// Import SocketHandler class first
import {SocketHandler} from './socket.handler';

// Export enums
export { ConnectionState, ServerEvent, ClientEvent } from './socket.handler';

// Export types
export type {
  NotificationPayload,
  MessagePayload,
  TaskPayload,
  ProjectPayload,
  FilePayload,
  TaskStatusChangedPayload,
  TaskConfirmedPayload,
  UnreadCountPayload,
  EventCallback,
  Subscription,
  ConnectionOptions,
  ITokenProvider,
} from './socket.handler';

// Export class
export { SocketHandler } from './socket.handler';

/**
 * Singleton WebSocket handler instance for application-wide use
 *
 * @example
 * ```typescript
 * import { socketHandler } from '@/infrastructure/websocket';
 *
 * // Set token provider implementation
 * socketHandler.setTokenProvider(tokenProvider);
 *
 * // Connect to server
 * socketHandler.connect({
 *   token: 'jwt-token',
 *   userId: 'user-123',
 *   debug: true
 * });
 *
 * // Subscribe to events
 * socketHandler.onNotification((notification) => {
 *   console.log('New notification:', notification);
 * });
 * ```
 */
export const socketHandler = new SocketHandler();

/**
 * Convenience object providing direct access to WebSocket methods.
 * Wraps the singleton socketHandler instance for cleaner syntax.
 *
 * @example
 * ```typescript
 * import { socket } from '@/infrastructure/websocket';
 *
 * // Connect with simplified syntax
 * socket.connect({
 *   token: 'jwt-token',
 *   userId: 'user-123'
 * });
 *
 * // Subscribe to events
 * const sub = socket.onMessage((message) => {
 *   console.log('New message:', message);
 * });
 *
 * // Join project room
 * socket.joinProject('project-456');
 *
 * // Cleanup
 * sub.unsubscribe();
 * socket.disconnect();
 * ```
 */
export const socket = {
  /**
   * Connect to WebSocket server with authentication
   *
   * @param options - Connection options including token and user ID
   */
  connect: (options: ConnectionOptions) => socketHandler.connect(options),

  /**
   * Disconnect from WebSocket server
   */
  disconnect: () => socketHandler.disconnect(),

  /**
   * Check if currently connected
   *
   * @returns True if connected, false otherwise
   */
  isConnected: () => socketHandler.isConnected(),

  /**
   * Get current connection state
   *
   * @returns Current connection state
   */
  getState: () => socketHandler.getConnectionState(),

  /**
   * Join a project room for receiving project-specific events
   *
   * @param projectId - Project ID to join
   */
  joinProject: (projectId: string) => socketHandler.joinProject(projectId),

  /**
   * Leave a project room
   *
   * @param projectId - Project ID to leave
   */
  leaveProject: (projectId: string) => socketHandler.leaveProject(projectId),

  /**
   * Leave all project rooms
   */
  leaveAllProjects: () => socketHandler.leaveAllProjects(),

  /**
   * Get list of subscribed project IDs
   *
   * @returns Array of project IDs
   */
  getSubscribedProjects: () => socketHandler.getSubscribedProjects(),

  // Event subscriptions

  /**
   * Subscribe to new notification events
   *
   * @param callback - Callback function to invoke on new notification
   * @returns Subscription handle for unsubscribing
   */
  onNotification: (callback: EventCallback<NotificationPayload>) =>
    socketHandler.onNotification(callback),

  /**
   * Subscribe to notification count updates
   *
   * @param callback - Callback function invoked with unread count
   * @returns Subscription handle for unsubscribing
   */
  onNotificationCount: (callback: EventCallback<{ unreadCount: number }>) =>
    socketHandler.onNotificationCount(callback),

  /**
   * Subscribe to new message events
   *
   * @param callback - Callback function to invoke on new message
   * @returns Subscription handle for unsubscribing
   */
  onMessage: (callback: EventCallback<MessagePayload>) =>
    socketHandler.onMessage(callback),

  /**
   * Subscribe to unread message count updates per project
   *
   * @param callback - Callback function invoked with unread count
   * @returns Subscription handle for unsubscribing
   */
  onUnreadCount: (callback: EventCallback<UnreadCountPayload>) =>
    socketHandler.onUnreadCount(callback),

  /**
   * Subscribe to task created events
   *
   * @param callback - Callback function to invoke on task creation
   * @returns Subscription handle for unsubscribing
   */
  onTaskCreated: (callback: EventCallback<TaskPayload>) =>
    socketHandler.onTaskCreated(callback),

  /**
   * Subscribe to task updated events
   *
   * @param callback - Callback function to invoke on task update
   * @returns Subscription handle for unsubscribing
   */
  onTaskUpdated: (callback: EventCallback<TaskPayload>) =>
    socketHandler.onTaskUpdated(callback),

  /**
   * Subscribe to task deleted events
   *
   * @param callback - Callback function to invoke on task deletion
   * @returns Subscription handle for unsubscribing
   */
  onTaskDeleted: (
    callback: EventCallback<{ taskId: string; projectId: string }>,
  ) => socketHandler.onTaskDeleted(callback),

  /**
   * Subscribe to task status change events
   *
   * @param callback - Callback function to invoke on status change
   * @returns Subscription handle for unsubscribing
   */
  onTaskStatusChanged: (callback: EventCallback<TaskStatusChangedPayload>) =>
    socketHandler.onTaskStatusChanged(callback),

  /**
   * Subscribe to task confirmed events
   *
   * @param callback - Callback function to invoke on task confirmation
   * @returns Subscription handle for unsubscribing
   */
  onTaskConfirmed: (callback: EventCallback<TaskConfirmedPayload>) =>
    socketHandler.onTaskConfirmed(callback),

  /**
   * Subscribe to project updated events
   *
   * @param callback - Callback function to invoke on project update
   * @returns Subscription handle for unsubscribing
   */
  onProjectUpdated: (callback: EventCallback<ProjectPayload>) =>
    socketHandler.onProjectUpdated(callback),

  /**
   * Subscribe to project finalized events
   *
   * @param callback - Callback function to invoke on project finalization
   * @returns Subscription handle for unsubscribing
   */
  onProjectFinalized: (callback: EventCallback<{ projectId: string }>) =>
    socketHandler.onProjectFinalized(callback),

  /**
   * Subscribe to file uploaded events
   *
   * @param callback - Callback function to invoke on file upload
   * @returns Subscription handle for unsubscribing
   */
  onFileUploaded: (callback: EventCallback<FilePayload>) =>
    socketHandler.onFileUploaded(callback),

  /**
   * Subscribe to file deleted events
   *
   * @param callback - Callback function to invoke on file deletion
   * @returns Subscription handle for unsubscribing
   */
  onFileDeleted: (
    callback: EventCallback<{ fileId: string; projectId: string }>,
  ) => socketHandler.onFileDeleted(callback),

  /**
   * Subscribe to connection state changes
   *
   * @param callback - Callback function invoked when connection state changes
   * @returns Subscription handle for unsubscribing
   */
  onConnectionStateChange: (callback: EventCallback<ConnectionState>) =>
    socketHandler.onConnectionStateChange(callback),

  /**
   * Generic event subscription by event name
   *
   * @template T Event data type
   * @param event - Event name to listen for
   * @param callback - Callback function to invoke when event occurs
   * @returns Subscription handle for unsubscribing
   */
  on: <T>(event: ServerEvent | string, callback: EventCallback<T>) =>
    socketHandler.on(event, callback),

  // Emit methods

  /**
   * Emit typing indicator to server
   *
   * @param projectId - Project where user is typing
   */
  emitTyping: (projectId: string) => socketHandler.emitTyping(projectId),

  /**
   * Emit stop typing indicator to server
   *
   * @param projectId - Project where user stopped typing
   */
  emitStopTyping: (projectId: string) =>
    socketHandler.emitStopTyping(projectId),

  /**
   * Acknowledge message received
   *
   * @param messageId - ID of received message
   */
  acknowledgeMessage: (messageId: string) =>
    socketHandler.acknowledgeMessage(messageId),

  /**
   * Acknowledge notification received
   *
   * @param notificationId - ID of received notification
   */
  acknowledgeNotification: (notificationId: string) =>
    socketHandler.acknowledgeNotification(notificationId),
};

/**
 * Re-import types for convenience (allows importing from index instead of socket.handler)
 */
import type {
  ConnectionOptions,
  EventCallback,
  NotificationPayload,
  MessagePayload,
  TaskPayload,
  ProjectPayload,
  FilePayload,
  TaskStatusChangedPayload,
  UnreadCountPayload,
} from './socket.handler';
import type { ConnectionState, ServerEvent } from './socket.handler';
