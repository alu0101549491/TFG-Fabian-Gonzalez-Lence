/**
 * @module presentation/stores/project-store
 * @description Pinia store for project state management.
 * Manages the list of projects, active project details, and project operations.
 * @category Presentation
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {Project} from '../../domain/entities/project';
import type {ProjectData} from '../../application/dto/project-data.dto';
import type {ProjectDetails} from '../../application/dto/project-details.dto';
import {ProjectStatus} from '../../domain/enumerations/project-status';
import { ProjectType } from '../../domain/enumerations/project-type';

/**
 * Project store.
 * Manages project data, active project selection, and CRUD operations.
 */
export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<any[]>([]);
  const activeProject = ref<any | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref('');
  const statusFilter = ref<ProjectStatus | null>(null);
  const clientFilter = ref<string | null>(null);

  // Getters
  const projectCount = computed(() => projects.value.length);
  
  const activeProjects = computed(() =>
    projects.value.filter((p) => p.status !== ProjectStatus.FINALIZED),
  );

  const finalizedProjects = computed(() =>
    projects.value.filter((p) => p.status === ProjectStatus.FINALIZED),
  );

  const filteredProjects = computed(() => {
    let filtered = projects.value;

    // Apply status filter
    if (statusFilter.value) {
      filtered = filtered.filter(p => p.status === statusFilter.value);
    }

    // Apply client filter
    if (clientFilter.value) {
      filtered = filtered.filter(p => p.clientId === clientFilter.value);
    }

    // Apply search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(p =>
        p.code.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  const projectsDueThisWeek = computed(() => {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return activeProjects.value.filter(p => {
      const deliveryTime = new Date(p.deliveryDate).getTime();
      return deliveryTime - now <= oneWeek && deliveryTime > now;
    });
  });

  // Actions

  /**
   * Fetches all projects accessible by the current user.
   */
  async function fetchProjects(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call - Replace with actual service
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      projects.value = [
        {
          id: '1',
          code: 'CART-2025-001',
          name: 'North Urbanization Project',
          clientId: 'client1',
          clientName: 'John Pérez',
          type: ProjectType.RESIDENTIAL,
          contractDate: new Date('2025-01-01'),
          deliveryDate: new Date('2025-12-15'),
          status: ProjectStatus.ACTIVE,
          pendingTasksCount: 2,
          unreadMessagesCount: 3,
        },
        {
          id: '2',
          code: 'CART-2025-002',
          name: 'South Topographic Survey',
          clientId: 'client2',
          clientName: 'Mary López',
          type: ProjectType.COMMERCIAL,
          contractDate: new Date('2025-02-01'),
          deliveryDate: new Date('2026-01-20'),
          status: ProjectStatus.IN_PROGRESS,
          pendingTasksCount: 0,
          unreadMessagesCount: 0,
        },
      ] as any;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch projects';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches detailed information for a specific project.
   * @param projectId - The project's unique ID.
   */
  async function fetchProjectDetails(projectId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const project = projects.value.find(p => p.id === projectId);
      if (project) {
        activeProject.value = project as any;
      } else {
        throw new Error('Project not found');
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch project details';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Creates a new project (admin only).
   * @param projectData - Data for the new project.
   */
  async function createProject(projectData: Partial<ProjectData>): Promise<string> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newProject: ProjectData = {
        id: `project_${Date.now()}`,
        code: projectData.code || `CART-${new Date().getFullYear()}-${String(projects.value.length + 1).padStart(3, '0')}`,
        name: projectData.name || 'New Project',
        clientId: projectData.clientId || '',
        clientName: projectData.clientName || '',
        type: projectData.type || ProjectType.RESIDENTIAL,
        contractDate: projectData.contractDate || new Date(),
        deliveryDate: projectData.deliveryDate || new Date(),
        status: ProjectStatus.ACTIVE,
        pendingTasksCount: 0,
        unreadMessagesCount: 0,
      } as any;

      projects.value.unshift(newProject);
      return newProject.id;
    } catch (err: any) {
      error.value = err.message || 'Failed to create project';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Updates an existing project.
   * @param projectId - The project's unique ID.
   * @param updates - Partial project data to update.
   */
  async function updateProject(projectId: string, updates: Partial<ProjectData>): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = projects.value.findIndex(p => p.id === projectId);
      if (index !== -1) {
        projects.value[index] = {...projects.value[index], ...updates};
        if (activeProject.value?.id === projectId) {
          activeProject.value = {...activeProject.value, ...updates} as any;
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update project';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Finalizes a project (admin only).
   * @param projectId - The project's unique ID.
   */
  async function finalizeProject(projectId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await updateProject(projectId, {
        status: ProjectStatus.FINALIZED,
      });
    } catch (err: any) {
      error.value = err.message || 'Failed to finalize project';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Set search query for filtering projects.
   */
  function setSearchQuery(query: string): void {
    searchQuery.value = query;
  }

  /**
   * Set status filter.
   */
  function setStatusFilter(status: ProjectStatus | null): void {
    statusFilter.value = status;
  }

  /**
   * Set client filter.
   */
  function setClientFilter(clientId: string | null): void {
    clientFilter.value = clientId;
  }

  /**
   * Clear all filters.
   */
  function clearFilters(): void {
    searchQuery.value = '';
    statusFilter.value = null;
    clientFilter.value = null;
  }

  /**
   * Clear active project.
   */
  function clearActiveProject(): void {
    activeProject.value = null;
  }

  return {
    // State
    projects,
    activeProject,
    isLoading,
    error,
    searchQuery,
    statusFilter,
    clientFilter,
    // Getters
    projectCount,
    activeProjects,
    finalizedProjects,
    filteredProjects,
    projectsDueThisWeek,
    // Actions
    fetchProjects,
    fetchProjectDetails,
    createProject,
    updateProject,
    finalizeProject,
    setSearchQuery,
    setStatusFilter,
    setClientFilter,
    clearFilters,
    clearActiveProject,
  };
});
