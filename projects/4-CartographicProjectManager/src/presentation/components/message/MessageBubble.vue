<!--
  @module presentation/components/message/MessageBubble
  @description Individual message bubble displaying sender,
  content, timestamp, and read status.
  @category Presentation
-->
<template>
  <div class="message-bubble" :class="{ 'is-own': isOwn }">
    <!-- TODO: Implement message bubble -->
    <!-- Sender name -->
    <!-- Message content -->
    <!-- Timestamp -->
    <!-- Read indicator -->
  </div>
</template>

<script setup lang="ts">
/**
 * MessageBubble - Single chat message display.
 */
defineProps<{
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
}>();
</script>

<style scoped>
/* TODO: Implement message bubble styles */
</style>
