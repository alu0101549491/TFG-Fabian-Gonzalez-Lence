<template>
  <div class="notification-list">
    <div
      v-for="notification in notifications"
      :key="notification.getId()"
      class="notification-item"
      :class="{'unread': !notification.getIsRead()}"
      @click="handleClick(notification.getId())"
    >
      <span class="notification-type">
        {{ notification.getType() }}
      </span>
      <p class="notification-message">
        {{ notification.getId() }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useNotifications,
} from '../../composables/useNotifications';

const {notifications, markAsRead} = useNotifications();

const handleClick = async (
    notificationId: string,
): Promise<void> => {
  await markAsRead(notificationId);
};
</script>

<style scoped>
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.notification-item.unread {
  background-color: var(--unread-bg);
}

.notification-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>
