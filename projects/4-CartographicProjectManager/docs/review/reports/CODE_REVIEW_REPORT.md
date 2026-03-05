# CODE REVIEW REPORT
## Cartographic Project Manager (CPM)

**Review Date:** March 5, 2026
**Reviewer:** GitHub Copilot Agent
**Codebase Version:** dd8d063
**Total Files Reviewed:** 186
**Total Groups Reviewed:** 31

---

## EXECUTIVE SUMMARY

**Overall Codebase Score:** TBD/10

**Summary:**
Initial review (Domain enumerations + entities) shows strong documentation discipline and helpful type-guard utilities, but also reveals a recurring architecture smell: Domain types are currently carrying Presentation/Infrastructure concerns (UI mappings in enums, and JSON serialization + WhatsApp/Dropbox coupling in entities), which undermines Clean Architecture boundaries and increases coupling.

**Statistics (so far):**
- Critical Issues: 4
- High Issues: 18
- Medium Issues: 85
- Low Issues: 62
- Total Issues: 169

**Recommendation:**
- [ ] ✅ APPROVED - Ready for production
- [ ] ⚠️ APPROVED WITH RESERVATIONS - Functional but needs improvements
- [ ] ❌ REQUIRES REMEDIATION - Critical issues must be fixed

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
| D2-002 | 🟡 MEDIUM | backend/src/domain/value-objects/geo-coordinates.ts | 50-52 | **Floating-point equality is too strict:** backend `equals()` uses `===` on numbers, which is brittle for computed coordinates and can fail even for “same point” after parsing/serialization. | Use an epsilon-based comparison (similar to frontend), or compare using a configurable tolerance. |
| D2-003 | 🟢 LOW | backend/src/domain/value-objects/geo-coordinates.ts | 35-42 | **Validation is incomplete for NaN/Infinity:** bounds checks won’t catch `NaN` and will accept it silently (`NaN < -180` is false). | Add `Number.isFinite` checks before range checks and throw a typed domain error. |

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
| D3-002 | 🟠 HIGH | src/domain/entities/notification.ts | 144-146 | **Correctness + coupling:** `Notification.shouldSendViaWhatsApp()` references `user.whatsappEnabled`, but `User` does not expose that property. This is also an Infrastructure-specific channel concern leaking into Domain. | Move channel-routing decisions to an Application service (e.g., `NotificationDeliveryPolicy`) based on user preferences stored as a dedicated VO/setting. Keep Domain notification channel-agnostic (or model channels as an enum without vendor-specific naming). |
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
These entities are drifting toward an “anemic domain + DTO” hybrid: they contain domain rules, but also embed serialization and integration details (WhatsApp, Dropbox). Bringing DTO mapping and delivery/persistence decisions back to the Application/Infrastructure layers would improve adherence to the Clean Architecture described in `docs/ARCHITECTURE.md`.

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
| D4-002 | 🟠 HIGH | src/domain/repositories/{task,notification}-repository.interface.ts | 15 | **Incorrect imports break type-safety/builds:** repository interfaces import enums from entity modules (`TaskStatus`, `TaskPriority`, `NotificationType`) that are not exported by those entity files. | Import enums from their actual modules (e.g., `../enumerations/task-status`, `../enumerations/task-priority`, `../enumerations/notification-type`) and keep entity modules exporting only entities/props. |
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
| D5-003 | 🟡 MEDIUM | src/application/dto/{project-data,project-details,file-data}.dto.ts | project-data.dto.ts:46, project-details.dto.ts:57-59, file-data.dto.ts:90, notification-data.dto.ts:86 | **Vendor/channel coupling in API contracts:** DTOs expose Dropbox- and WhatsApp-specific naming and errors (`dropboxFolderId`, `dropboxFolderUrl`, `dropboxPath`, `DROPBOX_ERROR`, `whatsAppEnabled`). This bakes Infrastructure/vendor decisions into the application contract and makes migrations harder. | Prefer vendor-agnostic terms (`storageFolderId`, `storagePath`, `messagingEnabled`) and keep vendor naming in Infrastructure adapters. If the contract must expose Dropbox/WhatsApp, document it explicitly and centralize mapping to avoid bleed into Domain (see D3-002, D3-004). |
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
| D6-002 | 🟡 MEDIUM | src/application/interfaces/{file-service,notification-service}.interface.ts | file-service.interface.ts:10,29,41,69; notification-service.interface.ts:10,26,130-146 | **Infrastructure/vendor coupling leaks into Application interfaces:** the interfaces explicitly encode Dropbox and WhatsApp semantics. This tightens coupling and makes it harder to swap providers or run the application without those integrations. | Prefer vendor-agnostic “storage” and “messaging channel” abstractions at the interface boundary; keep vendor naming in Infrastructure adapters (consistent with Domain findings D3-002/D3-004 and DTO findings D5-003). |
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
| D7-001 | 🔴 CRITICAL | src/application/services/{notification,export,backup}.service.ts; src/application/services/{message,task,backup,project}.service.ts | Multiple (e.g., notification.service.ts:54-112 vs notification-service.interface.ts:40-46; export.service.ts:55-77 vs export-service.interface.ts:38-70; backup.service.ts:70-95 vs backup-service.interface.ts:66-110; message.service.ts:107-113; task.service.ts:128-135; project.service.ts:132-139) | **Contract drift breaks type-safety and likely fails compilation:** several service classes declare `implements I*Service` but don’t match the interface signatures and/or omit required methods. Additionally, call sites are using *both* positional and object-shaped `sendNotification(...)` calls, so even if compilation is forced, runtime behavior will be inconsistent. | Pick a single API shape per service (preferably matching the interface). Then: (1) align interface ↔ implementation (rename/add required methods), (2) update all call sites to the same signature, (3) add a small compile-time “contract test” pattern (e.g., `const _t: INotificationService = new NotificationService(...)`) to prevent silent drift. |
| D7-002 | 🟠 HIGH | src/application/services/authorization.service.ts | 52, 77, 100, 115, 128-129 | **Authorization correctness bug + role inconsistency:** `canDeleteProject()` has an admin check accidentally commented into the preceding line (`// Only admins can delete projectsif ...`), and the service inconsistently checks `UserRole.ADMIN` vs `UserRole.ADMINISTRATOR`. This can deny admin privileges (or apply them inconsistently), especially for destructive operations. | Fix the comment/statement split, and standardize on the single canonical admin role enum value. Add unit tests for “admin can access/modify/delete/finalize” across all authorization methods. |
| D7-003 | 🟠 HIGH | backend/src/application/services/backup.service.ts | 80-86, 128-134 | **Command injection + secret exposure risk:** database password and other URL-derived values are interpolated into shell commands executed via `exec`. This can leak credentials (e.g., process list) and is vulnerable if any value contains shell metacharacters/quotes. | Use `spawn`/`execFile` with argument arrays and pass `PGPASSWORD` via `env` instead of string interpolation. Validate/escape DB params defensively and avoid logging sensitive values. |
| D7-004 | 🟠 HIGH | src/application/services/authentication.service.ts | 83-86, 99-103, 252-257 | **Mock auth logic + type-safety escape hatches likely break builds and security expectations:** the service verifies passwords locally via `user['passwordHash']` and generates placeholder tokens/sessions in-memory (client-side), while also referencing `ValidationErrorCode` without importing it. This is both a correctness risk (compile error) and a security risk if the mock is used outside dev/test. | If this is intended as a mock, isolate it behind a `MockAuthenticationService` and ensure production uses backend-only auth. Remove bracket-indexing (`user['passwordHash']`) by introducing a proper DTO shape. Fix missing imports and add explicit environment guards to prevent accidental production use. |
| D7-005 | 🟡 MEDIUM | src/application/services/project.service.ts | 99-106, 115-121, 166-169 | **Coordinate truthiness bug + invalid defaulting:** coordinate creation uses `data.coordinateX && data.coordinateY`, which fails for valid `0` values, and `dropboxFolderId` is forced to `''` after a Dropbox error. This can silently drop coordinates and introduce invalid identifiers. | Use nullish checks (`!= null`) for numeric coordinates and represent missing Dropbox folder as `null`/`undefined` consistently (don’t coerce to empty string). Consider failing fast on storage setup if it’s required downstream. |
| D7-006 | 🟡 MEDIUM | src/application/services/file.service.ts | 104-106 | **Type mismatch + path construction risk:** `section` defaults to the string `'Messages'` despite `ProjectSection` being an enum-like type, and user-provided values (`section`, `name`) are concatenated into a Dropbox path. This can cause invalid section values and makes path-safety dependent on Dropbox SDK behavior. | Default using the canonical `ProjectSection` value (not a string literal) and validate/sanitize file names and section inputs before constructing paths. |
| D7-007 | 🟡 MEDIUM | backend/src/application/services/deadline-reminder.service.ts | 119-125, 191-197 | **Stringly-typed notification types + duplicate reminder risk:** notification `type` fields are literal strings (e.g., `'TASK_STATUS_CHANGE'`, `'PROJECT_ASSIGNED'`) rather than shared enums, and the reminder job doesn’t record which reminders have already been sent (scheduler reruns can spam users). | Use the canonical notification type enum (Prisma enum or shared constant) and persist “reminder sent” markers (or compute idempotency keys) to prevent duplicates. |
| D7-008 | 🟡 MEDIUM | backend/src/application/services/export.service.ts | 233-235 | **Coordinate truthiness bug:** `if (project.coordinateX && project.coordinateY)` will skip coordinates when either value is `0`. | Use nullish checks (`project.coordinateX != null && project.coordinateY != null`) to correctly include `0` coordinates. |

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
| D8-002 | 🟠 HIGH | src/infrastructure/http/axios.client.ts | 303-313, 373-386 | **Token refresh failure leaves in-flight requests hanging:** when `isRefreshing` is true, new 401s subscribe via `subscribeToTokenRefresh()` and return a Promise that only resolves on `onTokenRefreshed()`. If refresh fails, subscribers are cleared in `finally` without being rejected/resolved, so awaiting requests may never complete. | Track subscribers as `{resolve, reject}` pairs and reject all on refresh failure. Alternatively, always call a “refresh finished” notifier that resolves/rejects queued requests deterministically. |
| D8-003 | 🟡 MEDIUM | src/infrastructure/http/axios.client.ts | 217-218, 894-902 | **`cancelAllRequests()` is effectively non-functional:** `abortController` is never initialized nor wired into request configs, so calling `cancelAllRequests()` won’t cancel anything in the common case (and may misleadingly suggest global cancellation exists). | Initialize `abortController` in the constructor and inject `signal` into all requests by default (while still allowing per-request signals). |
| D8-004 | 🟡 MEDIUM | src/infrastructure/http/axios.client.ts | 285-293, 671-692, 736-757 | **Type-safety mismatch in response shaping:** the response interceptor returns a custom object but casts it to `AxiosResponse`, and upload methods call `post<T>` (not `BackendApiResponse<T>`) then cast the result to `ApiResponse<T>`. This makes it easy for consumers to misuse the client (especially via `getAxiosInstance()`), and it can hide backend contract changes. | Return a real `ApiResponse<T>` type from the wrapper methods and keep the underlying `AxiosInstance` returning standard Axios responses (or vice versa). Avoid `as unknown as ...` casts in the interceptor and uploads; use consistent generics (`BackendApiResponse<T>`) if the backend wraps responses. |
| D8-005 | 🟢 LOW | src/infrastructure/http/axios.client.ts | 605-624 | **Debug logging left in production path:** `delete()` uses `console.log` for request/response, which can leak payloads in production and create noise. | Replace with the project logger (with log levels) and ensure sensitive data is not logged. |

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
| D9-001 | 🔴 CRITICAL | backend/src/infrastructure/websocket/socket.server.ts | 66-94 | **Authorization bypass: any authenticated user can join any project room.** The server accepts `join:project` / legacy subscribe events and unconditionally `socket.join(project:${projectId})` without verifying the requesting user has access rights to that project. This can lead to cross-project data exposure for real-time events. | Add an authorization check in the join handlers (e.g., query project membership/permissions by `socket.data.userId` and reject/ignore unauthorized joins). Consider using server-side room names derived from verified membership rather than client-provided IDs. |
| D9-002 | 🟡 MEDIUM | src/infrastructure/websocket/socket.handler.ts | 340-406, 752-766, 915-919 | **Reconnect uses a potentially stale token:** the socket is created with a fixed `auth.token` value captured at `connect()` time. If the access token rotates/refreshes, reconnections may fail or keep using expired credentials. | Use the `ITokenProvider` on reconnect to update `socket.auth.token` before reconnect attempts (or provide `auth` as a function), and/or handle `connect_error` to trigger token refresh + reconnect. |
| D9-003 | 🟢 LOW | src/infrastructure/websocket/socket.handler.ts; backend/src/infrastructure/websocket/socket.server.ts | socket.handler.ts:796-800, 989-990, 1001-1005; socket.server.ts:71, 80-81, 139-146 | **Debug logging in production paths:** several `console.log` / `console.error` statements exist outside a proper logger and, in some cases, outside the `debug` gate. This can leak identifiers and create noise in production. | Route logs through the shared logger with log levels; ensure debug logs are gated and avoid logging payloads/tokens. |
| D9-004 | 🟡 MEDIUM | src/infrastructure/websocket/socket.handler.ts | 286-296, 394-400 | **Type contract mismatch for `ConnectionOptions.token`:** `token` is typed as required, but the implementation falls back to `tokenProvider` (`options.token || this.tokenProvider?.getAccessToken()`), implying it was intended to be optional. | Make `token?: string` and rely on `tokenProvider`, or remove the fallback and keep the type strict. |

