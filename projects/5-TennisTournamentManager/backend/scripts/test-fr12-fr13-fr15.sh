#!/usr/bin/env bash
# Test script for FR12, FR13, FR15 implementations
set -e

BASE="http://localhost:3000/api"
PASS=0
FAIL=0

pass() { echo "  ✅ PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ FAIL: $1"; FAIL=$((FAIL+1)); }
section() { echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; echo "  $1"; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

json_field() { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$2',''))" 2>/dev/null; }
json_field_nested() { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$2',{}).get('$3',''))" 2>/dev/null; }

# ── Auth ──────────────────────────────────────────────────────────────────────
section "🔑 Authentication"
ADMIN_RESP=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@tennistournament.com","password":"admin123"}')
TOKEN=$(json_field "$ADMIN_RESP" "token")
[ -n "$TOKEN" ] && pass "Admin login OK" || { fail "Admin login FAILED"; exit 1; }

PLAYER1_RESP=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"player@example.com","password":"player123"}')
PLAYER1_TOKEN=$(json_field "$PLAYER1_RESP" "token")
PLAYER1_ID=$(json_field_nested "$PLAYER1_RESP" "user" "id")
[ -n "$PLAYER1_TOKEN" ] && pass "Player1 login OK (id=$PLAYER1_ID)" || fail "Player1 login FAILED"

PLAYER2_RESP=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"maria@example.com","password":"player123"}')
PLAYER2_TOKEN=$(json_field "$PLAYER2_RESP" "token")
PLAYER2_ID=$(json_field_nested "$PLAYER2_RESP" "user" "id")
[ -n "$PLAYER2_TOKEN" ] && pass "Player2 login OK (id=$PLAYER2_ID)" || fail "Player2 login FAILED"

ADMIN_ID=$(json_field_nested "$ADMIN_RESP" "user" "id")

# ── Create Test Tournament ────────────────────────────────────────────────────
section "🏆 Setup: Tournament + Category"
TOMORROW=$(date -d "tomorrow" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)
NEXT_WEEK=$(date -d "+7 days" +%Y-%m-%d 2>/dev/null || date -v+7d +%Y-%m-%d)

TOURN_RESP=$(curl -s -X POST "$BASE/tournaments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"FR12-FR13-FR15 Test Tournament\",
    \"startDate\": \"$NEXT_WEEK\",
    \"endDate\": \"$NEXT_WEEK\",
    \"registrationCloseDate\": \"$TOMORROW\",
    \"location\": \"Test Venue, City\",
    \"surface\": \"CLAY\",
    \"facilityType\": \"OUTDOOR\",
    \"tournamentType\": \"SINGLES\",
    \"maxParticipants\": 32,
    \"organizerId\": \"$ADMIN_ID\"
  }")
TOURN_ID=$(json_field "$TOURN_RESP" "id")
[ -n "$TOURN_ID" ] && pass "Tournament created (id=$TOURN_ID)" || { fail "Tournament creation FAILED: $TOURN_RESP"; exit 1; }

# Open tournament for registration
curl -s -X PUT "$BASE/tournaments/$TOURN_ID/status" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"REGISTRATION_OPEN"}' > /dev/null

# Create category with maxParticipants=2
CAT_RESP=$(curl -s -X POST "$BASE/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tournamentId\": \"$TOURN_ID\",
    \"name\": \"Open Men Quota=2\",
    \"gender\": \"OPEN\",
    \"ageGroup\": \"OPEN\",
    \"maxParticipants\": 2
  }")
CAT_ID=$(json_field "$CAT_RESP" "id")
[ -n "$CAT_ID" ] && pass "Category created (maxParticipants=2, id=$CAT_ID)" || { fail "Category creation FAILED: $CAT_RESP"; exit 1; }

# ── FR12: Quota Orchestration ─────────────────────────────────────────────────
section "📋 FR12: Quota Orchestration (WC/OA count toward quota)"

# Register player1 as PENDING
REG1_RESP=$(curl -s -X POST "$BASE/registrations" \
  -H "Authorization: Bearer $PLAYER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"tournamentId\":\"$TOURN_ID\",\"categoryId\":\"$CAT_ID\",\"participantId\":\"$PLAYER1_ID\"}")
