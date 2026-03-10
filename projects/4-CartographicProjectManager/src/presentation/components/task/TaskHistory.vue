<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/task/TaskHistory.vue
  @desc Component displaying the audit trail of task changes in timeline format
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div class="task-history">
    <h3 class="task-history-title">
      <span class="task-history-title-icon">🕒</span>
      Activity History
    </h3>

    <!-- Loading state -->
    <div v-if="loading" class="task-history-loading">
      <div v-for="n in 3" :key="n" class="task-history-skeleton">
        <div class="skeleton-avatar" />
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-line-short" />
          <div class="skeleton-line skeleton-line-long" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="history.length === 0" class="task-history-empty">
      <span class="task-history-empty-icon">🕒</span>
      <p>No activity recorded yet</p>
    </div>

    <!-- History timeline -->
    <div v-else class="task-history-timeline">
      <div v-for="(entry, index) in history" :key="entry.id" class="task-history-entry">
        <!-- Timeline connector -->
        <div class="task-history-connector">
          <div :class="['task-history-dot', `task-history-dot-${getActionType(entry.action)}`]" />
          <div v-if="index < history.length - 1" class="task-history-line" />
        </div>

        <!-- Entry content -->
        <div class="task-history-content">
          <!-- Header: User + Time -->
          <div class="task-history-header">
            <span class="task-history-user">{{ entry.userName }}</span>
            <span class="task-history-time">{{ formatRelativeTime(entry.timestamp) }}</span>
          </div>

          <!-- Action description -->
          <p class="task-history-action">{{ formatAction(entry) }}</p>

          <!-- Value change (if applicable) -->
          <div
            v-if="hasValue(entry.previousValue) || hasValue(entry.newValue)"
            class="task-history-change"
          >
            <span v-if="hasValue(entry.previousValue)" class="task-history-old-value">{{ formatValue(entry.previousValue) }}</span>
            <span
              v-if="hasValue(entry.previousValue) && hasValue(entry.newValue)"
              class="task-history-arrow"
            >→</span>
            <span v-if="hasValue(entry.newValue)" class="task-history-new-value">{{ formatValue(entry.newValue) }}</span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {TaskHistoryEntryDto} from '@/application/dto';
import {formatRelativeTime} from '@/shared/utils';

/**
 * TaskHistory component props
 */
export interface TaskHistoryProps {
  /** Task history entries */
  history: TaskHistoryEntryDto[];
  /** Loading state */
  loading?: boolean;
}

withDefaults(defineProps<TaskHistoryProps>(), {
  loading: false,
});

/**
 * Get action type for styling
 */
function getActionType(action: string): 'create' | 'status' | 'update' | 'confirm' | 'reject' {
  const parsed = parseTaskHistoryAction(action);
  switch (parsed.kind) {
    case 'CREATED':
      return 'create';
    case 'STATUS_CHANGED':
      return 'status';
    case 'CONFIRMED':
      return 'confirm';
    case 'REJECTED':
      return 'reject';
    default:
      return 'update';
  }
}

/**
 * Format action for display
 */
function formatAction(entry: TaskHistoryEntryDto): string {
  const parsed = parseTaskHistoryAction(entry.action);
  switch (parsed.kind) {
    case 'CREATED':
      return 'created this task';
    case 'STATUS_CHANGED':
      return 'changed the status';
    case 'CONFIRMED':
      return 'confirmed and completed the task';
    case 'REJECTED':
      return 'rejected and returned the task';
    case 'ASSIGNED':
      return 'reassigned the task';
    case 'PRIORITY_CHANGED':
      return 'changed the priority';
    case 'DUE_DATE_CHANGED':
      return 'changed the due date';
    case 'DESCRIPTION_UPDATED':
      return 'updated the description';
    case 'COMMENT_ADDED':
      return 'added a comment';
    case 'FILE_ATTACHED':
      return 'attached a file';
    case 'FILE_REMOVED':
      return 'removed a file';
    default:
      return parsed.normalized
        .toLowerCase()
        .replace(/_/g, ' ');
  }
}

type ParsedTaskHistoryAction =
  | {kind: 'CREATED'; normalized: string}
  | {kind: 'STATUS_CHANGED'; normalized: string}
  | {kind: 'CONFIRMED'; normalized: string}
  | {kind: 'REJECTED'; normalized: string}
  | {kind: 'ASSIGNED'; normalized: string}
  | {kind: 'PRIORITY_CHANGED'; normalized: string}
  | {kind: 'DUE_DATE_CHANGED'; normalized: string}
  | {kind: 'DESCRIPTION_UPDATED'; normalized: string}
  | {kind: 'COMMENT_ADDED'; normalized: string}
  | {kind: 'FILE_ATTACHED'; normalized: string}
  | {kind: 'FILE_REMOVED'; normalized: string}
  | {kind: 'UNKNOWN'; normalized: string};

