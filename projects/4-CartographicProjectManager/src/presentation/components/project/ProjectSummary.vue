<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/project/ProjectSummary.vue
  @desc Detailed project summary panel showing metadata, stats, and actions
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div class="project-summary">
    <!-- Loading state -->
    <div v-if="loading" class="project-summary-loading">
      <span class="project-summary-spinner">⏳</span>
      <p>Loading project details...</p>
    </div>

    <template v-else>
      <!-- Header Section -->
      <header class="project-summary-header">
        <div class="project-summary-header-main">
          <!-- Code and Status -->
          <div class="project-summary-meta">
            <span class="project-summary-code">{{ project.code }}</span>
            <span :class="['project-summary-status', `project-summary-status-${statusColor}`]">
              {{ statusLabel }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="project-summary-title">{{ project.name }}</h1>

          <!-- Client & Type -->
          <div class="project-summary-info">
            <div class="project-summary-info-item">
              <span class="project-summary-info-icon">👤</span>
              <span>{{ project.clientName }}</span>
            </div>
            <span class="project-summary-info-divider">•</span>
            <div class="project-summary-info-item">
              <span class="project-summary-info-icon">🏷️</span>
              <span>{{ typeLabel }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="project-summary-actions">
          <button
            v-if="permissions.canEdit && !isFinalized"
            type="button"
            class="project-summary-action-btn"
            @click="$emit('edit')"
          >
            <span>✏️</span>
            <span>Edit</span>
          </button>

          <button
            v-if="permissions.canFinalize && !isFinalized"
            type="button"
            class="project-summary-action-btn project-summary-action-btn-primary"
            :disabled="!canFinalize"
            :title="!canFinalize ? 'Complete all tasks before finalizing' : 'Finalize project'"
            @click="$emit('finalize')"
          >
            <span>✓</span>
            <span>Finalize</span>
          </button>

          <button
            v-if="permissions.canDelete"
            type="button"
            class="project-summary-action-btn project-summary-action-btn-danger"
            @click="$emit('delete')"
          >
            <span>🗑️</span>
          </button>
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="project-summary-stats">
        <!-- Tasks Stat -->
        <div class="project-summary-stat project-summary-stat-clickable" @click="$emit('view-tasks')">
          <div class="project-summary-stat-icon project-summary-stat-icon-tasks">
            <span>✓</span>
          </div>
          <div class="project-summary-stat-content">
            <span class="project-summary-stat-value"> {{ taskStats.completed }}/{{ taskStats.total }} </span>
            <span class="project-summary-stat-label">Tasks Completed</span>
          </div>
          <div
            v-if="taskStats.pending > 0"
            class="project-summary-stat-badge project-summary-stat-badge-warning"
          >
            {{ taskStats.pending }} pending
          </div>
        </div>

        <!-- Messages Stat -->
        <div
          class="project-summary-stat project-summary-stat-clickable"
          @click="$emit('view-messages')"
        >
          <div class="project-summary-stat-icon project-summary-stat-icon-messages">
            <span>💬</span>
          </div>
          <div class="project-summary-stat-content">
            <span class="project-summary-stat-value"> {{ projectDetails.unreadMessagesCount }} </span>
            <span class="project-summary-stat-label">Unread Messages</span>
          </div>
          <div
            v-if="projectDetails.unreadMessagesCount > 0"
            class="project-summary-stat-badge project-summary-stat-badge-primary"
          >
            New
          </div>
        </div>

        <!-- Delivery Date Stat -->
        <div class="project-summary-stat">
          <div
            :class="[
              'project-summary-stat-icon',
              isOverdue ? 'project-summary-stat-icon-danger' : 'project-summary-stat-icon-info',
            ]"
          >
            <span>📅</span>
          </div>
          <div class="project-summary-stat-content">
            <span class="project-summary-stat-value">{{ formattedDeliveryDate }}</span>
            <span class="project-summary-stat-label">
              <template v-if="isFinalized">Delivered</template>
              <template v-else-if="isOverdue">Overdue by {{ Math.abs(daysUntilDelivery) }} days</template>
              <template v-else>{{ daysUntilDelivery }} days remaining</template>
            </span>
          </div>
          <div
            v-if="isOverdue && !isFinalized"
            class="project-summary-stat-badge project-summary-stat-badge-danger"
          >
            Overdue
          </div>
        </div>

        <!-- Participants Stat -->
        <div
          class="project-summary-stat project-summary-stat-clickable"
          @click="$emit('view-participants')"
        >
          <div class="project-summary-stat-icon project-summary-stat-icon-participants">
            <span>👥</span>
          </div>
          <div class="project-summary-stat-content">
            <span class="project-summary-stat-value">{{ participants.length }}</span>
            <span class="project-summary-stat-label">Participants</span>
          </div>
        </div>
      </div>

      <!-- Project Dates -->
      <div class="project-summary-dates">
        <div class="project-summary-date">
          <span class="project-summary-date-label">Contract Date</span>
          <span class="project-summary-date-value">{{ formattedContractDate }}</span>
        </div>
        <div class="project-summary-date">
          <span class="project-summary-date-label">Delivery Date</span>
          <span class="project-summary-date-value">{{ formattedDeliveryDate }}</span>
        </div>
        <div v-if="project.finalizedAt" class="project-summary-date">
          <span class="project-summary-date-label">Finalized At</span>
          <span class="project-summary-date-value">{{ formattedFinalizedDate }}</span>
        </div>
      </div>

      <!-- Coordinates (if available) -->
      <div v-if="hasCoordinates" class="project-summary-coordinates">
        <h3 class="project-summary-section-title">
          <span class="project-summary-section-icon">📍</span>
          Geographic Location
        </h3>
        <div class="project-summary-coordinates-grid">
          <div class="project-summary-coordinate">
            <span class="project-summary-coordinate-label">Longitude (X)</span>
            <span class="project-summary-coordinate-value">{{ project.coordinateX?.toFixed(6) }}</span>
          </div>
          <div class="project-summary-coordinate">
            <span class="project-summary-coordinate-label">Latitude (Y)</span>
            <span class="project-summary-coordinate-value">{{ project.coordinateY?.toFixed(6) }}</span>
          </div>
        </div>
      </div>

      <!-- Project Sections -->
      <div v-if="sections.length > 0" class="project-summary-sections">
        <h3 class="project-summary-section-title">
          <span class="project-summary-section-icon">📁</span>
          Project Sections
        </h3>
        <div class="project-summary-sections-grid">
          <div
            v-for="section in sections"
            :key="section.key"
            class="project-summary-section-card"
            @click="$emit('view-files')"
          >
            <span class="project-summary-section-card-icon">📁</span>
            <div class="project-summary-section-card-content">
              <span class="project-summary-section-card-name">{{ section.name }}</span>
              <span class="project-summary-section-card-count">{{ section.fileCount }} files</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Participants Preview -->
      <div v-if="participants.length > 0" class="project-summary-participants">
        <div class="project-summary-participants-header">
          <h3 class="project-summary-section-title">
            <span class="project-summary-section-icon">👥</span>
            Participants
          </h3>
          <button type="button" class="project-summary-view-all" @click="$emit('view-participants')">
            View all
          </button>
        </div>
        <div class="project-summary-participants-list">
          <div
            v-for="participant in participantsPreview"
            :key="participant.userId"
            class="project-summary-participant"
          >
            <div class="project-summary-participant-avatar">{{ getInitials(participant.username) }}</div>
            <div class="project-summary-participant-info">
              <span class="project-summary-participant-name">{{ participant.username }}</span>
              <span class="project-summary-participant-role">{{ getRoleLabel(participant.role) }}</span>
            </div>
          </div>
          <div v-if="participants.length > 3" class="project-summary-participants-more">
            +{{ participants.length - 3 }} more
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import type {ProjectDetailsDto} from '@/application/dto';
import {ProjectStatus, ProjectType, UserRole} from '@/domain/enumerations';
import {formatDate, daysUntil} from '@/shared/utils';

/**
 * ProjectSummary component props
 */
export interface ProjectSummaryProps {
  /** Project details data */
  projectDetails: ProjectDetailsDto;
  /** Loading state */
  loading?: boolean;
}

/**
 * ProjectSummary component emits
 */
export interface ProjectSummaryEmits {
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'finalize'): void;
  (e: 'view-tasks'): void;
  (e: 'view-messages'): void;
  (e: 'view-files'): void;
  (e: 'view-participants'): void;
}

