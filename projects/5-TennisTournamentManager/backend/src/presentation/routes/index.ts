/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/routes/index.ts
 * @desc Main router configuration combining all route modules.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Router} from 'express';
import {AuthController} from '../controllers/auth.controller';
import {UserController} from '../controllers/user.controller';
import {TournamentController} from '../controllers/tournament.controller';
import {RegistrationController} from '../controllers/registration.controller';
import {PartnerInvitationController} from '../controllers/partner-invitation.controller';
import {BracketController} from '../controllers/bracket.controller';
import {MatchController} from '../controllers/match.controller';
import {CategoryController} from '../controllers/category.controller';
import {CourtController} from '../controllers/court.controller';
import {PhaseController} from '../controllers/phase.controller';
import {StandingController} from '../controllers/standing.controller';
import {RankingController} from '../controllers/ranking.controller';
import {OrderOfPlayController} from '../controllers/order-of-play.controller';
import {NotificationController} from '../controllers/notification.controller';
import {NotificationPreferencesController} from '../controllers/notification-preferences.controller';
import {AnnouncementController} from '../controllers/announcement.controller';
import {StatisticsController} from '../controllers/statistics.controller';
import {PaymentController} from '../controllers/payment.controller';
import {SanctionController} from '../controllers/sanction.controller';
import {AuditLogController} from '../controllers/audit-log.controller';
import {ExportController} from '../controllers/export.controller';
import {authMiddleware, optionalAuthMiddleware} from '../middleware/auth.middleware';
import {adminMiddleware} from '../middleware/admin.middleware';
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
const partnerInvitationController = new PartnerInvitationController();
const bracketController = new BracketController();
const matchController = new MatchController();
const categoryController = new CategoryController();
const courtController = new CourtController();
const phaseController = new PhaseController();
const standingController = new StandingController();
const rankingController = new RankingController();
const orderOfPlayController = new OrderOfPlayController();
const notificationController = new NotificationController();
const notificationPreferencesController = new NotificationPreferencesController();
const announcementController = new AnnouncementController();
const statisticsController = new StatisticsController();
const paymentController = new PaymentController();
const sanctionController = new SanctionController();
const auditLogController = new AuditLogController();
const exportController = new ExportController();

