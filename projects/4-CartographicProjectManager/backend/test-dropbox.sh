#!/bin/bash

# Test Dropbox Integration
# Este script prueba la integración de Dropbox en el backend

echo "======================================"
echo "🧪 Dropbox Integration Test"
echo "======================================"
echo ""

# 1. Verificar que el backend está corriendo
echo "1️⃣  Verificando que el backend está activo..."
HEALTH_CHECK=$(curl -s http://localhost:3000/api/v1/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Backend corriendo correctamente"
    echo "   Respuesta: $HEALTH_CHECK"
else
    echo "❌ Error: El backend no está corriendo"
    echo "   Ejecuta: npm run dev en el directorio backend"
    exit 1
fi
echo ""

# 2. Login para obtener token
echo "2️⃣  Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cartography.com","password":"REDACTED"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener el token de autenticación"
    echo "   Respuesta: $LOGIN_RESPONSE"
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
PROJECTS=$(curl -s -X GET http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN")

PROJECT_ID=$(echo $PROJECTS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

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
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_FILE" \
  -F "projectId=$PROJECT_ID" \
  -F "section=Messages")

echo "Respuesta del servidor:"
echo "$UPLOAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_RESPONSE"
echo ""

# Verificar si el upload fue exitoso
if echo "$UPLOAD_RESPONSE" | grep -q '"success":true'; then
    echo "✅ ¡Archivo subido exitosamente a Dropbox!"
    
    FILE_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    
    if [ ! -z "$FILE_ID" ]; then
        echo ""
        echo "6️⃣  Probando descarga del archivo..."
        DOWNLOAD_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/v1/files/$FILE_ID/download" \
          -H "Authorization: Bearer $TOKEN")
        
        if echo "$DOWNLOAD_RESPONSE" | grep -q 'downloadUrl'; then
            echo "✅ Link de descarga generado correctamente"
            DOWNLOAD_URL=$(echo $DOWNLOAD_RESPONSE | grep -o '"downloadUrl":"[^"]*' | cut -d'"' -f4)
            echo "   URL: ${DOWNLOAD_URL:0:80}..."
        else
            echo "⚠️  No se pudo generar el link de descarga"
        fi
    fi
else
    echo "❌ Error al subir archivo"
    
    # Verificar si es problema de Dropbox token
    if echo "$UPLOAD_RESPONSE" | grep -q "not configured"; then
        echo ""
        echo "💡 El servicio de Dropbox no está configurado"
        echo "   Verifica que DROPBOX_ACCESS_TOKEN esté en el archivo .env"
    fi
fi

# Limpiar archivo temporal
rm -f $TEST_FILE

echo ""
echo "======================================"
echo "✅ Test completado"
echo "======================================"
