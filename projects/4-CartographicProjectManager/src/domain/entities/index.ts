/**
 * @module domain/entities
 * @description Barrel export for all domain entities.
 * @category Domain
 */

// User Entity
export {User, type UserProps} from './user';

// Project Entity
export {Project, type ProjectProps} from './project';

// Task Entity
export {Task, type TaskProps} from './task';

// TaskHistory Entity
export {TaskHistory, type TaskHistoryProps} from './task-history';

// Message Entity
export {Message, type MessageProps, type MessageType} from './message';

// Notification Entity
export {Notification, type NotificationProps} from './notification';

// File Entity
export {File, type FileProps} from './file';

// Permission Entity
export {Permission, type PermissionProps, PROJECT_SECTIONS} from './permission';
