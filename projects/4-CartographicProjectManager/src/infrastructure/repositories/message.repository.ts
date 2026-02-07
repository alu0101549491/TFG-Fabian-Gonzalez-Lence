/**
 * @module infrastructure/repositories/message-repository
 * @description Concrete implementation of the IMessageRepository interface.
 * @category Infrastructure
 */

import {type IMessageRepository} from '@domain/repositories/message-repository.interface';
import {type Message} from '@domain/entities/message';

/**
 * HTTP-based implementation of the Message repository.
 */
export class MessageRepository implements IMessageRepository {
  async findById(id: string): Promise<Message | null> {
    // TODO: Implement API call GET /api/messages/:id
    throw new Error('Method not implemented.');
  }

  async save(message: Message): Promise<Message> {
    // TODO: Implement API call POST /api/messages
    throw new Error('Method not implemented.');
  }

  async findByProjectId(projectId: string): Promise<Message[]> {
    // TODO: Implement API call GET /api/projects/:projectId/messages
    throw new Error('Method not implemented.');
  }

  async countUnreadByUser(
    projectId: string,
    userId: string,
  ): Promise<number> {
    // TODO: Implement API call GET /api/projects/:projectId/messages/unread
    throw new Error('Method not implemented.');
  }
}
