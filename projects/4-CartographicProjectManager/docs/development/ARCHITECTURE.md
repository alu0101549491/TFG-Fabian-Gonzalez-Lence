# Architecture Guide — Cartographic Project Manager (CPM)

## 1. Architectural Overview

The CPM application follows a **Layered Architecture with Clean Architecture** principles. The system is organized into four concentric layers, where dependencies always point inward — outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────────────────────┐
│                 Presentation Layer                   │
│  Vue 3 Components · Pinia Stores · Router · Views   │
├─────────────────────────────────────────────────────┤
│                 Application Layer                   │
│  Service Interfaces · Implementations · DTOs        │
├─────────────────────────────────────────────────────┤
│                   Domain Layer                      │
│  Entities · Value Objects · Enumerations ·          │
│  Repository Interfaces                              │
├─────────────────────────────────────────────────────┤
│               Infrastructure Layer                  │
│  Repository Impl. · HTTP · WebSocket · Adapters     │
└─────────────────────────────────────────────────────┘
```

### Dependency Rule

- **Domain** has no external dependencies. It defines business entities, value objects, and repository contracts (interfaces).
- **Application** depends only on Domain. It orchestrates use cases through service implementations that consume repository interfaces.
- **Infrastructure** implements Domain interfaces (repositories) and provides concrete adapters for external systems (Dropbox, WhatsApp, WebSocket).
- **Presentation** depends on Application (via composables that wrap Pinia stores, which call application services).

This follows the **Dependency Inversion Principle (DIP)**: high-level modules do not depend on low-level modules; both depend on abstractions.

---

## 2. Layer Responsibilities

### 2.1 Domain Layer (`src/domain/`)

**Purpose**: Contains the core business logic, independent of any framework or technology.

| Component           | Description                                          |
|---------------------|------------------------------------------------------|
| `entities/`         | Business objects with identity: User, Project, Task, TaskHistory, Message, Notification, File, Permission |
| `enumerations/`     | Type-safe enums: UserRole, ProjectType, ProjectStatus, TaskStatus, TaskPriority, NotificationType, FileType, AccessRight |
| `value-objects/`    | Immutable objects without identity: GeoCoordinates   |
| `repositories/`     | Interface contracts for data access (IUserRepository, IProjectRepository, etc.) |

**Key Design Decisions**:
- Entities encapsulate business rules (e.g., `Project.canTransitionTo()` validates status changes).
- Repository interfaces live in Domain so Application can use them without knowing Infrastructure.
- Enumerations use TypeScript `enum` for type safety and IDE support.

### 2.2 Application Layer (`src/application/`)

**Purpose**: Orchestrates use cases by coordinating domain entities and repository interfaces.

| Component           | Description                                          |
|---------------------|------------------------------------------------------|
| `dto/`              | Data Transfer Objects for layer boundary crossing    |
| `interfaces/`       | Service contracts (IAuthenticationService, IProjectService, etc.) |
| `services/`         | Use case implementations consuming injected repositories |

**Key Design Decisions**:
- Services receive repository interfaces via **constructor injection** (DI pattern).
- DTOs decouple the domain model from the presentation layer's data needs.
- Each service corresponds to a bounded context (Auth, Project, Task, Message, etc.).

### 2.3 Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Provides concrete implementations for domain interfaces and external system integrations.

| Component              | Description                                       |
|------------------------|---------------------------------------------------|
| `repositories/`        | HTTP-based implementations of domain repository interfaces |
| `http/`                | Axios-based HttpClient singleton with auth token interceptors |
| `websocket/`           | Socket.io-client wrapper for real-time events     |
| `external-services/`   | Adapter classes for Dropbox API and WhatsApp Business API |

**Key Design Decisions**:
- **HttpClient** uses the **Singleton pattern** to share a single Axios instance with pre-configured interceptors.
- **DropboxService** and **WhatsAppGateway** use the **Adapter pattern** to wrap third-party APIs behind clean interfaces.
- Repository implementations translate between domain entities and API payloads.

### 2.4 Presentation Layer (`src/presentation/`)

**Purpose**: User interface layer built with Vue 3 Composition API.

| Component           | Description                                          |
|---------------------|------------------------------------------------------|
| `views/`            | Page-level components mapped to routes               |
| `components/`       | Reusable UI components organized by feature domain   |
| `stores/`           | Pinia stores managing reactive state                 |
| `composables/`      | Vue composable hooks wrapping store interactions      |
| `router/`           | Vue Router configuration with auth guards            |
| `styles/`           | CSS custom properties and global styles              |

**Key Design Decisions**:
- **Composition API** (`<script setup>`) for all components — consistent, concise, better TypeScript support.
- **Pinia stores** use the setup (Composition API) syntax for consistency with components.
- **Composables** provide an abstraction layer between components and stores, allowing easier testing and migration.
- **Lazy-loaded routes** for code splitting and performance (NFR01: < 3s load).

---

## 3. Design Patterns

### 3.1 Repository Pattern
- **Where**: Domain `repositories/` (interfaces) ↔ Infrastructure `repositories/` (implementations)
- **Why**: Decouples business logic from data access concerns. Allows swapping backends (REST, GraphQL, local storage) without changing domain or application code.

### 3.2 Service Layer
- **Where**: Application `services/`
- **Why**: Encapsulates use case logic. Each service method maps to a user action (e.g., `createProject()`, `assignTask()`).

### 3.3 Dependency Injection
- **Where**: Application services receive repository interfaces via constructor parameters.
- **Why**: Enables testability (mock repositories in unit tests) and adheres to DIP.

### 3.4 Adapter Pattern
- **Where**: Infrastructure `external-services/` (DropboxService, WhatsAppGateway)
- **Why**: Wraps third-party APIs behind stable internal interfaces. Changes to external APIs only affect the adapter, not the application.

### 3.5 Singleton Pattern
- **Where**: Infrastructure `http/HttpClient`
- **Why**: Ensures a single Axios instance with shared configuration (base URL, auth interceptors, error handling).

### 3.6 Observer Pattern
- **Where**: Infrastructure `websocket/SocketHandler`
- **Why**: Enables real-time event handling for notifications and messages without polling.

### 3.7 Strategy Pattern
- **Where**: Application `services/ExportService`
- **Why**: Allows pluggable export format strategies (CSV, PDF, etc.) without modifying the export service.

### 3.8 Factory Pattern
- **Where**: Domain entities with static creation methods
- **Why**: Centralizes entity construction and validation logic.

---

## 4. Data Flow

### 4.1 Read Operation (e.g., Load Project List)

```
View → Composable → Store → Service → Repository Interface
                                              ↓
                                     Repository Implementation
                                              ↓
                                         HttpClient → REST API
