# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → Infrastructure Layer → **Presentation Layer** (current)

**Current module:** Presentation Layer - Project Components

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
│       │   │   ├── AppFooter.vue
│       │   │   ├── AppHeader.vue
│       │   │   ├── AppSidebar.vue
│       │   │   └── LoadingSpinner.vue
│       │   ├── project/
│       │   │   ├── ProjectCard.vue         # 🎯 TO IMPLEMENT
│       │   │   ├── ProjectForm.vue         # 🎯 TO IMPLEMENT
│       │   │   └── ProjectSummary.vue      # 🎯 TO IMPLEMENT
│       │   ├── task/
│       │   │   └── ...
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

## 1. Project DTOs (Already Implemented)

```typescript
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
  taskStats: {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
  };
  recentMessages: MessageSummaryDto[];
  unreadMessagesCount: number;
  participants: ParticipantDto[];
  sections: ProjectSectionDto[];
  currentUserPermissions: {
    canEdit: boolean;
    canDelete: boolean;
    canFinalize: boolean;
    canAddParticipants: boolean;
    canUploadFiles: boolean;
    canSendMessages: boolean;
  };
}

interface ProjectDto {
  id: string;
  code: string;
  name: string;
  year: number;
  clientId: string;
  clientName: string;
  type: ProjectType;
  coordinateX: number | null;
  coordinateY: number | null;
  contractDate: Date;
  deliveryDate: Date;
  status: ProjectStatus;
  dropboxFolderId: string | null;
  specialUserIds: string[];
  createdAt: Date;
  updatedAt: Date;
  finalizedAt: Date | null;
}

interface CreateProjectDto {
  code: string;
  name: string;
  year: number;
  clientId: string;
  type: ProjectType;
  coordinateX?: number;
  coordinateY?: number;
  contractDate: Date;
  deliveryDate: Date;
}

interface UpdateProjectDto {
  id: string;
  name?: string;
  type?: ProjectType;
  coordinateX?: number;
  coordinateY?: number;
  contractDate?: Date;
  deliveryDate?: Date;
}

interface ParticipantDto {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  permissions?: AccessRight[];
}

interface ProjectSectionDto {
  name: string;
  key: string;
  fileCount: number;
  lastUpdated: Date | null;
}
```

## 2. Enumerations (Already Implemented)

```typescript
enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  FINALIZED = 'FINALIZED',
}

enum ProjectType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  PUBLIC = 'PUBLIC',
}
```

## 3. Composables (Already Implemented)

```typescript
// useProjects
const {
  projects,
  activeProjects,
  currentProject,
  isLoading,
  error,
  fetchProjects,
  loadProject,
  createProject,
  updateProject,
  deleteProject,
  finalizeProject,
  setFilters,
  resetFilters,
  getProjectStatusColor,
} = useProjects();

// useAuth
const { isAdmin, canModifyProject, canDeleteProject } = useAuth();
```

## 4. Design Specifications

### Project Card
- Display: code, name, client, delivery date, status
- Status indicator with color (left border or badge)
- Task and message counters with badges
- Overdue warning indicator
- Click to navigate to details
- Action menu for edit/delete (admin only)

### Project Form
- Create and edit modes
- Field validation with error messages
- Client selection dropdown (create mode only)
- Type selection dropdown
- Date pickers for contract and delivery dates
- Coordinate inputs (optional, for geographic reference)
- Auto-generate project code button

### Project Summary
- Comprehensive project information display
- Header with status badge and quick actions
- Stats cards (tasks, messages, files)
- Delivery date with countdown or overdue indicator
- Participant list preview
- Recent activity summary

---

# SPECIFIC TASK

Implement all Project Components for the Presentation Layer. These components handle project display, listing, creation, and editing.

## Files to implement:

### 1. **ProjectCard.vue**

**Responsibilities:**
- Display project summary information in card format
- Show status indicator with appropriate color
- Display task and message counts with badges
- Show overdue warning when applicable
- Navigate to project details on click
- Provide action menu for edit/delete (permission-based)

**Props:**

```typescript
interface ProjectCardProps {
  /** Project data */
  project: ProjectSummaryDto;
  /** Compact display mode */
  compact?: boolean;
  /** Show action buttons */
  showActions?: boolean;
  /** Selected state */
  selected?: boolean;
}
```

**Emits:**

```typescript
interface ProjectCardEmits {
  (e: 'click', project: ProjectSummaryDto): void;
  (e: 'edit', project: ProjectSummaryDto): void;
  (e: 'delete', project: ProjectSummaryDto): void;
}
```

**Template Structure:**

