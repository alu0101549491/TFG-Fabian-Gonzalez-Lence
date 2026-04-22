# Tennis Tournament Manager - Copilot TODO List

**Document Version:** 1.0  
**Date:** April 22, 2026  
**Source:** Client Feedback Implementation Plan  
**Organization:** Small → Medium → Large tasks by estimated effort

---

## Phase 1: Quick Fixes (1-2 hours each) ⚡

### Priority: CRITICAL - Do First

- [x] **Fix color preview in tournament form** ✅ COMPLETED (2026-04-22)
  - **Issue:** Color picker doesn't update live preview
  - **Files:** `TournamentCreateComponent`, `TournamentEditComponent`
  - **Fix:** ✅ Added `(ngModelChange)` and `(input)` event handlers with `updateColorPreview()` method
  - **Estimated:** 2 hours
  - **Test:** Create tournament, change colors, verify preview updates immediately

- [x] **Add tooltips for match statuses** ✅ COMPLETED (2026-04-22)
  - **Issue:** Users confused about RET, WO, BYE, TBD meanings
  - **Files:** Match detail component, status dropdowns
  - **Fix:** ✅ Added `getStatusTooltip()` method with 13 detailed descriptions + label hint "(hover over options to learn more)"
  - **Estimated:** 1 hour
  - **Test:** Hover over each status, verify tooltip shows explanation

- [x] **Fix ball provider clarification text** ✅ COMPLETED (2026-04-22)
  - **Issue:** Confusing that ball provider can change per match
  - **Files:** Match form component
  - **Fix:** ✅ Added help text: "Select who provides balls for THIS match"
  - **Estimated:** 0.5 hours
  - **Test:** Verify help text visible in match detail form

- [x] **Add player comments field to result submission** ✅ COMPLETED (2026-04-22)
  - **Issue:** FR32 - Optional player comments not implemented
  - **Files:** Result entry modal (`MyMatchesComponent`)
  - **Fix:** ✅ Added textarea with max 500 chars, placeholder examples, help text
  - **Estimated:** 2 hours
  - **Test:** Submit result with comment, verify saved and displayed

---

## Phase 2: Navigation & Discoverability (2-3 hours each) 🧭

### Priority: HIGH - Improves UX

- [ ] **Fix back button behavior across all forms**
  - **Issue:** Back buttons don't return to previous steps, sometimes missing
  - **Files:** All form components (tournament, bracket, registration, etc.)
  - **Fix:** Standardize using `Location.back()` or explicit routes
  - **Estimated:** 3 hours
  - **Test:** Navigate through multi-step forms, verify back button works correctly

- [x] **Add "My Matches" to main navigation** ✅ COMPLETED (2026-04-22)
  - **Issue:** Hard to find participant match interface
  - **Files:** `header.component.ts`
  - **Fix:** ✅ Added "🎾 My Matches" nav link, visible only to PLAYER/COACH roles
  - **Estimated:** 1 hour
  - **Test:** Log in as participant, verify "My Matches" link visible and works

- [ ] **Add notification badge for pending confirmations**
  - **Issue:** No visual indicator for pending match confirmations
  - **Files:** Notification icon component, `MyMatchesComponent`
  - **Fix:** Count pending confirmations, show badge on notification bell
  - **Estimated:** 2 hours
  - **Test:** Have pending confirmation, verify badge shows count

- [ ] **Add "View Profile" links in participant lists**
  - **Issue:** Can't access other participants' profiles easily
  - **Files:** `ParticipantListComponent`, bracket visualization
  - **Fix:** Add profile icon/link next to each participant name
  - **Estimated:** 2 hours
  - **Test:** Click participant name, verify profile opens with privacy enforced

