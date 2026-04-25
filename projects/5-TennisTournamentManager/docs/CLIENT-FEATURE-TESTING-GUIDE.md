# Client Feature Testing Guide — Tennis Tournament Manager

**Date:** April 25, 2026  
**Purpose:** Step-by-step test checklist for all features implemented since the initial feedback.  
**How to use:** Go through each item in order. Each test is self-contained and takes 1–3 minutes.

> **Prerequisites:** Backend and frontend running locally. At least one tournament created with participants and matches.

---

## 1. Live Color Preview in Tournament Form

Colors now update the preview in real time while you type or pick.

1. Go to **Tournaments → Create Tournament**.
2. Fill in a name and dates, then scroll to **Visual Branding**.
3. Change the **Primary Colour** using the colour picker or type a hex code (e.g. `#e63946`).
4. ✅ The gradient preview below updates immediately — no need to save first.
5. Change the **Secondary Colour** and verify the preview updates again.

---

## 2. Match Status Tooltips

Each status code now has a plain-English explanation on hover.

1. Open any tournament and navigate to a **Match**.
2. Find the **Status** dropdown — notice the label reads *"(hover over options to learn more)"*.
3. Open the dropdown and hover over any status (e.g. `WALKOVER`, `RETIRED`, `BYE`).
4. ✅ A tooltip appears describing what that status means.

---

## 3. Ball Provider Clarification Text

The ball provider field now makes it clear it applies to this match only, not the whole tournament.

1. Open any match detail page.
2. Find the **Ball Provider** field.
3. ✅ A line of help text below reads *"Select who provides balls for THIS match"*.

---

## 4. Player Comments on Result Submission

Participants can now leave an optional comment when submitting a match result.

1. Log in as a **player**.
2. Go to **My Matches** and find a scheduled match.
3. Click **Enter Result**, fill in the score.
4. ✅ A **Comments (Optional)** textarea appears below the scores (max 500 characters).
5. Type a comment and submit — verify it saves without errors.

---

## 5. "My Matches" Navigation Link

Players can now reach their matches directly from the header.

1. Log in as a **player** (PLAYER role).
2. ✅ The header shows **🎾 My Matches** next to the Tournaments link.
3. Click it — verify it navigates to the My Matches page.
4. Log out and log in as an **admin** — ✅ the link is **not visible** for admins.

---

## 6. "Tournaments" Navigation Link

All logged-in users now have a direct link to the tournament list.

1. Log in with any account.
2. ✅ The header shows **🏆 Tournaments** as the first navigation item on the left.
3. Click it — verify it loads the full tournament list.

---

## 7. "Statistics" Navigation Link

The statistics page is now reachable from the main navigation.

1. Log in with any account.
2. ✅ The header shows **📊 Statistics** in the navigation bar.
3. Click it — verify the statistics page loads with ranking and match data.

---

## 8. View Profile Links in Participant Lists

Clicking a participant's name anywhere in the app opens their profile.

1. Open any tournament and scroll to the **Registered Players** section.
2. ✅ Each player's name shows a 👤 icon and is clickable.
3. Click a name — verify their public profile opens.
4. Go to the **Bracket** view for the same tournament.
5. ✅ Participant names in the bracket are also clickable — verify profiles open.
6. Go to **My Matches** as a player — ✅ your opponent's name is clickable.

---

## 9. Export Button in Tournament Detail

The export functionality is accessible from the tournament detail page.

1. Open any tournament as an **admin**.
2. Scroll to the **Quick Actions** section.
3. ✅ An **📄 Export** button is present.
4. Click it — a dropdown shows: ITF CSV, TODS JSON, PDF Report, Excel Spreadsheet.
5. Click any format and verify the file downloads.

---

## 10. Notification Badge for Pending Confirmations

The notification bell shows an unread count badge when confirmations are pending.

1. As **Player A**, submit a match result via **My Matches → Enter Result**.
2. Log in as **Player B** (the opponent).
3. ✅ The notification bell in the top-right shows a red badge with a number.
4. Click the bell — verify a notification about the pending result is listed.

---

## 11. Enhanced Participant List with Status Filtering

The registered participants table now shows coloured status badges and can be filtered.

