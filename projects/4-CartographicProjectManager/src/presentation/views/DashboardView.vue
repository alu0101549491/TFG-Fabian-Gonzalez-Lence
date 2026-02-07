<!--
  @module presentation/views/DashboardView
  @description Main dashboard view showing project overview,
  calendar summary, and pending notifications.
  Central hub satisfying NFR5 (max 3 clicks to any section).
  @category Presentation
-->
<template>
  <div class="dashboard-view">
    <!-- Dashboard Header -->
    <header class="dashboard-header">
      <div>
        <h1>Active Projects</h1>
        <p class="subtitle">Welcome back! Here's your project overview.</p>
      </div>
      <div class="dashboard-actions">
        <button v-if="canCreateProject" @click="navigateTo('/projects/new')" class="button-primary">
          + New Project
        </button>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search projects..."
          class="search-input"
        />
      </div>
    </header>

    <!-- Statistics Summary (Admin Only) -->
    <section v-if="isAdmin" class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">📁</div>
        <div class="stat-content">
          <div class="stat-value">{{ activeProjects.length }}</div>
          <div class="stat-label">Active Projects</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalPendingTasks }}</div>
          <div class="stat-label">Pending Tasks</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-value">{{ projectsDueThisWeek.length }}</div>
          <div class="stat-label">Due This Week</div>
        </div>
      </div>
    </section>

    <!-- Project List -->
    <section class="project-list">
      <div v-if="isLoading" class="loading">Loading projects...</div>
      
      <div v-else-if="displayedProjects.length > 0" class="project-grid">
        <div
          v-for="project in displayedProjects"
          :key="project.id"
          class="project-card"
          @click="navigateToProject(project.id)"
        >
          <div
            class="status-indicator"
            :style="{backgroundColor: getProjectStatusColor(project)}"
          ></div>

          <div class="project-card-header">
            <h3>{{ project.code }}</h3>
            <p class="project-name">{{ project.name }}</p>
          </div>

          <div class="project-details">
            <div class="detail-item">
              <span>Client:</span>
              <span>{{ project.clientName }}</span>
            </div>
            <div class="detail-item">
              <span>📅 Delivery:</span>
              <span>{{ formatDate(project.deliveryDate) }}</span>
            </div>
          </div>

          <div class="project-card-footer">
            <span v-if="project.pendingTasksCount > 0" class="badge badge-warning">
              ⚠️ {{ project.pendingTasksCount }} tasks
            </span>
            <span v-else class="badge badge-success">
              ✓ All OK
            </span>
            <span v-if="project.unreadMessagesCount > 0" class="badge badge-info">
              💬 {{ project.unreadMessagesCount }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div>📋</div>
        <h2>No Projects Found</h2>
        <p>Create your first project to get started.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useAuth} from '../composables/use-auth';
import {useProjects} from '../composables/use-projects';

const router = useRouter();
const {isAdmin, canCreateProject} = useAuth();
const {
  projects,
  activeProjects,
  projectsDueThisWeek,
  isLoading,
  loadProjects,
  getProjectIndicatorColor,
} = useProjects();

const searchQuery = ref('');

const displayedProjects = computed(() => {
  let filtered = activeProjects.value;
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(p =>
      p.code.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query)
    );
  }
  
  return filtered.sort((a, b) =>
    new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
  );
});

const totalPendingTasks = computed(() =>
  activeProjects.value.reduce((sum, p) => sum + (p.pendingTasksCount || 0), 0)
);

function getProjectStatusColor(project: any): string {
  return getProjectIndicatorColor(project);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function navigateToProject(projectId: string) {
  router.push({name: 'ProjectDetails', params: {id: projectId}});
}

function navigateTo(path: string) {
  router.push(path);
}

onMounted(async () => {
  await loadProjects();
});
</script>

<style scoped>
.dashboard-view {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-6);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.dashboard-actions {
  display: flex;
  gap: var(--spacing-3);
}

.search-input {
  min-width: 250px;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

.stat-card {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-4);
}

.project-card {
  position: relative;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  cursor: pointer;
  transition: var(--transition-all);
}

.project-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.status-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.project-card-header h3 {
  font-family: var(--font-family-mono);
  margin-bottom: var(--spacing-1);
}

.project-name {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.project-details {
  margin: var(--spacing-4) 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.project-card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-16);
  color: var(--color-text-muted);
}

@media (max-width: 767px) {
  .dashboard-header {
    flex-direction: column;
  }

  .dashboard-actions {
    width: 100%;
  }

  .search-input {
    flex: 1;
  }
}
</style>
