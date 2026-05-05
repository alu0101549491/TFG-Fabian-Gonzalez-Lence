# Cartographic Project Manager — Project Structure

```
4-CartographicProjectManager/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── file.ts
│   │   │   ├── message.ts
│   │   │   ├── notification.ts
│   │   │   ├── permission.ts
│   │   │   ├── project.ts
│   │   │   ├── task-history.ts
│   │   │   ├── task.ts
│   │   │   └── user.ts
│   │   ├── enumerations/
│   │   │   ├── access-right.ts
│   │   │   ├── file-type.ts
│   │   │   ├── notification-type.ts
│   │   │   ├── project-status.ts
│   │   │   ├── project-type.ts
│   │   │   ├── task-history-action.ts
│   │   │   ├── task-priority.ts
│   │   │   ├── task-status.ts
│   │   │   └── user-role.ts
│   │   ├── repositories/
│   │   │   ├── file-repository.interface.ts
│   │   │   ├── message-repository.interface.ts
│   │   │   ├── notification-repository.interface.ts
│   │   │   ├── permission-repository.interface.ts
│   │   │   ├── project-repository.interface.ts
│   │   │   ├── task-history-repository.interface.ts
│   │   │   ├── task-repository.interface.ts
│   │   │   └── user-repository.interface.ts
│   │   └── value-objects/
│   │       └── geo-coordinates.ts
│   ├── application/
│   │   ├── auth/
│   │   │   └── auth-result.helpers.ts
│   │   ├── dto/
│   │   │   ├── auth-result.dto.ts
│   │   │   ├── backup-result.dto.ts
│   │   │   ├── calendar-data.dto.ts
│   │   │   ├── export-filters.dto.ts
│   │   │   ├── export-result.dto.ts
│   │   │   ├── file-data.dto.ts
│   │   │   ├── message-data.dto.ts
│   │   │   ├── notification-data.dto.ts
│   │   │   ├── project-data.dto.ts
│   │   │   ├── project-details.dto.ts
│   │   │   ├── task-data.dto.ts
│   │   │   ├── user-data.dto.ts
│   │   │   └── validation-result.dto.ts
│   │   ├── interfaces/
│   │   │   ├── authorization-service.interface.ts
│   │   │   ├── backup-service.interface.ts
│   │   │   ├── export-service.interface.ts
│   │   │   ├── message-service.interface.ts
│   │   │   ├── notification-service.interface.ts
│   │   │   ├── project-service.interface.ts
│   │   │   └── task-service.interface.ts
│   │   └── services/
│   │       ├── authorization.service.ts
│   │       ├── backup.service.ts
│   │       ├── export.service.ts
│   │       ├── message.service.ts
│   │       ├── notification.service.ts
│   │       ├── project.service.ts
│   │       └── task.service.ts
│   ├── infrastructure/
│   │   ├── http/
│   │   │   └── axios.client.ts
│   │   ├── persistence/
│   │   │   └── token.storage.interface.ts
│   │   ├── repositories/
│   │   │   ├── auth.repository.ts
│   │   │   ├── file.repository.ts
│   │   │   ├── message.repository.ts
│   │   │   ├── notification.repository.ts
│   │   │   ├── permission.repository.ts
│   │   │   ├── project.repository.ts
│   │   │   ├── task-history.repository.ts
│   │   │   ├── task.repository.ts
│   │   │   ├── user-management.repository.ts
│   │   │   └── user.repository.ts
│   │   └── websocket/
│   │       └── socket.handler.ts
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── calendar/
│   │   │   │   └── CalendarWidget.vue
│   │   │   ├── common/
│   │   │   │   ├── AppBadge.vue
│   │   │   │   ├── AppButton.vue
│   │   │   │   ├── AppCard.vue
│   │   │   │   ├── AppConfirmDialog.vue
│   │   │   │   ├── AppEmptyState.vue
│   │   │   │   ├── AppFooter.vue
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppInput.vue
│   │   │   │   ├── AppModal.vue
│   │   │   │   ├── AppSelect.vue
│   │   │   │   ├── AppSidebar.vue
│   │   │   │   ├── AppSpinner.vue
│   │   │   │   ├── AppTextarea.vue
│   │   │   │   └── LoadingSpinner.vue
│   │   │   ├── file/
│   │   │   │   ├── FileList.vue
│   │   │   │   └── FileUploader.vue
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   └── AppSidebar.vue
│   │   │   ├── message/
│   │   │   │   ├── MessageBubble.vue
│   │   │   │   ├── MessageInput.vue
│   │   │   │   └── MessageList.vue
│   │   │   ├── notification/
│   │   │   │   ├── NotificationItem.vue
│   │   │   │   └── NotificationList.vue
│   │   │   ├── project/
│   │   │   │   ├── ProjectCard.vue
│   │   │   │   ├── ProjectForm.vue
│   │   │   │   └── ProjectSummary.vue
│   │   │   └── task/
│   │   │       ├── TaskCard.vue
│   │   │       ├── TaskForm.vue
│   │   │       ├── TaskHistory.vue
│   │   │       └── TaskList.vue
│   │   ├── composables/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-files.ts
│   │   │   ├── use-messages.ts
│   │   │   ├── use-notifications.ts
│   │   │   ├── use-projects.ts
│   │   │   ├── use-tasks.ts
│   │   │   └── use-users.ts
│   │   ├── mappings/
│   │   │   └── domain-enum-ui.ts
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── message.store.ts
│   │   │   ├── notification.store.ts
│   │   │   ├── project.store.ts
│   │   │   ├── task.store.ts
│   │   │   └── user.store.ts
│   │   └── views/
│   │       ├── BackupView.vue
│   │       ├── CalendarView.vue
│   │       ├── DashboardView.vue
│   │       ├── ForbiddenView.vue
│   │       ├── LoginView.vue
│   │       ├── NotFoundView.vue
│   │       ├── NotificationsView.vue
│   │       ├── ProjectDetailsView.vue
│   │       ├── ProjectListView.vue
│   │       ├── RegisterView.vue
│   │       ├── SettingsView.vue
│   │       └── UserManagementView.vue
│   ├── shared/
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── App.vue
│   ├── main.ts
│   └── vite-env.d.ts
├── backend/
│   └── src/
│       ├── domain/
│       │   └── value-objects/
│       │       └── geo-coordinates.ts
│       ├── application/
│       │   └── services/
│       │       ├── audit.service.ts
│       │       ├── auth.service.ts
│       │       ├── backup.service.ts
│       │       ├── deadline-reminder.service.ts
│       │       └── export.service.ts
│       ├── infrastructure/
│       │   ├── auth/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── jwt.service.ts
│       │   │   └── password.service.ts
│       │   ├── external-services/
│       │   │   └── dropbox.service.ts
│       │   ├── repositories/
│       │   │   ├── audit-log.repository.ts
│       │   │   ├── file.repository.ts
│       │   │   ├── message.repository.ts
│       │   │   ├── notification.repository.ts
│       │   │   ├── permission.repository.ts
│       │   │   ├── project.repository.ts
│       │   │   ├── task.repository.ts
│       │   │   └── user.repository.ts
│       │   └── websocket/
│       │       └── socket.server.ts
│       ├── presentation/
│       │   ├── controllers/
│       │   │   ├── audit-log.controller.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── backup.controller.ts
│       │   │   ├── export.controller.ts
│       │   │   ├── file.controller.ts
│       │   │   ├── message.controller.ts
│       │   │   ├── notification.controller.ts
│       │   │   ├── project.controller.ts
│       │   │   ├── task.controller.ts
│       │   │   ├── user.controller.ts
│       │   │   └── whatsapp.controller.ts
│       │   └── app.ts
│       ├── shared/
│       │   └── constants.ts
│       └── server.ts
├── e2e/
│   ├── critical/
│   │   ├── admin-pages.spec.ts
│   │   ├── auth-and-guards.spec.ts
│   │   ├── files-tab.spec.ts
│   │   ├── messaging.spec.ts
│   │   ├── notifications.spec.ts
│   │   ├── project-crud.spec.ts
│   │   ├── realtime.spec.ts
│   │   ├── security.spec.ts
│   │   └── task-workflow.spec.ts
│   ├── high/
│   │   └── navigation.spec.ts
│   └── medium/
│       ├── calendar.spec.ts
│       ├── dashboard.spec.ts
│       ├── notifications-empty-state.spec.ts
│       ├── notifications-filter-pagination.spec.ts
│       ├── notifications-navigation-delete.spec.ts
│       ├── notifications-workflow.spec.ts
│       ├── notifications.spec.ts
│       ├── projects-filter-sort.spec.ts
│       └── users-management.spec.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
└── jest.config.js
```
