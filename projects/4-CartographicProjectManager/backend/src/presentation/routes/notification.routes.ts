/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/routes/notification.routes.ts
 * @desc Notification routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Router} from 'express';
import {NotificationController} from '../controllers/notification.controller.js';
import {
	authenticate,
	authorizeNotificationOwnerOrAdmin,
	authorizeUserIdParamOrQueryOrAdmin,
} from '@infrastructure/auth/auth.middleware.js';

export const notificationRoutes = Router();
const controller = new NotificationController();

// Count endpoint (used by frontend unread badge logic)
notificationRoutes.get(
	'/count',
	authenticate,
	authorizeUserIdParamOrQueryOrAdmin('userId'),
	controller.count.bind(controller),
);

// Mark all as read (optional helper used by some clients)
notificationRoutes.post(
	'/mark-all-read',
	authenticate,
	controller.markAllAsRead.bind(controller),
);

// Create notification (admin-only; primarily for internal tooling/testing)
notificationRoutes.post(
	'/',
	authenticate,
	controller.create.bind(controller),
);

// Support both query param and path param for userId (handled in controller)
notificationRoutes.get(
	'/',
	authenticate,
	authorizeUserIdParamOrQueryOrAdmin('userId'),
	controller.getByUserId.bind(controller),
);
notificationRoutes.get(
	'/user/:userId',
	authenticate,
	authorizeUserIdParamOrQueryOrAdmin('userId'),
	controller.getByUserId.bind(controller),
);
notificationRoutes.put(
	'/:id/read',
	authenticate,
	authorizeNotificationOwnerOrAdmin('id'),
	controller.markAsRead.bind(controller),
);
// Alias to match frontend repository contract
notificationRoutes.post(
  '/:id/read',
  authenticate,
  authorizeNotificationOwnerOrAdmin('id'),
  controller.markAsRead.bind(controller),
);

notificationRoutes.get(
  '/:id',
  authenticate,
  authorizeNotificationOwnerOrAdmin('id'),
  controller.getById.bind(controller),
);
notificationRoutes.delete(
	'/:id',
	authenticate,
	authorizeNotificationOwnerOrAdmin('id'),
	controller.delete.bind(controller),
);
