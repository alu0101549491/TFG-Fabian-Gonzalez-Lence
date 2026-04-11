/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file application/services/session-inactivity.service.ts
 * @desc Service that implements the 30-minute session inactivity auto-logout (NFR12).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, NgZone, inject} from '@angular/core';
import {Router} from '@angular/router';

/** Inactivity timeout in milliseconds (30 minutes). */
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

/** Check interval in milliseconds (every 60 seconds). */
const CHECK_INTERVAL_MS = 60 * 1000;

/** localStorage key for the last activity timestamp. */
const LAST_ACTIVITY_KEY = 'ttm_last_activity';

/** localStorage key for the user auth token. */
const AUTH_TOKEN_KEY = 'ttm_token';

/** DOM events considered as user activity. */
const ACTIVITY_EVENTS: string[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

/**
 * Tracks user session inactivity and automatically logs out the user after 30 minutes
 * of no interaction with the application (NFR12).
 *
 * @remarks
 * - Tracks last activity via localStorage for cross-tab synchronization.
 * - Listens to standard DOM events to reset the inactivity timer.
 * - Performs a periodic check every 60 seconds.
 * - When inactive for >= 30 minutes and the user is authenticated, clears the token
 *   and redirects to the login page.
 * - Must be started once at application bootstrap via `AppComponent.ngOnInit()`.
 */
@Injectable({providedIn: 'root'})
export class SessionInactivityService {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  /** Reference to the periodic check interval. */
  private checkIntervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Starts tracking inactivity.
   * Registers DOM listeners and starts the periodic check loop.
   * Safe to call multiple times (idempotent).
   */
  public start(): void {
    if (this.checkIntervalId !== null) return; // Already running

    // Initialize last activity timestamp
    this.recordActivity();

    // Listen to DOM events outside Angular zone to avoid unnecessary change detection
    this.ngZone.runOutsideAngular(() => {
      for (const event of ACTIVITY_EVENTS) {
        document.addEventListener(event, this.onActivity, {passive: true});
      }

      // Start periodic inactivity check
      this.checkIntervalId = setInterval(() => this.checkInactivity(), CHECK_INTERVAL_MS);
    });
  }

  /**
   * Stops inactivity tracking and removes all DOM listeners.
   * Call this on logout to avoid redundant checks when the user is already logged out.
   */
  public stop(): void {
    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    for (const event of ACTIVITY_EVENTS) {
      document.removeEventListener(event, this.onActivity);
    }
  }

  /**
   * Records the current timestamp as the last known user activity.
   * Called on each tracked DOM event.
   */
  private readonly onActivity = (): void => {
    this.recordActivity();
  };

  /**
   * Writes the current Unix timestamp to localStorage.
   */
  private recordActivity(): void {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }

  /**
   * Checks whether the user has been inactive for more than INACTIVITY_TIMEOUT_MS.
   * If so, and if the user is authenticated, triggers automatic logout.
   */
  private checkInactivity(): void {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return; // User is not logged in — nothing to do

    const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) ?? '0', 10);
    const elapsed = Date.now() - lastActivity;

    if (elapsed >= INACTIVITY_TIMEOUT_MS) {
      console.warn('[SessionInactivity] User inactive for 30+ minutes — logging out automatically.');
      this.ngZone.run(() => this.logoutAndRedirect());
    }
  }

  /**
   * Clears authentication state and navigates to the login page.
   */
  private logoutAndRedirect(): void {
    this.stop();

    // Clear auth data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    sessionStorage.clear();

    // Redirect to login with a message
    this.router.navigate(['/auth/login'], {
      queryParams: {reason: 'session_expired'},
    });
  }
}
