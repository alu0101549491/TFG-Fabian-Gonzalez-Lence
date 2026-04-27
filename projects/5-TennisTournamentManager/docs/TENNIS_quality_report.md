# Tennis Tournament Manager — ISO/IEC 25010 Quality Report

**Date:** 2026-04-27
**Analyst:** GitHub Copilot Code Quality Agent
**Standard:** ISO/IEC 25010 (SQuaRE) + SonarQube rule alignment
**Application Complexity Tier:** High
**Files Reviewed:** ≈ 28 frontend services + 21 backend controllers + 14 backend services + 18 entities + 19 enums + extensive E2E (Playwright × 6 browsers)

---

## Executive Summary

The Tennis Tournament Manager has solid architectural fundamentals — Angular 19 frontend with dependency-injected services, Express + TypeORM backend, 18-entity domain model, RLS-ready Supabase persistence, mature Playwright E2E suite — but ships with **two critical, blocking defects**: (1) `admin.middleware.ts` checks for the role string `'ADMIN'` while the `UserRole` enum only defines `SYSTEM_ADMIN`/`TOURNAMENT_ADMIN`/`PLAYER`, so **every admin-protected endpoint is denied**; (2) `result-confirmation.service.ts` has six TODO branches that report success without persisting match-state changes or notifying participants, breaking the result workflow specified by FR26. Beyond these, the tournament-deletion path performs nested O(C × B × M) queries with no eager loading, the consolation-draw / lucky-loser promotion logic is unimplemented (4 TODOs in `phase-progression.service.ts`), and five injectables (TiebreakResolver, CourtScheduler, RankingCalculator, IPaymentGateway, QuotaManager) are referenced but never provided — runtime failures await any code path that exercises them. Type safety is undermined by 30+ `as any` casts in `statistics.service.ts` and 20+ direct `AppDataSource.getRepository()` calls in `match.controller.ts` (DI anti-pattern). The codebase is feature-complete in breadth, well-styled, and accessibility-aware, but **must not be deployed** until the two CRITICAL items and the five HIGH items are resolved.

---

## Quality Characteristic Ratings

| Characteristic | Sub-characteristics evaluated | Rating | Confidence |
|---|---|---|---|
| Functional Suitability | Completeness, Correctness, Appropriateness | 🟡 | High |
| Performance Efficiency | Time Behaviour, Resource Utilisation, Capacity | 🟡 | Medium |
| Compatibility | Co-existence, Interoperability | 🟢 | High |
| Usability | Learnability, Operability, Accessibility, Error Protection | 🟢 | Medium |
| Reliability | Maturity, Fault Tolerance, Recoverability, Availability | 🟡 | High |
| Security | Confidentiality, Integrity, Authenticity, Non-repudiation, Accountability | 🟡 | High |
| Maintainability | Modularity, Reusability, Analysability, Modifiability, Testability | 🟡 | Medium |
| Portability | Adaptability, Installability, Replaceability | 🟢 | High |

---

## Full Incident List

