# Render Deployment - Guía Completa

## 📋 Información General

Este backend está configurado para desplegarse en **Render** (alternativa gratuita a Railway).

**Archivos de configuración:**
- **`render.yaml`** - Blueprint de infraestructura (base de datos + web service)
- **`.env.render.example`** - Template de variables de entorno
- **`package.json`** - Scripts de build y start

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

El archivo `render.yaml` configura todo automáticamente:

1. **Crear cuenta en Render**
   - Ve a https://render.com
   - Regístrate con GitHub

2. **Nuevo Blueprint**
   - Dashboard → **New** → **Blueprint**
   - Selecciona tu repositorio GitHub
   - Render detectará automáticamente `render.yaml`

3. **Configurar variables secretas**
   
   Las siguientes variables **deben configurarse manualmente** (no están en `render.yaml` por seguridad):

   ```bash
   # En Render Dashboard → Environment
   
   # CORS - Tu frontend de GitHub Pages
   CORS_ORIGIN=https://tu-usuario.github.io
   SOCKET_CORS_ORIGIN=https://tu-usuario.github.io
   
   # Dropbox API (obtener con: npm run get-dropbox-token)
   DROPBOX_APP_KEY=tu_dropbox_app_key
   DROPBOX_APP_SECRET=tu_dropbox_app_secret
   DROPBOX_REFRESH_TOKEN=tu_dropbox_refresh_token
   ```

4. **Deploy**
   - Haz clic en **Apply**
   - Render creará:
     - Base de datos PostgreSQL
     - Web service del backend
   - El primer deploy tarda ~5-10 minutos

### Método 2: Configuración Manual

Si prefieres no usar Blueprint:

1. **Crear PostgreSQL Database**
   - Dashboard → **New** → **PostgreSQL**
   - Name: `carto-db`
   - Database: `cartographic_manager`
   - Region: Frankfurt (o el más cercano)
   - Plan: **Free**

2. **Crear Web Service**
   - Dashboard → **New** → **Web Service**
   - Conecta tu repositorio GitHub
   - Configuración:
     ```
     Name: carto-backend
     Region: Frankfurt (mismo que la DB)
     Branch: main
     Root Directory: projects/4-CartographicProjectManager/backend
     Runtime: Node
     Build Command: npm ci && npx prisma generate && npm run build && npm run build:seed
     Start Command: npx prisma migrate deploy && npm start
     Plan: Free
     ```

3. **Variables de entorno** (Environment tab):
   ```bash
   NODE_ENV=production
   PORT=10000
   API_VERSION=v1
   
   # Database (copiar Internal Database URL de tu PostgreSQL)
   DATABASE_URL=postgresql://...
   
   # JWT Secrets (generar con: openssl rand -base64 32)
   JWT_SECRET=your-generated-secret
   JWT_REFRESH_SECRET=your-generated-refresh-secret
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   # CORS
   CORS_ORIGIN=https://tu-usuario.github.io
   SOCKET_CORS_ORIGIN=https://tu-usuario.github.io
   
   # Dropbox
   DROPBOX_APP_KEY=tu_app_key
   DROPBOX_APP_SECRET=tu_app_secret
   DROPBOX_REFRESH_TOKEN=tu_refresh_token
   
   # Opcional
   LOG_LEVEL=info
   MAX_FILE_SIZE_MB=50
   SESSION_TIMEOUT_MINUTES=60
   ```

## 🔑 Obtener el Refresh Token de Dropbox

**Importante:** Debes generar el refresh token ANTES del deploy.

```bash
# En tu máquina local, dentro del directorio backend:
cd projects/4-CartographicProjectManager/backend
npm install
npm run get-dropbox-token
```

Sigue las instrucciones en la consola para autorizar la app y obtener el token.

## 🔄 Deploy Automático

Render se conecta a GitHub y despliega automáticamente:

- **Main branch**: Deploy en cada push
- **Pull Requests**: Preview deploys opcionales
- **Manual**: Botón "Manual Deploy" en el dashboard

## 📡 URL del Backend

Después del deploy, tu backend estará en:
```
https://carto-backend.onrender.com
```

**Health check:**
```bash
curl https://carto-backend.onrender.com/api/v1/health
```

## 🔐 Conectar con el Frontend

1. **Actualizar GitHub Secrets**
   
   En tu repositorio GitHub → Settings → Secrets → Actions:
   ```
   VITE_API_URL=https://carto-backend.onrender.com
   VITE_SOCKET_URL=https://carto-backend.onrender.com
   ```

2. **Redeployar frontend**
   
   GitHub Actions se ejecutará automáticamente en el próximo push.

## 🐛 Troubleshooting

### El servicio no arranca

1. Revisa los logs en Render Dashboard → Logs
2. Verifica que `DATABASE_URL` esté correctamente configurada
3. Comprueba que todas las variables de entorno estén presentes

### Error de Prisma

```bash
# Si hay problemas con migraciones:
# Render ejecuta: npx prisma migrate deploy
# Esto aplica migraciones pendientes automáticamente
```

### Base de datos no conecta

- Asegúrate de que `DATABASE_URL` usa la **Internal Database URL** de Render
- No uses la External URL (no funciona desde servicios Render)

### El servicio se duerme

- Es normal en el plan FREE
- Primera request tras 15 min de inactividad: ~30 segundos
- Solución: Upgrade a plan Starter ($7/mes) para "always on"

## 📊 Monitoreo

**Métricas disponibles en Render:**
- CPU y Memory usage
- Request logs
- Deploy history
- Database metrics

**Logs en tiempo real:**
```bash
# O usa el Render CLI
render logs -s carto-backend --tail
```

## 🔄 Migración desde Railway

Si ya tienes datos en Railway:

1. **Exportar datos de Railway PostgreSQL**
   ```bash
   # Conectar a Railway DB y exportar
   pg_dump $RAILWAY_DATABASE_URL > backup.sql
   ```

2. **Importar a Render**
   ```bash
   # Usar External Database URL (solo para mantenimiento)
   psql $RENDER_EXTERNAL_DATABASE_URL < backup.sql
   ```

3. **Actualizar frontend**
   - Cambiar secrets en GitHub Actions
   - Redeploy

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Render PostgreSQL](https://render.com/docs/databases)
- [Blueprint Spec](https://render.com/docs/blueprint-spec)

## ⚡ Diferencias Railway vs Render

| Característica | Railway | Render |
|----------------|---------|--------|
| Free tier      | $5 crédito inicial | 750h/mes ilimitado |
| Sleep timeout  | Configurable | 15 min (plan free) |
| Build command  | nixpacks/docker | Native builders |
| DB limit       | 500 MB | 1 GB |
| Cold start     | ~10-20s | ~30s |
| Logs retention | 7 días | 7 días |
| Custom domains | ✅ | ✅ |

## 🎉 Completado

Una vez configurado, Render desplegará automáticamente en cada push a `main`. ¡Tu backend estará listo para producción!
