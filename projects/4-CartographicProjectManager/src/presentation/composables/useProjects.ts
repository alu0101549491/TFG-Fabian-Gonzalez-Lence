import {useProjectStore} from '../stores/projectStore';

/**
 * Projects composable
 * Provides project management utilities for components
 */
export function useProjects() {
  const projectStore = useProjectStore();

  const loadProjects = async (): Promise<void> => {
    await projectStore.fetchProjects();
  };

  const loadProject = async (id: string): Promise<void> => {
    await projectStore.fetchProjectById(id);
  };

  return {
    projects: projectStore.projects,
    currentProject: projectStore.currentProject,
    loading: projectStore.loading,
    loadProjects,
    loadProject,
  };
}
