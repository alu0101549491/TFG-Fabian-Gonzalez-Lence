/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file application/services/standing.service.ts
 * @desc Backend standing service: computes and persists standings from match results (FR39, FR40, FR43).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Repository} from 'typeorm';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Match} from '../../domain/entities/match.entity';
import {Standing} from '../../domain/entities/standing.entity';
import {Bracket} from '../../domain/entities/bracket.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {DoublesTeam} from '../../domain/entities/doubles-team.entity';
import {MatchStatus} from '../../domain/enumerations/match-status';
import {generateId} from '../../shared/utils/id-generator';

/**
 * Aggregated per-player stats used during standings computation.
 */
interface PlayerStats {
  participantId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  headToHead: Map<string, number>; // opponentId -> wins against that opponent
  seedNumber: number | null;
}

/**
 * Aggregated per-team stats for doubles standings computation.
 */
interface TeamStats {
  teamId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  headToHead: Map<string, number>;
  seedNumber: number | null;
}

/**
 * Backend service that computes standings from completed matches and persists them.
 *
 * @remarks
 * - For ROUND_ROBIN brackets: calculates full standings with points, ratios, and tiebreakers.
 * - For SINGLE_ELIMINATION / MATCH_PLAY: standings simply reflect winning/losing records.
 * - This service is triggered automatically after each officially confirmed match result
 *   (FR39, FR40, FR43) so the standings table is always up-to-date on the backend.
 */
export class StandingService {
  private readonly matchRepository: Repository<Match>;
  private readonly standingRepository: Repository<Standing>;
  private readonly bracketRepository: Repository<Bracket>;
  private readonly registrationRepository: Repository<Registration>;
  private readonly doublesTeamRepository: Repository<DoublesTeam>;

  public constructor() {
    this.matchRepository = AppDataSource.getRepository(Match);
    this.standingRepository = AppDataSource.getRepository(Standing);
    this.bracketRepository = AppDataSource.getRepository(Bracket);
    this.registrationRepository = AppDataSource.getRepository(Registration);
    this.doublesTeamRepository = AppDataSource.getRepository(DoublesTeam);
  }

  /**
   * Recalculates and persists standings for all brackets of the tournament that
   * contains the given match.
   *
   * @param matchId - ID of the completed match that triggered the recalculation
   */
  public async recalculateForMatch(matchId: string): Promise<void> {
    const match = await this.matchRepository.findOne({
      where: {id: matchId},
      relations: ['bracket'],
    });

    if (!match?.bracketId) {
      console.warn(`[StandingService] Match ${matchId} not found or has no bracket`);
      return;
    }

    await this.recalculateForBracket(match.bracketId);
  }

  /**
   * Recalculates and persists standings for a single bracket.
   *
   * @param bracketId - ID of the bracket to recalculate
   */
  public async recalculateForBracket(bracketId: string): Promise<void> {
    const bracket = await this.bracketRepository.findOne({where: {id: bracketId}});
    if (!bracket) {
      console.warn(`[StandingService] Bracket ${bracketId} not found`);
      return;
    }

    // Fetch all completed matches in this bracket
    const completedMatches = await this.matchRepository.find({
      where: {bracketId, status: MatchStatus.COMPLETED},
      relations: ['scores'],
    });

    // Detect doubles bracket from the first match that has team columns
    const isDoubles = completedMatches.some(m => m.participant1TeamId || m.participant2TeamId);
    if (isDoubles) {
      return this.recalculateDoublesForBracket(bracketId, bracket, completedMatches);
    }

    return this.recalculateSinglesForBracket(bracketId, bracket, completedMatches);
  }

