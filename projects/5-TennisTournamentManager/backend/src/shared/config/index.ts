/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file shared/config/index.ts
 * @desc Application configuration loader. Reads environment variables and validates required settings for database, JWT, server, and external services.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration object loaded from environment variables.
 * Contains settings for database, JWT, server, and external services.
 */
export const config = {
  /** Node environment (development, production, test) */
  nodeEnv: process.env.NODE_ENV || 'development',
  
  /** Server port number */
  port: parseInt(process.env.PORT || '3000', 10),
  
  /** Database configuration */
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'tennis_tournament_manager',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  
  /** JWT authentication configuration */
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  /** CORS configuration */
  corsOrigin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : (process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:5173']),
  
  /** Rate limiting configuration */
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  /** Image upload configuration */
  upload: {
    maxFileSizeMB: parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || '5', 10),
    allowedFormats: (process.env.UPLOAD_ALLOWED_FORMATS || 'jpg,jpeg,png,gif,webp').split(','),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    imageQuality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
  },
  
  /** CDN configuration for static assets (NFR21) */
  cdn: {
    enabled: process.env.CDN_ENABLED === 'true',
    baseUrl: process.env.CDN_BASE_URL || '',
  },
  
  /** Cache configuration for performance optimization */
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false', // Default enabled
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10), // 5 minutes default
    staticAssetsTtlDays: parseInt(process.env.STATIC_ASSETS_TTL_DAYS || '30', 10),
  },
  
  /** External services (optional) */
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    fromName: process.env.EMAIL_FROM_NAME || 'Tennis Tournament Manager',
    appUrl: process.env.APP_URL || 'http://localhost:4200',
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
  
  webPush: {
    publicKey: process.env.WEB_PUSH_PUBLIC_KEY,
    privateKey: process.env.WEB_PUSH_PRIVATE_KEY,
  },
  
  payment: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
} as const;

/**
 * Validates that all required environment variables are set.
 * Throws an error if any critical configuration is missing.
 */
export function validateConfig(): void {
  const requiredVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
  ];
  
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please create a .env file based on .env.example'
    );
  }
}
