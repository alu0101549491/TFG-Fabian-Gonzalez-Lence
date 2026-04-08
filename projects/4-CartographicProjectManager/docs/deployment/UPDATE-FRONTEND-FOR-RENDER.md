# 🌐 Actualizar Frontend para Render

Esta guía explica cómo actualizar el frontend de CartographicProjectManager para conectarlo con el backend desplegado en Render.

## 📋 Pre-requisitos

- ✅ Backend desplegado en Render
- ✅ URL del backend verificada (ej: `https://carto-backend.onrender.com`)
- ✅ Health check respondiendo correctamente

## 🔧 Paso 1: Actualizar GitHub Secrets

Las variables de entorno del frontend se configuran en GitHub Secrets para que GitHub Actions las use durante el build.

### 1.1 Ir a Settings de GitHub

```
Repositorio → Settings → Secrets and variables → Actions
```

### 1.2 Actualizar o Crear Secrets

Busca y actualiza (o crea si no existen) estos secrets:

| Secret Name | Valor | Ejemplo |
|-------------|-------|---------|
| `VITE_API_URL` | URL de tu backend en Render | `https://carto-backend.onrender.com` |
| `VITE_SOCKET_URL` | Misma URL del backend | `https://carto-backend.onrender.com` |

**Importante:**
- ❌ NO incluyas `/api/v1` al final
- ❌ NO incluyas barra final `/`
- ✅ Solo la URL base: `https://carto-backend.onrender.com`

### 1.3 Verificar otros Secrets (si aplican)

Si usabas otros secrets para Railway, elimínalos o actualízalos:

```bash
# Secrets que puedes eliminar si eran específicos de Railway:
# - RAILWAY_TOKEN
# - RAILWAY_PROJECT_ID
```

## 🚀 Paso 2: Redesplegar Frontend

### Opción A: Push Automático (Recomendado)

Simplemente haz un commit y push para trigger GitHub Actions:

```bash
cd projects/4-CartographicProjectManager

# Frontend: actualizar vite.config.ts (ya actualizado)
git add vite.config.ts

git commit -m "Switch backend from Railway to Render"
git push origin main
```

GitHub Actions detectará el push y:
1. Usará los nuevos secrets `VITE_API_URL` y `VITE_SOCKET_URL`
2. Compilará el frontend con las nuevas URLs
3. Desplegará a GitHub Pages

### Opción B: Manual Deploy

Si prefieres deployar manualmente:

1. Ve a tu repositorio en GitHub
2. **Actions** tab
3. Selecciona el workflow de deploy (ej: "Deploy to GitHub Pages")
4. Click **Run workflow** → **Run workflow**

## ✅ Paso 3: Verificar el Deploy

### 3.1 Esperar a que finalice

El deploy de GitHub Actions tarda ~2-5 minutos. Espera a que aparezca el ✅ verde.

### 3.2 Verificar la URL del frontend

Abre tu frontend en el navegador:

```
https://TU-USUARIO.github.io/4-CartographicProjectManager/
```

### 3.3 Verificar la conexión con el backend

**Abre las DevTools del navegador** (F12) y ve a la pestaña **Network**.

1. **Login**
   - Intenta hacer login con un usuario de prueba
   - En Network, verifica que las requests vayan a `https://carto-backend.onrender.com/api/v1/auth/login`
   - Debe responder con status `200` y un token JWT

2. **Listar Proyectos**
   - Navega a la lista de proyectos
   - Verifica que la request vaya a `https://carto-backend.onrender.com/api/v1/projects`
   - Debe responder con status `200` y un array de proyectos

3. **WebSocket**
   - Abre la consola (Console tab)
   - Verifica que aparezca: `Socket connected` o similar
   - Busca conexiones WebSocket en la tab **WS** (WebSocket) de DevTools

## 🐛 Troubleshooting

### Error: CORS / Network Error

**Problema**: El navegador muestra errores CORS.

**Solución**: Verifica que el backend tenga configurado correctamente `CORS_ORIGIN`:

```bash
# En Render Dashboard → carto-backend → Environment
CORS_ORIGIN=https://TU-USUARIO.github.io
SOCKET_CORS_ORIGIN=https://TU-USUARIO.github.io
```

**Importante**: Debe ser exactamente la URL de GitHub Pages SIN el path del proyecto.

### Error: Failed to fetch / Backend not responding

**Problema**: El frontend no puede conectar al backend.

**Posibles causas:**

1. **Backend dormido (Render FREE)**
   - Render FREE duerme tras 15 min de inactividad
   - Primera request tarda ~30s en despertar
   - **Solución**: Espera 30-60 segundos y reintenta

2. **URL incorrecta en secrets**
   - Verifica que `VITE_API_URL` esté correctamente configurado
   - Debe ser: `https://carto-backend.onrender.com` (sin trailing slash)

3. **Backend crasheado**
   - Ve a Render Dashboard → Logs
   - Busca errores en el backend
   - Verifica que el servicio esté "Running"

### Error: WebSocket no conecta

**Problema**: Mensajes en tiempo real no funcionan.

**Solución**:

1. Verifica `SOCKET_CORS_ORIGIN` en el backend (Render Environment)
2. Asegúrate de que `VITE_SOCKET_URL` apunte al backend correcto
3. Render soporta WebSocket nativamente (no necesitas configuración extra)

### No se aplicaron los cambios

**Problema**: El frontend sigue usando la URL antigua de Railway.

**Posibles causas:**

1. **Caché del navegador**
   - Abre DevTools → Application → Clear storage → **Clear site data**
   - O usa modo incógnito

2. **Service Worker antiguo**
   - DevTools → Application → Service Workers
   - Click **Unregister** en el service worker antiguo
   - Recarga la página (F5)

3. **GitHub Actions no usó nuevos secrets**
   - Ve a GitHub → Actions → último workflow run
   - Verifica que los secrets se hayan actualizado ANTES de este run
   - Si es necesario, trigger otro deploy manualmente

## 📊 Verificación Post-Deploy

Checklist completo:

- [ ] GitHub Secrets actualizados (`VITE_API_URL`, `VITE_SOCKET_URL`)
- [ ] GitHub Actions corrió exitosamente
- [ ] Frontend accesible en GitHub Pages
- [ ] Login funciona correctamente
- [ ] Se cargan proyectos/usuarios
- [ ] WebSocket conecta (mensajes en tiempo real funcionan)
- [ ] No hay errores en la consola del navegador
- [ ] Requests van a `carto-backend.onrender.com` (no a railway.app)

## 🎉 Completado

Si todos los checks pasan, tu frontend ahora está conectado al backend en Render.

## 📚 Referencias

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Render Docs](https://render.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Próximo paso**: Prueba todas las funcionalidades críticas de tu app para asegurarte de que todo funcione correctamente con el nuevo backend.
