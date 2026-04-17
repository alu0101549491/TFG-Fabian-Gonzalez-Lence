/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/domain/entities/standing.entity.ts
 * @desc TypeORM entity representing tournament standings.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, UpdateDateColumn} from 'typeorm';

/**
 * Standing entity representing participant standings in a category.
 */
@Entity('standings')
export class Standing {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public tournamentId!: string;

  @Column('varchar', {length: 50})
  public categoryId!: string;

  @Column('varchar', {length: 50, nullable: true})
  public participantId!: string | null;

  /** For doubles standings: team ID instead of individual participant ID */
  @Column('varchar', {length: 50, nullable: true})
  public teamId!: string | null;

  @Column('int', {default: 0})
  public matchesPlayed!: number;

  @Column('int', {default: 0})
  public wins!: number;

  @Column('int', {default: 0})
  public losses!: number;

  @Column('int', {default: 0})
  public draws!: number;

  @Column('int', {default: 0})
  public points!: number;

  @Column('int')
  public rank!: number;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