**Positive Aspects:**
- Clear event taxonomy and strongly typed payloads make it easy to consume events safely in Presentation.
- Room-based design (`user:${userId}`, `project:${projectId}`) is scalable and aligns with typical Socket.IO patterns.
- Client reconnect handling re-joins user/project rooms, which improves UX after transient disconnects.

**Group Notes:**
The backend join-room authorization gap (D9-001) is the highest risk: it undermines project isolation guarantees. The client-side reconnect/token handling is also likely to surface as flaky “random disconnect” behavior unless it’s made token-rotation aware.

---

#### Group 3.3: External Services
**Files Reviewed:**
- src/infrastructure/external-services/dropbox.service.ts
- src/infrastructure/external-services/whatsapp.gateway.ts
- backend/src/infrastructure/external-services/dropbox.service.ts

**Score:** 4.6/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D10-001 | 🔴 CRITICAL | src/infrastructure/external-services/whatsapp.gateway.ts | 44-53, 608-645 | **Client-side Twilio credentials exposure:** the frontend gateway contains `accountSid` + `authToken` and makes direct Basic-authenticated requests to Twilio. Any browser user can exfiltrate these secrets, send messages on your behalf, and burn quota/cost. This is not safe to run in a client bundle. | Move Twilio/WhatsApp sending to the backend only. Expose a backend endpoint (or service) that accepts a minimal, validated request and performs the Twilio call server-side. Remove Twilio credentials from all frontend config/build artifacts. |
| D10-002 | 🟠 HIGH | src/infrastructure/external-services/dropbox.service.ts | 70-79, 812-820, 846-854 | **Client-side Dropbox access token usage:** the frontend Dropbox integration stores and uses an access token directly for API/content operations. If this token is app-scoped (not per-user OAuth), it is effectively a shared secret and is recoverable by any user via DevTools/network logs. | Prefer backend-mediated Dropbox operations (upload/download via backend, pre-signed temporary links, or a scoped per-user OAuth flow). Never ship a long-lived app Dropbox token in the frontend. |
| D10-003 | 🟡 MEDIUM | src/infrastructure/external-services/dropbox.service.ts | 1054-1065 | **Metadata mapping can produce invalid dates:** `mapToFileMetadata()` blindly builds `modifiedAt` from `server_modified` even for folders (or entries lacking that field), producing `Invalid Date` and potentially breaking sorting/UI display. | Branch by entry type (`.tag === 'folder'`) and set `modifiedAt` to `null`/`undefined` or a safe default; validate required fields before casting. |
| D10-004 | 🟡 MEDIUM | backend/src/infrastructure/external-services/dropbox.service.ts | 362-376, 560-568 | **Over-broad error swallowing hides real failures:** `createFolder()` treats any `'.tag' === 'path'` error as “already exists”, and `pathExists()` returns `false` for all errors (including permission/config issues). This can mask misconfiguration and lead to silent data loss. | Narrow the “already exists” check to the specific conflict/exists case (Dropbox SDK provides structured tags). For `pathExists()`, only return `false` on explicit “not found”; otherwise rethrow/log. |
| D10-005 | 🟢 LOW | backend/src/infrastructure/external-services/dropbox.service.ts | 261-262, 323-330, 539-540 | **Console logging in backend infra code:** refresh/token retry and link creation paths use `console.log`, which is noisy and can leak operational details. | Use the shared logger with log levels; keep token-related logs minimal and never include secrets. |

