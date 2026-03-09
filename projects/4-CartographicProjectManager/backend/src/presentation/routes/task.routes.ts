/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/routes/task.routes.ts
 * @desc Task routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Router} from 'express';
import {TaskController} from '../controllers/task.controller.js';
import {
	authenticate,
	authorizeProjectMemberOrAdminFromBody,
	authorizeTaskMemberOrAdmin,
} from '@infrastructure/auth/auth.middleware.js';

export const taskRoutes = Router();
const controller = new TaskController();

taskRoutes.get('/', authenticate, controller.getAll.bind(controller));
taskRoutes.get('/:id', authenticate, authorizeTaskMemberOrAdmin('id'), controller.getById.bind(controller));
taskRoutes.post('/', authenticate, authorizeProjectMemberOrAdminFromBody('projectId'), controller.create.bind(controller));
taskRoutes.put('/:id', authenticate, authorizeTaskMemberOrAdmin('id'), controller.update.bind(controller));
taskRoutes.delete('/:id', authenticate, authorizeTaskMemberOrAdmin('id'), controller.delete.bind(controller));
