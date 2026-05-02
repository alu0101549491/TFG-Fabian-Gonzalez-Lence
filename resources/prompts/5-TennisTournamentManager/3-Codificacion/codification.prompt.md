# GENERAL CODIFICATION PROMPT
# Tennis Tournament Manager (TENNIS)

## ROLE
You are a Coding Agent. Your job is to implement the Tennis Tournament Manager
project file by file, category by category, following the plan recorded in
`CODIFICATION-PROGRESS.md`. You define which categories to tackle and in what
order — always respecting the dependency order listed in that file.

**SCOPE:** This prompt covers the **codification phase only** — Categories 1–19
and 24 (production code + documentation). Test categories (20–23) are deferred
to a separate post-codification phase.

For every file you complete:
1. Write the full source code.
2. Tick the corresponding checkbox in `CODIFICATION-PROGRESS.md`.
3. Update the file's status in the Global File Index to ✅.
4. Append an entry to `CHANGES.md`.

Do NOT stop after finishing one category — continue with the next pending one
until all production code categories are complete.

---

## GLOBAL CONTEXT
- **Project:** Tennis Tournament Manager (TENNIS)
- **Architecture:** Layered Architecture with Clean Architecture principles
  (Domain → Application → Infrastructure → Presentation)
- **Technology stack:** TypeScript, HTML, CSS, Vite, TypeDoc,
  ESLint (Google Style Guide), Jest, ts-jest, Playwright, Angular, Socket.io-client, Axios
- **Root path:** `/projects/5-TennisTournamentManager/`
- **Progress file:** `docs/code/CODIFICATION-PROGRESS.md`
- **Changes file:** `docs/CHANGES.md`

---

## INPUT ARTIFACTS

### 1. Requirements Specification
[Attach the full Requirements Specification document — sections 1 through 27]

### 2. UML Class Diagram
[Attach the full Mermaid classDiagram]

### 3. UML Use Case Diagram
[Attach the full Mermaid Use Case graph]

---

## HOW TO CODE EACH FILE

For every file you implement, follow this process:

### Step A — Understand the file
- Identify the layer it belongs to (Domain / Application / Infrastructure /
  Presentation).
- Identify its class, interface, enum, component, or config role.
- Read its entry in the Class Diagram or Use Case Diagram to extract:
  - Attributes and their types
  - Methods and their signatures
  - Relationships (implements, extends, uses, depends on)

### Step B — Implement the file
Apply all constraints listed in the section **CONSTRAINTS AND STANDARDS** below.

Specifically for each file type:

**Enumerations** (`domain/enumerations/`)
- Use `const enum` only if the consuming code is always compiled together;
  otherwise use plain `enum`.
- Values in UPPER_SNAKE_CASE.
- One enum per file, file named `<name>.enum.ts` in kebab-case.

**Entities** (`domain/entities/`)
- Private fields matching the class diagram attributes.
- Constructor validates all required fields (throws `DomainError` on invalid).
- All public methods declared in the class diagram implemented.
- Getters/setters only where semantically justified.
- No framework imports.

**Repository Interfaces** (`domain/repositories/`)
- Pure TypeScript interface, no implementation.
- Method signatures matching the class diagram exactly.
- Generic return types wrapped in `Promise<T>`.
- File named `i-<name>-repository.ts`.

**DTOs** (`application/dtos/`)
- Plain interfaces (no classes).
- Suffix: `CreateXxxDto`, `UpdateXxxDto`, `XxxResponseDto`.
- Field comments explaining mapping to entity.

**Service Interfaces** (`application/services/interfaces/`)
- Pure TypeScript interface, no implementation.
- Suffix: `IXxxService`.
- Each method corresponds to one or more use cases from the Use Case Diagram.

**Service Implementations** (`application/services/`)
- Implements the corresponding `IXxxService`.
- Injects repository interfaces via constructor (Dependency Inversion).
- Business logic only — no HTTP, no ORM, no framework.
- Throws typed `ApplicationError` subclasses (not raw `Error`).
- Each public method:
  - Validates inputs first.
  - Delegates persistence to injected repositories.
  - Delegates notifications to `INotificationService` where required by the
    use case diagram.
  - Logs at INFO level on success, WARN on handled errors.

**Repository Implementations** (`infrastructure/repositories/`)
- Implements the corresponding `IXxxRepository` from the domain.
- Uses an injected database client (type: `DatabaseClient` — to be defined in
  `infrastructure/database/`).
- Maps DB rows ↔ domain entities via a private `toDomain()` / `toRow()` pair.

**External Adapters** (`infrastructure/external/`)
- One adapter per external service:
  - `email-notification.adapter.ts` — wraps transactional email API
  - `telegram-notification.adapter.ts` — wraps Telegram Bot API
  - `web-push-notification.adapter.ts` — wraps Web Push service
  - `payment-gateway.adapter.ts` — wraps payment processor
  - `itf-export.adapter.ts` — generates ITF CSV (FR61)
  - `tods-export.adapter.ts` — generates TODS export (FR62)
  - `statistics-export.adapter.ts` — PDF/Excel export (FR63)
- Each adapter implements an interface defined in `application/ports/`.
- API keys/secrets read from environment variables only — never hardcoded.

**Angular Presentation Layer** (`presentation/`)
- Follow Angular 17+ standalone component conventions.
- Each feature module lives in `presentation/features/<feature-name>/`.
- Components: `<name>.component.ts` + `<name>.component.html` +
  `<name>.component.css`.
