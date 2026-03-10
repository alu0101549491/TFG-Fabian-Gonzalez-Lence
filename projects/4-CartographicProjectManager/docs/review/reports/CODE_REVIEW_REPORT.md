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

Items marked **✅ RESOLVED (2026-03-06, 2026-03-08)** have been verified as fixed in the current codebase state and are no longer blocking the verification gates reported in `RESOLUTION_REPORT.md` (type-check, lint with 0 errors, and builds).

**Resolved findings:**
- D4-002: Fixed incorrect enum imports in domain repository interfaces.
- D7-001: Aligned service interfaces ↔ implementations and standardized notification call sites to the object-shaped `sendNotification(data: SendNotificationData)` signature.
- D7-002: Fixed AuthorizationService admin role checks and corrected the commented-out admin delete check.
- D7-003: Removed shell-interpolated backup/restore commands and now execute `pg_dump`/`pg_restore` via argument arrays with `PGPASSWORD` passed through environment.
- D7-008: Fixed export PDF coordinate inclusion to correctly handle `0` coordinate values.
- D9-001: Added server-side authorization checks before allowing WebSocket clients to join project rooms.
- D14-001: Removed unsafe JWT secret defaults and now fail-fast when required JWT env vars are missing.
- D14-002: Unified upload constraints (max size + allowlists) across backend constants/middleware and frontend constants/UI to prevent “UI accepts, server rejects” drift.
- D8-001 / D8-002 / D8-003 / D8-004 / D8-005: Hardened Axios retry/refresh/cancel/typing/logging behavior to avoid interceptor crashes, prevent “hung” in-flight requests, enable global cancellation, remove unsafe response casting, and remove debug logging in the production delete path.
- D11-003: Removed `any` return types from the backend TaskRepository by returning explicit Prisma payload types (with included relations) and moving computed `creatorName`/`assigneeName` fields to the controller boundary.

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
| D1-001 | 🟠 HIGH ✅ RESOLVED (2026-03-08) | src/domain/enumerations/*.ts → src/presentation/mappings/domain-enum-ui.ts | N/A (mappings relocated) | **Resolved:** UI-focused mappings (display names, colors, icons, templates) were moved out of Domain enum modules into Presentation mappings, keeping Domain free of UI concerns. | Completed: removed `*DisplayName`, `*Color`, `*Icon`, and message-template exports from Domain enums and centralized them in `src/presentation/mappings/domain-enum-ui.ts`. |
| D1-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/domain/enumerations/task-priority.ts | N/A (enum simplified) | **Resolved:** task priorities now match FR13 (High/Medium/Low only). The unsupported `URGENT` option was removed to prevent validation/filter/export drift and backend incompatibility. | Completed: removed `TaskPriority.URGENT` and updated UI options/mappings/constants to use only `HIGH`/`MEDIUM`/`LOW`. |
| D1-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/domain/enumerations/task-status.ts; src/presentation/mappings/domain-enum-ui.ts | N/A (state machine tightened) | **Resolved:** the task lifecycle no longer allows bypassing work-in-progress states. `PENDING → PERFORMED` is now disallowed; “done pending confirmation” is represented by `PERFORMED` and displayed as “Done (Pending Confirmation)”, with confirmation handled via the dedicated confirm/reject flow. | Completed: tightened `TaskStatusTransitions` to require `IN_PROGRESS/PARTIAL → PERFORMED`, removed ad-hoc transitions out of `PERFORMED` (confirmation/rejection uses dedicated methods), and updated the UI display label to match requirements semantics. |
| D1-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-10) | src/domain/enumerations/project-status.ts; docs/specification.md | N/A (spec + lifecycle aligned) | **Resolved:** requirements now match the implemented project lifecycle. The specification’s project status field documents the full enum used end-to-end (`ACTIVE`, `IN_PROGRESS`, `PENDING_REVIEW`, `FINALIZED`), while preserving the high-level “Active vs Finished” semantics required by FR24/FR25. | Completed: updated the spec to reflect the implemented statuses; filtering/UI labeling already supports all states and “finished” continues to be represented by `FINALIZED`. |

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
| D2-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/domain/value-objects/geo-coordinates.ts | N/A (canonical JSON shape aligned) | **Resolved:** the frontend `GeoCoordinates` value object now serializes to the canonical `{x, y}` shape (x = longitude, y = latitude), aligning JSON/object representation with the backend VO and reducing coordinate-inversion risk at boundaries. | Completed: added explicit `toObject()` (`{x, y}`) and `toLatLngObject()` helpers; `toJSON()` now emits `{x, y}`.
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
| D3-001 | 🟠 HIGH ✅ RESOLVED (2026-03-08) | src/domain/entities/*.ts | N/A (methods removed) | **Resolved:** Domain entities no longer implement transport-facing `toJSON()` methods; API payload shaping remains in the boundary layer (repositories/services) where HTTP payloads are built explicitly. | Completed: removed `toJSON()` from domain entities; DTO/payload shaping continues to happen in Infrastructure repositories (explicit payload objects with ISO date conversion). |
| D3-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/domain/entities/{notification,message,permission,task-history}.ts | N/A (crypto UUIDs) | **Resolved:** domain factory methods no longer build IDs using `Date.now()` + `Math.random()` (or legacy `substr`). They now use the shared crypto-safe `generateId()` helper and keep the existing entity-specific ID prefixes. | Completed: replaced weak ID generation in `TaskHistory`, `Permission`, `Message`, and `Notification` factories with `generateId()` and preserved `history_`/`perm_`/`msg_`/`notif_` prefixes. |
| D3-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/domain/entities/{project,file}.ts | N/A (type/normalization aligned) | **Resolved (type-safety):** Dropbox folder identifiers/paths are now represented consistently where optional. `Project.dropboxFolderId` is typed as `string | null` and normalized so “missing” values never become `undefined` at runtime. | Completed: `ProjectProps.dropboxFolderId` is `string | null` and the constructor/setter normalize empty/undefined values to `null` (call sites/DTO mapping also treat folder IDs as nullable). |
| D3-005 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/domain/entities/user.ts | N/A (touch helper added) | **Resolved:** `User` now maintains `updatedAt` consistently by touching it from all mutating setters (and `updateLastLogin()`), making audit timestamps reliable for UI/state refresh logic. | Completed: added a `touchUpdatedAt()` helper and invoked it from mutating setters and `updateLastLogin()`. |
| D3-006 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/domain/entities/user.ts | N/A (method removed) | **Resolved:** removed the unsafe `User.authenticate()` placeholder method that always threw, eliminating a latent runtime failure path. | Completed: removed `authenticate()` from the `User` domain entity; password verification remains the responsibility of backend/application authentication flows. |
| D3-008 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/domain/entities/message.ts | N/A (typed as `UserRole`) | **Resolved:** `Message.senderRole` is now typed as `UserRole` end-to-end (Domain entity + repository mapping + store DTO mapping), removing `any` casts and preventing drift from the canonical role enum. | Completed: changed `MessageProps.senderRole` and `Message.senderRole` to `UserRole`; API/WS payload mapping now validates roles and falls back to `UserRole.CLIENT`. |
| D3-009 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/domain/entities/permission.ts | N/A (typed as `ProjectSection`) | **Resolved:** `Permission.sectionAccess` is now typed to a constrained `ProjectSection` union (derived from `PROJECT_SECTIONS`), and API payload mapping filters invalid section strings to prevent domain drift. | Completed: added `ProjectSection` + `isValidProjectSection`; updated `PermissionProps`/getters/methods to use `ProjectSection` and repository mapping now allowlists sections. |
| D3-007 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/domain/entities/task.ts | N/A (no domain serialization) | **Resolved:** domain entities no longer implement transport-facing `toJSON()` (see D3-001), so there is no longer a “domain serialization” path that can accidentally drop `creatorName`/`assigneeName`. | Completed: resolved as a consequence of D3-001; task name fields are shaped at the DTO/boundary layer instead of inside the Domain.
| D3-010 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/domain/entities/permission.ts | N/A (DTO boundary uses arrays) | **Resolved:** `Set<AccessRight>` remains an internal domain representation only; the Infrastructure repository maps API DTO arrays (`rights: AccessRight[]`) to/from `Set` at the boundary. | Completed: permission API request/response payloads use arrays (`rights: string[]`) and the repository converts to/from `Set` in mappers.

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
- backend/src/infrastructure/repositories/interfaces/file.repository.interface.ts
- backend/src/infrastructure/repositories/interfaces/message.repository.interface.ts
- backend/src/infrastructure/repositories/interfaces/notification.repository.interface.ts
- backend/src/infrastructure/repositories/interfaces/project.repository.interface.ts
- backend/src/infrastructure/repositories/interfaces/task.repository.interface.ts
- backend/src/infrastructure/repositories/interfaces/user.repository.interface.ts

**Score:** 5.8/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D4-001 | 🟠 HIGH ✅ RESOLVED (2026-03-08) | backend/src/domain/repositories/*.repository.interface.ts → backend/src/infrastructure/repositories/interfaces/*.repository.interface.ts | N/A (interfaces relocated) | **Resolved:** Prisma-shaped repository interfaces were moved out of the backend “Domain” layer into Infrastructure, so the backend Domain is no longer directly coupled to `@prisma/client` types via repository contracts. | Completed: relocated the interfaces into Infrastructure (Prisma-bound), updated repository implementations to import from the new location, and removed the old Domain interfaces module. |
| D4-002 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | src/domain/repositories/{task,notification}-repository.interface.ts | 15 | **Incorrect imports break type-safety/builds:** repository interfaces import enums from entity modules (`TaskStatus`, `TaskPriority`, `NotificationType`) that are not exported by those entity files. **Resolved:** interfaces now import enums from the corresponding `../enumerations/*` modules. | Implemented: enums are imported from their actual modules (e.g., `../enumerations/task-status`, `../enumerations/task-priority`, `../enumerations/notification-type`). |
| D4-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-10) | src/domain/repositories/*.interface.ts; src/infrastructure/repositories/*.ts | N/A (query-object APIs) | **Resolved:** repository interfaces no longer expose a long tail of query-specific methods. Query shapes are now expressed via small query objects (e.g., `find(query)` / `count(query)`), keeping Domain contracts stable while allowing new filters without API explosion. | Completed: introduced query-object types (`*FindQuery`/`*CountQuery`) and consolidated ad-hoc repository methods into `find`/`count` entrypoints. Updated infrastructure repositories and service call sites accordingly. |
| D4-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/domain/repositories/task-history-repository.interface.ts | N/A (typed union) | **Resolved:** task history action filtering no longer relies on ad-hoc strings. Repository filtering now accepts a typed `TaskHistoryAction` union (centralized allowlist), reducing drift and improving autocomplete/type-safety. | Completed: added `TaskHistoryAction` allowlist/union under `src/domain/enumerations/task-history-action.ts` and updated repository/service signatures to use it. |
| D4-005 | 🟢 LOW ✅ RESOLVED (2026-03-09) | backend/src/infrastructure/repositories/interfaces/{task,file,message,notification}.repository.interface.ts | N/A (docs added) | **Resolved:** backend repository interfaces now include per-method JSDoc, improving consistency with the project’s documentation standards. | Completed: added concise method-level JSDoc (params/returns/semantics) across the Task/File/Message/Notification repository interfaces.

**Positive Aspects:**
- Frontend repository interfaces are consistently documented and clearly describe intent/semantics.
- Interfaces generally return `Promise<T | null>` for lookups, which is a pragmatic contract for “not found”.
- Separation between frontend and backend repository contracts is explicit (no accidental shared module coupling).

**Group Notes:**
The frontend repository layer is structurally reasonable, but it currently has at least two concrete import mistakes that should be fixed promptly (D4-002). On the backend, repository interfaces were previously Prisma-shaped and located under `backend/src/domain/repositories/*`; these have now been relocated to `backend/src/infrastructure/repositories/interfaces/*` to keep persistence-bound contracts out of the Domain layer (D4-001).

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
| D5-001 | 🟠 HIGH ✅ RESOLVED (2026-03-08) | src/presentation/stores/auth.store.ts, src/shared/constants.ts | N/A (storage rehydration) | **Resolved:** DTOs that include `Date` fields are no longer persisted/revived via raw `JSON.stringify/parse` without rehydration. The auth store now serializes `Date` fields into ISO strings for storage and explicitly rehydrates them back into `Date` objects on load, preventing runtime type mismatches after reload. | Completed: added a JSON-friendly stored-user shape (`StoredUserDto`), `serializeUserForStorage`/`deserializeUserFromStorage` helpers, and persisted `expiresAt` under a dedicated `STORAGE_KEYS.EXPIRES_AT` key. |
| D5-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-10) | src/application/dto/{project-data,project-details,calendar-data,task-data}.dto.ts; src/presentation/view-models/*.ts | N/A (DTO/ViewModel boundary) | **Resolved:** Application DTOs no longer include UI/view-model concerns (`statusColor`, `isOverdue`, `daysUntilDelivery`, `can*`, `allowedStatusTransitions`). These UI conveniences were re-homed into Presentation ViewModels, preventing transport contracts from embedding display/permission logic. | Completed: removed UI-only fields from Application DTOs/services and introduced Presentation `*ViewModel` types that own derived UI fields. Stores/components/composables now depend on ViewModels (not Application DTOs) for UI rendering concerns; the build/type-check gate is green. |
| D5-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/application/dto/{project-data,project-details,file-data}.dto.ts | N/A (contract renamed) | **Resolved:** DTO contracts no longer expose Dropbox-specific naming or error codes. Project DTOs now use `storageFolderId`/`storageFolderUrl`, file DTOs use `storagePath`, and file error codes use `STORAGE_PROVIDER_ERROR` instead of `DROPBOX_ERROR`. | Completed: renamed Dropbox-specific DTO fields/codes to provider-agnostic storage naming and updated consumers accordingly. |
| D5-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/application/dto/{calendar-data,task-data}.dto.ts | calendar-data.dto.ts, task-data.dto.ts | **Resolved:** Weak stringly-typed DTO fields were tightened: `CalendarItemDto.statusColor` now uses the `ProjectStatusColor` union, and `TaskHistoryEntryDto.action` now uses the domain `TaskHistoryAction` union. Any raw string inputs are normalized at the mapping point. | Completed: updated DTO types and normalized task-history mapping via `isValidTaskHistoryAction(...)` with a safe fallback for unexpected values. |
| D5-005 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/application/dto/{auth-result,validation-result}.dto.ts | auth-result.dto.ts, validation-result.dto.ts | **Resolved:** DTO definition modules are now declarative: helper/factory implementations were extracted into dedicated Application helper modules (`src/application/auth/*`, `src/application/validation/*`). DTOs continue to export transport shapes (types/enums) only. | Completed: moved auth/validation helper functions into `src/application/auth/auth-result.helpers.ts` and `src/application/validation/validation-result.helpers.ts` and updated the DTO barrel exports to re-export them for API stability. |
| D5-006 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/application/dto/{auth-result,user-data}.dto.ts | auth-result.dto.ts:38-69, user-data.dto.ts:1-35 | **Resolved:** Introduced a shared `UserBaseDto` and reused it across `UserDataDto`, `UserSummaryDto`, and the auth payload `UserDto`, eliminating duplicated base fields and reducing drift risk. Standardized `user-data.dto.ts` header metadata to match the project template (including the missing `typescripttutorial` reference). | Completed: added `UserBaseDto` to `user-data.dto.ts`, refactored user DTOs and auth `UserDto` to extend it, and normalized the file header metadata. |

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
| D6-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/application/interfaces/*.interface.ts; src/application/services/common/errors.ts; src/application/services/{project,task}.service.ts | N/A (taxonomy + alignment) | **Resolved:** Application services now share a concrete error taxonomy: missing error classes referenced by interfaces (`BusinessLogicError`, `StorageError`) were added and the union `ApplicationServiceError` is exported for consistent handling. Business-rule failures thrown by services were aligned to `BusinessLogicError` (an alias of `BusinessRuleError`), so consumers can reliably narrow via `instanceof` without guessing implementation details. | Completed: introduced `StorageError`/`BusinessLogicError` + `ApplicationServiceError` union and aligned `ProjectService`/`TaskService` business-rule throws to `BusinessLogicError`. |
| D6-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/application/interfaces/* | N/A (interface removed) | **Resolved:** the Dropbox-specific `file-service.interface.ts` no longer exists and the remaining Application interfaces do not contain Dropbox/vendor-specific concepts (no `dropbox*` naming in `src/application/interfaces`). Vendor-specific naming remains in Infrastructure/backend adapters where appropriate. | Completed: removed the Dropbox-coupled Application interface; Application service interfaces are now vendor-agnostic. |
| D6-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/application/interfaces/authorization-service.interface.ts; src/application/services/authorization.service.ts; src/application/services/project.service.ts | N/A (boundary type updated) | **Resolved:** `IAuthorizationService.getProjectPermissions(...)` now returns `AccessRight[]` (transport-friendly) instead of `Set<AccessRight>`. Internally, implementations may still use `Set` for uniqueness and efficient lookups. | Completed: updated the interface + implementation to return arrays (`Array.from(set)`), and updated the consumer (`ProjectService`) to convert to a `Set` locally when needed for `.has(...)` checks. |
| D6-004 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/application/interfaces/project-service.interface.ts, src/application/services/project.service.ts | project-service.interface.ts, project.service.ts | **Resolved:** `getProjectsForCalendar(...)` now accepts ISO 8601 date strings at the service boundary (transport-safe) and parses/validates them once inside the service implementation before applying date-range filtering. | Completed: updated the interface signature to `startDate: string, endDate: string` and added centralized parsing/validation (including invalid-date and invalid-range errors) in `ProjectService.getProjectsForCalendar`. |

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
| D7-005 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/application/services/project.service.ts; src/domain/entities/project.ts; src/application/dto/project-{data,details}.dto.ts; src/infrastructure/repositories/project.repository.ts; src/presentation/components/project/ProjectForm.vue; src/presentation/stores/project.store.ts | Multiple | **Coordinate truthiness bug + invalid defaulting. Resolved:** missing Dropbox folder IDs no longer normalize to `''` within the frontend domain/DTO path; they’re represented as `null`/`undefined`, and Dropbox URL generation is guarded. | Implemented: normalized Dropbox folder IDs to `null` at the Domain boundary; widened DTOs to accept/return nullable Dropbox folder data; repositories map `null` to `''` only at the backend API boundary; UI no longer sends empty-string IDs on create and store mapping avoids placeholder URLs. |
| D7-006 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/shared/constants.ts; src/presentation/composables/use-files.ts; src/presentation/components/file/FileUploader.vue; src/presentation/views/ProjectDetailsView.vue; backend/src/presentation/controllers/file.controller.ts | Multiple | **Type mismatch + path construction risk. Resolved:** upload `section` is now constrained to a canonical `ProjectSectionId` derived from `PROJECT_SECTIONS` (no free-form strings), message attachments use `PROJECT_SECTIONS.MESSAGES` (no string literal defaults), and the uploader UI only offers allowlisted section identifiers. Backend upload controller already normalizes/allowlists `section` and sanitizes filename/path segments before constructing Dropbox paths. | Implemented: added `ProjectSectionId` + `isProjectSectionId` helper; tightened upload section typing end-to-end on the frontend; removed string-literal defaults; kept backend allowlist/sanitization as the final safety boundary. |
| D7-007 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | backend/src/application/services/deadline-reminder.service.ts | Multiple | **Stringly-typed notification types + duplicate reminder risk. Resolved:** reminder notifications now use Prisma’s canonical `NotificationType` values (no string literals), and the scheduler path includes a per-day idempotency guard (`hasSentToday(...)`) so reruns don’t create duplicate reminders for the same user/type/project/title/message. | Implemented: replaced string literal notification types with `NotificationType.*`; added a "sent today" existence check (day-bounded query) before creating reminder notifications to avoid duplicates on scheduler reruns. |
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
| D11-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/infrastructure/repositories/{notification,project}.repository.ts | N/A (query building updated) | **Query strings were built via raw interpolation without encoding:** ISO date strings include `:` and other reserved characters; this is fragile and can break requests depending on server/proxy parsing. **Resolved:** query strings in the affected repositories now use `URLSearchParams` (encoded) rather than string interpolation. | Completed: updated `NotificationRepository` and `ProjectRepository` to build encoded URLs with `URLSearchParams` (including ISO date range filters and delete-by-date paths). |
| D11-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | backend/src/infrastructure/repositories/task.repository.ts | N/A (typed Prisma payloads) | **Resolved:** Removed `any` return types and stopped leaking repository-layer augmented shapes by returning explicit Prisma payload types (with included relations) from the repository and adding computed `creatorName`/`assigneeName` fields at the controller boundary. | Completed: updated `ITaskRepository` to use typed Prisma payloads; repository returns typed results; controller maps API response shape including the computed name fields. |
| D11-004 | 🟢 LOW ✅ RESOLVED (2026-03-10) | src/infrastructure/repositories/project.repository.ts; backend/src/infrastructure/repositories/project.repository.ts | N/A (logs removed) | **Resolved:** removed direct `console.*` debug logging from core repository data paths; backend routes through the shared logger and frontend removes noisy debug prints. | Completed: removed `console.*` statements and standardized on shared logger / debug-gated logging (avoid logging full entities/payloads). |
| D11-005 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/infrastructure/repositories/user.repository.ts; src/infrastructure/repositories/user-management.repository.ts | N/A (repo split) | **Resolved:** UI/admin CRUD operations were extracted out of `UserRepository` into a dedicated `UserManagementRepository`, and error-handling semantics were standardized (throw on failure; return `null` for 404 lookups). `UserRepository` now remains a domain-focused `IUserRepository` implementation. | Completed: created `UserManagementRepository` for UI management operations, removed DTO CRUD methods from `UserRepository`, and updated consumers to use the appropriate repository.
| D11-006 | 🟢 LOW ✅ RESOLVED (2026-03-09) | backend/src/infrastructure/repositories/audit-log.repository.ts | N/A (safe errors + logging) | **Resolved:** audit log repository failures no longer embed raw DB error text into outward-facing `DatabaseError` messages. | Completed: detailed errors are logged internally via the shared logger; the repository throws stable, user-safe `DatabaseError` messages without leaking underlying exception text.

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
| D12-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/infrastructure/persistence/token.storage.ts; src/presentation/stores/auth.store.ts | N/A (session-scoped storage) | **Resolved:** auth tokens are no longer persisted in `localStorage`. Access/refresh tokens (and related session auth state) are stored in `sessionStorage` and legacy `localStorage` keys are migrated/cleaned up to avoid long-lived persistence. | Completed: moved access-token persistence to `sessionStorage` in both the shared `TokenStorage` and the auth store; added migration from legacy `localStorage` values and cleanup on clear. |
| D12-002 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/infrastructure/persistence/token.storage.ts; src/infrastructure/persistence/token.storage.interface.ts; src/infrastructure/http/axios.client.ts; src/infrastructure/http/index.ts | N/A (interface extracted) | **Resolved:** `ITokenStorage` now lives in a dedicated persistence interface module, eliminating the persistence → HTTP dependency edge and reducing circular-dependency risk. | Completed: moved `ITokenStorage` to `src/infrastructure/persistence/token.storage.interface.ts`; updated the Axios client and TokenStorage to import from it; updated the HTTP barrel to re-export the type for API stability. |
| D12-003 | 🟢 LOW ✅ RESOLVED (2026-03-09) | backend/src/infrastructure/database/prisma.client.ts | N/A (dev-only duration logging; typed events) | **Resolved:** Prisma query logging is now disabled outside development and no longer logs raw SQL text. Prisma `$on(...)` hooks now use official Prisma event types, removing `as never` casts. | Completed: query event emission + logging is enabled only when `NODE_ENV=development`, and query logs contain only duration/target metadata. Error/warn events remain logged without exposing query text. |

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
| D14-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/shared/constants.ts + backend/src/shared/constants.ts + backend upload middleware | N/A (allowlists unified) | **Resolved:** upload constraints (max size + type allowlists) are now consistent across frontend and backend, preventing “UI accepts, server rejects” drift. Backend upload middleware reads max size + allowlists from `UPLOAD` constants, and the frontend `FILE` constants + uploader UI mirror those rules. | Implemented: single backend source of truth (`UPLOAD` constants) + frontend allowlist/UI aligned to backend. |
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
| D15-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/shared/utils.ts | N/A (implementation hardened) | **Resolved:** `deepClone()` now prefers `structuredClone()` (when available) and falls back to a conservative clone that supports circular references and common built-ins (Date/Array/Map/Set) while avoiding silent prototype stripping for class instances. | Completed: updated `deepClone()` to use `structuredClone()` with a safe fallback. |
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
| D16-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/presentation/styles/main.css | N/A (import removed) | **Resolved:** removed the CSS `@import url(...)` Google Fonts load (render-blocking + CSP friction). Fonts are loaded via HTML `<link>` tags (with preconnect), which is the recommended approach when using Google Fonts. | Completed: removed the Google Fonts `@import` line from `main.css` (fonts remain loaded from `index.html`). |
| D16-002 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/presentation/styles/main.css | N/A (token-based override) | **Resolved:** the high-contrast override no longer hard-codes `#000`; it now references existing design tokens to keep the override within the token system. | Completed: updated the `prefers-contrast: high` overrides to set `--color-border-primary`/`--color-text-secondary` via `var(--color-text-primary)`.
| D16-003 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/presentation/styles/main.css | N/A (targeted reset) | **Resolved:** removed the global `* { margin: 0; padding: 0; }` reset to reduce unintended side-effects. Global normalization now targets only `body` and lists (keeping layout stable). | Completed: kept universal `box-sizing` reset, added `body { margin: 0; }`, and explicitly reset `ol/ul` margins and padding. |

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
| D17-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/router/index.ts | N/A (validated redirect) | **Unvalidated redirect target:** the auth guard stores `redirect: to.fullPath`, and `handlePostLoginRedirect()` later does `router.push(redirect)` without validating it. This can cause unexpected navigation (or navigation failures) if the query param is tampered with or points to an invalid route. | Completed: `handlePostLoginRedirect()` now validates the redirect target (internal-only, not `//`, must resolve to a known route, and denies `/login`), and falls back to the dashboard when invalid. |
| D17-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/presentation/router/index.ts | N/A (guard simplified) | **Resolved:** removed the client-side “project access” fetch/shape check from the router guard (no navigation-time `ProjectRepository` call, no `any` DTO assumptions). Authorization remains enforced server-side; navigation guard is now minimal and avoids leaking project/participant data via client checks. | Completed: removed `getProjectWithParticipants()` call and `creatorId`/`specialUsers` ad-hoc checks from the router guard; role-denial logging is now dev-gated. |
| D17-003 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/presentation/router/index.ts | N/A (dev-gated) | **Resolved:** router navigation error logging is now dev-gated. Production navigation failures no longer emit console logs by default (chunk reload behavior remains unchanged). | Completed: wrapped `router.onError(...)` console output behind `import.meta.env.DEV`. |

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
| D18-001 | 🟠 HIGH ✅ RESOLVED (2026-03-08) | src/presentation/stores/auth.store.ts, src/infrastructure/persistence/token.storage.ts | N/A (storage strategy updated) | **Resolved:** refresh tokens are no longer persisted in `localStorage`. The app now stores access tokens in `localStorage` (persistence) while keeping refresh tokens in `sessionStorage` (session-scoped), reducing long-lived compromise risk from `localStorage` exfiltration. | Completed: moved refresh-token persistence to `sessionStorage` in both the auth store and the shared `TokenStorage` used by the Axios client; logout/clear paths remove refresh tokens from session storage. |
| D18-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/stores/auth.store.ts | N/A (JWT exp parsing + persistence) | **Resolved:** `expiresAt` is no longer recomputed as “now + window” on reload. The store now derives `expiresAt` from the access token’s JWT `exp` when available (falling back to the configured window only if parsing fails) and persists it under `STORAGE_KEYS.EXPIRES_AT`. | Completed: added best-effort JWT `exp` parsing and persisted `expiresAt` to avoid artificially extending sessions across reloads. |
| D18-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/presentation/stores/project.store.ts; src/infrastructure/repositories/project.repository.ts | N/A (typed API response) | **Resolved:** removed `any` casts and hidden-field assumptions by typing the project details API response to include `creatorId` and enum-typed `role`/`status`/`type`, allowing the project store to compute permissions without ad-hoc casts. | Completed: `ProjectApiResponse` now includes `creatorId` and typed enum fields; project store uses `projectWithDetails.creatorId` and typed roles/status/type (no `as any`). |
| D18-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/presentation/stores/project.store.ts; src/infrastructure/repositories/project.repository.ts; backend/src/presentation/controllers/project.controller.ts; backend/src/presentation/routes/project.routes.ts | N/A (summary endpoint + store update) | **Resolved:** removed the project list N+1 pattern by introducing a backend summaries endpoint that returns denormalized list fields (client name, pending task counts, unread message counts) in a few queries. The project store now fetches summaries in one request instead of issuing 3 extra requests per project. | Completed: added `GET /projects/summaries` (with filter parity) and updated the project store to use `ProjectRepository.findSummaries(...)` for list views. |
| D18-005 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/presentation/stores/message.store.ts; backend/src/presentation/controllers/message.controller.ts; backend/src/presentation/routes/project.routes.ts; backend/src/infrastructure/repositories/message.repository.ts | N/A (real pagination + consistent read-state) | **Resolved:** message pagination and read-state now reflect backend operations. The backend message listing supports optional `limit`/`offset` pagination (and a per-project total count endpoint), and the message store uses those to fetch/append pages without duplicating the full dataset. Project-level “mark as read” updates now mark all local messages/read counts consistently to avoid drift. | Completed: added `GET /projects/:projectId/messages/count` and optional `limit`/`offset` support on `GET /projects/:projectId/messages`; updated the message store to use paginated fetch + total count to compute `hasMore`, and to set all local messages to read after a project-level mark-read call. |
| D18-006 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/stores/notification.store.ts, src/presentation/stores/index.ts, src/presentation/composables/use-auth.ts | N/A (user-scoped cache + hydrate) | **Notification persistence is not user-scoped and is incomplete:** notifications are saved under a global `localStorage` key (`cpm_notifications`) without a per-user namespace; this can leak state across accounts on shared machines. The store also defines `loadFromStorage()` but doesn’t call it during initialization, so persistence is only half-implemented. | Completed: notifications are now persisted under a per-user key (`cpm_notifications:<userId>`), date fields (`createdAt`, `readAt`) are rehydrated, and hydration is invoked after auth initialization (app start) and after successful login to avoid cross-user leakage within a single SPA session. |
| D18-007 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/presentation/stores/{auth,project,message,notification,user}.store.ts | N/A (dev-gated + cleanup) | **Resolved:** verbose store `console.*` logging is now gated to development builds. WebSocket listener subscriptions in the message store are retained and cleaned up on store-scope disposal. | Completed: wrapped store console output behind `import.meta.env.DEV` and added `onScopeDispose()` cleanup for `socketHandler.onMessage(...)` / `onUnreadCount(...)` subscriptions. |

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
| D19-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/composables/use-auth.ts, src/presentation/router/index.ts | N/A (shared validated redirect) | **Redirect handling is duplicated and still unvalidated:** after login, `useAuth()` pushes `currentRoute.query.redirect` directly; `requireAuth()` also stores an `intended_route` in `sessionStorage`. This duplicates router logic and preserves the same “untrusted redirect” risk already tracked in router code. | Completed: `useAuth()` now delegates to the router’s shared `handlePostLoginRedirect()` (validated via `isValidRedirectTarget`), and `requireAuth()` uses the same `redirect` query mechanism (no separate `intended_route`). |
| D19-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | src/presentation/composables/use-files.ts; src/infrastructure/http/axios.client.ts | N/A (typed `ApiResponse<T>`) | **Upload response typing is `any` and depends on unclear interceptor behavior. Resolved:** the composable now uses a single explicit upload response shape (`ApiResponse<{ file: UploadedFileApiDto }>`), reads `response.data.file` directly (no dual-path extraction), and parses `uploadedAt` into a `Date` to match `FileSummaryDto`. | Implemented: introduced typed upload DTOs in the composable and removed `any` casts / ambiguous `data.data` extraction. |
| D19-003 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/presentation/composables/use-tasks.ts | N/A (domain transitions + clarified stats) | **Resolved:** the composable’s status transitions are sourced from the domain `TaskStatusTransitions` mapping, and the “pending” counter semantics are explicitly documented to prevent drift. | Completed: ensured transitions are derived from `TaskStatusTransitions` (single source of truth) and documented `pendingCount` as “non-completed tasks” (`status !== COMPLETED`) so consumers don’t infer a narrower meaning.
| D19-004 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/presentation/composables/{use-projects,use-users}.ts | N/A (UX-only guard notes) | **Resolved:** composable permission checks are explicitly documented as UX-only (not authorization) to avoid giving a false sense of security. | Completed: added clear “UX-only; backend enforces authorization” notes around project/user permission guards so future changes don’t treat client checks as security boundaries.

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
| D21-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | backend/src/infrastructure/auth/auth.middleware.ts; backend/src/presentation/routes/{project,task,file,message,notification}.ts | N/A (policy middleware added) | **Resolved:** authorization is now expressed at the routing boundary via coarse policy middleware (project membership/admin, task/file membership via lookup, notification owner/admin, and userId self/admin listing checks). This makes intent explicit at the HTTP boundary and reduces reliance on ad-hoc controller checks. | Completed: introduced reusable authorization middleware in `auth.middleware.ts` and wired it into project/task/file/message/notification routers for project-scoped and owner-scoped operations. |
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
| D24-006 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/common/{AppInput,AppSelect,AppTextarea,AppModal}.vue | N/A (deterministic ids) | **Runtime-generated IDs via `Math.random()` are non-deterministic:** this can cause hydration mismatches in SSR and makes snapshot/e2e tests harder. | Completed: replaced `Math.random()` ids with deterministic per-module counters; components now accept explicit id overrides (`id` for input/select/textarea, `titleId` for modal). |
| D24-007 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/common/{AppInput,AppTextarea,AppConfirmDialog}.vue | N/A (typed `emit` usage) | **Common components now use typed `emit` in templates:** event bindings no longer call `$emit(...)` directly, improving type-safety and consistency with `<script setup>`. | Completed: replaced `$emit(...)` with typed `emit(...)` in the affected components’ templates. |
| D24-008 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/common/LoadingSpinner.vue | N/A (token-only styling) | **Dead props + hard-coded fallback colors undermine design-token consistency:** `overlay` is declared but not used, and several CSS rules hard-code hex colors as fallback values. | Completed: removed the unused `overlay` prop and replaced hard-coded hex fallback values with design tokens (token-only). |
| D24-009 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/common/AppHeader.vue | N/A (store-driven count) | **Header notification badge is no longer hard-coded:** the unread count is derived from `useNotificationStore()` instead of `ref(3)`, preventing incorrect “always 3” UI state. | Completed: bind badge to `notificationStore.unreadCount` via a computed value. |
| D24-010 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/common/{AppHeader,AppFooter,AppSidebar,LoadingSpinner}.vue | N/A (header standardization) | **File headers are inconsistent within the same component group:** several components use a different header style than the rest of the codebase’s standard “University of La Laguna” template. | Completed: standardized these component headers to the project’s University of La Laguna template (including consistent `@file`, `@desc`, and `@see` links). |

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
| D25-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/layout/AppSidebar.vue | N/A (permission-aware nav) | **Navigation links are not permission-aware:** the sidebar includes routes like `/backup` and `/settings` unconditionally. If these views are role-restricted (admin-only), this creates UX confusion and encourages “click-into-403” flows; if route guards are ever weakened, it becomes a real access-control issue. | Completed: the sidebar now filters admin-only links (e.g., `/backup`) using `useAuth().canManageBackups`, aligning navigation visibility with router role guards. |
| D25-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/layout/AppHeader.vue | N/A (dismissal behavior) | **User dropdown lacks standard dismissal behavior:** the dropdown toggles open/closed but does not close on outside click, route navigation (except settings/logout handlers), or Escape key. This can leave menus “stuck” and harms keyboard accessibility. | Completed: added click-outside + Escape dismissal with proper listener cleanup, and the menu now auto-closes on route changes. |
| D25-003 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/layout/{AppHeader,AppSidebar}.vue | N/A (typed emits/router) | **Layout components now use typed `emit` + `router`:** the templates no longer rely on `$emit`/`$router`, routing actions through the typed `emit(...)` function and `router.push(...)` handlers. | Completed: replaced `$emit`/`$router` usage in templates with typed handlers.
| D25-004 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/layout/AppSidebar.vue | N/A (now used) | **Unused import indicates lint/type-check drift:** `computed` is imported but never used. | Completed: `computed` is now used for derived navigation state (permission-aware `navLinks`), so it is no longer an unused import. |
| D25-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/layout/{AppHeader,AppSidebar}.vue | N/A (header standardization) | **File header template inconsistency:** these layout components use a partial header style (missing the second `@see` link and differing formatting) compared to the standard template used across many other modules. | Completed: standardized layout component headers and added the missing second `@see` link. |

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
| D26-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/project/ProjectSummary.vue | N/A (template a11y + emits) | **Clickable “stat cards” and section cards are not keyboard-accessible:** several interactive tiles are `div` elements with `@click` (and `$emit(...)`) but no `role`, `tabindex`, or Space/Enter handling. This blocks keyboard-only and assistive tech users from navigating to tasks/messages/files/participants. | Completed: added `role="button"`, `tabindex="0"`, and Enter/Space key handlers for the clickable stat/section tiles; replaced template `$emit(...)` calls with typed `emit(...)` for consistency. |
| D26-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/project/ProjectForm.vue | N/A (local date-only handling) | **Date-only formatting is timezone-sensitive:** `formatDateForInput()` uses `toISOString().split('T')[0]` which formats in UTC. For users outside UTC, this can render an off-by-one date in `<input type="date">` when the underlying date is interpreted as local time. | Completed: date-only formatting now uses local date parts (`getFullYear()/getMonth()/getDate()`), and submit/validation parse `YYYY-MM-DD` into a local `Date` via `new Date(y, m-1, d)` to avoid UTC shifts. |
| D26-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/project/ProjectCard.vue | N/A (single responsibility) | **Resolved:** `ProjectCard` no longer mixes event emission with internal navigation. The click handler now emits only, preventing double-navigation when parents also route on `@click`. | Completed: removed `router.push(...)` from `handleClick()` and cleaned up the now-unused router usage/import. |
| D26-004 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/project/ProjectCard.vue | N/A (Space key support) | **Keyboard interaction is incomplete for `role="button"`:** the card handles Enter but not Space, which is expected for button-like controls. | Completed: added `@keydown.space.prevent` to trigger the same click handler as Enter. |
| D26-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/project/ProjectForm.vue | N/A (typed emit usage) | **Template bypasses typed emitter:** the Cancel button uses `$emit('cancel')` even though a typed `emit` function is defined via `defineEmits<ProjectFormEmits>()`. This reduces type-safety and consistency (event-name typos won’t be caught). | Completed: replaced `$emit('cancel')` with `emit('cancel')`.
| D26-006 | 🟢 LOW ✅ RESOLVED (2026-03-09) | src/presentation/components/project/ProjectForm.vue | N/A (crypto + uniqueness check) | **Resolved:** project code generation no longer relies on `Math.random()` or a small 1–999 space. Codes are generated from a larger candidate space and validated for uniqueness before being applied to the form. | Completed: switched `generateCode()` to an async generator that produces crypto-based candidates (with a deterministic fallback) and checks uniqueness via `ProjectRepository.existsByCode(...)` (bounded attempts). The Generate button is disabled while generating and a clear validation error is shown if a unique code cannot be established. |
| D26-007 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/project/ProjectSummary.vue | N/A (a11y label + fallback) | **Minor a11y/robustness gaps in header/status:** the delete action button is icon-only (no `aria-label`), and `statusLabel` can evaluate to `undefined` for unexpected statuses, resulting in blank UI text. | Completed: added `aria-label`/`title` to the delete button, and made `statusLabel` fall back to the raw enum value when an unexpected status is present. |

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
| D27-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/task/TaskList.vue | N/A (priority sort weights) | **Priority sorting logic contradicts the UI label:** the sort option “Priority (Low → High)” is implemented with `URGENT` as the lowest weight (1) and `LOW` as the highest weight (4), which yields “Urgent → Low” for ascending. This is a correctness/UX bug and makes sorting feel broken. | Completed: flipped the priority weights to `LOW: 1 … URGENT: 4` so ascending sorts Low→High and descending sorts High→Low. |
| D27-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/task/TaskForm.vue | N/A (local date-only handling) | **Date-only handling is timezone-sensitive:** `formatDateForInput()` uses `toISOString().split('T')[0]` (UTC) while submit/validation uses `new Date(form.dueDate)` (local parsing). In non-UTC timezones, this can shift the displayed due date by one day when editing an existing task. | Completed: dueDate formatting now uses local date parts (not UTC `toISOString()`), and validation/submit parse `YYYY-MM-DD` into a local `Date` via `new Date(y, m-1, d)` to avoid timezone shifts. |
| D27-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/task/TaskForm.vue | N/A (template enum comparisons) | **Enum comparisons are stringly-typed in the template:** the template compares `selectedNewStatus` / `task.status` to string literals like `'COMPLETED'` and `'PERFORMED'` even though state is typed as `TaskStatus | null`. This is fragile and can drift if enum values or casing change. | Completed: replaced string-literal comparisons with `TaskStatus.COMPLETED` / `TaskStatus.PERFORMED` enum comparisons. |
| D27-004 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/task/TaskCard.vue | N/A (Space key support) | **Keyboard interaction is incomplete for `role="button"`:** the card supports Enter but not Space, which is expected for button-like controls; additionally it mixes `role="button"` with `draggable`, which can create confusing interaction for keyboard/screen-reader users. | Completed: added `@keydown.space.prevent` to trigger the same click handler as Enter. |
| D27-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/task/TaskForm.vue | N/A (typed emit usage) | **Template bypasses typed emitter:** the component defines typed emits, but uses `$emit('remove-file', ...)` and `$emit('cancel')` in the template. This reduces type-safety and consistency across the Presentation layer. | Completed: replaced `$emit(...)` call sites with typed `emit(...)`.
| D27-006 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/task/TaskList.vue | N/A (typed emit usage) | **TaskList relies on `$emit` in templates despite typed emits:** `defineEmits<TaskListEmits>()` exists, but several template paths use `$emit` (including the create button and TaskCard event forwarding). | Completed: replaced template `$emit(...)` forwarding with typed `emit(...)`.
| D27-007 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/task/TaskHistory.vue | N/A (centralized parsing + fallback) | **Resolved:** TaskHistory now uses a centralized action normalizer/parser with explicit known-action mappings and a safe “unknown” fallback, instead of scattered substring heuristics. | Completed: introduced a typed `ParsedTaskHistoryAction` parser and switched `getActionType()` / `formatAction()` to operate on parsed kinds. |
| D27-008 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/task/TaskHistory.vue | N/A (null checks) | **Resolved:** value-change rendering no longer uses truthiness checks, so empty-string changes are rendered correctly. | Completed: replaced truthy `v-if` conditions with explicit null/undefined checks and added a user-visible “(empty)” formatting for empty strings. |

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
| D28-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/message/MessageList.vue | N/A (local date keys) | **Message date grouping is timezone-sensitive:** the list groups by `new Date(message.sentAt).toISOString().split('T')[0]` (UTC), and Today/Yesterday logic compares against `today.toISOString().split('T')[0]`. This can mis-group messages across day boundaries and mislabel “Today/Yesterday” for users outside UTC. | Completed: message grouping and Today/Yesterday labeling now use local calendar date keys derived from local date parts (no UTC `toISOString()`), preventing cross-timezone mislabels. |
| D28-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/message/MessageBubble.vue | N/A (safe initials computation) | **Initials computation can throw for whitespace-heavy names:** `senderInitials` splits on `' '` and assumes `parts[0][0]`/`parts[1][0]` exist. Inputs like `'  John'` or `'John  Doe'` can yield empty segments and trigger runtime errors when calling `toUpperCase()`. | Completed: `senderInitials` now trims and splits by whitespace, safely derives initials, and falls back to a placeholder when the name is empty. |
| D28-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/message/MessageInput.vue | N/A (composition guard) | **Enter-to-send can break IME composition:** `handleKeyDown()` sends on Enter when Shift is not held, but does not guard for composition (`event.isComposing` / keyCode 229). This can accidentally send partially composed text for IME users. | Completed: `handleKeyDown()` now bails out when composing (`event.isComposing` / keyCode 229) so Enter-to-send doesn’t fire mid-composition. |
| D28-004 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/message/MessageBubble.vue | N/A (typed emit usage) | **Template bypasses typed emitter:** the file attachment click uses `$emit('file-click', file)` even though typed emits are declared in `<script setup>`. | Completed: template now calls typed `emit('file-click', file)`.
| D28-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/message/MessageList.vue | N/A (typed emit usage) | **Template bypasses typed emitter:** `@file-click="(file) => $emit('file-click', file)"` uses `$emit` even though a typed `emit` exists. | Completed: file-click forwarding now uses typed `emit('file-click', file)`.
| D28-006 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/message/MessageList.vue / MessageBubble.vue | N/A (unused emits removed) | **Dead/unused emits in public interfaces:** `MessageListEmits` declares `message-read`, and `MessageBubbleEmits` declares `retry`, but neither event is emitted in the component. This creates misleading APIs and can hide missing behavior. | Completed: removed the unused `message-read` / `retry` events from the components’ emit contracts to keep the public API accurate. |
| D28-007 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/message/MessageBubble.vue | N/A (tokenized color) | **Hard-coded color token:** read-status styling uses a raw hex value (`#a7f3d0`) instead of design tokens, which undermines theming/high-contrast consistency. | Completed: replaced the raw hex with the design token `var(--color-success-200)`.

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
| D29-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/file/FileList.vue | N/A (consistent emit) | **“All Files” section tab does not emit `section-change`:** section buttons call `setActiveSection(section)` (which emits), but the “All Files” tab only mutates internal state (`activeSectionInternal = ''`). This can desync parent state (URL/query, persisted filters, etc.) from the component’s internal UI. | Completed: the “All Files” tab now routes through `setActiveSection('')`, ensuring `section-change` is emitted consistently. |
| D29-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/file/FileUploader.vue | N/A (keyboard-accessible drop zone) | **Drop zone is mouse-only (not keyboard-accessible):** the drop zone is a clickable `div` (`@click="triggerFileInput"`) without `role`, `tabindex`, or Space/Enter handling, so keyboard-only users can’t open the file picker via the primary control. | Completed: the drop zone now has `role="button"`, a focusable `tabindex`, and Enter/Space activation wired to `triggerFileInput()`. |
| D29-003 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/file/FileList.vue | N/A (typed emit + Space key) | **File row/card interaction is inconsistent and bypasses typed emits:** grid cards use `role="button"` with Enter only (no Space), and both grid + table use `$emit(...)` in templates even though typed `emit` exists. | Completed: all template emissions now use typed `emit(...)`, and the grid card + table row support Space key activation via `@keydown.space.prevent`. |
| D29-004 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/file/FileUploader.vue | N/A (safe preview cleanup) | **Preview cleanup is mismatched:** previews are created via `FileReader.readAsDataURL()` (data URLs), but cleanup calls `URL.revokeObjectURL(item.preview)`, which is meant for `URL.createObjectURL()` blobs. This is confusing and suggests memory cleanup is not actually happening as intended. | Completed: preview cleanup now revokes only real object URLs (`blob:`). Data URL previews are left alone (correct for `readAsDataURL()`), and the cleanup logic remains future-proof if previews later switch to `createObjectURL()`. |
| D29-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/file/FileUploader.vue | N/A (shared UUID generator) | **Resolved:** queue item IDs no longer use `Math.random()`; they now use the shared crypto-based `generateId()` utility for UUID v4 IDs. | Completed: removed the component-local `Math.random()` ID generator and reused `generateId()` from `src/shared/utils.ts`. |
| D29-006 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/file/FileList.vue | N/A (cached sort keys) | **Resolved:** date sorting no longer parses dates inside the comparator loop. | Completed: precomputed `uploadedAtMs` once per file before sorting and sorted using the cached numeric keys. |
| D29-007 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/file/FileList.vue | N/A (dead API removed) | **Resolved:** removed the unused `upload-click` emit and `.file-list-upload-btn` styles since no upload button exists in the template. | Completed: trimmed the dead emit/style surface to keep the component contract minimal and accurate. |

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
| D30-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/notification/NotificationList.vue | N/A (local-day grouping) | **Resolved:** date grouping and Today/Yesterday labeling now use local calendar date keys (not UTC `toISOString()`), preventing timezone day-boundary mislabeling. | Completed: replaced UTC ISO day keys with local `YYYY-MM-DD` keys derived from `getFullYear()/getMonth()/getDate()`. |
| D30-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/notification/NotificationList.vue | N/A (filter payload mapping) | **Resolved:** `filter-change` now emits a meaningful payload that matches the UI selection (unread/tasks/messages/projects). | Completed: mapped UI filters to `NotificationFilter` payloads (`isRead=false`, `type`, or `types` as appropriate) and emit the payload on changes. |
| D30-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/notification/NotificationList.vue | N/A (load-more gating) | **Resolved:** duplicate `load-more` emissions are prevented even with both IntersectionObserver and scroll fallback enabled. | Completed: introduced an internal in-flight gate shared by both triggers; the gate resets when `loadingMore` becomes false. |
| D30-004 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/notification/NotificationItem.vue / NotificationList.vue | N/A (Space key + typed emit) | **Resolved:** `NotificationItem` now supports Space-key activation, and `NotificationList` templates route events through the typed `emit(...)` handler instead of `$emit(...)`. | Completed: added `@keydown.space.prevent` for `role="button"` parity and replaced template `$emit(...)` call sites with typed `emit(...)` calls. |
| D30-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/notification/NotificationList.vue | N/A (typed filter key) | **Resolved:** filter state is now strongly typed to the allowed filter keys, making filter handling exhaustive and preventing typo-driven drift. | Completed: typed `activeFilter` as `'all' | 'unread' | 'task' | 'message' | 'project'`. |

**Positive Aspects:**
- `NotificationItem` has a clear, type-driven icon mapping and reasonable relative-time formatting.
- `NotificationList` has good UX primitives: skeleton loading, empty-state messaging, badge count, and compact mode.
- The list uses IntersectionObserver rather than relying only on scroll math.

**Group Notes:**
The main hardening areas were timezone-correct grouping (D30-001) and making the filter-change contract reliably convey the UI selection (D30-002); both are now addressed.

---

#### Group 7.6: Calendar Components
**Files Reviewed:**
- src/presentation/components/calendar/index.ts
- src/presentation/components/calendar/CalendarWidget.vue

**Score:** 6.6/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D31-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/calendar/CalendarWidget.vue | N/A (day-cell semantics) | **Resolved:** the day cell no longer exposes `role="button"`/`tabindex` while nesting real `<button>`s for projects/tasks. Day selection is now handled by a dedicated day-number `<button>` with an aria-label, avoiding nested interactive-control conflicts. | Completed: removed `role="button"` day-cell semantics and introduced a dedicated day-number button for accessible date selection while keeping inner item buttons intact. |
| D31-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/calendar/CalendarWidget.vue | N/A (combined cap) | **Resolved:** `maxProjectsPerDay` is now enforced across projects+tasks combined; the “+X more” indicator matches the number of hidden items. | Completed: computed `visibleProjects` and `visibleTasks` using a shared budget (`remaining = max - visibleProjects.length`) and derived `moreCount` from the combined total. |
| D31-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/components/calendar/CalendarWidget.vue | N/A (pre-bucketing) | **Resolved:** calendar day generation no longer filters the full arrays per-day with repeated `Date` parsing. | Completed: pre-bucketed projects/tasks by local day key in computed maps, and the 42-day grid now populates per day via map lookups. |
| D31-004 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/calendar/CalendarWidget.vue | N/A (stable keys) | **Resolved:** day keys no longer use UTC `toISOString()`; keys are stable local `YYYY-MM-DD` values. | Completed: introduced a local date key helper and used it for calendar-day keys (`day.key`). |
| D31-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/components/calendar/CalendarWidget.vue | N/A (no noisy logs) | **Resolved:** removed production-noisy `console.log` debug watcher. | Completed: deleted the deep/immediate projects watcher that logged counts and sample data. |

**Positive Aspects:**
- Clear separation of full vs mini display modes with sensible templates for both.
- Good aria-label coverage for day cells and navigation buttons; icon-only controls include labels.
- Click-outside behavior is implemented with proper add/remove lifecycle hooks.

**Group Notes:**
Main priorities were interaction semantics (avoid nested button patterns) and enforcing the combined per-day cap; performance was improved by pre-bucketing items rather than re-filtering for each day cell.

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
| D32-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/views/CalendarView.vue | N/A (bounded parallel load) | **Resolved:** task loading for the calendar no longer awaits per-project sequentially; it now fetches tasks with a small concurrency limit to reduce month-change latency and avoid “N+1 sequential” behavior. | Completed: implemented a bounded-parallel worker loop (concurrency 5) to load tasks for multiple projects concurrently while retaining per-project error handling. |
| D32-003 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/views/DashboardView.vue | N/A (Space key parity) | **Resolved:** upcoming-deadlines items now support Space-key activation in addition to Enter. | Completed: added `@keydown.space.prevent` alongside Enter to keep keyboard parity for `role="button"` deadline items. |
| D32-004 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | src/presentation/views/ProjectListView.vue | N/A (filter updated) | **Status filtering is broken due to enum/value mismatch:** the status filter used lowercase values (`active`, `finalized`) while `ProjectSummaryDto.status` uses `ProjectStatus` enum values (`'ACTIVE'`, `'FINALIZED'`, etc.), so `p.status === statusFilter.value` never matched. **Resolved:** the status select is now bound to `ProjectStatus` values and the filter state is typed accordingly. | Completed: bound status option values to `ProjectStatus.*` and typed `statusFilter` as `ProjectStatus | ''`. |
| D32-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/views/ProjectListView.vue | N/A (sort keys precomputed) | **Sorting repeatedly constructed `Date` objects:** the comparator created `new Date(...)` repeatedly during sorting and every reactive re-run. **Resolved:** projects are now mapped to precomputed numeric timestamp sort keys once per computed evaluation, and the comparator uses those keys. | Completed: added `projectsWithSortKeys` mapping (`deliveryDateMs`/`createdAtMs`/`updatedAtMs`) and sorted using those cached values. |
| D32-006 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/views/ProjectDetailsView.vue | 39-76, 65, 145, 190, 214 | **Tabs a11y wiring is incomplete:** panels used `aria-labelledby="overview-tab"` etc., but the corresponding tab buttons did not define matching `id` attributes, breaking the tab/tabpanel relationship for assistive technologies. **Resolved:** tab buttons now set `:id="`${tab.key}-tab`"` so each tabpanel’s `aria-labelledby` points to a real element. | Completed: added `:id="`${tab.key}-tab`"` to the tab buttons; existing `aria-labelledby="${key}-tab"` panel wiring now resolves correctly. |
| D32-007 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/views/ProjectDetailsView.vue | 1117-1162 | **Manual token handling + `window.open` hardening:** file download/preview pulled the token from `localStorage`, called `fetch` directly (bypassing the central HTTP client), and opened a new tab via `window.open(downloadUrl, '_blank')` without `noopener/noreferrer`, enabling reverse-tabnabbing if a malicious page is opened. **Resolved:** download/preview now requests links via the shared HTTP client (no direct storage reads), and new-tab navigation is hardened (`noopener,noreferrer` + `opener=null`, protocol validated). | Completed: added `useFiles()` helpers (`getTemporaryDownloadUrl`, `getPreviewUrl`) that call the authenticated HTTP client; `ProjectDetailsView` uses them and opens URLs via a safe wrapper (`noopener,noreferrer`, `opener=null`, http/https-only). |
| D32-008 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/views/SettingsView.vue | N/A (user-scoped keys + hydrate) | **Resolved:** role-specific settings are now persisted under per-user `localStorage` keys, preventing cross-account preference leakage on shared devices. | Completed: namespaced keys by authenticated user id (`cpm_settings:<userId>:<namespace>`) and hydrate role-specific forms from user-scoped storage when the user is available. |
| D32-009 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/views/BackupView.vue | N/A (wired to backend APIs) | **Resolved:** BackupView no longer simulates critical admin operations. Manual backup creation, history loading, restore/delete, schedule persistence, download, and Dropbox sync now call real backend endpoints (no `setTimeout`, `Math.random()`, or `alert(...)` success flows). | Completed: wired BackupView to `/backup/*` endpoints; added backend schedule + download + Dropbox sync routes and a persisted runtime config used by the scheduler. |
| D32-010 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/presentation/views/ForbiddenView.vue / NotFoundView.vue | N/A (tokenized styles) | **Resolved:** error pages no longer use hard-coded gradients/hex values; styling now references the existing CSS design tokens, improving theme consistency and high-contrast support. | Completed: replaced hard-coded gradient + button colors with CSS variables (tokens) and switched the hover shadow and border radius to the shared token values. |

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
| D33-003 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/App.vue; src/presentation/views/BackupView.vue | N/A (typed InjectionKey) | **Resolved:** toast `provide/inject` no longer uses a string key; it now uses a typed `InjectionKey`, improving type-safety and avoiding collisions. | Completed: added `TOAST_KEY` and updated `provide(TOAST_KEY, addToast)` / `inject(TOAST_KEY)` call sites. |
| D33-004 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/App.vue | N/A (UUID + timer teardown) | **Resolved:** toast IDs no longer use `Date.now()`/`Math.random()` and auto-dismiss timers are tracked and cleared on removal/unmount, preventing late updates in teardown/HMR/tests. | Completed: toast IDs now use the shared crypto-based `generateId()` and timeout handles are stored/cleared deterministically. |
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
| D34-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/presentation/stores/index.ts | N/A (unused helper removed) | **Resolved:** removed the unused, weakly-typed WebSocket wiring helper (`setupStoreWebSocketListeners(socketHandler?: any)`) from the stores module to avoid drift from the real WebSocket API surface. | Completed: deleted the dead-code helper from `src/presentation/stores/index.ts` so the module no longer exports `any`-typed, stringly-typed `.on(...)` event wiring. |
| D34-003 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/{application,domain,presentation,infrastructure}/**/index.ts | N/A (header template) | **Frontend barrel exports now follow the standard University/TFG header template:** replaced the smaller `@module` blocks with the same header convention used across the rest of the TypeScript codebase, improving documentation consistency and auditability. | Completed: standardized header blocks (including correct `@file` paths) across the affected frontend barrel exports. |
| D34-004 | 🟢 LOW ✅ RESOLVED (2026-03-08) | backend/src/**/index.ts | N/A (`@file` paths) | **Backend barrel file header metadata is now consistent:** backend barrel/index modules use repo-relative `@file backend/src/...` paths, improving auditability and navigation. | Completed: aligned backend barrel headers so `@file` matches the real repo-relative path. |

