# Respuesta

## Respuesta 1 (Planning)

## Respuesta 1 (Planning) {toggle="true"}
		```markdown
# CODIFICATION PROGRESS
# Tennis Tournament Manager (TENNIS)

_Last updated: 2026-03-17_  
_Agent: Claude Sonnet 4.5_

---

## SCOPE

**Codification Phase:** Categories 1–19 and 24 (production code + documentation)  
**Post-Codification Phase:** Categories 20–23 (all tests)

Tests will be implemented **after** all production code is complete and functional. This allows for comprehensive test coverage once the application behavior is fully defined and stable.

---

## OVERVIEW

| # | Category | Status | Files | Done |
|---|----------|--------|-------|------|
| 1 | Configuration & Tooling | ⬜ Pending | 9 | 0/9 |
| 2 | Styles | ⬜ Pending | 5 | 0/5 |
| 3 | Domain — Enumerations | ⬜ Pending | 13 | 0/13 |
| 4 | Domain — Entities | ⬜ Pending | 18 | 0/18 |
| 5 | Domain — Repository Interfaces | ⬜ Pending | 19 | 0/19 |
| 6 | Shared Utilities | ⬜ Pending | 3 | 0/3 |
| 7 | Application — DTOs | ⬜ Pending | 14 | 0/14 |
| 8 | Application — Service Interfaces | ⬜ Pending | 14 | 0/14 |
| 9 | Application — Service Implementations | ⬜ Pending | 17 | 0/17 |
| 10 | Infrastructure — HTTP & WebSocket | ⬜ Pending | 5 | 0/5 |
| 11 | Infrastructure — Repository Implementations | ⬜ Pending | 19 | 0/19 |
| 12 | Infrastructure — External Adapters | ⬜ Pending | 6 | 0/6 |
| 13 | Presentation — Angular Core | ⬜ Pending | 11 | 0/11 |
| 14 | Presentation — Auth Pages | ⬜ Pending | 3 | 0/3 |
| 15 | Presentation — Tournament Pages | ⬜ Pending | 3 | 0/3 |
| 16 | Presentation — Match & Bracket Pages | ⬜ Pending | 5 | 0/5 |
| 17 | Presentation — Standing & Ranking Pages | ⬜ Pending | 3 | 0/3 |
| 18 | Presentation — Profile & Admin Pages | ⬜ Pending | 3 | 0/3 |
| 19 | Presentation — Communication Pages | ⬜ Pending | 5 | 0/5 |
| 20 | Tests — Domain Unit Tests | 🔮 Deferred | 17 | — |
| 21 | Tests — Application Unit Tests | 🔮 Deferred | 13 | — |
| 22 | Tests — Integration Tests | 🔮 Deferred | TBD | — |
| 23 | Tests — E2E Tests | 🔮 Deferred | TBD | — |
| 24 | Documentation | ⬜ Pending | 3 | 0/3 |

**Codification Phase Total: 180 files** (excludes 30+ test files)  
**Post-Codification Total: 30+ test files** (to be implemented after production code)

Status legend: ⬜ Pending · 🔄 In Progress · ✅ Complete · ❌ Blocked · 🔮 Deferred (post-codification)

---

## CATEGORIES

### Category 1 — Configuration & Tooling
**Description:** Root configuration files for build, test, lint, and documentation tools.  
**Dependencies:** none  
**Status:** ⬜ Pending

#### Checklist
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `tsconfig.node.json`
- [ ] `vite.config.ts`
- [ ] `jest.config.js`
- [ ] `eslint.config.mjs`
- [ ] `typedoc.json`
- [ ] `playwright.config.ts`
- [ ] `.gitignore`

#### File list
| File path | Class / Symbol | Notes |
|-----------|----------------|-------|
| `package.json` | — | npm scripts, dependencies (Angular 19, Vite, Jest, Playwright) |
| `tsconfig.json` | — | Main TypeScript config with path aliases |
| `tsconfig.node.json` | — | Node-specific TS config for build tools |
| `vite.config.ts` | — | Vite build configuration |
| `jest.config.js` | — | Jest test runner config with ts-jest |
| `eslint.config.mjs` | — | ESLint rules (Google Style Guide) |
| `typedoc.json` | — | TypeDoc documentation generator config |
| `playwright.config.ts` | — | Playwright E2E test configuration |
| `.gitignore` | — | Git ignore patterns |

---

### Category 2 — Styles
**Description:** All CSS files providing global and component-level styling.  
**Dependencies:** none  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/styles/global.css`
- [ ] `src/styles/variables.css`
- [ ] `src/styles/reset.css`
- [ ] `src/styles/components.css`
- [ ] `src/styles/responsive.css`

#### File list
| File path | Scope | Notes |
|-----------|-------|-------|
| `src/styles/global.css` | Global | Base styles, typography, layout |
| `src/styles/variables.css` | Global | CSS custom properties (colors, spacing, typography) |
| `src/styles/reset.css` | Global | CSS reset/normalize |
| `src/styles/components.css` | Components | Shared component styles (buttons, cards, forms) |
| `src/styles/responsive.css` | Global | Responsive breakpoints and utilities |

---

### Category 3 — Domain — Enumerations
**Description:** Type-safe enumeration constants for domain states and types.  
**Dependencies:** none  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/domain/enumerations/index.ts`
- [ ] `src/domain/enumerations/acceptance-type.ts`
- [ ] `src/domain/enumerations/bracket-type.ts`
- [ ] `src/domain/enumerations/match-status.ts`
- [ ] `src/domain/enumerations/notification-channel.ts`
- [ ] `src/domain/enumerations/notification-type.ts`
- [ ] `src/domain/enumerations/payment-status.ts`
- [ ] `src/domain/enumerations/ranking-system.ts`
- [ ] `src/domain/enumerations/registration-status.ts`
- [ ] `src/domain/enumerations/sanction-type.ts`
- [ ] `src/domain/enumerations/surface.ts`
- [ ] `src/domain/enumerations/tournament-status.ts`
- [ ] `src/domain/enumerations/user-role.ts`

#### File list
| File path | Enum | Values |
|-----------|------|--------|
| `src/domain/enumerations/index.ts` | — | Barrel export |
| `src/domain/enumerations/acceptance-type.ts` | AcceptanceType | OA, DA, SE, JE, QU, LL, WC, ALT, WD |
| `src/domain/enumerations/bracket-type.ts` | BracketType | SINGLE_ELIMINATION, ROUND_ROBIN, MATCH_PLAY |
| `src/domain/enumerations/match-status.ts` | MatchStatus | TBP, IP, SUS, CO, RET, WO, ABN, BYE, NP, CAN, DEF, DR |
| `src/domain/enumerations/notification-channel.ts` | NotificationChannel | EMAIL, TELEGRAM, WEB_PUSH, IN_APP |
| `src/domain/enumerations/notification-type.ts` | NotificationType | REGISTRATION_CONFIRMED, MATCH_SCHEDULED, RESULT_ENTERED, etc. |
| `src/domain/enumerations/payment-status.ts` | PaymentStatus | PENDING, PAID, REFUNDED |
| `src/domain/enumerations/ranking-system.ts` | RankingSystem | POINTS_BASED, RATIO_BASED, ELO |
| `src/domain/enumerations/registration-status.ts` | RegistrationStatus | PENDING, ACCEPTED, WAITING_LIST, WITHDRAWN |
| `src/domain/enumerations/sanction-type.ts` | SanctionType | WARNING, POINT_DEDUCTION, EXCLUSION |
| `src/domain/enumerations/surface.ts` | Surface | HARD, CLAY, GRASS, INDOOR |
| `src/domain/enumerations/tournament-status.ts` | TournamentStatus | DRAFT, REGISTRATION_OPEN, IN_PROGRESS, FINALIZED |
| `src/domain/enumerations/user-role.ts` | UserRole | SYSTEM_ADMIN, TOURNAMENT_ADMIN, REGISTERED_PARTICIPANT, PUBLIC |

---

### Category 4 — Domain — Entities
**Description:** Core domain entities with business logic and invariants.  
**Dependencies:** Category 3 (Enumerations)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/domain/entities/index.ts`
- [ ] `src/domain/entities/user.ts`
- [ ] `src/domain/entities/tournament.ts`
- [ ] `src/domain/entities/category.ts`
- [ ] `src/domain/entities/court.ts`
- [ ] `src/domain/entities/registration.ts`
- [ ] `src/domain/entities/bracket.ts`
- [ ] `src/domain/entities/phase.ts`
- [ ] `src/domain/entities/match.ts`
- [ ] `src/domain/entities/score.ts`
- [ ] `src/domain/entities/standing.ts`
- [ ] `src/domain/entities/global-ranking.ts`
- [ ] `src/domain/entities/order-of-play.ts`
- [ ] `src/domain/entities/notification.ts`
- [ ] `src/domain/entities/announcement.ts`
- [ ] `src/domain/entities/statistics.ts`
- [ ] `src/domain/entities/payment.ts`
- [ ] `src/domain/entities/sanction.ts`

