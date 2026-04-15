/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 9, 2026
 * @file backend/src/infrastructure/telegram/telegram.service.ts
 * @desc Telegram notification service for sending notifications via Telegram Bot API.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://core.telegram.org/bots/api}
 */

import TelegramBot from 'node-telegram-bot-api';
import {config} from '../../shared/config';
import {NotificationType} from '../../domain/enumerations/notification-type';

/**
 * Service for sending notifications via Telegram Bot API.
 * Handles message formatting, inline buttons, and emoji icons.
 */
export class TelegramService {
  /**
   * Telegram bot instance.
   */
  private bot: TelegramBot | null = null;

  /**
   * Initializes the Telegram service with bot token from config.
   * If no token is configured, the service will not initialize.
   */
  public constructor() {
    this.initializeBot();
  }

  /**
   * Initializes the Telegram bot instance.
   * Logs initialization status and any errors.
   *
   * @private
   */
  private initializeBot(): void {
    try {
      const botToken = config.telegram.botToken;

      if (!botToken) {
        console.log('⚠️ Telegram bot token not configured - Telegram notifications disabled');
        return;
      }

      this.bot = new TelegramBot(botToken, {polling: false});
      console.log('✅ Telegram bot initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error);
      this.bot = null;
    }
  }

  /**
   * Sends a notification message to a Telegram user.
   * Includes emoji icon, formatted message, and inline action button.
   *
   * @param chatId - Telegram chat ID of the recipient
   * @param type - Type of notification
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Optional metadata for action links
   */
  public async sendNotificationMessage(
    chatId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.bot) {
      console.log('⚠️ Telegram bot not initialized - skipping message');
      return;
    }

    try {
      const emoji = this.getNotificationEmoji(type);
      const actionButton = this.getActionButton(type, metadata);

      // Build message text with emoji and formatting
      const messageText = `${emoji} *${title}*\n\n${message}`;

      // Send message with Markdown formatting and inline button
      await this.bot.sendMessage(chatId, messageText, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[actionButton]],
        },
      });

      console.log(`✅ Telegram notification sent to chatId: ${chatId} - ${type}`);
    } catch (error) {
      // Non-blocking: Telegram failures should not prevent notification creation
      console.error(`❌ Failed to send Telegram notification to ${chatId}:`, error);
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
   * Builds an inline keyboard button with action link.
   * Link points to the app with context-specific deep linking.
   *
   * @param type - Notification type
   * @param metadata - Notification metadata
   * @returns Telegram inline keyboard button
   * @private
   */
  private getActionButton(
    type: NotificationType,
    metadata?: Record<string, unknown>,
  ): TelegramBot.InlineKeyboardButton {
    const appUrl = config.email.appUrl || 'http://localhost:4200';
    let url = appUrl;
    let text = 'Open App';

    if (metadata) {
      switch (type) {
        case NotificationType.REGISTRATION_CONFIRMED:
          if (metadata.tournamentId) {
            url = `${appUrl}/tournaments/${metadata.tournamentId}`;
            text = 'View Tournament';
          }
          break;
        case NotificationType.MATCH_SCHEDULED:
        case NotificationType.RESULT_ENTERED:
          if (metadata.matchId) {
            url = `${appUrl}/matches/${metadata.matchId}`;
            text = 'View Match';
          }
          break;
        case NotificationType.ORDER_OF_PLAY_PUBLISHED:
          if (metadata.tournamentId) {
            url = `${appUrl}/tournaments/${metadata.tournamentId}`;
            text = 'View Schedule';
          }
          break;
        case NotificationType.ANNOUNCEMENT:
          if (metadata.announcementId) {
            url = `${appUrl}/announcements?id=${metadata.announcementId}`;
            text = 'Read Announcement';
          }
          break;
      }
    }

    return {text, url};
  }

  /**
   * Verifies the Telegram bot connection.
   * Useful for testing bot token validity.
   *
   * @returns True if bot is initialized and can connect
   */
  public async verifyConnection(): Promise<boolean> {
    if (!this.bot) {
      console.log('⚠️ Telegram bot not initialized');
      return false;
    }

    try {
      const botInfo = await this.bot.getMe();
      console.log(`✅ Telegram bot connected: @${botInfo.username}`);
      return true;
    } catch (error) {
      console.error('❌ Telegram bot connection failed:', error);
      return false;
    }
  }
}
