# CPM — Playwright E2E Test Scenarios

This document defines the End-to-End (E2E) test scenarios that should be covered for the **Cartographic Project Manager (CPM)** web application.

It is grounded in:
- Design artifacts: use cases + functional specification (FR/NFR)
- Implemented UI: actual Vue Router routes, views, and key components under `src/presentation/*`
- Implemented real-time layer: Socket.IO client events (for multi-session tests)

> Scope note
> - Scenarios are written to be **implementation-aware** (routes/views/components that exist) while also including **spec-driven expected behavior**.
> - Where a spec feature appears partially implemented, scenarios are still included and labeled as **GAP** so coverage is planned even if tests currently fail.

---

## 1. Test Conventions

### 1.1 Priority Levels
- **P0 (Smoke / Release blocker):** Auth, routing guards, core project/task flows, data isolation.
- **P1 (Critical):** Messaging/files/notifications/calendar core behaviors, admin-only functions.
- **P2 (Important):** Filters/sorts, edge cases, recovery paths, non-happy-path validation.
- **P3 (Nice-to-have):** Visual polish, minor UX details, extensive permutations.

### 1.2 Scenario Format
Each scenario includes:
- **Preconditions** (data + authentication + roles)
- **Steps** (user actions)
- **Expected** (UI + navigation + state)

### 1.3 Roles & Test Accounts
The UI exposes **Development Mode — Test Accounts** in the login view:
- Administrator: `admin@cartographic.com` / `REDACTED`
- Client: `client@example.com` / `REDACTED`
- Special User: `special@cartographic.com` / `REDACTED`

Use these for E2E unless your environment disables dev accounts.

### 1.4 Target Routes (Implemented)
Public routes:
- `/login`, `/register`

Authenticated routes:
- `/` (Dashboard)
- `/projects`
- `/projects/:id`
- `/calendar`
- `/notifications`
- `/settings`

Admin-only routes (role-restricted + UI also hides nav items):
- `/backup`
- `/users`

Error routes:
- `/forbidden`
- `/:pathMatch(.*)*` (NotFound)

### 1.5 Cross-Browser / Responsive Targets
Playwright config defines Chromium/Firefox/WebKit. Responsive behavior exists (sidebar overlay on ≤768px).

---

## 2. Use Case → Implementation Mapping

### 2.1 High-Level Mapping
| Use case area | Primary routes | Primary views | Key components (examples) |
| --- | --- | --- | --- |
| Authentication | `/login`, `/register` | LoginView, RegisterView | Auth forms, redirect handling |
| Navigation/Layout | (global) | App shell | AppHeader, AppSidebar |
| Dashboard | `/` | DashboardView | Project cards, calendar widget, notification list |
| Projects | `/projects`, `/projects/:id` | ProjectListView, ProjectDetailsView | ProjectSummary, modals |
| Tasks | `/projects/:id` (Tasks tab) | ProjectDetailsView | TaskList, TaskForm, confirm flow |
| Messaging | `/projects/:id` (Messages tab) | ProjectDetailsView | MessageList, MessageInput |
| Files/Dropbox | `/projects/:id` (Files tab) | ProjectDetailsView | FileUploader, FileList, Dropbox sync/open |
| Notifications | `/notifications` | NotificationsView | NotificationList, filters, mark read |
| Calendar | `/calendar` | CalendarView | CalendarWidget |
| Backup/Export | `/backup` | BackupView | schedule config, export buttons, history |
| Users (Admin) | `/users` | UserManagementView | user CRUD, filters |
| Settings | `/settings` | SettingsView | profile/password update, notification prefs |
| Access control | all | ForbiddenView, guards | router beforeEach, role meta |

Implementation notes:
- The sidebar includes `Dashboard`, `Projects`, `Calendar`, `Backup` (role-gated), `Settings`.
- The `/users` route exists and is admin-restricted, but may not be reachable from the sidebar; E2E tests should navigate directly to `/users`.

### 2.2 FR Coverage Matrix (Specification → Scenarios)

This matrix links the functional requirements in `docs/design/specification.md` to scenario IDs in this document.

| FR | Requirement (short) | Primary scenarios |
| --- | --- | --- |
| FR1 | Admin creates project | PROJ-004, PROJ-005 |
| FR2 | Assign project to client + isolation | PROJ-008, SEC-003, CAL-006 |
| FR3 | Link special users to projects + configure permissions | SEC-004 (GAP if UI missing) |
| FR4 | 4-section project structure | FILE-001, FILE-016 |
| FR5 | Support >5 clients | USERS-003 (seed 6+ clients), PROJ-008 (spot-check) |
| FR6 | Data isolation per client | PROJ-008, SEC-003, CAL-006 |
| FR7 | Admin creates tasks | TASK-002 |
| FR8 | Client creates tasks for admin | TASK-003 |
| FR9 | Task modification | TASK-005 |
| FR10 | Task deletion permissions | TASK-006 |
| FR11 | 5 task states | TASK-007, TASK-008, TASK-009 |
| FR12 | Confirm finished tasks | TASK-008, TASK-009, TASK-010 |
| FR13 | Task prioritization | TASK-002, TASK-005 |
| FR14 | Task file attachments | TASK-011 |
| FR15 | Project-scoped messaging | MSG-001, MSG-002 |
| FR16 | Message attachments | MSG-004, MSG-005 |
| FR17 | Unread message indicator | DASH-002, MSG-007 |
| FR18 | Dropbox integration | FILE-002, FILE-009, FILE-014, FILE-015 |
| FR19 | Support technical formats | FILE-018 |
| FR20 | In-app notifications | NOTIF-001, NOTIF-007, RT-003 |
| FR21 | Optional WhatsApp notifications | NOTIF-008 (GAP/Optional) |
| FR22 | Main screen project summary | DASH-001, DASH-002 |
| FR23 | Joint calendar view | CAL-001, CAL-003 |
| FR24 | Automatic project completion | PDET-006 (GAP if not implemented), PDET-003 |
| FR25 | Historical query of finished projects | PROJ-013 |
| FR26 | Configurable special-user permissions | SEC-004 (GAP if not enforced) |
| FR27 | Admin sees all projects | PROJ-001, PDET-001 |
| FR28 | Role-restricted access | SEC-001, FILE-017, BACKUP-001, USERS-001 |
| FR29 | Real-time synchronization | RT-001, RT-002, RT-003, RT-004 |
| FR30 | Export data | BACKUP-005 |

---

## 3. Test Data & Environment Assumptions

