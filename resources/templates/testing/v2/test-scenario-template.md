# E2E TEST PLANNING - USE CASE ANALYSIS AND SCENARIO DEFINITION

## OBJECTIVE
You are a Senior QA Engineer Agent specialized in End-to-End testing with Playwright. Your task is to analyze the **Cartographic Project Manager (CPM)** application, review the existing use case diagrams from the design phase, and generate a comprehensive document defining all test scenarios that must be covered.

## PROJECT CONTEXT

**Project:** Cartographic Project Manager (CPM)
**Description:** A web and mobile application for managing cartographic projects with administrator-client collaboration, task management (5 states), internal messaging with file attachments, calendar view, and Dropbox integration.

**Tech Stack:**
- Frontend: TypeScript 5.x, Vue.js 3, Vite, Pinia, Vue Router
- Real-time: Socket.io
- Testing Framework: Playwright
- Authentication: JWT-based

**User Roles:**
1. **Administrator (ADMINISTRATOR):** Professional cartographer who manages all projects
2. **Client (CLIENT):** Project clients who can view their projects, manage assigned tasks, send messages
3. **Special User (SPECIAL_USER):** Users with extended permissions on specific projects

## INPUT ARTIFACTS TO ANALYZE

### 1. Use Case Diagram (Design Phase)
Location: `docs/design/use_case_diagram.md` or equivalent
Also you can check the specifications file at `docs/design/specification.md`

### 2. Application Routes
```typescript
// Routes to test
/login                    - Authentication
/                         - Dashboard
/projects                 - Project list
/projects/:id             - Project details (tabs: Overview, Tasks, Messages, Files)
/calendar                 - Calendar view
/notifications            - Notifications list
/backup                   - Backup & Export (Admin only)
...
```

### 3. Application Views and Components

Check the #codebase to find all Views and Key Components

### 4. Core Functionalities
1. **Authentication:** Login, logout, session management
2. **Project Management:** Create, read, update, delete, finalize projects
3. **Task Management:** Create, assign, status transitions (5 states), confirm/reject
4. **Messaging:** Send messages, attach files, real-time updates, mark as read
5. **File Management:** Upload, download, preview, delete files by section
6. **Notifications:** View, mark as read, navigate to related entity
7. **Calendar:** View delivery dates, navigate months, click to project
8. **Backup (Admin):** Create backups, export data, Dropbox sync

## YOUR TASK

1. **Analyze the existing use case diagram** from the design phase
2. **Map use cases to the implemented views and components**
3. **Identify all user interactions** that need to be tested
4. **Define detailed test scenarios** for each use case
5. **Prioritize scenarios** based on criticality and user frequency
6. **Document preconditions, steps, and expected results**

## OUTPUT FORMAT

Generate the test scenario document and save it to:
`docs/testing/E2E_TEST_SCENARIOS.md`

