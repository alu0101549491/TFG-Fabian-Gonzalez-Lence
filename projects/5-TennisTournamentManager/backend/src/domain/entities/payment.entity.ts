/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/domain/entities/payment.entity.ts
 * @desc TypeORM entity representing tournament registration payments.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import {PaymentStatus} from '../enumerations/payment-status';

/**
 * Payment entity representing tournament registration payments.
 */
@Entity('payments')
export class Payment {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public registrationId!: string;

  @Column('varchar', {length: 50})
  public userId!: string;

  @Column('decimal', {precision: 10, scale: 2})
  public amount!: number;

  @Column('varchar', {length: 3})
  public currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  public status!: PaymentStatus;

  @Column('varchar', {length: 100, nullable: true})
  public transactionId!: string | null;

  @Column('varchar', {length: 50, nullable: true})
  public paymentMethod!: string | null;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