#### File list
| File path | Entity | Key Responsibilities |
|-----------|--------|---------------------|
| `src/domain/entities/index.ts` | — | Barrel export |
| `src/domain/entities/user.ts` | User | Authentication, permissions, profile, privacy settings |
| `src/domain/entities/tournament.ts` | Tournament | Tournament lifecycle, configuration, status management |
| `src/domain/entities/category.ts` | Category | Category definition, quota management |
| `src/domain/entities/court.ts` | Court | Court availability, scheduling |
| `src/domain/entities/registration.ts` | Registration | Participant registration, acceptance, withdrawal |
| `src/domain/entities/bracket.ts` | Bracket | Draw structure, generation, seeding |
| `src/domain/entities/phase.ts` | Phase | Tournament phase linking |
| `src/domain/entities/match.ts` | Match | Match lifecycle, result recording, state transitions |
| `src/domain/entities/score.ts` | Score | Score tracking, confirmation |
| `src/domain/entities/standing.ts` | Standing | Classification calculation |
| `src/domain/entities/global-ranking.ts` | GlobalRanking | Global ranking maintenance |
| `src/domain/entities/order-of-play.ts` | OrderOfPlay | Schedule publication, court assignment |
| `src/domain/entities/notification.ts` | Notification | Notification creation, delivery |
| `src/domain/entities/announcement.ts` | Announcement | Announcement publishing, tagging |
| `src/domain/entities/statistics.ts` | Statistics | Participant statistics |
| `src/domain/entities/payment.ts` | Payment | Payment processing |
| `src/domain/entities/sanction.ts` | Sanction | Disciplinary actions |

---

### Category 5 — Domain — Repository Interfaces
**Description:** Data access contracts following Repository pattern and Dependency Inversion Principle.  
**Dependencies:** Category 4 (Entities)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/domain/repositories/index.ts`
- [ ] `src/domain/repositories/user-repository.interface.ts`
- [ ] `src/domain/repositories/tournament-repository.interface.ts`
- [ ] `src/domain/repositories/category-repository.interface.ts`
- [ ] `src/domain/repositories/court-repository.interface.ts`
- [ ] `src/domain/repositories/registration-repository.interface.ts`
- [ ] `src/domain/repositories/bracket-repository.interface.ts`
- [ ] `src/domain/repositories/phase-repository.interface.ts`
- [ ] `src/domain/repositories/match-repository.interface.ts`
- [ ] `src/domain/repositories/score-repository.interface.ts`
- [ ] `src/domain/repositories/standing-repository.interface.ts`
- [ ] `src/domain/repositories/global-ranking-repository.interface.ts`
- [ ] `src/domain/repositories/order-of-play-repository.interface.ts`
- [ ] `src/domain/repositories/notification-repository.interface.ts`
- [ ] `src/domain/repositories/announcement-repository.interface.ts`
- [ ] `src/domain/repositories/statistics-repository.interface.ts`
- [ ] `src/domain/repositories/payment-repository.interface.ts`
- [ ] `src/domain/repositories/sanction-repository.interface.ts`
- [ ] `src/domain/index.ts`

#### File list
| File path | Interface | CRUD Methods |
|-----------|-----------|--------------|
| `src/domain/repositories/index.ts` | — | Barrel export |
| `src/domain/repositories/user-repository.interface.ts` | IUserRepository | findById, findByUsername, create, update, delete |
| `src/domain/repositories/tournament-repository.interface.ts` | ITournamentRepository | findById, findAll, create, update, delete |
| `src/domain/repositories/category-repository.interface.ts` | ICategoryRepository | findById, findByTournament, create, update, delete |
| `src/domain/repositories/court-repository.interface.ts` | ICourtRepository | findById, findByTournament, create, update, delete |
| `src/domain/repositories/registration-repository.interface.ts` | IRegistrationRepository | findById, findByTournament, create, update, delete |
| `src/domain/repositories/bracket-repository.interface.ts` | IBracketRepository | findById, findByTournament, create, update, delete |
| `src/domain/repositories/phase-repository.interface.ts` | IPhaseRepository | findById, findByTournament, create, update, delete |
| `src/domain/repositories/match-repository.interface.ts` | IMatchRepository | findById, findByBracket, create, update, delete |
| `src/domain/repositories/score-repository.interface.ts` | IScoreRepository | findById, findByMatch, create, update |
| `src/domain/repositories/standing-repository.interface.ts` | IStandingRepository | findById, findByBracket, create, update, delete |
| `src/domain/repositories/global-ranking-repository.interface.ts` | IGlobalRankingRepository | findById, findAll, create, update |
| `src/domain/repositories/order-of-play-repository.interface.ts` | IOrderOfPlayRepository | findById, findByTournament, create, update, delete |
| `src/domain/repositories/notification-repository.interface.ts` | INotificationRepository | findById, findByUser, create, markAsRead |
| `src/domain/repositories/announcement-repository.interface.ts` | IAnnouncementRepository | findById, findByTournament, create, update, delete |
| `src/domain/repositories/statistics-repository.interface.ts` | IStatisticsRepository | findById, findByParticipant, create, update |
| `src/domain/repositories/payment-repository.interface.ts` | IPaymentRepository | findById, findByRegistration, create, update |
| `src/domain/repositories/sanction-repository.interface.ts` | ISanctionRepository | findById, findByParticipant, create, update |
| `src/domain/index.ts` | — | Domain layer barrel export (entities, enums, repositories) |

---

### Category 6 — Shared Utilities
**Description:** Cross-cutting utilities and constants used across all layers.  
**Dependencies:** none  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/shared/index.ts`
- [ ] `src/shared/constants.ts`
- [ ] `src/shared/utils.ts`

#### File list
| File path | Symbol | Purpose |
|-----------|--------|---------|
| `src/shared/index.ts` | — | Barrel export |
| `src/shared/constants.ts` | — | Application-wide constants (API URLs, timeouts, limits) |
| `src/shared/utils.ts` | — | Pure utility functions (date formatting, validation helpers) |

---

