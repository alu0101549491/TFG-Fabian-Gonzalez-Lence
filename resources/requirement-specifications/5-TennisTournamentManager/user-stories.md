## US-01 — Role and User Management

**User Story:**
As a **system administrator**, I want to create, edit, and delete users and assign them specific roles to control permissions on the platform.
**Acceptance Criteria:**

- Users can be created with roles: system administrator, tournament administrator, registered participant, and public.
- Individual permissions can be modified per user.
- Users can be deleted from the system.
**Priority:** High

---

## US-02 — Tournament Creation and Configuration

**User Story:**
As a **tournament administrator**, I want to create tournaments with name, dates, categories, surfaces, courts, quotas, and regulations to organize the competition.
**Acceptance Criteria:**

- Tournaments can have multiple categories and brackets.
- Dates, courts, and quotas can be edited before registration opens.
- Specific rules can be set per tournament.
**Priority:** High

---

## US-03 — Participant Registration

**User Story:**
As a **registered participant**, I want to register for available tournaments to participate according to my category and level.
**Acceptance Criteria:**

- The participant enters name, DNI/NIE, category, ranking, and contact details.
- The system assigns entry status based on quota and classification.
- Participants and administrators are notified of status changes.
**Priority:** High

---

## US-04 — Quota and Substitute Management

**User Story:**
As a **tournament administrator**, I want the system to automatically manage maximum quotas and substitute lists to maintain tournament organization.
**Acceptance Criteria:**

- Excess registrations are placed on a waiting list.
- Reserved spots (WC, JE, OA, SE) are automatically assigned.
- Substitutes move to "Lucky Loser" status in case of withdrawals.
**Priority:** High

---

## US-05 — Participant Withdrawal System

**User Story:**
As a **registered participant**, I want to withdraw before or after the draw according to regulations to manage my participation.
**Acceptance Criteria:**

- Before the draw: immediate withdrawal, next substitute is accepted.
- After the draw: substitution by a substitute, status updated to WD.
- In eliminatory rounds: opponent automatically receives a WO.
**Priority:** Medium

---

## US-06 — Automatic Bracket Generation

**User Story:**
As a **tournament administrator**, I want to automatically generate brackets based on type (Eliminatory, Round Robin, Match Play) and ranking to organize matches.
**Acceptance Criteria:**

- Seeds and Byes can be set.
- Balanced distribution of participants in Round Robin groups.
- Option to modify the bracket after the draw while keeping existing results.
**Priority:** High

---

## US-07 — Flexible Bracket Modification

**User Story:**
As a **tournament administrator**, I want to modify started brackets, reassign matches, or generate a new bracket to adapt to last-minute withdrawals or changes.
**Acceptance Criteria:**

- Existing results can be migrated to the new bracket.
- Adjustment of dates and times based on court availability.
- Management of participant substitutions.
**Priority:** Medium

---

## US-08 — Participant Result Entry

**User Story:**
As a **registered participant**, I want to enter the results of my matches so that the classification updates automatically.
**Acceptance Criteria:**

- Results can be entered after a match ends.
- The opponent can confirm or dispute the result.
- Automatic notification to both players and administrators.
**Priority:** High

---

## US-09 — Administrator Result Entry and Modification

**User Story:**
As a **tournament administrator**, I want to enter, modify, and validate results of any match to ensure data integrity.
**Acceptance Criteria:**

- Changes are recorded in the history (audit).
- Option to cancel (CAN) or replay matches.
- Immediate update of classifications and statistics.
**Priority:** High

---

## US-10 — Publishing the Order of Play

**User Story:**
As a **tournament administrator**, I want to generate and publish the order of play considering court availability and schedules so that participants know when and where to play.
**Acceptance Criteria:**

- Publication at least one day before the match.
- Automatic notification to participants.
- Option to reschedule matches and reassign courts.
**Priority:** High

---

## US-11 — Dynamic Update of Order of Play

**User Story:**
As a **tournament administrator**, I want to update the order of play in real time in case of delays, suspensions, or incidents to maintain planning.
**Acceptance Criteria:**

