/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/registration.service.ts
 * @desc Registration service implementation for tournament participant registration
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {IRegistrationService} from '../interfaces/registration-service.interface';
import {CreateRegistrationDto, RegistrationDto, UpdateRegistrationStatusDto} from '../dto';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';
import {TournamentRepositoryImpl} from '@infrastructure/repositories/tournament.repository';
import {CategoryRepositoryImpl} from '@infrastructure/repositories/category.repository';
import {UserRepositoryImpl} from '@infrastructure/repositories/user.repository';
import {NotificationService} from './notification.service';
import {Registration} from '@domain/entities/registration';
import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {generateId} from '@shared/utils';

/**
 * Registration service implementation.
 * Handles participant registration for tournaments and categories.
 */
@Injectable({providedIn: 'root'})
export class RegistrationService implements IRegistrationService {
  private readonly registrationRepository = inject(RegistrationRepositoryImpl);
  private readonly tournamentRepository = inject(TournamentRepositoryImpl);
  private readonly categoryRepository = inject(CategoryRepositoryImpl);
  private readonly userRepository = inject(UserRepositoryImpl);
  private readonly notificationService = inject(NotificationService);
  // TODO: inject QuotaManager

  /**
   * Registers a participant for a tournament category.
   *
   * @param data - Registration data
   * @param participantId - ID of the participant registering
   * @returns Created registration information
   */
  public async registerParticipant(data: CreateRegistrationDto, participantId: string): Promise<RegistrationDto> {
    // Validate input
    if (!data.tournamentId || data.tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!data.categoryId || data.categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }
    
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    // FR9 Requirement: Validate participant has completed profile (ID/NIE required)
    const participant = await this.userRepository.findById(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }
    
    if (!participant.idDocument || participant.idDocument.trim().length === 0) {
      throw new Error('Profile incomplete: ID/NIE document is required for tournament registration. Please complete your profile.');
    }
    
    // Check if tournament exists and is accepting registrations
    const tournament = await this.tournamentRepository.findById(data.tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Check if tournament is open for registration
    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      throw new Error('Tournament is not accepting registrations');
    }
    
    // Check if category exists
    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Check if participant is already registered for this category
    const existingRegistrations = await this.registrationRepository.findByCategoryId(data.categoryId);
    const alreadyRegistered = existingRegistrations.some(
      reg => reg.participantId === participantId &&
             reg.status !== RegistrationStatus.WITHDRAWN &&
             reg.status !== RegistrationStatus.CANCELLED
    );
    
    if (alreadyRegistered) {
      throw new Error('Participant is already registered for this category');
    }
    
    // Send registration request to backend
    // Backend expects: { categoryId, participantId (optional) }
    const requestPayload = {
      categoryId: data.categoryId,
      participantId: participantId,
    };
    
    console.log('[Registration Service] Sending registration request:', requestPayload);
    
    // Save registration via repository (makes POST /api/registrations)
    const savedRegistration = await this.registrationRepository.save(requestPayload as any);
    
    console.log('[Registration Service] Registration successful:', savedRegistration);
    
    // Send notification
    // await this.notificationService.sendNotification(...)
    
    // Map to DTO
    return this.mapRegistrationToDto(savedRegistration);
  }

  /**
   * Updates the status of a registration.
   *
   * @param data - Registration status update data
   * @param adminId - ID of the administrator performing the update
   * @returns Updated registration information
   */
  public async updateStatus(data: UpdateRegistrationStatusDto, adminId: string): Promise<RegistrationDto> {
    // Validate input
    if (!data.registrationId || data.registrationId.trim().length === 0) {
      throw new Error('Registration ID is required');
    }
    
    if (!data.status) {
      throw new Error('Status is required');
    }
    
    if (!adminId || adminId.trim().length === 0) {
      throw new Error('Admin ID is required');
    }
    
    // Check if registration exists
    const registration = await this.registrationRepository.findById(data.registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }
    
    // Update registration status via the /status endpoint
    const savedRegistration = await this.registrationRepository.updateStatus(
      data.registrationId,
      data.status,
      data.acceptanceType
    );
    
    // Send notification
    // await this.notificationService.sendNotification(...)
    
    // Map to DTO
    return this.mapRegistrationToDto(savedRegistration);
  }

