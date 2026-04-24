/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 24, 2026
 * @file backend/scripts/populate-qualifying.ts
 * @desc Script to populate qualifying category with test players
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

const API_URL = 'http://localhost:3000/api';

// Tournament Admin credentials (for tournament operations)
const TOURNAMENT_ADMIN_CREDENTIALS = {
  email: 'tournament@tennistournament.com',
  password: 'tourney123',
};

// System Admin credentials (fallback)
const SYSTEM_ADMIN_CREDENTIALS = {
  email: 'admin@tennistournament.com',
  password: 'admin123',
};

// 16 test players for qualifying draw (typically larger than main draw)
const QUALIFYING_PLAYERS = [
  { username: 'player_q01', email: 'q01@test.com', firstName: 'Marco', lastName: 'Rossi', password: 'player123', ranking: 33 },
  { username: 'player_q02', email: 'q02@test.com', firstName: 'Lucas', lastName: 'Silva', password: 'player123', ranking: 34 },
  { username: 'player_q03', email: 'q03@test.com', firstName: 'Yuki', lastName: 'Tanaka', password: 'player123', ranking: 35 },
  { username: 'player_q04', email: 'q04@test.com', firstName: 'Andre', lastName: 'Schmidt', password: 'player123', ranking: 36 },
  { username: 'player_q05', email: 'q05@test.com', firstName: 'Pierre', lastName: 'Dubois', password: 'player123', ranking: 37 },
  { username: 'player_q06', email: 'q06@test.com', firstName: 'Mateo', lastName: 'Garcia', password: 'player123', ranking: 38 },
  { username: 'player_q07', email: 'q07@test.com', firstName: 'Ivan', lastName: 'Petrov', password: 'player123', ranking: 39 },
  { username: 'player_q08', email: 'q08@test.com', firstName: 'Johan', lastName: 'Andersson', password: 'player123', ranking: 40 },
  { username: 'player_q09', email: 'q09@test.com', firstName: 'Dimitri', lastName: 'Papadopoulos', password: 'player123', ranking: 41 },
  { username: 'player_q10', email: 'q10@test.com', firstName: 'Jan', lastName: 'Kowalski', password: 'player123', ranking: 42 },
  { username: 'player_q11', email: 'q11@test.com', firstName: 'Tom', lastName: 'Johnson', password: 'player123', ranking: 43 },
  { username: 'player_q12', email: 'q12@test.com', firstName: 'Lars', lastName: 'Nielsen', password: 'player123', ranking: 44 },
  { username: 'player_q13', email: 'q13@test.com', firstName: 'Mikko', lastName: 'Virtanen', password: 'player123', ranking: 45 },
  { username: 'player_q14', email: 'q14@test.com', firstName: 'David', lastName: 'Cohen', password: 'player123', ranking: 46 },
  { username: 'player_q15', email: 'q15@test.com', firstName: 'Sean', lastName: "O'Brien", password: 'player123', ranking: 47 },
  { username: 'player_q16', email: 'q16@test.com', firstName: 'Alex', lastName: 'Wilson', password: 'player123', ranking: 48 },
];

/**
 * Makes an HTTP request to the API.
 *
 * @param endpoint - API endpoint path
 * @param method - HTTP method
 * @param body - Request body
 * @param token - Authentication token
 * @returns Promise resolving to API response data
 */
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

  const data = await response.json();
  return data;
}

/**
 * Main script execution.
 */
