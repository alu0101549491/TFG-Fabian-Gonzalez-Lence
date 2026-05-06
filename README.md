# TFG - Analysis of AI Capabilities in Semi-Automatic Generation of Complex Applications

**University of La Laguna**  
**School of Engineering and Technology**  
**Degree in Computer Engineering**

**Author:** Fabián González Lence  
**Contact:** alu0101549491@ull.edu.es

---

## 📋 Description

The purpose of this Final Degree Project (TFG) is to explore the current capabilities of different AI models (LLMs) to generate complex interactive web applications with minimal human intervention. This monorepo repository contains 5 progressively developed web projects, each with increasing technical and architectural complexity.

## 🎯 Projects

### 1. TheHangmanGame 🎮
**Complexity:** Basic  
**Technologies:** TypeScript, Vite, Jest  
**Architecture:** MVC Pattern  
**Description:** Classic hangman game with interactive interface and modular architecture.

**Demo:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/1-TheHangmanGame/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/1-TheHangmanGame/)

---

### 2. MusicWebPlayer 🎵
**Complexity:** Intermediate  
**Technologies:** TypeScript, React, Vite  
**Description:** Web music player with playlist management and advanced controls.

**Demo:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/2-MusicWebPlayer/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/2-MusicWebPlayer/)

---

### 3. MiniBalatro 🃏
**Complexity:** Intermediate-Advanced  
**Technologies:** TypeScript, React, Vite  
**Description:** Card game inspired by roguelike deck-building mechanics combining poker with strategic elements.

**Demo:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/3-MiniBalatro/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/3-MiniBalatro/)

---

### 4. CartographicProjectManager 🗺️
**Complexity:** High  
**Technologies:** TypeScript, Vue 3, Vite, Pinia, Express.js, Prisma, PostgreSQL (Supabase), Socket.IO  
**Description:** Complete cartographic project management system with:
- Multi-role JWT authentication (Admin, Client, Special User)
- CRUD for projects, tasks and files
- Real-time chat per project
- Notification system
- Dropbox integration for storage
- Complete action auditing
- Row Level Security (RLS) in database

