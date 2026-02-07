# Cartographic Project Manager (CPM)

A comprehensive web and mobile application for managing cartographic projects with administrator-client collaboration.

## Features

- **Project Management**: Create, assign, and finalize cartographic projects
- **Task Management**: Bidirectional task assignment between admin and clients
- **Internal Messaging**: Project-specific messaging with file attachments
- **File Management**: Dropbox integration for technical file storage
- **Real-time Notifications**: WebSocket-based notifications with WhatsApp integration
- **Permission System**: Granular access control for special users
- **Export & Backup**: Data export in multiple formats and automated backups

## Technology Stack

- **Frontend**: Vue.js 3 (Composition API), TypeScript, Vite
- **State Management**: Pinia
- **Real-time**: Socket.io
- **HTTP Client**: Axios
- **Testing**: Jest, ts-jest
- **Documentation**: TypeDoc
- **Code Quality**: ESLint (Google Style Guide)

## Architecture

The application follows a **Layered Architecture** with **Clean Architecture** principles:

- **Domain Layer**: Entities, Value Objects, Enumerations, Repository Interfaces
- **Application Layer**: Service Interfaces, Service Implementations, DTOs
- **Infrastructure Layer**: Repository Implementations, External Services
- **Presentation Layer**: Vue.js Components, Stores, Composables, Router

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cartographic-project-manager

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Generate documentation
npm run docs
```

### Project Structure

```
src/
├── domain/           # Domain entities, value objects, enums
├── application/      # Application services and DTOs
├── infrastructure/   # Repository implementations, external services
└── presentation/     # Vue.js components, views, stores
```

## Development

### Code Style

This project follows the Google TypeScript Style Guide. Run ESLint to check:

```bash
npm run lint
npm run lint:fix
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Documentation

Generate API documentation with TypeDoc:

```bash
npm run docs
```

Documentation will be available in `docs/api/generated/`.

## Architecture Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## License

[Your License]

## Contributing

[Contributing Guidelines]
