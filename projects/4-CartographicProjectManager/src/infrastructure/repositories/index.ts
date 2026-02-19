/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file src/infrastructure/repositories/index.ts
 * @desc Barrel export for repository implementations with factory functions and singletons
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Export repository classes
export {UserRepository} from './user.repository';
export {ProjectRepository} from './project.repository';
export {TaskRepository} from './task.repository';
export {TaskHistoryRepository} from './task-history.repository';
export {MessageRepository} from './message.repository';
export {NotificationRepository} from './notification.repository';
export {FileRepository} from './file.repository';
export {PermissionRepository} from './permission.repository';
export {AuthRepository} from './auth.repository';

// Import for type re-exports
import type {IUserRepository} from '../../domain/repositories/user-repository.interface';
import type {IProjectRepository} from '../../domain/repositories/project-repository.interface';
import type {ITaskRepository} from '../../domain/repositories/task-repository.interface';
import type {ITaskHistoryRepository} from '../../domain/repositories/task-history-repository.interface';
import type {IMessageRepository} from '../../domain/repositories/message-repository.interface';
import type {INotificationRepository} from '../../domain/repositories/notification-repository.interface';
import type {IFileRepository} from '../../domain/repositories/file-repository.interface';
import type {IPermissionRepository} from '../../domain/repositories/permission-repository.interface';

// Import implementation classes
import {UserRepository} from './user.repository';
import {ProjectRepository} from './project.repository';
import {TaskRepository} from './task.repository';
import {TaskHistoryRepository} from './task-history.repository';
import {MessageRepository} from './message.repository';
import {NotificationRepository} from './notification.repository';
import {FileRepository} from './file.repository';
import {PermissionRepository} from './permission.repository';

// Re-export interface types
export type {
  IUserRepository,
  IProjectRepository,
  ITaskRepository,
  ITaskHistoryRepository,
  IMessageRepository,
  INotificationRepository,
  IFileRepository,
  IPermissionRepository,
};

/**
 * Factory function for creating UserRepository instance
 *
 * @returns New UserRepository instance
 *
 * @example
 * ```typescript
 * const userRepo = createUserRepository();
 * const user = await userRepo.findById('user_123');
 * ```
 */
export function createUserRepository(): IUserRepository {
  return new UserRepository();
}

/**
 * Factory function for creating ProjectRepository instance
 *
 * @returns New ProjectRepository instance
 *
 * @example
 * ```typescript
 * const projectRepo = createProjectRepository();
 * const projects = await projectRepo.findByClientId('client_123');
 * ```
 */
export function createProjectRepository(): IProjectRepository {
  return new ProjectRepository();
}

/**
 * Factory function for creating TaskRepository instance
 *
 * @returns New TaskRepository instance
 *
 * @example
 * ```typescript
 * const taskRepo = createTaskRepository();
 * const tasks = await taskRepo.findByProjectId('proj_123');
 * ```
 */
export function createTaskRepository(): ITaskRepository {
  return new TaskRepository();
}

/**
 * Factory function for creating TaskHistoryRepository instance
 *
 * @returns New TaskHistoryRepository instance
 *
 * @example
 * ```typescript
 * const historyRepo = createTaskHistoryRepository();
 * const history = await historyRepo.findByTaskId('task_123');
 * ```
 */
export function createTaskHistoryRepository(): ITaskHistoryRepository {
  return new TaskHistoryRepository();
}

/**
 * Factory function for creating MessageRepository instance
 *
 * @returns New MessageRepository instance
 *
 * @example
 * ```typescript
 * const messageRepo = createMessageRepository();
 * const messages = await messageRepo.findByProjectId('proj_123');
 * ```
 */
export function createMessageRepository(): IMessageRepository {
  return new MessageRepository();
}

/**
 * Factory function for creating NotificationRepository instance
 *
 * @returns New NotificationRepository instance
 *
 * @example
 * ```typescript
 * const notificationRepo = createNotificationRepository();
 * const unread = await notificationRepo.findUnreadByUserId('user_123');
 * ```
 */
