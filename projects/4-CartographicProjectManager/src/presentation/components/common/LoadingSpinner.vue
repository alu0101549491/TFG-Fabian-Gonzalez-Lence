<!--
  @module presentation/components/common/LoadingSpinner
  @description Reusable loading indicator component.
  Displays a spinner during async operations.
  @category Presentation
-->
<template>
  <div class="loading-spinner" role="status" :aria-label="props.message || 'Loading'">
    <div class="spinner"></div>
    <span class="sr-only">{{ props.message || 'Loading...' }}</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    overlay?: boolean;
    message?: string;
  }>(),
  {
    overlay: false,
    message: 'Loading...',
  }
);
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
