# Testing Notification System (Backend)

## Prerequisites
- Backend server running (`npm run dev` in backend directory)
- Database connection established
- At least 2 test users (participants) and 1 admin user in database

## Test Credentials
Use existing test accounts or create new ones:
- **Player 1**: `player1@test.com` / password
- **Player 2**: `player2@test.com` / password
- **Admin**: `admin@tennistournament.com` / `admin123`

---

## Test 1: Result Submission Notification

### Steps:
1. Login as Player 1 and get auth token
2. Find a match where Player 1 is participant1 or participant2
3. Submit result:

```bash
POST /api/matches/{matchId}/result
Authorization: Bearer {player1_token}
Content-Type: application/json

{
  "winnerId": "player1_id",
  "setScores": ["6-4", "6-3"],
  "player1Games": 12,
  "player2Games": 7,
  "playerComments": "Good match"
}
```

### Expected Result:
- Response: 201 Created with MatchResult entity
- MatchResult.confirmationStatus = "PENDING_CONFIRMATION"

### Verify Notification Created:
```sql
SELECT * FROM notifications 
WHERE "userId" = 'player2_id' 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

**Should show:**
- `type`: `RESULT_ENTERED`
- `title`: `🎾 Match Result Pending Confirmation`
- `message`: `{Player1 Name} has entered a result for your match. Please review and confirm or dispute.`
- `isRead`: `false`
- `metadata`: `{"matchId": "mch_..."}`

---

## Test 2: Result Confirmation Notification

### Steps:
1. Login as Player 2 (the opponent)
2. Confirm the pending result:

```bash
POST /api/matches/{matchId}/result/confirm
Authorization: Bearer {player2_token}
```

### Expected Result:
- Response: 200 OK with updated MatchResult
- MatchResult.confirmationStatus = "CONFIRMED"
- Match.status = "COMPLETED"
- Match.winnerId = set to winner

### Verify Notification Created:
```sql
SELECT * FROM notifications 
WHERE "userId" = 'player1_id' 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

**Should show:**
- `type`: `RESULT_ENTERED`
- `title`: `✅ Match Result Confirmed`
- `message`: `{Player2 Name} has confirmed the match result. The match is now official.`
- `isRead`: `false`
- `metadata`: `{"matchId": "mch_..."}`

---

## Test 3: Result Dispute Notification

### Steps:
1. Submit another result as Player 1
2. Login as Player 2
3. Dispute the result:

```bash
POST /api/matches/{matchId}/result/dispute
Authorization: Bearer {player2_token}
Content-Type: application/json

{
  "disputeReason": "The score is incorrect. I won the second set 7-5, not 3-6."
}
```

### Expected Result:
- Response: 200 OK with updated MatchResult
- MatchResult.confirmationStatus = "DISPUTED"
- MatchResult.disputeReason = set to provided reason

### Verify Notifications Created (Multiple):
```sql
SELECT * FROM notifications 
WHERE "type" = 'RESULT_ENTERED' 
  AND "title" LIKE '%Disputed%'
ORDER BY "createdAt" DESC;
```

**Should show multiple notifications (one per admin):**
- `type`: `RESULT_ENTERED`
- `title`: `⚠️ Match Result Disputed`
- `message`: `{Player2 Name} has disputed a match result. Reason: "{dispute reason}". Please review and resolve.`
- `isRead`: `false`
- `metadata`: `{"matchId": "mch_...", "disputeReason": "..."}`
- One notification per admin user (SYSTEM_ADMIN and TOURNAMENT_ADMIN roles)

---

## Test 4: WebSocket Real-Time Delivery

### Steps:
1. Open browser console on Player 2's session
2. Connect to WebSocket (should auto-connect when logged in)
3. Listen for notifications:

```javascript
// In browser console
socket.on('notification:new', (data) => {
  console.log('📬 New notification:', data);
});
```

4. Have Player 1 submit a result from another browser/session
5. Check Player 2's console for real-time notification

### Expected:
- Console shows: `📬 New notification: {id: "ntf_...", type: "RESULT_ENTERED", ...}`
- Notification appears without refresh

---

## Test 5: Admin Notification List

### Steps:
1. Login as admin
2. Get notifications:

```bash
GET /api/notifications
Authorization: Bearer {admin_token}
```

### Expected Result:
- Response: 200 OK with array of notifications
- Should include disputed match notifications if Test 3 was run
- Sorted by `createdAt` DESC (newest first)
- Maximum 50 notifications returned

---

## Verification Queries

### Count notifications by type:
```sql
SELECT type, COUNT(*) as count 
FROM notifications 
GROUP BY type;
```

### Recent notifications for specific user:
```sql
SELECT 
  n.id,
  n.type,
  n.title,
  n.message,
  n."isRead",
  n."createdAt",
  u."email" as recipient_email
FROM notifications n
JOIN users u ON u.id = n."userId"
WHERE n."userId" = 'user_id_here'
ORDER BY n."createdAt" DESC
LIMIT 10;
```

### Check WebSocket event log (if enabled):
```bash
# Check backend console output
# Should see: "Notification emitted to user:player_id"
```

---

## Troubleshooting

### No notifications created
- Check backend logs for errors
- Verify NotificationService is imported in MatchController
- Check if match has participant1/participant2 populated with user objects
- Verify database connection is active

### WebSocket not delivering
- Check if WebSocket server is running
- Verify `emitNotification()` is being called
- Check browser WebSocket connection status
- Verify user is connected to correct room: `user:{userId}`

### Admin notifications missing
- Verify there are users with SYSTEM_ADMIN or TOURNAMENT_ADMIN roles
- Check `getAdminUserIds()` query returns results
- Check backend logs for errors during admin notification creation

---

## Success Criteria

✅ **All tests pass if:**
1. Notifications appear in database after each action
2. Notification titles and messages are correct
3. Metadata contains match IDs
4. Admin users receive dispute notifications
5. WebSocket delivers notifications in real-time
6. GET /api/notifications returns correct notifications

**Backend notification system is fully functional!** 🎉