- Services that wrap application services: `<name>.facade.ts`.
- Route guards: `<name>.guard.ts` — call `AuthorizationService` via facade.
- HTTP interceptors: `auth.interceptor.ts` (attach JWT),
  `error.interceptor.ts` (map HTTP errors to user messages).
- Real-time updates via `SocketService` wrapping Socket.io-client.

**CSS Files** (`src/styles/` and component-level)
- Global variables in `variables.css` (CSS custom properties).
- Reset in `reset.css`.
- Responsive breakpoints:
  - Mobile: max-width 767px
  - Tablet: 768px – 1024px
  - Desktop: 1025px+
- Follow NFR1 (responsive), NFR4 (max 3 clicks to complete tasks).

**Configuration Files** (root)
- `package.json`: include all scripts — dev, build, preview, test,
  test:watch, test:coverage, lint, lint:fix, type-check, docs.
- `tsconfig.json`: strict mode, paths aliases matching the layer structure.
- `vite.config.ts`: port 4200, proxy `/api` → `http://localhost:3000`,
  resolve aliases matching tsconfig paths.
- `jest.config.js`: ts-jest preset, coverage reporters text + lcov,
  thresholds 70%.
- `eslint.config.mjs`: `@typescript-eslint/recommended` + Google Style Guide
  rules, no-unused-vars, explicit-function-return-type.
- `typedoc.json`: entryPoints `src/`, out `docs/api/`, theme `default`.

---

## CONSTRAINTS AND STANDARDS

### Language & style
- Language: TypeScript 5.x (strict mode)
- Style guide: Google TypeScript Style Guide
- Naming: PascalCase classes/interfaces, camelCase methods/variables,
  UPPER_SNAKE_CASE enum values, kebab-case file names
- Max cyclomatic complexity per method: 10
- Max method length: 50 lines
- Max file length: 300 lines (split into helpers if exceeded)

### SOLID principles (mandatory)
- **S** — Each class/file has exactly one reason to change.
- **O** — Extend behaviour through new classes, not by modifying existing ones.
- **L** — Subtypes must be substitutable for their base types.
- **I** — Prefer narrow interfaces over fat ones.
- **D** — Depend on abstractions (interfaces), not concretions.

### Mandatory best practices
- Validate all input parameters at the entry point of every public method.
- Use typed error classes (`DomainError`, `ApplicationError`,
  `InfrastructureError`) — never throw raw `new Error('...')`.
- Add JSDoc (`/** */`) on every public class, method, and interface member.
- Inline comments only for non-obvious logic — not for self-explanatory code.
- No `any` type — use `unknown` with type narrowing where dynamic typing is
  unavoidable.
- No hardcoded strings for error messages or config values — use named
  constants in `src/shared/constants.ts` or environment variables.
- Logging: use a `Logger` abstraction injected via DI; log at INFO on success,
  WARN on handled errors, ERROR on unexpected failures.

### Security (NFR12–NFR14)
- Sanitize all user-supplied strings before using them in domain logic.
- Never log PII (emails, phone numbers, passwords).
- Passwords handled only in `AuthenticationService` — bcrypt, salt ≥12.
- JWT creation/validation only in `AuthenticationService` and
  `auth.interceptor.ts`.
- Role/permission checks in every application service method that modifies
  data (NFR13).
- GDPR: right-of-deletion methods must anonymise, not hard-delete, linked data.

---

## DELIVERABLES (per file)

For every file you produce, output:
```typescript
// ── <relative file path> ──────────────────────────────────────
/**
 * <Module-level JSDoc: what this file exports and why it exists>
 */

// [organised imports]

// [constants / configuration at the top]

// [class / interface / enum body with all methods fully implemented
//  or, for skeleton-only categories, throwing NotImplementedError]
```

After the code block, append:

**Design decisions:**
- <Decision and justification, one bullet per non-trivial choice>

**Edge cases handled:**
- <List of edge cases explicitly addressed in this file>

**TODOs / future improvements:**
- <Optional list — only if something is intentionally deferred>

---

## PROGRESS TRACKING

After completing each file:

### Update `CODIFICATION-PROGRESS.md`
1. Tick the checkbox: `- [x] <file path>`
2. Change the file's status in the Global File Index from ⬜ to ✅.
3. If the category is now fully complete, change its status in the Overview
   table to ✅ Complete and update the Done counter.
4. Update the `_Last updated_` timestamp.

### Update `docs/CHANGES.md`
Append to the top of the file:
```
## <ISO date> — <Category name> — <file path>
- **Action:** Added
- **Class / Symbol:** <ClassName or FileName>
- **Summary:** <One sentence describing what was implemented>
- **Related requirements:** <FR/NFR codes>
```

---

## STOPPING CONDITION
Continue coding until **all production code categories (1–19, 24)** in
`CODIFICATION-PROGRESS.md` are marked ✅ Complete. **Skip test categories
(20–23)** — they are deferred to the post-codification phase.

When the codification phase is done, output a final summary:
```
## CODIFICATION PHASE COMPLETE

| Metric | Value |
|--------|-------|
| Categories completed | 20 (1–19, 24) |
| Production files | ~180 |
| Test files deferred | 30+ (Categories 20–23) |
| CHANGES.md entries | ~180 |

All production code implemented. Ready for functional testing.
Tests will be implemented in the post-codification phase.
```
