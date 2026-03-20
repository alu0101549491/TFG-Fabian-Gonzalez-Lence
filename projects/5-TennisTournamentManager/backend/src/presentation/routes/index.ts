/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/routes/index.ts
 * @desc Main router configuration combining all route modules.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Router} from 'express';
import {AuthController} from '../controllers/auth.controller';
import {UserController} from '../controllers/user.controller';
import {TournamentController} from '../controllers/tournament.controller';
import {RegistrationController} from '../controllers/registration.controller';
import {BracketController} from '../controllers/bracket.controller';
import {MatchController} from '../controllers/match.controller';
import {CategoryController} from '../controllers/category.controller';
import {CourtController} from '../controllers/court.controller';
import {PhaseController} from '../controllers/phase.controller';
import {StandingController} from '../controllers/standing.controller';
import {RankingController} from '../controllers/ranking.controller';
import {OrderOfPlayController} from '../controllers/order-of-play.controller';
import {NotificationController} from '../controllers/notification.controller';
import {AnnouncementController} from '../controllers/announcement.controller';
import {StatisticsController} from '../controllers/statistics.controller';
import {PaymentController} from '../controllers/payment.controller';
import {SanctionController} from '../controllers/sanction.controller';
import {AuditLogController} from '../controllers/audit-log.controller';
import {authMiddleware} from '../middleware/auth.middleware';
import {roleMiddleware} from '../middleware/role.middleware';
import {uploadImage} from '../middlewares/upload.middleware';
import {apiCache, noCache} from '../middlewares/cache.middleware';
import {UserRole} from '../../domain/enumerations/user-role';

const router = Router();

// Controller instances
const authController = new AuthController();
const userController = new UserController();
const tournamentController = new TournamentController();
const registrationController = new RegistrationController();
const bracketController = new BracketController();
const matchController = new MatchController();
const categoryController = new CategoryController();
const courtController = new CourtController();
const phaseController = new PhaseController();
const standingController = new StandingController();
const rankingController = new RankingController();
const orderOfPlayController = new OrderOfPlayController();
const notificationController = new NotificationController();
const announcementController = new AnnouncementController();
const statisticsController = new StatisticsController();
const paymentController = new PaymentController();
const sanctionController = new SanctionController();
const auditLogController = new AuditLogController();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user with email and password, returns JWT tokens
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 */
// Authentication routes
router.post('/auth/login', authController.login.bind(authController));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: User registration
 *     description: Create a new user account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already exists
 */
// Authentication routes (no caching for auth endpoints)
router.post('/auth/login', noCache, authController.login.bind(authController));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: User registration
 *     description: Create a new user account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already exists
 */
router.post('/auth/register', noCache, authController.register.bind(authController));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Generate new JWT access token using refresh token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/auth/refresh', noCache, authController.refresh.bind(authController));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout current user (client-side token removal)
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/auth/logout', noCache, authMiddleware, authController.logout.bind(authController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Retrieve user profile details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// User routes - IMPORTANT: Keep specific routes before parameterized ones!

/**
 * @swagger
 * /users/stats:
 *   get:
 *     tags: [Users]
 *     summary: Get user statistics
 *     description: Get aggregated user statistics (SYSTEM_ADMIN only)
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Note: User management endpoints use shorter cache (30s) for admin operations
router.get('/users/stats', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), apiCache(30), userController.getStats.bind(userController));

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     description: Get all users (SYSTEM_ADMIN only)
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: Search in username, email, first name, last name
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/users', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), apiCache(30), userController.getAll.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Retrieve a user by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Cache user profiles for 5 minutes (public data)
router.get('/users/:id', authMiddleware, apiCache(300), userController.getById.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     description: Update user information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               nationality:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/users/:id', authMiddleware, userController.update.bind(userController));

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 *     description: Create a new user account (SYSTEM_ADMIN only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, firstName, lastName, password, role]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Username or email already exists
 */
router.post('/users', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), userController.create.bind(userController));

