<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/task/TaskForm.vue
  @desc Form component for creating/editing tasks with status transitions and confirmation
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <form class="task-form" novalidate @submit.prevent="handleSubmit">
    <h2 class="task-form-title">{{ isEditMode ? 'Edit Task' : 'Create New Task' }}</h2>

    <!-- Status change section (edit mode only) -->
    <div v-if="isEditMode && !isCompleted" class="task-form-status-section">
      <label class="task-form-label">Current Status</label>
      <div class="task-form-status-current">
        <span :class="['task-form-status-badge']" :style="{backgroundColor: currentStatusBgColor, color: currentStatusColor}">
          {{ currentStatusLabel }}
        </span>

        <!-- Status transition buttons -->
        <div v-if="validTransitions.length > 0" class="task-form-status-transitions">
          <span class="task-form-status-arrow">→</span>
          <button
            v-for="status in validTransitions"
            :key="status"
            type="button"
            :class="['task-form-status-option', {'task-form-status-option-selected': selectedNewStatus === status}]"
            :style="{'--status-color': getStatusColor(status)}"
            @click="selectStatusTransition(status)"
          >
            {{ getStatusLabel(status) }}
          </button>
        </div>
      </div>

      <!-- Confirm/Reject for PERFORMED→COMPLETED (admin only) -->
      <div
        v-if="selectedNewStatus === TaskStatus.COMPLETED && task?.status === TaskStatus.PERFORMED && canConfirm"
        class="task-form-status-comment"
      >
        <label class="task-form-label">
          Confirmation Feedback
          <span class="task-form-optional">(Optional)</span>
        </label>
        <textarea
          v-model="statusComment"
          class="task-form-textarea"
          rows="2"
          placeholder="Add feedback about this confirmation or rejection..."
        />
        <div class="task-form-confirm-actions">
          <button type="button" class="task-form-btn task-form-btn-success" @click="handleConfirm(true)">
            <span>✓</span>
            <span>Confirm & Complete</span>
          </button>
          <button type="button" class="task-form-btn task-form-btn-danger" @click="handleConfirm(false)">
            <span>✕</span>
            <span>Reject</span>
          </button>
        </div>
      </div>

      <!-- Status change comment for other transitions -->
      <div v-else-if="selectedNewStatus" class="task-form-status-comment">
        <label for="status-comment" class="task-form-label">
          Status Change Comment
          <span class="task-form-optional">(Optional)</span>
        </label>
        <textarea
          id="status-comment"
          v-model="statusComment"
          class="task-form-textarea"
          rows="2"
          placeholder="Add a comment about this status change..."
        />

        <!-- Apply status change button -->
        <button
          type="button"
          class="task-form-btn task-form-btn-secondary"
          @click="applyStatusChange"
        >
          Apply Status Change
        </button>
      </div>
    </div>

    <!-- Completed notice -->
    <div v-if="isCompleted" class="task-form-completed-notice">
      <span>✓</span>
      <span>This task is completed and cannot be modified.</span>
    </div>

    <!-- Description -->
    <div class="task-form-field">
      <label for="task-description" class="task-form-label">
        Description
        <span class="task-form-required">*</span>
      </label>
      <textarea
        id="task-description"
        v-model="form.description"
        class="task-form-textarea"
        :class="{'task-form-input-error': errors.description}"
        rows="4"
        placeholder="Describe the task..."
        :maxlength="TASK.DESCRIPTION_MAX_LENGTH"
        :disabled="isCompleted"
        required
        @blur="validateField('description')"
      />
      <div class="task-form-field-footer">
        <p v-if="errors.description" class="task-form-error">{{ errors.description }}</p>
        <span class="task-form-char-count">{{ form.description.length }}/{{ TASK.DESCRIPTION_MAX_LENGTH }}</span>
      </div>
    </div>

    <!-- Comments/Notes -->
    <div class="task-form-field">
      <label for="task-comments" class="task-form-label">
        Comments / Notes
        <span class="task-form-optional">(Optional)</span>
      </label>
      <textarea
        id="task-comments"
        v-model="form.comments"
        class="task-form-textarea"
        :class="{'task-form-input-error': errors.comments}"
        rows="3"
        placeholder="Additional notes or instructions..."
        :maxlength="TASK.COMMENTS_MAX_LENGTH"
        :disabled="isCompleted"
        @blur="validateField('comments')"
      />
      <div class="task-form-field-footer">
        <p v-if="errors.comments" class="task-form-error">{{ errors.comments }}</p>
        <span class="task-form-char-count">{{ (form.comments || '').length }}/{{ TASK.COMMENTS_MAX_LENGTH }}</span>
      </div>
    </div>

    <!-- Assignee & Priority row -->
    <div class="task-form-row">
      <!-- Assignee -->
      <div class="task-form-field">
        <label for="task-assignee" class="task-form-label">
          Assignee
          <span class="task-form-required">*</span>
        </label>
        <select
          id="task-assignee"
          v-model="form.assigneeId"
          class="task-form-select"
          :class="{'task-form-input-error': errors.assigneeId}"
          :disabled="isCompleted"
          required
          @blur="validateField('assigneeId')"
          @change="validateField('assigneeId')"
        >
          <option value="" disabled>Select assignee</option>
          <option v-for="assignee in assignees" :key="assignee.id" :value="assignee.id">
            {{ assignee.name }} ({{ assignee.role }})
          </option>
        </select>
        <p v-if="errors.assigneeId" class="task-form-error">{{ errors.assigneeId }}</p>
      </div>

      <!-- Priority -->
      <div class="task-form-field">
        <label for="task-priority" class="task-form-label">
          Priority
          <span class="task-form-required">*</span>
        </label>
        <select
          id="task-priority"
          v-model="form.priority"
          class="task-form-select"
          :class="{'task-form-input-error': errors.priority}"
          :disabled="isCompleted"
          required
          @blur="validateField('priority')"
          @change="validateField('priority')"
        >
          <option value="" disabled>Select priority</option>
          <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p v-if="errors.priority" class="task-form-error">{{ errors.priority }}</p>

        <!-- Priority indicator -->
        <div v-if="form.priority" class="task-form-priority-indicator">
          <span class="task-form-priority-dot" :style="{backgroundColor: getPriorityColor(form.priority)}" />
          <span>{{ getPriorityLabel(form.priority) }} Priority</span>
        </div>
      </div>
    </div>

    <!-- Due Date -->
    <div class="task-form-field">
      <label for="task-due-date" class="task-form-label">
        Due Date
        <span class="task-form-required">*</span>
      </label>
      <input
        id="task-due-date"
        v-model="form.dueDate"
        type="date"
        class="task-form-input"
        :class="{'task-form-input-error': errors.dueDate}"
        :disabled="isCompleted"
        required
        @blur="validateField('dueDate')"
        @change="validateField('dueDate')"
      />
      <p v-if="errors.dueDate" class="task-form-error">{{ errors.dueDate }}</p>
    </div>

    <!-- Attached Files (edit mode only) -->
    <div v-if="isEditMode && taskFiles.length > 0" class="task-form-files">
      <label class="task-form-label">Attached Files</label>
      <div class="task-form-files-list">
        <div v-for="file in taskFiles" :key="file.id" class="task-form-file">
          <span class="task-form-file-icon">📎</span>
          <span class="task-form-file-name">{{ file.name }}</span>
          <span class="task-form-file-size">{{ formatFileSize(file.sizeInBytes) }}</span>
          <button
            v-if="!isCompleted"
            type="button"
            class="task-form-file-remove"
            title="Remove file"
            @click="emit('remove-file', file.id)"
          >
            <span>✕</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Form actions -->
    <div class="task-form-actions">
      <button type="button" class="task-form-btn task-form-btn-secondary" :disabled="loading" @click="emit('cancel')">
        Cancel
      </button>

      <button v-if="!isCompleted" type="submit" class="task-form-btn task-form-btn-primary" :disabled="loading || !isFormValid">
        <span v-if="loading" class="task-form-spinner">⏳</span>
        <span>{{ isEditMode ? 'Update Task' : 'Create Task' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import {ref, reactive, computed, onMounted} from 'vue';
import type {CreateTaskDto, UpdateTaskDto, ChangeTaskStatusDto, ConfirmTaskDto} from '@/application/dto';
import type {TaskViewModel} from '@/presentation/view-models/task.view-model';
import {TaskStatus, TaskPriority} from '@/domain/enumerations';
import {TASK, TASK_PRIORITY_COLORS, TASK_STATUS_COLORS} from '@/shared/constants';
import {formatFileSize} from '@/shared/utils';

/**
 * TaskForm component props
 */
export interface TaskFormProps {
  /** Task to edit (undefined for create mode) */
  task?: TaskViewModel;
  /** Project ID (required for create mode) */
  projectId?: string;
  /** Available assignees (project participants) */
  assignees: Array<{id: string; name: string; role: string}>;
  /** Form submission loading state */
  loading?: boolean;
  /** Can current user confirm tasks (admin only for PERFORMED→COMPLETED) */
  canConfirm?: boolean;
  /** Project contract date (start date) */
  projectContractDate?: Date | string;
  /** Project delivery date (end date) */
  projectDeliveryDate?: Date | string;
}

/**
 * TaskForm component emits
 */
export interface TaskFormEmits {
  (e: 'submit', data: CreateTaskDto | UpdateTaskDto): void;
  (e: 'cancel'): void;
  (e: 'status-change', data: ChangeTaskStatusDto): void;
  (e: 'confirm', data: ConfirmTaskDto): void;
  (e: 'remove-file', fileId: string): void;
}

const props = withDefaults(defineProps<TaskFormProps>(), {
  loading: false,
  canConfirm: false,
});

const emit = defineEmits<TaskFormEmits>();

// Form state
const form = reactive({
  description: '',
  comments: '' as string | null,
  assigneeId: '',
  priority: '' as TaskPriority | '',
  dueDate: '',
});

const errors = reactive<Record<string, string>>({});

// Status change state
const selectedNewStatus = ref<TaskStatus | null>(null);
const statusComment = ref('');

// Computed
const isEditMode = computed(() => !!props.task);
const isCompleted = computed(() => props.task?.status === TaskStatus.COMPLETED);

const taskFiles = computed(() => props.task?.files || []);

const validTransitions = computed(() => {
  if (!props.task) return [];
  return props.task.allowedStatusTransitions || [];
});

const currentStatusColor = computed(() => (props.task ? TASK_STATUS_COLORS[props.task.status] : ''));

const currentStatusBgColor = computed(() => (props.task ? `${TASK_STATUS_COLORS[props.task.status]}20` : ''));

const currentStatusLabel = computed(() => (props.task ? getStatusLabel(props.task.status) : ''));

const priorityOptions = computed(() => [
  {value: TaskPriority.HIGH, label: '🟠 High'},
  {value: TaskPriority.MEDIUM, label: '🟡 Medium'},
  {value: TaskPriority.LOW, label: '🟢 Low'},
]);

const isFormValid = computed(() => {
  const hasRequired = Boolean(
    form.description && form.assigneeId && form.priority && form.dueDate,
  );
  const hasNoErrors = Object.values(errors).every((e) => !e);
  return hasRequired && hasNoErrors;
});

/**
 * Initialize form for edit mode
 */
onMounted(() => {
  if (props.task) {
    form.description = props.task.description;
    form.comments = props.task.comments;
    form.assigneeId = props.task.assigneeId;
    form.priority = props.task.priority;
    form.dueDate = formatDateForInput(props.task.dueDate);
  }
});

/**
 * Get status label
 */
function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.PENDING]: 'Pending',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.PARTIAL]: 'Partial',
    [TaskStatus.PERFORMED]: 'Performed',
    [TaskStatus.COMPLETED]: 'Completed',
  };
  return labels[status];
}

