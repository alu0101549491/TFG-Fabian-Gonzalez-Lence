/**
 * Script to update ALL matches (including completed ones) with schedules and courts
 * Usage: npx tsx scripts/update-match-schedules.ts <tournamentId>
 */

const API_URL = 'http://localhost:3000/api';

const ADMIN_CREDENTIALS = {
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
  scheduledTime: string | null;
  courtId: string | null;
  status: string;
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
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

function generateSchedules(
  totalMatches: number,
  startDate: string,
  endDate: string,
  courts: Court[]
): Array<{ scheduledTime: string; courtId: string }> {
  const schedules: Array<{ scheduledTime: string; courtId: string }> = [];
  
  if (courts.length === 0) {
    return Array(totalMatches).fill({ scheduledTime: null, courtId: null });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const timeSlots = [
    '09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30'
  ];

  const matchesPerDay = Math.ceil(totalMatches / totalDays);
  const matchesPerSlot = Math.ceil(matchesPerDay / timeSlots.length);

  let matchIndex = 0;

  for (let day = 0; day < totalDays && matchIndex < totalMatches; day++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + day);

    for (const timeSlot of timeSlots) {
      if (matchIndex >= totalMatches) break;

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

async function main(): Promise<void> {
  const tournamentId = process.argv[2];

  if (!tournamentId) {
    console.error('❌ Please provide a tournament ID');
    console.error('Usage: npx tsx scripts/update-match-schedules.ts <tournamentId>');
    process.exit(1);
  }

  console.log(`🎾 Updating match schedules for tournament: ${tournamentId}\n`);

  try {
    console.log('📝 Step 1: Logging in...');
    const loginResponse = await apiRequest('/auth/login', 'POST', ADMIN_CREDENTIALS);
    const token = loginResponse.token;
    console.log('✅ Logged in\n');

    console.log('📝 Step 2: Fetching tournament...');
    const tournament: Tournament = await apiRequest(`/tournaments/${tournamentId}`, 'GET', null, token);
    console.log(`✅ ${tournament.name}\n`);

    console.log('📝 Step 3: Fetching courts...');
    const courts: Court[] = await apiRequest(`/courts?tournamentId=${tournamentId}`, 'GET', null, token);
    console.log(`✅ Found ${courts.length} court(s)\n`);

    if (courts.length === 0) {
      console.error('❌ No courts available. Create courts first with: npx tsx scripts/create-courts.ts');
      process.exit(1);
    }

    console.log('📝 Step 4: Fetching matches...');
    const matches: Match[] = await apiRequest(`/matches?tournamentId=${tournamentId}`, 'GET', null, token);
    console.log(`✅ Found ${matches.length} matches\n`);

    const matchesNeedingSchedules = matches.filter(m => !m.scheduledTime || !m.courtId);
    console.log(`📊 ${matchesNeedingSchedules.length} matches need schedules\n`);

    if (matchesNeedingSchedules.length === 0) {
      console.log('✅ All matches already scheduled!');
      return;
    }

    console.log('📝 Step 5: Generating schedules...');
    const schedules = generateSchedules(
      matchesNeedingSchedules.length,
      tournament.startDate,
      tournament.endDate,
      courts
    );
    console.log('✅ Schedules generated\n');

    console.log('📝 Step 6: Updating matches...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < matchesNeedingSchedules.length; i++) {
      const match = matchesNeedingSchedules[i];
      const schedule = schedules[i];
      
      try {
        const court = courts.find(c => c.id === schedule.courtId);
        const scheduleTime = new Date(schedule.scheduledTime).toLocaleString('en-US', { 
          dateStyle: 'short', 
          timeStyle: 'short' 
        });

        await apiRequest(
          `/matches/${match.id}`,
          'PUT',
          {
            scheduledTime: schedule.scheduledTime,
            courtId: schedule.courtId,
          },
          token
        );

        console.log(`  ✅ Match ${match.matchNumber}: ${court?.name} @ ${scheduleTime}`);
        successCount++;

        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error: any) {
        console.error(`  ❌ Match ${match.matchNumber}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`  ✅ Updated: ${successCount} matches`);
    if (errorCount > 0) {
      console.log(`  ❌ Errors: ${errorCount}`);
    }
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n🎉 Done! All matches now have schedules and court assignments.');
      console.log('   Export ITF CSV to see complete match data with courts and times!');
    }

  } catch (error: any) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
