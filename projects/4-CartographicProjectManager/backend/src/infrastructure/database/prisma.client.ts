/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/infrastructure/database/prisma.client.ts
 * @desc Prisma client singleton instance for database operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Prisma, PrismaClient} from '@prisma/client';
import {logInfo, logError} from '@shared/logger.js';

/**
 * Prisma client instance
 */
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
    ...(IS_DEVELOPMENT
      ? [
          {
            emit: 'event',
            level: 'query',
          } as const,
        ]
      : []),
  ],
});

/**
 * Log query events in development
 */
if (IS_DEVELOPMENT) {
  prisma.$on('query', (event: Prisma.QueryEvent) => {
    logInfo('Prisma query executed', {
      durationMs: event.duration,
      target: event.target,
    });
  });
}

/**
 * Log error events
 */
prisma.$on('error', (event: Prisma.LogEvent) => {
  logError('Prisma error event', new Error(event.message));
});

/**
 * Log warn events
 */
prisma.$on('warn', (event: Prisma.LogEvent) => {
  logInfo('Prisma warning event', {message: event.message});
});

/**
 * Connect to database
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logInfo('✓ Database connected successfully');
  } catch (error) {
    logError('✗ Failed to connect to database', error as Error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logInfo('✓ Database disconnected successfully');
  } catch (error) {
    logError('✗ Failed to disconnect from database', error as Error);
    throw error;
  }
}

/**
 * Health check for database connection
 *
 * @returns True if database is healthy
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logError('Database health check failed', error as Error);
    return false;
  }
}