export function createNotificationRepository(): INotificationRepository {
  return new NotificationRepository();
}

/**
 * Factory function for creating FileRepository instance
 *
 * @returns New FileRepository instance
 *
 * @example
 * ```typescript
 * const fileRepo = createFileRepository();
 * const files = await fileRepo.findByProjectId('proj_123');
 * ```
 */
export function createFileRepository(): IFileRepository {
  return new FileRepository();
}

/**
 * Factory function for creating PermissionRepository instance
 *
 * @returns New PermissionRepository instance
 *
 * @example
 * ```typescript
 * const permissionRepo = createPermissionRepository();
 * const permission = await permissionRepo.findByUserAndProject('user_1', 'proj_1');
 * ```
 */
export function createPermissionRepository(): IPermissionRepository {
  return new PermissionRepository();
}

/**
 * Singleton instances with lazy initialization
 */
let userRepository: IUserRepository | null = null;
let projectRepository: IProjectRepository | null = null;
let taskRepository: ITaskRepository | null = null;
let taskHistoryRepository: ITaskHistoryRepository | null = null;
let messageRepository: IMessageRepository | null = null;
let notificationRepository: INotificationRepository | null = null;
let fileRepository: IFileRepository | null = null;
let permissionRepository: IPermissionRepository | null = null;

/**
 * Singleton repository instances for application-wide use.
 * Repositories are lazily initialized on first access.
 *
 * @example
 * ```typescript
 * import { repositories } from '@/infrastructure/repositories';
 *
 * // Access singleton instances
 * const user = await repositories.user.findById('user_123');
 * const projects = await repositories.project.findAll();
 * const tasks = await repositories.task.findByProjectId('proj_123');
 * ```
 */
export const repositories = {
  /**
   * Get singleton UserRepository instance
   *
   * @returns UserRepository singleton
   */
  get user(): IUserRepository {
    if (!userRepository) {
      userRepository = new UserRepository();
    }
    return userRepository;
  },

  /**
   * Get singleton ProjectRepository instance
   *
   * @returns ProjectRepository singleton
   */
  get project(): IProjectRepository {
    if (!projectRepository) {
      projectRepository = new ProjectRepository();
    }
    return projectRepository;
  },

  /**
   * Get singleton TaskRepository instance
   *
   * @returns TaskRepository singleton
   */
  get task(): ITaskRepository {
    if (!taskRepository) {
      taskRepository = new TaskRepository();
    }
    return taskRepository;
  },

  /**
   * Get singleton TaskHistoryRepository instance
   *
   * @returns TaskHistoryRepository singleton
   */
  get taskHistory(): ITaskHistoryRepository {
    if (!taskHistoryRepository) {
      taskHistoryRepository = new TaskHistoryRepository();
    }
    return taskHistoryRepository;
  },

  /**
   * Get singleton MessageRepository instance
   *
   * @returns MessageRepository singleton
   */
  get message(): IMessageRepository {
    if (!messageRepository) {
      messageRepository = new MessageRepository();
    }
    return messageRepository;
  },

  /**
   * Get singleton NotificationRepository instance
   *
   * @returns NotificationRepository singleton
   */
  get notification(): INotificationRepository {
    if (!notificationRepository) {
      notificationRepository = new NotificationRepository();
    }
    return notificationRepository;
  },

  /**
   * Get singleton FileRepository instance
   *
   * @returns FileRepository singleton
   */
  get file(): IFileRepository {
    if (!fileRepository) {
      fileRepository = new FileRepository();
    }
    return fileRepository;
  },

  /**
   * Get singleton PermissionRepository instance
   *
   * @returns PermissionRepository singleton
   */
  get permission(): IPermissionRepository {
    if (!permissionRepository) {
      permissionRepository = new PermissionRepository();
    }
    return permissionRepository;
  },
};
