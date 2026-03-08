/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/presentation/controllers/audit-log.controller.ts
 * @desc Controller for audit log management endpoints
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { Request, Response } from 'express';
import { AuditLogRepository, AuditLogFilters } from '../../infrastructure/repositories/audit-log.repository.js';
import { AuditAction, AuditResourceType } from '@prisma/client';
import { BadRequestError } from '../../shared/errors.js';

/**
 * Controller for handling audit log HTTP requests
 * Provides endpoints for administrators to view and query audit logs
 */
export class AuditLogController {
  private auditLogRepository: AuditLogRepository;

  /**
   * Creates an instance of AuditLogController
   * @param auditLogRepository - Repository for audit log data access
   */
  public constructor(auditLogRepository: AuditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  /**
   * Get audit logs with optional filters
   * GET /api/v1/audit-logs
   * @param req - HTTP request with query parameters
   * @param res - HTTP response
   */
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        action,
        resourceType,
        resourceId,
        startDate,
        endDate,
        limit,
        offset,
      } = req.query;

      const filters: AuditLogFilters = {};

      if (userId && typeof userId === 'string') {
        filters.userId = userId;
      }
      if (action && typeof action === 'string') {
        filters.action = action as AuditAction;
      }
      if (resourceType && typeof resourceType === 'string') {
        filters.resourceType = resourceType as AuditResourceType;
      }
      if (resourceId && typeof resourceId === 'string') {
        filters.resourceId = resourceId;
      }
      if (startDate && typeof startDate === 'string') {
        const parsedStartDate = new Date(startDate);
        if (Number.isNaN(parsedStartDate.getTime())) {
          throw new BadRequestError('Invalid startDate query parameter');
        }
        filters.startDate = parsedStartDate;
      }
      if (endDate && typeof endDate === 'string') {
        const parsedEndDate = new Date(endDate);
        if (Number.isNaN(parsedEndDate.getTime())) {
          throw new BadRequestError('Invalid endDate query parameter');
        }
        filters.endDate = parsedEndDate;
      }
      if (limit && typeof limit === 'string') {
        const parsedLimit = Number.parseInt(limit, 10);
        if (!Number.isFinite(parsedLimit) || parsedLimit < 0) {
          throw new BadRequestError('Invalid limit query parameter');
        }
        filters.limit = parsedLimit;
      }
      if (offset && typeof offset === 'string') {
        const parsedOffset = Number.parseInt(offset, 10);
        if (!Number.isFinite(parsedOffset) || parsedOffset < 0) {
          throw new BadRequestError('Invalid offset query parameter');
        }
        filters.offset = parsedOffset;
      }

      const auditLogs = await this.auditLogRepository.find(filters);
      const total = await this.auditLogRepository.count(filters);

      res.status(200).json({
        success: true,
        data: auditLogs,
        pagination: {
          total,
          limit: filters.limit || 100,
          offset: filters.offset || 0,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve audit logs',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Get a specific audit log by ID
   * GET /api/v1/audit-logs/:id
   * @param req - HTTP request with audit log ID parameter
   * @param res - HTTP response
   */
  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const auditLog = await this.auditLogRepository.findById(id);

      if (!auditLog) {
        res.status(404).json({
          success: false,
          error: 'Audit log not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: auditLog,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve audit log',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Get audit logs for a specific user
   * GET /api/v1/audit-logs/user/:userId
   * @param req - HTTP request with user ID parameter
   * @param res - HTTP response
   */
  public async getByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { limit, offset } = req.query;

      const filters: AuditLogFilters = {
        userId,
        limit: 100,
        offset: 0,
      };

      if (limit && typeof limit === 'string') {
        const parsedLimit = Number.parseInt(limit, 10);
        if (!Number.isFinite(parsedLimit) || parsedLimit < 0) {
          throw new BadRequestError('Invalid limit query parameter');
        }
        filters.limit = parsedLimit;
      }
      if (offset && typeof offset === 'string') {
        const parsedOffset = Number.parseInt(offset, 10);
        if (!Number.isFinite(parsedOffset) || parsedOffset < 0) {
          throw new BadRequestError('Invalid offset query parameter');
        }
        filters.offset = parsedOffset;
      }

      const auditLogs = await this.auditLogRepository.find(filters);
      const total = await this.auditLogRepository.count(filters);

      res.status(200).json({
        success: true,
        data: auditLogs,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user audit logs',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Get audit logs for a specific resource
   * GET /api/v1/audit-logs/resource/:resourceType/:resourceId
   * @param req - HTTP request with resource type and ID parameters
   * @param res - HTTP response
   */
  public async getByResource(req: Request, res: Response): Promise<void> {
    try {
      const resourceType = req.params.resourceType as AuditResourceType;
      const resourceId = req.params.resourceId as string;
      const { limit, offset } = req.query;

      const filters: AuditLogFilters = {
        resourceType,
        resourceId,
        limit: 100,
        offset: 0,
      };

      if (limit && typeof limit === 'string') {
        const parsedLimit = Number.parseInt(limit, 10);
        if (!Number.isFinite(parsedLimit) || parsedLimit < 0) {
          throw new BadRequestError('Invalid limit query parameter');
        }
        filters.limit = parsedLimit;
      }
      if (offset && typeof offset === 'string') {
        const parsedOffset = Number.parseInt(offset, 10);
        if (!Number.isFinite(parsedOffset) || parsedOffset < 0) {
          throw new BadRequestError('Invalid offset query parameter');
        }
        filters.offset = parsedOffset;
      }

      const auditLogs = await this.auditLogRepository.find(filters);
      const total = await this.auditLogRepository.count(filters);

      res.status(200).json({
        success: true,
        data: auditLogs,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve resource audit logs',
        message: (error as Error).message,
      });
    }
  }

  /**
   * Delete old audit logs (retention policy)
   * DELETE /api/v1/audit-logs/cleanup
   * @param req - HTTP request with olderThanDays query parameter
   * @param res - HTTP response
   */
  public async cleanup(req: Request, res: Response): Promise<void> {
    try {
      const { olderThanDays } = req.query;

      if (!olderThanDays || typeof olderThanDays !== 'string') {
        res.status(400).json({
          success: false,
          error: 'olderThanDays query parameter is required',
        });
        return;
      }

      const days = parseInt(olderThanDays, 10);
      if (!Number.isFinite(days) || days < 0) {
        throw new BadRequestError('Invalid olderThanDays query parameter');
      }
      const olderThan = new Date();
      olderThan.setDate(olderThan.getDate() - days);

      const deletedCount = await this.auditLogRepository.deleteOlderThan(olderThan);

      res.status(200).json({
        success: true,
        message: `Deleted ${deletedCount} audit logs older than ${days} days`,
        data: { deletedCount, olderThan },
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to clean up audit logs',
        message: (error as Error).message,
      });
    }
  }
}
