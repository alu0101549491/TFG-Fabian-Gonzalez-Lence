## CODE REVIEW TODO LIST - Cartographic Project Manager

> Scope: All files in `projects/4-CartographicProjectManager` (303 files total, excluding `node_modules`).
> This TODO list groups frontend + backend source, tests, and operational/configuration artifacts.

### Phase 1: Domain Layer Review
- [ ] **Group 1.1: Enumerations** (8 files)
  - Files:
    - src/domain/enumerations/access-right.ts
    - src/domain/enumerations/file-type.ts
    - src/domain/enumerations/notification-type.ts
    - src/domain/enumerations/project-status.ts
    - src/domain/enumerations/project-type.ts
    - src/domain/enumerations/task-priority.ts
    - src/domain/enumerations/task-status.ts
    - src/domain/enumerations/user-role.ts
  - Priority: High
  - Estimated complexity: Low

- [ ] **Group 1.2: Value Objects** (2 files)
  - Files:
    - src/domain/value-objects/geo-coordinates.ts
    - backend/src/domain/value-objects/geo-coordinates.ts
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 1.3: Entities** (8 files)
  - Files:
    - src/domain/entities/file.ts
    - src/domain/entities/message.ts
    - src/domain/entities/notification.ts
    - src/domain/entities/permission.ts
    - src/domain/entities/project.ts
    - src/domain/entities/task-history.ts
    - src/domain/entities/task.ts
    - src/domain/entities/user.ts
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 1.4: Repository Interfaces** (14 files)
  - Files:
    - src/domain/repositories/file-repository.interface.ts
    - src/domain/repositories/message-repository.interface.ts
    - src/domain/repositories/notification-repository.interface.ts
    - src/domain/repositories/permission-repository.interface.ts
    - src/domain/repositories/project-repository.interface.ts
    - src/domain/repositories/task-history-repository.interface.ts
    - src/domain/repositories/task-repository.interface.ts
    - src/domain/repositories/user-repository.interface.ts
    - backend/src/domain/repositories/file.repository.interface.ts
    - backend/src/domain/repositories/message.repository.interface.ts
    - backend/src/domain/repositories/notification.repository.interface.ts
    - backend/src/domain/repositories/project.repository.interface.ts
    - backend/src/domain/repositories/task.repository.interface.ts
    - backend/src/domain/repositories/user.repository.interface.ts
  - Priority: High
  - Estimated complexity: Medium

### Phase 2: Application Layer Review
- [ ] **Group 2.1: DTOs** (13 files)
  - Files:
    - src/application/dto/auth-result.dto.ts
    - src/application/dto/backup-result.dto.ts
    - src/application/dto/calendar-data.dto.ts
    - src/application/dto/export-filters.dto.ts
    - src/application/dto/export-result.dto.ts
    - src/application/dto/file-data.dto.ts
    - src/application/dto/message-data.dto.ts
    - src/application/dto/notification-data.dto.ts
    - src/application/dto/project-data.dto.ts
    - src/application/dto/project-details.dto.ts
    - src/application/dto/task-data.dto.ts
    - src/application/dto/user-data.dto.ts
    - src/application/dto/validation-result.dto.ts
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 2.2: Service Interfaces** (9 files)
  - Files:
    - src/application/interfaces/authentication-service.interface.ts
    - src/application/interfaces/authorization-service.interface.ts
    - src/application/interfaces/backup-service.interface.ts
    - src/application/interfaces/export-service.interface.ts
    - src/application/interfaces/file-service.interface.ts
    - src/application/interfaces/message-service.interface.ts
    - src/application/interfaces/notification-service.interface.ts
    - src/application/interfaces/project-service.interface.ts
    - src/application/interfaces/task-service.interface.ts
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 2.3: Service Implementations** (16 files)
  - Files:
    - src/application/services/authentication.service.ts
    - src/application/services/authorization.service.ts
    - src/application/services/backup.service.ts
    - src/application/services/export.service.ts
    - src/application/services/file.service.ts
    - src/application/services/message.service.ts
    - src/application/services/notification.service.ts
    - src/application/services/project.service.ts
    - src/application/services/task.service.ts
    - src/application/services/common/errors.ts
    - src/application/services/common/utils.ts
    - backend/src/application/services/auth.service.ts
    - backend/src/application/services/audit.service.ts
    - backend/src/application/services/backup.service.ts
    - backend/src/application/services/deadline-reminder.service.ts
    - backend/src/application/services/export.service.ts
  - Priority: Critical
  - Estimated complexity: High

