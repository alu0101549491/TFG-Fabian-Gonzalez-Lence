/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/routes/user.routes.ts
 * @desc User routes - Read operations for authenticated users, write operations for administrators
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Router} from 'express';
import {UserRole} from '@prisma/client';
import {UserController} from '../controllers/user.controller.js';
import {authenticate, authorize, authorizeOwnerOrAdmin} from '@infrastructure/auth/auth.middleware.js';

export const userRoutes = Router();
const controller = new UserController();

// Read operations - available to all authenticated users (for project assignment, client names, etc.)
userRoutes.get('/', authenticate, controller.getAll.bind(controller));
userRoutes.get('/:id', authenticate, controller.getById.bind(controller));

// Lookup operations - restricted to administrators
userRoutes.get('/email/:email', authenticate, authorize(UserRole.ADMINISTRATOR), controller.getByEmail.bind(controller));
userRoutes.get('/username/:username', authenticate, authorize(UserRole.ADMINISTRATOR), controller.getByUsername.bind(controller));

// Write operations - admin can modify any user, users can modify themselves
userRoutes.post('/', authenticate, authorize(UserRole.ADMINISTRATOR), controller.create.bind(controller));
userRoutes.put('/:id', authenticate, authorizeOwnerOrAdmin, controller.update.bind(controller));
userRoutes.delete('/:id', authenticate, authorizeOwnerOrAdmin, controller.delete.bind(controller));

export default userRoutes;
