import {Message} from '../entities/Message';

/**
 * Repository interface for Message entity persistence
 */
export interface IMessageRepository {
  /**
   * Finds a message by ID
   * @param id - Message ID
   * @returns Message entity or null if not found
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Saves a new message
   * @param message - Message entity to save
   * @returns Saved message entity
   */
  save(message: Message): Promise<Message>;

  /**
   * Finds messages for a project
   * @param projectId - Project ID
   * @returns List of project messages
   */
  findByProjectId(projectId: string): Promise<Message[]>;

  /**
   * Counts unread messages for a user in a project
   * @param projectId - Project ID
   * @param userId - User ID
   * @returns Count of unread messages
   */
  countUnreadByUser(projectId: string, userId: string): Promise<number>;
}