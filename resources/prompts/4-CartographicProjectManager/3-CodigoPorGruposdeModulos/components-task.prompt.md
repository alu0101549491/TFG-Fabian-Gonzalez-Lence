# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → Infrastructure Layer → **Presentation Layer** (current)

**Current module:** Presentation Layer - Task Components

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/                        # ✅ Already implemented
│   ├── domain/                             # ✅ Already implemented
│   ├── infrastructure/                     # ✅ Already implemented
│   ├── shared/                             # ✅ Already implemented
│   └── presentation/
│       ├── components/
│       │   ├── common/                     # ✅ Already implemented
│       │   ├── project/                    # ✅ Already implemented
│       │   │   ├── ProjectCard.vue
│       │   │   ├── ProjectForm.vue
│       │   │   └── ProjectSummary.vue
│       │   ├── task/
│       │   │   ├── TaskCard.vue            # 🎯 TO IMPLEMENT
│       │   │   ├── TaskForm.vue            # 🎯 TO IMPLEMENT
│       │   │   ├── TaskList.vue            # 🎯 TO IMPLEMENT
│       │   │   └── TaskHistory.vue         # 🎯 TO IMPLEMENT
│       │   ├── message/
│       │   │   └── ...
│       │   ├── file/
│       │   │   └── ...
│       │   ├── notification/
│       │   │   └── ...
│       │   └── calendar/
│       │       └── ...
│       ├── composables/                    # ✅ Already implemented
│       ├── router/                         # ✅ Already implemented
│       ├── stores/                         # ✅ Already implemented
│       ├── styles/                         # ✅ Already implemented
│       ├── views/
│       │   └── ...
│       ├── App.vue
│       └── main.ts
```

---

# INPUT ARTIFACTS

## 1. Task DTOs (Already Implemented)

```typescript
interface TaskDto {
  id: string;
  projectId: string;
  description: string;
  comments: string | null;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  creatorName: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  files: FileSummaryDto[];
  createdAt: Date;
  updatedAt: Date;
  isOverdue: boolean;
  canModify: boolean;
  canConfirm: boolean;
  allowedStatusTransitions: TaskStatus[];
}

interface TaskSummaryDto {
  id: string;
  projectId: string;
  description: string;
  assigneeName: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  isOverdue: boolean;
  filesCount: number;
}

interface CreateTaskDto {
  projectId: string;
  description: string;
  comments?: string;
  assigneeId: string;
  priority: TaskPriority;
  dueDate: Date;
}

interface UpdateTaskDto {
  id: string;
  description?: string;
  comments?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: Date;
}

interface ChangeTaskStatusDto {
  taskId: string;
  newStatus: TaskStatus;
  comment?: string;
}

interface ConfirmTaskDto {
  taskId: string;
  confirmed: boolean;
  feedback?: string;
}

interface TaskHistoryEntryDto {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  comment: string | null;
  createdAt: Date;
}

interface FileSummaryDto {
  id: string;
  name: string;
  type: FileType;
  size: number;
  uploadedAt: Date;
}
```

## 2. Task Enumerations (Already Implemented)

```typescript
enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PARTIAL = 'PARTIAL',
  PERFORMED = 'PERFORMED',
  COMPLETED = 'COMPLETED',
}

enum TaskPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}
```

## 3. Task Status Workflow (Requirements Section 10)

```
┌──────────────────────────────────────────────────────────────────┐
│                    TASK STATUS WORKFLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────┐                                                   │
│   │ PENDING │ ◄────────────────────────────────┐                │
│   └────┬────┘                                  │                │
│        │                                       │ (rejection)    │
│        ▼                                       │                │
│   ┌─────────────┐                              │                │
│   │ IN_PROGRESS │                              │                │
│   └──────┬──────┘                              │                │
│          │                                     │                │
│          ├──────────────┐                      │                │
│          ▼              ▼                      │                │
│   ┌─────────┐    ┌──────────┐                  │                │
│   │ PARTIAL │    │ PERFORMED │ ────────────────┤                │
│   └────┬────┘    └─────┬─────┘                 │                │
│        │               │                       │                │
│        │               │ (admin confirmation)  │                │
│        │               ▼                       │                │
│        │        ┌───────────┐                  │                │
│        └───────►│ COMPLETED │ (terminal state) │                │
│                 └───────────┘                  │                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Status Transitions:                                              │
│ • PENDING → IN_PROGRESS, PARTIAL, PERFORMED                     │
│ • IN_PROGRESS → PENDING, PARTIAL, PERFORMED                     │
│ • PARTIAL → PENDING, IN_PROGRESS, PERFORMED                     │
│ • PERFORMED → COMPLETED (confirmed) or PENDING (rejected)       │
│ • COMPLETED → (terminal, no transitions)                        │
└──────────────────────────────────────────────────────────────────┘
```

## 4. Task Constants (Already Implemented)

```typescript
const TASK = {
  DESCRIPTION_MAX_LENGTH: 1000,
  COMMENTS_MAX_LENGTH: 2000,
  STATUS_TRANSITIONS: {
    PENDING: ['IN_PROGRESS', 'PARTIAL', 'PERFORMED'],
    IN_PROGRESS: ['PENDING', 'PARTIAL', 'PERFORMED'],
    PARTIAL: ['PENDING', 'IN_PROGRESS', 'PERFORMED'],
    PERFORMED: ['COMPLETED', 'PENDING'],
    COMPLETED: [],
  },
};

const TASK_PRIORITY_COLORS = {
  URGENT: '#B91C1C',
  HIGH: '#DC2626',
  MEDIUM: '#CA8A04',
  LOW: '#16A34A',
};

const TASK_STATUS_COLORS = {
  PENDING: '#6B7280',
  IN_PROGRESS: '#2563EB',
  PARTIAL: '#F59E0B',
  PERFORMED: '#8B5CF6',
  COMPLETED: '#10B981',
};
```

## 5. Composables (Already Implemented)

```typescript
// useTasks
const {
  tasks,
  currentTask,
  filteredTasks,
  tasksByStatus,
  pendingTasksCount,
  overdueCount,
  isLoading,
  isSaving,
  error,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  changeStatus,
  confirmTask,
  getValidTransitions,
  canTransitionTo,
  selectTask,
  getTaskPriorityColor,
  getTaskStatusColor,
} = useTasks();

