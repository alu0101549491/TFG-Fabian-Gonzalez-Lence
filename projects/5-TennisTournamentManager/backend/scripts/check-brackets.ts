/**
 * Quick script to check bracket structure
 */

const API_URL = 'http://localhost:3000/api';

async function main() {
  const tournamentId = 'trn_3b7247a7';
  
  try {
    // Login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tournament@tennistournament.com', password: 'tourney123' })
    });
    const { token } = await loginResponse.json();

    // Fetch brackets
    const bracketsResponse = await fetch(`${API_URL}/brackets?tournamentId=${tournamentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const brackets = await bracketsResponse.json();
    
    console.log('Brackets:');
    console.log(JSON.stringify(brackets, null, 2));
    
    // Fetch categories to see which is qualifying
    const categoriesResponse = await fetch(`${API_URL}/categories?tournamentId=${tournamentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await categoriesResponse.json();
    
    console.log('\nCategories:');
    categories.forEach((cat: any) => {
      console.log(`${cat.id}: ${cat.name} (phaseType: ${cat.phaseType || 'MAIN'})`);
    });
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

main();
