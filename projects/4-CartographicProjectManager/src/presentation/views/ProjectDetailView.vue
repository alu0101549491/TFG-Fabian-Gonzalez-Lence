<template>
  <div class="project-detail-view">
    <AppHeader />
    <div class="detail-content">
      <AppSidebar />
      <main class="main-content">
        <LoadingSpinner v-if="loading" />
        <template v-else-if="currentProject">
          <ProjectDetails :project="currentProject" />
          <TaskList :tasks="tasks" />
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue';
import {useRoute} from 'vue-router';
import AppHeader from '../components/common/AppHeader.vue';
import AppSidebar from '../components/common/AppSidebar.vue';
import LoadingSpinner
  from '../components/common/LoadingSpinner.vue';
import ProjectDetails
  from '../components/projects/ProjectDetails.vue';
import TaskList from '../components/tasks/TaskList.vue';
import {useProjects} from '../composables/useProjects';
import {useTasks} from '../composables/useTasks';

const route = useRoute();
const {
  currentProject,
  loading,
  loadProject,
} = useProjects();
const {tasks, loadTasks} = useTasks();

onMounted(async () => {
  const projectId = route.params.id as string;
  await loadProject(projectId);
  await loadTasks(projectId);
});
</script>

<style scoped>
.project-detail-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.detail-content {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 1rem;
}
</style>
