# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → **Infrastructure Layer** (current) → Presentation Layer

**Current module:** Infrastructure Layer - WebSocket Handler

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/
│   │   ├── dto/                            # ✅ Already implemented
│   │   ├── interfaces/                     # ✅ Already implemented
│   │   ├── services/                       # ✅ Already implemented
│   │   └── index.ts
│   ├── domain/
│   │   ├── entities/                       # ✅ Already implemented
│   │   ├── enumerations/                   # ✅ Already implemented
│   │   ├── repositories/                   # ✅ Already implemented
│   │   ├── value-objects/                  # ✅ Already implemented
│   │   └── index.ts
│   ├── infrastructure/
│   │   ├── external-services/
│   │   │   └── ...
│   │   ├── http/
│   │   │   ├── index.ts                    # ✅ Already implemented
│   │   │   └── axios.client.ts             # ✅ Already implemented
│   │   ├── repositories/
│   │   │   └── ...
│   │   ├── websocket/
│   │   │   ├── index.ts                    # 🎯 TO IMPLEMENT
│   │   │   └── socket.handler.ts           # 🎯 TO IMPLEMENT
│   │   └── index.ts
│   ├── presentation/
│   │   └── ...
│   └── shared/
│       └── ...
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification (Relevant Sections)

### Real-Time Requirements (NFR12, FR29)
- **Real-time synchronization:** Changes made by a user are immediately reflected on all devices where other users have an active session
- **Notification delivery:** Notifications are delivered in less than 5 seconds from when the event is generated
- **Technology:** WebSockets or similar technology for real-time communication

### Events Requiring Real-Time Updates (Section 13.1)

| Event | Recipients | Data |
|-------|------------|------|
| New message | Project participants | Message details |
| File received | Project participants | File metadata |
| Task assigned | Assigned user | Task details |
| Task status change | Task creator and assignee | Task with new status |
| Task confirmed | Task creator and assignee | Task confirmation |
| Project assigned | Assigned client | Project details |
| Project finalized | All project participants | Project status |
| Project about to expire | Admin and client | Project with days remaining |

### User Interface Updates (Section 14)
- **Notification badge:** Real-time counter of pending notifications in top bar
- **Unread message counter:** Updates in real-time per project
- **Project status colors:** Update when tasks change (red/green indicators)
- **Task list:** Updates when tasks are created, modified, or deleted
- **Message list:** New messages appear without page refresh

### Connection Requirements
- Automatic reconnection on connection loss
- Authentication via JWT token
- Support for multiple browser tabs/devices per user
- Graceful degradation when WebSocket unavailable

## 2. WebSocket Events Structure

### Server-to-Client Events (Incoming)

```typescript
// Notification events
'notification:new'          → NotificationPayload
'notification:read'         → { notificationId: string }
'notification:count'        → { unreadCount: number }

// Message events
'message:new'               → MessagePayload
'message:read'              → { messageId: string, userId: string }
'messages:unread-count'     → { projectId: string, count: number }

// Task events
'task:created'              → TaskPayload
'task:updated'              → TaskPayload
'task:deleted'              → { taskId: string, projectId: string }
'task:status-changed'       → { taskId: string, previousStatus: string, newStatus: string }
'task:confirmed'            → { taskId: string, confirmedBy: string }

// Project events
'project:created'           → ProjectPayload
'project:updated'           → ProjectPayload
'project:finalized'         → { projectId: string }
'project:participant-added' → { projectId: string, userId: string }
'project:participant-removed' → { projectId: string, userId: string }

// File events
'file:uploaded'             → FilePayload
'file:deleted'              → { fileId: string, projectId: string }

// Connection events
'connect'                   → void
'disconnect'                → { reason: string }
'error'                     → { message: string, code: string }
'reconnect'                 → { attempt: number }
'reconnect_failed'          → void
```

### Client-to-Server Events (Outgoing)

```typescript
// Room management
'join:project'              → { projectId: string }
'leave:project'             → { projectId: string }
'join:user'                 → { userId: string }  // For user-specific notifications

// Presence
'presence:online'           → { userId: string }
'presence:typing'           → { projectId: string, userId: string }
'presence:stop-typing'      → { projectId: string, userId: string }

// Acknowledgments
'message:received'          → { messageId: string }
'notification:received'     → { notificationId: string }
```

## 3. Socket.IO Integration

