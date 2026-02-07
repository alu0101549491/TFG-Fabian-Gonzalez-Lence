/**
 * @module presentation/composables/use-tasks
 * @description Composable for task-related logic.
 * Provides reactive task state and methods to Vue components.
 * @category Presentation
 */

import {computed} from 'vue';
import {useTaskStore} from '../stores/task.store';
import {type TaskStatus} from '@domain/enumerations/task-status';

/**
 * Composable that wraps the task store and provides
 * task management utilities to components.
 */
export function useTasks() {
  const taskStore = useTaskStore();

  const tasks = computed(() => taskStore.tasks);
  const isLoading = computed(() => taskStore.isLoading);
  const error = computed(() => taskStore.error);

  /**
   * Loads tasks for a specific project.
   * @param projectId - The project's unique ID.
   */
  async function loadTasks(projectId: string): Promise<void> {
    await taskStore.fetchTasks(projectId);
  }

  /**
   * Changes a task's status.
   * @param taskId - The task's unique ID.
   * @param status - The new status.
   */
  async function changeStatus(
    taskId: string,
    status: TaskStatus,
  ): Promise<void> {
    await taskStore.changeTaskStatus(taskId, status);
  }

  return {
    tasks,
    isLoading,
    error,
    loadTasks,
    changeStatus,
  };
}
