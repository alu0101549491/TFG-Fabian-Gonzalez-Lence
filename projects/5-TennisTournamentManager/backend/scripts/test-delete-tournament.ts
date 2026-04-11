import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testDelete() {
  try {
    // Login as system admin
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@tennistournament.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in as system admin');
    console.log('Token:', token.substring(0, 20) + '...');
    
    // Try to delete tournament
    const tournamentId = 'trn_91800d96';
    console.log(`\n🗑️  Attempting to delete tournament: ${tournamentId}`);
    
    const deleteResponse = await axios.delete(`${API_URL}/tournaments/${tournamentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Tournament deleted successfully');
    console.log('Response status:', deleteResponse.status);
    
  } catch (error: any) {
    if (error.response) {
      console.error('\n❌ DELETE failed');
      console.error('Status:', error.response.status);
      console.error('Error code:', error.response.data.error);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDelete();
