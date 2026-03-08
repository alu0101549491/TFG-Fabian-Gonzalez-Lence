<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/components/layout/AppHeader.vue
  @desc Application header with navigation and user menu
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://typescripttutorial.net}
-->

<template>
  <header class="app-header">
    <div class="header-left">
      <button
        type="button"
        class="menu-toggle"
        @click="handleToggleSidebar"
        aria-label="Toggle sidebar"
      >
        <MenuIcon :size="24" />
      </button>
      <h1 class="app-title">Cartographic PM</h1>
    </div>

    <div class="header-right">
      <!-- Notifications -->
      <button
        type="button"
        class="icon-button"
        @click="goToNotifications"
        aria-label="Notifications"
      >
        <BellIcon :size="20" />
        <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </button>

      <!-- User menu -->
      <div ref="userMenuRef" class="user-menu">
        <button
          type="button"
          class="user-button"
          @click="showUserMenu = !showUserMenu"
          aria-label="User menu"
          aria-haspopup="menu"
          :aria-expanded="showUserMenu"
        >
          <UserIcon :size="20" />
          <span class="user-name">{{ username }}</span>
          <ChevronDownIcon :size="16" />
        </button>

        <div v-if="showUserMenu" class="user-dropdown">
          <button type="button" @click="goToSettings" class="dropdown-item">
            <SettingsIcon :size="16" />
            Settings
          </button>
          <button type="button" @click="handleLogout" class="dropdown-item">
            <LogOutIcon :size="16" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/presentation/composables';
import { useNotificationStore } from '@/presentation/stores/notification.store';
import {
  Menu as MenuIcon,
  Bell as BellIcon,
  User as UserIcon,
  ChevronDown as ChevronDownIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
} from 'lucide-vue-next';

const emit = defineEmits<{
  'toggle-sidebar': [];
  logout: [];
}>();

const router = useRouter();
const { username } = useAuth();
const notificationStore = useNotificationStore();

const userMenuRef = ref<HTMLElement | null>(null);
const showUserMenu = ref(false);
const unreadCount = computed(() => notificationStore.unreadCount);

function closeUserMenu() {
  showUserMenu.value = false;
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!showUserMenu.value) return;

  const target = event.target;
  if (!(target instanceof Node)) return;

  if (!userMenuRef.value?.contains(target)) {
    closeUserMenu();
  }
}

function handleDocumentKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  if (!showUserMenu.value) return;
  closeUserMenu();
}

watch(showUserMenu, (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    document.addEventListener('keydown', handleDocumentKeyDown);
    return;
  }

  document.removeEventListener('pointerdown', handleDocumentPointerDown);
  document.removeEventListener('keydown', handleDocumentKeyDown);
});

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    closeUserMenu();
  },
);

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown);
  document.removeEventListener('keydown', handleDocumentKeyDown);
});

function goToSettings() {
  closeUserMenu();
  router.push('/settings');
}

function goToNotifications() {
  router.push('/notifications');
}

function handleToggleSidebar() {
  emit('toggle-sidebar');
}

function handleLogout() {
  closeUserMenu();
  emit('logout');
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--height-header);
  background: white;
  border-bottom: 1px solid var(--color-border-primary);
  padding: 0 var(--spacing-6);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: var(--transition-colors);
}

.menu-toggle:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.app-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.icon-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: var(--transition-colors);
}

.icon-button:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-error-500);
  color: white;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-primary);
  transition: var(--transition-colors);
}

.user-button:hover {
  background: var(--color-bg-secondary);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  min-width: 180px;
  background: white;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2);
  z-index: var(--z-dropdown);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  text-align: left;
  transition: var(--transition-colors);
}

.dropdown-item:hover {
  background: var(--color-bg-secondary);
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
}
</style>
