/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file backend/src/shared/config/swagger.config.ts
 * @desc Swagger/OpenAPI configuration for REST API documentation (NFR11)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://swagger.io/specification/}
 */

import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI specification configuration
 * Documents all REST API endpoints with schemas, parameters, and examples
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tennis Tournament Manager API',
      version: '1.17.0',
      description: `
Comprehensive REST API for managing tennis tournaments with participant registration, 
draw generation, match scheduling, score recording, standings calculation, announcements, 
and multichannel notifications.

## Features
- 🔐 JWT-based authentication
- 👥 Role-based authorization (SYSTEM_ADMIN, TOURNAMENT_ADMIN, PLAYER)
- 🏆 Multiple simultaneous tournaments
- 📊 Real-time standings and rankings
- 📧 Multichannel notifications (Email, Telegram, Web Push)
- 💰 Payment processing
- 📈 Player statistics
- 🔔 Tournament announcements
- 📅 Order of play scheduling

## Version History
- v1.17.0: OpenAPI/Swagger documentation (NFR11)
- v1.16.0: Announcement system enhancements (FR47-FR49)
- v1.15.0: GDPR compliance features (NFR14)
- v1.14.0: Statistics enhancements (FR45-FR46)
- v1.13.0: Export functionality (FR61-FR63)
- v1.0.0: Initial release
      `,
      contact: {
        name: 'Fabián González Lence',
        email: 'alu0101549491@ull.edu.es',
        url: 'https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.tennistournament.app/api',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User profile management',
      },
      {
        name: 'Tournaments',
        description: 'Tournament CRUD operations',
      },
      {
        name: 'Categories',
        description: 'Tournament category management',
      },
      {
        name: 'Courts',
        description: 'Court management',
      },
      {
        name: 'Registrations',
        description: 'Participant registration and acceptance',
      },
      {
        name: 'Brackets',
        description: 'Draw/bracket generation and retrieval',
      },
      {
        name: 'Phases',
        description: 'Bracket phase management',
      },
      {
        name: 'Matches',
        description: 'Match scheduling and score recording',
      },
      {
        name: 'Standings',
        description: 'Category standings calculation',
      },
      {
        name: 'Rankings',
        description: 'Global player rankings',
      },
      {
        name: 'Order of Play',
        description: 'Daily match schedule',
      },
      {
        name: 'Notifications',
        description: 'User notification management',
      },
      {
        name: 'Announcements',
        description: 'Tournament announcements',
      },
      {
        name: 'Statistics',
        description: 'Player statistics',
      },
      {
        name: 'Payments',
        description: 'Registration payment processing',
      },
      {
        name: 'Sanctions',
        description: 'Participant sanctions',
      },
      {
        name: 'Health',
        description: 'API health check',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /auth/login endpoint',
        },
      },
      schemas: {
        // Authentication Schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@tennistournament.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Admin123!',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: {type: 'string', format: 'email', example: 'player@example.com'},
            password: {type: 'string', format: 'password', minLength: 8},
            firstName: {type: 'string', example: 'John'},
            lastName: {type: 'string', example: 'Doe'},
            role: {
              type: 'string',
              enum: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN', 'PLAYER'],
              default: 'PLAYER',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'},
            refreshToken: {type: 'string'},
            user: {$ref: '#/components/schemas/User'},
          },
        },
        
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: {type: 'string', example: 'USR-1234567890'},
            email: {type: 'string', format: 'email'},
            firstName: {type: 'string'},
            lastName: {type: 'string'},
            role: {type: 'string', enum: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN', 'PLAYER']},
            phoneNumber: {type: 'string', nullable: true},
            birthDate: {type: 'string', format: 'date', nullable: true},
            nationality: {type: 'string', nullable: true},
            createdAt: {type: 'string', format: 'date-time'},
            updatedAt: {type: 'string', format: 'date-time'},
          },
        },
        
        // Tournament Schemas
        Tournament: {
          type: 'object',
          properties: {
            id: {type: 'string', example: 'TRN-1234567890'},
            name: {type: 'string', example: 'Spring Open 2026'},
            description: {type: 'string'},
            location: {type: 'string', example: 'La Laguna Tennis Club'},
            startDate: {type: 'string', format: 'date'},
            endDate: {type: 'string', format: 'date'},
            registrationDeadline: {type: 'string', format: 'date-time'},
            status: {
              type: 'string',
              enum: ['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'FINALIZED', 'CANCELLED'],
            },
            maxParticipants: {type: 'integer', example: 128},
            organizerId: {type: 'string'},
            isPublic: {type: 'boolean', default: true},
            createdAt: {type: 'string', format: 'date-time'},
            updatedAt: {type: 'string', format: 'date-time'},
          },
        },
        
        // Registration Schemas
        Registration: {
          type: 'object',
          properties: {
            id: {type: 'string', example: 'REG-1234567890'},
            tournamentId: {type: 'string'},
            categoryId: {type: 'string'},
            userId: {type: 'string'},
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
            },
            acceptanceType: {
              type: 'string',
              enum: ['DIRECT_ACCEPTANCE', 'WILD_CARD', 'SEEDED', 'QUALIFIER'],
            },
            seedNumber: {type: 'integer', nullable: true},
            registeredAt: {type: 'string', format: 'date-time'},
          },
        },
        
        // Match Schemas
        Match: {
          type: 'object',
          properties: {
            id: {type: 'string', example: 'MAT-1234567890'},
            bracketId: {type: 'string'},
            phaseId: {type: 'string'},
            matchNumber: {type: 'integer'},
            player1Id: {type: 'string', nullable: true},
            player2Id: {type: 'string', nullable: true},
            winnerId: {type: 'string', nullable: true},
            status: {
              type: 'string',
              enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'WALKOVER', 'DEFAULTED', 'POSTPONED'],
            },
            courtId: {type: 'string', nullable: true},
            scheduledTime: {type: 'string', format: 'date-time', nullable: true},
            startTime: {type: 'string', format: 'date-time', nullable: true},
            endTime: {type: 'string', format: 'date-time', nullable: true},
          },
        },
        
        // Common Response Schemas
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {type: 'boolean', example: false},
            message: {type: 'string', example: 'Resource not found'},
            error: {type: 'string', example: 'NOT_FOUND'},
            details: {type: 'object', nullable: true},
          },
        },
        
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {type: 'boolean', example: true},
            message: {type: 'string', example: 'Operation completed successfully'},
            data: {type: 'object'},
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {$ref: '#/components/schemas/ErrorResponse'},
              example: {
                success: false,
                message: 'Authentication required',
                error: 'UNAUTHORIZED',
              },
            },
          },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {$ref: '#/components/schemas/ErrorResponse'},
              example: {
                success: false,
                message: 'Insufficient permissions to perform this action',
                error: 'FORBIDDEN',
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {$ref: '#/components/schemas/ErrorResponse'},
              example: {
                success: false,
                message: 'Resource not found',
                error: 'NOT_FOUND',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {$ref: '#/components/schemas/ErrorResponse'},
              example: {
                success: false,
                message: 'Validation failed',
                error: 'VALIDATION_ERROR',
                details: {field: 'email', message: 'Invalid email format'},
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to files containing JSDoc comments for API endpoints
  apis: ['./src/presentation/routes/**/*.ts', './src/presentation/controllers/**/*.ts'],
};

/**
 * Generate Swagger specification from JSDoc comments
 */
export const swaggerSpec = swaggerJsdoc(swaggerOptions);
