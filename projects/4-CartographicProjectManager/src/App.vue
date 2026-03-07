<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since 2025-01-08
  @file src/App.vue
  @desc Root Vue component providing application layout, authentication state
        management, WebSocket connections, and global toast notification system.
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://vuejs.org/guide/essentials/application.html}
-->

<template>
  <div id="app" :class="{'app-loading': isInitializing}">
    <!-- Global loading overlay (initial app load) -->
    <Transition name="fade">
      <div v-if="isInitializing" class="app-initializing">
        <div class="app-initializing-content">
          <div class="app-initializing-logo">📍</div>
          <h1 class="app-initializing-title">Cartographic PM</h1>
          <LoadingSpinner />
          <p class="app-initializing-text">Loading application...</p>
        </div>
      </div>
    </Transition>

    <!-- Main application -->
    <template v-if="!isInitializing">
      <!-- Blank layout (login, error pages) -->
      <template v-if="isBlankLayout">
        <RouterView />
      </template>

      <!-- Main layout (authenticated pages) -->
      <template v-else>
        <div class="app-layout">
          <!-- Header -->
          <AppHeader
            @toggle-sidebar="toggleSidebar"
            @logout="handleLogout"
          />

          <!-- Sidebar -->
          <AppSidebar
            :collapsed="sidebarCollapsed"
            :mobile-open="mobileSidebarOpen"
            @close="mobileSidebarOpen = false"
            @toggle-collapse="toggleSidebarCollapse"
          />

          <!-- Main content -->
          <main
            :class="[
              'app-main',
              {'app-main-sidebar-collapsed': sidebarCollapsed}
            ]"
          >
            <RouterView v-slot="{Component, route}">
              <Transition name="page" mode="out-in">
                <Suspense>
                  <template #default>
                    <component :is="Component" :key="route.path" />
                  </template>
                  <template #fallback>
                    <div class="app-page-loading">
                      <LoadingSpinner />
                    </div>
                  </template>
                </Suspense>
              </Transition>
            </RouterView>
          </main>
        </div>
      </template>
    </template>

    <!-- Global toast notifications -->
    <Teleport to="body">
      <div class="toast-container">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="['toast', `toast-${toast.type}`]"
            role="alert"
            aria-live="polite"
          >
            <div class="toast-icon">{{ getToastIcon(toast.type) }}</div>
            <div class="toast-content">
              <p v-if="toast.title" class="toast-title">{{ toast.title }}</p>
              <p class="toast-message">{{ toast.message }}</p>
            </div>
            <button
              type="button"
              class="toast-close"
              @click="removeToast(toast.id)"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div
        v-if="mobileSidebarOpen"
        class="app-sidebar-overlay"
        @click="mobileSidebarOpen = false"
        role="presentation"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onUnmounted, provide} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {storeToRefs} from 'pinia';
import {useAuthStore} from '@/presentation/stores/auth.store';
import {useNotificationStore} from '@/presentation/stores/notification.store';
import AppHeader from '@/presentation/components/layout/AppHeader.vue';
import AppSidebar from '@/presentation/components/layout/AppSidebar.vue';
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue';
import {socketHandler} from '@/infrastructure/websocket';

/**
 * Toast notification interface
 */
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

// Router
const router = useRouter();
const route = useRoute();

// Stores
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const {isAuthenticated} = storeToRefs(authStore);

// State
const isInitializing = ref(true);
const sidebarCollapsed = ref(false);
const mobileSidebarOpen = ref(false);
const toasts = ref<Toast[]>([]);

// Layout detection
const isBlankLayout = computed(() => {
  return route.meta.layout === 'blank' || !isAuthenticated.value;
});

/**
 * Toggle sidebar based on screen size
 */
function toggleSidebar(): void {
  if (window.innerWidth < 1024) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value;
  } else {
    toggleSidebarCollapse();
  }
}

/**
 * Toggle sidebar collapse state (desktop)
 */
function toggleSidebarCollapse(): void {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed.value));
}

// Close mobile sidebar on route change
watch(route, () => {
  mobileSidebarOpen.value = false;
});

/**
 * Add toast notification
 *
 * @param {Omit<Toast, 'id'>} toast - Toast configuration
 */
function addToast(toast: Omit<Toast, 'id'>): void {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newToast: Toast = {...toast, id};
  toasts.value.push(newToast);

  // Auto-remove after duration
  const duration = toast.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

/**
 * Remove toast notification by ID
 *
 * @param {string} id - Toast identifier
 */
function removeToast(id: string): void {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
}

/**
 * Get icon for toast type
 *
 * @param {Toast['type']} type - Toast type
 * @returns {string} Icon emoji
 */
function getToastIcon(type: Toast['type']): string {
  const icons: Record<Toast['type'], string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };
  return icons[type];
}

// Provide toast function to child components
provide('toast', addToast);

/**
 * Handle logout action
 */
async function handleLogout(): Promise<void> {
  try {
    await authStore.logout();
    router.push('/login');
    addToast({type: 'success', message: 'You have been logged out successfully.'});
  } catch (error) {
    console.error('Logout failed:', error);
    addToast({type: 'error', message: 'Failed to logout. Please try again.'});
  }
}

/**
 * Initialize application
 */
