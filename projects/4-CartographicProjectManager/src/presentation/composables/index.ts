/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/composables/index.ts
 * @desc Barrel export for all Vue composables
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://vuejs.org/guide/reusability/composables.html}
 */

// Authentication composable
export {useAuth} from './use-auth';
export type {UseAuthReturn, LoginResult} from './use-auth';

// Project management composable
export {useProjects} from './use-projects';
export type {
  UseProjectsReturn,
  CreateProjectResult,
  UpdateProjectResult,
  DeleteProjectResult,
} from './use-projects';

// Task management composable
export {useTasks} from './use-tasks';
export type {
  UseTasksReturn,
  CreateTaskResult,
  UpdateTaskResult,
  TaskSortOption,
} from './use-tasks';

// Messaging composable
export {useMessages} from './use-messages';
export type {UseMessagesReturn, SendMessageResult} from './use-messages';

// Notification composable
export {useNotifications} from './use-notifications';
export type {UseNotificationsReturn} from './use-notifications';
