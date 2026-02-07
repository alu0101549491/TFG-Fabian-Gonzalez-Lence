<!--
  @module presentation/components/project/ProjectCard
  @description Card component displaying a project summary.
  Shows code, name, status, delivery date, and pending indicators.
  Corresponds to ProjectSummaryView from the class diagram.
  @category Presentation
-->
<template>
  <div class="project-card">
    <!-- TODO: Implement project card layout -->
    <!-- Status color indicator -->
    <!-- Project code and name -->
    <!-- Delivery date -->
    <!-- Pending tasks / unread messages badges -->
  </div>
</template>

<script setup lang="ts">
/**
 * ProjectCard - Summary card for a single project.
 */
defineProps<{
  code: string;
  name: string;
  status: string;
  deliveryDate: string;
  hasPendingTasks: boolean;
  unreadMessagesCount: number;
}>();
</script>

<style scoped>
/* TODO: Implement project card styles */
</style>