### Phase 3: Infrastructure Layer Review
- [ ] **Group 3.1: HTTP Client** (1 file)
  - Files:
    - src/infrastructure/http/axios.client.ts
  - Priority: Critical
  - Estimated complexity: High

- [ ] **Group 3.2: WebSocket Handler** (2 files)
  - Files:
    - src/infrastructure/websocket/socket.handler.ts
    - backend/src/infrastructure/websocket/socket.server.ts
  - Priority: Critical
  - Estimated complexity: High

- [ ] **Group 3.3: External Services** (3 files)
  - Files:
    - src/infrastructure/external-services/dropbox.service.ts
    - src/infrastructure/external-services/whatsapp.gateway.ts
    - backend/src/infrastructure/external-services/dropbox.service.ts
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 3.4: Repository Implementations** (17 files)
  - Files:
    - src/infrastructure/repositories/auth.repository.ts
    - src/infrastructure/repositories/file.repository.ts
    - src/infrastructure/repositories/message.repository.ts
    - src/infrastructure/repositories/notification.repository.ts
    - src/infrastructure/repositories/permission.repository.ts
    - src/infrastructure/repositories/project.repository.ts
    - src/infrastructure/repositories/task-history.repository.ts
    - src/infrastructure/repositories/task.repository.ts
    - src/infrastructure/repositories/user.repository.ts
    - backend/src/infrastructure/repositories/audit-log.repository.ts
    - backend/src/infrastructure/repositories/file.repository.ts
    - backend/src/infrastructure/repositories/message.repository.ts
    - backend/src/infrastructure/repositories/notification.repository.ts
    - backend/src/infrastructure/repositories/permission.repository.ts
    - backend/src/infrastructure/repositories/project.repository.ts
    - backend/src/infrastructure/repositories/task.repository.ts
    - backend/src/infrastructure/repositories/user.repository.ts
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 3.5: Persistence & Storage** (2 files)
  - Files:
    - src/infrastructure/persistence/token.storage.ts
    - backend/src/infrastructure/database/prisma.client.ts
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 3.6: Backend Auth & Scheduler** (5 files)
  - Files:
    - backend/src/infrastructure/auth/auth.middleware.ts
    - backend/src/infrastructure/auth/jwt.service.ts
    - backend/src/infrastructure/auth/password.service.ts
    - backend/src/infrastructure/scheduler/backup.scheduler.ts
    - backend/src/infrastructure/scheduler/deadline-reminder.scheduler.ts
  - Priority: Critical
  - Estimated complexity: High

### Phase 4: Shared Layer Review
- [ ] **Group 4.1: Constants** (2 files)
  - Files:
    - src/shared/constants.ts
    - backend/src/shared/constants.ts
  - Priority: Medium
  - Estimated complexity: Low

- [ ] **Group 4.2: Utilities** (6 files)
  - Files:
    - src/shared/utils.ts
    - backend/src/shared/utils.ts
    - backend/src/shared/errors.ts
    - backend/src/shared/logger.ts
    - backend/src/shared/types.ts
    - backend/src/shared/index.ts
  - Priority: Medium
  - Estimated complexity: Medium

### Phase 5: Presentation Layer - Core Review
- [ ] **Group 5.1: Styles** (2 files)
  - Files:
    - src/presentation/styles/main.css
    - src/presentation/styles/variables.css
  - Priority: Medium
  - Estimated complexity: Low

