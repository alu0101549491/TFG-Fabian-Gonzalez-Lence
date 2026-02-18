/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/routes/file.routes.ts
 * @desc File routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import {Router} from 'express';
import {FileController} from '../controllers/file.controller.js';
import {authenticate} from '@infrastructure/auth/auth.middleware.js';

export const fileRoutes = Router();
const controller = new FileController();

fileRoutes.get('/project/:projectId', authenticate, controller.getByProjectId.bind(controller));
fileRoutes.get('/:id', authenticate, controller.getById.bind(controller));
fileRoutes.post('/', authenticate, controller.create.bind(controller));
fileRoutes.delete('/:id', authenticate, controller.delete.bind(controller));