**Positive Aspects:**
- Barrel exports are generally well-organized by layer and feature area (Application/Domain/Infrastructure/Presentation), improving discoverability.
- Frontend component indexes export both SFC components and their props/emits types, which helps keep consumer code type-safe.
- Backend indexes consistently use explicit `.js` extensions, which is compatible with Node ESM + TS `NodeNext`-style setups.

**Group Notes:**
The findings are primarily about keeping barrel exports purely declarative and keeping header metadata consistent.

---

#### Group 9.3: Public Assets
**Files Reviewed:**
- public/apple-touch-icon.png
- public/favicon.ico
- public/pwa-192x192.png
- public/pwa-512x512.png
- public/robots.txt

**Score:** 7.2/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D35-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | public/ | N/A (assets) | **PWA icon assets are now shipped and referenced consistently:** added `favicon.ico`, `apple-touch-icon.png`, `pwa-192x192.png`, and `pwa-512x512.png` under `public/`, and updated the app/manifest references so icon requests succeed and the PWA install experience matches the configured metadata. | Completed: added the icon assets to `public/`, updated `index.html` icon links to be base-path friendly, and populated the PWA manifest `icons` + `includeAssets` list.
| D35-002 | 🟢 LOW ✅ RESOLVED (2026-03-08) | public/robots.txt | N/A (policy) | **Robots policy is now restrictive by default:** for an authenticated SPA, defaulting to `Disallow: /` avoids accidental indexing of non-public routes. | Completed: updated `robots.txt` to disallow crawling by default. If indexing is intended, relax the policy intentionally (and consider environment-specific behavior for staging vs production).
| D35-003 | 🟢 LOW ✅ RESOLVED (2026-03-08) | public/ | N/A (served content) | **Internal notes are no longer shipped as public assets:** removed the `.gitkeep` notes file from `public/` so it won’t be copied into the build output. | Completed: moved the notes into project docs and removed `public/.gitkeep`.