- Changes are visible to all affected participants.
- Automatic notifications of modifications.
- Management of suspensions (SUS) and resumptions on the same day or later.
**Priority:** Medium

---

## US-12 — Bracket and Match Visualization

**User Story:**
As a **registered or public user**, I want to view brackets, phases, and matches of a tournament to follow the tournament progress.
**Acceptance Criteria:**

- Visualization by bracket type and phase.
- Participant data according to privacy settings.
- Access from any device (responsive).
**Priority:** High

---

## US-13 — Points-Based Classification

**User Story:**
As a **registered participant**, I want to see my classification based on points to know my position in the tournament.
**Acceptance Criteria:**

- Points are assigned according to tournament rules.
- Special results (WO, RET, BYE) are considered.
- Automatic update after result registration.
**Priority:** High

---

## US-14 — Ratio-Based Classification

**User Story:**
As a **registered participant**, I want to see classifications by ratios (sets/games won-lost) to evaluate my performance relative to my group.
**Acceptance Criteria:**

- Excludes matches with WO if applicable.
- Option for multiple tie-break criteria.
- Support for Round Robin and Match Play.
**Priority:** Medium

---

## US-15 — Global Player Ranking

**User Story:**
As a **system administrator**, I want to maintain an updated global ranking based on results from multiple tournaments to establish seeds and direct acceptances.
**Acceptance Criteria:**

- Calculation based on accumulated points or ELO system.
- Availability for direct acceptance (DA) in tournaments with limited quotas.
- Public and private visualization based on permissions.
**Priority:** Medium

---

## US-16 — Participant Notification System

**User Story:**
As a **registered participant**, I want to receive automatic notifications about matches, results, and announcements to stay informed.
**Acceptance Criteria:**

- Notifications via email, Telegram, web push, or app.
- Personal configuration of event types to notify.
- Visual indicators for pending alerts.
**Priority:** High

---

## US-17 — Administrator Notification System

**User Story:**
As a **tournament administrator**, I want to receive alerts about registrations, results, and disputes to properly manage the competition.
**Acceptance Criteria:**

- Immediate alerts for registrations, withdrawals, modifications, and disputes.
- Notification channel configuration.
- Accessible notification history from the administration panel.
**Priority:** High

---

## US-18 — Announcement Creation and Publication

**User Story:**
As a **tournament administrator**, I want to create public and private announcements to inform participants and the public about news.
**Acceptance Criteria:**

- Structured communication with title, summary, full text, dates, and tags.
- Scheduled or immediate publication.
- Automatic notification to recipients.
**Priority:** High

---

## US-19 — Announcement Tag Management

**User Story:**
As a **system administrator**, I want to define tags for announcements to categorize and filter tournament information.
**Acceptance Criteria:**

- Tag assignment to each announcement.
- Filtering and search by tag.
- Differentiation between public and private tags.
**Priority:** Medium

---

## US-20 — Individual Participant Statistics

**User Story:**
As a **registered participant**, I want to consult detailed statistics of my matches and performance to analyze my results.
**Acceptance Criteria:**

- Matches played, won, and lost.
- Sets and games won/lost.
- History of specific matchups.
**Priority:** Medium

---

## US-21 — Tournament Statistics

**User Story:**
As a **tournament administrator**, I want to see aggregated statistics of all participants and matches to evaluate tournament progress.
**Acceptance Criteria:**

- Total number of participants and matches.
- Distribution of results by sets.
- Rankings and classifications by category and phase.
**Priority:** Medium

---

## US-22 — Data Privacy Management

**User Story:**
As a **registered participant**, I want to configure the visibility of my contact details and avatar to protect my privacy.
**Acceptance Criteria:**

- Visibility options: only administrators, tournament participants, registered users, general public.
- Applicable to email, phone, Telegram, WhatsApp, avatar image, and ranking.
**Priority:** Medium

---

## US-23 — Public Access to Tournaments and Information

