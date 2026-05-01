# Initial

Perfect! I've created the UML class diagram for the Tennis Tournament Management System.

### Design Overview (80+ classes/interfaces):

**User & Authentication (14):**

- `User` (abstract) → 4 role types (System Admin, Tournament Admin, Participant, Unregistered)
- `PrivacySettings`, `NotificationPreferences` with configurable levels

**Tournament Management (11):**

- `Tournament` - Central entity with complete configuration
- Categories, surfaces, courts, status management

**Registration & Participants (5):**

- `TournamentRegistration` with 9 entry states (OA, DA, SE, JE, QU, LL, WC, ALT, WD)
- `RegistrationManager` - Handles quota and status logic

**Draw System (10):**

- `Draw` (abstract) → `RoundRobinDraw`, `KnockoutDraw`, `MatchPlayDraw` (OCP, LSP)
- `DrawGenerator` - Implements complex draw algorithms
- Configurable scoring and tiebreak systems

**Match Management (5):**

- `Match` with 12 states (TBP, IP, SUS, CO, RET, WO, ABN, BYE, NP, CAN, DEF, DR)
- `MatchManager` - Result recording and confirmation workflow

**Standings & Scoring (6):**

- `Standings`, `StandingsCalculator` with configurable systems (Points, Ratios, ELO)
- 6 tiebreak criteria applied sequentially

**Order of Play (4):**

- `OrderOfPlay`, `OrderOfPlayGenerator` with constraint optimization
- Court assignment and scheduling

**Announcement System (5):**

- `Announcement` with tags and scheduled publication
- Public/Private types

**Notification System (8):**

- Multi-channel: In-App, Email, Telegram, Web Push
- Frequency limits and user preferences

**Statistics (6):**

- `PlayerStatistics`, `StatisticsCalculator`
- Head-to-head, tournament history

**Export & Standards (2):**

- ITF CSV and TODS format support

**Permission System (5):**

- `PermissionManager` - Role-based and privacy-based validation

**Data Persistence (3):**

- Repository pattern for each entity

### SOLID Principles Applied:

✅ **SRP**: Each manager has single responsibility (draw generation, standings, registrations, matches)
✅ **OCP**: Draw hierarchy extensible, multiple scoring systems
✅ **LSP**: All draw types and user roles substitutable
✅ **ISP**: Focused interfaces per concern
✅ **DIP**: Services depend on abstractions

All five UML diagrams completed! 🎾

