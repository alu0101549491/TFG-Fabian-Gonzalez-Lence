# Tennis Tournament Manager — Project Structure

```
5-TennisTournamentManager/
├── src/
│   ├── application/
│   │   ├── dto/
│   │   │   ├── announcement.dto.ts
│   │   │   ├── bracket.dto.ts
│   │   │   ├── category.dto.ts
│   │   │   ├── common.dto.ts
│   │   │   ├── export.dto.ts
│   │   │   ├── gdpr.dto.ts
│   │   │   ├── index.ts
│   │   │   ├── match.dto.ts
│   │   │   ├── notification.dto.ts
│   │   │   ├── order-of-play.dto.ts
│   │   │   ├── payment.dto.ts
│   │   │   ├── ranking.dto.ts
│   │   │   ├── registration.dto.ts
│   │   │   ├── standing.dto.ts
│   │   │   ├── statistics.dto.ts
│   │   │   ├── tournament.dto.ts
│   │   │   └── user.dto.ts
│   │   ├── interfaces/
│   │   │   ├── authentication-service.interface.ts
│   │   │   ├── authorization-service.interface.ts
│   │   │   ├── bracket-generator.interface.ts
│   │   │   ├── bracket-service.interface.ts
│   │   │   ├── court-scheduler.interface.ts
│   │   │   ├── export-service.interface.ts
│   │   │   ├── gdpr-service.interface.ts
│   │   │   ├── index.ts
│   │   │   ├── match-service.interface.ts
│   │   │   ├── notification-channel-adapter.interface.ts
│   │   │   ├── notification-service.interface.ts
│   │   │   ├── order-of-play-service.interface.ts
│   │   │   ├── payment-service.interface.ts
│   │   │   ├── ranking-service.interface.ts
│   │   │   ├── registration-service.interface.ts
│   │   │   ├── standing-service.interface.ts
│   │   │   ├── statistics-service.interface.ts
│   │   │   └── tournament-service.interface.ts
│   │   ├── services/
│   │   │   ├── common/
│   │   │   │   ├── errors.ts
│   │   │   │   └── utils.ts
│   │   │   ├── generators/
│   │   │   │   ├── index.ts
│   │   │   │   ├── match-play.generator.ts
│   │   │   │   ├── round-robin.generator.ts
│   │   │   │   └── single-elimination.generator.ts
│   │   │   ├── notification/
│   │   │   │   ├── channels/
│   │   │   │   │   ├── email-channel.adapter.ts
│   │   │   │   │   ├── in-app-channel.adapter.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── telegram-channel.adapter.ts
│   │   │   │   │   └── web-push-channel.adapter.ts
│   │   │   │   └── notification-channel.factory.ts
│   │   │   ├── scheduling/
│   │   │   │   └── court-scheduler.ts
│   │   │   ├── announcement.service.ts
│   │   │   ├── authentication.service.ts
│   │   │   ├── authorization.service.ts
│   │   │   ├── bracket-generator.factory.ts
│   │   │   ├── bracket.service.ts
│   │   │   ├── category.service.ts
│   │   │   ├── export.service.ts
│   │   │   ├── gdpr.service.ts
│   │   │   ├── index.ts
│   │   │   ├── match.service.ts
│   │   │   ├── notification-preferences.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── order-of-play.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── phase-progression.service.ts
│   │   │   ├── phase.service.ts
│   │   │   ├── privacy.service.ts
│   │   │   ├── ranking.service.ts
│   │   │   ├── registration.service.ts
│   │   │   ├── result-confirmation.service.ts
│   │   │   ├── seeding.service.ts
│   │   │   ├── session-inactivity.service.ts
│   │   │   ├── standing.service.ts
│   │   │   ├── statistics.service.ts
│   │   │   ├── tiebreak-resolver.service.ts
│   │   │   ├── tournament.service.ts
│   │   │   ├── user-management.service.ts
│   │   │   └── user.service.ts
│   │   └── index.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── announcement.ts
│   │   │   ├── bracket.ts
│   │   │   ├── category.ts
│   │   │   ├── court.ts
│   │   │   ├── global-ranking.ts
│   │   │   ├── index.ts
│   │   │   ├── match-result.ts
│   │   │   ├── match.ts
│   │   │   ├── notification.ts
│   │   │   ├── order-of-play.ts
│   │   │   ├── payment.ts
│   │   │   ├── phase.ts
│   │   │   ├── registration.ts
│   │   │   ├── sanction.ts
│   │   │   ├── score.ts
│   │   │   ├── standing.ts
│   │   │   ├── statistics.ts
│   │   │   ├── tournament.ts
│   │   │   └── user.ts
│   │   ├── enumerations/
│   │   │   ├── acceptance-type.ts
│   │   │   ├── age-group.ts
│   │   │   ├── announcement-type.ts
│   │   │   ├── bracket-type.ts
│   │   │   ├── confirmation-status.ts
│   │   │   ├── export-format.ts
│   │   │   ├── facility-type.ts
│   │   │   ├── gender.ts
│   │   │   ├── index.ts
│   │   │   ├── match-format.ts
│   │   │   ├── match-status.ts
│   │   │   ├── notification-channel.ts
│   │   │   ├── notification-type.ts
│   │   │   ├── payment-status.ts
│   │   │   ├── privacy-level.ts
│   │   │   ├── ranking-system.ts
│   │   │   ├── registration-status.ts
│   │   │   ├── sanction-type.ts
│   │   │   ├── surface.ts
│   │   │   ├── tournament-status.ts
│   │   │   ├── tournament-type.ts
│   │   │   └── user-role.ts
│   │   ├── repositories/
│   │   │   ├── announcement-repository.interface.ts
│   │   │   ├── bracket-repository.interface.ts
│   │   │   ├── category-repository.interface.ts
│   │   │   ├── court-repository.interface.ts
│   │   │   ├── global-ranking-repository.interface.ts
│   │   │   ├── index.ts
│   │   │   ├── match-repository.interface.ts
│   │   │   ├── match-result-repository.interface.ts
│   │   │   ├── notification-repository.interface.ts
│   │   │   ├── order-of-play-repository.interface.ts
│   │   │   ├── payment-repository.interface.ts
│   │   │   ├── phase-repository.interface.ts
│   │   │   ├── registration-repository.interface.ts
│   │   │   ├── sanction-repository.interface.ts
│   │   │   ├── score-repository.interface.ts
│   │   │   ├── standing-repository.interface.ts
│   │   │   ├── statistics-repository.interface.ts
│   │   │   ├── tournament-repository.interface.ts
│   │   │   └── user-repository.interface.ts
│   │   ├── value-objects/
│   │   │   ├── index.ts
│   │   │   └── privacy-settings.ts
│   │   └── index.ts
│   ├── environments/
│   │   ├── environment.prod.ts
│   │   └── environment.ts
│   ├── infrastructure/
│   │   ├── external/
│   │   │   ├── email-adapter.ts
│   │   │   ├── export-service.ts
│   │   │   ├── index.ts
│   │   │   ├── payment-gateway-adapter.ts
│   │   │   ├── telegram-adapter.ts
│   │   │   └── web-push-adapter.ts
│   │   ├── http/
│   │   │   ├── axios-client.ts
│   │   │   └── index.ts
│   │   ├── repositories/
│   │   │   ├── announcement.repository.ts
│   │   │   ├── bracket.repository.ts
│   │   │   ├── category.repository.ts
│   │   │   ├── court.repository.ts
│   │   │   ├── global-ranking.repository.ts
│   │   │   ├── index.ts
│   │   │   ├── match-result.repository.ts
│   │   │   ├── match.repository.ts
│   │   │   ├── notification.repository.ts
│   │   │   ├── order-of-play.repository.ts
│   │   │   ├── payment.repository.ts
│   │   │   ├── phase.repository.ts
│   │   │   ├── registration.repository.ts
│   │   │   ├── sanction.repository.ts
│   │   │   ├── score.repository.ts
│   │   │   ├── standing.repository.ts
│   │   │   ├── statistics.repository.ts
│   │   │   ├── tournament.repository.ts
│   │   │   └── user.repository.ts
│   │   ├── services/
│   │   │   └── partner-invitation.service.ts
│   │   ├── websocket/
│   │   │   ├── index.ts
│   │   │   ├── socket-client.ts
│   │   │   └── websocket.service.ts
│   │   └── index.ts
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   │   ├── header.component.css
│   │   │   │   └── header.component.ts
│   │   │   ├── notification-bell/
│   │   │   │   ├── notification-bell.component.css
│   │   │   │   ├── notification-bell.component.html
│   │   │   │   └── notification-bell.component.ts
│   │   │   └── visual-bracket/
│   │   │       ├── visual-bracket.component.css
│   │   │       ├── visual-bracket.component.html
│   │   │       └── visual-bracket.component.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── index.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── admin-dashboard/
│   │   │   │   │   ├── admin-dashboard.component.html
│   │   │   │   │   └── admin-dashboard.component.ts
│   │   │   │   ├── disputed-matches/
│   │   │   │   │   ├── disputed-matches.component.css
│   │   │   │   │   ├── disputed-matches.component.html
│   │   │   │   │   └── disputed-matches.component.ts
│   │   │   │   └── user-management/
│   │   │   │       └── user-management.component.ts
│   │   │   ├── announcements/
│   │   │   │   ├── announcement-create/
│   │   │   │   │   ├── announcement-create.component.css
│   │   │   │   │   ├── announcement-create.component.html
│   │   │   │   │   └── announcement-create.component.ts
│   │   │   │   ├── announcement-edit/
│   │   │   │   │   ├── announcement-edit.component.css
│   │   │   │   │   ├── announcement-edit.component.html
│   │   │   │   │   └── announcement-edit.component.ts
│   │   │   │   └── announcement-list/
│   │   │   │       ├── announcement-list.component.css
│   │   │   │       ├── announcement-list.component.html
│   │   │   │       └── announcement-list.component.ts
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.css
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.ts
│   │   │   │   └── register/
│   │   │   │       ├── register.component.html
│   │   │   │       └── register.component.ts
│   │   │   ├── brackets/
│   │   │   │   └── bracket-view/
│   │   │   │       ├── bracket-view.component.css
│   │   │   │       ├── bracket-view.component.html
│   │   │   │       └── bracket-view.component.ts
│   │   │   ├── courts/
│   │   │   │   └── court-management/
│   │   │   │       ├── court-management.component.css
│   │   │   │       ├── court-management.component.html
│   │   │   │       └── court-management.component.ts
│   │   │   ├── matches/
│   │   │   │   ├── match-detail/
│   │   │   │   │   ├── match-detail.component.css
│   │   │   │   │   ├── match-detail.component.html
│   │   │   │   │   └── match-detail.component.ts
│   │   │   │   ├── match-list/
│   │   │   │   │   ├── match-list.component.css
│   │   │   │   │   ├── match-list.component.html
│   │   │   │   │   └── match-list.component.ts
│   │   │   │   └── my-matches/
│   │   │   │       ├── my-matches.component.css
│   │   │   │       ├── my-matches.component.html
│   │   │   │       └── my-matches.component.ts
│   │   │   ├── my-invitations/
│   │   │   │   ├── my-invitations.component.css
│   │   │   │   ├── my-invitations.component.html
│   │   │   │   └── my-invitations.component.ts
│   │   │   ├── notification-preferences/
│   │   │   │   ├── notification-preferences.component.css
│   │   │   │   ├── notification-preferences.component.html
│   │   │   │   └── notification-preferences.component.ts
│   │   │   ├── notifications/
│   │   │   │   └── notification-list/
│   │   │   │       ├── notification-list.component.css
│   │   │   │       ├── notification-list.component.html
│   │   │   │       └── notification-list.component.ts
│   │   │   ├── order-of-play/
│   │   │   │   ├── order-of-play-admin/
│   │   │   │   │   ├── order-of-play-admin.component.html
│   │   │   │   │   └── order-of-play-admin.component.ts
│   │   │   │   └── order-of-play-view/
│   │   │   │       ├── order-of-play-view.component.css
│   │   │   │       ├── order-of-play-view.component.html
│   │   │   │       └── order-of-play-view.component.ts
│   │   │   ├── phases/
│   │   │   │   ├── phase-management.component.css
│   │   │   │   ├── phase-management.component.html
│   │   │   │   └── phase-management.component.ts
│   │   │   ├── profile/
│   │   │   │   ├── privacy-settings/
│   │   │   │   │   ├── privacy-settings.component.css
│   │   │   │   │   ├── privacy-settings.component.html
│   │   │   │   │   └── privacy-settings.component.ts
│   │   │   │   └── profile-view/
│   │   │   │       ├── profile-view.component.css
│   │   │   │       ├── profile-view.component.html
│   │   │   │       └── profile-view.component.ts
│   │   │   ├── ranking/
│   │   │   │   └── ranking-view/
│   │   │   │       ├── ranking-view.component.css
│   │   │   │       ├── ranking-view.component.html
│   │   │   │       └── ranking-view.component.ts
│   │   │   ├── registrations/
│   │   │   │   └── my-registrations/
│   │   │   │       ├── my-registrations.component.css
│   │   │   │       ├── my-registrations.component.html
│   │   │   │       └── my-registrations.component.ts
│   │   │   ├── standings/
│   │   │   │   └── standings-view/
│   │   │   │       ├── standings-view.component.css
│   │   │   │       ├── standings-view.component.html
│   │   │   │       └── standings-view.component.ts
│   │   │   ├── statistics/
│   │   │   │   └── statistics-view/
│   │   │   │       ├── statistics-view.component.css
│   │   │   │       ├── statistics-view.component.html
│   │   │   │       └── statistics-view.component.ts
│   │   │   ├── tournaments/
│   │   │   │   ├── tournament-create/
│   │   │   │   │   ├── tournament-create.component.css
│   │   │   │   │   ├── tournament-create.component.html
│   │   │   │   │   └── tournament-create.component.ts
│   │   │   │   ├── tournament-detail/
│   │   │   │   │   ├── tournament-detail.component.html
│   │   │   │   │   └── tournament-detail.component.ts
│   │   │   │   ├── tournament-edit/
│   │   │   │   │   ├── tournament-edit.component.css
│   │   │   │   │   ├── tournament-edit.component.html
│   │   │   │   │   └── tournament-edit.component.ts
│   │   │   │   ├── tournament-list/
│   │   │   │   │   ├── tournament-list.component.css
│   │   │   │   │   ├── tournament-list.component.html
│   │   │   │   │   └── tournament-list.component.ts
│   │   │   │   └── tournament-statistics/
│   │   │   │       ├── tournament-statistics.component.css
│   │   │   │       ├── tournament-statistics.component.html
│   │   │   │       └── tournament-statistics.component.ts
│   │   │   ├── users/
│   │   │   │   └── user-profile-view/
│   │   │   │       ├── user-profile-view.component.css
│   │   │   │       ├── user-profile-view.component.html
│   │   │   │       └── user-profile-view.component.ts
│   │   │   ├── dashboard.component.css
│   │   │   ├── dashboard.component.html
│   │   │   ├── dashboard.component.ts
│   │   │   └── home.component.ts
│   │   ├── services/
│   │   │   ├── auth-state.service.ts
│   │   │   ├── index.ts
│   │   │   └── tournament-state.service.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── index.ts
│   ├── shared/
│   │   ├── constants.ts
│   │   └── index.ts
│   ├── main.ts
│   └── vite-env.d.ts
├── backend/
│   └── src/
│       ├── application/
│       │   ├── dto/
│       │   │   └── notification-preferences.dto.ts
│       │   └── services/
│       │       ├── announcement.service.ts
│       │       ├── audit.service.ts
│       │       ├── cache.service.ts
│       │       ├── export.service.ts
│       │       ├── image-optimization.service.ts
│       │       ├── match-generator.service.ts
│       │       ├── notification-preferences.service.ts
│       │       ├── notification.service.ts
│       │       ├── partner-invitation.service.ts
│       │       ├── privacy.service.ts
│       │       ├── ranking.service.ts
│       │       ├── schedule-generation.service.ts
│       │       ├── seeding.service.ts
│       │       └── standing.service.ts
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── announcement.entity.ts
│       │   │   ├── audit-log.entity.ts
│       │   │   ├── bracket.entity.ts
│       │   │   ├── category.entity.ts
│       │   │   ├── court.entity.ts
│       │   │   ├── doubles-team.entity.ts
│       │   │   ├── global-ranking.entity.ts
│       │   │   ├── index.ts
│       │   │   ├── match-result.entity.ts
│       │   │   ├── match.entity.ts
│       │   │   ├── notification-preferences.entity.ts
│       │   │   ├── notification.entity.ts
│       │   │   ├── order-of-play.entity.ts
│       │   │   ├── partner-invitation.entity.ts
│       │   │   ├── payment.entity.ts
│       │   │   ├── phase.entity.ts
│       │   │   ├── push-subscription.entity.ts
│       │   │   ├── registration.entity.ts
│       │   │   ├── sanction.entity.ts
│       │   │   ├── score.entity.ts
│       │   │   ├── standing.entity.ts
│       │   │   ├── statistics.entity.ts
│       │   │   ├── tournament.entity.ts
│       │   │   └── user.entity.ts
│       │   └── enumerations/
│       │       ├── acceptance-type.ts
│       │       ├── audit-action.ts
│       │       ├── audit-resource-type.ts
│       │       ├── bracket-type.ts
│       │       ├── facility-type.ts
│       │       ├── index.ts
│       │       ├── match-format.ts
│       │       ├── match-status.ts
│       │       ├── notification-channel.ts
│       │       ├── notification-type.ts
│       │       ├── payment-status.ts
│       │       ├── privacy-level.ts
│       │       ├── ranking-system.ts
│       │       ├── registration-status.ts
│       │       ├── sanction-type.ts
│       │       ├── surface.ts
│       │       ├── tournament-status.ts
│       │       ├── tournament-type.ts
│       │       └── user-role.ts
│       ├── infrastructure/
│       │   ├── database/
│       │   │   ├── migrations/
│       │   │   │   ├── 001-add-performance-indexes.ts
│       │   │   │   ├── 002-remove-referee-spectator-roles.ts
│       │   │   │   ├── 003-add-user-id-document-ranking.ts
│       │   │   │   ├── 004-add-unique-constraint-id-document.ts
│       │   │   │   ├── 005-add-ball-provider-to-matches.ts
│       │   │   │   ├── 006-add-visual-customization-to-tournaments.ts
│       │   │   │   ├── 007-add-facility-type-and-regulations-to-tournaments.ts
│       │   │   │   ├── 008-add-is-guest-to-users.ts
│       │   │   │   ├── 009-add-withdrawal-date-and-partner-id-to-registrations.ts
│       │   │   │   ├── 010-create-partner-invitations-table.ts
│       │   │   │   ├── 011-create-doubles-teams-table.ts
│       │   │   │   ├── 012-add-active-registration-unique-index.ts
│       │   │   │   ├── 013-fix-phase-types.ts
│       │   │   │   └── 014-add-is-auto-generated.ts
│       │   │   ├── data-source.ts
│       │   │   ├── migrate.ts
│       │   │   ├── reset.ts
│       │   │   ├── seed-production.ts
│       │   │   └── seed.ts
│       │   ├── email/
│       │   │   └── email.service.ts
│       │   ├── push/
│       │   │   └── web-push.service.ts
│       │   └── telegram/
│       │       └── telegram.service.ts
│       ├── presentation/
│       │   ├── controllers/
│       │   │   ├── announcement.controller.ts
│       │   │   ├── audit-log.controller.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── bracket.controller.ts
│       │   │   ├── category.controller.ts
│       │   │   ├── court.controller.ts
│       │   │   ├── export.controller.ts
│       │   │   ├── match.controller.ts
│       │   │   ├── notification-preferences.controller.ts
│       │   │   ├── notification.controller.ts
│       │   │   ├── order-of-play.controller.ts
│       │   │   ├── partner-invitation.controller.ts
│       │   │   ├── payment.controller.ts
│       │   │   ├── phase.controller.ts
│       │   │   ├── ranking.controller.ts
│       │   │   ├── registration.controller.ts
│       │   │   ├── sanction.controller.ts
│       │   │   ├── standing.controller.ts
│       │   │   ├── statistics.controller.ts
│       │   │   ├── tournament.controller.ts
│       │   │   └── user.controller.ts
│       │   ├── middleware/
│       │   │   ├── admin.middleware.ts
│       │   │   ├── auth.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   ├── index.ts
│       │   │   ├── role.middleware.ts
│       │   │   └── validation.middleware.ts
│       │   ├── middlewares/
│       │   │   ├── cache.middleware.ts
│       │   │   └── upload.middleware.ts
│       │   └── routes/
│       │       └── index.ts
│       ├── scripts/
│       │   └── populate-phase-tournament-ids.ts
│       ├── shared/
│       │   ├── config/
│       │   │   ├── index.ts
│       │   │   └── swagger.config.ts
│       │   ├── constants/
│       │   │   ├── index.ts
│       │   │   └── websocket-events.ts
│       │   ├── errors/
│       │   │   └── app-error.ts
│       │   └── utils/
│       │       ├── cdn-helper.ts
│       │       ├── date-formatter.ts
│       │       ├── id-generator.ts
│       │       └── tennis-score-validator.ts
│       ├── app.ts
│       ├── server.ts
│       └── websocket-server.ts
├── e2e/
│   ├── critical/
│   │   ├── auth.spec.ts
│   │   ├── draw-generation.spec.ts
│   │   ├── order-of-play.spec.ts
│   │   ├── result-management.spec.ts
│   │   └── tournament-crud.spec.ts
│   ├── fixtures/
│   │   ├── page-objects/
│   │   │   ├── admin/
│   │   │   │   ├── backup.page.ts
│   │   │   │   ├── system.page.ts
│   │   │   │   └── user-management.page.ts
│   │   │   ├── announcements.page.ts
│   │   │   ├── base.page.ts
│   │   │   ├── bracket.page.ts
│   │   │   ├── dashboard.page.ts
│   │   │   ├── login.page.ts
│   │   │   ├── match-detail.page.ts
│   │   │   ├── notifications.page.ts
│   │   │   ├── order-of-play.page.ts
│   │   │   ├── profile.page.ts
│   │   │   ├── ranking.page.ts
│   │   │   ├── standings.page.ts
│   │   │   ├── tournament-detail.page.ts
│   │   │   └── tournament-list.page.ts
│   │   ├── auth.fixture.ts
│   │   └── test-data.ts
│   ├── helpers/
│   │   ├── api.helper.ts
│   │   ├── seed.helper.ts
│   │   └── wait.helper.ts
│   ├── high/
│   │   ├── advanced-bracket-config.spec.ts
│   │   ├── bracket-visualization.spec.ts
│   │   ├── navigation-feedback.spec.ts
│   │   ├── notifications.spec.ts
│   │   ├── registration.spec.ts
│   │   └── standings.spec.ts
│   ├── low/
│   │   ├── accessibility.spec.ts
│   │   ├── edge-cases.spec.ts
│   │   └── responsive.spec.ts
│   ├── medium/
│   │   ├── announcements.spec.ts
│   │   ├── communication.spec.ts
│   │   ├── export.spec.ts
│   │   ├── incidents.spec.ts
│   │   ├── privacy.spec.ts
│   │   ├── ranking.spec.ts
│   │   └── system-management.spec.ts
│   ├── doubles-tournament.spec.ts
│   ├── global-setup.ts
│   └── global-teardown.ts
├── tests/
│   ├── application/
│   │   └── services/
│   │       ├── authentication.service.test.ts
│   │       ├── authorization.service.test.ts
│   │       ├── bracket-generator.factory.test.ts
│   │       ├── bracket.service.test.ts
│   │       ├── match.service.test.ts
│   │       ├── notification.service.test.ts
│   │       ├── order-of-play.service.test.ts
│   │       ├── payment.service.test.ts
│   │       ├── privacy.service.test.ts
│   │       ├── ranking.service.test.ts
│   │       ├── registration.service.test.ts
│   │       ├── seeding.service.test.ts
│   │       ├── standing.service.test.ts
│   │       ├── statistics.service.test.ts
│   │       └── tournament.service.test.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── announcement.test.ts
│   │   │   ├── bracket.test.ts
│   │   │   ├── category.test.ts
│   │   │   ├── court.test.ts
│   │   │   ├── global-ranking.test.ts
│   │   │   ├── match-result.test.ts
│   │   │   ├── match.test.ts
│   │   │   ├── notification.test.ts
│   │   │   ├── order-of-play.test.ts
│   │   │   ├── payment.test.ts
│   │   │   ├── phase.test.ts
│   │   │   ├── registration.test.ts
│   │   │   ├── sanction.test.ts
│   │   │   ├── score.test.ts
│   │   │   ├── standing.test.ts
│   │   │   ├── statistics.test.ts
│   │   │   ├── tournament.test.ts
│   │   │   └── user.test.ts
│   │   └── value-objects/
│   │       └── privacy-settings.test.ts
│   └── mocks/
│       ├── shared-constants.ts
│       └── user.service.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
└── jest.config.js
```