**User Story:**
As an **unregistered user**, I want to consult active and historical tournaments, brackets, and public results to follow the competition without registering.
**Acceptance Criteria:**

- Access to brackets, classifications, public announcements, and public statistics.
- No possibility to modify data or register.
**Priority:** High

---

## US-24 — Phase and Bracket Combination Visualization

**User Story:**
As a **registered participant or administrator**, I want to see how different phases and brackets are linked to understand the competition progress.
**Acceptance Criteria:**

- Brackets automatically linked according to tournament rules.
- Option for consolation brackets and additional phases.
- Visual update when registering results.
**Priority:** Medium

---

## US-25 — Match Suspension and Resumption Registration

**User Story:**
As a **tournament administrator**, I want to suspend and resume matches due to external causes to maintain tournament integrity.
**Acceptance Criteria:**

- Automatic saving of the score.
- Resumption on the same day or later.
- Automatic notification to participants.
**Priority:** Medium

---

## US-26 — Match Mode Support

**User Story:**
As a **tournament administrator**, I want to define match modes (sets, super tiebreak, duration) to adapt tournaments to different rules.
**Acceptance Criteria:**

- Selection of 2 sets + super tiebreak, 3 sets, sets to 4 or 6 games.
- Configuration by bracket or phase.
- Adjustment of classification calculation according to mode.
**Priority:** Medium

---

## US-27 — Material Responsible Registration

**User Story:**
As a **registered participant**, I want to indicate who provides the balls and equipment to maintain internal organization responsibility.
**Acceptance Criteria:**

- Mandatory field per match if applicable.
- Option for rotation in Match Play tournaments.
- Notification of incidents to administrators.
**Priority:** Low

---

## US-28 — Result Export

**User Story:**
As an **administrator**, I want to export results and classifications in standard formats (ITF, TODS) to integrate them into external systems.
**Acceptance Criteria:**

- Support for CSV ITF and TODS formats.
- Option to export complete statistics.
- Immediate and historical tournament export.
**Priority:** Medium

---

## US-29 — Multiple Tournament Administrator Roles Management

**User Story:**
As a **system administrator**, I want to assign multiple administrators to the same tournament to distribute management responsibilities.
**Acceptance Criteria:**

- Each administrator has full permissions over their assigned tournament.
- Activity log and notifications for all.
**Priority:** Medium

---

## US-30 — Responsive Web Interface and PWA

**User Story:**
As a **participant or public user**, I want to access the platform from any device and with basic offline functionality to consult information even without constant connection.
**Acceptance Criteria:**

- Compatible with desktop, mobile, and tablet.
- Data caching for offline consultation.
- Interface adapted to screen sizes and intuitive navigation.
**Priority:** High

---

## US-31 — Visual Configuration and Customization

**User Story:**
As an **administrator**, I want to customize colors, logos, and menus per tournament or globally to maintain corporate identity.
**Acceptance Criteria:**

- Editable configuration from the administration panel.
- Applicable to individual tournaments or globally.
- Changes visible immediately in the interface.
**Priority:** Low

---

## US-32 — Court and Schedule Availability Management

**User Story:**
As a **tournament administrator**, I want to assign available courts and schedules to plan the order of play.
**Acceptance Criteria:**

- Registration of number of courts, names, and time slots.
- Consideration of surfaces and capacity per slot.
- Automatic update in case of changes.
**Priority:** High

---

## US-33 — Order of Play Change Notifications

**User Story:**
As a **registered participant**, I want to receive alerts if my match changes court or schedule to stay informed.
**Acceptance Criteria:**

- Real-time updates.
- Notification via chosen channel (email, Telegram, web push).
- Clear information about new schedule and court.
**Priority:** High

---

## US-34 — Specific Tournament Regulation Configuration

**User Story:**
As a **tournament administrator**, I want to establish particular rules for play, classification, and tie-breaks for each tournament.
**Acceptance Criteria:**

- Editable free text.
- Applicable to individual phases and brackets.
- Automatic consideration in classification calculation.
**Priority:** Medium