  /**
   * Recalculates singles standings for a bracket.
   */
  private async recalculateSinglesForBracket(bracketId: string, bracket: Bracket, completedMatches: Match[]): Promise<void> {

    // Collect participant seeds from registrations
    const participantIds = new Set<string>();
    for (const m of completedMatches) {
      if (m.participant1Id) participantIds.add(m.participant1Id);
      if (m.participant2Id) participantIds.add(m.participant2Id);
    }

    const registrations = await this.registrationRepository.find({
      where: {tournamentId: bracket.tournamentId},
    });

    const seedMap = new Map<string, number | null>();
    for (const reg of registrations) {
      seedMap.set(reg.participantId, reg.seedNumber ?? null);
    }

    // Build player stats map
    const statsMap = new Map<string, PlayerStats>();

    const ensurePlayer = (id: string) => {
      if (!statsMap.has(id)) {
        statsMap.set(id, {
          participantId: id,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0,
          points: 0,
          headToHead: new Map(),
          seedNumber: seedMap.get(id) ?? null,
        });
      }
      return statsMap.get(id)!;
    };

    for (const match of completedMatches) {
      if (!match.participant1Id || !match.participant2Id || !match.winnerId) continue;

      const p1 = ensurePlayer(match.participant1Id);
      const p2 = ensurePlayer(match.participant2Id);

      const isP1Winner = match.winnerId === match.participant1Id;

      p1.matchesPlayed++;
      p2.matchesPlayed++;

      if (isP1Winner) {
        p1.wins++;
        p2.losses++;
        p1.points += 3; // 3 points per win (ITF-style Round Robin scoring)
        p1.headToHead.set(p2.participantId, (p1.headToHead.get(p2.participantId) ?? 0) + 1);
      } else {
        p2.wins++;
        p1.losses++;
        p2.points += 3;
        p2.headToHead.set(p1.participantId, (p2.headToHead.get(p1.participantId) ?? 0) + 1);
      }

      // Accumulate set/game stats from stored scores
      for (const score of match.scores ?? []) {
        p1.setsWon += score.player1Games > score.player2Games ? 1 : 0;
        p1.setsLost += score.player1Games < score.player2Games ? 1 : 0;
        p2.setsWon += score.player2Games > score.player1Games ? 1 : 0;
        p2.setsLost += score.player2Games < score.player1Games ? 1 : 0;
        p1.gamesWon += score.player1Games;
        p1.gamesLost += score.player2Games;
        p2.gamesWon += score.player2Games;
        p2.gamesLost += score.player1Games;
      }
    }

    // Sort players to determine ranks (Round Robin uses points + tiebreakers; others use wins)
    const sorted = Array.from(statsMap.values()).sort((a, b) => {
      // 1. Points descending
      if (b.points !== a.points) return b.points - a.points;

      // 2. Set ratio descending (avoid /0)
      const aSetRatio = a.setsLost > 0 ? a.setsWon / a.setsLost : (a.setsWon > 0 ? Infinity : 0);
      const bSetRatio = b.setsLost > 0 ? b.setsWon / b.setsLost : (b.setsWon > 0 ? Infinity : 0);
      if (bSetRatio !== aSetRatio) return bSetRatio - aSetRatio;

      // 3. Game ratio descending
      const aGameRatio = a.gamesLost > 0 ? a.gamesWon / a.gamesLost : (a.gamesWon > 0 ? Infinity : 0);
      const bGameRatio = b.gamesLost > 0 ? b.gamesWon / b.gamesLost : (b.gamesWon > 0 ? Infinity : 0);
      if (bGameRatio !== aGameRatio) return bGameRatio - aGameRatio;

      // 4. Head-to-head wins between these two
      const aH2H = a.headToHead.get(b.participantId) ?? 0;
      const bH2H = b.headToHead.get(a.participantId) ?? 0;
      if (bH2H !== aH2H) return bH2H - aH2H;

      // 5. Seed number ascending (lower seed = better)
      const aSeed = a.seedNumber ?? Number.MAX_SAFE_INTEGER;
      const bSeed = b.seedNumber ?? Number.MAX_SAFE_INTEGER;
      return aSeed - bSeed;
    });

    // Upsert standings
    for (let i = 0; i < sorted.length; i++) {
      const stats = sorted[i];
      const rank = i + 1;

      const existing = await this.standingRepository.findOne({
        where: {
          tournamentId: bracket.tournamentId,
          categoryId: bracket.categoryId,
          participantId: stats.participantId,
        },
      });

      if (existing) {
        existing.matchesPlayed = stats.matchesPlayed;
        existing.wins = stats.wins;
        existing.losses = stats.losses;
        existing.points = stats.points;
        existing.rank = rank;
        await this.standingRepository.save(existing);
      } else {
        const standing = this.standingRepository.create({
          id: generateId('std'),
          tournamentId: bracket.tournamentId,
          categoryId: bracket.categoryId,
          participantId: stats.participantId,
          matchesPlayed: stats.matchesPlayed,
          wins: stats.wins,
          losses: stats.losses,
          draws: 0,
          points: stats.points,
          rank,
        });
        await this.standingRepository.save(standing);
      }
    }

    console.log(
      `✅ [StandingService] Standings recalculated for bracket ${bracketId} ` +
      `(${sorted.length} players, bracket type: ${bracket.bracketType})`,
    );
  }

