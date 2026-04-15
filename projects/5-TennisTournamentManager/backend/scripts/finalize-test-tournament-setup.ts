/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabian Gonzalez Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/scripts/finalize-test-tournament-setup.ts
 * @desc Finalizes tournament setup by advancing status and generating bracket.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

const API_URL = 'http://localhost:3000/api';

const TOURNAMENT_ADMIN_CREDENTIALS = {
  email: 'tournament@tennistournament.com',
  password: 'tourney123',
};

async function apiRequest(endpoint: string, method = 'GET', body?: unknown, token?: string): Promise<any> {
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

  return response.json();
}

async function main(): Promise<void> {
  const tournamentId = process.argv[2];
  const categoryId = process.argv[3];

  if (!tournamentId || !categoryId) {
    throw new Error('Usage: npx tsx scripts/finalize-test-tournament-setup.ts <tournamentId> <categoryId>');
  }

  const loginResponse = await apiRequest('/auth/login', 'POST', TOURNAMENT_ADMIN_CREDENTIALS);
  const token = loginResponse.token;

  await apiRequest(`/tournaments/${tournamentId}/status`, 'PUT', {status: 'REGISTRATION_CLOSED'}, token);
  await apiRequest(`/tournaments/${tournamentId}/status`, 'PUT', {status: 'DRAW_PENDING'}, token);

  await apiRequest('/brackets', 'POST', {
    tournamentId,
    categoryId,
    bracketType: 'SINGLE_ELIMINATION',
    size: 8,
    totalRounds: 3,
  }, token);

  console.log(`Finalized tournament ${tournamentId} and generated bracket for category ${categoryId}.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
