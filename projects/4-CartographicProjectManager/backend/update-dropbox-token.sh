#!/bin/bash

set -euo pipefail

# Script para actualizar token de Dropbox y probar la integración

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDFILE="${SCRIPT_DIR}/.dev-server.pid"

cd "$SCRIPT_DIR"

echo "============================================"
echo "🔐 Actualizar Token de Dropbox"
echo "============================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encuentra el archivo .env"
    echo "   Ejecuta este script desde el directorio backend"
    exit 1
fi

echo "📝 Instrucciones:"
echo ""
echo "1. Ve a: https://www.dropbox.com/developers/apps"
echo "2. Selecciona tu app"
echo "3. Pestaña 'Permissions' → Activa:"
echo "   ✅ files.content.write"
echo "   ✅ files.content.read"
echo "   ✅ files.metadata.write"
echo "   ✅ files.metadata.read"
echo "   ✅ sharing.write"
echo "4. Click 'Submit'"
echo "5. Pestaña 'Settings' → OAuth 2 → Click 'Generate'"
echo "6. Copia el nuevo token"
echo ""
echo "============================================"
echo ""

# Pedir el nuevo token
read -p "Pega aquí el NUEVO token de Dropbox: " NEW_TOKEN

if [ -z "$NEW_TOKEN" ]; then
    echo "❌ Error: No se proporcionó ningún token"
    exit 1
fi

# Validar que parece un token de Dropbox
if [[ ! $NEW_TOKEN =~ ^sl\. ]]; then
    echo "⚠️  Advertencia: El token no parece válido (debería empezar con 'sl.')"
    read -p "¿Continuar de todos modos? (s/n): " CONTINUE
    if [ "$CONTINUE" != "s" ]; then
        exit 1
    fi
fi

echo ""
echo "📝 Actualizando .env..."

# Hacer backup del .env
cp .env .env.backup
echo "✅ Backup creado: .env.backup"

# Actualizar el token en el .env
sed -i "s|^DROPBOX_ACCESS_TOKEN=.*|DROPBOX_ACCESS_TOKEN=$NEW_TOKEN|" .env
echo "✅ Token actualizado en .env"

echo ""
echo "🔄 Reiniciando backend..."

if [ -f "$PIDFILE" ]; then
    OLD_PID="$(cat "$PIDFILE" || true)"
    if [ -n "${OLD_PID}" ] && kill -0 "$OLD_PID" 2>/dev/null; then
        echo "🛑 Deteniendo backend anterior (PID: $OLD_PID)"
        kill "$OLD_PID" 2>/dev/null || true
        sleep 1
    fi
    rm -f "$PIDFILE"
fi

# Iniciar backend en background
npm run dev > /dev/null 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$PIDFILE"

echo "✅ Backend iniciado (PID: $BACKEND_PID)"
echo "⏳ Esperando 5 segundos para que el backend arranque..."
sleep 5

echo ""
echo "🧪 Probando integración de Dropbox..."
echo "============================================"
npx tsx test-dropbox-simple.ts

echo ""
echo "============================================"
echo "✅ Proceso completado"
echo "============================================"
echo ""
echo "Comandos útiles:"
echo "  - Ver logs del backend: fg"
echo "  - Detener backend: kill \"\$(cat .dev-server.pid)\""
echo "  - Reiniciar backend: ./restart-backend.sh"
echo "  - Probar Dropbox de nuevo: npx tsx test-dropbox-simple.ts"
