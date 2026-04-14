/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/order-of-play.controller.ts
 * @desc Order of Play controller for match scheduling and management.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {OrderOfPlay} from '../../domain/entities/order-of-play.entity';
import {Match} from '../../domain/entities/match.entity';
import {Court} from '../../domain/entities/court.entity';
import {Tournament} from '../../domain/entities/tournament.entity';
import {DoublesTeam} from '../../domain/entities/doubles-team.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {MatchStatus} from '../../domain/enumerations/match-status';
import {ScheduleGenerationService} from '../../application/services/schedule-generation.service';
import {NotificationService} from '../../application/services/notification.service';
import {emitOrderOfPlayChange} from '../../websocket-server';

/**
 * OrderOfPlayController handles match scheduling operations.
 */
export class OrderOfPlayController {
  private scheduleService: ScheduleGenerationService;
  private notificationService: NotificationService;

  constructor() {
    this.scheduleService = new ScheduleGenerationService();
    this.notificationService = new NotificationService();
  }

  /**
   * GET /api/order-of-play?tournamentId=xxx&date=yyyy-mm-dd
   * Retrieves the order of play for a specific tournament and date.
   */
  public async getByDate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId, date} = req.query;
      
      if (!tournamentId || !date) {
        throw new AppError('tournamentId and date required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const oopRepository = AppDataSource.getRepository(OrderOfPlay);
      const orderOfPlay = await oopRepository.findOne({
        where: {tournamentId: tournamentId as string, date: new Date(date as string)},
      });
      
      res.status(HTTP_STATUS.OK).json(orderOfPlay || {matches: [], isPublished: false});
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/order-of-play/generate
   * Generates an automatic schedule for unscheduled matches in a tournament.
   * Admin only.
   */
  public async generateSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        tournamentId,
        startDate,
        startTime,
        matchDuration,
        breakTime,
        simultaneousMatches
      } = req.body;

      if (!tournamentId || !startDate) {
        throw new AppError('tournamentId and startDate are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const matchRepository = AppDataSource.getRepository(Match);
      const courtRepository = AppDataSource.getRepository(Court);
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      const oopRepository = AppDataSource.getRepository(OrderOfPlay);

      // Verify tournament exists
      const tournament = await tournamentRepository.findOne({where: {id: tournamentId}});
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Get all unscheduled matches for this tournament
      // Include matches that:
      // 1. Have both participants assigned (ready to play) - for singles OR doubles
      // 2. Don't have a scheduled time yet
      // 3. Are either NOT_SCHEDULED or SCHEDULED status
      const unscheduledMatches = await matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.bracket', 'bracket')
        .where('bracket.tournamentId = :tournamentId', {tournamentId})
        .andWhere('match.status IN (:...statuses)', {
          statuses: [MatchStatus.NOT_SCHEDULED, MatchStatus.SCHEDULED],
        })
        .andWhere('match.scheduledTime IS NULL')
        .andWhere(
          // Singles: both participant IDs set, OR Doubles: both team IDs set
          '((match.participant1Id IS NOT NULL AND match.participant2Id IS NOT NULL) OR ' +
          '(match.participant1TeamId IS NOT NULL AND match.participant2TeamId IS NOT NULL))'
        )
        .orderBy('match.round', 'ASC')
        .addOrderBy('match.matchNumber', 'ASC')
        .getMany();

      if (unscheduledMatches.length === 0) {
        res.status(HTTP_STATUS.OK).json({
          message: 'No unscheduled matches found',
          scheduledCount: 0,
        });
        return;
      }

      // Get available courts for tournament that match the tournament's surface
      const courts = await courtRepository.find({
        where: {
          tournamentId,
          isAvailable: true,
          surface: tournament.surface, // Only use courts matching tournament surface
        },
      });

      if (courts.length === 0) {
        throw new AppError(
          `No available ${tournament.surface} courts found for tournament`, 
          HTTP_STATUS.BAD_REQUEST, 
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Generate schedule
      const schedule = this.scheduleService.generateSchedule(unscheduledMatches, courts, {
        startDate: new Date(startDate),
        startTime,
        matchDuration,
        breakTime,
        simultaneousMatches,
      });

      // Check for conflicts
      const conflicts = this.scheduleService.detectConflicts(schedule);
      if (conflicts.length > 0) {
        console.warn('Schedule has conflicts:', conflicts);
      }

      // Apply schedule to matches
      for (const scheduled of schedule) {
        await matchRepository.update(scheduled.matchId, {
          courtId: scheduled.courtId,
          courtName: scheduled.courtName,
          scheduledTime: scheduled.scheduledTime,
          status: MatchStatus.SCHEDULED,
          updatedAt: new Date(),
        });
      }

      // Create or update OrderOfPlay record for each date
      const matchesByDate = new Map<string, typeof schedule>();
      for (const scheduled of schedule) {
        const dateKey = scheduled.scheduledTime.toISOString().split('T')[0];
        const existing = matchesByDate.get(dateKey) || [];
        existing.push(scheduled);
        matchesByDate.set(dateKey, existing);
      }

      for (const [dateKey, daySchedule] of matchesByDate) {
        const date = new Date(dateKey);
        
        // Check if OOP already exists for this date
        let orderOfPlay = await oopRepository.findOne({
          where: {tournamentId, date},
        });

        const matches = daySchedule.map(s => ({
          matchId: s.matchId,
          courtId: s.courtId,
          time: s.scheduledTime.toISOString(),
          participants: [], // Will be populated when fetching with participant data
        }));

        if (orderOfPlay) {
          // Update existing
          orderOfPlay.matches = matches as any;
          orderOfPlay.updatedAt = new Date();
        } else {
          // Create new
          orderOfPlay = oopRepository.create({
            id: generateId('oop'),
            tournamentId,
            date,
            matches: matches as any,
            isPublished: false,
          });
        }

        await oopRepository.save(orderOfPlay);
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Schedule generated successfully',
        scheduledCount: schedule.length,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/order-of-play/:id/reschedule
   * Reschedules a specific match to a new court/time.
   * Admin only.
   */
  public async rescheduleMatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params; // match ID
      const {courtId, scheduledTime, breakTime = 15} = req.body;

      if (!courtId || !scheduledTime) {
        throw new AppError('courtId and scheduledTime are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const matchRepository = AppDataSource.getRepository(Match);
      const courtRepository = AppDataSource.getRepository(Court);
      const oopRepository = AppDataSource.getRepository(OrderOfPlay);

      // Find match
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['bracket', 'bracket.tournament', 'participant1', 'participant2'],
      });

      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      const tournamentId = match.bracket.tournamentId;

      // Find court by name OR by id, filtered by tournament
      // This ensures we get the correct court for this specific tournament
      let court = await courtRepository.findOne({
        where: {name: courtId, tournamentId}
      });
      
      if (!court) {
        // Try finding by UUID as fallback (still scoped to tournament)
        court = await courtRepository.findOne({
          where: {id: courtId, tournamentId}
        });
      }
      
      if (!court) {
        throw new AppError(
          `Court '${courtId}' not found for this tournament`, 
          HTTP_STATUS.NOT_FOUND, 
          ERROR_CODES.NOT_FOUND
        );
      }

      // Use the court's UUID for the rest of the logic
      const actualCourtId = court.id;

      // Get current schedule for tournament
      const tournamentMatches = await matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.bracket', 'bracket')
        .where('bracket.tournamentId = :tournamentId', {tournamentId: match.bracket.tournamentId})
        .andWhere('match.scheduledTime IS NOT NULL')
        .getMany();

      const currentSchedule = tournamentMatches.map(m => ({
        matchId: m.id,
        courtId: m.courtId!,
        courtName: m.courtName!,
        scheduledTime: m.scheduledTime!,
        estimatedDuration: 90, // default
      }));

      // Check if new slot is available with break time enforcement and court hours (FR5)
      const isAvailable = this.scheduleService.isTimeSlotAvailable(
        id,
        actualCourtId,
        court, // Pass court entity for operating hours validation
        new Date(scheduledTime),
        90,
        currentSchedule,
        breakTime // Pass break time for validation
      );

      if (!isAvailable) {
        throw new AppError(
          `Time slot conflict: Insufficient break time (${breakTime} minutes required), overlap with another match, or outside court operating hours`,
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Update match with court UUID and name
      match.courtId = actualCourtId; // Use the resolved court UUID
      match.courtName = court.name;
      match.scheduledTime = new Date(scheduledTime);
      match.status = MatchStatus.SCHEDULED;
      match.updatedAt = new Date();

      await matchRepository.save(match);

      // Update OrderOfPlay record
      const date = new Date(scheduledTime);
      date.setHours(0, 0, 0, 0);

      const orderOfPlay = await oopRepository.findOne({
        where: {tournamentId: match.bracket.tournamentId, date},
      });

      if (orderOfPlay) {
        // Update match in the matches array
        const matches = orderOfPlay.matches as any[];
        const matchIndex = matches.findIndex(m => m.matchId === id);
        
        if (matchIndex >= 0) {
          matches[matchIndex] = {
            matchId: id,
            courtId: actualCourtId, // Use UUID
            courtName: court.name,   // Include court name for display
            time: new Date(scheduledTime).toISOString(),
            participants: matches[matchIndex].participants,
          };
        } else {
          matches.push({
            matchId: id,
            courtId: actualCourtId, // Use UUID
            courtName: court.name,   // Include court name for display
            time: new Date(scheduledTime).toISOString(),
            participants: [],
          });
        }

        orderOfPlay.matches = matches as any;
        orderOfPlay.updatedAt = new Date();
        await oopRepository.save(orderOfPlay);

        // Emit WebSocket event for real-time updates
        emitOrderOfPlayChange(match.bracket.tournamentId, orderOfPlay);
      }

      // Notify participants about schedule change
      const tournamentName = match.bracket?.tournament?.name;
      const doublesTeamRepository = AppDataSource.getRepository(DoublesTeam);
      
      // Check if this is a doubles match or singles match
      const isDoubles = Boolean(match.participant1TeamId || match.participant2TeamId);
      
      if (isDoubles) {
        // Doubles match: notify all 4 players
        const team1 = match.participant1TeamId ? 
          await doublesTeamRepository.findOne({where: {id: match.participant1TeamId}, relations: ['player1', 'player2']}) : null;
        const team2 = match.participant2TeamId ? 
          await doublesTeamRepository.findOne({where: {id: match.participant2TeamId}, relations: ['player1', 'player2']}) : null;
        
        if (team1 && team2) {
          const team1Names = `${team1.player1.firstName} ${team1.player1.lastName} / ${team1.player2.firstName} ${team1.player2.lastName}`;
          const team2Names = `${team2.player1.firstName} ${team2.player1.lastName} / ${team2.player2.firstName} ${team2.player2.lastName}`;
          
          // Notify team 1 players
          for (const playerId of [team1.player1Id, team1.player2Id]) {
            try {
              await this.notificationService.notifyMatchScheduled(
                id, playerId, team2Names, new Date(scheduledTime), court.name, tournamentId, tournamentName
              );
            } catch (error) {
              console.error(`Failed to notify doubles player ${playerId}:`, error);
            }
          }
          
          // Notify team 2 players
          for (const playerId of [team2.player1Id, team2.player2Id]) {
            try {
              await this.notificationService.notifyMatchScheduled(
                id, playerId, team1Names, new Date(scheduledTime), court.name, tournamentId, tournamentName
              );
            } catch (error) {
              console.error(`Failed to notify doubles player ${playerId}:`, error);
            }
          }
        }
      } else if (match.participant1Id && match.participant2Id) {
        // Singles match: notify 2 players
        const participant1Name = match.participant1 ? `${match.participant1.firstName} ${match.participant1.lastName}` : 'Opponent';
        const participant2Name = match.participant2 ? `${match.participant2.firstName} ${match.participant2.lastName}` : 'Opponent';

        try {
          await this.notificationService.notifyMatchScheduled(
            id,
            match.participant1Id,
            participant2Name,
            new Date(scheduledTime),
            court.name,
            tournamentId,
            tournamentName
          );
        } catch (error) {
          console.error(`Failed to notify participant ${match.participant1Id}:`, error);
        }

        try {
          await this.notificationService.notifyMatchScheduled(
            id,
            match.participant2Id,
            participant1Name,
            new Date(scheduledTime),
            court.name,
            tournamentId,
            tournamentName
          );
        } catch (error) {
          console.error(`Failed to notify participant ${match.participant2Id}:`, error);
        }
      }

      res.status(HTTP_STATUS.OK).json(match);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/order-of-play/:id/publish
   * Publishes the order of play, notifying all participants.
   * Admin only.
   */
  public async publishOrderOfPlay(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params; // orderOfPlay ID

      const oopRepository = AppDataSource.getRepository(OrderOfPlay);
      const matchRepository = AppDataSource.getRepository(Match);

      const orderOfPlay = await oopRepository.findOne({where: {id}});
      if (!orderOfPlay) {
        throw new AppError('Order of play not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Mark as published
      orderOfPlay.isPublished = true;
      orderOfPlay.updatedAt = new Date();
      await oopRepository.save(orderOfPlay);

      // Get all match participants to notify
      const matchIds = (orderOfPlay.matches as any[]).map(m => m.matchId);
      const matches = await matchRepository.find({
        where: matchIds.map(matchId => ({id: matchId})),
        relations: ['participant1', 'participant2'],
      });

      // Collect unique  participant IDs (singles + doubles team players)
      const participantIds = new Set<string>();
      const doublesTeamRepository = AppDataSource.getRepository(DoublesTeam);
      
      for (const match of matches) {
        // Singles participants
        if (match.participant1Id) participantIds.add(match.participant1Id);
        if (match.participant2Id) participantIds.add(match.participant2Id);
        
        // Doubles team players
        if (match.participant1TeamId) {
          const team1 = await doublesTeamRepository.findOne({where: {id: match.participant1TeamId}});
          if (team1) {
            participantIds.add(team1.player1Id);
            participantIds.add(team1.player2Id);
          }
        }
        if (match.participant2TeamId) {
          const team2 = await doublesTeamRepository.findOne({where: {id: match.participant2TeamId}});
          if (team2) {
            participantIds.add(team2.player1Id);
            participantIds.add(team2.player2Id);
          }
        }
      }

      // Send notifications (batch them for efficiency)
      const participantIdArray = Array.from(participantIds);
      await this.notificationService.notifyOrderOfPlayPublished(
        orderOfPlay.tournamentId,
        participantIdArray,
        orderOfPlay.date,
      );
      console.log(`📧 Sent order of play notifications to ${participantIdArray.length} participants`);

      // Emit WebSocket event
      emitOrderOfPlayChange(orderOfPlay.tournamentId, orderOfPlay);

      res.status(HTTP_STATUS.OK).json({
        message: 'Order of play published',
        notifiedParticipants: participantIds.size,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/order-of-play/tournament/:tournamentId/publish
   * Publishes all scheduled matches for a tournament, notifying participants.
   * Admin only.
   */
  public async publishByTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId} = req.params;
      const {date} = req.body;

      const matchRepository = AppDataSource.getRepository(Match);
      const oopRepository = AppDataSource.getRepository(OrderOfPlay);

      // Get all scheduled matches for the tournament
      const matches = await matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.bracket', 'bracket')
        .leftJoinAndSelect('match.participant1', 'participant1')
        .leftJoinAndSelect('match.participant2', 'participant2')
        .where('bracket.tournamentId = :tournamentId', {tournamentId})
        .andWhere('match.scheduledTime IS NOT NULL')
        .getMany();

      if (matches.length === 0) {
        throw new AppError('No scheduled matches found to publish', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Group matches by date and create/update OrderOfPlay records
      const matchesByDate = new Map<string, typeof matches>();
      for (const match of matches) {
        const dateKey = match.scheduledTime!.toISOString().split('T')[0];
        const existing = matchesByDate.get(dateKey) || [];
        existing.push(match);
        matchesByDate.set(dateKey, existing);
      }

      // Collect all unique participant IDs (singles + doubles team players)
      // Also build a team map for display formatting
      const participantIds = new Set<string>();
      const doublesTeamRepository = AppDataSource.getRepository(DoublesTeam);
      const teamMap = new Map<string, DoublesTeam & {player1: any; player2: any}>();
      
      for (const match of matches) {
        // Singles participants
        if (match.participant1Id) participantIds.add(match.participant1Id);
        if (match.participant2Id) participantIds.add(match.participant2Id);
        
        // Doubles team players
        if (match.participant1TeamId) {
          const team1 = await doublesTeamRepository.findOne({
            where: {id: match.participant1TeamId},
            relations: ['player1', 'player2']
          }) as DoublesTeam & {player1: any; player2: any};
          if (team1) {
            participantIds.add(team1.player1Id);
            participantIds.add(team1.player2Id);
            teamMap.set(team1.id, team1);
          }
        }
        if (match.participant2TeamId) {
          const team2 = await doublesTeamRepository.findOne({
            where: {id: match.participant2TeamId},
            relations: ['player1', 'player2']
          }) as DoublesTeam & {player1: any; player2: any};
          if (team2) {
            participantIds.add(team2.player1Id);
            participantIds.add(team2.player2Id);
            teamMap.set(team2.id, team2);
          }
        }
      }

      // Create or update OrderOfPlay records for each date
      for (const [dateKey, dateMatches] of matchesByDate.entries()) {
        const matchDate = new Date(dateKey);
        
        let oop = await oopRepository.findOne({
          where: {tournamentId, date: matchDate},
        });

        const matchesData = dateMatches.map(m => {
          // Format participant 1 name
          let participant1Name = 'TBD';
          if (m.participant1TeamId && teamMap.has(m.participant1TeamId)) {
            const team = teamMap.get(m.participant1TeamId)!;
            const p1Initial = team.player1.firstName?.charAt(0) || '';
            const p2Initial = team.player2.firstName?.charAt(0) || '';
            participant1Name = `${p1Initial}. ${team.player1.lastName} / ${p2Initial}. ${team.player2.lastName}`;
          } else if (m.participant1) {
            participant1Name = `${m.participant1.firstName} ${m.participant1.lastName}`;
          }

          // Format participant 2 name
          let participant2Name = 'TBD';
          if (m.participant2TeamId && teamMap.has(m.participant2TeamId)) {
            const team = teamMap.get(m.participant2TeamId)!;
            const p1Initial = team.player1.firstName?.charAt(0) || '';
            const p2Initial = team.player2.firstName?.charAt(0) || '';
            participant2Name = `${p1Initial}. ${team.player1.lastName} / ${p2Initial}. ${team.player2.lastName}`;
          } else if (m.participant2) {
            participant2Name = `${m.participant2.firstName} ${m.participant2.lastName}`;
          }

          return {
            matchId: m.id,
            courtId: m.courtId,
            courtName: m.courtName,
            time: m.scheduledTime!.toISOString(),
            participants: [participant1Name, participant2Name],
          };
        });

        if (oop) {
          oop.matches = matchesData as any;
          oop.isPublished = true;
          oop.updatedAt = new Date();
        } else {
          oop = oopRepository.create({
            id: `oop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tournamentId,
            date: matchDate,
            matches: matchesData as any,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        await oopRepository.save(oop);
        emitOrderOfPlayChange(tournamentId, oop);
      }

      // Send notifications to all participants
      const participantIdArray = Array.from(participantIds);
      // Use current date for notification (multi-date publish)
      await this.notificationService.notifyOrderOfPlayPublished(
        tournamentId,
        participantIdArray,
        new Date(),
      );
      console.log(`📧 Sent order of play notifications to ${participantIdArray.length} participants (${matchesByDate.size} dates)`);

      res.status(HTTP_STATUS.OK).json({
        message: 'Order of play published',
        notifiedCount: participantIds.size,
        datesPublished: matchesByDate.size,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/order-of-play/tournament/:tournamentId
   * Retrieves all order of play records for a tournament.
   */
  public async getByTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId} = req.params;

      const oopRepository = AppDataSource.getRepository(OrderOfPlay);
      const orderOfPlays = await oopRepository.find({
        where: {tournamentId},
        order: {date: 'ASC'},
      });

      res.status(HTTP_STATUS.OK).json(orderOfPlays);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/order-of-play/tournament/:tournamentId/scheduled-matches
   * Retrieves all matches with SCHEDULED status for a tournament.
   * Only includes matches that have been assigned players, time, and court.
   */
  public async getScheduledMatches(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId} = req.params;

      const matchRepository = AppDataSource.getRepository(Match);

      // Get all matches that are ready to be scheduled or already scheduled for this tournament
      // Include matches with SCHEDULED or NOT_SCHEDULED status that have participants assigned
      const scheduledMatches = await matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.bracket', 'bracket')
        .leftJoinAndSelect('match.court', 'court')
        .leftJoinAndSelect('match.participant1', 'participant1')
        .leftJoinAndSelect('match.participant2', 'participant2')
        .where('bracket.tournamentId = :tournamentId', {tournamentId})
        .andWhere('match.status IN (:...statuses)', {
          statuses: [MatchStatus.SCHEDULED, MatchStatus.NOT_SCHEDULED],
        })
        .andWhere(
          // Singles: both participant IDs set, OR Doubles: both team IDs set
          '((match.participant1Id IS NOT NULL AND match.participant2Id IS NOT NULL) OR ' +
          '(match.participant1TeamId IS NOT NULL AND match.participant2TeamId IS NOT NULL))'
        )
        .orderBy('match.scheduledTime', 'ASC', 'NULLS LAST')
        .addOrderBy('match.round', 'ASC')
        .addOrderBy('match.matchNumber', 'ASC')
        .getMany();

      // Fetch doubles teams for display
      const doublesTeamRepository = AppDataSource.getRepository(DoublesTeam);
      const teamIds = new Set<string>();
      for (const match of scheduledMatches) {
        if (match.participant1TeamId) teamIds.add(match.participant1TeamId);
        if (match.participant2TeamId) teamIds.add(match.participant2TeamId);
      }
      
      const teamMap = new Map<string, DoublesTeam & {player1: any; player2: any}>();
      if (teamIds.size > 0) {
        const teams = await doublesTeamRepository.find({
          where: Array.from(teamIds).map(id => ({id})),
          relations: ['player1', 'player2'],
        }) as (DoublesTeam & {player1: any; player2: any})[];
        for (const team of teams) {
          teamMap.set(team.id, team);
        }
      }

      // Format matches for Order of Play display
      const formattedMatches = scheduledMatches.map(match => {
        // Format participant 1 name
        let participant1Name = 'TBD';
        if (match.participant1TeamId && teamMap.has(match.participant1TeamId)) {
          const team = teamMap.get(match.participant1TeamId)!;
          const p1Initial = team.player1.firstName?.charAt(0) || '';
          const p2Initial = team.player2.firstName?.charAt(0) || '';
          participant1Name = `${p1Initial}. ${team.player1.lastName} / ${p2Initial}. ${team.player2.lastName}`;
        } else if (match.participant1) {
          participant1Name = `${match.participant1.firstName} ${match.participant1.lastName}`;
        }

        // Format participant 2 name
        let participant2Name = 'TBD';
        if (match.participant2TeamId && teamMap.has(match.participant2TeamId)) {
          const team = teamMap.get(match.participant2TeamId)!;
          const p1Initial = team.player1.firstName?.charAt(0) || '';
          const p2Initial = team.player2.firstName?.charAt(0) || '';
          participant2Name = `${p1Initial}. ${team.player1.lastName} / ${p2Initial}. ${team.player2.lastName}`;
        } else if (match.participant2) {
          participant2Name = `${match.participant2.firstName} ${match.participant2.lastName}`;
        }

        return {
          matchId: match.id,
          courtId: match.courtId,
          courtName: match.courtName || match.court?.name || null,
          scheduledTime: match.scheduledTime,
          round: match.round,
          matchNumber: match.matchNumber,
          participants: [participant1Name, participant2Name],
          participantIds: [
            match.participant1Id,
            match.participant2Id,
          ],
          status: match.status,
        };
      });

      // Group by time assignment status
      const withTime = formattedMatches.filter(m => m.scheduledTime !== null);
      const withoutTime = formattedMatches.filter(m => m.scheduledTime === null);

      // Check if order of play is published for the date of scheduled matches
      const oopRepository = AppDataSource.getRepository(OrderOfPlay);
      let isPublished = false;
      
      if (withTime.length > 0) {
        // Get the date of the first scheduled match
        const firstMatchDate = new Date(withTime[0].scheduledTime!);
        firstMatchDate.setHours(0, 0, 0, 0);
        
        const orderOfPlay = await oopRepository.findOne({
          where: {tournamentId, date: firstMatchDate},
        });
        
        isPublished = orderOfPlay?.isPublished ?? false;
      }

      res.status(HTTP_STATUS.OK).json({
        scheduledMatches: withTime,
        awaitingSchedule: withoutTime,
        totalCount: formattedMatches.length,
        isPublished,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/order-of-play/regenerate
   * Clears all existing schedules and regenerates a new schedule with updated parameters.
   * Admin only.
   */
  public async regenerateSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        tournamentId,
        startDate,
        startTime,
        matchDuration,
        breakTime,
        simultaneousMatches
      } = req.body;

      if (!tournamentId || !startDate) {
        throw new AppError('tournamentId and startDate are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const matchRepository = AppDataSource.getRepository(Match);
      const courtRepository = AppDataSource.getRepository(Court);
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      const oopRepository = AppDataSource.getRepository(OrderOfPlay);

      // Verify tournament exists
      const tournament = await tournamentRepository.findOne({where: {id: tournamentId}});
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Get all matches for this tournament that have both participants assigned
      // (regardless of current scheduling status)
      const matchesToReschedule = await matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.bracket', 'bracket')
        .where('bracket.tournamentId = :tournamentId', {tournamentId})
        .andWhere(
          // Singles: both participant IDs set, OR Doubles: both team IDs set
          '((match.participant1Id IS NOT NULL AND match.participant2Id IS NOT NULL) OR ' +
          '(match.participant1TeamId IS NOT NULL AND match.participant2TeamId IS NOT NULL))'
        )
        .andWhere('match.status IN (:...statuses)', {
          statuses: [MatchStatus.NOT_SCHEDULED, MatchStatus.SCHEDULED],
        })
        .orderBy('match.round', 'ASC')
        .addOrderBy('match.matchNumber', 'ASC')
        .getMany();

      if (matchesToReschedule.length === 0) {
        res.status(HTTP_STATUS.OK).json({
          message: 'No matches found to reschedule',
          scheduledCount: 0,
        });
        return;
      }

      // Clear all scheduled times and courts for these matches
      for (const match of matchesToReschedule) {
        match.scheduledTime = null;
        match.courtId = null;
        match.courtName = null;
        match.status = MatchStatus.NOT_SCHEDULED;
        match.updatedAt = new Date();
      }
      await matchRepository.save(matchesToReschedule);

      // Clear all OrderOfPlay records for this tournament
      await oopRepository.delete({tournamentId});

      // Get available courts for tournament that match the tournament's surface
      const courts = await courtRepository.find({
        where: {
          tournamentId,
          isAvailable: true,
          surface: tournament.surface,
        },
      });

      if (courts.length === 0) {
        throw new AppError(
          `No available ${tournament.surface} courts found for tournament`, 
          HTTP_STATUS.BAD_REQUEST, 
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Generate new schedule using the same logic as generateSchedule
      const schedule = this.scheduleService.generateSchedule(matchesToReschedule, courts, {
        startDate: new Date(startDate),
        startTime,
        matchDuration,
        breakTime,
        simultaneousMatches,
      });

      // Check for conflicts
      const conflicts = this.scheduleService.detectConflicts(schedule);
      if (conflicts.length > 0) {
        console.warn('Regenerated schedule has conflicts:', conflicts);
      }

      // Apply schedule to matches
      for (const scheduled of schedule) {
        await matchRepository.update(scheduled.matchId, {
          courtId: scheduled.courtId,
          courtName: scheduled.courtName,
          scheduledTime: scheduled.scheduledTime,
          status: MatchStatus.SCHEDULED,
          updatedAt: new Date(),
        });
      }

      // Create OrderOfPlay records for each date
      const matchesByDate = new Map<string, typeof schedule>();
      for (const scheduled of schedule) {
        const dateKey = scheduled.scheduledTime.toISOString().split('T')[0];
        const existing = matchesByDate.get(dateKey) || [];
        existing.push(scheduled);
        matchesByDate.set(dateKey, existing);
      }

      for (const [dateKey, daySchedule] of matchesByDate) {
        const date = new Date(dateKey);
        
        const matches = daySchedule.map(s => ({
          matchId: s.matchId,
          courtId: s.courtId,
          time: s.scheduledTime.toISOString(),
          participants: [],
        }));

        const orderOfPlay = oopRepository.create({
          id: generateId('oop'),
          tournamentId,
          date,
          matches: matches as any,
          isPublished: false,
        });

        await oopRepository.save(orderOfPlay);
        
        // Emit WebSocket event for real-time updates
        emitOrderOfPlayChange(tournamentId, orderOfPlay);
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Schedule regenerated successfully',
        scheduledCount: schedule.length,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
      });
    } catch (error) {
      next(error);
    }
  }
}

