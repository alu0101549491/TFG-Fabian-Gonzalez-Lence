/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/standing.service.ts
 * @desc Standing service implementation for bracket standings and rankings
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {IStandingService} from '../interfaces/standing-service.interface';
import {StandingDto} from '../dto';
import {StandingRepositoryImpl} from '@infrastructure/repositories/standing.repository';
import {MatchRepositoryImpl} from '@infrastructure/repositories/match.repository';
import {TiebreakResolverService} from './tiebreak-resolver.service';

/**
 * Standing service implementation.
 * Handles bracket-specific standings calculation and retrieval.
 */
@Injectable({providedIn: 'root'})
export class StandingService implements IStandingService {
  /** Standing repository for data access */
  private readonly standingRepository = inject(StandingRepositoryImpl);

  /** Match repository for match results */
  private readonly matchRepository = inject(MatchRepositoryImpl);

  /** Tiebreak resolver for resolving ties in standings */
  private readonly tiebreakResolver = inject(TiebreakResolverService);

  /**
   * Calculates all standings for a bracket.
   *
   * @param bracketId - ID of the bracket
   * @returns List of standings sorted by position
   */
  public async calculateStandings(bracketId: string): Promise<StandingDto[]> {
    // Validate input
    if (!bracketId || bracketId.trim().length === 0) {
      throw new Error('Bracket ID is required');
    }
    
    // Get all matches for the bracket
    const matches = await this.matchRepository.findByBracket(bracketId);
    
    // Calculate standings based on match results
    // In real implementation, use TiebreakResolver and ranking system
    const participantStats = new Map<string, any>();
    
    for (const match of matches) {
      if (!match.winnerId) continue;
      
      // Initialize stats if not exists
      const p1Id = match.player1Id;
      const p2Id = match.player2Id;
      
      if (!participantStats.has(p1Id)) {
        participantStats.set(p1Id, {
          participantId: p1Id,
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0,
          points: 0,
        });
      }
      
      if (!participantStats.has(p2Id)) {
        participantStats.set(p2Id, {
          participantId: p2Id,
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0,
          points: 0,
        });
      }
      
      // Update stats
      const p1Stats = participantStats.get(p1Id)!;
      const p2Stats = participantStats.get(p2Id)!;
      
      p1Stats.matchesPlayed++;
      p2Stats.matchesPlayed++;
      
      if (match.winnerId === p1Id) {
        p1Stats.matchesWon++;
        p1Stats.points += 3; // Example point system
        p2Stats.matchesLost++;
      } else {
        p2Stats.matchesWon++;
        p2Stats.points += 3;
        p1Stats.matchesLost++;
      }
    }
    
    // Convert to standings array
    const standings = Array.from(participantStats.values());
    
    // Sort by points, then by set difference, then by game difference
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aSetDiff = a.setsWon - a.setsLost;
      const bSetDiff = b.setsWon - b.setsLost;
      if (bSetDiff !== aSetDiff) return bSetDiff - aSetDiff;
      const aGameDiff = a.gamesWon - a.gamesLost;
      const bGameDiff = b.gamesWon - b.gamesLost;
      return bGameDiff - aGameDiff;
    });
    
    // Assign positions
    return standings.map((s, index) => this.mapStandingToDto({
      ...s,
      bracketId,
      position: index + 1,
    }));
  }

  /**
   * Updates standings for a bracket based on a match result.
   *
   * @param bracketId - ID of the bracket
   * @param result - Match result data
   * @returns Updated list of standings
   */
  public async updateStandings(bracketId: string, result: Record<string, unknown>): Promise<StandingDto[]> {
    // Validate input
    if (!bracketId || bracketId.trim().length === 0) {
      throw new Error('Bracket ID is required');
    }
    
    if (!result) {
      throw new Error('Result data is required');
    }
    
    // Recalculate all standings
    return await this.calculateStandings(bracketId);
  }

  /**
   * Retrieves the standing for a specific participant in a bracket.
   *
   * @param bracketId - ID of the bracket
   * @param participantId - ID of the participant
   * @returns Participant's standing information
   */
  public async getParticipantStanding(bracketId: string, participantId: string): Promise<StandingDto> {
    // Validate input
    if (!bracketId || bracketId.trim().length === 0) {
      throw new Error('Bracket ID is required');
    }
    
    if (!participantId || participantId.trim().length === 0) {
      throw new Error('Participant ID is required');
    }
    
    // Calculate all standings
    const standings = await this.calculateStandings(bracketId);
    
    // Find participant's standing
    const standing = standings.find(s => s.participantId === participantId);
    if (!standing) {
      throw new Error('Standing not found for participant');
    }
    
    return standing;
  }

  /**
   * Maps a Standing object to StandingDto.
   *
   * @param standing - Standing data
   * @returns Standing DTO
   */
  private mapStandingToDto(standing: any): StandingDto {
    return {
      id: standing.id ?? standing.participantId,
      bracketId: standing.bracketId,
      participantId: standing.participantId,
      participantName: standing.participantName ?? 'Unknown',
      position: standing.position,
      matchesPlayed: standing.matchesPlayed,
      matchesWon: standing.matchesWon,
      matchesLost: standing.matchesLost,
      setsWon: standing.setsWon,
      setsLost: standing.setsLost,
      gamesWon: standing.gamesWon,
      gamesLost: standing.gamesLost,
      points: standing.points,
      setDifference: standing.setsWon - standing.setsLost,
      gameDifference: standing.gamesWon - standing.gamesLost,
    };
  }
}
