/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file presentation/components/header/header.component.ts
 * @desc Application header component with navigation and notification bell.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Router} from '@angular/router';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {NotificationBellComponent} from '../notification-bell/notification-bell.component';
import {UserRole} from '@domain/enumerations/user-role';

/**
 * Header component with navigation, authentication status, and notification bell.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  /** Services */
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);

  /**
   * Checks if user is authenticated.
   *
   * @returns True if user is authenticated
   */
  public get isAuthenticated(): boolean {
    return this.authStateService.isAuthenticated();
  }

  /**
   * Checks if user is admin (SYSTEM_ADMIN or TOURNAMENT_ADMIN).
   *
   * @returns True if user has admin role
   */
  public get isAdmin(): boolean {
    const user = this.authStateService.getCurrentUser();
    return user?.role === UserRole.SYSTEM_ADMIN || user?.role === UserRole.TOURNAMENT_ADMIN;
  }

  /**
   * Gets the current user's username for display.
   *
   * @returns Username or empty string
   */
  public get username(): string {
    return this.authStateService.getCurrentUser()?.username ?? '';
  }

  /**
   * Gets the user's initials for avatar display.
   *
   * @returns User initials (first letter of username)
   */
  public get userInitials(): string {
    const name = this.username;
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  /**
   * Logs out the current user.
   */
  public logout(): void {
    this.authStateService.clearAuth();
    void this.router.navigate(['/login']);
  }
}
