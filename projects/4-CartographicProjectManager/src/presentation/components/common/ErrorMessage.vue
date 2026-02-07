<template>
  <div class="error-message" role="alert">
    <span class="error-icon">&#9888;</span>
    <p>{{ message }}</p>
    <button v-if="retryable" @click="$emit('retry')">
      Retry
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string;
  retryable?: boolean;
}

withDefaults(defineProps<Props>(), {
  retryable: false,
});

defineEmits<{
  (e: 'retry'): void;
}>();
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 4px;
  color: var(--error-text);
}

.error-icon {
  font-size: 1.5rem;
}
</style>
