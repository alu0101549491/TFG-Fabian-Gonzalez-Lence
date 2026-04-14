/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 31, 2026
 * @file domain/entities/match-result.entity.ts
 * @desc TypeORM entity for match result submissions with confirmation workflow (FR24-FR27).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import {Match} from './match.entity';
import {User} from './user.entity';
import {DoublesTeam} from './doubles-team.entity';

/**
 * Confirmation status for match results.
 */
export enum ConfirmationStatus {
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  DISPUTED = 'DISPUTED',
  ANNULLED = 'ANNULLED',
}

/**
 * MatchResult entity tracking result submissions and confirmation workflow.
 * 
 * Workflow (FR24-FR27):
 * 1. Participant submits → PENDING_CONFIRMATION
 * 2. Opponent confirms → CONFIRMED
 * 3. Opponent disputes → DISPUTED (admin review)
 * 4. Admin validates → CONFIRMED
 * 5. Admin annuls → ANNULLED
 */
@Entity('match_results')
export class MatchResult {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public matchId!: string;

  @Column('varchar', {length: 50})
  public submittedBy!: string;

  @Column('varchar', {length: 50, nullable: true})
  public winnerId!: string | null;

  @Column('varchar', {length: 50, nullable: true})
  public winnerTeamId!: string | null;

  @Column('simple-array')
  public setScores!: string[];

  @Column('int')
  public player1Games!: number;

  @Column('int')
  public player2Games!: number;

  @Column({
    type: 'enum',
    enum: ConfirmationStatus,
    default: ConfirmationStatus.PENDING_CONFIRMATION,
  })
  public confirmationStatus!: ConfirmationStatus;

  @Column('varchar', {length: 50, nullable: true})
  public confirmedBy!: string | null;

  @Column('timestamp', {nullable: true})
  public confirmedAt!: Date | null;

  @Column('text', {nullable: true})
  public playerComments!: string | null;

  @Column('text', {nullable: true})
  public adminNotes!: string | null;

  @Column('text', {nullable: true})
  public disputeReason!: string | null;

  @Column('timestamp', {nullable: true})
  public disputedAt!: Date | null;

  @Column('boolean', {default: false})
  public isAdminEntry!: boolean;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Match)
  @JoinColumn({name: 'matchId'})
  public match!: Match;

  @ManyToOne(() => User)
  @JoinColumn({name: 'submittedBy'})
  public submitter!: User;

  @ManyToOne(() => User, {nullable: true})
  @JoinColumn({name: 'winnerId'})
  public winner!: User | null;

  @ManyToOne(() => DoublesTeam, {nullable: true})
  @JoinColumn({name: 'winnerTeamId'})
  public winnerTeam!: DoublesTeam | null;

  @ManyToOne(() => User, {nullable: true})
  @JoinColumn({name: 'confirmedBy'})
  public confirmer!: User | null;
}
