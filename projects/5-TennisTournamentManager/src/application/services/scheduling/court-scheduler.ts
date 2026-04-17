/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/scheduling/court-scheduler.ts
 * @desc Court scheduling service implementing automatic match scheduling algorithm (Strategy Pattern)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable} from '@angular/core';
import {ICourtScheduler, SchedulingOptions, SchedulingResult} from '@application/interfaces/court-scheduler.interface';
import {Match} from '@domain/entities/match';
import {Court} from '@domain/entities/court';
import {MatchStatus} from '@domain/enumerations/match-status';

/**
 * Internal representation of a match with priority metadata.
 */
interface PrioritizedMatch {
  readonly match: Match;
  readonly priority: number;
  readonly phaseName: string;
}

/**
 * Internal representation of a time slot assignment.
 */
interface TimeSlot {
  readonly startTime: Date;
  readonly endTime: Date;
  readonly courtId: string;
  readonly courtOrder: number;
  readonly playersInvolved: Set<string>;
}

/**
 * Court scheduler service implementation.
 * 
 * Implements automatic scheduling algorithm following ITF guidelines:
 * 1. Prioritize finals and semifinals
 * 2. Respect minimum rest period between matches (default: 2 hours)
 * 3. Distribute matches across available courts
 * 4. Validate no player with simultaneous matches
 * 5. Handle estimated match durations
 * 
 * Uses greedy scheduling algorithm with constraint validation.
 */
@Injectable({providedIn: 'root'})
export class CourtScheduler implements ICourtScheduler {
  private static readonly DEFAULT_MATCH_DURATION_MINUTES = 90;
  private static readonly DEFAULT_REST_PERIOD_MINUTES = 120;
  private static readonly DEFAULT_PHASE_PRIORITIES: Map<string, number> = new Map([
    ['Final', 100],
    ['Semifinal', 90],
    ['Quarterfinal', 80],
    ['Round of 16', 70],
    ['Round of 32', 60],
  ]);

  /**
   * Generates optimal schedule assignments for pending matches.
   *
   * @param matches - List of matches to schedule (SCHEDULED status)
   * @param courts - Available courts for scheduling
   * @param date - Target date for scheduling
   * @param options - Scheduling configuration
   * @returns List of scheduling assignments
   * @throws Error if scheduling constraints cannot be satisfied
   */
  public async schedule(
    matches: Match[],
    courts: Court[],
    date: Date,
    options: SchedulingOptions
  ): Promise<SchedulingResult[]> {
    // Validate inputs
    this.validateInputs(matches, courts, options);

    // Filter only SCHEDULED matches
    const schedulableMatches = matches.filter(m => m.status === MatchStatus.SCHEDULED);
    
    if (schedulableMatches.length === 0) {
      return [];
    }

    // Get configuration with defaults
    const matchDuration = options.estimatedMatchDuration ?? CourtScheduler.DEFAULT_MATCH_DURATION_MINUTES;
    const restPeriod = options.minimumRestPeriod ?? CourtScheduler.DEFAULT_REST_PERIOD_MINUTES;
    const phasePriorities = options.phasePriorities ?? CourtScheduler.DEFAULT_PHASE_PRIORITIES;

    // TODO: Fetch phase information from PhaseRepository
    // For now, we'll use match order as a heuristic for priority
    const prioritizedMatches = await this.prioritizeMatches(schedulableMatches, phasePriorities);

    // Initialize time slot tracking for each court
    const courtSchedules = this.initializeCourtSchedules(courts, date, options);

    // Track player last match times for rest period validation
    const playerLastMatchTimes = new Map<string, Date>();

    // Schedule matches greedily by priority
    const results: SchedulingResult[] = [];

    for (const {match, priority: _priority, phaseName: _phaseName} of prioritizedMatches) {
      const assignment = this.findBestTimeSlot(
        match,
        courtSchedules,
        playerLastMatchTimes,
        matchDuration,
        restPeriod,
        options.startTime,
        options.endTime,
        courts
      );

      if (!assignment) {
        throw new Error(
          `Unable to schedule match ${match.id}. ` +
          'No available time slots satisfy constraints (court availability, player rest periods).'
        );
      }

      // Record the assignment
      results.push({
        matchId: match.id,
        courtId: assignment.courtId,
        startTime: assignment.startTime,
        estimatedEndTime: assignment.endTime,
        courtOrder: assignment.courtOrder,
      });

      // Update court schedule
      courtSchedules.push(assignment);

      // Update player last match times
      playerLastMatchTimes.set(match.player1Id, assignment.endTime);
      playerLastMatchTimes.set(match.player2Id, assignment.endTime);
    }

    return results;
  }