- [ ] [TENNIS-QA-001] [Backend / Auth] [backend/src/presentation/middleware/admin.middleware.ts](projects/5-TennisTournamentManager/backend/src/presentation/middleware/admin.middleware.ts) — Middleware checks `'ADMIN'` but enum defines `SYSTEM_ADMIN`/`TOURNAMENT_ADMIN`; all admin endpoints blocked | 🟠 CRITICAL
- [ ] [TENNIS-QA-002] [Frontend / Match] [src/application/services/result-confirmation.service.ts](projects/5-TennisTournamentManager/src/application/services/result-confirmation.service.ts) — 6 TODOs leave notifications and match-state updates unimplemented (FR26 violation) | 🟠 CRITICAL
- [ ] [TENNIS-QA-003] [Backend / Tournament] [backend/src/presentation/controllers/tournament.controller.ts](projects/5-TennisTournamentManager/backend/src/presentation/controllers/tournament.controller.ts) — Nested loops on delete: O(C × B × M) queries; no eager loading | 🟠 CRITICAL
- [ ] [TENNIS-QA-004] [Frontend / Phase] [src/application/services/phase-progression.service.ts](projects/5-TennisTournamentManager/src/application/services/phase-progression.service.ts) — Consolation-draw / lucky-loser promotion: 4 TODOs (feature non-functional) | 🟠 CRITICAL
- [ ] [TENNIS-QA-005] [Frontend / Multiple] services — 5 missing injectables: TiebreakResolver, CourtScheduler, RankingCalculator, IPaymentGateway, QuotaManager (runtime crashes) | 🟠 CRITICAL
- [ ] [TENNIS-QA-006] [Frontend / Stats] [src/application/services/statistics.service.ts](projects/5-TennisTournamentManager/src/application/services/statistics.service.ts) — 10+ `(match as any)` casts; no `DoublesMatch` type guard | 🟡 MAJOR
- [ ] [TENNIS-QA-007] [Backend / Match] [backend/src/presentation/controllers/match.controller.ts](projects/5-TennisTournamentManager/backend/src/presentation/controllers/match.controller.ts) — 20+ direct `AppDataSource.getRepository()` calls (DI anti-pattern) | 🟡 MAJOR
- [ ] [TENNIS-QA-008] [WebSocket] [src/infrastructure/websocket/websocket.service.ts](projects/5-TennisTournamentManager/src/infrastructure/websocket/websocket.service.ts), [backend/src/websocket-server.ts](projects/5-TennisTournamentManager/backend/src/websocket-server.ts) — No `socket.off()` cleanup on destroy / reconnect | 🟡 MAJOR
- [ ] [TENNIS-QA-009] [Frontend] [src/main.ts](projects/5-TennisTournamentManager/src/main.ts) — `unhandledrejection` listener logs only; no user-visible feedback | 🟡 MAJOR
- [ ] [TENNIS-QA-010] [Frontend / GDPR] [src/application/services/gdpr.service.ts](projects/5-TennisTournamentManager/src/application/services/gdpr.service.ts) — TODO + `await` in loop without `Promise.all()` | 🟡 MAJOR
- [ ] [TENNIS-QA-011] [Frontend / Tournament] [src/application/services/tournament.service.ts](projects/5-TennisTournamentManager/src/application/services/tournament.service.ts) — `requestData as unknown as Tournament` bypasses validation | 🟡 MAJOR
- [ ] [TENNIS-QA-012] [Backend / Roles] [backend/src/domain/enumerations/user-role.ts](projects/5-TennisTournamentManager/backend/src/domain/enumerations/user-role.ts) — Enum lacks `REFEREE` and `SPECTATOR` values referenced elsewhere | 🟡 MAJOR
- [ ] [TENNIS-QA-013] [Backend / Auth] [backend/src/presentation/middleware/auth.middleware.ts](projects/5-TennisTournamentManager/backend/src/presentation/middleware/auth.middleware.ts) — No refresh-token rotation / silent renewal | 🟡 MAJOR
- [ ] [TENNIS-QA-014] [Frontend / Services] services — ~40 % of subscriptions lack `takeUntil` / `unsubscribe` (RxJS leaks) | 🟡 MAJOR
- [ ] [TENNIS-QA-015] [Backend / Controllers] all 21 controllers — Inconsistent error response format; no centralised error middleware | 🟡 MAJOR
- [ ] [TENNIS-QA-016] [Backend / Seeds] [backend/src/infrastructure/database/seed.ts](projects/5-TennisTournamentManager/backend/src/infrastructure/database/seed.ts), `.env.backup.example`, `e2e/.auth/*.json` — Hardcoded IDs/credentials in repo | 🟡 MAJOR
- [ ] [TENNIS-QA-017] [Tests] [tests/](projects/5-TennisTournamentManager/tests/) — 24 tests across 28 services; many backend services uncovered | 🟡 MAJOR
- [ ] [TENNIS-QA-018] [Backend / Auth] [backend/src/presentation/controllers/registration.controller.ts](projects/5-TennisTournamentManager/backend/src/presentation/controllers/registration.controller.ts), [user.controller.ts](projects/5-TennisTournamentManager/backend/src/presentation/controllers/user.controller.ts) — Authorisation checks duplicated between controller and service | 🔵 MINOR
- [ ] [TENNIS-QA-019] [Backend / Config] [backend/src/shared/config/index.ts](projects/5-TennisTournamentManager/backend/src/shared/config/index.ts), [.env.example](projects/5-TennisTournamentManager/backend/.env.example) — `validateConfig()` does not enforce JWT secret length / URI validity | 🔵 MINOR
- [ ] [TENNIS-QA-020] [Frontend / Pages] [src/presentation/pages/matches/my-matches/my-matches.component.ts](projects/5-TennisTournamentManager/src/presentation/pages/matches/my-matches/my-matches.component.ts) — Tournament name hardcoded as `'Tournament'` in PDF export | 🔵 MINOR
- [ ] [TENNIS-QA-021] [Backend / Bracket] [backend/src/presentation/controllers/bracket.controller.ts](projects/5-TennisTournamentManager/backend/src/presentation/controllers/bracket.controller.ts) — `🐛 DEBUG` console.log in production code | 🔵 MINOR
- [ ] [TENNIS-QA-022] [Backend / Scripts] [backend/src/scripts/populate-phase-tournament-ids.ts](projects/5-TennisTournamentManager/backend/src/scripts/populate-phase-tournament-ids.ts) — `where: { tournamentId: null as any }` should be `IsNull()` | 🔵 MINOR
- [ ] [TENNIS-QA-023] [E2E] [e2e/critical/draw-generation.spec.ts](projects/5-TennisTournamentManager/e2e/critical/draw-generation.spec.ts) — DOM selector fragility; `data-testid` not consistently applied | 🔵 MINOR
- [ ] [TENNIS-QA-024] [Backend / Audit] [backend/src/application/services/audit.service.ts](projects/5-TennisTournamentManager/backend/src/application/services/audit.service.ts) — Logs persisted but no query endpoints | 🔵 MINOR
- [ ] [TENNIS-QA-025] [Backend / Email] [backend/src/infrastructure/email/email.service.ts](projects/5-TennisTournamentManager/backend/src/infrastructure/email/email.service.ts) — Plaintext SMTP password in config object risks log leakage | 🔵 MINOR

