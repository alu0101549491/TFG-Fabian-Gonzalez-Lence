# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → **Application Layer** (current) → Infrastructure Layer → Presentation Layer

**Current module:** Application Layer - Service Implementations

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/
│   │   ├── dto/
│   │   │   ├── index.ts                    # ✅ Already implemented
│   │   │   ├── auth-result.dto.ts          # ✅ Already implemented
│   │   │   ├── backup-result.dto.ts        # ✅ Already implemented
│   │   │   ├── export-filters.dto.ts       # ✅ Already implemented
│   │   │   ├── export-result.dto.ts        # ✅ Already implemented
│   │   │   ├── file-data.dto.ts            # ✅ Already implemented
│   │   │   ├── message-data.dto.ts         # ✅ Already implemented
│   │   │   ├── project-data.dto.ts         # ✅ Already implemented
│   │   │   ├── project-details.dto.ts      # ✅ Already implemented
│   │   │   ├── task-data.dto.ts            # ✅ Already implemented
│   │   │   └── validation-result.dto.ts    # ✅ Already implemented
│   │   ├── interfaces/
│   │   │   ├── index.ts                    # ✅ Already implemented
│   │   │   ├── authentication-service.interface.ts   # ✅ Already implemented
│   │   │   ├── authorization-service.interface.ts    # ✅ Already implemented
│   │   │   ├── backup-service.interface.ts           # ✅ Already implemented
│   │   │   ├── export-service.interface.ts           # ✅ Already implemented
│   │   │   ├── file-service.interface.ts             # ✅ Already implemented
│   │   │   ├── message-service.interface.ts          # ✅ Already implemented
│   │   │   ├── notification-service.interface.ts     # ✅ Already implemented
│   │   │   ├── project-service.interface.ts          # ✅ Already implemented
│   │   │   └── task-service.interface.ts             # ✅ Already implemented
│   │   ├── services/
│   │   │   ├── index.ts                    # 🎯 TO IMPLEMENT
│   │   │   ├── authentication.service.ts   # 🎯 TO IMPLEMENT
│   │   │   ├── authorization.service.ts    # 🎯 TO IMPLEMENT
│   │   │   ├── backup.service.ts           # 🎯 TO IMPLEMENT
│   │   │   ├── export.service.ts           # 🎯 TO IMPLEMENT
│   │   │   ├── file.service.ts             # 🎯 TO IMPLEMENT
│   │   │   ├── message.service.ts          # 🎯 TO IMPLEMENT
│   │   │   ├── notification.service.ts     # 🎯 TO IMPLEMENT
│   │   │   ├── project.service.ts          # 🎯 TO IMPLEMENT
│   │   │   └── task.service.ts             # 🎯 TO IMPLEMENT
│   │   └── index.ts
│   ├── domain/
│   │   ├── entities/                       # ✅ Already implemented
│   │   ├── enumerations/                   # ✅ Already implemented
│   │   ├── repositories/                   # ✅ Already implemented
│   │   ├── value-objects/                  # ✅ Already implemented
│   │   └── index.ts
│   ├── infrastructure/
│   │   ├── external-services/
│   │   │   ├── dropbox.service.ts          # Will be implemented later
│   │   │   └── whatsapp.gateway.ts         # Will be implemented later
│   │   ├── repositories/                   # Will be implemented later
│   │   └── ...
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification (Relevant Sections)

### Authentication Logic (Section 7, NFR7)
- Passwords hashed with bcrypt (salt rounds ≥10)
- JWT tokens with 24-hour expiration
- Refresh tokens for secure renewal
- Account lockout after 5 failed login attempts
- Automatic session closure after 30 minutes of inactivity

### Authorization Logic (Section 8)
**Administrator:**
- Full access to all operations
- Can create/edit/delete any project
- Can manage all users and permissions

**Client:**
- View only assigned projects
- Create tasks only for Administrator
- Modify tasks in their projects
- Delete only tasks they created
- Send/receive messages in their projects
- Upload/download files in their projects

**Special User:**
- Access based on configured permissions per project
- Permissions: VIEW, DOWNLOAD, EDIT, DELETE, UPLOAD, SEND_MESSAGE

### Project Business Logic (Section 9, FR1-FR6, FR24-FR25)
- Project code must be unique (format: CART-YYYY-NNN)
- Delivery date must be >= contract date
- When creating project, create Dropbox folder structure
- Project can be finalized when no pending tasks exist
- Finalized projects are read-only (historical)

### Task Business Logic (Section 10, FR7-FR14)
**Bidirectional Assignment Rules:**
- Administrator can assign tasks to any user
- Client can only assign tasks to Administrator
- Special User cannot create tasks

**Status Transition Rules:**
```
PENDING → IN_PROGRESS, PARTIAL, PERFORMED
IN_PROGRESS → PENDING, PARTIAL, PERFORMED
PARTIAL → PENDING, IN_PROGRESS, PERFORMED
PERFORMED → COMPLETED (only by task creator/recipient confirmation)
COMPLETED → (terminal state)
```

**Task Confirmation Flow:**
- When assignee marks task as PERFORMED, creator must confirm
- Creator can confirm (→ COMPLETED) or reject (→ PENDING with feedback)

### Message Business Logic (Section 11, FR15-FR17)
- Messages are per-project channels
- All project participants can view messages
- Track read status per user
- System messages for automated notifications