// useAuth
const { userId, isAdmin, canModifyTask, canConfirmTask } = useAuth();
```

## 6. Design Specifications

### Task Card
- Display: description preview, assignee, status, priority, due date
- Status badge with color
- Priority indicator
- Overdue warning
- File attachment count
- Quick status change actions
- Click to view details/edit

### Task Form
- Create and edit modes
- Description with character counter
- Optional comments field
- Assignee selection (from project participants)
- Priority selection
- Due date picker
- File attachments section (display only in edit)

### Task List
- Grouped by status (Kanban-style) or flat list
- Filter by status, priority, assignee
- Sort options
- Loading skeletons
- Empty state per group

### Task History
- Timeline of task changes
- Show user, action, timestamp
- Display old → new values
- Comments/feedback display

---

# SPECIFIC TASK

Implement all Task Components for the Presentation Layer. These components handle task display, listing, creation, editing, and history tracking.

## Files to implement:

### 1. **TaskCard.vue**

**Responsibilities:**
- Display task summary information in card format
- Show status and priority indicators with colors
- Display assignee and due date
- Show overdue warning when applicable
- File attachment count indicator
- Quick status transition buttons (when allowed)
- Click to select/view task details
- Support for compact mode

**Props:**

```typescript
interface TaskCardProps {
  /** Task data */
  task: TaskDto | TaskSummaryDto;
  /** Compact display mode */
  compact?: boolean;
  /** Show quick status actions */
  showStatusActions?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Draggable for kanban */
  draggable?: boolean;
}
```

**Emits:**

```typescript
interface TaskCardEmits {
  (e: 'click', task: TaskDto | TaskSummaryDto): void;
  (e: 'status-change', taskId: string, newStatus: TaskStatus): void;
  (e: 'edit', task: TaskDto | TaskSummaryDto): void;
  (e: 'delete', task: TaskDto | TaskSummaryDto): void;
}
```

**Template Structure:**

```vue
<template>
  <article
    :class="[
      'task-card',
      `task-card-priority-${task.priority.toLowerCase()}`,
      {
        'task-card-compact': compact,
        'task-card-selected': selected,
        'task-card-overdue': task.isOverdue && !isCompleted,
        'task-card-completed': isCompleted,
        'task-card-draggable': draggable,
      }
    ]"
    :draggable="draggable"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @dragstart="handleDragStart"
  >
    <!-- Priority indicator (left border) -->
    <div
      :class="['task-card-priority-bar']"
      :style="{ backgroundColor: priorityColor }"
      :aria-label="`Priority: ${priorityLabel}`"
    />
    
    <div class="task-card-content">
      <!-- Header: Status + Actions -->
      <div class="task-card-header">
        <span
          :class="['task-card-status']"
          :style="{ backgroundColor: statusBackgroundColor, color: statusColor }"
        >
          {{ statusLabel }}
        </span>
        
        <!-- Quick actions menu -->
        <div v-if="showActions" class="task-card-actions" @click.stop>
          <button
            ref="actionsButtonRef"
            type="button"
            class="task-card-actions-trigger"
            aria-label="Task actions"
            @click="toggleActionsMenu"
          >
            <MoreVerticalIcon />
          </button>
          
          <Transition name="dropdown">
            <div v-if="actionsMenuOpen" ref="actionsMenuRef" class="task-card-actions-menu">
              <button
                v-if="canEdit"
                type="button"
                class="task-card-actions-item"
                @click="handleEdit"
              >
                <EditIcon />
                <span>Edit</span>
              </button>
              <button
                v-if="canDelete"
                type="button"
                class="task-card-actions-item task-card-actions-item-danger"
                @click="handleDelete"
              >
                <TrashIcon />
                <span>Delete</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
      
      <!-- Description -->
      <p class="task-card-description">{{ truncatedDescription }}</p>
      
      <!-- Meta: Assignee, Due Date, Files -->
      <div class="task-card-meta">
        <div class="task-card-assignee" :title="task.assigneeName">
          <UserIcon class="task-card-meta-icon" />
          <span>{{ task.assigneeName }}</span>
        </div>
        
        <div
          :class="[
            'task-card-due-date',
            { 'task-card-due-date-overdue': task.isOverdue && !isCompleted }
          ]"
        >
          <CalendarIcon class="task-card-meta-icon" />
          <span>{{ formattedDueDate }}</span>
        </div>
        
        <div v-if="filesCount > 0" class="task-card-files">
          <PaperclipIcon class="task-card-meta-icon" />
          <span>{{ filesCount }}</span>
        </div>
      </div>
      
      <!-- Quick Status Transitions (if showStatusActions and has valid transitions) -->
      <div v-if="showStatusActions && validTransitions.length > 0" class="task-card-status-actions">
        <button
          v-for="status in validTransitions"
          :key="status"
          type="button"
          class="task-card-status-btn"
          :style="{ '--status-color': getStatusColor(status) }"
          :title="`Change to ${getStatusLabel(status)}`"
          @click.stop="handleStatusChange(status)"
        >
          {{ getStatusLabel(status) }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { TaskDto, TaskSummaryDto } from '@/application/dto';
import { TaskStatus, TaskPriority } from '@/domain/enumerations';
import { formatDate, truncate } from '@/shared/utils';
import { TASK_PRIORITY_COLORS, TASK_STATUS_COLORS, TASK } from '@/shared/constants';
import { useAuth } from '@/presentation/composables';
import {
  MoreVertical as MoreVerticalIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  Paperclip as PaperclipIcon,
} from 'lucide-vue-next';

const props = withDefaults(defineProps<TaskCardProps>(), {
  compact: false,
  showStatusActions: false,
  selected: false,
  draggable: false,
});

const emit = defineEmits<TaskCardEmits>();
const { isAdmin, userId } = useAuth();

// Actions menu
const actionsButtonRef = ref<HTMLElement | null>(null);
const actionsMenuRef = ref<HTMLElement | null>(null);
const actionsMenuOpen = ref(false);

function handleClickOutside(event: MouseEvent) {
  if (
    actionsMenuOpen.value &&
    actionsButtonRef.value &&
    actionsMenuRef.value &&
    !actionsButtonRef.value.contains(event.target as Node) &&
    !actionsMenuRef.value.contains(event.target as Node)
  ) {
    actionsMenuOpen.value = false;
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

// Computed
const isCompleted = computed(() => props.task.status === TaskStatus.COMPLETED);

const isFullTask = computed(() => 'canModify' in props.task);

const canEdit = computed(() => {
  if (isFullTask.value) {
    return (props.task as TaskDto).canModify;
  }
  return isAdmin.value;
});

const canDelete = computed(() => isAdmin.value && !isCompleted.value);

const showActions = computed(() => canEdit.value || canDelete.value);

const filesCount = computed(() => {
  if ('files' in props.task) {
    return (props.task as TaskDto).files.length;
  }
  if ('filesCount' in props.task) {
    return (props.task as TaskSummaryDto).filesCount;
  }
  return 0;
});

const validTransitions = computed(() => {
  if (isFullTask.value) {
    return (props.task as TaskDto).allowedStatusTransitions || [];
  }
  return TASK.STATUS_TRANSITIONS[props.task.status] || [];
});

const truncatedDescription = computed(() => {
  const maxLength = props.compact ? 60 : 120;
  return truncate(props.task.description, maxLength);
});

const formattedDueDate = computed(() => formatDate(props.task.dueDate, 'dd MMM'));

const priorityColor = computed(() => TASK_PRIORITY_COLORS[props.task.priority]);

const priorityLabel = computed(() => {
  const labels: Record<TaskPriority, string> = {
    [TaskPriority.URGENT]: 'Urgent',
    [TaskPriority.HIGH]: 'High',
    [TaskPriority.MEDIUM]: 'Medium',
    [TaskPriority.LOW]: 'Low',
  };
  return labels[props.task.priority];
});

const statusColor = computed(() => TASK_STATUS_COLORS[props.task.status]);

const statusBackgroundColor = computed(() => `${statusColor.value}20`);

const statusLabel = computed(() => getStatusLabel(props.task.status));

// Helpers
function getStatusColor(status: TaskStatus): string {
  return TASK_STATUS_COLORS[status];
}

function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'Pending',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.PARTIAL]: 'Partial',
    [TaskStatus.PERFORMED]: 'Performed',
    [TaskStatus.COMPLETED]: 'Completed',
  };
  return labels[status];
}

