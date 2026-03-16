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

/** DTO for match output representation. */
export interface MatchDto {
  id: string;
  bracketId: string;
  phaseId: string;
  courtId: string | null;
  participant1Id: string;
  participant2Id: string;
  winnerId: string | null;
  status: MatchStatus;
  scheduledAt: Date | null;
  score?: string;
}

/** DTO for updating match status. */
export interface UpdateMatchStatusDto {
  matchId: string;
  status: MatchStatus;
}
