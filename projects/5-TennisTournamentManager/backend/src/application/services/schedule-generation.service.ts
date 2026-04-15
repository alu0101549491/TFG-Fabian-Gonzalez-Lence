/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 2, 2026
 * @file application/services/schedule-generation.service.ts
 * @desc Service for automatic match scheduling across courts with conflict detection.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Match} from '../../domain/entities/match.entity';
import {Court} from '../../domain/entities/court.entity';

/**
 * Interface for scheduled match assignments.
 */
export interface ScheduledMatch {
  matchId: string;
  courtId: string;
  courtName: string;
  scheduledTime: Date;
  estimatedDuration: number; // minutes
}

/**
 * Interface for schedule generation options.
 */
export interface ScheduleOptions {
  startDate: Date;
  startTime?: string; // HH:MM format, default "09:00"
  matchDuration?: number; // minutes per match, default 90
  breakTime?: number; // minutes between matches, default 15
  simultaneousMatches?: boolean; // allow parallel matches on different courts, default true
}

/**
 * ScheduleGenerationService provides automatic match scheduling algorithms.
 */
export class ScheduleGenerationService {
  /**
   * Generates  a schedule for unscheduled matches across available courts.
   *
   * @param matches - Array of matches to schedule (should be SCHEDULED status with no scheduledTime)
   * @param courts - Available courts for the tournament
   * @param options - Scheduling options (start date, times, durations)
   * @returns Array of scheduled match assignments
   */
  public generateSchedule(
    matches: Match[],
    courts: Court[],
    options: ScheduleOptions
  ): ScheduledMatch[] {
    const {
      startDate,
      startTime = '09:00',
      matchDuration = 90,
      breakTime = 15,
      simultaneousMatches = true,
    } = options;

    if (matches.length === 0) {
      return [];
    }

    if (courts.length === 0) {
      throw new Error('No courts available for scheduling');
    }

    const scheduledMatches: ScheduledMatch[] = [];
    
    // Parse start time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const baseDate = new Date(startDate);
    baseDate.setHours(startHour, startMinute, 0, 0);

    // Track next available time for each court
    // FR5 Fix: Initialize each court at the LATER of (startTime, court.openingTime)
    const courtAvailability = new Map<string, Date>();
    for (const court of courts) {
      const courtStartTime = new Date(baseDate);
      
      // If court has operating hours, start at opening time if it's after the general start time
      if (court.openingTime) {
        const [courtOpenHour, courtOpenMinute] = court.openingTime.split(':').map(Number);
        const courtOpenMinutes = courtOpenHour * 60 + courtOpenMinute;
        const baseMinutes = startHour * 60 + startMinute;
        
        // Use the later of the two times
        if (courtOpenMinutes > baseMinutes) {
          courtStartTime.setHours(courtOpenHour, courtOpenMinute, 0, 0);
        }
      }
      
      courtAvailability.set(court.id, courtStartTime);
    }

    // Sort matches by round (earlier rounds first) for logical progression
    const sortedMatches = [...matches].sort((a, b) => {
      if (a.round !== b.round) {
        return a.round - b.round;
      }
      return a.matchNumber - b.matchNumber;
    });

    if (simultaneousMatches) {
      // Strategy 1: Distribute matches across all courts simultaneously
      // FR5 Fix: Prioritize courts by earliest availability when courts have different hours
      for (const match of sortedMatches) {
        let assigned = false;
        let retryAttempts = 0;
        const maxRetries = 7; // Allow up to a week of attempts
        
        while (!assigned && retryAttempts <= maxRetries) {
          // Find court with earliest available time that can fit this match
          let bestCourt: Court | null = null;
          let bestTime: Date | null = null;
          
          for (const court of courts) {
            const nextAvailableTime = courtAvailability.get(court.id)!;
            
            // Check if match fits within court operating hours
            if (this.isWithinCourtHours(court, nextAvailableTime, matchDuration)) {
              // Use this court if it's the earliest available
              if (!bestTime || nextAvailableTime < bestTime) {
                bestTime = nextAvailableTime;
                bestCourt = court;
              }
            }
          }
          
          if (bestCourt && bestTime) {
            scheduledMatches.push({
              matchId: match.id,
              courtId: bestCourt.id,
              courtName: bestCourt.name,
              scheduledTime: new Date(bestTime),
              estimatedDuration: matchDuration,
            });

            // Update court availability (add match duration + break time)
            const newAvailableTime = new Date(bestTime);
            newAvailableTime.setMinutes(newAvailableTime.getMinutes() + matchDuration + breakTime);
            courtAvailability.set(bestCourt.id, newAvailableTime);

            assigned = true;
          } else {
            // No court available - advance all courts to next day and retry
            for (const court of courts) {
              const currentTime = courtAvailability.get(court.id)!;
              const nextDay = this.advanceToNextDay(court, currentTime, startHour, startMinute);
              courtAvailability.set(court.id, nextDay);
            }
            retryAttempts++;
          }
        }
      }
    } else {
      // Strategy 2: Sequential scheduling (one match at a time across all courts)
      for (const match of sortedMatches) {
        // Find earliest available court that respects operating hours
        let earliestCourt: Court | null = null;
        let earliestTime: Date | null = null;

        for (const court of courts) {
          const courtTime = courtAvailability.get(court.id)!;
          
          // Check if court can accommodate match at this time
          if (this.isWithinCourtHours(court, courtTime, matchDuration)) {
            if (!earliestTime || courtTime < earliestTime) {
              earliestTime = courtTime;
              earliestCourt = court;
            }
          }
        }

        // If no court available within hours, move all courts to next day
        if (!earliestCourt || !earliestTime) {
          for (const court of courts) {
            const currentTime = courtAvailability.get(court.id)!;
            const nextDay = this.advanceToNextDay(court, currentTime, startHour, startMinute);
            courtAvailability.set(court.id, nextDay);
          }
          
          // Retry finding earliest court for this match
          for (const court of courts) {
            const courtTime = courtAvailability.get(court.id)!;
            
            if (this.isWithinCourtHours(court, courtTime, matchDuration)) {
              if (!earliestTime || courtTime < earliestTime) {
                earliestTime = courtTime;
                earliestCourt = court;
              }
            }
          }
        }

        if (earliestCourt && earliestTime) {
          scheduledMatches.push({
            matchId: match.id,
            courtId: earliestCourt.id,
            courtName: earliestCourt.name,
            scheduledTime: new Date(earliestTime),
            estimatedDuration: matchDuration,
          });

          // Update court availability
          const newAvailableTime = new Date(earliestTime);
          newAvailableTime.setMinutes(newAvailableTime.getMinutes() + matchDuration + breakTime);
          courtAvailability.set(earliestCourt.id, newAvailableTime);
        }
      }
    }

    return scheduledMatches;
  }

