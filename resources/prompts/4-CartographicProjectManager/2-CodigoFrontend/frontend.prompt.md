# GLOBAL CONTEXT
**Project:** Cartographic Project Manager (CPM)

**Type:** Web Application (SPA - Single Page Application)

**Purpose:** A comprehensive management application for cartographic projects that facilitates collaboration between a professional cartographer (Administrator) and multiple clients simultaneously. The system enables detailed tracking of project status through color-coded indicators (red=pending tasks, green=no tasks), bidirectional task assignment with 5 possible states (Pending, In Progress, Partial, Done, Completed), internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration. Supports three user roles with differentiated permissions.

**Target audience:**
- **Administrator (Professional Cartographer):** Full control over all projects, tasks, users, and system configuration. Creates projects, assigns them to clients, manages permissions for special users, exports data, and handles backups.
- **Client:** Limited access to assigned projects only. Can view their projects, create tasks for the administrator (requesting deliveries), modify tasks in their projects, send/receive messages, upload/download files, and confirm task completion.
- **Special User:** Configurable permissions per project. Typically view-only access with optional download, messaging, or upload capabilities as configured by the administrator.

---

# INPUT ARTIFACTS

## 1. Content Specification

### Page: LoginView.vue
**File location:** `src/presentation/views/LoginView.vue`

Required sections:
1. **Logo/Branding Area**: Application logo and name "Cartographic Project Manager"
2. **Login Form**: Email/username input, password input with visibility toggle, "Remember me" checkbox, submit button
3. **Error Messages Area**: Display authentication errors (invalid credentials, account locked after 5 failed attempts, session expired)
4. **Footer Links**: Link to password recovery (if implemented), copyright notice

---

### Page: DashboardView.vue (Main Screen)
**File location:** `src/presentation/views/DashboardView.vue`

Required sections:
1. **Header with Navigation**: Logo, navigation links (Projects, Calendar, Notifications), notification badge counter, user dropdown (profile, settings, logout)
2. **Project Summary Panel**: 
   - List of active projects ordered by delivery date (closest first)
   - Each project card displays: color indicator (🔴 red if pending tasks, 🟢 green if no pending tasks, 🟡 yellow if <7 days to delivery), project code (e.g., "CART-2025-001"), project name, client name, participant icons (👤), unread message counter (💬), delivery date (📅), pending task count (⚠️)
3. **Quick Actions Bar**: "New Project" button (Administrator only), search input, filter dropdowns (by status, by client, by date range)
4. **Statistics Summary** (Administrator only): Total active projects count, total pending tasks count, projects due this week count

---

### Page: ProjectListView.vue
**File location:** `src/presentation/views/ProjectListView.vue`

Required sections:
1. **Page Header**: Title "Projects", filter controls, view toggle (list/grid)
2. **Filter Panel**: 
   - Filter by status (Active, Finalized)
   - Filter by client (dropdown populated from user list)
   - Filter by project type (Residential, Commercial, Industrial, Public)
   - Filter by date range (contract date, delivery date)
   - Sort options (by delivery date, by code, by name, by status)
3. **Project List/Grid**: 
   - Uses ProjectCard.vue component for each project
   - Displays: code, name, client, delivery date, status color, pending tasks count, unread messages count
4. **Pagination Controls**: If more than 20 projects, show pagination
5. **Empty State**: Message when no projects match filters or no projects exist

---

### Page: ProjectDetailsView.vue
**File location:** `src/presentation/views/ProjectDetailsView.vue`

Required sections:
1. **Project Header**: 
   - Back navigation button
   - Project code and name
   - Status badge (Active/Finalized)
   - Quick action buttons: "Edit" (Admin only), "Finalize" (Admin only), "Export" (Admin only)
2. **General Information Panel**:
   - Client name (with link to client profile for Admin)
   - Project type (Residential/Commercial/Industrial/Public)
   - Geographic coordinates (X/Y displayed)
   - Contract date and Delivery date
   - Dropbox folder link (opens in new tab)
   - Linked special users list (Admin only)
