/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/index.ts
 * @desc Barrel export for all TypeORM entities.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

export {User} from './user.entity';
export {Tournament} from './tournament.entity';
export {Category} from './category.entity';
export {Court} from './court.entity';
export {Registration} from './registration.entity';
export {Bracket} from './bracket.entity';
export {Phase} from './phase.entity';
export {Match} from './match.entity';
export {MatchResult} from './match-result.entity';
export {Score} from './score.entity';
export {Standing} from './standing.entity';
export {GlobalRanking} from './global-ranking.entity';
export {OrderOfPlay} from './order-of-play.entity';
export {Notification} from './notification.entity';
export {Announcement} from './announcement.entity';
export {Payment} from './payment.entity';
export {Sanction} from './sanction.entity';
export {Statistics} from './statistics.entity';
export {AuditLog} from './audit-log.entity';
