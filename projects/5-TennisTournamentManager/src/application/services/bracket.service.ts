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

import {Injectable} from '@angular/core';
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
  /**
   * Creates a new BracketService instance.
   *
   * @param bracketRepository - Bracket repository for data access
   * @param phaseRepository - Phase repository for phase data access
   * @param registrationRepository - Registration repository for participant data
   * @param bracketGeneratorFactory - Factory for creating bracket generators
   */
  public constructor(
    private readonly bracketRepository: BracketRepositoryImpl,
    private readonly phaseRepository: PhaseRepositoryImpl,
    private readonly registrationRepository: RegistrationRepositoryImpl,
    private readonly bracketGeneratorFactory: BracketGeneratorFactory,
  ) {}

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
    
    // Get participant IDs
    const participantIds = acceptedRegistrations.map(r => r.participantId);
    
    // Create bracket entity (phaseId would come from a phase entity in real implementation)
    const phaseId = generateId();
    const bracket = new Bracket({
      id: generateId(),
      tournamentId: data.tournamentId,
      phaseId,
      bracketType: data.bracketType,
      size: acceptedRegistrations.length,
    });
    
    // Generate bracket structure using the appropriate generator
    const generator = this.bracketGeneratorFactory.createGenerator(data.bracketType);
    bracket.generate(participantIds);
    
    // In real implementation, generator would create matches and structure
    // For now, we just save the bracket
    const savedBracket = await this.bracketRepository.save(bracket);
    
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
   * @param bracket - Bracket entity
   * @returns Bracket DTO
   */
  private mapBracketToDto(bracket: Bracket): BracketDto {
    return {
      id: bracket.id,
      tournamentId: bracket.tournamentId,
      categoryId: bracket.phaseId, // In real implementation, get from phase
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
