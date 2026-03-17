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

import {IRegistrationService} from '../interfaces/registration-service.interface';
import {CreateRegistrationDto, RegistrationDto, UpdateRegistrationStatusDto} from '../dto';
import {IRegistrationRepository} from '@domain/repositories/registration-repository.interface';
import {ITournamentRepository} from '@domain/repositories/tournament-repository.interface';
import {ICategoryRepository} from '@domain/repositories/category-repository.interface';
import {INotificationService} from '../interfaces/notification-service.interface';
import {Registration} from '@domain/entities/registration';
import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {generateId} from '@shared/utils';

/**
 * Registration service implementation.
 * Handles participant registration for tournaments and categories.
 */
export class RegistrationService implements IRegistrationService {
  /**
   * Creates a new RegistrationService instance.
   *
   * @param registrationRepository - Registration repository for data access
   * @param tournamentRepository - Tournament repository for tournament data access
   * @param categoryRepository - Category repository for category data access
   * @param notificationService - Notification service for participant notifications
   */
  public constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly tournamentRepository: ITournamentRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly notificationService: INotificationService,
    // TODO: inject QuotaManager
  ) {}

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
    
    // Check if tournament exists and is accepting registrations
    const tournament = await this.tournamentRepository.findById(data.tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    if (!tournament.isRegistrationOpen()) {
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
    
    // Create registration entity
    const registration = new Registration({
      id: generateId(),
      participantId,
      tournamentId: data.tournamentId,
      categoryId: data.categoryId,
      status: RegistrationStatus.PENDING,
    });
    
    // Save registration
    const savedRegistration = await this.registrationRepository.save(registration);
    
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
    
    // Validate business rule for accepting
    if (data.status === RegistrationStatus.ACCEPTED) {
      registration.accept();
    }
    
    // Create updated registration
    const updatedRegistration = new Registration({
      ...registration,
      status: data.status,
      seed: data.seed ?? registration.seed,
      updatedAt: new Date(),
    });
    
    // Save updated registration
    const savedRegistration = await this.registrationRepository.update(updatedRegistration);
    
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
      seed: registration.seed,
      registeredAt: registration.registeredAt,
    };
  }
}
