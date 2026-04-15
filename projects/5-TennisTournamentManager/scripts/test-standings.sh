#!/bin/bash

# Test the tiebreaker system
echo "🧪 Testing Tiebreaker System (v1.72.0)"
echo "======================================="
echo ""

# Login and get token
echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ull.edu.es","password":"Admin123!"}' | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Logged in successfully"
echo ""

# Get tournaments
echo "📋 Fetching tournaments..."
TOURNAMENTS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/tournaments)
TOURNAMENT_ID=$(echo "$TOURNAMENTS" | jq -r '.[0].id // empty')

if [ -z "$TOURNAMENT_ID" ]; then
  echo "❌ No tournament found"
  exit 1
fi

TOURNAMENT_NAME=$(echo "$TOURNAMENTS" | jq -r '.[0].name')
echo "✅ Found tournament: $TOURNAMENT_NAME ($TOURNAMENT_ID)"
echo ""

# Get standings
echo "📊 Fetching standings..."
STANDINGS=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/standings/tournament/$TOURNAMENT_ID")

# Check if standings exist
STANDINGS_COUNT=$(echo "$STANDINGS" | jq 'length')
if [ "$STANDINGS_COUNT" = "0" ]; then
  echo "⚠️  No standings available yet. Complete some matches first."
  exit 0
fi

echo "✅ Found $STANDINGS_COUNT participants"
echo ""
echo "📊 STANDINGS TABLE"
echo "=================================================================================="
printf "%-5s %-25s %-4s %-4s %-4s %-12s %-14s %-6s\n" "Pos" "Participant" "MP" "W" "L" "Sets" "Games" "Points"
echo "=================================================================================="

echo "$STANDINGS" | jq -r '.[] | 
  "\(.position)|\(.participantName)|\(.matchesPlayed)|\(.matchesWon)|\(.matchesLost)|\(.setsWon)/\(.setsLost) (\(if .setDifference > 0 then "+" else "" end)\(.setDifference))|\(.gamesWon)/\(.gamesLost) (\(if .gameDifference > 0 then "+" else "" end)\(.gameDifference))|\(.points)"' | 
while IFS='|' read -r pos name mp w l sets games pts; do
  printf "%-5s %-25s %-4s %-4s %-4s %-12s %-14s %-6s\n" "$pos" "$name" "$mp" "$w" "$l" "$sets" "$games" "$pts"
done

echo "=================================================================================="
echo ""

# Check for ties
echo "🔍 Analyzing tiebreakers..."
TIES=$(echo "$STANDINGS" | jq -r 'group_by(.points) | .[] | select(length > 1) | 
  "⚠️  TIE: \(length) participants with \(.[0].points) points"')

if [ -z "$TIES" ]; then
  echo "✅ No ties detected - all participants have unique point totals"
else
  echo "$TIES"
  echo ""
  echo "Tied participants (showing ratios):"
  echo "$STANDINGS" | jq -r 'group_by(.points) | .[] | select(length > 1) | .[] |
    "   \(.position). \(.participantName) - Set Ratio: \(if .setsLost == 0 then "∞" else (.setsWon / .setsLost | tostring) end), Game Ratio: \(if .gamesLost == 0 then "∞" else (.gamesWon / .gamesLost | tostring) end)"'
fi

echo ""
echo "✅ Test complete!"
