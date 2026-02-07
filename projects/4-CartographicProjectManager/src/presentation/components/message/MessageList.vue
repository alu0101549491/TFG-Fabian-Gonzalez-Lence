<!--
  @module presentation/components/message/MessageList
  @description Scrollable message list for project chat.
  Auto-scrolls to latest message. Groups by date.
  @category Presentation
-->
<template>
  <div class="message-list" ref="messageListRef">
    <!-- TODO: Implement message list -->
    <!-- Date separators -->
    <!-- MessageBubble items -->
    <!-- Scroll-to-bottom button -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

/**
 * MessageList - Scrollable project message list.
 */
defineProps<{
  projectId: string;
}>();

const messageListRef = ref<HTMLElement | null>(null);

function scrollToBottom(): void {
  // TODO: Implement auto-scroll
}
</script>

<style scoped>
/* TODO: Implement message list styles */
</style>
