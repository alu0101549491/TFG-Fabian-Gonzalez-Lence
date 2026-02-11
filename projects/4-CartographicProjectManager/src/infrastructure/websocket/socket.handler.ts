/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/websocket/socket.handler.ts
 * @desc WebSocket handler using Socket.IO for real-time bidirectional communication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://socket.io/docs/v4/client-api/}
 */

import { io, Socket } from 'socket.io-client';
import {
  NotificationType,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  FileType,
} from '../../domain/enumerations';

/**
 * WebSocket server URL from environment variables
 */
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * Maximum number of reconnection attempts
 */
const RECONNECTION_ATTEMPTS = 10;

/**
 * Initial delay between reconnection attempts (ms)
 */
const RECONNECTION_DELAY = 1000;

/**
 * Maximum delay between reconnection attempts (ms)
 */
const RECONNECTION_DELAY_MAX = 30000;

/**
 * Ping interval for connection health check (ms)
 */
const PING_INTERVAL = 25000;

/**
 * Ping timeout before considering connection dead (ms)
 */
const PING_TIMEOUT = 20000;

/**
 * WebSocket connection state enumeration
 */
export enum ConnectionState {
  /** Not connected to server */
  DISCONNECTED = 'DISCONNECTED',
  /** Attempting to establish connection */
  CONNECTING = 'CONNECTING',
  /** Successfully connected */
  CONNECTED = 'CONNECTED',
  /** Attempting to reconnect after disconnection */
  RECONNECTING = 'RECONNECTING',
  /** Connection error occurred */
  ERROR = 'ERROR',
}

/**
 * Server-to-Client event names
 */
export enum ServerEvent {
  // Notification events
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_COUNT = 'notification:count',

  // Message events
  MESSAGE_NEW = 'message:new',
  MESSAGE_READ = 'message:read',
  MESSAGES_UNREAD_COUNT = 'messages:unread-count',

  // Task events
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  TASK_STATUS_CHANGED = 'task:status-changed',
  TASK_CONFIRMED = 'task:confirmed',

  // Project events
  PROJECT_CREATED = 'project:created',
  PROJECT_UPDATED = 'project:updated',
  PROJECT_FINALIZED = 'project:finalized',
  PROJECT_PARTICIPANT_ADDED = 'project:participant-added',
  PROJECT_PARTICIPANT_REMOVED = 'project:participant-removed',

  // File events
  FILE_UPLOADED = 'file:uploaded',
  FILE_DELETED = 'file:deleted',

  // System events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  ERROR = 'error',
}

/**
 * Client-to-Server event names
 */
export enum ClientEvent {
  JOIN_PROJECT = 'join:project',
  LEAVE_PROJECT = 'leave:project',
  JOIN_USER = 'join:user',
  PRESENCE_ONLINE = 'presence:online',
  PRESENCE_TYPING = 'presence:typing',
  PRESENCE_STOP_TYPING = 'presence:stop-typing',
  MESSAGE_RECEIVED = 'message:received',
  NOTIFICATION_RECEIVED = 'notification:received',
}

/**
 * Notification event payload
 */
export interface NotificationPayload {
  /** Notification unique identifier */
  id: string;
  /** User who receives the notification */
  userId: string;
  /** Type of notification */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification message content */
  message: string;
  /** Related entity ID (project, task, etc.) */
  relatedEntityId: string | null;
  /** Creation timestamp */
  createdAt: string;
  /** Read status flag */
  isRead: boolean;
}

/**
 * Message event payload
 */
export interface MessagePayload {
  /** Message unique identifier */
  id: string;
  /** Project the message belongs to */
  projectId: string;
  /** User who sent the message */
  senderId: string;
  /** Sender's display name */
  senderName: string;
  /** Message text content */
  content: string;
  /** Message send timestamp */
  sentAt: string;
  /** Attached file IDs */
  fileIds: string[];
  /** System message flag */
  isSystemMessage: boolean;
}

/**
 * Task event payload
 */