/**
 * @swagger
 * /auth/login:

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
 * /users/eligible-participants:
 *   get:
 *     tags: [Users]
 *     summary: Get eligible participants for tournaments
 *     description: Get active PLAYER role users eligible for tournament registration (accessible to all authenticated users for partner search)
 *     parameters:
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: Search by name, username, or email
 *     responses:
 *       200:
 *         description: List of eligible participants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/users/eligible-participants', authMiddleware, apiCache(30), userController.getEligibleParticipants.bind(userController));

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

/**
 * @swagger
 * /users/{id}/public:
 *   get:
 *     tags: [Users]
 *     summary: Get public user info
 *     description: Get public user information (name, avatar) without authentication
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public user information
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
// Public endpoint for participant names in standings, brackets, etc.
router.get('/users/:id/public', apiCache(300), userController.getPublicInfo.bind(userController));

// User profile endpoint - optionally authenticated for privacy filtering (FR60)
// Unauthenticated users see public fields, authenticated users see more based on privacy settings
router.get('/users/:id', optionalAuthMiddleware, apiCache(300), userController.getById.bind(userController));

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
 * /users/{id}/privacy:
 *   put:
 *     tags: [Users]
 *     summary: Update user privacy settings
 *     description: Update privacy settings for a user (FR58). Users can only update their own settings unless they are a system admin.
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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [privacySettings]
 *             properties:
 *               privacySettings:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     enum: [PUBLIC, ALL_REGISTERED, TOURNAMENT_PARTICIPANTS, ADMINS_ONLY]
 *                   phone:
 *                     type: string
 *                     enum: [PUBLIC, ALL_REGISTERED, TOURNAMENT_PARTICIPANTS, ADMINS_ONLY]
 *                   telegram:
 *                     type: string
 *                     enum: [PUBLIC, ALL_REGISTERED, TOURNAMENT_PARTICIPANTS, ADMINS_ONLY]
 *                   whatsapp:
 *                     type: string
 *                     enum: [PUBLIC, ALL_REGISTERED, TOURNAMENT_PARTICIPANTS, ADMINS_ONLY]
 *                   avatar:
 *                     type: string
 *                     enum: [PUBLIC, ALL_REGISTERED, TOURNAMENT_PARTICIPANTS, ADMINS_ONLY]
 *                   ranking:
 *                     type: string
 *                     enum: [PUBLIC, ALL_REGISTERED, TOURNAMENT_PARTICIPANTS, ADMINS_ONLY]
 *                   history:
 *                     type: string
 *                     enum: [PUBLIC, ALL_REGISTERED, TOURNAMENT_PARTICIPANTS, ADMINS_ONLY]
 *                   statistics:
 *                     type: string
 *                     enum: [PUBLIC, ALL_REGISTERED, TOURNAMENT_PARTICIPANTS, ADMINS_ONLY]
 *                   allowContact:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Cannot update other users' privacy settings
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/users/:id/privacy', authMiddleware, userController.updatePrivacy.bind(userController));

/**
 * @swagger
 * /users/{id}/export:
 *   get:
 *     tags: [Users]
 *     summary: Export user data (GDPR compliance NFR14)
 *     description: Export all user data in JSON format for data portability
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/users/:id/export', authMiddleware, userController.exportUserData.bind(userController));

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
 * /tournaments/active:
 *   get:
 *     tags: [Tournaments]
 *     summary: Get active tournaments
 *     description: Retrieve all active tournaments (excludes cancelled and finalized tournaments)
 *     security: []
 *     responses:
 *       200:
 *         description: List of active tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 */
// Cache active tournaments list for 5 minutes
router.get('/tournaments/active', apiCache(300), tournamentController.getActive.bind(tournamentController));

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
router.post('/registrations/admin-enroll', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), registrationController.adminEnroll.bind(registrationController));
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
router.get('/registrations', optionalAuthMiddleware, registrationController.getByTournament.bind(registrationController));

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
router.get('/registrations/:id', optionalAuthMiddleware, registrationController.getById.bind(registrationController));

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
 *                 enum: [ACCEPTED, REJECTED, WITHDRAWN]
 *     responses:
 *       200:
 *         description: Status updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/registrations/:id/status', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.PLAYER]), registrationController.updateStatus.bind(registrationController));

/**
 * @swagger
 * /registrations/{id}/withdraw:
 *   post:
 *     tags: [Registrations]
 *     summary: Withdraw a registration (FR13)
 *     description: >
 *       Timing-aware withdrawal. Pre-draw promotes first ALT to DA.
 *       In-tournament promotes first ALT to LL and sets SCHEDULED matches to WALKOVER.
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
 *         description: Withdrawal successful with promotion details
 *       400:
 *         description: Already withdrawn or cancelled
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Registration not found
 */
router.post('/registrations/:id/withdraw', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.PLAYER]), registrationController.withdraw.bind(registrationController));

/**
 * @swagger
 * /registrations/{id}/partner:
 *   put:
 *     tags: [Registrations]
 *     summary: Update doubles partner (FR15)
 *     description: Sets or clears the doubles partner for a registration.
 *     security:
 *       - bearerAuth: []
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
 *               partnerId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Partner updated
 *       400:
 *         description: Self-pairing or invalid input
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Registration or partner not found
 */
router.put('/registrations/:id/partner', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), registrationController.updatePartner.bind(registrationController));