  /**
   * Withdraws a registration.
   *
   * @param registrationId - ID of the registration to withdraw
   * @param time - Withdrawal time
   * @param userId - ID of the user performing the withdrawal
   */
  public async withdrawRegistration(registrationId: string, time: string, userId: string): Promise<void> {
    // Validate input
    if (!registrationId || registrationId.trim().length === 0) {
      throw new Error('Registration ID is required');
    }
    
    if (!time || time.trim().length === 0) {
      throw new Error('Withdrawal time is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if registration exists
    const registration = await this.registrationRepository.findById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }
    
    // Check authorization
    if (registration.participantId !== userId) {
      throw new Error('User is not authorized to withdraw this registration');
    }
    
    // Validate business rule
    registration.withdraw(time);
    
    // Update registration status
    const withdrawnRegistration = new Registration({
      ...registration,
      status: RegistrationStatus.WITHDRAWN,
      updatedAt: new Date(),
    });
    
    await this.registrationRepository.update(withdrawnRegistration);
    
    // Send notification
    // await this.notificationService.sendNotification(...)
  }

  /**
   * Updates the seed number for a registration.
   *
   * @param registrationId - ID of the registration
   * @param seedNumber - New seed number (null to remove seed)
   * @param adminId - ID of the administrator performing the update
   * @returns Updated registration information
   */
  public async updateSeedNumber(
    registrationId: string,
    seedNumber: number | null,
    adminId: string
  ): Promise<RegistrationDto> {
    // Validate input
    if (!registrationId || registrationId.trim().length === 0) {
      throw new Error('Registration ID is required');
    }

    if (!adminId || adminId.trim().length === 0) {
      throw new Error('Admin ID is required');
    }

    if (seedNumber !== null && (seedNumber < 1 || !Number.isInteger(seedNumber))) {
      throw new Error('Seed number must be a positive integer or null');
    }

    // Check if registration exists
    const registration = await this.registrationRepository.findById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    // If assigning a seed number, check for duplicates in the same category
    if (seedNumber !== null) {
      const categoryRegistrations = await this.registrationRepository.findByCategoryId(
        registration.categoryId
      );
      const duplicateSeed = categoryRegistrations.find(
        r => r.id !== registrationId && r.seedNumber === seedNumber
      );
      if (duplicateSeed) {
        throw new Error(`Seed number ${seedNumber} is already assigned to another player in this category`);
      }
    }

    // Update seed number
    const updatedRegistration = new Registration({
      ...registration,
      seedNumber,
      updatedAt: new Date(),
    });

    const savedRegistration = await this.registrationRepository.update(updatedRegistration);

    return this.mapRegistrationToDto(savedRegistration);
  }

  /**
   * Retrieves all registrations for a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of registrations
   */
  public async getRegistrationsByTournament(tournamentId: string): Promise<RegistrationDto[]> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    const registrations = await this.registrationRepository.findByTournament(tournamentId);
    return registrations.map(r => this.mapRegistrationToDto(r));
  }

  /**
   * Retrieves all registrations for a participant.
   *
   * @param participantId - ID of the participant
   * @returns List of registrations
   */
  public async getRegistrationsByParticipant(participantId: string): Promise<RegistrationDto[]> {
    // Validate input
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    const registrations = await this.registrationRepository.findByParticipantId(participantId);
    return registrations.map(r => this.mapRegistrationToDto(r));
  }

  /**
   * Retrieves all registrations for a category.
   *
   * @param categoryId - ID of the category
   * @returns List of registrations
   */
  public async getRegistrationsByCategory(categoryId: string): Promise<RegistrationDto[]> {
    // Validate input
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }
    
    const registrations = await this.registrationRepository.findByCategoryId(categoryId);
    return registrations.map(r => this.mapRegistrationToDto(r));
  }

  /**
   * Maps a Registration entity to RegistrationDto.
   *
   * @param registration - Registration entity
   * @returns Registration DTO
   */
  private mapRegistrationToDto(registration: Registration): RegistrationDto {
    return {
      id: registration.id,
      participantId: registration.participantId,
      tournamentId: registration.tournamentId,
      categoryId: registration.categoryId,
      status: registration.status,
      acceptanceType: registration.acceptanceType,
      seedNumber: registration.seedNumber,
      registeredAt: registration.registeredAt,
      tournament: registration.tournament,
      category: registration.category,
    };
  }
}
