/**
 * Quick script to decode a JWT token and check the user role
 * Usage: npx tsx scripts/check-token.ts <your-jwt-token>
 */

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: npx tsx scripts/check-token.ts <jwt-token>');
  console.log('\nOr paste your token from localStorage:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Run: localStorage.getItem("token")');
  console.log('4. Copy the token and run this script with it');
  process.exit(1);
}

const token = args[0];

try {
  // JWT tokens have 3 parts separated by dots: header.payload.signature
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    console.error('❌ Invalid JWT format. Expected 3 parts separated by dots.');
    process.exit(1);
  }
  
  // Decode the payload (second part)
  const payload = parts[1];
  const decoded = Buffer.from(payload, 'base64').toString('utf-8');
  const payloadObj = JSON.parse(decoded);
  
  console.log('\n✅ Token payload decoded:\n');
  console.log(JSON.stringify(payloadObj, null, 2));
  
  if (payloadObj.role) {
    console.log(`\n📋 User Role: ${payloadObj.role}`);
    console.log(`📧 Email: ${payloadObj.email || 'N/A'}`);
    console.log(`🆔 User ID: ${payloadObj.userId || 'N/A'}`);
    
    if (payloadObj.role === 'SYSTEM_ADMIN') {
      console.log('\n✅ User has SYSTEM_ADMIN role - should be able to delete any tournament');
    } else {
      console.log(`\n⚠️  User has ${payloadObj.role} role - may have limited delete permissions`);
    }
  }
  
  // Check expiration
  if (payloadObj.exp) {
    const expDate = new Date(payloadObj.exp * 1000);
    const now = new Date();
    
    console.log(`\n⏰ Token expires: ${expDate.toISOString()}`);
    
    if (expDate < now) {
      console.log('❌ TOKEN IS EXPIRED! You need to log in again.');
    } else {
      console.log('✅ Token is still valid');
    }
  }
  
} catch (error: any) {
  console.error('❌ Error decoding token:', error.message);
  console.error('\nMake sure you copied the complete token (3 parts separated by dots)');
}
