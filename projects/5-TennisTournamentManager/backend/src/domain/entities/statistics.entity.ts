/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/domain/entities/statistics.entity.ts
 * @desc TypeORM entity representing player statistics.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, UpdateDateColumn} from 'typeorm';

/**
 * Statistics entity for player performance metrics.
 */
@Entity('statistics')
export class Statistics {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public playerId!: string;

  @Column('varchar', {length: 50, nullable: true})
  public tournamentId!: string | null;

  @Column('int', {default: 0})
  public matchesPlayed!: number;

  @Column('int', {default: 0})
  public wins!: number;

  @Column('int', {default: 0})
  public losses!: number;

  @Column('int', {default: 0})
  public setsWon!: number;

  @Column('int', {default: 0})
  public setsLost!: number;

  @Column('int', {default: 0})
  public gamesWon!: number;

  @Column('int', {default: 0})
  public gamesLost!: number;

  @Column('decimal', {precision: 5, scale: 2, default: 0})
  public winRate!: number;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