async function main(): Promise<void> {
  // Get tournament ID from command line argument
  const tournamentId = process.argv[2];
  
  if (!tournamentId) {
    console.error('❌ Error: Tournament ID is required');
    console.log('\nUsage: npx tsx scripts/populate-qualifying.ts <TOURNAMENT_ID>');
    console.log('Example: npx tsx scripts/populate-qualifying.ts trn_abc123\n');
    process.exit(1);
  }

  console.log('🎾 Populating Qualifying Category with Test Players\n');
  console.log(`📋 Tournament ID: ${tournamentId}\n`);

  try {
    // Step 1: Login as system admin (to create users if needed)
    console.log('📝 Step 1: Logging in as system admin...');
    const sysAdminLoginResponse = await apiRequest('/auth/login', 'POST', SYSTEM_ADMIN_CREDENTIALS);
    const sysAdminToken = sysAdminLoginResponse.token;
    console.log('✅ Logged in as system admin\n');

    // Step 2: Login as tournament admin (for registrations)
    console.log('📝 Step 2: Logging in as tournament admin...');
    const tournamentAdminLoginResponse = await apiRequest('/auth/login', 'POST', TOURNAMENT_ADMIN_CREDENTIALS);
    const tournamentAdminToken = tournamentAdminLoginResponse.token;
    console.log('✅ Logged in as tournament admin\n');

    // Step 3: Get tournament details
    console.log('📝 Step 3: Fetching tournament details...');
    const tournament = await apiRequest(`/tournaments/${tournamentId}`, 'GET', undefined, tournamentAdminToken);
    console.log(`✅ Tournament: "${tournament.name}"\n`);

    // Step 4: Find the qualifying category
    console.log('📝 Step 4: Finding qualifying category...');
    const categories = await apiRequest(`/categories?tournamentId=${tournamentId}`, 'GET', undefined, tournamentAdminToken);
    
    const qualifyingCategory = categories.find((cat: any) => cat.name.includes('Qualifying'));
    
    if (!qualifyingCategory) {
      console.error('❌ Error: No qualifying category found for this tournament');
      console.log('\nAvailable categories:');
      categories.forEach((cat: any) => console.log(`  - ${cat.name}`));
      console.log('\nPlease create a qualifying phase first (this auto-creates the qualifying category).\n');
      process.exit(1);
    }

    const categoryId = qualifyingCategory.id;
    console.log(`✅ Found qualifying category: "${qualifyingCategory.name}" (ID: ${categoryId})`);
    console.log(`   Max participants: ${qualifyingCategory.maxParticipants}\n`);

    // Step 5: Create qualifying players
    console.log('📝 Step 5: Creating qualifying player users...');
    const createdPlayers: any[] = [];
    
    const playersToCreate = QUALIFYING_PLAYERS.slice(0, qualifyingCategory.maxParticipants);
    
    for (const player of playersToCreate) {
      try {
        // Try to register the user - if email exists, catch error and try to find existing user
        const userResponse = await apiRequest('/auth/register', 'POST', {
          username: player.username,
          email: player.email,
          password: player.password,
          firstName: player.firstName,
          lastName: player.lastName,
        }).catch(async (error) => {
          // If email already exists, try to login to get user ID
          if (error.message.includes('Email already exists') || error.message.includes('already exists')) {
            console.log(`  ⏭️  User already exists, logging in: ${player.firstName} ${player.lastName}`);
            const loginResponse = await apiRequest('/auth/login', 'POST', {
              email: player.email,
              password: player.password,
            });
            return { user: { id: loginResponse.user.id } };
          }
          throw error;
        });

        createdPlayers.push({
          userId: userResponse.user.id,
          ...player,
        });

        console.log(`  ✅ Prepared: ${player.firstName} ${player.lastName} (${userResponse.user.id})`);
      } catch (error: any) {
        console.log(`  ⚠️  Failed to prepare ${player.firstName} ${player.lastName}: ${error.message}`);
      }
    }
    console.log(`\n✅ Players prepared (${createdPlayers.length}/${playersToCreate.length})\n`);

    // Step 6: Check tournament status (info only, no transition)
    console.log('📝 Step 6: Checking tournament status...');
    console.log(`   Current status: ${tournament.status}`);
    
    if (tournament.status === 'DRAFT') {
      console.log('   ⚠️  Tournament is in DRAFT status');
      console.log('   ℹ️  You may need to open registration manually if registrations fail\n');
    } else if (tournament.status === 'REGISTRATION_CLOSED') {
      console.log('   ⚠️  Tournament registration is closed');
      console.log('   ℹ️  Continuing anyway - registrations may be created but not visible in UI\n');
    } else if (tournament.status === 'DRAW_PENDING' || tournament.status === 'IN_PROGRESS') {
      console.log('   ✅ Tournament is past registration phase');
      console.log('   ℹ️  Continuing - this will add qualifying players to existing tournament\n');
    } else {
      console.log('   ✅ Tournament status OK for registrations\n');
    }

    // Step 7: Register all qualifying players
    console.log('📝 Step 7: Registering players to qualifying category...');
    
    const registrations: any[] = [];
    for (const player of createdPlayers) {
      try {
        const registration = await apiRequest('/registrations', 'POST', {
          tournamentId,
          categoryId,
          participantId: player.userId,
        }, tournamentAdminToken);

        registrations.push({
          ...registration,
          player,
        });

        console.log(`  ✅ Registered: ${player.firstName} ${player.lastName}`);
      } catch (error: any) {
        console.log(`  ⚠️  Failed to register ${player.firstName} ${player.lastName}: ${error.message}`);
      }
    }
    console.log(`\n✅ Players registered (${registrations.length}/${createdPlayers.length})\n`);

    // Step 8: Accept all registrations
    console.log('📝 Step 8: Accepting all registrations...');
    let acceptedCount = 0;
    for (const reg of registrations) {
      try {
        await apiRequest(`/registrations/${reg.id}/status`, 'PUT', {
          status: 'ACCEPTED',
        }, tournamentAdminToken);
        acceptedCount++;
        console.log(`  ✅ Accepted: ${reg.player.firstName} ${reg.player.lastName}`);
      } catch (error: any) {
        console.log(`  ⚠️  Failed to accept ${reg.player.firstName} ${reg.player.lastName}: ${error.message}`);
      }
    }
    console.log(`\n✅ Registrations accepted (${acceptedCount}/${registrations.length})\n`);

    // Step 9: Assign seed numbers based on player ranking
    console.log('📝 Step 9: Assigning seed numbers...');
    let seededCount = 0;
    for (const reg of registrations) {
      try {
        await apiRequest(`/registrations/${reg.id}`, 'PUT', {
          seedNumber: reg.player.ranking,
        }, tournamentAdminToken);
        seededCount++;
        console.log(`  ✅ Seed #${reg.player.ranking}: ${reg.player.firstName} ${reg.player.lastName}`);
      } catch (error: any) {
        console.log(`  ⚠️  Failed to set seed for ${reg.player.firstName} ${reg.player.lastName}: ${error.message}`);
      }
    }
    console.log(`\n✅ Seed numbers assigned (${seededCount}/${registrations.length})\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ QUALIFYING POPULATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📋 Tournament: ${tournament.name}`);
    console.log(`🏆 Category: ${qualifyingCategory.name}`);
    console.log(`👥 Players Registered: ${registrations.length}`);
    console.log(`✅ Players Accepted: ${acceptedCount}`);
    console.log(`🎯 Players Seeded: ${seededCount}`);
    console.log('\n📌 Next Steps:');
    console.log('   1. Navigate to bracket view for this tournament');
    console.log('   2. Find the qualifying section');
    console.log('   3. Click "Generate Bracket" to create qualifying matches');
    console.log('   4. Complete qualifying matches');
    console.log('   5. Advance winners to main draw\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();
