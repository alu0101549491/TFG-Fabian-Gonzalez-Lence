/**
 * Check if qualifiers were registered in main draw
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

    // Find main draw category
    const categoriesResponse = await fetch(`${API_URL}/categories?tournamentId=${tournamentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await categoriesResponse.json();
    const mainDrawCategory = categories.find((c: any) => c.name === 'Open Singles - Main Draw');
    
    if (!mainDrawCategory) {
      console.error('❌ Main draw category not found');
      return;
    }

    console.log(`\n📋 Main Draw Category: ${mainDrawCategory.name} (${mainDrawCategory.id})\n`);

    // Fetch registrations for main draw
    const registrationsResponse = await fetch(`${API_URL}/registrations?categoryId=${mainDrawCategory.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const registrations = await registrationsResponse.json();

    // Filter for qualifiers
    const qualifiers = registrations.filter((r: any) => r.acceptanceType === 'QUALIFIER');

    console.log(`✅ Total registrations in main draw: ${registrations.length}`);
    console.log(`🎾 Qualifiers: ${qualifiers.length}\n`);

    if (qualifiers.length > 0) {
      console.log('Qualifier Details:');
      for (const q of qualifiers) {
        // Fetch participant details
        const participantResponse = await fetch(`${API_URL}/users/${q.participantId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const participant = await participantResponse.json();
        console.log(`  ✅ ${participant.firstName} ${participant.lastName} (${q.participantId})`);
        console.log(`     Status: ${q.status}`);
        console.log(`     Registered: ${new Date(q.registrationDate).toLocaleString()}\n`);
      }
    } else {
      console.log('❌ No qualifiers found in main draw');
      console.log('   The automatic advancement feature may not have triggered.\n');
    }

    // Also check all registrations by acceptance type
    const acceptanceTypes = registrations.reduce((acc: any, r: any) => {
      acc[r.acceptanceType] = (acc[r.acceptanceType] || 0) + 1;
      return acc;
    }, {});

    console.log('Registration breakdown by acceptance type:');
    Object.entries(acceptanceTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

main();