### 3.1 Minimum Seed Data (Recommended)
To make tests deterministic, seed (or create via UI/API) at least:
- **Users**: 1 admin, 1 client, 1 special user
- **Projects**:
  - `P-Active`: ACTIVE / IN_PROGRESS with at least 3 tasks in mixed states
  - `P-Finalizable`: all tasks completed (so finalize enabled)
  - `P-Finalized`: FINALIZED (so messaging/file actions become read-only/disabled where implemented)
- **Tasks**:
  - A task assigned to the client, a task assigned to admin, a task requiring confirmation
- **Messages**:
  - At least one unread message for badge/counter tests
- **Files**:
  - At least one file in each project section (Report & Annexes / Plans / Specifications / Budget)
- **Notifications**:
  - At least one unread notification and one read notification

### 3.2 Dropbox Dependencies
File flows depend on Dropbox integration. Plan for two modes:
- **Real Dropbox sandbox** (preferred for true E2E)
- **Mock/stub backend** (for CI stability) — still validate UI behavior and API contracts.

---

## 4. Scenario Catalog

## 4.1 Authentication & Session (AUTH)

### AUTH-001 — Login (admin) success + redirect to dashboard
- Priority: P0
- Preconditions: Admin account exists.
- Steps:
  1. Go to `/login`.
  2. Enter admin credentials and submit.
- Expected:
  - Navigates to `/`.
  - Header/sidebar visible.
  - No login error banner.

### AUTH-002 — Login with redirect query returns to original destination
- Priority: P0
- Preconditions: Account exists.
- Steps:
  1. In a fresh session, navigate directly to `/projects`.
  2. Confirm redirect to `/login?redirect=%2Fprojects`.
  3. Login.
- Expected:
  - After login, user lands on `/projects`.

### AUTH-003 — Unauthenticated access to protected route redirects to login
- Priority: P0
- Steps:
  1. Go to `/calendar` without a session.
- Expected:
  - Redirect to `/login` with a `redirect` query param.

### AUTH-004 — Authenticated user cannot access guest-only routes
- Priority: P1
- Preconditions: Authenticated session.
- Steps:
  1. Navigate to `/login`.
  2. Navigate to `/register`.
- Expected:
  - Redirect to `/` (dashboard) in both cases.

### AUTH-005 — Login fails with invalid credentials
- Priority: P0
- Steps:
  1. Go to `/login`.
  2. Enter an invalid email/password.
  3. Submit.
- Expected:
  - Error message shown.
  - Stays on `/login`.
  - No auth-only pages visible.

### AUTH-006 — Remember-me behavior persists session (if implemented)
- Priority: P2
- Preconditions: Remember-me checkbox available.
- Steps:
  1. Login with remember-me enabled.
  2. Reload page / restart browser context.
- Expected:
  - User remains logged in OR token persisted (depending on design).

### AUTH-007 — Logout clears session and blocks protected pages
- Priority: P0
- Preconditions: Logged in.
- Steps:
  1. Open user menu.
  2. Click logout.
  3. Attempt to open `/projects`.
- Expected:
  - Redirect to `/login`.
  - Protected content not visible.

### AUTH-008 — Registration success path
- Priority: P1
- Preconditions: Registration enabled in environment.
- Steps:
  1. Go to `/register`.
  2. Fill required fields with a unique email.
  3. Submit.
- Expected:
  - User is created.
  - Redirect to `/` (or `/login`) depending on implemented flow.

### AUTH-009 — Registration validation errors
- Priority: P2
- Steps:
  1. Go to `/register`.
  2. Submit with missing required fields / invalid email.
- Expected:
  - Field-level errors shown.
  - No navigation.

### AUTH-010 — Direct navigation to unknown route shows NotFound
- Priority: P1
- Steps:
  1. Go to `/this-route-does-not-exist`.
- Expected:
  - NotFound view shown.

### AUTH-011 — Invalid/unsafe redirect query is ignored (open-redirect hardening)
- Priority: P1
- Preconditions: No session.
- Steps:
  1. Navigate to `/login?redirect=https://evil.example`.
  2. Login.
- Expected:
  - Redirects to a safe in-app route (typically `/`), not an external domain.

### AUTH-012 — Refreshing an authenticated page preserves session
- Priority: P0
- Preconditions: Logged in.
- Steps:
  1. Go to `/projects`.
  2. Reload the page.
- Expected:
  - User remains authenticated and stays on `/projects`.

### AUTH-013 — Manual navigation to protected route after logout is blocked
- Priority: P0
- Preconditions: Logged in.
- Steps:
  1. Logout.
  2. Use browser Back to attempt returning to `/`.
- Expected:
  - Guard prevents access and redirects to `/login`.

---

## 4.2 Navigation & Layout (NAV)

### NAV-001 — Sidebar shows allowed nav items by role
- Priority: P0
- Preconditions: Test each role.
- Steps:
  1. Login as admin; open sidebar.
  2. Verify entries include Backup.
  3. Login as client/special user; open sidebar.
- Expected:
  - Backup item visible only to admin (or roles with backup permission).

### NAV-002 — Sidebar active state highlights current route
- Priority: P2
- Steps:
  1. Go to `/projects`.
  2. Verify Projects nav item is active.
  3. Go to `/projects/:id`.
- Expected:
  - Projects remains active (path starts with `/projects`).

### NAV-003 — Sidebar collapse hides labels but keeps icons
- Priority: P3
- Preconditions: Desktop viewport.
- Steps:
  1. Click collapse toggle.
- Expected:
  - Sidebar width shrinks; text labels hidden.

### NAV-004 — Mobile sidebar overlay closes on outside click
- Priority: P1
- Preconditions: Mobile viewport (≤768px) and sidebar is open.
- Steps:
  1. Click outside the nav area on the overlay.
- Expected:
  - Sidebar emits close; overlay disappears.

### NAV-005 — Header notifications badge reflects unread count
- Priority: P1
- Preconditions: At least one unread notification.
- Steps:
  1. Login and observe header.
- Expected:
  - Badge shows non-zero count.

### NAV-006 — User dropdown opens/closes (click outside, Escape)
- Priority: P2
- Steps:
  1. Click user avatar/menu.
  2. Click outside.
  3. Open again and press Escape.
- Expected:
  - Menu toggles correctly.

### NAV-007 — Sidebar link click closes sidebar (mobile + desktop)
- Priority: P2
- Preconditions: Sidebar visible.
- Steps:
  1. Open sidebar.
  2. Click “Projects”.
- Expected:
  - Navigation occurs.
  - Sidebar emits close (mobile overlay closes; desktop may remain but close event is fired).

---

## 4.3 Dashboard (DASH)

### DASH-001 — Dashboard loads core widgets
- Priority: P0
- Preconditions: Logged in.
- Steps:
  1. Go to `/`.
