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
import {DoublesTeam} from '../../domain/entities/doubles-team.entity';
import {MatchResult, ConfirmationStatus} from '../../domain/entities/match-result.entity';
import {MatchStatus} from '../../domain/enumerations/match-status';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {NotificationService} from '../../application/services/notification.service';
import {PrivacyService} from '../../application/services/privacy.service';
import {StandingService} from '../../application/services/standing.service';
import {User} from '../../domain/entities/user.entity';
import {Bracket} from '../../domain/entities/bracket.entity';
import {TennisScoreValidator, TennisSetScore} from '../../shared/utils/tennis-score-validator';

/**
 * Match controller.
 */
export class MatchController {
  private readonly notificationService: NotificationService;
  private readonly privacyService: PrivacyService;
  private readonly scoreValidator: TennisScoreValidator;
  private readonly standingService: StandingService;

  constructor() {
    this.notificationService = new NotificationService();
    this.privacyService = new PrivacyService();
    this.standingService = new StandingService();
    // Initialize with standard best-of-3 format
    this.scoreValidator = new TennisScoreValidator({
      bestOfFive: false,
      requireTiebreakAt6All: true,
    });
  }
  /**
   * Checks if a user is a direct participant (singles) or team member (doubles) in a match.
   *
   * @param match - The match to check
   * @param userId - The user ID to test
   * @returns True if the user may participate in this match
   */
  private async isUserMatchParticipant(match: Match, userId: string): Promise<boolean> {
    if (match.participant1TeamId || match.participant2TeamId) {
      const doublesTeamRepo = AppDataSource.getRepository(DoublesTeam);
      const teamIds = [match.participant1TeamId, match.participant2TeamId].filter(Boolean) as string[];
      if (teamIds.length === 0) return false;
      const teams = await doublesTeamRepo.findByIds(teamIds);
      return teams.some(team => team.player1Id === userId || team.player2Id === userId);
    }
    return match.participant1Id === userId || match.participant2Id === userId;
  }

  /**
   * Applies privacy filtering to participant user objects in matches.
   * Filters participant1, participant2, and winner based on viewer permissions.
   * 
   * @param matches - Array of matches with unfiltered participant data
   * @param viewer - Viewing user (null if unauthenticated)
   * @param tournamentId - Tournament context for privacy checks (optional)
   * @returns Matches with privacy-filtered participant data
   */
  private async applyPrivacyToMatches(matches: any[], viewer: User | null, tournamentId?: string): Promise<any[]> {
    return Promise.all(matches.map(async (match) => {
      const filteredMatch = {...match};
      
      // Filter participant1 if present
      if (match.participant1) {
        filteredMatch.participant1 = await this.privacyService.filterUserData(
          match.participant1,
          viewer,
          tournamentId
        );
      }
      
      // Filter participant2 if present
      if (match.participant2) {
        filteredMatch.participant2 = await this.privacyService.filterUserData(
          match.participant2,
          viewer,
          tournamentId
        );
      }
      
      // Filter winner if present
      if (match.winner) {
        filteredMatch.winner = await this.privacyService.filterUserData(
          match.winner,
          viewer,
          tournamentId
        );
      }
      
      return filteredMatch;
    }));
  }

