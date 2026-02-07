import {useAuthStore} from '../stores/authStore';

/**
 * Authentication composable
 * Provides authentication utilities for components
 */
export function useAuth() {
  const authStore = useAuthStore();

  const login = async (
      username: string,
      password: string,
  ): Promise<void> => {
    await authStore.login(username, password);
  };

  const logout = async (): Promise<void> => {
    await authStore.logout();
  };

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    login,
    logout,
  };
}