- [x] **Add "Export" button in tournament detail view** ✅ ALREADY IMPLEMENTED
  - **Issue:** Export functionality exists but might not be discoverable
  - **Status:** ✅ Export dropdown already exists in tournament detail "Quick Actions" section
  - **Location:** `tournament-detail-new.component.html` (lines 187-226)
  - **Formats:** ITF CSV, TODS JSON, PDF Report, Excel Spreadsheet
  - **Test:** Navigate to tournament detail, verify Export button in Quick Actions

- [x] **Add "Statistics" link to main navigation** ✅ COMPLETED (2026-04-22)
  - **Issue:** Statistics page hard to discover
  - **Files:** `header.component.ts`
  - **Fix:** ✅ Added "📊 Statistics" nav link visible to all logged-in users
  - **Estimated:** 1 hour
  - **Test:** Navigate to statistics, verify page loads with data

- [x] **Add "Tournaments" link to main navigation** ✅ COMPLETED (2026-04-22)
  - **Issue:** No central navigation to tournament list
  - **Files:** `header.component.ts`
  - **Fix:** ✅ Added "🏆 Tournaments" nav link for all authenticated users
  - **Test:** Click link, verify tournament list loads

---

## Phase 3: Data Visualization (3-4 hours each) 📊

### Priority: HIGH - Shows existing data better

- [ ] **Improve participant list visualization**
  - **Issue:** Unclear registration status visualization
  - **Files:** `ParticipantListComponent`
  - **Fix:** Add status badges (colors), filter dropdown by status, sort options
  - **Estimated:** 3 hours
  - **Test:** View participant list, verify status badges clear and filterable

- [ ] **Add seed numbers and entry status to bracket display**
  - **Issue:** Missing seeds and acceptance status in brackets
  - **Files:** `BracketVisualizationComponent`
  - **Fix:** Show "(1)" for seed, "[WC]" badge for wild cards, etc.
  - **Estimated:** 3 hours
  - **Test:** View bracket, verify seeds and entry status visible

- [ ] **Fix dashboard counter updates**
  - **Issue:** Initial counters don't update properly
  - **Files:** `DashboardComponent`, statistics service
  - **Fix:** Add WebSocket listener or refresh on navigation
  - **Estimated:** 2 hours
  - **Test:** Update tournament data, verify dashboard counters refresh

- [ ] **Fix tournament logo display on subpages**
  - **Issue:** Logos not displayed on subpages
  - **Files:** App layout component, route resolvers
  - **Fix:** Ensure tournament logo propagates via state service
  - **Estimated:** 2 hours
  - **Test:** Navigate to tournament subpages, verify logo shows in header

- [ ] **Add match format display in bracket view**
  - **Issue:** Match format not visible to participants
  - **Files:** Bracket detail component
  - **Fix:** Show format info (e.g., "Best of 3 + Super Tiebreak")
  - **Estimated:** 2 hours
  - **Test:** View bracket, verify format displayed

- [ ] **Add "Compare Stats" button in user profiles**
  - **Issue:** Can't access H2H stats directly from profile
  - **Files:** `UserProfileComponent`
  - **Fix:** Add button that navigates to H2H comparison
  - **Estimated:** 2 hours
  - **Test:** View opponent profile, click compare, verify H2H loads

---

## Phase 4: Form Improvements (3-5 hours each) 📝

### Priority: MEDIUM - Better data entry

- [ ] **Consolidate participant edit into single form**
  - **Issue:** Multiple windows make editing confusing
  - **Files:** Participant edit modal/page
  - **Fix:** Use tabbed interface if needed, avoid multiple dialogs
  - **Estimated:** 3 hours
  - **Test:** Edit participant, verify all fields accessible in one place

- [ ] **Add validation for scheduled matches (must have time)**
  - **Issue:** Can mark as SCHEDULED without assigned time
  - **Files:** Match service, scheduling component
  - **Fix:** Validate date/time required when status = SCHEDULED
  - **Estimated:** 2 hours
  - **Test:** Try to schedule match without time, verify error shown

