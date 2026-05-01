## General Description

Responsive web application for comprehensive management of multiple simultaneous tennis tournaments. The system allows managing all tournament phases from creation to completion, including participant registration, draw design, order of play generation, results recording, rankings calculation, announcement publication, and automatic notification sending. The platform is aimed at tournament organizers, registered participants, and general public, with differentiated roles and specific permissions for each user type.

## User and Role System

The system contemplates three main role types with differentiated permissions:

- **System Administrator**: total control over the platform
    - Manage all tournaments in the system
    - Create, modify and delete tournaments
    - Configure colors, logos and application menus
    - Manage all participants and users
    - Complete access to all draws, results and announcements
    - Receive notifications of new results, registrations or participant modifications
    - Manage tournament administrator roles
    - Modify any result or system data
    - Access global statistics
- **Tournament Administrator**: complete permissions over specific tournaments
    - Create and configure own tournaments
    - Manage registrations and participants of their tournaments
    - Design and draw play brackets
    - Generate order of play
    - Validate and modify results
    - Publish rankings
    - Create and publish announcements
    - Configure specific tournament regulations
    - Manage court availability
    - Mark tournaments as completed
    - Receive notifications of activity in their tournaments
- **Registered Participant**: permissions over their registrations and data
    - Register for available tournaments
    - Withdraw from tournaments (according to tournament regulations)
    - Insert results of their matches immediately
    - Confirm or dispute results entered by rivals
    - Configure user profile (name, surname, ID/NIE, ranking, contact data, avatar image)
    - View profiles and contact data of other participants (according to privacy settings)
    - Receive personalized notifications of new results and announcements
    - View personalized information of scheduled and completed matches
    - View public and private announcements (restricted to registered users)
    - View personalized indications of pending results to visualize
    - View results history with other specific participants
    - Configure notification preferences (email, Telegram, web push)
    - Configure contact data privacy level
- **Unregistered user/public**: read-only access
    - View active and historical tournaments
    - View play brackets
    - Check results and rankings
    - View public announcements
    - View player profiles (according to user privacy settings)
    - View public tournament statistics

## Tournament Management

### General Tournament Features

- Support for simultaneous management of multiple tournaments
- Each tournament can contain several independent brackets
- Tournaments of one or multiple days duration
- Possibility of matches prior to final phase (for qualification or participant reduction)
- Scalable system for use by multiple organizers
- Tournaments can be singles or doubles

### Tournament Registration and Configuration

Each tournament includes the following information:

- **Tournament Name**: complete denomination
- **Dates**: start date, end date, registration dates
- **Categories**:
    - By gender: Indifferent, Male, Female, Mixed (doubles)
    - By age: minors, junior, open, veterans, etc. (according to standard classification)
    - By levels: first division, second, third, etc.
- **Surface**: clay, hard court, grass
- **Installation Type**: indoor (covered) or outdoor (exterior)
- **Maximum Quotas**: maximum number of participants allowed
- **Specific Regulations**: free text with particular tournament rules
- **Privacy Configuration**: public or restricted visibility options
- **Available Courts**: number, names and availability schedules of courts
- **Registration System**: participant acceptance process
- **Contact Information**: organization data

### Supported Bracket Types

The system supports three main bracket types:

- **Round Robin (All against all)**:
    - Indeterminate number of groups (from 1 to n)
    - Each participant plays against all others in their group
    - Classification system by points or ratios
    - Possibility of Bye when there is odd number of participants
    - Top ranked can advance to later elimination phases
    - Participants with lower ranking can move to consolation brackets
    - If there is only one group, first place is direct champion
- **Knockout (Elimination)**:
    - Traditional direct elimination bracket
    - Possibility of main and consolation brackets
    - Support for Byes in first round
    - Seeding system based on ranking
    - Eliminated players can move to consolation brackets
    - Possibility of Compass-type brackets (multiple consolation levels)
    - Limited support for double elimination
- **Match Play (Open format)**:
    - Long period competition without fixed structure
    - Pairings with or without predetermined criteria
    - Number of matches not restricted
    - Continuous ranking (points, ratios, ELO or other formulas)
    - Oriented to amateur competitions
    - Allows implementing non-standard formats

### Phases and Bracket Combinations

- A tournament can have multiple sequential phases
- Phases can be linked automatically or manually
- Common combinations:
    - Round Robin → Knockout (ranked advance to final phase)
    - Qualifying knockout → Main knockout (with additional direct entries)
    - Main bracket → Consolation bracket(s)
    - Custom configurations according to tournament needs

