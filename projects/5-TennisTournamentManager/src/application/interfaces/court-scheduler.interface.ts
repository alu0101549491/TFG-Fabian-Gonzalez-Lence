/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/court-scheduler.interface.ts
 * @desc Interface for court scheduling strategies (Strategy Pattern)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Match} from '@domain/entities/match';
import {Court} from '@domain/entities/court';

/**
 * Scheduling configuration options.
 */
export interface SchedulingOptions {
  /** Tournament start time (e.g., 09:00). */
  readonly startTime: Date;
  /** Tournament end time (e.g., 21:00). */
  readonly endTime: Date;
  /** Estimated average match duration in minutes (default: 90). */
  readonly estimatedMatchDuration?: number;
  /** Minimum rest period between matches for same player in minutes (default: 120). */
  readonly minimumRestPeriod?: number;
  /** Phase priority map (phase name → priority level, higher = more important). */
  readonly phasePriorities?: Map<string, number>;
}

/**
 * Result of a scheduling operation.
 */
export interface SchedulingResult {
  /** Match ID. */
  readonly matchId: string;
  /** Assigned court ID. */
  readonly courtId: string;
  /** Scheduled start time. */
  readonly startTime: Date;
  /** Estimated end time. */
  readonly estimatedEndTime: Date;
  /** Court order (position in the court's schedule). */
  readonly courtOrder: number;
}

/**
 * Court scheduler interface.
 * Implements the Strategy Pattern for different scheduling algorithms.
 */
export interface ICourtScheduler {
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
  schedule(
    matches: Match[],
    courts: Court[],
    date: Date,
    options: SchedulingOptions
  ): Promise<SchedulingResult[]>;
}
