# Tennis Tournament Manager — Change Log

## UX Improvements (April 23, 2026)

### Fix: Order-of-Play Courts Section — Read-Only Display + Manage Courts Button

**Status:** ✅ COMPLETED

**Location:**
- `src/presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.ts` *(modified)*
- `src/presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.html` *(modified)*
- `src/presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.css` *(modified)*

**Description:**
The courts panel in the order-of-play view previously allowed inline court editing (rename, delete). This was redundant since a dedicated court management page already exists. The panel has been converted to a read-only display with a "🏟️ Manage Courts" button for admins.

**Changes:**
- Removed inline edit mode (input + save/cancel buttons) from each court row.
- Removed edit and delete action buttons from court list items.
- Replaced "➕ Add" button with "🏟️ Manage Courts" button (visible to TOURNAMENT_ADMIN and SYSTEM_ADMIN only).
- "Manage Courts" button navigates to `/tournaments/:id/courts`.
- Added `navigateToCourtManagement()` method and `Router` injection.
- Added `TournamentService` injection + `loadTournamentState()` method so that the button is always enabled when the tournament loads (matching the behavior of the tournament detail page, which has no status restriction on court management).
- Empty state message updated from "Click 'Add' to create one" to "Use 'Manage Courts' to add one" (admin) / generic message (other roles).
- Disabled button CSS rule added for completeness (`.btn-add-small:disabled`).

---

### Fix: Disabled Edit Button Visual State

**Status:** ✅ COMPLETED

**Location:**
- `src/presentation/pages/tournaments/tournament-detail/tournament-detail-new.component.css` *(modified)*

**Description:**
Added a `:disabled` CSS rule for `.action-btn.edit` so the button clearly appears disabled (reduced opacity, muted color, `cursor: not-allowed`) when the tournament is in a locked state.

---

### Fix: Locked Tournament Edit — Modal Instead of URL Redirect

**Status:** ✅ COMPLETED

**Location:**
- `src/presentation/pages/tournaments/tournament-edit/tournament-edit.component.ts` *(modified)*
- `src/presentation/pages/tournaments/tournament-edit/tournament-edit.component.html` *(modified)*
- `src/presentation/pages/tournaments/tournament-edit/tournament-edit.component.css` *(modified)*
- `src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.ts` *(modified)*

**Description:**
Replaced the `?error=` query param redirect (which produced ugly URLs like `.../tournaments/trn_xxx?error=Tournament%20...`) with an in-page modal overlay.
When a locked tournament's edit URL is accessed, the edit page now shows a "Tournament Locked" modal dialog that explains the reason and provides a "Back to Tournament" button. The `combineLatest`/`queryParamMap` logic in the detail component was removed as it is no longer needed.

---

## Phase 5: State Management & Validation (April 23, 2026)

### Feature 5.4: Court Management Interface

**Status:** ✅ COMPLETED

**Location:**
- `src/presentation/pages/courts/court-management/court-management.component.ts` *(new)*
- `src/presentation/pages/courts/court-management/court-management.component.html` *(new)*
- `src/presentation/pages/courts/court-management/court-management.component.css` *(new)*
- `src/presentation/app.routes.ts` *(modified)*
- `src/presentation/pages/tournaments/tournament-detail/tournament-detail-new.component.html` *(modified)*
- `src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.ts` *(modified)*

**Description:**
Added a full CRUD court management admin interface accessible via the tournament detail page.
Tournament admins and system admins can now view, add, edit, and delete courts directly from the frontend.

**Features:**
- List all courts for the tournament with name, surface, opening/closing times, and availability status
- Add new courts (name required; opening and closing times optional in HH:MM format)
- Edit court names and hours inline within the table (row-level edit mode)
- Delete courts with a confirmation dialog
- Tournament logo display from `TournamentStateService`
- Back navigation to tournament detail
- Status/success messages with auto-dismiss
- Client-side validation: HH:MM format, closing time must be after opening time

**Route:** `GET /tournaments/:tournamentId/courts` (guarded by `roleGuard` for SYSTEM_ADMIN / TOURNAMENT_ADMIN)

**Quick Actions button:** "Manage Courts" 🏟️ tile added to tournament detail Quick Actions section (admin only).

---

### Feature 5.3: Tournament State-Based Action Validation

**Status:** ✅ COMPLETED

**Location:**
- `src/presentation/pages/tournaments/tournament-detail/tournament-detail.component.ts` *(modified)*
- `src/presentation/pages/tournaments/tournament-detail/tournament-detail-new.component.html` *(modified)*
- `src/presentation/pages/tournaments/tournament-edit/tournament-edit.component.ts` *(modified)*

**Description:**
Implemented FSM-based action guards in the frontend to prevent contradictory actions based on the current tournament lifecycle status.

**Validation rules implemented:**

| Action | Allowed statuses |
|---|---|
| Edit tournament details | DRAFT, REGISTRATION_OPEN, REGISTRATION_CLOSED |
| Register as participant | REGISTRATION_OPEN (+ deadline check) |
| Generate brackets | REGISTRATION_CLOSED, DRAW_PENDING |
| Add categories | DRAFT, REGISTRATION_OPEN |

**Changes:**
- `isRegistrationClosed` computed signal updated: now returns `true` when tournament status is not `REGISTRATION_OPEN` (in addition to the previous deadline check). This ensures registration is blocked by status, not just by date.
- `canEditTournamentDetails` computed signal added: returns `true` only for preparatory statuses (DRAFT, REGISTRATION_OPEN, REGISTRATION_CLOSED).
- `canGenerateBrackets` computed signal added: returns `true` only for REGISTRATION_CLOSED and DRAW_PENDING.
- `canAddCategories` computed signal added: returns `true` only for DRAFT and REGISTRATION_OPEN.
- Tournament detail HTML updated: Edit button is disabled with tooltip when tournament is locked. Bracket generation section only rendered when `canGenerateBrackets()`. Category Management "Add Category" button is hidden (with explanatory label) when `canAddCategories()` is false.
- Tournament edit component: `loadTournament()` now redirects back to the detail page with an `?error=` query param if the tournament status is locked. The detail component reads this param on navigation and surfaces the message.

---

## Phase 5: State Management & Validation (April 23, 2026) — Earlier Features

### Feature 5.1: Prevent BYE participant scheduling

**Status:** ✅ COMPLETED

Blocked match scheduling (Order of Play) for matches that contain BYE participants, preventing invalid entries from appearing in the order of play.

---

### Feature 5.2: Distinguish BYE from TBD in bracket display

**Status:** ✅ COMPLETED

Updated bracket view rendering to differentiate between BYE slots (opponent waived) and TBD slots (opponent not yet determined), providing clearer visual information.

---

### Feature 5.4: Match status transition filtering

**Status:** ✅ COMPLETED

Added filtering in the match detail admin panel so that only valid next statuses (per the match FSM) are offered in the status dropdown, preventing impossible or contradictory transitions.

---

## Earlier Phases

All features for Phases 1–4 were implemented and documented in prior sessions. See repository history for details.