## Participant Management

### Participant Registration

Required information at registration:

- Full name (first and last name)
- Identity document (ID or NIE)
- Corresponding category (if tournament has multiple categories)
- Current ranking at draw date (if applicable)
- Contact data: phone, email
- In doubles tournaments: registration as already formed pair

### Entry Status in Tournament

Participants can have the following statuses:

- **OA (Organizer Acceptance)**: spot assigned directly by organization
- **DA (Direct Acceptance)**: automatic entry by ranking
- **SE (Special Exemption)**: spot by special circumstances
- **JE (Junior Exemption)**: spot reserved for junior category
- **QU (Qualifier)**: participant who passed qualifying phase
- **LL (Lucky Loser)**: alternate who enters due to another participant’s withdrawal
- **WC (Wild Card)**: direct invitation from organizer
- **ALT (Alternate)**: reserve on waiting list
- **WD (Withdrawn)**: participant who has withdrawn

### Maximum Quota Management

When number of registrations exceeds maximum quota:

- Better ranked participants obtain direct acceptance (DA)
- Spots are reserved for qualification (QU)
- Best ranked not directly accepted play qualifying phase
- Qualification spots (QU) are determined by qualifying phase
- Rest go to alternate list (ALT)
- Organization reserves spots for direct assignment (WC, JE, OA, SE)

### Withdrawal System

- **Before draw**: withdrawal without complications, next alternate enters
- **After draw, before first match**: substituted by alternate (ALT becomes LL)
- **After first match**:
    - In knockout: next match is WO for rival
    - In Round Robin: bracket must be adjusted according to regulations
- Participant status changes to WD (Withdrawn)
- Withdrawal deadlines depend on specific tournament rules

## Draw Design and Seeding

### Draw Generator

- Automatic generation according to selected bracket type
- Random or ranking-based draw system
- Possibility to establish seeds based on global or tournament ranking
- Automatic placement of Byes in knockout brackets
- Balanced distribution of participants in Round Robin groups
- Flexible adjustment of number of participants

### Specific Configuration per Bracket

Each bracket can have:

- Bracket type (Round Robin, Knockout, Match Play)
- Number of groups (for Round Robin)
- Number of qualifiers advancing to next phase
- Classification system (points, ratios, mixed)
- Specific tiebreak criteria
- Particular regulations in free text
- Seeding configuration
- Links to other tournament phases

### Modification of Started Brackets

- Administration can modify brackets after draw
- Possibility to generate new bracket and migrate existing results
- Flexibility to adjust number of participants due to circumstances
- Adjustment of schedules and dates as needed
- Management of withdrawals and substitutions

## Match Management

### Match Features

Each match includes:

- **Participants**: two players or two pairs (in doubles)
- **Match Format**:
    - 2 sets + supertiebreak
    - 3 sets
    - Sets to 4 games
    - Sets to 6 games
- **Assigned Court**: court or playing court
- **Scheduled Date and Time**: according to order of play
- **Match Status**: see detailed states below
- **Result**: sets and games for each participant
- **Player Comments**: optional observations about the match
- **Who Provided Balls**: record of responsible for providing material
- **Estimated Time**: for order of play planning
- **Possibility of Suspension and Resumption**: same date or later

### Match States

Matches can have the following states:

- **TBP (To Be Played)**: scheduled match pending dispute
- **IP (In Progress)**: match started but not finished
- **SUS (Suspended)**: match temporarily interrupted (due to weather conditions, schedule, lack of light)
- **CO (Completed)**: match finished normally with result
- **RET (Retired)**: match finished by player retirement during play
- **WO (Walkover)**: victory by rival’s no-show
- **ABN (Abandoned)**: match abandoned without valid result
- **BYE (Player Bye)**: automatic pass without playing (rest in Round Robin or gap in knockout)
- **NP (Not Played)**: match not disputed
- **CAN (Cancelled)**: match cancelled by organization
- **DEF (Player Penalty)**: disqualification for disciplinary reasons
- **DR (Optional - Dead Rubber)**: match without relevance for ranking

### Results Entry

- **By registered participants**:
    - Immediate result entry after finishing match
    - Optional confirmation system by rival
    - If confirmation required: “Pending confirmation” status
    - If not required: immediate final result
    - Possibility to dispute erroneous result by contacting organization
    - Automatic notifications to rival and administrators
