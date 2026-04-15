# Render Deployment - Guía Completa

> **ℹ️ MONOREPO SETUP**  
> Este backend es parte de un monorepo con múltiples proyectos.  
> El Blueprint principal está en: **`/render.yaml`** (raíz del repositorio)  
>   
> Ver: `/RENDER-MONOREPO.md` para el setup completo del monorepo.

## 📋 Información General

Este backend está configurado para desplegarse en **Render**.

**Archivos de configuración:**
- **`/render.yaml`** - Master Blueprint en la raíz del repo (define todos los servicios)
- **`.env.render.example`** - Template de variables de entorno
- **`package.json`** - Scripts de build y start

**Stack tecnológico:**
- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Notifications**: Email (SMTP), Telegram Bot, Web Push

## 🎯 Plan FREE de Render

El plan gratuito incluye:
- ✅ 750 horas/mes de tiempo de ejecución
- ✅ PostgreSQL: 256 MB RAM, 1 GB storage, 90 días de retención
- ✅ SSL/TLS automático
- ✅ Deploy automático desde Git
- ⚠️ El servicio duerme tras 15 min de inactividad (tarda ~30s en despertar)
- ⚠️ Sin acceso externo directo a PostgreSQL (solo desde servicios Render)

## 🚀 Guía de Despliegue

### Método 1: Usando Blueprint (RECOMENDADO)

El archivo **`/render.yaml`** en la raíz del repo configura todo automáticamente:

1. **Crear cuenta en Render**
   - Ve a https://render.com
   - Regístrate con GitHub

2. **Habilitar Tennis en render.yaml**
   
   El servicio Tennis está comentado por defecto. Para habilitarlo:
   
   ```bash
   # Edita /render.yaml en la raíz del repositorio
   # Descomenta las secciones:
   #   - tennis-backend (service)
   #   - tennis-db (database)
   ```

3. **Nuevo Blueprint**
   - Dashboard → **New** → **Blueprint**
   - Selecciona tu repositorio GitHub: `TFG-Fabian-Gonzalez-Lence`
   - Render detectará automáticamente `/render.yaml` (en la raíz)
   - **Importante**: El Blueprint gestiona múltiples proyectos del monorepo

4. **Configurar variables secretas**
   
   Las siguientes variables **deben configurarse manualmente** en Render Dashboard → `tennis-backend` → Environment:

   ```bash
   # ━━━━ CORS - Tu frontend de GitHub Pages ━━━━
   CORS_ORIGIN=https://tu-usuario.github.io
   SOCKET_CORS_ORIGIN=https://tu-usuario.github.io
   APP_URL=https://tu-usuario.github.io
   
   # ━━━━ Email Configuration (SMTP) ━━━━
   # Opción 1: Gmail (recomendado para testing)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=tu-app-password  # ⚠️ Usa App Password, no tu contraseña normal
   EMAIL_FROM_NAME=Tennis Tournament Manager
   EMAIL_FROM_ADDRESS=tu-email@gmail.com
   
   # Opción 2: SendGrid (recomendado para producción)
   # EMAIL_HOST=smtp.sendgrid.net
   # EMAIL_PORT=587
   # EMAIL_USER=apikey
   # EMAIL_PASSWORD=tu-sendgrid-api-key
   
   # ━━━━ Telegram (OPCIONAL) ━━━━
   TELEGRAM_BOT_TOKEN=tu-bot-token  # Obtener de @BotFather
   TELEGRAM_ENABLED=true  # o false si no usas Telegram
   
   # ━━━━ Web Push (OPCIONAL) ━━━━
   # Generar con: npx web-push generate-vapid-keys
   WEB_PUSH_PUBLIC_KEY=tu-public-key
   WEB_PUSH_PRIVATE_KEY=tu-private-key
   WEB_PUSH_SUBJECT=mailto:tu-email@example.com
   WEB_PUSH_ENABLED=true  # o false si no usas Web Push
   ```

5. **Deploy**
   - Haz clic en **Apply**
   - Render creará:
     - Base de datos PostgreSQL (`tennis-db`)
     - Web service del backend (`tennis-backend`)
   - El primer deploy tarda ~5-10 minutos

### Método 2: Configuración Manual

