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
      const unscheduledMatches = await matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.bracket', 'bracket')
        .where('bracket.tournamentId = :tournamentId', {tournamentId})
        .andWhere('match.status = :status', {status: MatchStatus.SCHEDULED})
        .andWhere('match.scheduledTime IS NULL')
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

      // Get available courts for tournament
      const courts = await courtRepository.find({
        where: {tournamentId, isAvailable: true},
      });

      if (courts.length === 0) {
        throw new AppError('No available courts found for tournament', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
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
      const {courtId, scheduledTime} = req.body;

      if (!courtId || !scheduledTime) {
        throw new AppError('courtId and scheduledTime are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const matchRepository = AppDataSource.getRepository(Match);
      const courtRepository = AppDataSource.getRepository(Court);
      const oopRepository = AppDataSource.getRepository(OrderOfPlay);

      // Find match
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['bracket', 'participant1', 'participant2'],
      });

      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify court exists and belongs to tournament
      const court = await courtRepository.findOne({where: {id: courtId}});
      if (!court) {
        throw new AppError('Court not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      if (court.tournamentId !== match.bracket.tournamentId) {
        throw new AppError('Court does not belong to match tournament', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

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

      // Check if new slot is available
      const isAvailable = this.scheduleService.isTimeSlotAvailable(
        id,
        courtId,
        new Date(scheduledTime),
        90,
        currentSchedule
      );

      if (!isAvailable) {
        throw new AppError(
          'Time slot conflict: Another match is scheduled at this time on this court',
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Update match
      match.courtId = courtId;
      match.courtName = court.name;
      match.scheduledTime = new Date(scheduledTime);
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
            courtId,
            time: new Date(scheduledTime).toISOString(),
            participants: matches[matchIndex].participants,
          };
        } else {
          matches.push({
            matchId: id,
            courtId,
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
      if (match.participant1Id && match.participant2Id) {
        const participantIds = [match.participant1Id, match.participant2Id];
        for (const participantId of participantIds) {
          try {
            await this.notificationService.notifyMatchScheduled(
              id,
              participantId,
              court.name,
              new Date(scheduledTime)
            );
          } catch (error) {
            console.error(`Failed to notify participant ${participantId}:`, error);
          }
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

      // Collect unique participant IDs
      const participantIds = new Set<string>();
      for (const match of matches) {
        if (match.participant1Id) participantIds.add(match.participant1Id);
        if (match.participant2Id) participantIds.add(match.participant2Id);
      }

      // Send notifications (batch them for efficiency)
      for (const participantId of participantIds) {
        try {
          await this.notificationService.createNotification(
            participantId,
            'ORDER_OF_PLAY_PUBLISHED' as any,
            '📅 Order of Play Published',
            `The match schedule for ${orderOfPlay.date.toLocaleDateString()} has been published. Check your upcoming matches!`,
            {
              tournamentId: orderOfPlay.tournamentId,
              date: orderOfPlay.date.toISOString(),
            }
          );
        } catch (error) {
          console.error(`Failed to notify participant ${participantId}:`, error);
        }
      }

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
}

