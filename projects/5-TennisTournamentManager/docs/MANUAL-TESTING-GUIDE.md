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