1. Open any tournament with multiple participants in different states.
2. Scroll to **Registered Participants** (admin view).
3. ✅ A **Filter** dropdown appears with options: All, Pending, Accepted, Rejected…
4. Select **Pending** — only pending participants are shown, others are hidden.
5. ✅ Status badges are colour-coded (green = accepted, yellow = pending, red = rejected).
6. ✅ Acceptance type badges such as `[WC]`, `[SE]`, `[LL]` appear for applicable players.

---

## 12. Seeds and Entry Status in Bracket Display

The bracket now shows seed numbers and acceptance type badges next to each player.

1. Open a tournament and click **View Bracket**.
2. Find a seeded participant in the draw.
3. ✅ Their seed number appears next to their name (e.g. `[1]`).
4. ✅ Wild card or special entry players show a badge (e.g. `[WC]`, `[LL]`) in the bracket slot.

---

## 13. Dashboard Counters Show Real Data

The admin dashboard now displays accurate live counts.

1. Log in as a **system admin** and go to the **Dashboard**.
2. ✅ The stat cards show real numbers: Active Tournaments, Disputed Matches, Total Users, Tournaments Managed.
3. Create a new tournament, then return to the Dashboard.
4. ✅ The Active Tournaments and Tournaments Managed counters have increased.
5. Log in as a **tournament admin** — ✅ the "Total Users" card is **not shown** (permission restriction).

---

## 14. Tournament Logo Displayed on Subpages

Logos uploaded for a tournament now appear on all tournament subpages.

1. Open a tournament that has a logo uploaded.
2. Navigate to the **Bracket** page, **Matches**, **Phases**, **Standings**, **Announcements**, and **Statistics** pages.
3. ✅ The tournament logo appears at the top of each subpage.
4. Navigate to the global **Statistics** page (outside any tournament context).
5. ✅ No tournament logo appears there.

---

## 15. Match Format Badge in Bracket View

The match format (e.g. "Best of 3", "Pro Set") is now visible in the bracket.

1. Generate a bracket, selecting a format other than the default during generation (see Feature 30).
2. Open the bracket view.
3. ✅ A format badge (e.g. "Pro Set", "Best of 5") is displayed on each match card.

---

## 16. Compare Stats / View Statistics Button in User Profiles

A direct link from any player's profile to their full statistics page.

1. Open another player's profile (via a participant list or bracket link).
2. ✅ A **📊 View Statistics** button is visible in the hero section at the top.
3. Click it — verify it navigates to that player's statistics page.
4. Open **your own profile** — ✅ the button is **not shown** (shows Edit Profile instead).

---

## 17. Consolidated Participant Edit Modal

All participant fields (seed, status, acceptance type, category) are now edited in a single modal.

1. Open a tournament as an **admin** and scroll to **Registered Participants**.
2. Click the **✏️ Edit** button on any participant row.
3. ✅ A single modal opens with all fields: seed number, registration status, acceptance type, and category.
4. Change the seed and acceptance type, click Save.
5. ✅ The changes are reflected in the table immediately.

---

## 18. Validation: SCHEDULED Status Requires a Time

A match cannot be set to SCHEDULED without an assigned scheduled time.

1. Open a match that has **no scheduled time** set.
2. In the Status dropdown, select **SCHEDULED** and try to save.
3. ✅ An error message appears: *"Please set a scheduled time before marking as Scheduled."*
4. Set a date/time in the scheduled time field, then try again — ✅ it saves successfully.

---

## 19. Winner Selection for WO / RET / DEF Statuses

Setting Walkover, Retired, or Default now requires specifying which player won.

1. Open any in-progress or scheduled match.
2. Select status **WALKOVER** (or RETIRED / DEFAULT) from the dropdown.
3. ✅ A **Winner** dropdown appears immediately below.
4. Select the winning player and save.
5. ✅ The match saves with the correct winner recorded.

---

## 20. Auto-Creation of Default Category

If a tournament has no categories, a default one is created automatically.

1. Create a **new tournament** without adding any categories.
2. Open the tournament detail page as an admin.
3. ✅ A category named **"Open (Default Category)"** has been created automatically.
4. You can now add external participants without needing to manually create a category first.

---

## 21. Full Acceptance Status Dropdown

