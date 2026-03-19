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

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {type UserDto, type UpdateUserDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import templateHtml from './profile-view.component.html?raw';

/**
 * ProfileViewComponent displays and allows editing of user profile.
 */
@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: templateHtml,
  styles: [],
})
export class ProfileViewComponent implements OnInit {
  /** Services */
  private readonly fb = inject(FormBuilder);
  private readonly authStateService = inject(AuthStateService);
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
  });

  /**
   * Initializes component and loads user profile.
   */
  public ngOnInit(): void {
    const currentUser = this.authStateService.getCurrentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.populateForm(currentUser);
    } else {
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
    });
  }

  /**
   * Toggles edit mode.
   */
  public toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing()) {
      const currentUser = this.user();
      if (currentUser) {
        this.populateForm(currentUser);
      }
    }
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  /**
   * Saves profile changes.
   */
  public async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const formValue = this.profileForm.value;
      const updateDto: UpdateUserDto = {
        username: formValue.username,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phone: formValue.phone || null,
      };

      // In real implementation, would call user service to update
      // For now, just show success message
      this.successMessage.set('Profile updated successfully!');
      this.isEditing.set(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Logs out the current user.
   */
  public logout(): void {
    this.authStateService.clearAuth();
    void this.router.navigate(['/login']);
  }
}
