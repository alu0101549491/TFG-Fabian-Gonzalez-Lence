# Manual Testing Guide — Tennis Tournament Manager

This document provides step-by-step instructions for manually testing implemented features.

---

## Phase 2: Navigation Improvements (April 22, 2026)

### Feature 5: My Matches Navigation Link

**What was changed:** Added "My Matches" link to main header navigation (positioned on the left after logo), visible only to participants (players/coaches).

**How to test:**
1. **Log in as a participant** (PLAYER or COACH role)
2. Look at the **header navigation bar** (left side, immediately after "Tennis TM" logo)
3. **Verify:** You should see links in this order: **🏆 Tournaments | 🎾 My Matches | 📊 Statistics**
4. Click the "My Matches" link
5. **Verify:** You are taken to the My Matches page showing your scheduled/completed matches
6. **Log out and log in as an admin** (SYSTEM_ADMIN or TOURNAMENT_ADMIN)
7. **Verify:** The "My Matches" link is **NOT visible** (only see: 🏆 Tournaments | 📊 Statistics)

**Expected Result:**
- My Matches link visible for PLAYER/COACH roles only
- Link positioned on the left (not centered)
- Link navigates to `/my-matches` route
- Link highlights when active (current page)

---

### Feature 6: Statistics Navigation Link

**What was changed:** Added "Statistics" link to main header navigation (left side) for all authenticated users.

**How to test:**
1. **Log in with any user role** (player, coach, or admin)
2. Look at the **header navigation bar** (left side, after logo)
3. **Verify:** You should see a link labeled **"📊 Statistics"**
4. Click the link
5. **Verify:** You are taken to the Statistics page
6. **Verify:** Statistics page loads with rankings and data visualizations

**Expected Result:**
- Statistics link visible to all logged-in users
- Link positioned on the left side
- Link navigates to `/statistics` route
- Link highlights when active

---

### Feature 7: Tournaments Navigation Link

**What was changed:** Added "Tournaments" link to main header navigation (left side) for easy access to tournament list.

**How to test:**
1. **Log in with any user** 
2. Look at the **header navigation bar** (left side, after logo)
3. **Verify:** You should see a link labeled **"🏆 Tournaments"** as the first navigation item
4. Click the link
5. **Verify:** You are taken to the Tournaments list page

**Expected Result:**
- Tournaments link visible to all logged-in users
- Link positioned on the left side, first in navigation
- Link navigates to `/tournaments` route
- Link highlights when active

---

### Feature 8: Navigation Layout Improvement

**What was changed:** Repositioned navigation links from center to left side (next to logo) for better UX and standard web layout.

**How to test:**
1. **Log in with any user**
2. **Observe the header layout:**
   - **Left side:** Tennis TM logo → Navigation links (Tournaments, My Matches*, Statistics)
   - **Right side:** Notification bell → User avatar/name
3. **Verify:** Navigation links are NOT centered
4. **Verify:** Clear visual grouping between logo+nav (left) and user actions (right)

**Expected Result:**
- Navigation links positioned immediately after logo on the left
- User actions (notification bell, user menu) remain on the right
- Clean, conventional web layout pattern

---

### Feature 8: Export Button (Already Implemented)

**What was verified:** Export functionality already exists in tournament detail view with dropdown menu.

**How to test:**
1. **Log in as tournament admin/organizer**
2. Navigate to **Tournaments** → Select any tournament
3. Scroll down to the **"Quick Actions"** section
4. **Verify:** You should see an **"📄 Export"** tile button
5. Click the Export button
6. **Verify:** Dropdown menu appears with 4 export options:
   - 📋 ITF CSV
   - 🔄 TODS JSON
   - 📑 PDF Report
   - 📊 Excel Spreadsheet
7. Click any export option
8. **Verify:** File downloads in the selected format

**Expected Result:**
- Export button visible to tournament administrators
- Dropdown shows all 4 format options
- Each export option triggers file download

---

### Feature 9: Notification Badge (Already Implemented)

**What was verified:** Notification bell already shows unread badge with count for pending confirmations.

**How to test:**
1. **User A:** Log in as a player and submit a match result
2. **User B (opponent):** Log in as the opponent
3. Click the **notification bell icon** in the header (top right)
4. **Verify:** Badge shows count of unread notifications (e.g., red circle with number)
5. **Verify:** Badge has pulsing animation for visibility
6. Open notifications dropdown
7. **Verify:** You see a "RESULT_ENTERED" notification for the pending confirmation
8. Mark notification as read or confirm the result
9. **Verify:** Badge count decreases or disappears

