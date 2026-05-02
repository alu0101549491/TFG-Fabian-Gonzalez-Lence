# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → Infrastructure Layer → **Presentation Layer** (current)

**Current module:** Presentation Layer - Pinia Stores (State Management)

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/
│   │   ├── dto/                            # ✅ Already implemented
│   │   ├── interfaces/                     # ✅ Already implemented
│   │   ├── services/                       # ✅ Already implemented
│   │   └── index.ts
│   ├── domain/                             # ✅ Already implemented
│   ├── infrastructure/                     # ✅ Already implemented
│   ├── shared/                             # ✅ Already implemented
│   └── presentation/
│       ├── assets/
│       │   └── styles/                     # ✅ Already implemented
│       ├── components/
│       │   └── ...
│       ├── composables/
│       │   └── ...
│       ├── router/
│       │   └── ...
│       ├── stores/
│       │   ├── index.ts                    # 🎯 TO IMPLEMENT
│       │   ├── auth.store.ts               # 🎯 TO IMPLEMENT
│       │   ├── project.store.ts            # 🎯 TO IMPLEMENT
│       │   ├── task.store.ts               # 🎯 TO IMPLEMENT
│       │   ├── message.store.ts            # 🎯 TO IMPLEMENT
│       │   └── notification.store.ts       # 🎯 TO IMPLEMENT
│       ├── views/
│       │   └── ...
│       ├── App.vue
│       └── main.ts
```

---

# INPUT ARTIFACTS

## 1. Application Services (Already Implemented)

The stores will use these application services:

```typescript
// IAuthenticationService
login(credentials: LoginCredentialsDto): Promise<AuthResultDto>
logout(userId: string): Promise<void>
validateSession(token: string): Promise<SessionDto>
refreshSession(refreshToken: string): Promise<AuthResultDto>

// IProjectService
createProject(data: CreateProjectDto, creatorId: string): Promise<ProjectDto>
updateProject(data: UpdateProjectDto, userId: string): Promise<ProjectDto>
deleteProject(projectId: string, userId: string): Promise<void>
getProjectById(projectId: string, userId: string): Promise<ProjectDetailsDto>
getProjectsByUser(userId: string, filters?: ProjectFilterDto): Promise<ProjectListResponseDto>
finalizeProject(projectId: string, adminId: string): Promise<void>
getProjectsForCalendar(userId: string, startDate: Date, endDate: Date): Promise<CalendarProjectDto[]>

// ITaskService
createTask(data: CreateTaskDto, creatorId: string): Promise<TaskDto>
updateTask(data: UpdateTaskDto, userId: string): Promise<TaskDto>
deleteTask(taskId: string, userId: string): Promise<void>
getTasksByProject(projectId: string, userId: string, filters?: TaskFilterDto): Promise<TaskListResponseDto>
changeTaskStatus(data: ChangeTaskStatusDto, userId: string): Promise<TaskDto>
confirmTask(data: ConfirmTaskDto, userId: string): Promise<TaskDto>

// IMessageService
sendMessage(data: CreateMessageDto, senderId: string): Promise<MessageDto>
getMessagesByProject(projectId: string, userId: string, filters?: MessageFilterDto): Promise<MessageListResponseDto>
markMessageAsRead(messageId: string, userId: string): Promise<void>
markAllMessagesAsRead(projectId: string, userId: string): Promise<void>
getUnreadCountsByUser(userId: string): Promise<UnreadCountsDto[]>

// INotificationService
getNotificationsByUser(userId: string, filters?: NotificationFilterDto): Promise<NotificationListResponseDto>
markAsRead(notificationId: string, userId: string): Promise<void>
markAllAsRead(userId: string): Promise<void>
getUnreadCount(userId: string): Promise<number>
```

## 2. DTOs (Already Implemented)

Key DTOs used by stores:

```typescript
// Auth
interface AuthResultDto {
  success: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  user: UserDto | null;
  error: string | null;
}

interface UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  phone: string | null;
  whatsappEnabled: boolean;
}

// Project
interface ProjectSummaryDto {
  id: string;
  code: string;
  name: string;
  clientId: string;
  clientName: string;
  type: ProjectType;
  deliveryDate: Date;
  status: ProjectStatus;
  hasPendingTasks: boolean;
  pendingTasksCount: number;
  unreadMessagesCount: number;
  statusColor: 'red' | 'green' | 'yellow' | 'gray';
  isOverdue: boolean;
  daysUntilDelivery: number;
}