export interface TaskPayload {
  /** Task unique identifier */
  id: string;
  /** Project the task belongs to */
  projectId: string;
  /** Task description */
  description: string;
  /** User who created the task */
  creatorId: string;
  /** User assigned to the task */
  assigneeId: string;
  /** Current task status */
  status: TaskStatus;
  /** Task priority level */
  priority: TaskPriority;
  /** Task due date */
  dueDate: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Project event payload
 */
export interface ProjectPayload {
  /** Project unique identifier */
  id: string;
  /** Project code */
  code: string;
  /** Project name */
  name: string;
  /** Current project status */
  status: ProjectStatus;
  /** Client assigned to project */
  clientId: string;
  /** Project delivery date */
  deliveryDate: string;
}

/**
 * File event payload
 */
export interface FilePayload {
  /** File unique identifier */
  id: string;
  /** File name */
  name: string;
  /** Project the file belongs to */
  projectId: string;
  /** File type */
  type: FileType;
  /** User who uploaded the file */
  uploadedBy: string;
  /** Upload timestamp */
  uploadedAt: string;
}

/**
 * Task status change event payload
 */
export interface TaskStatusChangedPayload {
  /** Task unique identifier */
  taskId: string;
  /** Project the task belongs to */
  projectId: string;
  /** Previous task status */
  previousStatus: TaskStatus;
  /** New task status */
  newStatus: TaskStatus;
  /** User who changed the status */
  changedBy: string;
}

/**
 * Task confirmation event payload
 */
export interface TaskConfirmedPayload {
  /** Task unique identifier */
  taskId: string;
  /** Project the task belongs to */
  projectId: string;
  /** User who confirmed the task */
  confirmedBy: string;
  /** Confirmation timestamp */
  confirmedAt: string;
}

/**
 * Unread message count payload
 */
export interface UnreadCountPayload {
  /** Project identifier */
  projectId: string;
  /** Number of unread messages */
  count: number;
}

/**
 * Event callback function type
 *
 * @template T Event data type
 */
export type EventCallback<T = unknown> = (data: T) => void;

/**
 * Subscription handle for unsubscribing from events
 */
export interface Subscription {
  /** Unsubscribe from the event */
  unsubscribe: () => void;
}

/**
 * WebSocket connection options
 */
export interface ConnectionOptions {
  /** JWT authentication token */
  token: string;
  /** User ID for joining user-specific channel */
  userId: string;
  /** Whether to connect automatically (default: true) */
  autoConnect?: boolean;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Token provider interface for dynamic token retrieval
 */
export interface ITokenProvider {
  /**
   * Get the current access token
   * @returns Access token or null if not available
   */
  getAccessToken(): string | null;
}

/**
 * WebSocket handler for real-time bidirectional communication.
 * Manages Socket.IO connection, event subscriptions, room management, and reconnection logic.
 *
 * @example
 * ```typescript
 * const handler = new SocketHandler();
 *
 * // Connect with authentication
 * handler.connect({
 *   token: 'jwt-token',
 *   userId: 'user-123',
 *   debug: true
 * });
 *
 * // Subscribe to events
 * const subscription = handler.onNotification((notification) => {
 *   console.log('New notification:', notification);
 * });
 *
 * // Join project room
 * handler.joinProject('project-456');
 *
 * // Cleanup
 * subscription.unsubscribe();
 * handler.disconnect();
 * ```
 */
export class SocketHandler {
  /** Socket.IO client instance */
  private socket: Socket | null = null;

  /** Token provider for authentication */
  private tokenProvider: ITokenProvider | null = null;

  /** Current user ID */
  private userId: string | null = null;

  /** Current connection state */
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;

  /** Set of subscribed project IDs */
  private subscribedProjects: Set<string> = new Set();

  /** Map of event listeners by event name */
  private eventListeners: Map<string, Set<EventCallback>> = new Map();

  /** Current reconnection attempt count */
  private reconnectAttempts = 0;

  /** Debug mode flag */
  private debug = false;

  /**
   * Set the token provider for authentication
   *
   * @param provider - Token provider implementation
   */
  public setTokenProvider(provider: ITokenProvider): void {
    this.tokenProvider = provider;
  }

