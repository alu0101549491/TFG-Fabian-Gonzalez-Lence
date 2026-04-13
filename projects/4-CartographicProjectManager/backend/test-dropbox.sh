#!/bin/bash

# Test Dropbox Integration
# Este script prueba la integración de Dropbox en el backend

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

echo "======================================"
echo "🧪 Dropbox Integration Test"
echo "======================================"
echo ""

# 1. Verificar que el backend está corriendo
echo "1️⃣  Verificando que el backend está activo..."
HEALTH_BODY_FILE=$(mktemp)
HEALTH_STATUS=$(curl -sS -o "$HEALTH_BODY_FILE" -w "%{http_code}" http://localhost:3000/api/v1/health 2>/dev/null || true)
if [[ "$HEALTH_STATUS" =~ ^2 ]]; then
    echo "✅ Backend corriendo correctamente"
    echo -n "   Respuesta: "
    cat "$HEALTH_BODY_FILE"
else
    echo "❌ Error: El backend no está corriendo"
    echo "   Ejecuta: npm run dev en el directorio backend"
    rm -f "$HEALTH_BODY_FILE"
    exit 1
fi
rm -f "$HEALTH_BODY_FILE"
echo ""

# 2. Login para obtener token
echo "2️⃣  Obteniendo token de autenticación..."
LOGIN_BODY_FILE=$(mktemp)
LOGIN_STATUS=$(curl -sS -o "$LOGIN_BODY_FILE" -w "%{http_code}" -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
    -d '{"email":"admin@cartographic.com","password":"REDACTED"}')

if [[ ! "$LOGIN_STATUS" =~ ^2 ]]; then
    echo "❌ Error: No se pudo autenticar (HTTP $LOGIN_STATUS)" >&2
    cat "$LOGIN_BODY_FILE" >&2
    rm -f "$LOGIN_BODY_FILE"
    exit 1
fi

TOKEN=$(jq -r '.data.accessToken // .accessToken // empty' < "$LOGIN_BODY_FILE")
rm -f "$LOGIN_BODY_FILE"

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener el token de autenticación"
    echo ""
    echo "   Asegúrate de que existe el usuario admin en la base de datos:"
    echo "   cd backend && npm run prisma:seed"
    exit 1
fi

echo "✅ Token obtenido correctamente"
echo "   Token: ${TOKEN:0:50}..."
echo ""

# 3. Crear un archivo de prueba
echo "3️⃣  Creando archivo de prueba..."
TEST_FILE="/tmp/dropbox_test_$(date +%s).txt"
echo "Este es un archivo de prueba para Dropbox" > $TEST_FILE
echo "Fecha: $(date)" >> $TEST_FILE
echo "Proyecto: Cartographic Project Manager" >> $TEST_FILE
echo "✅ Archivo creado: $TEST_FILE"
echo ""

# 4. Obtener un proyecto para asociar el archivo
echo "4️⃣  Obteniendo lista de proyectos..."
PROJECTS_BODY_FILE=$(mktemp)
PROJECTS_STATUS=$(curl -sS -o "$PROJECTS_BODY_FILE" -w "%{http_code}" -X GET http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN")

if [[ ! "$PROJECTS_STATUS" =~ ^2 ]]; then
    echo "❌ Error: No se pudo obtener la lista de proyectos (HTTP $PROJECTS_STATUS)" >&2
    cat "$PROJECTS_BODY_FILE" >&2
    rm -f "$PROJECTS_BODY_FILE"
    exit 1
fi

PROJECT_ID=$(jq -r '(.data // .projects // [])[0].id // empty' < "$PROJECTS_BODY_FILE")
rm -f "$PROJECTS_BODY_FILE"

if [ -z "$PROJECT_ID" ]; then
    echo "⚠️  No hay proyectos en la base de datos"
    echo "   Se usará un ID de proyecto de prueba"
    PROJECT_ID="test-project-id"
else
    echo "✅ Proyecto encontrado: $PROJECT_ID"
fi
echo ""

# 5. Subir archivo a Dropbox
echo "5️⃣  Subiendo archivo a Dropbox..."
UPLOAD_BODY_FILE=$(mktemp)
UPLOAD_STATUS=$(curl -sS -o "$UPLOAD_BODY_FILE" -w "%{http_code}" -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_FILE" \
  -F "projectId=$PROJECT_ID" \
  -F "section=Messages")

echo "Respuesta del servidor:"
jq . < "$UPLOAD_BODY_FILE" 2>/dev/null || cat "$UPLOAD_BODY_FILE"
echo ""

# Verificar si el upload fue exitoso
if [[ "$UPLOAD_STATUS" =~ ^2 ]]; then
    echo "✅ ¡Archivo subido exitosamente a Dropbox!"

    FILE_ID=$(jq -r '.data.file.id // .data.id // .file.id // .id // empty' < "$UPLOAD_BODY_FILE")
    
    if [ -n "$FILE_ID" ]; then
        echo ""
        echo "6️⃣  Probando descarga del archivo..."
        DOWNLOAD_BODY_FILE=$(mktemp)
        DOWNLOAD_STATUS=$(curl -sS -o "$DOWNLOAD_BODY_FILE" -w "%{http_code}" -X GET "http://localhost:3000/api/v1/files/$FILE_ID/download" \
          -H "Authorization: Bearer $TOKEN")

        if [[ "$DOWNLOAD_STATUS" =~ ^2 ]]; then
            echo "✅ Link de descarga generado correctamente"
            DOWNLOAD_URL=$(jq -r '.data.downloadUrl // .downloadUrl // empty' < "$DOWNLOAD_BODY_FILE")
            if [ -n "$DOWNLOAD_URL" ]; then
                echo "   URL: ${DOWNLOAD_URL:0:80}..."
            else
                echo "⚠️  Respuesta sin downloadUrl"
            fi
        else
            echo "⚠️  No se pudo generar el link de descarga"
        fi

        rm -f "$DOWNLOAD_BODY_FILE"
    fi
else
    echo "❌ Error al subir archivo"
    
    # Verificar si es problema de Dropbox token
    if grep -qi "not configured" "$UPLOAD_BODY_FILE"; then
        echo ""
        echo "💡 El servicio de Dropbox no está configurado"
        echo "   Verifica que DROPBOX_ACCESS_TOKEN esté en el archivo .env"
    fi
fi

rm -f "$UPLOAD_BODY_FILE"

# Limpiar archivo temporal
rm -f $TEST_FILE

echo ""
echo "======================================"
echo "✅ Test completado"
echo "======================================"