3. **Tab Navigation**: Tasks | Messages | Files | Participants
4. **Tasks Tab Content**:
   - Task summary: "X total, Y pending"
   - "New Task" button
   - Task list using TaskList.vue component
   - Each task shows: priority indicator (🔴 High, 🟡 Medium, 🟢 Low), description, assigned user, due date, status badge, action buttons (View, Edit, Delete based on permissions)
5. **Messages Tab Content**:
   - Message list using MessageList.vue component
   - Message input using MessageInput.vue component
   - Each message shows: sender name, timestamp, content, attached files (if any), read status indicators
6. **Files Tab Content**:
   - Section tabs: Report and Annexes | Plans | Specifications | Budget
   - File list using FileList.vue component for each section
   - Upload button using FileUploader.vue component
   - Each file shows: name, type icon, size, upload date, uploader name, download button
7. **Participants Tab Content** (Admin only):
   - Client information
   - Special users list with permission configuration
   - "Add Special User" button
   - Permission checkboxes per user: View, Download, Send Messages, Upload Files, Section Access

---

### Page: CalendarView.vue
**File location:** `src/presentation/views/CalendarView.vue`

Required sections:
1. **Calendar Header**: 
   - Month/Year display with navigation arrows (Previous/Next)
   - View toggle: Month | Week | Day
   - "Today" button
2. **Calendar Grid**:
   - Days of week header (Mon-Sun)
   - Day cells showing projects on their delivery dates
   - Each project indicator shows: code, color based on task status (red/green)
   - Click on project opens ProjectDetailsView
   - Multiple projects on same day shown stacked or with "+X more" indicator
3. **Legend**: Color code explanation (🔴 With pending tasks, 🟢 Without pending tasks, 🟡 Near deadline, ⚫ Finalized)
4. **Sidebar** (optional): Selected day details, upcoming deadlines list

---

### Page: NotificationsView.vue
**File location:** `src/presentation/views/NotificationsView.vue`

Required sections:
1. **Page Header**: Title "Notifications", "Mark all as read" button, filter dropdown
2. **Filter Options**: All | Unread | By type (Messages, Tasks, Files, Projects)
3. **Notification List**:
   - Uses NotificationList.vue component
   - Each notification shows: type icon, title, message preview, timestamp, read/unread indicator
   - Notification types: NEW_MESSAGE, NEW_TASK, TASK_STATUS_CHANGE, FILE_RECEIVED, PROJECT_ASSIGNED, PROJECT_FINALIZED
4. **Empty State**: Message when no notifications exist
5. **WhatsApp Settings Panel**: Toggle for WhatsApp notifications, phone number configuration (if enabled)

---

### Page: BackupView.vue (Administrator only)
**File location:** `src/presentation/views/BackupView.vue`

Required sections:
1. **Page Header**: Title "System Backup", restricted access warning
2. **Manual Backup Section**: "Create Backup Now" button, last backup timestamp display
3. **Automatic Backup Configuration**: Schedule dropdown (Daily, Weekly), time selection
4. **Backup History Table**: Date, size, status, download button, restore button
5. **Restore Section**: Warning about data overwrite, confirmation modal before restore

---

## 2. Visual Design

**Mockup/Wireframe:** Based on the specification document Section 14 (Main Screen and Visualizations):

```
┌──────────────────────────────────────────────────────────┐
│  Logo    Projects    Calendar    Notifications (3)       │
│                                     [User] [Logout]      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ACTIVE PROJECTS        [+ New] [Search] [Filters]      │
│  ────────────────────────────────────────────────────────│
│                                                          │
│  🔴 CART-2025-001  │  Client: John Pérez                │
│      North Urbanization Project                         │
│      👤👤 [2 participants]  💬 3 unread messages        │
│      📅 Delivery: 12/15/2025  ⚠️ 2 pending tasks        │
│                                                          │
│  🟢 CART-2025-002  │  Client: Mary López                │
│      South Topographic Survey                           │
│      👤 [1 participant]  💬 0 messages                   │
│      📅 Delivery: 01/20/2026  ✓ All tasks OK            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Inspiration references:**
- Asana (project management interface)
- Trello (card-based project visualization)
- Monday.com (color-coded status system)
- Google Calendar (calendar view implementation)

**General style:** Professional/Corporate with clean, functional design prioritizing usability and clear information hierarchy

---

## 3. Design Specifications

### Colors:
Define in: `src/presentation/styles/variables.css`

```css
/* Primary - Professional blue for main actions and branding */
--color-primary: #2563EB;
--color-primary-hover: #1D4ED8;
--color-primary-light: #DBEAFE;

