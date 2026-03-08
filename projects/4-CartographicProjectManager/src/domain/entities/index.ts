/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file src/domain/entities/index.ts
 * @desc Barrel exports for all Domain entities.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
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
