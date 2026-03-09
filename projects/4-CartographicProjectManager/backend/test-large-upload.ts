/**
 * Test DropboxService with timeout configuration
 */

import {DropboxService} from './src/infrastructure/external-services/dropbox.service.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const token = process.env.DROPBOX_ACCESS_TOKEN;

if (!token) {
  console.error('❌ No DROPBOX_ACCESS_TOKEN in .env');
  process.exit(1);
}

async function testUpload() {
  console.log('📤 Testing DropboxService with large file...\n');

  const dropboxService = new DropboxService({accessToken: token!});

  try {
    // Create a 3MB test file (similar to the PDF size)
    const size = 3 * 1024 * 1024; // 3MB
    const testData = Buffer.alloc(size, 'A');
    
    console.log(`📝 Created ${size} byte test file`);

    const testPath = '/test-large-upload-' + Date.now() + '.bin';
    console.log(`📂 Upload path: ${testPath}`);
    console.log('⏱️  Starting upload...');

    const startTime = Date.now();
    const metadata = await dropboxService.uploadFile(testPath, testData);
    const duration = Date.now() - startTime;

    console.log(`✅ Upload successful in ${duration}ms!`);
    console.log('   File:', metadata.name);
    console.log('   Size:', metadata.size, 'bytes');
    console.log('   Path:', metadata.path);

    // Clean up
    console.log('\n🧹 Cleaning up...');
    await dropboxService.deleteFile(testPath);
    console.log('✅ Test file deleted');

    console.log('\n✅ All tests passed!\n');
  } catch (error: any) {
    console.error('\n❌ Upload failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Type:', error.type);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
    process.exit(1);
  }
}

testUpload();
