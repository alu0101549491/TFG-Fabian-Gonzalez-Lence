<!--
  @module presentation/components/common/LoadingSpinner
  @description Reusable loading indicator component.
  Displays a spinner during async operations.
  @category Presentation
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
const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'white' | 'gray';
    message?: string;
    overlay?: boolean;
  }>(),
  {
    size: 'md',
    color: 'primary',
    message: '',
    overlay: false,
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
  border: inherit;
  border-color: var(--color-border, #e5e7eb);
  border-top-color: var(--color-primary, #3b82f6);
}

.color-white .spinner {
  border: inherit;
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
}

.color-gray .spinner {
  border: inherit;
  border-color: #e5e7eb;
  border-top-color: #6b7280;
}

.spinner-message {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-secondary, #6b7280);
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
