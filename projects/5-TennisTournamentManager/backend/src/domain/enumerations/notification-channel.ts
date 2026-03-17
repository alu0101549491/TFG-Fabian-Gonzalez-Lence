/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/enumerations/notification-channel.ts
 * @desc Enumeration defining the delivery channels for notifications.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Represents the delivery channel used to send a notification.
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