/**
 * @swagger
 * /users/{id}/admin:
 *   put:
 *     tags: [Users]
 *     summary: Update user (admin)
 *     description: Update any user field including role (SYSTEM_ADMIN only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/users/:id/admin', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), userController.updateByAdmin.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     description: Delete a user account (SYSTEM_ADMIN only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/users/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), userController.delete.bind(userController));

/**
 * @swagger
 * /users/{id}/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload user avatar
 *     description: Upload and optimize user profile picture (JPEG, PNG, GIF, WebP)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid image file or format
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/users/:id/avatar', authMiddleware, uploadImage, userController.uploadAvatar.bind(userController));

/**
 * @swagger
 * /users/{id}/avatar:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user avatar
 *     description: Remove user profile picture
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/users/:id/avatar', authMiddleware, userController.deleteAvatar.bind(userController));

/**
 * @swagger
 * /tournaments:
 *   post:
 *     tags: [Tournaments]
 *     summary: Create tournament
 *     description: Create a new tournament (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, startDate, endDate, location]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               registrationDeadline:
 *                 type: string
 *                 format: date-time
 *               maxParticipants:
 *                 type: integer
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Tournament created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Tournament routes
router.post('/tournaments', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), tournamentController.create.bind(tournamentController));

/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     tags: [Tournaments]
 *     summary: Get tournament details
 *     description: Retrieve tournament by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Cache tournament details for 5 minutes
router.get('/tournaments/:id', apiCache(300), tournamentController.getById.bind(tournamentController));

/**
 * @swagger
 * /tournaments:
 *   get:
 *     tags: [Tournaments]
 *     summary: List tournaments
 *     description: Get all tournaments with optional filters
 *     security: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by tournament status
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 */
// Cache tournament list for 5 minutes
router.get('/tournaments', apiCache(300), tournamentController.getAll.bind(tournamentController));

/**
 * @swagger
 * /tournaments/{id}:
 *   put:
 *     tags: [Tournaments]
 *     summary: Update tournament
 *     description: Update tournament details (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tournament updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/tournaments/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), tournamentController.update.bind(tournamentController));

/**
 * @swagger
 * /tournaments/{id}:
 *   delete:
 *     tags: [Tournaments]
 *     summary: Delete tournament
 *     description: Delete a tournament (SYSTEM_ADMIN only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tournament deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/tournaments/:id', authMiddleware, tournamentController.delete.bind(tournamentController));

/**
 * @swagger
 * /tournaments/{id}/status:
 *   put:
 *     tags: [Tournaments]
 *     summary: Update tournament status
 *     description: Update the status of a tournament (TOURNAMENT_ADMIN/SYSTEM_ADMIN or tournament organizer)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, REGISTRATION_OPEN, REGISTRATION_CLOSED, DRAW_PENDING, IN_PROGRESS, FINALIZED, CANCELLED]
 *     responses:
 *       200:
 *         description: Tournament status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/tournaments/:id/status', authMiddleware, tournamentController.updateStatus.bind(tournamentController));

/**
 * @swagger
 * /tournaments/{id}/logo:
 *   post:
 *     tags: [Tournaments]
 *     summary: Upload tournament logo
 *     description: Upload and optimize tournament logo image (JPEG, PNG, GIF, WebP)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB)
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *       400:
 *         description: Invalid image file or format
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/tournaments/:id/logo', authMiddleware, uploadImage, tournamentController.uploadLogo.bind(tournamentController));

/**
 * @swagger
 * /tournaments/{id}/logo:
 *   delete:
 *     tags: [Tournaments]
 *     summary: Delete tournament logo
 *     description: Remove tournament logo image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logo deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/tournaments/:id/logo', authMiddleware, tournamentController.deleteLogo.bind(tournamentController));

/**
 * @swagger
 * /registrations:
 *   post:
 *     tags: [Registrations]
 *     summary: Register for tournament
 *     description: Create a tournament registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tournamentId, categoryId]
 *             properties:
 *               tournamentId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registration'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Registration routes
router.post('/registrations', authMiddleware, registrationController.create.bind(registrationController));

/**
 * @swagger
 * /registrations:
 *   get:
 *     tags: [Registrations]
 *     summary: List registrations
 *     description: Get registrations for a tournament
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of registrations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Registration'
 */