**Positive Aspects:**
- `robots.txt` exists (better than missing) and won’t block the app from being indexed when intentional.
- The PWA icon assets are now explicitly declared and shipped, improving install/UX consistency.

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
| D36-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | src/vite-env.d.ts / src/main.ts / src/shared/constants.ts / src/infrastructure/websocket/socket.handler.ts | N/A (typing aligned) | **Resolved:** Vite env typings now match actual usage across the frontend: `ImportMetaEnv` declares `VITE_SOCKET_URL` and `VITE_APP_VERSION` (and keeps `VITE_API_BASE_URL`), eliminating the prior naming drift (`VITE_WS_BASE_URL`) and restoring type-safety for env access. | Completed: updated `src/vite-env.d.ts` to declare `VITE_SOCKET_URL` and `VITE_APP_VERSION` and removed the stale `VITE_WS_BASE_URL` entry.
| D36-002 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/src/shared/types.ts | N/A (boundary typing aligned) | **Resolved:** pagination query inputs are no longer typed as numbers at the HTTP boundary. `PaginationQuery.page` / `limit` now reflect real Express query inputs (strings/arrays), and numeric pagination is obtained via explicit parsing/validation (e.g., `parsePagination`). | Completed: updated `PaginationQuery` to accept string/array query values and rely on dedicated parsing utilities to produce validated numeric pagination shapes.
| D36-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-07) | backend/src/shared/types.ts | N/A (UserRole typing) | **Roles are no longer stringly typed:** shared auth request/JWT shapes now use Prisma `UserRole`, reducing authorization drift risk. | Completed: updated shared backend role fields to `UserRole`.
| D36-004 | 🟢 LOW ✅ RESOLVED (2026-03-07) | backend/src/shared/types.ts | N/A (header already aligned) | **Header metadata aligned:** the shared backend types header now correctly uses `@file backend/src/shared/types.ts`. | Completed: header `@file` matches the real repo-relative path.
| D36-005 | 🟢 LOW ✅ RESOLVED (2026-03-08) | src/vite-env.d.ts | N/A (header template) | **Type definition file now follows the standard header convention:** `vite-env.d.ts` uses the same University/TFG header template as the rest of the TypeScript sources, improving consistency. | Completed: replaced the `@module` block with the standard header (keeping the Vite reference directive intact).

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
| D37-001 | 🔴 CRITICAL ✅ RESOLVED (2026-03-10) | backend/.env.railway (history) | N/A (history purge) | **Resolved:** the previously committed backend environment file (`backend/.env.railway`) was removed from git history and garbage-collected locally so secret material is no longer present in the repository’s commit graph. The backend now tracks only templates (`backend/.env.example`, `backend/.env.railway.example`) and ignores real env files via `backend/.gitignore`. **Important note:** even after history purge, any secrets that were ever committed must still be treated as compromised and rotated/revoked in the relevant provider dashboards. | Completed: rewrote git history to remove `backend/.env.railway` from all refs and ran `git gc --prune=now` to purge objects locally. Remaining manual incident response: rotate/revoke any affected credentials, force-push rewritten history to the remote, and ensure all clones/forks are updated.
| D37-002 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/railway.json / backend/nixpacks.toml | N/A (start commands updated) | **Production deploy seeds on every start:** Railway/Nixpacks startup commands ran `prisma:seed:production` on each process start. **Resolved:** deploy start commands now run migrations + start the server only; production seeding is no longer executed on every restart. | Completed: removed `npm run prisma:seed:production` from Railway and Nixpacks start commands; keep seeding as an explicit/manual operation when needed. |
| D37-003 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | jest.config.js / jest.setup.cjs / package.json / eslint.config.mjs | N/A (Jest harness fixed) | **Frontend Jest configuration likely broken in ESM + Vue 3 setup:** setup file used CommonJS `require(...)` under an ESM package, config used a non-standard `setupFilesAfterSetup`, and the Vue transformer dependency was missing. **Resolved:** Jest now runs successfully under the ESM project setup. | Completed: switched setup/mocks to `.cjs`, updated config to `setupFilesAfterEnv`, enabled `ts-jest` ESM preset, and added the missing Vue transformer dependencies (`@vue/vue3-jest`, `babel-jest`, `@babel/core`). Follow-up: ESLint flat config now treats Jest `.cjs` setup/mocks as CommonJS (Node/CommonJS globals), keeping `npm run lint` at 0 errors. |
| D37-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-06) | .env.example | N/A (template updated) | **Frontend env template encouraged client-side third-party access tokens:** `.env.example` included `VITE_DROPBOX_ACCESS_TOKEN`, reinforcing a pattern of putting long-lived third-party credentials in browser config. **Resolved:** the variable and guidance were removed from the frontend template. | Completed: remove the client-side token variable from `.env.example` and keep Dropbox credentials backend-only. |
| D37-005 | 🟢 LOW ✅ RESOLVED (2026-03-09) | playwright.config.ts | N/A (env override) | **Resolved:** Playwright `baseURL` is no longer hard-coded; it can be overridden via environment variable for CI/staging workflows while keeping the localhost default. | Completed: updated `baseURL` to use `process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173'`.

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
| D38-002 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/prisma/seed-production.ts | N/A (seed hardened) | **Production seeding uses a predictable default admin password and prints it:** the seed used a fixed password (`REDACTED`) and printed it to stdout. **Resolved:** seeding now requires `SEED_ADMIN_PASSWORD` (and optionally `SEED_ADMIN_EMAIL`) and does not log the password. | Completed: removed default password, require env-provided password, and avoid logging credentials in seed output. |
| D38-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/prisma/seed.ts; backend/.env.example | N/A (startup guard added) | **Destructive seed without environment guard:** the dev seed cleared all tables via `deleteMany()` calls. If executed against a non-dev database, it could cause full data loss. **Resolved:** the dev seed now fails fast unless `NODE_ENV === 'development'` and `SEED_CONFIRM=I_UNDERSTAND` is explicitly set. | Completed: added a hard environment guard + explicit confirmation gate before any deletes, and documented `SEED_CONFIRM` in the backend env template. |
| D38-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-10) | backend/prisma/schema.prisma; backend/src/presentation/controllers/message.controller.ts | Message model; MessageController.create | **Resolved (documented + enforced):** `Message.readByUserIds` and `Message.fileIds` remain denormalized `String[]` fields for simplicity, but they are explicitly documented in the Prisma schema and enforced as set-like collections in application code. `fileIds` are de-duplicated and validated to reference existing `File` rows in the same project before persistence. | Completed: documented denormalization tradeoff in schema, enforced `fileIds` de-duplication and project-scoped existence validation on message create. Follow-up (optional): normalize to join tables if/when message volume or read-tracking queries require it. |
| D38-005 | 🟢 LOW ✅ RESOLVED (2026-03-10) | backend/prisma/schema.prisma | Permission/AuditLog models | **Resolved (explicit design rationale):** `Permission.grantedBy` and `AuditLog.userId` remain non-relational attribution fields, but are now explicitly documented as intentionally not modeled as relations to preserve historical/audit data even if users are deleted. Application code is responsible for writing consistent IDs (e.g., `grantedBy` is sourced from the authenticated user). | Completed: documented the non-relational attribution design and rationale in the Prisma schema. |

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
| D39-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-08) | backend/restart-backend.sh / backend/update-dropbox-token.sh | N/A (pidfile + relative paths) | **Resolved:** scripts no longer use broad `pkill -9 node` (which can kill unrelated Node processes) or hard-coded absolute paths. Backend restart now uses a pidfile-based stop/start and script-relative paths for portability and safer process management. | Completed: added pidfile-based process management (`.dev-server.pid`), removed hard-coded paths, and avoided `-9` in both scripts. |
| D39-004 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | backend/setup.sh | N/A (dev-only guards) | **Resolved:** the backend setup script no longer runs potentially destructive Prisma commands (`db pull --force` / `db push`) without safeguards. | Completed: removed the `db pull --force` / `db push` connection logic, added a dev-only guard (`NODE_ENV=development` required), printed masked DB target info (host + masked `DATABASE_URL`), required explicit confirmation (`SETUP_CONFIRM=I_UNDERSTAND`), and uses `prisma migrate status` as a non-destructive connectivity check.
| D39-005 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | backend/test-dropbox.sh | N/A (jq + status codes) | **Resolved:** Dropbox test script now uses the real seeded credentials and robust JSON parsing instead of brittle greps. | Completed: fixed the seeded admin email (`admin@cartographic.com`), added prerequisites for `curl`/`jq`, switched requests to reliable HTTP status capture, and parses tokens/IDs via `jq` with clear failure messages.
| D39-006 | 🟢 LOW ✅ RESOLVED (2026-03-09) | backend/test-upload-endpoint.sh | N/A (status capture + prerequisites) | **Resolved:** the upload endpoint test script now validates tool dependencies and uses reliable HTTP status capture instead of grepping `curl -v` output. | Completed: added prerequisite checks for `curl`/`jq`, switched requests to `curl -sS -o <file> -w '%{http_code}'` for status handling, and made JSON parsing tolerant of both `data.*` and top-level response shapes. |
| D39-007 | 🟢 LOW ✅ RESOLVED (2026-03-09) | backend/test-large-upload.ts / backend/scripts/check-messages.ts | N/A (import + header) | **Resolved:** backend utility scripts now follow the repo’s expected ESM import convention and header template usage. | Completed: updated `test-large-upload.ts` to import `DropboxService` using the `.js` extension (consistent with other backend ESM imports), and added the standard University/TFG file header template to `backend/scripts/check-messages.ts`.

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
| D40-001 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | README.md / backend/README.md / docs/development/INTEGRATION.md / docs/tasks/TODO-STATUS.md | N/A (links updated) | **Resolved:** documentation links were updated to match the current docs layout under `docs/development/`, `docs/deployment/`, `docs/tasks/`, and `docs/testing/`, removing broken-path drift. | Completed: fixed README links to architecture/Dropbox docs; updated backend README docs links; corrected integration guide relative links to backend docs and frontend architecture.
| D40-002 | 🟠 HIGH ✅ RESOLVED (2026-03-07) | backend/README.md / docs/development/INTEGRATION.md | N/A (docs aligned) | **Authentication storage guidance conflicts (security posture drift):** backend README claimed “Tokens are httpOnly cookies” while the integration guide documents token persistence in `localStorage` and Bearer-token headers. **Resolved:** docs now consistently describe the implemented Bearer-token flow (tokens returned in JSON; clients send `Authorization: Bearer <token>`). | Completed: updated backend README and integration guide to match the current auth model. |
| D40-003 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | docs/development/INTEGRATION.md / docs/development/BACKEND-IMPLEMENTATION.md / docs/tasks/TODO-STATUS.md | N/A (docs aligned) | **Resolved:** docs now consistently describe the current integration status: frontend repositories/stores call the real backend API endpoints (no mock “awaiting implementation” guidance). | Completed: removed stale “mock auth/stores” guidance from `BACKEND-IMPLEMENTATION.md` and updated `TODO-STATUS.md` to reflect completed integration, with links pointing to the integration docs.
| D40-004 | 🟠 HIGH ✅ RESOLVED (2026-03-06) | docs/testing/TESTING-FILE-UPLOAD-UI.md / docs/development/DROPBOX-INTEGRATION.md | N/A (docs updated) | **Docs included token-like secret material and encouraged client-side secrets:** one doc showed a token-like prefix and another suggested using `VITE_DROPBOX_ACCESS_TOKEN` in frontend env. **Resolved:** token-like strings were replaced with placeholders and frontend-token guidance was removed. | Completed: docs now use placeholders and explicitly state Dropbox credentials are backend-only. |
| D40-005 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | docs/testing/DEBUGGING-AUTH-ERRORS.md | N/A (endpoint aligned) | **Resolved:** debugging guidance now calls the correct health endpoint under the API prefix (`/api/v1/health`). | Completed: updated the health-check curl example to use `/api/v1/health`.
| D40-006 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | backend/SETUP.md / docs/testing/TESTING-FILE-UPLOAD-UI.md | N/A (endpoint aligned) | **Resolved:** backend setup documentation now matches the implemented upload route (`POST /api/v1/files/upload`), eliminating endpoint drift across docs. | Completed: updated `backend/SETUP.md` to document `POST /api/v1/files/upload` consistently with the testing guide.
| D40-008 | 🟡 MEDIUM ✅ RESOLVED (2026-03-09) | docs/deployment/RAILWAY-DEPLOYMENT.md / docs/development/IMPLEMENTATION-SUMMARY.md | N/A (posture aligned) | **Resolved:** deployment docs now consistently describe Dropbox as optional, and the Railway start pipeline remains “migrate + start” (no seed-on-start). | Completed: updated Railway docs to label Dropbox env vars as optional (local uploads remain available) and updated the implementation summary to reflect the same optional posture.

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
- [x] **D37-001** - Backend `.env` contains real Dropbox credentials (resolved in-repo via history purge; secrets still require rotation/revocation)

