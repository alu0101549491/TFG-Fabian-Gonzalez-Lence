/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/match.controller.ts
 * @desc Match controller handling match operations and scoring.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Match} from '../../domain/entities/match.entity';
import {Score} from '../../domain/entities/score.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

/**
 * Match controller.
 */
export class MatchController {
  /**
   * Enriches matches with seed information from registrations.
   * 
   * @param matches - Array of matches to enrich
   * @returns Matches with seed information added to participant objects
   */
  private async enrichMatchesWithSeeds(matches: Match[]): Promise<any[]> {
    const registrationRepository = AppDataSource.getRepository(Registration);
    
    // Collect all unique participant IDs from matches
    const participantIds = new Set<string>();
    for (const match of matches) {
      if (match.participant1Id) participantIds.add(match.participant1Id);
      if (match.participant2Id) participantIds.add(match.participant2Id);
    }
    
    // Fetch all registrations for these participants in this bracket's category
    const registrations = await registrationRepository.find({
      where: {
        participantId: Array.from(participantIds) as any,
      },
    });
    
    // Create a map of participantId -> seed number
    const seedMap = new Map<string, number | null>();
    for (const registration of registrations) {
      seedMap.set(registration.participantId, registration.seedNumber || null);
    }
    
    // Enrich matches with seed info
    return matches.map(match => {
      const matchData = {
        ...match,
        participant1: match.participant1 ? {
          ...match.participant1,
          seed: seedMap.get(match.participant1Id!) || null,
        } : null,
        participant2: match.participant2 ? {
          ...match.participant2,
          seed: seedMap.get(match.participant2Id!) || null,
        } : null,
      };
      return matchData;
    });
  }

  /**
   * GET /api/matches
   * Lists matches for a bracket or all matches if bracketId is not provided.
   */
  public async getByBracket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {bracketId} = req.query;
      const matchRepository = AppDataSource.getRepository(Match);
      
      // If bracketId is provided, filter by bracket; otherwise return all matches
      const matches = bracketId
        ? await matchRepository.find({
            where: {bracketId: bracketId as string},
            relations: ['scores', 'court', 'participant1', 'participant2', 'winner'],
          })
        : await matchRepository.find({
            relations: ['scores', 'court', 'participant1', 'participant2', 'winner'],
          });
      
      // Enrich with seed information
      const enrichedMatches = await this.enrichMatchesWithSeeds(matches);
      
      res.status(HTTP_STATUS.OK).json(enrichedMatches);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/matches/:id
   * Retrieves match details.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const matchRepository = AppDataSource.getRepository(Match);
      
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['scores', 'court', 'participant1', 'participant2', 'winner'],
      });
      
      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Enrich with seed information
      const enrichedMatches = await this.enrichMatchesWithSeeds([match]);
      
      res.status(HTTP_STATUS.OK).json(enrichedMatches[0]);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/matches/:id
   * Updates match details (status, scores, etc.).
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const matchRepository = AppDataSource.getRepository(Match);
      
      const match = await matchRepository.findOne({where: {id}});
      
      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      Object.assign(match, req.body);
      await matchRepository.save(match);
      
      res.status(HTTP_STATUS.OK).json(match);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/matches/:id/score
   * Submits score for a match.
   */
  public async submitScore(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const scoreRepository = AppDataSource.getRepository(Score);
      
      const score = scoreRepository.create({
        ...req.body,
        id: generateId('scr'),
        matchId: id,
      });
      
      await scoreRepository.save(score);
      
      res.status(HTTP_STATUS.CREATED).json(score);
    } catch (error) {
      next(error);
    }
  }
}
