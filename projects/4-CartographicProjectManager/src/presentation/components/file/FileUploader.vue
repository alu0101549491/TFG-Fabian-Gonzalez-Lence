<!--
  @module presentation/components/file/FileUploader
  @description Drag-and-drop file upload component with progress
  indicator and file type validation.
  @category Presentation
-->
<template>
  <div class="file-uploader">
    <!-- TODO: Implement file uploader -->
    <!-- Drop zone -->
    <!-- File selection button -->
    <!-- Upload progress bar -->
    <!-- File type/size constraints info -->
  </div>
</template>

<script setup lang="ts">
/**
 * FileUploader - File upload with drag-and-drop support.
 */
defineProps<{
  projectId: string;
  acceptedTypes?: string[];
  maxSizeMb?: number;
}>();

const emit = defineEmits<{
  upload: [file: File];
  error: [message: string];
}>();

function handleDrop(_event: DragEvent): void {
  // TODO: Implement drag-and-drop handling
}

function handleFileSelect(_event: Event): void {
  // TODO: Implement file selection handling
}
</script>

<style scoped>
/* TODO: Implement file uploader styles */
</style>