### Notification Business Logic (Section 13, FR20-FR21)
- In-app notifications for all events
- WhatsApp notifications optional (user preference)
- WhatsApp rate limit: max 1 per 30 minutes per project
- Notification types: NEW_MESSAGE, NEW_TASK, TASK_STATUS_CHANGE, FILE_RECEIVED, PROJECT_ASSIGNED, PROJECT_FINALIZED

### File Business Logic (Section 12, FR18-FR19)
- Max file size: 50MB
- Supported formats: PDF, KML, SHP, images, documents, spreadsheets
- Files stored in Dropbox, metadata in database
- Generate temporary signed URLs for downloads

## 2. Service Interfaces (Already Implemented)

The service implementations must implement the following interfaces:

```typescript
// IAuthenticationService
login(credentials: LoginCredentialsDto): Promise<AuthResultDto>
logout(userId: string): Promise<void>
validateSession(token: string): Promise<SessionDto>
refreshSession(refreshToken: string): Promise<AuthResultDto>
changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ValidationResultDto>

// IAuthorizationService
canAccessProject(userId: string, projectId: string): Promise<boolean>
canModifyProject(userId: string, projectId: string): Promise<boolean>
canCreateTaskInProject(userId: string, projectId: string): Promise<boolean>
canModifyTask(userId: string, taskId: string): Promise<boolean>
canDeleteTask(userId: string, taskId: string): Promise<boolean>
canConfirmTask(userId: string, taskId: string): Promise<boolean>
// ... (all methods from interface)

// IProjectService
createProject(data: CreateProjectDto, creatorId: string): Promise<ProjectDto>
updateProject(data: UpdateProjectDto, userId: string): Promise<ProjectDto>
deleteProject(projectId: string, userId: string): Promise<void>
getProjectById(projectId: string, userId: string): Promise<ProjectDetailsDto>
// ... (all methods from interface)

// ITaskService
createTask(data: CreateTaskDto, creatorId: string): Promise<TaskDto>
updateTask(data: UpdateTaskDto, userId: string): Promise<TaskDto>
changeTaskStatus(data: ChangeTaskStatusDto, userId: string): Promise<TaskDto>
confirmTask(data: ConfirmTaskDto, userId: string): Promise<TaskDto>
// ... (all methods from interface)

// IMessageService
sendMessage(data: CreateMessageDto, senderId: string): Promise<MessageDto>
getMessagesByProject(projectId: string, userId: string, filters?: MessageFilterDto): Promise<MessageListResponseDto>
markMessageAsRead(messageId: string, userId: string): Promise<void>
// ... (all methods from interface)

// INotificationService
sendNotification(userId: string, type: NotificationType, title: string, message: string, relatedEntityId?: string): Promise<void>
sendViaWhatsApp(userId: string, message: string): Promise<boolean>
// ... (all methods from interface)

// IFileService
uploadFile(data: UploadFileDto, userId: string): Promise<FileUploadResultDto>
downloadFile(fileId: string, userId: string): Promise<FileDownloadResultDto>
validateFile(data: UploadFileDto): Promise<ValidationResultDto>
// ... (all methods from interface)

// IExportService
exportProjects(filters: ExportFiltersDto, userId: string): Promise<ExportResultDto>
exportTasks(filters: ExportFiltersDto, userId: string): Promise<ExportResultDto>
// ... (all methods from interface)

// IBackupService
createBackup(userId: string, description?: string): Promise<BackupResultDto>
restoreBackup(data: RestoreBackupDto, userId: string): Promise<RestoreResultDto>
// ... (all methods from interface)
```

## 3. Repository Interfaces (Dependencies)

Services will depend on these repository interfaces:

```typescript
// From domain/repositories
IUserRepository
IProjectRepository
ITaskRepository
ITaskHistoryRepository
IMessageRepository
INotificationRepository
IFileRepository
IPermissionRepository
```

## 4. External Service Interfaces (Dependencies)

Services will depend on these infrastructure interfaces:

```typescript
// From infrastructure/external-services
interface IDropboxService {
  createProjectFolder(projectCode: string): Promise<string>;
  uploadFile(filePath: string, content: ArrayBuffer): Promise<string>;
  downloadFile(filePath: string): Promise<ArrayBuffer>;
  deleteFile(filePath: string): Promise<void>;
  generateShareLink(filePath: string, expiresInSeconds?: number): Promise<string>;
}

interface IWhatsAppGateway {
  sendMessage(phoneNumber: string, message: string): Promise<boolean>;
  isConfigured(): boolean;
}
```

---

# SPECIFIC TASK

Implement all Service classes for the Application Layer. These classes contain the business logic and orchestrate operations between repositories, external services, and domain entities.

## Files to implement:

### 1. **authentication.service.ts**

**Responsibilities:**
- Implement user authentication logic
- Handle JWT token generation and validation
- Manage login attempts and account lockout
- Support password change and reset

**Dependencies:**
```typescript
constructor(
  private readonly userRepository: IUserRepository,
  private readonly passwordHasher: IPasswordHasher,
  private readonly tokenService: ITokenService
)
```

**Key Implementation Details:**

```typescript
class AuthenticationService implements IAuthenticationService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly TOKEN_EXPIRY_HOURS = 24;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;
  
  async login(credentials: LoginCredentialsDto): Promise<AuthResultDto> {
    // 1. Find user by email
    // 2. Check if account is locked (failed attempts >= 5)
    // 3. Verify password hash
    // 4. If failed: increment failed attempts, return error
    // 5. If success: clear failed attempts, generate tokens
    // 6. Update lastLogin timestamp
    // 7. Return AuthResultDto with tokens and user info
  }
  
  async validateSession(token: string): Promise<SessionDto> {
    // 1. Decode JWT token
    // 2. Verify signature and expiration
    // 3. Check if user still exists and is active
    // 4. Return session info
  }
  
  async refreshSession(refreshToken: string): Promise<AuthResultDto> {
    // 1. Validate refresh token
    // 2. Generate new access token
    // 3. Optionally rotate refresh token
    // 4. Return new AuthResultDto
  }
}
```