Participant acceptance type can now be changed to any of the 9 official values, not just Accepted/Rejected.

1. Open a tournament and click **✏️ Edit** on any accepted participant.
2. Find the **Acceptance Type** dropdown in the modal.
3. ✅ All options are available: Direct Acceptance, Wild Card, Seeded, Qualifier, Lucky Loser, Alternate, Withdrawn, Special Exempt, and Organiser's Acceptance.
4. Change to **Wild Card** and save — ✅ the `[WC]` badge appears in the participant list.

---

## 22. Image Upload in Announcements

Announcements can now include an image.

1. Open a tournament and go to **Announcements**.
2. Click **Create Announcement**.
3. ✅ An **Image** file upload field is present (accepts image files).
4. Upload an image — ✅ a preview appears in the form.
5. Save the announcement and open it — ✅ the image is displayed full-width in the detail view.

---

## 23. External Links in Announcements

Announcements can now include a clickable external link button.

1. Create or edit an announcement.
2. ✅ Two new fields are present: **External Link (URL)** and **Link Button Text**.
3. Enter a URL (e.g. `https://example.com`) and a label (e.g. "Official Draw PDF").
4. Save and open the announcement — ✅ a button labeled "Official Draw PDF" appears, opening the URL in a new tab.

---

## 24. BYE Matches Cannot Be Scheduled

The system now blocks attempts to schedule a match where one participant is a BYE.

1. Find a match in the bracket where one slot is a **BYE** (automatic advance).
2. Try to set it to SCHEDULED status or click Schedule.
3. ✅ An error appears: *"Cannot schedule BYE matches. BYE matches are automatic passes."*

---

## 25. BYE vs TBD Visual Distinction in Bracket

The bracket now clearly differentiates automatic BYEs from unknown (TBD) participants.

1. Open any bracket that contains BYE slots.
2. ✅ BYE entries show as **✅ BYE** with a green colour — these are automatic advances.
3. ✅ Unresolved slots (awaiting prior results) show as **❓ TBD** with a grey colour.

---

## 26. Tournament State Action Gating

Actions that would contradict the current tournament state are now blocked.

1. Open a tournament with status **IN_PROGRESS** or **FINALIZED**.
2. Try to click **Edit Tournament** (basic details).
3. ✅ If the state does not allow editing, an error message is shown and you are redirected.
4. Open a tournament in **DRAFT** state — ✅ editing is allowed normally.

---

## 27. Match Status Transition Filtering

The status dropdown only shows statuses that are valid transitions from the current state.

1. Open a match currently in **SCHEDULED** status.
2. Open the Status dropdown.
3. ✅ Only valid next statuses are listed (e.g. IN_PROGRESS, WALKOVER, CANCELLED) — not all 13 statuses.
4. Open a **COMPLETED** match — ✅ very few or no further transitions are offered.

---

## 28. Court Management Interface

Courts can now be added, edited, and deleted through the UI.

1. Open a tournament as an **admin**.
2. Find the **Manage Courts** button or link in the tournament actions.
3. ✅ A dedicated court management page opens.
4. Click **Add Court** — fill in the court name and surface type, then save.
5. ✅ The new court appears in the list and is available in match scheduling.
6. Click **Edit** on a court, rename it, and save — ✅ name updates in the list.
7. Click **Delete** on a court — ✅ it is removed.

---

## 29. Match Format Selection in Bracket Generation

The bracket generation form now lets you choose the match format for all matches in the draw.

1. Open a tournament as an **admin** and go to **Bracket Generation**.
2. ✅ A **Match Format** dropdown is present with options: Best of 3 (Final Set Tiebreak), Best of 3 (Advantage), Best of 5, Pro Set, Fast4, Super Tiebreak, etc.
3. Select **Pro Set** and generate the bracket.
4. Open the bracket — ✅ all match cards show the "Pro Set" format badge.

---

## 30. Super Tiebreak Score Entry

Score entry now supports super tiebreaks (10-point tiebreak as a deciding set).

1. Open a match with format **Super Tiebreak** (or BEST_OF_3 where sets are tied).
2. In the result entry form (My Matches → Enter Result):
   - For **Super Tiebreak** format: ✅ a single tiebreak input replaces the full set grid.
   - For **Best of 3** format: ✅ if a set score is 7-6, a tiebreak sub-row appears for that set.