- Expected:
  - Stats cards render (with safe fallbacks if no data).
  - Recent projects section renders.
  - Upcoming deadlines section renders.

### DASH-002 — Unread message counter visible for projects (spec FR17)
- Priority: P1
- Preconditions: Project with unread messages.
- Steps:
  1. Open dashboard.
- Expected:
  - Project summary shows unread count indicator.

### DASH-003 — Create new project entry point visibility (role-based)
- Priority: P1
- Preconditions: Test as admin and non-admin.
- Steps:
  1. Open dashboard as admin.
  2. Open dashboard as client.
- Expected:
  - “+ New Project” visible only when user can create projects.

### DASH-004 — Recent project click navigates to details
- Priority: P0
- Steps:
  1. Click a project in recent list.
- Expected:
  - Navigates to `/projects/:id`.

---

## 4.4 Projects List (PROJ)

### PROJ-001 — Projects list loads and shows cards
- Priority: P0
- Steps:
  1. Go to `/projects`.
- Expected:
  - Project list renders.
  - Empty state shown if none.

### PROJ-002 — Search filters project list
- Priority: P2
- Steps:
  1. Type into search field.
- Expected:
  - List updates to matching projects only.

### PROJ-003 — Filter by status/type and sort order
- Priority: P2
- Steps:
  1. Apply a status filter.
  2. Apply a type filter.
  3. Change sort.
- Expected:
  - List updates correctly; counts update.

### PROJ-004 — Create project (admin)
- Priority: P0
- Preconditions: Admin.
- Steps:
  1. Open “+ New Project” modal.
  2. Fill required fields (code, name, dates, client).
  3. Submit.
- Expected:
  - New project appears in list.
  - (Spec FR1/FR2) Dropbox folder path is set (may be backend-driven).

### PROJ-005 — Create project validation errors
- Priority: P1
- Steps:
  1. Open create modal.
  2. Submit with missing required fields.
- Expected:
  - Validation errors; no project created.

### PROJ-006 — Edit project (admin)
- Priority: P1
- Preconditions: Existing project.
- Steps:
  1. Open edit action.
  2. Modify name/type/dates.
  3. Save.
- Expected:
  - Updated values reflected in list and details.

### PROJ-007 — Delete project (admin) requires confirmation
- Priority: P1
- Steps:
  1. Click delete.
  2. Confirm delete.
- Expected:
  - Project removed.
  - Cancel leaves it intact.

### PROJ-008 — Client data isolation: client cannot see other clients’ projects (spec FR6)
- Priority: P0
- Preconditions: At least 2 clients with different projects.
- Steps:
  1. Login as Client A.
  2. Open `/projects`.
- Expected:
  - Only projects assigned to Client A are visible.

### PROJ-009 — Non-admin cannot see project create/edit/delete controls
- Priority: P0
- Preconditions: Client or special user.
- Steps:
  1. Open `/projects`.
  2. Inspect UI for “+ New Project”, edit, and delete actions.
- Expected:
  - Controls are hidden or disabled.

### PROJ-010 — Project list empty state is friendly and actionable
- Priority: P2
- Preconditions: User has zero visible projects.
- Steps:
  1. Open `/projects`.
- Expected:
  - Empty state rendered (no console errors).

### PROJ-011 — Cancel out of create/edit modal leaves data unchanged
- Priority: P2
- Preconditions: Admin.
- Steps:
  1. Open create (or edit) modal.
  2. Enter changes.
  3. Click cancel/close.
- Expected:
  - No new project created / no updates persisted.

### PROJ-012 — Special user project creation (implementation divergence)
- Priority: P1
- Preconditions: Login as Special User.
- Steps:
  1. Open `/projects`.
  2. Look for “+ New Project”.
  3. Attempt to create a project.
- Expected (implementation):
  - Creation may be allowed (current frontend permission logic allows special users to create projects).
- Expected (spec FR1):
  - Only admin can create projects (if CPM must match the spec, this scenario should assert denial instead).

### PROJ-013 — Finalized projects remain visible for historical consultation (spec FR25)
- Priority: P1
- Preconditions: At least one FINALIZED project exists.
- Steps:
  1. Open `/projects`.
  2. Apply status filter(s) to show FINALIZED.
  3. Open the finalized project details.
- Expected:
  - Finalized project can be viewed.
  - Mutating actions follow role/permission rules.

---

## 4.5 Project Details Shell (PDET)

### PDET-001 — Project details route loads and shows tabs
- Priority: P0
- Steps:
  1. Navigate to `/projects/:id`.
- Expected:
  - Project header summary visible.
  - Tabs visible: Overview / Tasks / Messages / Files.

### PDET-002 — Finalize project disabled until tasks completed
- Priority: P0
- Preconditions: Project with pending tasks.
- Steps:
  1. Open project details.
  2. Observe finalize action.
- Expected:
  - Finalize button disabled or blocked until no pending tasks.

### PDET-003 — Finalize project succeeds for finalizable project
- Priority: P1
- Preconditions: Project with all tasks completed.
- Steps:
  1. Click finalize.
  2. Confirm if prompted.
- Expected:
  - Project status becomes FINALIZED.
  - Messaging input becomes disabled (implemented behavior).

### PDET-004 — Tab navigation persists (direct anchors/query if implemented)
- Priority: P2
- Steps:
  1. Switch to Tasks tab.
  2. Refresh page.
- Expected:
  - Remains on same project; tab may reset depending on implementation.

### PDET-005 — Invalid project id shows a safe error state (no crash)
- Priority: P0
- Steps:
  1. Navigate to `/projects/does-not-exist` (or a clearly invalid id).
- Expected:
  - UI shows an error/empty state or redirects; no sensitive data shown.

### PDET-006 — Automatic completion after last task completion (spec FR24) (GAP)
- Priority: P2
- Preconditions: Project where completing the last pending task should finalize automatically.
- Steps:
  1. Complete/confirm the last pending task.
  2. Return to Overview (or project list).
- Expected:
  - Project transitions to FINALIZED automatically, OR a clear UI prompt appears to finalize (implementation-dependent).

---

## 4.6 Tasks (TASK)

### TASK-001 — View task list + filter by status
- Priority: P0
- Preconditions: Project has tasks.
- Steps:
  1. Open project details → Tasks tab.
  2. Use status filter.
- Expected:
  - Task list updates accordingly.

### TASK-002 — Create task (admin)
- Priority: P0
- Preconditions: Admin.
- Steps:
  1. Click “New Task”.
  2. Enter description, priority, deadline, assignee.
  3. Submit.
- Expected:
  - Task appears in list; notifications may be generated (spec FR20).

