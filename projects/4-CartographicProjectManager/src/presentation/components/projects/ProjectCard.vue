<template>
  <div class="project-card" @click="$emit('select', project)">
    <h3>{{ project.getName() }}</h3>
    <p class="project-code">{{ project.getCode() }}</p>
    <span :class="['status-badge', statusClass]">
      {{ project.getStatus() }}
    </span>
    <p class="project-type">{{ project.getType() }}</p>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import type {Project} from '@domain/entities/Project';
import {ProjectStatus} from '@domain/enums/ProjectStatus';

interface Props {
  project: Project;
}

const props = defineProps<Props>();

defineEmits<{
  (e: 'select', project: Project): void;
}>();

const statusClass = computed(() => {
  const status = props.project.getStatus();
  return {
    'status-active': status === ProjectStatus.ACTIVE,
    'status-in-progress': status === ProjectStatus.IN_PROGRESS,
    'status-review': status === ProjectStatus.PENDING_REVIEW,
    'status-finalized': status === ProjectStatus.FINALIZED,
  };
});
</script>

<style scoped>
.project-card {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.project-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-code {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}
</style>
