#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@tennistournament.com","password":"admin123"}' | jq -r '.token')
echo "=== Users Count ==="
curl -s -X GET http://localhost:3000/api/users -H "Authorization: Bearer $TOKEN" | jq 'length'
echo "=== Tournaments Count ==="
curl -s -X GET http://localhost:3000/api/tournaments -H "Authorization: Bearer $TOKEN" | jq 'length'