/**
 * @swagger
 * /registrations/{id}:
 *   put:
 *     tags: [Registrations]
 *     summary: Update registration (e.g., seed number)
 *     description: Update registration properties like seed number (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
 *     security:
 *       - bearerAuth: []
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
 *               seedNumber:
 *                 type: integer
 *                 nullable: true
 *                 description: Seed position (must be unique within category)
 *     responses:
 *       200:
 *         description: Registration updated successfully
 *       400:
 *         description: Invalid seed number or duplicate
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Registration not found
 */
router.put('/registrations/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), registrationController.update.bind(registrationController));

/**
 * @swagger
 * /registrations/{id}:
 *   delete:
 *     tags: [Registrations]
 *     summary: Delete a registration
 *     description: Permanently deletes a registration record. Only for rejected or withdrawn entries.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Registration deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Registration not found
 */
router.delete('/registrations/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), registrationController.deleteRegistration.bind(registrationController));

/**
 * @swagger
 * /registrations/migrate-acceptance-types:
 *   post:
 *     tags: [Registrations]
 *     summary: Migrate acceptance types
 *     description: One-time migration to fix existing registrations without acceptanceType
 *     responses:
 *       200:
 *         description: Migration successful
 */
router.post('/registrations/migrate-acceptance-types', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), registrationController.migrateAcceptanceTypes.bind(registrationController));

// ────────────────────────────────────────────────────────────────────────────────
// Partner Invitation Routes (FR15 - Doubles Partner Invitation System)
// ────────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /partner-invitations/send:
 *   post:
 *     tags: [Partner Invitations]
 *     summary: Send partner invitation (FR15)
 *     description: Send an invitation to another player to be doubles partners
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [inviteeId, tournamentId, categoryId]
 *             properties:
 *               inviteeId:
 *                 type: string
 *               tournamentId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/partner-invitations/send', authMiddleware, partnerInvitationController.sendInvitation.bind(partnerInvitationController));

/**
 * @swagger
 * /partner-invitations/my-invitations:
 *   get:
 *     tags: [Partner Invitations]
 *     summary: Get all invitations for current user
 *     description: Get both sent and received invitations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invitations
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/partner-invitations/my-invitations', authMiddleware, partnerInvitationController.getMyInvitations.bind(partnerInvitationController));

/**
 * @swagger
 * /partner-invitations/pending:
 *   get:
 *     tags: [Partner Invitations]
 *     summary: Get pending invitations for current user
 *     description: Get invitations where current user is invitee and status is PENDING
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending invitations
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/partner-invitations/pending', authMiddleware, partnerInvitationController.getPendingInvitations.bind(partnerInvitationController));

/**
 * @swagger
 * /partner-invitations/{id}:
 *   get:
 *     tags: [Partner Invitations]
 *     summary: Get invitation by ID
 *     description: Get single invitation with full details
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
 *         description: Invitation details
 *       404:
 *         description: Invitation not found
 */
router.get('/partner-invitations/:id', authMiddleware, partnerInvitationController.getInvitationById.bind(partnerInvitationController));

/**
 * @swagger
 * /partner-invitations/{id}/accept:
 *   post:
 *     tags: [Partner Invitations]
 *     summary: Accept partner invitation
 *     description: Accept invitation and create registrations for both players (PENDING admin approval)
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
 *         description: Invitation accepted, registrations created
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Invitation not found
 */
router.post('/partner-invitations/:id/accept', authMiddleware, partnerInvitationController.acceptInvitation.bind(partnerInvitationController));

/**
 * @swagger
 * /partner-invitations/{id}/decline:
 *   post:
 *     tags: [Partner Invitations]
 *     summary: Decline partner invitation
 *     description: Decline invitation (invitee only)
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
 *         description: Invitation declined
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Invitation not found
 */
router.post('/partner-invitations/:id/decline', authMiddleware, partnerInvitationController.declineInvitation.bind(partnerInvitationController));

/**
 * @swagger
 * /partner-invitations/{id}/cancel:
 *   post:
 *     tags: [Partner Invitations]
 *     summary: Cancel partner invitation
 *     description: Cancel invitation (inviter only, before acceptance)
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
 *         description: Invitation cancelled
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Invitation not found
 */
router.post('/partner-invitations/:id/cancel', authMiddleware, partnerInvitationController.cancelInvitation.bind(partnerInvitationController));

// GET /api/doubles-teams?tournamentId=xxx (FR16: fetch doubles pair records for a tournament)
router.get('/doubles-teams', optionalAuthMiddleware, partnerInvitationController.getDoublesTeamsByTournament.bind(partnerInvitationController));

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
 * /brackets/{id}:
 *   put:
 *     tags: [Brackets]
 *     summary: Update bracket
 *     description: Updates bracket information (e.g., publish, regenerate). Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bracket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublished:
 *                 type: boolean
 *               structure:
 *                 type: object
 *     responses:
 *       200:
 *         description: Updated bracket
 *       404:
 *         description: Bracket not found
 *       401:
 *         description: Unauthorized
 */
router.put('/brackets/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), bracketController.update.bind(bracketController));

/**
 * @swagger
 * /brackets/{id}/regenerate:
 *   post:
 *     tags: [Brackets]
 *     summary: Regenerate bracket with updated seeds
 *     description: Regenerates bracket structure using latest registration seeds. When keepResults=true, completed matches with compatible participant pairings are migrated to the regenerated bracket. (SYSTEM_ADMIN or TOURNAMENT_ADMIN)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keepResults:
 *                 type: boolean
 *                 description: Preserve compatible completed results during regeneration (default false)
 *     responses:
 *       200:
 *         description: Bracket regenerated successfully
 *       400:
 *         description: Invalid operation (e.g., published bracket)
 *       404:
 *         description: Bracket not found
 *       401:
 *         description: Unauthorized
 */
router.post('/brackets/:id/regenerate', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), bracketController.regenerate.bind(bracketController));

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
router.get('/matches', optionalAuthMiddleware, apiCache(120), matchController.getByBracket.bind(matchController));

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
router.get('/matches/:id', optionalAuthMiddleware, apiCache(120), matchController.getById.bind(matchController));

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
router.put('/matches/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), matchController.update.bind(matchController));

/**
 * @swagger
 * /matches/{id}/score:
 *   post:
 *     tags: [Matches]
 *     summary: Submit match score
 *     description: Record match score (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
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
router.post('/matches/:id/score', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), matchController.submitScore.bind(matchController));

/**
 * @swagger
 * /matches/{id}/result:
 *   post:
 *     tags: [Matches]
 *     summary: Submit match result as participant (FR24)
 *     description: Participant submits result which requires opponent confirmation
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
 *             required: [winnerId, setScores]
 *             properties:
 *               winnerId:
 *                 type: string
 *               setScores:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["6-4", "6-3"]
 *               player1Games:
 *                 type: integer
 *               player2Games:
 *                 type: integer
 *               playerComments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Result submitted (PENDING_CONFIRMATION)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: User is not a participant
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/matches/:id/result', authMiddleware, matchController.submitResultAsParticipant.bind(matchController));

/**
 * @swagger
 * /matches/{id}/result/confirm:
 *   post:
 *     tags: [Matches]
 *     summary: Confirm match result (FR25)
 *     description: Opponent confirms pending result, making it official
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Result confirmed successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized (not the opponent or trying to confirm own result)
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/matches/:id/result/confirm', authMiddleware, matchController.confirmResult.bind(matchController));

/**
 * @swagger
 * /matches/{id}/result/dispute:
 *   post:
 *     tags: [Matches]
 *     summary: Dispute match result (FR26)
 *     description: Opponent disputes pending result, requiring admin review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - disputeReason
 *             properties:
 *               disputeReason:
 *                 type: string
 *                 description: Reason for disputing the result
 *     responses:
 *       200:
 *         description: Result disputed successfully
 *       400:
 *         description: Missing dispute reason
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized (not the opponent or trying to dispute own result)
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/matches/:id/result/dispute', authMiddleware, matchController.disputeResult.bind(matchController));

/**
 * @swagger
 * /matches/{id}/suspend:
 *   post:
 *     tags: [Matches]
 *     summary: Suspend an in-progress match
 *     description: Suspends a match currently in progress due to weather, light, or other circumstances (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - suspensionReason
 *             properties:
 *               suspensionReason:
 *                 type: string
 *                 description: Reason for suspension (weather, light, time, etc.)
 *                 example: "Match suspended due to rain"
 *     responses:
 *       200:
 *         description: Match suspended successfully
 *       400:
 *         description: Invalid status or missing reason
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/matches/:id/suspend', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), matchController.suspendMatch.bind(matchController));

/**
 * @swagger
 * /matches/{id}/resume:
 *   post:
 *     tags: [Matches]
 *     summary: Resume a suspended match
 *     description: Resumes a previously suspended match, transitioning it back to IN_PROGRESS. Optionally reschedules the match to a new date/time (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *                 description: New scheduled date/time for the match (optional)
 *                 example: "2026-04-08T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Match resumed successfully
 *       400:
 *         description: Match is not in SUSPENDED status
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/matches/:id/resume', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), matchController.resumeMatch.bind(matchController));

/**
 * @swagger
 * /admin/matches/disputed:
 *   get:
 *     tags: [Admin]
 *     summary: Get all disputed match results (FR27)
 *     description: Retrieves all match results with DISPUTED status for admin review
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of disputed results with match details
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Admin access required
 */
router.get('/admin/matches/disputed', authMiddleware, adminMiddleware, matchController.getDisputedResults.bind(matchController));

/**
 * @swagger
 * /admin/matches/{id}/result/resolve:
 *   put:
 *     tags: [Admin]
 *     summary: Resolve disputed match result (FR27)
 *     description: Admin confirms or modifies disputed result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - winnerId
 *               - setScores
 *             properties:
 *               winnerId:
 *                 type: string
 *                 description: Winner participant ID
 *               setScores:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Set scores (e.g., ["6-4", "6-3"])
 *               resolutionNotes:
 *                 type: string
 *                 description: Admin notes explaining the resolution
 *     responses:
 *       200:
 *         description: Dispute resolved successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/admin/matches/:id/result/resolve', authMiddleware, adminMiddleware, matchController.resolveDispute.bind(matchController));

/**
 * @swagger
 * /admin/matches/{id}/result/annul:
 *   delete:
 *     tags: [Admin]
 *     summary: Annul disputed match result (FR27)
 *     description: Admin annuls disputed result and resets match
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - annulReason
 *             properties:
 *               annulReason:
 *                 type: string
 *                 description: Reason for annulling the result
 *     responses:
 *       200:
 *         description: Result annulled successfully
 *       400:
 *         description: Missing annul reason
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Admin access required
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/admin/matches/:id/result/annul', authMiddleware, adminMiddleware, matchController.annulResult.bind(matchController));

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
router.post('/courts', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), courtController.create.bind(courtController));
router.put('/courts/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), courtController.update.bind(courtController));
router.delete('/courts/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), courtController.delete.bind(courtController));

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
 * /phases/link:
 *   post:
 *     tags: [Phases]
 *     summary: Link two phases
 *     description: Link source phase to target phase in sequence (qualifying → main → consolation). Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourcePhaseId
 *               - targetPhaseId
 *             properties:
 *               sourcePhaseId:
 *                 type: string
 *                 description: ID of the source phase
 *               targetPhaseId:
 *                 type: string
 *                 description: ID of the target phase
 *     responses:
 *       200:
 *         description: Phases linked successfully
 *       400:
 *         description: Invalid input or cycle detected
 *       404:
 *         description: Phase not found
 */
router.post('/phases/link', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), phaseController.linkPhases.bind(phaseController));

/**
 * @swagger
 * /phases/advance-qualifiers:
 *   post:
 *     tags: [Phases]
 *     summary: Advance qualifiers
 *     description: Promote top N finishers from Round Robin to next phase. Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourcePhaseId
 *               - targetPhaseId
 *               - qualifierCount
 *               - tournamentId
 *               - categoryId
 *             properties:
 *               sourcePhaseId:
 *                 type: string
 *                 description: ID of the source phase (Round Robin)
 *               targetPhaseId:
 *                 type: string
 *                 description: ID of the target phase (knockout)
 *               qualifierCount:
 *                 type: number
 *                 description: Number of top qualifiers to advance
 *               tournamentId:
 *                 type: string
 *                 description: Tournament ID
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *     responses:
 *       201:
 *         description: Qualifiers advanced successfully
 *       400:
 *         description: Invalid input or source phase not completed
 *       404:
 *         description: Phase not found
 */
router.post('/phases/advance-qualifiers', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), phaseController.advanceQualifiers.bind(phaseController));

