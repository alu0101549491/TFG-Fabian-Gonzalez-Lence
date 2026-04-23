/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/dto/bracket.dto.ts
 * @desc Data transfer objects for bracket/draw-related operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {BracketType} from '@domain/enumerations/bracket-type';
import {MatchFormat} from '@domain/enumerations';

/** DTO for generating a bracket. */
export interface GenerateBracketDto {
  tournamentId: string;
  categoryId: string;
  bracketType: BracketType;
  matchFormat?: MatchFormat;
}

/** DTO for bracket output representation. */
export interface BracketDto {
  id: string;
  tournamentId: string;
  categoryId: string;
  bracketType: BracketType;
  size: number;
  totalRounds: number;
  structure: string;
  isPublished: boolean;
  createdAt: Date;
}

/** DTO for phase output representation. */
export interface PhaseDto {
  id: string;
  bracketId: string;
  name: string;
  order: number;
  matchCount: number;
  isCompleted: boolean;
}