// Handlers
function handleClick() {
  emit('click', props.task);
}

function toggleActionsMenu() {
  actionsMenuOpen.value = !actionsMenuOpen.value;
}

function handleEdit() {
  actionsMenuOpen.value = false;
  emit('edit', props.task);
}

function handleDelete() {
  actionsMenuOpen.value = false;
  emit('delete', props.task);
}

function handleStatusChange(newStatus: TaskStatus) {
  emit('status-change', props.task.id, newStatus);
}

function handleDragStart(event: DragEvent) {
  if (props.draggable && event.dataTransfer) {
    event.dataTransfer.setData('text/plain', props.task.id);
    event.dataTransfer.effectAllowed = 'move';
  }
}
</script>

<style scoped>
.task-card {
  display: flex;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: border-color var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease,
              transform var(--duration-fast) ease;
}

.task-card:hover {
  border-color: var(--color-border-secondary);
  box-shadow: var(--shadow-md);
}

.task-card:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.task-card-selected {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
}

.task-card-overdue {
  border-color: var(--color-error-300);
}

.task-card-completed {
  opacity: 0.7;
}

.task-card-draggable {
  cursor: grab;
}

.task-card-draggable:active {
  cursor: grabbing;
}

/* Priority bar */
.task-card-priority-bar {
  width: 4px;
  flex-shrink: 0;
}

/* Content */
.task-card-content {
  flex: 1;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0;
}

/* Header */
.task-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
}

.task-card-status {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Description */
.task-card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
}

/* Meta */
.task-card-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  margin-top: auto;
}

.task-card-assignee,
.task-card-due-date,
.task-card-files {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.task-card-meta-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.task-card-due-date-overdue {
  color: var(--color-error-600);
  font-weight: var(--font-weight-medium);
}

/* Actions */
.task-card-actions {
  position: relative;
}

.task-card-actions-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: color var(--duration-fast) ease, background-color var(--duration-fast) ease;
}

.task-card-actions-trigger:hover {
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
}

.task-card-actions-trigger svg {
  width: 16px;
  height: 16px;
}

.task-card-actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: var(--z-dropdown);
  min-width: 140px;
  margin-top: var(--spacing-1);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-1);
}

.task-card-actions-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) ease;
}

.task-card-actions-item:hover {
  background-color: var(--color-gray-100);
}

.task-card-actions-item svg {
  width: 14px;
  height: 14px;
}

.task-card-actions-item-danger {
  color: var(--color-error-600);
}

.task-card-actions-item-danger:hover {
  background-color: var(--color-error-50);
}

/* Status transition buttons */
.task-card-status-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-2);
  border-top: 1px solid var(--color-border-primary);
}

.task-card-status-btn {
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--status-color, var(--color-gray-300));
  color: var(--status-color, var(--color-text-secondary));
  background-color: transparent;
  cursor: pointer;
  transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease;
}

.task-card-status-btn:hover {
  background-color: var(--status-color);
  color: white;
}

/* Compact mode */
.task-card-compact .task-card-content {
  padding: var(--spacing-2);
}

.task-card-compact .task-card-description {
  font-size: var(--font-size-xs);
}

.task-card-compact .task-card-status-actions {
  display: none;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--duration-fast) ease, transform var(--duration-fast) ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
