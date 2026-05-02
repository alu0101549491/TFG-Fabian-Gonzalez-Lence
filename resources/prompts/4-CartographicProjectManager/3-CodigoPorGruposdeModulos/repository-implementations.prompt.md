# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → **Infrastructure Layer** (current) → Presentation Layer

**Current module:** Infrastructure Layer - Repository Implementations

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
│   │   ├── repositories/                   # ✅ Already implemented (interfaces)
│   │   ├── value-objects/                  # ✅ Already implemented
│   │   └── index.ts
│   ├── infrastructure/
│   │   ├── external-services/
│   │   │   ├── index.ts                    # ✅ Already implemented
│   │   │   ├── dropbox.service.ts          # ✅ Already implemented
│   │   │   └── whatsapp.gateway.ts         # ✅ Already implemented
│   │   ├── http/
│   │   │   ├── index.ts                    # ✅ Already implemented
│   │   │   └── axios.client.ts             # ✅ Already implemented
│   │   ├── repositories/
│   │   │   ├── index.ts                    # 🎯 TO IMPLEMENT
│   │   │   ├── user.repository.ts          # 🎯 TO IMPLEMENT
│   │   │   ├── project.repository.ts       # 🎯 TO IMPLEMENT
│   │   │   ├── task.repository.ts          # 🎯 TO IMPLEMENT
│   │   │   ├── task-history.repository.ts  # 🎯 TO IMPLEMENT
│   │   │   ├── message.repository.ts       # 🎯 TO IMPLEMENT
│   │   │   ├── notification.repository.ts  # 🎯 TO IMPLEMENT
│   │   │   ├── file.repository.ts          # 🎯 TO IMPLEMENT
│   │   │   └── permission.repository.ts    # 🎯 TO IMPLEMENT
│   │   ├── websocket/
│   │   │   ├── index.ts                    # ✅ Already implemented
│   │   │   └── socket.handler.ts           # ✅ Already implemented
│   │   └── index.ts
│   ├── presentation/
│   │   └── ...
│   └── shared/
│       └── ...
```

---

# INPUT ARTIFACTS

## 1. Domain Repository Interfaces (Already Implemented)

The repository implementations must implement these interfaces from `src/domain/repositories/`:

```typescript
// IUserRepository
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findByRole(role: UserRole): Promise<User[]>;
  findAll(): Promise<User[]>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
}

// IProjectRepository
interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByCode(code: string): Promise<Project | null>;
  save(project: Project): Promise<Project>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
  findByClientId(clientId: string): Promise<Project[]>;
  findBySpecialUserId(userId: string): Promise<Project[]>;
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  findByYear(year: number): Promise<Project[]>;
  findByType(type: ProjectType): Promise<Project[]>;
  findAll(): Promise<Project[]>;
  findAllActive(): Promise<Project[]>;
  findAllOrderedByDeliveryDate(ascending?: boolean): Promise<Project[]>;
  findByDeliveryDateRange(startDate: Date, endDate: Date): Promise<Project[]>;
  existsByCode(code: string): Promise<boolean>;
  countByClientId(clientId: string): Promise<number>;
  countByStatus(status: ProjectStatus): Promise<number>;
}

// ITaskRepository
interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  findByProjectId(projectId: string): Promise<Task[]>;
  findByAssigneeId(userId: string): Promise<Task[]>;
  findByCreatorId(userId: string): Promise<Task[]>;
  findByProjectIdAndStatus(projectId: string, status: TaskStatus): Promise<Task[]>;
  findByProjectIdAndPriority(projectId: string, priority: TaskPriority): Promise<Task[]>;
  findByAssigneeIdAndStatus(userId: string, status: TaskStatus): Promise<Task[]>;
  findOverdue(): Promise<Task[]>;
  findOverdueByProjectId(projectId: string): Promise<Task[]>;
  findOverdueByAssigneeId(userId: string): Promise<Task[]>;
  countByProjectId(projectId: string): Promise<number>;
  countPendingByProjectId(projectId: string): Promise<number>;
  countByAssigneeId(userId: string): Promise<number>;
  countPendingByAssigneeId(userId: string): Promise<number>;
  deleteByProjectId(projectId: string): Promise<void>;
}

