/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/match.entity.ts
 * @desc TypeORM entity representing a tennis match.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import {MatchStatus} from '../enumerations/match-status';
import {Bracket} from './bracket.entity';
import {Phase} from './phase.entity';
import {Court} from './court.entity';
import {Score} from './score.entity';

/**
 * Match entity representing a tennis match.
 */
@Entity('matches')
export class Match {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public bracketId!: string;

  @Column('varchar', {length: 50, nullable: true})
  public phaseId!: string | null;

  @Column('int')
  public round!: number;

  @Column('int')
  public matchNumber!: number;

  @Column('varchar', {length: 50, nullable: true})
  public participant1Id!: string | null;

  @Column('varchar', {length: 50, nullable: true})
  public participant2Id!: string | null;

  @Column('varchar', {length: 50, nullable: true})
  public winnerId!: string | null;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  public status!: MatchStatus;

  @Column('varchar', {length: 50, nullable: true})
  public courtId!: string | null;

  @Column('timestamp', {nullable: true})
  public scheduledTime!: Date | null;

  @Column('timestamp', {nullable: true})
  public startTime!: Date | null;

  @Column('timestamp', {nullable: true})
  public endTime!: Date | null;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Bracket, (bracket) => bracket.matches)
  @JoinColumn({name: 'bracketId'})
  public bracket!: Bracket;

  @ManyToOne(() => Phase, (phase) => phase.matches)
  @JoinColumn({name: 'phaseId'})
  public phase!: Phase | null;

  @ManyToOne(() => Court)
  @JoinColumn({name: 'courtId'})
  public court!: Court | null;

  @OneToMany(() => Score, (score) => score.match)
  public scores!: Score[];
}
