/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/presentation/routes/backup.routes.ts
 * @desc Routes for backup and recovery management
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { BackupController } from '../controllers/backup.controller.js';
import { authenticate, authorize } from '../../infrastructure/auth/auth.middleware.js';

const router = Router();
const backupController = new BackupController();

/**
 * All backup routes require administrator role
 */

// Get or update runtime schedule configuration
router.get(
  '/schedule',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.getSchedule.bind(backupController)
);

router.put(
  '/schedule',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.updateSchedule.bind(backupController)
);

// Dropbox backup sync
router.get(
  '/dropbox/status',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.getDropboxStatus.bind(backupController)
);

router.post(
  '/dropbox/connect',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.connectDropbox.bind(backupController)
);

router.post(
  '/dropbox/disconnect',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.disconnectDropbox.bind(backupController)
);

router.post(
  '/dropbox/sync',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.syncDropbox.bind(backupController)
);

// Create a new backup
router.post(
  '/create',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.createBackup.bind(backupController)
);

// List all backups
router.get(
  '/list',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.listBackups.bind(backupController)
);

// Restore from backup
router.post(
  '/restore',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.restoreBackup.bind(backupController)
);

// Download a backup
router.get(
  '/:filename/download',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.downloadBackup.bind(backupController)
);

// Delete a backup
router.delete(
  '/:filename',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.deleteBackup.bind(backupController)
);

// Cleanup old backups
router.post(
  '/cleanup',
  authenticate,
  authorize(UserRole.ADMINISTRATOR),
  backupController.cleanupBackups.bind(backupController)
);

export default router;
