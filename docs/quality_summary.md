# TFG — ISO/IEC 25010 Code Quality Summary

**Date:** 2026-04-27
**Analyst:** GitHub Copilot Code Quality Agent
**Standard:** ISO/IEC 25010 (SQuaRE) + SonarQube rule alignment
**Scope:** All 5 TFG target applications

---

## Overview

| Application | Complexity | Functional | Performance | Reliability | Security | Maintainability | Overall | Report |
|---|---|---|---|---|---|---|---|---|
| HANGMAN | Basic | 🟢 | 🟢 | 🟡 | 🟢 | 🟢 | 🏆 GOOD | [→](../projects/1-TheHangmanGame/docs/HANGMAN_quality_report.md) |
| PLAYER | Intermediate | 🟡 | 🟢 | 🟡 | 🟡 | 🟡 | 🟡 NEEDS WORK | [→](../projects/2-MusicWebPlayer/docs/PLAYER_quality_report.md) |
| BALATRO | Int-Advanced | 🟢 | 🟢 | 🟡 | 🟢 | 🟡 | 🟡 NEEDS WORK | [→](../projects/3-MiniBalatro/docs/BALATRO_quality_report.md) |
| CARTO-PROJECT | High | 🟡 | 🟡 | 🟡 | 🔴 | 🟡 | 🔴 CRITICAL | [→](../projects/4-CartographicProjectManager/docs/CARTO-PROJECT_quality_report.md) |
| TENNIS | High | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🔴 CRITICAL | [→](../projects/5-TennisTournamentManager/docs/TENNIS_quality_report.md) |

---

## Cross-Project Incident Totals

| Application | 🔴 Blockers | 🟠 Critical | 🟡 Major | 🔵 Minor | Total |
|---|---|---|---|---|---|
| HANGMAN | 0 | 0 | 1 | 5 | 6 |
| PLAYER | 1 | 2 | 9 | 12 | 24 |
| BALATRO | 0 | 3 | 9 | 16 | 28 |
| CARTO-PROJECT | 5 | 6 | 13 | 6 | 30 |
| TENNIS | 0 | 5 | 12 | 8 | 25 |
| **Total** | **6** | **16** | **44** | **47** | **113** |

---

## Key Cross-Cutting Findings

- **Reliability — missing top-level error handlers is systemic.** None of the four React/Vue/Angular applications wrap their root component in an Error Boundary or equivalent (PLAYER-QA-001, BALATRO-QA-026, CARTO-PROJECT-QA-011, TENNIS-QA-009). The two Node backends both have `unhandledRejection` handlers that either log without context (TENNIS-QA-015) or shut down before logging (CARTO-PROJECT-QA-010). A repository-wide error-handling convention should be defined and adopted.
- **Security — token storage and refresh-token rotation are recurring weaknesses.** CARTO-PROJECT stores JWTs in `localStorage` without HttpOnly (CARTO-PROJECT-QA-014) and TENNIS lacks any refresh flow at all (TENNIS-QA-013). CARTO-PROJECT additionally lacks CSRF protection (CARTO-PROJECT-QA-015). This pattern indicates that the auth layer was prototyped early and never hardened. An Architecture Agent pass on the auth model is recommended for both backends.
- **Maintainability — `as any` / `catch (err: any)` and oversized files appear on every project from PLAYER upward.** Notable concentrations: BALATRO-QA-001/-002/-013, CARTO-PROJECT-QA-022, TENNIS-QA-006/-011/-022. The Google Style Guide configuration enforces `no-explicit-any` only as a warning across the monorepo; tightening to `error` would expose these systematically. Files exceeding 300 LOC also recur (PLAYER-QA-004, BALATRO-QA-004, CARTO-PROJECT-QA-024/-025/-026).
- **Testability — coverage is inversely correlated with project complexity.** HANGMAN ≈ 82 %, BALATRO ≈ 75 % (UI excluded), PLAYER ≈ 80 % (branches under target), CARTO-PROJECT ≈ 5 % (all skeleton TODOs), TENNIS ≈ selective (24 frontend tests across 28 services). The two HIGH-complexity full-stack apps — those most in need of tests — have the worst coverage.
- **Functional Completeness — TODO leakage is concentrated in TENNIS.** TENNIS carries ≥ 28 TODOs (result-confirmation × 6, phase-progression × 4, plus 5 missing injectables, payment, court-scheduler, ranking-calculator). CARTO-PROJECT also carries TODOs (backup compression, audit retry). The HANGMAN/PLAYER/BALATRO triplet is largely TODO-free.
- **Accessibility — gaps appear in every UI project.** Card selection without keyboard (BALATRO-QA-027/-028), commented skip-link (PLAYER-QA-016), placeholder-only inputs (CARTO-PROJECT-QA-008), missing `:key` on calendar cells (CARTO-PROJECT-QA-007), no keyboard mark-as-read (CARTO-PROJECT-QA-009). A WCAG 2.1 AA audit pass would benefit at least PLAYER, BALATRO, and CARTO-PROJECT.