**Expected Result:**
- Badge appears automatically when unread notifications exist
- Badge shows accurate count
- Real-time updates via WebSocket
- Pulsing animation draws attention

---

### Feature 10: View Profile Links + Public Participant List

**What was changed:** 
- Added clickable profile links (👤 icon) to all participant names across the app
- Added public participant list for non-admin users to view accepted players
- Profile links route to `/users/:id` for public profile viewing with privacy enforcement

**How to test (Tournament Detail - Admin View):**
1. **Log in as tournament admin/organizer**
2. Navigate to **Tournaments** → Select any tournament with registered players
3. Scroll down to the **"👥 Registered Participants"** section
4. **Verify:** You see the full admin table with action buttons (Approve, Reject, etc.)
5. Find any **singles participant** name
6. **Verify:** Name has 👤 icon and is clickable/styled as a link
7. Click the participant name
8. **Verify:** You are taken to the user's profile page (`/users/:id`)
9. **Go back** to tournament detail
10. Find a **doubles pair** (if tournament has doubles)
11. **Verify:** Each partner name has individual 👤 icon and is clickable
12. Click each partner name separately
13. **Verify:** Each link opens the respective partner's profile

**How to test (Tournament Detail - Public/Player View):**
1. **Log out or log in as a regular player (non-admin)**
2. Navigate to **Tournaments** → Select the same tournament
3. Scroll down to find the participant list
4. **Verify:** You see a **simpler participant list** labeled **"👥 Registered Players (X)"**
5. **Verify:** This list shows ONLY accepted players (no pending/rejected)
6. **Verify:** No action buttons (Approve, Reject, etc.) are visible
7. **Verify:** Table shows: Player names with 👤 icons, Category, and Seed (if seeded)
8. Click any participant name
9. **Verify:** You are taken to the user's profile page
10. **Verify:** Profile respects privacy settings (may hide some fields)
11. **Test as unauthenticated user:** Log out completely
12. Navigate to the tournament as a guest (not logged in)
13. **Verify:** Public participant list is still visible
14. Click any participant name
15. **Verify:** Profile opens with public information only

**How to test (Bracket Visualization):**
1. Navigate to any tournament with a published bracket
2. Click **"View Bracket"** or **"🏆 Bracket"** tile
3. **Verify:** Bracket displays with matches organized by rounds
4. Find any **singles match** participant name
5. **Verify:** Participant name is styled as a link (colored, underlined on hover)
6. Hover over the name
7. **Verify:** Tooltip shows "View profile"
8. Click the participant name
9. **Verify:** Profile page opens
10. **Go back** to bracket
11. Find a **doubles match** (if applicable)
12. **Verify:** Team shown as "Player 1 / Player 2" with each name separately linked
13. Click each partner name
14. **Verify:** Each opens the respective profile
15. **Test all bracket types:** Single Elimination, Round Robin, Match Play, Consolation
16. **Verify:** Profile links work in all bracket formats

**How to test (My Matches Page):**
1. **Log in as a player**
2. Navigate to **"My Matches"** page
3. Find any match in the list
4. **Verify:** Both participant names (you and opponent) have 👤 icons
5. Click your opponent's name
6. **Verify:** Opponent's profile opens
7. **Go back** to My Matches
8. Click your own name
9. **Verify:** Your profile opens (should redirect to `/profile` or show full profile)

**How to test (Privacy Enforcement):**
1. View a profile as an **unauthenticated user**
2. **Verify:** Only public fields visible (name, role, maybe ranking)
3. Log in as a **regular player** (not admin)
4. View another player's profile
5. **Verify:** More fields visible based on privacy settings (e.g., email, phone if allowed)
6. Log in as a **tournament admin**
7. View any participant's profile
8. **Verify:** All available data visible (admin override)

**Expected Result:**
- All participant names clickable across the app
- 👤 icon indicates profile link
- Public participant list visible to everyone
- Admin list and public list show appropriate content
- Profile links work in: Tournament detail, Brackets (all types), My Matches
- Privacy settings enforced per user role
- Doubles pairs: each partner individually linked
- BYE entries: not clickable (no profile)
- Routes to `/users/:id` for other users, `/profile` for self

---

## Phase 1: Quick Fixes (April 22, 2026)

### Feature 1: Ball Provider Clarification

**What was changed:** Added clarification text below ball provider field to indicate it applies to the specific match, not the entire tournament.