/* Secondary - Neutral gray for secondary elements */
--color-secondary: #64748B;
--color-secondary-hover: #475569;
--color-secondary-light: #F1F5F9;

/* Status Colors - Critical for project/task visualization */
--color-status-red: #EF4444;      /* Pending tasks / High priority */
--color-status-green: #22C55E;    /* No pending tasks / Completed */
--color-status-yellow: #F59E0B;   /* Warning / Medium priority / Near deadline */
--color-status-gray: #9CA3AF;     /* Finalized / Disabled */
--color-status-blue: #3B82F6;     /* In Progress */

/* Task Priority Colors */
--color-priority-high: #EF4444;
--color-priority-medium: #F59E0B;
--color-priority-low: #22C55E;
--color-priority-urgent: #DC2626;

/* Text Colors */
--color-text-primary: #1E293B;
--color-text-secondary: #64748B;
--color-text-muted: #94A3B8;
--color-text-inverse: #FFFFFF;

/* Background Colors */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F8FAFC;
--color-bg-tertiary: #F1F5F9;
--color-bg-dark: #1E293B;

/* Border Colors */
--color-border: #E2E8F0;
--color-border-focus: #2563EB;

/* Accent/Notification Colors */
--color-accent-info: #0EA5E9;
--color-accent-success: #22C55E;
--color-accent-warning: #F59E0B;
--color-accent-error: #EF4444;
```

### Typography:
Define in: `src/presentation/styles/variables.css`

```css
/* Main font - Inter for clean readability */
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace font - For codes and technical data */
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--font-size-xs: 0.75rem;    /* 12px - Labels, badges */
--font-size-sm: 0.875rem;   /* 14px - Secondary text, captions */
--font-size-base: 1rem;     /* 16px - Body text */
--font-size-lg: 1.125rem;   /* 18px - Large body */
--font-size-xl: 1.25rem;    /* 20px - H4 */
--font-size-2xl: 1.5rem;    /* 24px - H3 */
--font-size-3xl: 1.875rem;  /* 30px - H2 */
--font-size-4xl: 2.25rem;   /* 36px - H1 */

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Spacing:
Define in: `src/presentation/styles/variables.css`

```css
/* Spacing System - Based on 4px increments */
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */

/* Container */
--container-max-width: 1280px;
--container-padding: var(--spacing-4);
--container-padding-lg: var(--spacing-8);

/* Section Margins */
--section-margin: var(--spacing-12);
--section-padding: var(--spacing-8);

/* Card Spacing */
--card-padding: var(--spacing-4);
--card-gap: var(--spacing-4);
```

### Effects:
Define in: `src/presentation/styles/variables.css`

```css
/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Border Radius */
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-full: 9999px;  /* Pill shape */

/* Transitions */
--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
--transition-slow: 350ms ease;

/* Z-Index Scale */
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal-backdrop: 400;
--z-modal: 500;
--z-popover: 600;
--z-tooltip: 700;
```

---

## 4. Interactive Behaviors

### Navigation:
Implement in: `src/presentation/components/common/AppHeader.vue`, `src/presentation/components/common/AppSidebar.vue`

- **Fixed header** that remains visible on scroll
- **Responsive hamburger menu** on mobile (<768px)
- **Active route highlighting** in navigation links
- **User dropdown menu** with profile, settings, logout options
- **Notification badge** showing unread count (updates in real-time via WebSocket)

### Animations:
Implement across all Vue components with CSS transitions

- **On scroll**: Subtle fade-in for project cards when they enter viewport
- **On hover**: 
  - Cards lift slightly (transform: translateY(-2px)) with shadow increase
  - Buttons darken/lighten based on color
  - Navigation links show underline animation
