<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/task/TaskCard.vue
  @desc Card component displaying task summary with status, priority, and quick actions
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

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
      },
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
      :style="{backgroundColor: priorityColor}"
      :aria-label="`Priority: ${priorityLabel}`"
    />

    <div class="task-card-content">
      <!-- Header: Status + Actions -->
      <div class="task-card-header">
        <span
          :class="['task-card-status']"
          :style="{backgroundColor: statusBackgroundColor, color: statusColor}"
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
            ⋮
          </button>

          <Transition name="dropdown">
            <div v-if="actionsMenuOpen" ref="actionsMenuRef" class="task-card-actions-menu">
              <button v-if="canEdit" type="button" class="task-card-actions-item" @click="handleEdit">
                <span>✏️</span>
                <span>Edit</span>
              </button>
              <button
                v-if="canDelete"
                type="button"
                class="task-card-actions-item task-card-actions-item-danger"
                @click="handleDelete"
              >
                <span>🗑️</span>
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
          <span class="task-card-meta-icon">👤</span>
          <span>{{ task.assigneeName }}</span>
        </div>

        <div
          :class="['task-card-due-date', {'task-card-due-date-overdue': task.isOverdue && !isCompleted}]"
        >
          <span class="task-card-meta-icon">📅</span>
          <span>{{ formattedDueDate }}</span>
        </div>

        <div v-if="filesCount > 0" class="task-card-files">
          <span class="task-card-meta-icon">📎</span>
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
          :style="{'--status-color': getStatusColor(status)}"
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
import {ref, computed, onMounted, onUnmounted} from 'vue';
import type {TaskDto, TaskSummaryDto} from '@/application/dto';
import {TaskStatus, TaskPriority} from '@/domain/enumerations';
import {formatDate, truncate} from '@/shared/utils';
import {TASK_PRIORITY_COLORS, TASK_STATUS_COLORS, TASK} from '@/shared/constants';
import {useAuth} from '@/presentation/composables';

/**
 * TaskCard component props
 */
export interface TaskCardProps {
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

/**
 * TaskCard component emits
 */
export interface TaskCardEmits {
  (e: 'click', task: TaskDto | TaskSummaryDto): void;
  (e: 'status-change', taskId: string, newStatus: TaskStatus): void;
  (e: 'edit', task: TaskDto | TaskSummaryDto): void;
  (e: 'delete', task: TaskDto | TaskSummaryDto): void;
}

const props = withDefaults(defineProps<TaskCardProps>(), {
  compact: false,
  showStatusActions: false,
  selected: false,
  draggable: false,
});

const emit = defineEmits<TaskCardEmits>();
const {isAdmin} = useAuth();

// Actions menu
const actionsButtonRef = ref<HTMLElement | null>(null);
const actionsMenuRef = ref<HTMLElement | null>(null);
const actionsMenuOpen = ref(false);

/**
 * Close menu on click outside
 */
function handleClickOutside(event: MouseEvent): void {
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
  return 0;
});

const validTransitions = computed(() => {
  if (isFullTask.value) {
    return (props.task as TaskDto).allowedStatusTransitions || [];
  }
  const transitions = TASK.STATUS_TRANSITIONS[props.task.status] || [];
  return transitions as unknown as TaskStatus[];
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

/**
 * Get status color
 */
function getStatusColor(status: TaskStatus): string {
  return TASK_STATUS_COLORS[status];
}

/**
 * Get status label
 */
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

/**
 * Handle card click
 */
function handleClick(): void {
  emit('click', props.task);
}

/**
 * Toggle actions menu
 */
function toggleActionsMenu(): void {
  actionsMenuOpen.value = !actionsMenuOpen.value;
}

/**
 * Handle edit action
 */
function handleEdit(): void {
  actionsMenuOpen.value = false;
  emit('edit', props.task);
}

/**
 * Handle delete action
 */
function handleDelete(): void {
  actionsMenuOpen.value = false;
  emit('delete', props.task);
}

/**
 * Handle status change
 */
function handleStatusChange(newStatus: TaskStatus): void {
  emit('status-change', props.task.id, newStatus);
}

/**
 * Handle drag start
 */
function handleDragStart(event: DragEvent): void {
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
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
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
  font-size: 12px;
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
  font-size: 16px;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.task-card-actions-trigger:hover {
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
}

.task-card-actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
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
  transition: background-color var(--transition-fast);
}

.task-card-actions-item:hover {
  background-color: var(--color-gray-100);
}

.task-card-actions-item span:first-child {
  font-size: 14px;
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
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
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
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
