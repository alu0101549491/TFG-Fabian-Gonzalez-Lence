<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since March 8, 2026
  @file src/presentation/components/common/AppHeader.vue
  @desc Application header with navigation, user info, and notification badge
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://typescripttutorial.net}
-->
<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo/App Name -->
      <router-link to="/" class="logo-link">
        <div class="logo">CPM</div>
        <span class="app-name">Cartographic PM</span>
      </router-link>

      <!-- Desktop Navigation -->
      <nav class="nav-links">
        <router-link to="/" class="nav-link">Dashboard</router-link>
        <router-link to="/projects" class="nav-link">Projects</router-link>
        <router-link to="/calendar" class="nav-link">Calendar</router-link>
      </nav>

      <!-- Right Section -->
      <div class="header-actions">
        <!-- Notifications -->
        <router-link to="/notifications" class="notification-btn">
          <span class="icon">🔔</span>
          <span v-if="notificationCount > 0" class="badge">{{ notificationCount }}</span>
        </router-link>

        <!-- User Menu -->
        <div class="user-menu" @click="toggleUserMenu">
          <div class="user-avatar">{{ userInitials }}</div>
          <span class="user-name">{{ userName }}</span>
          <div v-if="showUserMenu" class="user-dropdown">
            <button @click="handleLogout" class="dropdown-item">Logout</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {useAuth} from '../../composables/use-auth';
import {useNotificationStore} from '../../stores/notification.store';

const {user: currentUser, logout} = useAuth();
const notificationStore = useNotificationStore();
const showUserMenu = ref(false);
const notificationCount = computed(() => notificationStore.unreadCount);

const userName = computed(() => currentUser.value?.username ?? 'User');
const userInitials = computed(() => {
  const name = userName.value;
  return name.substring(0, 2).toUpperCase();
});

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

async function handleLogout() {
  await logout();
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: var(--header-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--header-shadow);
  z-index: var(--z-fixed);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

.logo-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  text-decoration: none;
  color: var(--color-text-primary);
}

.logo {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.app-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.nav-links {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.notification-btn {
  position: relative;
  padding: var(--spacing-2);
  font-size: var(--font-size-xl);
  text-decoration: none;
}

.notification-btn .badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-accent-error);
  color: white;
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.user-menu:hover {
  background: var(--color-bg-tertiary);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-2);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 150px;
  z-index: var(--z-dropdown);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.dropdown-item:hover {
  background: var(--color-bg-tertiary);
}

@media (max-width: 767px) {
  .nav-links {
    display: none;
  }

  .user-name {
    display: none;
  }
}
</style>
