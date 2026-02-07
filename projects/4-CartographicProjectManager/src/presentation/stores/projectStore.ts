import {defineStore} from 'pinia';
import {ref} from 'vue';
import type {Project} from '@domain/entities/Project';

/**
 * Project store
 * Manages project state
 */
export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const loading = ref(false);

  const fetchProjects = async (): Promise<void> => {
    // TODO: Implement fetch projects logic
    throw new Error('Method not implemented.');
  };

  const fetchProjectById = async (id: string): Promise<void> => {
    // TODO: Implement fetch project by id logic
    throw new Error('Method not implemented.');
  };

  const createProject = async (
      projectData: unknown,
  ): Promise<void> => {
    // TODO: Implement create project logic
    throw new Error('Method not implemented.');
  };

  return {
    projects,
    currentProject,
    loading,
    fetchProjects,
    fetchProjectById,
    createProject,
  };
});