- **On load**: 
  - Skeleton loaders while data fetches
  - Fade-in transition when content loads
- **Page transitions**: Smooth cross-fade between route views

### Forms:
Implement in: `src/presentation/components/project/ProjectForm.vue`, `src/presentation/components/task/TaskForm.vue`, `src/presentation/components/message/MessageInput.vue`

- **Real-time validation**: 
  - Required field indicators (asterisk)
  - Inline error messages below fields
  - Border color change (red for error, green for valid)
- **Visual feedback**:
  - Loading spinner on submit buttons during API calls
  - Success toast notification after successful submission
  - Error toast notification for failed operations
- **Form-specific validations**:
  - Project code: unique, alphanumeric format (e.g., CART-YYYY-NNN)
  - Dates: delivery date must be after contract date
  - Coordinates: valid numeric range for X/Y
  - File uploads: format validation (PDF, KML, SHP, images), size limit (50MB max)

### Modal/Overlays:
Implement as reusable component or use composition

- **Confirmation modals**: Before delete operations, project finalization, backup restore
- **Form modals**: Quick task creation, special user permission configuration
- **File preview modal**: Preview images and PDFs before download
- **Appearance**: 
  - Dark semi-transparent backdrop (rgba(0,0,0,0.5))
  - Centered modal with max-width
  - Close button (X) and click-outside-to-close
  - Escape key closes modal
  - Focus trap within modal for accessibility

### Real-time Updates:
Implement in: `src/infrastructure/websocket/socket.handler.ts`, connected to Pinia stores

- **WebSocket events** to handle:
  - `notification:new` - New notification received
  - `message:new` - New message in a project
  - `task:updated` - Task status changed
  - `project:updated` - Project status changed
- **UI updates**: Automatically reflect changes without page refresh
- **Reconnection**: Auto-reconnect on connection loss with exponential backoff

---

# SPECIFIC TASK

Generate the complete frontend implementation for the Cartographic Project Manager application by modifying the files in the established architecture structure.

## Required HTML/Vue structure:

### App.vue (Main application wrapper)
**File:** `src/App.vue`
```
<template>
├── <div id="app">
│   ├── <AppHeader /> (when authenticated)
│   ├── <AppSidebar /> (when authenticated, on mobile)
│   ├── <router-view /> (main content area)
│   ├── <NotificationToast /> (global notification display)
│   └── <LoadingSpinner /> (global loading overlay)
</template>
```

### DashboardView.vue (Main Screen)
**File:** `src/presentation/views/DashboardView.vue`
```
<template>
├── <main class="dashboard">
│   ├── <header class="dashboard-header">
│   │   ├── <h1>Active Projects</h1>
│   │   ├── <div class="dashboard-actions">
│   │   │   ├── <button>+ New Project</button> (Admin only)
│   │   │   ├── <input type="search" />
│   │   │   └── <FilterDropdown />
│   ├── <section class="dashboard-stats"> (Admin only)
│   │   ├── <StatCard title="Active Projects" />
│   │   ├── <StatCard title="Pending Tasks" />
│   │   └── <StatCard title="Due This Week" />
│   ├── <section class="project-list">
│   │   ├── <ProjectCard v-for="project in projects" />
│   │   └── <EmptyState v-if="!projects.length" />
│   └── <Pagination />
</template>
```

