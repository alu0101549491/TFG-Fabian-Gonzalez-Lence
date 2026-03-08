# CODE REVIEW REPORT
## Cartographic Project Manager (CPM)

**Review Date:** March 5, 2026
**Reviewer:** GitHub Copilot Agent
**Codebase Version:** dd8d063
**Total Files Reviewed:** 316
**Total Groups Reviewed:** 41

---

## EXECUTIVE SUMMARY

**Overall Codebase Score:** TBD/10

**Summary:**
Initial review (Domain enumerations + entities) shows strong documentation discipline and helpful type-guard utilities, but also reveals a recurring architecture smell: Domain types are currently carrying Presentation/Infrastructure concerns (UI mappings in enums, and JSON serialization + Dropbox coupling in entities), which undermines Clean Architecture boundaries and increases coupling.

**Statistics (so far):**
- Critical Issues: 5
- High Issues: 30
- Medium Issues: 111
- Low Issues: 79
- Total Issues: 225

**Recommendation:**
- [ ] ✅ APPROVED - Ready for production
- [ ] ⚠️ APPROVED WITH RESERVATIONS - Functional but needs improvements
- [ ] ❌ REQUIRES REMEDIATION - Critical issues must be fixed

---

## POST-RESOLUTION UPDATE (March 6, 2026)

This review report was updated after the remediation work documented in `RESOLUTION_REPORT.md`.

Items marked **✅ RESOLVED (2026-03-06)** have been verified as fixed in the current codebase state and are no longer blocking the verification gates reported in `RESOLUTION_REPORT.md` (type-check, lint with 0 errors, and builds).

**Resolved findings:**
- D4-002: Fixed incorrect enum imports in domain repository interfaces.
- D7-001: Aligned service interfaces ↔ implementations and standardized notification call sites to the object-shaped `sendNotification(data: SendNotificationData)` signature.
- D7-002: Fixed AuthorizationService admin role checks and corrected the commented-out admin delete check.
- D7-003: Removed shell-interpolated backup/restore commands and now execute `pg_dump`/`pg_restore` via argument arrays with `PGPASSWORD` passed through environment.
- D7-008: Fixed export PDF coordinate inclusion to correctly handle `0` coordinate values.
- D9-001: Added server-side authorization checks before allowing WebSocket clients to join project rooms.
- D14-001: Removed unsafe JWT secret defaults and now fail-fast when required JWT env vars are missing.
- D8-001 / D8-002 / D8-003 / D8-004 / D8-005: Hardened Axios retry/refresh/cancel/typing/logging behavior to avoid interceptor crashes, prevent “hung” in-flight requests, enable global cancellation, remove unsafe response casting, and remove debug logging in the production delete path.

**Partially resolved findings:**
- D7-004: The missing `ValidationErrorCode` import was fixed and password updates were made safer by creating a new `User` entity; however, the service still contains mock/placeholder auth logic and unsafe `user['passwordHash']` access.

---

## GROUP REVIEW DETAILS

### Phase 1: Domain Layer

#### Group 1.1: Enumerations
**Files Reviewed:**
- src/domain/enumerations/access-right.ts
- src/domain/enumerations/file-type.ts
- src/domain/enumerations/notification-type.ts
- src/domain/enumerations/project-status.ts
- src/domain/enumerations/project-type.ts
- src/domain/enumerations/task-priority.ts
- src/domain/enumerations/task-status.ts
- src/domain/enumerations/user-role.ts

