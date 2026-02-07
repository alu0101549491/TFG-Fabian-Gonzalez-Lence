/**
 * @module presentation/stores/auth-store
 * @description Pinia store for authentication state management.
 * Manages user session, login/logout flows, and token lifecycle.
 * @category Presentation
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {User} from '../../domain/entities/user';
import {UserRole} from '../../domain/enumerations/user-role';

/**
 * Authentication store.
 * Uses the Composition API (setup) syntax for Pinia stores.
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const failedAttempts = ref(0);
  const isLocked = ref(false);

  // Getters
  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const isAdmin = computed(() => user.value?.getRole() === UserRole.ADMINISTRATOR);
  const isClient = computed(() => user.value?.getRole() === UserRole.CLIENT);
  const isSpecialUser = computed(() => user.value?.getRole() === UserRole.SPECIAL_USER);
  const currentUserId = computed(() => user.value?.getId() ?? null);
  const currentUserRole = computed(() => user.value?.getRole() ?? null);

  // Actions

  /**
   * Authenticates the user with credentials.
   * @param username - The user's username or email.
   * @param password - The user's password (currently unused in mock).
   */
  async function login(username: string, _password: string): Promise<void> {
    if (isLocked.value) {
      throw new Error('Account is locked after 5 failed attempts. Please try again later.');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Mock authentication - Replace with actual service call
      // const authService = new AuthenticationService();
      // const result = await authService.login({username, password});
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock success
      const mockToken = `mock_token_${Date.now()}`;
      const mockUser: any = {
        getId: () => '1',
        getUsername: () => username,
        getEmail: () => `${username}@example.com`,
        getRole: () => UserRole.ADMINISTRATOR,
        getCreatedAt: () => new Date(),
        getLastLogin: () => new Date(),
      };

      token.value = mockToken;
      user.value = mockUser;
      failedAttempts.value = 0;
      
      // Store token in localStorage
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify({
        id: mockUser.getId(),
        username: mockUser.getUsername(),
        email: mockUser.getEmail(),
        role: mockUser.getRole(),
      }));
      
    } catch (err: any) {
      failedAttempts.value++;
      if (failedAttempts.value >= 5) {
        isLocked.value = true;
        error.value = 'Account locked after 5 failed attempts.';
      } else {
        error.value = err.message || 'Invalid credentials';
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logs out the current user and clears session data.
   */
  async function logout(): Promise<void> {
    isLoading.value = true;
    try {
      // Call logout service
      // await authService.logout();
      
      // Clear state
      token.value = null;
      user.value = null;
      error.value = null;
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Checks and refreshes the current session.
   */
  async function checkSession(): Promise<boolean> {
    const storedToken = localStorage.getItem('auth_token');
    const storedUserData = localStorage.getItem('user_data');
    
    if (!storedToken || !storedUserData) {
      return false;
    }

    try {
      token.value = storedToken;
      const userData = JSON.parse(storedUserData);
      
      // Mock user object reconstruction
      user.value = {
        getId: () => userData.id,
        getUsername: () => userData.username,
        getEmail: () => userData.email,
        getRole: () => userData.role,
        getCreatedAt: () => new Date(),
        getLastLogin: () => new Date(),
      } as any;
      
      return true;
    } catch (err) {
      console.error('Session check error:', err);
      await logout();
      return false;
    }
  }

  /**
   * Update last login time for current user.
   */
  function updateLastLogin(): void {
    if (user.value) {
      // In a real implementation, this would call an API
      console.log('Last login updated');
    }
  }

  /**
   * Clear error message.
   */
  function clearError(): void {
    error.value = null;
  }

  /**
   * Unlock account (admin function or after timeout).
   */
  function unlockAccount(): void {
    isLocked.value = false;
    failedAttempts.value = 0;
  }

  return {
    // State
    token,
    user,
    isLoading,
    error,
    failedAttempts,
    isLocked,
    // Getters
    isAuthenticated,
    isAdmin,
    isClient,
    isSpecialUser,
    currentUserId,
    currentUserRole,
    // Actions
    login,
    logout,
    checkSession,
    updateLastLogin,
    clearError,
    unlockAccount,
  };
});
