# Feature Verification Guide

**Document Version:** 1.0  
**Date:** April 22, 2026  
**Purpose:** Guide to replicate and verify features marked as "not covered" in client feedback but actually exist in the system

---

## Overview

This document provides step-by-step instructions to verify that features marked as not covered or unknown in the client feedback are actually implemented and functional. Each section includes:

- **Feature Description** - What the feature does
- **Backend Evidence** - Where it's implemented in backend
- **Frontend Evidence** - Where it's implemented in frontend
- **Verification Steps** - How to test it works
- **Expected Results** - What you should see
- **Known Issues** - Any caveats or limitations

---

## 1. IN_APP Notification System

### Feature Description
System sends notifications through the web interface (IN_APP channel). Users can view notifications in real-time via the notifications page and receive updates about match schedules, results, order of play, and announcements.

### Backend Evidence
**Location:** `backend/src/application/services/notification.service.ts`
**Key Components:**
- NotificationService - Creates and persists notifications
- WebSocket integration - Real-time delivery
- NotificationPreferences - User preference management

**Database:**
- Table: `notifications`
- Table: `notification_preferences` with `inAppEnabled` column

### Frontend Evidence
**Location:** `src/presentation/pages/notification-preferences/notification-preferences.component.ts`
**UI Components:**
- Toggle switch for IN_APP notifications
- Event type filters (match scheduled, result entered, order of play, etc.)
- Notifications page with list view
- Bell icon with unread count badge

### Verification Steps

#### Step 1: Enable IN_APP Notifications
1. Log in as a participant user
2. Navigate to **Profile → Notification Preferences**
3. Ensure "In-App Notifications" toggle is **ON**
4. Enable event types:
   - ✅ Match Scheduled
   - ✅ Result Entered
   - ✅ Order of Play Published
   - ✅ New Announcements
5. Click **Save Preferences**

#### Step 2: Trigger Notification
1. Have an admin schedule a match for you, OR
2. Have an opponent enter a match result, OR
3. Have an admin publish order of play, OR
4. Have an admin create a new announcement

#### Step 3: View Notification
1. Observe the **bell icon** in the top navigation bar
2. **Expected Result:** Badge shows count of unread notifications (e.g., "1")
3. Click the bell icon or navigate to **Notifications** page
4. **Expected Result:** You should see:
   - Notification title (e.g., "Match Scheduled")
   - Notification message (e.g., "Your match against [Opponent] is scheduled for [Date] at [Time]")
   - Timestamp (e.g., "5 minutes ago")
   - Unread indicator (blue dot or bold text)

#### Step 4: Mark as Read
1. Click on the notification
2. **Expected Result:**
   - Notification marked as read
   - Badge count decreases
   - Notification appearance changes (no longer bold/highlighted)

#### Step 5: Real-Time Delivery Test
1. Open app in two browser windows
2. Log in as the same user in both
3. Trigger a notification (admin action in one window)
4. **Expected Result:** Notification appears immediately in both windows without refresh

### Known Issues
- No notification grouping - Each event creates separate notification
- No "mark all as read" button
- No notification history pagination (loads all notifications)

