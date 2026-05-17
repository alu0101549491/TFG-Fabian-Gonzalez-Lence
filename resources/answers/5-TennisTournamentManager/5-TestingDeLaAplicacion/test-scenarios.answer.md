# Respuesta

## Answer 1 (Test Scenarios)

## Answer 1 (Test Scenarios) {toggle="true"}
		```markdown
# E2E TEST SCENARIOS
## Tennis Tournament Manager (TENNIS)

**Document Version:** 1.0  
**Created:** April 20, 2026  
**Author:** QA Engineer Agent  
**Testing Framework:** Playwright  
**Target Coverage:** 92% of reachable user interactions in the current frontend  

---

## TABLE OF CONTENTS

1. [Test Environment Setup](#1-test-environment-setup)
2. [User Roles and Test Accounts](#2-user-roles-and-test-accounts)
3. [Use Case to Scenario Mapping](#3-use-case-to-scenario-mapping)
4. [Test Scenarios by Module](#4-test-scenarios-by-module)
   - 4.01 [Authentication Module](#401-authentication-module)
   - 4.02 [Dashboard Module](#402-dashboard-module)
   - 4.03 [Tournament Management Module](#403-tournament-management-module)
   - 4.04 [Participant Registration Module](#404-participant-registration-module)
   - 4.05 [Draw Management Module](#405-draw-management-module)
   - 4.06 [Match and Result Management Module](#406-match-and-result-management-module)
   - 4.07 [Order of Play Module](#407-order-of-play-module)
   - 4.08 [Standings and Statistics Module](#408-standings-and-statistics-module)
   - 4.09 [Announcement Module](#409-announcement-module)
   - 4.10 [Notification Module](#410-notification-module)
   - 4.11 [Privacy and Profile Module](#411-privacy-and-profile-module)
   - 4.12 [Global Ranking Module](#412-global-ranking-module)
   - 4.13 [Export and Documents Module](#413-export-and-documents-module)
   - 4.14 [Incident Management Module](#414-incident-management-module)
   - 4.15 [Communication Module](#415-communication-module)
   - 4.16 [System Management Module](#416-system-management-module-sysadmin)
5. [Cross-Cutting Scenarios](#5-cross-cutting-scenarios)
6. [Edge Cases and Error Scenarios](#6-edge-cases-and-error-scenarios)
7. [Accessibility Scenarios](#7-accessibility-scenarios)
8. [Responsive Design Scenarios](#8-responsive-design-scenarios)
9. [Test Data Requirements](#9-test-data-requirements)
10. [Execution Priority Matrix](#10-execution-priority-matrix)
11. [Document Summary](#11-document-summary)

---

## 1. Test Environment Setup

### 1.1 Current Repository Playwright Baseline

The repository already contains a working Playwright configuration. The current baseline is the source of truth for pathing and browser launch behavior:

```typescript
import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ??
      'http://localhost:4200/5-TennisTournamentManager/',
    trace: 'on-first-retry',
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'firefox', use: {...devices['Desktop Firefox']}},
    {name: 'webkit', use: {...devices['Desktop Safari']}},
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4200/5-TennisTournamentManager/',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 1.2 Recommended Expansion For This Plan

- Keep the current `baseURL` with the `/5-TennisTournamentManager/` subpath.
- Add dedicated responsive projects for `Pixel 5`, `iPhone 12`, and `iPad` to execute Section 8.
- Preserve relative navigation with `page.goto('/')`, `page.goto('/login')`, etc.
- Use API seeding where possible because many admin workflows depend on tournament state transitions and existing participants.

### 1.3 Verified Frontend Surface

#### Public routes

- `/home`
- `/login`
- `/register`
- `/tournaments`
- `/tournaments/:id`
- `/tournaments/:id/statistics`
- `/brackets/:id`
- `/matches`
- `/matches/:id`
- `/order-of-play/:id`
- `/standings/:id`
- `/ranking` -> redirect to `/rankings`
- `/rankings`
- `/announcements`
- `/statistics`
- `/users/:id`

#### Authenticated routes

- `/my-matches`
- `/notifications`
- `/profile`
- `/privacy`
- `/notification-preferences`
- `/my-registrations`
- `/my-invitations`

#### Admin routes

- `/tournaments/create`
- `/tournaments/:id/edit`
- `/tournaments/:tournamentId/phases`
- `/announcements/create`
- `/announcements/edit/:id`
- `/admin`
- `/admin/disputed-matches`

#### System admin only routes

- `/admin/users`

#### Expected by requirements but not implemented as routes

- `/admin/system` `[PENDING IMPLEMENTATION]`
- `/admin/backup` `[PENDING IMPLEMENTATION]`
- `/admin/monitoring` `[PENDING IMPLEMENTATION]`
- Dedicated chat route `[PENDING IMPLEMENTATION]`
- Dedicated backup/restore UI `[PENDING IMPLEMENTATION]`
- Dedicated external ranking import UI `[PENDING IMPLEMENTATION]`

### 1.4 Selector Strategy

No `data-testid` attributes were found in the presentation layer. Selector strategy must rely on stable DOM primitives.

| Selector Type | Examples | Guidance |
|---|---|---|
| Form IDs | `#email`, `#password`, `#name`, `#location`, `#startDate`, `#gdprConsent` | Preferred for forms |
| Button text | `Login`, `Create Tournament`, `Generate Schedule`, `Mark All as Read` | Preferred for action assertions |
| Route links | `routerLink="/profile"`, `routerLink="/notifications"` | Good for shell navigation |
| Semantic classes | `.hero-title`, `.notification-card`, `.modal-overlay`, `.match-card` | Good fallback selectors |
| Dialog structure | `.modal-content`, `.modal-footer`, `.close-btn` | Required for match, dispute, and announcement modals |

### 1.5 Known Constraints And Risks

- The app shell uses a sticky header plus dropdown user menu, not a sidebar. Sidebar persistence scenarios must be marked `[PENDING IMPLEMENTATION]`.
- Advanced export services exist in TypeScript services, but some exports are not surfaced by the currently active tournament detail template.
- PWA support exists through `public/sw.js`, but offline reliability has known implementation risk and must be tested as partial behavior, not assumed production-ready.
- WebSocket-based notification refresh exists; broad real-time synchronization for all modules remains partial.
- Password recovery, login lockout, JWT refresh, backup/restore UI, chat UI, and system monitoring UI are not present in the verified frontend.

---

## 2. User Roles and Test Accounts

### 2.1 Primary Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| System Admin | sysadmin@tennis-test.com | SysAdmin123! | Full platform control |
| Tournament Admin 1 | admin1@tennis-test.com | TAdmin123! | Own tournaments |
| Tournament Admin 2 | admin2@tennis-test.com | TAdmin123! | Own tournaments |
| Participant 1 | player1@tennis-test.com | Player123! | Registrations, results, profile |
| Participant 2 | player2@tennis-test.com | Player123! | Registrations, results, profile |
| Participant 3 | player3@tennis-test.com | Player123! | Registrations, results, profile |
| Public | none | none | Read-only public access |

### 2.2 Additional Fixture Players For Data Density

| Role | Email | Password | Purpose |
|---|---|---|---|
| Participant 4 | player4@tennis-test.com | Player123! | Doubles and standings coverage |
| Participant 5 | player5@tennis-test.com | Player123! | Round Robin tiebreak coverage |
| Participant 6 | player6@tennis-test.com | Player123! | Waiting list and lucky loser coverage |
| Participant 7 | player7@tennis-test.com | Player123! | Ranking and export coverage |
| Participant 8 | player8@tennis-test.com | Player123! | Order of play and notifications coverage |

### 2.3 Test Tournaments

| ID | Name | Admin | Status | Draw Type | Purpose |
|---|---|---|---|---|---|
| T-001 | Open Registration Tournament | admin1 | REGISTRATION_OPEN | SINGLE_ELIMINATION | Registration flow |
| T-002 | Active Knockout Tournament | admin1 | IN_PROGRESS | SINGLE_ELIMINATION | Match, disputes, order of play |
| T-003 | Active Round Robin Tournament | admin2 | IN_PROGRESS | ROUND_ROBIN | Standings and tiebreaks |
| T-004 | Finalized Tournament | admin1 | FINALIZED | SINGLE_ELIMINATION | Read-only, exports, rankings |
| T-005 | Draft Match Play Tournament | admin2 | DRAFT | MATCH_PLAY | Configuration and phase linking |

### 2.4 State Fixtures Required

- At least one bracket with no approved participants.
- At least one bracket with approved participants but not published.
- At least one published bracket with completed matches.
- At least one disputed result.
- At least one pending partner invitation.
- At least one pending tournament registration and one alternate registration.
- At least one notification per major type.

---

## 3. Use Case to Scenario Mapping

Legend:

- `Implemented` = verified route and UI surface exist.
- `Partial` = route or service exists but the complete workflow is not fully surfaced or validated in UI.
- `[PENDING IMPLEMENTATION]` = no verified route/component for the use case.

### 3.1 User Management

- `Manage Users` -> `/admin/users` -> Implemented -> `SYS-002`
- `Create User` -> `/admin/users` create modal -> Implemented -> `SYS-002`
- `Edit User` -> `/admin/users` edit modal -> Implemented -> `SYS-002`
- `Delete User` -> `/admin/users` delete action -> Implemented -> `SYS-002`
- `Assign Roles` -> `/admin/users` role select -> Implemented -> `SYS-002`
- `Manage Permissions` -> `/admin/users` role and active state -> Partial -> `SYS-002`, `ERR-002`

### 3.2 Tournament Management

- `Create Tournament` -> `/tournaments/create` -> Implemented -> `TOURN-001`, `TOURN-002`
- `Configure Tournament` -> `/tournaments/create`, `/tournaments/:id/edit` -> Implemented -> `TOURN-001`, `TOURN-003`
- `Edit Tournament Details` -> `/tournaments/:id/edit` -> Implemented -> `TOURN-003`
- `Assign Multiple Administrators` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `TOURN-008`, `SYS-004`
- `Define Tournament Rules` -> regulations field on create/edit -> Implemented -> `TOURN-002`, `TOURN-003`
- `Customize Visual Identity` -> branding fields on create/edit -> Partial -> `TOURN-002`, `SYS-003`

### 3.3 Registration

- `Register for Tournament` -> `/tournaments/:id` -> Implemented -> `REG-001`, `REG-002`
- `Manage Quotas` -> tournament detail admin registration logic -> Partial -> `REG-002`, `REG-004`, `REG-005`
- `Manage Substitute Lists` -> alternate/lucky loser flows -> Partial -> `REG-005`
- `Withdraw from Tournament` -> `/my-registrations`, tournament detail admin withdrawal -> Implemented -> `REG-006`
- `Assign Reserved Spots` -> acceptance types and seed handling exist, no dedicated UI -> Partial -> `REG-007`
- `Process Registration Payment` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `REG-009`

### 3.4 Bracket Management

- `Generate Bracket` -> tournament detail and bracket pages -> Partial -> `DRAW-001`, `DRAW-002`
- `Modify Bracket` -> regenerate bracket modal -> Partial -> `DRAW-003`, `DRAW-004`
- `Link Tournament Phases` -> `/tournaments/:tournamentId/phases` -> Implemented -> `DRAW-005`
- `Set Seeds and Byes` -> service-backed behavior, no dedicated admin seeding screen -> Partial -> `DRAW-006`
- `Balance Round Robin Groups` -> service-backed behavior, no dedicated preview UI -> Partial -> `DRAW-006`
- `Migrate Results to New Bracket` -> regenerate with preserve-results option -> Partial -> `DRAW-004`

### 3.5 Match Management