const props = withDefaults(defineProps<ProjectSummaryProps>(), {
  loading: false,
});

defineEmits<ProjectSummaryEmits>();

// Computed - shortcuts
const project = computed(() => props.projectDetails.project);
const taskStats = computed(() => props.projectDetails.taskStats);
const participants = computed(() => props.projectDetails.participants);
const sections = computed(() => props.projectDetails.sections);
const permissions = computed(() => props.projectDetails.currentUserPermissions);

// Computed - status
const isFinalized = computed(() => project.value.status === ProjectStatus.FINALIZED);
const canFinalize = computed(() => taskStats.value.pending === 0);

const daysUntilDelivery = computed(() => daysUntil(project.value.deliveryDate));
const isOverdue = computed(() => daysUntilDelivery.value < 0 && !isFinalized.value);

// Computed - formatting
const statusLabel = computed(() => {
  const labels: Record<ProjectStatus, string> = {
    [ProjectStatus.ACTIVE]: 'Active',
    [ProjectStatus.IN_PROGRESS]: 'In Progress',
    [ProjectStatus.PENDING_REVIEW]: 'Pending Review',
    [ProjectStatus.FINALIZED]: 'Finalized',
  };
  return labels[project.value.status];
});

const statusColor = computed(() => {
  if (isFinalized.value) return 'gray';
  if (isOverdue.value) return 'red';
  if (taskStats.value.pending > 0) return 'yellow';
  return 'green';
});

const typeLabel = computed(() => {
  const labels: Record<ProjectType, string> = {
    [ProjectType.RESIDENTIAL]: 'Residential',
    [ProjectType.COMMERCIAL]: 'Commercial',
    [ProjectType.INDUSTRIAL]: 'Industrial',
    [ProjectType.PUBLIC]: 'Public',
  };
  return labels[project.value.type];
});

