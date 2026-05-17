# Respuesta

## Answer 2 (Review Report)

## Answer 2 (Review Report) {toggle="true"}
		```markdown
# TENNIS Tournament Manager — Code Review Report
**Date:** 2026-04-17
**Reviewer:** GitHub Copilot Agent

---
## TODO List: Incidents Found
- [x] [INC-001] [G1.1 – Frontend Enumerations] [src/domain/enumerations/user-role.ts] — Role enum omits documented referee/public roles
- [x] [INC-002] [G1.3 – Frontend Entities] [src/domain/entities/user.ts] — Permission map references non-existent roles
- [x] [INC-003] [G2.2 – Backend Entities] [backend/src/domain/entities/registration.entity.ts] — Registration invariant lacks a composite uniqueness guard
- [x] [INC-004] [G3.3 – Competition Flow Services] [src/application/services/bracket.service.ts] — Bracket generation bypasses the generator path and saves only a shell
- [x] [INC-005] [G3.3 – Competition Flow Services] [src/application/services/phase-progression.service.ts] — Qualifier advancement matches standings by the wrong identifier
- [x] [INC-006] [G3.3 – Competition Flow Services] [src/application/services/result-confirmation.service.ts] — Result confirmation skips authorization and state validation
- [x] [INC-007] [G3.3 – Competition Flow Services] [src/application/services/order-of-play.service.ts] — Automatic scheduling mixes matches from all tournaments
- [x] [INC-008] [G3.4 – Auth, User, Ranking & Privacy Services] [src/application/services/authentication.service.ts] — JWT validation uses raw base64 decoding on base64url payloads
- [x] [INC-009] [G3.4 – Auth, User, Ranking & Privacy Services] [src/application/services/authorization.service.ts] — Authorization rules grant blanket access for broad action classes
- [x] [INC-010] [G3.4 – Auth, User, Ranking & Privacy Services] [src/application/services/ranking.service.ts] — Ranking DTO mapping reads fields that do not exist on the domain entity
- [x] [INC-011] [G3.4 – Auth, User, Ranking & Privacy Services] [src/application/services/ranking.service.ts] — Seed calculation ignores the target category and ranks the whole table
- [x] [INC-012] [G3.4 – Auth, User, Ranking & Privacy Services] [src/application/services/gdpr.service.ts] — Account deletion reports success while anonymization remains a placeholder
- [x] [INC-013] [G3.5 – Announcements, Notifications & Export Services] [src/application/services/export.service.ts] — Export service contract drifts from its declared DTO-based interface
- [x] [INC-014] [G3.6 – Generators, Scheduling & Service Support] [src/application/services/seeding.service.ts] — Seed assignment sorts by current seed instead of participant ranking
- [x] [INC-015] [G3.6 – Generators, Scheduling & Service Support] [src/application/services/seeding.service.ts] — Seeding logic writes and reads a non-existent property
- [x] [INC-016] [G4.2 – Backend Support & Delivery Services] [backend/src/application/services/notification.service.ts] — External notifications are skipped when in-app delivery is disabled
- [x] [INC-017] [G4.2 – Backend Support & Delivery Services] [backend/src/application/services/partner-invitation.service.ts] — Validation paths use an undefined error code symbol
- [x] [INC-018] [G4.2 – Backend Support & Delivery Services] [backend/src/application/services/announcement.service.ts] — Application layer imports error types from presentation middleware
- [x] [INC-019] [G5.1 – Frontend Repository Implementations] [src/infrastructure/repositories/registration.repository.ts] — Registration update silently narrows persistence to seedNumber only
- [x] [INC-020] [G5.2 – Frontend External Integrations] [src/infrastructure/external/export-service.ts] — Export adapter remains a simulation rather than a real infrastructure implementation
- [x] [INC-021] [G5.3 – Frontend HTTP & WebSocket Clients] [src/infrastructure/http/axios-client.ts] — Auth redirect bypasses the deployed base path and Angular router
- [x] [INC-022] [G5.3 – Frontend HTTP & WebSocket Clients] [src/infrastructure/websocket/websocket.service.ts] — WebSocket service depends on presentation state directly
- [x] [INC-023] [G5.3 – Frontend HTTP & WebSocket Clients] [src/infrastructure/websocket/websocket.service.ts] — Anonymous subscriptions can call into an uninitialized socket
- [x] [INC-024] [G6.1 – Database Bootstrap, Seeds & Tools] [backend/scripts/init-database.sh] — Bootstrap relies on synchronize and a timed dev-server start instead of migrations
- [x] [INC-025] [G6.2 – Database Migrations] [backend/src/infrastructure/database/data-source.ts] — Runtime DataSource does not load any migration classes
- [x] [INC-026] [G7.1 – App Shell, Guards, Interceptors & Presentation Services] [src/application/services/session-inactivity.service.ts] — Session timeout uses the wrong token key and redirects to a non-existent login route
- [x] [INC-027] [G7.1 – App Shell, Guards, Interceptors & Presentation Services] [src/presentation/interceptors/error.interceptor.ts] — Public feature routes are missing from the 401/403 allowlist
- [x] [INC-028] [G7.3 – Notification & Bracket Components] [src/presentation/components/notification-bell/notification-bell.component.ts] — Announcement notifications navigate without the required tournament context
- [x] [INC-029] [G8.1 – Admin, Auth, Home & Dashboard Pages] [src/presentation/pages/auth/register/register.component.ts] — Public registration form allows organizer-role self-selection
- [x] [INC-030] [G8.1 – Admin, Auth, Home & Dashboard Pages] [src/presentation/pages/dashboard.component.ts] — Admin shortcut points to a route that does not exist
- [x] [INC-031] [G8.1 – Admin, Auth, Home & Dashboard Pages] [src/presentation/pages/admin/admin-dashboard/admin-dashboard.component.ts] — Manage Users action is still a placeholder alert
- [x] [INC-032] [G8.2 – Announcement Pages] [src/presentation/pages/announcements/announcement-list/announcement-list.component.ts] — Public announcement list is unusable without a tournamentId query parameter
- [x] [INC-033] [G8.2 – Announcement Pages] [src/presentation/app.routes.ts] — Announcement create and edit screens have no auth or role guard
- [x] [INC-034] [G8.3 – Match & Bracket Pages] [src/presentation/pages/matches/match-detail/match-detail.component.ts] — Referees cannot access the intended score-entry workflow
- [x] [INC-035] [G8.4 – Order of Play, Ranking, Standings & Statistics Pages] [src/application/services/ranking.service.ts] — Non-ELO ranking views relabel the same dataset instead of computing another system
- [x] [INC-036] [G8.4 – Order of Play, Ranking, Standings & Statistics Pages] [src/presentation/pages/statistics/statistics-view/statistics-view.component.ts] — Back navigation points to an undefined dashboard route
- [x] [INC-037] [G8.5 – Registrations, Notifications, Invitations, Profile & Phase Pages] [src/presentation/pages/notifications/notification-list/notification-list.component.ts] — Inbox announcement notifications navigate to an unroutable destination
- [x] [INC-038] [G8.5 – Registrations, Notifications, Invitations, Profile & Phase Pages] [src/presentation/pages/profile/profile-view/profile-view.component.html] — Profile back link points to an undefined dashboard route
- [x] [INC-039] [G8.6 – Tournament Management Pages] [src/presentation/app.routes.ts] — Tournament create and edit screens are only login-protected
- [x] [INC-040] [G9.1 – Core Tournament, Match & Registration Controllers] [backend/src/presentation/controllers/registration.controller.ts] — Registration creation does not guard against duplicates before save
- [x] [INC-041] [G9.2 – Auth, User, Announcement & Notification Controllers] [backend/src/presentation/controllers/auth.controller.ts] — Public registration can create tournament-admin accounts
- [x] [INC-042] [G9.2 – Auth, User, Announcement & Notification Controllers] [backend/src/presentation/controllers/auth.controller.ts] — Refresh endpoint exists without a matching refresh-token issuance flow
- [x] [INC-043] [G9.3 – Middleware, Upload & Route Wiring] [backend/src/presentation/routes/index.ts] — Auth login route is registered twice and one definition is dead
- [x] [INC-044] [G10.1 – Frontend Shared Utilities, Pipes & Environments] [src/shared/constants.ts] — Production fallback hosts diverge between shared constants and environment defaults
- [x] [INC-045] [G10.1 – Frontend Shared Utilities, Pipes & Environments] [src/shared/constants.ts] — Shared event names do not match backend-emitted order-of-play events
- [x] [INC-046] [G10.3 – Backend Shared Config, Constants & Utilities] [backend/src/shared/config/index.ts] — Refresh secret falls back to a known literal and is not mandatory at startup
- [x] [INC-047] [G10.5 – Barrel Exports & Module Indexes] [src/domain/enumerations/index.ts] — Domain enumerations barrel duplicates the same export
- [ ] [INC-048] [G11.1 – Frontend Application Service Tests] [tests/application/services/authentication.service.test.ts] — Core service test suites are placeholders that do not exercise behavior
- [ ] [INC-049] [G11.2 – Frontend Domain Entity Tests] [tests/domain/entities/tournament.test.ts] — Domain entity tests are placeholders and do not validate invariants
- [x] [INC-050] [G11.3 – Frontend Manual Validators & Mocks] [tests/manual/privacy-configuration-validator.ts] — Manual validator reports success without enforcing failures
- [x] [INC-051] [G11.4 – End-to-End Tests] [e2e/doubles-tournament.spec.ts] — E2E cleanup leaves created users and related doubles state behind
- [x] [INC-052] [G11.4 – End-to-End Tests] [e2e/doubles-tournament.spec.ts] — E2E suite hardcodes localhost backend seeding endpoints
- [x] [INC-053] [G11.5 – Backend Application Tests] [backend/jest.config.js] — Backend coverage thresholds are too low to protect critical workflows
- [x] [INC-054] [G12.1 – Root Configuration & Tooling] [vite.config.ts] — Vite/Angular tooling no longer matches the documented plugin-based architecture
- [x] [INC-055] [G12.2 – Root Docs, Specifications & Review Inputs] [README.md] — README command table does not match the real package scripts
- [x] [INC-056] [G12.3 – Public Assets & PWA Files] [public/sw.js] — Service worker skips JavaScript bundles, so offline boot cannot work reliably
- [x] [INC-057] [G12.3 – Public Assets & PWA Files] [public/sw.js] — Precache paths are root-relative and ignore subpath deployment
- [x] [INC-058] [G12.4 – Frontend Operational Scripts] [scripts/backup-database.sh] — Backup tooling defaults to a different database name than the backend config
- [x] [INC-059] [G12.5 – Backend Configuration & Deployment Notes] [backend/QUICK-START-RENDER.md] — Deployment guide uses the wrong frontend API environment variable name
- [x] [INC-060] [G12.6 – Backend Operational Scripts & SQL Utilities] [backend/scripts/check-and-fix-roles.sql] — Repair SQL performs destructive role rewrites and user deletion

---
## Group Reviews

### G1.1 – Frontend Enumerations
**Note:** The enumeration layer is mostly domain-pure and easy to follow. The role model, however, no longer matches the documented actor hierarchy, which breaks downstream permission logic.
**Incidents:**
- [INC-001] `src/domain/enumerations/user-role.ts` line 18 — Role enum omits documented referee/public roles, making the frontend access model incomplete. | Severity: BLOCKER

### G1.2 – Frontend Value Objects
**Note:** The value-object layer stays compact and inside the domain boundary. The concrete privacy defects are in service logic rather than this file.
**Incidents:**
- None.

### G1.3 – Frontend Entities
**Note:** Entity definitions are generally infrastructure-free and readable. The main defect is permission logic that references roles the domain no longer exposes.
**Incidents:**
- [INC-002] `src/domain/entities/user.ts` line 176 — Permission map references `REGISTERED_PARTICIPANT` and `PUBLIC`, which do not exist in the enum and make those branches unreachable. | Severity: BLOCKER

### G1.4 – Frontend Repository Interfaces
**Note:** Repository contracts remain clean interfaces and preserve the intended layer boundary. I did not find a substantive defect in the interface files themselves.
**Incidents:**
- None.

### G2.1 – Backend Enumerations
**Note:** Backend enum coverage is coherent for the workflows reviewed. No issue in this group stood out as a concrete correctness or integrity failure.
**Incidents:**
- None.

### G2.2 – Backend Entities
**Note:** Backend entities are mostly declarative and conventional. The important gap is that the registration invariant still depends on application discipline instead of schema enforcement.
**Incidents:**
- [INC-003] `backend/src/domain/entities/registration.entity.ts` line 24 — The registration entity lacks a composite uniqueness guard, so duplicate registrations can be persisted and corrupt quota and alternate workflows. | Severity: BLOCKER

### G3.1 – Frontend DTOs
**Note:** DTO definitions are mostly consistent and straightforward. The defects I found appear in service mapping logic rather than in the DTO files themselves.
**Incidents:**
- None.

### G3.2 – Frontend Service Interfaces
**Note:** Service interfaces are reasonable application contracts and mostly align with the architecture. The larger problems come from concrete implementations drifting away from those contracts.
**Incidents:**
- None.

### G3.3 – Competition Flow Services
**Note:** This is one of the highest-risk areas in the codebase. Core tournament flows exist in shape, but bracket creation, advancement, result confirmation, and order-of-play generation each contain logic that can break real tournament execution.
**Incidents:**
- [INC-004] `src/application/services/bracket.service.ts` line 116 — Bracket generation bypasses the generator path and saves only a shell bracket, so draw structure, phases, and matches are never built here. | Severity: BLOCKER
- [INC-005] `src/application/services/phase-progression.service.ts` line 223 — Qualifier advancement filters standings by `sourcePhaseId` as if it were a bracket ID, so completed phases can produce the wrong qualifier set. | Severity: BLOCKER
- [INC-006] `src/application/services/result-confirmation.service.ts` line 117 — Result confirmation skips participant authorization and full match-state validation, so FR24-FR27 can succeed without enforcing the intended workflow. | Severity: BLOCKER
- [INC-007] `src/application/services/order-of-play.service.ts` line 253 — Automatic scheduling starts from `matchRepository.findAll()` and can schedule matches from unrelated tournaments. | Severity: BLOCKER

### G3.4 – Auth, User, Ranking & Privacy Services
**Note:** This group contains several cross-cutting correctness failures. Authorization is over-broad, ranking/seeding logic is inconsistent with the model, and GDPR/account flows can report success without completing the requested effect.
**Incidents:**
- [INC-008] `src/application/services/authentication.service.ts` line 135 — JWT validation uses raw `atob` on the token payload and can reject valid base64url-encoded tokens. | Severity: BLOCKER
- [INC-009] `src/application/services/authorization.service.ts` line 88 — Authorization rules grant blanket access to broad action classes, bypassing intended resource and privacy checks. | Severity: BLOCKER
- [INC-010] `src/application/services/ranking.service.ts` line 212 — Ranking DTO mapping reads `totalPoints` and `rankingSystem`, but the domain entity uses different field names, so mapped data is incomplete or wrong. | Severity: BLOCKER
- [INC-011] `src/application/services/ranking.service.ts` line 189 — Seed calculation ignores the target `categoryId` and ranks the global table instead of actual category participants. | Severity: BLOCKER
- [INC-012] `src/application/services/gdpr.service.ts` line 378 — Account deletion still delegates to placeholder anonymization logic, so a success response can be returned without erasing data. | Severity: BLOCKER

### G3.5 – Announcements, Notifications & Export Services
**Note:** Announcement flow is relatively simple, but notification and export paths show contract drift. The most defensible issue in this group is the mismatch between the export contract and its implementation surface.
**Incidents:**
- [INC-013] `src/application/services/export.service.ts` line 60 — Export service returns browser-download side effects instead of the declared DTO-oriented contract, weakening interface enforcement. | Severity: MINOR

### G3.6 – Generators, Scheduling & Service Support
**Note:** The generator support structure is present, but seeding is not doing what the project claims. Even a correct bracket generator cannot place participants reliably if seeds are computed and stored incorrectly.
**Incidents:**
- [INC-014] `src/application/services/seeding.service.ts` line 77 — Automatic seed assignment sorts by existing `seedNumber` instead of participant ranking. | Severity: BLOCKER
- [INC-015] `src/application/services/seeding.service.ts` line 90 — Seeding logic writes and reads a non-existent `seed` property instead of the registration model’s `seedNumber`. | Severity: BLOCKER

### G4.1 – Backend Competition Services
**Note:** The core competition services reviewed here are internally more coherent than the frontend orchestration layer. I did not find a stronger backend competition-service defect than the controller, notification, and persistence issues reported elsewhere.
**Incidents:**
- None.

### G4.2 – Backend Support & Delivery Services
**Note:** Backend support services have both reliability and layering drift. Notification delivery semantics are wrong, and invitation validation paths can fail with the wrong error contract.
**Incidents:**
- [INC-016] `backend/src/application/services/notification.service.ts` line 88 — The pipeline returns early when in-app delivery is disabled, so external channels are never attempted even when enabled. | Severity: BLOCKER
- [INC-017] `backend/src/application/services/partner-invitation.service.ts` line 75 — Invitation validation uses an undefined `ErrorCode` symbol, making error handling unpredictable on invalid requests. | Severity: BLOCKER
- [INC-018] `backend/src/application/services/announcement.service.ts` line 26 — Application services import shared error types from presentation middleware, violating the inward dependency rule. | Severity: MINOR

### G5.1 – Frontend Repository Implementations
**Note:** Most repository files mirror the intended HTTP abstraction pattern. The registration repository, however, breaks its contract by silently narrowing a general update call to a seed-only patch.
**Incidents:**
- [INC-019] `src/infrastructure/repositories/registration.repository.ts` line 75 — Registration updates only send `seedNumber`, so callers cannot reliably persist other registration mutations through the interface. | Severity: BLOCKER

### G5.2 – Frontend External Integrations
**Note:** This layer shows more architectural intent than production readiness. The export adapter is still a simulated placeholder rather than a real infrastructure implementation.
**Incidents:**
- [INC-020] `src/infrastructure/external/export-service.ts` line 40 — Export adapter is still a timer-based simulation, so the documented infrastructure integration is incomplete. | Severity: MINOR

### G5.3 – Frontend HTTP & WebSocket Clients
**Note:** The client layer contains both routing bugs and design-boundary violations. Authentication redirect behavior is deployment-sensitive, and WebSocket usage is unsafe for anonymous/public contexts.
**Incidents:**
- [INC-021] `src/infrastructure/http/axios-client.ts` line 103 — Auth redirect hardcodes `/login`, bypassing the deployed base path and Angular router state. | Severity: BLOCKER
- [INC-022] `src/infrastructure/websocket/websocket.service.ts` line 16 — WebSocket infrastructure depends directly on `AuthStateService` from presentation. | Severity: MINOR
- [INC-023] `src/infrastructure/websocket/websocket.service.ts` line 74 — `on()` subscribes even when no socket was connected, so public contexts can hit an uninitialized client path. | Severity: BLOCKER

### G6.1 – Database Bootstrap, Seeds & Tools
**Note:** Environment setup is not deterministic today. Bootstrap tooling still treats schema synchronization as the primary mechanism instead of the checked-in migration history.
**Incidents:**
- [INC-024] `backend/scripts/init-database.sh` line 31 — Bootstrap enables synchronize and starts the dev server on a timer instead of running explicit migrations. | Severity: BLOCKER

### G6.2 – Database Migrations
**Note:** Migration files exist, but the runtime configuration does not use them. That makes the migration layer mostly ceremonial and increases schema drift risk.
**Incidents:**
- [INC-025] `backend/src/infrastructure/database/data-source.ts` line 43 — Runtime DataSource registers no migrations, so the checked-in migration files are never applied by the migration runner. | Severity: BLOCKER

### G6.3 – Notification Delivery Integrations
**Note:** The external delivery adapters are relatively defensive and not the primary source of the notification failures observed. The higher-risk issue is the application-layer channel-selection bug already captured above.
**Incidents:**
- None.

### G7.1 – App Shell, Guards, Interceptors & Presentation Services
**Note:** Session and error handling are inconsistent across HTTP stacks and routes. The shell works in the simple case, but protected and public flows diverge enough to create broken redirects and false logout behavior.
**Incidents:**
- [INC-026] `src/application/services/session-inactivity.service.ts` line 27 — Session timeout watches the wrong token key and redirects to `/auth/login`, which is not a configured route. | Severity: BLOCKER
- [INC-027] `src/presentation/interceptors/error.interceptor.ts` line 39 — Public announcements, rankings, and statistics are missing from the interceptor’s 401/403 allowlist, so public pages can redirect as if they were protected. | Severity: BLOCKER

### G7.2 – Header Component & Legacy Backups
**Note:** The header component is small and not obviously broken in the reviewed paths. The backup files are stale clutter, but I did not find a material runtime issue tied to this group.
**Incidents:**
- None.

### G7.3 – Notification & Bracket Components
**Note:** Bracket rendering is mostly coherent with the routed match view. The notification bell, however, deep-links users into an announcement route contract that the destination cannot satisfy.
**Incidents:**
- [INC-028] `src/presentation/components/notification-bell/notification-bell.component.ts` line 515 — Announcement notifications navigate without `tournamentId`, so the destination page redirects away from the referenced content. | Severity: BLOCKER

### G8.1 – Admin, Auth, Home & Dashboard Pages
**Note:** This group contains both access-control drift and dead-end navigation. The public registration form exposes privileged role selection, and admin affordances do not consistently land on real screens.
**Incidents:**
- [INC-029] `src/presentation/pages/auth/register/register.component.ts` line 247 — Public registration offers organizer-role self-selection and submits it unchanged. | Severity: BLOCKER
- [INC-030] `src/presentation/pages/dashboard.component.ts` line 296 — Admin shortcut points to `/admin/dashboard`, which is not defined in the route table. | Severity: MINOR
- [INC-031] `src/presentation/pages/admin/admin-dashboard/admin-dashboard.component.ts` line 113 — Manage Users action is still a placeholder alert even though a users route exists. | Severity: MINOR

### G8.2 – Announcement Pages
**Note:** Announcement routing is internally inconsistent. The list screen behaves as tournament-scoped only, while the route table exposes it as a direct public page and leaves management screens unguarded.
**Incidents:**
- [INC-032] `src/presentation/pages/announcements/announcement-list/announcement-list.component.ts` line 119 — Public announcement list immediately redirects away when `tournamentId` is missing, making direct navigation unusable. | Severity: BLOCKER
- [INC-033] `src/presentation/app.routes.ts` line 161 — Announcement create/edit routes have no auth or role guards, exposing management screens to untrusted navigation. | Severity: BLOCKER

### G8.3 – Match & Bracket Pages
**Note:** The bracket-to-match navigation path is coherent, but score-entry permissions are not. The match detail page does not support the referee-driven workflow described by the architecture.
**Incidents:**
- [INC-034] `src/presentation/pages/matches/match-detail/match-detail.component.ts` line 257 — Match management only enables actions for admin roles, excluding referees from the intended live scoring flow. | Severity: BLOCKER

### G8.4 – Order of Play, Ranking, Standings & Statistics Pages
**Note:** These screens mostly render the expected data surfaces, but there is still contract drift. Ranking system switching is not real, and one back-navigation path is dead.
**Incidents:**
- [INC-035] `src/application/services/ranking.service.ts` line 39 — Non-ELO views only relabel the same ranking data instead of computing distinct systems. | Severity: MINOR
- [INC-036] `src/presentation/pages/statistics/statistics-view/statistics-view.component.ts` line 114 — Back navigation targets `/dashboard`, which does not exist. | Severity: MINOR

### G8.5 – Registrations, Notifications, Invitations, Profile & Phase Pages
**Note:** Most screens in this group are serviceable, but navigation contracts still drift. Notifications and profile flows both contain links that do not land on valid destinations.
**Incidents:**
- [INC-037] `src/presentation/pages/notifications/notification-list/notification-list.component.ts` line 217 — Inbox announcement notifications navigate without the tournament context required by the announcement list page. | Severity: BLOCKER
- [INC-038] `src/presentation/pages/profile/profile-view/profile-view.component.html` line 272 — Profile back link points to `/dashboard`, which is not routed. | Severity: MINOR

### G8.6 – Tournament Management Pages
**Note:** Tournament CRUD screens are fairly complete, but route protection is too weak for organizer-only workflows. Any authenticated user can reach screens that should be role-limited.
**Incidents:**
- [INC-039] `src/presentation/app.routes.ts` line 51 — Tournament create/edit routes are protected only by `authGuard`, not by organizer/admin role checks. | Severity: BLOCKER

### G9.1 – Core Tournament, Match & Registration Controllers
**Note:** The registration controller handles a lot of business branching, but still trusts callers too much before persistence. Combined with the missing entity-level uniqueness invariant, that leaves registration integrity exposed.
**Incidents:**
- [INC-040] `backend/src/presentation/controllers/registration.controller.ts` line 221 — Registration creation paths do not reject duplicates before save, allowing repeated inserts for the same participant/category/tournament combination. | Severity: BLOCKER

### G9.2 – Auth, User, Announcement & Notification Controllers
**Note:** This is another high-risk area. Public registration can escalate privileges, and the refresh-token contract is incomplete because login never equips clients to use the refresh endpoint.
**Incidents:**
- [INC-041] `backend/src/presentation/controllers/auth.controller.ts` line 112 — Public registration accepts any role except `SYSTEM_ADMIN`, allowing self-service creation of `TOURNAMENT_ADMIN` accounts. | Severity: BLOCKER
- [INC-042] `backend/src/presentation/controllers/auth.controller.ts` line 65 — Login/registration responses issue only access tokens while the refresh endpoint expects a client-supplied refresh token that is never issued. | Severity: BLOCKER

### G9.3 – Middleware, Upload & Route Wiring
**Note:** Middleware is mostly conventional, but route wiring contains dead duplication. That is not the most severe issue in the project, but it is a concrete maintenance and behavior defect in the auth surface.
**Incidents:**
- [INC-043] `backend/src/presentation/routes/index.ts` line 95 — `/auth/login` is registered twice, leaving the second no-cache variant unreachable. | Severity: MINOR

### G10.1 – Frontend Shared Utilities, Pipes & Environments
**Note:** Shared configuration is not internally coherent. Different parts of the frontend can default to different backend hosts, and the shared event contract does not match what the backend actually emits.
**Incidents:**
- [INC-044] `src/shared/constants.ts` line 16 — Shared constants and environment defaults point to different production backend hosts, so HTTP and socket clients can drift to different servers. | Severity: BLOCKER
- [INC-045] `src/shared/constants.ts` line 66 — Shared event literals use `order-of-play:updated`, but the backend emits a different event name. | Severity: MINOR

### G10.2 – Frontend Styles & Type Definitions
**Note:** Styling and type-declaration files were low-risk in this review. I did not find a concrete defect in this group worth raising above the larger functional issues.
**Incidents:**
- None.

### G10.3 – Backend Shared Config, Constants & Utilities
**Note:** Configuration is centralized, but one security-sensitive fallback is unsafe. Refresh-token security currently depends on a variable that startup does not require.
**Incidents:**
- [INC-046] `backend/src/shared/config/index.ts` line 44 — Refresh secret falls back to a known literal and is not required by startup validation, weakening token forgery resistance in misconfigured deployments. | Severity: BLOCKER

### G10.4 – Application Entry Points & Runtime Bootstrap
**Note:** Entry-point flow itself is readable once configuration and database initialization are correct. I did not find an additional defect here stronger than the bootstrap and migration issues already reported.
**Incidents:**
- None.

### G10.5 – Barrel Exports & Module Indexes
**Note:** Barrel files are mostly harmless, but they show maintenance drift. In a codebase this size, stale index surfaces make architectural boundaries harder to audit.
**Incidents:**
- [INC-047] `src/domain/enumerations/index.ts` line 33 — The barrel exports `confirmation-status` twice, which is a stale-index smell and a maintenance liability. | Severity: MINOR

### G11.1 – Frontend Application Service Tests
**Note:** The frontend service test layer gives a false sense of safety. Many suites are placeholders that only assert construction and never execute real service behavior.
**Incidents:**
- [INC-048] `tests/application/services/authentication.service.test.ts` line 21 — Core service suites follow a placeholder pattern that never validates business behavior or dependency wiring. | Severity: BLOCKER

### G11.2 – Frontend Domain Entity Tests
**Note:** Domain test breadth exists, but not meaningful behavioral depth. These tests currently do not defend entity invariants or state transitions.
**Incidents:**
- [INC-049] `tests/domain/entities/tournament.test.ts` line 21 — Domain entity suites are placeholder tests and do not validate constructor rules, transitions, or invariants. | Severity: BLOCKER

### G11.3 – Frontend Manual Validators & Mocks
**Note:** The mocks in this group are not the main issue. The manual privacy validator itself is weak evidence because it can print a success summary without enforcing failures.
**Incidents:**
- [INC-050] `tests/manual/privacy-configuration-validator.ts` line 164 — Manual validator hardcodes a successful summary instead of failing the run when checks do not pass. | Severity: MINOR

### G11.4 – End-to-End Tests
**Note:** There is one meaningful E2E workflow here, but it is not isolated well enough. The suite mutates backend state and assumes a fixed local topology, which makes repeated execution unreliable.
**Incidents:**
- [INC-051] `e2e/doubles-tournament.spec.ts` line 424 — E2E cleanup deletes tournaments only and leaves created users, invitations, and related doubles state behind. | Severity: BLOCKER
- [INC-052] `e2e/doubles-tournament.spec.ts` line 17 — E2E seeding is hardcoded to `localhost:3000`, making the suite brittle outside one local backend setup. | Severity: MINOR

### G11.5 – Backend Application Tests
**Note:** Backend application coverage is materially thinner than the architecture and docs imply. One backend service test plus a very lax coverage gate is not enough protection for this backend.
**Incidents:**
- [INC-053] `backend/jest.config.js` line 59 — Coverage thresholds are too low to protect critical backend workflows and can pass with minimal real behavior coverage. | Severity: BLOCKER

### G12.1 – Root Configuration & Tooling
**Note:** The active toolchain has drifted from the documented Angular-plus-Vite architecture. The repo now relies on runtime/compiler workarounds rather than the intended plugin-based setup.
**Incidents:**
- [INC-054] `vite.config.ts` line 15 — The documented Angular Vite plugin path is disabled, so the implemented tooling no longer matches the stated architecture. | Severity: MINOR

### G12.2 – Root Docs, Specifications & Review Inputs
**Note:** Project documentation is generally organized, but operator-facing command guidance is not fully accurate. That weakens the docs as a reliable source of truth for maintenance.
**Incidents:**
- [INC-055] `README.md` line 94 — README command table references workflows that do not match the real package scripts. | Severity: MINOR

### G12.3 – Public Assets & PWA Files
**Note:** The PWA files overstate offline readiness. The service worker explicitly avoids caching the production bundles needed to boot the app shell and is not base-path aware.
**Incidents:**
- [INC-056] `public/sw.js` line 80 — Service worker skips JavaScript bundles, so offline startup cannot reliably work despite the PWA/offline claims. | Severity: BLOCKER
- [INC-057] `public/sw.js` line 29 — Precache paths are root-relative and ignore the project’s subpath deployment model. | Severity: MINOR

### G12.4 – Frontend Operational Scripts
**Note:** Backup automation is documented, but its defaults do not align with the backend configuration. That creates an operator-error path where the wrong database is backed up or restored.
**Incidents:**
- [INC-058] `scripts/backup-database.sh` line 22 — Backup script defaults to `tennis_tournament_db`, while backend config defaults to `tennis_tournament_manager`. | Severity: BLOCKER

### G12.5 – Backend Configuration & Deployment Notes
**Note:** Deployment notes are close to operationally useful, but one frontend variable name is wrong. Following the guide literally can leave the frontend pointed at the wrong API host or a hardcoded fallback.
**Incidents:**
- [INC-059] `backend/QUICK-START-RENDER.md` line 161 — Deployment guide uses `VITE_API_URL`, but the frontend reads `VITE_API_BASE_URL`. | Severity: BLOCKER

### G12.6 – Backend Operational Scripts & SQL Utilities
**Note:** This group contains the most dangerous operator-facing artifact in the repository. A generic-looking repair SQL script performs irreversible role rewrites and user deletion.
**Incidents:**
- [INC-060] `backend/scripts/check-and-fix-roles.sql` line 7 — Repair SQL deletes `SPECTATOR` users and rewrites `REFEREE` to `TOURNAMENT_ADMIN`, which is destructive and unsuitable as a routine utility. | Severity: BLOCKER

---
## Final Codebase Note
The project still shows a recognizable layered architecture, and the codebase is organized enough that responsibilities are usually discoverable by layer and feature. The main problem is not lack of structure but drift: route protection, auth flows, ranking/seeding logic, notification delivery, migration handling, and operational scripts no longer line up cleanly with the documented design. Several high-risk workflows can report success without performing the intended effect, especially around bracket generation, GDPR deletion, registration integrity, refresh/session handling, and offline/runtime configuration. The frontend and backend each have some solid local structure, but the codebase as a whole needs a pass focused on contract alignment and end-to-end workflow integrity rather than more feature growth.

---
## Summary Statistics
- Total files reviewed: 573
- Blockers: 43
- Minor issues: 17
- Overall health: 🔴 CRITICAL

		```