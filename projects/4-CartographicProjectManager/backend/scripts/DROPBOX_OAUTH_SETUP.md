# Dropbox OAuth 2.0 Setup - Refresh Token

## Overview

This guide explains how to obtain a permanent **Refresh Token** for Dropbox integration. With this setup, your access tokens will be automatically renewed when they expire (every 4 hours), so you never have to manually regenerate tokens again.

## Prerequisites

1. A Dropbox app created at [https://www.dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)
2. App Key and App Secret from your Dropbox app
3. Node.js and TypeScript installed

## Step 1: Configure Your Dropbox App

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Select your application
3. In the **Settings** tab, find **OAuth 2**:
   - Make sure **Access token expiration** is set to **Short-lived** (4 hours)
   - Note down your **App key** and **App secret**

## Step 2: Update Environment Variables

Edit `backend/.env` and add your Dropbox credentials:

```bash
# Dropbox App Credentials
DROPBOX_APP_KEY=your_app_key_here
DROPBOX_APP_SECRET=your_app_secret_here

# These will be filled by the script
DROPBOX_ACCESS_TOKEN=
DROPBOX_REFRESH_TOKEN=
```

## Step 3: Run the OAuth Flow Script

Run the following command from the `backend` directory:

```bash
npm run get-dropbox-token
```

Or using ts-node directly:

```bash
npx ts-node scripts/get-dropbox-refresh-token.ts
```

## Step 4: Follow the Interactive Prompts

The script will guide you through the OAuth flow:

### 4.1 Authorize the App

The script will display an authorization URL like:

```
Visit this URL in your browser:
https://www.dropbox.com/oauth2/authorize?client_id=...&response_type=code&token_access_type=offline
```

1. **Copy the URL** and open it in your browser
2. **Login to Dropbox** (if not already logged in)
3. **Click "Allow"** to grant permissions to your app
4. You will be redirected to a URL like:
   ```
   http://localhost:3000/auth/dropbox/callback?code=XXXXXXXXXXXXXXXXXX
   ```
5. **Copy the code** from the URL (the value after `code=`)

### 4.2 Paste the Authorization Code

The script will prompt:

```
Paste the authorization code from the URL (the value after "code="): 
```

Paste the code you copied from the redirect URL and press Enter.

### 4.3 Get Your Tokens

The script will exchange the code for tokens and display:

```
✅ Tokens obtained successfully!

Access Token (expires in 4 hours):
sl.XXXXXXXXXXXXX...

Refresh Token (permanent):
YYYYYYYYYYYYYY...
```

### 4.4 Update .env File

The script will ask:

```
Would you like to update the .env file automatically? (y/n):
```

- Type `y` to automatically update your `.env` file
- Type `n` to manually copy the tokens

## Step 5: Restart the Backend

After obtaining the refresh token, restart your backend server:

```bash
npm run dev
```

The backend will now automatically renew the access token when it expires.

## How It Works

### Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Initial Setup (One-time OAuth flow)                      │
│    User authorizes → Get Access Token + Refresh Token       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Normal Operation                                          │
│    Access Token valid → Use for API calls                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Token Expiration (After 4 hours)                         │
│    API returns 401 → Automatically refresh using            │
│    Refresh Token → Get new Access Token → Retry API call    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Repeat Step 2                                            │
│    Continue with new Access Token                            │
└─────────────────────────────────────────────────────────────┘
```

### Automatic Renewal

The `DropboxService` class automatically handles token renewal:

- When any Dropbox API call returns a `401 Unauthorized` error
- The service uses the Refresh Token to get a new Access Token
- The failed operation is automatically retried with the new token
- All of this happens transparently without any user intervention

## Troubleshooting

### Error: "Cannot refresh token: refresh token, app key, or app secret not configured"

Make sure all required environment variables are set in `.env`:
- `DROPBOX_APP_KEY`
- `DROPBOX_APP_SECRET`
- `DROPBOX_REFRESH_TOKEN`

### Error: "Failed to refresh token: 400"

- Check that your App Key and App Secret are correct
- Make sure the Refresh Token hasn't been revoked
- Verify that your Dropbox app is configured for short-lived tokens

### Authorization URL doesn't work

- Make sure your Dropbox app has the correct permissions
- Check that the App Key in the URL matches your app
- Try in an incognito/private browser window

### Tokens not saving to .env

- Make sure you have write permissions to the `.env` file
- Check that the file exists in `backend/.env`
- Try manually copying the tokens from the script output

## Security Notes

⚠️ **Important**: 

- **Never commit** `.env` file to version control
- **Keep your Refresh Token secure** - it provides long-term access to your Dropbox
- **Rotate tokens** periodically for better security
- The `.env.example` file should only contain placeholder values

## Additional Resources

- [Dropbox OAuth Guide](https://www.dropbox.com/developers/documentation/http/documentation#oauth2-authorize)
- [Dropbox API Documentation](https://www.dropbox.com/developers/documentation/http/documentation)
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
