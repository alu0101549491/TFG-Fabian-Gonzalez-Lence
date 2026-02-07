/**
 * @module presentation/composables/use-auth
 * @description Composable for authentication-related logic.
 * Provides reactive authentication state and methods to Vue components.
 * @category Presentation
 */

import {computed} from 'vue';
import {useAuthStore} from '../stores/auth.store';

/**
 * Composable that wraps the auth store and provides
 * authentication utilities to components.
 */
export function useAuth() {
  const authStore = useAuthStore();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isAdmin = computed(() => authStore.isAdmin);
  const currentUserId = computed(() => authStore.userId);
  const currentUserRole = computed(() => authStore.userRole);

  /**
   * Attempts to log in with the provided credentials.
   * @param username - The user's username.
   * @param password - The user's password.
   */
  async function login(username: string, password: string): Promise<void> {
    await authStore.login(username, password);
  }

  /**
   * Logs out the current user.
   */
  async function logout(): Promise<void> {
    await authStore.logout();
  }

  return {
    isAuthenticated,
    isAdmin,
    currentUserId,
    currentUserRole,
    login,
    logout,
  };
}
