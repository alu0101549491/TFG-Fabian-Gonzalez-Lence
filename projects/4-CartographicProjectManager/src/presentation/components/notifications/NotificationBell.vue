<template>
  <div
    class="notification-bell"
    @click="$emit('toggle')"
  >
    <span class="bell-icon">&#128276;</span>
    <span
      v-if="unreadCount > 0"
      class="badge"
    >
      {{ unreadCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  useNotifications,
} from '../../composables/useNotifications';

defineEmits<{
  (e: 'toggle'): void;
}>();

const {unreadCount} = useNotifications();
</script>

<style scoped>
.notification-bell {
  position: relative;
  cursor: pointer;
  font-size: 1.5rem;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
