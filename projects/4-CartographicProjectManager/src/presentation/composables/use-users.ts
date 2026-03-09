/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 20, 2026
 * @file src/presentation/composables/use-users.ts
 * @desc Composable for user management operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://vuejs.org/guide/reusability/composables.html}
 */

import {computed, type ComputedRef} from 'vue';
import {useUserStore} from '../stores/user.store';
import {useAuth} from './use-auth';
import type {
  UserDataDto,
  UserSummaryDto,
  UserFilterDto,
  CreateUserDto,
  UpdateUserDto,
} from '../../application/dto';
import {UserRole} from '../../domain/enumerations/user-role';

/**
 * Result of user creation
 */
export interface CreateUserResult {
  /** Whether operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Result of user update
 */
export interface UpdateUserResult {
  /** Whether operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Result of user deletion
 */
export interface DeleteUserResult {
  /** Whether operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Return interface for useUsers composable
 */
export interface UseUsersReturn {
  // Lists
  users: ComputedRef<UserSummaryDto[]>;
  administrators: ComputedRef<UserSummaryDto[]>;
  clients: ComputedRef<UserSummaryDto[]>;
  specialUsers: ComputedRef<UserSummaryDto[]>;
  activeUsers: ComputedRef<UserSummaryDto[]>;
  filteredUsers: ComputedRef<UserSummaryDto[]>;

  // Current User
  currentUser: ComputedRef<UserDataDto | null>;

  // Stats
  userCount: ComputedRef<number>;
  administratorCount: ComputedRef<number>;
  clientCount: ComputedRef<number>;
  specialUserCount: ComputedRef<number>;

  // State
  isLoading: ComputedRef<boolean>;
  error: ComputedRef<string | null>;
  filters: ComputedRef<UserFilterDto>;

  // Permissions
  canManageUsers: ComputedRef<boolean>;
  canDeleteUsers: ComputedRef<boolean>;

  // Actions
  fetchUsers: (filters?: UserFilterDto) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (userData: CreateUserDto) => Promise<CreateUserResult>;
  updateUser: (id: string, userData: UpdateUserDto) => Promise<UpdateUserResult>;
  deleteUser: (id: string) => Promise<DeleteUserResult>;
  setFilters: (filters: UserFilterDto) => void;
  clearFilters: () => void;
  clearError: () => void;

