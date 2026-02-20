/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/router/index.ts
 * @desc Vue Router configuration with authentication and authorization guards
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://router.vuejs.org/guide/}
 */

import {
  createRouter,
  createWebHistory,
  useRouter,
  type RouteRecordRaw,
  type Router,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from 'vue-router';
import {useAuthStore} from '../stores';
import {UserRole} from '../../domain/enumerations/user-role';

// ============================================
// ROUTE META INTERFACE EXTENSION
// ============================================

/**
 * Extend Vue Router's RouteMeta interface for type-safe meta fields
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** Whether authentication is required (default: true) */
    requiresAuth?: boolean;

    /** Whether route is for guests only (e.g., login page) */
    guestOnly?: boolean;

    /** Required user roles to access this route */
    roles?: UserRole[];

    /** Page title for document.title */
    title?: string;

    /** Whether to show this route in navigation menu */
    showInNav?: boolean;

    /** Icon name for navigation menu (Lucide icon name) */
    icon?: string;

    /** Navigation menu order (lower = earlier) */
    navOrder?: number;

    /** Whether project-specific access check is needed */
    requiresProjectAccess?: boolean;

    /** Layout to use ('default' | 'auth' | 'blank') */
    layout?: 'default' | 'auth' | 'blank';
  }
}

// ============================================
// NAVIGATION ITEM INTERFACE
// ============================================

/**
 * Navigation menu item
 */
export interface NavigationItem {
  /** Route name */
  name: string;

  /** Route path */
  path: string;

  /** Display title */
  title: string;

  /** Icon name */
  icon: string;

  /** Navigation order */
  order: number;
}

// ============================================
// ROUTE DEFINITIONS
// ============================================

/**
 * Application route definitions
 *
 * Organized by functional area with lazy loading for performance.
 * All meta fields configured for authentication, authorization,
 * and navigation menu generation.
 */
const routes: RouteRecordRaw[] = [
  // ==========================================
  // PUBLIC ROUTES
  // ==========================================

  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      requiresAuth: false,
      guestOnly: true,
      title: 'Login',
      layout: 'auth',
    },
  },

  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: {
      requiresAuth: false,
      guestOnly: true,
      title: 'Register',
      layout: 'auth',
    },
  },

  // ==========================================
  // AUTHENTICATED ROUTES
  // ==========================================

  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
      showInNav: true,
      icon: 'home',
      navOrder: 1,
      layout: 'default',
    },
  },

  {
    path: '/projects',
    name: 'projects',
    component: () => import('../views/ProjectListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Projects',
      showInNav: true,
      icon: 'folder',
      navOrder: 2,
      layout: 'default',
    },
  },

  {
    path: '/projects/:id',
    name: 'project-details',
    component: () => import('../views/ProjectDetailsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Project Details',
      requiresProjectAccess: true,
      layout: 'default',
    },
    props: true,
  },

  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('../views/CalendarView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Calendar',
      showInNav: true,
      icon: 'calendar',
      navOrder: 3,
      layout: 'default',
    },
  },

  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('../views/NotificationsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Notifications',
      layout: 'default',
    },
  },

  {
    path: '/backup',
    name: 'backup',
    component: () => import('../views/BackupView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Backup & Export',
      roles: [UserRole.ADMINISTRATOR],
      showInNav: true,
      icon: 'database',
      navOrder: 4,
      layout: 'default',
    },
  },

  {
    path: '/users',
    name: 'users',
    component: () => import('../views/UserManagementView.vue'),
    meta: {
      requiresAuth: true,
      title: 'User Management',
      roles: [UserRole.ADMINISTRATOR],
      showInNav: true,
      icon: 'users',
      navOrder: 5,
      layout: 'default',
    },
  },

  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Settings',
      showInNav: true,
      icon: 'settings',
      navOrder: 6,
      layout: 'default',
    },
  },

  // ==========================================
  // ERROR ROUTES
  // ==========================================

  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('../views/ForbiddenView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Access Denied',
      layout: 'blank',
    },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Page Not Found',
      layout: 'blank',
    },
  },
];

// ============================================
// ROUTER CREATION
// ============================================

