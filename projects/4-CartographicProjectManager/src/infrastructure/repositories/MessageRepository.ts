import {IMessageRepository} from '@domain/repositories/IMessageRepository';
import {Message} from '@domain/entities/Message';

/**
 * Message repository implementation
 * Handles message data persistence
 */
export class MessageRepository implements IMessageRepository {
  async findById(id: string): Promise<Message | null> {
    // TODO: Implement find by id logic
    throw new Error('Method not implemented.');
  }

  async save(message: Message): Promise<Message> {
    // TODO: Implement save logic
    throw new Error('Method not implemented.');
  }

  async findByProjectId(projectId: string): Promise<Message[]> {
    // TODO: Implement find by project id logic
    throw new Error('Method not implemented.');
  }

  async countUnreadByUser(
      projectId: string,
      userId: string,
  ): Promise<number> {
    // TODO: Implement count unread logic
    throw new Error('Method not implemented.');
  }
}
