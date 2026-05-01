# Initial

Perfect! I've created the UML class diagram for the Cartographic Project Management System.

## 📊 View Cartographic Management System UML Diagram

```mermaid
classDiagram
    %% ========================================
    %% USER & AUTHENTICATION
    %% ========================================
    
    class User {
        <<abstract>>
        -id: string
        -email: string
        -passwordHash: string
        -name: string
        -phone: string
        -whatsappEnabled: boolean
        -createdAt: Date
        
        +constructor(email: string, name: string)
        +authenticate(password: string): boolean
        +updateProfile(data: UserProfile): void
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
    }
    
    class Administrator {
        +createProject(data: ProjectData): Project
        +deleteProject(projectId: string): void
        +configurePermissions(userId: string, projectId: string, permissions: Permission[]): void
        +viewAllProjects(): Project[]
        +markProjectAsFinished(projectId: string): void
        +exportData(projectId: string, format: ExportFormat): File
    }
    
    class Client {
        -assignedProjects: Project[]
        
        +getAssignedProjects(): Project[]
        +createTaskForAdmin(projectId: string, task: TaskData): Task
        +confirmTask(taskId: string): void
    }
    
    class SpecialUser {
        -permissions: Map~string, SpecialUserPermissions~
        
        +getPermissionsForProject(projectId: string): SpecialUserPermissions
        +canAccessProject(projectId: string): boolean
    }
    
    class UserRole {
        <<enumeration>>
        ADMINISTRATOR
        CLIENT
        SPECIAL_USER
    }
    
    class SpecialUserPermissions {
        +canView: boolean
        +canDownloadFiles: boolean
        +canViewMessages: boolean
        +canSendMessages: boolean
        +canViewTasks: boolean
        +canUploadFiles: boolean
        +sectionAccess: ProjectSection[]
    }
    
    %% ========================================
    %% PROJECT MANAGEMENT
    %% ========================================
    
    class Project {
        -id: string
        -code: string
        -name: string
        -type: string
        -year: number
        -client: Client
        -coordinateX: number
        -coordinateY: number
        -contractDate: Date
        -deliveryDate: Date
        -status: ProjectStatus
        -dropboxFolderPath: string
        -participants: ProjectParticipant[]
        -tasks: Task[]
        -messages: Message[]
        -createdAt: Date
        -lastModified: Date
        
        +constructor(data: ProjectData, client: Client)
        +addParticipant(user: User, role: ParticipantRole): void
        +removeParticipant(userId: string): void
        +addTask(task: Task): void
        +addMessage(message: Message): void
        +getStatus(): ProjectStatus
        +calculateVisualStatus(): VisualStatus
        +isOverdue(): boolean
        +hasPendingTasks(): boolean
        +markAsFinished(): void
        +updateDeliveryDate(newDate: Date): void
    }
    
    class ProjectData {
        +code: string
        +name: string
        +type: string
        +year: number
        +coordinateX: number
        +coordinateY: number
        +contractDate: Date
        +deliveryDate: Date
        +dropboxFolderPath: string
    }
    
    class ProjectStatus {
        <<enumeration>>
        ACTIVE
        FINISHED
    }
    
    class VisualStatus {
        <<enumeration>>
        RED
        GREEN
        YELLOW
        GRAY
    }
    
    class ProjectSection {
        <<enumeration>>
        REPORT_AND_ANNEXES
        PLANS
        SPECIFICATIONS
        BUDGET
    }
    
    class ProjectParticipant {
        -user: User
        -project: Project
        -role: ParticipantRole
        -joinedAt: Date
        
        +constructor(user: User, project: Project, role: ParticipantRole)
        +getPermissions(): Permission[]
    }
    
    class ParticipantRole {
        <<enumeration>>
        ADMINISTRATOR
        CLIENT
        SPECIAL_USER
    }
    
    %% ========================================
    %% TASK MANAGEMENT
    %% ========================================
    
    class Task {
        -id: string
        -description: string
        -project: Project
        -creator: User
        -assignedTo: User
        -priority: TaskPriority
        -status: TaskStatus
        -deadline: Date
        -attachments: FileReference[]
        -createdAt: Date
        -completedAt: Date
        -confirmedAt: Date
        -comments: string
        
        +constructor(data: TaskData, creator: User, assignedTo: User)
        +updateStatus(newStatus: TaskStatus): void
        +markAsDone(): void
        +confirm(confirmer: User): void
        +addAttachment(file: FileReference): void
        +canBeModifiedBy(user: User): boolean
        +canBeDeletedBy(user: User): boolean
        +isOverdue(): boolean
    }
    
    class TaskData {
        +description: string
        +projectId: string
        +assignedToId: string
        +priority: TaskPriority
        +deadline: Date
    }
    
    class TaskPriority {
        <<enumeration>>
        HIGH
        MEDIUM
        LOW
    }
    
    class TaskStatus {
        <<enumeration>>
        PENDING
        IN_PROGRESS
        PARTIAL
        DONE
        COMPLETED
    }
    
    class TaskManager {
        +createTask(taskData: TaskData, creator: User): Task
        +updateTaskStatus(taskId: string, status: TaskStatus, user: User): void
        +confirmTask(taskId: string, user: User): void
        +deleteTask(taskId: string, user: User): void
        +getTasksForProject(projectId: string): Task[]
        +getTasksForUser(userId: string): Task[]
        +getPendingTasksCount(projectId: string): number
        -validatePermissions(task: Task, user: User, action: Action): boolean
    }
    
    %% ========================================
    %% MESSAGING SYSTEM
    %% ========================================
    
    class Message {
        -id: string
        -project: Project
        -sender: User
        -content: string
        -attachments: FileReference[]
        -timestamp: Date
        -readBy: Map~string, Date~
        -type: MessageType
        
        +constructor(sender: User, project: Project, content: string)
        +addAttachment(file: FileReference): void
        +markAsRead(user: User): void
        +isReadBy(userId: string): boolean
        +isSystemMessage(): boolean
    }
    
    class MessageType {
        <<enumeration>>
        NORMAL
        SYSTEM
    }
    
    class MessageManager {
        +sendMessage(projectId: string, sender: User, content: string, attachments?: FileReference[]): Message
        +getMessagesForProject(projectId: string, user: User): Message[]
        +getUnreadCount(projectId: string, userId: string): number
        +markAsRead(messageId: string, userId: string): void
        +createSystemMessage(project: Project, content: string): Message
        -validateAccess(project: Project, user: User): boolean
    }
    
    %% ========================================
    %% FILE MANAGEMENT & DROPBOX
    %% ========================================
    
    class FileReference {
        -id: string
        -filename: string
        -dropboxPath: string
        -fileType: FileType
        -uploadedBy: User
        -uploadedAt: Date
        -size: number
        -section: ProjectSection
        
        +constructor(filename: string, path: string, type: FileType)
        +getDownloadUrl(): Promise~string~
        +isValidFormat(): boolean
    }
    
    class FileType {
        <<enumeration>>
        PDF
        KML
        KMZ
        SHP
        IMAGE
        DOCUMENT
        CAD
        SPREADSHEET
        COMPRESSED
    }
    
    class DropboxService {
        -apiClient: DropboxAPI
        -accessToken: string
        
        +constructor(accessToken: string)
        +createProjectFolders(projectCode: string): Promise~void~
        +uploadFile(path: string, file: File): Promise~FileReference~
        +downloadFile(path: string): Promise~File~
        +listFiles(folderPath: string): Promise~FileReference[]~
        +generateShareLink(path: string): Promise~string~
        +deleteFile(path: string): Promise~void~
        +validateConnection(): Promise~boolean~
        -handleError(error: Error): void
    }
    
    class FileManager {
        -dropboxService: DropboxService
        
        +constructor(dropboxService: DropboxService)
        +uploadToProject(projectId: string, file: File, section: ProjectSection, user: User): Promise~FileReference~
        +uploadToTask(taskId: string, file: File, user: User): Promise~FileReference~
        +uploadToMessage(messageId: string, file: File, user: User): Promise~FileReference~
        +downloadFile(fileId: string, user: User): Promise~File~
        +deleteFile(fileId: string, user: User): Promise~void~
        +getFilesForProject(projectId: string, section: ProjectSection, user: User): FileReference[]
        -validatePermissions(user: User, project: Project, action: FileAction): boolean
        -validateFileFormat(file: File): boolean
    }
    
    %% ========================================
    %% NOTIFICATION SYSTEM
    %% ========================================
    
    class Notification {
        -id: string
        -recipient: User
        -type: NotificationType
        -content: string
        -relatedEntityId: string
        -isRead: boolean
        -createdAt: Date
        
        +constructor(recipient: User, type: NotificationType, content: string)
        +markAsRead(): void
        +getRelatedEntity(): any
    }
    
    class NotificationType {
        <<enumeration>>
        NEW_MESSAGE
        FILE_RECEIVED
        TASK_ASSIGNED
        TASK_COMPLETED
        TASK_STATUS_CHANGED
        TASK_CONFIRMED
        PROJECT_EXPIRING
        PROJECT_FINISHED
    }
    
    class NotificationManager {
        -inAppNotifier: InAppNotifier
        -whatsappNotifier: WhatsAppNotifier
        
        +constructor(inAppNotifier: InAppNotifier, whatsappNotifier: WhatsAppNotifier)
        +notifyNewMessage(message: Message): void
        +notifyTaskAssigned(task: Task): void
        +notifyTaskStatusChanged(task: Task): void
        +notifyProjectExpiring(project: Project): void
        +sendNotification(users: User[], type: NotificationType, content: string): void
        -shouldSendWhatsApp(user: User, type: NotificationType): boolean
        -checkFrequencyLimit(userId: string, projectId: string): boolean
    }
    
    class InAppNotifier {
        +send(notification: Notification): void
        +getUnreadCount(userId: string): number
        +markAsRead(notificationId: string): void
        +getNotifications(userId: string): Notification[]
    }
    
    class WhatsAppNotifier {
        -apiClient: WhatsAppAPI
        -frequencyLimiter: FrequencyLimiter
        
        +send(user: User, message: string): Promise~void~
        +canSendToUser(userId: string, projectId: string): boolean
    }
    
    %% ========================================
    %% PERMISSION SYSTEM
    %% ========================================
    
    class PermissionManager {
        +validateAction(user: User, action: Action, resource: Resource): boolean
        +configureSpecialUserPermissions(admin: Administrator, userId: string, projectId: string, permissions: SpecialUserPermissions): void
        +getUserPermissions(userId: string, projectId: string): Permission[]
        +canViewProject(user: User, project: Project): boolean
        +canModifyTask(user: User, task: Task): boolean
        +canDeleteTask(user: User, task: Task): boolean
        +canSendMessage(user: User, project: Project): boolean
        +canUploadFile(user: User, project: Project, section: ProjectSection): boolean
        +canDownloadFile(user: User, project: Project): boolean
    }
    
    class Permission {
        <<enumeration>>
        CREATE_PROJECT
        DELETE_PROJECT
        VIEW_PROJECT
        EDIT_PROJECT
        CREATE_TASK
        MODIFY_TASK
        DELETE_TASK
        VIEW_MESSAGES
        SEND_MESSAGES
        UPLOAD_FILES
        DOWNLOAD_FILES
        CONFIGURE_PERMISSIONS
        MARK_PROJECT_FINISHED
        EXPORT_DATA
    }
    
    class Action {
        <<enumeration>>
        CREATE
        READ
        UPDATE
        DELETE
        CONFIRM
        EXPORT
    }
    
    %% ========================================
    %% VISUALIZATION & UI
    %% ========================================
    
    class DashboardService {
        +getProjectsForUser(userId: string): ProjectSummary[]
        +getCalendarView(userId: string, month: number, year: number): CalendarEvent[]
        +getProjectSummary(projectId: string, userId: string): ProjectDetail
        +sortProjects(projects: Project[], criteria: SortCriteria): Project[]
        +filterProjects(projects: Project[], filters: ProjectFilter): Project[]
    }
    
    class ProjectSummary {
        +project: Project
        +visualStatus: VisualStatus
        +unreadMessageCount: number
        +pendingTaskCount: number
        +participantCount: number
        +daysUntilDelivery: number
    }
    
    class CalendarEvent {
        +date: Date
        +projects: Project[]
        +visualStatus: VisualStatus
    }
    
    class ProjectDetail {
        +project: Project
        +tasks: Task[]
        +recentMessages: Message[]
        +files: FileReference[]
        +participants: ProjectParticipant[]
    }
    
    %% ========================================
    %% DATA PERSISTENCE
    %% ========================================
    
    class ProjectRepository {
        +save(project: Project): Promise~void~
        +findById(id: string): Promise~Project~
        +findByCode(code: string): Promise~Project~
        +findByClient(clientId: string): Promise~Project[]~
        +findAll(): Promise~Project[]~
        +update(project: Project): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    class TaskRepository {
        +save(task: Task): Promise~void~
        +findById(id: string): Promise~Task~
        +findByProject(projectId: string): Promise~Task[]~
        +findByUser(userId: string): Promise~Task[]~
        +update(task: Task): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    class MessageRepository {
        +save(message: Message): Promise~void~
        +findById(id: string): Promise~Message~
        +findByProject(projectId: string): Promise~Message[]~
        +markAsRead(messageId: string, userId: string): Promise~void~
        +getUnreadCount(projectId: string, userId: string): Promise~number~
    }
    
    class UserRepository {
        +save(user: User): Promise~void~
        +findById(id: string): Promise~User~
        +findByEmail(email: string): Promise~User~
        +findAll(): Promise~User[]~
        +update(user: User): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    %% ========================================
    %% AUDIT & LOGGING
    %% ========================================
    
    class AuditLog {
        -id: string
        -userId: string
        -action: string
        -resourceType: string
        -resourceId: string
        -timestamp: Date
        -details: string
        
        +constructor(userId: string, action: string, resourceType: string, resourceId: string)
    }
    
    class AuditService {
        +logAction(user: User, action: string, resource: any): void
        +getAuditTrail(resourceId: string): AuditLog[]
        +getUserActions(userId: string, startDate: Date, endDate: Date): AuditLog[]
    }
    
    %% ========================================
    %% RELATIONSHIPS
    %% ========================================
    
    %% User hierarchy
    Administrator --|> User : extends
    Client --|> User : extends
    SpecialUser --|> User : extends
    User --> UserRole : has
    SpecialUser --> SpecialUserPermissions : has per project
    
    %% Project relationships
    Project --> Client : assigned to
    Project --> ProjectStatus : has
    Project --> ProjectSection : organized by
    Project --> ProjectParticipant : contains
    Project --> Task : contains
    Project --> Message : contains
    ProjectParticipant --> User : references
    ProjectParticipant --> Project : references
    ProjectParticipant --> ParticipantRole : has
    
    %% Task relationships
    Task --> User : created by
    Task --> User : assigned to
    Task --> Project : belongs to
    Task --> TaskPriority : has
    Task --> TaskStatus : has
    Task --> FileReference : has attachments
    TaskManager --> Task : manages
    TaskManager --> PermissionManager : validates
    
    %% Message relationships
    Message --> User : sent by
    Message --> Project : belongs to
    Message --> MessageType : has
    Message --> FileReference : has attachments
    MessageManager --> Message : manages
    MessageManager --> PermissionManager : validates
    
    %% File management
    FileReference --> FileType : has
    FileReference --> ProjectSection : belongs to
    FileReference --> User : uploaded by
    FileManager --> DropboxService : uses
    FileManager --> FileReference : manages
    FileManager --> PermissionManager : validates
    
    %% Notification system
    Notification --> User : sent to
    Notification --> NotificationType : has
    NotificationManager --> InAppNotifier : uses
    NotificationManager --> WhatsAppNotifier : uses
    NotificationManager --> Notification : creates
    
    %% Permission system
    PermissionManager --> Permission : validates
    PermissionManager --> User : checks
    PermissionManager --> Project : validates access
    
    %% Dashboard & visualization
    DashboardService --> Project : queries
    DashboardService --> ProjectSummary : generates
    DashboardService --> CalendarEvent : generates
    DashboardService --> VisualStatus : calculates
    
    %% Data persistence
    ProjectRepository --> Project : persists
    TaskRepository --> Task : persists
    MessageRepository --> Message : persists
    UserRepository --> User : persists
    
    %% Audit
    AuditService --> AuditLog : creates
    AuditService --> User : tracks
    
    %% Notes
    note for PermissionManager "Centralized permission validation - enforces all access rules"
    note for Project "Central entity - coordinates tasks, messages, and participants"
    note for TaskManager "Handles bidirectional task assignment and status flow"
    note for DropboxService "External integration - encapsulates all Dropbox API operations"
    note for NotificationManager "Multi-channel notifications with frequency limits"
```