  /**
   * Initialize and connect to WebSocket server
   *
   * @param options - Connection options including token and user ID
   *
   * @example
   * ```typescript
   * handler.connect({
   *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   *   userId: 'user-123',
   *   autoConnect: true,
   *   debug: process.env.NODE_ENV === 'development'
   * });
   * ```
   */
  public connect(options: ConnectionOptions): void {
    if (this.socket?.connected) {
      this.log('Already connected');
      return;
    }

    this.userId = options.userId;
    this.debug = options.debug ?? false;

    // Get token from options or provider
    const token = options.token || this.tokenProvider?.getAccessToken();
    if (!token) {
      this.log('No token available for connection');
      this.setConnectionState(ConnectionState.ERROR);
      return;
    }

    this.setConnectionState(ConnectionState.CONNECTING);

    // Create socket with configuration
    this.socket = this.createSocket(token);
    this.setupSocketListeners();

    // Connect if autoConnect is not explicitly false
    if (options.autoConnect !== false) {
      this.socket.connect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.leaveAllProjects();
      this.socket.disconnect();
      this.socket = null;
      this.setConnectionState(ConnectionState.DISCONNECTED);
      this.log('Disconnected');
    }
  }

  /**
   * Get current connection state
   *
   * @returns Current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if currently connected to server
   *
   * @returns True if connected, false otherwise
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Subscribe to a project's real-time updates
   *
   * @param projectId - Project ID to join
   *
   * @example
   * ```typescript
   * handler.joinProject('project-123');
   * // Now will receive all events related to project-123
   * ```
   */
  public joinProject(projectId: string): void {
    if (!this.socket?.connected) {
      this.log(`Cannot join project ${projectId}: not connected`);
      // Queue for later when connected
      this.subscribedProjects.add(projectId);
      return;
    }

    if (this.subscribedProjects.has(projectId)) {
      this.log(`Already subscribed to project ${projectId}`);
      return;
    }

    this.socket.emit(ClientEvent.JOIN_PROJECT, { projectId });
    this.subscribedProjects.add(projectId);
    this.log(`Joined project room: ${projectId}`);
  }

  /**
   * Unsubscribe from a project's real-time updates
   *
   * @param projectId - Project ID to leave
   */
  public leaveProject(projectId: string): void {
    if (!this.socket?.connected) {
      this.subscribedProjects.delete(projectId);
      return;
    }

    if (!this.subscribedProjects.has(projectId)) {
      return;
    }

    this.socket.emit(ClientEvent.LEAVE_PROJECT, { projectId });
    this.subscribedProjects.delete(projectId);
    this.log(`Left project room: ${projectId}`);
  }

  /**
   * Leave all subscribed projects (e.g., on logout)
   */
  public leaveAllProjects(): void {
    const projects = Array.from(this.subscribedProjects);
    projects.forEach((projectId) => this.leaveProject(projectId));
    this.subscribedProjects.clear();
  }

  /**
   * Get list of currently subscribed project IDs
   *
   * @returns Array of project IDs
   */
  public getSubscribedProjects(): string[] {
    return Array.from(this.subscribedProjects);
  }

  /**
   * Subscribe to new notification events
   *
   * @param callback - Callback function to invoke on new notification
   * @returns Subscription handle for unsubscribing
   */
  public onNotification(
    callback: EventCallback<NotificationPayload>,
  ): Subscription {
    return this.addEventListener(ServerEvent.NOTIFICATION_NEW, callback);
  }

  /**
   * Subscribe to notification count updates
   *
   * @param callback - Callback function invoked with unread count
   * @returns Subscription handle for unsubscribing
   */
  public onNotificationCount(
    callback: EventCallback<{ unreadCount: number }>,
  ): Subscription {
    return this.addEventListener(ServerEvent.NOTIFICATION_COUNT, callback);
  }

  /**
   * Subscribe to new message events
   *
   * @param callback - Callback function to invoke on new message
   * @returns Subscription handle for unsubscribing
   */
  public onMessage(callback: EventCallback<MessagePayload>): Subscription {
    return this.addEventListener(ServerEvent.MESSAGE_NEW, callback);
  }

  /**
   * Subscribe to unread message count updates
   *
   * @param callback - Callback function invoked with unread count per project
   * @returns Subscription handle for unsubscribing
   */
  public onUnreadCount(
    callback: EventCallback<UnreadCountPayload>,
  ): Subscription {
    return this.addEventListener(ServerEvent.MESSAGES_UNREAD_COUNT, callback);
  }

