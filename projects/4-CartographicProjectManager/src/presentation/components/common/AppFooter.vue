<template>
  <footer class="app-footer">
    <p>&copy; {{ currentYear }} Cartographic Project Manager</p>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.app-footer {
  text-align: center;
  padding: 1rem;
  background-color: var(--footer-bg);
  color: var(--text-secondary);
}
</style>