**Score:** 6.5/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D1-001 | 🟠 HIGH | src/domain/enumerations/*.ts | Multiple | **Layer boundary violation:** Domain enums include UI-focused mappings (display names, colors, icons, templates). This couples Domain to Presentation concerns and makes non-UI reuse harder. | Keep enums in Domain, move `*DisplayName`, `*Color`, `*Icon`, and message templates to Presentation (or Shared UI adapter) and import them only where needed. |
| D1-002 | 🟡 MEDIUM | src/domain/enumerations/task-priority.ts | 18-27 | **Requirements mismatch risk:** requirements (FR13) specify priorities High/Medium/Low, but enum adds `URGENT`. This can create inconsistencies in UI filters, validation, exports, and backend acceptance. | Either update requirements/acceptance + backend to support `URGENT`, or remove it and migrate data/UI accordingly. |
| D1-003 | 🟡 MEDIUM | src/domain/enumerations/task-status.ts | 25-81 | **Requirements naming/flow mismatch:** spec uses “Done (pending confirmation)” then “Completed”, but enum uses `PERFORMED`. Transitions allow `PENDING → PERFORMED`, which may bypass expected work-in-progress states and can complicate confirmation logic (FR12). | Rename `PERFORMED` to `DONE` (or map explicitly at DTO boundary) and tighten transition rules to match FR11/FR12 (e.g., enforce confirmation step semantics in Application service). |
| D1-004 | 🟡 MEDIUM | src/domain/enumerations/project-status.ts | 18-27 | **Potential requirements drift:** spec describes status as Active/Finished, but enum adds `IN_PROGRESS` and `PENDING_REVIEW`. If not consistently handled across layers, this can break filtering/export and “automatic completion” (FR24/FR25). | Confirm intended project lifecycle; if only Active/Finished is required, simplify enum or ensure all statuses are fully supported end-to-end (backend, UI, exports). |

**Positive Aspects:**
- Consistent, complete file headers and JSDoc across all enums.
- Helpful type guards (`isValid*`) and `ALL_*` arrays improve safety and iteration.
- Explicit transition table for `TaskStatus` is a good foundation for enforcing state machines.

**Group Notes:**
The biggest concern is architectural: domain enums are doing double-duty as UI configuration. If this pattern continues in Entities/Services, it will erode the clean layering described in `docs/ARCHITECTURE.md`.

---

#### Group 1.2: Value Objects
**Files Reviewed:**
- src/domain/value-objects/geo-coordinates.ts
- backend/src/domain/value-objects/geo-coordinates.ts

**Score:** 7.4/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D2-001 | 🟡 MEDIUM | src/domain/value-objects/geo-coordinates.ts | 18-34, 312-327 | **Dual coordinate representations increase confusion risk:** this VO supports both `{latitude, longitude}` and `{x, y}`; meanwhile backend VO exposes only `{x, y}`. This can lead to subtle mapping mistakes at DTO boundaries and inconsistent JSON shapes across services. | Standardize a single canonical representation at the API boundary (DTOs), and keep VO constructors consistent across frontend/backend (or generate a shared package for domain primitives). |
| D2-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/domain/value-objects/geo-coordinates.ts | N/A (epsilon-based equality) | **Floating-point equality hardened:** `equals()` now compares coordinates using an epsilon tolerance, avoiding brittle strict equality failures after parsing/serialization. | Completed: replaced strict `===` with epsilon-based comparison (aligned with frontend tolerance). |
| D2-003 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/domain/value-objects/geo-coordinates.ts | N/A (finite check added) | **Validation hardened for NaN/Infinity:** coordinates now reject non-finite values before range checks, preventing silent acceptance of `NaN`/`Infinity`. | Completed: added `Number.isFinite` checks before bounds validation. |

**Positive Aspects:**
- Frontend VO is well-documented, immutable, and self-validating; distance calculation is pure and testable.
- Frontend provides convenient factories (`fromArray`, `fromObject`) and JSON serialization helpers.
- Backend VO is small and easy to reason about.

**Group Notes:**
The main risk is consistency drift between frontend/backend domain primitives. If API DTOs aren’t strictly enforced, coordinate inversion bugs (`x/y` vs `lat/lng`) are common and painful to debug.

---

#### Group 1.3: Entities
**Files Reviewed:**
- src/domain/entities/file.ts
- src/domain/entities/message.ts
- src/domain/entities/user.ts
- src/domain/entities/task.ts
- src/domain/entities/project.ts
- src/domain/entities/notification.ts
- src/domain/entities/permission.ts
- src/domain/entities/task-history.ts

**Score:** 6.0/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D3-001 | 🟠 HIGH | src/domain/entities/*.ts | Multiple | **Layer boundary violation:** Entities implement `toJSON()` methods that shape API-facing payloads (ISO string dates, nested serialization). This couples Domain to transport concerns and forces entities to “know” response formats. | Remove `toJSON()` from domain entities. Introduce explicit mappers/DTO assemblers in Application/Presentation (e.g., `*DtoMapper`) responsible for date formatting and payload shape. |
| D3-003 | 🟡 MEDIUM | src/domain/entities/{notification,message,permission,task-history}.ts | Multiple | **Non-deterministic ID generation inside Domain:** factory methods build IDs using `Date.now()` + `Math.random()` (and legacy `substr`) and repeat that pattern across multiple entities. This harms testability and consistency. | Generate IDs in Application (inject an `IdGenerator`/UUID provider) and pass IDs into entities, or centralize ID creation behind a domain service interface. |
| D3-004 | 🟡 MEDIUM | src/domain/entities/{project,file}.ts | Multiple | **Vendor coupling + type-safety risk:** multiple entities encode Dropbox-specific naming (`dropboxFolderId`, `dropboxPath`). Additionally, `ProjectProps.dropboxFolderId` is optional but stored as required `string`, which can become `undefined` at runtime. | Rename to vendor-agnostic concepts (e.g., `externalFolderId`, `storagePath`) and keep Dropbox semantics in Infrastructure adapters. Make types consistent (`string | null`/`undefined`) and default safely in constructors. |
| D3-005 | 🟡 MEDIUM | src/domain/entities/user.ts | 150-226 | **Inconsistent audit timestamp updates:** Several setters mutate entity state without calling a `touchUpdatedAt()` equivalent (e.g., `firstName`, `lastName`, `role`, `phone`, `isActive`). This makes `updatedAt` unreliable for sync and UI refresh logic. | Add a single `touchUpdatedAt()` helper and call it consistently in mutating setters, or remove `updatedAt` from entity and manage it at persistence boundaries (Prisma). |
| D3-006 | 🟡 MEDIUM | src/domain/entities/user.ts | 230-247 | **Unsafe placeholder method:** `User.authenticate()` always throws. If it’s accidentally called, it becomes a runtime failure path. It also suggests Domain is modeling an operation it cannot fulfill. | Replace with an Application service (e.g., `AuthService.verifyPassword(userId, password)`), or model a pure domain concept (e.g., `PasswordHash` VO) without throwing placeholders. |
| D3-008 | 🟡 MEDIUM | src/domain/entities/message.ts | 31-33, 89-93 | **Weak typing for roles:** `senderRole` is a free-form `string` with a default `'CLIENT'`, which can drift from the canonical `UserRole` enum and break role-dependent UI logic. | Use `UserRole` (or a dedicated `SenderRole` union) instead of `string`, and avoid magic defaults; map/denormalize at DTO boundaries. |
| D3-009 | 🟡 MEDIUM | src/domain/entities/permission.ts | 24-29, 44-45, 219-251 | **Section access is unvalidated and untyped:** `PROJECT_SECTIONS` is defined, but `sectionAccess` is just `string[]` and `grantSectionAccess()` accepts any string. This can produce invalid permissions that the UI/backend can’t interpret consistently. | Type `sectionAccess` as `Array<(typeof PROJECT_SECTIONS)[number]>` and validate inputs in grant/revoke operations (or model sections as an enum). |
| D3-007 | 🟢 LOW | src/domain/entities/task.ts | 423-445 | **Serialization drops display fields:** `TaskProps` includes `creatorName` / `assigneeName` but `toJSON()` omits them. This can cause UI inconsistencies if callers expect names from the Domain serialization. | Prefer DTO mappers (see D3-001). If Domain serialization remains temporarily, ensure it’s complete and aligned with UI/back-end DTO contracts. |
| D3-010 | 🟢 LOW | src/domain/entities/permission.ts | 41-43, 304-315 | **Domain API not JSON-friendly:** `PermissionProps.rights` is a `Set`, which is awkward at HTTP boundaries and can encourage ad-hoc conversions. | Treat `Set` as an internal representation only; accept/emit arrays in DTOs and convert in mappers (see D3-001). |

**Positive Aspects:**
- Entities are clearly documented, with helpful examples and consistent file headers.
- Core invariants are enforced early via `validateProps()`; state-transition rules in `Task` are explicit and centralized.
- Authorization helper methods (e.g., `Task.canBeModifiedBy`, `Project.isAccessibleBy`) are easy to test and read.
- `Permission` uses defensive copying for rights/section access and consistently updates `updatedAt` via `touchUpdatedAt()`.

**Group Notes:**
These entities are drifting toward an “anemic domain + DTO” hybrid: they contain domain rules, but also embed serialization and integration details (Dropbox). Bringing DTO mapping and delivery/persistence decisions back to the Application/Infrastructure layers would improve adherence to the Clean Architecture described in `docs/ARCHITECTURE.md`.

---

#### Group 1.4: Repository Interfaces
**Files Reviewed:**
- src/domain/repositories/file-repository.interface.ts
- src/domain/repositories/message-repository.interface.ts
- src/domain/repositories/notification-repository.interface.ts
- src/domain/repositories/permission-repository.interface.ts
- src/domain/repositories/project-repository.interface.ts
- src/domain/repositories/task-history-repository.interface.ts
- src/domain/repositories/task-repository.interface.ts
- src/domain/repositories/user-repository.interface.ts
- backend/src/domain/repositories/file.repository.interface.ts
- backend/src/domain/repositories/message.repository.interface.ts
- backend/src/domain/repositories/notification.repository.interface.ts
- backend/src/domain/repositories/project.repository.interface.ts
- backend/src/domain/repositories/task.repository.interface.ts
- backend/src/domain/repositories/user.repository.interface.ts

**Score:** 5.8/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D4-001 | 🟠 HIGH | backend/src/domain/repositories/*.repository.interface.ts | 15 (multiple files) | **Clean Architecture violation:** backend “Domain” repository interfaces import Prisma model types from `@prisma/client` (e.g., `import type {Project} from '@prisma/client'`). This makes the Domain layer depend on Infrastructure/persistence details and couples all upstream consumers to the database schema. | Define backend domain entities/DTOs independent of Prisma, and map Prisma models ↔ domain types in Infrastructure repositories. Alternatively, relocate these interfaces to Infrastructure if they are intentionally persistence-bound. |
| D4-002 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | src/domain/repositories/{task,notification}-repository.interface.ts | 15 | **Incorrect imports break type-safety/builds:** repository interfaces import enums from entity modules (`TaskStatus`, `TaskPriority`, `NotificationType`) that are not exported by those entity files. **Resolved:** interfaces now import enums from the corresponding `../enumerations/*` modules. | Implemented: enums are imported from their actual modules (e.g., `../enumerations/task-status`, `../enumerations/task-priority`, `../enumerations/notification-type`). |
| D4-003 | 🟡 MEDIUM | src/domain/repositories/*.interface.ts | Multiple | **Fat repository interfaces / query leakage:** interfaces include many query-specific methods (counts, multiple filtered variants, cascade deletes). This can leak persistence query patterns into Domain contracts and increase maintenance cost (each new query becomes an interface change). | Consider splitting read models (Query services) vs write repositories, or use a specification/query object pattern so the interface remains stable while queries evolve. |
| D4-004 | 🟡 MEDIUM | src/domain/repositories/task-history-repository.interface.ts | 47 | **Weak typing for actions:** `findByTaskIdAndAction(taskId, action: string)` relies on ad-hoc strings, which encourages drift vs the `TaskHistory.action` semantics. | Introduce an `Action` enum/union for task history actions (or reuse a shared constant list) and type the repository method accordingly. |
| D4-005 | 🟢 LOW | backend/src/domain/repositories/{task,file,message,notification}.repository.interface.ts | Multiple | **Documentation inconsistency:** several backend repository interfaces omit per-method JSDoc (contrasts with frontend interfaces and the project’s documentation standards). | Add concise JSDoc for methods (parameters/returns/semantics), especially for non-trivial ones like unread counts and file linkage. |

**Positive Aspects:**
- Frontend repository interfaces are consistently documented and clearly describe intent/semantics.
- Interfaces generally return `Promise<T | null>` for lookups, which is a pragmatic contract for “not found”.
- Separation between frontend and backend repository contracts is explicit (no accidental shared module coupling).

**Group Notes:**
The frontend repository layer is structurally reasonable, but it currently has at least two concrete import mistakes that should be fixed promptly (D4-002). On the backend, the presence of Prisma imports inside `backend/src/domain/repositories/*` strongly suggests the “Domain” folder is acting as a persistence schema façade rather than a Clean Architecture domain layer (D4-001).

---

### Phase 2: Application Layer

#### Group 2.1: DTOs
**Files Reviewed:**
- src/application/dto/auth-result.dto.ts
- src/application/dto/backup-result.dto.ts
- src/application/dto/calendar-data.dto.ts
- src/application/dto/export-filters.dto.ts
- src/application/dto/export-result.dto.ts
- src/application/dto/file-data.dto.ts
- src/application/dto/message-data.dto.ts
- src/application/dto/notification-data.dto.ts
- src/application/dto/project-data.dto.ts
- src/application/dto/project-details.dto.ts
- src/application/dto/task-data.dto.ts
- src/application/dto/user-data.dto.ts
- src/application/dto/validation-result.dto.ts

**Score:** 6.2/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D5-001 | 🟠 HIGH | src/application/dto/*.dto.ts | Multiple (e.g., auth-result.dto.ts:64-110, project-data.dto.ts:42-124, task-data.dto.ts:32-156, export-result.dto.ts:72-121) | **Transport typing mismatch:** many DTOs use `Date` fields, but these DTOs appear to model API payloads (JSON), where dates are typically serialized as strings. This makes types lie at runtime and encourages scattered parsing/formatting logic. | Use explicit transport types at the API boundary (e.g., ISO-8601 `string` or an `IsoDateString` branded type). Parse into `Date` in a single adapter/mapping layer, and keep UI/application models separate from transport DTOs. |
| D5-002 | 🟡 MEDIUM | src/application/dto/{project-data,project-details,calendar-data,task-data}.dto.ts | project-data.dto.ts:116-120, project-details.dto.ts:227-231, calendar-data.dto.ts:36-40, task-data.dto.ts:126-136 | **DTOs include UI/view-model concerns:** fields like `statusColor`, `isOverdue`, `daysUntilDelivery`, and multiple `can*` permission flags are presentation-oriented. This blurs the boundary between transport contracts and UI view models, and can lead to duplicated or inconsistent business rules. | If these are server-computed read-model fields, explicitly treat them as query/read DTOs and keep them separate from core “entity DTOs”. Otherwise, compute them in Presentation (or a dedicated view-model layer) from canonical fields. |
| D5-003 | 🟡 MEDIUM | src/application/dto/{project-data,project-details,file-data}.dto.ts | project-data.dto.ts:46, project-details.dto.ts:57-59, file-data.dto.ts:90 | **Vendor coupling in API contracts:** DTOs expose Dropbox-specific naming and errors (`dropboxFolderId`, `dropboxFolderUrl`, `dropboxPath`, `DROPBOX_ERROR`). This bakes Infrastructure/vendor decisions into the application contract and makes migrations harder. | Prefer vendor-agnostic terms (`storageFolderId`, `storagePath`) and keep vendor naming in Infrastructure adapters. If the contract must expose Dropbox, document it explicitly and centralize mapping to avoid bleed into Domain (see D3-004). |
| D5-004 | 🟡 MEDIUM | src/application/dto/{calendar-data,task-data}.dto.ts | calendar-data.dto.ts:38, task-data.dto.ts:142-156 | **Weakly typed string fields reduce safety:** `CalendarItemDto.statusColor` is `string` (instead of a constrained union like `ProjectStatusColor`), and `TaskHistoryEntryDto.action` is a free-form `string`. These are easy sources of drift and typos. | Tighten these to unions/enums (e.g., reuse `ProjectStatusColor`; introduce a `TaskHistoryAction` union/enum) and keep conversions in mappers/adapters. |
| D5-005 | 🟢 LOW | src/application/dto/{auth-result,validation-result}.dto.ts | auth-result.dto.ts:153-194, validation-result.dto.ts:136-195 | **Mixed responsibilities inside “DTO” modules:** these files define DTO types but also include factory/helper functions. This is not inherently wrong, but it can make it harder to keep DTOs as pure transport contracts and can encourage more business logic to accumulate in the DTO folder. | Consider moving factories/helpers to `src/application/` utilities (e.g., `src/application/validation/*`) or to a `dto-helpers` module, keeping DTO files primarily declarative. |
| D5-006 | 🟢 LOW | src/application/dto/{auth-result,user-data}.dto.ts | auth-result.dto.ts:38-69, user-data.dto.ts:1-35 | **DTO duplication + documentation inconsistency:** `auth-result.dto.ts` defines a `UserDto` that overlaps with `UserDataDto`/`UserSummaryDto` in `user-data.dto.ts`. Additionally, `user-data.dto.ts`’s header metadata is inconsistent with the project standard (`@file` path format, missing `typescripttutorial` reference). | Consolidate shared user DTO shapes (or clearly distinguish “auth user payload” vs “admin user payload”) to avoid divergence. Align file headers to the project’s documentation template for consistency. |

**Positive Aspects:**
- DTOs are consistently `readonly`, well-structured, and heavily documented, which improves usability and discoverability.
- Good use of enums/unions for programmatic error handling (e.g., `AuthErrorCode`, `ExportErrorCode`, `BackupErrorCode`).
- Clear separation between input DTOs (create/update/filter) and output DTOs (summary/detail/list responses).

**Group Notes:**
The primary risk in this group is boundary clarity: many of these types look like “API contracts”, but their use of `Date` and UI indicators suggests they are also acting as client-side view models. Making the transport boundary explicit (JSON-safe primitives) and defining a clear mapping point would improve correctness and reduce drift.

---

#### Group 2.2: Service Interfaces
**Files Reviewed:**
- src/application/interfaces/authentication-service.interface.ts
- src/application/interfaces/authorization-service.interface.ts
- src/application/interfaces/backup-service.interface.ts
- src/application/interfaces/export-service.interface.ts
- src/application/interfaces/file-service.interface.ts
- src/application/interfaces/message-service.interface.ts
- src/application/interfaces/notification-service.interface.ts
- src/application/interfaces/project-service.interface.ts
- src/application/interfaces/task-service.interface.ts

**Score:** 6.6/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D6-001 | 🟡 MEDIUM | src/application/interfaces/*.interface.ts | Multiple (e.g., authentication-service.interface.ts:32-33, file-service.interface.ts:38-41, backup-service.interface.ts:37-38) | **Error contract is documentation-only:** interfaces list many `@throws {SomeError}` tags, but these error types aren’t part of the interface type system (and may not even exist as concrete classes in this layer). Consumers can’t reliably handle errors without inspecting implementation details. | Define and export a small, shared Application error taxonomy (typed error classes or discriminated unions), or return a typed `Result<T, E>` shape for service methods so failures are explicit and consistent. |
| D6-002 | 🟡 MEDIUM | src/application/interfaces/file-service.interface.ts | 10,29,41,69 | **Infrastructure/vendor coupling leaks into Application interfaces:** the interface explicitly encodes Dropbox semantics. This tightens coupling and makes it harder to swap providers or run the application without that integration. | Prefer a vendor-agnostic “storage” abstraction at the interface boundary; keep vendor naming in Infrastructure adapters (consistent with Domain findings D3-004 and DTO findings D5-003). |
| D6-003 | 🟡 MEDIUM | src/application/interfaces/authorization-service.interface.ts | 15-223 (notably 203-208) | **Authorization interface is very “fat” and returns a non-transport-friendly type:** `IAuthorizationService` exposes many granular methods and returns `Set<AccessRight>` for project permissions. This surface area is hard to maintain and `Set` is awkward across JSON boundaries. | Consider a single `authorize(action, context)`/policy-based API (or split into smaller, bounded interfaces). Return `AccessRight[]` instead of `Set` at boundaries, converting internally if needed. |
| D6-004 | 🟢 LOW | src/application/interfaces/project-service.interface.ts | 135-136 | **Date-typed parameters at likely HTTP boundary:** `getProjectsForCalendar(userId, startDate: Date, endDate: Date)` assumes `Date` instances. If implemented via HTTP, these will be serialized to strings and need centralized parsing anyway. | Accept ISO strings in service interface params (transport-safe) or enforce a single adapter layer that converts `Date` ↔ string consistently before API calls (align with D5-001). |

**Positive Aspects:**
- Very strong documentation discipline: interfaces are explicit about intent, parameters, and expected failure modes.
- Interfaces are cohesive per domain capability (auth, projects, tasks, messages), with clear separation of input/filter vs output list/detail DTOs.
- Naming is consistent and predictable, which helps maintainability and onboarding.

**Group Notes:**
These interfaces are a solid starting point, but clarifying error-handling and reducing vendor-coupling at the interface boundary would improve layering and keep the Application layer implementation-agnostic.

---

#### Group 2.3: Service Implementations
**Files Reviewed:**
- src/application/services/authentication.service.ts
- src/application/services/authorization.service.ts
- src/application/services/backup.service.ts
- src/application/services/export.service.ts
- src/application/services/file.service.ts
- src/application/services/message.service.ts
- src/application/services/notification.service.ts
- src/application/services/project.service.ts
- src/application/services/task.service.ts
- src/application/services/common/errors.ts
- src/application/services/common/utils.ts
- backend/src/application/services/auth.service.ts
- backend/src/application/services/audit.service.ts
- backend/src/application/services/backup.service.ts
- backend/src/application/services/deadline-reminder.service.ts
- backend/src/application/services/export.service.ts

**Score:** 3.4/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D7-001 | 🔴 CRITICAL ✅ RESOLVED (2026-03-06) | src/application/services/{notification,export,backup}.service.ts; src/application/services/{message,task,backup,project}.service.ts | Multiple (e.g., notification.service.ts:54-112 vs notification-service.interface.ts:40-46; export.service.ts:55-77 vs export-service.interface.ts:38-70; backup.service.ts:70-95 vs backup-service.interface.ts:66-110; message.service.ts:107-113; task.service.ts:128-135; project.service.ts:132-139) | **Contract drift breaks type-safety and likely fails compilation. Resolved:** service classes match their `I*Service` interfaces and notification senders now consistently call `sendNotification(data: SendNotificationData)` using the object-shaped payload. | Implemented: interface ↔ implementation signatures were reconciled, and call sites were standardized to the interface’s object-shaped `sendNotification(data)` API. |
| D7-002 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | src/application/services/authorization.service.ts | 52, 77, 100, 115, 128-129 | **Authorization correctness bug + role inconsistency. Resolved:** the admin delete check is no longer accidentally commented out, and admin checks consistently use the canonical `UserRole.ADMINISTRATOR`. | Implemented: corrected the comment/statement split and standardized role checks to `UserRole.ADMINISTRATOR`. |
| D7-003 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | backend/src/application/services/backup.service.ts | 80-86, 128-134 | **Command injection + secret exposure risk. Resolved:** backup/restore no longer interpolate DB password/params into a shell command; `pg_dump`/`pg_restore` are executed with argument arrays and `PGPASSWORD` is passed via process environment. | Implemented: replaced `exec` string interpolation with `spawn` using args + env; added fail-fast validation for missing DB URL components. |
| D7-004 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | src/application/services/authentication.service.ts | N/A (service removed) | **Mock auth logic + type-safety escape hatches remained a security risk:** the frontend contained an `AuthenticationService` that verified passwords locally via bracket indexing (`user['passwordHash']`) and generated placeholder tokens client-side. **Resolved:** the unused mock service/interface were removed; authentication remains backend-driven via `AuthRepository` + `auth.store.ts`. | Completed: removed the mock `AuthenticationService` and its interface/barrel exports to eliminate client-side auth placeholder logic. |
| D7-005 | 🟡 MEDIUM 🟡 PARTIALLY RESOLVED (2026-03-06) | src/application/services/project.service.ts | 99-106, 115-121, 166-169 | **Coordinate truthiness bug + invalid defaulting:** coordinate creation/update no longer uses truthiness checks (so `0` coordinates are preserved). **Remaining risk:** the Dropbox folder ID path still normalizes missing values to `''` via the Domain entity defaulting behavior. | Implemented: replaced `&&` coordinate checks with nullish checks and handled coordinate updates deterministically. Remaining: represent missing Dropbox folder as `null`/`undefined` consistently end-to-end (Domain + DTOs + persistence). |
| D7-006 | 🟡 MEDIUM | src/application/services/file.service.ts | 104-106 | **Type mismatch + path construction risk:** `section` defaults to the string `'Messages'` despite `ProjectSection` being an enum-like type, and user-provided values (`section`, `name`) are concatenated into a Dropbox path. This can cause invalid section values and makes path-safety dependent on Dropbox SDK behavior. | Default using the canonical `ProjectSection` value (not a string literal) and validate/sanitize file names and section inputs before constructing paths. |
| D7-007 | 🟡 MEDIUM | backend/src/application/services/deadline-reminder.service.ts | 119-125, 191-197 | **Stringly-typed notification types + duplicate reminder risk:** notification `type` fields are literal strings (e.g., `'TASK_STATUS_CHANGE'`, `'PROJECT_ASSIGNED'`) rather than shared enums, and the reminder job doesn’t record which reminders have already been sent (scheduler reruns can spam users). | Use the canonical notification type enum (Prisma enum or shared constant) and persist “reminder sent” markers (or compute idempotency keys) to prevent duplicates. |
| D7-008 | 🟡 MEDIUM ✅ RESOLVED (2026-03-06) | backend/src/application/services/export.service.ts | 233-235 | **Coordinate truthiness bug. Resolved:** export now uses nullish checks so valid `0` coordinate values are included in the report. | Implemented: replaced truthiness checks with nullish checks (`!= null`) before rendering coordinates. |

**Positive Aspects:**
- Frontend services consistently use constructor injection, which makes unit testing and swapping implementations feasible.
- Many service entrypoints correctly gate operations behind `IAuthorizationService` checks.
- Backend services are small and purpose-focused (audit, export, reminders) and generally readable.

**Group Notes:**
The dominant risk in this group is not “business logic bugs” but **systemic API drift**: interfaces, implementations, and DTOs are out of sync. Until these contracts are reconciled, TypeScript cannot effectively protect the codebase, and features like notifications/tasks/backups/exports are likely broken or unstable at runtime.

---

### Phase 3: Infrastructure Layer

#### Group 3.1: HTTP Client
**Files Reviewed:**
- src/infrastructure/http/axios.client.ts

**Score:** 6.2/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D8-001 | 🟠 HIGH | src/infrastructure/http/axios.client.ts | 294-327 | **Retry path can throw due to unsafe access of `error.config`:** the retry guard calls `this.shouldRetry(error, originalRequest._retryCount || 0)` before ensuring `originalRequest` exists. If Axios provides an error without `config`, this will crash the interceptor, masking the real failure. | Reorder the condition to check `originalRequest` first and handle missing config defensively (e.g., `if (!originalRequest) return Promise.reject(transformError(...))`). |
| D8-001 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | src/infrastructure/http/axios.client.ts | 294-327 | **Retry path can throw due to unsafe access of `error.config`. Resolved:** the retry guard now checks `originalRequest` before dereferencing `_retryCount` or calling `shouldRetry`, preventing interceptor crashes when Axios errors lack `config`. | Implemented: guarded `originalRequest` access and reordered the retry conditional to be null-safe. |
| D8-002 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | src/infrastructure/http/axios.client.ts | 303-313, 373-386 | **Token refresh failure leaves in-flight requests hanging. Resolved:** queued requests now register `{resolve, reject}` subscribers and are explicitly rejected when refresh fails, preventing indefinite hangs. | Implemented: subscriber queue now supports rejection on refresh failure; refresh failure calls the reject path for all waiting requests. |
| D8-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-06) | src/infrastructure/http/axios.client.ts | 217-218, 894-902 | **`cancelAllRequests()` is effectively non-functional. Resolved:** the client now initializes an `AbortController`, injects its `signal` into requests by default, and resets the controller after cancellation so new requests can proceed normally. | Implemented: initialize `abortController` on construction; attach default `signal` in request interceptor when no per-request signal is provided; always abort + recreate controller in `cancelAllRequests()`. |
| D8-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-06) | src/infrastructure/http/axios.client.ts | 285-293, 671-692, 736-757 | **Type-safety mismatch in response shaping. Resolved:** the response interceptor no longer returns a non-Axios-shaped object cast to `AxiosResponse`, and upload methods now return `ApiResponse<T>` via explicit mapping from `BackendApiResponse<T>` (no `as unknown as ...` casts). | Implemented: pass-through success responses in interceptor; consistently use `BackendApiResponse<T>` generics and map to `ApiResponse<T>` in wrapper methods. |
| D8-005 | 🟢 LOW ✅ RESOLVED (2026-03-06) | src/infrastructure/http/axios.client.ts | 605-624 | **Debug logging left in production path. Resolved:** removed `console.log` statements from the `delete()` method to avoid leaking payloads and reduce production noise. | Implemented: removed debug logs from the delete request path. |

**Positive Aspects:**
- Strong documentation and explicit configuration knobs (timeouts, progress callbacks, retry policy).
- Token injection and refresh logic are centralized, which reduces duplication across repositories/services.
- Error normalization (`transformError`) provides a consistent UI-facing failure shape.

**Group Notes:**
This client is close to being a solid foundation, but the interceptor/type-casting approach and the token-refresh queue edge cases can create “mysterious hangs” and hard-to-debug runtime failures. Tightening the refresh queue semantics and removing unsafe casts would substantially improve reliability.

---

#### Group 3.2: WebSocket Handler
**Files Reviewed:**
- src/infrastructure/websocket/socket.handler.ts
- backend/src/infrastructure/websocket/socket.server.ts

**Score:** 5.9/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D9-001 | 🔴 CRITICAL ✅ RESOLVED (2026-03-06) | backend/src/infrastructure/websocket/socket.server.ts | 66-94 | **Authorization bypass: any authenticated user can join any project room. Resolved:** project-room joins now verify the requesting user has access rights (admin role, project ownership, or explicit permission) before calling `socket.join(project:${projectId})`. | Implemented: server-side authorization checks were added to `join:project` and legacy subscribe handlers; unauthorized join attempts are rejected. |
| D9-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | src/infrastructure/websocket/socket.handler.ts | N/A (token refresh on reconnect added) | **Reconnect used a potentially stale token:** the socket auth token was captured at `connect()` time, so token rotation could break reconnection. **Resolved:** reconnection attempts now refresh `socket.auth.token` from `ITokenProvider` before reconnecting. | Completed: on `reconnect_attempt`, the handler updates `socket.auth = { token: tokenProvider.getAccessToken() }` when available. |
| D9-003 | 🟢 LOW ✅ RESOLVED (2026-03-07) | src/infrastructure/websocket/socket.handler.ts; backend/src/infrastructure/websocket/socket.server.ts | N/A (console logging removed) | **Debug logging in production paths:** several `console.*` statements existed outside the shared logger. **Resolved:** WebSocket client/server now avoid direct `console.*` and use the shared logger / debug-gated logging where appropriate. | Completed: removed `console.log` debug prints from message forwarding and server emit/join/leave paths; logging routes through the shared logger. |
| D9-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | src/infrastructure/websocket/socket.handler.ts | N/A (type aligned) | **Type contract mismatch for `ConnectionOptions.token`:** `token` was typed as required, but the implementation falls back to `tokenProvider`. **Resolved:** `ConnectionOptions.token` is now optional, matching the implementation and enabling dynamic token retrieval. | Completed: changed `token` to `token?: string` and used the nullish-coalescing fallback to `tokenProvider.getAccessToken()`. |

**Positive Aspects:**
- Clear event taxonomy and strongly typed payloads make it easy to consume events safely in Presentation.
- Room-based design (`user:${userId}`, `project:${projectId}`) is scalable and aligns with typical Socket.IO patterns.
- Client reconnect handling re-joins user/project rooms, which improves UX after transient disconnects.

**Group Notes:**
The backend join-room authorization gap (D9-001) and client-side reconnect/token handling (D9-002) were resolved in post-review remediation.

---

#### Group 3.3: External Services
**Files Reviewed:**
- src/infrastructure/external-services/dropbox.service.ts
- backend/src/infrastructure/external-services/dropbox.service.ts

**Score:** 4.6/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D10-002 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | src/infrastructure/external-services/dropbox.service.ts (removed) | N/A (module removed) | **Client-side Dropbox access token usage:** the frontend Dropbox integration stored/used an access token directly for vendor API/content operations (recoverable via DevTools/network logs). **Resolved:** the client-side Dropbox integration module was removed and the frontend no longer supports/encourages Dropbox credentials in browser env. File operations are performed via backend `/api/v1/files/*` endpoints. | Completed: removed the client-side Dropbox service and removed/updated docs/templates that suggested frontend tokens. |
| D10-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-06) | src/infrastructure/external-services/dropbox.service.ts (removed) | N/A (module removed) | **Metadata mapping could produce invalid dates:** the affected mapping lived in the removed client-side Dropbox module. **Resolved:** the problematic code path was eliminated along with the module. | N/A (handled by removing the client-side integration). |
| D10-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/infrastructure/external-services/dropbox.service.ts | N/A (narrowed tags) | **Over-broad error swallowing hides real failures:** `createFolder()` treated any `'.tag' === 'path'` error as “already exists”, and `pathExists()` returned `false` for all errors (including permission/config issues). **Resolved:** these methods now only swallow explicit “already exists” / “not found” cases and log+rethrow unexpected errors. | Completed: `createFolder()` only ignores explicit conflict/exists; `pathExists()` only returns `false` for explicit “not_found” and logs+rethrows otherwise. |
| D10-005 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/infrastructure/external-services/dropbox.service.ts | N/A (logger used) | **Console logging in backend infra code:** refresh/token retry and link creation paths used `console.log`, which is noisy and can leak operational details. **Resolved:** these paths now use the shared logger with appropriate levels and do not log secrets. | Completed: replaced `console.log` with `logInfo`/`logWarning` and sanitized error messages. |

**Positive Aspects:**
- Dropbox implementations include chunked upload support and centralized retry/refresh patterns.
- Frontend Dropbox service has clear separation between API vs content endpoints.

**Group Notes:**
The architecture intent is clear, but the current placement of vendor API calls in the frontend (and likely Dropbox) creates major security and compliance risk. These integrations should be backend-first, with the frontend calling a narrow internal API.

---

#### Group 3.4: Repository Implementations
**Files Reviewed:**
- src/infrastructure/repositories/auth.repository.ts
- src/infrastructure/repositories/file.repository.ts
- src/infrastructure/repositories/message.repository.ts
- src/infrastructure/repositories/notification.repository.ts
- src/infrastructure/repositories/permission.repository.ts
- src/infrastructure/repositories/project.repository.ts
- src/infrastructure/repositories/task-history.repository.ts
- src/infrastructure/repositories/task.repository.ts
- src/infrastructure/repositories/user.repository.ts
- backend/src/infrastructure/repositories/audit-log.repository.ts
- backend/src/infrastructure/repositories/file.repository.ts
- backend/src/infrastructure/repositories/message.repository.ts
- backend/src/infrastructure/repositories/notification.repository.ts
- backend/src/infrastructure/repositories/permission.repository.ts
- backend/src/infrastructure/repositories/project.repository.ts
- backend/src/infrastructure/repositories/task.repository.ts
- backend/src/infrastructure/repositories/user.repository.ts

**Score:** 6.1/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D11-001 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | src/infrastructure/repositories/{file,message,notification,permission,project,task,user}.repository.ts | N/A (helper updated) | **Incorrect Axios 404 detection breaks null-return contracts:** repositories relied on `error.status` only. In cases where an Axios-shaped error is observed (`error.response.status`), `findById()`-style methods could throw instead of returning `null`. **Resolved:** 404 detection is now robust to both the normalized `ApiError.status` shape and the Axios-shaped `error.response.status` shape. | Completed: updated each repository `isNotFoundError()` helper to treat either `status === 404` or `response.status === 404` as a “not found” condition. |
| D11-002 | 🟡 MEDIUM | src/infrastructure/repositories/{notification,project}.repository.ts | notification.repository.ts:227-230; project.repository.ts:363-366 | **Query strings are built via raw interpolation without encoding:** ISO date strings include `:` and other reserved characters; this can break requests and is fragile. Similar patterns occur elsewhere for user/project IDs. | Prefer `URLSearchParams` (as already done in `UserRepository.getAllUsers`) or Axios `params` option to ensure correct encoding and consistent behavior. |
| D11-003 | 🟡 MEDIUM | backend/src/infrastructure/repositories/task.repository.ts | 51-62, 100-111 | **Type drift via `any` return types and augmented shapes:** `findByProjectId()` and `create()` return `any` and add `creatorName`/`assigneeName` to Prisma Task rows. This leaks ad-hoc read-model concerns through repository APIs and weakens type-safety across the Application layer. | Introduce explicit DTO/read model types (e.g., `TaskWithNamesDto`) and return those types. Alternatively, keep repositories returning pure Prisma/domain shapes and move computed fields to a dedicated query service/mapping layer. |
| D11-004 | 🟢 LOW | src/infrastructure/repositories/project.repository.ts; backend/src/infrastructure/repositories/project.repository.ts | project.repository.ts:197-246; backend project.repository.ts:151-177 | **Debug logging in repository methods:** multiple `console.log`/`console.error` statements exist in core data paths (update/delete), which is noisy and can leak operational data. | Replace with the shared logger and gate behind log levels; avoid logging full entities/payloads. |
| D11-005 | 🟢 LOW | src/infrastructure/repositories/user.repository.ts | 221-239, 261-277 | **Mixed repository paradigms and inconsistent error handling:** the file mixes entity-based repository methods with UI-oriented DTO CRUD methods; `mapToApiRequest()` is marked `@deprecated` but still used by `save()`/`update()`, and some methods throw while others return `{success:false}`. | Split UI management operations into a separate service/repository (e.g., `UserAdminRepository`), or standardize on DTO-based methods. Align error handling strategy across the class. |
| D11-006 | 🟢 LOW | backend/src/infrastructure/repositories/audit-log.repository.ts | 85-87, 128-130, 145-146 | **Potential sensitive error detail propagation:** `DatabaseError` messages include raw underlying error text via template strings. If surfaced to API responses, this can leak internal details. | Keep detailed error text in internal logs; throw a stable, user-safe error message outward and attach the cause only for structured logging/telemetry. |

**Positive Aspects:**
- Repository files are generally well-structured, with consistent CRUD method naming and clear mapping helpers.
- Several endpoints correctly use `encodeURIComponent()` for path parameters (e.g., user email/username; project code).
- Backend repositories generally keep Prisma access centralized and wrap failures in typed errors.

**Group Notes:**
The biggest operational risk in this group is the repeated “404 detection” bug in frontend repositories, because it changes the semantics of common “find or null” paths. On the backend, the `any`-typed Task repository is a strong signal that a dedicated read-model/DTO boundary is missing.

---

#### Group 3.5: Persistence & Storage
**Files Reviewed:**
- src/infrastructure/persistence/token.storage.ts
- backend/src/infrastructure/database/prisma.client.ts

**Score:** 6.8/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D12-001 | 🟡 MEDIUM | src/infrastructure/persistence/token.storage.ts | 18-23, 37-85 | **Auth tokens stored in `localStorage` are XSS-exfiltration prone:** any XSS (or malicious browser extension) can read access/refresh tokens and impersonate users. While common in SPAs, this is a meaningful security tradeoff for an app handling sensitive project data. | Prefer HttpOnly, Secure cookies for refresh tokens and keep access tokens in memory (or short-lived) with a backend refresh endpoint. If staying with `localStorage`, harden CSP, aggressively prevent XSS, and consider rotating tokens with revocation. |
| D12-002 | 🟢 LOW | src/infrastructure/persistence/token.storage.ts | 15-16 | **Tight coupling to HTTP client module:** `ITokenStorage` is imported from `../http/axios.client`, creating a dependency edge from persistence → HTTP implementation details (and risking circular dependencies over time). | Move `ITokenStorage` to a small shared abstraction module (e.g., `src/infrastructure/persistence/token.storage.interface.ts` or `src/application/interfaces`). |
| D12-003 | 🟢 LOW | backend/src/infrastructure/database/prisma.client.ts | 21-45 | **Query logging may expose sensitive data in dev:** Prisma query logging can include SQL text (and often params in other event shapes). Even if gated to development, it risks leaking data into logs in shared environments. The `as never` casts also suggest an API typing mismatch being papered over. | Ensure query logging is disabled in production and in any shared staging environment. Consider narrowing log output to durations only, and align `$on` event typing with Prisma’s official event types to remove the `as never` casts. |

**Positive Aspects:**
- Token storage methods are defensive (try/catch) and centralized.
- Prisma client lifecycle helpers (`connectDatabase`, `disconnectDatabase`, `isDatabaseHealthy`) are explicit and consistently logged.

**Group Notes:**
The main decision point is the token storage strategy: `localStorage` is convenient, but it substantially raises the blast radius of any XSS. If the product threat model includes untrusted content, moving refresh tokens to HttpOnly cookies is usually worth it.

---

#### Group 3.6: Backend Auth & Scheduler
**Files Reviewed:**
- backend/src/infrastructure/auth/auth.middleware.ts
- backend/src/infrastructure/auth/jwt.service.ts
- backend/src/infrastructure/auth/password.service.ts
- backend/src/infrastructure/scheduler/backup.scheduler.ts
- backend/src/infrastructure/scheduler/deadline-reminder.scheduler.ts

**Score:** 6.0/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D13-001 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | backend/src/infrastructure/scheduler/deadline-reminder.scheduler.ts | N/A (scheduler updated) | **Prisma client lifecycle + inconsistency risk:** the scheduler constructed a new `PrismaClient()` and passed it into `DeadlineReminderService`, while `NotificationRepository` used the shared singleton prisma from `prisma.client`. This mixed DB clients in the same workflow and never called `$disconnect()`, risking connection leaks and unpredictable behavior in long-running processes. **Resolved:** the scheduler now imports and uses the shared `prisma` singleton. | Completed: removed per-scheduler `new PrismaClient()` and standardized on the shared `prisma` singleton (`../database/prisma.client.js`). |
| D13-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/infrastructure/scheduler/backup.scheduler.ts | N/A (scheduler gated) | **Scheduler could run with invalid config:** `databaseUrl` fell back to an empty string (`process.env.DATABASE_URL || ''`). **Resolved:** the backup scheduler now disables itself at startup with a clear error log if `DATABASE_URL` is missing. | Completed: added an early guard for `DATABASE_URL` and skipped scheduling/startup backup when absent. |
| D13-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/infrastructure/auth/auth.middleware.ts | N/A (typed UserRole) | **Role checks are now strongly typed:** authorization middleware now uses Prisma `UserRole` for role checks and constants, reducing drift/typo risk. | Completed: `authorize(...allowedRoles)` now takes `UserRole[]` and admin checks use `UserRole.ADMINISTRATOR`. |
| D13-004 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/infrastructure/auth/jwt.service.ts | N/A (typing hardened) | **`expiresIn` typing was bypassed with `as any`:** this can hide misconfiguration. **Resolved:** `expiresIn` is now typed using `SignOptions['expiresIn']` (no `any` cast). | Completed: replaced `as any` with a constrained `SignOptions['expiresIn']` cast for both access and refresh tokens. |
| D13-005 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/infrastructure/auth/auth.middleware.ts | N/A (debug logging added) | **Optional auth observability improved:** invalid tokens no longer fail silently; `optionalAuth()` now logs a debug-level event (without token content) and proceeds as anonymous as intended. | Completed: added `logDebug(...)` on verification failure to distinguish “invalid token” from “no token” cases operationally. |

**Positive Aspects:**
- JWT handling is centralized and middleware wiring is straightforward.
- Password hashing uses bcrypt with configured salt rounds.
- Scheduler jobs use the shared logger (not raw `console.*`) for errors.

**Group Notes:**
With D13-001 resolved, the biggest improvement here is moving away from stringly-typed roles to a shared enum/typed guard so authorization mistakes fail at compile-time.

---

### Phase 4: Shared Layer

#### Group 4.1: Constants
**Files Reviewed:**
- src/shared/constants.ts
- backend/src/shared/constants.ts

**Score:** 6.8/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D14-001 | 🔴 CRITICAL ✅ RESOLVED (2026-03-06) | backend/src/shared/constants.ts | 48-54 | **Security misconfiguration hazard. Resolved:** JWT secrets no longer fall back to hard-coded defaults; the backend now fails fast if `JWT_SECRET` / `JWT_REFRESH_SECRET` are missing. | Implemented: removed secret defaults and introduced required-env checks for JWT secrets. |
| D14-002 | 🟡 MEDIUM | src/shared/constants.ts + backend/src/shared/constants.ts | 191-258; 89-117 | **Frontend/backend upload rules are inconsistent:** frontend allows up to 50MB and includes additional geo/CAD extensions, while backend default max size is 10MB and its `ALLOWED_MIME_TYPES` list omits some frontend-supported types. This will produce “works in UI, fails on server” behavior. | Define a single source of truth for upload constraints (size + types) and share it (e.g., shared package or generated constants). If constraints must differ, enforce server constraints in UI and render server-driven validation errors predictably. |
| D14-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/shared/constants.ts + backend/src/server.ts | N/A (startup validation added) | **Fail-open defaults removed for critical config:** the server now validates required env at startup and uses safer production defaults for logging, reducing late failures and noisy production logs. | Completed: added startup env validation (e.g., `DATABASE_URL` required in production; `LOG_LEVEL` validated) and defaulted prod logging to `info` when unset. |
| D14-004 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/shared/constants.ts + backend/src/server.ts | N/A (dotenv moved to entrypoint) | **Import-time side effects removed:** `dotenv.config()` no longer runs inside the shared constants module; environment loading happens once in the server entrypoint before backend modules are imported. | Completed: removed dotenv usage from constants and loaded `.env` in `server.ts` before dynamically importing the app modules. |
| D14-005 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/shared/constants.ts | N/A (header standardized) | **Header metadata mismatch resolved:** `@file` now correctly matches `backend/src/shared/constants.ts`, improving traceability in generated docs and audits. | Completed: standardized the header to use the correct `@file` path. |

**Positive Aspects:**
- Both constants modules are cleanly organized, consistently documented, and use `as const` effectively.
- Frontend exports useful derived types (e.g., unions from constant objects/arrays) to keep call sites type-safe.
- Defaults are generally sensible for local development (URLs/timeouts) and keep onboarding friction low.

**Group Notes:**
This group highlights a recurring theme: configuration that spans frontend + backend (JWT/session settings, upload constraints, CORS) benefits from an explicit “configuration boundary”. A small backend env-validation module plus server-driven “capabilities/config” endpoint (or a shared config package) would reduce drift and runtime surprises.

---

#### Group 4.2: Utilities
**Files Reviewed:**
- src/shared/utils.ts
- backend/src/shared/utils.ts
- backend/src/shared/errors.ts
- backend/src/shared/logger.ts
- backend/src/shared/types.ts
- backend/src/shared/index.ts

**Score:** 6.1/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D15-001 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | src/shared/utils.ts | N/A (function updated) | **Insecure/incorrect UUID generation:** `generateId()` claimed “UUID v4 compliant” but used `Math.random()`, which is not cryptographically secure and increases collision risk. **Resolved:** UUIDs are now generated using Web Crypto (`crypto.randomUUID()` when available, otherwise `crypto.getRandomValues` per RFC 4122 v4). | Completed: updated `generateId()` to use Web Crypto (`randomUUID`/`getRandomValues`) instead of `Math.random()`. |
| D15-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/shared/utils.ts | N/A (NaN-safe parsing) | **Pagination parsing hardened:** invalid/non-numeric `page`/`limit` no longer propagate `NaN` into `skip`; defaults are applied safely. | Completed: coercion is now guarded via `Number.isFinite` and falls back to defaults. |
| D15-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/shared/types.ts | N/A (UserRole types) | **Auth role types are now constrained:** `AuthenticatedUser.role` and `JwtPayload.role` now use Prisma `UserRole`, preventing string drift and improving compile-time safety across middleware/JWT/request typing. | Completed: replaced `string` roles with `UserRole` in shared backend types. |
| D15-004 | 🟡 MEDIUM | src/shared/utils.ts | 1059-1076 | **`deepClone()` is unsafe for many real-world objects:** the implementation doesn’t handle circular references and will silently strip prototypes for class instances (and won’t correctly clone Maps/Sets/Files/Blobs). This can cause subtle runtime bugs if used on anything other than plain JSON-like objects. | Prefer `structuredClone()` where available, or clearly document constraints (plain objects/arrays/dates only). If you need broad cloning, use a well-tested library or introduce specialized clone utilities per domain shape. |
| D15-005 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/shared/logger.ts | N/A (safe metadata serialization) | **Console formatting hardened:** development console formatting no longer throws on circular metadata; it falls back to a safe inspector representation when JSON serialization fails. | Completed: added a safe metadata serializer that uses `JSON.stringify` with a fallback to `util.inspect`. |
| D15-006 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/shared/{utils,errors,logger,types,index}.ts | N/A (headers standardized) | **Repeated header metadata mismatch resolved:** backend shared files now consistently declare `@file backend/src/shared/*.ts`, improving traceability in generated docs/audits. | Completed: updated `@file` entries to the correct relative paths across the shared backend modules. |

**Positive Aspects:**
- Backend response helpers (`sendSuccess`, `sendError`, `sendPaginated`) establish a consistent API envelope and are easy to reuse.
- Backend error taxonomy (`AppError` and subclasses) is straightforward and supports operational/non-operational distinction.
- Frontend utilities are well-documented and organized by category, which improves discoverability.

**Group Notes:**
The main action items are robustness and security posture: hardening parsing (avoid `NaN` propagation), tightening role typing, and ensuring ID generation is appropriate for any security-sensitive workflows.

---

### Phase 5: Presentation Layer - Core Review

#### Group 5.1: Styles
**Files Reviewed:**
- src/presentation/styles/main.css
- src/presentation/styles/variables.css

**Score:** 7.2/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D16-001 | 🟡 MEDIUM | src/presentation/styles/main.css | 20-21 | **Privacy/CSP + performance risk:** importing Google Fonts via CSS `@import url(...)` triggers an extra render-blocking request and introduces a third-party dependency that can complicate CSP and privacy requirements. | Prefer loading fonts via HTML `<link rel="preconnect">` + `<link rel="stylesheet">`, or self-host the font files. If you must use Google Fonts, document CSP requirements and consider a local fallback-only mode. |
| D16-002 | 🟢 LOW | src/presentation/styles/main.css | 1065-1069 | **Hard-coded colors in high-contrast override:** `prefers-contrast: high` sets `--color-border-primary`/`--color-text-secondary` to `#000`, bypassing the token system. This is defensible for accessibility, but it can drift from the design token approach used elsewhere. | Define dedicated high-contrast tokens in `variables.css` (e.g., `--color-hc-border`, `--color-hc-text`) and reference them here to keep overrides within the token system. |
| D16-003 | 🟢 LOW | src/presentation/styles/main.css | 29-35 | **Aggressive global reset may have side-effects:** applying `margin: 0; padding: 0;` to `*` can unintentionally override default spacing for elements/components (including third-party widgets) and can increase the need for per-component style fixes. | Consider a more targeted reset (e.g., normalize stylesheet) or limit resets to known elements, keeping global overrides minimal. |

**Positive Aspects:**
- The design-token approach in `variables.css` is comprehensive and consistent; most component styling uses tokens rather than raw values.
- Accessibility is treated seriously: keyboard focus handling, `sr-only`, skip link, and `prefers-reduced-motion` are present and well-scoped.
- Component base styles (buttons/inputs/cards/modals) are cohesive and reuse shared primitives (spacing/radius/shadows).

**Group Notes:**
Overall the styling system is solid; the main improvement is replacing third-party font loading via CSS `@import` with a more CSP-friendly and performant approach.

---

#### Group 5.2: Router
**Files Reviewed:**
- src/presentation/router/index.ts

**Score:** 6.3/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D17-001 | 🟡 MEDIUM | src/presentation/router/index.ts | 350-356, 644-655 | **Unvalidated redirect target:** the auth guard stores `redirect: to.fullPath`, and `handlePostLoginRedirect()` later does `router.push(redirect)` without validating it. This can cause unexpected navigation (or navigation failures) if the query param is tampered with or points to an invalid route. | Validate redirects before navigating: allow only internal paths you expect (e.g., strings starting with `/` and not `//`), and/or use `router.resolve()` + a denylist (`/login`, `/forbidden`) before pushing. Fallback to dashboard on invalid inputs. |
| D17-002 | 🟡 MEDIUM | src/presentation/router/index.ts | 375-411 | **Client-side project access check is brittle and may leak data:** the router guard instantiates `ProjectRepository` and fetches “project with participants” to decide access, then uses `(projectData as any).creatorId` and assumes shapes like `specialUsers?.some(su => su.userId === ...)`. This can break with DTO drift and adds a network call on navigation. It also encourages a false sense of security (client-side checks are bypassable; server must enforce). | Enforce project authorization on the backend (return 403/404) and keep the router guard minimal (e.g., redirect on 403). If you keep a client-side check for UX, source access from a typed permission service/store and avoid `any` by aligning DTO shapes. |
| D17-003 | 🟢 LOW | src/presentation/router/index.ts | 365-368, 401-409, 447-458 | **Console logging in core navigation paths:** role denial and project access failures use `console.warn`/`console.error` (and router errors log to console). This is noisy and can leak contextual info (user id, project id) into shared-device consoles. | Gate logs behind `import.meta.env.DEV` (or a centralized frontend logger) and avoid logging identifiers unless necessary. |

**Positive Aspects:**
- Meta typing via `declare module 'vue-router'` makes route-level auth/navigation configuration much clearer.
- Route definitions are well organized, consistently titled, and lazily loaded.
- Scroll behavior and chunk-load error handling improve UX during navigation.

**Group Notes:**
The biggest improvements are around keeping authorization “server-first” and hardening redirect handling. Router guards are great for UX, but they shouldn’t duplicate backend permission logic or depend on unstable DTO shapes.

---

#### Group 5.3: Stores (Pinia)
**Files Reviewed:**
- src/presentation/stores/auth.store.ts
- src/presentation/stores/message.store.ts
- src/presentation/stores/notification.store.ts
- src/presentation/stores/project.store.ts
- src/presentation/stores/task.store.ts
- src/presentation/stores/user.store.ts

**Score:** 5.8/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D18-001 | 🟠 HIGH | src/presentation/stores/auth.store.ts | 310-357 | **Sensitive token persistence in `localStorage`:** access + refresh tokens (and user profile JSON) are stored in `localStorage`. Any XSS on the origin can exfiltrate refresh tokens, enabling long-lived account compromise. | Prefer HttpOnly secure cookies for refresh tokens (and short-lived access tokens), or keep tokens in memory/session storage with strict CSP + XSS hardening. At minimum, never store refresh tokens in `localStorage`, and clear storage on logout and auth errors. |
| D18-002 | 🟡 MEDIUM | src/presentation/stores/auth.store.ts | 50-58, 103-105, 264-270, 329-343 | **Session validity is estimated and can be “extended” on reload:** `expiresAt` is derived from `AUTH.TOKEN_EXPIRY_HOURS` and, on reload, recomputed as `now + expiryMs`. `validateSession()` is effectively local-only. This can cause the UI to treat expired tokens as valid until the server rejects requests. | Parse JWT `exp` (or accept `expiresAt` from backend) and persist it alongside tokens. Don’t recompute expiry relative to *load time*. Consider a backend `/auth/session` validation endpoint if you need definitive server-side checks. |
| D18-003 | 🟡 MEDIUM | src/presentation/stores/project.store.ts | 287-356 | **Brittle permission/participant mapping via `any` + hidden fields:** project participant roles are cast with `as any`, and permissions depend on `(projectWithDetails as any).creatorId`. This duplicates server authorization logic in client state and is fragile under DTO drift. | Introduce a typed `ProjectWithParticipantsDto` that includes `creatorId` explicitly (if needed), or compute permissions server-side and return a typed permission object. Avoid `any` casts by aligning DTO shapes and enums across layers. |
| D18-004 | 🟡 MEDIUM | src/presentation/stores/project.store.ts | 154-189, 248-251 | **N+1 request pattern for project summaries:** mapping each `Project` to `ProjectSummaryDto` triggers extra calls (fetch client name, tasks, unread messages) per project. With many projects this will be slow and can overload the backend. | Denormalize on the backend: return client name + counts in the list endpoint, or add a batch endpoint to fetch counts in one round trip. Consider caching and concurrency limits if some denormalization must remain client-side. |
| D18-005 | 🟡 MEDIUM | src/presentation/stores/message.store.ts | 136-163, 271-316 | **Pagination + read-state are internally inconsistent:** `fetchMessagesByProject(..., loadMore)` doesn’t actually paginate (always loads the full set), yet merges messages and sets a fake pagination object. `markAsRead()` calls a *project-level* “mark as read” endpoint but only marks a single message locally and decrements unread by 1, risking state drift. | Implement real pagination (page/limit or cursor) end-to-end, and make read APIs match UI semantics (either “mark one” or “mark all”). After a project-level mark-as-read, update all local messages/read counts consistently. |
| D18-006 | 🟡 MEDIUM | src/presentation/stores/notification.store.ts | 30, 171-204, 251-252 | **Notification persistence is not user-scoped and is incomplete:** notifications are saved under a global `localStorage` key (`cpm_notifications`) without a per-user namespace; this can leak state across accounts on shared machines. The store also defines `loadFromStorage()` but doesn’t call it during initialization, so persistence is only half-implemented. | Scope storage keys by `userId` (or clear on logout/login), and call `loadFromStorage()` on store init (or remove persistence entirely). Ensure date fields are consistently rehydrated (`createdAt`, `readAt`). |
| D18-007 | 🟢 LOW | src/presentation/stores/{auth,project,message,notification,user}.store.ts | Multiple | **Production-noisy console logging + unused unsubscribe:** several stores contain verbose `console.*` logging (including debug emoji logs and dumping objects), and `message.store.ts` captures a WebSocket `unsubscribe` but never uses it. This is noisy and can leak contextual data into shared-device consoles. | Gate logs behind `import.meta.env.DEV` or a centralized logger with log levels. If WebSocket listeners need cleanup (e.g., on logout), retain and call `unsubscribe` appropriately. |

**Positive Aspects:**
- Stores are consistently structured (state/getters/actions) and generally follow a readable Composition-API style.
- Several UX-friendly touches exist (e.g., duplicate WebSocket message suppression, derived computed views for lists).
- The use of Domain entities in some flows (`Project`, `Task`) suggests an intent to centralize invariants.

**Group Notes:**
The core theme is “state correctness vs. security”: several stores implement authorization/persistence decisions client-side (tokens, permissions, unread/read state) in ways that can drift from backend truth. Tightening DTO contracts, avoiding `any`, and moving security-sensitive decisions server-first will improve both reliability and posture.

---

#### Group 5.4: Composables
**Files Reviewed:**
- src/presentation/composables/use-auth.ts
- src/presentation/composables/use-files.ts
- src/presentation/composables/use-messages.ts
- src/presentation/composables/use-notifications.ts
- src/presentation/composables/use-projects.ts
- src/presentation/composables/use-tasks.ts
- src/presentation/composables/use-users.ts

**Score:** 6.4/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D19-001 | 🟡 MEDIUM | src/presentation/composables/use-auth.ts | 152-160, 229-234 | **Redirect handling is duplicated and still unvalidated:** after login, `useAuth()` pushes `currentRoute.query.redirect` directly; `requireAuth()` also stores an `intended_route` in `sessionStorage`. This duplicates router logic and preserves the same “untrusted redirect” risk already tracked in router code. | Centralize redirect handling in one place (router guard + a single helper), and validate redirect targets before navigation (allow only internal, resolved routes). Prefer one mechanism (query param or session storage), not both. |
| D19-002 | 🟡 MEDIUM | src/presentation/composables/use-files.ts | 156-176 | **Upload response typing is `any` and depends on unclear interceptor behavior:** `uploadFile<{file: any}>` then extracts `(response.data as any)?.data?.file || response.data?.file`, suggesting inconsistent response envelopes. This can hide breakages until runtime and encourages ad-hoc casting. | Define and enforce a single upload response shape (e.g., `ApiResponse<{ file: FileDto }>`), and update the HTTP client interceptor typing so callers don’t need `any` or dual-path extraction. |
| D19-003 | 🟢 LOW | src/presentation/composables/use-tasks.ts | 26, 273-277, 364-366 | **Status/transition semantics are duplicated and may drift:** the composable relies on `TASK.STATUS_TRANSITIONS` for transitions and uses a broad `pendingCount` definition (`status !== COMPLETED`), which can diverge from Domain transition tables and UI expectations (pending vs in-progress vs done). | Source transition rules from the domain enum/table (`TaskStatusTransitions`) or from a single shared mapping. Rename counters (e.g., `openCount`) or tighten the predicate to match business semantics. |
| D19-004 | 🟢 LOW | src/presentation/composables/{use-projects,use-users}.ts | 209-212, 152-155, 194-200 | **Composable-level permission gating can create a false sense of security:** some actions are guarded client-side (e.g., create project/users), while others are not. This is fine for UX but should not be treated as authorization. | Keep client checks for UX only, but ensure backend enforces permissions consistently. Consider returning explicit permission DTOs from the server and using them for UI gating to avoid drift. |

**Positive Aspects:**
- Composables keep UI components clean by providing a stable, typed façade over stores.
- Most composables are thin wrappers, which reduces duplicated state management logic.

**Group Notes:**
The composables are generally well-structured, but a few patterns (redirect navigation, `any`-typed upload envelopes, duplicated transition mappings) should be centralized to reduce drift and prevent recurring issues across files.

---

#### Group 5.5: Backend App Bootstrap
**Files Reviewed:**
- backend/src/presentation/app.ts

**Score:** 6.2/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D20-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/presentation/app.ts | N/A (bootstrap validation added) | **CORS allowlist validated when credentials are enabled:** the app now fails fast (outside development) if CORS credentials are enabled with a wildcard origin (`'*'`), preventing a common misconfiguration that breaks browsers and can broaden cross-site access unexpectedly. | Completed: added a bootstrap guard that rejects `origin: '*'` when `credentials: true` (non-dev). |
| D20-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/presentation/app.ts | N/A (dev-only morgan) | **Request logging is now environment-gated:** `morgan('dev')` runs only in development, reducing production log noise and avoiding leaking request details unnecessarily. | Completed: wrapped `morgan('dev')` middleware registration behind `SERVER.NODE_ENV === 'development'`. |
| D20-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/presentation/app.ts | N/A (rate limiter added) | **Basic edge protections added at bootstrap:** the backend now enables an app-level rate limiter in production and configures `trust proxy`, reducing exposure to brute-force and request-flood abuse at the HTTP boundary. | Completed: added production-only `express-rate-limit` middleware and set `trust proxy` to support reverse-proxy deployments. |
| D20-004 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/presentation/app.ts | N/A (header standardized) | **Header metadata mismatch resolved:** the app bootstrap header now correctly uses `@file backend/src/presentation/app.ts` (and is consistent with the project header template), improving traceability. | Completed: standardized the header metadata to match the real file location. |

**Positive Aspects:**
- Middleware ordering is sensible: Helmet + CORS + parsers + logging + routes + 404 + global error handler.
- Explicit JSON/urlencoded size limits reduce accidental large-payload abuse compared to defaults.
- Root endpoint provides a clear discovery payload for API consumers.

**Group Notes:**
This file is a good minimal bootstrap; the main improvements are hardening the production posture (CORS allowlists, env-gated logging, and rate limiting).

---

#### Group 5.6: Backend Routes
**Files Reviewed:**
- backend/src/presentation/routes/audit-log.routes.ts
- backend/src/presentation/routes/auth.routes.ts
- backend/src/presentation/routes/backup.routes.ts
- backend/src/presentation/routes/export.routes.ts
- backend/src/presentation/routes/file.routes.ts
- backend/src/presentation/routes/index.ts
- backend/src/presentation/routes/message.routes.ts
- backend/src/presentation/routes/notification.routes.ts
- backend/src/presentation/routes/project.routes.ts
- backend/src/presentation/routes/task.routes.ts
- backend/src/presentation/routes/user.routes.ts

**Score:** 6.6/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D21-001 | 🟡 MEDIUM | backend/src/presentation/routes/{project,task,file,message,notification}.ts | project: 27-38, 41-60; task: 21-25; file: 23-39; message: 21-22; notification: 22-30 | **Authorization is not expressed at the routing boundary for most resources:** many routers apply `authenticate` but do not use `authorize` / policy middleware for sensitive operations (project writes, file upload/delete, task mutation). If controllers/services don’t enforce ownership/membership consistently, this becomes a privilege escalation risk; even if they do, the intended policy is opaque at the HTTP boundary. | Prefer route-level policy middleware for the “coarse” checks (role, project membership/ownership) and keep controllers focused on orchestration. At minimum, document required permissions per route and ensure controllers enforce them with shared helpers. |
| D21-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/presentation/routes/{project,notification}.ts | N/A (route handlers updated) | **Request object mutation removed:** routes no longer mutate `req.query`/`req.params` to reuse controller handlers; sub-resource routes now use consistent param names and bind controller methods directly, and notifications read `userId` from params or query without router-side mutation. | Completed: updated route definitions to avoid `req` mutation and adjusted controller input extraction for backwards-compatible query support. |
| D21-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/presentation/routes/audit-log.routes.ts | N/A (shared prisma singleton) | **Prisma lifecycle hardened:** audit log routes no longer instantiate `new PrismaClient()` at module scope; they now reuse the shared Prisma singleton to avoid multiple clients and simplify lifecycle/shutdown behavior. | Completed: replaced route-local PrismaClient with the shared `prisma` singleton from `backend/src/infrastructure/database/prisma.client.ts`. |
| D21-004 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/presentation/routes/{index,auth,file,message,notification,project,task,user}.ts | N/A (headers standardized) | **Backend route module headers standardized:** routes now consistently declare the correct `@file backend/src/presentation/routes/...` and include the expected `@see` links, improving traceability and documentation consistency. | Completed: standardized route module headers to match the project template and real paths. |

**Positive Aspects:**
- Route composition is clean and discoverable via `apiRouter` (and includes a simple `/health` endpoint).
- Admin-only routers correctly use `authenticate` + `authorize('ADMINISTRATOR')` at the router level (e.g., audit logs, export, backup).

**Group Notes:**
The routing layer is mostly straightforward; the main risks are policy clarity (authorization) and maintainability (request mutation + local Prisma instantiation).

---

#### Group 5.7: Backend Controllers
**Files Reviewed:**
- backend/src/presentation/controllers/audit-log.controller.ts
- backend/src/presentation/controllers/auth.controller.ts
- backend/src/presentation/controllers/backup.controller.ts
- backend/src/presentation/controllers/export.controller.ts
- backend/src/presentation/controllers/file.controller.ts
- backend/src/presentation/controllers/index.ts
- backend/src/presentation/controllers/message.controller.ts
- backend/src/presentation/controllers/notification.controller.ts
- backend/src/presentation/controllers/project.controller.ts
- backend/src/presentation/controllers/task.controller.ts
- backend/src/presentation/controllers/user.controller.ts

**Score:** 6.0/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D22-001 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/src/presentation/controllers/notification.controller.ts | N/A (controller updated) | **Notification listing is not access-controlled in the controller:** `getByUserId()` returned notifications for `req.params.userId` with no ownership/admin check, allowing authenticated users to read other users’ notifications. **Resolved:** the controller now derives the target user from the authenticated context for non-admins and enforces ownership/admin checks. | Completed: enforced `currentUser.id === userId` unless admin; non-admin requests ignore userId input and only return the current user’s notifications. |
| D22-002 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/src/presentation/controllers/message.controller.ts | N/A (controller updated) | **Message creation trusts raw request body:** `create()` passed `req.body` directly to persistence, enabling spoofed `senderId` and allowing message access without project authorization checks. **Resolved:** the controller binds `senderId` from the authenticated user and validates project access/permissions for both listing and creation. | Completed: sender identity is now server-bound (`senderId = currentUser.id`), and the controller enforces project access (`VIEW`/`SEND_MESSAGE`) before listing/creating messages. |
| D22-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/presentation/controllers/{auth,export,project}.controller.ts | N/A (shared prisma singleton) | **Prisma lifecycle hardened:** controllers no longer instantiate `new PrismaClient()` at module scope; they now reuse the shared Prisma singleton, reducing connection churn and improving shutdown behavior. | Completed: replaced controller-local PrismaClient instances with the shared `prisma` singleton from `backend/src/infrastructure/database/prisma.client.ts`. |
| D22-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/presentation/controllers/{project,task}.controller.ts | N/A (error taxonomy updated) | **Auth error semantics corrected:** controllers no longer throw `NotFoundError` for unauthenticated/forbidden cases; they now use `UnauthorizedError` (401) and `ForbiddenError` (403) appropriately, keeping `NotFoundError` for true missing resources. | Completed: replaced incorrect `NotFoundError` usage for auth/authorization paths with `UnauthorizedError`/`ForbiddenError`, and used `BadRequestError` for invalid due dates. |
| D22-005 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/presentation/controllers/{file,project,message}.controller.ts | N/A (console logs removed) | **Controller console logging removed:** backend controllers no longer use `console.*` in request paths; operational logs route through the shared logger (with level control), reducing the chance of leaking PII/request bodies/stacks in production. | Completed: removed controller `console.*` usage and used structured logger calls where helpful. |
| D22-006 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/presentation/controllers/file.controller.ts | N/A (sanitized + server filename) | **Dropbox path construction used user-controlled values without sanitization:** `section` and `originalname` were interpolated into a Dropbox path. **Resolved:** `section` is now allowlisted/normalized and the Dropbox storage filename is generated server-side from the file id + a sanitized basename (original name is preserved separately). | Completed: controller normalizes `section`, strips path separators/control chars from the stored basename, and uses a server-generated storage filename for Dropbox paths. |
| D22-007 | 🟢 LOW ✅ RESOLVED (2026-03-08) | backend/src/presentation/controllers/{audit-log,export,project,user}.controller.ts | N/A (validation added) | **Input parsing hardened:** controllers now validate integer/date parsing and safely decode URI params; malformed inputs return 400 instead of turning into avoidable 500s. | Completed: added `NaN`/Invalid Date checks for `parseInt(...)` and `new Date(...)` and wrapped `decodeURIComponent(...)` to throw/return a 400 via `BadRequestError` handling. |
| D22-008 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/presentation/controllers/{auth,file,message,notification,project,task,user,index}.ts | N/A (headers standardized) | **Controller file headers standardized:** controllers now consistently declare `@file backend/src/presentation/controllers/...`, improving traceability and documentation consistency in generated docs. | Completed: standardized controller `@file` metadata to match the real file locations. |

**Positive Aspects:**
- Several controllers do include meaningful server-side permission checks (e.g., `TaskController.update/delete` and `NotificationController.markAsRead/delete`).
- `ProjectController.getById()` performs explicit access control and includes a permissions DTO for the current user.
- `FileController` centralizes upload/download permission checks in dedicated helpers.

**Group Notes:**
The biggest correctness/security risks are missing access control on “read” endpoints (notifications) and trusting client-provided authorship (messages). The rest is mostly maintainability and production hardening (Prisma lifecycle, error semantics, logging hygiene, and input validation).

---

#### Group 5.8: Backend Middlewares
**Files Reviewed:**
- backend/src/presentation/middlewares/error-handler.middleware.ts
- backend/src/presentation/middlewares/index.ts
- backend/src/presentation/middlewares/upload.middleware.ts

**Score:** 7.1/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D23-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/presentation/middlewares/upload.middleware.ts | N/A (extension + MIME allowlist) | **Upload validation now checks extension + MIME type and returns 400:** `fileFilter()` validates `originalname` extension and `mimetype`, and rejects using `BadRequestError` so clients receive a predictable 400 response instead of a generic 500. | Completed: added MIME type allowlist validation and replaced generic `Error` with `BadRequestError`. |
| D23-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/presentation/middlewares/error-handler.middleware.ts | N/A (typed + gated errors) | **Error response leakage reduced:** `AppError` responses no longer blindly include `(error as any).errors`; structured `errors` are returned for `ValidationError` and otherwise only in development, reducing accidental leakage of internal details. | Completed: removed untyped `(error as any).errors` and returned `errors` only for `ValidationError` (and dev-only fallback). |
| D23-003 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/presentation/middlewares/{error-handler,index}.ts | N/A (headers standardized) | **Backend middleware headers standardized:** middleware modules now declare `@file backend/src/presentation/middlewares/...`, improving traceability. | Completed: standardized middleware `@file` metadata to match the real file locations. |

**Positive Aspects:**
- Centralized `errorHandler` exists and integrates with the project logger (`logError`).
- Upload limits are explicit (`MAX_FILE_SIZE`) and use in-memory storage suitable for streaming to Dropbox.

**Group Notes:**
This is a solid baseline; the main hardening opportunity is ensuring validation and error mapping produce predictable 4xx responses and don’t leak internals.

---

### Phase 6: Presentation Layer - Component Review

#### Group 6.1: Common Components
**Files Reviewed:**
- src/presentation/components/common/AppBadge.vue
- src/presentation/components/common/AppButton.vue
- src/presentation/components/common/AppCard.vue
- src/presentation/components/common/AppConfirmDialog.vue
- src/presentation/components/common/AppEmptyState.vue
- src/presentation/components/common/AppFooter.vue
- src/presentation/components/common/AppHeader.vue
- src/presentation/components/common/AppInput.vue
- src/presentation/components/common/AppModal.vue
- src/presentation/components/common/AppSelect.vue
- src/presentation/components/common/AppSidebar.vue
- src/presentation/components/common/AppSpinner.vue
- src/presentation/components/common/AppTextarea.vue
- src/presentation/components/common/LoadingSpinner.vue
- src/presentation/components/common/index.ts

**Score:** 6.8/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D24-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/common/AppModal.vue | N/A (ref-counted scroll lock) | **Modal scroll lock no longer clobbers global body styles and supports stacked modals:** scroll locking now uses a shared ref-count, restores the original `overflow`/`paddingRight` values only when the last modal closes, and each modal instance only unlocks if it previously locked. | Completed: added ref-counted scroll lock and restore of original body styles; removed unconditional unlock side effects. |
| D24-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/common/AppInput.vue | N/A (safe number parsing) | **Number input parsing no longer emits `0` for empty or `NaN`:** empty input emits `''` and numeric input uses `valueAsNumber` with `Number.isFinite(...)` checks, avoiding `NaN` propagation. | Completed: parse number inputs via `valueAsNumber` and guard empty/invalid cases. |
| D24-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/common/AppSelect.vue | N/A (typed value round-trip) | **Select now handles falsy values correctly and preserves numeric option types:** placeholder/clear logic uses explicit emptiness checks, DOM values are stringified, and change events map back to the declared option value type. | Completed: fix emptiness checks (`null`/`''`), stringify option values, and map emitted value back via option lookup. |
| D24-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/common/AppConfirmDialog.vue | N/A (close emits cancel) | **ConfirmDialog now emits `cancel` on overlay/escape/X close:** the component listens to `AppModal`’s `close` event and treats non-confirm closes as cancel, ensuring cleanup handlers run. | Completed: added `@close` handler to emit `cancel`, and updated the template to use typed `emit(...)` instead of `$emit(...)`. |
| D24-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/common/AppCard.vue | N/A (Space key support) | **Clickable card now supports Space key activation:** `AppCard` handles both Enter and Space keypresses when `clickable` is true; Space uses `.prevent` to avoid page scroll. | Completed: added `@keydown.space.prevent` to trigger the same click handler as Enter. |
| D24-006 | 🟢 LOW | src/presentation/components/common/{AppInput,AppSelect,AppTextarea,AppModal}.vue | AppInput: 163-164; AppSelect: 133-134; AppTextarea: 124-125; AppModal: 96-98 | **Runtime-generated IDs via `Math.random()` are non-deterministic:** this can cause hydration mismatches in SSR and makes snapshot/e2e tests harder. | Prefer Vue’s `useId()` (Vue 3.5+) or a stable per-instance counter utility; allow passing `id` via props consistently. |
| D24-007 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/common/{AppInput,AppTextarea,AppConfirmDialog}.vue | N/A (typed `emit` usage) | **Common components now use typed `emit` in templates:** event bindings no longer call `$emit(...)` directly, improving type-safety and consistency with `<script setup>`. | Completed: replaced `$emit(...)` with typed `emit(...)` in the affected components’ templates. |
| D24-008 | 🟢 LOW | src/presentation/components/common/LoadingSpinner.vue | 21-33, 70-92 | **Dead props + hard-coded fallback colors undermine design-token consistency:** `overlay` is declared but not used, and several CSS rules hard-code hex colors as fallback values. | Either implement `overlay` behavior or remove the prop. Replace hard-coded fallbacks with token-only values (or centralize fallbacks in the token definitions). |
| D24-009 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/common/AppHeader.vue | N/A (store-driven count) | **Header notification badge is no longer hard-coded:** the unread count is derived from `useNotificationStore()` instead of `ref(3)`, preventing incorrect “always 3” UI state. | Completed: bind badge to `notificationStore.unreadCount` via a computed value. |
| D24-010 | 🟢 LOW | src/presentation/components/common/{AppHeader,AppFooter,AppSidebar,LoadingSpinner}.vue | AppHeader: 1-6; AppFooter: 1-5; AppSidebar: 1-6; LoadingSpinner: 1-6 | **File headers are inconsistent within the same component group:** several components use a different header style than the rest of the codebase’s standard “University of La Laguna” template. | Standardize these headers to the project template for traceability and consistent doc generation. |

**Positive Aspects:**
- The base form components consistently expose `error` state and set `aria-invalid`, which is a good accessibility baseline.
- `AppModal` provides a solid starting point: `Teleport`, `Transition`, `role="dialog"`, and a basic focus trap.
- Styling generally uses design tokens (spacing, radius, colors, shadows) rather than raw values.

**Group Notes:**
Most issues are correctness/a11y edge cases and consistency. The biggest functional risk is value handling for `number`/select inputs and avoiding global side-effects in the modal scroll-lock implementation.

---

#### Group 6.2: Layout Components
**Files Reviewed:**
- src/presentation/components/layout/AppHeader.vue
- src/presentation/components/layout/AppSidebar.vue

**Score:** 7.0/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D25-001 | 🟡 MEDIUM | src/presentation/components/layout/AppSidebar.vue | 70-76 | **Navigation links are not permission-aware:** the sidebar includes routes like `/backup` and `/settings` unconditionally. If these views are role-restricted (admin-only), this creates UX confusion and encourages “click-into-403” flows; if route guards are ever weakened, it becomes a real access-control issue. | Build `navLinks` from an explicit permission model (store-derived role/rights) and/or keep route meta as the source of truth for visibility; ensure router guards enforce access regardless of UI visibility. |
| D25-002 | 🟡 MEDIUM | src/presentation/components/layout/AppHeader.vue | 40-63 | **User dropdown lacks standard dismissal behavior:** the dropdown toggles open/closed but does not close on outside click, route navigation (except settings/logout handlers), or Escape key. This can leave menus “stuck” and harms keyboard accessibility. | Add click-outside + Escape handling (and ensure cleanup on unmount). Consider focus management: move focus into the menu on open and return focus to the trigger on close. |
| D25-003 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/layout/{AppHeader,AppSidebar}.vue | N/A (typed emits/router) | **Layout components now use typed `emit` + `router`:** the templates no longer rely on `$emit`/`$router`, routing actions through the typed `emit(...)` function and `router.push(...)` handlers. | Completed: replaced `$emit`/`$router` usage in templates with typed handlers.
| D25-004 | 🟢 LOW | src/presentation/components/layout/AppSidebar.vue | 46 | **Unused import indicates lint/type-check drift:** `computed` is imported but never used. | Remove unused imports to keep lint clean and reduce noise in reviews. |
| D25-005 | 🟢 LOW | src/presentation/components/layout/{AppHeader,AppSidebar}.vue | 1-11 | **File header template inconsistency:** these layout components use a partial header style (missing the second `@see` link and differing formatting) compared to the standard template used across many other modules. | Standardize headers within the Presentation layer so generated docs and audits remain consistent. |

**Positive Aspects:**
- Both components use clear, minimal state and keep side-effects low.
- `AppHeader` correctly sources unread notifications from the store (computed), avoiding hard-coded counts.
- Sidebar mobile overlay click-to-close is implemented and stops propagation inside the nav.

**Group Notes:**
Primary improvements are UX/accessibility polish (menu dismissal) and consistency (typed emits/router usage). Authorization must remain backend-first, but navigation visibility should align with route access to reduce confusion.

---

### Phase 7: Presentation Layer - Feature Components Review

#### Group 7.1: Project Components
**Files Reviewed:**
- src/presentation/components/project/ProjectCard.vue
- src/presentation/components/project/ProjectForm.vue
- src/presentation/components/project/ProjectSummary.vue

**Score:** 7.1/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D26-001 | 🟡 MEDIUM | src/presentation/components/project/ProjectSummary.vue | 86-164, 200-218 | **Clickable “stat cards” and section cards are not keyboard-accessible:** several interactive tiles are `div` elements with `@click` (and `$emit(...)`) but no `role`, `tabindex`, or Space/Enter handling. This blocks keyboard-only and assistive tech users from navigating to tasks/messages/files/participants. | Prefer semantic `<button type="button">` for interactive tiles. If a `div` must remain, add `role="button"`, `tabindex="0"`, and handle `@keydown.enter` / `@keydown.space.prevent` consistently. Consider `aria-label` where the visible label is ambiguous. |
| D26-002 | 🟡 MEDIUM | src/presentation/components/project/ProjectForm.vue | 473-476 | **Date-only formatting is timezone-sensitive:** `formatDateForInput()` uses `toISOString().split('T')[0]` which formats in UTC. For users outside UTC, this can render an off-by-one date in `<input type="date">` when the underlying date is interpreted as local time. | Format “date-only” values in local time (e.g., via `getFullYear()/getMonth()/getDate()` with zero-padding) or keep transport as an ISO date string (`YYYY-MM-DD`) and avoid `Date` round-trips for date-only inputs. |
| D26-003 | 🟡 MEDIUM | src/presentation/components/project/ProjectCard.vue | 243-246 | **Component mixes navigation with event emission:** `handleClick()` both emits a `click` event and performs `router.push(...)`. Parents listening to `@click` may also navigate or trigger other side effects, causing double-navigation or unexpected flows. | Pick a single responsibility: either (a) emit and let the parent route, or (b) navigate internally and emit a more specific “opened”/“selected” event. If both are needed, add an explicit prop controlling navigation. |
| D26-004 | 🟢 LOW | src/presentation/components/project/ProjectCard.vue | 15-29 | **Keyboard interaction is incomplete for `role="button"`:** the card handles Enter but not Space, which is expected for button-like controls. | Add `@keydown.space.prevent="handleClick"` (and consider `@keydown.enter.prevent`). Alternatively, use a real `<button>` element for the clickable container. |
| D26-005 | 🟢 LOW | src/presentation/components/project/ProjectForm.vue | 231-240, 276-288 | **Template bypasses typed emitter:** the Cancel button uses `$emit('cancel')` even though a typed `emit` function is defined via `defineEmits<ProjectFormEmits>()`. This reduces type-safety and consistency (event-name typos won’t be caught). | Use `@click="emit('cancel')"` or route through a `handleCancel()` function in script setup. |
| D26-006 | 🟢 LOW | src/presentation/components/project/ProjectForm.vue | 450-455 | **Generated project codes can collide:** `generateCode()` uses `Math.random()` to pick a 1–999 sequence. This can easily generate duplicates and cause avoidable backend validation failures. | Generate codes server-side (authoritative) or use a backend-provided “next sequence” endpoint. If client-side generation remains, validate uniqueness before submit and surface a clear error when a collision occurs. |
| D26-007 | 🟢 LOW | src/presentation/components/project/ProjectSummary.vue | 51-82, 304-312 | **Minor a11y/robustness gaps in header/status:** the delete action button is icon-only (no `aria-label`), and `statusLabel` can evaluate to `undefined` for unexpected statuses, resulting in blank UI text. | Add `aria-label="Delete project"` (and optionally `title`). For `statusLabel`, provide a fallback (`labels[status] ?? status`) like `ProjectCard` does. |

**Positive Aspects:**
- `ProjectForm` provides clear, field-specific validation and keeps create/edit modes distinct.
- `ProjectCard` correctly stops propagation inside the actions menu and includes click-outside closing behavior.
- `ProjectSummary` is cleanly structured and relies on computed “shortcuts” (project/taskStats/permissions), keeping the template readable.

**Group Notes:**
Most issues here are accessibility and UX correctness edge cases rather than business-logic problems. The biggest hardening opportunities are (1) making all interactive tiles fully accessible, and (2) avoiding timezone bugs in date-only inputs.

---

#### Group 7.2: Task Components
**Files Reviewed:**
- src/presentation/components/task/TaskCard.vue
- src/presentation/components/task/TaskForm.vue
- src/presentation/components/task/TaskHistory.vue
- src/presentation/components/task/TaskList.vue

**Score:** 6.9/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D27-001 | 🟡 MEDIUM | src/presentation/components/task/TaskList.vue | 50-57, 316-324 | **Priority sorting logic contradicts the UI label:** the sort option “Priority (Low → High)” is implemented with `URGENT` as the lowest weight (1) and `LOW` as the highest weight (4), which yields “Urgent → Low” for ascending. This is a correctness/UX bug and makes sorting feel broken. | Either rename the label to match the ordering, or flip the weight mapping (e.g., `LOW: 1 … URGENT: 4`) so ascending produces Low→High and descending produces High→Low. |
| D27-002 | 🟡 MEDIUM | src/presentation/components/task/TaskForm.vue | 351-358, 405-407, 520-531 | **Date-only handling is timezone-sensitive:** `formatDateForInput()` uses `toISOString().split('T')[0]` (UTC) while submit/validation uses `new Date(form.dueDate)` (local parsing). In non-UTC timezones, this can shift the displayed due date by one day when editing an existing task. | Use a local “YYYY-MM-DD” formatter (from local date parts) for `<input type="date">`, or keep date-only values as strings at the boundary and avoid `Date` round-trips for date-only fields. |
| D27-003 | 🟡 MEDIUM | src/presentation/components/task/TaskForm.vue | 42-44, 313-314 | **Enum comparisons are stringly-typed in the template:** the template compares `selectedNewStatus` / `task.status` to string literals like `'COMPLETED'` and `'PERFORMED'` even though state is typed as `TaskStatus | null`. This is fragile and can drift if enum values or casing change. | Compare against `TaskStatus.COMPLETED` / `TaskStatus.PERFORMED` (and keep all status logic consistently enum-based). |
| D27-004 | 🟢 LOW | src/presentation/components/task/TaskCard.vue | 15-33 | **Keyboard interaction is incomplete for `role="button"`:** the card supports Enter but not Space, which is expected for button-like controls; additionally it mixes `role="button"` with `draggable`, which can create confusing interaction for keyboard/screen-reader users. | Add `@keydown.space.prevent="handleClick"` (and consider `@keydown.enter.prevent`). If possible, switch to a semantic `<button>` wrapper or provide an explicit “open” button while leaving the card as a non-interactive container. |
| D27-005 | 🟢 LOW | src/presentation/components/task/TaskForm.vue | 229-237, 243-246, 284-301 | **Template bypasses typed emitter:** the component defines typed emits, but uses `$emit('remove-file', ...)` and `$emit('cancel')` in the template. This reduces type-safety and consistency across the Presentation layer. | Use the typed `emit` function (e.g., `@click="emit('cancel')"`) or route through `handleCancel()` / `handleRemoveFile(fileId)` helpers. |
| D27-006 | 🟢 LOW | src/presentation/components/task/TaskList.vue | 66-70, 108-117, 125-134, 198-199 | **TaskList relies on `$emit` in templates despite typed emits:** `defineEmits<TaskListEmits>()` exists, but several template paths use `$emit` (including the create button and TaskCard event forwarding). | Forward events through typed handlers defined in `<script setup>` (e.g., `onCreate() { emit('create') }`, `onTaskClick(task) { emit('task-click', task) }`). |
| D27-007 | 🟢 LOW | src/presentation/components/task/TaskHistory.vue | 97-105, 110-152 | **History rendering depends on ad-hoc string parsing of actions:** `getActionType()` / `formatAction()` infer semantics from substrings in `entry.action`, which makes the UI brittle if backend strings change (or are localized). This echoes the broader “action: string” drift risk noted earlier (D5-004). | Introduce a typed `TaskHistoryAction` union/enum at the DTO boundary (or a stable `actionType` field) and map to display strings in one place. |
| D27-008 | 🟢 LOW | src/presentation/components/task/TaskHistory.vue | 59-63 | **Value-change section uses truthiness checks:** `v-if="entry.previousValue || entry.newValue"` will hide changes when either side is an empty string (or other falsy-but-meaningful values). | Use explicit emptiness checks (`!= null` and `!== ''`) aligned with the backend contract for “no value”. |

**Positive Aspects:**
- `TaskForm` does a good job separating create/edit flows and provides clear client-side validation.
- `TaskCard` follows a tidy “summary + quick actions + status transitions” structure and uses typed emits in script.
- `TaskList` provides both grouped and flat views with a simple filter model and clear empty/loading states.

**Group Notes:**
The biggest correctness issue is the priority sort mismatch (D27-001). Most other findings are consistency/a11y hardening (typed-emits usage, keyboard interaction) and avoiding date-only timezone drift in forms (D27-002).

---

#### Group 7.3: Message Components
**Files Reviewed:**
- src/presentation/components/message/index.ts
- src/presentation/components/message/MessageBubble.vue
- src/presentation/components/message/MessageInput.vue
- src/presentation/components/message/MessageList.vue

**Score:** 7.3/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D28-001 | 🟡 MEDIUM | src/presentation/components/message/MessageList.vue | 177-206, 219-234 | **Message date grouping is timezone-sensitive:** the list groups by `new Date(message.sentAt).toISOString().split('T')[0]` (UTC), and Today/Yesterday logic compares against `today.toISOString().split('T')[0]`. This can mis-group messages across day boundaries and mislabel “Today/Yesterday” for users outside UTC. | Group by local calendar date (derive `YYYY-MM-DD` from local date parts) or use a date utility to compute local start-of-day keys consistently. Avoid `toISOString()` for date-only UI grouping. |
| D28-002 | 🟡 MEDIUM | src/presentation/components/message/MessageBubble.vue | 123-131 | **Initials computation can throw for whitespace-heavy names:** `senderInitials` splits on `' '` and assumes `parts[0][0]`/`parts[1][0]` exist. Inputs like `'  John'` or `'John  Doe'` can yield empty segments and trigger runtime errors when calling `toUpperCase()`. | Normalize first: `name.trim().split(/\s+/).filter(Boolean)` and defensively fall back when initials are not available. |
| D28-003 | 🟡 MEDIUM | src/presentation/components/message/MessageInput.vue | 243-252 | **Enter-to-send can break IME composition:** `handleKeyDown()` sends on Enter when Shift is not held, but does not guard for composition (`event.isComposing` / keyCode 229). This can accidentally send partially composed text for IME users. | Bail out when composing: `if (event.isComposing) return;` (and/or guard keyCode 229) before treating Enter as “send”. |
| D28-004 | 🟢 LOW | src/presentation/components/message/MessageBubble.vue | 55 | **Template bypasses typed emitter:** the file attachment click uses `$emit('file-click', file)` even though typed emits are declared in `<script setup>`. | Use the typed `emit` function in the template (or route through a handler function) to keep event names/payloads type-checked. |
| D28-005 | 🟢 LOW | src/presentation/components/message/MessageList.vue | 55 | **Template bypasses typed emitter:** `@file-click="(file) => $emit('file-click', file)"` uses `$emit` even though a typed `emit` exists. | Use `emit('file-click', file)` via a handler function to keep payload typing consistent. |
| D28-006 | 🟢 LOW | src/presentation/components/message/MessageList.vue / MessageBubble.vue | 116, 110-114 | **Dead/unused emits in public interfaces:** `MessageListEmits` declares `message-read`, and `MessageBubbleEmits` declares `retry`, but neither event is emitted in the component. This creates misleading APIs and can hide missing behavior. | Remove unused events from emit contracts, or implement the missing behavior (e.g., emit `message-read` via a visibility/intersection observer). |
| D28-007 | 🟢 LOW | src/presentation/components/message/MessageBubble.vue | 380 | **Hard-coded color token:** read-status styling uses a raw hex value (`#a7f3d0`) instead of design tokens, which undermines theming/high-contrast consistency. | Replace with an existing CSS variable token consistent with the design system. |

**Positive Aspects:**
- `MessageInput` has a clean UX: auto-resize, file previews, max file count, and typing indicators with proper timeout cleanup.
- `MessageList` is well-structured and uses an IntersectionObserver for infinite scroll.
- `MessageBubble` keeps layout logic simple and supports compact rendering + attachments.

**Group Notes:**
Most findings are UX correctness and consistency: avoid UTC-based date keys for UI grouping (D28-001), harden initials computation (D28-002), and improve IME compatibility for Enter-to-send (D28-003).

---

#### Group 7.4: File Components
**Files Reviewed:**
- src/presentation/components/file/index.ts
- src/presentation/components/file/FileList.vue
- src/presentation/components/file/FileUploader.vue

**Score:** 6.8/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D29-001 | 🟡 MEDIUM | src/presentation/components/file/FileList.vue | 78, 401-403 | **“All Files” section tab does not emit `section-change`:** section buttons call `setActiveSection(section)` (which emits), but the “All Files” tab only mutates internal state (`activeSectionInternal = ''`). This can desync parent state (URL/query, persisted filters, etc.) from the component’s internal UI. | Route “All Files” through the same code path: call `setActiveSection('')` (or emit `section-change` explicitly when clearing). |
| D29-002 | 🟡 MEDIUM | src/presentation/components/file/FileUploader.vue | 23-38 | **Drop zone is mouse-only (not keyboard-accessible):** the drop zone is a clickable `div` (`@click="triggerFileInput"`) without `role`, `tabindex`, or Space/Enter handling, so keyboard-only users can’t open the file picker via the primary control. | Use a semantic `<button type="button">` for the drop zone, or add `role="button"`, `tabindex="0"`, and handle `@keydown.enter` / `@keydown.space.prevent` to trigger the file input. |
| D29-003 | 🟢 LOW | src/presentation/components/file/FileList.vue | 130-134, 207-208, 332-341 | **File row/card interaction is inconsistent and bypasses typed emits:** grid cards use `role="button"` with Enter only (no Space), and both grid + table use `$emit(...)` in templates even though typed `emit` exists. | Add Space activation (`@keydown.space.prevent`) where `role="button"` is used. Prefer routing interactions through typed handlers in `<script setup>` using `emit('file-click', file)` etc. |
| D29-004 | 🟢 LOW | src/presentation/components/file/FileUploader.vue | 336-349, 433-452, 482-492 | **Preview cleanup is mismatched:** previews are created via `FileReader.readAsDataURL()` (data URLs), but cleanup calls `URL.revokeObjectURL(item.preview)`, which is meant for `URL.createObjectURL()` blobs. This is confusing and suggests memory cleanup is not actually happening as intended. | Either switch to `URL.createObjectURL(file)` and revoke those URLs, or keep data URLs and remove the `revokeObjectURL` calls (or store a separate object URL). |
| D29-005 | 🟢 LOW | src/presentation/components/file/FileUploader.vue | 308-312 | **Queue item ID generation uses `Math.random()`:** this can collide in fast consecutive adds and makes tests less deterministic. | Use `crypto.randomUUID()` (where available) or reuse the shared ID generator already flagged elsewhere (D15-001) to keep patterns consistent. |
| D29-006 | 🟢 LOW | src/presentation/components/file/FileList.vue | 369-388 | **Sorting repeatedly parses dates inside the comparator:** `new Date(a.uploadedAt)` is constructed during each comparison, which can become noticeable for large file lists and reactive re-sorts. | Cache timestamps (e.g., precompute `uploadedAtMs`) or compare using a derived key computed once per file before sorting. |
| D29-007 | 🟢 LOW | src/presentation/components/file/FileList.vue | 311, 606 | **Dead/unused API surface:** `FileListEmits` declares `upload-click` and styles exist for `.file-list-upload-btn`, but no upload button is rendered in the template. This increases maintenance cost and creates misleading expectations for consumers. | Either implement the upload button (if intended) and emit `upload-click`, or remove the unused emit + styles to keep the component contract minimal. |

**Positive Aspects:**
- `FileList` provides a solid UX baseline: search, section filtering, grid/list toggle, skeleton loading, and a helpful size footer.
- `FileUploader` has a clear queue model with per-file status and progress updates driven by parent props.
- Both components provide sensible aria-labels for icon-only action buttons.

**Group Notes:**
The most important fixes are correctness (consistent section-change emission) and accessibility (keyboard support for the uploader drop zone). The rest are consistency/perf cleanups.

---

#### Group 7.5: Notification Components
**Files Reviewed:**
- src/presentation/components/notification/index.ts
- src/presentation/components/notification/NotificationItem.vue
- src/presentation/components/notification/NotificationList.vue

**Score:** 7.0/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D30-001 | 🟡 MEDIUM | src/presentation/components/notification/NotificationList.vue | 284-319 | **Notification date grouping is timezone-sensitive:** grouping and Today/Yesterday detection use `toISOString().split('T')[0]` (UTC). This can mislabel notifications around day boundaries for users outside UTC (same class of bug as D28-001). | Compute local “YYYY-MM-DD” keys from local date parts (or use a date utility) and avoid `toISOString()` for UI calendar grouping. |
| D30-002 | 🟡 MEDIUM | src/presentation/components/notification/NotificationList.vue | 357-365 | **`filter-change` payload doesn’t reflect selected filter:** the UI supports `task/message/project` filters, but the watcher only sets `filter.isRead=false` for `unread` and emits `{}` for everything else. Consumers can’t reliably react to filter changes. | Map each select option to a meaningful `NotificationFilter` payload (e.g., set `filter.type` for `task/message/project`, or expose the selected UI filter as a typed union and let the parent interpret). |
| D30-003 | 🟡 MEDIUM | src/presentation/components/notification/NotificationList.vue | 232-252, 370-384 | **Potential duplicate “load more” triggers:** the component emits `load-more` via both IntersectionObserver and a scroll-threshold fallback. If parent `loadingMore` state lags, both paths can fire for the same boundary condition and trigger duplicate fetches. | Gate load-more emission with an internal “inFlight” flag, or use a single load-more mechanism (observer preferred) with robust cleanup/unobserve behavior. |
| D30-004 | 🟢 LOW | src/presentation/components/notification/NotificationItem.vue / NotificationList.vue | 23-27, 47, 102-103, 124 | **Accessibility + typed-emits consistency:** `NotificationItem` uses `role="button"` with Enter only (no Space), and `NotificationList` templates use `$emit(...)` even though typed `emit` exists. | Add Space activation (`@keydown.space.prevent`) where `role="button"` is used. Route template emissions through typed handlers using `emit(...)` for consistent type checking. |
| D30-005 | 🟢 LOW | src/presentation/components/notification/NotificationList.vue | 208 | **Filter state is weakly typed:** `activeFilter` is `ref<string>`, which makes it easy to drift from the actual option set (`'all' | 'unread' | 'task' | 'message' | 'project'`). | Type the filter as a union (or derive from the option list) to make filter handling exhaustive and prevent accidental typos. |

**Positive Aspects:**
- `NotificationItem` has a clear, type-driven icon mapping and reasonable relative-time formatting.
- `NotificationList` has good UX primitives: skeleton loading, empty-state messaging, badge count, and compact mode.
- The list uses IntersectionObserver rather than relying only on scroll math.

**Group Notes:**
The main hardening areas are timezone-correct grouping (D30-001) and making the filter-change contract reliably convey the UI selection (D30-002).

---

#### Group 7.6: Calendar Components
**Files Reviewed:**
- src/presentation/components/calendar/index.ts
- src/presentation/components/calendar/CalendarWidget.vue

**Score:** 6.6/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D31-001 | 🟡 MEDIUM | src/presentation/components/calendar/CalendarWidget.vue | 116-190 | **Nested interactive controls inside a `role="button"` day cell:** the day cell is focusable/clickable (`role="button"`, `tabindex`) but also contains real `<button>`s for projects/tasks. This creates conflicting semantics/focus behavior and can confuse screen readers/keyboard users. | Make the day cell non-interactive when it contains inner buttons, or restructure so “select day” is a dedicated `<button>` (e.g., day number) and inner item buttons remain separate. Avoid nesting interactive elements. If `role="button"` remains, add Space-key parity (`@keydown.space.prevent`). |
| D31-002 | 🟡 MEDIUM | src/presentation/components/calendar/CalendarWidget.vue | 146-190, 608-629 | **`maxProjectsPerDay` cap is not enforced for combined projects + tasks:** `getVisibleProjects()` and `getVisibleTasks()` each slice to `maxProjectsPerDay`, so the UI can render up to 2× the intended max while the “+X more” indicator compares against `maxProjectsPerDay`. | Compute a shared visible budget: show up to `maxProjectsPerDay` combined (e.g., `visibleProjects = projects.slice(0, max)`; `visibleTasks = tasks.slice(0, Math.max(0, max - visibleProjects.length))`). Ensure the “more” indicator matches the actual cap. |
| D31-003 | 🟡 MEDIUM | src/presentation/components/calendar/CalendarWidget.vue | 494-543, 517-525 | **Calendar day generation is O(42·(projects+tasks)) with repeated date parsing:** for each of 42 days, the code filters the full project/task arrays and constructs `new Date(...)`. This can become sluggish with larger datasets and recomputes often reactively. | Pre-bucket projects/tasks by local-day key once (e.g., computed `Map<YYYY-MM-DD, ...>`) and then fill the 42-day grid via map lookups. Cache parsed timestamps/normalized day keys in a view-model. |
| D31-004 | 🟢 LOW | src/presentation/components/calendar/CalendarWidget.vue | 118 | **Day key uses UTC `toISOString()`:** `:key="day.date.toISOString()"` can be misleading for a local calendar view and can shift around DST/timezone boundaries. | Use a local-date key (e.g., `${year}-${month}-${day}`) or `date.getTime()` (if dates are normalized to local midnight) to keep keys stable and local-semantic. |
| D31-005 | 🟢 LOW | src/presentation/components/calendar/CalendarWidget.vue | 717-726 | **Debug logging left in reactive watcher:** a deep/immediate watch logs project counts and sample data to `console.log`, which is noisy and can leak data in production builds. | Remove the watcher, or gate logs behind `import.meta.env.DEV`/a debug flag and avoid logging raw objects. |

**Positive Aspects:**
- Clear separation of full vs mini display modes with sensible templates for both.
- Good aria-label coverage for day cells and navigation buttons; icon-only controls include labels.
- Click-outside behavior is implemented with proper add/remove lifecycle hooks.

**Group Notes:**
Main priorities are interaction semantics (avoid nested button patterns) and enforcing the combined per-day cap. Performance can be improved by pre-bucketing items rather than re-filtering for each day cell.

---

### Phase 8: Presentation Layer - Views Review

#### Group 8.1: Views
**Files Reviewed:**
- src/presentation/views/BackupView.vue
- src/presentation/views/CalendarView.vue
- src/presentation/views/DashboardView.vue
- src/presentation/views/ForbiddenView.vue
- src/presentation/views/LoginView-complete.vue
- src/presentation/views/LoginView.vue
- src/presentation/views/NotFoundView.vue
- src/presentation/views/NotificationsView.vue
- src/presentation/views/ProjectDetailsView.vue
- src/presentation/views/ProjectListView.vue
- src/presentation/views/RegisterView.vue
- src/presentation/views/SettingsView.vue
- src/presentation/views/UserManagementView.vue

**Score:** 6.1/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D32-001 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | src/presentation/views/CalendarView.vue | N/A (listener updated) | **Calendar date selection handler is wired to a non-existent event:** the view listened to `@date-click`, but `CalendarWidget` emits `date-select` / `day-click`. **Resolved:** the listener is now wired to `@date-select`, so selecting a day correctly updates `selectedDate`. | Completed: updated `CalendarView` to listen to `@date-select="handleDateClick"` (matching the widget contract). |
| D32-002 | 🟡 MEDIUM | src/presentation/views/CalendarView.vue | 187-212 | **Potential N+1 / sequential fetch pattern for tasks:** `loadTasksForProjects()` loops projects and awaits `fetchTasksByProject()` for each, which can generate many sequential requests on month change. This can become slow and amplify backend load. | Add a backend endpoint to fetch tasks for a date range / project set in one call, or parallelize with `Promise.all` with a sensible concurrency limit and cache results by month/project. |
| D32-003 | 🟢 LOW | src/presentation/views/DashboardView.vue | 110-124 | **Accessibility: `role="button"` lacks Space-key activation:** the clickable deadline item handles Enter only. Keyboard users expect Space to activate a “button-like” control. | Use a semantic `<button>`/`<a>` (preferred), or add `@keydown.space.prevent` alongside Enter to keep keyboard parity. |
| D32-004 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | src/presentation/views/ProjectListView.vue | N/A (filter updated) | **Status filtering is broken due to enum/value mismatch:** the status filter used lowercase values (`active`, `finalized`) while `ProjectSummaryDto.status` uses `ProjectStatus` enum values (`'ACTIVE'`, `'FINALIZED'`, etc.), so `p.status === statusFilter.value` never matched. **Resolved:** the status select is now bound to `ProjectStatus` values and the filter state is typed accordingly. | Completed: bound status option values to `ProjectStatus.*` and typed `statusFilter` as `ProjectStatus | ''`. |
| D32-005 | 🟢 LOW | src/presentation/views/ProjectListView.vue | 307-319 | **Sorting repeatedly constructs `Date` objects:** the comparator creates `new Date(...)` repeatedly during sorting and every reactive re-run. | Precompute numeric timestamps (e.g., map to `{...p, deliveryDateMs}`) or compare using cached derived keys to reduce repeated parsing. |
| D32-006 | 🟡 MEDIUM | src/presentation/views/ProjectDetailsView.vue | 39-76, 65, 145, 190, 214 | **Tabs a11y wiring is incomplete:** panels use `aria-labelledby="overview-tab"` etc., but the corresponding tab buttons do not define matching `id` attributes. This breaks the tab/tabpanel relationship for assistive technologies. | Add `:id="`${tab.key}-tab`"` to tab buttons and set each panel’s `aria-labelledby` to match (or compute both from the same source). Consider adding basic keyboard navigation semantics for `role="tab"` if this becomes a primary UI affordance. |
| D32-007 | 🟡 MEDIUM | src/presentation/views/ProjectDetailsView.vue | 1117-1162 | **Manual token handling + `window.open` hardening:** file download/preview pulls the token from `localStorage`, calls `fetch` directly (bypassing the central HTTP client), and opens a new tab via `window.open(downloadUrl, '_blank')` without `noopener/noreferrer`, which enables reverse-tabnabbing if a malicious page is opened. | Route API calls through the existing HTTP client/repository layer (consistent retries/refresh/errors). When opening new tabs, use `window.open(url, '_blank', 'noopener,noreferrer')` and set `newWindow.opener = null` defensively (or use an `<a target="_blank" rel="noopener noreferrer">`). |
| D32-008 | 🟡 MEDIUM | src/presentation/views/SettingsView.vue | 642-690 | **Settings persistence is not user-scoped and is only local:** multiple role-specific settings are saved under global `localStorage` keys (`clientSettings`, `specialUserSettings`, `adminSettings`), which can leak preferences across users on shared devices and is easy to lose/overwrite. | Namespace keys by user ID (and role) or persist these settings server-side. If local-only is intentional, clearly surface that persistence is device-local and not account-wide. |
| D32-009 | 🟡 MEDIUM | src/presentation/views/BackupView.vue | 475-537 | **Admin backup flows are stubbed/simulated:** critical operations (backup create/schedule, Dropbox connect/sync) are simulated with `setTimeout`, `Math.random()`, and `alert(...)`. This is easy to ship accidentally and misrepresents system behavior. | Replace the stubs with real service calls (or clearly isolate demo-only UI behind a dev flag). Avoid `Math.random()` IDs; use server-issued IDs or UUIDs. |
| D32-010 | 🟢 LOW | src/presentation/views/ForbiddenView.vue / NotFoundView.vue | 49-55 / 44-50 | **Design token inconsistency:** error pages use hard-coded gradients and hex colors (e.g., `#667eea`, `#f5576c`) instead of theme tokens. This undermines theming/high-contrast support and diverges from the rest of the design system. | Replace hard-coded colors with existing CSS variables/tokens (or centralize error-page styling in shared styles). |

**Positive Aspects:**
- Views generally have clear structure, good empty/loading states, and reasonable aria-label usage for major controls.
- `UserManagementView` shows good type discipline on filters (e.g., `roleFilter: UserRole | ''`) and clean store/composable integration.
- `CalendarView` normalizes date comparisons by zeroing hours before equality checks.

**Group Notes:**
The top correctness risks are event-contract drift (`CalendarView` vs `CalendarWidget`) and enum/value mismatches in filtering (`ProjectListView`). The next priorities are improving a11y semantics in the tabbed layout and hardening file download/preview to avoid bypassing shared HTTP/security patterns.

---

### Phase 9: App Entry & Configuration Review

#### Group 9.1: App Entry
**Files Reviewed:**
- src/App.vue
- src/main.ts
- backend/src/server.ts

**Score:** 6.8/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D33-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | src/App.vue; src/infrastructure/websocket/socket.handler.ts | N/A (connect hardened) | **WebSocket connection could be initiated twice:** bootstrap + auth watcher could both call `socketHandler.connect()`, creating duplicate sockets while the first was still connecting. **Resolved:** `SocketHandler.connect()` now reuses an existing socket instance and only connects once. | Completed: `connect()` is now idempotent for an existing socket (updates auth token + calls `connect()` only when needed) rather than creating a second socket. |
| D33-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | src/App.vue | N/A (debug gated) | **Debug logging + socket debug mode were not environment-gated:** `[App]` logs and `debug: true` ran unconditionally. **Resolved:** WebSocket debug mode and informational logs are now gated behind `import.meta.env.DEV`. | Completed: `debug` and informational `console.log` statements now run only in dev builds. |
| D33-003 | 🟢 LOW | src/App.vue | 234 | **`provide()` uses a string injection key for the toast API:** `provide('toast', addToast)` is easy to collide with other providers and loses type-safety in consumers (string keys are not checked and are hard to refactor). | Use a typed `InjectionKey` (e.g., `export const TOAST_KEY: InjectionKey<(t: Omit<Toast,'id'>)=>void> = Symbol('toast')`) and `provide(TOAST_KEY, addToast)` / `inject(TOAST_KEY)`. |
| D33-004 | 🟢 LOW | src/App.vue | 192-211 | **Toast IDs and timers are fragile:** toast IDs use `Date.now()` + `Math.random()` (collision/test fragility), and auto-dismiss uses `setTimeout` without tracking/clearing timers on teardown. | Prefer `crypto.randomUUID()` for IDs (or a central ID generator). Optionally track timeout handles per toast and clear them in `onUnmounted()` to avoid late state updates in edge cases (HMR/tests). |
| D33-005 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/server.ts | N/A (shutdown hardened) | **Graceful shutdown was not hardened against repeated calls and cleanup failures:** multiple signals/errors could call `shutdown()` concurrently; cleanup errors weren’t handled, and the forced-exit timer wasn’t cleared. **Resolved:** shutdown is now idempotent, closes HTTP server with error handling, disconnects the DB with `try/catch`, and clears the forced-exit timer. | Completed: added `isShuttingDown` guard, wrapped `httpServer.close` and `disconnectDatabase()` in `try/catch`, and cleared the forced-shutdown timeout on completion. |
| D33-006 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/server.ts | N/A (metadata + logging aligned) | **Header metadata and error typing were inconsistent:** `@file` path mismatched, and `unhandledRejection` cast `reason` to `Error`. **Resolved:** `@file` now matches `backend/src/server.ts`, and unhandled rejections are logged safely via `reason instanceof Error ? reason : new Error(String(reason))`. | Completed: updated header metadata and removed unsafe `as Error` casting for unhandled rejections. |
| D33-007 | 🟢 LOW ✅ RESOLVED (2026-03-07) | src/main.ts | N/A (gated preventDefault) | **Unhandled-rejection handler always called `event.preventDefault()`:** this suppressed default browser reporting even in development. **Resolved:** `preventDefault()` is now only called in production builds, preserving dev diagnostics. | Completed: gated `event.preventDefault()` behind `import.meta.env.PROD` and normalized the logged rejection reason to an `Error`. |

**Positive Aspects:**
- `src/main.ts` is well-structured with clear bootstrapping phases (Pinia, Router, HTTP client) and development-only logging.
- `src/App.vue` cleans up the resize listener and centralizes initialization concerns in a single `initializeApp()` flow.
- `backend/src/server.ts` includes a reasonable graceful shutdown path and uses a shared logger rather than ad-hoc `console.*`.

**Group Notes:**
The main correctness/perf risk is duplicated WebSocket connection initiation. The next priority is ensuring debug logging and “debug mode” are not enabled in production by default.

---

#### Group 9.2: Index/Barrel Exports
**Files Reviewed:**
- src/application/dto/index.ts
- src/application/index.ts
- src/application/interfaces/index.ts
- src/application/services/index.ts
- src/domain/entities/index.ts
- src/domain/enumerations/index.ts
- src/domain/index.ts
- src/domain/repositories/index.ts
- src/domain/value-objects/index.ts
- src/infrastructure/external-services/index.ts
- src/infrastructure/http/index.ts
- src/infrastructure/index.ts
- src/infrastructure/repositories/index.ts
- src/infrastructure/websocket/index.ts
- src/presentation/composables/index.ts
- src/presentation/components/calendar/index.ts
- src/presentation/components/common/index.ts
- src/presentation/components/file/index.ts
- src/presentation/components/message/index.ts
- src/presentation/components/notification/index.ts
- src/presentation/index.ts
- src/presentation/stores/index.ts
- src/shared/index.ts

- backend/src/domain/index.ts
- backend/src/domain/repositories/index.ts
- backend/src/domain/value-objects/index.ts
- backend/src/application/index.ts
- backend/src/application/services/index.ts
- backend/src/infrastructure/auth/index.ts
- backend/src/infrastructure/database/index.ts
- backend/src/infrastructure/external-services/index.ts
- backend/src/infrastructure/index.ts
- backend/src/infrastructure/repositories/index.ts
- backend/src/infrastructure/scheduler/index.ts
- backend/src/infrastructure/websocket/index.ts
- backend/src/presentation/controllers/index.ts
- backend/src/presentation/index.ts
- backend/src/presentation/middlewares/index.ts
- backend/src/presentation/routes/index.ts
- backend/src/shared/index.ts

**Score:** 6.4/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D34-002 | 🟡 MEDIUM | src/presentation/stores/index.ts | 73-132 | **“Index” module contains non-barrel, weakly-typed WebSocket wiring:** `setupStoreWebSocketListeners(socketHandler?: any)` uses `any`, optional-chaining `.on?.(...)`, and stringly-typed event names. This is easy to drift from the actual WebSocket API (which elsewhere exposes typed `onNotification`, `onMessage`, etc.) and can ship as dead or incorrect integration code. | Either remove this helper until a real connection-manager abstraction exists, or type it against the actual WebSocket handler interface and use the typed subscription methods (avoid `.on` + string event names). Gate logs behind `import.meta.env.DEV` if kept. |
| D34-003 | 🟢 LOW | src/{application,domain,presentation,infrastructure}/**/index.ts | Multiple | **File header template is inconsistent across barrel exports:** several frontend barrel files start with an `@module` doc block rather than the standard University/TFG header used across most of the codebase, reducing documentation consistency and making automated auditing harder. | Standardize index/barrel files to the same header template (including correct `@file` paths) or formally document that barrel exports may use a smaller header and enforce it consistently. |
| D34-004 | 🟢 LOW | backend/src/**/index.ts | Multiple | **Backend barrel file header metadata often uses wrong `@file` paths:** multiple backend index modules declare `@file src/...` even though the real path is `backend/src/...`, continuing the existing header-path mismatch pattern. | Align `@file` to the real repo-relative path (e.g., `backend/src/shared/index.ts`) for consistency and easier navigation/auditing. |

