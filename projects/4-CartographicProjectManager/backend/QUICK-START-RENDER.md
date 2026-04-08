# 🚀 Migración a Render - Resumen

> **ℹ️ MONOREPO SETUP**  
> Este repo contiene múltiples backends (CARTO + TENNIS).  
> Blueprint principal: **`/render.yaml`** (raíz del repo)  
> Guía completa del monorepo: **`/RENDER-MONOREPO.md`**

## ✅ Archivos Creados

Se han creado los siguientes archivos:

### Configuración Principal
- **`/render.yaml`** - Master Blueprint en la raíz (gestiona CARTO + TENNIS)
- **`/RENDER-MONOREPO.md`** - Guía del setup multi-proyecto
- **`backend/render.yaml`** - Deprecated (referencia el de la raíz)
- **`backend/.env.render.example`** - Template de variables de entorno
- **`.gitignore`** - Actualizado para incluir `.env.render`

### Documentación
- **`RENDER.md`** - Guía completa de deployment en Render
- **`MIGRATION-CHECKLIST.md`** - Checklist paso a paso para migrar
- **`RAILWAY-VS-RENDER.md`** - Comparación detallada entre plataformas
- **`README.md`** - Actualizado con sección de deployment

### Scripts
- **`verify-render-setup.sh`** - Script de verificación pre-deploy

## 🎯 Próximos Pasos

### 1. Verificar configuración
```bash
cd projects/4-CartographicProjectManager/backend
./verify-render-setup.sh
```

### 2. Generar Dropbox Refresh Token (si aún no lo has hecho)
```bash
npm run get-dropbox-token
```
Guarda el token que aparece en la consola - lo necesitarás en Render.

### 3. Commit de archivos
```bash
# Desde la raíz del repositorio
git add render.yaml RENDER-MONOREPO.md \
        projects/4-CartographicProjectManager/backend/RENDER.md \
        projects/4-CartographicProjectManager/backend/.env.render.example \
        projects/4-CartographicProjectManager/backend/MIGRATION-CHECKLIST.md \
        projects/4-CartographicProjectManager/backend/RAILWAY-VS-RENDER.md \
        projects/4-CartographicProjectManager/backend/README.md \
        projects/4-CartographicProjectManager/backend/.gitignore \
        projects/4-CartographicProjectManager/backend/verify-render-setup.sh \
        projects/4-CartographicProjectManager/vite.config.ts \
        projects/4-CartographicProjectManager/docs/deployment/UPDATE-FRONTEND-FOR-RENDER.md

git commit -m "Add Render deployment configuration"
git push origin main
```

### 4. Deploy en Render

#### Opción A: Blueprint (RECOMENDADO)
1. Ve a https://render.com y crea cuenta (usa GitHub)
2. Dashboard → **New** → **Blueprint**
3. Selecciona el repositorio `TFG-Fabian-Gonzalez-Lence`
4. Render detectará `/render.yaml` en la raíz del repo
5. Click **Apply**

**Nota**: El Blueprint gestiona múltiples proyectos. Solo CARTO se desplegará (TENNIS está comentado).

#### Opción B: Manual
Sigue las instrucciones en `RENDER.md` para configuración manual.

### 5. Configurar variables secretas

En Render Dashboard → `carto-backend` → Environment, añade:

```bash
# Frontend URLs (reemplaza con tu GitHub Pages)
CORS_ORIGIN=https://TU-USUARIO.github.io
SOCKET_CORS_ORIGIN=https://TU-USUARIO.github.io

# Dropbox (del paso 2)
DROPBOX_APP_KEY=tu_app_key
DROPBOX_APP_SECRET=tu_app_secret
DROPBOX_REFRESH_TOKEN=tu_refresh_token
```

### 6. Verificar deployment

Una vez termine el deploy (~5-10 min):

```bash
# Reemplaza con tu URL de Render
curl https://carto-backend.onrender.com/api/v1/health
```

Debe responder con `{"status":"healthy",...}`

### 7. Actualizar frontend

En GitHub → Settings → Secrets → Actions:

```
VITE_API_URL=https://carto-backend.onrender.com
VITE_SOCKET_URL=https://carto-backend.onrender.com
```

Luego redeploy del frontend con un push a main.

## 📚 Documentación

- **Setup Monorepo**: [/RENDER-MONOREPO.md](../../../RENDER-MONOREPO.md) - Gestión multi-proyecto
- **Guía completa CARTO**: [RENDER.md](./RENDER.md)
- **Checklist detallado**: [MIGRATION-CHECKLIST.md](./MIGRATION-CHECKLIST.md)
- **Comparación Railway vs Render**: [RAILWAY-VS-RENDER.md](./RAILWAY-VS-RENDER.md)

## 🆘 Ayuda

Si algo no funciona:
1. Revisa los logs en Render Dashboard → Logs
2. Consulta la sección Troubleshooting en `RENDER.md`
3. Verifica que todas las variables de entorno estén configuradas
4. Comprueba que `DATABASE_URL` se haya auto-generado

## ✨ Ventajas de Render FREE

- ✅ 750 horas/mes (prácticamente ilimitado)
- ✅ PostgreSQL 1 GB incluido
- ✅ SSL/TLS automático
- ✅ Deploy automático desde Git
- ✅ **Completamente gratis** (perfecto para tu TFG)

## 🎉 ¡Listo!

Tu backend estará en producción en Render en ~15 minutos siguiendo estos pasos.

**¿Dudas?** Consulta los archivos de documentación creados.