/**
 * @swagger
 * /phases/consolation:
 *   post:
 *     tags: [Phases]
 *     summary: Create consolation draw
 *     description: Create consolation draw for eliminated participants. Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mainPhaseId
 *               - tournamentId
 *               - categoryId
 *             properties:
 *               mainPhaseId:
 *                 type: string
 *                 description: ID of the main phase
 *               tournamentId:
 *                 type: string
 *                 description: Tournament ID
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               eliminationRound:
 *                 type: number
 *                 description: Round from which losers enter consolation (optional)
 *     responses:
 *       201:
 *         description: Consolation draw created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Main phase not found
 */
router.post('/phases/consolation', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), phaseController.createConsolationDraw.bind(phaseController));

/**
 * @swagger
 * /phases/populate-consolation:
 *   post:
 *     tags: [Phases]
 *     summary: Populate consolation draw
 *     description: Populate consolation draw with losers from main phase and generate matches. Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consolationPhaseId
 *               - tournamentId
 *               - categoryId
 *             properties:
 *               consolationPhaseId:
 *                 type: string
 *                 description: ID of the consolation phase
 *               tournamentId:
 *                 type: string
 *                 description: Tournament ID
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *     responses:
 *       200:
 *         description: Consolation draw populated successfully
 *       400:
 *         description: Invalid input or no completed matches found
 *       404:
 *         description: Consolation phase not found
 */
