# Tennis Tournament Manager Backend - Quick Start Guide

## 🎉 Backend Successfully Running! 

Your Tennis Tournament Manager backend server is now operational.

---

## 📊 Server Status

✅ **API Server**: `http://localhost:3000/api`  
✅ **WebSocket Server**: `ws://localhost:3000`  
✅ **Database**: PostgreSQL (`tennis_tournament_manager`)  
✅ **Environment**: Development mode with hot reload  

---

## 🔑 Default Admin Credentials

Use these credentials to log in:

```
Email:    admin@tennistournament.com
Password: Admin123!
```

---

## 🚀 Available API Endpoints

### Authentication
- `POST /api/auth/login` — User login (JWT)
- `POST /api/auth/register` — User registration
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — User logout

### Users
- `GET /api/users/profile` — Get current user profile
- `PATCH /api/users/profile` — Update profile
- `GET /api/users` — List all users (admin only)

### Tournaments
- `POST /api/tournaments` — Create tournament
- `GET /api/tournaments` — List tournaments (with filters)
- `GET /api/tournaments/:id` — Get tournament details
- `PATCH /api/tournaments/:id` — Update tournament
- `DELETE /api/tournaments/:id` — Delete tournament

### Categories, Courts, Registrations
- `GET /api/categories/:tournamentId` — List categories
- `GET /api/courts/:tournamentId` — List courts
- `POST /api/registrations` — Register for tournament
- `GET /api/registrations/:tournamentId` — List registrations
- `PATCH /api/registrations/:id/status` — Update registration status

### Brackets & Matches
- `POST /api/brackets/generate` — Generate tournament bracket
- `GET /api/brackets/:id` — Get bracket details
- `GET /api/brackets/tournament/:tournamentId` — List brackets
- `GET /api/matches` — List matches (with filters)
- `GET /api/matches/:id` — Get match details
- `PATCH /api/matches/:id/score` — Update match score
- `PATCH /api/matches/:id/status` — Change match status

### Standings & Rankings
- `GET /api/standings/:tournamentId/:categoryId` — Category standings
- `GET /api/rankings` — Global player rankings

### Order of Play
- `GET /api/order-of-play/:tournamentId/:date` — Daily match schedule

### Notifications & Announcements
- `GET /api/notifications` — List user notifications
- `PATCH /api/notifications/:id/read` — Mark as read
- `POST /api/announcements` — Create announcement (admin/referee)
- `GET /api/announcements/:tournamentId` — List announcements

### Statistics, Payments, Sanctions
- `GET /api/statistics/:playerId` — Player statistics
- `POST /api/payments` — Create payment
- `GET /api/payments` — List user payments
- `POST /api/sanctions` — Issue sanction (referee only)
- `GET /api/sanctions/:matchId` — List match sanctions

---

## 🔌 WebSocket Events

Connect to `ws://localhost:3000` (requires JWT authentication)

### Events Emitted by Server:
- `match:updated` — Match score/status changed
- `order-of-play:changed` — Schedule updated
- `notification:new` — New notification for user

---

## 💻 Development Commands

```bash
# Backend development server (with hot reload)
cd backend && npm run dev

# Seed database (create admin user)
cd backend && npm run db:seed

# Run database migrations
cd backend && npm run db:migrate

# Frontend development server
npm run dev  # (in project root)
```

---

## 🗄️ Database Configuration

**Connection Details** (from `.env`):
- Host: `localhost`
- Port: `5432`
- Database: `tennis_tournament_manager`
- Username: `postgres`
- Password: `postgres`

**To reset database**:
```bash
sudo -u postgres psql -c "DROP DATABASE tennis_tournament_manager;"
sudo -u postgres psql -c "CREATE DATABASE tennis_tournament_manager;"
cd backend && npm run db:seed
```

---

## 🔐 Security Features

- **JWT Authentication**: 30-minute access tokens, 7-day refresh tokens
- **bcrypt Password Hashing**: Salt rounds = 12
- **Role-Based Authorization**: 5 roles (SYSTEM_ADMIN, TOURNAMENT_ADMIN, REFEREE, PLAYER, SPECTATOR)
- **Rate Limiting**: 1000 requests/hour per IP
- **Helmet Security Headers**: XSS protection, clickjacking prevention
- **CORS**: Configured for `http://localhost:4200` (Angular dev server)
- **Input Validation**: class-validator on all DTOs

---

## 🧪 Testing the API

### Using curl:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tennistournament.com","password":"Admin123!"}'

# Get tournaments (requires JWT token from login)
curl -X GET http://localhost:3000/api/tournaments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman/Insomnia:
1. Import the API endpoints from [docs/API.md](../docs/API.md)
2. Login to get JWT token
3. Add token to Authorization header: `Bearer YOUR_JWT_TOKEN`
4. Test any endpoint

---

## 📝 Environment Variables

Key variables in `backend/.env`:

```bash
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=tennis_tournament_manager
DB_SYNCHRONIZE=true  # Auto-sync schema (dev only!)
DB_LOGGING=true      # Log all queries (dev only!)

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000       # 15 minutes
RATE_LIMIT_MAX_REQUESTS=1000      # Max requests per window

# WebSocket
WS_PORT=3001

# Optional: Email, Telegram, Stripe
# (Configure these when ready to use external services)
```

---

## 🐛 Troubleshooting

### Database connection failed
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL
sudo systemctl start postgresql  # Ubuntu/Debian
brew services start postgresql   # macOS
```

### Port 3000 already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### JWT token expired
- Access tokens expire after 30 minutes
- Use `/api/auth/refresh` endpoint with refresh token
- Or login again

---

## 📚 Documentation

- **Backend Summary**: [backend/docs/BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md)
- **API Specification**: [docs/API.md](../docs/API.md)
- **Architecture Guide**: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Complete Changelog**: [docs/CHANGES.md](../docs/CHANGES.md)

---

## 🎯 Next Steps

1. **Test the API**: Try logging in with admin credentials
2. **Create a Tournament**: Use `/api/tournaments` endpoint
3. **Start the Frontend**: Run `npm run dev` in project root
4. **Integrate Frontend with Backend**: Update frontend API base URL if needed
5. **Write Tests**: Add unit/integration tests for backend (Categories 20-23)

---

**Backend is ready for development!** 🚀

For questions or issues, refer to the documentation files listed above.
