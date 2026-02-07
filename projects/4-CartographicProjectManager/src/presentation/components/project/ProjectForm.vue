<!--
  @module presentation/components/project/ProjectForm
  @description Form component for creating/editing projects.
  Admin-only component with coordinate picker and type selection.
  @category Presentation
-->
<template>
  <form class="project-form" @submit.prevent="handleSubmit">
    <!-- TODO: Implement project form -->
    <!-- Name field -->
    <!-- Code field -->
    <!-- Type selector -->
    <!-- Client selector -->
    <!-- Delivery date picker -->
    <!-- Coordinates input (lat/lng) -->
    <!-- Submit button -->
  </form>
</template>

<script setup lang="ts">
/**
 * ProjectForm - Project creation/editing form.
 */
const emit = defineEmits<{
  submit: [data: unknown];
  cancel: [];
}>();

function handleSubmit(): void {
  // TODO: Implement form submission
}
</script>

<style scoped>
/* TODO: Implement form styles */
</style>
