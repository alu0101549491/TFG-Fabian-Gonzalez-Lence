## 1. **Introduction**

The objective of this project is to develop a **responsive web application for comprehensive management of multiple simultaneous tennis tournaments**. The system will enable management of a tournament’s complete cycle from creation to completion, including **participant registration**, **draw design and seeding** (Round Robin, Knockout, Match Play), **order of play generation**, **result recording**, **automatic standings calculation**, **announcement publication**, and **automatic multichannel notifications**.

The platform is aimed at three types of actors with **differentiated roles and specific permissions**: **System Administrator** (full control), **Tournament Administrator** (management of own tournaments), and **Registered Participant** (registration, result recording, and personalized tracking). Additionally, **unregistered general public** will be able to consult tournaments, results, and standings publicly.

**Tennis data standards** (ITF, TODS), **flexible ranking systems** (points, ratios, ELO), **user-configurable privacy management**, and **multiplatform notifications** (in-app, email, Telegram, web push) will be implemented.

---

## 2. **Scope**

The application will allow:

- Managing multiple tennis tournaments simultaneously with independent configuration.
- Implementing three types of draws: Round Robin (round-robin), Knockout (elimination), and Match Play (open format).
- Registering participants with 9 different entry states (OA, DA, SE, JE, QU, LL, WC, ALT, WD).
- Generating automatic draws with seeding system based on ranking.
- Recording results by participants or administrators with optional confirmation system.
- Calculating automatic standings through points, ratios, or mixed systems with tiebreak criteria.
- Managing 12 different match states (TBP, IP, SUS, CO, RET, WO, ABN, BYE, NP, CAN, DEF, DR).
- Generating order of play considering court availability and schedules.
- Publishing public and private announcements with tag system.
- Sending automatic multichannel notifications to participants and administrators.
- Configuring contact data privacy levels per user.
- Exporting results in standard formats (ITF CSV, TODS).
- Supporting singles and doubles tournaments.
- Linking multiple tournament phases (qualifying, main, consolation).
- Displaying personal and tournament statistics.
- Functioning responsively on desktop, mobile, and tablets.

Does not include:

- Payment or registration fee collection management (optional future feature).
- Court booking system for regular club use (only availability management for tournament).
- Video conferencing or live match streaming.
- Tactical analysis tools or advanced game statistics.
- Direct integration with electronic scoreboard devices.
- Betting or prediction system.

---

## 3. **Definitions and Abbreviations**

- **OA (Organizer Acceptance):** Place assigned directly by organization.
- **DA (Direct Acceptance):** Automatic entry by ranking classification.
- **SE (Special Exemption):** Place for special circumstances.
- **JE (Junior Exemption):** Place reserved for junior category.
- **QU (Qualifier):** Participant who passed qualifying phase.
- **LL (Lucky Loser):** Alternate who enters due to another participant’s withdrawal.
- **WC (Wild Card):** Direct organizer invitation.
- **ALT (Alternate):** Reserve on waiting list.
- **WD (Withdrawn):** Participant who has withdrawn.
- **TBP (To Be Played):** Scheduled pending match.
- **IP (In Progress):** Match started but not finished.
- **SUS (Suspended):** Match temporarily interrupted.
- **CO (Completed):** Match finished normally.
- **RET (Retired):** Match finished by retirement during play.
- **WO (Walkover):** Victory by opponent’s no-show.
- **ABN (Abandoned):** Match abandoned without valid result.
- **BYE (Player bye):** Automatic pass without playing.
- **NP (Not Played):** Match not disputed.
- **CAN (Cancelled):** Match annulled by organization.
- **DEF (Player default):** Disciplinary disqualification.
- **DR (Dead rubber):** Match without relevance for standings.
- **Round Robin:** Round-robin system by groups.
- **Match Play:** Open format without fixed draw structure.
- **Seed:** Pre-ranked player in the draw.
- **ELO:** Ranking system that weights opponent’s ranking.
- **ITF:** International Tennis Federation.
- **TODS:** Tennis Open Data Standards.
- **PWA:** Progressive Web App.

---

## 4. **Functional Requirements (FR)**

### 4.1 Tournament Management

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR1** | **Tournament creation with complete configuration.** | Administrator can create tournaments specifying: name, dates (start, end, registration), categories (gender, age, level), surface, facility type, maximum quotas, regulations, available courts. |
| **FR2** | **Support for multiple simultaneous tournaments.** | System allows managing more than 10 active tournaments simultaneously without interference between them. |
| **FR3** | **Configuration of three draw types.** | Each tournament can contain draws of type: Round Robin (groups with round-robin), Knockout, Match Play (open without fixed structure). |
| **FR4** | **Multiple tournament phase linking.** | System allows linking sequential phases: qualifying → main, main → consolation, Round Robin → knockout. |
| **FR5** | **Court availability management.** | Number of courts, names, opening/closing hours, and surface are configured for each tournament. |
| **FR6** | **Tournament completion.** | Administrator can mark a tournament as finished. Finished tournaments remain accessible for historical query. |
| **FR7** | **Singles and doubles tournaments.** | System supports singles tournaments (1 vs 1) and doubles (formed pairs). |
| **FR8** | **Specific regulations configuration.** | Each tournament has free text field to define particular rules, tiebreak criteria, and special conditions. |

### 4.2 Participant Management

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR9** | **Registered participant registration.** | Registered users can register for available tournaments providing: full name, ID/NIE, category, ranking, contact data. |
| **FR10** | **Participant enrollment by administrators.** | Administrators can manually enroll participants, even if not registered in the system. |
| **FR11** | **Nine tournament entry states.** | System assigns and manages states: OA, DA, SE, JE, QU, LL, WC, ALT, WD according to tournament rules and quotas. |
| **FR12** | **Maximum quota management.** | When registrations exceed quota, system assigns: DA to best ranked, QU for qualifiers, ALT to waiting list, and reserves places for WC/OA/SE/JE. |
| **FR13** | **Participant withdrawal system.** | Participants can withdraw (change to WD state). Depending on withdrawal timing: before draw (next ALT enters), after draw (ALT becomes LL), during tournament (next match is WO). |
| **FR14** | **Participant profile configuration.** | Participants configure: name, surname, ID/NIE, ranking, phone, email, Telegram, WhatsApp, avatar image, privacy preferences. |
| **FR15** | **Pair registration in doubles.** | In doubles tournaments, already-formed pairs register with both participants specified. |

### 4.3 Draw Design and Seeding

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR16** | **Automatic Round Robin draw generation.** | System generates groups where each participant plays against all others. Supports 1 to n groups. Manages Byes with odd number of participants. |
| **FR17** | **Automatic knockout draw generation.** | System generates direct elimination draws with support for first-round Byes, ranking-based seeds, and optional consolation draws. |
| **FR18** | **Automatic Match Play draw generation.** | System allows creating open competition with free or predetermined pairings, without match limit. |
| **FR19** | **Seeding system.** | System automatically places seeds (best-ranked players) in strategic draw positions according to ranking. |
| **FR20** | **Started draw modification.** | Administrators can modify draws after seeding, regenerate draws, and migrate existing results. |
| **FR21** | **Qualifier configuration to next phase.** | In Round Robin draws, number of top qualifiers to next phase and consolation is specified. |
| **FR22** | **Multiple consolation draws.** | System supports simple consolation draws or multiple levels by elimination round (Compass). |

### 4.4 Match and Result Management

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR23** | **Twelve match states.** | System manages states: TBP, IP, SUS, CO, RET, WO, ABN, BYE, NP, CAN, DEF, DR with valid transitions between them. |
| **FR24** | **Result recording by participants.** | Participants can enter their match results immediately after finishing, specifying sets, games, and final state. |
| **FR25** | **Result confirmation system.** | Results entered by participants remain “Pending confirmation” until opponent confirms or administrator validates. |
| **FR26** | **Result dispute.** | Participants can dispute erroneous results by contacting administrators. Administrators can validate, modify, annul (CAN), or order replay. |
| **FR27** | **Result recording by administrators.** | Administrators can enter or modify any result with immediate validity without requiring confirmation. |
| **FR28** | **Configurable match formats.** | Each match specifies format: 2 sets + supertiebreak, 3 sets, 4-game sets, 6-game sets. |
| **FR29** | **Court and schedule assignment to matches.** | Each match has assigned court, scheduled date and time visible in order of play. |
| **FR30** | **Match suspension and resumption.** | Matches can be suspended (SUS state) for weather, time, or light, saving the score. Resumed same date or later from exact point. |
| **FR31** | **Ball provider recording.** | Each match includes field to record which player provided balls (useful in tournaments without official balls). |
| **FR32** | **Optional player comments.** | Participants can add observations about the match when entering result. |