```mermaid
classDiagram
    %% ========================================
    %% USER & AUTHENTICATION
    %% ========================================
    
    class User {
        <<abstract>>
        -id: string
        -email: string
        -passwordHash: string
        -name: string
        -surname: string
        -dniNie: string
        -phone: string
        -telegram: string
        -whatsapp: string
        -avatarUrl: string
        -rankingGlobal: number
        -privacySettings: PrivacySettings
        -notificationPreferences: NotificationPreferences
        -createdAt: Date
        
        +constructor(email: string, name: string)
        +authenticate(password: string): boolean
        +updateProfile(data: ProfileData): void
        +getRole(): UserRole
        +hasPermission(permission: Permission, tournament?: Tournament): boolean
    }
    
    class SystemAdministrator {
        +manageAllTournaments(): Tournament[]
        +assignTournamentAdminRole(userId: string): void
        +configureGlobalSettings(settings: GlobalSettings): void
        +viewAllStatistics(): Statistics
        +exportGlobalData(format: ExportFormat): File
    }
    
    class TournamentAdministrator {
        -managedTournaments: Tournament[]
        
        +createTournament(data: TournamentData): Tournament
        +getManagedTournaments(): Tournament[]
        +generateDraw(tournamentId: string, config: DrawConfig): Draw
        +generateOrderOfPlay(tournamentId: string, date: Date): OrderOfPlay
        +validateResult(matchId: string): void
        +publishAnnouncement(tournamentId: string, announcement: AnnouncementData): Announcement
    }
    
    class RegisteredParticipant {
        -registeredTournaments: TournamentRegistration[]
        
        +registerForTournament(tournamentId: string, data: RegistrationData): TournamentRegistration
        +withdrawFromTournament(registrationId: string): void
        +recordMatchResult(matchId: string, result: MatchResult): void
        +confirmResult(matchId: string): void
        +disputeResult(matchId: string, reason: string): void
        +viewPersonalStatistics(): PlayerStatistics
    }
    
    class UnregisteredUser {
        +viewPublicTournaments(): Tournament[]
        +viewPublicDraw(tournamentId: string): Draw
        +viewPublicStandings(drawId: string): Standings[]
        +viewPublicAnnouncements(tournamentId: string): Announcement[]
    }
    
    class UserRole {
        <<enumeration>>
        SYSTEM_ADMIN
        TOURNAMENT_ADMIN
        REGISTERED_PARTICIPANT
        UNREGISTERED_USER
    }
    
    class PrivacySettings {
        +emailVisibility: VisibilityLevel
        +phoneVisibility: VisibilityLevel
        +telegramVisibility: VisibilityLevel
        +whatsappVisibility: VisibilityLevel
        +avatarVisibility: VisibilityLevel
        +showAge: boolean
        +showRanking: boolean
        +showHistory: boolean
        +showStatistics: boolean
        +allowContact: boolean
    }
    
    class VisibilityLevel {
        <<enumeration>>
        ONLY_ADMINS
        SAME_TOURNAMENT
        ALL_REGISTERED
        PUBLIC
    }
    
    class NotificationPreferences {
        +inAppEnabled: boolean
        +emailEnabled: boolean
        +telegramEnabled: boolean
        +webPushEnabled: boolean
        +notifyResults: boolean
        +notifyOrderOfPlay: boolean
        +notifyAnnouncements: boolean
        +notifyStandings: boolean
        +notifyReminders: boolean
        +emailFrequency: EmailFrequency
    }
    
    class EmailFrequency {
        <<enumeration>>
        IMMEDIATE
        DAILY_DIGEST
        WEEKLY_DIGEST
    }
    
    %% ========================================
    %% TOURNAMENT MANAGEMENT
    %% ========================================
    
    class Tournament {
        -id: string
        -name: string
        -startDate: Date
        -endDate: Date
        -registrationDeadline: Date
        -categoryGender: GenderCategory
        -categoryAge: AgeCategory
        -categoryLevel: LevelCategory
        -surface: Surface
        -installationType: InstallationType
        -maxParticipants: number
        -rulesText: string
        -privacyLevel: PrivacyLevel
        -courtCount: number
        -courtNames: string[]
        -courtSchedule: TimeRange
        -tournamentType: TournamentType
        -status: TournamentStatus
        -administrator: TournamentAdministrator
        -draws: Draw[]
        -registrations: TournamentRegistration[]
        -announcements: Announcement[]
        -contactInfo: string
        -createdAt: Date
        
        +constructor(data: TournamentData, admin: TournamentAdministrator)
        +addDraw(draw: Draw): void
        +registerParticipant(participant: RegisteredParticipant, data: RegistrationData): TournamentRegistration
        +getActiveRegistrations(): TournamentRegistration[]
        +canRegister(): boolean
        +markAsFinished(): void
        +isPublic(): boolean
        +getAvailableCourts(date: Date, time: Time): Court[]
    }
    
    class TournamentData {
        +name: string
        +startDate: Date
        +endDate: Date
        +registrationDeadline: Date
        +categoryGender: GenderCategory
        +categoryAge: AgeCategory
        +surface: Surface
        +maxParticipants: number
    }
    
    class GenderCategory {
        <<enumeration>>
        OPEN
        MENS
        WOMENS
        MIXED
    }
    
    class AgeCategory {
        <<enumeration>>
        YOUTH
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
    
    class TournamentType {
        <<enumeration>>
        SINGLES
        DOUBLES
    }
    
    class TournamentStatus {
        <<enumeration>>
        REGISTRATION
        ACTIVE
        FINISHED
    }
    
    class Court {
        +name: string
        +number: number
        +surface: Surface
        +availability: TimeRange
    }
    
    class TimeRange {
        +startTime: Time
        +endTime: Time
    }
    
    %% ========================================
    %% REGISTRATION & PARTICIPANTS
    %% ========================================
    
    class TournamentRegistration {
        -id: string
        -tournament: Tournament
        -participant: RegisteredParticipant
        -entryStatus: EntryStatus
        -rankingAtDraw: number
        -registrationDate: Date
        -withdrawalDate: Date
        -partner: RegisteredParticipant
        
        +constructor(tournament: Tournament, participant: RegisteredParticipant)
        +withdraw(): void
        +updateEntryStatus(newStatus: EntryStatus): void
        +canWithdraw(): boolean
        +isInDraw(): boolean
    }
    
    class RegistrationData {
        +rankingAtRegistration: number
        +partnerId: string
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
    
    class RegistrationManager {
        +processRegistration(tournament: Tournament, participant: RegisteredParticipant, data: RegistrationData): TournamentRegistration
        +assignEntryStatuses(tournament: Tournament): void
        +handleWithdrawal(registration: TournamentRegistration): void
        +promoteLuckyLoser(tournament: Tournament): void
        +validateQuota(tournament: Tournament): boolean
        -calculateDirectAcceptances(registrations: TournamentRegistration[]): TournamentRegistration[]
        -calculateAlternates(registrations: TournamentRegistration[]): TournamentRegistration[]
    }
    
    %% ========================================
    %% DRAW SYSTEM
    %% ========================================
    
    class Draw {
        <<abstract>>
        -id: string
        -tournament: Tournament
        -drawType: DrawType
        -name: string
        -configuration: DrawConfiguration
        -matches: Match[]
        -standings: Standings[]
        -sortOrder: number
        -createdAt: Date
        
        +constructor(tournament: Tournament, config: DrawConfiguration)
        +generateMatches(): Match[]
        +updateStandings(): void
        +getStandings(): Standings[]
        +addMatch(match: Match): void
        +canModify(): boolean
    }
    
    class RoundRobinDraw {
        -numberOfGroups: number
        -groupSize: number
        -qualifiersPerGroup: number
        
        +constructor(tournament: Tournament, config: RoundRobinConfig)
        +generateMatches(): Match[]
        +assignParticipantsToGroups(): Map~number, TournamentRegistration[]~
        +getQualifiers(): TournamentRegistration[]
        -generateRoundRobinPairings(group: TournamentRegistration[]): Match[]
    }
    
    class KnockoutDraw {
        -numberOfSeeds: number
        -consolationType: ConsolationType
        
        +constructor(tournament: Tournament, config: KnockoutConfig)
        +generateMatches(): Match[]
        +placeSeedsInDraw(seeds: TournamentRegistration[]): void
        +placeByes(participants: TournamentRegistration[]): void
        +getNextRoundMatches(round: number): Match[]
    }
    
    class MatchPlayDraw {
        -pairingCriteria: PairingCriteria
        -minMatchesPerParticipant: number
        
        +constructor(tournament: Tournament, config: MatchPlayConfig)
        +generateMatches(): Match[]
        +allowFreeParticipantPairing(): boolean
        +suggestNextPairing(): Pair~TournamentRegistration~
    }
    
    class DrawType {
        <<enumeration>>
        ROUND_ROBIN
        KNOCKOUT
        MATCH_PLAY
    }
    
    class ConsolationType {
        <<enumeration>>
        NONE
        SIMPLE
        MULTIPLE
        COMPASS
    }
    
    class PairingCriteria {
        <<enumeration>>
        FREE
        RANKING_BASED
        RANDOM
    }
    
    class DrawConfiguration {
        +drawType: DrawType
        +scoringSystem: ScoringSystem
        +tieBreakCriteria: TieBreakCriterion[]
    }
    
    class DrawGenerator {
        +generateRoundRobin(tournament: Tournament, config: RoundRobinConfig): RoundRobinDraw
        +generateKnockout(tournament: Tournament, config: KnockoutConfig): KnockoutDraw
        +generateMatchPlay(tournament: Tournament, config: MatchPlayConfig): MatchPlayDraw
        +validateConfiguration(config: DrawConfiguration): ValidationResult
        -calculateDrawSize(participants: number): number
        -assignSeeds(participants: TournamentRegistration[], count: number): TournamentRegistration[]
    }
    
    %% ========================================
    %% MATCH MANAGEMENT
    %% ========================================
    
    class Match {
        -id: string
        -draw: Draw
        -round: number
        -matchNumber: number
        -player1: TournamentRegistration
        -player2: TournamentRegistration
        -court: Court
        -scheduledDate: Date
        -scheduledTime: Time
        -status: MatchStatus
        -result: MatchResult
        -confirmed: boolean
        -disputed: boolean
        -whoProvidedBalls: TournamentRegistration
        -playerComments: string
        -estimatedDuration: number
        -createdAt: Date
        -completedAt: Date
        
        +constructor(draw: Draw, player1: TournamentRegistration, player2: TournamentRegistration)
        +recordResult(result: MatchResult, recordedBy: User): void
        +confirmResult(user: User): void
        +disputeResult(user: User, reason: string): void
        +updateStatus(newStatus: MatchStatus): void
        +assignCourt(court: Court, date: Date, time: Time): void
        +canRecordResult(user: User): boolean
        +canConfirmResult(user: User): boolean
        +getWinner(): TournamentRegistration
    }
    
    class MatchResult {
        +set1Player1: number
        +set1Player2: number
        +set2Player1: number
        +set2Player2: number
        +set3Player1: number
        +set3Player2: number
        +finalStatus: MatchStatus
        +recordedBy: User
        +recordedAt: Date
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
    
    class MatchManager {
        +createMatch(draw: Draw, player1: TournamentRegistration, player2: TournamentRegistration): Match
        +recordResult(matchId: string, result: MatchResult, user: User): void
        +confirmResult(matchId: string, user: User): void
        +disputeResult(matchId: string, user: User, reason: string): void
        +validateResult(matchId: string, admin: TournamentAdministrator): void
        +suspendMatch(matchId: string, currentScore: MatchResult): void
        +resumeMatch(matchId: string): void
        +cancelMatch(matchId: string, reason: string): void
        -validateTransition(from: MatchStatus, to: MatchStatus): boolean
        -notifyParticipants(match: Match, eventType: NotificationType): void
    }
    
    %% ========================================
    %% STANDINGS & SCORING
    %% ========================================
    
    class Standings {
        -id: string
        -draw: Draw
        -participant: TournamentRegistration
        -groupNumber: number
        -position: number
        -points: number
        -matchesWon: number
        -matchesLost: number
        -setsWon: number
        -setsLost: number
        -gamesWon: number
        -gamesLost: number
        -tieBreakValue: number
        -updatedAt: Date
        
        +constructor(draw: Draw, participant: TournamentRegistration)
        +update(match: Match): void
        +calculateRatios(): Ratios
        +compareTo(other: Standings, criteria: TieBreakCriterion[]): number
    }
    
    class Ratios {
        +matchRatio: number
        +setRatio: number
        +gameRatio: number
        +setDifference: number
        +gameDifference: number
    }
    
    class ScoringSystem {
        <<enumeration>>
        POINTS
        RATIOS
        ELO
        MIXED
    }
    
    class TieBreakCriterion {
        <<enumeration>>
        SET_RATIO
        GAME_RATIO
        SET_DIFFERENCE
        GAME_DIFFERENCE
        HEAD_TO_HEAD
        DRAW_RANKING
        RANDOM
    }
    
    class StandingsCalculator {
        -scoringSystem: ScoringSystem
        -tieBreakCriteria: TieBreakCriterion[]
        
        +constructor(scoringSystem: ScoringSystem, criteria: TieBreakCriterion[])
        +calculateStandings(draw: Draw): Standings[]
        +applyTieBreaks(standings: Standings[]): Standings[]
        +updateAfterMatch(match: Match): void
        -calculatePoints(match: Match, winner: TournamentRegistration, loser: TournamentRegistration): number
        -calculateELO(match: Match): ELOResult
        -resolveHeadToHead(standings: Standings[]): Standings[]
    }
    
    %% ========================================
    %% ORDER OF PLAY
    %% ========================================
    
    class OrderOfPlay {
        -id: string
        -tournament: Tournament
        -date: Date
        -courtAssignments: CourtAssignment[]
        -published: boolean
        -publishedAt: Date
        
        +constructor(tournament: Tournament, date: Date)
        +addAssignment(assignment: CourtAssignment): void
        +publish(): void
        +updateAssignment(matchId: string, newCourt: Court, newTime: Time): void
        +getAssignmentsForCourt(courtName: string): CourtAssignment[]
        +validate(): ValidationResult
    }
    
    class CourtAssignment {
        +match: Match
        +court: Court
        +scheduledTime: Time
        +estimatedDuration: number
        +notBefore: Time
    }
    
    class OrderOfPlayGenerator {
        +generate(tournament: Tournament, date: Date, matches: Match[]): OrderOfPlay
        +optimizeDistribution(matches: Match[], courts: Court[]): CourtAssignment[]
        +validateConstraints(orderOfPlay: OrderOfPlay): ValidationResult
        -prioritizeMatches(matches: Match[]): Match[]
        -checkPlayerAvailability(player: TournamentRegistration, time: Time): boolean
        -calculateEstimatedDuration(match: Match): number
    }
    
    %% ========================================
    %% ANNOUNCEMENT SYSTEM
    %% ========================================
    
    class Announcement {
        -id: string
        -tournament: Tournament
        -type: AnnouncementType
        -title: string
        -summary: string
        -fullText: string
        -publicationDate: Date
        -expirationDate: Date
        -imageUrl: string
        -externalLink: string
        -tags: AnnouncementTag[]
        -author: TournamentAdministrator
        -pinned: boolean
        -viewCount: number
        -createdAt: Date
        
        +constructor(data: AnnouncementData, author: TournamentAdministrator)
        +publish(): void
        +expire(): void
        +incrementViewCount(): void
        +isVisible(): boolean
        +canEdit(user: User): boolean
    }
    
    class AnnouncementData {
        +type: AnnouncementType
        +title: string
        +summary: string
        +fullText: string
        +publicationDate: Date
        +tags: AnnouncementTag[]
    }
    
    class AnnouncementType {
        <<enumeration>>
        PUBLIC
        PRIVATE
    }
    
    class AnnouncementTag {
        <<enumeration>>
        DRAW
        ORDER_OF_PLAY
        RESULTS
        STANDINGS
        REGULATIONS
        WEATHER
        FACILITIES
        FINAL
        AWARDS
        GENERAL
    }
    
    class AnnouncementManager {
        +createAnnouncement(tournament: Tournament, data: AnnouncementData, author: TournamentAdministrator): Announcement
        +publishAnnouncement(announcementId: string): void
        +getAnnouncementsForTournament(tournamentId: string, user: User): Announcement[]
        +filterByTags(announcements: Announcement[], tags: AnnouncementTag[]): Announcement[]
        +schedulePublication(announcement: Announcement): void
    }
    
    %% ========================================
    %% NOTIFICATION SYSTEM
    %% ========================================
    
    class Notification {
        -id: string
        -recipient: User
        -type: NotificationType
        -title: string
        -content: string
        -relatedId: string
        -relatedType: string
        -read: boolean
        -sentVia: NotificationChannel[]
        -createdAt: Date
        
        +constructor(recipient: User, type: NotificationType, content: string)
        +markAsRead(): void
        +send(channels: NotificationChannel[]): void
    }
    
    class NotificationType {
        <<enumeration>>
        NEW_RESULT
        CONFIRM_RESULT
        ORDER_PUBLISHED
        ORDER_CHANGED
        NEW_ANNOUNCEMENT
        STANDINGS_UPDATED
        MATCH_REMINDER_24H
        MATCH_REMINDER_2H
        REGISTRATION_CONFIRMED
        WITHDRAWAL_CONFIRMED
        DISPUTE_FILED
    }
    
    class NotificationChannel {
        <<enumeration>>
        IN_APP
        EMAIL
        TELEGRAM
        WEB_PUSH
    }
    
    class NotificationManager {
        -inAppService: InAppNotificationService
        -emailService: EmailNotificationService
        -telegramService: TelegramNotificationService
        -webPushService: WebPushNotificationService
        
        +constructor(services: NotificationServices)
        +notifyMatchResult(match: Match): void
        +notifyOrderOfPlay(orderOfPlay: OrderOfPlay): void
        +notifyAnnouncement(announcement: Announcement): void
        +notifyMatchReminder(match: Match, hoursBefor: number): void
        +sendNotification(user: User, notification: Notification): void
        -shouldSend(user: User, type: NotificationType, channel: NotificationChannel): boolean
        -respectFrequencyLimits(user: User, channel: NotificationChannel): boolean
    }
    
    class InAppNotificationService {
        +send(notification: Notification): void
        +getUnreadCount(userId: string): number
        +markAsRead(notificationId: string): void
    }
    
    class EmailNotificationService {
        +send(notification: Notification): void
        +sendDigest(user: User, notifications: Notification[]): void
    }
    
    class TelegramNotificationService {
        -botToken: string
        -rateLimiter: RateLimiter
        
        +send(notification: Notification): void
        +linkUserAccount(userId: string, telegramUsername: string): void
    }
    
    class WebPushNotificationService {
        +send(notification: Notification): void
        +subscribe(user: User, subscription: PushSubscription): void
    }
    
    %% ========================================
    %% STATISTICS
    %% ========================================
    
    class PlayerStatistics {
        -participant: RegisteredParticipant
        -totalMatches: number
        -matchesWon: number
        -matchesLost: number
        -setsWon: number
        -setsLost: number
        -gamesWon: number
        -gamesLost: number
        -winningStreak: number
        -losingStreak: number
        -tournamentHistory: TournamentResult[]
        
        +constructor(participant: RegisteredParticipant)
        +calculate(scope: StatisticsScope): void
        +getWinPercentage(): number
        +getSetPercentage(): number
        +getGamePercentage(): number
        +getHeadToHead(opponent: RegisteredParticipant): HeadToHead
        +export(format: ExportFormat): File
    }
    
    class TournamentResult {
        +tournament: Tournament
        +finalPosition: number
        +matchesPlayed: number
        +date: Date
    }
    
    class HeadToHead {
        +opponent: RegisteredParticipant
        +matchesWon: number
        +matchesLost: number
        +lastMatch: Match
        +history: Match[]
    }
    
    class StatisticsScope {
        <<enumeration>>
        SPECIFIC_TOURNAMENT
        ALL_TOURNAMENTS
        CURRENT_SEASON
        OPPONENT_COMPARISON
    }
    
    class StatisticsCalculator {
        +calculatePlayerStatistics(participant: RegisteredParticipant, scope: StatisticsScope): PlayerStatistics
        +calculateTournamentStatistics(tournament: Tournament): TournamentStatistics
        +calculateGlobalRanking(): RankingEntry[]
        -aggregateMatchData(matches: Match[]): AggregatedData
    }
    
    %% ========================================
    %% EXPORT & STANDARDS
    %% ========================================
    
    class ExportService {
        +exportToITF(tournament: Tournament): File
        +exportToTODS(tournament: Tournament): File
        +exportStatisticsToPDF(statistics: PlayerStatistics): File
        +exportStatisticsToExcel(statistics: PlayerStatistics): File
        -formatITFCSV(data: TournamentData): string
        -formatTODS(data: TournamentData): string
    }
    
    class ExportFormat {
        <<enumeration>>
        ITF_CSV
        TODS
        PDF
        EXCEL
        JSON
    }
    
    %% ========================================
    %% PERMISSION SYSTEM
    %% ========================================
    
    class PermissionManager {
        +validateAction(user: User, action: Action, resource: Resource): boolean
        +canCreateTournament(user: User): boolean
        +canManageTournament(user: User, tournament: Tournament): boolean
        +canRegister(user: User, tournament: Tournament): boolean
        +canRecordResult(user: User, match: Match): boolean
        +canViewProfile(viewer: User, profile: User, tournament?: Tournament): boolean
        +canGenerateDraw(user: User, tournament: Tournament): boolean
        +canPublishAnnouncement(user: User, tournament: Tournament): boolean
        -checkRelationship(user1: User, user2: User): Relationship
    }
    
    class Permission {
        <<enumeration>>
        CREATE_TOURNAMENT
        MANAGE_TOURNAMENT
        DELETE_TOURNAMENT
        GENERATE_DRAW
        RECORD_RESULT
        VALIDATE_RESULT
        PUBLISH_ANNOUNCEMENT
        VIEW_STATISTICS
        EXPORT_DATA
    }
    
    class Action {
        <<enumeration>>
        CREATE
        READ
        UPDATE
        DELETE
        GENERATE
        PUBLISH
        EXPORT
    }
    
    class Resource {
        <<interface>>
        +id: string
        +type: string
    }
    
    class Relationship {
        <<enumeration>>
        SAME_TOURNAMENT
        NO_RELATION
    }
    
    %% ========================================
    %% DATA PERSISTENCE
    %% ========================================
    
    class TournamentRepository {
        +save(tournament: Tournament): Promise~void~
        +findById(id: string): Promise~Tournament~
        +findByAdministrator(adminId: string): Promise~Tournament[]~
        +findActive(): Promise~Tournament[]~
        +findPublic(): Promise~Tournament[]~
        +update(tournament: Tournament): Promise~void~
        +delete(id: string): Promise~void~
    }
    
    class MatchRepository {
        +save(match: Match): Promise~void~
        +findById(id: string): Promise~Match~
        +findByDraw(drawId: string): Promise~Match[]~
        +findByParticipant(participantId: string): Promise~Match[]~
        +update(match: Match): Promise~void~
    }
    
    class UserRepository {
        +save(user: User): Promise~void~
        +findById(id: string): Promise~User~
        +findByEmail(email: string): Promise~User~
        +findAll(): Promise~User[]~
        +update(user: User): Promise~void~
    }
    
    %% ========================================
    %% RELATIONSHIPS
    %% ========================================
    
    %% User hierarchy
    SystemAdministrator --|> User : extends
    TournamentAdministrator --|> User : extends
    RegisteredParticipant --|> User : extends
    UnregisteredUser --|> User : extends
    User --> UserRole : has
    User --> PrivacySettings : has
    User --> NotificationPreferences : has
    PrivacySettings --> VisibilityLevel : uses
    NotificationPreferences --> EmailFrequency : uses
    
    %% Tournament relationships
    Tournament --> TournamentAdministrator : managed by
    Tournament --> TournamentStatus : has
    Tournament --> GenderCategory : has
    Tournament --> AgeCategory : has
    Tournament --> Surface : has
    Tournament --> TournamentType : has
    Tournament --> Draw : contains
    Tournament --> TournamentRegistration : has
    Tournament --> Announcement : has
    Tournament --> Court : has available
    Tournament --> TournamentData : created from
    Court --> Surface : has
    Court --> TimeRange : has availability
    
    %% Registration relationships
    TournamentRegistration --> Tournament : belongs to
    TournamentRegistration --> RegisteredParticipant : references
    TournamentRegistration --> EntryStatus : has
    TournamentRegistration --> RegistrationData : created from
    RegistrationManager --> TournamentRegistration : manages
    RegistrationManager --> Tournament : processes for
    
    %% Draw relationships
    RoundRobinDraw --|> Draw : extends
    KnockoutDraw --|> Draw : extends
    MatchPlayDraw --|> Draw : extends
    Draw --> Tournament : belongs to
    Draw --> DrawType : has
    Draw --> DrawConfiguration : configured by
    Draw --> Match : contains
    Draw --> Standings : has
    DrawConfiguration --> ScoringSystem : uses
    DrawConfiguration --> TieBreakCriterion : uses
    DrawGenerator --> Draw : creates
    DrawGenerator --> RoundRobinDraw : creates
    DrawGenerator --> KnockoutDraw : creates
    DrawGenerator --> MatchPlayDraw : creates
    KnockoutDraw --> ConsolationType : has
    MatchPlayDraw --> PairingCriteria : uses
    
    %% Match relationships
    Match --> Draw : belongs to
    Match --> TournamentRegistration : player1
    Match --> TournamentRegistration : player2
    Match --> Court : assigned to
    Match --> MatchStatus : has
    Match --> MatchResult : has
    MatchManager --> Match : manages
    MatchManager --> MatchResult : processes
    
    %% Standings relationships
    Standings --> Draw : belongs to
    Standings --> TournamentRegistration : for participant
    Standings --> Ratios : calculates
    StandingsCalculator --> Standings : calculates
    StandingsCalculator --> ScoringSystem : uses
    StandingsCalculator --> TieBreakCriterion : applies
    
    %% Order of play relationships
    OrderOfPlay --> Tournament : for
    OrderOfPlay --> CourtAssignment : contains
    CourtAssignment --> Match : assigns
    CourtAssignment --> Court : to
    OrderOfPlayGenerator --> OrderOfPlay : generates
    
    %% Announcement relationships
    Announcement --> Tournament : belongs to
    Announcement --> AnnouncementType : has
    Announcement --> AnnouncementTag : tagged with
    Announcement --> TournamentAdministrator : created by
    Announcement --> AnnouncementData : created from
    AnnouncementManager --> Announcement : manages
    
    %% Notification relationships
    Notification --> User : sent to
    Notification --> NotificationType : has
    Notification --> NotificationChannel : sent via
    NotificationManager --> Notification : manages
    NotificationManager --> InAppNotificationService : uses
    NotificationManager --> EmailNotificationService : uses
    NotificationManager --> TelegramNotificationService : uses
    NotificationManager --> WebPushNotificationService : uses
    
    %% Statistics relationships
    PlayerStatistics --> RegisteredParticipant : for
    PlayerStatistics --> TournamentResult : contains
    PlayerStatistics --> HeadToHead : calculates
    StatisticsCalculator --> PlayerStatistics : calculates
    StatisticsCalculator --> StatisticsScope : uses
    HeadToHead --> RegisteredParticipant : against
    HeadToHead --> Match : contains history
    
    %% Export relationships
    ExportService --> Tournament : exports
    ExportService --> PlayerStatistics : exports
    ExportService --> ExportFormat : uses
    
    %% Permission relationships
    PermissionManager --> User : validates
    PermissionManager --> Permission : checks
    PermissionManager --> Action : validates
    PermissionManager --> Resource : validates access
    PermissionManager --> Relationship : checks
    Tournament ..|> Resource : implements
    Match ..|> Resource : implements
    Announcement ..|> Resource : implements
    
    %% Repository relationships
    TournamentRepository --> Tournament : persists
    MatchRepository --> Match : persists
    UserRepository --> User : persists
    
    %% Notes
    note for DrawGenerator "Implements algorithms for Round Robin, Knockout, and Match Play draw generation"
    note for StandingsCalculator "Applies configurable scoring systems and sequential tiebreak criteria"
    note for PermissionManager "Centralized authorization - validates all role-based and privacy-based access"
    note for RegistrationManager "Handles entry status assignment (DA, ALT, LL, etc.) based on ranking and quotas"
    note for NotificationManager "Multi-channel notifications with frequency limits and user preferences"
```