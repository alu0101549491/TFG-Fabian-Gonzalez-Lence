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
          :show-actions="canManageCurrentProject"
          @edit="showEditModal = true"
          @finalize="handleFinalize"
          @delete="handleDeleteStart"
        />
      </header>

      <!-- Tab Navigation -->
      <nav class="tabs-nav" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :id="`${tab.key}-tab`"
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
          ref="overviewPanelRef"
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
              <TaskHistory :history="[]" :loading="false" />
            </div>
          </div>
        </section>

        <!-- Tasks Tab -->
        <section
          ref="tasksPanelRef"
          v-show="activeTab === 'tasks'"
          id="tasks-panel"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="tasks-tab"
        >
          <div
            v-if="isSpecialUser && !canEditTasks"
            class="permission-banner"
            role="alert"
          >
            ⚠ You don't have permission to modify tasks in this project.
          </div>

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
                v-if="canCreateTask"
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
            :show-create-button="canCreateTask"
            :loading="tasksLoading"
            @task-click="handleTaskClick"
            @task-edit="handleTaskEdit"
            @task-update="handleTaskUpdate"
            @task-delete="handleTaskDelete"
            @task-status-change="(taskId, newStatus) => handleStatusChange({ taskId, newStatus })"
            @create="showCreateTaskModal = true"
          />
        </section>

        <!-- Messages Tab -->
        <section
          ref="messagesPanelRef"
          v-show="activeTab === 'messages'"
          id="messages-panel"
          class="tab-panel"
          role="tabpanel"
          aria-labelledby="messages-tab"
        >
          <div ref="messagesContainerRef" class="messages-container">
            <MessageList
              ref="messageListRef"
              :messages="enrichedMessages"
              :loading="messagesLoading"
              :current-user-id="currentUserId"
              @file-click="handleFileDownload"
            />

            <div
              v-if="onlineOtherCount > 0"
              class="presence-indicator"
            >
              Online now: {{ onlineOtherCount }}
            </div>

            <div
              v-if="isSomeoneTyping"
              class="typing-indicator"
            >
              Someone is typing...
            </div>

            <MessageInput
              :disabled="currentProject.project.status === ProjectStatus.FINALIZED || !canSendMessages"
              @send="handleMessageSend"
              @typing="handleTyping"
              @stop-typing="handleStopTyping"
            />

            <div
              v-if="!canSendMessages"
              class="permission-hint"
              role="alert"
            >
              You don't have permission to send messages in this project.
            </div>
          </div>
        </section>

        <!-- Files Tab -->
        <section
          ref="filesPanelRef"
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

          <div
            v-if="currentProject.project.status !== ProjectStatus.FINALIZED && !canUploadFiles"
            class="permission-banner"
            role="alert"
          >
            ⚠ You don't have permission to upload files in this project.
          </div>

          <div
            v-if="!canDownloadFiles"
            class="permission-banner"
            role="alert"
          >
            ⚠ You don't have permission to download files in this project.
          </div>

          <FileUploader
            v-if="canUploadFiles && currentProject.project.status !== ProjectStatus.FINALIZED"
            :project-id="currentProject.project.id"
            :sections="uploadSections"
            :max-file-size="50 * 1024 * 1024"
            :accepted-extensions="['.pdf', '.dwg', '.dxf', '.shp', '.kml', '.jpg', '.png', '.doc', '.docx', '.zip']"
            :uploading="isUploadingFiles"
            :upload-progress="uploadProgress"
            @upload="handleFileUpload"
            @cancel="handleFileUploadCancel"
          />

          <div class="sync-dropbox-section">
            <div class="sync-dropbox-buttons">
              <button
                class="btn-sync-dropbox"
                :disabled="isSyncingFiles"
                @click="handleSyncFromDropbox"
                title="Sync files uploaded directly to Dropbox"
              >
                <span v-if="!isSyncingFiles">⟳</span>
                <span v-else>⏳</span>
                <span>{{ isSyncingFiles ? 'Syncing...' : 'Sync from Dropbox' }}</span>
              </button>
              <button
                class="btn-open-dropbox"
                @click="openDropboxFolder"
                title="Open project folder in Dropbox"
              >
                <span>📂</span>
                <span>Open in Dropbox</span>
              </button>
            </div>
            <p class="sync-info">Click to sync files uploaded directly to Dropbox</p>
          </div>

          <FileList
            :files="projectFilesForList"
            :loading="filesLoading"
            :sections="uploadSections"
            :can-delete="canManageCurrentProject"
            :can-download="canDownloadFiles"
            :current-user-id="userId ?? undefined"
            :is-admin="isAdmin"
            @file-download="handleFileDownload"
            @file-delete="handleFileDelete"
            @file-preview="handleFilePreview"
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
              :assignees="availableAssignees"
              :project-contract-date="currentProject.project.contractDate"
              :project-delivery-date="currentProject.project.deliveryDate"
              @submit="handleTaskCreate"
              @cancel="showCreateTaskModal = false"
            />
          </div>
        </div>
      </Teleport>

      <!-- Task Details Modal (Read-only) -->
      <Teleport to="body">
        <div
          v-if="showTaskDetailsModal && selectedTask"
          class="modal-overlay"
          @click.self="showTaskDetailsModal = false"
        >
          <div class="modal-content" role="dialog" aria-labelledby="task-details-title">
            <div class="modal-header">
              <h2 id="task-details-title">Task Details</h2>
              <button
                @click="showTaskDetailsModal = false"
                class="button-icon"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div class="task-details">
              <div class="task-details-section">
                <h3>Description</h3>
                <p>{{ selectedTask.description }}</p>
              </div>

              <div class="task-details-row">
                <div class="task-details-field">
                  <label>Status</label>
                  <span :class="['task-status-badge', selectedTask.status.toLowerCase()]">
                    {{ selectedTask.status }}
                  </span>
                </div>
                <div class="task-details-field">
                  <label>Priority</label>
                  <span :class="['task-priority-badge', selectedTask.priority.toLowerCase()]">
                    {{ selectedTask.priority }}
                  </span>
                </div>
              </div>

              <div class="task-details-row">
                <div class="task-details-field">
                  <label>Assignee</label>
                  <p>{{ selectedTask.assigneeName }}</p>
                </div>
                <div class="task-details-field">
                  <label>Creator</label>
                  <p>{{ selectedTask.creatorName }}</p>
                </div>
              </div>

              <div class="task-details-row">
                <div class="task-details-field">
                  <label>Due Date</label>
                  <p>{{ new Date(selectedTask.dueDate).toLocaleDateString() }}</p>
                </div>
                <div class="task-details-field">
                  <label>Created</label>
                  <p>{{ new Date(selectedTask.createdAt).toLocaleDateString() }}</p>
                </div>
              </div>

              <div v-if="selectedTask.comments" class="task-details-section">
                <h3>Comments</h3>
                <p>{{ selectedTask.comments }}</p>
              </div>

              <div v-if="selectedTask.files && selectedTask.files.length > 0" class="task-details-section">
                <h3>Attachments</h3>
                <ul class="task-attachments-list">
                  <li
                    v-for="file in selectedTask.files"
                    :key="file.id"
                    class="task-attachment-item"
                  >
                    <button
                      type="button"
                      class="task-attachment-button"
                      @click="handleFileDownload(file)"
                    >
                      {{ file.name }}
                    </button>
                    <span class="task-attachment-meta">{{ file.humanReadableSize }}</span>
                  </li>
                </ul>
              </div>

              <div class="task-details-actions">
                <button
                  v-if="selectedTask.canModify"
                  type="button"
                  class="button-primary"
                  @click="() => { showTaskDetailsModal = false; handleTaskEdit(selectedTask!); }"
                >
                  Edit Task
                </button>
                <button
                  type="button"
                  class="button-secondary"
                  @click="showTaskDetailsModal = false"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Edit Task Modal -->
      <Teleport to="body">
        <div
          v-if="showTaskEditModal && selectedTask"
          class="modal-overlay"
          @click.self="showTaskEditModal = false"
        >
          <div class="modal-content" role="dialog" aria-labelledby="edit-task-title">
            <div class="modal-header">
              <h2 id="edit-task-title">Edit Task</h2>
              <button
                @click="showTaskEditModal = false"
                class="button-icon"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <TaskForm
              :task="selectedTask"
              :assignees="availableAssignees"
              :can-confirm="selectedTask?.canConfirm ?? false"
              :project-contract-date="currentProject.project.contractDate"
              :project-delivery-date="currentProject.project.deliveryDate"
              @submit="handleTaskEditSubmit"
              @status-change="handleStatusChange"
              @confirm="handleConfirmTask"
              @cancel="showTaskEditModal = false"
            />
          </div>
        </div>
      </Teleport>

      <!-- Delete Confirmation Modal -->
      <Teleport to="body">
        <div
          v-if="showDeleteModal"
          class="modal-overlay modal-overlay-danger"
          @click.self="showDeleteModal = false"
        >
          <div class="modal-content modal-small" role="dialog" aria-labelledby="delete-title">
            <div class="modal-header">
              <h2 id="delete-title">⚠️ Confirm Delete</h2>
              <button
                @click="showDeleteModal = false"
                class="button-icon"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div class="modal-body">
              <p class="modal-warning-text">
                Are you sure you want to delete project <strong>{{ currentProject?.project.code }}</strong>?
              </p>
              <p class="modal-detail-text">
                This action cannot be undone. All associated tasks, messages, and files will be permanently deleted.
              </p>
            </div>
            <div class="modal-footer">
              <button
                @click="showDeleteModal = false"
                class="button-secondary"
                :disabled="isDeleting"
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
import {ref, computed, onMounted, onUnmounted, watch, nextTick, inject} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {useAuth} from '../composables/use-auth';
import {useProjects} from '../composables/use-projects';
import {useTasks} from '../composables/use-tasks';
import {useMessages} from '../composables/use-messages';
import {useFiles} from '../composables/use-files';
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
import type {FileUploadProgressDto} from '../components/file/FileUploader.vue';
import type {FileListItemDto} from '../components/file/FileList.vue';
import type {UpdateProjectDto, FileSummaryDto} from '@/application/dto';
import {ProjectStatus} from '@/domain/enumerations/project-status';
import {TaskStatus} from '@/domain/enumerations/task-status';
import type {CreateTaskDto, UpdateTaskDto, ChangeTaskStatusDto, ConfirmTaskDto} from '@/application/dto/task-data.dto';
import type {TaskViewModel, TaskSummaryViewModel} from '@/presentation/view-models/task.view-model';
import {PROJECT_SECTIONS, isProjectSectionId, type ProjectSectionId} from '@/shared/constants';
import {TOAST_KEY} from '@/presentation/keys/toast.key';

