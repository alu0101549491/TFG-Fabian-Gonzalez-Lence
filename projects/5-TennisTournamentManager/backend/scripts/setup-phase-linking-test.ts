/**
 * Script to set up multi-phase tournament testing
 * Creates qualifying and main draw tournaments to test phase linking features
 */

const API_URL = 'http://localhost:3000/api';

// Tournament Admin credentials
const TOURNAMENT_ADMIN_CREDENTIALS = {
  email: 'tournament@tennistournament.com',
  password: 'tourney123',
};

// System Admin credentials
const SYSTEM_ADMIN_CREDENTIALS = {
  email: 'admin@tennistournament.com',
  password: 'admin123',
};

// 12 test players (8 for qualifying, 4 alternates)
const QUALIFYING_PLAYERS = [
  { username: 'qual_player1', email: 'qual.player1@test.com', firstName: 'James', lastName: 'Anderson', password: 'player123', ranking: 101 },
  { username: 'qual_player2', email: 'qual.player2@test.com', firstName: 'Michael', lastName: 'Brown', password: 'player123', ranking: 102 },
  { username: 'qual_player3', email: 'qual.player3@test.com', firstName: 'David', lastName: 'Clark', password: 'player123', ranking: 103 },
  { username: 'qual_player4', email: 'qual.player4@test.com', firstName: 'Robert', lastName: 'Davis', password: 'player123', ranking: 104 },
  { username: 'qual_player5', email: 'qual.player5@test.com', firstName: 'William', lastName: 'Evans', password: 'player123', ranking: 105 },
  { username: 'qual_player6', email: 'qual.player6@test.com', firstName: 'Richard', lastName: 'Foster', password: 'player123', ranking: 106 },
  { username: 'qual_player7', email: 'qual.player7@test.com', firstName: 'Thomas', lastName: 'Garcia', password: 'player123', ranking: 107 },
  { username: 'qual_player8', email: 'qual.player8@test.com', firstName: 'Charles', lastName: 'Harris', password: 'player123', ranking: 108 },
];

// 8 main draw direct acceptances
const MAIN_DRAW_PLAYERS = [
  { username: 'rafa_nadal', email: 'rafa.nadal@test.com', firstName: 'Rafael', lastName: 'Nadal', password: 'player123', ranking: 1 },
  { username: 'roger_fed', email: 'roger.federer@test.com', firstName: 'Roger', lastName: 'Federer', password: 'player123', ranking: 2 },
  { username: 'novak_djok', email: 'novak.djokovic@test.com', firstName: 'Novak', lastName: 'Djokovic', password: 'player123', ranking: 3 },
  { username: 'andy_murray', email: 'andy.murray@test.com', firstName: 'Andy', lastName: 'Murray', password: 'player123', ranking: 4 },
  { username: 'daniil_med', email: 'daniil.medvedev@test.com', firstName: 'Daniil', lastName: 'Medvedev', password: 'player123', ranking: 5 },
  { username: 'stefanos_tsi', email: 'stefanos.tsitsipas@test.com', firstName: 'Stefanos', lastName: 'Tsitsipas', password: 'player123', ranking: 6 },
  { username: 'alexander_zve', email: 'alexander.zverev@test.com', firstName: 'Alexander', lastName: 'Zverev', password: 'player123', ranking: 7 },
  { username: 'carlos_alc', email: 'carlos.alcaraz@test.com', firstName: 'Carlos', lastName: 'Alcaraz', password: 'player123', ranking: 8 },
];

// Alternates for Lucky Loser testing
const ALTERNATE_PLAYERS = [
  { username: 'alt_player1', email: 'alt.player1@test.com', firstName: 'Jessica', lastName: 'Wilson', password: 'player123', ranking: 201 },
  { username: 'alt_player2', email: 'alt.player2@test.com', firstName: 'Sarah', lastName: 'Martinez', password: 'player123', ranking: 202 },
];

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

async function createPlayers(players: any[], token: string): Promise<any[]> {
  const createdPlayers: any[] = [];

  for (const player of players) {
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
      }, token);

      console.log(`  ✅ Created: ${player.firstName} ${player.lastName} (Rank: ${player.ranking})`);
      createdPlayers.push({ ...player, userId: userResponse.id });
    } catch (error: any) {
      if (error.message.includes('exists') || error.message.includes('duplicate')) {
        console.log(`  ⚠️  ${player.email} exists, fetching...`);
        const usersResponse = await apiRequest('/users', 'GET', null, token);
        const existingUser = usersResponse.find((u: any) => u.email === player.email);
        if (existingUser) {
          createdPlayers.push({ ...player, userId: existingUser.id });
        }
      } else {
        console.error(`  ❌ Failed to create ${player.firstName} ${player.lastName}:`, error.message);
      }
    }
  }

  return createdPlayers;
}

