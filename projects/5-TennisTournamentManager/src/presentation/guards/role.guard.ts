/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/presentation/guards/role.guard.ts
 * @desc Route guard that enforces role-based access control (NFR13).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {inject} from '@angular/core';
import {type CanActivateFn, type ActivatedRouteSnapshot, Router} from '@angular/router';
import {AuthStateService} from '../services/auth-state.service';

/**
 * Functional route guard that checks whether the authenticated user
 * has one of the required roles specified in the route data.
 *
 * Usage in route config:
 * ```typescript
 * {

 *   canActivate: [roleGuard],
 *   data: { roles: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN'] }
 * }
 * ```
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const currentUser = authState.getCurrentUser();
  if (currentUser && requiredRoles.includes(currentUser.role)) {
    return true;
  }

  return router.createUrlTree(['/tournaments']);
};
