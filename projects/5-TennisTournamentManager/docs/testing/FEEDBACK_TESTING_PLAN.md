# FEEDBACK TESTING PLAN
## Tennis Tournament Manager (TENNIS)

**Document Version:** 1.0  
**Created:** April 25, 2026  
**Author:** Testing Agent  
**Testing Framework:** Playwright  
**Purpose:** Define the end-to-end coverage required for the client-feedback features completed after the baseline E2E plan.

---

## TABLE OF CONTENTS

1. [Objective and Scope](#1-objective-and-scope)
2. [Integration Rules with the Current Suite](#2-integration-rules-with-the-current-suite)
3. [Feedback Feature Coverage Matrix](#3-feedback-feature-coverage-matrix)
4. [Test Data and Seeding Requirements](#4-test-data-and-seeding-requirements)
5. [Feedback Scenarios by Module](#5-feedback-scenarios-by-module)
   - 5.01 [Navigation and Profile Discovery](#501-navigation-and-profile-discovery)
   - 5.02 [Tournament Detail and Registration Administration](#502-tournament-detail-and-registration-administration)
   - 5.03 [Match and Result Management](#503-match-and-result-management)
   - 5.04 [Bracket, Draw, and Phase Management](#504-bracket-draw-and-phase-management)
   - 5.05 [Announcements, Statistics, Ranking, and Export](#505-announcements-statistics-ranking-and-export)
6. [Execution Order and Priority](#6-execution-order-and-priority)
7. [Implementation Notes and Risks](#7-implementation-notes-and-risks)
8. [Implementation Summary](#8-implementation-summary)

---

## 1. Objective and Scope

This plan complements, but does not replace, the baseline scenario catalog in `docs/testing/E2E_TEST_SCENARIOS.md`.

Its scope is limited to the user-facing features introduced from client feedback and already recorded as completed in `docs/COPILOT-TODO.md` and `docs/MANUAL-TESTING-GUIDE.md`.

The goals of this document are:

- Identify which feedback features need new E2E coverage.
- Avoid duplicating flows already covered by the current Playwright suite.
- Map each new scenario to the existing `critical/`, `high/`, `medium/`, and `low/` distribution under `e2e/`.
- Define the seed data and workflow prerequisites needed for deterministic automation.
- Provide a practical implementation summary so the scenarios can be added with minimal churn.

Out of scope for this plan:

- Re-documenting the baseline authentication, registration, standings, or export coverage that already exists.
- Unit-test-only concerns that do not add meaningful E2E value.
- Features still marked pending or out of scope in the feedback backlog.

---

## 2. Integration Rules with the Current Suite

The feedback scenarios must be implemented against the current Playwright baseline rather than the older planning assumptions.

### 2.1 Source of truth

- Use `e2e/fixtures/test-data.ts` as the source of truth for seeded users and fixture names.
- Use the real Playwright config in `playwright.config.ts`.
- Keep the existing priority buckets:
  - `e2e/critical/`
  - `e2e/high/`
  - `e2e/medium/`
  - `e2e/low/`

### 2.2 Route and environment rules

- Keep relative navigation with `page.goto('/')`, `page.goto('/tournaments')`, and similar patterns.
- Respect the configured base URL subpath: `/5-TennisTournamentManager/`.
- Keep Playwright hooks and helper imports root-relative to the project config already in use.

### 2.3 Current suite constraints that affect feedback coverage

- `DRAW-001` remains blocked unless the active tournament detail route exposes the bracket-generation controls consistently.
- Pending-result workflows still need deterministic fixtures; current `MATCH-004` and `MATCH-005` are marked `fixme` for that reason.
- Seeded status transitions must respect backend rules, especially `REGISTRATION_CLOSED -> DRAW_PENDING` before moving further.
- Existing responsive projects are already configured, so feedback UI checks can reuse `mobile-chrome`, `mobile-safari`, and `tablet` without config changes.

### 2.4 Coverage policy for feedback work

- Extend an existing spec when the feature stays inside the same business flow.
- Add a new spec file only when the feedback work is cross-cutting enough that extending an existing spec would make it incoherent.
- Reuse page objects and seed helpers first; only add new helpers when a missing deterministic fixture blocks implementation.
- Mark scenarios `fixme` only when the UI or seed determinism is genuinely missing, not because the scenario is large.

---

## 3. Feedback Feature Coverage Matrix

| Feedback area | Completed feature reference | E2E action | Priority | Recommended spec target |
|---|---|---|---|---|
| Header discoverability | My Matches, Statistics, Tournaments links | Add new scenario | High | `e2e/high/navigation-feedback.spec.ts` |
| Back navigation | Back button fixes across forms and profile/statistics flow | Add new scenario | High | `e2e/high/navigation-feedback.spec.ts` |
| Tournament branding | Live color preview in create/edit | Extend existing | Medium | `e2e/critical/tournament-crud.spec.ts` |
| Match helper copy | Status tooltips, ball-provider clarification | Extend existing | Low | `e2e/critical/result-management.spec.ts` |
| Result entry UX | Player comments, super tiebreak input | Extend existing | Critical | `e2e/critical/result-management.spec.ts` |
| Participant visibility | Public participant list, profile links, status filtering, badges | Extend existing | High | `e2e/high/registration.spec.ts` |
| Participant administration | Unified edit modal, full acceptance-type dropdown | Extend existing | High | `e2e/high/registration.spec.ts` |
| Tournament setup safety | Default category auto-creation, state-gated actions | Extend existing | High | `e2e/critical/tournament-crud.spec.ts` |
| Court administration | Dedicated court management CRUD | Extend existing | High | `e2e/critical/order-of-play.spec.ts` |
| Match state safety | Scheduled requires time, winner required for WO/RET/DEF, valid transitions only | Extend existing | Critical | `e2e/critical/result-management.spec.ts` |
| BYE handling | Prevent BYE scheduling, distinguish BYE vs TBD | Extend existing | High | `e2e/critical/result-management.spec.ts`, `e2e/high/bracket-visualization.spec.ts` |
| Bracket clarity | Seed badges, acceptance badges, match format badges, participant profile links | Extend existing | High | `e2e/high/bracket-visualization.spec.ts` |
| Match format workflow | Format selection during bracket generation | Extend existing | High | `e2e/high/advanced-bracket-config.spec.ts` |
| Tournament-scoped context | Logo display on bracket, matches, standings, order of play, statistics, announcements | Extend existing | Medium | Module-local specs |
| Profile discovery | Compare Stats button and single-click return flow | Add new scenario | High | `e2e/high/navigation-feedback.spec.ts`, `e2e/medium/privacy.spec.ts` |
| Announcement enrichments | Image upload and external link CTA | Extend existing | Medium | `e2e/medium/announcements.spec.ts` |
| Dashboard data accuracy | Real counters by role | Extend existing | High | `e2e/critical/auth.spec.ts` or `e2e/high/navigation-feedback.spec.ts` |
| PDF polish | Improved PDF statistics export template | Extend existing | Medium | `e2e/medium/export.spec.ts` |
| Rankings | Admin recalculation workflow | Extend existing | Medium | `e2e/medium/ranking.spec.ts` |
| Phase management | Overview tab, create phase, link, qualify, lucky loser, visual flow | Extend existing | High | `e2e/critical/draw-generation.spec.ts` |
| Advanced bracket configuration | Feature 30 | Already implemented | Covered | `e2e/high/advanced-bracket-config.spec.ts` |

Notes:

- `Feature 30: Advanced Bracket Configuration` already has dedicated E2E coverage and should be treated as the template for the rest of the feedback scenarios.
- The feedback plan should not re-implement assertions that are already present in `ADV-001` through `ADV-005`; it should only add the missing match-format-specific assertions.

---

## 4. Test Data and Seeding Requirements

Feedback automation will be much more reliable if the following deterministic helpers are added or extended before implementing the scenarios.

### 4.1 Required seed helpers

- `createPendingResultFixture()`
  - Creates one match with two authenticated participants.
  - Produces a submitted-but-unconfirmed result owned by participant A and actionable by participant B.
- `createByeMatchFixture()`
  - Creates a bracket match where one slot is `BYE` and another scenario where the slot is `null` / `TBD`.
- `createPhaseChainFixture()`
  - Creates one tournament with at least two categories or phases ready for linking.
  - Optionally seeds standings so qualifier advancement is immediately actionable.
- `createAnnouncementMediaFixture()`
  - Seeds an announcement with image and external link metadata for read-side assertions.
- `createRankingShuffleFixture()`
  - Seeds at least three global rankings with intentionally incorrect `position` ordering so recalculation produces visible changes.

### 4.2 Shared data requirements

- One admin-owned tournament in `REGISTRATION_OPEN` with no categories for default-category creation coverage.
- One tournament in `DRAW_PENDING` with approved participants for bracket-generation and format assertions.
- One bracket with seeded players, acceptance types, a `BYE` entry, and one unresolved `TBD` slot.
- One scheduled match, one unscheduled match, one `IN_PROGRESS` match, one `BYE` match, and one super-tiebreak-format match.
- One tournament-scoped route context for each page that now renders the tournament logo.

### 4.3 Selector guidance for the feedback work

- Prefer headings, button text, field labels, and existing classes over brittle nth-child selectors.
- For dropdown options that expose tennis abbreviations, assert both the visible label and the effect after selection.
- For profile-link coverage, use the visible participant name plus the expected route pattern `/users/:id`.
- For PDF coverage, prefer validating the export entry point and key rendered strings rather than browser-PDF internals.

---

## 5. Feedback Scenarios by Module

## 5.01 Navigation and Profile Discovery

### FDBK-NAV-001 Header navigation should expose the new primary links by role

- **Priority:** High
- **Feedback reference:** Navigation improvements from Phase 2
- **Target integration:** New `e2e/high/navigation-feedback.spec.ts`
- **Preconditions:** Participant and admin storage states available.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/home` as a participant. | Header renders the primary navigation next to the logo. |
| 2 | Verify `Tournaments`, `My Matches`, and `Statistics` links are visible. | Participant sees all three links. |
| 3 | Click each link. | Routes land on `/tournaments`, `/my-matches`, and `/statistics`. |
| 4 | Open `/home` as a system or tournament admin. | Header still renders primary navigation. |
| 5 | Verify `My Matches` is hidden while `Tournaments` and `Statistics` remain visible. | Role-based visibility matches the product behavior. |

- **Postconditions:** None.
- **Automation notes:** Keep this scenario read-only; do not couple it to seeded tournament data.

### FDBK-NAV-002 Profile and statistics back navigation should stay one-click and contextual

- **Priority:** High
- **Feedback reference:** Back button fixes, compare-stats access, profile discoverability
- **Target integration:** New `e2e/high/navigation-feedback.spec.ts`
- **Preconditions:** Tournament with visible participant links exists.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open a tournament detail page and click a participant profile link. | Browser lands on `/users/:id`. |
| 2 | Click `View Statistics` from the profile hero. | Browser lands on `/statistics/:id`. |
| 3 | Click the statistics `Back` button once. | Browser returns to the originating profile page. |
| 4 | Click the profile `Go Back` button once. | Browser returns to the originating tournament detail page. |
| 5 | Repeat from `My Matches` as the entry point. | Browser returns to `My Matches` with one click. |

- **Postconditions:** None.
- **Automation notes:** This is the most valuable place to validate the user-facing back-button repair without depending on low-level history APIs.

### FDBK-NAV-003 Dashboard counters should render live role-aware values

- **Priority:** High
- **Feedback reference:** Dashboard counter fixes
- **Target integration:** Extend `e2e/critical/auth.spec.ts`
- **Preconditions:** System-admin and tournament-admin accounts available; seeded tournaments in mixed states exist.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/home` as system admin. | Dashboard shows disputed matches, active tournaments, total users, and tournaments managed. |
| 2 | Confirm values are numeric and not placeholder zeroes. | Cards render live values. |
| 3 | Open `/home` as tournament admin. | Dashboard shows only the cards allowed for that role. |
| 4 | Verify the `Total Users` card is absent for tournament admin. | Role gating is enforced in UI. |

- **Postconditions:** None.
- **Automation notes:** Treat exact counts as fixture-dependent; assert visibility, role gating, and numeric formatting rather than hardcoded totals.

---

## 5.02 Tournament Detail and Registration Administration

### FDBK-TOURN-001 Tournament create and edit should update the color preview live

- **Priority:** Medium
- **Feedback reference:** Color preview live updates
- **Target integration:** Extend `e2e/critical/tournament-crud.spec.ts`
- **Preconditions:** Tournament admin authenticated.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/create`. | Tournament form is visible. |
| 2 | Fill required fields and change primary and secondary colors. | Preview gradient updates immediately without submit. |
| 3 | Create the tournament and reopen `/tournaments/:id/edit`. | Branding values persist. |
| 4 | Change the colors again in edit mode. | Preview updates immediately again. |

- **Postconditions:** Tournament can be deleted in cleanup.
- **Automation notes:** Prefer asserting style attribute or computed CSS values of the preview element instead of taking full screenshots.

### FDBK-TOURN-002 Participant list should support admin filtering, badges, and public profile links

- **Priority:** High
- **Feedback reference:** Improved participant visualization, profile links, public participant list
- **Target integration:** Extend `e2e/high/registration.spec.ts`
- **Preconditions:** Tournament with mixed registration states exists.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open tournament detail as organizer. | Admin participant table renders filter and status badges. |
| 2 | Filter by `Pending`, `Accepted`, and a state with zero entries. | Table contents and empty state update correctly. |
| 3 | Verify acceptance-type badges appear for accepted players. | Labels such as `DA`, `WC`, `LL`, or `ALT` are visible when seeded. |
| 4 | Click a participant name. | Browser opens `/users/:id`. |
| 5 | Open the same tournament as a non-admin or public user. | Public participant list renders only accepted players and profile links. |

- **Postconditions:** None.
- **Automation notes:** Keep admin and public assertions in the same scenario only if fixture setup cost is high; otherwise split by role for clearer failures.

### FDBK-TOURN-003 Participant administration should use the unified edit modal with all acceptance types

- **Priority:** High
- **Feedback reference:** Unified participant edit modal, full acceptance status dropdown
- **Target integration:** Extend `e2e/high/registration.spec.ts`
- **Preconditions:** Organizer-owned tournament with at least one participant and at least two categories.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the participant list and click `Edit` for one participant. | Unified modal opens. |
| 2 | Change seed number, registration status, acceptance type, and category. | Inputs accept changes in one modal session. |
| 3 | Save the changes. | Table updates with the new seed, status badge, acceptance badge, and category. |
| 4 | Reopen the modal and cancel another edit. | No unintended changes are persisted. |

- **Postconditions:** Participant remains in a valid state.
- **Automation notes:** Seed at least one participant that can safely switch categories without breaking other scenarios.

### FDBK-TOURN-004 Tournament detail should auto-create a default category and gate actions by state

- **Priority:** High
- **Feedback reference:** Default category creation, state-based action validation
- **Target integration:** Extend `e2e/critical/tournament-crud.spec.ts`
- **Preconditions:** Fresh tournament with zero categories exists.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the fresh tournament detail as admin. | Default `Open (Default Category)` appears automatically. |
| 2 | Verify participant-registration-related controls can now see a valid category. | Category-dependent UI no longer blocks basic flows. |
| 3 | Transition the tournament to a locked state such as `IN_PROGRESS` through API seeding. | Edit button and add-category actions become hidden or disabled. |
| 4 | Attempt to open `/tournaments/:id/edit` directly. | UI redirects back to the detail view with a clear error or denial state. |

- **Postconditions:** Tournament remains valid for cleanup.
- **Automation notes:** This scenario is a good candidate for split assertions: one test for auto-category creation and one for state-gated editing.

### FDBK-TOURN-005 Court management should support CRUD and return cleanly to tournament detail

- **Priority:** High
- **Feedback reference:** Court management interface
- **Target integration:** Extend `e2e/critical/order-of-play.spec.ts`
- **Preconditions:** Organizer-owned tournament exists.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/:id/courts`. | Court management page loads. |
| 2 | Create a new court with opening and closing hours. | Court row appears in the list. |
| 3 | Edit the court name or time window inline. | Updated values persist in the row. |
| 4 | Delete the court. | Court row disappears after confirmation. |
| 5 | Click the page back button. | Browser returns to the tournament detail page. |

- **Postconditions:** No residual courts remain if the test is destructive.
- **Automation notes:** Reuse the same tournament seed as scheduling tests when possible.

### FDBK-TOURN-006 Tournament-scoped pages should show the current tournament logo only in scoped context

- **Priority:** Medium
- **Feedback reference:** Tournament logo on subpages
- **Target integration:** Extend module-local specs for bracket, matches, order of play, standings, announcements, and statistics.
- **Preconditions:** Tournament with logo URL exists.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open a tournament-scoped route such as `/brackets/:id` or `/matches?tournamentId=:id`. | Logo and tournament name are visible in the header region. |
| 2 | Open the equivalent global route without tournament context. | Tournament logo is absent. |

- **Postconditions:** None.
- **Automation notes:** Do not duplicate this assertion in every spec; one scoped-page sample plus one global-page sample per module is enough.

---

## 5.03 Match and Result Management

### FDBK-MATCH-001 Match detail should expose helper text for status codes and ball-provider context

- **Priority:** Low
- **Feedback reference:** Match status tooltips, ball-provider clarification text
- **Target integration:** Extend `e2e/critical/result-management.spec.ts`
- **Preconditions:** Match detail page available.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open a match detail page as organizer. | Status field is visible. |
| 2 | Open the status dropdown. | Option labels and hoverable status explanations are present. |
| 3 | Inspect the ball-provider field area. | Clarification text states that the selection applies to this match only. |

- **Postconditions:** None.
- **Automation notes:** Tooltip assertions should be limited to one or two representative statuses to reduce flakiness.

### FDBK-MATCH-002 Result entry should support player comments and super tiebreak input

- **Priority:** Critical
- **Feedback reference:** Player comments field, super tiebreak support
- **Target integration:** Extend `e2e/critical/result-management.spec.ts`
- **Preconditions:** One standard match and one `SUPER_TIEBREAK` match fixture exist.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `My Matches` as participant for a standard scheduled match. | Result-entry modal opens. |
| 2 | Enter a valid result plus an optional player comment. | Comment field accepts input and shows max-length guidance. |
| 3 | Submit the result. | Result is accepted with the comment persisted. |
| 4 | Open `My Matches` for a super-tiebreak-format match. | Score UI renders the super-tiebreak-specific input path. |
| 5 | Enter a score such as `10-8` in the tiebreak flow and submit. | Match saves successfully using the super-tiebreak rules. |

- **Postconditions:** Match state may become pending confirmation or completed depending on fixture type.
- **Automation notes:** This scenario should share the pending-result helper needed by `MATCH-004` and `MATCH-005`.

### FDBK-MATCH-003 Status updates should enforce scheduled-time and winner requirements

- **Priority:** Critical
- **Feedback reference:** Scheduled requires time, winner selection for WO/RET/DEF
- **Target integration:** Extend `e2e/critical/result-management.spec.ts`
- **Preconditions:** One unscheduled match and one match with two concrete participants exist.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the status modal for an unscheduled match and choose `SCHEDULED`. | Warning appears before submit. |
| 2 | Submit without scheduled time. | Save is blocked with a clear validation message. |
| 3 | Open the status modal for a normal match and choose `WALKOVER`. | Winner dropdown appears. |
| 4 | Submit without a winner. | Save is blocked with a winner-required error. |
| 5 | Select a winner and submit. | Match stores the new status and winner successfully. |

- **Postconditions:** Match enters a valid non-score terminal state.
- **Automation notes:** Cover one of `WALKOVER`, `RETIRED`, or `DEFAULT` deeply and keep the others as lighter variants unless regression history says otherwise.

### FDBK-MATCH-004 Match scheduling should block BYE matches and status dropdowns should show only valid transitions

- **Priority:** High
- **Feedback reference:** Prevent scheduling BYE matches, valid transition filtering
- **Target integration:** Extend `e2e/critical/result-management.spec.ts`
- **Preconditions:** One `BYE` match fixture and one normal scheduled match fixture exist.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open a `BYE` match. | Schedule action is hidden or blocked. |
| 2 | Attempt to schedule through any available control path. | UI rejects the action with BYE-specific guidance. |
| 3 | Open a normal `SCHEDULED` or `IN_PROGRESS` match. | Status dropdown opens. |
| 4 | Inspect the available statuses. | Only valid next transitions plus the current state are shown. |

- **Postconditions:** None.
- **Automation notes:** Avoid asserting the full universe of status options; assert presence of allowed states and absence of a few invalid ones.

### FDBK-MATCH-005 Pending-result confirmation and dispute should use the new deterministic fixture

- **Priority:** Critical
- **Feedback reference:** Result confirmation workflow, dispute workflow, feedback result-entry changes
- **Target integration:** Replace existing `fixme` blocks in `e2e/critical/result-management.spec.ts`
- **Preconditions:** `createPendingResultFixture()` is available.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `My Matches` as player A and submit a result. | Result enters pending confirmation state. |
| 2 | Open `My Matches` as player B. | Confirm and dispute controls are visible. |
| 3 | Confirm the result in one variant. | Match becomes completed and pending state disappears. |
| 4 | Dispute the result in a second variant. | Dispute reason is recorded and admin-facing follow-up becomes available. |

- **Postconditions:** Fixture can be cleaned without leaving inconsistent standings.
- **Automation notes:** This should be treated as the anchor fixture for later Phase 8 dedicated tests.

---

## 5.04 Bracket, Draw, and Phase Management

### FDBK-DRAW-001 Bracket view should distinguish BYE from TBD and render new badges correctly

- **Priority:** High
- **Feedback reference:** Seed numbers, acceptance-type badges, match-format badges, BYE vs TBD distinction, participant profile links
- **Target integration:** Extend `e2e/high/bracket-visualization.spec.ts`
- **Preconditions:** Published bracket with seeded players, acceptance types, one `BYE`, and one unresolved slot exists.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/brackets/:id` as public user. | Bracket renders. |
| 2 | Inspect seeded participants. | Seed number and acceptance-type badge appear together. |
| 3 | Inspect a match with explicit format metadata. | Match-format badge is visible next to the status badge. |
| 4 | Inspect a `BYE` slot and a `TBD` slot. | `BYE` and `TBD` use distinct labels and styles. |
| 5 | Click a participant profile link from the bracket. | Browser opens `/users/:id`. |

- **Postconditions:** None.
- **Automation notes:** This scenario should stay read-only and public-facing for stability.

### FDBK-DRAW-002 Bracket generation should apply the selected match format

- **Priority:** High
- **Feedback reference:** Match format selection in bracket generation
- **Target integration:** Extend `e2e/high/advanced-bracket-config.spec.ts`
- **Preconditions:** Tournament in `DRAW_PENDING` with approved players exists.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the bracket generation form. | Form and format controls are visible. |
| 2 | Select a non-default format such as `Pro Set`. | Chosen radio option becomes active. |
| 3 | Generate the bracket. | UI navigates to the bracket view or renders the new bracket section. |
| 4 | Inspect the created matches. | Match-format badge reflects the selected format, not the default. |

- **Postconditions:** Bracket may be removed during cleanup.
- **Automation notes:** This is the missing companion to the already-implemented advanced-options suite.

### FDBK-DRAW-003 Phase management should support overview, creation, linking, advancement, and lucky loser promotion

- **Priority:** High
- **Feedback reference:** Phase overview tab, create phase, link phases, advance qualifiers, lucky loser, flow diagram
- **Target integration:** Extend `e2e/critical/draw-generation.spec.ts`
- **Preconditions:** Tournament with categories exists; `createPhaseChainFixture()` is available for deep flow variants.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/:id/phases`. | `Phases Overview` is the default tab. |
| 2 | Verify empty state or existing phase cards render. | Overview reflects the current phase inventory. |
| 3 | Create a new phase from the modal. | New phase appears in the overview. |
| 4 | Link source and target phases. | Relationship is saved and reflected in the flow diagram. |
| 5 | Seed completed standings and advance qualifiers. | Target phase receives qualifiers. |
| 6 | Seed a withdrawal and promote a lucky loser. | Replacement participant is promoted successfully. |

- **Postconditions:** Created phases and registrations should be cleaned in teardown.
- **Automation notes:** Implement this as several focused tests sharing one serial fixture rather than one giant end-to-end test.

---

## 5.05 Announcements, Statistics, Ranking, and Export

### FDBK-CONTENT-001 Announcements should support image upload and external link CTA rendering

- **Priority:** Medium
- **Feedback reference:** Image upload, external link fields
- **Target integration:** Extend `e2e/medium/announcements.spec.ts`
- **Preconditions:** Admin-authenticated announcement create route available.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/announcements/create?tournamentId=:id`. | Announcement form renders media and link controls. |
| 2 | Upload an image fixture under 5 MB. | Preview appears. |
| 3 | Fill an external URL and custom link text. | Link text field is accepted and persisted. |
| 4 | Submit the announcement and reopen it in the list modal. | Image renders and CTA button opens the external link target. |

- **Postconditions:** Created announcement can be deleted in cleanup if needed.
- **Automation notes:** Use a local image fixture checked into the repo instead of generating binary content during the test.

### FDBK-STATS-001 Statistics entry points should support compare flow and tournament context branding

- **Priority:** High
- **Feedback reference:** Compare Stats button, tournament logo on statistics page
- **Target integration:** Extend `e2e/high/standings.spec.ts` and `e2e/high/navigation-feedback.spec.ts`
- **Preconditions:** Tournament participant profile links available.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open another user's profile. | `View Statistics` button is visible for authenticated users. |
| 2 | Click the button. | Browser lands on the correct statistics route for that user. |
| 3 | Open a tournament statistics page with a tournament context. | Tournament logo appears. |
| 4 | Open the global statistics page without a tournament context. | Tournament logo is absent. |

- **Postconditions:** None.
- **Automation notes:** Keep self-profile assertions out of this scenario unless they add coverage for button hiding logic.

### FDBK-RANK-001 Rankings page should let admins recalculate positions and hide the action for non-admins

- **Priority:** Medium
- **Feedback reference:** Global ranking update workflow
- **Target integration:** Extend `e2e/medium/ranking.spec.ts`
- **Preconditions:** `createRankingShuffleFixture()` is available.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/rankings` as admin. | `Recalculate Rankings` button is visible. |
| 2 | Trigger the recalculation. | Success feedback appears. |
| 3 | Verify the ordered positions or movement indicators update. | Rankings reflect the recalculated sort order. |
| 4 | Open `/rankings` as a non-admin user. | Recalculation control is hidden. |

- **Postconditions:** Ranking data can be restored or cleaned after the run.
- **Automation notes:** Make the fixture intentionally misordered so the test can assert a real change.

### FDBK-EXP-001 Tournament statistics export should expose the improved PDF template content

- **Priority:** Medium
- **Feedback reference:** Improved PDF export template
- **Target integration:** Extend `e2e/medium/export.spec.ts`
- **Preconditions:** Tournament statistics export route available with seeded data.

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open `/tournaments/:id/statistics` as organizer. | Export section is visible. |
| 2 | Trigger PDF export. | Export entry point succeeds. |
| 3 | Validate the generated document target or preview route. | PDF contains key strings such as tournament title and category breakdown. |

- **Postconditions:** Export artifacts can be discarded.
- **Automation notes:** Do not overfit to exact PDF layout pixels; validate presence of the updated content blocks instead.

---

## 6. Execution Order and Priority

Recommended implementation order:

1. `FDBK-MATCH-002` through `FDBK-MATCH-005`
2. `FDBK-DRAW-001` through `FDBK-DRAW-003`
3. `FDBK-TOURN-002` through `FDBK-TOURN-005`
4. `FDBK-NAV-001` through `FDBK-NAV-003`
5. `FDBK-CONTENT-001`, `FDBK-RANK-001`, and `FDBK-EXP-001`
6. Lower-value UI-copy checks such as `FDBK-MATCH-001` and tournament-logo smoke assertions

Reasoning:

- Match-state and pending-result coverage remove the largest known critical gap from the current suite.
- Bracket and phase scenarios validate the most complex client-feedback flows and require the heaviest seed work.
- Tournament administration flows are high-value but easier once the seeding utilities are in place.
- Navigation and content enhancements are important, but they are less likely to mask deep backend inconsistencies.

---

## 7. Implementation Notes and Risks

### 7.1 Already-covered areas

- Do not duplicate `ADV-001` to `ADV-005` from `e2e/high/advanced-bracket-config.spec.ts`.
- Reuse the existing bracket, match, announcement, notification, ranking, and profile page objects where possible.

### 7.2 Expected blockers

- Pending-result confirmation and dispute flows will stay fragile until the dedicated seed helper exists.
- Phase advancement scenarios may require backend-side fixture shortcuts if standings generation through UI is too expensive.
- PDF validation may need a preview-route or response-body strategy instead of relying on browser-native PDF rendering.
- Tournament-logo assertions should stay intentionally light to avoid turning simple state-sharing checks into screenshot tests.

### 7.3 Recommended helper additions

- Add match-format-aware score helpers so one function can enter standard-set and super-tiebreak results.
- Add reusable `openParticipantProfileFromContext()` helpers for tournament detail, bracket, and my-matches pages.
- Add a shared helper for tournament-context pages that asserts logo visibility only when `tournamentId` context is expected.

---

## 8. Implementation Summary

Planned impact on the Playwright suite:

- **New spec files recommended:** 1
  - `e2e/high/navigation-feedback.spec.ts`
- **Existing spec files to extend:** 10
  - `e2e/critical/auth.spec.ts`
  - `e2e/critical/tournament-crud.spec.ts`
  - `e2e/critical/result-management.spec.ts`
  - `e2e/critical/order-of-play.spec.ts`
  - `e2e/critical/draw-generation.spec.ts`
  - `e2e/high/registration.spec.ts`
  - `e2e/high/bracket-visualization.spec.ts`
  - `e2e/medium/announcements.spec.ts`
  - `e2e/medium/ranking.spec.ts`
  - `e2e/medium/export.spec.ts`

Planned scenario volume:

- **Critical additions:** 3 scenarios
- **High additions:** 12 scenarios
- **Medium additions:** 5 scenarios
- **Low additions:** 1 scenario
- **Total planned feedback scenarios:** 21

Expected development prerequisites before implementation starts:

- Deterministic pending-result seed helper
- Deterministic BYE/TBD bracket seed helper
- Deterministic phase-chain seed helper
- Ranking reorder fixture
- Stable media fixture for announcement uploads

Definition of done for the feedback automation pass:

- All non-blocked scenarios from this plan are implemented in the appropriate priority bucket.
- Existing `fixme` tests for result confirmation and dispute are replaced by deterministic runnable coverage.
- New tests pass in at least `chromium` locally before widening to all configured projects.
- Any intentionally deferred scenarios remain documented with an explicit reason in the target spec file.
