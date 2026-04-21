/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/presentation/guards/auth.guard.ts
 * @desc Route guard that protects routes requiring authentication (NFR12).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {inject} from '@angular/core';
import {type CanActivateFn, Router} from '@angular/router';
import {AuthStateService} from '../services/auth-state.service';

/**
 * Functional route guard that checks whether the user is authenticated.
 * Redirects to /login if the user does not have a valid session.
 */
export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  // Require both a valid token and an in-memory current user to consider the
  // session authenticated. This prevents routes from activating when a token
  // is present but the application has not hydrated the user (e.g. during
  // teardown/rehydration races or service-worker-driven re-inserts).
  if (authState.isAuthenticated() && authState.getCurrentUser()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