/**
 * Vue Router instance with HTML5 History mode
 *
 * Configured with:
 * - Web History API for clean URLs
 * - Base URL from environment variable
 * - Scroll behavior for better UX
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    // Preserve scroll position on browser back/forward
    if (savedPosition) {
      return savedPosition;
    }

    // Scroll to anchor if hash present
    if (to.hash) {
      return {el: to.hash, behavior: 'smooth'};
    }

    // Scroll to top on navigation
    return {top: 0, behavior: 'smooth'};
  },
});

// ============================================
// NAVIGATION GUARDS
// ============================================

/**
 * Global navigation guard for authentication and authorization
 *
 * Execution flow:
 * 1. Initialize auth state if needed
 * 2. Handle guest-only routes (login)
 * 3. Check authentication requirement
 * 4. Validate role-based access
 * 5. Check project-specific permissions
 * 6. Allow navigation
 *
 * @param to - Target route
 * @param from - Current route
 * @param next - Navigation callback
 */
router.beforeEach(async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  // Initialize auth state if not already done
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.meta.requiresAuth !== false; // Default to true
  const guestOnly = to.meta.guestOnly === true;
  const requiredRoles = to.meta.roles as UserRole[] | undefined;
  const requiresProjectAccess = to.meta.requiresProjectAccess === true;

  // ==========================================
  // 1. Guest-only routes (e.g., login)
  // ==========================================
  if (guestOnly && isAuthenticated) {
    // Authenticated users should not access login page
    return next({name: 'dashboard'});
  }

  // ==========================================
  // 2. Authentication check
  // ==========================================
  if (requiresAuth && !isAuthenticated) {
    // Save intended destination for post-login redirect
    return next({
      name: 'login',
      query: {redirect: to.fullPath},
    });
  }

  // ==========================================
  // 3. Role-based access control
  // ==========================================
  if (requiredRoles && requiredRoles.length > 0 && isAuthenticated) {
    const userRole = authStore.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      console.warn(
        `Access denied: User role "${userRole}" not authorized for ${String(to.name)}`
      );
      return next({name: 'forbidden'});
    }
  }

  // ==========================================
  // 4. Project-specific access control
  // ==========================================
  if (requiresProjectAccess && isAuthenticated) {
    const projectId = to.params.id as string;

    if (projectId && authStore.userId) {
      // TODO: Replace with actual authorization service check
      // For now, assume access is granted
      // const authorizationService = useAuthorizationService();
      // const canAccess = await authorizationService.canAccessProject(
      //   authStore.userId,
      //   projectId
      // );
      //
      // if (!canAccess) {
      //   console.warn(`Access denied: User cannot access project ${projectId}`);
      //   return next({ name: 'forbidden' });
      // }

      // Temporary: Allow all authenticated users
      // This will be replaced when authorization service is integrated
    }
  }

  // ==========================================
  // 5. Allow navigation
  // ==========================================
  next();
});

/**
 * Global after navigation hook
 *
 * Updates document title and performs post-navigation tasks.
 *
 * @param to - Target route that was navigated to
 */
router.afterEach((to: RouteLocationNormalized) => {
  // Update document title
  const title = to.meta.title as string | undefined;
  const baseTitle = 'Cartographic Project Manager';

  document.title = title ? `${title} | ${baseTitle}` : baseTitle;

  // Log navigation in development
  if (import.meta.env.DEV) {
    console.log(`[Router] Navigated to: ${String(to.name)} (${to.path})`);
  }
});

/**
 * Global error handler for navigation failures
 *
 * Handles chunk loading errors (dynamic imports) and other
 * navigation-related errors.
 *
 * @param error - Navigation error
 */
