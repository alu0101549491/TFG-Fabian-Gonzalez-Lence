Talking with the Error Debugging Agent I noticed that I don't have any backend implemented for the Cartographic Project Manager. The agent said this:

```
I'll check if there's a backend implementation for this project.    

Read [](file:///home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager)

Searched for files matching `**/projects/4-CartographicProjectManager/**/server.ts`, no matches

Searched for files matching `**/projects/4-CartographicProjectManager/**/server.js`, no matches

Searched for files matching `**/projects/4-CartographicProjectManager/**/api/**`, no matches

Read [](file:///home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/infrastructure)

Searched for text `httpClient` (`**/projects/4-CartographicProjectManager/src/infrastructure/**/*.ts`), 20 results

Read [](file:///home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/package.json)

Searched for text `baseURL` (`**/projects/4-CartographicProjectManager/**/*.ts`), 10 results

Searched for text `VITE_API` (`**/projects/4-CartographicProjectManager/**/*.ts`), 3 results

Read [](file:///home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/infrastructure/http/axios.client.ts#1-1), lines 1 to 150

Read [](file:///home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/shared/constants.ts#1-1), lines 1 to 100

Searched for files matching `**/projects/4-CartographicProjectManager/.env*`, no matches

Read [](file:///home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/src/infrastructure/persistence)

Searched for text `MockRepository` (`**/projects/4-CartographicProjectManager/src/**/*.ts`), no results

Searched for text `InMemory` (`**/projects/4-CartographicProjectManager/src/**/*.ts`), no results

Read [](file:///home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/README.md)

Read [](file:///home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/docs)

Based on my investigation, **the backend is NOT implemented** for this project. Here's what I found:

## Current State

This is a **frontend-only application** that expects to connect to an external backend API server.

### Evidence:

1. **No Backend Server Files**: There are no server implementation files (Express, Fastify, etc.)
2. **No Backend Dependencies**: The package.json only contains frontend dependencies (Vue, Vite, Axios, etc.) - no backend frameworks or database drivers
3. **HTTP Client Configuration**: The application is configured to make HTTP requests to:
   - Default: `http://localhost:3000/api/v1`
   - Configurable via `VITE_API_BASE_URL` environment variable

4. **Repository Pattern**: All repositories (User, Project, Task, File, etc.) are implemented as **HTTP-based clients** using Axios, not direct database access

5. **No Database Configuration**: There are no database connection files or ORM configurations

## What Needs to Be Implemented

To make the application functional, you need a separate backend API that provides:

### Required API Endpoints:

- **Authentication**: `/api/v1/auth/login`, `/api/v1/auth/register`, etc.
- **Users**: `/api/v1/users` (including `GET /users?role=CLIENT` for fetching clients)
- **Projects**: `/api/v1/projects`
- **Tasks**: `/api/v1/tasks`
- **Messages**: `/api/v1/messages`
- **Notifications**: `/api/v1/notifications`
- **Files**: `/api/v1/files`
- **WebSocket**: Socket.io server at `http://localhost:3000` (or `VITE_SOCKET_URL`)

### Recommended Backend Stack:

Based on the architecture, you could implement the backend using:
- **Node.js** + **Express** or **Fastify**
- **TypeScript** (to match the frontend)
- **PostgreSQL** or **MongoDB** for database
- **Socket.io** for real-time messaging
- **JWT** for authentication

For now, the mock data I added for clients is a temporary workaround until you implement the backend API.
```

So let's implement a fully functional backend based on what we got.
