/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/services/notification/channels/telegram-channel.adapter.ts
 * @desc Telegram notification channel adapter (sends via Telegram Bot API)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable} from '@angular/core';
import {INotificationChannelAdapter} from '@application/interfaces/notification-channel-adapter.interface';
import {Notification} from '@domain/entities/notification';

/**
 * Telegram notification channel adapter.
 * 
 * Sends notifications via Telegram Bot API.
 * Users must first connect their Telegram account by starting a chat
 * with the bot and providing their chat ID.
 * 
 * Configuration:
 * - BOT_TOKEN: Telegram bot token from @BotFather
 * - User entity: Should store telegramChatId for each user
 * 
 * @see https://core.telegram.org/bots/api#sendmessage
 */
@Injectable({providedIn: 'root'})
export class TelegramChannelAdapter implements INotificationChannelAdapter {
  // Configuration (should be injected from environment)
  // @ts-expect-error - Reserved for future Telegram Bot API integration
  private readonly botToken: string | null = null; // process.env.TELEGRAM_BOT_TOKEN
  // @ts-expect-error - Reserved for future Telegram Bot API integration
  private readonly apiBaseUrl: string = 'https://api.telegram.org/bot';

  /**
   * Sends a notification via Telegram Bot API.
   *
   * @param notification - The notification to send
   * @returns Promise resolving when message is sent
   * @throws Error if Telegram delivery fails
   */
  public async send(notification: Notification): Promise<void> {
    // Validate notification
    if (!notification) {
      throw new Error('Notification is required');
    }

    // Check if channel is configured
    if (!this.isAvailable()) {
      console.warn(`Telegram channel not configured. Skipping notification ${notification.id}`);
      return Promise.resolve();
    }

    try {
      // In a real implementation, this would:
      // 1. Fetch user's Telegram chat ID from UserRepository
      // 2. Format message with Markdown or HTML
      // 3. Send via Telegram Bot API sendMessage endpoint
      // 4. Handle delivery failures (user blocked bot, chat not found)

      // Example structure for Telegram API:
      // const chatId = await this.getUserTelegramChatId(notification.userId);
      // 
      // if (!chatId) {
      //   console.warn(`User ${notification.userId} has no Telegram chat ID configured`);
      //   return;
      // }
      // 
      // const messageData = {
      //   chat_id: chatId,
      //   text: this.formatMessage(notification),
      //   parse_mode: 'Markdown',
      //   disable_web_page_preview: true,
      // };
      // 
      // const url = `${this.apiBaseUrl}${this.botToken}/sendMessage`;
      // await axios.post(url, messageData);

      console.log(`[TelegramChannel] Sent notification ${notification.id}: ${notification.title}`);
      return Promise.resolve();
    } catch (error) {
      console.error(`[TelegramChannel] Failed to send notification ${notification.id}:`, error);
      throw new Error(`Telegram delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if the Telegram channel is available.
   * Telegram is available if a bot token is configured.
   *
   * @returns True if Telegram bot is configured
   */
  public isAvailable(): boolean {
    // In production, check for actual configuration
    // return !!this.botToken && this.botToken.length > 0;
    
    // For now, return false to indicate not configured
    return false;
  }

  /**
   * Formats a notification message for Telegram.
   * Uses Markdown formatting for better presentation.
   *
   * @param notification - The notification to format
   * @returns Formatted message for Telegram
   */
  // @ts-expect-error - Reserved for future Telegram Bot API integration
  private formatMessage(notification: Notification): string {
    // Telegram supports Markdown and HTML formatting
    return `
*${notification.title}*

${notification.message}

_Tennis Tournament Manager_
    `.trim();
  }

  /**
   * Retrieves a user's Telegram chat ID from the repository.
   * 
   * @param userId - The user ID
   * @returns Promise resolving to chat ID or null if not configured
   */
  // @ts-expect-error - Reserved for future Telegram Bot API integration
  private async getUserTelegramChatId(userId: string): Promise<string | null> {
    // In a real implementation, fetch from UserRepository
    // const user = await this.userRepository.findById(userId);
    // return user?.telegramChatId || null;
    
    return null;
  }
}
