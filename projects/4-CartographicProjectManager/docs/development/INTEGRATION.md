# Backend-Frontend Integration Guide

## Overview

This document provides a comprehensive guide for the backend-frontend integration of the Cartographic Project Manager application.

## ✅ Integration Completed

### 1. Authentication System

**Backend:**
- Endpoint: `POST /api/v1/auth/login`
- Endpoint: `POST /api/v1/auth/register`
- Endpoint: `POST /api/v1/auth/logout`
- Endpoint: `POST /api/v1/auth/refresh`
- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt

**Frontend:**
- `AuthRepository` created for API communication
- `TokenStorage` implementation for localStorage persistence
- `auth.store.ts` updated to use real API calls
- HTTP client configured with automatic token injection

### 2. HTTP Client Configuration

**Features Implemented:**
- Automatic JWT token injection via `TokenStorage`
- Token refresh on 401 responses
- Request/response interceptors for error handling
- CORS configuration matching backend settings

**Configuration:**
```typescript
// src/main.ts
const tokenStorage = new TokenStorage();
httpClient.setTokenStorage(tokenStorage);
```

### 3. Repository Endpoints Verification

All frontend repositories match backend endpoints:

| Feature | Frontend Repository | Backend Route | Status |
|---------|-------------------|---------------|--------|
| Authentication | `AuthRepository` | `/api/v1/auth/*` | ✅ |
| Users | `UserRepository` | `/api/v1/users/*` | ✅ |
| Projects | `ProjectRepository` | `/api/v1/projects/*` | ✅ |
| Tasks | `TaskRepository` | `/api/v1/tasks/*` | ✅ |
| Messages | `MessageRepository` | `/api/v1/messages/*` | ✅ |
| Notifications | `NotificationRepository` | `/api/v1/notifications/*` | ✅ |
| Files | `FileRepository` | `/api/v1/files/*` | ✅ |

### 4. Environment Configuration

**Frontend (`.env.development`):**
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_VERSION=1.0.0
```

**Backend (`.env`):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cartographic_manager
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

## 🚀 Testing the Integration

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Backend should start on `http://localhost:3000`

### 2. Start Frontend Development Server

```bash
cd ..  # Back to project root
npm run dev
```

Frontend should start on `http://localhost:5173`

### 3. Test Authentication Flow

1. **Navigate to Login Page**
   - Open `http://localhost:5173/login`

2. **Test Login with Seed Data**
   ```
   Email: admin@cartographic.com
   Password: admin123
   ```

3. **Verify Successful Login**
   - Check browser localStorage for tokens:
     - `cpm_access_token`
     - `cpm_refresh_token`
     - `cpm_user`
   - Should redirect to dashboard
   - User info should display in header

4. **Test Protected Routes**
   - Navigate to `/projects`
   - Should fetch projects from backend
   - Should display user role-based UI

5. **Test Logout**
   - Click logout button
   - Tokens should be cleared from localStorage
   - Should redirect to login page

### 4. Test API Calls

Open browser Developer Tools (F12) > Network tab:

**Expected Requests:**
- `POST /api/v1/auth/login` - Returns user and tokens
- `GET /api/v1/users?role=CLIENT` - With `Authorization: Bearer <token>` header
- `GET /api/v1/projects` - With auth header
- `GET /api/v1/tasks` - With auth header

**Expected Responses:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}
```

## 🔍 Debugging Integration Issues

### Issue: "Network Error" on Login

**Cause:** Backend not running or CORS misconfiguration

**Solution:**
```bash
# Check backend is running
curl http://localhost:3000/api/v1/health

# Should return:
# {"success":true,"message":"API is healthy","timestamp":"..."}
```

### Issue: "401 Unauthorized" on Protected Routes

**Cause:** Token not being sent or invalid token

**Solution:**
1. Check localStorage for `cpm_access_token`
2. Verify token in Network tab headers: `Authorization: Bearer <token>`
3. Check backend logs for JWT validation errors

### Issue: "CORS Error"

**Cause:** Frontend origin not allowed by backend

**Solution:**
Update backend `.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

Restart backend server.

### Issue: "Failed to fetch"

**Cause:** Backend URL misconfigured

**Solution:**
Check frontend `.env.development`:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Restart frontend dev server (Vite needs restart for env changes).

## 📝 Key Integration Points

### 1. Authentication Flow

```
User Login → AuthRepository.login() 
          → Backend API /auth/login
          → JWT tokens returned
          → TokenStorage.setTokens()
          → auth.store updates state
          → localStorage persistence
          → Redirect to dashboard
```

### 2. Authenticated API Requests

```
Repository method call → httpClient.get/post/put/delete()
                      → Request interceptor adds Authorization header
                      → Backend validates JWT
                      → Response returned
                      → Error interceptor handles 401 (refresh token)
```

### 3. Token Refresh Flow

```
API returns 401 → httpClient intercepts
               → Calls AuthRepository.refreshToken()
               → Backend /auth/refresh
               → New tokens returned
               → TokenStorage.setTokens()
               → Original request retried with new token
```

## 🎯 Next Steps

1. **Implement WebSocket Integration**
   - Real-time notifications
   - Project updates
   - Message delivery

2. **Add File Upload/Download**
   - Integrate with Dropbox API
   - Handle file metadata

3. **Implement Role-Based Access Control**
   - Route guards based on user role
   - Component visibility based on permissions

4. **Add Error Handling UI**
   - Toast notifications for API errors
   - Retry mechanisms for failed requests

5. **Production Deployment**
   - Environment variables for production
   - HTTPS configuration
   - CDN for static assets

## 📚 Additional Resources

- [Backend API Documentation](../../backend/README.md)
- [Backend Setup Guide](../../backend/SETUP.md)
- [Frontend Architecture](./ARCHITECTURE.md)

## ✨ Summary

All authentication and repository integrations are complete and ready for testing. The application now has a fully functional backend connected to the frontend with:

- ✅ JWT authentication
- ✅ Token persistence
- ✅ Automatic token injection
- ✅ Token refresh mechanism
- ✅ All CRUD endpoints configured
- ✅ Environment configuration
- ✅ Error handling

You can now start the servers and test the full stack application!
