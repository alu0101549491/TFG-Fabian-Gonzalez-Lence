# UI Guide: Phase Linking Step-by-Step

This guide shows how to manually create and link multi-phase tournaments using the web interface.

---

## Prerequisites

- ✅ Backend running at `http://localhost:3000`
- ✅ Frontend running at `http://localhost:4201`
- ✅ Admin account credentials (TOURNAMENT_ADMIN or SYSTEM_ADMIN)

---

## Part 1: Create Qualifying Tournament (Round Robin)

### Step 1: Login as Admin
1. Navigate to `http://localhost:4201/login`
2. Use tournament admin credentials:
   - Email: `tournament@tennistournament.com`
   - Password: `tourney123`

### Step 2: Create Qualifying Tournament
1. Click **"Create Tournament"** (or navigate to `/tournaments/create`)
2. Fill in tournament details:
   ```
   Name: Qualifying Tournament 2026
   Location: La Laguna Tennis Academy
   Start Date: 2026-05-01
   End Date: 2026-05-05
   Registration Open: 2026-04-01
   Registration Close: 2026-04-28
   Surface: Clay
   Tournament Type: Singles
   Max Participants: 8
   Registration Fee: 15.00
   ```
3. Click **"Create Tournament"**
4. **Note the Tournament ID** from the URL (e.g., `/tournaments/trn_xxxxx`)

### Step 3: Create Category
1. On the tournament page, click **"Add Category"**
2. Fill in:
   ```
   Name: Open Singles - Qualifying
   Gender: Open
   Age Group: Open
   Max Participants: 8
   ```
3. Click **"Create Category"**
4. **Note the Category ID**

### Step 4: Register Players
1. Navigate to **"Registrations"** tab
2. For each of 8 players:
   - Click **"Register Player"**
   - Select player from dropdown
   - Click **"Submit"**
3. Accept all registrations:
   - Click on each registration
   - Click **"Accept Registration"**

### Step 5: Close Registration
1. Go back to tournament details
2. Click **"Change Status"**
3. Select **"Registration Closed"**
4. Click **"Update Status"**

### Step 6: Prepare Draw
1. Click **"Change Status"** again
2. Select **"Draw Pending"**
3. Click **"Update Status"**

### Step 7: Generate Bracket
1. Click **"Generate Bracket"** button
2. Fill in:
   ```
   Bracket Type: Round Robin
   Total Rounds: 7 (each player plays everyone)
   ```
3. Click **"Generate"**
4. **Phases are automatically created!**

### Step 8: Complete All Matches
1. Navigate to **"Matches"** tab
2. For each match:
   - Click **"Enter Result"**
   - Select winner
   - Enter score (e.g., "6-4, 6-3")
   - Click **"Submit Result"**
   - Click **"Confirm Result"**
3. Complete all 28 matches (8 players × 7 rounds)

### Step 9: Note Phase IDs
1. Open browser DevTools (F12)
2. Navigate to **Network** tab
3. Filter by `phases`
4. Find the GET request to `/api/phases?bracketId=...`
5. Look at the response JSON
6. **Copy the phase IDs** (especially the last round)

**Alternative**: Check database directly:
```sql
SELECT id, name, "order" FROM phases WHERE "bracketId" = 'brk_xxxxx' ORDER BY "order";
```

---

## Part 2: Create Main Draw Tournament (Single Elimination)

### Step 1: Create Main Draw Tournament
1. Click **"Create Tournament"** again
2. Fill in:
   ```
   Name: Main Draw Tournament 2026
   Location: La Laguna Tennis Academy
   Start Date: 2026-05-10
   End Date: 2026-05-17
   Registration Open: 2026-04-01
   Registration Close: 2026-05-08
   Surface: Clay
   Tournament Type: Singles
   Max Participants: 16
   Registration Fee: 50.00
   ```
3. Click **"Create Tournament"**

### Step 2: Create Category
1. Click **"Add Category"**
2. Fill in:
   ```
   Name: Open Singles - Main Draw
   Gender: Open
   Age Group: Open
   Max Participants: 16
   ```

### Step 3: Register Direct Acceptances
1. Register 8 top-seeded players (direct acceptances)
2. Accept all registrations
3. Assign seed numbers (1-8)

### Step 4: Register Alternates
1. Register 2 additional players
2. Edit each registration:
   - Click **"Edit Registration"**
   - Change **Acceptance Type** to **"Alternate"**
   - Click **"Save"**

