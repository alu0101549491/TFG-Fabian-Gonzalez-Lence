<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since 2025-01-08
  @file src/presentation/views/ProjectDetailsView.vue
  @desc Detailed project workspace view with tabbed interface for tasks, messages,
        and files. Provides comprehensive project management functionality.
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://vuejs.org/guide/components/registration.html}
-->

<template>
  <div class="project-details-view">
    <LoadingSpinner v-if="isLoading" />

    <template v-else-if="currentProject">
      <!-- Project Header with Summary -->
      <header class="project-header">
        <button
          @click="goBack"
          class="button-ghost button-icon-left"
          aria-label="Go back to projects list"
        >
          ← Back
        </button>

        <ProjectSummary
          :projectDetails="currentProject"
          :show-actions="canManageProjects"
          @edit="showEditModal = true"
          @finalize="handleFinalize"
        />
      </header>

      <!-- Tab Navigation -->
      <nav class="tabs-nav" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-button', {active: activeTab === tab.key}]"
          :aria-selected="activeTab === tab.key"
          :aria-controls="`${tab.key}-panel`"
          role="tab"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tab.badge > 0" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </nav>

      <!-- Tab Panels -->
      <div class="tab-content">
        <!-- Overview Tab -->
        <section
          v-show="activeTab === 'overview'"
          id="overview-panel"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="overview-tab"
        >
          <div class="overview-grid">
            <!-- Project Information -->
            <div class="info-card">
              <h2>Project Details</h2>
              <dl class="info-list">
                <div class="info-item">
                  <dt>Project Code</dt>
                  <dd class="code-value">{{ currentProject.project.code }}</dd>
                </div>
                <div class="info-item">
                  <dt>Type</dt>
                  <dd>{{ formatProjectType(currentProject.project.type) }}</dd>
                </div>
                <div class="info-item">
                  <dt>Client</dt>
                  <dd>{{ currentProject.project.clientName }}</dd>
                </div>
                <div class="info-item">
                  <dt>Delivery Date</dt>
                  <dd>{{ formatDate(currentProject.project.deliveryDate) }}</dd>
                </div>
                <div class="info-item">
                  <dt>Status</dt>
                  <dd>
                    <span :class="['status-badge', `status-${currentProject.project.status}`]">
                      {{ formatStatus(currentProject.project.status) }}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <!-- Description -->
            <div class="info-card">
              <h2>Description</h2>
              <p class="project-description">
                {{ currentProject.project.description || 'No description provided.' }}
              </p>
            </div>

            <!-- Statistics -->
            <div class="info-card">
              <h2>Statistics</h2>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ taskStats.total }}</div>
                  <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value stat-completed">{{ taskStats.completed }}</div>
                  <div class="stat-label">Completed</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value stat-pending">{{ taskStats.pending }}</div>
                  <div class="stat-label">Pending</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ messageCount }}</div>
                  <div class="stat-label">Messages</div>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="info-card">
              <h2>Recent Activity</h2>
              <TaskHistory :history="currentProject.tasks.slice(0, 5).map(t => ({}))" :loading="isLoading" />
            </div>
          </div>
        </section>

        <!-- Tasks Tab -->
        <section
          v-show="activeTab === 'tasks'"
          id="tasks-panel"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="tasks-tab"
        >
          <div class="panel-header">
            <h2>Tasks</h2>
            <div class="panel-actions">
              <select
                v-model="taskStatusFilter"
                class="filter-select"
                aria-label="Filter tasks by status"
              >
                <option value="">All Tasks</option>
                <option :value="TaskStatus.PENDING">Pending</option>
                <option :value="TaskStatus.COMPLETED">Completed</option>
              </select>
              <button
                v-if="canManageProjects"
                @click="showCreateTaskModal = true"
                class="button-primary button-sm"
              >
                + New Task
              </button>
            </div>
          </div>

          <TaskList
            :tasks="filteredTasks"
            :project-id="currentProject.project.id"
            :show-project-info="false"
            :loading="tasksLoading"
            @task-click="handleTaskClick"
            @task-update="handleTaskUpdate"
            @task-delete="handleTaskDelete"
          />
        </section>

        <!-- Messages Tab -->
        <section
          v-show="activeTab === 'messages'"
          id="messages-panel"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="messages-tab"
        >
          <div class="messages-container">
            <MessageList
              :messages="projectMessages"
              :loading="messagesLoading"
              :current-user-id="currentUserId"
            />
            <MessageInput
              :project-id="currentProject.project.id"
              :disabled="currentProject.project.status === 'finalized'"
              @message-sent="handleMessageSent"
            />
          </div>
        </section>

        <!-- Files Tab -->
        <section
          v-show="activeTab === 'files'"
          id="files-panel"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="files-tab"
        >
          <div class="panel-header">
            <h2>Project Files</h2>
            <p class="panel-subtitle">Upload and manage project documentation</p>
          </div>

          <FileUploader
            v-if="canManageProjects && currentProject.project.status !== 'finalized'"
            :project-id="currentProject.project.id"
            :sections="currentProject.sections.map(s => s.name)"
            :max-file-size="10 * 1024 * 1024"
            :accepted-types="['.pdf', '.dwg', '.dxf', '.shp', '.jpg', '.png']"
            @upload-complete="handleFileUpload"
          />

          <FileList
            :files="projectFiles"
            :loading="filesLoading"
            :show-actions="canManageProjects"
            @download="handleFileDownload"
            @delete="handleFileDelete"
          />
        </section>
      </div>

      <!-- Edit Project Modal -->
      <Teleport to="body">
        <div
          v-if="showEditModal"
          class="modal-overlay"
          @click.self="showEditModal = false"
        >
          <div class="modal-content" role="dialog" aria-labelledby="edit-project-title">
            <div class="modal-header">
              <h2 id="edit-project-title">Edit Project</h2>
              <button
                @click="showEditModal = false"
                class="button-icon"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <ProjectForm
              :project="currentProject.project"
              @submit="(data: any) => handleProjectUpdate(data as UpdateProjectDto)"
              @cancel="showEditModal = false"
            />
          </div>
        </div>
      </Teleport>

      <!-- Create Task Modal -->
      <Teleport to="body">
        <div
          v-if="showCreateTaskModal"
          class="modal-overlay"
          @click.self="showCreateTaskModal = false"
        >
          <div class="modal-content" role="dialog" aria-labelledby="create-task-title">
            <div class="modal-header">
              <h2 id="create-task-title">Create New Task</h2>
              <button
                @click="showCreateTaskModal = false"
                class="button-icon"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <TaskForm
              :project-id="currentProject.project.id"
              :assignees="currentProject.participants.map(p => ({ id: p.userId, name: p.username, role: p.role }))" 
              @submit="handleTaskCreate"
              @cancel="showCreateTaskModal = false"
            />
          </div>
        </div>
      </Teleport>

      <!-- Finalize Confirmation Modal -->
      <Teleport to="body">
        <div
          v-if="showFinalizeModal"
          class="modal-overlay"
          @click.self="showFinalizeModal = false"
        >
          <div class="modal-content modal-small" role="dialog" aria-labelledby="finalize-title">
            <div class="modal-header">
              <h2 id="finalize-title">Finalize Project</h2>
              <button
                @click="showFinalizeModal = false"
                class="button-icon"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to finalize this project?</p>
              <p class="text-warning">
                Once finalized, no further modifications can be made.
              </p>
              <ul class="checklist">
                <li :class="{complete: taskStats.pending === 0}">
                  {{ taskStats.pending === 0 ? '✓' : '○' }} All tasks completed
                </li>
                <li :class="{complete: projectFiles.length > 0}">
                  {{ projectFiles.length > 0 ? '✓' : '○' }} Files uploaded
                </li>
              </ul>
            </div>
            <div class="modal-footer">
              <button
                @click="showFinalizeModal = false"
                class="button-ghost"
              >
                Cancel
              </button>
              <button
                @click="handleFinalizeConfirm"
                class="button-primary"
                :disabled="isFinalizing"
              >
                {{ isFinalizing ? 'Finalizing...' : 'Finalize Project' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>

    <!-- Error State -->
    <div v-else class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Project not found</h2>
      <p>The requested project could not be loaded.</p>
      <button @click="goBack" class="button-primary">
        Go Back
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {useAuth} from '../composables/use-auth';
import {useProjects} from '../composables/use-projects';
import {useTasks} from '../composables/use-tasks';
import {useMessages} from '../composables/use-messages';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import ProjectSummary from '../components/project/ProjectSummary.vue';
import ProjectForm from '../components/project/ProjectForm.vue';
import TaskList from '../components/task/TaskList.vue';
import TaskForm from '../components/task/TaskForm.vue';
import TaskHistory from '../components/task/TaskHistory.vue';
import MessageList from '../components/message/MessageList.vue';
import MessageInput from '../components/message/MessageInput.vue';
import FileList from '../components/file/FileList.vue';
import FileUploader from '../components/file/FileUploader.vue';
import type {UpdateProjectDto, FileSummaryDto} from '@/application/dto';
import {TaskStatus} from '@/domain/enumerations/task-status';
import type {CreateTaskDto, UpdateTaskDto, TaskDto, TaskSummaryDto} from '@/application/dto/task-data.dto';
import type {MessageDto} from '@/application/dto/message-data.dto';

// Composables
const router = useRouter();
const route = useRoute();
const {user, canManageProjects} = useAuth();
const {
  currentProject,
  isLoading,
  loadProject,
  updateProject,
  finalizeProject,
} = useProjects();

const {
  tasks: projectTasks,
  isLoading: tasksLoading,
  loadTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} = useTasks();

const {
  messages: projectMessages,
  isLoading: messagesLoading,
  loadMessagesByProject,
} = useMessages();

// Local State
const activeTab = ref<'tasks' | 'files' | 'messages' | 'overview'>('overview');
const taskStatusFilter = ref('');
const showEditModal = ref(false);
const showCreateTaskModal = ref(false);
const showFinalizeModal = ref(false);
const isFinalizing = ref(false);

// Mock file state (replace with actual file management composable)
const projectFiles = ref<FileSummaryDto[]>([]);
const filesLoading = ref(false);

// Computed Properties
const projectId = computed(() => route.params.id as string);
const currentUserId = computed(() => user.value?.id || '');

const filteredTasks = computed(() => {
  if (!taskStatusFilter.value) return projectTasks.value;
  return projectTasks.value.filter((t) => t.status === taskStatusFilter.value);
});

const taskStats = computed(() => {
  const total = projectTasks.value.length;
  const completed = projectTasks.value.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const pending = total - completed;
  return {total, completed, pending};
});

const messageCount = computed(() => projectMessages.value.length);

const tabs = computed(() => [
  {key: 'overview', label: 'Overview', badge: 0},
  {key: 'tasks', label: 'Tasks', badge: taskStats.value.pending},
  {key: 'messages', label: 'Messages', badge: projectMessages.value.filter((m) => !m.isRead).length},
  {key: 'files', label: 'Files', badge: projectFiles.value.length},
]);

// Methods
/**
 * Navigate back to projects list
 */
function goBack(): void {
  router.push({name: 'ProjectList'});
}

/**
 * Format project type for display
 *
 * @param {string} type - Project type enum
 * @returns {string} Formatted type
 */
function formatProjectType(type: string): string {
  const types: Record<string, string> = {
    TOPOGRAPHY: 'Topography',
    CARTOGRAPHY: 'Cartography',
    GIS: 'GIS',
    CADASTRE: 'Cadastre',
    OTHER: 'Other',
  };
  return types[type] || type;
}

/**
 * Format status for display
 *
 * @param {string} status - Project status
 * @returns {string} Formatted status
 */
function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

/**
 * Format date for display
 *
 * @param {Date | string} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Handle project update
 *
 * @param {UpdateProjectDto} projectData - Updated project data
 */
async function handleProjectUpdate(projectData: UpdateProjectDto): Promise<void> {
  try {
    const updateData: UpdateProjectDto = {
      ...projectData,
      id: projectId.value,
    };
    await updateProject(updateData);
    showEditModal.value = false;
  } catch (error) {
    console.error('Failed to update project:', error);
  }
}

/**
 * Handle finalize button click
 */
function handleFinalize(): void {
  showFinalizeModal.value = true;
}

/**
 * Confirm project finalization
 */
async function handleFinalizeConfirm(): Promise<void> {
  isFinalizing.value = true;
  try {
    await finalizeProject(projectId.value);
    showFinalizeModal.value = false;
  } catch (error) {
    console.error('Failed to finalize project:', error);
  } finally {
    isFinalizing.value = false;
  }
}

/**
 * Handle task creation
 *
 * @param {CreateTaskDto} taskData - New task data
 */
async function handleTaskCreate(taskData: CreateTaskDto): Promise<void> {
  try {
    await createTask(taskData);
    showCreateTaskModal.value = false;
  } catch (error) {
    console.error('Failed to create task:', error);
  }
}

/**
 * Handle task click
 *
 * @param {TaskDto} task - Clicked task
 */
function handleTaskClick(task: TaskDto): void {
  // Could open task details modal or navigate to task page
  console.log('Task clicked:', task);
}

/**
 * Handle task update
 *
 * @param {UpdateTaskDto} taskData - Updated task data
 */
async function handleTaskUpdate(taskData: UpdateTaskDto): Promise<void> {
  try {
    await updateTask(taskData);
  } catch (error) {
    console.error('Failed to update task:', error);
  }
}

/**
 * Handle task deletion
 *
 * @param {string} taskId - Task identifier
 */
async function handleTaskDelete(taskId: string): Promise<void> {
  try {
    await deleteTask(taskId);
  } catch (error) {
    console.error('Failed to delete task:', error);
  }
}

/**
 * Handle message sent
 */
function handleMessageSent(): void {
  // Message is automatically added via composable
}

/**
 * Handle file upload
 *
 * @param {FileSummaryDto} file - Uploaded file metadata
 */
function handleFileUpload(file: FileSummaryDto): void {
  projectFiles.value.push(file);
}

/**
 * Handle file download
 *
 * @param {FileSummaryDto} file - File to download
 */
function handleFileDownload(file: FileSummaryDto): void {
  window.open(file.downloadUrl, '_blank');
}

/**
 * Handle file deletion
 *
 * @param {string} fileId - File identifier
 */
async function handleFileDelete(fileId: string): Promise<void> {
  try {
    projectFiles.value = projectFiles.value.filter((f) => f.id !== fileId);
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
}

// Load initial data
async function loadProjectData(): Promise<void> {
  try {
    await Promise.all([
      loadProject(projectId.value),
      loadTasksByProject(projectId.value),
      loadMessagesByProject(projectId.value),
    ]);
  } catch (error) {
    console.error('Failed to load project data:', error);
  }
}

// Watchers
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadProjectData();
  }
});