```markdown
# E2E TEST SCENARIOS
## Cartographic Project Manager (CPM)

**Document Version:** 1.0
**Created:** [DATE]
**Author:** QA Engineer Agent
**Testing Framework:** Playwright
**Target Coverage:** [X]% of user interactions

---

## TABLE OF CONTENTS

1. [Test Environment Setup](#test-environment-setup)
2. [User Roles and Test Accounts](#user-roles-and-test-accounts)
3. [Use Case to Scenario Mapping](#use-case-to-scenario-mapping)
4. [Test Scenarios by Module](#test-scenarios-by-module)
   - 4.1 [Authentication Module](#41-authentication-module)
   - 4.2 [Dashboard Module](#42-dashboard-module)
   - 4.3 [Project Management Module](#43-project-management-module)
   - 4.4 [Task Management Module](#44-task-management-module)
   - 4.5 [Messaging Module](#45-messaging-module)
   - 4.6 [File Management Module](#46-file-management-module)
   - 4.7 [Notification Module](#47-notification-module)
   - 4.8 [Calendar Module](#48-calendar-module)
   - 4.9 [Backup Module (Admin)](#49-backup-module-admin)
5. [Cross-Cutting Scenarios](#cross-cutting-scenarios)
6. [Edge Cases and Error Scenarios](#edge-cases-and-error-scenarios)
7. [Accessibility Scenarios](#accessibility-scenarios)
8. [Responsive Design Scenarios](#responsive-design-scenarios)
9. [Test Data Requirements](#test-data-requirements)
10. [Execution Priority Matrix](#execution-priority-matrix)

---

## 1. TEST ENVIRONMENT SETUP

### Required Configuration
```typescript
// playwright.config.ts base configuration
{
  baseURL: 'http://localhost:5173',
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
  ],
}
```

### Test Database Seeding
- Clean database before each test suite
- Seed with predefined test data
- Isolate tests to prevent side effects

---

## 2. USER ROLES AND TEST ACCOUNTS

### Test Users
| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Administrator | admin@test.com | admin123 | Full access |
| Client 1 | client1@test.com | client123 | Own projects only |
| Client 2 | client2@test.com | client123 | Own projects only |
| Special User | special@test.com | client123 | Extended on assigned projects |

### Test Projects
| Code | Name | Client | Status | Purpose |
|------|------|--------|--------|---------|
| CART-2024-001 | Test Project Active | Client 1 | ACTIVE | General testing |
| CART-2024-002 | Test Project Progress | Client 1 | IN_PROGRESS | Task flow testing |
| CART-2024-003 | Test Project Review | Client 2 | PENDING_REVIEW | Review state testing |
| CART-2024-004 | Test Project Finalized | Client 2 | FINALIZED | Read-only testing |
| CART-2024-005 | Test Project Overdue | Client 1 | ACTIVE | Overdue scenario testing |

(if non-existent, you can configure your own test users and projects)

---

## 3. USE CASE TO SCENARIO MAPPING

### Original Use Cases Example (from Design Phase)

| UC ID | Use Case Name | Actor(s) | Mapped Scenarios |
|-------|---------------|----------|------------------|
| UC-01 | Login to System | All Users | AUTH-001 to AUTH-005 |
| UC-02 | Logout from System | All Users | AUTH-006 |
| UC-03 | View Dashboard | All Users | DASH-001 to DASH-005 |
| UC-04 | Create Project | Administrator | PROJ-001 to PROJ-003 |
| UC-05 | View Project List | All Users | PROJ-004 to PROJ-007 |
| UC-06 | View Project Details | All Users | PROJ-008 to PROJ-012 |
| UC-07 | Edit Project | Administrator | PROJ-013 to PROJ-015 |
| UC-08 | Delete Project | Administrator | PROJ-016 to PROJ-018 |
| UC-09 | Finalize Project | Administrator | PROJ-019 to PROJ-021 |
| UC-10 | Create Task | Admin/Client | TASK-001 to TASK-004 |
| UC-11 | View Task List | All Users | TASK-005 to TASK-008 |
| UC-12 | Update Task Status | Assignee | TASK-009 to TASK-018 |
| UC-13 | Confirm Task | Administrator | TASK-019 to TASK-022 |
| UC-14 | Reject Task | Administrator | TASK-023 to TASK-025 |
| UC-15 | Send Message | All Users | MSG-001 to MSG-005 |
| UC-16 | View Messages | All Users | MSG-006 to MSG-010 |
| UC-17 | Attach File to Message | All Users | MSG-011 to MSG-014 |
| UC-18 | Upload File | All Users | FILE-001 to FILE-006 |
| UC-19 | Download File | All Users | FILE-007 to FILE-009 |
| UC-20 | Delete File | Admin/Uploader | FILE-010 to FILE-012 |
| UC-21 | View Notifications | All Users | NOTIF-001 to NOTIF-005 |
| UC-22 | Mark Notification Read | All Users | NOTIF-006 to NOTIF-008 |
| UC-23 | View Calendar | All Users | CAL-001 to CAL-006 |
| UC-24 | Create Backup | Administrator | BACK-001 to BACK-004 |
| UC-25 | Export Data | Administrator | BACK-005 to BACK-007 |

Apart from these cases, you have to create more complex cases to fully test the application flow.

---

# OUTPUT EXPECTED 

## 4. TEST SCENARIOS BY MODULE (EXAMPLE)

### 4.1 AUTHENTICATION MODULE

#### AUTH-001: Successful Login with Valid Credentials
**Priority:** 🔴 Critical
**Use Case:** UC-01
**Actor:** All Users

**Preconditions:**
- User is not logged in
- Valid test user exists in database
- Application is accessible

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page is displayed with email and password fields |
| 2 | Enter valid email `admin@test.com` | Email field accepts input |
| 3 | Enter valid password `AdminPass123!` | Password field accepts input (masked) |
| 4 | Click "Sign In" button | Loading indicator appears |
| 5 | Wait for redirect | User is redirected to Dashboard `/` |
| 6 | Verify header | User name and avatar are displayed in header |

**Postconditions:**
- User session is active
- JWT token is stored
- WebSocket connection is established

**Test Data:**
```json
{
  "email": "admin@test.com",
  "password": "AdminPass123!"
}
```

---

#### AUTH-002: Login with Invalid Email Format
**Priority:** 🟠 High
**Use Case:** UC-01
**Actor:** All Users

**Preconditions:**
- User is not logged in

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page is displayed |
| 2 | Enter invalid email `invalid-email` | Email field accepts input |
| 3 | Enter any password | Password field accepts input |
| 4 | Click "Sign In" button | Validation error displayed: "Invalid email format" |
| 5 | Verify no redirect | User remains on login page |

**Postconditions:**
- No session created
- No API call made (client-side validation)

---

#### AUTH-003: Login with Wrong Password
**Priority:** 🟠 High
**Use Case:** UC-01
**Actor:** All Users

**Preconditions:**
- User is not logged in
- Valid user exists

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page is displayed |
| 2 | Enter valid email `admin@test.com` | Email accepted |
| 3 | Enter wrong password `WrongPass123!` | Password accepted |
| 4 | Click "Sign In" button | Loading indicator, then error message |
| 5 | Verify error message | "Invalid email or password" displayed |
| 6 | Verify no redirect | User remains on login page |

**Postconditions:**
- No session created
- Password field may be cleared

---

#### AUTH-004: Login with Empty Fields
**Priority:** 🟡 Medium
**Use Case:** UC-01
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page displayed |
| 2 | Leave email empty | - |
| 3 | Leave password empty | - |
| 4 | Click "Sign In" button | Button is disabled OR validation errors shown |

---

#### AUTH-005: Login with "Remember Me" Option
**Priority:** 🟡 Medium
**Use Case:** UC-01
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page displayed |
| 2 | Enter valid credentials | Fields populated |
| 3 | Check "Remember me" checkbox | Checkbox is checked |
| 4 | Click "Sign In" | Login successful |
| 5 | Close browser completely | - |
| 6 | Reopen browser and navigate to app | User is still logged in |

---

#### AUTH-006: Logout
**Priority:** 🔴 Critical
**Use Case:** UC-02
**Actor:** All Users

**Preconditions:**
- User is logged in

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click user menu in header | Dropdown menu appears |
| 2 | Click "Logout" option | Confirmation may appear |
| 3 | Confirm logout (if prompted) | - |
| 4 | Verify redirect | User redirected to `/login` |
| 5 | Try to navigate to `/` | Redirected back to `/login` |

**Postconditions:**
- Session destroyed
- Token removed
- WebSocket disconnected

---

#### AUTH-007: Session Expiration Handling
**Priority:** 🟠 High
**Use Case:** UC-01 (extension)
**Actor:** All Users

**Preconditions:**
- User is logged in
- Session has short expiry for testing

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login successfully | Dashboard displayed |
| 2 | Wait for session to expire | - |
| 3 | Perform any action (click, navigate) | Redirect to login with message |
| 4 | Verify message | "Session expired. Please log in again." |

---

#### AUTH-008: Protected Route Access Without Authentication
**Priority:** 🔴 Critical
**Use Case:** UC-01 (security)
**Actor:** Unauthenticated User

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Clear all cookies/storage | Clean state |
| 2 | Navigate directly to `/projects` | Redirected to `/login` |
| 3 | Navigate directly to `/calendar` | Redirected to `/login` |
| 4 | Navigate directly to `/backup` | Redirected to `/login` |

---

### 4.2 DASHBOARD MODULE

#### DASH-001: Dashboard Initial Load
**Priority:** 🔴 Critical
**Use Case:** UC-03
**Actor:** All Users

**Preconditions:**
- User is logged in

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/` or click Dashboard | Dashboard view loads |
| 2 | Verify welcome message | "Welcome back, [Username]!" displayed |
| 3 | Verify stats cards | 4 stat cards visible (Projects, Tasks, Messages, Overdue) |
| 4 | Verify recent projects section | Section header and projects displayed |
| 5 | Verify upcoming deadlines section | Deadlines list or empty state |
| 6 | Verify mini calendar | Calendar widget visible |
| 7 | Verify notifications preview | Recent activity section visible |

