# Initial

I've created a comprehensive UML use case diagram for the Cartographic Project Management System following your specified format. The diagram includes:

**Key Features:**

- **50 use cases** organized by functional areas (Project Management, Task Management, Messaging, File Management, Notifications, Visualizations, Authentication, and System Management)
- **6 actors**: Administrator, Client, Special User, System, Dropbox API, and WhatsApp API
- **Relationship types**:
    - Solid arrows (-->) for direct user interactions and includes relationships
    - Dotted arrows (-.->) for system-managed actions, triggers, and conditional flows
- **Color coding**:
    - Actors: Blue for users, Red for system components
    - Use cases by category: Green (core project/auth), Gold (tasks/messaging), Sky Blue (files), Coral (notifications), Plum (visualizations), Khaki (system processes)

The diagram captures the complete workflow including:

- Differentiated role permissions (Administrator with full control, Client with limited access, Special User with configurable permissions)
- Bidirectional task assignment between administrator and clients
- Project messaging with file attachments
- Dropbox integration for file storage
- Automatic notification system (in-app and WhatsApp)
- Real-time synchronization and data isolation
- Visual status indicators and calendar views

Would you like me to create additional diagrams focusing on specific subsystems, or would you like any modifications to this diagram?

```mermaid
graph TB
    subgraph "Cartographic Project Management System"
        %% Project Management Use Cases
        UC1[Create Project]
        UC2[Assign Project to Client]
        UC3[Link Special Users to Project]
        UC4[Configure Special User Permissions]
        UC5[View Project Details]
        UC6[Edit Project Information]
        UC7[Mark Project as Finished]
        UC8[Export Project Data]
        UC9[View All Projects]
        UC10[View Assigned Projects Only]
        
        %% Task Management Use Cases
        UC11[Create Task]
        UC12[Assign Task to User]
        UC13[Modify Task]
        UC14[Delete Task]
        UC15[Change Task Status]
        UC16[Confirm Task Completion]
        UC17[Attach Files to Task]
        UC18[Set Task Priority]
        UC19[View Task Details]
        
        %% Messaging Use Cases
        UC20[Send Message]
        UC21[View Messages]
        UC22[Attach Files to Message]
        UC23[Mark Message as Read]
        UC24[View Unread Message Counter]
        
        %% File Management Use Cases
        UC25[Upload File to Dropbox]
        UC26[Download File from Dropbox]
        UC27[Create Folder Structure]
        UC28[List Project Files]
        UC29[Delete File]
        UC30[Share File Link]
        
        %% Notification Use Cases
        UC31[Generate In-App Notification]
        UC32[Send WhatsApp Notification]
        UC33[Configure Notification Preferences]
        UC34[View Notification History]
        UC35[Mark Notification as Read]
        
        %% Visualization Use Cases
        UC36[Display Main Screen]
        UC37[Show Calendar View]
        UC38[Calculate Project Status Color]
        UC39[Update Status Indicators]
        UC40[Sort Projects by Criteria]
        UC41[Filter Projects]
        
        %% Authentication & Authorization
        UC42[User Login]
        UC43[User Logout]
        UC44[Validate User Permissions]
        UC45[Manage User Session]
        
        %% System Management
        UC46[Synchronize Real-Time Changes]
        UC47[Perform Database Backup]
        UC48[Log Audit Events]
        UC49[Validate Data Isolation]
        UC50[Handle Dropbox API Errors]
    end
    
    %% Actors
    Administrator((Administrator))
    Client((Client))
    SpecialUser((Special User))
    System((System))
    DropboxAPI((Dropbox API))
    WhatsAppAPI((WhatsApp API))
    
    %% Administrator Interactions
    Administrator -->|creates| UC1
    Administrator -->|assigns| UC2
    Administrator -->|links| UC3
    Administrator -->|configures| UC4
    Administrator -->|edits| UC6
    Administrator -->|marks| UC7
    Administrator -->|exports| UC8
    Administrator -->|views| UC9
    Administrator -->|creates| UC11
    Administrator -->|modifies| UC13
    Administrator -->|deletes any| UC14
    Administrator -->|sends| UC20
    Administrator -->|uploads| UC25
    Administrator -->|deletes| UC29
    Administrator -->|accesses| UC42
    
    %% Client Interactions
    Client -->|views| UC10
    Client -->|views| UC5
    Client -->|creates for admin| UC11
    Client -->|modifies in project| UC13
    Client -->|deletes own| UC14
    Client -->|confirms| UC16
    Client -->|sends| UC20
    Client -->|views| UC21
    Client -->|uploads| UC25
    Client -->|downloads| UC26
    Client -->|configures| UC33
    Client -->|accesses| UC42
    
    %% Special User Interactions
    SpecialUser -->|views based on permissions| UC10
    SpecialUser -->|views| UC5
    SpecialUser -->|views| UC19
    SpecialUser -->|views| UC21
    SpecialUser -.->|if permitted| UC20
    SpecialUser -.->|if permitted| UC25
    SpecialUser -.->|if permitted| UC26
    SpecialUser -->|accesses| UC42
    
    %% System Managed Processes
    System -.->|manages| UC27
    System -.->|validates| UC44
    System -.->|manages| UC45
    System -.->|performs| UC46
    System -.->|performs| UC47
    System -.->|records| UC48
    System -.->|enforces| UC49
    System -.->|handles| UC50
    System -.->|generates| UC31
    System -.->|calculates| UC38
    System -.->|updates| UC39
    
    %% Include Relationships - Project Management
    UC1 -->|includes| UC27
    UC1 -->|includes| UC2
    UC1 -.->|triggers| UC31
    UC2 -->|includes| UC49
    UC3 -->|includes| UC4
    UC7 -.->|triggers| UC31
    UC9 -->|includes| UC38
    UC10 -->|includes| UC49
    
    %% Include Relationships - Task Management
    UC11 -->|includes| UC12
    UC11 -->|includes| UC18
    UC11 -.->|may include| UC17
    UC12 -.->|triggers| UC31
    UC13 -->|includes| UC44
    UC14 -->|includes| UC44
    UC15 -.->|triggers| UC31
    UC15 -.->|may trigger| UC16
    UC16 -.->|triggers| UC31
    UC16 -->|includes| UC15
    
    %% Include Relationships - Messaging
    UC20 -.->|may include| UC22
    UC20 -.->|triggers| UC31
    UC20 -->|includes| UC44
    UC21 -->|includes| UC23
    UC22 -->|includes| UC25
    UC24 -->|includes| UC39
    
    %% Include Relationships - Files
    UC25 -->|includes| UC44
    UC26 -->|includes| UC44
    UC27 -.->|interacts with| DropboxAPI
    UC25 -.->|uploads to| DropboxAPI
    UC26 -.->|downloads from| DropboxAPI
    UC29 -.->|deletes from| DropboxAPI
    UC30 -.->|generates via| DropboxAPI
    
    %% Include Relationships - Notifications
    UC31 -->|includes| UC39
    UC32 -.->|sends via| WhatsAppAPI
    UC31 -.->|may trigger| UC32
    UC33 -->|includes| UC44
    
    %% Include Relationships - Visualizations
    UC36 -->|includes| UC38
    UC36 -->|includes| UC24
    UC36 -->|includes| UC40
    UC37 -->|includes| UC38
    UC38 -->|includes| UC39
    UC40 -.->|may include| UC41
    
    %% Include Relationships - Auth & System
    UC42 -->|includes| UC45
    UC43 -->|includes| UC45
    UC44 -->|includes| UC49
    UC46 -.->|triggers| UC39
    UC48 -->|includes| UC44
    
    %% Extended Flows
    UC5 -.->|displays| UC19
    UC5 -.->|displays| UC21
    UC5 -.->|displays| UC28
    UC8 -->|includes| UC44
    UC11 -.->|if incorrect| UC12
    UC15 -.->|on status Done| UC16
    UC16 -.->|on confirmation| UC38
    
    %% Styling
    style Administrator fill:#4A90E2
    style Client fill:#4A90E2
    style SpecialUser fill:#4A90E2
    style System fill:#E24A4A
    style DropboxAPI fill:#E24A4A
    style WhatsAppAPI fill:#E24A4A
    
    style UC1 fill:#90EE90
    style UC2 fill:#90EE90
    style UC7 fill:#90EE90
    style UC11 fill:#FFD700
    style UC12 fill:#FFD700
    style UC16 fill:#FFD700
    style UC20 fill:#FFD700
    style UC25 fill:#87CEEB
    style UC26 fill:#87CEEB
    style UC27 fill:#87CEEB
    style UC31 fill:#FFA07A
    style UC32 fill:#FFA07A
    style UC36 fill:#DDA0DD
    style UC37 fill:#DDA0DD
    style UC42 fill:#90EE90
    style UC43 fill:#90EE90
    style UC44 fill:#F0E68C
    style UC46 fill:#F0E68C
    style UC47 fill:#F0E68C
    style UC48 fill:#F0E68C
    style UC49 fill:#F0E68C
```