<template>
  <div class="projects-view">
    <AppHeader />
    <div class="projects-content">
      <AppSidebar />
      <main class="main-content">
        <h2>Projects</h2>
        <LoadingSpinner v-if="loading" />
        <ProjectList
          v-else
          :projects="projects"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue';
import AppHeader from '../components/common/AppHeader.vue';
import AppSidebar from '../components/common/AppSidebar.vue';
import LoadingSpinner
  from '../components/common/LoadingSpinner.vue';
import ProjectList
  from '../components/projects/ProjectList.vue';
import {useProjects} from '../composables/useProjects';

const {projects, loading, loadProjects} = useProjects();

onMounted(async () => {
  await loadProjects();
});
</script>

<style scoped>
.projects-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.projects-content {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 1rem;
}
</style>
