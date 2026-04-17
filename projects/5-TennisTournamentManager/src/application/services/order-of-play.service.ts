/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/order-of-play.service.ts
 * @desc Order of play service implementation for match scheduling and court assignment
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {IOrderOfPlayService} from '../interfaces/order-of-play-service.interface';
import {CreateOrderOfPlayDto, OrderOfPlayDto} from '../dto';
import {OrderOfPlayRepositoryImpl} from '@infrastructure/repositories/order-of-play.repository';
import {MatchRepositoryImpl} from '@infrastructure/repositories/match.repository';
import {CourtRepositoryImpl} from '@infrastructure/repositories/court.repository';
import {BracketRepositoryImpl} from '@infrastructure/repositories/bracket.repository';
import {NotificationService} from './notification.service';
import {OrderOfPlay} from '@domain/entities/order-of-play';
import {generateId} from '@shared/utils';
import {CourtScheduler} from './scheduling/court-scheduler';
import {SchedulingOptions} from '../interfaces/court-scheduler.interface';

/**
 * Order of play service implementation.
 * Handles match scheduling, court assignments, and order of play management.
 */
@Injectable({providedIn: 'root'})
export class OrderOfPlayService implements IOrderOfPlayService {
  private readonly orderOfPlayRepository = inject(OrderOfPlayRepositoryImpl);
  private readonly matchRepository = inject(MatchRepositoryImpl);
  private readonly courtRepository = inject(CourtRepositoryImpl);
  private readonly bracketRepository = inject(BracketRepositoryImpl);
  private readonly _notificationService = inject(NotificationService);
  private readonly courtScheduler = inject(CourtScheduler);

  /**
   * Creates a new order of play entry.
   *
   * @param data - Order of play creation data
   * @param userId - ID of the user creating the entry
   * @returns Created order of play entry
   */
  public async createEntry(data: CreateOrderOfPlayDto, userId: string): Promise<OrderOfPlayDto> {
    // Validate input
    if (!data.tournamentId || data.tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!data.matchId || data.matchId.trim().length === 0) {
      throw new Error('Match ID is required');
    }
    
    if (!data.courtId || data.courtId.trim().length === 0) {
      throw new Error('Court ID is required');
    }
    
    if (!data.scheduledDate || !data.startTime) {
      throw new Error('Scheduled date and start time are required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if match exists
    const match = await this.matchRepository.findById(data.matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    // Check if court exists
    const court = await this.courtRepository.findById(data.courtId);
    if (!court) {
      throw new Error('Court not found');
    }
    
    // Create order of play entity
    const orderOfPlay = new OrderOfPlay({
      id: generateId(),
      tournamentId: data.tournamentId,
      matchId: data.matchId,
      courtId: data.courtId,
      scheduledDate: data.scheduledDate,
      startTime: data.startTime,
      estimatedEndTime: data.estimatedEndTime ?? null,
      courtOrder: data.courtOrder,
    });
    
    // Save order of play
    const savedEntry = await this.orderOfPlayRepository.save(orderOfPlay);
    
    // Map to DTO
    return this.mapOrderOfPlayToDto(savedEntry, court.name, '', '');
  }

  /**
   * Retrieves all order of play entries for a tournament.
   *
   * @param tournamentId - ID of the tournament
   * @returns List of order of play entries
   */
  public async getByTournament(tournamentId: string): Promise<OrderOfPlayDto[]> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    const entries = await this.orderOfPlayRepository.findByTournamentId(tournamentId);
    return Promise.all(entries.map(async e => {
      const match = await this.matchRepository.findById(e.matchId);
      const court = await this.courtRepository.findById(e.courtId);
      return this.mapOrderOfPlayToDto(
        e,
        court?.name ?? 'Unknown',
        match?.player1Id ?? '',
        match?.player2Id ?? ''
      );
    }));
  }

  /**
   * Retrieves order of play entries for a specific date.
   *
   * @param tournamentId - ID of the tournament
   * @param date - Date to query
   * @returns List of order of play entries for the date
   */
  public async getByDate(tournamentId: string, date: Date): Promise<OrderOfPlayDto[]> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!date) {
      throw new Error('Date is required');
    }
    
    // Get all entries for the tournament and filter by date
    const allEntries = await this.orderOfPlayRepository.findByTournamentId(tournamentId);
    const entries = allEntries.filter((entry: OrderOfPlay) => {
      const entryDate = new Date(entry.scheduledDate);
      return entryDate.toDateString() === date.toDateString();
    });
    
    return Promise.all(entries.map(async (e: OrderOfPlay) => {
      const match = await this.matchRepository.findById(e.matchId);
      const court = await this.courtRepository.findById(e.courtId);
      return this.mapOrderOfPlayToDto(
        e,
        court?.name ?? 'Unknown',
        match?.player1Id ?? '',
        match?.player2Id ?? ''
      );
    }));
  }

  /**
   * Retrieves order of play entries for a specific court on a date.
   *
   * @param courtId - ID of the court
   * @param date - Date to query
   * @returns List of order of play entries for the court
   */
  public async getByCourt(courtId: string, date: Date): Promise<OrderOfPlayDto[]> {
    // Validate input
    if (!courtId || courtId.trim().length === 0) {
      throw new Error('Court ID is required');
    }
    
    if (!date) {
      throw new Error('Date is required');
    }
    
    const entries = await this.orderOfPlayRepository.findByCourtId(courtId, date);
    const court = await this.courtRepository.findById(courtId);
    
    return Promise.all(entries.map(async e => {
      const match = await this.matchRepository.findById(e.matchId);
      return this.mapOrderOfPlayToDto(
        e,
        court?.name ?? 'Unknown',
        match?.player1Id ?? '',
        match?.player2Id ?? ''
      );
    }));
  }