/**
 * Get status color
 */
function getStatusColor(status: TaskStatus): string {
  return TASK_STATUS_COLORS[status];
}

/**
 * Get priority label
 */
function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    [TaskPriority.HIGH]: 'High',
    [TaskPriority.MEDIUM]: 'Medium',
    [TaskPriority.LOW]: 'Low',
  };
  return labels[priority];
}

/**
 * Get priority color
 */
function getPriorityColor(priority: TaskPriority): string {
  return TASK_PRIORITY_COLORS[priority];
}

/**
 * Format date for input
 */
function formatDateForInput(date: Date | string): string {
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

  let d: Date;
  if (typeof date === 'string' && dateOnlyRegex.test(date)) {
    d = parseDateOnlyInput(date);
  } else {
    d = new Date(date);
  }

  if (!Number.isFinite(d.getTime())) {
    return '';
  }

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

function parseDateOnlyInput(value: string): Date {
  const [year, month, day] = value.split('-').map((part) => parseInt(part, 10));
  return new Date(year, month - 1, day);
}

/**
 * Validate field
 */
function validateField(field: string): void {
  errors[field] = '';

  switch (field) {
    case 'description':
      if (!form.description) {
        errors.description = 'Description is required';
      } else if (form.description.length > TASK.DESCRIPTION_MAX_LENGTH) {
        errors.description = `Description must be ${TASK.DESCRIPTION_MAX_LENGTH} characters or less`;
      }
      break;

    case 'comments':
      if (form.comments && form.comments.length > TASK.COMMENTS_MAX_LENGTH) {
        errors.comments = `Comments must be ${TASK.COMMENTS_MAX_LENGTH} characters or less`;
      }
      break;

    case 'assigneeId':
      if (!form.assigneeId) {
        errors.assigneeId = 'Please select an assignee';
      }
      break;

    case 'priority':
      if (!form.priority) {
        errors.priority = 'Please select a priority';
      }
      break;

    case 'dueDate':
      if (!form.dueDate) {
        errors.dueDate = 'Due date is required';
      } else if (props.projectContractDate && props.projectDeliveryDate) {
        const dueDate = parseDateOnlyInput(form.dueDate);
        const contractDate = new Date(props.projectContractDate);
        const deliveryDate = new Date(props.projectDeliveryDate);
        
        if (dueDate < contractDate || dueDate > deliveryDate) {
          const contractStr = contractDate.toLocaleDateString();
          const deliveryStr = deliveryDate.toLocaleDateString();
          errors.dueDate = `Due date must be between ${contractStr} and ${deliveryStr}`;
        }
      }
      break;
  }
}

/**
 * Validate all fields
 */
function validateAllFields(): boolean {
  ['description', 'comments', 'assigneeId', 'priority', 'dueDate'].forEach(validateField);
  return Object.values(errors).every((e) => !e);
}

/**
 * Select status transition
 */
function selectStatusTransition(status: TaskStatus): void {
  selectedNewStatus.value = selectedNewStatus.value === status ? null : status;
  statusComment.value = '';
}

/**
 * Apply status change
 */
function applyStatusChange(): void {
  if (!props.task || !selectedNewStatus.value) return;

  emit('status-change', {
    taskId: props.task.id,
    newStatus: selectedNewStatus.value,
    comment: statusComment.value || undefined,
  });

  selectedNewStatus.value = null;
  statusComment.value = '';
}

/**
 * Handle confirm
 */
function handleConfirm(confirmed: boolean): void {
  if (!props.task) return;

  emit('confirm', {
    taskId: props.task.id,
    confirmed,
    feedback: statusComment.value || undefined,
  });

  statusComment.value = '';
}

/**
 * Handle submit
 */
function handleSubmit(): void {
  if (!validateAllFields() || isCompleted.value) return;

  if (isEditMode.value) {
    const updateData: UpdateTaskDto = {
      id: props.task!.id,
      description: form.description,
      comments: form.comments || undefined,
      assigneeId: form.assigneeId,
      priority: form.priority as TaskPriority,
      dueDate: parseDateOnlyInput(form.dueDate),
    };
    emit('submit', updateData);
  } else {
    const createData: CreateTaskDto = {
      projectId: props.projectId!,
      description: form.description,
      comments: form.comments || undefined,
      assigneeId: form.assigneeId,
      priority: form.priority as TaskPriority,
      dueDate: parseDateOnlyInput(form.dueDate),
    };
    emit('submit', createData);
  }
}
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  max-width: 600px;
}