### Step 5: Close Registration & Generate Bracket
1. Close registration → Draw Pending (same as qualifying)
2. Click **"Generate Bracket"**
3. Fill in:
   ```
   Bracket Type: Single Elimination
   Total Rounds: 4 (16 players = R16, QF, SF, F)
   ```
4. Click **"Generate"**

### Step 6: Get Main Draw Phase IDs
Same as Step 9 in Part 1 - note the phase IDs from DevTools or database.

---

## Part 3: Link Phases Using the UI

### Step 1: Navigate to Phase Management
1. Go to the **Main Draw Tournament** page
2. In the browser URL, add `/phases` to the tournament URL:
   ```
   http://localhost:4201/tournaments/trn_MAIN_DRAW_ID/phases
   ```
3. You'll see the **Phase Management** admin interface with 4 tabs

---

## Phase Management Operations

### Tab 1: Link Phases

**Purpose**: Connect qualifying final to main draw first round

1. Click **"Link Phases"** tab
2. Fill in form:
   ```
   Source Phase ID: phs_xxxxx (qualifying final phase)
   Target Phase ID: phs_yyyyy (main draw Round 1 phase)
   ```
3. Click **"Link Phases"**
4. ✅ Success message: "Phases linked successfully"

**What happens**:
- Source phase's `nextPhaseId` is set to target phase ID
- Creates logical connection: Qualifying → Main Draw

---

### Tab 2: Advance Qualifiers

**Purpose**: Auto-promote top N finishers from Round Robin to Main Draw

1. Click **"Advance Qualifiers"** tab
2. Fill in form:
   ```
   Source Phase ID: phs_xxxxx (qualifying last round)
   Target Phase ID: phs_yyyyy (main draw Round 1)
   Number of Qualifiers: 4
   Category ID: cat_yyyyy (main draw category)
   ```
3. Click **"Advance Qualifiers"**
4. ✅ Success: "Advanced 4 qualifiers successfully. Qualified: 4 participants."

**What happens**:
- System queries standings from qualifying tournament
- Identifies top 4 finishers by rank/points
- **Automatically creates registrations** in main draw tournament
- Sets acceptance type to `QUALIFIER`
- Links phases automatically

**Result**: 4 new players appear in main draw registrations with "Qualifier" badge

---

### Tab 3: Consolation Draw

**Purpose**: Create second-chance bracket for first-round losers

**NOTE**: You need to complete at least Round 1 matches first!

1. Complete Round 1 matches in main draw
2. Click **"Consolation Draw"** tab
3. Fill in form:
   ```
   Main Phase ID: phs_yyyyy (main draw Round 1)
   Category ID: cat_yyyyy
   Elimination Round: 1 (optional - which round losers enter)
   ```
4. Click **"Create Consolation Draw"**
5. ✅ Success: "Consolation phase created successfully"

**What happens**:
- Creates new Phase entity for consolation bracket
- Links main phase to consolation phase
- First-round losers can be moved to consolation

---

### Tab 4: Lucky Loser

**Purpose**: Promote alternate when a player withdraws

**Prerequisites**: You must have alternates registered (acceptance type = ALTERNATE)

1. Click **"Lucky Loser"** tab
2. Fill in form:
   ```
   Withdrawn Participant ID: usr_xxxxx (player who withdrew)
   Phase ID: phs_yyyyy (main draw phase)
   Category ID: cat_yyyyy
   ```
3. Click **"Promote Lucky Loser"**
4. ✅ Success: "Participant withdrawn, promoted participant: usr_zzzzz"

**What happens**:
- Marks withdrawn player as `WITHDRAWN`
- Finds first alternate (by registration date)
- Promotes to `LUCKY_LOSER` status
- They can now participate in matches

---

## How to Get IDs Without DevTools

### Method 1: From URL
When viewing a tournament/category/bracket, the ID is in the URL:
```
/tournaments/trn_12345678  ← Tournament ID
/brackets/brk_87654321     ← Bracket ID
```

### Method 2: Database Query
```sql
-- Get tournament IDs
SELECT id, name FROM tournaments ORDER BY "createdAt" DESC LIMIT 5;

-- Get category IDs for a tournament
SELECT id, name FROM categories WHERE "tournamentId" = 'trn_xxxxx';

-- Get bracket ID for a category
SELECT id, "bracketType" FROM brackets WHERE "categoryId" = 'cat_xxxxx';

-- Get phases for a bracket
SELECT id, name, "order", "sequenceOrder" 
FROM phases 
WHERE "bracketId" = 'brk_xxxxx' 
ORDER BY "order";

-- Get participant/user IDs
SELECT id, "firstName", "lastName", email FROM users WHERE role = 'PLAYER';
```

