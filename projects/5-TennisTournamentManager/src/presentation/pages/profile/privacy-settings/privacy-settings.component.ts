/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 5, 2026
 * @file src/presentation/pages/profile/privacy-settings/privacy-settings.component.ts
 * @desc Privacy settings configuration component implementing FR58-FR60
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {type UserDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {UserService} from '@application/services';
import {PrivacyLevel} from '@domain/enumerations/privacy-level';
import templateHtml from './privacy-settings.component.html?raw';
import styles from './privacy-settings.component.css?inline';

/**
 * Privacy settings component for user data visibility configuration.
 * Implements FR58 (privacy level configuration for contact data, avatar, ranking, history).
 * 
 * @remarks
 * Users can configure visibility levels for:
 * - Contact data: email, phone, telegram, whatsapp
 * - Public info: avatar, ranking
 * - Sensitive data: match history, statistics
 * - Communication: allow contact from other users
 * 
 * @example
 * ```html
 * <app-privacy-settings></app-privacy-settings>
 * ```
 */
@Component({
  selector: 'app-privacy-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: templateHtml,
  styles: [styles],
})
export class PrivacySettingsComponent implements OnInit {
  /**
   * Services.
   */
  private readonly fb = inject(FormBuilder);
  private readonly authStateService = inject(AuthStateService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  /**
   * Current user.
   */
  public user = signal<UserDto | null>(null);

  /**
   * Loading state.
   */
  public isLoading = signal(false);

  /**
   * Error message.
   */
  public errorMessage = signal<string | null>(null);

  /**
   * Success message.
   */
  public successMessage = signal<string | null>(null);

  /**
   * Privacy levels available for selection.
   */
  public readonly privacyLevels = [
    {value: PrivacyLevel.PUBLIC, label: 'Public', description: 'Anyone can view'},
    {value: PrivacyLevel.ALL_REGISTERED, label: 'All Registered Users', description: 'Requires login'},
    {value: PrivacyLevel.TOURNAMENT_PARTICIPANTS, label: 'Same Tournament', description: 'Only tournament participants'},
    {value: PrivacyLevel.ADMINS_ONLY, label: 'Admins Only', description: 'Most private option'},
  ];

  /**
   * Privacy settings form.
   */
  public privacyForm: FormGroup = this.fb.group({
    email: [PrivacyLevel.ADMINS_ONLY],
    phone: [PrivacyLevel.ADMINS_ONLY],
    telegram: [PrivacyLevel.ADMINS_ONLY],
    whatsapp: [PrivacyLevel.ADMINS_ONLY],
    avatar: [PrivacyLevel.ALL_REGISTERED],
    ranking: [PrivacyLevel.ALL_REGISTERED],
    history: [PrivacyLevel.TOURNAMENT_PARTICIPANTS],
    statistics: [PrivacyLevel.TOURNAMENT_PARTICIPANTS],
    idDocument: [{value: PrivacyLevel.ADMINS_ONLY, disabled: true}],  // SECURITY: Locked to ADMINS_ONLY
    allowContact: [true],
  });

  /**
   * Initializes component and loads current privacy settings.
   */
  public ngOnInit(): void {
    const currentUser = this.authStateService.getCurrentUser();
    
    console.log('[PrivacySettings] ngOnInit - currentUser:', currentUser);
    
    if (currentUser) {
      this.user.set(currentUser);
      this.populateForm(currentUser);
      
      console.log('[PrivacySettings] Form populated with privacy settings');
    } else {
      console.warn('[PrivacySettings] No current user, redirecting to login');
      void this.router.navigate(['/login']);
    }
  }

  /**
   * Populates form with user's current privacy settings.
   *
   * @param user - User data with privacy settings
   * @private
   */
  private populateForm(user: UserDto): void {
    if (user.privacySettings) {
      this.privacyForm.patchValue({
        email: user.privacySettings.email || PrivacyLevel.ADMINS_ONLY,
        phone: user.privacySettings.phone || PrivacyLevel.ADMINS_ONLY,
        telegram: user.privacySettings.telegram || PrivacyLevel.ADMINS_ONLY,
        whatsapp: user.privacySettings.whatsapp || PrivacyLevel.ADMINS_ONLY,
        avatar: user.privacySettings.avatar || PrivacyLevel.ALL_REGISTERED,
        ranking: user.privacySettings.ranking || PrivacyLevel.ALL_REGISTERED,
        history: user.privacySettings.history || PrivacyLevel.TOURNAMENT_PARTICIPANTS,
        statistics: user.privacySettings.statistics || PrivacyLevel.TOURNAMENT_PARTICIPANTS,
        // idDocument is always ADMINS_ONLY (disabled field, not patchable)
        allowContact: user.privacySettings.allowContact ?? true,
      });
    }
  }

  /**
   * Saves privacy settings.
   */
  public async savePrivacySettings(): Promise<void> {
    console.log('[PrivacySettings] savePrivacySettings() called');
    
    const currentUser = this.user();
    if (!currentUser) {
      console.error('[PrivacySettings] No user - likely component destroyed');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const formValue = this.privacyForm.value;
      const privacySettings = {
        email: formValue.email,
        phone: formValue.phone,
        telegram: formValue.telegram,
        whatsapp: formValue.whatsapp,
        avatar: formValue.avatar,
        ranking: formValue.ranking,
        history: formValue.history,
        statistics: formValue.statistics,
        allowContact: formValue.allowContact,
      };

      console.log('[PrivacySettings] Sending privacy settings:', privacySettings);

      // Call user service to update privacy settings
      const updatedUser = await this.userService.updatePrivacySettings(currentUser.id, privacySettings);
      
      // Update local user state
      this.user.set(updatedUser);
      
      // Update auth state so other components see the updated user
      this.authStateService.setUser(updatedUser);
      
      this.successMessage.set('Privacy settings updated successfully!');
      
      // Scroll to top to show success message
      window.scrollTo({top: 0, behavior: 'smooth'});
    } catch (error: any) {
      let message = 'Failed to update privacy settings';
      if (error?.error?.message) {
        message = error.error.message;
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error?.error === 'string') {
        message = error.error;
      }
      this.errorMessage.set(message);
      
      // Scroll to top to show error message
      window.scrollTo({top: 0, behavior: 'smooth'});
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Resets form to default privacy settings (all conservative).
   */
  public resetToDefaults(): void {
    console.log('[PrivacySettings] resetToDefaults() called');
    
    this.privacyForm.patchValue({
      email: PrivacyLevel.ADMINS_ONLY,
      phone: PrivacyLevel.ADMINS_ONLY,
      telegram: PrivacyLevel.ADMINS_ONLY,
      whatsapp: PrivacyLevel.ADMINS_ONLY,
      avatar: PrivacyLevel.ALL_REGISTERED,
      ranking: PrivacyLevel.ALL_REGISTERED,
      history: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
      statistics: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
      allowContact: true,
    });
    
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  /**
   * Navigates back to profile view.
   */
  public goToProfile(): void {
    void this.router.navigate(['/profile']);
  }
}