.task-form-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
}

/* Status Section */
.task-form-status-section {
  padding: var(--spacing-4);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-lg);
}

.task-form-status-current {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  margin-top: var(--spacing-2);
}

.task-form-status-badge {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
}

.task-form-status-transitions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.task-form-status-arrow {
  color: var(--color-text-tertiary);
}

.task-form-status-option {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--status-color, var(--color-gray-300));
  color: var(--status-color, var(--color-text-secondary));
  background-color: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.task-form-status-option:hover,
.task-form-status-option-selected {
  background-color: var(--status-color);
  color: white;
}

.task-form-status-comment {
  margin-top: var(--spacing-3);
}

.task-form-confirm-actions {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
}

/* Completed notice */
.task-form-completed-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-success-50);
  color: var(--color-success-700);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

/* Form fields */
.task-form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

@media (max-width: 640px) {
  .task-form-row {
    grid-template-columns: 1fr;
  }
}

.task-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.task-form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.task-form-required {
  color: var(--color-error-500);
  margin-left: 2px;
}

.task-form-optional {
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.task-form-input,
.task-form-select,
.task-form-textarea {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.task-form-input {
  height: 40px;
}

.task-form-textarea {
  resize: vertical;
  min-height: 80px;
}

.task-form-input:focus,
.task-form-select:focus,
.task-form-textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.task-form-input:disabled,
.task-form-select:disabled,
.task-form-textarea:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.task-form-input-error {
  border-color: var(--color-error-500);
}

.task-form-input-error:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

.task-form-select {
  height: 40px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-3) center;
  padding-right: 40px;
  cursor: pointer;
}

.task-form-field-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-form-error {
  font-size: var(--font-size-xs);
  color: var(--color-error-600);
  margin: 0;
}

.task-form-char-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.task-form-priority-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.task-form-priority-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

/* Files section */
.task-form-files {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.task-form-files-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.task-form-file {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.task-form-file-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.task-form-file-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-form-file-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.task-form-file-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.task-form-file-remove:hover {
  color: var(--color-error-600);
  background-color: var(--color-error-100);
}

/* Actions */
.task-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-primary);
}

.task-form-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  height: 40px;
  padding: 0 var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.task-form-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.task-form-btn-primary {
  color: white;
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.task-form-btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.task-form-btn-secondary {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-primary);
}

.task-form-btn-secondary:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.task-form-btn-success {
  color: white;
  background-color: var(--color-success-600);
  border-color: var(--color-success-600);
}

.task-form-btn-success:hover:not(:disabled) {
  background-color: var(--color-success-700);
}

.task-form-btn-danger {
  color: white;
  background-color: var(--color-error-600);
  border-color: var(--color-error-600);
}

.task-form-btn-danger:hover:not(:disabled) {
  background-color: var(--color-error-700);
}

.task-form-spinner {
  font-size: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
