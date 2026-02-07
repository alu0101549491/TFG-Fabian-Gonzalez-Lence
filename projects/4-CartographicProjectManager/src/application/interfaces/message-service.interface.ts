/**
 * @module application/interfaces/message-service
 * @description Interface for the Message Service.
 * Defines the contract for project-scoped internal messaging.
 * @category Application
 */

import {type Message} from '@domain/entities/message';
import {type MessageData} from '../dto/message-data.dto';

/**
 * Contract for messaging operations.
 * Handles sending, retrieving, and marking messages within projects.
 */
export interface IMessageService {
  /**
   * Sends a new message within a project.
   * @param messageData - Data for the new message.
   * @returns The created message entity.
   */
  sendMessage(messageData: MessageData): Promise<Message>;

  /**
   * Retrieves all messages for a specific project.
   * @param projectId - The project's unique ID.
   * @param userId - The requesting user's ID (for access control).
   * @returns Array of messages, ordered chronologically.
   */
  getMessagesByProject(projectId: string, userId: string): Promise<Message[]>;

  /**
   * Marks a message as read by a specific user.
   * @param messageId - The message's unique ID.
   * @param userId - The ID of the user marking it as read.
   */
  markMessageAsRead(messageId: string, userId: string): Promise<void>;

  /**
   * Gets the count of unread messages for a user in a project.
   * @param projectId - The project's unique ID.
   * @param userId - The user's unique ID.
   * @returns The number of unread messages.
   */
  getUnreadMessageCount(projectId: string, userId: string): Promise<number>;
}
