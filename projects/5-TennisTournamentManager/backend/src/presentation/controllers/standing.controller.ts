/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/controllers/standing.controller.ts
 * @desc Standing controller for tournament standings.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Standing} from '../../domain/entities/standing.entity';
import {DoublesTeam} from '../../domain/entities/doubles-team.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {StandingService} from '../../application/services/standing.service';

export class StandingController {
  private readonly standingService: StandingService;

  public constructor() {
    this.standingService = new StandingService();
  }

  /**
   * GET /api/standings?categoryId=xxx
   * Returns sorted standings for a category.
   */
  public async getByCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {categoryId} = req.query;
      
      if (!categoryId) {
        throw new AppError('categoryId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const standingRepository = AppDataSource.getRepository(Standing);
      const doublesTeamRepository = AppDataSource.getRepository(DoublesTeam);
      const standings = await standingRepository.find({
        where: {categoryId: categoryId as string},
        order: {rank: 'ASC'},
      });

      // For doubles standings: enrich with team player names
      const teamIds = standings.map(s => s.teamId).filter(Boolean) as string[];
      if (teamIds.length > 0) {
        const teams = await doublesTeamRepository.find({
          where: teamIds.map(id => ({id})),
          relations: ['player1', 'player2'],
        }) as (DoublesTeam & {player1: {id: string; firstName: string; lastName: string}; player2: {id: string; firstName: string; lastName: string}})[];
        const teamMap = new Map(teams.map(t => [t.id, t]));

        const enrichedStandings = standings.map(s => {
          if (s.teamId) {
            const team = teamMap.get(s.teamId);
            return {
              ...s,
              team: team ? {
                id: team.id,
                seedNumber: team.seedNumber,
                player1: {id: team.player1.id, firstName: team.player1.firstName, lastName: team.player1.lastName},
                player2: {id: team.player2.id, firstName: team.player2.firstName, lastName: team.player2.lastName},
              } : null,
            };
          }
          return s;
        });
        res.status(HTTP_STATUS.OK).json(enrichedStandings);
        return;
      }

      res.status(HTTP_STATUS.OK).json(standings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/standings/recalculate?bracketId=xxx
   * Triggers backend standings recalculation for a bracket. Admin only (FR43).
   */
  public async recalculate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {bracketId} = req.query;

      if (!bracketId) {
        throw new AppError('bracketId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      await this.standingService.recalculateForBracket(bracketId as string);

      res.status(HTTP_STATUS.OK).json({
        message: `Standings recalculated for bracket ${bracketId}`,
      });
    } catch (error) {
      next(error);
    }
  }
}