- `Enter Result as Participant` -> `/my-matches` result modal -> Implemented -> `MATCH-003`
- `Enter Result as Administrator` -> `/matches/:id` score modal -> Implemented -> `MATCH-009`
- `Confirm Match Result` -> `/my-matches` confirm button -> Implemented -> `MATCH-004`
- `Dispute Match Result` -> `/my-matches` dispute button -> Implemented -> `MATCH-005`
- `Suspend Match` -> `/matches/:id` -> Implemented -> `MATCH-007`
- `Resume Match` -> `/matches/:id` -> Implemented -> `MATCH-007`
- `Cancel Match` -> `/matches/:id` and dispute annulment -> Implemented -> `MATCH-008`, `INC-003`
- `Record Material Responsible` -> ball provider field in scheduling modal -> Implemented -> `MATCH-001`, `MATCH-010`

### 3.6 Order Of Play

- `Publish Order of Play` -> `/order-of-play/:id` schedule generation -> Partial -> `OOP-001`, `OOP-005`
- `Update Order of Play` -> regenerate schedule and match re-scheduling -> Partial -> `OOP-002`, `OOP-004`
- `Assign Courts and Schedules` -> `/order-of-play/:id`, `/matches/:id` -> Implemented -> `OOP-001`, `MATCH-001`
- `Reschedule Match` -> `/matches/:id` schedule modal -> Implemented -> `OOP-004`
- `Manage Court Availability` -> `/order-of-play/:id` court CRUD -> Implemented -> `OOP-001`

### 3.7 Visualization

- `View Brackets` -> `/brackets/:id` -> Implemented -> `DRAW-007`, `RESP-003`
- `View Matches` -> `/matches`, `/matches/:id` -> Implemented -> `MATCH-001`, `MATCH-008`
- `View Classification` -> `/standings/:id` -> Implemented -> `STAND-001`
- `View Points Classification` -> standings and ranking views -> Partial -> `STAND-001`, `RANK-001`
- `View Ratio Classification` -> no separate ratio UI -> Partial -> `STAND-006`
- `View Order of Play` -> `/order-of-play/:id` -> Implemented -> `OOP-003`, `OOP-005`
- `View Phase Links` -> `/tournaments/:tournamentId/phases` -> Implemented -> `DRAW-005`
- `View Live Results` -> `/matches`, notification bell, match list -> Partial -> `DASH-004`, `CROSS-005`

### 3.8 Statistics

- `View Participant Statistics` -> `/statistics` -> Implemented -> `STAND-005`
- `View Tournament Statistics` -> `/tournaments/:id/statistics` -> Implemented -> `STAND-004`
- `View Result History` -> `/statistics`, `/my-matches` -> Partial -> `STAND-005`
- `View Matchup History` -> no dedicated head-to-head UI -> `[PENDING IMPLEMENTATION]` -> `STAND-007`
- `Export Statistics` -> tournament statistics export buttons -> Implemented -> `STAND-004`, `EXP-002`

### 3.9 Ranking

- `Maintain Global Ranking` -> ranking services and read-only UI -> Partial -> `RANK-001`, `RANK-003`
- `Calculate Ranking` -> service-backed after results -> Partial -> `RANK-003`
- `Import External Ranking` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `RANK-004`, `SYS-004`
- `View Global Ranking` -> `/rankings` -> Implemented -> `RANK-001`, `RANK-002`

### 3.10 Notifications

- `Receive Notification` -> bell and inbox -> Implemented -> `NOTIF-001`, `NOTIF-002`
- `Send Notification` -> service-backed, observed via inbox -> Partial -> `NOTIF-005`, `NOTIF-006`
- `Configure Notification Preferences` -> `/notification-preferences` -> Implemented -> `NOTIF-004`
- `Notify Registration Status` -> registration approval/alternate flows -> Partial -> `REG-004`, `NOTIF-005`
- `Notify Match Schedule` -> order of play and scheduling flows -> Partial -> `OOP-006`, `NOTIF-005`
- `Notify Result` -> pending result / dispute flows -> Implemented -> `MATCH-004`, `MATCH-005`, `NOTIF-005`
- `Notify Order of Play Change` -> schedule regeneration and reassignments -> Partial -> `OOP-006`, `NOTIF-005`

### 3.11 Announcements

- `Create Announcement` -> `/announcements/create` -> Implemented -> `ANN-001`, `ANN-002`
- `Publish Announcement` -> create/edit pages and list display -> Implemented -> `ANN-001`, `ANN-005`
- `Manage Tags` -> create/edit plus filter chips -> Implemented -> `ANN-003`
- `View Announcements` -> `/announcements` -> Implemented -> `ANN-003`, `ANN-004`, `ANN-006`
- `Schedule Announcement` -> create/edit fields and modal metadata -> Implemented -> `ANN-002`

### 3.12 Privacy And Security

- `Configure Privacy Settings` -> `/privacy` -> Implemented -> `PRIV-002`
- `Manage Data Visibility` -> `/privacy`, `/users/:id` -> Partial -> `PRIV-003`, `PRIV-005`
- `Control Access` -> route guards -> Implemented -> `AUTH-004`, `ERR-002`
- `Log Activity` -> service/backend concern, not visible in UI -> Partial -> `AUTH-001`, `SYS-001`
- `Monitor Unauthorized Access` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `ERR-002`, `SYS-003`

### 3.13 Communication

- `Chat with Participants` -> no chat route; only partner invitation messages exist -> Partial -> `COMM-001`, `COMM-003`
- `Moderate Chat` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `COMM-003`
- `Send Group Message` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `COMM-003`

### 3.14 Export And Documents

- `Export Results` -> service exists; limited active UI surface -> Partial -> `EXP-002`, `EXP-003`
- `Export Brackets` -> bracket PDF export button -> Implemented -> `EXP-001`
- `Print Brackets` -> browser print from exported PDF -> Partial -> `EXP-001`
- `Generate Documents` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `EXP-004`
- `Generate Certificates` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `EXP-004`

### 3.15 Incident Management

- `Manage Match Incidents` -> `/admin/disputed-matches` -> Partial -> `INC-001`, `INC-002`
- `Apply Sanctions` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `INC-004`
- `Replay Match` -> no verified UI -> `[PENDING IMPLEMENTATION]` -> `INC-004`
- `Record Dispute` -> `/my-matches` dispute modal -> Implemented -> `MATCH-005`, `INC-001`

### 3.16 System Management And System Operations

- `Create Backup` -> no verified route -> `[PENDING IMPLEMENTATION]` -> `SYS-003`
- `Restore Backup` -> no verified route -> `[PENDING IMPLEMENTATION]` -> `SYS-003`
- `Monitor Performance` -> no verified route -> `[PENDING IMPLEMENTATION]` -> `SYS-003`
- `Manage Scalability` -> no verified route -> `[PENDING IMPLEMENTATION]` -> `SYS-003`
- `Integrate External Systems` -> export and ranking services only -> Partial -> `EXP-003`, `SYS-004`
- `Update UI` -> all live pages -> Implemented -> `CROSS-002`, `CROSS-005`
- `Validate Data` -> form validation across auth, tournament, results -> Implemented -> `AUTH-003`, `TOURN-001`, `MATCH-003`
- `Calculate Score` -> standings/statistics services -> Partial -> `STAND-001`, `STAND-004`
- `Update Classification` -> standings and rankings after results -> Partial -> `MATCH-004`, `RANK-003`
- `Sync Data` -> notifications/WebSocket/offline cache -> Partial -> `NOTIF-006`, `CROSS-004`, `CROSS-005`
- `Process Tie-Breaks` -> service-backed, limited explicit UI evidence -> Partial -> `STAND-006`
- `Cache Data for Offline` -> PWA service worker -> Partial -> `CROSS-004`

---

## 4. Test Scenarios by Module

## 4.01 Authentication Module

### AUTH-001 Successful login for authenticated roles

- **Priority:** 🔴 Critical
- **Use Case reference:** ControlAccess, LogActivity
- **Actor:** System Administrator, Tournament Administrator, Registered Participant
- **Implementation status:** Implemented
- **Preconditions:** Valid account exists; user is logged out.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/login` and fill `#email` and `#password` with valid credentials for each role. | Form accepts input without validation errors. |
| 2 | Click `Login`. | JWT and user payload are stored; app redirects to `/home`. |
| 3 | Verify header avatar, notification bell, and role-specific dashboard controls. | Role-appropriate home/dashboard content is displayed. |

- **Postconditions:** Authenticated session exists in local storage.
- **Test Data:** `sysadmin@tennis-test.com`, `admin1@tennis-test.com`, `player1@tennis-test.com`

### AUTH-002 Account registration with GDPR consent

- **Priority:** 🟠 High
- **Use Case reference:** ControlAccess, ValidateData
- **Actor:** Registered Participant
- **Implementation status:** Implemented
- **Preconditions:** Email and username are unused.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/register` and complete all required fields including `#gdprConsent`. | Validation remains clear for valid inputs. |
| 2 | Submit `Create Account`. | Success feedback is shown and account is created. |
| 3 | Log in with the new account. | User reaches `/home` and sees participant shell. |

- **Postconditions:** New player account exists.
- **Test Data:** Unique username/email suffix per run.

### AUTH-003 Invalid credentials and form validation

- **Priority:** 🔴 Critical
- **Use Case reference:** ValidateData
- **Actor:** Any authenticated role candidate
- **Implementation status:** Implemented
- **Preconditions:** Login page is open.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit empty form, malformed email, and short password combinations. | Inline validation errors appear. |
| 2 | Submit valid email with wrong password and unknown email with valid password format. | Error banner is shown; session is not created. |
| 3 | Reload and verify route stays on `/login`. | Protected state is unchanged. |

- **Postconditions:** User remains logged out.
- **Test Data:** `unknown@tennis-test.com`, incorrect passwords.

### AUTH-004 Direct protected route access without authentication

- **Priority:** 🔴 Critical
- **Use Case reference:** ControlAccess
- **Actor:** Public
- **Implementation status:** Implemented
- **Preconditions:** Browser context is logged out.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate directly to `/profile`, `/notifications`, `/my-matches`, `/admin`, `/admin/users`. | Auth guard or role guard intercepts access. |
| 2 | Observe redirect target. | Auth-only routes redirect to `/login`; unauthorized admin routes redirect to `/tournaments` after login. |

- **Postconditions:** No privileged content is visible.
- **Test Data:** Empty storage state.

### AUTH-005 Logout and protected route invalidation

- **Priority:** 🔴 Critical
- **Use Case reference:** ControlAccess
- **Actor:** Authenticated user
- **Implementation status:** Implemented
- **Preconditions:** User is authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open header dropdown and click `Logout`. | Token and user storage are cleared; app redirects to `/login`. |
| 2 | Use browser back navigation to return to a protected page. | Guard blocks access and returns user to login flow. |

- **Postconditions:** Logged-out session.
- **Test Data:** Any authenticated role.

### AUTH-006 Session inactivity auto-logout after 30 minutes

- **Priority:** 🟠 High
- **Use Case reference:** ControlAccess
- **Actor:** Authenticated user
- **Implementation status:** Implemented
- **Preconditions:** Authenticated session exists; clock can be manipulated or local storage timestamp overridden.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Log in and set `ttm_last_activity` to older than 30 minutes. | Session remains temporarily active until periodic check. |
| 2 | Trigger inactivity check or wait for check interval under controlled clock. | Token is removed and app redirects to `/login?reason=session_expired`. |

- **Postconditions:** Session expired state is enforced.
- **Test Data:** Any authenticated role.

