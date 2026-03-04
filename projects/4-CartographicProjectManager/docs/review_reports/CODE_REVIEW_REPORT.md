# CODE REVIEW REPORT
## Cartographic Project Manager (CPM)

**Review Date:** March 4, 2026
**Reviewer:** GitHub Copilot Agent
**Codebase Version:** dd8d063
**Total Files Reviewed:** 70
**Total Groups Reviewed:** 7

---

## EXECUTIVE SUMMARY

**Overall Codebase Score:** TBD/10

**Summary:**
Initial review (Domain enumerations + entities) shows strong documentation discipline and helpful type-guard utilities, but also reveals a recurring architecture smell: Domain types are currently carrying Presentation/Infrastructure concerns (UI mappings in enums, and JSON serialization + WhatsApp/Dropbox coupling in entities), which undermines Clean Architecture boundaries and increases coupling.

**Statistics (so far):**
- Critical Issues: 1
- High Issues: 9
- Medium Issues: 23
- Low Issues: 7
- Total Issues: 40

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

## INCIDENT TODO LIST

### Critical Issues (Must Fix)
- [ ] **D7-001** - Application service implementations/call sites drift from interfaces; unify contracts to restore compilability

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

### Low Issues (Optional Fix)
- [ ] **D2-003** - Backend GeoCoordinates should reject NaN/Infinity
- [ ] **D3-007** - Task serialization omits `creatorName`/`assigneeName`
- [ ] **D3-010** - Permission uses `Set` in props (prefer array at DTO boundaries)
- [ ] **D4-005** - Backend repository interfaces lack consistent per-method docs
- [ ] **D5-005** - DTO modules include helper/factory functions (consider separating)
- [ ] **D5-006** - Duplicate user DTO shapes + header inconsistency in `user-data.dto.ts`
- [ ] **D6-004** - Project service calendar query takes `Date` parameters (ensure transport-safe mapping)

---

## CROSS-CUTTING CONCERNS

### Type Safety Analysis
**Issues:**
- Type-check is currently failing in multiple layers (tracked as we review groups). Some are rooted in incorrect imports/exports between Domain entities/enums and repository interfaces.
- Several Application service implementations and call sites are out of sync with their declared interfaces, undermining TypeScript’s ability to enforce contracts (D7-001).
- Domain types include some internal mismatches that will surface as TS errors (e.g., `Notification.shouldSendViaWhatsApp()` referencing missing `User.whatsappEnabled`).
- Some domain fields are weakly typed (e.g., `Message.senderRole: string`, `Permission.sectionAccess: string[]`), increasing drift risk vs enums and requirements.
- Many Application DTOs use `Date` types for likely JSON payloads, which can mask runtime mismatches unless a centralized mapping/parsing layer exists (D5-001).

### Consistency Analysis
**Issues:**
- UI labels/colors/icons are currently embedded into Domain enumerations, which risks inconsistent UI behavior and complicates localization/theming.

### Security Analysis
**Issues:**
- High-risk operational command execution exists in backend backup flows (D7-003).
- Additional security review will be covered in Infrastructure/Auth/HTTP/WebSocket groups.

### Performance Analysis
**Issues:**
- Not assessed yet (will be covered in Infrastructure/HTTP/WebSocket + large components).

---

**Report Generated:** 2026-03-04
**Next Review Scheduled:** After Phase 2 (Application) completes
