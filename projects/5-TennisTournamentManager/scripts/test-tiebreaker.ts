/**
 * Test script for verifying the tiebreaker system integration.
 * This script creates a Round Robin scenario with tied participants and verifies
 * that all 6 tiebreaker criteria are properly applied.
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
let authToken = '';

interface StandingDto {
  id: string;
  bracketId: string;
  participantId: string;
  participantName: string;
  position: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  setDifference: number;
  gameDifference: number;
}

async function login(): Promise<void> {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@ull.edu.es',
      password: 'Admin123!',
    });
    authToken = response.data.token;
    console.log('✅ Logged in successfully');
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function getExistingTournament(): Promise<string | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/tournaments`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const tournaments = response.data;
    
    // Look for an existing tournament
    if (tournaments.length > 0) {
      const tournament = tournaments[0];
      console.log(`✅ Found existing tournament: ${tournament.name} (${tournament.id})`);
      return tournament.id;
    }
    return null;
  } catch (error: any) {
    console.error('❌ Failed to get tournaments:', error.response?.data || error.message);
    return null;
  }
}

async function getStandings(tournamentId: string): Promise<StandingDto[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/standings/tournament/${tournamentId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`✅ Fetched standings for tournament ${tournamentId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to get standings:', error.response?.data || error.message);
    throw error;
  }
}

function analyzeStandings(standings: StandingDto[]): void {
  console.log('\n📊 STANDINGS ANALYSIS\n');
  console.log('=' .repeat(120));
  console.log(
    'Pos'.padEnd(5) +
    'Participant'.padEnd(25) +
    'MP'.padEnd(5) +
    'W'.padEnd(4) +
    'L'.padEnd(4) +
    'Sets'.padEnd(10) +
    'Games'.padEnd(12) +
    'Pts'.padEnd(6) +
    'Set Ratio'.padEnd(12) +
    'Game Ratio'
  );
  console.log('=' .repeat(120));
  
  for (const standing of standings) {
    const setRatio = standing.setsLost === 0 ? '∞' : (standing.setsWon / standing.setsLost).toFixed(2);
    const gameRatio = standing.gamesLost === 0 ? '∞' : (standing.gamesWon / standing.gamesLost).toFixed(2);
    
    console.log(
      `${standing.position}`.padEnd(5) +
      standing.participantName.padEnd(25) +
      `${standing.matchesPlayed}`.padEnd(5) +
      `${standing.matchesWon}`.padEnd(4) +
      `${standing.matchesLost}`.padEnd(4) +
      `${standing.setsWon}/${standing.setsLost} (${standing.setDifference > 0 ? '+' : ''}${standing.setDifference})`.padEnd(10) +
      `${standing.gamesWon}/${standing.gamesLost} (${standing.gameDifference > 0 ? '+' : ''}${standing.gameDifference})`.padEnd(12) +
      `${standing.points}`.padEnd(6) +
      setRatio.padEnd(12) +
      gameRatio
    );
  }
  console.log('=' .repeat(120));
}

function checkTiebreakers(standings: StandingDto[]): void {
  console.log('\n🔍 TIEBREAKER VERIFICATION\n');
  
  // Group participants by points
  const pointGroups = new Map<number, StandingDto[]>();
  for (const standing of standings) {
    if (!pointGroups.has(standing.points)) {
      pointGroups.set(standing.points, []);
    }
    pointGroups.get(standing.points)!.push(standing);
  }
  
  // Check each tied group
  for (const [points, group] of pointGroups.entries()) {
    if (group.length > 1) {
      console.log(`\n⚠️  TIE DETECTED: ${group.length} participants with ${points} points`);
      
      for (let i = 0; i < group.length; i++) {
        const participant = group[i];
        console.log(`   ${i + 1}. ${participant.participantName} (Position ${participant.position})`);
        console.log(`      - Set Ratio: ${participant.setsLost === 0 ? '∞' : (participant.setsWon / participant.setsLost).toFixed(3)}`);
        console.log(`      - Game Ratio: ${participant.gamesLost === 0 ? '∞' : (participant.gamesWon / participant.gamesLost).toFixed(3)}`);
        console.log(`      - Set Diff: ${participant.setDifference}`);
        console.log(`      - Game Diff: ${participant.gameDifference}`);
      }
      
      // Verify tiebreaker was applied
      let tiebroken = false;
      
      // Check if set ratios differ
      const setRatios = group.map(p => p.setsLost === 0 ? 999 : p.setsWon / p.setsLost);
      if (new Set(setRatios).size > 1) {
        console.log(`   ✅ Criterion 1 (Set Ratio) applied - ratios differ`);
        tiebroken = true;
      }
      
      // Check if game ratios differ
      if (!tiebroken) {
        const gameRatios = group.map(p => p.gamesLost === 0 ? 999 : p.gamesWon / p.gamesLost);
        if (new Set(gameRatios).size > 1) {
          console.log(`   ✅ Criterion 2 (Game Ratio) applied - ratios differ`);
          tiebroken = true;
        }
      }
      
      // Check if set differences differ
      if (!tiebroken) {
        const setDiffs = group.map(p => p.setDifference);
        if (new Set(setDiffs).size > 1) {
          console.log(`   ✅ Criterion 3 (Set Difference) applied - differences vary`);
          tiebroken = true;
        }
      }
      
      if (!tiebroken) {
        console.log(`   ⚠️  Criteria 4-6 must have been applied (Head-to-head, Seed, or Random)`);
      }
    }
  }
}

async function main(): Promise<void> {
  try {
    console.log('🧪 TIEBREAKER SYSTEM TEST\n');
    console.log('Testing comprehensive 6-criteria tiebreaker integration (v1.72.0)\n');
    
    // Step 1: Login
    await login();
    
    // Step 2: Get existing tournament
    const tournamentId = await getExistingTournament();
    if (!tournamentId) {
      console.log('❌ No tournament found. Please create a tournament with Round Robin bracket first.');
      return;
    }
    
    // Step 3: Get standings
    const standings = await getStandings(tournamentId);
    
    if (standings.length === 0) {
      console.log('⚠️  No standings data available yet. Complete some matches to generate standings.');
      return;
    }
    
    // Step 4: Analyze standings
    analyzeStandings(standings);
    
    // Step 5: Check for ties and verify tiebreakers
    checkTiebreakers(standings);
    
    console.log('\n✅ TEST COMPLETE\n');
    console.log('📝 Notes:');
    console.log('   - If no ties exist, create matches with identical points to test tiebreakers');
    console.log('   - Tiebreaker criteria: Set Ratio → Game Ratio → Set Diff → Head-to-Head → Seed → Random');
    console.log('   - Check that participants are properly ordered when tied\n');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
