# Analysis of AI Capabilities in Semi-Automatic Generation of Complex Applications

> **Análisis de Capacidades de la IA en la Generación Semiautomática de Aplicaciones Complejas**

<div align="center">

**Bachelor's Thesis (Trabajo de Fin de Grado)**  
**Degree in Computer Engineering · Universidad de La Laguna**  
**School of Engineering and Technology (ESIT)**

| | |
|---|---|
| **Author** | Fabián González Lence |
| **Supervisor** | Francisco de Sande González |
| **Contact** | alu0101549491@ull.edu.es |
| **Period** | September 2025 – May 2026 |
| **Report** | [memoria-TFG.pdf](Memoria/memoria-TFG-FabiánGonzález.tex) |

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?logo=github)](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/)
[![SonarCloud](https://img.shields.io/badge/Quality-SonarCloud-orange?logo=sonarcloud)](https://sonarcloud.io/organizations/tfg-fabian-gonzalez-lence)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey)](LICENSE)

</div>

---

## Abstract

The rapid advancement of large language models (LLMs) has opened new possibilities in AI-assisted software development. This Bachelor's Thesis analyses the capabilities of several generative AI models in supporting the different phases of the software development life cycle (SDLC) in a collaborative and semi-automatic manner.

An experimental methodology based on the classical phases of software engineering was designed and followed: **requirements specification, design, implementation, review, testing and deployment**. This methodology was applied to the development of **five web applications of increasing complexity**, each built almost entirely by AI models with differentiated roles — with human intervention limited to supervision, validation and prompt engineering.

The results allow assessment of the current maturity of LLMs in software engineering tasks, identification of their strengths and limitations in real development contexts, and conclusions about the potential of the **collaborative multi-agent approach** as an emerging paradigm in semi-automatic application generation.

**Keywords:** Artificial Intelligence, Generative AI, Large Language Models, Code Generation, Software Engineering, AI-Assisted Development, Software Quality, Multi-Agent Collaboration, Prompt Engineering.

---

## Research Overview

### Methodology

The development process follows a **four-phase SDLC-based workflow** replicated across all five projects, with a different AI model assigned as the primary responsible agent in each phase:

| Phase | Role | Artefacts produced |
|-------|------|--------------------|
| **Phase 0 — Specification & Design** | Human + Claude | Requirements spec (informal, semi-formal, EARS/user stories), UML class diagrams, use-case diagrams (Mermaid) |
| **Phase 1 — Architecture** | Claude (Architect) | Directory tree, class skeletons with documented signatures, initial configuration files |
| **Phase 2 — Coding** | Mistral (P1–P3) · GitHub Copilot agent (P4–P5) | Full source code following Google TypeScript Style Guide and SOLID principles |
| **Phase 3 — Code Review** | GitHub Copilot agent (all projects) | Weighted review report (adherence 30 %, quality 25 %, requirements 25 %, maintainability 10 %, best practices 10 %) with ternary verdict: APPROVED / APPROVED WITH RESERVATIONS / REJECTED |
| **Phase 4 — Testing** | Qwen (P1–P3) · GitHub Copilot agent (P4–P5) | Jest unit test suites (AAA pattern) for P1–P3; Playwright E2E test suites for P4–P5 |

The key methodological finding is that the transition from conversational chatbots to **IDE-integrated custom agents** (GitHub Copilot agent mode) — triggered by the scalability limits observed in BALATRO — was the most impactful design decision: direct filesystem access eliminated inter-module incoherence that plagued the earlier chat-based approach.

### Quality Evaluation Framework

Code quality was measured against two complementary tools:

- **SonarQube Cloud** — static analysis (bugs, vulnerabilities, code smells, cyclomatic complexity, duplication, coverage in LCOV format)
- **Custom Code Quality Agent** — ISO/IEC 25010 (SQuaRE) multi-dimensional assessment generated via meta-prompting with Claude Opus 4.7

---

## Experimental Design: Five Projects of Increasing Complexity

The five projects form a deliberate **complexity progression** — architectural, technological and at scale — ordered chronologically. Each project served as the learning context for refining prompt templates before tackling the next level.

> **Live demos:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/)

---

### P1 — TheHangmanGame (HANGMAN) 🎮

**Demo:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/1-TheHangmanGame/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/1-TheHangmanGame/)

