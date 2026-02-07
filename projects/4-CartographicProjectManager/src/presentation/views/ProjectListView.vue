<!--
  @module presentation/views/ProjectListView
  @description Project list page displaying all accessible projects
  with filtering and sorting capabilities.
  @category Presentation
-->
<template>
  <div class="project-list-view">
    <LoadingSpinner v-if="isLoading" />
    
    <div v-else class="container">
      <!-- Header with title and actions -->
      <div class="list-header">
        <h1>Projects</h1>
        <button 
          v-if="isAdmin" 
          @click="showCreateModal = true" 
          class="btn btn-primary"
        >
          + New Project
        </button>
      </div>

      <!-- Search and filters bar -->
      <div class="filters-bar">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search projects..."
            class="search-input"
          />
        </div>
        
        <div class="filters">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="FINALIZED">Finalized</option>
          </select>

          <select v-model="sortBy" class="filter-select">
            <option value="createdAt">Created Date</option>
            <option value="deadline">Deadline</option>
            <option value="name">Name</option>
          </select>

          <button @click="clearFilters" class="btn btn-ghost btn-sm">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Stats summary -->
      <div class="stats-summary">
        <div class="stat-card">
          <span class="stat-label">Total Projects</span>
          <span class="stat-value">{{ filteredProjects.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Active</span>
          <span class="stat-value">{{ activeCount }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Finalized</span>
          <span class="stat-value">{{ finalizedCount }}</span>
        </div>
      </div>

      <!-- Project grid -->
      <div v-if="sortedProjects.length > 0" class="projects-grid">
        <div
          v-for="project in sortedProjects"
          :key="project.id"
          class="project-card"
          @click="navigateToProject(project.id)"
        >
          <div class="project-header">
            <div class="project-code">{{ project.code }}</div>
            <div 
              class="status-indicator" 
              :class="'status-' + project.status.toLowerCase()"
            ></div>
          </div>
          
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-description">{{ project.description }}</p>
          
          <div class="project-meta">
            <div class="meta-item">
              <span class="meta-label">Client:</span>
              <span class="meta-value">{{ project.clientId }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Type:</span>
              <span class="meta-value">{{ formatType(project.type) }}</span>
            </div>
          </div>

          <div v-if="project.deadline" class="project-deadline">
            <span :class="{'deadline-near': isNearDeadline(project.deadline)}">
              📅 {{ formatDate(project.deadline) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <p>{{ searchQuery ? 'No projects match your search.' : 'No projects yet.' }}</p>
        <button 
          v-if="isAdmin && !searchQuery" 
          @click="showCreateModal = true" 
          class="btn btn-primary"
        >
          Create First Project
        </button>
      </div>
    </div>

    <!-- Create Project Modal (simplified inline) -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Create New Project</h2>
          <button @click="showCreateModal = false" class="close-btn">✕</button>
        </div>
        <form @submit.prevent="handleCreateProject" class="project-form">
          <div class="form-group">
            <label>Project Name *</label>
            <input v-model="newProject.name" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newProject.description" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Client ID *</label>
            <input v-model="newProject.clientId" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Type *</label>
            <select v-model="newProject.type" required class="form-input">
              <option value="TOPOGRAPHY">Topography</option>
              <option value="CARTOGRAPHY">Cartography</option>
              <option value="GIS">GIS</option>
              <option value="CADASTRE">Cadastre</option>
            </select>
          </div>
          <div class="form-group">
            <label>Deadline</label>
            <input v-model="newProject.deadline" type="date" class="form-input" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjects } from '../composables/use-projects';
import { useAuth } from '../composables/use-auth';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';

const router = useRouter();
const { isAdmin } = useAuth();
const { 
  projects, 
  filteredProjects,
  activeProjects, 
  finalizedProjects,
  isLoading, 
  loadProjects,
  createProject,
  search,
  setStatusFilter,
  clearFilters: clearProjectFilters,
} = useProjects();

const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref<'createdAt' | 'deadline' | 'name'>('createdAt');
const showCreateModal = ref(false);

const newProject = ref({
  name: '',
  description: '',
  clientId: '',
  type: 'TOPOGRAPHY' as any,
  deadline: '',
});

// Computed
const activeCount = computed(() => activeProjects.value.length);
const finalizedCount = computed(() => finalizedProjects.value.length);

const sortedProjects = computed(() => {
  const filtered = [...filteredProjects.value];
  
  return filtered.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy.value === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    // Default: createdAt (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

// Methods
function clearFilters() {
  searchQuery.value = '';
  statusFilter.value = '';
  sortBy.value = 'createdAt';
  clearProjectFilters();
}

function navigateToProject(projectId: string) {
  router.push(`/projects/${projectId}`);
}

function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatType(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function isNearDeadline(deadline: Date | string): boolean {
  const daysUntil = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return daysUntil <= 7 && daysUntil >= 0;
}

async function handleCreateProject() {
  try {
    const projectData = {
      ...newProject.value,
      deadline: newProject.value.deadline ? new Date(newProject.value.deadline) : null,
    };
    await createProject(projectData);
    showCreateModal.value = false;
    newProject.value = {
      name: '',
      description: '',
      clientId: '',
      type: 'TOPOGRAPHY',
      deadline: '',
    };
  } catch (err) {
    console.error('Failed to create project:', err);
  }
}

// Watchers for filters
import { watch } from 'vue';
watch(searchQuery, (value) => {
  search(value);
});

watch(statusFilter, (value) => {
  setStatusFilter(value || null);
});

// Lifecycle
onMounted(async () => {
  await loadProjects();
});
</script>

<style scoped>
.project-list-view {
  min-height: 100vh;
  background: var(--color-bg-secondary);
  padding: var(--spacing-8) 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.list-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.filters-bar {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.filters {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.filter-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: white;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.stat-card {
  background: white;
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-6);
}

.project-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: var(--transition-normal);
  border-left: 4px solid var(--color-border);
}

.project-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.project-code {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.status-active {
  background: var(--color-success);
}

.status-indicator.status-finalized {
  background: var(--color-text-tertiary);
}

.project-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2);
  color: var(--color-text-primary);
}

.project-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-4);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
  font-size: var(--font-size-sm);
}

.meta-item {
  display: flex;
  gap: var(--spacing-2);
}

.meta-label {
  color: var(--color-text-tertiary);
}

.meta-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.project-deadline {
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.deadline-near {
  color: var(--color-warning);
  font-weight: var(--font-weight-semibold);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12) var(--spacing-4);
}

.empty-state p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  cursor: pointer;
  padding: var(--spacing-2);
}

.project-form {
  padding: var(--spacing-6);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.form-input {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  margin-top: var(--spacing-6);
}

@media (max-width: 767px) {
  .filters-bar {
    flex-direction: column;
  }
  
  .filters {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
