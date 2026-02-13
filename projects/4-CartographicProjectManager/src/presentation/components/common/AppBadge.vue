<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppBadge.vue
  @desc Badge component for status indicators and labels
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <span
    :class="[
      'badge',
      `badge-${variant}`,
      `badge-${size}`,
      {'badge-dot': dot, 'badge-outline': outline},
    ]"
  >
    <span v-if="dot" class="badge-dot-indicator"></span>
    <slot></slot>
    <button
      v-if="removable"
      type="button"
      class="badge-remove"
      @click="handleRemove"
      aria-label="Remove"
    >
      ✕
    </button>
  </span>
</template>

<script setup lang="ts">
/**
 * Badge component props
 */
export interface AppBadgeProps {
  /** Badge variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Badge size */
  size?: 'sm' | 'md';
  /** Show dot instead of text */
  dot?: boolean;
  /** Outline style */
  outline?: boolean;
  /** Removable badge */
  removable?: boolean;
}

/**
 * Badge component emits
 */
export interface AppBadgeEmits {
  (e: 'remove'): void;
}

withDefaults(defineProps<AppBadgeProps>(), {
  variant: 'default',
  size: 'md',
  dot: false,
  outline: false,
  removable: false,
});

const emit = defineEmits<AppBadgeEmits>();

/**
 * Handle remove click
 */
function handleRemove(): void {
  emit('remove');
}
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

/* Sizes */
.badge-sm {
  padding: 2px var(--spacing-2);
  font-size: var(--font-size-xs);
}

.badge-md {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-sm);
}

/* Variants - Solid */
.badge-default {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}

.badge-primary {
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
}

.badge-success {
  background-color: var(--color-success-100);
  color: var(--color-success-700);
}

.badge-warning {
  background-color: var(--color-warning-100);
  color: var(--color-warning-700);
}

.badge-error {
  background-color: var(--color-error-100);
  color: var(--color-error-700);
}

.badge-info {
  background-color: var(--color-info-100);
  color: var(--color-info-700);
}

/* Variants - Outline */
.badge-default.badge-outline {
  background-color: transparent;
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-700);
}

.badge-primary.badge-outline {
  background-color: transparent;
  border: 1px solid var(--color-primary-300);
  color: var(--color-primary-700);
}

.badge-success.badge-outline {
  background-color: transparent;
  border: 1px solid var(--color-success-300);
  color: var(--color-success-700);
}

.badge-warning.badge-outline {
  background-color: transparent;
  border: 1px solid var(--color-warning-300);
  color: var(--color-warning-700);
}

.badge-error.badge-outline {
  background-color: transparent;
  border: 1px solid var(--color-error-300);
  color: var(--color-error-700);
}

.badge-info.badge-outline {
  background-color: transparent;
  border: 1px solid var(--color-info-300);
  color: var(--color-info-700);
}

/* Dot style */
.badge-dot {
  padding-left: var(--spacing-1);
}

.badge-dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
}

.badge-default .badge-dot-indicator {
  background-color: var(--color-gray-500);
}

.badge-primary .badge-dot-indicator {
  background-color: var(--color-primary-500);
}

.badge-success .badge-dot-indicator {
  background-color: var(--color-success-500);
}

.badge-warning .badge-dot-indicator {
  background-color: var(--color-warning-500);
}

.badge-error .badge-dot-indicator {
  background-color: var(--color-error-500);
}

.badge-info .badge-dot-indicator {
  background-color: var(--color-info-500);
}

/* Remove button */
.badge-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  border: none;
  background: transparent;
  color: currentColor;
  font-size: 10px;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
}

.badge-remove:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.badge-remove:focus {
  outline: none;
  box-shadow: 0 0 0 2px currentColor;
}
</style>