**Positive Aspects:**
- Barrel exports are generally well-organized by layer and feature area (Application/Domain/Infrastructure/Presentation), improving discoverability.
- Frontend component indexes export both SFC components and their props/emits types, which helps keep consumer code type-safe.
- Backend indexes consistently use explicit `.js` extensions, which is compatible with Node ESM + TS `NodeNext`-style setups.

**Group Notes:**
The findings are primarily about keeping barrel exports purely declarative and keeping header metadata consistent.

---

#### Group 9.3: Public Assets
**Files Reviewed:**
- public/.gitkeep
- public/robots.txt

**Score:** 7.2/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D35-001 | 🟡 MEDIUM | public/.gitkeep | 1-10 | **Public assets appear incomplete for a PWA-capable build:** the placeholder notes list required icon files (`pwa-192x192.png`, `pwa-512x512.png`, `favicon.ico`, `apple-touch-icon.png`), but the `public/` directory currently contains only `.gitkeep` and `robots.txt`. This likely results in broken favicon/icon requests and a weaker PWA install experience. | Add the referenced icon assets to `public/` (or update the PWA/icon strategy so these files aren’t expected). Keep the “required files” list accurate so CI/reviewers can validate it.
| D35-002 | 🟢 LOW | public/robots.txt | 1-2 | **Robots policy is permissive by default:** `Allow: /` is fine for a marketing site, but for an authenticated SPA it can lead to indexing of non-public routes (login/settings/dashboard) unless intentionally desired. | Decide intended indexing policy. If this app should not be indexed, use a restrictive policy (especially for staging), or disallow sensitive routes. Don’t rely on `robots.txt` for security.
| D35-003 | 🟢 LOW | public/.gitkeep | 1-10 | **`.gitkeep` is likely publicly served:** Vite copies `public/` into the build output; keeping a `.gitkeep` with internal notes can expose unnecessary information and creates an avoidable publicly reachable file. | Move these notes to project documentation (e.g., README or docs) and keep `public/` for actual shipped assets only.