**Helper Interfaces to Define:**
```typescript
interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

interface ITokenService {
  generateAccessToken(userId: string, role: UserRole): string;
  generateRefreshToken(userId: string): string;
  verifyAccessToken(token: string): TokenPayload | null;
  verifyRefreshToken(token: string): RefreshTokenPayload | null;
}

interface TokenPayload {
  userId: string;
  role: UserRole;
  exp: number;
  iat: number;
}
```

---

### 2. **authorization.service.ts**

**Responsibilities:**
- Implement permission checking logic
- Enforce role-based access control
- Handle Special User configurable permissions

**Dependencies:**
```typescript
constructor(
  private readonly userRepository: IUserRepository,
  private readonly projectRepository: IProjectRepository,
  private readonly taskRepository: ITaskRepository,
  private readonly permissionRepository: IPermissionRepository,
  private readonly fileRepository: IFileRepository
)
```

**Key Implementation Details:**

```typescript
class AuthorizationService implements IAuthorizationService {
  
  async canAccessProject(userId: string, projectId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;
    
    // Admin can access all
    if (user.role === UserRole.ADMINISTRATOR) return true;
    
    const project = await this.projectRepository.findById(projectId);
    if (!project) return false;
    
    // Client can access if assigned
    if (user.role === UserRole.CLIENT) {
      return project.clientId === userId;
    }
    
    // Special User can access if linked with VIEW permission
    if (user.role === UserRole.SPECIAL_USER) {
      const permission = await this.permissionRepository.findByUserAndProject(userId, projectId);
      return permission !== null && permission.hasRight(AccessRight.VIEW);
    }
    
    return false;
  }
  
  async canDeleteTask(userId: string, taskId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;
    
    // Admin can delete any task
    if (user.role === UserRole.ADMINISTRATOR) return true;
    
    const task = await this.taskRepository.findById(taskId);
    if (!task) return false;
    
    // Client can only delete tasks they created
    if (user.role === UserRole.CLIENT) {
      return task.creatorId === userId;
    }
    
    // Special User cannot delete tasks
    return false;
  }
  
  async canAssignTaskTo(userId: string, projectId: string, assigneeId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;
    
    // Admin can assign to anyone
    if (user.role === UserRole.ADMINISTRATOR) return true;
    
    // Client can only assign to Admin
    if (user.role === UserRole.CLIENT) {
      const assignee = await this.userRepository.findById(assigneeId);
      return assignee?.role === UserRole.ADMINISTRATOR;
    }
    
    // Special User cannot create tasks
    return false;
  }
  
  // ... implement all other methods following permission matrix
}
```

---

### 3. **project.service.ts**

**Responsibilities:**
- Implement project CRUD operations
- Handle project assignment and participant management
- Manage project lifecycle (active → finalized)
- Coordinate with Dropbox for folder creation

**Dependencies:**
```typescript
constructor(
  private readonly projectRepository: IProjectRepository,
  private readonly userRepository: IUserRepository,
  private readonly taskRepository: ITaskRepository,
  private readonly messageRepository: IMessageRepository,
  private readonly fileRepository: IFileRepository,
  private readonly permissionRepository: IPermissionRepository,
  private readonly authorizationService: IAuthorizationService,
  private readonly notificationService: INotificationService,
  private readonly dropboxService: IDropboxService
)
```

**Key Implementation Details:**

```typescript
class ProjectService implements IProjectService {
  
  async createProject(data: CreateProjectDto, creatorId: string): Promise<ProjectDto> {
    // 1. Verify creator is admin
    if (!await this.authorizationService.isAdmin(creatorId)) {
      throw new UnauthorizedError('Only administrators can create projects');
    }
    
    // 2. Validate project data
    const validation = await this.validateProjectData(data);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // 3. Check code uniqueness
    if (await this.projectRepository.existsByCode(data.code)) {
      throw new ConflictError('Project code already exists');
    }
    
    // 4. Create Dropbox folder structure
    const dropboxFolderId = await this.dropboxService.createProjectFolder(data.code);
    
    // 5. Create project entity
    const project = new Project({
      id: generateId(),
      ...data,
      dropboxFolderId,
      status: ProjectStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // 6. Save to repository
    const savedProject = await this.projectRepository.save(project);
    
    // 7. Notify assigned client
    await this.notificationService.sendNotification(
      data.clientId,
      NotificationType.PROJECT_ASSIGNED,
      'New Project Assigned',
      `You have been assigned to project ${data.code}: ${data.name}`,
      savedProject.id
    );
    
    // 8. Return DTO
    return this.mapToProjectDto(savedProject);
  }
  
  async getProjectById(projectId: string, userId: string): Promise<ProjectDetailsDto> {
    // 1. Check access permission
    if (!await this.authorizationService.canAccessProject(userId, projectId)) {
      throw new UnauthorizedError('Access denied to this project');
    }
    
    // 2. Get project with all related data
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    // 3. Get tasks, messages, participants, files
    const tasks = await this.taskRepository.findByProjectId(projectId);
    const messages = await this.messageRepository.findByProjectIdPaginated(projectId, 10, 0);
    const participants = await this.getProjectParticipants(projectId, userId);
    const unreadCount = await this.messageRepository.countUnreadByProjectAndUser(projectId, userId);
    
    // 4. Calculate permissions for current user
    const permissions = await this.calculateUserPermissions(userId, projectId);
    
    // 5. Build and return ProjectDetailsDto
    return this.mapToProjectDetailsDto(project, tasks, messages, participants, unreadCount, permissions);
  }
  
  async finalizeProject(projectId: string, adminId: string): Promise<void> {
    // 1. Verify admin permission
    if (!await this.authorizationService.canFinalizeProject(adminId, projectId)) {
      throw new UnauthorizedError('Only administrators can finalize projects');
    }
    
    // 2. Check no pending tasks
    const pendingCount = await this.taskRepository.countPendingByProjectId(projectId);
    if (pendingCount > 0) {
      throw new BusinessRuleError(`Cannot finalize project with ${pendingCount} pending tasks`);
    }
    
    // 3. Update project status
    const project = await this.projectRepository.findById(projectId);
    project.finalize();
    await this.projectRepository.update(project);
    
    // 4. Notify all participants
    const participants = await this.getProjectParticipants(projectId, adminId);
    await this.notificationService.sendBulkNotifications(
      participants.map(p => p.userId),
      NotificationType.PROJECT_FINALIZED,
      'Project Finalized',
      `Project ${project.code} has been marked as finalized`,
      projectId
    );
  }
  
  // ... implement all other methods
}
```

