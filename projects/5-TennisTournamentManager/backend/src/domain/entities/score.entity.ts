/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/score.entity.ts
 * @desc TypeORM entity representing a match score.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import {Match} from './match.entity';

/**
 * Score entity representing match scoring details.
 */
@Entity('scores')
export class Score {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public matchId!: string;

  @Column('int')
  public setNumber!: number;

  @Column('int')
  public player1Games!: number;

  @Column('int')
  public player2Games!: number;

  @Column('int', {nullable: true})
  public player1TiebreakPoints!: number | null;

  @Column('int', {nullable: true})
  public player2TiebreakPoints!: number | null;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Match, (match) => match.scores)
  @JoinColumn({name: 'matchId'})
  public match!: Match;
}