router.get('/registrations', registrationController.getByTournament.bind(registrationController));

/**
 * @swagger
 * /registrations/{id}:
 *   get:
 *     tags: [Registrations]
 *     summary: Get registration by ID
 *     description: Get a single registration by its unique identifier
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registration found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registration'
 *       404:
 *         description: Registration not found
 */
router.get('/registrations/:id', registrationController.getById.bind(registrationController));

/**
 * @swagger
 * /registrations/{id}/status:
 *   put:
 *     tags: [Registrations]
 *     summary: Update registration status
 *     description: Accept/reject registration (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, REJECTED]
 *     responses:
 *       200:
 *         description: Status updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/registrations/:id/status', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), registrationController.updateStatus.bind(registrationController));

/**
 * @swagger
 * /brackets:
 *   post:
 *     tags: [Brackets]
 *     summary: Generate bracket
 *     description: Create tournament bracket/draw (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, bracketType]
 *             properties:
 *               categoryId:
 *                 type: string
 *               bracketType:
 *                 type: string
 *                 enum: [SINGLE_ELIMINATION, ROUND_ROBIN, MATCH_PLAY]
 *     responses:
 *       201:
 *         description: Bracket generated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Bracket routes
router.post('/brackets', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), bracketController.create.bind(bracketController));

/**
 * @swagger
 * /brackets/{id}:
 *   get:
 *     tags: [Brackets]
 *     summary: Get bracket details
 *     description: Retrieve bracket by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bracket details
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Cache bracket details for 5 minutes
router.get('/brackets/:id', apiCache(300), bracketController.getById.bind(bracketController));

/**
 * @swagger
 * /brackets:
 *   get:
 *     tags: [Brackets]
 *     summary: List brackets
 *     description: Get brackets for a tournament
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of brackets
 */
// Cache brackets list for 5 minutes
router.get('/brackets', apiCache(300), bracketController.getByTournament.bind(bracketController));

/**
 * @swagger
 * /matches:
 *   get:
 *     tags: [Matches]
 *     summary: List matches
 *     description: Get matches for a bracket
 *     security: []
 *     parameters:
 *       - in: query
 *         name: bracketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 */
// Match routes
// Cache matches list for 2 minutes (updates during active play)
router.get('/matches', apiCache(120), matchController.getByBracket.bind(matchController));

/**
 * @swagger
 * /matches/{id}:
 *   get:
 *     tags: [Matches]
 *     summary: Get match details
 *     description: Retrieve match by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Cache match details for 2 minutes (updates during active play)
router.get('/matches/:id', apiCache(120), matchController.getById.bind(matchController));

/**
 * @swagger
 * /matches/{id}:
 *   put:
 *     tags: [Matches]
 *     summary: Update match
 *     description: Update match details (REFEREE, TOURNAMENT_ADMIN, or SYSTEM_ADMIN)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courtId:
 *                 type: string
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Match updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/matches/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]), matchController.update.bind(matchController));

/**
 * @swagger
 * /matches/{id}/score:
 *   post:
 *     tags: [Matches]
 *     summary: Submit match score
 *     description: Record match score (REFEREE, TOURNAMENT_ADMIN, or SYSTEM_ADMIN)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [winnerId, scores]
 *             properties:
 *               winnerId:
 *                 type: string
 *               scores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     setNumber:
 *                       type: integer
 *                     player1Games:
 *                       type: integer
 *                     player2Games:
 *                       type: integer
 *                     tiebreakScore:
 *                       type: string
 *     responses:
 *       200:
 *         description: Score submitted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/matches/:id/score', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]), matchController.submitScore.bind(matchController));

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories
 *     description: Get categories for a tournament
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         required: true
 *         schema:
/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     description: Retrieve a single category by its unique identifier
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/categories/:id', apiCache(600), categoryController.getById.bind(categoryController));

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories
 *     description: Get categories for a tournament
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories
 */