### High Issues (Should Fix)
- [x] **D1-001** - Domain enums contain UI mappings; move to Presentation/Shared
- [x] **D3-001** - Domain entities implement API-facing `toJSON()`; move mapping out of Domain
- [x] **D4-001** - Backend “Domain” repository interfaces depend on Prisma types (`@prisma/client`)
- [x] **D4-002** - Frontend repository interfaces import enums from wrong modules
- [x] **D5-001** - DTOs use `Date` types across (likely) JSON boundaries; define transport-safe date types + mappers
- [x] **D7-002** - Authorization service role mismatch + admin delete bug (commented-out check)
- [x] **D7-003** - Backend backup uses `exec` with interpolated secrets/params (command injection + leakage risk)
- [x] **D7-004** - Frontend authentication service mixes mock auth + missing import/type escapes
- [x] **D8-001** - HTTP client retry path can crash when `error.config` is missing
- [x] **D8-002** - HTTP client refresh failure can leave requests hanging
- [x] **D10-002** - Frontend Dropbox service uses access token client-side (secret exposure risk)
- [x] **D11-001** - Frontend repositories mis-detect Axios 404 and throw instead of returning null
- [x] **D13-001** - Deadline reminder scheduler creates a separate PrismaClient and never disconnects
- [x] **D15-001** - Frontend `generateId()` uses `Math.random()`; use crypto-safe UUIDs
- [x] **D18-001** - Auth store persists access/refresh tokens in `localStorage` (XSS exfiltration risk)
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
- [x] **D1-002** - TaskPriority includes `URGENT` not in requirements
- [x] **D1-003** - TaskStatus naming/transitions may diverge from FR11/FR12
- [x] **D1-004** - ProjectStatus lifecycle may diverge from requirements
- [x] **D2-001** - Coordinate representation inconsistent across layers
- [x] **D2-002** - Backend GeoCoordinates equality too strict
- [x] **D3-003** - Domain entity factories generate IDs with `Date.now()`/`Math.random()`
- [x] **D3-004** - Dropbox coupling + optional/required type mismatch (`dropboxFolderId`/`dropboxPath`)
- [x] **D3-005** - `updatedAt` not consistently updated in User setters
- [x] **D3-006** - `User.authenticate()` throws and is unsafe placeholder behavior
- [x] **D3-008** - Message `senderRole` is `string` (should align with `UserRole`)
- [x] **D3-009** - Permission `sectionAccess` accepts arbitrary strings (should be typed/validated)
- [x] **D4-003** - Repository interfaces are “fat” and leak query patterns
- [x] **D4-004** - TaskHistory action filtering uses untyped `string`
- [x] **D5-002** - DTOs include UI/view-model fields (`statusColor`, `isOverdue`, `can*`) without clear boundary
- [x] **D5-003** - Vendor coupling in DTO contracts (Dropbox naming)
- [x] **D5-004** - Weakly typed DTO fields (`statusColor: string`, `action: string`) encourage drift
- [x] **D6-001** - Service interface error contracts rely on `@throws` without typed/shared error model
- [x] **D6-002** - Application service interfaces couple directly to Dropbox concepts
- [x] **D6-003** - Authorization service interface is fat and returns `Set<AccessRight>`
- [x] **D7-005** - Project service coordinate truthiness checks + empty-string Dropbox folder IDs
- [x] **D7-006** - File service uses string section default + builds Dropbox paths from unsanitized inputs
- [x] **D7-007** - Deadline reminders use string notification types and lack idempotency
- [x] **D7-008** - Backend export coordinate truthiness checks skip valid `0` coordinates
- [x] **D8-003** - HTTP client `cancelAllRequests()` abort logic is not wired/initialized
- [x] **D8-004** - HTTP client response typing relies on unsafe casts; upload response generics inconsistent
- [x] **D9-002** - WebSocket client reconnect uses stale token; not token-rotation aware
- [x] **D9-004** - WebSocket client `ConnectionOptions.token` type doesn’t match implementation fallback
- [x] **D10-003** - Frontend Dropbox metadata mapping can yield invalid dates for folders
- [x] **D10-004** - Backend Dropbox service swallows broad errors (createFolder/pathExists)
- [x] **D11-002** - Frontend repositories interpolate unencoded query strings (fragile for ISO dates)
- [x] **D11-003** - Backend TaskRepository returns `any` and leaks augmented shapes
- [x] **D12-001** - Frontend TokenStorage stores JWTs in localStorage (XSS exfiltration risk)
- [x] **D13-002** - Backup scheduler can start with empty `DATABASE_URL` config
- [x] **D13-003** - Auth middleware role authorization is stringly-typed
- [x] **D14-002** - Frontend/backend upload constraints diverge (size + MIME/type lists)
- [x] **D14-003** - Backend config defaults fail open (empty DB URL, debug logging)
- [x] **D15-002** - Backend `parsePagination()` can propagate `NaN` for invalid query params
- [x] **D15-003** - Backend auth roles are stringly-typed in shared request/JWT types
- [x] **D15-004** - Frontend `deepClone()` is unsafe beyond plain objects
- [x] **D16-001** - CSS imports Google Fonts via `@import` (privacy/CSP + render-blocking)
- [x] **D17-001** - Post-login redirect is not validated before `router.push(redirect)`
- [x] **D17-002** - Router project-access guard uses brittle DTO assumptions + client-side auth logic
- [x] **D18-002** - Auth session expiry is estimated/recomputed on reload (doesn’t use JWT `exp`/server truth)
- [x] **D18-003** - Project store permissions rely on `any` + hidden `creatorId` field (DTO drift risk)
- [x] **D18-004** - Project store summary mapping creates N+1 backend request pattern
- [x] **D18-005** - Message store pagination/read-state are inconsistent with backend operations
- [x] **D18-006** - Notification store localStorage persistence isn’t user-scoped and doesn’t hydrate on init
- [x] **D19-001** - useAuth pushes unvalidated `redirect` query and duplicates redirect mechanisms
- [x] **D19-002** - File upload composable relies on `any` + inconsistent response envelope extraction
- [x] **D20-001** - Backend CORS config must be strict allowlist when credentials are enabled
- [x] **D20-002** - Backend morgan `dev` logging is not environment-gated
- [x] **D20-003** - Backend app bootstrap lacks visible rate limiting/brute-force protections
- [x] **D21-001** - Backend routes don’t express authorization policy consistently (auth-only)
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
- [x] **D25-001** - Layout sidebar navigation is not permission-aware (admin-only links shown to all)
- [x] **D25-002** - Layout header user dropdown lacks click-outside/Escape dismissal behavior
- [x] **D26-001** - ProjectSummary clickable tiles are not keyboard-accessible
- [x] **D26-002** - ProjectForm date-only inputs can shift by timezone (UTC formatting)
- [x] **D26-003** - ProjectCard mixes event emission with internal navigation
- [x] **D27-001** - TaskList priority sort label/order mismatch
- [x] **D27-002** - TaskForm date-only dueDate can shift by timezone (UTC formatting)
- [x] **D27-003** - TaskForm compares TaskStatus via string literals

