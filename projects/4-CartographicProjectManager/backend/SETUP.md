# Cartographic Project Manager - Backend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Update `JWT_SECRET` with a secure random string
- Configure `CORS_ORIGIN` to match your frontend URL

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with sample data
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server will be running at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Users (Protected)
- `GET /api/v1/users` - List users (with ?role filter)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Projects (Protected)
- `GET /api/v1/projects` - List projects (with filters)
- `GET /api/v1/projects/:id` - Get project
- `POST /api/v1/projects` - Create project
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Tasks (Protected)
- `GET /api/v1/tasks` - List tasks (with filters)
- `GET /api/v1/tasks/:id` - Get task
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Messages (Protected)
- `GET /api/v1/messages/project/:projectId` - Get project messages
- `POST /api/v1/messages` - Send message

### Notifications (Protected)
- `GET /api/v1/notifications/user/:userId` - Get user notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Files (Protected)
- `GET /api/v1/files/project/:projectId` - Get project files
- `POST /api/v1/files` - Upload file
- `DELETE /api/v1/files/:id` - Delete file

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🌱 Seed Data

After running `npm run prisma:seed`, you'll have:

### Admin Account
- **Email:** admin@cartographic.com
- **Password:** admin123
- **Role:** ADMINISTRATOR

### Client Account
- **Email:** john@example.com
- **Password:** client123
- **Role:** CLIENT

## 🛠️ Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Reset database and reseed
npm run db:reset

# Run tests
npm test

# Lint code
npm run lint
```

## 📦 Project Structure

```
backend/
├── src/
│   ├── application/      # Use cases and services
│   ├── domain/           # Business logic and interfaces
│   ├── infrastructure/   # External concerns (DB, auth, etc.)
│   ├── presentation/     # Controllers, routes, middleware
│   ├── shared/           # Utilities and common code
│   └── server.ts         # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── package.json 
```

## 🔧 Troubleshooting

### Database Connection Issues

If you get connection errors:
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database exists: `createdb cartographic_manager`

### Port Already in Use

If port 3000 is busy:
1. Change `PORT` in `.env`
2. Update frontend `VITE_API_BASE_URL` accordingly

### Migration Errors

If migrations fail:
```bash
npm run db:reset  # Warning: This deletes all data
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [JWT Best Practices](https://jwt.io/introduction)