  /**
   * Enriches matches with seed information from registrations.
   * 
   * @param matches - Array of matches to enrich
   * @returns Matches with seed information added to participant objects
   */
  private async enrichMatchesWithSeeds(matches: Match[]): Promise<any[]> {
    const registrationRepository = AppDataSource.getRepository(Registration);
    const doublesTeamRepo = AppDataSource.getRepository(DoublesTeam);

    // Collect singles participant IDs and doubles team IDs
    const participantIds = new Set<string>();
    const teamIds = new Set<string>();
    for (const match of matches) {
      if (match.participant1Id) participantIds.add(match.participant1Id);
      if (match.participant2Id) participantIds.add(match.participant2Id);
      if (match.participant1TeamId) teamIds.add(match.participant1TeamId);
      if (match.participant2TeamId) teamIds.add(match.participant2TeamId);
    }

    // Singles: build seedNumber map from registrations
    const seedMap = new Map<string, number | null>();
    if (participantIds.size > 0) {
      const registrations = await registrationRepository.find({
        where: {participantId: Array.from(participantIds) as any},
      });
      for (const registration of registrations) {
        seedMap.set(registration.participantId, registration.seedNumber || null);
      }
    }

    // Doubles: build team map with seed + player names
    const teamMap = new Map<string, DoublesTeam & {player1: any; player2: any}>();
    if (teamIds.size > 0) {
      const teams = await doublesTeamRepo.find({
        where: Array.from(teamIds).map(id => ({id})),
        relations: ['player1', 'player2'],
      }) as (DoublesTeam & {player1: any; player2: any})[];
      for (const team of teams) {
        teamMap.set(team.id, team);
      }
    }

    return matches.map(match => {
      const isDoubles = Boolean(match.participant1TeamId || match.participant2TeamId);
      if (isDoubles) {
        const team1 = match.participant1TeamId ? teamMap.get(match.participant1TeamId) : null;
        const team2 = match.participant2TeamId ? teamMap.get(match.participant2TeamId) : null;
        return {
          ...match,
          participant1: team1 ? {id: team1.player1Id, firstName: team1.player1?.firstName, lastName: team1.player1?.lastName} : null,
          participant2: team2 ? {id: team2.player1Id, firstName: team2.player1?.firstName, lastName: team2.player1?.lastName} : null,
          participant1Team: team1 ? {
            id: team1.id, seedNumber: team1.seedNumber,
            player1: {id: team1.player1Id, firstName: team1.player1?.firstName, lastName: team1.player1?.lastName},
            player2: {id: team1.player2Id, firstName: team1.player2?.firstName, lastName: team1.player2?.lastName},
          } : null,
          participant2Team: team2 ? {
            id: team2.id, seedNumber: team2.seedNumber,
            player1: {id: team2.player1Id, firstName: team2.player1?.firstName, lastName: team2.player1?.lastName},
            player2: {id: team2.player2Id, firstName: team2.player2?.firstName, lastName: team2.player2?.lastName},
          } : null,
        };
      }
      // Singles: enrich with registration seed
      return {
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
    });
  }

  /**
   * GET /api/matches
   * Lists matches for a bracket or all matches if bracketId is not provided.
   * Privacy enforcement: Filters participant1, participant2, and winner based on viewer permissions.
   */
  public async getByBracket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {bracketId, participantId} = req.query;
      const matchRepository = AppDataSource.getRepository(Match);
      const matchResultRepository = AppDataSource.getRepository(MatchResult);
      const userRepository = AppDataSource.getRepository(User);
      const bracketRepository = AppDataSource.getRepository(Bracket);
      
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
      
      // Get viewer from JWT token (null if not authenticated)
      const viewer = req.user ? await userRepository.findOne({where: {id: req.user.id}}) : null;
      
      // Get tournament context for privacy filtering
      let tournamentId: string | undefined;
      if (bracketId && matches.length > 0) {
        const bracket = await bracketRepository.findOne({where: {id: bracketId as string}});
        tournamentId = bracket?.tournamentId;
      }
      
      // Apply privacy filtering to participant data
      const privacyFilteredMatches = await this.applyPrivacyToMatches(enrichedMatches, viewer, tournamentId);
      
      // Extract courtName from court relation for each match
      const matchesWithCourtNames = privacyFilteredMatches.map((match: any) => ({
        ...match,
        courtName: match.court?.name || null,
      }));
      
      // If participantId is provided, include pending results for each match
      if (participantId) {
        const matchesWithResults = await Promise.all(matchesWithCourtNames.map(async (match: any) => {
          // Find pending result for this match
          const pendingResult = await matchResultRepository.findOne({
            where: {
              matchId: match.id,
              confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION,
            },
          });
          
          // Add pendingResult to match data
          return {
            ...match,
            pendingResult: pendingResult || null,
          };
        }));
        
        res.status(HTTP_STATUS.OK).json(matchesWithResults);
      } else {
        res.status(HTTP_STATUS.OK).json(matchesWithCourtNames);
      }
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/matches/:id
   * Retrieves match details with privacy filtering applied to participants.
   * Privacy enforcement: Filters participant1, participant2, and winner based on viewer permissions.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const matchRepository = AppDataSource.getRepository(Match);
      const userRepository = AppDataSource.getRepository(User);
      const bracketRepository = AppDataSource.getRepository(Bracket);
      
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['scores', 'court', 'participant1', 'participant2', 'winner', 'bracket'],
      });
      
      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Enrich with seed information
      const enrichedMatches = await this.enrichMatchesWithSeeds([match]);
      
      // Get viewer from JWT token (null if not authenticated)
      const viewer = req.user ? await userRepository.findOne({where: {id: req.user.id}}) : null;
      
      // Get tournament context for privacy filtering
      const bracket = await bracketRepository.findOne({where: {id: match.bracketId}});
      const tournamentId = bracket?.tournamentId;
      
      // Apply privacy filtering to participant data
      const privacyFilteredMatches = await this.applyPrivacyToMatches(enrichedMatches, viewer, tournamentId);
      
      // Extract courtName from court relation
      const matchWithCourtName = {
        ...privacyFilteredMatches[0],
        courtName: match.court?.name || null,
      };
      
      res.status(HTTP_STATUS.OK).json(matchWithCourtName);
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
        // FR39/FR40/FR43: Recalculate standings after admin match update sets a winner
        await this.standingService.recalculateForMatch(updatedMatch.id);
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
    if (match.participant1TeamId || match.participant2TeamId) {
      // Doubles match: advance team winner
      if (match.matchNumber % 2 === 1) {
        nextMatch.participant1TeamId = match.winnerTeamId;
      } else {
        nextMatch.participant2TeamId = match.winnerTeamId;
      }
    } else {
      // Singles match: advance individual winner
      if (match.matchNumber % 2 === 1) {
        nextMatch.participant1Id = match.winnerId;
      } else {
        nextMatch.participant2Id = match.winnerId;
      }
    }

    await matchRepository.save(nextMatch);

    console.log(
      `✅ Advanced winner ${match.winnerId} from Match ${match.matchNumber} (Round ${match.round}) to Match ${nextMatch.matchNumber} (Round ${nextMatch.round})`
    );
  }
  
  /**
   * POST /api/matches/:id/score
   * Submits score for a match.
   * Validates tennis scoring rules before saving.
   */
  public async submitScore(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {winnerId, scores} = req.body;

      if (!winnerId || !scores || !Array.isArray(scores) || scores.length === 0) {
        throw new AppError('winnerId and scores array are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Convert scores to TennisSetScore format for validation
      const tennisScores: TennisSetScore[] = scores.map((score: any) => ({
        setNumber: score.setNumber,
        player1Games: score.player1Games,
        player2Games: score.player2Games,
        player1TiebreakPoints: score.player1TiebreakPoints,
        player2TiebreakPoints: score.player2TiebreakPoints,
      }));

      // Validate tennis scoring rules
      const validation = this.scoreValidator.validateMatch(tennisScores, winnerId);
      if (!validation.isValid) {
        throw new AppError(
          `Invalid tennis score: ${validation.errors.join('; ')}`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      const scoreRepository = AppDataSource.getRepository(Score);
      
      // Delete existing scores for this match to prevent duplicates (allow score updates)
      await scoreRepository.delete({matchId: id});
      
      // Save each set score
      const savedScores: Score[] = [];
      for (const score of tennisScores) {
        const scoreEntity = scoreRepository.create({
          id: generateId('scr'),
          matchId: id,
          setNumber: score.setNumber,
          player1Games: score.player1Games,
          player2Games: score.player2Games,
          player1TiebreakPoints: score.player1TiebreakPoints ?? null,
          player2TiebreakPoints: score.player2TiebreakPoints ?? null,
        });
        
        const saved = await scoreRepository.save(scoreEntity);
        savedScores.push(saved);
      }
      
      res.status(HTTP_STATUS.CREATED).json({
        scores: savedScores,
        message: 'Score validated and saved successfully',
      });
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

      // Verify user is a participant (singles) or team member (doubles)
      const isParticipant = await this.isUserMatchParticipant(match, userId);
      if (!isParticipant) {
        throw new AppError('Only match participants can submit results', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }

      // Verify match can accept results (SCHEDULED or IN_PROGRESS)
      const allowedStatuses = [MatchStatus.SCHEDULED, MatchStatus.IN_PROGRESS];
      if (!allowedStatuses.includes(match.status)) {
        throw new AppError(`Cannot submit results for match in status ${match.status}`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const {winnerId, setScores, player1Games, player2Games, playerComments} = req.body;

      // Validate required fields
      if (!winnerId || !setScores || setScores.length === 0) {
        throw new AppError('winnerId and setScores are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Parse setScores (array of strings like ["6-4", "3-6", "7-6"]) into structured format
      const tennisScores: TennisSetScore[] = setScores.map((scoreStr: string, index: number) => {
        const parts = scoreStr.split('-');
        if (parts.length !== 2) {
          throw new AppError(`Invalid score format: ${scoreStr}. Expected format: "6-4"`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
        }

        const player1Games = parseInt(parts[0], 10);
        const player2Games = parseInt(parts[1], 10);

        if (isNaN(player1Games) || isNaN(player2Games)) {
          throw new AppError(`Invalid score format: ${scoreStr}. Games must be numbers`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
        }

        return {
          setNumber: index + 1,
          player1Games,
          player2Games,
          player1TiebreakPoints: null,
          player2TiebreakPoints: null,
        };
      });

      // Validate tennis scoring rules
      const validation = this.scoreValidator.validateMatch(tennisScores, winnerId);
      if (!validation.isValid) {
        throw new AppError(
          `Invalid tennis score: ${validation.errors.join('; ')}`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
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

      // Notify opponent(s) about pending result
      if (match.participant1TeamId || match.participant2TeamId) {
        // Doubles: find which team the user belongs to and notify the other team
        const doublesTeamRepo = AppDataSource.getRepository(DoublesTeam);
        const t1 = match.participant1TeamId ? await doublesTeamRepo.findOne({where: {id: match.participant1TeamId}}) : null;
        const t2 = match.participant2TeamId ? await doublesTeamRepo.findOne({where: {id: match.participant2TeamId}}) : null;
        const submitterInTeam1 = t1 && (t1.player1Id === userId || t1.player2Id === userId);
        const opponentTeam = submitterInTeam1 ? t2 : t1;
        if (opponentTeam) {
          const submitterName = 'Your opponent';
          await this.notificationService.notifyResultEntered(id, opponentTeam.player1Id, submitterName);
          await this.notificationService.notifyResultEntered(id, opponentTeam.player2Id, submitterName);
        }
      } else {
        // Singles: notify the other participant
        const opponentId = match.participant1Id === userId ? match.participant2Id : match.participant1Id;
        const submitter = match.participant1Id === userId ? match.participant1 : match.participant2;
        const submitterName = submitter ? `${submitter.firstName} ${submitter.lastName}` : 'Your opponent';
        if (opponentId) {
          await this.notificationService.notifyResultEntered(id, opponentId, submitterName);
        }
      }

      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/matches/:id/result/confirm
   * Confirms a pending match result (FR25).
   * Called by the opponent to accept the submitted result.
   */
  public async confirmResult(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params; // match ID
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const matchRepository = AppDataSource.getRepository(Match);
      const matchResultRepository = AppDataSource.getRepository(MatchResult);

      // Fetch match to validate
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['participant1', 'participant2', 'bracket'],
      });

      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify user is a participant (singles) or team member (doubles)
      const isParticipant = await this.isUserMatchParticipant(match, userId);
      if (!isParticipant) {
        throw new AppError('Only match participants can confirm results', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }

      // Find pending result for this match
      const result = await matchResultRepository.findOne({
        where: {
          matchId: id,
          confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION,
        },
      });

      if (!result) {
        throw new AppError('No pending result found for this match', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify user is NOT the submitter (can't confirm own result)
      if (result.submittedBy === userId) {
        throw new AppError('Cannot confirm your own result', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }

      // Update result status
      result.confirmationStatus = ConfirmationStatus.CONFIRMED;
      result.confirmedBy = userId;
      result.confirmedAt = new Date();
      result.updatedAt = new Date();

      await matchResultRepository.save(result);

      // Update match status to COMPLETED and set winner
      match.status = MatchStatus.COMPLETED;
      match.score = result.setScores.join(', ');
      match.updatedAt = new Date();
      if (match.participant1TeamId || match.participant2TeamId) {
        // Doubles: the winnerId in result is a team ID
        match.winnerTeamId = result.winnerId;
        match.winnerId = null;
      } else {
        match.winnerId = result.winnerId;
      }
      await matchRepository.save(match);

      // Notify submitter that result was confirmed
      const confirmerName = 'Your opponent';
      await this.notificationService.notifyResultConfirmed(id, result.submittedBy, confirmerName);

      // Advance winner to next round if single elimination
      await this.advanceWinnerToNextRound(match, matchRepository);

      // FR39/FR40/FR43: Recalculate standings after official result confirmation
      await this.standingService.recalculateForMatch(id);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/matches/:id/result/dispute
   * Disputes a pending match result (FR26).
   * Called by the opponent if they disagree with the submitted result.
   */
  public async disputeResult(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params; // match ID
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const {disputeReason} = req.body;

      if (!disputeReason || disputeReason.trim() === '') {
        throw new AppError('Dispute reason is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
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
      const isParticipant = await this.isUserMatchParticipant(match, userId);
      if (!isParticipant) {
        throw new AppError('Only match participants can dispute results', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }

      // Find pending result for this match
      const result = await matchResultRepository.findOne({
        where: {
          matchId: id,
          confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION,
        },
      });

      if (!result) {
        throw new AppError('No pending result found for this match', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify user is NOT the submitter (can't dispute own result)
      if (result.submittedBy === userId) {
        throw new AppError('Cannot dispute your own result', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }

      // Update result status
      result.confirmationStatus = ConfirmationStatus.DISPUTED;
      result.disputeReason = disputeReason;
      result.disputedAt = new Date();
      result.updatedAt = new Date();

      await matchResultRepository.save(result);

      // Notify administrators about the dispute
      const adminUserIds = await this.notificationService.getAdminUserIds();
      const disputer = match.participant1Id === userId ? match.participant1 : match.participant2;
      const disputerName = disputer ? `${disputer.firstName} ${disputer.lastName}` : 'A participant';
      await this.notificationService.notifyResultDisputed(id, adminUserIds, disputerName, disputeReason);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/matches/disputed
   * Retrieves all disputed match results (FR27).
   * Admin only.
   */
  public async getDisputedResults(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const matchResultRepository = AppDataSource.getRepository(MatchResult);
      const matchRepository = AppDataSource.getRepository(Match);

      // Find all disputed results
      const disputedResults = await matchResultRepository.find({
        where: {
          confirmationStatus: ConfirmationStatus.DISPUTED,
        },
        order: {
          disputedAt: 'DESC',
        },
      });

      // Enrich with match details
      const enrichedResults = await Promise.all(disputedResults.map(async (result) => {
        const match = await matchRepository.findOne({
          where: {id: result.matchId},
          relations: ['participant1', 'participant2', 'bracket'],
        });

        return {
          ...result,
          match: match ? {
            id: match.id,
            matchNumber: match.matchNumber,
            round: match.round,
            bracketId: match.bracketId,
            participant1: match.participant1 ? {
              id: match.participant1.id,
              firstName: match.participant1.firstName,
              lastName: match.participant1.lastName,
              email: match.participant1.email,
            } : null,
            participant2: match.participant2 ? {
              id: match.participant2.id,
              firstName: match.participant2.firstName,
              lastName: match.participant2.lastName,
              email: match.participant2.email,
            } : null,
          } : null,
        };
      }));

      res.status(HTTP_STATUS.OK).json(enrichedResults);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/matches/:id/result/resolve
   * Resolves a disputed result by confirming or modifying it (FR27).
   * Admin only.
   */
  public async resolveDispute(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params; // match ID
      const {winnerId, setScores, resolutionNotes} = req.body;

      if (!winnerId || !setScores || setScores.length === 0) {
        throw new AppError('winnerId and setScores are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Parse setScores (array of strings like ["6-4", "3-6", "7-6"]) into structured format
      const tennisScores: TennisSetScore[] = setScores.map((scoreStr: string, index: number) => {
        const parts = scoreStr.split('-');
        if (parts.length !== 2) {
          throw new AppError(`Invalid score format: ${scoreStr}. Expected format: "6-4"`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
        }

        const player1Games = parseInt(parts[0], 10);
        const player2Games = parseInt(parts[1], 10);

        if (isNaN(player1Games) || isNaN(player2Games)) {
          throw new AppError(`Invalid score format: ${scoreStr}. Games must be numbers`, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
        }

        return {
          setNumber: index + 1,
          player1Games,
          player2Games,
          player1TiebreakPoints: null,
          player2TiebreakPoints: null,
        };
      });

      // Validate tennis scoring rules
      const validation = this.scoreValidator.validateMatch(tennisScores, winnerId);
      if (!validation.isValid) {
        throw new AppError(
          `Invalid tennis score: ${validation.errors.join('; ')}`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      const matchRepository = AppDataSource.getRepository(Match);
      const matchResultRepository = AppDataSource.getRepository(MatchResult);

      // Fetch match
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['participant1', 'participant2', 'bracket'],
      });

      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Find disputed result
      const result = await matchResultRepository.findOne({
        where: {
          matchId: id,
          confirmationStatus: ConfirmationStatus.DISPUTED,
        },
      });

      if (!result) {
        throw new AppError('No disputed result found for this match', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Update result with admin resolution
      result.winnerId = winnerId;
      result.setScores = setScores;
      result.confirmationStatus = ConfirmationStatus.CONFIRMED;
      result.isAdminEntry = true;
      result.playerComments = resolutionNotes ? `ADMIN RESOLUTION: ${resolutionNotes}` : result.playerComments;
      result.updatedAt = new Date();

      await matchResultRepository.save(result);

      // Update match status to COMPLETED
      match.status = MatchStatus.COMPLETED;
      match.winnerId = winnerId;
      match.score = setScores.join(', '); // Format setScores as comma-separated string
      match.endTime = new Date();
      match.updatedAt = new Date();

      await matchRepository.save(match);

      // Advance winner to next round if single elimination
      await this.advanceWinnerToNextRound(match, matchRepository);

      // Notify both participants that the dispute has been resolved
      const winnerUser = await AppDataSource.getRepository(User).findOne({where: {id: winnerId}});
      const winnerName = winnerUser ? `${winnerUser.firstName} ${winnerUser.lastName}` : 'Unknown';
      await this.notificationService.notifyDisputeResolved(
        id,
        match.participant1Id,
        match.participant2Id,
        winnerName,
        resolutionNotes,
      );

      // FR39/FR40/FR43: Recalculate standings after admin dispute resolution
      await this.standingService.recalculateForMatch(id);

      res.status(HTTP_STATUS.OK).json({
        result,
        match,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/matches/:id/result/annul
   * Annuls a disputed result (FR27).
   * Admin only.
   */
  public async annulResult(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params; // match ID
      const {annulReason} = req.body;

      if (!annulReason || annulReason.trim() === '') {
        throw new AppError('Annul reason is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const matchRepository = AppDataSource.getRepository(Match);
      const matchResultRepository = AppDataSource.getRepository(MatchResult);

      // Fetch match
      const match = await matchRepository.findOne({
        where: {id},
      });

      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Find disputed result
      const result = await matchResultRepository.findOne({
        where: {
          matchId: id,
          confirmationStatus: ConfirmationStatus.DISPUTED,
        },
      });

      if (!result) {
        throw new AppError('No disputed result found for this match', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Update result to ANNULLED
      result.confirmationStatus = ConfirmationStatus.ANNULLED;
      result.playerComments = annulReason;
      result.updatedAt = new Date();

      await matchResultRepository.save(result);

      // Reset match to SCHEDULED
      match.status = MatchStatus.SCHEDULED;
      match.winnerId = null;
      match.endTime = null;
      match.updatedAt = new Date();

      await matchRepository.save(match);

      // Notify both participants that the result was annulled and match is reset
      await this.notificationService.notifyDisputeResolved(
        id,
        match.participant1Id,
        match.participant2Id,
        'N/A (match annulled)',
        `Result annulled: ${annulReason}`,
      );

      res.status(HTTP_STATUS.OK).json({
        result,
        match,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/matches/:id/suspend
   * Suspends an in-progress match with a reason.
   * 
   * @param req - Express request with match ID in params and suspensionReason in body
   * @param res - Express response
   * @param next - Express next function
   */
  public async suspendMatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {suspensionReason} = req.body;

      if (!suspensionReason || suspensionReason.trim().length === 0) {
        throw new AppError('Suspension reason is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }

      const matchRepository = AppDataSource.getRepository(Match);
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['bracket', 'participant1', 'participant2'],
      });

      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Validate match can be suspended
      if (match.status !== MatchStatus.IN_PROGRESS) {
        throw new AppError(
          `Cannot suspend match in status ${match.status}. Match must be IN_PROGRESS.`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // Update match status to SUSPENDED
      match.status = MatchStatus.SUSPENDED;
      match.suspensionReason = suspensionReason.trim();
      match.updatedAt = new Date();

      await matchRepository.save(match);

      // Notify both participants about the suspension
      await this.notificationService.notifyMatchSuspended(
        id,
        match.participant1Id,
        match.participant2Id,
        suspensionReason.trim(),
      );

      res.status(HTTP_STATUS.OK).json(match);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/matches/:id/resume
   * Resumes a suspended match, transitioning it back to IN_PROGRESS.
   * Optionally accepts new scheduled date/time to reschedule the match.
   * 
   * @param req - Express request with match ID in params and optional scheduledTime in body
   * @param res - Express response
   * @param next - Express next function
   */
  public async resumeMatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {scheduledTime} = req.body;

      const matchRepository = AppDataSource.getRepository(Match);
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['bracket', 'participant1', 'participant2'],
      });

      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Validate match can be resumed
      if (match.status !== MatchStatus.SUSPENDED) {
        throw new AppError(
          `Cannot resume match in status ${match.status}. Match must be SUSPENDED.`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // Update match status back to IN_PROGRESS
      match.status = MatchStatus.IN_PROGRESS;
      
      // Update scheduled time if provided
      if (scheduledTime) {
        match.scheduledTime = new Date(scheduledTime);
      }
      
      // Keep suspension reason for historical record
      match.updatedAt = new Date();

      await matchRepository.save(match);

      // Notify both participants about the resumption
      await this.notificationService.notifyMatchResumed(
        id,
        match.participant1Id,
        match.participant2Id,
        scheduledTime ? new Date(scheduledTime) : undefined,
      );

      res.status(HTTP_STATUS.OK).json(match);
    } catch (error) {
      next(error);
    }
  }
}