  // Utilities
  getUserRoleLabel: (role: UserRole) => string;
  getUserRoleColor: (role: UserRole) => string;
  canEditUser: (userId: string) => boolean;
}

/**
 * User management composable.
 * Provides reactive user data, CRUD operations, and role-based permissions.
 *
 * @example
 * ```typescript
 * const {
 *   users,
 *   filteredUsers,
 *   canManageUsers,
 *   createUser,
 *   deleteUser,
 * } = useUsers();
 *
 * await fetchUsers();
 * if (canManageUsers.value) {
 *   await createUser({
 *     username: 'newuser',
 *     email: 'newuser@example.com',
 *     password: 'password123',
 *     role: UserRole.CLIENT,
 *   });
 * }
 * ```
 *
 * @returns User management state and operations
 */
export function useUsers(): UseUsersReturn {
  const userStore = useUserStore();
  const {isAdmin, userId} = useAuth();

  // State
  const users = computed(() => userStore.filteredUsers);
  const administrators = computed(() => userStore.administrators);
  const clients = computed(() => userStore.clients);
  const specialUsers = computed(() => userStore.specialUsers);
  const activeUsers = computed(() => userStore.activeUsers);
  const filteredUsers = computed(() => userStore.filteredUsers);
  const currentUser = computed(() => userStore.currentUser);
  const isLoading = computed(() => userStore.isLoading);
  const error = computed(() => userStore.error);
  const filters = computed(() => userStore.filters);

  // Stats
  const userCount = computed(() => userStore.userCount);
  const administratorCount = computed(() => administrators.value.length);
  const clientCount = computed(() => clients.value.length);
  const specialUserCount = computed(() => specialUsers.value.length);

  // Permissions (UX-only; backend remains the authorization source of truth)
  const canManageUsers = computed(() => isAdmin.value);
  const canDeleteUsers = computed(() => isAdmin.value);

  /**
   * Check if current user can edit specific user
   *
   * @param targetUserId - ID of user to edit
   * @returns True if can edit
   */
  function canEditUser(targetUserId: string): boolean {
    // Admins can edit anyone
    if (isAdmin.value) return true;

    // Users can edit themselves
    return userId.value === targetUserId;
  }

  /**
   * Fetch all users with optional filters
   *
   * @param filterOptions - Optional filter criteria
   */
  async function fetchUsers(filterOptions?: UserFilterDto): Promise<void> {
    await userStore.fetchUsers(filterOptions);
  }

  /**
   * Fetch single user by ID
   *
   * @param id - User ID
   */
  async function fetchUserById(id: string): Promise<void> {
    await userStore.fetchUserById(id);
  }

  /**
   * Create new user
   *
   * @param userData - User creation data
   * @returns Creation result
   */
  async function createUser(userData: CreateUserDto): Promise<CreateUserResult> {
    // UX-only guard: backend authorization must still enforce this.
    if (!canManageUsers.value) {
      return {
        success: false,
        error: 'Insufficient permissions to create users',
      };
    }

    const success = await userStore.createUser(userData);

    if (success) {
      return {success: true};
    } else {
      return {
        success: false,
        error: userStore.error || 'Failed to create user',
      };
    }
  }

  /**
   * Update existing user
   *
   * @param id - User ID
   * @param userData - Updated user data
   * @returns Update result
   */
  async function updateUser(
    id: string,
    userData: UpdateUserDto,
  ): Promise<UpdateUserResult> {
    // UX-only guard: backend authorization must still enforce this.
    if (!canEditUser(id)) {
      return {
        success: false,
        error: 'Insufficient permissions to update this user',
      };
    }

    const success = await userStore.updateUser(id, userData);

    if (success) {
      return {success: true};
    } else {
      return {
        success: false,
        error: userStore.error || 'Failed to update user',
      };
    }
  }

  /**
   * Delete user by ID
   *
   * @param id - User ID
   * @returns Deletion result
   */
  async function deleteUser(id: string): Promise<DeleteUserResult> {
    // UX-only guard: backend authorization must still enforce this.
    if (!canDeleteUsers.value) {
      return {
        success: false,
        error: 'Insufficient permissions to delete users',
      };
    }

    // Prevent deleting self
    if (id === userId.value) {
      return {
        success: false,
        error: 'Cannot delete your own account',
      };
    }

    const success = await userStore.deleteUser(id);

    if (success) {
      return {success: true};
    } else {
      return {
        success: false,
        error: userStore.error || 'Failed to delete user',
      };
    }
  }

  /**
   * Set filter criteria
   *
   * @param filterOptions - Filter options
   */
  function setFilters(filterOptions: UserFilterDto): void {
    userStore.setFilters(filterOptions);
  }

  /**
   * Clear all filters
   */
  function clearFilters(): void {
    userStore.clearFilters();
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    userStore.clearError();
  }

  /**
   * Get human-readable label for user role
   *
   * @param role - User role
   * @returns Display label
   */
  function getUserRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMINISTRATOR]: 'Administrator',
      [UserRole.CLIENT]: 'Client',
      [UserRole.SPECIAL_USER]: 'Special User',
    };
    return labels[role] || role;
  }

  /**
   * Get color for user role badge
   *
   * @param role - User role
   * @returns CSS color class
   */
  function getUserRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      [UserRole.ADMINISTRATOR]: 'red',
      [UserRole.CLIENT]: 'blue',
      [UserRole.SPECIAL_USER]: 'green',
    };
    return colors[role] || 'gray';
  }

  return {
    // Lists
    users,
    administrators,
    clients,
    specialUsers,
    activeUsers,
    filteredUsers,

    // Current User
    currentUser,

    // Stats
    userCount,
    administratorCount,
    clientCount,
    specialUserCount,

    // State
    isLoading,
    error,
    filters,

    // Permissions
    canManageUsers,
    canDeleteUsers,

    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    setFilters,
    clearFilters,
    clearError,

    // Utilities
    getUserRoleLabel,
    getUserRoleColor,
    canEditUser,
  };
}
