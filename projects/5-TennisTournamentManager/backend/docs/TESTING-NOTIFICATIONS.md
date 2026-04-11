# Notification System Testing Guide

This guide explains how to test all four notification channels in the Tennis Tournament Manager application.

## Overview

The application supports **4 notification channels**:
1. **IN_APP** - In-app notifications viewable in the /notifications page
2. **EMAIL** - Email notifications sent to user's email address
3. **TELEGRAM** - Telegram bot messages
4. **WEB_PUSH** - Browser push notifications

## Prerequisites

### 1. Backend Server Running
```bash
cd backend
npm run dev
```

### 2. Frontend Server Running
```bash
cd projects/5-TennisTournamentManager
npm run dev
```

### 3. User Account
Create or use an existing user account. Make sure you know:
- Username
- Email address
- User ID (can be found in the database or from the API)

## Testing Methods

### Method 1: Automated Test Script (Recommended)

Run the test script to send notifications to a user:

```bash
cd backend
npx tsx scripts/test-notifications.ts
```

This script will:
- Connect to the database
- Show available users
- Send 4 different test notifications to the first user:
  - Match Update
  - Tournament Update  
  - Match Scheduled
  - Announcement
- Show which channels were used for each notification

**Expected Output:**
```
🔌 Connecting to database...
✅ Database connected

📋 Available test users:
  1. admin (admin@example.com) - ID: usr_xxx
     Telegram: Not configured

🎯 Sending test notifications to: admin

📤 Test 1: Match Update Notification
✅ Match notification created: ntf_xxx
   Channels: IN_APP, EMAIL

📤 Test 2: Tournament Update Notification
✅ Tournament notification created: ntf_xxx
   Channels: IN_APP, EMAIL

...
```

### Method 2: Manual Testing via Application

#### A. Test IN-APP Notifications

1. **Trigger notifications** by performing actions in the app:
   - Create a tournament match
   - Update match results
   - Create announcements
   - Schedule matches

2. **View notifications**:
   - Click the 🔔 bell icon in the header
   - Navigate to `/notifications` page
   - Verify notifications appear in real-time (via WebSocket)

3. **Test interactions**:
   - Click on a notification to mark it as read
   - Verify visual distinction between read/unread
   - Click "Mark All as Read" button

#### B. Test EMAIL Notifications

**Setup:**
1. Configure email credentials in `backend/.env`:
   ```env
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-app-password
   ```

2. Ensure user has valid email in database

**Test:**
1. Enable email notifications in user preferences:
   - Go to Profile → Privacy Settings
   - Enable "Email" channel
   - Enable notification types you want to receive

2. Run test script or trigger notifications manually

3. Check the user's email inbox

**Expected Result:**
- Email received with notification content
- Proper formatting with title and message
- Links to relevant resources (if applicable)

#### C. Test TELEGRAM Notifications

