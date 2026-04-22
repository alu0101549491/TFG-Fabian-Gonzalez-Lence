/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 5, 2026
 * @file src/presentation/pages/users/user-profile-view/user-profile-view.component.ts
 * @desc Component for viewing another user's profile with privacy-filtered data.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, inject, computed} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {Router, RouterModule, ActivatedRoute} from '@angular/router';
import {type UserDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {UserService} from '@application/services';
import {UserRole} from '@domain/enumerations/user-role';
import templateHtml from './user-profile-view.component.html?raw';
import styles from './user-profile-view.component.css?inline';

/**
 * UserProfileViewComponent displays another user's profile with privacy-filtered data.
 * 
 * Features:
 * - Displays public information for unauthenticated users
 * - Shows more fields to authenticated users based on privacy settings
 * - System admins and tournament admins see all available data
 * - Respects user's privacy configuration (FR60)
 * 
 * @example
 * ```typescript
 * // Navigate to user profile
 * router.navigate(['/users', userId]);
 * ```
 */
@Component({
  selector: 'app-user-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
  styles: [styles],
})
export class UserProfileViewComponent implements OnInit {
  /** Services */
  private readonly authStateService = inject(AuthStateService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  /** Profile owner (user being viewed) */
  public user = signal<UserDto | null>(null);

  /** Current viewer */
  public currentUser = signal<UserDto | null>(null);

  /** Loading state */
  public isLoading = signal(true);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** User ID from route */
  private userId: string | null = null;

  /**
   * Check if viewer is viewing their own profile.
   */
  public isOwnProfile = computed(() => {
    const viewer = this.currentUser();
    const owner = this.user();
    return viewer !== null && owner !== null && viewer.id === owner.id;
  });

  /**
   * Check if viewer is an administrator.
   */
  public isAdmin = computed(() => {
    const viewer = this.currentUser();
    if (!viewer) return false;
    return viewer.role === UserRole.SYSTEM_ADMIN || viewer.role === UserRole.TOURNAMENT_ADMIN;
  });

  /**
   * Initializes component and loads user profile from route parameter.
   */
  public ngOnInit(): void {
    // Get current viewer
    this.currentUser.set(this.authStateService.getCurrentUser());

    // Get user ID from route
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');
      if (this.userId) {
        void this.loadUserProfile(this.userId);
      } else {
        this.errorMessage.set('Invalid user ID');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Loads user profile by ID with privacy filtering.
   * 
   * @param userId - ID of user to load
   */
  private async loadUserProfile(userId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Fetch user with privacy filtering (backend applies rules based on JWT)
      const userData = await this.userService.getUserById(userId, true);
      this.user.set(userData);
    } catch (error: any) {
      console.error('[UserProfileView] Error loading user:', error);
      
      let message = 'Failed to load user profile';
      if (error?.status === 404) {
        message = 'User not found';
      } else if (error?.error?.message) {
        message = error.error.message;
      } else if (error?.message) {
        message = error.message;
      }
      
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigates to edit profile if viewing own profile.
   */
  public editProfile(): void {
    if (this.isOwnProfile()) {
      void this.router.navigate(['/profile']);
    }
  }

  /**
   * Navigates back to previous page.
   * Uses Angular Location service to maintain proper navigation history.
   */
  public goBack(): void {
    this.location.back();
  }

  /**
   * Gets initials from user's name.
   * 
   * @returns User initials (e.g., "JD" for John Doe)
   */
  public getUserInitials(): string {
    const userData = this.user();
    if (!userData) return '?';
    
    const firstInitial = userData.firstName?.charAt(0) || '';
    const lastInitial = userData.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  /**
   * Formats role name for display.
   * 
   * @param role - User role enum value
   * @returns Formatted role name
   */
  public formatRole(role: UserRole): string {
    switch (role) {
      case UserRole.SYSTEM_ADMIN:
        return 'System Administrator';
      case UserRole.TOURNAMENT_ADMIN:
        return 'Tournament Administrator';
      case UserRole.PLAYER:
        return 'Player';
      default:
        return role;
    }
  }

  /**
   * Formats date for display.
   * 
   * @param date - Date to format
   * @returns Formatted date string (e.g., "Mar 15, 2026")
   */
  public formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Navigates to full statistics view for this user.
   * Allows viewing detailed stats including head-to-head data.
   */
  public viewStatistics(): void {
    const userData = this.user();
    if (!userData) return;
    
    void this.router.navigate(['/statistics', userData.id]);
  }
}
