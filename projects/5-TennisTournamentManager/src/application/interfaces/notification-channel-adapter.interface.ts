/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/interfaces/notification-channel-adapter.interface.ts
 * @desc Interface for notification channel adapters (Strategy/Adapter Pattern)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Notification} from '@domain/entities/notification';

/**
 * Interface for notification channel adapters.
 * Each adapter implements delivery logic for a specific channel.
 * Uses Strategy Pattern to allow runtime channel selection.
 */
export interface INotificationChannelAdapter {
  /**
   * Sends a notification through this channel.
   *
   * @param notification - The notification to send
   * @returns Promise resolving when notification is sent
   * @throws Error if delivery fails
   */
  send(notification: Notification): Promise<void>;

  /**
   * Checks if this channel is available/configured.
   *
   * @returns True if the channel is ready to send notifications
   */
  isAvailable(): boolean;
}
