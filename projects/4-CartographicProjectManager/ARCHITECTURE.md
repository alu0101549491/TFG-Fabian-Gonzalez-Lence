# Architecture Documentation

## Overview

The Cartographic Project Manager (CPM) follows a **Layered Architecture** combined with **Clean Architecture** principles, ensuring separation of concerns, testability, and maintainability.

## Architectural Layers

### 1. Domain Layer (`src/domain/`)

**Responsibility**: Core business logic and rules

**Components**:
- **Entities**: Core business objects (User, Project, Task, Message, etc.)
- **Value Objects**: Immutable objects representing concepts (GeoCoordinates)
- **Enumerations**: Type-safe constants (UserRole, ProjectStatus, TaskStatus, etc.)
- **Repository Interfaces**: Contracts for data persistence

**Key Principles**:
- No dependencies on other layers
- Contains pure business logic
- Framework-agnostic
- Highly testable

### 2. Application Layer (`src/application/`)

**Responsibility**: Application business rules and use cases

**Components**:
- **Service Interfaces**: Define application operations
- **Service Implementations**: Implement business workflows
- **DTOs**: Data Transfer Objects for inter-layer communication

**Key Principles**:
- Depends only on Domain layer
- Orchestrates domain objects
- Implements use cases
- Framework-agnostic

### 3. Infrastructure Layer (`src/infrastructure/`)

**Responsibility**: Technical implementations and external integrations

**Components**:
- **Repository Implementations**: Data persistence logic
- **External Services**: Dropbox, WhatsApp integrations
- **WebSocket**: Real-time communication handlers
- **Database**: Persistence configuration

**Key Principles**:
- Implements interfaces from Domain and Application layers
- Contains framework-specific code
- Handles external dependencies

### 4. Presentation Layer (`src/presentation/`)

**Responsibility**: User interface and user interaction

**Components**:
- **Components**: Reusable Vue.js components
- **Views**: Page-level components
- **Stores**: Pinia state management
- **Composables**: Reusable composition functions
- **Router**: Navigation configuration

**Key Principles**:
- Depends on Application layer services
- Vue.js specific
- Handles user input and display

## Design Patterns

### Repository Pattern
- Abstracts data access
- Interfaces in Domain layer
- Implementations in Infrastructure layer
- Example: `IUserRepository` → `UserRepository`

### Service Layer Pattern
- Encapsulates business logic
- Interfaces in Application layer
- Uses repositories and domain entities
- Example: `IProjectService` → `ProjectService`

### Dependency Injection
- All services receive dependencies via constructor
- Facilitates testing and loose coupling
- Example:
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly dropboxService: IDropboxService
  ) {}

### Factory Pattern
- Creates complex objects
- Used for entities with initialization logic
- Example: Project creation with Dropbox folder

### Observer Pattern
- Real-time notifications
- WebSocket event handling
- Vue.js reactive state management

### Strategy Pattern
- Export formats (CSV, PDF, Excel)
- Backup strategies
- Interchangeable algorithms

### Adapter Pattern
- External service integration
- Dropbox API wrapper
- WhatsApp gateway

## Dependency Flow

```
Presentation Layer
       ↓
Application Layer
       ↓
  Domain Layer
       ↑
Infrastructure Layer
```

**Key Rule**: Dependencies point inward. Inner layers know nothing about outer layers.

## Data Flow

1. **User Action** (Presentation Layer)
   ↓
2. **Service Call** (Application Layer)
   ↓
3. **Business Logic** (Domain Layer)
   ↓
4. **Data Persistence** (Infrastructure Layer)
   ↓
5. **External Services** (if needed)

## Testing Strategy

### Unit Tests
- Domain entities and value objects
- Application services (with mocked repositories)
- Utilities and helpers

### Integration Tests
- Service + Repository integration
- External service adapters
- API endpoints

### Component Tests
- Vue.js components
- User interactions
- State management

## Non-Functional Requirements Alignment

- **NFR7**: JWT authentication in Application layer
- **NFR9**: Authorization service validates permissions
- **NFR10-11**: Scalable service architecture
- **NFR12**: WebSocket for real-time notifications
- **NFR17**: Vue.js 3 with Composition API
- **NFR18**: TypeDoc for documentation
- **NFR19**: TaskHistory for audit trail
- **NFR20**: Jest for automated testing

## Future Considerations

- **Microservices**: Current monolithic design can be split by bounded contexts
- **CQRS**: Separate read/write models for complex queries
- **Event Sourcing**: For complete audit trail
- **API Gateway**: For multiple client types