**Positive Aspects:**
- Dropbox implementations include chunked upload support and centralized retry/refresh patterns.
- Frontend Dropbox service has clear separation between API vs content endpoints.
- WhatsApp gateway provides a clean interface and response shape for upstream consumers.

**Group Notes:**
The architecture intent is clear, but the current placement of vendor API calls in the frontend (Twilio/WhatsApp, and likely Dropbox) creates major security and compliance risk. These integrations should be backend-first, with the frontend calling a narrow internal API.

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
| D11-001 | 🟠 HIGH | src/infrastructure/repositories/{file,message,notification,permission,project,task,user}.repository.ts | Multiple (e.g., file.repository.ts:295-297; message.repository.ts:332-334; notification.repository.ts:294-296; permission.repository.ts:287-289; project.repository.ts:468-470; task.repository.ts:386-388; user.repository.ts:247-249) | **Incorrect Axios 404 detection breaks null-return contracts:** these repositories attempt `return (error as {status?: number})?.status === 404`, but Axios errors typically expose status as `error.response.status`. As a result, `findById()`-style methods will throw instead of returning `null`, causing avoidable UI crashes and logic errors. | Standardize error handling for Axios errors (e.g., check `axios.isAxiosError(error)` and `error.response?.status === 404`). Consider a shared helper in Infrastructure (or the HTTP client) to normalize errors. |
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
| D13-001 | 🟠 HIGH | backend/src/infrastructure/scheduler/deadline-reminder.scheduler.ts | 25-31 | **Prisma client lifecycle + inconsistency risk:** scheduler constructs a new `PrismaClient()` and passes it into `DeadlineReminderService`, but `NotificationRepository` uses the shared singleton prisma from `prisma.client`. This mixes DB clients in the same workflow and also never calls `$disconnect()`, risking connection leaks and unpredictable behavior in long-running processes. | Use the shared `prisma` singleton consistently (import from `../database/prisma.client.js`) and avoid creating additional clients per scheduler. Ensure a clean shutdown path (hook process signals) if you must create a dedicated client. |
| D13-002 | 🟡 MEDIUM | backend/src/infrastructure/scheduler/backup.scheduler.ts | 24-29 | **Scheduler may run with invalid config:** `databaseUrl` falls back to an empty string (`process.env.DATABASE_URL || ''`). If the env var is missing/misconfigured, the scheduler still starts and will fail at runtime (possibly repeatedly). | Validate required environment variables at startup and fail fast (or disable the job) if `DATABASE_URL` is absent. Consider making backup settings configurable via env vars rather than hard-coded. |
| D13-003 | 🟡 MEDIUM | backend/src/infrastructure/auth/auth.middleware.ts | 58-75, 117-140 | **Role checks are stringly-typed:** `authorize(...allowedRoles: string[])` and `authorizeOwnerOrAdmin()` compare roles to string literals (e.g., `'ADMINISTRATOR'`). This is brittle (typos compile) and can drift from the canonical role enum. | Type roles as `UserRole` (from Prisma or your domain enum) and centralize role constants. Prefer `authorize(...allowedRoles: UserRole[])`. |
| D13-004 | 🟢 LOW | backend/src/infrastructure/auth/jwt.service.ts | 26-38 | **`expiresIn` typing is bypassed with `as any`:** configuration is cast to `any`, which can hide misconfiguration (e.g., wrong unit/type). | Type `JWT.EXPIRES_IN`/`JWT.REFRESH_EXPIRES_IN` correctly (e.g., `string | number`) and validate at startup; avoid `as any`. |
| D13-005 | 🟢 LOW | backend/src/infrastructure/auth/auth.middleware.ts | 85-106 | **Optional auth silently ignores invalid tokens:** `optionalAuth()` catches verification failures and proceeds as anonymous. This is sometimes intended, but it can also mask client bugs (sending bad tokens) and complicate debugging. | Consider logging invalid token events at debug level (without leaking token content) or distinguishing between “no token” vs “invalid token” for observability. |

