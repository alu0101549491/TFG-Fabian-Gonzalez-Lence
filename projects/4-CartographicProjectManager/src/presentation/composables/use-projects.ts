/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/composables/use-projects.ts
 * @desc Composable for project management with CRUD, filtering, and calendar
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://vuejs.org/guide/reusability/composables.html}
 */

import {computed, ref, type ComputedRef, type Ref} from 'vue';
import {useProjectStore} from '../stores/project.store';
import {useAuth} from './use-auth';
import type {
  ProjectSummaryDto,
  ProjectDetailsDto,
  ProjectFilterDto,
  CreateProjectDto,
  UpdateProjectDto,
  CalendarProjectDto,
} from '../../application/dto';
import {getProjectStatusColor as getStatusColor} from '../../shared/utils';

/**
 * Result of project creation
 */
export interface CreateProjectResult {
  /** Whether operation was successful */
  success: boolean;
  /** Created project ID if successful */
  projectId?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Result of project update
 */
export interface UpdateProjectResult {
  /** Whether operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Result of project deletion
 */
export interface DeleteProjectResult {
  /** Whether operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Return interface for useProjects composable
 */
export interface UseProjectsReturn {
  // Lists
  projects: ComputedRef<ProjectSummaryDto[]>;
  activeProjects: ComputedRef<ProjectSummaryDto[]>;
  finalizedProjects: ComputedRef<ProjectSummaryDto[]>;
  overdueProjects: ComputedRef<ProjectSummaryDto[]>;
  calendarProjects: ComputedRef<CalendarProjectDto[]>;
  filteredProjects: ComputedRef<ProjectSummaryDto[]>;
  projectsDueThisWeek: ComputedRef<ProjectSummaryDto[]>;

  // Current Project
  currentProject: ComputedRef<ProjectDetailsDto | null>;
  currentProjectId: ComputedRef<string | null>;
  hasCurrentProject: ComputedRef<boolean>;

  // Filters
  filters: Ref<ProjectFilterDto>;

  // Status
  isLoading: ComputedRef<boolean>;
  isLoadingDetails: ComputedRef<boolean>;
  error: ComputedRef<string | null>;

  // List Actions
  fetchProjects: (filters?: ProjectFilterDto) => Promise<void>;
  refreshProjects: () => Promise<void>;
  setFilters: (filters: Partial<ProjectFilterDto>) => void;
  resetFilters: () => void;

  // CRUD Actions
  createProject: (data: CreateProjectDto) => Promise<CreateProjectResult>;
  updateProject: (data: UpdateProjectDto) => Promise<UpdateProjectResult>;
  deleteProject: (projectId: string) => Promise<DeleteProjectResult>;
  finalizeProject: (projectId: string) => Promise<boolean>;

  // Current Project Actions
  loadProject: (projectId: string) => Promise<void>;
  refreshCurrentProject: () => Promise<void>;
  clearCurrentProject: () => void;

  // Calendar Actions
  loadCalendarProjects: (startDate: Date, endDate: Date) => Promise<void>;