---

## Detailed Findings by Quality Characteristic

### 1. Functional Suitability — 🟡 NEEDS WORK
The breadth of features (21 CRUD controllers, 28 frontend services, all 9 acceptance-type states, 12 match states) is broad and faithful to the spec, but Functional **Completeness** and **Correctness** are compromised by the 10 TODO clusters: result-confirmation (TENNIS-QA-002), consolation draw (TENNIS-QA-004), 5 missing injectables (TENNIS-QA-005), GDPR consent update (TENNIS-QA-010), and the hardcoded tournament label in PDF export (TENNIS-QA-020). Bracket generators are now correctly instantiated via DI (the prior "factory throws" issue is resolved), and acceptance types are fully enumerated.

### 2. Performance Efficiency — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| TENNIS-QA-003 | [backend/src/presentation/controllers/tournament.controller.ts](projects/5-TennisTournamentManager/backend/src/presentation/controllers/tournament.controller.ts) | delete | O(C × B × M) per delete; no eager loading | 🟠 CRITICAL |
| TENNIS-QA-008 | WebSocket layer | listeners | Listener accumulation on reconnect | 🟡 MAJOR |
| TENNIS-QA-014 | services | RxJS | ~40 % unsubscribed observables | 🟡 MAJOR |
| TENNIS-QA-010 | gdpr.service.ts | export | `await` in `forEach` | 🟡 MAJOR |

### 3. Compatibility — 🟢 GOOD
Multi-browser Playwright (6 profiles), responsive Vite + Angular standalone components, TypeORM database portability, Socket.IO 4.7.5.

### 4. Usability — 🟢 GOOD
Privacy controls (8 levels), role-based pages, ARIA labels, session-inactivity timeout. Gap: TENNIS-QA-009 (silent failures from unhandled rejections).

### 5. Reliability — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| TENNIS-QA-001 | [backend/src/presentation/middleware/admin.middleware.ts](projects/5-TennisTournamentManager/backend/src/presentation/middleware/admin.middleware.ts) | role check | Mismatch — Maturity/Authenticity failure | 🟠 CRITICAL |
| TENNIS-QA-002 | [src/application/services/result-confirmation.service.ts](projects/5-TennisTournamentManager/src/application/services/result-confirmation.service.ts) | 6 TODOs | Operations report success without effect | 🟠 CRITICAL |
| TENNIS-QA-005 | services | injectables | Runtime crashes possible | 🟠 CRITICAL |
| TENNIS-QA-008 | WebSocket | listeners | Memory leak | 🟡 MAJOR |
| TENNIS-QA-015 | controllers | error format | Inconsistent — Recoverability gap | 🟡 MAJOR |