// ITaskHistoryRepository
interface ITaskHistoryRepository {
  save(history: TaskHistory): Promise<TaskHistory>;
  findByTaskId(taskId: string): Promise<TaskHistory[]>;
  findByTaskIdAndAction(taskId: string, action: string): Promise<TaskHistory[]>;
  findByUserId(userId: string): Promise<TaskHistory[]>;
  findByTaskIdPaginated(taskId: string, limit: number, offset: number): Promise<TaskHistory[]>;
  countByTaskId(taskId: string): Promise<number>;
  deleteByTaskId(taskId: string): Promise<void>;
}

// IMessageRepository
interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  save(message: Message): Promise<Message>;
  update(message: Message): Promise<Message>;
  delete(id: string): Promise<void>;
  findByProjectId(projectId: string): Promise<Message[]>;
  findByProjectIdPaginated(projectId: string, limit: number, offset: number): Promise<Message[]>;
  findBySenderId(senderId: string): Promise<Message[]>;
  findByProjectIdAndSenderId(projectId: string, senderId: string): Promise<Message[]>;
  countByProjectId(projectId: string): Promise<number>;
  countUnreadByProjectAndUser(projectId: string, userId: string): Promise<number>;
  findUnreadByProjectAndUser(projectId: string, userId: string): Promise<Message[]>;
  markAsReadByProjectAndUser(projectId: string, userId: string): Promise<void>;
  deleteByProjectId(projectId: string): Promise<void>;
  findLatestByProjectId(projectId: string, limit: number): Promise<Message[]>;
}

// INotificationRepository
interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  save(notification: Notification): Promise<Notification>;
  update(notification: Notification): Promise<Notification>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<Notification[]>;
  findByUserIdPaginated(userId: string, limit: number, offset: number): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  findByUserIdAndType(userId: string, type: NotificationType): Promise<Notification[]>;
  countByUserId(userId: string): Promise<number>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAsRead(id: string): Promise<void>;
  markAllAsReadByUserId(userId: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteOlderThan(date: Date): Promise<void>;
  findByRelatedEntityId(entityId: string): Promise<Notification[]>;
}

// IFileRepository
interface IFileRepository {
  findById(id: string): Promise<File | null>;
  save(file: File): Promise<File>;
  delete(id: string): Promise<void>;
  findByProjectId(projectId: string): Promise<File[]>;
  findByTaskId(taskId: string): Promise<File[]>;
  findByMessageId(messageId: string): Promise<File[]>;
  findByProjectIdAndType(projectId: string, type: FileType): Promise<File[]>;
  findByUploadedBy(userId: string): Promise<File[]>;
  countByProjectId(projectId: string): Promise<number>;
  countByTaskId(taskId: string): Promise<number>;
  deleteByProjectId(projectId: string): Promise<void>;
  deleteByTaskId(taskId: string): Promise<void>;
  deleteByMessageId(messageId: string): Promise<void>;
  findByDropboxPath(path: string): Promise<File | null>;
  existsByDropboxPath(path: string): Promise<boolean>;
}

// IPermissionRepository
interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByUserAndProject(userId: string, projectId: string): Promise<Permission | null>;
  save(permission: Permission): Promise<Permission>;
  update(permission: Permission): Promise<Permission>;
  delete(id: string): Promise<void>;
  deleteByUserAndProject(userId: string, projectId: string): Promise<void>;
  findByUserId(userId: string): Promise<Permission[]>;
  findByProjectId(projectId: string): Promise<Permission[]>;
  findByGrantedBy(adminId: string): Promise<Permission[]>;
  existsByUserAndProject(userId: string, projectId: string): Promise<boolean>;
  deleteByUserId(userId: string): Promise<void>;
  deleteByProjectId(projectId: string): Promise<void>;
  countByProjectId(projectId: string): Promise<number>;
  countByUserId(userId: string): Promise<number>;
}
```

## 2. HTTP Client (Already Implemented)

Repositories will use the HTTP client from `src/infrastructure/http/`:

```typescript
import { httpClient, ApiResponse, ApiError } from '../http';

