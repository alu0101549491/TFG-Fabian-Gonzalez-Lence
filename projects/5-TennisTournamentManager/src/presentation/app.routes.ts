/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/presentation/app.routes.ts
 * @desc Application route definitions. Implements lazy loading for feature modules and route guards for protected areas.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {type Routes} from '@angular/router';
import {authGuard} from './guards/auth.guard';
import {roleGuard} from './guards/role.guard';

/**
 * Application route configuration.
 * Routes are organized by feature area with lazy-loaded components.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'tournaments',
    loadComponent: () =>
      import('./pages/tournaments/tournament-list/tournament-list.component').then(
        (m) => m.TournamentListComponent,
      ),
  },
  {
    path: 'tournaments/create',
    canActivate: [authGuard, roleGuard],
    data: {roles: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN']},
    loadComponent: () =>
      import('./pages/tournaments/tournament-create/tournament-create.component').then(
        (m) => m.TournamentCreateComponent,
      ),
  },
  {
    path: 'tournaments/:id/edit',
    canActivate: [authGuard, roleGuard],
    data: {roles: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN']},
    loadComponent: () =>
      import('./pages/tournaments/tournament-edit/tournament-edit.component').then(
        (m) => m.TournamentEditComponent,
      ),
  },
  {
    path: 'tournaments/:id/statistics',
    loadComponent: () =>
      import('./pages/tournaments/tournament-statistics/tournament-statistics.component').then(
        (m) => m.TournamentStatisticsComponent,
      ),
  },
  {
    path: 'tournaments/:id',
    loadComponent: () =>
      import('./pages/tournaments/tournament-detail/tournament-detail.component').then(
        (m) => m.TournamentDetailComponent,
      ),
  },
  {
    path: 'tournaments/:tournamentId/phases',
    canActivate: [authGuard, roleGuard],
    data: {roles: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN']},
    loadComponent: () =>
      import('./pages/phases/phase-management.component').then(
        (m) => m.PhaseManagementComponent,
      ),
  },
  {
    path: 'brackets/:id',
    loadComponent: () =>
      import('./pages/brackets/bracket-view/bracket-view.component').then(
        (m) => m.BracketViewComponent,
      ),
  },
  {
    path: 'matches',
    loadComponent: () =>
      import('./pages/matches/match-list/match-list.component').then(
        (m) => m.MatchListComponent,
      ),
  },
  {
    path: 'my-matches',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/matches/my-matches/my-matches.component').then(
        (m) => m.MyMatchesComponent,
      ),
  },
  {
    path: 'matches/:id',
    loadComponent: () =>
      import('./pages/matches/match-detail/match-detail.component').then(
        (m) => m.MatchDetailComponent,
      ),
  },
  {
    path: 'order-of-play/:id',
    loadComponent: () =>
      import('./pages/order-of-play/order-of-play-view/order-of-play-view.component').then(
        (m) => m.OrderOfPlayViewComponent,
      ),
  },
  {
    path: 'standings/:id',
    loadComponent: () =>
      import('./pages/standings/standings-view/standings-view.component').then(
        (m) => m.StandingsViewComponent,
      ),
  },
  {
    path: 'ranking',
    redirectTo: 'rankings',
    pathMatch: 'full',
  },
  {
    path: 'rankings',
    loadComponent: () =>
      import('./pages/ranking/ranking-view/ranking-view.component').then(
        (m) => m.RankingViewComponent,
      ),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/notifications/notification-list/notification-list.component').then(
        (m) => m.NotificationListComponent,
      ),
  },
  {
    path: 'announcements',
    loadComponent: () =>
      import('./pages/announcements/announcement-list/announcement-list.component').then(
        (m) => m.AnnouncementListComponent,
      ),
    runGuardsAndResolvers: 'always',  // Force component reload on query param changes
  },
  {
    path: 'announcements/create',
    canActivate: [authGuard, roleGuard],
    data: {roles: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN']},
    loadComponent: () =>
      import('./pages/announcements/announcement-create/announcement-create.component').then(
        (m) => m.AnnouncementCreateComponent,
      ),
  },
  {
    path: 'announcements/edit/:id',
    canActivate: [authGuard, roleGuard],
    data: {roles: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN']},
    loadComponent: () =>
      import('./pages/announcements/announcement-edit/announcement-edit.component').then(
        (m) => m.AnnouncementEditComponent,
      ),
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./pages/statistics/statistics-view/statistics-view.component').then(
        (m) => m.StatisticsViewComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile-view/profile-view.component').then(
        (m) => m.ProfileViewComponent,
      ),
  },
  {
    path: 'privacy',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/privacy-settings/privacy-settings.component').then(
        (m) => m.PrivacySettingsComponent,
      ),
  },
  {
    path: 'notification-preferences',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/notification-preferences/notification-preferences.component').then(
        (m) => m.NotificationPreferencesComponent,
      ),
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./pages/users/user-profile-view/user-profile-view.component').then(
        (m) => m.UserProfileViewComponent,
      ),
  },
  {
    path: 'my-registrations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/registrations/my-registrations/my-registrations.component').then(
        (m) => m.MyRegistrationsComponent,
      ),
  },
  {
    path: 'my-invitations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my-invitations/my-invitations.component').then(
        (m) => m.MyInvitationsComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: {roles: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN']},
    loadComponent: () =>
      import('./pages/admin/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard],
    data: {roles: ['SYSTEM_ADMIN']},
    loadComponent: () =>
      import('./pages/admin/user-management/user-management.component').then(
        (m) => m.UserManagementComponent,
      ),
  },
  {
    path: 'admin/disputed-matches',
    canActivate: [authGuard, roleGuard],
    data: {roles: ['SYSTEM_ADMIN', 'TOURNAMENT_ADMIN']},
    loadComponent: () =>
      import('./pages/admin/disputed-matches/disputed-matches.component').then(
        (m) => m.DisputedMatchesComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
