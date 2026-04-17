/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/domain/entities/notification.entity.ts
 * @desc TypeORM entity representing a user notification.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import {NotificationType} from '../enumerations/notification-type';
import {NotificationChannel} from '../enumerations/notification-channel';
import {User} from './user.entity';

/**
 * Notification entity representing system notifications.
 */
@Entity('notifications')
export class Notification {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public userId!: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  public type!: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    array: true,
  })
  public channels!: NotificationChannel[];

  @Column('varchar', {length: 200})
  public title!: string;

  @Column('text')
  public message!: string;

  @Column('boolean', {default: false})
  public isRead!: boolean;

  @Column('jsonb', {nullable: true})
  public metadata!: Record<string, unknown> | null;

  @CreateDateColumn()
  public createdAt!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({name: 'userId'})
  public user!: User;
}
