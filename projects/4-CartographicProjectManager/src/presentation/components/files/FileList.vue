<template>
  <div class="file-list">
    <FileItem
      v-for="file in files"
      :key="file.getId()"
      :file="file"
      @download="$emit('download', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type {File} from '@domain/entities/File';
import FileItem from './FileItem.vue';

interface Props {
  files: File[];
}

defineProps<Props>();

defineEmits<{
  (e: 'download', fileId: string): void;
  (e: 'delete', fileId: string): void;
}>();
</script>

<style scoped>
.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