// Available methods:
httpClient.get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
httpClient.post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
httpClient.put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
httpClient.patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
httpClient.delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
```

## 3. API Endpoints (Backend)

The repositories communicate with these backend API endpoints:

```
Users:
  GET    /users                    - Get all users
  GET    /users/:id                - Get user by ID
  GET    /users/email/:email       - Get user by email
  GET    /users/username/:username - Get user by username
  POST   /users                    - Create user
  PUT    /users/:id                - Update user
  DELETE /users/:id                - Delete user
  GET    /users?role=:role         - Get users by role

Projects:
  GET    /projects                 - Get all projects
  GET    /projects/:id             - Get project by ID
  GET    /projects/code/:code      - Get project by code
  POST   /projects                 - Create project
  PUT    /projects/:id             - Update project
  DELETE /projects/:id             - Delete project
  GET    /projects?clientId=:id    - Get projects by client
  GET    /projects?status=:status  - Get projects by status
  GET    /projects?year=:year      - Get projects by year

Tasks:
  GET    /tasks/:id                - Get task by ID
  POST   /tasks                    - Create task
  PUT    /tasks/:id                - Update task
  DELETE /tasks/:id                - Delete task
  GET    /projects/:projectId/tasks - Get tasks by project
  GET    /tasks?assigneeId=:id     - Get tasks by assignee
  GET    /tasks?creatorId=:id      - Get tasks by creator
  DELETE /projects/:projectId/tasks - Delete all project tasks

TaskHistory:
  POST   /task-history             - Create history entry
  GET    /tasks/:taskId/history    - Get task history
  DELETE /tasks/:taskId/history    - Delete task history

Messages:
  GET    /messages/:id             - Get message by ID
  POST   /messages                 - Create message
  PUT    /messages/:id             - Update message
  DELETE /messages/:id             - Delete message
  GET    /projects/:projectId/messages - Get messages by project
  POST   /projects/:projectId/messages/mark-read - Mark all as read

Notifications:
  GET    /notifications/:id        - Get notification by ID
  POST   /notifications            - Create notification
  PUT    /notifications/:id        - Update notification
  DELETE /notifications/:id        - Delete notification
  GET    /notifications?userId=:id - Get user notifications
  POST   /notifications/:id/read   - Mark as read
  POST   /notifications/mark-all-read - Mark all as read

Files:
  GET    /files/:id                - Get file by ID
  POST   /files                    - Create file metadata
  DELETE /files/:id                - Delete file
  GET    /projects/:projectId/files - Get project files
  GET    /tasks/:taskId/files      - Get task files
  GET    /messages/:messageId/files - Get message files

Permissions:
  GET    /permissions/:id          - Get permission by ID
  GET    /permissions?userId=:userId&projectId=:projectId - Get by user and project
  POST   /permissions              - Create permission
  PUT    /permissions/:id          - Update permission
  DELETE /permissions/:id          - Delete permission
  GET    /permissions?userId=:id   - Get user permissions
  GET    /permissions?projectId=:id - Get project permissions
```

---

# SPECIFIC TASK

Implement all Repository classes for the Infrastructure Layer. These classes implement the domain repository interfaces and handle communication with the backend API via the HTTP client.

## Files to implement:

### 1. **user.repository.ts**

**Responsibilities:**
- Implement IUserRepository interface
- Handle user CRUD operations via HTTP
- Map API responses to User entities
- Handle API errors appropriately

**Implementation Pattern:**

```typescript
import { httpClient } from '../http';
import { User, UserProps } from '../../domain/entities';
import { UserRole } from '../../domain/enumerations';
import { IUserRepository } from '../../domain/repositories';

/**
 * API response type for user data
 */
interface UserApiResponse {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  phone: string | null;
  whatsappEnabled: boolean;
  createdAt: string;
  lastLogin: string | null;
}

/**
 * User repository implementation using HTTP API.
 */
export class UserRepository implements IUserRepository {
  private readonly baseUrl = '/users';
  
