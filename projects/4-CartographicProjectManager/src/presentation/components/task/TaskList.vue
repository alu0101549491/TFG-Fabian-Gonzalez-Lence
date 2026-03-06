<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/task/TaskList.vue
  @desc List component displaying tasks with filtering and sorting capabilities
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div class="task-list">
    <!-- Header with filters and actions -->
    <div v-if="showFilters || showCreateButton" class="task-list-header">
      <!-- Filters -->
      <div v-if="showFilters" class="task-list-filters">
        <!-- Status filter -->
        <select v-model="filters.status" class="task-list-filter-select" @change="emitFilterChange">
          <option value="">All Statuses</option>
          <option v-for="status in statusOptions" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>

        <!-- Priority filter -->
        <select v-model="filters.priority" class="task-list-filter-select" @change="emitFilterChange">
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
        <select v-model="sortValue" class="task-list-filter-select" @change="handleSortChange">
          <option value="dueDate-asc">Due Date (Earliest)</option>
          <option value="dueDate-desc">Due Date (Latest)</option>
          <option value="priority-asc">Priority (Low → High)</option>
          <option value="priority-desc">Priority (High → Low)</option>
          <option value="status-asc">Status (Pending → Completed)</option>
          <option value="createdAt-desc">Newest First</option>
        </select>

        <!-- Clear filters -->
        <button v-if="hasActiveFilters" type="button" class="task-list-clear-filters" @click="clearFilters">
          <span>✕</span>
          <span>Clear</span>
        </button>
      </div>

      <!-- Create button -->
      <button v-if="showCreateButton" type="button" class="task-list-create-btn" @click="$emit('create')">
        <span>+</span>
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
      <span class="task-list-empty-icon">☑</span>
      <h3 class="task-list-empty-title">
        {{ hasActiveFilters ? 'No tasks match your filters' : emptyMessage }}
      </h3>
      <p v-if="hasActiveFilters" class="task-list-empty-description">Try adjusting your filters or clearing them.</p>
      <button v-if="hasActiveFilters" type="button" class="task-list-empty-action" @click="clearFilters">
        Clear Filters
      </button>
    </div>

    <!-- Grouped view (by status) -->
    <div v-else-if="viewMode === 'grouped'" class="task-list-grouped">
      <div v-for="group in taskGroups" :key="group.status" class="task-list-group">
        <div class="task-list-group-header">
          <span class="task-list-group-status" :style="{backgroundColor: `${group.color}20`, color: group.color}">
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
        <div v-else class="task-list-group-empty">No {{ group.label.toLowerCase() }} tasks</div>
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
import {ref, computed} from 'vue';
import type {TaskDto, TaskSummaryDto} from '@/application/dto';
import {TaskStatus, TaskPriority} from '@/domain/enumerations';
import {TASK_STATUS_COLORS} from '@/shared/constants';
import TaskCard from './TaskCard.vue';

/**
 * Task filters interface
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * TaskList component props
 */
export interface TaskListProps {
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
  assignees?: Array<{id: string; name: string}>;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * TaskList component emits
 */
export interface TaskListEmits {
  (e: 'task-click', task: TaskDto | TaskSummaryDto): void;
  (e: 'task-edit', task: TaskDto | TaskSummaryDto): void;
  (e: 'task-delete', task: TaskDto | TaskSummaryDto): void;
  (e: 'task-status-change', taskId: string, newStatus: TaskStatus): void;
  (e: 'create'): void;
  (e: 'filter-change', filters: TaskFilters): void;
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

type TaskFilterState = {
  status: TaskStatus | '';
  priority: TaskPriority | '';
  assigneeId: string;
  sortBy: NonNullable<TaskFilters['sortBy']>;
  sortOrder: NonNullable<TaskFilters['sortOrder']>;
};

// Filter state
const filters = ref<TaskFilterState>({
  status: '',
  priority: '',
  assigneeId: '',
  sortBy: 'dueDate',
  sortOrder: 'asc',
});

const sortValue = computed({
  get: () => `${filters.value.sortBy}-${filters.value.sortOrder}`,
  set: (val: string) => {
    const [sortByRaw, sortOrderRaw] = val.split('-') as [string, string];

    const allowedSortBy: TaskFilterState['sortBy'][] = ['dueDate', 'priority', 'status', 'createdAt'];
    const nextSortBy = allowedSortBy.includes(sortByRaw as TaskFilterState['sortBy'])
      ? (sortByRaw as TaskFilterState['sortBy'])
      : 'dueDate';

    const nextSortOrder: TaskFilterState['sortOrder'] = sortOrderRaw === 'desc' ? 'desc' : 'asc';

    filters.value.sortBy = nextSortBy;
    filters.value.sortOrder = nextSortOrder;
  },
});

// Options
const statusOptions = computed(() => [
  {value: TaskStatus.PENDING, label: 'Pending'},
  {value: TaskStatus.IN_PROGRESS, label: 'In Progress'},
  {value: TaskStatus.PARTIAL, label: 'Partial'},
  {value: TaskStatus.PERFORMED, label: 'Performed'},
  {value: TaskStatus.COMPLETED, label: 'Completed'},
]);

const priorityOptions = computed(() => [
  {value: TaskPriority.URGENT, label: 'Urgent'},
  {value: TaskPriority.HIGH, label: 'High'},
  {value: TaskPriority.MEDIUM, label: 'Medium'},
  {value: TaskPriority.LOW, label: 'Low'},
]);

// Filtered and sorted tasks
const filteredTasks = computed(() => {
  let result = [...props.tasks];

  // Apply filters
  if (filters.value.status !== '') {
    result = result.filter((t) => t.status === filters.value.status);
  }
  if (filters.value.priority !== '') {
    result = result.filter((t) => t.priority === filters.value.priority);
  }
  if (filters.value.assigneeId) {
    result = result.filter((t) => {
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

  return statuses.map((status) => ({
    status,
    label: getStatusLabel(status),
    color: TASK_STATUS_COLORS[status],
    tasks: filteredTasks.value.filter((t) => t.status === status),
  }));
});

const hasActiveFilters = computed(() => !!(filters.value.status || filters.value.priority || filters.value.assigneeId));

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
 * Get priority weight for sorting
 */
function getPriorityWeight(priority: TaskPriority): number {
  const weights: Record<TaskPriority, number> = {
    [TaskPriority.URGENT]: 1,
    [TaskPriority.HIGH]: 2,
    [TaskPriority.MEDIUM]: 3,
    [TaskPriority.LOW]: 4,
  };
  return weights[priority];
}

/**
 * Get status weight for sorting
 */
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

/**
 * Emit filter change
 */
function emitFilterChange(): void {
  emit('filter-change', {
    status: filters.value.status === '' ? undefined : filters.value.status,
    priority: filters.value.priority === '' ? undefined : filters.value.priority,
    assigneeId: filters.value.assigneeId || undefined,
    sortBy: filters.value.sortBy,
    sortOrder: filters.value.sortOrder,
  });
}

/**
 * Handle sort change
 */
function handleSortChange(): void {
  emitFilterChange();
}

/**
 * Clear filters
 */
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
  padding: 0 32px 0 var(--spacing-3);
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
  transition: color var(--transition-fast);
}

.task-list-clear-filters:hover {
  color: var(--color-text-primary);
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
  transition: background-color var(--transition-fast);
}

.task-list-create-btn:hover {
  background-color: var(--color-primary-700);
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

.skeleton-line-short {
  width: 80px;
}
.skeleton-line-medium {
  width: 60%;
}
.skeleton-line-long {
  width: 90%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
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
  font-size: 48px;
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
