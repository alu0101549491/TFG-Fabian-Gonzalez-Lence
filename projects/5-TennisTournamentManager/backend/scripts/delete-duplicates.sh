#!/bin/bash

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tennistournament.com","password":"admin123"}' | jq -r '.token')

echo "Token obtained: ${TOKEN:0:20}..."

# Delete duplicate tournaments (keeping trn_df229b1e)
echo "Deleting duplicate tournaments..."

curl -s -X DELETE "http://localhost:3000/api/tournaments/trn_8feb842f" -H "Authorization: Bearer $TOKEN"
echo "✅ Deleted trn_8feb842f"

curl -s -X DELETE "http://localhost:3000/api/tournaments/trn_4398477f" -H "Authorization: Bearer $TOKEN"
echo "✅ Deleted trn_4398477f"

curl -s -X DELETE "http://localhost:3000/api/tournaments/trn_2d24684a" -H "Authorization: Bearer $TOKEN"
echo "✅ Deleted trn_2d24684a"

curl -s -X DELETE "http://localhost:3000/api/tournaments/trn_1c7d276e" -H "Authorization: Bearer $TOKEN"
echo "✅ Deleted trn_1c7d276e"

curl -s -X DELETE "http://localhost:3000/api/tournaments/trn_9a633b00" -H "Authorization: Bearer $TOKEN"
echo "✅ Deleted trn_9a633b00"

echo ""
echo "✅ Cleanup complete! Kept tournament trn_df229b1e"
echo "🌐 View at: http://localhost:4201/tournaments/trn_df229b1e/bracket"
