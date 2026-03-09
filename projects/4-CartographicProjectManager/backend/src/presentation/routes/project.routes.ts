/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/routes/project.routes.ts
 * @desc Project routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Router} from 'express';
import {ProjectController} from '../controllers/project.controller.js';
import {TaskController} from '../controllers/task.controller.js';
import {MessageController} from '../controllers/message.controller.js';
import {FileController} from '../controllers/file.controller.js';
import {authenticate, authorizeProjectMemberOrAdmin} from '@infrastructure/auth/auth.middleware.js';

export const projectRoutes = Router();
const controller = new ProjectController();
const taskController = new TaskController();
const messageController = new MessageController();
const fileController = new FileController();

projectRoutes.get('/', authenticate, controller.getAll.bind(controller));
projectRoutes.get('/summaries', authenticate, controller.getSummaries.bind(controller));
projectRoutes.get('/:id', authenticate, authorizeProjectMemberOrAdmin('id'), controller.getById.bind(controller));
projectRoutes.get('/code/:code', authenticate, controller.getByCode.bind(controller));
projectRoutes.post('/', authenticate, controller.create.bind(controller));
projectRoutes.put('/:id', authenticate, authorizeProjectMemberOrAdmin('id'), controller.update.bind(controller));
projectRoutes.delete('/:id', authenticate, authorizeProjectMemberOrAdmin('id'), controller.delete.bind(controller));

// Special user management
projectRoutes.post('/:id/special-users', authenticate, authorizeProjectMemberOrAdmin('id'), controller.addSpecialUser.bind(controller));
projectRoutes.put(
  '/:id/special-users/:userId/permissions',
  authenticate,
  authorizeProjectMemberOrAdmin('id'),
  controller.updateSpecialUserPermissions.bind(controller),
);
projectRoutes.get(
  '/:id/special-users/:userId/permissions',
  authenticate,
  authorizeProjectMemberOrAdmin('id'),
  controller.getSpecialUserPermissions.bind(controller),
);
projectRoutes.delete(
  '/:id/special-users/:userId',
  authenticate,
  authorizeProjectMemberOrAdmin('id'),
  controller.removeSpecialUser.bind(controller),
);

// Sub-resources
projectRoutes.get(
  '/:projectId/tasks',
  authenticate,
  authorizeProjectMemberOrAdmin('projectId'),
  taskController.getAll.bind(taskController)
);
projectRoutes.get(
  '/:projectId/messages/unread/count',
  authenticate,
  authorizeProjectMemberOrAdmin('projectId'),
  messageController.getUnreadCount.bind(messageController)
);
projectRoutes.get(
  '/:projectId/messages/count',
  authenticate,
  authorizeProjectMemberOrAdmin('projectId'),
  messageController.countByProjectId.bind(messageController)
);
projectRoutes.get(
  '/:projectId/messages',
  authenticate,
  authorizeProjectMemberOrAdmin('projectId'),
  messageController.getByProjectId.bind(messageController)
);
projectRoutes.post(
  '/:projectId/messages/mark-read',
  authenticate,
  authorizeProjectMemberOrAdmin('projectId'),
  messageController.markAsRead.bind(messageController)
);
projectRoutes.get(
  '/:projectId/files',
  authenticate,
  authorizeProjectMemberOrAdmin('projectId'),
  fileController.getByProjectId.bind(fileController)
);