  /**
   * Validates input parameters for scheduling.
   *
   * @param matches - List of matches
   * @param courts - List of courts
   * @param options - Scheduling options
   * @throws Error if validation fails
   */
  private validateInputs(matches: Match[], courts: Court[], options: SchedulingOptions): void {
    if (!matches || matches.length === 0) {
      throw new Error('At least one match is required for scheduling');
    }

    if (!courts || courts.length === 0) {
      throw new Error('At least one court is required for scheduling');
    }

    if (!options.startTime || !options.endTime) {
      throw new Error('Start time and end time are required');
    }

    if (options.startTime >= options.endTime) {
      throw new Error('Start time must be before end time');
    }

    const dayDuration = (options.endTime.getTime() - options.startTime.getTime()) / (1000 * 60);
    const matchDuration = options.estimatedMatchDuration ?? CourtScheduler.DEFAULT_MATCH_DURATION_MINUTES;
    
    if (dayDuration < matchDuration) {
      throw new Error(
        `Insufficient time window: ${dayDuration} minutes available, ` +
        `but matches require ${matchDuration} minutes each`
      );
    }
  }

  /**
   * Prioritizes matches by phase importance and match order.
   *
   * @param matches - List of matches to prioritize
   * @param _phasePriorities - Phase name to priority mapping (reserved for future use)
   * @returns Sorted list of matches with priority metadata
   */
  private async prioritizeMatches(
    matches: Match[],
    _phasePriorities: Map<string, number>
  ): Promise<PrioritizedMatch[]> {
    // TODO: Fetch actual phase information from PhaseRepository
    // For now, we'll prioritize by matchOrder (lower = earlier in bracket = likely more important)
    
    const prioritized = matches.map(match => {
      // Heuristic: Lower match orders are typically later phases (finals, semis)
      // In a 16-player knockout: matchOrder 1 = final, 2-3 = semis, 4-7 = quarters
      let priority = 0;
      let phaseName = 'Unknown Phase';

      // Simple heuristic based on match order
      if (match.matchOrder === 1) {
        priority = 100; // Final
        phaseName = 'Final';
      } else if (match.matchOrder >= 2 && match.matchOrder <= 3) {
        priority = 90; // Semifinal
        phaseName = 'Semifinal';
      } else if (match.matchOrder >= 4 && match.matchOrder <= 7) {
        priority = 80; // Quarterfinal
        phaseName = 'Quarterfinal';
      } else if (match.matchOrder >= 8 && match.matchOrder <= 15) {
        priority = 70; // Round of 16
        phaseName = 'Round of 16';
      } else {
        priority = 50; // Earlier rounds
        phaseName = 'Early Round';
      }

      return {
        match,
        priority,
        phaseName,
      };
    });

    // Sort by priority (descending) then by matchOrder (ascending)
    return prioritized.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.match.matchOrder - b.match.matchOrder;
    });
  }

  /**
   * Initializes the court schedule tracking structure.
   *
   * @param _courts - Available courts (reserved for future use)
   * @param _date - Target date (reserved for future use)
   * @param _options - Scheduling options (reserved for future use)
   * @returns Empty time slot array
   */
  private initializeCourtSchedules(
    _courts: Court[],
    _date: Date,
    _options: SchedulingOptions
  ): TimeSlot[] {
    // Return empty array - will be populated during scheduling
    return [];
  }

  /**
   * Finds the best available time slot for a match.
   *
   * @param match - Match to schedule
   * @param existingSchedule - Already scheduled time slots
   * @param playerLastMatchTimes - Map of player ID to their last match end time
   * @param matchDuration - Match duration in minutes
   * @param restPeriod - Minimum rest period in minutes
   * @param dayStart - Start time of the day
   * @param dayEnd - End time of the day
   * @param courts - Available courts
   * @returns Time slot assignment or null if no valid slot found
   */
  private findBestTimeSlot(
    match: Match,
    existingSchedule: TimeSlot[],
    playerLastMatchTimes: Map<string, Date>,
    matchDuration: number,
    restPeriod: number,
    dayStart: Date,
    dayEnd: Date,
    courts: Court[]
  ): TimeSlot | null {
    // Try each available court
    for (const court of courts) {
      const courtSlots = existingSchedule.filter(s => s.courtId === court.id);
      const slot = this.findSlotOnCourt(
        match,
        court.id,
        courtSlots,
        playerLastMatchTimes,
        matchDuration,
        restPeriod,
        dayStart,
        dayEnd
      );

      if (slot) {
        return slot;
      }
    }

    return null;
  }

  /**
   * Finds an available slot on a specific court.
   *
   * @param match - Match to schedule  
   * @param courtId - Court ID
   * @param courtSlots - Existing slots on this court
   * @param playerLastMatchTimes - Player rest tracking
   * @param matchDuration - Match duration in minutes
   * @param restPeriod - Rest period in minutes
   * @param dayStart - Start of day
   * @param dayEnd - End of day
   * @returns Time slot or null
   */
  private findSlotOnCourt(
    match: Match,
    courtId: string,
    courtSlots: TimeSlot[],
    playerLastMatchTimes: Map<string, Date>,
    matchDuration: number,
    restPeriod: number,
    dayStart: Date,
    dayEnd: Date
  ): TimeSlot | null {
    // Sort existing slots by start time
    const sortedSlots = [...courtSlots].sort((a, b) => 
      a.startTime.getTime() - b.startTime.getTime()
    );

    // Try to fit before first slot
    if (sortedSlots.length === 0 || sortedSlots[0].startTime.getTime() - dayStart.getTime() >= matchDuration * 60 * 1000) {
      const startTime = dayStart;
      const endTime = new Date(startTime.getTime() + matchDuration * 60 * 1000);
      
      if (this.canScheduleMatch(match, startTime, endTime, playerLastMatchTimes, restPeriod, dayEnd)) {
        return {
          startTime,
          endTime,
          courtId,
          courtOrder: 1,
          playersInvolved: new Set([match.player1Id, match.player2Id]),
        };
      }
    }

    // Try to fit between existing slots
    for (let i = 0; i < sortedSlots.length; i++) {
      const currentSlot = sortedSlots[i];
      const nextSlot = sortedSlots[i + 1];

      const gapStart = currentSlot.endTime;
      const gapEnd = nextSlot ? nextSlot.startTime : dayEnd;
      const gapDuration = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60);

      if (gapDuration >= matchDuration) {
        const startTime = gapStart;
        const endTime = new Date(startTime.getTime() + matchDuration * 60 * 1000);

        if (this.canScheduleMatch(match, startTime, endTime, playerLastMatchTimes, restPeriod, dayEnd)) {
          return {
            startTime,
            endTime,
            courtId,
            courtOrder: i + 2,
            playersInvolved: new Set([match.player1Id, match.player2Id]),
          };
        }
      }
    }

    // Try to fit after last slot
    if (sortedSlots.length > 0) {
      const lastSlot = sortedSlots[sortedSlots.length - 1];
      const startTime = lastSlot.endTime;
      const endTime = new Date(startTime.getTime() + matchDuration * 60 * 1000);

      if (endTime <= dayEnd && this.canScheduleMatch(match, startTime, endTime, playerLastMatchTimes, restPeriod, dayEnd)) {
        return {
          startTime,
          endTime,
          courtId,
          courtOrder: sortedSlots.length + 1,
          playersInvolved: new Set([match.player1Id, match.player2Id]),
        };
      }
    }

    return null;
  }

  /**
   * Checks if a match can be scheduled at the given time.
   *
   * @param match - Match to check
   * @param startTime - Proposed start time
   * @param endTime - Proposed end time
   * @param playerLastMatchTimes - Player rest tracking
   * @param restPeriod - Minimum rest period in minutes
   * @param dayEnd - End of day
   * @returns True if the match can be scheduled
   */
  private canScheduleMatch(
    match: Match,
    startTime: Date,
    endTime: Date,
    playerLastMatchTimes: Map<string, Date>,
    restPeriod: number,
    dayEnd: Date
  ): boolean {
    // Check if match fits within day
    if (endTime > dayEnd) {
      return false;
    }

    // Check player 1 rest period
    const player1LastMatch = playerLastMatchTimes.get(match.player1Id);
    if (player1LastMatch) {
      const restMinutes = (startTime.getTime() - player1LastMatch.getTime()) / (1000 * 60);
      if (restMinutes < restPeriod) {
        return false;
      }
    }

    // Check player 2 rest period
    const player2LastMatch = playerLastMatchTimes.get(match.player2Id);
    if (player2LastMatch) {
      const restMinutes = (startTime.getTime() - player2LastMatch.getTime()) / (1000 * 60);
      if (restMinutes < restPeriod) {
        return false;
      }
    }

    return true;
  }
}