Si prefieres no usar Blueprint:

1. **Crear PostgreSQL Database**
   - Dashboard → **New** → **PostgreSQL**
   - Name: `tennis-db`
   - Database: `tennis_tournament_manager`
   - Region: Frankfurt (o el más cercano)
   - Plan: **Free**

2. **Crear Web Service**
   - Dashboard → **New** → **Web Service**
   - Conecta tu repositorio GitHub
   - Configuración:
     ```
     Name: tennis-backend
     Region: Frankfurt (mismo que la DB)
     Branch: main
     Root Directory: projects/5-TennisTournamentManager/backend
     Runtime: Node
     Build Command: npm ci && npm run build
     Start Command: npm run db:migrate && npm start
     Plan: Free
     Health Check Path: /api/health
     ```

3. **Variables de entorno** (Environment tab):
   
   Copia todas las variables de `.env.render.example` y configura los valores.
   
   **Variables críticas:**
   ```bash
   NODE_ENV=production
   PORT=10000
   
   # Database (copiar Internal Database URL de tu PostgreSQL)
   DATABASE_URL=postgresql://...
   DB_SYNCHRONIZE=false  # ⚠️ IMPORTANTE: false en producción
   DB_SSL=true
   
   # JWT Secrets (generar con: openssl rand -base64 32)
   JWT_SECRET=your-generated-secret
   JWT_REFRESH_SECRET=your-generated-refresh-secret
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   # CORS
   CORS_ORIGIN=https://tu-usuario.github.io
   SOCKET_CORS_ORIGIN=https://tu-usuario.github.io
   APP_URL=https://tu-usuario.github.io
   
   # Email (configurar según tu proveedor)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=tu-app-password
   EMAIL_FROM_NAME=Tennis Tournament Manager
   
   # Opcionales
   LOG_LEVEL=info
   MAX_FILE_SIZE_MB=10
   SESSION_TIMEOUT_MINUTES=60
   ```

## 📧 Configurar Email (Gmail)

Para usar Gmail como servidor SMTP:

1. **Habilitar 2FA en tu cuenta Google**
   - Ve a https://myaccount.google.com/security
   - Activa "Verificación en 2 pasos"

2. **Generar App Password**
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Mail" y el dispositivo
   - Copia la contraseña generada (16 caracteres)
   - Úsala en `EMAIL_PASSWORD` (sin espacios)

3. **Configurar variables**
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # App Password (sin espacios)
   EMAIL_FROM_NAME=Tennis Tournament Manager
   EMAIL_FROM_ADDRESS=tu-email@gmail.com
   ```

## 🤖 Configurar Telegram Bot (Opcional)

1. **Crear Bot**
   - Abre Telegram y busca `@BotFather`
   - Envía `/newbot`
   - Sigue las instrucciones (nombre y username)
   - Copia el **token** que te da

2. **Configurar en Render**
   ```bash
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_ENABLED=true
   ```

3. **Uso**
   - Los usuarios pueden recibir notificaciones vinculando su cuenta de Telegram
   - El bot enviará actualizaciones de torneos, sorteos, resultados, etc.

## 🔔 Configurar Web Push (Opcional)

Para notificaciones PWA en el navegador:

1. **Generar VAPID Keys**
   ```bash
   # En tu máquina local
   npx web-push generate-vapid-keys
   ```

2. **Configurar en Render**
   ```bash
   WEB_PUSH_PUBLIC_KEY=BHgX...  # Public key del paso 1
   WEB_PUSH_PRIVATE_KEY=abc123...  # Private key del paso 1
   WEB_PUSH_SUBJECT=mailto:tu-email@example.com
   WEB_PUSH_ENABLED=true
   ```

3. **Actualizar Frontend**
   - Copia la `WEB_PUSH_PUBLIC_KEY` a tu frontend
   - Los usuarios podrán suscribirse a notificaciones push

## 🔄 Deploy Automático

Render se conecta a GitHub y despliega automáticamente:

- **Main branch**: Deploy en cada push
- **Pull Requests**: Preview deploys opcionales
- **Manual**: Botón "Manual Deploy" en el dashboard

## 📡 URL del Backend

Después del deploy, tu backend estará en:
```
https://tennis-backend.onrender.com
```

**Health check:**
```bash
curl https://tennis-backend.onrender.com/api/health
```

Debe devolver:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-15T...",
  "uptime": 123.45,
  "database": "connected"
}
```

