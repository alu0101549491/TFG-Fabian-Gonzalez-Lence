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
import {NotificationType} from '../../domain/enumerations/notification-type';
import {NotificationChannel} from '../../domain/enumerations/notification-channel';
import {generateId} from '../../shared/utils/id-generator';
import {ID_PREFIXES} from '../../shared/constants';
import {emitNotification} from '../../websocket-server';

/**
 * Notification service for creating and sending notifications to users.
 * Handles in-app notifications and WebSocket real-time delivery.
 */
export class NotificationService {
  /**
   * Creates and saves a notification to the database.
   *
   * @param userId - ID of the user to notify
   * @param type - Type of notification
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Optional metadata (matchId, tournamentId, etc.)
   * @returns Created notification
   */
  public async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<Notification> {
    const notificationRepository = AppDataSource.getRepository(Notification);

    const notification = notificationRepository.create({
      id: generateId(ID_PREFIXES.NOTIFICATION),
      userId,
      type,
      channels: [NotificationChannel.IN_APP], // Start with in-app only
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
   */
  public async notifyMatchScheduled(
    matchId: string,
    participantId: string,
    opponentName: string,
    scheduledTime: Date,
    courtName?: string,
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
      {matchId, scheduledTime: scheduledTime.toISOString()},
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
}
