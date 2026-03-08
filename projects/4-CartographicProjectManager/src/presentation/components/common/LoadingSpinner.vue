<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since March 8, 2026
  @file src/presentation/components/common/LoadingSpinner.vue
  @desc Reusable loading indicator component
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://typescripttutorial.net}
-->
<template>
  <div 
    class="loading-spinner" 
    :class="[`size-${size}`, `color-${color}`]"
    role="status" 
    :aria-label="message || 'Loading'"
  >
    <div class="spinner"></div>
    <span v-if="message" class="spinner-message">{{ message }}</span>
    <span class="sr-only">{{ message || 'Loading...' }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'white' | 'gray';
    message?: string;
  }>(),
  {
    size: 'md',
    color: 'primary',
    message: '',
  }
);
</script>

<style scoped>
.loading-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  animation: spin 0.8s linear infinite;
}

/* Size variants */
.size-sm .spinner {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.size-md .spinner {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.size-lg .spinner {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

/* Color variants */
.color-primary .spinner {
  border-color: var(--color-border);
  border-top-color: var(--color-primary);
}

.color-white .spinner {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: var(--color-text-inverse);
}

.color-gray .spinner {
  border-color: var(--color-border);
  border-top-color: var(--color-text-secondary);
}

.spinner-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
