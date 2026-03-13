## 1. **Introduction**

The objective of this project is to develop a **web and mobile application for comprehensive management of cartographic projects** that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system will allow detailed tracking of project status, **bidirectional task assignment** between administrator and clients, **internal messaging** associated with each project, and **technical file sharing** through integration with **Dropbox**.

The application will implement a **differentiated role system** (Administrator, Client, Special User) with **customizable permissions**, **automatic notifications** for critical events, and intuitive visualizations through a **main screen** with status indicators and **calendar view** for delivery date management.

---

## 2. **Scope**

The application will allow:

- Managing cartographic projects with organized structure in four sections: Report and Annexes, Plans, Specifications, and Budget.
- Supporting more than 5 simultaneous clients, each with multiple active projects in parallel.
- Implementing three types of roles: Administrator (full control), Client (permissions limited to assigned projects), and Special User (configurable permissions).
- Assigning tasks bidirectionally between administrator and clients with 5 possible states.
- Maintaining individualized messaging per project with support for file attachments.
- Integrating with Dropbox for storage and sharing of technical files (PDF, KML, SHP, images).
- Generating automatic notifications within the application and optionally via WhatsApp.
- Visualizing projects through main screen with color-coded status indicators.
- Displaying joint calendar with delivery dates and visual project status.
- Functioning responsively in desktop browsers, smartphones, and tablets.
- Synchronizing changes in real-time between devices.
- Isolating data so each client only sees their own projects.

Does not include:

- Sub-project or nested project management (flat structure only).
- Integration with storage services other than Dropbox.
- Video conferencing or integrated calls in the application.
- Invoicing or accounting system.
- Human resources or payroll management.
- Cartographic file editing tools within the application.

---

## 3. **Definitions and Abbreviations**

- **Administrator:** User with full control over the application, typically the professional cartographer.
- **Client:** User with permissions limited to projects assigned to them.
- **Special User:** User with customizable permissions configured by the administrator.
- **Project:** Cartographic work unit with organized structure and associated with a client.
- **Task:** Specific activity assigned between users with status, priority, and deadline.
- **Bidirectional assignment:** Capability for both administrator and client to assign tasks mutually.
- **Dropbox:** Cloud storage service for project file management.
- **KML:** Keyhole Markup Language, file format for geographic data.
- **SHP:** Shapefile, vector cartographic file format.
- **API:** Application Programming Interface.
- **Responsive:** Design adaptable to different screen sizes.

---

## 4. **Functional Requirements (FR)**

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR1** | **Project creation by administrator.** | Only the administrator can create new projects. Upon creation, the following are specified: year, unique code, name, type, X/Y coordinates, contract and delivery dates, associated client, and Dropbox folder path. |
| **FR2** | **Project assignment to clients.** | When creating a project, the administrator assigns it to a specific client. The client can only see projects assigned to them. |
| **FR3** | **Linking special users to projects.** | The administrator can link one or multiple special users to a project and configure their specific permissions. |
| **FR4** | **Project structure in four sections.** | Each project is organized into: Report and Annexes, Plans, Specifications, Budget. The structure is flat without sub-projects. |
| **FR5** | **Management of multiple simultaneous clients.** | The system supports more than 5 active clients simultaneously, each with multiple parallel projects. |
| **FR6** | **Data isolation per client.** | Each client only views projects assigned to them. Cannot access other clients’ projects. |
| **FR7** | **Task creation by administrator.** | The administrator can create tasks and assign them to any client or special user, specifying description, priority, deadline, and optional file attachments. |
| **FR8** | **Task creation by client.** | The client can create tasks and assign them to the administrator to request deliveries or specific information. |
| **FR9** | **Task modification.** | The administrator can modify any task. The client can modify tasks in their projects (own or third-party). |
| **FR10** | **Task deletion.** | The administrator can delete any task. The client can only delete tasks created by themselves. |
| **FR11** | **Task states (5 levels).** | Tasks can have states: Pending, In Progress, Partial, Done (pending confirmation), Completed (confirmed). |
| **FR12** | **Confirmation of finished tasks.** | When a task is marked as “Done”, the recipient must confirm it to change its status to “Completed”. |
| **FR13** | **Task prioritization.** | Each task has a priority level: High, Medium, or Low, visible in the interface. |
| **FR14** | **File attachments in tasks.** | Tasks allow attaching files during creation or editing, stored in Dropbox. |
| **FR15** | **Individualized messaging per project.** | Each project has its own messaging channel where administrator, client, and linked special users participate. |
| **FR16** | **Messages with file attachments.** | Messages can include file attachments (PDF, photos, documents) stored in Dropbox. |
| **FR17** | **Unread message indicator.** | The system displays a visual counter of unread messages per project on the main screen. |
| **FR18** | **Dropbox integration.** | Each project has a specific folder in Dropbox. The system allows uploading, downloading, and sharing files directly (not just links). |
| **FR19** | **Support for technical formats.** | The system supports PDF, KML, SHP, images, and other technical formats necessary in cartographic work. |
| **FR20** | **Automatic in-app notifications.** | The system generates notifications in the application for: new messages, received files, assigned/completed tasks, status changes. |
| **FR21** | **Optional WhatsApp notifications.** | The user can enable WhatsApp notifications for critical events. |
| **FR22** | **Main screen with project summary.** | Displays list of projects ordered by delivery date, with visible code, participant icons, color system (red=pending tasks, green=no tasks), highlighted dates, and unread message counter. |
| **FR23** | **Joint calendar view.** | Monthly/annual calendar view showing all projects on their delivery dates with code and colors according to task status. |
| **FR24** | **Automatic project completion.** | A project can be marked as finished automatically when it has no pending tasks, or manually by the administrator. |
| **FR25** | **Historical query of finished projects.** | Finished projects maintain their information accessible for later consultation. |
| **FR26** | **Configurable permissions for special users.** | The administrator defines specific permissions for each special user: view only, file download, limited editing, etc. |
| **FR27** | **Complete visualization for administrator.** | The administrator sees all projects, tasks, messages, and files in the system without restrictions. |
| **FR28** | **Role-restricted access.** | The system validates permissions for each action according to user role (administrator, client, special user). |
| **FR29** | **Real-time synchronization.** | Changes made by a user are immediately reflected on all devices where other users have an active session. |
| **FR30** | **Project data export.** | The administrator can export project and task information to standard formats (CSV, PDF, Excel). |