  async findById(id: string): Promise<User | null> {
    try {
      const response = await httpClient.get<UserApiResponse>(`${this.baseUrl}/${id}`);
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }
  
  async findByEmail(email: string): Promise<User | null> {
    try {
      const response = await httpClient.get<UserApiResponse>(
        `${this.baseUrl}/email/${encodeURIComponent(email)}`
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }
  
  async save(user: User): Promise<User> {
    const response = await httpClient.post<UserApiResponse>(
      this.baseUrl,
      this.mapToApiRequest(user)
    );
    return this.mapToEntity(response.data);
  }
  
  async update(user: User): Promise<User> {
    const response = await httpClient.put<UserApiResponse>(
      `${this.baseUrl}/${user.id}`,
      this.mapToApiRequest(user)
    );
    return this.mapToEntity(response.data);
  }
  
  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }
  
  async findByRole(role: UserRole): Promise<User[]> {
    const response = await httpClient.get<UserApiResponse[]>(
      `${this.baseUrl}?role=${role}`
    );
    return response.data.map(data => this.mapToEntity(data));
  }
  
  async findAll(): Promise<User[]> {
    const response = await httpClient.get<UserApiResponse[]>(this.baseUrl);
    return response.data.map(data => this.mapToEntity(data));
  }
  
  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }
  
  async existsByUsername(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }
  
  // Private helper methods
  
  private mapToEntity(data: UserApiResponse): User {
    return new User({
      id: data.id,
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role as UserRole,
      phone: data.phone,
      whatsappEnabled: data.whatsappEnabled,
      createdAt: new Date(data.createdAt),
      lastLogin: data.lastLogin ? new Date(data.lastLogin) : null,
    });
  }
  
  private mapToApiRequest(user: User): Record<string, unknown> {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      phone: user.phone,
      whatsappEnabled: user.whatsappEnabled,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() || null,
    };
  }
  
  private isNotFoundError(error: unknown): boolean {
    return (error as { status?: number })?.status === 404;
  }
}
```

---

### 2. **project.repository.ts**

**Responsibilities:**
- Implement IProjectRepository interface
- Handle project CRUD and query operations
- Map API responses to Project entities with GeoCoordinates
- Support filtering by status, year, type, client

**Key Implementation Details:**

```typescript
export class ProjectRepository implements IProjectRepository {
  private readonly baseUrl = '/projects';
  
  async findById(id: string): Promise<Project | null>;
  async findByCode(code: string): Promise<Project | null>;
  async save(project: Project): Promise<Project>;
  async update(project: Project): Promise<Project>;
  async delete(id: string): Promise<void>;
  async findByClientId(clientId: string): Promise<Project[]>;
  async findBySpecialUserId(userId: string): Promise<Project[]>;
  async findByStatus(status: ProjectStatus): Promise<Project[]>;
  async findByYear(year: number): Promise<Project[]>;
  async findByType(type: ProjectType): Promise<Project[]>;
  async findAll(): Promise<Project[]>;
  async findAllActive(): Promise<Project[]>;
  async findAllOrderedByDeliveryDate(ascending?: boolean): Promise<Project[]>;
  async findByDeliveryDateRange(startDate: Date, endDate: Date): Promise<Project[]>;
  async existsByCode(code: string): Promise<boolean>;
  async countByClientId(clientId: string): Promise<number>;
  async countByStatus(status: ProjectStatus): Promise<number>;
  
  // Mapping must handle GeoCoordinates value object
  private mapToEntity(data: ProjectApiResponse): Project {
    return new Project({
      id: data.id,
      code: data.code,
      name: data.name,
      year: data.year,
      clientId: data.clientId,
      type: data.type as ProjectType,
      coordinates: data.coordinateX && data.coordinateY 
        ? new GeoCoordinates(data.coordinateY, data.coordinateX)
        : null,
      contractDate: new Date(data.contractDate),
      deliveryDate: new Date(data.deliveryDate),
      status: data.status as ProjectStatus,
      dropboxFolderId: data.dropboxFolderId,
      specialUserIds: data.specialUserIds || [],
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      finalizedAt: data.finalizedAt ? new Date(data.finalizedAt) : null,
    });
  }
}
```

---

### 3. **task.repository.ts**

**Responsibilities:**
- Implement ITaskRepository interface
- Handle task CRUD and query operations
- Support filtering by status, priority, assignee, creator
- Handle overdue task queries

**Key Implementation Details:**

```typescript
export class TaskRepository implements ITaskRepository {
  private readonly baseUrl = '/tasks';
  
