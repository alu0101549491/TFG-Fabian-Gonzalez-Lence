# E2E TEST PLANNING - USE CASE ANALYSIS AND SCENARIO DEFINITION

## OBJECTIVE
You are a Senior QA Engineer Agent specialized in End-to-End testing with
Playwright. Your task is to analyze the **Tennis Tournament Manager (TENNIS)**
application, review the existing use case diagram from the design phase, scan
the actual implemented codebase under `/projects/5-TennisTournamentManager/`,
and generate a comprehensive document defining all test scenarios that must
be covered.

---

## PROJECT CONTEXT

**Project:** Tennis Tournament Manager (TENNIS)
**Description:** Responsive web application for comprehensive management of
  multiple simultaneous tennis tournaments. Covers participant registration,
  draw design (Round Robin, Knockout, Match Play), order of play generation,
  result recording, automatic standings calculation, announcement publication,
  and multichannel notifications. Four actor types: System Administrator,
  Tournament Administrator, Registered Participant, and Public.

**Tech Stack:**
- Frontend: TypeScript 5.x, Angular, Vite
- Real-time: Socket.io-client
- HTTP client: Axios
- Testing framework: Playwright
- Authentication: JWT-based (bcrypt passwords, 30 min session timeout)

**User Roles:**
1. **System Administrator (SYSTEM_ADMIN):** Full platform control — manages
   all tournaments, all users, global ranking, visual customization, backups.
2. **Tournament Administrator (TOURNAMENT_ADMIN):** Full control of own
   tournaments — brackets, results, order of play, announcements, incidents.
3. **Registered Participant (PARTICIPANT):** Registers, enters results,
   confirms/disputes, views own statistics, configures notifications/privacy.
4. **Public (PUBLIC):** Read-only access to public tournaments, brackets,
   results, standings, announcements.

---

## INPUT ARTIFACTS TO ANALYZE

### 1. Use Case Diagram (Design Phase)
[Attached in full — Mermaid graph TB covering all 25 use case groups:
 User Management, Tournament Management, Registration, Bracket Management,
 Match Management, Order of Play, Visualization, Statistics, Ranking,
 Notifications, Announcements, Privacy & Security, Communication, Export &
 Documents, Incident Management, System Management, System Operations]

### 2. Requirements Specification
Location: `/projects/5-TennisTournamentManager/docs/design/`
Also available in full in this context (sections 1–27).

### 3. Application Routes
Scan `/projects/5-TennisTournamentManager/src/presentation/` for the actual
Angular router configuration and derive the final route list. Expected routes
include (verify against codebase — this list may have changed):

```
/login                              - Authentication
/                                   - Dashboard
/tournaments                        - Tournament list
/tournaments/new                    - Create tournament
/tournaments/:id                    - Tournament detail (tabs: Overview,
                                      Brackets, Order of Play, Standings,
                                      Announcements, Participants)
/tournaments/:id/brackets           - Bracket view
/tournaments/:id/brackets/:bracketId - Single bracket
/tournaments/:id/order-of-play      - Order of play
/tournaments/:id/standings          - Standings
/tournaments/:id/announcements      - Announcements
/matches/:id                        - Match detail
/ranking                            - Global ranking
/profile                            - Own profile / privacy settings
/notifications                      - Notifications list
/admin/users                        - User management (SysAdmin only)
/admin/system                       - System management (SysAdmin only)
/admin/backup                       - Backup & restore (SysAdmin only)
```

### 4. Application Views and Components
Scan `/projects/5-TennisTournamentManager/src/presentation/features/` to find
all implemented Angular components and derive the actual UI surface to test.
Do NOT assume views exist without verifying in the codebase first.

### 5. Core Functionalities (from Requirements Specification)
01. Authentication & authorization (JWT, role guards, session timeout)
02. Tournament management (create, configure, finalize — FR1–FR8)
03. Participant registration & quota management (FR9–FR15)
04. Draw generation (Round Robin, Knockout, Match Play — FR16–FR22)
05. Match & result management (12 states, confirmation, dispute — FR23–FR32)
06. Order of play (generation, publication, rescheduling — FR33–FR38)
07. Standings & statistics (points, ratios, ELO, tiebreaks — FR39–FR46)
08. Announcement system (public/private, tags, scheduling — FR47–FR51)
09. Notification system (multichannel: in-app, email, Telegram — FR52–FR57)
10. Privacy management (per-field visibility levels — FR58–FR60)
11. Export (ITF CSV, TODS, PDF/Excel — FR61–FR63)
12. Global ranking (POINTS_BASED, ELO — FR44)
13. System management (backup, restore, monitoring — SysAdmin)
14. Communication (chat, group messages — optional feature)