```vue
<template>
  <article
    :class="[
      'project-card',
      {
        'project-card-compact': compact,
        'project-card-selected': selected,
        'project-card-overdue': project.isOverdue,
        'project-card-finalized': project.status === 'FINALIZED',
      }
    ]"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <!-- Status indicator bar (left edge) -->
    <div
      :class="['project-card-status-bar', `project-card-status-${project.statusColor}`]"
      :aria-label="`Status: ${statusLabel}`"
    />
    
    <!-- Card content -->
    <div class="project-card-content">
      <!-- Header: Code + Actions -->
      <div class="project-card-header">
        <div class="project-card-code">
          <span class="project-card-code-text">{{ project.code }}</span>
          <span
            v-if="project.status === 'FINALIZED'"
            class="project-card-finalized-badge"
          >
            Finalized
          </span>
        </div>
        
        <!-- Actions dropdown (shown if showActions and has permissions) -->
        <div v-if="showActions && hasActions" class="project-card-actions" @click.stop>
          <button
            ref="actionsButtonRef"
            type="button"
            class="project-card-actions-trigger"
            aria-label="Project actions"
            aria-haspopup="true"
            :aria-expanded="actionsMenuOpen"
            @click="toggleActionsMenu"
          >
            <MoreVerticalIcon />
          </button>
          
          <Transition name="dropdown">
            <div v-if="actionsMenuOpen" ref="actionsMenuRef" class="project-card-actions-menu">
              <button
                type="button"
                class="project-card-actions-item"
                @click="handleEdit"
              >
                <EditIcon class="project-card-actions-icon" />
                <span>Edit Project</span>
              </button>
              <button
                type="button"
                class="project-card-actions-item project-card-actions-item-danger"
                @click="handleDelete"
              >
                <TrashIcon class="project-card-actions-icon" />
                <span>Delete Project</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
      
      <!-- Title -->
      <h3 class="project-card-title">{{ project.name }}</h3>
      
      <!-- Client -->
      <p class="project-card-client">
        <UserIcon class="project-card-client-icon" />
        <span>{{ project.clientName }}</span>
      </p>
      
      <!-- Type badge -->
      <span :class="['project-card-type', `project-card-type-${project.type.toLowerCase()}`]">
        {{ typeLabel }}
      </span>
      
      <!-- Footer: Date + Counters -->
      <div class="project-card-footer">
        <!-- Delivery date -->
        <div
          :class="[
            'project-card-date',
            { 'project-card-date-overdue': project.isOverdue && !isFinalized }
          ]"
        >
          <CalendarIcon class="project-card-date-icon" />
          <span>{{ formattedDeliveryDate }}</span>
          <span v-if="project.isOverdue && !isFinalized" class="project-card-overdue-badge">
            Overdue
          </span>
          <span
            v-else-if="!isFinalized && project.daysUntilDelivery <= 7 && project.daysUntilDelivery >= 0"
            class="project-card-days-left"
          >
            {{ project.daysUntilDelivery }} days left
          </span>
        </div>
        
        <!-- Counters -->
        <div class="project-card-counters">
          <!-- Pending Tasks -->
          <div
            v-if="project.pendingTasksCount > 0"
            :class="[
              'project-card-counter',
              { 'project-card-counter-warning': project.hasPendingTasks }
            ]"
            :title="`${project.pendingTasksCount} pending tasks`"
          >
            <CheckSquareIcon class="project-card-counter-icon" />
            <span>{{ project.pendingTasksCount }}</span>
          </div>
          
          <!-- Unread Messages -->
          <div
            v-if="project.unreadMessagesCount > 0"
            class="project-card-counter project-card-counter-primary"
            :title="`${project.unreadMessagesCount} unread messages`"
          >
            <MessageCircleIcon class="project-card-counter-icon" />
            <span>{{ project.unreadMessagesCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import type { ProjectSummaryDto } from '@/application/dto';
import { ProjectType, ProjectStatus } from '@/domain/enumerations';
import { formatDate } from '@/shared/utils';
import { useAuth } from '@/presentation/composables';

// Icons (assuming Lucide Vue or similar)
import {
  MoreVertical as MoreVerticalIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  CheckSquare as CheckSquareIcon,
  MessageCircle as MessageCircleIcon,
} from 'lucide-vue-next';

const props = withDefaults(defineProps<ProjectCardProps>(), {
  compact: false,
  showActions: true,
  selected: false,
});

const emit = defineEmits<ProjectCardEmits>();
const router = useRouter();
const { isAdmin } = useAuth();

// Actions menu state
const actionsButtonRef = ref<HTMLElement | null>(null);
const actionsMenuRef = ref<HTMLElement | null>(null);
const actionsMenuOpen = ref(false);

// Close menu on click outside
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

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Computed properties
const isFinalized = computed(() => props.project.status === ProjectStatus.FINALIZED);

const hasActions = computed(() => isAdmin.value && !isFinalized.value);

const statusLabel = computed(() => {
  const labels: Record<ProjectStatus, string> = {
    [ProjectStatus.ACTIVE]: 'Active',
    [ProjectStatus.IN_PROGRESS]: 'In Progress',
    [ProjectStatus.PENDING_REVIEW]: 'Pending Review',
    [ProjectStatus.FINALIZED]: 'Finalized',
  };
  return labels[props.project.status] || props.project.status;
});

const typeLabel = computed(() => {
  const labels: Record<ProjectType, string> = {
    [ProjectType.RESIDENTIAL]: 'Residential',
    [ProjectType.COMMERCIAL]: 'Commercial',
    [ProjectType.INDUSTRIAL]: 'Industrial',
    [ProjectType.PUBLIC]: 'Public',
  };
  return labels[props.project.type] || props.project.type;
});

const formattedDeliveryDate = computed(() => {
  return formatDate(props.project.deliveryDate, 'dd MMM yyyy');
});

// Event handlers
function handleClick() {
  emit('click', props.project);
  router.push({ name: 'project-details', params: { id: props.project.id } });
}

function toggleActionsMenu() {
  actionsMenuOpen.value = !actionsMenuOpen.value;
}

function handleEdit() {
  actionsMenuOpen.value = false;
  emit('edit', props.project);
}

function handleDelete() {
  actionsMenuOpen.value = false;
  emit('delete', props.project);
}
</script>

<style scoped>
.project-card {
  position: relative;
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

.project-card:hover {
  border-color: var(--color-border-secondary);
  box-shadow: var(--shadow-md);
}

.project-card:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.project-card-selected {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
}

.project-card-overdue:not(.project-card-finalized) {
  border-color: var(--color-error-300);
}

.project-card-finalized {
  opacity: 0.85;
}

/* Status bar (left edge indicator) */
.project-card-status-bar {
  width: 4px;
  flex-shrink: 0;
}

.project-card-status-red { background-color: var(--color-error-500); }
.project-card-status-green { background-color: var(--color-success-500); }
.project-card-status-yellow { background-color: var(--color-warning-500); }
.project-card-status-gray { background-color: var(--color-gray-400); }

/* Content */
.project-card-content {
  flex: 1;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0; /* Allow text truncation */
}

/* Header */
.project-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
}

.project-card-code {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.project-card-code-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-card-finalized-badge {
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

/* Title */
.project-card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Client */
.project-card-client {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.project-card-client-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Type badge */
.project-card-type {
  align-self: flex-start;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.project-card-type-residential {
  color: var(--color-info-700);
  background-color: var(--color-info-100);
}

.project-card-type-commercial {
  color: var(--color-success-700);
  background-color: var(--color-success-100);
}

.project-card-type-industrial {
  color: var(--color-warning-700);
  background-color: var(--color-warning-100);
}

.project-card-type-public {
  color: var(--color-primary-700);
  background-color: var(--color-primary-100);
}

/* Footer */
.project-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  margin-top: auto;
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-border-primary);
}

/* Date */
.project-card-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.project-card-date-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.project-card-date-overdue {
  color: var(--color-error-600);
}

.project-card-overdue-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-error-700);
  background-color: var(--color-error-100);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.project-card-days-left {
  font-size: var(--font-size-xs);
  color: var(--color-warning-600);
}

/* Counters */
.project-card-counters {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.project-card-counter {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.project-card-counter-icon {
  width: 14px;
  height: 14px;
}

.project-card-counter-warning {
  color: var(--color-warning-600);
}

.project-card-counter-primary {
  color: var(--color-primary-600);
}

/* Actions */
.project-card-actions {
  position: relative;
}

.project-card-actions-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: color var(--duration-fast) ease, background-color var(--duration-fast) ease;
}

.project-card-actions-trigger:hover {
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
}

.project-card-actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: var(--z-dropdown);
  min-width: 160px;
  margin-top: var(--spacing-1);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-1);
}

.project-card-actions-item {
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

.project-card-actions-item:hover {
  background-color: var(--color-gray-100);
}

.project-card-actions-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.project-card-actions-item-danger {
  color: var(--color-error-600);
}

.project-card-actions-item-danger:hover {
  background-color: var(--color-error-50);
}

/* Compact mode */
.project-card-compact .project-card-content {
  padding: var(--spacing-3);
}

.project-card-compact .project-card-title {
  font-size: var(--font-size-sm);
  -webkit-line-clamp: 1;
}

.project-card-compact .project-card-client,
.project-card-compact .project-card-type {
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

### 2. **ProjectForm.vue**

**Responsibilities:**
- Handle both create and edit project modes
- Form validation with error display
- Client selection dropdown (create mode only)
- Type selection dropdown
- Date pickers for contract and delivery dates
- Optional coordinate inputs
- Auto-generate project code functionality
- Submit and cancel actions

**Props:**

```typescript
interface ProjectFormProps {
  /** Project to edit (undefined for create mode) */
  project?: ProjectDto;
  /** Form submission loading state */
  loading?: boolean;
  /** Available clients for selection (required for create mode) */
  clients?: Array<{ id: string; name: string }>;
  /** Initial client ID (for pre-selection in create mode) */
  initialClientId?: string;
}
```

**Emits:**

```typescript
interface ProjectFormEmits {
  (e: 'submit', data: CreateProjectDto | UpdateProjectDto): void;
  (e: 'cancel'): void;
}
```

**Template Structure:**

```vue
<template>
  <form class="project-form" novalidate @submit.prevent="handleSubmit">
    <h2 class="project-form-title">
      {{ isEditMode ? 'Edit Project' : 'Create New Project' }}
    </h2>
    
    <!-- Project Code & Year row -->
    <div class="project-form-row">
      <!-- Code -->
      <div class="project-form-field">
        <label for="project-code" class="project-form-label">
          Project Code
          <span class="project-form-required">*</span>
        </label>
        <div class="project-form-input-group">
          <input
            id="project-code"
            v-model="form.code"
            type="text"
            class="project-form-input"
            :class="{ 'project-form-input-error': errors.code }"
            placeholder="CART-2025-001"
            :disabled="isEditMode"
            :readonly="isEditMode"
            required
            @blur="validateField('code')"
          />
          <button
            v-if="!isEditMode"
            type="button"
            class="project-form-generate-btn"
            title="Generate project code"
            @click="generateCode"
          >
            <RefreshCwIcon />
          </button>
        </div>
        <p v-if="errors.code" class="project-form-error">{{ errors.code }}</p>
        <p v-else class="project-form-hint">Format: CART-YYYY-NNN</p>
      </div>
      
      <!-- Year -->
      <div class="project-form-field">
        <label for="project-year" class="project-form-label">
          Year
          <span class="project-form-required">*</span>
        </label>
        <input
          id="project-year"
          v-model.number="form.year"
          type="number"
          class="project-form-input"
          :class="{ 'project-form-input-error': errors.year }"
          :min="2020"
          :max="2100"
          :disabled="isEditMode"
          :readonly="isEditMode"
          required
          @blur="validateField('year')"
        />
        <p v-if="errors.year" class="project-form-error">{{ errors.year }}</p>
      </div>
    </div>
    
    <!-- Name -->
    <div class="project-form-field">
      <label for="project-name" class="project-form-label">
        Project Name
        <span class="project-form-required">*</span>
      </label>
      <input
        id="project-name"
        v-model="form.name"
        type="text"
        class="project-form-input"
        :class="{ 'project-form-input-error': errors.name }"
        placeholder="Enter project name"
        maxlength="200"
        required
        @blur="validateField('name')"
      />
      <p v-if="errors.name" class="project-form-error">{{ errors.name }}</p>
      <p v-else class="project-form-hint">{{ form.name.length }}/200 characters</p>
    </div>
    
    <!-- Client (create mode only) -->
    <div v-if="!isEditMode" class="project-form-field">
      <label for="project-client" class="project-form-label">
        Client
        <span class="project-form-required">*</span>
      </label>
      <select
        id="project-client"
        v-model="form.clientId"
        class="project-form-select"
        :class="{ 'project-form-input-error': errors.clientId }"
        required
        @blur="validateField('clientId')"
        @change="validateField('clientId')"
      >
        <option value="" disabled>Select a client</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.name }}
        </option>
      </select>
      <p v-if="errors.clientId" class="project-form-error">{{ errors.clientId }}</p>
    </div>
    
    <!-- Type -->
    <div class="project-form-field">
      <label for="project-type" class="project-form-label">
        Project Type
        <span class="project-form-required">*</span>
      </label>
      <select
        id="project-type"
        v-model="form.type"
        class="project-form-select"
        :class="{ 'project-form-input-error': errors.type }"
        required
        @blur="validateField('type')"
        @change="validateField('type')"
      >
        <option value="" disabled>Select project type</option>
        <option v-for="option in typeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <p v-if="errors.type" class="project-form-error">{{ errors.type }}</p>
    </div>
    
    <!-- Dates row -->
    <div class="project-form-row">
      <!-- Contract Date -->
      <div class="project-form-field">
        <label for="project-contract-date" class="project-form-label">
          Contract Date
          <span class="project-form-required">*</span>
        </label>
        <input
          id="project-contract-date"
          v-model="form.contractDate"
          type="date"
          class="project-form-input"
          :class="{ 'project-form-input-error': errors.contractDate }"
          required
          @blur="validateField('contractDate')"
          @change="validateField('contractDate')"
        />
        <p v-if="errors.contractDate" class="project-form-error">{{ errors.contractDate }}</p>
      </div>
      
      <!-- Delivery Date -->
      <div class="project-form-field">
        <label for="project-delivery-date" class="project-form-label">
          Delivery Date
          <span class="project-form-required">*</span>
        </label>
        <input
          id="project-delivery-date"
          v-model="form.deliveryDate"
          type="date"
          class="project-form-input"
          :class="{ 'project-form-input-error': errors.deliveryDate }"
          :min="form.contractDate || undefined"
          required
          @blur="validateField('deliveryDate')"
          @change="validateField('deliveryDate')"
        />
        <p v-if="errors.deliveryDate" class="project-form-error">{{ errors.deliveryDate }}</p>
      </div>
    </div>
    
    <!-- Coordinates section (optional) -->
    <fieldset class="project-form-fieldset">
      <legend class="project-form-legend">
        Geographic Coordinates
        <span class="project-form-optional">(Optional)</span>
      </legend>
      
      <div class="project-form-row">
        <!-- Longitude (X) -->
        <div class="project-form-field">
          <label for="project-coord-x" class="project-form-label">
            Longitude (X)
          </label>
          <input
            id="project-coord-x"
            v-model.number="form.coordinateX"
            type="number"
            class="project-form-input"
            :class="{ 'project-form-input-error': errors.coordinateX }"
            placeholder="-180 to 180"
            :min="-180"
            :max="180"
            step="0.000001"
            @blur="validateField('coordinateX')"
          />
          <p v-if="errors.coordinateX" class="project-form-error">{{ errors.coordinateX }}</p>
        </div>
        
        <!-- Latitude (Y) -->
        <div class="project-form-field">
          <label for="project-coord-y" class="project-form-label">
            Latitude (Y)
          </label>
          <input
            id="project-coord-y"
            v-model.number="form.coordinateY"
            type="number"
            class="project-form-input"
            :class="{ 'project-form-input-error': errors.coordinateY }"
            placeholder="-90 to 90"
            :min="-90"
            :max="90"
            step="0.000001"
            @blur="validateField('coordinateY')"
          />
          <p v-if="errors.coordinateY" class="project-form-error">{{ errors.coordinateY }}</p>
        </div>
      </div>
    </fieldset>
    
    <!-- Form actions -->
    <div class="project-form-actions">
      <button
        type="button"
        class="project-form-btn project-form-btn-secondary"
        :disabled="loading"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      
      <button
        type="submit"
        class="project-form-btn project-form-btn-primary"
        :disabled="loading || !isFormValid"
      >
        <LoadingSpinner v-if="loading" size="sm" />
        <span>{{ isEditMode ? 'Update Project' : 'Create Project' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import type { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@/application/dto';
import { ProjectType } from '@/domain/enumerations';
import { isValidProjectCode, generateProjectCode } from '@/shared/utils';
import { PROJECT, VALIDATION } from '@/shared/constants';
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue';
import { RefreshCw as RefreshCwIcon } from 'lucide-vue-next';

interface ProjectFormProps {
  project?: ProjectDto;
  loading?: boolean;
  clients?: Array<{ id: string; name: string }>;
  initialClientId?: string;
}

interface ProjectFormEmits {
  (e: 'submit', data: CreateProjectDto | UpdateProjectDto): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<ProjectFormProps>(), {
  loading: false,
  clients: () => [],
  initialClientId: '',
});

const emit = defineEmits<ProjectFormEmits>();

// Form state
const form = reactive({
  code: '',
  name: '',
  year: new Date().getFullYear(),
  clientId: '',
  type: '' as ProjectType | '',
  contractDate: '',
  deliveryDate: '',
  coordinateX: null as number | null,
  coordinateY: null as number | null,
});

const errors = reactive<Record<string, string>>({});
const touched = reactive<Record<string, boolean>>({});

// Computed
const isEditMode = computed(() => !!props.project);

const typeOptions = computed(() => [
  { value: ProjectType.RESIDENTIAL, label: 'Residential' },
  { value: ProjectType.COMMERCIAL, label: 'Commercial' },
  { value: ProjectType.INDUSTRIAL, label: 'Industrial' },
  { value: ProjectType.PUBLIC, label: 'Public' },
]);

const isFormValid = computed(() => {
  // Check required fields are filled
  const hasRequiredFields = Boolean(
    form.code &&
    form.name &&
    form.year &&
    (isEditMode.value || form.clientId) &&
    form.type &&
    form.contractDate &&
    form.deliveryDate
  );
  
  // Check no validation errors
  const hasNoErrors = Object.keys(errors).every(key => !errors[key]);
  
  return hasRequiredFields && hasNoErrors;
});

// Initialize form for edit mode
onMounted(() => {
  if (props.project) {
    form.code = props.project.code;
    form.name = props.project.name;
    form.year = props.project.year;
    form.clientId = props.project.clientId;
    form.type = props.project.type;
    form.contractDate = formatDateForInput(props.project.contractDate);
    form.deliveryDate = formatDateForInput(props.project.deliveryDate);
    form.coordinateX = props.project.coordinateX;
    form.coordinateY = props.project.coordinateY;
  } else if (props.initialClientId) {
    form.clientId = props.initialClientId;
  }
});

// Validation functions
function validateField(field: string): void {
  touched[field] = true;
  errors[field] = '';
  
  switch (field) {
    case 'code':
      if (!form.code) {
        errors.code = 'Project code is required';
      } else if (!isValidProjectCode(form.code)) {
        errors.code = 'Invalid format. Use CART-YYYY-NNN (e.g., CART-2025-001)';
      }
      break;
      
    case 'name':
      if (!form.name) {
        errors.name = 'Project name is required';
      } else if (form.name.length > 200) {
        errors.name = 'Name must be 200 characters or less';
      }
      break;
      
    case 'year':
      if (!form.year) {
        errors.year = 'Year is required';
      } else if (form.year < 2020 || form.year > 2100) {
        errors.year = 'Year must be between 2020 and 2100';
      }
      break;
      
    case 'clientId':
      if (!isEditMode.value && !form.clientId) {
        errors.clientId = 'Please select a client';
      }
      break;
      
    case 'type':
      if (!form.type) {
        errors.type = 'Please select a project type';
      }
      break;
      
    case 'contractDate':
      if (!form.contractDate) {
        errors.contractDate = 'Contract date is required';
      }
      break;
      
    case 'deliveryDate':
      if (!form.deliveryDate) {
        errors.deliveryDate = 'Delivery date is required';
      } else if (form.contractDate && new Date(form.deliveryDate) < new Date(form.contractDate)) {
        errors.deliveryDate = 'Delivery date must be after contract date';
      }
      break;
      
    case 'coordinateX':
      if (form.coordinateX !== null && form.coordinateX !== undefined) {
        if (form.coordinateX < -180 || form.coordinateX > 180) {
          errors.coordinateX = 'Longitude must be between -180 and 180';
        }
      }
      break;
      
    case 'coordinateY':
      if (form.coordinateY !== null && form.coordinateY !== undefined) {
        if (form.coordinateY < -90 || form.coordinateY > 90) {
          errors.coordinateY = 'Latitude must be between -90 and 90';
        }
      }
      break;
  }
}

function validateAllFields(): boolean {
  const fields = ['code', 'name', 'year', 'clientId', 'type', 'contractDate', 'deliveryDate', 'coordinateX', 'coordinateY'];
  fields.forEach(validateField);
  return Object.values(errors).every(error => !error);
}

// Generate project code
function generateCode(): void {
  const year = form.year || new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 999) + 1;
  form.code = generateProjectCode(year, sequence);
  validateField('code');
}

// Auto-update year from code
watch(() => form.code, (code) => {
  const match = code.match(/^CART-(\d{4})-\d{3}$/);
  if (match && !isEditMode.value) {
    form.year = parseInt(match[1], 10);
  }
});

// Format date for input[type="date"]
function formatDateForInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Submit handler
function handleSubmit(): void {
  if (!validateAllFields()) {
    return;
  }
  
  if (isEditMode.value) {
    const updateData: UpdateProjectDto = {
      id: props.project!.id,
      name: form.name,
      type: form.type as ProjectType,
      contractDate: new Date(form.contractDate),
      deliveryDate: new Date(form.deliveryDate),
      coordinateX: form.coordinateX ?? undefined,
      coordinateY: form.coordinateY ?? undefined,
    };
    emit('submit', updateData);
  } else {
    const createData: CreateProjectDto = {
      code: form.code,
      name: form.name,
      year: form.year,
      clientId: form.clientId,
      type: form.type as ProjectType,
      contractDate: new Date(form.contractDate),
      deliveryDate: new Date(form.deliveryDate),
      coordinateX: form.coordinateX ?? undefined,
      coordinateY: form.coordinateY ?? undefined,
    };
    emit('submit', createData);
  }
}
</script>

<style scoped>
.project-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  max-width: 600px;
}

.project-form-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
}