  async findById(id: string): Promise<Task | null>;
  async save(task: Task): Promise<Task>;
  async update(task: Task): Promise<Task>;
  async delete(id: string): Promise<void>;
  async findByProjectId(projectId: string): Promise<Task[]>;
  async findByAssigneeId(userId: string): Promise<Task[]>;
  async findByCreatorId(userId: string): Promise<Task[]>;
  async findByProjectIdAndStatus(projectId: string, status: TaskStatus): Promise<Task[]>;
  async findByProjectIdAndPriority(projectId: string, priority: TaskPriority): Promise<Task[]>;
  async findByAssigneeIdAndStatus(userId: string, status: TaskStatus): Promise<Task[]>;
  async findOverdue(): Promise<Task[]>;
  async findOverdueByProjectId(projectId: string): Promise<Task[]>;
  async findOverdueByAssigneeId(userId: string): Promise<Task[]>;
  async countByProjectId(projectId: string): Promise<number>;
  async countPendingByProjectId(projectId: string): Promise<number>;
  async countByAssigneeId(userId: string): Promise<number>;
  async countPendingByAssigneeId(userId: string): Promise<number>;
  async deleteByProjectId(projectId: string): Promise<void>;
  
  private mapToEntity(data: TaskApiResponse): Task {
    return new Task({
      id: data.id,
      projectId: data.projectId,
      description: data.description,
      creatorId: data.creatorId,
      assigneeId: data.assigneeId,
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      dueDate: new Date(data.dueDate),
      fileIds: data.fileIds || [],
      comments: data.comments,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      confirmedAt: data.confirmedAt ? new Date(data.confirmedAt) : null,
    });
  }
}
```

---

### 4. **task-history.repository.ts**

**Responsibilities:**
- Implement ITaskHistoryRepository interface
- Handle immutable task history records
- Support pagination for history queries

**Key Implementation Details:**

```typescript
export class TaskHistoryRepository implements ITaskHistoryRepository {
  private readonly baseUrl = '/task-history';
  
  async save(history: TaskHistory): Promise<TaskHistory>;
  async findByTaskId(taskId: string): Promise<TaskHistory[]>;
  async findByTaskIdAndAction(taskId: string, action: string): Promise<TaskHistory[]>;
  async findByUserId(userId: string): Promise<TaskHistory[]>;
  async findByTaskIdPaginated(taskId: string, limit: number, offset: number): Promise<TaskHistory[]>;
  async countByTaskId(taskId: string): Promise<number>;
  async deleteByTaskId(taskId: string): Promise<void>;
  
  private mapToEntity(data: TaskHistoryApiResponse): TaskHistory {
    return new TaskHistory({
      id: data.id,
      taskId: data.taskId,
      userId: data.userId,
      action: data.action,
      previousValue: data.previousValue,
      newValue: data.newValue,
      timestamp: new Date(data.timestamp),
    });
  }
}
```

---

### 5. **message.repository.ts**

**Responsibilities:**
- Implement IMessageRepository interface
- Handle message CRUD operations
- Support pagination and unread counts
- Handle read status management

**Key Implementation Details:**

```typescript
export class MessageRepository implements IMessageRepository {
  private readonly baseUrl = '/messages';
  
  async findById(id: string): Promise<Message | null>;
  async save(message: Message): Promise<Message>;
  async update(message: Message): Promise<Message>;
  async delete(id: string): Promise<void>;
  async findByProjectId(projectId: string): Promise<Message[]>;
  async findByProjectIdPaginated(projectId: string, limit: number, offset: number): Promise<Message[]>;
  async findBySenderId(senderId: string): Promise<Message[]>;
  async findByProjectIdAndSenderId(projectId: string, senderId: string): Promise<Message[]>;
  async countByProjectId(projectId: string): Promise<number>;
  async countUnreadByProjectAndUser(projectId: string, userId: string): Promise<number>;
  async findUnreadByProjectAndUser(projectId: string, userId: string): Promise<Message[]>;
  async markAsReadByProjectAndUser(projectId: string, userId: string): Promise<void>;
  async deleteByProjectId(projectId: string): Promise<void>;
  async findLatestByProjectId(projectId: string, limit: number): Promise<Message[]>;
  
