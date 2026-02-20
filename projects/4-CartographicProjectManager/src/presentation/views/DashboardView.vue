<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since 2025-01-08
  @file src/presentation/views/DashboardView.vue
  @desc Main dashboard view showing comprehensive project overview with statistics,
        recent projects, upcoming deadlines, notifications, and calendar widget.
        Serves as the central hub for all application functionality.
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://vuejs.org/guide/components/registration.html}
-->

<template>
  <div class="dashboard-view">
    <LoadingSpinner v-if="isLoading" />

    <template v-else>
      <!-- Dashboard Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Dashboard</h1>
          <p class="dashboard-subtitle">Welcome back! Here's your project overview</p>
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

      <!-- Statistics Summary -->
      <section class="dashboard-stats" aria-label="Project statistics">
        <div class="stat-card">
          <div class="stat-icon" role="img" aria-label="Projects">📁</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalProjects }}</div>
            <div class="stat-label">Active Projects</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" role="img" aria-label="Tasks">✓</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingTasks }}</div>
            <div class="stat-label">Pending Tasks</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" role="img" aria-label="Messages">💬</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.unreadMessages }}</div>
            <div class="stat-label">Unread Messages</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" role="img" aria-label="Overdue">⚠️</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.overdueProjects }}</div>
            <div class="stat-label">Overdue Projects</div>
          </div>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- Recent Projects -->
        <section class="dashboard-section recent-projects">
          <div class="section-header">
            <h2>Recent Projects</h2>
            <router-link to="/projects" class="link-primary">
              View all →
            </router-link>
          </div>

          <div v-if="recentProjects.length > 0" class="project-list">
            <ProjectCard
              v-for="project in recentProjects"
              :key="project.id"
              :project="project"
              @click="goToProject(project.id)"
            />
          </div>

          <div v-else class="empty-state">
            <p>No active projects</p>
            <button
              v-if="canCreateProject"
              @click="showCreateModal = true"
              class="button-secondary"
            >
              Create your first project
            </button>
          </div>
        </section>

        <!-- Upcoming Deadlines -->
        <section class="dashboard-section upcoming-deadlines">
          <div class="section-header">
            <h2>Upcoming Deadlines</h2>
            <router-link to="/calendar" class="link-primary">
              View calendar →
            </router-link>
          </div>

          <div v-if="upcomingDeadlines.length > 0" class="deadline-list">
            <div
              v-for="project in upcomingDeadlines"
              :key="project.id"
              class="deadline-item"
              @click="goToProject(project.id)"
              role="button"
              tabindex="0"
              @keydown.enter="goToProject(project.id)"
            >
              <div
                class="deadline-indicator"
                :class="getDeadlineUrgencyClass(project.deliveryDate)"
                :title="getDeadlineUrgencyLabel(project.deliveryDate)"
              ></div>
              <div class="deadline-content">
                <h3 class="deadline-code">{{ project.code }}</h3>
                <p class="deadline-name">{{ project.name }}</p>
                <p class="deadline-date">
                  <span class="date-icon">📅</span>
                  {{ formatDeadlineDate(project.deliveryDate) }}
                  <span class="deadline-days">
                    ({{ getDaysUntilDeadline(project.deliveryDate) }})
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>No upcoming deadlines</p>
          </div>
        </section>

        <!-- Recent Notifications -->
        <section class="dashboard-section recent-notifications">
          <div class="section-header">
            <h2>Recent Activity</h2>
            <router-link to="/notifications" class="link-primary">
              View all →
            </router-link>
          </div>

          <NotificationList
            :notifications="recentNotifications"
            :unread-count="unreadCount"
            :loading="notificationsLoading"
            :has-more="false"
            :show-filters="false"
            :show-load-more="false"
            :max-items="5"
            @notification-click="handleNotificationClick"
            @mark-read="handleMarkAsRead"
            @mark-all-read="handleMarkAllAsRead"
          />
        </section>

        <!-- Mini Calendar -->
        <section class="dashboard-section mini-calendar">
          <div class="section-header">
            <h2>Calendar</h2>
            <router-link to="/calendar" class="link-primary">
              Full calendar →
            </router-link>
          </div>

          <CalendarWidget
            :projects="calendarProjects"
            :mode="'mini'"
            @project-click="goToProject"
            @month-change="handleMonthChange"
          />
        </section>
      </div>

      <!-- Create Project Modal -->
      <Teleport to="body">
        <div
          v-if="showCreateModal"
          class="modal-overlay"
          @click.self="showCreateModal = false"
        >
          <div class="modal-content" role="dialog" aria-labelledby="create-project-title">
            <div class="modal-header">
              <h2 id="create-project-title">Create New Project</h2>
              <button
                @click="showCreateModal = false"
                class="button-icon"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div class="modal-body">
              <ProjectForm
                :project="null"
                :clients="clients"
                @submit="handleCreateProject"
                @cancel="showCreateModal = false"
              />
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
import {useNotifications} from '../composables/use-notifications';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import ProjectCard from '../components/project/ProjectCard.vue';
import ProjectForm from '../components/project/ProjectForm.vue';
import NotificationList from '../components/notification/NotificationList.vue';
import CalendarWidget from '../components/calendar/CalendarWidget.vue';
import type {CreateProjectDto} from '@/application/dto';
import type {NotificationDto} from '@/application/dto/notification-data.dto';

