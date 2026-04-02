## 🎾 Tennis Tournament Manager - Manual Testing Checklist

---

### **A. AUTHENTICATION & USER MANAGEMENT** 🔐

#### Login & Registration Flow
- [X] **Login with valid credentials** - should navigate to home/tournaments page
- [x] **Login with invalid credentials** - should show error **WITHOUT page reload** (email retained, password cleared)
- [X] **Register new account** - fill all required fields, accept GDPR consent
- [X] **Logout** - should clear token and redirect to login

#### System Admin - User Management
- [X] **Navigate to User Management** page (System Admin only)
- [x] **View user list** with statistics (total users, active, inactive, by role)
- [x] **Create new user** - fill username, email, firstName, lastName, password, role
- [x] **Edit user** - change name, email, phone, role, active status
- [x] **Delete user** - confirm deletion, verify user disappears from list
- [x] **Filter users** by role (SYSTEM_ADMIN, TOURNAMENT_ADMIN, REFEREE, PLAYER, SPECTATOR)
- [X] **Search users** by name or email

---

### **B. TOURNAMENT MANAGEMENT** 🏆

#### Create Tournament (Tournament Admin/System Admin)
- [X] **Navigate to "Create Tournament"** page
- [x] **Fill basic info**: name, start date, end date, registration deadline
- [x] **Select category**: gender (Open/Men's/Women's/Mixed), age (Junior/Open/Veterans), level
- [X] **Configure details**: surface (Clay/Hard/Grass), facility (Indoor/Outdoor), max quota
- [X] **Add courts**: number, names, schedules (opening/closing times)
- [X] **Select tournament type**: Singles or Doubles
- [X] **Add regulations** (optional free text)
- [X] **Save tournament** - should appear in tournaments list

#### View Tournaments (All Users)
- [X] **View all tournaments** - list showing active, registration, and finished
- [X] **Filter tournaments** by status (Registration/Active/Finished)
- [X] **View tournament details** - click on tournament card
- [X] **Public can view** tournaments without login

---

### **C. PARTICIPANT REGISTRATION** 👥

#### Register for Tournament (Registered Participant)
- [x] **View available tournaments** (registration open)
- [x] **Click "Register"** on a tournament
- [X] **Fill registration form**: name, ID/NIE, category, ranking, contact
- [X] **Submit registration** - should show confirmation
- [X] **Check registration quota** - if full, should be assigned ALT (Alternate) status

#### Manage Registrations (Tournament Admin)
- [X] **View all registrations** for a tournament
- [X] **Manually add participant** - admin can enroll anyone
- [X] **Assign entry states** - DA, WC, OA, SE, JE, QU, LL, ALT, WD
- [X] **Check quota status** - see how many DA, WC, ALT spots remain

#### Withdraw from Tournament (Participant)
- [X] **Navigate to "My Registrations"**
- [X] **Click "Withdraw"** button
- [X] **Confirm withdrawal** - status changes to WD

---

### **D. BRACKET/DRAW GENERATION** 🎯

#### Generate Bracket (Tournament Admin)
- [x] **Navigate to tournament** → "Brackets" tab
- [x] **Click "Generate Bracket"**
- [x] **Select bracket type**:
  - [x] **Round Robin** - specify number of groups, qualifiers advancing
  - [x] **Single Elimination** - automatic power-of-2 sizing with Byes
  - [x] **Match Play** - open format
- [x] **Apply seeding** - seeds placed in strategic positions ✅ (Tested & Working)
- [x] **Preview bracket** before finalization
- [x] **Finalize bracket** - matches generated

#### View Bracket (All Users)
- [x] **View bracket visual** - tree structure for elimination, groups for round robin ✅
- [x] **See participant names** in each position ✅
- [x] **View match schedule** for each match
- [x] **See seeds** (marked with "Seed #1", etc.) ✅ (Displayed in matches & participant table)
- [x] **Public users can view** brackets without login

#### Modify Bracket (Tournament Admin)
- [x] **Manual seed override** - change seed positions
- [x] **Regenerate bracket** - option to recreate (warns about losing results)
- [?] **Migrate results** - if regenerating, option to preserve completed matches ⚠️ (discarded due to complexity)

---

### **E. MATCH MANAGEMENT** 🎾

#### Enter Result (Participant)
- [x] **Navigate to "My Matches"** ✅ IMPLEMENTED - `/my-matches` route with MyMatchesComponent
- [x] **Click "Enter Result"** on SCHEDULED match ✅ Modal opens from match card
- [x] **Enter score**: sets, games (e.g., 6-4, 6-3) ✅ Set-by-set form with validation
- [x] **Select match state**: CO (Completed), RET (Retired) ✅ Dropdown with statuses
- [x] **Submit result** - status becomes "Pending Confirmation" ✅ Creates MatchResult entity with PENDING_CONFIRMATION
> **Backend**: `POST /api/matches/:id/result` (MatchController.submitResultAsParticipant) ✅ WORKING  
> **Frontend**: MyMatchesComponent with tabbed interface and result entry modal ✅ WORKING  
> **Note**: Opponent confirmation/dispute workflow is NOT yet implemented (next feature)