  private mapToEntity(data: MessageApiResponse): Message {
    return new Message({
      id: data.id,
      projectId: data.projectId,
      senderId: data.senderId,
      content: data.content,
      sentAt: new Date(data.sentAt),
      fileIds: data.fileIds || [],
      readByUserIds: data.readByUserIds || [],
      type: data.type as 'NORMAL' | 'SYSTEM',
    });
  }
}
```

---

### 6. **notification.repository.ts**

**Responsibilities:**
- Implement INotificationRepository interface
- Handle notification CRUD operations
- Support read status management
- Handle bulk operations (mark all as read)
- Support cleanup of old notifications

**Key Implementation Details:**

```typescript
export class NotificationRepository implements INotificationRepository {
  private readonly baseUrl = '/notifications';
  
  async findById(id: string): Promise<Notification | null>;
  async save(notification: Notification): Promise<Notification>;
  async update(notification: Notification): Promise<Notification>;
  async delete(id: string): Promise<void>;
  async findByUserId(userId: string): Promise<Notification[]>;
  async findByUserIdPaginated(userId: string, limit: number, offset: number): Promise<Notification[]>;
  async findUnreadByUserId(userId: string): Promise<Notification[]>;
  async findByUserIdAndType(userId: string, type: NotificationType): Promise<Notification[]>;
  async countByUserId(userId: string): Promise<number>;
  async countUnreadByUserId(userId: string): Promise<number>;
  async markAsRead(id: string): Promise<void>;
  async markAllAsReadByUserId(userId: string): Promise<void>;
  async deleteByUserId(userId: string): Promise<void>;
  async deleteOlderThan(date: Date): Promise<void>;
  async findByRelatedEntityId(entityId: string): Promise<Notification[]>;
  
  private mapToEntity(data: NotificationApiResponse): Notification {
    return new Notification({
      id: data.id,
      userId: data.userId,
      type: data.type as NotificationType,
      title: data.title,
      message: data.message,
      relatedEntityId: data.relatedEntityId,
      createdAt: new Date(data.createdAt),
      isRead: data.isRead,
      sentViaWhatsApp: data.sentViaWhatsApp,
    });
  }
}
```

---

### 7. **file.repository.ts**

**Responsibilities:**
- Implement IFileRepository interface
- Handle file metadata CRUD operations
- Support queries by project, task, message
- Handle Dropbox path lookups

**Key Implementation Details:**

```typescript
export class FileRepository implements IFileRepository {
  private readonly baseUrl = '/files';
  
  async findById(id: string): Promise<File | null>;
  async save(file: File): Promise<File>;
  async delete(id: string): Promise<void>;
  async findByProjectId(projectId: string): Promise<File[]>;
  async findByTaskId(taskId: string): Promise<File[]>;
  async findByMessageId(messageId: string): Promise<File[]>;
  async findByProjectIdAndType(projectId: string, type: FileType): Promise<File[]>;
  async findByUploadedBy(userId: string): Promise<File[]>;
  async countByProjectId(projectId: string): Promise<number>;
  async countByTaskId(taskId: string): Promise<number>;
  async deleteByProjectId(projectId: string): Promise<void>;
  async deleteByTaskId(taskId: string): Promise<void>;
  async deleteByMessageId(messageId: string): Promise<void>;
  async findByDropboxPath(path: string): Promise<File | null>;
  async existsByDropboxPath(path: string): Promise<boolean>;
  