---

#### DASH-002: Dashboard Stats Accuracy
**Priority:** 🟠 High
**Use Case:** UC-03
**Actor:** All Users

**Preconditions:**
- User logged in with known data state

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard | Stats cards displayed |
| 2 | Verify "Total Projects" count | Matches expected count from test data |
| 3 | Verify "Pending Tasks" count | Matches sum of user's pending tasks |
| 4 | Verify "Unread Messages" count | Matches actual unread count |
| 5 | Verify "Overdue Projects" count | Matches projects past delivery date |

---

#### DASH-003: Quick Action - New Project (Admin)
**Priority:** 🟠 High
**Use Case:** UC-03, UC-04
**Actor:** Administrator

**Preconditions:**
- Logged in as Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard | Dashboard displayed |
| 2 | Verify "New Project" button visible | Button present for admin |
| 3 | Click "New Project" | Project creation modal opens |
| 4 | Verify modal contains form | All project fields visible |

---

#### DASH-004: Quick Action Hidden for Client
**Priority:** 🟡 Medium
**Use Case:** UC-03
**Actor:** Client

**Preconditions:**
- Logged in as Client

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard | Dashboard displayed |
| 2 | Look for "New Project" button | Button NOT visible |

---

#### DASH-005: Dashboard Recent Projects Navigation
**Priority:** 🟡 Medium
**Use Case:** UC-03, UC-06
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard | Recent projects displayed |
| 2 | Click on a project card | Navigated to `/projects/:id` |
| 3 | Verify correct project loaded | Project details match clicked card |

---

### 4.3 PROJECT MANAGEMENT MODULE

#### PROJ-001: Create Project - Happy Path (Admin)
**Priority:** 🔴 Critical
**Use Case:** UC-04
**Actor:** Administrator

