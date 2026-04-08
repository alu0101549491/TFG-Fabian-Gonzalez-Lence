# Cartographic Project Manager - Backend API

Backend REST API server for the Cartographic Project Manager application, built with Node.js, Express, TypeScript, PostgreSQL, and Socket.io.

> **📚 NEW: Comprehensive Documentation Available!**
>
> - **[Backend Implementation Guide](../docs/development/BACKEND-IMPLEMENTATION.md)** - Complete feature reference, authentication details, and integration guide
> - **[Implementation Summary](../docs/development/IMPLEMENTATION-SUMMARY.md)** - What's been implemented and how to use it
> - **[Quick Start](#-quick-start)** - Get running in 5 minutes
>
> **✅ Status**: Production-ready with bcrypt password hashing, JWT authentication, and complete API

---

## 🚀 Quick Start

**The fastest way to get started:**

```bash
./setup.sh  # Automated setup
npm run dev # Start server
```

**OR manually:**

## 🏗️ Architecture

This backend follows **Clean Architecture** principles with clear separation of concerns:

```
backend/
├── src/
│   ├── domain/           # Business entities, value objects, interfaces
│   ├── application/      # Use cases, DTOs, application services
│   ├── infrastructure/   # Database, external services, implementations
│   ├── presentation/     # HTTP controllers, routes, WebSocket handlers
│   ├── shared/           # Common utilities, constants, types
│   └── server.ts         # Application entry point
├── prisma/               # Database schema and migrations
└── tests/                # Unit and integration tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 14.0

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   SEED_CONFIRM=I_UNDERSTAND npm run prisma:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Server will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users` - List all users (supports ?role= filter)
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/email/:email` - Get user by email
- `GET /api/v1/users/username/:username` - Get user by username
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Projects
- `GET /api/v1/projects` - List projects (supports filters)
- `GET /api/v1/projects/:id` - Get project by ID
- `GET /api/v1/projects/code/:code` - Get project by code
- `POST /api/v1/projects` - Create new project
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Tasks
- `GET /api/v1/tasks` - List tasks
- `GET /api/v1/tasks/:id` - Get task by ID
- `POST /api/v1/tasks` - Create new task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Messages
- `GET /api/v1/messages` - List messages
- `GET /api/v1/messages/:id` - Get message by ID
- `POST /api/v1/messages` - Send new message

### Notifications
- `GET /api/v1/notifications` - List notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Files
- `GET /api/v1/files` - List files
- `GET /api/v1/files/:id` - Get file metadata
- `POST /api/v1/files/upload` - Upload file
- `DELETE /api/v1/files/:id` - Delete file

## 🔌 WebSocket Events

### Client → Server
- `message:send` - Send new message
- `task:update` - Update task status
- `notification:subscribe` - Subscribe to notifications

### Server → Client
- `message:received` - New message received
- `task:updated` - Task status changed
- `notification:new` - New notification

## 🗄️ Database Schema

Uses PostgreSQL with Prisma ORM. Main tables:
- `User` - System users (admin, client, special)
- `Project` - Cartographic projects
- `Task` - Project tasks
- `Message` - Project-specific messages
- `Notification` - User notifications
- `File` - File metadata
- `Permission` - Special user permissions
- `TaskHistory` - Task status change audit

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run prisma:studio` - Open Prisma Studio (DB GUI)
- `npm run db:reset` - Reset database and reseed

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 🔐 Authentication

Uses JWT (JSON Web Tokens) for authentication:
- Access tokens expire in 7 days (configurable)
- Refresh tokens expire in 30 days
- Tokens are returned in the JSON response body; clients send them via the `Authorization: Bearer <token>` header

Note: Cookie-based (httpOnly) auth is not implemented in the current backend.

## � Deployment

This backend can be deployed to cloud platforms with PostgreSQL support:

### Render (Recommended - Free Tier Available)

**Quick Deploy:**
1. Create account at [render.com](https://render.com)
2. New → Blueprint
3. Connect GitHub repository
4. Set manual environment variables (Dropbox, CORS)
5. Deploy automatically

See **[RENDER.md](./RENDER.md)** for complete deployment guide.

**Files:**
- `render.yaml` - Infrastructure as Code blueprint
- `.env.render.example` - Environment variables template
- `RENDER.md` - Complete deployment guide

### Railway (Alternative)

See **[RAILWAY.md](./RAILWAY.md)** for Railway deployment instructions.

**Files:**
- `railway.json` - Railway deployment configuration
- `nixpacks.toml` - Build configuration
- `.env.railway.example` - Environment variables template

### Environment Variables

Both platforms require these environment variables:
- `DATABASE_URL` - PostgreSQL connection (auto-provided)
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Authentication secrets
- `DROPBOX_APP_KEY` / `DROPBOX_APP_SECRET` / `DROPBOX_REFRESH_TOKEN` - File storage
- `CORS_ORIGIN` / `SOCKET_CORS_ORIGIN` - Frontend URLs

Run `npm run get-dropbox-token` locally to generate Dropbox refresh token before deployment.

## �📝 Author

**Fabián González Lence**
- Email: alu0101549491@ull.edu.es
- University: Universidad de La Laguna
- Degree: Computer Engineering - Final Degree Project (TFG)

## 📄 License

MIT License - See LICENSE file for details
