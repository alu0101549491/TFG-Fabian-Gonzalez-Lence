/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 2, 2026
 * @file application/services/notification.service.ts
 * @desc Backend notification service for creating and dispatching system notifications.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AppDataSource} from '../../infrastructure/database/data-source';
import {Notification} from '../../domain/entities/notification.entity';
import {NotificationPreferences} from '../../domain/entities/notification-preferences.entity';
import {User} from '../../domain/entities/user.entity';
import {PushSubscription} from '../../domain/entities/push-subscription.entity';
import {NotificationType} from '../../domain/enumerations/notification-type';
import {NotificationChannel} from '../../domain/enumerations/notification-channel';
import {generateId} from '../../shared/utils/id-generator';
import {ID_PREFIXES} from '../../shared/constants';
import {emitNotification} from '../../websocket-server';
import {EmailService} from '../../infrastructure/email/email.service';
import {TelegramService} from '../../infrastructure/telegram/telegram.service';
import {WebPushService} from '../../infrastructure/push/web-push.service';

/**
 * Notification service for creating and sending notifications to users.
 * Handles in-app notifications, WebSocket real-time delivery, and multi-channel distribution.
 */
export class NotificationService {
  /**
   * Email service for sending notification emails.
   */
  private readonly emailService: EmailService;

  /**
   * Telegram service for sending Telegram notifications.
   */
  private readonly telegramService: TelegramService;

  /**
   * Web Push service for sending browser push notifications.
   */
  private readonly webPushService: WebPushService;

  /**
   * Initializes the notification service with multi-channel capabilities.
   */
  public constructor() {
    this.emailService = new EmailService();
    this.telegramService = new TelegramService();
    this.webPushService = new WebPushService();
  }
  /**
   * Creates and saves a notification to the database.
   * Checks user preferences before creating the notification.
   *
   * @param userId - ID of the user to notify
   * @param type - Type of notification
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Optional metadata (matchId, tournamentId, etc.)
   * @returns Created notification or null if user preferences block it
   */
  public async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<Notification | null> {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const preferencesRepository = AppDataSource.getRepository(NotificationPreferences);

    // Check user preferences
    const preferences = await preferencesRepository.findOne({where: {userId}});
    
    // If no preferences exist, create notification (default: all notifications enabled)
    // If preferences exist, check if this type is enabled
    if (preferences && !preferences.isTypeEnabled(type)) {
      console.log(`⚠️ Notification blocked by user preferences: ${userId} - ${type}`);
      return null;
    }

    // Check if in-app channel is enabled
    if (preferences && !preferences.isChannelEnabled(NotificationChannel.IN_APP)) {
      console.log(`⚠️ In-app notification blocked by user preferences: ${userId}`);
      return null;
    }

    // Determine which channels will be used
    const channels: NotificationChannel[] = [NotificationChannel.IN_APP];
    const emailEnabled = preferences?.isChannelEnabled(NotificationChannel.EMAIL) || false;
    const telegramEnabled = preferences?.isChannelEnabled(NotificationChannel.TELEGRAM) || false;
    const webPushEnabled = preferences?.isChannelEnabled(NotificationChannel.WEB_PUSH) || false;

    if (emailEnabled) {
      channels.push(NotificationChannel.EMAIL);
    }

    if (telegramEnabled) {
      channels.push(NotificationChannel.TELEGRAM);
    }

    if (webPushEnabled) {
      channels.push(NotificationChannel.WEB_PUSH);
    }

    const notification = notificationRepository.create({
      id: generateId(ID_PREFIXES.NOTIFICATION),
      userId,
      type,
      channels,
      title,
      message,
      isRead: false,
      metadata: metadata || null,
    });

    const saved = await notificationRepository.save(notification);

    // Emit real-time notification via WebSocket
    emitNotification(userId, {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      message: saved.message,
      createdAt: saved.createdAt,
      isRead: saved.isRead,
      metadata: saved.metadata,
    });

    // Send email if enabled in user preferences (Phase 3 - Multi-Channel Delivery)
    if (emailEnabled) {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: {id: userId},
          select: ['email', 'firstName', 'lastName'],
        });

