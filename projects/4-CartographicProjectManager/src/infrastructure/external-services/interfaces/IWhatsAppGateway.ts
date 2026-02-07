/**
 * WhatsApp gateway interface
 * Handles WhatsApp message sending
 */
export interface IWhatsAppGateway {
  /**
   * Sends WhatsApp message
   * @param phoneNumber - Recipient phone number
   * @param message - Message content
   * @returns True if sent successfully
   */
  sendMessage(phoneNumber: string, message: string): Promise<boolean>;
}
