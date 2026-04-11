# Architecture Guide — Tennis Tournament Manager (TENNIS)

## 1. Architectural Style

The Tennis Tournament Manager follows a **Layered Architecture with Clean Architecture** principles. The four layers — Domain, Application, Infrastructure, and Presentation — enforce a strict dependency rule: dependencies point **inward**, from outer layers to inner layers, never the reverse.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  Angular 19 Components · Router · Guards · Interceptors     │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│  Service Interfaces · Service Implementations · DTOs        │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  Entities · Enumerations · Repository Interfaces            │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                        │
│  Repository Impls · HTTP · WebSocket · External Adapters    │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rule

- **Domain** depends on nothing — it is the innermost, purest layer.
- **Application** depends on Domain (entities, enumerations, repository interfaces).
- **Infrastructure** depends on Domain (implements repository interfaces) and Application (uses DTOs).
- **Presentation** depends on Application (invokes services) and Domain (references enumerations/entities for display).

This is enforced at the import level via TypeScript path aliases (`@domain`, `@application`, `@infrastructure`, `@presentation`, `@shared`).

## 2. Layer Responsibilities

### 2.1 Domain Layer (`src/domain/`)

Contains the core business model — 17 entities, 12 enumerations, and 17 repository interfaces. This layer has **zero external dependencies**.

| Artifact                | Count | Purpose                                   |
|------------------------|-------|-------------------------------------------|
| **Entities**            | 17    | Business objects with invariants           |
| **Enumerations**        | 12    | Type-safe status/type constants            |
| **Repository Interfaces** | 17  | Data access contracts (Dependency Inversion) |

**Key entities**: `User`, `Tournament`, `Category`, `Court`, `Registration`, `Bracket`, `Phase`, `Match`, `Score`, `Standing`, `GlobalRanking`, `OrderOfPlay`, `Notification`, `Announcement`, `Statistics`, `Payment`, `Sanction`.

### 2.2 Application Layer (`src/application/`)

Implements use cases through 13 service interfaces with their corresponding implementations. Defines DTOs for data transfer between layers.

| Artifact                 | Count | Purpose                                  |
|--------------------------|-------|------------------------------------------|
| **Service Interfaces**   | 13    | Contract for use cases                   |
| **Service Implementations** | 13 + 1 Factory | Business logic orchestration |
| **DTOs**                 | 13 files | Input/output data shapes               |
| **Common Utilities**     | 2     | Shared errors and helper functions       |

**Key services**: `AuthenticationService`, `TournamentService`, `BracketService`, `MatchService`, `NotificationService`, `RankingService`.

### 2.3 Infrastructure Layer (`src/infrastructure/`)

Provides concrete implementations for repository interfaces and integrations with external systems.

| Artifact                 | Count | Purpose                                  |
|--------------------------|-------|------------------------------------------|
| **Repository Impls**     | 17    | HTTP-based data access via `AxiosClient` |
| **HTTP Client**          | 1     | `AxiosClient` singleton (base URL, JWT)  |
| **WebSocket Client**     | 1     | `SocketClient` for real-time events      |
| **External Adapters**    | 5     | Email, Telegram, WebPush, Payment, Export |

### 2.4 Presentation Layer (`src/presentation/`)

Angular 19 standalone components organized by feature area, with functional guards and HTTP interceptors.

| Artifact                | Count | Purpose                                   |
|------------------------|-------|-------------------------------------------|
| **Page Components**     | 15    | Feature pages (lazy-loaded)               |
| **Guards**              | 2     | `authGuard`, `roleGuard`                  |
| **Interceptors**        | 2     | `authInterceptor`, `errorInterceptor`     |
| **Services**            | 1     | `AuthStateService` (JWT state management) |
| **Root Config**         | 3     | `AppComponent`, `appConfig`, `routes`     |

## 3. Design Patterns

### 3.1 Repository Pattern

Every domain entity has an associated repository interface in `domain/repositories/` and a concrete implementation in `infrastructure/repositories/`. This decouples the domain from data access technology.

```
domain/repositories/ITournamentRepository  ←  infrastructure/repositories/TournamentRepositoryImpl
```

### 3.2 Factory Pattern — Bracket Generation

`BracketGeneratorFactory` in `application/services/` selects the appropriate `IBracketGenerator` strategy based on `BracketType`:

```
BracketType.SINGLE_ELIMINATION  → SingleEliminationGenerator
BracketType.ROUND_ROBIN         → RoundRobinGenerator
BracketType.GROUP_STAGE         → GroupStageGenerator
```

### 3.3 Observer Pattern — Notification Delivery

`NotificationService` implements multi-channel notification delivery. When an event occurs (match update, registration confirmation), it dispatches through:
- In-app (repository)
- Email (`EmailAdapter`)
- Telegram (`TelegramAdapter`)
- Web Push (`WebPushAdapter`)

### 3.4 Strategy Pattern — Ranking System

`RankingService` supports multiple ranking algorithms via the `RankingSystem` enumeration:
- `ELO` — Chess-style rating
- `POINTS` — Cumulative points
- `WTN` — World Tennis Number

