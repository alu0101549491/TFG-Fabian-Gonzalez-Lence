/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/dto/message-data.dto.ts
 * @desc Data Transfer Objects for message operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {UserRole} from '../../domain/enumerations/user-role';
import {FileSummaryDto} from './file-data.dto';

/**
 * Message type classification.
 */
export type MessageType = 'NORMAL' | 'SYSTEM';

/**
 * Input DTO for sending a new message.
 */
export interface CreateMessageDto {
  /** Project ID where message is sent */
  readonly projectId: string;
  /** Message content (max 5000 characters) */
  readonly content: string;
  /** Optional file attachment IDs */
  readonly fileIds?: string[];
}

/**
 * Complete message information.
 */
export interface MessageDto {
  /** Unique message identifier */
  readonly id: string;
  /** Parent project ID */
  readonly projectId: string;
  /** Sender user ID */
  readonly senderId: string;
  /** Sender name (denormalized) */
  readonly senderName: string;
  /** Sender role */
  readonly senderRole: UserRole;
  /** Full message content */
  readonly content: string;
  /** Message sent timestamp */
  readonly sentAt: Date;
  /** Array of file IDs attached */
  readonly fileIds: string[];
  /** File summaries for attachments */
  readonly files: FileSummaryDto[];
  /** Array of user IDs who have read this message */
  readonly readByUserIds: string[];
  /** Whether current user has read this message */
  readonly isRead: boolean;
  /** Whether this is a system-generated message */
  readonly isSystemMessage: boolean;
  /** Message type */
  readonly type: MessageType;
}

/**
 * Mark messages as read request.
 */
export interface MarkMessagesReadDto {
  /** Project ID */
  readonly projectId: string;
  /** Specific message IDs to mark as read (if empty, mark all) */
  readonly messageIds?: string[];
}

/**
 * Message list filter options.
 */
export interface MessageFilterDto {
  /** Project ID (required) */
  readonly projectId: string;
  /** Filter by sender ID */
  readonly senderId?: string;
  /** Whether to include system messages */
  readonly includeSystemMessages?: boolean;
  /** Filter unread messages only */
  readonly unreadOnly?: boolean;
  /** Filter by sent date start */
  readonly startDate?: Date;
  /** Filter by sent date end */
  readonly endDate?: Date;
  /** Page number (for pagination) */
  readonly page?: number;
  /** Items per page */
  readonly limit?: number;
}

/**
 * Paginated message list response.
 */
export interface MessageListResponseDto {
  /** Array of messages */
  readonly messages: MessageDto[];
  /** Total number of messages matching filters */
  readonly total: number;
  /** Current page number */
  readonly page: number;
  /** Items per page */
  readonly limit: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Unread message count for current user */
  readonly unreadCount: number;
}

/**
 * Unread message counts per project (for main screen badges).
 */
export interface UnreadCountsDto {
  /** Project ID */
  readonly projectId: string;
  /** Project code (denormalized) */
  readonly projectCode: string;
  /** Number of unread messages */
  readonly unreadCount: number;
}

/**
 * Re-export MessageSummaryDto from project-details for consistency.
 */
export type {MessageSummaryDto} from './project-details.dto';
