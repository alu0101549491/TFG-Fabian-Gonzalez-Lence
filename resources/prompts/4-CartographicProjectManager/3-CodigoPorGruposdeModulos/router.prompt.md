# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → Infrastructure Layer → **Presentation Layer** (current)

**Current module:** Presentation Layer - Vue Router Configuration

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/                        # ✅ Already implemented
│   ├── domain/                             # ✅ Already implemented
│   ├── infrastructure/                     # ✅ Already implemented
│   ├── shared/                             # ✅ Already implemented
│   └── presentation/
│       ├── assets/
│       │   └── styles/                     # ✅ Already implemented
│       ├── components/
│       │   └── ...
│       ├── composables/
│       │   ├── index.ts                    # ✅ Already implemented
│       │   ├── useAuth.ts                  # ✅ Already implemented
│       │   ├── useProjects.ts              # ✅ Already implemented
│       │   ├── useTasks.ts                 # ✅ Already implemented
│       │   ├── useMessages.ts              # ✅ Already implemented
│       │   └── useNotifications.ts         # ✅ Already implemented
│       ├── router/
│       │   └── index.ts                    # 🎯 TO IMPLEMENT
│       ├── stores/
│       │   └── ...                         # ✅ Already implemented
│       ├── views/
│       │   ├── LoginView.vue
│       │   ├── DashboardView.vue
│       │   ├── ProjectsView.vue
│       │   ├── ProjectDetailsView.vue
│       │   ├── CalendarView.vue
│       │   ├── NotificationsView.vue
│       │   ├── BackupView.vue
│       │   ├── SettingsView.vue
│       │   └── NotFoundView.vue
│       ├── App.vue
│       └── main.ts
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification - Navigation & Access Control

### User Roles and Access (Section 8)

| Feature | Administrator | Client | Special User |
|---------|---------------|--------|--------------|
| Dashboard | ✅ All projects | ✅ Assigned projects | ✅ Permitted projects |
| Create Project | ✅ | ❌ | ❌ |
| View Project | ✅ All | ✅ Assigned | ✅ With VIEW permission |
| Edit Project | ✅ All | ❌ | ✅ With EDIT permission |
| Delete Project | ✅ All | ❌ | ❌ |
| Calendar View | ✅ All | ✅ Assigned | ✅ Permitted |
| Notifications | ✅ | ✅ | ✅ |
| Backup/Export | ✅ | ❌ | ❌ |
| Settings | ✅ | ✅ | ✅ |

### Application Routes (Section 14)

| Route | Path | View | Auth Required | Role Restriction |
|-------|------|------|---------------|------------------|
| Login | `/login` | LoginView | ❌ (public) | - |
| Dashboard | `/` | DashboardView | ✅ | All roles |
| Projects | `/projects` | ProjectsView | ✅ | All roles |
| Project Details | `/projects/:id` | ProjectDetailsView | ✅ | Access permission |
| Calendar | `/calendar` | CalendarView | ✅ | All roles |
| Notifications | `/notifications` | NotificationsView | ✅ | All roles |
| Backup | `/backup` | BackupView | ✅ | Admin only |
| Settings | `/settings` | SettingsView | ✅ | All roles |
| Not Found | `/:pathMatch(.*)*` | NotFoundView | ❌ | - |

### Navigation Guards Requirements
- Redirect unauthenticated users to login
- Redirect authenticated users away from login
- Check role-based access for protected routes
- Check project-specific permissions for project details
- Handle session expiration gracefully
- Preserve intended destination after login

## 2. Pinia Auth Store (Already Implemented)

```typescript
interface AuthStore {
  // State
  user: UserDto | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  // Getters
  userId: string | null;
  isAdmin: boolean;
  isClient: boolean;
  isSpecialUser: boolean;
  
  // Actions
  initialize(): Promise<void>;
  validateSession(): Promise<boolean>;
}
```

## 3. Authorization Service (Already Implemented)

```typescript
interface IAuthorizationService {
  canAccessProject(userId: string, projectId: string): Promise<boolean>;
  canModifyProject(userId: string, projectId: string): Promise<boolean>;
  canManageBackups(userId: string): Promise<boolean>;
  canExportData(userId: string): Promise<boolean>;
}
```

---

# SPECIFIC TASK

Implement the Vue Router configuration for the Presentation Layer. This includes route definitions, navigation guards, and meta information for access control.

## File to implement:

### **router/index.ts**

**Responsibilities:**
- Define all application routes
- Configure route meta for access control
- Implement global navigation guards
- Handle authentication redirects
- Handle role-based access control
- Handle project permission checks
- Support lazy loading of views
- Handle 404 not found

**Route Meta Interface:**