---

## 5. **Non-Functional Requirements (NFR)**

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **NFR1** | **Web application accessible from desktop browsers.** | Functions correctly in Chrome, Firefox, Safari, and Edge (versions from the last 2 years). |
| **NFR2** | **Compatible with mobile devices.** | The application is fully functional on Android and iOS smartphones via browser or native app. |
| **NFR3** | **Compatible with tablets.** | The interface adapts correctly to tablets (iPad, Android tablets) maintaining all functionality. |
| **NFR4** | **Responsive design.** | The interface automatically adapts to different screen sizes (minimum 320px width on mobile). |
| **NFR5** | **Intuitive interface and clear navigation.** | Users can navigate between projects, tasks, and messages without extensive training. Maximum 3 clicks to reach any section. |
| **NFR6** | **Robust Dropbox API integration.** | The connection with Dropbox is stable, handles errors correctly, and automatic retries in case of temporary failure. |
| **NFR7** | **Secure authentication system.** | Implements authentication with encrypted passwords, secure session tokens, and automatic session closure after inactivity. |
| **NFR8** | **Relational database.** | Uses SQL database (PostgreSQL, MySQL, or similar) with normalized structure for projects, tasks, users, messages, and permissions. |
| **NFR9** | **Robust permission system.** | Validates permissions in backend for each operation. Does not rely solely on frontend validations. |
| **NFR10** | **Scalable backend.** | The system supports at least 50 concurrent users without significant performance degradation (<2s response time). |
| **NFR11** | **Adequate response time.** | Common operations (load project, create task, send message) respond in less than 2 seconds on standard connections. |
| **NFR12** | **Real-time notifications.** | Notifications are delivered in less than 5 seconds from when the event is generated (using WebSockets or similar technology). |
| **NFR13** | **Efficient file reference storage.** | The database stores references (URLs, IDs) to files in Dropbox, not complete files. |
| **NFR14** | **Backup and recovery system.** | Automatic daily database backups are performed with point-in-time restoration capability. |
| **NFR15** | **Sensitive data security.** | Personal data and credentials are stored encrypted. Basic GDPR/LOPD compliance. |
| **NFR16** | **System availability.** | The system must have at least 99% availability (maximum 7 hours downtime per month). |
| **NFR17** | **Modern frontend framework.** | Uses Vue for responsive and maintainable interface construction. |
| **NFR18** | **Technical code documentation.** | Code includes comments on critical functions and internal API documentation. |
| **NFR19** | **Audit logs.** | The system records critical actions (project creation/deletion, permission changes) with timestamp and responsible user. |
| **NFR20** | **Automated testing.** | Includes unit tests for critical functions (permission management, state calculation) and integration tests for main flows. |

---

## 6. **Optional Considerations**

- **Limited offline mode:** Capability to view previously loaded projects and tasks without connection, with automatic synchronization upon recovering connectivity.
- **Advanced search:** Filters to search projects by year, type, client, task status, or date range.
- **Task templates:** Creation of predefined templates for common tasks to expedite assignment.
- **Automatic reminders:** Automatic notifications X days before task deadlines or project deliveries.
- **Analytics dashboard:** Charts and statistics on completed projects, pending tasks per client, average execution times.
- **Integration with other cloud services:** Support for Google Drive, OneDrive in addition to Dropbox.
- **File commenting system:** Allow specific comments on shared files (e.g., annotations on PDFs).
- **Change history:** Record of uploaded file versions and modifications made to tasks.
- **Real-time chat:** Instant messaging instead of asynchronous message system.
- **Native mobile applications:** Downloadable apps from App Store and Google Play with complete functionality.
- **GIS tool integration:** Direct links to Geographic Information System software.
- **Digital document signature:** Electronic signature system for formal delivery approvals.
- **Multi-language:** Support for Spanish, English, and other configurable languages.
- **Customizable themes:** Dark/light mode and corporate color customization.

