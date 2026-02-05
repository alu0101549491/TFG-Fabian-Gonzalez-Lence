import {Message} from '@domain/entities/Message';
import {MessageData} from '../../dtos/MessageData';

/**
 * Message service interface
 * Handles project messaging operations
 */
export interface IMessageService {
  /**
   * Sends a new message
   * @param messageData - Message data
   * @returns Created message entity
   */
  sendMessage(messageData: MessageData): Promise<Message>;

  /**
   * Gets messages for a project
   * @param projectId - Project ID
   * @param userId - Requesting user ID
   * @returns List of project messages
   */
  getMessagesByProject(projectId: string, userId: string): Promise<Message[]>;

  /**
   * Marks message as read
   * @param messageId - Message ID
   * @param userId - User ID
   */
  markMessageAsRead(messageId: string, userId: string): Promise<void>;

  /**
   * Gets unread message count
   * @param projectId - Project ID
   * @param userId - User ID
   * @returns Count of unread messages
   */
  getUnreadMessageCount(projectId: string, userId: string): Promise<number>;
}