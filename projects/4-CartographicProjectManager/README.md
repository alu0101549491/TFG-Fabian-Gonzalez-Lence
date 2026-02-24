# Cartographic Project Manager (CPM)

A web/mobile application for managing cartographic projects, built with **Vue.js 3**, **TypeScript**, and **Clean Architecture** principles.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Design Patterns](#design-patterns)
- [Non-Functional Requirements](#non-functional-requirements)
- [Documentation](#documentation)

## Overview

CPM enables a cartographic company to manage projects, tasks, communications, and file exchange between administrators and clients. Key features include:

- **User Authentication** — Secure login with session management (NFR05: 15-min timeout).
- **Project Management** — CRUD with status tracking (Pending → In Progress → Delivered → Completed).
- **Task Management** — Creation, assignment, prioritization, and full history audit trail.
- **Real-time Messaging** — Per-project chat with WebSocket notifications (< 5s delivery).
- **File Management** — Upload, download, and **Dropbox cloud storage** integration with automatic folder organization.
- **Calendar View** — Delivery dates and task deadlines at a glance.
- **Backup & Restore** — Admin-only data backup through the UI.
- **Data Export** — Filtered project data export.
- **WhatsApp Notifications** — External notification gateway integration.

## Architecture

This project follows a **Layered Architecture with Clean Architecture** principles:

```
┌────────────────────────────────────┐
│       Presentation Layer           │  Vue 3 Components, Router, Pinia Stores
├────────────────────────────────────┤
│       Application Layer            │  Service Interfaces & Implementations, DTOs
├────────────────────────────────────┤
│       Domain Layer                 │  Entities, Value Objects, Enumerations, Repository Interfaces
├────────────────────────────────────┤
│       Infrastructure Layer         │  Repository Implementations, HTTP Client, WebSocket, External Services
└────────────────────────────────────┘
```

Dependencies flow **inward** (Presentation → Application → Domain ← Infrastructure), following the Dependency Inversion Principle.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architectural documentation.

## Tech Stack

| Category         | Technology                     | Version  |
|------------------|--------------------------------|----------|
| Language         | TypeScript                     | 5.6.3    |
| Framework        | Vue.js 3 (Composition API)     | 3.5.13   |
| State Management | Pinia                          | 2.3.0    |
| Routing          | vue-router                     | 4.5.0    |
| Build Tool       | Vite                           | 7.3.0    |
| HTTP Client      | Axios                          | 1.7.9    |
| Real-time        | Socket.io-client               | 4.8.1    |
| Testing          | Jest + ts-jest + @vue/test-utils | 29.7.0 |
| Linting          | ESLint + typescript-eslint     | 9.15.0   |
| Documentation    | TypeDoc                        | 0.26.10  |

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

## Setup

```bash
# Clone the repository (if not already)
git clone <repository-url>
cd projects/4-CartographicProjectManager

# Install dependencies
npm install

# Start the development server
npm run dev
```

Or use the initialization script:

```bash
chmod +x initialization.sh
./initialization.sh
```

## Available Scripts

| Command              | Description                              |
|----------------------|------------------------------------------|
| `npm run dev`        | Start Vite development server (port 5173)|
| `npm run build`      | Type-check and build for production      |
| `npm run preview`    | Preview the production build             |
| `npm run lint`       | Run ESLint                               |
| `npm run lint:fix`   | Run ESLint with auto-fix                 |
| `npm run test`       | Run Jest test suite                      |
| `npm run test:coverage` | Run tests with coverage report        |
| `npm run doc`        | Generate TypeDoc documentation           |

## Project Structure

```
src/
├── domain/                    # Domain Layer (innermost)
│   ├── entities/              #   Business entities (User, Project, Task, etc.)
│   ├── enumerations/          #   Type enumerations (UserRole, ProjectStatus, etc.)
│   ├── repositories/          #   Repository interfaces (contracts)
│   └── value-objects/         #   Value objects (GeoCoordinates)
│
├── application/               # Application Layer
│   ├── dto/                   #   Data Transfer Objects
│   ├── interfaces/            #   Service interfaces
│   └── services/              #   Service implementations (use cases)
│
├── infrastructure/            # Infrastructure Layer
│   ├── external-services/     #   Dropbox, WhatsApp adapters
│   ├── http/                  #   Axios HttpClient singleton
│   ├── repositories/          #   Repository implementations (HTTP-based)
│   └── websocket/             #   Socket.io handler
│
├── presentation/              # Presentation Layer (outermost)
│   ├── components/            #   Vue SFC reusable components
│   │   ├── calendar/          #     Calendar widget
│   │   ├── common/            #     AppHeader, AppSidebar, AppFooter, LoadingSpinner
│   │   ├── file/              #     FileUploader, FileList
│   │   ├── message/           #     MessageList, MessageBubble, MessageInput
│   │   ├── notification/      #     NotificationList, NotificationItem
│   │   ├── project/           #     ProjectCard, ProjectForm, ProjectSummary
│   │   └── task/              #     TaskList, TaskCard, TaskForm, TaskHistory
│   ├── composables/           #   Vue composable hooks
│   ├── router/                #   Vue Router configuration
│   ├── stores/                #   Pinia state stores
│   ├── styles/                #   Global CSS (variables, main)
│   └── views/                 #   Page-level view components
│
├── shared/                    # Cross-cutting concerns
│   ├── constants.ts           #   App-wide constants
│   └── utils.ts               #   Utility functions
│
├── App.vue                    # Root component
├── main.ts                    # Application entry point
└── vite-env.d.ts              # Vite type declarations
```

## Design Patterns

| Pattern              | Usage                                              |
|----------------------|----------------------------------------------------|
| **Repository**       | Abstract data access behind interfaces              |
| **Service Layer**    | Orchestrate use cases in Application services       |
| **Factory**          | Entity creation with validation                    |
| **Observer**         | WebSocket real-time event handling                 |
| **Strategy**         | Pluggable export format strategies                 |
| **Dependency Injection** | Constructor-based injection in services       |
| **Adapter**          | Wrap external APIs (Dropbox, WhatsApp)             |
| **Singleton**        | HttpClient Axios instance                          |

## Non-Functional Requirements

| ID    | Requirement                       | Target                    |
|-------|-----------------------------------|---------------------------|
| NFR01 | Initial load time                 | < 3 seconds              |
| NFR02 | API response time                 | < 2 seconds              |
| NFR05 | Session timeout                   | 15 minutes               |
| NFR06 | Responsive design                 | Mobile-first (320px+)    |
| NFR09 | Minimum test coverage             | ≥ 80%                    |
| NFR12 | Notification delivery             | < 5 seconds (WebSocket)  |

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Dropbox Integration Setup](docs/DROPBOX-INTEGRATION.md)
- [Dropbox Deployment Guide](docs/DROPBOX-DEPLOYMENT.md) - Production strategies
- API docs: Run `npm run doc` → `docs/` directory