  private mapToEntity(data: FileApiResponse): File {
    return new File({
      id: data.id,
      name: data.name,
      dropboxPath: data.dropboxPath,
      type: data.type as FileType,
      sizeInBytes: data.sizeInBytes,
      uploadedBy: data.uploadedBy,
      uploadedAt: new Date(data.uploadedAt),
      projectId: data.projectId,
      taskId: data.taskId,
      messageId: data.messageId,
    });
  }
}
```

---

### 8. **permission.repository.ts**

**Responsibilities:**
- Implement IPermissionRepository interface
- Handle permission CRUD operations
- Support queries by user, project, granter

**Key Implementation Details:**

```typescript
export class PermissionRepository implements IPermissionRepository {
  private readonly baseUrl = '/permissions';
  
  async findById(id: string): Promise<Permission | null>;
  async findByUserAndProject(userId: string, projectId: string): Promise<Permission | null>;
  async save(permission: Permission): Promise<Permission>;
  async update(permission: Permission): Promise<Permission>;
  async delete(id: string): Promise<void>;
  async deleteByUserAndProject(userId: string, projectId: string): Promise<void>;
  async findByUserId(userId: string): Promise<Permission[]>;
  async findByProjectId(projectId: string): Promise<Permission[]>;
  async findByGrantedBy(adminId: string): Promise<Permission[]>;
  async existsByUserAndProject(userId: string, projectId: string): Promise<boolean>;
  async deleteByUserId(userId: string): Promise<void>;
  async deleteByProjectId(projectId: string): Promise<void>;
  async countByProjectId(projectId: string): Promise<number>;
  async countByUserId(userId: string): Promise<number>;
  
  private mapToEntity(data: PermissionApiResponse): Permission {
    return new Permission({
      id: data.id,
      userId: data.userId,
      projectId: data.projectId,
      rights: new Set(data.rights.map(r => r as AccessRight)),
      sectionAccess: data.sectionAccess || [],
      grantedBy: data.grantedBy,
      grantedAt: new Date(data.grantedAt),
      updatedAt: new Date(data.updatedAt),
    });
  }
  
  private mapToApiRequest(permission: Permission): Record<string, unknown> {
    return {
      id: permission.id,
      userId: permission.userId,
      projectId: permission.projectId,
      rights: Array.from(permission.rights),
      sectionAccess: permission.sectionAccess,
      grantedBy: permission.grantedBy,
      grantedAt: permission.grantedAt.toISOString(),
      updatedAt: permission.updatedAt.toISOString(),
    };
  }
}
```

---

### 9. **index.ts** (Barrel Export)

**Responsibilities:**
- Export all repository implementations
- Provide factory functions for dependency injection
- Export singleton instances if needed

**Content:**

```typescript
// Export repository classes
export { UserRepository } from './user.repository';
export { ProjectRepository } from './project.repository';
export { TaskRepository } from './task.repository';
export { TaskHistoryRepository } from './task-history.repository';
export { MessageRepository } from './message.repository';
export { NotificationRepository } from './notification.repository';
export { FileRepository } from './file.repository';
export { PermissionRepository } from './permission.repository';

// Import interfaces for type exports
import type { IUserRepository } from '../../domain/repositories';
import type { IProjectRepository } from '../../domain/repositories';
import type { ITaskRepository } from '../../domain/repositories';
import type { ITaskHistoryRepository } from '../../domain/repositories';
import type { IMessageRepository } from '../../domain/repositories';
import type { INotificationRepository } from '../../domain/repositories';
import type { IFileRepository } from '../../domain/repositories';
import type { IPermissionRepository } from '../../domain/repositories';

// Re-export interface types
export type {
  IUserRepository,
  IProjectRepository,
  ITaskRepository,
  ITaskHistoryRepository,
  IMessageRepository,
  INotificationRepository,
  IFileRepository,
  IPermissionRepository,
};

// Factory functions for creating repository instances
export function createUserRepository(): IUserRepository {
  return new UserRepository();
}

export function createProjectRepository(): IProjectRepository {
  return new ProjectRepository();
}

export function createTaskRepository(): ITaskRepository {
  return new TaskRepository();
}

export function createTaskHistoryRepository(): ITaskHistoryRepository {
  return new TaskHistoryRepository();
}

export function createMessageRepository(): IMessageRepository {
  return new MessageRepository();
}

