# TFG - Análisis de Capacidades de la IA en la Generación Semiautomática de Aplicaciones Complejas

**Universidad de La Laguna**  
**Escuela Superior de Ingeniería y Tecnología**  
**Grado en Ingeniería Informática**

**Autor:** Fabián González Lence  
**Contact:** alu0101549491@ull.edu.es

---

## 📋 Descripción

El propósito de este TFG es explorar las capacidades actuales de diferentes modelos de IA (LLMs) para generar con mínima intervención humana aplicaciones web interactivas complejas. Este repositorio monorepo contiene 5 proyectos web desarrollados progresivamente, cada uno con mayor complejidad técnica y arquitectónica.

## 🎯 Proyectos

### 1. TheHangmanGame 🎮
**Complejidad:** Básica  
**Tecnologías:** TypeScript, HTML5, CSS3  
**Descripción:** Juego clásico del ahorcado con interfaz interactiva.

**Demo:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/1-TheHangmanGame/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/1-TheHangmanGame/)

---

### 2. MusicWebPlayer 🎵
**Complejidad:** Intermedia  
**Tecnologías:** TypeScript, Vue 3, Vite  
**Descripción:** Reproductor de música web con gestión de playlists y controles avanzados.

**Demo:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/2-MusicWebPlayer/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/2-MusicWebPlayer/)

---

### 3. MiniBalatro 🃏
**Complejidad:** Intermedia-Alta  
**Tecnologías:** TypeScript, Vue 3, Vite  
**Descripción:** Juego de cartas inspirado en mecánicas de roguelike deck-building.

**Demo:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/3-MiniBalatro/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/3-MiniBalatro/)

---

### 4. CartographicProjectManager 🗺️
**Complejidad:** Alta  
**Tecnologías:** TypeScript, Vue 3, Vite, Express.js, Prisma, PostgreSQL (Supabase), Socket.IO  
**Descripción:** Sistema completo de gestión de proyectos cartográficos con:
- Autenticación JWT multi-rol (Admin, Cliente, Usuario Especial)
- CRUD de proyectos, tareas y archivos
- Chat en tiempo real por proyecto
- Sistema de notificaciones
- Integración con Dropbox para almacenamiento
- Auditoría completa de acciones
- Row Level Security (RLS) en base de datos

**Frontend:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/4-CartographicProjectManager/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/4-CartographicProjectManager/)  
**Backend:** [https://carto-backend-gl8l.onrender.com](https://carto-backend-gl8l.onrender.com)  
**Docs:** [projects/4-CartographicProjectManager/backend/RENDER.md](projects/4-CartographicProjectManager/backend/RENDER.md)

---

### 5. TennisTournamentManager 🎾
**Complejidad:** Alta  
**Tecnologías:** TypeScript, Vue 3, Vite, NestJS, TypeORM, PostgreSQL (Supabase), WebSockets  
**Descripción:** Sistema de gestión de torneos de tenis con:
- Gestión de jugadores, torneos y partidos
- Sistema de emparejamiento automático
- Estadísticas y rankings en tiempo real
- Multi-tenancy por club
- Notificaciones push
- Generación de reportes PDF

**Frontend:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/5-TennisTournamentManager/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/5-TennisTournamentManager/)  
**Backend:** (En migración a Supabase)  
**Docs:** [projects/5-TennisTournamentManager/README.md](projects/5-TennisTournamentManager/README.md)

---

## 🚀 Deployment

### Arquitectura de Despliegue

**Frontend (GitHub Pages):**
- Todos los proyectos desplegados automáticamente via GitHub Actions
- Workflow: `.github/workflows/deploy.yml`
- URL base: `https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/`

**Backend (Render.com + Supabase):**
- Backends desplegados en Render (free tier)
- Bases de datos en Supabase PostgreSQL (sin límite de 90 días)
- Infrastructure as Code: `render.yaml`
- Migraciones gestionadas con Supabase CLI

### Supabase Migration

Los proyectos 4 y 5 utilizan Supabase para:
- ✅ **Base de datos PostgreSQL**: Session pooler para conexiones externas
- ✅ **Row Level Security (RLS)**: Seguridad a nivel de fila
- 🔄 **Edge Functions** (Futuro): Reemplazar Express/NestJS
- 🔄 **Supabase Auth** (Futuro): Reemplazar JWT personalizado
- 🔄 **Supabase Storage** (Futuro): Reemplazar Dropbox
- 🔄 **Supabase Realtime** (Futuro): Reemplazar Socket.IO/WebSockets

