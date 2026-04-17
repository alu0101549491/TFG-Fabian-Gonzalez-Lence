/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/tournament.service.ts
 * @desc Tournament service implementation for tournament management operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {ITournamentService} from '../interfaces/tournament-service.interface';
import {CreateTournamentDto, UpdateTournamentDto, TournamentDto, TournamentFilterDto} from '../dto';
import {PaginatedResponseDto, PaginationDto} from '../dto';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {TournamentRepositoryImpl} from '@infrastructure/repositories/tournament.repository';
import {CategoryRepositoryImpl} from '@infrastructure/repositories/category.repository';
import {UserRepositoryImpl} from '@infrastructure/repositories/user.repository';
import {AuthorizationService} from './authorization.service';
import {NotificationService} from './notification.service';
import {Tournament} from '@domain/entities/tournament';
import {UserRole} from '@domain/enumerations/user-role';
import {generateId} from '@shared/utils';

/**
 * Tournament service implementation.
 * Handles tournament creation, updates, querying, and status management.
 */
@Injectable({providedIn: 'root'})
export class TournamentService implements ITournamentService {
  private readonly tournamentRepository = inject(TournamentRepositoryImpl);
  private readonly categoryRepository = inject(CategoryRepositoryImpl);
  private readonly userRepository = inject(UserRepositoryImpl);
  private readonly authorizationService = inject(AuthorizationService);
  private readonly notificationService = inject(NotificationService);

  /**
   * Creates a new tournament.
   *
   * @param data - Tournament creation data
   * @param organizerId - ID of the user creating the tournament
   * @returns Created tournament information
   */
  public async createTournament(data: CreateTournamentDto, organizerId: string): Promise<TournamentDto> {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Tournament name is required');
    }
    
    if (!data.location || data.location.trim().length === 0) {
      throw new Error('Tournament location is required');
    }
    
    if (!data.startDate || !data.endDate) {
      throw new Error('Start date and end date are required');
    }
    
    if (data.startDate >= data.endDate) {
      throw new Error('Start date must be before end date');
    }
    
    if (data.maxParticipants <= 0) {
      throw new Error('Max participants must be greater than 0');
    }
    
    if (!organizerId || organizerId.trim().length === 0) {
      throw new Error('Organizer ID is required');
    }
    
    // Prepare the request payload with organizerId
    const requestData = {
      ...data,
      organizerId,
    };
    
    // Save tournament via repository (sends POST to backend)
    const savedTournament = await this.tournamentRepository.save(requestData as unknown as Tournament);
    
