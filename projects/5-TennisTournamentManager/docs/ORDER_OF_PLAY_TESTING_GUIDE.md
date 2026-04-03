# Order of Play - Feature Testing Guide

## 📋 Overview

The **Order of Play** feature is the tournament scheduling system that assigns courts, dates, and times to matches. It manages the entire match scheduling workflow from automatic schedule generation to participant notifications.

## 🎯 Feature Purpose

The Order of Play feature enables tournament administrators to:
1. **Automatically schedule matches** using court optimization algorithms
2. **Manually reschedule individual matches** when conflicts arise
3. **Publish schedules** to notify all participants
4. **Display daily match schedules** grouped by court and time
5. **Manage match status transitions** (NOT_SCHEDULED → SCHEDULED → IN_PROGRESS → COMPLETED)

## 🔧 Core Functionality

### 1. Automatic Schedule Generation
**Endpoint:** `POST /api/order-of-play/generate`

**What it does:**
- Takes all matches with `status = NOT_SCHEDULED` from a tournament
- Assigns each match a court, date, and time slot
- Uses scheduling algorithms to optimize court usage and minimize conflicts
- Changes match status from `NOT_SCHEDULED` to `SCHEDULED`
- Creates OrderOfPlay records for each date

**Input Parameters:**
- `tournamentId`: The tournament to schedule
- `startDate`: When to begin scheduling matches
- `startTime`: Daily start time (e.g., "09:00")
- `matchDuration`: Expected match length in minutes (default: 90)
- `breakTime`: Break between matches in minutes (default: 15)
- `simultaneousMatches`: Max matches at once (optional)

**Expected Behavior:**
- ✅ Only schedules matches with status=NOT_SCHEDULED
- ✅ Respects court availability (uses all available courts)
- ✅ Avoids time slot overlaps on same court
- ✅ Distributes matches evenly across courts
- ✅ Updates match records with: courtId, courtName, scheduledTime, status=SCHEDULED

### 2. Manual Match Rescheduling
**Endpoint:** `PUT /api/order-of-play/:matchId/reschedule`

**What it does:**
- Allows admin to manually change a specific match's court, date, or time
- Validates that the new time slot doesn't conflict with existing matches
- Updates the OrderOfPlay record for that date
- Notifies participants of the schedule change

**Input Parameters:**
- `matchId`: The match to reschedule (URL parameter)
- `courtId`: New court assignment
- `scheduledTime`: New date and time

**Expected Behavior:**
- ✅ Validates court belongs to tournament
- ✅ Checks for time slot conflicts
- ✅ Updates match: courtId, courtName, scheduledTime, status=SCHEDULED
- ✅ Updates OrderOfPlay record
- ✅ Sends notifications to both participants

### 3. Publish Order of Play
**Endpoint:** `POST /api/order-of-play/:id/publish`

**What it does:**
- Marks an OrderOfPlay record as "published"
- Sends notifications to all participants with matches on that date
- Enables WebSocket real-time updates

**Expected Behavior:**
- ✅ Sets `isPublished = true` on OrderOfPlay record
- ✅ Sends email/push notifications to all scheduled match participants
- ✅ Emits WebSocket event for real-time UI updates
- ✅ Returns count of notified participants

### 4. View Order of Play
**Endpoint:** `GET /api/order-of-play?tournamentId=xxx&date=yyyy-mm-dd`

**What it does:**
- Retrieves the schedule for a specific tournament and date
- Shows all matches scheduled for that day
- Groups matches by court
- Displays match times, participants, and court assignments

**Expected Behavior:**
- ✅ Returns OrderOfPlay record if exists
- ✅ Returns empty structure if no matches scheduled for that date
- ✅ Only shows matches with status=SCHEDULED (not NOT_SCHEDULED)

### 5. View Tournament Schedule
**Endpoint:** `GET /api/order-of-play/tournament/:tournamentId/scheduled-matches`

**What it does:**
- Retrieves ALL scheduled matches for a tournament (all dates)
- Returns matches grouped by: (1) time-assigned, (2) awaiting time assignment

**Expected Behavior:**
- ✅ Returns only matches with status=SCHEDULED
- ✅ Excludes matches with status=NOT_SCHEDULED
- ✅ Includes participant names, court info, scheduled times
- ✅ Orders by: scheduledTime ASC, then round ASC

## ✅ Test Scenarios

### Scenario 1: Generate Schedule for New Tournament
**Setup:**
1. Create tournament with 8 participants
2. Create bracket with 7 matches (all status=NOT_SCHEDULED)
3. Add 2 courts to tournament

**Test Steps:**
1. Call `POST /api/order-of-play/generate` with:
   - tournamentId
   - startDate: tomorrow
   - startTime: "09:00"
   - matchDuration: 90
   - breakTime: 15
