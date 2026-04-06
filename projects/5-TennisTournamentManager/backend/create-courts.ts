/**
 * Script to create courts for a tournament
 * Usage: npx tsx create-courts.ts <tournamentId>
 */

const API_URL = 'http://localhost:3000/api';

const ADMIN_CREDENTIALS = {
  email: 'tournament@tennistournament.com',
  password: 'tourney123',
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
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

async function main(): Promise<void> {
  const tournamentId = process.argv[2];

  if (!tournamentId) {
    console.error('❌ Please provide a tournament ID');
    console.error('Usage: npx tsx create-courts.ts <tournamentId>');
    process.exit(1);
  }

  console.log(`🎾 Creating courts for tournament: ${tournamentId}\n`);

  try {
    // Login
    console.log('📝 Logging in...');
    const loginResponse = await apiRequest('/auth/login', 'POST', ADMIN_CREDENTIALS);
    const token = loginResponse.token;
    console.log('✅ Logged in successfully\n');

    // Define courts to create
    const courtsToCreate = [
      { name: 'Court 1', surface: 'HARD', isAvailable: true },
      { name: 'Court 2', surface: 'HARD', isAvailable: true },
      { name: 'Court 3', surface: 'CLAY', isAvailable: true },
      { name: 'Court 4', surface: 'CLAY', isAvailable: true },
    ];

    console.log(`📝 Creating ${courtsToCreate.length} courts...\n`);

    let successCount = 0;

    for (const court of courtsToCreate) {
      try {
        await apiRequest(
          '/courts',
          'POST',
          {
            tournamentId,
            ...court,
          },
          token
        );

        console.log(`  ✅ Created: ${court.name} (${court.surface})`);
        successCount++;
      } catch (error: any) {
        console.error(`  ❌ Failed to create ${court.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary: ${successCount}/${courtsToCreate.length} courts created`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n🎉 Courts created! Now you can run:');
      console.log(`   npx tsx generate-match-results.ts ${tournamentId}`);
    }

  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
