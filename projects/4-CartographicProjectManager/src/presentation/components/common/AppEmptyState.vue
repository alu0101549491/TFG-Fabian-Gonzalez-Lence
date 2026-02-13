<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppEmptyState.vue
  @desc Empty state component for displaying no data scenarios
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div :class="['empty-state', {'empty-state-compact': compact}]">
    <!-- Icon -->
    <div v-if="$slots.icon || icon" class="empty-state-icon">
      <slot name="icon">
        <span class="empty-state-icon-placeholder">{{ icon }}</span>
      </slot>
    </div>

    <!-- Title -->
    <h3 v-if="title" class="empty-state-title">{{ title }}</h3>

    <!-- Description -->
    <p v-if="description" class="empty-state-description">{{ description }}</p>

    <!-- Action -->
    <div v-if="$slots.action" class="empty-state-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Empty state component props
 */
export interface AppEmptyStateProps {
  /** Icon to display (emoji or symbol) */
  icon?: string;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Compact variant */
  compact?: boolean;
}

export interface AppEmptyStateEmits {}

withDefaults(defineProps<AppEmptyStateProps>(), {
  compact: false,
});

defineEmits<AppEmptyStateEmits>();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-6);
  text-align: center;
}

.empty-state-compact {
  padding: var(--spacing-8) var(--spacing-4);
}

.empty-state-icon {
  margin-bottom: var(--spacing-4);
  color: var(--color-text-tertiary);
}

.empty-state-icon-placeholder {
  display: block;
  font-size: 48px;
  line-height: 1;
}

.empty-state-compact .empty-state-icon-placeholder {
  font-size: 32px;
}

.empty-state-title {
  margin: 0 0 var(--spacing-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.empty-state-compact .empty-state-title {
  font-size: var(--font-size-base);
}

.empty-state-description {
  margin: 0 0 var(--spacing-6);
  max-width: 400px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.empty-state-compact .empty-state-description {
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-xs);
}

.empty-state-action {
  margin-top: var(--spacing-2);
}
</style>
