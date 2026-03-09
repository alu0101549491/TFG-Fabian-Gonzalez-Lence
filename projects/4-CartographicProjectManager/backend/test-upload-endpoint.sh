#!/bin/bash

# Script para probar upload de archivos con el endpoint real

set -euo pipefail

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Missing required command: $cmd" >&2
    exit 1
  fi
}

require_command curl
require_command jq

echo "🧪 Testing File Upload Endpoint"
echo "======================================="

# 1. Login y obtener token
echo "1️⃣ Logging in..."
LOGIN_BODY_FILE=$(mktemp)
LOGIN_STATUS=$(curl -sS -o "$LOGIN_BODY_FILE" -w "%{http_code}" -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cartographic.com","password":"admin123"}')

if [[ ! "$LOGIN_STATUS" =~ ^2 ]]; then
  echo "❌ Failed to login (HTTP $LOGIN_STATUS)" >&2
  cat "$LOGIN_BODY_FILE" >&2
  rm -f "$LOGIN_BODY_FILE"
  exit 1
fi

TOKEN=$(jq -r '.data.accessToken // .accessToken // empty' < "$LOGIN_BODY_FILE")
rm -f "$LOGIN_BODY_FILE"

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Failed to login"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:20}..."

# 2. Obtener primer proyecto
echo ""
echo "2️⃣ Getting project..."
PROJECT_BODY_FILE=$(mktemp)
PROJECT_STATUS=$(curl -sS -o "$PROJECT_BODY_FILE" -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/projects)

if [[ ! "$PROJECT_STATUS" =~ ^2 ]]; then
  echo "❌ Failed to get project list (HTTP $PROJECT_STATUS)" >&2
  cat "$PROJECT_BODY_FILE" >&2
  rm -f "$PROJECT_BODY_FILE"
  exit 1
fi

PROJECT_ID=$(jq -r '(.data // .projects // [])[0].id // empty' < "$PROJECT_BODY_FILE")
PROJECT_CODE=$(jq -r '(.data // .projects // [])[0].code // empty' < "$PROJECT_BODY_FILE")
rm -f "$PROJECT_BODY_FILE"

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
  echo "❌ Failed to get project"
  exit 1
fi

echo "✅ Project ID: $PROJECT_ID"
echo "✅ Project Code: $PROJECT_CODE"

# 3. Crear archivo de prueba
echo ""
echo "3️⃣ Creating test file..."
TEST_FILE="/tmp/test-upload-$(date +%s).pdf"
# Create a minimal valid PDF file
cat > $TEST_FILE << 'EOF'
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Count 1
/Kids [3 0 R]
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test File) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
434
%%EOF
EOF

echo "✅ Test PDF file created: $TEST_FILE"

# 4. Subir archivo
echo ""
echo "4️⃣ Uploading file..."
echo "   Endpoint: POST /api/v1/files/upload"
echo "   File: $TEST_FILE"
echo "   Project ID: $PROJECT_ID"
echo "   Section: Messages"
echo ""

UPLOAD_BODY_FILE=$(mktemp)
UPLOAD_STATUS=$(curl -sS -o "$UPLOAD_BODY_FILE" -w "%{http_code}" -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_FILE" \
  -F "projectId=$PROJECT_ID" \
  -F "section=Messages")

cat "$UPLOAD_BODY_FILE"
echo ""

# Check if successful
if [[ "$UPLOAD_STATUS" =~ ^2 ]]; then
  echo "✅ Upload successful!"
  
  # Parse file ID
  FILE_ID=$(jq -r '.data.file.id // .data.id // .file.id // .id // empty' < "$UPLOAD_BODY_FILE")
  
  if [ -n "$FILE_ID" ]; then
    echo "✅ File ID: $FILE_ID"
    
    # 5. Try to download
    echo ""
    echo "5️⃣ Getting download link..."
    DOWNLOAD_BODY_FILE=$(mktemp)
    DOWNLOAD_STATUS=$(curl -sS -o "$DOWNLOAD_BODY_FILE" -w "%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      http://localhost:3000/api/v1/files/$FILE_ID/download)

    if [[ "$DOWNLOAD_STATUS" =~ ^2 ]]; then
      jq . < "$DOWNLOAD_BODY_FILE"
    else
      echo "❌ Failed to get download link (HTTP $DOWNLOAD_STATUS)" >&2
      cat "$DOWNLOAD_BODY_FILE" >&2
    fi

    rm -f "$DOWNLOAD_BODY_FILE"
  fi
else
  echo "❌ Upload failed! (HTTP $UPLOAD_STATUS)" >&2
  cat "$UPLOAD_BODY_FILE" >&2
fi

rm -f "$UPLOAD_BODY_FILE"

# Cleanup
rm -f $TEST_FILE
echo ""
echo "======================================="
echo "✅ Test completed"
