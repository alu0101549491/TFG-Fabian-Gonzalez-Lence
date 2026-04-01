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
import {MatchResult, ConfirmationStatus} from '../../domain/entities/match-result.entity';
import {MatchStatus} from '../../domain/enumerations/match-status';
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
      const {bracketId, participantId} = req.query;
      const matchRepository = AppDataSource.getRepository(Match);
      
      // Build where clause dynamically based on query parameters
      let whereClause: any = {};
      if (bracketId) {
        whereClause.bracketId = bracketId as string;
      }
      
      // If participantId is provided, use OR condition to find matches where user is either participant
      let matches: Match[];
      if (participantId) {
        matches = await matchRepository.find({
          where: [
            {...whereClause, participant1Id: participantId as string},
            {...whereClause, participant2Id: participantId as string},
          ],
          relations: ['scores', 'court', 'participant1', 'participant2', 'winner'],
        });
      } else {
        // If no participantId, filter by bracket or return all matches
        matches = await matchRepository.find({
          where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
          relations: ['scores', 'court', 'participant1', 'participant2', 'winner'],
        });
      }
      
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
   * Automatically advances winners to next round in single elimination.
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const matchRepository = AppDataSource.getRepository(Match);
      
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['bracket'],
      });
      
      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      const previousWinnerId = match.winnerId;
      
      Object.assign(match, req.body);
      const updatedMatch = await matchRepository.save(match);
      
      // If match is completed and has a winner, advance to next round
      if (updatedMatch.winnerId && updatedMatch.winnerId !== previousWinnerId) {
        await this.advanceWinnerToNextRound(updatedMatch, matchRepository);
      }
      
      res.status(HTTP_STATUS.OK).json(updatedMatch);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Advances the winner of a match to the next round.
   * For single elimination brackets only.
   *
   * @param match - The completed match
   * @param matchRepository - Match repository
   */
  private async advanceWinnerToNextRound(
    match: Match,
    matchRepository: any,
  ): Promise<void> {
    // Only advance winners in single elimination brackets
    const bracket = match.bracket;
    if (!bracket || bracket.bracketType !== 'SINGLE_ELIMINATION') {
      return;
    }

    // Don't advance if this is the final match (no next round)
    const nextRound = match.round + 1;
    const nextRoundMatches = await matchRepository.find({
      where: {
        bracketId: match.bracketId,
        round: nextRound,
      },
      order: {matchNumber: 'ASC'},
    });

    if (nextRoundMatches.length === 0) {
      // This was the final match
      return;
    }

    // Calculate which match in the next round this winner advances to
    // In single elimination: matches (2n-1) and (2n) feed into match n
    const nextMatchIndex = Math.ceil(match.matchNumber / 2) - 1;
    const nextMatch = nextRoundMatches[nextMatchIndex];

    if (!nextMatch) {
      console.error(`Could not find next match for match ${match.matchNumber} in round ${match.round}`);
      return;
    }

    // Determine if winner goes to participant1 or participant2 slot
    // Odd match numbers go to participant1, even to participant2
    if (match.matchNumber % 2 === 1) {
      nextMatch.participant1Id = match.winnerId;
    } else {
      nextMatch.participant2Id = match.winnerId;
    }

    await matchRepository.save(nextMatch);

    console.log(
      `✅ Advanced winner ${match.winnerId} from Match ${match.matchNumber} (Round ${match.round}) to Match ${nextMatch.matchNumber} (Round ${nextMatch.round})`
    );
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

  /**
   * POST /api/matches/:id/result
   * Submits a match result as a participant (FR24).
   * Result will be PENDING_CONFIRMATION until opponent confirms.
   */
  public async submitResultAsParticipant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const matchRepository = AppDataSource.getRepository(Match);
      const matchResultRepository = AppDataSource.getRepository(MatchResult);

      // Fetch match to validate
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['participant1', 'participant2'],
      });

      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify user is a participant
      if (match.participant1Id !== userId && match.participant2Id !== userId) {
        throw new AppError('Only match participants can submit results', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }

      // Verify match can accept results (TBP, SCHEDULED, or IN_PROGRESS)
      const allowedStatuses = [MatchStatus.TO_BE_PLAYED, MatchStatus.SCHEDULED];
      if (!allowedStatuses.includes(match.status)) {
        throw new AppError(`Cannot submit results for match in status ${match.status}`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const {winnerId, setScores, player1Games, player2Games, playerComments} = req.body;

      // Validate required fields
      if (!winnerId || !setScores || setScores.length === 0) {
        throw new AppError('winnerId and setScores are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Create result entity
      const result = matchResultRepository.create({
        id: generateId('res'),
        matchId: id,
        submittedBy: userId,
        winnerId,
        setScores,
        player1Games: player1Games || 0,
        player2Games: player2Games || 0,
        confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION,
        playerComments: playerComments || null,
        isAdminEntry: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await matchResultRepository.save(result);

      // TODO: Send notification to opponent
      // await notificationService.notifyPendingConfirmation(matchId, opponentId);

      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }
}

