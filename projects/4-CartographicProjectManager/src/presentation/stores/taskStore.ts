import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {Task} from '@domain/entities/Task';

/**
 * Task store
 * Manages task state
 */
export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);

  const fetchTasksByProject = async (
      projectId: string,
  ): Promise<void> => {
    // TODO: Implement fetch tasks logic
    throw new Error('Method not implemented.');
  };

  const createTask = async (taskData: unknown): Promise<void> => {
    // TODO: Implement create task logic
    throw new Error('Method not implemented.');
  };

  const updateTask = async (
      taskId: string,
      taskData: unknown,
  ): Promise<void> => {
    // TODO: Implement update task logic
    throw new Error('Method not implemented.');
  };

  return {
    tasks,
    loading,
    fetchTasksByProject,
    createTask,
    updateTask,
  };
});