---

## YOUR TASK

1. **Scan the codebase** under `/projects/5-TennisTournamentManager/src/` to
   identify all implemented routes, components, and features. Base scenarios
   on what is actually built — note any use cases from the diagram that are
   not yet implemented, but do not skip them entirely; mark them as
   `[PENDING IMPLEMENTATION]`.
2. **Analyze the use case diagram** and map every use case to implemented
   views and components.
3. **Identify all user interactions** that need to be tested for each of the
   four actor types.
4. **Define detailed test scenarios** for each use case, varying actions,
   flows, and interactions as much as possible.
5. **Prioritize scenarios** based on criticality and user frequency.
6. **Document preconditions, steps, and expected results** for every scenario.

---

## OUTPUT FORMAT

Generate the document and save it to:
`/projects/5-TennisTournamentManager/docs/testing/E2E_TEST_SCENARIOS.md`

```markdown
# E2E TEST SCENARIOS
## Tennis Tournament Manager (TENNIS)

**Document Version:** 1.0
**Created:** [DATE]
**Author:** QA Engineer Agent
**Testing Framework:** Playwright
**Target Coverage:** [X]% of user interactions

---

## TABLE OF CONTENTS

1. [Test Environment Setup]
2. [User Roles and Test Accounts]
3. [Use Case to Scenario Mapping]
4. [Test Scenarios by Module]
   - 4.01 [Authentication Module]
   - 4.02 [Dashboard Module]
   - 4.03 [Tournament Management Module]
   - 4.04 [Participant Registration Module]
   - 4.05 [Draw Management Module]
   - 4.06 [Match & Result Management Module]
   - 4.07 [Order of Play Module]
   - 4.08 [Standings & Statistics Module]
   - 4.09 [Announcement Module]
   - 4.10 [Notification Module]
   - 4.11 [Privacy & Profile Module]
   - 4.12 [Global Ranking Module]
   - 4.13 [Export & Documents Module]
   - 4.14 [Incident Management Module]
   - 4.15 [Communication Module]
   - 4.16 [System Management Module (SysAdmin)]
5. [Cross-Cutting Scenarios]
6. [Edge Cases and Error Scenarios]
7. [Accessibility Scenarios]
8. [Responsive Design Scenarios]
9. [Test Data Requirements]
10. [Execution Priority Matrix]
```

---

## SECTION SPECIFICATIONS

### Section 1 — Test Environment Setup

```typescript
// playwright.config.ts base configuration
{
  baseURL: 'http://localhost:4200',
  testDir: './e2e',
  timeout: 30000,
  retries: 2,
  workers: 4,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
  ],
}
```

### Section 2 — User Roles and Test Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| System Admin | sysadmin@tennis-test.com | SysAdmin123! | Full platform |
| Tournament Admin 1 | admin1@tennis-test.com | TAdmin123! | Own tournaments |
| Tournament Admin 2 | admin2@tennis-test.com | TAdmin123! | Own tournaments |
| Participant 1 | player1@tennis-test.com | Player123! | Own registrations |
| Participant 2 | player2@tennis-test.com | Player123! | Own registrations |
| Participant 3 | player3@tennis-test.com | Player123! | Own registrations |
| Public (no login) | — | — | Read-only public |

Test Tournaments:
| ID | Name | Admin | Status | Draw Type | Purpose |
|----|------|-------|--------|-----------|---------|
| T-001 | Open Registration Tournament | admin1 | REGISTRATION_OPEN | Knockout | Registration flow |
| T-002 | Active Knockout Tournament | admin1 | IN_PROGRESS | Knockout | Match/result flow |
| T-003 | Active Round Robin Tournament | admin2 | IN_PROGRESS | Round Robin | Standings/tiebreak |
| T-004 | Finalized Tournament | admin1 | FINALIZED | Knockout | Read-only testing |
| T-005 | Draft Tournament | admin2 | DRAFT | Match Play | Configuration flow |

### Section 3 — Use Case to Scenario Mapping

