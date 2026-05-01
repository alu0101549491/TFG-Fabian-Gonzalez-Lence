# Testing Templates

## Description

This directory contains the prompts used during the **testing phase** of the coding process, corresponding to the **"AI Tester"** role in the Coding Guide.

## Structure

```
testing/
├── v1/    → Generic unit testing template with Jest/TSJest (V1 projects)
└── v2/    → Real E2E testing prompts with Playwright (V2 projects — CARTO)
```

## Application summary by project

| Project | Prompt version | AI Tester |
|---|---|---|
| 1 — The Hangman Game | V1 (template) | Qwen AI |
| 2 — Music Web Player | V1 (template) | Qwen AI |
| 3 — MiniBalatro | V1 (template) | Qwen AI |
| 4 — Cartographic Project Manager | V2 (real prompts in `v2/`) | GitHub Copilot (GPT-5.4) |
| 5 — Tennis Tournament Manager | V2 (based on CARTO prompts) | GitHub Copilot (GPT-5.4) |
