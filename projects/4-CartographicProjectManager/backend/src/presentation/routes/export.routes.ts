/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/presentation/routes/export.routes.ts
 * @desc Export API routes configuration
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { Router } from 'express';
import { ExportController } from '../controllers/export.controller.js';
import { authenticate, authorize } from '../../infrastructure/auth/auth.middleware.js';

const router = Router();
const exportController = new ExportController();

/**
 * All export routes require authentication and administrator role
 */
router.use(authenticate, authorize('ADMINISTRATOR'));

/**
 * GET /api/v1/export/projects
 * Export projects data in specified format (csv, pdf, excel)
 * Query params: format, clientId, year, status
 */
router.get('/projects', (req, res) => exportController.exportProjects(req, res));

/**
 * GET /api/v1/export/tasks
 * Export tasks data in specified format (csv)
 * Query params: format, projectId, status, assigneeId
 */
router.get('/tasks', (req, res) => exportController.exportTasks(req, res));

export default router;
