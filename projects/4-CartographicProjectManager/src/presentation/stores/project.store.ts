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
  ProjectFilterDto,
  CalendarProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  ParticipantDto,
  ProjectDto,
  TaskStatsDto,
} from '../../application/dto';
import type {
  ProjectDetailsViewModel,
  ProjectSummaryViewModel,
} from '../view-models/project.view-model';
import {ProjectStatus} from '../../domain/enumerations/project-status';
import {AccessRight} from '../../domain/enumerations/access-right';
import {useAuthStore} from './auth.store';
import {ProjectRepository} from '../../infrastructure/repositories/project.repository';
import {UserRepository} from '../../infrastructure/repositories/user.repository';
import {TaskRepository} from '../../infrastructure/repositories/task.repository';
import {MessageRepository} from '../../infrastructure/repositories/message.repository';
import {Project} from '../../domain/entities/project';
import {GeoCoordinates} from '../../domain/value-objects/geo-coordinates';
import {TaskStatus} from '../../domain/enumerations/task-status';

/**
 * Project store using Composition API.
 * Manages project lists, current project details, filtering, and calendar view.
 */
export const useProjectStore = defineStore('project', () => {
  const authStore = useAuthStore();
  const projectRepository = new ProjectRepository();
  const userRepository = new UserRepository();
  const taskRepository = new TaskRepository();
  const messageRepository = new MessageRepository();
  const isDev = import.meta.env.DEV;
  
  // State
  const projects = ref<ProjectSummaryViewModel[]>([]);
  const currentProject = ref<ProjectDetailsViewModel | null>(null);
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
   * Maps a Project entity to ProjectSummaryDto with denormalized data
   */
  async function mapProjectToSummaryDto(project: Project): Promise<ProjectSummaryViewModel> {
    // Fetch client name
    let clientName = 'Unknown Client';
    try {
      const client = await userRepository.findById(project.clientId);
      if (client) {
        clientName = client.username;
      }
    } catch (err) {
      if (isDev) {
        console.warn(`Failed to fetch client name for project ${project.id}:`, err);
      }
    }

    // Fetch pending tasks count
    let pendingTasksCount = 0;
    let hasPendingTasks = false;
    try {
      const tasks = await taskRepository.find({projectId: project.id});
      const pendingTasks = tasks.filter(
        t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS
      );
      pendingTasksCount = pendingTasks.length;
      hasPendingTasks = pendingTasksCount > 0;
    } catch (err) {
      if (isDev) {
        console.warn(`Failed to fetch tasks for project ${project.id}:`, err);
      }
    }

    // Fetch unread messages count
    let unreadMessagesCount = 0;
    try {
      if (authStore.userId) {
        unreadMessagesCount = await messageRepository.count({
          projectId: project.id,
          unreadForUserId: authStore.userId,
        });
      }
    } catch (err) {
      if (isDev) {
        console.warn(`Failed to fetch unread messages for project ${project.id}:`, err);
      }
    }

    return {
      id: project.id,
      code: project.code,
      name: project.name,
      clientId: project.clientId,
      clientName,
      type: project.type,
      deliveryDate: project.deliveryDate,
      status: project.status,
      hasPendingTasks,
      pendingTasksCount,
      unreadMessagesCount,
      participantCount: project.specialUserIds.length + 1,
      statusColor: project.status === ProjectStatus.ACTIVE ? 'green' : 'gray',
      isOverdue: project.deliveryDate < new Date() && project.status !== ProjectStatus.FINALIZED,
      daysUntilDelivery: Math.ceil(
        (project.deliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

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

      console.log('🔍 [ProjectStore] fetchProjects called - fetching summaries...');
      const summaries = await projectRepository.findSummaries({
        status: filters.value.status ?? undefined,
        year: filters.value.year ?? undefined,
        type: filters.value.type ?? undefined,
        clientId: filters.value.clientId ?? undefined,
      });
      console.log(`🔍 [ProjectStore] fetchProjects: received ${summaries.length} project summaries`, summaries);

      console.log(`🔍 [ProjectStore] fetchProjects: mapping ${summaries.length} summaries to view models`);
      projects.value = summaries.map((summary) => {
        const deliveryDate = new Date(summary.deliveryDate);
        const createdAt = new Date(summary.createdAt);
        const updatedAt = new Date(summary.updatedAt);

        return {
          id: summary.id,
          code: summary.code,
          name: summary.name,
          clientId: summary.clientId,
          clientName: summary.clientName,
          type: summary.type,
          deliveryDate,
          status: summary.status,
          hasPendingTasks: summary.pendingTasksCount > 0,
          pendingTasksCount: summary.pendingTasksCount,
          unreadMessagesCount: summary.unreadMessagesCount,
          participantCount: summary.participantCount,
          statusColor: summary.status === ProjectStatus.ACTIVE ? 'green' : 'gray',
          isOverdue: deliveryDate < new Date() && summary.status !== ProjectStatus.FINALIZED,
          daysUntilDelivery: Math.ceil(
            (deliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
          createdAt,
          updatedAt,
        };
      });

      pagination.value = {
        total: projects.value.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(projects.value.length / 10),
      };
    } catch (err: any) {
      if (isDev) {
        console.error('Failed to fetch projects:', err);
      }
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
      // Fetch project from backend (includes client and specialUsers)
      const projectWithDetails = await projectRepository.getProjectWithParticipants(projectId);
      
      if (!projectWithDetails) {
        throw new Error('Project not found');
      }

      const projectDto: ProjectDto = {
        id: projectWithDetails.id,
        code: projectWithDetails.code,
        name: projectWithDetails.name,
        year: projectWithDetails.year,
        type: projectWithDetails.type,
        description: null,
        clientId: projectWithDetails.clientId,
        clientName: projectWithDetails.client?.username ?? 'Unknown Client',
        coordinateX: projectWithDetails.coordinateX,
        coordinateY: projectWithDetails.coordinateY,
        contractDate: new Date(projectWithDetails.contractDate),
        deliveryDate: new Date(projectWithDetails.deliveryDate),
        status: projectWithDetails.status,
        storageFolderId:
          typeof projectWithDetails.dropboxFolderId === 'string' &&
          projectWithDetails.dropboxFolderId.trim().length > 0
            ? projectWithDetails.dropboxFolderId
            : null,
        storageFolderUrl: null,
        createdAt: new Date(projectWithDetails.createdAt),
        updatedAt: new Date(projectWithDetails.updatedAt),
        finalizedAt: projectWithDetails.finalizedAt ? new Date(projectWithDetails.finalizedAt) : null,
      };

      // Map participants from backend data
      const participants: ParticipantDto[] = [];
      const participantIds = new Set<string>();

      const addParticipant = (participant: ParticipantDto): void => {
        if (participantIds.has(participant.userId)) {
          return;
        }
        participantIds.add(participant.userId);
        participants.push(participant);
      };

      // Add project owner/creator as participant (enables assigning tasks to admin/creator)
      if (projectWithDetails.creatorId) {
        try {
          const creator = await userRepository.findById(projectWithDetails.creatorId);
          if (creator) {
            addParticipant({
              userId: creator.id,
              username: creator.username,
              email: creator.email,
              role: creator.role,
              participantType: 'owner',
              permissions: [],
              joinedAt: creator.createdAt,
            });
          }
        } catch (err) {
          if (isDev) {
            console.warn(
              `Failed to fetch project creator ${projectWithDetails.creatorId}:`,
              err,
            );
          }
        }
      }

      // Add client as participant
      if (projectWithDetails.client) {
        addParticipant({
          userId: projectWithDetails.client.id,
          username: projectWithDetails.client.username,
          email: projectWithDetails.client.email,
          role: projectWithDetails.client.role,
          participantType: 'client',
          permissions: [],
          joinedAt: new Date(projectWithDetails.client.createdAt),
        });
      }

      // Add special users as participants
      if (projectWithDetails.specialUsers && Array.isArray(projectWithDetails.specialUsers)) {
        projectWithDetails.specialUsers.forEach((su) => {
          if (su.user) {
            addParticipant({
              userId: su.user.id,
              username: su.user.username,
              email: su.user.email,
              role: su.user.role,
              participantType: 'special_user',
              permissions: (su.accessRights || []).map((right) => right as AccessRight),
              joinedAt: new Date(su.user.createdAt),
            });
          }
        });
      }

      // Find project summary in local state for display-only metadata
      let projectSummary = projects.value.find(p => p.id === projectId);
      
      // If not found, fetch projects first
      if (!projectSummary) {
        await fetchProjects();
        projectSummary = projects.value.find(p => p.id === projectId);
      }

      currentProject.value = {
        // Use the full project details from API, not the summary
        project: projectDto,
        tasks: [],
        taskStats: { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 },
        recentMessages: [],
        unreadMessagesCount: projectSummary?.unreadMessagesCount || 0,
        totalMessagesCount: 0,
        participants,
        sections: [],
        totalFilesCount: 0,
        currentUserPermissions: projectWithDetails.currentUserPermissions ?? {
          canEdit: authStore.isAdmin || (authStore.isClient && projectWithDetails.clientId === authStore.userId),
          canDelete: authStore.isAdmin,
          canFinalize: authStore.isAdmin,
          canCreateTask: authStore.isAdmin || (authStore.isClient && projectWithDetails.clientId === authStore.userId),
          canSendMessage: authStore.isAdmin || (authStore.isClient && projectWithDetails.clientId === authStore.userId),
          canUploadFile: authStore.isAdmin || (authStore.isClient && projectWithDetails.clientId === authStore.userId),
          canDownloadFile: authStore.isAdmin || (authStore.isClient && projectWithDetails.clientId === authStore.userId),
          canManageParticipants: authStore.isAdmin,
        },
        statusColor: projectSummary?.statusColor || 'gray',
        isOverdue: projectSummary?.isOverdue || false,
        daysUntilDelivery: projectSummary?.daysUntilDelivery || 0,
      };
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

    // Normalize dates to midnight for comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isDev) {
      console.log(`[ProjectStore] fetchCalendarProjects: ${start.toISOString()} to ${end.toISOString()}`);
    }

    try {
      // Fetch all projects from backend
      const projectEntities = await projectRepository.findAll();
      if (isDev) {
        console.log(`[ProjectStore] Found ${projectEntities.length} total projects`);
      }
      
      // Filter by delivery date range and map to calendar DTOs
      calendarProjects.value = projectEntities
        .filter(p => {
          const deliveryDate = new Date(p.deliveryDate);
          deliveryDate.setHours(0, 0, 0, 0);
          const inRange = deliveryDate >= start && deliveryDate <= end;
          if (isDev) {
            if (inRange) {
              console.log(`[ProjectStore] ✅ Project ${p.code} delivery: ${deliveryDate.toLocaleDateString()} is in range`);
            } else {
              console.log(`[ProjectStore] ❌ Project ${p.code} delivery: ${deliveryDate.toLocaleDateString()} is NOT in range`);
            }
          }
          return inRange;
        })
        .map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          deliveryDate: p.deliveryDate,
          status: p.status,
          hasPendingTasks: false, // Will be calculated if needed
        }));
      
      if (isDev) {
        console.log(`[ProjectStore] Filtered to ${calendarProjects.value.length} projects in date range`);
      }
    } catch (err: any) {
      if (isDev) {
        console.error('Failed to fetch calendar projects:', err);
      }
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
      // Send data directly to backend via repository
      const savedProject = await projectRepository.createFromDto(data);

      // Add to local state with denormalized data
      const newProjectSummary = await mapProjectToSummaryDto(savedProject);

      projects.value.unshift(newProjectSummary);
      pagination.value.total++;
      
      return savedProject.id;
    } catch (err: any) {
      if (isDev) {
        console.error('Failed to create project:', err);
      }
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
    if (isDev) {
      console.log('[ProjectStore] updateProject called with data:', data);
    }
    
    if (!authStore.userId) {
      if (isDev) {
        console.error('[ProjectStore] Cannot update - user not authenticated');
      }
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Fetch current project entity
      if (isDev) {
        console.log(`[ProjectStore] Fetching current project entity for ${data.id}...`);
      }
      const currentProjectEntity = await projectRepository.findById(data.id);
      
      if (!currentProjectEntity) {
        throw new Error(`Project with id ${data.id} not found`);
      }
      
      if (isDev) {
        console.log('[ProjectStore] Current project entity:', currentProjectEntity);
      }
      
      // Build props object from current entity using getters
      const projectProps = {
        id: currentProjectEntity.id,
        code: currentProjectEntity.code,
        name: currentProjectEntity.name,
        year: currentProjectEntity.year,
        clientId: currentProjectEntity.clientId,
        type: currentProjectEntity.type,
        coordinates: currentProjectEntity.coordinates,
        contractDate: currentProjectEntity.contractDate,
        deliveryDate: currentProjectEntity.deliveryDate,
        status: currentProjectEntity.status,
        dropboxFolderId: currentProjectEntity.dropboxFolderId,
        specialUserIds: currentProjectEntity.specialUserIds,
        createdAt: currentProjectEntity.createdAt,
        updatedAt: currentProjectEntity.updatedAt,
        finalizedAt: currentProjectEntity.finalizedAt,
      };
      
      // Convert coordinateX/coordinateY to GeoCoordinates if provided
      let updatedCoordinates = projectProps.coordinates;
      if (data.coordinateX !== undefined || data.coordinateY !== undefined) {
        const x = data.coordinateX;
        const y = data.coordinateY;
        
        if (x !== undefined && y !== undefined && x !== null && y !== null) {
          // Both coordinates provided and not null - create new GeoCoordinates
          updatedCoordinates = new GeoCoordinates(y, x);
        } else if (x === null && y === null) {
          // Explicitly set to null - remove coordinates
          updatedCoordinates = null;
        }
        // If only one is provided, keep existing coordinates
      }
      
      // Merge with update data (excluding coordinateX/coordinateY as they're now in coordinates)
      const {coordinateX, coordinateY, storageFolderId, ...restData} = data;
      if (isDev) {
        console.log('[ProjectStore] restData after destructuring:', restData);
        console.log('[ProjectStore] restData.contractDate:', restData.contractDate);
        console.log('[ProjectStore] restData.deliveryDate:', restData.deliveryDate);
        console.log('[ProjectStore] updatedCoordinates:', updatedCoordinates);
      }
      
      const updatedProps = {
        ...projectProps,
        ...restData,
        coordinates: updatedCoordinates,
        dropboxFolderId:
          storageFolderId !== undefined ? storageFolderId : projectProps.dropboxFolderId,
        id: data.id, // Ensure ID is preserved
      };
      
      if (isDev) {
        console.log('[ProjectStore] Merged props for new Project:', updatedProps);
        console.log('[ProjectStore] updatedProps.name:', updatedProps.name);
        console.log('[ProjectStore] updatedProps.status:', updatedProps.status);
        console.log('[ProjectStore] updatedProps.contractDate:', updatedProps.contractDate);
        console.log('[ProjectStore] updatedProps.coordinates:', updatedProps.coordinates);
      }
      
      const updatedProject = new Project(updatedProps);
      if (isDev) {
        console.log('[ProjectStore] Updated project object:', updatedProject);
      }

      // Save to backend
      if (isDev) {
        console.log('[ProjectStore] Sending update to backend...');
      }
      const savedProject = await projectRepository.update(updatedProject);
      if (isDev) {
        console.log('[ProjectStore] Backend response:', savedProject);
      }
      
      // Update local state
      const index = projects.value.findIndex(p => p.id === data.id);
      if (isDev) {
        console.log(`[ProjectStore] Updating local state at index ${index}...`);
      }
      if (index !== -1) {
        projects.value[index] = await mapProjectToSummaryDto(savedProject);
        if (isDev) {
          console.log('[ProjectStore] Local state updated');
        }
      }
      
      // Update current project if it's the one being edited
      if (currentProject.value?.project.id === data.id) {
        if (isDev) {
          console.log('[ProjectStore] Refreshing current project view...');
        }
        await fetchProjectById(data.id);
      }
      
      if (isDev) {
        console.log('✅ [ProjectStore] Project updated successfully');
      }
      return true;
    } catch (err: any) {
      if (isDev) {
        console.error('❌ [ProjectStore] Error updating project:', err);
        console.error('[ProjectStore] Error details:', {
          message: err.message,
          stack: err.stack,
          data: data
        });
      }
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
    if (!authStore.userId) {
      if (isDev) {
        console.error('Cannot delete project: User not authenticated');
      }
      error.value = 'User not authenticated';
      return false;
    }

    try {
      if (isDev) {
        console.log(`[ProjectStore] Deleting project ${projectId}...`);
      }
      
      await projectRepository.delete(projectId);
      if (isDev) {
        console.log(`[ProjectStore] Project ${projectId} deleted from backend`);
      }
      
      const index = projects.value.findIndex(p => p.id === projectId);
      if (index !== -1) {
        projects.value.splice(index, 1);
        pagination.value.total--;
        if (isDev) {
          console.log(`[ProjectStore] Project removed from local state (index: ${index})`);
        }
      } else {
        if (isDev) {
          console.warn(`[ProjectStore] Project ${projectId} not found in local state`);
        }
      }
      
      if (currentProjectId.value === projectId) {
        currentProject.value = null;
        if (isDev) {
          console.log(`[ProjectStore] Cleared current project`);
        }
      }
      
      error.value = null;
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete project';
      if (isDev) {
        console.error(`[ProjectStore] Error deleting project:`, err);
      }
      error.value = errorMessage;
      return false;
    }
  }

  /**
   * Finalizes a project (admin only)
   */
  async function finalizeProject(projectId: string): Promise<boolean> {
    if (isDev) {
      console.log(`[ProjectStore] Attempting to finalize project: ${projectId}`);
    }
    
    if (!authStore.userId) {
      if (isDev) {
        console.error('[ProjectStore] Cannot finalize - user not authenticated');
      }
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await updateProject({
        id: projectId,
        status: ProjectStatus.FINALIZED,
      } as UpdateProjectDto);
      
      if (result) {
        if (isDev) {
          console.log(`✅ [ProjectStore] Project ${projectId} finalized successfully`);
        }
      } else {
        if (isDev) {
          console.error(`❌ [ProjectStore] Failed to finalize project ${projectId}`);
        }
      }
      
      return result;
    } catch (err: any) {
      if (isDev) {
        console.error('[ProjectStore] Exception while finalizing project:', err);
      }
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
    
    const existingCurrentProject = currentProject.value;
    if (existingCurrentProject && existingCurrentProject.project.id === payload.id) {
      currentProject.value = {
        ...existingCurrentProject,
        project: {...existingCurrentProject.project, ...payload},
      };
    }
  }

  /**
   * Handles real-time project finalized event
   */
  function handleProjectFinalized(payload: {projectId: string}): void {
    const index = projects.value.findIndex(p => p.id === payload.projectId);
    if (index !== -1) {
      projects.value[index] = {
        ...projects.value[index],
        status: ProjectStatus.FINALIZED,
        statusColor: 'gray',
      };
    }
    
    const existingCurrentProject = currentProject.value;
    if (existingCurrentProject && existingCurrentProject.project.id === payload.projectId) {
      currentProject.value = {
        ...existingCurrentProject,
        project: {...existingCurrentProject.project, status: ProjectStatus.FINALIZED},
      };
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

  /**
   * Updates task statistics for the currently loaded project.
   *
   * Task stats are readonly in DTOs, so we replace the currentProject object
   * instead of mutating nested properties.
   */
  function setCurrentProjectTaskStats(projectId: string, taskStats: TaskStatsDto): void {
    const existing = currentProject.value;
    if (!existing || existing.project.id !== projectId) {
      return;
    }

    currentProject.value = {
      ...existing,
      taskStats,
    };
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
    setCurrentProjectTaskStats,
    clearCurrentProject,
    clearError,
  };
});
