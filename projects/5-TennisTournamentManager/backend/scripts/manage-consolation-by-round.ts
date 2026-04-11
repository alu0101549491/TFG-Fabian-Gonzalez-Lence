/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabian Gonzalez Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/scripts/manage-consolation-by-round.ts
 * @desc Creates and populates a consolation draw for a selected main-round order.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

const API_URL = 'http://localhost:3000/api';

const TOURNAMENT_ADMIN_CREDENTIALS = {
  email: 'tournament@tennistournament.com',
  password: 'tourney123',
};

interface BracketDto {
  id: string;
  categoryId: string;
}

interface PhaseDto {
  id: string;
  order: number;
  name: string;
}

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
  const mainRoundOrderRaw = process.argv[3];
  const mainRoundOrder = Number(mainRoundOrderRaw);

  if (!tournamentId || Number.isNaN(mainRoundOrder)) {
    throw new Error('Usage: npx tsx scripts/manage-consolation-by-round.ts <tournamentId> <mainRoundOrder>');
  }

  const loginResponse = await apiRequest('/auth/login', 'POST', TOURNAMENT_ADMIN_CREDENTIALS);
  const token = loginResponse.token;

  const brackets = await apiRequest(`/brackets?tournamentId=${tournamentId}`, 'GET', undefined, token) as BracketDto[];
  if (!brackets.length) {
    throw new Error(`No bracket found for tournament ${tournamentId}`);
  }

  const bracket = brackets[0];
  const phases = await apiRequest(`/phases?bracketId=${bracket.id}`, 'GET', undefined, token) as PhaseDto[];

  const mainPhase = phases.find((p) => p.order === mainRoundOrder);
  if (!mainPhase) {
    throw new Error(`No main phase found for order ${mainRoundOrder}`);
  }

  const createResponse = await apiRequest('/phases/consolation', 'POST', {
    mainPhaseId: mainPhase.id,
    tournamentId,
    categoryId: bracket.categoryId,
  }, token);

  const consolationPhaseId = createResponse.consolationPhase.id as string;

  const populateResponse = await apiRequest('/phases/populate-consolation', 'POST', {
    consolationPhaseId,
    tournamentId,
    categoryId: bracket.categoryId,
  }, token);

  console.log(`Main phase: ${mainPhase.name} (order ${mainRoundOrder})`);
  console.log(`Created consolation phase: ${createResponse.consolationPhase.name} (${consolationPhaseId})`);
  console.log(`Populate result: losers=${populateResponse.losersCount}, matches=${populateResponse.matchesCreated}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
