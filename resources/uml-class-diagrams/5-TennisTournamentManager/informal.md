# Initial

## 🎾 **Architecture Overview (50+ classes organized in layers):**

Excellent! I've created a comprehensive UML diagram for the tennis tournament management system. This is the most complex one yet!

### **User & Authentication Layer (11 classes):**

1. **User** (abstract) - Base class for all user types
2. **SystemAdministrator** - Complete platform control
3. **TournamentAdministrator** - Manages specific tournaments
4. **RegisteredParticipant** - Players with registration capabilities
5. **UnregisteredUser** - Public read-only access
6. **UserRole** - 4 role types
7. **Permission** - 17 granular permissions
8. **PrivacySettings** - Configurable data visibility
9. **VisibilityLevel** - 4 visibility levels
10. **NotificationPreferences** - User notification settings

### **Tournament Layer (9 classes):**

1. **Tournament** - Core tournament entity
2. **TournamentData** - Interface for creation
3. **TournamentCategory** - Gender/Age/Level classification
4. **Gender, AgeCategory** - Enums for categories
5. **Surface, InstallationType** - Court characteristics
6. **Court** - Court management
7. **TimeSlot** - Availability scheduling

### **Registration Layer (2 classes):**

1. **Registration** - Tournament registration
2. **EntryStatus** - 9 entry statuses (OA, DA, WC, etc.)

### **Bracket System Layer (7 classes):**

1. **Bracket** (abstract) - Base bracket class
2. **RoundRobinBracket** - All-vs-all implementation
3. **KnockoutBracket** - Elimination bracket
4. **MatchPlayBracket** - Open format
5. **BracketType** - Enum for types
6. **RankingSystem** - Points/Ratio configuration
7. **RankingType** - Enum for ranking types

### **Match Layer (5 classes):**

1. **Match** - Match entity with scheduling
2. **MatchFormat** - Sets/Games configuration
3. **MatchStatus** - 13 match states (TBP, CO, WO, etc.)
4. **MatchResult** - Result with confirmation system
5. **SetScore** - Individual set scores

### **Ranking Layer (4 classes):**

1. **Ranking** - Bracket rankings
2. **RankingEntry** - Individual participant ranking
3. **TiebreakCriterion** - 7 tiebreak methods

### **Order of Play Layer (3 classes):**

1. **OrderOfPlay** - Daily schedule
2. **ScheduledMatch** - Match with time/court
3. **OrderOfPlayGenerator** - Automatic scheduling

### **Announcement Layer (2 classes):**

1. **Announcement** - Public/Private announcements
2. **AnnouncementData** - Interface for creation

### **Notification Layer (4 classes):**

1. **Notification** - Individual notifications
2. **NotificationEvent** - 11 event types
3. **NotificationChannel** - 4 channels (Email, Telegram, etc.)
4. **NotificationService** - Multi-channel delivery

### **Statistics Layer (3 classes):**

1. **ParticipantStatistics** - Player stats
2. **HeadToHeadStats** - Player vs player
3. **TournamentStatistics** - Tournament-wide stats

### **Application Services Layer (5 classes):**

1. **TournamentService** - Tournament CRUD
2. **RegistrationService** - Registration management
3. **BracketService** - Bracket/Draw operations
4. **MatchService** - Match and result management
5. **StatisticsService** - Statistics calculation

### **Main Controller (2 classes):**

1. **ApplicationController** - Main orchestrator
2. **DashboardData** - Interface for user dashboard

## ✅ **Design Highlights:**

- **Abstract bracket system** - Easy to add new bracket types
- **Comprehensive match states** - 13 different states (TBP, WO, RET, etc.)
- **Flexible ranking system** - Points, ratio, or mixed with 7 tiebreak criteria
- **Result confirmation workflow** - Dispute and validation system
- **Multi-channel notifications** - Email, Telegram, Web Push, In-app
- **Privacy controls** - 4 visibility levels for user data
- **Court scheduling** - Automatic order of play generation
- **Role-based permissions** - 4 user types with 17 permissions
- **No god classes** - Well-distributed responsibilities
- **Export capabilities** - ITF and TODS format support