---

## 7. **Actor Summary**

### **Administrator (Professional Cartographer)**

Interacts with the system to create and manage projects, assign them to clients, create and modify tasks for any user, configure special user permissions, access all system files and messages, view global status of all projects, and mark projects as finished.

### **Client**

Interacts with the system to view only projects assigned to them, see their specific tasks, create tasks for the administrator requesting deliveries, modify tasks in their projects, delete only own tasks, send and receive messages related to their projects, attach and download files from their projects, and confirm completion of assigned tasks.

### **Special User**

Interacts with the system according to permissions configured by the administrator, typically to view specific projects, download certain files, consult messages and tasks without editing capability, or other limited permissions defined per project.

### **System**

Manages business logic (permission validation, task states, assignments), integrates with Dropbox for file storage, generates automatic notifications, synchronizes changes in real-time between devices, maintains data isolation per client, calculates project states according to tasks, and administers messaging per project.

---

## 8. **Detailed Role and Permission System**

### 8.1 Permission Matrix by Role

| Action | Administrator | Client | Special User |
| --- | --- | --- | --- |
| Create projects | ✓ | ✗ | ✗ |
| View all projects | ✓ | ✗ (only assigned) | ✗ (only assigned) |
| Edit any project | ✓ | ✗ | ✗ |
| Delete projects | ✓ | ✗ | ✗ |
| Create tasks for others | ✓ | ✓ (only admin) | ✗ |
| View all tasks | ✓ | ✗ (only own) | ✗ (only assigned) |
| Modify any task | ✓ | ✓ (in their projects) | ✗ |
| Delete any task | ✓ | ✗ (only own) | ✗ |
| Access all messages | ✓ | ✗ (only their projects) | ✗ (only their projects) |
| Send messages | ✓ | ✓ (in their projects) | Configurable |
| Access all files | ✓ | ✗ (only their projects) | Configurable |
| Upload files | ✓ | ✓ (in their projects) | Configurable |
| Download files | ✓ | ✓ (from their projects) | Configurable |
| Configure permissions | ✓ | ✗ | ✗ |
| Mark projects finished | ✓ | ✗ | ✗ |
| Confirm tasks | ✓ | ✓ (assigned to them) | ✗ |
| View global calendar | ✓ | ✗ (only their dates) | ✗ (only their dates) |
| Export data | ✓ | ✗ | ✗ |

### 8.2 Configurable Permissions for Special User

The administrator can enable/disable the following permissions individually for each Special User:

- **View only:** See projects without ability to modify anything
- **Download files:** Download access to specific or all documents
- **View messages:** Read messages without being able to respond
- **Send messages:** Actively participate in messaging
- **View tasks:** Consult task status without modifying them
- **Upload files:** Add documents to specific folders
- **Access to specific sections:** Restriction by section (e.g., only Plans, not Budget)

---

## 9. **Project Data Structure**

### 9.1 Project Information Fields

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| **ID** | Numeric | Auto-generated unique identifier | Yes |
| **Year** | Numeric | Project year (YYYY) | Yes |
| **Client** | Relationship | Reference to assigned client | Yes |
| **Code** | Alphanumeric | Project unique identifier code | Yes |
| **Folder** | Text | Dropbox folder path or ID | Yes |
| **Project Name** | Text | Complete project name | Yes |
| **Project Type** | Text/Enum | Cartographic work category | Yes |
| **Coordinate X** | Numeric | Geographic coordinate X (longitude) | No |
| **Coordinate Y** | Numeric | Geographic coordinate Y (latitude) | No |
| **Contract Date** | Date | Project start date | Yes |
| **Delivery Date** | Date | Completion deadline | Yes |
| **Status** | Enum | Active / In Progress / Pending Review / Finished | Yes (default: Active) |
| **Special Users** | Multiple relationship | List of linked special users | No |
| **Creation Date** | Timestamp | Record creation date and time | Yes (auto) |
| **Last Modification** | Timestamp | Last update date and time | Yes (auto) |

### 9.2 Project Sections (Flat Structure)

Each project contains four main sections where files are organized:

1. **Report and Annexes**
    - Project descriptive documents
    - Technical appendices
    - Complementary reports
2. **Plans**
    - Cartographic files (KML, SHP)
    - PDF plans
    - Reference maps
3. **Specifications**
    - Technical specifications
    - Project conditions
    - Applicable regulations
4. **Budget**
    - Economic breakdown
    - Measurements
    - Certifications

---

## 10. **Detailed Task System**

### 10.1 Task Data Structure

