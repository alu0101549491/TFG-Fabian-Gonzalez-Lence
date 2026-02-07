/**
 * @module presentation/composables/use-projects
 * @description Composable for project-related logic.
 * Provides reactive project state and methods to Vue components.
 * @category Presentation
 */

import {computed} from 'vue';
import {useProjectStore} from '../stores/project.store';
import {ProjectStatus} from '../../domain/enumerations/project-status';

/**
 * Composable that wraps the project store and provides
 * project management utilities to components.
 */
export function useProjects() {
  const projectStore = useProjectStore();

  const projects = computed(() => projectStore.projects);
  const activeProject = computed(() => projectStore.activeProject);
  const filteredProjects = computed(() => projectStore.filteredProjects);
  const activeProjects = computed(() => projectStore.activeProjects);
  const finalizedProjects = computed(() => projectStore.finalizedProjects);
  const projectsDueThisWeek = computed(() => projectStore.projectsDueThisWeek);
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

  /**
   * Creates a new project.
   */
  async function createProject(projectData: any): Promise<string> {
    return await projectStore.createProject(projectData);
  }

  /**
   * Updates an existing project.
   */
  async function updateProject(projectId: string, updates: any): Promise<void> {
    await projectStore.updateProject(projectId, updates);
  }

  /**
   * Finalizes a project.
   */
  async function finalizeProject(projectId: string): Promise<void> {
    await projectStore.finalizeProject(projectId);
  }

  /**
   * Search projects.
   */
  function searchProjects(query: string): void {
    projectStore.setSearchQuery(query);
  }

  /**
   * Filter by status.
   */
  function filterByStatus(status: ProjectStatus | null): void {
    projectStore.setStatusFilter(status);
  }

  /**
   * Filter by client.
   */
  function filterByClient(clientId: string | null): void {
    projectStore.setClientFilter(clientId);
  }

  /**
   * Clear all filters.
   */
  function clearFilters(): void {
    projectStore.clearFilters();
  }

  /**
   * Get project indicator color based on pending tasks.
   */
  function getProjectIndicatorColor(project: any): string {
    if (project.pendingTasksCount > 0) {
      return 'var(--color-status-red)';
    }
    return 'var(--color-status-green)';
  }

  /**
   * Check if project is near deadline (within 7 days).
   */
  function isNearDeadline(deliveryDate: Date): boolean {
    const now = Date.now();
    const delivery = new Date(deliveryDate).getTime();
    const daysUntil = (delivery - now) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= 7;
  }

  return {
    // State
    projects,
    activeProject,
    filteredProjects,
    activeProjects,
    finalizedProjects,
    projectsDueThisWeek,
    isLoading,
    error,
    // Actions
    loadProjects,
    loadProjectDetails,
    createProject,
    updateProject,
    finalizeProject,
    searchProjects,
    filterByStatus,
    filterByClient,
    clearFilters,
    // Utilities
    getProjectIndicatorColor,
    isNearDeadline,
  };
}
