<template>
  <div v-if="showWarning" class="session-timeout">
    <p>Your session will expire soon.</p>
    <button @click="handleRefresh">
      Extend Session
    </button>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useAuthStore} from '../../stores/authStore';

const authStore = useAuthStore();
const showWarning = ref(false);

const handleRefresh = async (): Promise<void> => {
  await authStore.refreshToken();
  showWarning.value = false;
};
</script>

<style scoped>
.session-timeout {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 1rem;
  background-color: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-radius: 4px;
  z-index: 1000;
}
</style>