  /**
   * Subscribe to task created events
   *
   * @param callback - Callback function to invoke on task creation
   * @returns Subscription handle for unsubscribing
   */
  public onTaskCreated(callback: EventCallback<TaskPayload>): Subscription {
    return this.addEventListener(ServerEvent.TASK_CREATED, callback);
  }

  /**
   * Subscribe to task updated events
   *
   * @param callback - Callback function to invoke on task update
   * @returns Subscription handle for unsubscribing
   */
  public onTaskUpdated(callback: EventCallback<TaskPayload>): Subscription {
    return this.addEventListener(ServerEvent.TASK_UPDATED, callback);
  }

  /**
   * Subscribe to task deleted events
   *
   * @param callback - Callback function to invoke on task deletion
   * @returns Subscription handle for unsubscribing
   */
  public onTaskDeleted(
    callback: EventCallback<{ taskId: string; projectId: string }>,
  ): Subscription {
    return this.addEventListener(ServerEvent.TASK_DELETED, callback);
  }

  /**
   * Subscribe to task status change events
   *
   * @param callback - Callback function to invoke on task status change
   * @returns Subscription handle for unsubscribing
   */
  public onTaskStatusChanged(
    callback: EventCallback<TaskStatusChangedPayload>,
  ): Subscription {
    return this.addEventListener(ServerEvent.TASK_STATUS_CHANGED, callback);
  }

  /**
   * Subscribe to task confirmed events
   *
   * @param callback - Callback function to invoke on task confirmation
   * @returns Subscription handle for unsubscribing
   */
  public onTaskConfirmed(
    callback: EventCallback<TaskConfirmedPayload>,
  ): Subscription {
    return this.addEventListener(ServerEvent.TASK_CONFIRMED, callback);
  }

  /**
   * Subscribe to project updated events
   *
   * @param callback - Callback function to invoke on project update
   * @returns Subscription handle for unsubscribing
   */
  public onProjectUpdated(
    callback: EventCallback<ProjectPayload>,
  ): Subscription {
    return this.addEventListener(ServerEvent.PROJECT_UPDATED, callback);
  }

  /**
   * Subscribe to project finalized events
   *
   * @param callback - Callback function to invoke on project finalization
   * @returns Subscription handle for unsubscribing
   */
  public onProjectFinalized(
    callback: EventCallback<{ projectId: string }>,
  ): Subscription {
    return this.addEventListener(ServerEvent.PROJECT_FINALIZED, callback);
  }

  /**
   * Subscribe to file uploaded events
   *
   * @param callback - Callback function to invoke on file upload
   * @returns Subscription handle for unsubscribing
   */
  public onFileUploaded(callback: EventCallback<FilePayload>): Subscription {
    return this.addEventListener(ServerEvent.FILE_UPLOADED, callback);
  }

  /**
   * Subscribe to file deleted events
   *
   * @param callback - Callback function to invoke on file deletion
   * @returns Subscription handle for unsubscribing
   */
  public onFileDeleted(
    callback: EventCallback<{ fileId: string; projectId: string }>,
  ): Subscription {
    return this.addEventListener(ServerEvent.FILE_DELETED, callback);
  }

  /**
   * Subscribe to connection state changes
   *
   * @param callback - Callback function invoked when connection state changes
   * @returns Subscription handle for unsubscribing
   */
  public onConnectionStateChange(
    callback: EventCallback<ConnectionState>,
  ): Subscription {
    return this.addEventListener('connectionStateChange', callback);
  }

  /**
   * Subscribe to any event by name (generic subscription)
   *
   * @template T Event data type
   * @param event - Event name to listen for
   * @param callback - Callback function to invoke when event occurs
   * @returns Subscription handle for unsubscribing
   */
  public on<T>(event: ServerEvent | string, callback: EventCallback<T>): Subscription {
    return this.addEventListener(event, callback);
  }

  /**
   * Remove all listeners for a specific event
   *
   * @param event - Event name to remove listeners from
   */
  public off(event: ServerEvent | string): void {
    this.eventListeners.delete(event);
  }

  /**
   * Remove all event listeners
   */
  public removeAllListeners(): void {
    this.eventListeners.clear();
  }

