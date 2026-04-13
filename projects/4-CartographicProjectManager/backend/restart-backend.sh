#!/bin/bash

set -euo pipefail

# Script rápido para reiniciar backend después de actualizar el token de Dropbox

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDFILE="${SCRIPT_DIR}/.dev-server.pid"

cd "$SCRIPT_DIR"

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

echo "🚀 Iniciando backend (npm run dev)..."
npm run dev > /dev/null 2>&1 &
echo $! > "$PIDFILE"

echo "✅ Backend reiniciado"
echo ""
echo "Espera 5 segundos y ejecuta:"
echo "  npx tsx test-dropbox-simple.ts"
