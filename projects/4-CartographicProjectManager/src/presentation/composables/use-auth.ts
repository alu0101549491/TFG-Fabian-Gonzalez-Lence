/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/composables/use-auth.ts
 * @desc Composable for authentication logic with permissions and role checks
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://vuejs.org/guide/reusability/composables.html}
 */

import {computed, type ComputedRef} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '../stores/auth.store';
import type {UserDto, LoginCredentialsDto, RegisterCredentialsDto} from '../../application/dto';
import {UserRole} from '../../domain/enumerations/user-role';
import {AuthErrorCode} from '../../application/dto/auth-result.dto';
import {ROUTES} from '../../shared/constants';

/**
 * Result of login operation
 */
export interface LoginResult {
  /** Whether login was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Error code if failed */
  errorCode?: AuthErrorCode;
}

/**
 * Result of registration operation
 */
export interface RegisterResult {
  /** Whether registration was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Error code if failed */
  errorCode?: AuthErrorCode;
}

/**
 * Return interface for useAuth composable
 */
export interface UseAuthReturn {
  // Reactive State
  user: ComputedRef<UserDto | null>;
  isAuthenticated: ComputedRef<boolean>;
  isLoading: ComputedRef<boolean>;
  error: ComputedRef<string | null>;
  
  // User Info
  userId: ComputedRef<string | null>;
  username: ComputedRef<string>;
  userEmail: ComputedRef<string>;
  userRole: ComputedRef<UserRole | null>;
  
  // Role Checks
  isAdmin: ComputedRef<boolean>;
  isClient: ComputedRef<boolean>;
  isSpecialUser: ComputedRef<boolean>;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>;
  register: (credentials: RegisterCredentialsDto) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  
  // Permission Checks
  canCreateProject: ComputedRef<boolean>;
  canManageProjects: ComputedRef<boolean>;
  canExportData: ComputedRef<boolean>;
  canManageBackups: ComputedRef<boolean>;
  
  // Utilities
  clearError: () => void;
  requireAuth: () => boolean;
}

/**
 * Composable for authentication logic
 *
 * Provides reactive authentication state, login/logout operations,
 * role checks, and permission utilities for Vue components.
 *
 * @returns Authentication state and methods
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAuth } from '@/presentation/composables';
 * 
 * const { isAuthenticated, user, login, logout } = useAuth();
 * 
 * async function handleLogin() {
 *   const result = await login(email.value, password.value);
 *   if (!result.success) {
 *     console.error(result.error);
 *   }
 * }
 * </script>
 * ```
 */
export function useAuth(): UseAuthReturn {
  const store = useAuthStore();
  const router = useRouter();

  // Reactive State (computed from store)
  const user = computed(() => store.user);
  const isAuthenticated = computed(() => store.isAuthenticated);
  const isLoading = computed(() => store.isLoading);
  const error = computed(() => store.error);

  // User Info
  const userId = computed(() => store.userId);
  const username = computed(() => store.user?.username ?? '');
  const userEmail = computed(() => store.user?.email ?? '');
  const userRole = computed(() => store.user?.role ?? null);

  // Role Checks
  const isAdmin = computed(() => store.isAdmin);
  const isClient = computed(() => store.isClient);
  const isSpecialUser = computed(() => store.isSpecialUser);

  /**
   * Attempts to log in with the provided credentials
   *
   * @param email - User's email address
   * @param password - User's password
   * @param rememberMe - Whether to extend session duration
   * @returns Login result with success status and error if failed
   */
  async function login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<LoginResult> {
    const credentials: LoginCredentialsDto = {
      email,
      password,
      rememberMe,
    };

    const success = await store.login(credentials);

    if (success) {
      // Check for redirect in query parameters (from router guard)
      const currentRoute = router.currentRoute.value;
      const redirect = currentRoute.query.redirect as string;
      
      if (redirect && redirect !== '/login') {
        await router.push(redirect);
      } else {
        await router.push(ROUTES.DASHBOARD);
      }

      return {success: true};
    }

    return {
      success: false,
      error: store.error ?? 'Login failed',
      errorCode: store.errorCode ?? undefined,
    };
  }

  /**
   * Logs out the current user and redirects to login page
   */
  async function logout(): Promise<void> {
    await store.logout();
    await router.push(ROUTES.LOGIN);
  }

  /**
   * Registers a new user account
   *
   * @param credentials - Registration credentials
   * @returns Registration result with success status and error if failed
   */
  async function register(credentials: RegisterCredentialsDto): Promise<RegisterResult> {
    const success = await store.register(credentials);

    if (success) {
      // Redirect to dashboard after successful registration
      await router.push(ROUTES.DASHBOARD);
      return {success: true};
    }

    return {
      success: false,
      error: store.error ?? 'Registration failed',
      errorCode: store.errorCode ?? undefined,
    };
  }

  /**
   * Refreshes the current session using refresh token
   *
   * @returns True if refresh successful, false otherwise
   */
  async function refreshSession(): Promise<boolean> {
    return store.refreshSession();
  }

  // Permission Checks
  const canCreateProject = computed(() => isAdmin.value || isSpecialUser.value);
  const canManageProjects = computed(() => isAdmin.value);
  const canExportData = computed(() => isAdmin.value);
  const canManageBackups = computed(() => isAdmin.value);

  /**
   * Clears error state
   */
  function clearError(): void {
    store.clearError();
  }

  /**
   * Checks if user is authenticated, redirects to login if not
   *
   * @returns True if authenticated, false otherwise
   */
  function requireAuth(): boolean {
    if (!isAuthenticated.value) {
      // Save intended route for redirect after login
      sessionStorage.setItem('intended_route', router.currentRoute.value.fullPath);
      router.push(ROUTES.LOGIN);
      return false;
    }
    return true;
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // User Info
    userId,
    username,
    userEmail,
    userRole,

    // Role Checks
    isAdmin,
    isClient,
    isSpecialUser,

    // Actions
    login,
    register,
    logout,
    refreshSession,

    // Permission Checks
    canCreateProject,
    canManageProjects,
    canExportData,
    canManageBackups,

    // Utilities
    clearError,
    requireAuth,
  };
}
