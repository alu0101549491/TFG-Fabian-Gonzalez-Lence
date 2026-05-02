# CODE REVIEW PLANNING - TODO LIST GENERATION

## OBJECTIVE
You are a Senior Code Reviewer Agent. Your task is to analyze the entire codebase of the **Cartographic Project Manager (CPM)** project and create a comprehensive TODO List that organizes all code files into logical review groups. This planning phase is critical for systematic code review.

## PROJECT CONTEXT

**Project:** Cartographic Project Manager (CPM)
**Description:** A web and mobile application for managing cartographic projects with administrator-client collaboration, task management (5 states), internal messaging with file attachments, calendar view, and Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer (Entities, Value Objects, Enumerations, Repository Interfaces)
- Application Layer (DTOs, Service Interfaces)
- Infrastructure Layer (HTTP Client, WebSocket, External Services, Repository Implementations)
- Presentation Layer (Components, Composables, Stores, Router, Views)
- Shared Layer (Constants, Utils)

**Tech Stack:**
- Frontend: TypeScript 5.x, Vue.js 3, Vite, Pinia, Vue Router
- Real-time: Socket.io
- HTTP: Axios
- Code Style: Google TypeScript Style Guide

## YOUR TASK

1. **Scan the entire codebase** starting from `src/` directory
2. **Identify ALL files** that need to be reviewed (no file should be missed)
3. **Organize files into logical review groups** based on:
   - Layer (Domain, Application, Infrastructure, Presentation, Shared)
   - Module/Feature (Auth, Project, Task, Message, File, Notification, Calendar)
   - File type (Entities, DTOs, Services, Components, Views, etc.)
4. **Create a TODO List** with clear, actionable items

## TODO LIST FORMAT

Generate the TODO List in the following format:

```
## CODE REVIEW TODO LIST - Cartographic Project Manager

### Phase 1: Domain Layer Review
- [ ] **Group 1.1: Enumerations** (X files)
  - Files: [list all enumeration files]
  - Priority: High
  - Estimated complexity: Low
  
- [ ] **Group 1.2: Value Objects** (X files)
  - Files: [list all value object files]
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 1.3: Entities** (X files)
  - Files: [list all entity files]
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 1.4: Repository Interfaces** (X files)
  - Files: [list all repository interface files]
  - Priority: High
  - Estimated complexity: Medium

### Phase 2: Application Layer Review
- [ ] **Group 2.1: DTOs** (X files)
  - Files: [list all DTO files]
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 2.2: Service Interfaces** (X files)
  - Files: [list all service interface files]
  - Priority: High
  - Estimated complexity: Medium

### Phase 3: Infrastructure Layer Review
- [ ] **Group 3.1: HTTP Client** (X files)
  - Files: [list files]
  - Priority: Critical
  - Estimated complexity: High

- [ ] **Group 3.2: WebSocket Handler** (X files)
  - Files: [list files]
  - Priority: Critical
  - Estimated complexity: High

- [ ] **Group 3.3: External Services** (X files)
  - Files: [list files]
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 3.4: Repository Implementations** (X files)
  - Files: [list files]
  - Priority: High
  - Estimated complexity: High

### Phase 4: Shared Layer Review
- [ ] **Group 4.1: Constants** (X files)
  - Files: [list files]
  - Priority: Medium
  - Estimated complexity: Low

- [ ] **Group 4.2: Utilities** (X files)
  - Files: [list files]
  - Priority: Medium
  - Estimated complexity: Medium

### Phase 5: Presentation Layer - Core Review
- [ ] **Group 5.1: Styles** (X files)
  - Files: [list files]
  - Priority: Medium
  - Estimated complexity: Low

- [ ] **Group 5.2: Router** (X files)
  - Files: [list files]
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 5.3: Stores (Pinia)** (X files)
  - Files: [list files]
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 5.4: Composables** (X files)
  - Files: [list files]
  - Priority: High
  - Estimated complexity: High

### Phase 6: Presentation Layer - Common Components Review
- [ ] **Group 6.1: Common Components** (X files)
  - Files: [list all common component files]
  - Priority: High
  - Estimated complexity: Medium

### Phase 7: Presentation Layer - Feature Components Review
- [ ] **Group 7.1: Project Components** (X files)
  - Files: [list files]
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 7.2: Task Components** (X files)
  - Files: [list files]
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 7.3: Message Components** (X files)
  - Files: [list files]
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 7.4: File Components** (X files)
  - Files: [list files]
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 7.5: Notification Components** (X files)
  - Files: [list files]
  - Priority: Medium
  - Estimated complexity: Medium

- [ ] **Group 7.6: Calendar Components** (X files)
  - Files: [list files]
  - Priority: Medium
  - Estimated complexity: Medium

### Phase 8: Presentation Layer - Views Review
- [ ] **Group 8.1: Views** (X files)
  - Files: [list all view files]
  - Priority: High
  - Estimated complexity: High

### Phase 9: App Entry & Configuration Review
- [ ] **Group 9.1: App Entry** (X files)
  - Files: App.vue, main.ts
  - Priority: Critical
  - Estimated complexity: High

- [ ] **Group 9.2: Index/Barrel Exports** (X files)
  - Files: [list all index.ts files]
  - Priority: Medium
  - Estimated complexity: Low

### Phase 10: Cross-Cutting Concerns Review
- [ ] **Group 10.1: Type Definitions** (X files)
  - Files: [list .d.ts files, type files]
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 10.2: Configuration Files** (X files)
  - Files: vite.config.ts, tsconfig.json, etc.
  - Priority: Medium
  - Estimated complexity: Low

---

## SUMMARY
- Total Files to Review: X
- Total Review Groups: X
- Estimated Review Time: X hours
- Critical Priority Groups: X
- High Priority Groups: X
- Medium Priority Groups: X
```

## INSTRUCTIONS

1. **Start by exploring the file system** to identify all files
2. **Do not assume files exist** - verify each file's presence
3. **Group related files together** for efficient review
4. **Assign appropriate priority levels:**
   - Critical: Core functionality, security-sensitive, high failure impact
   - High: Important business logic, frequently used
   - Medium: Supporting functionality, less critical
   - Low: Documentation, configuration (minimal impact)
5. **Estimate complexity** based on file size, dependencies, and logic complexity
6. **Ensure no file is missed** - double-check all directories

## OUTPUT

Generate the complete TODO List and save your progress. This TODO List will be used in the next phase to systematically review each group and generate incident reports.

Begin by scanning the codebase now.
