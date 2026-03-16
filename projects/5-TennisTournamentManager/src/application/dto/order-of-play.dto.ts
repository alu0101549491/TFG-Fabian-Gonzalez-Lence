/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file application/dto/order-of-play.dto.ts
 * @desc Data transfer objects for order-of-play operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/** DTO for creating an order-of-play entry. */
export interface CreateOrderOfPlayDto {
  tournamentId: string;
  matchId: string;
  courtId: string;
  scheduledDate: Date;
  startTime: Date;
  estimatedEndTime?: Date;
  courtOrder: number;
}

/** DTO for order-of-play output representation. */
export interface OrderOfPlayDto {
  id: string;
  tournamentId: string;
  matchId: string;
  courtId: string;
  courtName: string;
  participant1Name: string;
  participant2Name: string;
  scheduledDate: Date;
  startTime: Date;
  estimatedEndTime: Date | null;
  courtOrder: number;
  isPublished: boolean;
}
