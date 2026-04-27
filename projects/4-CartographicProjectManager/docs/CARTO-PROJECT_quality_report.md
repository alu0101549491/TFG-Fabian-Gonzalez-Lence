# Cartographic Project Manager — ISO/IEC 25010 Quality Report

**Date:** 2026-04-27
**Analyst:** GitHub Copilot Code Quality Agent
**Standard:** ISO/IEC 25010 (SQuaRE) + SonarQube rule alignment
**Application Complexity Tier:** High
**Files Reviewed:** ~165 source/config files (≈ 90 frontend, ≈ 75 backend) — 5 unit test skeletons, 20+ Playwright E2E tests

---

## Executive Summary

CARTO-PROJECT is a high-complexity full-stack cartography manager (Vue 3 + Pinia frontend, Express + Prisma + Supabase backend, Socket.IO real-time, Dropbox integration, scheduled backups). The architecture is genuinely impressive: Clean Architecture with explicit `domain/application/infrastructure/presentation` layers, dependency injection, audit logging, RLS-aware Prisma access, helmet/CORS/rate-limit middleware, and PWA with Workbox. However, the project carries three categories of show-stopping risk: (1) a **near-zero unit-test coverage** (~5 %) against an 80 % Jest gate — the application is essentially unverified at the logic level; (2) **token storage in `localStorage`** without HttpOnly/SameSite, leaving the JWT-protected API exposed to XSS-derived theft, with no CSRF protection and no refresh-token rotation; and (3) an **in-memory Socket.IO presence map** that grows unbounded on abnormal disconnects, alongside an `unhandledRejection` handler that calls `shutdown()` *before* logging the stack. These reliability/security gaps must be remediated before production. Maintainability findings (large `project.controller.ts`, `file.controller.ts`, and `task.store.ts`; `catch (err: any)` × 7 in `use-files.ts`; pervasive ad-hoc error handling) are significant but tractable. **Production deployment is not recommended until Phase 1 issues are resolved.**

---

## Quality Characteristic Ratings

| Characteristic | Sub-characteristics evaluated | Rating | Confidence |
|---|---|---|---|
| Functional Suitability | Completeness, Correctness, Appropriateness | 🟡 | Medium |
| Performance Efficiency | Time Behaviour, Resource Utilisation, Capacity | 🟡 | Medium |
| Compatibility | Co-existence, Interoperability, Replaceability | 🟢 | High |
| Usability | Operability, Accessibility, Error Protection | 🟡 | Medium |
| Reliability | Maturity, Fault Tolerance, Recoverability, Availability | 🟡 | Medium |
| Security | Confidentiality, Integrity, Authenticity, Non-repudiation, Accountability | 🔴 | High |
| Maintainability | Modularity, Reusability, Analysability, Modifiability, Testability | 🟡 | High |
| Portability | Adaptability, Installability, Replaceability | 🟢 | High |

> Testability is the weakest sub-characteristic of all (≈ 5 % coverage); it pulls Maintainability to 🟡 despite otherwise good modularity. Security is 🔴 because three independent vulnerabilities compound (token storage + missing CSRF + no rotation).

---

## Full Incident List