router.post('/phases/populate-consolation', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), phaseController.populateConsolationDraw.bind(phaseController));

/**
 * @swagger
 * /phases/promote-lucky-loser:
 *   post:
 *     tags: [Phases]
 *     summary: Promote Lucky Loser
 *     description: Promote first alternate to Lucky Loser when participant withdraws. Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - withdrawnParticipantId
 *               - phaseId
 *               - tournamentId
 *               - categoryId
 *             properties:
 *               withdrawnParticipantId:
 *                 type: string
 *                 description: ID of the withdrawn participant
 *               phaseId:
 *                 type: string
 *                 description: ID of the phase
 *               tournamentId:
 *                 type: string
 *                 description: Tournament ID
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *     responses:
 *       200:
 *         description: Lucky Loser promoted successfully
 *       404:
 *         description: Registration not found
 */
router.post('/phases/promote-lucky-loser', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), phaseController.promoteLuckyLoser.bind(phaseController));

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
// FR43: Admin endpoint to manually trigger standings recalculation for a bracket
router.post('/standings/recalculate', authMiddleware, standingController.recalculate.bind(standingController));

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
// FR44: Admin endpoint to trigger a full ELO ranking recalculation
router.post('/rankings/recalculate', authMiddleware, rankingController.recalculate.bind(rankingController));

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
router.get('/order-of-play/tournament/:tournamentId', orderOfPlayController.getByTournament.bind(orderOfPlayController));
router.get('/order-of-play/tournament/:tournamentId/scheduled-matches', orderOfPlayController.getScheduledMatches.bind(orderOfPlayController));
router.post('/order-of-play/generate', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), orderOfPlayController.generateSchedule.bind(orderOfPlayController));
router.post('/order-of-play/regenerate', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), orderOfPlayController.regenerateSchedule.bind(orderOfPlayController));
router.put('/order-of-play/:id/reschedule', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), orderOfPlayController.rescheduleMatch.bind(orderOfPlayController));
router.post('/order-of-play/:id/publish', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), orderOfPlayController.publishOrderOfPlay.bind(orderOfPlayController));
router.post('/order-of-play/tournament/:tournamentId/publish', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), orderOfPlayController.publishByTournament.bind(orderOfPlayController));

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
 * /notifications/mark-all-read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     description: Mark all unread notifications as read for the authenticated user
 *     responses:
 *       204:
 *         description: All notifications marked as read
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/notifications/mark-all-read', authMiddleware, notificationController.markAllAsRead.bind(notificationController));