- [ ] **Group 5.2: Router** (1 file)
  - Files:
    - src/presentation/router/index.ts
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 5.3: Stores (Pinia)** (6 files)
  - Files:
    - src/presentation/stores/auth.store.ts
    - src/presentation/stores/message.store.ts
    - src/presentation/stores/notification.store.ts
    - src/presentation/stores/project.store.ts
    - src/presentation/stores/task.store.ts
    - src/presentation/stores/user.store.ts
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 5.4: Composables** (7 files)
  - Files:
    - src/presentation/composables/use-auth.ts
    - src/presentation/composables/use-files.ts
    - src/presentation/composables/use-messages.ts
    - src/presentation/composables/use-notifications.ts
    - src/presentation/composables/use-projects.ts
    - src/presentation/composables/use-tasks.ts
    - src/presentation/composables/use-users.ts
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 5.5: Backend App Bootstrap** (1 file)
  - Files:
    - backend/src/presentation/app.ts
  - Priority: Critical
  - Estimated complexity: High

- [ ] **Group 5.6: Backend Routes** (11 files)
  - Files:
    - backend/src/presentation/routes/audit-log.routes.ts
    - backend/src/presentation/routes/auth.routes.ts
    - backend/src/presentation/routes/backup.routes.ts
    - backend/src/presentation/routes/export.routes.ts
    - backend/src/presentation/routes/file.routes.ts
    - backend/src/presentation/routes/index.ts
    - backend/src/presentation/routes/message.routes.ts
    - backend/src/presentation/routes/notification.routes.ts
    - backend/src/presentation/routes/project.routes.ts
    - backend/src/presentation/routes/task.routes.ts
    - backend/src/presentation/routes/user.routes.ts
  - Priority: Critical
  - Estimated complexity: High

- [ ] **Group 5.7: Backend Controllers** (11 files)
  - Files:
    - backend/src/presentation/controllers/audit-log.controller.ts
    - backend/src/presentation/controllers/auth.controller.ts
    - backend/src/presentation/controllers/backup.controller.ts
    - backend/src/presentation/controllers/export.controller.ts
    - backend/src/presentation/controllers/file.controller.ts
    - backend/src/presentation/controllers/index.ts
    - backend/src/presentation/controllers/message.controller.ts
    - backend/src/presentation/controllers/notification.controller.ts
    - backend/src/presentation/controllers/project.controller.ts
    - backend/src/presentation/controllers/task.controller.ts
    - backend/src/presentation/controllers/user.controller.ts
  - Priority: Critical
  - Estimated complexity: High

- [ ] **Group 5.8: Backend Middlewares** (3 files)
  - Files:
    - backend/src/presentation/middlewares/error-handler.middleware.ts
    - backend/src/presentation/middlewares/index.ts
    - backend/src/presentation/middlewares/upload.middleware.ts
  - Priority: Critical
  - Estimated complexity: High

### Phase 6: Presentation Layer - Common Components Review
- [ ] **Group 6.1: Common Components** (15 files)
  - Files:
    - src/presentation/components/common/AppBadge.vue
    - src/presentation/components/common/AppButton.vue
    - src/presentation/components/common/AppCard.vue
    - src/presentation/components/common/AppConfirmDialog.vue
    - src/presentation/components/common/AppEmptyState.vue
    - src/presentation/components/common/AppFooter.vue
    - src/presentation/components/common/AppHeader.vue
    - src/presentation/components/common/AppInput.vue
    - src/presentation/components/common/AppModal.vue
    - src/presentation/components/common/AppSelect.vue
    - src/presentation/components/common/AppSidebar.vue
    - src/presentation/components/common/AppSpinner.vue
    - src/presentation/components/common/AppTextarea.vue
    - src/presentation/components/common/index.ts
    - src/presentation/components/common/LoadingSpinner.vue
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 6.2: Layout Components** (2 files)
  - Files:
    - src/presentation/components/layout/AppHeader.vue
    - src/presentation/components/layout/AppSidebar.vue
  - Priority: High
  - Estimated complexity: Medium