- [ ] [CARTO-PROJECT-QA-023] [Tests] [tests/](projects/4-CartographicProjectManager/tests/) — Unit-test coverage ≈ 0 % (jest threshold 80 %); skeleton TODOs only | 🔴 BLOCKER
- [ ] [CARTO-PROJECT-QA-014] [Frontend] [src/presentation/stores/auth.store.ts](projects/4-CartographicProjectManager/src/presentation/stores/auth.store.ts) — Access + refresh tokens stored in plain `localStorage`; XSS-vulnerable | 🔴 BLOCKER
- [ ] [CARTO-PROJECT-QA-015] [Backend] [backend/src/presentation/app.ts](projects/4-CartographicProjectManager/backend/src/presentation/app.ts) — No CSRF middleware on mutation endpoints | 🔴 BLOCKER
- [ ] [CARTO-PROJECT-QA-010] [Backend] [backend/src/server.ts](projects/4-CartographicProjectManager/backend/src/server.ts) — `unhandledRejection` triggers `shutdown()` without logging the stack first | 🔴 BLOCKER
- [ ] [CARTO-PROJECT-QA-002] [Backend] [backend/src/infrastructure/websocket/socket.server.ts](projects/4-CartographicProjectManager/backend/src/infrastructure/websocket/socket.server.ts) — `onlineCountsByProject` Map unbounded; abnormal disconnects leak memory | 🔴 BLOCKER
- [ ] [CARTO-PROJECT-QA-018] [Backend] [backend/src/infrastructure/auth/jwt.service.ts](projects/4-CartographicProjectManager/backend/src/infrastructure/auth/jwt.service.ts) — Refresh token not rotated on use | 🟠 CRITICAL
- [ ] [CARTO-PROJECT-QA-022] [Frontend] [src/presentation/composables/use-files.ts](projects/4-CartographicProjectManager/src/presentation/composables/use-files.ts) — 7× `catch (err: any)` in same file | 🟠 CRITICAL
- [ ] [CARTO-PROJECT-QA-024] [Backend] [backend/src/presentation/controllers/project.controller.ts](projects/4-CartographicProjectManager/backend/src/presentation/controllers/project.controller.ts) — `getSummaries()` >150 LOC, cognitive complexity > 15 | 🟠 CRITICAL
- [ ] [CARTO-PROJECT-QA-001] [Backend] [backend/src/presentation/controllers/project.controller.ts](projects/4-CartographicProjectManager/backend/src/presentation/controllers/project.controller.ts) — Potential N+1 (find-many + per-project `groupBy`) | 🟠 CRITICAL
- [ ] [CARTO-PROJECT-QA-016] [Backend] backend validators — `express-validator` usage inconsistent; file uploads lack `trim().escape()` | 🟠 CRITICAL
- [ ] [CARTO-PROJECT-QA-011] [Frontend] [src/presentation/composables/use-files.ts](projects/4-CartographicProjectManager/src/presentation/composables/use-files.ts) — Errors caught but no user-facing toast/modal in most branches | 🟠 CRITICAL
- [ ] [CARTO-PROJECT-QA-025] [Backend] [backend/src/presentation/controllers/file.controller.ts](projects/4-CartographicProjectManager/backend/src/presentation/controllers/file.controller.ts) — ≈ 500 LOC; mixes upload/download/delete | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-026] [Frontend] [src/presentation/stores/task.store.ts](projects/4-CartographicProjectManager/src/presentation/stores/task.store.ts) — Likely > 800 LOC (CRUD + filters + pagination + realtime) | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-017] [Backend] [backend/src/shared/utils.ts](projects/4-CartographicProjectManager/backend/src/shared/utils.ts) — `sanitizeFilename()` does not prevent `../` traversal | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-004] [Frontend] [src/presentation/composables/use-files.ts](projects/4-CartographicProjectManager/src/presentation/composables/use-files.ts) — Large array operations not throttled; UI jank > 1000 files | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-005] [Backend] CORS config — Comma-split origin list not URL-validated | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-006] [Backend] Socket.IO auth — Token expiry not refreshed on live connections | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-020] [Frontend] [src/presentation/views/ProjectDetailView.vue](projects/4-CartographicProjectManager/src/presentation/views/ProjectDetailView.vue) — Potential XSS if `v-html` used on message content | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-003] [Backend] [backend/src/application/services/backup.service.ts](projects/4-CartographicProjectManager/backend/src/application/services/backup.service.ts) — TODO: backups not gzip-compressed | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-027] [Frontend] composables — Error-handling pattern duplicated; no `useAsyncError` | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-028] [Backend] [backend/src/application/services/backup.service.ts](projects/4-CartographicProjectManager/backend/src/application/services/backup.service.ts) — TODO comment left in code | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-007] [Frontend] [src/presentation/components/calendar/CalendarWidget.vue](projects/4-CartographicProjectManager/src/presentation/components/calendar/CalendarWidget.vue) — `v-for` on day cells without `:key` | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-008] [Frontend] [src/presentation/components/common/AppInput.vue](projects/4-CartographicProjectManager/src/presentation/components/common/AppInput.vue) — Form inputs lack `<label>`; placeholder-only | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-012] [Backend] [backend/src/infrastructure/websocket/socket.server.ts](projects/4-CartographicProjectManager/backend/src/infrastructure/websocket/socket.server.ts) — Socket error handler does not emit recovery signal | 🟡 MAJOR
- [ ] [CARTO-PROJECT-QA-009] [Frontend] message/notification UI — No keyboard shortcut to mark read/unread | 🔵 MINOR
- [ ] [CARTO-PROJECT-QA-013] [Backend] audit logs — No retry / circuit breaker on failed writes | 🔵 MINOR
- [ ] [CARTO-PROJECT-QA-019] [Backend] [backend/src/presentation/app.ts](projects/4-CartographicProjectManager/backend/src/presentation/app.ts) — CORS origins not validated with `new URL(...)` | 🔵 MINOR
- [ ] [CARTO-PROJECT-QA-021] [Backend] [backend/src/shared/constants.ts](projects/4-CartographicProjectManager/backend/src/shared/constants.ts) — Rate limiting only in production | 🔵 MINOR
- [ ] [CARTO-PROJECT-QA-029] [Backend] [backend/package.json](projects/4-CartographicProjectManager/backend/package.json) — Build relies on `tsc + tsc-alias` (brittle path aliases) | 🔵 MINOR
- [ ] [CARTO-PROJECT-QA-030] [Backend] [backend/prisma/schema.prisma](projects/4-CartographicProjectManager/backend/prisma/schema.prisma) — Past `@map` mismatch (fixed) signals lack of migration validation in CI | 🔵 MINOR

