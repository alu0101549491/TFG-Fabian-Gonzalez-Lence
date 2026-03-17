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
import {authMiddleware} from '../middleware/auth.middleware';
import {roleMiddleware} from '../middleware/role.middleware';
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

// Authentication routes
router.post('/auth/login', authController.login.bind(authController));
router.post('/auth/register', authController.register.bind(authController));
router.post('/auth/refresh', authController.refresh.bind(authController));
router.post('/auth/logout', authMiddleware, authController.logout.bind(authController));

// User routes
router.get('/users/:id', authMiddleware, userController.getById.bind(userController));
router.put('/users/:id', authMiddleware, userController.update.bind(userController));
router.get('/users', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), userController.getAll.bind(userController));

// Tournament routes
router.post('/tournaments', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), tournamentController.create.bind(tournamentController));
router.get('/tournaments/:id', tournamentController.getById.bind(tournamentController));
router.get('/tournaments', tournamentController.getAll.bind(tournamentController));
router.put('/tournaments/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), tournamentController.update.bind(tournamentController));
router.delete('/tournaments/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN]), tournamentController.delete.bind(tournamentController));

// Registration routes
router.post('/registrations', authMiddleware, registrationController.create.bind(registrationController));
router.get('/registrations', registrationController.getByTournament.bind(registrationController));
router.put('/registrations/:id/status', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), registrationController.updateStatus.bind(registrationController));

// Bracket routes
router.post('/brackets', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), bracketController.create.bind(bracketController));
router.get('/brackets/:id', bracketController.getById.bind(bracketController));
router.get('/brackets', bracketController.getByTournament.bind(bracketController));

// Match routes
router.get('/matches', matchController.getByBracket.bind(matchController));
router.get('/matches/:id', matchController.getById.bind(matchController));
router.put('/matches/:id', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]), matchController.update.bind(matchController));
router.post('/matches/:id/score', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]), matchController.submitScore.bind(matchController));

// Category routes
router.get('/categories', categoryController.getByTournament.bind(categoryController));

// Court routes
router.get('/courts', courtController.getByTournament.bind(courtController));

// Phase routes
router.get('/phases', phaseController.getByBracket.bind(phaseController));

// Standing routes
router.get('/standings', standingController.getByCategory.bind(standingController));

// Ranking routes
router.get('/rankings', rankingController.getAll.bind(rankingController));

// Order of Play routes
router.get('/order-of-play', orderOfPlayController.getByDate.bind(orderOfPlayController));

// Notification routes
router.get('/notifications', authMiddleware, notificationController.getByUser.bind(notificationController));
router.put('/notifications/:id/read', authMiddleware, notificationController.markAsRead.bind(notificationController));

// Announcement routes
router.post('/announcements', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN]), announcementController.create.bind(announcementController));
router.get('/announcements', announcementController.getByTournament.bind(announcementController));

// Statistics routes
router.get('/statistics', statisticsController.getByPlayer.bind(statisticsController));

// Payment routes
router.post('/payments', authMiddleware, paymentController.create.bind(paymentController));
router.get('/payments', authMiddleware, paymentController.getByUser.bind(paymentController));

// Sanction routes
router.post('/sanctions', authMiddleware, roleMiddleware([UserRole.SYSTEM_ADMIN, UserRole.TOURNAMENT_ADMIN, UserRole.REFEREE]), sanctionController.create.bind(sanctionController));
router.get('/sanctions', sanctionController.getByMatch.bind(sanctionController));

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({status: 'ok', timestamp: new Date().toISOString()});
});

export default router;