### Phase 7: Presentation Layer - Feature Components Review
- [ ] **Group 7.1: Project Components** (3 files)
  - Files:
    - src/presentation/components/project/ProjectCard.vue
    - src/presentation/components/project/ProjectForm.vue
    - src/presentation/components/project/ProjectSummary.vue
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 7.2: Task Components** (4 files)
  - Files:
    - src/presentation/components/task/TaskCard.vue
    - src/presentation/components/task/TaskForm.vue
    - src/presentation/components/task/TaskHistory.vue
    - src/presentation/components/task/TaskList.vue
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 7.3: Message Components** (4 files)
  - Files:
    - src/presentation/components/message/index.ts
    - src/presentation/components/message/MessageBubble.vue
    - src/presentation/components/message/MessageInput.vue
    - src/presentation/components/message/MessageList.vue
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 7.4: File Components** (3 files)
  - Files:
    - src/presentation/components/file/index.ts
    - src/presentation/components/file/FileList.vue
    - src/presentation/components/file/FileUploader.vue
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 7.5: Notification Components** (3 files)
  - Files:
    - src/presentation/components/notification/index.ts
    - src/presentation/components/notification/NotificationItem.vue
    - src/presentation/components/notification/NotificationList.vue
  - Priority: Medium
  - Estimated complexity: Medium

- [ ] **Group 7.6: Calendar Components** (2 files)
  - Files:
    - src/presentation/components/calendar/index.ts
    - src/presentation/components/calendar/CalendarWidget.vue
  - Priority: Medium
  - Estimated complexity: Medium

### Phase 8: Presentation Layer - Views Review
- [ ] **Group 8.1: Views** (13 files)
  - Files:
    - src/presentation/views/BackupView.vue
    - src/presentation/views/CalendarView.vue
    - src/presentation/views/DashboardView.vue
    - src/presentation/views/ForbiddenView.vue
    - src/presentation/views/LoginView-complete.vue
    - src/presentation/views/LoginView.vue
    - src/presentation/views/NotFoundView.vue
    - src/presentation/views/NotificationsView.vue
    - src/presentation/views/ProjectDetailsView.vue
    - src/presentation/views/ProjectListView.vue
    - src/presentation/views/RegisterView.vue
    - src/presentation/views/SettingsView.vue
    - src/presentation/views/UserManagementView.vue
  - Priority: High
  - Estimated complexity: High

### Phase 9: App Entry & Configuration Review
- [ ] **Group 9.1: App Entry** (3 files)
  - Files:
    - src/App.vue
    - src/main.ts
    - backend/src/server.ts
  - Priority: Critical
  - Estimated complexity: High

- [ ] **Group 9.2: Index/Barrel Exports** (40 files)
  - Files:
    - src/application/dto/index.ts
    - src/application/index.ts
    - src/application/interfaces/index.ts
    - src/application/services/index.ts
    - src/domain/entities/index.ts
    - src/domain/enumerations/index.ts
    - src/domain/index.ts
    - src/domain/repositories/index.ts
    - src/domain/value-objects/index.ts
    - src/infrastructure/external-services/index.ts
    - src/infrastructure/http/index.ts
    - src/infrastructure/index.ts
    - src/infrastructure/repositories/index.ts
    - src/infrastructure/websocket/index.ts
    - src/presentation/composables/index.ts
    - src/presentation/components/calendar/index.ts
    - src/presentation/components/common/index.ts
    - src/presentation/components/file/index.ts
    - src/presentation/components/message/index.ts
    - src/presentation/components/notification/index.ts
    - src/presentation/index.ts
    - src/presentation/stores/index.ts
    - src/shared/index.ts
    - backend/src/domain/index.ts
    - backend/src/domain/repositories/index.ts
    - backend/src/domain/value-objects/index.ts
    - backend/src/application/index.ts
    - backend/src/application/services/index.ts
    - backend/src/infrastructure/auth/index.ts
    - backend/src/infrastructure/database/index.ts
    - backend/src/infrastructure/external-services/index.ts
    - backend/src/infrastructure/index.ts
    - backend/src/infrastructure/repositories/index.ts
    - backend/src/infrastructure/scheduler/index.ts
    - backend/src/infrastructure/websocket/index.ts
    - backend/src/presentation/controllers/index.ts
    - backend/src/presentation/index.ts
    - backend/src/presentation/middlewares/index.ts
    - backend/src/presentation/routes/index.ts
    - backend/src/shared/index.ts
  - Priority: Medium
  - Estimated complexity: Low

- [ ] **Group 9.3: Public Assets** (2 files)
  - Files:
    - public/.gitkeep
    - public/robots.txt
  - Priority: Low
  - Estimated complexity: Low