.project-form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

@media (max-width: 640px) {
  .project-form-row {
    grid-template-columns: 1fr;
  }
}

.project-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.project-form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.project-form-required {
  color: var(--color-error-500);
  margin-left: 2px;
}

.project-form-optional {
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.project-form-input,
.project-form-select {
  height: var(--height-input);
  padding: 0 var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
}

.project-form-input:focus,
.project-form-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.project-form-input:disabled,
.project-form-input:read-only {
  background-color: var(--color-gray-100);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.project-form-input-error {
  border-color: var(--color-error-500);
}

.project-form-input-error:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

.project-form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-3) center;
  padding-right: var(--spacing-10);
  cursor: pointer;
}

.project-form-input-group {
  display: flex;
  gap: var(--spacing-2);
}

.project-form-input-group .project-form-input {
  flex: 1;
}

.project-form-generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--height-input);
  height: var(--height-input);
  color: var(--color-gray-500);
  background-color: var(--color-gray-100);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: color var(--duration-fast) ease, background-color var(--duration-fast) ease;
}

.project-form-generate-btn:hover {
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-300);
}

.project-form-generate-btn svg {
  width: 18px;
  height: 18px;
}

.project-form-error {
  font-size: var(--font-size-xs);
  color: var(--color-error-600);
  margin: 0;
}