        if (user?.email) {
          const fullName = `${user.firstName} ${user.lastName}`.trim();
          await this.emailService.sendNotificationEmail(
            user.email,
            fullName,
            type,
            title,
            message,
            metadata,
          );
          console.log(`📧 Email notification sent to ${user.email} - ${type}`);
        } else {
          console.log(`⚠️ User ${userId} has no email address - skipping email notification`);
        }
      } catch (error) {
        // Email failures should not block notification creation
        console.error(`❌ Failed to send email notification to ${userId}:`, error);
      }
    }

    // Send Telegram message if enabled in user preferences (Phase 3 - Multi-Channel Delivery)
    if (telegramEnabled) {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: {id: userId},
          select: ['telegramChatId', 'firstName', 'lastName'],
        });

        if (user?.telegramChatId) {
          await this.telegramService.sendNotificationMessage(
            user.telegramChatId,
            type,
            title,
            message,
            metadata,
          );
          console.log(`✈️ Telegram notification sent to chatId: ${user.telegramChatId} - ${type}`);
        } else {
          console.log(`⚠️ User ${userId} has no Telegram chat ID - skipping Telegram notification`);
        }
      } catch (error) {
        // Telegram failures should not block notification creation
        console.error(`❌ Failed to send Telegram notification to ${userId}:`, error);
      }
    }

    // Send Web Push notification if enabled in user preferences (Phase 3 - Multi-Channel Delivery)
    if (webPushEnabled) {
      try {
        const pushSubscriptionRepository = AppDataSource.getRepository(PushSubscription);
        const subscriptions = await pushSubscriptionRepository.find({
          where: {userId},
        });

        if (subscriptions.length > 0) {
          // Send to all subscriptions (user may have multiple devices/browsers)
          for (const sub of subscriptions) {
            try {
              await this.webPushService.sendPushNotification(
                {
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.p256dhKey,
                    auth: sub.authKey,
                  },
                },
                type,
                title,
                message,
                metadata,
              );
            } catch (error) {
              // If subscription is expired/invalid, delete it
              if ((error as Error).message.includes('expired')) {
                await pushSubscriptionRepository.remove(sub);
                console.log(`🗑️ Removed expired push subscription: ${sub.id}`);
              }
            }
          }
          console.log(`📱 Web Push notifications sent to ${subscriptions.length} device(s) - ${type}`);
        } else {
          console.log(`⚠️ User ${userId} has no push subscriptions - skipping Web Push notification`);
        }
      } catch (error) {
        // Web Push failures should not block notification creation
        console.error(`❌ Failed to send Web Push notification to ${userId}:`, error);
      }
    }

    return saved;
  }

  /**
   * Notifies opponent when a match result is entered (pending confirmation).
   *
   * @param matchId - ID of the match
   * @param opponentId - ID of the opponent who needs to confirm
   * @param submitterName - Name of the user who submitted the result
   */
  public async notifyResultEntered(
    matchId: string,
    opponentId: string,
    submitterName: string,
  ): Promise<void> {
    await this.createNotification(
      opponentId,
      NotificationType.RESULT_ENTERED,
      '🎾 Match Result Pending Confirmation',
      `${submitterName} has entered a result for your match. Please review and confirm or dispute.`,
      {matchId},
    );
  }

  /**
   * Notifies the original submitter when their result is confirmed.
   *
   * @param matchId - ID of the match
   * @param submitterId - ID of the user who submitted the result
   * @param confirmerName - Name of the user who confirmed
   */
  public async notifyResultConfirmed(
    matchId: string,
    submitterId: string,
    confirmerName: string,
  ): Promise<void> {
    await this.createNotification(
      submitterId,
      NotificationType.RESULT_ENTERED,
      '✅ Match Result Confirmed',
      `${confirmerName} has confirmed the match result. The match is now official.`,
      {matchId},
    );
  }

  /**
   * Notifies administrators when a match result is disputed.
   *
   * @param matchId - ID of the match
   * @param adminUserIds - Array of admin user IDs to notify
   * @param disputerName - Name of the user who disputed
   * @param reason - Dispute reason
   */
  public async notifyResultDisputed(
    matchId: string,
    adminUserIds: string[],
    disputerName: string,
    reason: string,
  ): Promise<void> {
    for (const adminId of adminUserIds) {
      await this.createNotification(
        adminId,
        NotificationType.RESULT_ENTERED,
        '⚠️ Match Result Disputed',
        `${disputerName} has disputed a match result. Reason: "${reason}". Please review and resolve.`,
        {matchId, disputeReason: reason},
      );
    }
  }

  /**
   * Notifies a participant when a match is scheduled.
   *
   * @param matchId - ID of the match
   * @param participantId - ID of the participant
   * @param opponentName - Name of the opponent
   * @param scheduledTime - Scheduled date/time
   * @param courtName - Court name (optional)
   * @param tournamentId - ID of the tournament (optional)
   * @param tournamentName - Name of the tournament (optional)
   */
  public async notifyMatchScheduled(
    matchId: string,
    participantId: string,
    opponentName: string,
    scheduledTime: Date,
    courtName?: string,
    tournamentId?: string,
    tournamentName?: string,
  ): Promise<void> {
    const dateStr = scheduledTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const courtInfo = courtName ? ` on ${courtName}` : '';

    await this.createNotification(
      participantId,
      NotificationType.MATCH_SCHEDULED,
      '📅 Match Scheduled',
      `Your match against ${opponentName} is scheduled for ${dateStr}${courtInfo}.`,
      {
        matchId, 
        scheduledTime: scheduledTime.toISOString(),
        tournamentId,
        tournamentName,
      },
    );
  }

  /**
   * Retrieves all administrators (SYSTEM_ADMIN and TOURNAMENT_ADMIN).
   *
   * @returns Array of admin user IDs
   */
  public async getAdminUserIds(): Promise<string[]> {
    // Import User entity dynamically to avoid circular dependency
    const {User} = await import('../../domain/entities/user.entity');
    const {UserRole} = await import('../../domain/enumerations/user-role');
    const userRepository = AppDataSource.getRepository(User);

    const admins = await userRepository.find({
      where: [
        {role: UserRole.SYSTEM_ADMIN},
        {role: UserRole.TOURNAMENT_ADMIN},
      ],
      select: ['id'],
    });

    return admins.map(admin => admin.id);
  }

  /**
   * Notifies a participant when their registration is accepted.
   *
   * @param participantId - ID of the participant
   * @param tournamentName - Name of the tournament
   * @param tournamentId - ID of the tournament
   * @param acceptanceType - Type of acceptance (DA, WC, ALT, etc.)
   */
  public async notifyRegistrationConfirmed(
    participantId: string,
    tournamentName: string,
    tournamentId: string,
    acceptanceType: string,
  ): Promise<void> {
    const acceptanceMessage =
      acceptanceType === 'DIRECT_ACCEPTANCE'
        ? 'Your registration has been accepted!'
        : acceptanceType === 'WILD_CARD'
        ? 'You have been granted a Wild Card entry!'
        : acceptanceType === 'ALTERNATE'
        ? 'You have been accepted as an Alternate.'
        : 'Your registration has been accepted!';

    await this.createNotification(
      participantId,
      NotificationType.REGISTRATION_CONFIRMED,
      '✅ Registration Accepted',
      `${acceptanceMessage} ${tournamentName}`,
      {tournamentId, acceptanceType},
    );
  }

  /**
   * Notifies participants when order of play is published.
   *
   * @param tournamentId - ID of the tournament
   * @param participantIds - Array of participant IDs to notify
   * @param publishDate - Date of the order of play
   */
  public async notifyOrderOfPlayPublished(
    tournamentId: string,
    participantIds: string[],
    publishDate: Date,
  ): Promise<void> {
    const dateStr = publishDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    for (const participantId of participantIds) {
      await this.createNotification(
        participantId,
        NotificationType.ORDER_OF_PLAY_PUBLISHED,
        '📅 Order of Play Published',
        `The order of play for ${dateStr} has been published. Check your match schedule.`,
        {tournamentId, date: publishDate.toISOString()},
      );
    }
  }

  /**
   * Notifies participants when a new announcement is published.
   *
   * @param tournamentId - ID of the tournament
   * @param participantIds - Array of participant IDs to notify
   * @param announcementTitle - Title of the announcement
   * @param announcementId - ID of the announcement
   */
  public async notifyAnnouncementPublished(
    tournamentId: string,
    participantIds: string[],
    announcementTitle: string,
    announcementId: string,
  ): Promise<void> {
    for (const participantId of participantIds) {
      await this.createNotification(
        participantId,
        NotificationType.ANNOUNCEMENT,
        '📢 New Announcement',
        `New announcement: ${announcementTitle}`,
        {tournamentId, announcementId},
      );
    }
  }

  /**
   * Notifies both participants when a match is suspended.
   *
   * @param matchId - ID of the match
   * @param participant1Id - ID of participant 1
   * @param participant2Id - ID of participant 2
   * @param reason - Reason for suspension
   */
  public async notifyMatchSuspended(
    matchId: string,
    participant1Id: string | null,
    participant2Id: string | null,
    reason: string,
  ): Promise<void> {
    const participantIds = [participant1Id, participant2Id].filter(Boolean) as string[];
    for (const participantId of participantIds) {
      await this.createNotification(
        participantId,
        NotificationType.MATCH_SUSPENDED,
        '⏸ Match Suspended',
        `Your match has been suspended. Reason: ${reason}`,
        {matchId, reason},
      );
    }
  }

  /**
   * Notifies both participants when a suspended match is resumed.
   *
   * @param matchId - ID of the match
   * @param participant1Id - ID of participant 1
   * @param participant2Id - ID of participant 2
   * @param scheduledTime - Optional new scheduled time
   */
  public async notifyMatchResumed(
    matchId: string,
    participant1Id: string | null,
    participant2Id: string | null,
    scheduledTime?: Date,
  ): Promise<void> {
    const message = scheduledTime
      ? `Your suspended match has been resumed and rescheduled for ${scheduledTime.toLocaleString()}.`
      : 'Your suspended match has been resumed. Please check the schedule.';
    const participantIds = [participant1Id, participant2Id].filter(Boolean) as string[];
    for (const participantId of participantIds) {
      await this.createNotification(
        participantId,
        NotificationType.MATCH_RESUMED,
        '▶️ Match Resumed',
        message,
        {matchId, scheduledTime: scheduledTime?.toISOString()},
      );
    }
  }

  /**
   * Notifies both participants after an admin resolves a disputed result.
   *
   * @param matchId - ID of the match
   * @param participant1Id - ID of participant 1
   * @param participant2Id - ID of participant 2
   * @param winnerName - Name of the match winner as determined by admin
   * @param resolutionNotes - Optional admin resolution notes
   */
  public async notifyDisputeResolved(
    matchId: string,
    participant1Id: string | null,
    participant2Id: string | null,
    winnerName: string,
    resolutionNotes?: string,
  ): Promise<void> {
    const message = resolutionNotes
      ? `Your match dispute has been resolved by an admin. Winner: ${winnerName}. Notes: ${resolutionNotes}`
      : `Your match dispute has been resolved by an admin. Winner: ${winnerName}.`;
    const participantIds = [participant1Id, participant2Id].filter(Boolean) as string[];
    for (const participantId of participantIds) {
      await this.createNotification(
        participantId,
        NotificationType.DISPUTE_RESOLVED,
        '⚖️ Dispute Resolved',
        message,
        {matchId, winnerName},
      );
    }
  }

  /**
   * Notifies a participant when their match ends by default or walkover.
   *
   * @param matchId - ID of the match
   * @param participantId - ID of the affected participant
   * @param matchStatus - NEW match status (DEFAULT or WALKOVER)
   * @param reason - Optional reason for the default/walkover
   */
  public async notifyMatchDefault(
    matchId: string,
    participantId: string,
    matchStatus: string,
    reason?: string,
  ): Promise<void> {
    const label = matchStatus === 'WALKOVER' ? 'Walkover (WO)' : 'Default (DEF)';
    const message = reason
      ? `A match has ended by ${label}. Reason: ${reason}`
      : `A match has ended by ${label}. Please check your match schedule.`;
    await this.createNotification(
      participantId,
      NotificationType.MATCH_DEFAULT,
      `🎾 Match Ended: ${label}`,
      message,
      {matchId, matchStatus, reason},
    );
  }
}