---

### 4. **task.service.ts**

**Responsibilities:**
- Implement task CRUD operations
- Handle bidirectional task assignment rules
- Manage 5-state task workflow
- Implement task confirmation flow
- Record task history

**Dependencies:**
```typescript
constructor(
  private readonly taskRepository: ITaskRepository,
  private readonly taskHistoryRepository: ITaskHistoryRepository,
  private readonly projectRepository: IProjectRepository,
  private readonly userRepository: IUserRepository,
  private readonly authorizationService: IAuthorizationService,
  private readonly notificationService: INotificationService
)
```

**Key Implementation Details:**

```typescript
class TaskService implements ITaskService {
  
  private readonly VALID_TRANSITIONS: Map<TaskStatus, TaskStatus[]> = new Map([
    [TaskStatus.PENDING, [TaskStatus.IN_PROGRESS, TaskStatus.PARTIAL, TaskStatus.PERFORMED]],
    [TaskStatus.IN_PROGRESS, [TaskStatus.PENDING, TaskStatus.PARTIAL, TaskStatus.PERFORMED]],
    [TaskStatus.PARTIAL, [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.PERFORMED]],
    [TaskStatus.PERFORMED, [TaskStatus.COMPLETED, TaskStatus.PENDING]], // PENDING for rejection
    [TaskStatus.COMPLETED, []], // Terminal state
  ]);
  
  async createTask(data: CreateTaskDto, creatorId: string): Promise<TaskDto> {
    // 1. Verify creator can create tasks in project
    if (!await this.authorizationService.canCreateTaskInProject(creatorId, data.projectId)) {
      throw new UnauthorizedError('You cannot create tasks in this project');
    }
    
    // 2. Verify assignment rules
    if (!await this.authorizationService.canAssignTaskTo(creatorId, data.projectId, data.assigneeId)) {
      throw new UnauthorizedError('You cannot assign tasks to this user');
    }
    
    // 3. Validate task data
    const validation = await this.validateTaskData(data);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // 4. Create task entity
    const task = new Task({
      id: generateId(),
      ...data,
      creatorId,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // 5. Save task
    const savedTask = await this.taskRepository.save(task);
    
    // 6. Record history
    await this.taskHistoryRepository.save(
      TaskHistory.createStatusChange(savedTask.id, creatorId, null, TaskStatus.PENDING)
    );
    
    // 7. Notify assignee
    const creator = await this.userRepository.findById(creatorId);
    await this.notificationService.sendNotification(
      data.assigneeId,
      NotificationType.NEW_TASK,
      'New Task Assigned',
      `${creator.username} assigned you a task: ${data.description.substring(0, 50)}...`,
      savedTask.id
    );
    
    // 8. Return DTO
    return this.mapToTaskDto(savedTask);
  }
  
  async changeTaskStatus(data: ChangeTaskStatusDto, userId: string): Promise<TaskDto> {
    // 1. Get task
    const task = await this.taskRepository.findById(data.taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    
    // 2. Check permission
    if (!await this.authorizationService.canChangeTaskStatus(userId, data.taskId, data.newStatus)) {
      throw new UnauthorizedError('You cannot change this task status');
    }
    
    // 3. Validate transition
    if (!this.isValidTransition(task.status, data.newStatus)) {
      throw new BusinessRuleError(
        `Invalid status transition from ${task.status} to ${data.newStatus}`
      );
    }
    
    // 4. Update task
    const previousStatus = task.status;
    task.changeStatus(data.newStatus, userId);
    
    // 5. Handle special cases
    if (data.newStatus === TaskStatus.PERFORMED) {
      task.completedAt = new Date();
    } else if (data.newStatus === TaskStatus.COMPLETED) {
      task.confirmedAt = new Date();
    }
    
    // 6. Save task
    await this.taskRepository.update(task);
    
    // 7. Record history
    await this.taskHistoryRepository.save(
      TaskHistory.createStatusChange(task.id, userId, previousStatus, data.newStatus)
    );
    
    // 8. Notify relevant users
    await this.notifyStatusChange(task, previousStatus, data.newStatus, userId);
    
    // 9. Return updated DTO
    return this.mapToTaskDto(task);
  }
  
  async confirmTask(data: ConfirmTaskDto, userId: string): Promise<TaskDto> {
    // 1. Get task
    const task = await this.taskRepository.findById(data.taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    
    // 2. Verify user can confirm (must be task creator)
    if (!await this.authorizationService.canConfirmTask(userId, data.taskId)) {
      throw new UnauthorizedError('Only the task creator can confirm completion');
    }
    
    // 3. Verify task is in PERFORMED status
    if (task.status !== TaskStatus.PERFORMED) {
      throw new BusinessRuleError('Task must be in PERFORMED status to confirm');
    }
    
    // 4. Handle confirmation or rejection
    if (data.confirmed) {
      task.changeStatus(TaskStatus.COMPLETED, userId);
      task.confirmedAt = new Date();
      
      await this.notificationService.sendNotification(
        task.assigneeId,
        NotificationType.TASK_STATUS_CHANGE,
        'Task Confirmed',
        `Your task "${task.description.substring(0, 50)}..." has been confirmed as completed`,
        task.id
      );
    } else {
      // Rejection - back to PENDING
      task.changeStatus(TaskStatus.PENDING, userId);
      task.completedAt = null;
      
      await this.notificationService.sendNotification(
        task.assigneeId,
        NotificationType.TASK_STATUS_CHANGE,
        'Task Returned',
        `Your task has been returned with feedback: ${data.feedback || 'No feedback provided'}`,
        task.id
      );
    }
    
    // 5. Save and return
    await this.taskRepository.update(task);
    await this.taskHistoryRepository.save(
      TaskHistory.createStatusChange(task.id, userId, TaskStatus.PERFORMED, task.status)
    );
    
    return this.mapToTaskDto(task);
  }
  
  private isValidTransition(currentStatus: TaskStatus, newStatus: TaskStatus): boolean {
    const allowed = this.VALID_TRANSITIONS.get(currentStatus) || [];
    return allowed.includes(newStatus);
  }
  
  // ... implement all other methods
}
```