**Documentación:**
- [CARTO-SUPABASE-DEPLOYMENT.md](docs/CARTO-SUPABASE-DEPLOYMENT.md)
- [RENDER-MONOREPO.md](RENDER-MONOREPO.md)

### Quick Deploy

```bash
# 1. Clonar repositorio
git clone https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence.git
cd TFG-Fabian-Gonzalez-Lence

# 2. Instalar dependencias (ejemplo: CARTO backend)
cd projects/4-CartographicProjectManager/backend
npm install

# 3. Configurar Supabase
# - Crear proyecto en https://supabase.com
# - Obtener DATABASE_URL de Supabase Dashboard

# 4. Deploy backend a Render
# - Push a GitHub: git push origin main
# - En Render: New → Blueprint → Select repo
# - Configurar DATABASE_URL en variables de entorno

# 5. Frontend se despliega automáticamente a GitHub Pages
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **TypeScript** - Tipado estático
- **Vue 3** - Framework progresivo (Composition API)
- **Vite** - Build tool ultra-rápido
- **Pinia** - State management
- **Vue Router** - Routing SPA
- **Vitest** - Unit testing
- **Playwright** - E2E testing

### Backend
- **Node.js 22+** - Runtime JavaScript
- **Express.js** - Framework web minimalista
- **NestJS** - Framework enterprise (Tennis)
- **Prisma** - ORM moderno (CARTO)
- **TypeORM** - ORM Enterprise (Tennis)
- **Socket.IO** - WebSockets para chat
- **JWT** - Autenticación stateless
- **Zod** - Validación de esquemas

### Database & Cloud
- **PostgreSQL 17** - Base de datos relacional
- **Supabase** - Backend as a Service
- **Render** - Hosting backend (free tier)
- **GitHub Pages** - Hosting frontend estático
- **Dropbox API** - Almacenamiento de archivos

### DevOps & Tools
- **GitHub Actions** - CI/CD pipelines
- **Supabase CLI** - Gestión de migraciones
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeDoc** - Documentación automática

---

## 📁 Estructura del Proyecto

```
TFG-Fabian-Gonzalez-Lence/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: Deploy frontend a Pages
├── projects/
│   ├── 1-TheHangmanGame/       # Proyecto 1: Juego básico
│   ├── 2-MusicWebPlayer/       # Proyecto 2: Reproductor música
│   ├── 3-MiniBalatro/          # Proyecto 3: Juego cartas
│   ├── 4-CartographicProjectManager/  # Proyecto 4: Gestión CARTO
│   │   ├── backend/            # Express + Prisma + Supabase
│   │   ├── src/                # Frontend Vue 3
│   │   └── docs/               # Especificaciones y diagramas
│   └── 5-TennisTournamentManager/     # Proyecto 5: Gestión torneos
│       ├── backend/            # NestJS + TypeORM + Supabase
│       ├── src/                # Frontend Vue 3
│       └── docs/               # Especificaciones y diagramas
├── supabase/
│   ├── carto-backend/          # Migraciones SQL de CARTO
│   └── tennis-backend/         # Migraciones SQL de Tennis
├── docs/                       # Documentación global
│   ├── CARTO-SUPABASE-DEPLOYMENT.md
│   └── SUPABASE-SETUP-COMPLETE.md
├── Memoria/                    # Memoria del TFG (LaTeX)
├── Presentación/               # Presentación defensa (Beamer)
├── render.yaml                 # Infrastructure as Code (Render)
├── RENDER-MONOREPO.md         # Guía despliegue Render
└── README.md                   # Este archivo
```

---

## 📚 Documentación Adicional

### Especificaciones de Proyecto
- **CARTO:** [projects/4-CartographicProjectManager/docs/specification.md](projects/4-CartographicProjectManager/docs/specification.md)
- **Tennis:** [projects/5-TennisTournamentManager/docs/specification.md](projects/5-TennisTournamentManager/docs/specification.md)

### Diagramas
- **CARTO Class Diagram:** [projects/4-CartographicProjectManager/docs/class-diagram.mermaid](projects/4-CartographicProjectManager/docs/class-diagram.mermaid)
- **CARTO Use Cases:** [projects/4-CartographicProjectManager/docs/use-case-diagram.mermaid](projects/4-CartographicProjectManager/docs/use-case-diagram.mermaid)

### Guías de Despliegue
- **Render Monorepo:** [RENDER-MONOREPO.md](RENDER-MONOREPO.md)
- **CARTO + Supabase:** [docs/CARTO-SUPABASE-DEPLOYMENT.md](docs/CARTO-SUPABASE-DEPLOYMENT.md)
- **GitHub Pages:** [MONOREPO-GITHUB-PAGES.md](MONOREPO-GITHUB-PAGES.md)

---

## 🔑 Features Destacadas

### CartographicProjectManager
- ✅ Autenticación JWT con 3 roles (Admin, Cliente, Especial)
- ✅ CRUD completo de proyectos cartográficos
- ✅ Sistema de tareas con estado y prioridad
- ✅ Chat en tiempo real por proyecto (Socket.IO)
- ✅ Sistema de notificaciones push
- ✅ Integración Dropbox para archivos grandes
- ✅ Auditoría completa de acciones
- ✅ Row Level Security en Supabase
- ✅ Testing unitario + E2E (Playwright)

### TennisTournamentManager
- ✅ Gestión multi-club con multi-tenancy
- ✅ Sistema de emparejamiento automático
- ✅ Rankings y estadísticas en tiempo real
- ✅ Generación de reportes PDF
- ✅ Notificaciones push
- ✅ WebSockets para actualizaciones live
- 🔄 Migración a Supabase en progreso

---

## 🧪 Testing

Cada proyecto incluye test suites completos:

```bash
# Unit tests (Vitest/Jest)
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📊 Estado del Proyecto