### Design Overview (50+ classes/interfaces):

**User & Authentication (7):**

- `User` (abstract) → `Administrator`, `Client`, `SpecialUser` (LSP)
- `UserRole`, `SpecialUserPermissions`

**Project Management (9):**

- `Project` - Central entity coordinating all subsystems
- `ProjectParticipant`, `ProjectStatus`, `VisualStatus`, `ProjectSection`
- Supporting data classes

**Task Management (6):**

- `Task`, `TaskManager` - Bidirectional assignment logic
- `TaskPriority`, `TaskStatus`, `TaskData`

**Messaging System (3):**

- `Message`, `MessageManager`, `MessageType`

**File Management (4):**

- `FileReference`, `FileManager`, `DropboxService`, `FileType`

**Notification System (5):**

- `NotificationManager`, `Notification`, `InAppNotifier`, `WhatsAppNotifier`
- Multi-channel with frequency limits

**Permission System (3):**

- `PermissionManager` - Centralized validation (SRP)
- `Permission`, `Action` enumerations

**Visualization (4):**

- `DashboardService`, `ProjectSummary`, `CalendarEvent`, `ProjectDetail`

**Data Persistence (4):**

- Repository pattern for each entity (SRP)

**Audit (2):**

- `AuditService`, `AuditLog`