### ProjectDetailsView.vue
**File:** `src/presentation/views/ProjectDetailsView.vue`
```
<template>
├── <main class="project-details">
│   ├── <header class="project-header">
│   │   ├── <button class="back-button">← Back</button>
│   │   ├── <div class="project-title">
│   │   │   ├── <h1>{{ project.code }} - {{ project.name }}</h1>
│   │   │   └── <StatusBadge :status="project.status" />
│   │   └── <div class="project-actions">
│   │       ├── <button>Edit</button> (Admin only)
│   │       ├── <button>Finalize</button> (Admin only)
│   │       └── <button>Export</button> (Admin only)
│   ├── <section class="project-info">
│   │   ├── <InfoRow label="Client" :value="project.client" />
│   │   ├── <InfoRow label="Type" :value="project.type" />
│   │   ├── <InfoRow label="Coordinates" :value="coordinates" />
│   │   ├── <InfoRow label="Contract Date" :value="project.contractDate" />
│   │   ├── <InfoRow label="Delivery Date" :value="project.deliveryDate" />
│   │   └── <DropboxLink :folderId="project.dropboxFolderId" />
│   ├── <nav class="tab-navigation">
│   │   ├── <button :class="{ active: tab === 'tasks' }">Tasks</button>
│   │   ├── <button :class="{ active: tab === 'messages' }">Messages</button>
│   │   ├── <button :class="{ active: tab === 'files' }">Files</button>
│   │   └── <button :class="{ active: tab === 'participants' }">Participants</button> (Admin only)
│   └── <section class="tab-content">
│       ├── <TaskList v-if="tab === 'tasks'" />
│       ├── <MessageList v-if="tab === 'messages'" />
│       ├── <FileList v-if="tab === 'files'" />
│       └── <ParticipantList v-if="tab === 'participants'" />
</template>
```

## Specific elements to include:

### Components to implement:

**Common Components** (`src/presentation/components/common/`):
- [x] `AppHeader.vue` - Fixed navigation header with logo, nav links, notification badge, user dropdown
- [x] `AppSidebar.vue` - Mobile slide-out navigation menu
- [x] `AppFooter.vue` - Footer with copyright and legal links
- [x] `LoadingSpinner.vue` - Reusable loading indicator (spinner and skeleton variants)

**Project Components** (`src/presentation/components/project/`):
- [x] `ProjectCard.vue` - Card displaying project summary with color indicator, code, name, client, dates, counters
- [x] `ProjectForm.vue` - Form for creating/editing projects (all fields from Section 9.1 of requirements)
- [x] `ProjectSummary.vue` - Compact project info display for dashboard

**Task Components** (`src/presentation/components/task/`):
- [x] `TaskCard.vue` - Individual task display with priority, status, assignee, due date
- [x] `TaskForm.vue` - Form for creating/editing tasks with file attachment support
- [x] `TaskList.vue` - Filterable, sortable list of tasks
- [x] `TaskHistory.vue` - Timeline of task status changes

**Message Components** (`src/presentation/components/message/`):
- [x] `MessageBubble.vue` - Individual message with sender info, timestamp, content, attachments
- [x] `MessageInput.vue` - Text input with file attachment button and send button
- [x] `MessageList.vue` - Scrollable message thread with auto-scroll to bottom

**File Components** (`src/presentation/components/file/`):
- [x] `FileList.vue` - List of files with type icons, metadata, download/delete actions
- [x] `FileUploader.vue` - Drag-and-drop file upload with progress indicator

**Notification Components** (`src/presentation/components/notification/`):
- [x] `NotificationItem.vue` - Single notification with type icon, content, timestamp, read status
- [x] `NotificationList.vue` - List of notifications with filtering and mark-as-read

**Calendar Components** (`src/presentation/components/calendar/`):
- [x] `CalendarWidget.vue` - Monthly calendar grid with project indicators on delivery dates

### Views to implement:

**All Views** (`src/presentation/views/`):
- [x] `LoginView.vue` - Authentication page
- [x] `DashboardView.vue` - Main screen with project overview
- [x] `ProjectListView.vue` - Full project list with filters
- [x] `ProjectDetailsView.vue` - Detailed project view with tabs
- [x] `CalendarView.vue` - Calendar view of project deadlines
- [x] `NotificationsView.vue` - Notification center
- [x] `BackupView.vue` - Backup management (Admin only)

### Stores to implement (Pinia):

**All Stores** (`src/presentation/stores/`):
- [x] `auth.store.ts` - Authentication state, current user, permissions, login/logout actions
- [x] `project.store.ts` - Projects list, current project, CRUD actions, filtering
- [x] `task.store.ts` - Tasks by project, task CRUD, status changes, filtering
- [x] `message.store.ts` - Messages by project, send message, mark as read, unread counts
- [x] `notification.store.ts` - User notifications, mark as read, real-time updates

### Composables to implement:

**All Composables** (`src/presentation/composables/`):
- [x] `use-auth.ts` - Authentication logic, permission checks, session management
- [x] `use-projects.ts` - Project fetching, filtering, status calculations
- [x] `use-tasks.ts` - Task operations, status transitions, bidirectional assignment logic
- [x] `use-messages.ts` - Message sending, reading, file attachments
- [x] `use-notifications.ts` - Notification handling, WebSocket integration

### Router configuration:

**File:** `src/presentation/router/index.ts`

Routes to configure:
```typescript
const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresAuth: false } },
  { path: '/', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/projects', name: 'ProjectList', component: ProjectListView, meta: { requiresAuth: true } },
  { path: '/projects/:id', name: 'ProjectDetails', component: ProjectDetailsView, meta: { requiresAuth: true } },
  { path: '/calendar', name: 'Calendar', component: CalendarView, meta: { requiresAuth: true } },
  { path: '/notifications', name: 'Notifications', component: NotificationsView, meta: { requiresAuth: true } },
  { path: '/backup', name: 'Backup', component: BackupView, meta: { requiresAuth: true, requiresAdmin: true } },
];
```

Navigation guards:
- Redirect to `/login` if not authenticated
- Redirect to `/` if accessing admin routes without admin role
- Store intended destination for post-login redirect

---

# CONSTRAINTS AND STANDARDS

## HTML/Vue:
- Version: Vue 3 with Composition API (`<script setup lang="ts">`)
- [x] Use semantic HTML tags within Vue templates
- [x] Unique and descriptive component names (PascalCase)
- [x] Props with TypeScript interfaces for type safety
- [x] Emit events with typed payloads
- [x] Use `v-if`/`v-show` appropriately (v-if for conditional rendering, v-show for frequent toggles)
- [x] Key attributes on `v-for` loops
- [x] Alt attributes on all images
- [x] Complete meta tags in `index.html`

## CSS:
- Framework: **None** (custom CSS with CSS Variables)
- Preprocessor: **None** (plain CSS with CSS custom properties)
- [x] Mobile-first approach
- [x] CSS variables defined in `src/presentation/styles/variables.css`
- [x] Main styles in `src/presentation/styles/main.css`
- [x] Flexbox/Grid for layouts
- [x] Scoped styles in Vue components when needed (`<style scoped>`)
- [x] Avoid `!important`
- [x] Comments for complex sections
- [x] BEM-like naming convention for CSS classes

