/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/services/notification/channels/in-app-channel.adapter.ts
 * @desc In-app notification channel adapter (displays in web interface)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable} from '@angular/core';
import {INotificationChannelAdapter} from '@application/interfaces/notification-channel-adapter.interface';
import {Notification} from '@domain/entities/notification';

/**
 * In-app notification channel adapter.
 * 
 * Delivers notifications through the web application interface.
 * Notifications are stored in the database and displayed in real-time
 * via the NotificationRepository.
 */
@Injectable({providedIn: 'root'})
export class InAppChannelAdapter implements INotificationChannelAdapter {
  /**
   * Sends a notification through the in-app channel.
   * In-app notifications are already persisted by NotificationService,
   * so this adapter only needs to validate the notification.
   *
   * @param notification - The notification to send
   * @returns Promise resolving when notification is processed
   */
  public async send(notification: Notification): Promise<void> {
    // In-app notifications are handled by persistence layer
    // Real-time updates would be handled via WebSocket (future implementation)
    
    // Validate notification
    if (!notification) {
      throw new Error('Notification is required');
    }

    // In a real implementation, this would:
    // 1. Emit via WebSocket for real-time delivery
    // 2. Update UI state if user is currently viewing notifications
    // 3. Increment unread counter badge

    // For now, persistence is sufficient
    return Promise.resolve();
  }

  /**
   * Checks if the in-app channel is available.
   * In-app is always available as it's the default channel.
   *
   * @returns Always true
   */
  public isAvailable(): boolean {
    return true;
  }
}