**Positive Aspects:**
- JWT handling is centralized and middleware wiring is straightforward.
- Password hashing uses bcrypt with configured salt rounds.
- Scheduler jobs use the shared logger (not raw `console.*`) for errors.

**Group Notes:**
The scheduler’s DB client handling (D13-001) is the main reliability risk here. For auth middleware, the biggest improvement is moving away from stringly-typed roles to a shared enum/typed guard so authorization mistakes fail at compile-time.

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
| D14-001 | 🔴 CRITICAL | backend/src/shared/constants.ts | 48-54 | **Security misconfiguration hazard:** JWT secrets fall back to hard-coded defaults (`default-secret-change-in-production`, `default-refresh-secret`). If a production environment is misconfigured, attackers could forge tokens and impersonate users/admins. | Remove secret defaults and fail fast at startup when `JWT_SECRET` / `JWT_REFRESH_SECRET` are missing. Prefer centralized env-schema validation (e.g., Zod/envalid) in the backend entrypoint and keep constants as pure reads of validated config. |
| D14-002 | 🟡 MEDIUM | src/shared/constants.ts + backend/src/shared/constants.ts | 191-258; 89-117 | **Frontend/backend upload rules are inconsistent:** frontend allows up to 50MB and includes additional geo/CAD extensions, while backend default max size is 10MB and its `ALLOWED_MIME_TYPES` list omits some frontend-supported types. This will produce “works in UI, fails on server” behavior. | Define a single source of truth for upload constraints (size + types) and share it (e.g., shared package or generated constants). If constraints must differ, enforce server constraints in UI and render server-driven validation errors predictably. |
| D14-003 | 🟡 MEDIUM | backend/src/shared/constants.ts | 38-40, 125-128 | **Fail-open defaults for critical config:** database URL defaults to an empty string and logging defaults to `debug`. This tends to fail late and can leak noisy or sensitive logs in production if env is incomplete. | Validate required env vars at startup (e.g., `DATABASE_URL`, `LOG_LEVEL`) and select safe production defaults (e.g., `info`/`warn`). Prefer explicit configuration per environment rather than implicit fallbacks. |
| D14-004 | 🟢 LOW | backend/src/shared/constants.ts | 15-17 | **Import-time side effects:** calling `dotenv.config()` inside a shared constants module creates side effects on import, complicating tests and making load order matter. | Move `dotenv.config()` to the backend process entrypoint (e.g., `server.ts`/`index.ts`) so configuration happens once, predictably, before other imports. |
| D14-005 | 🟢 LOW | backend/src/shared/constants.ts | 1-13 | **Header metadata mismatch:** `@file` is `src/shared/constants.ts` but the actual path is `backend/src/shared/constants.ts`. This weakens traceability in generated docs and audits. | Update the header to reflect the correct relative file path. |

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
| D15-001 | 🟠 HIGH | src/shared/utils.ts | 41-46 | **Insecure/incorrect UUID generation:** `generateId()` claims “UUID v4 compliant” but uses `Math.random()`, which is not cryptographically secure and is not appropriate for security-sensitive identifiers (e.g., reset tokens, invitation links). It also increases collision risk under load. | Use `crypto.randomUUID()` (supported in modern browsers) or `crypto.getRandomValues`-based UUID generation. If this ID is used across layers, standardize on UUIDs generated server-side (or via a shared `IdGenerator` abstraction). |
| D15-002 | 🟡 MEDIUM | backend/src/shared/utils.ts | 113-128 | **Pagination parsing can produce `NaN`:** `parsePagination()` uses `parseInt()` and then `Math.max/Math.min`. If `page` or `limit` are non-numeric (e.g., `?page=abc`), `parseInt` returns `NaN` and the current logic propagates `NaN` into `skip`, breaking queries and responses. | Guard with `Number.isFinite` and fall back to defaults on `NaN`. Consider centralized query validation (Zod) and return 400 on invalid pagination inputs. |
| D15-003 | 🟡 MEDIUM | backend/src/shared/types.ts | 64-86 | **Stringly-typed auth roles in shared types:** `AuthenticatedUser.role` and `JwtPayload.role` are `string`, which reintroduces the same “typos compile” risk seen in middleware authorization. This increases drift risk between backend role constants and authorization checks. | Type roles as a shared enum/union (e.g., `UserRole` from Prisma or a backend domain enum) and use it consistently across auth middleware, JWT payloads, and request typing. |
| D15-004 | 🟡 MEDIUM | src/shared/utils.ts | 1059-1076 | **`deepClone()` is unsafe for many real-world objects:** the implementation doesn’t handle circular references and will silently strip prototypes for class instances (and won’t correctly clone Maps/Sets/Files/Blobs). This can cause subtle runtime bugs if used on anything other than plain JSON-like objects. | Prefer `structuredClone()` where available, or clearly document constraints (plain objects/arrays/dates only). If you need broad cloning, use a well-tested library or introduce specialized clone utilities per domain shape. |
| D15-005 | 🟢 LOW | backend/src/shared/logger.ts | 31-37 | **Console formatting can throw on circular metadata:** the development `consoleFormat` uses `JSON.stringify(metadata)`, which will throw if `meta` contains circular references (common with request objects). This can break logging when debugging. | Use a safe stringifier (e.g., `safe-stable-stringify`) or log metadata via Winston formats that handle complex objects without throwing. |
| D15-006 | 🟢 LOW | backend/src/shared/{utils,errors,logger,types,index}.ts | 9-12 | **Repeated header metadata mismatch:** `@file` paths point to `src/shared/*.ts` even though these are under `backend/src/shared/*.ts`. This reduces traceability in generated docs and audits. | Update `@file` entries to the correct relative paths (e.g., `backend/src/shared/utils.ts`). |

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
| D20-001 | 🟡 MEDIUM | backend/src/presentation/app.ts | 32-37 | **CORS configuration is a common foot-gun with credentials:** `cors({ origin: CORS.ORIGIN, credentials: CORS.CREDENTIALS })` is correct *if* `origin` is a strict allowlist. If `CORS.ORIGIN` can be `'*'` while credentials are enabled, browsers will reject the response and/or you risk accidentally broadening cross-site access. | Ensure `CORS.ORIGIN` is an explicit allowlist (string[] or origin callback) when `credentials: true`. Add tests/config validation to prevent invalid combinations (e.g., `'*'` + credentials). |
| D20-002 | 🟡 MEDIUM | backend/src/presentation/app.ts | 44-45 | **Request logging mode is not environment-gated:** `morgan('dev')` is enabled unconditionally. In production, this is noisy and can leak request paths/timings into logs (and sometimes sensitive query strings). | Gate morgan format/enablement by environment (e.g., `dev` only), or switch to a structured logger integration with redaction and log levels. |
| D20-003 | 🟡 MEDIUM | backend/src/presentation/app.ts | 39-45 | **Missing basic edge protections at the app boundary:** the app sets JSON body limits (good) but does not show global rate limiting / slow-down / brute-force protections at bootstrap time. Given auth endpoints and file uploads, this increases DoS and credential-stuffing risk unless enforced elsewhere. | Add an app-level rate limiter (and/or route-scoped limiters for `/auth/*`, `/files/*`) and ensure `trust proxy` is configured correctly when behind a reverse proxy. |
| D20-004 | 🟢 LOW | backend/src/presentation/app.ts | 9-12 | **Header metadata mismatch:** `@file` says `src/presentation/app.ts` but the file is under `backend/src/presentation/app.ts`, reducing traceability in generated docs/audits. | Update the header `@file` path to match the real location. |

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
| D21-002 | 🟡 MEDIUM | backend/src/presentation/routes/{project,notification}.ts | project: 41-60; notification: 21-27 | **Request object mutation to reuse controller handlers weakens type-safety and validation:** routes mutate `req.query`/`req.params` (e.g., setting `projectId` / `userId`) to fit controller method signatures. This is fragile, bypasses normal parsing/validation patterns, and is hard to reason about when middleware also depends on these fields. | Add dedicated controller methods for these endpoints (accept the path/query shape directly), or use small adapters that extract validated values and call shared service methods without mutating `req`. |
| D21-003 | 🟡 MEDIUM | backend/src/presentation/routes/audit-log.routes.ts | 16-23 | **Prisma client is instantiated inside a route module:** `new PrismaClient()` is created at import time in the router. This encourages multiple clients across modules, complicates lifecycle management (disconnect/shutdown), and makes testing/DI harder. | Centralize PrismaClient creation (one instance) and inject it via repositories/controllers, or use an app-level DI container/factory to provide a shared client. |
| D21-004 | 🟢 LOW | backend/src/presentation/routes/{index,auth,file,message,notification,project,task,user}.ts | index: 9-12; project: 9-12; file: 9-12; notification: 9-12; task: 9-12; message: 9-12 | **Backend route module headers are inconsistent:** several files have `@file src/presentation/...` despite living under `backend/src/presentation/...` and some headers omit the second `@see` link used elsewhere. This reduces traceability and makes documentation generation inconsistent. | Standardize headers for backend files to match their actual paths and the project’s preferred header template. |

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
| D22-001 | 🟠 HIGH | backend/src/presentation/controllers/notification.controller.ts | 28-34 | **Notification listing is not access-controlled in the controller:** `getByUserId()` returns notifications for `req.params.userId` with no ownership/admin check. Given the routes support passing `userId` via query/params, any authenticated user can likely read another user’s notifications. | Enforce `currentUser.id === userId` unless `currentUser.role === 'ADMINISTRATOR'`. Prefer taking `userId` from the auth context (ignore userId input entirely for non-admin). |
| D22-002 | 🟠 HIGH | backend/src/presentation/controllers/message.controller.ts | 36-46 | **Message creation trusts raw request body:** `create()` passes `req.body` directly to persistence. If the payload contains author/sender fields, this enables spoofing/impersonation unless the repository overrides them. It also doesn’t enforce project membership/permissions in the controller. | Bind sender identity server-side from the authenticated user and validate project access before creating the message. Consider DTO validation and a service-layer command (e.g., `CreateMessageCommand`). |
| D22-003 | 🟡 MEDIUM | backend/src/presentation/controllers/{auth,export,project}.controller.ts | auth: 19-25; export: 15-33; project: 24-31 | **PrismaClient is instantiated at module scope in multiple controllers:** this encourages multiple client instances, complicates shutdown/disconnect, and makes tests/DI harder (similar to D21-003 in routes). | Centralize PrismaClient creation and inject it, or use a shared repository/service factory/DI container to reuse a single instance. |
| D22-004 | 🟡 MEDIUM | backend/src/presentation/controllers/{project,task}.controller.ts | project: 73-78, 184-186, 307-324, 369-386; task: 57-62, 90-92, 101-104, 120-122, 184-186 | **Incorrect error semantics for auth/authorization:** controllers throw `NotFoundError` for “user not authenticated” and for permission denials. This likely produces wrong HTTP status codes (404 vs 401/403), hides failures, and complicates client UX/debugging. | Use specific errors for unauthenticated (`UnauthorizedError`) and forbidden (`ForbiddenError`) and keep `NotFoundError` for actual missing resources. |
| D22-005 | 🟡 MEDIUM | backend/src/presentation/controllers/{file,project,message}.controller.ts | file: 107-110, 190-194; project: 312-313, 350-352, 373-402; message: 41-43 | **Debug `console.*` logging in request paths can leak sensitive data:** logs include request bodies, user IDs, file names, and error stacks. In production this increases PII/secret leakage risk and log noise. | Replace with the project logger (with levels + redaction) and gate verbose logs behind environment checks. Never log full request bodies or stacks by default. |
| D22-006 | 🟡 MEDIUM | backend/src/presentation/controllers/file.controller.ts | 124-157 | **Dropbox path construction uses user-controlled values without sanitization:** `section` and `originalname` are interpolated into a Dropbox path. This can create unexpected folder hierarchies or overwrite/collide names (and may enable path-like injection depending on upstream). | Sanitize/normalize `section` and filenames (allowlist characters, strip separators, enforce max lengths) and consider generating server-side filenames (store original separately). |
| D22-007 | 🟢 LOW | backend/src/presentation/controllers/{audit-log,export,project,user}.controller.ts | audit-log: 67-78, 230-233; export: 43-49; project: 88-90, 108-110, 210-211; user: 90-91, 113-114 | **Input parsing/decoding lacks validation:** several controllers use `parseInt(...)` and `new Date(...)` without validating `NaN`/Invalid Date, and use `decodeURIComponent(...)` on path params which can throw on malformed input. This can turn client errors into 500s. | Validate query/path inputs and return 400 for invalid values. Use safe decoding helpers and strict parse utilities. |
| D22-008 | 🟢 LOW | backend/src/presentation/controllers/{auth,file,message,notification,project,task,user,index}.ts | auth: 8-12; file: 8-12; message: 8-12; notification: 8-12; project: 8-12; task: 8-12; user: 8-13; index: 8-12 | **Controller file headers are inconsistent:** many controllers still declare `@file src/presentation/...` while living under `backend/src/presentation/...`, reducing traceability and consistency in generated docs. | Standardize the file header `@file` metadata for backend controllers. |

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
| D23-001 | 🟡 MEDIUM | backend/src/presentation/middlewares/upload.middleware.ts | 61-72 | **Upload validation is extension-only and error typing is too generic:** `fileFilter()` checks `originalname` extension only and rejects by calling `cb(new Error(...))`. Attackers can spoof extensions, and generic errors often surface as 500s unless explicitly mapped. | Validate both extension and MIME type (and consider magic-byte sniffing for high-risk types). Reject with a typed `AppError`/`BadRequestError` so clients receive 400 with a consistent error shape. |
| D23-002 | 🟡 MEDIUM | backend/src/presentation/middlewares/error-handler.middleware.ts | 27-32 | **`AppError` responses may leak internal details:** the error handler returns `error.message` and `(error as any).errors`. If `AppError` is used for internal exceptions or includes sensitive fields, this can leak implementation details to clients. | Ensure `AppError` messages are safe-for-client and gate detailed fields behind environment checks. Replace `(error as any).errors` with a typed optional field. |
| D23-003 | 🟢 LOW | backend/src/presentation/middlewares/{error-handler,index}.ts | error-handler: 8-12; index: 8-12 | **Backend middleware headers are inconsistent:** `@file` paths still point at `src/presentation/...` while files live under `backend/src/presentation/...`, reducing traceability. | Standardize header `@file` metadata for backend middleware modules. |

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
| D24-001 | 🟡 MEDIUM | src/presentation/components/common/AppModal.vue | 131-145, 196-211 | **Body scroll locking has global side effects and can override unrelated page styles:** the watcher runs with `{immediate: true}` and calls `unlockBodyScroll()` even when the modal starts closed, and unlock resets `document.body.style.overflow/paddingRight` to empty strings. This can break pages that intentionally set these styles, and it won’t handle “stacked” modals safely (closing one unlocks all). | Track whether this modal instance actually locked scroll (store previous overflow/padding values), and only restore when you previously locked. Consider a shared “scroll lock” ref-counter helper if multiple modals can exist. |
| D24-002 | 🟡 MEDIUM | src/presentation/components/common/AppInput.vue | 187-192 | **Number input parsing is lossy and can emit unexpected values:** `Number(target.value)` will emit `0` for `''` and `NaN` for invalid numeric strings, which can corrupt form state and validation (and differs from native number input semantics). | Treat empty input as `null`/`''` (choose one contract) and guard against `NaN`. If numeric options are needed, parse with `valueAsNumber` and `Number.isFinite(...)` checks. |
| D24-003 | 🟡 MEDIUM | src/presentation/components/common/AppSelect.vue | 41-43, 58-66, 138-143 | **Select placeholder/clear logic breaks for falsy values and type round-tripping:** placeholder `:selected="!modelValue"` and clear button `v-if="... && modelValue"` treat `0` as “empty”. Additionally, `HTMLSelectElement.value` always returns a string, so emitting `target.value` drops numeric option types. | Use explicit emptiness checks (`modelValue == null || modelValue === ''`). Map back to the declared option type (e.g., lookup `options.find(o => String(o.value) === target.value)` and emit `o.value`). |
| D24-004 | 🟡 MEDIUM | src/presentation/components/common/AppConfirmDialog.vue | 15-22, 108-111 | **ConfirmDialog close semantics are inconsistent:** overlay/escape/X closes `AppModal` and triggers only `update:modelValue` forwarding, but does not emit `cancel`. Consumers listening for `cancel` won’t run cleanup logic on these close paths. | Treat any non-confirm close as cancel: listen to `@close` from `AppModal` and emit `cancel` (while also updating `modelValue`). Prefer using the typed `emit` function instead of `$emit` in the template. |
| D24-005 | 🟢 LOW | src/presentation/components/common/AppCard.vue | 24-28, 105-109 | **Clickable card is missing full keyboard interaction:** it uses `role="button"` and supports Enter, but does not handle Space key activation (expected for buttons) and does not prevent default scroll behavior if Space is added later. | Add `@keydown.space.prevent` handling when `clickable` is true and consider `:aria-disabled="loading"` when `loading` blocks interaction. |
| D24-006 | 🟢 LOW | src/presentation/components/common/{AppInput,AppSelect,AppTextarea,AppModal}.vue | AppInput: 163-164; AppSelect: 133-134; AppTextarea: 124-125; AppModal: 96-98 | **Runtime-generated IDs via `Math.random()` are non-deterministic:** this can cause hydration mismatches in SSR and makes snapshot/e2e tests harder. | Prefer Vue’s `useId()` (Vue 3.5+) or a stable per-instance counter utility; allow passing `id` via props consistently. |
| D24-007 | 🟢 LOW | src/presentation/components/common/{AppInput,AppTextarea,AppConfirmDialog}.vue | AppInput: 58-60; AppTextarea: 38-39; AppConfirmDialog: 21-22 | **Inconsistent event emitting style in `<script setup>` templates:** several components use `$emit(...)` in templates even though `defineEmits()` is declared. This reduces type-safety and consistency (and can hide event-name typos). | Use the `emit` function returned from `defineEmits()` consistently in templates (e.g., `@focus="emit('focus', $event)"`). |
| D24-008 | 🟢 LOW | src/presentation/components/common/LoadingSpinner.vue | 21-33, 70-92 | **Dead props + hard-coded fallback colors undermine design-token consistency:** `overlay` is declared but not used, and several CSS rules hard-code hex colors as fallback values. | Either implement `overlay` behavior or remove the prop. Replace hard-coded fallbacks with token-only values (or centralize fallbacks in the token definitions). |
| D24-009 | 🟡 MEDIUM | src/presentation/components/common/AppHeader.vue | 45-51 | **Header contains placeholder/incorrect runtime state:** notification count is hard-coded (`ref(3)`) and `onMounted` is imported but unused. This risks shipping a UI that always shows “3” notifications. | Wire notification count to a store/service, or clearly mark as temporary and remove before release. Clean up unused imports. |
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
| D25-003 | 🟢 LOW | src/presentation/components/layout/{AppHeader,AppSidebar}.vue | AppHeader: 19, 32; AppSidebar: 25-26, 36 | **Template uses `$emit` / `$router` instead of typed `emit` + `router`:** this bypasses the type-checked emitter/router instances created in `<script setup>` and is inconsistent with the typed-emits pattern used elsewhere. | Use `emit('toggle-sidebar')` / `emit('close')` / `router.push(...)` via handlers defined in script setup. |
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