**Positive Aspects:**
- `robots.txt` exists (better than missing) and won’t block the app from being indexed when intentional.
- The `.gitkeep` notes clearly document how to generate PWA assets, which helps onboarding.

**Group Notes:**
Main action item is aligning the “required assets” expectations with what is actually shipped in `public/`.

---

### Phase 10: Cross-Cutting Concerns Review

#### Group 10.1: Type Definitions
**Files Reviewed:**
- src/vite-env.d.ts
- backend/src/shared/types.ts

**Score:** 6.3/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D36-001 | 🟡 MEDIUM | src/vite-env.d.ts / src/main.ts / src/shared/constants.ts / src/infrastructure/websocket/socket.handler.ts | vite-env.d.ts:20-21; main.ts:111; constants.ts:39; socket.handler.ts:28 | **Env var type declarations drift from actual usage (and naming is inconsistent):** `ImportMetaEnv` declares `VITE_WS_BASE_URL`, but code uses `VITE_SOCKET_URL`. Additionally, `VITE_APP_VERSION` is used but not declared in `ImportMetaEnv`. This undermines type-safety and increases the chance of silently-misconfigured builds. | Standardize on a single name (`VITE_SOCKET_URL` vs `VITE_WS_BASE_URL`) and declare all used env vars in `ImportMetaEnv` (including `VITE_APP_VERSION`). Consider centralizing env var names in a single module and reusing those constants in config + runtime code to prevent drift.
| D36-002 | 🟡 MEDIUM | backend/src/shared/types.ts | 39-44 | **Pagination query typing doesn’t match Express reality:** `PaginationQuery.page` / `limit` are typed as `number`, but `req.query` values arrive as strings (or arrays) unless explicitly parsed/validated. This can mislead controllers/services and contributes to `NaN` propagation bugs. | Type query inputs as `string | undefined` (or `unknown`) at the HTTP boundary and convert via a single parser/validator (e.g., `parsePagination`) that returns a fully validated numeric shape.
| D36-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/shared/types.ts | N/A (UserRole typing) | **Roles are no longer stringly typed:** shared auth request/JWT shapes now use Prisma `UserRole`, reducing authorization drift risk. | Completed: updated shared backend role fields to `UserRole`.
| D36-004 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/shared/types.ts | N/A (header already aligned) | **Header metadata aligned:** the shared backend types header now correctly uses `@file backend/src/shared/types.ts`. | Completed: header `@file` matches the real repo-relative path.
| D36-005 | 🟢 LOW | src/vite-env.d.ts | 4-6 | **Type definition file header is non-standard vs project convention:** this file uses an `@module` doc block rather than the standard University/TFG header used across most TypeScript sources, reducing consistency. | Standardize the header template for `.d.ts` files (either adopt the standard header or formally document a consistent exception for ambient declaration files).