### Category 7 — Application — DTOs
**Description:** Data Transfer Objects for layer communication and API contracts.  
**Dependencies:** Category 3 (Enumerations)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/application/dto/index.ts`
- [ ] `src/application/dto/common.dto.ts`
- [ ] `src/application/dto/user.dto.ts`
- [ ] `src/application/dto/tournament.dto.ts`
- [ ] `src/application/dto/registration.dto.ts`
- [ ] `src/application/dto/bracket.dto.ts`
- [ ] `src/application/dto/match.dto.ts`
- [ ] `src/application/dto/standing.dto.ts`
- [ ] `src/application/dto/ranking.dto.ts`
- [ ] `src/application/dto/order-of-play.dto.ts`
- [ ] `src/application/dto/notification.dto.ts`
- [ ] `src/application/dto/announcement.dto.ts`
- [ ] `src/application/dto/statistics.dto.ts`
- [ ] `src/application/dto/payment.dto.ts`

#### File list
| File path | DTO Classes | Purpose |
|-----------|-------------|---------|
| `src/application/dto/index.ts` | — | Barrel export |
| `src/application/dto/common.dto.ts` | PaginationDto, ErrorResponseDto | Common DTO patterns |
| `src/application/dto/user.dto.ts` | UserDto, CreateUserDto, UpdateUserDto, LoginDto | User operations |
| `src/application/dto/tournament.dto.ts` | TournamentDto, CreateTournamentDto, UpdateTournamentDto | Tournament operations |
| `src/application/dto/registration.dto.ts` | RegistrationDto, CreateRegistrationDto | Registration operations |
| `src/application/dto/bracket.dto.ts` | BracketDto, CreateBracketDto, BracketConfigDto | Bracket operations |
| `src/application/dto/match.dto.ts` | MatchDto, MatchResultDto, ScheduleMatchDto | Match operations |
| `src/application/dto/standing.dto.ts` | StandingDto, StandingEntryDto | Standing operations |
| `src/application/dto/ranking.dto.ts` | RankingDto, RankingEntryDto | Ranking operations |
| `src/application/dto/order-of-play.dto.ts` | OrderOfPlayDto, ScheduledMatchDto | Order of play operations |
| `src/application/dto/notification.dto.ts` | NotificationDto, NotificationPreferencesDto | Notification operations |
| `src/application/dto/announcement.dto.ts` | AnnouncementDto, CreateAnnouncementDto | Announcement operations |
| `src/application/dto/statistics.dto.ts` | StatisticsDto, ParticipantStatsDto | Statistics operations |
| `src/application/dto/payment.dto.ts` | PaymentDto, ProcessPaymentDto | Payment operations |

---

### Category 8 — Application — Service Interfaces
**Description:** Use case contracts defining business operations.  
**Dependencies:** Category 5 (Repository Interfaces), Category 7 (DTOs)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/application/interfaces/index.ts`
- [ ] `src/application/interfaces/authentication-service.interface.ts`
- [ ] `src/application/interfaces/authorization-service.interface.ts`
- [ ] `src/application/interfaces/tournament-service.interface.ts`
- [ ] `src/application/interfaces/registration-service.interface.ts`
- [ ] `src/application/interfaces/bracket-service.interface.ts`
- [ ] `src/application/interfaces/bracket-generator.interface.ts`
- [ ] `src/application/interfaces/match-service.interface.ts`
- [ ] `src/application/interfaces/standing-service.interface.ts`
- [ ] `src/application/interfaces/ranking-service.interface.ts`
- [ ] `src/application/interfaces/order-of-play-service.interface.ts`
- [ ] `src/application/interfaces/notification-service.interface.ts`
- [ ] `src/application/interfaces/statistics-service.interface.ts`
- [ ] `src/application/interfaces/payment-service.interface.ts`

#### File list
| File path | Interface | Key Methods |
|-----------|-----------|-------------|
| `src/application/interfaces/index.ts` | — | Barrel export |
| `src/application/interfaces/authentication-service.interface.ts` | IAuthenticationService | login, logout, validateToken |
| `src/application/interfaces/authorization-service.interface.ts` | IAuthorizationService | canAccessTournament, canModifyBracket |
| `src/application/interfaces/tournament-service.interface.ts` | ITournamentService | createTournament, finalizeTournament |
| `src/application/interfaces/registration-service.interface.ts` | IRegistrationService | registerParticipant, withdrawRegistration |
| `src/application/interfaces/bracket-service.interface.ts` | IBracketService | generateBracket, regenerateBracket |
| `src/application/interfaces/bracket-generator.interface.ts` | IBracketGenerator | generate (strategy interface) |
| `src/application/interfaces/match-service.interface.ts` | IMatchService | recordResult, confirmResult, scheduleMatch |
| `src/application/interfaces/standing-service.interface.ts` | IStandingService | updateStandings, calculateStandings |
| `src/application/interfaces/ranking-service.interface.ts` | IRankingService | updateGlobalRanking, calculateSeeds |
| `src/application/interfaces/order-of-play-service.interface.ts` | IOrderOfPlayService | publishOrderOfPlay, rescheduleMatch |
| `src/application/interfaces/notification-service.interface.ts` | INotificationService | sendNotification, markAsRead |
| `src/application/interfaces/statistics-service.interface.ts` | IStatisticsService | getParticipantStatistics, getTournamentStatistics |
| `src/application/interfaces/payment-service.interface.ts` | IPaymentService | processPayment, refundPayment |

---

### Category 9 — Application — Service Implementations
**Description:** Business logic orchestration implementing service contracts.  
**Dependencies:** Category 5 (Repository Interfaces), Category 7 (DTOs), Category 8 (Service Interfaces)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/application/services/index.ts`
- [ ] `src/application/services/common/errors.ts`
- [ ] `src/application/services/common/utils.ts`
- [ ] `src/application/services/authentication.service.ts`
- [ ] `src/application/services/authorization.service.ts`
- [ ] `src/application/services/tournament.service.ts`
- [ ] `src/application/services/registration.service.ts`
- [ ] `src/application/services/bracket.service.ts`
- [ ] `src/application/services/bracket-generator.factory.ts`
- [ ] `src/application/services/match.service.ts`
- [ ] `src/application/services/standing.service.ts`
- [ ] `src/application/services/ranking.service.ts`
- [ ] `src/application/services/order-of-play.service.ts`
- [ ] `src/application/services/notification.service.ts`
- [ ] `src/application/services/statistics.service.ts`
- [ ] `src/application/services/payment.service.ts`
- [ ] `src/application/index.ts`

#### File list
| File path | Class | Implements |
|-----------|-------|------------|
| `src/application/services/index.ts` | — | Barrel export |
| `src/application/services/common/errors.ts` | AppError, NotFoundError, ValidationError, etc. | Custom error hierarchy |
| `src/application/services/common/utils.ts` | — | Service-layer utilities |
| `src/application/services/authentication.service.ts` | AuthenticationService | IAuthenticationService |
| `src/application/services/authorization.service.ts` | AuthorizationService | IAuthorizationService |
| `src/application/services/tournament.service.ts` | TournamentService | ITournamentService |
| `src/application/services/registration.service.ts` | RegistrationService | IRegistrationService |
| `src/application/services/bracket.service.ts` | BracketService | IBracketService |
| `src/application/services/bracket-generator.factory.ts` | BracketGeneratorFactory | Factory Pattern |
| `src/application/services/match.service.ts` | MatchService | IMatchService |
| `src/application/services/standing.service.ts` | StandingService | IStandingService |
| `src/application/services/ranking.service.ts` | RankingService | IRankingService |
| `src/application/services/order-of-play.service.ts` | OrderOfPlayService | IOrderOfPlayService |
| `src/application/services/notification.service.ts` | NotificationService | INotificationService |
| `src/application/services/statistics.service.ts` | StatisticsService | IStatisticsService |
| `src/application/services/payment.service.ts` | PaymentService | IPaymentService |
| `src/application/index.ts` | — | Application layer barrel export |

---

### Category 10 — Infrastructure — HTTP & WebSocket
**Description:** Network communication layer for API and real-time updates.  
**Dependencies:** none  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/infrastructure/http/index.ts`
- [ ] `src/infrastructure/http/axios-client.ts`
- [ ] `src/infrastructure/websocket/index.ts`
- [ ] `src/infrastructure/websocket/socket-client.ts`
- [ ] `src/main.ts`

