/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/src/application/services/ranking.service.ts
 * @desc Backend ranking service: computes global ELO-based player rankings (FR41, FR44).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Repository} from 'typeorm';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {GlobalRanking} from '../../domain/entities/global-ranking.entity';
import {Match} from '../../domain/entities/match.entity';
import {User} from '../../domain/entities/user.entity';
import {MatchStatus} from '../../domain/enumerations/match-status';
import {UserRole} from '../../domain/enumerations/user-role';
import {generateId} from '../../shared/utils/id-generator';

/**
 * Default ELO starting rating for new players.
 * 1200 is a conventional entry-level ELO rating in tennis ranking systems.
 */
const DEFAULT_ELO = 1200;

/**
 * ELO K-factor: controls how much each match moves the rating.
 * Higher K → faster changes. Common values: 16 (stable players), 32 (beginners).
 */
const K_FACTOR = 32;

/**
 * Backend service that computes global ELO-based player rankings from all completed matches.
 *
 * @remarks
 * Uses the standard Elo rating system formula:
 * ```
 * E_A = 1 / (1 + 10^((R_B - R_A) / 400))   // Expected score for A
 * R_A' = R_A + K * (S_A - E_A)               // New rating for A
 * ```
 * Where S_A = 1 for a win, 0 for a loss.
 */
export class RankingService {
  private readonly matchRepository: Repository<Match>;
  private readonly rankingRepository: Repository<GlobalRanking>;
  private readonly userRepository: Repository<User>;

  public constructor() {
    this.matchRepository = AppDataSource.getRepository(Match);
    this.rankingRepository = AppDataSource.getRepository(GlobalRanking);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Calculates the expected score for player A against player B.
   *
   * @param ratingA - Current ELO rating of player A
   * @param ratingB - Current ELO rating of player B
   * @returns Expected win probability for player A (0 to 1)
   */
  private expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  /**
   * Updates ELO ratings for two players after a match.
   *
   * @param winnerRating - Current rating of the winner
   * @param loserRating - Current rating of the loser
   * @returns Tuple of [newWinnerRating, newLoserRating]
   */
  private updateElo(winnerRating: number, loserRating: number): [number, number] {
    const expectedWinner = this.expectedScore(winnerRating, loserRating);
    const expectedLoser = this.expectedScore(loserRating, winnerRating);

    const newWinnerRating = Math.round(winnerRating + K_FACTOR * (1 - expectedWinner));
    const newLoserRating = Math.round(loserRating + K_FACTOR * (0 - expectedLoser));

    return [newWinnerRating, newLoserRating];
  }

  /**
   * Recalculates global ELO rankings from scratch using all confirmed completed matches.
   * This is a full rebuild — ratings are reset to DEFAULT_ELO then replayed in chronological order.
   *
   * @remarks
   * Triggered by FR44 (global ranking update workflow) at the admin's request or after
   * tournament finalization. Results are persisted in the `global_rankings` table.
   */
  public async recalculateAllRankings(): Promise<void> {
    // Fetch all PLAYER-role users
    const players = await this.userRepository.find({
      where: {role: UserRole.PLAYER},
      select: ['id'],
    });

    // Initialize ELO map
    const eloMap = new Map<string, number>();
    const winsMap = new Map<string, number>();
    const lossesMap = new Map<string, number>();
    const tournamentsMap = new Map<string, Set<string>>();

    for (const player of players) {
      eloMap.set(player.id, DEFAULT_ELO);
      winsMap.set(player.id, 0);
      lossesMap.set(player.id, 0);
      tournamentsMap.set(player.id, new Set());
    }

    // Fetch all completed matches in chronological order (replay history)
    const completedMatches = await this.matchRepository.find({
      where: {status: MatchStatus.COMPLETED},
      relations: ['bracket'],
      order: {updatedAt: 'ASC'},
    });

    for (const match of completedMatches) {
      if (!match.winnerId || !match.participant1Id || !match.participant2Id) continue;

      const loserId =
        match.winnerId === match.participant1Id ? match.participant2Id : match.participant1Id;

      const winnerRating = eloMap.get(match.winnerId) ?? DEFAULT_ELO;
      const loserRating = eloMap.get(loserId) ?? DEFAULT_ELO;

      const [newWinnerRating, newLoserRating] = this.updateElo(winnerRating, loserRating);

      eloMap.set(match.winnerId, newWinnerRating);
      eloMap.set(loserId, newLoserRating);

      winsMap.set(match.winnerId, (winsMap.get(match.winnerId) ?? 0) + 1);
      lossesMap.set(loserId, (lossesMap.get(loserId) ?? 0) + 1);

      // Track unique tournaments played
      if (match.bracket?.tournamentId) {
        const tId = match.bracket.tournamentId;
        if (!tournamentsMap.has(match.winnerId)) tournamentsMap.set(match.winnerId, new Set());
        if (!tournamentsMap.has(loserId)) tournamentsMap.set(loserId, new Set());
        tournamentsMap.get(match.winnerId)!.add(tId);
        tournamentsMap.get(loserId)!.add(tId);
      }
    }

    // Sort players by ELO descending to assign ranks
    const ranked = Array.from(eloMap.entries()).sort(([, a], [, b]) => b - a);

    // Filter to only players who have played BEFORE assigning ranks
    const playedRanked = ranked.filter(([playerId]) => {
      const wins = winsMap.get(playerId) ?? 0;
      const losses = lossesMap.get(playerId) ?? 0;
      return wins + losses > 0;
    });

    // Upsert global_rankings table
    for (let i = 0; i < playedRanked.length; i++) {
      const [playerId, elo] = playedRanked[i];
      const rank = i + 1;
      const wins = winsMap.get(playerId) ?? 0;
      const losses = lossesMap.get(playerId) ?? 0;
      const tournamentsPlayed = tournamentsMap.get(playerId)?.size ?? 0;

      const existing = await this.rankingRepository.findOne({where: {playerId}});

      if (existing) {
        existing.rank = rank;
        existing.points = elo;
        existing.wins = wins;
        existing.losses = losses;
        existing.tournamentsPlayed = tournamentsPlayed;
        await this.rankingRepository.save(existing);
      } else {
        const newRanking = this.rankingRepository.create({
          id: generateId('rnk'),
          playerId,
          rank,
          points: elo,
          wins,
          losses,
          tournamentsPlayed,
        });
        await this.rankingRepository.save(newRanking);
      }
    }
  }
}
