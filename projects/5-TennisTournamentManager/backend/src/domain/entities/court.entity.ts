/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/domain/entities/court.entity.ts
 * @desc TypeORM entity representing a tennis court.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, ManyToOne, JoinColumn} from 'typeorm';
import {Surface} from '../enumerations/surface';
import {Tournament} from './tournament.entity';

/**
 * Court entity representing a tennis court.
 */
@Entity('courts')
export class Court {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public tournamentId!: string;

  @Column('varchar', {length: 100})
  public name!: string;

  @Column({
    type: 'enum',
    enum: Surface,
  })
  public surface!: Surface;

  @Column('boolean', {default: true})
  public isAvailable!: boolean;

  /**
   * Court opening time in HH:MM format (24-hour).
   * Represents when the court becomes available for scheduling.
   * @example "08:00"
   */
  @Column('varchar', {length: 5, nullable: true})
  public openingTime!: string | null;

  /**
   * Court closing time in HH:MM format (24-hour).
   * Represents when the court is no longer available for scheduling.
   * @example "22:00"
   */
  @Column('varchar', {length: 5, nullable: true})
  public closingTime!: string | null;

  // Relationships
  @ManyToOne(() => Tournament, (tournament) => tournament.courts)
  @JoinColumn({name: 'tournamentId'})
  public tournament!: Tournament;
}
