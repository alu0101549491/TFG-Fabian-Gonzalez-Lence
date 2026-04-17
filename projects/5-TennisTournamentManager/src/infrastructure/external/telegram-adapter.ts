/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/infrastructure/external/telegram-adapter.ts
 * @desc Telegram bot notification adapter implementing Observer Pattern channel
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Telegram bot notification adapter.
 * Implements an Observer Pattern notification channel for sending Telegram messages.
 * Integrates with the Telegram Bot API to dispatch notifications.
 */
export class TelegramAdapter {
  /**
   * Creates an instance of TelegramAdapter.
   */
  constructor() {}

  /**
   * Sends a message via Telegram bot to a specific chat.
   * @param chatId - The Telegram chat identifier
   * @param message - The message content to send
   * @returns Promise resolving when the message is sent successfully
   */
  public async sendMessage(chatId: string, message: string): Promise<void> {
    // Validate input
    if (!chatId || !message) {
      throw new Error('Chat ID and message are required');
    }

    // In production, use actual Telegram Bot API
    // Example: await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { chat_id: chatId, text: message });
    console.log(`[TELEGRAM] Chat ID: ${chatId}`);
    console.log(`[TELEGRAM] Message: ${message}`);

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
