/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 25, 2026
 * @file scripts/get-dropbox-refresh-token.ts
 * @desc Script to obtain Dropbox refresh token for OAuth 2.0
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const APP_KEY = process.env.DROPBOX_APP_KEY;
const APP_SECRET = process.env.DROPBOX_APP_SECRET;
const REDIRECT_URI = 'http://localhost:3000/auth/dropbox/callback';

/**
 * Main function to obtain Dropbox refresh token
 */
async function main(): Promise<void> {
  console.log('\n🔐 Dropbox OAuth 2.0 - Refresh Token Setup\n');
  console.log('=' .repeat(60));

  // Validate environment variables
  if (!APP_KEY || !APP_SECRET) {
    console.error('❌ Error: DROPBOX_APP_KEY and DROPBOX_APP_SECRET must be set in .env');
    console.error('   Please add them first from: https://www.dropbox.com/developers/apps');
    process.exit(1);
  }

  console.log('✅ App Key and Secret found\n');

  // Step 1: Generate authorization URL
  const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&response_type=code&token_access_type=offline`;

  console.log('📋 STEP 1: Authorize the application\n');
  console.log('Visit this URL in your browser:');
  console.log('\x1b[36m%s\x1b[0m', authUrl);
  console.log('\n');
  console.log('After authorizing, you will be redirected to a URL like:');
  console.log('http://localhost:3000/auth/dropbox/callback?code=XXXXXXXXX');
  console.log('\n');

  // Step 2: Get authorization code from user
  const authCode = await promptUser('Paste the authorization code from the URL (the value after "code="): ');

  if (!authCode || authCode.trim().length === 0) {
    console.error('❌ No authorization code provided');
    process.exit(1);
  }

  console.log('\n📡 STEP 2: Exchanging code for tokens...\n');

  // Step 3: Exchange code for tokens
  try {
    const tokens = await exchangeCodeForTokens(authCode.trim());

    console.log('✅ Tokens obtained successfully!\n');
    console.log('=' .repeat(60));
    console.log('Access Token (expires in 4 hours):');
    console.log('\x1b[33m%s\x1b[0m', tokens.access_token);
    console.log('\nRefresh Token (permanent):');
    console.log('\x1b[32m%s\x1b[0m', tokens.refresh_token);
    console.log('=' .repeat(60));
    console.log('\n');

    // Step 4: Update .env file
    const updateEnv = await promptYesNo('Would you like to update the .env file automatically? (y/n): ');

    if (updateEnv) {
      await updateEnvFile(tokens.access_token, tokens.refresh_token);
      console.log('\n✅ .env file updated successfully!');
      console.log('\n🚀 You can now restart the backend server.');
      console.log('   The tokens will be automatically renewed when they expire.\n');
    } else {
      console.log('\n📝 Manual update required:');
      console.log('   Add these lines to your .env file:');
      console.log(`   DROPBOX_ACCESS_TOKEN=${tokens.access_token}`);
      console.log(`   DROPBOX_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    }

  } catch (error: any) {
    console.error('❌ Failed to exchange code for tokens:');
    console.error(error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

/**
 * Exchange authorization code for access and refresh tokens
 *
 * @param {string} code - Authorization code from OAuth flow
 * @returns {Promise<{access_token: string; refresh_token: string}>} Tokens object
 */
async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const params = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: APP_KEY!,
    client_secret: APP_SECRET!,
  });

  const response = await fetch('https://api.dropbox.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };
}

/**
 * Update .env file with new tokens
 *
 * @param {string} accessToken - New access token
 * @param {string} refreshToken - New refresh token
 */
async function updateEnvFile(accessToken: string, refreshToken: string): Promise<void> {
  const envPath = path.resolve(__dirname, '../.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  // Update or add DROPBOX_ACCESS_TOKEN
  if (envContent.includes('DROPBOX_ACCESS_TOKEN=')) {
    envContent = envContent.replace(
      /DROPBOX_ACCESS_TOKEN=.*/,
      `DROPBOX_ACCESS_TOKEN=${accessToken}`
    );
  } else {
    envContent += `\nDROPBOX_ACCESS_TOKEN=${accessToken}`;
  }

  // Update or add DROPBOX_REFRESH_TOKEN
  if (envContent.includes('DROPBOX_REFRESH_TOKEN=')) {
    envContent = envContent.replace(
      /DROPBOX_REFRESH_TOKEN=.*/,
      `DROPBOX_REFRESH_TOKEN=${refreshToken}`
    );
  } else {
    envContent += `\nDROPBOX_REFRESH_TOKEN=${refreshToken}`;
  }

  fs.writeFileSync(envPath, envContent, 'utf-8');
}

/**
 * Prompt user for input
 *
 * @param {string} question - Question to ask
 * @returns {Promise<string>} User's response
 */
function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Prompt user for yes/no answer
 *
 * @param {string} question - Question to ask
 * @returns {Promise<boolean>} True if yes, false if no
 */
async function promptYesNo(question: string): Promise<boolean> {
  const answer = await promptUser(question);
  return answer.toLowerCase().startsWith('y');
}

// Run the script
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