### AUTH-007 Password recovery flow `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ControlAccess
- **Actor:** Public, Registered Participant
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** None.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Inspect `/login` for forgot-password entry point. | No recovery UI is available in the verified frontend. |
| 2 | Mark feature gap and block any automated E2E until route/API contract is added. | Scenario remains pending. |

- **Postconditions:** Gap recorded.
- **Test Data:** Existing user email.

### AUTH-008 Temporary lockout after five failed logins `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ControlAccess, MonitorUnauthorizedAccess
- **Actor:** Public
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** Existing account known.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit invalid password five consecutive times. | Frontend does not show lockout-specific UI in current implementation. |
| 2 | Verify whether backend returns dedicated lockout status or message. | Scenario remains pending until contract is confirmed. |

- **Postconditions:** Requirement tracked as security gap.
- **Test Data:** `player1@tennis-test.com`

### AUTH-009 JWT refresh flow `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ControlAccess, SyncData
- **Actor:** Authenticated user
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** Authenticated session and token nearing expiry.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Observe network activity around token expiry. | No verified refresh-token endpoint or client refresh flow is present in the frontend. |
| 2 | Mark scenario as blocked until refresh contract is implemented. | Pending status retained. |

- **Postconditions:** None.
- **Test Data:** Any authenticated role.

## 4.02 Dashboard Module

### DASH-001 Guest landing page and CTA navigation

- **Priority:** 🟠 High
- **Use Case reference:** ViewBrackets, ViewMatches, ViewClassification
- **Actor:** Public
- **Implementation status:** Implemented
- **Preconditions:** Logged out.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/home`. | Marketing landing page is shown instead of admin dashboard. |
| 2 | Click `Browse Tournaments`, `Create Account`, and `Sign In`. | Each CTA routes to the expected page. |
| 3 | Verify public feature cards for brackets, standings, and results. | Public discovery routes are visible and clickable. |

- **Postconditions:** None.
- **Test Data:** Public context.

### DASH-002 Authenticated dashboard stats and cards by role

- **Priority:** 🔴 Critical
- **Use Case reference:** ViewTournamentStats, ReceiveNotification
- **Actor:** System Administrator, Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Admin account is authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/home` as system admin and tournament admin. | Home renders `app-dashboard`. |
| 2 | Verify role-specific headings and cards. | System admin sees system tools; tournament admin sees tournament tools. |
| 3 | Check recent tournaments table. | Recent tournaments and statuses are populated. |

- **Postconditions:** None.
- **Test Data:** `sysadmin@tennis-test.com`, `admin1@tennis-test.com`

### DASH-003 Quick navigation and notification bell access

- **Priority:** 🟠 High
- **Use Case reference:** ReceiveNotification, ViewAnnouncements
- **Actor:** Any authenticated role
- **Implementation status:** Implemented
- **Preconditions:** Authenticated session with notifications.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open header dropdown and notification bell. | User menu and notification menu open correctly. |
| 2 | Navigate to `My Registrations`, `Partner Invitations`, `Profile`, and `Notifications`. | Links route to the correct pages. |
| 3 | Use bell dropdown `View all notifications ->`. | App lands on `/notifications`. |

- **Postconditions:** None.
- **Test Data:** Any authenticated role with unread notifications.

### DASH-004 Real-time dashboard-adjacent refresh

- **Priority:** 🟡 Medium
- **Use Case reference:** ReceiveNotification, ViewLiveResults
- **Actor:** Authenticated user
- **Implementation status:** Partial
- **Preconditions:** Active WebSocket connection and a server-generated notification event.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Keep `/home` open with header bell visible. | Existing unread count is shown. |
| 2 | Trigger a notification via API or secondary actor. | Bell badge increments without full page reload. |

- **Postconditions:** Notification list is refreshed.
- **Test Data:** Notification event payload from backend seed/action.

## 4.03 Tournament Management Module

### TOURN-001 Create tournament with required fields and date validation

- **Priority:** 🔴 Critical
- **Use Case reference:** CreateTournament, ValidateData
- **Actor:** System Administrator, Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Admin account authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/create` and submit with missing required fields. | Required validations appear. |
| 2 | Enter invalid date combinations such as end date before start date. | Inline date error is displayed and submit remains blocked. |
| 3 | Submit valid basic data. | Tournament is created and user is redirected to the new detail view or list. |

- **Postconditions:** New tournament record exists.
- **Test Data:** New tournament name, location, dates.

### TOURN-002 Create tournament with branding, rules, and ranking system

- **Priority:** 🟠 High
- **Use Case reference:** ConfigureTournament, DefineTournamentRules, CustomizeVisuals
- **Actor:** Admin
- **Implementation status:** Partial
- **Preconditions:** Admin authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Fill branding fields (`#primaryColor`, `#secondaryColor`, `#logoUrl`) and regulations text. | Preview updates and form retains values. |
| 2 | Select tournament type, facility type, surface, ranking system, fee, and currency. | Values are stored correctly. |
| 3 | Submit and reopen edit page. | Branding and regulations persist. |

- **Postconditions:** Tournament is configured with visual identity metadata.
- **Test Data:** Hex color values, URL, regulations text.

### TOURN-003 Edit tournament details and allowed status transitions

- **Priority:** 🔴 Critical
- **Use Case reference:** EditTournamentDetails, ConfigureTournament
- **Actor:** Admin
- **Implementation status:** Implemented
- **Preconditions:** Existing tournament in `DRAFT` or `REGISTRATION_OPEN`.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/:id/edit` and change editable fields. | Form is pre-populated. |
| 2 | Change status to a valid next state. | Save succeeds and status is updated on detail page. |
| 3 | Attempt an invalid business transition via direct form manipulation or API interception. | Save is rejected by backend or corrected by UI constraints. |

- **Postconditions:** Tournament reflects latest valid state.
- **Test Data:** T-005, T-001.

### TOURN-004 Unauthorized edit access blocked

- **Priority:** 🔴 Critical
- **Use Case reference:** ControlAccess
- **Actor:** Participant, Public
- **Implementation status:** Implemented
- **Preconditions:** Tournament exists; browser is logged out or logged in as participant.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/tournaments/:id/edit` as public and participant. | Access is denied by guard. |
| 2 | Attempt `/tournaments/create` and `/tournaments/:tournamentId/phases`. | Non-admin cannot reach admin pages. |

- **Postconditions:** User is redirected to `/login` or `/tournaments` depending on auth state.
- **Test Data:** `player1@tennis-test.com`

### TOURN-005 Registration gating on tournament detail

- **Priority:** 🟠 High
- **Use Case reference:** RegisterParticipant, ValidateData
- **Actor:** Participant
- **Implementation status:** Implemented
- **Preconditions:** User profile may be complete or incomplete; tournament has categories.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/:id` as a participant with missing `idDocument`. | Profile incomplete warning appears; register button is disabled. |
| 2 | Complete profile and refresh tournament detail. | Category radio buttons remain available and register button enables. |
| 3 | Click `Register Now`. | Registration request is created. |

- **Postconditions:** Registration is created or blocked for data-quality reasons.
- **Test Data:** T-001, participant profile with and without `idDocument`.

### TOURN-006 Multiple simultaneous tournaments stay independent

- **Priority:** 🟠 High
- **Use Case reference:** CreateTournament, ViewTournamentStats
- **Actor:** Admin, Public
- **Implementation status:** Implemented
- **Preconditions:** At least three tournaments exist in different states.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Use `/tournaments` filters for status, location, and surface. | List updates without polluting unrelated tournaments. |
| 2 | Open T-001 and T-003 in separate tabs. | Each detail page displays its own categories, participants, and actions. |

- **Postconditions:** None.
- **Test Data:** T-001, T-002, T-003.

### TOURN-007 Finalization with pending matches blocked

- **Priority:** 🟠 High
- **Use Case reference:** ConfigureTournament, UpdateClassification
- **Actor:** Tournament Administrator
- **Implementation status:** Partial
- **Preconditions:** Tournament has uncompleted matches.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Attempt to transition tournament from `IN_PROGRESS` to `FINALIZED`. | Backend or UI blocks finalization while active matches remain. |
| 2 | Complete remaining matches and retry. | Finalization becomes available. |

- **Postconditions:** Tournament stays consistent with match state.
- **Test Data:** T-002.

### TOURN-008 Multiple administrators assignment `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** AssignAdministrators
- **Actor:** System Administrator
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** System admin authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search verified routes and tournament detail actions for admin assignment UI. | No dedicated multi-admin assignment workflow is present. |
| 2 | Hold scenario until route or user-tournament assignment UI exists. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** admin1, admin2.

## 4.04 Participant Registration Module

### REG-001 Self-registration when quota is available

- **Priority:** 🔴 Critical
- **Use Case reference:** RegisterParticipant, ManageQuotas
- **Actor:** Participant
- **Implementation status:** Implemented
- **Preconditions:** Tournament registration is open; category has slots; profile is complete.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open T-001, select a category, and click `Register Now`. | Registration request is submitted successfully. |
| 2 | Verify `/my-registrations`. | New entry appears with expected initial status. |

- **Postconditions:** Participant has pending or accepted registration.
- **Test Data:** `player1@tennis-test.com`, T-001.

### REG-002 Self-registration when quota is full -> alternate

- **Priority:** 🟠 High
- **Use Case reference:** ManageQuotas, ManageSubstitutes
- **Actor:** Participant
- **Implementation status:** Partial
- **Preconditions:** Category is full.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Register for a full category. | Success alert indicates alternate/waiting-list placement. |
| 2 | Check `/my-registrations`. | Entry shows alternate-specific badge/message. |

- **Postconditions:** Alternate registration exists.
- **Test Data:** Full category in T-001.

### REG-003 Doubles partner invitation and acceptance

- **Priority:** 🟠 High
- **Use Case reference:** RegisterParticipant, ProcessPayment, ChatWithParticipants
- **Actor:** Participant inviter, Participant invitee
- **Implementation status:** Partial
- **Preconditions:** Doubles tournament/category exists; both players authenticated in separate contexts.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Inviter opens tournament detail and sends a partner invitation. | Invitation success feedback appears. |
| 2 | Invitee opens `/my-invitations` and clicks `Accept`. | Invitation status becomes accepted. |
| 3 | Verify both players see accepted invitation or pending admin approval. | Pair registration state is visible to both users. |

- **Postconditions:** Doubles pair registration is created or pending approval.
- **Test Data:** T-005 doubles category, player1 and player2.

### REG-004 Admin review of pending registrations, including bulk actions

- **Priority:** 🔴 Critical
- **Use Case reference:** ManageQuotas, NotifyRegistration
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Tournament has pending registrations.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open tournament detail as admin and review participant list. | Pending entries are visible. |
| 2 | Approve, reject, and bulk-approve or bulk-reject registrations. | Status changes succeed and related feedback appears. |
| 3 | Verify participant-side notifications and `/my-registrations`. | New statuses are reflected. |

- **Postconditions:** Pending queue is reduced.
- **Test Data:** T-001 with multiple pending players.

### REG-005 Alternate to lucky loser promotion and withdrawal cascade

- **Priority:** 🟠 High
- **Use Case reference:** ManageSubstitutes, WithdrawParticipant
- **Actor:** Tournament Administrator
- **Implementation status:** Partial
- **Preconditions:** Tournament has alternate registrations and at least one withdrawal.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Withdraw an accepted player using admin tournament detail or player self-service. | Withdrawal succeeds. |
| 2 | Promote an alternate with the `Lucky Loser` path. | Acceptance type changes from `ALTERNATE` to `LUCKY_LOSER`. |
| 3 | Verify participant message in `/my-registrations`. | Lucky loser badge/message is shown. |

- **Postconditions:** Draw eligibility is updated.
- **Test Data:** T-001 or T-002 with alternates.

