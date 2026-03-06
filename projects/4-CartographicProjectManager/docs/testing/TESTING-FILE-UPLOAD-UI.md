# Prueba de Integración de Dropbox - Interfaz de Usuario

## ✅ Estado: Implementación Completa

La integración de Dropbox está completamente implementada y lista para probar visualmente desde la aplicación web.

## 🎯 Funcionalidad Implementada

### Backend
- ✅ Endpoint POST `/api/v1/files/upload` con multer middleware
- ✅ DropboxService con upload/download/delete
- ✅ Validación de tipos de archivo y tamaño (50MB max)
- ✅ Estructura de carpetas automática en Dropbox

### Frontend
- ✅ Composable `useFiles()` con función `uploadFile()`
- ✅ Componente `FileUploader` con drag & drop
- ✅ Integración en `ProjectDetailsView`
- ✅ Progress tracking durante upload
- ✅ Manejo de errores y retry

## 📋 Pasos para Probar Visualmente

### 1. Inicia el Backend (si no está corriendo)

```bash
cd /home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager/backend
npm run dev
```

Verifica que está corriendo:
```bash
curl http://localhost:3000/api/v1/health
```

### 2. Inicia el Frontend

```bash
cd /home/fabian/MyStuff/TFG-Fabian-Gonzalez-Lence/projects/4-CartographicProjectManager
npm run dev
```

### 3. Accede a la Aplicación

1. Abre el navegador en `http://localhost:5173` (o el puerto que indique Vite)

2. **Inicia sesión** con:
   - Email: `admin@cartographic.com`
   - Password: `REDACTED`

3. **Navega a un Proyecto**:
   - Ve a "Projects" en el menú
   - Haz clic en cualquier proyecto existente

4. **Ve a la pestaña "Files"**:
   - Haz clic en la pestaña "Files" en el proyecto

### 4. Sube un Archivo

Hay dos formas de subir archivos:

#### Opción A: Drag & Drop
1. Arrastra un archivo desde tu explorador de archivos
2. Suéltalo en la zona de "Drag & drop files here"
3. Selecciona la sección del proyecto (Messages, Plans, etc.)
4. Haz clic en "Upload" 📤

#### Opción B: Click para Seleccionar
1. Haz clic en la zona de upload (zona con "☁️📤")
2. Selecciona archivo(s) desde el diálogo
3. Selecciona la sección del proyecto
4. Haz clic en "Upload" 📤

### 5. Observa el Progreso

Durante el upload verás:
- **Estado "uploading"** con barra de progreso
- **Porcentaje de completado** (0-100%)
- **Estado "completed"** ✅ cuando termine
- **Estado "error"** ❌ si algo falla

### 6. Verifica en Dropbox

1. Ve a tu cuenta de Dropbox
2. Navega a `/CartographicProjects/`
3. Busca la carpeta con el código del proyecto
4. Verás el archivo en la sección correspondiente

### 7. Descarga el Archivo

1. En la lista de archivos del proyecto
2. Haz clic en el archivo para descargarlo
3. El archivo se descarga directamente desde Dropbox

## 🧪 Archivos de Prueba Recomendados

- **PDF**: Para probar documentos
- **DWG/DXF**: Para probar archivos CAD
- **SHP**: Para probar archivos GIS
- **JPG/PNG**: Para probar imágenes
- **ZIP**: Para probar archivos comprimidos

## 📊 Tipos de Archivo Soportados

```
Documentos:  .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx
Imágenes:    .jpg, .jpeg, .png, .gif, .tif, .tiff
CAD:         .dwg, .dxf
GIS:         .shp, .kml, .kmz, .geojson
Comprimidos: .zip, .rar, .7z
```

## 🎨 Interfaz de Usuario

### FileUploader Component

```
┌─────────────────────────────────────────┐
│ Upload to Section: [Messages ▼]         │
├─────────────────────────────────────────┤
│                                         │
│           ☁️📤                          │
│     Drag & drop files here              │
│         or browse to select             │
│                                         │
│  Max 50 MB per file • 10 files max      │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 2 files selected        [Clear all]     │
├─────────────────────────────────────────┤
│ 📄 documento.pdf                  2 MB  │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 50%         ❌   │
├─────────────────────────────────────────┤
│ 📐 plano.dwg                      5 MB  │
│ Pending                           ❌   │
└─────────────────────────────────────────┘

              [📤 Upload 2 files]
```

### FileList Component

```
┌─────────────────────────────────────────┐
│ 🔍 Search files...          📊 📋 [📤]  │
├─────────────────────────────────────────┤
│ [All] [Messages] [Plans] [Budget]       │
├─────────────────────────────────────────┤
│                                         │
│  📄 documento.pdf          2 MB         │
│     Messages • 2 min ago               │
│     [Download] [Delete]                │
│                                         │
│  📐 plano.dwg              5 MB         │
│     Plans • 5 min ago                  │
│     [Download] [Delete]                │
│                                         │
└─────────────────────────────────────────┘
```

## 🔍 Debugging

Si algo no funciona:

### 1. Verifica el Backend
```bash
# Logs del backend
cd backend
npm run dev

# Debería mostrar:
# ✅ Server running on port 3000
# ✅ Database connected
```

### 2. Verifica el Token de Dropbox
```bash
# En backend/.env debe estar:
DROPBOX_ACCESS_TOKEN=<dropbox_access_token>
```

### 3. Verifica la Consola del Navegador
- Abre DevTools (F12)
- Ve a la pestaña "Console"
- Busca errores de red o JavaScript

### 4. Verifica la Pestaña Network
- Abre DevTools → Network
- Sube un archivo
- Busca la petición `POST /api/v1/files/upload`
- Revisa el response

### 5. Test Rápido con curl
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cartographic.com","password":"REDACTED"}' \
  | jq -r '.accessToken')

# Obtener ID de proyecto
PROJECT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/projects \
  | jq -r '.projects[0].id')

# Crear archivo de prueba
echo "Test file upload" > test.txt

# Subir archivo
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "projectId=$PROJECT_ID" \
  -F "section=Messages"
```

## 📝 Notas Importantes

1. **Límite de tamaño**: 50MB por archivo
2. **Archivos grandes**: >150MB usan chunked upload automático
3. **Links temporales**: Los links de descarga expiran en 4 horas
4. **Permisos**: Solo usuarios con permisos pueden subir archivos
5. **Proyectos finalizados**: No se pueden subir archivos a proyectos finalizados

## 🎉 ¡Listo!

Ahora puedes:
- ✅ Subir archivos desde la UI
- ✅ Ver progreso en tiempo real
- ✅ Listar archivos subidos
- ✅ Descargar archivos
- ✅ Eliminar archivos
- ✅ Filtrar por sección
- ✅ Buscar archivos

Todo almacenado en Dropbox y visible tanto en la app como en tu cuenta de Dropbox.