// Composables
const router = useRouter();
const route = useRoute();
const {user, canManageProjects, isSpecialUser, userId, isAuthenticated, isAdmin} = useAuth();

const toast = inject(TOAST_KEY, undefined);
const {
  currentProject,
  isLoading,
  loadProject,
  updateProject,
  finalizeProject,
  deleteProject,
} = useProjects();

const {
  tasks: projectTasks,
  isLoading: tasksLoading,
  loadTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  changeStatus,
  confirmTask,
} = useTasks();

const {
  messages: projectMessages,
  isLoading: messagesLoading,
  loadMessagesByProject,
  sendMessage,
  markAllAsRead,
} = useMessages();

const {
  files: projectFiles,
  isLoading: filesLoading,
  loadFilesByProject,
  uploadFile: uploadFileToDropbox,
  syncFilesFromDropbox,
  getTemporaryDownloadUrl,
  getPreviewUrl,
  deleteFile,
} = useFiles();

/**
 * Safely open an external URL in a new tab.
 *
 * Mitigates reverse-tabnabbing by using `noopener,noreferrer` and nulling out
 * `opener`. Also rejects non-http(s) protocols.
 *
 * @param rawUrl - URL to open
 */
function openExternalUrlInNewTab(rawUrl: string): void {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Unsupported URL protocol');
  }

  const openedWindow = window.open(url.toString(), '_blank', 'noopener,noreferrer');
  if (openedWindow) {
    openedWindow.opener = null;
  }
}

