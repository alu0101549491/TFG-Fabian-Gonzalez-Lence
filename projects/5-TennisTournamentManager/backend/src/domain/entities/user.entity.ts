/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/domain/entities/user.entity.ts
 * @desc TypeORM entity representing a system user with authentication and authorization.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import {UserRole} from '../enumerations/user-role';
import {Tournament} from './tournament.entity';
import {Registration} from './registration.entity';
import {Notification} from './notification.entity';

/**
 * User entity representing system users with role-based access control.
 */
@Entity('users')
export class User {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50, unique: true, nullable: true})
  public username!: string | null;

  @Column('varchar', {length: 100, unique: true})
  public email!: string;

  @Column('varchar', {length: 255})
  public passwordHash!: string;

  @Column('varchar', {length: 100})
  public firstName!: string;

  @Column('varchar', {length: 100})
  public lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PLAYER,
  })
  public role!: UserRole;

  @Column('boolean', {default: true})
  public isActive!: boolean;

  @Column('varchar', {length: 20, nullable: true})
  public phone!: string | null;

  @Column('varchar', {length: 500, nullable: true})
  public avatarUrl!: string | null;

  @Column('varchar', {length: 20, nullable: true})
  public idDocument!: string | null;

  @Column('int', {nullable: true})
  public ranking!: number | null;

  @Column('boolean', {default: false})
  public gdprConsent!: boolean;

  @Column('boolean', {default: false})
  public isGuest!: boolean;

  @Column('json', {nullable: true})
  public privacySettings!: Record<string, string | boolean> | null;

  @Column('varchar', {length: 50, nullable: true})
  public telegram!: string | null;

  @Column('varchar', {length: 20, nullable: true})
  public whatsapp!: string | null;

  @Column('varchar', {length: 100, nullable: true})
  public telegramChatId!: string | null;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  @Column('timestamp', {nullable: true})
  public lastLogin!: Date | null;

  // Relationships
  @OneToMany(() => Tournament, (tournament) => tournament.organizer)
  public organizedTournaments!: Tournament[];

  @OneToMany(() => Registration, (registration) => registration.participant)
  public registrations!: Registration[];

  @OneToMany(() => Notification, (notification) => notification.user)
  public notifications!: Notification[];
}