#### Confirm Result (Opponent)
- [ ] **Receive notification** about pending result ⚠️ BACKEND IN PROGRESS - UI pending
- [x] **Navigate to pending match** ✅ IMPLEMENTED - Pending Confirmation section in /my-matches
- [x] **Review entered result** ✅ IMPLEMENTED - Shows submitted scores and winner
- [x] **Click "Confirm"** - result becomes official ✅ IMPLEMENTED - Backend + Frontend complete
- [x] **Standings update automatically** ✅ Match status changes to COMPLETED, winner sets
> **Backend**: `POST /api/matches/:id/result/confirm` (MatchController.confirmResult)  
> **Frontend**: MyMatchesComponent with pending confirmation section and confirm button  
> **Note**: Notification backend service being implemented (v1.61.0)

#### Dispute Result (Participant)
- [x] **Click "Dispute"** instead of confirm ✅ IMPLEMENTED - Dispute button in pending section
- [x] **Add reason** for dispute ✅ IMPLEMENTED - Textarea modal for dispute reason
- [x] **Submit dispute** - admin receives notification ✅ BACKEND IN PROGRESS - Notification wiring
- [x] **Admin reviews** - can validate, modify, or cancel match ✅ FULLY IMPLEMENTED
> **Admin UI**: `/admin/disputed-matches` - DisputedMatchesComponent with resolution form

> **Backend**: `POST /api/matches/:id/result/dispute` (MatchController.disputeResult)  
> **Backend**: `GET /admin/matches/disputed`, `PUT /admin/matches/:id/result/resolve`  
> **Frontend**: MyMatchesComponent with dispute modal + DisputedMatchesComponent (admin panel)  
> **Note**: Full admin review UI exists with score editing, winner selection, and resolution notes

#### Enter Result as Admin (Tournament Admin)
- [x] **Navigate to any match** ✅ IMPLEMENTED
- [x] **Click "Enter Result as Admin"** ✅ "Record Result" button in match-detail page
- [x] **Enter score** - **no confirmation needed**, immediately official ✅ Works
- [x] **Select special states**: WO (Walkover), DEF (Default), ABN (Abandoned), CAN (Cancelled) ✅ All MatchStatus enums available
- [x] **Verify standings update** immediately ✅ Winner advancement works for all result completion methods (v1.62.0)
> **Backend**: `POST /api/matches/:id/score` (MatchController.submitScore)  
> **Frontend**: match-detail.component with scoring modal
> **Note**: Winner advancement now works in confirmResult(), resolveDispute(), and update() methods

#### Suspend/Resume Match
- [x] **Admin clicks "Suspend Match"** - state becomes SUS ✅ IMPLEMENTED
- [x] **Save current score** (e.g., 6-4, 3-2) ✅ Preserved in match.score field
- [x] **Add suspension reason** (weather, light, time) ✅ Required textarea in modal
- [x] **Resume match** - continues from saved score ✅ Status changes back to IN_PROGRESS
- [x] **Complete match** - final result updates standings ✅ Can complete after resumption
> **Backend**: `POST /api/matches/:id/suspend`, `POST /api/matches/:id/resume` (MatchController)  
> **Frontend**: Match detail page with suspend/resume buttons and modals  
> **Note**: Full workflow implemented (v1.59.0) - admin-only, validates status transitions

---

### **F. ORDER OF PLAY** 📅

#### Generate Order of Play (Tournament Admin)
- [x] **Navigate to "Order of Play"** tab ✅ OrderOfPlayAdminComponent implemented
- [x] **Click "Generate Schedule"** ✅ Generate button with configurable options
- [x] **System assigns** matches to courts with times ✅ ScheduleGenerationService with automatic assignment
- [x] **Review proposed schedule** ✅ Table view shows all scheduled matches
- [x] **Adjust manually** - drag matches to different courts/times ✅ Reschedule modal for manual adjustments
- [x] **Publish order of play** - participants receive notifications ✅ Publish endpoint with notification integration (v1.63.0)
> **Backend**: `POST /api/order-of-play/generate`, `PUT /api/order-of-play/:id/reschedule`, `POST /api/order-of-play/:id/publish`  
> **Frontend**: OrderOfPlayAdminComponent with generation form, schedule table, reschedule modal  
> **Note**: Automatic scheduling with conflict detection, WebSocket real-time updates, participant notifications

