/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 9, 2026
 * @file backend/src/domain/entities/push-subscription.entity.ts
 * @desc TypeORM entity representing a user's web push notification subscription.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import {User} from './user.entity';

/**
 * Push subscription entity for storing user web push subscriptions.
 * Each subscription represents a browser/device that can receive push notifications.
 */
@Entity('push_subscriptions')
export class PushSubscription {
  /**
   * Unique subscription ID.
   */
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  /**
   * ID of the user who owns this subscription.
   */
  @Column('varchar', {length: 50})
  public userId!: string;

  /**
   * Push subscription endpoint URL.
   */
  @Column('text')
  public endpoint!: string;

  /**
   * P256DH public key for encryption (base64).
   */
  @Column('varchar', {length: 255})
  public p256dhKey!: string;

  /**
   * Auth secret for encryption (base64).
   */
  @Column('varchar', {length: 255})
  public authKey!: string;

  /**
   * User agent string of the browser (for debugging).
   */
  @Column('varchar', {length: 500, nullable: true})
  public userAgent!: string | null;

  /**
   * When the subscription was created.
   */
  @CreateDateColumn()
  public createdAt!: Date;

  /**
   * User relationship.
   */
  @ManyToOne(() => User, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  public user!: User;
}