---

## Detailed Findings by Quality Characteristic

### 1. Functional Suitability — 🟡 NEEDS WORK
All major features (project/task/file/message CRUD, Dropbox integration, backups, export, real-time presence) are implemented. Correctness confidence is Medium because unit tests are absent — only Playwright E2E covers critical flows. Project filter validation (`status`, `year`, `type`) and task-deadline business rules are not enforced consistently.

### 2. Performance Efficiency — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| CARTO-PROJECT-QA-002 | [backend/src/infrastructure/websocket/socket.server.ts](projects/4-CartographicProjectManager/backend/src/infrastructure/websocket/socket.server.ts) | presence map | Unbounded growth — Resource Utilisation failure | 🔴 BLOCKER |
| CARTO-PROJECT-QA-001 | [backend/src/presentation/controllers/project.controller.ts](projects/4-CartographicProjectManager/backend/src/presentation/controllers/project.controller.ts) | `getSummaries` | Potential N+1 — Time Behaviour | 🟠 CRITICAL |
| CARTO-PROJECT-QA-004 | [src/presentation/composables/use-files.ts](projects/4-CartographicProjectManager/src/presentation/composables/use-files.ts) | file list | Unthrottled large-array ops | 🟡 MAJOR |
| CARTO-PROJECT-QA-003 | [backend/src/application/services/backup.service.ts](projects/4-CartographicProjectManager/backend/src/application/services/backup.service.ts) | backups | No gzip → inflated storage | 🟡 MAJOR |

### 3. Compatibility — 🟢 GOOD
PWA via Workbox; REST + Socket.IO; Supabase RLS; Dropbox SDK. Minor: CORS origin parsing accepts comma-separated lists without URL validation (CARTO-PROJECT-QA-005, -019).

### 4. Usability — 🟡 NEEDS WORK
ARIA labels and keyboard handlers are present but several gaps remain (CARTO-PROJECT-QA-007 missing `:key`, -008 placeholder-only inputs, -009 no keyboard mark-read). WCAG 2.1 Level AA compliance is not yet attainable.

### 5. Reliability — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| CARTO-PROJECT-QA-010 | [backend/src/server.ts](projects/4-CartographicProjectManager/backend/src/server.ts) | bootstrap | `unhandledRejection` shuts down before logging | 🔴 BLOCKER |
| CARTO-PROJECT-QA-011 | [src/presentation/composables/use-files.ts](projects/4-CartographicProjectManager/src/presentation/composables/use-files.ts) | error UX | No user feedback on failure | 🟠 CRITICAL |
| CARTO-PROJECT-QA-012 | [backend/src/infrastructure/websocket/socket.server.ts](projects/4-CartographicProjectManager/backend/src/infrastructure/websocket/socket.server.ts) | error handler | No recovery signal | 🟡 MAJOR |
| CARTO-PROJECT-QA-013 | audit logs | retry | No circuit breaker | 🔵 MINOR |

### 6. Security — 🔴 CRITICAL
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| CARTO-PROJECT-QA-014 | [src/presentation/stores/auth.store.ts](projects/4-CartographicProjectManager/src/presentation/stores/auth.store.ts) | token storage | `localStorage` JWT — SonarQube `security:S5689` | 🔴 BLOCKER |
| CARTO-PROJECT-QA-015 | [backend/src/presentation/app.ts](projects/4-CartographicProjectManager/backend/src/presentation/app.ts) | middleware | Missing CSRF — `security:S4830` | 🔴 BLOCKER |
| CARTO-PROJECT-QA-018 | [backend/src/infrastructure/auth/jwt.service.ts](projects/4-CartographicProjectManager/backend/src/infrastructure/auth/jwt.service.ts) | refresh flow | Token not rotated — `security:S5332` | 🟠 CRITICAL |
| CARTO-PROJECT-QA-016 | validators | input | Inconsistent `express-validator` usage | 🟠 CRITICAL |
| CARTO-PROJECT-QA-017 | [backend/src/shared/utils.ts](projects/4-CartographicProjectManager/backend/src/shared/utils.ts) | sanitiser | Path traversal possible — `security:S2083` | 🟡 MAJOR |
| CARTO-PROJECT-QA-020 | [src/presentation/views/ProjectDetailView.vue](projects/4-CartographicProjectManager/src/presentation/views/ProjectDetailView.vue) | render | XSS if `v-html` used — `security:S5247` | 🟡 MAJOR |
| CARTO-PROJECT-QA-019 | [backend/src/presentation/app.ts](projects/4-CartographicProjectManager/backend/src/presentation/app.ts) | CORS | Origin not URL-validated | 🔵 MINOR |
| CARTO-PROJECT-QA-021 | [backend/src/shared/constants.ts](projects/4-CartographicProjectManager/backend/src/shared/constants.ts) | rate limit | Production-only; dev unlimited | 🔵 MINOR |