interface ProjectDetailsDto {
  project: ProjectDto;
  tasks: TaskSummaryDto[];
  taskStats: { total: number; pending: number; completed: number; overdue: number };
  recentMessages: MessageSummaryDto[];
  unreadMessagesCount: number;
  participants: ParticipantDto[];
  sections: ProjectSectionDto[];
  currentUserPermissions: { canEdit: boolean; canDelete: boolean; /* ... */ };
}

// Task
interface TaskDto {
  id: string;
  projectId: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  isOverdue: boolean;
  canModify: boolean;
  canConfirm: boolean;
  allowedStatusTransitions: TaskStatus[];
}

// Message
interface MessageDto {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: Date;
  files: FileSummaryDto[];
  isRead: boolean;
  isSystemMessage: boolean;
}

// Notification
interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId: string | null;
  createdAt: Date;
  isRead: boolean;
}
```

## 3. WebSocket Events (Already Implemented)

Stores will react to these WebSocket events:

```typescript
// Notification events
'notification:new' → NotificationPayload
'notification:count' → { unreadCount: number }

// Message events
'message:new' → MessagePayload
'messages:unread-count' → { projectId: string; count: number }

// Task events
'task:created' → TaskPayload
'task:updated' → TaskPayload
'task:deleted' → { taskId: string; projectId: string }
'task:status-changed' → TaskStatusChangedPayload

// Project events
'project:updated' → ProjectPayload
'project:finalized' → { projectId: string }
```

## 4. Requirements for State Management

### Authentication State (Section 7)
- Current user information
- Authentication status
- Access token management
- Session expiration tracking
- Login/logout operations

### Project State (Section 9)
- List of projects (with filtering/sorting)
- Current project details
- Calendar projects
- Loading states
- Error handling
- Real-time updates

### Task State (Section 10)
- Tasks by project
- Task filtering (status, priority, assignee)
- Task CRUD operations
- Status transitions
- Task confirmation
- Real-time updates

### Message State (Section 11)
- Messages by project
- Unread counts per project
- Pagination
- Real-time new messages
- Mark as read operations

### Notification State (Section 13)
- User notifications
- Unread count (for badge)
- Mark as read operations
- Real-time new notifications

---

# SPECIFIC TASK

Implement all Pinia stores for the Presentation Layer. These stores manage application state and provide reactive data to Vue components.

## Files to implement:

### 1. **auth.store.ts**

**Responsibilities:**
- Manage authentication state
- Handle login/logout operations
- Store user information
- Manage tokens (access + refresh)
- Track session validity
- Persist auth state to localStorage

**State:**

```typescript
interface AuthState {
  // User data
  user: UserDto | null;
  
  // Token data
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  
  // Status flags
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Error handling
  error: string | null;
  errorCode: string | null;
}
```

**Getters:**

```typescript
// User info
userId: (state) => state.user?.id ?? null
username: (state) => state.user?.username ?? ''
userEmail: (state) => state.user?.email ?? ''
userRole: (state) => state.user?.role ?? null

// Role checks
isAdmin: (state) => state.user?.role === UserRole.ADMINISTRATOR
isClient: (state) => state.user?.role === UserRole.CLIENT
isSpecialUser: (state) => state.user?.role === UserRole.SPECIAL_USER

// Session status
isSessionValid: (state) => {
  if (!state.expiresAt) return false;
  return new Date() < new Date(state.expiresAt);
}
tokenExpiresIn: (state) => {
  // Returns minutes until expiration
}
```

**Actions:**

```typescript
// Authentication
async login(credentials: LoginCredentialsDto): Promise<boolean>
async logout(): Promise<void>
async refreshSession(): Promise<boolean>
async validateSession(): Promise<boolean>

// Initialization
async initialize(): Promise<void>  // Called on app start

// State management
setUser(user: UserDto): void
setTokens(accessToken: string, refreshToken: string, expiresAt: Date): void
clearAuth(): void

// Error handling
setError(error: string, code?: string): void
clearError(): void