---

## US-35 — Multiple Tournament Phase Management

**User Story:**
As a **tournament administrator**, I want to link sequential tournament phases, including Round Robin, Eliminatory, and Match Play, to organize player progression.
**Acceptance Criteria:**

- Automatic or manual links between phases.
- Classification and results transferred to subsequent phases.
- Support for consolation brackets.
**Priority:** High

---

## US-36 — Tie-Break Criteria Configuration

**User Story:**
As an **administrator**, I want to define tie-break criteria for classification ties to maintain a fair player order.
**Acceptance Criteria:**

- First level: ratio of sets won/lost.
- Second level: ratio of games.
- Third level: direct confrontation or random draw if applicable.
- Configurable per tournament.
**Priority:** Medium

---

## US-37 — Participant Result History

**User Story:**
As a **registered participant**, I want to consult my history of results against other players to analyze performance and strategies.
**Acceptance Criteria:**

- Visualization by tournament and category.
- Filters by player or period.
- Automatic update after result registration.
**Priority:** Medium

---

## US-38 — Match Incident Control

**User Story:**
As a **tournament administrator**, I want to manage result disputes, abandoned matches, or withdrawals to maintain tournament integrity.
**Acceptance Criteria:**

- Optional result confirmation system.
- Option to cancel or replay matches.
- Record of decisions and notifications to affected parties.
**Priority:** High

---

## US-39 — External Ranking System Integration

**User Story:**
As a **system administrator**, I want to import or sync external rankings to define seeds and automatic acceptances.
**Acceptance Criteria:**

- Integration with API or standard format.
- Periodic update of global ranking.
- Record of changes and conflicts.
**Priority:** Low

---

## US-40 — Automatic Document Generation

**User Story:**
As an **administrator**, I want to automatically generate diplomas, minutes, and certifications to streamline tournament documentation.
**Acceptance Criteria:**

- Customizable templates per tournament.
- Export in PDF and common formats.
- Inclusion of results, classifications, and awards.
**Priority:** Low

---

## US-41 — Payment System for Registrations

**User Story:**
As a **registered participant**, I want to pay my registration online to formalize my participation easily.
**Acceptance Criteria:**

- Secure integration with payment gateways.
- Automatic registration of payment and status update.
- Confirmation notification to participant and administrator.
**Priority:** Low

---

## US-42 — Internal Chat Between Participants

**User Story:**
As a **registered participant**, I want to communicate with other players within the platform to coordinate matches or socialize.
**Acceptance Criteria:**

- Private or group chat per tournament or phase.
- New message notifications.
- Option for administrator moderation.
**Priority:** Low

---

## US-43 — Live Result Broadcasting

**User Story:**
As a **participant or public user**, I want to follow results in real time to stay updated without waiting for the match to end.
**Acceptance Criteria:**

- Automatic update of ongoing matches.
- Accessible visualization from any device.
- Option to filter by tournament, phase, or player.
**Priority:** Medium

---

## US-44 — Native Mobile App

**User Story:**
As a **participant**, I want to access the platform via a mobile app to consult information and receive notifications directly.
**Acceptance Criteria:**

- Available for iOS and Android.
- Sync with PWA/web.
- Integrated push notifications.
**Priority:** Medium

---

## US-45 — Sanction Management

**User Story:**
As an **administrator**, I want to sanction players for absences or rule violations to maintain discipline in the tournament.
**Acceptance Criteria:**

- Record of sanctions and type (warning, point loss, exclusion).
- Notification to the sanctioned player.
- Automatic impact on classification if applicable.
**Priority:** Medium

---

## US-46 — Export of Aggregated Statistical Data

**User Story:**
As an **administrator**, I want to export aggregated statistics per tournament for external analysis and future improvements.
**Acceptance Criteria:**

- Formats: CSV, XLSX, and JSON.
- Option to filter by category, phase, or period.
- Exportable history of past tournaments.
**Priority:** Medium

---

## US-47 — Automatic Backups

