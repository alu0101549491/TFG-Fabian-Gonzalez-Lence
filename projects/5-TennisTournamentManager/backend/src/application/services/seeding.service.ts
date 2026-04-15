/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 16, 2025
 * @file application/services/seeding.service.ts
 * @desc Service for managing tournament seeding algorithms following ITF/ATP standards.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://www.itftennis.com/en/about-us/governance/rules-and-regulations/}
 */

import {Registration} from '../../domain/entities/registration.entity';
import {User} from '../../domain/entities/user.entity';
import {DoublesTeam} from '../../domain/entities/doubles-team.entity';

/**
 * Participant with seeding information.
 */
export interface SeededParticipant {
  /** Participant user ID */
  participantId: string;
  /** Seed number (1 = top seed) */
  seedNumber: number;
  /** User ranking (lower is better) */
  ranking: number | null;
  /** Original registration entity */
  registration: Registration;
}

/**
 * Seeded doubles team information.
 */
export interface SeededDoublesTeam {
  /** DoublesTeam ID used as the bracket slot identifier */
  teamId: string;
  /** Seed number (1 = top seed) */
  seedNumber: number;
  /** Combined ranking (average of both players, lower is better) */
  combinedRanking: number | null;
  /** Original DoublesTeam entity */
  team: DoublesTeam;
}

/**
 * Service for applying standard tennis seeding algorithms.
 */
export class SeedingService {
  /**
   * Generates standard ITF/ATP seeding positions for a given bracket size.
   * 
   * Standard seeding ensures:
   * - Seeds 1 and 2 are placed in opposite halves
   * - Seeds 3 and 4 are placed in opposite quarters
   * - Top seeds meet only in later rounds
   * 
   * @param bracketSize - Power-of-2 bracket size (4, 8, 16, 32, 64)
   * @returns Array of seeding positions in bracket order
   * 
   * @example
   * ```typescript
   * generateSeedingPositions(8) // Returns: [1, 8, 4, 5, 3, 6, 2, 7]
   * // Position 1 gets Seed #1, Position 2 gets Seed #8, etc.
   * ```
   */
  public static generateSeedingPositions(bracketSize: number): number[] {
    // Standard seeding positions for common bracket sizes
    const standardSeedings: Record<number, number[]> = {
      2: [1, 2],
      4: [1, 4, 3, 2],
      8: [1, 8, 4, 5, 3, 6, 2, 7],
      16: [1, 16, 8, 9, 4, 13, 5, 12, 3, 14, 6, 11, 2, 15, 7, 10],
      32: [
        1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21,
        3, 30, 14, 19, 6, 27, 11, 22, 2, 31, 15, 18, 7, 26, 10, 23,
      ],
      64: [
        1, 64, 32, 33, 16, 49, 17, 48, 8, 57, 25, 40, 9, 56, 24, 41,
        4, 61, 29, 36, 13, 52, 20, 45, 5, 60, 28, 37, 12, 53, 21, 44,
        3, 62, 30, 35, 14, 51, 19, 46, 6, 59, 27, 38, 11, 54, 22, 43,
        2, 63, 31, 34, 15, 50, 18, 47, 7, 58, 26, 39, 10, 55, 23, 42,
      ],
    };

    if (standardSeedings[bracketSize]) {
      return standardSeedings[bracketSize];
    }

    // For non-standard sizes, use sequential seeding
    return Array.from({length: bracketSize}, (_, i) => i + 1);
  }

  /**
   * Sorts participants by ranking and assigns seed numbers.
   * 
   * Players without rankings are placed after seeded players.
   * 
   * @param registrations - Array of registrations with participant data
   * @returns Array of participants sorted by seed
   */
  public static assignSeeds(
    registrations: (Registration & {participant: User})[],
  ): SeededParticipant[] {
    // Separate ranked and unranked players
    const rankedPlayers = registrations.filter((r) => r.participant.ranking !== null);
    const unrankedPlayers = registrations.filter((r) => r.participant.ranking === null);

    // Sort ranked players by ranking (lower number = better ranking)
    rankedPlayers.sort((a, b) => a.participant.ranking! - b.participant.ranking!);

    // Combine: seeded players first, then unseeded
    const sortedParticipants = [...rankedPlayers, ...unrankedPlayers];

    // Assign seed numbers
    return sortedParticipants.map((reg, index) => ({
      participantId: reg.participantId,
      seedNumber: index + 1,
      ranking: reg.participant.ranking,
      registration: reg,
    }));
  }