## INCIDENT TODO LIST

### Critical Issues (Must Fix)
- [ ] **D7-001** - Application service implementations/call sites drift from interfaces; unify contracts to restore compilability
- [ ] **D9-001** - WebSocket server allows joining any project room without authorization
- [ ] **D10-001** - Frontend WhatsApp gateway exposes Twilio credentials and sends messages client-side
- [ ] **D14-001** - Backend JWT secrets have hard-coded defaults; require env + fail fast

### High Issues (Should Fix)
- [ ] **D1-001** - Domain enums contain UI mappings; move to Presentation/Shared
- [ ] **D3-001** - Domain entities implement API-facing `toJSON()`; move mapping out of Domain
- [ ] **D3-002** - Notification references `user.whatsappEnabled` and bakes in WhatsApp routing
- [ ] **D4-001** - Backend “Domain” repository interfaces depend on Prisma types (`@prisma/client`)
- [ ] **D4-002** - Frontend repository interfaces import enums from wrong modules
- [ ] **D5-001** - DTOs use `Date` types across (likely) JSON boundaries; define transport-safe date types + mappers
- [ ] **D7-002** - Authorization service role mismatch + admin delete bug (commented-out check)
- [ ] **D7-003** - Backend backup uses `exec` with interpolated secrets/params (command injection + leakage risk)
- [ ] **D7-004** - Frontend authentication service mixes mock auth + missing import/type escapes
- [ ] **D8-001** - HTTP client retry path can crash when `error.config` is missing
- [ ] **D8-002** - HTTP client refresh failure can leave requests hanging
- [ ] **D10-002** - Frontend Dropbox service uses access token client-side (secret exposure risk)
- [ ] **D11-001** - Frontend repositories mis-detect Axios 404 and throw instead of returning null
- [ ] **D13-001** - Deadline reminder scheduler creates a separate PrismaClient and never disconnects
- [ ] **D15-001** - Frontend `generateId()` uses `Math.random()`; use crypto-safe UUIDs
- [ ] **D18-001** - Auth store persists access/refresh tokens in `localStorage` (XSS exfiltration risk)
- [ ] **D22-001** - Notification listing endpoint lacks ownership/admin enforcement
- [ ] **D22-002** - Message creation trusts raw request body (spoofing/access risk)

