/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 24, 2026
 * @file backend/src/presentation/routes/file.routes.ts
 * @desc File routes with upload middleware
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Router} from 'express';
import {FileController} from '../controllers/file.controller.js';
import {
	authenticate,
	authorizeFileMemberOrAdmin,
	authorizeProjectMemberOrAdmin,
	authorizeProjectMemberOrAdminFromBody,
} from '@infrastructure/auth/auth.middleware.js';
import {uploadSingle} from '../middlewares/upload.middleware.js';

export const fileRoutes = Router();
const controller = new FileController();

// Get files by project
fileRoutes.get(
	'/project/:projectId',
	authenticate,
	authorizeProjectMemberOrAdmin('projectId'),
	controller.getByProjectId.bind(controller),
);

// Sync files from Dropbox to database
fileRoutes.post(
	'/project/:projectId/sync',
	authenticate,
	authorizeProjectMemberOrAdmin('projectId'),
	controller.syncFromDropbox.bind(controller),
);

// Get single file
fileRoutes.get(
	'/:id',
	authenticate,
	authorizeFileMemberOrAdmin('id'),
	controller.getById.bind(controller),
);

// Upload file (with multer middleware)
fileRoutes.post(
	'/upload',
	authenticate,
	uploadSingle,
	authorizeProjectMemberOrAdminFromBody('projectId'),
	controller.upload.bind(controller),
);

// Download file (get temporary link)
fileRoutes.get(
	'/:id/download',
	authenticate,
	authorizeFileMemberOrAdmin('id'),
	controller.download.bind(controller),
);

// Preview file (get shared link for web viewer)
fileRoutes.get(
	'/:id/preview',
	authenticate,
	authorizeFileMemberOrAdmin('id'),
	controller.preview.bind(controller),
);

// Delete file
fileRoutes.delete(
	'/:id',
	authenticate,
	authorizeFileMemberOrAdmin('id'),
	controller.delete.bind(controller),
);