## 🔍 Verificación Post-Deploy

1. **Comprobar servicio**
   ```bash
   curl https://tennis-backend.onrender.com/api/health
   ```

2. **Revisar logs**
   - Render Dashboard → `tennis-backend` → Logs
   - Busca errores de conexión a DB o configuración

3. **Probar API**
   ```bash
   # Crear un usuario de prueba
   curl -X POST https://tennis-backend.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
   ```

4. **Verificar WebSocket**
   - Abre la consola del navegador en tu frontend
   - Comprueba que Socket.IO se conecta correctamente

## 🐛 Troubleshooting

### El servicio no arranca

**Síntoma**: Build exitoso pero el servicio crashea al iniciar

**Solución**:
- Revisa los logs en Render Dashboard
- Verifica que `DATABASE_URL` esté configurada
- Comprueba que `DB_SYNCHRONIZE=false` en producción
- Asegúrate de que las migraciones se ejecuten: `npm run db:migrate`

### Errores de CORS

**Síntoma**: Frontend no puede conectar al backend

**Solución**:
```bash
# Verifica que estén configuradas:
CORS_ORIGIN=https://tu-usuario.github.io  # Sin barra al final
SOCKET_CORS_ORIGIN=https://tu-usuario.github.io
```

### Email no se envía

**Síntoma**: No llegan emails de notificación

**Solución**:
- Gmail: verifica que usas App Password (no tu contraseña normal)
- Verifica puerto: 587 para TLS, 465 para SSL
- Revisa logs para errores SMTP
- Prueba con: `EMAIL_SECURE=false` para puerto 587

### Database connection refused

**Síntoma**: Error al conectar a PostgreSQL

**Solución**:
- Verifica que `tennis-db` esté creada y running
- Copia la **Internal Database URL** (no la External)
- Formato: `postgresql://user:password@host:5432/tennis_tournament_manager`
- Asegúrate de que `DB_SSL=true`

### Service timeout / Cold starts lentos

**Síntoma**: El servicio tarda mucho en responder

**Solución**:
- Es normal en el plan FREE (duerme tras 15 min inactividad)
- Primer request tras dormir: ~30 segundos
- Considera usar un cron job para mantenerlo activo:
  ```bash
  # Herramientas como cron-job.org pueden hacer ping cada 14 min
  curl https://tennis-backend.onrender.com/api/health
  ```

## 📚 Documentación Adicional

- **Setup Monorepo**: [/RENDER-MONOREPO.md](../../../RENDER-MONOREPO.md)
- **Quick Start**: [QUICK-START-RENDER.md](./QUICK-START-RENDER.md)
- **Backend README**: [README.md](./README.md)

## 🔐 Seguridad en Producción

- ✅ Usa secretos fuertes para JWT (mínimo 32 caracteres)
- ✅ Nunca uses `DB_SYNCHRONIZE=true` en producción
- ✅ Configura CORS solo para tu dominio específico
- ✅ Usa App Passwords para Gmail (no contraseñas normales)
- ✅ Mantén las VAPID keys secretas
- ✅ Rota secretos periódicamente
- ✅ Monitoriza logs para actividad sospechosa

## 💡 Consejos de Optimización

1. **Database indexes**: Ya están en las migraciones TypeORM
2. **Rate limiting**: Configurado por defecto (1000 req/15min)
3. **Compression**: Habilitado via middleware
4. **Caching**: Considera Redis para sesiones (no incluido en plan FREE)
5. **CDN**: Usa GitHub Pages para assets estáticos del frontend

## 🎉 ¡Listo!

Tu backend de Tennis Tournament Manager está ahora desplegado y listo para usar.

**Next steps:**
1. Configura el frontend para apuntar a tu backend en Render
2. Prueba el flujo completo de autenticación
3. Crea un torneo de prueba
4. Verifica que las notificaciones funcionan

**¿Problemas?** Revisa la sección Troubleshooting o consulta los logs en Render Dashboard.