### REG-006 Participant withdrawal before or during tournament

- **Priority:** 🟠 High
- **Use Case reference:** WithdrawParticipant
- **Actor:** Participant, Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Player has active registration.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/my-registrations` and click `Withdraw`. | Confirmation flow completes and state becomes withdrawn. |
| 2 | For in-progress tournaments, verify admin view or schedule impact. | Withdrawal is reflected in tournament detail and may trigger walkover or promotion logic. |

- **Postconditions:** Registration is withdrawn.
- **Test Data:** T-001, T-002.

### REG-007 Acceptance types, reserved spots, and seed display

- **Priority:** 🟡 Medium
- **Use Case reference:** AssignReservedSpots, SetSeeds
- **Actor:** Admin, Participant
- **Implementation status:** Partial
- **Preconditions:** Seed numbers and acceptance types exist in data.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Inspect `/my-registrations` and tournament participant tables for seeded and special entries. | Seed numbers and acceptance-type-specific badges are shown where available. |
| 2 | Validate DA, WC, ALT, LL records from seeded data. | UI reflects seeded fixture values without corruption. |

- **Postconditions:** None.
- **Test Data:** Registrations with DA, WC, ALT, LL fixtures.

### REG-008 Duplicate registration and withdrawn re-registration handling

- **Priority:** 🟠 High
- **Use Case reference:** RegisterParticipant, ValidateData
- **Actor:** Participant, Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Existing registration already exists for user in target category.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Attempt a second registration for the same player and category. | UI/back-end blocks duplicate active registration. |
| 2 | Retry after a prior `WITHDRAWN` state. | Re-registration is allowed and returns to pending review. |

- **Postconditions:** Registration integrity preserved.
- **Test Data:** Same participant and same category.

### REG-009 Registration payment flow `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ProcessPayment
- **Actor:** Participant
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** Tournament has registration fee.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Register for a fee-bearing tournament. | Current frontend stores fee fields but exposes no payment checkout UI. |
| 2 | Mark payment scenario as blocked until payment route/component exists. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** Tournament with non-zero `registrationFee`.

## 4.05 Draw Management Module

### DRAW-001 Bracket generation blocked with fewer than two approved participants

- **Priority:** 🔴 Critical
- **Use Case reference:** GenerateBracket, ValidateData
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Tournament has fewer than two approved participants.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Attempt bracket generation from tournament workflow. | UI warns that at least two accepted participants are required. |
| 2 | Approve enough registrations and retry. | Block is removed. |

- **Postconditions:** Bracket remains absent until minimum conditions are met.
- **Test Data:** T-005 draft tournament.

### DRAW-002 Publish draft bracket

- **Priority:** 🔴 Critical
- **Use Case reference:** GenerateBracket, PublishAnnouncement
- **Actor:** Tournament Administrator
- **Implementation status:** Partial
- **Preconditions:** Unpublished bracket exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/brackets/:id` for a draft bracket. | Management bar shows `Publish Bracket`. |
| 2 | Click `Publish Bracket`. | Bracket becomes published and status badge updates. |
| 3 | Reopen as public user. | Public view can read bracket without admin actions. |

- **Postconditions:** Bracket is published.
- **Test Data:** Draft bracket for T-005.

### DRAW-003 Regenerate bracket without preserving results

- **Priority:** 🟠 High
- **Use Case reference:** ModifyBracket, ValidateData
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Existing bracket with matches.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click `Regenerate Bracket` in bracket view. | Warning modal explains destructive reset. |
| 2 | Leave preserve-results unchecked and confirm. | Old matches/results are removed and bracket is rebuilt. |

- **Postconditions:** Fresh bracket structure exists.
- **Test Data:** Bracket with seeded participants.

### DRAW-004 Regenerate bracket while preserving compatible results

- **Priority:** 🟠 High
- **Use Case reference:** MigrateResults, ModifyBracket
- **Actor:** Tournament Administrator
- **Implementation status:** Partial
- **Preconditions:** Bracket has completed matches and preserve-results option is available.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open regenerate modal on a started bracket. | Preserve-results checkbox appears. |
| 2 | Enable preserve-results and confirm regeneration. | Compatible completed results survive; incompatible ones are dropped with warning. |

- **Postconditions:** Regenerated bracket keeps valid history.
- **Test Data:** Started bracket in T-002.

### DRAW-005 Phase linking and qualifier advancement

- **Priority:** 🟠 High
- **Use Case reference:** LinkPhases, ViewPhaseLinks
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Tournament has multiple phases.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/:tournamentId/phases`. | Phase management tabs render. |
| 2 | Link phases and advance winners. | Downstream phase receives qualifiers or linked winners. |
| 3 | Verify bracket/standings reflect updated progression. | Linked phases stay consistent. |

- **Postconditions:** Phase linkage persists.
- **Test Data:** Multi-phase tournament fixture.

### DRAW-006 Seeding, byes, Round Robin balance, and Match Play generation

- **Priority:** 🟡 Medium
- **Use Case reference:** SetSeeds, BalanceGroups, GenerateBracket
- **Actor:** Tournament Administrator
- **Implementation status:** Partial
- **Preconditions:** Seeded registrations exist across different bracket types.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Generate fixtures for single elimination, round robin, and match play. | Bracket type metadata matches request. |
| 2 | Inspect first-round placements, byes, and group distributions. | Seeds appear strategically distributed and groups are balanced. |

- **Postconditions:** Generator behavior is validated at UI/data level.
- **Test Data:** T-002, T-003, T-005.

### DRAW-007 Public and participant read-only bracket access

- **Priority:** 🟠 High
- **Use Case reference:** ViewBrackets, ViewMatches
- **Actor:** Public, Registered Participant
- **Implementation status:** Implemented
- **Preconditions:** Published bracket exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/brackets/:id` as public and participant. | Bracket renders with no admin action buttons. |
| 2 | Verify match navigation if exposed. | User can inspect matches without modification controls. |

- **Postconditions:** Read-only access confirmed.
- **Test Data:** Published bracket.

### DRAW-008 Consolation and compass draws `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** LinkPhases, GenerateBracket
- **Actor:** Tournament Administrator
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** None.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search verified UI for simple, multiple, or compass consolation controls. | No dedicated compass/consolation management UI is present. |
| 2 | Keep scenario pending until route/component is introduced. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** None.

## 4.06 Match and Result Management Module

### MATCH-001 Admin schedules a match with court, date, time, and ball provider

- **Priority:** 🔴 Critical
- **Use Case reference:** AssignCourts, RecordMaterialResponsible
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Match exists; tournament has at least one configured court.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/matches/:id` and launch `Schedule Match`. | Schedule modal opens. |
| 2 | Select court, date, time, and ball provider, then submit. | Match detail updates scheduled time, court, and ball provider. |

- **Postconditions:** Match is scheduled.
- **Test Data:** Match in T-002, court fixture.

### MATCH-002 Match status transitions across the 12 ITF states

- **Priority:** 🔴 Critical
- **Use Case reference:** SuspendMatch, ResumeMatch, CancelMatch
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Match exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `Update Match Status` modal. | Available status list is shown. |
| 2 | Drive seeded matches through TBP, IP, SUS, CO, RET, WO, ABN, BYE, NP, CAN, DEF, and DR fixtures. | Badge text and styling match each state. |
| 3 | Attempt invalid jumps where business rules disallow them. | Invalid transition is blocked or rejected. |

- **Postconditions:** State machine integrity preserved.
- **Test Data:** One match per status in seeded set.

### MATCH-003 Participant enters result with set validation

- **Priority:** 🔴 Critical
- **Use Case reference:** EnterResultParticipant, ValidateData
- **Actor:** Registered Participant
- **Implementation status:** Implemented
- **Preconditions:** Player is eligible to report result from `/my-matches`.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `Enter Result` on an eligible match. | Result modal opens with winner and set inputs. |
| 2 | Submit invalid tennis scores, then valid set scores. | Invalid scores are rejected; valid submission succeeds. |
| 3 | Verify pending confirmation card. | Submitted result appears with waiting state. |

- **Postconditions:** Match result is pending confirmation.
- **Test Data:** Eligible player match in T-002 or T-003.

### MATCH-004 Opponent confirms result and standings update

- **Priority:** 🔴 Critical
- **Use Case reference:** ConfirmResult, UpdateClassification
- **Actor:** Registered Participant opponent
- **Implementation status:** Implemented
- **Preconditions:** Pending result exists awaiting opponent confirmation.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/my-matches` as the opponent. | Pending result card shows `Action Required`. |
| 2 | Click `Confirm Result`. | Pending state clears and result becomes final. |
| 3 | Open standings/ranking pages. | Standings and related metrics reflect confirmed result. |

- **Postconditions:** Result is confirmed.
- **Test Data:** Pair of participant accounts with pending result.

### MATCH-005 Opponent disputes result

- **Priority:** 🟠 High
- **Use Case reference:** DisputeResult, RecordDispute
- **Actor:** Registered Participant opponent
- **Implementation status:** Implemented
- **Preconditions:** Pending result exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click `Dispute Result` on pending card and provide reason. | Dispute is submitted. |
| 2 | Verify admin dispute inbox. | Match appears in `/admin/disputed-matches`. |

- **Postconditions:** Result enters disputed workflow.
- **Test Data:** Match with pending result.

### MATCH-006 Admin resolves disputed result

- **Priority:** 🔴 Critical
- **Use Case reference:** EnterResultAdmin, ApplySanctions
- **Actor:** Tournament Administrator, System Administrator
- **Implementation status:** Implemented
- **Preconditions:** Disputed result exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/admin/disputed-matches` and click `Resolve Dispute`. | Resolution modal opens. |
| 2 | Select winner, adjust set scores, add notes, and confirm. | Result is finalized and dispute leaves inbox. |
| 3 | Verify players receive updated state. | Players see resolved match result. |

- **Postconditions:** Dispute resolved.
- **Test Data:** Disputed result fixture.

### MATCH-007 Suspend and resume match from saved score

- **Priority:** 🟠 High
- **Use Case reference:** SuspendMatch, ResumeMatch
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Match is in progress.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click `Suspend Match`. | Match enters `SUSPENDED`. |
| 2 | Later click `Resume Match`. | Match returns to active state and preserved score remains available. |

- **Postconditions:** Match resumes without losing context.
- **Test Data:** In-progress match.

### MATCH-008 Match cancellation and invalid transition enforcement

- **Priority:** 🟠 High
- **Use Case reference:** CancelMatch
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Schedulable or active match exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/matches/:id` and cancel the match. | Status becomes `CANCELLED`. |
| 2 | Attempt to cancel again or resume the cancelled match. | Buttons are disabled or action is rejected. |

- **Postconditions:** Match remains cancelled.
- **Test Data:** Active match fixture.

### MATCH-009 Admin direct score entry without participant confirmation

- **Priority:** 🟠 High
- **Use Case reference:** EnterResultAdmin
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Match exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Use `Record Scores` from `/matches/:id` as admin. | Score modal opens without participant-only restrictions. |
| 2 | Submit winner and set data. | Result is stored immediately. |

- **Postconditions:** Match result is updated by admin.
- **Test Data:** Admin-owned tournament match.

### MATCH-010 Player comments and ball provider persistence

- **Priority:** 🟡 Medium
- **Use Case reference:** RecordMaterialResponsible, DisputeResult
- **Actor:** Participant, Tournament Administrator
- **Implementation status:** Partial
- **Preconditions:** Match supports schedule entry and dispute notes.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Save ball provider during scheduling. | Match info card shows ball provider. |
| 2 | Submit dispute with optional notes. | Dispute comments appear in disputed review card. |

