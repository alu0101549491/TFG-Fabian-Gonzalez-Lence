<template>
  <aside class="app-sidebar">
    <nav>
      <ul>
        <li>
          <RouterLink to="/">Dashboard</RouterLink>
        </li>
        <li>
          <RouterLink to="/projects">Projects</RouterLink>
        </li>
        <li>
          <RouterLink to="/calendar">Calendar</RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
// Sidebar component
</script>

<style scoped>
.app-sidebar {
  width: 250px;
  height: calc(100vh - 60px);
  background-color: var(--sidebar-bg);
  padding: 1rem;
}

.app-sidebar ul {
  list-style: none;
  padding: 0;
}

.app-sidebar li {
  margin-bottom: 0.5rem;
}
</style>