  // Utilities
  getProjectById: (projectId: string) => ProjectSummaryDto | undefined;
  getProjectStatusColor: (project: ProjectSummaryDto) => string;
  clearError: () => void;
}

/**
 * Composable for project management
 *
 * Provides reactive project data, CRUD operations, filtering,
 * sorting, calendar view support, and project utilities.
 *
 * @returns Project state and methods
 *
 * @example
 * ```vue
 * <script setup>
 * import { useProjects } from '@/presentation/composables';
 *
 * const {
 *   projects,
 *   isLoading,
 *   fetchProjects,
 *   createProject
 * } = useProjects();
 *
 * onMounted(() => {
 *   fetchProjects();
 * });
 * </script>
 * ```
 */
export function useProjects(): UseProjectsReturn {
  const store = useProjectStore();
  const {isAdmin, isSpecialUser} = useAuth();

  // Local filter state
  const filters = ref<ProjectFilterDto>({});

  // Computed from store
  const projects = computed(() => store.projects);
  const activeProjects = computed(() => store.activeProjects);
  const finalizedProjects = computed(() => store.finalizedProjects);
  const overdueProjects = computed(() => store.overdueProjects);
  const calendarProjects = computed(() => store.calendarProjects);
  const filteredProjects = computed(() => store.filteredProjects);
  const projectsDueThisWeek = computed(() => store.projectsDueThisWeek);

  const currentProject = computed(() => store.currentProject);
  const currentProjectId = computed(() => store.currentProjectId);
  const hasCurrentProject = computed(() => store.hasCurrentProject);

  const isLoading = computed(() => store.isLoading);
  const isLoadingDetails = computed(() => store.isLoadingDetails);
  const error = computed(() => store.error);

  /**
   * Fetches projects with optional filters
   *
   * @param newFilters - Optional filter criteria
   */
  async function fetchProjects(newFilters?: ProjectFilterDto): Promise<void> {
    if (newFilters) {
      filters.value = {...filters.value, ...newFilters};
    }
    await store.fetchProjects(filters.value);
  }

  /**
   * Refreshes projects with current filters
   */
  async function refreshProjects(): Promise<void> {
    await store.fetchProjects(filters.value);
  }

  /**
   * Updates filter criteria and refetches projects
   *
   * @param newFilters - Partial filter updates
   */
  function setFilters(newFilters: Partial<ProjectFilterDto>): void {
    filters.value = {...filters.value, ...newFilters};
    store.setFilters(filters.value);
  }

  /**
   * Clears all filters and refetches projects
   */
  function resetFilters(): void {
    filters.value = {};
    store.resetFilters();
  }

  /**
   * Creates a new project
   *
   * @param data - Project creation data
   * @returns Result with created project or error
   */
  async function createProject(data: CreateProjectDto): Promise<CreateProjectResult> {
    // UX-only guard: the backend must still enforce authorization.
    if (!isAdmin.value && !isSpecialUser.value) {
      return {success: false, error: 'Only administrators and special users can create projects'};
    }

    const projectId = await store.createProject(data);

    if (projectId) {
      return {success: true, projectId};
    }

    return {success: false, error: store.error ?? 'Failed to create project'};
  }

  /**
   * Updates an existing project
   *
   * @param data - Project update data
   * @returns Result with updated project or error
   */
  async function updateProject(data: UpdateProjectDto): Promise<UpdateProjectResult> {
    const success = await store.updateProject(data);

    if (success) {
      return {success: true};
    }

    return {success: false, error: store.error ?? 'Failed to update project'};
  }

  /**
   * Deletes a project
   *
   * @param projectId - Project unique identifier
   * @returns Result with success status
   */
  async function deleteProject(projectId: string): Promise<DeleteProjectResult> {
    const success = await store.deleteProject(projectId);

    if (success) {
      return {success: true};
    }

    return {success: false, error: store.error ?? 'Failed to delete project'};
  }

  /**
   * Finalizes a project (marks as completed)
   *
   * @param projectId - Project unique identifier
   * @returns True if finalized successfully
   */
  async function finalizeProject(projectId: string): Promise<boolean> {
    return store.finalizeProject(projectId);
  }

  /**
   * Loads details for a specific project
   *
   * @param projectId - Project unique identifier
   */
  async function loadProject(projectId: string): Promise<void> {
    await store.fetchProjectById(projectId);
  }

  /**
   * Refreshes the current project details
   */
  async function refreshCurrentProject(): Promise<void> {
    await store.refreshCurrentProject();
  }

  /**
   * Clears the current project selection
   */
  function clearCurrentProject(): void {
    store.clearCurrentProject();
  }

  /**
   * Loads projects for calendar view in a date range
   *
   * @param startDate - Range start date
   * @param endDate - Range end date
   */
  async function loadCalendarProjects(startDate: Date, endDate: Date): Promise<void> {
    await store.fetchCalendarProjects(startDate, endDate);
  }

  /**
   * Finds a project by ID in the current list
   *
   * @param projectId - Project unique identifier
   * @returns Project summary or undefined if not found
   */
  function getProjectById(projectId: string): ProjectSummaryDto | undefined {
    return projects.value.find((p) => p.id === projectId);
  }

  /**
   * Gets the status indicator color for a project
   *
   * @param project - Project summary
   * @returns CSS color value or variable
   */
  function getProjectStatusColor(project: ProjectSummaryDto): string {
    return getStatusColor(project.status, project.hasPendingTasks);
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    store.clearError();
  }

  return {
    // Lists
    projects,
    activeProjects,
    finalizedProjects,
    overdueProjects,
    calendarProjects,
    filteredProjects,
    projectsDueThisWeek,

    // Current Project
    currentProject,
    currentProjectId,
    hasCurrentProject,

    // Filters
    filters,

    // Status
    isLoading,
    isLoadingDetails,
    error,

    // List Actions
    fetchProjects,
    refreshProjects,
    setFilters,
    resetFilters,

    // CRUD Actions
    createProject,
    updateProject,
    deleteProject,
    finalizeProject,

    // Current Project Actions
    loadProject,
    refreshCurrentProject,
    clearCurrentProject,

    // Calendar Actions
    loadCalendarProjects,

    // Utilities
    getProjectById,
    getProjectStatusColor,
    clearError,
  };
}