  /**
   * Emit typing indicator to server
   *
   * @param projectId - Project where user is typing
   */
  public emitTyping(projectId: string): void {
    if (!this.socket?.connected || !this.userId) return;
    this.socket.emit(ClientEvent.PRESENCE_TYPING, {
      projectId,
      userId: this.userId,
    });
  }

  /**
   * Emit stop typing indicator to server
   *
   * @param projectId - Project where user stopped typing
   */
  public emitStopTyping(projectId: string): void {
    if (!this.socket?.connected || !this.userId) return;
    this.socket.emit(ClientEvent.PRESENCE_STOP_TYPING, {
      projectId,
      userId: this.userId,
    });
  }

  /**
   * Acknowledge message received
   *
   * @param messageId - ID of received message
   */
  public acknowledgeMessage(messageId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(ClientEvent.MESSAGE_RECEIVED, { messageId });
  }

  /**
   * Acknowledge notification received
   *
   * @param notificationId - ID of received notification
   */
  public acknowledgeNotification(notificationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(ClientEvent.NOTIFICATION_RECEIVED, { notificationId });
  }

  /**
   * Create Socket.IO connection with authentication and configuration
   *
   * @param token - JWT authentication token
   * @returns Configured Socket.IO client instance
   */
  private createSocket(token: string): Socket {
    return io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
      reconnection: true,
      reconnectionAttempts: RECONNECTION_ATTEMPTS,
      reconnectionDelay: RECONNECTION_DELAY,
      reconnectionDelayMax: RECONNECTION_DELAY_MAX,
      timeout: 20000,
      autoConnect: false, // Manual connection control
      pingInterval: PING_INTERVAL,
      pingTimeout: PING_TIMEOUT,
    });
  }

  /**
   * Setup Socket.IO event listeners for connection and business events
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => this.handleConnect());
    this.socket.on('disconnect', (reason) => this.handleDisconnect(reason));
    this.socket.on('connect_error', (error) => this.handleConnectError(error));

    // Reconnection events
    this.socket.io.on('reconnect_attempt', (attempt) =>
      this.handleReconnectAttempt(attempt),
    );
    this.socket.io.on('reconnect', () => this.handleReconnect());
    this.socket.io.on('reconnect_failed', () => this.handleReconnectFailed());

    // Business events - forward to internal listeners
    this.socket.on(ServerEvent.NOTIFICATION_NEW, (data) => {
      this.emitToListeners(ServerEvent.NOTIFICATION_NEW, data);
    });

    this.socket.on(ServerEvent.NOTIFICATION_COUNT, (data) => {
      this.emitToListeners(ServerEvent.NOTIFICATION_COUNT, data);
    });

    this.socket.on(ServerEvent.MESSAGE_NEW, (data) => {
      this.emitToListeners(ServerEvent.MESSAGE_NEW, data);
    });

    this.socket.on(ServerEvent.MESSAGES_UNREAD_COUNT, (data) => {
      this.emitToListeners(ServerEvent.MESSAGES_UNREAD_COUNT, data);
    });

    this.socket.on(ServerEvent.TASK_CREATED, (data) => {
      this.emitToListeners(ServerEvent.TASK_CREATED, data);
    });

    this.socket.on(ServerEvent.TASK_UPDATED, (data) => {
      this.emitToListeners(ServerEvent.TASK_UPDATED, data);
    });

    this.socket.on(ServerEvent.TASK_DELETED, (data) => {
      this.emitToListeners(ServerEvent.TASK_DELETED, data);
    });

    this.socket.on(ServerEvent.TASK_STATUS_CHANGED, (data) => {
      this.emitToListeners(ServerEvent.TASK_STATUS_CHANGED, data);
    });

    this.socket.on(ServerEvent.TASK_CONFIRMED, (data) => {
      this.emitToListeners(ServerEvent.TASK_CONFIRMED, data);
    });

    this.socket.on(ServerEvent.PROJECT_UPDATED, (data) => {
      this.emitToListeners(ServerEvent.PROJECT_UPDATED, data);
    });

    this.socket.on(ServerEvent.PROJECT_FINALIZED, (data) => {
      this.emitToListeners(ServerEvent.PROJECT_FINALIZED, data);
    });

    this.socket.on(ServerEvent.FILE_UPLOADED, (data) => {
      this.emitToListeners(ServerEvent.FILE_UPLOADED, data);
    });

    this.socket.on(ServerEvent.FILE_DELETED, (data) => {
      this.emitToListeners(ServerEvent.FILE_DELETED, data);
    });
  }

  /**
   * Handle successful connection to server
   */
  private handleConnect(): void {
    this.log('Connected to WebSocket server');
    this.reconnectAttempts = 0;
    this.setConnectionState(ConnectionState.CONNECTED);

    // Join user channel for user-specific notifications
    if (this.userId) {
      this.socket!.emit(ClientEvent.JOIN_USER, { userId: this.userId });
    }

    // Rejoin any previously subscribed projects
    this.rejoinProjects();

    // Emit online presence
    if (this.userId) {
      this.socket!.emit(ClientEvent.PRESENCE_ONLINE, { userId: this.userId });
    }
  }