  /**
   * Applies ITF/ATP seeding positions to participants for bracket generation.
   * 
   * Takes sorted seeded participants and arranges them in standard seeding positions
   * to ensure top seeds are separated in the bracket.
   * 
   * @param seededParticipants - Participants sorted by seed number
   * @param bracketSize - Power-of-2 bracket size
   * @returns Array of participant IDs in correct bracket positions
   * 
   * @example
   * ```typescript
   * // For 8-player bracket:
   * // Input: [Seed1, Seed2, Seed3, Seed4, Seed5, Seed6, Seed7, Seed8]
   * // Output: [Seed1, Seed8, Seed4, Seed5, Seed3, Seed6, Seed2, Seed7]
   * // Ensures Seed1 vs Seed2 can only meet in finals
   * ```
   */
  public static applySeedingPositions(
    seededParticipants: SeededParticipant[],
    bracketSize: number,
  ): string[] {
    const seedingPositions = this.generateSeedingPositions(bracketSize);

    // Create array of participant IDs in seeded order
    const participantIds = new Array(bracketSize).fill(null);

    // Place each seeded participant in their designated position
    seededParticipants.forEach((participant) => {
      // Find where this seed number should be placed in the bracket
      const seedNumber = participant.seedNumber;
      const positionIndex = seedingPositions.indexOf(seedNumber);

      if (positionIndex !== -1) {
        participantIds[positionIndex] = participant.participantId;
      }
    });

    return participantIds;
  }

  /**
   * Complete seeding process: sort by ranking, assign seeds, and apply positions.
   * 
   * This is the main entry point for applying seeding to a tournament bracket.
   * 
   * @param registrations - Registrations with participant data
   * @param bracketSize - Power-of-2 bracket size
   * @returns Participant IDs in ITF/ATP seeded positions and seed assignments
   */
  public static seedBracket(
    registrations: (Registration & {participant: User})[],
    bracketSize: number,
  ): {participantIds: string[]; seededParticipants: SeededParticipant[]} {
    // Step 1: Sort by ranking and assign seed numbers
    const seededParticipants = this.assignSeeds(registrations);

    // Step 2: Apply ITF/ATP seeding positions
    const participantIds = this.applySeedingPositions(seededParticipants, bracketSize);

    return {participantIds, seededParticipants};
  }

  /**
   * Assigns seed numbers to doubles teams based on their combined ranking.
   * 
   * The combined ranking for doubles is the average of both players' rankings.
   * Teams/players without rankings are placed after seeded teams.
   * 
   * @param teams - DoublesTeam entities with player1 and player2 loaded
   * @returns Array of seeded team info sorted by combined ranking
   */
  public static assignDoublesTeamSeeds(
    teams: (DoublesTeam & {player1: User; player2: User})[],
  ): SeededDoublesTeam[] {
    const computeCombinedRanking = (team: DoublesTeam & {player1: User; player2: User}): number | null => {
      const r1 = team.player1?.ranking ?? null;
      const r2 = team.player2?.ranking ?? null;
      if (r1 !== null && r2 !== null) return (r1 + r2) / 2;
      if (r1 !== null) return r1;
      if (r2 !== null) return r2;
      return null;
    };

    const rankedTeams = teams.filter(t => computeCombinedRanking(t) !== null);
    const unrankedTeams = teams.filter(t => computeCombinedRanking(t) === null);

    rankedTeams.sort((a, b) => computeCombinedRanking(a)! - computeCombinedRanking(b)!);

    return [...rankedTeams, ...unrankedTeams].map((team, index) => ({
      teamId: team.id,
      seedNumber: index + 1,
      combinedRanking: computeCombinedRanking(team),
      team,
    }));
  }

  /**
   * Applies seeding positions to doubles teams and returns team IDs in bracket order.
   * 
   * @param seededTeams - Teams sorted by seed number
   * @param bracketSize - Power-of-2 bracket size
   * @returns Array of team IDs in correct bracket positions, nulls for byes
   */
  public static applyDoublesTeamSeedingPositions(
    seededTeams: SeededDoublesTeam[],
    bracketSize: number,
  ): (string | null)[] {
    const seedingPositions = this.generateSeedingPositions(bracketSize);
    const teamIds = new Array<string | null>(bracketSize).fill(null);

    seededTeams.forEach((seededTeam) => {
      const positionIndex = seedingPositions.indexOf(seededTeam.seedNumber);
      if (positionIndex !== -1) {
        teamIds[positionIndex] = seededTeam.teamId;
      }
    });

    return teamIds;
  }

  /**
   * Complete seeding process for doubles teams.
   * 
   * @param teams - DoublesTeam entities with player data
   * @param bracketSize - Power-of-2 bracket size
   * @returns Team IDs in bracket positions and seeded team list
   */
  public static seedDoublesTeams(
    teams: (DoublesTeam & {player1: User; player2: User})[],
    bracketSize: number,
  ): {teamIds: (string | null)[]; seededTeams: SeededDoublesTeam[]} {
    const seededTeams = this.assignDoublesTeamSeeds(teams);
    const teamIds = this.applyDoublesTeamSeedingPositions(seededTeams, bracketSize);
    return {teamIds, seededTeams};
  }
}