// Composables
const router = useRouter();
const {canCreateProject} = useAuth();
const {
  projects,
  activeProjects,
  projectsDueThisWeek,
  calendarProjects,
  isLoading,
  fetchProjects,
  createProject,
  loadCalendarProjects,
} = useProjects();

const {
  notifications,
  unreadCount,
  isLoading: notificationsLoading,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = useNotifications();

// Local State
const showCreateModal = ref(false);
const clients = ref<Array<{id: string; name: string}>>([]);

// Computed Properties
const stats = computed(() => ({
  totalProjects: activeProjects.value?.length || 0,
  pendingTasks: activeProjects.value?.reduce(
    (sum, p) => sum + (p.pendingTasksCount || 0),
    0
  ) || 0,
  unreadMessages: unreadCount.value, // Use notification unread count
  overdueProjects: activeProjects.value?.filter((p) => {
    const deliveryDate = new Date(p.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deliveryDate < today && p.status !== 'finalized';
  }).length || 0,
}));

const recentProjects = computed(() =>
  (activeProjects.value ? [...activeProjects.value] : [])
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)
);

const upcomingDeadlines = computed(() =>
  (activeProjects.value ? [...activeProjects.value] : [])
    .filter((p) => {
      const deliveryDate = new Date(p.deliveryDate);
      const today = new Date();
      return deliveryDate >= today;
    })
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    .slice(0, 5)
);

const recentNotifications = computed(() =>
  notifications.value.slice(0, 5)
);

// Methods
/**
 * Navigate to project details page
 *
 * @param {string} projectId - Project identifier
 */
function goToProject(projectId: string): void {
  router.push({name: 'project-details', params: {id: projectId}});
}

/**
 * Format deadline date for display
 *
 * @param {Date} date - Delivery date
 * @returns {string} Formatted date string
 */
function formatDeadlineDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate days until deadline
 *
 * @param {Date} date - Delivery date
 * @returns {string} Human-readable time remaining
 */
function getDaysUntilDeadline(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveryDate = new Date(date);
  deliveryDate.setHours(0, 0, 0, 0);

  const diffTime = deliveryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return '1 day left';
  } else if (diffDays <= 7) {
    return `${diffDays} days left`;
  } else {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} left`;
  }
}

/**
 * Get urgency CSS class for deadline indicator
 *
 * @param {Date} date - Delivery date
 * @returns {string} CSS class name
 */
function getDeadlineUrgencyClass(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveryDate = new Date(date);
  deliveryDate.setHours(0, 0, 0, 0);

  const diffTime = deliveryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'urgency-overdue';
  if (diffDays <= 3) return 'urgency-critical';
  if (diffDays <= 7) return 'urgency-warning';
  return 'urgency-normal';
}

/**
 * Get urgency label for accessibility
 *
 * @param {Date} date - Delivery date
 * @returns {string} Urgency description
 */
function getDeadlineUrgencyLabel(date: Date): string {
  const className = getDeadlineUrgencyClass(date);
  const labels: Record<string, string> = {
    'urgency-overdue': 'Overdue',
    'urgency-critical': 'Critical - Due within 3 days',
    'urgency-warning': 'Warning - Due within 7 days',
    'urgency-normal': 'On track',
  };
  return labels[className] || 'On track';
}

/**
 * Handle notification click - navigate to related content
 *
 * @param {Notification} notification - Clicked notification
 */
function handleNotificationClick(notification: Notification): void {
  if (notification.relatedId) {
    if (notification.type.includes('project')) {
      goToProject(notification.relatedId);
    } else if (notification.type.includes('task')) {
      // Navigate to project and tasks tab
      const project = projects.value.find((p) =>
        p.tasks?.some((t) => t.id === notification.relatedId)
      );
      if (project) {
        router.push({
          name: 'project-details',
          params: {id: project.id},
          query: {tab: 'tasks'},
        });
      }
    } else if (notification.type.includes('message')) {
      // Navigate to project and messages tab
      const project = projects.value.find((p) =>
        p.messages?.some((m) => m.id === notification.relatedId)
      );
      if (project) {
        router.push({
          name: 'project-details',
          params: {id: project.id},
          query: {tab: 'messages'},
        });
      }
    }
  }
}

/**
 * Mark notification as read
 *
 * @param {string} notificationId - Notification identifier
 */
async function handleMarkAsRead(notificationId: string): Promise<void> {
  try {
    await markAsRead(notificationId);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

/**
 * Mark all notifications as read
 */
async function handleMarkAllAsRead(): Promise<void> {
  try {
    await markAllAsRead();
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
}

/**
 * Handle month change in calendar widget
 *
 * @param {Date} date - New month date
 */
async function handleMonthChange(date: Date): Promise<void> {
  try {
    await loadCalendarProjects(date.getFullYear(), date.getMonth() + 1);
  } catch (error) {
    console.error('Failed to load calendar projects:', error);
  }
}

/**
 * Fetch available clients for project assignment
 */
async function fetchClients(): Promise<void> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const clientUsers = await userRepository.findByRole(UserRole.CLIENT);
    // clients.value = clientUsers.map(u => ({id: u.id, name: u.username}));
    
    // Mock data for development
    clients.value = [
      {id: 'client-1', name: 'John Perez'},
      {id: 'client-2', name: 'Maria Garcia'},
      {id: 'client-3', name: 'Carlos Hernandez'},
      {id: 'client-4', name: 'Ana Rodriguez'},
    ];
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    clients.value = [];
  }
}

/**
 * Handle project creation
 *
 * @param {CreateProjectInput} projectData - New project data
 */
async function handleCreateProject(projectData: CreateProjectInput): Promise<void> {
  try {
    const newProject = await createProject(projectData);
    showCreateModal.value = false;
    if (newProject?.id) {
      goToProject(newProject.id);
    }
  } catch (error) {
    console.error('Failed to create project:', error);
  }
}

// Lifecycle
onMounted(async () => {
  try {
    console.log('📊 Loading dashboard data...');
    
    // Get date range for calendar projects (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    await Promise.all([
      fetchProjects().catch(err => {
        console.warn('Failed to fetch projects:', err.message);
        return null;
      }),
      fetchNotifications().catch(err => {
        console.warn('Failed to fetch notifications:', err.message);
        return null;
      }),
      fetchClients(),
      loadCalendarProjects(startOfMonth, endOfMonth).catch(err => {
        console.warn('Failed to load calendar projects:', err.message);
        return null;
      }),
    ]);
    
    console.log('✅ Dashboard data loaded');
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
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
  gap: var(--spacing-4);
}

.header-content h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}

.dashboard-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-all);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-6);
}

.dashboard-section {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.recent-projects {
  grid-column: span 8;
}

.upcoming-deadlines {
  grid-column: span 4;
}

.recent-notifications {
  grid-column: span 6;
}

.mini-calendar {
  grid-column: span 6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-border);
}

.section-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

.deadline-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.deadline-item {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-all);
}

.deadline-item:hover {
  background: var(--color-bg-hover);
  box-shadow: var(--shadow-sm);
}

.deadline-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.deadline-indicator {
  width: 4px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.urgency-overdue {
  background-color: var(--color-error);
}

.urgency-critical {
  background-color: var(--color-warning);
}

.urgency-warning {
  background-color: var(--color-warning-light);
}

.urgency-normal {
  background-color: var(--color-success);
}

.deadline-content {
  flex: 1;
  min-width: 0;
}

.deadline-code {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-1);
}

.deadline-name {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deadline-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.date-icon {
  font-size: var(--font-size-base);
}

.deadline-days {
  color: var(--color-text-muted);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12) var(--spacing-6);
  color: var(--color-text-muted);
}

.empty-state p {
  margin-bottom: var(--spacing-4);
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

/* Responsive Design */
@media (max-width: 1200px) {
  .recent-projects {
    grid-column: span 12;
  }

  .upcoming-deadlines {
    grid-column: span 6;
  }

  .recent-notifications {
    grid-column: span 6;
  }

  .mini-calendar {
    grid-column: span 12;
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: var(--spacing-4);
  }

  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }

  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-section {
    grid-column: span 12 !important;
  }

  .project-list {
    grid-template-columns: 1fr;
  }

  .section-header h2 {
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 480px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: var(--spacing-4);
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-value {
    font-size: var(--font-size-2xl);
  }
}
</style>