### Medium Issues (Recommended Fix)
- [ ] **D1-002** - TaskPriority includes `URGENT` not in requirements
- [ ] **D1-003** - TaskStatus naming/transitions may diverge from FR11/FR12
- [ ] **D1-004** - ProjectStatus lifecycle may diverge from requirements
- [ ] **D2-001** - Coordinate representation inconsistent across layers
- [ ] **D2-002** - Backend GeoCoordinates equality too strict
- [ ] **D3-003** - Domain entity factories generate IDs with `Date.now()`/`Math.random()`
- [ ] **D3-004** - Dropbox coupling + optional/required type mismatch (`dropboxFolderId`/`dropboxPath`)
- [ ] **D3-005** - `updatedAt` not consistently updated in User setters
- [ ] **D3-006** - `User.authenticate()` throws and is unsafe placeholder behavior
- [ ] **D3-008** - Message `senderRole` is `string` (should align with `UserRole`)
- [ ] **D3-009** - Permission `sectionAccess` accepts arbitrary strings (should be typed/validated)
- [ ] **D4-003** - Repository interfaces are “fat” and leak query patterns
- [ ] **D4-004** - TaskHistory action filtering uses untyped `string`
- [ ] **D5-002** - DTOs include UI/view-model fields (`statusColor`, `isOverdue`, `can*`) without clear boundary
- [ ] **D5-003** - Vendor/channel coupling in DTO contracts (Dropbox/WhatsApp naming)
- [ ] **D5-004** - Weakly typed DTO fields (`statusColor: string`, `action: string`) encourage drift
- [ ] **D6-001** - Service interface error contracts rely on `@throws` without typed/shared error model
- [ ] **D6-002** - Application service interfaces couple directly to Dropbox/WhatsApp concepts
- [ ] **D6-003** - Authorization service interface is fat and returns `Set<AccessRight>`
- [ ] **D7-005** - Project service coordinate truthiness checks + empty-string Dropbox folder IDs
- [ ] **D7-006** - File service uses string section default + builds Dropbox paths from unsanitized inputs
- [ ] **D7-007** - Deadline reminders use string notification types and lack idempotency
- [ ] **D7-008** - Backend export coordinate truthiness checks skip valid `0` coordinates
- [ ] **D8-003** - HTTP client `cancelAllRequests()` abort logic is not wired/initialized
- [ ] **D8-004** - HTTP client response typing relies on unsafe casts; upload response generics inconsistent
- [ ] **D9-002** - WebSocket client reconnect uses stale token; not token-rotation aware
- [ ] **D9-004** - WebSocket client `ConnectionOptions.token` type doesn’t match implementation fallback
- [ ] **D10-003** - Frontend Dropbox metadata mapping can yield invalid dates for folders
- [ ] **D10-004** - Backend Dropbox service swallows broad errors (createFolder/pathExists)
- [ ] **D11-002** - Frontend repositories interpolate unencoded query strings (fragile for ISO dates)
- [ ] **D11-003** - Backend TaskRepository returns `any` and leaks augmented shapes
- [ ] **D12-001** - Frontend TokenStorage stores JWTs in localStorage (XSS exfiltration risk)
- [ ] **D13-002** - Backup scheduler can start with empty `DATABASE_URL` config
- [ ] **D13-003** - Auth middleware role authorization is stringly-typed
- [ ] **D14-002** - Frontend/backend upload constraints diverge (size + MIME/type lists)
- [ ] **D14-003** - Backend config defaults fail open (empty DB URL, debug logging)
- [ ] **D15-002** - Backend `parsePagination()` can propagate `NaN` for invalid query params
- [ ] **D15-003** - Backend auth roles are stringly-typed in shared request/JWT types
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
- [ ] **D20-001** - Backend CORS config must be strict allowlist when credentials are enabled
- [ ] **D20-002** - Backend morgan `dev` logging is not environment-gated
- [ ] **D20-003** - Backend app bootstrap lacks visible rate limiting/brute-force protections
- [ ] **D21-001** - Backend routes don’t express authorization policy consistently (auth-only)
- [ ] **D21-002** - Backend routes mutate `req.params`/`req.query` to reuse controllers
- [ ] **D21-003** - Audit log router instantiates `PrismaClient` in the module
- [ ] **D22-003** - Controllers instantiate `PrismaClient` at module scope
- [ ] **D22-004** - Controllers throw `NotFoundError` for auth/authz failures (wrong status)
- [ ] **D22-005** - Controllers contain verbose `console.*` logs with request bodies/stacks
- [ ] **D22-006** - File upload path uses unsanitized section/filename in Dropbox path
- [ ] **D23-001** - Upload middleware validates by extension only and throws generic errors
- [ ] **D23-002** - Error handler may leak `AppError` message/details to clients
- [ ] **D24-001** - AppModal scroll lock/unlock mutates global body styles (immediate unlock + stacked modal risk)
- [ ] **D24-002** - AppInput number parsing emits `0` for empty and can emit `NaN`
- [ ] **D24-003** - AppSelect placeholder/clear logic breaks for `0` and emits strings for numeric options
- [ ] **D24-004** - ConfirmDialog does not emit `cancel` on overlay/escape/X close
- [ ] **D24-009** - AppHeader uses hard-coded notification count + unused imports
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


