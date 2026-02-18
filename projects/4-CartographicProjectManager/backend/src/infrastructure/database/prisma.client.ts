/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/infrastructure/database/prisma.client.ts
 * @desc Prisma client singleton instance for database operations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {PrismaClient} from '@prisma/client';
import {logInfo, logError} from '@shared/logger.js';

/**
 * Prisma client instance
 */
export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

/**
 * Log query events in development
 */
prisma.$on('query' as never, (e: {query: string; duration: number}) => {
  if (process.env.NODE_ENV === 'development') {
    logInfo(`Query: ${e.query} - Duration: ${e.duration}ms`);
  }
});

/**
 * Log error events
 */
prisma.$on('error' as never, (e: {message: string}) => {
  logError('Prisma error:', new Error(e.message));
});

/**
 * Log warn events
 */
prisma.$on('warn' as never, (e: {message: string}) => {
  logInfo(`Prisma warning: ${e.message}`);
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
