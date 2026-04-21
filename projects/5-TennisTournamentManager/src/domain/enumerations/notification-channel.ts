/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/domain/enumerations/notification-channel.ts
 * @desc Enumeration defining the delivery channels for notifications (Observer Pattern multichannel dispatch).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents the delivery channel used to send a notification.
 * The NotificationService (Observer Pattern) dispatches to one or more channels.
 */
export enum NotificationChannel {
  /** In-app notification displayed in the web interface. */
  IN_APP = 'IN_APP',
  /** Email notification sent to the user's registered address. */
  EMAIL = 'EMAIL',
  /** Telegram bot message. */
  TELEGRAM = 'TELEGRAM',
  /** Web Push notification via service worker. */
  WEB_PUSH = 'WEB_PUSH',
}

/**
 * Type guard to check if a value is a valid NotificationChannel.
 *
 * @param value - The value to check
 * @returns True if the value is a valid NotificationChannel
 */
export function isValidNotificationChannel(value: unknown): value is NotificationChannel {
  return Object.values(NotificationChannel).includes(value as NotificationChannel);
}

/** Array of all notification channels for iteration. */
export const ALL_NOTIFICATION_CHANNELS = Object.values(NotificationChannel);