REG1_ID=$(json_field "$REG1_RESP" "id")
[ -n "$REG1_ID" ] && pass "Reg1 created (pending, id=$REG1_ID)" || { fail "Reg1 FAILED: $REG1_RESP"; exit 1; }

# Approve player1 as WILD_CARD
UPD1=$(curl -s -X PUT "$BASE/registrations/$REG1_ID/status" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"ACCEPTED","acceptanceType":"WILD_CARD"}')
UPD1_AT=$(json_field "$UPD1" "acceptanceType")
[ "$UPD1_AT" = "WILD_CARD" ] && pass "Reg1 accepted as WILD_CARD" || fail "Reg1 WC update FAILED: $UPD1"

# Register player2 as PENDING
REG2_RESP=$(curl -s -X POST "$BASE/registrations" \
  -H "Authorization: Bearer $PLAYER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"tournamentId\":\"$TOURN_ID\",\"categoryId\":\"$CAT_ID\",\"participantId\":\"$PLAYER2_ID\"}")
REG2_ID=$(json_field "$REG2_RESP" "id")
[ -n "$REG2_ID" ] && pass "Reg2 created (pending, id=$REG2_ID)" || { fail "Reg2 FAILED: $REG2_RESP"; exit 1; }

# Approve player2 as ORGANIZER_ACCEPTANCE (OA) — this should fill the quota
UPD2=$(curl -s -X PUT "$BASE/registrations/$REG2_ID/status" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"ACCEPTED","acceptanceType":"ORGANIZER_ACCEPTANCE"}')
UPD2_AT=$(json_field "$UPD2" "acceptanceType")
[ "$UPD2_AT" = "ORGANIZER_ACCEPTANCE" ] && pass "Reg2 accepted as ORGANIZER_ACCEPTANCE (fills quota)" || fail "Reg2 OA update FAILED: $UPD2"

# Try to register a 3rd player (admin) — quota is maxParticipants=2 (WC=1 + OA=1)
# Use adminEnroll which should also enforce quota
EXTRA_REG_RESP=$(curl -s -X POST "$BASE/registrations/admin-enroll" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"tournamentId\":\"$TOURN_ID\",\"categoryId\":\"$CAT_ID\",\"participantId\":\"$ADMIN_ID\",\"status\":\"ACCEPTED\",\"acceptanceType\":\"DIRECT_ACCEPTANCE\"}" 2>&1 || true)
EXTRA_AT=$(json_field "$EXTRA_REG_RESP" "acceptanceType")
EXTRA_STATUS=$(json_field "$EXTRA_REG_RESP" "status")
EXTRA_ERR=$(json_field "$EXTRA_REG_RESP" "error")

if [ "$EXTRA_AT" = "ALTERNATE" ] || [ "$EXTRA_STATUS" = "ALTERNATE" ]; then
  pass "FR12: 3rd participant correctly assigned ALTERNATE (quota full: WC+OA count)"
elif [ -n "$EXTRA_ERR" ]; then
  pass "FR12: 3rd participant blocked with error: $EXTRA_ERR (quota enforced)"
else
  fail "FR12: 3rd participant was accepted as DA despite quota full! Response: $EXTRA_REG_RESP"
fi
EXTRA_REG_ID=$(json_field "$EXTRA_REG_RESP" "id")

# ── FR13: Pre-draw withdrawal ─────────────────────────────────────────────────
section "🚪 FR13: Pre-draw Withdrawal (ALT→DIRECT_ACCEPTANCE)"

