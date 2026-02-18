/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/presentation/routes/auth.routes.ts
 * @desc Authentication routes
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import {Router} from 'express';
import {AuthController} from '../controllers/auth.controller.js';

export const authRoutes = Router();
const controller = new AuthController();

authRoutes.post('/register', controller.register.bind(controller));
authRoutes.post('/login', controller.login.bind(controller));
authRoutes.post('/logout', controller.logout.bind(controller));
