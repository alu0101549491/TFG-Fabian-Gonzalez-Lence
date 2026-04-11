/**
 * Script to clean up duplicate test tournaments
 */

const API_URL = 'http://localhost:3000/api';

// System Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@tennistournament.com',
  password: 'admin123',
};

async function apiRequest(endpoint: string, method: string = 'GET', body?: any, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  const data = await response.json();
  return data;
}

async function main(): Promise<void> {
  console.log('🧹 Cleaning up duplicate test tournaments...\n');

  try {
    // Login as system admin
    console.log('📝 Logging in as system admin...');
    const loginResponse = await apiRequest('/auth/login', 'POST', ADMIN_CREDENTIALS);
    const adminToken = loginResponse.token;
    console.log('✅ Logged in\n');

    // Get all tournaments
    console.log('📊 Fetching all tournaments...');
    const tournaments = await apiRequest('/tournaments', 'GET', null, adminToken);
    console.log(`Found ${tournaments.length} tournament(s)\n`);

    // Find test tournaments
    const testTournaments = tournaments.filter((t: any) => 
      t.name.includes('Visual Bracket Test Tournament')
    );

    console.log(`📋 Found ${testTournaments.length} test tournament(s):\n`);
    
    testTournaments.forEach((t: any) => {
      console.log(`  ${t.id}: "${t.name}" (Status: ${t.status}, Created: ${t.createdAt})`);
    });
    console.log();

    // Keep the most recent one (last created)
    const sortedByDate = testTournaments.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const tournamentToKeep = sortedByDate[0];
    const tournamentsToDelete = sortedByDate.slice(1);

    console.log(`✅ Keeping most recent tournament: ${tournamentToKeep.id}`);
    console.log(`   Created: ${tournamentToKeep.createdAt}\n`);

    if (tournamentsToDelete.length === 0) {
      console.log('✅ No duplicate tournaments to delete.\n');
      return;
    }

    console.log(`🗑️  Deleting ${tournamentsToDelete.length} duplicate tournament(s)...\n`);

    for (const tournament of tournamentsToDelete) {
      try {
        await apiRequest(`/tournaments/${tournament.id}`, 'DELETE', null, adminToken);
        console.log(`  ✅ Deleted: ${tournament.id}`);
      } catch (error: any) {
        console.log(`  ❌ Failed to delete ${tournament.id}: ${error.message}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 Cleanup complete!');
    console.log('═══════════════════════════════════════════════════════════');
    if (tournamentToKeep) {
      console.log(`\n🌐 View remaining tournament at:`);
      console.log(`   http://localhost:4201/tournaments/${tournamentToKeep.id}/bracket\n`);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
