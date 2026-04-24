/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 10, 2026
 * @file backend/src/presentation/controllers/phase.controller.ts
 * @desc Phase controller handling bracket phases and multi-phase tournament linking.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Bracket} from '../../domain/entities/bracket.entity';
import {Category} from '../../domain/entities/category.entity';
import {Phase} from '../../domain/entities/phase.entity';
import {Match} from '../../domain/entities/match.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {Standing} from '../../domain/entities/standing.entity';
import {Tournament} from '../../domain/entities/tournament.entity';
import {DoublesTeam} from '../../domain/entities/doubles-team.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {AcceptanceType} from '../../domain/enumerations/acceptance-type';
import {RegistrationStatus} from '../../domain/enumerations/registration-status';
import {MatchStatus} from '../../domain/enumerations/match-status';
import {TournamentType} from '../../domain/enumerations/tournament-type';
import {BracketType} from '../../domain/enumerations/bracket-type';
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

      // Fetch tournaments to validate tournament type compatibility
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      const sourceTournament = await tournamentRepository.findOne({where: {id: sourcePhase.tournamentId}});
      const targetTournament = await tournamentRepository.findOne({where: {id: targetPhase.tournamentId}});

      if (!sourceTournament || !targetTournament) {
        throw new AppError('Source or target tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Validate tournament type compatibility: doubles can only link to doubles, singles to singles
      if (sourceTournament.tournamentType !== targetTournament.tournamentType) {
        const sourceType = sourceTournament.tournamentType === TournamentType.DOUBLES ? 'doubles' : 'singles';
        const targetType = targetTournament.tournamentType === TournamentType.DOUBLES ? 'doubles' : 'singles';
        throw new AppError(
          `Cannot link ${sourceType} tournament phase to ${targetType} tournament phase. Tournament types must match.`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
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

      // Fetch source tournament to determine if it's doubles
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      const sourceTournament = await tournamentRepository.findOne({where: {id: sourceTournamentId}});
      if (!sourceTournament) {
        throw new AppError('Source tournament not found', HTTP_STATUS.NOT_FOUND,ERROR_CODES.NOT_FOUND);
      }

      const isDoubles = sourceTournament.tournamentType === TournamentType.DOUBLES;

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
        // For doubles: use teamId from standings; for singles: use participantId
        rankedCandidateIds = standings.map(standing => 
          isDoubles ? standing.teamId : standing.participantId
        ).filter((id): id is string => id !== null);
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
      const doublesTeamRepository = AppDataSource.getRepository(DoublesTeam);

      if (isDoubles) {
        // For doubles: create registrations for BOTH players in each team
        for (const teamId of qualifiedParticipantIds) {
          // Fetch the doubles team
          const team = await doublesTeamRepository.findOne({where: {id: teamId}});
          if (!team) {
            console.warn(`Doubles team not found: ${teamId}, skipping`);
            continue;
          }

          const currentSeed = nextSeedNumber++;

          // Create registration for player 1
          const reg1 = registrationRepository.create({
            id: generateId('reg'),
            participantId: team.player1Id,
            partnerId: team.player2Id,
            tournamentId: targetTournamentId,
            categoryId: targetCategoryId,
            status: RegistrationStatus.ACCEPTED,
            acceptanceType: AcceptanceType.QUALIFIER,
            seedNumber: currentSeed,
            registrationDate: new Date(),
          });

          // Create registration for player 2
          const reg2 = registrationRepository.create({
            id: generateId('reg'),
            participantId: team.player2Id,
            partnerId: team.player1Id,
            tournamentId: targetTournamentId,
            categoryId: targetCategoryId,
            status: RegistrationStatus.ACCEPTED,
            acceptanceType: AcceptanceType.QUALIFIER,
            seedNumber: currentSeed,
            registrationDate: new Date(),
          });

          const saved1 = await registrationRepository.save(reg1);
          const saved2 = await registrationRepository.save(reg2);
          createdRegistrations.push(saved1, saved2);
        }
      } else {
        // For singles: create one registration per participant
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
        phaseType: 'CONSOLATION', // Auto-generated consolation phase - protected from deletion
        isAutoGenerated: true,
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
   * Populate consolation draw with losers from main phase and generate matches.
   *
   * @route POST /api/phases/populate-consolation
   * @access TOURNAMENT_ADMIN, SYSTEM_ADMIN
   */
  public async populateConsolationDraw(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {consolationPhaseId, tournamentId, categoryId} = req.body;

      // Validate input
      if (!consolationPhaseId || !tournamentId || !categoryId) {
        throw new AppError('consolationPhaseId, tournamentId, and categoryId are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const phaseRepository = AppDataSource.getRepository(Phase);
      const matchRepository = AppDataSource.getRepository(Match);
      const registrationRepository = AppDataSource.getRepository(Registration);

      // Remove previously generated matches for this consolation phase to keep the operation idempotent.
      await matchRepository.delete({phaseId: consolationPhaseId});

      // Fetch consolation phase
      const consolationPhase = await phaseRepository.findOne({where: {id: consolationPhaseId}});
      if (!consolationPhase) {
        throw new AppError(`Consolation phase not found: ${consolationPhaseId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Find the main phase that links to this consolation phase
      const mainPhase = await phaseRepository.findOne({where: {nextPhaseId: consolationPhaseId}});
      if (!mainPhase) {
        throw new AppError('No main phase linked to this consolation phase', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Get all completed matches from the main phase's round
      const mainPhaseMatches = await matchRepository.find({
        where: {
          bracketId: mainPhase.bracketId,
          round: mainPhase.order,
        },
      });

      // Filter to completed matches only
      const completedMatches = mainPhaseMatches.filter(m => m.status === MatchStatus.COMPLETED && m.winnerId);

      if (completedMatches.length === 0) {
        throw new AppError('No completed matches found in main phase. Complete matches before populating consolation draw.', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Extract losers (participants who didn't win)
      const losers: string[] = [];
      for (const match of completedMatches) {
        const loser = match.participant1Id === match.winnerId ? match.participant2Id : match.participant1Id;
        if (loser) {
          losers.push(loser);
        }
      }

      if (losers.length === 0) {
        throw new AppError('No losers found in completed matches', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Create registrations for losers in consolation draw
      const createdRegistrations: Registration[] = [];
      for (const loserId of losers) {
        // Check if registration already exists
        const existing = await registrationRepository.findOne({
          where: {
            participantId: loserId,
            tournamentId,
            categoryId,
          },
        });

        if (existing) {
          // Update existing registration to mark as consolation participant
          existing.acceptanceType = AcceptanceType.DIRECT_ACCEPTANCE; // They're directly entered into consolation
          existing.status = RegistrationStatus.ACCEPTED;
          await registrationRepository.save(existing);
          createdRegistrations.push(existing);
        } else {
          // This shouldn't happen (they were already registered) but handle it
          const newReg = registrationRepository.create({
            id: generateId('reg'),
            tournamentId,
            categoryId,
            participantId: loserId,
            seedNumber: null,
            acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
            status: RegistrationStatus.ACCEPTED,
            registrationDate: new Date(),
          });
          await registrationRepository.save(newReg);
          createdRegistrations.push(newReg);
        }
      }

      // Generate consolation bracket matches
      const bracketSize = losers.length;
      const rounds = Math.ceil(Math.log2(bracketSize));
      let totalMatches = 0;
      const createdMatches: Match[] = [];

      // Calculate total matches for single elimination
      for (let r = 1; r <= rounds; r++) {
        totalMatches += Math.pow(2, rounds - r);
      }

      // Create first round matches with losers
      const firstRoundMatchCount = Math.pow(2, rounds - 1);
      let matchNumber = 1;
      
      for (let i = 0; i < firstRoundMatchCount; i++) {
        const participant1 = losers[i * 2];
        const participant2 = losers[i * 2 + 1];

        const match = matchRepository.create({
          bracketId: consolationPhase.bracketId,
          phaseId: consolationPhaseId,
          round: consolationPhase.order,
          matchNumber,
          participant1Id: participant1 || null,
          participant2Id: participant2 || null,
          winnerId: null,
          status: (participant1 && participant2) ? MatchStatus.SCHEDULED : MatchStatus.BYE,
          score: null,
          scheduledTime: null,
          endTime: null,
        });

        match.id = generateId('mtc');
        await matchRepository.save(match);
        createdMatches.push(match);
        matchNumber++;
      }

      // Create subsequent round placeholders
      for (let r = 2; r <= rounds; r++) {
        const roundMatchCount = Math.pow(2, rounds - r);
        for (let i = 0; i < roundMatchCount; i++) {
          const match = matchRepository.create({
            bracketId: consolationPhase.bracketId,
            phaseId: consolationPhaseId,
            round: consolationPhase.order + r - 1,
            matchNumber,
            participant1Id: null,
            participant2Id: null,
            winnerId: null,
            status: MatchStatus.NOT_SCHEDULED,
            score: null,
            scheduledTime: null,
            endTime: null,
          });

          match.id = generateId('mtc');
          await matchRepository.save(match);
          createdMatches.push(match);
          matchNumber++;
        }
      }

      // Update consolation phase match count
      consolationPhase.matchCount = createdMatches.length;
      await phaseRepository.save(consolationPhase);

      res.status(HTTP_STATUS.OK).json({
        message: 'Consolation draw populated successfully',
        losersCount: losers.length,
        matchesCreated: createdMatches.length,
        consolationPhase,
        losers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Promote alternate to Lucky Loser when participant withdraws.
   * For doubles tournaments, withdraws both team members and promotes an alternate team.
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
      const tournamentRepository = AppDataSource.getRepository(Tournament);

      // Fetch tournament to check if it's doubles
      const tournament = await tournamentRepository.findOne({where: {id: tournamentId}});
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      const isDoubles = tournament.tournamentType === TournamentType.DOUBLES;

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

      if (isDoubles) {
        // For doubles: withdraw BOTH team members
        const partnerId = withdrawnRegistration.partnerId;
        if (!partnerId) {
          throw new AppError('Doubles registration must have a partner', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
        }

        // Withdraw player 1
        withdrawnRegistration.status = RegistrationStatus.WITHDRAWN;
        withdrawnRegistration.acceptanceType = AcceptanceType.WITHDRAWN;
        await registrationRepository.save(withdrawnRegistration);

        // Withdraw player 2 (partner)
        const partnerRegistration = allRegistrations.find(
          r => r.participantId === partnerId && r.categoryId === categoryId
        );
        if (partnerRegistration) {
          partnerRegistration.status = RegistrationStatus.WITHDRAWN;
          partnerRegistration.acceptanceType = AcceptanceType.WITHDRAWN;
          await registrationRepository.save(partnerRegistration);
        }

        // Find first ALTERNATE TEAM in waiting list (both players must be alternates)
        const alternates = allRegistrations
          .filter(r => r.categoryId === categoryId && r.acceptanceType === AcceptanceType.ALTERNATE)
          .sort((a, b) => a.registrationDate.getTime() - b.registrationDate.getTime());

        if (alternates.length < 2) {
          res.status(HTTP_STATUS.OK).json({
            message: 'Team withdrawn, but no complete alternate teams available',
            withdrawnParticipantId,
            promotedParticipantId: null,
          });
          return;
        }

        // Find the first complete alternate team (player with partner)
        let firstAlternateTeam: {player1: Registration; player2: Registration} | null = null;
        for (const alt of alternates) {
          if (alt.partnerId) {
            const partner = alternates.find(a => a.participantId === alt.partnerId && a.categoryId === categoryId);
            if (partner) {
              firstAlternateTeam = {player1: alt, player2: partner};
              break;
            }
          }
        }

        if (!firstAlternateTeam) {
          res.status(HTTP_STATUS.OK).json({
            message: 'Team withdrawn, but no complete alternate teams available',
            withdrawnParticipantId,
            promotedParticipantId: null,
          });
          return;
        }

        // Promote both players to Lucky Loser
        firstAlternateTeam.player1.acceptanceType = AcceptanceType.LUCKY_LOSER;
        firstAlternateTeam.player1.status = RegistrationStatus.ACCEPTED;
        await registrationRepository.save(firstAlternateTeam.player1);

        firstAlternateTeam.player2.acceptanceType = AcceptanceType.LUCKY_LOSER;
        firstAlternateTeam.player2.status = RegistrationStatus.ACCEPTED;
        await registrationRepository.save(firstAlternateTeam.player2);

        res.status(HTTP_STATUS.OK).json({
          message: 'Doubles team Lucky Loser promoted successfully',
          withdrawnParticipantId,
          promotedParticipantId: firstAlternateTeam.player1.participantId,
          promotedTeamIds: [firstAlternateTeam.player1.participantId, firstAlternateTeam.player2.participantId],
        });
      } else {
        // For singles: withdraw individual player
        withdrawnRegistration.status = RegistrationStatus.WITHDRAWN;
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

        // Promote alternate to Lucky Loser — set both acceptanceType AND status
        firstAlternate.acceptanceType = AcceptanceType.LUCKY_LOSER;
        firstAlternate.status = RegistrationStatus.ACCEPTED;
        await registrationRepository.save(firstAlternate);

        res.status(HTTP_STATUS.OK).json({
          message: 'Lucky Loser promoted successfully',
          withdrawnParticipantId,
          promotedParticipantId: firstAlternate.participantId,
          registration: firstAlternate,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new tournament phase with an associated bracket.
   *
   * Creates an empty bracket and a first phase within it, ready to receive
   * participants and generate matches. Use this to set up qualifying rounds,
   * additional main draws, or custom phases not covered by the consolation workflow.
   *
   * @route POST /api/phases/create
   * @access TOURNAMENT_ADMIN, SYSTEM_ADMIN
   */
  public async createPhase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId, categoryId, phaseName, phaseType, bracketType} = req.body;

      // DEBUG: Log incoming request data
      console.log('🔍 CREATE PHASE REQUEST:', {
        tournamentId,
        categoryId,
        phaseName,
        phaseType,
        bracketType,
      });

      // Validate required fields
      if (!tournamentId || !categoryId || !phaseName) {
        throw new AppError(
          'tournamentId, categoryId, and phaseName are required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      const allowedPhaseTypes = ['QUALIFYING', 'MAIN', 'CONSOLATION', 'CUSTOM'];
      if (phaseType && !allowedPhaseTypes.includes(phaseType)) {
        throw new AppError(
          `Invalid phaseType. Must be one of: ${allowedPhaseTypes.join(', ')}`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      const allowedBracketTypes = [BracketType.SINGLE_ELIMINATION, BracketType.ROUND_ROBIN, BracketType.MATCH_PLAY];
      const resolvedBracketType: BracketType = allowedBracketTypes.includes(bracketType)
        ? bracketType
        : BracketType.SINGLE_ELIMINATION;

      const tournamentRepository = AppDataSource.getRepository(Tournament);
      const tournament = await tournamentRepository.findOne({where: {id: tournamentId}});
      if (!tournament) {
        throw new AppError(`Tournament not found: ${tournamentId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      const bracketRepository = AppDataSource.getRepository(Bracket);
      const phaseRepository = AppDataSource.getRepository(Phase);
      const categoryRepository = AppDataSource.getRepository(Category);

      // If creating a QUALIFYING phase, automatically create a separate qualifying category
      let effectiveCategoryId = categoryId;
      console.log(`🔍 Checking phaseType: "${phaseType}" (type: ${typeof phaseType}), equals 'QUALIFYING'? ${phaseType === 'QUALIFYING'}`);
      
      if (phaseType === 'QUALIFYING') {
        console.log('✅ QUALIFYING phase detected - starting auto-category creation...');
        // Get the source category to derive qualifying category properties
        const sourceCategory = await categoryRepository.findOne({where: {id: categoryId}});
        if (!sourceCategory) {
          throw new AppError(`Source category not found: ${categoryId}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
        }

        // Check if qualifying category already exists for this tournament
        const qualifyingCategoryName = `${sourceCategory.name} - Qualifying`;
        console.log(`🔍 Looking for existing qualifying category: "${qualifyingCategoryName}"`);
        const existingQualifyingCategory = await categoryRepository.findOne({
          where: {
            tournamentId,
            name: qualifyingCategoryName,
          },
        });

        if (existingQualifyingCategory) {
          // Use existing qualifying category
          effectiveCategoryId = existingQualifyingCategory.id;
          console.log(`✅ Using existing qualifying category: ${qualifyingCategoryName} (${effectiveCategoryId})`);
        } else {
          // Create new qualifying category with doubled maxParticipants (typical qualifying structure)
          const qualifyingCategory = categoryRepository.create({
            id: generateId('cat'),
            tournamentId,
            name: qualifyingCategoryName,
            gender: sourceCategory.gender,
            ageGroup: sourceCategory.ageGroup,
            maxParticipants: sourceCategory.maxParticipants * 2, // Qualifying typically has more spots
          });
          await categoryRepository.save(qualifyingCategory);
          effectiveCategoryId = qualifyingCategory.id;
          console.log(`✅ Auto-created qualifying category: ${qualifyingCategoryName} (${effectiveCategoryId})`);
        }
      } else {
        console.log(`ℹ️  Non-QUALIFYING phase (type: "${phaseType}") - no auto-category creation`);
      }

      // Determine sequenceOrder: place new phase after all existing phases in this tournament
      const existingPhases = await phaseRepository
        .createQueryBuilder('phase')
        .innerJoin(Bracket, 'bracket', 'bracket.id = phase.bracketId')
        .where('bracket.tournamentId = :tournamentId', {tournamentId})
        .orderBy('phase.sequenceOrder', 'DESC')
        .getMany();

      const maxSequenceOrder = existingPhases.length > 0 ? existingPhases[0].sequenceOrder : 0;
      const newSequenceOrder = maxSequenceOrder + 10;

      // Create a new empty bracket for this phase (using qualifying category if applicable)
      const newBracket = bracketRepository.create({
        id: generateId('bkt'),
        tournamentId,
        categoryId: effectiveCategoryId,
        bracketType: resolvedBracketType,
        size: 0,
        totalRounds: 1,
        structure: null,
        isPublished: false,
      });
      await bracketRepository.save(newBracket);

      // Create the first phase in the new bracket
      const newPhase = phaseRepository.create({
        id: generateId('phs'),
        bracketId: newBracket.id,
        tournamentId,
        name: phaseName,
        order: 1,
        sequenceOrder: newSequenceOrder,
        matchCount: 0,
        nextPhaseId: null,
        isCompleted: false,
        phaseType: phaseType ?? 'CUSTOM',
        isAutoGenerated: false, // Manually created phase - can be deleted
      });
      await phaseRepository.save(newPhase);

      res.status(HTTP_STATUS.CREATED).json({
        message: `Phase "${phaseName}" created successfully`,
        bracket: newBracket,
        phase: newPhase,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a phase and its associated bracket.
   * Only manually created phases can be deleted; auto-generated phases are protected.
   *
   * @route DELETE /api/phases/:id
   * @access TOURNAMENT_ADMIN, SYSTEM_ADMIN
   */
  public async deletePhase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;

      if (!id) {
        throw new AppError('Phase ID is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const phaseRepository = AppDataSource.getRepository(Phase);
      const matchRepository = AppDataSource.getRepository(Match);
      const bracketRepository = AppDataSource.getRepository(Bracket);

      // Fetch the phase
      const phase = await phaseRepository.findOne({where: {id}});
      if (!phase) {
        throw new AppError(`Phase not found: ${id}`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Protect auto-generated phases (created by bracket generator)
      if (phase.isAutoGenerated) {
        throw new AppError(
          `Cannot delete auto-generated phase "${phase.name}". Only manually created phases can be deleted.`,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Check if any other phases link to this phase
      const linkedPhases = await phaseRepository.find({
        where: {nextPhaseId: id},
      });

      if (linkedPhases.length > 0) {
        throw new AppError(
          'Cannot delete phase. Other phases are linked to it. Please unlink them first.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Delete all matches in this phase
      const matchDeleteResult = await matchRepository.delete({phaseId: id});
      console.log(`  Deleted ${matchDeleteResult.affected || 0} matches for phase ${id}`);

      // Delete the phase
      await phaseRepository.delete({id});

      // Check if the bracket has any other phases
      const remainingPhases = await phaseRepository.find({
        where: {bracketId: phase.bracketId},
      });

      // If no phases remain, delete the bracket
      if (remainingPhases.length === 0) {
        await bracketRepository.delete({id: phase.bracketId});
        console.log(`  Deleted bracket ${phase.bracketId} (no remaining phases)`);
      }

      res.status(HTTP_STATUS.OK).json({
        message: `Phase "${phase.name}" deleted successfully`,
        deletedPhaseId: id,
        deletedBracket: remainingPhases.length === 0,
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
