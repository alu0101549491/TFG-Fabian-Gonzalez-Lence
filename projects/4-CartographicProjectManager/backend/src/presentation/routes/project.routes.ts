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
import {authenticate} from '@infrastructure/auth/auth.middleware.js';

export const projectRoutes = Router();
const controller = new ProjectController();
const taskController = new TaskController();
const messageController = new MessageController();
const fileController = new FileController();

projectRoutes.get('/', authenticate, controller.getAll.bind(controller));
projectRoutes.get('/:id', authenticate, controller.getById.bind(controller));
projectRoutes.get('/code/:code', authenticate, controller.getByCode.bind(controller));
projectRoutes.post('/', authenticate, controller.create.bind(controller));
projectRoutes.put('/:id', authenticate, controller.update.bind(controller));
projectRoutes.delete('/:id', authenticate, controller.delete.bind(controller));

// Special user management
projectRoutes.post('/:id/special-users', authenticate, controller.addSpecialUser.bind(controller));
projectRoutes.put('/:id/special-users/:userId/permissions', authenticate, controller.updateSpecialUserPermissions.bind(controller));
projectRoutes.get('/:id/special-users/:userId/permissions', authenticate, controller.getSpecialUserPermissions.bind(controller));
projectRoutes.delete('/:id/special-users/:userId', authenticate, controller.removeSpecialUser.bind(controller));

// Sub-resources
projectRoutes.get(
  '/:projectId/tasks',
  authenticate,
  taskController.getAll.bind(taskController)
);
projectRoutes.get(
  '/:projectId/messages/unread/count',
  authenticate,
  messageController.getUnreadCount.bind(messageController)
);
projectRoutes.get(
  '/:projectId/messages',
  authenticate,
  messageController.getByProjectId.bind(messageController)
);
projectRoutes.post(
  '/:projectId/messages/mark-read',
  authenticate,
  messageController.markAsRead.bind(messageController)
);
projectRoutes.get(
  '/:projectId/files',
  authenticate,
  fileController.getByProjectId.bind(fileController)
);
