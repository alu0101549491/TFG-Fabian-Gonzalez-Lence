# Testing Guide: FR1/FR8 - Tournament Facility Type and Regulations

**Feature:** Tournament creation with complete configuration fields (facility type and regulations)  
**Date:** 2026-04-12  
**Specification:** FR1 (Tournament creation), FR8 (Regulations configuration)

---

## 📋 Prerequisites

1. **Database Migration Applied:** Ensure migration 007 has been executed
   ```bash
   cd backend && npm run db:migrate
   ```

2. **Backend Running:** Start the backend server
   ```bash
   cd backend && npm run dev
   ```

3. **Frontend Running:** Start the frontend development server
   ```bash
   npm run dev
   ```

4. **Authentication:** Have admin credentials ready (SYSTEM_ADMIN or TOURNAMENT_ADMIN role)

---

## 🧪 Test Scenarios

### Test 1: Create Tournament with Facility Type and Regulations

**Objective:** Verify facility type dropdown and regulations textarea work correctly in tournament creation.

**Steps:**
1. Login as admin (SYSTEM_ADMIN or TOURNAMENT_ADMIN)
2. Navigate to **Create Tournament** page
3. Scroll to **Tournament Details** section
4. Verify **Facility Type** dropdown appears after **Surface** field
5. Verify dropdown contains:
   - Indoor
   - Outdoor
6. Select **Facility Type** = "Outdoor" (should be default)
7. Fill other required fields (name, dates, location, etc.)
8. Scroll to **Tournament Regulations** section (after Registration Fee section)
9. Verify **Regulations & Rules** textarea is present with 6 rows
10. Enter sample regulations:
    ```
    ITF Rule 24: Standard tiebreak at 6-6 in all sets.
    Final set: Match tiebreak (first to 10 points, win by 2).
    Medical timeout: Maximum 3 minutes per injury.
    ```
11. Click **Create Tournament**
12. Verify tournament is created successfully

**Expected Results:**
- ✅ Facility Type dropdown visible and functional
- ✅ Default value is "Outdoor"
- ✅ Regulations textarea accepts multi-line text
- ✅ Tournament saves successfully with both fields
- ✅ No validation errors

---

### Test 2: View Tournament Details with New Fields

**Objective:** Verify facility type and regulations display correctly in tournament detail page.

**Steps:**
1. Navigate to the tournament created in Test 1
2. Verify **Tournament Information** section shows:
   ```
   Location: [your test location]
   Surface: [selected surface]
   Facility Type: Outdoor  ← NEW FIELD
   Tournament Type: [selected type]
   ...
   ```
3. Verify **Tournament Regulations** section appears below **Description**
4. Verify regulations text displays with preserved line breaks
5. Verify regulations text matches what was entered during creation

**Expected Results:**
- ✅ Facility Type displays with correct enum label ("Outdoor", not "OUTDOOR")
- ✅ Facility Type appears between Surface and Tournament Type
- ✅ Regulations section is present (only if regulations were entered)
- ✅ Regulations text preserves formatting (white-space: pre-wrap)
- ✅ Regulations heading is "Tournament Regulations"

---

### Test 3: Edit Tournament - Change Facility Type

**Objective:** Verify facility type can be edited and updated.

**Steps:**
1. Navigate to tournament created in Test 1
2. Click **Edit Tournament** button (admin only)
3. Scroll to **Tournament Details** section
4. Verify **Facility Type** dropdown shows current value ("Outdoor")
5. Change **Facility Type** to "Indoor"
6. Do not modify regulations
7. Click **Update Tournament**
8. Verify success message
9. Return to tournament detail page
10. Verify **Facility Type** now shows "Indoor"

**Expected Results:**
- ✅ Facility Type dropdown pre-populated with current value
- ✅ Facility Type updates successfully
- ✅ Updated value displays correctly in detail view
- ✅ No impact on other fields

---

### Test 4: Edit Tournament - Update Regulations

**Objective:** Verify regulations text can be edited and updated.

**Steps:**
1. Navigate to tournament from Test 3
2. Click **Edit Tournament**
3. Scroll to **Tournament Regulations** section
4. Verify regulations textarea shows current text
5. Append additional text:
   ```
   Warm-up: 5 minutes before each match.
   Clothing: All white attire required.
   ```