### Method 3: API Requests
Open browser console (F12) and run:

```javascript
// Get qualifying phases
fetch('http://localhost:3000/api/phases?bracketId=brk_QUALIFYING_ID', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
  .then(r => r.json())
  .then(phases => console.table(phases.map(p => ({id: p.id, name: p.name, order: p.order}))));

// Get main draw phases
fetch('http://localhost:3000/api/phases?bracketId=brk_MAIN_DRAW_ID', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
  .then(r => r.json())
  .then(phases => console.table(phases.map(p => ({id: p.id, name: p.name, order: p.order}))));

// Get tournament registrations
fetch('http://localhost:3000/api/registrations?tournamentId=trn_xxxxx&categoryId=cat_xxxxx', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
  .then(r => r.json())
  .then(data => console.table(data.map(r => ({
    id: r.id,
    participant: r.participant?.firstName + ' ' + r.participant?.lastName,
    acceptanceType: r.acceptanceType,
    status: r.status
  }))));
```

### Method 4: Add UI Display (Recommended for Development)

**Quick fix**: Add a "Copy ID" button to tournament/bracket cards:

```typescript
// In the template
<button (click)="copyToClipboard(tournament.id)">
  📋 Copy ID
</button>

// In the component
copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  alert(`Copied: ${text}`);
}
```

---

## Complete UI Testing Workflow

### 🎯 Test Scenario 1: Qualifying to Main Draw

1. ✅ Create qualifying tournament (Round Robin, 8 players)
2. ✅ Complete all 28 matches
3. ✅ Create main draw tournament (Single Elimination, 16 players)
4. ✅ Register 8 direct + 2 alternates
5. ✅ Navigate to `/tournaments/:mainDrawId/phases`
6. ✅ Use **"Link Phases"** tab to link qualifying final → main R1
7. ✅ Use **"Advance Qualifiers"** to promote top 4
8. ✅ Verify 4 new registrations appear with "Qualifier" badge

### 🎯 Test Scenario 2: Consolation Draw

1. ✅ Complete Round 1 matches in main draw
2. ✅ Navigate to `/tournaments/:mainDrawId/phases`
3. ✅ Use **"Consolation Draw"** tab
4. ✅ Verify consolation phase created

### 🎯 Test Scenario 3: Lucky Loser

1. ✅ Have alternates registered
2. ✅ Navigate to `/tournaments/:mainDrawId/phases`
3. ✅ Use **"Lucky Loser"** tab with withdrawn player ID
4. ✅ Verify alternate promoted

---

## Tips & Best Practices

### ✨ Shortcuts
- Keep browser console open to quickly check phase IDs
- Bookmark the phase management URL: `/tournaments/:id/phases`
- Use the script for quick setup, then test UI features

### ⚠️ Common Mistakes
- **Forgetting to close registration** before generating bracket
- **Not completing qualifying matches** before advancing qualifiers
- **Using wrong category ID** (qualifying vs main draw)
- **Trying to link phases from different tournaments**

### 🔧 Troubleshooting
- **"Both phases must have tournamentId"**: Run migration script
- **"Cannot link different tournaments"**: Verify both phases from same tournament
- **"Not enough standings"**: Complete all matches in source phase
- **"No alternates available"**: Register players with acceptance type ALTERNATE

---

## Summary: UI vs Script

| Feature | UI (Manual) | Script (Automated) |
|---------|-------------|-------------------|
| **Setup Time** | ~30-45 minutes | ~2 minutes |
| **Match Completion** | Manual (28+ clicks) | Automatic |
| **ID Discovery** | DevTools/Database | Printed to console |
| **Testing Flexibility** | Full control | Pre-configured |
| **Learning Value** | High (see all steps) | Low (black box) |
| **Best For** | Understanding flow | Quick testing |

**Recommendation**: 
- ✅ Use **script** for initial setup and rapid testing
- ✅ Use **UI** to verify user experience and edge cases
- ✅ Combine both: script creates tournaments, UI tests linking operations

---

## Next Steps

1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run dev` (in main project folder)
3. Choose your path:
   - **Quick Test**: Run `npm run setup:phase-linking` then test UI
   - **Full Manual**: Follow this guide step-by-step
4. Navigate to `/tournaments/:id/phases` to access Phase Management UI

🎾 Happy testing!