| Field | Type | Description |
| --- | --- | --- |
| **ID** | Numeric | Unique identifier |
| **Description** | Long text | Task detail to perform |
| **Associated Project** | Relationship | Reference to project it belongs to |
| **Creator User** | Relationship | Who created the task |
| **Assigned User** | Relationship | Responsible for executing the task |
| **Priority** | Enum | High / Medium / Low |
| **Status** | Enum | Pending / In Progress / Partial / Done / Completed |
| **Deadline** | Date | Maximum delivery deadline |
| **Attached Files** | List | References to files in Dropbox |
| **Creation Date** | Timestamp | When the task was created |
| **Completion Date** | Timestamp | When marked as Done |
| **Confirmation Date** | Timestamp | When confirmed as Completed |
| **Comments** | Text | Additional notes about the task |

### 10.2 Task State Flow

```
[Creation]
    ↓
[PENDING] ←→ [IN PROGRESS] ←→ [PARTIAL]
    ↓              ↓                ↓
    └──────────→ [DONE] ←──────────┘
                    ↓
         [Confirmation by recipient]
                    ↓
              [COMPLETED]
```

**Transition description:**
- **Pending:** Initial state upon task creation
- **In Progress:** The responsible party is working on it (optional)
- **Partial:** Work advanced but not finished (optional)
- **Done:** The responsible party considers the task finished, but requires confirmation
- **Completed:** The recipient confirms the task is correctly finished

### 10.3 Bidirectional Assignment

**Administrator → Client:**
- Administrator creates task assigned to client
- Example: “Provide land coordinates”
- Client must complete the task and mark it as Done
- Administrator confirms to mark it as Completed

**Client → Administrator:**
- Client creates task assigned to administrator
- Example: “Deliver final plans in PDF”
- Administrator completes the task and marks it as Done
- Client confirms to mark it as Completed

---

## 11. **Detailed Messaging System**

### 11.1 Message Structure

| Field | Type | Description |
| --- | --- | --- |
| **ID** | Numeric | Message unique identifier |
| **Project** | Relationship | Project the message belongs to |
| **Sender User** | Relationship | Who sends the message |
| **Content** | Long text | Message body |
| **Attached Files** | List | References to files in Dropbox |
| **Date and Time** | Timestamp | Exact moment of sending |
| **Read by** | List | Users who have viewed the message |
| **Type** | Enum | Normal / System (automatic notification) |

### 11.2 Messaging Participants

For each project, the following can participate in messaging:
- **Administrator:** Always has access
- **Assigned client:** Automatic access to the project
- **Linked special users:** According to configured permissions

### 11.3 Message Types

**Normal messages:**
- Manually sent by users
- Can include file attachments
- Generate notification to other participants

**System messages:**
- Automatically generated by events (e.g., “New task assigned”)
- Do not allow direct response
- Inform about project changes

### 11.4 Messaging Notifications

Each new message generates:
- **Unread counter:** Increments on project main screen
- **In-app notification:** Badge or banner within the application
- **WhatsApp notification (optional):** Message to user’s configured number

---

## 12. **Dropbox Integration**

### 12.1 Dropbox Folder Structure

```
Dropbox/
└── CartographicProjects/
    ├── [Project_Code_1]/
    │   ├── ReportAndAnnexes/
    │   ├── Plans/
    │   ├── Specifications/
    │   ├── Budget/
    │   ├── Tasks/
    │   │   ├── Task_001/
    │   │   └── Task_002/
    │   └── Messages/
    │       ├── Attachment_001.pdf
    │       └── Attachment_002.jpg
    └── [Project_Code_2]/
        └── ...
```

### 12.2 Dropbox API Operations

**Implemented operations:**
- **Create folder:** When creating new project, its structure is automatically generated in Dropbox
- **Upload file:** Save task or message attachments
- **Download file:** Retrieve documents for viewing or local download
- **List files:** Display project folder contents
- **Share file:** Generate direct access links (with permissions)
- **Delete file:** Delete obsolete documents (administrator only)
- **Synchronization:** Verify file integrity periodically

### 12.3 Supported File Formats

| Category | Formats |
| --- | --- |
| **Documents** | PDF, DOC, DOCX, TXT |
| **Cartography** | KML, KMZ, SHP (+ .shx, .dbf, .prj) |
| **Images** | JPG, JPEG, PNG, TIFF, GIF |
| **CAD** | DWG, DXF (optional) |
| **Compressed** | ZIP, RAR (optional) |
| **Spreadsheets** | XLS, XLSX, CSV |

---

## 13. **Notification System**

### 13.1 Events that Generate Notifications

| Event | Notification for | Content |
| --- | --- | --- |
| New message | Project participants | “New message in [Project Name]” |
| File received | Project participants | “New file: [name.ext]” |
| Task assigned | Assigned user | “New task: [Description]” |
| Task finished | Task creator user | “[User] finished task: [Description]” |
| Task status change | Assigned user and creator | “Task [Description] changed to [Status]” |
| Task confirmed | Involved users | “Task completed: [Description]” |
| Project about to expire | Admin and client | “Project [Code] expires in [X days]” |
| Project finished | Participants | “Project [Code] marked as finished” |

