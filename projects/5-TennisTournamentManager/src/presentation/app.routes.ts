/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file presentation/app.routes.ts
 * @desc Application route definitions. Implements lazy loading for feature modules and route guards for protected areas.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
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
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/tournaments/tournament-create/tournament-create.component').then(
        (m) => m.TournamentCreateComponent,
      ),
  },
  {
    path: 'tournaments/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/tournaments/tournament-edit/tournament-edit.component').then(
        (m) => m.TournamentEditComponent,
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
    path: 'matches/:id',
    loadComponent: () =>
      import('./pages/matches/match-detail/match-detail.component').then(
        (m) => m.MatchDetailComponent,
      ),
  },
  {
    path: 'order-of-play',
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
    path: '**',
    redirectTo: 'home',
  },
];
