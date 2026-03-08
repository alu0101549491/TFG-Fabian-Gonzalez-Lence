/**
 * @module domain/enumerations
 * @description Barrel export for all domain enumerations.
 * @category Domain
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
