# 🚀 Deployment en Render - Resumen Rápido

>  **ℹ️ MONOREPO SETUP**  
> Este repo contiene múltiples backends (CARTO + TENNIS).  
> Blueprint principal: **`/render.yaml`** (raíz del repo)  
> Guía completa del monorepo: **`/RENDER-MONOREPO.md`**

## ✅ Archivos de Configuración

### Configuración Principal
- **`/render.yaml`** - Master Blueprint en la raíz (gestiona CARTO + TENNIS)
- **`/RENDER-MONOREPO.md`** - Guía del setup multi-proyecto
- **`backend/.env.render.example`** - Template de variables de entorno
- **`.gitignore`** - Actualizado para excluir `.env*`

### Documentación
- **`RENDER.md`** - Guía completa de deployment en Render
- **`README.md`** - Información general del backend

## 🎯 Próximos Pasos

### 1. Habilitar Tennis en render.yaml

```bash
# Edita el archivo /render.yaml en la raíz del repositorio
# Descomenta las secciones tennis-backend y tennis-db
```

### 2. Configurar Email (Gmail recomendado para testing)

**Opción A: Gmail**
1. Ve a https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"
3. Ve a https://myaccount.google.com/apppasswords
4. Genera una App Password para "Mail"
5. Guarda el token de 16 caracteres (lo necesitarás en Render)

**Opción B: SendGrid** (más apropiado para producción)
1. Crea cuenta en https://sendgrid.com (plan FREE incluye 100 emails/día)
2. Genera API Key en Settings → API Keys
3. Verifica tu dominio o email
4. Guarda la API key

### 3. (Opcional) Generar VAPID Keys para Web Push

```bash
# Solo si quieres notificaciones push en el navegador
npx web-push generate-vapid-keys

# Guarda ambas keys (public y private)
```

### 4. (Opcional) Crear Telegram Bot

Si quieres notificaciones por Telegram:
1. Abre Telegram, busca `@BotFather`
2. Envía `/newbot` y sigue las instrucciones
3. Guarda el token que te da

### 5. Commit de archivos

```bash
# Desde la raíz del repositorio
git add render.yaml \
        projects/5-TennisTournamentManager/backend/.env.render.example \
        projects/5-TennisTournamentManager/backend/RENDER.md \
        projects/5-TennisTournamentManager/backend/QUICK-START-RENDER.md

git commit -m "Add Render deployment configuration for Tennis backend"
git push origin main
```

### 6. Deploy en Render

#### Opción A: Blueprint (RECOMENDADO)
1. Ve a https://render.com y crea cuenta (usa GitHub)
2. Dashboard → **New** → **Blueprint**
3. Selecciona el repositorio `TFG-Fabian-Gonzalez-Lence`
4. Render detectará `/render.yaml` en la raíz del repo
5. Click **Apply** (creará automáticamente DB + Backend)

**Nota**: El Blueprint gestiona múltiples proyectos. Si ya tienes CARTO desplegado, esto añadirá Tennis sin afectarlo.

#### Opción B: Manual
Sigue las instrucciones detalladas en `RENDER.md`.

### 7. Configurar variables secretas

En Render Dashboard → `tennis-backend` → Environment, añade:

#### MÍNIMO REQUERIDO:

```bash
# Frontend URLs (reemplaza con tu GitHub Pages URL)
CORS_ORIGIN=https://TU-USUARIO.github.io
SOCKET_CORS_ORIGIN=https://TU-USUARIO.github.io
APP_URL=https://TU-USUARIO.github.io

# Email - Opción Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # App Password (sin espacios)
EMAIL_FROM_NAME=Tennis Tournament Manager
EMAIL_FROM_ADDRESS=tu-email@gmail.com

# Email - Opción SendGrid (alternativa)
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASSWORD=SG.tu-api-key-aqui
# EMAIL_FROM_ADDRESS=tu-email-verificado@example.com
```

#### OPCIONAL (solo si usas estas features):

