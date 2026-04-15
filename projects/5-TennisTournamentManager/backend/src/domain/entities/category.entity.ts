/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/category.entity.ts
 * @desc TypeORM entity representing a tournament category (e.g., Men's Singles, Women's Doubles).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import {Tournament} from './tournament.entity';
import {Bracket} from './bracket.entity';
import {Registration} from './registration.entity';

/**
 * Category entity representing a tournament category.
 */
@Entity('categories')
export class Category {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public tournamentId!: string;

  @Column('varchar', {length: 100})
  public name!: string;

  @Column('varchar', {length: 20})
  public gender!: string;

  @Column('varchar', {length: 50})
  public ageGroup!: string;

  @Column('int')
  public maxParticipants!: number;

  // Relationships
  @ManyToOne(() => Tournament, (tournament) => tournament.categories)
  @JoinColumn({name: 'tournamentId'})
  public tournament!: Tournament;

  @OneToMany(() => Bracket, (bracket) => bracket.category)
  public brackets!: Bracket[];

  @OneToMany(() => Registration, (registration) => registration.category)
  public registrations!: Registration[];
}
