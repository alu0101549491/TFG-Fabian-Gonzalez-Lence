# CODIFICATION PLANNING PROMPT
# Tennis Tournament Manager (TENNIS)

## ROLE
You are a Coding Agent responsible for planning the full codification of the
Tennis Tournament Manager project before writing a single line of source code.
Your only deliverable in this step is the file:
  /projects/5-TennisTournamentManager/docs/code/CODIFICATION-PROGRESS.md

Do NOT write any source code yet.

---

## PROJECT CONTEXT
- **Project:** Tennis Tournament Manager (TENNIS)
- **Acronym:** TENNIS
- **Architecture:** Layered Architecture with Clean Architecture principles
  (Domain → Application → Infrastructure → Presentation)
- **Technology stack:** TypeScript, HTML, CSS, Vite, TypeDoc, ESLint (Google
  Style Guide), Jest, ts-jest, Angular, Socket.io-client, Axios
- **Output directory:** `/projects/5-TennisTournamentManager/`

---

## INPUT ARTIFACTS
1. **Requirements Specification** — provided in context (sections 1–27)
2. **UML Class Diagram** — provided in context (Mermaid classDiagram)
3. **UML Use Case Diagram** — provided in context (Mermaid graph TB)
4. **Project folder structure** — already scaffolded; read it before planning

---

## YOUR TASK
Analyse the full project structure, the class diagram, and the requirements
specification, then divide the entire codebase into **logical coding categories**.

### Rules for defining categories
- Every file that will ever exist in `src/`, `tests/`, `docs/`, and config root
  must belong to exactly one category.
- Categories must follow the layer order so the agent can code them in
  dependency order (no category should depend on a later one):
    1. Configuration & Tooling
    2. Styles
    3. Domain — Enumerations
    4. Domain — Entities
    5. Domain — Repository Interfaces
    6. Application — DTOs
    7. Application — Service Interfaces
    8. Application — Service Implementations
    9. Infrastructure — Repository Implementations
   10. Infrastructure — External Adapters
   11. Presentation — Angular Core (module, router, guards, interceptors)
   12. Presentation — Shared Components
   13. Presentation — Feature Modules (one sub-category per feature)
   14. Tests — Unit (domain + application)
   15. Tests — Integration
   16. Documentation
- You may add, split, or rename categories if the project structure requires it,
  but you must justify each deviation.
- The "Styles" category must exist and cover every `.css` file in the project.

---

## OUTPUT FORMAT
Create the file `CODIFICATION-PROGRESS.md` with the following exact structure:
```
# CODIFICATION PROGRESS
# Tennis Tournament Manager (TENNIS)

_Last updated: <ISO date>_
_Agent: <model name>_

---

## OVERVIEW

| # | Category | Status | Files | Done |
|---|----------|--------|-------|------|
| 1 | Configuration & Tooling | ⬜ Pending | N | 0/N |
| 2 | Styles | ⬜ Pending | N | 0/N |
| … | … | … | … | … |

Status legend: ⬜ Pending · 🔄 In Progress · ✅ Complete · ❌ Blocked

---

## CATEGORIES

### Category 1 — Configuration & Tooling
**Description:** <one sentence>
**Dependencies:** none
**Status:** ⬜ Pending

#### Checklist
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `vite.config.ts`
- [ ] `jest.config.js`
- [ ] `jest.setup.js`
- [ ] `eslint.config.mjs`
- [ ] `typedoc.json`
- [ ] `.gitignore`

#### File list
| File path | Class / Symbol | Notes |
|-----------|---------------|-------|
| `package.json` | — | npm scripts, dependencies |
| … | … | … |

---

### Category 2 — Styles
**Description:** All CSS files providing global and component-level styling.
**Dependencies:** none
**Status:** ⬜ Pending

#### Checklist
- [ ] `src/styles/global.css`
- [ ] `src/styles/variables.css`
- [ ] `src/styles/reset.css`
- [ ] … (one entry per .css file)

#### File list
| File path | Scope | Notes |
|-----------|-------|-------|
| … | … | … |

---

### Category N — <Name>
… (repeat for every category)

---

## GLOBAL FILE INDEX

> Complete alphabetical list of every file in the project.
> Updated after each category is completed.

| File path | Category # | Status |
|-----------|-----------|--------|
| `package.json` | 1 | ⬜ |
| `src/domain/enumerations/user-role.enum.ts` | 3 | ⬜ |
| … | … | … |
```

---

## COMPLETION CRITERIA
The planning step is complete when:
- Every file from the scaffold appears in the Global File Index
- Every category has a non-empty checklist
- No file appears in more than one category
- The Overview table totals match the Global File Index count
