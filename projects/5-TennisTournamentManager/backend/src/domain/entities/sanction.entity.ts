/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/domain/entities/sanction.entity.ts
 * @desc TypeORM entity representing participant sanctions/penalties.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn} from 'typeorm';
import {SanctionType} from '../enumerations/sanction-type';

/**
 * Sanction entity representing penalties applied to participants.
 */
@Entity('sanctions')
export class Sanction {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public matchId!: string;

  @Column('varchar', {length: 50})
  public participantId!: string;

  @Column({
    type: 'enum',
    enum: SanctionType,
  })
  public type!: SanctionType;

  @Column('text')
  public reason!: string;

  @Column('varchar', {length: 50})
  public issuedBy!: string;

  @CreateDateColumn()
  public createdAt!: Date;
}
