/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-01-08
 * @file src/main.ts
 * @desc Application entry point that bootstraps the Vue application with
 *       Pinia store, Vue Router, global error handling, and navigation guards.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://vuejs.org/guide/essentials/application.html}
 */

import {createApp} from 'vue';
import {createPinia} from 'pinia';
import router from '@/presentation/router';
import App from '@/App.vue';
import {httpClient} from '@/infrastructure/http';
import {TokenStorage} from '@/infrastructure/persistence/token.storage';

// Global styles
import '@/presentation/styles/variables.css';
import '@/presentation/styles/main.css';

// ============================================================================
// Application Instance Creation
// ============================================================================

/**
 * Create Vue application instance
 */
const app = createApp(App);

/**
 * Create Pinia store instance
 */
const pinia = createPinia();

// ============================================================================
// Plugin Registration
// ============================================================================

// Register Pinia for state management
app.use(pinia);

// Register Vue Router
app.use(router);

// ============================================================================
// HTTP Client Configuration
// ============================================================================

/**
 * Configure HTTP client with token storage for authenticated requests
 */
const tokenStorage = new TokenStorage();
httpClient.setTokenStorage(tokenStorage);

if (import.meta.env.DEV) {
  console.log('🔐 HTTP client configured with token storage');
}

// ============================================================================
// Global Error Handling
// ============================================================================

/**
 * Global error handler for uncaught errors in components
 *
 * @param {unknown} err - The error that was thrown
 * @param {any} instance - The component instance
 * @param {string} info - Vue-specific error info
 */
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err);
  console.error('Component:', instance);
  console.error('Error info:', info);

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Example: sendToErrorTracking({ error: err, context: info });
  }
};

/**
 * Global warning handler (development only)
 *
 * @param {string} msg - Warning message
 * @param {any} instance - Component instance
 * @param {string} trace - Component trace
 */
app.config.warnHandler = (msg, instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn('Vue warning:', msg);
    console.warn('Component:', instance);
    console.warn('Trace:', trace);
  }
};

// ============================================================================
// Global Properties
// ============================================================================

/**
 * Add global properties accessible in all components
 * Note: With Composition API, prefer using inject or composables
 */
app.config.globalProperties.$appName = 'Cartographic Project Manager';
app.config.globalProperties.$appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

// ============================================================================
// Performance Monitoring (Development)
// ============================================================================

if (import.meta.env.DEV) {
  // Enable performance tracking in development
  app.config.performance = true;
  console.log('🚀 Application starting in development mode');
  console.log('📊 Performance tracking enabled');
}

// ============================================================================
// Router Guards
// ============================================================================

/**
 * Global navigation guard for authentication
 */
router.beforeEach(async (to, _from, next) => {
  // Import auth store dynamically to avoid circular dependencies
  const {useAuthStore} = await import('@/presentation/stores/auth.store');
  const authStore = useAuthStore();

  // Check if route requires authentication
  const requiresAuth = to.meta.requiresAuth !== false;
  const requiresAdmin = to.meta.requiresAdmin === true;

  // If not authenticated and route requires auth, redirect to login
  if (requiresAuth && !authStore.isAuthenticated) {
    // Try to restore session from stored token
    try {
      await authStore.initialize();
    } catch (error) {
      // Session restore failed, redirect to login
      if (to.name !== 'login') {
        return next({
          name: 'login',
          query: {redirect: to.fullPath},
        });
      }
    }

    // Check again after session restore attempt
    if (!authStore.isAuthenticated && to.name !== 'login') {
      return next({
        name: 'login',
        query: {redirect: to.fullPath},
      });
    }
  }

  // If route requires admin and user is not admin
  if (requiresAdmin && authStore.user?.role !== 'ADMINISTRATOR') {
    console.warn('Access denied: Admin privileges required');
    return next({name: 'dashboard'});
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (to.name === 'login' && authStore.isAuthenticated) {
    return next({name: 'dashboard'});
  }

  next();
});

/**
 * After each navigation, update document title
 */
router.afterEach((to) => {
  const baseTitle = 'Cartographic PM';
  const pageTitle = to.meta.title as string | undefined;

  document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;

  // Log navigation in development
  if (import.meta.env.DEV) {
    console.log(`📍 Navigated to: ${to.path}`);
  }
});

/**
 * Handle navigation errors
 */
router.onError((error) => {
  console.error('Router error:', error);

  // In production, you might want to show a user-friendly error page
  if (import.meta.env.PROD) {
    // Example: redirect to error page
    // router.push('/error');
  }
});

// ============================================================================
// Mount Application
// ============================================================================

/**
 * Mount the app to the DOM
 */
app.mount('#app');

// Log successful mount in development
if (import.meta.env.DEV) {
  console.log('✅ Application mounted successfully');
  console.log(`📦 Version: ${app.config.globalProperties.$appVersion}`);
}

// ============================================================================
// Hot Module Replacement (Development)
// ============================================================================

if (import.meta.hot) {
  import.meta.hot.accept();

  if (import.meta.env.DEV) {
    console.log('🔥 Hot Module Replacement enabled');
  }
}

// ============================================================================
// Service Worker Registration (Production)
// ============================================================================
// PWA Service Worker Registration
// ============================================================================
// Service worker is auto-registered by vite-plugin-pwa
// The plugin handles registration, updates, and offline caching automatically

// ============================================================================
// Unhandled Promise Rejection Handler
// ============================================================================

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Prevent default browser behavior
  event.preventDefault();

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Example: sendToErrorTracking({ error: event.reason, type: 'unhandledRejection' });
  }
});

// ============================================================================
// Exports (for testing and debugging)
// ============================================================================

export {app, pinia, router};
