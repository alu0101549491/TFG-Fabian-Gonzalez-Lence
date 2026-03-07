/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/server.ts
 * @desc Main server entry point for the Cartographic Project Manager API
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import dotenv from 'dotenv';

dotenv.config();

function validateEnvironment(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtSecret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  if (!jwtRefreshSecret) {
    throw new Error('Missing required environment variable: JWT_REFRESH_SECRET');
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (nodeEnv === 'production' && !databaseUrl) {
    throw new Error('Missing required environment variable in production: DATABASE_URL');
  }

  const logLevel = process.env.LOG_LEVEL;
  if (logLevel) {
    const allowedLevels = new Set(['error', 'warn', 'info', 'debug']);
    if (!allowedLevels.has(logLevel)) {
      throw new Error(`Invalid LOG_LEVEL: ${logLevel}. Allowed: error, warn, info, debug`);
    }
  }
}

/**
 * Bootstrap and start the server
 */
async function bootstrap(): Promise<void> {
  try {
    validateEnvironment();

    const [{createServer}, {createApp}, {connectDatabase, disconnectDatabase}, {initializeSocketServer}, {initializeDeadlineReminder, initializeBackupScheduler}, {SERVER}, {logInfo, logError}] = await Promise.all([
      import('node:http'),
      import('./presentation/app.js'),
      import('./infrastructure/database/index.js'),
      import('./infrastructure/websocket/index.js'),
      import('./infrastructure/scheduler/index.js'),
      import('./shared/constants.js'),
      import('./shared/logger.js'),
    ]);

    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket server
    initializeSocketServer(httpServer);
    
    // Initialize deadline reminder scheduler
    initializeDeadlineReminder();
    
    // Initialize backup scheduler
    initializeBackupScheduler();

    // Start listening
    httpServer.listen(SERVER.PORT, () => {
      logInfo(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🗺️  Cartographic Project Manager API                         ║
║                                                                ║
║   🚀 Server running on port: ${SERVER.PORT}                    ║
║   📡 Environment: ${SERVER.NODE_ENV}                           ║
║   🔌 API Base: ${SERVER.API_PREFIX}                            ║
║   ⚡ WebSocket: Enabled                                         ║
║                                                                ║
║   📖 API Documentation: http://localhost:${SERVER.PORT}/       ║
║   ❤️  Health Check: ${SERVER.API_PREFIX}/health                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    let isShuttingDown = false;
    let forceShutdownTimeout: NodeJS.Timeout | undefined;

    const shutdown = async (signal: string): Promise<void> => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logInfo(`\n${signal} received. Shutting down gracefully...`);

      // Force shutdown after 10 seconds
      forceShutdownTimeout = setTimeout(() => {
        logError('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);

      try {
        await new Promise<void>((resolve, reject) => {
          httpServer.close((error?: Error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        });
        logInfo('HTTP server closed');
      } catch (error) {
        logError('HTTP server close error:', error as Error);
      }

      try {
        await disconnectDatabase();
      } catch (error) {
        logError('Database disconnect error:', error as Error);
      } finally {
        if (forceShutdownTimeout) {
          clearTimeout(forceShutdownTimeout);
        }
      }

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      logError('Uncaught Exception:', error);
      void shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      logError('Unhandled Rejection:', error);
      void shutdown('UNHANDLED_REJECTION');
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    // Logger may not be available if startup fails before imports
    process.stderr.write(`Failed to start server: ${err.stack || err.message}\n`);
    process.exit(1);
  }
}

// Start the server
bootstrap();