**Positive Aspects:**
- `vite-env.d.ts` explicitly types `.vue` imports and documents the intent of Vite env typing.
- Backend shared types are centralized and generally well-named, making controller/service contracts easier to read.

**Group Notes:**
The highest value fix is aligning env-var typings/names with actual usage (D36-001) and making request-query typing reflect real Express inputs (D36-002).

---

#### Group 10.2: Configuration Files
**Files Reviewed:**
- .env.development
- .env.example
- .env.production
- .gitignore
- eslint.config.mjs
- index.html
- jest.config.js
- jest.setup.js
- package-lock.json
- package.json
- playwright.config.ts
- tsconfig.json
- tsconfig.node.json
- typedoc.json
- vite.config.ts
- backend/.env
- backend/.env.example
- backend/.env.railway
- backend/.gitignore
- backend/nixpacks.toml
- backend/package-lock.json
- backend/package.json
- backend/railway.json
- backend/tsconfig.json

**Score:** 4.9/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D37-001 | 🔴 CRITICAL 🟡 PARTIALLY RESOLVED (2026-03-06) | backend/.env (history) + backend/.env.railway | 45, 47, 49-50 | **Committed secret material in repo:** the review flagged Dropbox credentials in `backend/.env`. In current remediation, `backend/.env.railway` was removed from git tracking and replaced with a sanitized `backend/.env.railway.example` template, and ignore rules were strengthened. **Remaining risk:** credential rotation/revocation and history purge are still required to fully remediate any previously-committed secrets. | Immediately rotate/revoke the exposed tokens/keys and treat them as compromised. Purge secret material from git history (e.g., `git filter-repo` / BFG) if this repo was ever pushed remotely. Keep only templates (`.env.example`, `.env.railway.example`) in git and store real secrets in Railway/environment secret managers. |
| D37-002 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/railway.json / backend/nixpacks.toml | N/A (start commands updated) | **Production deploy seeds on every start:** Railway/Nixpacks startup commands ran `prisma:seed:production` on each process start. **Resolved:** deploy start commands now run migrations + start the server only; production seeding is no longer executed on every restart. | Completed: removed `npm run prisma:seed:production` from Railway and Nixpacks start commands; keep seeding as an explicit/manual operation when needed. |
| D37-003 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | jest.config.js / jest.setup.cjs / package.json / eslint.config.mjs | N/A (Jest harness fixed) | **Frontend Jest configuration likely broken in ESM + Vue 3 setup:** setup file used CommonJS `require(...)` under an ESM package, config used a non-standard `setupFilesAfterSetup`, and the Vue transformer dependency was missing. **Resolved:** Jest now runs successfully under the ESM project setup. | Completed: switched setup/mocks to `.cjs`, updated config to `setupFilesAfterEnv`, enabled `ts-jest` ESM preset, and added the missing Vue transformer dependencies (`@vue/vue3-jest`, `babel-jest`, `@babel/core`). Follow-up: ESLint flat config now treats Jest `.cjs` setup/mocks as CommonJS (Node/CommonJS globals), keeping `npm run lint` at 0 errors. |
| D37-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-06) | .env.example | N/A (template updated) | **Frontend env template encouraged client-side third-party access tokens:** `.env.example` included `VITE_DROPBOX_ACCESS_TOKEN`, reinforcing a pattern of putting long-lived third-party credentials in browser config. **Resolved:** the variable and guidance were removed from the frontend template. | Completed: remove the client-side token variable from `.env.example` and keep Dropbox credentials backend-only. |
| D37-005 | 🟢 LOW | playwright.config.ts | 29 | **E2E baseURL is hard-coded:** `baseURL: 'http://localhost:5173'` can create brittle CI/dev workflows if the port changes or if Playwright is pointed at a preview/staging environment. | Allow overriding via env var (e.g., `PLAYWRIGHT_BASE_URL`) and/or configure Playwright `webServer` to start Vite and reuse the port consistently in CI. |