#### File list
| File path | Class | Purpose |
|-----------|-------|---------|
| `src/infrastructure/http/index.ts` | — | Barrel export |
| `src/infrastructure/http/axios-client.ts` | AxiosClient | HTTP client singleton with JWT injection |
| `src/infrastructure/websocket/index.ts` | — | Barrel export |
| `src/infrastructure/websocket/socket-client.ts` | SocketClient | Socket.io-client wrapper for real-time events |
| `src/main.ts` | — | Application entry point (bootstraps Angular) |

---

### Category 11 — Infrastructure — Repository Implementations
**Description:** HTTP-based repository implementations using AxiosClient.  
**Dependencies:** Category 5 (Repository Interfaces), Category 10 (HTTP Client)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/infrastructure/repositories/index.ts`
- [ ] `src/infrastructure/repositories/user.repository.ts`
- [ ] `src/infrastructure/repositories/tournament.repository.ts`
- [ ] `src/infrastructure/repositories/category.repository.ts`
- [ ] `src/infrastructure/repositories/court.repository.ts`
- [ ] `src/infrastructure/repositories/registration.repository.ts`
- [ ] `src/infrastructure/repositories/bracket.repository.ts`
- [ ] `src/infrastructure/repositories/phase.repository.ts`
- [ ] `src/infrastructure/repositories/match.repository.ts`
- [ ] `src/infrastructure/repositories/score.repository.ts`
- [ ] `src/infrastructure/repositories/standing.repository.ts`
- [ ] `src/infrastructure/repositories/global-ranking.repository.ts`
- [ ] `src/infrastructure/repositories/order-of-play.repository.ts`
- [ ] `src/infrastructure/repositories/notification.repository.ts`
- [ ] `src/infrastructure/repositories/announcement.repository.ts`
- [ ] `src/infrastructure/repositories/statistics.repository.ts`
- [ ] `src/infrastructure/repositories/payment.repository.ts`
- [ ] `src/infrastructure/repositories/sanction.repository.ts`
- [ ] `src/infrastructure/index.ts`

#### File list
| File path | Class | Implements |
|-----------|-------|------------|
| `src/infrastructure/repositories/index.ts` | — | Barrel export |
| `src/infrastructure/repositories/user.repository.ts` | UserRepositoryImpl | IUserRepository |
| `src/infrastructure/repositories/tournament.repository.ts` | TournamentRepositoryImpl | ITournamentRepository |
| `src/infrastructure/repositories/category.repository.ts` | CategoryRepositoryImpl | ICategoryRepository |
| `src/infrastructure/repositories/court.repository.ts` | CourtRepositoryImpl | ICourtRepository |
| `src/infrastructure/repositories/registration.repository.ts` | RegistrationRepositoryImpl | IRegistrationRepository |
| `src/infrastructure/repositories/bracket.repository.ts` | BracketRepositoryImpl | IBracketRepository |
| `src/infrastructure/repositories/phase.repository.ts` | PhaseRepositoryImpl | IPhaseRepository |
| `src/infrastructure/repositories/match.repository.ts` | MatchRepositoryImpl | IMatchRepository |
| `src/infrastructure/repositories/score.repository.ts` | ScoreRepositoryImpl | IScoreRepository |
| `src/infrastructure/repositories/standing.repository.ts` | StandingRepositoryImpl | IStandingRepository |
| `src/infrastructure/repositories/global-ranking.repository.ts` | GlobalRankingRepositoryImpl | IGlobalRankingRepository |
| `src/infrastructure/repositories/order-of-play.repository.ts` | OrderOfPlayRepositoryImpl | IOrderOfPlayRepository |
| `src/infrastructure/repositories/notification.repository.ts` | NotificationRepositoryImpl | INotificationRepository |
| `src/infrastructure/repositories/announcement.repository.ts` | AnnouncementRepositoryImpl | IAnnouncementRepository |
| `src/infrastructure/repositories/statistics.repository.ts` | StatisticsRepositoryImpl | IStatisticsRepository |
| `src/infrastructure/repositories/payment.repository.ts` | PaymentRepositoryImpl | IPaymentRepository |
| `src/infrastructure/repositories/sanction.repository.ts` | SanctionRepositoryImpl | ISanctionRepository |
| `src/infrastructure/index.ts` | — | Infrastructure layer barrel export |

---

### Category 12 — Infrastructure — External Adapters
**Description:** Integration with external services (email, Telegram, payments, export).  
**Dependencies:** none  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/infrastructure/external/index.ts`
- [ ] `src/infrastructure/external/email-adapter.ts`
- [ ] `src/infrastructure/external/telegram-adapter.ts`
- [ ] `src/infrastructure/external/web-push-adapter.ts`
- [ ] `src/infrastructure/external/payment-gateway-adapter.ts`
- [ ] `src/infrastructure/external/export-service.ts`

#### File list
| File path | Class | Integration |
|-----------|-------|-------------|
| `src/infrastructure/external/index.ts` | — | Barrel export |
| `src/infrastructure/external/email-adapter.ts` | EmailAdapter | Transactional email service (e.g., SendGrid) |
| `src/infrastructure/external/telegram-adapter.ts` | TelegramAdapter | Telegram Bot API |
| `src/infrastructure/external/web-push-adapter.ts` | WebPushAdapter | Web Push notifications |
| `src/infrastructure/external/payment-gateway-adapter.ts` | PaymentGatewayAdapter | Payment processor (e.g., Stripe) |
| `src/infrastructure/external/export-service.ts` | ExportService | ITF CSV and TODS export |

---

### Category 13 — Presentation — Angular Core
**Description:** Angular root configuration, routing, guards, and interceptors.  
**Dependencies:** Category 8 (Service Interfaces), Category 9 (Service Implementations)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/presentation/index.ts`
- [ ] `src/presentation/app.component.ts`
- [ ] `src/presentation/app.config.ts`
- [ ] `src/presentation/app.routes.ts`
- [ ] `src/presentation/guards/index.ts`
- [ ] `src/presentation/guards/auth.guard.ts`
- [ ] `src/presentation/guards/role.guard.ts`
- [ ] `src/presentation/interceptors/index.ts`
- [ ] `src/presentation/interceptors/auth.interceptor.ts`
- [ ] `src/presentation/interceptors/error.interceptor.ts`
- [ ] `src/presentation/services/auth-state.service.ts`
- [ ] `src/presentation/services/index.ts`

#### File list
| File path | Symbol | Purpose |
|-----------|--------|---------|
| `src/presentation/index.ts` | — | Barrel export |
| `src/presentation/app.component.ts` | AppComponent | Root component (router-outlet, navigation) |
| `src/presentation/app.config.ts` | appConfig | Angular application configuration |
| `src/presentation/app.routes.ts` | routes | Route definitions with lazy loading |
| `src/presentation/guards/index.ts` | — | Barrel export |
| `src/presentation/guards/auth.guard.ts` | authGuard | Functional guard (JWT validation) |
| `src/presentation/guards/role.guard.ts` | roleGuard | Functional guard (role-based access) |
| `src/presentation/interceptors/index.ts` | — | Barrel export |
| `src/presentation/interceptors/auth.interceptor.ts` | authInterceptor | HTTP interceptor (JWT injection) |
| `src/presentation/interceptors/error.interceptor.ts` | errorInterceptor | HTTP interceptor (error handling) |
| `src/presentation/services/auth-state.service.ts` | AuthStateService | JWT state management with signals |
| `src/presentation/services/index.ts` | — | Barrel export |

---

### Category 14 — Presentation — Auth Pages
**Description:** Authentication and registration pages.  
**Dependencies:** Category 13 (Angular Core)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/presentation/pages/auth/login/login.component.ts`
- [ ] `src/presentation/pages/auth/login/login.component.html`
- [ ] `src/presentation/pages/auth/register/register.component.ts`
- [ ] `src/presentation/pages/auth/register/register.component.html`

