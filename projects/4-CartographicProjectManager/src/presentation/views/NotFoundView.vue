<template>
  <div class="not-found-view">
    <h1>404</h1>
    <p>Page not found</p>
    <RouterLink to="/">Go to Dashboard</RouterLink>
  </div>
</template>

<script setup lang="ts">
// Not Found view
</script>

<style scoped>
.not-found-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.not-found-view h1 {
  font-size: 6rem;
  margin: 0;
  color: var(--text-secondary);
}
</style>
