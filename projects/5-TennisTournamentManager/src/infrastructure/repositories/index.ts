/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file infrastructure/repositories/index.ts
 * @desc Barrel export for all repository implementations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

export {UserRepositoryImpl} from './user.repository';
export {TournamentRepositoryImpl} from './tournament.repository';
export {CategoryRepositoryImpl} from './category.repository';
export {CourtRepositoryImpl} from './court.repository';
export {RegistrationRepositoryImpl} from './registration.repository';
export {BracketRepositoryImpl} from './bracket.repository';
export {PhaseRepositoryImpl} from './phase.repository';
export {MatchRepositoryImpl} from './match.repository';
export {ScoreRepositoryImpl} from './score.repository';
export {StandingRepositoryImpl} from './standing.repository';
export {GlobalRankingRepositoryImpl} from './global-ranking.repository';
export {OrderOfPlayRepositoryImpl} from './order-of-play.repository';
export {NotificationRepositoryImpl} from './notification.repository';
export {AnnouncementRepositoryImpl} from './announcement.repository';
export {StatisticsRepositoryImpl} from './statistics.repository';
export {PaymentRepositoryImpl} from './payment.repository';
export {SanctionRepositoryImpl} from './sanction.repository';
