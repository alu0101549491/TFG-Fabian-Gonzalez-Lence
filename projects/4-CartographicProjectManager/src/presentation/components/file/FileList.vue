<!--
  @module presentation/components/file/FileList
  @description List of uploaded files with download, preview,
  and delete actions. Displays file type icons and metadata.
  @category Presentation
-->
<template>
  <div class="file-list">
    <!-- TODO: Implement file list -->
    <!-- File items with icon, name, size, date -->
    <!-- Download / Preview / Delete actions -->
    <!-- Empty state -->
  </div>
</template>

<script setup lang="ts">
/**
 * FileList - Project file listing with actions.
 */
defineProps<{
  projectId: string;
}>();

const emit = defineEmits<{
  download: [fileId: string];
  preview: [fileId: string];
  delete: [fileId: string];
}>();
</script>

<style scoped>
/* TODO: Implement file list styles */
</style>