- **Postconditions:** Supplemental metadata is visible.
- **Test Data:** Scheduled and disputed matches.

## 4.07 Order of Play Module

### OOP-001 Admin court CRUD and automatic schedule generation

- **Priority:** 🔴 Critical
- **Use Case reference:** PublishOrderOfPlay, AssignCourts, ManageCourtAvailability
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Admin owns tournament with unscheduled matches.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/order-of-play/:id` as admin and add one or more courts. | Court list updates. |
| 2 | Fill schedule generator parameters and click `Generate Schedule`. | Matches receive schedule slots. |
| 3 | Confirm scheduled matches appear in order view. | Daily schedule renders across courts. |

- **Postconditions:** Order of play exists.
- **Test Data:** T-002 or T-003.

### OOP-002 Schedule regeneration with updated parameters

- **Priority:** 🟠 High
- **Use Case reference:** UpdateOrderOfPlay
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Existing schedule already generated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Modify start time, duration, or break values. | Inputs accept new values. |
| 2 | Click `Regenerate`. | Schedule is recalculated and refreshed. |

- **Postconditions:** Updated order of play persists.
- **Test Data:** Scheduled tournament with enough matches.

### OOP-003 Filter order by date and court

- **Priority:** 🟠 High
- **Use Case reference:** ViewOrderOfPlay
- **Actor:** Public, Participant, Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Scheduled tournament exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/order-of-play/:id`. | Schedule grid loads. |
| 2 | Filter by date and by specific court. | Visible schedule narrows to selected criteria. |
| 3 | Clear filters. | Full schedule returns. |

- **Postconditions:** None.
- **Test Data:** Multi-date, multi-court schedule.

### OOP-004 Reschedule single match from match detail

- **Priority:** 🟠 High
- **Use Case reference:** RescheduleMatch
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Match already exists in schedule.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/matches/:id` and reschedule via `Schedule Match`. | Modal opens with scheduling inputs. |
| 2 | Submit new court/date/time. | Match detail and order-of-play view update. |

- **Postconditions:** Single match is re-assigned.
- **Test Data:** Scheduled match.

### OOP-005 Public visibility of published order of play

- **Priority:** 🟠 High
- **Use Case reference:** ViewOrderOfPlay
- **Actor:** Public
- **Implementation status:** Implemented
- **Preconditions:** Tournament has generated schedule.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/order-of-play/:id` while logged out. | Schedule is readable. |
| 2 | Verify no admin controls render. | Public sees only filters and read-only schedule data. |

- **Postconditions:** None.
- **Test Data:** Scheduled tournament.

### OOP-006 Order changes trigger notifications and live refresh

- **Priority:** 🟡 Medium
- **Use Case reference:** NotifyOrderChange, SendNotification
- **Actor:** Tournament Administrator, Participant
- **Implementation status:** Partial
- **Preconditions:** Notification infrastructure is active; affected participant is authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Reschedule a participant's match. | Notification event is created. |
| 2 | Observe notification bell or inbox for the participant. | New notification appears without manual refresh or after lightweight reload. |

- **Postconditions:** Participant sees order-change notice.
- **Test Data:** Scheduled participant match.

### OOP-007 Twenty-four-hour publication rule `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** PublishOrderOfPlay
- **Actor:** Tournament Administrator
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** Tournament starts within 24 hours.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Generate or publish schedule inside prohibited window. | Current UI shows no explicit 24-hour rule enforcement. |
| 2 | Mark requirement as pending until business rule is surfaced. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** Short-notice tournament fixture.

## 4.08 Standings and Statistics Module

### STAND-001 Standings grouped by category

- **Priority:** 🔴 Critical
- **Use Case reference:** ViewClassification, ViewPointsClassification
- **Actor:** Public, Participant, Admin
- **Implementation status:** Implemented
- **Preconditions:** Tournament has standings data.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/standings/:id`. | Grouped standings cards render by category or bracket. |
| 2 | Verify positions, played, won, lost, set ratio, game ratio, and points columns. | Values match seeded standings data. |

- **Postconditions:** None.
- **Test Data:** T-003.

### STAND-002 Standings update after confirmed result

- **Priority:** 🔴 Critical
- **Use Case reference:** UpdateClassification, ConfirmResult
- **Actor:** Participant, Admin
- **Implementation status:** Partial
- **Preconditions:** Pending result affects standings.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Confirm a pending result. | Result finalizes successfully. |
| 2 | Reload `/standings/:id`. | Standings values and positions update. |

- **Postconditions:** Classification reflects confirmed match.
- **Test Data:** T-003 with pending result.

### STAND-003 Global ranking system switch: points vs ELO

- **Priority:** 🟠 High
- **Use Case reference:** ViewRanking, CalculateRanking
- **Actor:** Public, Participant
- **Implementation status:** Implemented
- **Preconditions:** Ranking data exists in multiple systems.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/rankings`. | Points-based ranking table is visible. |
| 2 | Change `Ranking System` selector to `ELO`. | ELO column appears and values change accordingly. |

- **Postconditions:** None.
- **Test Data:** Ranking fixtures with `POINTS_BASED` and `ELO` values.

### STAND-004 Tournament statistics page and export actions

- **Priority:** 🟠 High
- **Use Case reference:** ViewTournamentStats, ExportStatistics
- **Actor:** Public, Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Tournament statistics exist.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/:id/statistics`. | Statistics page renders tournament metrics. |
| 2 | Click `Export as PDF` and `Export as CSV`. | Download is triggered with the expected file format. |

- **Postconditions:** Export artifacts are downloaded.
- **Test Data:** T-004.

### STAND-005 Personal statistics page with history and streak-style metrics

- **Priority:** 🟠 High
- **Use Case reference:** ViewParticipantStats, ViewResultHistory
- **Actor:** Registered Participant
- **Implementation status:** Implemented
- **Preconditions:** Player has historical matches.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/statistics` as a participant. | Personal statistics cards and detail grids load. |
| 2 | Verify history-oriented data for wins, losses, or aggregate performance. | Values match seed data. |

- **Postconditions:** None.
- **Test Data:** Player with completed-match history.

### STAND-006 Ratio standings and tiebreak processing

- **Priority:** 🟡 Medium
- **Use Case reference:** ViewRatioClassification, ProcessTieBreaks
- **Actor:** Public, Admin
- **Implementation status:** Partial
- **Preconditions:** Round Robin group with tie scenario exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Seed tied standings in T-003. | Group displays players with close points. |
| 2 | Verify final order aligns with configured tiebreak chain. | Set/game differences and head-to-head influence ranking order. |

- **Postconditions:** Tie resolution is visible at standings level.
- **Test Data:** Tied Round Robin standings fixture.

### STAND-007 Head-to-head and separate points/ratio classification `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ViewMatchupHistory, ViewPointsClassification, ViewRatioClassification
- **Actor:** Public, Participant
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** Historical matchup data exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search verified UI for dedicated head-to-head or split classification views. | No dedicated screen is present. |
| 2 | Mark scenarios pending until dedicated UI is introduced. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** Historical matchup fixtures.

## 4.09 Announcement Module

### ANN-001 Admin creates public announcement

- **Priority:** 🟠 High
- **Use Case reference:** CreateAnnouncement, PublishAnnouncement
- **Actor:** Tournament Administrator, System Administrator
- **Implementation status:** Implemented
- **Preconditions:** Admin authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/announcements/create` and enter title, summary, content, and public type. | Form accepts values. |
| 2 | Submit announcement. | Announcement appears in `/announcements`. |

- **Postconditions:** Public announcement is visible.
- **Test Data:** New public announcement content.

### ANN-002 Private, scheduled, and expiring announcement

- **Priority:** 🟠 High
- **Use Case reference:** ScheduleAnnouncement
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Admin authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Create announcement with private type, scheduled publish date, and expiration date. | Save succeeds. |
| 2 | Open details modal. | Schedule metadata is displayed. |
| 3 | Verify visibility with public vs participant contexts and after expiration time shift. | Private/expired behavior matches configuration. |

- **Postconditions:** Scheduled/private fixture exists.
- **Test Data:** Announcement scheduled in future and one expired record.

### ANN-003 Search and tag filtering

- **Priority:** 🟠 High
- **Use Case reference:** ManageTags, ViewAnnouncements
- **Actor:** Public, Participant, Admin
- **Implementation status:** Implemented
- **Preconditions:** Announcements with multiple tags exist.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter text into search field. | Grid narrows to matching announcements. |
| 2 | Toggle tag chips. | Tag filters apply cumulatively. |
| 3 | Click `Clear Filters`. | Full list returns. |

- **Postconditions:** None.
- **Test Data:** Tagged announcements set.

### ANN-004 Pinned announcement prominence and detail modal

- **Priority:** 🟠 High
- **Use Case reference:** ViewAnnouncements
- **Actor:** Public, Participant
- **Implementation status:** Implemented
- **Preconditions:** At least one pinned announcement exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/announcements`. | Pinned record displays pinned badge and visual emphasis. |
| 2 | Open announcement details modal. | Full text, tags, links, and schedule metadata are visible. |

- **Postconditions:** None.
- **Test Data:** Pinned announcement fixture.

### ANN-005 Edit and delete announcement

- **Priority:** 🟠 High
- **Use Case reference:** CreateAnnouncement, PublishAnnouncement
- **Actor:** Tournament Administrator, System Administrator
- **Implementation status:** Implemented
- **Preconditions:** Admin owns at least one announcement.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Use edit action from list or modal footer. | Admin reaches `/announcements/edit/:id`. |
| 2 | Save modifications and return to list. | Updated data is visible. |
| 3 | Delete the announcement. | Record disappears from list after confirmation. |

- **Postconditions:** Announcement updated or removed.
- **Test Data:** Admin-owned announcement fixture.

### ANN-006 Private announcement visibility rules

- **Priority:** 🟠 High
- **Use Case reference:** ViewAnnouncements
- **Actor:** Public, Participant, Admin
- **Implementation status:** Partial
- **Preconditions:** Private announcement fixture exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/announcements` logged out. | Private announcement is absent. |
| 2 | Open same page as authorized participant/admin. | Authorized viewer can see the private record if backend returns it. |

- **Postconditions:** Visibility policy is validated.
- **Test Data:** Mixed public/private announcement set.

### ANN-007 Announcement view counter `[PENDING IMPLEMENTATION]`

- **Priority:** 🟢 Low
- **Use Case reference:** ViewAnnouncements
- **Actor:** Public, Participant
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** Announcement exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open announcement multiple times. | Current UI shows no view counter. |
| 2 | Keep pending until counter is exposed in API/UI. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** Any announcement.

## 4.10 Notification Module

### NOTIF-001 Notification bell unread badge and dropdown list

- **Priority:** 🔴 Critical
- **Use Case reference:** ReceiveNotification
- **Actor:** Authenticated user
- **Implementation status:** Implemented
- **Preconditions:** User has unread notifications.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open any authenticated page. | Bell button is visible. |
| 2 | Verify unread badge count and open dropdown. | Recent notifications appear with unread dot/text. |

- **Postconditions:** None.
- **Test Data:** Player or admin with unread fixtures.

### NOTIF-002 Notification inbox read actions

- **Priority:** 🔴 Critical
- **Use Case reference:** ReceiveNotification
- **Actor:** Authenticated user
- **Implementation status:** Implemented
- **Preconditions:** Inbox contains unread and read notifications.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/notifications`. | Unread and read sections are displayed. |
| 2 | Click `Mark as Read` on one item and `Mark All as Read`. | Counts and sections update correctly. |
| 3 | Delete one read notification and `Delete All Read`. | Deleted records are removed. |

