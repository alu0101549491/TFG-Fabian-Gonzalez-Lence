/**
 * @module domain/enumerations
 * @description Barrel export for all domain enumerations.
 * @category Domain
 */

// User Role
export {
  UserRole,
  UserRoleDisplayName,
  isValidUserRole,
  ALL_USER_ROLES,
} from './user-role';

// Project Status
export {
  ProjectStatus,
  ProjectStatusDisplayName,
  ProjectStatusColor,
  isValidProjectStatus,
  isActiveProjectStatus,
  ALL_PROJECT_STATUSES,
} from './project-status';

// Project Type
export {
  ProjectType,
  ProjectTypeDisplayName,
  isValidProjectType,
  ALL_PROJECT_TYPES,
} from './project-type';

// Task Status
export {
  TaskStatus,
  TaskStatusDisplayName,
  TaskStatusColor,
  TaskStatusTransitions,
  isValidTaskStatus,
  isValidTaskStatusTransition,
  isTerminalTaskStatus,
  ALL_TASK_STATUSES,
} from './task-status';

// Task Priority
export {
  TaskPriority,
  TaskPriorityDisplayName,
  TaskPriorityColor,
  TaskPrioritySortOrder,
  isValidTaskPriority,
  compareTaskPriority,
  ALL_TASK_PRIORITIES,
  TASK_PRIORITIES_BY_URGENCY,
} from './task-priority';

// Notification Type
export {
  NotificationType,
  NotificationTypeDisplayName,
  NotificationTypeMessageTemplate,
  NotificationTypeIcon,
  isValidNotificationType,
  ALL_NOTIFICATION_TYPES,
} from './notification-type';

// File Type
export {
  FileType,
  FileTypeDisplayName,
  FileExtensionToType,
  FileTypeIcon,
  isValidFileType,
  getFileTypeFromExtension,
  getExtensionsForFileType,
  ALL_FILE_TYPES,
} from './file-type';

// Access Right
export {
  AccessRight,
  AccessRightDisplayName,
  AccessRightDescription,
  isValidAccessRight,
  hasAccessRight,
  ALL_ACCESS_RIGHTS,
  READ_ONLY_ACCESS_RIGHTS,
  CONTRIBUTOR_ACCESS_RIGHTS,
} from './access-right';