### 6. Security — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| TENNIS-QA-001 | admin.middleware.ts | role check | Auth bypass *style* defect (denies legitimate admins; doesn't grant access) | 🟠 CRITICAL |
| TENNIS-QA-013 | auth.middleware.ts | refresh | No rotation — `security:S5332` | 🟡 MAJOR |
| TENNIS-QA-016 | seed/.env/.auth | secrets | Hardcoded test credentials in repo | 🟡 MAJOR |
| TENNIS-QA-019 | config validator | env | Length/URI checks missing | 🔵 MINOR |
| TENNIS-QA-025 | email.service.ts | config | Plaintext password in object | 🔵 MINOR |

> Strengths: Helmet headers, GDPR consent checkpoints, privacy enforcement (ID documents always `ADMINS_ONLY`), Supabase RLS prepared.

### 7. Maintainability — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| TENNIS-QA-006 | [src/application/services/statistics.service.ts](projects/5-TennisTournamentManager/src/application/services/statistics.service.ts) | doubles | 10+ `as any` — `typescript:S6571` | 🟡 MAJOR |
| TENNIS-QA-007 | [backend/src/presentation/controllers/match.controller.ts](projects/5-TennisTournamentManager/backend/src/presentation/controllers/match.controller.ts) | DI | 20+ `getRepository()` calls in controller | 🟡 MAJOR |
| TENNIS-QA-011 | tournament.service.ts | DTO | `as unknown as Tournament` cast | 🟡 MAJOR |
| TENNIS-QA-012 | user-role.ts | enum | Missing REFEREE / SPECTATOR | 🟡 MAJOR |
| TENNIS-QA-015 | controllers | errors | No central handler | 🟡 MAJOR |
| TENNIS-QA-017 | tests | coverage | Selective; many services 0 % | 🟡 MAJOR |
| TENNIS-QA-018, -021, -022, -024 | various | smells | Duplicated auth, debug `console.log`, `null as any`, missing audit query | 🔵 MINOR |

### 8. Portability — 🟢 GOOD
Render-ready, env-driven config, multi-DB SQL via TypeORM, Vite SPA build.

---

## SonarQube-Category Summary

| Category | Count | Notable examples |
|---|---|---|
| Bugs | 5 | TENNIS-QA-001, -002, -003, -010, -011 |
| Vulnerabilities | 5 | TENNIS-QA-001, -013, -016, -019, -025 |
| Code Smells | 13 | TENNIS-QA-006, -007, -008, -012, -014, -015, -018, -021, -022, -024, -005 (residual TODOs), -017, -004 |
| Coverage Gaps | 2 | TENNIS-QA-017, -023 |

---

## Style Guide Compliance (Google Style Guide + TFG Standards)
**Overall:** Compliant (≈ 88 %)

| Rule | Status | Files affected |
|---|---|---|
| TFG file header present and complete | ✅ | broad coverage (`@since`, `@desc`, `@see`) |
| Explicit access modifiers on class members | ✅ | 0 |
| TSDoc/JSDoc on all public APIs | ✅ | good |
| `camelCase` / `PascalCase` naming conventions | ✅ | 0 |
| No magic numbers / magic strings | ⚠️ | hardcoded labels (TENNIS-QA-020) |
| Consistent import ordering | ⚠️ | backend lacks path aliases |
| `catch (unknown)` instead of `any` | ⚠️ | many `as any` (TENNIS-QA-006, -011, -022) |
| Centralised error handling | ❌ | TENNIS-QA-015 |

---

## Summary Statistics
- Total source files reviewed: ≈ 100+ TS source files (frontend + backend)
- 🔴 Blockers: 0
- 🟠 Critical: 5
- 🟡 Major: 12
- 🔵 Minor: 8
- Total incidents: 25
- **Overall Quality Score:** 🔴 CRITICAL

> Coordination: TENNIS-QA-001 is a one-line fix for the Coding Agent. TENNIS-QA-002, -004, -005 require Architecture Agent review (define interfaces, data flow, event model). TENNIS-QA-003 is a Coding Agent task with measurable performance regression test (Testing Agent). TENNIS-QA-017 is the Testing Agent's priority work — bracket generation, ranking, and notification channels need unit + integration tests.
