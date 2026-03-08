/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/middlewares/error-handler.middleware.ts
 * @desc Global error handler middleware
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {Request, Response, NextFunction} from 'express';
import {AppError, ValidationError} from '@shared/errors.js';
import {HTTP_STATUS, ERROR_MESSAGES} from '@shared/constants.js';
import {logError} from '@shared/logger.js';

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logError('Error occurred', error);

  if (error instanceof AppError) {
    const payload: {success: false; message: string; errors?: unknown} = {
      success: false,
      message: error.message,
    };

    if (error instanceof ValidationError) {
      payload.errors = error.errors;
    } else if (process.env.NODE_ENV === 'development' && 'errors' in error) {
      payload.errors = (error as {errors?: unknown}).errors;
    }

    res.status(error.statusCode).json(payload);
  } else {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
}
