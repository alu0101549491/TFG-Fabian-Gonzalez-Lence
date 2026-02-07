/**
 * @module application/dto/export-filters
 * @description Data Transfer Object for data export filtering.
 * @category Application
 */

import {ProjectStatus} from '@domain/enumerations/project-status';
import {TaskStatus} from '@domain/enumerations/task-status';

/**
 * Filters for exporting project and task data.
 */
export interface ExportFilters {
  /** Filter by date range start. */
  dateFrom?: Date;
  /** Filter by date range end. */
  dateTo?: Date;
  /** Filter by project status. */
  projectStatus?: ProjectStatus;
  /** Filter by task status. */
  taskStatus?: TaskStatus;
  /** Filter by client ID. */
  clientId?: string;
  /** Export format (csv, pdf). */
  format: 'csv' | 'pdf';
}
