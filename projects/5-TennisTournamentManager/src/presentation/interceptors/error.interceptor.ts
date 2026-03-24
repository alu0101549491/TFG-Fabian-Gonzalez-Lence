/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file presentation/interceptors/error.interceptor.ts
 * @desc HTTP interceptor that handles API error responses globally.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {type HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {JWT_STORAGE_KEY} from '@shared/constants';

/**
 * Functional HTTP interceptor that handles common HTTP error codes:
 * - 401 Unauthorized: redirects to login (only on protected pages)
 * - 403 Forbidden: redirects to tournaments (only on protected pages)
 * - Public pages (tournaments, brackets, matches, standings, order-of-play) remain accessible
 * - Other errors: re-throws for component-level handling
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // Check if we're on a public page that should remain accessible
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      const isPublicPage = 
        currentPath.endsWith('/home') ||
        currentPath === '/' ||
        currentPath === '/5-TennisTournamentManager/' ||
        currentPath.includes('/tournaments') ||
        currentPath.includes('/brackets') ||
        currentPath.includes('/matches') ||
        currentPath.includes('/standings') ||
        currentPath.includes('/order-of-play');
      
      console.log('[Error Interceptor]', {
        status: error.status,
        url: req.url,
        currentPath,
        isAuthPage,
        isPublicPage,
        willRedirect: !isAuthPage && !isPublicPage
      });
      
      if (error.status === 401) {
        // If on a public page, clear invalid token but don't redirect
        if (isPublicPage) {
          console.warn('[Error Interceptor] Clearing invalid token on public page');
          localStorage.removeItem(JWT_STORAGE_KEY);
        } else if (!isAuthPage) {
          // Only redirect to login if not on auth or public pages
          localStorage.removeItem(JWT_STORAGE_KEY);
          router.navigate(['/login']);
        }
      } else if (error.status === 403) {
        // Only redirect on 403 if not on public pages
        if (!isPublicPage && !isAuthPage) {
          router.navigate(['/tournaments']);
        }
      }
      
      return throwError(() => error);
    }),
  );
};