- [ ] **Add winner selection for WO/RET/DEF statuses**
  - **Issue:** WO and RET don't specify which player won
  - **Files:** Match status update component
  - **Fix:** Show winner dropdown when status is RET/WO/DEF
  - **Estimated:** 3 hours
  - **Test:** Mark match as RETIRED, verify winner selection required

- [ ] **Add default category creation**
  - **Issue:** Can't add external participants if no categories exist
  - **Files:** `ParticipantService`, category management
  - **Fix:** Create default "Open" category automatically, add validation
  - **Estimated:** 2 hours
  - **Test:** Create tournament without categories, add participant, verify works

- [ ] **Add full acceptance status dropdown**
  - **Issue:** Can only change status to accepted/rejected, not WC, SE, LL, etc.
  - **Files:** `RegistrationService`, status update UI
  - **Fix:** Replace accept/reject buttons with dropdown of all 9 types
  - **Estimated:** 2 hours
  - **Test:** Change participant status to WC, SE, LL, verify all options work

- [ ] **Add image upload to announcement form**
  - **Issue:** Can't add images to announcements
  - **Files:** `AnnouncementCreateComponent`
  - **Fix:** Add file upload field with preview, store URL in imageUrl field
  - **Estimated:** 4 hours
  - **Test:** Create announcement with image, verify displays correctly

- [ ] **Add link fields to announcement form**
  - **Issue:** Can't add external links to announcements
  - **Files:** `AnnouncementCreateComponent`, display component
  - **Fix:** Add linkUrl and linkText fields, show as button in display
  - **Estimated:** 2 hours
  - **Test:** Create announcement with link, verify "Learn More" button appears

---

## Phase 5: State Management & Validation (4-6 hours each) 🔒

### Priority: HIGH - Prevents data inconsistency

- [ ] **Prevent scheduling matches with BYE participants**
  - **Issue:** Allows scheduling BYE matches (invalid)
  - **Files:** Match scheduling service, validation
  - **Fix:** Check if participant is BYE placeholder, reject scheduling
  - **Estimated:** 2 hours
  - **Test:** Try to schedule match with BYE participant, verify blocked

- [ ] **Distinguish BYE from TBD in bracket display**
  - **Issue:** Confusion between BYE (automatic) and TBD (not yet scheduled)
  - **Files:** Bracket visualization
  - **Fix:** Use "BYE" label with green checkmark, "TBD" with gray placeholder
  - **Estimated:** 2 hours
  - **Test:** View bracket, verify BYE and TBD clearly distinguished

- [ ] **Add tournament state-based action validation**
  - **Issue:** Allows contradictory actions (edit after published, register after deadline)
  - **Files:** Authorization guards, tournament service
  - **Fix:** Implement FSM pattern, validate actions against state
  - **Estimated:** 5 hours
  - **Test:** Try invalid actions, verify blocked with clear error messages

- [ ] **Add match status transition filtering**
  - **Issue:** Status dropdown shows all 12 states instead of valid transitions
  - **Files:** Match detail component
  - **Fix:** Filter dropdown based on `Match.isValidTransition()`
  - **Estimated:** 3 hours
  - **Test:** From each status, verify dropdown shows only valid next states

- [ ] **Add court management interface**
  - **Issue:** Cannot find how to add/edit courts after creation
  - **Files:** New court management component
  - **Fix:** Create "Manage Courts" page for editing court names/hours
  - **Estimated:** 4 hours
  - **Test:** Edit court names and hours, verify updated in scheduling

---

## Phase 6: Advanced Features (6-8 hours each) 🚀

### Priority: MEDIUM - Complete missing functionality

- [ ] **Implement match format selection in tournament creation**
  - **Issue:** Backend supports formats but UI doesn't expose it
  - **Files:** `TournamentCreateComponent`, `BracketGenerateComponent`
  - **Fix:** Add match format dropdown (Best of 3, Best of 5, Super Tiebreak, etc.)
  - **Estimated:** 4 hours
  - **Test:** Create tournament with each format, verify propagates to matches