6. Click **Update Tournament**
7. Navigate back to tournament detail page
8. Verify updated regulations text displays correctly

**Expected Results:**
- ✅ Regulations textarea pre-populated with current value
- ✅ Multi-line text editable
- ✅ Updated regulations save successfully
- ✅ New text appends without losing previous content
- ✅ Formatting preserved on display

---

### Test 5: Create Tournament with No Regulations (Optional Field)

**Objective:** Verify regulations field is truly optional and nullable.

**Steps:**
1. Navigate to **Create Tournament** page
2. Fill all required fields
3. Select **Facility Type** = "Indoor"
4. **Leave regulations textarea EMPTY**
5. Click **Create Tournament**
6. Verify tournament created successfully
7. Navigate to tournament detail page
8. Verify **no** "Tournament Regulations" section appears

**Expected Results:**
- ✅ Tournament creates successfully without regulations
- ✅ No validation error for empty regulations
- ✅ Detail page hides regulations section when null/empty
- ✅ Facility Type still displays correctly

---

### Test 6: Backend API - Direct Verification

**Objective:** Verify backend correctly stores and retrieves new fields via API.

**Steps:**
1. Get tournament ID from Test 1
2. Make GET request to backend API:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3000/api/tournaments/YOUR_TOURNAMENT_ID
   ```
3. Verify JSON response contains:
   ```json
   {
     "id": "trn_...",
     "facilityType": "OUTDOOR",
     "regulations": "ITF Rule 24: Standard tiebreak...\n...",
     ...
   }
   ```
4. Create a tournament via API with POST:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        -d '{
          "name": "API Test Tournament",
          "startDate": "2026-05-01T00:00:00Z",
          "endDate": "2026-05-08T00:00:00Z",
          "location": "Test Center",
          "surface": "CLAY",
          "facilityType": "INDOOR",
          "regulations": "Custom API regulations",
          "tournamentType": "SINGLES",
          "maxParticipants": 16
        }' \
        http://localhost:3000/api/tournaments
   ```
5. Verify 201 Created response with facilityType and regulations in response body

**Expected Results:**
- ✅ GET /api/tournaments/:id returns facilityType and regulations
- ✅ POST /api/tournaments accepts facilityType and regulations
- ✅ facilityType stored as enum string (INDOOR/OUTDOOR)
- ✅ regulations stored as TEXT (nullable)
- ✅ Default facilityType applied if not provided (OUTDOOR)

---

### Test 7: Database Verification

**Objective:** Verify database schema and data integrity.

**Steps:**
1. Connect to PostgreSQL database
2. Verify schema:
   ```sql
   \d tournaments;
   ```
3. Verify columns exist:
   - `facilityType` VARCHAR(20) NOT NULL DEFAULT 'OUTDOOR'
   - `regulations` TEXT NULL
4. Query tournaments table:
   ```sql
   SELECT id, name, "facilityType", regulations FROM tournaments LIMIT 5;
   ```
5. Verify data stored correctly:
   - facilityType contains 'INDOOR' or 'OUTDOOR'
   - regulations contains text or NULL

**Expected Results:**
- ✅ facilityType column exists with correct type and default
- ✅ regulations column exists with correct type (TEXT, nullable)
- ✅ Existing tournaments have facilityType = 'OUTDOOR' (migration default)
- ✅ Existing tournaments have regulations = NULL (acceptable)
- ✅ New tournaments store selected facility type
- ✅ New tournaments store regulations text or NULL

---

### Test 8: Enum Validation

**Objective:** Verify only valid facility types are accepted.

