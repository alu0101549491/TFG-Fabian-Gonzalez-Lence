# CODE REVIEW REPORT
## Cartographic Project Manager (CPM)

**Review Date:** March 4, 2026
**Reviewer:** GitHub Copilot Agent
**Codebase Version:** dd8d063
**Total Files Reviewed:** 102
**Total Groups Reviewed:** 14

---

## EXECUTIVE SUMMARY

**Overall Codebase Score:** TBD/10

**Summary:**
Initial review (Domain enumerations + entities) shows strong documentation discipline and helpful type-guard utilities, but also reveals a recurring architecture smell: Domain types are currently carrying Presentation/Infrastructure concerns (UI mappings in enums, and JSON serialization + WhatsApp/Dropbox coupling in entities), which undermines Clean Architecture boundaries and increases coupling.

**Statistics (so far):**
- Critical Issues: 4
- High Issues: 14
- Medium Issues: 36
- Low Issues: 19
- Total Issues: 73

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
- HTTP client contains debug logging that may leak payloads/tokens depending on usage (D8-005).
- WebSocket project room joins are not authorization-guarded, risking cross-project event leakage (D9-001).
- Frontend vendor gateways embed/consume third-party secrets (Twilio/Dropbox), which is a critical credential exposure risk (D10-001/D10-002).
- Some backend database errors include raw underlying message text, which can leak internals if surfaced directly in API responses (D11-006).
- Backend JWT secrets currently have hard-coded defaults, which is a critical “fail-open” security posture if env vars are missing (D14-001).
- Additional security review will be covered in Infrastructure/Auth/HTTP/WebSocket groups.

### Performance Analysis
**Issues:**
- Not assessed yet (will be covered in Infrastructure/HTTP/WebSocket + large components).

---

**Report Generated:** 2026-03-04
**Next Review Scheduled:** After Phase 2 (Application) completes
