import {IMessageService} from '../interfaces/IMessageService';
import {IMessageRepository} from '@domain/repositories/IMessageRepository';
import {Message} from '@domain/entities/Message';
import {MessageData} from '../../dtos/MessageData';

/**
 * Message service implementation
 */
export class MessageService implements IMessageService {
  constructor(
    private readonly messageRepository: IMessageRepository,
  ) {}

  async sendMessage(messageData: MessageData): Promise<Message> {
    // TODO: Implement send message logic
    throw new Error('Method not implemented.');
  }

  async getMessagesByProject(
      projectId: string,
      userId: string,
  ): Promise<Message[]> {
    // TODO: Implement get messages logic
    throw new Error('Method not implemented.');
  }

  async markMessageAsRead(
      messageId: string,
      userId: string,
  ): Promise<void> {
    // TODO: Implement mark message as read logic
    throw new Error('Method not implemented.');
  }

  async getUnreadMessageCount(
      projectId: string,
      userId: string,
  ): Promise<number> {
    // TODO: Implement unread count logic
    throw new Error('Method not implemented.');
  }
}
