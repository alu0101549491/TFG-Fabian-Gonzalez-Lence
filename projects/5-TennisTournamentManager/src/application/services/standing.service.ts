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
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {IStandingService} from '../interfaces/standing-service.interface';
import {StandingDto} from '../dto';
import {StandingRepositoryImpl} from '@infrastructure/repositories/standing.repository';
import {MatchRepositoryImpl} from '@infrastructure/repositories/match.repository';
import {BracketRepositoryImpl} from '@infrastructure/repositories/bracket.repository';
import {TiebreakResolverService} from './tiebreak-resolver.service';
import {UserService} from './user.service';
import {Standing} from '@domain/entities/standing';
import {Match} from '@domain/entities/match';

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

  /** Bracket repository for bracket data */
  private readonly bracketRepository = inject(BracketRepositoryImpl);

  /** Tiebreak resolver for resolving ties in standings */
  private readonly tiebreakResolver = inject(TiebreakResolverService);

  /** User service for fetching participant details */
  private readonly userService = inject(UserService);

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

    // Detect doubles bracket from match team data
    const isDoubles = matches.some(m => (m as any).participant1TeamId || (m as any).participant2TeamId);
    if (isDoubles) {
      return this.calculateDoublesStandings(bracketId, matches);
    }
    
    // Calculate standings based on match results
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
      
      // Calculate sets and games from scores
      const scores = (match as any).scores || [];
      for (const set of scores) {
        const p1Games = set.player1Games || 0;
        const p2Games = set.player2Games || 0;
        
        p1Stats.gamesWon += p1Games;
        p1Stats.gamesLost += p2Games;
        p2Stats.gamesWon += p2Games;
        p2Stats.gamesLost += p1Games;
        
        // Determine set winner
        if (p1Games > p2Games) {
          p1Stats.setsWon++;
          p2Stats.setsLost++;
        } else if (p2Games > p1Games) {
          p2Stats.setsWon++;
          p1Stats.setsLost++;
        }
      }
      
      // Update match wins/losses and points
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
    
    // Fetch participant names
    const participantIds = Array.from(participantStats.keys());
    await Promise.all(
      participantIds.map(async (participantId) => {
        try {
          const user = await this.userService.getPublicUserInfo(participantId);
          const stats = participantStats.get(participantId)!;
          stats.participantName = `${user.firstName} ${user.lastName}`;
        } catch (error) {
          console.warn(`Failed to fetch user ${participantId}:`, error);
          const stats = participantStats.get(participantId)!;
          stats.participantName = 'Unknown';
        }
      })
    );
    
    // Convert stats to Standing entities for tiebreaker resolution
    const standingEntities = Array.from(participantStats.values()).map(stats =>
      new Standing({
        id: `standing_${bracketId}_${stats.participantId}`,
        bracketId,
        participantId: stats.participantId,
        position: 0, // Will be assigned after tiebreaking
        matchesPlayed: stats.matchesPlayed,
        matchesWon: stats.matchesWon,
        matchesLost: stats.matchesLost,
        setsWon: stats.setsWon,
        setsLost: stats.setsLost,
        gamesWon: stats.gamesWon,
        gamesLost: stats.gamesLost,
        points: stats.points,
      })
    );
    
    // Sort by points first (primary criterion)
    standingEntities.sort((a, b) => b.points - a.points);
    
    // Group participants by points (identify ties)
    const pointGroups: Standing[][] = [];
    let currentGroup: Standing[] = [];
    let currentPoints = -1;
    
    for (const standing of standingEntities) {
      if (standing.points !== currentPoints) {
        if (currentGroup.length > 0) {
          pointGroups.push(currentGroup);
        }
        currentGroup = [standing];
        currentPoints = standing.points;
      } else {
        currentGroup.push(standing);
      }
    }
    if (currentGroup.length > 0) {
      pointGroups.push(currentGroup);
    }
    
    // Resolve ties within each group using the comprehensive tiebreaker service
    const resolvedStandings: Standing[] = [];
    for (const group of pointGroups) {
      if (group.length === 1) {
        // No tie, add as-is
        resolvedStandings.push(group[0]);
      } else {
        // Tied participants - apply all 6 tiebreaker criteria
        const resolvedGroup = this.tiebreakResolver.resolveTies(group, matches);
        resolvedStandings.push(...resolvedGroup);
      }
    }
    
    // Assign final positions and convert to DTOs
    return resolvedStandings.map((standing, index) => {
      const stats = participantStats.get(standing.participantId)!;
      return this.mapStandingToDto({
        ...stats,
        bracketId,
        position: index + 1,
      });
    });
  }

  /**
   * Calculates standings for a doubles bracket, keyed by team ID.
   *
   * @param bracketId - Bracket identifier
   * @param matches - Matches already loaded for this bracket
   * @returns List of standings DTOs sorted by position
   */
  private async calculateDoublesStandings(bracketId: string, matches: Match[]): Promise<StandingDto[]> {
    const teamStats = new Map<string, any>();

    // Helper to resolve team name from enriched match data
    const getTeamName = (team: any): string => {
      if (!team) return 'Unknown';
      const p1 = `${team.player1?.firstName ?? ''} ${team.player1?.lastName ?? ''}`.trim();
      const p2 = `${team.player2?.firstName ?? ''} ${team.player2?.lastName ?? ''}`.trim();
      return p1 && p2 ? `${p1} / ${p2}` : p1 || p2 || 'Unknown';
    };

    for (const match of matches) {
      const m = match as any;
      const t1Id: string | null = m.participant1TeamId ?? null;
      const t2Id: string | null = m.participant2TeamId ?? null;
      const winnerTeamId: string | null = m.winnerTeamId ?? null;

      if (!t1Id || !t2Id || !winnerTeamId) continue;

      if (!teamStats.has(t1Id)) {
        teamStats.set(t1Id, {
          teamId: t1Id,
          participantName: getTeamName(m.participant1Team),
          team: m.participant1Team ?? null,
          matchesPlayed: 0, matchesWon: 0, matchesLost: 0,
          setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, points: 0,
        });
      }

      if (!teamStats.has(t2Id)) {
        teamStats.set(t2Id, {
          teamId: t2Id,
          participantName: getTeamName(m.participant2Team),
          team: m.participant2Team ?? null,
          matchesPlayed: 0, matchesWon: 0, matchesLost: 0,
          setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, points: 0,
        });
      }

      const t1Stats = teamStats.get(t1Id)!;
      const t2Stats = teamStats.get(t2Id)!;

      t1Stats.matchesPlayed++;
      t2Stats.matchesPlayed++;

      const scores: Array<{player1Games: number; player2Games: number}> = (match as any).scores ?? [];
      for (const set of scores) {
        const p1Games = set.player1Games || 0;
        const p2Games = set.player2Games || 0;
        t1Stats.gamesWon += p1Games; t1Stats.gamesLost += p2Games;
        t2Stats.gamesWon += p2Games; t2Stats.gamesLost += p1Games;
        if (p1Games > p2Games) { t1Stats.setsWon++; t2Stats.setsLost++; }
        else if (p2Games > p1Games) { t2Stats.setsWon++; t1Stats.setsLost++; }
      }

      if (winnerTeamId === t1Id) {
        t1Stats.matchesWon++; t1Stats.points += 3; t2Stats.matchesLost++;
      } else {
        t2Stats.matchesWon++; t2Stats.points += 3; t1Stats.matchesLost++;
      }
    }

    // Sort by points, then set ratio, then game ratio
    const sorted = Array.from(teamStats.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aSetR = a.setsLost > 0 ? a.setsWon / a.setsLost : (a.setsWon > 0 ? Infinity : 0);
      const bSetR = b.setsLost > 0 ? b.setsWon / b.setsLost : (b.setsWon > 0 ? Infinity : 0);
      if (bSetR !== aSetR) return bSetR - aSetR;
      const aGameR = a.gamesLost > 0 ? a.gamesWon / a.gamesLost : (a.gamesWon > 0 ? Infinity : 0);
      const bGameR = b.gamesLost > 0 ? b.gamesWon / b.gamesLost : (b.gamesWon > 0 ? Infinity : 0);
      return bGameR - aGameR;
    });

    return sorted.map((stats, index) => ({
      id: `standing_${bracketId}_${stats.teamId}`,
      bracketId,
      participantId: null,
      teamId: stats.teamId,
      team: stats.team,
      participantName: stats.participantName,
      position: index + 1,
      matchesPlayed: stats.matchesPlayed,
      matchesWon: stats.matchesWon,
      matchesLost: stats.matchesLost,
      setsWon: stats.setsWon,
      setsLost: stats.setsLost,
      gamesWon: stats.gamesWon,
      gamesLost: stats.gamesLost,
      points: stats.points,
      setDifference: stats.setsWon - stats.setsLost,
      gameDifference: stats.gamesWon - stats.gamesLost,
    }));
  }

  /**
    // Validate input
    if (!bracketId || bracketId.trim().length === 0) {
      throw new Error('Bracket ID is required');
    }
    
    // Get all matches for the bracket
    const matches = await this.matchRepository.findByBracket(bracketId);
    
    // Calculate standings based on match results
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
      
      // Calculate sets and games from scores
      const scores = (match as any).scores || [];
      for (const set of scores) {
        const p1Games = set.player1Games || 0;
        const p2Games = set.player2Games || 0;
        
        p1Stats.gamesWon += p1Games;
        p1Stats.gamesLost += p2Games;
        p2Stats.gamesWon += p2Games;
        p2Stats.gamesLost += p1Games;
        
        // Determine set winner
        if (p1Games > p2Games) {
          p1Stats.setsWon++;
          p2Stats.setsLost++;
        } else if (p2Games > p1Games) {
          p2Stats.setsWon++;
          p1Stats.setsLost++;
        }
      }
      
      // Update match wins/losses and points
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
    
    // Fetch participant names
    const participantIds = Array.from(participantStats.keys());
    await Promise.all(
      participantIds.map(async (participantId) => {
        try {
          const user = await this.userService.getPublicUserInfo(participantId);
          const stats = participantStats.get(participantId)!;
          stats.participantName = `${user.firstName} ${user.lastName}`;
        } catch (error) {
          console.warn(`Failed to fetch user ${participantId}:`, error);
          const stats = participantStats.get(participantId)!;
          stats.participantName = 'Unknown';
        }
      })
    );
    
    // Convert stats to Standing entities for tiebreaker resolution
    const standingEntities = Array.from(participantStats.values()).map(stats =>
      new Standing({
        id: `standing_${bracketId}_${stats.participantId}`,
        bracketId,
        participantId: stats.participantId,
        position: 0, // Will be assigned after tiebreaking
        matchesPlayed: stats.matchesPlayed,
        matchesWon: stats.matchesWon,
        matchesLost: stats.matchesLost,
        setsWon: stats.setsWon,
        setsLost: stats.setsLost,
        gamesWon: stats.gamesWon,
        gamesLost: stats.gamesLost,
        points: stats.points,
      })
    );
    
    // Sort by points first (primary criterion)
    standingEntities.sort((a, b) => b.points - a.points);
    
    // Group participants by points (identify ties)
    const pointGroups: Standing[][] = [];
    let currentGroup: Standing[] = [];
    let currentPoints = -1;
    
    for (const standing of standingEntities) {
      if (standing.points !== currentPoints) {
        if (currentGroup.length > 0) {
          pointGroups.push(currentGroup);
        }
        currentGroup = [standing];
        currentPoints = standing.points;
      } else {
        currentGroup.push(standing);
      }
    }
    if (currentGroup.length > 0) {
      pointGroups.push(currentGroup);
    }
    
    // Resolve ties within each group using the comprehensive tiebreaker service
    const resolvedStandings: Standing[] = [];
    for (const group of pointGroups) {
      if (group.length === 1) {
        // No tie, add as-is
        resolvedStandings.push(group[0]);
      } else {
        // Tied participants - apply all 6 tiebreaker criteria
        const resolvedGroup = this.tiebreakResolver.resolveTies(group, matches);
        resolvedStandings.push(...resolvedGroup);
      }
    }
    
    // Assign final positions and convert to DTOs
    return resolvedStandings.map((standing, index) => {
      const stats = participantStats.get(standing.participantId)!;
      return this.mapStandingToDto({
        ...stats,
        bracketId,
        position: index + 1,
      });
    });
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
   * Retrieves standings for all brackets in a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of standings for all tournament brackets
   */
  public async getStandingsByTournament(tournamentId: string): Promise<StandingDto[]> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    // Get all brackets for the tournament
    const brackets = await this.bracketRepository.findByTournament(tournamentId);
    
    if (brackets.length === 0) {
      return [];
    }
    
    // Get standings for each bracket
    const allStandings: StandingDto[] = [];
    for (const bracket of brackets) {
      try {
        const bracketStandings = await this.calculateStandings(bracket.id);
        allStandings.push(...bracketStandings);
      } catch (error) {
        console.warn(`Failed to calculate standings for bracket ${bracket.id}:`, error);
        // Continue with other brackets
      }
    }
    
    return allStandings;
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
