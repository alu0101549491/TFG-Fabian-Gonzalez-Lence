#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@tennistournament.com","password":"admin123"}' | jq -r '.token')

echo "=== Tournament Details ==="
TOURNAMENT_ID=$(curl -s -X GET http://localhost:3000/api/tournaments -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')
echo "Tournament ID: $TOURNAMENT_ID"

curl -s -X GET "http://localhost:3000/api/tournaments/$TOURNAMENT_ID" -H "Authorization: Bearer $TOKEN" | jq '{name, status, maxParticipants, tournamentType}'

echo -e "\n=== Test Players (should show 8) ==="
curl -s -X GET http://localhost:3000/api/users -H "Authorization: Bearer $TOKEN" | jq '[.[] | select(.email | contains("@test.com"))] | length'

echo -e "\n✅ Your tournament is ready at:"
echo "http://localhost:4201/tournaments/$TOURNAMENT_ID/bracket"