### 4.5 Order of Play

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR33** | **Manual or assisted order of play generation.** | Administrators create order of play considering: court availability, schedules, estimated time per match, draw sequence. |
| **FR34** | **Mandatory publication in advance.** | Order of play is published at least one day before. Accessible to participants, administrators, and public. |
| **FR35** | **Adaptation to player availability.** | System allows adjusting schedules according to availability declared by players or last-minute modifications. |
| **FR36** | **Delay and disqualification management.** | If a player doesn’t finish previous match on time, next one waits. Unjustified delays can result in disqualification (DEF). |
| **FR37** | **Immediate court reassignment.** | Administrators can reassign courts in real-time if there are changes or delays. |
| **FR38** | **Real-time order update.** | Changes in order of play are immediately reflected on platform with notifications to affected parties. |

### 4.6 Standings and Statistics

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR39** | **Automatic point-based standings.** | System calculates standings by adding points for match won (3, 2, or 1 point configurable) and lost (0 or 1 point). |
| **FR40** | **Automatic ratio-based standings.** | System calculates match won/lost ratios. Optionally excludes WO from calculation. |
| **FR41** | **ELO scoring system.** | System supports variable scoring according to opponent ranking (more points for beating better-ranked opponent). |
| **FR42** | **Six configurable tiebreak criteria.** | In case of tie, applied sequentially: 1) Set ratio, 2) Game ratio, 3) Set/game difference, 4) Head-to-head, 5) Draw ranking, 6) Random draw. |
| **FR43** | **Automatic standings update.** | Standings are recalculated immediately after confirming each result. |
| **FR44** | **Global player ranking.** | System maintains global ranking beyond individual tournaments, useful for seeds and direct acceptances. |
| **FR45** | **Personal participant statistics.** | Each participant sees: matches/sets/games won and lost, percentages, streaks, history against specific opponents. |
| **FR46** | **Tournament statistics.** | Displays: total participants, total matches, result distribution, most active participants, rankings by category. |

### 4.7 Announcement System

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR47** | **Public and private announcement creation.** | Administrators create announcements specifying: type (public/private), title, summary, long text, publication/expiration dates, image, link, tags. |
| **FR48** | **Tag system for announcements.** | Announcements are categorized with tags (draw, order of play, qualifiers, results) for filtering and search. |
| **FR49** | **Scheduled announcement publication.** | Announcements can be scheduled for automatic future publication and expire on specific date. |
| **FR50** | **Announcement linking to tournaments.** | Each announcement can be associated with a specific tournament for context. |
| **FR51** | **Announcement editing and deletion.** | Administrators can edit or delete existing announcements at any time. |

### 4.8 Notification System

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR52** | **Automatic participant notifications.** | System notifies: new result, result pending confirmation, order of play publication, order changes, new announcements, updated standings, match reminders. |
| **FR53** | **Automatic administrator notifications.** | Administrators receive notifications of: registrations, enrollments, modifications, withdrawals, new results, disputes, relevant activity. |
| **FR54** | **Multichannel notifications.** | Notifications are sent via: web app (in-app), email, Telegram, web push (according to user preferences). |
| **FR55** | **Notification preference configuration.** | Each participant configures: active channels, event types to notify, frequency. |
| **FR56** | **Visual notification indicators.** | Application displays unread notification counter and pending alerts in interface. |
| **FR57** | **Notification history.** | Users can consult complete list of received notifications with timestamps. |

### 4.9 Privacy Management

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR58** | **Privacy level configuration.** | Each participant configures visibility of: contact data (only admins / same tournament participants / registered / public), avatar image, age/category, ranking, history. |
| **FR59** | **Role-based data access.** | System validates permissions: administrators (full access), same tournament participants (according to privacy), registered (according to privacy), public (only explicitly authorized). |
| **FR60** | **Player profile visibility.** | Profiles are accessible according to user’s privacy configuration and consultant’s role. |

### 4.10 Export and Standards

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **FR61** | **ITF format export.** | System exports results to structured CSV according to ITF standard. |
| **FR62** | **TODS format export.** | System supports Tennis Open Data Standards for interoperability. |
| **FR63** | **Statistics export.** | Administrators can export statistics to PDF and Excel. |

---

## 5. **Non-Functional Requirements (NFR)**

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| **NFR1** | **Responsive web application.** | Interface works correctly on desktop (1920px+), tablets (768px-1024px), and smartphones (320px-767px). |
| **NFR2** | **Compatible with modern browsers.** | Functions in Chrome, Firefox, Safari, and Edge (versions from last 2 years). |
| **NFR3** | **Modern frontend framework.** | Uses Angular for maintainable and scalable UI. |
| **NFR4** | **Intuitive interface and clear navigation.** | Users can complete common tasks in maximum 3 clicks. No extensive training required. |
| **NFR5** | **Real-time synchronization.** | Changes (results, standings, order of play) are reflected in less than 5 seconds on all active devices. |
| **NFR6** | **Adequate load time.** | Main pages load in less than 2 seconds on standard 4G connections. |
| **NFR7** | **Slow connection optimization.** | Application functions acceptably on 3G connections with intelligent cache. |
| **NFR8** | **Basic offline functionality.** | Users can consult previously loaded data without connection (PWA). |
| **NFR9** | **Scalable backend.** | System supports at least 100 concurrent users and 20 active tournaments simultaneously without performance degradation. |
| **NFR10** | **Relational database.** | Uses PostgreSQL or MySQL with normalized structure for tournaments, participants, draws, results, announcements. |
| **NFR11** | **Well-documented REST API.** | Backend exposes RESTful API with Swagger/OpenAPI documentation. |
| **NFR12** | **Robust authentication system.** | Implements authentication with JWT, hashed passwords (bcrypt), and automatic session closure after 30 min inactivity. |
| **NFR13** | **Granular role and permission management.** | Each action is validated in backend by role (system admin, tournament admin, participant, public). |
| **NFR14** | **Personal data protection.** | Basic GDPR compliance: consent, right of access, rectification, deletion, data export. |
| **NFR15** | **Activity and audit logs.** | System records critical actions (result modifications, permission changes) with timestamp and user. |
| **NFR16** | **Automatic backup system.** | Daily database backups with point-in-time restoration capability. |
| **NFR17** | **System availability.** | Minimum 99% uptime (maximum 7 hours downtime per month). |
| **NFR18** | **Visual customization.** | Administrators can configure: corporate color schemes, logos, menus. |
| **NFR19** | **Notification service integration.** | Stable connection with APIs: transactional email, Telegram Bot API, web push service. |
| **NFR20** | **Image compression and optimization.** | Uploaded images are automatically compressed without significant quality loss. |
| **NFR21** | **CDN for static resources.** | Static assets (CSS, JS, images) served from CDN for fast loading. |
| **NFR22** | **Automated testing.** | Unit and integration test suite with minimum 70% coverage on critical functions. |
| **NFR23** | **Complete technical documentation.** | Commented code, README with instructions, architecture and API documentation. |

---

## 6. **Optional Considerations**

- **Advanced PWA implementation:** Complete offline functionality with automatic synchronization upon regaining connection.
- **Native mobile app:** Downloadable iOS and Android applications with complete functionality.
- **Payment system:** Integration with payment gateways to manage paid registrations.
- **Live chat:** Instant messaging between participants in same tournament.
- **Live result streaming:** Real-time score updates during match.
- **Automatic document generation:** Diplomas, minutes, participation certificates in PDF.
- **Official ranking integration:** Synchronization with ATP, WTA, ITF, or other federations.
- **Friendly betting system:** Predictions between participants without real money.
- **Basic tactical analysis:** Advanced performance statistics per player.
- **Practice court booking:** System extension for regular club use beyond tournaments.
- **Video conferencing for arbitration:** Remote dispute resolution.
- **Gamification:** Achievements, badges, secondary rankings to increase engagement.
- **Multi-language:** Support for Spanish, English, French, German.
- **Dark mode:** Dark/light theme configurable per user.
- **Wearable integration:** Automatic result import from sports watches.

---

## 7. **Actor Summary**

### **System Administrator**

Has full control over platform. Manages all system tournaments, creates and configures tournaments, manages all participants and users, configures application colors/logos/menus, accesses all draws/results/announcements, modifies any data, manages tournament administrator roles, accesses global statistics, and receives notifications of all relevant activity.

### **Tournament Administrator**

Has full permissions over specific tournaments. Creates and configures own tournaments, manages registrations and participants of their tournaments, designs and seeds draws, generates order of play, validates and modifies results, publishes standings, creates and publishes announcements, configures specific regulations, manages court availability, marks tournaments as finished, and receives notifications of activity in their tournaments.

### **Registered Participant**

