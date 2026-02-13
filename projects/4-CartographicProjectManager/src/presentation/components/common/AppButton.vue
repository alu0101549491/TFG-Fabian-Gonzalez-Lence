<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppButton.vue
  @desc Reusable button component with variants, sizes, and loading state
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="btn-spinner">
      <svg
        class="btn-spinner-svg"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
          opacity="0.25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="60"
          stroke-dashoffset="45"
        />
      </svg>
    </span>

    <!-- Left icon -->
    <span v-else-if="$slots['icon-left'] || iconLeft" class="btn-icon-left">
      <slot name="icon-left">
        <!-- Icon placeholder - will be replaced with actual icon component -->
        <span class="btn-icon-placeholder">{{ iconLeft }}</span>
      </slot>
    </span>

    <!-- Content -->
    <span v-if="!iconOnly" class="btn-content">
      <slot />
    </span>

    <!-- Right icon -->
    <span v-if="$slots['icon-right'] || iconRight" class="btn-icon-right">
      <slot name="icon-right">
        <!-- Icon placeholder - will be replaced with actual icon component -->
        <span class="btn-icon-placeholder">{{ iconRight }}</span>
      </slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import {computed} from 'vue';

/**
 * Button component props
 */
export interface AppButtonProps {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width */
  block?: boolean;
  /** Icon only (circular) */
  iconOnly?: boolean;
  /** Left icon name */
  iconLeft?: string;
  /** Right icon name */
  iconRight?: string;
}

/**
 * Button component emits
 */
export interface AppButtonEmits {
  (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<AppButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
  iconOnly: false,
});

const emit = defineEmits<AppButtonEmits>();

/**
 * Computed button classes
 */
const buttonClasses = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    'btn-block': props.block,
    'btn-icon-only': props.iconOnly,
    'btn-loading': props.loading,
  },
]);

/**
 * Handle button click
 */
function handleClick(event: MouseEvent): void {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  line-height: 1;
  font-family: inherit;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.btn-sm {
  height: 32px;
  padding: 0 var(--spacing-3);
  font-size: var(--font-size-sm);
}

.btn-md {
  height: 40px;
  padding: 0 var(--spacing-4);
  font-size: var(--font-size-sm);
}

.btn-lg {
  height: 48px;
  padding: 0 var(--spacing-6);
  font-size: var(--font-size-base);
}

/* Variants */
.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.btn-primary:active:not(:disabled) {
  background-color: var(--color-primary-800);
}

.btn-secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
  border-color: var(--color-gray-200);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-gray-200);
}

.btn-outline {
  border-color: var(--color-gray-300);
  background-color: transparent;
  color: var(--color-gray-700);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.btn-ghost {
  background-color: transparent;
  color: var(--color-gray-700);
}

.btn-ghost:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.btn-danger {
  background-color: var(--color-error-600);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--color-error-700);
}

/* Block */
.btn-block {
  width: 100%;
}

/* Icon only */
.btn-icon-only {
  padding: 0;
  width: 32px;
}

.btn-icon-only.btn-md {
  width: 40px;
}

.btn-icon-only.btn-lg {
  width: 48px;
}

/* Loading spinner */
.btn-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-spinner-svg {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Icon styling */
.btn-icon-left,
.btn-icon-right,
.btn-icon-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-placeholder {
  font-size: 0.75em;
  opacity: 0.7;
}

/* Content */
.btn-content {
  display: inline-flex;
  align-items: center;
}
</style>
