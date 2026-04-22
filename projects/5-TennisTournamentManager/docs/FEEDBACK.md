# General Impression

Clean interface with many options, although somewhat confusing in its navigation. Tournament setup, draws, and order of play are well handled, although draw configuration options are somewhat limited. There is confusion regarding match statuses, tournament phases, and dates. Match visualization is somewhat poor. Overall, it is a good foundation, but upon closer inspection it becomes clear that it needs refinement, and there are significant inconsistencies that make it difficult to use in its current state.

## Covered ([X]), partially covered ([-]), unknown ([?]) and not covered ([ ]) requirements:

* [x] Ability to manage multiple tennis tournaments simultaneously

## Covers all tournament phases, including:

* [x] Tournament creation and configuration
* [x] Participant registration and enrollment
* [x] Draw design
* [x] Order of play scheduling
* [x] Result entry
* [x] Ranking calculation and publication
* [x] Publication of announcements
* [x] Sending notifications for new results and announcements
* [x] Tournament statistics

### Application features:

* [x] Responsive web application, accessible from desktop and mobile devices
* [x] Customizable color scheme, logos, and menus
* [x] Web interface for managing tournaments, participants, and announcements
* [ ] Notifications to participants via email, Telegram, or web push
* [ ] Notifications to administrators for new results, participant registrations or updates, and new enrollments

## Tournament features:

* [-] Each tournament can contain multiple draws
* [-] Different types of draws: Round Robin, Knockout, Match Play
* [-] List of participating players, including their entry status in the tournament
* [x] Draw generator and seeding
* [x] Order of play generator
* [x] Ranking generator: based on points or ratios
* [x] Ability to define specific rules for each draw

## Participants can register as system users, allowing them to:

* [x] Register for tournaments
* [?] Enter their own results immediately
* [x] Configure user profile and provide contact details
* [ ] View other registered participants’ profiles and contact details
* [?] Receive notifications about new results and announcements
* [?] View personalized information about their upcoming and completed matches
* [?] View non-public announcements restricted to registered users
* [?] Receive personalized indicators of unseen results and alerts
* [?] Receive personalized statistics of their results against other participants

## Match features:

* [ ] Different match formats: 2 sets + super tiebreak, 3 sets, sets to 4 or 6 games
* [?] Includes court or playing field assignment
* [ ] Includes player comments on the match
* [-] Supports unfinished matches: retirement, withdrawal, walkover (WO), bye, etc.
* [ ] Ability to indicate who provided the balls for the match
* [ ] Ability to export results

## Announcement features:

* [x] Public announcements and those restricted to registered users
* [x] Publication and expiration dates
* [x] Includes summary and full text
* [x] Includes tagging of announcements
* [ ] Ability to include an image and a link in the announcement

## Some anomalies or detected issues:

* Colour Previews does not seem to work
* Issues when adding external participants if no categories are created
* Unclear visualization of registered participants
* Not possible to change participant status to anything other than accepted or rejected
* Multiple windows make modifying registered participant details confusing
* Poor match visualization: missing seeds, acceptance status
* Poor PDF generation of rounds: missing titles, logo, and better match display
* Limited and poorly configurable draw types
* Confusing that ball provider can change per match
* Confusing navigation: back buttons do not return to previous steps, and sometimes are missing
* Confusion between BYE and TBD participants; allows scheduling BYE matches
* Cannot find how to add courts
* Confusion between statuses: Scheduled without assigned time, WO and RET without specifying player, Bye status unclear
* Allows actions that contradict the tournament state
* Cannot handle different scoring formats beyond adding sets
* Initial counters do not seem to update properly
* Logos are not displayed on subpages