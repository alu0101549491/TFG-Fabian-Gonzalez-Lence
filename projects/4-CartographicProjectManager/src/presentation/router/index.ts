/**
 * @module presentation/router
 * @description Vue Router configuration.
 * Defines application routes with navigation guards for authentication
 * and role-based access control. Supports the "maximum 3 clicks to any
 * section" requirement (NFR5).
 * @category Presentation
 */

import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router';

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
];

/**
 * Vue Router instance with HTML5 History mode.
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Global navigation guard for authentication and authorization.
 */
router.beforeEach((to, _from, next) => {
  // TODO: Implement authentication check
  // 1. Check if route requires auth
  // 2. Verify session token is valid
  // 3. Check role-based access (admin-only routes)
  // 4. Redirect to login if unauthorized
  next();
});

export default router;