# First we need a category with an ALT queued; let's use what we have:
# REG1=WC (ACCEPTED), REG2=OA (ACCEPTED). If EXTRA_REG_ID exists (ALT), withdraw REG1 and check promotion
if [ -n "$EXTRA_REG_ID" ]; then
  echo "  Using existing ALTERNATE registration (id=$EXTRA_REG_ID)"
  WITHDRAW_RESP=$(curl -s -X POST "$BASE/registrations/$REG1_ID/withdraw" \
    -H "Authorization: Bearer $PLAYER1_TOKEN" -H "Content-Type: application/json" \
    -d '{}')
  WD_STATUS=$(json_field "$WITHDRAW_RESP" "error")
  
  if [ -z "$WD_STATUS" ]; then
    pass "FR13: Withdraw endpoint responded (no error field)"
    # Check if the alternate was promoted
    PROMOTED_ID=$(json_field "$WITHDRAW_RESP" "promotedParticipantId")
    if [ "$PROMOTED_ID" = "$ADMIN_ID" ] || [ -n "$PROMOTED_ID" ]; then
      pass "FR13: ALT promoted (promotedParticipantId=$PROMOTED_ID)"
    else
      # Check the registration directly
      EXTRA_UPDATED=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE/registrations/$EXTRA_REG_ID")
      EXTRA_UPDATED_AT=$(json_field "$EXTRA_UPDATED" "acceptanceType")
      [ "$EXTRA_UPDATED_AT" = "DIRECT_ACCEPTANCE" ] && pass "FR13: ALT acceptance type upgraded to DIRECT_ACCEPTANCE" || fail "FR13: ALT not promoted. acceptanceType=$EXTRA_UPDATED_AT, response: $WITHDRAW_RESP"
    fi
    # Check withdrawn registration
    WD_REG=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE/registrations/$REG1_ID")
    WD_STATUS_CHECK=$(json_field "$WD_REG" "status")
    [ "$WD_STATUS_CHECK" = "WITHDRAWN" ] && pass "FR13: Withdrawn reg status=WITHDRAWN" || fail "FR13: Expected WITHDRAWN, got $WD_STATUS_CHECK"
  else
    fail "FR13: Withdrawal error: $WD_STATUS - $WITHDRAW_RESP"
  fi
else
  echo "  ⚠️  No ALTERNATE created (quota test gave different result), skipping pre-draw withdrawal test"
fi

# ── FR13: Create new setup for proper pre-draw test ──────────────────────────
section "🚪 FR13: Fresh pre-draw test (create category with ALT)"

CAT2_RESP=$(curl -s -X POST "$BASE/categories" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"tournamentId\": \"$TOURN_ID\",\"name\": \"FR13 Test Cat\",\"gender\": \"OPEN\",\"ageGroup\": \"OPEN\",\"maxParticipants\": 1}")
CAT2_ID=$(json_field "$CAT2_RESP" "id")
[ -n "$CAT2_ID" ] && pass "Category2 created (maxParticipants=1, id=$CAT2_ID)" || { fail "Category2 FAILED: $CAT2_RESP"; }

