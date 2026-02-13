/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/composables/use-tasks.ts
 * @desc Composable for task management with status transitions and filtering
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://vuejs.org/guide/reusability/composables.html}
 */

import {computed, ref, type ComputedRef, type Ref} from 'vue';
import {useTaskStore, useProjectStore} from '../stores';
import type {
  TaskDto,
  TaskFilterDto,
  CreateTaskDto,
  UpdateTaskDto,
  TaskHistoryEntryDto,
} from '../../application/dto';
import {TaskStatus} from '../../domain/enumerations/task-status';
import {TaskPriority} from '../../domain/enumerations/task-priority';
import {TASK} from '../../shared/constants';
import {
  getTaskPriorityColor as getPriorityColor,
  getTaskStatusColor as getStatusColorUtil,
} from '../../shared/utils';

/**
 * Task sorting options
 */
export type TaskSortOption = 'dueDate' | 'priority' | 'status' | 'createdAt';

/**
 * Result of task creation
 */
export interface CreateTaskResult {
  /** Whether operation was successful */
  success: boolean;
  /** Created task if successful */
  task?: TaskDto;
  /** Error message if failed */
  error?: string;
}

/**
 * Result of task update
 */
export interface UpdateTaskResult {
  /** Whether operation was successful */
  success: boolean;
  /** Updated task if successful */
  task?: TaskDto;
  /** Error message if failed */
  error?: string;
}

/**
 * Return interface for useTasks composable
 */
export interface UseTasksReturn {
  // Tasks
  tasks: ComputedRef<TaskDto[]>;
  currentTask: ComputedRef<TaskDto | null>;
  hasCurrentTask: ComputedRef<boolean>;

  // Filtered/Sorted Tasks
  filteredTasks: ComputedRef<TaskDto[]>;
  tasksByStatus: ComputedRef<Map<TaskStatus, TaskDto[]>>;
  tasksByPriority: ComputedRef<Map<TaskPriority, TaskDto[]>>;
  overdueTasks: ComputedRef<TaskDto[]>;

  // Task Stats
  totalTasks: ComputedRef<number>;
  pendingCount: ComputedRef<number>;
  completedCount: ComputedRef<number>;
  overdueCount: ComputedRef<number>;

  // Filters
  filters: Ref<TaskFilterDto>;
  sortBy: Ref<TaskSortOption>;
  sortOrder: Ref<'asc' | 'desc'>;

  // Status
  isLoading: ComputedRef<boolean>;
  isSaving: ComputedRef<boolean>;
  error: ComputedRef<string | null>;

  // Task History
  taskHistory: ComputedRef<TaskHistoryEntryDto[]>;
  isLoadingHistory: ComputedRef<boolean>;

  // Fetch Actions
  fetchTasks: (projectId: string, filters?: TaskFilterDto) => Promise<void>;
  refreshTasks: () => Promise<void>;
  fetchTaskHistory: (taskId: string) => Promise<void>;

  // CRUD Actions
  createTask: (data: CreateTaskDto) => Promise<CreateTaskResult>;
  updateTask: (data: UpdateTaskDto) => Promise<UpdateTaskResult>;
  deleteTask: (taskId: string) => Promise<boolean>;

  // Status Actions
  changeStatus: (taskId: string, newStatus: TaskStatus, comment?: string) => Promise<boolean>;
  confirmTask: (taskId: string, confirmed: boolean, feedback?: string) => Promise<boolean>;
  getValidTransitions: (task: TaskDto) => TaskStatus[];
  canTransitionTo: (task: TaskDto, status: TaskStatus) => boolean;

  // Filter/Sort Actions
  setFilters: (filters: Partial<TaskFilterDto>) => void;
  resetFilters: () => void;
  setSorting: (sortBy: TaskSortOption, order?: 'asc' | 'desc') => void;

  // Current Task Actions
  selectTask: (task: TaskDto | null) => void;

  // Utilities
  getTaskById: (taskId: string) => TaskDto | undefined;
  getTaskPriorityColor: (priority: TaskPriority) => string;
  getTaskStatusColor: (status: TaskStatus) => string;
  clearError: () => void;
}