---

## Complexity-Adjusted Quality Ranking

Adjusting overall quality for the complexity tier each application targets:

1. **HANGMAN (Basic, 🏆 GOOD)** — exceeds expectations for its tier; minimal technical debt and exemplary structure for a TFG starter.
2. **BALATRO (Int-Advanced, 🟡 NEEDS WORK)** — strong functional correctness in a complex domain (poker scoring, joker engine), but maintainability and persistence robustness are below tier expectations.
3. **PLAYER (Intermediate, 🟡 NEEDS WORK)** — meets functional expectations and shines in usability, but reliability gaps (no Error Boundary, IndexedDB error handling) keep it below the bar of a polished intermediate app.
4. **TENNIS (High, 🔴 CRITICAL)** — broadly feature-complete and architecturally sophisticated, but two BLOCKER-equivalent CRITICAL defects (admin role mismatch, result-confirmation TODOs) and 5 missing injectables make the application non-deployable in its current state.
5. **CARTO-PROJECT (High, 🔴 CRITICAL)** — most ambitious project of the five and arguably the closest to production architecturally, but the coincidence of 0 % unit-test coverage, plain-text token storage, missing CSRF, an unbounded Socket.IO presence map, and a faulty `unhandledRejection` handler places it last on a complexity-adjusted basis. With Phase 1 remediation it would jump to position 3.

---

## Recommended Priority Actions

Ordered by repository-wide impact. Each cites the originating incident and the agent best suited to act.

1. **CARTO-PROJECT-QA-014/015/018 — Auth hardening.** Move JWT to HttpOnly + SameSite cookies, add CSRF middleware, and implement refresh-token rotation. Owner: **Architecture Agent** (auth model) → **Coding Agent**.
2. **TENNIS-QA-001 — Admin role mismatch.** One-line fix in `admin.middleware.ts` to accept `SYSTEM_ADMIN`/`TOURNAMENT_ADMIN` from the `UserRole` enum; add unit test that drives every admin route. Owner: **Coding Agent** + **Testing Agent**.
3. **TENNIS-QA-002 + TENNIS-QA-004 + TENNIS-QA-005 — Complete the match workflow.** Implement the 6 result-confirmation TODOs, the consolation-draw / lucky-loser promotion, and the 5 missing injectables. Owner: **Architecture Agent** (interface definitions) → **Coding Agent**.
4. **CARTO-PROJECT-QA-023 — Stand up unit tests.** Replace skeleton TODOs with real unit + integration tests for domain entities, services, and critical composables; reach the configured 80 % Jest gate. Owner: **Testing Agent**.
5. **CARTO-PROJECT-QA-002 + CARTO-PROJECT-QA-010 — Fix reliability blockers in the backend.** Add TTL cleanup (or Redis) for the Socket.IO presence map; reorder logging in `unhandledRejection` so the stack is captured before `shutdown()`. Owner: **Coding Agent**.
6. **PLAYER-QA-001 + BALATRO-QA-026 + TENNIS-QA-009 — Repository-wide Error Boundary policy.** Define a shared "boundary or equivalent" pattern and apply it to all three UI apps. Owner: **Architecture Agent** → **Coding Agent**.
7. **TENNIS-QA-003 + CARTO-PROJECT-QA-001 — Eliminate N+1 queries.** Refactor tournament-deletion and project-summary endpoints to use eager-loaded query builders. Add performance regression tests. Owner: **Coding Agent** + **Testing Agent**.

---

## Scope and Limitations

- Analysis was strictly **read-only**. No source files were modified, created, or deleted.
- Confidence is **High** for HANGMAN, PLAYER, and TENNIS where source coverage was complete; **Medium** for BALATRO (78 source files) and CARTO-PROJECT (~165 files) where representative sampling was used.
- Cognitive/cyclomatic complexity numbers cited are **estimates**; running SonarQube against the repository will produce authoritative values.
- Per-project reports contain the full incident inventory, severity rationale, ISO/IEC 25010 sub-characteristic mapping, SonarQube rule references, and remediation hints.
