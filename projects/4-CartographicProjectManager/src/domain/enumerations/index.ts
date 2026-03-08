/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file src/domain/enumerations/index.ts
 * @desc Barrel exports for all Domain enumerations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// User Role
export {
  UserRole,
  isValidUserRole,
  ALL_USER_ROLES,
} from './user-role';

// Project Status
export {
  ProjectStatus,
  isValidProjectStatus,
  isActiveProjectStatus,
  ALL_PROJECT_STATUSES,
} from './project-status';

// Project Type
export {
  ProjectType,
  isValidProjectType,
  ALL_PROJECT_TYPES,
} from './project-type';

// Task Status
export {
  TaskStatus,
  TaskStatusTransitions,
  isValidTaskStatus,
  isValidTaskStatusTransition,
  isTerminalTaskStatus,
  ALL_TASK_STATUSES,
} from './task-status';

// Task Priority
export {
  TaskPriority,
  TaskPrioritySortOrder,
  isValidTaskPriority,
  compareTaskPriority,
  ALL_TASK_PRIORITIES,
  TASK_PRIORITIES_BY_URGENCY,
} from './task-priority';

// Notification Type
export {
  NotificationType,
  isValidNotificationType,
  ALL_NOTIFICATION_TYPES,
} from './notification-type';

// File Type
export {
  FileType,
  FileExtensionToType,
  isValidFileType,
  getFileTypeFromExtension,
  getExtensionsForFileType,
  ALL_FILE_TYPES,
} from './file-type';

// Access Right
export {
  AccessRight,
  isValidAccessRight,
  hasAccessRight,
  ALL_ACCESS_RIGHTS,
  READ_ONLY_ACCESS_RIGHTS,
  CONTRIBUTOR_ACCESS_RIGHTS,
} from './access-right';