**User Story:**
As a **system administrator**, I want data to be backed up automatically to prevent information loss.
**Acceptance Criteria:**

- Daily and on-demand backups.
- Full or partial restoration.
- Audit log of restorations.
**Priority:** High

---

## US-48 — Security and Access Control

**User Story:**
As a **system administrator**, I want to ensure that each user only accesses allowed functions to protect information and prevent errors.
**Acceptance Criteria:**

- Strict roles and permissions applied to all functions.
- Access and modification log.
- Alerts for unauthorized access.
**Priority:** High

---

## US-49 — System Scalability

**User Story:**
As a **system administrator**, I want the platform to support multiple simultaneous tournaments and a large number of users to ensure availability.
**Acceptance Criteria:**

- Stable performance with 1,000+ simultaneous participants.
- Capacity to replicate historical tournaments.
- Load monitoring and performance alerts.
**Priority:** Medium

---

## US-50 — Bracket and Result Export and Printing

**User Story:**
As an **administrator or public user**, I want to export and print brackets and tournament results for offline use or physical presentations.
**Acceptance Criteria:**

- Export to PDF with clear layout.
- Selection of phases, categories, and players.
- Printing respecting the visual format of the bracket.
**Priority:** Medium

---

### **Summary Table**

User Stories Summary

| US | Title | Priority |
| --- | --- | --- |
| US-01 | Role and User Management | High |
| US-02 | Tournament Creation and Configuration | High |
| US-03 | Participant Registration | High |
| US-04 | Quota and Substitute Management | High |
| US-05 | Participant Withdrawal System | Medium |
| US-06 | Automatic Bracket Generation | High |
| US-07 | Flexible Bracket Modification | Medium |
| US-08 | Participant Result Entry | High |
| US-09 | Administrator Result Entry and Modification | High |
| US-10 | Publishing the Order of Play | High |
| US-11 | Dynamic Update of Order of Play | Medium |
| US-12 | Bracket and Match Visualization | High |
| US-13 | Points-Based Classification | High |
| US-14 | Ratio-Based Classification | Medium |
| US-15 | Global Player Ranking | Medium |
| US-16 | Participant Notification System | High |
| US-17 | Administrator Notification System | High |
| US-18 | Announcement Creation and Publication | High |
| US-19 | Announcement Tag Management | Medium |
| US-20 | Individual Participant Statistics | Medium |
| US-21 | Tournament Statistics | Medium |
| US-22 | Data Privacy Management | Medium |
| US-23 | Public Access to Tournaments and Information | High |
| US-24 | Phase and Bracket Combination Visualization | Medium |
| US-25 | Match Suspension and Resumption Registration | Medium |
| US-26 | Match Mode Support | Medium |
| US-27 | Material Responsible Registration | Low |
| US-28 | Result Export | Medium |
| US-29 | Multiple Tournament Administrator Roles Management | Medium |
| US-30 | Responsive Web Interface and PWA | High |
| US-31 | Visual Configuration and Customization | Low |
| US-32 | Court and Schedule Availability Management | High |
| US-33 | Order of Play Change Notifications | High |
| US-34 | Specific Tournament Regulation Configuration | Medium |
| US-35 | Multiple Tournament Phase Management | High |
| US-36 | Tie-Break Criteria Configuration | Medium |
| US-37 | Participant Result History | Medium |
| US-38 | Match Incident Control | High |
| US-39 | External Ranking System Integration | Low |
| US-40 | Automatic Document Generation | Low |
| US-41 | Payment System for Registrations | Low |
| US-42 | Internal Chat Between Participants | Low |
| US-43 | Live Result Broadcasting | Medium |
| US-44 | Native Mobile App | Medium |
| US-45 | Sanction Management | Medium |
| US-46 | Export of Aggregated Statistical Data | Medium |
| US-47 | Automatic Backups | High |
| US-48 | Security and Access Control | High |
| US-49 | System Scalability | Medium |
| US-50 | Bracket and Result Export and Printing | Medium |