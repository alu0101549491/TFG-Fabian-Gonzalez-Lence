/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/middleware/validation.middleware.ts
 * @desc Request validation middleware using class-validator.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Request, Response, NextFunction} from 'express';
import {validate, ValidationError} from 'class-validator';
import {plainToClass} from 'class-transformer';
import {ERROR_CODES, HTTP_STATUS} from '../../shared/constants';

/**
 * Validation middleware factory for request body validation.
 *
 * @param dtoClass - DTO class to validate against
 * @returns Express middleware function
 */
export function validationMiddleware<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dtoInstance = plainToClass(dtoClass, req.body);
    
    const errors: ValidationError[] = await validate(dtoInstance);
    
    if (errors.length > 0) {
      const formattedErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));
      
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_CODES.VALIDATION_FAILED,
        message: 'Request validation failed.',
        details: formattedErrors,
      });
      return;
    }
    
    req.body = dtoInstance;
    next();
  };
}