// Category routes
// Cache categories for 10 minutes (rarely change)
router.get('/categories', apiCache(600), categoryController.getByTournament.bind(categoryController));
router.get('/categories/:id', apiCache(600), categoryController.getById.bind(categoryController));
router.post('/categories', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), categoryController.create.bind(categoryController));
router.delete('/categories/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), categoryController.delete.bind(categoryController));

/**
 * @swagger
 * /courts:
 *   get:
 *     tags: [Courts]
 *     summary: List courts
 *     description: Get courts for a tournament
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of courts
 */
// Court routes
// Cache courts for 10 minutes (rarely change)
router.get('/courts', apiCache(600), courtController.getByTournament.bind(courtController));

/**
 * @swagger
 * /phases:
 *   get:
 *     tags: [Phases]
 *     summary: List bracket phases
 *     description: Get phases for a bracket (e.g., Round of 16, Quarterfinals)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: bracketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of phases
 */
// Phase routes
// Cache phases for 5 minutes
router.get('/phases', apiCache(300), phaseController.getByBracket.bind(phaseController));

/**
 * @swagger
 * /standings:
 *   get:
 *     tags: [Standings]
 *     summary: Get standings
 *     description: Get standings for a category
 *     security: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category standings
 */
// Standing routes
// Cache standings for 2 minutes (updates after each match)
router.get('/standings', apiCache(120), standingController.getByCategory.bind(standingController));

/**
 * @swagger
 * /rankings:
 *   get:
 *     tags: [Rankings]
 *     summary: Get global rankings
 *     description: Get global player rankings (top 100)
 *     security: []
 *     responses:
 *       200:
 *         description: Global rankings
 */
// Ranking routes
// Cache rankings for 10 minutes (computed data, updated periodically)
router.get('/rankings', apiCache(600), rankingController.getAll.bind(rankingController));

/**
 * @swagger
 * /order-of-play:
 *   get:
 *     tags: [Order of Play]
 *     summary: Get daily schedule
 *     description: Get order of play for a specific date
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily match schedule
 */
// Order of Play routes
// Cache order of play for 5 minutes
router.get('/order-of-play', apiCache(300), orderOfPlayController.getByDate.bind(orderOfPlayController));

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     description: Get notifications for authenticated user
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Notification routes
router.get('/notifications', authMiddleware, notificationController.getByUser.bind(notificationController));

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     description: Mark a notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/notifications/:id/read', authMiddleware, notificationController.markAsRead.bind(notificationController));

/**
 * @swagger
 * /announcements:
 *   post:
 *     tags: [Announcements]
 *     summary: Create announcement
 *     description: Create tournament announcement (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tournamentId, title, content]
 *             properties:
 *               tournamentId:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Announcement created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Announcement routes
router.post('/announcements', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), announcementController.create.bind(announcementController));

/**
 * @swagger
 * /announcements:
 *   get:
 *     tags: [Announcements]
 *     summary: List announcements
 *     description: Get announcements for a tournament
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of announcements
 */
// Cache announcements for 5 minutes
router.get('/announcements', apiCache(300), announcementController.getByTournament.bind(announcementController));

/**
 * @swagger
 * /statistics:
 *   get:
 *     tags: [Statistics]
 *     summary: Get player statistics
 *     description: Get statistics for a player
 *     security: []
 *     parameters:
 *       - in: query
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: tournamentId
 *         schema:
 *           type: string
 *         description: Optional tournament filter
 *     responses:
 *       200:
 *         description: Player statistics
 */
// Statistics routes
// Cache statistics for 5 minutes (expensive calculations)
router.get('/statistics', apiCache(300), statisticsController.getByPlayer.bind(statisticsController));

/**
 * @swagger
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create payment
 *     description: Process registration payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [registrationId, amount, currency]
 *             properties:
 *               registrationId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Payment routes
router.post('/payments', authMiddleware, paymentController.create.bind(paymentController));

/**
 * @swagger
 * /payments:
 *   get:
 *     tags: [Payments]
 *     summary: List user payments
 *     description: Get payments for authenticated user
 *     responses:
 *       200:
 *         description: List of payments
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/payments', authMiddleware, paymentController.getByUser.bind(paymentController));

/**
 * @swagger
 * /sanctions:
 *   post:
 *     tags: [Sanctions]
 *     summary: Issue sanction
 *     description: Issue participant sanction (REFEREE, TOURNAMENT_ADMIN, or SYSTEM_ADMIN)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [matchId, playerId, type, reason]
 *             properties:
 *               matchId:
 *                 type: string
 *               playerId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [WARNING, POINT_DEDUCTION, GAME_PENALTY, DISQUALIFICATION]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sanction issued
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// Sanction routes
router.post('/sanctions', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]), sanctionController.create.bind(sanctionController));

/**
 * @swagger
 * /sanctions:
 *   get:
 *     tags: [Sanctions]
 *     summary: List sanctions
 *     description: Get sanctions for a match
 *     security: []
 *     parameters:
 *       - in: query
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sanctions
 */
router.get('/sanctions', sanctionController.getByMatch.bind(sanctionController));

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get audit logs with filters
 *     description: Retrieve audit logs with optional filtering (SYSTEM_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT, PASSWORD_CHANGE, ROLE_CHANGE, RESULT_SUBMIT, RESULT_CONFIRM, RESULT_DISPUTE, RESULT_VALIDATE, RESULT_ANNUL, SCORE_UPDATE, STATE_CHANGE, BRACKET_GENERATE, REGISTRATION_APPROVE, REGISTRATION_REJECT, STATUS_CHANGE, FINALIZE, PUBLISH, DATA_EXPORT, DATA_DELETE]
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *           enum: [USER, TOURNAMENT, MATCH, MATCH_RESULT, BRACKET, REGISTRATION, ANNOUNCEMENT, STANDING, ORDER_OF_PLAY, AUTHENTICATION, PERMISSION, GDPR]
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Audit logs retrieved with pagination
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/audit-logs', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), auditLogController.getAll.bind(auditLogController));

/**
 * @swagger
 * /audit-logs/stats:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get audit log statistics
 *     description: Retrieve summary statistics for audit logs (SYSTEM_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit log statistics
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/audit-logs/stats', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), auditLogController.getStatistics.bind(auditLogController));

/**
 * @swagger
 * /audit-logs/user/{userId}:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get audit logs for a specific user
 *     description: Retrieve all audit logs for a specific user (SYSTEM_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: User audit logs retrieved
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/audit-logs/user/:userId', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), auditLogController.getByUser.bind(auditLogController));

/**
 * @swagger
 * /audit-logs/action/{action}:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get audit logs by action type
 *     description: Retrieve all audit logs for a specific action (SYSTEM_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Action audit logs retrieved
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/audit-logs/action/:action', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), auditLogController.getByAction.bind(auditLogController));

/**
 * @swagger
 * /audit-logs/resource/{resourceType}/{resourceId}:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get audit logs for a specific resource
 *     description: Retrieve all audit logs for a specific resource (SYSTEM_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Resource audit logs retrieved
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/audit-logs/resource/:resourceType/:resourceId', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), auditLogController.getByResource.bind(auditLogController));

/**
 * @swagger
 * /audit-logs/{id}:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get a specific audit log by ID
 *     description: Retrieve a single audit log entry (SYSTEM_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log retrieved
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/audit-logs/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), auditLogController.getById.bind(auditLogController));

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: API health check
 *     description: Check if the API is running
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({status: 'ok', timestamp: new Date().toISOString()});
});

export default router;
