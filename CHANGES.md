# Git Changes Summary

Generated on: February 16, 2026

## Overview

This document contains all the git changes made to the Cartographic Project Manager application.

---

## Changed Files

### 1. Package Dependencies

#### `package.json`
- **Change**: Added `lucide-vue-next` icon library
- **Addition**: `"lucide-vue-next": "^0.564.0"`

#### `package-lock.json`
- **Change**: Added lucide-vue-next dependency entry with version 0.564.0

---

### 2. Application Core

#### `src/App.vue`
- **Change**: Updated component imports for layout components
- **Before**: `@/presentation/components/common/AppHeader.vue`
- **After**: `@/presentation/components/layout/AppHeader.vue`
- **Before**: `@/presentation/components/common/AppSidebar.vue`
- **After**: `@/presentation/components/layout/AppSidebar.vue`

---

### 3. DTOs (Data Transfer Objects)

#### `src/application/dto/auth-result.dto.ts`
**Added error codes**:
- `EMAIL_ALREADY_EXISTS`
- `USERNAME_ALREADY_EXISTS`
- `INVALID_PASSWORD`
- `INVALID_EMAIL`

**Added interface**:
```typescript
export interface RegisterCredentialsDto {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly phone?: string | null;
  readonly whatsappEnabled?: boolean;
}
```

#### `src/application/dto/index.ts`
- **Change**: Exported `RegisterCredentialsDto` type

---

### 4. Components

#### `src/presentation/components/calendar/CalendarWidget.vue`
- **Change**: Fixed comment block from `/**` to `<!--` for Vue compatibility

#### `src/presentation/components/common/LoadingSpinner.vue`
**Major Enhancements**:
- Added `size` prop: `'sm' | 'md' | 'lg'`
- Added `color` prop: `'primary' | 'white' | 'gray'`
- Added message display support
- Enhanced styling with variants

#### **NEW** `src/presentation/components/layout/AppHeader.vue`
- Application header with navigation
- User menu dropdown
- Notification bell with badge
- Responsive design for mobile/desktop

#### **NEW** `src/presentation/components/layout/AppSidebar.vue`
- Collapsible sidebar navigation
- Active route highlighting
- Mobile overlay support
- Icon-based navigation with lucide-vue-next

---

### 5. Composables

#### `src/presentation/composables/use-auth.ts`
**Added**:
- `RegisterResult` interface
- `register()` function in return type
- Full registration implementation with validation

**Changes**:
- Login now handles redirect properly from query params
- Added import for `RegisterCredentialsDto`

---

### 6. Router

#### `src/presentation/router/index.ts`
**Added route**:
```typescript
{
  path: '/register',
  name: 'register',
  component: () => import('../views/RegisterView.vue'),
  meta: {
    requiresAuth: false,
    guestOnly: true,
    title: 'Register',
    layout: 'auth',
  },
}
```

**Fixed**:
- Changed `/projects` route component from `ProjectsView.vue` to `ProjectListView.vue`

---

### 7. Stores

#### `src/presentation/stores/auth.store.ts`
**Major additions**:

**Mock Users Database**:
```typescript
const MOCK_USERS = [
  { id: '1', username: 'admin', email: 'admin@cartographic.com', password: 'admin123', role: UserRole.ADMINISTRATOR },
  { id: '2', username: 'client', email: 'client@example.com', password: 'client123', role: UserRole.CLIENT },
  { id: '3', username: 'special', email: 'special@cartographic.com', password: 'special123', role: UserRole.SPECIAL_USER },
];
```

**New Function**: `register(credentials: RegisterCredentialsDto)`
- Validates password confirmation
- Checks password length
- Validates unique email/username
- Auto-login after successful registration
- Returns boolean success status

**Enhanced Login**:
- Now validates against mock user database
- Returns proper error codes for invalid credentials

#### `src/presentation/stores/notification.store.ts`
**Added localStorage persistence**:
- `loadFromStorage()` function
- `saveToStorage()` function
- Auto-save after mutations
- Reactive updates with proper Vue reactivity

---

### 8. Views

#### `src/presentation/views/DashboardView.vue`
**Changes**:
- Changed `loadProjects()` to `fetchProjects()`
- Changed `loadNotifications()` to `fetchNotifications()`
- Added `markAllAsRead` handler
- Added `@mark-all-read` event emission
- Uses `unreadCount` from store instead of project messages

#### `src/presentation/views/LoginView.vue`
**Enhancements**:
- Added development mode test credentials display
- Added register link
- Improved error handling
- Enhanced styling and layout
- Added lucide-vue-next icons

#### `src/presentation/views/ProjectListView.vue`
- **Change**: Changed `loadProjects()` to `fetchProjects()`

#### **NEW** `src/presentation/views/RegisterView.vue`
**Complete registration page**:
- Username, email, password fields
- Password confirmation
- Optional phone number
- WhatsApp notifications toggle
- Client-side validation
- Error display
- Responsive design
- Integration with useAuth composable

#### **NEW** `src/presentation/views/ForbiddenView.vue`
- 403 Forbidden error page
- Styled error display
- "Go Back" button

#### **NEW** `src/presentation/views/NotFoundView.vue`
- 404 Not Found error page  
- Styled error display
- "Go Back" and "Go Home" buttons

#### **NEW** `src/presentation/views/SettingsView.vue`
- Basic settings page structure
- Placeholder sections for Account, Notifications, Privacy

---

### 9. Utilities

#### `src/shared/utils.ts`
**Added functions**:

```typescript
export function isSameDay(date1: Date | string, date2: Date | string): boolean
```
- Checks if two dates are on the same calendar day

```typescript
export function isThisWeek(date: Date | string): boolean
```
- Checks if a date falls within the current week

---

## New Features Summary

### 1. User Registration
- Complete registration flow
- Username and email uniqueness validation
- Password strength requirements
- Optional phone and WhatsApp preferences
- Auto-login after registration

### 2. Enhanced UI Components
- Lucide Vue Next icons integration
- Collapsible sidebar navigation
- Application header with user menu
- Loading spinner variants (sizes, colors)

### 3. Error Pages
- 403 Forbidden page
- 404 Not Found page
- Consistent error styling

### 4. Data Persistence
- Notifications saved to localStorage
- Mock user database for development
- Session management improvements

### 5. Developer Experience
- Development mode credentials display
- Test accounts readily available
- Improved TypeScript types

---

## File Statistics

- **Modified Files**: 15
- **New Files**: 6
- **Total Files Changed**: 21

---

## Dependencies Added

| Package | Version | Purpose |
|---------|---------|---------|
| lucide-vue-next | ^0.564.0 | Icon library for Vue 3 |

---

## Testing Notes

### Test Accounts Available

**Administrator**:
- Email: `admin@cartographic.com`
- Password: `admin123`

**Client**:
- Email: `client@example.com`
- Password: `client123`

**Special User**:
- Email: `special@cartographic.com`
- Password: `special123`

---

## Migration Notes

1. **Component Imports**: Update any imports of `AppHeader` and `AppSidebar` to use the new `layout` folder location
2. **Store Methods**: Update calls from `loadProjects()` to `fetchProjects()` and `loadNotifications()` to `fetchNotifications()`
3. **Icons**: Lucide Vue Next is now used instead of custom SVG icons in some components

---

## Next Steps

1. Implement actual backend authentication API
2. Replace mock user database with real API calls
3. Add form validation library (e.g., Vuelidate or VeeValidate)
4. Implement password reset functionality
5. Add email verification flow
6. Complete Settings page implementation


# NOTE

PROJECT NOT FOUND ERROR