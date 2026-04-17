/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file backend/src/domain/entities/partner-invitation.entity.ts
 * @desc TypeORM entity for partner invitations in doubles tournament registration
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn} from 'typeorm';
import {Tournament} from './tournament.entity';
import {Category} from './category.entity';
import {User} from './user.entity';
import {Registration} from './registration.entity';

/**
 * Enum for partner invitation status
 */
export enum PartnerInvitationStatus {
  PENDING = 'PENDING',       // Waiting for invitee response
  ACCEPTED = 'ACCEPTED',     // Invitee accepted, registrations created
  DECLINED = 'DECLINED',     // Invitee declined the invitation
  CANCELLED = 'CANCELLED',   // Inviter cancelled the invitation
}

/**
 * Partner Invitation Entity
 * 
 * Represents an invitation sent by one player to another to form a doubles pair for a tournament.
 * 
 * Workflow:
 * 1. Player A (inviter) selects Player B (invitee) as partner
 * 2. System creates PartnerInvitation with PENDING status
 * 3. Player B receives notification and can accept/decline
 * 4. If ACCEPTED: Both players get registrations created (waiting for admin approval)
 * 5. If DECLINED or CANCELLED: Invitation becomes inactive
 * 
 * Business Rules:
 * - Only one active invitation per player per tournament
 * - Inviter and invitee cannot be the same user
 * - Both players must be eligible (active, PLAYER role, not already registered)
 * - Tournament must be DOUBLES type
 * - If one partner withdraws registration, both are withdrawn automatically
 */
@Entity('partner_invitations')
export class PartnerInvitation {
  @PrimaryColumn({type: 'varchar', length: 50})
  id!: string;

  @Column({type: 'varchar', length: 50})
  tournamentId!: string;

  @Column({type: 'varchar', length: 50})
  categoryId!: string;

  @Column({type: 'varchar', length: 50})
  inviterId!: string;

  @Column({type: 'varchar', length: 50})
  inviteeId!: string;

  @Column({
    type: 'enum',
    enum: PartnerInvitationStatus,
    default: PartnerInvitationStatus.PENDING,
  })
  status!: PartnerInvitationStatus;

  @Column({type: 'text', nullable: true})
  message?: string;

  @CreateDateColumn({type: 'timestamp'})
  createdAt!: Date;

  @Column({type: 'timestamp', nullable: true})
  respondedAt?: Date;

  @Column({type: 'varchar', length: 50, nullable: true})
  inviterRegistrationId?: string;

  @Column({type: 'varchar', length: 50, nullable: true})
  inviteeRegistrationId?: string;

  // Relations
  @ManyToOne(() => Tournament, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'tournamentId'})
  tournament?: Tournament;

  @ManyToOne(() => Category, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'categoryId'})
  category?: Category;

  @ManyToOne(() => User, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'inviterId'})
  inviter?: User;

  @ManyToOne(() => User, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'inviteeId'})
  invitee?: User;

  @ManyToOne(() => Registration, {onDelete: 'SET NULL', nullable: true})
  @JoinColumn({name: 'inviterRegistrationId'})
  inviterRegistration?: Registration;

  @ManyToOne(() => Registration, {onDelete: 'SET NULL', nullable: true})
  @JoinColumn({name: 'inviteeRegistrationId'})
  inviteeRegistration?: Registration;
}