.project-form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

.project-form-fieldset {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  margin: 0;
}

.project-form-legend {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  padding: 0 var(--spacing-2);
}

.project-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-primary);
}

.project-form-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  height: var(--height-button);
  padding: 0 var(--spacing-5);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color var(--duration-fast) ease,
              border-color var(--duration-fast) ease,
              color var(--duration-fast) ease;
}

.project-form-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.project-form-btn-primary {
  color: white;
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.project-form-btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.project-form-btn-secondary {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-primary);
}

.project-form-btn-secondary:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}
</style>
```

---

### 3. **ProjectSummary.vue**

**Responsibilities:**
- Display comprehensive project information
- Show project header with status and actions
- Display quick stats (tasks, messages, dates)
- List participants preview
- Show project sections/categories
- Handle actions (edit, finalize, delete) with permissions

**Props:**

```typescript
interface ProjectSummaryProps {
  /** Project details data */
  projectDetails: ProjectDetailsDto;
  /** Loading state */
  loading?: boolean;
}
```

**Emits:**

```typescript
interface ProjectSummaryEmits {
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'finalize'): void;
  (e: 'view-tasks'): void;
  (e: 'view-messages'): void;
  (e: 'view-files'): void;
  (e: 'view-participants'): void;
}
```

**Template Structure:**

```vue
<template>
  <div class="project-summary">
    <!-- Loading state -->
    <div v-if="loading" class="project-summary-loading">
      <LoadingSpinner size="lg" />
      <p>Loading project details...</p>
    </div>
    
    <template v-else>
      <!-- Header Section -->
      <header class="project-summary-header">
        <div class="project-summary-header-main">
          <!-- Code and Status -->
          <div class="project-summary-meta">
            <span class="project-summary-code">{{ project.code }}</span>
            <span :class="['project-summary-status', `project-summary-status-${statusColor}`]">
              {{ statusLabel }}
            </span>
          </div>
          
          <!-- Title -->
          <h1 class="project-summary-title">{{ project.name }}</h1>
          
          <!-- Client & Type -->
          <div class="project-summary-info">
            <div class="project-summary-info-item">
              <UserIcon class="project-summary-info-icon" />
              <span>{{ project.clientName }}</span>
            </div>
            <span class="project-summary-info-divider">•</span>
            <div class="project-summary-info-item">
              <TagIcon class="project-summary-info-icon" />
              <span>{{ typeLabel }}</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="project-summary-actions">
          <button
            v-if="permissions.canEdit && !isFinalized"
            type="button"
            class="project-summary-action-btn"
            @click="$emit('edit')"
          >
            <EditIcon />
            <span>Edit</span>
          </button>
          
          <button
            v-if="permissions.canFinalize && !isFinalized"
            type="button"
            class="project-summary-action-btn project-summary-action-btn-primary"
            :disabled="!canFinalize"
            :title="!canFinalize ? 'Complete all tasks before finalizing' : 'Finalize project'"
            @click="$emit('finalize')"
          >
            <CheckCircleIcon />
            <span>Finalize</span>
          </button>
          
          <button
            v-if="permissions.canDelete"
            type="button"
            class="project-summary-action-btn project-summary-action-btn-danger"
            @click="$emit('delete')"
          >
            <TrashIcon />
          </button>
        </div>
      </header>
      
      <!-- Stats Grid -->
      <div class="project-summary-stats">
        <!-- Tasks Stat -->
        <div
          class="project-summary-stat project-summary-stat-clickable"
          @click="$emit('view-tasks')"
        >
          <div class="project-summary-stat-icon project-summary-stat-icon-tasks">
            <CheckSquareIcon />
          </div>
          <div class="project-summary-stat-content">
            <span class="project-summary-stat-value">
              {{ taskStats.completed }}/{{ taskStats.total }}
            </span>
            <span class="project-summary-stat-label">Tasks Completed</span>
          </div>
          <div v-if="taskStats.pending > 0" class="project-summary-stat-badge project-summary-stat-badge-warning">
            {{ taskStats.pending }} pending
          </div>
        </div>
        
        <!-- Messages Stat -->
        <div
          class="project-summary-stat project-summary-stat-clickable"
          @click="$emit('view-messages')"
        >
          <div class="project-summary-stat-icon project-summary-stat-icon-messages">
            <MessageCircleIcon />
          </div>
          <div class="project-summary-stat-content">
            <span class="project-summary-stat-value">
              {{ projectDetails.unreadMessagesCount }}
            </span>
            <span class="project-summary-stat-label">Unread Messages</span>
          </div>
          <div v-if="projectDetails.unreadMessagesCount > 0" class="project-summary-stat-badge project-summary-stat-badge-primary">
            New
          </div>
        </div>
        
        <!-- Delivery Date Stat -->
        <div class="project-summary-stat">
          <div
            :class="[
              'project-summary-stat-icon',
              isOverdue ? 'project-summary-stat-icon-danger' : 'project-summary-stat-icon-info'
            ]"
          >
            <CalendarIcon />
          </div>
          <div class="project-summary-stat-content">
            <span class="project-summary-stat-value">{{ formattedDeliveryDate }}</span>
            <span class="project-summary-stat-label">
              <template v-if="isFinalized">Delivered</template>
              <template v-else-if="isOverdue">Overdue by {{ Math.abs(daysUntilDelivery) }} days</template>
              <template v-else>{{ daysUntilDelivery }} days remaining</template>
            </span>
          </div>
          <div v-if="isOverdue && !isFinalized" class="project-summary-stat-badge project-summary-stat-badge-danger">
            Overdue
          </div>
        </div>
        
        <!-- Participants Stat -->
        <div
          class="project-summary-stat project-summary-stat-clickable"
          @click="$emit('view-participants')"
        >
          <div class="project-summary-stat-icon project-summary-stat-icon-participants">
            <UsersIcon />
          </div>
          <div class="project-summary-stat-content">
            <span class="project-summary-stat-value">{{ participants.length }}</span>
            <span class="project-summary-stat-label">Participants</span>
          </div>
        </div>
      </div>
      
      <!-- Project Dates -->
      <div class="project-summary-dates">
        <div class="project-summary-date">
          <span class="project-summary-date-label">Contract Date</span>
          <span class="project-summary-date-value">{{ formattedContractDate }}</span>
        </div>
        <div class="project-summary-date">
          <span class="project-summary-date-label">Delivery Date</span>
          <span class="project-summary-date-value">{{ formattedDeliveryDate }}</span>
        </div>
        <div v-if="project.finalizedAt" class="project-summary-date">
          <span class="project-summary-date-label">Finalized At</span>
          <span class="project-summary-date-value">{{ formattedFinalizedDate }}</span>
        </div>
      </div>
      
      <!-- Coordinates (if available) -->
      <div v-if="hasCoordinates" class="project-summary-coordinates">
        <h3 class="project-summary-section-title">
          <MapPinIcon class="project-summary-section-icon" />
          Geographic Location
        </h3>
        <div class="project-summary-coordinates-grid">
          <div class="project-summary-coordinate">
            <span class="project-summary-coordinate-label">Longitude (X)</span>
            <span class="project-summary-coordinate-value">{{ project.coordinateX?.toFixed(6) }}</span>
          </div>
          <div class="project-summary-coordinate">
            <span class="project-summary-coordinate-label">Latitude (Y)</span>
            <span class="project-summary-coordinate-value">{{ project.coordinateY?.toFixed(6) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Project Sections -->
      <div v-if="sections.length > 0" class="project-summary-sections">
        <h3 class="project-summary-section-title">
          <FolderIcon class="project-summary-section-icon" />
          Project Sections
        </h3>
        <div class="project-summary-sections-grid">
          <div
            v-for="section in sections"
            :key="section.key"
            class="project-summary-section-card"
            @click="$emit('view-files')"
          >
            <FolderIcon class="project-summary-section-card-icon" />
            <div class="project-summary-section-card-content">
              <span class="project-summary-section-card-name">{{ section.name }}</span>
              <span class="project-summary-section-card-count">{{ section.fileCount }} files</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Participants Preview -->
      <div v-if="participants.length > 0" class="project-summary-participants">
        <div class="project-summary-participants-header">
          <h3 class="project-summary-section-title">
            <UsersIcon class="project-summary-section-icon" />
            Participants
          </h3>
          <button
            type="button"
            class="project-summary-view-all"
            @click="$emit('view-participants')"
          >
            View all
          </button>
        </div>
        <div class="project-summary-participants-list">
          <div
            v-for="participant in participantsPreview"
            :key="participant.userId"
            class="project-summary-participant"
          >
            <div class="project-summary-participant-avatar">
              {{ getInitials(participant.username) }}
            </div>
            <div class="project-summary-participant-info">
              <span class="project-summary-participant-name">{{ participant.username }}</span>
              <span class="project-summary-participant-role">{{ getRoleLabel(participant.role) }}</span>
            </div>
          </div>
          <div v-if="participants.length > 3" class="project-summary-participants-more">
            +{{ participants.length - 3 }} more
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProjectDetailsDto } from '@/application/dto';
import { ProjectStatus, ProjectType, UserRole } from '@/domain/enumerations';
import { formatDate, daysUntil } from '@/shared/utils';
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue';
import {
  User as UserIcon,
  Tag as TagIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Trash as TrashIcon,
  CheckSquare as CheckSquareIcon,
  MessageCircle as MessageCircleIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  MapPin as MapPinIcon,
  Folder as FolderIcon,
} from 'lucide-vue-next';

interface ProjectSummaryProps {
  projectDetails: ProjectDetailsDto;
  loading?: boolean;
}

interface ProjectSummaryEmits {
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'finalize'): void;
  (e: 'view-tasks'): void;
  (e: 'view-messages'): void;
  (e: 'view-files'): void;
  (e: 'view-participants'): void;
}

