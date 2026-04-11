import axios from 'axios';

const baseURL = 'http://localhost:3000/api';

async function testDelete() {
  try {
    // Login as system admin
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@tennistournament.com',
      password: 'admin123',
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in as:', loginResponse.data.user.email, 'Role:', loginResponse.data.user.role);
    
    // Try to delete tournament
    console.log('\n🗑️ Attempting to DELETE tournament trn_91800d96...');
    const deleteResponse = await axios.delete(`${baseURL}/tournaments/trn_91800d96`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ DELETE succeeded!');
    console.log('Status:', deleteResponse.status);
    console.log('Response:', deleteResponse.data);
    
  } catch (error: any) {
    console.error('❌ DELETE failed');
    console.error('Status:', error.response?.status);
    console.error('Error code:', error.response?.data?.error);
    console.error('Message:', error.response?.data?.message);
    console.error('Full response:', JSON.stringify(error.response?.data, null, 2));
  }
}

testDelete();