- **Postconditions:** Inbox state is updated.
- **Test Data:** Mixed notification set.

### NOTIF-003 Navigation from notification to origin entity

- **Priority:** 🟠 High
- **Use Case reference:** NotifyMatch, NotifyResult, NotifyOrderChange
- **Actor:** Authenticated user
- **Implementation status:** Implemented
- **Preconditions:** Notifications reference tournament or match context.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click unread and read notification cards. | App attempts to navigate to related entity. |
| 2 | Validate handling of notifications missing tournament metadata. | Graceful error message appears instead of crash. |

- **Postconditions:** None.
- **Test Data:** One valid-origin and one malformed-origin notification.

### NOTIF-004 Notification preferences: channels and event types

- **Priority:** 🟠 High
- **Use Case reference:** ConfigureNotifications
- **Actor:** Registered Participant
- **Implementation status:** Implemented
- **Preconditions:** Participant authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/notification-preferences`. | Four channels and five event toggles load. |
| 2 | Toggle channels and types, then save. | Success message appears and settings persist on reload. |

- **Postconditions:** Preferences updated.
- **Test Data:** player1.

### NOTIF-005 Event-driven notification coverage

- **Priority:** 🟠 High
- **Use Case reference:** NotifyRegistration, NotifyMatch, NotifyResult, NotifyOrderChange
- **Actor:** Admin, Participant
- **Implementation status:** Partial
- **Preconditions:** Triggerable registration, schedule, result, announcement events exist.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Approve registration, publish or update order of play, submit result, create announcement. | Backend creates corresponding notifications. |
| 2 | Inspect recipient inboxes. | Notifications land in the correct user's inbox. |

- **Postconditions:** Event coverage is validated.
- **Test Data:** Admin and participant actors across T-001/T-002.

### NOTIF-006 WebSocket real-time notification arrival

- **Priority:** 🟡 Medium
- **Use Case reference:** SendNotification, SyncData
- **Actor:** Authenticated user
- **Implementation status:** Implemented
- **Preconditions:** WebSocket backend available.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Keep notification bell dropdown open. | Current recent list is visible. |
| 2 | Trigger `NOTIFICATION_NEW` event from secondary actor or seeded API. | New notification is prepended without page reload. |

- **Postconditions:** Recent list and unread badge update.
- **Test Data:** WebSocket event payload.

### NOTIF-007 Telegram throttling and degraded delivery `[PENDING IMPLEMENTATION]`

- **Priority:** 🟢 Low
- **Use Case reference:** ConfigureNotifications, SendNotification
- **Actor:** Participant
- **Implementation status:** Partial
- **Preconditions:** Telegram enabled in preferences.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Trigger burst notifications for same tournament within five minutes. | Current frontend offers no observable throttling UI. |
| 2 | Verify backend logs or adapter behavior separately. | Keep E2E scenario pending until observable contract exists. |

- **Postconditions:** Gap recorded.
- **Test Data:** Telegram-enabled participant.

## 4.11 Privacy and Profile Module

### PRIV-001 Update own profile data

- **Priority:** 🔴 Critical
- **Use Case reference:** ConfigurePrivacy, ManageDataVisibility
- **Actor:** Registered Participant
- **Implementation status:** Implemented
- **Preconditions:** Participant authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/profile`, switch to edit mode, and update name, username, phone, Telegram, WhatsApp, ranking, and ID document. | Form validations behave correctly. |
| 2 | Save changes and reload page. | Updated values persist. |

- **Postconditions:** Profile is updated.
- **Test Data:** player1 profile edits.

### PRIV-002 Save and reset privacy settings

- **Priority:** 🟠 High
- **Use Case reference:** ConfigurePrivacy, ManageDataVisibility
- **Actor:** Registered Participant
- **Implementation status:** Implemented
- **Preconditions:** Participant authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/privacy` and change field-level visibility options. | Select elements accept values. |
| 2 | Save settings, then use `Reset to Defaults`. | Success banner appears and defaults are restored when requested. |

- **Postconditions:** Privacy configuration is persisted or reset.
- **Test Data:** player1.

### PRIV-003 User profile view honors visibility configuration

- **Priority:** 🟠 High
- **Use Case reference:** ManageDataVisibility
- **Actor:** Participant, Public
- **Implementation status:** Partial
- **Preconditions:** Player A has privacy settings; Player B and public contexts are available.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Set email/phone/Telegram/WhatsApp/ranking/history to restrictive values. | Save succeeds. |
| 2 | Open `/users/:id` as public and as another player. | Hidden fields are omitted based on chosen visibility level. |

- **Postconditions:** Cross-user visibility is verified.
- **Test Data:** player1 viewed by player2 and public.

### PRIV-004 Admin override of privacy restrictions

- **Priority:** 🟠 High
- **Use Case reference:** ManageDataVisibility, ControlAccess
- **Actor:** System Administrator, Tournament Administrator
- **Implementation status:** Partial
- **Preconditions:** Target user has restrictive privacy settings.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open target `/users/:id` as system admin and tournament admin with shared tournament context. | Admin sees fields that should remain visible to admins. |
| 2 | Compare with public view. | Admin can access more profile data than public viewers. |

- **Postconditions:** Admin override policy is validated.
- **Test Data:** player1 profile, sysadmin, admin1.

### PRIV-005 Same-tournament vs registered-user vs public visibility

- **Priority:** 🟡 Medium
- **Use Case reference:** ManageDataVisibility
- **Actor:** Participant, Public
- **Implementation status:** Partial
- **Preconditions:** One participant shares a tournament with target user and another does not.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Configure mixed visibility levels in `/privacy`. | Save succeeds. |
| 2 | View target profile as same-tournament player, unrelated registered player, and public. | Each viewer sees only the permitted subset. |

- **Postconditions:** Role/context visibility matrix is validated.
- **Test Data:** player1, player2, player7, public.

### PRIV-006 GDPR export JSON/PDF `[PARTIAL UI]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ConfigurePrivacy
- **Actor:** Registered Participant
- **Implementation status:** Partial
- **Preconditions:** User account exists with data history.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search verified profile and privacy pages for export controls. | No direct GDPR export button is currently exposed. |
| 2 | Validate service/API flow separately until UI is added. | Scenario remains partial and API-assisted. |

- **Postconditions:** Gap documented.
- **Test Data:** player1 historical data.

### PRIV-007 GDPR account deletion `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ConfigurePrivacy
- **Actor:** Registered Participant
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** User data exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search profile/privacy UI for delete-account entry point. | No delete-account control is present. |
| 2 | Note that service code still throws for full anonymization path. | Scenario remains blocked until UI and backend completion. |

- **Postconditions:** Gap recorded.
- **Test Data:** player1.

## 4.12 Global Ranking Module

### RANK-001 View global ranking list

- **Priority:** 🟠 High
- **Use Case reference:** ViewRanking
- **Actor:** Public, Participant
- **Implementation status:** Implemented
- **Preconditions:** Ranking fixtures exist.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/rankings`. | Ranking table loads with player positions and totals. |
| 2 | Verify row order and top-3 badge styling. | Players are sorted by ranking position. |

- **Postconditions:** None.
- **Test Data:** Ranking entries for all participants.

### RANK-002 Switch points-based and ELO ranking modes

- **Priority:** 🟠 High
- **Use Case reference:** CalculateRanking, ViewRanking
- **Actor:** Public, Participant
- **Implementation status:** Implemented
- **Preconditions:** Points and ELO data exist.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Toggle ranking system selector between systems. | Table updates and ELO column appears only for ELO mode. |

- **Postconditions:** None.
- **Test Data:** Seeded rankings in both systems.

### RANK-003 Ranking refresh after tournament result confirmation

- **Priority:** 🟠 High
- **Use Case reference:** CalculateRanking, UpdateClassification
- **Actor:** Participant, Admin
- **Implementation status:** Partial
- **Preconditions:** Confirmable match result changes player totals.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Confirm or resolve a result affecting ranking totals. | Match finalizes. |
| 2 | Revisit `/rankings`. | Positions or totals update according to new outcome. |

- **Postconditions:** Rankings reflect latest result.
- **Test Data:** Result affecting seeded ranking fixtures.

### RANK-004 External ranking import and seed generation `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ImportExternalRanking, SetSeeds
- **Actor:** System Administrator
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** None.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search verified routes for external ranking import workflow. | No dedicated UI exists. |
| 2 | Keep scenario pending until admin import surface is implemented. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** External ranking file fixture.

## 4.13 Export and Documents Module

### EXP-001 Bracket PDF export and printable view

- **Priority:** 🟠 High
- **Use Case reference:** ExportBrackets, PrintBrackets
- **Actor:** Public, Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Published bracket exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/brackets/:id` and click `Export PDF`. | PDF download or preview is triggered. |
| 2 | Open the exported file in print view. | Printable bracket layout is available. |

- **Postconditions:** Bracket export artifact exists.
- **Test Data:** Published bracket.

### EXP-002 Tournament statistics PDF and Excel exports

- **Priority:** 🟠 High
- **Use Case reference:** ExportStatistics, ExportResults
- **Actor:** Tournament Administrator, Public
- **Implementation status:** Implemented
- **Preconditions:** Tournament statistics exist.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/:id/statistics`. | Export buttons are visible. |
| 2 | Trigger PDF and CSV/Excel export. | Correct file types are downloaded. |

- **Postconditions:** Export files are available.
- **Test Data:** T-004.

### EXP-003 ITF CSV and TODS tournament exports `[PARTIAL UI]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ExportResults, IntegrateExternalSystems
- **Actor:** Tournament Administrator
- **Implementation status:** Partial
- **Preconditions:** Tournament exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search active tournament detail template for ITF/TODS buttons. | Current active template does not visibly expose them. |
| 2 | Validate service/API path separately or enable alternate template before E2E. | Scenario remains partial. |

- **Postconditions:** Gap documented.
- **Test Data:** T-004.

### EXP-004 Documents and certificates generation `[PENDING IMPLEMENTATION]`

- **Priority:** 🟢 Low
- **Use Case reference:** GenerateDocuments, GenerateCertificates
- **Actor:** Tournament Administrator
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** Finalized tournament exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search current routes/pages for certificates or document generation UI. | No dedicated page or modal exists. |
| 2 | Hold scenario until product surface exists. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** T-004.

## 4.14 Incident Management Module

### INC-001 Participant dispute creates admin review item

- **Priority:** 🔴 Critical
- **Use Case reference:** RecordDispute, ManageIncidents
- **Actor:** Participant, Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Pending result exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Submit dispute from `/my-matches`. | Dispute reason is captured. |
| 2 | Open `/admin/disputed-matches`. | Dispute card appears for review. |

- **Postconditions:** Incident is queued.
- **Test Data:** Disputed match fixture.

### INC-002 Admin resolves dispute and notifies players

- **Priority:** 🔴 Critical
- **Use Case reference:** ManageIncidents, SendNotification
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Dispute card exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Resolve dispute with winner, sets, and notes. | Resolution succeeds and card disappears. |
| 2 | Check affected players. | Notifications or visible result updates reach players. |

- **Postconditions:** Incident is closed.
- **Test Data:** Disputed result fixture.

### INC-003 Admin annuls match result

- **Priority:** 🟠 High
- **Use Case reference:** CancelMatch, ManageIncidents
- **Actor:** Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Disputed result exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open annul modal from dispute card. | Modal explains destructive action. |
| 2 | Confirm annulment. | Match result is annulled and dispute is removed from active queue. |

- **Postconditions:** Match result is annulled.
- **Test Data:** Disputed result fixture.