const props = withDefaults(defineProps<ProjectSummaryProps>(), {
  loading: false,
});

defineEmits<ProjectSummaryEmits>();

// Computed - shortcuts
const project = computed(() => props.projectDetails.project);
const taskStats = computed(() => props.projectDetails.taskStats);
const participants = computed(() => props.projectDetails.participants);
const sections = computed(() => props.projectDetails.sections);
const permissions = computed(() => props.projectDetails.currentUserPermissions);

// Computed - status
const isFinalized = computed(() => project.value.status === ProjectStatus.FINALIZED);
const canFinalize = computed(() => taskStats.value.pending === 0);

const daysUntilDelivery = computed(() => daysUntil(project.value.deliveryDate));
const isOverdue = computed(() => daysUntilDelivery.value < 0 && !isFinalized.value);

// Computed - formatting
const statusLabel = computed(() => {
  const labels: Record<ProjectStatus, string> = {
    [ProjectStatus.ACTIVE]: 'Active',
    [ProjectStatus.IN_PROGRESS]: 'In Progress',
    [ProjectStatus.PENDING_REVIEW]: 'Pending Review',
    [ProjectStatus.FINALIZED]: 'Finalized',
  };
  return labels[project.value.status];
});

const statusColor = computed(() => {
  if (isFinalized.value) return 'gray';
  if (isOverdue.value) return 'red';
  if (taskStats.value.pending > 0) return 'yellow';
  return 'green';
});

