/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file application/dto/notification-preferences.dto.ts
 * @desc DTOs for notification preferences operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * DTO for notification preferences output.
 */
export interface NotificationPreferencesDto {
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
 * DTO for updating notification preferences.
 */
export interface UpdateNotificationPreferencesDto {
  // Channel toggles
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  telegramEnabled?: boolean;
  webPushEnabled?: boolean;
  
  // Event type toggles
  matchScheduledEnabled?: boolean;
  resultEnteredEnabled?: boolean;
  orderOfPlayPublishedEnabled?: boolean;
  announcementEnabled?: boolean;
  registrationConfirmedEnabled?: boolean;
}