  /**
   * Handle disconnection from server
   *
   * @param reason - Disconnection reason
   */
  private handleDisconnect(reason: string): void {
    this.log(`Disconnected: ${reason}`);

    if (reason === 'io server disconnect') {
      // Server initiated disconnect (e.g., auth failure)
      this.setConnectionState(ConnectionState.DISCONNECTED);
    } else {
      // Client-side disconnect, Socket.IO will attempt reconnection
      this.setConnectionState(ConnectionState.RECONNECTING);
    }
  }

  /**
   * Handle connection error
   *
   * @param error - Connection error
   */
  private handleConnectError(error: Error): void {
    this.log('Connection error:', error.message);
    this.setConnectionState(ConnectionState.ERROR);

    // Dispatch event for handling in presentation layer
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('socket:error', {
          detail: { message: error.message },
        }),
      );
    }
  }

  /**
   * Handle reconnection attempt
   *
   * @param attempt - Current attempt number
   */
  private handleReconnectAttempt(attempt: number): void {
    this.reconnectAttempts = attempt;
    this.log(`Reconnection attempt ${attempt}/${RECONNECTION_ATTEMPTS}`);
    this.setConnectionState(ConnectionState.RECONNECTING);
  }

  /**
   * Handle successful reconnection
   */
  private handleReconnect(): void {
    this.log('Reconnected successfully');
    this.setConnectionState(ConnectionState.CONNECTED);
    this.rejoinProjects();
  }

  /**
   * Handle reconnection failure after all attempts
   */
  private handleReconnectFailed(): void {
    this.log('Reconnection failed after maximum attempts');
    this.setConnectionState(ConnectionState.DISCONNECTED);

    // Dispatch event for handling in presentation layer
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('socket:reconnectFailed'));
    }
  }

  /**
   * Update connection state and notify listeners
   *
   * @param state - New connection state
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.emitToListeners('connectionStateChange', state);
    }
  }

  /**
   * Register internal event listener
   *
   * @template T Event data type
   * @param event - Event name
   * @param callback - Callback function
   * @returns Subscription handle
   */
  private addEventListener<T>(
    event: string,
    callback: EventCallback<T>,
  ): Subscription {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    const listeners = this.eventListeners.get(event)!;
    listeners.add(callback as EventCallback);

    return {
      unsubscribe: () => {
        listeners.delete(callback as EventCallback);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
      },
    };
  }

  /**
   * Emit event to all registered listeners
   *
   * @template T Event data type
   * @param event - Event name
   * @param data - Event data
   */
  private emitToListeners<T>(event: string, data: T): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  }

  /**
   * Log debug message if debug mode is enabled
   *
   * @param message - Log message
   * @param args - Additional arguments to log
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[SocketHandler] ${message}`, ...args);
    }
  }

  /**
   * Re-join all subscribed projects after reconnection
   */
  private rejoinProjects(): void {
    if (!this.socket?.connected) return;

    // Rejoin user channel
    if (this.userId) {
      this.socket.emit(ClientEvent.JOIN_USER, { userId: this.userId });
      this.log(`Rejoined user channel: ${this.userId}`);
    }

    // Rejoin all project rooms
    this.subscribedProjects.forEach((projectId) => {
      this.socket!.emit(ClientEvent.JOIN_PROJECT, { projectId });
      this.log(`Rejoined project room: ${projectId}`);
    });
  }
}
