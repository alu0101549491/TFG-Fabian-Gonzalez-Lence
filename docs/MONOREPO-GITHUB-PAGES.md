# Guía: Monorepo con Múltiples Proyectos en GitHub Pages

Esta guía explica cómo configurar un monorepo para desplegar múltiples proyectos web en GitHub Pages, ideal para estudiantes que están aprendiendo JavaScript/TypeScript.

## 📚 Índice

- [¿Qué es un Monorepo?](#qué-es-un-monorepo)
- [Ventajas y Desventajas](#ventajas-y-desventajas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración Paso a Paso](#configuración-paso-a-paso)
- [Conceptos Clave](#conceptos-clave)
- [Despliegue Automático](#despliegue-automático)
- [Solución de Problemas](#solución-de-problemas)

## ¿Qué es un Monorepo?

Un **monorepo** (repositorio monolítico) es un único repositorio Git que contiene múltiples proyectos relacionados. En lugar de tener un repositorio separado para cada aplicación, todos los proyectos viven juntos en una estructura organizada.

### Ejemplo de Estructura:
```
mi-monorepo/
├── projects/
│   ├── 1-TheHangmanGame/
│   ├── 2-MusicWebPlayer/
│   ├── 3-MiniBalatro/
│   └── 4-CartographicProjectManager/
├── package.json           # Configuración principal
└── .github/
    └── workflows/
        └── deploy.yml     # Automatización del despliegue
```

## Ventajas y Desventajas

### ✅ Ventajas

1. **Organización centralizada**: Todos tus proyectos en un solo lugar
2. **Gestión simplificada**: Un solo repositorio para clonar, actualizar y mantener
3. **Portfolio unificado**: Página principal que enlaza todos tus proyectos
4. **Reutilización de código**: Facilita compartir código entre proyectos
5. **Despliegue sincronizado**: Un solo comando despliega todos los proyectos

### ❌ Desventajas

1. **Tamaño del repositorio**: Puede crecer mucho con muchos proyectos
2. **Complejidad inicial**: Requiere configuración más avanzada
3. **Build times**: Construir todos los proyectos lleva más tiempo
4. **Conflictos potenciales**: Cambios en múltiples proyectos pueden generar conflictos

## Estructura del Proyecto

### 1. Package.json Principal

El archivo `package.json` en la raíz define el monorepo usando **workspaces de npm**:

```json
{
  "name": "mi-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "projects/1-TheHangmanGame",
    "projects/2-MusicWebPlayer",
    "projects/3-MiniBalatro",
    "projects/4-CartographicProjectManager"
  ]
}
```

**Conceptos importantes:**
- `"private": true` → Evita publicar accidentalmente el monorepo en npm
- `"workspaces"` → Lista de rutas a los proyectos individuales
- Cada workspace es un proyecto independiente con su propio `package.json`

### 2. Estructura de Cada Proyecto

Cada proyecto debe tener su propia configuración:

```
projects/1-TheHangmanGame/
├── index.html
├── package.json           # Dependencias específicas del proyecto
├── vite.config.ts         # Configuración de Vite ⚠️ IMPORTANTE
├── src/                   # Código fuente
│   └── ...
└── dist/                  # Build output (generado automáticamente)
```

### 3. Configuración de Vite: La Clave del Éxito

El archivo `vite.config.ts` es **crucial** para que los proyectos funcionen en GitHub Pages:

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

// 🎯 Obtener la ruta base del proyecto
const base = process.env.BASE_URL || '/1-TheHangmanGame/';

export default defineConfig({
  // ⚠️ CRÍTICO: Define la ruta base para assets y navegación
  base,
  
  root: '.',
  publicDir: 'public',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
    },
  },
  
  server: {
    port: 3000,
    open: true,
  },
});
```

#### ⚠️ ¿Por qué es importante `base`?

GitHub Pages despliega tu proyecto en una URL como:
```
https://tu-usuario.github.io/nombre-repositorio/1-TheHangmanGame/
```

Sin configurar `base`, Vite buscaría los archivos en:
```
https://tu-usuario.github.io/assets/main.js  ❌ NO FUNCIONA
```

Con `base` configurado correctamente, busca en:
```
https://tu-usuario.github.io/nombre-repositorio/1-TheHangmanGame/assets/main.js  ✅ FUNCIONA
```

## Configuración Paso a Paso

### Paso 1: Crear la Estructura Básica

```bash
# Crear el monorepo
mkdir mi-monorepo
cd mi-monorepo

# Inicializar Git y npm
git init
npm init -y

# Crear carpeta de proyectos
mkdir projects
```

### Paso 2: Configurar el Package.json Principal

Edita `package.json`:

```json
{
  "name": "mi-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "projects/*"
  ]
}
```

### Paso 3: Crear un Proyecto con Vite

```bash
cd projects
npm create vite@latest 1-MiPrimerProyecto -- --template vanilla-ts
cd 1-MiPrimerProyecto
```

### Paso 4: Configurar vite.config.ts

Edita `projects/1-MiPrimerProyecto/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

const base = process.env.BASE_URL || '/1-MiPrimerProyecto/';

export default defineConfig({
  base,
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### Paso 5: Añadir Script de Build

Edita `projects/1-MiPrimerProyecto/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### Paso 6: Instalar Dependencias

Desde la **raíz del monorepo**:

```bash
npm install
```

Esto instalará las dependencias de **todos los workspaces** automáticamente.

## Conceptos Clave

### 1. Workspaces de npm

Los workspaces permiten gestionar múltiples paquetes en un solo repositorio:

```bash
# Desde la raíz, instalar en todos los proyectos
npm install

# Añadir una dependencia a un proyecto específico
npm install lodash --workspace=projects/1-MiPrimerProyecto

# Ejecutar un script en un workspace específico
npm run build --workspace=projects/1-MiPrimerProyecto
```

### 2. BASE_URL en Vite

La variable `BASE_URL` debe coincidir con la estructura de URLs de GitHub Pages:

```
Formato: /nombre-repositorio/nombre-proyecto/
Ejemplo: /mi-monorepo/1-MiPrimerProyecto/
```

**Importante:**
- Debe empezar con `/`
- Debe terminar con `/`
- Es case-sensitive (distingue mayúsculas/minúsculas)

### 3. Variables de Entorno en GitHub Actions

En el workflow de despliegue, se define dinámicamente:

```bash
export BASE_URL="/$REPO_NAME/1-MiPrimerProyecto/"
npm run build
```

`$REPO_NAME` se obtiene automáticamente del repositorio de GitHub.

## Despliegue Automático

### Configurar GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy Projects to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Permite ejecutar manualmente

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build all projects
        env:
          REPO_NAME: ${{ github.event.repository.name }}
        run: |
          mkdir -p deploy
          
          # Build primer proyecto
          if [ -d "projects/1-MiPrimerProyecto" ]; then
            echo "🔨 Building 1-MiPrimerProyecto..."
            cd projects/1-MiPrimerProyecto
            npm ci
            export BASE_URL="/$REPO_NAME/1-MiPrimerProyecto/"
            npm run build
            mkdir -p "../../deploy/1-MiPrimerProyecto"
            cp -r dist/* "../../deploy/1-MiPrimerProyecto/"
            cd ../..
            echo "✅ 1-MiPrimerProyecto built successfully"
          fi
          
          # Repetir para cada proyecto...

      - name: Create index page
        run: |
          cat > deploy/index.html << 'EOF'
          <!DOCTYPE html>
          <html lang="es">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Mis Proyectos</title>
              <style>
                  body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      padding: 20px;
                  }
                  .container {
                      max-width: 900px;
                      width: 100%;
                  }
                  h1 {
                      color: white;
                      text-align: center;
                      margin-bottom: 40px;
                      font-size: 2.5em;
                      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                  }
                  .projects {
                      display: grid;
                      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                      gap: 25px;
                  }
                  .project-card {
                      background: white;
                      border-radius: 15px;
                      padding: 30px;
                      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                      transition: transform 0.3s ease;
                      text-decoration: none;
                      color: inherit;
                      display: block;
                  }
                  .project-card:hover {
                      transform: translateY(-5px);
                      box-shadow: 0 15px 40px rgba(0,0,0,0.3);
                  }
                  .project-icon {
                      font-size: 3em;
                      margin-bottom: 15px;
                  }
                  .project-name {
                      font-size: 1.5em;
                      font-weight: bold;
                      color: #333;
                      margin-bottom: 10px;
                  }
                  .project-description {
                      color: #666;
                      line-height: 1.6;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>🚀 Portfolio de Proyectos</h1>
                  <div class="projects">
                      <a href="./1-MiPrimerProyecto/" class="project-card">
                          <div class="project-icon">🎮</div>
                          <div class="project-name">Mi Primer Proyecto</div>
                          <div class="project-description">Descripción del proyecto 1</div>
                      </a>
                      <!-- Añadir más proyectos aquí -->
                  </div>
              </div>
          </body>
          </html>
          EOF

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './deploy'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Explicación del Workflow

1. **Trigger**: Se ejecuta cuando hay un push a `main` o manualmente
2. **Build job**:
   - Clona el repositorio
   - Instala Node.js 20
   - Construye cada proyecto con su `BASE_URL` específico
   - Copia los builds a una carpeta `deploy/`
   - Crea un `index.html` principal con enlaces a todos los proyectos
3. **Deploy job**:
   - Sube la carpeta `deploy/` como artifact
   - Despliega a GitHub Pages

### Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: **GitHub Actions**
4. Guarda los cambios

## Solución de Problemas

### Problema 1: Los assets no cargan (404)

**Síntoma**: La página se carga pero CSS/JS/imágenes dan error 404

**Causa**: `base` en `vite.config.ts` no está configurado correctamente

**Solución**:
```typescript
// ❌ Incorrecto
const base = '/mi-proyecto';  // Falta el nombre del repo

// ✅ Correcto
const base = process.env.BASE_URL || '/nombre-repo/mi-proyecto/';
```

### Problema 2: Página en blanco después del despliegue

**Causa**: Rutas absolutas en el código

**Solución**: Usa rutas relativas o la variable `import.meta.env.BASE_URL`:

```typescript
// ❌ Incorrecto
const img = '/images/logo.png';

// ✅ Correcto
const img = `${import.meta.env.BASE_URL}images/logo.png`;

// O en Vite config:
import logo from '@/assets/logo.png';  // Con alias configurado
```

### Problema 3: npm install falla en un workspace

**Causa**: Dependencias incompatibles o package.json corrupto

**Solución**:
```bash
# Limpiar todos los node_modules
rm -rf node_modules projects/*/node_modules

# Limpiar cache de npm
npm cache clean --force

# Reinstalar
npm install
```

### Problema 4: GitHub Actions falla en el build

**Verificar**:
1. Logs del workflow en GitHub → Actions
2. Verificar que todos los `package.json` estén correctos
3. Probar el build localmente:
   ```bash
   cd projects/1-MiProyecto
   npm ci
   export BASE_URL="/repo-name/1-MiProyecto/"
   npm run build
   ```

### Problema 5: El workflow no se ejecuta

**Solución**:
1. Verifica que el archivo esté en `.github/workflows/deploy.yml`
2. Verifica la sintaxis YAML (indentación correcta)
3. Ve a Settings → Actions → General y asegúrate de que las Actions estén habilitadas

## Tips y Mejores Prácticas

### 1. Nomenclatura Consistente

```
projects/
├── 1-descriptive-name/
├── 2-another-project/
└── 3-one-more/
```

Números ayudan al orden visual y los nombres descriptivos facilitan la navegación.

### 2. README en Cada Proyecto

Cada proyecto debe tener su propio `README.md` explicando:
- Qué hace el proyecto
- Cómo ejecutarlo localmente
- Tecnologías utilizadas
- Cómo contribuir

### 3. Configuración de TypeScript Compartida

Puedes tener un `tsconfig.base.json` en la raíz y extenderlo:

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "strict": true
  }
}

// projects/1-proyecto/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

### 4. Scripts Útiles en el Package.json Principal

```json
{
  "scripts": {
    "dev:p1": "npm run dev --workspace=projects/1-proyecto",
    "dev:p2": "npm run dev --workspace=projects/2-proyecto",
    "build:all": "npm run build --workspaces",
    "test:all": "npm run test --workspaces",
    "clean": "rm -rf projects/*/dist projects/*/node_modules"
  }
}
```

### 5. .gitignore Apropiado

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
deploy/

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

## Recursos Adicionales

- [Documentación de npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Vite: Building for Production](https://vitejs.dev/guide/build.html)
- [GitHub Actions: Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Conclusión

Configurar un monorepo para GitHub Pages requiere:
1. ✅ Workspaces de npm para gestionar múltiples proyectos
2. ✅ Configuración correcta de `base` en Vite
3. ✅ GitHub Actions workflow para automatizar el despliegue
4. ✅ Página índice para navegar entre proyectos

Esta arquitectura es perfecta para portfolios de estudiantes, permitiendo mostrar múltiples proyectos bajo una única URL profesional.

---

**¿Tienes preguntas?** ¡Experimenta, comete errores, y aprende! La mejor forma de entender estos conceptos es practicar con proyectos reales.