2. Verify response: 200 OK, scheduledCount = 7
3. Fetch matches: `GET /api/matches?bracketId=xxx`
4. Verify all 7 matches now have:
   - status = "SCHEDULED"
   - courtId assigned (either court 1 or court 2)
   - courtName populated
   - scheduledTime set to tomorrow or later

**Expected Result:**
- ✅ All matches transitioning from NOT_SCHEDULED → SCHEDULED
- ✅ Courts distributed evenly (3-4 matches per court)
- ✅ No time overlaps on same court
- ✅ First match starts at 09:00
- ✅ OrderOfPlay records created for each date

---

### Scenario 2: View Order of Play for Specific Date
**Setup:**
1. Tournament with scheduled matches across multiple dates
2. Some matches on Day 1, some on Day 2

**Test Steps:**
1. Call `GET /api/order-of-play?tournamentId=xxx&date=2026-04-05`
2. Verify response contains only matches for that specific date
3. Verify matches grouped by court
4. Verify matches sorted by time

**Expected Result:**
- ✅ Only Day 1 matches appear
- ✅ Matches grouped: Court A (match1, match2), Court B (match3, match4)
- ✅ Each match shows: participants, time, court

---

### Scenario 3: Manually Reschedule a Match
**Setup:**
1. Match scheduled for Court 1 at 10:00
2. Want to move it to Court 2 at 14:00

**Test Steps:**
1. Call `PUT /api/order-of-play/:matchId/reschedule` with:
   ```json
   {
     "courtId": "crt_002",
     "scheduledTime": "2026-04-05T14:00:00Z"
   }
   ```
2. Verify response: 200 OK
3. Fetch match: `GET /api/matches/:matchId`
4. Verify updated fields: courtId, courtName, scheduledTime

**Expected Result:**
- ✅ Match moved to new court and time
- ✅ Old OrderOfPlay record updated (match removed from 10:00 slot)
- ✅ New OrderOfPlay record updated (match added to 14:00 slot)
- ✅ Participants receive notification

---

### Scenario 4: Prevent Time Slot Conflicts
**Setup:**
1. Match A scheduled on Court 1 at 10:00 (90 min duration = ends 11:30)
2. Try to schedule Match B on Court 1 at 10:30

**Test Steps:**
1. Call `PUT /api/order-of-play/:matchBId/reschedule` with:
   ```json
   {
     "courtId": "crt_001",
     "scheduledTime": "2026-04-05T10:30:00Z"
   }
   ```
2. Expect response: 409 CONFLICT

**Expected Result:**
- ❌ Request rejected with error: "Time slot conflict: Another match is scheduled at this time on this court"
- ✅ Match B remains unscheduled or in original slot

---

### Scenario 5: Publish Order of Play
**Setup:**
1. OrderOfPlay record for 2026-04-05 with 4 matches
2. 8 participants involved (2 per match)
3. isPublished = false

**Test Steps:**
1. Call `POST /api/order-of-play/:oopId/publish`
2. Verify response: 200 OK, notifiedParticipants = 8
3. Fetch OrderOfPlay: `GET /api/order-of-play?tournamentId=xxx&date=2026-04-05`
4. Verify isPublished = true

**Expected Result:**
- ✅ OrderOfPlay.isPublished set to true
- ✅ 8 notifications sent (one per unique participant)
- ✅ WebSocket event emitted
- ✅ Participants' email/push notifications triggered

---

### Scenario 6: Match Status Workflow
**Test the complete match lifecycle:**

1. **Initial State:**
   - Bracket created
   - Match status = NOT_SCHEDULED
   - courtId = null
   - scheduledTime = null

2. **After Schedule Generation:**
   - Match status = SCHEDULED
   - courtId = "crt_001"
   - scheduledTime = "2026-04-05T10:00:00Z"

3. **Match Starts:**
   - Referee updates status = IN_PROGRESS
   - startTime recorded

4. **Match Ends:**
   - Result submitted
   - status = COMPLETED
   - endTime recorded
   - winnerId set

**Verify:**
- ✅ NOT_SCHEDULED matches don't appear in Order of Play
- ✅ SCHEDULED matches appear in Order of Play
- ✅ IN_PROGRESS matches remain visible
- ✅ COMPLETED matches show final score

---

### Scenario 7: Regenerate Bracket (Status Reset)
**Setup:**
1. Bracket with matches status=SCHEDULED
2. Admin wants to regenerate bracket

**Test Steps:**
1. Call `POST /api/brackets/:id/regenerate`
2. Verify all new matches have status=NOT_SCHEDULED
3. Verify old scheduled times are cleared
4. Re-run schedule generation
5. Verify new schedule created with fresh times