**Preconditions:**
- Logged in as Administrator
- At least one client exists

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/projects` | Project list displayed |
| 2 | Click "New Project" button | Project form modal opens |
| 3 | Verify code is auto-generated | Code field has format CART-YYYY-NNN |
| 4 | Select client from dropdown | Client selected |
| 5 | Enter project name "E2E Test Project" | Name accepted |
| 6 | Select project type "RESIDENTIAL" | Type selected |
| 7 | Set contract date to today | Date accepted |
| 8 | Set delivery date to 30 days ahead | Date accepted |
| 9 | Optionally enter coordinates | Coordinates accepted |
| 10 | Click "Create Project" | Loading indicator shown |
| 11 | Verify success | Modal closes, toast "Project created", project in list |

**Postconditions:**
- New project exists in database
- Project appears in list
- User can navigate to project details

**Test Data:**
```json
{
  "name": "E2E Test Project",
  "type": "RESIDENTIAL",
  "contractDate": "2024-01-15",
  "deliveryDate": "2024-02-15",
  "longitude": -15.4134,
  "latitude": 28.0997
}
```

---

#### PROJ-002: Create Project - Validation Errors
**Priority:** 🟠 High
**Use Case:** UC-04
**Actor:** Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open project creation form | Form displayed |
| 2 | Leave name empty, try to submit | Validation error on name field |
| 3 | Enter name, leave client unselected | Validation error on client |
| 4 | Set delivery date before contract date | Validation error on delivery date |
| 5 | Enter invalid longitude (>180) | Validation error on longitude |
| 6 | Enter invalid latitude (>90) | Validation error on latitude |

---

#### PROJ-003: Create Project - Duplicate Code Handling
**Priority:** 🟡 Medium
**Use Case:** UC-04
**Actor:** Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note existing project code | - |
| 2 | Try to create project with same code | Error message displayed |
| 3 | Verify helpful message | Suggests generating new code |

---

#### PROJ-004: View Project List - All Projects (Admin)
**Priority:** 🔴 Critical
**Use Case:** UC-05
**Actor:** Administrator

**Preconditions:**
- Multiple test projects exist
- Logged in as Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/projects` | Project list loads |
| 2 | Verify all test projects visible | All 5 test projects displayed |
| 3 | Verify project card information | Code, name, client, status, delivery date shown |
| 4 | Verify status colors | Colors match project status |

---

#### PROJ-005: View Project List - Own Projects Only (Client)
**Priority:** 🔴 Critical
**Use Case:** UC-05
**Actor:** Client

**Preconditions:**
- Logged in as Client 1 (has 3 projects)

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/projects` | Project list loads |
| 2 | Count visible projects | Only 3 projects (Client 1's projects) |
| 3 | Verify no other client's projects | Client 2's projects NOT visible |

---

#### PROJ-006: Project List - Search Functionality
**Priority:** 🟠 High
**Use Case:** UC-05
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load project list | All accessible projects shown |
| 2 | Enter search term "Active" | List filters to matching projects |
| 3 | Clear search | All projects shown again |
| 4 | Search by project code "CART-2024-001" | Single project shown |
| 5 | Search non-existent term "XXXXXX" | Empty state displayed |

---

#### PROJ-007: Project List - Filter by Status
**Priority:** 🟠 High
**Use Case:** UC-05
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load project list | All projects shown |
| 2 | Select status filter "Active" | Only ACTIVE projects shown |
| 3 | Select status filter "Finalized" | Only FINALIZED projects shown |
| 4 | Clear filter | All projects shown |

---

#### PROJ-008: View Project Details - Overview Tab
**Priority:** 🔴 Critical
**Use Case:** UC-06
**Actor:** All Users

**Preconditions:**
- Test project exists

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/projects/:id` | Project details load |
| 2 | Verify project header | Code, name, status badge displayed |
| 3 | Verify overview tab active | Overview tab highlighted |
| 4 | Verify project summary | All project info displayed correctly |
| 5 | Verify stats cards | Tasks, messages, dates, participants shown |

---

#### PROJ-009: View Project Details - Tasks Tab
**Priority:** 🔴 Critical
**Use Case:** UC-06, UC-11
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project details | Project loads |
| 2 | Click "Tasks" tab | Tasks tab content displayed |
| 3 | Verify task list | Tasks for this project shown |
| 4 | Verify task cards | Status, priority, assignee visible |

---

#### PROJ-010: View Project Details - Messages Tab
**Priority:** 🔴 Critical
**Use Case:** UC-06, UC-16
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project details | Project loads |
| 2 | Click "Messages" tab | Messages tab content displayed |
| 3 | Verify message list | Project messages shown chronologically |
| 4 | Verify message input | Input field and send button visible |

---

#### PROJ-011: View Project Details - Files Tab
**Priority:** 🟠 High
**Use Case:** UC-06
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project details | Project loads |
| 2 | Click "Files" tab | Files tab content displayed |
| 3 | Verify file list | Project files shown by section |
| 4 | Verify upload button | Upload functionality available |

---

#### PROJ-012: View Finalized Project - Read Only
**Priority:** 🟠 High
**Use Case:** UC-06
**Actor:** All Users

**Preconditions:**
- FINALIZED project exists

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to finalized project | Project loads |
| 2 | Verify edit button hidden/disabled | Cannot edit project |
| 3 | Verify task creation disabled | Cannot add new tasks |
| 4 | Verify messaging still works | Can still send messages |

---

#### PROJ-013: Edit Project - Happy Path (Admin)
**Priority:** 🟠 High
**Use Case:** UC-07
**Actor:** Administrator

