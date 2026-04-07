/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/announcement.entity.ts
 * @desc TypeORM entity representing tournament-wide announcements (FR47-FR49).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import {Tournament} from './tournament.entity';
import {User} from './user.entity';

/**
 * Announcement type enum.
 */
export enum AnnouncementType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

/**
 * Announcement entity for tournament announcements.
 * 
 * @remarks
 * Implements FR47-FR49:
 * - FR47: Public/Private announcement creation with rich content
 * - FR48: Tag system for categorization and filtering
 * - FR49: Scheduled publication and automatic expiration
 */
@Entity('announcements')
export class Announcement {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 50})
  public tournamentId!: string;

  @ManyToOne(() => Tournament, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'tournamentId'})
  public tournament!: Tournament;

  @Column('varchar', {length: 50})
  public authorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({name: 'authorId'})
  public author!: User;

  @Column({
    type: 'varchar',
    length: 20,
    default: AnnouncementType.PUBLIC,
  })
  public type!: AnnouncementType;

  @Column('varchar', {length: 200})
  public title!: string;

  @Column('varchar', {length: 250, nullable: true})
  public summary!: string | null;

  @Column('text', {nullable: true})
  public longText!: string | null;

  @Column('text', {nullable: true})
  public content!: string | null;

  @Column('varchar', {length: 500, nullable: true})
  public imageUrl!: string | null;

  @Column('varchar', {length: 500, nullable: true})
  public externalLink!: string | null;

  @Column('simple-array', {nullable: true})
  public tags!: string[] | null;

  @Column('boolean', {default: false})
  public isPublished!: boolean;

  @Column('boolean', {default: false})
  public isPinned!: boolean;

  @Column('timestamp', {nullable: true})
  public scheduledPublishAt!: Date | null;

  @Column('timestamp', {nullable: true})
  public expirationDate!: Date | null;

  @Column('timestamp', {nullable: true})
  public publishedAt!: Date | null;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