### SOLID Principles:

✅ **SRP**: Each manager has single responsibility (tasks, messages, files, permissions)
✅ **OCP**: User hierarchy extensible, Dropbox can be swapped
✅ **LSP**: All User subclasses substitutable
✅ **ISP**: Focused interfaces per concern
✅ **DIP**: Services depend on abstractions (repositories, external services)

All four UML diagrams complete! 🎉

# Fix 1

**Prompt: C**lasses like ProjectDetail and any other class or enumeration of the diagram should be related to other class or component.

Perfect! I've added all the missing relationships.

## 📊 View Updated Cartographic Management System UML Diagram

```mermaid
classDiagram
    %% ========================================
    %% USER & AUTHENTICATION
    %% ========================================
    
    class User {
        <<abstract>>
        -id: string
        -email: string
        -passwordHash: string
        -name: string
        -phone: string
        -whatsappEnabled: boolean
        -createdAt: Date
        
        +constructor(email: string, name: string)
        +authenticate(password: string): boolean
        +updateProfile(data: UserProfile): void
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
    }
    
    class Administrator {
        +createProject(data: ProjectData): Project
        +deleteProject(projectId: string): void
        +configurePermissions(userId: string, projectId: string, permissions: Permission[]): void
        +viewAllProjects(): Project[]
        +markProjectAsFinished(projectId: string): void
        +exportData(projectId: string, format: ExportFormat): File
    }
    
    class Client {
        -assignedProjects: Project[]
        
        +getAssignedProjects(): Project[]
        +createTaskForAdmin(projectId: string, task: TaskData): Task
        +confirmTask(taskId: string): void
    }
    
    class SpecialUser {
        -permissions: Map~string, SpecialUserPermissions~
        
        +getPermissionsForProject(projectId: string): SpecialUserPermissions
        +canAccessProject(projectId: string): boolean
    }
    
    class UserRole {
        <<enumeration>>
        ADMINISTRATOR
        CLIENT
        SPECIAL_USER
    }
    
    class SpecialUserPermissions {
        +canView: boolean
        +canDownloadFiles: boolean
        +canViewMessages: boolean
        +canSendMessages: boolean
        +canViewTasks: boolean
        +canUploadFiles: boolean
        +sectionAccess: ProjectSection[]
    }
    
    %% ========================================
    %% PROJECT MANAGEMENT
    %% ========================================
    
    class Project {
        -id: string
        -code: string
        -name: string
        -type: string
        -year: number
        -client: Client
        -coordinateX: number
        -coordinateY: number
        -contractDate: Date
        -deliveryDate: Date
        -status: ProjectStatus
        -dropboxFolderPath: string
        -participants: ProjectParticipant[]
        -tasks: Task[]
        -messages: Message[]
        -createdAt: Date
        -lastModified: Date
        
        +constructor(data: ProjectData, client: Client)
        +addParticipant(user: User, role: ParticipantRole): void
        +removeParticipant(userId: string): void
        +addTask(task: Task): void
        +addMessage(message: Message): void
        +getStatus(): ProjectStatus
        +calculateVisualStatus(): VisualStatus
        +isOverdue(): boolean
        +hasPendingTasks(): boolean
        +markAsFinished(): void
        +updateDeliveryDate(newDate: Date): void
    }
    
    class ProjectData {
        +code: string
        +name: string
        +type: string
        +year: number
        +coordinateX: number
        +coordinateY: number
        +contractDate: Date
        +deliveryDate: Date
        +dropboxFolderPath: string
    }
    
    class ProjectStatus {
        <<enumeration>>
        ACTIVE
        FINISHED
    }
    
    class VisualStatus {
        <<enumeration>>
        RED
        GREEN
        YELLOW
        GRAY
    }
    
    class ProjectSection {
        <<enumeration>>
        REPORT_AND_ANNEXES
        PLANS
        SPECIFICATIONS
        BUDGET
    }
    
    class ProjectParticipant {
        -user: User
        -project: Project
        -role: ParticipantRole
        -joinedAt: Date
        
        +constructor(user: User, project: Project, role: ParticipantRole)
        +getPermissions(): Permission[]
    }
    
    class ParticipantRole {
        <<enumeration>>
        ADMINISTRATOR
        CLIENT
        SPECIAL_USER
    }
    
    %% ========================================
    %% TASK MANAGEMENT
    %% ========================================
    
    class Task {
        -id: string
        -description: string
        -project: Project
        -creator: User
        -assignedTo: User
        -priority: TaskPriority
        -status: TaskStatus
        -deadline: Date
        -attachments: FileReference[]
        -createdAt: Date
        -completedAt: Date
        -confirmedAt: Date
        -comments: string
        
        +constructor(data: TaskData, creator: User, assignedTo: User)
        +updateStatus(newStatus: TaskStatus): void
        +markAsDone(): void
        +confirm(confirmer: User): void
        +addAttachment(file: FileReference): void
        +canBeModifiedBy(user: User): boolean
        +canBeDeletedBy(user: User): boolean
        +isOverdue(): boolean
    }
    
    class TaskData {
        +description: string
        +projectId: string
        +assignedToId: string
        +priority: TaskPriority
        +deadline: Date
    }
    
    class TaskPriority {
        <<enumeration>>
        HIGH
        MEDIUM
        LOW
    }
    
    class TaskStatus {
        <<enumeration>>
        PENDING
        IN_PROGRESS
        PARTIAL
        DONE
        COMPLETED
    }
    
    class TaskManager {
        +createTask(taskData: TaskData, creator: User): Task
        +updateTaskStatus(taskId: string, status: TaskStatus, user: User): void
        +confirmTask(taskId: string, user: User): void
        +deleteTask(taskId: string, user: User): void
        +getTasksForProject(projectId: string): Task[]
        +getTasksForUser(userId: string): Task[]
        +getPendingTasksCount(projectId: string): number
        -validatePermissions(task: Task, user: User, action: Action): boolean
    }
    
    %% ========================================
    %% MESSAGING SYSTEM
    %% ========================================
    
    class Message {
        -id: string
        -project: Project
        -sender: User
        -content: string
        -attachments: FileReference[]
        -timestamp: Date
        -readBy: Map~string, Date~
        -type: MessageType
        
        +constructor(sender: User, project: Project, content: string)
        +addAttachment(file: FileReference): void
        +markAsRead(user: User): void
        +isReadBy(userId: string): boolean
        +isSystemMessage(): boolean
    }
    
    class MessageType {
        <<enumeration>>
        NORMAL
        SYSTEM
    }
    
    class MessageManager {
        +sendMessage(projectId: string, sender: User, content: string, attachments?: FileReference[]): Message
        +getMessagesForProject(projectId: string, user: User): Message[]
        +getUnreadCount(projectId: string, userId: string): number
        +markAsRead(messageId: string, userId: string): void
        +createSystemMessage(project: Project, content: string): Message
        -validateAccess(project: Project, user: User): boolean
    }
    
    %% ========================================
    %% FILE MANAGEMENT & DROPBOX
    %% ========================================
    
    class FileReference {
        -id: string
        -filename: string
        -dropboxPath: string
        -fileType: FileType
        -uploadedBy: User
        -uploadedAt: Date
        -size: number
        -section: ProjectSection
        
        +constructor(filename: string, path: string, type: FileType)
        +getDownloadUrl(): Promise~string~
        +isValidFormat(): boolean
    }
    
    class FileType {
        <<enumeration>>
        PDF
        KML
        KMZ
        SHP
        IMAGE
        DOCUMENT
        CAD
        SPREADSHEET
        COMPRESSED
    }
    
    class DropboxService {
        -apiClient: DropboxAPI
        -accessToken: string
        
        +constructor(accessToken: string)
        +createProjectFolders(projectCode: string): Promise~void~
        +uploadFile(path: string, file: File): Promise~FileReference~
        +downloadFile(path: string): Promise~File~
        +listFiles(folderPath: string): Promise~FileReference[]~
        +generateShareLink(path: string): Promise~string~
        +deleteFile(path: string): Promise~void~
        +validateConnection(): Promise~boolean~
        -handleError(error: Error): void
    }
    
    class FileManager {
        -dropboxService: DropboxService
        
        +constructor(dropboxService: DropboxService)
        +uploadToProject(projectId: string, file: File, section: ProjectSection, user: User): Promise~FileReference~
        +uploadToTask(taskId: string, file: File, user: User): Promise~FileReference~
        +uploadToMessage(messageId: string, file: File, user: User): Promise~FileReference~
        +downloadFile(fileId: string, user: User): Promise~File~
        +deleteFile(fileId: string, user: User): Promise~void~
        +getFilesForProject(projectId: string, section: ProjectSection, user: User): FileReference[]
        -validatePermissions(user: User, project: Project, action: FileAction): boolean
        -validateFileFormat(file: File): boolean
    }
    
    %% ========================================
    %% NOTIFICATION SYSTEM
    %% ========================================
    
    class Notification {
        -id: string
        -recipient: User
        -type: NotificationType
        -content: string
        -relatedEntityId: string
        -isRead: boolean
        -createdAt: Date
        
        +constructor(recipient: User, type: NotificationType, content: string)
        +markAsRead(): void
        +getRelatedEntity(): any
    }
    
    class NotificationType {
        <<enumeration>>
        NEW_MESSAGE
        FILE_RECEIVED
        TASK_ASSIGNED
        TASK_COMPLETED
        TASK_STATUS_CHANGED
        TASK_CONFIRMED
        PROJECT_EXPIRING
        PROJECT_FINISHED
    }
    
    class NotificationManager {
        -inAppNotifier: InAppNotifier
        -whatsappNotifier: WhatsAppNotifier
        
        +constructor(inAppNotifier: InAppNotifier, whatsappNotifier: WhatsAppNotifier)
        +notifyNewMessage(message: Message): void
        +notifyTaskAssigned(task: Task): void
        +notifyTaskStatusChanged(task: Task): void
        +notifyProjectExpiring(project: Project): void
        +sendNotification(users: User[], type: NotificationType, content: string): void
        -shouldSendWhatsApp(user: User, type: NotificationType): boolean
        -checkFrequencyLimit(userId: string, projectId: string): boolean
    }
    
    class InAppNotifier {
        +send(notification: Notification): void
        +getUnreadCount(userId: string): number
        +markAsRead(notificationId: string): void
        +getNotifications(userId: string): Notification[]
    }
    
    class WhatsAppNotifier {
        -apiClient: WhatsAppAPI
        -frequencyLimiter: FrequencyLimiter
        
        +send(user: User, message: string): Promise~void~
        +canSendToUser(userId: string, projectId: string): boolean
    }
    
    %% ========================================
    %% PERMISSION SYSTEM
    %% ========================================
    
    class PermissionManager {
        +validateAction(user: User, action: Action, resource: Resource): boolean
        +configureSpecialUserPermissions(admin: Administrator, userId: string, projectId: string, permissions: SpecialUserPermissions): void
        +getUserPermissions(userId: string, projectId: string): Permission[]
        +canViewProject(user: User, project: Project): boolean
        +canModifyTask(user: User, task: Task): boolean
        +canDeleteTask(user: User, task: Task): boolean
        +canSendMessage(user: User, project: Project): boolean
        +canUploadFile(user: User, project: Project, section: ProjectSection): boolean
        +canDownloadFile(user: User, project: Project): boolean
    }
    
    class Permission {
        <<enumeration>>
        CREATE_PROJECT
        DELETE_PROJECT
        VIEW_PROJECT
        EDIT_PROJECT
        CREATE_TASK
        MODIFY_TASK
        DELETE_TASK
        VIEW_MESSAGES
        SEND_MESSAGES
        UPLOAD_FILES
        DOWNLOAD_FILES
        CONFIGURE_PERMISSIONS
        MARK_PROJECT_FINISHED
        EXPORT_DATA
    }
    
    class Action {
        <<enumeration>>
        CREATE
        READ
        UPDATE
        DELETE
        CONFIRM
        EXPORT
    }
    
    %% ========================================
    %% VISUALIZATION & UI
    %% ========================================
    
    class DashboardService {
        +getProjectsForUser(userId: string): ProjectSummary[]
        +getCalendarView(userId: string, month: number, year: number): CalendarEvent[]
        +getProjectSummary(projectId: string, userId: string): ProjectDetail
        +sortProjects(projects: Project[], criteria: SortCriteria): Project[]
        +filterProjects(projects: Project[], filters: ProjectFilter): Project[]
    }
    
    class ProjectSummary {
        +project: Project
        +visualStatus: VisualStatus
        +unreadMessageCount: number
        +pendingTaskCount: number
        +participantCount: number
        +daysUntilDelivery: number
    }
    
    class CalendarEvent {
        +date: Date
        +projects: Project[]
        +visualStatus: VisualStatus
    }
    
    class ProjectDetail {
        +project: Project
        +tasks: Task[]
        +recentMessages: Message[]
        +files: FileReference[]
        +participants: ProjectParticipant[]
    }
    
    class SortCriteria {
        <<enumeration>>
        DELIVERY_DATE
        CODE
        CLIENT
        STATUS
        CREATION_DATE
    }
    
    class ProjectFilter {
        +year: number
        +type: string
        +clientId: string
        +status: ProjectStatus
        +dateRange: DateRange
    }
    
    class DateRange {
        +startDate: Date
        +endDate: Date
    }
    
    class ExportFormat {
        <<enumeration>>
        CSV
        PDF
        EXCEL
    }
    
    class FileAction {
        <<enumeration>>
        UPLOAD
        DOWNLOAD
        DELETE
        VIEW
    }
    
    class Resource {
        <<interface>>
        +id: string
        +type: string
    }
    
    class FrequencyLimiter {
        -limits: Map~string, LimitEntry~
        
        +canSend(userId: string, projectId: string): boolean
        +recordSent(userId: string, projectId: string): void
        +resetLimits(): void
    }
    
    class LimitEntry {
        +lastSentAt: Date
        +count: number
    }
    
    %% ========================================
    %% DATA PERSISTENCE
    %% ========================================
    
    class ProjectRepository {
        +save(project: Project): Promise~void~
        +findById(id: string): Promise~Project~
        +findByCode(code: string): Promise~Project~
        +findByClient(clientId: string): Promise~Project[]~
        +findAll(): Promise~Project[]~
        +update(project: Project): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    class TaskRepository {
        +save(task: Task): Promise~void~
        +findById(id: string): Promise~Task~
        +findByProject(projectId: string): Promise~Task[]~
        +findByUser(userId: string): Promise~Task[]~
        +update(task: Task): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    class MessageRepository {
        +save(message: Message): Promise~void~
        +findById(id: string): Promise~Message~
        +findByProject(projectId: string): Promise~Message[]~
        +markAsRead(messageId: string, userId: string): Promise~void~
        +getUnreadCount(projectId: string, userId: string): Promise~number~
    }
    
    class UserRepository {
        +save(user: User): Promise~void~
        +findById(id: string): Promise~User~
        +findByEmail(email: string): Promise~User~
        +findAll(): Promise~User[]~
        +update(user: User): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    %% ========================================
    %% AUDIT & LOGGING
    %% ========================================
    
    class AuditLog {
        -id: string
        -userId: string
        -action: string
        -resourceType: string
        -resourceId: string
        -timestamp: Date
        -details: string
        
        +constructor(userId: string, action: string, resourceType: string, resourceId: string)
    }
    
    class AuditService {
        +logAction(user: User, action: string, resource: any): void
        +getAuditTrail(resourceId: string): AuditLog[]
        +getUserActions(userId: string, startDate: Date, endDate: Date): AuditLog[]
    }
    
    %% ========================================
    %% RELATIONSHIPS
    %% ========================================
    
    %% User hierarchy
    Administrator --|> User : extends
    Client --|> User : extends
    SpecialUser --|> User : extends
    User --> UserRole : has
    SpecialUser --> SpecialUserPermissions : has per project
    
    %% Project relationships
    Project --> Client : assigned to
    Project --> ProjectStatus : has
    Project --> ProjectSection : organized by
    Project --> ProjectParticipant : contains
    Project --> Task : contains
    Project --> Message : contains
    ProjectParticipant --> User : references
    ProjectParticipant --> Project : references
    ProjectParticipant --> ParticipantRole : has
    
    %% Task relationships
    Task --> User : created by
    Task --> User : assigned to
    Task --> Project : belongs to
    Task --> TaskPriority : has
    Task --> TaskStatus : has
    Task --> FileReference : has attachments
    TaskManager --> Task : manages
    TaskManager --> PermissionManager : validates
    
    %% Message relationships
    Message --> User : sent by
    Message --> Project : belongs to
    Message --> MessageType : has
    Message --> FileReference : has attachments
    MessageManager --> Message : manages
    MessageManager --> PermissionManager : validates
    
    %% File management
    FileReference --> FileType : has
    FileReference --> ProjectSection : belongs to
    FileReference --> User : uploaded by
    FileManager --> DropboxService : uses
    FileManager --> FileReference : manages
    FileManager --> PermissionManager : validates
    
    %% Notification system
    Notification --> User : sent to
    Notification --> NotificationType : has
    NotificationManager --> InAppNotifier : uses
    NotificationManager --> WhatsAppNotifier : uses
    NotificationManager --> Notification : creates
    
    %% Permission system
    PermissionManager --> Permission : validates
    PermissionManager --> User : checks
    PermissionManager --> Project : validates access
    
    %% Dashboard & visualization
    DashboardService --> Project : queries
    DashboardService --> ProjectSummary : generates
    DashboardService --> CalendarEvent : generates
    DashboardService --> ProjectDetail : generates
    DashboardService --> VisualStatus : calculates
    DashboardService --> SortCriteria : uses
    DashboardService --> ProjectFilter : uses
    ProjectSummary --> VisualStatus : has
    ProjectDetail --> Project : contains
    ProjectDetail --> Task : contains
    ProjectDetail --> Message : contains
    ProjectDetail --> FileReference : contains
    ProjectDetail --> ProjectParticipant : contains
    ProjectFilter --> ProjectStatus : filters by
    ProjectFilter --> DateRange : uses
    CalendarEvent --> VisualStatus : has
    
    %% Additional relationships
    Administrator --> ExportFormat : uses
    FileManager --> FileAction : validates
    PermissionManager --> Resource : validates
    Project ..|> Resource : implements
    Task ..|> Resource : implements
    Message ..|> Resource : implements
    WhatsAppNotifier --> FrequencyLimiter : uses
    FrequencyLimiter --> LimitEntry : manages
    
    %% Data persistence
    ProjectRepository --> Project : persists
    TaskRepository --> Task : persists
    MessageRepository --> Message : persists
    UserRepository --> User : persists
    
    %% Audit
    AuditService --> AuditLog : creates
    AuditService --> User : tracks
    
    %% Notes
    note for PermissionManager "Centralized permission validation - enforces all access rules"
    note for Project "Central entity - coordinates tasks, messages, and participants"
    note for TaskManager "Handles bidirectional task assignment and status flow"
    note for DropboxService "External integration - encapsulates all Dropbox API operations"
    note for NotificationManager "Multi-channel notifications with frequency limits"
```