if [ -n "$CAT2_ID" ]; then
  # Register player1 → should be DIRECT_ACCEPTANCE (fills quota of 1)
  R_A=$(curl -s -X POST "$BASE/registrations" \
    -H "Authorization: Bearer $PLAYER1_TOKEN" -H "Content-Type: application/json" \
    -d "{\"tournamentId\":\"$TOURN_ID\",\"categoryId\":\"$CAT2_ID\",\"participantId\":\"$PLAYER1_ID\"}")
  R_A_ID=$(json_field "$R_A" "id")
  [ -n "$R_A_ID" ] && pass "Player1 registered (id=$R_A_ID)" || fail "Registration A FAILED: $R_A"
  
  # Approve as DA
  UPD_A=$(curl -s -X PUT "$BASE/registrations/$R_A_ID/status" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"status":"ACCEPTED","acceptanceType":"DIRECT_ACCEPTANCE"}')
  [ "$(json_field "$UPD_A" "acceptanceType")" = "DIRECT_ACCEPTANCE" ] && pass "Player1 accepted as DA" || fail "DA update FAILED: $UPD_A"
  
  # Register player2 → quota=1 (DA occupies 1 slot), should be ALTERNATE
  R_B=$(curl -s -X POST "$BASE/registrations" \
    -H "Authorization: Bearer $PLAYER2_TOKEN" -H "Content-Type: application/json" \
    -d "{\"tournamentId\":\"$TOURN_ID\",\"categoryId\":\"$CAT2_ID\",\"participantId\":\"$PLAYER2_ID\"}")
  R_B_ID=$(json_field "$R_B" "id")
  [ -n "$R_B_ID" ] && pass "Player2 registered (id=$R_B_ID)" || fail "Registration B FAILED: $R_B"
  
  # Player2 should auto-get ALTERNATE since quota=1 is already filled
  R_B_AT=$(json_field "$R_B" "acceptanceType")
  R_B_STATUS=$(json_field "$R_B" "status")
  echo "  Player2 registration: status=$R_B_STATUS, acceptanceType=$R_B_AT"
  
  # Try to approve player2 — should get ALTERNATE due to quota
  UPD_B=$(curl -s -X PUT "$BASE/registrations/$R_B_ID/status" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"status":"ACCEPTED","acceptanceType":"DIRECT_ACCEPTANCE"}')
  UPD_B_AT=$(json_field "$UPD_B" "acceptanceType")
  UPD_B_ERR=$(json_field "$UPD_B" "error")
  echo "  FR12 quota check on DA approve: acceptanceType=$UPD_B_AT, error=$UPD_B_ERR"
  
  # Now withdraw player1 (the DA) — player2 (the ALT) should be promoted
  WD2=$(curl -s -X POST "$BASE/registrations/$R_A_ID/withdraw" \
    -H "Authorization: Bearer $PLAYER1_TOKEN" -H "Content-Type: application/json" \
    -d '{}')
  WD2_ERR=$(json_field "$WD2" "error")
  WD2_PROMOTED=$(json_field "$WD2" "promotedParticipantId")
  echo "  Withdrawal response: error=$WD2_ERR, promotedParticipantId=$WD2_PROMOTED"
  
  if [ -z "$WD2_ERR" ]; then
    pass "FR13: Pre-draw withdrawal succeeded (no error)"
    
    # Verify R_A is WITHDRAWN
    RA_AFTER=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE/registrations/$R_A_ID")
    RA_AFTER_STATUS=$(json_field "$RA_AFTER" "status")
    [ "$RA_AFTER_STATUS" = "WITHDRAWN" ] && pass "FR13: Withdrawn reg status=WITHDRAWN ✓" || fail "FR13: Withdrawn reg status=$RA_AFTER_STATUS (expected WITHDRAWN)"
    
    # Verify R_B was promoted  
    RB_AFTER=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE/registrations/$R_B_ID")
    RB_AFTER_AT=$(json_field "$RB_AFTER" "acceptanceType")
    if [ "$RB_AFTER_AT" = "DIRECT_ACCEPTANCE" ]; then
      pass "FR13: ALT was promoted to DIRECT_ACCEPTANCE ✓"
    else
      fail "FR13: ALT not promoted. acceptanceType=$RB_AFTER_AT, status=$(json_field "$RB_AFTER" "status")"
    fi
  else
    fail "FR13: Withdrawal failed. Error: $WD2_ERR — $WD2"
  fi
fi

# ── FR15: Doubles partner registration ───────────────────────────────────────
section "👥 FR15: Doubles Partner Registration"

