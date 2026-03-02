/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file src/server.ts
 * @desc Main server entry point for the Cartographic Project Manager API
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import {createServer} from 'http';
import {createApp} from './presentation/app.js';
import {connectDatabase, disconnectDatabase} from './infrastructure/database/index.js';
import {initializeSocketServer} from './infrastructure/websocket/index.js';
import {initializeDeadlineReminder, initializeBackupScheduler} from './infrastructure/scheduler/index.js';
import {SERVER} from './shared/constants.js';
import {logInfo, logError} from './shared/logger.js';

/**
 * Bootstrap and start the server
 */
async function bootstrap(): Promise<void> {
  try {
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
    const shutdown = async (signal: string): Promise<void> => {
      logInfo(`\n${signal} received. Shutting down gracefully...`);
      
      httpServer.close(async () => {
        logInfo('HTTP server closed');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logError('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      logError('Uncaught Exception:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logError('Unhandled Rejection:', reason as Error);
      shutdown('UNHANDLED_REJECTION');
    });
  } catch (error) {
    logError('Failed to start server:', error as Error);
    process.exit(1);
  }
}

// Start the server
bootstrap();