const formattedContractDate = computed(() => formatDate(project.value.contractDate, 'dd MMMM yyyy'));
const formattedDeliveryDate = computed(() => formatDate(project.value.deliveryDate, 'dd MMMM yyyy'));
const formattedFinalizedDate = computed(() =>
  project.value.finalizedAt ? formatDate(project.value.finalizedAt, 'dd MMMM yyyy') : '',
);

const hasCoordinates = computed(
  () => project.value.coordinateX !== null && project.value.coordinateY !== null,
);

const participantsPreview = computed(() => participants.value.slice(0, 3));

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

/**
 * Get role label
 */
function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMINISTRATOR]: 'Administrator',
    [UserRole.CLIENT]: 'Client',
    [UserRole.SPECIAL_USER]: 'Special User',
  };
  return labels[role] || role;
}
</script>

<style scoped>
.project-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.project-summary-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-12);
  color: var(--color-text-secondary);
}

.project-summary-spinner {
  font-size: 32px;
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

/* Header */
.project-summary-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-4);
}

.project-summary-header-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.project-summary-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.project-summary-code {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-summary-status {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

.project-summary-status-green {
  color: var(--color-success-700);
  background-color: var(--color-success-100);
}

.project-summary-status-yellow {
  color: var(--color-warning-700);
  background-color: var(--color-warning-100);
}

.project-summary-status-red {
  color: var(--color-error-700);
  background-color: var(--color-error-100);
}

.project-summary-status-gray {
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
}

.project-summary-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.project-summary-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.project-summary-info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.project-summary-info-icon {
  font-size: 14px;
}

.project-summary-info-divider {
  color: var(--color-gray-300);
}

/* Actions */
.project-summary-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.project-summary-action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.project-summary-action-btn:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.project-summary-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.project-summary-action-btn-primary {
  color: white;
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.project-summary-action-btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.project-summary-action-btn-danger {
  color: var(--color-error-600);
  border-color: var(--color-error-300);
}

.project-summary-action-btn-danger:hover:not(:disabled) {
  color: var(--color-error-700);
  background-color: var(--color-error-50);
}

/* Stats Grid */
.project-summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

.project-summary-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  position: relative;
}

.project-summary-stat-clickable {
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.project-summary-stat-clickable:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
}

.project-summary-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
  font-size: 24px;
}

.project-summary-stat-icon-tasks {
  background-color: var(--color-primary-100);
  color: var(--color-primary-600);
}

.project-summary-stat-icon-messages {
  background-color: var(--color-info-100);
  color: var(--color-info-600);
}

.project-summary-stat-icon-info {
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
}

.project-summary-stat-icon-danger {
  background-color: var(--color-error-100);
  color: var(--color-error-600);
}

.project-summary-stat-icon-participants {
  background-color: var(--color-success-100);
  color: var(--color-success-600);
}

.project-summary-stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.project-summary-stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.project-summary-stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.project-summary-stat-badge {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.project-summary-stat-badge-warning {
  color: var(--color-warning-700);
  background-color: var(--color-warning-100);
}

.project-summary-stat-badge-primary {
  color: var(--color-primary-700);
  background-color: var(--color-primary-100);
}

.project-summary-stat-badge-danger {
  color: var(--color-error-700);
  background-color: var(--color-error-100);
}

/* Dates */
.project-summary-dates {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-6);
  padding: var(--spacing-4);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-lg);
}

.project-summary-date {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.project-summary-date-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-summary-date-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Section titles */
.project-summary-section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.project-summary-section-icon {
  font-size: 18px;
  color: var(--color-text-secondary);
}

/* Coordinates */
.project-summary-coordinates {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.project-summary-coordinates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.project-summary-coordinate {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.project-summary-coordinate-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.project-summary-coordinate-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  font-family: monospace;
  color: var(--color-text-primary);
}

/* Sections */
.project-summary-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.project-summary-sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-3);
}

.project-summary-section-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.project-summary-section-card:hover {
  border-color: var(--color-primary-300);
}

.project-summary-section-card-icon {
  font-size: 20px;
  color: var(--color-primary-500);
}

.project-summary-section-card-content {
  display: flex;
  flex-direction: column;
}

.project-summary-section-card-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.project-summary-section-card-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Participants */
.project-summary-participants {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.project-summary-participants-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-summary-view-all {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.project-summary-view-all:hover {
  text-decoration: underline;
}

.project-summary-participants-list {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.project-summary-participant {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-full);
}

.project-summary-participant-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  color: white;
  background-color: var(--color-primary-500);
  border-radius: var(--radius-full);
}

.project-summary-participant-info {
  display: flex;
  flex-direction: column;
}

.project-summary-participant-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.project-summary-participant-role {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.project-summary-participants-more {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--spacing-2);
}

/* Responsive */
@media (max-width: 640px) {
  .project-summary-header {
    flex-direction: column;
  }

  .project-summary-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .project-summary-title {
    font-size: var(--font-size-xl);
  }

  .project-summary-stats {
    grid-template-columns: 1fr;
  }

  .project-summary-coordinates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
