# 🏗️ Render Deployment - Monorepo Setup

## 📋 Overview

Este repositorio es un **monorepo** que contiene múltiples proyectos TFG. Render está configurado para desplegar múltiples backends desde un solo Blueprint:

1. **CartographicProjectManager** (`projects/4-CartographicProjectManager/backend`)  
   Status: ✅ **Ready for deployment**

2. **TennisTournamentManager** (`projects/5-TennisTournamentManager/backend`)  
   Status: ⏳ **Configured but commented (deploy when ready)**

## 🎯 Configuración Actual

### Master Blueprint: `/render.yaml`

El archivo **`/render.yaml`** en la raíz del repositorio define **todos** los servicios:

```yaml
services:
  - carto-backend    # ✅ Active
  # - tennis-backend # ⏳ Commented (uncomment when ready)

databases:
  - carto-db         # ✅ Active
  # - tennis-db      # ⏳ Commented (uncomment when ready)
```

### Ventajas del Monorepo Setup

✅ **Single Blueprint**: Un solo archivo gestiona todos los servicios  
✅ **Shared Config**: Configuraciones comunes reutilizadas  
✅ **Atomic Deploys**: Deploy ambos servicios coordinadamente  
✅ **Cost Visibility**: Ve costos de todos los servicios juntos  

## 🚀 Deploy CartographicProjectManager (Ahora)

### Paso 1: Desplegar con Blueprint

1. Ve a https://render.com (crea cuenta con GitHub)
2. Dashboard → **New** → **Blueprint**
3. Selecciona el repositorio: `TFG-Fabian-Gonzalez-Lence`
4. Render detectará `/render.yaml` en la raíz
5. Click **Apply**

Render creará:
- `carto-backend` (web service)
- `carto-db` (PostgreSQL database)

### Paso 2: Configurar Variables Manuales

En Render Dashboard → `carto-backend` → Environment:

```bash
# Frontend URLs (tu GitHub Pages)
CORS_ORIGIN=https://TU-USUARIO.github.io
SOCKET_CORS_ORIGIN=https://TU-USUARIO.github.io

# Dropbox (generar localmente: npm run get-dropbox-token)
DROPBOX_APP_KEY=tu_app_key
DROPBOX_APP_SECRET=tu_app_secret
DROPBOX_REFRESH_TOKEN=tu_refresh_token
```

### Paso 3: Verificar

```bash
curl https://carto-backend.onrender.com/api/v1/health
# Debe responder: {"status":"healthy",...}
```

📖 Guía completa: `projects/4-CartographicProjectManager/backend/RENDER.md`

## 🎾 Deploy TennisTournamentManager (Futuro)

Cuando estés listo para desplegar Tennis:

### Paso 1: Activar en Blueprint

Edita `/render.yaml`:

```diff
  # TennisTournamentManager Backend
- # - type: web
- #   name: tennis-backend
+ - type: web
+   name: tennis-backend
```

Haz lo mismo para la database (`tennis-db`).

### Paso 2: Push y Redeploy

```bash
git add render.yaml
git commit -m "Enable TennisTournamentManager backend in Render"
git push origin main
```

Render detectará el cambio y creará automáticamente:
- `tennis-backend` (web service)
- `tennis-db` (PostgreSQL database)

### Paso 3: Configurar Variables

En Render Dashboard → `tennis-backend` → Environment:

```bash
CORS_ORIGIN=https://TU-USUARIO.github.io
SOCKET_CORS_ORIGIN=https://TU-USUARIO.github.io
# No requiere Dropbox (a menos que lo implementes)
```

## 💰 Consideraciones del Plan FREE

### Límites Importantes

- **750 horas/mes totales** para todos los servicios
- Servicios duermen tras 15 min de inactividad
- Cold start: ~30 segundos para despertar

### Estrategias de Uso

**Opción 1: Un servicio 24/7** (Recomendado para TFG)
```
CARTO: 750h/mes = Always available
TENNIS: Commented out (deploy cuando necesites demostrar)
```

