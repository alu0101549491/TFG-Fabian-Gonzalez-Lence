/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/order-of-play.entity.ts
 * @desc TypeORM entity representing the daily match schedule (Order of Play).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';

/**
 * OrderOfPlay entity representing the match schedule for a specific date.
 */
@Entity('order_of_play')
export class OrderOfPlay {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public tournamentId!: string;

  @Column('date')
  public date!: Date;

  @Column('jsonb')
  public matches!: Array<{
    matchId: string;
    courtId: string;
    time: string;
    participants: string[];
  }>;

  @Column('boolean', {default: false})
  public isPublished!: boolean;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