Has permissions over their registrations and data. Registers for available tournaments, withdraws (according to regulations), enters their match results immediately, confirms or disputes results entered by opponents, configures complete profile (name, ID, ranking, contact, avatar), views other participants’ profiles (according to privacy), receives personalized notifications, views information on scheduled and completed matches, views public and private announcements, consults personal statistics, views history with specific opponents, and configures notification and privacy preferences.

### **Unregistered User / Public**

Has read-only access. Views active and historical tournaments, consults draws, views results and standings, reads public announcements, views player profiles (according to privacy), and consults public tournament statistics.

### **System**

Manages business logic: validates role-based permissions, generates automatic draws by type, calculates standings with tiebreak criteria, updates order of play, sends multichannel notifications, applies match states according to transitions, maintains referential integrity between tournaments/draws/matches, synchronizes changes in real-time, and generates exports in standard formats.

---

## 8. **Detailed Role and Permission System**

### 8.1 Permission Matrix by Role

| Action | System Admin | Tournament Admin | Participant | Public |
| --- | --- | --- | --- | --- |
| Create tournaments | ✓ | ✓ (own) | ✗ | ✗ |
| View all tournaments | ✓ | ✓ (own) | ✓ (registered) | ✓ (public) |
| Configure tournament | ✓ | ✓ (own) | ✗ | ✗ |
| Delete tournaments | ✓ | ✓ (own) | ✗ | ✗ |
| Register participants | ✓ | ✓ (in their tournaments) | ✓ (themselves) | ✗ |
| Modify registrations | ✓ | ✓ (in their tournaments) | ✗ | ✗ |
| Withdraw participants | ✓ | ✓ (in their tournaments) | ✓ (themselves) | ✗ |
| Generate and seed draws | ✓ | ✓ (in their tournaments) | ✗ | ✗ |
| View draws | ✓ | ✓ | ✓ | ✓ |
| Modify draws | ✓ | ✓ (in their tournaments) | ✗ | ✗ |
| Enter results | ✓ | ✓ (in their tournaments) | ✓ (their matches) | ✗ |
| Modify any result | ✓ | ✓ (in their tournaments) | ✗ | ✗ |
| Confirm results | ✓ | ✓ | ✓ (their matches) | ✗ |
| Dispute results | ✓ | ✓ | ✓ (their matches) | ✗ |
| View standings | ✓ | ✓ | ✓ | ✓ |
| Generate order of play | ✓ | ✓ (in their tournaments) | ✗ | ✗ |
| View order of play | ✓ | ✓ | ✓ | ✓ |
| Create announcements | ✓ | ✓ (in their tournaments) | ✗ | ✗ |
| View public announcements | ✓ | ✓ | ✓ | ✓ |
| View private announcements | ✓ | ✓ | ✓ | ✗ |
| Edit/delete announcements | ✓ | ✓ (own) | ✗ | ✗ |
| View personal statistics | ✓ | ✓ | ✓ (own) | ✗ |
| View public statistics | ✓ | ✓ | ✓ | ✓ |
| Configure global application | ✓ | ✗ | ✗ | ✗ |
| Manage tournament admin roles | ✓ | ✗ | ✗ | ✗ |
| Export data | ✓ | ✓ (their tournaments) | ✗ | ✗ |
| Configure own profile | ✓ | ✓ | ✓ | ✗ |
| View player profiles | ✓ | ✓ | Per privacy | Per privacy |
| Configure notifications | ✓ | ✓ | ✓ | ✗ |
| Finish tournaments | ✓ | ✓ (own) | ✗ | ✗ |

---

## 9. **Tournament Data Structure**

### 9.1 General Tournament Information

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| **ID** | Numeric | Auto-generated unique identifier | Yes |
| **Tournament Name** | Text | Complete denomination | Yes |
| **Start Date** | Date | First day of tournament | Yes |
| **End Date** | Date | Last day of tournament | Yes |
| **Registration Deadline** | Date | Registration period closure | Yes |
| **Category - Gender** | Enum | Open / Men’s / Women’s / Mixed | Yes |
| **Category - Age** | Enum | Youth / Junior / Open / Veterans / etc. | Yes |
| **Category - Level** | Enum | First / Second / Third / Open / etc. | No |
| **Surface** | Enum | Clay / Hard court / Grass | Yes |
| **Facility Type** | Enum | Indoor / Outdoor | Yes |
| **Maximum Quota** | Numeric | Maximum number of participants allowed | Yes |
| **Specific Regulations** | Long text | Particular tournament rules in free text | No |
| **Privacy Configuration** | Enum | Public / Restricted to registered / Private | Yes (default: Public) |
| **Number of Courts** | Numeric | Quantity of available courts | Yes |
| **Court Names** | List | Identifying names for each court | No |
| **Court Schedules** | Time range | Daily opening and closing | Yes |
| **Tournament Type** | Enum | Singles / Doubles | Yes |
| **Status** | Enum | Registration / Active / Finished | Yes (default: Registration) |
| **Administrator** | Relationship | Responsible tournament admin | Yes |
| **Contact Information** | Text | Organization data | No |
| **Creation Date** | Timestamp | When record was created | Yes (auto) |

### 9.2 Draw Structure Within Tournament

Each tournament can contain multiple draws (phases):

**Round Robin Draw:**
- Number of groups (1 to n)
- Group size (participants per group)
- Qualifiers advancing to next phase
- Ranking system (points/ratios/mixed)
- Specific tiebreak criteria

**Knockout Draw:**
- Type (main/consolation/qualifying)
- Number of rounds
- Configured seeds
- Consolation type (simple/multiple/Compass)

**Match Play Draw:**
- Pairing criteria (free/predetermined)
- Scoring system (points/ELO/other)
- Minimum matches per participant (optional)

---

## 10. **Participant States and Transitions**

### 10.1 Entry States

```
[Registration]
    ↓
Acceptance process according to ranking and quotas:
    ↓
┌─────────────────────────────────────────┐
│ Direct places:                          │
│ - DA (Direct acceptance by ranking)     │
│ - WC (Wild Card invitation)             │
│ - OA (Organizer assigns)                │
│ - SE (Special exemption)                │
│ - JE (Junior exemption)                 │
└───────────────┬─────────────────────────┘
                │
┌───────────────┴─────────────────────────┐
│ Qualifying:                             │
│ - QU (Qualified after previous phase)   │
└───────────────┬─────────────────────────┘
                │
┌───────────────┴─────────────────────────┐
│ Waiting list:                           │
│ - ALT (Alternate on hold)               │
│   → LL (Lucky Loser if enters by withdrawal)│
└───────────────┬─────────────────────────┘
                │
┌───────────────┴─────────────────────────┐
│ Withdrawal:                             │
│ - WD (Withdrawn)                        │
└─────────────────────────────────────────┘
```

### 10.2 Valid State Transitions

- **ALT → LL:** When entering draw due to another player’s withdrawal
- **Any state → WD:** When withdrawing
- **No state → DA/WC/OA/SE/JE/ALT:** Upon registration (according to criteria)
- **Any state → QU:** Upon passing qualifying phase

---

## 11. **Match States and Flows**

### 11.1 Match State Diagram

```
[Match creation]
    ↓
[TBP - To Be Played]
    ↓
[IP - In Progress] ←→ [SUS - Suspended]
    ↓                      ↓
    ├─→ [CO - Completed]   │
    ├─→ [RET - Retired] ←──┘
    ├─→ [WO - Walkover]
    ├─→ [ABN - Abandoned]
    ├─→ [DEF - Default]
    └─→ [CAN - Cancelled]

Special states without play:
- [BYE - Player bye]: automatic pass
- [NP - Not played]: not disputed
- [DR - Dead rubber]: no relevance
```

### 11.2 Final State Description

| State | Impact on Standings | Change Responsible |
| --- | --- | --- |
| **CO (Completed)** | Normal result counted | Participants or Admin |
| **RET (Retired)** | Victory to opponent, current set won/lost | Participants or Admin |
| **WO (Walkover)** | Knockout: automatic pass. Round Robin: victory points (optional not count sets/games) | Admin |
| **ABN (Abandoned)** | No valid result, not counted | Admin |
| **BYE (Bye)** | Automatic pass without affecting standings | Automatic system |
| **NP (Not Played)** | Not counted | Admin |
| **CAN (Cancelled)** | Annulled, not counted | Admin |
| **DEF (Default)** | Automatic victory to opponent | Admin |
| **DR (Dead rubber)** | Counted normally but no relevance for final standings | Admin (marked) |

---

## 12. **Detailed Ranking System**

### 12.1 Point-based Ranking

**Basic assignment:**
- Match won: 3 points (configurable: 2 or 1)
- Match lost: 0 points (configurable: 1 point)
- Walkover (WO): according to regulations (optionally no points)

**ELO System (optional):**