**Positive Aspects:**
- `.env.example` / `backend/.env.example` and `backend/.env.railway` templates exist, which is good for onboarding and avoiding guesswork.
- Both lockfiles appear free of registry auth tokens (`_authToken`), reducing accidental supply-chain credential exposure risk.
- Backend and frontend `tsconfig` files are strict and broadly consistent with ESM + bundler usage.

**Group Notes:**
The immediate priority is incident response for the committed Dropbox credentials (D37-001). Next priorities are removing seed-on-start from production boot (D37-002) and fixing the Jest harness so tests can run reliably (D37-003).

---

#### Group 10.3: Database Schema & Migrations (Prisma)
**Files Reviewed:**
- backend/prisma/schema.prisma
- backend/prisma/seed.ts
- backend/prisma/seed-production.ts
- backend/prisma/migrations/migration_lock.toml
- backend/prisma/migrations/20260224161201_/migration.sql
- backend/prisma/migrations/20260301133940_add_read_by_user_ids/migration.sql
- backend/prisma/migrations/20260302172347_add_audit_log_system/migration.sql
- backend/prisma/migrations/20260304113557_add_message_file_ids/migration.sql

**Score:** 6.0/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D38-002 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/prisma/seed-production.ts | N/A (seed hardened) | **Production seeding uses a predictable default admin password and prints it:** the seed used a fixed password (`admin123`) and printed it to stdout. **Resolved:** seeding now requires `SEED_ADMIN_PASSWORD` (and optionally `SEED_ADMIN_EMAIL`) and does not log the password. | Completed: removed default password, require env-provided password, and avoid logging credentials in seed output. |
| D38-003 | 🟡 MEDIUM | backend/prisma/seed.ts | 26-35 | **Destructive seed without environment guard:** the dev seed clears all tables via `deleteMany()` calls. If this script is accidentally executed against a non-dev database, it can cause full data loss. | Add a hard guard (e.g., require `NODE_ENV === 'development'` and/or explicit `SEED_CONFIRM=I_UNDERSTAND`) and validate `DATABASE_URL` host/DB name before deleting. Keep production seeding in a separate script (already present) and ensure deploy pipelines never call the dev seed. |
| D38-004 | 🟡 MEDIUM | backend/prisma/schema.prisma / backend/prisma/migrations/* | schema.prisma:289-290; add_read_by_user_ids:2; add_message_file_ids:2 | **Denormalized array fields for references:** `Message.readByUserIds` and `Message.fileIds` are `String[]` stored inline. This makes referential integrity impossible (no FK to `users`/`files`), allows duplicates, and can become inefficient for large rooms/messages or “read receipts” queries. | Prefer join tables (`MessageReadReceipt`, `MessageFile`) with proper unique constraints and indexes. If keeping arrays for simplicity, enforce de-duplication in application code and consider GIN indexes / query patterns to avoid full scans. |
| D38-005 | 🟢 LOW | backend/prisma/schema.prisma | 365, 380-399 | **Audit/permission attribution fields are not relationally enforced:** `Permission.grantedBy` and `AuditLog.userId` are plain strings (or nullable), without relations to `User`. This can allow orphaned/invalid IDs and makes cleanup or user attribution harder to guarantee. | Either add optional relations with `onDelete: SetNull` (to preserve logs) or explicitly document why these fields are intentionally non-relational and ensure consistent population in the application layer. |

**Positive Aspects:**
- Schema uses enums and consistent indexing, making core query patterns clearer and less error-prone.
- Migration history is present and readable; `migration_lock.toml` is correctly committed.
- Production seed is separated from dev seed and includes an “only if empty” guard.

**Group Notes:**
The primary risks here are operational drift (seed vs schema) and production security posture (default admin credential). Addressing those will make local setup and deploys significantly safer and more repeatable.

---

#### Group 10.4: Operational Scripts & Manual Test Utilities
**Files Reviewed:**
- initialization.sh
- backend/restart-backend.sh
- backend/setup.sh
- backend/update-dropbox-token.sh
- backend/scripts/check-messages.ts
- backend/scripts/get-dropbox-refresh-token.ts
- backend/scripts/mark-sender-messages-read.ts
- backend/scripts/DROPBOX_OAUTH_SETUP.md
- backend/test-dropbox-simple.ts
- backend/test-dropbox-token.ts
- backend/test-large-upload.ts
- backend/DROPBOX-TOKEN-UPDATE.txt
- backend/test-dropbox.sh
- backend/test-upload-endpoint.sh

**Score:** 5.6/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D39-001 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/scripts/get-dropbox-refresh-token.ts | N/A (script output hardened) | **Sensitive tokens are printed to stdout (and optionally echoed for manual copy):** the script printed full access + refresh tokens and could echo exact `.env` lines. **Resolved:** tokens are now masked by default; full token printing requires an explicit `--print-full` flag. | Completed: mask token output by default and require `--print-full` for full stdout printing. Auto-update path continues to write directly to `.env`. |
| D39-002 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/DROPBOX-TOKEN-UPDATE.txt | N/A (placeholder applied) | **Secret material footprint in repo notes:** the instructions included a real-looking Dropbox token prefix (`sl.u....`). **Resolved:** replaced the token-like string with a placeholder example. | Completed: removed token-like prefix and replaced with placeholder text (`sl.<your-token-here>`). |
| D39-003 | 🟡 MEDIUM | backend/restart-backend.sh / backend/update-dropbox-token.sh | restart-backend.sh:6, 8-9; update-dropbox-token.sh:64 | **Unsafe process management + non-portable paths:** scripts use `pkill -9 node`, which can kill unrelated Node processes, and one script hard-codes an absolute local path. This is hazardous on dev machines and brittle in other environments. | Track and stop a specific PID (store it in a pidfile), or use a process manager (npm script, `lsof -ti :3000 | xargs kill`, etc.). Replace hard-coded paths with relative paths (e.g., `cd "$(dirname "$0")"`) and avoid `-9` unless absolutely required. |
| D39-004 | 🟡 MEDIUM | backend/setup.sh | 47-49, 69 | **Setup script can be destructive and lacks safety guards:** it runs `prisma db pull --force` (can overwrite local schema) or `prisma db push` (can apply schema changes without migrations). Without environment/DB safeguards, this is risky if pointed at the wrong `DATABASE_URL`. | Add explicit environment checks (require `NODE_ENV=development`, confirm DB name/host), and avoid `db push` in favor of migrations. Remove `--force` unless you clearly document the intent and restrict to disposable dev DBs. |
| D39-005 | 🟡 MEDIUM | backend/test-dropbox.sh | 28, 30 | **Manual test script is likely broken (credential + parsing drift):** login uses `admin@cartography.com` (typo vs seed), and token extraction uses a brittle grep for `"token"` which may not match the API’s actual response shape. | Use the correct seeded credentials and parse JSON robustly (prefer `jq` with a checked dependency). Align with the backend’s actual login response contract (`data.accessToken` vs other fields) and fail with actionable errors when parsing fails. |
| D39-006 | 🟢 LOW | backend/test-upload-endpoint.sh | 13, 29-30, 121 | **Test script has unvalidated tool dependencies and brittle success detection:** it assumes `jq` exists and uses `curl -v` output with a broad `grep` check for `200|201`, which can false-positive. | Add a `command -v jq` prerequisite check and use `curl -sS -w '%{http_code}'` to reliably capture status codes. Keep parsing consistent with API response envelopes. |
| D39-007 | 🟢 LOW | backend/test-large-upload.ts / backend/scripts/check-messages.ts | test-large-upload.ts:5; check-messages.ts:1 | **Script hygiene inconsistencies:** `test-large-upload.ts` imports a TS module without an ESM `.js` extension (unlike other backend scripts), and `check-messages.ts` lacks the project’s standard file header/JSDoc conventions. | Standardize script module resolution conventions (or document exceptions when using `tsx`) and apply the standard header template for consistency/auditing across operational utilities. |

**Positive Aspects:**
- Operational utilities are separated from main runtime code (`backend/scripts/`, `backend/test-*`), reducing accidental coupling.
- Several scripts include guardrails and guided output (e.g., backend setup prompts, token validation checks).
- The OAuth refresh-token flow documentation is detailed and includes explicit security notes.

**Group Notes:**
Most issues are “ops safety” rather than app logic: avoid printing/embedding tokens, avoid killing generic `node` processes, and add clear environment safeguards to any script that can mutate data or configuration.

---

#### Group 10.5: Documentation & Project Notes
**Files Reviewed:**
- README.md
- backend/README.md
- backend/RAILWAY.md
- backend/SETUP.md
- docs/development/ARCHITECTURE.md
- docs/development/BACKEND-IMPLEMENTATION.md
- docs/development/DROPBOX-INTEGRATION.md
- docs/deployment/DROPBOX-DEPLOYMENT.md
- docs/deployment/RAILWAY-DEPLOYMENT.md
- docs/development/IMPLEMENTATION-SUMMARY.md
- docs/specification.md
- docs/tasks/TASK-PERMISSION-CHANGES.md
- docs/testing/DEBUGGING-AUTH-ERRORS.md
- docs/testing/TESTING-FILE-UPLOAD-UI.md
- docs/tasks/TODO-STATUS.md
- docs/development/INTEGRATION.md
- e2e/README.md

**Score:** 4.9/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D40-001 | 🟡 MEDIUM | README.md / backend/README.md / docs/development/INTEGRATION.md / docs/tasks/TODO-STATUS.md | README.md:46, 175-180; backend/README.md:6-11; INTEGRATION.md:246-250; TODO-STATUS.md:17 | **Broken documentation links and path drift:** multiple docs link to `docs/*` files that no longer exist at those paths (docs now live under `docs/development/`, `docs/deployment/`, `docs/tasks/`, `docs/testing/`). This makes the docs harder to navigate and increases the chance of following stale guidance. | Update all relative links to match the current docs layout (or restore the expected `docs/*.md` paths via moving/duplicating files). Consider adding a simple markdown link checker in CI. |
| D40-002 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/README.md / docs/development/INTEGRATION.md | N/A (docs aligned) | **Authentication storage guidance conflicts (security posture drift):** backend README claimed “Tokens are httpOnly cookies” while the integration guide documents token persistence in `localStorage` and Bearer-token headers. **Resolved:** docs now consistently describe the implemented Bearer-token flow (tokens returned in JSON; clients send `Authorization: Bearer <token>`). | Completed: updated backend README and integration guide to match the current auth model. |
| D40-003 | 🟡 MEDIUM | docs/development/INTEGRATION.md / docs/development/BACKEND-IMPLEMENTATION.md / docs/tasks/TODO-STATUS.md | INTEGRATION.md:8-23; BACKEND-IMPLEMENTATION.md:227-234; TODO-STATUS.md:56-66 | **Conflicting “integration status” claims:** `INTEGRATION.md` states integration is completed and stores use real API calls, while other docs still describe frontend auth/stores as mock and “awaiting API implementation”. | Choose a single source of truth (e.g., `INTEGRATION.md`) and update/retire the stale claims. Add a prominent “Last updated” date + version/commit reference to each doc to prevent long-term drift. |
| D40-004 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | docs/testing/TESTING-FILE-UPLOAD-UI.md / docs/development/DROPBOX-INTEGRATION.md | N/A (docs updated) | **Docs included token-like secret material and encouraged client-side secrets:** one doc showed a token-like prefix and another suggested using `VITE_DROPBOX_ACCESS_TOKEN` in frontend env. **Resolved:** token-like strings were replaced with placeholders and frontend-token guidance was removed. | Completed: docs now use placeholders and explicitly state Dropbox credentials are backend-only. |
| D40-005 | 🟡 MEDIUM | docs/testing/DEBUGGING-AUTH-ERRORS.md | 135-148 | **Health check endpoint mismatch:** debugging guide uses `curl http://localhost:3000/health`, but the backend exposes health under the API prefix (`/api/v1/health`). | Update debugging instructions to call the real endpoint and keep it consistent across docs (`/api/v1/health`). |
| D40-006 | 🟡 MEDIUM | backend/SETUP.md / docs/testing/TESTING-FILE-UPLOAD-UI.md | backend/SETUP.md:105-107; TESTING-FILE-UPLOAD-UI.md:188-190 | **File upload endpoint mismatch:** backend setup guide documents `POST /api/v1/files` for upload, while other docs reference `POST /api/v1/files/upload`. Endpoint drift makes setup/testing error-prone. | Confirm the real API route and align docs accordingly (prefer consistent `POST /api/v1/files/upload` if that’s the implemented route). |
| D40-008 | 🟡 MEDIUM | docs/deployment/RAILWAY-DEPLOYMENT.md / docs/development/IMPLEMENTATION-SUMMARY.md | RAILWAY-DEPLOYMENT.md:104-118; IMPLEMENTATION-SUMMARY.md:205-212 | **Deployment/infra guidance is internally inconsistent:** Railway guide says Dropbox is mandatory and provides a start command that does not mention production seeding, while other docs describe Dropbox as optional and prior config review found “seed on every start” behavior (D37-002). | Reconcile “mandatory vs optional” Dropbox posture and ensure Railway docs match the actual `railway.json`/`nixpacks.toml` start pipeline. Ideally: avoid seeding on every start; document seed as a one-time deploy step. |

**Positive Aspects:**
- There is a lot of documentation coverage: local setup, integration, deployment, and troubleshooting.
- Multiple docs explicitly warn against committing secrets and encourage env-vars/secret managers.
- The specification is detailed and helps validate requirements/acceptance criteria.

**Group Notes:**
The main theme is drift: multiple docs appear to have been generated at different times and now conflict on security posture (cookies vs localStorage) and endpoint paths. Cleaning this up is a high-leverage way to reduce onboarding and ops mistakes.

---

#### Group 10.6: Operational Artifacts (Logs/Backups/Misc)
**Files Reviewed:**
- backend/backups/.gitignore
- backend/logs/app.log
- backend/logs/error.log
- backend/tgres psql -h localhost -U postgres -d cartographic_manager -t -A -F, -c SELECT "contractDate", "coordinateX", "coordinateY" FROM projects LIMIT 1;

**Score:** 3.8/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D41-001 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/logs/app.log / backend/logs/error.log | N/A (files removed) | **Runtime logs are committed to the repository and include sensitive operational data.** **Resolved:** removed committed runtime log files from the repo (they were already covered by `backend/.gitignore` rules for `logs/` and `*.log`). | Completed: deleted committed log files under `backend/logs/`.
| D41-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/tgres psql -h localhost -U postgres -d cartographic_manager -t -A -F, -c SELECT "contractDate", "coordinateX", "coordinateY" FROM projects LIMIT 1; | N/A (artifact removed) | **Stray ad-hoc database query output committed as a file (with a command-line name).** **Resolved:** deleted the artifact from the repository to prevent leaking operational data. | Completed: removed the committed ad-hoc DB output artifact.

**Positive Aspects:**
- Backups directory includes an internal `.gitignore` that prevents accidental commit of common dump formats.
- Logs are structured JSON, which is generally good for ingestion and parsing (when stored safely outside git).

**Group Notes:**
Operational artifacts (logs, ad-hoc DB outputs) should not live in version control. This group indicates a repo hygiene gap: add ignore rules, purge sensitive history, and prefer reproducible scripts/docs over committed outputs.

---

## INCIDENT TODO LIST

### Critical Issues (Must Fix)
- [x] **D7-001** - Application service implementations/call sites drift from interfaces; unify contracts to restore compilability
- [x] **D9-001** - WebSocket server allows joining any project room without authorization
- [x] **D14-001** - Backend JWT secrets have hard-coded defaults; require env + fail fast
- [ ] **D37-001** - Backend `.env` contains real Dropbox credentials (🟡 partially mitigated: `.env.railway` untracked + `.env.railway.example` added; still needs rotate + purge from git history)

### High Issues (Should Fix)
- [ ] **D1-001** - Domain enums contain UI mappings; move to Presentation/Shared
- [ ] **D3-001** - Domain entities implement API-facing `toJSON()`; move mapping out of Domain
- [ ] **D4-001** - Backend “Domain” repository interfaces depend on Prisma types (`@prisma/client`)
- [x] **D4-002** - Frontend repository interfaces import enums from wrong modules
- [ ] **D5-001** - DTOs use `Date` types across (likely) JSON boundaries; define transport-safe date types + mappers
- [x] **D7-002** - Authorization service role mismatch + admin delete bug (commented-out check)
- [x] **D7-003** - Backend backup uses `exec` with interpolated secrets/params (command injection + leakage risk)
- [x] **D7-004** - Frontend authentication service mixes mock auth + missing import/type escapes
- [x] **D8-001** - HTTP client retry path can crash when `error.config` is missing
- [x] **D8-002** - HTTP client refresh failure can leave requests hanging
- [x] **D10-002** - Frontend Dropbox service uses access token client-side (secret exposure risk)
- [x] **D11-001** - Frontend repositories mis-detect Axios 404 and throw instead of returning null
- [x] **D13-001** - Deadline reminder scheduler creates a separate PrismaClient and never disconnects
- [x] **D15-001** - Frontend `generateId()` uses `Math.random()`; use crypto-safe UUIDs
- [ ] **D18-001** - Auth store persists access/refresh tokens in `localStorage` (XSS exfiltration risk)
- [x] **D22-001** - Notification listing endpoint lacks ownership/admin enforcement
- [x] **D22-002** - Message creation trusts raw request body (spoofing/access risk)

- [x] **D32-001** - CalendarView listens to `date-click` (CalendarWidget emits `date-select`/`day-click`)
- [x] **D32-004** - ProjectListView status filter values don’t match `ProjectStatus` enum (filter broken)

- [x] **D37-002** - Railway/Nixpacks start commands run production seed on every start
- [x] **D37-003** - Jest config is inconsistent with ESM + Vue 3 and likely won’t run
- [x] **D38-002** - Production seed uses predictable default admin password and logs it

- [x] **D39-001** - Dropbox refresh-token script prints full tokens to stdout
- [x] **D39-002** - Dropbox token update notes include token-like prefix (remove/rotate)

- [x] **D40-002** - Docs conflict on auth token storage model (cookies vs localStorage/Bearer)
- [x] **D40-004** - Docs include token-like strings and encourage client-side Dropbox tokens

- [x] **D41-001** - Runtime logs are committed (sensitive operational data leakage risk)

### Medium Issues (Recommended Fix)
- [ ] **D1-002** - TaskPriority includes `URGENT` not in requirements
- [ ] **D1-003** - TaskStatus naming/transitions may diverge from FR11/FR12
- [ ] **D1-004** - ProjectStatus lifecycle may diverge from requirements
- [ ] **D2-001** - Coordinate representation inconsistent across layers
- [x] **D2-002** - Backend GeoCoordinates equality too strict
- [ ] **D3-003** - Domain entity factories generate IDs with `Date.now()`/`Math.random()`
- [ ] **D3-004** - Dropbox coupling + optional/required type mismatch (`dropboxFolderId`/`dropboxPath`)
- [ ] **D3-005** - `updatedAt` not consistently updated in User setters
- [ ] **D3-006** - `User.authenticate()` throws and is unsafe placeholder behavior
- [ ] **D3-008** - Message `senderRole` is `string` (should align with `UserRole`)
- [ ] **D3-009** - Permission `sectionAccess` accepts arbitrary strings (should be typed/validated)
- [ ] **D4-003** - Repository interfaces are “fat” and leak query patterns
- [ ] **D4-004** - TaskHistory action filtering uses untyped `string`
- [ ] **D5-002** - DTOs include UI/view-model fields (`statusColor`, `isOverdue`, `can*`) without clear boundary
- [ ] **D5-003** - Vendor coupling in DTO contracts (Dropbox naming)
- [ ] **D5-004** - Weakly typed DTO fields (`statusColor: string`, `action: string`) encourage drift
- [ ] **D6-001** - Service interface error contracts rely on `@throws` without typed/shared error model
- [ ] **D6-002** - Application service interfaces couple directly to Dropbox concepts
- [ ] **D6-003** - Authorization service interface is fat and returns `Set<AccessRight>`
- [ ] **D7-005** - Project service coordinate truthiness checks + empty-string Dropbox folder IDs
- [ ] **D7-006** - File service uses string section default + builds Dropbox paths from unsanitized inputs
- [ ] **D7-007** - Deadline reminders use string notification types and lack idempotency
- [ ] **D7-008** - Backend export coordinate truthiness checks skip valid `0` coordinates
- [ ] **D8-003** - HTTP client `cancelAllRequests()` abort logic is not wired/initialized
- [ ] **D8-004** - HTTP client response typing relies on unsafe casts; upload response generics inconsistent
- [x] **D9-002** - WebSocket client reconnect uses stale token; not token-rotation aware
- [x] **D9-004** - WebSocket client `ConnectionOptions.token` type doesn’t match implementation fallback
- [ ] **D10-003** - Frontend Dropbox metadata mapping can yield invalid dates for folders
- [x] **D10-004** - Backend Dropbox service swallows broad errors (createFolder/pathExists)
- [ ] **D11-002** - Frontend repositories interpolate unencoded query strings (fragile for ISO dates)
- [ ] **D11-003** - Backend TaskRepository returns `any` and leaks augmented shapes
- [ ] **D12-001** - Frontend TokenStorage stores JWTs in localStorage (XSS exfiltration risk)
- [x] **D13-002** - Backup scheduler can start with empty `DATABASE_URL` config
- [x] **D13-003** - Auth middleware role authorization is stringly-typed
- [ ] **D14-002** - Frontend/backend upload constraints diverge (size + MIME/type lists)
- [x] **D14-003** - Backend config defaults fail open (empty DB URL, debug logging)
- [x] **D15-002** - Backend `parsePagination()` can propagate `NaN` for invalid query params
- [x] **D15-003** - Backend auth roles are stringly-typed in shared request/JWT types
- [ ] **D15-004** - Frontend `deepClone()` is unsafe beyond plain objects
- [ ] **D16-001** - CSS imports Google Fonts via `@import` (privacy/CSP + render-blocking)
- [ ] **D17-001** - Post-login redirect is not validated before `router.push(redirect)`
- [ ] **D17-002** - Router project-access guard uses brittle DTO assumptions + client-side auth logic
- [ ] **D18-002** - Auth session expiry is estimated/recomputed on reload (doesn’t use JWT `exp`/server truth)
- [ ] **D18-003** - Project store permissions rely on `any` + hidden `creatorId` field (DTO drift risk)
- [ ] **D18-004** - Project store summary mapping creates N+1 backend request pattern
- [ ] **D18-005** - Message store pagination/read-state are inconsistent with backend operations
- [ ] **D18-006** - Notification store localStorage persistence isn’t user-scoped and doesn’t hydrate on init
- [ ] **D19-001** - useAuth pushes unvalidated `redirect` query and duplicates redirect mechanisms
- [ ] **D19-002** - File upload composable relies on `any` + inconsistent response envelope extraction
- [x] **D20-001** - Backend CORS config must be strict allowlist when credentials are enabled
- [x] **D20-002** - Backend morgan `dev` logging is not environment-gated
- [x] **D20-003** - Backend app bootstrap lacks visible rate limiting/brute-force protections
- [ ] **D21-001** - Backend routes don’t express authorization policy consistently (auth-only)
- [x] **D21-002** - Backend routes mutate `req.params`/`req.query` to reuse controllers
- [x] **D21-003** - Audit log router instantiates `PrismaClient` in the module
- [x] **D22-003** - Controllers instantiate `PrismaClient` at module scope
- [x] **D22-004** - Controllers throw `NotFoundError` for auth/authz failures (wrong status)
- [x] **D22-005** - Controllers contain verbose `console.*` logs with request bodies/stacks
- [x] **D22-006** - File upload path uses unsanitized section/filename in Dropbox path
- [x] **D23-001** - Upload middleware validates by extension only and throws generic errors
- [x] **D23-002** - Error handler may leak `AppError` message/details to clients
- [x] **D24-001** - AppModal scroll lock/unlock mutates global body styles (immediate unlock + stacked modal risk)
- [x] **D24-002** - AppInput number parsing emits `0` for empty and can emit `NaN`
- [x] **D24-003** - AppSelect placeholder/clear logic breaks for `0` and emits strings for numeric options
- [x] **D24-004** - ConfirmDialog does not emit `cancel` on overlay/escape/X close
- [x] **D24-009** - AppHeader uses hard-coded notification count + unused imports
- [ ] **D25-001** - Layout sidebar navigation is not permission-aware (admin-only links shown to all)
- [ ] **D25-002** - Layout header user dropdown lacks click-outside/Escape dismissal behavior
- [ ] **D26-001** - ProjectSummary clickable tiles are not keyboard-accessible
- [ ] **D26-002** - ProjectForm date-only inputs can shift by timezone (UTC formatting)
- [ ] **D26-003** - ProjectCard mixes event emission with internal navigation
- [ ] **D27-001** - TaskList priority sort label/order mismatch
- [ ] **D27-002** - TaskForm date-only dueDate can shift by timezone (UTC formatting)
- [ ] **D27-003** - TaskForm compares TaskStatus via string literals

- [ ] **D28-001** - MessageList groups dates via UTC `toISOString()` (Today/Yesterday mislabels)
- [ ] **D28-002** - MessageBubble senderInitials can throw on whitespace-heavy names
- [ ] **D28-003** - MessageInput Enter-to-send lacks IME composition guard

- [ ] **D29-001** - FileList “All Files” tab doesn’t emit section-change (state desync risk)
- [ ] **D29-002** - FileUploader drop zone is not keyboard-accessible (clickable div)

- [ ] **D30-001** - NotificationList groups dates via UTC `toISOString()` (Today/Yesterday mislabels)
- [ ] **D30-002** - NotificationList filter-change payload doesn’t match UI selection
- [ ] **D30-003** - NotificationList can emit duplicate load-more events (observer + scroll)

- [ ] **D31-001** - CalendarWidget day cell nests buttons inside `role="button"` (a11y/interaction conflict)
- [ ] **D31-002** - CalendarWidget `maxProjectsPerDay` cap not enforced across projects+tasks
- [ ] **D31-003** - CalendarWidget day generation filters arrays per-day with repeated date parsing (O(42*n))

- [ ] **D32-002** - CalendarView loads tasks with sequential per-project requests (N+1 risk)
- [ ] **D32-006** - ProjectDetailsView tabs: `aria-labelledby` references missing tab IDs
- [ ] **D32-007** - ProjectDetailsView download/preview bypass HTTP client + missing `noopener` on `window.open`
- [ ] **D32-008** - SettingsView saves role settings to non-user-scoped `localStorage` keys
- [ ] **D32-009** - BackupView backup/schedule/Dropbox actions are simulated stubs (prod risk)

- [x] **D33-001** - App WebSocket connect can be initiated twice (bootstrap + auth watcher)
- [x] **D33-002** - App WebSocket debug/logging is not environment-gated (production noise/leakage)
- [x] **D33-005** - Backend shutdown is not idempotent and doesn’t guard cleanup failures

- [ ] **D34-002** - Stores index contains weakly-typed WebSocket wiring helper (drift/dead-code risk)

- [ ] **D35-001** - Public folder appears to be missing referenced PWA/icon assets

- [ ] **D36-001** - Env var typing/naming drifts from actual usage (VITE_SOCKET_URL/VITE_APP_VERSION)
- [ ] **D36-002** - PaginationQuery types don’t match Express query strings (misleading)
- [x] **D36-003** - Backend auth/JWT role fields are stringly-typed (drift risk)

- [ ] **D37-004** - Frontend `.env.example` encourages client-side Dropbox access token

- [ ] **D38-003** - Dev seed clears all tables without an environment/DB safety guard
- [ ] **D38-004** - Message read receipts/attachments stored as string arrays (no FK, scaling risk)

- [ ] **D39-003** - Scripts use `pkill -9 node` and hard-coded paths (unsafe/non-portable)
- [ ] **D39-004** - Backend setup script runs `prisma db pull --force` / `db push` without safety checks
- [ ] **D39-005** - Dropbox test script uses wrong seeded email + brittle token parsing

- [ ] **D40-001** - Broken doc links due to docs path drift
- [ ] **D40-003** - Docs conflict on whether frontend integration is complete
- [ ] **D40-005** - Debug guide uses wrong health endpoint (`/health` vs `/api/v1/health`)
- [ ] **D40-006** - Backend setup docs list wrong file upload endpoint
- [ ] **D40-008** - Dropbox mandatory/optional + Railway start pipeline guidance inconsistent

- [ ] **D41-002** - Stray ad-hoc DB query output committed as a file


### Low Issues (Optional Fix)
- [x] **D2-003** - Backend GeoCoordinates should reject NaN/Infinity
- [ ] **D3-007** - Task serialization omits `creatorName`/`assigneeName`
- [ ] **D3-010** - Permission uses `Set` in props (prefer array at DTO boundaries)
- [ ] **D4-005** - Backend repository interfaces lack consistent per-method docs
- [ ] **D5-005** - DTO modules include helper/factory functions (consider separating)
- [ ] **D5-006** - Duplicate user DTO shapes + header inconsistency in `user-data.dto.ts`
- [ ] **D6-004** - Project service calendar query takes `Date` parameters (ensure transport-safe mapping)
- [ ] **D8-005** - HTTP client leaves `console.log` statements in delete path
- [x] **D9-003** - WebSocket client/server include `console.*` debug logs in production paths
- [x] **D10-005** - Backend Dropbox service uses `console.log` in infra paths
- [x] **D11-004** - Repositories contain `console.*` debug logs in core paths
- [ ] **D11-005** - Frontend UserRepository mixes paradigms and inconsistent error handling
- [ ] **D11-006** - Backend AuditLogRepository may propagate sensitive error details
- [ ] **D12-002** - TokenStorage imports `ITokenStorage` from HTTP client module (coupling risk)
- [ ] **D12-003** - Prisma query logging and `as never` casts in event hooks
- [x] **D13-004** - JWT service uses `as any` for `expiresIn` config
- [x] **D13-005** - Optional auth swallows invalid tokens silently
- [x] **D14-004** - Backend constants call `dotenv.config()` at import time
- [x] **D14-005** - Backend constants header `@file` path mismatch
- [x] **D15-005** - Backend logger console formatter can throw on circular metadata
- [x] **D15-006** - Backend shared file headers have repeated `@file` path mismatches
- [ ] **D16-002** - High-contrast override uses hard-coded `#000` instead of tokens
- [ ] **D16-003** - Global `*` reset includes margin/padding zero (potential side-effects)
- [ ] **D17-003** - Router uses `console.*` in core navigation/guard paths
- [ ] **D18-007** - Stores contain noisy `console.*` debug logs and leave unused WebSocket unsubscribe
- [ ] **D19-003** - Tasks composable duplicates transition semantics and uses broad “pending” counter
- [ ] **D19-004** - Composable permission checks are UX-only; avoid treating them as authorization
- [x] **D20-004** - Backend app bootstrap header `@file` path mismatch
- [x] **D21-004** - Backend route module headers use wrong `@file` paths
- [ ] **D22-007** - Controllers parse query/path inputs without strict validation
- [x] **D22-008** - Backend controller module headers use wrong `@file` paths
- [x] **D23-003** - Backend middleware module headers use wrong `@file` paths
- [x] **D24-005** - AppCard clickable a11y: missing Space key activation
- [ ] **D24-006** - UI components generate IDs via `Math.random()` (SSR/test instability)
- [x] **D24-007** - Common components use `$emit` instead of typed `emit` in `<script setup>` templates
- [ ] **D24-008** - LoadingSpinner has dead `overlay` prop + hard-coded color fallbacks
- [ ] **D24-010** - Common components header templates are inconsistent
- [x] **D25-003** - Layout components use `$emit`/`$router` instead of typed `emit`/`router`
- [ ] **D37-005** - Playwright baseURL is hard-coded to localhost:5173
- [ ] **D38-005** - Audit/permission attribution fields are not relationally enforced

- [ ] **D39-006** - Upload endpoint test script assumes `jq` + brittle status detection
- [ ] **D39-007** - Script hygiene inconsistencies (headers, ESM import conventions)
- [ ] **D25-004** - Layout AppSidebar has unused `computed` import
- [ ] **D25-005** - Layout components header templates are inconsistent
- [ ] **D26-004** - ProjectCard role="button" lacks Space key activation
- [ ] **D26-005** - ProjectForm Cancel uses `$emit` instead of typed `emit`
- [ ] **D26-006** - ProjectForm generateCode() can collide (Math.random)
- [ ] **D26-007** - ProjectSummary delete button lacks aria-label; statusLabel lacks fallback
- [ ] **D27-004** - TaskCard role="button" lacks Space key activation; draggable interaction ambiguity
- [ ] **D27-005** - TaskForm templates use `$emit` instead of typed `emit` (cancel/remove-file)
- [ ] **D27-006** - TaskList templates use `$emit` instead of typed `emit` for forwarding
- [ ] **D27-007** - TaskHistory action rendering relies on substring parsing of `action`
- [ ] **D27-008** - TaskHistory value-change rendering uses truthiness checks

- [ ] **D28-004** - MessageBubble uses `$emit` in template for file-click (typed emit bypass)
- [ ] **D28-005** - MessageList uses `$emit` in template for file-click (typed emit bypass)
- [ ] **D28-006** - Message components declare unused emits (`retry`/`message-read`)
- [ ] **D28-007** - MessageBubble uses hard-coded hex color for read status

- [ ] **D29-003** - FileList clickables miss Space key and bypass typed emits (`$emit`)
- [ ] **D29-004** - FileUploader preview cleanup uses revokeObjectURL with data URLs
- [ ] **D29-005** - FileUploader queue IDs use `Math.random()` (collision/test fragility)
- [ ] **D29-006** - FileList sorting repeatedly constructs Date objects in comparator
- [ ] **D29-007** - FileList has unused upload-click emit + unused upload button styles

- [ ] **D30-004** - Notification a11y/consistency: missing Space key + `$emit` in templates
- [ ] **D30-005** - NotificationList activeFilter is weakly typed (string)

- [ ] **D31-004** - CalendarWidget uses `toISOString()` for day keys (timezone/DST sensitivity)
- [ ] **D31-005** - CalendarWidget includes noisy `console.log` debug watcher for projects

- [ ] **D32-003** - DashboardView clickable deadline items miss Space key activation
- [ ] **D32-005** - ProjectListView sorts by repeatedly constructing `Date` objects in comparator
- [ ] **D32-010** - Forbidden/NotFound views use hard-coded colors/gradients instead of tokens

- [ ] **D33-003** - App toast `provide()` uses string injection key (type-safety/collision risk)
- [ ] **D33-004** - App toast IDs use `Math.random()` and timers aren’t tracked for teardown
- [x] **D33-006** - Backend server header `@file` mismatch + unhandledRejection casts unknown to Error
- [x] **D33-007** - main.ts unhandledrejection handler suppresses default browser reporting

- [ ] **D34-003** - Frontend barrel files use inconsistent (non-standard) header templates
- [ ] **D34-004** - Backend barrel file headers often use wrong `@file` paths

- [ ] **D35-002** - robots.txt allows all routes by default (confirm intended indexing policy)
- [ ] **D35-003** - public `.gitkeep` likely shipped publicly (move notes to docs)

- [x] **D36-004** - Backend shared types header `@file` path mismatch
- [ ] **D36-005** - vite-env.d.ts uses non-standard header vs project convention

---

## CROSS-CUTTING CONCERNS

### Type Safety Analysis
**Issues:**
- Type-check is currently failing in multiple layers (tracked as we review groups). Some are rooted in incorrect imports/exports between Domain entities/enums and repository interfaces.
- Several Application service implementations and call sites are out of sync with their declared interfaces, undermining TypeScript’s ability to enforce contracts (D7-001).
- Some domain fields are weakly typed (e.g., `Message.senderRole: string`, `Permission.sectionAccess: string[]`), increasing drift risk vs enums and requirements.
- Many Application DTOs use `Date` types for likely JSON payloads, which can mask runtime mismatches unless a centralized mapping/parsing layer exists (D5-001).
- Several common UI components lose type information at the DOM boundary (notably `<select>` values) and rely on truthiness checks that mis-handle valid values like `0` (D24-003).
- Date-only fields in feature components are round-tripped through `Date` and then formatted via `toISOString()`, which can shift calendar dates depending on timezone (D26-002).
- Task form status logic is mostly enum-based, but some template paths still compare against raw string literals, which is fragile and undermines the value of `TaskStatus` (D27-003).
- Message list date grouping uses `toISOString()` (UTC) for “calendar day” bucketing and Today/Yesterday comparisons, which can mis-group messages across timezones; treat calendar-day keys as a local UI concern (D28-001).
- Notification list grouping repeats the same UTC `toISOString()` calendar-day bug pattern, suggesting a shared utility for local date bucketing would reduce drift across components (D30-001).
- Notification list filter state/contracts are weakly typed (`activeFilter: string`, filter-change emitting `{}` for non-unread), which undermines exhaustive handling and makes parent integration brittle (D30-002/D30-005).
- CalendarWidget uses UTC `toISOString()` for day keys in a local calendar grid; date semantics (local day vs UTC timestamp) should be consistently modeled across the Presentation layer (D31-004).
- View-layer contracts drift in multiple places (custom events and enum values), which TypeScript can’t enforce at runtime; prefer deriving UI option values from enums and reusing typed emit contracts to prevent broken wiring (D32-001/D32-004).
- App-level dependency injection uses string keys (`provide('toast', ...)`), which is easy to collide and hard to type-check across the app; use typed `InjectionKey`s for safer provide/inject contracts (D33-003).
- Presentation store barrel includes a WebSocket wiring helper typed as `any` with string event names, which undermines type safety and can drift from the real WebSocket API surface (D34-002).
- Vite env typing currently doesn’t reflect the env vars actually used across the frontend (`VITE_SOCKET_URL`, `VITE_APP_VERSION`), reducing type-safety and increasing misconfiguration risk (D36-001).
- Backend request-boundary types model pagination values as numbers even though Express query params arrive as strings unless parsed, encouraging subtle bugs and `NaN` propagation (D36-002).
- Backend shared auth/JWT shapes model roles as `string`, increasing drift risk vs the actual role set enforced in authorization logic (D36-003).
Prisma seed scripts can drift from the schema/migration state (e.g., removed columns still referenced), leading to runtime failures in local/dev setup.
- Script/test utilities mix TS/ESM import conventions inconsistently (extension vs no extension), which can cause environment-specific execution failures (D39-007).

### Consistency Analysis
**Issues:**
- UI labels/colors/icons are currently embedded into Domain enumerations, which risks inconsistent UI behavior and complicates localization/theming.
- Common component files mix header templates and (in `LoadingSpinner`) introduce hard-coded fallback colors, which weakens the project-wide token + documentation conventions (D24-008/D24-010).
- Layout components still rely on untyped template globals (`$emit`, `$router`) and diverge in header style, which erodes the project’s type-safety and documentation consistency goals (D25-003/D25-005).
- Feature components continue the `$emit`-in-template pattern and include several non-semantic clickable tiles, reinforcing the need for a consistent “interactive element” pattern across the Presentation layer (D26-001/D26-005).
- Task components repeat the `$emit`-in-template pattern and also build translucent colors via string concatenation (e.g., `${color}20`), which assumes a hex color format and can be brittle if tokens ever switch representation (D27-005/D27-006).
- Message components continue the `$emit`-in-template pattern and include a hard-coded hex value in component CSS, weakening the project’s token/theming discipline (D28-004/D28-005/D28-007).
- File components also surface inconsistent component contracts (unused emits/styles) and continue `$emit`-in-template patterns, reinforcing the need for a consistent typed-emits + component-API hygiene convention (D29-003/D29-007).
- Notification components continue `$emit`-in-template usage and rely on `role="button"` patterns that need consistent keyboard parity (Space + Enter) across the Presentation layer (D30-004).
- CalendarWidget repeats the “clickable container” pattern but also nests real `<button>`s inside a `role="button"` day cell; standardize a consistent interactive-element pattern to avoid nested-controls a11y pitfalls (D31-001).
- Views include multiple “demo/stub” style implementations (`alert`, simulated API delays) and hard-coded styling in error pages; centralize UX primitives and keep production views backed by real service calls to avoid drift (D32-009/D32-010).
- App entry includes unconditional debug-style logs and enables WebSocket debug mode by default; standardize an environment-gated logging/debug convention for entrypoints and core infrastructure initialization (D33-002).
- Multiple barrel-export files don’t follow a consistent file-header convention across the codebase (frontend `@module` blocks vs the project’s standard header template; backend `@file` path mismatches), making documentation/auditing less uniform (D34-003/D34-004).
- Public assets currently include a placeholder `.gitkeep` and appear to omit expected icon files; ensure public-asset expectations match what is actually shipped to avoid broken icon requests and inconsistent PWA metadata (D35-001/D35-003).
- Frontend test tooling configuration is internally inconsistent (ESM project + CJS `require` setup, non-standard Jest option, missing Vue transformer), which makes the test harness fragile and harder to maintain (D37-003).
- Operational scripts embed machine-specific paths and broad process-kill commands (`pkill -9 node`), reducing portability and predictability across dev setups (D39-003).
- Documentation files contain multiple broken relative links and contradictory guidance across “generated” docs; without a single source of truth + link checking, doc drift will keep increasing (D40-001/D40-003/D40-008).
- Repository contains committed operational artifacts (runtime logs and ad-hoc DB output), indicating inconsistent repo hygiene and risking sensitive-data leakage (D41-001/D41-002).

### Security Analysis
**Issues:**
- High-risk operational command execution exists in backend backup flows (D7-003).
- HTTP client contains debug logging that may leak payloads/tokens depending on usage (D8-005).
- WebSocket project room joins are now authorization-guarded (D9-001 ✅ resolved).
- Frontend previously embedded/consumed third-party secrets (Dropbox) in a client-side integration; this was removed and the frontend now relies on backend `/api/v1/files/*` endpoints (D10-002 ✅ resolved).
- Some backend database errors include raw underlying message text, which can leak internals if surfaced directly in API responses (D11-006).
- Backend JWT secrets now require env vars and fail fast when missing (D14-001 ✅ resolved).
- Backend repository contains real third-party credentials in `backend/.env`, which must be treated as compromised and removed from history (D37-001).
- Production seed sets and logs a predictable admin password, which is unsafe in real deployments and should be replaced with an env-supplied or one-time credential (D38-002).
- Operational/token scripts and notes print or embed token material in plaintext, which increases accidental leakage risk (terminal history/screen sharing/repo notes) and should be eliminated (D39-001/D39-002).
- Frontend shared ID generation uses `Math.random()` despite claiming UUID v4 compliance; this is not appropriate for security-sensitive identifiers (D15-001).
- Frontend global styles import Google Fonts via third-party URL, which can complicate CSP/privacy requirements depending on deployment constraints (D16-001).
- Router post-login redirect handling does not validate the redirect target, which can cause unexpected navigation and should be hardened (D17-001).
- Auth store persists access/refresh tokens in `localStorage`, increasing XSS blast radius (D18-001).
- Notification store persists notifications in `localStorage` under a global key, which can leak state across users on shared devices (D18-006).
- Backend app bootstrap now includes CORS hardening, env-gated logging, and production rate limiting (D20-001/D20-002/D20-003 ✅ resolved).
- Backend routes should make authorization policy explicit (D21-001).
- Backend controllers include at least one clear access-control gap (notifications) and trust client-provided message payloads (D22-001/D22-002).
- Backend controller request-path logging no longer uses `console.*`; remaining security review items are focused on authorization policy clarity (D21-001).
- Upload middleware now validates both extension and MIME type and rejects invalid files with a typed 400 response (D23-001 ✅ resolved).
- Additional security review will be covered in Infrastructure/Auth/HTTP/WebSocket groups.
- File preview/download flows should avoid bypassing the shared HTTP client and must harden new-tab navigation against reverse-tabnabbing (`window.open` without `noopener`) (D32-007).
- App entry currently enables verbose `[App]` logging and WebSocket debug mode by default; ensure production builds do not emit debug traces that could leak operational details or expand the XSS “information surface” (D33-002).
- Avoid shipping internal notes/files from `public/` when they aren’t needed, as they can expose implementation details and create unnecessary public endpoints (D35-003).
- Production deployment scripts currently run database seeding on every start; this expands blast radius for seed bugs and risks data integrity (D37-002).
- Multiple docs include token-like values and/or suggest putting secrets into frontend Vite env vars; this increases the chance of secret leakage through repo history, static hosting, or CI logs (D40-004).
- Authentication docs are inconsistent about cookies vs Bearer tokens; mismatched assumptions here can lead to insecure deployments (missing CSRF/XSS mitigations) and hard-to-debug auth failures (D40-002).
- Committed runtime logs and ad-hoc DB query outputs can leak sensitive operational data and should be purged/ignored (D41-001/D41-002).

### Performance Analysis
**Issues:**
- Some client-side denormalization patterns can trigger N+1 request cascades (e.g., project summary mapping fetching client/tasks/unread per project) and should be addressed with backend aggregation/batching (D18-004).
- TaskList sorts by repeatedly constructing `Date` objects inside the comparator; if task counts grow large, consider caching timestamps or pre-normalizing date fields in a view-model layer to reduce re-parse work during reactive updates.
- FileList sorting repeatedly constructs `Date` objects inside the comparator; for larger lists, cache timestamps or precompute derived sort keys to avoid repeated parsing on reactive updates (D29-006).
- NotificationList’s dual load-more mechanisms can cause duplicate fetches if parent `loadingMore` state lags; consider a single guarded trigger to avoid redundant work (D30-003).
- CalendarWidget recomputes the 42-day grid by filtering entire project/task arrays per day with repeated `Date` parsing; pre-bucketing items by day key will scale better (D31-003).
- CalendarView loads tasks per project during month changes and initial load; consider batching/parallelization to avoid slow sequential fetch patterns when calendars contain many projects (D32-002).
- Duplicated WebSocket connect initiation can create redundant connections/subscriptions and extra event traffic; ensure connect/disconnect lifecycle is single-sourced or idempotent (D33-001).
- Message read receipts and file attachments stored as inline arrays can become inefficient and difficult to index at scale; normalize if message volume or “read tracking” grows (D38-004).


---

**Report Generated:** 2026-03-05
**Next Review Scheduled:** Phase 10 complete
