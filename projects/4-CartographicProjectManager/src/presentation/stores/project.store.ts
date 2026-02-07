/**
 * @module presentation/stores/project-store
 * @description Pinia store for project state management.
 * Manages the list of projects, active project details, and project operations.
 * @category Presentation
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import {type Project} from '@domain/entities/project';
import {type ProjectDetails} from '@application/dto/project-details.dto';

/**
 * Project store.
 * Manages project data, active project selection, and CRUD operations.
 */
export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<Project[]>([]);
  const activeProject = ref<ProjectDetails | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const projectCount = computed(() => projects.value.length);
  const activeProjects = computed(() =>
    projects.value.filter((p) => p.getStatus() !== 'FINALIZED'),
  );

  // Actions

  /**
   * Fetches all projects accessible by the current user.
   */
  async function fetchProjects(): Promise<void> {
    // TODO: Implement project list fetching
    throw new Error('Method not implemented.');
  }

  /**
   * Fetches detailed information for a specific project.
   * @param projectId - The project's unique ID.
   */
  async function fetchProjectDetails(projectId: string): Promise<void> {
    // TODO: Implement project details fetching
    throw new Error('Method not implemented.');
  }

  /**
   * Creates a new project (admin only).
   * @param projectData - Data for the new project.
   */
  async function createProject(projectData: unknown): Promise<void> {
    // TODO: Implement project creation
    throw new Error('Method not implemented.');
  }

  /**
   * Finalizes a project (admin only).
   * @param projectId - The project's unique ID.
   */
  async function finalizeProject(projectId: string): Promise<void> {
    // TODO: Implement project finalization
    throw new Error('Method not implemented.');
  }

  return {
    projects,
    activeProject,
    isLoading,
    error,
    projectCount,
    activeProjects,
    fetchProjects,
    fetchProjectDetails,
    createProject,
    finalizeProject,
  };
});