  /**
   * Recalculates doubles standings for a bracket, keyed by team ID.
   */
  private async recalculateDoublesForBracket(bracketId: string, bracket: Bracket, completedMatches: Match[]): Promise<void> {
    // Collect team IDs from completed doubles matches
    const teamIds = new Set<string>();
    for (const m of completedMatches) {
      if (m.participant1TeamId) teamIds.add(m.participant1TeamId);
      if (m.participant2TeamId) teamIds.add(m.participant2TeamId);
    }

    // Load teams for seed info
    const teams = teamIds.size > 0
      ? await this.doublesTeamRepository.find({where: Array.from(teamIds).map(id => ({id}))})
      : [];
    const teamSeedMap = new Map<string, number | null>();
    for (const team of teams) {
      teamSeedMap.set(team.id, team.seedNumber ?? null);
    }

    const statsMap = new Map<string, TeamStats>();

    const ensureTeam = (id: string): TeamStats => {
      if (!statsMap.has(id)) {
        statsMap.set(id, {
          teamId: id, matchesPlayed: 0, wins: 0, losses: 0,
          setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0,
          points: 0, headToHead: new Map(),
          seedNumber: teamSeedMap.get(id) ?? null,
        });
      }
      return statsMap.get(id)!;
    };

    for (const match of completedMatches) {
      if (!match.participant1TeamId || !match.participant2TeamId || !match.winnerTeamId) continue;

      const t1 = ensureTeam(match.participant1TeamId);
      const t2 = ensureTeam(match.participant2TeamId);
      const isT1Winner = match.winnerTeamId === match.participant1TeamId;

      t1.matchesPlayed++;
      t2.matchesPlayed++;

      if (isT1Winner) {
        t1.wins++; t2.losses++; t1.points += 3;
        t1.headToHead.set(t2.teamId, (t1.headToHead.get(t2.teamId) ?? 0) + 1);
      } else {
        t2.wins++; t1.losses++; t2.points += 3;
        t2.headToHead.set(t1.teamId, (t2.headToHead.get(t1.teamId) ?? 0) + 1);
      }

      for (const score of match.scores ?? []) {
        t1.setsWon += score.player1Games > score.player2Games ? 1 : 0;
        t1.setsLost += score.player1Games < score.player2Games ? 1 : 0;
        t2.setsWon += score.player2Games > score.player1Games ? 1 : 0;
        t2.setsLost += score.player2Games < score.player1Games ? 1 : 0;
        t1.gamesWon += score.player1Games;
        t1.gamesLost += score.player2Games;
        t2.gamesWon += score.player2Games;
        t2.gamesLost += score.player1Games;
      }
    }

    const sorted = Array.from(statsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aSetRatio = a.setsLost > 0 ? a.setsWon / a.setsLost : (a.setsWon > 0 ? Infinity : 0);
      const bSetRatio = b.setsLost > 0 ? b.setsWon / b.setsLost : (b.setsWon > 0 ? Infinity : 0);
      if (bSetRatio !== aSetRatio) return bSetRatio - aSetRatio;
      const aGameRatio = a.gamesLost > 0 ? a.gamesWon / a.gamesLost : (a.gamesWon > 0 ? Infinity : 0);
      const bGameRatio = b.gamesLost > 0 ? b.gamesWon / b.gamesLost : (b.gamesWon > 0 ? Infinity : 0);
      if (bGameRatio !== aGameRatio) return bGameRatio - aGameRatio;
      const aH2H = a.headToHead.get(b.teamId) ?? 0;
      const bH2H = b.headToHead.get(a.teamId) ?? 0;
      if (bH2H !== aH2H) return bH2H - aH2H;
      const aSeed = a.seedNumber ?? Number.MAX_SAFE_INTEGER;
      const bSeed = b.seedNumber ?? Number.MAX_SAFE_INTEGER;
      return aSeed - bSeed;
    });

    for (let i = 0; i < sorted.length; i++) {
      const stats = sorted[i];
      const rank = i + 1;

      const existing = await this.standingRepository.findOne({
        where: {tournamentId: bracket.tournamentId, categoryId: bracket.categoryId, teamId: stats.teamId},
      });

      if (existing) {
        existing.matchesPlayed = stats.matchesPlayed;
        existing.wins = stats.wins;
        existing.losses = stats.losses;
        existing.points = stats.points;
        existing.rank = rank;
        await this.standingRepository.save(existing);
      } else {
        const standing = this.standingRepository.create({
          id: generateId('std'),
          tournamentId: bracket.tournamentId,
          categoryId: bracket.categoryId,
          participantId: null, // null for doubles standings
          teamId: stats.teamId,
          matchesPlayed: stats.matchesPlayed,
          wins: stats.wins,
          losses: stats.losses,
          draws: 0,
          points: stats.points,
          rank,
        });
        await this.standingRepository.save(standing);
      }
    }

    console.log(
      `✅ [StandingService] Doubles standings recalculated for bracket ${bracketId} ` +
      `(${sorted.length} teams, bracket type: ${bracket.bracketType})`,
    );
  }
}
