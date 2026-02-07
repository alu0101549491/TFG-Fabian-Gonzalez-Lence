<template>
  <form class="message-form" @submit.prevent="handleSubmit">
    <textarea
      v-model="content"
      placeholder="Type a message..."
      required
    ></textarea>
    <button type="submit" :disabled="!content.trim()">
      Send
    </button>
  </form>
</template>

<script setup lang="ts">
import {ref} from 'vue';

const emit = defineEmits<{
  (e: 'send', content: string): void;
}>();

const content = ref('');

const handleSubmit = (): void => {
  emit('send', content.value);
  content.value = '';
};
</script>

<style scoped>
.message-form {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
}

.message-form textarea {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  resize: none;
  min-height: 60px;
}
</style>