---

### 5. **message.service.ts**

**Responsibilities:**
- Implement message sending and retrieval
- Track read status per user
- Generate system messages
- Coordinate file attachments

**Dependencies:**
```typescript
constructor(
  private readonly messageRepository: IMessageRepository,
  private readonly projectRepository: IProjectRepository,
  private readonly userRepository: IUserRepository,
  private readonly fileRepository: IFileRepository,
  private readonly authorizationService: IAuthorizationService,
  private readonly notificationService: INotificationService
)
```

**Key Implementation Details:**

```typescript
class MessageService implements IMessageService {
  
  async sendMessage(data: CreateMessageDto, senderId: string): Promise<MessageDto> {
    // 1. Check permission
    if (!await this.authorizationService.canSendMessage(senderId, data.projectId)) {
      throw new UnauthorizedError('You cannot send messages in this project');
    }
    
    // 2. Validate content
    if (!data.content || data.content.trim().length === 0) {
      throw new ValidationError([{ field: 'content', message: 'Message content is required' }]);
    }
    
    if (data.content.length > 5000) {
      throw new ValidationError([{ field: 'content', message: 'Message exceeds maximum length of 5000 characters' }]);
    }
    
    // 3. Validate file attachments exist
    if (data.fileIds && data.fileIds.length > 0) {
      for (const fileId of data.fileIds) {
        const file = await this.fileRepository.findById(fileId);
        if (!file || file.projectId !== data.projectId) {
          throw new ValidationError([{ field: 'fileIds', message: `Invalid file ID: ${fileId}` }]);
        }
      }
    }
    
    // 4. Create message
    const message = new Message({
      id: generateId(),
      projectId: data.projectId,
      senderId,
      content: data.content.trim(),
      sentAt: new Date(),
      fileIds: data.fileIds || [],
      readByUserIds: [senderId], // Sender has implicitly read their own message
      type: 'NORMAL',
    });
    
    // 5. Save message
    const savedMessage = await this.messageRepository.save(message);
    
    // 6. Notify project participants (except sender)
    const participants = await this.getProjectParticipantIds(data.projectId);
    const recipientIds = participants.filter(id => id !== senderId);
    
    const sender = await this.userRepository.findById(senderId);
    const project = await this.projectRepository.findById(data.projectId);
    
    await this.notificationService.sendBulkNotifications(
      recipientIds,
      NotificationType.NEW_MESSAGE,
      `New message in ${project.code}`,
      `${sender.username}: ${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}`,
      savedMessage.id
    );
    
    // 7. Return DTO
    return this.mapToMessageDto(savedMessage, senderId);
  }
  
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }
    
    // Check access
    if (!await this.authorizationService.canAccessMessages(userId, message.projectId)) {
      throw new UnauthorizedError('Access denied');
    }
    
    // Mark as read
    message.markAsRead(userId);
    await this.messageRepository.update(message);
  }
  
  async createSystemMessage(projectId: string, content: string): Promise<MessageDto> {
    const message = Message.createSystemMessage(projectId, content);
    const savedMessage = await this.messageRepository.save(message);
    return this.mapToMessageDto(savedMessage, 'SYSTEM');
  }
  
  // ... implement all other methods
}
```

---

### 6. **notification.service.ts**

