/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file application/services/seeding.service.ts
 * @desc Service for tournament seeding - assigns and places seeds strategically in draws (FR19).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {Registration} from '@domain/entities/registration';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';

/**
 * Interface for seeded participant with position in draw.
 */
export interface SeededParticipant {
  participantId: string;
  seedNumber: number;
  drawPosition: number;
  registrationId: string;
}

/**
 * SeedingService - Handles tournament seeding and strategic seed placement.
 * 
 * Implements seeding algorithms according to FR19:
 * - Automatic seed assignment based on ranking
 * - Strategic position placement to prevent early matchups between top seeds
 * - Support for manual seed overrides
 * 
 * Seeding Strategy for Single Elimination:
 * - Seeds 1-2: Opposite bracket halves (positions 1 and n)
 * - Seeds 3-4: Opposite quarters
 * - Seeds 5-8: Opposite eighths
 * - Pattern continues for larger brackets
 * 
 * Seeding Strategy for Round Robin:
 * - Distribute seeds evenly across groups
 * - Top seed in group 1, second seed in group 2, etc.
 * - Ensures competitive balance across groups
 */
@Injectable({providedIn: 'root'})
export class SeedingService {
  /** Registration repository for updating seed data */
  private readonly registrationRepository = inject(RegistrationRepositoryImpl);

  /**
   * Assigns seed numbers to participants based on their ranking.
   * Lower ranking = better seed (seed 1 is the best).
   * 
   * @param registrations - Participant registrations with ranking data
   * @param numberOfSeeds - Number of seeds to assign (typically 8, 16, or 32)
   * @returns Updated registrations with seed numbers assigned
   */
  public async assignSeedNumbers(
    registrations: Registration[],
    numberOfSeeds: number
  ): Promise<Registration[]> {
    // Validate inputs
    if (numberOfSeeds < 1) {
      throw new Error('Number of seeds must be at least 1');
    }

    if (registrations.length < numberOfSeeds) {
      throw new Error(`Cannot seed ${numberOfSeeds} participants from ${registrations.length} registrations`);
    }

    // Sort by ranking (assuming lower number = better ranking)
    // Participants without ranking go to the end
    const sortedRegistrations = [...registrations].sort((a, b) => {
      // Handle cases where participants don't have ranking
      if (!a.seed && !b.seed) return 0;
      if (!a.seed) return 1;
      if (!b.seed) return -1;
      return a.seed - b.seed;
    });

    // Assign seed numbers to top participants
    const updatedRegistrations: Registration[] = [];
    
    for (let i = 0; i < sortedRegistrations.length; i++) {
      const registration = sortedRegistrations[i];
      const updatedRegistration = new Registration({
        ...registration,
        seed: i < numberOfSeeds ? i + 1 : null
      });
      
      // Update in repository
      await this.registrationRepository.update(updatedRegistration);
      updatedRegistrations.push(updatedRegistration);
    }

    return updatedRegistrations;
  }

  /**
   * Calculates strategic draw positions for seeded participants in Single Elimination.
   * 
   * Standard seeding positions for power-of-2 bracket:
   * - Seed 1: Position 1
   * - Seed 2: Position n (last)
   * - Seed 3: Position n/2
   * - Seed 4: Position n/2 + 1
   * - Seeds 5-8: Distributed in eighths
   * - Pattern continues geometrically
   * 
   * @param seededRegistrations - Registrations with seed numbers
   * @param bracketSize - Total bracket size (must be power of 2)
   * @returns Array of seeded participants with strategic draw positions
   */
  public calculateSingleEliminationPositions(
    seededRegistrations: Registration[],
    bracketSize: number
  ): SeededParticipant[] {
    // Validate bracket size is power of 2
    if (!this.isPowerOfTwo(bracketSize)) {
      throw new Error(`Bracket size must be power of 2, got ${bracketSize}`);
    }

    // Sort by seed number
    const sorted = [...seededRegistrations].sort((a, b) => {
      if (a.seed === null) return 1;
      if (b.seed === null) return -1;
      return a.seed - b.seed;
    });

    const seededParticipants: SeededParticipant[] = [];
    const positions = this.generateSeedPositions(bracketSize);

    // Map seeds to positions
    for (let i = 0; i < sorted.length && i < positions.length; i++) {
      const registration = sorted[i];
      if (registration.seed !== null) {
        seededParticipants.push({
          participantId: registration.participantId,
          seedNumber: registration.seed,
          drawPosition: positions[i],
          registrationId: registration.id
        });
      }
    }

    return seededParticipants;
  }