async function initializeApp(): Promise<void> {
  isInitializing.value = true;

  const appDebug = import.meta.env.DEV;

  try {
    // Restore sidebar state
    const savedCollapsed = localStorage.getItem('sidebar_collapsed');
    if (savedCollapsed !== null) {
      sidebarCollapsed.value = savedCollapsed === 'true';
    }

    // Check authentication status
    try {
      await authStore.initialize();
    } catch (error) {
      console.log('No active session found');
    }

    // If authenticated, load initial data and connect WebSocket
    if (appDebug) {
      console.log('[App] 🔍 Checking auth state:', {
        isAuthenticated: isAuthenticated.value,
        hasUserId: !!authStore.userId,
        hasAccessToken: !!authStore.accessToken,
      });
    }
    
    if (isAuthenticated.value && authStore.userId && authStore.accessToken) {
      try {
        if (appDebug) {
          console.log('[App] 🔌 Connecting to WebSocket...', {
            userId: authStore.userId,
            hasToken: !!authStore.accessToken,
          });
        }
        
        // Connect to WebSocket (this automatically joins user channel)
        socketHandler.connect({
          token: authStore.accessToken,
          userId: authStore.userId,
          debug: appDebug,
        });

        if (appDebug) {
          console.log('[App] ✅ WebSocket connection initiated');
        }

        await notificationStore.fetchNotifications();
      } catch (error) {
        console.error('[App] ❌ Failed to connect WebSocket:', error);
      }
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
    addToast({
      type: 'error',
      message: 'Failed to initialize application. Please refresh the page.',
      duration: 0,
    });
  } finally {
    isInitializing.value = false;
  }
}

/**
 * Handle window resize for responsive sidebar
 */
function handleResize(): void {
  // Close mobile sidebar on resize to desktop
  if (window.innerWidth >= 1024) {
    mobileSidebarOpen.value = false;
  }
}

// Watch for authentication state changes to connect/disconnect WebSocket
watch(
  () => isAuthenticated.value,
  (authenticated, wasAuthenticated) => {
    const appDebug = import.meta.env.DEV;

    if (appDebug) {
      console.log('[App] 🔄 Auth state changed:', { authenticated, wasAuthenticated });
    }
    
    if (authenticated && authStore.userId && authStore.accessToken) {
      // User just logged in - connect WebSocket
      if (appDebug) {
        console.log('[App] 🔌 Connecting to WebSocket after login...', {
          userId: authStore.userId,
          hasToken: !!authStore.accessToken,
        });
      }
      
      try {
        socketHandler.connect({
          token: authStore.accessToken,
          userId: authStore.userId,
          debug: appDebug,
        });

        if (appDebug) {
          console.log('[App] ✅ WebSocket connection initiated');
        }
      } catch (error) {
        console.error('[App] ❌ Failed to connect WebSocket:', error);
      }
    } else if (!authenticated && wasAuthenticated) {
      // User logged out - disconnect WebSocket
      if (appDebug) {
        console.log('[App] 🔌 Disconnecting WebSocket after logout...');
      }
      socketHandler.disconnect();
    }
  },
  { immediate: false }
);

// Lifecycle
onMounted(() => {
  initializeApp();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
/* Global app styles */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-secondary);
}

.app-loading {
  overflow: hidden;
}

/* Initializing overlay */
.app-initializing {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
}

.app-initializing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
}

.app-initializing-logo {
  font-size: 4rem;
  margin-bottom: var(--spacing-4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.app-initializing-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-6);
  letter-spacing: -0.02em;
}

.app-initializing-text {
  margin-top: var(--spacing-4);
  font-size: var(--font-size-base);
  opacity: 0.9;
}

/* Layout */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  margin-left: 256px;
  margin-top: 64px;
  transition: margin-left 0.3s ease;
  background-color: var(--color-bg-secondary);
}

.app-main-sidebar-collapsed {
  margin-left: 64px;
}

@media (max-width: 1024px) {
  .app-main {
    margin-left: 0;
  }

  .app-main-sidebar-collapsed {
    margin-left: 0;
  }
}

/* Page loading */
.app-page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* Sidebar overlay (mobile) */
.app-sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 998;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

/* Toast notifications */
.toast-container {
  position: fixed;
  top: var(--spacing-4);
  right: var(--spacing-4);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-width: 400px;
  width: 100%;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border-left: 4px solid;
  pointer-events: auto;
  transition: var(--transition-all);
}

.toast:hover {
  box-shadow: var(--shadow-2xl);
  transform: translateY(-2px);
}

.toast-success {
  border-color: var(--color-success);
}

.toast-error {
  border-color: var(--color-error);
}

.toast-warning {
  border-color: var(--color-warning);
}

.toast-info {
  border-color: var(--color-primary);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-top: 2px;
}

.toast-success .toast-icon {
  color: var(--color-success);
}

.toast-error .toast-icon {
  color: var(--color-error);
}

.toast-warning .toast-icon {
  color: var(--color-warning);
}

.toast-info .toast-icon {
  color: var(--color-primary);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1);
}

.toast-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  flex-shrink: 0;
  font-size: var(--font-size-xl);
  line-height: 1;
  transition: var(--transition-all);
}

.toast-close:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .toast-container {
    left: var(--spacing-4);
    right: var(--spacing-4);
    max-width: none;
  }

  .toast {
    padding: var(--spacing-3);
  }

  .toast-title {
    font-size: var(--font-size-xs);
  }

  .toast-message {
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .app-initializing-logo {
    font-size: 3rem;
  }

  .app-initializing-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