### TASK-003 — Create task (client assigns to admin)
- Priority: P1
- Preconditions: Client.
- Steps:
  1. Click “New Task”.
  2. Choose admin as assignee.
  3. Submit.
- Expected:
  - Task is created and visible.

### TASK-004 — Task form validation (required fields, length)
- Priority: P1
- Steps:
  1. Open task form.
  2. Submit with empty description.
  3. Enter overly long description.
- Expected:
  - Validation errors shown; submit blocked.

### TASK-005 — Edit task updates fields
- Priority: P1
- Steps:
  1. Open task details.
  2. Click edit.
  3. Change priority/deadline/description.
  4. Save.
- Expected:
  - Updated values reflected.

### TASK-006 — Delete task permissions (spec FR10)
- Priority: P0
- Preconditions: Client created a task; admin created a task.
- Steps:
  1. Login as client.
  2. Attempt to delete admin-created task.
  3. Attempt to delete client-created task.
- Expected:
  - Cannot delete admin-created task.
  - Can delete own task (with confirmation).

### TASK-007 — Allowed status transitions enforced by UI
- Priority: P1
- Preconditions: Task in each relevant status.
- Steps:
  1. Open task edit.
  2. Observe available next statuses.
- Expected:
  - Only allowed transitions are selectable (PENDING→IN_PROGRESS; IN_PROGRESS→PENDING/PARTIAL/PERFORMED; PARTIAL→IN_PROGRESS/PERFORMED).

### TASK-008 — Mark as Done (PERFORMED) triggers confirmation requirement (spec FR12)
- Priority: P0
- Preconditions: Task assignee marks task as PERFORMED.
- Steps:
  1. Change task status to PERFORMED.
- Expected:
  - Task shows “pending confirmation” semantics.
  - Confirmation controls appear for the recipient (if implemented).

### TASK-009 — Confirm completion transitions PERFORMED → COMPLETED
- Priority: P0
- Preconditions: Task is PERFORMED and current user can confirm.
- Steps:
  1. Click confirm completion.
- Expected:
  - Status becomes COMPLETED.

### TASK-010 — Reject completion keeps task non-completed
- Priority: P1
- Preconditions: Task is PERFORMED.
- Steps:
  1. Click reject.
  2. Provide reason if required.
- Expected:
  - Task returns to IN_PROGRESS or appropriate status (implementation-defined).

### TASK-011 — Task attachments during create/edit (spec FR14)
- Priority: P1
- Preconditions: Dropbox/file backend available.
- Steps:
  1. Attach a valid file in task form.
  2. Save.
- Expected:
  - Attachment shows in task details.
  - File stored as Dropbox reference (spec NFR13).

### TASK-012 — Completed tasks are read-only for status transitions
- Priority: P2
- Preconditions: A COMPLETED task exists.
- Steps:
  1. Open task details/edit.
- Expected:
  - Status transition controls are absent/disabled for COMPLETED.

### TASK-013 — PERFORMED tasks cannot be advanced without confirmation
- Priority: P1
- Preconditions: A PERFORMED task exists.
- Steps:
  1. Open task edit.
- Expected:
  - No direct transition to COMPLETED without confirm action.

### TASK-014 — Task list handles “no tasks” state cleanly
- Priority: P2
- Preconditions: Project with no tasks.
- Steps:
  1. Open Tasks tab.
- Expected:
  - Empty state shown; create action available if permitted.

---

## 4.7 Messaging (MSG)

### MSG-001 — View project message list
- Priority: P0
- Steps:
  1. Open project → Messages tab.
- Expected:
  - Messages load; date separators render.

### MSG-002 — Send message (text)
- Priority: P0
- Steps:
  1. Type message.
  2. Press Enter (send).
- Expected:
  - Message appears in list.
  - Input clears.

### MSG-003 — Shift+Enter inserts newline (no send)
- Priority: P2
- Steps:
  1. Type message.
  2. Press Shift+Enter.
- Expected:
  - Newline inserted; message not sent.

### MSG-004 — Send message with attachments (max 5)
- Priority: P1
- Preconditions: Attachment UI enabled.
- Steps:
  1. Attach up to 5 files.
  2. Send.
- Expected:
  - Message includes attachment list.
  - Adding 6th file is blocked with error.

### MSG-005 — Drag & drop attachments into message input
- Priority: P2
- Steps:
  1. Drag files onto message input drop zone.
- Expected:
  - Files added to attachments queue.

### MSG-006 — Messaging disabled when project FINALIZED
- Priority: P1
- Preconditions: Finalized project.
- Steps:
  1. Open Messages tab.
- Expected:
  - MessageInput disabled.
  - User cannot send messages.

### MSG-007 — Unread messages become “read” after viewing (spec FR15/FR17)
- Priority: P1
- Preconditions: Another user sends a message; current user has unread.
- Steps:
  1. Open project messages.
- Expected:
  - Unread counter decreases/clears.

### MSG-008 — New messages indicator + jump to latest
- Priority: P2
- Preconditions: Enough messages to scroll.
- Steps:
  1. Scroll up.
  2. Receive new message (via second session or seeded event).
  3. Click “New messages” indicator.
- Expected:
  - Scroll jumps to latest.

### MSG-009 — Typing indicator shown during other user typing (real-time)
- Priority: P2
- Preconditions: Two sessions in same project.
- Steps:
  1. Session A focuses input and types.
  2. Session B observes.
- Expected:
  - Typing indicator appears in Session B.

### MSG-010 — Cannot send empty/whitespace-only message
- Priority: P1
- Steps:
  1. Focus input.
  2. Enter whitespace only.
  3. Press Enter.
- Expected:
  - Message not sent; user sees validation/disabled send.

### MSG-011 — Message send failure shows error and allows retry (network failure)
- Priority: P2
- Preconditions: Force backend error (mock route, offline, or server returns 500).
- Steps:
  1. Attempt to send a message.
- Expected:
  - Error feedback shown.
  - Input content preserved or a retry path is provided (implementation-defined), but no duplicate sends.

---

## 4.8 Files & Dropbox (FILE)

### FILE-001 — Files tab shows sections and existing files
- Priority: P0
- Steps:
  1. Open project → Files tab.
- Expected:
  - Section tabs visible: Report and Annexes, Plans, Specifications, Budget.
  - File list renders.

### FILE-002 — Upload file via browse
- Priority: P0
- Preconditions: User has upload permission; Dropbox/backend available.
- Steps:
  1. Click upload.
  2. Select a valid file (<50MB per UI).
  3. Submit/upload.
- Expected:
  - Upload progress shown.
  - File appears in list under selected section.