### 13.2 Notification Channels

**In-app notifications:**
- **Numeric badge:** Counter of pending notifications in top bar
- **Pop-up banner:** Temporary window showing real-time notification
- **Notification center:** Historical list of all received notifications
- **Visual indicators:** Red dots or numbers on project, task, or message icons

**WhatsApp notifications (optional):**
- Requires prior phone number configuration
- User can enable/disable from personal settings
- Only for critical events (task assigned, important message, project about to expire)
- Frequency limit to avoid spam (maximum 1 notification every 30 minutes per project)

### 13.3 Notification Configuration per User

Each user can customize:
- ✓/✗ In-app notifications enabled
- ✓/✗ WhatsApp notifications enabled
- ✓/✗ Notify new messages
- ✓/✗ Notify received files
- ✓/✗ Notify assigned tasks
- ✓/✗ Notify task status changes
- ✓/✗ Notify deadline reminders

---

## 14. **Main Screen and Visualizations**

### 14.1 Main Screen Layout

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
│  🔴 CART-2024-087  │  Client: Company XYZ               │
│      Industrial Cadastre                                │
│      👤👤👤 [3 participants]  💬 5 unread messages      │
│      📅 Delivery: 11/30/2025  ⚠️ 4 pending tasks        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 14.2 Color System and Visual Indicators

**Color code for projects:**
- 🔴 **Red:** Project with one or more pending tasks
- 🟢 **Green:** Project without pending tasks (all completed)
- 🟡 **Yellow (optional):** Project close to delivery date (<7 days)
- ⚫ **Gray:** Finished project (historical query)

**Status icons:**
- 👤 Participant icon for each user linked to the project
- 💬 Unread message counter
- 📅 Highlighted delivery date
- ⚠️ Number of pending tasks
- ✓ Indicator of project without pending tasks
- 📎 Recent files added

**Project sorting:**
- Default: Closest delivery date first
- Options: By code, by client, by status, by creation date

### 14.3 Detailed Project View

When clicking on a project, the following is displayed:

```
┌──────────────────────────────────────────────────────────┐
│  ← Back    CART-2025-001 - North Urbanization Project   │
├──────────────────────────────────────────────────────────┤
│  GENERAL INFORMATION                                     │
│  Client: John Pérez                                      │
│  Type: Urbanization                                      │
│  Coordinates: X: 123456.78  Y: 987654.32                │
│  Contract: 09/01/2025  |  Delivery: 12/15/2025         │
│  Status: Active                                          │
├──────────────────────────────────────────────────────────┤
│  [Tasks] [Messages] [Files] [Participants]              │
├──────────────────────────────────────────────────────────┤
│  TASKS (5 total, 2 pending)              [+ New]        │
│                                                          │
│  🔴 HIGH    │ Deliver land coordinates                  │
│              Assigned to: John Pérez                     │
│              Due: 11/25/2025  Status: Pending           │
│              [View detail] [Edit]                        │
│                                                          │
│  🟡 MEDIUM  │ Review preliminary plans                  │
│              Assigned to: Administrator                  │
│              Due: 12/01/2025  Status: In Progress       │
│              [View detail] [Edit]                        │
│                                                          │
│  🟢 LOW     │ Approve final budget                      │
│              Assigned to: John Pérez                     │
│              Due: 12/10/2025  Status: Completed         │
│              [View detail]                               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 15. **Calendar View**

### 15.1 Monthly Calendar Layout

```
┌──────────────────────────────────────────────────────────┐
│  [< Previous]        DECEMBER 2025         [Next >]      │
├──────────────────────────────────────────────────────────┤
│  Mon   Tue   Wed   Thu   Fri   Sat   Sun                │
│   1     2     3     4     5     6     7                  │
│                                                          │
│   8     9    10    11    12    13    14                 │
│                              🔴CART-001                  │
│                              12/15                       │
│                                                          │
│  15    16    17    18    19    20    21                 │
│                                                          │
│  22    23    24    25    26    27    28                 │
│                    🟢CART-003                            │
│                    12/27                                 │
│                                                          │
│  29    30    31                                          │
│              🔴CART-005                                  │
│              12/31                                       │
└──────────────────────────────────────────────────────────┘

