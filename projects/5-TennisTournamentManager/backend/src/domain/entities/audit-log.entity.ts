/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file backend/src/domain/entities/audit-log.entity.ts
 * @desc TypeORM entity for audit logging of critical system actions (NFR15)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index} from 'typeorm';
import {User} from './user.entity';
import {AuditAction} from '../enumerations/audit-action';
import {AuditResourceType} from '../enumerations/audit-resource-type';

/**
 * AuditLog entity for tracking critical system actions and changes.
 * Provides comprehensive audit trail for compliance (NFR15) and security monitoring.
 * 
 * Records include:
 * - Who performed the action (userId)
 * - What action was performed (action)
 * - What resource was affected (resourceType, resourceId)
 * - When it occurred (timestamp)
 * - Additional context (details, IP address, user agent)
 * - State changes (oldValue, newValue)
 * 
 * @example
 * ```typescript
 * const auditLog = new AuditLog();
 * auditLog.userId = 'user-123';
 * auditLog.action = AuditAction.RESULT_CONFIRM;
 * auditLog.resourceType = AuditResourceType.MATCH_RESULT;
 * auditLog.resourceId = 'result-456';
 * auditLog.details = 'Match result confirmed by player';
 * ```
 */
@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['resourceType'])
@Index(['resourceId'])
@Index(['timestamp'])
export class AuditLog {
  /**
   * Unique identifier for the audit log entry
   */
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  /**
   * ID of the user who performed the action (nullable for system actions)
   */
  @Column('varchar', {length: 50, nullable: true})
  public userId!: string | null;

  /**
   * Type of action performed
   * @see {AuditAction}
   */
  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  public action!: AuditAction;

  /**
   * Type of resource affected by the action
   * @see {AuditResourceType}
   */
  @Column({
    type: 'enum',
    enum: AuditResourceType,
  })
  public resourceType!: AuditResourceType;

  /**
   * ID of the affected resource (e.g., match ID, tournament ID)
   */
  @Column('varchar', {length: 50, nullable: true})
  public resourceId!: string | null;

  /**
   * Human-readable name of the affected resource
   */
  @Column('varchar', {length: 255, nullable: true})
  public resourceName!: string | null;

  /**
   * Previous value before the action (JSON string)
   * Used for tracking state changes (e.g., old score, old status)
   */
  @Column('text', {nullable: true})
  public oldValue!: string | null;

  /**
   * New value after the action (JSON string)
   * Used for tracking state changes (e.g., new score, new status)
   */
  @Column('text', {nullable: true})
  public newValue!: string | null;

  /**
   * IP address from which the action was performed
   * Used for security monitoring and forensic analysis
   */
  @Column('varchar', {length: 45, nullable: true})
  public ipAddress!: string | null;

  /**
   * User agent (browser/client) from the request
   * Helps identify the client application used
   */
  @Column('varchar', {length: 500, nullable: true})
  public userAgent!: string | null;

  /**
   * Timestamp when the action occurred
   * Automatically set on creation
   */
  @CreateDateColumn()
  public timestamp!: Date;

  /**
   * Additional contextual details about the action
   * Free-form text field for action-specific information
   */
  @Column('text', {nullable: true})
  public details!: string | null;

  /**
   * Relationship to the user who performed the action
   * Nullable to support system-initiated actions
   */
  @ManyToOne(() => User, {nullable: true})
  @JoinColumn({name: 'userId'})
  public user!: User | null;
}
