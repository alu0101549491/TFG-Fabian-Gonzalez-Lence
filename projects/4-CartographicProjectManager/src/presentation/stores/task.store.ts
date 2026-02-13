/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/stores/task.store.ts
 * @desc Pinia store for task state management within project context
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://pinia.vuejs.org}
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {
  TaskDto,
  TaskFilterDto,
  TaskListResponseDto,
  CreateTaskDto,
  UpdateTaskDto,
  ChangeTaskStatusDto,
  ConfirmTaskDto,
  TaskHistoryEntryDto,
} from '../../application/dto';
import {TaskStatus} from '../../domain/enumerations/task-status';
import {TaskPriority} from '../../domain/enumerations/task-priority';
import {useAuthStore} from './auth.store';
import {useProjectStore} from './project.store';

/**
 * Task store using Composition API.
 * Manages tasks within project context with status transitions and confirmations.
 */
export const useTaskStore = defineStore('task', () => {
  const authStore = useAuthStore();
  const projectStore = useProjectStore();
  
  // State
  const tasksByProject = ref<Map<string, TaskDto[]>>(new Map());
  const currentTask = ref<TaskDto | null>(null);
  const taskHistory = ref<TaskHistoryEntryDto[]>([]);
  const filters = ref<TaskFilterDto>({});
  const statusFilter = ref<TaskStatus | null>(null);
  const priorityFilter = ref<TaskPriority | null>(null);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const isLoading = ref(false);
  const isLoadingHistory = ref(false);
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

  const filteredTasks = computed(() => {
    let filtered = currentProjectTasks.value;

    if (statusFilter.value) {
      filtered = filtered.filter(t => t.status === statusFilter.value);
    }

    if (priorityFilter.value) {
      filtered = filtered.filter(t => t.priority === priorityFilter.value);
    }

    return filtered;
  });

  const taskCount = computed(() => currentProjectTasks.value.length);
  
  const pendingTasks = computed(() =>
    currentProjectTasks.value.filter(
      t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS
    )
  );

  const completedTasks = computed(() =>
    currentProjectTasks.value.filter(
      t => t.status === TaskStatus.DONE || t.status === TaskStatus.COMPLETED
    )
  );

  const highPriorityTasks = computed(() =>
    currentProjectTasks.value.filter(
      t => t.priority === TaskPriority.HIGH || t.priority === TaskPriority.URGENT
    )
  );

  const pendingTasksCount = computed(() => pendingTasks.value.length);

  const overdueTasks = computed(() =>
    currentProjectTasks.value.filter(t => t.isOverdue)
  );

  const overdueTasksCount = computed(() => overdueTasks.value.length);

  const hasCurrentTask = computed(() => !!currentTask.value);
  
  const canConfirmCurrentTask = computed(() => currentTask.value?.canConfirm ?? false);
  
  const currentTaskAllowedTransitions = computed(() => 
    currentTask.value?.allowedStatusTransitions ?? []
  );

  // Actions

  /**
   * Fetches all tasks for a specific project
   *
   * @param projectId - The project's unique ID
   * @param newFilters - Optional filters to apply
   *
   * @example
   * ```typescript
   * await taskStore.fetchTasksByProject('project1', {
   *   status: TaskStatus.PENDING
   * });
   * ```
   */
  async function fetchTasksByProject(
    projectId: string,
    newFilters?: TaskFilterDto
  ): Promise<void> {
    if (!authStore.userId) return;

    isLoading.value = true;
    error.value = null;

    try {
      if (newFilters) {
        filters.value = {...filters.value, ...newFilters};
      }

      // TODO: Replace with actual service call
      // const response = await taskService.getTasksByProject(
      //   projectId,
      //   authStore.userId,
      //   filters.value
      // );
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock data
      const mockTasks: TaskDto[] = [
        {
          id: '1',
          projectId,
          description: 'Complete topographic survey',
          assigneeId: 'admin1',
          assigneeName: 'Administrator',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          dueDate: new Date('2025-03-15'),
          isOverdue: false,
          canModify: true,
          canConfirm: false,
          allowedStatusTransitions: [TaskStatus.COMPLETED],
        },
        {
          id: '2',
          projectId,
          description: 'Review boundary analysis',
          assigneeId: 'client1',
          assigneeName: 'Client One',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          dueDate: new Date('2025-03-20'),
          isOverdue: false,
          canModify: true,
          canConfirm: false,
          allowedStatusTransitions: [TaskStatus.IN_PROGRESS],
        },
      ];

      tasksByProject.value.set(projectId, mockTasks);
      pagination.value = {
        total: mockTasks.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tasks';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches a single task by ID
   */
  async function fetchTaskById(taskId: string): Promise<void> {
    if (!authStore.userId) return;

    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Call service
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Find task in store
      for (const tasks of tasksByProject.value.values()) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          currentTask.value = task;
          return;
        }
      }
      
      throw new Error('Task not found');
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch task';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches task history entries
   */
  async function fetchTaskHistory(taskId: string): Promise<void> {
    if (!authStore.userId) return;

    isLoadingHistory.value = true;

    try {
      // TODO: Call service
      await new Promise(resolve => setTimeout(resolve, 200));
      
      taskHistory.value = [];
    } catch (err: any) {
      console.error('Failed to fetch task history:', err);
    } finally {
      isLoadingHistory.value = false;
    }
  }

  /**
   * Creates a new task
   */
  async function createTask(data: CreateTaskDto): Promise<TaskDto | null> {
    if (!authStore.userId) return null;

    isSaving.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual service call
      // const task = await taskService.createTask(data, authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newTask: TaskDto = {
        id: `task_${Date.now()}`,
        projectId: data.projectId,
        description: data.description,
        assigneeId: data.assigneeId,
        assigneeName: 'Assignee Name',
        status: TaskStatus.PENDING,
        priority: data.priority,
        dueDate: data.dueDate,
        isOverdue: false,
        canModify: true,
        canConfirm: false,
        allowedStatusTransitions: [TaskStatus.IN_PROGRESS],
      };

      const tasks = tasksByProject.value.get(data.projectId) ?? [];
      tasksByProject.value.set(data.projectId, [...tasks, newTask]);
      pagination.value.total++;

      return newTask;
    } catch (err: any) {
      error.value = err.message || 'Failed to create task';
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Updates an existing task
   */
  async function updateTask(data: UpdateTaskDto): Promise<TaskDto | null> {
    if (!authStore.userId) return null;

    isSaving.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual service call
      // const task = await taskService.updateTask(data, authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Find and update task
      for (const [projectId, tasks] of tasksByProject.value.entries()) {
        const index = tasks.findIndex(t => t.id === data.taskId);
        if (index !== -1) {
          const updatedTask = {...tasks[index], ...data as any};
          tasks[index] = updatedTask;
          tasksByProject.value.set(projectId, [...tasks]);
          
          if (currentTask.value?.id === data.taskId) {
            currentTask.value = updatedTask;
          }
          
          return updatedTask;
        }
      }
      
      throw new Error('Task not found');
    } catch (err: any) {
      error.value = err.message || 'Failed to update task';
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Deletes a task
   */
  async function deleteTask(taskId: string): Promise<boolean> {
    if (!authStore.userId) return false;

    isSaving.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual service call
      // await taskService.deleteTask(taskId, authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Find and remove task
      for (const [projectId, tasks] of tasksByProject.value.entries()) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          tasks.splice(index, 1);
          tasksByProject.value.set(projectId, [...tasks]);
          pagination.value.total--;
          
          if (currentTask.value?.id === taskId) {
            currentTask.value = null;
          }
          
          return true;
        }
      }
      
      return false;
    } catch (err: any) {
      error.value = err.message || 'Failed to delete task';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Changes task status with optional comment
   */
  async function changeTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    comment?: string
  ): Promise<boolean> {
    if (!authStore.userId) return false;

    isSaving.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual service call
      // const task = await taskService.changeTaskStatus(
      //   { taskId, newStatus, comment },
      //   authStore.userId
      // );
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Update task status
      for (const [projectId, tasks] of tasksByProject.value.entries()) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          tasks[index].status = newStatus;
          tasksByProject.value.set(projectId, [...tasks]);
          
          if (currentTask.value?.id === taskId) {
            currentTask.value.status = newStatus;
          }
          
          return true;
        }
      }
      
      return false;
    } catch (err: any) {
      error.value = err.message || 'Failed to change task status';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Confirms or rejects a completed task
   */
  async function confirmTask(
    taskId: string,
    confirmed: boolean,
    feedback?: string
  ): Promise<boolean> {
    if (!authStore.userId) return false;

    isSaving.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual service call
      // const task = await taskService.confirmTask(
      //   { taskId, confirmed, feedback },
      //   authStore.userId
      // );
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Update task
      for (const [projectId, tasks] of tasksByProject.value.entries()) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          if (confirmed) {
            tasks[index].status = TaskStatus.COMPLETED;
          } else {
            tasks[index].status = TaskStatus.IN_PROGRESS;
          }
          tasksByProject.value.set(projectId, [...tasks]);
          
          if (currentTask.value?.id === taskId) {
            currentTask.value = tasks[index];
          }
          
          return true;
        }
      }
      
      return false;
    } catch (err: any) {
      error.value = err.message || 'Failed to confirm task';
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Sets status filter
   */
  function setStatusFilter(status: TaskStatus | null): void {
    statusFilter.value = status;
  }

  /**
   * Sets priority filter
   */
  function setPriorityFilter(priority: TaskPriority | null): void {
    priorityFilter.value = priority;
  }

  /**
   * Sets custom filters
   */
  function setFilters(newFilters: Partial<TaskFilterDto>): void {
    filters.value = {...filters.value, ...newFilters};
  }

  /**
   * Resets all filters
   */
  function resetFilters(): void {
    statusFilter.value = null;
    priorityFilter.value = null;
    filters.value = {};
  }

  /**
   * Sets current task
   */
  function setCurrentTask(task: TaskDto | null): void {
    currentTask.value = task;
  }

  /**
   * Handles real-time task created event
   */
  function handleTaskCreated(payload: any): void {
    const tasks = tasksByProject.value.get(payload.projectId) ?? [];
    tasksByProject.value.set(payload.projectId, [...tasks, payload as TaskDto]);
    pagination.value.total++;
  }

  /**
   * Handles real-time task updated event
   */
  function handleTaskUpdated(payload: any): void {
    const tasks = tasksByProject.value.get(payload.projectId) ?? [];
    const index = tasks.findIndex(t => t.id === payload.id);
    
    if (index !== -1) {
      tasks[index] = {...tasks[index], ...payload};
      tasksByProject.value.set(payload.projectId, [...tasks]);
      
      if (currentTask.value?.id === payload.id) {
        currentTask.value = {...currentTask.value, ...payload};
      }
    }
  }

  /**
   * Handles real-time task deleted event
   */
  function handleTaskDeleted(payload: {taskId: string; projectId: string}): void {
    const tasks = tasksByProject.value.get(payload.projectId) ?? [];
    const filtered = tasks.filter(t => t.id !== payload.taskId);
    tasksByProject.value.set(payload.projectId, filtered);
    pagination.value.total--;
    
    if (currentTask.value?.id === payload.taskId) {
      currentTask.value = null;
    }
  }

  /**
   * Handles real-time task status changed event
   */
  function handleTaskStatusChanged(payload: any): void {
    const tasks = tasksByProject.value.get(payload.projectId) ?? [];
    const index = tasks.findIndex(t => t.id === payload.taskId);
    
    if (index !== -1) {
      tasks[index].status = payload.newStatus;
      tasksByProject.value.set(payload.projectId, [...tasks]);
      
      if (currentTask.value?.id === payload.taskId) {
        currentTask.value.status = payload.newStatus;
      }
    }
  }

  /**
   * Clears all tasks for a project
   */
  function clearTasksForProject(projectId: string): void {
    tasksByProject.value.delete(projectId);
  }

  /**
   * Clears all tasks
   */
  function clearTasks(): void {
    tasksByProject.value.clear();
    currentTask.value = null;
    taskHistory.value = [];
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    // State
    tasksByProject,
    currentTask,
    taskHistory,
    filters,
    statusFilter,
    priorityFilter,
    pagination,
    isLoading,
    isLoadingHistory,
    isSaving,
    error,
    
    // Getters
    getTasksForProject,
    currentProjectTasks,
    filteredTasks,
    taskCount,
    pendingTasks,
    completedTasks,
    highPriorityTasks,
    pendingTasksCount,
    overdueTasks,
    overdueTasksCount,
    hasCurrentTask,
    canConfirmCurrentTask,
    currentTaskAllowedTransitions,
    
    // Actions
    fetchTasksByProject,
    fetchTaskById,
    fetchTaskHistory,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    confirmTask,
    setStatusFilter,
    setPriorityFilter,
    setFilters,
    resetFilters,
    setCurrentTask,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    handleTaskStatusChanged,
    clearTasksForProject,
    clearTasks,
    clearError,
  };
});