**Responsibilities:**
- Implement notification sending (in-app and WhatsApp)
- Manage user notification preferences
- Enforce WhatsApp rate limiting
- Clean up old notifications

**Dependencies:**
```typescript
constructor(
  private readonly notificationRepository: INotificationRepository,
  private readonly userRepository: IUserRepository,
  private readonly whatsAppGateway: IWhatsAppGateway
)
```

**Key Implementation Details:**

```typescript
class NotificationService implements INotificationService {
  
  private readonly WHATSAPP_RATE_LIMIT_MINUTES = 30;
  private whatsAppLastSent: Map<string, Date> = new Map(); // projectId -> lastSentTime
  
  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId?: string
  ): Promise<void> {
    // 1. Check user preferences
    const preferences = await this.getUserNotificationPreferences(userId);
    if (!preferences.inAppEnabled) {
      return; // User has disabled notifications
    }
    
    // 2. Check if this type is enabled
    if (!this.isNotificationTypeEnabled(type, preferences)) {
      return;
    }
    
    // 3. Create in-app notification
    const notification = new Notification({
      id: generateId(),
      userId,
      type,
      title,
      message,
      relatedEntityId: relatedEntityId || null,
      createdAt: new Date(),
      isRead: false,
      sentViaWhatsApp: false,
    });
    
    await this.notificationRepository.save(notification);
    
    // 4. Send WhatsApp if enabled and appropriate
    if (preferences.whatsAppEnabled && this.shouldSendWhatsApp(type)) {
      const user = await this.userRepository.findById(userId);
      if (user?.phone && this.canSendWhatsApp(relatedEntityId || userId)) {
        const sent = await this.sendViaWhatsApp(userId, `${title}\n\n${message}`);
        if (sent) {
          notification.markAsSentViaWhatsApp();
          await this.notificationRepository.update(notification);
          this.recordWhatsAppSent(relatedEntityId || userId);
        }
      }
    }
  }
  
  async sendViaWhatsApp(userId: string, message: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user?.phone || !user.whatsappEnabled) {
      return false;
    }
    
    try {
      return await this.whatsAppGateway.sendMessage(user.phone, message);
    } catch (error) {
      console.error('WhatsApp send failed:', error);
      return false;
    }
  }
  
  private canSendWhatsApp(rateLimitKey: string): boolean {
    const lastSent = this.whatsAppLastSent.get(rateLimitKey);
    if (!lastSent) return true;
    
    const minutesSinceLast = (Date.now() - lastSent.getTime()) / (1000 * 60);
    return minutesSinceLast >= this.WHATSAPP_RATE_LIMIT_MINUTES;
  }
  
  private recordWhatsAppSent(rateLimitKey: string): void {
    this.whatsAppLastSent.set(rateLimitKey, new Date());
  }
  
  // ... implement all other methods
}
```

---

### 7. **file.service.ts**

**Responsibilities:**
- Implement file upload/download via Dropbox
- Validate file types and sizes
- Generate secure download URLs
- Manage file metadata

**Dependencies:**
```typescript
constructor(
  private readonly fileRepository: IFileRepository,
  private readonly projectRepository: IProjectRepository,
  private readonly authorizationService: IAuthorizationService,
  private readonly notificationService: INotificationService,
  private readonly dropboxService: IDropboxService
)
```

**Key Implementation Details:**

```typescript
class FileService implements IFileService {
  
  private readonly MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
  private readonly SUPPORTED_FORMATS = [
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.rtf',
    // Cartography
    '.kml', '.kmz', '.shp', '.shx', '.dbf', '.prj',
    // Images
    '.jpg', '.jpeg', '.png', '.tiff', '.gif', '.webp',
    // Spreadsheets
    '.xls', '.xlsx', '.csv',
    // CAD
    '.dwg', '.dxf',
    // Compressed
    '.zip', '.rar',
  ];
  
  async uploadFile(data: UploadFileDto, userId: string): Promise<FileUploadResultDto> {
    try {
      // 1. Check permission
      if (!await this.authorizationService.canUploadFile(userId, data.projectId)) {
        return {
          success: false,
          file: null,
          error: 'Permission denied',
          errorCode: FileErrorCode.PERMISSION_DENIED,
        };
      }
      
      // 2. Validate file
      const validation = await this.validateFile(data);
      if (!validation.isValid) {
        return {
          success: false,
          file: null,
          error: validation.errors[0].message,
          errorCode: validation.errors[0].code as FileErrorCode,
        };
      }
      
      // 3. Determine Dropbox path
      const project = await this.projectRepository.findById(data.projectId);
      const section = data.section || ProjectSection.REPORT_AND_ANNEXES;
      const dropboxPath = `/${project.code}/${section}/${data.name}`;
      
      // 4. Upload to Dropbox
      const uploadedPath = await this.dropboxService.uploadFile(
        dropboxPath,
        data.content as ArrayBuffer
      );
      
      // 5. Create file metadata
      const file = new File({
        id: generateId(),
        name: data.name,
        dropboxPath: uploadedPath,
        type: File.determineFileType(data.name),
        sizeInBytes: (data.content as ArrayBuffer).byteLength,
        uploadedBy: userId,
        uploadedAt: new Date(),
        projectId: data.projectId,
        taskId: data.taskId || null,
        messageId: data.messageId || null,
      });
      
      const savedFile = await this.fileRepository.save(file);
      
      // 6. Notify project participants
      const user = await this.userRepository.findById(userId);
      await this.notifyFileUploaded(savedFile, user.username);
      
      // 7. Return success result
      return {
        success: true,
        file: await this.mapToFileDto(savedFile),
        error: null,
        errorCode: null,
      };
      
    } catch (error) {
      return {
        success: false,
        file: null,
        error: 'File upload failed',
        errorCode: FileErrorCode.UPLOAD_FAILED,
      };
    }
  }
  
  async validateFile(data: UploadFileDto): Promise<ValidationResultDto> {
    const errors: ValidationErrorDto[] = [];
    
    // Check size
    const size = (data.content as ArrayBuffer).byteLength;
    if (size > this.MAX_FILE_SIZE_BYTES) {
      errors.push({
        field: 'content',
        message: `File size ${this.formatBytes(size)} exceeds maximum allowed ${this.formatBytes(this.MAX_FILE_SIZE_BYTES)}`,
        code: ValidationErrorCode.TOO_LARGE,
      });
    }
    
    // Check format
    const extension = this.getExtension(data.name).toLowerCase();
    if (!this.SUPPORTED_FORMATS.includes(extension)) {
      errors.push({
        field: 'name',
        message: `File format ${extension} is not supported`,
        code: ValidationErrorCode.INVALID_FORMAT,
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  async generateDownloadUrl(fileId: string, userId: string, expiresInSeconds = 3600): Promise<string> {
    // 1. Check permission
    if (!await this.authorizationService.canDownloadFile(userId, fileId)) {
      throw new UnauthorizedError('Permission denied');
    }
    
    // 2. Get file
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      throw new NotFoundError('File not found');
    }
    
    // 3. Generate signed URL from Dropbox
    return await this.dropboxService.generateShareLink(file.dropboxPath, expiresInSeconds);
  }
  
  // ... implement all other methods
}
```

