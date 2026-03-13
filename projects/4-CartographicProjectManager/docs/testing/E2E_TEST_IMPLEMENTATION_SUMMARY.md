# E2E Test Implementation Summary (Playwright)

This document summarizes the currently implemented Playwright E2E automation for **CartographicProjectManager**.

## What’s implemented

### Auth + guards (critical)
- Spec: `e2e/critical/auth-and-guards.spec.ts`
- Coverage:
  - Unauthenticated redirect to `/login?redirect=...`
  - Post-login redirect back to intended route
  - Non-admin forbidden access to `/backup`
  - 404 Not Found route handling

### Project CRUD (critical)
- Spec: `e2e/critical/project-crud.spec.ts`
- Coverage:
  - Admin can see a seeded project in the list
  - Admin can edit the project name via the Edit modal
  - Admin can delete the project via the Delete confirmation modal
- Data strategy:
  - Seeds a fresh client + project via backend API before UI steps
  - Cleans up project via API as a safety net

### Task workflow (critical)
- Spec: `e2e/critical/task-workflow.spec.ts`
- Coverage:
  - Admin can transition a task from **Pending** → **In Progress** via quick status actions
- Data strategy:
  - Seeds a fresh client + project + task via backend API
  - Cleans up via API (task + project)

### Navigation + logout (high)
- Spec: `e2e/high/navigation.spec.ts`
- Coverage:
  - Sidebar navigation to Projects and Calendar
  - User menu logout returns to `/login`

## Framework / structure

- Global auth state generation:
  - Setup: `e2e/setup/global-setup.ts`
  - Teardown: `e2e/setup/global-teardown.ts` (no-op for now)
  - Output storage states:
    - `e2e/.auth/admin.json`
    - `e2e/.auth/non-admin.json`

- Shared helpers:
  - `e2e/helpers/auth.ts` (UI login + registration fallback)
  - `e2e/helpers/api.ts` (backend seeding/cleanup)
  - `e2e/helpers/test-data.ts` (unique nonces + dates)
  - `e2e/helpers/e2e-paths.ts` (shared paths + base URL helpers)

- Page objects:
  - `e2e/fixtures/page-objects/project-list.po.ts`
  - `e2e/fixtures/page-objects/project-details.po.ts`
  - `e2e/fixtures/test.ts` wires POMs into Playwright fixtures

## How to run

From `projects/4-CartographicProjectManager/`:

- `npm run test:e2e`
- `npm run test:e2e:ui`
- `npm run test:e2e:headed`

## Environment assumptions

- Frontend dev server is reachable at:
  - `http://localhost:5173/4-CartographicProjectManager/`
  - (Configurable via `PLAYWRIGHT_BASE_URL`)

- Backend API is reachable at:
  - `http://localhost:3000/api/v1`
  - (Configurable via `PW_API_BASE_URL`)

## Notes / gaps

- Current task workflow automation covers the **basic** status transition only.
- Messaging/files/Dropbox flows are intentionally not automated yet (likely environment-dependent and higher flake risk without controlled fixtures).