  /**
   * Checks if a proposed schedule has time conflicts.
   *
   * @param schedule - Array of scheduled matches to check
   * @returns Array of conflict descriptions, empty if no conflicts
   */
  public detectConflicts(schedule: ScheduledMatch[]): string[] {
    const conflicts: string[] = [];

    // Group by court
    const byCourt = new Map<string, ScheduledMatch[]>();
    for (const scheduled of schedule) {
      const courtMatches = byCourt.get(scheduled.courtId) || [];
      courtMatches.push(scheduled);
      byCourt.set(scheduled.courtId, courtMatches);
    }

    // Check for overlapping matches on same court
    for (const [courtId, courtMatches] of byCourt) {
      // Sort by time
      const sorted = [...courtMatches].sort((a, b) => 
        a.scheduledTime.getTime() - b.scheduledTime.getTime()
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        const currentEnd = new Date(current.scheduledTime);
        currentEnd.setMinutes(currentEnd.getMinutes() + current.estimatedDuration);

        if (currentEnd > next.scheduledTime) {
          conflicts.push(
            `Conflict on court ${current.courtName}: ` +
            `Match ${current.matchId} (ends ${currentEnd.toISOString()}) ` +
            `overlaps with Match ${next.matchId} (starts ${next.scheduledTime.toISOString()})`
          );
        }
      }
    }

    return conflicts;
  }

  /**
   * Validates if a new time slot is available for a specific match and court.
   * Enforces overlap prevention, minimum break time between matches, and court operating hours (FR5).
   *
   * @param matchId - Match ID to reschedule
   * @param courtId - Court ID for the match
   * @param court - Court entity with operating hours
   * @param proposedTime - Proposed new scheduled time
   * @param duration - Match duration in minutes
   * @param existingSchedule - Current schedule to check against
   * @param breakTime - Minimum break time required between matches in minutes (default: 15)
   * @returns true if slot is available, false if conflict exists
   */
  public isTimeSlotAvailable(
    matchId: string,
    courtId: string,
    court: Court,
    proposedTime: Date,
    duration: number,
    existingSchedule: ScheduledMatch[],
    breakTime: number = 15
  ): boolean {
    // FR5: Check if match fits within court operating hours
    if (!this.isWithinCourtHours(court, proposedTime, duration)) {
      return false;
    }

    const proposedEnd = new Date(proposedTime);
    proposedEnd.setMinutes(proposedEnd.getMinutes() + duration);

    // Check against all matches on the same court (excluding the match being rescheduled)
    const courtMatches = existingSchedule.filter(
      sm => sm.courtId === courtId && sm.matchId !== matchId
    );

    for (const existing of courtMatches) {
      const existingEnd = new Date(existing.scheduledTime);
      existingEnd.setMinutes(existingEnd.getMinutes() + existing.estimatedDuration);

      // Check for direct overlap
      const hasOverlap = (
        (proposedTime >= existing.scheduledTime && proposedTime < existingEnd) ||
        (proposedEnd > existing.scheduledTime && proposedEnd <= existingEnd) ||
        (proposedTime <= existing.scheduledTime && proposedEnd >= existingEnd)
      );

      if (hasOverlap) {
        return false;
      }

      // Check for break time violation
      // If proposed match starts after existing match ends
      if (proposedTime >= existingEnd) {
        const timeSinceExistingEnd = (proposedTime.getTime() - existingEnd.getTime()) / 1000 / 60;
        if (timeSinceExistingEnd < breakTime) {
          return false; // Insufficient break time after existing match
        }
      }

      // If proposed match ends before existing match starts
      if (proposedEnd <= existing.scheduledTime) {
        const timeUntilExistingStart = (existing.scheduledTime.getTime() - proposedEnd.getTime()) / 1000 / 60;
        if (timeUntilExistingStart < breakTime) {
          return false; // Insufficient break time before existing match
        }
      }
    }

    return true;
  }

