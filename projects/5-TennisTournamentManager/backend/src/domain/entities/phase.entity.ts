/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/phase.entity.ts
 * @desc TypeORM entity representing a phase within a bracket (e.g., Round of 16, Quarterfinals).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import {Bracket} from './bracket.entity';
import {Match} from './match.entity';

/**
 * Phase entity representing a round/phase in a bracket.
 */
@Entity('phases')
export class Phase {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public bracketId!: string;

  @Column('varchar', {length: 50, nullable: true})
  public tournamentId!: string | null;

  @Column('varchar', {length: 100})
  public name!: string;

  @Column('int')
  public order!: number;

  @Column('int', {default: 0})
  public sequenceOrder!: number;

  @Column('int')
  public matchCount!: number;

  @Column('varchar', {length: 50, nullable: true})
  public nextPhaseId!: string | null;

  @Column('boolean', {default: false})
  public isCompleted!: boolean;

  // Relationships
  @ManyToOne(() => Bracket, (bracket) => bracket.phases)
  @JoinColumn({name: 'bracketId'})
  public bracket!: Bracket;

  @OneToMany(() => Match, (match) => match.phase)
  public matches!: Match[];
}