### FILE-003 — Upload via drag & drop
- Priority: P1
- Steps:
  1. Drag a file onto uploader.
- Expected:
  - File enqueued and uploads.

### FILE-004 — Upload validation: file too large is rejected
- Priority: P1
- Steps:
  1. Attempt to upload >50MB file.
- Expected:
  - Error shown; upload not started.

### FILE-005 — Upload validation: disallowed extension rejected
- Priority: P1
- Steps:
  1. Attempt to upload a file with an extension not in allowlist.
- Expected:
  - Error shown.

### FILE-006 — Max file queue size (default 10) enforced
- Priority: P2
- Steps:
  1. Attempt to queue 11 files.
- Expected:
  - 11th is blocked (or queue prevents exceeding limit).

### FILE-007 — Retry failed upload
- Priority: P2
- Preconditions: Force a network/backend error.
- Steps:
  1. Upload a file.
  2. Observe failure state.
  3. Click retry.
- Expected:
  - Upload retries and can succeed.

### FILE-008 — Cancel in-progress upload
- Priority: P2
- Steps:
  1. Start upload.
  2. Click cancel.
- Expected:
  - Upload stops; file not added.

### FILE-009 — Download file from list
- Priority: P0
- Preconditions: File exists.
- Steps:
  1. Click download.
- Expected:
  - File download begins; no UI error.

### FILE-010 — Preview file (if implemented)
- Priority: P2
- Steps:
  1. Click preview.
- Expected:
  - Preview opens (modal/new tab, implementation-defined).

### FILE-011 — Delete file requires confirmation and removes entry
- Priority: P1
- Steps:
  1. Click delete.
  2. Confirm.
- Expected:
  - File removed from list.

### FILE-012 — Search and sort within file list
- Priority: P2
- Steps:
  1. Use search box.
  2. Toggle sort order.
- Expected:
  - List updates.

### FILE-013 — Toggle grid/list view
- Priority: P3
- Steps:
  1. Toggle view mode.
- Expected:
  - Layout changes; content preserved.

### FILE-014 — Sync Dropbox files updates list
- Priority: P1
- Steps:
  1. Click “Sync Dropbox”.
- Expected:
  - Sync runs; new/removed files reflected.

### FILE-015 — Open Dropbox folder action
- Priority: P2
- Steps:
  1. Click “Open Dropbox folder”.
- Expected:
  - Opens external link (new tab) to correct folder.

### FILE-016 — Section selection defaults safely when missing/invalid
- Priority: P2
- Preconditions: Simulate missing/invalid section in URL/state if possible.
- Steps:
  1. Open Files tab.
- Expected:
  - Defaults to “Report and Annexes” section.

### FILE-017 — Non-authorized user cannot upload/delete files (spec FR28)
- Priority: P0
- Preconditions: User role without upload/delete rights (typically restricted special user).
- Steps:
  1. Open Files tab.
  2. Attempt upload and delete.
- Expected:
  - Actions hidden/disabled or backend rejects; UI shows access denied.

### FILE-018 — Upload technical formats (PDF/KML/SHP/images) (spec FR19)
- Priority: P1
- Preconditions: Backend allowlist supports these formats.
- Steps:
  1. Upload a small `.pdf`.
  2. Upload a small `.kml`.
  3. Upload a small `.shp` (or a zipped shapefile bundle if required by backend).
  4. Upload a small image (`.png`/`.jpg`).
- Expected:
  - Each upload is accepted and appears in the file list.
  - If `.shp` must be zipped, UI/backend rejects raw `.shp` with a clear message.

---

## 4.9 Notifications (NOTIF)

### NOTIF-001 — Notifications page loads and lists notifications
- Priority: P0
- Steps:
  1. Go to `/notifications`.
- Expected:
  - List of notifications shown.

### NOTIF-002 — Filter notifications (type/status)
- Priority: P2
- Steps:
  1. Apply filters.
- Expected:
  - Only matching notifications shown.

### NOTIF-003 — Mark single notification as read
- Priority: P1
- Preconditions: Unread notification exists.
- Steps:
  1. Click mark as read.
- Expected:
  - Notification state becomes read.
  - Header badge count decreases.

### NOTIF-004 — Mark all as read
- Priority: P1
- Steps:
  1. Click “Mark all read”.
- Expected:
  - All become read; badge clears.

### NOTIF-005 — Delete notification
- Priority: P2
- Steps:
  1. Click delete.
- Expected:
  - Notification removed.

### NOTIF-006 — Load more pagination
- Priority: P2
- Steps:
  1. Scroll/click load more.
- Expected:
  - More notifications appear.

### NOTIF-007 — Navigate to related entity from notification
- Priority: P0
- Preconditions: Notification has related project/task.
- Steps:
  1. Click notification.
- Expected:
  - Navigates to relevant route (e.g., project details).

### NOTIF-008 — (GAP/Optional) WhatsApp notifications toggle & behavior (spec FR21)
- Priority: P3
- Preconditions: WhatsApp integration enabled.
- Steps:
  1. Enable WhatsApp notifications in settings.
  2. Trigger critical event (task assigned).
- Expected:
  - WhatsApp message is sent (verify via stub/sandbox).

### NOTIF-009 — Notifications empty state
- Priority: P3
- Preconditions: User with zero notifications.
- Steps:
  1. Go to `/notifications`.
- Expected:
  - Friendly empty state; no errors.

---

## 4.10 Calendar (CAL)

### CAL-001 — Calendar view loads projects/tasks on dates
- Priority: P0
- Steps:
  1. Go to `/calendar`.
- Expected:
  - Calendar shows project deliveries.
  - Task deadlines appear (if implemented).

### CAL-002 — Changing month reloads calendar data
- Priority: P1
- Steps:
  1. Navigate to next month.
- Expected:
  - Data reload; displayed items correspond to month.

### CAL-003 — Click project entry navigates to project details
- Priority: P0
- Steps:
  1. Click a project in the calendar.
- Expected:
  - Navigates to `/projects/:id`.

### CAL-004 — Click task navigates to project tasks tab with task focused
- Priority: P1
- Preconditions: Task click action exists and passes `taskId`.
- Steps:
  1. Click a task entry.
- Expected:
  - Navigates to project details.
  - Tasks tab opened and specific task highlighted/selected (implementation-defined).

### CAL-005 — Selecting a date shows projects for that date
- Priority: P2
- Steps:
  1. Click a date.
- Expected:
  - ProjectCards list for that date displayed.

### CAL-006 — Client calendar only shows client-visible projects (spec FR6)
- Priority: P0
- Preconditions: At least 2 clients with different projects.
- Steps:
  1. Login as Client A.
  2. Open `/calendar`.
