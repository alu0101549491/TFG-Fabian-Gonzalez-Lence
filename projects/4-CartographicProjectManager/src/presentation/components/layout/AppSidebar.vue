<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)
  
  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/components/layout/AppSidebar.vue
  @desc Application sidebar with navigation menu
-->

<template>
  <aside 
    :class="['app-sidebar', { collapsed, 'mobile-open': mobileOpen }]"
    @click="handleOverlayClick"
  >
    <nav class="sidebar-nav" @click.stop>
      <router-link
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        class="nav-link"
        :class="{ active: isActive(link.path) }"
        @click="$emit('close')"
      >
        <component :is="link.icon" :size="20" class="nav-icon" />
        <span v-if="!collapsed" class="nav-text">{{ link.title }}</span>
      </router-link>
    </nav>

    <button
      v-if="!mobileOpen"
      type="button"
      class="collapse-toggle"
      @click="$emit('toggle-collapse')"
      :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
    >
      <ChevronLeftIcon v-if="!collapsed" :size="20" />
      <ChevronRightIcon v-else :size="20" />
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  Home as HomeIcon,
  Folder as FolderIcon,
  Calendar as CalendarIcon,
  Database as DatabaseIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-vue-next';

defineProps<{
  collapsed?: boolean;
  mobileOpen?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  'toggle-collapse': [];
}>();

const route = useRoute();

const navLinks = [
  { path: '/', title: 'Dashboard', icon: HomeIcon },
  { path: '/projects', title: 'Projects', icon: FolderIcon },
  { path: '/calendar', title: 'Calendar', icon: CalendarIcon },
  { path: '/backup', title: 'Backup', icon: DatabaseIcon },
  { path: '/settings', title: 'Settings', icon: SettingsIcon },
];

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
}

function handleOverlayClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('mobile-open')) {
    emit('close');
  }
}
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: var(--height-header);
  left: 0;
  bottom: 0;
  width: var(--width-sidebar);
  background: white;
  border-right: 1px solid var(--color-border-primary);
  transition: width var(--duration-normal);
  z-index: var(--z-fixed);
}

.app-sidebar.collapsed {
  width: var(--width-sidebar-collapsed);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-4);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-colors);
}

.nav-link:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.nav-link.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-icon {
  flex-shrink: 0;
}

.collapsed .nav-text {
  display: none;
}

.collapse-toggle {
  position: absolute;
  bottom: var(--spacing-4);
  right: var(--spacing-4);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: var(--transition-colors);
}

.collapse-toggle:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.collapsed .collapse-toggle {
  right: 50%;
  transform: translateX(50%);
}

/* Mobile styles */
@media (max-width: 768px) {
  .app-sidebar {
    display: none;
  }

  .app-sidebar.mobile-open {
    display: block;
    position: fixed;
    top: var(--height-header);
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: var(--z-modal-backdrop);
  }

  .app-sidebar.mobile-open .sidebar-nav {
    width: 280px;
    height: 100%;
    background: white;
    border-right: 1px solid var(--color-border-primary);
  }

  .collapse-toggle {
    display: none;
  }
}
</style>
