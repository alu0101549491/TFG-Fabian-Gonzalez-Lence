/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/stores/project.store.ts
 * @desc Pinia store for project state management with filtering and calendar support
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://pinia.vuejs.org}
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {
  ProjectSummaryDto,
  ProjectDetailsDto,
  ProjectFilterDto,
  ProjectListResponseDto,
  CalendarProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
} from '../../application/dto';
import {ProjectStatus} from '../../domain/enumerations/project-status';
import {ProjectType} from '../../domain/enumerations/project-type';
import {useAuthStore} from './auth.store';

/**
 * Project store using Composition API.
 * Manages project lists, current project details, filtering, and calendar view.
 */
export const useProjectStore = defineStore('project', () => {
  const authStore = useAuthStore();
  
  // State
  const projects = ref<ProjectSummaryDto[]>([]);
  const currentProject = ref<ProjectDetailsDto | null>(null);
  const calendarProjects = ref<CalendarProjectDto[]>([]);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const filters = ref<ProjectFilterDto>({});
  const searchQuery = ref('');
  const statusFilter = ref<ProjectStatus | null>(null);
  const clientFilter = ref<string | null>(null);
  const isLoading = ref(false);
  const isLoadingDetails = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const projectCount = computed(() => pagination.value.total);
  
  const activeProjects = computed(() =>
    projects.value.filter((p) => p.status !== ProjectStatus.FINALIZED),
  );

  const finalizedProjects = computed(() =>
    projects.value.filter((p) => p.status === ProjectStatus.FINALIZED),
  );

  const overdueProjects = computed(() =>
    projects.value.filter((p) => p.isOverdue),
  );

  const hasCurrentProject = computed(() => !!currentProject.value);
  
  const currentProjectId = computed(() => currentProject.value?.project.id ?? null);
  
  const currentProjectTasks = computed(() => currentProject.value?.tasks ?? []);
  
  const currentProjectMessages = computed(() => currentProject.value?.recentMessages ?? []);
  
  const currentProjectParticipants = computed(() => currentProject.value?.participants ?? []);
  
  const currentProjectStats = computed(() => currentProject.value?.taskStats ?? {
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
  });

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
        p.name.toLowerCase().includes(query) ||
        p.clientName.toLowerCase().includes(query)
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

  const projectsWithPendingTasks = computed(() =>
    projects.value.filter(p => p.hasPendingTasks).length
  );

  const calendarProjectsByDate = computed(() => {
    const grouped = new Map<string, CalendarProjectDto[]>();
    
    calendarProjects.value.forEach(project => {
      const dateKey = project.deliveryDate.toISOString().split('T')[0];
      const existing = grouped.get(dateKey) ?? [];
      grouped.set(dateKey, [...existing, project]);
    });
    
    return grouped;
  });

  // Actions

  /**
   * Fetches all projects accessible by current user
   *
   * @param newFilters - Optional filters to apply
   *
   * @example
   * ```typescript
   * await projectStore.fetchProjects({ status: ProjectStatus.ACTIVE });
   * ```
   */
  async function fetchProjects(newFilters?: ProjectFilterDto): Promise<void> {
    if (!authStore.userId) return;

    isLoading.value = true;
    error.value = null;

    try {
      if (newFilters) {
        filters.value = {...filters.value, ...newFilters};
      }

      // TODO: Replace with actual service call
      // const response = await projectService.getProjectsByUser(
      //   authStore.userId,
      //   filters.value
      // );
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockProjects: ProjectSummaryDto[] = [
        {
          id: '1',
          code: 'CART-2025-001',
          name: 'North Urbanization Project',
          clientId: 'client1',
          clientName: 'John Pérez',
          type: ProjectType.RESIDENTIAL,
          deliveryDate: new Date('2025-12-15'),
          status: ProjectStatus.ACTIVE,
          hasPendingTasks: true,
          pendingTasksCount: 2,
          unreadMessagesCount: 3,
          statusColor: 'green',
          isOverdue: false,
          daysUntilDelivery: 300,
        },
        {
          id: '2',
          code: 'CART-2025-002',
          name: 'South Topographic Survey',
          clientId: 'client2',
          clientName: 'Mary López',
          type: ProjectType.COMMERCIAL,
          deliveryDate: new Date('2026-01-20'),
          status: ProjectStatus.PENDING,
          hasPendingTasks: false,
          pendingTasksCount: 0,
          unreadMessagesCount: 0,
          statusColor: 'red',
          isOverdue: false,
          daysUntilDelivery: 336,
        },
      ];

      projects.value = mockProjects;
      pagination.value = {
        total: mockProjects.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch projects';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches detailed information for a specific project
   *
   * @param projectId - The project's unique ID
   */
  async function fetchProjectById(projectId: string): Promise<void> {
    if (!authStore.userId) return;

    isLoadingDetails.value = true;
    error.value = null;

    try {
      // If projects haven't been loaded yet, load them first
      if (projects.value.length === 0) {
        await fetchProjects();
      }

      // TODO: Replace with actual service call
      // currentProject.value = await projectService.getProjectById(
      //   projectId,
      //   authStore.userId
      // );
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const project = projects.value.find(p => p.id === projectId);
      if (project) {
        currentProject.value = {
          project: project as any,
          tasks: [],
          taskStats: { total: 0, pending: 0, completed: 0, overdue: 0 },
          recentMessages: [],
          unreadMessagesCount: project.unreadMessagesCount,
          totalMessagesCount: 0,
          participants: [
            {
              userId: authStore.userId!,
              username: authStore.user?.username || 'Admin User',
              email: authStore.user?.email || 'admin@cartographic.com',
              role: authStore.user?.role || 'ADMINISTRATOR',
              participantType: 'owner',
              permissions: [],
              joinedAt: new Date(),
            },
            {
              userId: 'client-1',
              username: 'John Client',
              email: 'client@example.com',
              role: 'CLIENT_ONE',
              participantType: 'client',
              permissions: [],
              joinedAt: new Date(),
            },
            {
              userId: 'special-1',
              username: 'Special User',
              email: 'special@example.com',
              role: 'SPECIAL_USER',
              participantType: 'special_user',
              permissions: ['READ', 'WRITE'],
              joinedAt: new Date(),
            },
          ],
          sections: [],
          totalFilesCount: 0,
          currentUserPermissions: {
            canEdit: true,
            canDelete: authStore.isAdmin,
          },
          statusColor: project.statusColor,
          isOverdue: project.isOverdue,
          daysUntilDelivery: project.daysUntilDelivery,
        };
      } else {
        throw new Error('Project not found');
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch project details';
      currentProject.value = null;
      throw err;
    } finally {
      isLoadingDetails.value = false;
    }
  }

  /**
   * Fetches projects for calendar view within date range
   */
  async function fetchCalendarProjects(startDate: Date, endDate: Date): Promise<void> {
    if (!authStore.userId) return;

    try {
      // TODO: Replace with actual service call
      // calendarProjects.value = await projectService.getProjectsForCalendar(
      //   authStore.userId,
      //   startDate,
      //   endDate
      // );
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mock calendar projects from projects list
      calendarProjects.value = projects.value.map(p => ({
        id: p.id,
        code: p.code,
        name: p.name,
        deliveryDate: p.deliveryDate,
        status: p.status,
        statusColor: p.statusColor,
      }));
    } catch (err: any) {
      console.error('Failed to fetch calendar projects:', err);
    }
  }

  /**
   * Refreshes current project details
   */
  async function refreshCurrentProject(): Promise<void> {
    if (currentProjectId.value) {
      await fetchProjectById(currentProjectId.value);
    }
  }

  /**
   * Creates a new project (admin only)
   */
  async function createProject(data: CreateProjectDto): Promise<string | null> {
    if (!authStore.userId) return null;

    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual service call
      // const project = await projectService.createProject(data, authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newProject: ProjectSummaryDto = {
        id: `project_${Date.now()}`,
        code: data.code || `CART-${new Date().getFullYear()}-${String(projects.value.length + 1).padStart(3, '0')}`,
        name: data.name,
        clientId: data.clientId,
        clientName: 'Client Name',
        type: data.type,
        deliveryDate: data.deliveryDate,
        status: ProjectStatus.ACTIVE,
        hasPendingTasks: false,
        pendingTasksCount: 0,
        unreadMessagesCount: 0,
        statusColor: 'green',
        isOverdue: false,
        daysUntilDelivery: 0,
      };

      projects.value.unshift(newProject);
      pagination.value.total++;
      
      return newProject.id;
    } catch (err: any) {
      error.value = err.message || 'Failed to create project';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Updates an existing project
   */
  async function updateProject(data: UpdateProjectDto): Promise<boolean> {
    if (!authStore.userId) return false;

    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual service call
      // await projectService.updateProject(data, authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = projects.value.findIndex(p => p.id === data.projectId);
      if (index !== -1) {
        projects.value[index] = {...projects.value[index], ...data as any};
        
        if (currentProject.value?.project.id === data.projectId) {
          currentProject.value.project = {...currentProject.value.project, ...data as any};
        }
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to update project';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Deletes a project (admin only)
   */
  async function deleteProject(projectId: string): Promise<boolean> {
    if (!authStore.userId) return false;

    try {
      // TODO: Replace with actual service call
      // await projectService.deleteProject(projectId, authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = projects.value.findIndex(p => p.id === projectId);
      if (index !== -1) {
        projects.value.splice(index, 1);
        pagination.value.total--;
      }
      
      if (currentProjectId.value === projectId) {
        currentProject.value = null;
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to delete project';
      return false;
    }
  }

  /**
   * Finalizes a project (admin only)
   */
  async function finalizeProject(projectId: string): Promise<boolean> {
    if (!authStore.userId) return false;

    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual service call
      // await projectService.finalizeProject(projectId, authStore.userId);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return await updateProject({
        projectId,
        status: ProjectStatus.FINALIZED,
      } as UpdateProjectDto);
    } catch (err: any) {
      error.value = err.message || 'Failed to finalize project';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Sets search query for filtering
   */
  function setSearchQuery(query: string): void {
    searchQuery.value = query;
  }

  /**
   * Sets status filter
   */
  function setStatusFilter(status: ProjectStatus | null): void {
    statusFilter.value = status;
  }

  /**
   * Sets client filter
   */
  function setClientFilter(clientId: string | null): void {
    clientFilter.value = clientId;
  }

  /**
   * Sets page number
   */
  function setPage(page: number): void {
    pagination.value.page = page;
  }

  /**
   * Sets custom filters
   */
  function setFilters(newFilters: Partial<ProjectFilterDto>): void {
    filters.value = {...filters.value, ...newFilters};
  }

  /**
   * Resets all filters
   */
  function resetFilters(): void {
    searchQuery.value = '';
    statusFilter.value = null;
    clientFilter.value = null;
    filters.value = {};
  }

  /**
   * Handles real-time project updated event
   */
  function handleProjectUpdated(payload: any): void {
    const index = projects.value.findIndex(p => p.id === payload.id);
    if (index !== -1) {
      projects.value[index] = {...projects.value[index], ...payload};
    }
    
    if (currentProject.value?.project.id === payload.id) {
      currentProject.value.project = {...currentProject.value.project, ...payload};
    }
  }

  /**
   * Handles real-time project finalized event
   */
  function handleProjectFinalized(payload: {projectId: string}): void {
    const index = projects.value.findIndex(p => p.id === payload.projectId);
    if (index !== -1) {
      projects.value[index].status = ProjectStatus.FINALIZED;
      projects.value[index].statusColor = 'gray';
    }
    
    if (currentProject.value?.project.id === payload.projectId) {
      currentProject.value.project.status = ProjectStatus.FINALIZED;
    }
  }

  /**
   * Clears current project
   */
  function clearCurrentProject(): void {
    currentProject.value = null;
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    // State
    projects,
    currentProject,
    calendarProjects,
    pagination,
    filters,
    searchQuery,
    statusFilter,
    clientFilter,
    isLoading,
    isLoadingDetails,
    error,
    
    // Getters
    projectCount,
    activeProjects,
    finalizedProjects,
    overdueProjects,
    hasCurrentProject,
    currentProjectId,
    currentProjectTasks,
    currentProjectMessages,
    currentProjectParticipants,
    currentProjectStats,
    filteredProjects,
    projectsDueThisWeek,
    projectsWithPendingTasks,
    calendarProjectsByDate,
    
    // Actions
    fetchProjects,
    fetchProjectById,
    fetchCalendarProjects,
    refreshCurrentProject,
    createProject,
    updateProject,
    deleteProject,
    finalizeProject,
    setSearchQuery,
    setStatusFilter,
    setClientFilter,
    setPage,
    setFilters,
    resetFilters,
    handleProjectUpdated,
    handleProjectFinalized,
    clearCurrentProject,
    clearError,
  };
});