/**
 * @swagger
 * /notifications/delete-all-read:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete all read notifications
 *     description: Delete all read notifications for the authenticated user
 *     responses:
 *       204:
 *         description: All read notifications deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/notifications/delete-all-read', authMiddleware, notificationController.deleteAllRead.bind(notificationController));

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 *     description: Delete a notification for the authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Notification deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/notifications/:id', authMiddleware, notificationController.delete.bind(notificationController));

/**
 * @swagger
 * /users/{userId}/notification-preferences:
 *   get:
 *     tags: [Notification Preferences]
 *     summary: Get notification preferences
 *     description: Get notification preferences for a user (user can only view their own)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification preferences
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden (can only view own preferences)
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/users/:userId/notification-preferences',
  authMiddleware,
  notificationPreferencesController.getByUserId.bind(notificationPreferencesController)
);

/**
 * @swagger
 * /users/{userId}/notification-preferences:
 *   put:
 *     tags: [Notification Preferences]
 *     summary: Update notification preferences
 *     description: Update notification preferences for a user (user can only update their own)
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               inAppEnabled:
 *                 type: boolean
 *               emailEnabled:
 *                 type: boolean
 *               telegramEnabled:
 *                 type: boolean
 *               webPushEnabled:
 *                 type: boolean
 *               matchScheduledEnabled:
 *                 type: boolean
 *               resultEnteredEnabled:
 *                 type: boolean
 *               orderOfPlayPublishedEnabled:
 *                 type: boolean
 *               announcementEnabled:
 *                 type: boolean
 *               registrationConfirmedEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden (can only update own preferences)
 */
