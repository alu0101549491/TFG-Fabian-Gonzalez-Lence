<template>
  <div class="message-list">
    <MessageItem
      v-for="message in messages"
      :key="message.getId()"
      :message="message"
    />
  </div>
</template>

<script setup lang="ts">
import type {Message} from '@domain/entities/Message';
import MessageItem from './MessageItem.vue';

interface Props {
  messages: Message[];
}

defineProps<Props>();
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;
}
</style>
