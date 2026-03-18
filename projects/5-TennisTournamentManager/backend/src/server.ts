/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file server.ts
 * @desc Main server entry point. Initializes database, Express app, and WebSocket server.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {createServer} from 'http';
import {config, validateConfig} from './shared/config';
import {initializeDatabase} from './infrastructure/database/data-source';
import {setupWebSocketServer} from './websocket-server';
import {createApp} from './app';
import {ImageOptimizationService} from './application/services/image-optimization.service';

/**
 * Starts the HTTP and WebSocket servers.
 */
async function startServer(): Promise<void> {
  try {
    // Validate environment configuration
    validateConfig();
    
    // Initialize database connection
    await initializeDatabase();
    
    // Ensure upload directories exist
    const imageService = new ImageOptimizationService();
    await imageService.ensureUploadDirectory();
    
    // Create Express app
    const app = createApp();
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize WebSocket server
    setupWebSocketServer(httpServer);
    
    // Start listening
    const PORT = config.port;
    httpServer.listen(PORT, () => {
      console.log('════════════════════════════════════════════════════════════');
      console.log(`🎾 Tennis Tournament Manager API`);
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log('════════════════════════════════════════════════════════════');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
