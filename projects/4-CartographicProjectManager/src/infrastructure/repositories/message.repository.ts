/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/repositories/message.repository.ts
 * @desc Message repository implementation using HTTP API backend communication
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {httpClient} from '../http';
import {Message} from '../../domain/entities/message';
import {type IMessageRepository} from '../../domain/repositories/message-repository.interface';

/**
 * API response type for message data from backend
 */
interface MessageApiResponse {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  sentAt: string;
  fileIds: string[];
  readByUserIds: string[];
  type: string;
  sender?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * Message repository implementation using HTTP API.
 *
 * Manages project communication messages with read status tracking,
 * file attachments, and pagination support.
 *
 * @example
 * ```typescript
 * const repository = new MessageRepository();
 * const unread = await repository.findUnreadByProjectAndUser('proj_1', 'user_1');
 * ```
 */
export class MessageRepository implements IMessageRepository {
  private readonly baseUrl = '/messages';

  /**
   * Find message by unique identifier
   *
   * @param id - Message ID
   * @returns Message entity or null if not found
   */
  public async findById(id: string): Promise<Message | null> {
    try {
      const response = await httpClient.get<MessageApiResponse>(
        `${this.baseUrl}/${id}`,
      );
      return this.mapToEntity(response.data);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new message
   *
   * @param message - Message entity to persist
   * @returns Created message with generated fields
   */
  public async save(message: Message): Promise<Message> {
    const response = await httpClient.post<MessageApiResponse>(
      this.baseUrl,
      this.mapToApiRequest(message),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Create new message from plain data
   *
   * @param data - Message data object
   * @returns Created message entity
   */
  public async create(data: {
    projectId: string;
    senderId: string;
    content: string;
    fileIds?: string[];
  }): Promise<Message> {
    const response = await httpClient.post<MessageApiResponse>(
      this.baseUrl,
      {
        projectId: data.projectId,
        senderId: data.senderId,
        content: data.content,
        fileIds: data.fileIds || [],
      },
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Update existing message
   *
   * @param message - Message entity with updated data
   * @returns Updated message entity
   */
  public async update(message: Message): Promise<Message> {
    const response = await httpClient.put<MessageApiResponse>(
      `${this.baseUrl}/${message.id}`,
      this.mapToApiRequest(message),
    );
    return this.mapToEntity(response.data);
  }

  /**
   * Delete message by ID
   *
   * @param id - Message ID to delete
   */
  public async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Find all messages in project
   *
   * @param projectId - Project ID
   * @returns Array of project messages
   */
  public async findByProjectId(projectId: string): Promise<Message[]> {
    const response = await httpClient.get<MessageApiResponse[]>(
      `/projects/${projectId}/messages`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find messages with pagination
   *
   * @param projectId - Project ID
   * @param limit - Maximum messages to return
   * @param offset - Number of messages to skip
   * @returns Array of paginated messages
   */
  public async findByProjectIdPaginated(
    projectId: string,
    limit: number,
    offset: number,
  ): Promise<Message[]> {
    const response = await httpClient.get<MessageApiResponse[]>(
      `/projects/${projectId}/messages?limit=${limit}&offset=${offset}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find messages sent by user
   *
   * @param senderId - Sender user ID
   * @returns Array of sender's messages
   */
  public async findBySenderId(senderId: string): Promise<Message[]> {
    const response = await httpClient.get<MessageApiResponse[]>(
      `${this.baseUrl}?senderId=${senderId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Find messages by project and sender
   *
   * @param projectId - Project ID
   * @param senderId - Sender user ID
   * @returns Array of matching messages
   */
  public async findByProjectIdAndSenderId(
    projectId: string,
    senderId: string,
  ): Promise<Message[]> {
    const response = await httpClient.get<MessageApiResponse[]>(
      `/projects/${projectId}/messages?senderId=${senderId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Count total messages in project
   *
   * @param projectId - Project ID
   * @returns Number of project messages
   */
  public async countByProjectId(projectId: string): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `/projects/${projectId}/messages/count`,
    );
    return response.data.count;
  }

  /**
   * Count unread messages for user in project
   *
   * @param projectId - Project ID
   * @param userId - User ID
   * @returns Number of unread messages
   */
  public async countUnreadByProjectAndUser(
    projectId: string,
    userId: string,
  ): Promise<number> {
    const response = await httpClient.get<{count: number}>(
      `/projects/${projectId}/messages/unread/count?userId=${userId}`,
    );
    return response.data.count;
  }

  /**
   * Find unread messages for user in project
   *
   * @param projectId - Project ID
   * @param userId - User ID
   * @returns Array of unread messages
   */
  public async findUnreadByProjectAndUser(
    projectId: string,
    userId: string,
  ): Promise<Message[]> {
    const response = await httpClient.get<MessageApiResponse[]>(
      `/projects/${projectId}/messages/unread?userId=${userId}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Mark all project messages as read by user
   *
   * @param projectId - Project ID
   * @param userId - User ID
   */
  public async markAsReadByProjectAndUser(
    projectId: string,
    userId: string,
  ): Promise<void> {
    await httpClient.post(
      `/projects/${projectId}/messages/mark-read`,
      {userId},
    );
  }

  /**
   * Delete all messages in project
   *
   * @param projectId - Project ID
   */
  public async deleteByProjectId(projectId: string): Promise<void> {
    await httpClient.delete(`/projects/${projectId}/messages`);
  }

  /**
   * Find latest messages in project
   *
   * @param projectId - Project ID
   * @param limit - Maximum messages to return
   * @returns Array of latest messages
   */
  public async findLatestByProjectId(
    projectId: string,
    limit: number,
  ): Promise<Message[]> {
    const response = await httpClient.get<MessageApiResponse[]>(
      `/projects/${projectId}/messages?latest=true&limit=${limit}`,
    );
    return response.data.map((data) => this.mapToEntity(data));
  }

  /**
   * Map API response to Message entity
   *
   * @param data - API response data
   * @returns Message domain entity
   */
  private mapToEntity(data: MessageApiResponse): Message {
    return new Message({
      id: data.id,
      projectId: data.projectId,
      senderId: data.senderId,
      senderName: data.sender?.username || 'Unknown User',
      senderRole: data.sender?.role || 'CLIENT',
      content: data.content,
      sentAt: new Date(data.sentAt),
      fileIds: data.fileIds || [],
      readByUserIds: data.readByUserIds || [],
      type: data.type as 'NORMAL' | 'SYSTEM',
    });
  }

  /**
   * Map Message entity to API request payload
   *
   * @param message - Message domain entity
   * @returns API request payload
   */
  private mapToApiRequest(message: Message): Record<string, unknown> {
    return {
      id: message.id,
      projectId: message.projectId,
      senderId: message.senderId,
      content: message.content,
      sentAt: message.sentAt.toISOString(),
      fileIds: message.fileIds,
      readByUserIds: message.readByUserIds,
      type: message.type,
    };
  }

  /**
   * Check if error is 404 Not Found
   *
   * @param error - Error object
   * @returns True if 404 error
   */
  private isNotFoundError(error: unknown): boolean {
    return (error as {status?: number})?.status === 404;
  }
}