#### View Order of Play (All Users)
- [x] **Navigate to "Order of Play"** ✅ OrderOfPlayViewComponent with calendar layout
- [x] **View matches by court** and time ✅ Grouped by court with sorted times
- [x] **Filter by date** ✅ Date picker to change viewing date
- [x] **See own matches highlighted** (if participant) ✅ User matches highlighted in view
- [x] **Public users can view** order of play ✅ No authentication required for viewing
> **Backend**: `GET /api/order-of-play?tournamentId=xxx&date=yyyy-mm-dd`  
> **Frontend**: OrderOfPlayViewComponent with filters and user match highlighting

#### Update Order of Play (Tournament Admin)
- [x] **Reschedule match** - change court or time ✅ Reschedule API with conflict validation
- [x] **System checks conflicts** (overlapping assignments) ✅ isTimeSlotAvailable() validates before saving
- [x] **Publish update** - affected participants notified ✅ Notification sent on reschedule
- [x] **Real-time updates** - changes visible in <5 seconds ✅ WebSocket emitOrderOfPlayChange() broadcasts updates
> **Backend**: Conflict detection in ScheduleGenerationService, WebSocket integration  
> **Note**: Full implementation complete (v1.63.0) - ready for end-to-end testing

---

### **G. STANDINGS & CLASSIFICATIONS** 📊

#### View Standings (All Users)
- [ ] **Navigate to tournament** → "Standings" tab
- [ ] **View Round Robin groups** - sorted by points/ratios
- [ ] **View elimination bracket progress** - winners advancing
- [ ] **See tiebreaker details** - when players are tied
- [ ] **Points system display** - show how points are calculated
- [ ] **Ratio system display** - match W/L, set W/L, game W/L

#### Tiebreaker Resolution
- [ ] **Create tie scenario** - two players with same points
- [ ] **Check criteria applied** in order:
  1. Set ratio
  2. Game ratio
  3. Set/game difference
  4. Head-to-head result
  5. Draw ranking
  6. Random
- [ ] **Verify correct ranking** after tiebreak

---

### **H. STATISTICS** 📈

#### Personal Statistics (Participant)
- [ ] **Navigate to "My Profile"** → "Statistics"
- [ ] **View matches played** - total, won, lost
- [ ] **View sets statistics** - won/lost, percentage
- [ ] **View games statistics**
- [ ] **View win streaks** - current and best
- [ ] **View matchup history** - record against specific opponents

#### Tournament Statistics (All Users)
- [ ] **Navigate to tournament** → "Statistics" tab
- [ ] **View total participants**
- [ ] **View total matches** (played/pending)
- [ ] **View result distribution** - CO, RET, WO counts
- [ ] **View most active participants**
- [ ] **Export statistics** to PDF or Excel (admin only)

---

### **I. ANNOUNCEMENTS** 📢

#### Create Announcement (Tournament Admin)
- [ ] **Navigate to "Announcements"** → "Create"
- [ ] **Fill title and content**
- [ ] **Select type**: Public or Private (registered only)
- [ ] **Add tags** - draw, order of play, results, general
- [ ] **Set publication date** (schedule for future)
- [ ] **Set expiration date** (optional)
- [ ] **Add link to tournament** (optional)
- [ ] **Publish announcement** - participants notified

#### View Announcements (All Users)
- [ ] **Navigate to "Announcements"**
- [ ] **View public announcements** (all users)
- [ ] **View private announcements** (registered users only)
- [ ] **Filter by tag** - see only specific types
- [ ] **Search announcements** by title/content

#### Edit/Delete Announcement (Tournament Admin)
- [ ] **Click "Edit"** on own announcement
- [ ] **Modify content** and save
- [ ] **Click "Delete"** - confirm deletion

---

### **J. NOTIFICATIONS** 🔔

#### View Notifications (Registered User)
- [ ] **Check notification bell** - shows unread count
- [ ] **Click notification icon**
- [ ] **View notification list** - sorted by date
- [ ] **Mark as read** - click notification
- [ ] **Navigate to related content** - click takes you to match/tournament

#### Configure Notification Preferences (Registered User)
- [ ] **Navigate to "Settings"** → "Notifications"
- [ ] **Enable/disable channels**: In-app, Email, Telegram, Web Push
- [ ] **Select event types**:
  - [ ] Match schedule
  - [ ] Result entered
  - [ ] Order of play change
  - [ ] New announcement
  - [ ] Registration confirmation
- [ ] **Save preferences** - future notifications follow settings

#### Notification Triggers (Test These Events)
- [ ] **Registration accepted** → notification sent
- [ ] **Match scheduled** → notification sent
- [ ] **Result entered by opponent** → notification sent
- [ ] **Order of play changed** → notification sent
- [ ] **New announcement published** → notification sent

---