The WebSocket handler uses Socket.IO client library for:
- Automatic reconnection with exponential backoff
- Room-based event broadcasting
- Binary data support (for file previews)
- Fallback to HTTP long-polling if WebSocket unavailable
- Built-in heartbeat/ping-pong mechanism

---

# SPECIFIC TASK

Implement the WebSocket Handler module for the Infrastructure Layer. This module manages real-time communication with the backend server using Socket.IO.

## Files to implement:

### 1. **socket.handler.ts**

**Responsibilities:**
- Establish and manage WebSocket connection
- Handle authentication with JWT token
- Manage room subscriptions (projects, user channel)
- Emit and listen for events
- Provide event subscription API for presentation layer
- Handle reconnection logic
- Track connection state

**Constants to define:**

```typescript
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const RECONNECTION_ATTEMPTS = 10;
const RECONNECTION_DELAY = 1000;
const RECONNECTION_DELAY_MAX = 30000;
const PING_INTERVAL = 25000;
const PING_TIMEOUT = 20000;
```

**Types to define:**

```typescript
/**
 * WebSocket connection state
 */
enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

/**
 * Socket event names - Server to Client
 */
enum ServerEvent {
  // Notifications
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_COUNT = 'notification:count',
  
  // Messages
  MESSAGE_NEW = 'message:new',
  MESSAGE_READ = 'message:read',
  MESSAGES_UNREAD_COUNT = 'messages:unread-count',
  
  // Tasks
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  TASK_STATUS_CHANGED = 'task:status-changed',
  TASK_CONFIRMED = 'task:confirmed',
  
  // Projects
  PROJECT_CREATED = 'project:created',
  PROJECT_UPDATED = 'project:updated',
  PROJECT_FINALIZED = 'project:finalized',
  PROJECT_PARTICIPANT_ADDED = 'project:participant-added',
  PROJECT_PARTICIPANT_REMOVED = 'project:participant-removed',
  
  // Files
  FILE_UPLOADED = 'file:uploaded',
  FILE_DELETED = 'file:deleted',
  
  // System
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  ERROR = 'error',
}

/**
 * Socket event names - Client to Server
 */
enum ClientEvent {
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
 * Event payload types
 */
interface NotificationPayload {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId: string | null;
  createdAt: string;
  isRead: boolean;
}

interface MessagePayload {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  fileIds: string[];
  isSystemMessage: boolean;
}

interface TaskPayload {
  id: string;
  projectId: string;
  description: string;
  creatorId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  updatedAt: string;
}

interface ProjectPayload {
  id: string;
  code: string;
  name: string;
  status: ProjectStatus;
  clientId: string;
  deliveryDate: string;
}

interface FilePayload {
  id: string;
  name: string;
  projectId: string;
  type: FileType;
  uploadedBy: string;
  uploadedAt: string;
}

interface TaskStatusChangedPayload {
  taskId: string;
  projectId: string;
  previousStatus: TaskStatus;
  newStatus: TaskStatus;
  changedBy: string;
}

interface TaskConfirmedPayload {
  taskId: string;
  projectId: string;
  confirmedBy: string;
  confirmedAt: string;
}

interface UnreadCountPayload {
  projectId: string;
  count: number;
}

/**
 * Event listener callback type
 */
type EventCallback<T = unknown> = (data: T) => void;

/**
 * Subscription handle for unsubscribing
 */
interface Subscription {
  unsubscribe: () => void;
}

/**
 * Connection options
 */
interface ConnectionOptions {
  token: string;
  userId: string;
  autoConnect?: boolean;
  debug?: boolean;
}

/**
 * Token provider interface
 */
interface ITokenProvider {
  getAccessToken(): string | null;
}
```

**Class to implement:**