### 3.5 State Pattern — Lifecycle Transitions

`TournamentStatus` and `MatchStatus` enumerations model valid state transitions:

```
Tournament: DRAFT → OPEN → IN_PROGRESS → COMPLETED
                                       → CANCELLED (from any state)

Match: SCHEDULED → IN_PROGRESS → COMPLETED
                               → SUSPENDED → IN_PROGRESS
                               → CANCELLED (from SCHEDULED)
```

### 3.6 Adapter Pattern — External Integrations

Infrastructure adapters wrap third-party APIs behind application-level interfaces:

| Adapter                  | External System               |
|--------------------------|-------------------------------|
| `EmailAdapter`           | SMTP/SendGrid                 |
| `TelegramAdapter`        | Telegram Bot API              |
| `WebPushAdapter`         | Web Push API (VAPID)          |
| `PaymentGatewayAdapter`  | Stripe/PayPal                 |
| `ExportServiceAdapter`   | ITF/TODS format, CSV export   |

## 4. Data Flow

### Example: Live Score Update

```
1. Referee enters score  →  MatchDetailComponent (Presentation)
2. Component calls       →  MatchService.updateScore() (Application)
3. Service validates     →  Match.updateScore() (Domain)
4. Service persists      →  IMatchRepository.update() → MatchRepositoryImpl (Infrastructure)
5. Service notifies      →  NotificationService.send() → SocketClient.emit() (Infrastructure)
6. WebSocket delivers    →  Other clients receive real-time update (< 5s)
```

### Example: Bracket Generation

```
1. Admin requests bracket →  BracketViewComponent (Presentation)
2. Component calls        →  BracketService.generate() (Application)
3. Service delegates      →  BracketGeneratorFactory.create(type) (Application)
4. Factory returns        →  IBracketGenerator implementation
5. Generator produces     →  Bracket + Phase[] + Match[] (Domain)
6. Service persists       →  IBracketRepository.save() (Infrastructure)
```

## 5. Security Architecture

| Concern                | Implementation                                |
|------------------------|-----------------------------------------------|
| Authentication         | JWT tokens with 30-minute expiry (NFR12)      |
| Authorization          | Role-based guards (`roleGuard`) per route     |
| Token Transport        | `authInterceptor` injects Bearer header       |
| Session Management     | `AuthStateService` with localStorage          |
| Error Handling         | `errorInterceptor` redirects on 401/403       |
| Input Validation       | Client-side (Angular validators) + server-side |

### Role Hierarchy

```
SYSTEM_ADMIN > TOURNAMENT_ADMIN > REFEREE > PLAYER > SPECTATOR
```

## 6. Real-Time Architecture

WebSocket communication via `SocketClient` (Socket.io-client) provides:

- **Match score updates** — Live scoring broadcast to all viewers
- **Order of play changes** — Court assignment updates
- **Notifications** — Instant multi-channel delivery

Target latency: < 5 seconds (NFR5).

## 7. Testing Strategy

| Type       | Tool       | Location        | Coverage Target |
|------------|------------|-----------------|-----------------|
| Unit       | Jest       | `tests/`        | ≥ 70% (NFR9)   |
| E2E        | Playwright | `e2e/`          | Critical paths  |

Test files mirror the `src/` directory structure:
- `tests/domain/entities/` — One test per entity (17 files)
- `tests/application/services/` — One test per service (13 files)

## 8. Build & Deployment

- **Development**: `npm run dev` → Vite dev server on port 4200
- **Production**: `npm run build` → Optimized bundle with tree-shaking
- **API Proxy**: `/api` → `http://localhost:3000` (Vite proxy config)
- **Base URL**: `/5-TennisTournamentManager/`

## 9. ADR Log

### ADR-001: Angular with Vite over Angular CLI

**Decision**: Use Angular 19 standalone components with `@analogjs/vite-plugin-angular` instead of the default Angular CLI (Webpack/esbuild).

**Rationale**: Consistency with the TFG project series (all projects use Vite). Faster HMR, simpler configuration, and unified tooling across projects.

### ADR-002: Axios over Angular HttpClient for Application/Infrastructure layers

**Decision**: Use Axios for HTTP communication in the infrastructure layer, while Angular's `HttpClient` is available in the presentation layer for interceptor support.

**Rationale**: Keeps the infrastructure layer framework-agnostic. Axios provides request/response interceptors, automatic JSON transforms, and is used consistently across the TFG project series.

### ADR-003: Jest over Karma for unit testing

**Decision**: Use Jest with `ts-jest` for unit tests instead of Angular's default Karma/Jasmine.

**Rationale**: Faster execution, better snapshot support, built-in coverage reporting, and consistency with the other TFG projects.

### ADR-004: Standalone Components over NgModules

**Decision**: Use Angular 19 standalone components exclusively, without NgModules.

**Rationale**: Modern Angular best practice (Angular 17+). Reduces boilerplate, simplifies lazy loading via `loadComponent`, and makes the component tree more explicit.