Map every use case from the diagram to scenario IDs. Use the prefix convention:
- AUTH-XXX (Authentication)
- DASH-XXX (Dashboard)
- TOURN-XXX (Tournament Management)
- REG-XXX (Registration)
- DRAW-XXX (Draw Management)
- MATCH-XXX (Match & Result Management)
- OOP-XXX (Order of Play)
- STAND-XXX (Standings & Statistics)
- ANN-XXX (Announcements)
- NOTIF-XXX (Notifications)
- PRIV-XXX (Privacy & Profile)
- RANK-XXX (Global Ranking)
- EXP-XXX (Export & Documents)
- INC-XXX (Incident Management)
- COMM-XXX (Communication)
- SYS-XXX (System Management)
- CROSS-XXX (Cross-cutting)
- ERR-XXX (Error scenarios)
- A11Y-XXX (Accessibility)
- RESP-XXX (Responsive design)

### Section 4 — Test Scenarios by Module

For EACH scenario provide:
- **Scenario ID** and title
- **Priority:** 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
- **Use Case reference** (from diagram)
- **Actor** (which role performs this)
- **Preconditions**
- **Test Steps** (table: Step | Action | Expected Result)
- **Postconditions**
- **Test Data** (JSON if needed)

Cover ALL of the following areas — generate as many distinct scenarios as
possible, varying flows, edge cases, and role combinations:

**4.01 Authentication (AUTH)**
- Successful login for all four role types
- Invalid credentials (wrong password, invalid email format, non-existent user)
- Empty fields / partially filled form
- Session expiration and auto-logout after 30 min inactivity (NFR12)
- 5 failed login attempts → temporary lockout (NFR22 security spec)
- Logout and protected route redirect
- Password recovery flow
- JWT token refresh
- Direct URL access without authentication

**4.02 Dashboard (DASH)**
- Initial load with correct stats per role
- Quick navigation to tournaments / matches / notifications
- Role-based action visibility (e.g. "New Tournament" button only for admins)
- Real-time stat update when result is entered elsewhere

**4.03 Tournament Management (TOURN)**
- Create tournament (all required fields, validation, date constraints)
- Create tournament with courts configuration (FR5)
- Configure tournament rules / tiebreak criteria (FR8, FR42)
- Support for singles and doubles (FR7)
- Edit tournament details (admin of that tournament only)
- Client / public cannot edit
- Finalize tournament (FR6) — happy path and with pending matches blocked
- Multiple simultaneous tournaments visible and independent (FR2)
- Tournament status transitions: DRAFT → REGISTRATION_OPEN → IN_PROGRESS → FINALIZED
- Assign multiple administrators (SysAdmin use case)

**4.04 Participant Registration (REG)**
- Self-registration by participant — quota available (FR9)
- Self-registration — quota full → placed on waiting list (ALT state, FR12)
- Manual enrollment by administrator (FR10)
- 9 entry state assignment and display: OA, DA, SE, JE, QU, LL, WC, ALT, WD (FR11)
- Withdrawal before draw → next ALT enters (FR13)
- Withdrawal after draw → ALT becomes LL (FR13)
- Withdrawal during tournament → next match becomes WO (FR13)
- Doubles pair registration (FR15)
- Registration validation (ranking, category, duplicate)
- Reserved spots (WC/OA/SE/JE) management

**4.05 Draw Management (DRAW)**
- Generate Round Robin draw (FR16) — even and odd participant counts
- Generate Knockout draw with seeds and Byes (FR17)
- Generate Match Play draw (FR18)
- Seeding system — correct strategic placement (FR19)
- Modify draw after generation (FR20)
- Migrate results to new bracket (FR20)
- Link phases: qualifying → main → consolation (FR4, FR21)
- Consolation draws — simple, multiple, Compass (FR22)
- Balance Round Robin groups (snake distribution)
- Public / participant can view but not modify

**4.06 Match & Result Management (MATCH)**
- All 12 match states displayed correctly: TBP, IP, SUS, CO, RET, WO, ABN,
  BYE, NP, CAN, DEF, DR (FR23)
- Participant enters result (sets + games + state) — happy path (FR24)
- Result pending confirmation — opponent notified (FR25)
- Opponent confirms result → standings update (FR25, FR43)
- Opponent disputes result → admin notified (FR26)
- Admin validates disputed result (FR26)
- Admin modifies result — no confirmation needed (FR27)
- Configurable match formats: 2+supertiebreak, 3 sets, 4-game, 6-game (FR28)
- Court and schedule assignment to match (FR29)
- Match suspension (SUS) — score saved (FR30)
- Match resumption from saved score (FR30)
- Ball provider field recorded (FR31)
- Optional player comments (FR32)
- Valid state transition enforcement (invalid transitions blocked)

