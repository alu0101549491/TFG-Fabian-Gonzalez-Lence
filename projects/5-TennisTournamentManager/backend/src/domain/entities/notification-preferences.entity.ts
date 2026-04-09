/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file domain/entities/notification-preferences.entity.ts
 * @desc Entity representing user notification preferences for channels and event types.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import {User} from './user.entity';
import {NotificationChannel} from '../enumerations/notification-channel';
import {NotificationType} from '../enumerations/notification-type';

/**
 * Entity representing user notification preferences.
 * Allows users to control which notification channels and event types they want to receive.
 */
@Entity('notification_preferences')
export class NotificationPreferences {
  /**
   * User ID - same as the user this preference belongs to (one-to-one relationship).
   */
  @PrimaryColumn('varchar', {length: 255})
  public userId!: string;

  /**
   * The user this preference belongs to.
   */
  @ManyToOne(() => User, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  public user!: User;

  /**
   * Enabled notification channels.
   * User will only receive notifications through these channels.
   */
  @Column('simple-array')
  public enabledChannels!: NotificationChannel[];

  /**
   * Enabled notification types.
   * User will only receive notifications for these event types.
   */
  @Column('simple-array')
  public enabledTypes!: NotificationType[];

  /**
   * Whether to receive in-app notifications.
   */
  @Column('boolean', {default: true})
  public inAppEnabled!: boolean;

  /**
   * Whether to receive email notifications.
   */
  @Column('boolean', {default: false})
  public emailEnabled!: boolean;

  /**
   * Whether to receive Telegram notifications.
   */
  @Column('boolean', {default: false})
  public telegramEnabled!: boolean;

  /**
   * Whether to receive web push notifications.
   */
  @Column('boolean', {default: false})
  public webPushEnabled!: boolean;

  /**
   * Whether to receive match scheduled notifications.
   */
  @Column('boolean', {default: true})
  public matchScheduledEnabled!: boolean;

  /**
   * Whether to receive result entered notifications.
   */
  @Column('boolean', {default: true})
  public resultEnteredEnabled!: boolean;

  /**
   * Whether to receive order of play published notifications.
   */
  @Column('boolean', {default: true})
  public orderOfPlayPublishedEnabled!: boolean;

  /**
   * Whether to receive announcement notifications.
   */
  @Column('boolean', {default: true})
  public announcementEnabled!: boolean;

  /**
   * Whether to receive registration confirmed notifications.
   */
  @Column('boolean', {default: true})
  public registrationConfirmedEnabled!: boolean;

  /**
   * Timestamp when the preferences were created.
   */
  @CreateDateColumn()
  public createdAt!: Date;

  /**
   * Timestamp when the preferences were last updated.
   */
  @UpdateDateColumn()
  public updatedAt!: Date;

  /**
   * Creates default notification preferences for a user.
   * By default, all in-app notifications are enabled, email/telegram/webpush are disabled.
   *
   * @param userId - User ID
   * @returns Default notification preferences
   */
  public static createDefault(userId: string): NotificationPreferences {
    const preferences = new NotificationPreferences();
    preferences.userId = userId;
    preferences.enabledChannels = [NotificationChannel.IN_APP];
    preferences.enabledTypes = [
      NotificationType.REGISTRATION_CONFIRMED,
      NotificationType.MATCH_SCHEDULED,
      NotificationType.RESULT_ENTERED,
      NotificationType.ORDER_OF_PLAY_PUBLISHED,
      NotificationType.ANNOUNCEMENT,
    ];
    
    // Channel toggles (default: only in-app enabled)
    preferences.inAppEnabled = true;
    preferences.emailEnabled = false;
    preferences.telegramEnabled = false;
    preferences.webPushEnabled = false;
    
    // Event type toggles (default: all enabled)
    preferences.matchScheduledEnabled = true;
    preferences.resultEnteredEnabled = true;
    preferences.orderOfPlayPublishedEnabled = true;
    preferences.announcementEnabled = true;
    preferences.registrationConfirmedEnabled = true;
    
    return preferences;
  }

  /**
   * Checks if a specific notification channel is enabled.
   *
   * @param channel - Notification channel to check
   * @returns True if the channel is enabled
   */
  public isChannelEnabled(channel: NotificationChannel): boolean {
    return this.enabledChannels.includes(channel);
  }

  /**
   * Checks if a specific notification type is enabled.
   *
   * @param type - Notification type to check
   * @returns True if the type is enabled
   */
  public isTypeEnabled(type: NotificationType): boolean {
    return this.enabledTypes.includes(type);
  }

  /**
   * Updates enabled channels based on individual channel toggles.
   */
  public updateEnabledChannels(): void {
    this.enabledChannels = [];
    if (this.inAppEnabled) this.enabledChannels.push(NotificationChannel.IN_APP);
    if (this.emailEnabled) this.enabledChannels.push(NotificationChannel.EMAIL);
    if (this.telegramEnabled) this.enabledChannels.push(NotificationChannel.TELEGRAM);
    if (this.webPushEnabled) this.enabledChannels.push(NotificationChannel.WEB_PUSH);
  }

  /**
   * Updates enabled types based on individual type toggles.
   */
  public updateEnabledTypes(): void {
    this.enabledTypes = [];
    if (this.registrationConfirmedEnabled) {
      this.enabledTypes.push(NotificationType.REGISTRATION_CONFIRMED);
    }
    if (this.matchScheduledEnabled) {
      this.enabledTypes.push(NotificationType.MATCH_SCHEDULED);
    }
    if (this.resultEnteredEnabled) {
      this.enabledTypes.push(NotificationType.RESULT_ENTERED);
    }
    if (this.orderOfPlayPublishedEnabled) {
      this.enabledTypes.push(NotificationType.ORDER_OF_PLAY_PUBLISHED);
    }
    if (this.announcementEnabled) {
      this.enabledTypes.push(NotificationType.ANNOUNCEMENT);
    }
  }
}
