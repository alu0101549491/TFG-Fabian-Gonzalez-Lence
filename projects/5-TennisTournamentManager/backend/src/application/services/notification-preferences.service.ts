/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file application/services/notification-preferences.service.ts
 * @desc Service for managing user notification preferences.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Repository} from 'typeorm';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {NotificationPreferences} from '../../domain/entities/notification-preferences.entity';
import {User} from '../../domain/entities/user.entity';
import {NotificationPreferencesDto, UpdateNotificationPreferencesDto} from '../dto/notification-preferences.dto';
import {AppError} from '../../presentation/middleware/error.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';

/**
 * Service for notification preferences operations.
 */
export class NotificationPreferencesService {
  private readonly preferencesRepository: Repository<NotificationPreferences>;
  private readonly userRepository: Repository<User>;

  constructor() {
    this.preferencesRepository = AppDataSource.getRepository(NotificationPreferences);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Gets notification preferences for a user.
   * Creates default preferences if none exist.
   *
   * @param userId - User ID
   * @returns User's notification preferences
   */
  public async getByUserId(userId: string): Promise<NotificationPreferencesDto> {
    // Check if user exists
    const user = await this.userRepository.findOne({where: {id: userId}});
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    // Get or create preferences
    let preferences = await this.preferencesRepository.findOne({where: {userId}});
    
    if (!preferences) {
      // Create default preferences
      preferences = NotificationPreferences.createDefault(userId);
      preferences = await this.preferencesRepository.save(preferences);
      console.log(`✅ Created default notification preferences for user ${userId}`);
    }

    return this.mapToDto(preferences);
  }

  /**
   * Updates notification preferences for a user.
   *
   * @param userId - User ID
   * @param updates - Preference updates
   * @returns Updated preferences
   */
  public async update(
    userId: string,
    updates: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    // Get or create preferences
    let preferences = await this.preferencesRepository.findOne({where: {userId}});
    
    if (!preferences) {
      preferences = NotificationPreferences.createDefault(userId);
    }

    // Update channel toggles
    if (updates.inAppEnabled !== undefined) {
      preferences.inAppEnabled = updates.inAppEnabled;
    }
    if (updates.emailEnabled !== undefined) {
      preferences.emailEnabled = updates.emailEnabled;
    }
    if (updates.telegramEnabled !== undefined) {
      preferences.telegramEnabled = updates.telegramEnabled;
    }
    if (updates.webPushEnabled !== undefined) {
      preferences.webPushEnabled = updates.webPushEnabled;
    }

    // Update event type toggles
    if (updates.matchScheduledEnabled !== undefined) {
      preferences.matchScheduledEnabled = updates.matchScheduledEnabled;
    }
    if (updates.resultEnteredEnabled !== undefined) {
      preferences.resultEnteredEnabled = updates.resultEnteredEnabled;
    }
    if (updates.orderOfPlayPublishedEnabled !== undefined) {
      preferences.orderOfPlayPublishedEnabled = updates.orderOfPlayPublishedEnabled;
    }
    if (updates.announcementEnabled !== undefined) {
      preferences.announcementEnabled = updates.announcementEnabled;
    }
    if (updates.registrationConfirmedEnabled !== undefined) {
      preferences.registrationConfirmedEnabled = updates.registrationConfirmedEnabled;
    }

    // Update enabled channels and types arrays
    preferences.updateEnabledChannels();
    preferences.updateEnabledTypes();

    // Save
    const updated = await this.preferencesRepository.save(preferences);
    console.log(`✅ Updated notification preferences for user ${userId}`);

    return this.mapToDto(updated);
  }

  /**
   * Checks if a user should receive a notification based on their preferences.
   *
   * @param userId - User ID
   * @param channel - Notification channel
   * @param type - Notification type
   * @returns True if user should receive the notification
   */
  public async shouldNotify(
    userId: string,
    channel: string,
    type: string,
  ): Promise<boolean> {
    const preferences = await this.preferencesRepository.findOne({where: {userId}});
    
    // If no preferences, use defaults (all enabled)
    if (!preferences) {
      return true;
    }

    // Check channel
    const channelEnabled = preferences.enabledChannels.includes(channel as any);
    if (!channelEnabled) {
      return false;
    }

    // Check type
    const typeEnabled = preferences.enabledTypes.includes(type as any);
    if (!typeEnabled) {
      return false;
    }

    return true;
  }

  /**
   * Maps entity to DTO.
   *
   * @param preferences - Preferences entity
   * @returns Preferences DTO
   */
  private mapToDto(preferences: NotificationPreferences): NotificationPreferencesDto {
    return {
      userId: preferences.userId,
      inAppEnabled: preferences.inAppEnabled,
      emailEnabled: preferences.emailEnabled,
      telegramEnabled: preferences.telegramEnabled,
      webPushEnabled: preferences.webPushEnabled,
      matchScheduledEnabled: preferences.matchScheduledEnabled,
      resultEnteredEnabled: preferences.resultEnteredEnabled,
      orderOfPlayPublishedEnabled: preferences.orderOfPlayPublishedEnabled,
      announcementEnabled: preferences.announcementEnabled,
      registrationConfirmedEnabled: preferences.registrationConfirmedEnabled,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    };
  }
}