```
Points = Base × Multiplier according to ranking difference

Examples:
- Beat opponent 50 places better: 5 points
- Beat opponent of similar ranking: 3 points
- Beat opponent 50 places worse: 2 points
```

**Unfinished match management:**
- According to tournament regulations
- Options: no points, partial points, consider played sets

### 12.2 Ratio-based Ranking

**Match ratio:**

```
Ratio = Matches won / Matches lost

Examples:
- 5 won, 2 lost: 5/2 = 2.50
- 3 won, 3 lost: 3/3 = 1.00
- 2 won, 4 lost: 2/4 = 0.50
```

**Particularities:**
- If no matches lost: considered infinite or maximum value (e.g., 999)
- WO can be excluded from calculation according to regulations
- Useful for groups with different number of matches played

### 12.3 Tiebreak Criteria (Sequential Application)

**Level 1: Set ratio**

```
Set ratio = Sets won / Sets lost
```

**Level 2: Game ratio**

```
Game ratio = Games won / Games lost
```

**Level 3: Set or game difference**

```
Set difference = Sets won - Sets lost
Game difference = Games won - Games lost
```

**Level 4: Head-to-head**
- If tie between 2 players: winner of direct match wins
- If tie between 3+ players: mini-standings considering only matches between tied players

**Level 5: Ranking at draw time**
- Winner had better ranking at tournament start

**Level 6: Random draw**
- Last resort if tie persists

### 12.4 Round Robin Standing Calculation Example

**Group A - Point system (3-1-0):**

| Player | MW | ML | Pts | S+/S- | G+/G- | Standing |
| --- | --- | --- | --- | --- | --- | --- |
| Carlos | 3 | 0 | 9 | 6/1 | 37/20 | 1st |
| Ana | 2 | 1 | 6 | 4/3 | 32/28 | 2nd |
| Luis | 1 | 2 | 3 | 3/4 | 28/32 | 3rd |
| María | 0 | 3 | 0 | 1/6 | 20/37 | 4th |

**Group B - Ratio system:**

| Player | MW | ML | M Ratio | S Ratio | G Ratio | Standing |
| --- | --- | --- | --- | --- | --- | --- |
| Pedro | 4 | 1 | 4.00 | 8/3 | 50/30 | 1st |
| Sandra | 3 | 2 | 1.50 | 6/5 | 45/40 | 2nd |
| Jorge | 3 | 2 | 1.50 | 7/5 | 47/38 | 3rd (better set ratio) |
| Elena | 0 | 5 | 0.00 | 1/10 | 25/55 | 4th |

---

## 13. **Draw Generation - Algorithms**

### 13.1 Round Robin Draw

**Generation process:**

1. **Determine number of groups:**
    - Input: N participants, M desired groups
    - Distribution: N/M participants per group (adjust for balance)
2. **Assign participants to groups:**
    - Option A: Random draw
    - Option B: By ranking (snake for balance)
    
    Snake example with 12 participants in 3 groups:
    
    ```
    Group 1: #1, #6, #7, #12
    Group 2: #2, #5, #8, #11
    Group 3: #3, #4, #9, #10
    ```
    
3. **Generate pairings:**
    - Each participant plays against all others in their group
    - Standard Round Robin algorithm for scheduling
4. **Manage Byes (odd number):**
    - Assign rotating Bye: each round different player rests
    - Bye doesn’t affect standings

**Example group of 4 players:**

```
Round 1: A vs B, C vs D
Round 2: A vs C, B vs D
Round 3: A vs D, B vs C
```

### 13.2 Knockout Draw

**Generation process:**

1. **Calculate draw size:**
    - Nearest power of 2: 8, 16, 32, 64, etc.
    - If participants < size: insert Byes
2. **Place seeds:**
    
    ```
    16-draw:
    Position 1:  Seed 1
    Position 16: Seed 2
    Position 9:  Seed 3
    Position 8:  Seed 4
    Position 5:  Seed 5-8 (draw)
    Position 12: Seed 5-8 (draw)
    ...
    ```
    
3. **Place Byes:**
    - Byes assigned to top seeds
    - Example: Seed 1 with Bye in first round
4. **Draw remaining participants:**
    - Positions not occupied by seeds or Byes
5. **Generate successive rounds:**
    - Automatic according to winner advancement

**Consolation draws:**
- **Simple:** First-round losers pass to parallel draw
- **Multiple:** Losers from each round to different levels
- **Compass:** Complex system with 4+ interconnected draws

### 13.3 Match Play Draw

**Generation process:**

1. **No fixed structure:**
    - No traditional visual draw
    - List of active participants
2. **Pairings:**
    - **Option A - Free:** Players find each other
    - **Option B - Predetermined:** System proposes pairings by similar ranking
3. **Match recording:**
    - Participants create match when agreeing to play
    - No limit on matches per player
4. **Continuous standings:**
    - Update after each result
    - Fluid ranking throughout tournament period

---

## 14. **Order of Play - Generation and Management**

### 14.1 Order of Play Generation Algorithm

**Inputs:**
- Pending matches (TBP state)
- Number of available courts
- Opening/closing hours
- Estimated time per match (e.g., 90 minutes)
- Player declared availability (optional)
- Margin between matches for same player (e.g., 2 hours)

**Process:**

1. **Prioritize matches:**
    - Finals and semifinals: high priority
    - Matches unlocking next round: high priority
    - Round Robin with multiple rounds: distribute evenly
2. **Assign time slots:**
    
    ```
    Example with 3 courts and 9:00-21:00 schedule:
    
    Court 1    Court 2    Court 3
    9:00       9:00       9:00
    Match A    Match B    Match C
    
    10:30      10:30      10:30
    Match D    Match E    Match F
    
    12:00      12:00      12:00
    Match G    Match H    Match I
    ```
    
3. **Verify restrictions:**
    - No player with 2 simultaneous matches
    - Respect minimum margin between matches for same player
    - Consider declared availability
4. **Adjust for real-time delays:**
    - If previous match extends: wait or relocate
    - Reassign free courts to waiting matches

### 14.2 Order of Play Publication Format

```
ORDER OF PLAY - Saturday, November 15, 2025

CENTRAL COURT
09:00 - Carlos Martínez vs Ana García (Semifinal)
       [Estimated: 90 min]

10:30 - Pedro Ruiz vs Sandra López (Quarters)
       [Estimated: 90 min]

12:00 - Final - SF1 Winner vs SF2 Winner
       [NOT BEFORE 12:00]

COURT 2
09:00 - Luis Fernández vs María Torres (Round Robin Group A)
09:45 - Jorge Sánchez vs Elena Díaz (Round Robin Group B)
10:30 - TBD vs TBD (Pending previous result)

COURT 3
09:00 - Consolation match...
```

### 14.3 Special Situation Management

**Delays:**
- **Less than 15 min:** Wait, next match delayed
- **More than 15 min:** Evaluate court reassignment or reschedule
- **Notifications:** To players affected by changes

**No-shows:**
- **15 min grace:** Standard tolerance
- **15-30 min:** Urgent phone contact
- **+30 min unjustified:** WO (opponent victory by no-show)
- **Justified (emergency):** Reschedule

**Weather suspensions:**
- SUS state, save score
- Evaluate resumption same day if weather improves
- Reschedule for another day if necessary
- Notify new schedules to all affected

---

## 15. **Detailed Notification System**

### 15.1 Notification Types and Recipients

**For Participants:**

| Event | Notification Title | Content |
| --- | --- | --- |
| Own new result | “Result recorded” | “[Opponent] has recorded your match result: X-Y” |
| Result pending confirmation | “Confirm result” | “Your opponent awaits your result confirmation: X-Y” |
| Order of play published | “Match scheduled” | “You’ll play tomorrow at 10:00 on Central Court vs [Opponent]” |
| Order of play change | “Schedule change” | “Your match has been rescheduled to 12:00” |
| New announcement | “New tournament announcement” | “[Announcement title]” |
| Updated standings | “Standings updated” | “Check your current tournament position” |
| 24h reminder | “Match tomorrow” | “Remember your match tomorrow at 10:00” |
| 2h reminder | “Match in 2 hours” | “Your match starts in 2 hours on [Court]” |

**For Administrators:**

| Event | Notification Title | Content |
| --- | --- | --- |
| New registration | “New registration” | “[Player] has registered for tournament [Name]” |
| Participant withdrawal | “Participant withdrawal” | “[Player] has withdrawn from tournament” |
| New result | “Result recorded” | “[Player A] vs [Player B]: X-Y” |
| Result dispute | “Result disputed” | “[Player] disputes their match result” |
| Result pending validation | “Confirm result” | “Result pending your confirmation” |
| Data modification | “Data modified” | “[Player] has updated their profile” |

### 15.2 Notification Channels and Configuration

