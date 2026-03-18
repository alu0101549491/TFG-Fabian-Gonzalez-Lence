/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file presentation/controllers/audit-log.controller.ts
 * @desc Controller for audit log management endpoints (NFR15)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Request, Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {AuditLog} from '../../domain/entities/audit-log.entity';
import {AuditService, AuditLogFilters} from '../../application/services/audit.service';
import {AuditAction} from '../../domain/enumerations/audit-action';
import {AuditResourceType} from '../../domain/enumerations/audit-resource-type';
import {HTTP_STATUS} from '../../shared/constants';

/**
 * Controller for handling audit log HTTP requests.
 * Provides endpoints for administrators to view and query audit trail (NFR15).
 * 
 * All endpoints require authentication and SYSTEM_ADMIN role.
 */
export class AuditLogController {
  private auditService: AuditService;

  /**
   * Creates an instance of AuditLogController
   */
  public constructor() {
    const auditLogRepository = AppDataSource.getRepository(AuditLog);
    this.auditService = new AuditService(auditLogRepository);
  }

  /**
   * Get audit logs with optional filters
   * GET /api/audit-logs
   * 
   * Query Parameters:
   * - userId: Filter by user who performed the action
   * - action: Filter by action type (CREATE, UPDATE, DELETE, etc.)
   * - resourceType: Filter by resource type (TOURNAMENT, MATCH, etc.)
   * - resourceId: Filter by specific resource ID
   * - startDate: Filter by start date (ISO 8601)
   * - endDate: Filter by end date (ISO 8601)
   * - limit: Maximum number of records (default 100)
   * - offset: Number of records to skip (default 0)
   * 
   * @param req - HTTP request with query parameters
   * @param res - HTTP response
   * @param next - Next middleware function
   */
  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: AuditLogFilters = {
        userId: req.query.userId as string | undefined,
        action: req.query.action as AuditAction | undefined,
        resourceType: req.query.resourceType as AuditResourceType | undefined,
        resourceId: req.query.resourceId as string | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      };

      const [logs, totalCount] = await Promise.all([
        this.auditService.find(filters),
        this.auditService.count(filters),
      ]);

      res.status(HTTP_STATUS.OK).json({
        data: logs,
        pagination: {
          total: totalCount,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: (filters.offset || 0) + logs.length < totalCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific audit log by ID
   * GET /api/audit-logs/:id
   * 
   * @param req - HTTP request with audit log ID parameter
   * @param res - HTTP response
   * @param next - Next middleware function
   */
  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const log = await this.auditService.findById(id);

      if (!log) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Audit log not found',
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json(log);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs for a specific user
   * GET /api/audit-logs/user/:userId
   * 
   * @param req - HTTP request with user ID parameter
   * @param res - HTTP response
   * @param next - Next middleware function
   */
  public async getByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {userId} = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const [logs, totalCount] = await Promise.all([
        this.auditService.find({userId, limit, offset}),
        this.auditService.count({userId}),
      ]);

      res.status(HTTP_STATUS.OK).json({
        data: logs,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + logs.length < totalCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs for a specific resource
   * GET /api/audit-logs/resource/:resourceType/:resourceId
   * 
   * @param req - HTTP request with resource type and ID parameters
   * @param res - HTTP response
   * @param next - Next middleware function
   */
  public async getByResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {resourceType, resourceId} = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const [logs, totalCount] = await Promise.all([
        this.auditService.find({
          resourceType: resourceType as AuditResourceType,
          resourceId,
          limit,
          offset,
        }),
        this.auditService.count({
          resourceType: resourceType as AuditResourceType,
          resourceId,
        }),
      ]);

      res.status(HTTP_STATUS.OK).json({
        data: logs,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + logs.length < totalCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs by action type
   * GET /api/audit-logs/action/:action
   * 
   * @param req - HTTP request with action parameter
   * @param res - HTTP response
   * @param next - Next middleware function
   */
  public async getByAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {action} = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const [logs, totalCount] = await Promise.all([
        this.auditService.find({action: action as AuditAction, limit, offset}),
        this.auditService.count({action: action as AuditAction}),
      ]);

      res.status(HTTP_STATUS.OK).json({
        data: logs,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + logs.length < totalCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit log statistics
   * GET /api/audit-logs/stats
   * 
   * Returns summary statistics:
   * - Total audit logs count
   * - Counts by action type
   * - Counts by resource type
   * - Recent activity (last 24 hours)
   * 
   * @param _req - HTTP request
   * @param res - HTTP response
   * @param next - Next middleware function
   */
  public async getStatistics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const [totalCount, recentCount] = await Promise.all([
        this.auditService.count(),
        this.auditService.count({startDate: yesterday}),
      ]);

      // Get counts by action
      const actionCounts: Record<string, number> = {};
      for (const action of Object.values(AuditAction)) {
        actionCounts[action] = await this.auditService.count({action});
      }

      // Get counts by resource type
      const resourceCounts: Record<string, number> = {};
      for (const resourceType of Object.values(AuditResourceType)) {
        resourceCounts[resourceType] = await this.auditService.count({resourceType});
      }

      res.status(HTTP_STATUS.OK).json({
        totalLogs: totalCount,
        last24Hours: recentCount,
        byAction: actionCounts,
        byResourceType: resourceCounts,
      });
    } catch (error) {
      next(error);
    }
  }
}
