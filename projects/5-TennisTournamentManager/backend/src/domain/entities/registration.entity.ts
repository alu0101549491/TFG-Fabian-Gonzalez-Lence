/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/domain/entities/registration.entity.ts
 * @desc TypeORM entity representing a participant's registration to a tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index} from 'typeorm';
import {RegistrationStatus} from '../enumerations/registration-status';
import {AcceptanceType} from '../enumerations/acceptance-type';
import {User} from './user.entity';
import {Tournament} from './tournament.entity';
import {Category} from './category.entity';

/**
 * Registration entity representing a tournament registration.
 */
@Entity('registrations')
@Index('idx_registration_active_category_participant_unique', ['categoryId', 'participantId'], {
  unique: true,
  where: `status NOT IN ('CANCELLED', 'WITHDRAWN')`,
})
export class Registration {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public tournamentId!: string;

  @Column('varchar', {length: 50})
  public categoryId!: string;

  @Column('varchar', {length: 50})
  public participantId!: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  public status!: RegistrationStatus;

  @Column({
    type: 'enum',
    enum: AcceptanceType,
    default: AcceptanceType.DIRECT_ACCEPTANCE,
  })
  public acceptanceType!: AcceptanceType;

  @Column('int', {nullable: true})
  public seedNumber!: number | null;

  /** FR13: Timestamp of when the participant formally withdrew. Null if not withdrawn. */
  @Column('timestamp', {nullable: true})
  public withdrawalDate!: Date | null;

  /** FR15: ID of the doubles partner user. Null for singles registrations. */
  @Column('varchar', {length: 50, nullable: true})
  public partnerId!: string | null;

  @CreateDateColumn()
  public registrationDate!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.registrations)
  @JoinColumn({name: 'participantId'})
  public participant!: User;

  @ManyToOne(() => Tournament, (tournament) => tournament.registrations)
  @JoinColumn({name: 'tournamentId'})
  public tournament!: Tournament;

  @ManyToOne(() => Category, (category) => category.registrations)
  @JoinColumn({name: 'categoryId'})
  public category!: Category;

  /** FR15: Doubles partner user (eager-loaded when partnerId is set). */
  @ManyToOne(() => User, {nullable: true, eager: false})
  @JoinColumn({name: 'partnerId'})
  public partner!: User | null;
}