**Preconditions:**
- ACTIVE project exists
- Logged in as Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project details | Project loads |
| 2 | Click "Edit" button | Edit form modal opens |
| 3 | Verify pre-filled values | Current values in form |
| 4 | Change project name | Name updated in field |
| 5 | Change delivery date | Date updated |
| 6 | Click "Save Changes" | Loading, then success |
| 7 | Verify changes persisted | Updated values displayed |

---

#### PROJ-014: Edit Project - Client Cannot Edit
**Priority:** 🟠 High
**Use Case:** UC-07 (negative)
**Actor:** Client

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Client | - |
| 2 | Navigate to own project | Project loads |
| 3 | Look for "Edit" button | Button NOT visible |

---

#### PROJ-015: Edit Project - Validation on Edit
**Priority:** 🟡 Medium
**Use Case:** UC-07
**Actor:** Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open edit form | Form displayed |
| 2 | Clear required field (name) | - |
| 3 | Try to save | Validation error displayed |

---

#### PROJ-016: Delete Project - With Confirmation (Admin)
**Priority:** 🔴 Critical
**Use Case:** UC-08
**Actor:** Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project list | List displayed |
| 2 | Click delete action on project | Confirmation dialog appears |
| 3 | Verify warning message | Clear warning about deletion |
| 4 | Click "Cancel" | Dialog closes, project still exists |
| 5 | Click delete again | Confirmation appears |
| 6 | Click "Delete" to confirm | Project deleted, removed from list |

---

#### PROJ-017: Delete Project - Client Cannot Delete
**Priority:** 🟠 High
**Use Case:** UC-08 (negative)
**Actor:** Client

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Client | - |
| 2 | Navigate to project list | Projects shown |
| 3 | Look for delete action | Delete NOT available |

---

#### PROJ-018: Delete Project - Cannot Delete Finalized
**Priority:** 🟡 Medium
**Use Case:** UC-08 (constraint)
**Actor:** Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to finalized project | Project loads |
| 2 | Look for delete option | Delete disabled or hidden |

---

#### PROJ-019: Finalize Project - Happy Path
**Priority:** 🔴 Critical
**Use Case:** UC-09
**Actor:** Administrator

**Preconditions:**
- Project with all tasks COMPLETED

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project with all tasks done | Project loads |
| 2 | Click "Finalize Project" button | Confirmation dialog |
| 3 | Confirm finalization | Project status changes to FINALIZED |
| 4 | Verify status badge | Shows "Finalized" |
| 5 | Verify edit disabled | Cannot modify project |

---

#### PROJ-020: Finalize Project - Cannot with Pending Tasks
**Priority:** 🟠 High
**Use Case:** UC-09 (constraint)
**Actor:** Administrator

**Preconditions:**
- Project with pending tasks

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project with pending tasks | Project loads |
| 2 | Check "Finalize" button | Button disabled |
| 3 | Verify tooltip/message | "Cannot finalize: X pending tasks" |

---

### 4.4 TASK MANAGEMENT MODULE

#### TASK-001: Create Task - Happy Path
**Priority:** 🔴 Critical
**Use Case:** UC-10
**Actor:** Administrator, Client (on own project)

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project tasks tab | Tasks displayed |
| 2 | Click "Create Task" | Task form opens |
| 3 | Enter description | Text accepted |
| 4 | Select assignee | Assignee selected |
| 5 | Select priority "HIGH" | Priority set |
| 6 | Set due date | Date set |
| 7 | Click "Create" | Task created, appears in list |

---

#### TASK-005: View Task List - Grouped by Status
**Priority:** 🟠 High
**Use Case:** UC-11
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to tasks tab | Tasks displayed |
| 2 | Toggle to grouped view | Tasks grouped by status |
| 3 | Verify 5 status columns | PENDING, IN_PROGRESS, PARTIAL, PERFORMED, COMPLETED |
| 4 | Verify tasks in correct columns | Task status matches column |

---

#### TASK-009: Task Status Transition - PENDING to IN_PROGRESS
**Priority:** 🔴 Critical
**Use Case:** UC-12
**Actor:** Task Assignee

**Preconditions:**
- Task in PENDING status
- User is task assignee

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find PENDING task | Task displayed |
| 2 | Click status change button | Options displayed |
| 3 | Select "IN_PROGRESS" | Confirmation may appear |
| 4 | Confirm change | Status updated |
| 5 | Verify new status | Badge shows "In Progress" |

---

#### TASK-010: Task Status Transition - IN_PROGRESS to PERFORMED
**Priority:** 🔴 Critical
**Use Case:** UC-12
**Actor:** Task Assignee

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find IN_PROGRESS task | Task displayed |
| 2 | Change status to PERFORMED | Status updated |
| 3 | Verify notification sent | Admin receives notification |

---

#### TASK-019: Confirm Task - Admin Approves
**Priority:** 🔴 Critical
**Use Case:** UC-13
**Actor:** Administrator

