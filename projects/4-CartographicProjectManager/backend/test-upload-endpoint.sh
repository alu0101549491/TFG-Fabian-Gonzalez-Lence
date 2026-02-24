#!/bin/bash

# Script para probar upload de archivos con el endpoint real

echo "🧪 Testing File Upload Endpoint"
echo "======================================="

# 1. Login y obtener token
echo "1️⃣ Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cartographic.com","password":"admin123"}' \
  | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Failed to login"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:20}..."

# 2. Obtener primer proyecto
echo ""
echo "2️⃣ Getting project..."
PROJECT=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/projects)

PROJECT_ID=$(echo $PROJECT | jq -r '.projects[0].id')
PROJECT_CODE=$(echo $PROJECT | jq -r '.projects[0].code')

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
  echo "❌ Failed to get project"
  exit 1
fi

echo "✅ Project ID: $PROJECT_ID"
echo "✅ Project Code: $PROJECT_CODE"

# 3. Crear archivo de prueba
echo ""
echo "3️⃣ Creating test file..."
TEST_FILE="/tmp/test-upload-$(date +%s).txt"
echo "Este es un archivo de prueba para Dropbox" > $TEST_FILE
echo "Fecha: $(date)" >> $TEST_FILE
echo "Proyecto: $PROJECT_CODE" >> $TEST_FILE

echo "✅ Test file created: $TEST_FILE"

# 4. Subir archivo
echo ""
echo "4️⃣ Uploading file..."
echo "   Endpoint: POST /api/v1/files/upload"
echo "   File: $TEST_FILE"
echo "   Project ID: $PROJECT_ID"
echo "   Section: Messages"
echo ""

RESPONSE=$(curl -v -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_FILE" \
  -F "projectId=$PROJECT_ID" \
  -F "section=Messages" \
  2>&1)

echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q "200\|201"; then
  echo "✅ Upload successful!"
  
  # Parse file ID
  FILE_ID=$(echo "$RESPONSE" | grep -oP '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$FILE_ID" ]; then
    echo "✅ File ID: $FILE_ID"
    
    # 5. Try to download
    echo ""
    echo "5️⃣ Getting download link..."
    DOWNLOAD=$(curl -s \
      -H "Authorization: Bearer $TOKEN" \
      http://localhost:3000/api/v1/files/$FILE_ID/download)
    
    echo "$DOWNLOAD" | jq
  fi
else
  echo "❌ Upload failed!"
  echo ""
  echo "Response details:"
  echo "$RESPONSE" | grep -A 20 "< HTTP"
fi

# Cleanup
rm -f $TEST_FILE
echo ""
echo "======================================="
echo "✅ Test completed"