- [ ] **Add super tiebreak support in score entry**
  - **Issue:** Cannot enter super tiebreak scores (10-point tiebreak)
  - **Files:** Result entry modal, score validation
  - **Fix:** Add separate tiebreak point input, validate against format
  - **Estimated:** 6 hours
  - **Test:** Enter 6-4, 4-6, [10-8] score, verify saves correctly

- [ ] **Improve PDF export template**
  - **Issue:** PDF lacks logo, titles, professional formatting
  - **Files:** `ExportService`, PDF templates
  - **Fix:** Redesign PDF with header, logo, better table formatting
  - **Estimated:** 4 hours
  - **Test:** Export tournament as PDF, verify professional appearance

- [ ] **Add advanced bracket configuration options**
  - **Issue:** Limited draw configuration (consolation types, group sizes, etc.)
  - **Files:** `BracketGenerateComponent`
  - **Fix:** Expose all options from backend (simple/compass consolation, custom groups)
  - **Estimated:** 5 hours
  - **Test:** Generate bracket with each configuration, verify works correctly

- [ ] **Implement global ranking update workflow**
  - **Issue:** FR44 - Global ranking is read-only, no update mechanism
  - **Files:** New ranking management component, `RankingService`
  - **Fix:** Create admin interface for updating rankings, calculate based on tournament results
  - **Estimated:** 8 hours
  - **Test:** Complete tournament, update rankings, verify reflected in seeding

---

## Phase 7: Phase Linking UI (8-10 hours each) 🔗

### Priority: MEDIUM - Feature complete but needs UI

- [ ] **Create "Phases" tab in tournament detail**
  - **Issue:** No UI for viewing/managing multiple phases
  - **Files:** `TournamentDetailComponent`
  - **Fix:** Add tab showing all phases (qualifying, main, consolation)
  - **Estimated:** 3 hours
  - **Test:** View tournament with multiple phases, verify all listed

- [ ] **Add "Create New Phase" functionality**
  - **Issue:** Phases can only be created via API
  - **Files:** Phase creation component
  - **Fix:** Modal for creating phase with type selection (qualifying/main/consolation)
  - **Estimated:** 4 hours
  - **Test:** Create new phase, verify appears in phase list

- [ ] **Add "Link Phases" interface**
  - **Issue:** Phase linking only via API
  - **Files:** Phase management component
  - **Fix:** Drag-and-drop or form to link qualifying → main → consolation
  - **Estimated:** 6 hours
  - **Test:** Link phases, verify relationship saved and displayed

- [ ] **Add "Advance Qualifiers" button**
  - **Issue:** Qualifier advancement only via API
  - **Files:** Phase detail component
  - **Fix:** Button to trigger advancement when qualifying complete
  - **Estimated:** 3 hours
  - **Test:** Complete qualifying, advance qualifiers, verify moved to main

- [ ] **Add visual phase flow diagram**
  - **Issue:** Can't see phase relationships clearly
  - **Files:** New diagram component
  - **Fix:** Flowchart showing qualifying → main → consolation with participant counts
  - **Estimated:** 8 hours
  - **Test:** View diagram, verify shows phase relationships accurately

- [ ] **Add "Promote Lucky Loser" interface**
  - **Issue:** Lucky loser promotion only via API
  - **Files:** Participant management in phase
  - **Fix:** Button to select alternate and promote to LL in main draw
  - **Estimated:** 4 hours
  - **Test:** Withdraw participant, promote alternate, verify status changes to LL

---

## Phase 8: Testing & Documentation (varies) 📚

### Priority: MEDIUM - Quality assurance

- [ ] **Create E2E test for match status transitions**
  - **Files:** `e2e/match-status-workflow.spec.ts`
  - **Scenarios:** TBP → IP → CO, IP → SUS → IP, IP → RET, TBP → WO
  - **Estimated:** 4 hours

