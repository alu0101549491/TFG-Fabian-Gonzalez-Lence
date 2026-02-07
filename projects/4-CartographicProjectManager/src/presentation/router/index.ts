/**
 * @module presentation/router
 * @description Vue Router configuration.
 * Defines application routes with navigation guards for authentication
 * and role-based access control. Supports the "maximum 3 clicks to any
 * section" requirement (NFR5).
 * @category Presentation
 */

import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router';
import {useAuthStore} from '../stores/auth.store';

/**
 * Application route definitions.
 * Organized by functional area with lazy loading for performance.
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {requiresAuth: false},
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: {requiresAuth: true},
  },
  {
    path: '/projects',
    name: 'ProjectList',
    component: () => import('../views/ProjectListView.vue'),
    meta: {requiresAuth: true},
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetails',
    component: () => import('../views/ProjectDetailsView.vue'),
    meta: {requiresAuth: true},
    props: true,
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/CalendarView.vue'),
    meta: {requiresAuth: true},
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/NotificationsView.vue'),
    meta: {requiresAuth: true},
  },
  {
    path: '/backup',
    name: 'Backup',
    component: () => import('../views/BackupView.vue'),
    meta: {requiresAuth: true, requiresAdmin: true},
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
];

/**
 * Vue Router instance with HTML5 History mode.
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return {el: to.hash, behavior: 'smooth'};
    } else {
      return {top: 0};
    }
  },
});

/**
 * Global navigation guard for authentication and authorization.
 */
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth !== false;
  const requiresAdmin = to.meta.requiresAdmin === true;

  // Check session if not already authenticated
  if (!authStore.isAuthenticated && requiresAuth) {
    const hasValidSession = await authStore.checkSession();
    
    if (!hasValidSession) {
      // Store intended destination for post-login redirect
      sessionStorage.setItem('intended_route', to.fullPath);
      return next({name: 'Login', query: {redirect: to.fullPath}});
    }
  }

  // Allow access to login page
  if (to.name === 'Login') {
    if (authStore.isAuthenticated) {
      // Redirect authenticated users away from login
      return next({name: 'Dashboard'});
    }
    return next();
  }

  // Check authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    sessionStorage.setItem('intended_route', to.fullPath);
    return next({name: 'Login', query: {redirect: to.fullPath}});
  }

  // Check admin authorization
  if (requiresAdmin && !authStore.isAdmin) {
    console.warn(`Access denied: ${String(to.name)} requires admin role`);
    return next({name: 'Dashboard'});
  }

  // Allow navigation
  next();
});

/**
 * Global after hook for analytics and logging.
 */
router.afterEach((to, from) => {
  // Update document title
  const baseTitle = 'Cartographic Project Manager';
  document.title = to.meta.title ? `${to.meta.title} - ${baseTitle}` : baseTitle;

  // Log navigation for debugging (development only)
  if (import.meta.env.DEV) {
    console.log(`Navigation: ${String(from.name) || 'unknown'} -> ${String(to.name) || 'unknown'}`);
  }
});

export default router;