**How to test:**
1. Navigate to the application and log in as a tournament organizer
2. Go to **Tournaments** → Select any tournament → **Matches** tab
3. Click on any match to open the **Match Detail** page
4. Scroll down to the **"Ball Provider"** dropdown field
5. **Verify:** You should see the text "Select who provides balls for THIS match" displayed below the dropdown
6. **Expected Result:** The clarification text is visible and makes it clear the selection applies only to this match

---

### Feature 2: Match Status Tooltips

**What was changed:** Added tooltips and help text to explain each match status code (TBP, IP, CO, RET, WO, etc.). Also added a hint in the label itself.

**How to test:**
1. Navigate to the application and log in as a tournament organizer
2. Go to **Tournaments** → Select any tournament → **Matches** tab
3. Click on any match to open the **Match Detail** page
4. Find the **"Status"** field
5. **Verify:** The label reads **"Status (hover over options to learn more)"**
6. Open the status dropdown
7. **Hover over each status option** in the dropdown
8. **Verify:** Each status shows a tooltip explaining what it means (e.g., "NOT_SCHEDULED: Match created but awaiting schedule details")
9. Look below the dropdown for additional help text explaining status meanings
10. **Expected Result:** 
    - Label includes hint text in parentheses
    - All 13 statuses have clear explanations visible on hover
    - Help text below dropdown reinforces the hover instruction

