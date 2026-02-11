/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file application/dto/export-filters.dto.ts
 * @desc Data Transfer Objects for export filtering.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {ProjectType} from '../../domain/enumerations/project-type';
import {ProjectStatus} from '../../domain/enumerations/project-status';
import {TaskStatus} from '../../domain/enumerations/task-status';
import {TaskPriority} from '../../domain/enumerations/task-priority';

/**
 * Supported export formats.
 */
export enum ExportFormat {
  /** Comma-separated values */
  CSV = 'CSV',
  /** Portable Document Format */
  PDF = 'PDF',
  /** Microsoft Excel format */
  EXCEL = 'EXCEL',
}

/**
 * Data types that can be exported.
 */
export enum ExportDataType {
  /** Export project list */
  PROJECTS = 'PROJECTS',
  /** Export task list */
  TASKS = 'TASKS',
  /** Export message history */
  MESSAGES = 'MESSAGES',
  /** Export complete project report with all related data */
  FULL_REPORT = 'FULL_REPORT',
}

/**
 * Filter criteria for export operations.
 */
export interface ExportFiltersDto {
  /** Type of data to export */
  readonly dataType: ExportDataType;
  /** Output format */
  readonly format: ExportFormat;

  /** Filter by date range start */
  readonly startDate?: Date;
  /** Filter by date range end */
  readonly endDate?: Date;

  /** Filter specific projects (by ID) */
  readonly projectIds?: string[];
  /** Filter by client ID */
  readonly clientId?: string;
  /** Filter by project type */
  readonly projectType?: ProjectType;
  /** Filter by project status */
  readonly projectStatus?: ProjectStatus;

  /** Filter by task status (when exporting tasks) */
  readonly taskStatus?: TaskStatus;
  /** Filter by task priority (when exporting tasks) */
  readonly taskPriority?: TaskPriority;
  /** Filter by task assignee (when exporting tasks) */
  readonly assigneeId?: string;

  /** Whether to include finalized projects */
  readonly includeFinalized?: boolean;
  /** Whether to include file metadata in export */
  readonly includeAttachments?: boolean;
}

/**
 * Pre-defined export filter preset.
 */
export interface ExportPresetDto {
  /** Unique preset identifier */
  readonly id: string;
  /** Preset name */
  readonly name: string;
  /** Preset description */
  readonly description: string;
  /** Pre-configured filters */
  readonly filters: ExportFiltersDto;
}

/**
 * Common export preset identifiers.
 */
export const EXPORT_PRESETS = {
  /** All active (non-finalized) projects */
  ALL_ACTIVE_PROJECTS: 'all_active_projects',
  /** Tasks from current month */
  CURRENT_MONTH_TASKS: 'current_month_tasks',
  /** All overdue tasks */
  OVERDUE_TASKS: 'overdue_tasks',
  /** Projects for a specific client */
  CLIENT_PROJECTS: 'client_projects',
} as const;
