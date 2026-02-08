/**
 * @module application/dto/project-data
 * @description Data Transfer Objects for project operations.
 * @category Application
 */

import {ProjectType} from '../../domain/enumerations/project-type';
import {ProjectStatus} from '../../domain/enumerations/project-status';

/**
 * Project status color indicators for UI.
 */
export type ProjectStatusColor = 'red' | 'green' | 'yellow' | 'gray';

/**
 * Input DTO for creating a new project (all required fields).
 */
export interface CreateProjectDto {
  /** Project year in YYYY format (e.g., 2025) */
  readonly year: number;
  /** Unique project code (e.g., CART-2025-001) */
  readonly code: string;
  /** Project name (max 200 characters) */
  readonly name: string;
  /** Project category/type */
  readonly type: ProjectType;
  /** Assigned client user ID */
  readonly clientId: string;
  /** Longitude coordinate (optional) */
  readonly coordinateX: number | null;
  /** Latitude coordinate (optional) */
  readonly coordinateY: number | null;
  /** Contract start date */
  readonly contractDate: Date;
  /** Project deadline (must be >= contractDate) */
  readonly deliveryDate: Date;
  /** Dropbox folder path or ID */
  readonly dropboxFolderId: string;
}

/**
 * Input DTO for updating an existing project (all fields optional except id).
 */
export interface UpdateProjectDto {
  /** Project ID to update (required) */
  readonly id: string;
  /** Updated project name */
  readonly name?: string;
  /** Updated project type */
  readonly type?: ProjectType;
  /** Updated client assignment */
  readonly clientId?: string;
  /** Updated longitude */
  readonly coordinateX?: number | null;
  /** Updated latitude */
  readonly coordinateY?: number | null;
  /** Updated contract date */
  readonly contractDate?: Date;
  /** Updated delivery date */
  readonly deliveryDate?: Date;
  /** Updated Dropbox folder */
  readonly dropboxFolderId?: string;
  /** Updated project status */
  readonly status?: ProjectStatus;
}

/**
 * DTO for managing special users in a project.
 */
export interface ProjectSpecialUsersDto {
  /** Project ID */
  readonly projectId: string;
  /** Array of user IDs to add/set as special users */
  readonly userIds: string[];
}

/**
 * Output DTO for project list items (summary view).
 */
export interface ProjectSummaryDto {
  /** Unique project identifier */
  readonly id: string;
  /** Project code */
  readonly code: string;
  /** Project name */
  readonly name: string;
  /** Client user ID */
  readonly clientId: string;
  /** Client name (denormalized for display) */
  readonly clientName: string;
  /** Project type */
  readonly type: ProjectType;
  /** Delivery deadline */
  readonly deliveryDate: Date;
  /** Current project status */
  readonly status: ProjectStatus;
  /** Whether project has pending tasks */
  readonly hasPendingTasks: boolean;
  /** Count of pending tasks */
  readonly pendingTasksCount: number;
  /** Count of unread messages */
  readonly unreadMessagesCount: number;
  /** Total number of participants (client + special users) */
  readonly participantCount: number;
  /** Status indicator color for UI */
  readonly statusColor: ProjectStatusColor;
  /** Whether delivery date has passed */
  readonly isOverdue: boolean;
  /** Days remaining until delivery (negative if overdue) */
  readonly daysUntilDelivery: number;
}

/**
 * Output DTO for calendar view.
 */
export interface CalendarProjectDto {
  /** Unique project identifier */
  readonly id: string;
  /** Project code */
  readonly code: string;
  /** Project name */
  readonly name: string;
  /** Delivery deadline */
  readonly deliveryDate: Date;
  /** Current project status */
  readonly status: ProjectStatus;
  /** Whether project has pending tasks */
  readonly hasPendingTasks: boolean;
  /** Status indicator color for UI */
  readonly statusColor: ProjectStatusColor;
}

/**
 * Filter options for project queries.
 */
export interface ProjectFilterDto {
  /** Filter by project status */
  readonly status?: ProjectStatus;
  /** Filter by project type */
  readonly type?: ProjectType;
  /** Filter by client ID */
  readonly clientId?: string;
  /** Filter by year */
  readonly year?: number;
  /** Filter by delivery date start */
  readonly startDate?: Date;
  /** Filter by delivery date end */
  readonly endDate?: Date;
  /** Search term for code/name */
  readonly searchTerm?: string;
  /** Sort field */
  readonly sortBy?: 'deliveryDate' | 'code' | 'name' | 'createdAt';
  /** Sort order */
  readonly sortOrder?: 'asc' | 'desc';
  /** Page number (for pagination) */
  readonly page?: number;
  /** Items per page */
  readonly limit?: number;
}

/**
 * Paginated project list response.
 */
export interface ProjectListResponseDto {
  /** Array of project summaries */
  readonly projects: ProjectSummaryDto[];
  /** Total number of projects matching filters */
  readonly total: number;
  /** Current page number */
  readonly page: number;
  /** Items per page */
  readonly limit: number;
  /** Total number of pages */
  readonly totalPages: number;
}
