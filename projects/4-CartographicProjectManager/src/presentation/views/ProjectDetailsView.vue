<!--
  @module presentation/views/ProjectDetailsView
  @description Detailed project view with tabs for tasks, messages,
  and files. Central workspace for project collaboration.
  @category Presentation
-->
<template>
  <div class="project-details-view">
    <LoadingSpinner v-if="isLoading" />
    
    <div v-else-if="activeProject" class="container">
      <!-- Project Header -->
      <div class="project-header">
        <button @click="goBack" class="back-btn">← Back</button>
        
        <div class="header-content">
          <div class="header-main">
            <div class="project-code-badge">{{ activeProject.code }}</div>
            <h1 class="project-title">{{ activeProject.name }}</h1>
            <div 
              class="status-badge"
              :class="'status-' + activeProject.status.toLowerCase()"
            >
              {{ activeProject.status }}
            </div>
          </div>
          
          <p class="project-description">{{ activeProject.description }}</p>
          
          <div class="project-meta-grid">
            <div class="meta-item">
              <span class="meta-label">Client</span>
              <span class="meta-value">{{ activeProject.clientId }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Type</span>
              <span class="meta-value">{{ formatType(activeProject.type) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Created</span>
              <span class="meta-value">{{ formatDate(activeProject.createdAt) }}</span>
            </div>
            <div v-if="activeProject.deadline" class="meta-item">
              <span class="meta-label">Deadline</span>
              <span class="meta-value" :class="{'text-warning': isNearDeadline(activeProject.deadline)}">
                {{ formatDate(activeProject.deadline) }}
              </span>
            </div>
          </div>

          <div v-if="isAdmin && activeProject.status === 'ACTIVE'" class="header-actions">
            <button @click="handleFinalizeProject" class="btn btn-primary">
              Finalize Project
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-btn"
          :class="{active: activeTab === tab.id}"
        >
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Tasks Tab -->
        <div v-if="activeTab === 'tasks'" class="tasks-panel">
          <div class="panel-header">
            <h2>Tasks</h2>
            <div class="panel-actions">
              <select v-model="taskStatusFilter" class="filter-select">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <button @click="showCreateTask = true" class="btn btn-primary btn-sm">
                + New Task
              </button>
            </div>
          </div>

          <div v-if="tasks.length > 0" class="tasks-list">
            <div 
              v-for="task in tasks" 
              :key="task.id"
              class="task-card"
            >
              <div class="task-header">
                <h3 class="task-title">{{ task.title }}</h3>
                <div 
                  class="priority-badge"
                  :class="'priority-' + task.priority.toLowerCase()"
                >
                  {{ task.priority }}
                </div>
              </div>
              <p v-if="task.description" class="task-description">{{ task.description }}</p>
              <div class="task-footer">
                <div 
                  class="task-status"
                  :class="'status-' + task.status.toLowerCase()"
                >
                  {{ formatTaskStatus(task.status) }}
                </div>
                <div v-if="task.dueDate" class="task-due">
                  Due: {{ formatDate(task.dueDate) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>No tasks yet. Create one to get started!</p>
          </div>
        </div>

        <!-- Messages Tab -->
        <div v-if="activeTab === 'messages'" class="messages-panel">
          <div class="messages-container">
            <div v-if="messages.length > 0" class="messages-list">
              <div 
                v-for="message in messages" 
                :key="message.id"
                class="message-item"
                :class="{'message-own': message.senderId === currentUserId}"
              >
                <div class="message-avatar">
                  {{ getInitials(message.senderId) }}
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-sender">{{ message.senderId }}</span>
                    <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                  </div>
                  <p class="message-text">{{ message.content }}</p>
                  <div v-if="message.attachments?.length" class="message-attachments">
                    <div v-for="(file, idx) in message.attachments" :key="idx" class="attachment-item">
                      📎 {{ file }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>

          <div class="message-input-box">
            <textarea 
              v-model="newMessage"
              placeholder="Type a message..."
              class="message-textarea"
              @keydown.enter.ctrl="handleSendMessage"
            ></textarea>
            <button 
              @click="handleSendMessage" 
              :disabled="!newMessage.trim()"
              class="btn btn-primary"
            >
              Send
            </button>
          </div>
        </div>

        <!-- Files Tab -->
        <div v-if="activeTab === 'files'" class="files-panel">
          <div class="panel-header">
            <h2>Files</h2>
            <button class="btn btn-primary btn-sm">
              + Upload File
            </button>
          </div>
          <div class="empty-state">
            <p>File management coming soon...</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="container">
      <div class="error-state">
        <p>Project not found.</p>
        <button @click="goBack" class="btn btn-primary">Go Back</button>
      </div>
    </div>

    <!-- Create Task Modal -->
    <div v-if="showCreateTask" class="modal-overlay" @click="showCreateTask = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Create New Task</h2>
          <button @click="showCreateTask = false" class="close-btn">✕</button>
        </div>
        <form @submit.prevent="handleCreateTask" class="task-form">
          <div class="form-group">
            <label>Task Title *</label>
            <input v-model="newTask.title" required class="form-input" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newTask.description" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Priority *</label>
            <select v-model="newTask.priority" required class="form-input">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div class="form-group">
            <label>Due Date</label>
            <input v-model="newTask.dueDate" type="date" class="form-input" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateTask = false" class="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProjects } from '../composables/use-projects';
import { useTasks } from '../composables/use-tasks';
import { useMessages } from '../composables/use-messages';
import { useAuth } from '../composables/use-auth';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const { isAdmin, currentUserId } = useAuth();
const { 
  activeProject,
  isLoading: projectsLoading, 
  loadProjectDetails,
  finalizeProject,
} = useProjects();

const {
  tasks,
  isLoading: tasksLoading,
  loadTasks,
} = useTasks();

const {
  messages,
  isLoading: messagesLoading,
  loadMessages,
  send,
} = useMessages();

const activeTab = ref<'tasks' | 'messages' | 'files'>('tasks');
const taskStatusFilter = ref('');
const showCreateTask = ref(false);
const newTask = ref({
  title: '',
  description: '',
  priority: 'MEDIUM' as any,
  dueDate: '',
});
const newMessage = ref('');

const isLoading = computed(() => 
  projectsLoading.value || tasksLoading.value || messagesLoading.value
);

const tabs = computed(() => [
  { id: 'tasks', label: 'Tasks', badge: tasks.value.length },
  { id: 'messages', label: 'Messages', badge: messages.value.length },
  { id: 'files', label: 'Files', badge: null },
]);

// Methods
function goBack() {
  router.push('/projects');
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

function formatTaskStatus(status: string): string {
  return status.replace('_', ' ');
}

function formatMessageTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function isNearDeadline(deadline: Date | string): boolean {
  const daysUntil = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return daysUntil <= 7 && daysUntil >= 0;
}

function getInitials(userId: string): string {
  return userId.substring(0, 2).toUpperCase();
}

async function handleCreateTask() {
  try {
    // Prepare task data for API call
    const _taskData = {
      projectId: props.id,
      ...newTask.value,
      dueDate: newTask.value.dueDate ? new Date(newTask.value.dueDate) : null,
    };
    // await createTask(taskData);
    showCreateTask.value = false;
    newTask.value = {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: '',
    };
  } catch (err) {
    console.error('Failed to create task:', err);
  }
}

async function handleSendMessage() {
  if (!newMessage.value.trim()) return;
  
  try {
    await send({
      projectId: props.id,
      content: newMessage.value,
      attachments: [],
    });
    newMessage.value = '';
  } catch (err) {
    console.error('Failed to send message:', err);
  }
}

async function handleFinalizeProject() {
  if (confirm('Are you sure you want to finalize this project? This action cannot be undone.')) {
    try {
      await finalizeProject(props.id);
    } catch (err) {
      console.error('Failed to finalize project:', err);
    }
  }
}

// Lifecycle
onMounted(async () => {
  await loadProjectDetails(props.id);
  await loadTasks(props.id);
  await loadMessages(props.id);
});

watch(() => props.id, async (newId) => {
  await loadProjectDetails(newId);
  await loadTasks(newId);
  await loadMessages(newId);
});
</script>

<style scoped>
.project-details-view {
  min-height: 100vh;
  background: var(--color-bg-secondary);
  padding: var(--spacing-8) 0;
}

.back-btn {
  background: none;
  border: none;
  font-size: var(--font-size-base);
  color: var(--color-primary);
  cursor: pointer;
  padding: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  font-weight: var(--font-weight-medium);
}

.back-btn:hover {
  text-decoration: underline;
}

.project-header {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-md);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.header-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.project-code-badge {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-md);
}

.project-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  flex: 1;
}

.status-badge {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.status-badge.status-active {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-badge.status-finalized {
  background: var(--color-text-tertiary);
  color: white;
}

.project-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.project-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.meta-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.text-warning {
  color: var(--color-warning);
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  border-bottom: 2px solid var(--color-border);
}

.tab-btn {
  background: none;
  border: none;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: var(--transition-fast);
  position: relative;
}

.tab-btn:hover {
  color: var(--color-primary);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-badge {
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  margin-left: var(--spacing-2);
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  min-height: 400px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.panel-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.panel-actions {
  display: flex;
  gap: var(--spacing-3);
}

.filter-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

/* Tasks */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.task-card {
  padding: var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.task-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--spacing-2);
}

.task-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.priority-badge {
  padding: 4px 8px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}

.priority-badge.priority-low {
  background: #e0e0e0;
  color: #666;
}

.priority-badge.priority-medium {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.priority-badge.priority-high {
  background: #ffebee;
  color: var(--color-error);
}

.priority-badge.priority-critical {
  background: var(--color-error);
  color: white;
}

.task-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-3);
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.task-status {
  padding: 4px 8px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
}

.task-status.status-pending {
  background: #f5f5f5;
  color: #666;
}

.task-status.status-in_progress {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.task-status.status-completed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.task-due {
  color: var(--color-text-tertiary);
}

/* Messages */
.messages-panel {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: var(--spacing-4);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.message-item {
  display: flex;
  gap: var(--spacing-3);
}

.message-item.message-own {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-item.message-own .message-content {
  text-align: right;
}

.message-header {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-sm);
}

.message-sender {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.message-time {
  color: var(--color-text-tertiary);
}

.message-text {
  padding: var(--spacing-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.message-item.message-own .message-text {
  background: var(--color-primary);
  color: white;
}

.message-attachments {
  margin-top: var(--spacing-2);
  font-size: var(--font-size-xs);
}

.attachment-item {
  padding: var(--spacing-1);
  color: var(--color-primary);
}

.message-input-box {
  display: flex;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.message-textarea {
  flex: 1;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  resize: vertical;
  min-height: 60px;
}

.empty-state,
.error-state {
  text-align: center;
  padding: var(--spacing-12) var(--spacing-4);
}

.empty-state p,
.error-state p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

/* Modal */
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

.task-form {
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
  .header-main {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .project-meta-grid {
    grid-template-columns: 1fr;
  }

  .tabs-nav {
    overflow-x: auto;
  }

  .message-content {
    max-width: 85%;
  }
}
</style>