- [x] **D28-001** - MessageList groups dates via UTC `toISOString()` (Today/Yesterday mislabels)
- [x] **D28-002** - MessageBubble senderInitials can throw on whitespace-heavy names
- [x] **D28-003** - MessageInput Enter-to-send lacks IME composition guard

- [x] **D29-001** - FileList “All Files” tab doesn’t emit section-change (state desync risk)
- [x] **D29-002** - FileUploader drop zone is not keyboard-accessible (clickable div)

- [x] **D30-001** - NotificationList groups dates via UTC `toISOString()` (Today/Yesterday mislabels)
- [x] **D30-002** - NotificationList filter-change payload doesn’t match UI selection
- [x] **D30-003** - NotificationList can emit duplicate load-more events (observer + scroll)

- [x] **D31-001** - CalendarWidget day cell nests buttons inside `role="button"` (a11y/interaction conflict)
- [x] **D31-002** - CalendarWidget `maxProjectsPerDay` cap not enforced across projects+tasks
- [x] **D31-003** - CalendarWidget day generation filters arrays per-day with repeated date parsing (O(42*n))

- [x] **D32-002** - CalendarView loads tasks with sequential per-project requests (N+1 risk)
- [x] **D32-006** - ProjectDetailsView tabs: `aria-labelledby` references missing tab IDs
- [x] **D32-007** - ProjectDetailsView download/preview bypass HTTP client + missing `noopener` on `window.open`
- [x] **D32-008** - SettingsView saves role settings to non-user-scoped `localStorage` keys
- [x] **D32-009** - BackupView backup/schedule/Dropbox actions are simulated stubs (prod risk)