Legend: 🔴 With pending tasks | 🟢 Without pending tasks
```

### 15.2 Calendar Functionalities

- **Navigation:** Buttons to move between months and years
- **Click on project:** Opens detailed project view
- **Multiple projects on one day:** Displayed stacked or with “+X more” indicator
- **Day view:** Click on a day shows all events for that date
- **Export:** Option to export calendar to iCal/Google Calendar format
- **Filters:** Show only projects from a specific client, or by type

---

## 16. **Complete Workflow**

### 16.1 Phase 1: Project Creation and Initiation

**Step 1: Administrator creates project**
1. Accesses “New Project” from main screen
2. Completes form with all required fields:
- Year, code, name, type, coordinates, dates, client
3. System validates that code is unique
4. Upon saving, system automatically creates:
- Database record
- Folder structure in Dropbox
- Notification to assigned client

**Step 2: Client receives notification**
1. Client receives in-app notification and optional WhatsApp
2. Accesses their main screen and sees the new project
3. Can explore the project’s empty sections

**Step 3: Administrator assigns initial tasks**
1. Within the project, creates first task
2. Example: “Provide exact land coordinates”
3. Assigns to client with High priority and deadline
4. Client receives task assigned notification

### 16.2 Phase 2: Development and Execution

**Step 4: Bidirectional task exchange**

*Client completes administrator’s task:*
1. Client opens assigned task
2. Attaches KML file with coordinates
3. Marks task as “Done”
4. Administrator receives notification
5. Administrator reviews, confirms, and marks as “Completed”

*Client creates task for administrator:*
1. Client creates new task: “Deliver preliminary plans”
2. Assigns to administrator with deadline
3. Administrator receives notification
4. Administrator works on plans
5. Administrator uploads PDF files to Dropbox
6. Marks task as “Done”
7. Client confirms receipt → “Completed”

**Step 5: Communication through messaging**
1. Client sends message: “When will the final plans be ready?”
2. Administrator receives new message notification
3. Administrator responds attaching preliminary PDF document
4. Client downloads file and confirms receipt

**Step 6: File management**
1. Administrator uploads technical files (SHP, KML) to Plans section
2. Client receives notification of new files
3. Client downloads files for external review
4. Client uploads land photos to Report and Annexes
5. Administrator reviews photos to adjust design

### 16.3 Phase 3: Monitoring and Tracking

**Step 7: Status visualization**
- **Main screen:**
- Project appears in red while there are pending tasks
- Unread message counter visible
- Delivery date highlighted if approaching

- **Calendar view:**
    - Project visible on delivery date (12/15/2025)
    - Red color indicates pending tasks
- **Special users:**
    - If special users are linked (e.g., supervisor)
    - Can consult progress according to configured permissions

### 16.4 Phase 4: Completion

**Step 8: Complete final tasks**
1. Administrator completes last task: “Final documentation delivery”
2. Uploads all final PDFs to Dropbox folder
3. Marks task as “Done”
4. Client reviews documentation
5. Client confirms → Task changes to “Completed”

**Step 9: Project closure**
1. System detects no pending tasks remain
2. Project automatically changes from red to green
3. Administrator verifies everything is complete
4. Administrator marks project as “Finished”
5. Project goes to historical status (gray)
6. All participants receive closure notification

**Step 10: Later consultation**
- Finished project remains accessible
- Files remain available in Dropbox
- Historical messages consultable
- No possibility to create new tasks

---

## 17. **Main Use Cases**

### 17.1 UC-01: Create New Project

**Actor:** Administrator

**Preconditions:** User authenticated as Administrator

**Basic flow:**
1. Administrator accesses “New Project”
2. System displays creation form
3. Administrator completes all required fields
4. Administrator selects client from dropdown list
5. System validates that code is unique
6. Administrator confirms creation
7. System creates DB record and folders in Dropbox
8. System notifies assigned client
9. System shows success confirmation

**Alternative flow:**
- 5a. Duplicate code: System shows error and requests different code
- 3a. Empty required fields: System marks fields in red and does not allow saving

### 17.2 UC-02: Assign Task to Another User

**Actor:** Administrator or Client

**Preconditions:** User authenticated, existing project

**Basic flow:**
1. User accesses project view
2. User clicks “New Task”
3. System displays task form
4. User completes description, priority, deadline
5. User selects recipient from dropdown list
6. User optionally attaches files
7. User confirms creation
8. System validates user permissions
9. System creates task with “Pending” status
10. System notifies assigned user
11. System shows confirmation

**Alternative flow:**
- 8a. Client attempts to assign to another client: System rejects operation
- 6a. File too large: System shows size limit error

### 17.3 UC-03: Confirm Finished Task

**Actor:** Task recipient user

**Preconditions:** Task in “Done” status

**Basic flow:**
1. User receives task completed notification
2. User accesses task view
3. System displays details and attachments
4. User reviews work performed
5. User clicks “Confirm Completed”
6. System updates status to “Completed”
7. System records confirmation timestamp
8. System notifies task creator
9. System updates project counters

**Alternative flow:**
- 4a. Insufficient work: User requests corrections via message
- 4b. User can change status back to “Pending” with comment

### 17.4 UC-04: Send Message with File Attachment

**Actor:** Administrator, Client, or Special User (according to permissions)

**Preconditions:** User with messaging permission in the project

**Basic flow:**
1. User accesses project Messages section
2. User writes message in text box
3. User clicks “Attach File”
4. System opens file selector
5. User selects local file
6. System validates format and size
7. System uploads file to Dropbox
8. User confirms message sending
9. System creates message record with file reference
10. System notifies all project participants
11. System updates unread message counter

**Alternative flow:**
- 6a. Unsupported format: System shows error and list of valid formats
- 6b. File too large (>50MB): System suggests uploading directly to folder

### 17.5 UC-05: Configure Special User Permissions

**Actor:** Administrator

**Preconditions:** Existing special user, existing project

**Basic flow:**
1. Administrator accesses project configuration
2. Administrator selects “Manage Participants”
3. System displays list of linked special users
4. Administrator clicks “Configure Permissions” for a user
5. System displays permission panel with checkboxes
6. Administrator marks/unmarks desired permissions:
- View only
- Download files
- View messages
- Send messages
- View tasks
- Upload files
- Access by sections
7. Administrator confirms changes
8. System validates and saves configuration
9. System notifies special user about permission changes
10. System applies permissions immediately

---

## 18. **Suggested Technical Architecture**

### 18.1 Recommended Technology Stack

**Frontend:**
- Framework: Vue.js
- State Management: Redux, Vuex, or Context API
- UI Components: Material-UI, Ant Design, or Tailwind CSS
- Real-time notifications: Socket.io-client or Firebase Cloud Messaging

**Backend:**
- Language: Node.js (Express), Python (Django/FastAPI), or Java (Spring Boot)
- RESTful API with JWT authentication
- WebSockets for real-time notifications
- ORM: Sequelize, TypeORM, or Prisma

**Database:**
- PostgreSQL or MySQL for relational data
- Redis for cache and session management

**Storage:**
- Dropbox API v2 for file management
- Temporary signed URLs for secure downloads

**Notifications:**
- In-app notifications: Socket.io or Server-Sent Events
- WhatsApp: WhatsApp Business API or Twilio API

**Infrastructure:**
- Hosting: AWS, Google Cloud, Azure, or DigitalOcean
- CDN for static assets
- Load balancer for scalability
- SSL/TLS for secure communications

### 18.2 Simplified Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (Vue)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Web App  │  │ Mobile   │  │ Tablet   │         │
│  │ (Browser)│  │ (Browser)│  │ (Browser)│         │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘         │
└────────┼─────────────┼─────────────┼───────────────┘
         │             │             │
         └─────────────┴─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │      API GATEWAY          │
         │   (JWT Authentication)    │
         └─────────────┬─────────────┘
                       │
         ┌─────────────┴─────────────┐
         │      BACKEND (Node/Python)│
         │  ┌────────────────────┐   │
         │  │ Auth Service       │   │
         │  │ Project Service    │   │
         │  │ Task Service       │   │
         │  │ Message Service    │   │
         │  │ Notification Srv   │   │
         │  │ Permission Service │   │
         │  └────────────────────┘   │
         └───┬────────────┬──────────┘
             │            │
    ┌────────▼────┐  ┌───▼──────────┐
    │ PostgreSQL  │  │ Dropbox API  │
    │   Database  │  │   Storage    │
    └─────────────┘  └──────────────┘
```