export function createNotificationRepository(): INotificationRepository {
  return new NotificationRepository();
}

export function createFileRepository(): IFileRepository {
  return new FileRepository();
}

export function createPermissionRepository(): IPermissionRepository {
  return new PermissionRepository();
}

// Singleton instances (lazy initialization)
let userRepository: IUserRepository | null = null;
let projectRepository: IProjectRepository | null = null;
let taskRepository: ITaskRepository | null = null;
let taskHistoryRepository: ITaskHistoryRepository | null = null;
let messageRepository: IMessageRepository | null = null;
let notificationRepository: INotificationRepository | null = null;
let fileRepository: IFileRepository | null = null;
let permissionRepository: IPermissionRepository | null = null;

export const repositories = {
  get user(): IUserRepository {
    if (!userRepository) userRepository = new UserRepository();
    return userRepository;
  },
  get project(): IProjectRepository {
    if (!projectRepository) projectRepository = new ProjectRepository();
    return projectRepository;
  },
  get task(): ITaskRepository {
    if (!taskRepository) taskRepository = new TaskRepository();
    return taskRepository;
  },
  get taskHistory(): ITaskHistoryRepository {
    if (!taskHistoryRepository) taskHistoryRepository = new TaskHistoryRepository();
    return taskHistoryRepository;
  },
  get message(): IMessageRepository {
    if (!messageRepository) messageRepository = new MessageRepository();
    return messageRepository;
  },
  get notification(): INotificationRepository {
    if (!notificationRepository) notificationRepository = new NotificationRepository();
    return notificationRepository;
  },
  get file(): IFileRepository {
    if (!fileRepository) fileRepository = new FileRepository();
    return fileRepository;
  },
  get permission(): IPermissionRepository {
    if (!permissionRepository) permissionRepository = new PermissionRepository();
    return permissionRepository;
  },
};
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 10
- **Maximum method length:** 30 lines

## Mandatory best practices:
- **Interface Implementation:** All repositories must correctly implement their domain interfaces
- **Error Handling:**
  - Return `null` for not found scenarios (don't throw)
  - Propagate API errors appropriately
  - Use type guards for error checking
- **Type Safety:**
  - Define API response types for each entity
  - Proper mapping between API responses and domain entities
- **Immutability:** Never modify passed entities, create new instances
- **Consistency:**
  - All repositories follow the same patterns
  - Consistent error handling
  - Consistent mapping methods

## API Response Types Pattern:
```typescript
interface EntityApiResponse {
  id: string;
  // ... other fields matching API response
  createdAt: string;  // ISO date strings from API
  updatedAt: string;
}
```

## Mapping Pattern:
```typescript
private mapToEntity(data: EntityApiResponse): Entity {
  return new Entity({
    // Map all fields, converting dates from strings
    createdAt: new Date(data.createdAt),
  });
}

private mapToApiRequest(entity: Entity): Record<string, unknown> {
  return {
    // Map all fields, converting dates to ISO strings
    createdAt: entity.createdAt.toISOString(),
  };
}
```

## Error Handling Pattern:
```typescript
private isNotFoundError(error: unknown): boolean {
  return (error as { status?: number })?.status === 404;
}

private isConflictError(error: unknown): boolean {
  return (error as { status?: number })?.status === 409;
}
```

---

# DELIVERABLES

1. **Complete source code** for all 9 files (8 repositories + 1 index)

2. **For each repository file:**
   - Full implementation of domain interface
   - API response type definition
   - Entity mapping methods (to/from API)
   - Error handling with proper null returns
   - JSDoc documentation for class

3. **Consistent patterns across all repositories:**
   - Same error handling approach
   - Same mapping method names
   - Same query parameter handling
   - Same pagination support where applicable

4. **Edge cases to handle:**
   - Entity not found (return null)
   - Network errors (propagate)
   - Empty arrays for list queries
   - Proper date serialization/deserialization
   - Set/Array conversions for permissions

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```typescript
// src/infrastructure/repositories/user.repository.ts
[Complete code here]
```

```typescript
// src/infrastructure/repositories/project.repository.ts
[Complete code here]
```

... (continue for all 9 files)

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