// Local State
type TabKey = 'overview' | 'tasks' | 'messages' | 'files';
const activeTab = ref<TabKey>('overview');
const messageListRef = ref<InstanceType<typeof MessageList> | null>(null);
const messagesContainerRef = ref<HTMLElement | null>(null);
const overviewPanelRef = ref<HTMLElement | null>(null);
const tasksPanelRef = ref<HTMLElement | null>(null);
const messagesPanelRef = ref<HTMLElement | null>(null);
const filesPanelRef = ref<HTMLElement | null>(null);
const taskStatusFilter = ref<TaskStatus | ''>('');
const showEditModal = ref(false);
const showCreateTaskModal = ref(false);
const showTaskDetailsModal = ref(false);
const showTaskEditModal = ref(false);
const selectedTask = ref<TaskViewModel | null>(null);
const showFinalizeModal = ref(false);
const showDeleteModal = ref(false);
const isFinalizing = ref(false);
const isDeleting = ref(false);
const hasPromptedFinalizeAfterCompletion = ref(false);
const isUploadingFiles = ref(false);
const isSyncingFiles = ref(false);
const uploadProgress = ref<FileUploadProgressDto[]>([]);
const uploadAbortControllers = new Map<string, AbortController>();

let fileUploadedSubscription: {unsubscribe: () => void} | null = null;
let fileDeletedSubscription: {unsubscribe: () => void} | null = null;
let presenceTypingSubscription: {unsubscribe: () => void} | null = null;
let presenceStopTypingSubscription: {unsubscribe: () => void} | null = null;
let presenceOnlineSubscription: {unsubscribe: () => void} | null = null;
let presenceOfflineSubscription: {unsubscribe: () => void} | null = null;

const typingUserIds = ref<Set<string>>(new Set());
const typingExpiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

const isSomeoneTyping = computed(() => typingUserIds.value.size > 0);

const onlineUserIds = ref<Set<string>>(new Set());
const onlineOtherCount = computed(() => onlineUserIds.value.size);

function addOnlineUser(userIdValue: string): void {
  if (!userIdValue) return;
  const next = new Set(onlineUserIds.value);
  next.add(userIdValue);
  onlineUserIds.value = next;
}

function removeOnlineUser(userIdValue: string): void {
  if (!userIdValue) return;
  const next = new Set(onlineUserIds.value);
  next.delete(userIdValue);
  onlineUserIds.value = next;
}

function clearAllOnlinePresenceState(): void {
  onlineUserIds.value = new Set();
}

function addTypingUser(userIdValue: string): void {
  if (!userIdValue) return;
  const next = new Set(typingUserIds.value);
  next.add(userIdValue);
  typingUserIds.value = next;
}

function removeTypingUser(userIdValue: string): void {
  if (!userIdValue) return;
  const next = new Set(typingUserIds.value);
  next.delete(userIdValue);
  typingUserIds.value = next;
}

function refreshTypingExpiry(userIdValue: string): void {
  const existingTimer = typingExpiryTimers.get(userIdValue);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  typingExpiryTimers.set(
    userIdValue,
    setTimeout(() => {
      typingExpiryTimers.delete(userIdValue);
      removeTypingUser(userIdValue);
    }, 3_000),
  );
}

function clearAllTypingState(): void {
  for (const timer of typingExpiryTimers.values()) {
    clearTimeout(timer);
  }
  typingExpiryTimers.clear();
  typingUserIds.value = new Set();
}

function handleTyping(): void {
  if (!currentProject.value?.project.id) return;

  void (async () => {
    const {socketHandler} = await import('@/infrastructure/websocket');
    socketHandler.emitTyping(currentProject.value!.project.id);
  })();
}

function handleStopTyping(): void {
  if (!currentProject.value?.project.id) return;

  void (async () => {
    const {socketHandler} = await import('@/infrastructure/websocket');
    socketHandler.emitStopTyping(currentProject.value!.project.id);
  })();
}

// Computed Properties
const projectId = computed(() => route.params.id as string);
const currentUserId = computed(() => user.value?.id || '');

const isProjectCreator = computed(() => 
  currentProject.value?.project?.creatorId === userId.value
);

const canManageCurrentProject = computed(() => 
  canManageProjects.value || (isSpecialUser.value && isProjectCreator.value)
);

const canCreateTask = computed(() => 
  currentProject.value?.currentUserPermissions?.canCreateTask ?? false
);

const canUploadFiles = computed(() => 
  currentProject.value?.currentUserPermissions?.canUploadFile ?? false
);

const canDownloadFiles = computed(() =>
  currentProject.value?.currentUserPermissions?.canDownloadFile ?? false
);

