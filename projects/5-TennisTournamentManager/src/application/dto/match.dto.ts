/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/match.dto.ts
 * @desc Data transfer objects for match-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MatchStatus} from '@domain/enumerations/match-status';
import {SetScore} from '@domain/entities/score';

/** DTO for recording a match result. */
export interface RecordResultDto {
  matchId: string;
  winnerId: string;
  sets: SetScore[];
  isRetirement?: boolean;
  retiredParticipantId?: string;
}

/** User data for match participants. */
export interface MatchParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/** DTO for match output representation. */
export interface MatchDto {
  id: string;
  bracketId: string;
  phaseId: string;
  courtId: string | null;
  participant1Id: string | null;
  participant2Id: string | null;
  winnerId: string | null;
  status: MatchStatus;
  scheduledTime: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  score?: string;
  participant1?: MatchParticipant | null;
  participant2?: MatchParticipant | null;
  winner?: MatchParticipant | null;
}

/** DTO for updating match status. */
export interface UpdateMatchStatusDto {
  matchId: string;
  status: MatchStatus;
}
