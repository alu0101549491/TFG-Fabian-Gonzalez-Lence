/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/domain/repositories/notification.repository.interface.ts
 * @desc Notification repository interface for data access
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Notification, NotificationType} from '@prisma/client';

/**
 * Notification repository interface
 */
export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  create(data: Omit<Notification, 'id' | 'createdAt' | 'readAt'>): Promise<Notification>;
  markAsRead(id: string): Promise<Notification>;
  delete(id: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}