```typescript
/**
 * Route meta fields for access control
 */
interface RouteMeta {
  /** Whether authentication is required */
  requiresAuth?: boolean;
  
  /** Whether route is for guests only (e.g., login) */
  guestOnly?: boolean;
  
  /** Required user roles (if any) */
  roles?: UserRole[];
  
  /** Page title for document.title */
  title?: string;
  
  /** Whether to show in navigation */
  showInNav?: boolean;
  
  /** Navigation icon name */
  icon?: string;
  
  /** Navigation order */
  navOrder?: number;
  
  /** Whether project access check is needed */
  requiresProjectAccess?: boolean;
  
  /** Layout to use */
  layout?: 'default' | 'auth' | 'blank';
}
```

**Routes to Define:**

```typescript
const routes: RouteRecordRaw[] = [
  // ==========================================
  // PUBLIC ROUTES
  // ==========================================
  {
    path: '/login',
    name: 'login',
    component: () => import('@/presentation/views/LoginView.vue'),
    meta: {
      guestOnly: true,
      title: 'Login',
      layout: 'auth',
    },
  },
  
  // ==========================================
  // AUTHENTICATED ROUTES
  // ==========================================
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/presentation/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
      showInNav: true,
      icon: 'home',
      navOrder: 1,
    },
  },
  
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/presentation/views/ProjectsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Projects',
      showInNav: true,
      icon: 'folder',
      navOrder: 2,
    },
  },
  
  {
    path: '/projects/:id',
    name: 'project-details',
    component: () => import('@/presentation/views/ProjectDetailsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Project Details',
      requiresProjectAccess: true,
    },
    props: true,
  },
  
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('@/presentation/views/CalendarView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Calendar',
      showInNav: true,
      icon: 'calendar',
      navOrder: 3,
    },
  },
  
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/presentation/views/NotificationsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Notifications',
    },
  },
  
  {
    path: '/backup',
    name: 'backup',
    component: () => import('@/presentation/views/BackupView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Backup & Export',
      roles: [UserRole.ADMINISTRATOR],
      showInNav: true,
      icon: 'database',
      navOrder: 4,
    },
  },
  
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/presentation/views/SettingsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Settings',
      showInNav: true,
      icon: 'settings',
      navOrder: 5,
    },
  },
  
  // ==========================================
  // ERROR ROUTES
  // ==========================================
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/presentation/views/ForbiddenView.vue'),
    meta: {
      title: 'Access Denied',
      layout: 'blank',
    },
  },
  
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/presentation/views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found',
      layout: 'blank',
    },
  },
];
```

**Navigation Guards:**

```typescript
/**
 * Global before guard - runs before every navigation
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize auth state if not done
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }
  
  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.meta.requiresAuth;
  const guestOnly = to.meta.guestOnly;
  const requiredRoles = to.meta.roles as UserRole[] | undefined;
  const requiresProjectAccess = to.meta.requiresProjectAccess;
  
  // 1. Guest-only routes (login) - redirect authenticated users to dashboard
  if (guestOnly && isAuthenticated) {
    return next({ name: 'dashboard' });
  }
  
  // 2. Protected routes - redirect unauthenticated users to login
  if (requiresAuth && !isAuthenticated) {
    // Save intended destination
    return next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    });
  }
  
  // 3. Role-based access control
  if (requiredRoles && requiredRoles.length > 0 && isAuthenticated) {
    const userRole = authStore.user?.role;
    if (!userRole || !requiredRoles.includes(userRole)) {
      return next({ name: 'forbidden' });
    }
  }
  
  // 4. Project-specific access control
  if (requiresProjectAccess && isAuthenticated) {
    const projectId = to.params.id as string;
    if (projectId) {
      const authorizationService = useAuthorizationService();
      const canAccess = await authorizationService.canAccessProject(
        authStore.userId!,
        projectId
      );
      
      if (!canAccess) {
        return next({ name: 'forbidden' });
      }
    }
  }
  
  // 5. Allow navigation
  next();
});

/**
 * Global after guard - runs after every navigation
 */
router.afterEach((to) => {
  // Update document title
  const title = to.meta.title as string;
  document.title = title 
    ? `${title} | Cartographic Project Manager`
    : 'Cartographic Project Manager';
});

/**
 * Error handler for navigation failures
 */
router.onError((error) => {
  console.error('Navigation error:', error);
  
  // Handle chunk loading errors (e.g., after deployment)
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    window.location.reload();
  }
});
```

**Helper Functions:**

