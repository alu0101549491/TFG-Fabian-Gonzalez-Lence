# Tennis Tournament Manager - E2E Test Implementation Summary

## Overview

Phase 2 of the Tennis Tournament Manager E2E effort is now implemented under `e2e/` using Playwright.

The suite was adapted to the real Angular UI surface discovered in `src/presentation`, not to the sample scaffold from the prompt. In practice this means:

- No `data-testid` selectors were used because the current frontend does not expose them.
- Navigation assumptions were corrected to match the real sticky header, notification bell, and user dropdown.
- The Playwright `baseURL` was aligned with the deployed Vite subpath: `/5-TennisTournamentManager/`.
- Unsupported or missing UI features were marked with explicit `test.skip()` or `test.fixme()` calls rather than being falsely represented as covered.

## Later Coverage Additions

The remainder of this document describes the original Phase 2 baseline. After that baseline landed, the Playwright suite was expanded in two additional passes that should be considered part of the current inventory.

### Earlier FEEDBACK coverage already included in the suite

The client-feedback automation pass described in `docs/testing/FEEDBACK_TESTING_PLAN.md` is no longer just a plan. Its coverage is already represented in the active suite through the following spec files and scenario groups:

- `e2e/high/navigation-feedback.spec.ts`: `FDBK-NAV-001`, `FDBK-NAV-002`, `FDBK-STATS-001`
- `e2e/critical/auth.spec.ts`: `FDBK-NAV-003`
- `e2e/critical/tournament-crud.spec.ts`: `FDBK-TOURN-004`
- `e2e/high/registration.spec.ts`: `FDBK-TOURN-002`, `FDBK-TOURN-003`
- `e2e/critical/order-of-play.spec.ts`: `FDBK-TOURN-005`
- `e2e/high/bracket-visualization.spec.ts`: `FDBK-DRAW-001`
- `e2e/critical/draw-generation.spec.ts`: `FDBK-DRAW-003`
- `e2e/medium/announcements.spec.ts`: `FDBK-CONTENT-001`, `FDBK-TOURN-006`
- `e2e/medium/export.spec.ts`: `FDBK-EXP-001`, additional route-scoped `FDBK-TOURN-006` coverage for contextual branding
- `e2e/medium/ranking.spec.ts`: `FDBK-RANK-001`
- `e2e/high/advanced-bracket-config.spec.ts`: `ADV-001` through `ADV-005`, which were already serving as the advanced bracket feedback template before the later feedback plan was formalized

### Current 29-test expansion recorded in this implementation pass

The latest Playwright expansion added 29 runnable scenarios across critical, high, medium, and low priority buckets:

- `e2e/critical/auth.spec.ts`: `AUTH-002`, `DASH-001`, `DASH-002`, `DASH-003`
- `e2e/critical/tournament-crud.spec.ts`: `FDBK-TOURN-001`, `TOURN-002`, `TOURN-005`, `TOURN-007`
- `e2e/critical/result-management.spec.ts`: `MATCH-002`
- `e2e/critical/order-of-play.spec.ts`: `OOP-004`
- `e2e/high/advanced-bracket-config.spec.ts`: `FDBK-DRAW-002`
- `e2e/high/registration.spec.ts`: `REG-002`, `REG-005`, `REG-007`, `REG-008`
- `e2e/high/standings.spec.ts`: `STAND-005`
- `e2e/high/notifications.spec.ts`: `NOTIF-003`
- `e2e/medium/announcements.spec.ts`: `ANN-002`, `ANN-005`, `ANN-006`
- `e2e/medium/ranking.spec.ts`: `RANK-003`
- `e2e/medium/privacy.spec.ts`: `PRIV-005`
- `e2e/medium/communication.spec.ts`: `COMM-002`
- `e2e/medium/system-management.spec.ts`: `SYS-001`, `SYS-002`
- `e2e/low/edge-cases.spec.ts`: `ERR-006`, `CROSS-001`, `CROSS-002`, `CROSS-003`

These 29 scenarios were verified with focused Chromium runs against the live local frontend and backend, typically using `PLAYWRIGHT_SKIP_WEBSERVER=1` with Playwright workers pinned to `1` for local stability.

## Generated E2E Structure

### Infrastructure

- `playwright.config.ts`
- `e2e/global-setup.ts`
- `e2e/global-teardown.ts`
- `e2e/fixtures/test-data.ts`
- `e2e/fixtures/auth.fixture.ts`
- `e2e/helpers/api.helper.ts`
- `e2e/helpers/wait.helper.ts`
- `e2e/helpers/seed.helper.ts`
- Root `playwright.config.ts` updated to re-export the new config

### Page Objects

Implemented 16 page-object files:

- `base.page.ts`
- `login.page.ts`
- `dashboard.page.ts`
- `tournament-list.page.ts`
- `tournament-detail.page.ts`
- `bracket.page.ts`
- `match-detail.page.ts`
- `order-of-play.page.ts`
- `standings.page.ts`
- `announcements.page.ts`
- `notifications.page.ts`
- `ranking.page.ts`
- `profile.page.ts`
- `admin/user-management.page.ts`
- `admin/system.page.ts`
- `admin/backup.page.ts`