- Expected:
  - Only Client A projects appear.

---

## 4.11 Backup, Export & Recovery (BACKUP — Admin)

### BACKUP-001 — Non-admin blocked from backup route
- Priority: P0
- Steps:
  1. Login as client.
  2. Navigate to `/backup`.
- Expected:
  - Redirect to `/forbidden` (router guard).

### BACKUP-002 — Admin can open backup page and see controls
- Priority: P0
- Steps:
  1. Login as admin.
  2. Go to `/backup`.
- Expected:
  - Backup dashboard visible.
  - No “Access Denied” block.

### BACKUP-003 — Create manual backup
- Priority: P1
- Steps:
  1. Click “Create backup”.
- Expected:
  - New backup entry appears in history.

### BACKUP-004 — Configure schedule (frequency/time/retention)
- Priority: P2
- Steps:
  1. Set schedule fields.
  2. Save.
- Expected:
  - Success feedback; values persist after reload.

### BACKUP-005 — Export data (CSV/Excel/PDF)
- Priority: P1
- Steps:
  1. Click each export button.
- Expected:
  - Download starts; file type correct.

### BACKUP-006 — Download a backup from history
- Priority: P2
- Steps:
  1. Click download for a history entry.
- Expected:
  - File download begins.

### BACKUP-007 — Restore backup requires confirmation
- Priority: P1
- Steps:
  1. Click restore.
  2. Confirm.
- Expected:
  - Restore begins; UI indicates progress/completion.

### BACKUP-008 — Delete backup requires confirmation
- Priority: P2
- Steps:
  1. Click delete.
  2. Confirm.
- Expected:
  - Entry removed.

### BACKUP-009 — Export/backup failures show clear error (no silent failure)
- Priority: P2
- Preconditions: Simulate backend error.
- Steps:
  1. Click an export or create-backup action.
- Expected:
  - Error banner/toast shown; UI remains usable.

---

## 4.12 User Management (USERS — Admin)

### USERS-001 — Non-admin blocked from users route
- Priority: P0
- Steps:
  1. Login as client.
  2. Navigate to `/users`.
- Expected:
  - Redirect to `/forbidden`.

### USERS-002 — Admin can view user list
- Priority: P0
- Steps:
  1. Login as admin.
  2. Go to `/users`.
- Expected:
  - User table/list renders.

### USERS-003 — Create user (admin)
- Priority: P1
- Steps:
  1. Click create user.
  2. Fill fields; choose role.
  3. Save.
- Expected:
  - User appears in list.

### USERS-004 — Edit user role/status
- Priority: P1
- Steps:
  1. Edit existing user.
  2. Change role or activation.
  3. Save.
- Expected:
  - List reflects changes.

### USERS-005 — Delete user blocked for self
- Priority: P1
- Preconditions: Admin is viewing own user row.
- Steps:
  1. Attempt delete self.
- Expected:
  - Deletion prevented with clear message.

### USERS-006 — Filters: role, active-only, search
- Priority: P2
- Steps:
  1. Apply each filter.
- Expected:
  - List updates.

### USERS-007 — User creation validation (required fields, email format)
- Priority: P2
- Steps:
  1. Open create user.
  2. Submit with missing/invalid fields.
- Expected:
  - Validation errors; no user created.

---

## 4.13 Settings (SET)

### SET-001 — Settings page loads current user profile fields
- Priority: P1
- Steps:
  1. Go to `/settings`.
- Expected:
  - Username/email/phone fields prefilled (if stored).

### SET-002 — Update profile fields
- Priority: P1
- Steps:
  1. Change username/phone.
  2. Save.
- Expected:
  - Success message; values persist after reload.

### SET-003 — Change password validation
- Priority: P1
- Steps:
  1. Enter wrong current password.
  2. Submit.
- Expected:
  - Error shown; password unchanged.

### SET-004 — Toggle notification preferences
- Priority: P2
- Steps:
  1. Toggle notification switches.
  2. Save.
- Expected:
  - Preferences persist.

### SET-005 — Role-specific settings sections visible appropriately
- Priority: P2
- Preconditions: Test per role.
- Steps:
  1. Login as client → open settings.
  2. Login as special user → open settings.
- Expected:
  - Role-specific blocks appear only when relevant.

### SET-006 — Invalid email update rejected
- Priority: P2
- Steps:
  1. Enter invalid email.
  2. Save.
- Expected:
  - Validation error shown; email unchanged.

---

## 4.14 Access Control & Error Handling (SEC)

### SEC-001 — Admin-only routes redirect to forbidden for non-admin
- Priority: P0
- Steps:
  1. Login as client.
  2. Visit `/backup` and `/users`.
- Expected:
  - Redirect to `/forbidden`.

### SEC-002 — Direct access to `/forbidden` renders access denied page
- Priority: P2
- Steps:
  1. Go to `/forbidden`.
- Expected:
  - Forbidden content visible.

### SEC-003 — Client cannot access another client’s project details by URL (spec FR6)
- Priority: P0
- Preconditions: Project belongs to a different client.
- Steps:
  1. Login as Client A.
  2. Navigate directly to `/projects/:id` for Client B’s project.
- Expected:
  - Access denied behavior (backend-driven): error state, redirect, or forbidden.
  - No project data leakage in UI.

### SEC-004 — Special user permission restrictions (spec FR26) (GAP)
- Priority: P1
- Preconditions: Special user linked with limited permissions.
- Steps:
  1. Login as special user.
  2. Open assigned project.
  3. Attempt restricted actions (upload/download/send message/edit task).
- Expected:
  - Only allowed actions enabled.
  - Restricted actions blocked with clear feedback.

---

## 4.15 Real-Time Synchronization (RT)

### RT-001 — New message appears in other session without refresh
- Priority: P1
- Preconditions: Two sessions (A and B) in same project.
- Steps:
  1. Session A sends a message.
  2. Observe Session B.
- Expected:
  - Session B message list updates within a few seconds (spec NFR12).

### RT-002 — Task status change syncs to other session
- Priority: P1
- Preconditions: Two sessions.
- Steps:
  1. Session A changes a task status.
  2. Observe Session B.
- Expected:
  - Task list updates.

### RT-003 — Notification appears after event (e.g., new message)
- Priority: P1
- Preconditions: Two sessions.
- Steps:
  1. Session A triggers event.
  2. Session B observes header badge / notifications page.
- Expected:
  - New notification appears.

### RT-004 — File sync event updates list in other session
- Priority: P2
- Preconditions: Two sessions.
- Steps:
  1. Session A uploads a file.
  2. Session B opens Files tab.
- Expected:
  - File appears (either push event or after sync).