```

---

### 2. **TaskForm.vue**

**Responsibilities:**
- Handle both create and edit task modes
- Description field with character counter
- Optional comments/notes field
- Assignee selection from project participants
- Priority selection with visual indicators
- Due date picker
- Display attached files (edit mode only)
- Status change section (edit mode, with confirmation flow for PERFORMED→COMPLETED)
- Form validation

**Props:**

```typescript
interface TaskFormProps {
  /** Task to edit (undefined for create mode) */
  task?: TaskDto;
  /** Project ID (required for create mode) */
  projectId?: string;
  /** Available assignees (project participants) */
  assignees: Array<{ id: string; name: string; role: string }>;
  /** Form submission loading state */
  loading?: boolean;
  /** Can current user confirm tasks (admin only for PERFORMED→COMPLETED) */
  canConfirm?: boolean;
}
```

**Emits:**

```typescript
interface TaskFormEmits {
  (e: 'submit', data: CreateTaskDto | UpdateTaskDto): void;
  (e: 'cancel'): void;
  (e: 'status-change', data: ChangeTaskStatusDto): void;
  (e: 'confirm', data: ConfirmTaskDto): void;
  (e: 'remove-file', fileId: string): void;
}
```

**Template Structure:**

```vue
<template>
  <form class="task-form" novalidate @submit.prevent="handleSubmit">
    <h2 class="task-form-title">
      {{ isEditMode ? 'Edit Task' : 'Create New Task' }}
    </h2>
    
    <!-- Status change section (edit mode only) -->
    <div v-if="isEditMode && !isCompleted" class="task-form-status-section">
      <label class="task-form-label">Current Status</label>
      <div class="task-form-status-current">
        <span
          :class="['task-form-status-badge']"
          :style="{ backgroundColor: currentStatusBgColor, color: currentStatusColor }"
        >
          {{ currentStatusLabel }}
        </span>
        
        <!-- Status transition buttons -->
        <div v-if="validTransitions.length > 0" class="task-form-status-transitions">
          <span class="task-form-status-arrow">→</span>
          <button
            v-for="status in validTransitions"
            :key="status"
            type="button"
            :class="['task-form-status-option', { 'task-form-status-option-selected': selectedNewStatus === status }]"
            :style="{ '--status-color': getStatusColor(status) }"
            @click="selectStatusTransition(status)"
          >
            {{ getStatusLabel(status) }}
          </button>
        </div>
      </div>
      
      <!-- Status change comment -->
      <div v-if="selectedNewStatus" class="task-form-status-comment">
        <label for="status-comment" class="task-form-label">
          {{ selectedNewStatus === 'COMPLETED' ? 'Confirmation Feedback' : 'Status Change Comment' }}
          <span class="task-form-optional">(Optional)</span>
        </label>
        <textarea
          id="status-comment"
          v-model="statusComment"
          class="task-form-textarea"
          rows="2"
          placeholder="Add a comment about this status change..."
        />
        
        <!-- Confirm/Reject for PERFORMED status (admin only) -->
        <div v-if="task?.status === 'PERFORMED' && canConfirm" class="task-form-confirm-actions">
          <button
            type="button"
            class="task-form-btn task-form-btn-success"
            @click="handleConfirm(true)"
          >
            <CheckIcon />
            <span>Confirm & Complete</span>
          </button>
          <button
            type="button"
            class="task-form-btn task-form-btn-danger"
            @click="handleConfirm(false)"
          >
            <XIcon />
            <span>Reject</span>
          </button>
        </div>
        
        <!-- Apply status change button (non-confirmation flow) -->
        <button
          v-else-if="selectedNewStatus && selectedNewStatus !== 'COMPLETED'"
          type="button"
          class="task-form-btn task-form-btn-secondary"
          @click="applyStatusChange"
        >
          Apply Status Change
        </button>
      </div>
    </div>
    
    <!-- Completed notice -->
    <div v-if="isCompleted" class="task-form-completed-notice">
      <CheckCircleIcon />
      <span>This task is completed and cannot be modified.</span>
    </div>
    
    <!-- Description -->
    <div class="task-form-field">
      <label for="task-description" class="task-form-label">
        Description
        <span class="task-form-required">*</span>
      </label>
      <textarea
        id="task-description"
        v-model="form.description"
        class="task-form-textarea"
        :class="{ 'task-form-input-error': errors.description }"
        rows="4"
        placeholder="Describe the task..."
        :maxlength="TASK.DESCRIPTION_MAX_LENGTH"
        :disabled="isCompleted"
        required
        @blur="validateField('description')"
      />
      <div class="task-form-field-footer">
        <p v-if="errors.description" class="task-form-error">{{ errors.description }}</p>
        <span class="task-form-char-count">
          {{ form.description.length }}/{{ TASK.DESCRIPTION_MAX_LENGTH }}
        </span>
      </div>
    </div>
    
    <!-- Comments/Notes -->
    <div class="task-form-field">
      <label for="task-comments" class="task-form-label">
        Comments / Notes
        <span class="task-form-optional">(Optional)</span>
      </label>
      <textarea
        id="task-comments"
        v-model="form.comments"
        class="task-form-textarea"
        :class="{ 'task-form-input-error': errors.comments }"
        rows="3"
        placeholder="Additional notes or instructions..."
        :maxlength="TASK.COMMENTS_MAX_LENGTH"
        :disabled="isCompleted"
        @blur="validateField('comments')"
      />
      <div class="task-form-field-footer">
        <p v-if="errors.comments" class="task-form-error">{{ errors.comments }}</p>
        <span class="task-form-char-count">
          {{ (form.comments || '').length }}/{{ TASK.COMMENTS_MAX_LENGTH }}
        </span>
      </div>
    </div>
    
    <!-- Assignee & Priority row -->
    <div class="task-form-row">
      <!-- Assignee -->
      <div class="task-form-field">
        <label for="task-assignee" class="task-form-label">
          Assignee
          <span class="task-form-required">*</span>
        </label>
        <select
          id="task-assignee"
          v-model="form.assigneeId"
          class="task-form-select"
          :class="{ 'task-form-input-error': errors.assigneeId }"
          :disabled="isCompleted"
          required
          @blur="validateField('assigneeId')"
          @change="validateField('assigneeId')"
        >
          <option value="" disabled>Select assignee</option>
          <option v-for="assignee in assignees" :key="assignee.id" :value="assignee.id">
            {{ assignee.name }} ({{ assignee.role }})
          </option>
        </select>
        <p v-if="errors.assigneeId" class="task-form-error">{{ errors.assigneeId }}</p>
      </div>
      
      <!-- Priority -->
      <div class="task-form-field">
        <label for="task-priority" class="task-form-label">
          Priority
          <span class="task-form-required">*</span>
        </label>
        <select
          id="task-priority"
          v-model="form.priority"
          class="task-form-select"
          :class="{ 'task-form-input-error': errors.priority }"
          :disabled="isCompleted"
          required
          @blur="validateField('priority')"
          @change="validateField('priority')"
        >
          <option value="" disabled>Select priority</option>
          <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p v-if="errors.priority" class="task-form-error">{{ errors.priority }}</p>
        
        <!-- Priority indicator -->
        <div v-if="form.priority" class="task-form-priority-indicator">
          <span
            class="task-form-priority-dot"
            :style="{ backgroundColor: getPriorityColor(form.priority) }"
          />
          <span>{{ getPriorityLabel(form.priority) }} Priority</span>
        </div>
      </div>
    </div>
    
    <!-- Due Date -->
    <div class="task-form-field">
      <label for="task-due-date" class="task-form-label">
        Due Date
        <span class="task-form-required">*</span>
      </label>
      <input
        id="task-due-date"
        v-model="form.dueDate"
        type="date"
        class="task-form-input"
        :class="{ 'task-form-input-error': errors.dueDate }"
        :disabled="isCompleted"
        required
        @blur="validateField('dueDate')"
        @change="validateField('dueDate')"
      />
      <p v-if="errors.dueDate" class="task-form-error">{{ errors.dueDate }}</p>
    </div>
    
    <!-- Attached Files (edit mode only) -->
    <div v-if="isEditMode && taskFiles.length > 0" class="task-form-files">
      <label class="task-form-label">Attached Files</label>
      <div class="task-form-files-list">
        <div
          v-for="file in taskFiles"
          :key="file.id"
          class="task-form-file"
        >
          <PaperclipIcon class="task-form-file-icon" />
          <span class="task-form-file-name">{{ file.name }}</span>
          <span class="task-form-file-size">{{ formatFileSize(file.size) }}</span>
          <button
            v-if="!isCompleted"
            type="button"
            class="task-form-file-remove"
            title="Remove file"
            @click="$emit('remove-file', file.id)"
          >
            <XIcon />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Form actions -->
    <div class="task-form-actions">
      <button
        type="button"
        class="task-form-btn task-form-btn-secondary"
        :disabled="loading"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      
      <button
        v-if="!isCompleted"
        type="submit"
        class="task-form-btn task-form-btn-primary"
        :disabled="loading || !isFormValid"
      >
        <LoadingSpinner v-if="loading" size="sm" />
        <span>{{ isEditMode ? 'Update Task' : 'Create Task' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { TaskDto, CreateTaskDto, UpdateTaskDto, ChangeTaskStatusDto, ConfirmTaskDto } from '@/application/dto';
import { TaskStatus, TaskPriority } from '@/domain/enumerations';
import { TASK, TASK_PRIORITY_COLORS, TASK_STATUS_COLORS } from '@/shared/constants';
import { formatFileSize } from '@/shared/utils';
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue';
import {
  Check as CheckIcon,
  X as XIcon,
  CheckCircle as CheckCircleIcon,
  Paperclip as PaperclipIcon,
} from 'lucide-vue-next';

const props = withDefaults(defineProps<TaskFormProps>(), {
  loading: false,
  canConfirm: false,
});

const emit = defineEmits<TaskFormEmits>();

// Form state
const form = reactive({
  description: '',
  comments: '' as string | null,
  assigneeId: '',
  priority: '' as TaskPriority | '',
  dueDate: '',
});

const errors = reactive<Record<string, string>>({});

// Status change state
const selectedNewStatus = ref<TaskStatus | null>(null);
const statusComment = ref('');

// Computed
const isEditMode = computed(() => !!props.task);
const isCompleted = computed(() => props.task?.status === TaskStatus.COMPLETED);

const taskFiles = computed(() => props.task?.files || []);

const validTransitions = computed(() => {
  if (!props.task) return [];
  return props.task.allowedStatusTransitions || [];
});

const currentStatusColor = computed(() => 
  props.task ? TASK_STATUS_COLORS[props.task.status] : ''
);

const currentStatusBgColor = computed(() => 
  props.task ? `${TASK_STATUS_COLORS[props.task.status]}20` : ''
);

const currentStatusLabel = computed(() => 
  props.task ? getStatusLabel(props.task.status) : ''
);

const priorityOptions = computed(() => [
  { value: TaskPriority.URGENT, label: '🔴 Urgent' },
  { value: TaskPriority.HIGH, label: '🟠 High' },
  { value: TaskPriority.MEDIUM, label: '🟡 Medium' },
  { value: TaskPriority.LOW, label: '🟢 Low' },
]);

const isFormValid = computed(() => {
  const hasRequired = Boolean(
    form.description &&
    form.assigneeId &&
    form.priority &&
    form.dueDate
  );
  const hasNoErrors = Object.values(errors).every(e => !e);
  return hasRequired && hasNoErrors;
});

// Initialize form for edit mode
onMounted(() => {
  if (props.task) {
    form.description = props.task.description;
    form.comments = props.task.comments;
    form.assigneeId = props.task.assigneeId;
    form.priority = props.task.priority;
    form.dueDate = formatDateForInput(props.task.dueDate);
  }
});

// Helpers
function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'Pending',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.PARTIAL]: 'Partial',
    [TaskStatus.PERFORMED]: 'Performed',
    [TaskStatus.COMPLETED]: 'Completed',
  };
  return labels[status];
}