- [ ] **Create E2E test for result confirmation workflow**
  - **Files:** `e2e/result-confirmation.spec.ts`
  - **Scenarios:** Submit → Confirm, Submit → Dispute → Resolve
  - **Estimated:** 4 hours

- [ ] **Create E2E test for phase linking**
  - **Files:** `e2e/phase-linking.spec.ts`
  - **Scenarios:** Create phases, link, advance qualifiers, create consolation
  - **Estimated:** 6 hours

- [ ] **Create privacy enforcement test matrix**
  - **Files:** `e2e/privacy-enforcement.spec.ts`
  - **Scenarios:** Test all role × privacy level combinations
  - **Estimated:** 5 hours

- [ ] **Create export validation tests**
  - **Files:** `e2e/export-formats.spec.ts`
  - **Scenarios:** Validate ITF CSV, TODS JSON, PDF, Excel outputs
  - **Estimated:** 4 hours

- [ ] **Document notification channel setup**
  - **Files:** `docs/NOTIFICATION-SETUP-GUIDE.md`
  - **Content:** Step-by-step SMTP, Telegram Bot, VAPID key configuration
  - **Estimated:** 3 hours

- [ ] **Create administrator training video**
  - **Files:** Screen recording + editing
  - **Content:** Complete tournament setup walkthrough (15-20 minutes)
  - **Estimated:** 6 hours

- [ ] **Create user guide for participants**
  - **Files:** `docs/USER-GUIDE.md`
  - **Content:** Registration, result entry, statistics, notifications
  - **Estimated:** 4 hours

- [ ] **Update architecture diagrams**
  - **Files:** `docs/ARCHITECTURE.md`, Mermaid diagrams
  - **Content:** Reflect all recent changes (notifications, phase linking, etc.)
  - **Estimated:** 3 hours

---

## Phase 9: Polish & Nice-to-Have (varies) ✨

### Priority: LOW - Enhances experience but not critical

- [ ] **Add "Preview as Public" in privacy settings**
  - **Issue:** Users can't see what others see
  - **Files:** `PrivacySettingsComponent`
  - **Estimated:** 3 hours

- [ ] **Add surface icons in match history**
  - **Issue:** Surface shown as text instead of icon
  - **Files:** Statistics components
  - **Estimated:** 1 hour

- [ ] **Add win-loss trend graph in H2H**
  - **Issue:** H2H data is tabular, could be visual
  - **Files:** Statistics components, use Chart.js
  - **Estimated:** 5 hours

- [ ] **Add notification batching**
  - **Issue:** Too many individual notifications
  - **Files:** `NotificationService`
  - **Estimated:** 6 hours

- [ ] **Add digest mode for notifications**
  - **Issue:** No option for daily/weekly summary
  - **Files:** Notification preferences, background job
  - **Estimated:** 8 hours

- [ ] **Add automatic confirmation timer (48h)**
  - **Issue:** Pending confirmations stay pending forever
  - **Files:** Background job, `ResultConfirmationService`
  - **Estimated:** 4 hours

- [ ] **Add optimistic locking for result submission**
  - **Issue:** Both players could submit simultaneously
  - **Files:** `ResultConfirmationService`
  - **Estimated:** 3 hours

- [ ] **Add "Quick Confirm" from notification dropdown**
  - **Issue:** Must navigate to My Matches to confirm
  - **Files:** Notification dropdown component
  - **Estimated:** 4 hours

- [ ] **Test and document multi-level consolation (Compass)**
  - **Issue:** FR22 - Compass draws not tested
  - **Files:** Test scenarios, documentation
  - **Estimated:** 4 hours

- [ ] **Set up scheduled announcement publication cron job**
  - **Issue:** FR49 - Scheduled publication not running
  - **Files:** Backend cron configuration
  - **Estimated:** 3 hours

- [ ] **Add bulk export (all tournaments as ZIP)**
  - **Files:** Export service
  - **Estimated:** 4 hours

