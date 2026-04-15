# Tennis Tournament Manager (TENNIS)

A responsive web application for managing multiple simultaneous tennis tournaments, built with **Angular 19**, **TypeScript**, and **Clean Architecture** principles.

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

TENNIS enables tournament organizers, referees, and players to manage the full lifecycle of tennis tournaments. Key features include:

- **User Authentication** — Role-based access with JWT sessions (NFR12: 30-min timeout).
- **Tournament Management** — CRUD with lifecycle tracking (Draft → Open → In Progress → Completed → Cancelled).
- **Category & Court Management** — Multiple categories per tournament, court scheduling with surface types.
- **Registration System** — Player sign-up with acceptance workflows (automatic, manual, first-come).
- **Bracket Generation** — Factory-based generation of single-elimination, round-robin, and group stage brackets.
- **Live Scoring** — Real-time match score updates via WebSocket (< 5s delivery per NFR5).
- **Order of Play** — Calendar/timeline scheduling of matches per court with conflict detection.
- **Standings & Rankings** — Category standings with multi-system global rankings (ELO, points, WTN).
- **Notifications** — Multi-channel delivery (in-app, email, Telegram, Web Push) per NFR5.
- **Announcements** — Tournament-wide public communications board.
- **Statistics** — Player and tournament aggregated statistics.
- **Payments** — Registration fee tracking with external payment gateway integration.
- **Sanctions** — Player warning, point penalty, and disqualification management.

## Architecture

This project follows a **Layered Architecture with Clean Architecture** principles:

```
┌────────────────────────────────────┐
│       Presentation Layer           │  Angular 19 Standalone Components, Router, Guards
├────────────────────────────────────┤
│       Application Layer            │  Service Interfaces & Implementations, DTOs
├────────────────────────────────────┤
│       Domain Layer                 │  Entities, Enumerations, Repository Interfaces
├────────────────────────────────────┤
│       Infrastructure Layer         │  Repository Implementations, HTTP Client, WebSocket, External Adapters
└────────────────────────────────────┘
```

Dependencies flow **inward** (Presentation → Application → Domain ← Infrastructure), following the Dependency Inversion Principle.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architectural documentation.

## Tech Stack

| Category         | Technology                        | Version  |
|------------------|-----------------------------------|----------|
| Language         | TypeScript                        | 5.6.3    |
| Framework        | Angular (Standalone Components)   | 19.2.0   |
| Build Tool       | Vite + @analogjs/vite-plugin-angular | 7.3.0 |
| HTTP Client      | Axios                             | 1.7.9    |
| Real-time        | Socket.io-client                  | 4.8.1    |
| Unit Testing     | Jest + ts-jest                    | 29.7.0   |
| E2E Testing      | Playwright                        | 1.58.2   |
| Linting          | ESLint + typescript-eslint        | 9.15.0   |
| Documentation    | TypeDoc                           | 0.26.10  |

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

## Setup