function getStatusColor(status: TaskStatus): string {
  return TASK_STATUS_COLORS[status];
}

function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    [TaskPriority.URGENT]: 'Urgent',
    [TaskPriority.HIGH]: 'High',
    [TaskPriority.MEDIUM]: 'Medium',
    [TaskPriority.LOW]: 'Low',
  };
  return labels[priority];
}

function getPriorityColor(priority: TaskPriority): string {
  return TASK_PRIORITY_COLORS[priority];
}

function formatDateForInput(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}

// Validation
function validateField(field: string): void {
  errors[field] = '';
  
  switch (field) {
    case 'description':
      if (!form.description) {
        errors.description = 'Description is required';
      } else if (form.description.length > TASK.DESCRIPTION_MAX_LENGTH) {
        errors.description = `Description must be ${TASK.DESCRIPTION_MAX_LENGTH} characters or less`;
      }
      break;
      
    case 'comments':
      if (form.comments && form.comments.length > TASK.COMMENTS_MAX_LENGTH) {
        errors.comments = `Comments must be ${TASK.COMMENTS_MAX_LENGTH} characters or less`;
      }
      break;
      
    case 'assigneeId':
      if (!form.assigneeId) {
        errors.assigneeId = 'Please select an assignee';
      }
      break;
      
    case 'priority':
      if (!form.priority) {
        errors.priority = 'Please select a priority';
      }
      break;
      
    case 'dueDate':
      if (!form.dueDate) {
        errors.dueDate = 'Due date is required';
      }
      break;
  }
}

function validateAllFields(): boolean {
  ['description', 'comments', 'assigneeId', 'priority', 'dueDate'].forEach(validateField);
  return Object.values(errors).every(e => !e);
}

// Status change handlers
function selectStatusTransition(status: TaskStatus): void {
  selectedNewStatus.value = selectedNewStatus.value === status ? null : status;
  statusComment.value = '';
}

function applyStatusChange(): void {
  if (!props.task || !selectedNewStatus.value) return;
  
  emit('status-change', {
    taskId: props.task.id,
    newStatus: selectedNewStatus.value,
    comment: statusComment.value || undefined,
  });
  
  selectedNewStatus.value = null;
  statusComment.value = '';
}

function handleConfirm(confirmed: boolean): void {
  if (!props.task) return;
  
  emit('confirm', {
    taskId: props.task.id,
    confirmed,
    feedback: statusComment.value || undefined,
  });
  
  statusComment.value = '';
}

// Submit handler
function handleSubmit(): void {
  if (!validateAllFields() || isCompleted.value) return;
  
  if (isEditMode.value) {
    const updateData: UpdateTaskDto = {
      id: props.task!.id,
      description: form.description,
      comments: form.comments || undefined,
      assigneeId: form.assigneeId,
      priority: form.priority as TaskPriority,
      dueDate: new Date(form.dueDate),
    };
    emit('submit', updateData);
  } else {
    const createData: CreateTaskDto = {
      projectId: props.projectId!,
      description: form.description,
      comments: form.comments || undefined,
      assigneeId: form.assigneeId,
      priority: form.priority as TaskPriority,
      dueDate: new Date(form.dueDate),
    };
    emit('submit', createData);
  }
}
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  max-width: 600px;
}

.task-form-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
}

/* Status Section */
.task-form-status-section {
  padding: var(--spacing-4);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-lg);
}

.task-form-status-current {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  margin-top: var(--spacing-2);
}

.task-form-status-badge {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
}

.task-form-status-transitions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.task-form-status-arrow {
  color: var(--color-text-tertiary);
}

.task-form-status-option {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--status-color, var(--color-gray-300));
  color: var(--status-color, var(--color-text-secondary));
  background-color: transparent;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.task-form-status-option:hover,
.task-form-status-option-selected {
  background-color: var(--status-color);
  color: white;
}

.task-form-status-comment {
  margin-top: var(--spacing-3);
}

.task-form-confirm-actions {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
}

/* Completed notice */
.task-form-completed-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-success-50);
  color: var(--color-success-700);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.task-form-completed-notice svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Form fields */
.task-form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

@media (max-width: 640px) {
  .task-form-row {
    grid-template-columns: 1fr;
  }
}

.task-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.task-form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.task-form-required {
  color: var(--color-error-500);
  margin-left: 2px;
}

.task-form-optional {
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.task-form-input,
.task-form-select,
.task-form-textarea {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
}

.task-form-input {
  height: var(--height-input);
}

.task-form-textarea {
  resize: vertical;
  min-height: 80px;
}

.task-form-input:focus,
.task-form-select:focus,
.task-form-textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.task-form-input:disabled,
.task-form-select:disabled,
.task-form-textarea:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.task-form-input-error {
  border-color: var(--color-error-500);
}

.task-form-input-error:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

.task-form-select {
  height: var(--height-input);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-3) center;
  padding-right: var(--spacing-10);
  cursor: pointer;
}

.task-form-field-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-form-error {
  font-size: var(--font-size-xs);
  color: var(--color-error-600);
  margin: 0;
}

.task-form-char-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.task-form-priority-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.task-form-priority-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

/* Files section */
.task-form-files {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.task-form-files-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.task-form-file {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.task-form-file-icon {
  width: 16px;
  height: 16px;
  color: var(--color-gray-500);
  flex-shrink: 0;
}

.task-form-file-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-form-file-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.task-form-file-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: color var(--duration-fast) ease, background-color var(--duration-fast) ease;
}

.task-form-file-remove:hover {
  color: var(--color-error-600);
  background-color: var(--color-error-100);
}

.task-form-file-remove svg {
  width: 14px;
  height: 14px;
}

/* Actions */
.task-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-primary);
}

.task-form-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  height: var(--height-button);
  padding: 0 var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.task-form-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.task-form-btn svg {
  width: 16px;
  height: 16px;
}

.task-form-btn-primary {
  color: white;
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.task-form-btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.task-form-btn-secondary {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-primary);
}

.task-form-btn-secondary:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.task-form-btn-success {
  color: white;
  background-color: var(--color-success-600);
  border-color: var(--color-success-600);
}

.task-form-btn-success:hover:not(:disabled) {
  background-color: var(--color-success-700);
}

.task-form-btn-danger {
  color: white;
  background-color: var(--color-error-600);
  border-color: var(--color-error-600);
}

