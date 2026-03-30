/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/profile/profile-view/profile-view.component.ts
 * @desc User profile management with preferences and notification settings.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {type UserDto, type UpdateUserDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {UserService} from '@application/services';
import {UserRole} from '@domain/enumerations/user-role';
import templateHtml from './profile-view.component.html?raw';
import styles from './profile-view.component.css?inline';

/**
 * ProfileViewComponent displays and allows editing of user profile.
 */
@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: templateHtml,
  styles: [styles],
})
export class ProfileViewComponent implements OnInit {
  /** Services */
  private readonly fb = inject(FormBuilder);
  private readonly authStateService = inject(AuthStateService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  /** Current user */
  public user = signal<UserDto | null>(null);

  /** Edit mode flag */
  public isEditing = signal(false);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Success message */
  public successMessage = signal<string | null>(null);

  /** Profile form */
  public profileForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phone: [''],
    idDocument: [''],
    ranking: [null],
  });

  /** Check if current user is system admin */
  public isSystemAdmin = computed(() => {
    const currentUser = this.user();
    return currentUser?.role === UserRole.SYSTEM_ADMIN;
  });

  /**
   * Initializes component and loads user profile.
   */
  public ngOnInit(): void {
    const currentUser = this.authStateService.getCurrentUser();
    
    console.log('[Profile] ngOnInit - currentUser:', currentUser);
    
    if (currentUser) {
      // Validate user has required fields
      if (!currentUser.username) {
        console.error('[Profile] CRITICAL: User has no username!', currentUser);
        alert('Profile data corrupted. Please log in again.');
        this.authStateService.clearAuth();
        void this.router.navigate(['/login']);
        return;
      }
      
      this.user.set(currentUser);
      this.populateForm(currentUser);
      
      console.log('[Profile] Form populated with values:', this.profileForm.value);
    } else {
      console.warn('[Profile] No current user, redirecting to login');
      void this.router.navigate(['/login']);
    }
  }

  /**
   * Populates form with user data.
   *
   * @param user - User data to populate
   */
  private populateForm(user: UserDto): void {
    this.profileForm.patchValue({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      idDocument: user.idDocument || '',
      ranking: user.ranking || null,
    });
  }

  /**
   * Toggles edit mode.
   */
  public toggleEdit(): void {
    console.log('[Profile] toggleEdit() called, current isEditing:', this.isEditing());
    
    // Safety check: ensure user still exists
    const currentUser = this.user();
    if (!currentUser) {
      console.error('[Profile] toggleEdit called but no user - likely logged out');
      return;
    }
    
    this.isEditing.set(!this.isEditing());
    
    if (!this.isEditing()) {
      console.log('[Profile] Exiting edit mode, resetting form to current user data');
      if (currentUser) {
        this.populateForm(currentUser);
      }
    } else {
      console.log('[Profile] Entering edit mode');
    }
    
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  /**
   * Saves profile changes.
   */
  public async saveProfile(): Promise<void> {
    console.log('[Profile] saveProfile() called');
    
    // Safety check: ensure component hasn't been destroyed or user logged out
    const currentUser = this.user();
    if (!currentUser) {
      console.error('[Profile] saveProfile called but no user - likely component destroyed');
      return;
    }
    
    console.log('[Profile] Form valid:', this.profileForm.valid);
    console.log('[Profile] Form values:', this.profileForm.value);
    
    if (this.profileForm.invalid) {
      console.warn('[Profile] Form invalid, aborting save');
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const currentUser = this.user();
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const formValue = this.profileForm.value;
      const updateDto: UpdateUserDto = {
        username: formValue.username?.trim(),
        firstName: formValue.firstName?.trim(),
        lastName: formValue.lastName?.trim(),
        phone: formValue.phone?.trim() || null,
        idDocument: formValue.idDocument?.trim() || null,
        ranking: formValue.ranking ? Number(formValue.ranking) : null,
      };

      console.log('[Profile] Sending update DTO:', updateDto);

      // Call user service to update profile
      const updatedUser = await this.userService.updateProfile(currentUser.id, updateDto);
      
      // Update local user state
      this.user.set(updatedUser);
      
      // Update auth state so other components see the updated user
      this.authStateService.setUser(updatedUser);
      
      this.successMessage.set('Profile updated successfully!');
      this.isEditing.set(false);
    } catch (error: any) {
      let message = 'Failed to update profile';
      if (error?.error?.message) {
        message = error.error.message;
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error?.error === 'string') {
        message = error.error;
      }
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Logs out the current user.
   */
  public logout(): void {
    console.log('[Profile] logout() called');
    
    // Save current state to check if in edit mode
    const wasEditing = this.isEditing();
    console.log('[Profile] Was in edit mode:', wasEditing);
    console.log('[Profile] Current form values:', this.profileForm.value);
    
    // If in edit mode, cancel editing without saving
    if (wasEditing) {
      console.warn('[Profile] Canceling edit mode before logout');
      this.isEditing.set(false);
    }
    
    console.log('[Profile] Clearing auth state');
    // Clear auth state
    this.authStateService.clearAuth();
    
    console.log('[Profile] Navigating to login page');
    // Navigate to login
    void this.router.navigate(['/login']);
  }
}