```

### 4.2 Write Operation (e.g., Create Task)

```
Component (form submit)
  → Composable.createTask(dto)
    → Store.createTask(dto)
      → TaskService.createTask(dto)
        → ITaskRepository.create(task)
          → TaskRepository.create(task)
            → HttpClient.post('/tasks', payload)
              → REST API
```

### 4.3 Real-time Event (e.g., New Message Notification)

```
WebSocket Server → SocketHandler.on('message:new')
  → NotificationStore.addNotification()
    → Component reactivity updates UI
```

---

## 5. Routing Architecture

Routes are organized by feature and protected by authentication guards:

| Route               | View                 | Auth | Role    |
|---------------------|----------------------|------|---------|
| `/login`            | LoginView            | No   | Any     |
| `/dashboard`        | DashboardView        | Yes  | Any     |
| `/projects`         | ProjectListView      | Yes  | Any     |
| `/projects/:id`     | ProjectDetailsView   | Yes  | Any     |
| `/calendar`         | CalendarView         | Yes  | Any     |
| `/notifications`    | NotificationsView    | Yes  | Any     |
| `/backup`           | BackupView           | Yes  | Admin   |

---

## 6. State Management

Pinia stores are organized by domain concern:

| Store              | Responsibility                                |
|--------------------|-----------------------------------------------|
| `useAuthStore`     | Authentication state, user session, tokens    |
| `useProjectStore`  | Project list, selected project, CRUD actions  |
| `useTaskStore`     | Task list per project, task CRUD, filtering   |
| `useMessageStore`  | Messages per project, send/receive, read status|
| `useNotificationStore` | Notification list, unread count, mark as read |

---

## 7. Testing Strategy

- **Unit Tests**: Domain entities, application services (mocked repos), Pinia stores.
- **Component Tests**: Vue components with `@vue/test-utils`, verifying rendering, props, events.
- **Coverage Target**: ≥ 80% (NFR09) across branches, functions, lines, and statements.
- **Test Runner**: Jest with `ts-jest` preset and `jsdom` environment.

---

## 8. Architectural Decision Records (ADRs)

### ADR-001: Vue 3 Composition API over Options API
- **Decision**: Use `<script setup lang="ts">` exclusively.
- **Rationale**: Better TypeScript inference, tree-shaking, composability, and consistency.

### ADR-002: Pinia over Vuex
- **Decision**: Use Pinia for state management.
- **Rationale**: First-party Vue 3 support, TypeScript-first, simpler API, devtools integration.

### ADR-003: Layered Architecture with Clean Architecture
- **Decision**: Four-layer architecture with dependency inversion.
- **Rationale**: Separation of concerns, testability, framework independence for business logic.

### ADR-004: Constructor Injection for DI
- **Decision**: Pass repository interfaces via constructor parameters in services.
- **Rationale**: Simple, framework-agnostic DI without a container. Services are testable with mock implementations.

### ADR-005: Barrel Exports per Layer
- **Decision**: Each directory has an `index.ts` barrel file.
- **Rationale**: Clean import paths, encapsulation of internal module structure, easier refactoring.