router.put(
  '/users/:userId/notification-preferences',
  authMiddleware,
  notificationPreferencesController.update.bind(notificationPreferencesController)
);

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
 *             required: [tournamentId, title]
 *             properties:
 *               tournamentId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE]
 *               title:
 *                 type: string
 *               summary:
 *                 type: string
 *               longText:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPinned:
 *                 type: boolean
 *               scheduledPublishAt:
 *                 type: string
 *                 format: date-time
 *               expirationDate:
 *                 type: string
 *                 format: date-time
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
 *     description: Get announcements with optional filters (public endpoint, privacy enforced)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isPinned
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of announcements
 */
router.get('/announcements', optionalAuthMiddleware, announcementController.getAll.bind(announcementController));

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     tags: [Announcements]
 *     summary: Get announcement by ID
 *     description: Get single announcement (privacy enforced)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement details
 *       404:
 *         description: Not found
 */
router.get('/announcements/:id', optionalAuthMiddleware, announcementController.getById.bind(announcementController));

/**
 * @swagger
 * /announcements/{id}:
 *   put:
 *     tags: [Announcements]
 *     summary: Update announcement
 *     description: Update announcement (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Announcement updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Not found
 */
router.put('/announcements/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), announcementController.update.bind(announcementController));

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     tags: [Announcements]
 *     summary: Delete announcement
 *     description: Delete announcement (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Announcement deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Not found
 */
router.delete('/announcements/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), announcementController.delete.bind(announcementController));

/**
 * @swagger
 * /announcements/{id}/publish:
 *   post:
 *     tags: [Announcements]
 *     summary: Publish announcement
 *     description: Publish announcement and send notifications
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
 *         description: Announcement published
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Not found
 */
router.post('/announcements/:id/publish', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), announcementController.publish.bind(announcementController));

/**
 * @swagger
 * /statistics:
 *   get:
 *     tags: [Statistics]
 *     summary: Get player or tournament statistics
 *     description: Get statistics for a player, tournament, or both. At least one parameter required.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: playerId
 *         required: false
 *         schema:
 *           type: string
 *         description: Player ID to filter statistics
 *       - in: query
 *         name: tournamentId
 *         required: false
 *         schema:
 *           type: string
 *         description: Tournament ID to filter statistics
 *     responses:
 *       200:
 *         description: Player statistics
 *       400:
 *         description: Bad request - at least one parameter required
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
 *     description: Issue participant sanction (TOURNAMENT_ADMIN or SYSTEM_ADMIN)
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
router.post('/sanctions', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), sanctionController.create.bind(sanctionController));

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

// ============================================================================
// EXPORT ROUTES (FR61-FR63)
// ============================================================================

/**
 * @swagger
 * /export/tournament/{tournamentId}/itf:
 *   get:
 *     tags: [Export]
 *     summary: Export tournament in ITF CSV format
 *     description: Export tournament results in International Tennis Federation CSV format
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ITF CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       404:
 *         description: Tournament not found
 */
router.get('/export/tournament/:tournamentId/itf', authMiddleware, roleMiddleware([UserRole.TOURNAMENT_ADMIN, UserRole.SYSTEM_ADMIN]), exportController.exportToITF.bind(exportController));

/**
 * @swagger
 * /export/tournament/{tournamentId}/tods:
 *   get:
 *     tags: [Export]
 *     summary: Export tournament in TODS JSON format
 *     description: Export tournament data in Tennis Open Data Standards JSON format
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TODS JSON file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/export/tournament/:tournamentId/tods', authMiddleware, roleMiddleware([UserRole.TOURNAMENT_ADMIN, UserRole.SYSTEM_ADMIN]), exportController.exportToTODS.bind(exportController));

/**
 * @swagger
 * /export/tournament/{tournamentId}/pdf:
 *   get:
 *     tags: [Export]
 *     summary: Export tournament results as PDF
 *     description: Export tournament results as a formatted PDF document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF document
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/tournament/:tournamentId/pdf', authMiddleware, roleMiddleware([UserRole.TOURNAMENT_ADMIN, UserRole.SYSTEM_ADMIN]), exportController.exportResultsToPDF.bind(exportController));

/**
 * @swagger
 * /export/tournament/{tournamentId}/excel:
 *   get:
 *     tags: [Export]
 *     summary: Export tournament results as Excel
 *     description: Export tournament results as an Excel spreadsheet
 *     security:
 *       - bearerAuth: []\n *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/tournament/:tournamentId/excel', authMiddleware, roleMiddleware([UserRole.TOURNAMENT_ADMIN, UserRole.SYSTEM_ADMIN]), exportController.exportResultsToExcel.bind(exportController));

/**
 * @swagger
 * /export/bracket/{bracketId}/pdf:
 *   get:
 *     tags: [Export]
 *     summary: Export bracket as PDF
 *     description: Export bracket structure and matches as a PDF document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bracketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF document
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/bracket/:bracketId/pdf', authMiddleware, exportController.exportBracketToPDF.bind(exportController));

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