### **K. PRIVACY SETTINGS** 🔒

#### Configure Privacy (Registered User)
- [ ] **Navigate to "Profile"** → "Privacy"
- [ ] **Set visibility levels** for:
  - [ ] Contact data (email, phone) - Only admins / Same tournament / Registered / Public
  - [ ] Avatar image
  - [ ] Age/category
  - [ ] Ranking
  - [ ] Match history
- [ ] **Save privacy settings**

#### Test Privacy Enforcement
- [ ] **Login as public user** - view player profile (should respect privacy)
- [ ] **Login as different participant** - view profile (limited by settings)
- [ ] **Login as tournament admin** - view profile (full access to tournament data)
- [ ] **Login as system admin** - view profile (full access)

---

### **L. EXPORT & DOCUMENTS** 📄

#### Export Results (Tournament Admin)
- [ ] **Navigate to tournament** → "Export"
- [ ] **Export ITF CSV** - download and verify format
- [ ] **Export TODS JSON** - download and verify structure
- [ ] **Export results to PDF** - formatted report
- [ ] **Export results to Excel** - spreadsheet

#### Export Bracket
- [ ] **Navigate to bracket view**
- [ ] **Click "Export Bracket"**
- [ ] **Download as PDF** - printable format
- [ ] **Print bracket** - verify layout

---

### **M. PHASE LINKING** 🔗

#### Multi-Phase Tournaments (Tournament Admin)
- [ ] **Create qualifying phase** tournament
- [ ] **Complete qualifying matches**
- [ ] **Create main draw**
- [ ] **Link phases** - main draw ← qualifying
- [ ] **Auto-promote qualifiers** - top n finishers move to main
- [ ] **Create consolation draw**
- [ ] **Link consolation** - main draw losers in specific rounds

---

### **N. RESPONSIVE & PWA** 📱

#### Test Responsive Design
- [ ] **Desktop view** (1920px+) - full layout
- [ ] **Tablet view** (768-1024px) - adaptive layout
- [ ] **Mobile view** (320-767px) - mobile-optimized
- [ ] **Rotate device** - landscape/portrait both work

#### PWA Features
- [ ] **Install app** - "Add to Home Screen" prompt
- [ ] **Launch as standalone app** - opens without browser chrome
- [ ] **Offline mode** - view previously loaded data without connection
- [ ] **Service worker caching** - fast page loads on repeat visits

---

### **O. PERFORMANCE & REAL-TIME** ⚡

#### Real-Time Synchronization
- [ ] **Open same page on 2 devices** (different users)
- [ ] **Enter result on device 1**
- [ ] **Check device 2** - updates in <5 seconds
- [ ] **Update order of play** - all users see change immediately

#### Performance
- [ ] **Page load time** - main pages load in <2 seconds
- [ ] **Image optimization** - avatars/logos load quickly
- [ ] **Caching** - repeat visits faster
- [ ] **Large tournament** (100+ participants) - still performant

---

### **P. EDGE CASES & ERROR HANDLING** ⚠️

#### Test Error Scenarios
- [ ] **Create tournament with past dates** - should show validation error
- [ ] **Register after deadline** - should be blocked
- [ ] **Enter invalid score** (e.g., "6-7" without tiebreak) - show error
- [ ] **Generate bracket with 0 participants** - show error
- [ ] **Delete used entity** (e.g., delete participant in active tournament) - handle gracefully
- [ ] **Network error during save** - show error message, allow retry
- [ ] **Unauthorized access** - redirect to login with 401
- [ ] **Forbidden action** - show "Permission denied" for role mismatches

---

## 🎯 **Priority Testing Sequence**

**Start Here (Critical Path):**
1. Login/Registration ✅ (completed)
2. Create Tournament
3. Register Participants
4. Generate Bracket
5. Enter Results
6. View Standings

**Then Test:**
7. Order of Play
8. Announcements
9. Notifications
10. Statistics

**Finally Test:**
11. Privacy Settings
12. Export Functions
13. Phase Linking
14. PWA/Responsive
15. Edge Cases

---

## 📝 **How to Use This Checklist**

1. **Open the app** in browser
2. **Work through each section** systematically
3. **Check boxes** as you verify each feature
4. **Note any bugs** you find with:
   - What you did (steps to reproduce)
   - What you expected
   - What actually happened
5. **Test with different roles** - System Admin, Tournament Admin, Participant, Public
6. **Test on different devices** - Desktop, tablet, mobile

---

**Current Status**: Based on implementation docs, most features are built. Focus testing on:
- ✅ User creation/management (just fixed)
- ✅ Login flow (just fixed - no reload on error)
- Tournament CRUD operations
- Bracket generation (all 3 types)
- Match result entry and confirmation
- Real-time updates

Start with the **Priority Testing Sequence** above! 🚀