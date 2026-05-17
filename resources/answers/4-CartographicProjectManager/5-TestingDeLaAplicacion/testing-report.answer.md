# Respuesta

## Testing Report

<summary>Testing Report</summary>
			```markdown
# Playwright Testing Report (CartographicProjectManager)

- Date: 2026-03-16
- Scope: Playwright E2E coverage only (Jest is intentionally excluded for this report).
- Coverage definition: Behavioral/user-flow coverage by page/view and scenario IDs, not code instrumentation coverage.

## 1. How to Run

- Critical gate (Chromium): `npm run test:e2e -- e2e/critical --project=chromium`
- All suites (Chromium): `npm run test:e2e -- --project=chromium`
- Open report: `npx playwright show-report`

## 2. Suite Inventory

- Total Playwright tests discovered (all suites): 131
- Critical suite tests discovered: 100
- Suites present: critical, medium, high (low currently has no .spec.ts).

## 3. Coverage by Page / View (Behavioral)

### Authentication (Login/Register) + Route Guards

- Covered by: e2e/critical/auth-and-guards.spec.ts
- Notes: Covers successful/failed login, registration, refresh persistence, redirect hardening, and guest/auth-only route protections.

### Navigation Shell (Sidebar/Header/Badges)

- Covered by: e2e/high/navigation-ui.spec.ts, e2e/high/navigation.spec.ts
- Notes: Covers role-based nav visibility (admin vs non-admin), active route highlighting, collapsed/mobile sidebar behavior, logout flow, and unread badge rendering.

### Dashboard

- Covered by: e2e/medium/dashboard.spec.ts
- Notes: Covers core widgets and navigation entry points (recent project navigation, create project entry point permissions, unread counters).

### Projects List (Search/Filter/Sort)

- Covered by: e2e/medium/projects-filter-sort.spec.ts
- Notes: Covers deterministic search, filtering by status/type, and sorting.

### Projects CRUD + Project Details Route

- Covered by: e2e/critical/project-crud.spec.ts
- Notes: Covers creating/editing/deleting projects, details route load, tab persistence, finalize flows, invalid id safety, and role-based UI controls.

### Project Details → Tasks Tab

- Covered by: e2e/critical/task-workflow.spec.ts, e2e/critical/realtime.spec.ts
- Notes: Covers task create/edit/delete, validations, status transitions/confirmations, attachments, read-only rules for completed tasks, and real-time task updates across sessions.

### Project Details → Messages Tab

- Covered by: e2e/critical/messaging.spec.ts, e2e/critical/realtime.spec.ts
- Notes: Covers message compose/send, multi-line entry, attachments, unread/read behavior, finalized project restrictions, typing indicator, and real-time message delivery.

### Project Details → Files Tab

- Covered by: e2e/critical/files-tab.spec.ts, e2e/critical/realtime.spec.ts
- Notes: Covers upload (browse/drag-drop), validation, queue limits, retry/cancel, list search/sort/grid view, download/preview/delete, Dropbox sync/open folder, auth restrictions, and real-time file list updates.

### Notifications Page (List/Read/Delete/Navigation/Filters/Pagination/Empty)

- Covered by: e2e/medium/notifications.spec.ts, e2e/medium/notifications-workflow.spec.ts, e2e/medium/notifications-filter-pagination.spec.ts, e2e/medium/notifications-navigation-delete.spec.ts, e2e/medium/notifications-empty-state.spec.ts, e2e/critical/realtime.spec.ts
- Notes: Covers list load, mark read (single/all), filter by type/unread, pagination, delete, navigation to related entities, empty state, and real-time notification appearance.

### Settings Page (Profile + Local Preferences)

- Covered by: e2e/critical/admin-pages.spec.ts
- Notes: Covers settings load/update validation, password mismatch, role-specific sections, and local notification preference saving.

### Admin: Users Management

- Covered by: e2e/critical/admin-pages.spec.ts, e2e/medium/users-management.spec.ts
- Notes: Covers users list access, create/edit/delete rules, and filtering.

### Admin: Backups

- Covered by: e2e/critical/admin-pages.spec.ts
- Notes: Covers backup page access, create/download/delete/restore confirmations, schedule config, and failure handling.

### Calendar

- Covered by: e2e/medium/calendar.spec.ts
- Notes: Covers calendar loading, month navigation, date selection, navigation to project details/tasks, and client visibility constraints.

### Security Scenarios (Forbidden, Isolation, Special-User Permissions)

- Covered by: e2e/critical/security.spec.ts, e2e/critical/auth-and-guards.spec.ts
- Notes: Covers forbidden page rendering, backend-enforced project isolation, and special-user permission restrictions.

### Real-time Collaboration (Socket.IO)

- Covered by: e2e/critical/realtime.spec.ts
- Notes: Covers cross-session updates for messages/tasks/files/notifications, typing indicator, and presence online/offline indicator behavior.

### Optional WhatsApp Sandbox Notification (NOTIF-008)

- Covered by: e2e/critical/notifications.spec.ts
- Notes: Covers sandbox-only behavior: when enabled in Settings, a task assignment triggers a sandbox WhatsApp outbox entry (no external provider).

## 4. Implemented Playwright Tests (Full Catalog)

### critical

- e2e/critical/admin-pages.spec.ts (17 tests)
  - BACKUP-002: admin can open backup page and see controls
  - BACKUP-003: admin can create a manual backup and see it in history
  - BACKUP-005: admin can export project data in supported formats
  - BACKUP-006: admin can download a backup from history
  - BACKUP-008: delete backup requires confirmation
  - BACKUP-004: admin can configure and save backup schedule
  - BACKUP-007: restore backup requires confirmation
  - BACKUP-009: backup/export failures show clear errors
  - USERS-002: admin can view user list page
  - SET-001: settings page loads current user profile fields
  - SET-002: admin can update profile fields
  - SET-003: password mismatch shows a validation error and blocks saving
  - SET-004: toggle notification preferences shows success
  - SET-005: role-specific settings sections visible appropriately (admin)
  - SET-006: invalid email is rejected client-side and blocks update
  - SET-005: role-specific settings sections visible appropriately (non-admin)
  - USERS-007: user creation modal enforces required/email/min-length validation
- e2e/critical/auth-and-guards.spec.ts (14 tests)
  - logs in successfully (admin) and lands on dashboard
  - redirects unauthenticated user to /login with redirect param
  - logs in and returns to original destination via redirect
  - redirects authenticated user away from guest-only routes (/login, /register)
  - shows error and stays on /login for invalid credentials
  - preserves authenticated session after refresh
  - AUTH-006: remember-me enabled keeps the session after reload
  - ignores unsafe redirect query after login (open redirect hardening)
  - blocks non-admin user from /backup and redirects to /forbidden
  - blocks non-admin user from /users and redirects to /forbidden
  - shows NotFound page for unknown route
  - AUTH-008: registration success path
  - AUTH-009: blocks registration submit with invalid email (native validation)
  - AUTH-009: shows validation error when passwords do not match
- e2e/critical/files-tab.spec.ts (18 tests)
  - FILE-001: files tab shows sections and file list renders
  - FILE-002: upload file via browse
  - FILE-003: upload via drag & drop
  - FILE-008: cancel upload in progress
  - FILE-004: upload validation rejects file too large
  - FILE-005: upload validation rejects disallowed extension
  - FILE-006: max file queue size (default 10) enforced
  - FILE-007: retry failed upload
  - FILE-012: search and sort within file list
  - FILE-013: toggle grid/list view preserves content
  - FILE-009: download file from list
  - FILE-010: preview file opens in a new tab
  - FILE-011: delete file requires confirmation and removes entry
  - FILE-014: Sync Dropbox files updates list
  - FILE-015: Open Dropbox folder action
  - FILE-016: section selection defaults safely when missing/invalid
  - FILE-018: upload technical formats (PDF/KML/SHP/images)
  - FILE-017: non-authorized user cannot upload/delete files
- e2e/critical/messaging.spec.ts (10 tests)
  - MSG-001: message list renders (empty state)
  - MSG-002: send message (text) via Enter
  - MSG-003: Shift+Enter inserts newline (no send)
  - MSG-008: new messages indicator appears when scrolled up and jumps to latest
  - MSG-005: drag & drop attachments into message input
  - MSG-004: send message with attachments (max 5)
  - MSG-010: cannot send empty/whitespace-only message
  - MSG-011: message send failure shows error and allows retry (network failure)
  - MSG-006: messaging disabled when project is FINALIZED
  - MSG-007: unread messages become “read” after viewing (spec FR15/FR17)
- e2e/critical/notifications.spec.ts (1 tests)
  - NOTIF-008: WhatsApp sandbox message sent on task assignment when enabled
- e2e/critical/project-crud.spec.ts (16 tests)
  - admin can view, edit, and delete a project
  - PROJ-004: admin can create a project from the Projects list
  - PROJ-005: create project shows validation errors and blocks submission
  - PROJ-010: empty state is friendly and actionable when filters match no projects
  - PROJ-011: cancel create modal leaves data unchanged (no project created)
  - PROJ-011: cancel edit modal leaves project unchanged
  - PDET-001: project details route loads and shows tabs
  - PDET-002: finalize project disabled until tasks completed
  - PDET-003: finalize project succeeds for finalizable project
  - PDET-004: tab navigation persists via query param on refresh
  - PDET-005: invalid project id shows a safe error state (no crash)
  - PDET-006: prompts to finalize after completing the last pending task
  - PROJ-012: special user can create a project (implementation divergence)
  - PROJ-009: non-admin cannot see project create/edit/delete controls
  - PROJ-008: client cannot see other clients\
  - PROJ-013: finalized projects remain visible and accessible for clients
- e2e/critical/realtime.spec.ts (6 tests)
  - RT-001: new message appears in other session without refresh
  - RT-002: task status change appears in other session without refresh
  - RT-004: file upload appears in other session without refresh
  - RT-003: notification appears after new message without refresh
  - MSG-009: typing indicator shown during other user typing
  - RT-005: presence indicator updates when another session disconnects
- e2e/critical/security.spec.ts (3 tests)
  - SEC-002: direct access to /forbidden renders access denied page
  - SEC-003: client cannot access another client’s project details by URL
  - SEC-004: special user permission restrictions
- e2e/critical/task-workflow.spec.ts (15 tests)
  - TASK-001: task list filters by status
  - TASK-002: admin can create a task
  - TASK-011: task attachments during create show in task details
  - TASK-005: edit task updates fields
  - TASK-012: completed tasks are read-only for status transitions
  - TASK-014: task list handles “no tasks” state cleanly
  - TASK-004: task form validation shows required field errors
  - TASK-008: marking a task PERFORMED shows confirmation controls for completion
  - TASK-007: allowed status transitions enforced by UI
  - TASK-010: reject completion keeps task non-completed
  - TASK-013: PERFORMED tasks cannot be advanced without confirmation
  - TASK-009: confirm completion transitions PERFORMED → COMPLETED
  - admin can transition a task from Pending to In Progress
  - TASK-003: client creates task and assigns to admin
  - TASK-006: can delete own task but not admin-created task

### medium

- e2e/medium/calendar.spec.ts (6 tests)
  - CAL-001: calendar view loads project deliveries and task deadlines
  - CAL-002: changing month reloads calendar data
  - CAL-005: selecting a date shows projects for that date
  - CAL-004: clicking a calendar task navigates to project tasks with task focused
  - CAL-003: clicking a calendar project navigates to project details
  - CAL-006: client calendar only shows client-visible projects
- e2e/medium/dashboard.spec.ts (5 tests)
  - DASH-001: loads core widgets
  - DASH-003: create project entry point is visible for allowed roles
  - DASH-004: clicking a recent project navigates to details
  - DASH-002: unread message counter visible for projects (spec FR17)
  - DASH-003: create project entry point follows role permissions
- e2e/medium/notifications-empty-state.spec.ts (1 tests)
  - NOTIF-009: notifications empty state
- e2e/medium/notifications-filter-pagination.spec.ts (2 tests)
  - NOTIF-002: filter notifications by type and unread
  - NOTIF-006: load more pagination reveals older notifications
- e2e/medium/notifications-navigation-delete.spec.ts (2 tests)
  - NOTIF-007: navigate to related entity from notification
  - NOTIF-005: delete notification removes it from the list
- e2e/medium/notifications-workflow.spec.ts (1 tests)
  - NOTIF-001/003/004: lists notifications and supports mark read actions
- e2e/medium/notifications.spec.ts (1 tests)
  - NOTIF-001: notifications page loads (list or empty state)
- e2e/medium/projects-filter-sort.spec.ts (1 tests)
  - PROJ-002/003: search, filter by status/type, and sort projects deterministically
- e2e/medium/users-management.spec.ts (4 tests)
  - USERS-003: create user (admin)
  - USERS-004: edit user role
  - USERS-005: delete user blocked for self
  - USERS-006: filters: role, active-only, search

### high

- e2e/high/navigation-ui.spec.ts (7 tests)
  - NAV-001: sidebar shows allowed nav items by role (admin sees Backup)
  - NAV-002: sidebar active state highlights current route
  - NAV-003: sidebar collapse hides labels but keeps icons
  - NAV-006: user dropdown opens/closes (click outside, Escape)
  - NAV-001: sidebar hides admin-only nav items (non-admin cannot see Backup)
  - NAV-004/NAV-007: mobile sidebar overlay closes on outside click and link click
  - NAV-005: header notifications badge reflects unread count
- e2e/high/navigation.spec.ts (1 tests)
  - sidebar routes work and logout returns to login

## 5. Notes / Limitations

- Lint status: the repo currently reports many ESLint warnings; these do not block Playwright execution.
- WhatsApp notifications are implemented as a sandbox/outbox integration to keep the feature optional and testable without external providers.
- If you later add real provider integration, consider adding unit/integration tests around message formatting/retries and provider error handling.

			```
		</details>
Al final del ciclo de desarrollo el cliente otorgó sus credenciales de dropbox para que los directorios se almacenasen en su propio dropbox, por lo que se migró de mi cuenta personal a la suya
<empty-block/>
</content>
</page>