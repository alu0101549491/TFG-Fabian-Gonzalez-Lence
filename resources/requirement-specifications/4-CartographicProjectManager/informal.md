## General Description

Web and mobile application for managing cartographic projects between an administrator (professional cartographer) and multiple simultaneous clients. The system allows project status tracking, bidirectional task assignment, internal messaging per project, and technical file sharing through cloud service integration (Dropbox). Includes differentiated roles with customizable permissions and automatic notification system.

## User and Role System

The system contemplates three types of roles with differentiated permissions:

- **Administrator**: total control over the application
    - Create and manage projects
    - Create, modify and delete tasks from any user
    - Assign tasks to clients and special users
    - View all projects and tasks in the system
    - Configure special user permissions
    - Access all files and messages
    - Mark projects as completed
- **Client**: permissions limited to their assigned projects
    - View only projects assigned by the administrator
    - View only tasks assigned to them
    - Create tasks and assign them to the administrator
    - Modify tasks created by them or by third parties
    - Delete only tasks created by them
    - Send and receive messages related to their projects
    - Attach and download files from their projects
    - Confirm completion of assigned tasks
- **Special user**: permissions configurable by the administrator
    - Linked to specific projects
    - Customizable permissions: view only, file download, limited editing, etc.
    - There can be multiple special users per project
    - Restricted access according to administrator configuration

## Multiple Client and Project Management

- Support for more than 5 simultaneous clients
- Each client can have multiple active projects in parallel
- Scalable system for use by other professionals besides the main administrator
- Data isolation: each client only sees their own projects

## Project Structure and Data

Each project has a flat structure (no sub-projects) organized into four main sections:

- Report and Annexes
- Plans
- Specifications
- Budget

Projects include the following information fields:

- **Year**: project year
- **Client**: client associated with the project
- **Code**: unique project identifier
- **Folder**: path or reference to folder in cloud service
- **Project Name**: complete denomination
- **Project Type**: category or work classification
- **X Coordinate**: geographic coordinate X
- **Y Coordinate**: geographic coordinate Y
- **Contract Date**: project start date
- **Delivery Date**: completion deadline

Only the administrator can create new projects.

## Task System

- Bidirectional task assignment between administrator and clients
- Client can assign tasks to administrator specifying necessary deliveries
- Administrator can assign tasks to client requesting information or approvals
- Each task includes:
    - Task description
    - Assigned user (responsible)
    - Creator user
    - Priority (high, medium, low)
    - Deadline
    - Current status
    - Optional attached files
    - Associated project

## Task States

Tasks can have the following states:

- **Pending**: task created but not started
- **In progress**: task under development (optional state)
- **Partial**: task partially completed
- **Done**: task finished but pending confirmation
- **Completed**: task confirmed by recipient

Finished tasks require approval or confirmation from the recipient to be marked as definitively completed.

## Project Messaging System

- Individualized messaging for each project
- Messages are always associated with a specific project
- Allows communication between administrator, client and special users of the project
- Text messages with ability to attach files (PDF, photos, documents)
- In-app notifications when receiving new messages
- WhatsApp notification option
- Visual indicator of unread messages

## File Management and Cloud Services

- Dropbox integration for project file storage
- Each project has its specific folder in the cloud
- Direct file sharing (not just links)
- Support for multiple file formats:
    - PDF (final documents and deliveries)
    - KML (geographic coordinate files)
    - SHP (cartographic Shapefile files)
    - Photos and images
    - Other technical formats needed during work
- Ability to attach files during task process
- Delivery of completed tasks through files located in the cloud

## Automatic Notification System

The system generates automatic notifications for the following events:

- Receipt of new messages
- Receipt of files
- Tasks sent or assigned
- Tasks completed
- Task status changes
- Confirmation of completed tasks

Notifications are displayed:

- Within the application with visual indicators
- Optionally through WhatsApp

## Main Screen and Display

The main screen shows a project summary with the following features:

- List of all projects sorted by delivery date
- Visible project code
- Icons indicating participating users in each project
- Color system to indicate task status:
    - **Red**: projects with pending tasks
    - **Green**: projects without pending tasks
- Highlighted delivery date information
- Unread message counter per project
- Quick access to each project from the list

## Calendar View

- Combined calendar view showing all projects
- Projects appear on their corresponding delivery dates
- Identification by project code
- Consistent color system:
    - Red for projects with pending tasks
    - Green for projects without pending tasks
- Navigation by months and years
- Display of important delivery deadlines

## Project Completion

A project can be marked as completed when one of these conditions is met:

- It has no pending tasks (all tasks are completed)
- The administrator manually marks it as completed (even if pending tasks exist)

Completed projects maintain their information accessible for historical consultation.

## Application Features

- Web application accessible from desktop browsers
- Compatible with mobile devices (smartphones)
- Compatible with tablets
- Responsive interface adapted to different screen sizes
- Intuitive design with clear navigation between projects, tasks and messages
- Real-time synchronization of changes between devices
- Robust permission system to control access

## Typical Workflow

1. **Project creation**:
    - Administrator creates a new project with all its data
    - Assigns the project to a specific client
    - Optionally links special users with configured permissions
    - Project folder is automatically created in Dropbox
2. **Project development**:
    - Client accesses and views their assigned project
    - Administrator creates initial tasks for the client
    - Client can create tasks to request deliveries from administrator
    - Both parties exchange messages about the project
    - Technical files are shared (KML, SHP, PDF) during the process
    - Tasks advance between states: pending → in progress → done → completed
3. **Continuous tracking**:
    - Main screen visually shows which projects have pending tasks
    - Calendar reflects upcoming delivery dates
    - Notifications alert about important changes
    - Special users can check progress according to their permissions
4. **Delivery and completion**:
    - Finished tasks are marked as "done"
    - Recipient must confirm to mark them as "completed"
    - Final files in PDF are delivered through the Dropbox folder
    - Administrator verifies no pending tasks remain
    - Project is marked as completed
5. **Continuous communication**:
    - Project-associated messaging active throughout the entire cycle
    - Shared files accessible at any time
    - Notifications keep all participants informed

## Permissions and Access by Role

**Administrator can**:

- Create, edit and delete projects
- Create, edit and delete tasks from any user
- View all projects, tasks and messages in the system
- Configure special user permissions
- Mark projects as completed
- Access all files

**Client can**:

- View only projects assigned to them
- View only tasks assigned to them
- Create tasks for the administrator
- Modify any task (own or third-party in their projects)
- Delete only tasks created by them
- Send messages in their projects
- Attach and download files from their projects
- Confirm task completion

**Special user can** (according to configuration):

- View specific assigned projects
- Download specific files
- View messages and tasks (without editing)
- Other permissions defined by the administrator

## Technical Considerations

- Robust integration with Dropbox API for file management
- Secure authentication system with roles and permissions
- Relational database for projects, tasks, users and messages
- Efficient storage of references to cloud files
- Real-time notification system
- Responsive interface with modern framework (React, Vue, Angular)
- Scalable backend prepared for multiple concurrent users
- Ability to export project and task data
- Backup and recovery system for critical information