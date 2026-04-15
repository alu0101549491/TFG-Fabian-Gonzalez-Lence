/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file presentation/interceptors/auth.interceptor.ts
 * @desc HTTP interceptor that injects the JWT token into outgoing API requests (NFR12).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {type HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthStateService} from '../services/auth-state.service';

/**
 * Functional HTTP interceptor that attaches the JWT Bearer token
 * to the Authorization header of outgoing API requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const token = authState.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
