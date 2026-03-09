# Debugging Authentication Errors

## Errors Fixed

### 1. ✅ deleteNotification is not defined
**Fixed**: Added `deleteNotification` to the useNotifications() destructuring in DashboardView.vue

### 2. ✅ Cannot read properties of undefined (reading 'totalProjects')
**Fixed**: Added null safety checks to all computed properties that access `activeProjects.value`:
- `stats` computed property now uses optional chaining and fallback values
- `recentProjects` computed property checks for null/undefined
- `upcomingDeadlines` computed property checks for null/undefined

### 3. 🔍 401 Unauthorized on /api/v1/auth/login

## Root Cause Analysis

The 401 errors are happening on the `/api/v1/auth/login` endpoint with a stack trace pointing to `LoginView.vue:166`. This suggests an actual login attempt is being made (not just token refresh).

### Possible Causes:

1. **Backend server not running**
   - The backend needs to be running on `http://localhost:3000`
   - Check if the backend server process is active

2. **Credential mismatch**
   - Browser autofill may be submitting old/incorrect credentials
   - Form persistence may be re-submitting the login form

3. **Token refresh failure**
   - After registration, if API calls fail, the axios interceptor tries to refresh tokens
   - If the refresh endpoint also fails, it could cascade

## How to Debug

### Step 1: Verify Backend is Running

Open a new terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
✅ Database connected
```

### Step 2: Check Browser Console

After the fixes, you should see helpful log messages:

**On successful registration:**
```
✅ Registration successful, tokens saved to storage
```

**On dashboard load:**
```
📊 Loading dashboard data...
✅ Dashboard data loaded
```

**If API calls fail:**
```
Failed to fetch projects: [error message]
Failed to fetch notifications: [error message]
```

### Step 3: Check LocalStorage

Open browser DevTools → Application → Local Storage → `http://localhost:5173`

You should see:
- `cpm_access_token`: JWT token string
- `cpm_refresh_token`: JWT token string
- `cpm_user`: JSON user object

If these are missing after registration, the tokens weren't saved properly.

### Step 4: Test the Flow

1. **Clear all data:**
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```

2. **Register a new account:**
   - Go to `/register`
   - Fill out the form
   - Click "Create Account"
   - Watch browser console for log messages

3. **Check what happens:**
   - Does registration succeed?
   - Do you see the "✅ Registration successful" message?
   - Are you redirected to dashboard?
   - Do you see the "📊 Loading dashboard data..." message?
   - Are there any 401 errors?

### Step 5: Check Network Tab

Open DevTools → Network tab and watch for:

1. **POST /api/v1/auth/register** - Should return 200/201 with:
   ```json
   {
     "user": {...},
     "accessToken": "...",
     "refreshToken": "..."
   }
   ```

2. **Unexpected POST /api/v1/auth/login** calls - If you see these without clicking login:
   - Check if browser autofill is triggering form submission
   - Check if there's a cached form submission

3. **GET /api/v1/projects**, **GET /api/v1/notifications** - Should return 200 or 401 if backend issue

## Quick Fix: Prevent Autofill Issues

If browser autofill is causing login attempts, you can temporarily disable it:

In `LoginView.vue`, add to the `<form>` tag:
```vue
<form autocomplete="off" @submit.prevent="handleLogin">
```

## Backend Health Check

Test if backend is accessible:

```bash
# From project root
curl http://localhost:3000/api/v1/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

If this fails, the backend isn't running or isn't accessible.

## Common Solutions

### Backend not running
```bash
cd backend
npm install
npm run dev
```

### Database not connected
```bash
cd backend
npm run db:push
npm run db:seed
```

### Port 3000 already in use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill
# Then restart backend
cd backend
npm run dev
```

### Frontend cache issues
```bash
# Clear vite cache
rm -rf node_modules/.vite
npm run dev
```

## Next Steps

1. Start the backend server if it's not running
2. Clear browser localStorage and cookies
3. Try registering a new account with a fresh email
4. Watch console for the new log messages
5. If you still get 401 errors, check which endpoint is failing in Network tab

## Need More Help?

If the issue persists:
1. Share the complete console output (including the new log messages)
2. Share the Network tab showing the failing requests
3. Confirm backend server status
4. Share any error messages from the backend terminal