---

### 8. **export.service.ts**

**Responsibilities:**
- Implement data export to CSV, PDF, Excel
- Apply filters to exported data
- Handle large exports asynchronously
- Generate downloadable files

**Dependencies:**
```typescript
constructor(
  private readonly projectRepository: IProjectRepository,
  private readonly taskRepository: ITaskRepository,
  private readonly userRepository: IUserRepository,
  private readonly authorizationService: IAuthorizationService,
  private readonly csvGenerator: ICSVGenerator,
  private readonly pdfGenerator: IPDFGenerator,
  private readonly excelGenerator: IExcelGenerator
)
```

**Key Implementation Details:**

```typescript
class ExportService implements IExportService {
  
  private readonly SYNC_EXPORT_LIMIT = 1000;
  
  async exportProjects(filters: ExportFiltersDto, userId: string): Promise<ExportResultDto> {
    // 1. Check permission (admin only)
    if (!await this.authorizationService.canExportData(userId)) {
      throw new UnauthorizedError('Only administrators can export data');
    }
    
    // 2. Validate filters
    const validation = await this.validateExportFilters(filters);
    if (!validation.isValid) {
      return {
        success: false,
        status: ExportStatus.FAILED,
        format: filters.format,
        recordCount: 0,
        requestedAt: new Date(),
        error: validation.errors[0].message,
        errorCode: ExportErrorCode.INVALID_FILTERS,
      };
    }
    
    // 3. Fetch data with filters
    const projects = await this.fetchProjectsWithFilters(filters);
    
    if (projects.length === 0) {
      return {
        success: false,
        status: ExportStatus.FAILED,
        format: filters.format,
        recordCount: 0,
        requestedAt: new Date(),
        error: 'No data matches the specified filters',
        errorCode: ExportErrorCode.NO_DATA,
      };
    }
    
    // 4. Generate export file based on format
    let fileContent: Buffer;
    let filename: string;
    
    switch (filters.format) {
      case ExportFormat.CSV:
        fileContent = await this.csvGenerator.generate(projects);
        filename = `projects_export_${Date.now()}.csv`;
        break;
      case ExportFormat.PDF:
        fileContent = await this.pdfGenerator.generate(projects);
        filename = `projects_export_${Date.now()}.pdf`;
        break;
      case ExportFormat.EXCEL:
        fileContent = await this.excelGenerator.generate(projects);
        filename = `projects_export_${Date.now()}.xlsx`;
        break;
    }
    
    // 5. Store file temporarily and generate download URL
    const downloadUrl = await this.storeExportFile(fileContent, filename);
    
    // 6. Return result
    return {
      success: true,
      status: ExportStatus.COMPLETED,
      downloadUrl,
      filename,
      format: filters.format,
      recordCount: projects.length,
      fileSize: fileContent.byteLength,
      requestedAt: new Date(),
      completedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }
  
  // ... implement all other methods
}
```

---

### 9. **backup.service.ts**

**Responsibilities:**
- Implement database backup creation
- Handle backup restoration
- Manage backup schedule
- Track backup history

**Dependencies:**
```typescript
constructor(
  private readonly backupRepository: IBackupRepository,
  private readonly authorizationService: IAuthorizationService,
  private readonly databaseService: IDatabaseService,
  private readonly storageService: IStorageService
)
```

**Key Implementation Details:**