### Recommended Improvements
1. ✅ Add "Mark All as Read" button
2. ✅ Add notification grouping (e.g., "3 new match results")
3. ✅ Add pagination for notification history
4. ✅ Add filter by notification type
5. ✅ Add notification sound toggle
6. ✅ Add notification preview in dropdown (don't require page navigation)

---

## 2. Multiple Tournament Phases (Phase Linking)

### Feature Description
A single tournament can have multiple phases (draws): Qualifying, Main, Consolation. Participants can advance from qualifying to main, or drop to consolation after losing.

### Backend Evidence
**Location:** `backend/src/application/services/phase-progression.service.ts`
**Key Entities:**
- `Phase` - Represents each draw within a tournament
- `PhaseLink` - Defines relationships between phases
- `PhaseType` enum: QUALIFYING, MAIN, CONSOLATION

**API Endpoints:**
- `POST /api/phases/:sourceId/link/:targetId` - Link two phases
- `POST /api/phases/:sourceId/advance-qualifiers` - Promote top N to next phase
- `POST /api/phases/:id/consolation` - Create consolation for losers
- `POST /api/phases/:phaseId/promote-lucky-loser/:registrationId` - Promote alternate

### Frontend Evidence
**Location:** TBD (needs UI enhancement)
**Issue:** UI doesn't expose phase management clearly

### Verification Steps

#### Step 1: Create Multi-Phase Tournament
1. Log in as **System Admin** or **Tournament Admin**
2. Create a tournament: "Test Championship"
3. Add at least 16 participants (8 for qualifying, 8 for main)
4. **Create Qualifying Phase:**
   - Go to tournament detail page
   - Navigate to "Brackets" tab
   - Click "Create New Phase"
   - Set Name: "Qualifying Draw"
   - Set Type: QUALIFYING
   - Set Bracket Type: SINGLE_ELIMINATION
   - Set Number of Qualifiers: 4
   - Generate bracket with 8 participants

#### Step 2: Link Qualifying to Main
1. **Create Main Phase:**
   - Click "Create New Phase" again
   - Set Name: "Main Draw"
   - Set Type: MAIN
   - Set Bracket Type: SINGLE_ELIMINATION
   - Generate bracket with 4 placeholder spots (for qualifiers) + 4 direct entries

2. **Link Phases via API** (UI not implemented):
   ```bash
   # Get phase IDs from browser network tab or database
   QUALIFYING_PHASE_ID="phase_xxx"
   MAIN_PHASE_ID="phase_yyy"
   
   curl -X POST http://localhost:3000/api/phases/$QUALIFYING_PHASE_ID/link/$MAIN_PHASE_ID \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "qualifiersCount": 4,
       "advancementRule": "TOP_N"
     }'
   ```

#### Step 3: Advance Qualifiers
1. Complete all qualifying matches
2. Call advancement API:
   ```bash
   curl -X POST http://localhost:3000/api/phases/$QUALIFYING_PHASE_ID/advance-qualifiers \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
3. **Expected Result:** 
   - Top 4 from qualifying are added to main draw
   - Their acceptance status changes to `QU` (Qualifier)
   - Main draw bracket updates with qualified participants

#### Step 4: Create Consolation Draw
1. In Main Draw, some participants lose Round 1
2. Create consolation phase:
   ```bash
   curl -X POST http://localhost:3000/api/phases/$MAIN_PHASE_ID/consolation \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Consolation Draw",
       "eliminationRound": 1,
       "bracketType": "SINGLE_ELIMINATION"
     }'
   ```
3. **Expected Result:** 
   - New consolation phase created
   - Round 1 losers moved to consolation bracket
   - Can be repeated for multi-level consolation (Compass draws)

#### Step 5: Promote Lucky Loser
1. A participant withdraws from Main Draw after qualifying closed
2. Promote highest-ranked alternate:
   ```bash
   curl -X POST http://localhost:3000/api/phases/$MAIN_PHASE_ID/promote-lucky-loser/$REGISTRATION_ID \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
3. **Expected Result:**
   - Registration status changes from ALT to LL
   - Participant fills empty spot in main draw

### Known Issues
- **No UI for phase linking** - All operations via API only
- **No visual phase relationship diagram** - Can't see qualifying → main → consolation flow
- **Bracket regeneration required** - After advancing qualifiers, may need manual bracket update

