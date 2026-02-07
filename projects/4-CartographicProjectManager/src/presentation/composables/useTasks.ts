import {useTaskStore} from '../stores/taskStore';

/**
 * Tasks composable
 * Provides task management utilities for components
 */
export function useTasks() {
  const taskStore = useTaskStore();

  const loadTasks = async (projectId: string): Promise<void> => {
    await taskStore.fetchTasksByProject(projectId);
  };

  return {
    tasks: taskStore.tasks,
    loading: taskStore.loading,
    loadTasks,
  };
}