| Metric | Value |
|--------|-------|
| **Architecture** | MVC + Composite + Observer |
| **Stack** | TypeScript · Vite · Jest |
| **Scale** | 11 files · 9 classes · ~1,600 lines |
| **Test coverage** | 95.8% (9 suites, ~460 tests) |
| **SonarQube** | Bugs: 0 · Vulns: 0 · Code Smells: 20 · Quality Gate: **PASSED** |
| **SonarCloud** | [View project](https://sonarcloud.io/project/overview?id=tfg-fabian-gonzalez-lence_1-TheHangmanGame) |

**Research significance:** Baseline project validating the single-shot prompt strategy. Demonstrates that clear, structured prompts achieve near-complete requirement coverage for small-scope applications. The MVC scaffolding produced by Claude and then implemented by Mistral required minimal human correction.

---

### P2 — MusicWebPlayer (PLAYER) 🎵

**Demo:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/2-MusicWebPlayer/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/2-MusicWebPlayer/)

| Metric | Value |
|--------|-------|
| **Architecture** | Component-based + Custom Hooks |
| **Stack** | TypeScript · React 18 · Vite · Jest |
| **Scale** | 25 files · 24 classes · ~3,000 lines |
| **Test coverage** | 83.3% (21 suites, ~900 tests) |
| **SonarQube** | Bugs: 0 · Vulns: 0 · Code Smells: 81 · Quality Gate: **PASSED** |
| **SonarCloud** | [View project](https://sonarcloud.io/project/overview?id=tfg-fabian-gonzalez-lence_2-MusicWebPlayer) |

**Research significance:** Introduces React 18 and the custom-hooks paradigm. The increase in code smells (81) compared to HANGMAN illustrates how AI models produce progressively noisier code as complexity grows, even without changing the prompt strategy.

---

### P3 — MiniBalatro (BALATRO) 🃏

**Demo:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/3-MiniBalatro/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/3-MiniBalatro/)

