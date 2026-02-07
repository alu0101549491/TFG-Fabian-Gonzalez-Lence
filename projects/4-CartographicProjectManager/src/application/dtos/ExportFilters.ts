import {ProjectStatus} from '@domain/enums/ProjectStatus';
import {TaskStatus} from '@domain/enums/TaskStatus';

/**
 * Export filters DTO
 */
export interface ExportFilters {
  projectIds?: string[];
  projectStatus?: ProjectStatus[];
  taskStatus?: TaskStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  format: 'CSV' | 'PDF' | 'EXCEL';
}