async function completeMatchWithResult(matchId: string, winnerId: string, token: string): Promise<void> {
  try {
    // Submit result
    await apiRequest(`/matches/${matchId}/result`, 'POST', {
      winnerId,
      score: '6-4, 6-3',
    }, token);

    // Confirm result
    await apiRequest(`/matches/${matchId}/confirm`, 'POST', {}, token);
  } catch (error: any) {
    console.error(`    ⚠️  Failed to complete match ${matchId}:`, error.message);
  }
}

async function main(): Promise<void> {
  console.log('🎾 Setting up Phase Linking Test Environment\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Login as system admin
    console.log('📝 Step 1: Logging in as system admin...');
    const sysAdminLoginResponse = await apiRequest('/auth/login', 'POST', SYSTEM_ADMIN_CREDENTIALS);
    const sysAdminToken = sysAdminLoginResponse.token;
    console.log('✅ Logged in\n');

    // Create all players
    console.log('📝 Step 2: Creating players...');
    console.log('\n  🏆 Qualifying Players (8):');
    const qualifyingPlayers = await createPlayers(QUALIFYING_PLAYERS, sysAdminToken);
    console.log('\n  ⭐ Main Draw Players (8):');
    const mainDrawPlayers = await createPlayers(MAIN_DRAW_PLAYERS, sysAdminToken);
    console.log('\n  🔄 Alternate Players (2):');
    const alternatePlayers = await createPlayers(ALTERNATE_PLAYERS, sysAdminToken);
    console.log(`\n✅ Total: ${qualifyingPlayers.length + mainDrawPlayers.length + alternatePlayers.length} players created\n`);

    // Login as tournament admin
    console.log('📝 Step 3: Logging in as tournament admin...');
    const tournamentAdminLoginResponse = await apiRequest('/auth/login', 'POST', TOURNAMENT_ADMIN_CREDENTIALS);
    const tournamentAdminToken = tournamentAdminLoginResponse.token;
    console.log('✅ Logged in\n');

    // ==================== QUALIFYING TOURNAMENT ====================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🏆 PART 1: Creating Qualifying Tournament (Round Robin)');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📝 Step 4: Creating qualifying tournament...');
    const qualifyingTournamentData = {
      name: 'Phase Linking Test - Qualifying 2026',
      location: 'La Laguna Tennis Academy',
      startDate: '2026-05-01',
      endDate: '2026-05-05',
      registrationOpenDate: '2026-04-01',
      registrationCloseDate: '2026-04-28',
      category: { gender: 'OPEN', age: 'OPEN', level: 'INTERMEDIATE' },
      surface: 'CLAY',
      tournamentType: 'SINGLES',
      maxParticipants: 8,
      registrationFee: 15.00,
      regulations: 'Qualifying tournament - top 4 advance to main draw',
    };

    const qualifyingTournamentResponse = await apiRequest('/tournaments', 'POST', qualifyingTournamentData, tournamentAdminToken);
    const qualifyingTournamentId = qualifyingTournamentResponse.id;
    console.log(`✅ Qualifying tournament created (ID: ${qualifyingTournamentId})\n`);

    console.log('📝 Step 5: Creating qualifying category...');
    const qualifyingCategoryResponse = await apiRequest('/categories', 'POST', {
      tournamentId: qualifyingTournamentId,
      name: 'Open Singles - Qualifying',
      gender: 'OPEN',
      ageGroup: 'OPEN',
      maxParticipants: 8,
    }, tournamentAdminToken);
    const qualifyingCategoryId = qualifyingCategoryResponse.id;
    console.log(`✅ Category created (ID: ${qualifyingCategoryId})\n`);

    console.log('📝 Step 6: Opening qualifying registration...');
    await apiRequest(`/tournaments/${qualifyingTournamentId}/status`, 'PUT', {
      status: 'REGISTRATION_OPEN',
    }, tournamentAdminToken);
    console.log('✅ Registration opened\n');

    console.log('📝 Step 7: Registering qualifying players...');
    const qualifyingRegistrations: any[] = [];
    for (const player of qualifyingPlayers) {
      const registration = await apiRequest('/registrations', 'POST', {
        tournamentId: qualifyingTournamentId,
        categoryId: qualifyingCategoryId,
        participantId: player.userId,
      }, tournamentAdminToken);
      qualifyingRegistrations.push({ ...registration, player });
      console.log(`  ✅ ${player.firstName} ${player.lastName}`);
    }
    console.log(`\n✅ ${qualifyingRegistrations.length} players registered\n`);

    console.log('📝 Step 8: Accepting all qualifying registrations...');
    for (const reg of qualifyingRegistrations) {
      await apiRequest(`/registrations/${reg.id}/status`, 'PUT', { status: 'ACCEPTED' }, tournamentAdminToken);
    }
    console.log('✅ All registrations accepted\n');

    console.log('📝 Step 9: Closing registration...');
    await apiRequest(`/tournaments/${qualifyingTournamentId}/status`, 'PUT', {
      status: 'REGISTRATION_CLOSED',
    }, tournamentAdminToken);
    console.log('✅ Registration closed\n');

    console.log('📝 Step 10: Preparing draw...');
    await apiRequest(`/tournaments/${qualifyingTournamentId}/status`, 'PUT', {
      status: 'DRAW_PENDING',
    }, tournamentAdminToken);
    console.log('✅ Tournament ready for bracket generation\n');

    console.log('📝 Step 11: Generating Round Robin bracket...');
    const qualifyingBracketResponse = await apiRequest('/brackets', 'POST', {
      tournamentId: qualifyingTournamentId,
      categoryId: qualifyingCategoryId,
      bracketType: 'ROUND_ROBIN',
      size: 8,
      totalRounds: 7, // Each player plays 7 matches (everyone vs everyone)
    }, tournamentAdminToken);
    const qualifyingBracketId = qualifyingBracketResponse.id;
    console.log(`✅ Round Robin bracket created (ID: ${qualifyingBracketId})\n`);

    // Get qualifying phases
    console.log('📝 Step 12: Fetching qualifying phases...');
    const qualifyingPhases = await apiRequest(`/phases?bracketId=${qualifyingBracketId}`, 'GET', null, tournamentAdminToken);
    console.log(`✅ Found ${qualifyingPhases.length} phases:`);
    qualifyingPhases.forEach((phase: any, index: number) => {
      console.log(`   Phase ${index + 1}: ${phase.name} (ID: ${phase.id})`);
    });
    console.log('');

    // Complete all qualifying matches
    console.log('📝 Step 13: Completing qualifying matches (simulated results)...');
    const qualifyingMatches = await apiRequest(`/matches?bracketId=${qualifyingBracketId}`, 'GET', null, tournamentAdminToken);
    console.log(`   Found ${qualifyingMatches.length} matches to complete`);
    
    let completedQualMatches = 0;
    for (const match of qualifyingMatches) {
      if (match.participant1Id && match.participant2Id) {
        // Simulate: participant with lower ranking wins (higher skill)
        const p1 = qualifyingPlayers.find(p => p.userId === match.participant1Id);
        const p2 = qualifyingPlayers.find(p => p.userId === match.participant2Id);
        const winnerId = (p1 && p2 && p1.ranking < p2.ranking) ? p1.userId : match.participant1Id;
        
        await completeMatchWithResult(match.id, winnerId, tournamentAdminToken);
        completedQualMatches++;
        if (completedQualMatches % 5 === 0) {
          console.log(`   ✓ Completed ${completedQualMatches}/${qualifyingMatches.length} matches...`);
        }
      }
    }
    console.log(`✅ Completed all ${completedQualMatches} qualifying matches\n`);

    // ==================== MAIN DRAW TOURNAMENT ====================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🏆 PART 2: Creating Main Draw Tournament (Single Elimination)');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📝 Step 14: Creating main draw tournament...');
    const mainDrawTournamentData = {
      name: 'Phase Linking Test - Main Draw 2026',
      location: 'La Laguna Tennis Academy',
      startDate: '2026-05-10',
      endDate: '2026-05-17',
      registrationOpenDate: '2026-04-01',
      registrationCloseDate: '2026-05-08',
      category: { gender: 'OPEN', age: 'OPEN', level: 'PROFESSIONAL' },
      surface: 'CLAY',
      tournamentType: 'SINGLES',
      maxParticipants: 16,
      registrationFee: 50.00,
      regulations: 'Main draw - includes 8 direct acceptances + 4 qualifiers + 2 wildcards + 2 alternates',
    };

    const mainDrawTournamentResponse = await apiRequest('/tournaments', 'POST', mainDrawTournamentData, tournamentAdminToken);
    const mainDrawTournamentId = mainDrawTournamentResponse.id;
    console.log(`✅ Main draw tournament created (ID: ${mainDrawTournamentId})\n`);

    console.log('📝 Step 15: Creating main draw category...');
    const mainDrawCategoryResponse = await apiRequest('/categories', 'POST', {
      tournamentId: mainDrawTournamentId,
      name: 'Open Singles - Main Draw',
      gender: 'OPEN',
      ageGroup: 'OPEN',
      maxParticipants: 16,
    }, tournamentAdminToken);
    const mainDrawCategoryId = mainDrawCategoryResponse.id;
    console.log(`✅ Category created (ID: ${mainDrawCategoryId})\n`);

    console.log('📝 Step 16: Opening main draw registration...');
    await apiRequest(`/tournaments/${mainDrawTournamentId}/status`, 'PUT', {
      status: 'REGISTRATION_OPEN',
    }, tournamentAdminToken);
    console.log('✅ Registration opened\n');

    console.log('📝 Step 17: Registering main draw players (direct acceptances)...');
    const mainDrawRegistrations: any[] = [];
    for (const player of mainDrawPlayers) {
      const registration = await apiRequest('/registrations', 'POST', {
        tournamentId: mainDrawTournamentId,
        categoryId: mainDrawCategoryId,
        participantId: player.userId,
      }, tournamentAdminToken);
      mainDrawRegistrations.push({ ...registration, player });
      console.log(`  ✅ ${player.firstName} ${player.lastName} (Direct)`);
    }
    console.log('');

    console.log('📝 Step 18: Registering alternates...');
    for (const player of alternatePlayers) {
      const registration = await apiRequest('/registrations', 'POST', {
        tournamentId: mainDrawTournamentId,
        categoryId: mainDrawCategoryId,
        participantId: player.userId,
      }, tournamentAdminToken);
      
      // Update to ALTERNATE status
      await apiRequest(`/registrations/${registration.id}`, 'PUT', {
        acceptanceType: 'ALTERNATE',
      }, tournamentAdminToken);
      
      mainDrawRegistrations.push({ ...registration, player });
      console.log(`  ✅ ${player.firstName} ${player.lastName} (Alternate)`);
    }
    console.log(`\n✅ ${mainDrawRegistrations.length} main draw registrations\n`);

    console.log('📝 Step 19: Accepting direct acceptance registrations...');
    for (const reg of mainDrawRegistrations.slice(0, 8)) { // Only main draw players
      await apiRequest(`/registrations/${reg.id}/status`, 'PUT', { status: 'ACCEPTED' }, tournamentAdminToken);
    }
    console.log('✅ Direct acceptances confirmed\n');

    console.log('📝 Step 20: Assigning seed numbers...');
    for (let i = 0; i < mainDrawPlayers.length; i++) {
      const reg = mainDrawRegistrations[i];
      await apiRequest(`/registrations/${reg.id}`, 'PUT', {
        seedNumber: mainDrawPlayers[i].ranking,
      }, tournamentAdminToken);
      console.log(`  ✅ Seed #${mainDrawPlayers[i].ranking}: ${reg.player.firstName} ${reg.player.lastName}`);
    }
    console.log('');

    console.log('📝 Step 21: Closing main draw registration...');
    await apiRequest(`/tournaments/${mainDrawTournamentId}/status`, 'PUT', {
      status: 'REGISTRATION_CLOSED',
    }, tournamentAdminToken);
    console.log('✅ Registration closed\n');

    console.log('📝 Step 22: Preparing main draw...');
    await apiRequest(`/tournaments/${mainDrawTournamentId}/status`, 'PUT', {
      status: 'DRAW_PENDING',
    }, tournamentAdminToken);
    console.log('✅ Main draw ready\n');

    console.log('📝 Step 23: Generating main draw bracket (16 players)...');
    const mainDrawBracketResponse = await apiRequest('/brackets', 'POST', {
      tournamentId: mainDrawTournamentId,
      categoryId: mainDrawCategoryId,
      bracketType: 'SINGLE_ELIMINATION',
      size: 16,
      totalRounds: 4, // R16, QF, SF, F
    }, tournamentAdminToken);
    const mainDrawBracketId = mainDrawBracketResponse.id;
    console.log(`✅ Main draw bracket created (ID: ${mainDrawBracketId})\n`);

    // Get main draw phases
    console.log('📝 Step 24: Fetching main draw phases...');
    const mainDrawPhases = await apiRequest(`/phases?bracketId=${mainDrawBracketId}`, 'GET', null, tournamentAdminToken);
    console.log(`✅ Found ${mainDrawPhases.length} phases:`);
    mainDrawPhases.forEach((phase: any, index: number) => {
      console.log(`   Phase ${index + 1}: ${phase.name} (ID: ${phase.id})`);
    });
    console.log('');

    // ==================== SUMMARY ====================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 SUCCESS! Phase Linking Test Environment Ready!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 Setup Summary:\n');
    console.log('  🏆 QUALIFYING TOURNAMENT:');
    console.log(`      ID: ${qualifyingTournamentId}`);
    console.log(`      Category ID: ${qualifyingCategoryId}`);
    console.log(`      Bracket ID: ${qualifyingBracketId}`);
    console.log(`      Type: Round Robin (8 players, all matches completed)`);
    console.log(`      Phases: ${qualifyingPhases.length}\n`);

    console.log('  🏆 MAIN DRAW TOURNAMENT:');
    console.log(`      ID: ${mainDrawTournamentId}`);
    console.log(`      Category ID: ${mainDrawCategoryId}`);
    console.log(`      Bracket ID: ${mainDrawBracketId}`);
    console.log(`      Type: Single Elimination (16 players)`);
    console.log(`      Phases: ${mainDrawPhases.length}`);
    console.log(`      Direct Acceptances: 8 (seeded)`);
    console.log(`      Alternates: 2\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 TESTING PHASE LINKING FEATURES');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('1️⃣  LINK QUALIFYING TO MAIN DRAW:');
    console.log(`   curl -X POST ${API_URL}/phases/link \\`);
    console.log(`     -H "Authorization: Bearer YOUR_TOKEN" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"sourcePhaseId":"${qualifyingPhases[qualifyingPhases.length - 1]?.id}","targetPhaseId":"${mainDrawPhases[0]?.id}"}'\n`);

    console.log('2️⃣  ADVANCE TOP 4 QUALIFIERS:');
    console.log(`   curl -X POST ${API_URL}/phases/advance-qualifiers \\`);
    console.log(`     -H "Authorization: Bearer YOUR_TOKEN" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{`);
    console.log(`       "sourcePhaseId":"${qualifyingPhases[qualifyingPhases.length - 1]?.id}",`);
    console.log(`       "targetPhaseId":"${mainDrawPhases[0]?.id}",`);
    console.log(`       "qualifierCount":4,`);
    console.log(`       "tournamentId":"${mainDrawTournamentId}",`);
    console.log(`       "categoryId":"${mainDrawCategoryId}"`);
    console.log(`     }'\n`);

    console.log('3️⃣  CREATE CONSOLATION DRAW:');
    console.log(`   curl -X POST ${API_URL}/phases/consolation \\`);
    console.log(`     -H "Authorization: Bearer YOUR_TOKEN" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{`);
    console.log(`       "mainPhaseId":"${mainDrawPhases[0]?.id}",`);
    console.log(`       "tournamentId":"${mainDrawTournamentId}",`);
    console.log(`       "categoryId":"${mainDrawCategoryId}"`);
    console.log(`     }'\n`);

    console.log('4️⃣  PROMOTE LUCKY LOSER (after a withdrawal):');
    console.log(`   curl -X POST ${API_URL}/phases/promote-lucky-loser \\`);
    console.log(`     -H "Authorization: Bearer YOUR_TOKEN" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{`);
    console.log(`       "withdrawnParticipantId":"PLAYER_UUID",`);
    console.log(`       "phaseId":"${mainDrawPhases[0]?.id}",`);
    console.log(`       "tournamentId":"${mainDrawTournamentId}",`);
    console.log(`       "categoryId":"${mainDrawCategoryId}"`);
    console.log(`     }'\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌐 VIEW IN BROWSER:\n');
    console.log(`   Qualifying: http://localhost:4201/tournaments/${qualifyingTournamentId}`);
    console.log(`   Main Draw:  http://localhost:4201/tournaments/${mainDrawTournamentId}`);
    console.log(`   Phase Mgmt: http://localhost:4201/tournaments/${mainDrawTournamentId}/phases`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

main().catch((error) => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});