- **By administrators**:
    - Direct entry of results with immediate validity
    - Modification of any result (even confirmed)
    - Management of discrepancies between players
    - Possibility to cancel (CAN) or order replay of conflicting matches
- **Results Export**:
    - ITF format (spreadsheet-type CSV)
    - TODS format (Tennis Open Data Standards)
    - Other formats as needed

## Order of Play

### Order of Play Generation

The order of play system considers:

- **Court Availability**:
    - Number of available courts
    - Court names
    - Club opening and closing hours
    - Specific hours reserved for tournament
    - Surface type (homogeneous for entire tournament)
- **Match Planning**:
    - Estimated time per match
    - Court capacity per time slot
    - Match sequence according to bracket progress
    - Margin between matches of same participant (not mandatory but desirable)
- **Creation Process**:
    - Manual or administrator-assisted generation
    - Adaptation to availability declared by players
    - Flexibility for same-day modifications
    - Possibility of immediate court reassignment
- **Delay Management**:
    - Waiting for participant who has not finished previous match
    - Disqualification (DEF) for unjustified delay
    - Suspension (SUS) of matches due to schedule, weather or conditions
    - Resumption on same date or later

### Order of Play Publication

- Mandatory publication at least the day before
- Access for registered participants, administrators and public
- Automatic notifications to affected participants
- Real-time updates if there are changes
- Clear indication of court, estimated time and players

## Ranking System

### Ranking Types

The system supports two main methods:

- **Points-based Ranking**:
    - Point assignment for match won (3, 2 or 1 point)
    - Point assignment for match lost (0 or 1 point)
    - Variable points according to ELO method (based on rival ranking)
    - Points management in unfinished matches (according to regulations)
    - Total sum of points determines position
- **Ratio-based Ranking**:
    - Ratio of matches won/lost
    - Suitable for comparing groups with different number of participants
    - Does not consider matches with WO in ratio calculation (optional according to regulations)

### Tiebreak Criteria

In case of tie in main ranking, the following are applied (according to tournament regulations):

1. **First level**: Ratio of sets won/lost
2. **Second level**: Ratio of games won/lost
3. **Third level**: Difference of sets or games (alternative to ratio)
4. **Fourth level**: Head-to-head between tied players
5. **Fifth level**: Ranking at time of bracket draw
6. **Last level**: Random draw

### Impact of Special States on Rankings

- **WO (Walkover)**:
    - Knockout: automatic classification to next round
    - Round Robin by points: victory points to winner, 0 to loser
    - Round Robin by ratios: sets and games not counted
- **RET (Retirement)**:
    - No points awarded to retired player
    - Match counted as won by rival
    - Current set: won by rival, lost by retired player
- **BYE**:
    - Knockout: automatic pass to next round without playing
    - Round Robin: rest without match, does not affect ranking

### Global Ranking

- Option to maintain global player ranking beyond individual tournaments
- Ranking evolution according to results in multiple tournaments
- Useful for determining seeds in future draws
- Can be used for direct acceptances (DA) in tournaments with limited quota
- Accumulated points system or ELO-type rating

## Notification System

### Automatic Notifications to Participants

The system generates notifications for the following events:

- New result recorded (own or rival’s)
- Result pending confirmation
- Order of play publication with own match
- Changes in order of play affecting the participant
- New published announcements (public and private)
- Rankings updates
- Tournament status changes
- Upcoming match reminders
- Alerts for unviewed results

### Automatic Notifications to Administrators

Administrators receive notifications for:

- New tournament registrations
- Participant registrations
- Participant data modifications
- Participant withdrawals
- New results inserted by participants
- Results pending confirmation
- Result disputes
- Relevant activity in their tournaments

### Notification Channels

- **In-app Notifications**:
    - Visual indicators of pending alerts
    - Unread notifications counter
    - Notification list with history
- **Email Notifications**:
    - Activity summaries
    - Important alerts
    - Scheduled reminders
- **Telegram Notifications**:
    - Instant messages
    - Requires prior account linking
- **Web Push Notifications**:
    - Real-time alerts in browser
    - Works even with application closed

### Notification Configuration

- Each participant configures their preferences in their profile
- Selection of active channels (email, Telegram, web push)
- Selection of event types to notify
- Mandatory according to tournament regulations (defined by organization)
- If no notifications, obligation to frequently check the platform

## Announcement System

### Announcement Types

- **Public**: accessible to everyone, including unregistered users
- **Private**: accessible only to registered users and administrators

### Announcement Structure

Each announcement includes:

