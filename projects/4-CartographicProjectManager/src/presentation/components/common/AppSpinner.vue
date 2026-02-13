<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppSpinner.vue
  @desc Loading spinner component with size and color variants
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div :class="['spinner', `spinner-${size}`, `spinner-${color}`]" role="status" :aria-label="label">
    <svg class="spinner-svg" viewBox="0 0 50 50">
      <circle
        class="spinner-circle"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="5"
      ></circle>
    </svg>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * Spinner component props
 */
export interface AppSpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';
  /** Spinner color */
  color?: 'primary' | 'white' | 'gray' | 'current';
  /** Accessible label */
  label?: string;
}

export interface AppSpinnerEmits {}

withDefaults(defineProps<AppSpinnerProps>(), {
  size: 'md',
  color: 'primary',
  label: 'Loading...',
});

defineEmits<AppSpinnerEmits>();
</script>

<style scoped>
.spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner-sm {
  width: 16px;
  height: 16px;
}

.spinner-md {
  width: 24px;
  height: 24px;
}

.spinner-lg {
  width: 32px;
  height: 32px;
}

.spinner-svg {
  animation: spinner-rotate 2s linear infinite;
  width: 100%;
  height: 100%;
}

.spinner-circle {
  stroke-linecap: round;
  stroke-dasharray: 1, 150;
  stroke-dashoffset: 0;
  animation: spinner-dash 1.5s ease-in-out infinite;
}

/* Color variants */
.spinner-primary .spinner-circle {
  stroke: var(--color-primary-600);
}

.spinner-white .spinner-circle {
  stroke: var(--color-white);
}

.spinner-gray .spinner-circle {
  stroke: var(--color-gray-500);
}

.spinner-current .spinner-circle {
  stroke: currentColor;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Animations */
@keyframes spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