- [x] **D33-001** - App WebSocket connect can be initiated twice (bootstrap + auth watcher)
- [x] **D33-002** - App WebSocket debug/logging is not environment-gated (production noise/leakage)
- [x] **D33-005** - Backend shutdown is not idempotent and doesn’t guard cleanup failures

- [x] **D34-002** - Stores index contains weakly-typed WebSocket wiring helper (drift/dead-code risk)

- [x] **D35-001** - Public folder appears to be missing referenced PWA/icon assets

- [x] **D36-001** - Env var typing/naming drifts from actual usage (VITE_SOCKET_URL/VITE_APP_VERSION)
- [x] **D36-002** - PaginationQuery types don’t match Express query strings (misleading)
- [x] **D36-003** - Backend auth/JWT role fields are stringly-typed (drift risk)

- [x] **D37-004** - Frontend `.env.example` encourages client-side Dropbox access token

- [x] **D38-003** - Dev seed clears all tables without an environment/DB safety guard
- [x] **D38-004** - Message read receipts/attachments stored as string arrays (no FK, scaling risk)

- [x] **D39-003** - Scripts use `pkill -9 node` and hard-coded paths (unsafe/non-portable)
- [x] **D39-004** - Backend setup script runs `prisma db pull --force` / `db push` without safety checks
- [x] **D39-005** - Dropbox test script uses wrong seeded email + brittle token parsing

