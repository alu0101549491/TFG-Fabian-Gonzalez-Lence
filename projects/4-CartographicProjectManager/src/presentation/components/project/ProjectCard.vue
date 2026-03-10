<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/project/ProjectCard.vue
  @desc Card component displaying a project summary with status, dates, and counters
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <article
    :class="[
      'project-card',
      {
        'project-card-compact': compact,
        'project-card-selected': selected,
        'project-card-overdue': project.isOverdue,
        'project-card-finalized': isFinalized,
      },
    ]"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Status indicator bar (left edge) -->
    <div
      :class="['project-card-status-bar', `project-card-status-${project.statusColor}`]"
      :aria-label="`Status: ${statusLabel}`"
    />

    <!-- Card content -->
    <div class="project-card-content">
      <!-- Header: Code + Actions -->
      <div class="project-card-header">
        <div class="project-card-code">
          <span class="project-card-code-text">{{ project.code }}</span>
          <span v-if="isFinalized" class="project-card-finalized-badge">Finalized</span>
          <span v-if="project.isOverdue && !isFinalized" class="project-card-overdue-badge">Overdue</span>
        </div>

        <!-- Actions dropdown (shown if showActions and has permissions) -->
        <div v-if="showActions && hasActions" class="project-card-actions" @click.stop>
          <button
            ref="actionsButtonRef"
            type="button"
            class="project-card-actions-trigger"
            aria-label="Project actions"
            aria-haspopup="true"
            :aria-expanded="actionsMenuOpen"
            @click="toggleActionsMenu"
          >
            ⋮
          </button>

          <Transition name="dropdown">
            <div v-if="actionsMenuOpen" ref="actionsMenuRef" class="project-card-actions-menu">
              <button type="button" class="project-card-actions-item" @click="handleEdit">
                <span class="project-card-actions-icon">✏️</span>
                <span>Edit Project</span>
              </button>
              <button
                type="button"
                class="project-card-actions-item project-card-actions-item-danger"
                @click="handleDelete"
              >
                <span class="project-card-actions-icon">🗑️</span>
                <span>Delete Project</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Title -->
      <h3 class="project-card-title">{{ project.name }}</h3>

      <!-- Client -->
      <p class="project-card-client">
        <span class="project-card-client-icon">👤</span>
        <span>{{ project.clientName }}</span>
      </p>

      <!-- Type badge -->
      <span :class="['project-card-type', `project-card-type-${project.type.toLowerCase()}`]">
        {{ typeLabel }}
      </span>

      <!-- Footer: Date + Counters -->
      <div class="project-card-footer">
        <!-- Delivery date -->
        <div
          :class="['project-card-date', {'project-card-date-overdue': project.isOverdue && !isFinalized}]"
        >
          <span class="project-card-date-icon">📅</span>
          <span>{{ formattedDeliveryDate }}</span>
          <span
            v-if="!isFinalized && project.daysUntilDelivery <= 7 && project.daysUntilDelivery >= 0"
            class="project-card-days-left"
          >
            {{ project.daysUntilDelivery }} days left
          </span>
        </div>

        <!-- Counters -->
        <div class="project-card-counters">
          <!-- Pending Tasks -->
          <div
            v-if="project.pendingTasksCount > 0"
            :class="['project-card-counter', {'project-card-counter-warning': project.hasPendingTasks}]"
            :title="`${project.pendingTasksCount} pending tasks`"
          >
            <span class="project-card-counter-icon">✓</span>
            <span>{{ project.pendingTasksCount }}</span>
          </div>

          <!-- Unread Messages -->
          <div
            v-if="project.unreadMessagesCount > 0"
            class="project-card-counter project-card-counter-primary"
            :title="`${project.unreadMessagesCount} unread messages`"
          >
            <span class="project-card-counter-icon">💬</span>
            <span>{{ project.unreadMessagesCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted} from 'vue';
import type {ProjectSummaryViewModel} from '@/presentation/view-models/project.view-model';
import {ProjectType, ProjectStatus} from '@/domain/enumerations';
import {formatDate} from '@/shared/utils';
import {useAuth} from '@/presentation/composables';

/**
 * ProjectCard component props
 */
export interface ProjectCardProps {
  /** Project data */
  project: ProjectSummaryViewModel;
  /** Compact display mode */
  compact?: boolean;
  /** Show action buttons */
  showActions?: boolean;
  /** Selected state */
  selected?: boolean;
}

/**
 * ProjectCard component emits
 */
export interface ProjectCardEmits {
  (e: 'click', project: ProjectSummaryViewModel): void;
  (e: 'edit', project: ProjectSummaryViewModel): void;
  (e: 'delete', project: ProjectSummaryViewModel): void;
}

const props = withDefaults(defineProps<ProjectCardProps>(), {
  compact: false,
  showActions: true,
  selected: false,
});

const emit = defineEmits<ProjectCardEmits>();
const {isAdmin, isSpecialUser, userId} = useAuth();

// Actions menu state
const actionsButtonRef = ref<HTMLElement | null>(null);
const actionsMenuRef = ref<HTMLElement | null>(null);
const actionsMenuOpen = ref(false);

/**
 * Close menu on click outside
 */
function handleClickOutside(event: MouseEvent): void {
  if (
    actionsMenuOpen.value &&
    actionsButtonRef.value &&
    actionsMenuRef.value &&
    !actionsButtonRef.value.contains(event.target as Node) &&
    !actionsMenuRef.value.contains(event.target as Node)
  ) {
    actionsMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Computed properties
const isFinalized = computed(() => props.project.status === ProjectStatus.FINALIZED);

const isProjectCreator = computed(() => 
  props.project.creatorId === userId.value
);

const hasActions = computed(() => 
  !isFinalized.value && (isAdmin.value || (isSpecialUser.value && isProjectCreator.value))
);

const statusLabel = computed(() => {
  const labels: Record<ProjectStatus, string> = {
    [ProjectStatus.ACTIVE]: 'Active',
    [ProjectStatus.IN_PROGRESS]: 'In Progress',
    [ProjectStatus.PENDING_REVIEW]: 'Pending Review',
    [ProjectStatus.FINALIZED]: 'Finalized',
  };
  return labels[props.project.status] || props.project.status;
});

const typeLabel = computed(() => {
  const labels: Record<ProjectType, string> = {
    [ProjectType.RESIDENTIAL]: 'Residential',
    [ProjectType.COMMERCIAL]: 'Commercial',
    [ProjectType.INDUSTRIAL]: 'Industrial',
    [ProjectType.PUBLIC]: 'Public',
  };
  return labels[props.project.type] || props.project.type;
});

const formattedDeliveryDate = computed(() => {
  return formatDate(props.project.deliveryDate, 'dd MM yyyy');
});

/**
 * Handle card click
 */
function handleClick(): void {
  emit('click', props.project);
}

/**
 * Toggle actions menu
 */
function toggleActionsMenu(): void {
  actionsMenuOpen.value = !actionsMenuOpen.value;
}

/**
 * Handle edit action
 */
function handleEdit(): void {
  actionsMenuOpen.value = false;
  emit('edit', props.project);
}

/**
 * Handle delete action
 */
function handleDelete(): void {
  actionsMenuOpen.value = false;
  emit('delete', props.project);
}
</script>

<style scoped>
.project-card {
  position: relative;
  display: flex;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.project-card:hover {
  border-color: var(--color-border-secondary);
  box-shadow: var(--shadow-md);
}

.project-card:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.project-card-selected {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
}

.project-card-overdue:not(.project-card-finalized) {
  border-color: var(--color-error-300);
}

.project-card-finalized {
  opacity: 0.85;
}

/* Status bar (left edge indicator) */
.project-card-status-bar {
  width: 4px;
  flex-shrink: 0;
}

.project-card-status-red {
  background-color: var(--color-error-500);
}

.project-card-status-green {
  background-color: var(--color-success-500);
}

.project-card-status-yellow {
  background-color: var(--color-warning-500);
}

.project-card-status-gray {
  background-color: var(--color-gray-400);
}

/* Content */
.project-card-content {
  flex: 1;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0;
}

/* Header */
.project-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
}

.project-card-code {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.project-card-code-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-card-finalized-badge {
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

/* Title */
.project-card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Client */
.project-card-client {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.project-card-client-icon {
  font-size: 14px;
  flex-shrink: 0;
}

/* Type badge */
.project-card-type {
  align-self: flex-start;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.project-card-type-residential {
  color: var(--color-info-700);
  background-color: var(--color-info-100);
}

.project-card-type-commercial {
  color: var(--color-success-700);
  background-color: var(--color-success-100);
}

.project-card-type-industrial {
  color: var(--color-warning-700);
  background-color: var(--color-warning-100);
}

.project-card-type-public {
  color: var(--color-primary-700);
  background-color: var(--color-primary-100);
}

/* Footer */
.project-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  margin-top: auto;
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-border-primary);
}

/* Date */
.project-card-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.project-card-date-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.project-card-date-overdue {
  color: var(--color-error-600);
}

.project-card-overdue-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-error-700);
  background-color: var(--color-error-100);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.project-card-days-left {
  font-size: var(--font-size-xs);
  color: var(--color-warning-600);
}

/* Counters */
.project-card-counters {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.project-card-counter {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.project-card-counter-icon {
  font-size: 14px;
}

.project-card-counter-warning {
  color: var(--color-warning-600);
}

.project-card-counter-primary {
  color: var(--color-primary-600);
}

/* Actions */
.project-card-actions {
  position: relative;
}

.project-card-actions-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 20px;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.project-card-actions-trigger:hover {
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
}

.project-card-actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  min-width: 160px;
  margin-top: var(--spacing-1);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-1);
}

.project-card-actions-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-fast);
}

.project-card-actions-item:hover {
  background-color: var(--color-gray-100);
}

.project-card-actions-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.project-card-actions-item-danger {
  color: var(--color-error-600);
}

.project-card-actions-item-danger:hover {
  background-color: var(--color-error-50);
}

/* Compact mode */
.project-card-compact .project-card-content {
  padding: var(--spacing-3);
}

.project-card-compact .project-card-title {
  font-size: var(--font-size-sm);
  -webkit-line-clamp: 1;
}

.project-card-compact .project-card-client,
.project-card-compact .project-card-type {
  display: none;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
