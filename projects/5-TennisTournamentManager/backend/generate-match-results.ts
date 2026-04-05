/**
 * Script to generate random match results for a Round Robin tournament
 * Usage: npx tsx generate-match-results.ts <tournamentId>
 */

const RESULTS_API_URL = 'http://localhost:3000/api';

// Tournament Admin credentials
const RESULTS_ADMIN_CREDENTIALS = {
  email: 'tournament@tennistournament.com',
  password: 'tourney123',
};

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
 * Main script
 */
async function main(): Promise<void> {
  const tournamentId = process.argv[2];

  if (!tournamentId) {
    console.error('❌ Please provide a tournament ID');
    console.error('Usage: npx tsx generate-match-results.ts <tournamentId>');
    process.exit(1);
  }

  console.log(`🎾 Generating random match results for tournament: ${tournamentId}\n`);

  try {
    // Step 1: Login as tournament admin
    console.log('📝 Step 1: Logging in as tournament admin...');
    const loginResponse = await apiRequest('/auth/login', 'POST', RESULTS_ADMIN_CREDENTIALS);
    const token = loginResponse.token;
    console.log('✅ Logged in successfully\n');

    // Step 2: Fetch all matches for the tournament
    console.log('📝 Step 2: Fetching matches for tournament...');
    const matches: Match[] = await apiRequest(`/matches?tournamentId=${tournamentId}`, 'GET', null, token);
    
    if (!matches || matches.length === 0) {
      console.error('❌ No matches found for this tournament');
      process.exit(1);
    }

    console.log(`✅ Found ${matches.length} matches\n`);

    // Step 3: Filter matches that need results
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

    // Step 4: Generate and submit results for each match
    console.log('📝 Step 3: Generating random results...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const match of matchesNeedingResults) {
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

        console.log(`  Match ${match.matchNumber} (Round ${match.round}): ${p1Name} vs ${p2Name}`);
        console.log(`    Result: ${score}`);
        console.log(`    Winner: ${winnerName}`);

        // Update the match
        await apiRequest(
          `/matches/${match.id}`,
          'PUT',
          {
            winnerId,
            score,
            status: 'COMPLETED',
          },
          token
        );

        console.log(`    ✅ Result saved\n`);
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
    console.log(`  ✅ Successfully generated: ${successCount} results`);
    if (errorCount > 0) {
      console.log(`  ❌ Errors: ${errorCount}`);
    }
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n🎉 Done! You can now view the statistics at:');
      console.log(`   http://localhost:4200/5-TennisTournamentManager/statistics`);
    }

  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