```typescript
class BackupService implements IBackupService {
  
  async createBackup(userId: string, description?: string): Promise<BackupResultDto> {
    // 1. Check permission (admin only)
    if (!await this.authorizationService.canManageBackups(userId)) {
      throw new UnauthorizedError('Only administrators can create backups');
    }
    
    try {
      // 2. Create backup
      const backupId = generateId();
      const timestamp = new Date();
      
      // 3. Export database data
      const data = await this.databaseService.exportAllData();
      
      // 4. Store backup file
      const backupPath = `backups/${backupId}_${timestamp.toISOString()}.json`;
      const compressedData = await this.compress(JSON.stringify(data));
      await this.storageService.store(backupPath, compressedData);
      
      // 5. Save backup metadata
      const backup = {
        id: backupId,
        type: BackupType.MANUAL,
        status: BackupStatus.COMPLETED,
        timestamp,
        sizeInBytes: compressedData.byteLength,
        createdBy: userId,
        description: description || null,
        recordCounts: {
          users: data.users.length,
          projects: data.projects.length,
          tasks: data.tasks.length,
          messages: data.messages.length,
          files: data.files.length,
          notifications: data.notifications.length,
        },
      };
      
      await this.backupRepository.save(backup);
      
      // 6. Return result
      return {
        success: true,
        status: BackupStatus.COMPLETED,
        backupId,
        type: BackupType.MANUAL,
        timestamp,
        sizeInBytes: compressedData.byteLength,
        humanReadableSize: this.formatBytes(compressedData.byteLength),
        recordCounts: backup.recordCounts,
      };
      
    } catch (error) {
      return {
        success: false,
        status: BackupStatus.FAILED,
        type: BackupType.MANUAL,
        error: 'Backup creation failed',
        errorCode: BackupErrorCode.DATABASE_ERROR,
      };
    }
  }
  
  async restoreBackup(data: RestoreBackupDto, userId: string): Promise<RestoreResultDto> {
    // 1. Check permission
    if (!await this.authorizationService.canManageBackups(userId)) {
      throw new UnauthorizedError('Only administrators can restore backups');
    }
    
    // 2. Verify confirmation
    if (!data.confirmRestore) {
      throw new BusinessRuleError('Restore must be explicitly confirmed');
    }
    
    // 3. Get backup
    const backup = await this.backupRepository.findById(data.backupId);
    if (!backup) {
      throw new NotFoundError('Backup not found');
    }
    
    try {
      // 4. Load backup data
      const backupPath = `backups/${backup.id}_${backup.timestamp.toISOString()}.json`;
      const compressedData = await this.storageService.retrieve(backupPath);
      const jsonData = await this.decompress(compressedData);
      const backupData = JSON.parse(jsonData);
      
      // 5. Restore data
      await this.databaseService.restoreAllData(backupData);
      
      // 6. Return result
      return {
        success: true,
        status: BackupStatus.COMPLETED,
        backupId: data.backupId,
        restoredAt: new Date(),
        recordsRestored: backup.recordCounts,
      };
      
    } catch (error) {
      return {
        success: false,
        status: BackupStatus.FAILED,
        backupId: data.backupId,
        error: 'Restore failed',
        errorCode: BackupErrorCode.RESTORE_FAILED,
      };
    }
  }
  
  // ... implement all other methods
}
```

---

### 10. **index.ts** (Barrel Export)

**Responsibilities:**
- Re-export all service classes
- Provide single entry point for application services

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 10
- **Maximum method length:** 50 lines

## Mandatory best practices:
- **SOLID Principles:**
  - Single Responsibility: Each service handles one domain area
  - Open/Closed: Extend via interfaces, not modification
  - Liskov Substitution: Services implement interfaces correctly
  - Interface Segregation: Depend on specific interfaces
  - Dependency Inversion: Depend on abstractions (repositories, interfaces)
- **Dependency Injection:** All dependencies via constructor
- **Error Handling:** Use custom error classes (UnauthorizedError, NotFoundError, ValidationError, BusinessRuleError)
- **Logging:** Log at critical points (login attempts, errors, important operations)
- **Validation:** Validate all inputs before processing

## Error Classes to Define:
```typescript
class UnauthorizedError extends Error { code = 'UNAUTHORIZED'; }
class NotFoundError extends Error { code = 'NOT_FOUND'; }
class ValidationError extends Error { code = 'VALIDATION_ERROR'; errors: ValidationErrorDto[]; }
class BusinessRuleError extends Error { code = 'BUSINESS_RULE_ERROR'; }
class ConflictError extends Error { code = 'CONFLICT'; }
```

## TypeScript patterns:
```typescript
// Service class pattern
export class ProjectService implements IProjectService {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly authorizationService: IAuthorizationService,
    // ... other dependencies
  ) {}
  
  async createProject(data: CreateProjectDto, creatorId: string): Promise<ProjectDto> {
    // Implementation
  }
  
  // Private helper methods
  private mapToProjectDto(project: Project): ProjectDto {
    // Mapping logic
  }
}
```

---

# DELIVERABLES

1. **Complete source code** for all 10 files (9 services + 1 index)

2. **For each service class:**
   - Constructor with dependency injection
   - Implementation of all interface methods
   - JSDoc documentation for public methods
   - Private helper methods as needed
   - Proper error handling with custom error classes
   - Entity-to-DTO mapping methods

3. **Helper utilities to include:**
   - `generateId()`: Generate unique IDs
   - `formatBytes(bytes: number)`: Format file sizes
   - Custom error classes

4. **Edge cases to handle:**
   - Null/undefined inputs
   - Entity not found scenarios
   - Permission denied scenarios
   - Invalid state transitions
   - Concurrent modification handling
   - External service failures (Dropbox, WhatsApp)

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```typescript
// src/application/services/authentication.service.ts
[Complete code here]
```

```typescript
// src/application/services/authorization.service.ts
[Complete code here]
```

... (continue for all 10 files)

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
