# Initial

Excellent! I've created a comprehensive UML diagram for the cartographic project management system. Here's the structure:

## 🗺️ **Architecture Overview (30+ classes organized in layers):**

### **User & Authentication Layer (7 classes):**

1. **User** (abstract) - Base class for all user types
2. **Administrator** - Full system control
3. **Client** - Limited to assigned projects
4. **SpecialUser** - Configurable permissions
5. **UserRole** - Enum for role types
6. **Permission** - Enum with 16 granular permissions

### **Project Layer (5 classes):**

1. **Project** - Core project entity with all fields
2. **ProjectData** - Interface for project creation
3. **ProjectSection** - Enum for 4 sections
4. **ProjectStatus** - Tracks task/message status
5. **StatusColor** - Red/Green visual indicators

### **Task Layer (4 classes):**

1. **Task** - Bidirectional task assignment
2. **TaskData** - Interface for task creation
3. **TaskStatus** - 5-state workflow
4. **Priority** - High/Medium/Low

### **Messaging Layer (2 classes):**

1. **Message** - Project-specific messages
2. **MessageThread** - Organizes project messages

### **File Management Layer (4 classes):**

1. **File** - File metadata and references
2. **FileType** - PDF/KML/SHP/Image/Other
3. **CloudStorageService** - Interface for cloud integration
4. **DropboxService** - Concrete Dropbox implementation

### **Notification Layer (3 classes):**

1. **Notification** - Individual notifications
2. **NotificationType** - 6 notification types
3. **NotificationService** - Multi-channel delivery

### **Application Services Layer (5 classes):**

1. **ProjectService** - Project management operations
2. **TaskService** - Task CRUD and workflow
3. **MessageService** - Messaging operations
4. **FileService** - File upload/download/management
5. **CalendarService** - Date-based project views

### **Main Controller (3 classes):**

1. **ApplicationController** - Main orchestrator
2. **MainScreenData** - Interface for main view
3. **CalendarData** - Interface for calendar view

## ✅ **Design Highlights:**

- **Role-based access control** with inheritance (Administrator, Client, SpecialUser)
- **Granular permissions** system (16 permission types)
- **Service layer** separates business logic from data
- **Cloud storage abstraction** allows easy provider switching
- **No god classes** - responsibilities well distributed
- **Bidirectional relationships** properly modeled
- **Notification system** supports multiple channels
- **Testable architecture** with clear separation

