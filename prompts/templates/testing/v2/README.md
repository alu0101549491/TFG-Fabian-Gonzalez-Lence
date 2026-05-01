# E2E Testing Prompts — V2

## Description

> ⚠️ **Important note:** This directory **does not contain generic reusable templates**. It contains the **real prompts** used during the testing phase of project **4 — Cartographic Project Manager (CARTO)**, designed as a 2-phase E2E testing workflow with **Playwright**.

The prompts are operational and directly adapted to CARTO's context (TypeScript 5.x, Vue.js 3, Pinia, Vue Router, Socket.io, Axios, JWT authentication, ADMINISTRATOR/CLIENT/SPECIAL_USER roles).

## Contents

| File | Phase | Description |
|---|---|---|
| `test-scenario-template.md` | Phase 1 | The agent analyses CARTO's use case diagrams and codebase to generate the `E2E_TEST_SCENARIOS.md` document with all test scenarios (AUTH, PROJ, TASK, MSG, FILE, NOTIF, CAL, BACK…), including preconditions, detailed steps, expected results and a priority matrix. |
| `test-implementation-template.md` | Phase 2 | Following the scenario document from Phase 1, the agent generates the full **Playwright test files**: configuration, Page Object Models, authentication fixtures, helpers, test data and tests organised by priority (critical/high/medium/low). |

## Projects where it was applied

| Project | AI Tester | Notes |
|---|---|---|
| 4 — Cartographic Project Manager | GitHub Copilot (GPT-5.4) | Original prompts stored here |
| 5 — Tennis Tournament Manager | GitHub Copilot (GPT-5.4) | The AI agent used these prompts as a base to generate TENNIS-specific test scenarios and implementations; no separate prompt set was created |
