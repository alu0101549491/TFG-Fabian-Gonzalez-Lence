# 📋 Checklist de Migración: Railway → Render

> **ℹ️ MONOREPO**: Este repo contiene múltiples proyectos (CARTO + TENNIS).  
> El Blueprint principal está en `/render.yaml` y gestiona ambos backends.  
> Ver: `/RENDER-MONOREPO.md` para detalles del setup completo.

## ✅ Pre-Deploy (En tu máquina local)

- [ ] **1. Generar Dropbox Refresh Token**
  ```bash
  cd projects/4-CartographicProjectManager/backend
  npm install
  npm run get-dropbox-token
  ```
  → Guarda el token que aparece en la consola

- [ ] **2. Exportar datos de Railway (opcional)**
  
  Solo si tienes datos importantes en Railway:
  ```bash
  # Conectar a Railway y exportar
  railway psql -- pg_dump > backup_railway_$(date +%Y%m%d).sql
  ```

- [ ] **3. Commit de archivos de configuración**
  ```bash
  # Desde la raíz del repositorio
  git add render.yaml RENDER-MONOREPO.md
  git add projects/4-CartographicProjectManager/backend/RENDER.md
  git add projects/4-CartographicProjectManager/backend/.env.render.example
  git commit -m "Add Render deployment configuration"
  git push origin main
  ```

## 🚀 Deploy en Render

- [ ] **4. Crear cuenta en Render**
  - Ve a https://render.com
  - Sign up with GitHub

- [ ] **5. Crear Blueprint**
  - Dashboard → **New** → **Blueprint**
  - Selecciona el repositorio: `TFG-Fabian-Gonzalez-Lence`
  - Render detectará automáticamente `/render.yaml` (en la raíz del repo)
  - **Nota**: El Blueprint gestiona múltiples proyectos (CARTO está activo, TENNIS comentado)
  - Haz clic en **Apply**

- [ ] **6. Configurar variables secretas**
  
  En Render Dashboard → `carto-backend` → Environment:
  
  ```bash
  # CORS - Reemplaza con tu GitHub Pages URL
  CORS_ORIGIN=https://TU-USUARIO.github.io
  SOCKET_CORS_ORIGIN=https://TU-USUARIO.github.io
  
  # Dropbox - Del paso 1
  DROPBOX_APP_KEY=tu_dropbox_app_key
  DROPBOX_APP_SECRET=tu_dropbox_app_secret
  DROPBOX_REFRESH_TOKEN=tu_dropbox_refresh_token_generado
  ```
  
  → Click **Save Changes**

- [ ] **7. Trigger Manual Deploy (si no empezó automáticamente)**
  - Dashboard → `carto-backend`
  - Click **Manual Deploy** → **Deploy latest commit**

- [ ] **8. Esperar a que finalice el deploy**
  - Primer deploy: ~5-10 minutos
  - Revisa los logs: Dashboard → Logs
  - Verifica que termine con "Server running on port 10000"

- [ ] **9. Verificar el backend**
  
  Copia la URL de Render (ej: `https://carto-backend.onrender.com`) y prueba:
  
  ```bash
  curl https://carto-backend.onrender.com/api/v1/health
  ```
  
  Debe responder:
  ```json
  {
    "status": "healthy",
    "timestamp": "...",
    "uptime": ...,
    "database": "connected"
  }
  ```

## 🔄 Migrar Datos (si exportaste desde Railway)

- [ ] **10. Importar datos a Render PostgreSQL**
  
  Solo si exportaste datos en el paso 2:
  
  ```bash
  # Obtener External Database URL de Render
  # Dashboard → carto-db → Connections → External Database URL
  
  psql "postgresql://carto_db_user:XXX@XXX.render.com/carto_db_XXX" < backup_railway_YYYYMMDD.sql
  ```
  
  ⚠️ **Importante:** La External URL solo funciona desde tu máquina, no desde los servicios Render.

## 🌐 Actualizar Frontend

- [ ] **11. Actualizar GitHub Secrets**
  
  En tu repositorio GitHub:
  - Settings → Secrets and variables → Actions
  - Edita o crea:
  
  ```
  VITE_API_URL=https://carto-backend.onrender.com
  VITE_SOCKET_URL=https://carto-backend.onrender.com
  ```

- [ ] **12. Redeploy del frontend**
  
  ```bash
  # Push a main para trigger GitHub Actions
  git commit --allow-empty -m "Update backend URL to Render"
  git push origin main
  ```
  
  O trigger manualmente en GitHub Actions.

- [ ] **13. Verificar frontend → backend connection**
  
  Abre tu frontend en el navegador y:
  - Prueba login
  - Verifica que aparezcan proyectos
  - Comprueba WebSocket (mensajes en tiempo real)

## 🧹 Cleanup de Railway (opcional)

- [ ] **14. Pausar o eliminar servicios de Railway**
  
  Si ya no usarás Railway:
  - Railway Dashboard → Settings → Delete Service
  
  O simplemente déjalos pausados (no consumirán créditos si están inactivos).

## ✅ Post-Deploy

- [ ] **15. Documentar la URL de producción**
  
  Actualiza documentación del proyecto con la nueva URL:
  - README del frontend
  - Documentación de API
  - Memoria del TFG

- [ ] **16. Configurar monitoreo (opcional)**
  
  Render Dashboard → Analytics:
  - Revisa métricas de CPU/Memory
  - Configura alertas si está disponible

## 🎉 Migración Completada

Tu backend ahora está en Render:
- 🌐 URL: `https://carto-backend.onrender.com`
- 🗄️ Database: PostgreSQL en Render
- 🔄 Auto-deploy: Activado desde `main` branch
- 📊 Logs: Disponibles en Dashboard

---

## 📝 Notas

**Diferencias importantes:**
- **Cold start**: Render FREE duerme tras 15 min → primera request tarda ~30s
- **Database**: 1 GB storage (vs 500 MB en Railway FREE)
- **Logs**: 7 días de retención
- **Build**: Puede ser más lento que Railway (pero es aceptable)

**Si algo falla:**
1. Revisa los logs en Render Dashboard
2. Verifica que todas las variables de entorno estén correctas
3. Comprueba que `DATABASE_URL` se haya auto-configurado
4. Consulta [RENDER.md](./RENDER.md) para troubleshooting

**Soporte:**
- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com/)