### RT-005 — Presence/online indicators update (if implemented)
- Priority: P3
- Preconditions: Two sessions.
- Steps:
  1. Open same project in both sessions.
  2. Close one session.
- Expected:
  - Presence indicator updates accordingly.

---

## 4.16 Accessibility & Responsive (A11Y)

### A11Y-001 — Keyboard-only login
- Priority: P2
- Steps:
  1. Navigate login form using Tab.
  2. Submit with Enter.
- Expected:
  - Focus order logical; submit works.

### A11Y-002 — Buttons/inputs have accessible names
- Priority: P2
- Steps:
  1. Inspect key actions (sidebar collapse toggle, upload, send message) using Playwright accessibility snapshot.
- Expected:
  - Controls have names/labels (e.g., aria-label for collapse).

### A11Y-003 — Mobile layout: sidebar overlay and navigation usable
- Priority: P2
- Preconditions: Mobile viewport.
- Steps:
  1. Open sidebar.
  2. Navigate to Projects.
- Expected:
  - Sidebar closes after selection; route changes.

---

## 5. Execution Matrix

Recommended suites:
- **Smoke (CI per PR, ~3–8 min):** AUTH-001/002/003/007, PROJ-001, PROJ-008, PDET-001, TASK-002, MSG-002, FILE-001, NOTIF-001, CAL-003, BACKUP-001, USERS-001.
- **Nightly (~15–30 min):** All P0 + P1, include RT-001/002.
- **Weekly/Release (~30–60 min):** Cross-browser + responsive + A11Y scenarios; additional permutations and failure injection.

---

## 6. Known Gaps / Risk Areas (Track as TODO)

- **Special user per-project permission granularity** (spec FR26) may not be fully enforced in UI (some permissions appear permissive). Keep SEC-004 as a coverage requirement.
- **WhatsApp notifications** (spec FR21) not clearly present in settings UI; keep NOTIF-008 as optional/GAP.
- **Backend-enforced isolation**: client-side guard for project access is intentionally disabled; rely on SEC-003 to validate server enforcement.
- **Project creation permissions**: current frontend permission logic allows Special Users to create projects; spec FR1 states admin-only. Keep PROJ-012 to force a product decision and avoid silent drift.
- **Automatic project completion** (spec FR24) is not clearly surfaced as a distinct UI behavior; keep PDET-006 to validate (or flag as gap).

---

## 7. Implementation Notes for Test Authors (Optional)

- Prefer Playwright `storageState` per role to speed up suites.
- For real-time scenarios, use two browser contexts or two pages with different storage states.
- For file upload, keep fixtures small and deterministic; include one disallowed extension file for negative tests.

---

## 8. Scenario Summary & Checklist

This section is auto-generated from the scenario headings in this file.

**Total scenarios:** 132

**By priority:**
- P0: 39
- P1: 48
- P2: 40
- P3: 5

**By module:**
- AUTH: 13
- BACKUP: 9
- CAL: 6
- DASH: 4
- FILE: 18
- MSG: 11
- NAV: 7
- NOTIF: 9
- PDET: 6
- PROJ: 13
- RT: 5
- SEC: 4
- SET: 6
- TASK: 14
- USERS: 7