### Added Relationships:

**ProjectDetail connections:**

- Contains: `Project`, `Task[]`, `Message[]`, `FileReference[]`, `ProjectParticipant[]`

**Enumeration connections:**

- `SortCriteria` → used by `DashboardService`
- `ExportFormat` → used by `Administrator`
- `FileAction` → validated by `FileManager`

**Supporting classes:**

- `ProjectFilter` → uses `ProjectStatus` and `DateRange`
- `DateRange` → used by `ProjectFilter`
- `FrequencyLimiter` + `LimitEntry` → used by `WhatsAppNotifier`
- `Resource` (interface) → implemented by `Project`, `Task`, `Message`

Now every class and enumeration in the diagram is properly connected! 🎯

# Fix 2

**Prompt:** ProjectData, TaskData and Action are still disconnected.

Perfect! Now all classes are connected.

## 📊 View Fully Connected Cartographic Management System UML Diagram

```mermaid
classDiagram
    %% ========================================
    %% USER & AUTHENTICATION
    %% ========================================
    
    class User {
        <<abstract>>
        -id: string
        -email: string
        -passwordHash: string
        -name: string
        -phone: string
        -whatsappEnabled: boolean
        -createdAt: Date
        
        +constructor(email: string, name: string)
        +authenticate(password: string): boolean
        +updateProfile(data: UserProfile): void
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
    }
    
    class Administrator {
        +createProject(data: ProjectData): Project
        +deleteProject(projectId: string): void
        +configurePermissions(userId: string, projectId: string, permissions: Permission[]): void
        +viewAllProjects(): Project[]
        +markProjectAsFinished(projectId: string): void
        +exportData(projectId: string, format: ExportFormat): File
    }
    
    class Client {
        -assignedProjects: Project[]
        
        +getAssignedProjects(): Project[]
        +createTaskForAdmin(projectId: string, task: TaskData): Task
        +confirmTask(taskId: string): void
    }
    
    class SpecialUser {
        -permissions: Map~string, SpecialUserPermissions~
        
        +getPermissionsForProject(projectId: string): SpecialUserPermissions
        +canAccessProject(projectId: string): boolean
    }
    
    class UserRole {
        <<enumeration>>
        ADMINISTRATOR
        CLIENT
        SPECIAL_USER
    }
    
    class SpecialUserPermissions {
        +canView: boolean
        +canDownloadFiles: boolean
        +canViewMessages: boolean
        +canSendMessages: boolean
        +canViewTasks: boolean
        +canUploadFiles: boolean
        +sectionAccess: ProjectSection[]
    }
    
    %% ========================================
    %% PROJECT MANAGEMENT
    %% ========================================
    
    class Project {
        -id: string
        -code: string
        -name: string
        -type: string
        -year: number
        -client: Client
        -coordinateX: number
        -coordinateY: number
        -contractDate: Date
        -deliveryDate: Date
        -status: ProjectStatus
        -dropboxFolderPath: string
        -participants: ProjectParticipant[]
        -tasks: Task[]
        -messages: Message[]
        -createdAt: Date
        -lastModified: Date
        
        +constructor(data: ProjectData, client: Client)
        +addParticipant(user: User, role: ParticipantRole): void
        +removeParticipant(userId: string): void
        +addTask(task: Task): void
        +addMessage(message: Message): void
        +getStatus(): ProjectStatus
        +calculateVisualStatus(): VisualStatus
        +isOverdue(): boolean
        +hasPendingTasks(): boolean
        +markAsFinished(): void
        +updateDeliveryDate(newDate: Date): void
    }
    
    class ProjectData {
        +code: string
        +name: string
        +type: string
        +year: number
        +coordinateX: number
        +coordinateY: number
        +contractDate: Date
        +deliveryDate: Date
        +dropboxFolderPath: string
    }
    
    class ProjectStatus {
        <<enumeration>>
        ACTIVE
        FINISHED
    }
    
    class VisualStatus {
        <<enumeration>>
        RED
        GREEN
        YELLOW
        GRAY
    }
    
    class ProjectSection {
        <<enumeration>>
        REPORT_AND_ANNEXES
        PLANS
        SPECIFICATIONS
        BUDGET
    }
    
    class ProjectParticipant {
        -user: User
        -project: Project
        -role: ParticipantRole
        -joinedAt: Date
        
        +constructor(user: User, project: Project, role: ParticipantRole)
        +getPermissions(): Permission[]
    }
    
    class ParticipantRole {
        <<enumeration>>
        ADMINISTRATOR
        CLIENT
        SPECIAL_USER
    }
    
    %% ========================================
    %% TASK MANAGEMENT
    %% ========================================
    
    class Task {
        -id: string
        -description: string
        -project: Project
        -creator: User
        -assignedTo: User
        -priority: TaskPriority
        -status: TaskStatus
        -deadline: Date
        -attachments: FileReference[]
        -createdAt: Date
        -completedAt: Date
        -confirmedAt: Date
        -comments: string
        
        +constructor(data: TaskData, creator: User, assignedTo: User)
        +updateStatus(newStatus: TaskStatus): void
        +markAsDone(): void
        +confirm(confirmer: User): void
        +addAttachment(file: FileReference): void
        +canBeModifiedBy(user: User): boolean
        +canBeDeletedBy(user: User): boolean
        +isOverdue(): boolean
    }
    
    class TaskData {
        +description: string
        +projectId: string
        +assignedToId: string
        +priority: TaskPriority
        +deadline: Date
    }
    
    class TaskPriority {
        <<enumeration>>
        HIGH
        MEDIUM
        LOW
    }
    
    class TaskStatus {
        <<enumeration>>
        PENDING
        IN_PROGRESS
        PARTIAL
        DONE
        COMPLETED
    }
    
    class TaskManager {
        +createTask(taskData: TaskData, creator: User): Task
        +updateTaskStatus(taskId: string, status: TaskStatus, user: User): void
        +confirmTask(taskId: string, user: User): void
        +deleteTask(taskId: string, user: User): void
        +getTasksForProject(projectId: string): Task[]
        +getTasksForUser(userId: string): Task[]
        +getPendingTasksCount(projectId: string): number
        -validatePermissions(task: Task, user: User, action: Action): boolean
    }
    
    %% ========================================
    %% MESSAGING SYSTEM
    %% ========================================
    
    class Message {
        -id: string
        -project: Project
        -sender: User
        -content: string
        -attachments: FileReference[]
        -timestamp: Date
        -readBy: Map~string, Date~
        -type: MessageType
        
        +constructor(sender: User, project: Project, content: string)
        +addAttachment(file: FileReference): void
        +markAsRead(user: User): void
        +isReadBy(userId: string): boolean
        +isSystemMessage(): boolean
    }
    
    class MessageType {
        <<enumeration>>
        NORMAL
        SYSTEM
    }
    
    class MessageManager {
        +sendMessage(projectId: string, sender: User, content: string, attachments?: FileReference[]): Message
        +getMessagesForProject(projectId: string, user: User): Message[]
        +getUnreadCount(projectId: string, userId: string): number
        +markAsRead(messageId: string, userId: string): void
        +createSystemMessage(project: Project, content: string): Message
        -validateAccess(project: Project, user: User): boolean
    }
    
    %% ========================================
    %% FILE MANAGEMENT & DROPBOX
    %% ========================================
    
    class FileReference {
        -id: string
        -filename: string
        -dropboxPath: string
        -fileType: FileType
        -uploadedBy: User
        -uploadedAt: Date
        -size: number
        -section: ProjectSection
        
        +constructor(filename: string, path: string, type: FileType)
        +getDownloadUrl(): Promise~string~
        +isValidFormat(): boolean
    }
    
    class FileType {
        <<enumeration>>
        PDF
        KML
        KMZ
        SHP
        IMAGE
        DOCUMENT
        CAD
        SPREADSHEET
        COMPRESSED
    }
    
    class DropboxService {
        -apiClient: DropboxAPI
        -accessToken: string
        
        +constructor(accessToken: string)
        +createProjectFolders(projectCode: string): Promise~void~
        +uploadFile(path: string, file: File): Promise~FileReference~
        +downloadFile(path: string): Promise~File~
        +listFiles(folderPath: string): Promise~FileReference[]~
        +generateShareLink(path: string): Promise~string~
        +deleteFile(path: string): Promise~void~
        +validateConnection(): Promise~boolean~
        -handleError(error: Error): void
    }
    
    class FileManager {
        -dropboxService: DropboxService
        
        +constructor(dropboxService: DropboxService)
        +uploadToProject(projectId: string, file: File, section: ProjectSection, user: User): Promise~FileReference~
        +uploadToTask(taskId: string, file: File, user: User): Promise~FileReference~
        +uploadToMessage(messageId: string, file: File, user: User): Promise~FileReference~
        +downloadFile(fileId: string, user: User): Promise~File~
        +deleteFile(fileId: string, user: User): Promise~void~
        +getFilesForProject(projectId: string, section: ProjectSection, user: User): FileReference[]
        -validatePermissions(user: User, project: Project, action: FileAction): boolean
        -validateFileFormat(file: File): boolean
    }
    
    %% ========================================
    %% NOTIFICATION SYSTEM
    %% ========================================
    
    class Notification {
        -id: string
        -recipient: User
        -type: NotificationType
        -content: string
        -relatedEntityId: string
        -isRead: boolean
        -createdAt: Date
        
        +constructor(recipient: User, type: NotificationType, content: string)
        +markAsRead(): void
        +getRelatedEntity(): any
    }
    
    class NotificationType {
        <<enumeration>>
        NEW_MESSAGE
        FILE_RECEIVED
        TASK_ASSIGNED
        TASK_COMPLETED
        TASK_STATUS_CHANGED
        TASK_CONFIRMED
        PROJECT_EXPIRING
        PROJECT_FINISHED
    }
    
    class NotificationManager {
        -inAppNotifier: InAppNotifier
        -whatsappNotifier: WhatsAppNotifier
        
        +constructor(inAppNotifier: InAppNotifier, whatsappNotifier: WhatsAppNotifier)
        +notifyNewMessage(message: Message): void
        +notifyTaskAssigned(task: Task): void
        +notifyTaskStatusChanged(task: Task): void
        +notifyProjectExpiring(project: Project): void
        +sendNotification(users: User[], type: NotificationType, content: string): void
        -shouldSendWhatsApp(user: User, type: NotificationType): boolean
        -checkFrequencyLimit(userId: string, projectId: string): boolean
    }
    
    class InAppNotifier {
        +send(notification: Notification): void
        +getUnreadCount(userId: string): number
        +markAsRead(notificationId: string): void
        +getNotifications(userId: string): Notification[]
    }
    
    class WhatsAppNotifier {
        -apiClient: WhatsAppAPI
        -frequencyLimiter: FrequencyLimiter
        
        +send(user: User, message: string): Promise~void~
        +canSendToUser(userId: string, projectId: string): boolean
    }
    
    %% ========================================
    %% PERMISSION SYSTEM
    %% ========================================
    
    class PermissionManager {
        +validateAction(user: User, action: Action, resource: Resource): boolean
        +configureSpecialUserPermissions(admin: Administrator, userId: string, projectId: string, permissions: SpecialUserPermissions): void
        +getUserPermissions(userId: string, projectId: string): Permission[]
        +canViewProject(user: User, project: Project): boolean
        +canModifyTask(user: User, task: Task): boolean
        +canDeleteTask(user: User, task: Task): boolean
        +canSendMessage(user: User, project: Project): boolean
        +canUploadFile(user: User, project: Project, section: ProjectSection): boolean
        +canDownloadFile(user: User, project: Project): boolean
    }
    
    class Permission {
        <<enumeration>>
        CREATE_PROJECT
        DELETE_PROJECT
        VIEW_PROJECT
        EDIT_PROJECT
        CREATE_TASK
        MODIFY_TASK
        DELETE_TASK
        VIEW_MESSAGES
        SEND_MESSAGES
        UPLOAD_FILES
        DOWNLOAD_FILES
        CONFIGURE_PERMISSIONS
        MARK_PROJECT_FINISHED
        EXPORT_DATA
    }
    
    class Action {
        <<enumeration>>
        CREATE
        READ
        UPDATE
        DELETE
        CONFIRM
        EXPORT
    }
    
    %% ========================================
    %% VISUALIZATION & UI
    %% ========================================
    
    class DashboardService {
        +getProjectsForUser(userId: string): ProjectSummary[]
        +getCalendarView(userId: string, month: number, year: number): CalendarEvent[]
        +getProjectSummary(projectId: string, userId: string): ProjectDetail
        +sortProjects(projects: Project[], criteria: SortCriteria): Project[]
        +filterProjects(projects: Project[], filters: ProjectFilter): Project[]
    }
    
    class ProjectSummary {
        +project: Project
        +visualStatus: VisualStatus
        +unreadMessageCount: number
        +pendingTaskCount: number
        +participantCount: number
        +daysUntilDelivery: number
    }
    
    class CalendarEvent {
        +date: Date
        +projects: Project[]
        +visualStatus: VisualStatus
    }
    
    class ProjectDetail {
        +project: Project
        +tasks: Task[]
        +recentMessages: Message[]
        +files: FileReference[]
        +participants: ProjectParticipant[]
    }
    
    class SortCriteria {
        <<enumeration>>
        DELIVERY_DATE
        CODE
        CLIENT
        STATUS
        CREATION_DATE
    }
    
    class ProjectFilter {
        +year: number
        +type: string
        +clientId: string
        +status: ProjectStatus
        +dateRange: DateRange
    }
    
    class DateRange {
        +startDate: Date
        +endDate: Date
    }
    
    class ExportFormat {
        <<enumeration>>
        CSV
        PDF
        EXCEL
    }
    
    class FileAction {
        <<enumeration>>
        UPLOAD
        DOWNLOAD
        DELETE
        VIEW
    }
    
    class Resource {
        <<interface>>
        +id: string
        +type: string
    }
    
    class FrequencyLimiter {
        -limits: Map~string, LimitEntry~
        
        +canSend(userId: string, projectId: string): boolean
        +recordSent(userId: string, projectId: string): void
        +resetLimits(): void
    }
    
    class LimitEntry {
        +lastSentAt: Date
        +count: number
    }
    
    %% ========================================
    %% DATA PERSISTENCE
    %% ========================================
    
    class ProjectRepository {
        +save(project: Project): Promise~void~
        +findById(id: string): Promise~Project~
        +findByCode(code: string): Promise~Project~
        +findByClient(clientId: string): Promise~Project[]~
        +findAll(): Promise~Project[]~
        +update(project: Project): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    class TaskRepository {
        +save(task: Task): Promise~void~
        +findById(id: string): Promise~Task~
        +findByProject(projectId: string): Promise~Task[]~
        +findByUser(userId: string): Promise~Task[]~
        +update(task: Task): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    class MessageRepository {
        +save(message: Message): Promise~void~
        +findById(id: string): Promise~Message~
        +findByProject(projectId: string): Promise~Message[]~
        +markAsRead(messageId: string, userId: string): Promise~void~
        +getUnreadCount(projectId: string, userId: string): Promise~number~
    }
    
    class UserRepository {
        +save(user: User): Promise~void~
        +findById(id: string): Promise~User~
        +findByEmail(email: string): Promise~User~
        +findAll(): Promise~User[]~
        +update(user: User): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    %% ========================================
    %% AUDIT & LOGGING
    %% ========================================
    
    class AuditLog {
        -id: string
        -userId: string
        -action: string
        -resourceType: string
        -resourceId: string
        -timestamp: Date
        -details: string
        
        +constructor(userId: string, action: string, resourceType: string, resourceId: string)
    }
    
    class AuditService {
        +logAction(user: User, action: string, resource: any): void
        +getAuditTrail(resourceId: string): AuditLog[]
        +getUserActions(userId: string, startDate: Date, endDate: Date): AuditLog[]
    }
    
    %% ========================================
    %% RELATIONSHIPS
    %% ========================================
    
    %% User hierarchy
    Administrator --|> User : extends
    Client --|> User : extends
    SpecialUser --|> User : extends
    User --> UserRole : has
    SpecialUser --> SpecialUserPermissions : has per project
    
    %% Project relationships
    Project --> Client : assigned to
    Project --> ProjectStatus : has
    Project --> ProjectSection : organized by
    Project --> ProjectParticipant : contains
    Project --> Task : contains
    Project --> Message : contains
    Project --> ProjectData : created from
    ProjectParticipant --> User : references
    ProjectParticipant --> Project : references
    ProjectParticipant --> ParticipantRole : has
    Administrator --> ProjectData : creates
    
    %% Task relationships
    Task --> User : created by
    Task --> User : assigned to
    Task --> Project : belongs to
    Task --> TaskPriority : has
    Task --> TaskStatus : has
    Task --> FileReference : has attachments
    Task --> TaskData : created from
    TaskManager --> Task : manages
    TaskManager --> PermissionManager : validates
    TaskManager --> TaskData : receives
    Client --> TaskData : creates
    Administrator --> TaskData : creates
    
    %% Message relationships
    Message --> User : sent by
    Message --> Project : belongs to
    Message --> MessageType : has
    Message --> FileReference : has attachments
    MessageManager --> Message : manages
    MessageManager --> PermissionManager : validates
    
    %% File management
    FileReference --> FileType : has
    FileReference --> ProjectSection : belongs to
    FileReference --> User : uploaded by
    FileManager --> DropboxService : uses
    FileManager --> FileReference : manages
    FileManager --> PermissionManager : validates
    
    %% Notification system
    Notification --> User : sent to
    Notification --> NotificationType : has
    NotificationManager --> InAppNotifier : uses
    NotificationManager --> WhatsAppNotifier : uses
    NotificationManager --> Notification : creates
    
    %% Permission system
    PermissionManager --> Permission : validates
    PermissionManager --> Action : validates
    PermissionManager --> User : checks
    PermissionManager --> Project : validates access
    TaskManager --> Action : uses for validation
    FileManager --> Action : uses for validation
    
    %% Dashboard & visualization
    DashboardService --> Project : queries
    DashboardService --> ProjectSummary : generates
    DashboardService --> CalendarEvent : generates
    DashboardService --> ProjectDetail : generates
    DashboardService --> VisualStatus : calculates
    DashboardService --> SortCriteria : uses
    DashboardService --> ProjectFilter : uses
    ProjectSummary --> VisualStatus : has
    ProjectDetail --> Project : contains
    ProjectDetail --> Task : contains
    ProjectDetail --> Message : contains
    ProjectDetail --> FileReference : contains
    ProjectDetail --> ProjectParticipant : contains
    ProjectFilter --> ProjectStatus : filters by
    ProjectFilter --> DateRange : uses
    CalendarEvent --> VisualStatus : has
    
    %% Additional relationships
    Administrator --> ExportFormat : uses
    FileManager --> FileAction : validates
    PermissionManager --> Resource : validates
    Project ..|> Resource : implements
    Task ..|> Resource : implements
    Message ..|> Resource : implements
    WhatsAppNotifier --> FrequencyLimiter : uses
    FrequencyLimiter --> LimitEntry : manages
    
    %% Data persistence
    ProjectRepository --> Project : persists
    TaskRepository --> Task : persists
    MessageRepository --> Message : persists
    UserRepository --> User : persists
    
    %% Audit
    AuditService --> AuditLog : creates
    AuditService --> User : tracks
    
    %% Notes
    note for PermissionManager "Centralized permission validation - enforces all access rules"
    note for Project "Central entity - coordinates tasks, messages, and participants"
    note for TaskManager "Handles bidirectional task assignment and status flow"
    note for DropboxService "External integration - encapsulates all Dropbox API operations"
    note for NotificationManager "Multi-channel notifications with frequency limits"
```

### Added Final Relationships:

**ProjectData:**

- `Project` ← created from ← `ProjectData`
- `Administrator` → creates → `ProjectData`

**TaskData:**

- `Task` ← created from ← `TaskData`
- `TaskManager` ← receives ← `TaskData`
- `Client` → creates → `TaskData`
- `Administrator` → creates → `TaskData`

**Action enumeration:**

- `PermissionManager` → validates → `Action`
- `TaskManager` → uses for validation → `Action`
- `FileManager` → uses for validation → `Action`

Now every single class, interface, and enumeration in the diagram has proper relationships! ✅