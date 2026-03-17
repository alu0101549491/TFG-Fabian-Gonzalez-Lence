/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file app.ts
 * @desc Express application configuration with middleware and routes.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import express, {Application} from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './presentation/routes';
import {errorMiddleware} from './presentation/middleware';
import {config} from './shared/config';

/**
 * Creates and configures the Express application.
 *
 * @returns Configured Express application instance
 */
export function createApp(): Application {
  const app = express();
  
  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));
  
  // Compression middleware
  app.use(compression());
  
  // Request logging
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  
  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);
  
  // API routes
  app.use('/api', routes);
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Tennis Tournament Manager API',
      version: '1.0.0',
      status: 'running',
    });
  });
  
  // Error handling middleware (must be last)
  app.use(errorMiddleware);
  
  return app;
}

export default createApp();