**Status codes to test:**
- NOT_SCHEDULED (awaiting schedule details)
- SCHEDULED (fully scheduled, ready to play - TBP)
- IN_PROGRESS (currently being played - IP)
- COMPLETED (finished with result - CO)
- RETIRED (player retired - RET)
- WALKOVER (opponent didn't show - WO)
- CANCELLED (match cancelled)
- POSTPONED (rescheduled to later)
- ABANDONED (stopped due to external reasons)
- DEFAULTED (player disqualified - DEF)
- NO_SHOW (player didn't appear - NS)
- BYE (automatic advancement)
- TO_BE_DETERMINED (awaiting previous results)

---

### Feature 3: Color Preview Live Updates

**What was changed:** Color preview now updates in real-time as you change primary/secondary colors in tournament forms.

**How to test (Tournament Creation):**
1. Navigate to the application and log in as a tournament organizer
2. Go to **Tournaments** → Click **"Create Tournament"** button
3. Fill in the required fields (name, dates, location, etc.)
4. Scroll down to the **"Visual Branding"** section
5. **Change the Primary Colour** using the color picker OR by typing a hex code (e.g., #ff0000 for red)
6. **Verify:** The color preview gradient at the bottom updates immediately
7. **Change the Secondary Colour** using the color picker OR hex input (e.g., #00ff00 for green)
8. **Verify:** The color preview gradient updates immediately to show the new color combination
9. **Expected Result:** Preview updates instantly without needing to click elsewhere or submit the form

**How to test (Tournament Edit):**
1. Go to **Tournaments** → Select any existing tournament
2. Click **"Edit"** button (✏️ icon)
3. Scroll to the **"Visual Branding"** section
4. Repeat steps 5-9 from the creation test above
5. **Expected Result:** Same immediate preview updates

---

### Feature 4: Player Comments Field (FR32)

**What was changed:** Added optional comments field (max 500 characters) to result submission form.

**How to test:**
1. Navigate to the application and log in as a tournament participant (player)
2. Go to **"My Matches"** page
3. Find a match with status **SCHEDULED** or **IN_PROGRESS**
4. Click **"Enter Result"** button
5. Fill in the winner and set scores (e.g., 6-4, 6-2)
6. **Scroll down** below the set scores and tennis scoring help section
7. **Verify:** You should see a **"Comments (Optional)"** textarea field
8. Type some text in the comments field (e.g., "Heavy rain in the second set, court was slippery")
9. **Verify:** The character counter shows max 500 characters
10. **Verify:** The help text below explains comments are visible to administrators
11. Submit the result
12. **Expected Result:** 
    - Comments field is visible and accepts up to 500 characters
    - Placeholder text provides examples (weather conditions, court issues, etc.)
    - Help text is clear about visibility
    - Result submits successfully with comments included

---

## Testing Environment Setup

**Prerequisites:**
- Node.js and npm installed
- Backend server running (port 3000)
- Frontend development server running (port 5173)
- At least one tournament created with matches scheduled
- Test user accounts: 1 organizer + 2 participants

**Start the application:**
```bash
# Terminal 1 - Backend
cd projects/5-TennisTournamentManager/backend
npm run dev

# Terminal 2 - Frontend
cd projects/5-TennisTournamentManager
npm run dev
```

**Access the application:**
- Open browser: `http://localhost:5173`
- Log in with test credentials

---

## Phase 3: Data Visualization Improvements (April 22, 2026)

### Feature 11: Enhanced Participant List with Status Filtering

**What was changed:** Added status filter dropdown, acceptance type badges, and colored status indicators to tournament participant list.

**How to test:**
1. **Log in as a tournament organizer**
2. Navigate to **Tournaments** → Select any tournament with participants → **Tournament Detail Page**
3. Scroll to the **"👥 Registered Participants"** section (admin view)
4. **Verify the filter dropdown:**
   - You should see a dropdown labeled **"Filter:"** next to the participant count
   - The dropdown should show options: **All Status**, **Pending**, **Accepted**, **Rejected**, **Withdrawn**
   - Each option should show a count in parentheses (e.g., "Accepted (5)")
5. **Test filtering:**
   - Select **"Pending"** from the dropdown
   - **Verify:** Only participants with PENDING status are shown
   - The header count should update to show filtered count vs total (e.g., "3 / 10")
   - Select **"Accepted"** from the dropdown
   - **Verify:** Only accepted participants are shown
   - Try each filter option and verify correct filtering
6. **Verify status badges:**
   - Look at the **Status** column
   - **Verify:** Status badges have colored backgrounds:
     - PENDING: Orange (#f59e0b)
     - ACCEPTED: Green (#10b981)
     - REJECTED: Red (#ef4444)
     - WITHDRAWN: Gray (#6b7280)
     - ALTERNATE: Orange with "Alternate" text
     - LUCKY_LOSER: Purple with "Lucky Loser" text
7. **Verify acceptance type badges:**
   - For accepted players, look for small blue badges next to the status
   - **Verify:** You see badges like **[WC]**, **[SE]**, **[Q]**, **[LL]**, etc.
   - Hover over a badge (if tooltip implemented)
   - **Verify:** The badges correctly indicate:
     - WC = Wild Card
     - SE = Special Exemption
     - JE = Junior Exemption
     - LL = Lucky Loser
     - Q = Qualifier
     - ALT = Alternate
     - DA = Direct Acceptance
     - OA = Organizer Acceptance
     - WD = Withdrawn
8. **Test empty state:**
   - Filter by a status with no participants
   - **Verify:** Message shows "No participants match the selected filter."
9. **Test with public view:**
   - Log out or view as a non-admin
   - **Verify:** Public participant list shows only accepted players (no filter needed)

**Expected Result:**
- Filter dropdown works smoothly with reactive updates
- Participant counts accurate for each status
- Status badges clearly colored and readable
- Acceptance type badges visible for applicable players
- Empty state shows when no matches for filter
- Admin and public views display appropriate information

---

### Feature 12: Compare Stats Button in User Profiles

**What was changed:** Added prominent "📊 View Statistics" button in hero section with enhanced styling and smart back navigation flow.

**How to test:**

**Part 1: Button Visibility and Styling**
1. **Log in with any account**
2. Navigate to **Tournaments** → Open any tournament
3. Click on any participant name to open their profile
4. **Verify the hero section button:**
   - Look at the **hero section** (top of page, below the user's name and role)
   - You should see a prominent **blue button** labeled **"📊 View Statistics"**
   - The button should have enhanced blue styling (distinct from the white Edit Profile button)
   - **Verify spacing:** There should be clear visual separation between the hero section and the profile card below
5. **Test own profile:**
   - Navigate to your own profile (`/profile` or `/users/your-id`)
   - **Verify:** The hero section shows **"✏️ Edit My Profile"** instead of the View Statistics button
6. **Test without login:**
   - Log out
   - View a public user profile
   - **Verify:** Button does NOT appear (requires authentication)

**Part 2: Navigation Flow - Profile to Statistics**
1. **Log in and navigate to a tournament**
2. From the tournament participant list, **click any player's name**
3. On their profile page, **click "📊 View Statistics"**
4. **Verify:** You are taken to `/statistics/:userId`
5. **Verify:** The statistics page loads with complete user data
6. **Click the "Back" button** on the statistics page
7. **Verify:** You are returned to the **user's profile page** with a single click

**Part 3: Navigation Flow - Profile Back Button**
1. **Navigate to Tournaments page**
2. **Click any tournament** to view details
3. **Click a participant name** from the registered players list
4. On the profile page, **click the "← Go Back" button** (top left)
5. **Verify:** You return to the **tournament detail page** with a single click
6. **Try from a different entry point:**
   - Navigate to **My Matches**
   - Click an opponent's name
   - On their profile, click **"← Go Back"**
   - **Verify:** You return to the **My Matches page** with a single click

**Part 4: Complex Navigation Flow (Single-Click Navigation)**
1. **Navigate:** Tournament List → Tournament Detail → Player Profile → View Statistics
2. **Click "Back"** on statistics page
3. **Verify:** Single click returns to Player Profile
4. **Click "← Go Back"** on profile page
5. **Verify:** Single click returns to Tournament Detail (NOT multiple clicks needed)
6. **Test complete flow:**
   - Dashboard → Tournaments → Tournament Detail → Player Profile → Statistics
   - Back once → Profile
   - Back once → Tournament Detail
   - Back once → Tournaments
   - Back once → Dashboard
7. **Verify:** Each back button click moves exactly one page back in history

**Expected Result:**
- Prominent blue "View Statistics" button visible in hero section when viewing other users' profiles
- Clear visual separation between button and profile card (2rem spacing)
- Button styled distinctly with enhanced blue color
- **SINGLE-CLICK NAVIGATION:** Each back button press moves exactly one page back
- Natural browser history behavior without custom state management
- No loops, no double-clicking required
- Navigation state preserved correctly using Angular Location service
- Button hidden on own profile and when not authenticated
- All navigation flows work correctly regardless of entry point

---

### Feature 13: Fixed Dashboard Admin Counter Updates

**What was changed:** Replaced hardcoded "0" values in admin dashboard with real-time counters. System admins see 4 stat cards (including Total Users), while tournament admins see only 3 cards (Total Users hidden due to API permissions).

**How to test:**

**Part 1: System Admin Dashboard (4 Cards)**
1. **Log in as a system admin** (SYSTEM_ADMIN role)
2. Navigate to the **Dashboard** (home page after login)
3. **Verify you see 4 statistics cards** at the top:
   - **Disputed Matches:** Count of matches with disputed results
   - **Active Tournaments:** Count of tournaments with status IN_PROGRESS, REGISTRATION_OPEN, REGISTRATION_CLOSED, or DRAW_PENDING
   - **Total Users:** Total number of registered users in the system (ONLY visible to system admins)
   - **Tournaments Managed:** Total number of all tournaments (system admins can manage all)
4. **Verify:** All 4 cards show **numbers ≥ 0** (not hardcoded "0")
5. **Create a new tournament:**
   - Go to Tournaments → Create Tournament
   - Fill in required fields and save
6. **Return to Dashboard**
7. **Verify:** "Active Tournaments" counter has **increased by 1**
8. **Verify:** "Tournaments Managed" counter has **increased by 1**

**Part 2: Tournament Admin Dashboard (3 Cards)**
1. **Log out and log in as a tournament admin** (TOURNAMENT_ADMIN role)
2. Navigate to the **Dashboard**
3. **Verify you see only 3 statistics cards:**
   - **Disputed Matches:** Count of disputed matches
   - **Active Tournaments:** Count of active tournaments  
   - **Tournaments Managed:** Count of tournaments **where you are the organizer**
4. **Important:** Verify the **"Total Users" card is NOT displayed** (hidden due to API permissions)
5. **Create a new tournament** (you will be set as organizer)
6. **Return to Dashboard**
7. **Verify:** "Tournaments Managed" counter has increased by 1

**Part 3: Data Accuracy Test (System Admin)**
1. **Log in as system admin**
2. **Create multiple tournaments** with different statuses:
   - One with status DRAFT
   - One with status REGISTRATION_OPEN
   - One with status COMPLETED
3. **Go to Dashboard**
4. **Verify:** "Active Tournaments" count only includes REGISTRATION_OPEN tournament (not DRAFT or COMPLETED)
5. **Verify:** "Tournaments Managed" includes all 3 tournaments
6. **Verify:** "Total Users" card displays total registered users

**Part 4: Permission & Error Handling**
1. **Log in as tournament admin**
2. **Open browser console (F12 → Console tab)**
3. **Navigate to Dashboard**
4. **Verify:** Dashboard shows exactly 3 stat cards (no Total Users card visible)
5. **Verify:** No 403 Forbidden errors in console (Total Users API not called)
6. **Verify:** No JavaScript errors in console
7. **Log out and log in as system admin**
8. **Navigate to Dashboard**
9. **Verify:** Dashboard shows all 4 stat cards including Total Users
10. **Verify:** API calls to user endpoints succeed (check Network tab if needed)

**Expected Result:**
**Expected Result:**
- **System admins see 4 stat cards:** Disputed Matches, Active Tournaments, Total Users, Tournaments Managed
- **Tournament admins see 3 stat cards:** Disputed Matches, Active Tournaments, Tournaments Managed (Total Users hidden)
- All admin dashboard counters show real, accurate data (no hardcoded "0" values)
- Active Tournaments counts only relevant statuses (IN_PROGRESS, REGISTRATION_OPEN, REGISTRATION_CLOSED, DRAW_PENDING)
- System admins see total user count from all registered users
- Tournament admins see only tournaments they organize (not all tournaments)
- Counters update dynamically when navigating back to dashboard after changes
- No permission errors (403 Forbidden) in console for tournament admins
- Error handling prevents crashes if API calls fail
- Data loads asynchronously without blocking UI
- Clean visual layout with appropriate spacing between cards

---

### Feature 14: Acceptance Type Badges in Bracket Visualization

**What was changed:** Added acceptance type badges (DA, WC, SE, LL, Q, ALT, WD, OA, S) to bracket visualization showing how each player qualified for the tournament.

**How to test:**

**Part 1: Badge Display in Brackets**
1. **Log in as any user**
2. Navigate to **Tournaments** → Select any tournament with an active bracket
3. Click **"View Bracket"** or navigate to the bracket view
4. **Verify the bracket displays:**
   - Participant names with seed numbers (if seeded)
   - **Purple acceptance badges** next to each participant name
   - Badges should show abbreviations like **DA**, **WC**, **SE**, **LL**, etc.
5. **Test all bracket types:**
   - **Single Elimination:** Check Round 1, Quarter-Finals, Semi-Finals, Finals
   - **Round Robin:** Check all group matches
   - **Match Play:** Check open format matches
6. **Verify badge styling:**
   - Badges have purple gradient background (`#8b5cf6` to `#7c3aed`)
   - Rectangular shape with 4px border radius
   - White text, bold font
   - Positioned to the right of seed badges (if seed exists)

**Part 2: Acceptance Type Abbreviations**
1. **Look for different badge types** across multiple participants
2. **Verify badge meanings:**
   - **DA** = Direct Acceptance (most common, standard entry)
   - **WC** = Wild Card (special invitation)
   - **SE** = Special Exemption
   - **JE** = Junior Exemption
   - **LL** = Lucky Loser (lost in qualifying, got into main draw)
   - **Q** = Qualifier (won through qualifying tournament)
   - **ALT** = Alternate (backup player)
   - **WD** = Withdrawn (player withdrew)
   - **OA** = Organizer Acceptance
   - **S** = Seeded entry

**Part 3: Winner Styling**
1. **Find a completed match in the bracket** (status = COMPLETED)
2. **Verify the winner's row:**
   - Winner has a trophy icon (🏆)
   - **Acceptance badge** changes to lighter purple (`#a78bfa` to `#8b5cf6`)
   - Winner's name and seed badge also have golden styling
3. **Compare to the loser's row:**
   - Loser has standard purple acceptance badge
   - No trophy icon

**Part 4: Doubles Matches**
1. **If tournament has doubles:** Navigate to a doubles bracket
2. **Verify doubles teams:**
   - Team shown as "Player 1 / Player 2"
   - **Single acceptance badge** for the team (based on primary player)
   - Badge positioned after team seed number (if applicable)
3. Click individual player names
4. **Verify:** Profile links work for both partners

**Part 5: BYE Entries**
1. **Find matches with BYE entries** (if bracket has odd number of participants)
2. **Verify BYE rows:**
   - Display "BYE" text
   - **NO acceptance badge** (BYE is not a real participant)
   - No seed number
   - Grayed out styling

**Part 6: Console Logging (Development Mode)**
1. **Open browser console** (F12 → Console tab)
2. **Navigate to any bracket view**
3. **Look for logs:**
   - `🔍 Loading registrations for category: xxx`
   - `✅ Loaded N registrations`
   - `📋 Registration: userId → ACCEPTANCE_TYPE`
   - `🎾 Singles - Player Name acceptance: TYPE`
4. **Verify logs show:**
   - Registration loading completes successfully
   - Acceptance types are loaded (not `undefined`)
   - Each participant has a mapped acceptance type

**Part 7: Edge Cases**
1. **Test with tournament that has:**
   - All players with DA (Direct Acceptance) → All show DA badges
   - Mixed acceptance types → Different badges visible
   - No registrations yet → No badges display (only names)
2. **Navigate between different brackets**
3. **Verify:** Badges update correctly for each bracket
4. **Test browser refresh**
5. **Verify:** Badges persist after page reload

**Expected Result:**
- Acceptance type badges visible for all participants in all bracket types
- All 10 acceptance types correctly mapped to abbreviations
- Badges styled with purple gradient, rectangular shape
- Winner's badges have lighter purple color
- Doubles teams show single badge for team
- BYE entries have no badge
- Badges load asynchronously when bracket loads
- Console logs confirm registration data loading
- Badges update when navigating between different brackets
- DA badges show for standard direct acceptance entries (most common case)

---

### Feature 15: Match Format Display in Bracket Visualization

**What was changed:** Added match format badges to bracket visualization showing the rules for each match (Best of 3, Best of 5, etc.). This helps players understand how many sets they need to win and what tiebreak rules apply.

**How to test:**

**Part 1: Basic Format Badge Display**
1. **Log in as any user**
2. Navigate to **Tournaments** → Select any tournament with an active bracket
3. Click **"View Bracket"** or navigate to the bracket view
4. **Verify each match card displays:**
   - Status badge (SCHEDULED, COMPLETED, etc.) on the left
   - **Format badge** on the right showing format like "Best of 3 (Super TB)"
   - Format badge has gray gradient background (distinguishes from status)
5. **Test all bracket types:**
   - **Single Elimination:** Check matches in all rounds
   - **Round Robin:** Check group matches
   - **Match Play:** Check open format matches
6. **Verify format badge styling:**
   - Gray gradient background (`#f3f4f6` to `#e5e7eb`)
   - Border: 1px solid `#d1d5db`
   - Smaller font size than status badge (0.7rem vs 0.75rem)
   - Positioned to the right of status badge with 0.5rem gap

**Part 2: Understanding Match Format Labels**
1. **Look at format badges across multiple matches**
2. **Verify format meanings:**
   - **"Best of 3 (Super TB)"** = First to win 2 sets; if 1-1, play 10-point super tiebreak
   - **"Best of 3"** = First to win 2 sets; if 1-1, play full advantage final set
   - **"Best of 5 (Super TB)"** = First to win 3 sets; if 2-2, play super tiebreak (modern Grand Slams)
   - **"Best of 5"** = First to win 3 sets; if 2-2, play advantage final set (traditional)
   - **"Pro Set"** = First to 8 games (single set), tiebreak at 7-7
   - **"Short Sets"** = Best of 3 short sets (first to 4 games per set)
   - **"Fast4"** = Fast4 format with no-ad scoring
   - **"Super Tiebreak"** = Single 10-point tiebreak only (entire match)

**Part 3: Format vs Final Score Examples**
1. **Find a completed match showing "Best of 3"**
2. **Check the final scores** - they can be:
   - `6-0, 6-0` (2-0 in sets - straight sets victory)
   - `6-4, 6-3` (2-0 in sets - straight sets win)
   - `6-4, 3-6, 6-2` (2-1 in sets - went to 3 sets)
   - `7-6, 6-7, 7-5` (2-1 in sets - three-set thriller)
3. **Understand:** "Best of 3" means match RULES, not the final score
4. **Verify:** A 6-0, 6-0 match correctly shows "Best of 3" (not an error)

**Part 4: Single Elimination Bracket**
1. **Navigate to a single elimination bracket**
2. **Check Early Round matches:**
   - Verify format badge appears next to status
   - Format should be consistent across same-round matches
3. **Check Finals:**
   - Finals might have different format (e.g., Best of 5 for men's finals)
   - Verify format badge reflects the actual match rules
4. **Scroll through all rounds**
5. **Verify:** Format badges visible on ALL match cards (even TBD/BYE matches)

**Part 5: Round Robin Bracket**
1. **Navigate to a round robin tournament**
2. **Check group matches:**
   - Each match card has a header with match number and status
   - **Format badge** appears in the header next to status
   - All group matches typically have same format
3. **Click on individual match cards**
4. **Verify:** Format badge appears consistently on match detail pages

**Part 6: Match Detail Page**
1. **Click any match card** to open match detail page
2. **Verify Match Information section:**
   - Shows: Scheduled Time, Court, Round, Match Number, Ball Provider
   - **Check if format is also shown here** (may be added in Match Information)
3. **Return to bracket view**
4. **Verify:** Format badge remains consistent between bracket and detail views

**Part 7: Default Format for Existing Matches**
1. **Check older matches** (created before April 22, 2026)
2. **Verify:** All show **"Best of 3 (Super TB)"** as default format
3. **This is correct:** Existing matches use default format until manually updated
4. **Understand:** New tournaments can specify custom formats during creation

**Part 8: Format Badge Positioning**
1. **Look at match cards with different statuses:**
   - SCHEDULED matches (blue badge)
   - IN_PROGRESS matches (yellow badge)
   - COMPLETED matches (green badge)
2. **Verify format badge always:**
   - Appears to the RIGHT of status badge
   - Has consistent spacing (0.5rem gap)
   - Aligns horizontally with status badge
   - Uses flexbox layout with gap property

**Part 9: Responsive Design**
1. **Resize browser window** to different widths:
   - Desktop (1920px)
   - Tablet (768px)
   - Mobile (375px)
2. **Verify format badges:**
   - Wrap to new line on small screens if needed
   - Remain readable at all sizes
   - Don't overflow or get cut off
   - Maintain proper spacing from status badge

**Part 10: Console Logging (Development Mode)**
1. **Open browser console** (F12 → Console tab)
2. **Navigate to any bracket view**
3. **Trigger a score update** (if you're a tournament admin)
4. **Look for logs:**
   - `[MatchService] formatMatchScores() called with match: {...}`
   - Match object should show `format` field
5. **Verify:** Format field is populated (not null/undefined)

**Part 11: Edge Cases**
1. **Test with matches that have:**
   - No format set (null) → Should default to "Best of 3"
   - Invalid format enum → Should display raw enum value
   - Format that doesn't match actual score → Still displays format correctly
2. **Navigate between different tournaments**
3. **Verify:** Format badges update correctly for each tournament
4. **Test browser refresh**
5. **Verify:** Format badges persist after page reload

**Part 12: Match Format Selection During Bracket Generation** ✅ IMPLEMENTED (2026-04-23)
1. **Log in as tournament organizer**
2. **Navigate to your tournament** → Click **"Generate Bracket"**
3. **Verify bracket generation form shows:**
   - Category dropdown
   - Bracket type selection (Single Elimination, Round Robin, etc.)
   - **Match Format selection** with 8 radio button options:
     - Best of 3 (Super Tiebreak) - Default
     - Best of 3 (Advantage Final Set)
     - Best of 5 (Super Tiebreak)
     - Best of 5 (Advantage Final Set)
     - Pro Set
     - Short Sets
     - Fast4
     - Super Tiebreak
4. **Select "Pro Set"** and click **"Generate Bracket"**
5. **Verify:**
   - Browser automatically navigates to bracket view
   - **ALL match cards show "Pro Set" badge** (not "Best of 3")
6. **Generate another bracket** with different format (e.g., "Best of 5 (Super TB)")
7. **Verify:** All matches in new bracket show selected format
8. **Check backend console logs:**
   - Should show: `🎾 Match format specified: PRO_SET`
   - Should show: `🎾 Applying match format PRO_SET to X matches`
9. **Test format descriptions:**
   - Each radio option shows descriptive text explaining the format
   - Text helps organizers choose appropriate format for their event
10. **Regenerate bracket:**
    - Generate bracket with "Pro Set"
    - Generate again (replaces previous) with "Short Sets"
    - Verify new bracket shows "Short Sets" for all matches
11. **Test all 8 formats:**
    - Generate brackets with each format option
    - Verify correct format badge appears on all matches
    - Verify format persists after page refresh

**Expected Result:**
- Format badge visible on all match cards in all bracket types
- Badge shows human-readable format label (not enum value)
- Gray gradient styling distinguishes from status badge
- Badge positioned to the right of status badge
- **Organizers can select match format during bracket generation**
- **Selected format applies to ALL matches in the bracket**
- Default "Best of 3 (Super TB)" used if organizer doesn't change selection
- Badge helps players understand match rules before playing
- Format labels accurately describe the match rules (sets to win, tiebreak rules)
- 6-0, 6-0 score correctly shows selected format (e.g., "Pro Set" or "Best of 3")

---

## Reporting Issues

If any feature does not work as described:

1. **Note the exact steps** that led to the issue
2. **Record the expected behavior** vs actual behavior
3. **Check browser console** for errors (F12 → Console tab)
4. **Take a screenshot** if visual issues occur
5. Report to development team with all details above

---

## Next Testing Phases

**Phase 2:** Navigation improvements (back buttons, breadcrumbs)  
**Phase 3:** Visualization enhancements (statistics charts, bracket view)  
**Phase 4:** Advanced features (match formats, global ranking, profile viewing)