const typeLabel = computed(() => {
  const labels: Record<ProjectType, string> = {
    [ProjectType.RESIDENTIAL]: 'Residential',
    [ProjectType.COMMERCIAL]: 'Commercial',
    [ProjectType.INDUSTRIAL]: 'Industrial',
    [ProjectType.PUBLIC]: 'Public',
  };
  return labels[project.value.type];
});

const formattedContractDate = computed(() => formatDate(project.value.contractDate, 'dd MMMM yyyy'));
const formattedDeliveryDate = computed(() => formatDate(project.value.deliveryDate, 'dd MMMM yyyy'));
const formattedFinalizedDate = computed(() => 
  project.value.finalizedAt ? formatDate(project.value.finalizedAt, 'dd MMMM yyyy') : ''
);

const hasCoordinates = computed(() => 
  project.value.coordinateX !== null && project.value.coordinateY !== null
);

const participantsPreview = computed(() => participants.value.slice(0, 3));

// Helpers
function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMINISTRATOR]: 'Administrator',
    [UserRole.CLIENT]: 'Client',
    [UserRole.SPECIAL_USER]: 'Special User',
  };
  return labels[role] || role;
}
</script>

<style scoped>
.project-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.project-summary-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-12);
  color: var(--color-text-secondary);
}

/* Header */
.project-summary-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-4);
}

