/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 20, 2026
 * @file src/presentation/stores/user.store.ts
 * @desc Pinia store for user management state
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://pinia.vuejs.org}
 */

import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {
  UserDataDto,
  UserSummaryDto,
  UserFilterDto,
  CreateUserDto,
  UpdateUserDto,
} from '../../application/dto';
import {UserRole} from '../../domain/enumerations/user-role';
import {UserRepository} from '../../infrastructure/repositories/user.repository';

/**
 * User management store using Composition API.
 * Manages user list, creation, update, and deletion operations.
 */
export const useUserStore = defineStore('user', () => {
  const userRepository = new UserRepository();
  const isDev = import.meta.env.DEV;

  // State
  const users = ref<UserSummaryDto[]>([]);
  const currentUser = ref<UserDataDto | null>(null);
  const filters = ref<UserFilterDto>({});
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const userCount = computed(() => users.value.length);

  const administrators = computed(() =>
    users.value.filter((u) => u.role === UserRole.ADMINISTRATOR),
  );

  const clients = computed(() =>
    users.value.filter((u) => u.role === UserRole.CLIENT),
  );

  const specialUsers = computed(() =>
    users.value.filter((u) => u.role === UserRole.SPECIAL_USER),
  );

  const activeUsers = computed(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return users.value.filter(
      (u) => u.lastLogin && new Date(u.lastLogin) > thirtyDaysAgo,
    );
  });

  const filteredUsers = computed(() => {
    let result = users.value;

    if (filters.value.role) {
      result = result.filter((u) => u.role === filters.value.role);
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search),
      );
    }

    if (filters.value.activeOnly) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(
        (u) => u.lastLogin && new Date(u.lastLogin) > thirtyDaysAgo,
      );
    }

    return result;
  });

  // Actions

  /**
   * Fetch all users from the backend
   *
   * @param filterOptions - Optional filter criteria
   */
  async function fetchUsers(filterOptions?: UserFilterDto): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      users.value = await userRepository.getAllUsers(filterOptions);
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users';
      if (isDev) {
        console.error('Error fetching users:', err);
      }
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch single user by ID
   *
   * @param id - User ID
   */
  async function fetchUserById(id: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      currentUser.value = await userRepository.getUserById(id);
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user';
      if (isDev) {
        console.error('Error fetching user:', err);
      }
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create new user
   *
   * @param userData - User creation data
   * @returns Success status
   */
  async function createUser(userData: CreateUserDto): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await userRepository.createUser(userData);

      if (result.success && result.user) {
        // Add to local list
        users.value.push({
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role,
          phone: result.user.phone,
          lastLogin: result.user.lastLogin,
        });
        return true;
      } else {
        error.value = result.error || 'Failed to create user';
        return false;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create user';
      if (isDev) {
        console.error('Error creating user:', err);
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update existing user
   *
   * @param id - User ID
   * @param userData - Updated user data
   * @returns Success status
   */
  async function updateUser(id: string, userData: UpdateUserDto): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await userRepository.updateUser(id, userData);

      if (result.success && result.user) {
        // Update in local list
        const index = users.value.findIndex((u) => u.id === id);
        if (index !== -1) {
          users.value[index] = {
            id: result.user.id,
            username: result.user.username,
            email: result.user.email,
            role: result.user.role,
            phone: result.user.phone,
            lastLogin: result.user.lastLogin,
          };
        }

        // Update current user if it's the same
        if (currentUser.value?.id === id) {
          currentUser.value = result.user;
        }

        return true;
      } else {
        error.value = result.error || 'Failed to update user';
        return false;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update user';
      if (isDev) {
        console.error('Error updating user:', err);
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete user by ID
   *
   * @param id - User ID
   * @returns Success status
   */
  async function deleteUser(id: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await userRepository.deleteUser(id);

      if (result.success) {
        // Remove from local list
        users.value = users.value.filter((u) => u.id !== id);

        // Clear current user if it's the deleted one
        if (currentUser.value?.id === id) {
          currentUser.value = null;
        }

        return true;
      } else {
        error.value = result.error || 'Failed to delete user';
        return false;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete user';
      if (isDev) {
        console.error('Error deleting user:', err);
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Set filter criteria
   *
   * @param filterOptions - Filter options
   */
  function setFilters(filterOptions: UserFilterDto): void {
    filters.value = filterOptions;
  }

  /**
   * Clear all filters
   */
  function clearFilters(): void {
    filters.value = {};
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    error.value = null;
  }

  /**
   * Reset store to initial state
   */
  function $reset(): void {
    users.value = [];
    currentUser.value = null;
    filters.value = {};
    isLoading.value = false;
    error.value = null;
  }

  return {
    // State
    users,
    currentUser,
    filters,
    isLoading,
    error,

    // Getters
    userCount,
    administrators,
    clients,
    specialUsers,
    activeUsers,
    filteredUsers,

    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    setFilters,
    clearFilters,
    clearError,
    $reset,
  };
});