**Expected Result:**
- ✅ Regenerated matches start as NOT_SCHEDULED
- ✅ Old schedule data cleared
- ✅ Can re-schedule without conflicts

---

## 🎭 User Roles & Permissions

| Action | System Admin | Tournament Admin | Participant | Public |
|--------|--------------|------------------|-------------|---------|
| Generate Schedule | ✅ | ✅ | ❌ | ❌ |
| Reschedule Match | ✅ | ✅ | ❌ | ❌ |
| Publish OOP | ✅ | ✅ | ❌ | ❌ |
| View OOP | ✅ | ✅ | ✅ | ✅ |
| View Own Matches | ✅ | ✅ | ✅ | ❌ |

## 📊 Match Status Flow

```
BRACKET CREATED
    ↓
NOT_SCHEDULED (no court, no time)
    ↓ [Admin: Generate Schedule]
SCHEDULED (court + time assigned)
    ↓ [Referee: Start Match]
IN_PROGRESS
    ↓ [Submit Result]
COMPLETED
```

## 🔍 What to Test

### ✅ Functional Tests
- [ ] Generate schedule assigns courts and times to all NOT_SCHEDULED matches
- [ ] Generated schedule has no time conflicts on same court
- [ ] Matches can be manually rescheduled to different courts/times
- [ ] Rescheduling prevents double-booking same court at same time
- [ ] Publishing Order of Play sends notifications to participants
- [ ] View Order of Play shows only SCHEDULED matches (not NOT_SCHEDULED)
- [ ] Match status transitions correctly: NOT_SCHEDULED → SCHEDULED → IN_PROGRESS → COMPLETED

### ✅ Edge Cases
- [ ] Schedule generation with 0 courts (should fail)
- [ ] Schedule generation with 0 matches (should succeed with count=0)
- [ ] Schedule generation with more matches than court capacity (multi-day)
- [ ] Reschedule to invalid court (not in tournament)
- [ ] Reschedule to past date (should prevent or warn)
- [ ] Publish already-published Order of Play (should be idempotent)
- [ ] Regenerate bracket clears existing schedule

### ✅ UI/UX Tests
- [ ] Order of Play page displays matches grouped by court
- [ ] Matches sorted by time (earliest first)
- [ ] "NOT SCHEDULED" badge appears for NOT_SCHEDULED matches
- [ ] "View Match" button works for each scheduled match
- [ ] "Generate Schedule" button only visible to admins
- [ ] Schedule changes reflect in real-time (WebSocket)

### ✅ Integration Tests
- [ ] Schedule generation → database updates → UI refresh
- [ ] Publish → notifications sent → participants see schedule
- [ ] Reschedule → OrderOfPlay updated → participants notified
- [ ] Match completion → no longer editable → historical record

## 📝 Testing Checklist Summary

**Core Features:**
- [x] Matches created with status=NOT_SCHEDULED ✅ (confirmed working)
- [ ] Generate Schedule changes NOT_SCHEDULED → SCHEDULED
- [ ] Order of Play only shows SCHEDULED matches
- [ ] Manual reschedule works with conflict detection
- [ ] Publish sends notifications to participants
- [ ] View shows correct matches for date and tournament

**Status Workflow:**
- [x] NOT_SCHEDULED appears in dropdown ✅ (confirmed in screenshot)
- [ ] SCHEDULED matches have court assignment
- [ ] IN_PROGRESS matches are live
- [ ] COMPLETED matches show winner

**Admin Scenarios:**
- [ ] Generate schedule for new tournament
- [ ] Reschedule individual match
- [ ] Publish daily Order of Play
- [ ] Regenerate bracket (clears schedule)

**Participant Scenarios:**
- [ ] View own upcoming matches
- [ ] Receive notification when schedule published
- [ ] See court and time assignment
- [ ] Access match details from Order of Play

---

## 🚀 Quick Test Commands

```bash
# 1. Generate Schedule
curl -X POST http://localhost:3000/api/order-of-play/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tournamentId": "trn_xxx",
    "startDate": "2026-04-10",
    "startTime": "09:00",
    "matchDuration": 90,
    "breakTime": 15
  }'

# 2. View Order of Play
curl "http://localhost:3000/api/order-of-play?tournamentId=trn_xxx&date=2026-04-10"

# 3. Publish Order of Play
curl -X POST http://localhost:3000/api/order-of-play/oop_xxx/publish \
  -H "Authorization: Bearer $TOKEN"

# 4. Reschedule Match
curl -X PUT http://localhost:3000/api/order-of-play/mtc_xxx/reschedule \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courtId": "crt_002",
    "scheduledTime": "2026-04-10T14:00:00Z"
  }'
```

---

**Next Steps:** Test each scenario systematically, starting with the basic "Generate Schedule" flow, then move to manual rescheduling and publishing.