**In-App Notifications:**
- Numeric badge on bell icon
- Notification list with timestamp
- Mark as read/unread
- Delete old notifications
- Filter by event type

**Email Notifications:**
- Personalized subject according to event
- Body with complete information
- Direct link to relevant app section
- Direct reply option (optional)
- Configurable frequency: immediate, daily digest, weekly digest

**Telegram Notifications:**
- Requires prior bot linkage
- Instant messages with quick action buttons
- Action examples: “Confirm result”, “View order of play”
- Limitation: maximum 1 notification every 5 min per tournament

**Web Push Notifications:**
- Works with browser closed
- Requires browser permission
- Native OS notifications
- Click opens app directly in relevant section

### 15.3 Notification Configuration Panel

```
NOTIFICATION SETTINGS

Active channels:
☑ In-app notifications
☑ Email
☐ Telegram (Link account)
☑ Web Push

Events to notify:
☑ New results in my matches
☑ Results pending confirmation
☑ Order of play publication
☑ Order of play changes affecting me
☑ New announcements
☐ Standings updates
☑ Match reminders (24h before)
☑ Match reminders (2h before)

Email frequency:
○ Immediate (each event)
● Daily digest (1 email per day)
○ Weekly digest (1 email per week)
```

---

## 16. **Detailed Announcement System**

### 16.1 Complete Announcement Structure

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| **ID** | Numeric | Unique identifier | Yes (auto) |
| **Type** | Enum | Public / Private | Yes |
| **Title** | Text (100 char) | Announcement header | Yes |
| **Summary** | Text (250 char) | Brief text for preview | Yes |
| **Long Text** | HTML text | Complete formatted content | Yes |
| **Publication Date** | Timestamp | When it becomes visible (can be future) | Yes |
| **Expiration Date** | Timestamp | When it stops showing automatically | No |
| **Image** | File | Optional graphic (max 2MB) | No |
| **External Link** | URL | Link to additional resource | No |
| **Tags** | List | Categorization (multiple selection) | No |
| **Associated Tournament** | Relationship | Link to specific tournament | No |
| **Author** | Relationship | Admin who created it | Yes (auto) |
| **Pinned** | Boolean | If should be displayed prominently | No (default: false) |
| **Views** | Numeric | View counter | Yes (auto, 0) |
| **Creation Date** | Timestamp | When created (different from publication) | Yes (auto) |

### 16.2 Predefined Tag System

**Standard tags:**
- **Draw:** Announcements about draw seeding
- **Order of play:** Schedule publication
- **Results:** Round summaries
- **Standings:** Standing updates
- **Regulations:** Rule reminders or changes
- **Weather:** Weather warnings and suspensions
- **Facilities:** Information about courts, locker rooms
- **Final:** Specific final announcements
- **Awards:** Information about prizes and ceremony
- **General:** Miscellaneous announcements

**Customization:**
- Administrators can create custom tags
- Useful for tournaments with special characteristics

### 16.3 Announcement Visualization

**List view:**

```
┌────────────────────────────────────────────────┐
│ 📌 PINNED                                      │
│ Schedule change due to rain                   │
│ Saturday's order of play is postponed...      │
│ [Draw] [Order of play] | 2 hours ago          │
├────────────────────────────────────────────────┤
│ Friday round results                           │
│ Summary of all disputed matches...            │
│ [Results] | Yesterday at 22:00                │
├────────────────────────────────────────────────┤
│ Official draw published                        │
│ You can now check your draw and opponents...  │
│ [Draw] | 3 days ago                           │
└────────────────────────────────────────────────┘
```

**Detailed view:**

```
┌────────────────────────────────────────────────┐
│ ANNOUNCEMENT - [Tags]                          │
├────────────────────────────────────────────────┤
│ Schedule change due to rain                   │
│                                                │
│ [IMAGE]                                        │
│                                                │
│ Due to adverse weather conditions             │
│ scheduled order of play for Saturday          │
│ November 15 has been modified...              │
│                                                │
│ [External link: View new complete order]      │
│                                                │
│ Published: 11/14/2025 18:30                   │
│ By: Tournament Admin                           │
│ Views: 127                                     │
└────────────────────────────────────────────────┘
```

---

## 17. **Privacy Management - Detailed Configuration**

### 17.1 User Privacy Configuration Panel

```
PRIVACY SETTINGS

Contact data:
Email: user@example.com
├─ Visibility: ● Only administrators
                ○ Same tournament participants
                ○ All registered users
                ○ General public

Phone: +34 600 123 456
├─ Visibility: ○ Only administrators
                ● Same tournament participants
                ○ All registered users
                ○ General public

Telegram: @tennis_user
├─ Visibility: ● Only administrators
                ○ Same tournament participants
                ○ All registered users
                ○ General public

WhatsApp: +34 600 123 456
├─ Visibility: ○ Only administrators
                ● Same tournament participants
                ○ All registered users
                ○ General public

Avatar image:
├─ Visibility: ○ Only administrators
                ○ Registered users
                ● General public

Personal information:
☑ Show age/category publicly
☑ Show ranking publicly
☐ Show tournament history publicly
☑ Allow other players to contact me

Statistics:
☑ Show personal statistics to registered users
☐ Show personal statistics to public
```

### 17.2 Contextual Access by Relationship

**Scenario 1: User A and User B are in same tournament**
- User B can see A’s contact data according to A’s “same tournament” setting
- Useful for coordinating schedules or contacting before match

**Scenario 2: User A and User B don’t share tournament**
- User B only sees data configured as “all registered” or “public”
- Limits access to sensitive data between strangers

**Scenario 3: Unregistered user consults profile A**
- Only sees data expressly authorized as “general public”
- Minimum access to protect privacy

**Scenario 4: Administrator consults any profile**
- Full access regardless of configuration
- Necessary for tournament management and incident resolution

---

## 18. **Complete Tournament Workflow**

### 18.1 Phase 1: Initial Configuration (Pre-tournament)

**Week -4 to -2:**

1. **Administrator creates tournament:**
    - Accesses “New Tournament”
    - Completes form: name, dates, categories, quotas, courts
    - Defines specific regulations and tiebreak criteria
    - Configures ranking system (points/ratios)
    - Publishes tournament with “Registration” status
2. **Initial announcement:**
    - Administrator creates call announcement
    - Includes: tournament rules, key dates, quotas, prizes
    - Tag: [General] [Regulations]
    - Notification to system registered users
3. **Registration period:**
    - Registered participants register online
    - System validates category, quota availability
    - Administrator can manually enroll participants
    - Announcements update registration status

**Week -1:**

1. **Registration closure:**
    - System automatically closes registrations at deadline
    - Administrator reviews final list of registered
    - Assignment of entry states (DA, WC, ALT, etc.)
    - Waiting list management if quota exceeded
2. **Pre-draw announcement:**
    - List of direct acceptances
    - List of qualifiers (if applicable)
    - List of alternates
    - Important regulation reminder

### 18.2 Phase 2: Draw and Preparation (Pre-tournament)

**Thursday before tournament:**

1. **Draw generation:**
    - Administrator accesses “Generate Draw”
    - Selects type: Round Robin / Knockout / Match Play
    - Configures parameters: seeds, groups, qualifiers
    - System generates draw automatically
    - Administrator reviews and confirms
2. **Draw publication:**
    - Draw visible on platform
    - Announcement with official draws
    - Tag: [Draw]
    - Notifications to all participants
    - Each player receives information about opponents
3. **Last-minute adjustments:**
    - Late withdrawal management (WD)
    - Lucky Loser (LL) entry if withdrawals
    - Draw regeneration if necessary
    - Change announcement if applicable

**Friday before tournament:**

1. **Order of play generation:**
    - Administrator creates order for Day 1
    - Considers court availability and schedules
    - Assigns court and time to each match
    - Adapts to player declared availability
2. **Order of play publication:**
    - Order visible at least 24h before
    - Official announcement with schedules
    - Tag: [Order of play]
    - Personalized notifications to affected participants
    - 24h reminders before match

### 18.3 Phase 3: Tournament Development (During)

**Tournament Day 1 - Saturday:**

1. **Match start:**
    - Participants consult order of play from app
    - 2h reminders before match
    - Notifications if last-minute changes
    - No-show control (15 min tolerance)
2. **Real-time result recording:**
    - **By participants:**
        - Player A enters result after finishing
        - System notifies Player B to confirm
        - If B confirms: “Completed” status immediate
        - If B disputes: administrator notification
    - **By administrator:**
        - Direct entry with immediate validity
        - Useful if players don’t do it quickly
3. **Automatic standings update:**
    - System recalculates after each confirmed result
    - Standings visible in real-time
    - Participants check their updated position
    - Public follows tournament evolution
