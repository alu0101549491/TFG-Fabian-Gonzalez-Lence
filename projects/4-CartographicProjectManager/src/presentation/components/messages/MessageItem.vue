<template>
  <div class="message-item">
    <div class="message-header">
      <span class="sender">{{ message.getSenderId() }}</span>
      <span class="timestamp">
        {{ message.getSentAt().toLocaleString() }}
      </span>
    </div>
    <p class="message-content">{{ message.getContent() }}</p>
  </div>
</template>

<script setup lang="ts">
import type {Message} from '@domain/entities/Message';

interface Props {
  message: Message;
}

defineProps<Props>();
</script>

<style scoped>
.message-item {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}

.sender {
  font-weight: bold;
}

.timestamp {
  color: var(--text-secondary);
}

.message-content {
  margin: 0;
}
</style>
