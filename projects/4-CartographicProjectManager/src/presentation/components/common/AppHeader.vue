<template>
  <header class="app-header">
    <div class="header-left">
      <h1>Cartographic Project Manager</h1>
    </div>
    <div class="header-right">
      <NotificationBell />
      <span class="username">{{ username }}</span>
      <button @click="handleLogout">Logout</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useAuth} from '../../composables/useAuth';
import NotificationBell
  from '../notifications/NotificationBell.vue';

const {user, logout} = useAuth();
const username = computed(() => user?.getUsername() ?? '');

const handleLogout = async (): Promise<void> => {
  await logout();
};
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  height: 60px;
  background-color: var(--primary-color);
  color: white;
}
</style>
