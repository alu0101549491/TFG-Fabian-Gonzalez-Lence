<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppCard.vue
  @desc Card container component with header, footer, and loading state
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div
    :class="[
      'card',
      `card-${variant}`,
      {
        'card-clickable': clickable,
        'card-loading': loading,
      },
    ]"
    @click="handleClick"
    @keydown.enter="handleKeydown"
    @keydown.space.prevent="handleKeydown"
    :tabindex="clickable ? 0 : undefined"
    :role="clickable ? 'button' : undefined"
  >
    <!-- Loading overlay -->
    <div v-if="loading" class="card-loading-overlay">
      <AppSpinner size="lg" />
    </div>

    <!-- Header -->
    <div v-if="$slots.header || title || subtitle" class="card-header">
      <slot name="header">
        <div class="card-header-text">
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
      </slot>
      <div v-if="$slots['header-actions']" class="card-header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>

    <!-- Content -->
    <div class="card-content">
      <slot></slot>
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSpinner from './AppSpinner.vue';

/**
 * Card component props
 */
export interface AppCardProps {
  /** Card variant */
  variant?: 'default' | 'bordered' | 'elevated';
  /** Title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Clickable card */
  clickable?: boolean;
  /** Loading state */
  loading?: boolean;
}

/**
 * Card component emits
 */
export interface AppCardEmits {
  (e: 'click', event: MouseEvent | KeyboardEvent): void;
}

const props = withDefaults(defineProps<AppCardProps>(), {
  variant: 'default',
  clickable: false,
  loading: false,
});

const emit = defineEmits<AppCardEmits>();

/**
 * Handle click event
 */
function handleClick(event: MouseEvent): void {
  if (props.clickable && !props.loading) {
    emit('click', event);
  }
}

/**
 * Handle keyboard event
 */
function handleKeydown(event: KeyboardEvent): void {
  if (props.clickable && !props.loading) {
    emit('click', event);
  }
}
</script>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: box-shadow var(--transition-normal), transform var(--transition-fast);
}

.card-default {
  border: none;
}

.card-bordered {
  border: 1px solid var(--color-border-primary);
}

.card-elevated {
  box-shadow: var(--shadow-md);
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-clickable:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.card-loading {
  pointer-events: none;
}

.card-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.card-header-text {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.card-subtitle {
  margin: var(--spacing-1) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.card-header-actions {
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  padding: var(--spacing-6);
}

.card-footer {
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-gray-50);
}
</style>
