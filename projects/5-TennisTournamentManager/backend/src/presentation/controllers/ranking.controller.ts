/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/controllers/ranking.controller.ts
 * @desc Ranking controller for global player rankings (FR41, FR44).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {GlobalRanking} from '../../domain/entities/global-ranking.entity';
import {User} from '../../domain/entities/user.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS} from '../../shared/constants';
import {RankingService} from '../../application/services/ranking.service';

/**
 * Ranking controller.
 */
export class RankingController {
  private readonly rankingService: RankingService;

  public constructor() {
    this.rankingService = new RankingService();
  }

  /**
   * GET /api/rankings
   * Returns the top 100 global ELO rankings with player names, sorted by rank ascending.
   */
  public async getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rankingRepository = AppDataSource.getRepository(GlobalRanking);
      const userRepository = AppDataSource.getRepository(User);
      
      const rankings = await rankingRepository.find({order: {rank: 'ASC'}, take: 100});
      
      // Enrich rankings with player names
      const enrichedRankings = await Promise.all(
        rankings.map(async (ranking) => {
          const user = await userRepository.findOne({where: {id: ranking.playerId}});
          return {
            ...ranking,
            playerName: user ? `${user.firstName} ${user.lastName}` : ranking.playerId,
          };
        })
      );
      
      res.status(HTTP_STATUS.OK).json(enrichedRankings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/rankings/recalculate
   * Triggers a full ELO ranking recalculation from all historical match results.
   * Admin only (FR44).
   */
  public async recalculate(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.rankingService.recalculateAllRankings();
      res.status(HTTP_STATUS.OK).json({message: 'Global ELO rankings recalculated successfully.'});
    } catch (error) {
      next(error);
    }
  }
}