```mermaid
classDiagram
    %% ============================================
    %% CARTOGRAPHIC PROJECT MANAGEMENT SYSTEM
    %% ============================================

    %% ============================================
    %% USER & AUTHENTICATION LAYER
    %% ============================================
    
    class User {
        <<abstract>>
        #id: string
        #name: string
        #email: string
        #password: string
        #createdAt: Date
        
        +constructor(name: string, email: string, password: string)
        +getId(): string
        +getName(): string
        +getEmail(): string
        +updateProfile(name: string, email: string): void
        +changePassword(newPassword: string): void
        +getRole(): UserRole*
        +hasPermission(permission: Permission): boolean*
    }

    class Administrator {
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
        +createProject(projectData: ProjectData): Project
        +deleteProject(projectId: string): void
        +assignProjectToClient(projectId: string, clientId: string): void
        +configureSpecialUserPermissions(userId: string, permissions: Permission[]): void
        +markProjectAsCompleted(projectId: string): void
    }

    class Client {
        -assignedProjects: string[]
        
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
        +getAssignedProjects(): string[]
        +canAccessProject(projectId: string): boolean
        +canModifyTask(task: Task): boolean
        +canDeleteTask(task: Task): boolean
    }

    class SpecialUser {
        -assignedProjects: string[]
        -permissions: Permission[]
        
        +constructor(name: string, email: string, password: string, permissions: Permission[])
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
        +getAssignedProjects(): string[]
        +getPermissions(): Permission[]
        +updatePermissions(permissions: Permission[]): void
        +canAccessProject(projectId: string): boolean
    }

    class UserRole {
        <<enumeration>>
        ADMINISTRATOR
        CLIENT
        SPECIAL_USER
    }

    class Permission {
        <<enumeration>>
        CREATE_PROJECT
        DELETE_PROJECT
        EDIT_PROJECT
        VIEW_PROJECT
        CREATE_TASK
        EDIT_ANY_TASK
        EDIT_OWN_TASK
        DELETE_ANY_TASK
        DELETE_OWN_TASK
        VIEW_TASK
        SEND_MESSAGE
        VIEW_MESSAGE
        UPLOAD_FILE
        DOWNLOAD_FILE
        MARK_PROJECT_COMPLETE
        CONFIGURE_PERMISSIONS
    }

    %% ============================================
    %% PROJECT LAYER
    %% ============================================

    class Project {
        -id: string
        -year: number
        -clientId: string
        -code: string
        -folderPath: string
        -name: string
        -type: string
        -coordinateX: number
        -coordinateY: number
        -contractDate: Date
        -deliveryDate: Date
        -sections: ProjectSection[]
        -isCompleted: boolean
        -participants: string[]
        
        +constructor(projectData: ProjectData)
        +getId(): string
        +getCode(): string
        +getName(): string
        +getClient(): string
        +getDeliveryDate(): Date
        +getSections(): ProjectSection[]
        +addParticipant(userId: string): void
        +removeParticipant(userId: string): void
        +getParticipants(): string[]
        +isComplete(): boolean
        +markAsCompleted(): void
        +hasPendingTasks(): boolean
        +updateDetails(data: Partial~ProjectData~): void
    }

    class ProjectData {
        <<interface>>
        +year: number
        +clientId: string
        +code: string
        +folderPath: string
        +name: string
        +type: string
        +coordinateX: number
        +coordinateY: number
        +contractDate: Date
        +deliveryDate: Date
    }

    class ProjectSection {
        <<enumeration>>
        REPORT_AND_ANNEXES
        PLANS
        SPECIFICATIONS
        BUDGET
    }

    class ProjectStatus {
        +projectId: string
        +hasPendingTasks: boolean
        +unreadMessageCount: number
        +participants: User[]
        
        +constructor(projectId: string)
        +getStatusColor(): StatusColor
        +updateTaskStatus(hasPending: boolean): void
        +incrementUnreadMessages(): void
        +markMessagesAsRead(): void
    }

    class StatusColor {
        <<enumeration>>
        RED
        GREEN
    }

    %% ============================================
    %% TASK LAYER
    %% ============================================

    class Task {
        -id: string
        -projectId: string
        -description: string
        -assignedUserId: string
        -creatorUserId: string
        -priority: Priority
        -deadline: Date
        -status: TaskStatus
        -attachedFiles: string[]
        -createdAt: Date
        -updatedAt: Date
        
        +constructor(taskData: TaskData)
        +getId(): string
        +getProjectId(): string
        +getDescription(): string
        +getAssignedUser(): string
        +getCreator(): string
        +getPriority(): Priority
        +getStatus(): TaskStatus
        +getDeadline(): Date
        +updateStatus(newStatus: TaskStatus): void
        +attachFile(fileId: string): void
        +removeFile(fileId: string): void
        +getAttachedFiles(): string[]
        +isCreatedBy(userId: string): boolean
        +isAssignedTo(userId: string): boolean
        +canBeModifiedBy(user: User): boolean
        +canBeDeletedBy(user: User): boolean
    }

    class TaskData {
        <<interface>>
        +projectId: string
        +description: string
        +assignedUserId: string
        +creatorUserId: string
        +priority: Priority
        +deadline: Date
    }

    class TaskStatus {
        <<enumeration>>
        PENDING
        IN_PROGRESS
        PARTIAL
        DONE
        COMPLETED
    }

    class Priority {
        <<enumeration>>
        HIGH
        MEDIUM
        LOW
    }

    %% ============================================
    %% MESSAGING LAYER
    %% ============================================

    class Message {
        -id: string
        -projectId: string
        -senderId: string
        -content: string
        -attachedFiles: string[]
        -sentAt: Date
        -readBy: string[]
        
        +constructor(projectId: string, senderId: string, content: string)
        +getId(): string
        +getProjectId(): string
        +getSenderId(): string
        +getContent(): string
        +getAttachedFiles(): string[]
        +getSentAt(): Date
        +attachFile(fileId: string): void
        +markAsReadBy(userId: string): void
        +isReadBy(userId: string): boolean
        +getUnreadCount(participants: string[]): number
    }

    class MessageThread {
        -projectId: string
        -messages: Message[]
        
        +constructor(projectId: string)
        +addMessage(message: Message): void
        +getMessages(): Message[]
        +getUnreadMessages(userId: string): Message[]
        +getUnreadCount(userId: string): number
        +markAllAsRead(userId: string): void
    }

    %% ============================================
    %% FILE MANAGEMENT LAYER
    %% ============================================

    class File {
        -id: string
        -name: string
        -type: FileType
        -path: string
        -projectId: string
        -uploadedBy: string
        -uploadedAt: Date
        -size: number
        
        +constructor(name: string, type: FileType, path: string, projectId: string, uploadedBy: string)
        +getId(): string
        +getName(): string
        +getType(): FileType
        +getPath(): string
        +getProjectId(): string
        +getUploadedBy(): string
        +getSize(): number
    }

    class FileType {
        <<enumeration>>
        PDF
        KML
        SHP
        IMAGE
        OTHER
    }

    class CloudStorageService {
        <<interface>>
        +uploadFile(file: File, destinationPath: string): Promise~string~
        +downloadFile(fileId: string): Promise~Blob~
        +deleteFile(fileId: string): Promise~void~
        +createProjectFolder(projectCode: string): Promise~string~
        +listFiles(folderPath: string): Promise~File[]~
        +shareFile(fileId: string, userId: string): Promise~string~
    }

    class DropboxService {
        -apiKey: string
        -accessToken: string
        
        +constructor(apiKey: string, accessToken: string)
        +uploadFile(file: File, destinationPath: string): Promise~string~
        +downloadFile(fileId: string): Promise~Blob~
        +deleteFile(fileId: string): Promise~void~
        +createProjectFolder(projectCode: string): Promise~string~
        +listFiles(folderPath: string): Promise~File[]~
        +shareFile(fileId: string, userId: string): Promise~string~
        -authenticate(): Promise~void~
    }

    %% ============================================
    %% NOTIFICATION LAYER
    %% ============================================

    class Notification {
        -id: string
        -userId: string
        -type: NotificationType
        -title: string
        -content: string
        -relatedEntityId: string
        -createdAt: Date
        -isRead: boolean
        
        +constructor(userId: string, type: NotificationType, title: string, content: string)
        +getId(): string
        +getUserId(): string
        +getType(): NotificationType
        +getContent(): string
        +markAsRead(): void
        +isRead(): boolean
    }

    class NotificationType {
        <<enumeration>>
        NEW_MESSAGE
        FILE_RECEIVED
        TASK_ASSIGNED
        TASK_COMPLETED
        TASK_STATUS_CHANGED
        TASK_CONFIRMED
    }

    class NotificationService {
        -notifications: Notification[]
        
        +sendNotification(notification: Notification): void
        +sendWhatsAppNotification(userId: string, message: string): void
        +getUserNotifications(userId: string): Notification[]
        +getUnreadCount(userId: string): number
        +markAsRead(notificationId: string): void
        +markAllAsRead(userId: string): void
        -createNotification(userId: string, type: NotificationType, content: string): Notification
    }

    %% ============================================
    %% APPLICATION SERVICES LAYER
    %% ============================================

    class ProjectService {
        -projects: Map~string, Project~
        -projectStatuses: Map~string, ProjectStatus~
        
        +createProject(admin: Administrator, data: ProjectData): Project
        +getProject(projectId: string): Project | null
        +updateProject(projectId: string, data: Partial~ProjectData~): void
        +deleteProject(admin: Administrator, projectId: string): void
        +assignProjectToClient(admin: Administrator, projectId: string, clientId: string): void
        +getClientProjects(clientId: string): Project[]
        +getProjectsByDeliveryDate(): Project[]
        +getProjectStatus(projectId: string): ProjectStatus
        +markProjectAsCompleted(projectId: string): void
    }

    class TaskService {
        -tasks: Map~string, Task~
        
        +createTask(user: User, taskData: TaskData): Task
        +getTask(taskId: string): Task | null
        +updateTask(taskId: string, user: User, updates: Partial~TaskData~): void
        +deleteTask(taskId: string, user: User): void
        +getProjectTasks(projectId: string): Task[]
        +getUserTasks(userId: string): Task[]
        +updateTaskStatus(taskId: string, newStatus: TaskStatus): void
        +confirmTaskCompletion(taskId: string, userId: string): void
        +getTasksByStatus(projectId: string, status: TaskStatus): Task[]
    }

    class MessageService {
        -threads: Map~string, MessageThread~
        
        +sendMessage(projectId: string, senderId: string, content: string, files: string[]): Message
        +getProjectMessages(projectId: string): Message[]
        +getUnreadMessages(projectId: string, userId: string): Message[]
        +markMessagesAsRead(projectId: string, userId: string): void
        +getUnreadCount(projectId: string, userId: string): number
    }

    class FileService {
        -files: Map~string, File~
        -cloudStorage: CloudStorageService
        
        +constructor(cloudStorage: CloudStorageService)
        +uploadFile(file: File, projectId: string, userId: string): Promise~string~
        +downloadFile(fileId: string, user: User): Promise~Blob~
        +deleteFile(fileId: string, user: User): Promise~void~
        +getProjectFiles(projectId: string): File[]
        +attachFileToTask(taskId: string, fileId: string): void
        +attachFileToMessage(messageId: string, fileId: string): void
    }

    class CalendarService {
        +getProjectsByMonth(year: number, month: number): Project[]
        +getProjectsByDateRange(startDate: Date, endDate: Date): Project[]
        +getUpcomingDeadlines(daysAhead: number): Project[]
        +groupProjectsByDate(projects: Project[]): Map~Date, Project[]~
    }

    %% ============================================
    %% MAIN APPLICATION CONTROLLER
    %% ============================================

    class ApplicationController {
        -projectService: ProjectService
        -taskService: TaskService
        -messageService: MessageService
        -fileService: FileService
        -notificationService: NotificationService
        -calendarService: CalendarService
        -currentUser: User
        
        +constructor(currentUser: User)
        +initialize(): void
        +createProject(data: ProjectData): Project
        +assignTask(taskData: TaskData): Task
        +sendMessage(projectId: string, content: string, files: string[]): void
        +uploadFile(file: File, projectId: string): Promise~string~
        +updateTaskStatus(taskId: string, newStatus: TaskStatus): void
        +getMainScreenData(): MainScreenData
        +getCalendarData(year: number, month: number): CalendarData
        +getUserNotifications(): Notification[]
        -checkPermission(permission: Permission): boolean
        -notifyParticipants(projectId: string, notification: Notification): void
    }

    class MainScreenData {
        <<interface>>
        +projects: Project[]
        +projectStatuses: Map~string, ProjectStatus~
        +unreadMessageCounts: Map~string, number~
        +pendingTaskCounts: Map~string, number~
    }

    class CalendarData {
        <<interface>>
        +projectsByDate: Map~Date, Project[]~
        +currentMonth: number
        +currentYear: number
    }

    %% ============================================
    %% RELATIONSHIPS
    %% ============================================

    %% User inheritance
    Administrator --|> User : extends
    Client --|> User : extends
    SpecialUser --|> User : extends

    %% User associations
    User --> UserRole : has
    User --> Permission : checks
    Administrator --> Project : creates/manages
    Client --> Project : assigned to
    SpecialUser --> Project : assigned to

    %% Project relationships
    Project --> ProjectData : created from
    Project --> ProjectSection : organized in
    Project --> ProjectStatus : has
    ProjectStatus --> StatusColor : displays

    %% Task relationships
    Task --> TaskData : created from
    Task --> TaskStatus : has
    Task --> Priority : has
    Task --> Project : belongs to
    Task --> User : assigned to/created by

    %% Message relationships
    Message --> Project : belongs to
    Message --> User : sent by
    MessageThread --> Message : contains
    MessageThread --> Project : associated with

    %% File relationships
    File --> FileType : has
    File --> Project : belongs to
    File --> User : uploaded by
    DropboxService ..|> CloudStorageService : implements

    %% Notification relationships
    Notification --> NotificationType : has
    Notification --> User : sent to
    NotificationService --> Notification : manages

    %% Service relationships
    ProjectService --> Project : manages
    ProjectService --> ProjectStatus : tracks
    TaskService --> Task : manages
    MessageService --> MessageThread : manages
    MessageService --> Message : handles
    FileService --> File : manages
    FileService --> CloudStorageService : uses
    CalendarService --> Project : organizes

    %% Controller relationships
    ApplicationController --> ProjectService : uses
    ApplicationController --> TaskService : uses
    ApplicationController --> MessageService : uses
    ApplicationController --> FileService : uses
    ApplicationController --> NotificationService : uses
    ApplicationController --> CalendarService : uses
    ApplicationController --> User : manages
    ApplicationController --> MainScreenData : provides
    ApplicationController --> CalendarData : provides

    %% ============================================
    %% NOTES
    %% ============================================
    
    note for User "Abstract base class\nDefines common user behavior\nRole-based permissions"
    
    note for Administrator "Full system access\nCan create projects and configure permissions"
    
    note for Client "Limited to assigned projects\nCan create tasks for administrator"
    
    note for SpecialUser "Configurable permissions\nRestricted project access"
    
    note for Project "Flat structure with 4 sections\nTracks participants and completion"
    
    note for Task "Bidirectional assignment\nRequires confirmation for completion"
    
    note for MessageThread "Project-specific messaging\nSupports file attachments"
    
    note for CloudStorageService "Interface for cloud integration\nDropbox implementation provided"
    
    note for NotificationService "Multi-channel notifications\nIn-app and WhatsApp support"
    
    note for ApplicationController "Main orchestrator\nEnforces permissions and coordinates services"
```