### INC-004 Sanctions, replay orders, and sanction logs `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** ApplySanctions, ReplayMatch
- **Actor:** Tournament Administrator, System Administrator
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** Incident exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search current admin pages for sanction type controls or replay actions. | No sanction/replay UI is present. |
| 2 | Keep scenario pending until incident expansion is implemented. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** Incident requiring sanction fixture.

## 4.15 Communication Module

### COMM-001 Partner invitation messaging in doubles workflows

- **Priority:** 🟡 Medium
- **Use Case reference:** ChatWithParticipants
- **Actor:** Participant
- **Implementation status:** Partial
- **Preconditions:** Doubles invitation exists with message body.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Send partner invitation with message. | Invitation message is saved. |
| 2 | Open `/my-invitations` as recipient and sender. | Message text is visible in invitation card. |

- **Postconditions:** None.
- **Test Data:** Doubles partner invitation fixture.

### COMM-002 Invitation acceptance updates related UIs

- **Priority:** 🟡 Medium
- **Use Case reference:** SendNotification, ChatWithParticipants
- **Actor:** Participant inviter, Participant invitee
- **Implementation status:** Partial
- **Preconditions:** Pending invitation exists.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Recipient accepts or declines invitation. | Invitation status changes. |
| 2 | Sender refreshes or reopens `/my-invitations`. | Sent invitation reflects new state and success banner if accepted. |

- **Postconditions:** Invitation state synchronized.
- **Test Data:** Pending invitation between player1 and player2.

### COMM-003 Tournament chat, moderation, and group messaging `[PENDING IMPLEMENTATION]`

- **Priority:** 🟢 Low
- **Use Case reference:** ChatWithParticipants, ModerateChat, SendGroupMessage
- **Actor:** Participant, Tournament Administrator
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** None.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search verified frontend for chat room, message composer, moderation, or mute UI. | No chat UI is present. |
| 2 | Mark all chat scenarios as blocked until route/component is implemented. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** None.

## 4.16 System Management Module (SysAdmin)

### SYS-001 System admin dashboard access and role visibility

- **Priority:** 🔴 Critical
- **Use Case reference:** ControlAccess, ManageUsers
- **Actor:** System Administrator, Tournament Administrator
- **Implementation status:** Implemented
- **Preconditions:** Admin accounts authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/admin` as system admin and tournament admin. | Both can access dashboard. |
| 2 | Compare visible controls. | System admin sees extra system tools; tournament admin sees tournament tools only. |

- **Postconditions:** None.
- **Test Data:** sysadmin, admin1.

### SYS-002 System admin user CRUD and role assignment

- **Priority:** 🔴 Critical
- **Use Case reference:** ManageUsers, CreateUser, EditUser, DeleteUser, AssignRoles
- **Actor:** System Administrator
- **Implementation status:** Implemented
- **Preconditions:** System admin authenticated.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/admin/users` and create a new player or tournament admin. | New user appears in table. |
| 2 | Edit role, phone, active state, and optionally password. | Changes persist after save. |
| 3 | Delete created user. | User is removed from the list. |

- **Postconditions:** CRUD workflow is verified.
- **Test Data:** Temporary user account with unique email.

### SYS-003 Backup, restore, monitoring, and branding pages blocked or absent `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** CreateBackup, RestoreBackup, MonitorPerformance, CustomizeVisuals
- **Actor:** System Administrator, Tournament Administrator, Participant
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** Authenticated contexts available.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Attempt to navigate to `/admin/backup`, `/admin/system`, or expected monitoring route. | No verified route exists; wildcard redirect handles unknown path. |
| 2 | Verify non-admin users cannot reach future routes once implemented. | Scenario remains pending for actual UI. |

- **Postconditions:** Gap recorded.
- **Test Data:** sysadmin, admin1, player1.

### SYS-004 Assign tournament administrators and import external ranking `[PENDING IMPLEMENTATION]`

- **Priority:** 🟡 Medium
- **Use Case reference:** AssignAdministrators, ImportExternalRanking, IntegrateExternalSystems
- **Actor:** System Administrator
- **Implementation status:** `[PENDING IMPLEMENTATION]`
- **Preconditions:** None.
- **Test Steps:**

| Step | Action | Expected Result |
|---|---|---|
| 1 | Search `/admin` and `/admin/users` for assignment/import controls. | No dedicated tournament-admin assignment or ranking-import flow exists. |
| 2 | Hold E2E until routes or modal flows are added. | Pending status retained. |

- **Postconditions:** Gap recorded.
- **Test Data:** admin1, admin2, ranking file fixture.

---

## 5. Cross-Cutting Scenarios

| Scenario ID | Priority | Status | Preconditions | Steps | Expected Result |
|---|---|---|---|---|---|
| CROSS-001 Header navigation and user dropdown | 🟠 High | Implemented | Guest and authenticated contexts | Open header links, bell, and dropdown menu | Navigation is correct for current auth state |
| CROSS-002 Loading, error, confirm, and success feedback patterns | 🟠 High | Implemented | Seed delayed responses and destructive actions | Visit tournaments, matches, announcements, users; trigger save/delete | Loading spinners, error banners, confirms, and success banners appear consistently |
| CROSS-003 Session-expired redirect message | 🟠 High | Implemented | Authenticated session with stale activity timestamp | Force timeout, redirect to `/login?reason=session_expired` | User is logged out gracefully without broken state |
| CROSS-004 Offline cached read-only access | 🟡 Medium | Partial | Service worker installed and pages previously loaded | Go offline and revisit previously loaded public pages | Cached content may remain readable; failures are handled gracefully |
| CROSS-005 WebSocket refresh for notifications and live-adjacent data | 🟡 Medium | Partial | WebSocket backend available | Trigger server events while user watches bell/inbox | Notification surfaces update without full reload |

Prompt assumptions not matching the current app:

- Sidebar collapse/expand persistence -> `[PENDING IMPLEMENTATION]` because the app uses a header and dropdown menu.
- Theme toggle -> `[PENDING IMPLEMENTATION]`
- Multi-language switching -> `[PENDING IMPLEMENTATION]`

---

## 6. Edge Cases and Error Scenarios

| Scenario ID | Priority | Status | Preconditions | Steps | Expected Result |
|---|---|---|---|---|---|
| ERR-001 Unknown route fallback | 🟡 Medium | Implemented | Any context | Open unknown route under app base path | Wildcard route redirects to `/home` |
| ERR-002 Permission denied on admin action | 🔴 Critical | Implemented | Logged in as participant | Attempt `/admin`, `/admin/users`, `/tournaments/create` | User is redirected away from unauthorized content |
| ERR-003 Network failure during create/save/result actions | 🔴 Critical | Implemented | Route stubbing available | Fail create tournament, schedule save, result submit, notification delete | Error banner or alert appears and page remains stable |
| ERR-004 Non-existent tournament or match | 🟠 High | Implemented | Invalid IDs | Open `/tournaments/bad-id`, `/matches/bad-id`, `/standings/bad-id` | Error or empty state appears without crash |
| ERR-005 Duplicate registration and invalid re-registration state | 🟠 High | Implemented | Player already registered | Re-register active player; retry with withdrawn player | Active duplicate blocked, withdrawn player can re-enter pending workflow |
| ERR-006 Invalid set scores and conflicting updates | 🟠 High | Partial | Two contexts on same match | Submit impossible tennis scores and stale updates | Invalid score rejected; conflicting updates handled by latest backend validation |

Additional pending edge cases:

- File upload over 10MB `[PENDING IMPLEMENTATION]`
- XSS sanitization in rich text fields `[PENDING IMPLEMENTATION FOR E2E]`
- Draw generation with 0 or 1 participant is covered by `DRAW-001`

---

## 7. Accessibility Scenarios

| Scenario ID | Priority | Status | Preconditions | Steps | Expected Result |
|---|---|---|---|---|---|
| A11Y-001 Keyboard navigation on login, register, profile | 🟡 Medium | Implemented | Standard keyboard navigation | Use `Tab`, `Shift+Tab`, `Enter`, `Space` only | Logical focus order and submit behavior work |
| A11Y-002 Modal focus and escape handling | 🟡 Medium | Partial | Open match, dispute, announcement, and court modals | Move focus through modal, press `Escape`, verify focus return | Modal interaction remains keyboard-usable; close handling is verified where implemented |
| A11Y-003 Accessible names and landmarks | 🟡 Medium | Partial | Key pages loaded | Inspect buttons with aria-labels, header, main landmarks | Interactive elements expose readable names |
| A11Y-004 Axe audit for core pages | 🟡 Medium | Planned | Axe integration available | Audit `/login`, `/home`, `/tournaments/:id`, `/brackets/:id`, `/standings/:id` | No critical WCAG violations remain |

---

## 8. Responsive Design Scenarios

| Scenario ID | Priority | Status | Preconditions | Steps | Expected Result |
|---|---|---|---|---|---|
| RESP-001 Guest landing and login on mobile | 🟡 Medium | Planned | Mobile viewport project | Open `/home` and `/login` at 375x667 | Hero, CTA, and login form remain readable and usable |
| RESP-002 Tournament list, detail, and order of play on mobile | 🟡 Medium | Planned | Mobile viewport project | Browse `/tournaments`, open detail, open order of play | Cards stack correctly and controls remain tappable |
| RESP-003 Bracket view horizontal scrolling | 🟡 Medium | Implemented | Small viewport and published bracket | Open `/brackets/:id` on mobile/tablet | Bracket remains navigable through horizontal scroll |
| RESP-004 Tablet and desktop header/dashboard layouts | 🟢 Low | Planned | Tablet and desktop projects | Open `/home`, `/admin`, `/notifications` | Header, dashboard cards, and tables adapt without overlap |

---

## 9. Test Data Requirements

Use API seeding for deterministic state setup. The following object defines the minimum seed payload recommended for Playwright test setup helpers.

