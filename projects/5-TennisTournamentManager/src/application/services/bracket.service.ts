/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/bracket.service.ts
 * @desc Bracket service implementation for tournament bracket generation and management
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {IBracketService} from '../interfaces/bracket-service.interface';
import {GenerateBracketDto, BracketDto, PhaseDto} from '../dto';
import {BracketRepositoryImpl} from '@infrastructure/repositories/bracket.repository';
import {PhaseRepositoryImpl} from '@infrastructure/repositories/phase.repository';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';
import {BracketGeneratorFactory} from './bracket-generator.factory';
import {Bracket} from '@domain/entities/bracket';
import {RegistrationStatus} from '@domain/enumerations/registration-status';
import {generateId} from '@shared/utils';

/**
 * Bracket service implementation.
 * Handles bracket generation, publication, and phase management.
 */
@Injectable({providedIn: 'root'})
export class BracketService implements IBracketService {
  private readonly bracketRepository = inject(BracketRepositoryImpl);
  private readonly phaseRepository = inject(PhaseRepositoryImpl);
  private readonly registrationRepository = inject(RegistrationRepositoryImpl);
  private readonly bracketGeneratorFactory = inject(BracketGeneratorFactory);

  /**
   * Generates a new bracket for a category.
   *
   * @param data - Bracket generation parameters
   * @param userId - ID of the user generating the bracket
   * @returns Generated bracket information
   */
  public async generateBracket(data: GenerateBracketDto, userId: string): Promise<BracketDto> {
    // Validate input
    if (!data.tournamentId || data.tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!data.categoryId || data.categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }
    
    if (!data.bracketType) {
      throw new Error('Bracket type is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Get accepted registrations for the category
    const registrations = await this.registrationRepository.findByCategoryId(data.categoryId);
    const acceptedRegistrations = registrations.filter(
      r => r.status === RegistrationStatus.ACCEPTED
    );
    
    if (acceptedRegistrations.length === 0) {
      throw new Error('No accepted participants for this category');
    }
    
    if (acceptedRegistrations.length < 2) {
      throw new Error('At least 2 accepted participants are required to generate a bracket');
    }
    
    // Calculate total rounds based on bracket type and participant count
    const participantCount = acceptedRegistrations.length;
    let totalRounds = 0;
    
    switch (data.bracketType) {
      case 'SINGLE_ELIMINATION':
        // For single elimination: rounds = log2(nextPowerOf2(participants))
        totalRounds = Math.ceil(Math.log2(participantCount));
        break;
      case 'ROUND_ROBIN':
        // For round robin: each participant plays all others once
        // Total rounds = participants - 1 (if even) or participants (if odd)
        totalRounds = participantCount % 2 === 0 ? participantCount - 1 : participantCount;
        break;
      case 'MATCH_PLAY':
        // For match play: flexible, default to 1 round
        totalRounds = 1;
        break;
      default:
        totalRounds = 1;
    }
    
    // Prepare bracket data for backend (matching backend entity structure)
    const bracketData = {
      tournamentId: data.tournamentId,
      categoryId: data.categoryId,
      bracketType: data.bracketType,
      size: participantCount,
      totalRounds: totalRounds,
      structure: null,
      isPublished: false,
    };
    
    // Save bracket to backend
    const savedBracket = await this.bracketRepository.save(bracketData as any);
    
    // Map to DTO
    return this.mapBracketToDto(savedBracket);
  }

  /**
   * Retrieves a bracket by its ID.
   *
   * @param bracketId - ID of the bracket
   * @returns Bracket information
   */
  public async getBracketById(bracketId: string): Promise<BracketDto> {
    // Validate input
    if (!bracketId || bracketId.trim().length === 0) {
      throw new Error('Bracket ID is required');
    }
    
    // Find bracket
    const bracket = await this.bracketRepository.findById(bracketId);
    if (!bracket) {
      throw new Error('Bracket not found');
    }
    
    // Map to DTO
    return this.mapBracketToDto(bracket);
  }

  /**
   * Retrieves all brackets for a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of brackets
   */
  public async getBracketsByTournament(tournamentId: string): Promise<BracketDto[]> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    const brackets = await this.bracketRepository.findByTournament(tournamentId);
    return brackets.map(b => this.mapBracketToDto(b));
  }

  /**
   * Publishes a bracket, making it visible to participants.
   *
   * @param bracketId - ID of the bracket to publish
   * @param userId - ID of the user publishing the bracket
   * @returns Published bracket information
   */
  public async publishBracket(bracketId: string, userId: string): Promise<BracketDto> {
    // Validate input
    if (!bracketId || bracketId.trim().length === 0) {
      throw new Error('Bracket ID is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if bracket exists
    const bracket = await this.bracketRepository.findById(bracketId);
    if (!bracket) {
      throw new Error('Bracket not found');
    }
    
    if (bracket.isPublished) {
      throw new Error('Bracket is already published');
    }
    
    // Update bracket to published
    const publishedBracket = new Bracket({
      ...bracket,
      isPublished: true,
    });
    
    const savedBracket = await this.bracketRepository.update(publishedBracket);
    
    // Send notifications to participants
    // await this.notificationService.sendBulkNotifications(...)
    
    // Map to DTO
    return this.mapBracketToDto(savedBracket);
  }

  /**
   * Retrieves all phases for a bracket.
   *
   * @param bracketId - ID of the bracket
   * @returns List of phases
   */
  public async getPhases(bracketId: string): Promise<PhaseDto[]> {
    // Validate input
    if (!bracketId || bracketId.trim().length === 0) {
      throw new Error('Bracket ID is required');
    }
    
    const phases = await this.phaseRepository.findByBracketId(bracketId);
    return phases.map(p => this.mapPhaseToDto(p));
  }

  /**
   * Regenerates an existing bracket.
   *
   * @param bracketId - ID of the bracket to regenerate
   * @param userId - ID of the user performing the regeneration
   * @returns Regenerated bracket information
   */
  public async regenerateBracket(bracketId: string, userId: string): Promise<BracketDto> {
    // Validate input
    if (!bracketId || bracketId.trim().length === 0) {
      throw new Error('Bracket ID is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if bracket exists
    const bracket = await this.bracketRepository.findById(bracketId);
    if (!bracket) {
      throw new Error('Bracket not found');
    }
    
    // Validate business rule
    bracket.regenerate(false);
    
    // In real implementation, regenerate bracket structure
    // const generator = this.bracketGeneratorFactory.createGenerator(bracket.bracketType);
    // generator would regenerate the bracket
    
    const savedBracket = await this.bracketRepository.update(bracket);
    
    // Map to DTO
    return this.mapBracketToDto(savedBracket);
  }

  /**
   * Maps a Bracket entity to BracketDto.
   *
   * @param bracket - Bracket entity or backend response
   * @returns Bracket DTO
   */
  private mapBracketToDto(bracket: any): BracketDto {
    return {
      id: bracket.id,
      tournamentId: bracket.tournamentId,
      categoryId: bracket.categoryId || bracket.phaseId, // Handle both backend and frontend structures
      bracketType: bracket.bracketType,
      size: bracket.size,
      totalRounds: bracket.totalRounds,
      structure: bracket.structure,
      isPublished: bracket.isPublished,
      createdAt: bracket.createdAt,
    };
  }

  /**
   * Maps a Phase entity to PhaseDto.
   *
   * @param phase - Phase entity
   * @returns Phase DTO
   */
  private mapPhaseToDto(phase: any): PhaseDto {
    return {
      id: phase.id,
      bracketId: phase.bracketId,
      name: phase.name,
      order: phase.order,
      matchCount: phase.matchCount ?? 0,
      isCompleted: phase.isCompleted ?? false,
    };
  }
}
