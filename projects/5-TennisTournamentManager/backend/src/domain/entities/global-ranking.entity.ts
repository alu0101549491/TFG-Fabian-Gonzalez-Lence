/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/domain/entities/global-ranking.entity.ts
 * @desc TypeORM entity representing global player rankings across all tournaments.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, UpdateDateColumn} from 'typeorm';

/**
 * GlobalRanking entity for player rankings across all tournaments.
 */
@Entity('global_rankings')
export class GlobalRanking {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50, unique: true})
  public playerId!: string;

  @Column('int')
  public rank!: number;

  @Column('int', {default: 0})
  public points!: number;

  @Column('int', {default: 0})
  public tournamentsPlayed!: number;

  @Column('int', {default: 0})
  public wins!: number;

  @Column('int', {default: 0})
  public losses!: number;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