**Preconditions:**
- Task in PERFORMED status

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Admin | - |
| 2 | Find PERFORMED task | Task displayed |
| 3 | Click "Confirm" action | Confirmation form may open |
| 4 | Add optional feedback | Feedback entered |
| 5 | Submit confirmation | Task status → COMPLETED |
| 6 | Verify notification | Assignee receives notification |

---

#### TASK-023: Reject Task - Admin Rejects
**Priority:** 🟠 High
**Use Case:** UC-14
**Actor:** Administrator

**Preconditions:**
- Task in PERFORMED status

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Admin | - |
| 2 | Find PERFORMED task | Task displayed |
| 3 | Click "Reject" action | Rejection form opens |
| 4 | Enter rejection reason (required) | Reason entered |
| 5 | Submit rejection | Task status → PENDING |
| 6 | Verify notification | Assignee notified with reason |

---

### 4.5 MESSAGING MODULE

#### MSG-001: Send Message - Text Only
**Priority:** 🔴 Critical
**Use Case:** UC-15
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project messages | Message list displayed |
| 2 | Type message in input | Text appears |
| 3 | Press Enter or click Send | Message sent |
| 4 | Verify message in list | Own message displayed on right |
| 5 | Verify timestamp | Time shown |

---

#### MSG-002: Send Message - With File Attachment
**Priority:** 🟠 High
**Use Case:** UC-15, UC-17
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open messages | Input visible |
| 2 | Click attachment button | File picker opens |
| 3 | Select file | File preview shown |
| 4 | Type message | Text entered |
| 5 | Send | Message with attachment sent |
| 6 | Verify attachment | File icon/preview in message |

---

#### MSG-006: Real-time Message Reception
**Priority:** 🔴 Critical
**Use Case:** UC-16
**Actor:** All Users

**Preconditions:**
- Two users in same project

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | User A opens project messages | Messages displayed |
| 2 | User B sends message (different browser) | - |
| 3 | Verify User A sees message | New message appears without refresh |
| 4 | Verify "new messages" indicator | If scrolled up, indicator shown |

---

#### MSG-007: Message Auto-scroll
**Priority:** 🟡 Medium
**Use Case:** UC-16
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open messages (many messages) | List displayed |
| 2 | Scroll to bottom | At bottom |
| 3 | New message arrives | Auto-scrolls to show new message |
| 4 | Scroll up to read old | Not at bottom |
| 5 | New message arrives | "New messages" button appears, no auto-scroll |

---

### 4.6 FILE MANAGEMENT MODULE

#### FILE-001: Upload File - Single File
**Priority:** 🔴 Critical
**Use Case:** UC-18
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to files tab | File list displayed |
| 2 | Click "Upload" | Upload modal/area opens |
| 3 | Select section | Section chosen |
| 4 | Select file via picker | File added to queue |
| 5 | Click upload | Progress indicator shown |
| 6 | Wait for completion | Success state |
| 7 | Verify file in list | New file appears in correct section |

---

#### FILE-002: Upload File - Drag and Drop
**Priority:** 🟠 High
**Use Case:** UC-18
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open upload area | Drop zone visible |
| 2 | Drag file over zone | Zone highlights |
| 3 | Drop file | File added to queue |
| 4 | Complete upload | File uploaded successfully |

---

#### FILE-003: Upload File - Multiple Files
**Priority:** 🟠 High
**Use Case:** UC-18
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select multiple files | All files in queue |
| 2 | Verify individual progress | Each file shows progress |
| 3 | Complete upload | All files uploaded |

---

#### FILE-004: Upload File - Size Limit Exceeded
**Priority:** 🟡 Medium
**Use Case:** UC-18 (validation)
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select file > 50MB | File added with error state |
| 2 | Verify error message | "File exceeds 50MB limit" |
| 3 | File not uploadable | Upload button disabled for this file |

---

#### FILE-007: Download File
**Priority:** 🔴 Critical
**Use Case:** UC-19
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to files | Files listed |
| 2 | Click download on file | Download initiates |
| 3 | Verify download | File saved correctly |

---

#### FILE-010: Delete File - Owner Can Delete
**Priority:** 🟠 High
**Use Case:** UC-20
**Actor:** File Uploader, Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find file uploaded by current user | File visible |
| 2 | Click delete | Confirmation dialog |
| 3 | Confirm | File deleted |
| 4 | Verify removed from list | File no longer appears |

---

### 4.7 NOTIFICATION MODULE

#### NOTIF-001: View Notifications List
**Priority:** 🟠 High
**Use Case:** UC-21
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/notifications` | Full notification list |
| 2 | Verify grouping | Grouped by date (Today, Yesterday, etc.) |
| 3 | Verify notification content | Title, message, time shown |
| 4 | Verify unread indicator | Unread notifications highlighted |

---

#### NOTIF-002: Notification Badge in Header
**Priority:** 🟠 High
**Use Case:** UC-21
**Actor:** All Users

**Preconditions:**
- User has unread notifications

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check header | Bell icon with badge count |
| 2 | Click bell icon | Notification dropdown opens |
| 3 | Verify count matches | Badge = actual unread count |

---

#### NOTIF-006: Mark Single Notification as Read
**Priority:** 🟡 Medium
**Use Case:** UC-22
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find unread notification | Highlighted |
| 2 | Click notification | Marked as read, navigates to entity |
| 3 | Return to notifications | No longer highlighted |

---

#### NOTIF-007: Mark All Notifications as Read
**Priority:** 🟡 Medium
**Use Case:** UC-22
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open notifications | Some unread |
| 2 | Click "Mark all as read" | All marked as read |
| 3 | Verify badge | Badge disappears or shows 0 |

---

### 4.8 CALENDAR MODULE

#### CAL-001: View Calendar - Current Month
**Priority:** 🟠 High
**Use Case:** UC-23
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/calendar` | Calendar displayed |
| 2 | Verify current month shown | Month/Year in header |
| 3 | Verify today highlighted | Today's date marked |
| 4 | Verify project indicators | Delivery dates shown |