const canSendMessages = computed(() =>
  currentProject.value?.currentUserPermissions?.canSendMessage ?? false
);

const canEditTasks = computed(() =>
  currentProject.value?.currentUserPermissions?.canCreateTask ?? false
);

async function maybePromptFinalizeAfterLastTaskCompletion(): Promise<void> {
  if (!currentProject.value) return;
  if (hasPromptedFinalizeAfterCompletion.value) return;
  if (!currentProject.value.currentUserPermissions?.canFinalize) return;
  if (currentProject.value.project.status === ProjectStatus.FINALIZED) return;
  if (taskStats.value.total === 0) return;
  if (taskStats.value.pending !== 0) return;

  hasPromptedFinalizeAfterCompletion.value = true;
  showFinalizeModal.value = true;
}

const uploadSections = computed<ProjectSectionId[]>(() => {
  const sections =
    currentProject.value?.sections
      ?.map((s) => s.name)
      .filter(isProjectSectionId) ?? [];

  return sections.length > 0
    ? sections
    : [
        PROJECT_SECTIONS.REPORT_AND_ANNEXES,
        PROJECT_SECTIONS.PLANS,
        PROJECT_SECTIONS.SPECIFICATIONS,
        PROJECT_SECTIONS.BUDGET,
      ];
});

const enrichedTasks = computed((): TaskViewModel[] => {
  return projectTasks.value.map((task) => {
    const taskFileIds = Array.isArray(task.fileIds) ? task.fileIds : [];
    if (taskFileIds.length === 0) {
      return {
        ...task,
        files: Array.isArray(task.files) ? task.files : [],
      };
    }

    const taskFiles = projectFiles.value.filter((file) => taskFileIds.includes(file.id));

    return {
      ...task,
      files: taskFiles,
    };
  });
});

const filteredTasks = computed(() => {
  if (!taskStatusFilter.value) return enrichedTasks.value;
  return enrichedTasks.value.filter((t) => t.status === taskStatusFilter.value);
});

const taskStats = computed(() => {
  const total = projectTasks.value.length;
  const completed = projectTasks.value.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const pending = total - completed;
  return {total, completed, pending};
});

const messageCount = computed(() => projectMessages.value.length);

const enrichedMessages = computed(() => {
  // Enrich messages with file details from project files
  return projectMessages.value.map((message) => {
    if (!message.fileIds || message.fileIds.length === 0) {
      return message;
    }
    
    // Find files that match the message's fileIds
    const messageFiles = projectFiles.value.filter((file) =>
      message.fileIds.includes(file.id)
    );
    
    return {
      ...message,
      files: messageFiles,
    };
  });
});

const projectFilesForList = computed<FileListItemDto[]>(() => {
  const sectionByFileId = new Map<string, string>();

  if (currentProject.value) {
    for (const section of currentProject.value.sections) {
      for (const file of section.files) {
        sectionByFileId.set(file.id, section.name);
      }
    }
  }

  return projectFiles.value.map((file) => ({
    ...file,
    section: sectionByFileId.get(file.id) ?? null,
  }));
});

const tabs = computed((): Array<{key: TabKey; label: string; badge: number}> => [
  {key: 'overview', label: 'Overview', badge: 0},
  {key: 'tasks', label: 'Tasks', badge: taskStats.value.pending},
  {key: 'messages', label: 'Messages', badge: enrichedMessages.value.filter((m) => !m.isRead).length},
  {key: 'files', label: 'Files', badge: projectFiles.value.length},
]);

const availableAssignees = computed(() => {
  if (!currentProject.value?.participants) {
    return [];
  }
  
  const assignees = currentProject.value.participants.map(p => ({
    id: p.userId,
    name: p.username,
    role: p.role
  }));
  
  // Ensure creator is always in the list if they are a SPECIAL_USER
  const creatorId = (currentProject.value.project as any).creatorId;
  if (creatorId && isSpecialUser.value && creatorId === userId.value) {
    const creatorExists = assignees.some(a => a.id === creatorId);
    if (!creatorExists && user.value) {
      const fullName = `${user.value.firstName} ${user.value.lastName}`.trim();
      assignees.push({
        id: user.value.id,
        name: fullName || user.value.username,
        role: user.value.role
      });
    }
  }
  
  return assignees;
});

// Methods
/**
 * Navigate back to projects list
 */