```mermaid
classDiagram
    %% ============================================
    %% TENNIS TOURNAMENT MANAGEMENT SYSTEM
    %% ============================================

    %% ============================================
    %% USER & AUTHENTICATION LAYER
    %% ============================================
    
    class User {
        <<abstract>>
        #id: string
        #firstName: string
        #lastName: string
        #email: string
        #password: string
        #identityDocument: string
        #phone: string
        #avatarImage: string
        #ranking: number
        #privacySettings: PrivacySettings
        #notificationPreferences: NotificationPreferences
        
        +constructor(userData: UserData)
        +getId(): string
        +getName(): string
        +getEmail(): string
        +getRole(): UserRole*
        +hasPermission(permission: Permission): boolean*
        +updateProfile(data: Partial~UserData~): void
        +updatePrivacySettings(settings: PrivacySettings): void
        +updateNotificationPreferences(prefs: NotificationPreferences): void
    }

    class SystemAdministrator {
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
        +createTournament(data: TournamentData): Tournament
        +deleteTournament(tournamentId: string): void
        +manageAllParticipants(): void
        +configureGlobalSettings(settings: GlobalSettings): void
        +assignTournamentAdmin(userId: string, tournamentId: string): void
    }

    class TournamentAdministrator {
        -managedTournaments: string[]
        
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
        +getManagedTournaments(): string[]
        +canManageTournament(tournamentId: string): boolean
        +createOwnTournament(data: TournamentData): Tournament
        +designDraw(tournamentId: string, drawConfig: DrawConfig): void
        +generateOrderOfPlay(tournamentId: string, date: Date): OrderOfPlay
        +validateResult(resultId: string): void
        +markTournamentCompleted(tournamentId: string): void
    }

    class RegisteredParticipant {
        -registrations: string[]
        -matchHistory: Map~string, MatchResult[]~
        
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
        +registerForTournament(tournamentId: string, category: string): Registration
        +withdrawFromTournament(tournamentId: string): void
        +enterMatchResult(matchId: string, result: MatchResult): void
        +confirmResult(resultId: string): void
        +disputeResult(resultId: string, reason: string): void
        +getRegistrations(): string[]
        +getMatchHistory(opponentId: string): MatchResult[]
        +getStatistics(): ParticipantStatistics
    }

    class UnregisteredUser {
        +getRole(): UserRole
        +hasPermission(permission: Permission): boolean
        +viewPublicTournaments(): Tournament[]
        +viewPublicAnnouncements(): Announcement[]
    }

    class UserRole {
        <<enumeration>>
        SYSTEM_ADMIN
        TOURNAMENT_ADMIN
        REGISTERED_PARTICIPANT
        UNREGISTERED_USER
    }

    class Permission {
        <<enumeration>>
        MANAGE_ALL_TOURNAMENTS
        CREATE_TOURNAMENT
        DELETE_TOURNAMENT
        MANAGE_OWN_TOURNAMENT
        MANAGE_REGISTRATIONS
        DESIGN_DRAW
        GENERATE_ORDER_OF_PLAY
        ENTER_ANY_RESULT
        ENTER_OWN_RESULT
        CONFIRM_RESULT
        VALIDATE_RESULT
        PUBLISH_ANNOUNCEMENT
        VIEW_PRIVATE_ANNOUNCEMENT
        CONFIGURE_GLOBAL_SETTINGS
        EXPORT_DATA
        MANAGE_PARTICIPANTS
        CONFIGURE_PERMISSIONS
    }

    class PrivacySettings {
        +contactDataVisibility: VisibilityLevel
        +avatarVisibility: VisibilityLevel
        +rankingVisibility: VisibilityLevel
        +tournamentHistoryVisibility: VisibilityLevel
        
        +constructor()
        +canViewContactData(viewer: User): boolean
        +canViewAvatar(viewer: User): boolean
        +canViewRanking(viewer: User): boolean
    }

    class VisibilityLevel {
        <<enumeration>>
        ADMINS_ONLY
        TOURNAMENT_PARTICIPANTS
        ALL_REGISTERED_USERS
        PUBLIC
    }

    class NotificationPreferences {
        +emailEnabled: boolean
        +telegramEnabled: boolean
        +webPushEnabled: boolean
        +notifyNewResult: boolean
        +notifyOrderOfPlay: boolean
        +notifyAnnouncement: boolean
        +notifyRankingUpdate: boolean
        
        +constructor()
        +isChannelEnabled(channel: NotificationChannel): boolean
        +isEventEnabled(event: NotificationEvent): boolean
    }

    %% ============================================
    %% TOURNAMENT LAYER
    %% ============================================

    class Tournament {
        -id: string
        -name: string
        -startDate: Date
        -endDate: Date
        -registrationStartDate: Date
        -registrationEndDate: Date
        -categories: TournamentCategory[]
        -surface: Surface
        -installationType: InstallationType
        -maxQuota: number
        -regulations: string
        -isPublic: boolean
        -availableCourts: Court[]
        -administrators: string[]
        -brackets: Bracket[]
        -isCompleted: boolean
        
        +constructor(data: TournamentData)
        +getId(): string
        +getName(): string
        +getCategories(): TournamentCategory[]
        +getAvailableCourts(): Court[]
        +addBracket(bracket: Bracket): void
        +removeBracket(bracketId: string): void
        +getBrackets(): Bracket[]
        +addAdministrator(userId: string): void
        +isAdministrator(userId: string): boolean
        +markAsCompleted(): void
        +isComplete(): boolean
        +canRegister(): boolean
        +getRegistrations(): Registration[]
    }

    class TournamentData {
        <<interface>>
        +name: string
        +startDate: Date
        +endDate: Date
        +registrationStartDate: Date
        +registrationEndDate: Date
        +categories: TournamentCategory[]
        +surface: Surface
        +installationType: InstallationType
        +maxQuota: number
        +regulations: string
        +isPublic: boolean
    }

    class TournamentCategory {
        +gender: Gender
        +ageCategory: AgeCategory
        +level: string
        +isSingles: boolean
        
        +constructor(gender: Gender, ageCategory: AgeCategory, level: string, isSingles: boolean)
        +matches(other: TournamentCategory): boolean
    }

    class Gender {
        <<enumeration>>
        INDIFFERENT
        MALE
        FEMALE
        MIXED
    }

    class AgeCategory {
        <<enumeration>>
        MINORS
        JUNIOR
        OPEN
        VETERANS
    }

    class Surface {
        <<enumeration>>
        CLAY
        HARD_COURT
        GRASS
    }

    class InstallationType {
        <<enumeration>>
        INDOOR
        OUTDOOR
    }

    class Court {
        -id: string
        -name: string
        -availabilitySchedule: TimeSlot[]
        
        +constructor(name: string)
        +getId(): string
        +getName(): string
        +addAvailability(slot: TimeSlot): void
        +isAvailable(dateTime: Date): boolean
        +getAvailabilityForDate(date: Date): TimeSlot[]
    }

    class TimeSlot {
        +startTime: Date
        +endTime: Date
        
        +constructor(start: Date, end: Date)
        +contains(dateTime: Date): boolean
        +overlaps(other: TimeSlot): boolean
    }

    %% ============================================
    %% REGISTRATION & PARTICIPANT LAYER
    %% ============================================

    class Registration {
        -id: string
        -tournamentId: string
        -participantId: string
        -category: TournamentCategory
        -rankingAtDraw: number
        -entryStatus: EntryStatus
        -pairPartnerId: string | null
        -registrationDate: Date
        
        +constructor(tournamentId: string, participantId: string, category: TournamentCategory)
        +getId(): string
        +getTournamentId(): string
        +getParticipantId(): string
        +getEntryStatus(): EntryStatus
        +updateEntryStatus(status: EntryStatus): void
        +withdraw(): void
        +isDoubles(): boolean
        +getPartner(): string | null
    }

    class EntryStatus {
        <<enumeration>>
        OA
        DA
        SE
        JE
        QU
        LL
        WC
        ALT
        WD
    }

    %% ============================================
    %% BRACKET SYSTEM LAYER
    %% ============================================

    class Bracket {
        <<abstract>>
        #id: string
        #tournamentId: string
        #name: string
        #participants: string[]
        #matches: Match[]
        #rankingSystem: RankingSystem
        #tiebreakCriteria: TiebreakCriterion[]
        #regulations: string
        #isCompleted: boolean
        
        +constructor(tournamentId: string, name: string, rankingSystem: RankingSystem)
        +getId(): string
        +getName(): string
        +getType(): BracketType*
        +addParticipant(participantId: string): void
        +removeParticipant(participantId: string): void
        +generateMatches(): void*
        +getMatches(): Match[]
        +getRanking(): Ranking
        +calculateRanking(): Ranking*
        +isComplete(): boolean
        +markAsCompleted(): void
    }

    class RoundRobinBracket {
        -numberOfGroups: number
        -groups: Map~number, string[]~
        -qualifiersPerGroup: number
        
        +constructor(tournamentId: string, name: string, rankingSystem: RankingSystem, numberOfGroups: number)
        +getType(): BracketType
        +generateMatches(): void
        +calculateRanking(): Ranking
        +getGroups(): Map~number, string[]~
        +assignParticipantsToGroups(): void
    }

    class KnockoutBracket {
        -hasConsolation: boolean
        -seeds: Map~string, number~
        -rounds: Map~number, Match[]~
        
        +constructor(tournamentId: string, name: string, hasConsolation: boolean)
        +getType(): BracketType
        +generateMatches(): void
        +calculateRanking(): Ranking
        +seedParticipants(seeds: Map~string, number~): void
        +getRounds(): Map~number, Match[]~
        +assignByes(): void
    }

    class MatchPlayBracket {
        -openPeriod: TimeSlot
        -matchingCriteria: string
        -continuousRanking: boolean
        
        +constructor(tournamentId: string, name: string, openPeriod: TimeSlot)
        +getType(): BracketType
        +generateMatches(): void
        +calculateRanking(): Ranking
        +createMatch(participant1: string, participant2: string): Match
        +allowsFlexiblePairing(): boolean
    }

    class BracketType {
        <<enumeration>>
        ROUND_ROBIN
        KNOCKOUT
        MATCH_PLAY
    }

    %% ============================================
    %% MATCH LAYER
    %% ============================================

    class Match {
        -id: string
        -bracketId: string
        -participant1Id: string
        -participant2Id: string
        -format: MatchFormat
        -assignedCourt: string | null
        -scheduledDateTime: Date | null
        -status: MatchStatus
        -result: MatchResult | null
        -ballProvider: string | null
        -estimatedDuration: number
        -comments: string
        
        +constructor(bracketId: string, participant1: string, participant2: string, format: MatchFormat)
        +getId(): string
        +getBracketId(): string
        +getParticipants(): string[]
        +getFormat(): MatchFormat
        +getStatus(): MatchStatus
        +getResult(): MatchResult | null
        +assignCourt(courtId: string): void
        +schedule(dateTime: Date): void
        +updateStatus(status: MatchStatus): void
        +setResult(result: MatchResult): void
        +suspend(): void
        +resume(): void
        +isParticipant(userId: string): boolean
        +canEnterResult(user: User): boolean
    }

    class MatchFormat {
        +numberOfSets: number
        +gamesPerSet: number
        +hasSupertiebreak: boolean
        
        +constructor(numberOfSets: number, gamesPerSet: number, hasSupertiebreak: boolean)
        +toString(): string
    }

    class MatchStatus {
        <<enumeration>>
        TBP
        IP
        SUS
        CO
        RET
        WO
        ABN
        BYE
        NP
        CAN
        DEF
        DR
    }

    class MatchResult {
        -matchId: string
        -winner: string
        -loser: string
        -sets: SetScore[]
        -enteredBy: string
        -enteredAt: Date
        -confirmedBy: string | null
        -isConfirmed: boolean
        -isDisputed: boolean
        -disputeReason: string | null
        
        +constructor(matchId: string, winner: string, loser: string, sets: SetScore[], enteredBy: string)
        +getWinner(): string
        +getLoser(): string
        +getSets(): SetScore[]
        +confirm(userId: string): void
        +dispute(userId: string, reason: string): void
        +isConfirmed(): boolean
        +requiresConfirmation(): boolean
        +getTotalGames(participantId: string): number
    }

    class SetScore {
        +participant1Games: number
        +participant2Games: number
        +isTiebreak: boolean
        
        +constructor(p1Games: number, p2Games: number, isTiebreak: boolean)
        +getWinner(): number
        +isValid(): boolean
    }

    %% ============================================
    %% RANKING LAYER
    %% ============================================

    class Ranking {
        -bracketId: string
        -entries: RankingEntry[]
        -lastUpdated: Date
        
        +constructor(bracketId: string)
        +addEntry(entry: RankingEntry): void
        +getEntries(): RankingEntry[]
        +sortEntries(criteria: TiebreakCriterion[]): void
        +getPosition(participantId: string): number
        +getQualifiers(count: number): string[]
    }

    class RankingEntry {
        +participantId: string
        +points: number
        +matchesPlayed: number
        +matchesWon: number
        +matchesLost: number
        +setsWon: number
        +setsLost: number
        +gamesWon: number
        +gamesLost: number
        +ranking: number
        
        +constructor(participantId: string)
        +getMatchRatio(): number
        +getSetRatio(): number
        +getGameRatio(): number
        +addMatchResult(result: MatchResult, isWinner: boolean): void
    }

    class RankingSystem {
        +type: RankingType
        +pointsForWin: number
        +pointsForLoss: number
        +useELO: boolean
        +countWOInRatio: boolean
        
        +constructor(type: RankingType)
        +calculatePoints(result: MatchResult, participant: string, opponentRanking: number): number
    }

    class RankingType {
        <<enumeration>>
        POINTS
        RATIO
        MIXED
    }

    class TiebreakCriterion {
        <<enumeration>>
        SET_RATIO
        GAME_RATIO
        SET_DIFFERENCE
        GAME_DIFFERENCE
        HEAD_TO_HEAD
        INITIAL_RANKING
        RANDOM
    }

    %% ============================================
    %% ORDER OF PLAY LAYER
    %% ============================================

    class OrderOfPlay {
        -id: string
        -tournamentId: string
        -date: Date
        -scheduledMatches: ScheduledMatch[]
        -publishedAt: Date | null
        
        +constructor(tournamentId: string, date: Date)
        +getId(): string
        +getDate(): Date
        +addScheduledMatch(match: ScheduledMatch): void
        +removeScheduledMatch(matchId: string): void
        +getScheduledMatches(): ScheduledMatch[]
        +publish(): void
        +isPublished(): boolean
        +getMatchesByCourt(courtId: string): ScheduledMatch[]
    }

    class ScheduledMatch {
        +matchId: string
        +courtId: string
        +estimatedStartTime: Date
        +estimatedDuration: number
        +actualStartTime: Date | null
        
        +constructor(matchId: string, courtId: string, startTime: Date, duration: number)
        +start(): void
        +isDelayed(): boolean
        +getEstimatedEndTime(): Date
    }

    class OrderOfPlayGenerator {
        -tournament: Tournament
        -availableCourts: Court[]
        -estimatedMatchDuration: number
        
        +constructor(tournament: Tournament)
        +generate(date: Date, matches: Match[]): OrderOfPlay
        +optimizeSchedule(matches: Match[], courts: Court[], date: Date): ScheduledMatch[]
        -calculateStartTime(court: Court, duration: number): Date
        -hasParticipantConflict(match: Match, time: Date, scheduled: ScheduledMatch[]): boolean
    }

    %% ============================================
    %% ANNOUNCEMENT LAYER
    %% ============================================

    class Announcement {
        -id: string
        -title: string
        -summary: string
        -content: string
        -publicationDate: Date
        -expirationDate: Date | null
        -imageUrl: string | null
        -externalLink: string | null
        -tags: string[]
        -tournamentId: string | null
        -isPublic: boolean
        -createdBy: string
        -createdAt: Date
        
        +constructor(data: AnnouncementData)
        +getId(): string
        +getTitle(): string
        +getContent(): string
        +isPublic(): boolean
        +isActive(): boolean
        +hasTag(tag: string): boolean
        +getTags(): string[]
        +addTag(tag: string): void
        +canBeViewedBy(user: User): boolean
    }

    class AnnouncementData {
        <<interface>>
        +title: string
        +summary: string
        +content: string
        +publicationDate: Date
        +expirationDate: Date | null
        +imageUrl: string | null
        +externalLink: string | null
        +tags: string[]
        +tournamentId: string | null
        +isPublic: boolean
    }

    %% ============================================
    %% NOTIFICATION LAYER
    %% ============================================

    class Notification {
        -id: string
        -userId: string
        -type: NotificationEvent
        -title: string
        -content: string
        -relatedEntityId: string | null
        -createdAt: Date
        -isRead: boolean
        
        +constructor(userId: string, type: NotificationEvent, title: string, content: string)
        +getId(): string
        +getUserId(): string
        +getType(): NotificationEvent
        +markAsRead(): void
        +isRead(): boolean
    }

    class NotificationEvent {
        <<enumeration>>
        NEW_RESULT
        RESULT_CONFIRMATION_PENDING
        ORDER_OF_PLAY_PUBLISHED
        ORDER_OF_PLAY_CHANGED
        NEW_ANNOUNCEMENT
        RANKING_UPDATED
        TOURNAMENT_STATUS_CHANGED
        MATCH_REMINDER
        NEW_REGISTRATION
        PARTICIPANT_WITHDRAWAL
        RESULT_DISPUTED
    }

    class NotificationChannel {
        <<enumeration>>
        IN_APP
        EMAIL
        TELEGRAM
        WEB_PUSH
    }

    class NotificationService {
        +sendNotification(notification: Notification, channels: NotificationChannel[]): void
        +sendToParticipants(tournamentId: string, notification: Notification): void
        +sendToAdministrators(tournamentId: string, notification: Notification): void
        +getUserNotifications(userId: string): Notification[]
        +getUnreadCount(userId: string): number
        +markAsRead(notificationId: string): void
        +markAllAsRead(userId: string): void
        -sendEmail(userId: string, content: string): void
        -sendTelegram(userId: string, content: string): void
        -sendWebPush(userId: string, content: string): void
    }

    %% ============================================
    %% STATISTICS LAYER
    %% ============================================

    class ParticipantStatistics {
        +participantId: string
        +matchesPlayed: number
        +matchesWon: number
        +matchesLost: number
        +setsPlayed: number
        +setsWon: number
        +setsLost: number
        +gamesPlayed: number
        +gamesWon: number
        +gamesLost: number
        +currentWinStreak: number
        +currentLossStreak: number
        +longestWinStreak: number
        +longestLossStreak: number
        
        +constructor(participantId: string)
        +getMatchWinPercentage(): number
        +getSetWinPercentage(): number
        +getGameWinPercentage(): number
        +updateWithResult(result: MatchResult, isWinner: boolean): void
        +getHeadToHead(opponentId: string): HeadToHeadStats
    }

    class HeadToHeadStats {
        +participant1Id: string
        +participant2Id: string
        +matchesPlayed: number
        +participant1Wins: number
        +participant2Wins: number
        
        +constructor(p1: string, p2: string)
        +addMatch(result: MatchResult): void
        +getWinPercentage(participantId: string): number
    }

    class TournamentStatistics {
        +tournamentId: string
        +totalParticipants: number
        +totalMatches: number
        +completedMatches: number
        +resultsBySet: Map~number, number~
        +mostActiveParticipants: string[]
        
        +constructor(tournamentId: string)
        +calculate(tournament: Tournament): void
        +getCompletionPercentage(): number
    }

    %% ============================================
    %% APPLICATION SERVICES LAYER
    %% ============================================

    class TournamentService {
        -tournaments: Map~string, Tournament~
        
        +createTournament(admin: User, data: TournamentData): Tournament
        +getTournament(tournamentId: string): Tournament | null
        +updateTournament(tournamentId: string, data: Partial~TournamentData~): void
        +deleteTournament(tournamentId: string): void
        +getActiveTournaments(): Tournament[]
        +getCompletedTournaments(): Tournament[]
        +getTournamentsByAdmin(adminId: string): Tournament[]
        +markAsCompleted(tournamentId: string): void
    }

    class RegistrationService {
        -registrations: Map~string, Registration~
        
        +registerParticipant(tournamentId: string, participantId: string, category: TournamentCategory): Registration
        +withdrawParticipant(registrationId: string): void
        +updateEntryStatus(registrationId: string, status: EntryStatus): void
        +getTournamentRegistrations(tournamentId: string): Registration[]
        +getParticipantRegistrations(participantId: string): Registration[]
        +processQuotas(tournamentId: string): void
        +assignAlternates(tournamentId: string): void
    }

    class BracketService {
        -brackets: Map~string, Bracket~
        
        +createBracket(type: BracketType, tournamentId: string, config: BracketConfig): Bracket
        +getBracket(bracketId: string): Bracket | null
        +generateDraw(bracketId: string): void
        +updateBracket(bracketId: string, updates: any): void
        +linkBrackets(sourceBracketId: string, targetBracketId: string): void
        +calculateRankings(bracketId: string): Ranking
    }

    class MatchService {
        -matches: Map~string, Match~
        
        +createMatch(bracketId: string, p1: string, p2: string, format: MatchFormat): Match
        +getMatch(matchId: string): Match | null
        +updateMatchStatus(matchId: string, status: MatchStatus): void
        +enterResult(matchId: string, result: MatchResult, enteredBy: User): void
        +confirmResult(resultId: string, userId: string): void
        +disputeResult(resultId: string, userId: string, reason: string): void
        +scheduleMatch(matchId: string, courtId: string, dateTime: Date): void
        +getBracketMatches(bracketId: string): Match[]
        +getParticipantMatches(participantId: string): Match[]
    }

    class StatisticsService {
        +calculateParticipantStats(participantId: string): ParticipantStatistics
        +calculateTournamentStats(tournamentId: string): TournamentStatistics
        +calculateHeadToHead(p1: string, p2: string): HeadToHeadStats
        +getGlobalRanking(): Ranking
        +exportStatistics(tournamentId: string, format: string): any
    }

    %% ============================================
    %% MAIN APPLICATION CONTROLLER
    %% ============================================

    class ApplicationController {
        -tournamentService: TournamentService
        -registrationService: RegistrationService
        -bracketService: BracketService
        -matchService: MatchService
        -notificationService: NotificationService
        -statisticsService: StatisticsService
        -currentUser: User
        
        +constructor(currentUser: User)
        +initialize(): void
        +createTournament(data: TournamentData): Tournament
        +registerForTournament(tournamentId: string, category: TournamentCategory): Registration
        +designDraw(tournamentId: string, config: DrawConfig): void
        +generateOrderOfPlay(tournamentId: string, date: Date): OrderOfPlay
        +enterMatchResult(matchId: string, result: MatchResult): void
        +publishAnnouncement(data: AnnouncementData): Announcement
        +getUserDashboard(): DashboardData
        -checkPermission(permission: Permission): boolean
        -notifyRelevantUsers(event: NotificationEvent, relatedEntity: any): void
    }

    class DashboardData {
        <<interface>>
        +tournaments: Tournament[]
        +upcomingMatches: Match[]
        +recentResults: MatchResult[]
        +notifications: Notification[]
        +rankings: Ranking[]
        +announcements: Announcement[]
    }

    %% ============================================
    %% RELATIONSHIPS
    %% ============================================

    %% User inheritance
    SystemAdministrator --|> User : extends
    TournamentAdministrator --|> User : extends
    RegisteredParticipant --|> User : extends
    UnregisteredUser --|> User : extends

    %% User associations
    User --> UserRole : has
    User --> Permission : checks
    User --> PrivacySettings : has
    User --> NotificationPreferences : has
    PrivacySettings --> VisibilityLevel : uses

    %% Tournament relationships
    Tournament --> TournamentData : created from
    Tournament --> TournamentCategory : has
    Tournament --> Surface : has
    Tournament --> InstallationType : has
    Tournament --> Court : has
    Tournament --> Bracket : contains
    TournamentCategory --> Gender : has
    TournamentCategory --> AgeCategory : has
    Court --> TimeSlot : has availability

    %% Registration relationships
    Registration --> Tournament : belongs to
    Registration --> RegisteredParticipant : links
    Registration --> TournamentCategory : for
    Registration --> EntryStatus : has

    %% Bracket inheritance and relationships
    RoundRobinBracket --|> Bracket : extends
    KnockoutBracket --|> Bracket : extends
    MatchPlayBracket --|> Bracket : extends
    Bracket --> Match : contains
    Bracket --> RankingSystem : uses
    Bracket --> TiebreakCriterion : uses
    Bracket --> Ranking : produces
    RankingSystem --> RankingType : has

    %% Match relationships
    Match --> MatchFormat : has
    Match --> MatchStatus : has
    Match --> MatchResult : has
    Match --> Court : assigned to
    MatchResult --> SetScore : contains

    %% Ranking relationships
    Ranking --> RankingEntry : contains
    RankingEntry --> RegisteredParticipant : for

    %% Order of Play relationships
    OrderOfPlay --> Tournament : for
    OrderOfPlay --> ScheduledMatch : contains
    ScheduledMatch --> Match : schedules
    ScheduledMatch --> Court : on
    OrderOfPlayGenerator --> OrderOfPlay : generates

    %% Announcement relationships
    Announcement --> AnnouncementData : created from
    Announcement --> Tournament : may belong to

    %% Notification relationships
    Notification --> NotificationEvent : has type
    Notification --> User : sent to
    NotificationService --> Notification : manages
    NotificationService --> NotificationChannel : uses
    NotificationPreferences --> NotificationChannel : configures
    NotificationPreferences --> NotificationEvent : configures

    %% Statistics relationships
    ParticipantStatistics --> RegisteredParticipant : for
    ParticipantStatistics --> HeadToHeadStats : includes
    TournamentStatistics --> Tournament : for

    %% Service relationships
    TournamentService --> Tournament : manages
    RegistrationService --> Registration : manages
    BracketService --> Bracket : manages
    MatchService --> Match : manages
    MatchService --> MatchResult : handles
    StatisticsService --> ParticipantStatistics : calculates
    StatisticsService --> TournamentStatistics : calculates

    %% Controller relationships
    ApplicationController --> TournamentService : uses
    ApplicationController --> RegistrationService : uses
    ApplicationController --> BracketService : uses
    ApplicationController --> MatchService : uses
    ApplicationController --> NotificationService : uses
    ApplicationController --> StatisticsService : uses
    ApplicationController --> User : manages
    ApplicationController --> DashboardData : provides

    %% ============================================
    %% NOTES
    %% ============================================
    
    note for User "Abstract base class\nRole-based access control\nConfigurable privacy and notifications"
    
    note for Bracket "Abstract class for bracket types\nRound Robin, Knockout, Match Play\nEach implements own draw generation"
    
    note for Match "Comprehensive match management\nMultiple states and results\nConfirmation system"
    
    note for Ranking "Dynamic ranking calculation\nSupports points and ratio systems\nConfigurable tiebreak criteria"
    
    note for OrderOfPlayGenerator "Optimizes match scheduling\nConsiders court availability\nPrevents participant conflicts"
    
    note for NotificationService "Multi-channel notifications\nEmail, Telegram, Web Push\nUser-configurable preferences"
    
    note for ApplicationController "Main orchestrator\nEnforces permissions\nCoordinates all services"
```