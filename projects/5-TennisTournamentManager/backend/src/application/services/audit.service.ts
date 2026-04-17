/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file backend/src/application/services/audit.service.ts
 * @desc Service for centralized audit logging across the application (NFR15)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Repository} from 'typeorm';
import {Request} from 'express';
import {AuditLog} from '../../domain/entities/audit-log.entity';
import {AuditAction} from '../../domain/enumerations/audit-action';
import {AuditResourceType} from '../../domain/enumerations/audit-resource-type';

/**
 * Interface for audit log creation data
 */
export interface CreateAuditLogData {
  userId?: string | null;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string | null;
  resourceName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: string | null;
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
 * Service for managing audit logs throughout the application.
 * Provides convenient methods for logging different types of critical actions (NFR15).
 * 
 * @example
 * ```typescript
 * const auditService = new AuditService(auditLogRepository);
 * await auditService.logResultConfirmation('user-123', 'result-456', 'Match #1', req);
 * ```
 */
export class AuditService {
  private auditLogRepository: Repository<AuditLog>;

  /**
   * Creates an instance of AuditService
   * @param auditLogRepository - TypeORM repository for audit log persistence
   */
  public constructor(auditLogRepository: Repository<AuditLog>) {
    this.auditLogRepository = auditLogRepository;
  }

  /**
   * Log a generic audit event
   * @param data - Audit log data
   * @returns The created audit log record
   */
  public async log(data: CreateAuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(data);
    return await this.auditLogRepository.save(auditLog);
  }

  /**
   * Extract IP address from HTTP request
   * Handles proxy headers (X-Forwarded-For)
   * @param req - HTTP request object
   * @returns Client IP address
   */
  private getIpAddress(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress;
  }

  // ==================== Authentication Logging ====================

