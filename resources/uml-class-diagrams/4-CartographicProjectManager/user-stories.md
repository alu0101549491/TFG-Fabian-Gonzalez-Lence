# Initial

Based on the requirements specification you've provided, I'll create a comprehensive UML class diagram following SOLID principles and modular design. This is a project management system with authentication, task management, messaging, and Dropbox integration.

```mermaid
classDiagram
    %% Core Domain Entities
    class User {
        <<entity>>
        -String id
        -String username
        -String email
        -String passwordHash
        -UserRole role
        -DateTime createdAt
        -DateTime lastLogin
        +authenticate(password: String) bool
        +hasPermission(permission: Permission) bool
        +getAssignedProjects() List~Project~
    }

    class UserRole {
        <<enumeration>>
        ADMINISTRATOR
        CLIENT
        SPECIAL_USER
    }

    class Project {
        <<entity>>
        -String id
        -String code
        -String name
        -String clientId
        -ProjectType type
        -DateTime startDate
        -DateTime deliveryDate
        -GeoCoordinates coordinates
        -ProjectStatus status
        -String dropboxFolderId
        -DateTime finalizedAt
        +assignToClient(clientId: String) void
        +addSpecialUser(userId: String, permissions: Set~Permission~) void
        +finalize() void
        +canBeFinalized() bool
        +isAccessibleBy(userId: String) bool
    }

    class ProjectType {
        <<enumeration>>
        RESIDENTIAL
        COMMERCIAL
        INDUSTRIAL
        PUBLIC
    }

    class ProjectStatus {
        <<enumeration>>
        ACTIVE
        IN_PROGRESS
        PENDING_REVIEW
        FINALIZED
    }

    class GeoCoordinates {
        <<value object>>
        -double latitude
        -double longitude
        +isValid() bool
    }

    class Task {
        <<entity>>
        -String id
        -String projectId
        -String creatorId
        -String assigneeId
        -String description
        -TaskStatus status
        -TaskPriority priority
        -DateTime dueDate
        -DateTime createdAt
        -DateTime updatedAt
        -List~String~ fileIds
        +changeStatus(newStatus: TaskStatus, userId: String) void
        +attachFile(fileId: String) void
        +canBeModifiedBy(userId: String) bool
        +canBeDeletedBy(userId: String) bool
        +markAsCompleted(userId: String) void
    }

    class TaskStatus {
        <<enumeration>>
        PENDING
        IN_PROGRESS
        PARTIAL
        PERFORMED
        COMPLETED
    }

    class TaskPriority {
        <<enumeration>>
        LOW
        MEDIUM
        HIGH
        URGENT
    }

    class TaskHistory {
        <<entity>>
        -String id
        -String taskId
        -String userId
        -String action
        -String previousValue
        -String newValue
        -DateTime timestamp
    }

    class Message {
        <<entity>>
        -String id
        -String projectId
        -String senderId
        -String content
        -DateTime sentAt
        -List~String~ fileIds
        -List~String~ readByUserIds
        +markAsRead(userId: String) void
        +isReadBy(userId: String) bool
        +attachFile(fileId: String) void
    }

    class Notification {
        <<entity>>
        -String id
        -String userId
        -NotificationType type
        -String title
        -String message
        -String relatedEntityId
        -DateTime createdAt
        -bool isRead
        -bool sentViaWhatsApp
        +markAsRead() void
        +shouldSendViaWhatsApp() bool
    }

    class NotificationType {
        <<enumeration>>
        NEW_MESSAGE
        NEW_TASK
        TASK_STATUS_CHANGE
        FILE_RECEIVED
        PROJECT_ASSIGNED
        PROJECT_FINALIZED
    }

    class File {
        <<entity>>
        -String id
        -String name
        -String dropboxPath
        -FileType type
        -long sizeInBytes
        -String uploadedBy
        -DateTime uploadedAt
        +isValidFormat() bool
        +isWithinSizeLimit() bool
    }

    class FileType {
        <<enumeration>>
        PDF
        KML
        SHP
        IMAGE
        DOCUMENT
    }

    class Permission {
        <<entity>>
        -String userId
        -String projectId
        -Set~AccessRight~ rights
        +canView() bool
        +canDownload() bool
        +canEdit() bool
    }

    class AccessRight {
        <<enumeration>>
        VIEW
        DOWNLOAD
        EDIT
        DELETE
    }

    %% Application Services Layer
    class IAuthenticationService {
        <<interface>>
        +login(username: String, password: String) AuthResult
        +logout(userId: String) void
        +validateSession(sessionToken: String) bool
        +refreshSession(sessionToken: String) SessionToken
    }

    class AuthenticationService {
        -IUserRepository userRepository
        -ISessionManager sessionManager
        -IPasswordHasher passwordHasher
        +login(username: String, password: String) AuthResult
        +logout(userId: String) void
        +validateSession(sessionToken: String) bool
        +refreshSession(sessionToken: String) SessionToken
    }

    class IProjectService {
        <<interface>>
        +createProject(projectData: ProjectData) Project
        +assignProjectToClient(projectId: String, clientId: String) void
        +addSpecialUserToProject(projectId: String, userId: String, permissions: Set~Permission~) void
        +getProjectsByUser(userId: String) List~Project~
        +finalizeProject(projectId: String) void
        +getProjectDetails(projectId: String, userId: String) ProjectDetails
    }

    class ProjectService {
        -IProjectRepository projectRepository
        -IUserRepository userRepository
        -IDropboxService dropboxService
        -INotificationService notificationService
        -IAuthorizationService authorizationService
        +createProject(projectData: ProjectData) Project
        +assignProjectToClient(projectId: String, clientId: String) void
        +addSpecialUserToProject(projectId: String, userId: String, permissions: Set~Permission~) void
        +getProjectsByUser(userId: String) List~Project~
        +finalizeProject(projectId: String) void
    }

    class ITaskService {
        <<interface>>
        +createTask(taskData: TaskData) Task
        +updateTask(taskId: String, updates: TaskData, userId: String) Task
        +deleteTask(taskId: String, userId: String) void
        +changeTaskStatus(taskId: String, newStatus: TaskStatus, userId: String) void
        +attachFileToTask(taskId: String, fileId: String) void
        +getTasksByProject(projectId: String) List~Task~
    }

    class TaskService {
        -ITaskRepository taskRepository
        -IProjectRepository projectRepository
        -INotificationService notificationService
        -IAuthorizationService authorizationService
        -ITaskHistoryRepository historyRepository
        +createTask(taskData: TaskData) Task
        +updateTask(taskId: String, updates: TaskData, userId: String) Task
        +deleteTask(taskId: String, userId: String) void
        +changeTaskStatus(taskId: String, newStatus: TaskStatus, userId: String) void
    }

    class IMessageService {
        <<interface>>
        +sendMessage(messageData: MessageData) Message
        +getMessagesByProject(projectId: String, userId: String) List~Message~
        +markMessageAsRead(messageId: String, userId: String) void
        +getUnreadMessageCount(projectId: String, userId: String) int
    }

    class MessageService {
        -IMessageRepository messageRepository
        -INotificationService notificationService
        -IAuthorizationService authorizationService
        +sendMessage(messageData: MessageData) Message
        +getMessagesByProject(projectId: String, userId: String) List~Message~
        +markMessageAsRead(messageId: String, userId: String) void
    }

    class INotificationService {
        <<interface>>
        +sendNotification(notification: Notification) void
        +getNotificationsByUser(userId: String) List~Notification~
        +markAsRead(notificationId: String) void
        +sendViaWhatsApp(notification: Notification) void
    }

    class NotificationService {
        -INotificationRepository notificationRepository
        -IWhatsAppGateway whatsAppGateway
        +sendNotification(notification: Notification) void
        +getNotificationsByUser(userId: String) List~Notification~
        +markAsRead(notificationId: String) void
    }

    class IFileService {
        <<interface>>
        +uploadFile(fileData: FileData, projectId: String) File
        +downloadFile(fileId: String, userId: String) FileStream
        +validateFile(fileData: FileData) ValidationResult
        +deleteFile(fileId: String, userId: String) void
    }

    class FileService {
        -IFileRepository fileRepository
        -IDropboxService dropboxService
        -IAuthorizationService authorizationService
        -IFileValidator fileValidator
        +uploadFile(fileData: FileData, projectId: String) File
        +downloadFile(fileId: String, userId: String) FileStream
        +validateFile(fileData: FileData) ValidationResult
    }

    class IAuthorizationService {
        <<interface>>
        +canAccessProject(userId: String, projectId: String) bool
        +canModifyTask(userId: String, taskId: String) bool
        +canDeleteTask(userId: String, taskId: String) bool
        +canViewMessages(userId: String, projectId: String) bool
        +getPermissions(userId: String, projectId: String) Set~Permission~
    }

    class AuthorizationService {
        -IUserRepository userRepository
        -IProjectRepository projectRepository
        -IPermissionRepository permissionRepository
        +canAccessProject(userId: String, projectId: String) bool
        +canModifyTask(userId: String, taskId: String) bool
        +canDeleteTask(userId: String, taskId: String) bool
    }

    class IExportService {
        <<interface>>
        +exportProjects(filters: ExportFilters) ExportResult
        +exportTasks(filters: ExportFilters) ExportResult
        +exportToCSV(data: List~Object~) byte[]
        +exportToPDF(data: List~Object~) byte[]
    }

    class ExportService {
        -IProjectRepository projectRepository
        -ITaskRepository taskRepository
        -ICSVGenerator csvGenerator
        -IPDFGenerator pdfGenerator
        +exportProjects(filters: ExportFilters) ExportResult
        +exportTasks(filters: ExportFilters) ExportResult
    }

    class IBackupService {
        <<interface>>
        +createBackup() BackupResult
        +restoreBackup(backupId: String) RestoreResult
        +scheduleAutomaticBackup(schedule: Schedule) void
        +getBackupHistory() List~Backup~
    }

    class BackupService {
        -IBackupRepository backupRepository
        -IBackupStrategy backupStrategy
        -INotificationService notificationService
        +createBackup() BackupResult
        +restoreBackup(backupId: String) RestoreResult
        +scheduleAutomaticBackup(schedule: Schedule) void
    }

    %% Infrastructure Layer
    class IDropboxService {
        <<interface>>
        +createProjectFolder(projectCode: String) String
        +uploadFile(filePath: String, content: byte[]) String
        +downloadFile(filePath: String) byte[]
        +generateShareLink(filePath: String) String
        +syncFiles(folderId: String) void
    }

    class DropboxService {
        -DropboxClient client
        -String accessToken
        +createProjectFolder(projectCode: String) String
        +uploadFile(filePath: String, content: byte[]) String
        +downloadFile(filePath: String) byte[]
        +generateShareLink(filePath: String) String
    }

    class IWhatsAppGateway {
        <<interface>>
        +sendMessage(phoneNumber: String, message: String) bool
    }

    class WhatsAppGateway {
        -String apiKey
        -String apiEndpoint
        +sendMessage(phoneNumber: String, message: String) bool
    }

    %% Repository Interfaces
    class IUserRepository {
        <<interface>>
        +findById(id: String) User
        +findByUsername(username: String) User
        +save(user: User) User
        +update(user: User) User
        +findByRole(role: UserRole) List~User~
    }

    class IProjectRepository {
        <<interface>>
        +findById(id: String) Project
        +save(project: Project) Project
        +update(project: Project) Project
        +findByClientId(clientId: String) List~Project~
        +findBySpecialUserId(userId: String) List~Project~
        +findAll() List~Project~
    }

    class ITaskRepository {
        <<interface>>
        +findById(id: String) Task
        +save(task: Task) Task
        +update(task: Task) Task
        +delete(id: String) void
        +findByProjectId(projectId: String) List~Task~
        +findByAssigneeId(userId: String) List~Task~
    }

    class IMessageRepository {
        <<interface>>
        +findById(id: String) Message
        +save(message: Message) Message
        +findByProjectId(projectId: String) List~Message~
        +countUnreadByUser(projectId: String, userId: String) int
    }

    class INotificationRepository {
        <<interface>>
        +findById(id: String) Notification
        +save(notification: Notification) Notification
        +findByUserId(userId: String) List~Notification~
        +markAsRead(id: String) void
    }

    class IFileRepository {
        <<interface>>
        +findById(id: String) File
        +save(file: File) File
        +delete(id: String) void
        +findByTaskId(taskId: String) List~File~
        +findByMessageId(messageId: String) List~File~
    }

    class IPermissionRepository {
        <<interface>>
        +findByUserAndProject(userId: String, projectId: String) Permission
        +save(permission: Permission) Permission
        +update(permission: Permission) Permission
        +delete(userId: String, projectId: String) void
    }

    class ITaskHistoryRepository {
        <<interface>>
        +save(history: TaskHistory) TaskHistory
        +findByTaskId(taskId: String) List~TaskHistory~
    }

    %% View Models / DTOs
    class ProjectSummaryView {
        <<view model>>
        -String code
        -String name
        -DateTime deliveryDate
        -ProjectStatus status
        -bool hasPendingTasks
        -int unreadMessagesCount
        -String statusColor
    }

    class CalendarProjectView {
        <<view model>>
        -String projectId
        -String code
        -DateTime deliveryDate
        -String color
        -bool hasPendingTasks
    }

    class ProjectDetailsView {
        <<view model>>
        -Project project
        -List~Task~ tasks
        -List~Message~ recentMessages
        -int unreadMessagesCount
        -bool canEdit
    }

    %% Relationships
    User "1" --> "1" UserRole
    User "1" --> "*" Project : assigned to
    User "1" --> "*" Permission : has

    Project "1" --> "1" ProjectType
    Project "1" --> "1" ProjectStatus
    Project "1" --> "1" GeoCoordinates
    Project "1" --> "*" Task : contains
    Project "1" --> "*" Message : contains
    Project "1" --> "*" Permission : has

    Task "1" --> "1" TaskStatus
    Task "1" --> "1" TaskPriority
    Task "*" --> "1" User : created by
    Task "*" --> "1" User : assigned to
    Task "1" --> "*" File : attached
    Task "1" --> "*" TaskHistory : has

    Message "*" --> "1" User : sent by
    Message "1" --> "*" File : attached

    Notification "1" --> "1" NotificationType
    Notification "*" --> "1" User : for

    File "1" --> "1" FileType

    Permission "1" --> "*" AccessRight

    %% Service Implementations
    IAuthenticationService <|.. AuthenticationService
    IProjectService <|.. ProjectService
    ITaskService <|.. TaskService
    IMessageService <|.. MessageService
    INotificationService <|.. NotificationService
    IFileService <|.. FileService
    IAuthorizationService <|.. AuthorizationService
    IExportService <|.. ExportService
    IBackupService <|.. BackupService
    IDropboxService <|.. DropboxService
    IWhatsAppGateway <|.. WhatsAppGateway

    %% Service Dependencies
    AuthenticationService --> IUserRepository
    ProjectService --> IProjectRepository
    ProjectService --> IDropboxService
    ProjectService --> INotificationService
    ProjectService --> IAuthorizationService
    TaskService --> ITaskRepository
    TaskService --> INotificationService
    TaskService --> IAuthorizationService
    TaskService --> ITaskHistoryRepository
    MessageService --> IMessageRepository
    MessageService --> INotificationService
    NotificationService --> INotificationRepository
    NotificationService --> IWhatsAppGateway
    FileService --> IFileRepository
    FileService --> IDropboxService
    FileService --> IAuthorizationService
    AuthorizationService --> IPermissionRepository
    AuthorizationService --> IProjectRepository
    ExportService --> IProjectRepository
    ExportService --> ITaskRepository

```

## Key Design Decisions:

### SOLID Principles Applied:

1. **Single Responsibility**: Each service handles one domain concept (Auth, Projects, Tasks, etc.)
2. **Open/Closed**: Interfaces allow extension without modification; new notification types can be added without changing core logic
3. **Liskov Substitution**: All repository and service implementations can be substituted with their interfaces
4. **Interface Segregation**: Separate interfaces for each concern (IAuthenticationService, IProjectService, etc.)
5. **Dependency Inversion**: Services depend on repository interfaces, not concrete implementations

### Modular Design Features:

- **Layered Architecture**: Domain entities, application services, and infrastructure clearly separated
- **Repository Pattern**: Data access abstracted through interfaces
- **Service Layer**: Business logic encapsulated in dedicated services
- **Authorization Service**: Centralized permission management following US-04 and US-17
- **View Models**: Separate DTOs for different UI concerns (US-14, US-15)
- **External Integration**: Dropbox and WhatsApp services isolated for easy replacement

This design supports all 20 user stories with proper separation of concerns and extensibility.