.project-summary-header-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.project-summary-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.project-summary-code {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-summary-status {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

.project-summary-status-green {
  color: var(--color-success-700);
  background-color: var(--color-success-100);
}

.project-summary-status-yellow {
  color: var(--color-warning-700);
  background-color: var(--color-warning-100);
}

.project-summary-status-red {
  color: var(--color-error-700);
  background-color: var(--color-error-100);
}

.project-summary-status-gray {
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
}

.project-summary-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.project-summary-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.project-summary-info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.project-summary-info-icon {
  width: 14px;
  height: 14px;
}

.project-summary-info-divider {
  color: var(--color-gray-300);
}

/* Actions */
.project-summary-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.project-summary-action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.project-summary-action-btn:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.project-summary-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.project-summary-action-btn svg {
  width: 16px;
  height: 16px;
}

.project-summary-action-btn-primary {
  color: white;
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.project-summary-action-btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.project-summary-action-btn-danger {
  color: var(--color-error-600);
  border-color: var(--color-error-300);
}

.project-summary-action-btn-danger:hover:not(:disabled) {
  color: var(--color-error-700);
  background-color: var(--color-error-50);
}

/* Stats Grid */
.project-summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

.project-summary-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  position: relative;
}

.project-summary-stat-clickable {
  cursor: pointer;
  transition: border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
}

.project-summary-stat-clickable:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
}

.project-summary-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.project-summary-stat-icon svg {
  width: 24px;
  height: 24px;
}

.project-summary-stat-icon-tasks {
  background-color: var(--color-primary-100);
  color: var(--color-primary-600);
}

.project-summary-stat-icon-messages {
  background-color: var(--color-info-100);
  color: var(--color-info-600);
}

.project-summary-stat-icon-info {
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
}

.project-summary-stat-icon-danger {
  background-color: var(--color-error-100);
  color: var(--color-error-600);
}

.project-summary-stat-icon-participants {
  background-color: var(--color-success-100);
  color: var(--color-success-600);
}

.project-summary-stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.project-summary-stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.project-summary-stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.project-summary-stat-badge {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.project-summary-stat-badge-warning {
  color: var(--color-warning-700);
  background-color: var(--color-warning-100);
}

.project-summary-stat-badge-primary {
  color: var(--color-primary-700);
  background-color: var(--color-primary-100);
}

.project-summary-stat-badge-danger {
  color: var(--color-error-700);
  background-color: var(--color-error-100);
}

/* Dates */
.project-summary-dates {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-6);
  padding: var(--spacing-4);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-lg);
}

