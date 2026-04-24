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

## Phase 4: Form Improvements (April 23, 2026)

### Feature 16: Unified Participant Edit Modal

**What was changed:** 
- Replaced inline seed editing and 6 separate action buttons with single "Edit" button
- Created unified edit modal with all participant fields (seed, status, acceptance type, category)
- All 9 acceptance types now accessible via dropdown (previously only 3)

**Before:**
- Seed numbers: inline editing with separate Edit/Save/Cancel buttons
- Status changes: 6 different action buttons (Approve, Reject, Set as Alternate, Promote, Remove, Delete)
- Only 3 acceptance types accessible: DIRECT_ACCEPTANCE (via Approve), ALTERNATE (via Set as Alternate), LUCKY_LOSER (via Promote)
- No way to change category after registration
- Confusing which button to use

**After:**
- Single "Edit" button opens unified modal
- All fields editable in one place: seed number, status (4 options), acceptance type (9 options), category
- Cleaner table with just "Edit" and "Delete" buttons

**How to test:**

1. **Setup:**
   - Log in as tournament organizer
   - Navigate to a tournament with registered participants
   - Go to "Participants" section in tournament detail

2. **Verify New UI:**
   - Look at participant table
   - **Verify:** No inline seed editing (no Edit button next to seed numbers)
   - **Verify:** Action column shows only "Edit" button (and "Delete" for rejected/withdrawn)
   - **Verify:** No Approve/Reject/Set as Alternate/Promote/Remove buttons

3. **Open Edit Modal:**
   - Click "Edit" button for any participant
   - **Verify:** Modal opens with title "✏️ Edit Participant"
   - **Verify:** Modal shows participant name below title
   - **Verify:** Modal contains 4 fields:
     - Category dropdown (required)
     - Seed Number input (optional, number)
     - Registration Status dropdown (required)
     - Acceptance Type dropdown (required)

4. **Test Seed Number Editing:**
   - Enter seed number "5"
   - Click "Save Changes"
   - **Verify:** Modal closes
   - **Verify:** Participant table shows "Seed #5" with 🏆 icon
   - Edit same participant again
   - Clear seed number (leave empty)
   - Save
   - **Verify:** Seed column shows "—" (unseeded)

5. **Test Registration Status Change:**
   - Edit a PENDING participant
   - Change status to "ACCEPTED"
   - Save
   - **Verify:** Status badge shows "Accepted" (green)
   - Edit again, change to "REJECTED"
   - Save
   - **Verify:** Status badge shows "Rejected" (red)

6. **Test All 9 Acceptance Types:**
   - Edit an ACCEPTED participant
   - Open the "Acceptance Type" dropdown
   - **Verify:** Dropdown shows all 9 options:
     - Organizer Acceptance (OA)
     - Direct Acceptance (DA)
     - Special Exemption (SE)
     - Junior Exemption (JE)
     - Qualifier (Q)
     - Lucky Loser (LL)
     - Wild Card (WC)
     - Alternate (ALT)
     - Withdrawn (WD)
   - Select "Wild Card (WC)"
   - Save
   - **Verify:** Status column shows acceptance type badge [WC] in blue

7. **Test Category Change:**
   - Edit a participant
   - Change category to a different category
   - Save
   - **Verify:** Category column updates to show new category

8. **Test Modal Cancel:**
   - Edit a participant
   - Change multiple fields
   - Click "Cancel"
   - **Verify:** Modal closes without saving changes
   - **Verify:** Participant data unchanged

9. **Test Validation:**
   - Edit a participant
   - Enter seed number "-5" (negative)
   - Try to save
   - **Verify:** Error alert: "Seed number must be a positive integer"
   - Enter seed number "3.5" (decimal)
   - Try to save
   - **Verify:** Error alert shown

10. **Test Loading State:**
    - Edit a participant
    - Make changes and click "Save Changes"
    - **Verify:** Button shows "🔄 Saving..." while processing
    - **Verify:** Button is disabled during save
    - **Verify:** Modal closes after successful save

11. **Test Delete Button:**
    - Find a REJECTED or WITHDRAWN participant
    - **Verify:** "Delete" button appears next to "Edit" button
    - Find a PENDING or ACCEPTED participant
    - **Verify:** No "Delete" button (only "Edit")

12. **Test All Acceptance Type Badges:**
    - Create/edit participants with each acceptance type
    - **Verify badge displays:**
      - WILD_CARD → [WC]
      - SPECIAL_EXEMPTION → [SE]
      - JUNIOR_EXEMPTION → [JE]
      - QUALIFIER → [Q]
      - ORGANIZER_ACCEPTANCE → [OA]
      - DIRECT_ACCEPTANCE → [DA]
      - LUCKY_LOSER → [LL] (displayed as "Lucky Loser" badge)
      - ALTERNATE → [ALT] (displayed as "Alternate" badge)
      - WITHDRAWN → [WD]

13. **Test Form Help Text:**
    - Open edit modal
    - **Verify:** Seed Number field shows help text: "Enter a positive integer for seeded players. Leave empty for unseeded players."
    - **Verify:** Registration Status shows help text explaining each status
    - **Verify:** Acceptance Type shows help text explaining its purpose

14. **Test Workflow Comparison:**
    - **Old workflow** (before): To set participant as Wild Card
      1. Click "Approve" (sets as DIRECT_ACCEPTANCE only)
      2. Cannot change to WILD_CARD through UI
      3. Must use API or delete and re-add
    - **New workflow** (now): To set participant as Wild Card
      1. Click "Edit"
      2. Select "ACCEPTED" status
      3. Select "Wild Card (WC)" acceptance type
      4. Click "Save Changes"
      5. Done! Badge shows [WC]

**Expected Result:**
- ✅ Single "Edit" button replaces 6+ action buttons
- ✅ All participant fields editable in one modal
- ✅ All 9 acceptance types accessible (not just 3)
- ✅ Category can be changed after registration
- ✅ Seed number can be set/cleared easily
- ✅ Status and acceptance type fully controllable
- ✅ Modal validates seed number (positive integer)
- ✅ Loading state shown during save
- ✅ Help text explains each field
- ✅ Cleaner, less cluttered table interface
- ✅ Consistent editing experience for all participants
- ✅ Changes reflect immediately in table after save

---

### Feature 17: Match Status Validation (SCHEDULED requires time)

**What was changed:** 
- Added validation to prevent marking matches as SCHEDULED without a scheduled date/time
- Yellow warning box appears in status modal when attempting to select SCHEDULED without time
- Clear error message guides user to schedule match first

**Issue (Before):**
- Organizers could set match status to SCHEDULED without assigning a date/time
- Led to data inconsistency (SCHEDULED status but no scheduledTime)
- Caused confusion about when matches should be played
- Order of play showed "Not scheduled" for SCHEDULED matches

**After:**
- Validation prevents SCHEDULED status without time
- Warning box appears when SCHEDULED selected
- Error message shown on submit attempt
- User guided to use "Schedule Match" button first

**How to test:**

1. **Setup:**
   - Log in as tournament organizer or admin
   - Navigate to a match detail page (from order of play or match list)
   - Ensure match does NOT have a scheduled time (shows "Not scheduled")

2. **Test Warning Box:**
   - Click "Update Status" button
   - In the status dropdown, select "SCHEDULED"
   - **Verify:** Yellow warning box appears below dropdown
   - **Verify:** Warning contains:
     - ⚠️ icon
     - "Validation Required" heading in bold
     - Explanatory text: "This match does not have a scheduled date and time. You must schedule the match first..."