4. **Incident management:**
    - **Rain suspension:**
        - Administrator marks match as SUS
        - Saves current score
        - Announcement informing suspension
        - Resumption or reschedule evaluation
    - **Significant delay:**
        - Free court reassignment
        - Later schedule adjustment
        - Notifications to affected
    - **Mid-match retirement:**
        - RET state recording
        - Victory to opponent, current set won/lost
        - Standings update
5. **Day announcements:**
    - Evening round summary
    - Featured results
    - Updated standings
    - Tag: [Results] [Standings]
6. **Day 2 order generation:**
    - According to day 1 results
    - Publication before 22:00
    - Notifications to next day participants

**Tournament Day 2 - Sunday:**

1. **Continuation similar to Day 1:**
    - Matches according to order of play
    - Real-time result recording
    - Incident management
    - Continuous standings update
2. **Successive phases (if applicable):**
    - **Round Robin finished → Knockout:**
        - System identifies qualifiers automatically
        - Administrator generates knockout draw
        - Announcement with final phase draw
        - Semifinal/final order of play
    - **Consolation draws:**
        - Losers pass to parallel draw
        - Independent finals management

### 18.4 Phase 4: Completion and Closure

**Tournament end:**

1. **Finals dispute:**
    - Final matches according to order of play
    - Final result recording
    - Definitive confirmation
2. **Champion proclamation:**
    - System identifies winner automatically
    - Consolidated final standings
    - Congratulation announcement
    - Tag: [Final] [Results]
3. **Final standings publication:**
    - Complete rankings of all categories
    - Featured statistics
    - Most outstanding players
    - Tournament data summary
4. **Data export:**
    - Administrator exports results to CSV (ITF)
    - Export to TODS if applicable
    - Statistics to PDF/Excel
    - Useful for global ranking and records
5. **Closure announcement:**
    - Thanks to participants
    - Final tournament summary
    - Featured photos (optional)
    - Upcoming tournament announcement
6. **Marked as finished:**
    - Administrator changes status to “Finished”
    - Tournament goes to historical
    - Remains accessible for consultation
    - Cannot create new matches

### 18.5 Phase 5: Post-tournament

**Following days:**

1. **Global ranking update:**
    - If global system ranking exists
    - Tournament points added to accumulated
    - Recalculate general positions
2. **Historical consultation:**
    - Participants can review their statistics
    - Past match consultation
    - Participated tournament history
3. **Feedback (optional):**
    - Satisfaction survey
    - Organization comments
    - Improvement suggestions

---

## 19. **Main Use Cases**

### 19.1 UC-01: Register for Tournament

**Actor:** Registered Participant

**Preconditions:** Authenticated user, tournament in registration period, user meets category requirements

**Basic flow:**
1. Participant accesses “Available Tournaments”
2. System displays registration tournaments
3. Participant selects tournament of interest
4. System displays details: category, dates, quotas, regulations
5. Participant clicks “Register”
6. System verifies available quota
7. Participant completes required information (ranking, contact data)
8. Participant confirms registration
9. System validates data and records registration
10. System assigns initial entry state (DA/ALT according to ranking)
11. System sends confirmation notification
12. System notifies administrators of new registration

**Alternative flow:**
- 6a. Full quota: System adds to waiting list (ALT state)
- 7a. In doubles tournament: Specify pair (must be registered)
- 9a. Incomplete data: System marks required fields in red

**Postconditions:** Participant registered with assigned state, notifications sent

### 19.2 UC-02: Generate Draw Seeding

**Actor:** Tournament Administrator

**Preconditions:** Tournament with closed registrations, confirmed participants

**Basic flow:**
1. Administrator accesses specific tournament
2. Administrator selects “Generate Draw”
3. System displays options: Round Robin / Knockout / Match Play
4. Administrator selects draw type
5. System displays specific configuration:
- Round Robin: number of groups, qualifiers
- Knockout: number of seeds, consolation type
- Match Play: pairing criteria
6. Administrator configures desired parameters
7. Administrator clicks “Generate Draw”
8. System calculates draw according to corresponding algorithm
9. System displays draw preview
10. Administrator reviews and confirms
11. System saves draw and creates matches (TBP state)
12. System publishes draw visibly
13. System creates automatic draw announcement
14. System notifies all participants

**Alternative flow:**
- 10a. Unsatisfactory draw: Administrator regenerates with other parameters
- 8a. Odd number in Round Robin: System assigns rotating Byes
- 8b. Knockout draw with participants < power of 2: System places Byes

**Postconditions:** Draw generated and published, participants notified

### 19.3 UC-03: Record Match Result

**Actor:** Registered Participant or Administrator

**Preconditions:** Match in TBP or IP state, user is match participant or administrator

**Basic flow (Participant):**
1. Participant accesses “My Matches”
2. System displays list of pending and played matches
3. Participant selects recently finished match
4. System displays result form
5. Participant enters sets and games for each set
6. Participant selects final state (CO/RET/WO)
7. Participant optionally adds comments
8. Participant indicates who provided balls
9. Participant confirms result
10. System validates result format
11. System marks result as “Pending confirmation”
12. System notifies opponent for confirmation
13. Opponent receives notification and accesses match
14. Opponent reviews result and confirms
15. System changes status to “Completed”
16. System recalculates standings automatically
17. System notifies administrators
18. System updates order of play if affects following matches

**Basic flow (Administrator):**
1-4. Similar to participant
5-9. Similar to participant
10. System validates format
11. System marks result as “Completed” immediately (no confirmation)
12-15. System omits confirmation process
16-18. Same as participant flow

**Alternative flow:**
- 14a. Opponent disputes result: System notifies administrator, who decides validate/modify/annul
- 10a. Invalid format: System shows explanatory error
- 7a. Participant suspends match: Selects SUS state, saves partial score

**Postconditions:** Result recorded and confirmed, standings updated, notifications sent

### 19.4 UC-04: Generate Order of Play

**Actor:** Tournament Administrator

**Preconditions:** Active tournament, pending matches (TBP), configured courts

**Basic flow:**
1. Administrator accesses tournament
2. Administrator selects “Generate Order of Play”
3. System displays matches pending scheduling
4. System displays court availability and schedules
5. Administrator selects order of play date
6. Administrator can choose:
- **Option A:** Automatic assisted generation
- **Option B:** Manual one-by-one assignment
7. If Option A:
- System proposes optimal distribution
- Administrator reviews and adjusts if necessary
8. If Option B:
- Administrator drags matches to time slots/courts
- System validates restrictions (same player simultaneous)
9. Administrator assigns estimated times
10. System verifies total coherence
11. Administrator confirms order of play
12. System publishes order of play
13. System creates announcement with complete order
14. System notifies affected participants (24h reminder)

**Alternative flow:**
- 10a. Conflict detected (same player 2 simultaneous matches): System alerts and blocks confirmation
- 6a. Player declared availability: System prioritizes preferred schedules
- 14a. Later change: Administrator can modify, system re-notifies affected

**Postconditions:** Order of play published, participants notified

### 19.5 UC-05: Consult Personal Statistics

**Actor:** Registered Participant

**Preconditions:** Authenticated user, participant in at least one tournament

**Basic flow:**
1. Participant accesses “My Profile”
2. Participant selects “Statistics”
3. System displays scope selector:
- Specific tournament
- All historical tournaments
- Current season
- Comparison with specific opponent
4. Participant selects desired scope
5. System calculates and displays statistics:
- Matches: played, won, lost, %
- Sets: played, won, lost, %
- Games: played, won, lost, %
- Streaks: consecutive wins, consecutive losses
- Evolution graph (if global ranking exists)
- Participated tournaments
- Best position achieved
6. If opponent comparison:
- Direct head-to-head history
- Win/loss balance
- Last match result
7. Participant can export statistics to PDF

**Alternative flow:**
- 4a. No data in selected scope: System shows informative message
- 5a. Privacy configuration: If statistics are private, other users don’t see them

**Postconditions:** Statistics visualized, optionally exported

---

## 20. **Suggested Technical Architecture**

### 20.1 Recommended Technology Stack

**Frontend:**
- **Framework:** Angular
- **State Management:** Redux Toolkit, Zustand, etc
- **UI Components:** Material-UI, Ant Design, or Tailwind CSS + Headless UI
- **Real-time notifications:** Socket.io-client
- **Charts and statistics:** Recharts or Chart.js
- **Forms:** Angular Hooks
- **PWA:** Workbox for service workers

**Backend:**
- **Language:** Node.js (TypeScript) or Python (FastAPI)
- **Framework:** Express, NestJS, or FastAPI
- **API:** RESTful + WebSockets for real-time
- **Authentication:** JWT with refresh tokens
- **ORM:** Prisma, TypeORM, or SQLAlchemy

