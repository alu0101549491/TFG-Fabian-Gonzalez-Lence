/**
 * @module application/dto/project-details
 * @description Data Transfer Object for detailed project view.
 * @category Application
 */

import {type Project} from '@domain/entities/project';
import {type Task} from '@domain/entities/task';
import {type Message} from '@domain/entities/message';

/**
 * Comprehensive project details for the presentation layer.
 */
export interface ProjectDetails {
  /** The project entity. */
  project: Project;
  /** List of tasks within the project. */
  tasks: Task[];
  /** Recent messages in the project. */
  recentMessages: Message[];
  /** Number of unread messages for the requesting user. */
  unreadMessagesCount: number;
  /** Whether the requesting user can edit this project. */
  canEdit: boolean;
}
