/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 24, 2026
 * @file application/dto/calendar-data.dto.ts
 * @desc Data Transfer Objects for calendar view operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {CalendarProjectDto} from './project-data.dto';
import type {CalendarTaskDto} from './task-data.dto';

/**
 * Type representing calendar items (projects or tasks).
 */
export type CalendarItemType = 'project' | 'task';

/**
 * Unified calendar item that can represent either a project or task.
 */
export interface CalendarItemDto {
  /** Item type discriminator */
  readonly type: CalendarItemType;
  /** Unique identifier */
  readonly id: string;
  /** Display title */
  readonly title: string;
  /** Subtitle/additional info */
  readonly subtitle: string;
  /** Date to display on calendar */
  readonly date: Date;
  /** Status color indicator */
  readonly statusColor: string;
  /** Whether item is overdue */
  readonly isOverdue: boolean;
  /** Original project data (if type === 'project') */
  readonly project?: CalendarProjectDto;
  /** Original task data (if type === 'task') */
  readonly task?: CalendarTaskDto;
}

/**
 * Calendar day with associated items.
 */
export interface CalendarDayDto {
  /** The date for this calendar day */
  readonly date: Date;
  /** Whether this day is in the currently displayed month */
  readonly isCurrentMonth: boolean;
  /** Whether this day is today */
  readonly isToday: boolean;
  /** Whether this day is a weekend */
  readonly isWeekend: boolean;
  /** Projects with delivery dates on this day */
  readonly projects: CalendarProjectDto[];
  /** Tasks with due dates on this day */
  readonly tasks: CalendarTaskDto[];
  /** All calendar items for this day */
  readonly items: CalendarItemDto[];
}