**Checklist (all scenarios):**
- [x] AUTH-001 (P0) — Login (admin) success + redirect to dashboard
- [x] AUTH-002 (P0) — Login with redirect query returns to original destination
- [x] AUTH-003 (P0) — Unauthenticated access to protected route redirects to login
- [x] AUTH-004 (P1) — Authenticated user cannot access guest-only routes
- [x] AUTH-005 (P0) — Login fails with invalid credentials
- [ ] AUTH-006 (P2) — Remember-me behavior persists session (if implemented)
- [x] AUTH-007 (P0) — Logout clears session and blocks protected pages
- [ ] AUTH-008 (P1) — Registration success path
- [ ] AUTH-009 (P2) — Registration validation errors
- [x] AUTH-010 (P1) — Direct navigation to unknown route shows NotFound
- [x] AUTH-011 (P1) — Invalid/unsafe redirect query is ignored (open-redirect hardening)
- [x] AUTH-012 (P0) — Refreshing an authenticated page preserves session
- [x] AUTH-013 (P0) — Manual navigation to protected route after logout is blocked
- [x] NAV-001 (P0) — Sidebar shows allowed nav items by role
- [x] NAV-002 (P2) — Sidebar active state highlights current route
- [x] NAV-003 (P3) — Sidebar collapse hides labels but keeps icons
- [x] NAV-004 (P1) — Mobile sidebar overlay closes on outside click
- [x] NAV-005 (P1) — Header notifications badge reflects unread count
- [x] NAV-006 (P2) — User dropdown opens/closes (click outside, Escape)
- [x] NAV-007 (P2) — Sidebar link click closes sidebar (mobile + desktop)
- [x] DASH-001 (P0) — Dashboard loads core widgets
- [ ] DASH-002 (P1) — Unread message counter visible for projects (spec FR17)
- [x] DASH-003 (P1) — Create new project entry point visibility (role-based)
- [x] DASH-004 (P0) — Recent project click navigates to details
- [x] PROJ-001 (P0) — Projects list loads and shows cards
- [x] PROJ-002 (P2) — Search filters project list
- [x] PROJ-003 (P2) — Filter by status/type and sort order
- [x] PROJ-004 (P0) — Create project (admin)
- [x] PROJ-005 (P1) — Create project validation errors
- [x] PROJ-006 (P1) — Edit project (admin)
- [x] PROJ-007 (P1) — Delete project (admin) requires confirmation
- [x] PROJ-008 (P0) — Client data isolation: client cannot see other clients’ projects (spec FR6)
- [x] PROJ-009 (P0) — Non-admin cannot see project create/edit/delete controls
- [x] PROJ-010 (P2) — Project list empty state is friendly and actionable
- [x] PROJ-011 (P2) — Cancel out of create/edit modal leaves data unchanged
- [ ] PROJ-012 (P1) — Special user project creation (implementation divergence)
- [ ] PROJ-013 (P1) — Finalized projects remain visible for historical consultation (spec FR25)
- [ ] PDET-001 (P0) — Project details route loads and shows tabs
- [ ] PDET-002 (P0) — Finalize project disabled until tasks completed
- [ ] PDET-003 (P1) — Finalize project succeeds for finalizable project
- [ ] PDET-004 (P2) — Tab navigation persists (direct anchors/query if implemented)
- [ ] PDET-005 (P0) — Invalid project id shows a safe error state (no crash)
- [ ] PDET-006 (P2) — Automatic completion after last task completion (spec FR24) (GAP)
- [ ] TASK-001 (P0) — View task list + filter by status
- [ ] TASK-002 (P0) — Create task (admin)
- [ ] TASK-003 (P1) — Create task (client assigns to admin)
- [ ] TASK-004 (P1) — Task form validation (required fields, length)
- [ ] TASK-005 (P1) — Edit task updates fields
- [ ] TASK-006 (P0) — Delete task permissions (spec FR10)
- [ ] TASK-007 (P1) — Allowed status transitions enforced by UI
- [ ] TASK-008 (P0) — Mark as Done (PERFORMED) triggers confirmation requirement (spec FR12)
- [ ] TASK-009 (P0) — Confirm completion transitions PERFORMED → COMPLETED
- [ ] TASK-010 (P1) — Reject completion keeps task non-completed
- [ ] TASK-011 (P1) — Task attachments during create/edit (spec FR14)
- [ ] TASK-012 (P2) — Completed tasks are read-only for status transitions
- [ ] TASK-013 (P1) — PERFORMED tasks cannot be advanced without confirmation
- [ ] TASK-014 (P2) — Task list handles “no tasks” state cleanly
- [ ] MSG-001 (P0) — View project message list
- [ ] MSG-002 (P0) — Send message (text)
- [ ] MSG-003 (P2) — Shift+Enter inserts newline (no send)
- [ ] MSG-004 (P1) — Send message with attachments (max 5)
- [ ] MSG-005 (P2) — Drag & drop attachments into message input
- [ ] MSG-006 (P1) — Messaging disabled when project FINALIZED
- [ ] MSG-007 (P1) — Unread messages become “read” after viewing (spec FR15/FR17)
- [ ] MSG-008 (P2) — New messages indicator + jump to latest
- [ ] MSG-009 (P2) — Typing indicator shown during other user typing (real-time)
- [ ] MSG-010 (P1) — Cannot send empty/whitespace-only message
- [ ] MSG-011 (P2) — Message send failure shows error and allows retry (network failure)
- [x] FILE-001 (P0) — Files tab shows sections and existing files
- [ ] FILE-002 (P0) — Upload file via browse
- [ ] FILE-003 (P1) — Upload via drag & drop
- [ ] FILE-004 (P1) — Upload validation: file too large is rejected
- [ ] FILE-005 (P1) — Upload validation: disallowed extension rejected
- [ ] FILE-006 (P2) — Max file queue size (default 10) enforced
- [ ] FILE-007 (P2) — Retry failed upload
- [ ] FILE-008 (P2) — Cancel in-progress upload
- [ ] FILE-009 (P0) — Download file from list
- [ ] FILE-010 (P2) — Preview file (if implemented)
- [ ] FILE-011 (P1) — Delete file requires confirmation and removes entry
- [ ] FILE-012 (P2) — Search and sort within file list
- [ ] FILE-013 (P3) — Toggle grid/list view
- [ ] FILE-014 (P1) — Sync Dropbox files updates list
- [ ] FILE-015 (P2) — Open Dropbox folder action
- [ ] FILE-016 (P2) — Section selection defaults safely when missing/invalid
- [ ] FILE-017 (P0) — Non-authorized user cannot upload/delete files (spec FR28)
- [ ] FILE-018 (P1) — Upload technical formats (PDF/KML/SHP/images) (spec FR19)
- [x] NOTIF-001 (P0) — Notifications page loads and lists notifications
- [x] NOTIF-002 (P2) — Filter notifications (type/status)
- [x] NOTIF-003 (P1) — Mark single notification as read
- [x] NOTIF-004 (P1) — Mark all as read
- [x] NOTIF-005 (P2) — Delete notification
- [x] NOTIF-006 (P2) — Load more pagination
- [x] NOTIF-007 (P0) — Navigate to related entity from notification
- [ ] NOTIF-008 (P3) — (GAP/Optional) WhatsApp notifications toggle & behavior (spec FR21)
- [x] NOTIF-009 (P3) — Notifications empty state
- [x] CAL-001 (P0) — Calendar view loads projects/tasks on dates
- [x] CAL-002 (P1) — Changing month reloads calendar data
- [x] CAL-003 (P0) — Click project entry navigates to project details
- [x] CAL-004 (P1) — Click task navigates to project tasks tab with task focused
- [x] CAL-005 (P2) — Selecting a date shows projects for that date
- [x] CAL-006 (P0) — Client calendar only shows client-visible projects (spec FR6)
- [x] BACKUP-001 (P0) — Non-admin blocked from backup route
- [x] BACKUP-002 (P0) — Admin can open backup page and see controls
- [ ] BACKUP-003 (P1) — Create manual backup
- [ ] BACKUP-004 (P2) — Configure schedule (frequency/time/retention)
- [ ] BACKUP-005 (P1) — Export data (CSV/Excel/PDF)
- [ ] BACKUP-006 (P2) — Download a backup from history
- [ ] BACKUP-007 (P1) — Restore backup requires confirmation
- [ ] BACKUP-008 (P2) — Delete backup requires confirmation
- [ ] BACKUP-009 (P2) — Export/backup failures show clear error (no silent failure)
- [x] USERS-001 (P0) — Non-admin blocked from users route
- [x] USERS-002 (P0) — Admin can view user list
- [x] USERS-003 (P1) — Create user (admin)
- [x] USERS-004 (P1) — Edit user role/status
- [x] USERS-005 (P1) — Delete user blocked for self
- [x] USERS-006 (P2) — Filters: role, active-only, search
- [ ] USERS-007 (P2) — User creation validation (required fields, email format)
- [ ] SET-001 (P1) — Settings page loads current user profile fields
- [ ] SET-002 (P1) — Update profile fields
- [ ] SET-003 (P1) — Change password validation
- [ ] SET-004 (P2) — Toggle notification preferences
- [ ] SET-005 (P2) — Role-specific settings sections visible appropriately
- [ ] SET-006 (P2) — Invalid email update rejected
- [x] SEC-001 (P0) — Admin-only routes redirect to forbidden for non-admin
- [ ] SEC-002 (P2) — Direct access to `/forbidden` renders access denied page
- [ ] SEC-003 (P0) — Client cannot access another client’s project details by URL (spec FR6)
- [ ] SEC-004 (P1) — Special user permission restrictions (spec FR26) (GAP)
- [ ] RT-001 (P1) — New message appears in other session without refresh
- [ ] RT-002 (P1) — Task status change syncs to other session
- [ ] RT-003 (P1) — Notification appears after event (e.g., new message)
- [ ] RT-004 (P2) — File sync event updates list in other session
- [ ] RT-005 (P3) — Presence/online indicators update (if implemented)
