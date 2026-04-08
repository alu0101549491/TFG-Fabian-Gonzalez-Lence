/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 7, 2026
 * @file backend/src/shared/logger.ts
 * @desc Centralized logging utility using Winston
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import winston from 'winston';
import {inspect} from 'node:util';
import {LOGGING, SERVER} from './constants.js';

function safeSerializeMetadata(metadata: Record<string, unknown>): string {
  if (!Object.keys(metadata).length) return '';

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return inspect(metadata, {depth: 5, breakLength: Infinity, compact: false});
  }
}

/**
 * Production log format with explicit error details
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  winston.format.errors({stack: true}),
  winston.format.printf((info) => {
    const {level, message, timestamp, error, ...metadata} = info as any;
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (error) {
      log += `\n  ERROR NAME: ${error.name || 'Unknown'}`;
      log += `\n  ERROR MESSAGE: ${error.message || 'No message'}`;
      if (error.code) log += `\n  ERROR CODE: ${error.code}`;
      if (error.stack) log += `\n  STACK TRACE:\n${error.stack}`;
    }
    
    if (Object.keys(metadata).length > 0) {
      log += `\n  METADATA: ${JSON.stringify(metadata, null, 2)}`;
    }
    
    return log;
  })
);

/**
 * Winston logger format configuration
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  winston.format.errors({stack: true}),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(
    ({level, message, timestamp, ...metadata}) =>
      `${timestamp} [${level}]: ${message} ${safeSerializeMetadata(metadata)}`
  )
);

/**
 * Winston logger instance
 */
export const logger = winston.createLogger({
  level: LOGGING.LEVEL,
  format: logFormat,
  defaultMeta: {service: 'cartographic-manager-api'},
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: LOGGING.FILE,
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

/**
 * Add console transport for production logs visibility
 * Cloud platforms (Render, etc.) capture stdout/stderr, not file logs
 */
logger.add(
  new winston.transports.Console({
    format: SERVER.NODE_ENV === 'production' ? productionFormat : consoleFormat,
  })
);

/**
 * Log info message
 *
 * @param message - Log message
 * @param meta - Additional metadata
 */
export function logInfo(message: string, meta?: object): void {
  logger.info(message, meta);
}

/**
 * Log error message
 *
 * @param message - Error message
 * @param error - Error object
 * @param meta - Additional metadata
 */
export function logError(
  message: string,
  error?: Error,
  meta?: object
): void {
  logger.error(message, {
    error: error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...(error as any),
        }
      : undefined,
    ...meta,
  });
}

/**
 * Log warning message
 *
 * @param message - Warning message
 * @param meta - Additional metadata
 */
export function logWarning(message: string, meta?: object): void {
  logger.warn(message, meta);
}

/**
 * Log debug message
 *
 * @param message - Debug message
 * @param meta - Additional metadata
 */
export function logDebug(message: string, meta?: object): void {
  logger.debug(message, meta);
}
