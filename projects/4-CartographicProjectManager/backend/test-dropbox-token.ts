/**
 * Quick Dropbox token validation test
 */

import {Dropbox} from 'dropbox';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.DROPBOX_ACCESS_TOKEN;

if (!token) {
  console.error('❌ No DROPBOX_ACCESS_TOKEN in .env');
  process.exit(1);
}

const dbx = new Dropbox({
  accessToken: token,
  fetch: fetch as any,
});

async function testToken() {
  console.log('🔑 Testing Dropbox token...\n');

  try {
    // Test 1: Get account info
    console.log('1️⃣  Getting account info...');
    const accountInfo = await dbx.usersGetCurrentAccount();
    console.log('   ✅ Account:', accountInfo.result.email);
    console.log('   ✅ Name:', accountInfo.result.name.display_name);

    // Test 2: Upload small file
    console.log('\n2️⃣  Uploading small test file...');
    const testPath = '/test-upload-' + Date.now() + '.txt';
    const testContent = 'Hello Dropbox - ' + new Date().toISOString();

    const uploadResult = await dbx.filesUpload({
      path: testPath,
      contents: Buffer.from(testContent),
      mode: {'.tag': 'overwrite'},
    });

    console.log('   ✅ Uploaded:', uploadResult.result.name);
    console.log('   ✅ Size:', uploadResult.result.size, 'bytes');
    console.log('   ✅ Path:', uploadResult.result.path_display);

    // Test 3: Delete test file
    console.log('\n3️⃣  Cleaning up...');
    await dbx.filesDeleteV2({path: testPath});
    console.log('   ✅ Test file deleted');

    console.log('\n✅ All tests passed! Token is valid.\n');
  } catch (error: any) {
    console.error('\n❌ Token test failed:');
    console.error('Error:', error.message);
    if (error.error) {
      console.error('Details:', JSON.stringify(error.error, null, 2));
    }
    process.exit(1);
  }
}

testToken();
