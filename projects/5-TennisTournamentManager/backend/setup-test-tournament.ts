/**
 * Script to create an 8-person singles tournament for visual bracket testing
 */

const API_URL = 'http://localhost:3000/api';

// System Admin credentials (for creating users)
const SYSTEM_ADMIN_CREDENTIALS = {
  email: 'admin@tennistournament.com',
  password: 'admin123',
};

// Tournament Admin credentials (for tournament operations)
const TOURNAMENT_ADMIN_CREDENTIALS = {
  email: 'tournament@tennistournament.com',
  password: 'tourney123',
};

// 8 test players with different rankings for seeding
const TEST_PLAYERS = [
  { username: 'rafa_nadal', email: 'rafa.nadal@test.com', firstName: 'Rafael', lastName: 'Nadal', password: 'player123', ranking: 1 },
  { username: 'roger_fed', email: 'roger.federer@test.com', firstName: 'Roger', lastName: 'Federer', password: 'player123', ranking: 2 },
  { username: 'novak_djok', email: 'novak.djokovic@test.com', firstName: 'Novak', lastName: 'Djokovic', password: 'player123', ranking: 3 },
  { username: 'andy_murray', email: 'andy.murray@test.com', firstName: 'Andy', lastName: 'Murray', password: 'player123', ranking: 4 },
  { username: 'daniil_med', email: 'daniil.medvedev@test.com', firstName: 'Daniil', lastName: 'Medvedev', password: 'player123', ranking: 5 },
  { username: 'stefanos_tsi', email: 'stefanos.tsitsipas@test.com', firstName: 'Stefanos', lastName: 'Tsitsipas', password: 'player123', ranking: 6 },
  { username: 'alexander_zve', email: 'alexander.zverev@test.com', firstName: 'Alexander', lastName: 'Zverev', password: 'player123', ranking: 7 },
  { username: 'carlos_alc', email: 'carlos.alcaraz@test.com', firstName: 'Carlos', lastName: 'Alcaraz', password: 'player123', ranking: 8 },
];

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: any;
  id?: string;
  name?: string;
}

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

