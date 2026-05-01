# Code Review Prompts — V2

## Description

> ⚠️ **Important note:** This directory **does not contain generic reusable templates**. It contains the **real prompts** used during the code review process of project **4 — Cartographic Project Manager (CARTO)**, designed as a structured 3-phase review workflow.

These prompts were developed for the **"AI Reviewer 2.0"** and are specifically tailored to CARTO's architecture and tech stack (TypeScript 5.x, Vue.js 3, Pinia, Vue Router, Socket.io, Axios). They are not empty generic templates but fully operational prompts that can be executed as-is.

## Contents

| File | Phase | Description |
|---|---|---|
| `todo-list-review-template.md` | Phase 1 | The AI agent analyses the entire CARTO codebase and generates a **TODO List** organising all files into logical review groups by layer and module, with estimated priority and complexity. |
| `report-review-template.md` | Phase 2 | Following the TODO List from Phase 1, the agent systematically reviews each group and generates an **Incident Report** with all issues found, classified by severity (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low). |
| `incident-fix-review-template.md` | Phase 3 | The agent analyses the Phase 2 report and applies **all fixes** in order (critical → high → medium → low), verifying each fix and generating a final resolution report. |

## Projects where it was applied

| Project | AI Reviewer | Notes |
|---|---|---|
| 4 — Cartographic Project Manager | GitHub Copilot (GPT-5.4) | Real prompts stored here |
| 5 — Tennis Tournament Manager | GitHub Copilot (GPT-5.4) | Same prompts adapted to the TENNIS context |

> For TENNIS these same prompts were reused with the necessary adaptations (project name, specific stack, architecture description), so no separate `v3/` directory was created.