.project-summary-date {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.project-summary-date-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-summary-date-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Section titles */
.project-summary-section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.project-summary-section-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
}

/* Coordinates */
.project-summary-coordinates {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.project-summary-coordinates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.project-summary-coordinate {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.project-summary-coordinate-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.project-summary-coordinate-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-mono);
  color: var(--color-text-primary);
}

/* Sections */
.project-summary-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.project-summary-sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-3);
}

.project-summary-section-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--duration-fast) ease;
}

.project-summary-section-card:hover {
  border-color: var(--color-primary-300);
}

.project-summary-section-card-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary-500);
}

.project-summary-section-card-content {
  display: flex;
  flex-direction: column;
}

.project-summary-section-card-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.project-summary-section-card-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Participants */
.project-summary-participants {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.project-summary-participants-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-summary-view-all {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.project-summary-view-all:hover {
  text-decoration: underline;
}

.project-summary-participants-list {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.project-summary-participant {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-full);
}

.project-summary-participant-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  color: white;
  background-color: var(--color-primary-500);
  border-radius: var(--radius-full);
}

.project-summary-participant-info {
  display: flex;
  flex-direction: column;
}

.project-summary-participant-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.project-summary-participant-role {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.project-summary-participants-more {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--spacing-2);
}

/* Responsive */
@media (max-width: 640px) {
  .project-summary-header {
    flex-direction: column;
  }
  
  .project-summary-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .project-summary-title {
    font-size: var(--font-size-xl);
  }
  
  .project-summary-stats {
    grid-template-columns: 1fr;
  }
  
  .project-summary-coordinates-grid {
    grid-template-columns: 1fr;
  }
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
- **Responsiveness:** Mobile-first design, responsive layouts
- **Performance:** Efficient re-renders, computed properties
- **Validation:** Form validation with clear error messages
- **Error Handling:** Display errors appropriately to users

## Component Design Principles:
- Single responsibility per component
- Composable and reusable
- Consistent with the design system (CSS variables)
- Clear loading and empty states
- Proper event emission for parent communication

## Naming Conventions:
- Component files: `Project{Name}.vue`
- CSS classes: BEM-like (`project-{component}-{element}-{modifier}`)
- Props interface: `Project{Name}Props`
- Emits interface: `Project{Name}Emits`

---

# DELIVERABLES

1. **Complete source code** for all 3 files:
   - `ProjectCard.vue`
   - `ProjectForm.vue`
   - `ProjectSummary.vue`

2. **For each component:**
   - Full `<script setup>` with TypeScript
   - Props interface with defaults
   - Emits interface
   - Scoped CSS styles using CSS variables
   - Responsive design
   - Accessibility attributes
   - JSDoc comments where appropriate

3. **Features per component:**
   - **ProjectCard:** Status indicator, type badge, counters, actions dropdown, overdue warning
   - **ProjectForm:** Create/edit modes, validation, date pickers, code generation, coordinate inputs
   - **ProjectSummary:** Header with actions, stats grid, dates, coordinates, sections, participants preview

4. **Edge cases to handle:**
   - Empty states
   - Loading states
   - Overdue projects
   - Finalized projects
   - Form validation errors
   - Missing optional data (coordinates, sections)
   - Permission-based action visibility

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```vue
<!-- src/presentation/components/project/ProjectCard.vue -->
[Complete code here]
```

```vue
<!-- src/presentation/components/project/ProjectForm.vue -->
[Complete code here]
```

```vue
<!-- src/presentation/components/project/ProjectSummary.vue -->
[Complete code here]
```

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