# Create a DOUBLES tournament
DOUB_TOURN=$(curl -s -X POST "$BASE/tournaments" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{
    \"name\": \"FR15 Doubles Test\",
    \"startDate\": \"$NEXT_WEEK\",
    \"endDate\": \"$NEXT_WEEK\",
    \"registrationCloseDate\": \"$TOMORROW\",
    \"location\": \"Doubles Venue, City\",
    \"surface\": \"CLAY\",
    \"facilityType\": \"OUTDOOR\",
    \"tournamentType\": \"DOUBLES\",
    \"maxParticipants\": 16,
    \"organizerId\": \"$ADMIN_ID\"
  }")
DOUB_TOURN_ID=$(json_field "$DOUB_TOURN" "id")
[ -n "$DOUB_TOURN_ID" ] && pass "Doubles tournament created (id=$DOUB_TOURN_ID)" || { fail "Doubles tournament FAILED: $DOUB_TOURN"; }

if [ -n "$DOUB_TOURN_ID" ]; then
  # Open it
  curl -s -X PUT "$BASE/tournaments/$DOUB_TOURN_ID/status" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"status":"REGISTRATION_OPEN"}' > /dev/null
  
  # Create category
  DOUB_CAT=$(curl -s -X POST "$BASE/categories" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"tournamentId\":\"$DOUB_TOURN_ID\",\"name\":\"Mixed Doubles\",\"gender\":\"MIXED\",\"ageGroup\":\"OPEN\",\"maxParticipants\":8}")
  DOUB_CAT_ID=$(json_field "$DOUB_CAT" "id")
  [ -n "$DOUB_CAT_ID" ] && pass "Doubles category created (id=$DOUB_CAT_ID)" || fail "Doubles category FAILED: $DOUB_CAT"
  
  if [ -n "$DOUB_CAT_ID" ]; then
    # Register player1 with player2 as partner
    DOUB_REG=$(curl -s -X POST "$BASE/registrations" \
      -H "Authorization: Bearer $PLAYER1_TOKEN" -H "Content-Type: application/json" \
      -d "{\"tournamentId\":\"$DOUB_TOURN_ID\",\"categoryId\":\"$DOUB_CAT_ID\",\"participantId\":\"$PLAYER1_ID\",\"partnerId\":\"$PLAYER2_ID\"}")
    DOUB_REG_ID=$(json_field "$DOUB_REG" "id")
    DOUB_REG_PARTNER=$(json_field "$DOUB_REG" "partnerId")
    [ -n "$DOUB_REG_ID" ] && pass "Doubles registration created (id=$DOUB_REG_ID)" || fail "Doubles reg FAILED: $DOUB_REG"
    
    # Check partnerId was stored
    if [ "$DOUB_REG_PARTNER" = "$PLAYER2_ID" ]; then
      pass "FR15: partnerId stored on creation ($DOUB_REG_PARTNER)"
    else
      fail "FR15: partnerId not stored. Got '$DOUB_REG_PARTNER', expected '$PLAYER2_ID'. Response: $DOUB_REG"
    fi
    
    if [ -n "$DOUB_REG_ID" ]; then
      # Admin can update partner via PUT /registrations/:id/partner
      UPDATE_PARTNER=$(curl -s -X PUT "$BASE/registrations/$DOUB_REG_ID/partner" \
        -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
        -d "{\"partnerId\":\"$ADMIN_ID\"}")
      UP_PARTNER=$(json_field "$UPDATE_PARTNER" "partnerId")
      UP_ERR=$(json_field "$UPDATE_PARTNER" "error")
      
      if [ "$UP_PARTNER" = "$ADMIN_ID" ]; then
        pass "FR15: Admin successfully updated partner to admin (id=$UP_PARTNER)"
      elif [ -n "$UP_ERR" ]; then
        fail "FR15: updatePartner returned error: $UP_ERR — $UPDATE_PARTNER"
      else
        fail "FR15: updatePartner failed. partnerId='$UP_PARTNER', response: $UPDATE_PARTNER"
      fi
      
      # Test self-pairing prevention
      SELF_PAIR=$(curl -s -X PUT "$BASE/registrations/$DOUB_REG_ID/partner" \
        -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
        -d "{\"partnerId\":\"$PLAYER1_ID\"}")
      SELF_ERR=$(json_field "$SELF_PAIR" "error")
      [ -n "$SELF_ERR" ] && pass "FR15: Self-pairing correctly rejected (error: $SELF_ERR)" || fail "FR15: Self-pairing was NOT rejected! Response: $SELF_PAIR"
      
      # Test clearing partner (null)
      CLEAR_PARTNER=$(curl -s -X PUT "$BASE/registrations/$DOUB_REG_ID/partner" \
        -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
        -d '{"partnerId":null}')
      CLEAR_ERR=$(json_field "$CLEAR_PARTNER" "error")
      CLEAR_P=$(json_field "$CLEAR_PARTNER" "partnerId")
      [ -z "$CLEAR_ERR" ] && pass "FR15: Partner cleared (partnerId=$CLEAR_P)" || fail "FR15: Partner clear failed: $CLEAR_ERR"
    fi
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────
section "📊 Test Summary"
TOTAL=$((PASS + FAIL))
echo "  Total: $TOTAL | ✅ Passed: $PASS | ❌ Failed: $FAIL"
[ $FAIL -eq 0 ] && echo "  🎉 ALL TESTS PASSED!" || echo "  ⚠️  Some tests failed — see above"
[ $FAIL -gt 0 ] && exit 1 || exit 0