### Recommended Improvements
1. Add "Phases" tab in tournament detail with phase list
2. Add "Link to Next Phase" button in each phase view
3. Add visual phase flow diagram (flowchart or tree)
4. Add "Advance Qualifiers" button when qualifying phase complete
5. Add "Create Consolation" button for each elimination round
6. Show participant journey across phases (which phase they're in)

---

## 3. Match Format Configuration

### Feature Description
Different match formats can be configured: Best of 3 sets, Best of 5 sets, sets to 4 games, sets to 6 games, super tiebreak rules.

### Backend Evidence
**Location:** `backend/src/domain/entities/match-format.entity.ts`
**Fields:**
- `bestOf` - Number of sets to win (2 or 3)
- `gamesPerSet` - Games per set (4, 6, or custom)
- `tiebreakAt` - When to play tiebreak (e.g., 6-6)
- `finalSetTiebreak` - Whether final set has tiebreak or advantage format
- `superTiebreak` - Whether to use 10-point super tiebreak at 1-1 in best-of-3

**Database:**
- Table: `match_formats`
- Seeded with common formats (Best of 3 with tiebreak, Best of 5, etc.)

### Frontend Evidence
**Location:** ❌ **MISSING** - No UI to select format during tournament/bracket creation

### Verification Steps

#### Step 1: Verify Backend Supports Formats
1. Check database has match formats:
   ```sql
   SELECT * FROM match_formats;
   ```
2. **Expected Result:** Rows with different format configurations

#### Step 2: Test Format via API (UI Not Available)
1. Create tournament with specific format:
   ```bash
   curl -X POST http://localhost:3000/api/tournaments \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Tournament",
       "startDate": "2026-05-01",
       "endDate": "2026-05-07",
       "registrationDeadline": "2026-04-30",
       "matchFormatId": "format_best_of_3_tiebreak",
       ...
     }'
   ```

#### Step 3: Verify Score Validation (When UI Implemented)
1. Create match with Best of 3 (no super tiebreak)
2. Try to enter score: 6-4, 4-6, 10-8 (super tiebreak)
3. **Expected Result:** Should reject (format doesn't allow super tiebreak)

4. Create match with Best of 3 + Super Tiebreak
5. Enter score: 6-4, 4-6, 10-8
6. **Expected Result:** Should accept

### Known Issues
- **No UI to select format** during tournament/bracket creation
- **No format validation** in frontend score entry form
- **Super tiebreak not captured** - Only shows as third set (e.g., 1-0 or 0-1)
- **No distinction** between standard tiebreak (7 points) and super tiebreak (10 points)

### Recommended Improvements
1. ✅ Add "Match Format" dropdown in tournament creation form
2. ✅ Show selected format in bracket detail view
3. ✅ Validate score entry against format rules
4. ✅ Add separate input for super tiebreak points (6-4, 4-6, [10-8])
5. ✅ Display format-specific scoring rules in result entry form

---

## 4. Participant Result Entry

### Feature Description
Registered participants can enter their match results immediately after playing. Results go through a confirmation workflow: submit → opponent confirms → official.

### Backend Evidence
**Location:** `backend/src/application/services/result-confirmation.service.ts`
**API Endpoint:** `POST /api/matches/:matchId/result`
**Workflow:**
1. Participant A submits result
2. Status: `PENDING_CONFIRMATION`
3. Participant B confirms/disputes
4. If confirmed: Status → `CONFIRMED`, match status → `COMPLETED`
5. If disputed: Status → `DISPUTED`, admin resolves

### Frontend Evidence
**Location:** `src/presentation/pages/my-matches/my-matches.component.ts`
**UI Flow:**
1. Navigate to `/my-matches`
2. See tabs: Upcoming, In Progress, Pending Confirmation, Completed
3. Click "Enter Result" button on match card
4. Modal opens with set-by-set score entry
5. Select match status (COMPLETED, RETIRED, etc.)
6. Submit → Creates pending result

### Verification Steps

#### Step 1: Submit Result as Player A
1. Log in as **Player A** (must be participant in a scheduled match)
2. Navigate to **My Matches** (link in navigation bar)
3. Find match in "Upcoming" or "In Progress" tab
4. Click **"Enter Result"** button
5. Enter scores for each set:
   - Set 1: Player A: 6, Player B: 4
   - Set 2: Player A: 7, Player B: 5
6. Select Status: **"Completed"**
7. Click **"Submit Result"**
8. **Expected Result:**
   - Success message appears
   - Match moves to "Pending Confirmation" section
   - Status shows "Waiting for opponent confirmation"

#### Step 2: Confirm Result as Player B
1. Log out and log in as **Player B**
2. Navigate to **My Matches**
3. Go to **"Pending Confirmation"** tab
4. Find the match with Player A's submitted result
5. Review the score
6. Click **"Confirm"** button
7. **Expected Result:**
   - Match moves to "Completed" tab
   - Winner determined automatically
   - Standings updated (if tournament has standings)
   - Both players receive notification

#### Step 3: Dispute Result as Player B
1. Instead of confirming, click **"Dispute"** button
2. Enter reason: "Score was actually 6-4, 6-7, 7-6"
3. Submit dispute
4. **Expected Result:**
   - Match status → "Under Review"
   - Admin receives notification
   - Result remains in "Pending Confirmation" with dispute flag

#### Step 4: Admin Resolves Dispute
1. Log in as **Tournament Admin** or **System Admin**
2. Navigate to tournament → Matches
3. Find disputed match (should have warning icon)
4. Review both submissions and dispute reason
5. Options:
   - Validate existing result (Player A's version)
   - Modify result (enter correct score)
   - Annul match (requires replay)
6. **Expected Result:**
   - Match status updated to CONFIRMED
   - Official result recorded
   - Both participants notified of resolution

#### Step 5: Admin Direct Entry (Bypass Confirmation)
1. As admin, navigate to any match
2. Click **"Enter Result"** (admin button, not participant button)
3. Enter score
4. **Expected Result:**
   - Result immediately CONFIRMED (no pending state)
   - Standings updated instantly
   - No confirmation required from participants

### Known Issues
- **UI not prominent** - "My Matches" link may be hard to find
- **Notification badge missing** - No visual indicator for pending confirmations
- **Automatic confirmation timer** - Not implemented (should auto-confirm after 48h)
- **Match locking** - Should prevent both players from submitting simultaneously

### Recommended Improvements
1. ✅ Add prominent "My Matches" link in main navigation
2. ✅ Add notification badge with count of pending confirmations
3. ⏳ Implement 48-hour auto-confirmation timer
4. ⏳ Add optimistic locking to prevent double submission
5. ✅ Show clearer status indicators (icons + colors)
6. ⏳ Add "Quick Confirm" from notification dropdown

---

## 5. View Other Participants' Profiles

### Feature Description
Users can view other participants' profiles, with visibility controlled by privacy settings. Privacy levels: Admins Only, Same Tournament, Registered Users, Public.

### Backend Evidence
**Location:** `backend/src/application/services/user.service.ts`
**API Endpoint:** `GET /api/users/:userId/profile`
**Privacy Logic:**
- Checks viewer's role (SYSTEM_ADMIN, TOURNAMENT_ADMIN, PLAYER, SPECTATOR)
- Checks relationship (same tournament, registered user, public)
- Filters fields based on privacy settings

**Privacy Fields:**
- `contactVisibility` - Who can see phone/email/Telegram
- `rankingVisibility` - Who can see ranking/seeding
- `statsVisibility` - Who can see statistics
- `profileVisibility` - Overall profile access

### Frontend Evidence
**Location:** `src/presentation/pages/user-profile/user-profile.component.ts`
**UI Features:**
- Profile photo or avatar
- Name, category, ranking (if visible)
- Contact info (if visible)
- Match history (if visible)
- Statistics (if visible)

### Verification Steps

#### Step 1: Set Privacy Levels
1. Log in as **Player A**
2. Navigate to **Profile → Privacy Settings**
3. Set privacy levels:
   - Contact Visibility: **Same Tournament Participants**
   - Ranking Visibility: **Registered Users**
   - Stats Visibility: **Public**
   - Profile Visibility: **Registered Users**
4. Save settings

#### Step 2: View Profile as Admin (Should See Everything)
1. Log in as **System Admin**
2. Navigate to **Users** or tournament **Participants** list
3. Click on **Player A's name/profile**
4. **Expected Result:**
   - Full profile visible
   - All contact info shown (phone, email, Telegram)
   - Ranking and seeding shown
   - Complete match history and stats

#### Step 3: View Profile as Same Tournament Participant
1. Log in as **Player B** (registered in same tournament as Player A)
2. Navigate to tournament → **Participants** tab
3. Click on **Player A's name**
4. **Expected Result:**
   - Profile visible
   - Contact info shown (email, phone)
   - Ranking shown
   - Stats shown

#### Step 4: View Profile as Different Tournament Participant
1. Log in as **Player C** (registered user, but NOT in same tournament)
2. Try to access Player A's profile
3. **Expected Result:**
   - Profile visible (because profile visibility = Registered Users)
   - Contact info **HIDDEN** (requires same tournament)
   - Ranking shown
   - Stats shown

#### Step 5: View Profile as Public (Not Logged In)
1. Log out (or open incognito window)
2. Navigate to tournament page
3. Try to click on Player A's name in bracket
4. **Expected Result:**
   - Profile **HIDDEN** or limited (because profile visibility = Registered Users)
   - Only name and public stats visible
   - Contact info hidden
   - Ranking hidden

### Known Issues
- **No "View Profile" links** in participant lists - hard to discover
- **Privacy matrix not tested** - May have enforcement gaps
- **No privacy preview** - Users can't see what others see
- **Tournament relationship check** - May not work if participant in multiple tournaments

### Recommended Improvements
1. ✅ Add "View Profile" icon/link in all participant lists
2. ✅ Add "Preview as Public" button in privacy settings
3. ⏳ Create privacy enforcement test matrix
4. ⏳ Add visual indicators for privacy levels (lock icon, etc.)
5. ✅ Show "Profile visibility limited by privacy settings" message when blocked

---

## 6. Personalized H2H Statistics

### Feature Description
Each participant can view their head-to-head (H2H) record against specific opponents: total matches, wins/losses, set/game ratios, last match date, surface breakdown.

### Backend Evidence
**Location:** `backend/src/application/services/statistics.service.ts`
**Method:** `getPlayerHeadToHeadHistory(playerId: string, opponentId: string)`
**Returns:**
- Total matches played
- Wins vs losses
- Set won/lost ratio
- Games won/lost ratio
- Last match date
- Match history with scores, tournament, surface

### Frontend Evidence
**Location:** `src/presentation/pages/statistics/statistics-view.component.ts`
**UI Features:**
- "Matchups" section in statistics page
- List of opponents played against
- Win-loss record per opponent
- Expandable "View Match History" toggle
- Shows detailed match list when expanded

### Verification Steps

#### Step 1: Play Multiple Matches Between Two Players
1. Create tournament with at least 2 participants: **Player A** and **Player B**
2. Generate bracket where they play each other (Round Robin or Match Play)
3. Complete multiple matches:
   - Match 1: Player A wins 6-4, 6-3
   - Match 2: Player B wins 7-5, 6-4
   - Match 3: Player A wins 6-2, 6-1

#### Step 2: View Statistics as Player A
1. Log in as **Player A**
2. Navigate to **Statistics** page (link in profile or menu)
3. Scroll to **"Matchups"** section
4. Find **Player B** in opponent list
5. **Expected Result:**
   - Shows: "2-1" (2 wins, 1 loss)
   - Shows: Last match date
   - Shows: "View Match History" toggle/button

#### Step 3: Expand Match History
1. Click **"View Match History"** toggle
2. **Expected Result:**
   - Expands to show 3 matches
   - Each match shows:
     - Date
     - Score (6-4, 6-3 etc.)
     - Winner indicator
     - Tournament name
     - Surface (Clay/Hard/Grass)
     - Set counts

#### Step 4: View Same Stats as Player B
1. Log out and log in as **Player B**
2. Navigate to **Statistics**
3. Find **Player A** in matchups
4. **Expected Result:**
   - Shows: "1-2" (inverse of Player A's view)
   - Same matches listed
   - Winner indicators correct from their perspective

### Known Issues
- **Not easily discoverable** - Statistics page may be hidden
- **No "Compare" button** - Can't access H2H from opponent's profile directly
- **Tournament names** - May show IDs instead of names if not populated
- **Surface resolution** - Requires tournament → court → surface lookup

### Recommended Improvements
1. ✅ Add "Statistics" link in main navigation
2. ✅ Add "Compare Stats" button in user profile
3. ✅ Add "View H2H" from match detail page
4. ⏳ Add surface icons (clay = 🟤, grass = 🟢, hard = 🔵)
5. ⏳ Add graph/chart for win-loss trend over time

---

## 7. Match State Management (12 ITF States)

### Feature Description
Matches support all 12 ITF states with validated transitions: TO_BE_PLAYED, IN_PROGRESS, SUSPENDED, COMPLETED, RETIRED, WALKOVER, ABANDONED, BYE, NOT_PLAYED, CANCELLED, DEFAULT, DEAD_RUBBER.

### Backend Evidence
**Location:** `backend/src/domain/entities/match.entity.ts`
**Methods:**
- `start()` - TO_BE_PLAYED → IN_PROGRESS
- `suspend()` - IN_PROGRESS → SUSPENDED
- `resume()` - SUSPENDED → IN_PROGRESS
- `recordResult()` - IN_PROGRESS → COMPLETED
- `retire()` - IN_PROGRESS → RETIRED
- `assignWalkover()` - TO_BE_PLAYED → WALKOVER
- `abandon()` - IN_PROGRESS → ABANDONED
- `cancel()` - TO_BE_PLAYED → CANCELLED
- `applyDefault()` - TO_BE_PLAYED → DEFAULT
- `markNotPlayed()` - TO_BE_PLAYED → NOT_PLAYED
- `markAsDeadRubber()` - TO_BE_PLAYED → DEAD_RUBBER

**Validation:** `isValidTransition(from: MatchStatus, to: MatchStatus): boolean`

### Frontend Evidence
**Location:** Match detail component (various files)
**UI:** Dropdown with all 12 states

### Verification Steps

#### Step 1: Standard Match Flow (TBP → IP → CO)
1. Create match between Player A and Player B
2. Initial status: **TO_BE_PLAYED**
3. Admin clicks "Start Match" → Status: **IN_PROGRESS**
4. Participant enters result → Status: **COMPLETED**
5. **Expected Result:** All transitions work smoothly

#### Step 2: Match Suspension (Weather/Light)
1. Match in **IN_PROGRESS**
2. Admin clicks "Suspend Match" (reason: weather)
3. Status: **SUSPENDED**
4. Admin clicks "Resume Match"
5. Status: **IN_PROGRESS** (score preserved)
6. Complete normally
7. **Expected Result:** Suspension doesn't lose score

#### Step 3: Retirement (Player Injury)
1. Match in **IN_PROGRESS**
2. Score: Player A 6-4, 3-2 (leading)
3. Player B retires due to injury
4. Admin selects status: **RETIRED**
5. Admin selects winner: **Player A**
6. **Expected Result:**
   - Status: RETIRED
   - Winner: Player A
   - Partial score preserved
   - Player A advances in bracket

#### Step 4: Walkover (No-Show)
1. Match status: **TO_BE_PLAYED**
2. Player B doesn't show up (30 min grace period)
3. Admin selects status: **WALKOVER**
4. Admin selects winner: **Player A** (opponent no-show)
5. **Expected Result:**
   - Status: WALKOVER
   - Winner: Player A
   - No score recorded (shows "W.O." in bracket)
   - Player A advances

#### Step 5: BYE (Automatic Advancement)
1. Create bracket with odd number of participants (e.g., 15)
2. System creates BYE in Round 1
3. Player A has BYE in first round
4. **Expected Result:**
   - Match status: BYE
   - Player A automatically advances to Round 2
   - No match is played
   - Shows "BYE" in bracket

#### Step 6: Invalid Transitions (Should Be Blocked)
1. Try: COMPLETED → IN_PROGRESS (can't un-complete)
2. Try: RETIRED → SUSPENDED (can't suspend after retirement)
3. Try: BYE → WALKOVER (BYE is not a playable match)
4. **Expected Result:** System rejects invalid transitions with error message

### Known Issues (From Client Feedback)
- ✅ **Confusion: Scheduled without time** - Should enforce time when status = SCHEDULED
- ✅ **WO/RET without winner** - Should require winner selection
- ✅ **BYE vs TBD confusion** - Better labeling needed
- ✅ **Allows scheduling BYE matches** - Should prevent this
- ✅ **Status dropdown shows all states** - Should filter by valid transitions

### Recommended Improvements
1. ✅ Add tooltips explaining each status
2. ✅ Show only valid transitions in dropdown (not all 12)
3. ✅ Add winner selection modal for RET/WO/DEF
4. ✅ Distinguish BYE (automatic) from TBD (not yet scheduled)
5. ✅ Add validation: SCHEDULED matches must have date/time
6. ✅ Prevent scheduling matches with BYE participants
7. ✅ Add icons for each status (✓, ⏸, ❌, etc.)

---

## 8. Export Functionality (ITF CSV, TODS JSON, PDF, Excel)

### Feature Description
Tournament results and statistics can be exported in multiple formats for external use or archival.

### Backend Evidence
**Location:** `backend/src/application/services/export.service.ts`
**API Endpoints:**
- `GET /api/tournaments/:id/export/itf-csv` - ITF standard CSV format
- `GET /api/tournaments/:id/export/tods-json` - Tennis Open Data Standards JSON
- `GET /api/tournaments/:id/export/pdf` - PDF with tournament summary
- `GET /api/tournaments/:id/export/excel` - Excel spreadsheet with detailed stats

**Libraries Used:**
- `csv-writer` - CSV generation
- `pdfkit` - PDF generation
- `exceljs` - Excel workbook generation

### Frontend Evidence
**Location:** ❌ **MISSING** - No export button in UI

### Verification Steps

#### Step 1: Test ITF CSV Export
1. Complete a tournament with multiple matches
2. Call API directly:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/tournaments/TOURNAMENT_ID/export/itf-csv \
     -o tournament-results.csv
   ```
3. Open `tournament-results.csv`
4. **Expected Result:**
   - CSV with columns: Player1, Player2, Score, Date, Court, Status
   - Follows ITF CSV standard format
   - Can be imported into ITF systems

#### Step 2: Test TODS JSON Export
1. Call API:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/tournaments/TOURNAMENT_ID/export/tods-json \
     -o tournament-results.json
   ```
2. Open `tournament-results.json`
3. **Expected Result:**
   - Valid JSON structure
   - Follows TODS schema
   - Includes tournament, participants, matches, results

#### Step 3: Test PDF Export
1. Call API:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/tournaments/TOURNAMENT_ID/export/pdf \
     -o tournament-results.pdf
   ```
2. Open `tournament-results.pdf`
3. **Expected Result:**
   - Professional PDF with:
     - Tournament header with logo
     - Participant list with seeds
     - Match results table
     - Standings/rankings
     - Footer with date

#### Step 4: Test Excel Export
1. Call API:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/tournaments/TOURNAMENT_ID/export/excel \
     -o tournament-results.xlsx
   ```
2. Open `tournament-results.xlsx`
3. **Expected Result:**
   - Multiple worksheets:
     - Tournament Info
     - Participants
     - Matches
     - Standings
     - Statistics
   - Formatted with colors, borders, frozen headers

### Known Issues
- **No UI button** - Must use API directly via curl/Postman
- **PDF quality** - May lack logo, proper formatting (per client feedback)
- **Export permissions** - May not enforce admin-only access

### Recommended Improvements
1. ✅ Add "Export" button in tournament detail page
2. ✅ Add format selector dropdown (CSV/JSON/PDF/Excel)
3. ⏳ Improve PDF template with logo, titles, better layout
4. ⏳ Add export options (include stats, include participant details, etc.)
5. ⏳ Add bulk export (all tournaments as ZIP)
6. ⏳ Add export history log (who exported what, when)

---

## 9. Announcement Images and Links

### Feature Description
Announcements can include an optional image and external link for more details.

### Backend Evidence
**Location:** `backend/src/domain/entities/announcement.entity.ts`
**Expected Fields:**
- `imageUrl?: string` - URL to uploaded image
- `linkUrl?: string` - External link (e.g., registration form, sponsor site)
- `linkText?: string` - Display text for link button

### Frontend Evidence
**Location:** Announcement components
**Status:** ⚠️ **PARTIALLY IMPLEMENTED** - Fields may exist but not in UI

### Verification Steps

#### Step 1: Verify Backend Schema
1. Check database schema:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'announcements';
   ```
2. **Expected Result:** Columns `image_url`, `link_url`, `link_text` exist

#### Step 2: Test Image Upload via API
1. Create announcement with image:
   ```bash
   curl -X POST http://localhost:3000/api/announcements \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "New Tournament Announced",
       "summary": "Check out details",
       "content": "Full announcement text...",
       "imageUrl": "https://example.com/image.jpg",
       "linkUrl": "https://example.com/register",
       "linkText": "Register Now",
       "type": "PUBLIC",
       "tournamentId": "TOURNAMENT_ID"
     }'
   ```
2. Retrieve announcement and verify fields saved

#### Step 3: Add UI Support (If Missing)
1. ✅ Update announcement creation form:
   - Add image upload/URL field
   - Add link URL field
   - Add link text field
2. ✅ Update announcement display:
   - Show image at top (if present)
   - Show "Learn More" button (if link present)
3. ✅ Test end-to-end

### Known Issues
- **UI may not include fields** - Check announcement forms
- **Image optimization** - Large images may slow page load
- **Link validation** - No check if URL is valid

### Recommended Improvements
1. ✅ Add image upload field with preview
2. ✅ Compress/optimize uploaded images
3. ⏳ Add link validation (check URL accessibility)
4. ⏳ Add image gallery for announcements
5. ⏳ Support multiple images (carousel)

---

## 10. Administrator Notifications

### Feature Description
Admins receive notifications for important events: new registrations, participant withdrawals, result disputes, match completions.

### Backend Evidence
**Location:** `backend/src/application/services/notification.service.ts`
**Notification Types:**
- `REGISTRATION_SUBMITTED` - New participant registered
- `REGISTRATION_UPDATED` - Participant changed details
- `PARTICIPANT_WITHDRAWN` - Participant withdrew
- `RESULT_DISPUTED` - Result disputed by opponent
- `MATCH_COMPLETED` - Match result confirmed

**Logic:** When event occurs, system:
1. Finds tournament admins (role = TOURNAMENT_ADMIN for that tournament)
2. Creates notification for each admin
3. Dispatches via IN_APP channel

### Frontend Evidence
**Location:** Admin notification preferences
**Expected:** Separate toggles for admin event types

### Verification Steps

#### Step 1: Enable Admin Notifications
1. Log in as **Tournament Admin**
2. Navigate to **Notification Preferences**
3. Enable:
   - ✅ New Registration Notifications
   - ✅ Result Dispute Notifications
   - ✅ Match Completion Notifications
4. Save preferences

#### Step 2: Test Registration Notification
1. Log out, register as new participant in admin's tournament
2. Submit registration
3. Log back in as admin
4. Navigate to **Notifications**
5. **Expected Result:**
   - Notification: "New registration from [Player Name]"
   - Click to view registration details

#### Step 3: Test Dispute Notification
1. Have two participants: one submits result, other disputes it
2. Admin should receive notification
3. **Expected Result:**
   - Notification: "Result disputed: [Match] between [Player A] vs [Player B]"
   - Click to review dispute and resolve

#### Step 4: Test Match Completion Notification
1. Have a match result confirmed
2. **Expected Result:**
   - Notification: "Match completed: [Player A] def. [Player B] 6-4, 6-3"
   - (Depends on preference - may be too noisy for large tournaments)

### Known Issues
- **May be too many notifications** - In large tournament, hundreds of matches
- **No batching** - Each event = separate notification (should group similar events)
- **No digest mode** - Can't choose "daily summary" instead of real-time

### Recommended Improvements
1. ⏳ Add notification batching (e.g., "5 new registrations today")
2. ⏳ Add digest mode (daily/weekly summary email)
3. ⏳ Add notification priority levels (critical vs informational)
4. ⏳ Add "Mute Tournament" option (disable notifications for specific tournament)
5. ⏳ Add smart filtering (only notify for disputed results, not all completions)

---

## Summary Checklist

Use this checklist when verifying features with client:

### Notifications
- [ ] IN_APP notifications work end-to-end
- [ ] Admin notifications trigger correctly
- [ ] Notification badge shows unread count
- [ ] Real-time delivery via WebSocket functional

### Tournament Features
- [ ] Multiple phases (qualifying, main, consolation) can be created
- [ ] Phase linking works via API
- [ ] Qualifier advancement functional
- [ ] Lucky loser promotion works
- [ ] UI improvements documented in roadmap

### Match Features
- [ ] Match formats exist in backend
- [ ] UI to select format added (or roadmap documented)
- [ ] All 12 match states functional
- [ ] Status transitions validated
- [ ] Winner selection required for RET/WO/DEF
- [ ] BYE vs TBD distinction clear

### Participant Features
- [ ] Result entry workflow complete
- [ ] Opponent confirmation works
- [ ] Dispute resolution functional
- [ ] Profile viewing works with privacy enforcement
- [ ] H2H statistics display correctly

### Export & Stats
- [ ] ITF CSV export works
- [ ] TODS JSON export works
- [ ] PDF export works (quality issues documented)
- [ ] Excel export works
- [ ] Export buttons added to UI

### Announcements
- [ ] Image upload field added
- [ ] Link fields added
- [ ] Display updated to show images/links

---

**Document Status:** Complete  
**Last Verified:** April 22, 2026  
**Next Review:** After implementing UI improvements from roadmap