- **Title**: announcement header
- **Summary**: brief text for preview
- **Long Text**: complete announcement content
- **Publication Date**: when it becomes visible
- **Expiration Date**: when it stops showing automatically
- **Image**: optional graphic file
- **Link**: optional URL to external resource
- **Tags**: announcement categorization
- **Associated Tournament**: link to specific tournament (optional)

### Tag System

- Tags definable by administrators
- Announcement categorization: “draw”, “order of play”, “qualifiers”, “results”, etc.
- Announcement filtering by tags
- Announcement search by category
- Customization according to tournament type

### Publication and Management

- Creation by system or tournament administrators
- Scheduling of future publication date
- Automatic expiration according to configured date
- Possibility of later editing
- Deletion by administrators
- Automatic notifications to corresponding recipients

## Statistics

### Basic Statistics per Participant

- **Matches**: played, won, lost
- **Match win percentage**
- **Sets**: played, won, lost
- **Set win percentage**
- **Games**: played, won, lost
- **Game win percentage**
- **Streaks**: consecutive wins, consecutive losses
- **History against specific opponents**

### Tournament Statistics

- Total number of participants
- Total number of matches played
- Distribution of results by sets
- Most active participants
- Rankings and classifications
- Statistics by category
- Comparison between tournament phases

### Global Statistics (if there is global ranking)

- Player ranking evolution
- Comparison with other players
- Performance on different surfaces
- Performance by tournament category
- History of tournaments participated

## Privacy and Contact Data Management

### Configurable Privacy Levels

Each registered participant can configure the visibility of:

- **Contact Data** (email, phone, Telegram, WhatsApp):
    - Administrators only
    - Other participants of same tournament
    - All registered users
    - General public (with explicit authorization)
- **Avatar Image**:
    - Administrators only
    - Registered users
    - General public
- **Personal Information**:
    - Age/category visible or not
    - Ranking visible or not
    - Tournament history visible or not

### Data Access by Role

- **Administrators**: complete access to all data
- **Participants of same tournament**: access according to privacy settings and tournament needs
- **Registered users**: access according to user privacy settings
- **Unregistered public**: only data expressly authorized as public

### Purpose of Contact Data Access

- Facilitate schedule coordination between participants
- Promote matches in Match Play tournaments
- Pre-communication for scheduled matches
- Networking among enthusiasts
- Management of last-minute changes

## Application Features

### Platform and Accessibility

- Responsive web application
- Accessible from desktop computers
- Compatible with mobile devices (smartphones)
- Compatible with tablets
- Possibility of implementation as PWA (Progressive Web App)
- Interface adapted to different screen sizes
- Intuitive and clear navigation

### Customization

- **Customizable Visual Configuration**:
    - Corporate color palette
    - Customizable logos
    - Configurable menus
    - Adaptable design by organization or tournament
- **Administration Interface**:
    - Control panel for tournament management
    - Participant and registration management
    - Announcement publication and management
    - Permission and role configuration
    - Moderation tools

### Synchronization and Performance

- Real-time updates
- Automatic synchronization between devices
- Optimization for slow connections
- Intelligent data caching
- Basic offline functionality (consultation of already loaded data)

## Typical Workflow

### 1. Initial Tournament Configuration

- Administrator creates a new tournament with all its configuration
- Defines categories, dates, quotas and regulations
- Configures court availability and schedules
- Establishes classification system and tiebreak criteria
- Opens registration period

### 2. Participant Registration

- Registered participants sign up through the platform
- Unregistered participants can be registered by administrators
- System assigns entry statuses according to ranking and quotas
- Administrators manage waiting list and alternates
- Announcements inform of registration status

### 3. Draw and Bracket Generation

- Once registration period closes, draw is generated
- System creates brackets according to configured type (Round Robin, Knockout, Match Play)
- Seeds are established if applicable
- Generated brackets are published
- Notifications inform participants of their rivals

### 4. Order of Play Generation

- Administrators create order of play considering court availability
- Adapts to availability declared by players
- Order of play is published at least one day before
- Participants receive notifications of their scheduled matches
- Possibility of adjustments and modifications as needed

### 5. Tournament Development

- Participants play their matches according to order of play
- Results are entered immediately (by players or administrators)
- System updates rankings automatically
- New orders of play are generated for following days
- Announcements keep all participants informed
- Administrators manage incidents (withdrawals, suspensions, disputes)

### 6. Tracking and Statistics

