/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/middleware/error.middleware.ts
 * @desc Global error handling middleware.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Request, Response, NextFunction} from 'express';
import {ERROR_CODES, HTTP_STATUS} from '../../shared/constants';
import {AppError} from '../../shared/errors/app-error';

export {AppError} from '../../shared/errors/app-error';

/**
 * Global error handling middleware.
 * Catches all errors and sends consistent error responses.
 *
 * @param error - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function errorMiddleware(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('❌ [ERROR]', {
    method: req.method,
    path: req.path,
    error: error.message,
    stack: error.stack?.split('\n')[0],
  });
  
  if (error instanceof AppError) {
    console.error(`❌ AppError: ${error.statusCode} - ${error.errorCode} - ${error.message}`);
    res.status(error.statusCode).json({
      error: error.errorCode,
      message: error.message,
    });
    return;
  }
  
  // Handle database errors
  if (error.name === 'QueryFailedError') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_CODES.DATABASE_ERROR,
      message: 'Database operation failed.',
    });
    return;
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_CODES.VALIDATION_FAILED,
      message: error.message,
    });
    return;
  }
  
  // Default internal server error
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_CODES.INTERNAL_ERROR,
    message: 'An unexpected error occurred.',
  });
}