#### File list
| File path | Component | Purpose |
|-----------|-----------|---------|
| `src/presentation/pages/auth/login/login.component.ts` | LoginComponent | Login form with validation |
| `src/presentation/pages/auth/login/login.component.html` | — | Login template |
| `src/presentation/pages/auth/register/register.component.ts` | RegisterComponent | Registration form |
| `src/presentation/pages/auth/register/register.component.html` | — | Registration template |

**Note:** CSS files should be added per component (e.g., `login.component.css`) and tracked in Category 2.

---

### Category 15 — Presentation — Tournament Pages
**Description:** Tournament list, detail, and creation pages.  
**Dependencies:** Category 13 (Angular Core)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/presentation/pages/tournaments/tournament-list/tournament-list.component.ts`
- [ ] `src/presentation/pages/tournaments/tournament-list/tournament-list.component.html`
- [ ] `src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.ts`
- [ ] `src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.html`

#### File list
| File path | Component | Purpose |
|-----------|-----------|---------|
| `src/presentation/pages/tournaments/tournament-list/tournament-list.component.ts` | TournamentListComponent | List of active and past tournaments |
| `src/presentation/pages/tournaments/tournament-list/tournament-list.component.html` | — | Tournament list template |
| `src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.ts` | TournamentDetailComponent | Tournament overview and navigation |
| `src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.html` | — | Tournament detail template |

**Note:** Tournament creation form should be added here or as a modal.

---

### Category 16 — Presentation — Match & Bracket Pages
**Description:** Bracket visualization, match list, and match detail pages.  
**Dependencies:** Category 13 (Angular Core)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/presentation/pages/brackets/bracket-view/bracket-view.component.ts`
- [ ] `src/presentation/pages/brackets/bracket-view/bracket-view.component.html`
- [ ] `src/presentation/pages/matches/match-list/match-list.component.ts`
- [ ] `src/presentation/pages/matches/match-list/match-list.component.html`
- [ ] `src/presentation/pages/matches/match-detail/match-detail.component.ts`
- [ ] `src/presentation/pages/matches/match-detail/match-detail.component.html`

#### File list
| File path | Component | Purpose |
|-----------|-----------|---------|
| `src/presentation/pages/brackets/bracket-view/bracket-view.component.ts` | BracketViewComponent | Draw visualization (tree, groups, match play) |
| `src/presentation/pages/brackets/bracket-view/bracket-view.component.html` | — | Bracket visualization template |
| `src/presentation/pages/matches/match-list/match-list.component.ts` | MatchListComponent | List of matches with status filter |
| `src/presentation/pages/matches/match-list/match-list.component.html` | — | Match list template |
| `src/presentation/pages/matches/match-detail/match-detail.component.ts` | MatchDetailComponent | Match detail with result entry |
| `src/presentation/pages/matches/match-detail/match-detail.component.html` | — | Match detail template |

---

### Category 17 — Presentation — Standing & Ranking Pages
**Description:** Classification tables, rankings, and order of play pages.  
**Dependencies:** Category 13 (Angular Core)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/presentation/pages/standings/standings-view/standings-view.component.ts`
- [ ] `src/presentation/pages/standings/standings-view/standings-view.component.html`
- [ ] `src/presentation/pages/ranking/ranking-view/ranking-view.component.ts`
- [ ] `src/presentation/pages/ranking/ranking-view/ranking-view.component.html`
- [ ] `src/presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.ts`
- [ ] `src/presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.html`

#### File list
| File path | Component | Purpose |
|-----------|-----------|---------|
| `src/presentation/pages/standings/standings-view/standings-view.component.ts` | StandingsViewComponent | Tournament classifications |
| `src/presentation/pages/standings/standings-view/standings-view.component.html` | — | Standings template |
| `src/presentation/pages/ranking/ranking-view/ranking-view.component.ts` | RankingViewComponent | Global ranking display |
| `src/presentation/pages/ranking/ranking-view/ranking-view.component.html` | — | Ranking template |
| `src/presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.ts` | OrderOfPlayViewComponent | Daily schedule with court assignments |
| `src/presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.html` | — | Order of play template |

---

### Category 18 — Presentation — Profile & Admin Pages
**Description:** User profile, statistics, and admin dashboard pages.  
**Dependencies:** Category 13 (Angular Core)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/presentation/pages/profile/profile-view/profile-view.component.ts`
- [ ] `src/presentation/pages/profile/profile-view/profile-view.component.html`
- [ ] `src/presentation/pages/statistics/statistics-view/statistics-view.component.ts`
- [ ] `src/presentation/pages/statistics/statistics-view/statistics-view.component.html`
- [ ] `src/presentation/pages/admin/admin-dashboard/admin-dashboard.component.ts`
- [ ] `src/presentation/pages/admin/admin-dashboard/admin-dashboard.component.html`

#### File list
| File path | Component | Purpose |
|-----------|-----------|---------|
| `src/presentation/pages/profile/profile-view/profile-view.component.ts` | ProfileViewComponent | User profile with privacy settings |
| `src/presentation/pages/profile/profile-view/profile-view.component.html` | — | Profile template |
| `src/presentation/pages/statistics/statistics-view/statistics-view.component.ts` | StatisticsViewComponent | Personal and tournament statistics |
| `src/presentation/pages/statistics/statistics-view/statistics-view.component.html` | — | Statistics template |
| `src/presentation/pages/admin/admin-dashboard/admin-dashboard.component.ts` | AdminDashboardComponent | Admin control panel |
| `src/presentation/pages/admin/admin-dashboard/admin-dashboard.component.html` | — | Admin dashboard template |

---