### Spec Files

Implemented 18 new spec files:

- `e2e/critical/auth.spec.ts`
- `e2e/critical/tournament-crud.spec.ts`
- `e2e/critical/draw-generation.spec.ts`
- `e2e/critical/result-management.spec.ts`
- `e2e/critical/order-of-play.spec.ts`
- `e2e/high/registration.spec.ts`
- `e2e/high/standings.spec.ts`
- `e2e/high/notifications.spec.ts`
- `e2e/high/bracket-visualization.spec.ts`
- `e2e/medium/announcements.spec.ts`
- `e2e/medium/privacy.spec.ts`
- `e2e/medium/ranking.spec.ts`
- `e2e/medium/export.spec.ts`
- `e2e/medium/incidents.spec.ts`
- `e2e/medium/communication.spec.ts`
- `e2e/low/edge-cases.spec.ts`
- `e2e/low/accessibility.spec.ts`
- `e2e/low/responsive.spec.ts`

## Coverage Totals

### New Suite Coverage

- New spec files added: 18
- New page-object files added: 16
- New tests added: 76
- Runnable coverage targets: 56
- Explicitly deferred targets with `skip` or `fixme`: 20

### Full Playwright Discovery Result

Playwright discovery succeeded with:

- `474 tests in 20 files`

That total includes:

- The 76 new tests added in this phase
- 3 pre-existing tests already present in the project
- 6 configured browser/device projects in the Playwright config

Validation command used:

```bash
npx playwright test --list
```

## Implemented Functional Areas

The generated suite covers the currently implemented UI for:

- Authentication and protected-route access
- Tournament creation, editing, and authorization checks
- Bracket visibility and publication/regeneration entry points
- Match scheduling, score entry, suspension, resume, and cancellation entry points
- Order of play visibility and admin scheduling controls
- Registration review, invitation inboxes, and withdrawal entry points
- Standings and ranking views
- Notifications inbox, bell dropdown, and preferences
- Announcements list and creation
- Privacy and profile settings
- Export entry points exposed in the current UI
- Disputed matches and incident-resolution modal access
- Routing, failure paths, accessibility smoke checks, and responsive smoke checks

## Deferred or Partially Covered Scenarios

The following items are intentionally marked `skip` or `fixme` because the current UI or seed determinism is not sufficient for reliable end-to-end automation yet:

- Password recovery
- Login lockout feedback
- JWT refresh flow
- Consolation and compass draw management
- Deterministic draft-bracket regeneration scenario with known seeded bracket id
- Deterministic opponent confirmation and dispute workflows for pending results
- 24-hour order-of-play publication rule feedback
- Registration payments
- Head-to-head and split standings views
- Telegram throttling feedback surfaced in UI
- Announcement read counters
- Delete-account self-service UI
- External ranking import UI
- ITF/TODS export controls in the active frontend template
- Document and certificate generation UI
- Sanctions and replay-order UI
- Chat, moderation, and group messaging UI
- Deterministic duplicate-registration integrity scenario

## Technical Notes

- Authentication storage state is generated in global setup using backend API login, then written into `.auth/*.json`.
- Local storage keys were aligned with the real frontend implementation:
  - `tennis_jwt_token`
  - `app_user`
- Page objects use real selectors taken from the active Angular templates, including:
  - Login form ids: `#email`, `#password`
  - Tournament list filters: `#search`, `#status`, `#surface`, `#location`
  - Match scheduling ids: `#courtId`, `#scheduledDate`, `#scheduledTime`, `#ballProvider`
  - Match control ids: `#reason`, `#suspensionReason`, `#resumeScheduledDate`, `#resumeScheduledTime`
  - Notification preferences ids such as `#email`, `#webPush`, `#telegram`

## Validation Performed

The following validation was completed during implementation:

- Static diagnostics on the infrastructure files
- Static diagnostics on the page-object layer
- Static diagnostics on the full `e2e/` tree
- Playwright suite discovery using `npx playwright test --list`

Issues found and fixed during validation:

- Relative Playwright hook paths were initially resolved from the root config file; config paths were corrected to root-relative `./e2e/...` values.
- Generated page-object files were accidentally duplicated byte-for-byte and had to be de-duplicated before Playwright could parse them.

## Not Yet Performed

The full browser suite was not executed end-to-end in this implementation pass.

Reason:

- Many scenarios depend on seeded backend data, API availability, and stable runtime fixtures.
- Discovery and static validation were used first to ensure the suite loads correctly before running a long integration pass.

## Run Instructions

From `projects/5-TennisTournamentManager`:

```bash
npm run test:e2e
```

Useful variants:

```bash
npm run test:e2e:ui
npm run test:e2e:headed
npx playwright test --project=chromium
npx playwright test e2e/critical/auth.spec.ts --project=chromium
npx playwright show-report
```

## Recommended Next Steps

1. Run the `critical/` suite against a known-good backend seed and refine any selectors that fail at runtime.
2. Add deterministic backend seed helpers for pending-result, bracket-regeneration, and registration-payment scenarios.
3. Introduce stable `data-testid` attributes for the highest-value admin and modal flows to reduce selector fragility.