  /**
   * Suggests the next available time slot for a match on a specific court.
   *
   * @param courtId - Court ID
   * @param duration - Match duration in minutes
   * @param existingSchedule - Current schedule
   * @param afterTime - Earliest time to consider (default: now)
   * @returns Next available start time
   */
  public suggestNextAvailableSlot(
    courtId: string,
    duration: number,
    existingSchedule: ScheduledMatch[],
    afterTime: Date = new Date()
  ): Date {
    const courtMatches = existingSchedule
      .filter(sm => sm.courtId === courtId)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

    let candidateTime = new Date(afterTime);

    // Try each time slot after matches
    for (const existing of courtMatches) {
      if (candidateTime < existing.scheduledTime) {
        // Check if there's enough space before this match
        const spaceEnd = new Date(candidateTime);
        spaceEnd.setMinutes(spaceEnd.getMinutes() + duration);
        
        if (spaceEnd <= existing.scheduledTime) {
          return candidateTime;
        }
      }

      // Move candidate to end of this match + 15 min break
      const matchEnd = new Date(existing.scheduledTime);
      matchEnd.setMinutes(matchEnd.getMinutes() + existing.estimatedDuration + 15);
      
      if (matchEnd > candidateTime) {
        candidateTime = matchEnd;
      }
    }

    return candidateTime;
  }

  /**
   * Advances a court's availability to the next day at its opening time.
   * FR5: Respects individual court opening times when moving to next day.
   *
   * @param court - Court entity with optional openingTime
   * @param currentTime - Current availability time for the court
   * @param defaultStartHour - Default hour to use if court has no opening time
   * @param defaultStartMinute - Default minute to use if court has no opening time
   * @returns New date set to next day at court's opening time (or default time)
   */
  private advanceToNextDay(
    court: Court,
    currentTime: Date,
    defaultStartHour: number,
    defaultStartMinute: number
  ): Date {
    const nextDay = new Date(currentTime);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // If court has opening time, use it; otherwise use default start time
    if (court.openingTime) {
      const [openHour, openMinute] = court.openingTime.split(':').map(Number);
      nextDay.setHours(openHour, openMinute, 0, 0);
    } else {
      nextDay.setHours(defaultStartHour, defaultStartMinute, 0, 0);
    }
    
    return nextDay;
  }

  /**
   * Checks if a proposed match time (including duration) falls within court operating hours.
   * If court has no opening/closing times set, returns true (24-hour availability).
   *
   * @param court - Court entity with optional openingTime and closingTime
   * @param proposedTime - Proposed start time for the match
   * @param duration - Match duration in minutes
   * @returns true if match fits within court hours, false otherwise
   */
  private isWithinCourtHours(court: Court, proposedTime: Date, duration: number): boolean {
    // If court has no time restrictions, it's always available
    if (!court.openingTime || !court.closingTime) {
      return true;
    }

    // Extract time components from proposed time and match end
    const matchStart = new Date(proposedTime);
    const matchEnd = new Date(proposedTime);
    matchEnd.setMinutes(matchEnd.getMinutes() + duration);

    const startHour = matchStart.getHours();
    const startMinute = matchStart.getMinutes();
    const endHour = matchEnd.getHours();
    const endMinute = matchEnd.getMinutes();

    // Parse court opening/closing times (HH:MM format)
    const [openHour, openMinute] = court.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = court.closingTime.split(':').map(Number);

    // Convert to minutes since midnight for easier comparison
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    // Match must start at or after opening time and end at or before closing time
    return startMinutes >= openMinutes && endMinutes <= closeMinutes;
  }
}
