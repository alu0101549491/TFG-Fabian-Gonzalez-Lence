/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 13, 2026
 * @file domain/entities/doubles-team.entity.ts
 * @desc TypeORM entity representing a doubles pair that acts as a single bracket slot.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import {User} from './user.entity';
import {Tournament} from './tournament.entity';
import {Category} from './category.entity';
import {Registration} from './registration.entity';

/**
 * DoublesTeam entity representing a pair of players registered together
 * for a doubles tournament category. Acts as a single bracket slot.
 */
@Entity('doubles_teams')
export class DoublesTeam {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public tournamentId!: string;

  @Column('varchar', {length: 50})
  public categoryId!: string;

  /** User ID of the first player (invitation sender) */
  @Column('varchar', {length: 50})
  public player1Id!: string;

  /** User ID of the second player (invitation receiver) */
  @Column('varchar', {length: 50})
  public player2Id!: string;

  /** Registration ID for player 1 */
  @Column('varchar', {length: 50, nullable: true})
  public registration1Id!: string | null;

  /** Registration ID for player 2 */
  @Column('varchar', {length: 50, nullable: true})
  public registration2Id!: string | null;

  /**
   * Combined seed number for this pair.
   * Derived from the average of both players' individual rankings.
   */
  @Column('int', {nullable: true})
  public seedNumber!: number | null;

  @CreateDateColumn()
  public createdAt!: Date;

  // Relationships
  @ManyToOne(() => Tournament)
  @JoinColumn({name: 'tournamentId'})
  public tournament!: Tournament;

  @ManyToOne(() => Category)
  @JoinColumn({name: 'categoryId'})
  public category!: Category;

  @ManyToOne(() => User)
  @JoinColumn({name: 'player1Id'})
  public player1!: User;

  @ManyToOne(() => User)
  @JoinColumn({name: 'player2Id'})
  public player2!: User;

  @ManyToOne(() => Registration, {nullable: true})
  @JoinColumn({name: 'registration1Id'})
  public registration1!: Registration | null;

  @ManyToOne(() => Registration, {nullable: true})
  @JoinColumn({name: 'registration2Id'})
  public registration2!: Registration | null;
}