**Database:**
- **Main:** PostgreSQL (relational)
- **Cache:** Redis for sessions and frequent data
- **Search:** ElasticSearch for advanced search (optional)

**Notifications:**
- **Email:** SendGrid, Amazon SES, or Mailgun
- **Telegram:** Telegram Bot API
- **Web Push:** OneSignal, Firebase Cloud Messaging, or web-push (npm)

**Storage:**
- **Images:** Amazon S3, Cloudinary, or Google Cloud Storage
- **Static files:** CDN (CloudFlare, AWS CloudFront)

**Infrastructure:**
- **Hosting:** AWS (EC2, ECS), Google Cloud, DigitalOcean, or Heroku
- **Containers:** Docker + Docker Compose
- **Orchestration:** Kubernetes (large-scale production)
- **CI/CD:** GitHub Actions, GitLab CI, or CircleCI
- **Monitoring:** Sentry (errors), DataDog, or New Relic

### 20.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Angular)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Web App     │  │  Mobile      │  │  Tablet      │  │
│  │  Web App     │  │  Mobile      │  │  Tablet      │  │
│  │  (Desktop)   │  │  (Browser)   │  │  (Browser)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
          ┌──────────────────▼───────────────────┐
          │      API GATEWAY (NGINX/Kong)        │
          │   - Rate limiting                    │
          │   - Load balancing                   │
          └──────────────────┬───────────────────┘
                             │
          ┌──────────────────▼───────────────────┐
          │      BACKEND (Node.js/Python)        │
          │  ┌────────────────────────────────┐  │
          │  │  Services:                     │  │
          │  │  - Auth Service                │  │
          │  │  - Tournament Service          │  │
          │  │  - Match Service               │  │
          │  │  - Player Service              │  │
          │  │  - Notification Service        │  │
          │  │  - Communication Service       │  │
          │  │  - Schedule Service            │  │
          │  │  - Statistics Service          │  │
          │  └────────────────────────────────┘  │
          └────┬─────────────┬──────────────┬────┘
               │             │              │
    ┌──────────▼────┐  ┌────▼──────┐  ┌───▼──────────┐
    │  PostgreSQL   │  │   Redis   │  │  File        │
    │   Database    │  │   Cache   │  │  Storage     │
    │               │  │           │  │  (S3/Cloud)  │
    └───────────────┘  └───────────┘  └──────────────┘
               │
    ┌──────────▼─────────────────────────┐
    │  External Services:                │
    │  - SendGrid (Email)                │
    │  - Telegram Bot API                │
    │  - Firebase/OneSignal (Web Push)   │
    └────────────────────────────────────┘