  /**
   * Log a user login event
   * @param userId - ID of the user who logged in
   * @param username - Username of the user
   * @param req - HTTP request for IP and user agent
   */
  public async logLogin(userId: string, username: string, req?: Request): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGIN,
      resourceType: AuditResourceType.AUTHENTICATION,
      resourceName: username,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `User "${username}" logged in`,
    });
  }

  /**
   * Log a user logout event
   * @param userId - ID of the user who logged out
   * @param username - Username of the user
   * @param req - HTTP request for IP and user agent
   */
  public async logLogout(userId: string, username: string, req?: Request): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGOUT,
      resourceType: AuditResourceType.AUTHENTICATION,
      resourceName: username,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `User "${username}" logged out`,
    });
  }

  /**
   * Log a password change event
   * @param userId - ID of the user who changed their password
   * @param username - Username of the user
   * @param req - HTTP request for IP and user agent
   */
  public async logPasswordChange(userId: string, username: string, req?: Request): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PASSWORD_CHANGE,
      resourceType: AuditResourceType.AUTHENTICATION,
      resourceName: username,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `User "${username}" changed password`,
    });
  }

  // ==================== Match Result Logging ====================

  /**
   * Log a match result submission
   * @param userId - User who submitted the result
   * @param matchId - ID of the match
   * @param matchName - Name/identifier of the match
   * @param score - Score submitted (as JSON string)
   * @param req - HTTP request for IP and user agent
   */
  public async logResultSubmission(
    userId: string,
    matchId: string,
    matchName: string,
    score: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.RESULT_SUBMIT,
      resourceType: AuditResourceType.MATCH_RESULT,
      resourceId: matchId,
      resourceName: matchName,
      newValue: score,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Match result submitted for "${matchName}"`,
    });
  }

  /**
   * Log a match result confirmation
   * @param userId - User who confirmed the result
   * @param resultId - ID of the result
   * @param matchName - Name/identifier of the match
   * @param req - HTTP request for IP and user agent
   */
  public async logResultConfirmation(
    userId: string,
    resultId: string,
    matchName: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.RESULT_CONFIRM,
      resourceType: AuditResourceType.MATCH_RESULT,
      resourceId: resultId,
      resourceName: matchName,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Match result confirmed for "${matchName}"`,
    });
  }

  /**
   * Log a match result dispute
   * @param userId - User who disputed the result
   * @param resultId - ID of the result
   * @param matchName - Name/identifier of the match
   * @param reason - Reason for dispute
   * @param req - HTTP request for IP and user agent
   */
  public async logResultDispute(
    userId: string,
    resultId: string,
    matchName: string,
    reason: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.RESULT_DISPUTE,
      resourceType: AuditResourceType.MATCH_RESULT,
      resourceId: resultId,
      resourceName: matchName,
      details: `Match result disputed for "${matchName}": ${reason}`,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
    });
  }

  /**
   * Log an admin result validation
   * @param adminId - Admin who validated the result
   * @param resultId - ID of the result
   * @param matchName - Name/identifier of the match
   * @param req - HTTP request for IP and user agent
   */
  public async logResultValidation(
    adminId: string,
    resultId: string,
    matchName: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.RESULT_VALIDATE,
      resourceType: AuditResourceType.MATCH_RESULT,
      resourceId: resultId,
      resourceName: matchName,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Admin validated match result for "${matchName}"`,
    });
  }

  /**
   * Log a result annulment
   * @param adminId - Admin who annulled the result
   * @param resultId - ID of the result
   * @param matchName - Name/identifier of the match
   * @param reason - Reason for annulment
   * @param req - HTTP request for IP and user agent
   */
  public async logResultAnnulment(
    adminId: string,
    resultId: string,
    matchName: string,
    reason: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.RESULT_ANNUL,
      resourceType: AuditResourceType.MATCH_RESULT,
      resourceId: resultId,
      resourceName: matchName,
      details: `Match result annulled for "${matchName}": ${reason}`,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
    });
  }

  // ==================== Match Logging ====================

  /**
   * Log a match score update
   * @param userId - User who updated the score
   * @param matchId - ID of the match
   * @param matchName - Name/identifier of the match
   * @param oldScore - Previous score (JSON string)
   * @param newScore - New score (JSON string)
   * @param req - HTTP request for IP and user agent
   */
  public async logScoreUpdate(
    userId: string,
    matchId: string,
    matchName: string,
    oldScore: string,
    newScore: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.SCORE_UPDATE,
      resourceType: AuditResourceType.MATCH,
      resourceId: matchId,
      resourceName: matchName,
      oldValue: oldScore,
      newValue: newScore,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Match score updated for "${matchName}"`,
    });
  }

  /**
   * Log a match state change
   * @param userId - User who changed the state
   * @param matchId - ID of the match
   * @param matchName - Name/identifier of the match
   * @param oldState - Previous state
   * @param newState - New state
   * @param req - HTTP request for IP and user agent
   */
  public async logMatchStateChange(
    userId: string,
    matchId: string,
    matchName: string,
    oldState: string,
    newState: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.STATE_CHANGE,
      resourceType: AuditResourceType.MATCH,
      resourceId: matchId,
      resourceName: matchName,
      oldValue: oldState,
      newValue: newState,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Match state changed from ${oldState} to ${newState} for "${matchName}"`,
    });
  }

  // ==================== Tournament Logging ====================

  /**
   * Log a tournament creation
   * @param userId - User who created the tournament
   * @param tournamentId - ID of the tournament
   * @param tournamentName - Name of the tournament
   * @param req - HTTP request for IP and user agent
   */
  public async logTournamentCreation(
    userId: string,
    tournamentId: string,
    tournamentName: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.CREATE,
      resourceType: AuditResourceType.TOURNAMENT,
      resourceId: tournamentId,
      resourceName: tournamentName,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Tournament "${tournamentName}" created`,
    });
  }

  /**
   * Log a tournament update
   * @param userId - User who updated the tournament
   * @param tournamentId - ID of the tournament
   * @param tournamentName - Name of the tournament
   * @param oldValue - Previous values (JSON string)
   * @param newValue - New values (JSON string)
   * @param req - HTTP request for IP and user agent
   */
  public async logTournamentUpdate(
    userId: string,
    tournamentId: string,
    tournamentName: string,
    oldValue?: string,
    newValue?: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.UPDATE,
      resourceType: AuditResourceType.TOURNAMENT,
      resourceId: tournamentId,
      resourceName: tournamentName,
      oldValue,
      newValue,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Tournament "${tournamentName}" updated`,
    });
  }

  /**
   * Log a tournament deletion
   * @param userId - User who deleted the tournament
   * @param tournamentId - ID of the tournament
   * @param tournamentName - Name of the tournament
   * @param req - HTTP request for IP and user agent
   */
  public async logTournamentDeletion(
    userId: string,
    tournamentId: string,
    tournamentName: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.DELETE,
      resourceType: AuditResourceType.TOURNAMENT,
      resourceId: tournamentId,
      resourceName: tournamentName,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Tournament "${tournamentName}" deleted`,
    });
  }

  /**
   * Log a tournament status change
   * @param userId - User who changed the status
   * @param tournamentId - ID of the tournament
   * @param tournamentName - Name of the tournament
   * @param oldStatus - Previous status
   * @param newStatus - New status
   * @param req - HTTP request for IP and user agent
   */
  public async logTournamentStatusChange(
    userId: string,
    tournamentId: string,
    tournamentName: string,
    oldStatus: string,
    newStatus: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.STATUS_CHANGE,
      resourceType: AuditResourceType.TOURNAMENT,
      resourceId: tournamentId,
      resourceName: tournamentName,
      oldValue: oldStatus,
      newValue: newStatus,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Tournament "${tournamentName}" status changed from ${oldStatus} to ${newStatus}`,
    });
  }

  /**
   * Log a tournament finalization
   * @param userId - User who finalized the tournament
   * @param tournamentId - ID of the tournament
   * @param tournamentName - Name of the tournament
   * @param req - HTTP request for IP and user agent
   */
  public async logTournamentFinalization(
    userId: string,
    tournamentId: string,
    tournamentName: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.FINALIZE,
      resourceType: AuditResourceType.TOURNAMENT,
      resourceId: tournamentId,
      resourceName: tournamentName,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Tournament "${tournamentName}" finalized`,
    });
  }

  // ==================== Bracket Logging ====================

  /**
   * Log a bracket generation
   * @param userId - User who generated the bracket
   * @param bracketId - ID of the bracket
   * @param tournamentName - Name of the tournament
   * @param bracketType - Type of bracket (Single Elimination, Round Robin, etc.)
   * @param req - HTTP request for IP and user agent
   */
  public async logBracketGeneration(
    userId: string,
    bracketId: string,
    tournamentName: string,
    bracketType: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.BRACKET_GENERATE,
      resourceType: AuditResourceType.BRACKET,
      resourceId: bracketId,
      resourceName: `${tournamentName} - ${bracketType}`,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `${bracketType} bracket generated for tournament "${tournamentName}"`,
    });
  }

  // ==================== Registration Logging ====================

  /**
   * Log a registration approval
   * @param adminId - Admin who approved the registration
   * @param registrationId - ID of the registration
   * @param participantName - Name of the participant
   * @param tournamentName - Name of the tournament
   * @param req - HTTP request for IP and user agent
   */
  public async logRegistrationApproval(
    adminId: string,
    registrationId: string,
    participantName: string,
    tournamentName: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.REGISTRATION_APPROVE,
      resourceType: AuditResourceType.REGISTRATION,
      resourceId: registrationId,
      resourceName: `${participantName} - ${tournamentName}`,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Registration approved for ${participantName} in "${tournamentName}"`,
    });
  }

  /**
   * Log a registration rejection
   * @param adminId - Admin who rejected the registration
   * @param registrationId - ID of the registration
   * @param participantName - Name of the participant
   * @param tournamentName - Name of the tournament
   * @param reason - Reason for rejection
   * @param req - HTTP request for IP and user agent
   */
  public async logRegistrationRejection(
    adminId: string,
    registrationId: string,
    participantName: string,
    tournamentName: string,
    reason: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.REGISTRATION_REJECT,
      resourceType: AuditResourceType.REGISTRATION,
      resourceId: registrationId,
      resourceName: `${participantName} - ${tournamentName}`,
      details: `Registration rejected for ${participantName} in "${tournamentName}": ${reason}`,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
    });
  }

  // ==================== User/Permission Logging ====================

  /**
   * Log a user role change
   * @param adminId - Admin who changed the role
   * @param targetUserId - ID of the user whose role changed
   * @param username - Username of the target user
   * @param oldRole - Previous role
   * @param newRole - New role
   * @param req - HTTP request for IP and user agent
   */
  public async logRoleChange(
    adminId: string,
    targetUserId: string,
    username: string,
    oldRole: string,
    newRole: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.ROLE_CHANGE,
      resourceType: AuditResourceType.PERMISSION,
      resourceId: targetUserId,
      resourceName: username,
      oldValue: oldRole,
      newValue: newRole,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `User "${username}" role changed from ${oldRole} to ${newRole}`,
    });
  }

  /**
   * Log a user creation
   * @param adminId - Admin who created the user
   * @param userId - ID of the new user
   * @param username - Username of the new user
   * @param role - Role assigned to the user
   * @param req - HTTP request for IP and user agent
   */
  public async logUserCreation(
    adminId: string,
    userId: string,
    username: string,
    role: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.CREATE,
      resourceType: AuditResourceType.USER,
      resourceId: userId,
      resourceName: username,
      newValue: role,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `User "${username}" created with role ${role}`,
    });
  }

  /**
   * Log a user deletion
   * @param adminId - Admin who deleted the user
   * @param userId - ID of the deleted user
   * @param username - Username of the deleted user
   * @param req - HTTP request for IP and user agent
   */
  public async logUserDeletion(
    adminId: string,
    userId: string,
    username: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: AuditAction.DELETE,
      resourceType: AuditResourceType.USER,
      resourceId: userId,
      resourceName: username,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `User "${username}" deleted`,
    });
  }

  // ==================== GDPR Logging ====================

  /**
   * Log a GDPR data export request
   * @param userId - User who requested the export
   * @param username - Username of the user
   * @param req - HTTP request for IP and user agent
   */
  public async logDataExport(userId: string, username: string, req?: Request): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.DATA_EXPORT,
      resourceType: AuditResourceType.GDPR,
      resourceName: username,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `GDPR data export requested for user "${username}"`,
    });
  }

  /**
   * Log a GDPR data deletion request
   * @param userId - User who requested the deletion
   * @param username - Username of the user
   * @param req - HTTP request for IP and user agent
   */
  public async logDataDeletion(userId: string, username: string, req?: Request): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.DATA_DELETE,
      resourceType: AuditResourceType.GDPR,
      resourceName: username,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `GDPR data deletion requested for user "${username}"`,
    });
  }

  // ==================== Announcement Logging ====================

  /**
   * Log an announcement publication
   * @param userId - User who published the announcement
   * @param announcementId - ID of the announcement
   * @param title - Title of the announcement
   * @param req - HTTP request for IP and user agent
   */
  public async logAnnouncementPublication(
    userId: string,
    announcementId: string,
    title: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PUBLISH,
      resourceType: AuditResourceType.ANNOUNCEMENT,
      resourceId: announcementId,
      resourceName: title,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Announcement "${title}" published`,
    });
  }

  // ==================== Query Methods ====================

  /**
   * Find audit logs with optional filters
   * @param filters - Query filters
   * @returns Array of audit log records
   */
  public async find(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log')
      .leftJoinAndSelect('audit_log.user', 'user')
      .orderBy('audit_log.timestamp', 'DESC');

    if (filters.userId) {
      queryBuilder.andWhere('audit_log.userId = :userId', {userId: filters.userId});
    }
    if (filters.action) {
      queryBuilder.andWhere('audit_log.action = :action', {action: filters.action});
    }
    if (filters.resourceType) {
      queryBuilder.andWhere('audit_log.resourceType = :resourceType', {
        resourceType: filters.resourceType,
      });
    }
    if (filters.resourceId) {
      queryBuilder.andWhere('audit_log.resourceId = :resourceId', {resourceId: filters.resourceId});
    }
    if (filters.startDate) {
      queryBuilder.andWhere('audit_log.timestamp >= :startDate', {startDate: filters.startDate});
    }
    if (filters.endDate) {
      queryBuilder.andWhere('audit_log.timestamp <= :endDate', {endDate: filters.endDate});
    }

    queryBuilder.take(filters.limit || 100);
    queryBuilder.skip(filters.offset || 0);

    return await queryBuilder.getMany();
  }

  /**
   * Count audit logs with optional filters
   * @param filters - Query filters
   * @returns Total count of matching audit logs
   */
  public async count(filters: AuditLogFilters = {}): Promise<number> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log');

    if (filters.userId) {
      queryBuilder.andWhere('audit_log.userId = :userId', {userId: filters.userId});
    }
    if (filters.action) {
      queryBuilder.andWhere('audit_log.action = :action', {action: filters.action});
    }
    if (filters.resourceType) {
      queryBuilder.andWhere('audit_log.resourceType = :resourceType', {
        resourceType: filters.resourceType,
      });
    }
    if (filters.resourceId) {
      queryBuilder.andWhere('audit_log.resourceId = :resourceId', {resourceId: filters.resourceId});
    }
    if (filters.startDate) {
      queryBuilder.andWhere('audit_log.timestamp >= :startDate', {startDate: filters.startDate});
    }
    if (filters.endDate) {
      queryBuilder.andWhere('audit_log.timestamp <= :endDate', {endDate: filters.endDate});
    }

    return await queryBuilder.getCount();
  }

  /**
   * Find audit log by ID
   * @param id - Audit log ID
   * @returns Audit log record or null if not found
   */
  public async findById(id: string): Promise<AuditLog | null> {
    return await this.auditLogRepository.findOne({
      where: {id},
      relations: ['user'],
    });
  }

  /**
   * Delete old audit logs (for cleanup/retention policy)
   * @param olderThan - Delete logs older than this date
   * @returns Count of deleted records
   */
  public async deleteOlderThan(olderThan: Date): Promise<number> {
    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :olderThan', {olderThan})
      .execute();
    return result.affected || 0;
  }
}
