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
    const courtAvailability = new Map<string, Date>();
    for (const court of courts) {
      courtAvailability.set(court.id, new Date(baseDate));
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
      let courtIndex = 0;
      
      for (const match of sortedMatches) {
        // Round-robin assign court
        const court = courts[courtIndex % courts.length];
        const nextAvailableTime = courtAvailability.get(court.id)!;

        scheduledMatches.push({
          matchId: match.id,
          courtId: court.id,
          courtName: court.name,
          scheduledTime: new Date(nextAvailableTime),
          estimatedDuration: matchDuration,
        });

        // Update court availability (add match duration + break time)
        const newAvailableTime = new Date(nextAvailableTime);
        newAvailableTime.setMinutes(newAvailableTime.getMinutes() + matchDuration + breakTime);
        courtAvailability.set(court.id, newAvailableTime);

        courtIndex++;
      }
    } else {
      // Strategy 2: Sequential scheduling (one match at a time across all courts)
      for (const match of sortedMatches) {
        // Find earliest available court
        let earliestCourt: Court | null = null;
        let earliestTime: Date | null = null;

        for (const court of courts) {
          const courtTime = courtAvailability.get(court.id)!;
          if (!earliestTime || courtTime < earliestTime) {
            earliestTime = courtTime;
            earliestCourt = court;
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
   * Enforces both overlap prevention and minimum break time between matches.
   *
   * @param matchId - Match ID to reschedule
   * @param courtId - Court ID for the match
   * @param proposedTime - Proposed new scheduled time
   * @param duration - Match duration in minutes
   * @param existingSchedule - Current schedule to check against
   * @param breakTime - Minimum break time required between matches in minutes (default: 15)
   * @returns true if slot is available, false if conflict exists
   */
  public isTimeSlotAvailable(
    matchId: string,
    courtId: string,
    proposedTime: Date,
    duration: number,
    existingSchedule: ScheduledMatch[],
    breakTime: number = 15
  ): boolean {
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
}
