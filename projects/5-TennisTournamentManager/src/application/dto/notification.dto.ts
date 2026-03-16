/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/notification.dto.ts
 * @desc Data transfer objects for notification-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {NotificationType} from '@domain/enumerations/notification-type';
import {NotificationChannel} from '@domain/enumerations/notification-channel';

/** DTO for sending a notification. */
export interface SendNotificationDto {
  recipientId: string;
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  message: string;
  referenceId?: string;
}

/** DTO for notification output representation. */
export interface NotificationDto {
  id: string;
  recipientId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  isRead: boolean;
  referenceId: string | null;
  createdAt: Date;
  readAt: Date | null;
}
