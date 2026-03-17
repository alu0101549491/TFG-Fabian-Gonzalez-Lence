/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/bracket.entity.ts
 * @desc TypeORM entity representing a tournament bracket/draw.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import {BracketType} from '../enumerations/bracket-type';
import {Tournament} from './tournament.entity';
import {Category} from './category.entity';
import {Phase} from './phase.entity';
import {Match} from './match.entity';

/**
 * Bracket entity representing a tournament draw/bracket.
 */
@Entity('brackets')
export class Bracket {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public tournamentId!: string;

  @Column('varchar', {length: 50})
  public categoryId!: string;

  @Column({
    type: 'enum',
    enum: BracketType,
  })
  public bracketType!: BracketType;

  @Column('int')
  public size!: number;

  @Column('int')
  public totalRounds!: number;

  @Column('jsonb', {nullable: true})
  public structure!: Record<string, unknown> | null;

  @Column('boolean', {default: false})
  public isPublished!: boolean;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Tournament)
  @JoinColumn({name: 'tournamentId'})
  public tournament!: Tournament;

  @ManyToOne(() => Category, (category) => category.brackets)
  @JoinColumn({name: 'categoryId'})
  public category!: Category;

  @OneToMany(() => Phase, (phase) => phase.bracket)
  public phases!: Phase[];

  @OneToMany(() => Match, (match) => match.bracket)
  public matches!: Match[];
}