---

#### CAL-002: Calendar Navigation
**Priority:** 🟡 Medium
**Use Case:** UC-23
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click next month | Next month displayed |
| 2 | Click previous month | Previous month displayed |
| 3 | Click "Today" | Returns to current month |

---

#### CAL-003: Calendar Project Click
**Priority:** 🟠 High
**Use Case:** UC-23, UC-06
**Actor:** All Users

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find date with project | Project indicator visible |
| 2 | Click on project | Day details shown OR navigates to project |
| 3 | Verify correct project | Project info matches |

---

### 4.9 BACKUP MODULE (ADMIN)

#### BACK-001: Access Backup Page - Admin Only
**Priority:** 🔴 Critical
**Use Case:** UC-24 (authorization)
**Actor:** Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as Admin | - |
| 2 | Navigate to `/backup` | Backup page loads |
| 3 | Logout, login as Client | - |
| 4 | Navigate to `/backup` | Redirected to dashboard |

---

#### BACK-002: Create Full Backup
**Priority:** 🟠 High
**Use Case:** UC-24
**Actor:** Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to backup page | Page loads |
| 2 | Select "Full Backup" | Option selected |
| 3 | Click "Create Backup" | Progress indicator |
| 4 | Wait for completion | Success message |
| 5 | Verify in history | New backup in list |

---

#### BACK-005: Export Data as JSON
**Priority:** 🟡 Medium
**Use Case:** UC-25
**Actor:** Administrator

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Export" | Export options shown |
| 2 | Select "JSON" format | Format selected |
| 3 | Click export | Download starts |
| 4 | Verify file | Valid JSON file downloaded |

---

## 5. CROSS-CUTTING SCENARIOS

### CROSS-001: Navigation via Sidebar
**Priority:** 🟠 High

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click each sidebar item | Correct page loads |
| 2 | Verify active state | Current page highlighted |
| 3 | Verify on all pages | Consistent behavior |

---

### CROSS-002: Sidebar Collapse/Expand
**Priority:** 🟡 Medium

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click collapse button | Sidebar collapses |
| 2 | Verify icons only | Only icons visible |
| 3 | Click expand | Sidebar expands |
| 4 | Refresh page | State persisted |

---

### CROSS-003: Toast Notifications Display
**Priority:** 🟡 Medium

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Perform action (create project) | Success toast appears |
| 2 | Verify auto-dismiss | Toast disappears after delay |
| 3 | Trigger error | Error toast with red styling |
| 4 | Click close button | Toast dismisses immediately |

---

### CROSS-004: Loading States
**Priority:** 🟡 Medium

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to data-heavy page | Loading spinner/skeleton shown |
| 2 | Wait for load | Content replaces loading state |
| 3 | Slow network simulation | Extended loading state visible |

---

## 6. EDGE CASES AND ERROR SCENARIOS

### ERROR-001: Network Failure Handling
**Priority:** 🟠 High

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Simulate offline | - |
| 2 | Try to perform action | Error message displayed |
| 3 | Restore connection | Retry option or auto-retry |

---

### ERROR-002: 404 Page Not Found
**Priority:** 🟡 Medium

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/invalid-route` | 404 page displayed |
| 2 | Verify helpful message | "Page not found" with navigation options |
| 3 | Click "Go Home" | Returns to dashboard |

---

### ERROR-003: Project Not Found
**Priority:** 🟡 Medium

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/projects/invalid-id` | Error state |
| 2 | Verify message | "Project not found" |
| 3 | Verify navigation | Can return to project list |

---

### ERROR-004: Concurrent Edit Conflict
**Priority:** 🟡 Medium

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | User A opens project edit | - |
| 2 | User B edits same project | - |
| 3 | User A tries to save | Conflict warning |
| 4 | Verify resolution options | Refresh or force save |

---

## 7. ACCESSIBILITY SCENARIOS

### A11Y-001: Keyboard Navigation
**Priority:** 🟠 High

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tab through login form | Focus moves logically |
| 2 | Tab through sidebar | All items focusable |
| 3 | Enter on focused button | Action triggered |
| 4 | Escape on modal | Modal closes |

---

### A11Y-002: Screen Reader Landmarks
**Priority:** 🟡 Medium

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run accessibility audit | Main landmarks present |
| 2 | Verify ARIA labels | Interactive elements labeled |
| 3 | Verify focus indicators | Visible focus on all interactive elements |