## Responsiveness:
Mandatory breakpoints (define in `variables.css`):
```css
--breakpoint-sm: 320px;   /* Mobile small */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

Behaviors per device:
- **Mobile (320px - 767px)**:
  - Hamburger menu instead of horizontal nav
  - Single column layout for project cards
  - Collapsible filter panel
  - Full-width forms
  - Bottom sheet for modals
  - Touch-friendly tap targets (minimum 44x44px)
  
- **Tablet (768px - 1023px)**:
  - Two-column grid for project cards
  - Sidebar can be toggled
  - Modal dialogs centered
  
- **Desktop (1024px+)**:
  - Full horizontal navigation
  - Three-column grid for project cards (or flexible grid)
  - Persistent sidebar option
  - Hover states enabled

## TypeScript:
- [x] Strict mode enabled
- [x] Interfaces for all props, emits, and data structures
- [x] Use types from domain layer (`src/domain/entities/`, `src/domain/enumerations/`)
- [x] No `any` type usage
- [x] Proper null/undefined handling

## Performance:
- [x] Lazy load route components (dynamic imports)
- [x] Virtual scrolling for long lists (messages, tasks) if >100 items
- [x] Debounce search inputs (300ms)
- [x] Memoize computed properties where beneficial
- [x] Use `v-once` for static content
- [x] Optimized images (WebP format preferred)
- [x] Lazy loading of images below the fold

## SEO:
- [x] Descriptive title tag in `index.html`: "Cartographic Project Manager - Professional Project Management"
- [x] Meta description: "Comprehensive cartographic project management with task tracking, team collaboration, and Dropbox integration"
- [x] Proper heading hierarchy in each view
- [x] Vue Router with history mode for clean URLs

## Accessibility:
- [x] Minimum WCAG AA contrast (4.5:1 for normal text, 3:1 for large text)
- [x] Full keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [x] ARIA attributes: `aria-label`, `aria-expanded`, `aria-hidden`, `role`
- [x] Labels associated with all form inputs (`<label for="">` or `aria-labelledby`)
- [x] Visible focus styles (outline or box-shadow)
- [x] Screen reader announcements for dynamic content (aria-live regions)
- [x] Skip link to main content
- [x] Color not the only indicator (icons/text accompany color status)

---

# DELIVERABLES

## 1. Files to Create/Modify

### Styles (`src/presentation/styles/`):
```
src/presentation/styles/
├── variables.css    ← Define all CSS custom properties (colors, typography, spacing, effects)
└── main.css         ← Global styles, reset, utility classes, component base styles
```

### Views (`src/presentation/views/`):
```
src/presentation/views/
├── LoginView.vue           ← Authentication page with form
├── DashboardView.vue       ← Main screen with project summary
├── ProjectListView.vue     ← Project list with filters and pagination
├── ProjectDetailsView.vue  ← Project detail with tabs (Tasks, Messages, Files, Participants)
├── CalendarView.vue        ← Calendar view with project deadlines
├── NotificationsView.vue   ← Notification center
└── BackupView.vue          ← Backup management (Admin only)
```

### Components (`src/presentation/components/`):
```
src/presentation/components/
├── common/
│   ├── AppHeader.vue       ← Fixed header with navigation, notifications, user menu
│   ├── AppSidebar.vue      ← Mobile slide-out menu
│   ├── AppFooter.vue       ← Footer with links
│   └── LoadingSpinner.vue  ← Loading indicator (spinner + skeleton)
├── project/
│   ├── ProjectCard.vue     ← Project summary card with status colors
│   ├── ProjectForm.vue     ← Create/Edit project form
│   └── ProjectSummary.vue  ← Compact project info
├── task/
│   ├── TaskCard.vue        ← Task display with priority/status
│   ├── TaskForm.vue        ← Create/Edit task form with attachments
│   ├── TaskList.vue        ← Filterable task list
│   └── TaskHistory.vue     ← Task change timeline
├── message/
│   ├── MessageBubble.vue   ← Single message display
│   ├── MessageInput.vue    ← Message composer with attachments
│   └── MessageList.vue     ← Scrollable message thread
├── file/
│   ├── FileList.vue        ← File list with actions
│   └── FileUploader.vue    ← Drag-and-drop upload
├── notification/
│   ├── NotificationItem.vue ← Single notification
│   └── NotificationList.vue ← Notification list with filters
└── calendar/
    └── CalendarWidget.vue   ← Monthly calendar grid
```

### Stores (`src/presentation/stores/`):
```
src/presentation/stores/
├── index.ts              ← Pinia store setup and exports
├── auth.store.ts         ← Authentication state management
├── project.store.ts      ← Project state management
├── task.store.ts         ← Task state management
├── message.store.ts      ← Message state management
└── notification.store.ts ← Notification state management
```

### Composables (`src/presentation/composables/`):
```
src/presentation/composables/
├── index.ts              ← Export all composables
├── use-auth.ts           ← Authentication logic
├── use-projects.ts       ← Project operations
├── use-tasks.ts          ← Task operations
├── use-messages.ts       ← Message operations
└── use-notifications.ts  ← Notification handling
```

### Router (`src/presentation/router/`):
```
src/presentation/router/
└── index.ts              ← Vue Router configuration with guards
```

### Entry Point:
```
src/
├── main.ts               ← Application bootstrap (Vue, Pinia, Router)
└── App.vue               ← Root component
```

### HTML Entry:
```
index.html                ← HTML template with meta tags
```

## 2. Integration Points

### With Domain Layer:
The presentation layer must import and use types from:
- `src/domain/entities/` - User, Project, Task, Message, Notification, File, Permission
- `src/domain/enumerations/` - UserRole, ProjectStatus, ProjectType, TaskStatus, TaskPriority, NotificationType, FileType, AccessRight
- `src/domain/value-objects/` - GeoCoordinates

### With Application Layer:
The presentation layer must call services through:
- `src/application/interfaces/` - Service interfaces for dependency injection
- `src/application/dto/` - Data transfer objects for API communication

### With Infrastructure Layer:
- `src/infrastructure/http/axios.client.ts` - HTTP client for API calls
- `src/infrastructure/websocket/socket.handler.ts` - WebSocket connection for real-time updates

## 3. State Flow

```
User Interaction → Vue Component → Composable → Pinia Store → Service Interface → Infrastructure
                                                    ↓
                                              State Update
                                                    ↓
                                            Component Re-render
