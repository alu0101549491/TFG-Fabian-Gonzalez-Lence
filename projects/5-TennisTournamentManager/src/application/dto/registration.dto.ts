/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/registration.dto.ts
 * @desc Data transfer objects for registration-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {TournamentDto} from './tournament.dto';
import {CategoryDto} from './category.dto';

/** DTO for creating a registration. */
export interface CreateRegistrationDto {
  tournamentId: string;
  categoryId: string;
}

/** DTO for registration output representation. */
export interface RegistrationDto {
  id: string;
  participantId: string;
  tournamentId: string;
  categoryId: string;
  status: RegistrationStatus;
  acceptanceType: AcceptanceType;
  seed: number | null;
  registeredAt: Date;
  tournament?: TournamentDto;
  category?: CategoryDto;
}

/** DTO for updating a registration status. */
export interface UpdateRegistrationStatusDto {
  registrationId: string;
  status: RegistrationStatus;
  seed?: number | null;
  acceptanceType?: AcceptanceType;
}