```

### 20.3 Database Structure

**Main tables:**

1. **users**
    - id, email, password_hash, role (system_admin/tournament_admin/player/public), name, surname, dni_nie, phone, telegram_username, whatsapp, avatar_url, ranking_global, privacy_settings (JSON), notification_preferences (JSON), created_at, updated_at
2. **tournaments**
    - id, name, start_date, end_date, registration_deadline, category_gender, category_age, category_level, surface, installation_type, max_participants, rules_text, privacy_level, court_count, court_names (JSON), court_schedule (JSON), tournament_type (singles/doubles), status (registration/active/finished), admin_id, contact_info, created_at, updated_at
3. **tournament_draws**
    - id, tournament_id, draw_type (round_robin/knockout/match_play), draw_name, configuration (JSON), sort_order, created_at
4. **participants**
    - id, tournament_id, user_id, entry_status (OA/DA/SE/JE/QU/LL/WC/ALT/WD), ranking_at_draw, registration_date, withdrawal_date, partner_id (for doubles)
5. **matches**
    - id, draw_id, round, match_number, player1_id, player2_id, court, scheduled_date, scheduled_time, status (TBP/IP/SUS/CO/RET/WO/ABN/BYE/NP/CAN/DEF/DR), set1_player1, set1_player2, set2_player1, set2_player2, set3_player1, set3_player2, winner_id, confirmed, disputed, who_provided_balls, player_comments, estimated_duration, created_at, updated_at, completed_at
6. **standings**
    - id, draw_id, participant_id, group_number (for round robin), position, points, matches_won, matches_lost, sets_won, sets_lost, games_won, games_lost, tie_break_value, updated_at
7. **communications**
    - id, tournament_id, type (public/private), title, summary, full_text, publication_date, expiration_date, image_url, external_link, tags (JSON), author_id, pinned, view_count, created_at
8. **notifications**
    - id, user_id, type, title, content, related_id, related_type (match/tournament/communication), read, sent_via (in_app/email/telegram/push), created_at
9. **match_results_history**
    - id, match_id, user_id (who recorded), result_data (JSON), timestamp, confirmed_by, disputed_by
10. **global_rankings**
    - id, user_id, points, position, last_updated

**Key relationships:**
- tournaments ← (1:N) → tournament_draws
- tournament_draws ← (1:N) → matches
- tournaments ← (N:M) → users (via participants)
- matches ← (1:N) → match_results_history
- users ← (1:N) → notifications

---

## 21. **Testing Specifications**

### 21.1 Required Unit Tests

**test_draw_generation.js:**
- Correct Round Robin draw generation with N groups
- Balanced participant distribution in groups
- Correct Bye assignment in odd groups
- Correct knockout draw generation with seeds
- Strategic seed placement in knockouts
- First-round Bye insertion in knockouts
- Match Play draw generation without fixed structure

**test_match_states.js:**
- Valid transitions between match states
- Invalid transition blocking
- Correct calculation of impact on standings by state
- WO management: correct points, optional sets/games
- RET management: current set won to opponent
- BYE state: automatic pass without affecting standings

**test_standings.js:**
- Correct point-based standing calculation
- Correct ratio-based standing calculation
- Sequential tiebreak criteria application
- Set ratio as first tiebreak
- Game ratio as second tiebreak
- Head-to-head between tied players
- Draw ranking as tiebreak before random draw
- Automatic recalculation after result confirmation

**test_participants.js:**
- Correct DA state assignment by ranking
- Waiting list (ALT) generation when quota exceeded
- ALT → LL transition when entering by withdrawal
- Change to WD upon withdrawal
- Maximum quota validation in registration
- Withdrawal management: before draw, after draw, during tournament

**test_permissions.js:**
- System admin has full access to all tournaments
- Tournament admin only accesses own tournaments
- Participant only sees tournaments where registered
- Public only sees tournaments configured as public
- Permission validation in result modification
- Permission validation in draw generation
- Privacy configuration respected in profile access

**test_notifications.js:**
- Notification generation upon result recording
- Pending confirmation notification to opponent
- Notification to participants upon order of play publication
- Notification to administrators on new registration
- Multichannel sending according to user preferences
- Frequency limits respected (Telegram: 1 every 5 min)

**test_privacy.js:**
- Contact data visible according to “same tournament” configuration
- Data hidden between users without common tournament
- Administrators always see complete data
- Public only sees explicitly authorized data
- Avatar visible according to configured level

**test_export.js:**
- Correct export to ITF CSV format
- Correct export to TODS
- Valid structure of exported files
- Inclusion of all confirmed results

### 21.2 Integration Tests

**test_complete_tournament_flow.js:**
- Complete flow: create tournament → registrations → draw → matches → results → finish
- Bidirectional entry state assignment
- Draw generation and automatic match creation
- Record result → confirmation → standings recalculation
- Notifications sent at each stage

**test_multi_phase_tournament.js:**
- Round Robin with qualifiers advancing to knockout
- Automatic linking between phases
- Consolation draws for eliminated players
- Correct standing in each phase

### 21.3 Interface Tests (E2E)

**test_ui_player.js:**
- Player can register for available tournament
- Player sees their scheduled matches
- Player records result and opponent confirms
- Player consults updated standings
- Player receives notifications visually

**test_ui_admin.js:**
- Admin creates tournament with complete configuration
- Admin generates draw and visualizes draw
- Admin creates order of play manually
- Admin validates/modifies disputed results
- Admin publishes announcement and users are notified

### 21.4 Minimum Coverage

- Line coverage: ≥70%
- Critical function coverage: 100% (draw generation, standings calculation, permission validation, notifications)

---

## 22. **Security and Compliance**

### 22.1 Security Measures

**Authentication:**
- Passwords hashed with bcrypt (salt rounds ≥12)
- JWT tokens with 1-hour expiration
- Refresh tokens for secure renewal (valid 7 days)
- Automatic session closure after 30 min inactivity
- Temporary lockout after 5 failed login attempts (15 min)
- Password recovery via unique email token

**Authorization:**
- Backend permission validation for each operation
- JWT tokens include role and accessible tournaments
- Authorization middleware on all protected routes
- Critical action audit logs

**Data protection:**
- Communications always via HTTPS/TLS
- Sensitive data encrypted in database
- Anonymization of data in logs
- No plaintext password storage
- Input sanitization to prevent XSS

**Attack prevention:**
- SQL Injection protection (ORM use with prepared statements)
- XSS protection (HTML sanitization and escaping)
- CSRF protection (CSRF tokens in forms)
- Rate limiting: 100 req/min per IP, 200 req/min per authenticated user
- Strict upload validation (type, max size 10MB)

### 22.2 GDPR/LOPD Compliance

- **Explicit consent:** Checkbox in registration to accept privacy policy
- **Right of access:** User can download all their data in JSON/PDF format
- **Right of rectification:** User can modify personal data from profile
- **Right of deletion:** User can request account deletion (history anonymized)
- **Right to portability:** Data export in portable format
- **Transparency:** Clear and accessible privacy policy
- **Data minimization:** Only necessary data requested
- **Purpose limitation:** Data used exclusively for tournament management
- **Activity logging:** Logs of personal data access

---

## 23. **Success Metrics and KPIs**

### 23.1 Adoption Metrics

- **Number of tournaments created:** Target: 50+ tournaments in first year
- **Number of registered participants:** Target: 500+ users in first year
- **Online registration rate:** Target: ≥80% registrations via platform
- **Player result recording rate:** Target: ≥70% results entered by participants
- **Monthly active users (MAU):** Sustained growth
- **User retention:** ≥60% of participants repeat in next tournament

### 23.2 Quality Metrics

- **Percentage of disputed results:** <5% of results with conflict
- **Average result confirmation time:** <2 hours from entry
- **User satisfaction:** ≥4.5/5 in surveys
- **Number of administrator modifications:** Decreasing trend (greater participant autonomy)
- **Post-draw withdrawal rate:** <10% of participants

### 23.3 Technical Metrics

- **Main page load time:** <2 seconds
- **System uptime:** ≥99.5%
- **Critical operation error rate:** <0.1%
- **Real-time notification latency:** <5 seconds
- **Notification success rate:** ≥95% delivered

### 23.4 Engagement Metrics

- **Access frequency during active tournaments:** ≥3 accesses/participant/day
- **Real-time standing queries:** High volume during tournaments
- **Announcement interaction:** Opening rate ≥60%
- **Notification configuration:** ≥70% of users customize preferences

---

## 24. **Deliverables**

1. **Complete source code** in Git repository with modular structure
2. **Responsive web application** deployed on production server
3. **Database** configured with complete structure and migrations
4. **Documented REST API** with Swagger/OpenAPI
5. **Test suite** with ≥70% coverage
6. **PWA implementation** with basic offline functionality
7. **Multichannel notification system** (in-app, email, Telegram, web push)
8. **Complete documentation:**
    - README with installation and deployment instructions
    - User manual by role (System Admin, Tournament Admin, Participant)
    - Tournament configuration guide
    - Technical architecture documentation
    - API documentation
    - Visual customization guide
9. **Examples and test data:**
    - Pre-configured example tournament
    - Test users for each role
    - Initial data loading scripts
10. **Backup system** configured and documented
11. **Exporters** to ITF and TODS functional formats

---

## 25. **Complete Glossary of Terms**

| Term | Definition |
| --- | --- |
| **OA** | Organizer Acceptance - Directly assigned place |
| **DA** | Direct Acceptance - Automatic entry by ranking |
| **SE** | Special Exemption - Place for special circumstances |
| **JE** | Junior Exemption - Place reserved for junior category |
| **QU** | Qualifier - Participant who passed qualifying phase |
| **LL** | Lucky Loser - Alternate entering by another’s withdrawal |
| **WC** | Wild Card - Direct organizer invitation |
| **ALT** | Alternate - Reserve on waiting list |
| **WD** | Withdrawn - Participant who has withdrawn |
| **TBP** | To Be Played - Scheduled pending match |
| **IP** | In Progress - Match started but not finished |
| **SUS** | Suspended - Match temporarily interrupted |
| **CO** | Completed - Match finished normally |
| **RET** | Retired - Match finished by retirement during play |
| **WO** | Walkover - Victory by opponent no-show |
| **ABN** | Abandoned - Match abandoned without valid result |
| **BYE** | Player bye - Automatic pass without playing |
| **NP** | Not Played - Match not disputed |
| **CAN** | Cancelled - Match annulled by organization |
| **DEF** | Default - Disciplinary disqualification |
| **DR** | Dead rubber - Match without standings relevance |
| **Round Robin** | Round-robin system by groups |
| **Knockout** | Direct elimination system |
| **Match Play** | Open format without fixed structure |
| **Seed** | Pre-ranked player in draw |
| **Supertiebreak** | 10-point tiebreak replacing third set |
| **ELO** | Ranking system weighting opponent’s ranking |
| **Ratio** | Mathematical proportion (won/lost) |
| **ITF** | International Tennis Federation |
| **TODS** | Tennis Open Data Standards |
| **PWA** | Progressive Web App - Web app with offline functionality |
| **Compass Draw** | Multiple interconnected draw system |
| **Double Elimination** | Double knockout - Allowed to lose once |

---

## 26. **References and External Resources**

### 26.1 Standards and Official Documentation

- **ITF Official Website:** https://www.itftennis.com/
- **Tennis Open Data Standards (TODS):** https://itftennis.atlassian.net/wiki/spaces/TODS/overview
- **Official tennis terms glossary:** https://en.wikipedia.org/wiki/Glossary_of_tennis_terms
- **Official tennis rules (ITF Rules):** https://www.itftennis.com/en/about-us/governance/rules-and-regulations/

### 26.2 Draw and Tournament Systems

- **Round Robin (Wikipedia):** https://en.wikipedia.org/wiki/Round-robin_tournament
- **Double Elimination Tournament:** https://en.wikipedia.org/wiki/Double-elimination_tournament
- **Compass Draw System:** https://www.compassdraw.com/about.aspx
- **UTR Match Play Example:** https://app.utrsports.net/clubs/10476

### 26.3 Categories and Rankings

- **Tennis categories by age:** Various national federation references
- **Ranking Systems in Tennis:** https://www.itftennis.com/en/players/rankings/

### 26.4 Tournament and Regulations Examples

- **Match and Gos (real examples):** http://matchandgos.c1.biz/torneos-anteriores/
- Especially useful satellite tournaments to see format and regulation variety

### 26.5 Technologies and Tools

- **Angular Documentation:** https://v17.angular.io/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Socket.io (Real-time):** https://socket.io/docs/
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Web Push Protocol:** https://developers.google.com/web/fundamentals/push-notifications
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725

---

## 27. **Special Cases and Final Considerations**

### 27.1 Advanced Conflict Management

**Accidental double registration:**
- System detects participant already registered when attempting re-registration
- Shows informative message with current registration status
- Allows modifying existing data without creating duplicate

**Doubles partner change post-draw:**
- Requires administrator approval
- Only allowed before first match
- New pair must meet category requirements
- Notification to first match opponents

**Draw merging due to massive withdrawals:**
- If withdrawals reduce participants below viable minimum
- Administrator can merge Round Robin groups
- Recalculate pairings and maintain already played matches
- Mandatory explanatory announcement

### 27.2 Flexibility and Scalability

**Long-duration tournaments:**
- Match Play can extend weeks or months
- System maintains continuously updated standings
- Periodic announcements of intermediate standings
- Flexible deadline for completion

**Multi-venue tournaments:**
- Possibility to assign courts from different locations
- Additional “venue” field for each court
- Order of play groups by venue when possible
- Notifications clearly specify location

**Tournaments with multiple simultaneous categories:**
- Same tournament with independent draws by category
- Shared court management between categories
- Integrated order of play optimizing facility use
- Standings and announcements can filter by category

### 27.3 Future Internationalization

**Multi-language preparation:**
- Interface labels externalized in translation files
- Announcements with language field
- Automatic browser language detection
- Priority languages: Spanish, English, French

**Localized date and time formats:**
- Adaptation to user’s local format
- Tournament time zone clearly specified
- Automatic conversion if user in different zone

### 27.4 Enhanced Accessibility

**Screen reader support:**
- ARIA labels on all interactive elements
- Complete keyboard navigation
- Real-time standing update announcements

**Inclusive design:**
- Sufficient contrast in all elements (WCAG AA)
- Adjustable font sizes
- Clear and universal iconography
- Text alternatives for visual information

---

**Final Notes:** This specification establishes a complete tennis tournament management system with multi-user collaboration, differentiated roles, real-time synchronization, multichannel notifications, and compliance with international tennis standards. The document is detailed enough to guide complete development, generate UML diagrams, use cases, and serve as a basis for technical implementation of a professional, scalable solution aligned with ITF and TODS standards.