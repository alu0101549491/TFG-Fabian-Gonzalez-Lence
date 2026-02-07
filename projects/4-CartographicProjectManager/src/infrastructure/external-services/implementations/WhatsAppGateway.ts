import {IWhatsAppGateway} from '../interfaces/IWhatsAppGateway';

/**
 * WhatsApp gateway implementation
 * Integrates with WhatsApp Business API
 */
export class WhatsAppGateway implements IWhatsAppGateway {
  async sendMessage(
      phoneNumber: string,
      message: string,
  ): Promise<boolean> {
    // TODO: Implement WhatsApp message sending
    throw new Error('Method not implemented.');
  }
}