  /**
   * Publishes the order of play for a specific date, notifying participants.
   *
   * @param id - ID of the order of play entry
   * @param userId - ID of the user publishing the schedule
   */
  public async publishOrderOfPlay(id: string, userId: string): Promise<void> {
    // Validate input
    if (!id || id.trim().length === 0) {
      throw new Error('Order of play ID is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Check if order of play exists
    const orderOfPlay = await this.orderOfPlayRepository.findById(id);
    if (!orderOfPlay) {
      throw new Error('Order of play entry not found');
    }
    
    // Update published status
    const publishedEntry = new OrderOfPlay({
      ...orderOfPlay,
      isPublished: true,
    });
    
    await this.orderOfPlayRepository.update(publishedEntry);
    
    // Send notifications to participants
    // await this.notificationService.sendBulkNotifications(...)
  }

  /**
   * Automatically generates order of play entries for a date.
   *
   * @param tournamentId - ID of the tournament
   * @param date - Date to generate schedule for
   * @param userId - ID of the user triggering auto-generation
   * @returns Generated order of play entries
   */
  public async generateOrderOfPlay(tournamentId: string, date: Date, userId: string): Promise<OrderOfPlayDto[]> {
    // Validate input
    if (!tournamentId || tournamentId.trim().length === 0) {
      throw new Error('Tournament ID is required');
    }
    
    if (!date) {
      throw new Error('Date is required');
    }
    
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    // Get available courts
    const availableCourts = await this.courtRepository.findByTournamentId(tournamentId);
    if (availableCourts.length === 0) {
      throw new Error('No courts available for scheduling');
    }
    
    // Get unscheduled matches for the requested tournament only.
    const allMatches = await this.matchRepository.findAll();
    const bracketIds = [...new Set(allMatches.map((match) => match.bracketId))];
    const brackets = await Promise.all(bracketIds.map((bracketId) => this.bracketRepository.findById(bracketId)));
    const tournamentBracketIds = new Set(
      brackets
        .filter((bracket): bracket is NonNullable<typeof bracket> => bracket !== null)
        .filter((bracket) => bracket.tournamentId === tournamentId)
        .map((bracket) => bracket.id)
    );
    const unscheduledMatches = allMatches.filter(
      (match) => match.status === 'SCHEDULED'
        && !match.scheduledTime
        && tournamentBracketIds.has(match.bracketId)
    );
    
    if (unscheduledMatches.length === 0) {
      return []; // No matches to schedule
    }
    
    // Configure scheduling options
    const schedulingDate = new Date(date);
    const startTime = new Date(schedulingDate);
    startTime.setHours(9, 0, 0, 0); // Default: 9:00 AM
    
    const endTime = new Date(schedulingDate);
    endTime.setHours(21, 0, 0, 0); // Default: 9:00 PM
    
    const options: SchedulingOptions = {
      startTime,
      endTime,
      estimatedMatchDuration: 90, // 90 minutes per match
      minimumRestPeriod: 120, // 2 hours rest between matches
    };
    
    // Use CourtScheduler to generate optimal schedule
    const schedulingResults = await this.courtScheduler.schedule(
      unscheduledMatches,
      availableCourts,
      schedulingDate,
      options
    );
    
    // Create and save OrderOfPlay entries for each scheduled match
    const entries: OrderOfPlayDto[] = [];
    
    for (const result of schedulingResults) {
      const orderOfPlay = new OrderOfPlay({
        id: generateId(),
        tournamentId,
        matchId: result.matchId,
        courtId: result.courtId,
        scheduledDate: schedulingDate,
        startTime: result.startTime,
        estimatedEndTime: result.estimatedEndTime,
        courtOrder: result.courtOrder,
        isPublished: false,
        updatedAt: new Date(),
      });
      
      const savedOrderOfPlay = await this.orderOfPlayRepository.save(orderOfPlay);
      
      // Get match and court details for DTO
      const match = await this.matchRepository.findById(result.matchId);
      const court = await this.courtRepository.findById(result.courtId);
      
      if (!match || !court) {
        throw new Error(`Failed to retrieve match or court for order of play entry ${savedOrderOfPlay.id}`);
      }
      
      // TODO: Get participant names from UserRepository
      const participant1Name = `Player ${match.player1Id}`;
      const participant2Name = `Player ${match.player2Id}`;
      
      const dto = this.mapOrderOfPlayToDto(
        savedOrderOfPlay,
        court.name,
        participant1Name,
        participant2Name
      );
      
      entries.push(dto);
    }
    
    return entries;
  }

  /**
   * Maps an OrderOfPlay entity to OrderOfPlayDto.
   *
   * @param orderOfPlay - OrderOfPlay entity
   * @param courtName - Court name
   * @param participant1Name - First participant name
   * @param participant2Name - Second participant name
   * @returns OrderOfPlay DTO
   */
  private mapOrderOfPlayToDto(
    orderOfPlay: OrderOfPlay,
    courtName: string,
    participant1Name: string,
    participant2Name: string
  ): OrderOfPlayDto {
    return {
      id: orderOfPlay.id,
      tournamentId: orderOfPlay.tournamentId,
      matchId: orderOfPlay.matchId,
      courtId: orderOfPlay.courtId,
      courtName,
      participant1Name,
      participant2Name,
      scheduledDate: orderOfPlay.scheduledDate,
      startTime: orderOfPlay.startTime,
      estimatedEndTime: orderOfPlay.estimatedEndTime,
      courtOrder: orderOfPlay.courtOrder,
      isPublished: orderOfPlay.isPublished,
    };
  }
}