/**
 * Composable for task management
 *
 * Provides reactive task data, CRUD operations, status transitions,
 * filtering, sorting, and task utilities.
 *
 * @returns Task state and methods
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTasks } from '@/presentation/composables';
 *
 * const {
 *   tasks,
 *   filteredTasks,
 *   changeStatus,
 *   setFilters
 * } = useTasks();
 * </script>
 * ```
 */
export function useTasks(): UseTasksReturn {
  const store = useTaskStore();
  const projectStore = useProjectStore();

  // Local state
  const filters = ref<TaskFilterDto>({});
  const sortBy = ref<TaskSortOption>('dueDate');
  const sortOrder = ref<'asc' | 'desc'>('asc');

  // Computed from store
  const tasks = computed(() => store.currentProjectTasks);
  const currentTask = computed(() => store.currentTask);
  const hasCurrentTask = computed(() => store.hasCurrentTask);
  const taskHistory = computed(() => store.taskHistory);

  const isLoading = computed(() => store.isLoading);
  const isSaving = computed(() => store.isSaving);
  const isLoadingHistory = computed(() => store.isLoadingHistory);
  const error = computed(() => store.error);

  /**
   * Gets priority weight for sorting (lower = higher priority)
   */
  function getPriorityWeight(priority: TaskPriority): number {
    const weights: Record<TaskPriority, number> = {
      [TaskPriority.URGENT]: 1,
      [TaskPriority.HIGH]: 2,
      [TaskPriority.MEDIUM]: 3,
      [TaskPriority.LOW]: 4,
    };
    return weights[priority] ?? 5;
  }

  /**
   * Gets status weight for sorting
   */
  function getStatusWeight(status: TaskStatus): number {
    const weights: Record<TaskStatus, number> = {
      [TaskStatus.PENDING]: 1,
      [TaskStatus.IN_PROGRESS]: 2,
      [TaskStatus.PARTIAL]: 3,
      [TaskStatus.PERFORMED]: 4,
      [TaskStatus.COMPLETED]: 5,
    };
    return weights[status] ?? 6;
  }

  // Filtered and sorted tasks
  const filteredTasks = computed(() => {
    let result = [...tasks.value];

    // Apply filters
    if (filters.value.status) {
      result = result.filter((t) => t.status === filters.value.status);
    }
    if (filters.value.priority) {
      result = result.filter((t) => t.priority === filters.value.priority);
    }
    if (filters.value.assigneeId) {
      result = result.filter((t) => t.assigneeId === filters.value.assigneeId);
    }
    if (filters.value.isOverdue) {
      result = result.filter((t) => t.isOverdue);
    }
    if (filters.value.searchTerm) {
      const term = filters.value.searchTerm.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(term));
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy.value) {
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
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder.value === 'asc' ? comparison : -comparison;
    });

    return result;
  });

  // Grouped tasks
  const tasksByStatus = computed(() => {
    const grouped = new Map<TaskStatus, TaskDto[]>();

    Object.values(TaskStatus).forEach((status) => {
      grouped.set(
        status,
        tasks.value.filter((t) => t.status === status)
      );
    });

    return grouped;
  });

  const tasksByPriority = computed(() => {
    const grouped = new Map<TaskPriority, TaskDto[]>();

    Object.values(TaskPriority).forEach((priority) => {
      grouped.set(
        priority,
        tasks.value.filter((t) => t.priority === priority)
      );
    });

    return grouped;
  });

  const overdueTasks = computed(() => tasks.value.filter((t) => t.isOverdue));

  // Stats
  const totalTasks = computed(() => tasks.value.length);
  const pendingCount = computed(() => tasks.value.filter((t) => t.status !== TaskStatus.COMPLETED).length);
  const completedCount = computed(() => tasks.value.filter((t) => t.status === TaskStatus.COMPLETED).length);
  const overdueCount = computed(() => overdueTasks.value.length);

  /**
   * Fetches tasks for a project
   */
  async function fetchTasks(projectId: string, newFilters?: TaskFilterDto): Promise<void> {
    if (newFilters) {
      filters.value = {...filters.value, ...newFilters};
    }
    await store.fetchTasksByProject(projectId, filters.value);
  }

  /**
   * Refreshes tasks for current project
   */
  async function refreshTasks(): Promise<void> {
    const projectId = projectStore.currentProjectId;
    if (projectId) {
      await fetchTasks(projectId);
    }
  }

  /**
   * Fetches task history
   */
  async function fetchTaskHistory(taskId: string): Promise<void> {
    await store.fetchTaskHistory(taskId);
  }

  /**
   * Creates a new task
   */
  async function createTask(data: CreateTaskDto): Promise<CreateTaskResult> {
    const task = await store.createTask(data);

    if (task) {
      return {success: true, task};
    }

    return {success: false, error: store.error ?? 'Failed to create task'};
  }

  /**
   * Updates an existing task
   */
  async function updateTask(data: UpdateTaskDto): Promise<UpdateTaskResult> {
    const task = await store.updateTask(data);

    if (task) {
      return {success: true, task};
    }

    return {success: false, error: store.error ?? 'Failed to update task'};
  }

  /**
   * Deletes a task
   */
  async function deleteTask(taskId: string): Promise<boolean> {
    return store.deleteTask(taskId);
  }

  /**
   * Changes task status
   */
  async function changeStatus(
    taskId: string,
    newStatus: TaskStatus,
    comment?: string
  ): Promise<boolean> {
    return store.changeTaskStatus(taskId, newStatus, comment);
  }

  /**
   * Confirms a task (client confirmation)
   */
  async function confirmTask(
    taskId: string,
    confirmed: boolean,
    feedback?: string
  ): Promise<boolean> {
    return store.confirmTask(taskId, confirmed, feedback);
  }

  /**
   * Gets valid status transitions for a task
   */
  function getValidTransitions(task: TaskDto): TaskStatus[] {
    return TASK.STATUS_TRANSITIONS[task.status] ?? [];
  }

  /**
   * Checks if task can transition to a status
   */
  function canTransitionTo(task: TaskDto, status: TaskStatus): boolean {
    const validTransitions = getValidTransitions(task);
    return validTransitions.includes(status);
  }

  /**
   * Updates filter criteria
   */
  function setFilters(newFilters: Partial<TaskFilterDto>): void {
    filters.value = {...filters.value, ...newFilters};
  }

  /**
   * Clears all filters
   */
  function resetFilters(): void {
    filters.value = {};
  }

  /**
   * Sets sorting criteria
   */
  function setSorting(newSortBy: TaskSortOption, order?: 'asc' | 'desc'): void {
    sortBy.value = newSortBy;
    if (order) {
      sortOrder.value = order;
    }
  }

  /**
   * Selects a task as current
   */
  function selectTask(task: TaskDto | null): void {
    store.setCurrentTask(task);
  }

  /**
   * Finds a task by ID
   */
  function getTaskById(taskId: string): TaskDto | undefined {
    return tasks.value.find((t) => t.id === taskId);
  }

  /**
   * Gets priority color
   */
  function getTaskPriorityColor(priority: TaskPriority): string {
    return getPriorityColor(priority);
  }

  /**
   * Gets status color
   */
  function getTaskStatusColor(status: TaskStatus): string {
    return getStatusColorUtil(status);
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    store.clearError();
  }

  return {
    // Tasks
    tasks,
    currentTask,
    hasCurrentTask,

    // Filtered/Sorted Tasks
    filteredTasks,
    tasksByStatus,
    tasksByPriority,
    overdueTasks,

    // Stats
    totalTasks,
    pendingCount,
    completedCount,
    overdueCount,

    // Filters
    filters,
    sortBy,
    sortOrder,

    // Status
    isLoading,
    isSaving,
    error,

    // History
    taskHistory,
    isLoadingHistory,

    // Actions
    fetchTasks,
    refreshTasks,
    fetchTaskHistory,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
    confirmTask,
    getValidTransitions,
    canTransitionTo,
    setFilters,
    resetFilters,
    setSorting,
    selectTask,

    // Utilities
    getTaskById,
    getTaskPriorityColor,
    getTaskStatusColor,
    clearError,
  };
}
