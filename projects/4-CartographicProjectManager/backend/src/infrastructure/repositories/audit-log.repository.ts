/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/infrastructure/repositories/audit-log.repository.ts
 * @desc Repository for audit log database operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { PrismaClient, AuditAction, AuditResourceType } from '@prisma/client';
import { DatabaseError } from '../../shared/errors.js';
import { logError } from '../../shared/logger.js';

/**
 * Interface for audit log creation data
 */
export interface CreateAuditLogData {
  userId?: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  resourceName?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

/**
 * Interface for audit log query filters
 */
export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  resourceType?: AuditResourceType;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Repository for managing audit log records in the database
 * Handles all CRUD operations for audit trail
 */
export class AuditLogRepository {
  private prisma: PrismaClient;

  /**
   * Creates an instance of AuditLogRepository
   * @param prisma - Prisma client instance for database access
   */
  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new audit log entry
   * @param data - Audit log data to create
   * @returns The created audit log record
   * @throws {DatabaseError} If creation fails
   */
  public async create(data: CreateAuditLogData) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          resourceName: data.resourceName,
          oldValue: data.oldValue,
          newValue: data.newValue,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          details: data.details,
        },
      });
    } catch (error) {
      logError('Failed to create audit log', error as Error, {
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
      });
      throw new DatabaseError('Failed to create audit log');
    }
  }

  /**
   * Find audit logs with optional filters
   * @param filters - Query filters
   * @returns Array of audit log records
   * @throws {DatabaseError} If query fails
   */
  public async find(filters: AuditLogFilters = {}) {
    try {
      const where: any = {};

      if (filters.userId) {
        where.userId = filters.userId;
      }
      if (filters.action) {
        where.action = filters.action;
      }
      if (filters.resourceType) {
        where.resourceType = filters.resourceType;
      }
      if (filters.resourceId) {
        where.resourceId = filters.resourceId;
      }
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) {
          where.timestamp.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.timestamp.lte = filters.endDate;
        }
      }

      return await this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filters.limit || 100,
        skip: filters.offset || 0,
      });
    } catch (error) {
      logError('Failed to find audit logs', error as Error, {
        userId: filters.userId,
        action: filters.action,
        resourceType: filters.resourceType,
        resourceId: filters.resourceId,
      });
      throw new DatabaseError('Failed to find audit logs');
    }
  }

  /**
   * Find audit log by ID
   * @param id - Audit log ID
   * @returns Audit log record or null if not found
   * @throws {DatabaseError} If query fails
   */
  public async findById(id: string) {
    try {
      return await this.prisma.auditLog.findUnique({
        where: { id },
      });
    } catch (error) {
      logError('Failed to find audit log by ID', error as Error, {id});
      throw new DatabaseError('Failed to find audit log by ID');
    }
  }

  /**
   * Count audit logs with optional filters
   * @param filters - Query filters
   * @returns Total count of matching audit logs
   * @throws {DatabaseError} If count fails
   */
  public async count(filters: AuditLogFilters = {}) {
    try {
      const where: any = {};

      if (filters.userId) {
        where.userId = filters.userId;
      }
      if (filters.action) {
        where.action = filters.action;
      }
      if (filters.resourceType) {
        where.resourceType = filters.resourceType;
      }
      if (filters.resourceId) {
        where.resourceId = filters.resourceId;
      }
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) {
          where.timestamp.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.timestamp.lte = filters.endDate;
        }
      }

      return await this.prisma.auditLog.count({ where });
    } catch (error) {
      logError('Failed to count audit logs', error as Error, {
        userId: filters.userId,
        action: filters.action,
        resourceType: filters.resourceType,
        resourceId: filters.resourceId,
      });
      throw new DatabaseError('Failed to count audit logs');
    }
  }

  /**
   * Delete old audit logs (for cleanup/retention policy)
   * @param olderThan - Delete logs older than this date
   * @returns Count of deleted records
   * @throws {DatabaseError} If deletion fails
   */
  public async deleteOlderThan(olderThan: Date) {
    try {
      const result = await this.prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: olderThan,
          },
        },
      });
      return result.count;
    } catch (error) {
      logError('Failed to delete old audit logs', error as Error, {
        olderThan: olderThan.toISOString(),
      });
      throw new DatabaseError('Failed to delete old audit logs');
    }
  }
}