### 18.3 Database Structure

**Main tables:**

1. **users**
    - id, email, password_hash, role (admin/client/special), name, phone, whatsapp_enabled, created_at
2. **projects**
    - id, code, name, type, year, client_id, folder_path, coord_x, coord_y, contract_date, delivery_date, status, created_at
3. **tasks**
    - id, project_id, description, creator_id, assigned_to, priority, status, deadline, created_at, completed_at, confirmed_at
4. **messages**
    - id, project_id, sender_id, content, timestamp, type (normal/system)
5. **files**
    - id, project_id, task_id, message_id, filename, dropbox_path, file_type, uploaded_by, uploaded_at
6. **project_participants**
    - id, project_id, user_id, role (admin/client/special)
7. **special_user_permissions**
    - id, user_id, project_id, can_view, can_download, can_message, can_upload, section_access
8. **notifications**
    - id, user_id, type, content, related_id, read, created_at
9. **message_reads**
    - id, message_id, user_id, read_at

**Key relationships:**
- projects ← (1:N) → tasks
- projects ← (1:N) → messages
- projects ← (N:M) → users (via project_participants)
- users ← (1:N) → notifications

---

## 19. **Testing Specifications**

### 19.1 Required Unit Tests

**test_permissions.js:**
- Administrator can create projects
- Client cannot create projects
- Client only sees assigned projects
- Special user only sees linked projects
- Client can create tasks for admin
- Client cannot create tasks for other clients
- Administrator can modify any task
- Client can only delete own tasks
- Correct validation of special user configurable permissions

**test_tasks.js:**
- Correct task creation with all fields
- Valid state transition (Pending → Done → Completed)
- Confirmation requires recipient role
- Notification is generated when assigning task
- Attachments are linked correctly

**test_projects.js:**
- Project creation with unique code
- Duplicate code rejection
- Required field validation
- Correct assignment to client
- Correct status calculation (red/green) according to tasks
- Automatic completion without pending tasks
- Manual completion by administrator

