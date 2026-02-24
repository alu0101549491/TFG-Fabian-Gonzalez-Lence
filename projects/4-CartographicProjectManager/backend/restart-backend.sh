#!/bin/bash

# Script rápido para reiniciar backend después de actualizar el token de Dropbox

echo "🔄 Reiniciando backend..."
pkill -9 node 2>/dev/null
sleep 2
cd /home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/backend
npm run dev &
echo "✅ Backend reiniciado"
echo ""
echo "Espera 5 segundos y ejecuta:"
echo "  npx tsx test-dropbox-simple.ts"
