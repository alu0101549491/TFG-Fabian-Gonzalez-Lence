<template>
  <div class="file-upload">
    <label for="fileInput" class="upload-label">
      <span>Choose file or drag here</span>
      <input
        id="fileInput"
        type="file"
        @change="handleFileChange"
        :accept="acceptedFormats"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  acceptedFormats?: string;
}

withDefaults(defineProps<Props>(), {
  acceptedFormats: '.pdf,.kml,.shp,.jpg,.png,.doc,.docx',
});

const emit = defineEmits<{
  (e: 'upload', file: globalThis.File): void;
}>();

const handleFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    emit('upload', file);
  }
};
</script>

<style scoped>
.file-upload {
  padding: 1rem;
}

.upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  cursor: pointer;
}

.upload-label input {
  display: none;
}
</style>