- [ ] **Add image gallery for announcements**
  - **Issue:** Only one image per announcement
  - **Files:** Announcement components
  - **Estimated:** 6 hours

---

## Summary by Priority

### Critical (Do First) - 0 remaining (4 completed ✅)
Total: ~9.5 hours → ~0 hours remaining (Phase 1 COMPLETE)

### High Priority - 18 remaining (3 completed ✅)
Total: ~58 hours → ~53 hours remaining (Phase 2 partially complete)

### Medium Priority - 23 tasks
Total: ~110 hours

### Low Priority - 16 tasks
Total: ~58 hours

**Grand Total:** ~221 hours remaining (approximately 27.6 working days for 1 developer)  
**Completed:** ~14.5 hours (7 tasks: 4 Phase 1 + 3 Phase 2)

---

## Recommended Sprint Planning

### Sprint 1 (Week 1): Critical Fixes
- All Phase 1 tasks (quick fixes)
- Navigation improvements from Phase 2
- **Goal:** Fix most confusing UX issues
- **Deliverable:** Users can navigate easily and understand match statuses

### Sprint 2 (Week 2): Data Visibility
- All Phase 3 tasks (visualization)
- Some Phase 4 tasks (forms)
- **Goal:** Show existing data better
- **Deliverable:** Clear participant status, seeds visible, counters working

### Sprint 3 (Week 3): Core Features
- Match format configuration
- Super tiebreak support
- State validation
- **Goal:** Complete essential tennis functionality
- **Deliverable:** Full scoring format support, better validation

### Sprint 4 (Week 4): Advanced Features
- Phase linking UI
- Global ranking updates
- Export improvements
- **Goal:** Complete missing FR items
- **Deliverable:** Phase management accessible, exports polished

### Sprint 5 (Week 5): Testing & Documentation
- E2E test suite
- User documentation
- Admin training materials
- **Goal:** Quality assurance and knowledge transfer
- **Deliverable:** Comprehensive test coverage, complete docs

### Sprint 6 (Week 6): Polish
- Nice-to-have features
- Performance optimization
- User feedback incorporation
- **Goal:** Final refinements
- **Deliverable:** Production-ready with all polish

---

## Task Dependencies

Some tasks depend on others. Respect these dependencies:

1. **Phase Linking UI** depends on:
   - "Phases" tab created first
   - API endpoints already exist (complete)

2. **Super Tiebreak Support** depends on:
   - Match format selection implemented first

3. **Match Status Filtering** depends on:
   - Winner selection for RET/WO/DEF implemented first

4. **Export Button** depends on:
   - PDF improvements (or document as known limitation)

5. **E2E Tests** depend on:
   - Features being implemented first

---

## Out of Scope (Do NOT Implement)

These are explicitly out of scope per specification:

- ❌ Payment/registration fee collection system
- ❌ Live match streaming
- ❌ Video conferencing for arbitration
- ❌ Advanced tactical analysis
- ❌ Court booking for regular club use (only tournament courts)
- ❌ Integration with electronic scoreboards
- ❌ Betting or prediction system

---

## Notes for Implementation

### Code Standards Reminder
- ✅ Add file header to all new files
- ✅ Use TSDoc comments for all public methods
- ✅ Use explicit access modifiers (public, private, protected)
- ✅ Follow Google TypeScript Style Guide
- ✅ Update `CHANGES.md` after completing each feature

### Testing Requirements
- ✅ Manual test each fix before marking complete
- ✅ Add unit tests for service logic
- ✅ Add E2E tests for user workflows
- ✅ Regression test related features

### Documentation Requirements
- ✅ Update specification if behavior changes
- ✅ Update user guide for new UI features
- ✅ Add inline comments for complex logic
- ✅ Document API changes in OpenAPI spec

---

**Document Owner:** Coding Agent  
**Last Updated:** April 22, 2026  
**Status:** Ready for Implementation  
**Estimated Completion:** 6 weeks (1 developer) or 3 weeks (2 developers)
