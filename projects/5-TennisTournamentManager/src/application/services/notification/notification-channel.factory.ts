/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/services/notification/notification-channel.factory.ts
 * @desc Factory for creating notification channel adapters (Factory Pattern)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {INotificationChannelAdapter} from '@application/interfaces/notification-channel-adapter.interface';
import {NotificationChannel} from '@domain/enumerations/notification-channel';
import {InAppChannelAdapter} from './channels/in-app-channel.adapter';
import {EmailChannelAdapter} from './channels/email-channel.adapter';
import {TelegramChannelAdapter} from './channels/telegram-channel.adapter';
import {WebPushChannelAdapter} from './channels/web-push-channel.adapter';

/**
 * Factory for creating notification channel adapters.
 * 
 * Uses Factory Pattern to encapsulate channel selection logic.
 * Each channel is lazily instantiated and cached for reuse.
 * 
 * @example
 * const factory = inject(NotificationChannelFactory);
 * const emailAdapter = factory.getChannel(NotificationChannel.EMAIL);
 * await emailAdapter.send(notification);
 */
@Injectable({providedIn: 'root'})
export class NotificationChannelFactory {
  // Channel adapters (injected via Angular DI)
  private readonly inAppAdapter = inject(InAppChannelAdapter);
  private readonly emailAdapter = inject(EmailChannelAdapter);
  private readonly telegramAdapter = inject(TelegramChannelAdapter);
  private readonly webPushAdapter = inject(WebPushChannelAdapter);

  /**
   * Retrieves the appropriate channel adapter for the given channel type.
   *
   * @param channel - The notification channel type
   * @returns The channel adapter implementation
   * @throws Error if channel type is unknown
   */
  public getChannel(channel: NotificationChannel): INotificationChannelAdapter {
    switch (channel) {
      case NotificationChannel.IN_APP:
        return this.inAppAdapter;
      
      case NotificationChannel.EMAIL:
        return this.emailAdapter;
      
      case NotificationChannel.TELEGRAM:
        return this.telegramAdapter;
      
      case NotificationChannel.WEB_PUSH:
        return this.webPushAdapter;
      
      default:
        throw new Error(`Unknown notification channel: ${channel}`);
    }
  }

  /**
   * Gets all available (configured) channels.
   * Useful for determining which channels can be used for delivery.
   *
   * @returns Array of available notification channels
   */
  public getAvailableChannels(): NotificationChannel[] {
    const allChannels = [
      NotificationChannel.IN_APP,
      NotificationChannel.EMAIL,
      NotificationChannel.TELEGRAM,
      NotificationChannel.WEB_PUSH,
    ];

    return allChannels.filter(channel => {
      const adapter = this.getChannel(channel);
      return adapter.isAvailable();
    });
  }
}