| Proyecto | Estado | Frontend | Backend | Database | Tests |
|----------|--------|----------|---------|----------|-------|
| 1-TheHangmanGame | ✅ Completo | GitHub Pages | - | - | ✅ |
| 2-MusicWebPlayer | ✅ Completo | GitHub Pages | - | - | ✅ |
| 3-MiniBalatro | ✅ Completo | GitHub Pages | - | - | ✅ |
| 4-CartographicProjectManager | ✅ Desplegado | GitHub Pages | Render | Supabase | ✅ |
| 5-TennisTournamentManager | 🔄 En migración | GitHub Pages | Render | Supabase (🔄) | ✅ |

---

## 🔧 Desarrollo Local

### Requisitos
- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase CLI (para proyectos 4 y 5)

### Setup CARTO (Proyecto 4)

```bash
# 1. Clonar e instalar
cd projects/4-CartographicProjectManager/backend
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# 3. Generar Prisma Client
npx prisma generate

# 4. Ejecutar en desarrollo
npm run dev
```

### Setup Tennis (Proyecto 5)

```bash
# 1. Clonar e instalar
cd projects/5-TennisTournamentManager/backend
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# 3. Ejecutar migraciones
npm run migration:run

# 4. Ejecutar en desarrollo
npm run start:dev
```

---

## 📝 Licencia

Este proyecto es parte de un Trabajo de Fin de Grado (TFG) académico en la Universidad de La Laguna.

**Uso Académico Únicamente** - No para uso comercial sin autorización.

---

## 🙏 Agradecimientos

- **Universidad de La Laguna** - Infraestructura y recursos
- **GitHub** - Hosting gratuito (GitHub Pages)
- **Render** - Hosting backend gratuito
- **Supabase** - Backend as a Service gratuito
- **Comunidad Open Source** - Herramientas y librerías

---

## 📧 Contacto

**Fabián González Lence**  
📧 Email: alu0101549491@ull.edu.es  
🔗 GitHub: [@alu0101549491](https://github.com/alu0101549491)  
🎓 Universidad de La Laguna - Ingeniería Informática

---

## 🔗 Enlaces Útiles

- [GitHub Repository](https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence)
- [GitHub Pages (Proyectos)](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/)
- [Render Dashboard](https://dashboard.render.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Universidad de La Laguna](https://www.ull.es)

---

**Última actualización:** Abril 2026  
**Versión:** 2.0.0 (Post-Supabase Migration)