**4.07 Order of Play (OOP)**
- Admin generates order of play — assisted (FR33)
- Admin generates order of play — manual drag-and-drop (FR33)
- Order published at least 24h before (FR34)
- Participant availability adaptation (FR35)
- Delay management: grace period, reassignment, DEF (FR36)
- Real-time court reassignment (FR37)
- Order update notifications to affected parties (FR38)
- Public can view published order
- Reschedule single match
- Order of play format display (court, time, match)

**4.08 Standings & Statistics (STAND)**
- Point-based standings: 3-1-0, 2-1-0, configurable (FR39)
- Ratio-based standings with WO exclusion option (FR40)
- ELO scoring — more points for beating higher-ranked opponent (FR41)
- Tiebreak criteria applied sequentially (FR42):
  Set ratio → Game ratio → Set/game difference → Head-to-head →
  Draw ranking → Random
- Standings auto-update on result confirmation (FR43)
- Global ranking display (FR44)
- Personal statistics page — match/set/game win%, streaks, history (FR45)
- Tournament statistics overview (FR46)
- Head-to-head history between two players
- View points classification and ratio classification separately

**4.09 Announcements (ANN)**
- Admin creates public announcement (FR47)
- Admin creates private announcement (FR47)
- Tag system — assign tags, filter by tag (FR48)
- Schedule announcement for future publication (FR49)
- Expiration date — announcement hidden after expiry (FR49)
- Link announcement to tournament (FR50)
- Edit and delete announcement (FR51)
- Pinned announcement displayed prominently
- Participant sees private announcements, public user does not
- Announcement view counter increments

**4.10 Notifications (NOTIF)**
- In-app notification badge count (FR56)
- Notification list with timestamps and grouping (FR57)
- Mark single notification as read
- Mark all as read
- Notification types: result recorded, confirmation pending, order published,
  order changed, new announcement (FR52)
- Admin receives: new registration, withdrawal, result, dispute (FR53)
- Navigate to related entity from notification
- Configure channels: in-app, email, Telegram, web push (FR54, FR55)
- Configure event types and frequency (FR55)
- Telegram channel: max 1 notification per 5 min per tournament (spec §15.2)

**4.11 Privacy & Profile (PRIV)**
- Configure field-level visibility: email, phone, Telegram, WhatsApp, avatar,
  age/category, ranking, history (FR58)
- Four visibility levels: only admins / same tournament / all registered /
  public (FR58)
- Admin always sees full profile regardless of settings (FR59)
- Same-tournament participant sees according to "same tournament" setting (FR59)
- Stranger (different tournament) sees only "all registered" data (FR59)
- Public sees only "general public" data (FR60)
- Update profile fields (name, ranking, avatar, contact data — FR14)
- GDPR: download own data as JSON/PDF
- GDPR: request account deletion (data anonymised, history preserved)

**4.12 Global Ranking (RANK)**
- View global ranking list (all registered players, sorted by points)
- Points-based and ELO ranking modes
- Ranking updates after tournament result recorded
- SysAdmin imports external ranking
- Seeds calculated from global ranking when generating bracket

**4.13 Export & Documents (EXP)**
- Export results to ITF CSV format (FR61)
- Export to TODS format (FR62)
- Export statistics to PDF (FR63)
- Export statistics to Excel (FR63)
- Export bracket as printable view (public use case)
- Print bracket
- Generate tournament documents / certificates (optional feature)

**4.14 Incident Management (INC)**
- Record dispute on a match result
- Apply sanction: WARNING, POINT_DEDUCTION, EXCLUSION
- Sanction notification sent to affected participant
- Replay match ordered by admin
- Cancel match with reason
- Sanction logs visible to SysAdmin

**4.15 Communication (COMM)**
- Participant sends chat message in tournament context
- Real-time message reception without page refresh
- Admin moderates chat (delete message, mute participant)
- Admin sends group message to all tournament participants
- Chat unavailable to public users

