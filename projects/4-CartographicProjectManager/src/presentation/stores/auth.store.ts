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

// Mock user database for development (module-level so it persists across login/register)
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@cartographic.com',
    password: 'REDACTED',
    role: UserRole.ADMINISTRATOR,
    phone: '+34 123 456 789',
    whatsappEnabled: true,
  },
  {
    id: '2',
    username: 'client',
    email: 'client@example.com',
    password: 'REDACTED',
    role: UserRole.CLIENT,
    phone: '+34 987 654 321',
    whatsappEnabled: false,
  },
  {
    id: '3',
    username: 'special',
    email: 'special@cartographic.com',
    password: 'REDACTED',
    role: UserRole.SPECIAL_USER,
    phone: null,
    whatsappEnabled: false,
  },
];

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
      // TODO: Replace with actual service call
      // const result = await authService.login(credentials);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate credentials
      const mockUser = MOCK_USERS.find(u => u.email === credentials.email);
      
      if (!mockUser) {
        error.value = 'Invalid email or password';
        errorCode.value = AuthErrorCode.INVALID_CREDENTIALS;
        return false;
      }
      
      if (mockUser.password !== credentials.password) {
        error.value = 'Invalid email or password';
        errorCode.value = AuthErrorCode.INVALID_CREDENTIALS;
        return false;
      }
      
      // Successful authentication
      const mockResult: AuthResultDto = {
        success: true,
        accessToken: `access_${Date.now()}`,
        refreshToken: `refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + AUTH.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
          phone: mockUser.phone,
          whatsappEnabled: mockUser.whatsappEnabled,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        error: null,
        errorCode: null,
      };

      if (mockResult.success && mockResult.user && mockResult.accessToken) {
        user.value = mockResult.user;
        accessToken.value = mockResult.accessToken;
        refreshToken.value = mockResult.refreshToken;
        expiresAt.value = mockResult.expiresAt;
        
        saveToStorage();
        return true;
      } else {
        error.value = mockResult.error ?? 'Login failed';
        return false;
      }
    } catch (err: any) {
      error.value = err.message || 'An unexpected error occurred';
      errorCode.value = err.code || null;
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validation
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

      // Check if email already exists
      if (MOCK_USERS.some(u => u.email === credentials.email)) {
        error.value = 'Email already registered';
        errorCode.value = AuthErrorCode.EMAIL_ALREADY_EXISTS;
        return false;
      }

      // Check if username already exists
      if (MOCK_USERS.some(u => u.username === credentials.username)) {
        error.value = 'Username already taken';
        errorCode.value = AuthErrorCode.USERNAME_ALREADY_EXISTS;
        return false;
      }

      // Create new user
      const newUser = {
        id: `${MOCK_USERS.length + 1}`,
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        role: UserRole.CLIENT, // New users default to CLIENT role
        phone: credentials.phone || null,
        whatsappEnabled: credentials.whatsappEnabled || false,
      };

      MOCK_USERS.push(newUser);

      // Auto-login after successful registration
      const mockResult: AuthResultDto = {
        success: true,
        accessToken: `access_${Date.now()}`,
        refreshToken: `refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + AUTH.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          whatsappEnabled: newUser.whatsappEnabled,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        error: null,
        errorCode: null,
      };

      user.value = mockResult.user;
      accessToken.value = mockResult.accessToken;
      refreshToken.value = mockResult.refreshToken;
      expiresAt.value = mockResult.expiresAt;

      saveToStorage();
      return true;
    } catch (err: any) {
      error.value = err.message || 'Registration failed';
      errorCode.value = err.code || null;
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
      if (userId.value) {
        // TODO: Call logout service
        // await authService.logout(userId.value);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      clearAuth();
    } catch (err: any) {
      console.error('Logout error:', err);
      // Clear anyway
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
      // TODO: Call refresh service
      // const result = await authService.refreshSession(refreshToken.value);
      
      // Mock refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockResult: AuthResultDto = {
        success: true,
        accessToken: `access_${Date.now()}`,
        refreshToken: refreshToken.value,
        expiresAt: new Date(Date.now() + AUTH.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
        user: user.value,
        error: null,
        errorCode: null,
      };
      
      if (mockResult.success && mockResult.accessToken) {
        accessToken.value = mockResult.accessToken;
        expiresAt.value = mockResult.expiresAt;
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
      // TODO: Call validation service
      // const session = await authService.validateSession(accessToken.value);
      // return session.isValid;
      
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