```typescript
/**
 * WebSocket handler for real-time communication.
 * Manages Socket.IO connection, event subscriptions, and room management.
 */
class SocketHandler {
  private socket: Socket | null = null;
  private tokenProvider: ITokenProvider | null = null;
  private userId: string | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private subscribedProjects: Set<string> = new Set();
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private debug = false;
  
  /**
   * Set the token provider for authentication
   */
  setTokenProvider(provider: ITokenProvider): void;
  
  /**
   * Initialize and connect to WebSocket server
   */
  connect(options: ConnectionOptions): void;
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void;
  
  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState;
  
  /**
   * Check if connected
   */
  isConnected(): boolean;
  
  /**
   * Subscribe to a project's real-time updates
   */
  joinProject(projectId: string): void;
  
  /**
   * Unsubscribe from a project's real-time updates
   */
  leaveProject(projectId: string): void;
  
  /**
   * Leave all projects (e.g., on logout)
   */
  leaveAllProjects(): void;
  
  /**
   * Get list of subscribed project IDs
   */
  getSubscribedProjects(): string[];
  
  // Event Subscription Methods
  
  /**
   * Subscribe to new notification events
   */
  onNotification(callback: EventCallback<NotificationPayload>): Subscription;
  
  /**
   * Subscribe to notification count updates
   */
  onNotificationCount(callback: EventCallback<{ unreadCount: number }>): Subscription;
  
  /**
   * Subscribe to new message events
   */
  onMessage(callback: EventCallback<MessagePayload>): Subscription;
  
  /**
   * Subscribe to unread message count updates
   */
  onUnreadCount(callback: EventCallback<UnreadCountPayload>): Subscription;
  
  /**
   * Subscribe to task created events
   */
  onTaskCreated(callback: EventCallback<TaskPayload>): Subscription;
  
  /**
   * Subscribe to task updated events
   */
  onTaskUpdated(callback: EventCallback<TaskPayload>): Subscription;
  
  /**
   * Subscribe to task deleted events
   */
  onTaskDeleted(callback: EventCallback<{ taskId: string; projectId: string }>): Subscription;
  
  /**
   * Subscribe to task status change events
   */
  onTaskStatusChanged(callback: EventCallback<TaskStatusChangedPayload>): Subscription;
  
  /**
   * Subscribe to task confirmed events
   */
  onTaskConfirmed(callback: EventCallback<TaskConfirmedPayload>): Subscription;
  
  /**
   * Subscribe to project updated events
   */
  onProjectUpdated(callback: EventCallback<ProjectPayload>): Subscription;
  
  /**
   * Subscribe to project finalized events
   */
  onProjectFinalized(callback: EventCallback<{ projectId: string }>): Subscription;
  
  /**
   * Subscribe to file uploaded events
   */
  onFileUploaded(callback: EventCallback<FilePayload>): Subscription;
  
  /**
   * Subscribe to file deleted events
   */
  onFileDeleted(callback: EventCallback<{ fileId: string; projectId: string }>): Subscription;
  
  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(callback: EventCallback<ConnectionState>): Subscription;
  
  /**
   * Subscribe to any event by name
   */
  on<T>(event: ServerEvent | string, callback: EventCallback<T>): Subscription;
  
  /**
   * Remove all listeners for an event
   */
  off(event: ServerEvent | string): void;
  
  /**
   * Remove all listeners
   */
  removeAllListeners(): void;
  
  // Emit Methods (Client to Server)
  
  /**
   * Emit typing indicator
   */
  emitTyping(projectId: string): void;
  
  /**
   * Emit stop typing indicator
   */
  emitStopTyping(projectId: string): void;
  
  /**
   * Acknowledge message received
   */
  acknowledgeMessage(messageId: string): void;
  
  /**
   * Acknowledge notification received
   */
  acknowledgeNotification(notificationId: string): void;
  
  // Private Methods
  
  /**
   * Create Socket.IO connection
   */
  private createSocket(token: string): Socket;
  
  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void;
  
  /**
   * Handle successful connection
   */
  private handleConnect(): void;
  
  /**
   * Handle disconnection
   */
  private handleDisconnect(reason: string): void;
  
  /**
   * Handle connection error
   */
  private handleConnectError(error: Error): void;
  
  /**
   * Handle reconnection attempt
   */
  private handleReconnectAttempt(attempt: number): void;
  
  /**
   * Handle successful reconnection
   */
  private handleReconnect(): void;
  
  /**
   * Handle reconnection failure
   */
  private handleReconnectFailed(): void;
  
  /**
   * Update connection state and notify listeners
   */
  private setConnectionState(state: ConnectionState): void;
  
  /**
   * Register internal event listener
   */
  private addEventListener<T>(event: string, callback: EventCallback<T>): Subscription;
  
  /**
   * Emit event to all registered listeners
   */
  private emitToListeners<T>(event: string, data: T): void;
  
  /**
   * Log debug message
   */
  private log(message: string, ...args: unknown[]): void;
  
  /**
   * Re-join all subscribed projects after reconnection
   */
  private rejoinProjects(): void;
}
```