```bash
# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ENABLED=true

# Web Push
WEB_PUSH_PUBLIC_KEY=BHgX...
WEB_PUSH_PRIVATE_KEY=abc123...
WEB_PUSH_SUBJECT=mailto:tu-email@example.com
WEB_PUSH_ENABLED=true
```

**Nota**: Las siguientes variables se auto-generan (NO configurarlas manualmente):
- `DATABASE_URL` (vinculada de tennis-db)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` (generadas por Render)
- `PORT` (siempre 10000)

### 8. Verificar deployment

Una vez termine el deploy (~5-10 min):

```bash
# Reemplaza con tu URL de Render
curl https://tennis-backend.onrender.com/api/health
```

Debe responder:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-15T...",
  "uptime": 123.45,
  "database": "connected"
}
```

### 9. Actualizar frontend

Si usas GitHub Actions para el frontend:

**GitHub → Settings → Secrets → Actions:**

```
VITE_API_URL=https://tennis-backend.onrender.com
VITE_SOCKET_URL=https://tennis-backend.onrender.com
```

O si tienes un archivo de configuración en el frontend, actualiza las URLs allí.

Luego redeploy del frontend con un push a main.

### 10. Probar el sistema

1. **Registro de usuario:**
   ```bash
   curl -X POST https://tennis-backend.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!",
       "name": "Test User",
       "role": "player"
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST https://tennis-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!"
     }'
   ```

3. **Probar notificaciones:**
   - Crea un torneo desde el frontend
   - Verifica que lleguen emails a los usuarios registrados
   - Si configuraste Telegram, vincula tu cuenta y prueba las notificaciones

## 📚 Documentación

- **Guía completa**: [RENDER.md](./RENDER.md) - Deployment detallado con troubleshooting
- **Monorepo**: [/RENDER-MONOREPO.md](../../../RENDER-MONOREPO.md) - Gestión multi-proyecto
- **Backend**: [README.md](./README.md) - Arquitectura y desarrollo local

## 🆘 Problemas Comunes

### ❌ Servicio no arranca
**Solución**: Revisa logs en Render Dashboard. Verifica que `DB_SYNCHRONIZE=false`.

### ❌ Errores de CORS
**Solución**: 
```bash
# En Render, verifica (sin barra al final):
CORS_ORIGIN=https://tu-usuario.github.io
```

### ❌ Emails no se envían
**Solución Gmail**: 
- Usa App Password (no tu contraseña normal)
- Verifica `EMAIL_PORT=587` y `EMAIL_SECURE=false`

**Solución SendGrid**:
- Verifica tu dominio/email en SendGrid
- Comprueba que la API key sea válida

### ❌ Database connection refused
**Solución**: 
- Usa la **Internal Database URL** (no External)
- Verifica que `DB_SSL=true`

### ❌ Service sleeps (plan FREE)
**Explicación**: Normal tras 15 min de inactividad. Primer request tarda ~30s.

**Workaround**:
- Usa cron-job.org para hacer ping cada 14 min (mantiene activo)
- O acepta el cold start (apropiado para la mayoría de casos)

## ✨ Ventajas de Render FREE

- ✅ 750 horas/mes (suficiente para 1 servicio 24/7)
- ✅ PostgreSQL 1 GB incluido
- ✅ SSL/TLS automático
- ✅ Deploy automático desde Git
- ✅ **Completamente gratis** (ideal para TFG/portfolio)

## 🎯 Configuración por Features

### Mínimo viable (sin notificaciones avanzadas):
```bash
CORS_ORIGIN=...
SOCKET_CORS_ORIGIN=...
APP_URL=...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=...
EMAIL_PASSWORD=...
```

### Con Telegram:
Añade: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ENABLED=true`

### Con Web Push:
Añade: `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, `WEB_PUSH_ENABLED=true`

### Producción completa:
Todas las anteriores + usar SendGrid para email

## 🎉 ¡Listo!

Tu backend de Tennis Tournament Manager estará en producción en ~15 minutos siguiendo estos pasos.

**URL final**: `https://tennis-backend.onrender.com`

**¿Dudas?** Consulta la [guía completa](./RENDER.md) o los logs en Render Dashboard.
