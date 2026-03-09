/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/dto/project-details.dto.ts
 * @desc Data Transfer Objects for detailed project views.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {ProjectType} from '../../domain/enumerations/project-type';
import {ProjectStatus} from '../../domain/enumerations/project-status';
import {TaskStatus} from '../../domain/enumerations/task-status';
import {TaskPriority} from '../../domain/enumerations/task-priority';
import {UserRole} from '../../domain/enumerations/user-role';
import {AccessRight} from '../../domain/enumerations/access-right';
import {FileSummaryDto} from './file-data.dto';
import {ProjectStatusColor} from './project-data.dto';

/**
 * Complete project information for detail view.
 */
export interface ProjectDto {
  /** Unique project identifier */
  readonly id: string;
  /** Project code */
  readonly code: string;
  /** Project name */
  readonly name: string;
  /** Project year */
  readonly year: number;
  /** Project type */
  readonly type: ProjectType;
  /** Project description (optional) */
  readonly description: string | null;
  /** Client user ID */
  readonly clientId: string;
  /** Client name (denormalized) */
  readonly clientName: string;
  /** Creator user ID (who created the project) */
  readonly creatorId?: string;
  /** Longitude coordinate */
  readonly coordinateX: number | null;
  /** Latitude coordinate */
  readonly coordinateY: number | null;
  /** Contract start date */
  readonly contractDate: Date;
  /** Delivery deadline */
  readonly deliveryDate: Date;
  /** Current project status */
  readonly status: ProjectStatus;
  /** Dropbox folder ID/path (null when not available) */
  readonly dropboxFolderId: string | null;
  /** Generated Dropbox web URL for folder (null when not available) */
  readonly dropboxFolderUrl: string | null;
  /** Project creation timestamp */
  readonly createdAt: Date;
  /** Last update timestamp */
  readonly updatedAt: Date;
  /** Finalization timestamp (if finalized) */
  readonly finalizedAt: Date | null;
}

/**
 * Task summary for project detail view.
 */
export interface TaskSummaryDto {
  /** Unique task identifier */
  readonly id: string;
  /** Task description */
  readonly description: string;
  /** Assignee user ID */
  readonly assigneeId: string;
  /** Assignee name (denormalized) */
  readonly assigneeName: string;
  /** Creator user ID */
  readonly creatorId: string;
  /** Creator name (denormalized) */
  readonly creatorName: string;
  /** Current task status */
  readonly status: TaskStatus;
  /** Task priority level */
  readonly priority: TaskPriority;
  /** Task due date */
  readonly dueDate: Date;
  /** Whether task is overdue */
  readonly isOverdue: boolean;
  /** Whether task has file attachments */
  readonly hasAttachments: boolean;
  /** Number of file attachments */
  readonly attachmentCount: number;
  /** Task creation timestamp */
  readonly createdAt: Date;
}

/**
 * Message summary for project detail view.
 */
export interface MessageSummaryDto {
  /** Unique message identifier */
  readonly id: string;
  /** Sender user ID */
  readonly senderId: string;
  /** Sender name (denormalized) */
  readonly senderName: string;
  /** Full message content */
  readonly content: string;
  /** Truncated content preview for lists (first 100 chars) */
  readonly contentPreview: string;
  /** Message sent timestamp */
  readonly sentAt: Date;
  /** Whether message has file attachments */
  readonly hasAttachments: boolean;
  /** Number of file attachments */
  readonly attachmentCount: number;
  /** Whether current user has read this message */
  readonly isRead: boolean;
  /** Whether this is a system-generated message */
  readonly isSystemMessage: boolean;
}

/**
 * Participant information for project.
 */
export interface ParticipantDto {
  /** User ID */
  readonly userId: string;
  /** Username */
  readonly username: string;
  /** Email address */
  readonly email: string;
  /** User role */
  readonly role: UserRole;
  /** Participant type in this project */
  readonly participantType: 'owner' | 'client' | 'special_user';
  /** Access rights granted (for special users) */
  readonly permissions: AccessRight[];
  /** When user was added to project */
  readonly joinedAt: Date;
}

/**
 * Project section with organized files.
 */
export interface ProjectSectionDto {
  /** Section name */
  readonly name: string;
  /** Number of files in section */
  readonly fileCount: number;
  /** Array of file summaries */
  readonly files: FileSummaryDto[];
}

/**
 * Task statistics for project.
 */
export interface TaskStatsDto {
  /** Total number of tasks */
  readonly total: number;
  /** Number of pending tasks */
  readonly pending: number;
  /** Number of in-progress tasks */
  readonly inProgress: number;
  /** Number of completed tasks */
  readonly completed: number;
  /** Number of overdue tasks */
  readonly overdue: number;
}

/**
 * Current user permissions for project.
 */
export interface ProjectPermissionsDto {
  /** Can edit project details */
  readonly canEdit: boolean;
  /** Can delete project */
  readonly canDelete: boolean;
  /** Can finalize project */
  readonly canFinalize: boolean;
  /** Can create tasks */
  readonly canCreateTask: boolean;
  /** Can send messages */
  readonly canSendMessage: boolean;
  /** Can upload files */
  readonly canUploadFile: boolean;
  /** Can download files */
  readonly canDownloadFile: boolean;
  /** Can manage participants (add/remove special users) */
  readonly canManageParticipants: boolean;
}

/**
 * Complete project details response for detail view.
 */
export interface ProjectDetailsDto {
  /** Core project information */
  readonly project: ProjectDto;

  /** Task information */
  readonly tasks: TaskSummaryDto[];
  /** Task statistics */
  readonly taskStats: TaskStatsDto;

  /** Recent messages (limited to last 20) */
  readonly recentMessages: MessageSummaryDto[];
  /** Unread message count for current user */
  readonly unreadMessagesCount: number;
  /** Total message count */
  readonly totalMessagesCount: number;

  /** All project participants */
  readonly participants: ParticipantDto[];

  /** Files organized by section */
  readonly sections: ProjectSectionDto[];
  /** Total number of files in project */
  readonly totalFilesCount: number;

  /** Current user's permissions */
  readonly currentUserPermissions: ProjectPermissionsDto;

  /** UI status indicators */
  readonly statusColor: ProjectStatusColor;
  /** Whether project is past delivery date */
  readonly isOverdue: boolean;
  /** Days remaining until delivery (negative if overdue) */
  readonly daysUntilDelivery: number;
}
