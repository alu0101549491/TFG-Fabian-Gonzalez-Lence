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
 */

import {IOrderOfPlayService} from '../interfaces/order-of-play-service.interface';
import {CreateOrderOfPlayDto, OrderOfPlayDto} from '../dto';
import {IOrderOfPlayRepository} from '@domain/repositories/order-of-play-repository.interface';
import {IMatchRepository} from '@domain/repositories/match-repository.interface';
import {ICourtRepository} from '@domain/repositories/court-repository.interface';
import {INotificationService} from '../interfaces/notification-service.interface';
import {OrderOfPlay} from '@domain/entities/order-of-play';
import {generateId} from '@shared/utils';

/**
 * Order of play service implementation.
 * Handles match scheduling, court assignments, and order of play management.
 */
export class OrderOfPlayService implements IOrderOfPlayService {
  /**
   * Creates a new OrderOfPlayService instance.
   *
   * @param orderOfPlayRepository - Order of play repository for data access
   * @param matchRepository - Match repository for match data access
   * @param courtRepository - Court repository for court availability
   * @param _notificationService - Notification service for schedule notifications (reserved for future use)
   */
  public constructor(
    private readonly orderOfPlayRepository: IOrderOfPlayRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly courtRepository: ICourtRepository,
    private readonly _notificationService: INotificationService,
    // TODO: inject CourtScheduler
  ) {}

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
    
    // Get unscheduled matches
    // In real implementation, this would be a more sophisticated algorithm
    // using the CourtScheduler strategy
    const entries: OrderOfPlayDto[] = [];
    
    // Placeholder for auto-generation logic
    // Real implementation would use CourtScheduler to optimize court usage
    
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
