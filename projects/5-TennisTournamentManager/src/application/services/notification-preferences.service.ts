/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file src/application/services/notification-preferences.service.ts
 * @desc Service for managing user notification preferences.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {environment} from '../../environments/environment';

/**
 * Interface for notification preferences.
 */
export interface NotificationPreferences {
  userId: string;
  
  // Channel toggles
  inAppEnabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  webPushEnabled: boolean;
  
  // Event type toggles
  matchScheduledEnabled: boolean;
  resultEnteredEnabled: boolean;
  orderOfPlayPublishedEnabled: boolean;
  announcementEnabled: boolean;
  registrationConfirmedEnabled: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for updating notification preferences.
 */
export interface UpdateNotificationPreferences {
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  telegramEnabled?: boolean;
  webPushEnabled?: boolean;
  matchScheduledEnabled?: boolean;
  resultEnteredEnabled?: boolean;
  orderOfPlayPublishedEnabled?: boolean;
  announcementEnabled?: boolean;
  registrationConfirmedEnabled?: boolean;
}

/**
 * Service for notification preferences operations.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationPreferencesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  /**
   * Signal holding current user's notification preferences.
   */
  public readonly preferences = signal<NotificationPreferences | null>(null);

  /**
   * Gets notification preferences for a user.
   *
   * @param userId - User ID
   * @returns Observable of notification preferences
   */
  public getByUserId(userId: string): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}/${userId}/notification-preferences`).pipe(
      tap((prefs) => this.preferences.set(prefs)),
    );
  }

  /**
   * Updates notification preferences for a user.
   *
   * @param userId - User ID
   * @param updates - Preference updates
   * @returns Observable of updated preferences
   */
  public update(userId: string, updates: UpdateNotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.apiUrl}/${userId}/notification-preferences`, updates).pipe(
      tap((prefs) => this.preferences.set(prefs)),
    );
  }
}
