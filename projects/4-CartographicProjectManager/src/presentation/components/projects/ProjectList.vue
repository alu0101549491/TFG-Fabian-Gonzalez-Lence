<template>
  <div class="project-list">
    <ProjectCard
      v-for="project in projects"
      :key="project.getId()"
      :project="project"
    />
  </div>
</template>

<script setup lang="ts">
import type {Project} from '@domain/entities/Project';
import ProjectCard from './ProjectCard.vue';

interface Props {
  projects: Project[];
}

defineProps<Props>();
</script>

<style scoped>
.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}
</style>