**test_messages.js:**
- Message sending associated with correct project
- Unread counter increments correctly
- Mark as read updates status
- Attachments are linked to message
- Project participants receive notification

**test_dropbox_integration.js:**
- Folder structure creation when creating project
- Successful file upload
- Correct file download
- Dropbox connection error handling
- File format validation

**test_notifications.js:**
- Notification is generated for correct events
- Correct recipients receive notification
- WhatsApp notifications respect user configuration
- WhatsApp frequency limit is respected

### 19.2 Integration Tests

**test_complete_workflow.js:**
- Complete flow: create project → assign task → complete → confirm → finish
- Bidirectional task assignment works correctly
- Messaging + files + notifications work together
- Real-time synchronization between users

### 19.3 Interface Tests (E2E)

**test_ui_admin.js:**
- Administrator can navigate and create projects
- Main screen shows projects with correct colors
- Calendar displays delivery dates correctly
- Permission configuration works from UI

**test_ui_client.js:**
- Client only sees assigned projects
- Client can create tasks for admin
- Client receives notifications visually
- Messaging functional from UI

### 19.4 Minimum Coverage

- Line coverage: ≥70%
- Critical function coverage: 100% (permission validation, task states, notifications)

---

## 20. **Security and Privacy**

### 20.1 Implemented Security Measures

**Authentication:**
- Passwords hashed with bcrypt (salt rounds ≥10)
- JWT tokens with 24-hour expiration
- Refresh tokens for secure renewal
- Automatic session closure after 30 minutes of inactivity
- Account lockout after 5 failed login attempts

**Authorization:**
- Backend permission validation for each operation
- JWT tokens include user role and permissions
- Resource ownership verification before modifications
- Authorization middleware on all protected routes

**Data protection:**
- Communications always via HTTPS/TLS
- Sensitive data encryption in database
- Temporary signed URLs for Dropbox downloads
- No sensitive files stored in frontend
- Audit logs for critical actions

**Attack prevention:**
- SQL Injection protection (ORM use with prepared statements)
- XSS protection (input sanitization)
- CSRF protection (CSRF tokens in forms)
- API rate limiting (maximum 100 requests/minute per user)
- Strict uploaded file type validation

### 20.2 Regulatory Compliance

**GDPR/LOPD:**
- Explicit consent for WhatsApp notifications
- Right of access to personal data
- Right of rectification and deletion
- Data export in portable format
- Clearly visible privacy policy

---

## 21. **Deliverables**

1. **Complete source code** in Git repository with modular structure
2. **Functional web application** deployed on production server
3. **Responsive application** verified on multiple devices
4. **Database** configured with complete structure
5. **Dropbox integration** operational and tested
6. **Notification system** functioning (in-app and WhatsApp)
7. **Test suite** with ≥70% coverage
8. **Technical documentation:**
    - README with installation and deployment instructions
    - API documentation (Swagger/OpenAPI)
    - User guide by role (Admin, Client, Special User)
    - Architecture and database diagrams
9. **Administrator manual** to configure permissions and manage system
10. **Backup system** configured and documented

---

## 22. **Implementation Roadmap**

### Phase 1: Basic Core

- ✓ Authentication system and roles
- ✓ Project CRUD (admin only)
- ✓ Basic task CRUD
- ✓ Project assignment to clients
- ✓ Basic UI: main screen and project view

### Phase 2: Collaboration

- ✓ Project messaging system
- ✓ In-app notifications
- ✓ Bidirectional task assignment
- ✓ Complete task states (5 levels)
- ✓ Task confirmation

### Phase 3: Files and Dropbox

- ✓ Dropbox API integration
- ✓ File upload and download
- ✓ Task and message attachments
- ✓ Automatic folder structure
- ✓ Technical format support (KML, SHP, PDF)

### Phase 4: Permissions and Special Users

- ✓ Configurable permission system
- ✓ Special users linkable to projects
- ✓ Permission configuration panel
- ✓ Strict permission validation

### Phase 5: Visualizations

- ✓ Color system (red/green)
- ✓ Message and task counters
- ✓ Calendar view
- ✓ Participant visual indicators
- ✓ Sorting and filters

### Phase 6: External Notifications

- ✓ WhatsApp API integration
- ✓ Notification configuration per user
- ✓ Frequency limits

### Phase 7: Testing and Refinement

- ✓ Complete test suite
- ✓ Bug fixes
- ✓ Performance optimization
- ✓ UX improvements

### Phase 8: Deployment and Documentation

- ✓ Production deployment
- ✓ Complete documentation
- ✓ User training
- ✓ Initial monitoring and support

---

**Final Notes:** This specification establishes a complete cartographic project management system with multi-user collaboration, differentiated roles, cloud service integration, and automatic notifications. The document is detailed enough to guide complete development, generate UML diagrams, use cases, and serve as a basis for technical implementation of a professional scalable solution.