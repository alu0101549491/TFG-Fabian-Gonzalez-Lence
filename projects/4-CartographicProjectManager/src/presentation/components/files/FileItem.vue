<template>
  <div class="file-item">
    <span class="file-name">{{ file.getName() }}</span>
    <span class="file-type">{{ file.getType() }}</span>
    <span class="file-size">{{ formatSize(file.getSizeInBytes()) }}</span>
    <div class="file-actions">
      <button @click="$emit('download', file.getId())">
        Download
      </button>
      <button @click="$emit('delete', file.getId())">
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {File} from '@domain/entities/File';

interface Props {
  file: File;
}

defineProps<Props>();

defineEmits<{
  (e: 'download', fileId: string): void;
  (e: 'delete', fileId: string): void;
}>();

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};
</script>

<style scoped>
.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.file-name {
  flex: 1;
  font-weight: bold;
}

.file-type,
.file-size {
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>
