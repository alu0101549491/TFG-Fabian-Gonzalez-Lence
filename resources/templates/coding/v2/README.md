# Coding Prompts — V2

## Description

> ⚠️ **Important note:** This directory **does not contain generic reusable templates**. It contains the **real prompts** used during the development of project **5 — Tennis Tournament Manager (TENNIS)**, specifically adapted to that project's context.

In the V2 workflow, the **AI Developer** is **GitHub Copilot with Claude Sonnet 4.5**, working directly inside the VS Code coding agent with full codebase access.

## Contents

| File | Description |
|---|---|
| `planning-codification-template.md` | **Pre-coding planning** prompt. The agent generates the `CODIFICATION-PROGRESS.md` file with the full category plan, dependency order and global file index. No source code is written in this step. |
| `general-codification-template.md` | Main **iterative implementation** prompt. The agent walks through the plan categories in order, writes the full source code for each file, updates progress in `CODIFICATION-PROGRESS.md` and records changes in `CHANGES.md`. |

## Origin of the prompts

Unlike V1 projects (which used fillable generic templates), in V2 prompts evolved into more contextualised conversations. The TENNIS prompts were built on the experience from the **CARTO** project (4 — Cartographic Project Manager), adapting the approach to the tennis tournament domain and the Angular + TypeScript architecture.

## Projects where it was applied

| Project | AI Developer | Notes |
|---|---|---|
| 5 — Tennis Tournament Manager | GitHub Copilot (Claude Sonnet 4.5) | Real prompts stored here |

> **CARTO (project 4)** also used V2 prompts, but its coding prompts were not stored in this directory as it was the first V2 project where the workflow was being explored.
