/**
 * @module presentation/composables/use-projects
 * @description Composable for project-related logic.
 * Provides reactive project state and methods to Vue components.
 * @category Presentation
 */

import {computed} from 'vue';
import {useProjectStore} from '../stores/project.store';

/**
 * Composable that wraps the project store and provides
 * project management utilities to components.
 */
export function useProjects() {
  const projectStore = useProjectStore();

  const projects = computed(() => projectStore.projects);
  const activeProject = computed(() => projectStore.activeProject);
  const isLoading = computed(() => projectStore.isLoading);
  const error = computed(() => projectStore.error);

  /**
   * Loads the project list for the current user.
   */
  async function loadProjects(): Promise<void> {
    await projectStore.fetchProjects();
  }

  /**
   * Loads details for a specific project.
   * @param projectId - The project's unique ID.
   */
  async function loadProjectDetails(projectId: string): Promise<void> {
    await projectStore.fetchProjectDetails(projectId);
  }

  return {
    projects,
    activeProject,
    isLoading,
    error,
    loadProjects,
    loadProjectDetails,
  };
}