watch(() => route.query.tab, (tab) => {
  if (tab && ['overview', 'tasks', 'messages', 'files'].includes(tab as string)) {
    activeTab.value = tab as any;
  }
});

// Lifecycle
onMounted(async () => {
  await loadProjectData();

  // Set initial tab from query param
  if (route.query.tab) {
    const tab = route.query.tab as string;
    if (['overview', 'tasks', 'messages', 'files'].includes(tab)) {
      activeTab.value = tab as any;
    }
  }
});
</script>

<style scoped>
.project-details-view {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-6);
}

.project-header {
  margin-bottom: var(--spacing-6);
}

.project-header .button-ghost {
  margin-bottom: var(--spacing-4);
}

.tabs-nav {
  display: flex;
  gap: var(--spacing-2);
  border-bottom: 2px solid var(--color-border);
  margin-bottom: var(--spacing-6);
  overflow-x: auto;
}

.tab-button {
  padding: var(--spacing-3) var(--spacing-5);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-all);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--color-primary);
  background: var(--color-bg-hover);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--spacing-2);
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
}

.tab-content {
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Overview Tab */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

.info-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.info-card h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-border);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.info-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: var(--spacing-3);
}

.info-item dt {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.info-item dd {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.code-value {
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.status-badge {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.status-active {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.status-finalized {
  background: var(--color-gray-200);
  color: var(--color-gray-700);
}

.project-description {
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-4);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  display: block;
  margin-bottom: var(--spacing-1);
}

.stat-completed {
  color: var(--color-success);
}

.stat-pending {
  color: var(--color-warning);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Panel Header */
.panel-header {
  margin-bottom: var(--spacing-6);
}

.panel-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}

.panel-subtitle {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-4);
}

.panel-actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.filter-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--color-bg-primary);
}

/* Messages Container */
.messages-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Error State */
.error-state {
  text-align: center;
  padding: var(--spacing-16);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-4);
}

.error-state h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-3);
}

.error-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
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
  margin-bottom: var(--spacing-4);
  line-height: 1.6;
}

.text-warning {
  color: var(--color-warning);
  font-weight: var(--font-weight-medium);
}

.checklist {
  list-style: none;
  padding: 0;
  margin-top: var(--spacing-4);
}

.checklist li {
  padding: var(--spacing-2) 0;
  color: var(--color-text-secondary);
}

.checklist li.complete {
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
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
  .project-details-view {
    padding: var(--spacing-4);
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-1);
  }

  .tabs-nav {
    gap: 0;
  }

  .tab-button {
    flex: 1;
    justify-content: center;
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-sm);
  }

  .panel-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    width: 100%;
  }

  .messages-container {
    height: 500px;
  }
}
</style>
