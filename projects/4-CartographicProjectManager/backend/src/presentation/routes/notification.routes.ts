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
import {authenticate} from '@infrastructure/auth/auth.middleware.js';

export const notificationRoutes = Router();
const controller = new NotificationController();

// Support both query param and path param for userId (handled in controller)
notificationRoutes.get('/', authenticate, controller.getByUserId.bind(controller));
notificationRoutes.get('/user/:userId', authenticate, controller.getByUserId.bind(controller));
notificationRoutes.put('/:id/read', authenticate, controller.markAsRead.bind(controller));
notificationRoutes.delete('/:id', authenticate, controller.delete.bind(controller));
