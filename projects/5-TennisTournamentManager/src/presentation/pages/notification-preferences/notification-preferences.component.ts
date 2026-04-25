/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file src/presentation/pages/notification-preferences/notification-preferences.component.ts
 * @desc Component for managing user notification preferences.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {NotificationPreferencesService, NotificationPreferences} from '../../../application/services/notification-preferences.service';

import {AuthStateService} from '../../services/auth-state.service';
import templateHtml from './notification-preferences.component.html?raw';
import componentStyles from './notification-preferences.component.css?inline';

/**
 * Component for notification preferences page.
 * Allows users to configure notification channels and event types.
 */
@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: templateHtml,
  styles: [componentStyles],
})
export class NotificationPreferencesComponent implements OnInit {
  private readonly preferencesService = inject(NotificationPreferencesService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /**
   * Signal holding current preferences.
   */
  protected readonly preferences = signal<NotificationPreferences | null>(null);

  /**
   * Signal indicating loading state.
   */
  protected readonly isLoading = signal<boolean>(true);

  /**
   * Signal indicating save in progress.
   */
  protected readonly isSaving = signal<boolean>(false);

  /**
   * Signal holding error message.
   */
  protected readonly error = signal<string | null>(null);

  /**
   * Signal holding success message.
   */
  protected readonly successMessage = signal<string | null>(null);

  /**
   * Initializes the component.
   */
  public ngOnInit(): void {
    this.loadPreferences();
  }

  /**
   * Loads notification preferences for current user.
   */
  private loadPreferences(): void {
    const currentUser = this.authState.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.preferencesService.getByUserId(currentUser.id).subscribe({
      next: (prefs) => {
        this.preferences.set(prefs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load preferences:', err);
        this.error.set('Failed to load notification preferences. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Saves notification preferences.
   */
  protected savePreferences(): void {
    const currentUser = this.authState.getCurrentUser();
    const currentPrefs = this.preferences();
    
    if (!currentUser || !currentPrefs) {
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.preferencesService.update(currentUser.id, {
      // Channel toggles
      inAppEnabled: currentPrefs.inAppEnabled,
      emailEnabled: currentPrefs.emailEnabled,
      telegramEnabled: currentPrefs.telegramEnabled,
      webPushEnabled: currentPrefs.webPushEnabled,
      
      // Event type toggles
      matchScheduledEnabled: currentPrefs.matchScheduledEnabled,
      resultEnteredEnabled: currentPrefs.resultEnteredEnabled,
      orderOfPlayPublishedEnabled: currentPrefs.orderOfPlayPublishedEnabled,
      announcementEnabled: currentPrefs.announcementEnabled,
      registrationConfirmedEnabled: currentPrefs.registrationConfirmedEnabled,
    }).subscribe({
      next: (updated) => {
        this.preferences.set(updated);
        this.successMessage.set('Preferences saved successfully!');
        this.isSaving.set(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        console.error('Failed to save preferences:', err);
        this.error.set('Failed to save preferences. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  /**
   * Toggles a channel preference.
   *
   * @param channel - Channel name ('inApp' | 'email' | 'telegram' | 'webPush')
   */
  protected toggleChannel(channel: 'inApp' | 'email' | 'telegram' | 'webPush'): void {
    const prefs = this.preferences();
    if (!prefs) return;

    const key = `${channel}Enabled` as keyof NotificationPreferences;
    const updatedPrefs = {...prefs};
    (updatedPrefs[key] as boolean) = !(prefs[key] as boolean);
    this.preferences.set(updatedPrefs);
  }

  /**
   * Toggles an event type preference.
   *
   * @param eventType - Event type name
   */
  protected toggleEventType(
    eventType: 'matchScheduled' | 'resultEntered' | 'orderOfPlayPublished' | 'announcement' | 'registrationConfirmed'
  ): void {
    const prefs = this.preferences();
    if (!prefs) return;

    const key = `${eventType}Enabled` as keyof NotificationPreferences;
    const updatedPrefs = {...prefs};
    (updatedPrefs[key] as boolean) = !(prefs[key] as boolean);
    this.preferences.set(updatedPrefs);
  }

  /**
   * Navigates back to previous page.
   */
  protected goBack(): void {
    this.location.back();
  }
}
