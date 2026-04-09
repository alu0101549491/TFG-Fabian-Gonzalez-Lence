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

import {Component, inject, HostListener} from '@angular/core';
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
  template: `
<header class="app-header">
  <div class="header-container">
    <!-- Logo / Brand -->
    <div class="header-brand">
      <a routerLink="/home" class="brand-link">
        <span class="brand-icon">🎾</span>
        <span class="brand-text">Tennis TM</span>
      </a>
    </div>

    <!-- User Actions -->
    <div class="header-actions">
      @if (isAuthenticated) {
        <!-- Notification Bell -->
        <app-notification-bell></app-notification-bell>

        <!-- User Menu Dropdown -->
        <div class="dropdown">
          <button class="user-menu-toggle dropdown-toggle" type="button" (click)="toggleDropdown($event)">
            <span class="user-avatar">
              {{ userInitials }}
            </span>
            <span class="user-name">{{ username }}</span>
          </button>
          @if (isDropdownOpen) {
          <ul class="dropdown-menu">
            <li>
              <a routerLink="/profile" class="dropdown-item">
                👤 My Profile
              </a>
            </li>
            <li>
              <a routerLink="/privacy" class="dropdown-item">
                🔒 Privacy Settings
              </a>
            </li>
            <li>
              <a routerLink="/notifications" class="dropdown-item">
                🔔 Notifications
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <button class="dropdown-item" (click)="logout()">
                🚪 Logout
              </button>
            </li>
          </ul>
          }
        </div>
      } @else {
        <!-- Guest Actions -->
        <div class="header-auth-buttons">
          <a routerLink="/login" class="btn btn-ghost btn-sm">Login</a>
          <a routerLink="/register" class="btn btn-primary btn-sm">Sign Up</a>
        </div>
      }
    </div>
  </div>
</header>
  `,
  styles: [`
.app-header {
  background: var(--color-white);
  color: var(--color-gray-900);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-gray-300);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.header-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--color-gray-900);
  font-weight: 700;
  font-size: 1.25rem;
  transition: opacity var(--transition-fast);
}

.brand-link:hover {
  opacity: 0.9;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.brand-text {
  font-family: var(--font-family-heading);
  letter-spacing: -0.5px;
  font-weight: var(--font-weight-bold);
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-nav .nav {
  gap: var(--spacing-xs);
}

.header-nav .nav-link {
  color: var(--color-gray-700);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.header-nav .nav-link:hover {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
}

.header-nav .nav-link-active {
  background-color: var(--color-primary-light);
  color: var(--color-primary-dark);
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.user-menu-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--color-gray-100);
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-900);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;
}

.user-menu-toggle:hover {
  background-color: var(--color-gray-200);
  border-color: var(--color-gray-400);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-warning) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  min-width: 200px;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xs) 0;
  list-style: none;
  z-index: var(--z-index-dropdown);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-gray-700);
  text-decoration: none;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: 0.9375rem;
}

.dropdown-item:hover {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
  text-decoration: none;
}

.dropdown-divider {
  height: 0;
  margin: var(--spacing-xs) 0;
  overflow: hidden;
  border-top: 1px solid var(--color-gray-300);
}

.header-auth-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.header-auth-buttons .btn-ghost {
  color: var(--color-gray-700);
  border-color: var(--color-gray-400);
}
  `],
})
export class HeaderComponent {
  /** Services */
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);

  /** Dropdown state */
  public isDropdownOpen = false;

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
   * Toggles the user menu dropdown.
   *
   * @param event - Click event
   */
  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Closes dropdown when clicking outside.
   *
   * @param event - Document click event
   */
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    this.isDropdownOpen = false;
  }

  /**
   * Logs out the current user.
   */
  public logout(): void {
    this.isDropdownOpen = false;
    this.authStateService.clearAuth();
    void this.router.navigate(['/login']);
  }
}
