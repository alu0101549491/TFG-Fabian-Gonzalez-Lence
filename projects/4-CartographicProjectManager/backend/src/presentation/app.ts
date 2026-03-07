/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file backend/src/presentation/app.ts
 * @desc Express application configuration and middleware setup
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {CORS, SERVER} from '@shared/constants.js';
import {apiRouter} from './routes/index.js';
import {errorHandler} from './middlewares/error-handler.middleware.js';

/**
 * Create and configure Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS middleware
  app.use(
    cors({
      origin: CORS.ORIGIN,
      credentials: CORS.CREDENTIALS,
    })
  );

  // Body parsing middleware
  app.use(express.json({limit: '10mb'}));
  app.use(express.urlencoded({extended: true, limit: '10mb'}));

  // Logging middleware
  app.use(morgan('dev'));

  // API routes
  app.use(SERVER.API_PREFIX, apiRouter);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Cartographic Project Manager API',
      version: SERVER.API_VERSION,
      endpoints: {
        auth: `${SERVER.API_PREFIX}/auth`,
        users: `${SERVER.API_PREFIX}/users`,
        projects: `${SERVER.API_PREFIX}/projects`,
        tasks: `${SERVER.API_PREFIX}/tasks`,
        messages: `${SERVER.API_PREFIX}/messages`,
        notifications: `${SERVER.API_PREFIX}/notifications`,
        files: `${SERVER.API_PREFIX}/files`,
        auditLogs: `${SERVER.API_PREFIX}/audit-logs`,
        export: `${SERVER.API_PREFIX}/export`,
        backup: `${SERVER.API_PREFIX}/backup`,
        health: `${SERVER.API_PREFIX}/health`,
      },
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