### Low Issues (Optional Fix)
- [ ] **D2-003** - Backend GeoCoordinates should reject NaN/Infinity
- [ ] **D3-007** - Task serialization omits `creatorName`/`assigneeName`
- [ ] **D3-010** - Permission uses `Set` in props (prefer array at DTO boundaries)
- [ ] **D4-005** - Backend repository interfaces lack consistent per-method docs
- [ ] **D5-005** - DTO modules include helper/factory functions (consider separating)
- [ ] **D5-006** - Duplicate user DTO shapes + header inconsistency in `user-data.dto.ts`
- [ ] **D6-004** - Project service calendar query takes `Date` parameters (ensure transport-safe mapping)
- [ ] **D8-005** - HTTP client leaves `console.log` statements in delete path
- [ ] **D9-003** - WebSocket client/server include `console.*` debug logs in production paths
- [ ] **D10-005** - Backend Dropbox service uses `console.log` in infra paths
- [ ] **D11-004** - Repositories contain `console.*` debug logs in core paths
- [ ] **D11-005** - Frontend UserRepository mixes paradigms and inconsistent error handling
- [ ] **D11-006** - Backend AuditLogRepository may propagate sensitive error details
- [ ] **D12-002** - TokenStorage imports `ITokenStorage` from HTTP client module (coupling risk)
- [ ] **D12-003** - Prisma query logging and `as never` casts in event hooks
- [ ] **D13-004** - JWT service uses `as any` for `expiresIn` config
- [ ] **D13-005** - Optional auth swallows invalid tokens silently
- [ ] **D14-004** - Backend constants call `dotenv.config()` at import time
- [ ] **D14-005** - Backend constants header `@file` path mismatch
- [ ] **D15-005** - Backend logger console formatter can throw on circular metadata
- [ ] **D15-006** - Backend shared file headers have repeated `@file` path mismatches
- [ ] **D16-002** - High-contrast override uses hard-coded `#000` instead of tokens
- [ ] **D16-003** - Global `*` reset includes margin/padding zero (potential side-effects)
- [ ] **D17-003** - Router uses `console.*` in core navigation/guard paths
- [ ] **D18-007** - Stores contain noisy `console.*` debug logs and leave unused WebSocket unsubscribe
- [ ] **D19-003** - Tasks composable duplicates transition semantics and uses broad “pending” counter
- [ ] **D19-004** - Composable permission checks are UX-only; avoid treating them as authorization
- [ ] **D20-004** - Backend app bootstrap header `@file` path mismatch
- [ ] **D21-004** - Backend route module headers use wrong `@file` paths
- [ ] **D22-007** - Controllers parse query/path inputs without strict validation
- [ ] **D22-008** - Backend controller module headers use wrong `@file` paths
- [ ] **D23-003** - Backend middleware module headers use wrong `@file` paths
- [ ] **D24-005** - AppCard clickable a11y: missing Space key activation
- [ ] **D24-006** - UI components generate IDs via `Math.random()` (SSR/test instability)
- [ ] **D24-007** - Common components use `$emit` instead of typed `emit` in `<script setup>` templates
- [ ] **D24-008** - LoadingSpinner has dead `overlay` prop + hard-coded color fallbacks
- [ ] **D24-010** - Common components header templates are inconsistent
- [ ] **D25-003** - Layout components use `$emit`/`$router` instead of typed `emit`/`router`
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