function goBack(): void {
  router.push({name: 'projects'});
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
function formatStatus(status: string | undefined): string {
  if (!status) return '';
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
  if (!currentProject.value) return;

  isFinalizing.value = true;
  const projectCode = currentProject.value.project.code;
  
  try {
    console.log(`Attempting to finalize project: ${projectCode} (${projectId.value})`);
    const result = await finalizeProject(projectId.value);
    
    if (result) {
      console.log(`✅ Project ${projectCode} finalized successfully`);
      showFinalizeModal.value = false;
    } else {
      console.error(`❌ Failed to finalize project ${projectCode}`);
      alert('Failed to finalize project. Please try again.');
    }
  } catch (error: any) {
    console.error('Exception while finalizing project:', error);
    alert(`Error finalizing project: ${error.message || 'Unknown error'}`);
  } finally {
    isFinalizing.value = false;
  }
}

/**
 * Start delete project flow
 */
function handleDeleteStart(): void {
  showDeleteModal.value = true;
}

/**
 * Confirm and execute project deletion
 */
async function handleDeleteConfirm(): Promise<void> {
  if (!currentProject.value) return;

  isDeleting.value = true;
  const projectCode = currentProject.value.project.code;
  
  try {
    console.log(`Attempting to delete project: ${projectCode} (${projectId.value})`);
    const result = await deleteProject(projectId.value);
    
    if (result.success) {
      console.log(`✅ Project ${projectCode} deleted successfully`);
      showDeleteModal.value = false;
      
      // Navigate back to projects list
      router.push({name: 'projects'});
    } else {
      console.error(`❌ Failed to delete project ${projectCode}:`, result.error);
      alert(`Failed to delete project: ${result.error || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('Exception while deleting project:', error);
    alert(`Error deleting project: ${error.message || 'Unknown error'}`);
  } finally {
    isDeleting.value = false;
  }
}

/**
 * Handle task creation
 *
 * @param {CreateTaskDto} taskData - New task data
 */
async function handleTaskCreate(taskData: CreateTaskDto | UpdateTaskDto): Promise<void> {
  if (!('projectId' in taskData)) {
    console.error('Invalid create task payload');
    return;
  }

  try {
    const result = await createTask(taskData);
    
    if (result.success) {
      showCreateTaskModal.value = false;
      await loadTasksByProject(projectId.value);

      if (Array.isArray(taskData.fileIds) && taskData.fileIds.length > 0) {
        await loadFilesByProject(projectId.value);
      }
    } else {
      alert(`Failed to create task: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    alert(`Error creating task: ${(error as Error).message || 'Unknown error'}`);
  }
}

/**
 * Handle task click - shows read-only preview
 *
 * @param {TaskViewModel | TaskSummaryViewModel} task - Clicked task
 */
function handleTaskClick(task: TaskViewModel | TaskSummaryViewModel): void {
  const resolvedTask = 'projectId' in task ? task : (enrichedTasks.value.find((t) => t.id === task.id) ?? null);
  if (!resolvedTask) return;

  selectedTask.value = resolvedTask;
  showTaskDetailsModal.value = true;
}

/**
 * Handle task edit - opens edit modal
 *
 * @param {TaskViewModel | TaskSummaryViewModel} task - Task to edit
 */
function handleTaskEdit(task: TaskViewModel | TaskSummaryViewModel): void {
  const resolvedTask = 'projectId' in task ? task : (enrichedTasks.value.find((t) => t.id === task.id) ?? null);
  if (!resolvedTask) return;

  selectedTask.value = resolvedTask;
  showTaskEditModal.value = true;
}

/**
 * Handle task edit submission
 *
 * @param {UpdateTaskDto} taskData - Updated task data
 */
async function handleTaskEditSubmit(taskData: any): Promise<void> {
  try {
    if (!selectedTask.value) return;
    
    const updateData: UpdateTaskDto = {
      id: selectedTask.value.id,
      ...taskData,
    };
    
    const result = await updateTask(updateData);
    
    if (result.success) {
      showTaskEditModal.value = false;
      selectedTask.value = null;
      await loadTasksByProject(projectId.value);

      if (Array.isArray(taskData.fileIds) && taskData.fileIds.length > 0) {
        await loadFilesByProject(projectId.value);
      }
    } else {
      alert(`Failed to update task: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    alert(`Error updating task: ${(error as Error).message || 'Unknown error'}`);
  }
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
 * Handle task status change
 *
 * @param {ChangeTaskStatusDto} data - Status change data
 */
async function handleStatusChange(data: ChangeTaskStatusDto): Promise<void> {
  try {
    const success = await changeStatus(data.taskId, data.newStatus, data.comment);
    
    if (success) {
      showTaskEditModal.value = false;
      selectedTask.value = null;
      await loadTasksByProject(projectId.value);
    } else {
      alert('Failed to change task status');
    }
  } catch (error) {
    alert(`Error changing task status: ${(error as Error).message || 'Unknown error'}`);
  }
}

/**
 * Handle task confirmation (PERFORMED → COMPLETED)
 *
 * @param {ConfirmTaskDto} data - Confirmation data
 */
async function handleConfirmTask(data: ConfirmTaskDto): Promise<void> {
  try {
    const success = await confirmTask(data.taskId, data.confirmed, data.feedback);
    
    if (success) {
      showTaskEditModal.value = false;
      selectedTask.value = null;
      await loadTasksByProject(projectId.value);
      await maybePromptFinalizeAfterLastTaskCompletion();
    } else {
      alert('Failed to confirm task');
    }
  } catch (error) {
    alert(`Error confirming task: ${(error as Error).message || 'Unknown error'}`);
  }
}

watch(projectId, () => {
  hasPromptedFinalizeAfterCompletion.value = false;
  clearAllTypingState();
  clearAllOnlinePresenceState();
});

/**
 * Handle task deletion
 *
 * @param {TaskViewModel | TaskSummaryViewModel} task - Task to delete
 */
function handleTaskDelete(task: TaskViewModel | TaskSummaryViewModel): void {
  const resolvedTask = 'projectId' in task ? task : (enrichedTasks.value.find((t) => t.id === task.id) ?? null);
  if (!resolvedTask) return;

  void (async () => {
    try {
      await deleteTask(resolvedTask.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  })();
}

/**
 * Handle message send from MessageInput component
 *
 * @param {Object} payload - Message payload with content and optional files
 */
async function handleMessageSend(payload: {content: string; files: File[]}): Promise<void> {
  if (!currentProject.value) return;

  if (!canSendMessages.value) {
    toast?.({
      type: 'warning',
      message: "You don't have permission to send messages in this project.",
    });
    return;
  }

  if (payload.files && payload.files.length > 0 && !canUploadFiles.value) {
    toast?.({
      type: 'warning',
      message: "You don't have permission to upload files in this project.",
    });
    return;
  }

  try {
    const fileIds: string[] = [];
    
    // Upload files if any are attached
    if (payload.files && payload.files.length > 0) {
      console.log(`Uploading ${payload.files.length} file(s)...`);
      
      for (const file of payload.files) {
        try {
          const uploadedFile = await uploadFileToDropbox(
            file,
            currentProject.value.project.id,
            PROJECT_SECTIONS.MESSAGES,
            (progress) => {
              console.log(`Upload progress for ${file.name}: ${progress}%`);
            }
          );

          if (uploadedFile && uploadedFile.id) {
            fileIds.push(uploadedFile.id);
            console.log(`File uploaded successfully: ${file.name} (ID: ${uploadedFile.id})`);
          } else {
            console.error(`Failed to upload file: ${file.name}`);
            alert(`Failed to upload file: ${file.name}`);
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          alert(`Failed to upload file: ${file.name}`);
        }
      }
    }

    // If no content and no files uploaded, don't send
    if (!payload.content && fileIds.length === 0) {
      alert('Message content is required');
      return;
    }

    // Use default message text if only files are being sent
    const messageContent = payload.content || '📎 File attachment';
    
    console.log('Sending message:', messageContent, 'with file IDs:', fileIds);
    
    const result = await sendMessage(messageContent, fileIds.length > 0 ? fileIds : undefined);
    
    if (result.success) {
      console.log('Message sent successfully:', result.message);
      // Reload files to show the newly uploaded attachments
      if (fileIds.length > 0) {
        await loadFilesByProject(currentProject.value.project.id);
      }
    } else {
      console.error('Failed to send message:', result.error);
      alert(`Failed to send message: ${result.error}`);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  }
}

/**
 * Handle file upload from FileUploader component
 *
 * @param {Array<{file: File, section: string}>} uploads - Files to upload with their sections
 */
async function handleFileUpload(
  uploads: Array<{id: string; file: File; section: ProjectSectionId}>,
): Promise<void> {
  if (!currentProject.value) return;

  if (!canUploadFiles.value) {
    toast?.({
      type: 'warning',
      message: "You don't have permission to upload files in this project.",
    });
    return;
  }

  isUploadingFiles.value = true;
  uploadAbortControllers.clear();
  uploadProgress.value = uploads.map((upload) => ({
    fileId: upload.id,
    status: 'pending',
    progress: 0,
  }));

  for (const upload of uploads) {
    uploadAbortControllers.set(upload.id, new AbortController());
  }

  let successCount = 0;

  try {
    // Upload files sequentially
    for (let i = 0; i < uploads.length; i++) {
      const {id, file, section} = uploads[i];
      const progressItem = uploadProgress.value.find(p => p.fileId === id);
      if (!progressItem) continue;

      const controller = uploadAbortControllers.get(id);
      if (controller?.signal.aborted) {
        progressItem.status = 'error';
        progressItem.error = 'Upload canceled';
        continue;
      }

      try {
        progressItem.status = 'uploading';

        const uploadedFile = await uploadFileToDropbox(
          file,
          currentProject.value.project.id,
          isProjectSectionId(section) ? section : PROJECT_SECTIONS.REPORT_AND_ANNEXES,
          (progress) => {
            progressItem.progress = progress;
          },
          {signal: controller?.signal}
        );

        if (uploadedFile) {
          progressItem.status = 'completed';
          progressItem.progress = 100;
          successCount++;
        } else {
          if (progressItem.error === 'Upload canceled' || controller?.signal.aborted) {
            progressItem.status = 'error';
            progressItem.error = 'Upload canceled';
          } else {
            progressItem.status = 'error';
            progressItem.error = 'Upload failed';
          }
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
        progressItem.status = 'error';
        progressItem.error = (error as Error).message || 'Upload failed';
      }
    }

    // Reload files if at least one upload succeeded
    if (successCount > 0 && currentProject.value) {
      await loadFilesByProject(currentProject.value.project.id);
    }
  } finally {
    isUploadingFiles.value = false;
    // Clear progress after 3 seconds
    setTimeout(() => {
      uploadProgress.value = [];
      uploadAbortControllers.clear();
    }, 3000);
  }
}

function handleFileUploadCancel(fileId: string): void {
  const controller = uploadAbortControllers.get(fileId);
  controller?.abort();

  const progressItem = uploadProgress.value.find((p) => p.fileId === fileId);
  if (progressItem) {
    progressItem.status = 'error';
    progressItem.error = 'Upload canceled';
  }
}

/**
 * Handle sync from Dropbox
 * Syncs files uploaded directly to Dropbox
 */
async function handleSyncFromDropbox(): Promise<void> {
  if (!currentProject.value) return;

  if (!canUploadFiles.value) {
    toast?.({
      type: 'warning',
      message: "You don't have permission to upload files in this project.",
    });
    return;
  }

  isSyncingFiles.value = true;

  try {
    const result = await syncFilesFromDropbox(currentProject.value.project.id);
    
    if (result.synced > 0) {
      alert(`Successfully synced ${result.synced} file(s) from Dropbox.\n\nTotal files: ${result.totalFiles}\nNewly synced: ${result.synced}\nAlready in database: ${result.skipped}`);
    } else {
      alert(`No new files to sync.\n\nAll ${result.totalFiles} file(s) in Dropbox are already in the database.`);
    }
  } catch (error) {
    console.error('Failed to sync from Dropbox:', error);
    alert(`Failed to sync from Dropbox: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isSyncingFiles.value = false;
  }
}

/**
 * Open Dropbox folder in new tab
 * Opens the project's Dropbox folder in the browser
 */
function openDropboxFolder(): void {
  if (!currentProject.value) return;
  
  const projectCode = currentProject.value.project.code;
  const dropboxUrl = `https://www.dropbox.com/home/Aplicaciones/Cartographic%20Project%20Manager/CartographicProjects/${encodeURIComponent(projectCode)}`;
  
  window.open(dropboxUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Handle file download
 *
 * @param {FileSummaryDto} file - File to download
 */
async function handleFileDownload(file: FileSummaryDto): Promise<void> {
  try {
    if (!isAuthenticated.value) {
      throw new Error('Not authenticated');
    }

    if (!canDownloadFiles.value) {
      toast?.({
        type: 'warning',
        message: "You don't have permission to download files in this project.",
      });
      return;
    }

    const downloadUrl = await getTemporaryDownloadUrl(file.id);
    openExternalUrlInNewTab(downloadUrl);
  } catch (error) {
    console.error('Failed to download file:', error);
    toast?.({
      type: 'error',
      message: `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Handle file deletion
 *
 * @param {FileSummaryDto} file - File to delete
 */
async function handleFileDelete(file: FileSummaryDto): Promise<void> {
  if (!confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    const success = await deleteFile(file.id);
    
    if (success) {
      // Reload files to ensure consistency
      if (currentProject.value) {
        await loadFilesByProject(currentProject.value.project.id);
      }
    } else {
      throw new Error('Failed to delete file');
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
    alert('Failed to delete file. Please try again.');
  }
}

/**
 * Handle file preview
 *
 * @param {FileSummaryDto} file - File to preview
 */
async function handleFilePreview(file: FileSummaryDto): Promise<void> {
  try {
    if (!isAuthenticated.value) {
      throw new Error('Not authenticated');
    }

    const previewUrl = await getPreviewUrl(file.id);
    openExternalUrlInNewTab(previewUrl);
  } catch (error) {
    console.error('Failed to preview file:', error);
    alert(`Failed to preview file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Load initial data
async function loadProjectData(): Promise<void> {
  // Skip if user is not authenticated (e.g., during logout)
  if (!isAuthenticated.value) {
    console.log('Skipping project details load - user not authenticated');
    return;
  }
  
  try {
    // Load project first so dependent stores (e.g., taskStats updates) can safely
    // reference the current project.
    await loadProject(projectId.value);
    await Promise.all([
      loadTasksByProject(projectId.value),
      loadMessagesByProject(projectId.value),
      loadFilesByProject(projectId.value),
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

// Reset scroll and handle tab-specific actions when switching tabs
watch(activeTab, async (newTab) => {
  // Reset scroll position for non-messages tabs to top
  nextTick(() => {
    [overviewPanelRef.value, tasksPanelRef.value, filesPanelRef.value].forEach(panel => {
      if (panel) {
        panel.scrollTop = 0;
      }
    });
  });

  // Tab-specific logic
  if (newTab === 'messages' && currentProject.value?.project.id) {
    await markAllAsRead();
    nextTick(() => {
      setTimeout(() => {
        messageListRef.value?.scrollToBottom(false);
      }, 150);
    });
  }
});

// Lifecycle
onMounted(async () => {
  await loadProjectData();

  // Join project WebSocket room for real-time updates
  if (currentProject.value?.project.id) {
    const joinedProjectId = currentProject.value.project.id;
    console.log('[ProjectDetailsView] 🏠 Joining project room:', joinedProjectId);
    const {socketHandler} = await import('@/infrastructure/websocket');
    socketHandler.joinProject(joinedProjectId);

    fileUploadedSubscription = socketHandler.onFileUploaded(async (data) => {
      if (!data || (data as any).projectId !== projectId.value) return;
      await loadFilesByProject(projectId.value);
    });

    fileDeletedSubscription = socketHandler.onFileDeleted(async (data) => {
      if (!data || (data as any).projectId !== projectId.value) return;
      await loadFilesByProject(projectId.value);
    });

    presenceTypingSubscription = socketHandler.onPresenceTyping((data) => {
      if (!data || (data as any).projectId !== projectId.value) return;
      if ((data as any).userId === currentUserId.value) return;

      const typingUserId = (data as any).userId as string;
      addTypingUser(typingUserId);
      refreshTypingExpiry(typingUserId);
    });

    presenceStopTypingSubscription = socketHandler.onPresenceStopTyping((data) => {
      if (!data || (data as any).projectId !== projectId.value) return;
      if ((data as any).userId === currentUserId.value) return;

      const typingUserId = (data as any).userId as string;
      const timer = typingExpiryTimers.get(typingUserId);
      if (timer) {
        clearTimeout(timer);
        typingExpiryTimers.delete(typingUserId);
      }
      removeTypingUser(typingUserId);
    });

    presenceOnlineSubscription = socketHandler.onPresenceOnline((data) => {
      if (!data || (data as any).projectId !== projectId.value) return;
      if ((data as any).userId === currentUserId.value) return;

      const onlineUserId = (data as any).userId as string;
      addOnlineUser(onlineUserId);
    });

    presenceOfflineSubscription = socketHandler.onPresenceOffline((data) => {
      if (!data || (data as any).projectId !== projectId.value) return;
      if ((data as any).userId === currentUserId.value) return;

      const onlineUserId = (data as any).userId as string;
      removeOnlineUser(onlineUserId);
    });

    console.log('[ProjectDetailsView] ✅ Successfully joined project room:', joinedProjectId);
  } else {
    console.error('[ProjectDetailsView] ❌ No project ID available to join room');
  }

  // Set initial tab from query param
  if (route.query.tab) {
    const tab = route.query.tab as string;
    if (['overview', 'tasks', 'messages', 'files'].includes(tab)) {
      activeTab.value = tab as any;
    }
  }

  // Open specific task if taskId is provided in query params
  if (route.query.taskId) {
    const taskId = route.query.taskId as string;
    
    // Function to try opening the task
    const tryOpenTask = () => {
      const task = enrichedTasks.value.find(t => t.id === taskId);
      if (task) {
        handleTaskClick(task);
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (!tryOpenTask()) {
      // If not found, wait for tasks to load
      const unwatch = watch(
        () => projectTasks.value.length,
        () => {
          if (tryOpenTask()) {
            unwatch(); // Stop watching once task is found
          }
        },
        {immediate: true}
      );
      
      // Stop trying after 5 seconds
      setTimeout(() => {
        unwatch();
      }, 5000);
    }
  }
});

// Clean up on unmount
onUnmounted(async () => {
  fileUploadedSubscription?.unsubscribe();
  fileDeletedSubscription?.unsubscribe();
  fileUploadedSubscription = null;
  fileDeletedSubscription = null;

  presenceTypingSubscription?.unsubscribe();
  presenceStopTypingSubscription?.unsubscribe();
  presenceTypingSubscription = null;
  presenceStopTypingSubscription = null;
  clearAllTypingState();

  presenceOnlineSubscription?.unsubscribe();
  presenceOfflineSubscription?.unsubscribe();
  presenceOnlineSubscription = null;
  presenceOfflineSubscription = null;
  clearAllOnlinePresenceState();

  // Leave project WebSocket room
  if (currentProject.value?.project.id) {
    const {socketHandler} = await import('@/infrastructure/websocket');
    socketHandler.leaveProject(currentProject.value.project.id);
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

.typing-indicator {
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.presence-indicator {
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.permission-banner {
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-hover);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.permission-hint {
  margin-top: var(--spacing-2);
  padding: 0 var(--spacing-1);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
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

/* Sync from Dropbox Section */
.sync-dropbox-section {
  margin: var(--spacing-4) 0;
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.sync-dropbox-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.btn-sync-dropbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
  white-space: nowrap;
}

.btn-sync-dropbox:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-sync-dropbox:active:not(:disabled) {
  transform: translateY(0);
}

.btn-sync-dropbox:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sync-dropbox span:first-child {
  font-size: var(--font-size-lg);
  line-height: 1;
}

.btn-open-dropbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: #0061fe;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
  white-space: nowrap;
}

.btn-open-dropbox:hover {
  background: #0052d9;
  transform: translateY(-1px);
}

.btn-open-dropbox:active {
  transform: translateY(0);
}

.btn-open-dropbox span:first-child {
  font-size: var(--font-size-lg);
  line-height: 1;
}

.sync-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
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

.messages-container > :first-child {
  flex: 1;
  min-height: 0; /* Important: allows flex child to shrink below content size */
  overflow: hidden;
}

.messages-container > :last-child {
  flex-shrink: 0; /* Prevents MessageInput from being compressed */
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

/* Danger Modal Styles */
.modal-overlay-danger {
  background: rgba(127, 29, 29, 0.5);
}

.modal-warning-text {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.modal-detail-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-6);
}

.button-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: white;
  background-color: #dc2626;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.button-danger:hover {
  background-color: #b91c1c;
}

.button-danger:active {
  background-color: #991b1b;
}

.button-danger:disabled {
  background-color: var(--color-gray-300);
  color: var(--color-gray-500);
  cursor: not-allowed;
}

.button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.button-secondary:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-text-secondary);
}

.button-secondary:disabled {
  color: var(--color-gray-400);
  border-color: var(--color-gray-200);
  cursor: not-allowed;
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

.modal-content > form {
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

/* Button Styles */
.button-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: white;
  background-color: var(--color-primary-600);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.button-primary:hover {
  background-color: var(--color-primary-700);
}

.button-primary:active {
  background-color: var(--color-primary-800);
}

.button-primary:disabled {
  background-color: var(--color-gray-300);
  cursor: not-allowed;
}

.button-sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
}

.button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.button-icon:hover {
  color: var(--color-text-primary);
  background-color: var(--color-gray-100);
}

.button-ghost {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.button-ghost:hover {
  color: var(--color-text-primary);
  background-color: var(--color-gray-50);
  border-color: var(--color-text-secondary);
}

.button-icon-left svg,
.button-icon-left i {
  margin-right: var(--spacing-2);
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

/* Task Details Modal */
.task-details {
  padding: var(--spacing-4);
}

.task-details-section {
  margin-bottom: var(--spacing-4);
}

.task-details-section h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--spacing-2);
  color: var(--color-text-primary);
}

.task-details-section p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.task-details-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.task-details-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.task-details-field label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-details-field p {
  color: var(--color-text-primary);
  margin: 0;
}

.task-attachments-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.task-attachment-item {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
}

.task-attachment-button {
  background: transparent;
  border: none;
  padding: 0;
  color: var(--color-primary);
  font: inherit;
  cursor: pointer;
  text-align: left;
}

.task-attachment-button:hover {
  text-decoration: underline;
}

.task-attachment-meta {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.task-status-badge,
.task-priority-badge {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
}

.task-status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.task-status-badge.in_progress {
  background-color: #dbeafe;
  color: #1e40af;
}

.task-status-badge.done {
  background-color: #d1fae5;
  color: #065f46;
}

.task-status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.task-status-badge.cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.task-priority-badge.urgent {
  background-color: #fee2e2;
  color: #991b1b;
}

.task-priority-badge.high {
  background-color: #fed7aa;
  color: #9a3412;
}

.task-priority-badge.medium {
  background-color: #fef3c7;
  color: #92400e;
}

.task-priority-badge.low {
  background-color: #e0e7ff;
  color: #3730a3;
}

.task-details-actions {
  display: flex;
  gap: var(--spacing-2);
  justify-content: flex-end;
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}
</style>