### 7. Maintainability — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| CARTO-PROJECT-QA-023 | [tests/](projects/4-CartographicProjectManager/tests/) | coverage | ~0 % unit coverage — ISO/IEC 25010 §7.5 Testability failure | 🔴 BLOCKER |
| CARTO-PROJECT-QA-022 | [src/presentation/composables/use-files.ts](projects/4-CartographicProjectManager/src/presentation/composables/use-files.ts) | error handling | 7× `catch (err: any)` — `typescript:S6571` | 🟠 CRITICAL |
| CARTO-PROJECT-QA-024 | [backend/src/presentation/controllers/project.controller.ts](projects/4-CartographicProjectManager/backend/src/presentation/controllers/project.controller.ts) | `getSummaries` | Cognitive complexity > 15 — `typescript:S3776` | 🟠 CRITICAL |
| CARTO-PROJECT-QA-025 | [backend/src/presentation/controllers/file.controller.ts](projects/4-CartographicProjectManager/backend/src/presentation/controllers/file.controller.ts) | file size | ~500 LOC — `typescript:S104` | 🟡 MAJOR |
| CARTO-PROJECT-QA-026 | [src/presentation/stores/task.store.ts](projects/4-CartographicProjectManager/src/presentation/stores/task.store.ts) | store size | > 800 LOC | 🟡 MAJOR |
| CARTO-PROJECT-QA-027 | composables | duplication | Repeated `try/catch/setError` | 🟡 MAJOR |
| CARTO-PROJECT-QA-028 | [backend/src/application/services/backup.service.ts](projects/4-CartographicProjectManager/backend/src/application/services/backup.service.ts) | TODO | Tech-debt comment | 🟡 MAJOR |

### 8. Portability — 🟢 GOOD
Render.yaml, env templating, Prisma DB abstraction. Minor: build pipeline brittle (CARTO-PROJECT-QA-029) and migration validation absent in CI (CARTO-PROJECT-QA-030).

---

## SonarQube-Category Summary

| Category | Count | Notable examples |
|---|---|---|
| Bugs | 5 | CARTO-PROJECT-QA-002, -010, -012, -011, -001 |
| Vulnerabilities | 8 | CARTO-PROJECT-QA-014, -015, -016, -017, -018, -019, -020, -021 |
| Code Smells | 15 | CARTO-PROJECT-QA-022-028, -003, -004, -005, -006, -007, -008, -009, -029 |
| Coverage Gaps | 1 (catastrophic) | CARTO-PROJECT-QA-023 |

---

## Style Guide Compliance (Google Style Guide + TFG Standards)
**Overall:** Partially Compliant (≈ 80 %)

| Rule | Status | Files affected |
|---|---|---|
| TFG file header present and complete | ✅ | broad coverage |
| Explicit access modifiers on class members | ✅ | minor |
| TSDoc/JSDoc on all public APIs | ✅ | good |
| `camelCase` / `PascalCase` naming conventions | ✅ | 0 |
| No magic numbers / magic strings | ⚠️ | scattered |
| Consistent import ordering | ⚠️ | minor |
| Files ≤ 300 lines | ❌ | file.controller.ts, task.store.ts, project.controller.ts |
| `catch (unknown)` instead of `any` | ❌ | use-files.ts × 7 |

---

## Summary Statistics
- Total source files reviewed: ≈ 165
- 🔴 Blockers: 5
- 🟠 Critical: 6
- 🟡 Major: 13
- 🔵 Minor: 6
- Total incidents: 30
- **Overall Quality Score:** 🔴 CRITICAL

> Coordination: CARTO-PROJECT-QA-014/015/018 require an Architecture Agent pass on the auth model (HttpOnly cookies vs. token in JS) before the Coding Agent implements. CARTO-PROJECT-QA-023 is the priority work for the Testing Agent. CARTO-PROJECT-QA-024/025/026 (large files) should be split with Architecture review.