- [x] **D40-001** - Broken doc links due to docs path drift
- [x] **D40-003** - Docs conflict on whether frontend integration is complete
- [x] **D40-005** - Debug guide uses wrong health endpoint (`/health` vs `/api/v1/health`)
- [x] **D40-006** - Backend setup docs list wrong file upload endpoint
- [x] **D40-008** - Dropbox mandatory/optional + Railway start pipeline guidance inconsistent

- [x] **D41-002** - Stray ad-hoc DB query output committed as a file


### Low Issues (Optional Fix)
- [x] **D2-003** - Backend GeoCoordinates should reject NaN/Infinity
- [x] **D3-007** - Task serialization omits `creatorName`/`assigneeName`
- [x] **D3-010** - Permission uses `Set` in props (prefer array at DTO boundaries)
- [x] **D4-005** - Backend repository interfaces lack consistent per-method docs
- [x] **D5-005** - DTO modules include helper/factory functions (consider separating)
- [x] **D5-006** - Duplicate user DTO shapes + header inconsistency in `user-data.dto.ts`
- [x] **D6-004** - Project service calendar query takes `Date` parameters (ensure transport-safe mapping)
- [x] **D8-005** - HTTP client leaves `console.log` statements in delete path
- [x] **D9-003** - WebSocket client/server include `console.*` debug logs in production paths
- [x] **D10-005** - Backend Dropbox service uses `console.log` in infra paths
- [x] **D11-004** - Repositories contain `console.*` debug logs in core paths
- [x] **D11-005** - Frontend UserRepository mixes paradigms and inconsistent error handling
- [x] **D11-006** - Backend AuditLogRepository may propagate sensitive error details
- [x] **D12-002** - TokenStorage imports `ITokenStorage` from HTTP client module (coupling risk)
- [x] **D12-003** - Prisma query logging and `as never` casts in event hooks
- [x] **D13-004** - JWT service uses `as any` for `expiresIn` config
- [x] **D13-005** - Optional auth swallows invalid tokens silently
- [x] **D14-004** - Backend constants call `dotenv.config()` at import time
- [x] **D14-005** - Backend constants header `@file` path mismatch
- [x] **D15-005** - Backend logger console formatter can throw on circular metadata
- [x] **D15-006** - Backend shared file headers have repeated `@file` path mismatches
- [x] **D16-002** - High-contrast override uses hard-coded `#000` instead of tokens
- [x] **D16-003** - Global `*` reset includes margin/padding zero (potential side-effects)
- [x] **D17-003** - Router uses `console.*` in core navigation/guard paths
- [x] **D18-007** - Stores contain noisy `console.*` debug logs and leave unused WebSocket unsubscribe
- [x] **D19-003** - Tasks composable duplicates transition semantics and uses broad “pending” counter
- [x] **D19-004** - Composable permission checks are UX-only; avoid treating them as authorization
- [x] **D20-004** - Backend app bootstrap header `@file` path mismatch
- [x] **D21-004** - Backend route module headers use wrong `@file` paths
- [x] **D22-007** - Controllers parse query/path inputs without strict validation
- [x] **D22-008** - Backend controller module headers use wrong `@file` paths
- [x] **D23-003** - Backend middleware module headers use wrong `@file` paths
- [x] **D24-005** - AppCard clickable a11y: missing Space key activation
- [x] **D24-006** - UI components generate IDs via `Math.random()` (SSR/test instability)
- [x] **D24-007** - Common components use `$emit` instead of typed `emit` in `<script setup>` templates
- [x] **D24-008** - LoadingSpinner has dead `overlay` prop + hard-coded color fallbacks
- [x] **D24-010** - Common components header templates are inconsistent
- [x] **D25-003** - Layout components use `$emit`/`$router` instead of typed `emit`/`router`
- [x] **D37-005** - Playwright baseURL is hard-coded to localhost:5173
- [x] **D38-005** - Audit/permission attribution fields are not relationally enforced

