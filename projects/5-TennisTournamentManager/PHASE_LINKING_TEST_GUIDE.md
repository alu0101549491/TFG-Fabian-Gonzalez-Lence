# Testing Guide: Phase Linking Feature

## Prerequisites
Phases are automatically created when brackets are generated. You need to set up tournaments first.

---

## Test Scenario 1: Qualifying → Main Draw (Single Elimination)

### Step 1: Create Qualifying Tournament
```bash
POST /api/tournaments
{
  "name": "Wimbledon Qualifying 2026",
  "startDate": "2026-04-15",
  "endDate": "2026-04-18",
  "location": "London",
  "surface": "Grass",
  "tournamentType": "QUALIFYING"
}
```

### Step 2: Create Category & Register Participants (at least 4-8 players)
```bash
POST /api/categories
POST /api/registrations (for each player)
```

### Step 3: Generate Qualifying Bracket
```bash
POST /api/brackets
{
  "tournamentId": "{{qualifying_tournament_id}}",
  "categoryId": "{{category_id}}",
  "bracketType": "SINGLE_ELIMINATION",
  "totalRounds": 3
}
```
✅ **Phases automatically created**: Round of 8, Quarterfinals, Semifinals, Final

### Step 4: Complete All Qualifying Matches
```bash
POST /api/matches/:matchId/result
{
  "winnerId": "{{player_uuid}}",
  "score": "6-4, 6-3"
}
```

### Step 5: Create Main Draw Tournament
```bash
POST /api/tournaments
{
  "name": "Wimbledon Main Draw 2026",
  "startDate": "2026-04-20",
  "endDate": "2026-05-03",
  "location": "London",
  "surface": "Grass",
  "tournamentType": "MAIN_DRAW"
}
```

### Step 6: Generate Main Draw Bracket
```bash
POST /api/brackets
{
  "tournamentId": "{{main_draw_tournament_id}}",
  "categoryId": "{{category_id}}",
  "bracketType": "SINGLE_ELIMINATION",
  "totalRounds": 4  // 16 players
}
```

### Step 7: Link Phases
```bash
POST /api/phases/link
{
  "sourcePhaseId": "{{qualifying_final_phase_id}}",
  "targetPhaseId": "{{main_draw_round1_phase_id}}"
}
```

---

## Test Scenario 2: Round Robin → Knockout (Auto-Advance Qualifiers)

### Step 1: Create Round Robin Tournament
```bash
POST /api/tournaments
{
  "name": "ATP Finals Group Stage",
  "startDate": "2026-04-15",
  "endDate": "2026-04-18"
}
```

### Step 2: Generate Round Robin Bracket
```bash
POST /api/brackets
{
  "tournamentId": "{{rr_tournament_id}}",
  "categoryId": "{{category_id}}",
  "bracketType": "ROUND_ROBIN",
  "totalRounds": 3  // Each player plays 3 matches
}
```
✅ **Phases created**: Round 1, Round 2, Round 3

### Step 3: Complete All Round Robin Matches
Complete all matches so standings are calculated.

### Step 4: Create Knockout Tournament
```bash
POST /api/tournaments
{
  "name": "ATP Finals Knockout Stage"
}

POST /api/brackets
{
  "tournamentId": "{{knockout_tournament_id}}",
  "categoryId": "{{category_id}}",
  "bracketType": "SINGLE_ELIMINATION",
  "totalRounds": 2  // Semifinals + Final
}
```

### Step 5: Auto-Advance Top 4 Qualifiers
```bash
POST /api/phases/advance-qualifiers
{
  "sourcePhaseId": "{{round_robin_last_phase_id}}",
  "targetPhaseId": "{{knockout_semifinal_phase_id}}",
  "qualifierCount": 4,
  "tournamentId": "{{knockout_tournament_id}}",
  "categoryId": "{{category_id}}"
}
```
✅ **System automatically**:
- Queries standings from Round Robin
- Identifies top 4 finishers
- Creates registrations in knockout tournament with `acceptanceType: QUALIFIER`
- Links the phases

---

## Test Scenario 3: Main Draw → Consolation Bracket

### Step 1: Create Main Draw & Complete Round 1
Follow steps from Scenario 1 to create a main draw with completed Round 1 matches.

### Step 2: Create Consolation Draw
```bash
POST /api/phases/consolation
{
  "mainPhaseId": "{{main_draw_round1_phase_id}}",
  "tournamentId": "{{main_draw_tournament_id}}",
  "categoryId": "{{category_id}}",
  "eliminationRound": 1  // Optional: which round losers enter
}
```
✅ **System creates**:
- New consolation bracket phase
- Links main phase losers to consolation

---

## Test Scenario 4: Lucky Loser Promotion

