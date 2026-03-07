/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/routes/message.routes.ts
 * @desc Message routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Router} from 'express';
import {MessageController} from '../controllers/message.controller.js';
import {authenticate} from '@infrastructure/auth/auth.middleware.js';

export const messageRoutes = Router();
const controller = new MessageController();

messageRoutes.get('/project/:projectId', authenticate, controller.getByProjectId.bind(controller));
messageRoutes.post('/', authenticate, controller.create.bind(controller));