### Phase 10: Cross-Cutting Concerns Review
- [ ] **Group 10.1: Type Definitions** (2 files)
  - Files:
    - src/vite-env.d.ts
    - backend/src/shared/types.ts
  - Priority: High
  - Estimated complexity: Medium

- [ ] **Group 10.2: Configuration Files** (24 files)
  - Files:
    - .env.development
    - .env.example
    - .env.production
    - .gitignore
    - eslint.config.mjs
    - index.html
    - jest.config.js
    - jest.setup.js
    - package-lock.json
    - package.json
    - playwright.config.ts
    - tsconfig.json
    - tsconfig.node.json
    - typedoc.json
    - vite.config.ts
    - backend/.env
    - backend/.env.example
    - backend/.env.railway
    - backend/.gitignore
    - backend/nixpacks.toml
    - backend/package-lock.json
    - backend/package.json
    - backend/railway.json
    - backend/tsconfig.json
  - Priority: Medium
  - Estimated complexity: Low

- [ ] **Group 10.3: Database Schema & Migrations (Prisma)** (10 files)
  - Files:
    - backend/prisma/schema.prisma
    - backend/prisma/seed.ts
    - backend/prisma/seed-production.ts
    - backend/prisma/migrations/migration_lock.toml
    - backend/prisma/migrations/20260224161201_/migration.sql
    - backend/prisma/migrations/20260301133940_add_read_by_user_ids/migration.sql
    - backend/prisma/migrations/20260301200605_add_whatsapp_notifications/migration.sql
    - backend/prisma/migrations/20260302170957_remove_whatsapp_integration/migration.sql
    - backend/prisma/migrations/20260302172347_add_audit_log_system/migration.sql
    - backend/prisma/migrations/20260304113557_add_message_file_ids/migration.sql
  - Priority: High
  - Estimated complexity: High

- [ ] **Group 10.4: Operational Scripts & Manual Test Utilities** (14 files)
  - Files:
    - initialization.sh
    - backend/restart-backend.sh
    - backend/setup.sh
    - backend/update-dropbox-token.sh
    - backend/scripts/check-messages.ts
    - backend/scripts/get-dropbox-refresh-token.ts
    - backend/scripts/mark-sender-messages-read.ts
    - backend/scripts/DROPBOX_OAUTH_SETUP.md
    - backend/test-dropbox-simple.ts
    - backend/test-dropbox-token.ts
    - backend/test-large-upload.ts
    - backend/DROPBOX-TOKEN-UPDATE.txt
    - backend/test-dropbox.sh
    - backend/test-upload-endpoint.sh
  - Priority: Medium
  - Estimated complexity: Medium

- [ ] **Group 10.5: Documentation & Project Notes** (18 files)
  - Files:
    - DEBUGGING-AUTH-ERRORS.md
    - INTEGRATION.md
    - RAILWAY-DEPLOYMENT.md
    - TASK-PERMISSION-CHANGES.md
    - TESTING-FILE-UPLOAD-UI.md
    - WHATSAPP-REMOVAL-COMPLETE.md
    - docs/ARCHITECTURE.md
    - docs/BACKEND-IMPLEMENTATION.md
    - docs/DROPBOX-DEPLOYMENT.md
    - docs/DROPBOX-INTEGRATION.md
    - docs/IMPLEMENTATION-SUMMARY.md
    - docs/specification.md
    - docs/TODO-STATUS.md
    - e2e/README.md
    - backend/README.md
    - backend/RAILWAY.md
    - backend/SETUP.md
    - README.md
  - Priority: Low
  - Estimated complexity: Low

- [ ] **Group 10.6: Operational Artifacts (Logs/Backups/Misc)** (4 files)
  - Files:
    - backend/backups/.gitignore
    - backend/logs/app.log
    - backend/logs/error.log
    - backend/tgres psql -h localhost -U postgres -d cartographic_manager -t -A -F, -c SELECT "contractDate", "coordinateX", "coordinateY" FROM projects LIMIT 1;
  - Priority: Low
  - Estimated complexity: Low

---

## SUMMARY
- Total Files to Review: 303
- Total Review Groups: 41
- Estimated Review Time: 20-28 hours
- Critical Priority Groups: 9
- High Priority Groups: 21
- Medium Priority Groups: 8
- Low Priority Groups: 3
