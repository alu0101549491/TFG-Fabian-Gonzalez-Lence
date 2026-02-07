<template>
  <div class="dashboard-view">
    <AppHeader />
    <div class="dashboard-content">
      <AppSidebar />
      <main class="main-content">
        <h2>Dashboard</h2>
        <div class="dashboard-stats">
          <div class="stat-card">
            <h3>Active Projects</h3>
            <p>{{ projects.length }}</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue';
import AppHeader from '../components/common/AppHeader.vue';
import AppSidebar from '../components/common/AppSidebar.vue';
import {useProjects} from '../composables/useProjects';

const {projects, loadProjects} = useProjects();

onMounted(async () => {
  await loadProjects();
});
</script>

<style scoped>
.dashboard-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-content {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 1rem;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-align: center;
}
</style>
