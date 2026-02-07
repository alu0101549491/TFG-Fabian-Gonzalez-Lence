<!--
  @module presentation/components/common/AppSidebar
  @description Collapsible sidebar navigation.
  Adapts content based on user role (admin vs client).
  @category Presentation
-->
<template>
  <aside class="app-sidebar" :class="{open: isOpen}">
    <div class="sidebar-overlay" @click="closeSidebar"></div>
    <nav class="sidebar-content">
      <div class="sidebar-header">
        <h2>Menu</h2>
        <button @click="closeSidebar" class="close-btn">✕</button>
      </div>
      <div class="sidebar-links">
        <router-link to="/" @click="closeSidebar" class="sidebar-link">Dashboard</router-link>
        <router-link to="/projects" @click="closeSidebar" class="sidebar-link">Projects</router-link>
        <router-link to="/calendar" @click="closeSidebar" class="sidebar-link">Calendar</router-link>
        <router-link to="/notifications" @click="closeSidebar" class="sidebar-link">Notifications</router-link>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
defineProps<{isOpen?: boolean}>();
const emit = defineEmits<{close: []}>;

function closeSidebar() {
  emit('close');
}
</script>

<style scoped>
.app-sidebar {
  display: none;
}

@media (max-width: 767px) {
  .app-sidebar {
    display: block;
    position: fixed;
    inset: 0;
    z-index: var(--z-modal);
    pointer-events: none;
  }

  .app-sidebar.open {
    pointer-events: auto;
  }

  .sidebar-overlay {
    position: absolute;
    inset: 0;
    background: var(--color-bg-overlay);
    opacity: 0;
    transition: opacity var(--transition-normal);
  }

  .app-sidebar.open .sidebar-overlay {
    opacity: 1;
  }

  .sidebar-content {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--sidebar-width);
    background: var(--sidebar-bg);
    box-shadow: var(--shadow-xl);
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
    padding: var(--spacing-6);
  }

  .app-sidebar.open .sidebar-content {
    transform: translateX(0);
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-6);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: var(--font-size-2xl);
    padding: var(--spacing-2);
    cursor: pointer;
  }

  .sidebar-links {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .sidebar-link {
    display: block;
    padding: var(--spacing-3) var(--spacing-4);
    color: var(--color-text-primary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: var(--transition-fast);
  }

  .sidebar-link:hover,
  .sidebar-link.router-link-active {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }
}
</style>