3. Enter a tiebreak score (e.g. `10-8`) and submit — ✅ the result saves correctly.

---

## 31. Improved PDF Export

The exported tournament PDF now has a professional layout with colours and a page header.

1. Open a tournament and click **Export → PDF Report**.
2. Open the downloaded PDF.
3. ✅ A dark green header banner with a teal diagonal stripe appears on page 1.
4. ✅ Page 2 and beyond have a compact header band repeating the tournament name.
5. ✅ A **Category Breakdown** table is present showing participant counts per category.

---

## 32. Advanced Bracket Configuration Options

Bracket generation now exposes additional options for seeding, consolation draws, and group sizes.

1. Open a tournament as an admin and go to **Bracket Generation**.
2. ✅ An **Advanced Options** collapsible section is present — click to expand.
3. For **Single Elimination**: options for **Consolation Type** (None, Consolation, Double Elimination) and **Bye Assignment** (Top Seeds, Random) appear.
4. For **Round Robin**: a **Group Size** input appears (e.g. enter `3` for groups of 3).
5. Choose options and generate — ✅ the bracket is created with the selected configuration.

---

## 33. Global Ranking Recalculation

System admins can now trigger a ranking recalculation from the Rankings page.

1. Log in as a **system admin**.
2. Navigate to **Statistics → Rankings** (or the global ranking view).
3. ✅ A **🔄 Recalculate Rankings** button is visible (only for admins).
4. Click it — ✅ a success message appears confirming recalculation.
5. Reload the page — ✅ player positions reflect the updated ranking order.

---

## 34. Phases Overview Tab

A visual overview of all phases in a tournament is now accessible from the Phase Management page.

1. Open a tournament as an **admin** and navigate to **Phases** (or Phase Management).
2. ✅ The default tab is **Phases Overview**, showing all phases as cards.
3. If no phases exist, an empty state with a call-to-action button is shown.
4. If phases exist, they are displayed with their bracket type, draw type, and match count.

---

## 35. Create New Phase via UI

Phases no longer need to be created via the API — there is now a form in the UI.

1. On the Phase Management page, click **+ Create New Phase**.
2. ✅ A modal opens with fields: Phase Name, Bracket Type (Single Elimination / Round Robin / Match Play), Draw Type (Main Draw, Qualifying, Consolation), and number of qualifiers.
3. Fill in the fields and click Save.
4. ✅ The new phase appears in the Phases Overview and in the phase list.

---

## 36. Link Phases Interface

Phases can be linked to define qualification flow (e.g. Qualifying → Main Draw) from the UI.

1. On the Phase Management page, look for the **Link Phases** section or tab.
2. Select a **source phase** (e.g. Qualifying Round) and a **target phase** (e.g. Main Draw).
3. Click **Link**.
4. ✅ The relationship is saved and appears in the Phase Overview diagram with an arrow.

---

## 37. Advance Qualifiers Button

Top finishers from one phase can be moved to the next phase directly from the UI.

1. Complete all matches in a qualifying phase (or at least the final round).
2. On the Phase Management page, find the **Advance Qualifiers** button for that phase.
3. Specify the number of qualifiers to advance.
4. ✅ The top finishers are moved to the linked main draw phase.

---

## 38. Visual Phase Flow Diagram

A graphical diagram shows how phases are connected in sequence.

1. Open the **Phases Overview** tab in Phase Management.
2. ✅ A flow diagram is displayed with boxes for each phase and arrows indicating qualification direction (e.g. Qualifying → Round of 16 → Quarterfinals → Semifinals → Final).
3. Consolation phases appear on the side with arrows from the main draw.

---

## 39. Promote Lucky Loser Interface

A first-round loser can be promoted to replace a withdrawn participant, directly from the UI.

1. Open the Phase Management page for a tournament where a participant has withdrawn.
2. Find the **Promote Lucky Loser** action.
3. Select the player to promote from the first-round losers list.
4. ✅ The player's status is updated to **Lucky Loser (LL)** and they are placed in the draw.

---

*Guide generated: April 25, 2026 — covers all 39 features completed across Phases 1–7 of the implementation plan.*
