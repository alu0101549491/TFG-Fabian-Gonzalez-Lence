/**
 * @module presentation/composables/use-auth
 * @description Composable for authentication-related logic.
 * Provides reactive authentication state and methods to Vue components.
 * @category Presentation
 */

import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '../stores/auth.store';
import {UserRole} from '../../domain/enumerations/user-role';

/**
 * Composable that wraps the auth store and provides
 * authentication utilities to components.
 */
export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isAdmin = computed(() => authStore.isAdmin);
  const isClient = computed(() => authStore.isClient);
  const isSpecialUser = computed(() => authStore.isSpecialUser);
  const currentUser = computed(() => authStore.user);
  const currentUserId = computed(() => authStore.currentUserId);
  const currentUserRole = computed(() => authStore.currentUserRole);
  const isLoading = computed(() => authStore.isLoading);
  const error = computed(() => authStore.error);

  /**
   * Attempts to log in with the provided credentials.
   * @param username - The user's username.
   * @param password - The user's password.
   */
  async function login(username: string, password: string): Promise<void> {
    await authStore.login(username, password);
    
    // Redirect to intended route or dashboard
    const intendedRoute = sessionStorage.getItem('intended_route');
    if (intendedRoute) {
      sessionStorage.removeItem('intended_route');
      await router.push(intendedRoute);
    } else {
      await router.push({name: 'Dashboard'});
    }
  }

  /**
   * Logs out the current user.
   */
  async function logout(): Promise<void> {
    await authStore.logout();
    await router.push({name: 'Login'});
  }

  /**
   * Check if user has specific permission.
   */
  function hasPermission(permission: string): boolean {
    if (isAdmin.value) return true;
    // Add more complex permission logic here
    return false;
  }

  /**
   * Check if  user can create projects.
   */
  const canCreateProject = computed(() => isAdmin.value);

  /**
   * Check if user can edit a project.
   */
  const canEditProject = computed(() => isAdmin.value);

  /**
   * Check if user can finalize a project.
   */
  const canFinalizeProject = computed(() => isAdmin.value);

  /**
   * Check if user can create tasks.
   */
  const canCreateTask = computed(() => isAdmin.value || isClient.value);

  /**
   * Check if user can access backup.
   */
  const canAccessBackup = computed(() => isAdmin.value);

  return {
    // State
    isAuthenticated,
    isAdmin,
    isClient,
    isSpecialUser,
    currentUser,
    currentUserId,
    currentUserRole,
    isLoading,
    error,
    // Actions
    login,
    logout,
    hasPermission,
    // Permissions
    canCreateProject,
    canEditProject,
    canFinalizeProject,
    canCreateTask,
    canAccessBackup,
  };
}