**Frontend:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/4-CartographicProjectManager/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/4-CartographicProjectManager/)  
**Backend:** [https://carto-backend-gl8l.onrender.com](https://carto-backend-gl8l.onrender.com)  
**Backend Docs:** [projects/4-CartographicProjectManager/backend/RENDER.md](projects/4-CartographicProjectManager/backend/RENDER.md)  
**Changelog:** [projects/4-CartographicProjectManager/CHANGES.md](projects/4-CartographicProjectManager/CHANGES.md)

---

### 5. TennisTournamentManager 🎾
**Complexity:** High  
**Technologies:** TypeScript, Angular 19, Vite, RxJS, Express.js, TypeORM, PostgreSQL (Supabase), WebSockets  
**Description:** Tennis tournament management system with:
- Player, tournament and match management
- Automatic pairing system
- Real-time statistics and rankings
- Multi-tenancy per club
- Push notifications (Email, Telegram, Web Push)
- PDF and Excel report generation
- Automatic Order of Play

**Frontend:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/5-TennisTournamentManager/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/5-TennisTournamentManager/)  
**Backend:** [https://tennis-backend-ltkr.onrender.com](https://tennis-backend-ltkr.onrender.com)  
**Docs:** [projects/5-TennisTournamentManager/docs/specification.md](projects/5-TennisTournamentManager/docs/specification.md)

---

## 🚀 Deployment

### Deployment Architecture

**Frontend (GitHub Pages):**
- All projects automatically deployed via GitHub Actions
- Workflow: `.github/workflows/deploy.yml`
- Base URL: `https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/`

**Backend (Render.com + Supabase):**
- Backends deployed on Render (free tier)
- Databases on Supabase PostgreSQL (no 90-day limit)
- Infrastructure as Code: `render.yaml`
- Migrations managed with Supabase CLI
- System dependencies: `Aptfile` (postgresql-client)

**CI/CD Pipelines:**
- **deploy.yml** - Automatic frontend deployment to GitHub Pages
- **ci.yml** - Continuous integration testing
- **playwright.yml** - E2E test automation
- **deploy-supabase.yml** - Database migration deployment

### Supabase Migration

Projects 4 and 5 use Supabase for:
- ✅ **PostgreSQL Database**: Session pooler for external connections
- ✅ **Row Level Security (RLS)**: Row-level security

**Documentation:**
- [docs/CARTO-SUPABASE-DEPLOYMENT.md](docs/CARTO-SUPABASE-DEPLOYMENT.md)
- [docs/RENDER-MONOREPO.md](docs/RENDER-MONOREPO.md)

### Quick Deploy

```bash
# 1. Clone repository
git clone https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence.git
cd TFG-Fabian-Gonzalez-Lence

# 2. Install dependencies (example: CARTO backend)
cd projects/4-CartographicProjectManager/backend
npm install

# 3. Configure Supabase
# - Create project at https://supabase.com
# - Get DATABASE_URL from Supabase Dashboard

# 4. Deploy backend to Render
# - Push to GitHub: git push origin main
# - In Render: New → Blueprint → Select repo
# - Configure DATABASE_URL in environment variables

# 5. Frontend deploys automatically to GitHub Pages
```

---

## 🛠️ Technologies Used

### Frontend
- **TypeScript** - Static typing
- **React 18** - UI library (Projects 2, 3)
- **Vue 3** - Progressive framework with Composition API (Project 4)
- **Angular 19** - Enterprise framework with RxJS (Project 5)
- **Vite** - Ultra-fast build tool (all projects)
- **Pinia** - State management for Vue (Project 4)
- **Vue Router** - SPA routing (Project 4)
- **Jest** - Unit testing (all projects)
- **Playwright** - E2E testing (Projects 4, 5)

### Backend
- **Node.js 22+** - JavaScript runtime
- **Express.js** - Minimalist web framework (Projects 4, 5)
- **Prisma** - Modern ORM (Project 4)
- **TypeORM** - ORM with decorators (Project 5)
- **Socket.IO** - WebSockets for real-time chat (Project 4)
- **WebSockets** - Bidirectional communication (Project 5)
- **JWT** - Stateless authentication
- **bcrypt** - Password hashing

### Database & Cloud
- **PostgreSQL 17** - Relational database
- **Supabase** - Backend as a Service
- **Render** - Backend hosting (free tier)
- **GitHub Pages** - Static frontend hosting
- **Dropbox API** - File storage

### DevOps & Tools
- **GitHub Actions** - CI/CD pipelines
- **Supabase CLI** - Migration management
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeDoc** - Automatic documentation

---

## 🤖 AI-Assisted Development

This project explores AI-assisted development using custom agents and prompts:

### Custom AI Agents
Located in `.github/agents/`, specialized agents for different development phases:
- **Architecture Agent** - System design and architecture decisions
- **Coding Agent** - Implementation and code generation
- **Error Debugging Agent** - Bug fixing and error resolution
- **Review Agent** - Code review and quality assurance
- **Testing Agent** - Test strategy and implementation

### AI Prompts
Custom prompts in `.github/prompts/` for:
- Code generation workflows
- Commit message standardization
- Documentation updates
- Project-specific development patterns

### Experimental Tests
The `testing/` directory contains experimental AI model testing with Gemini.

---

## 📁 Project Structure

```
TFG-Fabian-Gonzalez-Lence/
├── .github/                    # GitHub configuration
│   ├── agents/                 # Custom AI agents (5 specialized agents)
│   ├── prompts/                # AI prompts for development
│   └── workflows/              # CI/CD workflows
│       ├── deploy.yml          # Deploy frontends to GitHub Pages
│       ├── ci.yml              # Continuous Integration
│       ├── playwright.yml      # E2E tests automation
│       └── deploy-supabase.yml # Supabase migrations deployment
├── projects/
│   ├── 1-TheHangmanGame/       # Project 1: Basic game
│   │   ├── src/                # MVC source code
│   │   ├── tests/              # Jest unit tests
│   │   └── docs/               # TypeDoc documentation
│   ├── 2-MusicWebPlayer/       # Project 2: Music player
│   │   ├── src/                # React components
│   │   ├── tests/              # Jest unit tests
│   │   └── docs/               # Architecture documentation
│   ├── 3-MiniBalatro/          # Project 3: Card game
│   │   ├── src/                # React components
│   │   ├── tests/              # Jest unit tests
│   │   └── docs/               # Architecture, specs, diagrams
│   ├── 4-CartographicProjectManager/  # Project 4: CARTO management
│   │   ├── backend/            # Express + Prisma + Supabase
│   │   ├── src/                # Vue 3 frontend
│   │   ├── tests/              # Jest + Playwright tests
│   │   └── docs/               # Deployment documentation
│   └── 5-TennisTournamentManager/     # Project 5: Tournament management
│       ├── backend/            # Express + TypeORM + Supabase
│       ├── src/                # Angular 19 frontend
│       ├── tests/              # Jest unit tests
│       ├── e2e/                # Playwright E2E tests
│       └── docs/               # Specs, architecture, diagrams
├── supabase/                   # Database migrations
│   ├── carto-backend/          # CARTO SQL migrations
│   └── tennis-backend/         # Tennis SQL migrations
├── docs/                       # Global documentation
│   ├── CARTO-SUPABASE-DEPLOYMENT.md
│   ├── SUPABASE-SETUP-COMPLETE.md
│   ├── SUPABASE-MIGRATION-GUIDE.md
│   ├── RENDER-MONOREPO.md
│   ├── MONOREPO-GITHUB-PAGES.md
│   └── SECURITY-INCIDENT.md
├── Memoria/                    # TFG report (LaTeX)
├── Presentación/               # Defense presentation (Beamer)
├── testing/                    # Experimental AI tests
│   └── Gemini/                 # Gemini model testing
├── LICENSE                     # MIT License (Supabase base)
├── Aptfile                     # Render system dependencies
├── package.json                # Monorepo configuration
├── render.yaml                 # Infrastructure as Code (Render)
└── README.md                   # This file
```

---

## 📚 Additional Documentation

### Project Specifications
- **Tennis:** [projects/5-TennisTournamentManager/docs/specification.md](projects/5-TennisTournamentManager/docs/specification.md)
  - Complete functional requirements
  - User stories
  - Detailed use cases
- **MiniBalatro:** [projects/3-MiniBalatro/docs/requirement-specification.md](projects/3-MiniBalatro/docs/requirement-specification.md)
  - Game mechanics specification
  - Feature requirements

### Diagrams
- **Tennis Class Diagram:** [projects/5-TennisTournamentManager/docs/class-diagram.mermaid](projects/5-TennisTournamentManager/docs/class-diagram.mermaid)
- **Tennis Use Cases:** [projects/5-TennisTournamentManager/docs/use-case-diagram.mermaid](projects/5-TennisTournamentManager/docs/use-case-diagram.mermaid)
- **MiniBalatro Class Diagram:** [projects/3-MiniBalatro/docs/diagrams/class-diagram.mermaid](projects/3-MiniBalatro/docs/diagrams/class-diagram.mermaid)
- **MiniBalatro Use Cases:** [projects/3-MiniBalatro/docs/diagrams/use-case-diagram.mermaid](projects/3-MiniBalatro/docs/diagrams/use-case-diagram.mermaid)

### Architecture
- **Tennis Architecture:** [projects/5-TennisTournamentManager/docs/ARCHITECTURE.md](projects/5-TennisTournamentManager/docs/ARCHITECTURE.md)
- **MusicWebPlayer Architecture:** [projects/2-MusicWebPlayer/docs/ARCHITECTURE.md](projects/2-MusicWebPlayer/docs/ARCHITECTURE.md)
- **MiniBalatro Architecture:** [projects/3-MiniBalatro/docs/ARCHITECTURE.md](projects/3-MiniBalatro/docs/ARCHITECTURE.md)

### Deployment Guides
- **Render Monorepo:** [docs/RENDER-MONOREPO.md](docs/RENDER-MONOREPO.md)
- **CARTO + Supabase:** [docs/CARTO-SUPABASE-DEPLOYMENT.md](docs/CARTO-SUPABASE-DEPLOYMENT.md)
- **GitHub Pages:** [docs/MONOREPO-GITHUB-PAGES.md](docs/MONOREPO-GITHUB-PAGES.md)
- **Supabase Migration Guide:** [docs/SUPABASE-MIGRATION-GUIDE.md](docs/SUPABASE-MIGRATION-GUIDE.md)

### Development Logs
- **MiniBalatro Development Log:** [projects/3-MiniBalatro/docs/DEVELOPMENT-LOG.md](projects/3-MiniBalatro/docs/DEVELOPMENT-LOG.md)
- **MiniBalatro Code Review:** [projects/3-MiniBalatro/docs/CODE_REVIEW_SUMMARY.md](projects/3-MiniBalatro/docs/CODE_REVIEW_SUMMARY.md)

### Changelogs
- **CARTO:** [projects/4-CartographicProjectManager/CHANGES.md](projects/4-CartographicProjectManager/CHANGES.md)
- **Tennis:** [projects/5-TennisTournamentManager/docs/CHANGES.md](projects/5-TennisTournamentManager/docs/CHANGES.md)

### Security
- **Security Incident Report:** [docs/SECURITY-INCIDENT.md](docs/SECURITY-INCIDENT.md)

---

## 🔑 Featured Highlights

### TheHangmanGame (Project 1)
- ✅ Modular MVC architecture
- ✅ Scoring system
- ✅ Responsive interface
- ✅ Testing with Jest
- ✅ Documentation with TypeDoc

### MusicWebPlayer (Project 2)
- ✅ Playlist management
- ✅ Advanced playback controls
- ✅ Modern React interface
- ✅ Complete unit testing

### MiniBalatro (Project 3)
- ✅ Deck-building mechanics
- ✅ Poker combo system
- ✅ Roguelike elements
- ✅ Interactive React interface

### CartographicProjectManager (Project 4)
- ✅ JWT authentication with 3 roles (Admin, Client, Special)
- ✅ Complete CRUD for cartographic projects
- ✅ Task system with status and priority
- ✅ **Real-time chat per project (Socket.IO)**
- ✅ Push notification system
- ✅ Dropbox integration for large files
- ✅ Complete action auditing
- ✅ Row Level Security in Supabase
- ✅ Unit + E2E testing (Playwright)
- ✅ Vue 3 frontend + Pinia

### TennisTournamentManager (Project 5)
- ✅ **Angular 19 frontend with RxJS**
- ✅ Multi-club management with isolation
- ✅ Automatic pairing system
- ✅ Real-time rankings and statistics
- ✅ **Multi-channel notifications** (Email, Telegram, Web Push)
- ✅ **Report generation** (PDF with jsPDF, Excel with ExcelJS)
- ✅ Order of Play with court management
- ✅ WebSockets for live updates
- ✅ Complete E2E testing (Playwright)
- ✅ Backend deployed on Render + Supabase

---

## 🧪 Testing

Each project includes complete test suites:

```bash
# Unit tests (Vitest/Jest)
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📊 Project Status

| Project | Status | Frontend | Backend | Database | Tests |
|----------|--------|----------|---------|----------|-------|
| 1-TheHangmanGame | ✅ Complete | GitHub Pages | - | - | ✅ |
| 2-MusicWebPlayer | ✅ Complete | GitHub Pages | - | - | ✅ |
| 3-MiniBalatro | ✅ Complete | GitHub Pages | - | - | ✅ |
| 4-CartographicProjectManager | ✅ Deployed | GitHub Pages | Render | Supabase | ✅ |
| 5-TennisTournamentManager | ✅ Deployed | GitHub Pages | Render | Supabase | ✅ |

---

## 🔧 Local Development

### Requirements
- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase CLI (for projects 4 and 5)

### Monorepo Setup

This project uses npm workspaces for monorepo management:

```bash
# Install all dependencies across all projects
npm install

# Workspaces configured in root package.json:
# - projects/1-TheHangmanGame
# - projects/2-MusicWebPlayer
# - projects/3-MiniBalatro
# - projects/4-CartographicProjectManager
```

### Setup CARTO (Project 4)

```bash
# 1. Clone and install
cd projects/4-CartographicProjectManager/backend
npm install

# 2. Configure .env
cp .env.example .env
# Edit .env with your credentials

# 3. Generate Prisma Client
npx prisma generate

# 4. Run in development
npm run dev
```

### Setup Tennis (Project 5)

```bash
# 1. Clone and install backend
cd projects/5-TennisTournamentManager/backend
npm install

# 2. Configure .env
cp .env.example .env
# Edit .env with your credentials

# 3. Run migrations
npm run db:migrate

# 4. Initial seed (optional)
npm run db:seed

# 5. Run in development
npm run dev

# Frontend (in another terminal)
cd ../
npm install
npm run dev
```

---

## 📝 License

This project is part of a Final Degree Project (TFG) academic work at the University of La Laguna.

**MIT License** - Based on Supabase open-source base (see [LICENSE](LICENSE) file)

**Academic Use** - This work is primarily for academic evaluation. Commercial use requires authorization.

---

## 🙏 Acknowledgments

- **University of La Laguna** - Infrastructure and resources
- **GitHub** - Free hosting (GitHub Pages)
- **Render** - Free backend hosting
- **Supabase** - Free Backend as a Service
- **Open Source Community** - Tools and libraries

---

## 📧 Contact

**Fabián González Lence**  
📧 Email: alu0101549491@ull.edu.es  
🔗 GitHub: [@alu0101549491](https://github.com/alu0101549491)  
🎓 University of La Laguna - Computer Engineering

---

## 🔗 Useful Links

- [GitHub Repository](https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence)
- [GitHub Pages (Projects)](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/)
- [Render Dashboard](https://dashboard.render.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [University of La Laguna](https://www.ull.es)

---

**Last update:** May 2026  
**Version:** 2.0.0 (Post-Supabase Migration)
