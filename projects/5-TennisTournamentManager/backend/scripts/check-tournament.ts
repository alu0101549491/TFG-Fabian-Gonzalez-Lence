import axios from 'axios';

const API_URL = 'http://localhost:3000';
const TOURNAMENT_ID = 'trn_91800d96';

async function checkTournament() {
  try {
    // Login as system admin
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@tennistournament.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in as system admin\n');
    
    // Get tournament details
    console.log(`🔍 Checking tournament: ${TOURNAMENT_ID}`);
    const tournamentResponse = await axios.get(`${API_URL}/tournaments/${TOURNAMENT_ID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const tournament = tournamentResponse.data;
    console.log('✅ Tournament found:');
    console.log('  Name:', tournament.name);
    console.log('  Status:', tournament.status);
    console.log('  Organizer ID:', tournament.organizerId);
    console.log('  Created:', new Date(tournament.createdAt).toISOString());
    
    // Get all tournaments
    console.log('\n📋 All tournaments:');
    const allTournamentsResponse = await axios.get(`${API_URL}/tournaments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    allTournamentsResponse.data.forEach((t: any) => {
      console.log(`  - ${t.id}: ${t.name} (${t.status})`);
    });
    
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

checkTournament();