```

## 4. Permission-Based UI Rendering

The UI must conditionally render elements based on user role:

```typescript
// In composables/use-auth.ts
const isAdmin = computed(() => authStore.user?.role === UserRole.ADMINISTRATOR);
const isClient = computed(() => authStore.user?.role === UserRole.CLIENT);
const isSpecialUser = computed(() => authStore.user?.role === UserRole.SPECIAL_USER);

// Permission checks
const canCreateProject = computed(() => isAdmin.value);
const canEditProject = computed(() => isAdmin.value);
const canDeleteProject = computed(() => isAdmin.value);
const canFinalizeProject = computed(() => isAdmin.value);
const canCreateTask = computed(() => isAdmin.value || isClient.value);
const canDeleteTask = (task: Task) => isAdmin.value || (isClient.value && task.creatorId === authStore.user?.id);
const canConfirmTask = (task: Task) => task.assigneeId === authStore.user?.id && task.status === TaskStatus.PERFORMED;
const canAccessBackup = computed(() => isAdmin.value);
```

## 5. Validation Checklist

Before considering the frontend complete:
- [ ] All views render correctly at all breakpoints (320px, 768px, 1024px, 1280px)
- [ ] Navigation between all routes works
- [ ] Authentication flow works (login, logout, session persistence)
- [ ] Role-based rendering shows/hides correct elements
- [ ] Forms validate inputs before submission
- [ ] Loading states display during async operations
- [ ] Error states handle API failures gracefully
- [ ] Real-time updates work via WebSocket (notifications, messages)
- [ ] File upload/download works with Dropbox integration
- [ ] Calendar displays projects on correct dates
- [ ] Search and filtering work on project and task lists
- [ ] Keyboard navigation works throughout the application
- [ ] Screen reader announces dynamic content changes
- [ ] Color contrast meets WCAG AA standards
- [ ] All interactive elements have visible focus states

---

# OUTPUT FORMAT

Since GitHub Copilot will have access to the project files, implement the code directly in the files listed above. Focus on:

1. **Component Structure**: Create the template, script setup, and scoped styles for each Vue component
2. **Store Implementation**: Implement Pinia stores with state, getters, and actions
3. **Composable Logic**: Implement reusable composition functions
4. **Router Configuration**: Set up routes with proper guards and meta
5. **Styles**: Define CSS variables and global styles

**Implementation notes:**
- All components should use `<script setup lang="ts">` syntax
- Import types from domain layer to ensure type safety
- Use Pinia stores for state management, not local component state for shared data
- Composables should wrap store interactions with additional business logic
- WebSocket events should update Pinia stores, which will reactively update components

**Libraries/CDNs used:**
- **Vue 3**: Core framework (`vue`)
- **Vue Router**: Client-side routing (`vue-router`)
- **Pinia**: State management (`pinia`)
- **Axios**: HTTP client (`axios`) - imported from infrastructure layer
- **Socket.io Client**: WebSocket (`socket.io-client`) - imported from infrastructure layer
- **Inter Font**: Google Fonts - `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`
- **JetBrains Mono**: Google Fonts - `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap`

**Additional customizations suggested:**
- Add dark mode support using CSS custom properties and a theme toggle
- Implement toast notifications for success/error feedback
- Add drag-and-drop for task reordering within a project
- Implement optimistic updates for better perceived performance
- Add keyboard shortcuts for power users (e.g., Ctrl+N for new task)