**Implementation Details:**

1. **Socket Creation with Authentication:**
```typescript
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
  });
}
```

2. **Setup Socket Listeners:**
```typescript
private setupSocketListeners(): void {
  if (!this.socket) return;
  
  // Connection events
  this.socket.on('connect', () => this.handleConnect());
  this.socket.on('disconnect', (reason) => this.handleDisconnect(reason));
  this.socket.on('connect_error', (error) => this.handleConnectError(error));
  
  // Reconnection events
  this.socket.io.on('reconnect_attempt', (attempt) => this.handleReconnectAttempt(attempt));
  this.socket.io.on('reconnect', () => this.handleReconnect());
  this.socket.io.on('reconnect_failed', () => this.handleReconnectFailed());
  
  // Business events - forward to listeners
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
```

3. **Connection Management:**
```typescript
connect(options: ConnectionOptions): void {
  if (this.socket?.connected) {
    this.log('Already connected');
    return;
  }
  
  this.userId = options.userId;
  this.debug = options.debug ?? false;
  
  // Get token
  const token = options.token || this.tokenProvider?.getAccessToken();
  if (!token) {
    this.log('No token available for connection');
    this.setConnectionState(ConnectionState.ERROR);
    return;
  }
  
  this.setConnectionState(ConnectionState.CONNECTING);
  
  // Create socket
  this.socket = this.createSocket(token);
  this.setupSocketListeners();
  
  // Connect
  if (options.autoConnect !== false) {
    this.socket.connect();
  }
}

disconnect(): void {
  if (this.socket) {
    this.leaveAllProjects();
    this.socket.disconnect();
    this.socket = null;
    this.setConnectionState(ConnectionState.DISCONNECTED);
    this.log('Disconnected');
  }
}
```

4. **Room Management:**
```typescript
joinProject(projectId: string): void {
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

leaveProject(projectId: string): void {
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
```

5. **Event Subscription Pattern:**
```typescript
private addEventListener<T>(event: string, callback: EventCallback<T>): Subscription {
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

// Public subscription methods
onNotification(callback: EventCallback<NotificationPayload>): Subscription {
  return this.addEventListener(ServerEvent.NOTIFICATION_NEW, callback);
}

onMessage(callback: EventCallback<MessagePayload>): Subscription {
  return this.addEventListener(ServerEvent.MESSAGE_NEW, callback);
}

onTaskCreated(callback: EventCallback<TaskPayload>): Subscription {
  return this.addEventListener(ServerEvent.TASK_CREATED, callback);
}

// Generic subscription
on<T>(event: ServerEvent | string, callback: EventCallback<T>): Subscription {
  return this.addEventListener(event, callback);
}
```

6. **Connection State Management:**
```typescript
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

private handleDisconnect(reason: string): void {
  this.log(`Disconnected: ${reason}`);
  
  if (reason === 'io server disconnect') {
    // Server initiated disconnect (e.g., auth failure)
    this.setConnectionState(ConnectionState.DISCONNECTED);
  } else {
    // Client-side disconnect, will attempt reconnection
    this.setConnectionState(ConnectionState.RECONNECTING);
  }
}

private handleConnectError(error: Error): void {
  this.log('Connection error:', error.message);
  this.setConnectionState(ConnectionState.ERROR);
  
  // Dispatch event for handling in presentation layer
  window.dispatchEvent(new CustomEvent('socket:error', { 
    detail: { message: error.message } 
  }));
}

private handleReconnectAttempt(attempt: number): void {
  this.reconnectAttempts = attempt;
  this.log(`Reconnection attempt ${attempt}/${RECONNECTION_ATTEMPTS}`);
  this.setConnectionState(ConnectionState.RECONNECTING);
}

private handleReconnect(): void {
  this.log('Reconnected successfully');
  this.setConnectionState(ConnectionState.CONNECTED);
  this.rejoinProjects();
}

private handleReconnectFailed(): void {
  this.log('Reconnection failed after maximum attempts');
  this.setConnectionState(ConnectionState.DISCONNECTED);
  
  // Dispatch event for handling in presentation layer
  window.dispatchEvent(new CustomEvent('socket:reconnectFailed'));
}

private setConnectionState(state: ConnectionState): void {
  if (this.connectionState !== state) {
    this.connectionState = state;
    this.emitToListeners('connectionStateChange', state);
  }
}
```