### Step 1: Register Participants with Alternates
When creating registrations, set some as alternates:
```bash
POST /api/registrations
{
  "tournamentId": "{{tournament_id}}",
  "categoryId": "{{category_id}}",
  "participantId": "{{player_uuid}}",
  "acceptanceType": "ALTERNATE"  // This player is on waiting list
}
```

### Step 2: Withdraw a Main Draw Player
```bash
POST /api/phases/promote-lucky-loser
{
  "withdrawnParticipantId": "{{injured_player_uuid}}",
  "phaseId": "{{main_draw_phase_id}}",
  "tournamentId": "{{tournament_id}}",
  "categoryId": "{{category_id}}"
}
```
✅ **System automatically**:
- Marks withdrawn player as `WITHDRAWN`
- Finds first alternate (by registration date)
- Promotes to `LUCKY_LOSER`

---

## How to Get Phase IDs

### Option 1: Query Phases by Bracket
```bash
GET /api/phases?bracketId={{bracket_id}}
```

### Option 2: Inspect Bracket Details
```bash
GET /api/brackets/:bracketId
```
Response includes phases array with IDs.

### Option 3: Query Matches (phases are nested)
```bash
GET /api/matches?bracketId={{bracket_id}}
```

---

## Quick Test Script (Using curl)

```bash
#!/bin/bash

# 1. Create qualifying tournament
QUAL_TOURNAMENT=$(curl -X POST http://localhost:3000/api/tournaments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Qualifying","startDate":"2026-04-15","endDate":"2026-04-18"}'
)

# 2. Create bracket (phases auto-generated)
BRACKET=$(curl -X POST http://localhost:3000/api/brackets \
  -H "Content-Type: application/json" \
  -d '{"tournamentId":"'$QUAL_TOURNAMENT_ID'","categoryId":"'$CATEGORY_ID'","bracketType":"SINGLE_ELIMINATION"}'
)

# 3. Get phase IDs
curl http://localhost:3000/api/phases?bracketId=$BRACKET_ID

# 4. Link phases
curl -X POST http://localhost:3000/api/phases/link \
  -H "Content-Type: application/json" \
  -d '{"sourcePhaseId":"'$SOURCE_PHASE_ID'","targetPhaseId":"'$TARGET_PHASE_ID'"}'
```

---

## Expected Results

### Successful Phase Linking
```json
{
  "message": "Phases linked successfully",
  "sourcePhase": {
    "id": "phs_...",
    "name": "Final",
    "nextPhaseId": "phs_..."  // ✅ Points to target phase
  },
  "targetPhase": {
    "id": "phs_...",
    "name": "Round of 16"
  }
}
```

### Successful Qualifier Advancement
```json
{
  "message": "Advanced 4 qualifiers successfully",
  "qualifiedParticipants": [
    "usr_participant1",
    "usr_participant2",
    "usr_participant3",
    "usr_participant4"
  ],
  "registrations": [...]
}
```

---

## Common Errors & Solutions

### ❌ "Both phases must have tournamentId"
**Cause**: Existing phases created before migration don't have tournamentId.
**Solution**: Run migration script:
```bash
cd backend
npx ts-node src/scripts/populate-phase-tournament-ids.ts
```

### ❌ "Cannot link phases from different tournaments"
**Cause**: sourcePhaseId and targetPhaseId belong to different tournaments.
**Solution**: Verify both phases share the same tournamentId.

### ❌ "Phase linking would create a cycle"
**Cause**: Target phase already links back to source.
**Solution**: Check phase chain - A→B→C→A creates cycle.

### ❌ "Not enough standings to advance N qualifiers"
**Cause**: Round Robin not completed or standings not calculated.
**Solution**: Complete all matches in Round Robin phase first.

---

## Frontend Test (Optional)

Once backend works, test via UI:

1. **Login as TOURNAMENT_ADMIN**
2. **Navigate to**: `/tournaments/:tournamentId/phases`
3. **Use tabbed interface**:
   - **Link Phases** tab
   - **Advance Qualifiers** tab
   - **Consolation Draw** tab
   - **Lucky Loser** tab

---

## Debugging Tips

### Check Phase Details
```bash
GET /api/phases/:phaseId
```

### Inspect Phase Links
```bash
GET /api/brackets/:bracketId
# Look at phases[].nextPhaseId
```

### Verify Standings
```bash
GET /api/standings?tournamentId={{id}}&categoryId={{id}}
```

### Check Registrations
```bash
GET /api/registrations?tournamentId={{id}}&categoryId={{id}}
# Look for acceptanceType: QUALIFIER, ALTERNATE, LUCKY_LOSER
```

---

## Summary

1. ✅ **Phases are auto-created** when you generate brackets
2. ✅ **No manual phase creation** needed
3. ✅ **Test workflow**: Create tournament → Generate bracket → Link phases
4. ✅ **All 4 operations** can be tested via API endpoints

**Start the backend and test!** 🚀