.task-form-btn-danger:hover:not(:disabled) {
  background-color: var(--color-error-700);
}
</style>
```

---

### 3. **TaskList.vue**

**Responsibilities:**
- Display list of tasks (flat or grouped by status)
- Support filtering by status, priority, assignee
- Support sorting options
- Loading skeletons
- Empty states (overall and per group)
- Header with filters and create button

**Props:**

```typescript
interface TaskListProps {
  /** Tasks to display */
  tasks: TaskDto[] | TaskSummaryDto[];
  /** Loading state */
  loading?: boolean;
  /** View mode */
  viewMode?: 'list' | 'grouped';
  /** Show filters */
  showFilters?: boolean;
  /** Show create button */
  showCreateButton?: boolean;
  /** Available assignees for filter */
  assignees?: Array<{ id: string; name: string }>;
  /** Empty state message */
  emptyMessage?: string;
}
```

**Emits:**

```typescript
interface TaskListEmits {
  (e: 'task-click', task: TaskDto | TaskSummaryDto): void;
  (e: 'task-edit', task: TaskDto | TaskSummaryDto): void;
  (e: 'task-delete', task: TaskDto | TaskSummaryDto): void;
  (e: 'task-status-change', taskId: string, newStatus: TaskStatus): void;
  (e: 'create'): void;
  (e: 'filter-change', filters: TaskFilters): void;
}

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Template Structure:**

```vue
<template>
  <div class="task-list">
    <!-- Header with filters and actions -->
    <div v-if="showFilters || showCreateButton" class="task-list-header">
      <!-- Filters -->
      <div v-if="showFilters" class="task-list-filters">
        <!-- Status filter -->
        <select
          v-model="filters.status"
          class="task-list-filter-select"
          @change="emitFilterChange"
        >
          <option value="">All Statuses</option>
          <option v-for="status in statusOptions" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
        
        <!-- Priority filter -->
        <select
          v-model="filters.priority"
          class="task-list-filter-select"
          @change="emitFilterChange"
        >
          <option value="">All Priorities</option>
          <option v-for="priority in priorityOptions" :key="priority.value" :value="priority.value">
            {{ priority.label }}
          </option>
        </select>
        
        <!-- Assignee filter -->
        <select
          v-if="assignees && assignees.length > 0"
          v-model="filters.assigneeId"
          class="task-list-filter-select"
          @change="emitFilterChange"
        >
          <option value="">All Assignees</option>
          <option v-for="assignee in assignees" :key="assignee.id" :value="assignee.id">
            {{ assignee.name }}
          </option>
        </select>
        
        <!-- Sort -->
        <select
          v-model="sortValue"
          class="task-list-filter-select"
          @change="handleSortChange"
        >
          <option value="dueDate-asc">Due Date (Earliest)</option>
          <option value="dueDate-desc">Due Date (Latest)</option>
          <option value="priority-asc">Priority (Low → High)</option>
          <option value="priority-desc">Priority (High → Low)</option>
          <option value="status-asc">Status (Pending → Completed)</option>
          <option value="createdAt-desc">Newest First</option>
        </select>
        
        <!-- Clear filters -->
        <button
          v-if="hasActiveFilters"
          type="button"
          class="task-list-clear-filters"
          @click="clearFilters"
        >
          <XIcon />
          <span>Clear</span>
        </button>
      </div>
      
      <!-- Create button -->
      <button
        v-if="showCreateButton"
        type="button"
        class="task-list-create-btn"
        @click="$emit('create')"
      >
        <PlusIcon />
        <span>New Task</span>
      </button>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="task-list-loading">
      <div v-for="n in 4" :key="n" class="task-card-skeleton">
        <div class="skeleton-priority-bar" />
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-line-short" />
          <div class="skeleton-line skeleton-line-long" />
          <div class="skeleton-line skeleton-line-medium" />
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="filteredTasks.length === 0" class="task-list-empty">
      <CheckSquareIcon class="task-list-empty-icon" />
      <h3 class="task-list-empty-title">
        {{ hasActiveFilters ? 'No tasks match your filters' : emptyMessage }}
      </h3>
      <p v-if="hasActiveFilters" class="task-list-empty-description">
        Try adjusting your filters or clearing them.
      </p>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="task-list-empty-action"
        @click="clearFilters"
      >
        Clear Filters
      </button>
    </div>
    
    <!-- Grouped view (by status) -->
    <div v-else-if="viewMode === 'grouped'" class="task-list-grouped">
      <div
        v-for="group in taskGroups"
        :key="group.status"
        class="task-list-group"
      >
        <div class="task-list-group-header">
          <span
            class="task-list-group-status"
            :style="{ backgroundColor: `${group.color}20`, color: group.color }"
          >
            {{ group.label }}
          </span>
          <span class="task-list-group-count">{{ group.tasks.length }}</span>
        </div>
        
        <div v-if="group.tasks.length > 0" class="task-list-group-tasks">
          <TaskCard
            v-for="task in group.tasks"
            :key="task.id"
            :task="task"
            :show-status-actions="true"
            @click="$emit('task-click', task)"
            @edit="$emit('task-edit', task)"
            @delete="$emit('task-delete', task)"
            @status-change="(id, status) => $emit('task-status-change', id, status)"
          />
        </div>
        <div v-else class="task-list-group-empty">
          No {{ group.label.toLowerCase() }} tasks
        </div>
      </div>
    </div>
    
    <!-- Flat list view -->
    <div v-else class="task-list-flat">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        :show-status-actions="true"
        @click="$emit('task-click', task)"
        @edit="$emit('task-edit', task)"
        @delete="$emit('task-delete', task)"
        @status-change="(id, status) => $emit('task-status-change', id, status)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TaskDto, TaskSummaryDto } from '@/application/dto';
import { TaskStatus, TaskPriority } from '@/domain/enumerations';
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from '@/shared/constants';
import TaskCard from './TaskCard.vue';
import {
  X as XIcon,
  Plus as PlusIcon,
  CheckSquare as CheckSquareIcon,
} from 'lucide-vue-next';

interface TaskFilters {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  assigneeId?: string;
  sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

const props = withDefaults(defineProps<TaskListProps>(), {
  loading: false,
  viewMode: 'list',
  showFilters: true,
  showCreateButton: true,
  assignees: () => [],
  emptyMessage: 'No tasks yet',
});

const emit = defineEmits<TaskListEmits>();

// Filter state
const filters = ref<TaskFilters>({
  status: '',
  priority: '',
  assigneeId: '',
  sortBy: 'dueDate',
  sortOrder: 'asc',
});

const sortValue = computed({
  get: () => `${filters.value.sortBy}-${filters.value.sortOrder}`,
  set: (val: string) => {
    const [sortBy, sortOrder] = val.split('-') as [string, 'asc' | 'desc'];
    filters.value.sortBy = sortBy as TaskFilters['sortBy'];
    filters.value.sortOrder = sortOrder;
  },
});

// Options
const statusOptions = computed(() => [
  { value: TaskStatus.PENDING, label: 'Pending' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.PARTIAL, label: 'Partial' },
  { value: TaskStatus.PERFORMED, label: 'Performed' },
  { value: TaskStatus.COMPLETED, label: 'Completed' },
]);

const priorityOptions = computed(() => [
  { value: TaskPriority.URGENT, label: 'Urgent' },
  { value: TaskPriority.HIGH, label: 'High' },
  { value: TaskPriority.MEDIUM, label: 'Medium' },
  { value: TaskPriority.LOW, label: 'Low' },
]);

// Filtered and sorted tasks
const filteredTasks = computed(() => {
  let result = [...props.tasks];
  
  // Apply filters
  if (filters.value.status) {
    result = result.filter(t => t.status === filters.value.status);
  }
  if (filters.value.priority) {
    result = result.filter(t => t.priority === filters.value.priority);
  }
  if (filters.value.assigneeId) {
    result = result.filter(t => {
      if ('assigneeId' in t) return t.assigneeId === filters.value.assigneeId;
      return true;
    });
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let comparison = 0;
    
    switch (filters.value.sortBy) {
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'priority':
        comparison = getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
        break;
      case 'status':
        comparison = getStatusWeight(a.status) - getStatusWeight(b.status);
        break;
      case 'createdAt':
        if ('createdAt' in a && 'createdAt' in b) {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        break;
    }
    
    return filters.value.sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return result;
});

// Task groups for grouped view
const taskGroups = computed(() => {
  const statuses = [
    TaskStatus.PENDING,
    TaskStatus.IN_PROGRESS,
    TaskStatus.PARTIAL,
    TaskStatus.PERFORMED,
    TaskStatus.COMPLETED,
  ];
  
  return statuses.map(status => ({
    status,
    label: getStatusLabel(status),
    color: TASK_STATUS_COLORS[status],
    tasks: filteredTasks.value.filter(t => t.status === status),
  }));
});

const hasActiveFilters = computed(() => 
  !!(filters.value.status || filters.value.priority || filters.value.assigneeId)
);

// Helpers
function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'Pending',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.PARTIAL]: 'Partial',
    [TaskStatus.PERFORMED]: 'Performed',
    [TaskStatus.COMPLETED]: 'Completed',
  };
  return labels[status];
}

function getPriorityWeight(priority: TaskPriority): number {
  const weights: Record<TaskPriority, number> = {
    [TaskPriority.URGENT]: 1,
    [TaskPriority.HIGH]: 2,
    [TaskPriority.MEDIUM]: 3,
    [TaskPriority.LOW]: 4,
  };
  return weights[priority];
}

function getStatusWeight(status: TaskStatus): number {
  const weights: Record<TaskStatus, number> = {
    [TaskStatus.PENDING]: 1,
    [TaskStatus.IN_PROGRESS]: 2,
    [TaskStatus.PARTIAL]: 3,
    [TaskStatus.PERFORMED]: 4,
    [TaskStatus.COMPLETED]: 5,
  };
  return weights[status];
}

// Event handlers
function emitFilterChange(): void {
  emit('filter-change', {
    status: filters.value.status || undefined,
    priority: filters.value.priority || undefined,
    assigneeId: filters.value.assigneeId || undefined,
    sortBy: filters.value.sortBy,
    sortOrder: filters.value.sortOrder,
  });
}

function handleSortChange(): void {
  emitFilterChange();
}

function clearFilters(): void {
  filters.value = {
    status: '',
    priority: '',
    assigneeId: '',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  };
  emitFilterChange();
}
</script>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* Header */
.task-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.task-list-filters {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.task-list-filter-select {
  height: 36px;
  padding: 0 var(--spacing-8) 0 var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  cursor: pointer;
}

.task-list-filter-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.task-list-clear-filters {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--duration-fast) ease;
}

.task-list-clear-filters:hover {
  color: var(--color-text-primary);
}

.task-list-clear-filters svg {
  width: 14px;
  height: 14px;
}

.task-list-create-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  height: 36px;
  padding: 0 var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: white;
  background-color: var(--color-primary-600);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease;
}

.task-list-create-btn:hover {
  background-color: var(--color-primary-700);
}

.task-list-create-btn svg {
  width: 16px;
  height: 16px;
}

/* Loading */
.task-list-loading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.task-card-skeleton {
  display: flex;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.skeleton-priority-bar {
  width: 4px;
  background-color: var(--color-gray-200);
}

.skeleton-content {
  flex: 1;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.skeleton-line {
  height: 12px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line-short { width: 80px; }
.skeleton-line-medium { width: 60%; }
.skeleton-line-long { width: 90%; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Empty state */
.task-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
}

.task-list-empty-icon {
  width: 48px;
  height: 48px;
  color: var(--color-gray-400);
  margin-bottom: var(--spacing-4);
}

.task-list-empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
}

.task-list-empty-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-4);
}

.task-list-empty-action {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

/* Flat list */
.task-list-flat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

/* Grouped view */
.task-list-grouped {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.task-list-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.task-list-group-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.task-list-group-status {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
}

.task-list-group-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.task-list-group-tasks {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.task-list-group-empty {
  padding: var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  text-align: center;
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .task-list-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .task-list-filters {
    overflow-x: auto;
    padding-bottom: var(--spacing-2);
  }
  
  .task-list-create-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
```