**Steps:**
1. Attempt to create tournament via API with invalid facility type:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        -d '{
          "name": "Invalid Facility Test",
          "facilityType": "INVALID_TYPE",
          ...other required fields...
        }' \
        http://localhost:3000/api/tournaments
   ```
2. Verify backend rejects request
3. Verify frontend dropdown only allows INDOOR/OUTDOOR selection
4. Try selecting a value, then inspect network request
5. Verify only "INDOOR" or "OUTDOOR" is sent (not localized labels)

**Expected Results:**
- ✅ Backend validates enum values
- ✅ Invalid values rejected with 400 Bad Request
- ✅ Frontend dropdown constrained to valid options only
- ✅ Enum values sent as uppercase strings (INDOOR, OUTDOOR)
- ✅ EnumFormatPipe converts to labels for display only

---

### Test 9: Regulations Text Formatting

**Objective:** Verify multi-line text, special characters, and whitespace preservation.

**Steps:**
1. Create tournament with complex regulations:
   ```
   SCORING SYSTEM:
   - Set format: Best of 3 sets
   - Final set: Match tiebreak (10 points)
   
   SPECIAL RULES:
   1. No coaching allowed
   2. Toilet breaks: Max 1 per match
   
   PENALTIES:
   • Warning → Point penalty → Game penalty → Default
   
   Contact: referee@tournament.com
   ```
2. Save tournament
3. View tournament detail page
4. Verify ALL formatting is preserved:
   - Line breaks
   - Bullet points
   - Numbered lists
   - Special characters (→, •)
   - Multiple blank lines
   - Indentation

**Expected Results:**
- ✅ All line breaks preserved (white-space: pre-wrap CSS)
- ✅ Special characters display correctly
- ✅ Indentation and spacing maintained
- ✅ Text readable and formatted as entered
- ✅ No HTML escaping issues
- ✅ No truncation for long text

---

### Test 10: Backwards Compatibility

**Objective:** Verify existing tournaments work correctly after migration.

**Steps:**
1. Query database for tournaments created BEFORE migration 007
2. Verify old tournaments have:
   - facilityType = 'OUTDOOR' (migration default)
   - regulations = NULL
3. View an old tournament in detail page
4. Verify it displays correctly without errors
5. Edit an old tournament
6. Verify facility type shows "Outdoor" (default)
7. Verify regulations textarea is empty but functional
8. Update an old tournament with new values
9. Verify updates save successfully

**Expected Results:**
- ✅ Old tournaments have default OUTDOOR facility type
- ✅ Old tournaments display correctly (no errors)
- ✅ Edit form pre-populates with defaults
- ✅ Old tournaments can be updated with new field values
- ✅ No data loss or corruption
- ✅ Migration applied cleanly

---

## ✅ Acceptance Criteria

All tests must pass with the following results:

- [x] Facility Type dropdown appears in Create Tournament form
- [x] Facility Type dropdown appears in Edit Tournament form
- [x] Facility Type displays in Tournament Detail view
- [x] Regulations textarea appears in Create Tournament form  
- [x] Regulations textarea appears in Edit Tournament form
- [x] Regulations section displays in Tournament Detail view (when not empty)
- [x] FacilityType enum accepts only INDOOR and OUTDOOR
- [x] Regulations accepts multi-line text with special characters
- [x] Regulations field is optional (nullable)
- [x] Database migration 007 applied successfully
- [x] Backend API accepts and returns new fields
- [x] Frontend compiles without errors
- [x] Backend compiles without errors
- [x] No breaking changes to existing functionality
- [x] Backwards compatibility maintained

---

## 🐛 Known Issues / Edge Cases

None identified.

---

## 📸 Screenshot Checklist

Capture screenshots of:
1. Tournament Create form with Facility Type dropdown
2. Tournament Create form with Regulations textarea
3. Tournament Detail page showing Facility Type
4. Tournament Detail page showing Regulations section
5. Tournament Edit form with pre-populated values
6. Database query showing facilityType and regulations columns

---

## 🎯 Specification Compliance

- ✅ **FR1**: Tournament creation includes facility type (indoor/outdoor) configuration
- ✅ **FR8**: Tournament regulations free text field for custom rules, tiebreak criteria, special conditions
- ✅ All acceptance criteria from specification met
- ✅ Full CRUD operations implemented
- ✅ Frontend UI complete
- ✅ Backend validation in place
- ✅ Database schema updated

---

**Test Completion Date:** _____________  
**Tester Name:** _____________  
**Status:** ☐ All tests passed | ☐ Issues found (see below)  
**Notes:**
