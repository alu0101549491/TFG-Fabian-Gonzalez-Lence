/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 10, 2026
 * @file presentation/controllers/phase.controller.ts
 * @desc Phase controller handling bracket phases and multi-phase tournament linking.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Bracket} from '../../domain/entities/bracket.entity';
import {Phase} from '../../domain/entities/phase.entity';
import {Match} from '../../domain/entities/match.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {Standing} from '../../domain/entities/standing.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {AcceptanceType} from '../../domain/enumerations/acceptance-type';
import {RegistrationStatus} from '../../domain/enumerations/registration-status';
import {MatchStatus} from '../../domain/enumerations/match-status';
import {generateId} from '../../shared/utils/id-generator';

/**
 * Controller for phase management and multi-phase tournament operations.
 *
 * Handles:
 * - Phase listing
 * - Phase linking (qualifying → main → consolation)
 * - Qualifier advancement
 * - Consolation draw creation
 * - Lucky Loser promotion
 */
export class PhaseController {
  /**
   * Get all phases for a bracket.
   *
   * @route GET /api/phases?bracketId=xxx
   */
  public async getByBracket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {bracketId} = req.query;
      
      if (!bracketId) {
        throw new AppError('bracketId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const phaseRepository = AppDataSource.getRepository(Phase);
      const phases = await phaseRepository.find({
        where: {bracketId: bracketId as string},
        order: {order: 'ASC'},
      });
      
      res.status(HTTP_STATUS.OK).json(phases);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Link two phases in sequence (source → target).
   *
   * @route POST /api/phases/link
   * @access TOURNAMENT_ADMIN, SYSTEM_ADMIN
   */
  public async linkPhases(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {sourcePhaseId, targetPhaseId} = req.body;

      // Validate input
      if (!sourcePhaseId || !targetPhaseId) {
        throw new AppError('Source and target phase IDs are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      if (sourcePhaseId === targetPhaseId) {
        throw new AppError('Cannot link a phase to itself', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const phaseRepository = AppDataSource.getRepository(Phase);

      // Fetch both phases
      const sourcePhase = await phaseRepository.findOne({where: {id: sourcePhaseId}});
      if (!sourcePhase) {
        throw new AppError(`Source phase not found: ${sourcePhaseId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      const targetPhase = await phaseRepository.findOne({where: {id: targetPhaseId}});
      if (!targetPhase) {
        throw new AppError(`Target phase not found: ${targetPhaseId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Validate phases have tournamentId (might be null for legacy data)
      if (!sourcePhase.tournamentId || !targetPhase.tournamentId) {
        throw new AppError('Both phases must have tournamentId. Run migration script to populate legacy data.', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const isSameTournament = sourcePhase.tournamentId === targetPhase.tournamentId;

      // For phases in the same tournament, enforce forward-only progression.
      if (isSameTournament && targetPhase.sequenceOrder <= sourcePhase.sequenceOrder) {
        throw new AppError('Target phase must have a higher sequence order than source phase', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Check for cycles
      await this.validateNoCycle(phaseRepository, targetPhaseId, sourcePhaseId);

      // Update source phase with nextPhaseId
      sourcePhase.nextPhaseId = targetPhaseId;
      await phaseRepository.save(sourcePhase);

      res.status(HTTP_STATUS.OK).json({
        message: 'Phases linked successfully',
        sourcePhase,
        targetPhase,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Advance top qualifiers from Round Robin to next phase.
   *
   * @route POST /api/phases/advance-qualifiers
   * @access TOURNAMENT_ADMIN, SYSTEM_ADMIN
   */
  public async advanceQualifiers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {sourcePhaseId, targetPhaseId, qualifierCount, tournamentId, categoryId} = req.body;

      // Validate input
      if (!sourcePhaseId || !targetPhaseId || !qualifierCount) {
        throw new AppError('Required fields: sourcePhaseId, targetPhaseId, qualifierCount', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      if (qualifierCount <= 0) {
        throw new AppError('Qualifier count must be a positive number', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const bracketRepository = AppDataSource.getRepository(Bracket);
      const phaseRepository = AppDataSource.getRepository(Phase);
      const matchRepository = AppDataSource.getRepository(Match);
      const standingRepository = AppDataSource.getRepository(Standing);
      const registrationRepository = AppDataSource.getRepository(Registration);

      // Fetch source phase
      const sourcePhase = await phaseRepository.findOne({where: {id: sourcePhaseId}});
      if (!sourcePhase) {
        throw new AppError(`Source phase not found: ${sourcePhaseId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      const targetPhase = await phaseRepository.findOne({where: {id: targetPhaseId}});
      if (!targetPhase) {
        throw new AppError(`Target phase not found: ${targetPhaseId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      const sourceBracket = await bracketRepository.findOne({where: {id: sourcePhase.bracketId}});
      if (!sourceBracket) {
        throw new AppError(`Source bracket not found: ${sourcePhase.bracketId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      const targetBracket = await bracketRepository.findOne({where: {id: targetPhase.bracketId}});
      if (!targetBracket) {
        throw new AppError(`Target bracket not found: ${targetPhase.bracketId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      const sourceTournamentId = sourcePhase.tournamentId;
      const sourceCategoryId = sourceBracket.categoryId;
      const targetTournamentId = tournamentId || targetPhase.tournamentId;
      const targetCategoryId = categoryId || targetBracket.categoryId;

      if (!sourceTournamentId || !sourceCategoryId || !targetTournamentId || !targetCategoryId) {
        throw new AppError('Unable to resolve source/target tournament and category context for qualifier advancement', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      if (tournamentId && tournamentId !== targetPhase.tournamentId) {
        throw new AppError('Provided tournamentId does not match target phase tournament', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      if (categoryId && categoryId !== targetBracket.categoryId) {
        throw new AppError('Provided categoryId does not match target phase bracket category', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Verify phase is completed. Some flows complete all matches but leave the phase flag stale.
      let isPhaseCompleted = sourcePhase.isCompleted;
      if (!isPhaseCompleted) {
        const phaseMatches = await matchRepository.find({where: {phaseId: sourcePhaseId}});

        if (phaseMatches.length > 0) {
          const terminalStatuses = new Set<MatchStatus>([
            MatchStatus.COMPLETED,
            MatchStatus.WALKOVER,
            MatchStatus.DEFAULT,
            MatchStatus.BYE,
            MatchStatus.RETIRED,
            MatchStatus.DEAD_RUBBER,
          ]);

          isPhaseCompleted = phaseMatches.every(match => terminalStatuses.has(match.status));

          // Persist completion state so subsequent operations are consistent.
          if (isPhaseCompleted) {
            sourcePhase.isCompleted = true;
            await phaseRepository.save(sourcePhase);
          }
        }
      }

      if (!isPhaseCompleted) {
        throw new AppError('Source phase must be completed before advancing qualifiers', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Fetch standings for source phase
      const standings = await standingRepository.find({
        where: {
          tournamentId: sourceTournamentId,
          categoryId: sourceCategoryId,
        },
        order: {rank: 'ASC'},
      });

      let rankedCandidateIds: string[] = [];

      if (standings.length > 0) {
        rankedCandidateIds = standings.map(standing => standing.participantId);
      } else {
        // Fallback: derive ranking from completed source bracket matches when standings are missing.
        // Use bracketId instead of phaseId because Round Robin matches are spread across multiple phases.
        const sourceBracket = await bracketRepository.findOne({
          where: {id: sourcePhase.bracketId},
        });

        if (!sourceBracket) {
          throw new AppError('Source bracket not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
        }

        const bracketMatches = await matchRepository.find({where: {bracketId: sourceBracket.id}});
        const terminalStatuses = new Set<MatchStatus>([
          MatchStatus.COMPLETED,
          MatchStatus.WALKOVER,
          MatchStatus.DEFAULT,
          MatchStatus.BYE,
          MatchStatus.RETIRED,
          MatchStatus.DEAD_RUBBER,
        ]);

        const stats = new Map<string, {wins: number; losses: number; played: number}>();
        const touch = (participantId: string): void => {
          if (!stats.has(participantId)) {
            stats.set(participantId, {wins: 0, losses: 0, played: 0});
          }
        };

        for (const match of bracketMatches) {
          if (match.participant1Id) {
            touch(match.participant1Id);
          }
          if (match.participant2Id) {
            touch(match.participant2Id);
          }

          if (!terminalStatuses.has(match.status) || !match.winnerId) {
            continue;
          }

          const winnerStats = stats.get(match.winnerId);
          if (winnerStats) {
            winnerStats.wins += 1;
            winnerStats.played += 1;
          }

          const loserId = match.participant1Id === match.winnerId ? match.participant2Id : match.participant1Id;
          if (loserId) {
            const loserStats = stats.get(loserId);
            if (loserStats) {
              loserStats.losses += 1;
              loserStats.played += 1;
            }
          }
        }

        rankedCandidateIds = Array.from(stats.entries())
          .sort((a, b) => {
            const winsDiff = b[1].wins - a[1].wins;
            if (winsDiff !== 0) {
              return winsDiff;
            }

            const lossesDiff = a[1].losses - b[1].losses;
            if (lossesDiff !== 0) {
              return lossesDiff;
            }

            const playedDiff = b[1].played - a[1].played;
            if (playedDiff !== 0) {
              return playedDiff;
            }

            return a[0].localeCompare(b[0]);
          })
          .map(([participantId]) => participantId);

        // If still empty, fallback to accepted source registrations as last resort.
        if (rankedCandidateIds.length === 0) {
          const sourceRegistrations = await registrationRepository.find({
            where: {
              tournamentId: sourceTournamentId,
              categoryId: sourceCategoryId,
              status: RegistrationStatus.ACCEPTED,
            },
          });

          rankedCandidateIds = sourceRegistrations
            .filter(registration => registration.acceptanceType !== AcceptanceType.ALTERNATE && registration.acceptanceType !== AcceptanceType.WITHDRAWN)
            .sort((a, b) => {
              const seedA = a.seedNumber ?? Number.MAX_SAFE_INTEGER;
              const seedB = b.seedNumber ?? Number.MAX_SAFE_INTEGER;
              if (seedA !== seedB) {
                return seedA - seedB;
              }
              return a.registrationDate.getTime() - b.registrationDate.getTime();
            })
            .map(registration => registration.participantId);
        }
      }

      rankedCandidateIds = rankedCandidateIds.filter((participantId, index, self) => self.indexOf(participantId) === index);

      const existingTargetRegistrations = await registrationRepository.find({
        where: {
          tournamentId: targetTournamentId,
          categoryId: targetCategoryId,
          status: RegistrationStatus.ACCEPTED,
        },
      });
      const existingTargetParticipants = new Set(existingTargetRegistrations.map(registration => registration.participantId));

      const qualifiedParticipantIds = rankedCandidateIds.filter(participantId => !existingTargetParticipants.has(participantId)).slice(0, qualifierCount);

      if (qualifiedParticipantIds.length < qualifierCount) {
        throw new AppError(
          `Not enough standings (${standings.length}) to advance ${qualifierCount} qualifiers`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Determine starting seed number for qualifiers (after direct acceptances)
      const directAcceptances = existingTargetRegistrations.filter(
        r => r.acceptanceType === AcceptanceType.DIRECT_ACCEPTANCE && r.seedNumber !== null
      );
      const highestSeed = directAcceptances.length > 0
        ? Math.max(...directAcceptances.map(r => r.seedNumber!))
        : 0;
      let nextSeedNumber = highestSeed + 1;

      // Create registrations in target phase
      const createdRegistrations: Registration[] = [];

      for (const participantId of qualifiedParticipantIds) {
        const registration = registrationRepository.create({
          id: generateId('reg'),
          participantId,
          tournamentId: targetTournamentId,
          categoryId: targetCategoryId,
          status: RegistrationStatus.ACCEPTED,
          acceptanceType: AcceptanceType.QUALIFIER,
          seedNumber: nextSeedNumber++,
          registrationDate: new Date(),
        });

        const saved = await registrationRepository.save(registration);
        createdRegistrations.push(saved);
      }

      // Link phases if not already linked
      if (sourcePhase.nextPhaseId !== targetPhaseId) {
        sourcePhase.nextPhaseId = targetPhaseId;
        await phaseRepository.save(sourcePhase);
      }

      res.status(HTTP_STATUS.CREATED).json({
        message: `Successfully advanced ${qualifierCount} qualifiers`,
        qualifiedParticipants: qualifiedParticipantIds,
        registrations: createdRegistrations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create consolation draw for eliminated participants.
   *
   * @route POST /api/phases/consolation
   * @access TOURNAMENT_ADMIN, SYSTEM_ADMIN
   */
  public async createConsolationDraw(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {mainPhaseId, tournamentId, categoryId} = req.body;

      // Validate input
      if (!mainPhaseId || !tournamentId || !categoryId) {
        throw new AppError('mainPhaseId, tournamentId, and categoryId are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const phaseRepository = AppDataSource.getRepository(Phase);

      // Fetch main phase
      const mainPhase = await phaseRepository.findOne({where: {id: mainPhaseId}});
      if (!mainPhase) {
        throw new AppError(`Main phase not found: ${mainPhaseId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Create consolation phase
      const consolationPhaseId = generateId('phs');
      const consolationPhase = phaseRepository.create({
        id: consolationPhaseId,
        tournamentId,
        bracketId: mainPhase.bracketId, // Same bracket for now
        name: `${mainPhase.name} - Consolation`,
        sequenceOrder: mainPhase.sequenceOrder + 100, // Offset to indicate parallel structure
        order: mainPhase.order + 100,
        matchCount: 0, // Will be calculated when bracket is generated
        nextPhaseId: null,
        isCompleted: false,
      });

      await phaseRepository.save(consolationPhase);

      // Link main phase to consolation
      mainPhase.nextPhaseId = consolationPhaseId;
      await phaseRepository.save(mainPhase);

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Consolation draw created successfully',
        consolationPhase,
        note: 'Losers from the main phase can now be added to this consolation bracket',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Promote alternate to Lucky Loser when participant withdraws.
   *
   * @route POST /api/phases/promote-lucky-loser
   * @access TOURNAMENT_ADMIN, SYSTEM_ADMIN
   */
  public async promoteLuckyLoser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {withdrawnParticipantId, phaseId, tournamentId, categoryId} = req.body;

      // Validate input
      if (!withdrawnParticipantId || !phaseId || !tournamentId || !categoryId) {
        throw new AppError('All fields are required: withdrawnParticipantId, phaseId, tournamentId, categoryId', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const registrationRepository = AppDataSource.getRepository(Registration);

      // Find withdrawn participant's registration
      const allRegistrations = await registrationRepository.find({
        where: {tournamentId},
      });

      const withdrawnRegistration = allRegistrations.find(
        r => r.participantId === withdrawnParticipantId && r.categoryId === categoryId
      );

      if (!withdrawnRegistration) {
        throw new AppError(`Registration not found for participant: ${withdrawnParticipantId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Update withdrawn participant's acceptance type
      withdrawnRegistration.acceptanceType = AcceptanceType.WITHDRAWN;
      await registrationRepository.save(withdrawnRegistration);

      // Find first ALTERNATE in waiting list
      const alternates = allRegistrations
        .filter(r => r.categoryId === categoryId && r.acceptanceType === AcceptanceType.ALTERNATE)
        .sort((a, b) => a.registrationDate.getTime() - b.registrationDate.getTime());

      if (alternates.length === 0) {
        res.status(HTTP_STATUS.OK).json({
          message: 'Participant withdrawn, but no alternates available',
          withdrawnParticipantId,
          promotedParticipantId: null,
        });
        return;
      }

      const firstAlternate = alternates[0];

      // Promote alternate to Lucky Loser
      firstAlternate.acceptanceType = AcceptanceType.LUCKY_LOSER;
      await registrationRepository.save(firstAlternate);

      res.status(HTTP_STATUS.OK).json({
        message: 'Lucky Loser promoted successfully',
        withdrawnParticipantId,
        promotedParticipantId: firstAlternate.participantId,
        registration: firstAlternate,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validates that linking phases doesn't create a cycle.
   *
   * @param repository - Phase repository
   * @param startPhaseId - Phase to start traversal
   * @param targetPhaseId - Phase that should not be reachable
   * @throws AppError if a cycle is detected
   */
  private async validateNoCycle(
    repository: any,
    startPhaseId: string,
    targetPhaseId: string
  ): Promise<void> {
    const visited = new Set<string>();
    let currentPhaseId: string | null = startPhaseId;

    while (currentPhaseId && !visited.has(currentPhaseId)) {
      if (currentPhaseId === targetPhaseId) {
        throw new AppError('Phase linking would create a cycle', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      visited.add(currentPhaseId);

      const phase: Phase | null = await repository.findOne({where: {id: currentPhaseId}});
      currentPhaseId = phase?.nextPhaseId ?? null;
    }
  }
}
