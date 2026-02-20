/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/stores/auth.store.ts
 * @desc Pinia store for authentication state management with session persistence
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://pinia.vuejs.org}
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {UserDto, LoginCredentialsDto, RegisterCredentialsDto, AuthResultDto} from '../../application/dto';
import {UserRole} from '../../domain/enumerations/user-role';
import {AuthErrorCode} from '../../application/dto/auth-result.dto';
import {STORAGE_KEYS, AUTH} from '../../shared/constants';
import {AuthRepository} from '../../infrastructure/repositories/auth.repository';

// Initialize authentication repository
const authRepository = new AuthRepository();

/**
 * Authentication store using Composition API.
 * Manages user session, tokens, and authentication state with localStorage persistence.
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserDto | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const expiresAt = ref<Date | null>(null);
  const isLoading = ref(false);
  const isInitialized = ref(false);
  const error = ref<string | null>(null);
  const errorCode = ref<AuthErrorCode | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const userId = computed(() => user.value?.id ?? null);
  const username = computed(() => user.value?.username ?? '');
  const userEmail = computed(() => user.value?.email ?? '');
  const userRole = computed(() => user.value?.role ?? null);
  const isAdmin = computed(() => user.value?.role === UserRole.ADMINISTRATOR);
  const isClient = computed(() => user.value?.role === UserRole.CLIENT);
  const isSpecialUser = computed(() => user.value?.role === UserRole.SPECIAL_USER);
  const isSessionValid = computed(() => {
    if (!expiresAt.value) return false;
    return new Date() < new Date(expiresAt.value);
  });
  const tokenExpiresIn = computed(() => {
    if (!expiresAt.value) return 0;
    const diff = new Date(expiresAt.value).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 60000)); // Minutes
  });

  // Actions

  /**
   * Authenticates user with credentials
   *
   * @param credentials - Login credentials (username/email and password)
   * @returns True if login successful, false otherwise
   *
   * @example
   * ```typescript
   * const success = await authStore.login({
   *   usernameOrEmail: 'admin',
   *   password: 'password123'
   * });
   * ```
   */
  async function login(credentials: LoginCredentialsDto): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    errorCode.value = null;

    try {
      const response = await authRepository.login(credentials);
      
      if (response.success && response.data) {
        // Map backend response to UserDto
        user.value = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          role: response.data.user.role,
          phone: response.data.user.phone,
          whatsappEnabled: response.data.user.whatsappEnabled,
          createdAt: new Date(response.data.user.createdAt),
          lastLogin: response.data.user.lastLogin ? new Date(response.data.user.lastLogin) : null,
        };
        
        accessToken.value = response.data.accessToken;
        refreshToken.value = response.data.refreshToken;
        
        // Calculate expiration (JWT tokens typically expire in 7 days for access token)
        expiresAt.value = new Date(Date.now() + AUTH.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        
        saveToStorage();
        return true;
      } else {
        error.value = response.message || 'Login failed';
        errorCode.value = AuthErrorCode.INVALID_CREDENTIALS;
        return false;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        error.value = 'Invalid email or password';
        errorCode.value = AuthErrorCode.INVALID_CREDENTIALS;
      } else if (err.response?.status === 403) {
        error.value = 'Account is locked or inactive';
        errorCode.value = AuthErrorCode.ACCOUNT_LOCKED;
      } else {
        error.value = err.response?.data?.message || err.message || 'An unexpected error occurred';
        errorCode.value = err.code || null;
      }
      
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Registers a new user account
   *
   * @param credentials - Registration credentials
   * @returns True if registration successful, false otherwise
   */
  async function register(credentials: RegisterCredentialsDto): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    errorCode.value = null;

    try {
      // Client-side validation
      if (credentials.password !== credentials.confirmPassword) {
        error.value = 'Passwords do not match';
        errorCode.value = AuthErrorCode.INVALID_PASSWORD;
        return false;
      }

      if (credentials.password.length < AUTH.PASSWORD_MIN_LENGTH) {
        error.value = `Password must be at least ${AUTH.PASSWORD_MIN_LENGTH} characters`;
        errorCode.value = AuthErrorCode.INVALID_PASSWORD;
        return false;
      }

      const response = await authRepository.register(credentials);
      
      if (response.success && response.data) {
        // Auto-login after successful registration
        user.value = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          role: response.data.user.role,
          phone: response.data.user.phone,
          whatsappEnabled: response.data.user.whatsappEnabled,
          createdAt: new Date(response.data.user.createdAt),
          lastLogin: response.data.user.lastLogin ? new Date(response.data.user.lastLogin) : null,
        };
        
        accessToken.value = response.data.accessToken;
        refreshToken.value = response.data.refreshToken;
        expiresAt.value = new Date(Date.now() + AUTH.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

        saveToStorage();
        console.log('✅ Registration successful, tokens saved to storage');
        return true;
      } else {
        error.value = response.message || 'Registration failed';
        console.error('❌ Registration failed:', response.message);
        return false;
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.response?.status === 409) {
        const message = err.response?.data?.message || '';
        if (message.toLowerCase().includes('email')) {
          error.value = 'Email already registered';
          errorCode.value = AuthErrorCode.EMAIL_ALREADY_EXISTS;
        } else if (message.toLowerCase().includes('username')) {
          error.value = 'Username already taken';
          errorCode.value = AuthErrorCode.USERNAME_ALREADY_EXISTS;
        } else {
          error.value = message;
        }
      } else if (err.response?.status === 400) {
        error.value = err.response?.data?.message || 'Invalid registration data';
        errorCode.value = AuthErrorCode.INVALID_PASSWORD;
      } else {
        error.value = err.response?.data?.message || err.message || 'Registration failed';
      }
      
      errorCode.value = errorCode.value || err.code || null;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logs out current user and clears all session data
   */
  async function logout(): Promise<void> {
    isLoading.value = true;
    
    try {
      if (accessToken.value) {
        await authRepository.logout(accessToken.value);
      }
      
      clearAuth();
    } catch (err: any) {
      console.error('Logout error:', err);
      // Clear anyway even if API call fails
      clearAuth();
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Refreshes the access token using refresh token
   */
  async function refreshSession(): Promise<boolean> {
    if (!refreshToken.value) return false;
    
    try {
      const response = await authRepository.refreshToken(refreshToken.value);
      
      if (response.success && response.data) {
        accessToken.value = response.data.accessToken;
        refreshToken.value = response.data.refreshToken;
        expiresAt.value = new Date(Date.now() + AUTH.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        saveToStorage();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Session refresh error:', err);
      return false;
    }
  }

  /**
   * Validates current session with backend
   */
  async function validateSession(): Promise<boolean> {
    if (!accessToken.value) return false;
    
    try {
      // For now, just check expiration locally
      // In the future, you could add an API endpoint to validate the token
      return isSessionValid.value;
    } catch (err) {
      return false;
    }
  }

  /**
   * Initializes auth store on app start, loads from storage
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return;
    
    loadFromStorage();
    
    if (accessToken.value) {
      const valid = await validateSession();
      if (!valid) {
        clearAuth();
      }
    }
    
    isInitialized.value = true;
  }

  /**
   * Clears all authentication state
   */
  function clearAuth(): void {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    expiresAt.value = null;
    error.value = null;
    errorCode.value = null;
    clearStorage();
  }

  /**
   * Saves auth state to localStorage
   */
  function saveToStorage(): void {
    try {
      if (accessToken.value) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken.value);
      }
      if (refreshToken.value) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken.value);
      }
      if (user.value) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user.value));
      }
    } catch (err) {
      console.error('Failed to save to storage:', err);
    }
  }

  /**
   * Loads auth state from localStorage
   */
  function loadFromStorage(): void {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (storedToken && storedUser) {
        accessToken.value = storedToken;
        refreshToken.value = storedRefresh;
        user.value = JSON.parse(storedUser);
        
        // Estimate expiration (will be validated)
        const expiryMs = AUTH.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
        expiresAt.value = new Date(Date.now() + expiryMs);
      }
    } catch (err) {
      console.error('Failed to load from storage:', err);
      clearStorage();
    }
  }

  /**
   * Clears all auth data from localStorage
   */
  function clearStorage(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Sets error state
   */
  function setError(message: string, code?: AuthErrorCode): void {
    error.value = message;
    errorCode.value = code ?? null;
  }

  /**
   * Clears error state
   */
  function clearError(): void {
    error.value = null;
    errorCode.value = null;
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    expiresAt,
    isLoading,
    isInitialized,
    error,
    errorCode,
    
    // Getters
    isAuthenticated,
    userId,
    username,
    userEmail,
    userRole,
    isAdmin,
    isClient,
    isSpecialUser,
    isSessionValid,
    tokenExpiresIn,
    
    // Actions
    login,
    register,
    logout,
    refreshSession,
    validateSession,
    initialize,
    clearAuth,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    setError,
    clearError,
  };
});