---

## CROSS-CUTTING CONCERNS

### Type Safety Analysis
**Issues:**
- Type-check is currently failing in multiple layers (tracked as we review groups). Some are rooted in incorrect imports/exports between Domain entities/enums and repository interfaces.
- Several Application service implementations and call sites are out of sync with their declared interfaces, undermining TypeScript’s ability to enforce contracts (D7-001).
- Domain types include some internal mismatches that will surface as TS errors (e.g., `Notification.shouldSendViaWhatsApp()` referencing missing `User.whatsappEnabled`).
- Some domain fields are weakly typed (e.g., `Message.senderRole: string`, `Permission.sectionAccess: string[]`), increasing drift risk vs enums and requirements.
- Many Application DTOs use `Date` types for likely JSON payloads, which can mask runtime mismatches unless a centralized mapping/parsing layer exists (D5-001).
- Several common UI components lose type information at the DOM boundary (notably `<select>` values) and rely on truthiness checks that mis-handle valid values like `0` (D24-003).
- Date-only fields in feature components are round-tripped through `Date` and then formatted via `toISOString()`, which can shift calendar dates depending on timezone (D26-002).
- Task form status logic is mostly enum-based, but some template paths still compare against raw string literals, which is fragile and undermines the value of `TaskStatus` (D27-003).
- Message list date grouping uses `toISOString()` (UTC) for “calendar day” bucketing and Today/Yesterday comparisons, which can mis-group messages across timezones; treat calendar-day keys as a local UI concern (D28-001).
- Notification list grouping repeats the same UTC `toISOString()` calendar-day bug pattern, suggesting a shared utility for local date bucketing would reduce drift across components (D30-001).
- Notification list filter state/contracts are weakly typed (`activeFilter: string`, filter-change emitting `{}` for non-unread), which undermines exhaustive handling and makes parent integration brittle (D30-002/D30-005).
- CalendarWidget uses UTC `toISOString()` for day keys in a local calendar grid; date semantics (local day vs UTC timestamp) should be consistently modeled across the Presentation layer (D31-004).

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

### Security Analysis
**Issues:**
- High-risk operational command execution exists in backend backup flows (D7-003).
- HTTP client contains debug logging that may leak payloads/tokens depending on usage (D8-005).
- WebSocket project room joins are not authorization-guarded, risking cross-project event leakage (D9-001).
- Frontend vendor gateways embed/consume third-party secrets (Twilio/Dropbox), which is a critical credential exposure risk (D10-001/D10-002).
- Some backend database errors include raw underlying message text, which can leak internals if surfaced directly in API responses (D11-006).
- Backend JWT secrets currently have hard-coded defaults, which is a critical “fail-open” security posture if env vars are missing (D14-001).
- Frontend shared ID generation uses `Math.random()` despite claiming UUID v4 compliance; this is not appropriate for security-sensitive identifiers (D15-001).
- Frontend global styles import Google Fonts via third-party URL, which can complicate CSP/privacy requirements depending on deployment constraints (D16-001).
- Router post-login redirect handling does not validate the redirect target, which can cause unexpected navigation and should be hardened (D17-001).
- Auth store persists access/refresh tokens in `localStorage`, increasing XSS blast radius (D18-001).
- Notification store persists notifications in `localStorage` under a global key, which can leak state across users on shared devices (D18-006).
- Backend app bootstrap should harden CORS + production logging and add rate limiting (D20-001/D20-002/D20-003).
- Backend routes should make authorization policy explicit (D21-001).
- Backend controllers include at least one clear access-control gap (notifications) and trust client-provided message payloads (D22-001/D22-002).
- Backend controllers log request bodies/stacks via `console.*`, increasing leakage risk (D22-005).
- Upload middleware should validate beyond extensions and error handler responses should avoid leaking internals (D23-001/D23-002).
- Additional security review will be covered in Infrastructure/Auth/HTTP/WebSocket groups.

### Performance Analysis
**Issues:**
- Some client-side denormalization patterns can trigger N+1 request cascades (e.g., project summary mapping fetching client/tasks/unread per project) and should be addressed with backend aggregation/batching (D18-004).
- TaskList sorts by repeatedly constructing `Date` objects inside the comparator; if task counts grow large, consider caching timestamps or pre-normalizing date fields in a view-model layer to reduce re-parse work during reactive updates.
- FileList sorting repeatedly constructs `Date` objects inside the comparator; for larger lists, cache timestamps or precompute derived sort keys to avoid repeated parsing on reactive updates (D29-006).
- NotificationList’s dual load-more mechanisms can cause duplicate fetches if parent `loadingMore` state lags; consider a single guarded trigger to avoid redundant work (D30-003).
- CalendarWidget recomputes the 42-day grid by filtering entire project/task arrays per day with repeated `Date` parsing; pre-bucketing items by day key will scale better (D31-003).


---

**Report Generated:** 2026-03-05
**Next Review Scheduled:** After Phase 2 (Application) completes
