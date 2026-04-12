/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/registration-service.interface.ts
 * @desc Registration service interface for tournament participant registration management
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {CreateRegistrationDto, RegistrationDto, UpdateRegistrationStatusDto} from '../dto';

/**
 * Registration service interface.
 * Handles participant registration for tournaments and categories.
 */
export interface IRegistrationService {
  /**
   * Registers a participant for a tournament category.
   *
   * @param data - Registration data
   * @param participantId - ID of the participant registering
    * @param allowAdminOverride - If true, skips tournament open-status check for admin/manual enrollment flows
   * @returns Created registration information
   */
    registerParticipant(data: CreateRegistrationDto, participantId: string, allowAdminOverride?: boolean): Promise<RegistrationDto>;

  /**
   * Updates the status of a registration.
   *
   * @param data - Registration status update data
   * @param adminId - ID of the administrator performing the update
   * @returns Updated registration information
   */
  updateStatus(data: UpdateRegistrationStatusDto, adminId: string): Promise<RegistrationDto>;

  /**
   * Withdraws a registration from a tournament.
   *
   * @param registrationId - ID of the registration to withdraw
   * @param time - Withdrawal time reference
   * @param userId - ID of the user performing the withdrawal
   */
  withdrawRegistration(registrationId: string, time: string, userId: string): Promise<void>;

  /**
   * Permanently deletes a registration record from the database.
   * Intended for cleaning up rejected or withdrawn registrations.
   *
   * @param registrationId - ID of the registration to delete
   */
  deleteRegistration(registrationId: string): Promise<void>;

  /**
   * Updates the seed number for a registration.
   *
   * @param registrationId - ID of the registration
   * @param seedNumber - New seed number (null to remove seed)
   * @param adminId - ID of the administrator performing the update
   * @returns Updated registration information
   */
  updateSeedNumber(registrationId: string, seedNumber: number | null, adminId: string): Promise<RegistrationDto>;

  /**
   * Retrieves all registrations for a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of registrations
   */
  getRegistrationsByTournament(tournamentId: string): Promise<RegistrationDto[]>;

  /**
   * Retrieves all registrations for a participant.
   *
   * @param participantId - ID of the participant
   * @returns List of registrations
   */
  getRegistrationsByParticipant(participantId: string): Promise<RegistrationDto[]>;

  /**
   * Retrieves all registrations for a category.
   *
   * @param categoryId - ID of the category
   * @returns List of registrations
   */
  getRegistrationsByCategory(categoryId: string): Promise<RegistrationDto[]>;
}