3. **Test Validation Error:**
   - Keep status as "SCHEDULED"
   - Click "Update Status" button to submit
   - **Verify:** Error alert appears at top of modal
   - **Verify:** Error message: "Cannot mark match as SCHEDULED without a scheduled date and time. Please schedule the match first using the 'Schedule Match' button."
   - **Verify:** Status not changed (still shows original status)

4. **Test Correct Workflow:**
   - Close the status modal
   - Click "Schedule Match" button
   - Fill in date, time, and court
   - Click "Schedule Match"
   - **Verify:** Match scheduled successfully
   - **Verify:** Match detail shows scheduled date/time
   - Now click "Update Status"
   - Select "SCHEDULED"
   - **Verify:** No warning box appears (match has time)
   - Click "Update Status"
   - **Verify:** Status updates successfully to SCHEDULED
   - **Verify:** No error shown

5. **Test Already Scheduled Match:**
   - Find a match that already has a scheduled time
   - Click "Update Status"
   - Select "SCHEDULED"
   - **Verify:** No warning box appears
   - Click "Update Status"
   - **Verify:** Status updates successfully

6. **Test Other Status Changes:**
   - Try changing to other statuses (NOT_SCHEDULED, IN_PROGRESS, COMPLETED, etc.)
   - **Verify:** No warnings or errors for non-SCHEDULED statuses
   - **Verify:** Status changes succeed regardless of scheduledTime

7. **Test Warning Box Appearance:**
   - Open status modal for unscheduled match
   - Select different statuses and watch warning box
   - **Verify:** Warning only appears when SCHEDULED selected
   - **Verify:** Warning disappears when other status selected
   - Select SCHEDULED again
   - **Verify:** Warning reappears

**Expected Result:**
- ✅ Cannot set SCHEDULED status without date/time
- ✅ Yellow warning box appears when SCHEDULED selected (unscheduled match)
- ✅ Clear error message on submit attempt
- ✅ User guided to schedule match first
- ✅ After scheduling, SCHEDULED status succeeds
- ✅ Data consistency maintained (SCHEDULED always has time)
- ✅ No warnings for other status changes
- ✅ Warning box appears/disappears based on selected status

---

### Feature 18: Winner Selection for WO/RET/DEF Statuses

**What was changed:**
- Added winner dropdown in match status update modal
- Dropdown appears when WALKOVER, RETIRED, or DEFAULT status is selected
- Validation prevents submission without winner selection for these statuses