---

### 2. **index.ts** (Barrel Export)

**Responsibilities:**
- Export SocketHandler class and singleton instance
- Export all types, interfaces, and enums
- Provide convenient access to WebSocket handler

**Content:**
```typescript
// Export enums
export { ConnectionState, ServerEvent, ClientEvent };

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
};

// Export class
export { SocketHandler };

// Export singleton instance
export const socketHandler = new SocketHandler();

// Export convenience object for common operations
export const socket = {
  connect: (options: ConnectionOptions) => socketHandler.connect(options),
  disconnect: () => socketHandler.disconnect(),
  isConnected: () => socketHandler.isConnected(),
  getState: () => socketHandler.getConnectionState(),
  joinProject: (projectId: string) => socketHandler.joinProject(projectId),
  leaveProject: (projectId: string) => socketHandler.leaveProject(projectId),
  
  // Event subscriptions
  onNotification: (cb: EventCallback<NotificationPayload>) => socketHandler.onNotification(cb),
  onMessage: (cb: EventCallback<MessagePayload>) => socketHandler.onMessage(cb),
  onTaskCreated: (cb: EventCallback<TaskPayload>) => socketHandler.onTaskCreated(cb),
  onTaskUpdated: (cb: EventCallback<TaskPayload>) => socketHandler.onTaskUpdated(cb),
  onTaskDeleted: (cb: EventCallback<{ taskId: string; projectId: string }>) => socketHandler.onTaskDeleted(cb),
  onTaskStatusChanged: (cb: EventCallback<TaskStatusChangedPayload>) => socketHandler.onTaskStatusChanged(cb),
  onProjectUpdated: (cb: EventCallback<ProjectPayload>) => socketHandler.onProjectUpdated(cb),
  onFileUploaded: (cb: EventCallback<FilePayload>) => socketHandler.onFileUploaded(cb),
  onConnectionStateChange: (cb: EventCallback<ConnectionState>) => socketHandler.onConnectionStateChange(cb),
};
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
- **WebSocket Library:** Socket.IO Client v4.x
- **Maximum cyclomatic complexity:** 10
- **Maximum method length:** 50 lines

## Mandatory best practices:
- **Type Safety:** All events and payloads fully typed
- **Memory Management:** Proper cleanup of listeners on disconnect
- **Error Handling:** Graceful handling of connection failures
- **Security:**
  - JWT token authentication
  - No sensitive data in logs
  - Secure WebSocket (WSS) in production
- **Performance:**
  - Efficient event listener management
  - Debounce rapid events if needed
  - Connection pooling (handled by Socket.IO)
- **Resilience:**
  - Automatic reconnection with backoff
  - Room re-subscription after reconnect
  - Graceful degradation

## Environment Variables:
```typescript
// Expected environment variables
VITE_SOCKET_URL: string;           // WebSocket server URL
VITE_SOCKET_DEBUG: boolean;        // Enable debug logging
```

## Socket.IO Client Configuration:
```typescript
// Recommended Socket.IO options
{
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  timeout: 20000,
  auth: { token: 'Bearer xxx' },
}
```

---

# DELIVERABLES

1. **Complete source code** for both files (socket.handler.ts + index.ts)

2. **For socket.handler.ts:**
   - Full SocketHandler class implementation
   - All types, interfaces, and enums
   - Connection management with authentication
   - Room subscription management
   - Event listener registration/removal
   - Reconnection handling
   - JSDoc documentation

3. **Event subscription methods for:**
   - Notifications (new, count)
   - Messages (new, unread count)
   - Tasks (created, updated, deleted, status changed, confirmed)
   - Projects (updated, finalized)
   - Files (uploaded, deleted)
   - Connection state changes

4. **Edge cases to handle:**
   - Connection timeout
   - Server disconnection
   - Authentication failure
   - Token expiration during connection
   - Multiple rapid reconnection attempts
   - Joining room before connected
   - Duplicate event subscriptions
   - Memory leaks from unremoved listeners

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```typescript
// src/infrastructure/websocket/socket.handler.ts
[Complete code here]
```

```typescript
// src/infrastructure/websocket/index.ts
[Complete code here]
```

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
