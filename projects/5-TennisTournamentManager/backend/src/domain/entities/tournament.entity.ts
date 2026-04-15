/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/tournament.entity.ts
 * @desc TypeORM entity representing a tennis tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import {TournamentStatus} from '../enumerations/tournament-status';
import {TournamentType} from '../enumerations/tournament-type';
import {Surface} from '../enumerations/surface';
import {FacilityType} from '../enumerations/facility-type';
import {RankingSystem} from '../enumerations/ranking-system';
import {User} from './user.entity';
import {Category} from './category.entity';
import {Court} from './court.entity';
import {Registration} from './registration.entity';

/**
 * Tournament entity representing a tennis tournament.
 */
@Entity('tournaments')
export class Tournament {
  @PrimaryColumn('varchar', {length: 50})
  public id!: string;

  @Column('varchar', {length: 200})
  public name!: string;

  @Column('varchar', {length: 500, nullable: true})
  public logoUrl!: string | null;

  @Column('text', {nullable: true})
  public description!: string | null;

  // NFR18: Visual Customization
  @Column('varchar', {length: 7, nullable: true, default: '#2563eb'})
  public primaryColor!: string | null; // Hex color for primary branding

  @Column('varchar', {length: 7, nullable: true, default: '#10b981'})
  public secondaryColor!: string | null; // Hex color for secondary/accent

  @Column('varchar', {length: 500, nullable: true})
  public bannerUrl!: string | null; // Tournament banner/header image

  @Column('timestamp')
  public startDate!: Date;

  @Column('timestamp')
  public endDate!: Date;

  @Column('varchar', {length: 200})
  public location!: string;

  @Column({
    type: 'enum',
    enum: Surface,
    default: Surface.HARD,
  })
  public surface!: Surface;

  @Column({
    type: 'enum',
    enum: FacilityType,
    default: FacilityType.OUTDOOR,
  })
  public facilityType!: FacilityType;

  @Column('text', {nullable: true})
  public regulations!: string | null;

  @Column({
    type: 'enum',
    enum: TournamentType,
    default: TournamentType.SINGLES,
  })
  public tournamentType!: TournamentType;

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.DRAFT,
  })
  public status!: TournamentStatus;

  @Column('int')
  public maxParticipants!: number;

  @Column('decimal', {precision: 10, scale: 2, default: 0})
  public registrationFee!: number;

  @Column('varchar', {length: 3, default: 'EUR'})
  public currency!: string;

  @Column({
    type: 'enum',
    enum: RankingSystem,
    default: RankingSystem.POINTS_BASED,
  })
  public rankingSystem!: RankingSystem;

  @Column('varchar', {length: 50})
  public organizerId!: string;

  @Column('timestamp', {nullable: true})
  public registrationOpenDate!: Date | null;

  @Column('timestamp', {nullable: true})
  public registrationCloseDate!: Date | null;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.organizedTournaments)
  @JoinColumn({name: 'organizerId'})
  public organizer!: User;

  @OneToMany(() => Category, (category) => category.tournament)
  public categories!: Category[];

  @OneToMany(() => Court, (court) => court.tournament)
  public courts!: Court[];

  @OneToMany(() => Registration, (registration) => registration.tournament)
  public registrations!: Registration[];
}
