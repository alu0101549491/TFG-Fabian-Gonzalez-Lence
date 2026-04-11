# Test Plan: Consolation Draw & Lucky Loser

## Current Test Data
- **Main Draw Tournament**: trn_3b7247a7
- **Main Draw Bracket**: brk_e601697d (Single Elimination)
- **Main Draw Category**: cat_2a6a3f82
- **Round of 16 Phase**: phs_5c881802
- **Current Registrations**: 12 ACCEPTED (8 DA seeds 1-8, 4 QUALIFIER seeds 9-12) + 2 PENDING

---

## Test 1: Lucky Loser Promotion

### Prerequisites
1. Need at least one ALTERNATE registration
2. Need at least one ACCEPTED DA registration to withdraw

### Test Scenario

**Step 1: Create an ALTERNATE registration**
Currently we have 2 PENDING registrations (reg_5fffa803, reg_d0315350). We'll accept one as ALTERNATE since the draw is full (12/16 slots).

```bash
# Accept first pending registration as ALTERNATE
curl -X PATCH 'http://localhost:3000/api/registrations/reg_5fffa803' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
    "status": "ACCEPTED",
    "acceptanceType": "ALTERNATE"
  }'
```

**Step 2: Verify ALTERNATE status**
```bash
curl -s 'http://localhost:3000/api/registrations?tournamentId=trn_3b7247a7' | \
  jq '.[] | select(.acceptanceType == "ALTERNATE")'
```

**Step 3: Withdraw a DIRECT_ACCEPTANCE participant**
Let's withdraw Seed #8 (usr_2f59988d) to create a vacancy:

```bash
# Use Lucky Loser promotion endpoint (it handles withdrawal + promotion)
curl -X POST 'http://localhost:3000/api/phases/promote-lucky-loser' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
    "withdrawnParticipantId": "usr_2f59988d",
    "phaseId": "phs_5c881802",
    "tournamentId": "trn_3b7247a7",
    "categoryId": "cat_2a6a3f82"
  }'
```

**Expected Result:**
- Response shows `promotedParticipantId` (alternate who got promoted)
- Withdrawn participant has `acceptanceType: "WITHDRAWN"`
- Former alternate has `acceptanceType: "LUCKY_LOSER"`

**Step 4: Verify promotion**
```bash
curl -s 'http://localhost:3000/api/registrations?tournamentId=trn_3b7247a7' | \
  jq '[.[] | select(.acceptanceType == "WITHDRAWN" or .acceptanceType == "LUCKY_LOSER")]'
```

---

## Test 2: Consolation Draw Creation

### Prerequisites
1. Need a completed first-round phase with losers
2. For Single Elimination, this would be Round of 16

### Test Scenario

**Step 1: Complete some Round of 16 matches** (optional - can create consolation before matches)
Navigate to the Matches page and mark 4-8 matches as completed to identify losers.

**Step 2: Create Consolation Draw via UI**
1. Go to Tournament Details → Phase Management tab
2. Click "Consolation Draw" sub-tab
3. Select "Round of 16" as Main Phase
4. The categoryId should auto-fill (cat_2a6a3f82)
5. Click "Create Consolation Draw"

**Step 3: Verify via API**
```bash
# Check new phases - should see a new "Round of 16 - Consolation" phase
curl -s 'http://localhost:3000/api/phases?bracketId=brk_e601697d' | \
  jq '.[] | {id, name, sequenceOrder, nextPhaseId}'
```

**Expected Result:**
- New phase created with name "Round of 16 - Consolation"
- Main phase (phs_5c881802) now has `nextPhaseId` pointing to consolation phase
- Consolation phase has `sequenceOrder: 101` (offset by 100)

**Step 4: Test phase linking via API (alternative to UI)**
```bash
curl -X POST 'http://localhost:3000/api/phases/create-consolation-draw' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -d '{
    "mainPhaseId": "phs_5c881802",
    "tournamentId": "trn_3b7247a7",
    "categoryId": "cat_2a6a3f82"
  }'
```

---

## Test 3: UI Workflow Testing

### Test Consolation Draw Tab
1. Navigate to `/tournaments/trn_3b7247a7`
2. Scroll down to Quick Actions → "Phase Management"
3. Click "Consolation Draw" tab
4. Select main phase from dropdown
5. Verify category auto-fills
6. Click "Create Consolation Draw"
7. Verify success message
8. Check that dropdown selection persists after creation

### Test Lucky Loser Tab
1. Stay on Phase Management page
2. Click "Lucky Loser" tab
3. Select phase from dropdown (should show only current tournament phases)
4. Enter withdrawn participant ID: usr_2f59988d
5. Verify category auto-fills
6. Click "Promote Lucky Loser"
7. Verify success message
8. Navigate to Registered Participants section
9. Verify acceptance type changes visible

---

## Verification Queries

### Check all phase linkings
```bash
curl -s 'http://localhost:3000/api/phases?bracketId=brk_e601697d' | \
  jq '[.[] | {name, nextPhaseId}]'
```

### Check acceptance type distribution
```bash
curl -s 'http://localhost:3000/api/registrations?tournamentId=trn_3b7247a7' | \
  jq 'group_by(.acceptanceType) | map({acceptanceType: .[0].acceptanceType, count: length})'
```

### Find alternates by registration date (oldest first)
```bash
curl -s 'http://localhost:3000/api/registrations?tournamentId=trn_3b7247a7' | \
  jq '[.[] | select(.acceptanceType == "ALTERNATE")] | sort_by(.registrationDate)'
```

---

## Expected Behavior Summary

**Consolation Draw:**
- ✅ Creates new phase with offset sequenceOrder
- ✅ Links main phase → consolation via nextPhaseId
- ✅ Category auto-fills from selected phase's bracket
- ✅ Phase selection persists after successful creation
- ✅ Source dropdown shows only current tournament phases

**Lucky Loser:**
- ✅ Marks withdrawn participant as WITHDRAWN
- ✅ Finds oldest ALTERNATE (by registrationDate)
- ✅ Promotes alternate to LUCKY_LOSER
- ✅ Returns both participant IDs in response
- ✅ Handles case when no alternates available
- ✅ Category auto-fills from selected phase's bracket

---

## Notes
- Both features use the phase linking infrastructure implemented in Issue 8
- Consolation draw creates structure but doesn't auto-populate losers (manual bracket generation needed)
- Lucky Loser promotion is immediate - no bracket regeneration required
- Both dropdowns use `sourcePhaseOptions` (filtered to current tournament only per Issue 15)