| Metric | Value |
|--------|-------|
| **Architecture** | MVC + Service layer + Observer |
| **Stack** | TypeScript · React 18 · Vite · Jest |
| **Scale** | 97 files · 71 classes · ~9,000 lines |
| **Test coverage** | 72.0% (15 suites, ~1,400 tests) |
| **SonarQube** | Bugs: 4 · Vulns: 2 · Code Smells: 91 · Quality Gate: **PASSED** |
| **SonarCloud** | [View project](https://sonarcloud.io/project/overview?id=tfg-fabian-gonzalez-lence_3-MiniBalatro) |

**Research significance:** Critical inflection point of the experiment. The scale of this project (6× larger than PLAYER) exposed the fundamental limitation of conversational chatbots: inability to maintain coherence across modules when each chat turn lacks prior file context. This observation drove the transition to IDE-integrated agents in P4.

---

### P4 — CartographicProjectManager (CARTO) 🗺️

**Frontend:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/4-CartographicProjectManager/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/4-CartographicProjectManager/)  
**Backend:** [https://carto-backend-gl8l.onrender.com](https://carto-backend-gl8l.onrender.com)

| Metric | Value |
|--------|-------|
| **Architecture** | Clean Architecture (Presentation · Application · Domain · Infrastructure) |
| **Stack** | TypeScript · Vue 3 · Pinia · Vue Router · Express.js · Prisma · PostgreSQL · Socket.IO |
| **Scale** | ~240 files · ~130 classes · ~16,000 lines |
| **Testing** | Playwright E2E (20 test suites, ~400 tests) |
| **SonarQube** | Bugs: 7 · Vulns: 8 · Code Smells: 440 · Quality Gate: **PASSED** |
| **SonarCloud** | [View project](https://sonarcloud.io/project/overview?id=tfg-fabian-gonzalez-lence_4-CartographicProjectManager) |

**Key features:** JWT multi-role authentication (Admin / Client / Special), project & task CRUD, real-time chat per project (Socket.IO), push notifications, Dropbox file integration, full action auditing, Row Level Security (Supabase).

**Research significance:** First full-stack project with GitHub Copilot agent mode as primary developer. The "plan-first" prompt strategy (V2) was developed here — delivering the full architecture plan before writing any code — halving coherence errors compared to BALATRO. The quality degradation vs. P1–P3 is directly correlated with scale.

---

### P5 — TennisTournamentManager (TENNIS) 🎾

**Frontend:** [https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/5-TennisTournamentManager/](https://alu0101549491.github.io/TFG-Fabian-Gonzalez-Lence/5-TennisTournamentManager/)  
**Backend:** [https://tennis-backend-ltkr.onrender.com](https://tennis-backend-ltkr.onrender.com)

| Metric | Value |
|--------|-------|
| **Architecture** | Clean Architecture (Presentation · Application · Domain · Infrastructure) |
| **Stack** | TypeScript · Angular 19 · RxJS · Express.js · TypeORM · PostgreSQL · WebSockets |
| **Scale** | ~390 files · ~280 classes · ~28,000 lines |
| **Testing** | Playwright E2E (57 test suites, ~870 tests) |
| **SonarQube** | Bugs: 61 · Vulns: 0 · Code Smells: 561 · Quality Gate: **FAILED** |
| **SonarCloud** | [View project](https://sonarcloud.io/project/overview?id=tfg-fabian-gonzalez-lence_5-TennisTournamentManager) |

**Key features:** Multi-club tenancy with data isolation, automatic pairing algorithms, real-time rankings & statistics (WebSockets), multi-channel notifications (email, Telegram, Web Push), PDF & Excel report generation, Order of Play with court management.

**Research significance:** Largest project (~28 k LOC); the first to produce a FAILED quality gate. Angular's intrinsic verbosity and the accumulated complexity of 280 classes exceeded the prompt-design capabilities explored in this thesis. The 61 bugs — all related to async patterns — represent the current hard limit of the AI-assisted approach without human code intervention.

---

## AI Models & Agents

### Models Assessed

| Model | Version | Primary Role |
|-------|---------|--------------|
| **Claude** | Sonnet 4.5 / 4.6 | Architect (all projects); Developer + Tester + Reviewer (P4–P5 via Copilot agent) |
| **Mistral** | Large 2411 | Developer (P1–P3) |
| **Qwen** | Plus (2.5) | Tester (P1–P3) |
| **GitHub Copilot** | GPT-4o / Claude Sonnet | Reviewer (all projects); orchestrating agent for P4–P5 |
| **ChatGPT** | o4-mini | Requirements consultation (P1–P3) |
| **Gemini** | 2.5 Pro | Exploratory testing (isolated experiments in `testing/Gemini/`) |
| **Perplexity** | Sonar Pro | Technology selection research |

### Custom Agents (`.github/agents/`)

Seven specialized VS Code Copilot agents were developed as part of the methodology:

| Agent | Purpose |
|-------|---------|
| `Architecture.agent.md` | Generates scaffolding, class hierarchies and API contracts |
| `Coding.agent.md` | Implements source code following the defined architecture |
| `Review.agent.md` | Weighted code review against the 5-criteria rubric |
| `Testing.agent.md` | Generates Jest / Playwright test suites (AAA pattern) |
| `Quality.agent.md` | ISO/IEC 25010 assessment via SonarQube reports |
| `Errors.agent.md` | Diagnoses and resolves build / runtime errors |
| `MemoryWriterHelper.agent.md` | Documents progress and decisions to the thesis |

---

## Quality Results Summary

### SonarQube Static Analysis

| Project | Bugs | Vulns | Code Smells | Coverage | Quality Gate |
|---------|------|-------|-------------|----------|:---:|
| HANGMAN | 0 | 0 | 20 | 95.8% | ✅ PASSED |
| PLAYER | 0 | 0 | 81 | 83.3% | ✅ PASSED |
| BALATRO | 4 | 2 | 91 | 72.0% | ✅ PASSED |
| CARTO | 7 | 8 | 440 | — | ✅ PASSED |
| TENNIS | 61 | 0 | 561 | — | ❌ FAILED |

### SonarQube Quality Ratings (ISO/IEC 25010 dimensions)

| Project | Reliability | Security | Maintainability |
|---------|:-----------:|:--------:|:---------------:|
| HANGMAN | A | A | A |
| PLAYER | A | A | A |
| BALATRO | B | B | A |
| CARTO | C | C | A |
| TENNIS | E | A | A |

**Key finding:** Maintainability rating A was achieved across all five projects — demonstrating that the AI-generated code is structurally consistent and follows naming/decomposition conventions regardless of scale. Reliability degrades monotonically with complexity, confirming that async patterns and inter-module dependencies represent the current boundary of the approach.

---

## Key Conclusions

1. **Role differentiation is the most impactful design decision.** Assigning distinct AI models to Architecture, Coding, Review and Testing phases produced better separation of concerns than using a single general-purpose model throughout.

2. **IDE-integrated agents outperform conversational chatbots at scale.** The shift to GitHub Copilot agent mode (P4 onwards) resolved the context-coherence problems that caused cascading errors in BALATRO.

3. **The human engineer's role shifts from code author to orchestrator.** The primary skill required is translating functional requirements into effective prompts, validating AI output, and coordinating inter-model handoffs — not writing production code.

4. **Claude (Sonnet 4.5 / 4.6) provides the strongest context coherence** across long development sessions, making it the most suitable model for the Architect role.

5. **AI does not replace software engineers.** It amplifies what a trained engineer can produce — but the quality ceiling is still set by the engineer's ability to frame problems, evaluate output and maintain architectural vision.

---

## Repository Structure

```
TFG-Fabian-Gonzalez-Lence/
├── .github/
│   ├── agents/                 # 7 custom VS Code Copilot agents
│   ├── prompts/                # Prompt templates per development phase
│   └── workflows/              # CI/CD: deploy.yml · ci.yml · playwright.yml · deploy-supabase.yml
├── Memoria/                    # LaTeX source for the full thesis report
│   ├── memoria-TFG-FabiánGonzález.tex
│   └── capitulos/              # Individual chapter files (Cap1–Cap10)
├── Presentación/               # Beamer source for the defence presentation
├── projects/
│   ├── 1-TheHangmanGame/       # P1 — TypeScript · MVC · Jest
│   ├── 2-MusicWebPlayer/       # P2 — React 18 · Jest
│   ├── 3-MiniBalatro/          # P3 — React 18 · Jest
│   ├── 4-CartographicProjectManager/  # P4 — Vue 3 · Node.js · Socket.IO · Playwright
│   └── 5-TennisTournamentManager/     # P5 — Angular 19 · Node.js · WebSockets · Playwright
├── resources/
│   ├── prompts/                # Raw prompt library used throughout the experiment
│   ├── answers/                # Saved AI responses used as artefacts
│   ├── requirement-specifications/
│   ├── uml-class-diagrams/
│   ├── uml-use-case-diagrams/
│   └── templates/              # Reusable prompt and document templates
├── supabase/
│   ├── carto-backend/          # SQL migrations for CARTO
│   └── tennis-backend/         # SQL migrations for TENNIS
├── docs/                       # Deployment & operational guides
├── testing/                    # Exploratory Gemini experiments
├── render.yaml                 # Infrastructure as Code (Render.com)
├── package.json                # npm workspaces monorepo root
└── README.md
```

---

## Getting Started

### Requirements

- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- Supabase CLI (for projects 4 and 5)

### Install & run any project (P1–P3)

```bash
git clone https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence.git
cd TFG-Fabian-Gonzalez-Lence
npm install                          # installs workspaces for P1–P4

cd projects/1-TheHangmanGame
npm run dev                          # Vite dev server
npm test                             # Jest unit tests
npm run test:coverage                # coverage report
```

### Run unit tests across all projects

```bash
# From repo root — runs Jest for P1, P2, P3
npm run test --workspaces --if-present
```

### Run E2E tests (P4/P5 — requires running backend)

```bash
cd projects/4-CartographicProjectManager
npx playwright test
```

---

## Deployment Architecture

| Layer | Technology | Projects |
|-------|-----------|---------|
| **Frontend** | GitHub Pages (via `deploy.yml`) | P1–P5 |
| **Backend API** | Render.com (free tier, `render.yaml`) | P4, P5 |
| **Database** | Supabase PostgreSQL (session pooler + RLS) | P4, P5 |

Backend base URLs:
- CARTO: `https://carto-backend-gl8l.onrender.com`
- TENNIS: `https://tennis-backend-ltkr.onrender.com`

Deployment guides: [docs/RENDER-MONOREPO.md](docs/RENDER-MONOREPO.md) · [docs/CARTO-SUPABASE-DEPLOYMENT.md](docs/CARTO-SUPABASE-DEPLOYMENT.md) · [docs/MONOREPO-GITHUB-PAGES.md](docs/MONOREPO-GITHUB-PAGES.md)

---

## Documentation & Resources

| Resource | Link |
|---------|------|
| Thesis (LaTeX) | [Memoria/](Memoria/) |
| Architecture docs | [projects/*/docs/ARCHITECTURE.md](projects/) |
| Requirement specs | [resources/requirement-specifications/](resources/requirement-specifications/) |
| Prompt library | [resources/prompts/](resources/prompts/) |
| UML diagrams | [resources/uml-class-diagrams/](resources/uml-class-diagrams/) · [resources/uml-use-case-diagrams/](resources/uml-use-case-diagrams/) |
| Quality summary | [docs/quality_summary.md](docs/quality_summary.md) |
| Supabase migration guide | [docs/SUPABASE-MIGRATION-GUIDE.md](docs/SUPABASE-MIGRATION-GUIDE.md) |

---

## Funding & Acknowledgments

This work was supported by the Spanish **Ministerio de Ciencia e Innovación**, project **PID2023-151073NB-I00** ("Técnicas de Computación de Alto Rendimiento para Aplicaciones Científicas y de Ingeniería").

Thanks to the **Universidad de La Laguna** for academic infrastructure; to **GitHub**, **Render** and **Supabase** for free-tier hosting; and to the open-source communities behind all frameworks and tools used.

---

## License

© 2026 Fabián González Lence

The **thesis document** (Memoria/) and **presentation** (Presentación/) are released under [Creative Commons Attribution–NonCommercial–ShareAlike 4.0 Internacional (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

The **source code** of the five projects is released for academic reproducibility — see the [LICENSE](LICENSE) file for the full terms.

---

## Contact

**Fabián González Lence**  
alu0101549491@ull.edu.es · [@alu0101549491](https://github.com/alu0101549491)  
Universidad de La Laguna — Grado en Ingeniería Informática
