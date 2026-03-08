/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file src/domain/repositories/index.ts
 * @desc Barrel exports for all Domain repository interfaces.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

export type {IUserRepository} from './user-repository.interface';
export type {IProjectRepository} from './project-repository.interface';
export type {ITaskRepository} from './task-repository.interface';
export type {IMessageRepository} from './message-repository.interface';
export type {INotificationRepository} from './notification-repository.interface';
export type {IFileRepository} from './file-repository.interface';
export type {IPermissionRepository} from './permission-repository.interface';
export type {ITaskHistoryRepository} from './task-history-repository.interface';
