/**
 * Script to generate random match results for a Round Robin tournament
 * Also assigns courts and schedules to matches
 * Usage: npx tsx scripts/generate-match-results.ts <tournamentId>
 */

const RESULTS_API_URL = 'http://localhost:3000/api';

// Tournament Admin credentials
const RESULTS_ADMIN_CREDENTIALS = {
  email: 'tournament@tennistournament.com',
  password: 'tourney123',
};

interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Court {
  id: string;
  name: string;
  surface: string;
  isAvailable: boolean;
}

interface Match {
  id: string;
  matchNumber: number;
  round: number;
  participant1Id: string | null;
  participant2Id: string | null;
  participant1?: { firstName: string; lastName: string };
  participant2?: { firstName: string; lastName: string };
  winnerId: string | null;
  status: string;
  score: string | null;
  scheduledTime: string | null;
  courtId: string | null;
}

/**
 * API request helper
 */
async function apiRequest(endpoint: string, method: string = 'GET', body?: any, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${RESULTS_API_URL}${endpoint}`, {
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

/**
 * Generate a random tennis set score
 * @returns A set score like "6-4", "7-5", "6-0", etc.
 */
function generateSetScore(): { score: string; winner: 1 | 2 } {
  const scenarios: Array<{ score: string; winner: 1 | 2 }> = [
    // Regular wins
    { score: '6-0', winner: 1 },
    { score: '6-1', winner: 1 },
    { score: '6-2', winner: 1 },
    { score: '6-3', winner: 1 },
    { score: '6-4', winner: 1 },
    { score: '7-5', winner: 1 },
    { score: '7-6', winner: 1 }, // Tiebreak
    // Inverted scores (player 2 wins)
    { score: '0-6', winner: 2 },
    { score: '1-6', winner: 2 },
    { score: '2-6', winner: 2 },
    { score: '3-6', winner: 2 },
    { score: '4-6', winner: 2 },
    { score: '5-7', winner: 2 },
    { score: '6-7', winner: 2 }, // Tiebreak
  ];

  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

/**
 * Generate a complete match result (best of 3 sets)
 * @param participant1Id 
 * @param participant2Id 
 * @returns Match result with winnerId and score string
 */
function generateMatchResult(participant1Id: string, participant2Id: string): { winnerId: string; score: string } {
  const sets: string[] = [];
  let player1Sets = 0;
  let player2Sets = 0;

  // Play up to 3 sets (first to 2 sets wins)
  while (player1Sets < 2 && player2Sets < 2) {
    const setResult = generateSetScore();
    sets.push(setResult.score);

    if (setResult.winner === 1) {
      player1Sets++;
    } else {
      player2Sets++;
    }
  }

  const winnerId = player1Sets === 2 ? participant1Id : participant2Id;
  const score = sets.join(', ');

  return { winnerId, score };
}

/**
 * Generate match schedules distributed across tournament days
 * @param totalMatches Total number of matches to schedule
 * @param startDate Tournament start date
 * @param endDate Tournament end date
 * @param courts Available courts
 * @returns Array of schedule assignments
 */
function generateSchedules(
  totalMatches: number,
  startDate: string,
  endDate: string,
  courts: Court[]
): Array<{ scheduledTime: string; courtId: string }> {
  const schedules: Array<{ scheduledTime: string; courtId: string }> = [];
  
  if (courts.length === 0) {
    console.warn('⚠️  No courts available - matches will be unassigned');
    // Return unscheduled matches
    return Array(totalMatches).fill({ scheduledTime: null, courtId: null });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Time slots per day (9:00 AM to 8:00 PM, 1.5 hour slots)
  const timeSlots = [
    '09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30'
  ];

  // Calculate matches per day
  const matchesPerDay = Math.ceil(totalMatches / totalDays);
  const matchesPerSlot = Math.ceil(matchesPerDay / timeSlots.length);

  let matchIndex = 0;

  // Distribute matches across days and time slots
  for (let day = 0; day < totalDays && matchIndex < totalMatches; day++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + day);

    for (const timeSlot of timeSlots) {
      if (matchIndex >= totalMatches) break;

      // Assign matches to courts for this time slot
      for (let courtIndex = 0; courtIndex < courts.length && matchIndex < totalMatches; courtIndex++) {
        for (let i = 0; i < matchesPerSlot && matchIndex < totalMatches; i++) {
          const scheduledTime = `${currentDate.toISOString().split('T')[0]}T${timeSlot}:00.000Z`;
          const courtId = courts[courtIndex].id;

          schedules.push({ scheduledTime, courtId });
          matchIndex++;
        }
      }
    }
  }

  // Fill remaining matches if needed
  while (schedules.length < totalMatches) {
    const randomCourt = courts[Math.floor(Math.random() * courts.length)];
    const randomDay = Math.floor(Math.random() * totalDays);
    const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + randomDay);
    const scheduledTime = `${currentDate.toISOString().split('T')[0]}T${randomSlot}:00.000Z`;

    schedules.push({ scheduledTime, courtId: randomCourt.id });
  }

  return schedules;
}

/**
 * Main script
 */
async function main(): Promise<void> {
  const tournamentId = process.argv[2];

  if (!tournamentId) {
    console.error('❌ Please provide a tournament ID');
    console.error('Usage: npx tsx scripts/generate-match-results.ts <tournamentId>');
    process.exit(1);
  }

  console.log(`🎾 Generating random match results for tournament: ${tournamentId}\n`);

  try {
    // Step 1: Login as tournament admin
    console.log('📝 Step 1: Logging in as tournament admin...');
    const loginResponse = await apiRequest('/auth/login', 'POST', RESULTS_ADMIN_CREDENTIALS);
    const token = loginResponse.token;
    console.log('✅ Logged in successfully\n');

    // Step 2: Fetch tournament details
    console.log('📝 Step 2: Fetching tournament details...');
    const tournament: Tournament = await apiRequest(`/tournaments/${tournamentId}`, 'GET', null, token);
    console.log(`✅ Tournament: ${tournament.name}`);
    console.log(`   Dates: ${tournament.startDate} to ${tournament.endDate}\n`);

    // Step 3: Fetch courts for tournament
    console.log('📝 Step 3: Fetching courts...');
    const courts: Court[] = await apiRequest(`/courts?tournamentId=${tournamentId}`, 'GET', null, token);
    console.log(`✅ Found ${courts.length} court(s)\n`);

    if (courts.length > 0) {
      courts.forEach(court => {
        console.log(`   - ${court.name} (${court.surface})`);
      });
      console.log('');
    }

    // Step 4: Fetch all matches for the tournament
    console.log('📝 Step 4: Fetching matches for tournament...');
    const matches: Match[] = await apiRequest(`/matches?tournamentId=${tournamentId}`, 'GET', null, token);
    
    if (!matches || matches.length === 0) {
      console.error('❌ No matches found for this tournament');
      process.exit(1);
    }

    console.log(`✅ Found ${matches.length} matches\n`);

    // Step 5: Filter matches that need results
    const matchesNeedingResults = matches.filter(
      (match) => 
        match.participant1Id && 
        match.participant2Id && 
        !match.winnerId &&
        match.status !== 'COMPLETED' &&
        match.status !== 'CANCELLED'
    );

    console.log(`📊 ${matchesNeedingResults.length} matches need results\n`);

    if (matchesNeedingResults.length === 0) {
      console.log('✅ All matches already have results!');
      return;
    }

    // Step 6: Generate schedules for matches
    console.log('📝 Step 5: Generating schedules and court assignments...');
    const schedules = generateSchedules(
      matchesNeedingResults.length,
      tournament.startDate,
      tournament.endDate,
      courts
    );
    console.log('✅ Schedules generated\n');

    // Step 7: Update matches with schedules and courts, then generate results
    console.log('📝 Step 6: Assigning schedules and generating results...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < matchesNeedingResults.length; i++) {
      const match = matchesNeedingResults[i];
      const schedule = schedules[i];
      
      try {
        const { winnerId, score } = generateMatchResult(match.participant1Id!, match.participant2Id!);

        // Get participant names for display
        const p1Name = match.participant1 
          ? `${match.participant1.firstName} ${match.participant1.lastName}`
          : 'Player 1';
        const p2Name = match.participant2 
          ? `${match.participant2.firstName} ${match.participant2.lastName}`
          : 'Player 2';

        const winnerName = winnerId === match.participant1Id ? p1Name : p2Name;

        // Get court name for display
        const court = courts.find(c => c.id === schedule.courtId);
        const courtName = court ? court.name : 'Unassigned';
        const scheduleTime = schedule.scheduledTime 
          ? new Date(schedule.scheduledTime).toLocaleString('en-US', { 
              dateStyle: 'short', 
              timeStyle: 'short' 
            })
          : 'Unscheduled';

        console.log(`  Match ${match.matchNumber} (Round ${match.round}): ${p1Name} vs ${p2Name}`);
        console.log(`    Court: ${courtName}`);
        console.log(`    Time: ${scheduleTime}`);
        console.log(`    Result: ${score}`);
        console.log(`    Winner: ${winnerName}`);

        // Update the match with schedule, court, and result
        await apiRequest(
          `/matches/${match.id}`,
          'PUT',
          {
            scheduledTime: schedule.scheduledTime,
            courtId: schedule.courtId,
            winnerId,
            score,
            status: 'COMPLETED',
          },
          token
        );

        console.log(`    ✅ Match updated with schedule and result\n`);
        successCount++;

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`    ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`  ✅ Matches updated: ${successCount}`);
    console.log(`     - Schedules assigned: ${successCount}`);
    console.log(`     - Courts assigned: ${courts.length > 0 ? successCount : 0}`);
    console.log(`     - Results generated: ${successCount}`);
    if (errorCount > 0) {
      console.log(`  ❌ Errors: ${errorCount}`);
    }
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n🎉 Done! Match schedules, courts, and results have been generated.');
      console.log('   You can now export the ITF CSV to see complete match data:');
      console.log(`   http://localhost:4200/5-TennisTournamentManager/tournaments/${tournamentId}`);
    }

  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
