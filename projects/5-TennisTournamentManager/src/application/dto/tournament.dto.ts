/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/tournament.dto.ts
 * @desc Data transfer objects for tournament-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {Surface} from '@domain/enumerations/surface';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {RankingSystem} from '@domain/enumerations/ranking-system';

/** DTO for creating a tournament. */
export interface CreateTournamentDto {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  surface: Surface;
  maxParticipants: number;
  registrationFee?: number;
  currency?: string;
  acceptanceType?: AcceptanceType;
  rankingSystem?: RankingSystem;
  registrationOpenDate?: Date;
  registrationCloseDate?: Date;
}

/** DTO for updating a tournament. */
export interface UpdateTournamentDto {
  id: string;
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  surface?: Surface;
  maxParticipants?: number;
  registrationFee?: number;
  acceptanceType?: AcceptanceType;
  rankingSystem?: RankingSystem;
  status?: TournamentStatus;
}

/** DTO for tournament output representation. */
export interface TournamentDto {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  surface: Surface;
  status: TournamentStatus;
  maxParticipants: number;
  registrationFee: number;
  currency: string;
  acceptanceType: AcceptanceType;
  rankingSystem: RankingSystem;
  organizerId: string;
  createdAt: Date;
}

/** DTO for tournament filtering/search. */
export interface TournamentFilterDto {
  status?: TournamentStatus;
  surface?: Surface;
  location?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  search?: string;
}
