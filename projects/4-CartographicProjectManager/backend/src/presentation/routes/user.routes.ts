/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/routes/user.routes.ts
 * @desc User routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import {Router} from 'express';
import {UserController} from '../controllers/user.controller.js';
import {authenticate} from '@infrastructure/auth/auth.middleware.js';

export const userRoutes = Router();
const controller = new UserController();

userRoutes.get('/', authenticate, controller.getAll.bind(controller));
userRoutes.get('/:id', authenticate, controller.getById.bind(controller));
userRoutes.get('/email/:email', authenticate, controller.getByEmail.bind(controller));
userRoutes.get('/username/:username', authenticate, controller.getByUsername.bind(controller));
userRoutes.post('/', authenticate, controller.create.bind(controller));
userRoutes.put('/:id', authenticate, controller.update.bind(controller));
userRoutes.delete('/:id', authenticate, controller.delete.bind(controller));