**Opción 2: Dos servicios compartiendo horas**
```
CARTO: 375h/mes ≈ 12h/día  
TENNIS: 375h/mes ≈ 12h/día
```

**Opción 3: Deploy on-demand**
```
CARTO: Deploy cuando demuestres CARTO
TENNIS: Deploy cuando demuestres TENNIS
(Pause el otro mientras no se use)
```

### Cómo Pausar un Servicio

Si quieres conservar horas:

1. Render Dashboard → Select service
2. **Suspend** (no borrar)
3. Para reactivar: **Resume**

## 🔧 Estructura del Monorepo

```
TFG-Fabian-Gonzalez-Lence/
├── render.yaml                          # ⭐ Master Blueprint
├── projects/
│   ├── 4-CartographicProjectManager/
│   │   ├── backend/
│   │   │   ├── render.yaml              # Deprecated (usa /render.yaml)
│   │   │   ├── RENDER.md                # Guía completa
│   │   │   ├── package.json
│   │   │   ├── prisma/
│   │   │   └── src/
│   │   └── src/ (frontend)
│   │
│   └── 5-TennisTournamentManager/
│       ├── backend/
│       │   ├── package.json
│       │   ├── prisma/
│       │   └── src/
│       └── src/ (frontend Angular)
```

## 📊 Monitoreo Multi-Servicio

En Render Dashboard verás:

```
Services:
├─ carto-backend   [Running] ✅
├─ tennis-backend  [Suspended] ⏸️  (cuando lo actives)

Databases:
├─ carto-db        [Available] ✅
├─ tennis-db       [Available] ⏸️  (cuando lo actives)
```

### Logs Combinados

Puedes ver logs de ambos servicios:
- Dashboard → Logs (selector desplegable)
- Render CLI: `render logs -s carto-backend --tail`

## 🔄 Workflow de Deploy

### Deploy Automático (Recomendado)

Render monitorea la rama `main`:

```bash
# Cambios en cualquier proyecto triggean deploy
git push origin main
```

Render es inteligente:
- Solo rebuilds servicios con cambios en su `rootDir`
- CARTO cambios → solo redeploy carto-backend
- TENNIS cambios → solo redeploy tennis-backend
- render.yaml cambios → redeploy ambos si es necesario

### Deploy Manual

Dashboard → Service → **Manual Deploy** → **Deploy latest commit**

## 🐛 Troubleshooting Multi-Servicio

### Error: "Service name already exists"

Si intentas crear `carto-backend` dos veces:
- **Causa**: Ya existe un Blueprint previo
- **Solución**: Borra servicios antiguos o usa nombres distintos

### Un servicio no arranca

1. Verifica que `rootDir` apunte correctamente
2. Revisa logs del servicio específico
3. Comprueba que `buildCommand` funcione localmente:
   ```bash
   cd projects/4-CartographicProjectManager/backend
   npm ci && npx prisma generate && npm run build
   ```

### DATABASE_URL no se conecta

- Usa **Internal Database URL** (auto-configurada por render.yaml)
- No uses External URL (solo para conexión desde tu máquina)

## 📚 Documentación por Proyecto

- **CARTO**: `projects/4-CartographicProjectManager/backend/RENDER.md`
- **TENNIS**: (crear cuando se despliegue)

## ✅ Checklist de Migración

- [ ] Push render.yaml a la raíz del repo
- [ ] Deploy CARTO via Blueprint
- [ ] Configurar variables de CARTO
- [ ] Verificar CARTO health check
- [ ] Actualizar frontend CARTO con nueva URL
- [ ] (Futuro) Descomentar tennis-backend en render.yaml
- [ ] (Futuro) Configurar variables de TENNIS
- [ ] (Futuro) Actualizar frontend TENNIS con nueva URL

## 🎉 Conclusión

Con este setup:
- ✅ CARTO funciona **ahora**
- ✅ TENNIS está **pre-configurado**
- ✅ Un solo Blueprint gestiona todo
- ✅ Deploy es tan simple como descomentar líneas
- ✅ FREE tier optimizado

---

**Next**: Sigue la guía de CARTO: `projects/4-CartographicProjectManager/backend/RENDER.md`
