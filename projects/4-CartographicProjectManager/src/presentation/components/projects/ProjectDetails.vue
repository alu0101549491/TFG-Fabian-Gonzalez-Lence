<template>
  <div class="project-details">
    <h2>{{ project?.getName() }}</h2>
    <div class="details-grid">
      <div class="detail-item">
        <label>Code</label>
        <span>{{ project?.getCode() }}</span>
      </div>
      <div class="detail-item">
        <label>Type</label>
        <span>{{ project?.getType() }}</span>
      </div>
      <div class="detail-item">
        <label>Status</label>
        <span>{{ project?.getStatus() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Project} from '@domain/entities/Project';

interface Props {
  project: Project | null;
}

defineProps<Props>();
</script>

<style scoped>
.project-details {
  padding: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.detail-item label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.25rem;
}
</style>