router.onError((error: Error) => {
  console.error('[Router] Navigation error:', error);

  // Handle chunk loading errors (e.g., after deployment with cache)
  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  ) {
    console.warn('[Router] Chunk loading failed, reloading page...');
    window.location.reload();
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Gets navigation items for menu
 *
 * Filters routes based on user role and showInNav meta field,
 * then sorts by navOrder for consistent menu display.
 *
 * @param userRole - Current user's role (null if not authenticated)
 * @returns Filtered and sorted navigation items
 *
 * @example
 * ```typescript
 * const authStore = useAuthStore();
 * const navItems = getNavigationItems(authStore.user?.role);
 * // Returns: [{ name: 'dashboard', path: '/', title: 'Dashboard', icon: 'home', order: 1 }, ...]
 * ```
 */
export function getNavigationItems(userRole: UserRole | null): NavigationItem[] {
  return routes
    .filter((route) => {
      // Must have showInNav flag
      if (!route.meta?.showInNav) return false;

      // Check role restrictions
      const requiredRoles = route.meta.roles as UserRole[] | undefined;

      if (requiredRoles && requiredRoles.length > 0) {
        if (!userRole || !requiredRoles.includes(userRole)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const orderA = (a.meta?.navOrder as number) ?? 999;
      const orderB = (b.meta?.navOrder as number) ?? 999;
      return orderA - orderB;
    })
    .map((route) => ({
      name: route.name as string,
      path: route.path,
      title: route.meta?.title as string,
      icon: route.meta?.icon as string,
      order: route.meta?.navOrder as number,
    }));
}

/**
 * Programmatic navigation helpers composable
 *
 * Provides type-safe navigation functions for common routes.
 * Simplifies routing in components and reduces magic strings.
 *
 * @returns Navigation helper functions
 *
 * @example
 * ```vue
 * <script setup>
 * import { useNavigation } from '@/presentation/router';
 *
 * const { goToProject, goBack } = useNavigation();
 *
 * function handleProjectClick(projectId: string) {
 *   goToProject(projectId, 'tasks');
 * }
 * </script>
 * ```
 */
export function useNavigation() {
  const router = useRouter();

  /**
   * Navigate to login page with optional redirect
   */
  function goToLogin(redirect?: string): void {
    router.push({
      name: 'login',
      query: redirect ? {redirect} : undefined,
    });
  }

  /**
   * Navigate to dashboard
   */
  function goToDashboard(): void {
    router.push({name: 'dashboard'});
  }

  /**
   * Navigate to project details
   *
   * @param projectId - Project unique identifier
   * @param tab - Optional tab to activate (e.g., 'tasks', 'messages', 'files')
   */
  function goToProject(projectId: string, tab?: string): void {
    router.push({
      name: 'project-details',
      params: {id: projectId},
      query: tab ? {tab} : undefined,
    });
  }

  /**
   * Navigate to projects list
   */
  function goToProjects(): void {
    router.push({name: 'projects'});
  }

  /**
   * Navigate to calendar view
   */
  function goToCalendar(): void {
    router.push({name: 'calendar'});
  }

  /**
   * Navigate to notifications
   */
  function goToNotifications(): void {
    router.push({name: 'notifications'});
  }

  /**
   * Navigate to settings
   */
  function goToSettings(): void {
    router.push({name: 'settings'});
  }

  /**
   * Navigate to backup/export page (admin only)
   */
  function goToBackup(): void {
    router.push({name: 'backup'});
  }

  /**
   * Navigate back in history
   */
  function goBack(): void {
    router.back();
  }

  /**
   * Navigate to forbidden page
   */
  function goToForbidden(): void {
    router.push({name: 'forbidden'});
  }

  return {
    goToLogin,
    goToDashboard,
    goToProject,
    goToProjects,
    goToCalendar,
    goToNotifications,
    goToSettings,
    goToBackup,
    goBack,
    goToForbidden,
  };
}

/**
 * Handles post-login redirect
 *
 * Redirects user to intended route (from query param) or dashboard.
 * Used after successful login to complete the authentication flow.
 *
 * @param router - Vue Router instance
 *
 * @example
 * ```typescript
 * // In LoginView.vue after successful login
 * const router = useRouter();
 * handlePostLoginRedirect(router);
 * ```
 */
export function handlePostLoginRedirect(router: Router): void {
  const route = router.currentRoute.value;
  const redirect = route.query.redirect as string | undefined;

  if (redirect && redirect !== '/login') {
    // Redirect to intended route
    router.push(redirect);
  } else {
    // Default to dashboard
    router.push({name: 'dashboard'});
  }
}

// ============================================
// EXPORTS
// ============================================

export default router;
export {routes};