// Persistence
saveToStorage(): void
loadFromStorage(): void
clearStorage(): void
```

**Implementation Details:**

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserDto, LoginCredentialsDto, AuthResultDto } from '@/application/dto';
import { UserRole } from '@/domain/enumerations';
import { STORAGE_KEYS } from '@/shared/constants';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserDto | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const expiresAt = ref<Date | null>(null);
  const isLoading = ref(false);
  const isInitialized = ref(false);
  const error = ref<string | null>(null);
  const errorCode = ref<string | null>(null);
  
  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const userId = computed(() => user.value?.id ?? null);
  const isAdmin = computed(() => user.value?.role === UserRole.ADMINISTRATOR);
  // ... more getters
  
  // Actions
  async function login(credentials: LoginCredentialsDto): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.user && result.accessToken) {
        user.value = result.user;
        accessToken.value = result.accessToken;
        refreshToken.value = result.refreshToken;
        expiresAt.value = result.expiresAt;
        
        saveToStorage();
        return true;
      } else {
        error.value = result.error ?? 'Login failed';
        errorCode.value = result.errorCode ?? null;
        return false;
      }
    } catch (e) {
      error.value = 'An unexpected error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  // ... more actions
  
  return {
    // State
    user,
    accessToken,
    refreshToken,
    expiresAt,
    isLoading,
    isInitialized,
    error,
    errorCode,
    
    // Getters
    isAuthenticated,
    userId,
    isAdmin,
    // ...
    
    // Actions
    login,
    logout,
    refreshSession,
    initialize,
    // ...
  };
});
```

---

### 2. **project.store.ts**

**Responsibilities:**
- Manage project list state
- Handle current project details
- Support project filtering and sorting
- Handle CRUD operations
- Manage calendar view data
- React to real-time updates

**State:**

```typescript
interface ProjectState {
  // Project lists
  projects: ProjectSummaryDto[];
  calendarProjects: CalendarProjectDto[];
  
  // Current project
  currentProject: ProjectDetailsDto | null;
  
  // Pagination
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // Filters
  filters: ProjectFilterDto;
  
  // Status
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
}
```

**Getters:**

```typescript
// Lists
activeProjects: (state) => state.projects.filter(p => p.status !== 'FINALIZED')
finalizedProjects: (state) => state.projects.filter(p => p.status === 'FINALIZED')
overdueProjects: (state) => state.projects.filter(p => p.isOverdue)

// Current project
hasCurrentProject: (state) => !!state.currentProject
currentProjectId: (state) => state.currentProject?.project.id ?? null
currentProjectTasks: (state) => state.currentProject?.tasks ?? []
currentProjectMessages: (state) => state.currentProject?.recentMessages ?? []
currentProjectParticipants: (state) => state.currentProject?.participants ?? []

// Stats
totalProjects: (state) => state.pagination.total
projectsWithPendingTasks: (state) => state.projects.filter(p => p.hasPendingTasks).length

// Calendar
calendarProjectsByDate: (state) => {
  // Group projects by delivery date for calendar view
}
```

**Actions:**

```typescript
// Fetch operations
async fetchProjects(filters?: ProjectFilterDto): Promise<void>
async fetchProjectById(projectId: string): Promise<void>
async fetchCalendarProjects(startDate: Date, endDate: Date): Promise<void>
async refreshCurrentProject(): Promise<void>

// CRUD operations
async createProject(data: CreateProjectDto): Promise<ProjectDto | null>
async updateProject(data: UpdateProjectDto): Promise<ProjectDto | null>
async deleteProject(projectId: string): Promise<boolean>
async finalizeProject(projectId: string): Promise<boolean>

// Participant management
async addSpecialUser(projectId: string, userId: string, permissions: AccessRight[]): Promise<boolean>
async removeSpecialUser(projectId: string, userId: string): Promise<boolean>

// Filter management
setFilters(filters: Partial<ProjectFilterDto>): void
resetFilters(): void
setPage(page: number): void

// Real-time updates
handleProjectUpdated(payload: ProjectPayload): void
handleProjectFinalized(payload: { projectId: string }): void

// State management
clearCurrentProject(): void
clearError(): void
```

**Implementation Details:**

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth.store';