---

## 8. RESPONSIVE DESIGN SCENARIOS

### RESP-001: Mobile Viewport - Login
**Priority:** 🟠 High
**Viewport:** 375x667 (iPhone SE)

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load login on mobile | Properly formatted |
| 2 | Fill form | Inputs usable |
| 3 | Submit | Works correctly |

---

### RESP-002: Mobile Viewport - Sidebar
**Priority:** 🟠 High
**Viewport:** 375x667

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard | Sidebar hidden |
| 2 | Tap hamburger menu | Sidebar slides in |
| 3 | Tap outside sidebar | Sidebar closes |

---

### RESP-003: Tablet Viewport
**Priority:** 🟡 Medium
**Viewport:** 768x1024 (iPad)

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load various pages | Proper tablet layout |
| 2 | Verify grid layouts | Appropriate column counts |

---

## 9. TEST DATA REQUIREMENTS

### Database Seed Script
```typescript
// test-data.seed.ts
{
  users: [
    { email: 'admin@test.com', role: 'ADMINISTRATOR', name: 'Admin User' },
    { email: 'client1@test.com', role: 'CLIENT', name: 'Client One' },
    { email: 'client2@test.com', role: 'CLIENT', name: 'Client Two' },
    { email: 'special@test.com', role: 'SPECIAL_USER', name: 'Special User' },
  ],
  projects: [
    { code: 'CART-2024-001', status: 'ACTIVE', clientEmail: 'client1@test.com' },
    { code: 'CART-2024-002', status: 'IN_PROGRESS', clientEmail: 'client1@test.com' },
    { code: 'CART-2024-003', status: 'PENDING_REVIEW', clientEmail: 'client2@test.com' },
    { code: 'CART-2024-004', status: 'FINALIZED', clientEmail: 'client2@test.com' },
    { code: 'CART-2024-005', status: 'ACTIVE', clientEmail: 'client1@test.com', overdue: true },
  ],
  tasks: [
    { projectCode: 'CART-2024-001', status: 'PENDING', priority: 'HIGH' },
    { projectCode: 'CART-2024-002', status: 'IN_PROGRESS', priority: 'MEDIUM' },
    { projectCode: 'CART-2024-002', status: 'PERFORMED', priority: 'HIGH' },
    { projectCode: 'CART-2024-003', status: 'COMPLETED', priority: 'LOW' },
  ],
  messages: [
    { projectCode: 'CART-2024-001', senderEmail: 'admin@test.com', content: 'Test message 1' },
    { projectCode: 'CART-2024-001', senderEmail: 'client1@test.com', content: 'Test reply' },
  ],
  notifications: [
    { userEmail: 'client1@test.com', type: 'TASK_ASSIGNED', isRead: false },
    { userEmail: 'admin@test.com', type: 'MESSAGE_RECEIVED', isRead: true },
  ],
}
```

---

## 10. EXECUTION PRIORITY MATRIX

### Priority Levels
| Priority | Description | When to Run |
|----------|-------------|-------------|
| 🔴 Critical | Core functionality, blockers | Every build, PR |
| 🟠 High | Important features | Daily, PR |
| 🟡 Medium | Secondary features | Nightly |
| 🟢 Low | Edge cases, polish | Weekly, Release |

### Test Suite Organization
```
e2e/
├── critical/           # Run on every PR
│   ├── auth.spec.ts
│   ├── project-crud.spec.ts
│   ├── task-workflow.spec.ts
│   └── ...
├── high/              # Run daily
│   ├── messaging.spec.ts
│   ├── file-management.spec.ts
│   ├── navigation.spec.ts
│   └── ...
├── medium/            # Run nightly
│   ├── calendar.spec.ts
│   ├── notifications.spec.ts
│   ├── responsive.spec.ts
│   └── ...
└── low/               # Run weekly
    ├── edge-cases.spec.ts
    ├── accessibility.spec.ts
    └── ...
```

---

## DOCUMENT SUMMARY

- **Total Use Cases Mapped:**
- **Total Test Scenarios Defined:**
- **Modules Covered:**
- **User Roles Tested:**
- **Viewport Configurations:**

## INSTRUCTIONS FOR THE AGENT

1. **Start by reading the use case diagram** from the design phase
2. **Map each use case to application routes and components**
3. **Identify all user interactions** in each view
4. **Define as many scenarios as possible with complete detail:**
   - Preconditions
   - Step-by-step actions
   - Expected results
   - Postconditions
   - Test data
5. **Prioritize scenarios** based on business criticality
6. **Consider negative scenarios** (errors, validations, unauthorized access)
7. **Include accessibility and responsive scenarios**
8. **Define test data requirements** for database seeding
9. **Create execution priority matrix** for CI/CD integration

## OUTPUT LOCATION

Save the document to: `docs/testing/E2E_TEST_SCENARIOS.md`

Begin analyzing the use cases and generating the full comprehensive test scenario document now. I want you to generate as many scenarios as possible, variating the actions, the flow, the interactions, etc. Study the structure of the app in as much detail as possible to generate many test scenarios.