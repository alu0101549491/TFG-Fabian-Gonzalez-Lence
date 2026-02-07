<!--
  @module presentation/components/task/TaskCard
  @description Card component displaying a single task with its
  status, priority, assignee, and due date.
  @category Presentation
-->
<template>
  <div class="task-card">
    <!-- TODO: Implement task card -->
    <!-- Priority indicator -->
    <!-- Description -->
    <!-- Status badge -->
    <!-- Assignee -->
    <!-- Due date -->
    <!-- Action buttons (edit, delete, change status) -->
  </div>
</template>

<script setup lang="ts">
/**
 * TaskCard - Individual task display card.
 */
defineProps<{
  taskId: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}>();

const emit = defineEmits<{
  statusChange: [taskId: string, newStatus: string];
  edit: [taskId: string];
  delete: [taskId: string];
}>();
</script>

<style scoped>
/* TODO: Implement task card styles */
</style>