async function main(): Promise<void> {
  console.log('🎾 Setting up 8-person singles tournament for visual bracket testing\n');

  try {
    // Step 1: Login as system admin (to create users)
    console.log('📝 Step 1: Logging in as system admin...');
    const sysAdminLoginResponse = await apiRequest('/auth/login', 'POST', SYSTEM_ADMIN_CREDENTIALS);
    const sysAdminToken = sysAdminLoginResponse.token;
    console.log('✅ Logged in as system admin\n');

    // Step 2: Create 8 player users
    console.log('📝 Step 2: Creating 8 player users...');
    const createdPlayers: any[] = [];
    
    for (const player of TEST_PLAYERS) {
      try {
        const userResponse = await apiRequest('/users', 'POST', {
          username: player.username,
          email: player.email,
          firstName: player.firstName,
          lastName: player.lastName,
          password: player.password,
          role: 'PLAYER',
          isActive: true,
          ranking: player.ranking,
          idDocument: `${player.lastName.toUpperCase().substring(0, 3)}${Math.floor(1000000 + Math.random() * 9000000)}X`,
        }, sysAdminToken);

        console.log(`  ✅ Created user: ${player.firstName} ${player.lastName} (Ranking: ${player.ranking}, ID: ${userResponse.idDocument || 'N/A'})`);
        createdPlayers.push({ ...player, userId: userResponse.id });
      } catch (error: any) {
        if (error.message.includes('exists') || error.message.includes('duplicate')) {
          console.log(`  ⚠️  User ${player.email} already exists, fetching...`);
          // Try to find existing user
          const usersResponse = await apiRequest('/users', 'GET', null, sysAdminToken);
          const existingUser = usersResponse.find((u: any) => u.email === player.email);
          if (existingUser) {
            // Update existing user to ensure they have idDocument and ranking
            if (!existingUser.idDocument || !existingUser.ranking) {
              console.log(`  🔧 Updating ${player.firstName} ${player.lastName} with missing fields...`);
              const updatedUser = await apiRequest(`/users/${existingUser.id}`, 'PUT', {
                idDocument: existingUser.idDocument || `${player.lastName.toUpperCase().substring(0, 3)}${Math.floor(1000000 + Math.random() * 9000000)}X`,
                ranking: existingUser.ranking || player.ranking,
              }, sysAdminToken);
              console.log(`  ✅ Updated user with ID: ${updatedUser.idDocument}, Ranking: ${updatedUser.ranking}`);
            }
            createdPlayers.push({ ...player, userId: existingUser.id });
          }
        } else {
          throw error;
        }
      }
    }
    console.log(`\n✅ ${createdPlayers.length} players ready\n`);

    // Step 3: Login as tournament admin (for tournament operations)
    console.log('📝 Step 3: Logging in as tournament admin...');
    const tournamentAdminLoginResponse = await apiRequest('/auth/login', 'POST', TOURNAMENT_ADMIN_CREDENTIALS);
    const tournamentAdminToken = tournamentAdminLoginResponse.token;
    console.log('✅ Logged in as tournament admin\n');

    // Step 4: Create tournament
    console.log('📝 Step 4: Creating singles tournament...');
    const tournamentData = {
      name: 'Visual Bracket Test Tournament 2026',
      location: 'La Laguna Sports Complex, Tenerife',
      startDate: '2026-04-10',
      endDate: '2026-04-15',
      registrationOpenDate: '2026-03-01',
      registrationCloseDate: '2026-04-08',
      category: {
        gender: 'OPEN',
        age: 'OPEN',
        level: 'ADVANCED',
      },
      surface: 'HARD',
      tournamentType: 'SINGLES',
      maxParticipants: 8,
      registrationFee: 25.00,
      regulations: 'Standard ITF rules apply. Best of 3 sets with tiebreak.',
      courts: [
        { name: 'Center Court', schedule: { opening: '08:00', closing: '20:00' } },
        { name: 'Court 1', schedule: { opening: '08:00', closing: '20:00' } },
      ],
    };

    const tournamentResponse = await apiRequest('/tournaments', 'POST', tournamentData, tournamentAdminToken);
    
    const tournamentId = tournamentResponse.id;
    console.log(`✅ Tournament created: "${tournamentData.name}" (ID: ${tournamentId})\n`);

    // Step 5: Create category for the tournament
    console.log('📝 Step 5: Creating tournament category...');
    const categoryResponse = await apiRequest('/categories', 'POST', {
      tournamentId,
      name: 'Open Singles - Advanced',
      gender: 'OPEN',
      ageGroup: 'OPEN',
      maxParticipants: 8,
    }, tournamentAdminToken);
    
    const categoryId = categoryResponse.id;
    console.log(`✅ Category created (ID: ${categoryId})\n`);

    // Step 6: Register all players
    console.log('📝 Step 6: Registering players in tournament...');
    
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
    console.log(`\n✅ All players registered\n`);

    // Step 6b: Accept all registrations
    console.log('📝 Step 6b: Accepting all registrations...');
    for (const reg of registrations) {
      try {
        await apiRequest(`/registrations/${reg.id}/status`, 'PUT', {
          status: 'ACCEPTED',
        }, tournamentAdminToken);
        console.log(`  ✅ Accepted: ${reg.player.firstName} ${reg.player.lastName}`);
      } catch (error: any) {
        console.log(`  ⚠️  Failed to accept ${reg.player.firstName} ${reg.player.lastName}: ${error.message}`);
      }
    }
    console.log(`\n✅ All registrations accepted\n`);

    // Step 6c: Assign seed numbers based on player ranking
    console.log('📝 Step 6c: Assigning seed numbers...');
    for (const reg of registrations) {
      try {
        await apiRequest(`/registrations/${reg.id}`, 'PUT', {
          seedNumber: reg.player.ranking,
        }, tournamentAdminToken);
        console.log(`  ✅ Seed #${reg.player.ranking}: ${reg.player.firstName} ${reg.player.lastName}`);
      } catch (error: any) {
        console.log(`  ⚠️  Failed to set seed for ${reg.player.firstName} ${reg.player.lastName}: ${error.message}`);
      }
    }
    console.log(`\n✅ All seed numbers assigned\n`);

    // Step 7: Generate bracket
    console.log('📝 Step 7: Generating single elimination bracket...');
    await apiRequest('/brackets', 'POST', {
      tournamentId,
      categoryId,
      bracketType: 'SINGLE_ELIMINATION',
      size: 8,
      totalRounds: 3, // 8 players = 3 rounds (Quarter-finals, Semi-finals, Final)
    }, tournamentAdminToken);

    console.log('✅ Bracket generated with seeding applied\n');

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 SUCCESS! Tournament setup complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Tournament Details:`);
    console.log(`   Name: ${tournamentData.name}`);
    console.log(`   ID: ${tournamentId}`);
    console.log(`   Type: Singles - Single Elimination`);
    console.log(`   Players: 8 (all seeded)`);
    console.log(`\n🌐 View in browser:`);
    console.log(`   http://localhost:4201/tournaments/${tournamentId}/bracket`);
    console.log(`\n👥 Expected bracket structure (ITF seeding):`);
    console.log(`   Final:`);
    console.log(`     - Winner of [Nadal vs Alcaraz / Federer vs Zverev]`);
    console.log(`     - Winner of [Djokovic vs Tsitsipas / Murray vs Medvedev]`);
    console.log(`\n✨ The visual bracket should now display with:`);
    console.log(`   ✓ Horizontal rounds (Round 1, Semi-Finals, Final)`);
    console.log(`   ✓ Participant names in each position`);
    console.log(`   ✓ Seed badges (#1-#8)`);
    console.log(`   ✓ Interactive match cards`);
    console.log(`\n═══════════════════════════════════════════════════════════\n`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
