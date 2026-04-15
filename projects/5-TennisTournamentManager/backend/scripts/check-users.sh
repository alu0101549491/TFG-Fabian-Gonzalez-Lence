#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tennistournament.com","password":"admin123"}' | jq -r '.token')

echo "Current users in database:"
echo "=========================="
curl -s -X GET "http://localhost:3000/api/users" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {email: .email, firstName: .firstName, lastName: .lastName, role: .role}'