### Category 19 — Presentation — Communication Pages
**Description:** Notifications and announcements pages.  
**Dependencies:** Category 13 (Angular Core)  
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/presentation/pages/notifications/notification-list/notification-list.component.ts`
- [ ] `src/presentation/pages/notifications/notification-list/notification-list.component.html`
- [ ] `src/presentation/pages/announcements/announcement-list/announcement-list.component.ts`
- [ ] `src/presentation/pages/announcements/announcement-list/announcement-list.component.html`
- [ ] `index.html`

#### File list
| File path | Component | Purpose |
|-----------|-----------|---------|
| `src/presentation/pages/notifications/notification-list/notification-list.component.ts` | NotificationListComponent | User notifications with read/unread state |
| `src/presentation/pages/notifications/notification-list/notification-list.component.html` | — | Notification list template |
| `src/presentation/pages/announcements/announcement-list/announcement-list.component.ts` | AnnouncementListComponent | Tournament announcements with tags |
| `src/presentation/pages/announcements/announcement-list/announcement-list.component.html` | — | Announcement list template |
| `index.html` | — | HTML entry point with PWA manifest |

---

### Category 20 — Tests — Domain Unit Tests
**Description:** Unit tests for domain entities.  
**Dependencies:** Category 4 (Entities)  
**Status:** 🔮 Deferred (Post-Codification)

> **⚠️ NOT PART OF CODIFICATION PHASE**  
> These tests will be implemented **after** all production code (Categories 1–19, 24) is complete.

#### Checklist
- [ ] `tests/domain/entities/user.test.ts`
- [ ] `tests/domain/entities/tournament.test.ts`
- [ ] `tests/domain/entities/category.test.ts`
- [ ] `tests/domain/entities/court.test.ts`
- [ ] `tests/domain/entities/registration.test.ts`
- [ ] `tests/domain/entities/bracket.test.ts`
- [ ] `tests/domain/entities/phase.test.ts`
- [ ] `tests/domain/entities/match.test.ts`
- [ ] `tests/domain/entities/score.test.ts`
- [ ] `tests/domain/entities/standing.test.ts`
- [ ] `tests/domain/entities/global-ranking.test.ts`
- [ ] `tests/domain/entities/order-of-play.test.ts`
- [ ] `tests/domain/entities/notification.test.ts`
- [ ] `tests/domain/entities/announcement.test.ts`
- [ ] `tests/domain/entities/statistics.test.ts`
- [ ] `tests/domain/entities/payment.test.ts`
- [ ] `tests/domain/entities/sanction.test.ts`

#### File list
| File path | Tests | Coverage Target |
|-----------|-------|-----------------|
| `tests/domain/entities/user.test.ts` | User entity | Business logic, authentication, permissions |
| `tests/domain/entities/tournament.test.ts` | Tournament entity | Lifecycle, validation |
| `tests/domain/entities/category.test.ts` | Category entity | Quota management |
| `tests/domain/entities/court.test.ts` | Court entity | Availability logic |
| `tests/domain/entities/registration.test.ts` | Registration entity | Status transitions, withdrawal |
| `tests/domain/entities/bracket.test.ts` | Bracket entity | Generation, seeding |
| `tests/domain/entities/phase.test.ts` | Phase entity | Phase linking |
| `tests/domain/entities/match.test.ts` | Match entity | State transitions, result validation |
| `tests/domain/entities/score.test.ts` | Score entity | Scoring logic |
| `tests/domain/entities/standing.test.ts` | Standing entity | Calculation logic |
| `tests/domain/entities/global-ranking.test.ts` | GlobalRanking entity | Ranking updates |
| `tests/domain/entities/order-of-play.test.ts` | OrderOfPlay entity | Publishing, rescheduling |
| `tests/domain/entities/notification.test.ts` | Notification entity | Delivery logic |
| `tests/domain/entities/announcement.test.ts` | Announcement entity | Publishing, tagging |
| `tests/domain/entities/statistics.test.ts` | Statistics entity | Stats calculation |
| `tests/domain/entities/payment.test.ts` | Payment entity | Payment processing |
| `tests/domain/entities/sanction.test.ts` | Sanction entity | Sanction application |

---

### Category 21 — Tests — Application Unit Tests
**Description:** Unit tests for application services.  
**Dependencies:** Category 9 (Service Implementations)  
**Status:** 🔮 Deferred (Post-Codification)

> **⚠️ NOT PART OF CODIFICATION PHASE**  
> These tests will be implemented **after** all production code (Categories 1–19, 24) is complete.

#### Checklist
- [ ] `tests/application/services/authentication.service.test.ts`
- [ ] `tests/application/services/authorization.service.test.ts`
- [ ] `tests/application/services/tournament.service.test.ts`
- [ ] `tests/application/services/registration.service.test.ts`
- [ ] `tests/application/services/bracket.service.test.ts`
- [ ] `tests/application/services/bracket-generator.factory.test.ts`
- [ ] `tests/application/services/match.service.test.ts`
- [ ] `tests/application/services/standing.service.test.ts`
- [ ] `tests/application/services/ranking.service.test.ts`
- [ ] `tests/application/services/order-of-play.service.test.ts`
- [ ] `tests/application/services/notification.service.test.ts`
- [ ] `tests/application/services/statistics.service.test.ts`
- [ ] `tests/application/services/payment.service.test.ts`

#### File list
| File path | Tests | Coverage Target |
|-----------|-------|-----------------|
| `tests/application/services/authentication.service.test.ts` | AuthenticationService | Login, token validation |
| `tests/application/services/authorization.service.test.ts` | AuthorizationService | Permission checks |
| `tests/application/services/tournament.service.test.ts` | TournamentService | Tournament CRUD operations |
| `tests/application/services/registration.service.test.ts` | RegistrationService | Registration workflow |
| `tests/application/services/bracket.service.test.ts` | BracketService | Bracket generation |
| `tests/application/services/bracket-generator.factory.test.ts` | BracketGeneratorFactory | Factory pattern |
| `tests/application/services/match.service.test.ts` | MatchService | Result recording |
| `tests/application/services/standing.service.test.ts` | StandingService | Standing calculations |
| `tests/application/services/ranking.service.test.ts` | RankingService | Ranking updates |
| `tests/application/services/order-of-play.service.test.ts` | OrderOfPlayService | Schedule management |
| `tests/application/services/notification.service.test.ts` | NotificationService | Notification delivery |
| `tests/application/services/statistics.service.test.ts` | StatisticsService | Statistics aggregation |
| `tests/application/services/payment.service.test.ts` | PaymentService | Payment processing |

---

### Category 22 — Tests — Integration Tests
**Description:** Integration tests for layer interactions.  
**Dependencies:** All categories  
**Status:** 🔮 Deferred (Post-Codification)

> **⚠️ NOT PART OF CODIFICATION PHASE**  
> These tests will be implemented **after** all production code (Categories 1–19, 24) is complete.

#### Checklist
_(To be defined after codification phase based on critical flows)_

#### File list
| File path | Tests | Scope |
|-----------|-------|-------|
| _TBD_ | End-to-end flow tests | Service + Repository integration |

**Note:** Integration tests will be added as needed to validate critical workflows (e.g., tournament creation → registration → bracket generation → result entry → standing update).

---

### Category 23 — Tests — E2E Tests
**Description:** End-to-end tests using Playwright.  
**Dependencies:** All categories  
**Status:** 🔮 Deferred (Post-Codification)

> **⚠️ NOT PART OF CODIFICATION PHASE**  
> These tests will be implemented **after** all production code (Categories 1–19, 24) is complete.

#### Checklist
_(To be defined after codification phase)_

#### File list
| File path | Tests | Scope |
|-----------|-------|-------|
| `e2e/` | — | Playwright E2E test directory |

**Note:** E2E test files will be created to validate user journeys across the entire application.

---

### Category 24 — Documentation
**Description:** Requirements, architecture, and design documentation.  
**Dependencies:** none  
**Status:** ⬜ Pending

#### Checklist
- [ ] `docs/specification.md`
- [ ] `docs/class-diagram.mermaid`
- [ ] `docs/use-case-diagram.mermaid`

#### File list
| File path | Content | Purpose |
|-----------|---------|---------|
| `docs/specification.md` | Requirements specification | Complete project requirements (1796 lines) |
| `docs/class-diagram.mermaid` | UML class diagram | Domain model visualization |
| `docs/use-case-diagram.mermaid` | UML use case diagram | Actor-system interactions |

---

## GLOBAL FILE INDEX

> Complete alphabetical list of every file in the project.
> Updated after each category is completed.
> 
> **Status:** ⬜ Pending (codification phase) · 🔮 Deferred (post-codification tests) · ✅ Complete

| File path | Category # | Status |
|-----------|-----------|--------|
| `.gitignore` | 1 | ⬜ |
| `docs/class-diagram.mermaid` | 24 | ⬜ |
| `docs/specification.md` | 24 | ⬜ |
| `docs/use-case-diagram.mermaid` | 24 | ⬜ |
| `eslint.config.mjs` | 1 | ⬜ |
| `index.html` | 19 | ⬜ |
| `jest.config.js` | 1 | ⬜ |
| `package.json` | 1 | ⬜ |
| `playwright.config.ts` | 1 | ⬜ |
| `src/application/dto/announcement.dto.ts` | 7 | ⬜ |
| `src/application/dto/bracket.dto.ts` | 7 | ⬜ |
| `src/application/dto/common.dto.ts` | 7 | ⬜ |
| `src/application/dto/index.ts` | 7 | ⬜ |
| `src/application/dto/match.dto.ts` | 7 | ⬜ |
| `src/application/dto/notification.dto.ts` | 7 | ⬜ |
| `src/application/dto/order-of-play.dto.ts` | 7 | ⬜ |
| `src/application/dto/payment.dto.ts` | 7 | ⬜ |
| `src/application/dto/ranking.dto.ts` | 7 | ⬜ |
| `src/application/dto/registration.dto.ts` | 7 | ⬜ |
| `src/application/dto/standing.dto.ts` | 7 | ⬜ |
| `src/application/dto/statistics.dto.ts` | 7 | ⬜ |
| `src/application/dto/tournament.dto.ts` | 7 | ⬜ |
| `src/application/dto/user.dto.ts` | 7 | ⬜ |
| `src/application/index.ts` | 9 | ⬜ |
| `src/application/interfaces/authentication-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/authorization-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/bracket-generator.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/bracket-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/index.ts` | 8 | ⬜ |
| `src/application/interfaces/match-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/notification-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/order-of-play-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/payment-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/ranking-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/registration-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/standing-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/statistics-service.interface.ts` | 8 | ⬜ |
| `src/application/interfaces/tournament-service.interface.ts` | 8 | ⬜ |
| `src/application/services/authentication.service.ts` | 9 | ⬜ |
| `src/application/services/authorization.service.ts` | 9 | ⬜ |
| `src/application/services/bracket-generator.factory.ts` | 9 | ⬜ |
| `src/application/services/bracket.service.ts` | 9 | ⬜ |
| `src/application/services/common/errors.ts` | 9 | ⬜ |
| `src/application/services/common/utils.ts` | 9 | ⬜ |
| `src/application/services/index.ts` | 9 | ⬜ |
| `src/application/services/match.service.ts` | 9 | ⬜ |
| `src/application/services/notification.service.ts` | 9 | ⬜ |
| `src/application/services/order-of-play.service.ts` | 9 | ⬜ |
| `src/application/services/payment.service.ts` | 9 | ⬜ |
| `src/application/services/ranking.service.ts` | 9 | ⬜ |
| `src/application/services/registration.service.ts` | 9 | ⬜ |
| `src/application/services/standing.service.ts` | 9 | ⬜ |
| `src/application/services/statistics.service.ts` | 9 | ⬜ |
| `src/application/services/tournament.service.ts` | 9 | ⬜ |
| `src/domain/entities/announcement.ts` | 4 | ⬜ |
| `src/domain/entities/bracket.ts` | 4 | ⬜ |
| `src/domain/entities/category.ts` | 4 | ⬜ |
| `src/domain/entities/court.ts` | 4 | ⬜ |
| `src/domain/entities/global-ranking.ts` | 4 | ⬜ |
| `src/domain/entities/index.ts` | 4 | ⬜ |
| `src/domain/entities/match.ts` | 4 | ⬜ |
| `src/domain/entities/notification.ts` | 4 | ⬜ |
| `src/domain/entities/order-of-play.ts` | 4 | ⬜ |
| `src/domain/entities/payment.ts` | 4 | ⬜ |
| `src/domain/entities/phase.ts` | 4 | ⬜ |
| `src/domain/entities/registration.ts` | 4 | ⬜ |
| `src/domain/entities/sanction.ts` | 4 | ⬜ |
| `src/domain/entities/score.ts` | 4 | ⬜ |
| `src/domain/entities/standing.ts` | 4 | ⬜ |
| `src/domain/entities/statistics.ts` | 4 | ⬜ |
| `src/domain/entities/tournament.ts` | 4 | ⬜ |
| `src/domain/entities/user.ts` | 4 | ⬜ |
| `src/domain/enumerations/acceptance-type.ts` | 3 | ⬜ |
| `src/domain/enumerations/bracket-type.ts` | 3 | ⬜ |
| `src/domain/enumerations/index.ts` | 3 | ⬜ |
| `src/domain/enumerations/match-status.ts` | 3 | ⬜ |
| `src/domain/enumerations/notification-channel.ts` | 3 | ⬜ |
| `src/domain/enumerations/notification-type.ts` | 3 | ⬜ |
| `src/domain/enumerations/payment-status.ts` | 3 | ⬜ |
| `src/domain/enumerations/ranking-system.ts` | 3 | ⬜ |
| `src/domain/enumerations/registration-status.ts` | 3 | ⬜ |
| `src/domain/enumerations/sanction-type.ts` | 3 | ⬜ |
| `src/domain/enumerations/surface.ts` | 3 | ⬜ |
| `src/domain/enumerations/tournament-status.ts` | 3 | ⬜ |
| `src/domain/enumerations/user-role.ts` | 3 | ⬜ |
| `src/domain/index.ts` | 5 | ⬜ |
| `src/domain/repositories/announcement-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/bracket-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/category-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/court-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/global-ranking-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/index.ts` | 5 | ⬜ |
| `src/domain/repositories/match-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/notification-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/order-of-play-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/payment-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/phase-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/registration-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/sanction-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/score-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/standing-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/statistics-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/tournament-repository.interface.ts` | 5 | ⬜ |
| `src/domain/repositories/user-repository.interface.ts` | 5 | ⬜ |
| `src/infrastructure/external/email-adapter.ts` | 12 | ⬜ |
| `src/infrastructure/external/export-service.ts` | 12 | ⬜ |
| `src/infrastructure/external/index.ts` | 12 | ⬜ |
| `src/infrastructure/external/payment-gateway-adapter.ts` | 12 | ⬜ |
| `src/infrastructure/external/telegram-adapter.ts` | 12 | ⬜ |
| `src/infrastructure/external/web-push-adapter.ts` | 12 | ⬜ |
| `src/infrastructure/http/axios-client.ts` | 10 | ⬜ |
| `src/infrastructure/http/index.ts` | 10 | ⬜ |
| `src/infrastructure/index.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/announcement.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/bracket.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/category.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/court.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/global-ranking.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/index.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/match.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/notification.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/order-of-play.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/payment.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/phase.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/registration.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/sanction.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/score.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/standing.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/statistics.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/tournament.repository.ts` | 11 | ⬜ |
| `src/infrastructure/repositories/user.repository.ts` | 11 | ⬜ |
| `src/infrastructure/websocket/index.ts` | 10 | ⬜ |
| `src/infrastructure/websocket/socket-client.ts` | 10 | ⬜ |
| `src/main.ts` | 10 | ⬜ |
| `src/presentation/app.component.ts` | 13 | ⬜ |
| `src/presentation/app.config.ts` | 13 | ⬜ |
| `src/presentation/app.routes.ts` | 13 | ⬜ |
| `src/presentation/guards/auth.guard.ts` | 13 | ⬜ |
| `src/presentation/guards/index.ts` | 13 | ⬜ |
| `src/presentation/guards/role.guard.ts` | 13 | ⬜ |
| `src/presentation/index.ts` | 13 | ⬜ |
| `src/presentation/interceptors/auth.interceptor.ts` | 13 | ⬜ |
| `src/presentation/interceptors/error.interceptor.ts` | 13 | ⬜ |
| `src/presentation/interceptors/index.ts` | 13 | ⬜ |
| `src/presentation/pages/admin/admin-dashboard/admin-dashboard.component.html` | 18 | ⬜ |
| `src/presentation/pages/admin/admin-dashboard/admin-dashboard.component.ts` | 18 | ⬜ |
| `src/presentation/pages/announcements/announcement-list/announcement-list.component.html` | 19 | ⬜ |
| `src/presentation/pages/announcements/announcement-list/announcement-list.component.ts` | 19 | ⬜ |
| `src/presentation/pages/auth/login/login.component.html` | 14 | ⬜ |
| `src/presentation/pages/auth/login/login.component.ts` | 14 | ⬜ |
| `src/presentation/pages/auth/register/register.component.html` | 14 | ⬜ |
| `src/presentation/pages/auth/register/register.component.ts` | 14 | ⬜ |
| `src/presentation/pages/brackets/bracket-view/bracket-view.component.html` | 16 | ⬜ |
| `src/presentation/pages/brackets/bracket-view/bracket-view.component.ts` | 16 | ⬜ |
| `src/presentation/pages/matches/match-detail/match-detail.component.html` | 16 | ⬜ |
| `src/presentation/pages/matches/match-detail/match-detail.component.ts` | 16 | ⬜ |
| `src/presentation/pages/matches/match-list/match-list.component.html` | 16 | ⬜ |
| `src/presentation/pages/matches/match-list/match-list.component.ts` | 16 | ⬜ |
| `src/presentation/pages/notifications/notification-list/notification-list.component.html` | 19 | ⬜ |
| `src/presentation/pages/notifications/notification-list/notification-list.component.ts` | 19 | ⬜ |
| `src/presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.html` | 17 | ⬜ |
| `src/presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.ts` | 17 | ⬜ |
| `src/presentation/pages/profile/profile-view/profile-view.component.html` | 18 | ⬜ |
| `src/presentation/pages/profile/profile-view/profile-view.component.ts` | 18 | ⬜ |
| `src/presentation/pages/ranking/ranking-view/ranking-view.component.html` | 17 | ⬜ |
| `src/presentation/pages/ranking/ranking-view/ranking-view.component.ts` | 17 | ⬜ |
| `src/presentation/pages/standings/standings-view/standings-view.component.html` | 17 | ⬜ |
| `src/presentation/pages/standings/standings-view/standings-view.component.ts` | 17 | ⬜ |
| `src/presentation/pages/statistics/statistics-view/statistics-view.component.html` | 18 | ⬜ |
| `src/presentation/pages/statistics/statistics-view/statistics-view.component.ts` | 18 | ⬜ |
| `src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.html` | 15 | ⬜ |
| `src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.ts` | 15 | ⬜ |
| `src/presentation/pages/tournaments/tournament-list/tournament-list.component.html` | 15 | ⬜ |
| `src/presentation/pages/tournaments/tournament-list/tournament-list.component.ts` | 15 | ⬜ |
| `src/presentation/services/auth-state.service.ts` | 13 | ⬜ |
| `src/presentation/services/index.ts` | 13 | ⬜ |
| `src/shared/constants.ts` | 6 | ⬜ |
| `src/shared/index.ts` | 6 | ⬜ |
| `src/shared/utils.ts` | 6 | ⬜ |
| `src/styles/components.css` | 2 | ⬜ |
| `src/styles/global.css` | 2 | ⬜ |
| `src/styles/reset.css` | 2 | ⬜ |
| `src/styles/responsive.css` | 2 | ⬜ |
| `src/styles/variables.css` | 2 | ⬜ |
| `tests/application/services/authentication.service.test.ts` | 21 | 🔮 |
| `tests/application/services/authorization.service.test.ts` | 21 | 🔮 |
| `tests/application/services/bracket-generator.factory.test.ts` | 21 | 🔮 |
| `tests/application/services/bracket.service.test.ts` | 21 | 🔮 |
| `tests/application/services/match.service.test.ts` | 21 | 🔮 |
| `tests/application/services/notification.service.test.ts` | 21 | 🔮 |
| `tests/application/services/order-of-play.service.test.ts` | 21 | 🔮 |
| `tests/application/services/payment.service.test.ts` | 21 | 🔮 |
| `tests/application/services/ranking.service.test.ts` | 21 | 🔮 |
| `tests/application/services/registration.service.test.ts` | 21 | 🔮 |
| `tests/application/services/standing.service.test.ts` | 21 | 🔮 |
| `tests/application/services/statistics.service.test.ts` | 21 | 🔮 |
| `tests/application/services/tournament.service.test.ts` | 21 | 🔮 |
| `tests/domain/entities/announcement.test.ts` | 20 | 🔮 |
| `tests/domain/entities/bracket.test.ts` | 20 | 🔮 |
| `tests/domain/entities/category.test.ts` | 20 | 🔮 |
| `tests/domain/entities/court.test.ts` | 20 | 🔮 |
| `tests/domain/entities/global-ranking.test.ts` | 20 | 🔮 |
| `tests/domain/entities/match.test.ts` | 20 | 🔮 |
| `tests/domain/entities/notification.test.ts` | 20 | 🔮 |
| `tests/domain/entities/order-of-play.test.ts` | 20 | 🔮 |
| `tests/domain/entities/payment.test.ts` | 20 | 🔮 |
| `tests/domain/entities/phase.test.ts` | 20 | 🔮 |
| `tests/domain/entities/registration.test.ts` | 20 | 🔮 |
| `tests/domain/entities/sanction.test.ts` | 20 | 🔮 |
| `tests/domain/entities/score.test.ts` | 20 | 🔮 |
| `tests/domain/entities/standing.test.ts` | 20 | 🔮 |
| `tests/domain/entities/statistics.test.ts` | 20 | 🔮 |
| `tests/domain/entities/tournament.test.ts` | 20 | 🔮 |
| `tests/domain/entities/user.test.ts` | 20 | 🔮 |
| `tsconfig.json` | 1 | ⬜ |
| `tsconfig.node.json` | 1 | ⬜ |
| `typedoc.json` | 1 | ⬜ |
| `vite.config.ts` | 1 | ⬜ |

---

## COMPLETION CRITERIA

✅ **Planning step is complete when:**
- [x] Every file from the scaffold appears in the Global File Index
- [x] Every category has a non-empty checklist
- [x] No file appears in more than one category
- [x] The Overview table totals match the Global File Index count (180 production + 30 test files)
- [x] Categories follow dependency order (inner to outer layers)
- [x] Test categories (20-23) marked as deferred to post-codification phase

⬜ **Codification phase complete when:**
- [ ] All production code categories (1-19, 24) are implemented and functional
- [ ] Application can be built and run successfully
- [ ] All core features are operational

🔮 **Post-codification phase (tests):**
- [ ] Category 20: Domain unit tests (17 files)
- [ ] Category 21: Application unit tests (13 files)
- [ ] Category 22: Integration tests (TBD)
- [ ] Category 23: E2E tests (TBD)

**Next step:** Begin codification with Category 1 (Configuration & Tooling).

		```