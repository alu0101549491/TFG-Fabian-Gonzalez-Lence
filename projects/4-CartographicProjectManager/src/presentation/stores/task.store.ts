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
  TaskFilterDto,
  CreateTaskDto,
  UpdateTaskDto,
  TaskHistoryEntryDto,
} from '../../application/dto';
import type {TaskViewModel} from '../view-models/task.view-model';
import {TaskStatus, TaskStatusTransitions} from '../../domain/enumerations/task-status';
import {TaskPriority} from '../../domain/enumerations/task-priority';
import {useAuthStore} from './auth.store';
import {useProjectStore} from './project.store';
import {TaskRepository} from '../../infrastructure/repositories/task.repository';
import {ProjectRepository} from '../../infrastructure/repositories/project.repository';
import {Task} from '../../domain/entities/task';

/**
 * Task store using Composition API.
 * Manages tasks within project context with status transitions and confirmations.
 */
export const useTaskStore = defineStore('task', () => {
  const authStore = useAuthStore();
  const projectStore = useProjectStore();
  const taskRepository = new TaskRepository();
  const projectRepository = new ProjectRepository();
  
  // State
  const tasksByProject = ref<Map<string, TaskViewModel[]>>(new Map());
  const currentTask = ref<TaskViewModel | null>(null);
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

  /**
   * Helper function to map Task entity to TaskViewModel
   */
  function mapEntityToDto(
    task: Task, 
    projectCode?: string, 
    projectName?: string
  ): TaskViewModel {
    const now = new Date();
    const isOverdue = task.dueDate < now && task.status !== TaskStatus.COMPLETED;
    
    return {
      id: task.id,
      projectId: task.projectId,
      projectCode: projectCode ?? 'Unknown',
      projectName: projectName ?? 'Unknown',
      description: task.description,
      creatorId: task.creatorId,
      creatorName: task.creatorName || 'Unknown',
      assigneeId: task.assigneeId,
      assigneeName: task.assigneeName || 'Unknown',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      comments: task.comments || null,
      fileIds: task.fileIds,
      files: [],
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt || null,
      confirmedAt: task.confirmedAt || null,
      isOverdue,
      canModify: authStore.isAdmin || task.creatorId === authStore.userId || task.assigneeId === authStore.userId,
      canDelete: authStore.isAdmin || task.creatorId === authStore.userId,
      canConfirm: authStore.isAdmin || task.creatorId === authStore.userId || task.assigneeId === authStore.userId,
      canChangeStatus: authStore.isAdmin || task.creatorId === authStore.userId || task.assigneeId === authStore.userId,
      allowedStatusTransitions: getValidTransitions(task.status),
    };
  }

  /**
   *  Helper to get valid status transitions
   */
  function getValidTransitions(currentStatus: TaskStatus): TaskStatus[] {
    return TaskStatusTransitions[currentStatus] || [];
  }

  /**
   * Helper to update task statistics in project store for a given project
   */
  function updateProjectTaskStats(projectId: string): void {
    // Only update if this is the current project in the project store
    if (!projectStore.currentProject || projectStore.currentProject.project.id !== projectId) {
      return;
    }

    const tasks = tasksByProject.value.get(projectId) ?? [];
    projectStore.currentProject.taskStats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      overdue: tasks.filter(t => t.isOverdue).length,
    };
  }

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
      t => t.status === TaskStatus.COMPLETED
    )
  );

  const highPriorityTasks = computed(() =>
    currentProjectTasks.value.filter(
      t => t.priority === TaskPriority.HIGH
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

      // Fetch project info for task mapping
      let projectCode = 'Unknown';
      let projectName = 'Unknown';
      try {
        const project = await projectRepository.findById(projectId);
        if (project) {
          projectCode = project.code;
          projectName = project.name;
        }
      } catch (err) {
        console.warn(`Failed to fetch project info for ${projectId}:`, err);
      }

      // Fetch tasks from backend
      const taskEntities = await taskRepository.find({projectId});
      const tasks = taskEntities.map(task => mapEntityToDto(task, projectCode, projectName));

      tasksByProject.value.set(projectId, tasks);
      pagination.value = {
        total: tasks.length,
        page: 1,
        limit: 20,
        totalPages: Math.ceil(tasks.length / 20),
      };

      // Update project store's taskStats if this is the current project
      updateProjectTaskStats(projectId);
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
      const taskEntity = await taskRepository.findById(taskId);
      if (!taskEntity) {
        throw new Error('Task not found');
      }
      currentTask.value = mapEntityToDto(taskEntity);
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch task';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches task history entries
   * Note: Currently returns empty array. Requires backend endpoint for task audit log.
   */
  async function fetchTaskHistory(taskId: string): Promise<void> {
    if (!authStore.userId) return;

    void taskId;

    isLoadingHistory.value = true;

    try {
      // Note: Requires backend implementation of GET /api/tasks/:id/history
      // For now, return empty history
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
  async function createTask(data: CreateTaskDto): Promise<TaskViewModel | null> {
    if (!authStore.userId) return null;

    isSaving.value = true;
    error.value = null;

    try {
      // Create task entity (backend will generate ID and timestamps)
      const taskEntity = new Task({
        id: `temp_${Date.now()}`, // Temporary ID
        projectId: data.projectId,
        creatorId: authStore.userId,
        assigneeId: data.assigneeId,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
        comments: data.comments || null,
        status: TaskStatus.PENDING,
        fileIds: data.fileIds || [],
      });

      const savedTask = await taskRepository.save(taskEntity);
      const newTask = mapEntityToDto(savedTask);

      const tasks = tasksByProject.value.get(data.projectId) ?? [];
      tasksByProject.value.set(data.projectId, [...tasks, newTask]);
      pagination.value.total++;

      // Update task statistics
      updateProjectTaskStats(data.projectId);

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
  async function updateTask(data: UpdateTaskDto): Promise<TaskViewModel | null> {
    if (!authStore.userId) return null;

    isSaving.value = true;
    error.value = null;

    try {
      // Fetch current task
      const taskEntity = await taskRepository.findById(data.id);
      if (!taskEntity) {
        throw new Error('Task not found');
      }

      // Update fields
      if (data.description) taskEntity.description = data.description;
      if (data.assigneeId) taskEntity.assigneeId = data.assigneeId;
      if (data.priority) taskEntity.priority = data.priority;
      if (data.dueDate) taskEntity.dueDate = data.dueDate;
      if (data.comments !== undefined) taskEntity.comments = data.comments;

      const updatedEntity = await taskRepository.update(taskEntity);
      const updatedTask = mapEntityToDto(updatedEntity);
      
      // Update local state
      for (const [projectId, tasks] of tasksByProject.value.entries()) {
        const index = tasks.findIndex(t => t.id === data.id);
        if (index !== -1) {
          tasks[index] = updatedTask;
          tasksByProject.value.set(projectId, [...tasks]);
          
          if (currentTask.value?.id === data.id) {
            currentTask.value = updatedTask;
          }

          // Update task statistics
          updateProjectTaskStats(projectId);
          
          return updatedTask;
        }
      }
      
      return updatedTask;
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
      await taskRepository.delete(taskId);
      
      // Remove from local state
      for (const [projectId, tasks] of tasksByProject.value.entries()) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          tasks.splice(index, 1);
          tasksByProject.value.set(projectId, [...tasks]);
          pagination.value.total--;
          
          if (currentTask.value?.id === taskId) {
            currentTask.value = null;
          }

          // Update task statistics
          updateProjectTaskStats(projectId);
          
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
      // Fetch and update task
      const taskEntity = await taskRepository.findById(taskId);
      if (!taskEntity) {
        throw new Error('Task not found');
      }

      // Use the entity's changeStatus method which validates transitions
      taskEntity.changeStatus(newStatus, authStore.userId);
      if (comment) {
        taskEntity.comments = comment;
      }

      const updatedEntity = await taskRepository.update(taskEntity);
      const updatedTask = mapEntityToDto(updatedEntity);
      
      // Update local state
      for (const [projectId, tasks] of tasksByProject.value.entries()) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          tasks[index] = updatedTask;
          tasksByProject.value.set(projectId, [...tasks]);
          
          if (currentTask.value?.id === taskId) {
            currentTask.value = updatedTask;
          }

          // Update task statistics (important for status changes!)
          updateProjectTaskStats(projectId);
          
          return true;
        }
      }
      
      return true;
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
      // Fetch and update task
      const taskEntity = await taskRepository.findById(taskId);
      if (!taskEntity) {
        throw new Error('Task not found');
      }

      if (confirmed) {
        // Use the entity's confirm method
        taskEntity.confirm(authStore.userId);
      } else {
        // Reject: use the entity's rejectConfirmation method
        taskEntity.rejectConfirmation(authStore.userId);
        if (feedback) {
          taskEntity.comments = feedback;
        }
      }

      const updatedEntity = await taskRepository.update(taskEntity);
      const updatedTask = mapEntityToDto(updatedEntity);
      
      // Update local state
      for (const [projectId, tasks] of tasksByProject.value.entries()) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          tasks[index] = updatedTask;
          tasksByProject.value.set(projectId, [...tasks]);
          
          if (currentTask.value?.id === taskId) {
            currentTask.value = updatedTask;
          }

          // Update task statistics
          updateProjectTaskStats(projectId);
          
          return true;
        }
      }
      
      return true;
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
  function setCurrentTask(task: TaskViewModel | null): void {
    currentTask.value = task;
  }

  /**
   * Handles real-time task created event
   */
  function handleTaskCreated(payload: any): void {
    const tasks = tasksByProject.value.get(payload.projectId) ?? [];
    tasksByProject.value.set(payload.projectId, [...tasks, payload as TaskViewModel]);
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
      
      const existingCurrentTask = currentTask.value;
      if (existingCurrentTask && existingCurrentTask.id === payload.id) {
        currentTask.value = {...existingCurrentTask, ...payload};
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
      tasks[index] = {...tasks[index], status: payload.newStatus};
      tasksByProject.value.set(payload.projectId, [...tasks]);
      
      const existingCurrentTask = currentTask.value;
      if (existingCurrentTask && existingCurrentTask.id === payload.taskId) {
        currentTask.value = {...existingCurrentTask, status: payload.newStatus};
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