- [x] **D39-006** - Upload endpoint test script assumes `jq` + brittle status detection
- [x] **D39-007** - Script hygiene inconsistencies (headers, ESM import conventions)
- [x] **D25-004** - Layout AppSidebar has unused `computed` import
- [x] **D25-005** - Layout components header templates are inconsistent
- [x] **D26-004** - ProjectCard role="button" lacks Space key activation
- [x] **D26-005** - ProjectForm Cancel uses `$emit` instead of typed `emit`
- [x] **D26-006** - ProjectForm generateCode() can collide (Math.random)
- [x] **D26-007** - ProjectSummary delete button lacks aria-label; statusLabel lacks fallback
- [x] **D27-004** - TaskCard role="button" lacks Space key activation; draggable interaction ambiguity
- [x] **D27-005** - TaskForm templates use `$emit` instead of typed `emit` (cancel/remove-file)
- [x] **D27-006** - TaskList templates use `$emit` instead of typed `emit` for forwarding
- [x] **D27-007** - TaskHistory action rendering relies on substring parsing of `action`
- [x] **D27-008** - TaskHistory value-change rendering uses truthiness checks

- [x] **D28-004** - MessageBubble uses `$emit` in template for file-click (typed emit bypass)
- [x] **D28-005** - MessageList uses `$emit` in template for file-click (typed emit bypass)
- [x] **D28-006** - Message components declare unused emits (`retry`/`message-read`)
- [x] **D28-007** - MessageBubble uses hard-coded hex color for read status

- [x] **D29-003** - FileList clickables miss Space key and bypass typed emits (`$emit`)
- [x] **D29-004** - FileUploader preview cleanup uses revokeObjectURL with data URLs
- [x] **D29-005** - FileUploader queue IDs use `Math.random()` (collision/test fragility)
- [x] **D29-006** - FileList sorting repeatedly constructs Date objects in comparator
- [x] **D29-007** - FileList has unused upload-click emit + unused upload button styles

- [x] **D30-004** - Notification a11y/consistency: missing Space key + `$emit` in templates
- [x] **D30-005** - NotificationList activeFilter is weakly typed (string)

- [x] **D31-004** - CalendarWidget uses `toISOString()` for day keys (timezone/DST sensitivity)
- [x] **D31-005** - CalendarWidget includes noisy `console.log` debug watcher for projects

- [x] **D32-003** - DashboardView clickable deadline items miss Space key activation
- [x] **D32-005** - ProjectListView sorts by repeatedly constructing `Date` objects in comparator
- [x] **D32-010** - Forbidden/NotFound views use hard-coded colors/gradients instead of tokens

- [x] **D33-003** - App toast `provide()` uses string injection key (type-safety/collision risk)
- [x] **D33-004** - App toast IDs use `Math.random()` and timers aren’t tracked for teardown
- [x] **D33-006** - Backend server header `@file` mismatch + unhandledRejection casts unknown to Error
- [x] **D33-007** - main.ts unhandledrejection handler suppresses default browser reporting

- [x] **D34-003** - Frontend barrel files use inconsistent (non-standard) header templates
- [x] **D34-004** - Backend barrel file headers often use wrong `@file` paths

- [x] **D35-002** - robots.txt allows all routes by default (confirm intended indexing policy)
- [x] **D35-003** - public `.gitkeep` likely shipped publicly (move notes to docs)

- [x] **D36-004** - Backend shared types header `@file` path mismatch
- [x] **D36-005** - vite-env.d.ts uses non-standard header vs project convention

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
- Presentation stores module no longer includes an `any`-typed, string-event WebSocket wiring helper, reducing drift risk and improving maintainability (D34-002 ✅ resolved).
- Vite env typing now reflects the env vars actually used across the frontend (`VITE_SOCKET_URL`, `VITE_APP_VERSION`), improving type-safety and reducing misconfiguration risk (D36-001 ✅ resolved).
- Backend request-boundary types now model pagination values as query strings/arrays (matching Express reality) and rely on explicit parsing for validated numbers, reducing `NaN` propagation risk (D36-002 ✅ resolved).
- Backend shared auth/JWT shapes model roles as `string`, increasing drift risk vs the actual role set enforced in authorization logic (D36-003).
Prisma seed scripts can drift from the schema/migration state (e.g., removed columns still referenced), leading to runtime failures in local/dev setup.
- Script/test utilities now use consistent TS/ESM import conventions (extensions where required), improving portability across Node/`tsx` execution paths (D39-007 ✅ resolved).

### Consistency Analysis
**Issues:**
- UI labels/colors/icons are currently embedded into Domain enumerations, which risks inconsistent UI behavior and complicates localization/theming.
- Common component files mix header templates and (in `LoadingSpinner`) introduce hard-coded fallback colors, which weakens the project-wide token + documentation conventions (D24-008/D24-010).
- Layout components still rely on untyped template globals (`$emit`, `$router`) and diverge in header style, which erodes the project’s type-safety and documentation consistency goals (D25-003/D25-005).
- Feature components continue the `$emit`-in-template pattern and include several non-semantic clickable tiles, reinforcing the need for a consistent “interactive element” pattern across the Presentation layer (D26-001/D26-005).
- Task components repeat the `$emit`-in-template pattern and also build translucent colors via string concatenation (e.g., `${color}20`), which assumes a hex color format and can be brittle if tokens ever switch representation (D27-005/D27-006).
- Message components continue the `$emit`-in-template pattern and include a hard-coded hex value in component CSS, weakening the project’s token/theming discipline (D28-004/D28-005/D28-007).
- File components also surface inconsistent component contracts (unused emits/styles) and continue `$emit`-in-template patterns, reinforcing the need for a consistent typed-emits + component-API hygiene convention (D29-003/D29-007).
- Notification components now use typed `emit(...)` in templates and include Space-key parity where `role="button"` is used (D30-004).
- CalendarWidget repeats the “clickable container” pattern but also nests real `<button>`s inside a `role="button"` day cell; standardize a consistent interactive-element pattern to avoid nested-controls a11y pitfalls (D31-001).
- Views include multiple “demo/stub” style implementations (`alert`, simulated API delays) and previously had hard-coded styling in error pages (now tokenized); centralize UX primitives and keep production views backed by real service calls to avoid drift (D32-010).
- App entry includes unconditional debug-style logs and enables WebSocket debug mode by default; standardize an environment-gated logging/debug convention for entrypoints and core infrastructure initialization (D33-002).
- Barrel-export file header conventions are now consistent across frontend + backend barrels after standardizing templates and aligning backend `@file` paths (D34-003/D34-004).
- Public assets now ship the expected icon files and PWA metadata references them consistently; keep `public/` and manifest/icon expectations aligned to avoid broken icon requests and inconsistent install experience (D35-001 ✅ resolved / D35-003 ✅ resolved).
- Frontend test tooling configuration is internally inconsistent (ESM project + CJS `require` setup, non-standard Jest option, missing Vue transformer), which makes the test harness fragile and harder to maintain (D37-003).
- Operational scripts now avoid machine-specific paths and broad process-kill commands by using script-relative paths and pidfile-based stop/start, improving portability and predictability across dev setups (D39-003 ✅ resolved).
- Documentation files contain multiple broken relative links and contradictory guidance across “generated” docs; without a single source of truth + link checking, doc drift will keep increasing (D40-001/D40-003/D40-008).
- Repository previously contained committed operational artifacts (runtime logs and ad-hoc DB output). These artifacts were removed, but repo hygiene should remain strict (ignore logs/artifacts and avoid committing operational output) to reduce sensitive-data leakage risk (D41-001/D41-002 ✅ resolved).

### Security Analysis
**Issues:**
- High-risk operational command execution exists in backend backup flows (D7-003).
- HTTP client contains debug logging that may leak payloads/tokens depending on usage (D8-005).
- WebSocket project room joins are now authorization-guarded (D9-001 ✅ resolved).
- Frontend previously embedded/consumed third-party secrets (Dropbox) in a client-side integration; this was removed and the frontend now relies on backend `/api/v1/files/*` endpoints (D10-002 ✅ resolved).
- Some backend database errors previously included raw underlying message text; repository error handling now logs details internally and throws stable outward messages to avoid leaking internals (D11-006 ✅ resolved).
- Backend JWT secrets now require env vars and fail fast when missing (D14-001 ✅ resolved).
- Backend repository contains real third-party credentials in `backend/.env`, which must be treated as compromised and removed from history (D37-001).
- Production seed sets and logs a predictable admin password, which is unsafe in real deployments and should be replaced with an env-supplied or one-time credential (D38-002).
- Operational/token scripts and notes print or embed token material in plaintext, which increases accidental leakage risk (terminal history/screen sharing/repo notes) and should be eliminated (D39-001/D39-002).
- Frontend shared ID generation uses `Math.random()` despite claiming UUID v4 compliance; this is not appropriate for security-sensitive identifiers (D15-001).
- Frontend global styles import Google Fonts via third-party URL, which can complicate CSP/privacy requirements depending on deployment constraints (D16-001).
- Router post-login redirect handling does not validate the redirect target, which can cause unexpected navigation and should be hardened (D17-001).
- Auth store now keeps the refresh token session-scoped (not persisted in `localStorage`), but the access token remains persisted; the XSS blast radius is reduced but still non-zero (D18-001 ✅ resolved).
- Notification store persists notifications in `localStorage` under a global key, which can leak state across users on shared devices (D18-006).
- Backend app bootstrap now includes CORS hardening, env-gated logging, and production rate limiting (D20-001/D20-002/D20-003 ✅ resolved).
- Backend routes should make authorization policy explicit (D21-001).
- Backend controllers include at least one clear access-control gap (notifications) and trust client-provided message payloads (D22-001/D22-002).
- Backend controller request-path logging no longer uses `console.*`; remaining security review items are focused on authorization policy clarity (D21-001).
- Upload middleware now validates both extension and MIME type and rejects invalid files with a typed 400 response (D23-001 ✅ resolved).
- Additional security review will be covered in Infrastructure/Auth/HTTP/WebSocket groups.
- File preview/download flows now use the shared HTTP client and harden new-tab navigation against reverse-tabnabbing (`noopener/noreferrer`, `opener=null`) (D32-007 ✅ resolved).
- App entry currently enables verbose `[App]` logging and WebSocket debug mode by default; ensure production builds do not emit debug traces that could leak operational details or expand the XSS “information surface” (D33-002).
- Avoid shipping internal notes/files from `public/` when they aren’t needed, as they can expose implementation details and create unnecessary public endpoints (D35-003).
- Production deployment scripts currently run database seeding on every start; this expands blast radius for seed bugs and risks data integrity (D37-002).
- Multiple docs include token-like values and/or suggest putting secrets into frontend Vite env vars; this increases the chance of secret leakage through repo history, static hosting, or CI logs (D40-004).
- Authentication docs are inconsistent about cookies vs Bearer tokens; mismatched assumptions here can lead to insecure deployments (missing CSRF/XSS mitigations) and hard-to-debug auth failures (D40-002).
- Previously committed runtime logs and ad-hoc DB query outputs can leak sensitive operational data; these artifacts were removed and should remain purged/ignored going forward (D41-001/D41-002 ✅ resolved).

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
