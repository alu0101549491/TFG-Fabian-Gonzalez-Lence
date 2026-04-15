/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/middleware/index.ts
 * @desc Barrel export for all middleware functions.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

export {authMiddleware} from './auth.middleware';
export type {AuthRequest} from './auth.middleware';
export {roleMiddleware} from './role.middleware';
export {errorMiddleware, AppError} from './error.middleware';
export {validationMiddleware} from './validation.middleware';