- Rankings visible in real time
- Participants check their personal statistics
- Public follows tournament evolution
- Announcements highlight relevant results
- Notifications maintain engagement

### 7. Successive Phases (if applicable)

- Qualifiers from initial phase move to following phases
- System links brackets automatically or manually
- New orders of play are generated for knockout phases
- Consolation brackets for eliminated players (if configured)

### 8. Tournament Completion

- Final is played or winner is proclaimed according to format
- Administrator marks tournament as completed
- Final rankings are published
- Results are exported in standard formats (ITF, TODS)
- Tournament moves to historical but remains accessible for consultation
- Final announcement with results and acknowledgments

### 9. Historical Consultation

- Completed tournaments remain visible
- Results, rankings and statistics accessible
- Useful information for global rankings
- Consultation of historical head-to-heads between players

## Technical Considerations

### Architecture and Development

- Responsive web application with modern framework (React, Vue, Angular)
- Scalable backend for management of multiple concurrent tournaments
- Relational database for tournaments, participants, brackets, results
- REST API for frontend-backend communication
- Optional implementation as PWA

### Integrations and Notifications

- Transactional email sending system
- Integration with Telegram API for notifications
- Web push notification system
- Optional integration with WhatsApp Business API

### Security and Permissions

- Robust authentication system
- Granular role and permission management
- Personal data protection according to GDPR
- Privacy configuration per user
- Activity logs and auditing

### Performance and Scalability

- Optimization for fast loading
- Intelligent caching of frequent data
- Pagination of historical results
- Image compression
- CDN for static resources

### Export and Standards

- Results export in ITF format (CSV)
- Support for Tennis Open Data Standards (TODS)
- Statistics export to common formats (PDF, Excel)
- Possibility of integration with external ranking systems

### Backup and Recovery

- Periodic automatic data backup
- Failure recovery system
- Versioning of critical changes
- Activity logs for traceability

## Permissions and Access by Role

### System Administrator can

- Create, edit and delete all tournaments
- Manage all participants in the system
- Configure global colors, logos and menus
- Access all brackets, results, announcements and statistics
- Modify any data or result
- Manage roles of other administrators
- View notifications of all relevant activity
- Export system data
- Access technical configuration

### Tournament Administrator can

- Create and configure own tournaments
- Manage registrations of their tournaments
- Design, draw and modify brackets of their tournaments
- Generate and modify order of play
- Validate and modify results of their tournaments
- Publish rankings
- Create and manage announcements of their tournaments
- Configure specific regulations
- Manage court availability
- Mark their tournaments as completed
- View notifications of activity in their tournaments
- Export results of their tournaments

### Registered Participant can

- Register and withdraw from tournaments (according to regulations)
- Enter results of their matches
- Confirm or dispute results
- Configure their profile and contact data
- Configure privacy of their data
- View profiles of other participants (according to privacy)
- Receive personalized notifications
- View their scheduled and completed matches
- View public and private announcements
- Check personal statistics
- Configure notification preferences

### Unregistered User can

- View active and historical tournaments
- Check play brackets
- View results and rankings
- View public announcements
- View player profiles (according to privacy)
- View public statistics

## Annex: References and Standards

### Tennis Terminology

- **Official ITF Glossary**: https://en.wikipedia.org/wiki/Glossary_of_tennis_terms
- **Tennis Categories by Age**: https://www.forodeltenis.com/noticias-de-tenis-y-tenis-en-general/categorias-del-tenis-por-edades/msg615015/#msg615015

### Bracket Systems

- **Round Robin (All against all)**: https://es.wikipedia.org/wiki/Sistema_de_todos_contra_todos
- **Match Play UTR (example)**: https://app.utrsports.net/clubs/10476
- **Compass Brackets**: https://www.compassdraw.com/about.aspx
- **Double Elimination**: https://en.wikipedia.org/wiki/Double-elimination_tournament

### Data Standards

- **Tennis Open Data Standards (TODS)**: https://itftennis.atlassian.net/wiki/spaces/TODS/overview
- ITF format for results export (structured CSV)

### Tournament Regulation Examples

- **Match and Gos (regulation examples)**: http://matchandgos.c1.biz/torneos-anteriores/
- Satellite tournaments especially relevant to see variety of regulations

## Special Cases and Additional Considerations

### Results Conflict Management

- **Discrepancy between players**:
    - Optional results confirmation system
    - Possibility to dispute result entered by rival
    - Automatic notification to administrators upon dispute
    - Administrator decides: validate, modify, cancel (CAN) or replay match
    - New match generation if replay is decided