```json
{
  "users": [
    {"email": "sysadmin@tennis-test.com", "password": "SysAdmin123!", "role": "SYSTEM_ADMIN", "username": "sysadmin", "firstName": "System", "lastName": "Admin"},
    {"email": "admin1@tennis-test.com", "password": "TAdmin123!", "role": "TOURNAMENT_ADMIN", "username": "admin1", "firstName": "Alice", "lastName": "Organizer"},
    {"email": "admin2@tennis-test.com", "password": "TAdmin123!", "role": "TOURNAMENT_ADMIN", "username": "admin2", "firstName": "Bob", "lastName": "Organizer"},
    {"email": "player1@tennis-test.com", "password": "Player123!", "role": "PLAYER", "username": "player1", "firstName": "Pablo", "lastName": "One", "ranking": 15, "idDocument": "11111111A"},
    {"email": "player2@tennis-test.com", "password": "Player123!", "role": "PLAYER", "username": "player2", "firstName": "Paula", "lastName": "Two", "ranking": 28, "idDocument": "22222222B"},
    {"email": "player3@tennis-test.com", "password": "Player123!", "role": "PLAYER", "username": "player3", "firstName": "Pedro", "lastName": "Three", "ranking": 32, "idDocument": "33333333C"},
    {"email": "player4@tennis-test.com", "password": "Player123!", "role": "PLAYER", "username": "player4", "firstName": "Pat", "lastName": "Four", "ranking": 41, "idDocument": "44444444D"},
    {"email": "player5@tennis-test.com", "password": "Player123!", "role": "PLAYER", "username": "player5", "firstName": "Pia", "lastName": "Five", "ranking": 53, "idDocument": "55555555E"},
    {"email": "player6@tennis-test.com", "password": "Player123!", "role": "PLAYER", "username": "player6", "firstName": "Paco", "lastName": "Six", "ranking": 57, "idDocument": "66666666F"},
    {"email": "player7@tennis-test.com", "password": "Player123!", "role": "PLAYER", "username": "player7", "firstName": "Pilar", "lastName": "Seven", "ranking": 65, "idDocument": "77777777G"},
    {"email": "player8@tennis-test.com", "password": "Player123!", "role": "PLAYER", "username": "player8", "firstName": "Pepe", "lastName": "Eight", "ranking": 72, "idDocument": "88888888H"}
  ],
  "tournaments": [
    {"id": "T-001", "name": "Open Registration Tournament", "admin": "admin1@tennis-test.com", "status": "REGISTRATION_OPEN", "bracketType": "SINGLE_ELIMINATION", "tournamentType": "SINGLES", "maxParticipants": 16},
    {"id": "T-002", "name": "Active Knockout Tournament", "admin": "admin1@tennis-test.com", "status": "IN_PROGRESS", "bracketType": "SINGLE_ELIMINATION", "tournamentType": "SINGLES", "maxParticipants": 16},
    {"id": "T-003", "name": "Active Round Robin Tournament", "admin": "admin2@tennis-test.com", "status": "IN_PROGRESS", "bracketType": "ROUND_ROBIN", "tournamentType": "SINGLES", "maxParticipants": 12},
    {"id": "T-004", "name": "Finalized Tournament", "admin": "admin1@tennis-test.com", "status": "FINALIZED", "bracketType": "SINGLE_ELIMINATION", "tournamentType": "SINGLES", "maxParticipants": 8},
    {"id": "T-005", "name": "Draft Match Play Tournament", "admin": "admin2@tennis-test.com", "status": "DRAFT", "bracketType": "MATCH_PLAY", "tournamentType": "DOUBLES", "maxParticipants": 8}
  ],
  "registrations": [
    {"tournamentId": "T-001", "player": "player1@tennis-test.com", "status": "PENDING", "acceptanceType": "DIRECT_ACCEPTANCE"},
    {"tournamentId": "T-001", "player": "player2@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "DIRECT_ACCEPTANCE", "seedNumber": 1},
    {"tournamentId": "T-001", "player": "player3@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "WILD_CARD"},
    {"tournamentId": "T-001", "player": "player4@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "ALTERNATE"},
    {"tournamentId": "T-002", "player": "player1@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "DIRECT_ACCEPTANCE", "seedNumber": 2},
    {"tournamentId": "T-002", "player": "player5@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "DIRECT_ACCEPTANCE"},
    {"tournamentId": "T-003", "player": "player2@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "DIRECT_ACCEPTANCE"},
    {"tournamentId": "T-003", "player": "player3@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "DIRECT_ACCEPTANCE"},
    {"tournamentId": "T-003", "player": "player6@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "DIRECT_ACCEPTANCE"},
    {"tournamentId": "T-003", "player": "player7@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "DIRECT_ACCEPTANCE"},
    {"tournamentId": "T-004", "player": "player8@tennis-test.com", "status": "ACCEPTED", "acceptanceType": "DIRECT_ACCEPTANCE"},
    {"tournamentId": "T-005", "player": "player1@tennis-test.com", "status": "PENDING", "acceptanceType": "DIRECT_ACCEPTANCE"}
  ],
  "partnerInvitations": [
    {"tournamentId": "T-005", "inviter": "player1@tennis-test.com", "invitee": "player2@tennis-test.com", "status": "PENDING", "message": "Want to pair up for doubles?"},
    {"tournamentId": "T-005", "inviter": "player3@tennis-test.com", "invitee": "player4@tennis-test.com", "status": "ACCEPTED", "message": "Let's play together."}
  ],
  "courts": [
    {"tournamentId": "T-002", "name": "Center Court", "surface": "HARD", "openingTime": "09:00", "closingTime": "21:00"},
    {"tournamentId": "T-002", "name": "Court 2", "surface": "HARD", "openingTime": "09:00", "closingTime": "21:00"},
    {"tournamentId": "T-003", "name": "Clay Court 1", "surface": "CLAY", "openingTime": "10:00", "closingTime": "20:00"}
  ],
  "brackets": [
    {"tournamentId": "T-002", "id": "B-002", "bracketType": "SINGLE_ELIMINATION", "isPublished": true, "size": 8, "totalRounds": 3},
    {"tournamentId": "T-003", "id": "B-003", "bracketType": "ROUND_ROBIN", "isPublished": true, "size": 4, "totalRounds": 1},
    {"tournamentId": "T-005", "id": "B-005", "bracketType": "MATCH_PLAY", "isPublished": false, "size": 4, "totalRounds": 2}
  ],
  "matches": [
    {"id": "M-201", "tournamentId": "T-002", "status": "TO_BE_PLAYED", "participant1": "player1@tennis-test.com", "participant2": "player5@tennis-test.com", "court": "Center Court"},
    {"id": "M-202", "tournamentId": "T-002", "status": "IN_PROGRESS", "participant1": "player2@tennis-test.com", "participant2": "player3@tennis-test.com", "court": "Court 2"},
    {"id": "M-203", "tournamentId": "T-002", "status": "SUSPENDED", "participant1": "player6@tennis-test.com", "participant2": "player7@tennis-test.com", "score": "6-4, 3-2"},
    {"id": "M-204", "tournamentId": "T-002", "status": "COMPLETED", "participant1": "player2@tennis-test.com", "participant2": "player8@tennis-test.com", "score": "6-3, 6-2"},
    {"id": "M-205", "tournamentId": "T-002", "status": "DISPUTED", "participant1": "player1@tennis-test.com", "participant2": "player5@tennis-test.com", "pendingResult": true},
    {"id": "M-301", "tournamentId": "T-003", "status": "COMPLETED", "participant1": "player2@tennis-test.com", "participant2": "player3@tennis-test.com", "score": "6-4, 6-4"},
    {"id": "M-302", "tournamentId": "T-003", "status": "COMPLETED", "participant1": "player6@tennis-test.com", "participant2": "player7@tennis-test.com", "score": "7-6, 6-7, 10-8"}
  ],
  "standings": [
    {"tournamentId": "T-003", "participant": "player2@tennis-test.com", "position": 1, "points": 6, "matchesWon": 2, "matchesLost": 0},
    {"tournamentId": "T-003", "participant": "player3@tennis-test.com", "position": 2, "points": 3, "matchesWon": 1, "matchesLost": 1},
    {"tournamentId": "T-003", "participant": "player6@tennis-test.com", "position": 3, "points": 3, "matchesWon": 1, "matchesLost": 1},
    {"tournamentId": "T-003", "participant": "player7@tennis-test.com", "position": 4, "points": 0, "matchesWon": 0, "matchesLost": 2}
  ],
  "announcements": [
    {"title": "Welcome Players", "type": "PUBLIC", "tags": ["general"], "isPinned": true, "tournamentId": "T-001"},
    {"title": "Court Change", "type": "PRIVATE", "tags": ["schedule"], "tournamentId": "T-002"},
    {"title": "Draw Published", "type": "PUBLIC", "tags": ["bracket"], "tournamentId": "T-002"},
    {"title": "Tomorrow's Order", "type": "PRIVATE", "tags": ["oop"], "scheduledPublishAt": "2026-05-21T08:00:00Z", "tournamentId": "T-003"},
    {"title": "Expired Notice", "type": "PUBLIC", "tags": ["archive"], "expirationDate": "2026-05-10T23:59:59Z", "tournamentId": "T-004"}
  ],
  "notifications": [
    {"recipient": "player1@tennis-test.com", "type": "RESULT_RECORDED", "isRead": false, "tournamentId": "T-002"},
    {"recipient": "player1@tennis-test.com", "type": "CONFIRMATION_PENDING", "isRead": false, "tournamentId": "T-002"},
    {"recipient": "player2@tennis-test.com", "type": "ORDER_PUBLISHED", "isRead": true, "tournamentId": "T-003"},
    {"recipient": "admin1@tennis-test.com", "type": "NEW_REGISTRATION", "isRead": false, "tournamentId": "T-001"},
    {"recipient": "admin1@tennis-test.com", "type": "DISPUTE_RECORDED", "isRead": false, "tournamentId": "T-002"}
  ],
  "rankings": [
    {"participant": "player1@tennis-test.com", "system": "POINTS_BASED", "position": 1, "totalPoints": 1200, "eloRating": 1620},
    {"participant": "player2@tennis-test.com", "system": "POINTS_BASED", "position": 2, "totalPoints": 1080, "eloRating": 1588},
    {"participant": "player3@tennis-test.com", "system": "POINTS_BASED", "position": 3, "totalPoints": 990, "eloRating": 1555},
    {"participant": "player4@tennis-test.com", "system": "POINTS_BASED", "position": 4, "totalPoints": 920, "eloRating": 1520},
    {"participant": "player5@tennis-test.com", "system": "POINTS_BASED", "position": 5, "totalPoints": 870, "eloRating": 1490},
    {"participant": "player6@tennis-test.com", "system": "POINTS_BASED", "position": 6, "totalPoints": 830, "eloRating": 1470},
    {"participant": "player7@tennis-test.com", "system": "POINTS_BASED", "position": 7, "totalPoints": 790, "eloRating": 1448},
    {"participant": "player8@tennis-test.com", "system": "POINTS_BASED", "position": 8, "totalPoints": 750, "eloRating": 1425}
  ]
}
```

Recommended seeding approach:

- Seed through backend APIs before each suite.
- Use unique suffixes for any user created during destructive tests.
- Clean up temporary users and tournaments in `finally` blocks.
- Keep one static reference dataset for ranking, standings, and announcements to stabilize assertions.

---

## 10. Execution Priority Matrix

| Priority | Description | CI Trigger |
|---|---|---|
| 🔴 Critical | Auth, tournament CRUD, registration approval, bracket publish/regenerate, match scheduling, result confirmation, dispute resolution | Every PR |
| 🟠 High | Registration variants, standings, ranking switch, announcements, notifications, order-of-play filters and generation | Daily |
| 🟡 Medium | Privacy visibility, exports, offline, ratio/tiebreak, responsive, partial system features | Nightly |
| 🟢 Low | Pending features, exploratory accessibility sweeps, chat/system gaps, non-blocking UX checks | Weekly or release |

### Proposed Test Suite Folder Structure

```text
e2e/
├── critical/        auth, tournament-crud, registration-review,
│                    bracket-management, match-results, disputes
├── high/            order-of-play, standings, announcements,
│                    notifications, rankings, profile-privacy
├── medium/          exports, doubles-invitations, offline,
│                    responsive, accessibility
└── low/             pending-features, exploratory-system,
                     cross-cutting-regression
```

---

## 11. Document Summary

- **Total use cases mapped:** 95
- **Total scenarios defined:** 121
- **Modules covered:** Authentication, Dashboard, Tournament Management, Registration, Draws, Match Results, Order of Play, Standings and Statistics, Announcements, Notifications, Privacy and Profile, Global Ranking, Export, Incident Management, Communication, System Management, Cross-Cutting, Error Handling, Accessibility, Responsive Design
- **Roles tested:** System Administrator, Tournament Administrator, Registered Participant, Public
- **Viewport configurations:** Desktop Chrome, Desktop Firefox, Desktop Safari, plus planned `375x667`, `390x844`, and `768x1024` device projects for responsive coverage
- **Implemented route count verified:** 30 route entries including redirect and wildcard handling
- **Selector strategy:** ID-first, text-second, semantic-class fallback because no `data-testid` attributes exist
- **Major pending areas:** Password recovery, lockout, JWT refresh, backup/restore UI, system monitoring, external ranking import UI, chat and group messaging, certificates/documents UI, explicit GDPR UI actions

		```