---

### 4. **TaskHistory.vue**

**Responsibilities:**
- Display timeline of task history entries
- Show user, action, timestamp for each entry
- Display old → new value changes
- Show comments/feedback when available
- Loading state
- Empty state

**Props:**

```typescript
interface TaskHistoryProps {
  /** Task history entries */
  history: TaskHistoryEntryDto[];
  /** Loading state */
  loading?: boolean;
}
```

**Template Structure:**

```vue
<template>
  <div class="task-history">
    <h3 class="task-history-title">
      <HistoryIcon class="task-history-title-icon" />
      Activity History
    </h3>
    
    <!-- Loading state -->
    <div v-if="loading" class="task-history-loading">
      <div v-for="n in 3" :key="n" class="task-history-skeleton">
        <div class="skeleton-avatar" />
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-line-short" />
          <div class="skeleton-line skeleton-line-long" />
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="history.length === 0" class="task-history-empty">
      <HistoryIcon class="task-history-empty-icon" />
      <p>No activity recorded yet</p>
    </div>
    
    <!-- History timeline -->
    <div v-else class="task-history-timeline">
      <div
        v-for="(entry, index) in history"
        :key="entry.id"
        class="task-history-entry"
      >
        <!-- Timeline connector -->
        <div class="task-history-connector">
          <div
            :class="['task-history-dot', `task-history-dot-${getActionType(entry.action)}`]"
          />
          <div v-if="index < history.length - 1" class="task-history-line" />
        </div>
        
        <!-- Entry content -->
        <div class="task-history-content">
          <!-- Header: User + Time -->
          <div class="task-history-header">
            <span class="task-history-user">{{ entry.userName }}</span>
            <span class="task-history-time">{{ formatRelativeTime(entry.createdAt) }}</span>
          </div>
          
          <!-- Action description -->
          <p class="task-history-action">
            {{ formatAction(entry) }}
          </p>
          
          <!-- Value change (if applicable) -->
          <div
            v-if="entry.previousValue || entry.newValue"
            class="task-history-change"
          >
            <span v-if="entry.previousValue" class="task-history-old-value">
              {{ formatValue(entry.previousValue) }}
            </span>
            <ArrowRightIcon v-if="entry.previousValue && entry.newValue" class="task-history-arrow" />
            <span v-if="entry.newValue" class="task-history-new-value">
              {{ formatValue(entry.newValue) }}
            </span>
          </div>
          
          <!-- Comment (if any) -->
          <div v-if="entry.comment" class="task-history-comment">
            <MessageSquareIcon class="task-history-comment-icon" />
            <p class="task-history-comment-text">"{{ entry.comment }}"</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskHistoryEntryDto } from '@/application/dto';
import { formatRelativeTime } from '@/shared/utils';
import {
  History as HistoryIcon,
  ArrowRight as ArrowRightIcon,
  MessageSquare as MessageSquareIcon,
} from 'lucide-vue-next';

const props = withDefaults(defineProps<TaskHistoryProps>(), {
  loading: false,
});

// Action type for styling
function getActionType(action: string): 'create' | 'status' | 'update' | 'confirm' | 'reject' {
  const lowercaseAction = action.toLowerCase();
  
  if (lowercaseAction.includes('create')) return 'create';
  if (lowercaseAction.includes('status')) return 'status';
  if (lowercaseAction.includes('confirm') || lowercaseAction.includes('complete')) return 'confirm';
  if (lowercaseAction.includes('reject')) return 'reject';
  return 'update';
}

// Format action for display
function formatAction(entry: TaskHistoryEntryDto): string {
  const action = entry.action.toLowerCase();
  
  // Common action patterns
  if (action.includes('create')) {
    return 'created this task';
  }
  if (action.includes('status_change') || action.includes('status change')) {
    return 'changed the status';
  }
  if (action.includes('confirm')) {
    return 'confirmed and completed the task';
  }
  if (action.includes('reject')) {
    return 'rejected and returned the task';
  }
  if (action.includes('assign')) {
    return 'reassigned the task';
  }
  if (action.includes('priority')) {
    return 'changed the priority';
  }
  if (action.includes('due_date') || action.includes('due date')) {
    return 'changed the due date';
  }
  if (action.includes('description')) {
    return 'updated the description';
  }
  if (action.includes('comment')) {
    return 'added a comment';
  }
  if (action.includes('file')) {
    if (action.includes('add') || action.includes('attach')) {
      return 'attached a file';
    }
    if (action.includes('remove') || action.includes('delete')) {
      return 'removed a file';
    }
  }
  
  // Default: capitalize the action
  return action.replace(/_/g, ' ');
}

// Format value for display
function formatValue(value: string): string {
  // Check if it's a status value
  const statusLabels: Record<string, string> = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    PARTIAL: 'Partial',
    PERFORMED: 'Performed',
    COMPLETED: 'Completed',
  };
  
  if (statusLabels[value]) {
    return statusLabels[value];
  }
  
  // Check if it's a priority value
  const priorityLabels: Record<string, string> = {
    URGENT: 'Urgent',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  };
  
  if (priorityLabels[value]) {
    return priorityLabels[value];
  }
  
  // Check if it's a date (ISO format)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString();
  }
  
  // Default: return as is, but truncate if too long
  return value.length > 50 ? value.slice(0, 50) + '...' : value;
}
</script>

<style scoped>
.task-history {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.task-history-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.task-history-title-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
}

/* Loading */
.task-history-loading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.task-history-skeleton {
  display: flex;
  gap: var(--spacing-3);
}

.skeleton-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-gray-200);
  flex-shrink: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.skeleton-line {
  height: 12px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line-short { width: 120px; }
.skeleton-line-long { width: 80%; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Empty state */
.task-history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  color: var(--color-text-secondary);
  text-align: center;
}

.task-history-empty-icon {
  width: 40px;
  height: 40px;
  color: var(--color-gray-400);
  margin-bottom: var(--spacing-3);
}

.task-history-empty p {
  margin: 0;
  font-size: var(--font-size-sm);
}

/* Timeline */
.task-history-timeline {
  display: flex;
  flex-direction: column;
}

.task-history-entry {
  display: flex;
  gap: var(--spacing-3);
  position: relative;
}

/* Connector (dot + line) */
.task-history-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}

.task-history-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background-color: var(--color-gray-400);
  flex-shrink: 0;
  margin-top: 6px;
}

.task-history-dot-create {
  background-color: var(--color-success-500);
}

.task-history-dot-status {
  background-color: var(--color-primary-500);
}

.task-history-dot-confirm {
  background-color: var(--color-success-500);
}

.task-history-dot-reject {
  background-color: var(--color-error-500);
}

.task-history-dot-update {
  background-color: var(--color-gray-400);
}

.task-history-line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background-color: var(--color-border-primary);
  margin-top: var(--spacing-1);
}

/* Entry content */
.task-history-content {
  flex: 1;
  padding-bottom: var(--spacing-4);
  min-width: 0;
}

.task-history-header {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.task-history-user {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.task-history-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.task-history-action {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-1) 0 0;
}

/* Value change */
.task-history-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.task-history-old-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: line-through;
}

.task-history-arrow {
  width: 14px;
  height: 14px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.task-history-new-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* Comment */
.task-history-comment {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-primary-50);
  border-left: 3px solid var(--color-primary-400);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.task-history-comment-icon {
  width: 14px;
  height: 14px;
  color: var(--color-primary-500);
  flex-shrink: 0;
  margin-top: 2px;
}

.task-history-comment-text {
  font-size: var(--font-size-sm);
  font-style: italic;
  color: var(--color-text-secondary);
  margin: 0;
  word-break: break-word;
}
</style>
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x with Vue 3
- **Code style:** Google TypeScript Style Guide
- **Framework:** Vue 3 Composition API with `<script setup>`
- **Styling:** Scoped CSS using CSS variables from `variables.css`

## Mandatory best practices:
- **Accessibility:** ARIA attributes, keyboard navigation, focus management
- **Type Safety:** Full props/emits interfaces with defineProps/defineEmits
- **Responsiveness:** Mobile-first design
- **Performance:** Efficient filtering and sorting
- **Status Workflow:** Respect allowed transitions
- **Visual Feedback:** Clear status and priority indicators

## Component Design Principles:
- Follow task status workflow rules
- Color-coded status and priority badges
- Support both card and list layouts
- Handle confirmation flow for admin

---

# DELIVERABLES

1. **Complete source code** for all 4 files:
   - `TaskCard.vue`
   - `TaskForm.vue`
   - `TaskList.vue`
   - `TaskHistory.vue`

2. **For each component:**
   - Full `<script setup>` with TypeScript
   - Props/Emits interfaces
   - Scoped CSS with CSS variables
   - Responsive design
   - Accessibility attributes

3. **Features per component:**
   - **TaskCard:** Status/priority badges, quick actions, drag support
   - **TaskForm:** Create/edit, validation, status change, confirmation flow
   - **TaskList:** Filtering, sorting, grouped view, empty states
   - **TaskHistory:** Timeline, value changes, comments

---

# OUTPUT FORMAT

```vue
<!-- src/presentation/components/task/TaskCard.vue -->
[Complete code]
```

```vue
<!-- src/presentation/components/task/TaskForm.vue -->
[Complete code]
```

```vue
<!-- src/presentation/components/task/TaskList.vue -->
[Complete code]
```

```vue
<!-- src/presentation/components/task/TaskHistory.vue -->
[Complete code]
```

**Design decisions made:**
- [Decision 1]
- [Decision 2]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