function normalizeActionKey(action: string): string {
  return action.trim().toUpperCase().replace(/\s+/g, '_');
}

function parseTaskHistoryAction(action: string): ParsedTaskHistoryAction {
  const normalized = normalizeActionKey(action);

  switch (normalized) {
    case 'CREATED':
    case 'CREATE':
      return {kind: 'CREATED', normalized};
    case 'STATUS_CHANGED':
    case 'STATUS_CHANGE':
    case 'STATUS_CHANGE_REQUESTED':
      return {kind: 'STATUS_CHANGED', normalized};
    case 'CONFIRMED':
    case 'COMPLETED':
      return {kind: 'CONFIRMED', normalized};
    case 'REJECTED':
      return {kind: 'REJECTED', normalized};
    case 'ASSIGNED':
    case 'REASSIGNED':
      return {kind: 'ASSIGNED', normalized};
    case 'PRIORITY_CHANGED':
      return {kind: 'PRIORITY_CHANGED', normalized};
    case 'DUE_DATE_CHANGED':
      return {kind: 'DUE_DATE_CHANGED', normalized};
    case 'DESCRIPTION_UPDATED':
      return {kind: 'DESCRIPTION_UPDATED', normalized};
    case 'COMMENT_ADDED':
      return {kind: 'COMMENT_ADDED', normalized};
    case 'FILE_ATTACHED':
    case 'FILE_ADDED':
      return {kind: 'FILE_ATTACHED', normalized};
    case 'FILE_REMOVED':
    case 'FILE_DELETED':
      return {kind: 'FILE_REMOVED', normalized};
    default:
      return {kind: 'UNKNOWN', normalized};
  }
}

function hasValue(value: string | null | undefined): value is string {
  return value !== null && value !== undefined;
}

/**
 * Format value for display
 */
function formatValue(value: string): string {
  if (value === '') {
    return '(empty)';
  }

  // Check if it's a status value
  const statusLabels: Record<string, string> = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    PARTIAL: 'Partial',
    PERFORMED: 'Performed',
    COMPLETED: 'Completed',
  };

  if (statusLabels[value]) {
    return statusLabels[value];
  }

  // Check if it's a priority value
  const priorityLabels: Record<string, string> = {
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  };

  if (priorityLabels[value]) {
    return priorityLabels[value];
  }

  // Check if it's a date (ISO format)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString();
  }

  // Default: return as is, but truncate if too long
  return value.length > 50 ? value.slice(0, 50) + '...' : value;
}
</script>

<style scoped>
.task-history {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.task-history-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.task-history-title-icon {
  font-size: 18px;
}

/* Loading */
.task-history-loading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.task-history-skeleton {
  display: flex;
  gap: var(--spacing-3);
}

.skeleton-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-gray-200);
  flex-shrink: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.skeleton-line {
  height: 12px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line-short {
  width: 120px;
}
.skeleton-line-long {
  width: 80%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Empty state */
.task-history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  color: var(--color-text-secondary);
  text-align: center;
}

.task-history-empty-icon {
  font-size: 40px;
  margin-bottom: var(--spacing-3);
}

.task-history-empty p {
  margin: 0;
  font-size: var(--font-size-sm);
}

/* Timeline */
.task-history-timeline {
  display: flex;
  flex-direction: column;
}

.task-history-entry {
  display: flex;
  gap: var(--spacing-3);
  position: relative;
}

/* Connector (dot + line) */
.task-history-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}

.task-history-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background-color: var(--color-gray-400);
  flex-shrink: 0;
  margin-top: 6px;
}

.task-history-dot-create {
  background-color: var(--color-success-500);
}

.task-history-dot-status {
  background-color: var(--color-primary-500);
}

.task-history-dot-confirm {
  background-color: var(--color-success-500);
}

.task-history-dot-reject {
  background-color: var(--color-error-500);
}

.task-history-dot-update {
  background-color: var(--color-gray-400);
}

.task-history-line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background-color: var(--color-border-primary);
  margin-top: var(--spacing-1);
}

/* Entry content */
.task-history-content {
  flex: 1;
  padding-bottom: var(--spacing-4);
  min-width: 0;
}

.task-history-header {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.task-history-user {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.task-history-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.task-history-action {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-1) 0 0;
}

/* Value change */
.task-history-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.task-history-old-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: line-through;
}

.task-history-arrow {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.task-history-new-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* Comment */
.task-history-comment {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-primary-50);
  border-left: 3px solid var(--color-primary-400);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.task-history-comment-icon {
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}

.task-history-comment-text {
  font-size: var(--font-size-sm);
  font-style: italic;
  color: var(--color-text-secondary);
  margin: 0;
  word-break: break-word;
}
</style>