```bash
# Clone the repository (if not already)
git clone <repository-url>
cd projects/5-TennisTournamentManager

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Available Scripts

| Command                | Description                                  |
|------------------------|----------------------------------------------|
| `npm run dev`          | Start Vite development server (port 4200)    |
| `npm run build`        | Type-check and build for production          |
| `npm run preview`      | Preview the production build                 |
| `npm run lint`         | Run ESLint                                   |
| `npm run lint:fix`     | Run ESLint with auto-fix                     |
| `npm run test`         | Run Jest test suite                          |
| `npm run test:coverage`| Run tests with coverage report               |
| `npm run test:e2e`     | Run Playwright E2E tests                     |
| `npm run doc`          | Generate TypeDoc documentation               |

## Project Structure

```
src/
├── domain/                    # Domain Layer (innermost)
│   ├── entities/              #   Business entities (User, Tournament, Match, etc.)
│   ├── enumerations/          #   Type enumerations (UserRole, TournamentStatus, etc.)
│   └── repositories/          #   Repository interfaces (contracts)
│
├── application/               # Application Layer
│   ├── dto/                   #   Data Transfer Objects
│   ├── interfaces/            #   Service interfaces
│   └── services/              #   Service implementations (use cases)
│       └── common/            #     Shared errors and utilities
│
├── infrastructure/            # Infrastructure Layer
│   ├── external/              #   Email, Telegram, WebPush, Payment, Export adapters
│   ├── http/                  #   Axios HttpClient singleton
│   ├── repositories/          #   Repository implementations (HTTP-based)
│   └── websocket/             #   Socket.io handler
│
├── presentation/              # Presentation Layer (outermost)
│   ├── guards/                #   Route guards (auth, role)
│   ├── interceptors/          #   HTTP interceptors (auth, error)
│   ├── pages/                 #   Page-level Angular components
│   │   ├── admin/             #     Admin dashboard
│   │   ├── announcements/     #     Announcement list
│   │   ├── auth/              #     Login, Register
│   │   ├── brackets/          #     Bracket view
│   │   ├── matches/           #     Match list, Match detail
│   │   ├── notifications/     #     Notification list
│   │   ├── order-of-play/     #     Order of play calendar
│   │   ├── profile/           #     User profile
│   │   ├── ranking/           #     Global ranking
│   │   ├── standings/         #     Category standings
│   │   ├── statistics/        #     Statistics dashboard
│   │   └── tournaments/       #     Tournament list, Tournament detail
│   ├── services/              #   Angular services (AuthStateService)
│   ├── app.component.ts       #   Root component
│   ├── app.config.ts          #   Application config and providers
│   └── app.routes.ts          #   Route definitions
│
├── shared/                    # Cross-cutting concerns
│   ├── constants.ts           #   App-wide constants (API URLs, timeouts, limits)
│   └── utils.ts               #   Utility functions
│
└── main.ts                    # Application entry point

tests/                         # Unit tests (mirrors src/ layout)
├── domain/entities/           #   One test per entity
└── application/services/      #   One test per service

e2e/                           # Playwright E2E tests
```

## Design Patterns

| Pattern                  | Usage                                                      |
|--------------------------|------------------------------------------------------------|
| **Repository**           | Abstract data access behind interfaces for all 17 entities |
| **Service Layer**        | Orchestrate use cases in Application services              |
| **Factory**              | `BracketGeneratorFactory` — bracket type selection         |
| **Observer**             | `NotificationService` — multi-channel event delivery       |
| **Strategy**             | `RankingSystem` — pluggable ranking algorithms (ELO, WTN)  |
| **State**               | `MatchStatus`, `RegistrationStatus` — lifecycle transitions|
| **Dependency Injection** | Constructor-based injection in services                    |
| **Adapter**              | Wrap external APIs (Email, Telegram, Payment Gateway)      |
| **Singleton**            | `AxiosClient` HTTP instance, `SocketClient` WebSocket      |

## Non-Functional Requirements

| ID    | Requirement                       | Target                         |
|-------|-----------------------------------|--------------------------------|
| NFR1  | Initial load time                 | < 3 seconds                   |
| NFR2  | API response time                 | < 2 seconds                   |
| NFR3  | Input validation                  | Client + server-side           |
| NFR4  | Concurrent users                  | ≥ 200 simultaneous             |
| NFR5  | Real-time sync                    | < 5 seconds (WebSocket)        |
| NFR6  | Responsive design                 | Mobile-first (320px+)          |
| NFR7  | Accessibility                     | WCAG 2.1 AA                    |
| NFR8  | Browser support                   | Chrome, Firefox, Safari, Edge  |
| NFR9  | Test coverage                     | ≥ 70%                          |
| NFR10 | Documentation                     | TypeDoc + docs/ARCHITECTURE.md |
| NFR11 | Code style                        | Google Style Guide (ESLint)    |
| NFR12 | Session timeout                   | 30 minutes (JWT)               |
| NFR13 | Role-based access control         | System Admin, Tournament Admin, Referee, Player, Spectator |

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- API docs: Run `npm run doc` → `docs/` directory