**Setup:**
1. Create a Telegram Bot:
   - Talk to [@BotFather](https://t.me/botfather) on Telegram
   - Create a new bot with `/newbot`
   - Save the bot token

2. Configure in `backend/.env`:
   ```env
   TELEGRAM_BOT_TOKEN=your-bot-token-here
   ```

3. Link user account to Telegram:
   - Start chat with your bot
   - Send `/start` command
   - Get your chat ID (use @userinfobot)
   - Update user's `telegramChatId` in database:
     ```sql
     UPDATE users SET telegram_chat_id = 'your-chat-id' WHERE username = 'your-username';
     ```

**Test:**
1. Enable Telegram notifications in user preferences:
   - Go to Profile → Privacy Settings
   - Enable "Telegram" channel
   - Enable notification types

2. Run test script or trigger notifications

3. Check Telegram bot chat

**Expected Result:**
- Messages received in Telegram chat
- Proper formatting with emoji and content
- Instant delivery

#### D. Test WEB PUSH Notifications

**Setup:**
1. Generate VAPID keys (if not already done):
   ```bash
   cd backend
   npx web-push generate-vapid-keys
   ```

2. Configure in `backend/.env`:
   ```env
   VAPID_PUBLIC_KEY=your-public-key
   VAPID_PRIVATE_KEY=your-private-key
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

3. Ensure frontend has public key:
   - Check `src/environments/environment.ts`
   - Add VAPID public key if missing

**Test:**
1. Open application in browser (Chrome/Firefox/Edge)

2. Enable Web Push notifications:
   - Go to Profile → Privacy Settings
   - Click "Enable Browser Notifications"
   - Accept browser permission prompt
   - Enable "Web Push" channel
   - Enable notification types

3. Run test script or trigger notifications

4. Verify browser notification appears

**Expected Result:**
- Browser shows notification popup
- Notification includes title, message, and icon
- Clicking notification opens the app
- Works even when browser tab is not active

## Notification Preferences

Users can control which notifications they receive:

### Via Privacy Settings Page
1. Navigate to Profile → Privacy Settings
2. Toggle channels: IN_APP, EMAIL, TELEGRAM, WEB_PUSH
3. Toggle notification types:
   - Match Updates
   - Tournament Updates
   - Match Scheduled
   - Match Results
   - Registration Status
   - Announcements

### Via API (for testing)
```bash
# Get user preferences
curl -X GET http://localhost:3000/api/notification-preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update preferences
curl -X PATCH http://localhost:3000/api/notification-preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inAppEnabled": true,
    "emailEnabled": true,
    "telegramEnabled": false,
    "webPushEnabled": true,
    "matchUpdates": true,
    "tournamentUpdates": true
  }'
```

## Debugging

### Check Notification Database
```sql
-- View all notifications for a user
SELECT * FROM notifications 
WHERE user_id = 'usr_xxx' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check notification preferences
SELECT * FROM notification_preferences 
WHERE user_id = 'usr_xxx';

-- Check web push subscriptions
SELECT * FROM push_subscriptions 
WHERE user_id = 'usr_xxx';
```

### Check Backend Logs
The backend logs show notification delivery:
- 📧 Email notifications: `Email notification sent to user@example.com`
- ✈️ Telegram notifications: `Telegram notification sent to chatId: xxx`
- 📱 Web Push notifications: `Web Push notifications sent to N device(s)`
- ⚠️ Warnings: `Notification blocked by user preferences`

### Common Issues

**1. No notifications appearing in-app**
- Check if notifications were created in database
- Verify WebSocket connection (check browser console)
- Check user authentication token

**2. Email not received**
- Verify SMTP configuration in `.env`
- Check spam folder
- Verify user's email address in database
- Check backend logs for email errors

**3. Telegram not working**
- Verify bot token is correct
- Check if user's `telegramChatId` is set
- Ensure user enabled Telegram in preferences
- Start chat with bot (send `/start`)

**4. Web Push not working**
- Check browser supports Web Push (Chrome, Firefox, Edge)
- Verify VAPID keys are configured
- Check browser permission was granted
- Verify subscription exists in database
- Check HTTPS is enabled (required for production)

## Testing Checklist

- [ ] IN-APP notifications appear in /notifications page
- [ ] Real-time delivery works (WebSocket)
- [ ] Mark as read functionality works
- [ ] Mark all as read works
- [ ] Unread count displays correctly in bell icon
- [ ] Email notifications received
- [ ] Telegram notifications received (if configured)
- [ ] Web Push notifications received (if subscribed)
- [ ] Notification preferences persist correctly
- [ ] Disabling channels prevents notifications
- [ ] Multiple devices receive web push (if applicable)

## Production Considerations

1. **Rate Limiting**: Implement rate limiting for notification creation
2. **Batch Processing**: For bulk notifications, use background jobs
3. **Error Handling**: Monitor and log notification failures
4. **HTTPS**: Required for Web Push in production
5. **Email Deliverability**: Use proper SPF/DKIM records
6. **Telegram Bot**: Keep bot token secure
7. **VAPID Keys**: Store securely, don't expose public key client-side unnecessarily

## References

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Nodemailer Documentation](https://nodemailer.com/)
- [WebSocket Documentation](https://socket.io/docs/v4/)
