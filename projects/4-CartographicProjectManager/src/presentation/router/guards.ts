import type {
  NavigationGuardNext,
  RouteLocationNormalized,
} from 'vue-router';
import {useAuthStore} from '../stores/authStore';

/**
 * Authentication guard for protected routes
 */
export const authGuard = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
): void => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated) {
    next();
  } else {
    next({name: 'Login'});
  }
};