export const useProjectStore = defineStore('project', () => {
  const authStore = useAuthStore();
  
  // State
  const projects = ref<ProjectSummaryDto[]>([]);
  const currentProject = ref<ProjectDetailsDto | null>(null);
  const calendarProjects = ref<CalendarProjectDto[]>([]);
  const pagination = ref({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const filters = ref<ProjectFilterDto>({});
  const isLoading = ref(false);
  const isLoadingDetails = ref(false);
  const error = ref<string | null>(null);
  
  // Getters
  const activeProjects = computed(() => 
    projects.value.filter(p => p.status !== ProjectStatus.FINALIZED)
  );
  
  // Actions
  async function fetchProjects(newFilters?: ProjectFilterDto) {
    if (!authStore.userId) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters };
      }
      
      const response = await projectService.getProjectsByUser(
        authStore.userId,
        filters.value
      );
      
      projects.value = response.projects;
      pagination.value = {
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      };
    } catch (e) {
      error.value = 'Failed to load projects';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchProjectById(projectId: string) {
    if (!authStore.userId) return;
    
    isLoadingDetails.value = true;
    error.value = null;
    
    try {
      currentProject.value = await projectService.getProjectById(
        projectId,
        authStore.userId
      );
    } catch (e) {
      error.value = 'Failed to load project details';
      currentProject.value = null;
    } finally {
      isLoadingDetails.value = false;
    }
  }
  
  // Real-time update handlers
  function handleProjectUpdated(payload: ProjectPayload) {
    // Update in list
    const index = projects.value.findIndex(p => p.id === payload.id);
    if (index !== -1) {
      // Merge update into existing project
      projects.value[index] = { ...projects.value[index], ...payload };
    }
    
    // Update current project if same
    if (currentProject.value?.project.id === payload.id) {
      currentProject.value.project = { 
        ...currentProject.value.project, 
        ...payload 
      };
    }
  }
  
  return {
    // State
    projects,
    currentProject,
    calendarProjects,
    pagination,
    filters,
    isLoading,
    isLoadingDetails,
    error,
    
    // Getters
    activeProjects,
    // ...
    
    // Actions
    fetchProjects,
    fetchProjectById,
    fetchCalendarProjects,
    createProject,
    updateProject,
    deleteProject,
    handleProjectUpdated,
    handleProjectFinalized,
    // ...
  };
});
```

---

### 3. **task.store.ts**

**Responsibilities:**
- Manage tasks for current project
- Support task filtering
- Handle task CRUD operations
- Manage status transitions
- Handle task confirmation
- React to real-time updates

**State:**

```typescript
interface TaskState {
  // Tasks by project (keyed by projectId)
  tasksByProject: Map<string, TaskDto[]>;
  
  // Current task being viewed/edited
  currentTask: TaskDto | null;
  
  // Task history
  taskHistory: TaskHistoryEntryDto[];
  
  // Filters
  filters: TaskFilterDto;
  
  // Pagination
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // Status
  isLoading: boolean;
  isLoadingHistory: boolean;
  isSaving: boolean;
  error: string | null;
}
```

**Getters:**

```typescript
// Get tasks for a specific project
getTasksForProject: (state) => (projectId: string) => state.tasksByProject.get(projectId) ?? []

// Current project tasks (based on current project in project store)
currentProjectTasks: (state) => {
  const projectStore = useProjectStore();
  if (!projectStore.currentProjectId) return [];
  return state.tasksByProject.get(projectStore.currentProjectId) ?? [];
}

// Filtered tasks
filteredTasks: (state) => {
  // Apply filters to current project tasks
}

// Task counts
pendingTasksCount: (state) => // count tasks not completed
overdueTasksCount: (state) => // count overdue tasks

// Current task
hasCurrentTask: (state) => !!state.currentTask
canConfirmCurrentTask: (state) => state.currentTask?.canConfirm ?? false
currentTaskAllowedTransitions: (state) => state.currentTask?.allowedStatusTransitions ?? []
```

**Actions:**

```typescript
// Fetch operations
async fetchTasksByProject(projectId: string, filters?: TaskFilterDto): Promise<void>
async fetchTaskById(taskId: string): Promise<void>
async fetchTaskHistory(taskId: string): Promise<void>

// CRUD operations
async createTask(data: CreateTaskDto): Promise<TaskDto | null>
async updateTask(data: UpdateTaskDto): Promise<TaskDto | null>
async deleteTask(taskId: string): Promise<boolean>

// Status operations
async changeTaskStatus(taskId: string, newStatus: TaskStatus, comment?: string): Promise<boolean>
async confirmTask(taskId: string, confirmed: boolean, feedback?: string): Promise<boolean>

// File operations
async attachFile(taskId: string, fileId: string): Promise<boolean>
async removeFile(taskId: string, fileId: string): Promise<boolean>

// Filter management
setFilters(filters: Partial<TaskFilterDto>): void
resetFilters(): void

// Real-time updates
handleTaskCreated(payload: TaskPayload): void
handleTaskUpdated(payload: TaskPayload): void
handleTaskDeleted(payload: { taskId: string; projectId: string }): void
handleTaskStatusChanged(payload: TaskStatusChangedPayload): void

// State management
setCurrentTask(task: TaskDto | null): void
clearTasksForProject(projectId: string): void
clearError(): void
```

**Implementation Details:**

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth.store';
import { useProjectStore } from './project.store';

export const useTaskStore = defineStore('task', () => {
  const authStore = useAuthStore();
  const projectStore = useProjectStore();
  
  // State
  const tasksByProject = ref<Map<string, TaskDto[]>>(new Map());
  const currentTask = ref<TaskDto | null>(null);
  const taskHistory = ref<TaskHistoryEntryDto[]>([]);
  const filters = ref<TaskFilterDto>({});
  const pagination = ref({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  
  // Getters
  const getTasksForProject = computed(() => (projectId: string) => {
    return tasksByProject.value.get(projectId) ?? [];
  });
  
  const currentProjectTasks = computed(() => {
    if (!projectStore.currentProjectId) return [];
    return tasksByProject.value.get(projectStore.currentProjectId) ?? [];
  });
  
  const pendingTasksCount = computed(() => {
    return currentProjectTasks.value.filter(
      t => t.status !== TaskStatus.COMPLETED
    ).length;
  });
  
  // Actions
  async function fetchTasksByProject(projectId: string, newFilters?: TaskFilterDto) {
    if (!authStore.userId) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters };
      }
      
      const response = await taskService.getTasksByProject(
        projectId,
        authStore.userId,
        filters.value
      );
      
      tasksByProject.value.set(projectId, response.tasks);
      pagination.value = {
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      };
    } catch (e) {
      error.value = 'Failed to load tasks';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function changeTaskStatus(
    taskId: string, 
    newStatus: TaskStatus, 
    comment?: string
  ): Promise<boolean> {
    if (!authStore.userId) return false;
    
    isSaving.value = true;
    error.value = null;
    
    try {
      const updatedTask = await taskService.changeTaskStatus(
        { taskId, newStatus, comment },
        authStore.userId
      );
      
      // Update task in store
      updateTaskInStore(updatedTask);
      
      if (currentTask.value?.id === taskId) {
        currentTask.value = updatedTask;
      }
      
      return true;
    } catch (e) {
      error.value = 'Failed to change task status';
      return false;
    } finally {
      isSaving.value = false;
    }
  }
  
  // Real-time handlers
  function handleTaskCreated(payload: TaskPayload) {
    const tasks = tasksByProject.value.get(payload.projectId) ?? [];
    tasksByProject.value.set(payload.projectId, [...tasks, payload as TaskDto]);
  }
  
  function handleTaskUpdated(payload: TaskPayload) {
    updateTaskInStore(payload as TaskDto);
  }
  
  function handleTaskDeleted(payload: { taskId: string; projectId: string }) {
    const tasks = tasksByProject.value.get(payload.projectId) ?? [];
    tasksByProject.value.set(
      payload.projectId,
      tasks.filter(t => t.id !== payload.taskId)
    );
    
    if (currentTask.value?.id === payload.taskId) {
      currentTask.value = null;
    }
  }
  
  // Helper
  function updateTaskInStore(task: TaskDto) {
    const tasks = tasksByProject.value.get(task.projectId) ?? [];
    const index = tasks.findIndex(t => t.id === task.id);
    
    if (index !== -1) {
      tasks[index] = task;
      tasksByProject.value.set(task.projectId, [...tasks]);
    }
  }
  
  return {
    // State
    tasksByProject,
    currentTask,
    taskHistory,
    filters,
    pagination,
    isLoading,
    isSaving,
    error,
    
    // Getters
    getTasksForProject,
    currentProjectTasks,
    pendingTasksCount,
    
    // Actions
    fetchTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    confirmTask,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    // ...
  };
});
```

---

### 4. **message.store.ts**

**Responsibilities:**
- Manage messages for current project
- Track unread counts per project
- Handle message sending
- Support pagination
- Mark messages as read
- React to real-time new messages

**State:**

```typescript
interface MessageState {
  // Messages by project (keyed by projectId)
  messagesByProject: Map<string, MessageDto[]>;
  
  // Unread counts per project
  unreadCounts: Map<string, number>;
  
  // Pagination per project
  paginationByProject: Map<string, {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }>;
  
  // Status
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}
```

**Getters:**

```typescript
// Get messages for a project
getMessagesForProject: (state) => (projectId: string) => state.messagesByProject.get(projectId) ?? []

// Current project messages
currentProjectMessages: (state) => {
  const projectStore = useProjectStore();
  if (!projectStore.currentProjectId) return [];
  return state.messagesByProject.get(projectStore.currentProjectId) ?? [];
}

// Unread count for a project
getUnreadCount: (state) => (projectId: string) => state.unreadCounts.get(projectId) ?? 0

// Total unread across all projects
totalUnreadCount: (state) => {
  let total = 0;
  state.unreadCounts.forEach(count => total += count);
  return total;
}

// Has more messages to load
hasMoreMessages: (state) => (projectId: string) => {
  const pagination = state.paginationByProject.get(projectId);
  return pagination?.hasMore ?? false;
}
```

**Actions:**

```typescript
// Fetch operations
async fetchMessagesByProject(projectId: string, loadMore?: boolean): Promise<void>
async fetchUnreadCounts(): Promise<void>

// Send message
async sendMessage(projectId: string, content: string, fileIds?: string[]): Promise<MessageDto | null>

// Read operations
async markAsRead(messageId: string, projectId: string): Promise<void>
async markAllAsRead(projectId: string): Promise<void>

// Real-time updates
handleNewMessage(payload: MessagePayload): void
handleUnreadCountUpdate(payload: { projectId: string; count: number }): void

// State management
clearMessagesForProject(projectId: string): void
clearError(): void
```

**Implementation Details:**

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth.store';
import { useProjectStore } from './project.store';

export const useMessageStore = defineStore('message', () => {
  const authStore = useAuthStore();
  const projectStore = useProjectStore();
  
  // State
  const messagesByProject = ref<Map<string, MessageDto[]>>(new Map());
  const unreadCounts = ref<Map<string, number>>(new Map());
  const paginationByProject = ref<Map<string, PaginationInfo>>(new Map());
  const isLoading = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);
  
  // Getters
  const getMessagesForProject = computed(() => (projectId: string) => {
    return messagesByProject.value.get(projectId) ?? [];
  });
  
  const totalUnreadCount = computed(() => {
    let total = 0;
    unreadCounts.value.forEach(count => total += count);
    return total;
  });
  
  // Actions
  async function fetchMessagesByProject(projectId: string, loadMore = false) {
    if (!authStore.userId) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const pagination = paginationByProject.value.get(projectId);
      const page = loadMore ? (pagination?.page ?? 0) + 1 : 1;
      
      const response = await messageService.getMessagesByProject(
        projectId,
        authStore.userId,
        { page, limit: 20 }
      );
      
      const existingMessages = loadMore 
        ? (messagesByProject.value.get(projectId) ?? [])
        : [];
      
      messagesByProject.value.set(projectId, [
        ...existingMessages,
        ...response.messages,
      ]);
      
      paginationByProject.value.set(projectId, {
        total: response.total,
        page: response.page,
        limit: response.limit,
        hasMore: response.page < response.totalPages,
      });
      
      // Update unread count from response
      unreadCounts.value.set(projectId, response.unreadCount);
      
    } catch (e) {
      error.value = 'Failed to load messages';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function sendMessage(
    projectId: string, 
    content: string, 
    fileIds?: string[]
  ): Promise<MessageDto | null> {
    if (!authStore.userId) return null;
    
    isSending.value = true;
    error.value = null;
    
    try {
      const message = await messageService.sendMessage(
        { projectId, content, fileIds },
        authStore.userId
      );
      
      // Add to local state
      const messages = messagesByProject.value.get(projectId) ?? [];
      messagesByProject.value.set(projectId, [message, ...messages]);
      
      return message;
    } catch (e) {
      error.value = 'Failed to send message';
      return null;
    } finally {
      isSending.value = false;
    }
  }
  
  // Real-time handlers
  function handleNewMessage(payload: MessagePayload) {
    const messages = messagesByProject.value.get(payload.projectId) ?? [];
    
    // Add to beginning of list (newest first)
    messagesByProject.value.set(payload.projectId, [
      payload as MessageDto,
      ...messages,
    ]);
    
    // Increment unread count if not from current user
    if (payload.senderId !== authStore.userId) {
      const currentCount = unreadCounts.value.get(payload.projectId) ?? 0;
      unreadCounts.value.set(payload.projectId, currentCount + 1);
    }
  }
  
  function handleUnreadCountUpdate(payload: { projectId: string; count: number }) {
    unreadCounts.value.set(payload.projectId, payload.count);
  }
  
  return {
    // State
    messagesByProject,
    unreadCounts,
    paginationByProject,
    isLoading,
    isSending,
    error,
    
    // Getters
    getMessagesForProject,
    totalUnreadCount,
    
    // Actions
    fetchMessagesByProject,
    sendMessage,
    markAsRead,
    markAllAsRead,
    handleNewMessage,
    handleUnreadCountUpdate,
    // ...
  };
});
```

---

### 5. **notification.store.ts**

**Responsibilities:**
- Manage user notifications
- Track unread count (for header badge)
- Handle mark as read operations
- Support pagination
- React to real-time notifications

**State:**

```typescript
interface NotificationState {
  // Notifications list
  notifications: NotificationDto[];
  
  // Unread count
  unreadCount: number;
  
  // Pagination
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  
  // Status
  isLoading: boolean;
  error: string | null;
}
```

**Getters:**

```typescript
// Unread notifications
unreadNotifications: (state) => state.notifications.filter(n => !n.isRead)

// Read notifications
readNotifications: (state) => state.notifications.filter(n => n.isRead)

// Has unread
hasUnread: (state) => state.unreadCount > 0

// Recent notifications (for dropdown)
recentNotifications: (state) => state.notifications.slice(0, 5)

// Grouped by date
notificationsByDate: (state) => {
  // Group notifications by date (Today, Yesterday, This Week, etc.)
}
```

**Actions:**

```typescript
// Fetch operations
async fetchNotifications(loadMore?: boolean): Promise<void>
async fetchUnreadCount(): Promise<void>

// Read operations
async markAsRead(notificationId: string): Promise<void>
async markAllAsRead(): Promise<void>

// Real-time updates
handleNewNotification(payload: NotificationPayload): void
handleUnreadCountUpdate(payload: { unreadCount: number }): void

// State management
clearError(): void
reset(): void
```

**Implementation Details:**

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth.store';

export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore();
  
  // State
  const notifications = ref<NotificationDto[]>([]);
  const unreadCount = ref(0);
  const pagination = ref({ total: 0, page: 1, limit: 20, hasMore: false });
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Getters
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead)
  );
  
  const hasUnread = computed(() => unreadCount.value > 0);
  
  const recentNotifications = computed(() => 
    notifications.value.slice(0, 5)
  );
  
  const notificationsByDate = computed(() => {
    const grouped = new Map<string, NotificationDto[]>();
    
    notifications.value.forEach(notification => {
      const dateKey = getDateKey(notification.createdAt);
      const existing = grouped.get(dateKey) ?? [];
      grouped.set(dateKey, [...existing, notification]);
    });
    
    return grouped;
  });
  
  // Actions
  async function fetchNotifications(loadMore = false) {
    if (!authStore.userId) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const page = loadMore ? pagination.value.page + 1 : 1;
      
      const response = await notificationService.getNotificationsByUser(
        authStore.userId,
        { page, limit: 20 }
      );
      
      if (loadMore) {
        notifications.value = [...notifications.value, ...response.notifications];
      } else {
        notifications.value = response.notifications;
      }
      
      pagination.value = {
        total: response.total,
        page: response.page,
        limit: response.limit,
        hasMore: response.page < response.totalPages,
      };
      
    } catch (e) {
      error.value = 'Failed to load notifications';
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchUnreadCount() {
    if (!authStore.userId) return;
    
    try {
      unreadCount.value = await notificationService.getUnreadCount(authStore.userId);
    } catch (e) {
      // Silent fail for count fetch
    }
  }
  
  async function markAsRead(notificationId: string) {
    if (!authStore.userId) return;
    
    try {
      await notificationService.markAsRead(notificationId, authStore.userId);
      
      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch (e) {
      error.value = 'Failed to mark notification as read';
    }
  }
  
  async function markAllAsRead() {
    if (!authStore.userId) return;
    
    try {
      await notificationService.markAllAsRead(authStore.userId);
      
      // Update local state
      notifications.value.forEach(n => n.isRead = true);
      unreadCount.value = 0;
    } catch (e) {
      error.value = 'Failed to mark all as read';
    }
  }
  
  // Real-time handlers
  function handleNewNotification(payload: NotificationPayload) {
    // Add to beginning
    notifications.value = [payload as NotificationDto, ...notifications.value];
    unreadCount.value += 1;
  }
  
  function handleUnreadCountUpdate(payload: { unreadCount: number }) {
    unreadCount.value = payload.unreadCount;
  }
  
  // Helper
  function getDateKey(date: Date | string): string {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, yesterday)) return 'Yesterday';
    if (isThisWeek(d)) return 'This Week';
    return formatDate(d, 'MMMM d, yyyy');
  }
  
  function reset() {
    notifications.value = [];
    unreadCount.value = 0;
    pagination.value = { total: 0, page: 1, limit: 20, hasMore: false };
    error.value = null;
  }
  
  return {
    // State
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    
    // Getters
    unreadNotifications,
    hasUnread,
    recentNotifications,
    notificationsByDate,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    handleNewNotification,
    handleUnreadCountUpdate,
    reset,
  };
});
```

---

### 6. **index.ts** (Barrel Export)

**Responsibilities:**
- Export all stores
- Provide store initialization function

**Content:**

```typescript
// Export stores
export { useAuthStore } from './auth.store';
export { useProjectStore } from './project.store';
export { useTaskStore } from './task.store';
export { useMessageStore } from './message.store';
export { useNotificationStore } from './notification.store';

// Re-export types if needed
export type { AuthState } from './auth.store';
export type { ProjectState } from './project.store';
export type { TaskState } from './task.store';
export type { MessageState } from './message.store';
export type { NotificationState } from './notification.store';

/**
 * Initialize all stores and setup WebSocket listeners
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
 * Setup WebSocket event listeners for stores
 */
export function setupStoreWebSocketListeners() {
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();
  const messageStore = useMessageStore();
  const notificationStore = useNotificationStore();
  
  // Project events
  socketHandler.onProjectUpdated((payload) => {
    projectStore.handleProjectUpdated(payload);
  });
  
  socketHandler.onProjectFinalized((payload) => {
    projectStore.handleProjectFinalized(payload);
  });
  
  // Task events
  socketHandler.onTaskCreated((payload) => {
    taskStore.handleTaskCreated(payload);
  });
  
  socketHandler.onTaskUpdated((payload) => {
    taskStore.handleTaskUpdated(payload);
  });
  
  socketHandler.onTaskDeleted((payload) => {
    taskStore.handleTaskDeleted(payload);
  });
  
  // Message events
  socketHandler.onMessage((payload) => {
    messageStore.handleNewMessage(payload);
  });
  
  socketHandler.onUnreadCount((payload) => {
    messageStore.handleUnreadCountUpdate(payload);
  });
  
  // Notification events
  socketHandler.onNotification((payload) => {
    notificationStore.handleNewNotification(payload);
  });
  
  socketHandler.onNotificationCount((payload) => {
    notificationStore.handleUnreadCountUpdate(payload);
  });
}

/**
 * Reset all stores (e.g., on logout)
 */
export function resetAllStores() {
  const authStore = useAuthStore();
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();
  const messageStore = useMessageStore();
  const notificationStore = useNotificationStore();
  
  authStore.clearAuth();
  projectStore.$reset();
  taskStore.$reset();
  messageStore.$reset();
  notificationStore.reset();
}
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
- **State Management:** Pinia with Composition API (Setup Stores)
- **Maximum cyclomatic complexity:** 10
- **Maximum function length:** 50 lines

## Mandatory best practices:
- **Composition API:** Use setup stores (not options stores)
- **Type Safety:** Full TypeScript types for state, getters, and actions
- **Reactivity:** Use ref() for state, computed() for getters
- **Separation of Concerns:** Stores handle state only, services handle API calls
- **Error Handling:** Every async action should handle errors gracefully
- **Loading States:** Track loading states for UI feedback
- **Real-time Ready:** Include handlers for WebSocket events

## Store Design Principles:
- Stores are the single source of truth for their domain
- Components read from stores via getters
- Components modify state only through actions
- Stores can reference other stores when needed
- Actions should be atomic and handle their own error states

## Naming Conventions:
- Store files: `{domain}.store.ts`
- Store definition: `use{Domain}Store`
- State properties: camelCase
- Getters: descriptive names (e.g., `activeProjects`, `hasUnread`)
- Actions: verb + noun (e.g., `fetchProjects`, `createTask`)
- Real-time handlers: `handle{Event}` (e.g., `handleTaskCreated`)

---

# DELIVERABLES

1. **Complete source code** for all 6 files (5 stores + 1 index)

2. **For each store:**
   - State definition with TypeScript interface
   - Computed getters for derived state
   - Async actions for API operations
   - Real-time event handlers
   - Loading and error state management
   - JSDoc documentation

3. **Cross-store features:**
   - Store references where needed (e.g., task store references project store)
   - Centralized WebSocket listener setup
   - Store initialization and reset functions

4. **Edge cases to handle:**
   - Unauthenticated state
   - Loading states for all async operations
   - Error states with user-friendly messages
   - Optimistic updates where appropriate
   - State cleanup on logout

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```typescript
// src/presentation/stores/auth.store.ts
[Complete code here]
```

```typescript
// src/presentation/stores/project.store.ts
[Complete code here]
```

... (continue for all 6 files)

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
