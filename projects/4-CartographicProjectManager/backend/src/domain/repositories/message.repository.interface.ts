/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/domain/repositories/message.repository.interface.ts
 * @desc Message repository interface for data access
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Message} from '@prisma/client';

/**
 * Message repository interface
 */
export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  findByProjectId(projectId: string): Promise<Message[]>;
  findBySenderId(senderId: string): Promise<Message[]>;
  create(data: Omit<Message, 'id' | 'sentAt'>): Promise<Message>;
  delete(id: string): Promise<void>;
  countUnreadByProjectAndUser(projectId: string, userId: string): Promise<number>;
  markAllAsRead(projectId: string, userId: string): Promise<void>;
}
