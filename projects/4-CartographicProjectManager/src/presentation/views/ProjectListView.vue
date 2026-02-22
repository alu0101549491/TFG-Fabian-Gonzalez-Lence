<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering  
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since 2025-01-08
  @file src/presentation/views/ProjectListView.vue
  @desc Project list view displaying all accessible projects with comprehensive
        filtering, sorting, search capabilities, and CRUD operations.
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://vuejs.org/guide/components/registration.html}
-->

<template>
  <div class="project-list-view">
    <LoadingSpinner v-if="isLoading" />

    <template v-else>
      <!-- Header with title and actions -->
      <header class="list-header">
        <div class="header-content">
          <h1>Projects</h1>
          <p class="list-subtitle">Manage and organize all your cartographic projects</p>
        </div>
        <button
          v-if="canCreateProject"
          @click="showCreateModal = true"
          class="button-primary"
          aria-label="Create new project"
        >
          + New Project
        </button>
      </header>

      <!-- Search and filters bar -->
      <section class="filters-section" aria-label="Project filters">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by code, name, or client..."
            class="search-input"
            aria-label="Search projects"
          />
        </div>

        <div class="filters-group">
          <select
            v-model="statusFilter"
            class="filter-select"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="finalized">Finalized</option>
          </select>

          <select
            v-model="typeFilter"
            class="filter-select"
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            <option value="TOPOGRAPHY">Topography</option>
            <option value="CARTOGRAPHY">Cartography</option>
            <option value="GIS">GIS</option>
            <option value="CADASTRE">Cadastre</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            v-model="sortBy"
            class="filter-select"
            aria-label="Sort projects"
          >
            <option value="updatedAt">Recently Updated</option>
            <option value="createdAt">Recently Created</option>
            <option value="deliveryDate">Delivery Date</option>
            <option value="code">Code (A-Z)</option>
            <option value="name">Name (A-Z)</option>
          </select>

          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="button-ghost button-sm"
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        </div>
      </section>

      <!-- Stats summary -->
      <section class="stats-bar" aria-label="Project statistics">
        <div class="stat-item">
          <span class="stat-label">Showing</span>
          <span class="stat-value">{{ filteredProjects.length }}</span>
          <span class="stat-label">of {{ projects.length }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">Active:</span>
          <span class="stat-value stat-active">{{ activeCount }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">Finalized:</span>
          <span class="stat-value stat-finalized">{{ finalizedCount }}</span>
        </div>
      </section>

      <!-- Project grid -->
      <div v-if="filteredProjects.length > 0" class="projects-grid">
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          :show-actions="canManageProjects"
          @click="goToProject(project.id)"
          @edit="handleEditProject"
          @delete="handleDeleteStart"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-icon">📁</div>
        <h2>{{ emptyStateTitle }}</h2>
        <p>{{ emptyStateMessage }}</p>
        <button
          v-if="canCreateProject && !hasActiveFilters"
          @click="showCreateModal = true"
          class="button-primary"
        >
          Create Your First Project
        </button>
        <button
          v-else-if="hasActiveFilters"
          @click="clearFilters"
          class="button-secondary"
        >
          Clear Filters
        </button>
      </div>

      <!-- Create/Edit Project Modal -->
      <Teleport to="body">
        <div
          v-if="showCreateModal || showEditModal"
          class="modal-overlay"
          @click.self="closeModals"
        >
          <div class="modal-content" role="dialog" :aria-labelledby="modalTitle">
            <div class="modal-header">
              <h2 :id="modalTitle">
                {{ showEditModal ? 'Edit Project' : 'Create New Project' }}
              </h2>
              <button
                @click="closeModals"
                class="button-icon"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div class="modal-body">
              <ProjectForm
                :project="editingProject ?? undefined"
                :clients="clients"
                @submit="handleProjectSubmit"
                @cancel="closeModals"
              />
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Delete Confirmation Modal -->
      <Teleport to="body">
        <div
          v-if="showDeleteModal"
          class="modal-overlay"
          @click.self="showDeleteModal = false"
        >
          <div class="modal-content modal-small" role="dialog" aria-labelledby="delete-title">
            <div class="modal-header">
              <h2 id="delete-title">Confirm Delete</h2>
              <button
                @click="showDeleteModal = false"
                class="button-icon"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete project <strong>{{ projectToDelete?.code }}</strong>?</p>
              <p class="text-muted">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button
                @click="showDeleteModal = false"
                class="button-ghost"
              >
                Cancel
              </button>
              <button
                @click="handleDeleteConfirm"
                class="button-danger"
                :disabled="isDeleting"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete Project' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useAuth} from '../composables/use-auth';
import {useProjects} from '../composables/use-projects';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import ProjectCard from '../components/project/ProjectCard.vue';
import ProjectForm from '../components/project/ProjectForm.vue';
import type {ProjectSummaryDto, CreateProjectDto, UpdateProjectDto} from '@/application/dto';
import {UserRepository} from '@/infrastructure/repositories/user.repository';
import {UserRole} from '@/domain/enumerations/user-role';

// Composables
const router = useRouter();
const {canCreateProject, canManageProjects, isAuthenticated} = useAuth();
const {
  projects,
  activeProjects,
  finalizedProjects,
  isLoading,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} = useProjects();

// Local State
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');
const sortBy = ref<'updatedAt' | 'createdAt' | 'deliveryDate' | 'code' | 'name'>('updatedAt');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingProject = ref<ProjectSummaryDto | null>(null);
const projectToDelete = ref<ProjectSummaryDto | null>(null);
const isDeleting = ref(false);
const clients = ref<Array<{id: string; name: string}>>([]);

// Computed Properties
const activeCount = computed(() => activeProjects.value.length);
const finalizedCount = computed(() => finalizedProjects.value.length);

const hasActiveFilters = computed(
  () => searchQuery.value.trim() !== '' || statusFilter.value !== '' || typeFilter.value !== ''
);

const modalTitle = computed(() =>
  showEditModal.value ? 'edit-project-title' : 'create-project-title'
);

const filteredProjects = computed(() => {
  let result = [...projects.value];

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.code.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.clientName?.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter.value) {
    result = result.filter((p) => p.status === statusFilter.value);
  }

  // Type filter
  if (typeFilter.value) {
    result = result.filter((p) => p.type === typeFilter.value);
  }

  // Sort
  result.sort((a, b) => {
    if (sortBy.value === 'code') {
      return a.code.localeCompare(b.code);
    }
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy.value === 'deliveryDate') {
      return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
    }
    if (sortBy.value === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // updatedAt (default)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return result;
});

const emptyStateTitle = computed(() => {
  if (hasActiveFilters.value) {
    return 'No projects match your filters';
  }
  return 'No projects yet';
});

const emptyStateMessage = computed(() => {
  if (hasActiveFilters.value) {
    return 'Try adjusting your search or filters to find what you\'re looking for.';
  }
  return 'Create your first project to get started managing your cartographic work.';
});

// Methods
/**
 * Fetch available clients for project assignment
 */
async function fetchClients(): Promise<void> {
  // Skip if user is not authenticated (e.g., during logout)
  if (!isAuthenticated.value) {
    console.log('Skipping client fetch - user not authenticated');
    return;
  }
  
  try {
    const userRepository = new UserRepository();
    const clientUsers = await userRepository.findByRole(UserRole.CLIENT);
    clients.value = clientUsers.map(u => ({id: u.id, name: u.username}));
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    clients.value = [];
  }
}

/**
 * Navigate to project details page
 *
 * @param {string} projectId - Project identifier
 */
function goToProject(projectId: string): void {
  router.push({name: 'project-details', params: {id: projectId}});
}

/**
 * Clear all active filters
 */
function clearFilters(): void {
  searchQuery.value = '';
  statusFilter.value = '';
  typeFilter.value = '';
  sortBy.value = 'updatedAt';
}

/**
 * Close all modals and reset state
 */
function closeModals(): void {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingProject.value = null;
}

/**
 * Handle edit project action
 *
 * @param {ProjectSummaryDto} project - Project to edit
 */
function handleEditProject(project: ProjectSummaryDto): void {
  editingProject.value = project;
  showEditModal.value = true;
}

/**
 * Handle project form submission (create or update)
 *
 * @param {CreateProjectDto | UpdateProjectDto} projectData - Project data
 */
async function handleProjectSubmit(
  projectData: CreateProjectDto | UpdateProjectDto
): Promise<void> {
  try {
    if (showEditModal.value && editingProject.value) {
      const updateData: UpdateProjectDto = {
        id: editingProject.value.id,
        ...projectData,
      };
      await updateProject(updateData);
    } else {
      const result = await createProject(projectData as CreateProjectDto);
      if (result?.success && result.project?.id) {
        goToProject(result.project.id);
        return;
      }
    }
    closeModals();
  } catch (error) {
    console.error('Failed to save project:', error);
  }
}

/**
 * Start delete project flow
 *
 * @param {ProjectSummaryDto} project - Project to delete
 */
function handleDeleteStart(project: ProjectSummaryDto): void {
  projectToDelete.value = project;
  showDeleteModal.value = true;
}

/**
 * Confirm and execute project deletion
 */
async function handleDeleteConfirm(): Promise<void> {
  if (!projectToDelete.value) return;

  isDeleting.value = true;
  try {
    await deleteProject(projectToDelete.value.id);
    showDeleteModal.value = false;
    projectToDelete.value = null;
  } catch (error) {
    console.error('Failed to delete project:', error);
  } finally {
    isDeleting.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  // Skip data loading if user is not authenticated (e.g., during logout)
  if (!isAuthenticated.value) {
    console.log('Skipping project list load - user not authenticated');
    return;
  }
  
  try {
    await Promise.all([
      fetchProjects(),
      fetchClients(),
    ]);
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
});
</script>

<style scoped>
.project-list-view {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-6);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
  gap: var(--spacing-4);
}

.header-content h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}

.list-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-5);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: var(--transition-all);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.filters-group {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.filter-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: var(--transition-all);
}

.filter-select:hover {
  border-color: var(--color-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-6);
  font-size: var(--font-size-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.stat-label {
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.stat-active {
  color: var(--color-success);
}

.stat-finalized {
  color: var(--color-text-muted);
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-5);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-16) var(--spacing-6);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
}

.empty-state h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-3);
  color: var(--color-text-primary);
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
}

.modal-content {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small {
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.modal-body {
  padding: var(--spacing-6);
}

.modal-body p {
  margin-bottom: var(--spacing-3);
  line-height: 1.6;
}

.text-muted {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  border-top: 1px solid var(--color-border);
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-list-view {
    padding: var(--spacing-4);
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-section {
    padding: var(--spacing-4);
  }

  .filters-group {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .stats-bar {
    flex-wrap: wrap;
    justify-content: center;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: var(--font-size-2xl);
  }

  .stat-divider {
    display: none;
  }

  .empty-icon {
    font-size: 3rem;
  }
}
</style>
