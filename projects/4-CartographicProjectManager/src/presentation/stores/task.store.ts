/**
 * @module presentation/stores/task-store
 * @description Pinia store for task state management.
 * Manages tasks within the active project context.
 * @category Presentation
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {TaskData} from '../../application/dto/task-data.dto';
import {TaskStatus} from '../../domain/enumerations/task-status';
import {TaskPriority} from '../../domain/enumerations/task-priority';

/**
 * Task store.
 * Manages task data and operations within a project context.
 */
export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<TaskData[]>([]);
  const currentProjectId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const statusFilter = ref<TaskStatus | null>(null);
  const priorityFilter = ref<TaskPriority | null>(null);

  // Getters
  const taskCount = computed(() => tasks.value.length);
  
  const pendingTasks = computed(() =>
    tasks.value.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS)
  );

  const completedTasks = computed(() =>
    tasks.value.filter(t => t.status === TaskStatus.DONE || t.status === TaskStatus.COMPLETED)
  );

  const filteredTasks = computed(() => {
    let filtered = tasks.value;

    if (statusFilter.value) {
      filtered = filtered.filter(t => t.status === statusFilter.value);
    }

    if (priorityFilter.value) {
      filtered = filtered.filter(t => t.priority === priorityFilter.value);
    }

    return filtered;
  });

  const highPriorityTasks = computed(() =>
    tasks.value.filter(t => 
      t.priority === TaskPriority.HIGH || t.priority === TaskPriority.URGENT
    )
  );

  // Actions

  /**
   * Fetches all tasks for a specific project.
   * @param projectId - The project's unique ID.
   */
  async function fetchTasks(projectId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    currentProjectId.value = projectId;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock data
      tasks.value = [
        {
          id: '1',
          projectId,
          description: 'Complete topographic survey',
          assigneeId: 'admin1',
          assigneeName: 'Administrator',
          creatorId: 'client1',
          creatorName: 'Client One',
          dueDate: new Date('2025-03-15'),
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          createdAt: new Date('2025-02-01'),
        },
        {
          id: '2',
          projectId,
          description: 'Review boundary analysis',
          assigneeId: 'client1',
          assigneeName: 'Client One',
          creatorId: 'admin1',
          creatorName: 'Administrator',
          dueDate: new Date('2025-03-20'),
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          createdAt: new Date('2025-02-05'),
        },
      ] as any;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tasks';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Creates a new task.
   * @param taskData - Data for the new task.
   */
  async function createTask(taskData: Partial<TaskData>): Promise<string> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newTask: TaskData = {
        id: `task_${Date.now()}`,
        projectId: taskData.projectId || currentProjectId.value || '',
        description: taskData.description || '',
        assigneeId: taskData.assigneeId || '',
        assigneeName: taskData.assigneeName || '',
        creatorId: taskData.creatorId || '',
        creatorName: taskData.creatorName || '',
        dueDate: taskData.dueDate  || new Date(),
        status: TaskStatus.PENDING,
        priority: taskData.priority || TaskPriority.MEDIUM,
        createdAt: new Date(),
      } as any;

      tasks.value.push(newTask);
      return newTask.id;
    } catch (err: any) {
      error.value = err.message || 'Failed to create task';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Updates an existing task.
   * @param taskId - The task's unique ID.
   * @param updates - The updated data.
   */
  async function updateTask(taskId: string, updates: Partial<TaskData>): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const index = tasks.value.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.value[index] = {...tasks.value[index], ...updates};
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update task';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Deletes a task.
   * @param taskId - The task's unique ID.
   */
  async function deleteTask(taskId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const index = tasks.value.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.value.splice(index, 1);
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete task';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Changes the status of a task.
   * @param taskId - The task's unique ID.
   * @param newStatus - The new status to apply.
   */
  async function changeTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
  ): Promise<void> {
    await updateTask(taskId, {status: newStatus});
  }

  /**
   * Set status filter.
   */
  function setStatusFilter(status: TaskStatus | null): void {
    statusFilter.value = status;
  }

  /**
   * Set priority filter.
   */
  function setPriorityFilter(priority: TaskPriority | null): void {
    priorityFilter.value = priority;
  }

  /**
   * Clear all tasks (when leaving project).
   */
  function clearTasks(): void {
    tasks.value = [];
    currentProjectId.value = null;
  }

  return {
    // State
    tasks,
    currentProjectId,
    isLoading,
    error,
    statusFilter,
    priorityFilter,
    // Getters
    taskCount,
    pendingTasks,
    completedTasks,
    filteredTasks,
    highPriorityTasks,
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    setStatusFilter,
    setPriorityFilter,
    clearTasks,
  };
});