```typescript
/**
 * Get navigation items for menu
 * Filters routes based on user role and showInNav meta
 */
export function getNavigationItems(userRole: UserRole | null): NavigationItem[] {
  return routes
    .filter(route => {
      // Must have showInNav
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
    .map(route => ({
      name: route.name as string,
      path: route.path,
      title: route.meta?.title as string,
      icon: route.meta?.icon as string,
    }));
}

/**
 * Navigation item type
 */
export interface NavigationItem {
  name: string;
  path: string;
  title: string;
  icon: string;
}

/**
 * Programmatic navigation helpers
 */
export function useNavigation() {
  const router = useRouter();
  
  function goToLogin(redirect?: string): void {
    router.push({ 
      name: 'login', 
      query: redirect ? { redirect } : undefined 
    });
  }
  
  function goToDashboard(): void {
    router.push({ name: 'dashboard' });
  }
  
  function goToProject(projectId: string, tab?: string): void {
    router.push({ 
      name: 'project-details', 
      params: { id: projectId },
      query: tab ? { tab } : undefined,
    });
  }
  
  function goToProjects(): void {
    router.push({ name: 'projects' });
  }
  
  function goToCalendar(): void {
    router.push({ name: 'calendar' });
  }
  
  function goToNotifications(): void {
    router.push({ name: 'notifications' });
  }
  
  function goToSettings(): void {
    router.push({ name: 'settings' });
  }
  
  function goToBackup(): void {
    router.push({ name: 'backup' });
  }
  
  function goBack(): void {
    router.back();
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
  };
}

/**
 * Handle post-login redirect
 */
export function handlePostLoginRedirect(router: Router): void {
  const route = router.currentRoute.value;
  const redirect = route.query.redirect as string;
  
  if (redirect && redirect !== '/login') {
    router.push(redirect);
  } else {
    router.push({ name: 'dashboard' });
  }
}
```

**Complete Implementation Structure:**

```typescript
// src/presentation/router/index.ts

import { 
  createRouter, 
  createWebHistory, 
  type RouteRecordRaw,
  type Router,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from 'vue-router';
import { useAuthStore } from '@/presentation/stores';
import { useAuthorizationService } from '@/application/services';
import { UserRole } from '@/domain/enumerations';

// ============================================
// ROUTE META INTERFACE
// ============================================

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
    roles?: UserRole[];
    title?: string;
    showInNav?: boolean;
    icon?: string;
    navOrder?: number;
    requiresProjectAccess?: boolean;
    layout?: 'default' | 'auth' | 'blank';
  }
}

// ============================================
// ROUTE DEFINITIONS
// ============================================

const routes: RouteRecordRaw[] = [
  // ... all routes as defined above
];

// ============================================
// ROUTER CREATION
// ============================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return { top: 0, behavior: 'smooth' };
  },
});

// ============================================
// NAVIGATION GUARDS
// ============================================

// ... guards as defined above

// ============================================
// HELPER FUNCTIONS
// ============================================

// ... helper functions as defined above

// ============================================
// EXPORTS
// ============================================

export default router;
export { routes, getNavigationItems, useNavigation, handlePostLoginRedirect };
export type { NavigationItem };
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
- **Framework:** Vue Router 4.x
- **Maximum cyclomatic complexity:** 10
- **Maximum function length:** 30 lines

## Mandatory best practices:
- **Lazy Loading:** All view components lazy-loaded
- **Type Safety:** Extend RouteMeta interface for TypeScript
- **Guard Order:** Authentication → Role → Resource access
- **Error Handling:** Graceful handling of navigation failures
- **SEO:** Document title updates on navigation
- **UX:** Preserve scroll position, handle redirects

## Router Configuration:
- Use Web History mode (HTML5 History API)
- Configure base URL from environment
- Implement scroll behavior for better UX
- Handle dynamic import errors (chunk loading)

## Security Considerations:
- Never expose sensitive route information
- Validate all route params server-side
- Handle session expiration gracefully
- Clear auth state on logout before redirect

---

# DELIVERABLES

1. **Complete source code** for router/index.ts

2. **Route Definitions:**
   - All application routes with meta
   - Lazy-loaded view components
   - Props configuration for dynamic routes
   - Nested routes if applicable

3. **Navigation Guards:**
   - Global beforeEach guard
   - Authentication check
   - Role-based access control
   - Project permission check
   - Guest-only route handling

4. **Helper Functions:**
   - getNavigationItems() for menu
   - useNavigation() composable
   - handlePostLoginRedirect()

5. **Type Definitions:**
   - Extended RouteMeta interface
   - NavigationItem interface
   - Proper TypeScript declarations

6. **Edge cases to handle:**
   - Uninitialized auth state
   - Session expiration mid-navigation
   - Invalid project IDs
   - Chunk loading failures
   - Deep linking with authentication

---

# OUTPUT FORMAT

Provide the complete implementation:

```typescript
// src/presentation/router/index.ts
[Complete code here]
```

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
