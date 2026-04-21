/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 9, 2026
 * @file backend/src/infrastructure/push/web-push.service.ts
 * @desc Web Push notification service for sending browser push notifications.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://github.com/web-push-libs/web-push}
 * @see {@link https://typescripttutorial.net}
 */

import webpush from 'web-push';
import {config} from '../../shared/config';
import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Interface for web push subscription data.
 */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Service for sending browser push notifications using Web Push Protocol.
 * Handles VAPID authentication, notification formatting, and delivery.
 */
export class WebPushService {
  /** Whether the Web Push service is enabled (valid VAPID keys). */
  private enabled = false;

  /**
   * Normalize a base64url string and convert to a Buffer. Returns empty buffer on failure.
   */
  private base64UrlToBuffer(value: string): Buffer {
    try {
      let s = value.replace(/-/g, '+').replace(/_/g, '/');
      const pad = s.length % 4;
      if (pad === 2) s += '==';
      else if (pad === 3) s += '=';
      else if (pad === 1) return Buffer.alloc(0);
      return Buffer.from(s, 'base64');
    } catch {
      return Buffer.alloc(0);
    }
  }

  private isValidPublicKey(key: string): boolean {
    const buf = this.base64UrlToBuffer(key);
    return buf.length === 65;
  }

  private isValidPrivateKey(key: string): boolean {
    const buf = this.base64UrlToBuffer(key);
    return buf.length === 32 || buf.length === 48 || buf.length > 0; // be permissive but avoid obvious garbage
  }
  /**
   * Initializes the web push service with VAPID keys from config.
   * Sets up web-push library with subject and VAPID details.
   */
  public constructor() {
    this.initializeWebPush();
  }

  /**
   * Initializes the web-push library with VAPID credentials.
   * Logs initialization status and any errors.
   *
   * @private
   */
  private initializeWebPush(): void {
    try {
      const {publicKey, privateKey} = config.webPush;
      if (!publicKey || !privateKey) {
        console.log('⚠️ Web Push VAPID keys not configured - Web Push notifications disabled');
        this.enabled = false;
        return;
      }

      if (!this.isValidPublicKey(publicKey) || !this.isValidPrivateKey(privateKey)) {
        console.warn('⚠️ Web Push VAPID keys appear invalid or malformed - Web Push disabled');
        this.enabled = false;
        return;
      }

      webpush.setVapidDetails(
        'mailto:support@tennistournament.com',
        publicKey,
        privateKey,
      );

      this.enabled = true;
      console.log('✅ Web Push service initialized successfully');
    } catch (error) {
      this.enabled = false;
      console.error('❌ Failed to initialize Web Push service:', error);
    }
  }

  /**
   * Sends a push notification to a browser subscription.
   * Includes notification title, message, icon, badge, and action links.
   *
   * @param subscription - Push subscription data (endpoint + keys)
   * @param type - Type of notification
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Optional metadata for action links
   */
  public async sendPushNotification(
    subscription: PushSubscriptionData,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.enabled) {
      console.warn('WebPushService disabled - skipping push send');
      return;
    }

    try {
      const emoji = this.getNotificationEmoji(type);
      const actionUrl = this.getActionUrl(type, metadata);

      // Build push notification payload
      const payload = JSON.stringify({
        title: `${emoji} ${title}`,
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: {
          url: actionUrl,
          notificationType: type,
          metadata: metadata || {},
        },
        actions: [
          {
            action: 'open',
            title: 'View',
          },
          {
            action: 'close',
            title: 'Dismiss',
          },
        ],
      });

      // Send push notification
      await webpush.sendNotification(subscription, payload);

      console.log(`✅ Web Push notification sent - ${type}`);
    } catch (error) {
      // Non-blocking: Push failures should not prevent notification creation
      console.error('❌ Failed to send Web Push notification:', error);

      // If subscription is invalid/expired, throw error so caller can remove it
      if ((error as any).statusCode === 410) {
        throw new Error('Push subscription expired or invalid');
      }
    }
  }

  /**
   * Gets the emoji icon for a notification type.
   *
   * @param type - Notification type
   * @returns Emoji string
   * @private
   */
  private getNotificationEmoji(type: NotificationType): string {
    switch (type) {
      case NotificationType.REGISTRATION_CONFIRMED:
        return '✅';
      case NotificationType.MATCH_SCHEDULED:
        return '📅';
      case NotificationType.RESULT_ENTERED:
        return '🎾';
      case NotificationType.ORDER_OF_PLAY_PUBLISHED:
        return '📋';
      case NotificationType.ANNOUNCEMENT:
        return '📢';
      default:
        return '🔔';
    }
  }

  /**
   * Builds action URL from notification metadata.
   * URL points to the app with context-specific deep linking.
   *
   * @param type - Notification type
   * @param metadata - Notification metadata
   * @returns URL string
   * @private
   */
  private getActionUrl(
    type: NotificationType,
    metadata?: Record<string, unknown>,
  ): string {
    const appUrl = config.email.appUrl || 'http://localhost:4200';

    if (!metadata) {
      return appUrl;
    }

    switch (type) {
      case NotificationType.REGISTRATION_CONFIRMED:
        if (metadata.tournamentId) {
          return `${appUrl}/tournaments/${metadata.tournamentId}`;
        }
        break;
      case NotificationType.MATCH_SCHEDULED:
      case NotificationType.RESULT_ENTERED:
        if (metadata.matchId) {
          return `${appUrl}/matches/${metadata.matchId}`;
        }
        break;
      case NotificationType.ORDER_OF_PLAY_PUBLISHED:
        if (metadata.tournamentId) {
          return `${appUrl}/tournaments/${metadata.tournamentId}`;
        }
        break;
      case NotificationType.ANNOUNCEMENT:
        if (metadata.announcementId) {
          return `${appUrl}/announcements?id=${metadata.announcementId}`;
        }
        break;
    }

    return appUrl;
  }

  /**
   * Verifies the Web Push configuration.
   * Useful for testing VAPID keys validity.
   *
   * @returns True if VAPID keys are configured
   */
  public verifyConfiguration(): boolean {
    return this.enabled && !!config.webPush.publicKey && !!config.webPush.privateKey;
  }
}
