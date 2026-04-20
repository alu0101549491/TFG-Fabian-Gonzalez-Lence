/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 20, 2026
 * @file e2e/fixtures/test-data.ts
 * @desc Shared E2E users, tournaments, and reusable payload fixtures.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/** Basic user credentials and metadata used across E2E suites. */
const ADMIN_PASSWORD =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD ??
  process.env.PW_E2E_ADMIN_PASSWORD ??
  'admin123';

const TOURNAMENT_ADMIN_PASSWORD =
  process.env.PLAYWRIGHT_TOURNAMENT_ADMIN_PASSWORD ??
  process.env.PW_E2E_TOURNAMENT_ADMIN_PASSWORD ??
  'tourney123';

const PLAYER_PASSWORD =
  process.env.PLAYWRIGHT_PLAYER_PASSWORD ??
  process.env.PW_E2E_PLAYER_PASSWORD ??
  'player123';

export const TEST_USERS = {
  sysAdmin: {
    email: 'admin@tennistournament.com',
    password: ADMIN_PASSWORD,
    name: 'System Admin',
    role: 'SYSTEM_ADMIN',
  },
  tournamentAdmin1: {
    email: 'tournament@tennistournament.com',
    password: TOURNAMENT_ADMIN_PASSWORD,
    name: 'Tournament Admin',
    role: 'TOURNAMENT_ADMIN',
  },
  tournamentAdmin2: {
    email: 'tournament@tennistournament.com',
    password: TOURNAMENT_ADMIN_PASSWORD,
    name: 'Tournament Admin',
    role: 'TOURNAMENT_ADMIN',
  },
  participant1: {
    email: 'player@example.com',
    password: PLAYER_PASSWORD,
    name: 'Player One',
    role: 'PLAYER',
    ranking: 150,
  },
  participant2: {
    email: 'maria@example.com',
    password: PLAYER_PASSWORD,
    name: 'Player Two',
    role: 'PLAYER',
    ranking: 200,
  },
  participant3: {
    email: 'maria@example.com',
    password: PLAYER_PASSWORD,
    name: 'Player Three',
    role: 'PLAYER',
    ranking: 250,
  },
} as const;

/** Canonical tournament fixtures referenced in the scenario plan. */
export const TEST_TOURNAMENTS = {
  openRegistration: {
    id: 'T-001',
    name: 'Open Registration Tournament',
    status: 'REGISTRATION_OPEN',
    drawType: 'SINGLE_ELIMINATION',
    adminEmail: TEST_USERS.tournamentAdmin1.email,
  },
  activeKnockout: {
    id: 'T-002',
    name: 'Active Knockout Tournament',
    status: 'IN_PROGRESS',
    drawType: 'SINGLE_ELIMINATION',
    adminEmail: TEST_USERS.tournamentAdmin1.email,
  },
  activeRoundRobin: {
    id: 'T-003',
    name: 'Active Round Robin Tournament',
    status: 'IN_PROGRESS',
    drawType: 'ROUND_ROBIN',
    adminEmail: TEST_USERS.tournamentAdmin2.email,
  },
  finalized: {
    id: 'T-004',
    name: 'Finalized Tournament',
    status: 'FINALIZED',
    drawType: 'SINGLE_ELIMINATION',
    adminEmail: TEST_USERS.tournamentAdmin1.email,
  },
  draft: {
    id: 'T-005',
    name: 'Draft Match Play Tournament',
    status: 'DRAFT',
    drawType: 'MATCH_PLAY',
    adminEmail: TEST_USERS.tournamentAdmin2.email,
  },
} as const;

/** Known match identifiers seeded by the backend or dedicated E2E setup. */
export const TEST_MATCHES = {
  scheduled: 'M-201',
  inProgress: 'M-202',
  suspended: 'M-203',
  completed: 'M-204',
  disputed: 'M-205',
  roundRobinCompleted1: 'M-301',
  roundRobinCompleted2: 'M-302',
} as const;

/** Supported match-state codes rendered in the UI. */
export const MATCH_STATES = [
  'TBP', 'IP', 'SUS', 'CO', 'RET', 'WO',
  'ABN', 'BYE', 'NP', 'CAN', 'DEF', 'DR',
] as const;

/** Registration entry-state abbreviations referenced by product requirements. */
export const ENTRY_STATES = [
  'OA', 'DA', 'SE', 'JE', 'QU', 'LL', 'WC', 'ALT', 'WD',
] as const;

/** Valid payload for tournament-creation happy-path tests. */
export const NEW_TOURNAMENT_DATA = {
  valid: {
    name: 'E2E Test Tournament',
    location: 'La Laguna',
    surface: 'CLAY',
    facilityType: 'OUTDOOR',
    tournamentType: 'SINGLES',
    maxParticipants: 16,
    rankingSystem: 'POINTS_BASED',
    registrationFee: '0',
    currency: 'EUR',
    primaryColor: '#2563eb',
    secondaryColor: '#10b981',
    logoUrl: 'https://example.com/logo.png',
    regulations: 'Standard E2E regulations for automated testing.',
  },
  invalidDates: {
    name: 'Bad Dates Tournament',
    location: 'La Laguna',
    startDate: '2026-06-10',
    endDate: '2026-06-05',
  },
} as const;

/** Valid score payload used in score-entry scenarios. */
export const VALID_SCORE_SET = {
  sets: [{p1: 6, p2: 3}, {p1: 6, p2: 4}],
  status: 'COMPLETED',
  ballProvider: 'Wilson US Open',
  comments: 'E2E test result',
} as const;

/** Default privacy level values used by privacy assertions. */
export const PRIVACY_LEVELS = {
  public: 'PUBLIC',
  registeredUsers: 'ALL_REGISTERED',
  sameTournament: 'TOURNAMENT_PARTICIPANTS',
  adminsOnly: 'ADMINS_ONLY',
} as const;

/** Helper tuple of high-level directories for smoke execution. */
export const TEST_PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;