  /**
   * Calculates strategic group assignments for seeded participants in Round Robin.
   * 
   * Strategy: Distribute seeds evenly across groups to ensure balance.
   * - With 2 groups: Seeds 1, 3, 5... in group 1; Seeds 2, 4, 6... in group 2
   * - With 4 groups: Seeds distributed 1-2-3-4-5-6-7-8 pattern
   * 
   * @param seededRegistrations - Registrations with seed numbers
   * @param numberOfGroups - Total number of groups in Round Robin
   * @returns Array of seeded participants with group assignments
   */
  public calculateRoundRobinGroups(
    seededRegistrations: Registration[],
    numberOfGroups: number
  ): Array<{participantId: string; seedNumber: number; groupNumber: number}> {
    if (numberOfGroups < 1) {
      throw new Error('Number of groups must be at least 1');
    }

    // Sort by seed number
    const sorted = [...seededRegistrations].sort((a, b) => {
      if (a.seed === null) return 1;
      if (b.seed === null) return -1;
      return a.seed - b.seed;
    });

    const groupAssignments: Array<{
      participantId: string;
      seedNumber: number;
      groupNumber: number;
    }> = [];

    // Distribute seeds across groups in serpentine/snake order
    // Seed 1 → Group 1, Seed 2 → Group 2, ..., Seed n → Group n
    // Seed n+1 → Group n, Seed n+2 → Group n-1, ... (reverse)
    // This ensures balanced distribution
    
    for (let i = 0; i < sorted.length; i++) {
      const registration = sorted[i];
      if (registration.seed !== null) {
        // Calculate group using serpentine distribution
        const cyclePosition = i % (numberOfGroups * 2);
        const groupNumber = cyclePosition < numberOfGroups
          ? cyclePosition + 1
          : (numberOfGroups * 2 - cyclePosition);

        groupAssignments.push({
          participantId: registration.participantId,
          seedNumber: registration.seed,
          groupNumber
        });
      }
    }

    return groupAssignments;
  }

  /**
   * Manually overrides seed assignment for a specific participant.
   * Useful for organizer exemptions or special cases.
   * 
   * @param registrationId - ID of the registration to update
   * @param newSeedNumber - New seed number to assign (or null to unseed)
   * @returns Updated registration
   */
  public async overrideSeed(
    registrationId: string,
    newSeedNumber: number | null
  ): Promise<Registration> {
    const registration = await this.registrationRepository.findById(registrationId);
    
    if (!registration) {
      throw new Error(`Registration not found: ${registrationId}`);
    }

    const updatedRegistration = new Registration({
      ...registration,
      seed: newSeedNumber
    });
    return await this.registrationRepository.update(updatedRegistration);
  }

  /**
   * Validates seed assignments for a tournament.
   * Ensures no duplicate seed numbers and sequential numbering.
   * 
   * @param registrations - All registrations to validate
   * @returns Validation result with any errors found
   */
  public validateSeeding(registrations: Registration[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const seededRegistrations = registrations.filter(r => r.seed !== null);
    const seedNumbers = seededRegistrations.map(r => r.seed!);

    // Check for duplicates
    const uniqueSeeds = new Set(seedNumbers);
    if (uniqueSeeds.size !== seedNumbers.length) {
      errors.push('Duplicate seed numbers detected');
    }

    // Check for sequential numbering (should start at 1)
    const sortedSeeds = [...seedNumbers].sort((a, b) => a - b);
    if (sortedSeeds.length > 0 && sortedSeeds[0] !== 1) {
      errors.push('Seed numbers should start at 1');
    }

    // Check for gaps in seeding (optional - may allow gaps)
    for (let i = 1; i < sortedSeeds.length; i++) {
      if (sortedSeeds[i] !== sortedSeeds[i-1] + 1) {
        errors.push(`Gap in seed numbering between ${sortedSeeds[i-1]} and ${sortedSeeds[i]}`);
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generates standard seed positions for Single Elimination bracket.
   * Uses the standard tournament seeding algorithm.
   * 
   * @param bracketSize - Size of bracket (power of 2)
   * @returns Array of positions indexed by seed number (0-indexed)
   * @private
   */
  private generateSeedPositions(bracketSize: number): number[] {
    // Build positions using geometric distribution
    // Each round doubles the number of positions
    let currentRound = [1];
    
    while (currentRound.length < bracketSize) {
      const nextRound: number[] = [];
      
      for (const pos of currentRound) {
        nextRound.push(pos);
        // Add mirror position (from opposite end)
        nextRound.push(bracketSize + 1 - pos);
      }
      
      currentRound = nextRound;
    }

    return currentRound.slice(0, bracketSize);
  }

  /**
   * Checks if a number is a power of 2.
   * @private
   */
  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }
}
