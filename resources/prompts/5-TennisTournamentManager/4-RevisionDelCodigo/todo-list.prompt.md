# TASK: CODE REVIEW PLANNING — TENNIS Tournament Manager

You are a senior software engineer performing a structured code review of the **TENNIS Tournament Manager** project.

## Objective
Before reviewing any code, create a **TODO List plan** that classifies ALL files in the codebase into logical review groups. Do NOT skip any file.

## Instructions
1. Explore the entire project file tree recursively (every directory and file).
2. Classify every file into one of the following groups (adapt if needed based on actual structure):

   - **G1 – Configuration & Tooling**: package.json, tsconfig.json, vite.config.ts, eslint.config.mjs, jest.config.js, jest.setup.js, typedoc.json, .gitignore, .eslintignore, index.html
   - **G2 – Domain Layer**: All files under `src/domain/` (entities, value objects, enums, repository interfaces)
   - **G3 – Application Layer**: All files under `src/application/` (service interfaces, service implementations, DTOs)
   - **G4 – Infrastructure Layer**: All files under `src/infrastructure/` (repository implementations, external services, persistence, websocket)
   - **G5 – Presentation: Components**: All `.vue` or `.tsx` component files under `src/presentation/components/`
   - **G6 – Presentation: Views, Stores & Router**: All view files, Pinia stores, composables, and router configuration
   - **G7 – Tests**: All files under `tests/` or `__tests__/`
   - **G8 – Documentation & Deployment**: README.md, ARCHITECTURE.md, docs/, deployment files

3. For each group, list the exact file paths it contains.
4. Add this plan to your **TODO List** with each group as a separate task, marked as pending.
5. Do NOT begin reviewing yet — only plan.

## Output Format
Present the TODO List in this format:

TODO LIST — TENNIS Code Review Plan
- [ ] G1 – Configuration & Tooling → [list of files]
- [ ] G2 – Domain Layer → [list of files]
- [ ] G3 – Application Layer → [list of files]
- [ ] G4 – Infrastructure Layer → [list of files]
- [ ] G5 – Presentation: Components → [list of files]
- [ ] G6 – Presentation: Views, Stores & Router → [list of files]
- [ ] G7 – Tests → [list of files]
- [ ] G8 – Documentation & Deployment → [list of files]

Confirm when the TODO List is ready and wait for the next instruction.
