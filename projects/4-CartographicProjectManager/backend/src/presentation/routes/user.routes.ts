/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/routes/user.routes.ts
 * @desc User routes (restricted to administrators)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import {Router} from 'express';
import {UserController} from '../controllers/user.controller.js';
import {authenticate, authorize} from '@infrastructure/auth/auth.middleware.js';

export const userRoutes = Router();
const controller = new UserController();

// All user management routes require ADMINISTRATOR role
userRoutes.get('/', authenticate, authorize('ADMINISTRATOR'), controller.getAll.bind(controller));
userRoutes.get('/:id', authenticate, authorize('ADMINISTRATOR'), controller.getById.bind(controller));
userRoutes.get('/email/:email', authenticate, authorize('ADMINISTRATOR'), controller.getByEmail.bind(controller));
userRoutes.get('/username/:username', authenticate, authorize('ADMINISTRATOR'), controller.getByUsername.bind(controller));
userRoutes.post('/', authenticate, authorize('ADMINISTRATOR'), controller.create.bind(controller));
userRoutes.put('/:id', authenticate, authorize('ADMINISTRATOR'), controller.update.bind(controller));
userRoutes.delete('/:id', authenticate, authorize('ADMINISTRATOR'), controller.delete.bind(controller));