- **Erroneous Results**:
    - Administrator can always modify any result
    - Results change history (auditing)
    - Notifications to affected parties after modification

### Material Management (Balls)

- **Ball Responsibility Record**:
    - Specific field in each match
    - Useful in tournaments without official balls
    - Avoids conflicts about who should provide material
    - Tracking of responsibility compliance
- **In Match Play Tournaments**:
    - Rotation control: “last time I provided them, now it’s your turn”
    - Ball quality indication (new, acceptable, worn)
    - Management of complaints about inadequate material

### Match Suspension and Resumption

- **Suspension Causes**:
    - Weather conditions (rain, excessive wind)
    - End of court hours
    - Lack of light (outdoor installations without lighting)
    - Emergencies or incidents
- **Resumption Process**:
    - Automatic score saving upon suspension
    - Resumption on same day if conditions improve
    - Rescheduling for another day if necessary
    - Notification to players of new date/time
    - Continuation from exact point of suspension

### Consolation Brackets

- **Consolation Types**:
    - Simple: first-round eliminated play parallel bracket
    - Multiple: several levels according to elimination round
    - Compass: complex system with multiple interlaced brackets
- **Management**:
    - Separate finals: main final + consolation final(s)
    - Independent rankings per bracket
    - Possibility of differentiated prizes
    - No return to main bracket

### System Flexibility

- **Adaptation to Unforeseen Situations**:
    - Last-minute change in number of participants
    - Schedule modification due to external conditions
    - Adjustment of number of available courts
    - Tournament phase reconfiguration
- **Bracket Migration**:
    - Generation of new bracket from scratch
    - Import of results from previous bracket
    - Useful when there are major structural changes

## Priority Functional Requirements

### Phase 1 (MVP - Basic Functionality)

1. User and role system (administrator, participant, public)
2. Tournament registration and configuration
3. Participant registration
4. Basic knockout brackets
5. Manual results entry by administrator
6. Bracket and results display
7. Basic points-based rankings
8. Public announcements
9. Responsive interface

### Phase 2 (Advanced Functionality)

1. Round Robin brackets
2. Results entry by participants
3. Results confirmation system
4. Order of play generation
5. Email notifications
6. Private announcements for registered users
7. Court and schedule management
8. Basic player statistics
9. Privacy configuration

### Phase 3 (Complete Functionality)

1. Match Play brackets
2. Global player ranking
3. Telegram and web push notifications
4. Ratio-based rankings and complex systems
5. Multiple linked phases
6. Consolation brackets
7. Export in standard formats (ITF, TODS)
8. Advanced statistics
9. Complete visual customization
10. Management of multiple tournament administrators

### Phase 4 (Optimization and Extras)

1. PWA with offline functionality
2. Automatic backup system
3. Integration with external ranking systems
4. Automatic document generation (diplomas, minutes)
5. Payment system for registrations (optional)
6. Live chat between participants (optional)
7. Live results streaming (optional)
8. Native mobile app (optional)

## System Metrics and KPIs

### Usage Metrics

- Number of simultaneous active tournaments
- Number of registered participants
- Number of completed matches
- Adoption rate of results entry by players
- Average administrator response time
- Participant access frequency

### Quality Metrics

- Percentage of results with discrepancy
- Number of administrator modifications per tournament
- User satisfaction (optional surveys)
- Order of play generation time
- Accuracy of estimated match times

### Technical Metrics

- Page load time
- System availability (uptime)
- Error rate in critical operations
- Volume of notifications sent successfully
- Storage and bandwidth usage

## Technical Terms Glossary

- **Bye**: Automatic pass to next round without playing, by bracket design or rival absence
- **WO (Walkover)**: Victory by rival’s no-show to scheduled match
- **Lucky Loser (LL)**: Alternate who enters main bracket due to another player’s withdrawal
- **Wild Card (WC)**: Direct invitation from organizer without going through qualification
- **Seed**: Pre-ranked player strategically placed in bracket
- **Dead Rubber**: Match without relevance for final ranking
- **Supertiebreak**: 10-point tiebreak that replaces third set
- **Match Play**: Open competition format without fixed bracket structure
- **ELO**: Ranking system that weights rival’s ranking in points calculation
- **Ratio**: Mathematical proportion (won/lost) used for ranking
- **ITF**: International Tennis Federation
- **TODS**: Tennis Open Data Standards
- **PWA**: Progressive Web App (Progressive web application with offline functionality)