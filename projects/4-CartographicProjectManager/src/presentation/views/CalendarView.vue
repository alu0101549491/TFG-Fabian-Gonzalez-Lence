<template>
  <div class="calendar-view">
    <AppHeader />
    <div class="calendar-content">
      <AppSidebar />
      <main class="main-content">
        <h2>Calendar</h2>
        <ProjectCalendar />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/common/AppHeader.vue';
import AppSidebar from '../components/common/AppSidebar.vue';
import ProjectCalendar
  from '../components/projects/ProjectCalendar.vue';
</script>

<style scoped>
.calendar-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.calendar-content {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 1rem;
}
</style>