**Issue (Before):**
- Marking match as WALKOVER, RETIRED, or DEFAULT didn't record which participant won
- Incomplete match records (status set but no winner)
- Bracket advancement broken (can't advance to next round without winner)
- Missing statistics (can't calculate win/loss correctly)

**After:**
- Winner dropdown appears for WO/RET/DEF statuses
- Required validation ensures winner selected
- Complete match records with status AND winner
- Proper bracket advancement works
- Accurate tournament statistics

**How to test:**

1. **Setup:**
   - Log in as tournament organizer or admin
   - Navigate to a match detail page
   - Ensure match has both participants assigned

2. **Test Winner Dropdown Appearance:**
   - Click "Update Status" button
   - Select "WALKOVER" in status dropdown
   - **Verify:** Winner dropdown appears below status dropdown
   - **Verify:** Dropdown labeled "Winner" with red asterisk (required)
   - **Verify:** Dropdown shows "-- Select Winner --" as first option
   - **Verify:** Dropdown shows both participant names
   - **Verify:** Help text: "Required for Walkover, Retired, and Default statuses"

3. **Test All 3 Statuses:**
   - Select "WALKOVER" → **Verify:** Winner dropdown appears
   - Select "RETIRED" → **Verify:** Winner dropdown appears
   - Select "DEFAULT" → **Verify:** Winner dropdown appears
   - Select "COMPLETED" → **Verify:** Winner dropdown does NOT appear
   - Select "IN_PROGRESS" → **Verify:** Winner dropdown does NOT appear
   - Select "SCHEDULED" → **Verify:** Winner dropdown does NOT appear

4. **Test Validation Error (no winner):**
   - Select "WALKOVER" status
   - Leave winner dropdown at "-- Select Winner --"
   - Click "Update Status" button
   - **Verify:** Error alert appears at top of modal
   - **Verify:** Error message: "Cannot mark match as WALKOVER without selecting a winner. Please select which participant won."
   - **Verify:** Status NOT changed (modal stays open)

5. **Test Successful Submit with Winner:**
   - Select "WALKOVER" status
   - Select first participant as winner from dropdown
   - Click "Update Status"
   - **Verify:** Success message: "Match status updated successfully"
   - **Verify:** Modal closes
   - **Verify:** Match detail page shows status as "Walkover"
   - **Verify:** Winner is displayed/recorded correctly

6. **Test RETIRED Status:**
   - Click "Update Status"
   - Select "RETIRED" status
   - Select second participant as winner
   - Click "Update Status"
   - **Verify:** Status updated to "Retired"
   - **Verify:** Winner recorded correctly

7. **Test DEFAULT Status:**
   - Click "Update Status"
   - Select "DEFAULT" status
   - Try to submit without winner → **Verify:** Error shown
   - Select winner, submit → **Verify:** Success

8. **Test Doubles Match:**
   - Navigate to a doubles match (if available)
   - Click "Update Status"
   - Select "WALKOVER"
   - **Verify:** Dropdown shows team names (e.g., "Player A / Player B")
   - Select winning team
   - Submit → **Verify:** Success

9. **Test Winner Dropdown Reset:**
   - Open status modal
   - Select "WALKOVER"
   - Select a winner
   - Close modal (Cancel button)
   - Reopen status modal
   - Select "WALKOVER" again
   - **Verify:** Winner dropdown reset to "-- Select Winner --" (not previous selection)

10. **Test Status Change (from WO to other):**
    - Set match to WALKOVER with winner
    - Click "Update Status"
    - Change status to "IN_PROGRESS"
    - **Verify:** Winner dropdown disappears
    - Submit → **Verify:** Status changes successfully

**CRITICAL: Test Winner Persistence (Bug Fix Verification):**

11. **Test Winner Badge Display:**
    - Set match status to WALKOVER
    - Select Participant 1 as winner
    - Click "Update Status"
    - **Verify:** Success message appears
    - **Verify:** Modal closes
    - **Verify:** Winner badge (👑 Winner) appears on Participant 1's box
    - **Verify:** Winner badge does NOT appear on Participant 2's box

12. **Test Winner in Bracket View:**
    - After setting WALKOVER with winner
    - Navigate to tournament's bracket view
    - Find the match in the bracket
    - **Verify:** Winner is indicated in bracket (styling/icon)
    - **Verify:** Winner advances to next round (if not finals)
    - **Verify:** Next round shows correct participant

13. **Test Winner in Match List:**
    - Navigate to tournament's match list
    - Find the match
    - **Verify:** Winner column shows correct participant name
    - **Verify:** Match status shows "Walkover"

14. **Test Tournament Statistics:**
    - Navigate to tournament statistics/standings page
    - Find both participants
    - **Verify:** Winner has +1 win count
    - **Verify:** Loser has +1 loss count
    - **Verify:** Win/loss records updated correctly

15. **Test Winner Persistence After Reload:**
    - Set match to WALKOVER with winner
    - Verify winner badge appears
    - Refresh the page (F5)
    - **Verify:** Winner badge still appears after reload
    - **Verify:** Match status still shows "Walkover"
    - **Verify:** All winner indicators persist

16. **Test Different Status Types:**
    - Test WALKOVER → **Verify winner persists**
    - Reset match, test RETIRED → **Verify winner persists**
    - Reset match, test DEFAULT → **Verify winner persists**
    - All three should show winner badge and update standings

11. **Test Bracket Advancement:**
    - Mark a bracket match as WALKOVER with winner selected
    - Navigate to bracket visualization
    - **Verify:** Winner advances to next round
    - **Verify:** Winner name appears in next match slot

12. **Test Error Messages for All Statuses:**
    - WALKOVER: "Cannot mark match as WALKOVER without selecting a winner..."
    - RETIRED: "Cannot mark match as RETIRED without selecting a winner..."
    - DEFAULT: "Cannot mark match as DEFAULT without selecting a winner..."

**Expected Result:**
- ✅ Winner dropdown appears ONLY for WO/RET/DEF statuses
- ✅ Dropdown shows both participants correctly
- ✅ Required validation prevents submission without winner
- ✅ Clear error messages guide user
- ✅ Winner recorded in database after successful submit
- ✅ Bracket advancement works with recorded winner
- ✅ Tournament statistics include these matches correctly
- ✅ Doubles teams displayed properly in dropdown
- ✅ Winner dropdown resets when modal reopened
- ✅ Works for all three statuses (WO, RET, DEF)

---

### Feature 19: Default Category Creation

**What was changed:**
- System automatically creates default "Open (Default Category)" when loading tournament with 0 categories
- Eliminates manual category setup step before participant registration
- Only triggers for administrators viewing tournament detail page

**Issue (Before):**
- Couldn't register participants without manually creating categories first
- Extra friction in tournament setup workflow
- Confusing error messages when trying to register without categories

**After:**
- Default category auto-created on demand when admin views tournament with no categories
- Category settings: name="Open (Default Category)", gender=OPEN, ageGroup=OPEN, maxParticipants from tournament
- Console logs inform admin of auto-creation
- Fully editable after creation (can rename, adjust settings, or delete)

**How to test:**

1. **Setup:**
   - Log in as system admin or tournament admin
   - Create a NEW tournament (don't add any categories)
   - Complete tournament creation

2. **Test Auto-Creation:**
   - Navigate to tournament detail page
   - **Verify:** Page loads successfully
   - Open browser console (F12 → Console tab)
   - **Verify:** Console shows: "⚠️ No categories found. Creating default 'Open (Default Category)'..."
   - **Verify:** Console shows: "✅ Default category created: [category object]"

3. **Verify Category in UI:**
   - Look at "Categories" section on tournament detail page
   - **Verify:** One category listed named "Open (Default Category)"
   - **Verify:** Category shows: Gender: OPEN, Age Group: OPEN
   - **Verify:** maxParticipants matches tournament's maxParticipants setting

4. **Test Participant Registration:**
   - Open tournament for registration
   - Register a participant (as player or add external participant as admin)
   - Select the "Open (Default Category)" category
   - **Verify:** Registration succeeds
   - **Verify:** Participant appears in participant list

5. **Test Category Editability:**
   - As admin, click "Edit" on the default category (if edit UI exists)
   - OR use "Add Category" to create additional categories
   - **Verify:** Default category is fully editable like any other category

6. **Test Multiple Page Loads:**
   - Refresh tournament detail page
   - **Verify:** Default category still exists (not recreated)
   - **Verify:** Console does NOT show creation message (category already exists)

7. **Test Non-Admin User:**
   - Log in as regular player/participant
   - View same tournament
   - **Verify:** No default category created (only admins trigger creation)
   - **Verify:** Existing default category is visible

8. **Test Tournament with Existing Categories:**
   - Navigate to a tournament that already has categories
   - **Verify:** No default category created
   - **Verify:** Existing categories shown normally

**Expected Result:**
- ✅ Default category auto-created only when admin views tournament with 0 categories
- ✅ Category settings appropriate for general use (Open/Open)
- ✅ Console logs inform admin of action
- ✅ Participants can register immediately after category creation
- ✅ Category is editable/deletable like manual categories
- ✅ No duplicate creation on page refresh
- ✅ Non-admins don't trigger creation

---

### Feature 20: Image Upload for Announcements

**What was changed:**
- Added image upload field to announcement creation/edit forms
- Image preview displays before submission
- Uploaded images shown in announcement cards and details modal

**Issue (Before):**
- Announcements were text-only
- Limited visual communication effectiveness
- No way to share tournament graphics, schedules, sponsor logos

**After:**
- File upload input with validation (image types, 5MB max)
- Live preview shows selected image before submission
- Remove image button for easy changes
- Images display full-width in announcement details modal
- Note: Currently uses data URLs; production should use CDN/cloud storage

**How to test:**

1. **Setup:**
   - Log in as tournament admin
   - Navigate to tournament detail page
   - Click "Create Announcement" button

2. **Test Image Upload Field:**
   - Scroll to "Media & Links" section
   - **Verify:** "Image" field present with file input
   - **Verify:** Label shows: "Image (optional, max 5MB)"
   - **Verify:** Help text: "Supported formats: JPG, PNG, GIF, WebP"
   - **Verify:** File input accepts image files

3. **Test Valid Image Upload:**
   - Click "Choose File" button
   - Select a valid image file (JPG/PNG, < 5MB)
   - **Verify:** Image preview appears below file input
   - **Verify:** Preview shows correct image
   - **Verify:** "Remove Image" button appears

4. **Test Image Preview Sizing:**
   - Upload various image sizes (portrait, landscape, square)
   - **Verify:** Preview contained within reasonable dimensions
   - **Verify:** Image not stretched or distorted
   - **Verify:** Preview has rounded corners and shadow

5. **Test Remove Image:**
   - Upload an image
   - Click "Remove Image" button
   - **Verify:** Preview disappears
   - **Verify:** File input resets (no filename shown)
   - **Verify:** Can upload different image

6. **Test Invalid File Type:**
   - Try uploading a non-image file (PDF, TXT, etc.)
   - **Verify:** Error message appears: "Please select a valid image file"
   - **Verify:** No preview shown
   - **Verify:** Image not uploaded

7. **Test File Size Limit:**
   - Try uploading image > 5MB
   - **Verify:** Error message: "Image size must be less than 5MB"
   - **Verify:** No preview shown
   - **Verify:** Image not uploaded

8. **Test Announcement Submission with Image:**
   - Fill announcement title and content
   - Upload an image
   - Click "Create Announcement"
   - **Verify:** Success message appears
   - **Verify:** Redirected to announcements list

9. **Test Image Display in List:**
   - View announcements list
   - Find created announcement
   - **Verify:** Announcement card may show image thumbnail (depends on list design)

10. **Test Image Display in Modal:**
    - Click announcement to open details modal
    - **Verify:** Image displays in modal body
    - **Verify:** Image full-width, max-height 400px
    - **Verify:** Image has rounded corners and shadow
    - **Verify:** Image doesn't overflow modal

11. **Test Announcement Without Image:**
    - Create announcement without uploading image
    - **Verify:** Announcement creates successfully
    - **Verify:** No broken image placeholders in display

**Expected Result:**
- ✅ Image upload field present in creation form
- ✅ File type validation prevents non-images
- ✅ Size validation prevents oversized files
- ✅ Live preview shows selected image
- ✅ Remove button clears image
- ✅ Images display correctly in announcement modal
- ✅ Works with all supported formats (JPG, PNG, GIF, WebP)
- ✅ Announcements without images still work

---

### Feature 21: External Link Button for Announcements

**What was changed:**
- Added external link URL and custom button text fields
- Link displays as prominent call-to-action button in announcement details
- Opens in new tab with security attributes

**Issue (Before):**
- No way to link announcements to external resources
- Couldn't drive traffic to registration forms, rule documents, live streams
- Plain text URLs looked unprofessional

**After:**
- externalLink field (URL input with validation)
- linkText field (custom button label, defaults to "Learn More")
- Link button styled as primary CTA with gradient and hover effects
- Backend database includes linkText column for persistence

**How to test:**

1. **Setup:**
   - Log in as tournament admin
   - Navigate to tournament detail page
   - Click "Create Announcement"

2. **Test Link Fields Presence:**
   - Scroll to "Media & Links" section
   - **Verify:** "External Link" field present (type=url)
   - **Verify:** Label: "External Link (optional)"
   - **Verify:** Placeholder: "https://example.com"
   - **Verify:** Help text: "Add a link for users to learn more or take action"

3. **Test Link Text Field Conditional Display:**
   - With External Link field empty
   - **Verify:** "Link Button Text" field NOT visible
   - Type a URL in External Link field
   - **Verify:** "Link Button Text" field appears below
   - **Verify:** Label: "Link Button Text (optional)"
   - **Verify:** Placeholder: "Learn More"
   - **Verify:** Help text: "Customize the text shown on the link button..."

4. **Test Link Without Custom Text:**
   - Enter URL: "https://example.com/rules"
   - Leave Link Button Text empty
   - Fill title and content fields
   - Click "Create Announcement"
   - Open announcement details modal
   - **Verify:** Link button appears with text "Learn More"

5. **Test Link With Custom Text:**
   - Create new announcement
   - Enter URL: "https://youtube.com/tournament-stream"
   - Enter Link Button Text: "Watch Live Stream"
   - Submit announcement
   - Open details modal
   - **Verify:** Button shows "Watch Live Stream" (not "Learn More")

6. **Test Link Button Styling:**
   - View announcement with link in modal
   - **Verify:** Button has gradient blue background
   - **Verify:** White text color
   - **Verify:** Icon 🔗 before text
   - **Verify:** Arrow → after text
   - **Verify:** Centered in modal
   - Hover over button
   - **Verify:** Button raises slightly (transform effect)
   - **Verify:** Shadow intensifies on hover

7. **Test Link Opens in New Tab:**
   - Click link button in announcement modal
   - **Verify:** Link opens in NEW tab/window
   - **Verify:** Original announcement modal stays open
   - Check new tab's HTML (inspect element)
   - **Verify:** Link has target="_blank"
   - **Verify:** Link has rel="noopener noreferrer" (security)

8. **Test URL Validation:**
   - Try entering invalid URL: "not-a-url"
   - Try submitting
   - **Verify:** Browser shows URL validation error
   - Enter valid URL: "https://example.com"
   - **Verify:** Validation passes

9. **Test Link Text Length Limit:**
   - Enter very long custom text (> 50 chars)
   - **Verify:** Input truncates at 50 characters
   - **Verify:** Remaining text not accepted

10. **Test Announcement Without Link:**
    - Create announcement
    - Leave External Link field empty
    - Submit announcement
    - Open details modal
    - **Verify:** No link button appears
    - **Verify:** No broken/empty button elements

11. **Test Link Persistence:**
    - Create announcement with link and custom text
    - Close and reopen details modal
    - **Verify:** Link button still shows with correct text
    - Refresh page
    - **Verify:** Link persists after page reload

12. **Test Edit Announcement with Link:**
    - Edit existing announcement with link
    - Change link text
    - Save changes
    - **Verify:** Updated link text displays

**Expected Result:**
- ✅ External link field present with URL validation
- ✅ Link text field appears conditionally when URL entered
- ✅ Default text "Learn More" used if custom text empty
- ✅ Link button styled prominently as CTA
- ✅ Button includes icons (🔗 and →)
- ✅ Hover effects enhance interactivity
- ✅ Links open in new tab with security attributes
- ✅ Custom text limited to 50 characters
- ✅ Announcements without links work normally
- ✅ Links persist across page reloads
- ✅ Backend stores linkText in database

---

## Phase 5: State Management & Validation (April 23, 2026)

### Feature 22: Prevent Scheduling BYE Matches

**What was changed:**  
- Added validation to prevent scheduling matches where one participant is 'BYE'
- BYE matches are automatic passes and don't require scheduling

**How to test:**

1. **Setup:** Generate a bracket with BYE matches
   - Create tournament with non-power-of-2 participants (e.g., 6 players → 8-player bracket with 2 BYEs)
   - Generate Single Elimination bracket
   - Navigate to bracket view
1
2. **Test BYE Match in Bracket:**
   - Find a match with "BYE" participant (green ✅ icon + "BYE" label)
   - Click on the match to open match detail page
   - **Verify:** "Schedule Match" button is NOT visible in Match Actions section

3. **Test Direct Navigation:**
   - Copy match ID from URL
   - As admin, try to open schedule modal
   - **Verify:** Error message appears: "Cannot schedule BYE matches. BYE matches are automatic passes and do not require scheduling."

4. **Test Backend Validation:**
   - Attempt API call to schedule BYE match (if testing programmatically)
   - **Verify:** API returns error with same message

**Expected Result:**
- ✅ Schedule Match button hidden for BYE matches
- ✅ Error message shown if scheduling attempted
- ✅ Backend validation prevents scheduling via API
- ✅ Clear explanation of BYE behavior

---

### Feature 23: Distinguish BYE from TBD in Brackets

**What was changed:**  
- Visual distinction between BYE (automatic pass) and TBD (to be determined)
- BYE: Green checkmark ✅ + bold green text
- TBD: Gray question mark ❓ + italic gray text

**How to test:**

1. **Setup:** Create bracket with both BYE and TBD participants
   - Tournament with non-power-of-2 participants for BYEs
   - Generate bracket → View bracket

2. **Test BYE Display (Single Elimination):**
   - Find first-round match with BYE participant
   - **Verify:** Shows green checkmark ✅ icon
   - **Verify:** Shows "BYE" label in green color (#10b981)
   - **Verify:** Text is bold and italic
   - **Verify:** Winner already determined (opponent advanced)

3. **Test TBD Display (Single Elimination):**
   - Find second-round match (before first round complete)
   - **Verify:** Empty participant slots show gray question mark ❓ icon
   - **Verify:** Shows "TBD" label in gray color (#9ca3af)
   - **Verify:** Text is regular weight and italic
   - **Verify:** No winner determined yet

4. **Test Round Robin Display:**
   - Generate Round Robin bracket
   - **Verify:** BYE and TBD labels appear correctly in match cards
   - **Verify:** Same styling and icons as Single Elimination

5. **Test First Round Completion:**
   - Complete a first-round match
   - View second-round bracket
   - **Verify:** Winner appears in second round (replaces TBD)
   - **Verify:** Loser's slot remains TBD (if applicable)

**Expected Result:**
- ✅ BYE shows with green ✅ icon, green bold text
- ✅ TBD shows with gray ❓ icon, gray italic text
- ✅ Clear visual distinction between states
- ✅ Works in Single Elimination and Round Robin
- ✅ Updates when matches complete

---

### Feature 24: Match Status Transition Filtering + Validation (Option D)

**What was changed:**  
- Status update dropdown now shows only valid next states instead of all 13 statuses
- Filters based on current match status using `Match.isValidTransition()` logic
- **NEW: COMPLETED Validation** - Cannot mark match as COMPLETED without recording scores or winner
- **NEW: Selective Rollbacks** - Allows correcting mistakes while preserving data integrity:
  - SCHEDULED ↔ NOT_SCHEDULED (bidirectional - undo accidental scheduling)
  - COMPLETED → IN_PROGRESS (correction - reopen completed match)
  - DEAD_RUBBER → COMPLETED (tournament relevance changed)
- Terminal states remain locked: BYE, WALKOVER, DEFAULT, RETIRED, ABANDONED, CANCELLED, NOT_PLAYED

**How to test:**

**Part 1: Basic Transition Filtering**

1. **Test NOT_SCHEDULED Match:**
   - Create a new match (default status: NOT_SCHEDULED)
   - Open match detail → Click "Update Status"
   - **Verify:** Dropdown shows: NOT_SCHEDULED, SCHEDULED, WALKOVER, CANCELLED, DEFAULT, NOT_PLAYED, BYE
   - **Verify:** Does NOT show: IN_PROGRESS, COMPLETED, RETIRED, SUSPENDED, ABANDONED, DEAD_RUBBER

2. **Test SCHEDULED Match:**
   - Schedule a match (status: SCHEDULED)
   - Open status modal
   - **Verify:** Dropdown shows: **NOT_SCHEDULED** (rollback), SCHEDULED, IN_PROGRESS, WALKOVER, CANCELLED, DEFAULT, NOT_PLAYED, BYE
   - **Verify:** Does NOT show: COMPLETED, RETIRED, SUSPENDED, ABANDONED, DEAD_RUBBER
   - **Note:** NOT_SCHEDULED is included (rollback capability)

3. **Test IN_PROGRESS Match:**
   - Set match to IN_PROGRESS
   - Open status modal
   - **Verify:** Dropdown shows: IN_PROGRESS, COMPLETED, RETIRED, SUSPENDED, ABANDONED, CANCELLED
   - **Verify:** Does NOT show: NOT_SCHEDULED, SCHEDULED, WALKOVER, DEFAULT, BYE, NOT_PLAYED, DEAD_RUBBER

4. **Test SUSPENDED Match:**
   - Set match to SUSPENDED
   - Open status modal
   - **Verify:** Dropdown shows: SUSPENDED, IN_PROGRESS, ABANDONED, CANCELLED
   - **Verify:** Does NOT show: COMPLETED, RETIRED, etc.

5. **Test COMPLETED Match:**
   - Complete a match with scores (e.g., 6-4, 6-2)
   - Open status modal
   - **Verify:** Dropdown shows: **IN_PROGRESS** (rollback), COMPLETED, DEAD_RUBBER
   - **Verify:** Does NOT show: NOT_SCHEDULED, SCHEDULED, WALKOVER, etc.
   - **Note:** IN_PROGRESS is included (rollback capability for corrections)

6. **Test DEAD_RUBBER Match:**
   - Set match to DEAD_RUBBER
   - Open status modal
   - **Verify:** Dropdown shows: **COMPLETED** (rollback), DEAD_RUBBER
   - **Note:** COMPLETED is included (match became relevant again)

7. **Test Terminal States (No Rollbacks):**
   - Set match to RETIRED, WALKOVER, ABANDONED, BYE, NOT_PLAYED, CANCELLED, or DEFAULT
   - Open status modal
   - **Verify:** Dropdown shows ONLY the current status (no transitions allowed)
   - **Verify:** These are truly terminal states - cannot be changed once set

**Part 2: COMPLETED Validation Testing**

8. **Test COMPLETED Without Scores (Should Fail):**
   - Create a match with participants assigned
   - Do NOT record any scores (scores array empty)
   - Open status modal
   - Select "COMPLETED" status
   - Click "Update Status"
   - **Verify:** Error message appears: "Cannot mark match as COMPLETED without recording match results. Please submit scores first using the 'Record Scores' button."
   - **Verify:** Status does NOT change to COMPLETED
   - **Verify:** Match remains in original status

9. **Test COMPLETED With Scores (Should Succeed):**
   - Same match, click "Record Scores" button
   - Enter scores (e.g., Set 1: 6-4, Set 2: 6-3)
   - Submit scores successfully
   - Open status modal
   - Select "COMPLETED" status
   - Click "Update Status"
   - **Verify:** Status updates successfully to COMPLETED
   - **Verify:** No error message shown

10. **Test COMPLETED With Winner (WO/RET/DEF - Should Succeed):**
    - Mark match as WALKOVER with winner selected
    - Later, open status modal
    - Change status to COMPLETED (dropdown includes this)
    - **Verify:** Status updates successfully (winner exists, no scores needed)

**Part 3: Rollback Testing**

11. **Test SCHEDULED → NOT_SCHEDULED Rollback:**
    - Create and schedule a match (status: SCHEDULED)
    - Open status modal
    - Select "NOT_SCHEDULED" from dropdown
    - Click "Update Status"
    - **Verify:** Status changes to NOT_SCHEDULED
    - **Verify:** Success message shown
    - **Use Case:** Correcting accidental/premature scheduling

12. **Test NOT_SCHEDULED → SCHEDULED (Forward Again):**
    - From previous test (status: NOT_SCHEDULED)
    - Schedule the match again
    - Select "SCHEDULED" from dropdown
    - **Verify:** Status changes back to SCHEDULED
    - **Verify:** Bidirectional rollback works

13. **Test COMPLETED → IN_PROGRESS Rollback:**
    - Complete a match with scores (status: COMPLETED)
    - Open status modal
    - Select "IN_PROGRESS" from dropdown
    - Click "Update Status"
    - **Verify:** Status changes to IN_PROGRESS
    - **Verify:** Scores remain in database (not deleted)
    - **Use Case:** Need to correct/adjust scores or match outcome

14. **Test IN_PROGRESS → COMPLETED (Forward Again):**
    - From previous test (status: IN_PROGRESS)
    - Adjust scores if needed
    - Select "COMPLETED" from dropdown
    - **Verify:** Status changes back to COMPLETED
    - **Verify:** Can complete match again after rollback

15. **Test DEAD_RUBBER → COMPLETED Rollback:**
    - Mark a match as DEAD_RUBBER
    - Open status modal
    - Select "COMPLETED" from dropdown
    - Click "Update Status"
    - **Verify:** Status changes to COMPLETED
    - **Use Case:** Match became relevant to tournament standings again

**Part 4: Terminal State Validation**

16. **Test Terminal States Cannot Rollback:**
    - Set match to WALKOVER
    - Open status modal
    - **Verify:** Dropdown shows ONLY "WALKOVER" (no other options)
    - Try setting to RETIRED
    - Open status modal
    - **Verify:** Dropdown shows ONLY "RETIRED" (no other options)
    - Repeat for: ABANDONED, BYE, NOT_PLAYED, CANCELLED, DEFAULT
    - **Verify:** All terminal states locked (cannot change or rollback)

**Part 5: Error Message Testing**

17. **Test SCHEDULED Validation (Without Time):**
    - Find match without scheduled time (scheduledTime = null)
    - Open status modal
    - Select "SCHEDULED"
    - **Verify:** Yellow warning box appears with text: "This match does not have a scheduled date and time..."
    - Click "Update Status"
    - **Verify:** Error message: "Cannot mark match as SCHEDULED without a scheduled date and time..."

18. **Test Winner Required Validation (WO/RET/DEF):**
    - Open status modal
    - Select "WALKOVER"
    - Leave winner dropdown at "-- Select Winner --"
    - Click "Update Status"
    - **Verify:** Error message: "Cannot mark match as WALKOVER without selecting a winner..."
    - Repeat for RETIRED and DEFAULT statuses

**Expected Result:**
- ✅ Dropdown filtered to valid next states based on current status
- ✅ Current status always included in dropdown
- ✅ Selective rollbacks work (NOT_SCHEDULED↔SCHEDULED, COMPLETED→IN_PROGRESS, DEAD_RUBBER→COMPLETED)
- ✅ COMPLETED validation prevents softlock (requires scores OR winner)
- ✅ Terminal states truly locked (no transitions allowed)
- ✅ Clear error messages guide users
- ✅ Validation prevents data inconsistency
- ✅ Workflow balances flexibility with data integrity

**Expected Result:**
- ✅ Dropdown filtered to valid next states
- ✅ Current status always included in list
- ✅ Invalid transitions not shown
- ✅ Prevents accidental invalid status changes
- ✅ Guides admin through proper match workflow

---

### Feature 25: Tournament State-Based Action Validation

**What was changed:**  
- Tournament detail page now gates UI actions based on tournament status
- Edit button is disabled (with tooltip) for locked statuses (DRAW_PENDING, IN_PROGRESS, FINALIZED, CANCELLED)
- Navigating directly to the edit URL for a locked tournament redirects back to detail with an error
- "Add Category" button disabled/labeled when status is not DRAFT or REGISTRATION_OPEN
- Bracket generation section hidden when status is not REGISTRATION_CLOSED or DRAW_PENDING

**How to test:**

**Part 1: Edit Button State**

1. **DRAFT / REGISTRATION_OPEN / REGISTRATION_CLOSED tournament:**
   - Navigate to tournament detail as admin
   - **Verify:** "✏️ Edit Details" button is **enabled** and clickable

2. **DRAW_PENDING / IN_PROGRESS / FINALIZED / CANCELLED tournament:**
   - Navigate to tournament detail
   - **Verify:** "✏️ Edit Details" button is **disabled** and shows tooltip "Cannot edit tournament in [STATUS] status"

**Part 2: Direct URL Edit Redirect**

3. **Navigate directly to edit URL of a locked tournament:**
   - Copy the edit URL: `/tournaments/:id/edit`
   - Paste in browser with a DRAW_PENDING / IN_PROGRESS tournament
   - **Verify:** Redirected back to tournament detail page
   - **Verify:** Error message displayed: "Cannot edit tournament in [STATUS] status."

**Part 3: Category Management**

4. **DRAFT or REGISTRATION_OPEN tournament:**
   - Navigate to Categories section in tournament detail
   - **Verify:** "➕ Add Category" button is **enabled** and clickable

5. **REGISTRATION_CLOSED / DRAW_PENDING / IN_PROGRESS / FINALIZED / CANCELLED tournament:**
   - Navigate to Categories section
   - **Verify:** "Add Category" button is **disabled** or shows label "Category Management Locked"

**Part 4: Bracket Generation**

6. **REGISTRATION_OPEN or DRAFT tournament:**
   - Navigate to tournament detail
   - **Verify:** Bracket generation section is **NOT visible**

7. **REGISTRATION_CLOSED or DRAW_PENDING tournament:**
   - Navigate to tournament detail as admin with at least one category
   - **Verify:** Bracket generation section **IS visible**
   - **Verify:** Can generate bracket normally

**Expected Result:**
- ✅ Edit button disabled with tooltip for locked statuses
- ✅ Direct navigation to edit URL of locked tournament redirects with error
- ✅ Add Category button disabled after REGISTRATION_OPEN
- ✅ Bracket generation section only visible in correct states
- ✅ Error messages are clear and actionable

---

### Feature 26: Court Management Interface

**What was changed:**  
- New "Manage Courts" page at `/tournaments/:tournamentId/courts`
- Accessible via "🏟️ Manage Courts" tile in tournament detail Quick Actions (admin only)
- Full CRUD: add courts, edit name/hours inline, delete with confirmation

**How to test:**

**Part 1: Navigation**

1. **Navigate to Court Management:**
   - Log in as TOURNAMENT_ADMIN or SYSTEM_ADMIN
   - Navigate to any tournament detail page
   - Scroll to Quick Actions section
   - **Verify:** "🏟️ Manage Courts" tile is visible
   - Click the tile
   - **Verify:** Navigates to `/tournaments/:tournamentId/courts`
   - **Verify:** Page header shows "Manage Courts" with tournament context

2. **Non-admin access (negative test):**
   - Log in as PLAYER or COACH
   - Navigate to the tournament detail page
   - **Verify:** "Manage Courts" tile is NOT visible in Quick Actions
   - Try navigating directly to `/tournaments/:id/courts`
   - **Verify:** Redirected (roleGuard active)

**Part 2: Add Court**

3. **Add court with name only:**
   - On the Manage Courts page, fill in "Court Name" field (e.g., "Court 1")
   - Leave Opening Time and Closing Time blank
   - Click "Add Court"
   - **Verify:** New court appears in the list with name "Court 1"
   - **Verify:** No opening/closing time shown (dashes)

4. **Add court with full details:**
   - Fill in name "Centre Court", opening time "08:00", closing time "20:00"
   - Click "Add Court"
   - **Verify:** Court appears with name and hours displayed

5. **Add court without name (validation):**
   - Leave Court Name empty
   - Click "Add Court"
   - **Verify:** Form does not submit (HTML required validation)

**Part 3: Edit Court**

6. **Edit court name:**
   - Find any court in the list, click "✏️ Edit"
   - **Verify:** Row switches to edit mode with inputs
   - Change the name to "Court A"
   - Click "💾 Save"
   - **Verify:** Row returns to display mode with new name "Court A"

7. **Edit court hours:**
   - Click "✏️ Edit" on a court
   - Set Opening Time to "09:00" and Closing Time to "21:00"
   - Click "💾 Save"
   - **Verify:** Updated hours displayed in the table

8. **Cancel edit:**
   - Click "✏️ Edit" on a court
   - Change the name to something else
   - Click "✖ Cancel"
   - **Verify:** Original values restored, no changes saved

**Part 4: Delete Court**

9. **Delete a court:**
   - Click "🗑️ Delete" on any court
   - **Verify:** Browser confirmation dialog appears
   - Confirm the deletion
   - **Verify:** Court removed from the list

10. **Cancel deletion:**
    - Click "🗑️ Delete"
    - In the confirmation dialog, click Cancel
    - **Verify:** Court NOT removed from the list

**Part 5: Back Navigation**

11. **Back button:**
    - On the Manage Courts page, click "← Back"
    - **Verify:** Returns to tournament detail page for the same tournament

**Expected Result:**
- ✅ Manage Courts tile visible to admins in Quick Actions
- ✅ Non-admins cannot access court management
- ✅ Add court with name (required) and optional hours
- ✅ Edit court inline with Save/Cancel
- ✅ Delete court with confirmation
- ✅ Back button navigates to correct tournament detail
- ✅ Courts updated immediately in the list after each operation

---

### Feature 27: Order-of-Play Courts Panel — Read-Only + Manage Courts Button

**What was changed:**
- The courts panel in the order-of-play view is now **read-only**: court names, surface, hours, and availability are shown but cannot be edited or deleted from this page.
- The "\u2795 Add" button has been replaced with a "\ud83c\udfdf\ufe0f Manage Courts" button (admins only) that navigates to the dedicated court management page.
- The component now loads the tournament data on init, so the button correctly reflects the tournament context even when accessed directly via URL.

**How to test:**

**Part 1: Courts Panel — Display Only**

1. **Log in as TOURNAMENT_ADMIN or SYSTEM_ADMIN**
2. Navigate to **Tournaments** → Select any tournament → **Order of Play** tab
3. Look at the **"\ud83c\udfbe Courts"** panel on the left side
4. **Verify:** Each court row shows name, surface icon, opening/closing hours (if set), and availability
5. **Verify:** There are **no Edit (✎) or Delete (\ud83d\uddd1\ufe0f) buttons** on any court row
6. **Verify:** Clicking on a court row does **not** activate an inline edit mode (no text input appears)

**Part 2: Manage Courts Button (Admin)**

7. **Still logged in as admin**, look at the top-right of the Courts panel header
8. **Verify:** A "\ud83c\udfdf\ufe0f Manage Courts" button is visible
9. Click the button
10. **Verify:** You are navigated to the Court Management page (`/tournaments/:id/courts`)
11. Make a change (e.g., rename a court) on the Court Management page
12. Navigate back to the Order of Play view (browser back or nav link)
13. **Verify:** The updated court name is reflected in the courts panel

**Part 3: Button Accessibility Across Statuses**

14. **Test with DRAFT tournament:**
    - Navigate to Order of Play for a DRAFT tournament (as admin)
    - **Verify:** "\ud83c\udfdf\ufe0f Manage Courts" button is **enabled** and clickable

15. **Test with REGISTRATION_OPEN tournament:**
    - **Verify:** Button is **enabled**

16. **Test with REGISTRATION_CLOSED tournament:**
    - **Verify:** Button is **enabled**

17. **Test with DRAW_PENDING tournament:**
    - **Verify:** Button is **enabled** (matches the tournament detail page behavior)

18. **Test with IN_PROGRESS or FINALIZED tournament:**
    - Navigate to Order of Play for a live/completed tournament
    - **Verify:** Button is **enabled** (no status restriction — consistent with tournament detail page)

**Part 4: Non-Admin Users**

19. **Log in as PLAYER or COACH**
20. Navigate to the Order of Play view for any tournament
21. **Verify:** The "\ud83c\udfdf\ufe0f Manage Courts" button is **NOT visible**
22. **Verify:** Courts are still shown in read-only display

**Part 5: Empty State**

23. Navigate to Order of Play for a tournament with **no courts yet**
24. **Verify:** Courts panel shows the empty state message
25. **Verify (as admin):** Message includes "Use 'Manage Courts' to add one"
26. **Verify (as non-admin):** Generic empty message displayed

**Expected Result:**
- \u2705 Courts panel is read-only (no edit/delete buttons)
- \u2705 "\ud83c\udfdf\ufe0f Manage Courts" button visible to admins, hidden from players/coaches
- \u2705 Button enabled for all tournament statuses (matches tournament detail page behavior)
- \u2705 Button navigates to `/tournaments/:id/courts`
- \u2705 Court changes made on management page are reflected when returning to order-of-play
- \u2705 Empty state shows appropriate message per role

---

## Feature 28: Super Tiebreak Score Entry

**Description:** The score entry modal now handles tiebreak scoring at set level (7-6) and the special Super Tiebreak match format (single tiebreak to 10 points).

### Part 1 — Per-Set Tiebreak Input (7-6 score)

1. As admin, navigate to an active match detail page
2. Click **Record Scores**
3. For any set, enter games as **7** (P1) and **6** (P2)
4. Verify a **"Tiebreak points"** sub-row appears below that set automatically
5. Enter tiebreak values, e.g., P1 = 9, P2 = 7 (valid) or P1 = 8, P2 = 7 (invalid — "win by 2")
6. Verify validation errors appear for invalid tiebreak scores

**Expected:** ✅ Tiebreak row appears only when score is 7-6 or 6-7; validation enforces win-by-2

### Part 2 — Super Tiebreak Format Match

1. Find or create a match with format **SUPER_TIEBREAK**
2. Click **Record Scores**
3. Verify the modal shows **"Super Tiebreak (first to 10, win by 2)"** instead of regular set inputs
4. No Add/Remove Set buttons should be visible
5. Enter P1 = 10, P2 = 8 → submit → expect success
6. Try P1 = 9, P2 = 8 → expect error "must reach at least 10 points"
7. Try P1 = 10, P2 = 9 → expect error "must be won by at least 2 points"

**Expected:** ✅ Only tiebreak point inputs shown; validation enforces 10-point minimum and 2-point margin

### Part 3 — Other Formats Still Work

1. Open a match with format **BEST_OF_3_FINAL_SET_TIEBREAK**
2. Enter scores 6-4, 4-6, 6-4 (no tiebreaks) → verify no tiebreak rows appear
3. Enter 7-6 in set 3 → verify tiebreak row appears for that set only

**Expected:** ✅ Tiebreak rows only appear on 7-6 sets, not on every set

---

## Feature 29: Improved PDF Export Template

**Description:** The tournament statistics PDF export now uses a professional green/teal color scheme matching the application theme, includes a dark green hero header, repeating page headers on pages 2+, streak direction indicators (up/down), and a Category Breakdown section.

### Part 1 — Generate Statistics PDF

1. Navigate to a tournament with completed matches
2. Go to the **Statistics** tab (or Statistics page)
3. Click **Export PDF** (or "Statistics" export)
4. Open the downloaded PDF

### Part 2 — Verify PDF Contents

- ✅ Header: Dark green background with diagonal teal stripe, tournament name visible
- ✅ "Generated: [date/time]" visible in header
- ✅ Overview section shows Participants, Matches, Completion Rate with progress bar
- ✅ Match Status Distribution table with green header row
- ✅ Top Performers table with medal emoji rank indicators and streak arrows
- ✅ Most Active Participants table
- ✅ Category Breakdown table (if tournament has multiple categories)
- ✅ Footer on every page: "Tournament Name — Statistics Report | Page X of Y"
- ✅ On page 2+: compact green header band at top with tournament name and page number

### Part 3 — Multi-Page Verification

1. If the tournament has many participants, scroll to page 2 of the PDF
2. Verify the compact header band appears at the top of page 2

**Expected:** ✅ PDF has professional green/teal styling; all sections present; repeating header on pages 2+

---

## Feature 30: Advanced Bracket Configuration

**Description:** The bracket generation form now includes an **Advanced Options** collapsible section with: Seeding Strategy (any bracket type), Consolation Bracket + Bye Assignment (Single Elimination only), and Players per Group (Round Robin only).

### Part 1 — Access Advanced Options

1. As admin, navigate to a tournament in DRAW_PENDING status
2. Click **Generate Bracket / Draw**
3. In the bracket generation form, look for **"Advanced Options"** at the bottom (collapsible section)
4. Click it to expand the section

**Expected:** ✅ Advanced Options section expands to show additional controls

### Part 2 — Seeding Strategy

1. In Advanced Options, select **"Top Seeded"** under Seeding Strategy
2. Verify description text updates to "Registered ranking is used to place top seeds in the draw"
3. Select **"Random"** → verify text updates
4. Select **"None"** → verify text updates

**Expected:** ✅ Three seeding strategy options available with descriptive text

### Part 3 — Consolation + Bye Assignment (Single Elimination)

1. Select **SINGLE_ELIMINATION** as Bracket Format
2. Verify Consolation Bracket options appear: None, Consolation, Double Elimination
3. Select **"Consolation"** → verify description text
4. Verify **Bye Assignment** options appear: "Top Seeds get Byes", "Random Byes"
5. Switch to **ROUND_ROBIN** bracket type
6. Verify consolation and bye assignment sections **disappear**

**Expected:** ✅ Consolation/bye options only visible for Single Elimination

### Part 4 — Group Size (Round Robin)

1. Select **ROUND_ROBIN** as Bracket Format
2. Verify **"Players per Group"** options appear: 3, 4, 6, 8
3. Select 6 → verify description "Each group will contain up to 6 players"

**Expected:** ✅ Group size selector only visible for Round Robin

### Part 5 — Submit with Advanced Options

1. Configure advanced options as desired
2. Click **Generate Bracket**
3. Verify bracket generates successfully
4. Verify form resets advanced options to defaults after success

**Expected:** ✅ Bracket generates with advanced configuration; form resets on success

---

## Feature 31: Global Ranking Update Workflow

**Description:** Administrators now have a **"Recalculate Rankings"** button in the Global Rankings view. It re-sorts all existing global ranking entries by points (descending) and updates each player's position, preserving the old position as `previousPosition` so the up/down change indicators reflect the update.

### Part 1 — Admin Button Visibility

1. Log in as **System Admin** or **Tournament Admin**
2. Navigate to **Rankings** (global ranking view)
3. Verify a **"Recalculate Rankings"** button appears above the rankings table

**Expected:** ✅ Button visible only for admins; not visible as regular user

### Part 2 — Recalculate Rankings

1. As admin, click **Recalculate Rankings**
2. Button should change to "Recalculating..." and be disabled during processing
3. After completion, verify:
   - ✅ Green success banner "Rankings recalculated successfully." appears
   - ✅ Rankings table refreshes
   - ✅ Players are sorted by points descending
   - ✅ Success message disappears after ~4 seconds

**Expected:** ✅ Rankings recalculated; positions updated; success feedback shown

### Part 3 — Position Change Indicators

1. After recalculating, look at the **Change** column in the rankings table
2. Players who moved up should show a positive indicator (e.g., +2)
3. Players who moved down should show a negative indicator (e.g., -1)
4. Players who stayed at the same rank should show neutral (—)

**Expected:** ✅ Change indicators reflect the position difference from before recalculation

### Part 4 — Regular User Cannot Recalculate

1. Log out and log in as a regular participant
2. Navigate to Rankings
3. Verify the "Recalculate Rankings" button is **not visible**

**Expected:** ✅ Recalculate button hidden for non-admin users

---

## Phase 7: Phase Linking UI (April 25, 2026)

### Feature: Phases Overview Tab

**What was changed:** Added "Phases Overview" tab as the default landing page in Phase Management with visual flow diagram showing all tournament phases and their relationships.

**How to test:**
1. **Log in as tournament admin**
2. Navigate to any tournament detail page
3. Click the **"🔗 Phase Management"** quick action tile
4. **Verify:** You land on the **"Phases Overview"** tab by default (not "Link Phases")
5. If the tournament has phases:
   - **Verify:** Visual flow diagram shows phase nodes connected by arrows
   - **Verify:** Each phase node displays: name, bracket type, match count, completion status
   - **Verify:** Completed phases have green "✅ Completed" badges
   - **Verify:** Active phases have blue "⏳ Active" badges
   - **Verify:** Arrows point from source phase to `nextPhaseId` target phase
   - **Verify:** Below diagram, phase cards grid shows all phases with metadata
6. If the tournament has no phases:
   - **Verify:** Empty state appears with message "No phases defined yet"
   - **Verify:** Call-to-action text suggests clicking "Create New Phase"

**Expected Result:**
- Overview tab is first tab and default active
- Visual flow diagram clearly shows phase sequence
- Phase nodes show all relevant info (bracket type, matches, status)
- Empty state appears when no phases exist

---

### Feature: Create New Phase Workflow

**What was changed:** Added "+ Create New Phase" button and modal in Phase Management allowing admins to create qualifying, main, consolation, or custom phases directly from the UI.

**How to test:**
1. **Log in as tournament admin**
2. Navigate to Phase Management page
3. Ensure you're on the **"Phases Overview"** tab
4. Click the **"+ Create New Phase"** button (top-right of Overview card header)
5. **Verify:** Modal appears with title "+ Create New Phase"
6. **Fill out the form:**
   - **Phase Name:** Enter "Test Qualifying Round" (required field)
   - **Phase Type:** Select "Qualifying" from dropdown
   - **Category:** Select a category from dropdown (auto-populated from tournament)
   - **Bracket Format:** Select "Round Robin"
7. Click **"✅ Create Phase"** button
8. **Verify:** Success message appears: "Phase 'Test Qualifying Round' created successfully"
9. **Verify:** Modal closes automatically
10. **Verify:** New phase appears in the Overview tab flow diagram and cards grid
11. **Test validation:** Click "+ Create New Phase" again
12. Leave phase name empty and click "✅ Create Phase"
13. **Verify:** Error message: "Phase name is required."
14. **Test category validation:** Deselect category (if possible) and submit
15. **Verify:** Error message: "Please select a category."
16. Click **"Cancel"** button
17. **Verify:** Modal closes without creating phase

**Expected Result:**
- Modal opens with all form fields
- Category dropdown populated from tournament categories
- Validation prevents submission without required fields
- Success creates phase and refreshes overview
- Cancel closes modal without action

---

### Feature: Phase Flow Diagram Visual Connections

**What was changed:** Visual representation of phase relationships showing how qualifying phases link to main draws and consolation draws.

**How to test (requires existing linked phases):**
1. **Set up test data:**
   - Create two phases: "Qualifying" and "Main Draw"
   - Go to "Link Phases" tab
   - Link "Qualifying" → "Main Draw"
2. **Return to "Phases Overview" tab**
3. **Verify:** Qualifying phase node appears above Main Draw node
4. **Verify:** Arrow/connector line appears between Qualifying and Main Draw
5. **Verify:** Qualifying node shows "→ Main Draw" in its bottom section
6. **Verify:** Phases are ordered by `sequenceOrder` (Qualifying first, Main Draw second)
7. **Create a consolation draw** (use "Consolation Draw" tab)
8. **Return to Overview**
9. **Verify:** Consolation phase appears in the flow
10. **Verify:** If consolation is linked, arrow shows the connection

**Expected Result:**
- Phases display in sequential order
- Arrows visually connect phases based on `nextPhaseId`
- Phase names shown in "next phase" labels
- Flow diagram updates after linking phases

---

### Feature: Backend Create Phase Endpoint

**Technical validation (optional - for developers):**

**What was changed:** Added `POST /api/phases/create` endpoint to backend supporting phase creation with automatic bracket generation.

**How to test (via API):**
1. **Open Postman or similar API client**
2. **Create POST request to:** `http://localhost:3000/api/phases/create`
3. **Add Authorization header:** `Bearer <admin_token>`
4. **Set request body (JSON):**
   ```json
   {
     "tournamentId": "trn_xxx",
     "categoryId": "cat_xxx",
     "phaseName": "API Test Phase",
     "phaseType": "CUSTOM",
     "bracketType": "SINGLE_ELIMINATION"
   }
   ```
5. **Send request**
6. **Verify response (201 Created):**
   ```json
   {
     "message": "Phase 'API Test Phase' created successfully",
     "bracket": { ... },
     "phase": { ... }
   }
   ```
7. **Verify database:** Check that bracket and phase records were created
8. **Test validation:** Send request with missing `phaseName`
9. **Verify response (400 Bad Request):**
   ```json
   {
     "message": "tournamentId, categoryId, and phaseName are required"
   }
   ```

**Expected Result:**
- Endpoint creates both Bracket and Phase entities
- New phase receives `sequenceOrder = maxExisting + 10`
- Validation enforces required fields
- Returns 201 status with created entities

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

**Phase 5:** ✅ ALL 5 FEATURES COMPLETE  
**Phase 6:** ✅ 1/5 FEATURES COMPLETE (Global ranking recalculation) — Remaining: super tiebreak, PDF templates, bracket config, player comments  
**Phase 7:** ✅ ALL 6 FEATURES COMPLETE (Phases overview, create phase, link phases, advance qualifiers, visual diagram, lucky loser)  
**Phase 8:** Testing & documentation (E2E tests, user guides, training videos)
