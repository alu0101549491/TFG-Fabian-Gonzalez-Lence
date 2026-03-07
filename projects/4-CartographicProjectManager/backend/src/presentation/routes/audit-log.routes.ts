/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/presentation/routes/audit-log.routes.ts
 * @desc Audit log API routes configuration
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuditLogController } from '../controllers/audit-log.controller.js';
import { AuditLogRepository } from '../../infrastructure/repositories/audit-log.repository.js';
import { authenticate, authorize } from '../../infrastructure/auth/auth.middleware.js';

const prisma = new PrismaClient();
const auditLogRepository = new AuditLogRepository(prisma);
const auditLogController = new AuditLogController(auditLogRepository);

const router = Router();

/**
 * All audit log routes require authentication and administrator role
 */
router.use(authenticate, authorize(UserRole.ADMINISTRATOR));

/**
 * GET /api/v1/audit-logs
 * Get all audit logs with optional filters
 */
router.get('/', (req, res) => auditLogController.getAll(req, res));

/**
 * GET /api/v1/audit-logs/:id
 * Get a specific audit log by ID
 */
router.get('/:id', (req, res) => auditLogController.getById(req, res));

/**
 * GET /api/v1/audit-logs/user/:userId
 * Get audit logs for a specific user
 */
router.get('/user/:userId', (req, res) => auditLogController.getByUser(req, res));

/**
 * GET /api/v1/audit-logs/resource/:resourceType/:resourceId
 * Get audit logs for a specific resource
 */
router.get('/resource/:resourceType/:resourceId', (req, res) =>
  auditLogController.getByResource(req, res)
);

/**
 * DELETE /api/v1/audit-logs/cleanup
 * Delete old audit logs based on retention policy
 */
router.delete('/cleanup', (req, res) => auditLogController.cleanup(req, res));

export default router;
