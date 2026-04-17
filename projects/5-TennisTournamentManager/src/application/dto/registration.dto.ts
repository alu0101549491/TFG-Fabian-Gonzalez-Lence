/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/dto/registration.dto.ts
 * @desc Data transfer objects for registration-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {TournamentDto} from './tournament.dto';
import {CategoryDto} from './category.dto';
import {UserDto} from './user.dto';

/** DTO for creating a registration. */
export interface CreateRegistrationDto {
  tournamentId: string;
  categoryId: string;
  /** FR15: Optional doubles partner user ID. */
  partnerId?: string | null;
}

/** DTO for registration output representation. */
export interface RegistrationDto {
  id: string;
  participantId: string;
  tournamentId: string;
  categoryId: string;
  status: RegistrationStatus;
  acceptanceType: AcceptanceType;
  seedNumber: number | null;
  /** FR13: Timestamp of formal withdrawal. Null if not withdrawn. */
  withdrawalDate?: Date | null;
  /** FR15: ID of the doubles partner. Null for singles registrations. */
  partnerId?: string | null;
  /** FR15: Resolved partner user object (loaded via relation). Null for singles or unset. */
  partner?: UserDto | null;
  registeredAt: Date;
  tournament?: TournamentDto;
  category?: CategoryDto;
}

/** DTO for updating a registration status. */
export interface UpdateRegistrationStatusDto {
  registrationId: string;
  status: RegistrationStatus;
  seedNumber?: number | null;
  acceptanceType?: AcceptanceType;
}
