/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 2, 2026
 * @file backend/src/application/services/audit.service.ts
 * @desc Service for centralized audit logging across the application
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import { AuditAction, AuditResourceType } from '@prisma/client';
import { AuditLogRepository, CreateAuditLogData } from '../../infrastructure/repositories/audit-log.repository.js';
import { Request } from 'express';

/**
 * Service for managing audit logs throughout the application
 * Provides convenient methods for logging different types of actions
 */
export class AuditService {
  private auditLogRepository: AuditLogRepository;

  /**
   * Creates an instance of AuditService
   * @param auditLogRepository - Repository for audit log persistence
   */
  public constructor(auditLogRepository: AuditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  /**
   * Log a generic audit event
   * @param data - Audit log data
   * @returns The created audit log record
   */
  public async log(data: CreateAuditLogData) {
    return await this.auditLogRepository.create(data);
  }

  /**
   * Log a project creation event
   * @param userId - User who created the project
   * @param projectId - ID of the created project
   * @param projectName - Name of the project
   * @param req - HTTP request for IP and user agent
   */
  public async logProjectCreation(userId: string, projectId: string, projectName: string, req?: Request) {
    await this.log({
      userId,
      action: AuditAction.CREATE,
      resourceType: AuditResourceType.PROJECT,
      resourceId: projectId,
      resourceName: projectName,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Project "${projectName}" created`,
    });
  }

  /**
   * Log a project update event
   * @param userId - User who updated the project
   * @param projectId - ID of the updated project
   * @param projectName - Name of the project
   * @param oldValue - Previous values (JSON string)
   * @param newValue - New values (JSON string)
   * @param req - HTTP request for IP and user agent
   */
  public async logProjectUpdate(
    userId: string,
    projectId: string,
    projectName: string,
    oldValue?: string,
    newValue?: string,
    req?: Request
  ) {
    await this.log({
      userId,
      action: AuditAction.UPDATE,
      resourceType: AuditResourceType.PROJECT,
      resourceId: projectId,
      resourceName: projectName,
      oldValue,
      newValue,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Project "${projectName}" updated`,
    });
  }

  /**
   * Log a project deletion event
   * @param userId - User who deleted the project
   * @param projectId - ID of the deleted project
   * @param projectName - Name of the project
   * @param req - HTTP request for IP and user agent
   */
  public async logProjectDeletion(userId: string, projectId: string, projectName: string, req?: Request) {
    await this.log({
      userId,
      action: AuditAction.DELETE,
      resourceType: AuditResourceType.PROJECT,
      resourceId: projectId,
      resourceName: projectName,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Project "${projectName}" deleted`,
    });
  }

  /**
   * Log a project finalization event
   * @param userId - User who finalized the project
   * @param projectId - ID of the finalized project
   * @param projectName - Name of the project
   * @param req - HTTP request for IP and user agent
   */
  public async logProjectFinalization(userId: string, projectId: string, projectName: string, req?: Request) {
    await this.log({
      userId,
      action: AuditAction.FINALIZE,
      resourceType: AuditResourceType.PROJECT,
      resourceId: projectId,
      resourceName: projectName,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Project "${projectName}" finalized`,
    });
  }

  /**
   * Log a user creation event
   * @param creatorId - User who created the new user
   * @param newUserId - ID of the created user
   * @param username - Username of the new user
   * @param role - Role of the new user
   * @param req - HTTP request for IP and user agent
   */
  public async logUserCreation(creatorId: string, newUserId: string, username: string, role: string, req?: Request) {
    await this.log({
      userId: creatorId,
      action: AuditAction.CREATE,
      resourceType: AuditResourceType.USER,
      resourceId: newUserId,
      resourceName: username,
      newValue: JSON.stringify({ role }),
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `User "${username}" created with role ${role}`,
    });
  }

  /**
   * Log a user deletion event
   * @param deleterId - User who deleted the user
   * @param deletedUserId - ID of the deleted user
   * @param username - Username of the deleted user
   * @param req - HTTP request for IP and user agent
   */
  public async logUserDeletion(deleterId: string, deletedUserId: string, username: string, req?: Request) {
    await this.log({
      userId: deleterId,
      action: AuditAction.DELETE,
      resourceType: AuditResourceType.USER,
      resourceId: deletedUserId,
      resourceName: username,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `User "${username}" deleted`,
    });
  }

  /**
   * Log a role change event
   * @param changerId - User who changed the role
   * @param targetUserId - ID of the user whose role was changed
   * @param username - Username of the target user
   * @param oldRole - Previous role
   * @param newRole - New role
   * @param req - HTTP request for IP and user agent
   */
  public async logRoleChange(
    changerId: string,
    targetUserId: string,
    username: string,
    oldRole: string,
    newRole: string,
    req?: Request
  ) {
    await this.log({
      userId: changerId,
      action: AuditAction.ROLE_CHANGE,
      resourceType: AuditResourceType.USER,
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
   * Log a permission grant event
   * @param granterId - User who granted the permission
   * @param targetUserId - ID of the user who received permissions
   * @param username - Username of the target user
   * @param projectId - ID of the project
   * @param projectName - Name of the project
   * @param rights - Granted rights
   * @param req - HTTP request for IP and user agent
   */
  public async logPermissionGrant(
    granterId: string,
    targetUserId: string,
    username: string,
    projectId: string,
    projectName: string,
    rights: string[],
    req?: Request
  ) {
    await this.log({
      userId: granterId,
      action: AuditAction.PERMISSION_GRANT,
      resourceType: AuditResourceType.PERMISSION,
      resourceId: `${targetUserId}-${projectId}`,
      resourceName: `${username} on ${projectName}`,
      newValue: JSON.stringify({ rights }),
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Granted permissions ${rights.join(', ')} to "${username}" on project "${projectName}"`,
    });
  }

  /**
   * Log a permission revocation event
   * @param revokerId - User who revoked the permission
   * @param targetUserId - ID of the user whose permissions were revoked
   * @param username - Username of the target user
   * @param projectId - ID of the project
   * @param projectName - Name of the project
   * @param req - HTTP request for IP and user agent
   */
  public async logPermissionRevoke(
    revokerId: string,
    targetUserId: string,
    username: string,
    projectId: string,
    projectName: string,
    req?: Request
  ) {
    await this.log({
      userId: revokerId,
      action: AuditAction.PERMISSION_REVOKE,
      resourceType: AuditResourceType.PERMISSION,
      resourceId: `${targetUserId}-${projectId}`,
      resourceName: `${username} on ${projectName}`,
      ipAddress: req ? this.getIpAddress(req) : undefined,
      userAgent: req?.headers['user-agent'],
      details: `Revoked permissions for "${username}" on project "${projectName}"`,
    });
  }

  /**
   * Log a user login event
   * @param userId - ID of the user who logged in
   * @param username - Username of the user
   * @param req - HTTP request for IP and user agent
   */
  public async logLogin(userId: string, username: string, req?: Request) {
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
  public async logLogout(userId: string, username: string, req?: Request) {
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
  public async logPasswordChange(userId: string, username: string, req?: Request) {
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

  /**
   * Extract IP address from request
   * Handles proxy forwarding headers
   * @param req - HTTP request
   * @returns IP address string
   */
  private getIpAddress(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
