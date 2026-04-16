# PROJECT CONTEXT
Project: Tennis Tournament Manager (TENNIS)
Description: Responsive web application for comprehensive management of multiple simultaneous
  tennis tournaments. Covers the full tournament lifecycle: participant registration, draw
  design (Round Robin, Knockout, Match Play), order of play generation, result recording,
  automatic standings calculation, announcement publication, and multichannel notifications.
  The platform serves four actor types — System Administrator, Tournament Administrator,
  Registered Participant, and Public — with differentiated roles and granular permissions.
Selected architecture: Layered Architecture with Clean Architecture principles
  (Domain → Application → Infrastructure → Presentation)
Technology stack: TypeScript, HTML, CSS, Vite, TypeDoc, ESLint, Playwright,
  Angular (Presentation layer), Socket.io-client (real-time), Axios (HTTP client)

# AVAILABLE DESIGN ARTIFACTS
- Main class diagram: [attached — Mermaid classDiagram with entities: User, Tournament,
  Category, Court, Registration, Bracket, Phase, Match, Score, Standing, GlobalRanking,
  OrderOfPlay, Notification, Announcement, Statistics, Payment, Sanction, and their
  corresponding Application Services and Repository interfaces]
- Main use case diagram: [attached — Mermaid graph TB with actors: SysAdmin,
  TournamentAdmin, Participant, Public, System, External; covering user management,
  tournament management, registration, bracket management, match management, order of play,
  visualization, statistics, ranking, notifications, announcements, privacy, export,
  incident management, and system management use cases]
- Design patterns to apply:
    · Repository Pattern (all IXxxRepository interfaces in class diagram)
    · Factory Pattern (BracketGeneratorFactory + IBracketGenerator)
    · Observer Pattern (NotificationService multichannel dispatch)
    · Strategy Pattern (ranking calculation: points-based, ratio-based, ELO)
    · State Pattern (MatchStatus and RegistrationStatus transitions)
- Relevant non-functional requirements:
    · NFR1  — Responsive (desktop 1920px+, tablet 768–1024px, mobile 320–767px)
    · NFR3  — Angular as frontend framework
    · NFR5  — Real-time sync <5 s via WebSockets
    · NFR9  — Supports ≥100 concurrent users, ≥20 active tournaments simultaneously
    · NFR11 — Well-documented REST API (Swagger/OpenAPI)
    · NFR12 — JWT authentication, bcrypt passwords, 30 min session timeout
    · NFR13 — Granular role/permission validation on every backend action
    · NFR14 — GDPR compliance (consent, access, rectification, deletion, portability)
    · NFR15 — Activity and audit logs for critical actions
    · NFR22 — Automated tests with ≥70% coverage on critical functions
    · NFR23 — Complete technical documentation (JSDoc/TypeDoc)

# TASK
Generate the complete folder and file structure of the project following these
specifications:

## Required structure:
- Four-layer separation matching the class diagram:
    · domain/        → entities, enumerations, repository interfaces (pure TS, no frameworks)
    · application/   → service interfaces, service implementations, DTOs
    · infrastructure/→ repository implementations, external service adapters
                       (notifications, payments, exports)
    · presentation/  → Angular components, pages, services, guards, interceptors, router
- TypeScript naming conventions following the Google Style Guide
- Initial configuration (dependencies, build, etc.)
- Base documentation files (README.md, ARCHITECTURE.md)

## Expected deliverables:
1. Complete directory tree (src, docs, tests, config, etc.)
2. Configuration files:
   package.json, playwright.config.ts, tsconfig.json, typedoc.json,
   vite.config.js (dev server / build), eslint.config.mjs
3. Main classes/modules as empty skeletons with:
   - Class and interface names exactly matching the UML class diagram
     (User, Tournament, Category, Court, Registration, Bracket, Phase, Match, Score,
      Standing, GlobalRanking, OrderOfPlay, Notification, Announcement, Statistics,
      Payment, Sanction, and all IXxxRepository + XxxService classes)
   - All enumerations: UserRole, TournamentStatus, Surface, RegistrationStatus,
     AcceptanceType, BracketType, MatchStatus, NotificationType, NotificationChannel,
     PaymentStatus, SanctionType, RankingSystem
   - Methods declared without implementation (throw new Error('Not implemented'))
   - JSDoc comments describing the responsibility of each class and method
4. README.md with setup instructions
5. Playwright properly configured
   (coverage threshold ≥70%, reporters: text + lcov)
6. Vite properly configured to work with TypeScript
   (port 4200 to match Angular convention, proxy /api → backend)
7. ESLint properly configured to follow the Google Style Guide
   (plugin: @typescript-eslint, extends: google, no-unused-vars, explicit-function-return-type)

# CONSTRAINTS
- DO NOT implement logic yet, only structure
- Use consistent nomenclature as seen in the class diagram and following the
  quality metrics of the Google Style Guide (PascalCase classes, camelCase methods,
  UPPER_SNAKE_CASE enum values, kebab-case file names)
- Include appropriate .gitignore files
- Prepare structure for testing from the start — one test skeleton per domain entity,
  one per application service, mirroring src/ layout under tests/

# OUTPUT FORMAT
Provide:
1. Textual listing of the folder structure
2. Content of each configuration file
3. Skeletons of main classes grouped by layer:
   a) domain/entities   (User, Tournament, Category, Court, Registration, Bracket,
                         Phase, Match, Score, Standing, GlobalRanking, OrderOfPlay,
                         Notification, Announcement, Statistics, Payment, Sanction)
   b) domain/enumerations (all 13 enumerations from the class diagram)
   c) domain/repositories (all IXxxRepository interfaces)
   d) application/services (AuthenticationService, AuthorizationService,
                             TournamentService, RegistrationService, BracketService,
                             BracketGeneratorFactory, IBracketGenerator,
                             MatchService, StandingService, RankingService,
                             OrderOfPlayService, NotificationService,
                             StatisticsService, PaymentService)
   e) infrastructure/repositories (concrete implementations of each IXxxRepository)
   f) infrastructure/external (email adapter, Telegram adapter, webPush adapter,
                                paymentGateway adapter, exportService ITF/TODS)
   g) presentation/ (Angular module/component stubs for: auth, tournaments, brackets,
                     matches, order-of-play, standings, ranking, notifications,
                     announcements, statistics, profile, admin)
4. Brief justification of architectural decisions
5. Bash commands necessary to initialize the project
6. Bash commands necessary to install technology stack elements:
   TypeScript, HTML, CSS, Vite, TypeDoc, ESLint, Playwright, Angular,
   Socket.io-client, Axios, and all required ESLint/Playwright plugins
7. Bash commands necessary to properly configure the project
   (package.json scripts, playwright.config.ts, tsconfig.json,
    typedoc.json, vite.config.js, eslint.config.mjs)