    // Map to DTO
    return this.mapTournamentToDto(savedTournament);
  }

  /**
   * Updates an existing tournament.
   *
   * @param data - Tournament update data
   * @param userId - ID of the user performing the update
   * @returns Updated tournament information
   */
  public async updateTournament(data: UpdateTournamentDto, userId: string): Promise<TournamentDto> {
    // Validate input
    if (!data.id || data.id.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if tournament exists
    const tournament = await this.tournamentRepository.findById(data.id);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Check authorization
    const canModify = await this.authorizationService.canPerformAction(userId, 'update', data.id);
    if (!canModify) {
      throw new Error('User is not authorized to update this tournament');
    }
    
    // Validate dates if provided
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      throw new Error('Start date must be before end date');
    }
    
    // Create updated tournament
    const updatedTournament = new Tournament({
      ...tournament,
      name: data.name ?? tournament.name,
      description: data.description ?? tournament.description,
      startDate: data.startDate ?? tournament.startDate,
      endDate: data.endDate ?? tournament.endDate,
      location: data.location ?? tournament.location,
      surface: data.surface ?? tournament.surface,
      facilityType: data.facilityType ?? tournament.facilityType,
      regulations: data.regulations ?? tournament.regulations,
      primaryColor: data.primaryColor ?? tournament.primaryColor,
      secondaryColor: data.secondaryColor ?? tournament.secondaryColor,
      logoUrl: data.logoUrl ?? tournament.logoUrl,
      maxParticipants: data.maxParticipants ?? tournament.maxParticipants,
      registrationFee: data.registrationFee ?? tournament.registrationFee,
      acceptanceType: data.acceptanceType ?? tournament.acceptanceType,
      rankingSystem: data.rankingSystem ?? tournament.rankingSystem,
      status: data.status ?? tournament.status,
      updatedAt: new Date(),
    });
    
    // Save updated tournament
    const savedTournament = await this.tournamentRepository.update(updatedTournament);
    
    // Map to DTO
    return this.mapTournamentToDto(savedTournament);
  }

  /**
   * Deletes a tournament.
   *
   * @param tournamentId - ID of the tournament to delete
   * @param userId - ID of the user performing the deletion
   */
  public async deleteTournament(tournamentId: string, userId: string): Promise<void> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if tournament exists
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Check authorization
    const canDelete = await this.authorizationService.canPerformAction(userId, 'delete', tournamentId);
    if (!canDelete) {
      throw new Error('User is not authorized to delete this tournament');
    }
    
    // Get user to check if they're a system admin
    const user = await this.userRepository.findById(userId);
    
    // System admins can delete any tournament (including finalized ones)
    // Tournament organizers/admins cannot delete finalized tournaments (preserve historical records)
    if (tournament.status === TournamentStatus.FINALIZED && user?.role !== UserRole.SYSTEM_ADMIN) {
      throw new Error('Cannot delete finalized tournaments. Historical records must be preserved.');
    }
    
    // Delete tournament
    await this.tournamentRepository.delete(tournamentId);
  }

  /**
   * Retrieves a tournament by its ID.
   *
   * @param tournamentId - ID of the tournament
   * @returns Tournament information
   */
  public async getTournamentById(tournamentId: string): Promise<TournamentDto> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    // Find tournament
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Map to DTO
    return this.mapTournamentToDto(tournament);
  }

  /**
   * Lists tournaments with filtering and pagination.
   *
   * @param filter - Tournament filter criteria
   * @param pagination - Pagination parameters
   * @returns Paginated list of tournaments
   */
  public async listTournaments(filter: TournamentFilterDto, pagination: PaginationDto): Promise<PaginatedResponseDto<TournamentDto>> {
    // Get all tournaments (in real implementation, apply filtering and pagination at DB level)
    let tournaments = await this.tournamentRepository.findAll();
    
    // Apply filters
    if (filter.status) {
      tournaments = tournaments.filter(t => t.status === filter.status);
    }
    
    if (filter.surface) {
      tournaments = tournaments.filter(t => t.surface === filter.surface);
    }
    
    if (filter.location) {
      tournaments = tournaments.filter(t => 
        t.location.toLowerCase().includes(filter.location!.toLowerCase())
      );
    }
    
    if (filter.startDateFrom) {
      tournaments = tournaments.filter(t => t.startDate >= filter.startDateFrom!);
    }
    
    if (filter.startDateTo) {
      tournaments = tournaments.filter(t => t.startDate <= filter.startDateTo!);
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      tournaments = tournaments.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const page = pagination.page ?? 1;
    const pageSize = pagination.pageSize ?? 20;
    const total = tournaments.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedTournaments = tournaments.slice(startIndex, endIndex);
    
    // Map to DTOs
    const items = paginatedTournaments.map(t => this.mapTournamentToDto(t));
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Updates the status of a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @param status - New status to set
   * @param userId - ID of the user performing the update
   * @returns Updated tournament information
   */
  public async updateStatus(tournamentId: string, status: TournamentStatus, userId: string): Promise<TournamentDto> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!status) {
      throw new Error('Status is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if tournament exists
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Update status via repository (backend validates authorization and transition)
    const savedTournament = await this.tournamentRepository.updateStatus(tournamentId, status);
    
    // Map to DTO
    return this.mapTournamentToDto(savedTournament);
  }

  /**
   * Retrieves all active tournaments.
   *
   * @returns List of active tournaments
   */
  public async getActiveTournaments(): Promise<TournamentDto[]> {
    const activeTournaments = await this.tournamentRepository.findActive();
    return activeTournaments.map(t => this.mapTournamentToDto(t));
  }

  /**
   * Finalizes a tournament, marking it as complete.
   *
   * @param id - ID of the tournament to finalize
   */
  public async finalizeTournament(id: string): Promise<void> {
    // Validate input
    if (!id || id.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    // Check if tournament exists
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Validate business rule
    tournament.finalize();
    
    // Update status
    const finalizedTournament = new Tournament({
      ...tournament,
      status: TournamentStatus.FINALIZED,
      updatedAt: new Date(),
    });
    
    await this.tournamentRepository.update(finalizedTournament);
  }

  /**
   * Maps a Tournament entity to TournamentDto.
   *
   * @param tournament - Tournament entity
   * @returns Tournament DTO
   */
  private mapTournamentToDto(tournament: Tournament): TournamentDto {
    return {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      location: tournament.location,
      surface: tournament.surface,
      facilityType: tournament.facilityType,
      regulations: tournament.regulations,
      primaryColor: tournament.primaryColor,
      secondaryColor: tournament.secondaryColor,
      logoUrl: tournament.logoUrl,
      status: tournament.status,
      tournamentType: tournament.tournamentType,
      maxParticipants: tournament.maxParticipants,
      registrationFee: tournament.registrationFee,
      currency: tournament.currency,
      acceptanceType: tournament.acceptanceType,
      rankingSystem: tournament.rankingSystem,
      organizerId: tournament.organizerId,
      registrationOpenDate: tournament.registrationOpenDate,
      registrationCloseDate: tournament.registrationCloseDate,
      createdAt: tournament.createdAt,
    };
  }
}