**4.16 System Management (SYS)**
- SysAdmin creates full backup
- SysAdmin restores from backup
- Backup page inaccessible to non-SysAdmin
- SysAdmin monitors system performance
- SysAdmin manages user accounts (create, edit, delete, assign roles)
- SysAdmin customizes visual identity (colors, logo)
- SysAdmin assigns tournament administrators

### Section 5 — Cross-Cutting Scenarios (CROSS)

- Navigation via sidebar / top nav — all links correct per role
- Sidebar collapse/expand state persisted across navigation
- Loading states and skeleton screens during data fetch
- Toast notifications: success, error, warning, auto-dismiss
- Confirmation dialogs on destructive actions
- Session timeout warning and graceful redirect
- Real-time updates via WebSocket (standings, order, chat)
- PWA offline mode: previously loaded data accessible (NFR8)
- Dark/light theme toggle (optional feature — mark if not implemented)
- Multi-language switching (optional — mark if not implemented)

### Section 6 — Edge Cases and Error Scenarios (ERR)

- Network failure during critical action (result submission, payment)
- 404 for non-existent tournament / match / user
- Permission denied (403) on admin-only action by participant
- Duplicate registration attempt
- Draw generation with 0 or 1 participant
- Result entry with invalid set scores (more games than possible)
- Concurrent bracket modification conflict
- Notification channel not configured — graceful degradation
- File upload size > 10MB (NFR security spec)
- XSS attempt in text fields (input sanitization)

### Section 7 — Accessibility (A11Y)

- Keyboard navigation through login, dashboard, tournament detail
- Tab order logical within bracket view and order of play grid
- Escape closes modals; focus returns to trigger
- ARIA labels on interactive elements (NFR accessibility)
- Axe audit on: login, dashboard, tournament detail, bracket, standings
- Screen reader landmarks present (main, nav, aside)
- Focus visible on all interactive elements (WCAG AA contrast)

### Section 8 — Responsive Design (RESP)

- Mobile (375×667): login, dashboard, tournament list, bracket view
- Mobile: sidebar hidden, hamburger menu opens it
- Tablet (768×1024): 2-column grids, sidebar visible as icon rail
- Desktop (1280×720): full sidebar, multi-column layouts
- Bracket diagram scrollable horizontally on small screens
- Order of play table readable on mobile

### Section 9 — Test Data Requirements

Provide a complete seed script object covering:
- 7 test users (roles above)
- 5 test tournaments (states above) with complete configuration
- At least 8 participants distributed across tournaments
- Draws for IN_PROGRESS tournaments with matches in various states
- Standings records
- At least 5 announcements (mix of public/private/scheduled/expired)
- Notifications in various read/unread states
- Global ranking entries for all participants

### Section 10 — Execution Priority Matrix

| Priority | Description | CI Trigger |
|----------|-------------|------------|
| 🔴 Critical | Auth, tournament CRUD, draw gen, result entry | Every PR |
| 🟠 High | Registration flow, standings, OOP, notifications | Daily |
| 🟡 Medium | Announcements, privacy, ranking, export | Nightly |
| 🟢 Low | Edge cases, accessibility, responsive | Weekly / Release |

Test suite folder structure:
```
e2e/
├── critical/        auth, tournament-crud, draw-generation,
│                    result-management, order-of-play
├── high/            registration, standings, notifications,
│                    bracket-visualization
├── medium/          announcements, privacy, ranking, export,
│                    incidents, communication
└── low/             edge-cases, accessibility, responsive
```

---

## INSTRUCTIONS FOR THE AGENT

1. **First scan** `/projects/5-TennisTournamentManager/src/presentation/` to
   discover all implemented Angular components, routes, and `data-testid`
   attributes already present in templates. Adjust scenarios to actual UI.
2. **Map every use case** from the diagram to a route and a component.
   If a use case has no corresponding component, mark it
   `[PENDING IMPLEMENTATION]` but still define its scenario.
3. **Generate as many distinct scenarios as possible** — vary flows,
   boundary conditions, and role combinations extensively.
4. **Negative and permission scenarios** are mandatory for every module.
5. **Use the exact scenario ID prefixes** defined in Section 3.
6. **Fill in the Document Summary** at the end:
   - Total use cases mapped
   - Total scenarios defined
   - Modules covered
   - Roles tested
   - Viewport configurations

---

## OUTPUT LOCATION

Save the document to:
`/projects/5-TennisTournamentManager/docs/testing/E2E_TEST_SCENARIOS.md`
