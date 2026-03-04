# CODE REVIEW REPORT
## Cartographic Project Manager (CPM)

**Review Date:** March 4, 2026
**Reviewer:** GitHub Copilot Agent
**Codebase Version:** dd8d063
**Total Files Reviewed:** 32
**Total Groups Reviewed:** 4

---

## EXECUTIVE SUMMARY

**Overall Codebase Score:** TBD/10

**Summary:**
Initial review (Domain enumerations + entities) shows strong documentation discipline and helpful type-guard utilities, but also reveals a recurring architecture smell: Domain types are currently carrying Presentation/Infrastructure concerns (UI mappings in enums, and JSON serialization + WhatsApp/Dropbox coupling in entities), which undermines Clean Architecture boundaries and increases coupling.

**Statistics (so far):**
- Critical Issues: 0
- High Issues: 5
- Medium Issues: 13
- Low Issues: 4
- Total Issues: 22

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

## INCIDENT TODO LIST

### High Issues (Should Fix)
- [ ] **D1-001** - Domain enums contain UI mappings; move to Presentation/Shared
- [ ] **D3-001** - Domain entities implement API-facing `toJSON()`; move mapping out of Domain
- [ ] **D3-002** - Notification references `user.whatsappEnabled` and bakes in WhatsApp routing
- [ ] **D4-001** - Backend “Domain” repository interfaces depend on Prisma types (`@prisma/client`)
- [ ] **D4-002** - Frontend repository interfaces import enums from wrong modules

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

### Low Issues (Optional Fix)
- [ ] **D2-003** - Backend GeoCoordinates should reject NaN/Infinity
- [ ] **D3-007** - Task serialization omits `creatorName`/`assigneeName`
- [ ] **D3-010** - Permission uses `Set` in props (prefer array at DTO boundaries)
- [ ] **D4-005** - Backend repository interfaces lack consistent per-method docs

---

## CROSS-CUTTING CONCERNS

### Type Safety Analysis
**Issues:**
- Type-check is currently failing in multiple layers (tracked as we review groups). Some are rooted in incorrect imports/exports between Domain entities/enums and repository interfaces.
- Domain types include some internal mismatches that will surface as TS errors (e.g., `Notification.shouldSendViaWhatsApp()` referencing missing `User.whatsappEnabled`).
- Some domain fields are weakly typed (e.g., `Message.senderRole: string`, `Permission.sectionAccess: string[]`), increasing drift risk vs enums and requirements.

### Consistency Analysis
**Issues:**
- UI labels/colors/icons are currently embedded into Domain enumerations, which risks inconsistent UI behavior and complicates localization/theming.

### Security Analysis
**Issues:**
- Not assessed yet (will be covered in Infrastructure/Auth/HTTP/WebSocket groups).

### Performance Analysis
**Issues:**
- Not assessed yet (will be covered in Infrastructure/HTTP/WebSocket + large components).

---

**Report Generated:** 2026-03-04
**Next Review Scheduled:** After Phase 1 (Domain) completes
